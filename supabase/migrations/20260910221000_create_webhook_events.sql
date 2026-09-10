-- ============================================================
-- webhook_events: idempotent webhook deduplication table
-- Unique constraint on (provider, provider_event_id) prevents
-- double-processing at database level.
-- ============================================================
create table if not exists public.webhook_events (
    id uuid primary key default gen_random_uuid(),
    provider text not null,
    merchant_account text,
    provider_event_id text not null,
    invoice_id uuid,
    event_type text,
    payload_hash text,
    status text not null default 'pending' check (status in ('pending','processed','failed','duplicate','skipped')),
    attempt_count int not null default 1,
    processed_at timestamptz,
    created_at timestamptz not null default now(),
    constraint webhook_events_provider_event_unique unique (provider, provider_event_id)
);
alter table public.webhook_events enable row level security;
drop policy if exists "Webhook events: service insert" on public.webhook_events;
create policy "Webhook events: service insert"
    on public.webhook_events for insert to authenticated with check (true);
drop policy if exists "Webhook events: service update" on public.webhook_events;
create policy "Webhook events: service update"
    on public.webhook_events for update to authenticated using (true) with check (true);
drop policy if exists "Webhook events: admin all" on public.webhook_events;
create policy "Webhook events: admin all"
    on public.webhook_events for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
create index if not exists idx_webhook_events_invoice_id on public.webhook_events(invoice_id);
create index if not exists idx_webhook_events_created_at on public.webhook_events(created_at desc);
create index if not exists idx_webhook_events_status on public.webhook_events(status);
create index if not exists idx_webhook_events_provider on public.webhook_events(provider);
