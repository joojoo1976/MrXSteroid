-- ═══════════════════════════════════════════════════════════════════════════
-- 🔐 MR. X STEROID - SUPABASE DATABASE SETUP
-- Run this script in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE (Auto-created via Supabase Auth trigger)
-- ─────────────────────────────────────────────────────────────────────────────

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    user_name TEXT UNIQUE,
    avatar_url TEXT,
    subscription_status TEXT DEFAULT 'free',
    has_paid BOOLEAN DEFAULT FALSE,
    plan_tier TEXT DEFAULT 'free',
    role TEXT DEFAULT 'user',
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_user_name_idx ON public.profiles(user_name);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PAYMENTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_id TEXT,
    spaceremit_code TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    product_id TEXT,
    product_name TEXT,
    customer_email TEXT,
    customer_name TEXT,
    metadata JSONB DEFAULT '{}',
    error_message TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id OR customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Service role can manage all payments" ON public.payments
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS payments_transaction_id_idx ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_customer_email_idx ON public.payments(customer_email);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. SUBSCRIPTIONS TABLE (Optional for recurring payments)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    product_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. AUTO-CREATE PROFILE TRIGGER (When user signs up)
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, user_name, currency, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data ->> 'user_name', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data ->> 'currency', 'USD'),
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'user')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. FUNCTION TO UPDATE HAS_PAID AFTER PAYMENT
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_has_paid_after_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- When payment is completed, update has_paid to true
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update profile if user_id exists
        IF NEW.user_id IS NOT NULL THEN
            UPDATE public.profiles
            SET has_paid = TRUE,
                subscription_status = 'active',
                plan_tier = COALESCE(NEW.product_id, 'premium'),
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
        
        -- Also try to update by email if user_id is null
        IF NEW.user_id IS NULL AND NEW.customer_email IS NOT NULL THEN
            UPDATE public.profiles
            SET has_paid = TRUE,
                subscription_status = 'active',
                plan_tier = COALESCE(NEW.product_id, 'premium'),
                updated_at = NOW()
            WHERE email = NEW.customer_email;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_payment_completed ON public.payments;

-- Create trigger
CREATE TRIGGER on_payment_completed
    AFTER UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_has_paid_after_payment();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. UPDATED_AT TRIGGER FUNCTION
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Apply to payments
DROP TRIGGER IF EXISTS payments_updated_at ON public.payments;
CREATE TRIGGER payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. GRANT PERMISSIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;

-- Grant permissions to anon users (for guest checkout)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT INSERT ON public.payments TO anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. VERIFY SETUP
-- ─────────────────────────────────────────────────────────────────────────────

-- Run this to verify tables exist
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'payments', 'subscriptions');

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ SETUP COMPLETE!
-- After running this script:
-- 1. Users will auto-get a profile when they sign up
-- 2. has_paid will auto-update when payment completes
-- 3. All RLS policies are in place for security
-- ═══════════════════════════════════════════════════════════════════════════
