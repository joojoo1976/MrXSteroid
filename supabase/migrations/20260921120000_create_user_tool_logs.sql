-- ==============================================================================
-- Migration: 20260921120000_create_user_tool_logs.sql
-- Description: Unified snapshot store for the Mr. X-Steroid 5-layer tool stack.
--
--   One row per tool snapshot, discriminated by `snapshot_type`:
--     draft                  → 1 row per (user, tool)      — auto-saved live input
--     submitted_snapshot     → append-only history         — "Save to Bio-Dashboard"
--     dashboard_projection   → 1 row per (user, tool)      — live dashboard tile
--
--   The single-row rules for draft/projection are enforced by PARTIAL UNIQUE
--   indexes, so a concurrent writer can never create duplicate tiles. Service
--   code performs SELECT→UPDATE (PostgREST cannot infer a partial index in an
--   `ON CONFLICT` clause) and treats 23505 as a lost race → retry as update.
-- ==============================================================================

-- 1. ENUMs ---------------------------------------------------------------------
-- Postgres has no `CREATE TYPE IF NOT EXISTS`, and re-running a bare CREATE TYPE
-- aborts the whole migration, so each type is guarded by a DO block.
do $$
begin
    if not exists (
        select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
        where t.typname = 'snapshot_type_enum' and n.nspname = 'public'
    ) then
        create type public.snapshot_type_enum as enum ('draft', 'submitted_snapshot', 'dashboard_projection');
    end if;

    if not exists (
        select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
        where t.typname = 'access_tier_enum' and n.nspname = 'public'
    ) then
        create type public.access_tier_enum as enum ('free', 'premium');
    end if;
end $$;

-- 2. Table ---------------------------------------------------------------------
create table if not exists public.user_tool_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    tool_slug text not null check (tool_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    tool_version text not null default '1.0.0' check (tool_version ~ '^\d+\.\d+\.\d+$'),
    snapshot_type public.snapshot_type_enum not null default 'draft',
    -- Server-derived from TOOL_REGISTRY at write time (never trusted from the
    -- client payload) so the dashboard can be tier-gated without parsing JSON.
    access_tier public.access_tier_enum not null default 'free',
    inputs jsonb not null default '{}'::jsonb check (jsonb_typeof(inputs) = 'object'),
    output_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(output_snapshot) = 'object'),
    provenance jsonb not null default '{}'::jsonb check (jsonb_typeof(provenance) = 'object'),
    locale text not null default 'ar' check (locale in ('ar', 'en')),
    unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. Indexes -------------------------------------------------------------------
-- History feed for one tool, newest first.
create index if not exists idx_user_tool_logs_lookup
    on public.user_tool_logs (user_id, tool_slug, created_at desc);

-- Full dashboard read path (all tools of one user, ordered).
create index if not exists idx_user_tool_logs_dashboard
    on public.user_tool_logs (user_id, snapshot_type, created_at desc);

-- Tier gating of the live dashboard tiles.
create index if not exists idx_user_tool_logs_tier
    on public.user_tool_logs (user_id, access_tier)
    where snapshot_type = 'dashboard_projection';

-- Exactly one live projection per (user, tool).
create unique index if not exists uq_user_tool_logs_projection
    on public.user_tool_logs (user_id, tool_slug)
    where snapshot_type = 'dashboard_projection';

-- Exactly one cached draft per (user, tool) — draft bloat is not allowed.
create unique index if not exists uq_user_tool_logs_draft
    on public.user_tool_logs (user_id, tool_slug)
    where snapshot_type = 'draft';

-- 4. updated_at trigger (reuses the shared helper from the CMS migration) ------
drop trigger if exists user_tool_logs_set_updated_at on public.user_tool_logs;
create trigger user_tool_logs_set_updated_at
    before update on public.user_tool_logs
    for each row execute function public.handle_updated_at();

-- 5. RLS -----------------------------------------------------------------------
alter table public.user_tool_logs enable row level security;

drop policy if exists "Tool Logs: users view own" on public.user_tool_logs;
create policy "Tool Logs: users view own"
    on public.user_tool_logs for select to authenticated
    using ((select auth.uid()) = user_id);

drop policy if exists "Tool Logs: users insert own" on public.user_tool_logs;
create policy "Tool Logs: users insert own"
    on public.user_tool_logs for insert to authenticated
    with check ((select auth.uid()) = user_id);

drop policy if exists "Tool Logs: users update own" on public.user_tool_logs;
create policy "Tool Logs: users update own"
    on public.user_tool_logs for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

drop policy if exists "Tool Logs: users delete own" on public.user_tool_logs;
create policy "Tool Logs: users delete own"
    on public.user_tool_logs for delete to authenticated
    using ((select auth.uid()) = user_id);

drop policy if exists "Tool Logs: admin all" on public.user_tool_logs;
create policy "Tool Logs: admin all"
    on public.user_tool_logs for all to authenticated
    using (
        coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin'
        or (select auth.role()) = 'service_role'
    )
    with check (true);

comment on table public.user_tool_logs is
    'Unified tool snapshot store (draft / submitted_snapshot / dashboard_projection) for the 5-layer tool stack.';
comment on column public.user_tool_logs.access_tier is
    'Server-derived from TOOL_REGISTRY at write time (lib/tools/registry.ts).';
