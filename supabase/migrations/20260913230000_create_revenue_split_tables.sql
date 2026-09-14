-- ==============================================================================
-- MIGRATION: 20260913230000_create_revenue_split_tables.sql
-- PURPOSE: Create tables for Revenue-Split Engine & Payout Architecture v3.1
--          (beneficiaries, split_rules, order_splits, payouts, webhook_events)
-- ==============================================================================

-- 1. BENEFICIARIES TABLE
create table if not exists public.beneficiaries (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text,
    role text not null check (role in ('author', 'platform', 'coach', 'partner')),
    payout_method text not null check (payout_method in ('bank_account', 'mobile_wallet', 'card')),
    payout_details jsonb not null default '{}'::jsonb,
    kashier_recipient_id text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. SPLIT RULES TABLE
create table if not exists public.split_rules (
    id uuid primary key default gen_random_uuid(),
    tier_id text,
    product_id text,
    beneficiary_id uuid not null references public.beneficiaries(id) on delete cascade,
    share_type text not null check (share_type in ('percentage', 'fixed')),
    share_value numeric(10,4) not null check (share_value >= 0),
    priority int not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. PAYOUTS TABLE (Created before order_splits so order_splits can reference payout_id)
create table if not exists public.payouts (
    id uuid primary key default gen_random_uuid(),
    beneficiary_id uuid not null references public.beneficiaries(id) on delete restrict,
    amount_minor int not null check (amount_minor > 0),
    currency text not null,
    payout_method text not null,
    kashier_transfer_id text,
    kashier_batch_id text,
    status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
    error_message text,
    raw_response jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 4. ORDER SPLITS TABLE
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
    status text not null default 'pending' check (status in ('pending', 'queued', 'paid', 'failed', 'cancelled')),
    payout_id uuid references public.payouts(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint order_splits_invoice_beneficiary_unique unique (invoice_id, beneficiary_id)
);

-- 5. WEBHOOK EVENTS TABLE (Extend if already created, or create idempotent)
create table if not exists public.webhook_events (
    id uuid primary key default gen_random_uuid(),
    provider text not null,
    merchant_account text,
    provider_event_id text not null,
    transaction_id text,
    invoice_id uuid,
    event_type text,
    payload_hash text,
    status text not null default 'pending',
    processing_status text not null default 'pending',
    attempt_count int not null default 1,
    raw_payload jsonb not null default '{}'::jsonb,
    received_at timestamptz not null default now(),
    processed_at timestamptz,
    error_message text,
    created_at timestamptz not null default now(),
    constraint webhook_events_provider_event_unique unique (provider, provider_event_id)
);

-- Ensure all expected columns exist if table was already created in earlier migration
do $$ begin
    alter table public.webhook_events add column if not exists transaction_id text;
    alter table public.webhook_events add column if not exists processing_status text not null default 'pending';
    alter table public.webhook_events add column if not exists raw_payload jsonb not null default '{}'::jsonb;
    alter table public.webhook_events add column if not exists received_at timestamptz not null default now();
    alter table public.webhook_events add column if not exists error_message text;
exception when others then
    null;
end $$;

-- 6. INDEXES FOR PERFORMANCE & DEDUPLICATION
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

create index if not exists idx_webhook_events_provider_event on public.webhook_events(provider, provider_event_id);
create index if not exists idx_webhook_events_tx on public.webhook_events(transaction_id);

-- 7. ROW LEVEL SECURITY (RLS)
alter table public.beneficiaries enable row level security;
alter table public.split_rules enable row level security;
alter table public.order_splits enable row level security;
alter table public.payouts enable row level security;
alter table public.webhook_events enable row level security;

-- Admin-only full access policies (service role bypasses RLS automatically)
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
    create policy "Webhook Events: admin full access" on public.webhook_events
        for all using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
exception when duplicate_object then null; end $$;
