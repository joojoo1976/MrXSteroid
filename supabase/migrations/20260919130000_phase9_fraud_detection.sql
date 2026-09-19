-- ============================================================================
-- Phase 9 — Fraud/Risk Evaluation Engine (APHC)
-- Idempotent. Safe to re-run.
-- ============================================================================

-- ── 1. fraud_rules ───────────────────────────────────────────────────────────
create table if not exists public.fraud_rules (
    id text primary key,
    name text not null,
    version text not null default 'v1.0',
    condition jsonb not null default '{}'::jsonb,
    action text not null check (action in ('ALLOW', 'REVIEW', 'REJECT', 'NOTIFY', 'BLOCK')),
    priority integer not null default 10,
    enabled boolean not null default true,
    dry_run boolean not null default false,
    tags text[] default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_fraud_rules_enabled on public.fraud_rules (enabled) where enabled = true;
create index if not exists idx_fraud_rules_priority on public.fraud_rules (priority desc);

-- ── 2. fraud_observations ───────────────────────────────────────────────────
create table if not exists public.fraud_observations (
    id text primary key,
    payment_intent_id uuid not null references public.payment_intents(id) on delete cascade,
    signal_type text not null,
    score integer not null,
    threshold integer not null,
    evidence jsonb not null default '{}'::jsonb,
    detected_at timestamptz not null default now(),
    expires_at timestamptz not null,
    policy_version text not null,
    source text not null check (source in ('payment', 'webhook', 'reconciliation'))
);

create index if not exists idx_fraud_observations_intent
    on public.fraud_observations (payment_intent_id, detected_at desc);
create index if not exists idx_fraud_observations_expires
    on public.fraud_observations (expires_at);

-- ── 3. fraud_decisions ──────────────────────────────────────────────────────
create table if not exists public.fraud_decisions (
    id text primary key,
    payment_intent_id uuid not null references public.payment_intents(id) on delete cascade,
    observation_id text references public.fraud_observations(id) on delete set null,
    rule_id text not null references public.fraud_rules(id) on delete restrict,
    decision text not null check (decision in ('ALLOW', 'REVIEW', 'REJECT', 'BLOCK')),
    reason text not null,
    evaluated_at timestamptz not null default now(),
    reviewed_by uuid,
    reviewed_at timestamptz,
    policy_version text not null,
    applied_to_payment_status boolean not null default false,
    notification_sent boolean not null default false,
    audit_trail jsonb
);

create index if not exists idx_fraud_decisions_intent
    on public.fraud_decisions (payment_intent_id, evaluated_at desc);
create index if not exists idx_fraud_decisions_decision
    on public.fraud_decisions (decision);
create index if not exists idx_fraud_decisions_rule
    on public.fraud_decisions (rule_id);

-- ── 4. payment_intents.fraud_flag (denormalised summary) ───────────────────
alter table public.payment_intents
    add column if not exists fraud_flag text not null default 'unassessed'
    check (fraud_flag in ('unassessed', 'allow', 'review', 'reject', 'blocked', 'resolved'));

create index if not exists idx_payment_intents_fraud_flag
    on public.payment_intents (fraud_flag);

-- ── 5. RLS: service_role only ───────────────────────────────────────────────
alter table public.fraud_rules enable row level security;
alter table public.fraud_observations enable row level security;
alter table public.fraud_decisions enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'fraud_rules' and policyname = 'fraud_rules_service'
    ) then
        create policy fraud_rules_service on public.fraud_rules
            for all to service_role using (true) with check (true);
    end if;
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'fraud_observations' and policyname = 'fraud_obs_service'
    ) then
        create policy fraud_obs_service on public.fraud_observations
            for all to service_role using (true) with check (true);
    end if;
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'fraud_decisions' and policyname = 'fraud_dec_service'
    ) then
        create policy fraud_dec_service on public.fraud_decisions
            for all to service_role using (true) with check (true);
    end if;
end$$;

revoke all on public.fraud_rules from anon, authenticated;
revoke all on public.fraud_observations from anon, authenticated;
revoke all on public.fraud_decisions from anon, authenticated;

grant select, insert, update on public.fraud_rules to service_role;
grant select, insert, update on public.fraud_observations to service_role;
grant select, insert, update on public.fraud_decisions to service_role;

-- ── 6. Trigger: keep payment_intents.fraud_flag in sync ─────────────────────
create or replace function public.trg_fraud_decision_apply_flag()
returns trigger
language plpgsql
security definer
as $$
begin
    update public.payment_intents
    set fraud_flag = case new.decision
            when 'REJECT' then 'reject'
            when 'BLOCK'  then 'blocked'
            when 'REVIEW' then 'review'
            when 'ALLOW'  then 'allow'
        end,
        updated_at = now()
    where id = new.payment_intent_id;
    return new;
end$$;

drop trigger if exists trg_fraud_decision_apply_flag on public.fraud_decisions;
create trigger trg_fraud_decision_apply_flag
    after insert on public.fraud_decisions
    for each row execute function public.trg_fraud_decision_apply_flag();

-- ── 7. Seed rules (idempotent) ──────────────────────────────────────────────
insert into public.fraud_rules (id, name, version, condition, action, priority, enabled, dry_run)
values
    ('rule-2', 'Blocked Region', 'v1.0',
        '{"region": {"blocked": ["BLOCKED_REGION"]}}'::jsonb, 'REJECT', 20, true, false),
    ('rule-1', 'Amount Exceeded', 'v1.0',
        '{"amount": {"max": 50000, "operator": "greater_than"}}'::jsonb, 'REVIEW', 10, true, false),
    ('rule-3', 'Default Allow',   'v1.0',
        '{}'::jsonb, 'ALLOW', 1, true, false)
on conflict (id) do update set
    name = excluded.name,
    condition = excluded.condition,
    action = excluded.action,
    priority = excluded.priority,
    updated_at = now();
