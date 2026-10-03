-- =============================================================================
-- STEP 13/14 — seo_keyword_weekly_states + market-aware identity reporting
-- =============================================================================
-- Purpose
--   1. Persist a per-market, per-week snapshot of each keyword's state so the
--      system can answer "what changed since last week?" from REAL history
--      rather than inferring a trend from a single row (prompt §38, §65).
--   2. Add the collision-REPORTING function needed to prove that widening the
--      keyword identity to (language, market, normalized_keyword) is safe.
--
-- SAFETY (prompt §80, §81)
--   * ADDITIVE ONLY. No DROP, no DELETE, no data loss, no destructive reset.
--   * The existing UNIQUE(language, normalized_keyword) constraint is DELIBERATELY
--     LEFT IN PLACE. Changing it requires a collision check against real
--     Production data, which this repository does not have. The constraint
--     change is therefore BLOCKED, and `seo_market_identity_collisions()` is
--     provided so the operator can run exactly that check first.
--   * Nothing here is applied automatically; this is a migration FILE only.
-- =============================================================================

-- 1. The weekly state table ---------------------------------------------------
create table if not exists public.seo_keyword_weekly_states (
    id                  uuid primary key default gen_random_uuid(),
    keyword_id          uuid not null references public.seo_keywords(id) on delete cascade,
    year                int  not null,
    week                int  not null,
    market              text not null,
    language            text not null,
    -- Real score/position, or NULL. A missing value stays missing; it is never
    -- back-filled with a guess.
    score               numeric(5,2),
    rank                int,
    trend_status        text,
    metrics             jsonb,
    destination_path    text,
    competitor_signal   text,
    recorded_at         timestamptz not null default now(),

    constraint seo_keyword_weekly_states_unique
        unique (keyword_id, year, week, market),
    constraint seo_keyword_weekly_states_market_check
        check (market in ('ar-EG','ar-SA','ar-AE','en-US','en-GB','en-CA','en-AU')),
    constraint seo_keyword_weekly_states_language_check
        check (language in ('en','ar')),
    -- An unknown market must be stored as NULL, never as an invented country.
    constraint seo_keyword_weekly_states_no_phantom_market
        check (market is not null and market <> language)
);

create index if not exists seo_keyword_weekly_states_lookup_idx
    on public.seo_keyword_weekly_states (language, market, year, week);

create index if not exists seo_keyword_weekly_states_keyword_idx
    on public.seo_keyword_weekly_states (keyword_id, year desc, week desc);

-- Idempotent: re-running the migration must not create duplicate indexes.
-- (The two indexes above use IF NOT EXISTS, so re-running is already safe.)

-- =============================================================================
-- STEP 14 — MARKET IDENTITY MIGRATION PLAN (PREPARATION ONLY, NOT APPLIED)
-- =============================================================================
-- THIS FILE CHANGES NO CONSTRAINT. It is the safety gate that must be passed
-- before a market-aware uniqueness constraint may ever be introduced.
--
-- CURRENT PRODUCTION IDENTITY (verified, do not alter in this phase):
--     seo_keywords : UNIQUE (language, normalized_keyword)
--     seo_keyword_snapshots : UNIQUE (year, week_number, language)
-- Neither is touched here. No DROP, no ALTER, no DELETE, no backfill write.
--
-- REQUIRED ORDER (prompt §81). Each step has an explicit exit criterion.
--
--   STEP 1  BACKFILL   -> seo_keywords.market populated for every row
--   STEP 2  VALIDATE   -> no row has a null / phantom / bare-language market
--   STEP 3  COLLISIONS -> prove that widening the key loses no information
--   STEP 4  VERIFY     -> human review of the collision report
--   STEP 5  CONSTRAINT -> (separate, reviewed change) add
--                         UNIQUE (language, market, normalized_keyword)
--
-- THIS MIGRATION PERFORMS STEPS 1-3 AS REPORTING QUERIES ONLY. It writes no
-- data. Step 5 is BLOCKED until steps 1-3 are proven against real rows.
-- =============================================================================

-- ── STEP 1 + 2: BACKFILL VALIDATION (read-only) ────────────────────────────
-- Reports every row that could not be assigned a market automatically.
--
-- CRITICAL — WHY THIS IGNORES `market` AS A SOURCE OF TRUTH
-- ---------------------------------------------------------
-- `seo_keywords.market` is created by 20260930140000_seo_v3_backbone_revised.sql
-- (A′) as a PLAIN NULLABLE COLUMN — `market text`, with NO default.
--
-- The superseded backbone proposed `market text default 'global'`, and that
-- proposal is the reason this gate ignores the column's value in the first
-- place. A Postgres column DEFAULT is applied on INSERT, so a deployment that
-- shipped that definition would carry the literal 'global' on rows whose real
-- market was never determined. A naive `coalesce(market, country_code, locale)`
-- would then resolve EVERY row to 'global', return ZERO rows, and report a clean
-- gate while the data is in fact unresolved — a false PASS on the single most
-- dangerous gate in this migration.
--
-- A′ removed the default, so under the approved design `market` is either a
-- real seven-market value written by the deterministic backfill, or NULL. This
-- function must keep treating 'global' as a PROBLEM regardless, so that a
-- future reintroduction of that default is caught here rather than trusted.
--
-- The query therefore treats ONLY a recognised seven-market value as resolved,
-- and falls back to country_code / locale when `market` is missing or is the
-- 'global' placeholder. 'global' is reported as a problem, never accepted.
--
-- EXIT CRITERION: this query MUST return zero rows before step 3.
create or replace function public.seo_market_backfill_readiness()
returns table (
    keyword_id   uuid,
    language     text,
    locale       text,
    market       text,
    country_code text,
    problem      text
)
language sql
stable
as $$
    with resolved as (
        select
            k.id,
            k.language,
            k.locale,
            k.market,
            k.country_code,
            -- The candidate is the first REAL market value, ignoring the
            -- 'global' placeholder, and falling back to country_code / locale.
            coalesce(
                case
                    when k.market is not null
                     and k.market <> ''
                     and k.market <> 'global'
                     and k.market ~ '^(ar-EG|ar-SA|ar-AE|en-US|en-GB|en-CA|en-AU)$'
                    then k.market
                end,
                case
                    when k.country_code is not null
                     and k.country_code <> ''
                     and k.country_code <> 'global'
                    then k.country_code
                end,
                k.locale
            ) as candidate
        from public.seo_keywords k
    )
    select
        r.id::uuid,
        r.language::text,
        r.locale::text,
        r.market::text,
        r.country_code::text,
        case
            when r.candidate is null
                 or btrim(r.candidate::text) = ''
                then 'no country recorded on the row'
            when r.candidate::text = r.language::text
                then 'country equals the bare language; a market cannot be inferred'
            when r.candidate::text = 'global'
                then 'market holds the ''global'' placeholder, not a real market'
            when r.candidate::text !~ '^(ar-EG|ar-SA|ar-AE|en-US|en-GB|en-CA|en-AU)$'
                then 'unsupported market value'
            else ''
        end
    from resolved r
    where r.candidate is null
       or btrim(r.candidate::text) = ''
       or r.candidate::text = r.language::text
       or r.candidate::text = 'global'
       or r.candidate::text !~ '^(ar-EG|ar-SA|ar-AE|en-US|en-GB|en-CA|en-AU)$'
    order by r.language, r.locale;
$$;

comment on function public.seo_market_backfill_readiness() is
    'READ-ONLY. Lists rows whose market cannot be derived from data already on the row. Deliberately ignores the ''global'' placeholder in seo_keywords.market, which is a column default rather than a real market. Must return zero rows before the market-aware unique constraint is considered. No market is ever guessed.';

-- ── STEP 3: COLLISION DETECTION (read-only) ────────────────────────────────
-- Two DISTINCT failure modes are reported, because they need different fixes:
--
--   (a) same (language, market, normalized_keyword) reached by different
--       spellings  -> these collapse; a human must decide which survives.
--   (b) the SAME (language, normalized_keyword) spread across several markets
--       -> these are currently ONE row and would become several. That is the
--       intent, but the split must be approved, not assumed.
create or replace function public.seo_market_identity_collisions()
returns table (
    collision_kind text,
    language       text,
    market         text,
    normalized     text,
    spellings      text[],
    row_count      bigint
)
language sql
stable
as $$
    -- (a) distinct spellings that would collapse into one market identity
    select
        'spelling_collision'::text,
        k.language::text,
        coalesce(k.market, k.country_code, k.locale)::text,
        k.normalized_keyword::text,
        array_agg(distinct k.original_keyword::text),
        count(distinct k.id)
    from public.seo_keywords k
    where coalesce(k.market, k.country_code, k.locale) is not null
      and coalesce(k.market, k.country_code, k.locale) <> k.language
    group by 1, 2, 3, 4
    having count(distinct k.original_keyword) > 1

    union all

    -- (b) one legacy identity currently spanning multiple markets
    select
        'legacy_multi_market'::text,
        k.language::text,
        null::text,
        k.normalized_keyword::text,
        array_agg(distinct coalesce(k.market, k.country_code, k.locale)::text),
        count(distinct coalesce(k.market, k.country_code, k.locale))
    from public.seo_keywords k
    group by 1, 2, 4
    having count(distinct coalesce(k.market, k.country_code, k.locale)) > 1

    order by 1, 2, 4;
$$;

comment on function public.seo_market_identity_collisions() is
    'READ-ONLY collision report. BOTH queries must return zero rows before UNIQUE(language, market, normalized_keyword) may be added. spelling_collision = data loss risk; legacy_multi_market = a row that will legitimately split into several. No row is modified.';

-- ── STEP 5: EXPLICITLY NOT DONE HERE ───────────────────────────────────────
-- The following is INTENTIONALLY ABSENT from this file:
--   alter table public.seo_keywords
--       add constraint seo_keywords_market_identity
--       unique (language, market, normalized_keyword);
-- It stays BLOCKED until seo_market_backfill_readiness() and
-- seo_market_identity_collisions() have both been proven to return zero rows
-- against real Production data, and a separate reviewed change is approved.

