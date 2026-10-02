-- =============================================================================
-- ROLLBACK — 20260930130000_seo_keyword_weekly_states.sql
-- =============================================================================
-- Removes ONLY what that migration created.
--
-- SAFETY: the migration was purely additive, so this rollback removes only the
-- new table and the new function. It deletes NO row from `seo_keywords`, does
-- NOT alter or drop the pre-existing UNIQUE(language, normalized_keyword)
-- constraint, and touches no pre-existing table.
-- =============================================================================

drop function if exists public.seo_market_identity_collisions();
drop function if exists public.seo_market_backfill_readiness();

drop index if exists public.seo_keyword_weekly_states_keyword_idx;
drop index if exists public.seo_keyword_weekly_states_lookup_idx;

drop table if exists public.seo_keyword_weekly_states;
