-- ============================================================
-- affiliate_commission_ledger: append-only financial ledger.
-- Every balance change is recorded here. No updates or deletes.
-- balance_after is denormalized for audit trail integrity.
-- ============================================================
create table if not exists public.affiliate_commission_ledger (
    id uuid primary key default gen_random_uuid(),
    affiliate_id uuid not null references public.affiliates(id) on delete restrict,
    referral_id uuid references public.referrals(id) on delete set null,
    transaction_type text not null check (transaction_type in (
        'commission','refund','partial_refund','chargeback','reversal',
        'manual_adjustment','bonus','payout'
    )),
    amount numeric(12,2) not null,
    currency text not null,
    balance_after numeric(12,2) not null,
    reference_id text,
    description text,
    created_at timestamptz not null default now()
);
-- Ledger is append-only: no UPDATE or DELETE policies.
alter table public.affiliate_commission_ledger enable row level security;
drop policy if exists "Ledger: affiliates view own" on public.affiliate_commission_ledger;
create policy "Ledger: affiliates view own"
    on public.affiliate_commission_ledger for select to authenticated
    using (affiliate_id in (select id from public.affiliates where user_id = (select auth.uid())));
drop policy if exists "Ledger: service insert" on public.affiliate_commission_ledger;
create policy "Ledger: service insert"
    on public.affiliate_commission_ledger for insert to authenticated with check (true);
drop policy if exists "Ledger: admin all" on public.affiliate_commission_ledger;
create policy "Ledger: admin all"
    on public.affiliate_commission_ledger for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
create index if not exists idx_ledger_affiliate_id on public.affiliate_commission_ledger(affiliate_id);
create index if not exists idx_ledger_created_at on public.affiliate_commission_ledger(created_at desc);
create index if not exists idx_ledger_transaction_type on public.affiliate_commission_ledger(transaction_type);
create index if not exists idx_ledger_referral_id on public.affiliate_commission_ledger(referral_id);
