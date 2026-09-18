-- ═══════════════════════════════════════════════════════════════════════════
--  PHASE 4 — RESTORE MISSING INVOICES CHECKOUT/BILLING COLUMNS
--
--  FINDING: `app/api/payments/create-invoice/route.ts` inserts
--  customer_email, customer_name, phone_number, shipping_cost,
--  discount_amount, promo_code and metadata. These columns are declared in
--  `supabase/migrations_prebaseline/20260817_billing_invoices_enhancement.sql`
--  but that baseline is NOT tracked/applied by the Supabase CLI, so the live
--  project is missing them. Every checkout insert therefore fails with a
--  PostgREST "column does not exist" error (latest invoice row: 2026-08-23).
--
--  Additive & idempotent: restores the intended baseline columns so the
--  primary checkout path can persist invoices again. No data is modified.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.invoices
    ADD COLUMN IF NOT EXISTS customer_email  varchar(255),
    ADD COLUMN IF NOT EXISTS customer_name   varchar(255),
    ADD COLUMN IF NOT EXISTS phone_number    varchar(50),
    ADD COLUMN IF NOT EXISTS shipping_cost   numeric(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS promo_code      varchar(100),
    ADD COLUMN IF NOT EXISTS metadata        jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_invoices_customer_email
    ON public.invoices (customer_email);
