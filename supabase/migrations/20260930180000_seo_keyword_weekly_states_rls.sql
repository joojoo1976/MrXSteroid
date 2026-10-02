-- =============================================================================
-- SEO WEEKLY STATES — ROW LEVEL SECURITY (Migration D)
-- Status: PREPARED, NOT APPLIED.
-- DEPENDENCY: requires public.seo_keyword_weekly_states, created by
--   20260930170000_seo_keyword_weekly_states.sql, which sorts immediately before
--   this file. `db push` therefore applies them in the correct order.
-- =============================================================================
-- WHY THIS IS A SEPARATE MIGRATION
-- -------------------------------
-- 20260930170000 creates `seo_keyword_weekly_states` but, as written, enables no
-- row-level security on it — while every other table that migration's sibling
-- creates DOES have RLS. That inconsistency is a real gap: a table reachable
-- without RLS is readable/writable by any role PostgREST exposes, which for a
-- Supabase project can include `anon`.
--
-- Isolating RLS into its own migration keeps the SECURITY DECISION auditable on
-- its own. If this file is ever questioned or reverted, the table's data is
-- untouched.
--
-- ADDITIVE ONLY: no DROP, no DELETE, no data mutation, no schema change to the
-- table itself. It enables RLS and creates policies.
--
-- ACCESS PRINCIPLE
-- ----------------
--     service_role  -> server-side access (bypasses RLS by design in Supabase,
--                      and is also named explicitly in the policy)
--     authenticated -> admin/service only
--     anon / public -> NO ACCESS
--
-- There is deliberately NO public-read policy. A weekly state row carries a
-- per-market score, rank and trend status: that is our internal measurement
-- state, and "the table needs RLS" is not a reason to make it public.
-- =============================================================================

-- Idempotent: enabling RLS twice is a no-op.
alter table public.seo_keyword_weekly_states enable row level security;

-- Admin / service_role full access. `authenticated` is restricted to admins, so
-- an ordinary signed-in user cannot read measurement state.
drop policy if exists "SEO Weekly States: admin/service all"
    on public.seo_keyword_weekly_states;
create policy "SEO Weekly States: admin/service all"
    on public.seo_keyword_weekly_states for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);

-- EXPLICITLY DENY: no `anon` policy is created. With RLS enabled and no matching
-- policy, PostgREST/Supabase returns zero rows for `anon` — which is the
-- intended outcome, not an accident.
--
-- NOTE ON service_role: Supabase's service_role key bypasses RLS entirely, so it
-- does not strictly need a policy. It is still named above so the intent is
-- documented in the schema rather than being an implicit behaviour.
--
-- VERIFICATION (run after applying, all three MUST hold):
--   -- anon must see nothing:
--   set local role anon;
--   select count(*) from public.seo_keyword_weekly_states;   -- expect 0
--   reset role;
--
--   -- authenticated non-admin must see nothing:
--   set local role authenticated;
--   set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}';
--   select count(*) from public.seo_keyword_weekly_states;   -- expect 0
--   reset role;
--
--   -- service_role must see everything:
--   select count(*) from public.seo_keyword_weekly_states;   -- expect N
-- =============================================================================
-- ROLLBACK
-- -----------------------------------------------------------------------------
-- Disabling RLS is NOT the rollback, because it would widen exposure rather than
-- restore a prior state (the table did not exist before 20260930130000).
-- The correct rollback is to drop the policy and leave the table unused:
--     drop policy if exists "SEO Weekly States: admin/service all"
--         on public.seo_keyword_weekly_states;
-- =============================================================================
