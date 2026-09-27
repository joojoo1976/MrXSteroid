-- ==============================================================================
-- MIGRATION: 20260924230000_affiliate_ledger_payout_expansion.sql
-- PHASE:     Affiliate / Ledger / Payout Expansion (owner approved, 2026-09-24)
--
-- PURPOSE: Single self-contained, idempotent migration delivering the phase
--          scope on top of the already-applied Phase 3 v5.1 backbone:
--
--          1. Replay `affiliate_attributions` (20260919120000) — server-side
--             attribution store + resolve_active_attribution RPC + RLS.
--          2. D-4: unique constraint affiliate_attributions(user_id,
--             referral_code) with a preflight that ABORTS on existing
--             duplicates.
--          3. Replay `affiliate_security_hardening` (20260919121000) — DB-level
--             double-commission guard on referrals + affiliate/ledger/audit RLS
--             hardening + invoices attribution columns.
--          4. D-1: seed the canonical 85/10/5 default split-rule set:
--               - Author   85%  -> BENEFICIARY_PAYABLE      (real internal
--                 beneficiary, role='author'; NO invented payout details —
--                 payout_method/destination remain NULL/unconfigured).
--               - Reserved 5%  -> RESERVE ledger account     (internal
--                 identity only; payout execution always blocked).
--               - Platform 10% -> PLATFORM_REVENUE ledger account (NO fake
--                 beneficiary; maps to internal ledger account per Posting
--                 Matrix §6.3).
--          5. D-2: exact §6.3 posting support in the schema —
--               - financial_ledger account CHECK: add `RESERVE`, retire
--                 `SALES_CLEARING`.
--               - beneficiaries.role CHECK: add `reserve`; payout_method
--                 relaxed to NULL (owner: unused unconfigured destinations).
--               - split_rules: beneficiary_id nullable + destination_account
--                 column + canonical_key for idempotent versioned seeds.
--               - order_splits: beneficiary_id nullable + destination_account +
--                 approval columns (`admin_approved`, `approved_by`,
--                 `approved_at`, `approval_batch_id`) and status `approved`.
--               - payouts: additive approval columns (`admin_approved`,
--                 `approved_by`, `approved_at`, `approval_batch_id`).
--          6. payout_gates table seeded with C_2 / D_8 / LIVE_ACTIVATION all
--             UNCONFIRMED — live payout execution remains strictly blocked.
--
--          Fully idempotent. Seeds use fixed stable UUIDs + ON CONFLICT DO NOTHING.
--          Additive re: production state; no table/data dropped/renamed.
-- ==============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. AFFILIATE ATTRIBUTIONS (replay of 20260919120000)
--    Server-side attribution store; survives cookie loss / incognito.
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.affiliate_attributions (
    id                  uuid        primary key default gen_random_uuid(),
    user_id             uuid        references auth.users(id) on delete cascade,
    -- null user_id is allowed for anonymous visitors (matched at checkout by session)
    session_id          text,
    affiliate_id        uuid        not null references public.affiliates(id) on delete cascade,
    referral_code       text        not null,
    attribution_source  text        not null default 'url_param'
                        check (attribution_source in ('url_param','cookie','admin','server')),
    attributed_at       timestamptz not null default now(),
    expires_at          timestamptz not null,
    used_at             timestamptz,
    attribution_used    boolean     not null default false,
    invoice_id          uuid        references public.invoices(id) on delete set null,
    ip_address          text,
    user_agent_hash     text,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),

    constraint aff_attr_expires_after_attributed check (expires_at > attributed_at)
);

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

alter table public.affiliate_attributions enable row level security;

drop policy if exists "AffAttr: user view own" on public.affiliate_attributions;
create policy "AffAttr: user view own"
    on public.affiliate_attributions for select
    to authenticated
    using ((select auth.uid()) = user_id);

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

drop trigger if exists aff_attr_set_updated_at on public.affiliate_attributions;
create trigger aff_attr_set_updated_at
    before update on public.affiliate_attributions
    for each row execute function public.handle_updated_at();

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

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. D-4: UNIQUE (user_id, referral_code) with duplicate preflight.
--    Preflight ABORTS the migration if duplicates exist rather than failing
--    halfway through.
-- ──────────────────────────────────────────────────────────────────────────────
do $$ begin
    if exists (
        select 1 from pg_constraint
        where conname = 'affiliate_attributions_user_referral_unique'
          and conrelid = 'public.affiliate_attributions'::regclass
    ) then
        return;
    end if;

    if exists (
        select 1
        from public.affiliate_attributions
        where user_id is not null
        group by user_id, referral_code
        having count(*) > 1
        limit 1
    ) then
        raise exception
            'AFFILIATE_ATTRIBUTIONS_DUPLICATES: cannot add unique (user_id, referral_code) — run the de-duplication backfill first';
    end if;

    alter table public.affiliate_attributions
        add constraint affiliate_attributions_user_referral_unique unique (user_id, referral_code);
end $$;

comment on constraint affiliate_attributions_user_referral_unique on public.affiliate_attributions is
    'D-4: at most one attribution row per (user_id, referral_code); protects the app-level mark-as-used path from double-commission races.';

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. AFFILIATE SECURITY HARDENING (replay of 20260919121000)
--    DB-level double-commission guard + RLS hardening on affiliate tables.
-- ──────────────────────────────────────────────────────────────────────────────
do $$ begin
    if not exists (
        select 1 from pg_indexes
        where tablename = 'referrals'
          and indexname = 'referrals_invoice_id_approved_unique'
    ) then
        create unique index if not exists referrals_invoice_id_approved_unique
            on public.referrals (invoice_id)
            where status not in ('reversed', 'refunded', 'chargeback')
              and invoice_id is not null;
    end if;
end $$;

drop policy if exists "Affiliates: service insert" on public.affiliates;
create policy "Affiliates: service insert"
    on public.affiliates for insert
    to authenticated
    with check (
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
        or (select auth.uid()) = user_id
    );

drop policy if exists "Referrals: service update" on public.referrals;
create policy "Referrals: service update"
    on public.referrals for update
    to authenticated
    using (
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
    )
    with check (
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
    );

drop policy if exists "Ledger: service insert" on public.affiliate_commission_ledger;
create policy "Ledger: service insert"
    on public.affiliate_commission_ledger for insert
    to authenticated
    with check (
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
    );

drop policy if exists "Audit: service insert" on public.affiliate_audit_logs;
create policy "Audit: service insert"
    on public.affiliate_audit_logs for insert
    to authenticated
    with check (
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
    );

create index if not exists idx_referrals_referral_code
    on public.referrals(referral_code);

alter table public.invoices add column if not exists referral_code text;
create index if not exists idx_invoices_referral_code
    on public.invoices(referral_code)
    where referral_code is not null;

alter table public.invoices add column if not exists attribution_timestamp timestamptz;
alter table public.invoices add column if not exists attribution_expires_at timestamptz;
alter table public.invoices add column if not exists attribution_source text
    check (attribution_source is null or attribution_source in ('url_param','cookie','admin','server'));

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. D-1: canonical 85/10/5 default split-rule set + Author/Reserve identities
-- ──────────────────────────────────────────────────────────────────────────────

-- 4.1 beneficiaries.role CHECK gains `reserve`; payout_method relaxed to NULL.
alter table public.beneficiaries drop constraint if exists beneficiaries_role_check;
alter table public.beneficiaries add constraint beneficiaries_role_check
    check (role in ('author', 'reserve', 'platform', 'coach', 'partner'));

alter table public.beneficiaries alter column payout_method drop not null;

-- 4.2 Seed the two internal beneficiary identities (stable fixed IDs).
--      Author: canonical project Author identity "MR-XSteroid" (merchant/seller
--      per Final Gate v5.1 §7). External payout details stay NULL/unconfigured
--      until real details are supplied and the payout gates are cleared.
insert into public.beneficiaries (id, name, email, role, payout_method, payout_details, kashier_recipient_id, is_active)
values (
    '8a6f0e10-0000-4000-8000-00000000a101',
    'MR-XSteroid',
    null,
    'author',
    null,
    '{}'::jsonb,
    null,
    true
)
on conflict (id) do nothing;

insert into public.beneficiaries (id, name, email, role, payout_method, payout_details, kashier_recipient_id, is_active)
values (
    '8a6f0e10-0000-4000-8000-00000000a105',
    'Reserve (Internal)',
    null,
    'reserve',
    null,
    '{}'::jsonb,
    null,
    true
)
on conflict (id) do nothing;

-- 4.3 split_rules: nullable beneficiary + destination_account + canonical_key.
alter table public.split_rules alter column beneficiary_id drop not null;

alter table public.split_rules add column if not exists destination_account text
    check (
        destination_account is null or
        destination_account in (
            'BENEFICIARY_PAYABLE', 'PLATFORM_REVENUE', 'RESERVE',
            'CUSTOMER_FUNDS', 'GATEWAY_FEES', 'REFUND_LIABILITY', 'PAYOUT_CLEARING'
        )
    );

alter table public.split_rules add column if not exists canonical_key text;

-- 4.4 Seed the canonical default rule set (idempotent, versioned, deterministic).
--      Platform has NO beneficiary row: its 10% maps straight to the
--      PLATFORM_REVENUE ledger account via destination_account (Posting Matrix
--      §6.3). Reserve has an internal identity (RESERVE account) but its payout
--      is always blocked. Author's 85% hits BENEFICIARY_PAYABLE.
insert into public.split_rules (
    id, tier_id, product_id, beneficiary_id, share_type, share_value,
    priority, is_active, destination_account, canonical_key
)
values (
    '8a6f0e10-0000-4000-8000-00000000a201',
    null, null,
    '8a6f0e10-0000-4000-8000-00000000a101',
    'percentage', 85, 0, true, 'BENEFICIARY_PAYABLE', 'author_85'
),
(
    '8a6f0e10-0000-4000-8000-00000000a202',
    null, null,
    '8a6f0e10-0000-4000-8000-00000000a105',
    'percentage', 5, 0, true, 'RESERVE', 'reserve_5'
),
(
    '8a6f0e10-0000-4000-8000-00000000a203',
    null, null,
    null,
    'percentage', 10, 0, true, 'PLATFORM_REVENUE', 'platform_10'
)
on conflict (id) do nothing;

create unique index if not exists idx_split_rules_canonical_key
    on public.split_rules (canonical_key)
    where canonical_key is not null;

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. D-2: exact §6.3 posting support in the schema
-- ──────────────────────────────────────────────────────────────────────────────

-- 5.1 financial_ledger account CHECK: add RESERVE, retire SALES_CLEARING.
alter table public.financial_ledger drop constraint if exists financial_ledger_account_check;
alter table public.financial_ledger add constraint financial_ledger_account_check
    check (
        account in (
            'CUSTOMER_FUNDS',
            'GATEWAY_FEES',
            'PLATFORM_REVENUE',
            'BENEFICIARY_PAYABLE',
            'RESERVE',
            'REFUND_LIABILITY',
            'PAYOUT_CLEARING'
        )
    );

-- 5.2 order_splits: nullable beneficiary + destination_account + approval columns
--      + `approved` status (max transition for this phase is admin approval;
--      live execution remains blocked by payout_gates).
alter table public.order_splits alter column beneficiary_id drop not null;

alter table public.order_splits add column if not exists destination_account text
    check (
        destination_account is null or
        destination_account in (
            'BENEFICIARY_PAYABLE', 'PLATFORM_REVENUE', 'RESERVE',
            'CUSTOMER_FUNDS', 'GATEWAY_FEES', 'REFUND_LIABILITY', 'PAYOUT_CLEARING'
        )
    );

alter table public.order_splits add column if not exists admin_approved boolean not null default false;
alter table public.order_splits add column if not exists approved_by uuid;
alter table public.order_splits add column if not exists approved_at timestamptz;
alter table public.order_splits add column if not exists approval_batch_id text;

alter table public.order_splits drop constraint if exists order_splits_status_check;
alter table public.order_splits add constraint order_splits_status_check
    check (
        status in (
            'pending', 'calculated', 'approved', 'frozen', 'queued',
            'paid', 'failed', 'cancelled'
        )
    );

-- 5.3 payouts: additive approval columns (kept in sync with order_splits).
alter table public.payouts add column if not exists admin_approved boolean not null default false;
alter table public.payouts add column if not exists approved_by uuid;
alter table public.payouts add column if not exists approved_at timestamptz;
alter table public.payouts add column if not exists approval_batch_id text;

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. PAYOUT GATES — live payout execution remains strictly blocked.
--    All three gates start UNCONFIRMED. The admin surface and PayoutService
--    must refuse any real transfer while any gate is unconfirmed.
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.payout_gates (
    gate_key    text primary key check (gate_key in ('C_2', 'D_8', 'LIVE_ACTIVATION')),
    label       text not null,
    confirmed   boolean not null default false,
    confirmed_at timestamptz,
    confirmed_by uuid,
    note        text,
    created_at  timestamptz not null default timezone('utc', now()),
    updated_at  timestamptz not null default timezone('utc', now())
);

insert into public.payout_gates (gate_key, label, confirmed, note)
values
    ('C_2', 'PayoutModule sender collateral verification (C-2)', false,
     'Unconfirmed by owner — live funder/recipient collateral not yet verified.'),
    ('D_8', 'Payout financial reconciliation & ledger apportionment sign-off (D-8)', false,
     'Unconfirmed by owner — full reconciliation of ledger/beneficiary apportionment not yet signed.'),
    ('LIVE_ACTIVATION', 'Live payout activation authorization', false,
     'Unconfirmed by owner — live payout execution is disabled.')
on conflict (gate_key) do nothing;

alter table public.payout_gates enable row level security;

drop policy if exists "PayoutGates: admin all" on public.payout_gates;
create policy "PayoutGates: admin all"
    on public.payout_gates for all
    to authenticated
    using (
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
    )
    with check (
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
    );

drop policy if exists "PayoutGates: service read" on public.payout_gates;
create policy "PayoutGates: service read"
    on public.payout_gates for select
    to anon, authenticated
    using (true);

drop trigger if exists payout_gates_set_updated_at on public.payout_gates;
create trigger payout_gates_set_updated_at
    before update on public.payout_gates
    for each row execute function public.handle_updated_at();

comment on table public.payout_gates is
    'Phase payout gates (C-2, D-8, LIVE_ACTIVATION). All start UNCONFIRMED; payout execution MUST remain blocked while any gate is unconfirmed.';