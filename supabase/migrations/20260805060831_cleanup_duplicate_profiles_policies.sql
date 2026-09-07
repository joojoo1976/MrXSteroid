-- Cleanup: drop exact-duplicate / strict-subset RLS policies on profiles.
--   profiles_update_own            is an exact duplicate of "Users can update their own profile" (auth.uid() = id)
--   "Users can view their own profile" is a strict subset of "profiles_select_own_or_admin" (auth.uid() = id OR is_admin())
-- Removing these does not change effective access for any role (anon: auth.uid() is null → never matches).
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
