-- ═══════════════════════════════════════════════════════════════════════════
--  PHASE 4 — CHECKOUT PAYMENT SESSION: IDEMPOTENCY + SESSION LINKAGE
--  Final Gate v5.1 §12 (Checkout Idempotency) · K-2 C5 (unique order ref /
--  ERR_ORD_02) · K-2 C6 (per-request serverWebhook destination).
--
--  Additive & backwards-compatible: adds nullable columns + a partial unique
--  index. Existing invoice rows and legacy flows are unaffected.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.invoices
    ADD COLUMN IF NOT EXISTS idempotency_key    text,
    ADD COLUMN IF NOT EXISTS kashier_session_id text,
    ADD COLUMN IF NOT EXISTS kashier_session_url text;

-- §12: DB unique index guarantees a repeated identical checkout request returns
-- the prior session/invoice instead of creating a duplicate PaymentIntent.
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_idempotency_key
    ON public.invoices (idempotency_key)
    WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN public.invoices.idempotency_key IS
    'Checkout Idempotency-Key (v5.1 §12). Repeated identical requests return the prior session; never a duplicate PaymentIntent.';
COMMENT ON COLUMN public.invoices.kashier_session_id IS
    'Kashier v3 Payment Session id (POST /v3/payment/sessions).';
COMMENT ON COLUMN public.invoices.kashier_session_url IS
    'Kashier hosted checkout session URL — the PRIMARY ecommerce checkout path (v5.1 §35–§36).';
