-- ============================================================
-- affiliate_attributions: Server-side attribution store.
--
-- Purpose: Persist referral attribution server-side so it
-- survives cookie loss, browser restarts, or incognito sessions.
-- When a user visits ?ref=CODE the tracking endpoint writes here.
-- When a checkout starts, this record is copied to invoices.
--
-- Rules:
--   - One active attribution per user at a time (last valid wins).
--   - 60-day expiry enforced by expires_at column.
--   - Self-referral is blocked at application layer; this table
--     stores the raw attribution to support audit.
--   - Immutable once converted (attribution_used = true).
-- ============================================================

create table if not exists public.affiliate_attributions (
    id                  uuid        primary key default gen_random_uuid(),
    user_id             uuid        references auth.users(id) on delete cascade,
    -- null user_id is allowed for anonymous visitors (matched at checkout by session)
    session_id          text,       -- fallback fingerprint when user is not logged in
    affiliate_id        uuid        not null references public.affiliates(id) on delete cascade,
    referral_code       text        not null,
    attribution_source  text        not null default 'url_param'
                        check (attribution_source in ('url_param','cookie','admin','server')),
    attributed_at       timestamptz not null default now(),
    expires_at          timestamptz not null,
    used_at             timestamptz,
    attribution_used    boolean     not null default false,
    invoice_id          uuid        references public.invoices(id) on delete set null,
    ip_address          text,       -- hashed at insertion, never raw
    user_agent_hash     text,       -- hashed, for fingerprinting only
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),

    -- Ensure expires_at is always after attributed_at
    constraint aff_attr_expires_after_attributed check (expires_at > attributed_at)
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists idx_aff_attr_user_id
    on public.affiliate_attributions(user_id)
    where user_id is not null;

create index if not exists idx_aff_attr_affiliate_id
    on public.affiliate_attributions(affiliate_id);

create index if not exists idx_aff_attr_referral_code
    on public.affiliate_attributions(referral_code);

create index if not exists idx_aff_attr_expires_at
    on public.affiliate_attributions(expires_at)
    where attribution_used = false;

create index if not exists idx_aff_attr_session_id
    on public.affiliate_attributions(session_id)
    where session_id is not null and attribution_used = false;

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.affiliate_attributions enable row level security;

-- Users can see their own active attributions
drop policy if exists "AffAttr: user view own" on public.affiliate_attributions;
create policy "AffAttr: user view own"
    on public.affiliate_attributions for select
    to authenticated
    using ((select auth.uid()) = user_id);

-- Only service role (bypasses RLS) writes — no authenticated INSERT/UPDATE
-- This table is written exclusively by server-side webhook/tracking handlers
drop policy if exists "AffAttr: admin all" on public.affiliate_attributions;
create policy "AffAttr: admin all"
    on public.affiliate_attributions for all
    to authenticated
    using (
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
    );

-- ── Updated-at trigger ───────────────────────────────────────────────────────
drop trigger if exists aff_attr_set_updated_at on public.affiliate_attributions;
create trigger aff_attr_set_updated_at
    before update on public.affiliate_attributions
    for each row execute function public.handle_updated_at();

-- ── Helper RPC: resolve latest active attribution for a user ─────────────────
-- Returns the newest non-expired, non-used attribution for a given user_id.
-- SECURITY DEFINER so it can be called from service role context safely.
create or replace function public.resolve_active_attribution(p_user_id uuid)
returns table (
    attribution_id  uuid,
    affiliate_id    uuid,
    referral_code   text,
    expires_at      timestamptz,
    attribution_source text
)
language sql
security definer
set search_path = ''
stable
as $$
    select
        id              as attribution_id,
        affiliate_id,
        referral_code,
        expires_at,
        attribution_source
    from public.affiliate_attributions
    where user_id = p_user_id
      and attribution_used = false
      and expires_at > now()
    order by attributed_at desc
    limit 1;
$$;

revoke execute on function public.resolve_active_attribution from public, anon, authenticated;

comment on table public.affiliate_attributions is
    'Server-side referral attribution records. Written by tracking endpoint, read at checkout to stamp invoices with affiliate data. Survives cookie loss.';
