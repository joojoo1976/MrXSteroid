-- Migration: Add avatar_url column to profiles table
-- Date: 2026-02-20
-- Purpose: Store user avatar URL for OAuth and Gravatar integration

-- 1. Add avatar_url column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Update the handle_new_user trigger to capture avatar from OAuth providers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, user_name, avatar_url, currency, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'fullName',
            NEW.raw_user_meta_data->>'name'
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'user_name',
            NEW.raw_user_meta_data->>'username',
            NEW.raw_user_meta_data->>'preferred_username'
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture'
        ),
        COALESCE(NEW.raw_user_meta_data->>'currency', 'USD'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        user_name = COALESCE(EXCLUDED.user_name, public.profiles.user_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 3. Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
