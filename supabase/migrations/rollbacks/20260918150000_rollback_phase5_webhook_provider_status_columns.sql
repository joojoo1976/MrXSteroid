-- Rollback — Phase 5 webhook provider_status persistence columns.
DROP INDEX IF EXISTS public.idx_payment_intents_provider_txn;

ALTER TABLE public.payment_intents
    DROP COLUMN IF EXISTS provider_transaction_id,
    DROP COLUMN IF EXISTS provider_status;