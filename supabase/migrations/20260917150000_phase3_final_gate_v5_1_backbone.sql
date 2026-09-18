-- ==============================================================================
-- MIGRATION: 20260917150000_phase3_final_gate_v5_1_backbone.sql
-- PURPOSE: Final Gate v5.1 Phase 3 close-out - forward migration based on the
--          v5.1 architecture (owner audit instruction #8), NOT a blind replay
--          of the legacy v4 migrations.
--
--          Contents:
--          1. Financial backbone required by shipping code but absent from prod:
--             beneficiaries, split_rules, payouts, order_splits,
--             payment_intents, refunds, financial_ledger, entitlements, audit_log
--             (status CHECKs corrected to the v5.1 state machines, s16)
--          2. Additive columns on existing tables (invoices, order_splits,
--             payouts, webhook_events)
--          3. Derived view v_order_splits_refunded (B-6 / N-6)
--          4. webhook_events C7 remediation: store/index the Kashier de-dupe
--             composite (provider, transaction_id, provider_status) and remove
--             the mis-keyed (provider, transaction_id, status) index, because
--             `status` is the PROCESSING status, not the provider status.
--          5. RLS (admin-full-access on financial tables; users read own
--             entitlements).
--
--          Additive only. No table/data is dropped, renamed, or overwritten.
--          Idempotent: safe against both an empty schema and one already
--          carrying the legacy v4 objects.
-- ==============================================================================

-- ──────────────────────────────────────────────────────────────────────────
-- 1. FINANCIAL BACKBONE TABLES
-- ──────────────────────────────────────────────────────────────────────────

-- 1.1 beneficiaries
create table if not exists public.beneficiaries (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text,
    role text not null check (role in ('author', 'platform', 'coach', 'partner')),
    payout_method text not null check (payout_method in ('bank_account', 'mobile_wallet', 'card')),
    payout_details jsonb not null default '{}'::jsonb,
    kashier_recipient_id text,
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

-- 1.2 split_rules
create table if not exists public.split_rules (
    id uuid primary key default gen_random_uuid(),
    tier_id text,
    product_id text,
    beneficiary_id uuid not null references public.beneficiaries(id) on delete cascade,
    share_type text not null check (share_type in ('percentage', 'fixed')),
    share_value numeric(10,4) not null check (share_value >= 0),
    priority int not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

-- 1.3 payouts (status CHECK includes RECONCILING/UNKNOWN per s16 + payoutState.ts)
create table if not exists public.payouts (
    id uuid primary key default gen_random_uuid(),
    beneficiary_id uuid not null references public.beneficiaries(id) on delete restrict,
    amount_minor int not null check (amount_minor > 0),
    currency text not null,
    payout_method text not null,
    kashier_transfer_id text,
    kashier_batch_id text,
    status text not null default 'queued' check (
        status in ('queued', 'processing', 'reconciling', 'completed', 'failed', 'unknown')
    ),
    error_message text,
    raw_response jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

-- 1.4 order_splits (status CHECK includes CALCULATED/FROZEN per s16)
create table if not exists public.order_splits (
    id uuid primary key default gen_random_uuid(),
    invoice_id uuid not null references public.invoices(id) on delete cascade,
    beneficiary_id uuid not null references public.beneficiaries(id) on delete restrict,
    rule_snapshot jsonb not null default '{}'::jsonb,
    gross_amount_minor int not null check (gross_amount_minor >= 0),
    gateway_fee_minor int not null default 0 check (gateway_fee_minor >= 0),
    net_amount_minor int not null check (net_amount_minor >= 0),
    allocated_amount_minor int not null check (allocated_amount_minor >= 0),
    currency text not null,
    status text not null default 'pending' check (
        status in ('pending', 'calculated', 'frozen', 'queued', 'paid', 'failed', 'cancelled')
    ),
    payout_id uuid references public.payouts(id) on delete set null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint order_splits_invoice_beneficiary_unique unique (invoice_id, beneficiary_id)
);

-- 1.5 payment_intents
create table if not exists public.payment_intents (
    id uuid primary key default gen_random_uuid(),
    invoice_id uuid not null references public.invoices(id) on delete cascade,
    attempt_number int not null default 1,
    supersedes_payment_intent_id uuid references public.payment_intents(id) on delete set null,
    is_current boolean not null default true,
    provider text not null default 'kashier',
    provider_order_id text,
    merchant_reference text not null,
    amount_minor int not null check (amount_minor >= 0),
    currency char(3) not null default 'EGP',
    environment text not null default 'test' check (environment in ('test', 'live')),
    status text not null default 'initiated' check (
        status in ('initiated', 'pending', 'succeeded', 'failed', 'cancelled', 'expired', 'unknown')
    ),
    fx_rate numeric(12,6) not null default 1.000000,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

-- 1.6 refunds
create table if not exists public.refunds (
    id uuid primary key default gen_random_uuid(),
    payment_intent_id uuid not null references public.payment_intents(id) on delete restrict,
    invoice_id uuid not null references public.invoices(id) on delete restrict,
    amount_minor int not null check (amount_minor > 0),
    currency char(3) not null default 'EGP',
    status text not null default 'requested' check (
        status in ('requested', 'validating', 'submitted', 'pending', 'completed', 'failed', 'rejected', 'cancelled', 'unknown')
    ),
    reason text,
    kashier_refund_id text,
    kashier_transaction_id text,
    raw_response jsonb not null default '{}'::jsonb,
    requested_by uuid,
    error_message text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

-- 1.7 financial_ledger (immutable, append-only double-entry journal)
create table if not exists public.financial_ledger (
    id uuid primary key default gen_random_uuid(),
    journal_entry_id uuid not null,
    payment_intent_id uuid references public.payment_intents(id) on delete set null,
    invoice_id uuid references public.invoices(id) on delete set null,
    account text not null check (
        account in (
            'CUSTOMER_FUNDS',
            'GATEWAY_FEES',
            'PLATFORM_REVENUE',
            'BENEFICIARY_PAYABLE',
            'REFUND_LIABILITY',
            'PAYOUT_CLEARING',
            'SALES_CLEARING'
        )
    ),
    entry_type text not null check (entry_type in ('DEBIT', 'CREDIT')),
    amount_minor int not null check (amount_minor > 0),
    currency char(3) not null default 'EGP',
    event_type text not null check (
        event_type in (
            'PAYMENT_CAPTURED',
            'GATEWAY_FEE',
            'SPLIT_ALLOCATED',
            'REFUND_CREATED',
            'REFUND_ALLOCATED',
            'PAYOUT_CREATED',
            'PAYOUT_COMPLETED',
            'PAYOUT_FAILED',
            'PAYOUT_REVERSED',
            'MANUAL_ADJUSTMENT'
        )
    ),
    source_id text not null,
    source_event_type text not null,
    original_journal_entry_id uuid references public.financial_ledger(id) on delete set null,
    beneficiary_id uuid references public.beneficiaries(id) on delete set null,
    description text,
    created_at timestamptz not null default timezone('utc', now())
);

-- 1.8 entitlements
create table if not exists public.entitlements (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    product_id text not null,
    invoice_id uuid not null references public.invoices(id) on delete cascade,
    payment_intent_id uuid references public.payment_intents(id) on delete set null,
    status text not null default 'granted' check (status in ('granted', 'revoked', 'suspended')),
    granted_at timestamptz not null default timezone('utc', now()),
    revoked_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

-- 1.9 audit_log
create table if not exists public.audit_log (
    id uuid primary key default gen_random_uuid(),
    actor_id uuid,
    actor_type text not null default 'system' check (actor_type in ('system', 'admin', 'user', 'service')),
    action text not null,
    entity_type text not null,
    entity_id text,
    old_state jsonb,
    new_state jsonb,
    ip_address text,
    user_agent text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now())
);

-- ──────────────────────────────────────────────────────────────────────────
-- 2. CORRECT STATUS CHECKS IF LEGACY OBJECTS PRE-EXIST (idempotent)
--    The legacy v4 checks omitted RECONCILING/UNKNOWN (payouts) and
--    CALCULATED/FROZEN (order_splits); the code and s16 require them.
--    Intentionally NOT wrapped in an exception handler: a silent rollback
--    here would leave the DB without the v5.1 status semantics while the
--    migration still reports success.
-- ──────────────────────────────────────────────────────────────────────────
alter table public.payouts drop constraint if exists payouts_status_check;
alter table public.payouts add constraint payouts_status_check
    check (status in ('queued', 'processing', 'reconciling', 'completed', 'failed', 'unknown'));

alter table public.order_splits drop constraint if exists order_splits_status_check;
alter table public.order_splits add constraint order_splits_status_check
    check (status in ('pending', 'calculated', 'frozen', 'queued', 'paid', 'failed', 'cancelled'));

-- ──────────────────────────────────────────────────────────────────────────
-- 3. ADDITIVE COLUMNS ON EXISTING TABLES
-- ──────────────────────────────────────────────────────────────────────────
-- Intentionally NOT wrapped in an exception handler (see section 2 rationale):
-- a swallowed failure would silently omit columns that shipping code depends on.

-- invoices
alter table public.invoices add column if not exists fx_rate numeric(12,6) not null default 1.000000;

-- order_splits
alter table public.order_splits add column if not exists fx_rate numeric(12,6) not null default 1.000000;
alter table public.order_splits add column if not exists payment_intent_id uuid references public.payment_intents(id) on delete set null;

-- payouts
alter table public.payouts add column if not exists approval_idempotency_key text;
alter table public.payouts add column if not exists payment_intent_id uuid references public.payment_intents(id) on delete set null;

-- webhook_events (v5.1 linkage + C7 provider status)
alter table public.webhook_events add column if not exists payment_intent_id uuid references public.payment_intents(id) on delete set null;
alter table public.webhook_events add column if not exists provider_transaction_id text;
alter table public.webhook_events add column if not exists provider_operation text default 'pay';
alter table public.webhook_events add column if not exists provider_status text;
alter table public.webhook_events add column if not exists received_at timestamptz not null default timezone('utc', now());
alter table public.webhook_events add column if not exists error_message text;

-- Unique guard for payouts approval idempotency (added separately: partial unique)
create unique index if not exists payouts_approval_idempotency_key_unique
    on public.payouts (approval_idempotency_key)
    where approval_idempotency_key is not null;

-- ──────────────────────────────────────────────────────────────────────────
-- 4. WEBHOOK_EVENTS C7 REMEDIATION
--    Kashier de-dupes on {transactionId}::{webhookUrl}::{status}. The value
--    previously placed in `status` is the PROCESSING status (always 'pending'
--    on insert), so the composite must use the PROVIDER status instead.
-- ──────────────────────────────────────────────────────────────────────────

-- Remove the mis-keyed index created in 20260917141107.
drop index if exists public.webhook_events_provider_txn_status_unique;

-- Store + index the composite Kashier de-dupe key.
create unique index if not exists webhook_events_provider_txn_provider_status_unique
    on public.webhook_events (provider, transaction_id, provider_status)
    where provider_status is not null;

-- ──────────────────────────────────────────────────────────────────────────
-- 5. DERIVED VIEW - REFUND TRACKING (B-6 / N-6)
-- ──────────────────────────────────────────────────────────────────────────
create or replace view public.v_order_splits_refunded as
select
    os.id as order_split_id,
    os.invoice_id,
    os.beneficiary_id,
    os.payment_intent_id,
    os.allocated_amount_minor,
    coalesce(sum(case
        when fl.event_type = 'REFUND_ALLOCATED' and fl.entry_type = 'DEBIT'
        then fl.amount_minor
        else 0
    end), 0) as refunded_amount_minor,
    os.allocated_amount_minor - coalesce(sum(case
        when fl.event_type = 'REFUND_ALLOCATED' and fl.entry_type = 'DEBIT'
        then fl.amount_minor
        else 0
    end), 0) as remaining_amount_minor,
    os.currency,
    os.status,
    os.payout_id,
    os.created_at,
    os.updated_at
from public.order_splits os
left join public.financial_ledger fl
    on fl.beneficiary_id = os.beneficiary_id
    and fl.invoice_id = os.invoice_id
group by
    os.id,
    os.invoice_id,
    os.beneficiary_id,
    os.payment_intent_id,
    os.allocated_amount_minor,
    os.currency,
    os.status,
    os.payout_id,
    os.created_at,
    os.updated_at;

-- ──────────────────────────────────────────────────────────────────────────
-- 6. INDEXES
-- ──────────────────────────────────────────────────────────────────────────
create index if not exists idx_beneficiaries_role on public.beneficiaries(role);
create index if not exists idx_beneficiaries_active on public.beneficiaries(is_active);

create index if not exists idx_split_rules_beneficiary on public.split_rules(beneficiary_id);
create index if not exists idx_split_rules_tier on public.split_rules(tier_id);
create index if not exists idx_split_rules_active on public.split_rules(is_active);

create index if not exists idx_order_splits_invoice on public.order_splits(invoice_id);
create index if not exists idx_order_splits_beneficiary on public.order_splits(beneficiary_id);
create index if not exists idx_order_splits_status on public.order_splits(status);
create index if not exists idx_order_splits_payout on public.order_splits(payout_id);

create index if not exists idx_payouts_beneficiary on public.payouts(beneficiary_id);
create index if not exists idx_payouts_status on public.payouts(status);
create index if not exists idx_payouts_created on public.payouts(created_at desc);

create unique index if not exists idx_payment_intents_invoice_attempt
    on public.payment_intents(invoice_id, attempt_number);
create index if not exists idx_payment_intents_invoice_current
    on public.payment_intents(invoice_id, is_current);
create index if not exists idx_payment_intents_provider_order
    on public.payment_intents(provider_order_id);
create index if not exists idx_payment_intents_merchant_ref
    on public.payment_intents(merchant_reference);
create index if not exists idx_payment_intents_status
    on public.payment_intents(status);

create index if not exists idx_refunds_intent on public.refunds(payment_intent_id);
create index if not exists idx_refunds_invoice on public.refunds(invoice_id);
create index if not exists idx_refunds_status on public.refunds(status);

create index if not exists idx_financial_ledger_journal on public.financial_ledger(journal_entry_id);
create index if not exists idx_financial_ledger_intent on public.financial_ledger(payment_intent_id);
create index if not exists idx_financial_ledger_invoice on public.financial_ledger(invoice_id);
create index if not exists idx_financial_ledger_account on public.financial_ledger(account);
create index if not exists idx_financial_ledger_event on public.financial_ledger(event_type);
create index if not exists idx_financial_ledger_beneficiary on public.financial_ledger(beneficiary_id);
create index if not exists idx_financial_ledger_created on public.financial_ledger(created_at desc);

create unique index if not exists idx_entitlements_user_product_invoice
    on public.entitlements(user_id, product_id, invoice_id);
create index if not exists idx_entitlements_user_status
    on public.entitlements(user_id, status);
create index if not exists idx_entitlements_invoice
    on public.entitlements(invoice_id);

create index if not exists idx_audit_log_entity on public.audit_log(entity_type, entity_id);
create index if not exists idx_audit_log_actor on public.audit_log(actor_id);
create index if not exists idx_audit_log_action on public.audit_log(action);
create index if not exists idx_audit_log_created on public.audit_log(created_at desc);

create index if not exists idx_webhook_events_intent on public.webhook_events(payment_intent_id);
create index if not exists idx_webhook_events_tx on public.webhook_events(transaction_id);

-- ──────────────────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY
--    Financial/admin tables: admin full access (service_role bypasses RLS).
--    entitlements: authenticated users may read their own.
-- ──────────────────────────────────────────────────────────────────────────
alter table public.beneficiaries enable row level security;
alter table public.split_rules enable row level security;
alter table public.order_splits enable row level security;
alter table public.payouts enable row level security;
alter table public.payment_intents enable row level security;
alter table public.refunds enable row level security;
alter table public.financial_ledger enable row level security;
alter table public.entitlements enable row level security;
alter table public.audit_log enable row level security;

do $$ begin
    create policy "Beneficiaries: admin full access" on public.beneficiaries
        for all using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
    create policy "Split Rules: admin full access" on public.split_rules
        for all using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
    create policy "Order Splits: admin full access" on public.order_splits
        for all using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
    create policy "Payouts: admin full access" on public.payouts
        for all using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
    create policy "Payment Intents: admin full access" on public.payment_intents
        for all using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
    create policy "Refunds: admin full access" on public.refunds
        for all using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
    create policy "Financial Ledger: admin full access" on public.financial_ledger
        for all using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
    create policy "Audit Log: admin full access" on public.audit_log
        for all using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
    create policy "Entitlements: admin full access" on public.entitlements
        for all using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
    create policy "Entitlements: users read own" on public.entitlements
        for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
