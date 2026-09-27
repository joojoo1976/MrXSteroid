-- =============================================================================
-- MIGRATION: 20260927190000_guest_order_claims_and_gateway_fee.sql
-- PHASE:     §6.3 NET fee source + deferred guest entitlement (option b)
--
-- PURPOSE: Close two Production-readiness blockers found in the final
--          settlement-readiness audit, WITHOUT relaxing any existing control.
--
--          BLOCKER A — gateway fee had no source.
--            `fulfillmentService` called `freezeOrderSplits(supabase, invoiceId)`
--            with no fee argument, so `gatewayFeeMinor` defaulted to 0 and
--            `netAmountMinor = gross - 0 = gross`. The §6.3 NET basis (N = G - F)
--            was therefore never exercised, GATEWAY_FEES was never debited, and
--            the author beneficiary was credited 85% of the FULL gross. This
--            migration adds the two pieces needed to carry a REAL fee:
--              1. `payment_intents.gateway_fee_minor` — the resolved, persisted
--                 fee. Persisting it (rather than recomputing per attempt) makes
--                 settlement deterministic and replay-safe: a webhook replay or a
--                 reconciliation pass settles against the identical F that the
--                 original capture used.
--              2. `kashier_fee_schedules` — the APPROVED commercial fee
--                 schedules, selected by the ACTUAL provider payment method, plus
--                 `kashier_fee_method_map` for the explicit method -> schedule
--                 mapping. This migration seeds NO rate and NO mapping row: both
--                 are commercial facts that must be supplied and approved by the
--                 owner, never invented by the application.
--            Precedence is enforced in code (server/payments/gatewayFee.ts):
--              persisted intent fee  >  provider-reported fee  >
--              method-derived approved schedule  >  FAIL CLOSED.
--            An unknown, unmapped, or merely fuzzy-matching payment method is
--            `gateway_fee_unresolved`; the settlement path refuses to post
--            rather than silently assuming F = 0 or a regional default.
--            NOTE: this migration REPLACED an earlier design that stored
--            `merchant_configs.gateway_fee_percent` / `gateway_fee_fixed_minor`
--            and resolved them per region. Those columns are no longer added, and
--            no region or 'GLOBAL' default fee exists — a region cannot tell you
--            what Kashier charged for a specific payment method.
--
--          BLOCKER B — guest checkout settled while granting nothing.
--            Guest checkout is intentionally enabled and is asserted by
--            `tests/security/phase2Security.test.ts` ("allows guest checkout with
--            null effectiveUserId when unauthenticated and no userId passed").
--            However `invoices.user_id` is NULL for a guest, and the
--            fulfillment subscription/entitlement steps are both gated on
--            `invoice.user_id`, so a captured guest payment used to settle the
--            §6.3 journal and then return success while granting NO entitlement
--            and NO subscription. Silent revenue loss.
--            This migration adds `guest_order_claims`: a single-use,
--            high-entropy, expiring claim token bound to the paid invoice and
--            the guest email. The paid order is fully settled financially; the
--            entitlement is DEFERRED until the guest redeems the token, at which
--            point a REAL authenticated account is linked and the entitlement is
--            granted. No fake user is created and no `user_id` is fabricated.
--
-- SECURITY MODEL
--   · The raw claim token is NEVER stored. Only its SHA-256 digest is persisted,
--     so a database leak does not yield usable claim tokens.
--   · Tokens are 256 bits of CSPRNG entropy (crypto.randomBytes(32)).
--   · Single-use is enforced by a compare-and-swap UPDATE, not by a read-then-
--     write, so two concurrent redemptions cannot both succeed.
--   · Expiry is enforced in the same conditional UPDATE, so an expired token
--     can never be redeemed even if a background sweeper has not yet run.
--   · Redemption is additionally bound to the guest email: the caller must be
--     authenticated AND their account email must match the claim, so a leaked
--     token cannot be redeemed into somebody else's account.
--   · RLS is ENABLED with NO client policy, and table grants are revoked from
--     anon/authenticated. Every read and write goes through the service role in
--     a server route that has already verified the caller's JWT. This is
--     strictly more restrictive than the status quo; nothing is weakened.
--
-- SCOPE
--   · Adds one table, one unique partial index, two supporting indexes, one
--     column on `payment_intents`, and two new fee-schedule tables. It does NOT
--     add columns to `merchant_configs` — the region-based fee model was
--     removed.
--   · Seeds NO split_rules, NO beneficiaries, NO fee values, NO claim rows.
--   · Touches no existing row: `order_splits` (0 rows), `financial_ledger`
--     (0 rows), `beneficiaries` (0 rows), `entitlements` (0 rows) are untouched.
--   · Does not alter the §6.3 accounts, the 85/10/5 rule set, or the two
--     §6.3 migrations (20260925120000 / 20260925130000). Those remain the
--     prerequisite for settlement and are unchanged by this file.
--
-- IDEMPOTENCE
--   Every column add is `if not exists`, every index is `create ... if not
--   exists`, the table is `create table if not exists`, and every column-level
--   CHECK is dropped before being re-created. Re-running therefore converges to
--   the same state and is a no-op.
--   The table's inline CHECKs (status / redeemed-pair / expiry) are part of the
--   `create table` statement, so they exist exactly once, on first creation; a
--   re-run skips the whole statement and leaves them in place.
-- =============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. guest_order_claims
--
--    One row per settled guest order awaiting redemption.
--
--    `email` is the guest email captured on the invoice at checkout, normalized
--    to lowercase. It is the authorization binding for redemption, not a login
--    credential.
--
--    `product_id` snapshots the purchased tier so a later catalog change cannot
--    alter what the guest is entitled to.
--
--    `token_hash` is `encode(sha256(<raw token>::bytea),'hex')`. The raw token
--    exists only in the delivery message and in the caller's hands.
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.guest_order_claims (
    id                  uuid primary key default gen_random_uuid(),
    invoice_id          uuid not null references public.invoices(id) on delete cascade,
    payment_intent_id   uuid references public.payment_intents(id) on delete set null,
    email               text not null,
    token_hash          text not null,
    product_id          text not null,
    status              text not null default 'pending',
    expires_at          timestamptz not null,
    redeemed_at         timestamptz,
    redeemed_by         uuid references auth.users(id) on delete set null,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),

    constraint guest_order_claims_status_check
        check (status in ('pending', 'redeemed', 'expired', 'revoked')),

    -- A claim is either redeemed with a real account and a timestamp, or it is
    -- not redeemed. Prevents a half-written redemption from ever existing.
    constraint guest_order_claims_redeemed_pair_check
        check (
            (status = 'redeemed' and redeemed_at is not null and redeemed_by is not null)
            or (status <> 'redeemed')
        ),

    -- expires_at must be in the future at insert time.
    constraint guest_order_claims_expiry_check
        check (expires_at > created_at)
);

comment on table public.guest_order_claims is
    'Single-use, expiring, high-entropy claim tokens that let a GUEST redeem a '
    'settled order into a real authenticated account. Raw tokens are never stored; '
    'token_hash is the SHA-256 digest. Service-role access only (RLS enabled, no client policy).';

comment on column public.guest_order_claims.token_hash is
    'SHA-256 hex digest of the raw claim token. The raw token is delivered once and never persisted.';

-- The token digest is the lookup key for redemption: it must be unique.
create unique index if not exists guest_order_claims_token_hash_key
    on public.guest_order_claims (token_hash);

-- At most ONE live (pending) claim per invoice. Re-issuing a claim for the same
-- order supersedes the previous one instead of creating a second redeemable
-- entitlement, which would make single-use unenforceable at the order level.
create unique index if not exists guest_order_claims_one_pending_per_invoice
    on public.guest_order_claims (invoice_id)
    where status = 'pending';

-- Operational sweep: find expired-but-still-pending claims to mark 'expired'.
create index if not exists guest_order_claims_pending_expiry_idx
    on public.guest_order_claims (expires_at)
    where status = 'pending';

-- Lookup by email for support/ops and for the "did I already claim this?" view.
create index if not exists guest_order_claims_email_idx
    on public.guest_order_claims (email);

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. RLS — enabled, deliberately with NO client policy.
--
--    No `create policy` here on purpose. With RLS enabled and zero policies,
--    anon and authenticated have no rows and no commands; only the service role
--    (which bypasses RLS) can read or write. This is the hardening direction:
--    a claim token is a bearer credential, so it must never be reachable from a
--    client-supplied query. All access goes through the server route.
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.guest_order_claims enable row level security;

revoke all on public.guest_order_claims from anon, authenticated;

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. payment_intents.gateway_fee_minor — the resolved, persisted §6.3 fee.
--
--    Nullable because it is only meaningful for a CAPTURED intent; it is
--    populated by the settlement path from the real fee source before the
--    journal is posted. Once written it is the authoritative F for this intent,
--    so a replay or a reconciliation pass can never re-derive a different fee
--    and produce a second, disagreeing journal.
--
--    `check (gateway_fee_minor >= 0)` rejects a negative fee outright. A fee
--    larger than the capture is rejected in code before any write, because it
--    would make the NET basis negative.
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.payment_intents
    add column if not exists gateway_fee_minor integer;

alter table public.payment_intents
    drop constraint if exists payment_intents_gateway_fee_minor_check;

alter table public.payment_intents
    add constraint payment_intents_gateway_fee_minor_check
    check (gateway_fee_minor is null or gateway_fee_minor >= 0);

comment on column public.payment_intents.gateway_fee_minor is
    '§6.3 F: the resolved gateway fee in minor units, persisted at settlement. '
    'Authoritative for this intent — replays must reuse it, never re-derive it. '
    'NULL until a real fee source resolves one; settlement fails closed rather than assuming 0.';

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. kashier_fee_schedules — the APPROVED commercial fee schedules.
--
--    A Kashier fee is a function of HOW the customer paid, not of where the
--    merchant is registered. The previous model stored the fee on
--    `merchant_configs` and resolved it per REGION, which is why this migration
--    DROPS those columns: a region default silently answers "how much did
--    Kashier keep?" for a payment method nobody looked at. That is exactly the
--    defect being fixed, so the region fallback is removed entirely rather than
--    kept as a safety net.
--
--    The approved schedules are:
--
--      card_settled      0.2%   min 10 EGP (1000 minor)   max 300,000 EGP (30000000 minor)
--      instant_transfer  2.5%   no minimum                no maximum
--
--    Resolution is:
--
--        F = clamp(round(G * rate_percent / 100), min_fee_minor, max_fee_minor)
--
--    evaluated in integer minor units with deterministic half-up rounding, and
--    applied per SCHEDULE — NOT per region, and NOT from a default.
--
--    This migration seeds NO rate rows. A rate is a commercial fact; inserting
--    one is an explicit, reviewable owner decision. Until a row exists, an
--    affected capture fails closed (`gateway_fee_unresolved`) and posts no
--    §6.3 journal at all — which is the safe direction: no journal is
--    recoverable, a wrong journal silently mis-pays three beneficiaries.
--
--    RATE BOUNDS: `rate_percent` is constrained to [0, 100) so a misconfigured
--    rate can never make the fee exceed the gross and invert the NET basis.
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.kashier_fee_schedules (
    code            text        primary key,
    rate_percent    numeric(7,4) not null,
    min_fee_minor   integer,
    max_fee_minor   integer,
    active          boolean     not null default true,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),

    -- A schedule code is one of the two approved categories. This is a closed
    -- set on purpose: an unrecognised code cannot be inserted, so a typo can
    -- never become a silently-unpriced category.
    constraint kashier_fee_schedules_code_check
        check (code in ('card_settled', 'instant_transfer')),

    constraint kashier_fee_schedules_rate_check
        check (rate_percent >= 0 and rate_percent < 100),

    -- A negative bound is nonsense, and min > max would make the clamp
    -- mathematically empty (every value clamped to an impossible band).
    constraint kashier_fee_schedules_min_check
        check (min_fee_minor is null or min_fee_minor >= 0),

    constraint kashier_fee_schedules_max_check
        check (max_fee_minor is null or max_fee_minor >= 0),

    constraint kashier_fee_schedules_bounds_check
        check (
            min_fee_minor is null
            or max_fee_minor is null
            or min_fee_minor <= max_fee_minor
        )
);

comment on table public.kashier_fee_schedules is
    'APPROVED Kashier fee schedules, selected by the ACTUAL provider payment method. '
    'card_settled: 0.2% with a 10 EGP floor and 300,000 EGP cap. '
    'instant_transfer: 2.5% with no floor and no cap. '
    'No rate rows are seeded by migration; until a row exists the capture fails closed. '
    'There is no region-based or global default fee by design.';

comment on column public.kashier_fee_schedules.min_fee_minor is
    'Floor in minor units (10 EGP = 1000). NULL = no minimum. Applies to card_settled.';
comment on column public.kashier_fee_schedules.max_fee_minor is
    'Ceiling in minor units (300,000 EGP = 30000000). NULL = no maximum. Applies to card_settled.';

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. kashier_fee_method_map — EXPLICIT payment-method -> schedule mapping.
--
--    The mapping is deliberately a table rather than a code constant so that
--    adding a provider method is an auditable data change, and so the
--    application can never *guess* a category.
--
--    `provider_method_key` is the NORMALISED provider token: lowercased with
--    every non-alphanumeric character removed (so "Card Transfer", "card" and
--    "CARD" all normalise to "card"). The application performs that
--    normalisation and then requires an EXACT row match. A method that is
--    absent, or that only partially matches, is UNMAPPED and fails closed —
--    there is deliberately no LIKE/fuzzy fallback, because a fuzzy match that
--    picks the wrong category mis-prices the fee in a way no test would catch.
--
--    No rows are seeded here either; the mapping is a commercial decision.
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.kashier_fee_method_map (
    provider_method_key text        primary key,
    schedule_code       text        not null
        references public.kashier_fee_schedules (code)
        on update cascade
        on delete restrict,
    active              boolean     not null default true,
    created_at          timestamptz not null default now(),

    constraint kashier_fee_method_map_key_check
        check (provider_method_key = lower(provider_method_key)
               and provider_method_key ~ '^[a-z0-9]+$')
);

comment on table public.kashier_fee_method_map is
    'EXPLICIT normalised provider payment method -> approved fee schedule. '
    'Exact match only; no fuzzy or partial matching. Unmapped means '
    'gateway_fee_unresolved and no §6.3 journal.';

-- The hot path is: given a normalised method, find its schedule. The primary
-- key already covers this lookup, so no additional index is required. The
-- reverse direction (which methods map to a schedule) is only ever used by
-- review queries, which are not latency-sensitive.

-- 6. RLS is ENABLED with NO client policy, and table grants are revoked from
--    anon/authenticated. Both tables are service-role only: the fee schedule is
--    read exclusively by the server-side settlement path, and a client that
--    could read or write the commercial rate could alter what customers are
--    charged. Same posture as guest_order_claims above — zero policies plus
--    revoked grants means the anon and authenticated roles are denied outright.
alter table public.kashier_fee_schedules enable row level security;

revoke all on public.kashier_fee_schedules from anon, authenticated;

alter table public.kashier_fee_method_map enable row level security;

revoke all on public.kashier_fee_method_map from anon, authenticated;

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. INVARIANT (enforced by tests/unit/gatewayFeeNet.test.ts,
--    tests/unit/guestOrderClaims.test.ts and
--    tests/integration/guestFulfillmentSettlement.test.ts):
--
--      G = captured gross
--      F = payment_intents.gateway_fee_minor  (real, resolved, persisted)
--      N = G - F
--      order_splits sum(allocated_amount_minor) == N
--      journal: Dr CUSTOMER_FUNDS N + Dr GATEWAY_FEES F
--             == Cr BENEFICIARY_PAYABLE + Cr PLATFORM_REVENUE + Cr RESERVE
--                + Cr CUSTOMER_FUNDS F
--      i.e. Dr total == Cr total == G
--
--    APPROVED SCHEDULES, worked in integer minor units (1 EGP = 100):
--
--      card_settled  0.2%, floor 10 EGP, cap 300,000 EGP
--        G =  2,000 EGP -> raw 400 minor, floor binds -> F = 1,000
--                            N = 199,000 -> 169,150 / 19,900 / 9,950
--        G =100,000 EGP -> F = 20,000  N = 9,980,000
--                            -> 8,483,000 / 998,000 / 499,000
--        G =200,000,000 EGP -> raw 40,000,000 minor (400,000 EGP), cap binds
--                            -> F = 30,000,000 (300,000 EGP)
--                            N = 19,970,000,000
--                            -> 16,974,500,000 / 1,997,000,000 / 998,500,000
--      (the cap only starts binding above G = 150,000,000 EGP, where 0.2% of G
--       reaches 300,000 EGP; below that the rate is charged in full)
--
--      instant_transfer  2.5%, no floor, no cap
--        G =  10,000 EGP -> F = 25,000 (250 EGP)
--                            N = 975,000 -> 828,750 / 97,500 / 48,750
--
--    Every row above satisfies Dr == Cr == G exactly.
--
--    NOTE the earlier 1.5% assumption for instant_transfer is WITHDRAWN. At
--    G = 10,000 EGP the correct fee is 250 EGP, not 150 EGP; the 100 EGP
--    difference would otherwise have been silently absorbed by the three
--    beneficiaries, because the §6.3 split is applied to N and a too-small F
--    inflates N.
-- =============================================================================
