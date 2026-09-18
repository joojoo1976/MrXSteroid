-- ==============================================================================
-- MIGRATION: 20260917240000_phase3_final_gate_v5_1_post_verify_fixes.sql
-- PURPOSE: Non-destructive corrections surfaced by the Supabase security and
--          performance advisors immediately after applying
--          20260917150000_phase3_final_gate_v5_1_backbone.sql.
--
--          findings addressed:
--          1. security_definer_view (ERROR) -> v_order_splits_refunded now uses
--             security_invoker, matching the project standard
--             (20260809052518_switch_role_checks_to_security_invoker).
--          2. duplicate_index (WARN) -> idx_webhook_events_tx duplicated the
--             pre-existing idx_webhook_events_transaction_id.
--          3. auth_rls_initplan (WARN) -> entitlements read-own policy now wraps
--             auth.uid() in a scalar subselect.
--          4. unindexed_foreign_keys (INFO) -> covering indexes for the FKs
--             added by the backbone migration.
--
--          Additive/idempotent; reversible.
-- ==============================================================================

-- 1. Security definer view -> invoker semantics
alter view public.v_order_splits_refunded set (security_invoker = true);

-- 2. Remove the duplicate transaction_id index (keep the pre-existing one)
drop index if exists public.idx_webhook_events_tx;
create index if not exists idx_webhook_events_transaction_id
    on public.webhook_events(transaction_id);

-- 3. RLS initplan: wrap auth.uid() in a scalar subselect
alter policy "Entitlements: users read own" on public.entitlements
    using ((select auth.uid()) = user_id);

-- 4. Covering indexes for the FK columns added by the backbone migration
create index if not exists idx_order_splits_payment_intent
    on public.order_splits(payment_intent_id);
create index if not exists idx_payouts_payment_intent
    on public.payouts(payment_intent_id);
create index if not exists idx_entitlements_payment_intent
    on public.entitlements(payment_intent_id);
create index if not exists idx_payment_intents_supersedes
    on public.payment_intents(supersedes_payment_intent_id);
create index if not exists idx_financial_ledger_original_journal
    on public.financial_ledger(original_journal_entry_id);
