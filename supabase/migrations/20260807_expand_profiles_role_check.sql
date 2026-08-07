-- Re-enable the representative/delegate roles in profiles.role.
-- The app ships a full representative + delivery feature (RepresentativePage,
-- delegates table, delivery RLS, is_representative()) that was blocked at the
-- DB layer by a CHECK constraint allowing only ('user','admin').
-- Widening is safe: role elevation remains exclusive to admins via
-- handle_new_user (app_metadata only) and the INSERT/UPDATE guard
-- prevent_profile_privilege_escalation.

alter table public.profiles
    drop constraint if exists profiles_role_check;

alter table public.profiles
    add constraint profiles_role_check
    check (role in ('user', 'admin', 'delegate', 'representative'));
