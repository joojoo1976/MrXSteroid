-- ═══════════════════════════════════════════════════════════════════════════
--  PHASE 5 — WEBHOOK PROVIDER_STATUS PERSISTENCE (C7)
--
--  The Kashier webhook handler (server/payments/webhook.ts) records incoming
--  events into `webhook_events` and now must ALSO:
--   1) persist the provider's own status string (C7 de-dupe key component:
--      `{transactionId}::{webhookUrl}::{status}`) + transaction id onto the
--      PaymentIntent that the webhook confirms, and
--   2) support the late-arrival quarantine rule (spec §10) by keeping the
--      provider signal on the intent regardless of whether the invoice can
--      be mutated.
--
--  `webhook_events` already carries `provider_status` / `provider_transaction_id`
--  (Phase 3 backbone). These columns are ADDED to `payment_intents` so the
--  intent row mirrors the provider verdict. Additive & idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.payment_intents
    ADD COLUMN IF NOT EXISTS provider_status text,
    ADD COLUMN IF NOT EXISTS provider_transaction_id text;

COMMENT ON COLUMN public.payment_intents.provider_status IS
    'Phase 5 (C7): provider-reported status string from the webhook (e.g. APPROVED / DECLINED / ORDER_PAID_BEFORE). Voice of the provider on this attempt.';
COMMENT ON COLUMN public.payment_intents.provider_transaction_id IS
    'Phase 5 (C7): provider transaction id reported by the webhook for this attempt.';

CREATE INDEX IF NOT EXISTS idx_payment_intents_provider_txn
    ON public.payment_intents (provider, provider_transaction_id)
    WHERE provider_transaction_id IS NOT NULL;