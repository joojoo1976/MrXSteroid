-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  💳 MR. X STEROID - PAYMENT ENHANCEMENTS                                 ║
-- ║  Add support for embedded card payments and enhanced tracking            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════
--                    ADD PAYMENT METHOD COLUMN TO PAYMENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

-- Add payment_method column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'payments'
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE public.payments
        ADD COLUMN payment_method VARCHAR(20) DEFAULT 'redirect'
        CHECK (payment_method IN ('redirect', 'embedded_card', 'apple_pay', 'google_pay'));
        
        -- Add comment
        COMMENT ON COLUMN public.payments.payment_method IS 'طريقة الدفع - Payment method: redirect, embedded_card, apple_pay, google_pay';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
--                    ADD CARD LAST FOUR DIGITS COLUMN
-- ═══════════════════════════════════════════════════════════════════════════

-- Add card_last_four column for displaying last 4 digits (PCI compliant)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'payments'
        AND column_name = 'card_last_four'
    ) THEN
        ALTER TABLE public.payments
        ADD COLUMN card_last_four VARCHAR(4);
        
        -- Add comment
        COMMENT ON COLUMN public.payments.card_last_four IS 'آخر 4 أرقام من البطاقة - Last 4 digits of card (PCI compliant)';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
--                    ADD CARD BRAND COLUMN
-- ═══════════════════════════════════════════════════════════════════════════

-- Add card_brand column for card network (Visa, Mastercard, etc.)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'payments'
        AND column_name = 'card_brand'
    ) THEN
        ALTER TABLE public.payments
        ADD COLUMN card_brand VARCHAR(20);
        
        -- Add comment
        COMMENT ON COLUMN public.payments.card_brand IS 'نوع البطاقة - Card brand: Visa, Mastercard, Mada, etc.';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
--                    ADD INDEX FOR PAYMENT METHOD QUERIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Create index for payment method filtering
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON public.payments(payment_method);

-- ═══════════════════════════════════════════════════════════════════════════
--                    UPDATE METADATA COLUMN COMMENT
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON COLUMN public.payments.metadata IS 'بيانات إضافية للدفع - Additional payment data including form data, shipping, promo codes, and card details (non-sensitive)';

-- ═══════════════════════════════════════════════════════════════════════════
--                    CREATE VIEW FOR PAYMENT ANALYTICS WITH METHOD
-- ═══════════════════════════════════════════════════════════════════════════

-- Create or replace view with payment method breakdown
CREATE OR REPLACE VIEW public.payment_analytics_enhanced AS
SELECT
    DATE_TRUNC('day', created_at) as date,
    status,
    currency,
    payment_method,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount
FROM public.payments
GROUP BY DATE_TRUNC('day', created_at), status, currency, payment_method
ORDER BY date DESC;

-- ═══════════════════════════════════════════════════════════════════════════
--                    GRANT PERMISSIONS ON NEW VIEW
-- ═══════════════════════════════════════════════════════════════════════════

GRANT SELECT ON public.payment_analytics_enhanced TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
--                    COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON VIEW public.payment_analytics_enhanced IS 'إحصائيات الدفع المحسّنة - Enhanced payment analytics with payment method breakdown';
