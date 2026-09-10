-- ============================================================
-- affiliates: affiliate program accounts
-- One affiliate per user (unique user_id).
-- custom_commission_rate overrides tier-based rate when set.
-- ============================================================
create table if not exists public.affiliates (
    id uuid primary key default gen_random_uuid(),
    user_id uuid unique not null references auth.users(id) on delete cascade,
    referral_code text unique not null,
    status text not null default 'pending' check (status in ('pending','active','suspended','disabled')),
    custom_commission_rate numeric(5,2) check (
        custom_commission_rate is null or
        (custom_commission_rate >= 0 and custom_commission_rate <= 100)
    ),
    current_balance numeric(12,2) not null default 0 check (current_balance >= 0),
    lifetime_earnings numeric(12,2) not null default 0 check (lifetime_earnings >= 0),
    total_referrals int not null default 0 check (total_referrals >= 0),
    total_paid_referrals int not null default 0 check (total_paid_referrals >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
alter table public.affiliates enable row level security;
drop policy if exists "Affiliates: users view own" on public.affiliates;
create policy "Affiliates: users view own"
    on public.affiliates for select to authenticated
    using ((select auth.uid()) = user_id);
drop policy if exists "Affiliates: service insert" on public.affiliates;
create policy "Affiliates: service insert"
    on public.affiliates for insert to authenticated with check (true);
drop policy if exists "Affiliates: service update" on public.affiliates;
create policy "Affiliates: service update"
    on public.affiliates for update to authenticated using (true) with check (true);
drop policy if exists "Affiliates: admin all" on public.affiliates;
create policy "Affiliates: admin all"
    on public.affiliates for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
drop trigger if exists affiliates_set_updated_at on public.affiliates;
create trigger affiliates_set_updated_at
    before update on public.affiliates
    for each row execute function public.handle_updated_at();
create index if not exists idx_affiliates_user_id on public.affiliates(user_id);
create index if not exists idx_affiliates_referral_code on public.affiliates(referral_code);
create index if not exists idx_affiliates_status on public.affiliates(status);
