-- ============================================================
-- GLOBAL SEO INTELLIGENCE PLATFORM v3.0
-- Migration: 20260918180000_seo_search_telemetry_and_attribution.sql
-- Anonymous search hash telemetry + conversion attribution model
-- ============================================================

-- 1. Enhance seo_internal_search_logs with Section 14 specifications
alter table public.seo_internal_search_logs
    add column if not exists query_hash text,
    add column if not exists locale text,
    add column if not exists country_code char(2),
    add column if not exists clicked_result text,
    add column if not exists search_success boolean default true,
    add column if not exists session_reference_hash text;

create index if not exists idx_seo_search_logs_hash
    on public.seo_internal_search_logs (query_hash);

create index if not exists idx_seo_search_logs_success_results
    on public.seo_internal_search_logs (search_success, results_count);

-- 2. Keyword Conversion Attribution: seo_keyword_attributions (Section 16)
create table if not exists public.seo_keyword_attributions (
    id uuid primary key default gen_random_uuid(),
    keyword_id uuid references public.seo_keywords(id) on delete set null,
    query_hash text,
    landing_page text not null,
    attribution_model text not null default 'last_touch' check (
        attribution_model in ('last_touch', 'first_touch', 'linear', 'position_based', 'data_driven')
    ),
    attribution_window_days int not null default 30,
    attribution_confidence numeric(5,2) default 85.0,
    order_id text,
    amount numeric(10,2) default 0.0,
    currency text default 'USD',
    event_type text not null check (
        event_type in ('page_view', 'add_to_cart', 'checkout_start', 'purchase')
    ),
    created_at timestamptz not null default now()
);

alter table public.seo_keyword_attributions enable row level security;

drop policy if exists "SEO Attribution: admin/service all" on public.seo_keyword_attributions;
create policy "SEO Attribution: admin/service all"
    on public.seo_keyword_attributions for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);

create index if not exists idx_seo_attribution_kw_event
    on public.seo_keyword_attributions (keyword_id, event_type);

create index if not exists idx_seo_attribution_created
    on public.seo_keyword_attributions (created_at desc);
