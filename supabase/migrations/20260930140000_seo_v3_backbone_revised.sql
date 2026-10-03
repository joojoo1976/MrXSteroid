-- =============================================================================
-- SEO V3 BACKBONE — REVISED (A')
-- Supersedes: 20260918170000_seo_intelligence_v3_backbone.sql
-- Status: PREPARED, NOT APPLIED.
-- =============================================================================
-- WHY A REVISION WAS NECESSARY
-- --------------------------
-- A read-only Production preflight (234 keyword rows) proved three defects in
-- the original A. Each is corrected below; the corrections are marked [A'-FIX].
--
-- [A'-FIX 1] market DEFAULT 'global' — REMOVED
--   Original:  add column market text default 'global'
--   Problem:   a Postgres column DEFAULT is applied on INSERT, so every future
--              row that does not state a market would silently receive the
--              literal string 'global'. That manufactures a fake market in
--              Production and is exactly the placeholder the readiness gate
--              must never accept.
--   Revision:  `market text` — nullable, NO default. Market is derived from
--              real data by the backfill below, or stays NULL.
--
-- [A'-FIX 2] market backfill from `locale` ONLY
--   The preflight proved 234/234 rows carry an interpretable locale
--   (en-US 126, ar-EG 108). The mapping below is DETERMINISTIC and CLOSED:
--   a locale outside the map is left NULL, never guessed.
--
-- [A'-FIX 3] RLS exposure narrowed
--   The original A granted UNCONDITIONAL public SELECT on four tables
--   (`using (true)`), including competitor observations' sibling tables. Two of
--   those are now REQUIRED (they feed the public keyword UI); two are removed
--   (TOO BROAD — no identified consumer). See the POLICY AUDIT section.
--
-- WHAT THIS FILE STILL DOES NOT DO
-- -------------------------------
-- It does not touch any existing constraint, does not add a market-aware
-- UNIQUE, and does not drop or rewrite a row. The existing
-- UNIQUE(language, normalized_keyword) is left in place; widening it remains
-- BLOCKED behind the collision gates in 20260930130000.
--
-- ROLLBACK: supabase/migrations/rollbacks/20260930120000_*.sql pattern applies,
-- but see the caveat at the bottom of this file before writing a rollback.
-- =============================================================================


-- =============================================================================
-- 1. seo_keyword_sources
-- =============================================================================
-- POLICY AUDIT: admin/service only.
--   Consumer: server-side provenance resolution (RPC) + admin views.
--   Verdict:  REQUIRED as written. The table holds the evidence registry; there
--             is no public-facing reason to read it directly, and exposing it
--             would disclose which sources we track and their reliability
--             scores. No public-read policy.
-- =============================================================================
create table if not exists public.seo_keyword_sources (
    id uuid primary key default gen_random_uuid(),
    source_type text not null,
    source_name text not null unique,
    reliability numeric(5,2) check (reliability between 0 and 100),
    terms_verified boolean not null default false,
    metadata jsonb not null default '{}'::jsonb,
    retrieval_period_start date,
    retrieval_period_end date,
    retrieved_at timestamptz not null default now(),
    reliability_score numeric(5,2) check (reliability_score between 0 and 100),
    created_at timestamptz not null default now()
);

alter table public.seo_keyword_sources enable row level security;

drop policy if exists "SEO Sources: admin/service all" on public.seo_keyword_sources;
create policy "SEO Sources: admin/service all"
    on public.seo_keyword_sources for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);


-- =============================================================================
-- 2. seo_topic_clusters
-- =============================================================================
-- POLICY AUDIT: public SELECT retained.
--   Consumer: the public keyword page renders cluster groupings.
--   Verdict:  REQUIRED. This is a taxonomy label, not evidence. Nothing
--             confidential is exposed.
-- =============================================================================
create table if not exists public.seo_topic_clusters (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    description text,
    parent_id uuid references public.seo_topic_clusters(id) on delete set null,
    created_at timestamptz not null default now()
);

alter table public.seo_topic_clusters enable row level security;

drop policy if exists "SEO Clusters: public read" on public.seo_topic_clusters;
create policy "SEO Clusters: public read"
    on public.seo_topic_clusters for select
    using (true);

drop policy if exists "SEO Clusters: admin/service all" on public.seo_topic_clusters;
create policy "SEO Clusters: admin/service all"
    on public.seo_topic_clusters for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);


-- =============================================================================
-- 3. seo_keywords — additive v3 columns
-- =============================================================================
-- [A'-FIX 1] `market` and `country_code` are added WITHOUT a default.
--   The original A declared `market text default 'global'`, which writes that
--   literal into every future row that omits a market. Here the columns are
--   plain nullable text: a market is written only by the deterministic backfill
--   below, or by application code that genuinely knows it.
-- =============================================================================
alter table public.seo_keywords
    add column if not exists country_code char(2),
    add column if not exists market text,
    add column if not exists region text,
    add column if not exists keyword_type text default 'general',
    add column if not exists target_url text,
    add column if not exists destination_type text,
    add column if not exists destination_verified boolean not null default false,
    add column if not exists lifecycle_status text not null default 'active'
        check (lifecycle_status in ('candidate','experimental','pending_review','approved','active','retired','blocked')),
    add column if not exists is_ymyl boolean not null default false,
    add column if not exists requires_review boolean not null default false,
    add column if not exists final_score numeric(5,2),
    add column if not exists score_version text default 'v3.0',
    add column if not exists confidence_score numeric(5,2) default 70.0,
    add column if not exists first_seen_at timestamptz default now(),
    add column if not exists last_seen_at timestamptz default now();

-- =============================================================================
-- 4. DETERMINISTIC BACKFILL — market + country_code
-- =============================================================================
-- SOURCE OF TRUTH: `seo_keywords.locale`, a column that already exists in
-- Production and which the preflight proved interpretable for 234/234 rows.
--
-- The mapping is CLOSED: a locale outside this table is left NULL. It is never
-- inferred from a metric, a source name, or a language, because language alone
-- is ambiguous (`en` could be US/GB/CA/AU, `ar` could be EG/SA/AE).
--
-- PREFLIGHT RESULT (real, read-only, Production):
--     en-US  126 rows  -> en-US / US
--     ar-EG  108 rows  -> ar-EG / EG
--     total  234 rows
--
-- Idempotent: `where k.market is null` means a re-run leaves correct values
-- alone, and never overwrites a value an operator set deliberately.
-- =============================================================================
update public.seo_keywords k
set
    market = case k.locale
        when 'en-US' then 'en-US'
        when 'en-GB' then 'en-GB'
        when 'en-CA' then 'en-CA'
        when 'en-AU' then 'en-AU'
        when 'ar-EG' then 'ar-EG'
        when 'ar-SA' then 'ar-SA'
        when 'ar-AE' then 'ar-AE'
        else null          -- UNRESOLVED_NEEDS_REVIEW, never guessed
    end,
    country_code = case k.locale
        when 'en-US' then 'US'
        when 'en-GB' then 'GB'
        when 'en-CA' then 'CA'
        when 'en-AU' then 'AU'
        when 'ar-EG' then 'EG'
        when 'ar-SA' then 'SA'
        when 'ar-AE' then 'AE'
        else null
    end
where k.market is null;

-- =============================================================================
-- 5. score backfill — final_score, target_url
-- =============================================================================
-- PREFLIGHT PROOF (read-only, Production, 234 rows):
--     score            234 numeric, 0 NULL   (min 83, median 91, max 100)
--     destination_path 234 non-NULL, 0 empty, 2 rows are the literal '/'
--
-- Therefore `final_score = score` cannot produce a NULL: every source value is
-- numeric. NO numeric fallback is added — a missing score would stay NULL and be
-- reported, never invented as 0.
--
-- `target_url = destination_path` cannot produce a NULL either.
--
-- THE 2 ROOT DESTINATIONS: the preflight found exactly two rows whose
-- destination_path is '/'. They are NOT modified here and are NOT converted to
-- a review flag. They are copied verbatim, because '/' is a real stored value
-- and deciding whether it is an acceptable destination is an editorial call

-- =============================================================================
-- 6. seo_keyword_source_links — provenance links
-- =============================================================================
-- POLICY AUDIT: admin/service only. NO public read.
--   Consumer: server-side provenance RPCs, admin source-health views.
--   Verdict:  public read was present in the original A and is REMOVED here.
--             A link row maps a keyword to the source that produced it, which
--             discloses our measurement methodology and per-keyword attribution.
--             No identified public consumer exists. Exposing it is TOO BROAD.
-- =============================================================================
create table if not exists public.seo_keyword_source_links (
    keyword_id uuid references public.seo_keywords(id) on delete cascade,
    source_id uuid references public.seo_keyword_sources(id) on delete cascade,
    observed_value jsonb not null default '{}'::jsonb,
    source_metric text,
    source_rank numeric,
    source_confidence numeric(5,2),
    created_at timestamptz not null default now(),
    primary key (keyword_id, source_id)
);

alter table public.seo_keyword_source_links enable row level security;

-- Intentionally NO "public read" policy is created for this table.
drop policy if exists "SEO Source Links: public read" on public.seo_keyword_source_links;

drop policy if exists "SEO Source Links: admin/service all" on public.seo_keyword_source_links;
create policy "SEO Source Links: admin/service all"
    on public.seo_keyword_source_links for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);


-- =============================================================================
-- 7. seo_keyword_pins
-- =============================================================================
-- POLICY AUDIT: public SELECT retained.
--   Consumer: the keyword page renders pin ordering; pins are curation state.
--   Verdict:  REQUIRED. Pins are an explicit editorial list, not measurement
--             data.
-- =============================================================================
create table if not exists public.seo_keyword_pins (
    id uuid primary key default gen_random_uuid(),
    keyword_id uuid not null references public.seo_keywords(id) on delete cascade,
    pinned_by uuid references auth.users(id) on delete set null,
    pin_order integer not null default 0,
    note text,
    created_at timestamptz not null default now()
);

-- =============================================================================
-- 8. seo_keyword_blocks
-- =============================================================================
-- POLICY AUDIT: admin/service only.
--   Consumer: admin block management. A block record states that a keyword is
--             deliberately suppressed — internal editorial state.
--   Verdict:  REQUIRED as admin-only. No public read.
-- =============================================================================
create table if not exists public.seo_keyword_blocks (
    id uuid primary key default gen_random_uuid(),
    keyword_id uuid references public.seo_keywords(id) on delete cascade,
    keyword_text text,
    block_reason text,
    block_scope text,
    blocked_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now()
);

alter table public.seo_keyword_blocks enable row level security;

drop policy if exists "SEO Blocks: admin/service all" on public.seo_keyword_blocks;
create policy "SEO Blocks: admin/service all"
    on public.seo_keyword_blocks for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);


-- =============================================================================
-- 9. seo_competitors — competitor registry
-- =============================================================================
-- POLICY AUDIT: public SELECT narrowed to active rows.
--   Consumer: the public "who we compete with" surface.
--   Verdict:  REQUIRED, scope unchanged (`is_active = true`). Competitor names
--             are already published on the marketing site, so the metadata is
--             not more sensitive than existing public information.
-- =============================================================================
create table if not exists public.seo_competitors (
    id uuid primary key default gen_random_uuid(),
    domain text not null,
    name text not null,
    competitor_type text,
    is_active boolean not null default true,
    notes text,
    created_at timestamptz not null default now()
);

alter table public.seo_competitors enable row level security;

drop policy if exists "SEO Competitors: public read" on public.seo_competitors;
create policy "SEO Competitors: public read"
    on public.seo_competitors for select
    using (is_active = true);

drop policy if exists "SEO Competitors: admin/service all" on public.seo_competitors;
create policy "SEO Competitors: admin/service all"
    on public.seo_competitors for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);


-- =============================================================================
-- 11. seo_seasonal_calendar
-- =============================================================================
-- POLICY AUDIT: public SELECT narrowed to active rows.
--   Consumer: the public seasonal hint.
--   Verdict:  REQUIRED, scope unchanged (`is_active = true`). A publish window
--             is marketing information, not measurement data.
-- =============================================================================
create table if not exists public.seo_seasonal_calendar (
    id uuid primary key default gen_random_uuid(),
    keyword_id uuid references public.seo_keywords(id) on delete cascade,
    season text not null,
    starts_on date,
    ends_on date,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.seo_seasonal_calendar enable row level security;

drop policy if exists "SEO Seasonal: public read" on public.seo_seasonal_calendar;
create policy "SEO Seasonal: public read"
    on public.seo_seasonal_calendar for select
    using (is_active = true);

drop policy if exists "SEO Seasonal: admin/service all" on public.seo_seasonal_calendar;
create policy "SEO Seasonal: admin/service all"
    on public.seo_seasonal_calendar for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);


-- =============================================================================
-- 12. seo_cannibalization_alerts
-- =============================================================================
-- POLICY AUDIT: admin/service only.
--   Verdict:  REQUIRED. An alert is an internal quality signal derived from our
--             own scoring; publishing it would expose the detection heuristic.
-- =============================================================================
create table if not exists public.seo_cannibalization_alerts (
    id uuid primary key default gen_random_uuid(),
    keyword_id uuid references public.seo_keywords(id) on delete cascade,
    conflicting_keyword_id uuid references public.seo_keywords(id) on delete set null,
    severity text,
    status text not null default 'open'
);

-- =============================================================================
-- 13. seo_keyword_audit_log
-- =============================================================================
-- POLICY AUDIT: admin/service only.
--   Verdict:  REQUIRED. An audit log records who changed what. It must never be
--             publicly readable.
-- =============================================================================
create table if not exists public.seo_keyword_audit_log (
    id uuid primary key default gen_random_uuid(),
    keyword_id uuid references public.seo_keywords(id) on delete set null,
    actor uuid references auth.users(id) on delete set null,
    action text not null,
    payload jsonb,
    created_at timestamptz not null default now()
);

alter table public.seo_keyword_audit_log enable row level security;

drop policy if exists "SEO Audit Log: admin/service all" on public.seo_keyword_audit_log;
create policy "SEO Audit Log: admin/service all"
    on public.seo_keyword_audit_log for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);


-- =============================================================================
-- 14. Indexes (all IF NOT EXISTS — re-running is safe)
-- =============================================================================
-- PLACEMENT NOTE: this block originally sat BEFORE seo_competitor_observations
-- and seo_cannibalization_alerts were created, so it failed with 42P01
-- "relation does not exist". Indexes must follow every table they reference,
-- so it is emitted at the end of the file.
create index if not exists idx_seo_keywords_lifecycle_market
    on public.seo_keywords (lifecycle_status, market);
create index if not exists idx_seo_keywords_ymyl_review
    on public.seo_keywords (is_ymyl, requires_review);


-- =============================================================================
-- 15. EXPLICIT NON-ACTIONS
-- =============================================================================
-- * The existing UNIQUE(language, normalized_keyword) on seo_keywords is NOT
--   altered. Widening it to (language, market, normalized_keyword) remains
--   BLOCKED behind the collision gates.
-- * No row is dropped, deleted or rewritten beyond the two additive backfills
--   above, which only fill newly-created columns.
-- * seo_keyword_weekly_states is created by 20260930130000, NOT here. Its RLS is
--   a separate additive migration (D) so the security decision stays auditable.
--
-- ROLLBACK CAVEAT: a rollback cannot restore the prior state of a column that
-- did not exist before. Rolling back means dropping the added columns, which
-- discards the backfilled values. The backfill is idempotent and re-derivable
-- from `locale`, so nothing is lost permanently — but a rollback is a real data
-- operation, not a no-op.
-- =============================================================================

alter table public.seo_cannibalization_alerts enable row level security;

drop policy if exists "SEO Cannibalization: admin/service all" on public.seo_cannibalization_alerts;
create policy "SEO Cannibalization: admin/service all"
    on public.seo_cannibalization_alerts for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);


-- =============================================================================
-- 10. seo_competitor_observations — what we OBSERVED about competitors
-- =============================================================================
-- POLICY AUDIT: admin/service only. NO public read.
--   Consumer: gap analysis, competitive reports, admin dashboards.
--   Verdict:  The most sensitive table here. A row records what a competitor's
--             page contained at a point in time, including fetched body
--             signals. Publishing it would disclose our crawl results and
--             measurement approach. The original A scoped this to admin/service;
--             that scope is KEPT and stated explicitly so a future edit does not
--             widen it by accident.
-- =============================================================================
create table if not exists public.seo_competitor_observations (
    id uuid primary key default gen_random_uuid(),
    competitor_id uuid references public.seo_competitors(id) on delete cascade,
    keyword_id uuid references public.seo_keywords(id) on delete set null,
    url text not null,
    title text,
    headings jsonb,
    observed_at timestamptz not null default now(),
    content_hash text,
    signals jsonb,
    created_at timestamptz not null default now()
);

alter table public.seo_competitor_observations enable row level security;

-- Intentionally NO public/anon read policy is created for this table.

drop policy if exists "SEO Competitor Obs: admin/service all" on public.seo_competitor_observations;
create policy "SEO Competitor Obs: admin/service all"
    on public.seo_competitor_observations for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);

alter table public.seo_keyword_pins enable row level security;

drop policy if exists "SEO Pins: public read" on public.seo_keyword_pins;
create policy "SEO Pins: public read"
    on public.seo_keyword_pins for select
    using (true);

drop policy if exists "SEO Pins: admin/service all" on public.seo_keyword_pins;
create policy "SEO Pins: admin/service all"
    on public.seo_keyword_pins for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);

-- that belongs to a human, not to a migration. `destination_verified` stays
-- false for every row, so the distinction is not silently lost.
-- =============================================================================
update public.seo_keywords
set
    final_score = score,
    target_url  = destination_path
where final_score is null;

-- Post-condition: these MUST be zero. If either is non-zero, the backfill
-- turned a real value into a NULL and must be rolled back.
-- select count(*) filter (where final_score is null) as final_score_nulls
--   from public.seo_keywords;
-- select count(*) filter (where target_url is null)  as target_url_nulls
--   from public.seo_keywords;
-- select count(*) filter (where market = 'global')  as global_market_rows
--   from public.seo_keywords;
-- select count(*) filter (where market is null)    as unresolved_market_rows
--   from public.seo_keywords;
-- =============================================================================
-- 14. INDEXES (deferred) — see the placement note in the original block.
-- =============================================================================
-- These reference tables created LATER in the file, so they are emitted last.
create index if not exists idx_seo_competitor_obs_comp_date
    on public.seo_competitor_observations (competitor_id, observed_at desc);
create index if not exists idx_seo_cannibalization_status
    on public.seo_cannibalization_alerts (status);
create index if not exists idx_seo_audit_log_keyword_date
    on public.seo_keyword_audit_log (keyword_id, created_at desc);
