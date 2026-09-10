-- ============================================================
-- affiliate_audit_logs: immutable audit trail.
-- Affiliates cannot read their own audit log (security).
-- ============================================================
-- Event types (documented here for reference):
--   affiliate_created, affiliate_activated, affiliate_suspended, affiliate_disabled,
--   commission_created, commission_override_changed, manual_adjustment, payout,
--   refund, partial_refund, chargeback, reversal, webhook_anomaly,
--   security_event, risk_flag, self_referral_blocked
create table if not exists public.affiliate_audit_logs (
    id uuid primary key default gen_random_uuid(),
    affiliate_id uuid references public.affiliates(id) on delete set null,
    actor_id uuid,
    actor_type text check (actor_type in ('system','admin','affiliate')),
    event_type text not null,
    payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);
alter table public.affiliate_audit_logs enable row level security;
drop policy if exists "Audit: admin all" on public.affiliate_audit_logs;
create policy "Audit: admin all"
    on public.affiliate_audit_logs for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
drop policy if exists "Audit: service insert" on public.affiliate_audit_logs;
create policy "Audit: service insert"
    on public.affiliate_audit_logs for insert to authenticated with check (true);
create index if not exists idx_audit_affiliate_id on public.affiliate_audit_logs(affiliate_id);
create index if not exists idx_audit_created_at on public.affiliate_audit_logs(created_at desc);
create index if not exists idx_audit_event_type on public.affiliate_audit_logs(event_type);
