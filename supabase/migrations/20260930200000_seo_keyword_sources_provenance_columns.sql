-- =============================================================================
-- STEP 17/18 — reconcile seo_keyword_sources with the provenance RPC (F)
-- =============================================================================
-- WHY THIS FILE EXISTS
-- -------------------
-- Migration B (seo_keyword_provenance_atomic_rpc) inserts into
-- `seo_keyword_sources` these columns:
--
--     source_type, source_name, source_url, provider_account_ref,
--     country_code, locale, reliability_score, terms_verified, metadata
--
-- But migration A' created the table WITHOUT four of them. A live Production
-- refresh proved it: all 234 provenance writes failed with
--
--     42703 column "source_url" of relation "seo_keyword_sources" does not exist
--
-- so the weekly run could never record a single provenance row and was
-- finalized FAILED. The provenance chain was non-functional end to end.
--
-- This is a pure additive reconciliation: the four missing columns are added,
-- nullable, with NO default, so no existing row receives an invented value and
-- no existing column or constraint is altered.
--
-- SAFETY
-- ------
--   * ADDITIVE ONLY. No DROP, no DELETE, no rewrite of existing rows.
--   * `if not exists` makes a re-run a no-op.
--   * The already-applied A' and B files are NOT modified.
-- =============================================================================

alter table public.seo_keyword_sources
    add column if not exists source_url text,
    add column if not exists provider_account_ref text,
    add column if not exists country_code char(2),
    add column if not exists locale text;

-- The RPC resolves an existing source on (source_type, source_name); this
-- index makes that resolution a single lookup instead of a table scan on
-- every provenance write.
create index if not exists idx_seo_keyword_sources_type_name
    on public.seo_keyword_sources (source_type, source_name);