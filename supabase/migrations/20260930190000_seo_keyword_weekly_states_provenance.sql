-- =============================================================================
-- STEP 15/16 — provenance columns on seo_keyword_weekly_states
-- =============================================================================
-- WHY THIS FILE EXISTS
-- -------------------
-- A post-apply Production verification of C proved the weekly-state table was
-- missing three columns the runtime persister already writes:
--
--     server/seo/refreshRuntime.ts -> weeklyStatePersister()
--         record = { ..., data_kind, source, idempotency_key }
--
-- Without them EVERY weekly persistence write fails with PostgREST 42703
-- ("column does not exist"), which is the same failure class already recorded
-- for the v3-era columns in app/api/seo/refresh/route.ts. The table existed
-- but could not store the provenance the system is required to keep.
--
-- These three columns are what make a weekly row self-describing: which
-- provider produced it, whether the value was observed or imported, and the
-- key that makes a re-run idempotent. Adding them is required for provenance
-- (§12) and idempotency (§18), not an optimisation.
--
-- SAFETY
-- ------
--   * ADDITIVE ONLY. No DROP, no DELETE, no rewrite of existing rows.
--   * Nullable, with NO default, so no existing row receives an invented
--     value. A row written before this migration simply reads NULL, which is
--     the honest representation of "not recorded".
--   * `data_kind` is constrained to the vocabulary the engines already emit.
-- =============================================================================

alter table public.seo_keyword_weekly_states
    add column if not exists data_kind text,
    add column if not exists source text,
    add column if not exists idempotency_key text;

-- Guard the provenance vocabulary in the database, not only in TypeScript.
-- 'unavailable' is included because a provider may legitimately record that it
-- had nothing to contribute this week.
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'seo_keyword_weekly_states_data_kind_check'
    ) then
        alter table public.seo_keyword_weekly_states
            add constraint seo_keyword_weekly_states_data_kind_check
            check (
                data_kind is null or data_kind in (
                    'observed', 'estimated', 'generated', 'imported', 'curated', 'unavailable'
                )
            );
    end if;
end
$$;

-- Idempotency aid: the persister upserts on
-- (keyword_id, year, week, market), which is already unique, so this index
-- only accelerates the conflict lookup during a weekly run.
create index if not exists idx_seo_weekly_states_source
    on public.seo_keyword_weekly_states (source);

create index if not exists idx_seo_weekly_states_data_kind
    on public.seo_keyword_weekly_states (data_kind);-- The weekly persister (server/seo/refreshRuntime.ts) also writes `keyword` and
-- `normalized_keyword` so a weekly row is readable without joining seo_keywords.
-- The Production smoke test proved both columns were missing (PostgREST
-- "Could not find the 'keyword' column"). Nullable, no default, so existing
-- rows are unaffected.
alter table public.seo_keyword_weekly_states
    add column if not exists keyword text,
    add column if not exists normalized_keyword text;