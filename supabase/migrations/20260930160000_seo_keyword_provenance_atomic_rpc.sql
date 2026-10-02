-- ============================================================
-- SEO KEYWORD PROVENANCE — ATOMIC WRITE PATH
-- Migration: 20260930160000_seo_keyword_provenance_atomic_rpc.sql
-- (Renamed from 20260930120000 so it sorts AFTER the backbone it depends on.
--  Content is unchanged; only the timestamp moved.)
--
-- DEPENDENCY: requires public.seo_keyword_source_links and
--   public.seo_keyword_sources, created by
--   20260930140000_seo_v3_backbone_revised.sql (A′).
--   This file MUST NOT be applied before A′.
--
-- Root cause addressed (Gap Audit 2026-09-28, "Provenance"):
--   public.seo_keyword_source_links had ZERO write sites,
--   so every keyword in seo_keywords was "source-backed" by assertion only.
--
-- Contents (STRICTLY ADDITIVE):
--   1. Additive columns on public.seo_keyword_source_links
--      (discovered_at, evidence_type, source_reference, confidence,
--       parent_keyword_id, generation_method, updated_at).
--   2. public.seo_resolve_provenance_source(...)  — stable source registry
--      resolver (find by (source_type, source_name) or create once).
--   3. public.seo_upsert_keyword_with_provenance(...)  — keyword upsert +
--      provenance link in ONE function call = ONE transaction, so a keyword
--      can never be persisted without its provenance row.
--   4. public.seo_record_keyword_provenance(...)       — provenance link for
--      an ALREADY persisted keyword (refresh / import paths); refuses to
--      create an orphan link for a non-existent keyword.
--   5. Additive indexes + least-privilege grants.
--
-- Constraints are NOT altered. The existing primary key
-- (keyword_id, source_id) is left untouched and is what makes these writes
-- idempotent (ON CONFLICT DO UPDATE). No constraint is dropped, narrowed or
-- replaced, and no existing row is deleted or rewritten.
-- ============================================================

-- ── 1. Additive provenance columns ───────────────────────────
alter table public.seo_keyword_source_links
    add column if not exists discovered_at timestamptz,
    add column if not exists evidence_type text,
    add column if not exists source_reference text,
    add column if not exists confidence numeric(5,2),
    add column if not exists parent_keyword_id uuid references public.seo_keywords(id) on delete set null,
    add column if not exists generation_method text,
    add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_seo_source_links_discovered_at
    on public.seo_keyword_source_links (discovered_at desc);
create index if not exists idx_seo_source_links_parent_keyword
    on public.seo_keyword_source_links (parent_keyword_id);

-- ── 2. Source registry resolver (internal helper) ────────────
-- Resolves an existing seo_keyword_sources row from (source_type, source_name)
-- or creates one. An existing registry row is never updated, so a source stays
-- a stable, auditable identity across runs.
create or replace function public.seo_resolve_provenance_source(p_source jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_source_id uuid;
begin
    if p_source is null or coalesce(p_source->>'source_name', '') = '' then
        raise exception 'seo provenance: source_name is required';
    end if;

    if coalesce(p_source->>'id', '') <> '' then
        select id into v_source_id
        from public.seo_keyword_sources
        where id = (p_source->>'id')::uuid;

        if v_source_id is null then
            raise exception 'seo provenance: source_id % not found', p_source->>'id';
        end if;
        return v_source_id;
    end if;

    select id into v_source_id
    from public.seo_keyword_sources
    where source_type = coalesce(p_source->>'source_type', 'editorial')
      and source_name = p_source->>'source_name'
    order by created_at asc
    limit 1;

    if v_source_id is not null then
        return v_source_id;
    end if;

    insert into public.seo_keyword_sources (
        source_type,
        source_name,
        source_url,
        provider_account_ref,
        country_code,
        locale,
        reliability_score,
        terms_verified,
        metadata
    ) values (
        coalesce(p_source->>'source_type', 'editorial'),
        p_source->>'source_name',
        p_source->>'source_url',
        p_source->>'provider_account_ref',
        p_source->>'country_code',
        p_source->>'locale',
        nullif(p_source->>'reliability_score', '')::numeric,
        coalesce((p_source->>'terms_verified')::boolean, false),
        coalesce(p_source->'metadata', '{}'::jsonb)
    )
    returning id into v_source_id;

    return v_source_id;
end;
$$;
-- ── 3. Atomic keyword upsert + provenance link ───────────────
-- Idempotent on (language, normalized_keyword) for the keyword and on
-- (keyword_id, source_id) for the link, so re-running creates no duplicates.
-- Only v1 seo_keywords columns (guaranteed present by
-- 20260911200000_create_seo_keyword_intelligence.sql) are written, so the
-- function does not depend on the v3 backbone columns being applied.
create or replace function public.seo_upsert_keyword_with_provenance(
    p_keyword jsonb,
    p_provenance jsonb,
    p_source jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_keyword_id uuid;
    v_source_id uuid;
    v_keyword_inserted boolean;
    v_provenance_written boolean;
begin
    if p_keyword is null then
        raise exception 'seo provenance: keyword payload is required';
    end if;

    -- Fail BEFORE touching seo_keywords: a keyword without provenance fields
    -- is not source-backed, so it must never be written at all.
    if coalesce(p_provenance->>'evidence_type', '') = ''
       or coalesce(p_provenance->>'source_reference', '') = ''
       or coalesce(p_provenance->>'generation_method', '') = '' then
        raise exception
            'seo provenance: evidence_type, source_reference and generation_method are required (no provenance = not source-backed)';
    end if;

    if coalesce(p_keyword->>'language', '') = ''
       or coalesce(p_keyword->>'normalized_keyword', '') = ''
       or coalesce(p_keyword->>'original_keyword', '') = ''
       or coalesce(p_keyword->>'cluster', '') = ''
       or coalesce(p_keyword->>'intent', '') = ''
       or coalesce(p_keyword->>'destination_path', '') = '' then
        raise exception 'seo provenance: keyword payload is missing a required column';
    end if;

    v_source_id := public.seo_resolve_provenance_source(p_source);

    insert into public.seo_keywords (
        language,
        locale,
        original_keyword,
        normalized_keyword,
        cluster,
        intent,
        trend_status,
        destination_path,
        score,
        score_components,
        source,
        last_observed_at,
        is_active
    ) values (
        (p_keyword->>'language')::text,
        coalesce(p_keyword->>'locale', 'en-US')::text,
        (p_keyword->>'original_keyword')::text,
        (p_keyword->>'normalized_keyword')::text,
        (p_keyword->>'cluster')::text,
        (p_keyword->>'intent')::text,
        coalesce(p_keyword->>'trend_status', 'stable')::text,
        (p_keyword->>'destination_path')::text,
        coalesce(nullif(p_keyword->>'score', ''), '50')::numeric,
        coalesce(p_keyword->'score_components', '{}'::jsonb),
        coalesce(p_keyword->>'source', 'admin')::text,
        -- The `::timestamptz` cast belongs INSIDE coalesce: `->>` yields text, so
        -- `coalesce(text, now())` mixes text with timestamptz and Postgres
        -- rejects the whole function at CREATE time. Casting the text branch
        -- keeps both arguments the same type. Casting outside (as this did)
        -- cannot work because the arguments are type-checked first.
        coalesce(nullif(p_keyword->>'last_observed_at', '')::timestamptz, now()),
        coalesce((p_keyword->>'is_active')::boolean, true)
    )
    on conflict (language, normalized_keyword) do update
        set locale = excluded.locale,
            original_keyword = excluded.original_keyword,
            cluster = excluded.cluster,
            intent = excluded.intent,
            trend_status = excluded.trend_status,
            destination_path = excluded.destination_path,
            score = excluded.score,
            score_components = excluded.score_components,
            last_observed_at = excluded.last_observed_at,
            is_active = excluded.is_active
    returning id, (xmax = 0) into v_keyword_id, v_keyword_inserted;
insert into public.seo_keyword_source_links (
        keyword_id,
        source_id,
        observed_value,
        source_metric,
        source_rank,
        source_confidence,
        discovered_at,
        evidence_type,
        source_reference,
        confidence,
        parent_keyword_id,
        generation_method,
        created_at,
        updated_at
    ) values (
        v_keyword_id,
        v_source_id,
        coalesce(p_provenance->'observed_value', '{}'::jsonb),
        p_provenance->>'source_metric',
        nullif(p_provenance->>'source_rank', '')::numeric,
        nullif(p_provenance->>'source_confidence', '')::numeric,
        coalesce(nullif(p_provenance->>'discovered_at', '')::timestamptz, now()),
        (p_provenance->>'evidence_type')::text,
        (p_provenance->>'source_reference')::text,
        nullif(p_provenance->>'confidence', '')::numeric,
        nullif(p_provenance->>'parent_keyword_id', '')::uuid,
        (p_provenance->>'generation_method')::text,
        now(),
        now()
    )
    on conflict (keyword_id, source_id) do update
        set observed_value = excluded.observed_value,
            source_metric = excluded.source_metric,
            source_rank = excluded.source_rank,
            source_confidence = excluded.source_confidence,
            discovered_at = excluded.discovered_at,
            evidence_type = excluded.evidence_type,
            source_reference = excluded.source_reference,
            confidence = excluded.confidence,
            parent_keyword_id = excluded.parent_keyword_id,
            generation_method = excluded.generation_method,
            updated_at = now()
    returning (xmax = 0) into v_provenance_written;

    return jsonb_build_object(
        'keyword_id', v_keyword_id,
        'source_id', v_source_id,
        'keyword_inserted', v_keyword_inserted,
        'provenance_inserted', v_provenance_written,
        'source_backed', true
    );
end;
$$;

-- ── 4. Provenance link for an already-persisted keyword ──────
create or replace function public.seo_record_keyword_provenance(
    p_keyword_id uuid,
    p_provenance jsonb,
    p_source jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_source_id uuid;
    v_exists boolean;
    v_provenance_inserted boolean;
begin
    if p_keyword_id is null then
        raise exception 'seo provenance: keyword_id is required';
    end if;

    if coalesce(p_provenance->>'evidence_type', '') = ''
       or coalesce(p_provenance->>'source_reference', '') = ''
       or coalesce(p_provenance->>'generation_method', '') = '' then
        raise exception
            'seo provenance: evidence_type, source_reference and generation_method are required (no provenance = not source-backed)';
    end if;

    select exists (select 1 from public.seo_keywords where id = p_keyword_id)
      into v_exists;

    if not v_exists then
        raise exception 'seo provenance: keyword % does not exist (refusing to create an orphan source link)', p_keyword_id;
    end if;

    v_source_id := public.seo_resolve_provenance_source(p_source);
insert into public.seo_keyword_source_links (
        keyword_id,
        source_id,
        observed_value,
        source_metric,
        source_rank,
        source_confidence,
        discovered_at,
        evidence_type,
        source_reference,
        confidence,
        parent_keyword_id,
        generation_method,
        created_at,
        updated_at
    ) values (
        p_keyword_id,
        v_source_id,
        coalesce(p_provenance->'observed_value', '{}'::jsonb),
        p_provenance->>'source_metric',
        nullif(p_provenance->>'source_rank', '')::numeric,
        nullif(p_provenance->>'source_confidence', '')::numeric,
        coalesce(nullif(p_provenance->>'discovered_at', '')::timestamptz, now()),
        (p_provenance->>'evidence_type')::text,
        (p_provenance->>'source_reference')::text,
        nullif(p_provenance->>'confidence', '')::numeric,
        nullif(p_provenance->>'parent_keyword_id', '')::uuid,
        (p_provenance->>'generation_method')::text,
        now(),
        now()
    )
    on conflict (keyword_id, source_id) do update
        set observed_value = excluded.observed_value,
            source_metric = excluded.source_metric,
            source_rank = excluded.source_rank,
            source_confidence = excluded.source_confidence,
            discovered_at = excluded.discovered_at,
            evidence_type = excluded.evidence_type,
            source_reference = excluded.source_reference,
            confidence = excluded.confidence,
            parent_keyword_id = excluded.parent_keyword_id,
            generation_method = excluded.generation_method,
            updated_at = now()
    returning (xmax = 0) into v_provenance_inserted;

    return jsonb_build_object(
        'keyword_id', p_keyword_id,
        'source_id', v_source_id,
        'provenance_inserted', v_provenance_inserted,
        'source_backed', true
    );
end;
$$;

-- ── 5. Least privilege ───────────────────────────────────────
revoke execute on function public.seo_resolve_provenance_source(jsonb) from public, anon, authenticated;
revoke execute on function public.seo_upsert_keyword_with_provenance(jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.seo_record_keyword_provenance(uuid, jsonb, jsonb) from public, anon, authenticated;

grant execute on function public.seo_upsert_keyword_with_provenance(jsonb, jsonb, jsonb) to service_role;
grant execute on function public.seo_record_keyword_provenance(uuid, jsonb, jsonb) to service_role;
