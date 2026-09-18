-- Rollback — Phase 4 restore of missing invoices checkout/billing columns.
DROP INDEX IF EXISTS public.idx_invoices_customer_email;

ALTER TABLE public.invoices
    DROP COLUMN IF EXISTS metadata,
    DROP COLUMN IF EXISTS promo_code,
    DROP COLUMN IF EXISTS discount_amount,
    DROP COLUMN IF EXISTS shipping_cost,
    DROP COLUMN IF EXISTS phone_number,
    DROP COLUMN IF EXISTS customer_name,
    DROP COLUMN IF EXISTS customer_email;
