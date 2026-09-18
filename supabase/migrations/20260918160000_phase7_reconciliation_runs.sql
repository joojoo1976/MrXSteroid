-- ═══════════════════════════════════════════════════════════════════════════
--  PHASE 7 — RECONCILIATION RUN LOG + INTENT RECONCILIATION COLUMNS
--
--  Final Gate v5.1 §11 / §13 / Phase 7:
--  · `reconciliation_runs` — append-only log of every reconciliation pass
--    (5-min cron + manual Break-Glass trigger). Enables audit + backoff
--    accounting across runs without mutating webhook_events.
--  · `payment_intents.reconciliation_attempts` / `reconciliation_last_attempt_at`
--    / `reconciliation_next_attempt_at` — per-attempt backoff state.
--    Exponential backoff, max 12 attempts (spec §11).
--
--  Idempotent & additive. service_role only — no public/anon/authenticated.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) reconciliation_runs — append-only run log
create table if not exists public.reconciliation_runs (
    id                 uuid primary key default gen_random_uuid(),
    trigger_source     text not null default 'cron' check (trigger_source in ('cron', 'manual')),
    started_at         timestamptz not null default timezone('utc', now()),
    finished_at        timestamptz,
    status             text not null default 'running'
                       check (status in ('running', 'completed', 'failed')),
    candidates_count       int not null default 0,
    resolved_count         int not null default 0,
    quarantined_count      int not null default 0,
    still_unresolved_count int not null default 0,
    max_attempts_reached   int not null default 0,
    error_message      text,
    metadata           jsonb not null default '{}'::jsonb,
    created_at         timestamptz not null default timezone('utc', now())
);

comment on table public.reconciliation_runs is
    'Phase 7: append-only log of reconciliation passes (5-min cron + manual Break-Glass).';

-- 2) payment_intents — per-attempt reconciliation/backoff state
alter table public.payment_intents
    add column if not exists reconciliation_attempts     int not null default 0,
    add column if not exists reconciliation_last_attempt_at timestamptz,
    add column if not exists reconciliation_next_attempt_at  timestamptz;

comment on column public.payment_intents.reconciliation_attempts is
    'Phase 7: number of provider-status polls attempted (exponential backoff, max 12).';
comment on column public.payment_intents.reconciliation_last_attempt_at is
    'Phase 7: timestamp of the last provider-status poll for this attempt.';
comment on column public.payment_intents.reconciliation_next_attempt_at is
    'Phase 7: contract — do not poll before this timestamp (exponential backoff).';

-- 3) RLS: reconciliation_runs is internal accounting. service_role only.
alter table public.reconciliation_runs enable row level security;

drop policy if exists "reconciliation_runs_service_role" on public.reconciliation_runs;
create policy "reconciliation_runs_service_role"
    on public.reconciliation_runs
    for all
    to service_role
    using (true)
    with check (true);

revoke all on public.reconciliation_runs from anon, authenticated;

-- 4) indexes for the 5-min candidate scan
create index if not exists idx_payment_intents_reconcile_due
    on public.payment_intents (reconciliation_next_attempt_at)
    where reconciliation_next_attempt_at is not null;

create index if not exists idx_reconciliation_runs_started
    on public.reconciliation_runs (started_at desc);