-- ============================================================
-- Advisor fixes:
-- 1) user_history RLS initplan optimization
--    Replaces auth.uid() with (select auth.uid()) so the value is
--    cached as an initplan instead of re-evaluated per row.
-- 2) Drop pg_graphql extension (app is REST-only; removes ~54
--    pg_graphql_anon/authenticated_table_exposed lints).
-- Behavioral changes: none.
-- ============================================================

drop policy if exists "Users can manage own history" on public.user_history;
create policy "Users can manage own history" on public.user_history
    for all to public
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

drop extension if exists pg_graphql;
