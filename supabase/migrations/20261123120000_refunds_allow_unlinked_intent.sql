-- =============================================================================
-- MIGRATION: 20261123120000_refunds_allow_unlinked_intent.sql
-- PURPOSE:   Record provider refunds that have no `payment_intents` row.
--
-- WHY
-- ---
-- `refunds.payment_intent_id` was NOT NULL. Three collection paths never create
-- an intent row (Stripe-embedded, Paymob, SpaceRemit), so a genuine provider
-- refund on those invoices could not be persisted at all: the webhook had to be
-- acknowledged as `skipped / refund_unlinked`, leaving money the provider says
-- it returned with no refund-domain record (and no access revocation).
--
-- Relaxing the column lets the refund be recorded against the invoice alone and
-- keeps the honest signal in `webhook_events.processing_status`
-- (`refund_recorded_unlinked`) for reconciliation.
--
-- SAFETY & GOVERNANCE
--   - NOT destructive: a single `DROP NOT NULL`. No column/table/index is
--     dropped, renamed or rewritten, and no row is touched.
--   - Existing rows are unaffected (all currently satisfy the old constraint).
--   - `invoice_id` stays NOT NULL: a refund always belongs to an invoice.
--   - Additive reads: the ledger/split/entitlement code tolerates a null intent
--     because it resolves bytes from the invoice, not from this column.
--   - Idempotent: `DROP NOT NULL` on an already-nullable column is a no-op.
--
-- ROLLBACK
--   supabase/migrations/rollbacks/20261123120000_rollback_refunds_allow_unlinked_intent.sql
--   (restoring NOT NULL fails while unlinked rows exist — they must be resolved
--    first; the rollback says so explicitly.)
-- =============================================================================

alter table public.refunds
    alter column payment_intent_id drop not null;

comment on column public.refunds.payment_intent_id is
    'The captured attempt this refund belongs to. NULL = provider-originated '
    'refund whose collection path created no payment_intents row '
    '(Stripe-embedded / Paymob / SpaceRemit). Never invent an intent to fill it.';
