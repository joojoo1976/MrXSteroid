-- ═══════════════════════════════════════════════════════════════════════════
--  profiles.id → auth.users.id foreign key with ON DELETE CASCADE
--
--  Problem found during E2E signup testing: deleting an auth user left an
--  orphan row in public.profiles because profiles.id had NO foreign key to
--  auth.users.id. This migration adds the FK with ON DELETE CASCADE so a
--  deleted user automatically removes their profile, keeping the two tables
--  consistent (they are 1:1 via the on_auth_user_created trigger).
--
--  Idempotent: purges existing orphans first (required for the FK to apply),
--  drops any prior constraint, then adds the cascade FK.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) Remove orphan profiles whose auth user no longer exists.
DELETE FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);

-- 2) Add the cascade FK (drop first if present for idempotency).
ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users (id)
    ON DELETE CASCADE;
