-- Phase 9: Fraud Detection & Risk Handling Tables
-- Advanced Protection & Risk Handling (APHC) System

-- =============================================
-- FRAUD RULES
-- =============================================
create table if not exists fraud_rules (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    version text not null default 'v1.0',
    condition jsonb not null,
    action text not null check (action in ('ALLOW', 'REVIEW', 'REJECT', 'NOTIFY')),
    priority integer not null default 10,
    enabled boolean not null default true,
    dry_run boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Indexes for fraud_rules
create index if not exists idx_fraud_rules_enabled on fraud_rules (enabled) where enabled = true;
create index if not exists idx_fraud_rules_priority on fraud_rules (priority);

-- =============================================
-- FRAUD OBSERVATIONS
-- =============================================
create table if not exists fraud_observations (
    id uuid primary key default gen_random_uuid(),
    payment_intent_id uuid not null references payment_intents(id) on delete cascade,
    signal_type text not null,
    score integer not null,
    threshold integer not null,
    evidence jsonb not null default '{}',
    detected_at timestamptz not null default now(),
    expires_at timestamptz not null,
    policy_version text not null,
    source text not null check (source in ('payment', 'webhook', 'reconciliation')),
    created_at timestamptz not null default now()
);

-- Indexes for fraud_observations
create index if not exists idx_fraud_observations_payment_intent on fraud_observations (payment_intent_id);
create index if not exists idx_fraud_observations_signal_type on fraud_observations (signal_type);
create index if not exists idx_fraud_observations_expires_at on fraud_observations (expires_at);

-- =============================================
-- FRAUD DECISIONS
-- =============================================
create table if not exists fraud_decisions (
    id uuid primary key default gen_random_uuid(),
    payment_intent_id uuid not null references payment_intents(id) on delete cascade,
    observation_id uuid references fraud_observations(id) on delete set null,
    rule_id uuid not null references fraud_rules(id) on delete restrict,
    decision text not null check (decision in ('ALLOW', 'REVIEW', 'REJECT', 'BLOCK')),
    reason text not null,
    evaluated_at timestamptz not null default now(),
    reviewed_by uuid,
    reviewed_at timestamptz,
    policy_version text not null,
    applied_to_payment_status boolean not null default false,
    notification_sent boolean not null default false,
    audit_trail jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Indexes for fraud_decisions
create index if not exists idx_fraud_decisions_payment_intent on fraud_decisions (payment_intent_id);
create index if not exists idx_fraud_decisions_observation on fraud_decisions (observation_id);
create index if not exists idx_fraud_decisions_rule on fraud_decisions (rule_id);
create index if not exists idx_fraud_decisions_decision on fraud_decisions (decision);

-- =============================================
-- ADD FRAUD_FLAG TO PAYMENT_INTENTS (Hybrid approach)
-- =============================================
alter table payment_intents
    add column if not exists fraud_flag text not null default 'unassessed'
    check (fraud_flag in ('unassessed', 'allow', 'review', 'reject', 'blocked', 'resolved'));

-- Index for fraud_flag
create index if not exists idx_payment_intents_fraud_flag on payment_intents (fraud_flag);

-- =============================================
-- RLS POLICIES (service_role only)
-- =============================================
alter table fraud_rules enable row level security;
alter table fraud_observations enable row level security;
alter table fraud_decisions enable row level security;

revoke all on fraud_rules from anon, authenticated;
revoke all on fraud_observations from anon, authenticated;
revoke all on fraud_decisions from anon, authenticated;

grant select, insert, update on fraud_rules to service_role;
grant select, insert, update on fraud_observations to service_role;
grant select, insert, update on fraud_decisions to service_role;

-- =============================================
-- INITIAL SEED DATA
-- =============================================
insert into fraud_rules (name, version, condition, action, priority, enabled, dry_run) values
    ('ارتفاع المبلغ', 'v1.0', '{"amount": {"max": 50000, "operator": "greater_than"}}', 'REVIEW', 10, true, false),
    ('منطقة محظورة', 'v1.0', '{"region": {"blocked": ["BLOCKED_REGION"]}}', 'REJECT', 20, true, false),
    ('السماح الافتراضي', 'v1.0', '{}', 'ALLOW', 1, true, false)
on conflict do nothing;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================
create or replace function update_fraud_flag()
returns trigger as $$
begin
    -- Update fraud_flag based on latest decision
    if new.decision = 'REJECT' then
        update payment_intents set fraud_flag = 'reject', updated_at = now() where id = new.payment_intent_id;
    elsif new.decision = 'REVIEW' then
        update payment_intents set fraud_flag = 'review', updated_at = now() where id = new.payment_intent_id;
    elsif new.decision = 'ALLOW' then
        update payment_intents set fraud_flag = 'allow', updated_at = now() where id = new.payment_intent_id;
    end if;
    return new;
end;
$$ language plpgsql security definer;

create trigger update_fraud_flag_trigger
    after insert on fraud_decisions
    for each row
    execute function update_fraud_flag();