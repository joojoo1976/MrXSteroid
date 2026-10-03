-- Rollback — SEO keyword provenance atomic write path.
-- Mirrors supabase/migrations/20260930120000_seo_keyword_provenance_atomic_rpc.sql
--
-- Removes ONLY the objects that migration created:
--   - the three functions it defined
--   - the two indexes it created
--   - the columns it ADDED to public.seo_keyword_source_links
--
-- No legacy keyword rows are deleted. The pre-existing columns
-- (keyword_id, source_id, observed_value, source_metric, source_rank,
-- source_confidence, created_at) and the pre-existing primary key
-- (keyword_id, source_id) are untouched. Any provenance rows written while
-- the forward migration was applied are removed together with the added
-- columns; seo_keywords itself is never modified.

DROP FUNCTION IF EXISTS public.seo_record_keyword_provenance(uuid, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.seo_upsert_keyword_with_provenance(jsonb, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.seo_resolve_provenance_source(jsonb);

DROP INDEX IF EXISTS public.idx_seo_source_links_discovered_at;
DROP INDEX IF EXISTS public.idx_seo_source_links_parent_keyword;

ALTER TABLE public.seo_keyword_source_links
    DROP COLUMN IF EXISTS updated_at,
    DROP COLUMN IF EXISTS generation_method,
    DROP COLUMN IF EXISTS parent_keyword_id,
    DROP COLUMN IF EXISTS confidence,
    DROP COLUMN IF EXISTS source_reference,
    DROP COLUMN IF EXISTS evidence_type,
    DROP COLUMN IF EXISTS discovered_at;
