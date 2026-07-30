-- ═══════════════════════════════════════════════════════════════════════════
-- MR. X STEROID - FINAL UNIFIED AUTH SCHEMA
-- Version: 2.1.0
-- Date: 2026-07-30
-- Purpose: Complete profiles table, trigger, RLS, and helper functions
--          + Phone number unique field support + Dual Email/Phone login helper
-- 
-- HOW TO USE:
--   1. Go to Supabase Dashboard > SQL Editor
--   2. Paste this ENTIRE file
--   3. Click "Run"
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. PROFILES TABLE (Complete with all columns)
-- ─────────────────────────────────────────────
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    phone_number TEXT UNIQUE,
    full_name TEXT,
    user_name TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'representative')),
    subscription_status TEXT DEFAULT 'inactive',
    subscription_tier VARCHAR(50) DEFAULT 'none',
    has_paid BOOLEAN DEFAULT false,
    plan_tier VARCHAR(50) DEFAULT 'none',
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    card_last_four TEXT,
    card_brand TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add columns if table already exists (safe incremental)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_paid BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(50) DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS card_last_four TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS card_brand TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add UNIQUE constraint on phone_number (only for non-NULL values)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_phone_number_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_number_unique UNIQUE (phone_number);
  END IF;
END $$;

-- 2. TRIGGER FUNCTION: Auto-create profile on signup
-- ───────────────────────────────────────────────────
-- SECURITY DEFINER: Runs with owner privileges (bypasses RLS)
-- ON CONFLICT: Handles edge case where profile might already exist

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, phone_number, full_name, user_name, avatar_url, currency, role)
    VALUES (
        NEW.id,
        NEW.email,
        NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'phone_number', '')), ''),
        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name',
            NEW.raw_user_meta_data ->> 'fullName',
            NEW.raw_user_meta_data ->> 'name'
        ),
        COALESCE(
            NEW.raw_user_meta_data ->> 'user_name',
            NEW.raw_user_meta_data ->> 'username',
            NEW.raw_user_meta_data ->> 'preferred_username'
        ),
        COALESCE(
            NEW.raw_user_meta_data ->> 'avatar_url',
            NEW.raw_user_meta_data ->> 'picture'
        ),
        COALESCE(NEW.raw_user_meta_data ->> 'currency', 'USD'),
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'user')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name    = COALESCE(EXCLUDED.full_name,    public.profiles.full_name),
        user_name    = COALESCE(EXCLUDED.user_name,    public.profiles.user_name),
        avatar_url   = COALESCE(EXCLUDED.avatar_url,   public.profiles.avatar_url),
        email        = COALESCE(EXCLUDED.email,        public.profiles.email),
        phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
        updated_at   = NOW();
    RETURN NEW;
END;
$$;

-- 3. ATTACH TRIGGER
-- ─────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. UPDATED_AT TRIGGER FUNCTION
-- ───────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. RBAC HELPER FUNCTIONS (Recursion-Safe)
-- ────────────────────────────────────────────
-- JWT-first check: avoids querying profiles table when possible,
-- preventing infinite recursion in RLS policies.
-- SECURITY DEFINER: runs as function owner, bypasses RLS.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    coalesce(auth.jwt() ->> 'role', '') = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_representative()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    coalesce(auth.jwt() ->> 'role', '') = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'representative'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ROW LEVEL SECURITY (RLS)
-- ───────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner or admin" ON public.profiles;
DROP POLICY IF EXISTS "Admin CRUD profiles" ON public.profiles;

-- SELECT: User can read own profile, Admin can read all
CREATE POLICY "profiles_select_own_or_admin"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

-- INSERT: Only the trigger (SECURITY DEFINER) and service_role can insert
-- This policy allows authenticated users to insert their own profile
-- (needed for edge cases like OAuth where trigger might not fire)
CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- UPDATE: User can update own profile
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- DELETE: Only admins can delete profiles
CREATE POLICY "profiles_delete_admin_only"
    ON public.profiles FOR DELETE
    USING (public.is_admin());

-- 7. PERMISSIONS
-- ──────────────
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 8. BACKFILL: Create profiles for existing auth.users without profiles
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO public.profiles (id, email, full_name, role, currency)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'name'),
    COALESCE(au.raw_user_meta_data ->> 'role', 'user'),
    'USD'
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 9. INDEXES for performance
-- ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_name ON public.profiles(user_name);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_number
    ON public.profiles(phone_number)
    WHERE phone_number IS NOT NULL;

-- 9b. DUAL AUTH HELPER: Resolve email from phone_number for signIn
-- ────────────────────────────────────────────────────────────────
-- Usage: SELECT public.get_email_by_phone('+966500000000');
CREATE OR REPLACE FUNCTION public.get_email_by_phone(p_phone TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT email FROM public.profiles
    WHERE phone_number = TRIM(p_phone)
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_phone(TEXT) TO authenticated, anon;

-- 10. STORAGE BUCKETS
-- ────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true), ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Avatars public read" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Products public read" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload products" ON storage.objects;

CREATE POLICY "Avatars public read" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Products public read" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Admin upload products" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'products'
        AND public.is_admin()
    );

-- 11. TABLE COMMENT
-- ─────────────────
COMMENT ON TABLE public.profiles IS 'Extended user data synchronized with Supabase Auth v2.0';

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERY (Run separately to check)
-- ═══════════════════════════════════════════════════════════════════════════
-- SELECT 
--     column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'profiles'
-- ORDER BY ordinal_position;
--
-- SELECT trigger_name, event_manipulation, action_statement
-- FROM information_schema.triggers
-- WHERE event_object_table = 'users' AND trigger_schema = 'auth';
--
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'profiles' AND schemaname = 'public';
