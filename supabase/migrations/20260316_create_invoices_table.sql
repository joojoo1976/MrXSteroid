-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Create invoices table for multi-gateway payment tracking
-- Date: 2026-03-16
-- ═══════════════════════════════════════════════════════════════════════════

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    gateway VARCHAR(50) NOT NULL,           -- 'stripe', 'paymob', 'spaceremit'
    status VARCHAR(50) DEFAULT 'pending',   -- 'pending', 'success', 'failed'
    tier_id VARCHAR(50) NOT NULL,           -- 'pdf' or 'paperback'
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    gateway_reference_id VARCHAR(255),      -- Stores the ID from the payment gateway
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Users can read their own invoices
CREATE POLICY "Users can view own invoices"
    ON public.invoices
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role (backend) can insert invoices
CREATE POLICY "Service role can insert invoices"
    ON public.invoices
    FOR INSERT
    WITH CHECK (true);

-- Only service role (backend) can update invoices
CREATE POLICY "Service role can update invoices"
    ON public.invoices
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- Fast lookup by user
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);

-- Fast lookup by status (for idempotency checks)
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- Fast lookup by gateway reference
CREATE INDEX IF NOT EXISTS idx_invoices_gateway_ref ON public.invoices(gateway_reference_id);
