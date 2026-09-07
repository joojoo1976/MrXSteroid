-- Migration: Fix Missing Columns in Profiles Table
-- Date: 2026-02-20
-- Purpose: Add missing 'role' column and ensure all required fields exist

-- 1. Add role column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'delegate', 'admin'));

-- 2. Add subscription_status column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- 3. Ensure updated_at column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Add index on user_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_name ON public.profiles(user_name);

-- 5. Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 6. Update existing profiles with default values
UPDATE public.profiles 
SET role = COALESCE(role, 'user'),
    subscription_status = COALESCE(subscription_status, 'inactive'),
    updated_at = COALESCE(updated_at, NOW());

-- 7. Add comment for documentation
COMMENT ON TABLE public.profiles IS 'Extended user data synchronized with Supabase Auth. Contains profile information including avatar, subscription status, and role.';

-- 8. Verify the schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
