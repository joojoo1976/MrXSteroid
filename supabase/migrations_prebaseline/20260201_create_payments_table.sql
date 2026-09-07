-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  💳 MR. X STEROID - PAYMENTS TABLE SCHEMA                                ║
-- ║  Enterprise-Grade Payment Records with Row Level Security                ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════
--                           CREATE PAYMENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.payments (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction Identifiers
    transaction_id TEXT UNIQUE NOT NULL,
    spaceremit_code TEXT,
    order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    
    -- User Reference (nullable for guest checkouts)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Payment Details
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Product Information
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    
    -- Customer Information
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    
    -- Metadata & Error Handling
    metadata JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    
    -- Indexes for common queries
    CONSTRAINT payments_positive_amount CHECK (amount > 0)
);

-- ═══════════════════════════════════════════════════════════════════════════
--                              CREATE INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

-- Transaction lookup (most common)
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);

-- User payment history
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id) WHERE user_id IS NOT NULL;

-- Order relation
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id) WHERE order_id IS NOT NULL;

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Composite index for common admin queries
CREATE INDEX IF NOT EXISTS idx_payments_status_date ON public.payments(status, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
--                         ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR 
        customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Policy: Service role can do everything (for webhook handlers)
CREATE POLICY "Service role full access" ON public.payments
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Authenticated users can insert their own payment records
CREATE POLICY "Users can create own payments" ON public.payments
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        OR 
        user_id IS NULL -- Allow guest checkouts
    );

-- Policy: Users cannot update/delete payments (immutable records)
-- Only service role can update via webhooks

-- ═══════════════════════════════════════════════════════════════════════════
--                        AUTO-UPDATE TIMESTAMP TRIGGER
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_updated_at_trigger
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
--                     UPDATE PROFILES TABLE (Add columns if missing)
-- ═══════════════════════════════════════════════════════════════════════════

-- Ensure subscription_status column exists with proper default
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'inactive';
    END IF;
END $$;

-- Add updated_at column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
--                         PAYMENT ANALYTICS VIEW
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.payment_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    status,
    currency,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount
FROM public.payments
GROUP BY DATE_TRUNC('day', created_at), status, currency
ORDER BY date DESC;

-- ═══════════════════════════════════════════════════════════════════════════
--                              GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Grant usage to authenticated users
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT SELECT ON public.payment_analytics TO authenticated;

-- Grant all to service role
GRANT ALL ON public.payments TO service_role;
GRANT ALL ON public.payment_analytics TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════
--                              COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.payments IS 'سجلات المدفوعات - Payment transaction records from SpaceRemit gateway';
COMMENT ON COLUMN public.payments.transaction_id IS 'معرف المعاملة الداخلي - Internal reference ID';
COMMENT ON COLUMN public.payments.spaceremit_code IS 'كود SpaceRemit للتحقق - SpaceRemit verification code';
COMMENT ON COLUMN public.payments.status IS 'حالة الدفع - Payment status: pending, processing, completed, failed, cancelled, refunded';
