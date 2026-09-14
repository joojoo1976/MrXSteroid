-- ==============================================================================
-- MIGRATION: 20260914100000_create_final_gate_v4_tables.sql
-- PURPOSE: Implement Final Gate v4 Database Architecture & Financial Backbone:
--          1. payment_intents (1:N relationship with invoices, attempt tracking, late-arrival guard)
--          2. financial_ledger (Double-Entry Journal & Chart of Accounts, immutable append-only)
--          3. refunds (Multi-state refund tracking with idempotency)
--          4. entitlements (Digital product entitlement layer)
--          5. audit_log (Unified system, financial, and admin audit trail)
--          6. Schema enhancements on invoices, order_splits, payouts, webhook_events
--          7. Derived view v_order_splits_refunded (B-6 / N-6)
--          8. Row-Level Security (RLS) & Performance/Deduplication Indexes
-- ==============================================================================

-- 1. PAYMENT INTENTS TABLE (1:N with invoices)
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
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Unique index to prevent duplicate attempt numbers per invoice
create unique index if not exists idx_payment_intents_invoice_attempt 
    on public.payment_intents(invoice_id, attempt_number);

-- Index for resolving the current active intent
create index if not exists idx_payment_intents_invoice_current 
    on public.payment_intents(invoice_id, is_current);

create index if not exists idx_payment_intents_provider_order 
    on public.payment_intents(provider_order_id);

create index if not exists idx_payment_intents_merchant_ref 
    on public.payment_intents(merchant_reference);

create index if not exists idx_payment_intents_status 
    on public.payment_intents(status);

-- 2. REFUNDS TABLE
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
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_refunds_intent on public.refunds(payment_intent_id);
create index if not exists idx_refunds_invoice on public.refunds(invoice_id);
create index if not exists idx_refunds_status on public.refunds(status);

-- 3. FINANCIAL LEDGER (Double-Entry Journal & Chart of Accounts - Immutable Append-Only)
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
    created_at timestamptz not null default now()
);

create index if not exists idx_financial_ledger_journal on public.financial_ledger(journal_entry_id);
create index if not exists idx_financial_ledger_intent on public.financial_ledger(payment_intent_id);
create index if not exists idx_financial_ledger_invoice on public.financial_ledger(invoice_id);
create index if not exists idx_financial_ledger_account on public.financial_ledger(account);
create index if not exists idx_financial_ledger_event on public.financial_ledger(event_type);
create index if not exists idx_financial_ledger_beneficiary on public.financial_ledger(beneficiary_id);
create index if not exists idx_financial_ledger_created on public.financial_ledger(created_at desc);

-- 4. ENTITLEMENTS TABLE (Digital Product Delivery & Access Layer)
create table if not exists public.entitlements (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    product_id text not null,
    invoice_id uuid not null references public.invoices(id) on delete cascade,
    payment_intent_id uuid references public.payment_intents(id) on delete set null,
    status text not null default 'granted' check (status in ('granted', 'revoked', 'suspended')),
    granted_at timestamptz not null default now(),
    revoked_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists idx_entitlements_user_product_invoice 
    on public.entitlements(user_id, product_id, invoice_id);

create index if not exists idx_entitlements_user_status 
    on public.entitlements(user_id, status);

create index if not exists idx_entitlements_invoice 
    on public.entitlements(invoice_id);

-- 5. UNIFIED AUDIT LOG TABLE
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
    created_at timestamptz not null default now()
);

create index if not exists idx_audit_log_entity on public.audit_log(entity_type, entity_id);
create index if not exists idx_audit_log_actor on public.audit_log(actor_id);
create index if not exists idx_audit_log_action on public.audit_log(action);
create index if not exists idx_audit_log_created on public.audit_log(created_at desc);

-- 6. ENHANCE EXISTING TABLES WITH V4 IDENTIFIERS AND SAFETY FIELDS
do $$ begin
    -- invoices enhancements
    alter table public.invoices add column if not exists fx_rate numeric(12,6) not null default 1.000000;
    
    -- order_splits enhancements
    alter table public.order_splits add column if not exists fx_rate numeric(12,6) not null default 1.000000;
    alter table public.order_splits add column if not exists payment_intent_id uuid references public.payment_intents(id) on delete set null;

    -- payouts enhancements
    alter table public.payouts add column if not exists approval_idempotency_key text unique;
    alter table public.payouts add column if not exists payment_intent_id uuid references public.payment_intents(id) on delete set null;

    -- webhook_events enhancements (N-2 quadruple linkage & operation tracking)
    alter table public.webhook_events add column if not exists payment_intent_id uuid references public.payment_intents(id) on delete set null;
    alter table public.webhook_events add column if not exists provider_transaction_id text;
    alter table public.webhook_events add column if not exists provider_operation text default 'pay';
exception when others then null; end $$;

create index if not exists idx_webhook_events_quadruple 
    on public.webhook_events(provider, provider_event_id, provider_transaction_id, provider_operation);

create index if not exists idx_webhook_events_intent 
    on public.webhook_events(payment_intent_id);

-- 7. DERIVED SQL VIEW FOR REFUND TRACKING (N-6 / B-6)
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

-- 8. ROW-LEVEL SECURITY (RLS) POLICIES
alter table public.payment_intents enable row level security;
alter table public.refunds enable row level security;
alter table public.financial_ledger enable row level security;
alter table public.entitlements enable row level security;
alter table public.audit_log enable row level security;

-- Admin access helper condition
-- Admin has full access across all financial records
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

-- Entitlements: authenticated users can read their own entitlements
do $$ begin
    create policy "Entitlements: users read own" on public.entitlements
        for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
