-- ═══════════════════════════════════════════════════════════════════════════
-- InstaPay Manual Payment System Migration
-- Creates tables for manual payment review workflow (InstaPay receipts)
-- Integrates with existing orders/invoices/payment_intents architecture
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PAYMENT RECEIPTS TABLE
-- Stores uploaded receipts for manual verification (InstaPay, bank transfers)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Link to existing payment architecture
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    invoice_id TEXT, -- External invoice reference
    payment_intent_id TEXT, -- External payment intent reference

    -- Customer information
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,

    -- Transaction details
    transaction_reference TEXT, -- Customer-provided transaction ref
    payment_method TEXT NOT NULL CHECK (payment_method IN ('instapay', 'bank_transfer', 'manual')),
    amount DECIMAL(12,2) NOT NULL, -- Server-calculated amount
    currency TEXT NOT NULL DEFAULT 'EGP' CHECK (currency IN ('EGP', 'USD')),

    -- Receipt file storage
    receipt_url TEXT NOT NULL, -- Supabase Storage URL
    receipt_filename TEXT NOT NULL,
    receipt_mime_type TEXT,
    receipt_size_bytes INTEGER,

    -- Review workflow
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (
        status IN (
            'pending_review',
            'under_review',
            'verified',
            'rejected',
            'expired'
        )
    ),

    -- Admin actions
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    rejection_reason TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Prevent duplicate transaction refs
    CONSTRAINT unique_transaction_ref UNIQUE (transaction_reference, payment_method)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. INDEXES for Performance
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payment_receipts_order_id ON public.payment_receipts(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_status ON public.payment_receipts(status);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_created_at ON public.payment_receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_customer_email ON public.payment_receipts(customer_email);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_payment_method ON public.payment_receipts(payment_method);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER set_payment_receipts_updated_at
    BEFORE UPDATE ON public.payment_receipts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- Admins can view all receipts
CREATE POLICY "Admins view all payment receipts"
    ON public.payment_receipts
    FOR SELECT
    USING (public.is_admin());

-- Admins can update receipt status (approve/reject)
CREATE POLICY "Admins update payment receipts"
    ON public.payment_receipts
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Users can view their own receipts
CREATE POLICY "Users view own payment receipts"
    ON public.payment_receipts
    FOR SELECT
    USING (
        customer_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
        OR
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payment_receipts.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Service role can insert (from API)
CREATE POLICY "Service role inserts payment receipts"
    ON public.payment_receipts
    FOR INSERT
    WITH CHECK (true); -- Controlled by service role key in API

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. INSTAPAY CONFIGURATION TABLE (Optional - for admin management)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.instapay_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default InstaPay handle (can be updated from admin panel)
INSERT INTO public.instapay_config (key, value, description)
VALUES
    ('instapay_handle', 'jan.ghattas@instapay', 'InstaPay IPA handle for receiving payments'),
    ('instapay_display_name', 'جان غطاس', 'Display name for InstaPay account')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.instapay_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read config (public)
CREATE POLICY "Anyone reads instapay config"
    ON public.instapay_config
    FOR SELECT
    USING (true);

-- Only admins can update
CREATE POLICY "Admins update instapay config"
    ON public.instapay_config
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ADD MANUAL PAYMENT STATUS TO EXISTING ORDERS (if needed)
-- ─────────────────────────────────────────────────────────────────────────────
-- Check if status constraint exists and update it
DO $$
BEGIN
    -- Add 'pending_manual_review' to orders.status if not exists
    ALTER TABLE public.orders
    DROP CONSTRAINT IF EXISTS orders_status_check;

    ALTER TABLE public.orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN (
        'pending',
        'pending_manual_review',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
    ));
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Orders status constraint update skipped or already exists';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS for Documentation
-- ═══════════════════════════════════════════════════════════════════════════
COMMENT ON TABLE public.payment_receipts IS 'Manual payment receipts for InstaPay and bank transfers requiring admin verification';
COMMENT ON COLUMN public.payment_receipts.status IS 'pending_review: awaiting admin, under_review: admin reviewing, verified: approved and payment confirmed, rejected: invalid receipt, expired: review timeout';
COMMENT ON TABLE public.instapay_config IS 'InstaPay configuration settings manageable from admin panel';
