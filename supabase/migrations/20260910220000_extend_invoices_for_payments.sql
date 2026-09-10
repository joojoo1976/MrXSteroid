-- ============================================================
-- Extend invoices table: payment_status, affiliate attribution,
-- Kashier fields, region, merchant tracking
-- ============================================================

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_provider_merchant text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_status text default 'pending';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS attribution_timestamp timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS attribution_expires_at timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS refunded_at timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS kashier_order_id text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS kashier_transaction_id text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS product_name_snapshot text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS attribution_source text;

-- Add payment_status check constraint idempotently
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'invoices_payment_status_check'
    ) THEN
        ALTER TABLE public.invoices
            ADD CONSTRAINT invoices_payment_status_check
            CHECK (payment_status IN ('pending','paid','failed','cancelled','refunded','partially_refunded','unknown','initiated'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON public.invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_referral_code ON public.invoices(referral_code);
CREATE INDEX IF NOT EXISTS idx_invoices_paid_at ON public.invoices(paid_at);
CREATE INDEX IF NOT EXISTS idx_invoices_region ON public.invoices(region);