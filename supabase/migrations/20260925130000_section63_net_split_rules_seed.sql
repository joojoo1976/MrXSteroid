-- =============================================================================
-- MIGRATION: 20260925130000_section63_net_split_rules_seed.sql
-- PHASE:     §6.3 NET posting — split-rule source + canonical rule set
-- COMPANION: 20260925120000_section63_net_schema_compatibility.sql
--            (order_splits.destination_account + financial_ledger RESERVE).
--            This file is deliberately SEPARATE and must be applied after it.
--
-- PURPOSE: Make the signed §6.3 NET allocation ACTUALLY EXECUTABLE in Production.
--
--          781acb3 made the posting path schema-correct, but the allocation
--          SOURCE cannot express the signed split:
--
--          FINDING A: split_rules has no `destination_account`, so
--            splitEngine.ts:121/177 falls back to 'BENEFICIARY_PAYABLE' for
--            every rule. The 10% PLATFORM_REVENUE and 5% RESERVE credits would
--            silently post to BENEFICIARY_PAYABLE.
--          FINDING B: split_rules.beneficiary_id is NOT NULL with FK to
--            beneficiaries(id). The signed platform 10% rule is an INTERNAL
--            ledger allocation with no external beneficiary, so it cannot be
--            represented at all.
--          FINDING C: order_splits.beneficiary_id is NOT NULL, so even a
--            platform rule could not be frozen into order_splits.
--          FINDING D: beneficiaries.role CHECK lacks 'reserve' and
--            beneficiaries.payout_method is NOT NULL, so the internal reserve
--            identity cannot exist.
--          FINDING E: split_rules has ZERO rows in Production, so the engine
--            short-circuits (`frozen:false, splitsCount:0`,
--            splitEngine.ts:247-250) and no allocation is ever produced.
--
--          AUTHORITATIVE SOURCE for every seeded value:
--            - 85 / 10 / 5 percentages and the §6.3 account mapping come from
--              the COMMITTED implementation, splitEngine.ts:39-44
--              (`DEFAULT_OWNER_SPLIT_RATIOS`, "Owner Decision 3-4 (Final
--              Gate v4)", introduced by commit eaca1ec and present in
--              781acb3), together with the signed Posting Matrix §6.3 that
--              781acb3 implements in financialLedgerService.ts:14-21/159-235.
--            - The percentages are NOT new: they are transcribed from that
--              committed constant, which calculateOrderSplits consumes from
--              this table.
--            - The fixed beneficiary UUIDs below are the only stable internal
--              identities proposed anywhere in the repository for these two
--              roles. Production has 0 beneficiaries, so these rows are the
--              definitions, not modifications of existing data. They introduce
--              NO new external beneficiary and NO payout details: email,
--              kashier_recipient_id and payout_method all stay NULL.
--
--          SCOPE: §6.3 split-rule source only. No affiliate tables, no
--          payout_gates, no payouts/approval columns, no order_splits.status
--          rework, no admin routes, no payout logic, no backfills of
--          unrelated data.
--
--          INVARIANT (unchanged, enforced by
--          tests/unit/section63NetSplitRulesSeed.test.ts):
--            N = 48400  →  85% = 41140, 10% = 4840, 5% = 2420
--            G = 49900, F = 1500. NET basis only. No gross-basis values.
-- =============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. split_rules.destination_account
--
--    Nullable, CHECK-constrained to exactly the LedgerAccount set the
--    committed splitEngine can emit (financialLedgerService.ts:14-21). NULL
--    keeps the historical "not specified → BENEFICIARY_PAYABLE" fallback at
--    splitEngine.ts:121/177 intact, so pre-existing rules stay valid. The
--    three canonical rows below always set an explicit value.
--    No index: destination_account is never filtered or ordered on.
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.split_rules
    add column if not exists destination_account text
    check (
        destination_account is null or
        destination_account in (
            'CUSTOMER_FUNDS',
            'GATEWAY_FEES',
            'PLATFORM_REVENUE',
            'BENEFICIARY_PAYABLE',
            'RESERVE',
            'REFUND_LIABILITY',
            'PAYOUT_CLEARING'
        )
    );

comment on column public.split_rules.destination_account is
    '§6.3: ledger account this rule credits (BENEFICIARY_PAYABLE default when NULL). '
    'Must be a valid financial_ledger.account.';

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. split_rules.beneficiary_id nullable
--
--    Required so the signed PLATFORM_REVENUE 10% rule can exist with
--    beneficiary_id = NULL: it is an internal ledger allocation, not a
--    disbursement to a person. The existing FK to beneficiaries(id) is kept
--    unchanged; a NULL bypasses it by design, and any non-NULL value is still
--    forced to reference a real beneficiary.
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.split_rules
    alter column beneficiary_id drop not null;

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. order_splits.beneficiary_id nullable
--
--    Same reason: the 10% platform split must be freezable into order_splits.
--    The existing FK (ON DELETE RESTRICT) is preserved, so a non-NULL
--    beneficiary_id still must resolve to a live beneficiaries row.
--
--    NOTE on order_splits_invoice_beneficiary_unique: with a nullable
--    beneficiary_id, two platform rows for the SAME invoice would both be
--    (invoice_id, NULL) and collide, because NULLs are distinct in a unique
--    index. The canonical set has exactly ONE beneficiary-less rule
--    (platform 10%), so this cannot occur under the signed model. This
--    migration therefore does not alter that constraint.
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.order_splits
    alter column beneficiary_id drop not null;

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. beneficiaries.role accepts the internal 'reserve' role
--    All previously valid roles are preserved; nothing is removed.
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.beneficiaries
    drop constraint if exists beneficiaries_role_check;

alter table public.beneficiaries
    add constraint beneficiaries_role_check
    check (
        role in ('author', 'reserve', 'platform', 'coach', 'partner')
    );

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. beneficiaries.payout_method nullable
--    The internal reserve identity is a ledger destination only; it has no
--    real payout destination configured. Existing NOT NULL values and the
--    existing value allow-list are untouched — only NULL becomes storable.
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.beneficiaries
    alter column payout_method drop not null;

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. The two internal beneficiary identities
--
--    These are the repository's only stable proposed identities for the
--    author and reserve roles. They deliberately carry NO external payout
--    details: email, kashier_recipient_id and payout_method are NULL, and
--    payout_details is an empty object. Creating them enables the FK targets
--    for the seed rules only; it grants no ability to disburse anything.
-- ──────────────────────────────────────────────────────────────────────────────
insert into public.beneficiaries (
    id, name, email, role, payout_method, payout_details, kashier_recipient_id, is_active
)
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

insert into public.beneficiaries (
    id, name, email, role, payout_method, payout_details, kashier_recipient_id, is_active
)
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

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. The canonical §6.3 rule set (85 / 10 / 5, NET basis)
--
--    share_type = 'percentage' for all three, so calculateOrderSplits applies
--    them against N = gross - gatewayFee (splitEngine.ts:97,136-172). With
--    G=49900 and F=1500 this yields N=48400 and 41140 / 4840 / 2420.
--
--    priority = 0 for all three: the values sum to exactly 100, so the
--    Largest-Remainder distribution is unaffected by ordering, and
--    splitEngine's tie-break on priority stays neutral.
--    tier_id / product_id stay NULL so these are the global defaults that
--    splitEngine falls back to (splitEngine.ts:254).
--
--    Idempotency: keyed on the primary key with ON CONFLICT DO NOTHING.
--    The existing constraints (share_type, share_value >= 0, PK) are reused
--    as the conflict target; no new index is introduced here.
-- ──────────────────────────────────────────────────────────────────────────────
insert into public.split_rules (
    id, tier_id, product_id, beneficiary_id, share_type, share_value,
    priority, is_active, destination_account
)
values (
    -- 85% → BENEFICIARY_PAYABLE (author)
    '8a6f0e10-0000-4000-8000-00000000a201',
    null,
    null,
    '8a6f0e10-0000-4000-8000-00000000a101',
    'percentage',
    85,
    0,
    true,
    'BENEFICIARY_PAYABLE'
),
(
    -- 10% → PLATFORM_REVENUE (internal allocation, no beneficiary)
    '8a6f0e10-0000-4000-8000-00000000a203',
    null,
    null,
    null,
    'percentage',
    10,
    0,
    true,
    'PLATFORM_REVENUE'
),
(
    -- 5% → RESERVE (internal reserve identity)
    '8a6f0e10-0000-4000-8000-00000000a202',
    null,
    null,
    '8a6f0e10-0000-4000-8000-00000000a105',
    'percentage',
    5,
    0,
    true,
    'RESERVE'
)
on conflict (id) do nothing;
