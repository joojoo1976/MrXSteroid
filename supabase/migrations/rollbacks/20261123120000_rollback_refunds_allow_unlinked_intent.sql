-- =============================================================================
-- ROLLBACK: 20261123120000_refunds_allow_unlinked_intent.sql
--
-- Restores `refunds.payment_intent_id` NOT NULL.
--
-- ORDER MATTERS: this will FAIL (correctly) while any refund row has a NULL
-- intent. Resolve those rows first — either by linking the real intent they
-- belong to, or by archiving them — because silently deleting/back-filling them
-- would destroy the exact audit evidence the relaxation was introduced to keep.
-- Verify before running:
--
--   select count(*) from public.refunds where payment_intent_id is null;
--
-- Then:
-- =============================================================================

alter table public.refunds
    alter column payment_intent_id set not null;
