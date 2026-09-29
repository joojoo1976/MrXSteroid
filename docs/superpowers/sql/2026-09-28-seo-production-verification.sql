-- ============================================================
-- READ-ONLY PRODUCTION DB VERIFICATION — SEO GAP AUDIT
-- Migration: 2026-09-28-seo-production-verification
-- EXECUTE IN SUPABASE SQL EDITOR — SELECT / METADATA ONLY
-- ============================================================
-- NO INSERT / NO UPDATE / NO DELETE / NO ALTER / NO DROP / NO TRUNCATE
-- ============================================================

-- ============================================================
-- 1. COLUMN EXISTENCE VERIFICATION — 5 TARGET COLUMNS
-- ============================================================
SELECT
    'seo_keywords' AS table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE WHEN column_default IS NULL THEN 'NO DEFAULT' ELSE 'HAS DEFAULT' END AS default_status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'seo_keywords'
  AND column_name IN ('last_analyzed_at', 'last_scored_at', 'last_observed_at', 'last_seen_at', 'is_pinned')
ORDER BY column_name;

-- ============================================================
-- 2. FULL COLUMN LIST FOR SEO_KEYWORDS (SCHEMA SNAPSHOT)
-- ============================================================
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'seo_keywords'
ORDER BY ordinal_position;

-- ============================================================
-- 3. INDEXES ON SEO_KEYWORDS (TARGET COLUMNS)
-- ============================================================
SELECT
    indexname AS index_name,
    indexdef AS index_definition
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'seo_keywords';

-- ============================================================
-- 4. INDEXES ON SPECIFIC COLUMNS (TARGET 5 + RELATED)
-- ============================================================
SELECT
    t.relname AS table_name,
    i.relname AS index_name,
    a.attname AS column_name,
    pg_get_indexdef(i.oid) AS index_definition
FROM pg_index ix
JOIN pg_class t ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relname = 'seo_keywords'
  AND a.attname IN ('last_analyzed_at', 'last_scored_at', 'last_observed_at', 'last_seen_at', 'is_pinned', 'score', 'final_score')
ORDER BY a.attname, i.relname;

-- ============================================================
-- 5. CONSTRAINTS ON SEO_KEYWORDS
-- ============================================================
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'public.seo_keywords'::regclass
ORDER BY conname;

-- ============================================================
-- 6. MIGRATION APPLICATION STATUS (SCHEMA_MIGRATIONS)
-- ============================================================
SELECT
    version,
    description,
    executed_at,
    success
FROM supabase_migrations.schema_migrations
WHERE version IN (
    '20260911200000',
    '20260918170000',
    '20260918180000'
)
ORDER BY version DESC;

-- ============================================================
-- 7. ALL MIGRATION VERSIONS APPLIED (FULL LIST)
-- ============================================================
SELECT version, executed_at, success FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 20;

-- ============================================================
-- 8. RELATED TABLE INVENTORY (SEO ECOSYSTEM)
-- ============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'seo_%'
ORDER BY table_name;

-- ============================================================
-- 9. PINNING MANAGEMENT — seo_keyword_pins (NOT A COLUMN)
-- ============================================================
SELECT
    'seo_keyword_pins' AS table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'seo_keyword_pins'
ORDER BY ordinal_position;

-- ============================================================
-- 10. SAMPLE DATA — SEO_KEYWORDS (FIRST 5 ROWS, SELECT ONLY)
-- ============================================================
SELECT id, language, original_keyword, normalized_keyword,
    last_observed_at, last_scored_at, last_seen_at,
    score, final_score, is_active, trend_status, lifecycle_status,
    is_ymyl, requires_review, review_status
FROM seo_keywords
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================
-- 11. VERIFY IF last_analyzed_at EXISTS (WILL RETURN EMPTY IF MISSING)
-- ============================================================
SELECT 'last_analyzed_at EXISTS IN SCHEMA' AS check_result, column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'seo_keywords' AND column_name = 'last_analyzed_at';

-- ============================================================
-- 12. VERIFY IF is_pinned EXISTS (WILL RETURN EMPTY IF MISSING)
-- ============================================================
SELECT 'is_pinned EXISTS IN SCHEMA' AS check_result, column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'seo_keywords' AND column_name = 'is_pinned';

-- ============================================================
-- 13. SEPARATOR — END OF READ-ONLY VERIFICATION
-- ============================================================
SELECT
    'READ-ONLY VERIFICATION COMPLETE' AS status,
    CURRENT_TIMESTAMP AS verified_at,
    'NO INSERT / NO UPDATE / NO DELETE / NO ALTER / NO DROP / NO TRUNCATE' AS safety_notice;
