-- ==============================================================================
-- Migration: 20260911220000_create_dashboard_persistence.sql
-- Description: Dashboard data persistence tables for user dashboard preferences,
--              goals, notes, and admin analytics metric snapshots in Supabase.
-- ==============================================================================

-- 1. user_dashboard_data: Stores individual user dashboard state & preferences
create table if not exists public.user_dashboard_data (
    id uuid primary key default gen_random_uuid(),
    user_id uuid unique not null references auth.users(id) on delete cascade,
    pinned_tools text[] default array['macro', 'bodyfat', 'injection', 'halflife']::text[],
    custom_goals jsonb default '{"targetWeight": null, "targetBodyFat": null, "currentPhase": "cutting"}'::jsonb,
    saved_notes text default '',
    theme_preference text default 'dark',
    currency_preference text default 'USD',
    last_active_at timestamptz default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.user_dashboard_data enable row level security;

drop policy if exists "Dashboard: users view own" on public.user_dashboard_data;
create policy "Dashboard: users view own"
    on public.user_dashboard_data for select to authenticated
    using (auth.uid() = user_id);

drop policy if exists "Dashboard: users insert own" on public.user_dashboard_data;
create policy "Dashboard: users insert own"
    on public.user_dashboard_data for insert to authenticated
    with check (auth.uid() = user_id);

drop policy if exists "Dashboard: users update own" on public.user_dashboard_data;
create policy "Dashboard: users update own"
    on public.user_dashboard_data for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Dashboard: admin all" on public.user_dashboard_data;
create policy "Dashboard: admin all"
    on public.user_dashboard_data for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    );

create index if not exists idx_user_dashboard_data_user_id
    on public.user_dashboard_data (user_id);

-- 2. admin_dashboard_metrics: Stores pre-computed business & analytics snapshots
create table if not exists public.admin_dashboard_metrics (
    id uuid primary key default gen_random_uuid(),
    metric_date date not null default current_date,
    metric_type text not null check (metric_type in ('daily_summary', 'weekly_summary', 'monthly_summary', 'realtime_snapshot')),
    total_revenue_usd numeric(12,2) default 0,
    total_revenue_egp numeric(12,2) default 0,
    successful_invoices int default 0,
    pending_invoices int default 0,
    failed_invoices int default 0,
    active_subscribers int default 0,
    active_affiliates int default 0,
    seo_active_keywords int default 0,
    seo_avg_score numeric(5,2) default 0,
    metrics_payload jsonb default '{}'::jsonb,
    created_at timestamptz not null default now(),
    constraint admin_dashboard_metrics_unique unique (metric_date, metric_type)
);

alter table public.admin_dashboard_metrics enable row level security;

drop policy if exists "Admin Metrics: admin/service all" on public.admin_dashboard_metrics;
create policy "Admin Metrics: admin/service all"
    on public.admin_dashboard_metrics for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);

create index if not exists idx_admin_dashboard_metrics_date
    on public.admin_dashboard_metrics (metric_date desc);
