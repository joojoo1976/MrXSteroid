-- ==============================================================================
-- ROLLBACK SCRIPT: 20260917150000_rollback_phase3_final_gate_v5_1_backbone.sql
-- PURPOSE: Revert the Phase 3 close-out forward migration
--          (20260917150000_phase3_final_gate_v5_1_backbone.sql).
--
-- ASSUMPTION: run in the environment this migration targeted (production),
-- where the financial-backbone tables were created BY this migration and did
-- not pre-exist. It restores the webhook_events de-dupe index exactly as it
-- stood after 20260917141107 (the mis-keyed `(provider, transaction_id, status)`
-- index), then removes the additive columns and the tables this migration made.
-- ==============================================================================

-- 1. Derived view
drop view if exists public.v_order_splits_refunded;

-- 2. webhook_events C7 remediation: revert to the post-20260917141107 state
drop index if exists public.webhook_events_provider_txn_provider_status_unique;
create unique index if not exists webhook_events_provider_txn_status_unique
    on public.webhook_events (provider, transaction_id, status)
    where status is not null;

-- 3. Remove additive columns on existing tables
alter table public.webhook_events drop column if exists error_message;
alter table public.webhook_events drop column if exists received_at;
alter table public.webhook_events drop column if exists provider_status;
alter table public.webhook_events drop column if exists provider_operation;
alter table public.webhook_events drop column if exists provider_transaction_id;
alter table public.webhook_events drop column if exists payment_intent_id;

alter table public.payouts drop column if exists payment_intent_id;
alter table public.payouts drop column if exists approval_idempotency_key;

alter table public.order_splits drop column if exists payment_intent_id;
alter table public.order_splits drop column if exists fx_rate;

alter table public.invoices drop column if exists fx_rate;

-- 4. Drop the financial-backbone tables created by this migration
drop table if exists public.audit_log cascade;
drop table if exists public.entitlements cascade;
drop table if exists public.financial_ledger cascade;
drop table if exists public.refunds cascade;
drop table if exists public.payment_intents cascade;
drop table if exists public.order_splits cascade;
drop table if exists public.payouts cascade;
drop table if exists public.split_rules cascade;
drop table if exists public.beneficiaries cascade;
