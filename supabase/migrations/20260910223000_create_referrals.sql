-- ============================================================
-- referrals: one record per commission-eligible sale event.
-- commission_rate and commission_amount are IMMUTABLE after insert
-- (stored as they were at the time of calculation).
-- ============================================================
create table if not exists public.referrals (
    id uuid primary key default gen_random_uuid(),
    affiliate_id uuid not null references public.affiliates(id) on delete restrict,
    invoice_id uuid references public.invoices(id) on delete set null,
    customer_user_id uuid references auth.users(id) on delete set null,
    referral_code text not null,
    amount numeric(12,2) not null check (amount >= 0),
    currency text not null,
    commission_base_amount numeric(12,2) not null check (commission_base_amount >= 0),
    commission_rate numeric(5,2) not null check (commission_rate >= 0 and commission_rate <= 100),
    commission_amount numeric(12,2) not null check (commission_amount >= 0),
    tier text not null check (tier in ('bronze','silver','gold','custom')),
    status text not null default 'pending' check (status in ('pending','approved','reversed','chargeback','refunded')),
    attribution_source text check (attribution_source in ('cookie','server','url_param','admin')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
alter table public.referrals enable row level security;
drop policy if exists "Referrals: affiliates view own" on public.referrals;
create policy "Referrals: affiliates view own"
    on public.referrals for select to authenticated
    using (affiliate_id in (select id from public.affiliates where user_id = (select auth.uid())));
drop policy if exists "Referrals: service insert" on public.referrals;
create policy "Referrals: service insert"
    on public.referrals for insert to authenticated with check (true);
drop policy if exists "Referrals: service update" on public.referrals;
create policy "Referrals: service update"
    on public.referrals for update to authenticated using (true) with check (true);
drop policy if exists "Referrals: admin all" on public.referrals;
create policy "Referrals: admin all"
    on public.referrals for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
drop trigger if exists referrals_set_updated_at on public.referrals;
create trigger referrals_set_updated_at
    before update on public.referrals
    for each row execute function public.handle_updated_at();
create index if not exists idx_referrals_affiliate_id on public.referrals(affiliate_id);
create index if not exists idx_referrals_invoice_id on public.referrals(invoice_id);
create index if not exists idx_referrals_created_at on public.referrals(created_at desc);
create index if not exists idx_referrals_status on public.referrals(status);
create index if not exists idx_referrals_customer_user_id on public.referrals(customer_user_id);
