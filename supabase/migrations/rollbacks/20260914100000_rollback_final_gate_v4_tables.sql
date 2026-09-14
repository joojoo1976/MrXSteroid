-- ==============================================================================
-- ROLLBACK SCRIPT: 20260914100000_rollback_final_gate_v4_tables.sql
-- PURPOSE: Rollback Final Gate v4 schema changes cleanly if needed (F-8 / N-14)
-- ==============================================================================

-- 1. Drop Derived View
drop view if exists public.v_order_splits_refunded;

-- 2. Drop New Tables
drop table if exists public.audit_log cascade;
drop table if exists public.entitlements cascade;
drop table if exists public.financial_ledger cascade;
drop table if exists public.refunds cascade;
drop table if exists public.payment_intents cascade;

-- 3. Remove Added Columns on Existing Tables
do $$ begin
    alter table public.webhook_events drop column if exists provider_operation;
    alter table public.webhook_events drop column if exists provider_transaction_id;
    alter table public.webhook_events drop column if exists payment_intent_id;

    alter table public.payouts drop column if exists payment_intent_id;
    alter table public.payouts drop column if exists approval_idempotency_key;

    alter table public.order_splits drop column if exists payment_intent_id;
    alter table public.order_splits drop column if exists fx_rate;

    alter table public.invoices drop column if exists fx_rate;
exception when others then null; end $$;
