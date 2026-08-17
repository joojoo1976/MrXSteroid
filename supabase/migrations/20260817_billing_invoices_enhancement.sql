-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Enhanced Invoices & Billing Schema with Full Indexes & RLS
-- Date: 2026-08-17
-- ═══════════════════════════════════════════════════════════════════════════

-- Ensure invoices table exists and has all required billing columns
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    gateway VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    tier_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    gateway_reference_id VARCHAR(255),
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    phone_number VARCHAR(50),
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    promo_code VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure profiles table has subscription columns
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS Policies for Invoices
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop old policies if they exist to prevent duplicates
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can read own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Service role can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Service role can update invoices" ON public.invoices;

-- Users can only view their own invoices (or matching their authenticated email)
CREATE POLICY "Users can view own invoices"
    ON public.invoices
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR (auth.jwt() ->> 'email' = customer_email)
    );

-- Backend service role has full access
CREATE POLICY "Service role can insert invoices"
    ON public.invoices
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can update invoices"
    ON public.invoices
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- Indexes for Maximum Query Speed & Idempotency
-- ═══════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_gateway_ref ON public.invoices(gateway_reference_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON public.invoices(customer_email);
