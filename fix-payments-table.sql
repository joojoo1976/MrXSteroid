
-- ═══════════════════════════════════════════════════════════════════════════
-- FIX 1: Add spaceremit_code column if missing
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'payments'
        AND column_name = 'spaceremit_code'
    ) THEN
        ALTER TABLE public.payments
        ADD COLUMN spaceremit_code TEXT;
        
        -- Add index for faster lookups
        CREATE INDEX idx_payments_spaceremit_code ON public.payments(spaceremit_code);
        
        RAISE NOTICE 'Added spaceremit_code column to payments table';
    ELSE
        RAISE NOTICE 'spaceremit_code column already exists';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIX 2: Add amount_currency column if missing
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'payments'
        AND column_name = 'amount_currency'
    ) THEN
        ALTER TABLE public.payments
        ADD COLUMN amount_currency VARCHAR(3) DEFAULT 'USD';
        
        RAISE NOTICE 'Added amount_currency column to payments table';
    ELSE
        RAISE NOTICE 'amount_currency column already exists';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIX 3: Update RLS Policies to allow anonymous users to create payments
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

-- Create new policy that allows anyone to INSERT (for guest checkout)
CREATE POLICY "Anyone can create payment records" ON public.payments
    FOR INSERT
    WITH CHECK (true);

-- Allow users to view their own payments (authenticated)
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR
        customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Allow service role full access (for webhooks)
DROP POLICY IF EXISTS "Service role full access" ON public.payments;
CREATE POLICY "Service role full access" ON public.payments
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
-- FIX 4: Ensure proper grants for anonymous users
-- ═══════════════════════════════════════════════════════════════════════════

-- Grant insert to anon for guest checkout
GRANT INSERT ON public.payments TO anon;
GRANT SELECT ON public.payments TO anon;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION: Check the fixes
-- ═══════════════════════════════════════════════════════════════════════════

-- List all columns in payments table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payments'
ORDER BY ordinal_position;

-- List all RLS policies
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'payments';

