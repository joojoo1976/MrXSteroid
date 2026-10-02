-- =============================================================================
-- READINESS PACKAGE · PHASE 2 (EXTERNAL) — READ-ONLY BY CONSTRUCTION
-- =============================================================================
-- This file contains NO DDL and NO DML. Every statement is `select`. It is a
-- harness for the next phase and is safe against Production: the worst it can
-- do is print rows.
--
-- PRECONDITION: migrations 20260930120000 (provenance RPC) and 20260930130000
-- (weekly states + gate functions) must be applied first. The weekly-states
-- migration is purely additive — it creates a new table and new functions and
-- does not touch any `seo_keywords` constraint.
--
-- =============================================================================
-- READ-ONLY ENFORCEMENT — run this FIRST
-- =============================================================================
-- The queries below are all `select`, but that is a property of the FILE, not
-- an enforced guarantee. This block makes read-only a property of the SESSION
-- instead, so a mistaken paste fails at the database rather than at review time.
--
-- It is strictly session-local: it grants nothing, revokes nothing, writes
-- nothing, and disappears on disconnect. It is a safety rail, not a migration.
--
-- NOTE: `default_transaction_read_only` blocks writes but still allows
-- `SET`/`SHOW`, which is what lets us confirm it took effect. It does NOT block
-- SELECT, and it does not affect any other session.
--
-- VERIFY it took effect (must return 'on'):
--     show transaction_read_only;
-- =============================================================================

begin;

-- Belt-and-braces. `read_only` rejects INSERT/UPDATE/DELETE/TRUNCATE.
set local transaction_read_only = on;

-- Strictest available: blocks any non-read transaction, including one started
-- later in the same session.
set local default_transaction_read_only = on;

show transaction_read_only;
show default_transaction_read_only;

-- Everything from SECTION 0 onward runs inside this transaction.
--
-- After the last query, end with:
--     commit;    -- releases the read-only session settings; writes nothing.



-- ═════════════════════════════════════════════════════════════════════════
-- SECTION 0 · PREFLIGHT (read-only)
-- ═════════════════════════════════════════════════════════════════════════
-- PASS CONDITION: the gate functions exist AND the Production unique key on
-- `seo_keywords` is still (language, normalized_keyword). If the unique key
-- already differs, STOP and report it rather than proceeding.
select
    '0.1 unique key on seo_keywords' as check_name,
    conname                         as constraint_name,
    pg_get_constraintdef(oid)       as definition
from pg_constraint
where conrelid = 'public.seo_keywords'::regclass
  and contype  = 'u'
order by conname;

select
    '0.2 gate functions present' as check_name,
    p.proname,
    pg_get_function_result(p.oid) as returns
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
      'seo_market_backfill_readiness',
      'seo_market_identity_collisions',
      'seo_record_keyword_provenance'
  )
order by p.proname;

select
    '0.3 snapshot unique key (expected UNCHANGED this phase)' as check_name,
    conname,
    pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.seo_keyword_snapshots'::regclass
  and contype  = 'u'
order by conname;


-- ═════════════════════════════════════════════════════════════════════════
-- SECTION 1 · ROW COUNTS + SOURCE DISTRIBUTION
-- ═════════════════════════════════════════════════════════════════════════
-- PASS CONDITION: count > 0, and the distribution names the real `source` values
-- present. A corpus where every row shares one editorial source is NOT external
-- verification — report it as such.
select
    'seo_keyword_count' as metric,
    count(*)::bigint    as value
from public.seo_keywords;

-- `data_kind` is NOT a column on `seo_keywords`; it is an application-level
-- concept. An earlier draft selected it here and would have ERRORED on contact
-- with Production. `source` and `trend_status` are the real stored columns.
select
    coalesce(source, '(null)') as source,
    count(*)::bigint          as rows,
    round(100.0 * count(*) / sum(count(*)) over (), 1) as pct_of_corpus
from public.seo_keywords
group by 1
order by rows desc;

-- Market reality check. `market` was added with DEFAULT 'global', which is NOT
-- one of the seven supported markets. Expect a large 'global' block here: that
-- is a real fact about the data, and it is precisely what makes the market
-- constraint a decision rather than a formality.
select
    language,
    coalesce(market, '(null)')       as market,
    coalesce(country_code, '(null)') as country_code,
    coalesce(locale, '(null)')       as locale,
    count(*)::bigint                 as rows
from public.seo_keywords
group by 1, 2, 3, 4
order by rows desc
limit 40;

select
    language,
    coalesce(market, country_code, locale) as market_or_locale,
    count(*)::bigint                       as rows
from public.seo_keywords
group by 1, 2
order by 1, rows desc;

-- A retired-heavy corpus cannot support a LIVE/RISING claim.
select
    coalesce(trend_status, '(null)') as trend_status,
    count(*)::bigint                 as rows
from public.seo_keywords
group by 1
order by rows desc;


-- ═════════════════════════════════════════════════════════════════════════
-- SECTION 2 · PROVENANCE COMPLETENESS
-- ═════════════════════════════════════════════════════════════════════════
-- Provenance is the honesty mechanism. If most keywords carry no provenance
-- row, the word "source-backed" in the UI would be unearned.
--
-- Provenance lives in `seo_keyword_source_links` (primary key keyword_id,
-- source_id). NOTE: this table has NO `source_backed` column — that concept is
-- applied in application code, not stored. An earlier draft of this file
-- referenced a non-existent `seo_keyword_provenance` table and a non-existent
-- `source_backed` column; querying those would have errored on contact with
-- Production. The coverage query below therefore uses the real table.
--
-- PASS CONDITION: every keyword has >= 1 source link, and the per-source split is
-- reported explicitly. A link with `evidence_type` / `source_reference` present
-- is evidence-bearing; one without is a bare editorial link and must stay
-- visible rather than being averaged away.
select
    '2.1 provenance coverage' as check_name,
    k.total_keywords,
    p.keywords_with_provenance,
    k.total_keywords - p.keywords_with_provenance as keywords_without_provenance,
    case
        when k.total_keywords = 0 then 'N/A'
        when p.keywords_with_provenance = k.total_keywords then 'PASS'
        else 'PARTIAL'
    end as verdict
from (select count(*) as total_keywords from public.seo_keywords) k
cross join (
    select count(distinct keyword_id) as keywords_with_provenance
    from public.seo_keyword_source_links
    where keyword_id is not null
) p;

-- Which source actually contributed, and how much evidence each link carries.
-- `evidence_bearing` = the row points at something checkable.
select
    p.source_id,
    count(*)::bigint                                        as link_rows,
    count(distinct p.keyword_id)::bigint                     as keywords,
    count(*) filter (where p.source_reference is not null)::bigint as evidence_bearing,
    count(*) filter (where p.source_reference is null)::bigint   as bare_editorial_links
from public.seo_keyword_source_links p
group by 1
order by link_rows desc;



-- ═════════════════════════════════════════════════════════════════════════
-- SECTION 3 · MARKET IDENTITY GATES (read-only — the §81 sequence)
-- ═════════════════════════════════════════════════════════════════════════
-- Run 3.1, then 3.2, then 3.3. Do NOT skip ahead to adding a constraint.

-- 3.1 + 3.2  BACKFILL -> VALIDATE
-- Rows whose market cannot be derived from data already ON the row.
-- PASS CONDITION: ZERO ROWS.
-- Non-empty means some rows carry a locale outside the seven supported markets.
-- Resolving that requires deciding per row what the market genuinely is; it
-- must NOT be guessed, and this file writes nothing to fix it.
-- IMPORTANT: `market` has DEFAULT 'global' and is therefore NON-NULL on almost
-- every pre-existing row. A naive `coalesce(market, locale)` would therefore
-- return the placeholder 'global' for everything and report a clean result while
-- the data is in fact unresolved. This query deliberately checks the LOCALE /
-- COUNTRY CODE, treating only a recognised seven-market value as resolved.
--
-- PASS CONDITION: ZERO ROWS.
-- Non-empty means some rows carry a locale outside the seven supported markets.
-- Resolving that requires deciding per row what the market genuinely is; it must
-- NOT be guessed, and this file writes nothing to fix it.
select
    '3.1 BACKFILL+VALIDATE' as gate,
    keyword_id,
    language,
    locale,
    market,
    country_code,
    problem
from public.seo_market_backfill_readiness()
order by language, locale;

-- 3.3  COLLISIONS
-- Two distinct failure modes, because they need different remedies.
--
--   spelling_collision  = DATA LOSS RISK. Two spellings currently occupy one
--                         (language, market, keyword) slot and would collapse.
--   legacy_multi_market = EXPECTED SPLIT. One legacy row that would
--                         legitimately become several market rows.
--
-- PASS CONDITION: `spelling_collision` MUST be zero. `legacy_multi_market` may
-- be non-zero — that is the change working as designed — but every one of them
-- must be reviewed and signed off by a human before any constraint is added.
select
    '3.3 COLLISIONS' as gate,
    collision_kind,


-- ═════════════════════════════════════════════════════════════════════════
-- SECTION 4 · WEEKLY STATE HISTORY (does the loop actually run?)
-- ═════════════════════════════════════════════════════════════════════════
-- The decisive query for "RUNTIME CHAIN CLOSED". If the refresh has never run
-- in Production, these tables are empty — a fact to report, not a bug to hide.
select
    '4.1 weekly states' as check_name,
    count(*)::bigint    as rows,
    count(distinct (year::text || '-W' || week::text))::bigint as distinct_weeks,
    min(year || '-W' || week) as earliest,
    max(year || '-W' || week) as latest
from public.seo_keyword_weekly_states;

-- Only meaningful once the table has data: shows whether the historical diff
-- has real prior weeks to compare against.
select
    year,
    week,
    count(*)::bigint                               as rows,
    round(avg(score)::numeric, 2)                  as avg_score,
    count(*) filter (where market is null)::bigint as rows_without_market
from public.seo_keyword_weekly_states
group by year, week
order by year desc, week desc
limit 12;

-- 4.3 The API reads snapshots from here; an empty table means the live
-- keywords endpoint is serving a fallback rather than persisted snapshots.
select
    '4.3 snapshots' as check_name,
    count(*)::bigint as rows,
    count(distinct (year::text || '-W' || week_number::text))::bigint as distinct_weeks,
    min(year || '-W' || week_number) as earliest,
    max(year || '-W' || week_number) as latest
from public.seo_keyword_snapshots;

-- 4.4 Proves whether /api/seo/refresh has ever executed in Production.
select
    status,
    count(*)::bigint as runs,
    max(started_at)  as last_started,
    max(finished_at) as last_finished
from public.seo_keyword_refresh_runs
group by status
order by runs desc;

-- 4.5 The most recent runs, verbatim. If the last run failed, the reason is
-- here and must be reported rather than summarised as "working".
select
    id,
    status,
    started_at,
    finished_at,
    keywords_scanned,
    updated_keywords,
    error_log
from public.seo_keyword_refresh_runs
order by started_at desc
limit 5;


-- ═════════════════════════════════════════════════════════════════════════
-- SECTION 5 · EXPLICITLY NOT DONE
-- ═════════════════════════════════════════════════════════════════════════
-- The following stays out of this file on purpose:
--   alter table public.seo_keywords
--       add constraint seo_keywords_market_identity
--       unique (language, market, normalized_keyword);
--
-- BLOCKED until 3.1 returns zero rows, 3.3 returns zero spelling_collision
-- rows, a human has signed off on every legacy_multi_market row, and a
-- separate reviewed change is approved.

    language,
    market,
    normalized,
    spellings,
    row_count
from public.seo_market_identity_collisions()
order by collision_kind, language, normalized;
