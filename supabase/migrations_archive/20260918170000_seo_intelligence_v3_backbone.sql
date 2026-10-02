-- ============================================================
-- GLOBAL SEO INTELLIGENCE PLATFORM v3.0
-- Migration: 20260918170000_seo_intelligence_v3_backbone.sql
-- Non-destructive extensions & progressive enhancements
-- ============================================================

-- 1. Source Registry: seo_keyword_sources
create table if not exists public.seo_keyword_sources (
    id uuid primary key default gen_random_uuid(),
    source_type text not null check (
        source_type in (
            'google_search_console',
            'google_trends',
            'keyword_planner',
            'ahrefs',
            'semrush',
            'similarweb',
            'internal_search',
            'analytics',
            'competitor_page',
            'editorial',
            'ai_suggested',
            'admin'
        )
    ),
    source_name text not null,
    source_url text,
    provider_account_ref text,
    country_code char(2),
    locale text,
    retrieval_period_start date,
    retrieval_period_end date,
    retrieved_at timestamptz not null default now(),
    reliability_score numeric(5,2) check (reliability_score >= 0 and reliability_score <= 100),
    terms_verified boolean not null default false,
    metadata jsonb not null default '{}'::jsonb,
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

-- 2. Topic Clusters: seo_topic_clusters
create table if not exists public.seo_topic_clusters (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    name_ar text,
    name_en text,
    locale text,
    country_code char(2),
    parent_cluster_id uuid references public.seo_topic_clusters(id) on delete set null,
    pillar_keyword_id uuid references public.seo_keywords(id) on delete set null,
    description text,
    authority_status text not null default 'planned' check (authority_status in ('planned', 'building', 'established', 'dominant')),
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

-- 3. Enhance seo_keywords with v3.0 data model
alter table public.seo_keywords
    add column if not exists country_code char(2),
    add column if not exists market text default 'global',
    add column if not exists region text,
    add column if not exists keyword_type text default 'general',
    add column if not exists topic_cluster_id uuid references public.seo_topic_clusters(id) on delete set null,
    add column if not exists parent_topic text,
    add column if not exists topic_role text check (topic_role is null or topic_role in ('pillar','supporting','commercial','tool','faq','comparison')),
    add column if not exists target_url text,
    add column if not exists destination_type text,
    add column if not exists destination_verified boolean not null default false,
    add column if not exists lifecycle_status text not null default 'active' check (lifecycle_status in ('candidate','experimental','pending_review','approved','active','retired','blocked')),
    add column if not exists is_ymyl boolean not null default false,
    add column if not exists medical_risk_level text check (medical_risk_level is null or medical_risk_level in ('low','medium','high')),
    add column if not exists requires_review boolean not null default false,
    add column if not exists review_status text not null default 'approved' check (review_status in ('pending','approved','rejected','needs_edit')),
    add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
    add column if not exists reviewed_at timestamptz,
    add column if not exists review_notes text,
    add column if not exists search_volume numeric,
    add column if not exists search_volume_min numeric,
    add column if not exists search_volume_max numeric,
    add column if not exists search_volume_source text,
    add column if not exists search_volume_period text,
    add column if not exists search_volume_updated_at timestamptz,
    add column if not exists demand_score numeric(5,2),
    add column if not exists growth_score numeric(5,2),
    add column if not exists relevance_score numeric(5,2),
    add column if not exists intent_score numeric(5,2),
    add column if not exists commercial_score numeric(5,2),
    add column if not exists conversion_score numeric(5,2),
    add column if not exists content_opportunity_score numeric(5,2),
    add column if not exists seasonal_score numeric(5,2),
    add column if not exists competitor_gap_score numeric(5,2),
    add column if not exists organic_performance_score numeric(5,2),
    add column if not exists authority_gap_score numeric(5,2),
    add column if not exists confidence_score numeric(5,2) default 70.0,
    add column if not exists competition_level text check (competition_level is null or competition_level in ('low','medium','high','very_high')),
    add column if not exists competition_penalty numeric(5,2) default 0.0,
    add column if not exists duplicate_penalty numeric(5,2) default 0.0,
    add column if not exists repetition_penalty numeric(5,2) default 0.0,
    add column if not exists cannibalization_penalty numeric(5,2) default 0.0,
    add column if not exists raw_score numeric(8,4),
    add column if not exists final_score numeric(5,2),
    add column if not exists score_version text default 'v3.0',
    add column if not exists first_seen_at timestamptz default now(),
    add column if not exists last_seen_at timestamptz default now(),
    add column if not exists last_appeared_at timestamptz default now(),
    add column if not exists last_scored_at timestamptz default now(),
    add column if not exists last_published_at timestamptz;

-- Update existing rows in seo_keywords to have sane v3.0 defaults
update public.seo_keywords
set final_score = score,
    target_url = destination_path,
    relevance_score = coalesce((score_components->>'relevance')::numeric, 90.0),
    demand_score = coalesce((score_components->>'demand')::numeric, 80.0),
    growth_score = coalesce((score_components->>'trend')::numeric, 75.0),
    commercial_score = coalesce((score_components->>'commercial')::numeric, 70.0),
    seasonal_score = coalesce((score_components->>'seasonal')::numeric, 80.0),
    competitor_gap_score = coalesce((score_components->>'competitorGap')::numeric, 50.0),
    confidence_score = 75.0,
    score_version = 'v3.0'
where final_score is null;

-- 4. Keyword Source Links (Provenance): seo_keyword_source_links
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

drop policy if exists "SEO Source Links: admin/service all" on public.seo_keyword_source_links;
create policy "SEO Source Links: admin/service all"
    on public.seo_keyword_source_links for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);

-- 5. Pinning Management: seo_keyword_pins
create table if not exists public.seo_keyword_pins (
    keyword_id uuid primary key references public.seo_keywords(id) on delete cascade,
    pinned_by uuid references auth.users(id) on delete set null,
    pin_note text,
    created_at timestamptz not null default now()
);

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

-- 6. Blocking Management: seo_keyword_blocks
create table if not exists public.seo_keyword_blocks (
    id uuid primary key default gen_random_uuid(),
    keyword_id uuid references public.seo_keywords(id) on delete set null,
    normalized_keyword text not null,
    language text not null check (language in ('en', 'ar')),
    locale text,
    block_scope text not null default 'global' check (block_scope in ('global', 'locale', 'market')),
    reason_code text,
    reason text,
    blocked_until timestamptz,
    blocked_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    constraint seo_blocks_lang_kw_scope_unique unique (language, normalized_keyword, block_scope)
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

-- 7. Competitor Intelligence: seo_competitors & seo_competitor_observations
create table if not exists public.seo_competitors (
    id uuid primary key default gen_random_uuid(),
    domain text not null unique,
    name text not null,
    market text default 'global',
    language text,
    locale text,
    country_code char(2),
    competitor_type text,
    source_url text,
    is_active boolean not null default true,
    last_checked_at timestamptz,
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

create table if not exists public.seo_competitor_observations (
    id uuid primary key default gen_random_uuid(),
    competitor_id uuid references public.seo_competitors(id) on delete cascade,
    url text not null,
    title text,
    meta_description text,
    headings jsonb default '[]'::jsonb,
    detected_terms jsonb default '[]'::jsonb,
    schema_types text[],
    content_type text,
    observed_at timestamptz not null default now(),
    source_type text not null default 'public_page',
    source_url text,
    confidence_score numeric(5,2) default 65.0,
    raw_reference jsonb default '{}'::jsonb
);

alter table public.seo_competitor_observations enable row level security;

drop policy if exists "SEO Competitor Obs: admin/service all" on public.seo_competitor_observations;
create policy "SEO Competitor Obs: admin/service all"
    on public.seo_competitor_observations for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);

-- 8. Seasonal Calendar: seo_seasonal_calendar
create table if not exists public.seo_seasonal_calendar (
    id uuid primary key default gen_random_uuid(),
    event_name text not null,
    event_name_ar text,
    event_name_en text,
    locale text,
    country_code char(2),
    start_date date,
    end_date date,
    recurring_rule text,
    boost_clusters text[] default '{}',
    boost_score numeric(5,2) default 15.0,
    source_url text,
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

-- 9. Keyword Cannibalization Detection: seo_cannibalization_alerts
create table if not exists public.seo_cannibalization_alerts (
    id uuid primary key default gen_random_uuid(),
    keyword_id uuid references public.seo_keywords(id) on delete cascade,
    url_a text not null,
    url_b text not null,
    similarity_score numeric(5,2),
    severity text not null check (severity in ('low','medium','high')),
    status text not null default 'open' check (status in ('open','reviewed','resolved','ignored')),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.seo_cannibalization_alerts enable row level security;

drop policy if exists "SEO Cannibalization: admin/service all" on public.seo_cannibalization_alerts;
create policy "SEO Cannibalization: admin/service all"
    on public.seo_cannibalization_alerts for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);

-- 10. Audit Logging: seo_keyword_audit_log
create table if not exists public.seo_keyword_audit_log (
    id uuid primary key default gen_random_uuid(),
    keyword_id uuid references public.seo_keywords(id) on delete set null,
    action text not null,
    old_value jsonb,
    new_value jsonb,
    performed_by uuid references auth.users(id) on delete set null,
    source text not null default 'system',
    request_id text,
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

-- 11. Useful indexes for speed & reporting
create index if not exists idx_seo_keywords_lifecycle_market
    on public.seo_keywords (lifecycle_status, market, language);
create index if not exists idx_seo_keywords_ymyl_review
    on public.seo_keywords (is_ymyl, requires_review, review_status);
create index if not exists idx_seo_competitor_obs_comp_date
    on public.seo_competitor_observations (competitor_id, observed_at desc);
create index if not exists idx_seo_cannibalization_status
    on public.seo_cannibalization_alerts (status, severity);
create index if not exists idx_seo_audit_log_keyword_date
    on public.seo_keyword_audit_log (keyword_id, created_at desc);
