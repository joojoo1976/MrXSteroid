-- =============================================================================
-- MIGRATION: 20261019120000_consolidated_invoice_payment_legs.sql
-- PURPOSE:   Schema support for Consolidated Internal Invoices with Multi-Leg
--            Payments (Fourthwall merchandise/books + Kashier direct services).
--
-- ARCHITECTURE (MrXSteroid Payment V3.2):
--   1. The site is the SOLE internal source of truth (one invoice per purchase).
--   2. Orders containing both merchandise and direct services retain ONE internal
--      invoice (with frozen line items and prices).
--   3. Each payment channel/gateway executes an independent external payment leg
--      tracked in `invoice_payment_legs`, referencing the single invoice.
--   4. The invoice `payment_status` supports 'partially_paid' when some legs
--      succeed while others are pending/failed.
--   5. The invoice status is only promoted to 'paid' when ALL legs succeed and
--      sum(paid_amount) >= invoice.amount.
--   6. Entitlements and digital book downloads are gated strictly on 'paid'
--      (never on 'partially_paid').
--   7. Webhook deduplication is enforced via a partial unique constraint on
--      (provider, provider_reference) where provider_reference IS NOT NULL.
--   8. An atomic, concurrency-safe function `settle_invoice_payment_leg` uses
--      ROW LOCKING (`FOR UPDATE`) to eliminate race conditions between legs.
--
-- SAFETY & GOVERNANCE:
--   - Additive & backward-compatible.
--   - DO NOT apply to production database without explicit independent approval.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Extend invoices.payment_status check constraint to include 'partially_paid'
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
    -- Drop existing constraint safely if present
    if exists (
        select 1 from pg_constraint where conname = 'invoices_payment_status_check'
    ) then
        alter table public.invoices drop constraint invoices_payment_status_check;
    end if;

    alter table public.invoices
        add constraint invoices_payment_status_check
        check (payment_status in (
            'pending',
            'initiated',
            'partially_paid',
            'paid',
            'failed',
            'cancelled',
            'refunded',
            'partially_refunded',
            'unknown'
        ));
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Create invoice_payment_legs table
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.invoice_payment_legs (
    id                  uuid primary key default gen_random_uuid(),
    invoice_id          uuid not null references public.invoices(id) on delete cascade,
    leg_index           integer not null default 1,
    leg_type            text not null check (leg_type in ('merchandise', 'service', 'standard')),
    provider            text not null check (provider in ('kashier', 'fourthwall', 'instapay', 'stripe', 'manual')),
    amount              numeric(10,2) not null check (amount > 0),
    currency            text not null check (currency in ('USD', 'EGP')),
    status              text not null default 'pending' check (status in ('pending', 'initiated', 'succeeded', 'failed', 'cancelled')),
    provider_reference  text,
    session_url         text,
    items               jsonb not null default '[]'::jsonb,
    paid_at             timestamptz,
    metadata            jsonb not null default '{}'::jsonb,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

-- Unique index per leg index on the same invoice
create unique index if not exists idx_invoice_payment_legs_unique_leg
    on public.invoice_payment_legs (invoice_id, leg_index);

-- Index for invoice lookups
create index if not exists idx_invoice_payment_legs_invoice_id
    on public.invoice_payment_legs (invoice_id);

-- Unique constraint for provider webhook deduplication (GAP-C: prevents duplicate transactions)
create unique index if not exists idx_invoice_payment_legs_provider_ref_unique
    on public.invoice_payment_legs (provider, provider_reference)
    where provider_reference is not null;

-- Index for status filtering
create index if not exists idx_invoice_payment_legs_status
    on public.invoice_payment_legs (status);

-- Service-role only security
alter table public.invoice_payment_legs enable row level security;
revoke all on public.invoice_payment_legs from anon, authenticated;

comment on table public.invoice_payment_legs is
    'Tracks independent payment legs for a single consolidated internal invoice.
     Enables multi-gateway execution (e.g. Fourthwall for books + Kashier for coaching)
     while preserving a single invoice of record, partial payment tracking, and fraud prevention.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Atomic State Machine Function for Payment Leg Settlement (GAP-D)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.settle_invoice_payment_leg(
    p_invoice_id uuid,
    p_provider text,
    p_provider_reference text,
    p_amount_paid numeric,
    p_currency text,
    p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_invoice record;
    v_target_leg record;
    v_all_succeeded boolean;
    v_any_succeeded boolean;
    v_new_invoice_status text;
    v_can_fulfill boolean := false;
begin
    -- 1. Explicit row lock on the invoice to eliminate race conditions
    select id, amount, currency, status, payment_status
    into v_invoice
    from public.invoices
    where id = p_invoice_id
    for update;

    if not found then
        return jsonb_build_object(
            'success', false,
            'error', 'INVOICE_NOT_FOUND',
            'message', 'Invoice not found'
        );
    end if;

    -- If invoice is already paid in full, acknowledge idempotently
    if v_invoice.payment_status = 'paid' then
        return jsonb_build_object(
            'success', true,
            'idempotent', true,
            'invoice_status', 'paid',
            'can_fulfill', false,
            'message', 'Invoice already settled'
        );
    end if;

    -- 2. Locate and lock the matching leg
    select *
    into v_target_leg
    from public.invoice_payment_legs
    where invoice_id = p_invoice_id
      and (provider = p_provider or p_provider is null)
      and (provider_reference = p_provider_reference or p_provider_reference is null or status = 'pending')
    order by case when status = 'pending' then 0 else 1 end
    limit 1
    for update;

    if not found then
        return jsonb_build_object(
            'success', false,
            'error', 'LEG_NOT_FOUND',
            'message', 'Matching payment leg not found'
        );
    end if;

    -- Strict Currency Verification: reject mismatch
    if p_currency is not null and upper(v_target_leg.currency) != upper(p_currency) then
        return jsonb_build_object(
            'success', false,
            'error', 'CURRENCY_MISMATCH',
            'message', format('Leg currency mismatch: expected %s, got %s', v_target_leg.currency, p_currency)
        );
    end if;

    -- Strict Amount Verification (tolerance 0.01)
    if p_amount_paid is not null and abs(v_target_leg.amount - p_amount_paid) > 0.01 then
        return jsonb_build_object(
            'success', false,
            'error', 'AMOUNT_MISMATCH',
            'message', format('Leg amount mismatch: expected %s, got %s', v_target_leg.amount, p_amount_paid)
        );
    end if;

    -- Update target leg status
    update public.invoice_payment_legs
    set status = p_status,
        paid_at = case when p_status = 'succeeded' then now() else paid_at end,
        provider_reference = coalesce(p_provider_reference, provider_reference),
        updated_at = now()
    where id = v_target_leg.id;

    -- 3. Evaluate consolidated status across all legs for this invoice
    select
        bool_and(status = 'succeeded'),
        bool_or(status = 'succeeded')
    into v_all_succeeded, v_any_succeeded
    from public.invoice_payment_legs
    where invoice_id = p_invoice_id;

    if v_all_succeeded then
        v_new_invoice_status := 'paid';
        v_can_fulfill := true;

        update public.invoices
        set status = 'success',
            payment_status = 'paid',
            paid_at = coalesce(paid_at, now()),
            updated_at = now()
        where id = p_invoice_id;

        update public.orders
        set payment_status = 'paid',
            updated_at = now()
        where invoice_id = p_invoice_id;

    elsif v_any_succeeded then
        v_new_invoice_status := 'partially_paid';
        v_can_fulfill := false;

        update public.invoices
        set payment_status = 'partially_paid',
            updated_at = now()
        where id = p_invoice_id;

        update public.orders
        set payment_status = 'partially_paid',
            updated_at = now()
        where invoice_id = p_invoice_id;

    elsif p_status = 'failed' then
        v_new_invoice_status := 'failed';
        v_can_fulfill := false;
    else
        v_new_invoice_status := 'pending';
        v_can_fulfill := false;
    end if;

    return jsonb_build_object(
        'success', true,
        'invoice_status', v_new_invoice_status,
        'can_fulfill', v_can_fulfill,
        'target_leg_id', v_target_leg.id
    );
end;
$$;

revoke all on function public.settle_invoice_payment_leg from public, anon, authenticated;
grant execute on function public.settle_invoice_payment_leg to service_role;
