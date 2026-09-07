-- Final SQL Migration: Centralized Profile Sync & Payment Readiness
-- Date: 2026-02-14
-- 1. Consolidate profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    user_name TEXT UNIQUE,
    subscription_status TEXT DEFAULT 'inactive',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'delegate', 'admin')),
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- 3. RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR
SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR
UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR
INSERT WITH CHECK (auth.uid() = id);
-- 4. Trigger Function for Synchronization
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN
INSERT INTO public.profiles (id, email, full_name, user_name, currency, role)
VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'fullName'
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'user_name',
            NEW.raw_user_meta_data->>'username'
        ),
        COALESCE(NEW.raw_user_meta_data->>'currency', 'USD'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
RETURN NEW;
END;
$$;
-- 5. Attach Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- 6. Permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
-- 7. Ensure consistency for existing users (Backfill if necessary)
INSERT INTO public.profiles (id, email, role, currency)
SELECT id,
    email,
    'user',
    'USD'
FROM auth.users ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    currency = COALESCE(public.profiles.currency, 'USD');
COMMENT ON TABLE public.profiles IS 'Extended user data synchronized with Supabase Auth.';