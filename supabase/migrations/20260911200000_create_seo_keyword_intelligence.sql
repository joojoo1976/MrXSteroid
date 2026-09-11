-- ============================================================
-- LIVE SEO KEYWORD INTELLIGENCE SYSTEM
-- Migration: 20260911200000_create_seo_keyword_intelligence.sql
-- ============================================================

-- 1. seo_keyword_snapshots: Weekly pre-computed datasets for ultra-fast serving (<50ms)
create table if not exists public.seo_keyword_snapshots (
    id uuid primary key default gen_random_uuid(),
    language text not null check (language in ('en', 'ar')),
    year int not null,
    week_number int not null,
    snapshot_data jsonb not null,
    created_at timestamptz not null default now(),
    constraint seo_keyword_snapshots_year_week_lang_unique unique (year, week_number, language)
);

alter table public.seo_keyword_snapshots enable row level security;

drop policy if exists "SEO Snapshots: public read" on public.seo_keyword_snapshots;
create policy "SEO Snapshots: public read"
    on public.seo_keyword_snapshots for select
    using (true);

drop policy if exists "SEO Snapshots: admin/service all" on public.seo_keyword_snapshots;
create policy "SEO Snapshots: admin/service all"
    on public.seo_keyword_snapshots for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);

create index if not exists idx_seo_snapshots_lang_year_week
    on public.seo_keyword_snapshots (language, year desc, week_number desc);

-- 2. seo_keywords: Central repository of keywords with metadata, scores & intent
create table if not exists public.seo_keywords (
    id uuid primary key default gen_random_uuid(),
    language text not null check (language in ('en', 'ar')),
    locale text not null default 'en-US',
    original_keyword text not null,
    normalized_keyword text not null,
    cluster text not null,
    intent text not null check (intent in ('informational', 'commercial', 'transactional', 'navigational', 'comparison', 'question', 'unknown')),
    trend_status text not null default 'stable' check (trend_status in ('new', 'rising', 'stable', 'declining', 'retired')),
    destination_path text not null,
    score numeric(5,2) not null default 50.0 check (score >= 0 and score <= 100),
    score_components jsonb not null default '{}'::jsonb,
    source text not null check (source in ('baseline', 'internal_search', 'trend', 'seasonal', 'competitor', 'admin')),
    last_observed_at timestamptz not null default now(),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint seo_keywords_lang_norm_unique unique (language, normalized_keyword)
);

alter table public.seo_keywords enable row level security;

drop policy if exists "SEO Keywords: public read active" on public.seo_keywords;
create policy "SEO Keywords: public read active"
    on public.seo_keywords for select
    using (is_active = true and trend_status != 'retired');

drop policy if exists "SEO Keywords: admin/service all" on public.seo_keywords;
create policy "SEO Keywords: admin/service all"
    on public.seo_keywords for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);

drop trigger if exists seo_keywords_set_updated_at on public.seo_keywords;
create trigger seo_keywords_set_updated_at
    before update on public.seo_keywords
    for each row execute function public.handle_updated_at();

create index if not exists idx_seo_keywords_lang_active_score
    on public.seo_keywords (language, is_active, score desc);
create index if not exists idx_seo_keywords_cluster
    on public.seo_keywords (cluster);
create index if not exists idx_seo_keywords_trend_status
    on public.seo_keywords (trend_status);
create index if not exists idx_seo_keywords_intent
    on public.seo_keywords (intent);

-- 3. seo_keyword_refresh_runs: Audit log for automated weekly and manual refresh jobs
create table if not exists public.seo_keyword_refresh_runs (
    id uuid primary key default gen_random_uuid(),
    started_at timestamptz not null default now(),
    finished_at timestamptz,
    status text not null check (status in ('running', 'completed', 'failed')),
    keywords_scanned int not null default 0,
    new_keywords int not null default 0,
    updated_keywords int not null default 0,
    retired_keywords int not null default 0,
    duplicates_prevented int not null default 0,
    error_log text,
    snapshot_id uuid references public.seo_keyword_snapshots(id) on delete set null,
    summary jsonb default '{}'::jsonb
);

alter table public.seo_keyword_refresh_runs enable row level security;

drop policy if exists "SEO Refresh Runs: admin/service all" on public.seo_keyword_refresh_runs;
create policy "SEO Refresh Runs: admin/service all"
    on public.seo_keyword_refresh_runs for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);

create index if not exists idx_seo_refresh_runs_created
    on public.seo_keyword_refresh_runs (started_at desc);

-- 4. seo_internal_search_logs: Anonymous internal search telemetry (Zero PII)
create table if not exists public.seo_internal_search_logs (
    id uuid primary key default gen_random_uuid(),
    query text not null,
    normalized_query text not null,
    language text not null default 'en',
    results_count int not null default 0,
    created_at timestamptz not null default now()
);

alter table public.seo_internal_search_logs enable row level security;

drop policy if exists "SEO Search Logs: anon insert" on public.seo_internal_search_logs;
create policy "SEO Search Logs: anon insert"
    on public.seo_internal_search_logs for insert
    with check (true);

drop policy if exists "SEO Search Logs: admin/service select" on public.seo_internal_search_logs;
create policy "SEO Search Logs: admin/service select"
    on public.seo_internal_search_logs for select to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    );

create index if not exists idx_seo_search_logs_query_lang
    on public.seo_internal_search_logs (language, normalized_query);
create index if not exists idx_seo_search_logs_created
    on public.seo_internal_search_logs (created_at desc);
