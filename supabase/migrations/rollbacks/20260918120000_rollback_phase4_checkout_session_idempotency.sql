-- Rollback — Phase 4 checkout session idempotency + session linkage.
DROP INDEX IF EXISTS public.idx_invoices_idempotency_key;

ALTER TABLE public.invoices
    DROP COLUMN IF EXISTS kashier_session_url,
    DROP COLUMN IF EXISTS kashier_session_id,
    DROP COLUMN IF EXISTS idempotency_key;
