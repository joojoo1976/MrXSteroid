/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FIX PAYMENTS TABLE - RLS POLICIES & SCHEMA
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This script helps fix the payments table issues:
 * 1. Missing spaceremit_code column
 * 2. RLS policies blocking inserts
 * 
 * Run this in Supabase SQL Editor: https://app.supabase.com/project/alghvtpkpspnqupbvodu/sql
 */

const fs = require('fs');
const path = require('path');

const sqlFix = `
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

`;

// Write SQL file
const sqlPath = path.join(__dirname, 'fix-payments-table.sql');
fs.writeFileSync(sqlPath, sqlFix, 'utf8');

console.log('═══════════════════════════════════════════════════════════════════════');
console.log('       PAYMENTS TABLE FIX GENERATED');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');
console.log('📝 Instructions:');
console.log('');
console.log('1. Go to Supabase SQL Editor:');
console.log('   https://app.supabase.com/project/alghvtpkpspnqupbvodu/sql');
console.log('');
console.log('2. Copy and paste the SQL from: fix-payments-table.sql');
console.log('');
console.log('3. Click "Run" to execute the fixes');
console.log('');
console.log('4. Verify the fixes worked by running the test again:');
console.log('   node test-both-flows.cjs');
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');
console.log('📋 What this fixes:');
console.log('   ✓ Adds missing spaceremit_code column');
console.log('   ✓ Adds missing amount_currency column');
console.log('   ✓ Fixes RLS policies to allow guest checkout');
console.log('   ✓ Grants proper permissions for anonymous users');
console.log('');
