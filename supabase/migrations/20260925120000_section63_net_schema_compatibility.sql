-- =============================================================================
-- MIGRATION: 20260925120000_section63_net_schema_compatibility.sql
-- PHASE:     §6.3 NET posting - schema compatibility only
--
-- PURPOSE: Unblock the already-approved and already-committed §6.3 NET posting
--          implementation (application commit 781acb3) by providing EXACTLY the
--          two schema facts it reads/writes. Nothing else.
--
--          The committed code touches:
--            - server/payments/splitEngine.ts
--                writes  order_splits.destination_account
--                reads   split_rules.destination_account
--            - server/payments/fulfillmentService.ts
--                reads   order_splits.destination_account
--                (passes it through as the §6.3 journal credit account)
--            - server/payments/financialLedgerService.ts
--                writes  financial_ledger.account = 'RESERVE'
--
--          FINDING A: public.order_splits has no `destination_account` column,
--          so the committed INSERT in splitEngine fails with a PostgREST
--          "column does not exist" error, no split is ever frozen, and
--          recordPaymentPostingJournal would then compute fee = gross and
--          write an unbalanced entry.
--          FINDING B: the production constraint
--          financial_ledger_account_check does not allow 'RESERVE', so the
--          §6.3 credit line for the 5% reserve is rejected.
--
--          SCOPE: strictly §6.3 compatibility. No payout expansion, no
--          affiliate tables/columns, no payout_gates, no admin payout routes,
--          no split_rules seeding, no beneficiary changes, no backfills.
--
--          INVARIANT (unchanged by this migration, verified in
--          tests/unit/section63NetSchemaCompatibility.test.ts):
--            G=49900  F=1500  N=48400
--            BENEFICIARY_PAYABLE=41140  PLATFORM_REVENUE=4840  RESERVE=2420
--            Dr CUSTOMER_FUNDS 48400 + Dr GATEWAY_FEES 1500   = 49900
--            Cr BENEFICIARY_PAYABLE 41140 + Cr PLATFORM_REVENUE 4840
--               + Cr RESERVE 2420 + Cr CUSTOMER_FUNDS 1500     = 49900
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. order_splits.destination_account
--
--    Type: text, NULLABLE, no artificial default.
--    Why nullable: the committed splitEngine writes
--      destination_account: c.destinationAccount || 'BENEFICIARY_PAYABLE'
--    and the column is a faithful snapshot of the rule that produced the
--    allocation. Historical/legacy rows (and any row written by an older
--    producer that did not set it) must remain valid, so NULL is the honest
--    representation of "not recorded" and is deliberately accepted by the
--    CHECK rather than forced to a fabricated value.
--    Why no backfill: production currently has 0 order_splits rows, and a
--    synthetic value would misstate allocation history.
--    Values: exactly the accounts the committed code can emit. This mirrors
--    the LedgerAccount union in financialLedgerService.ts, so any
--    destination_account the application can produce is also a valid
--    financial_ledger.account (a split can never claim a ledger account that
--    the ledger itself rejects).
-- -----------------------------------------------------------------------------
alter table public.order_splits
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

comment on column public.order_splits.destination_account is
    '§6.3: ledger account the frozen split credits to (splitEngine snapshot). '
    'NULL means not recorded (legacy row). Must be a valid financial_ledger.account.';

-- -----------------------------------------------------------------------------
-- 2. financial_ledger_account_check: allow RESERVE, keep every existing account.
--
--    The production constraint today is:
--      CUSTOMER_FUNDS, GATEWAY_FEES, PLATFORM_REVENUE, BENEFICIARY_PAYABLE,
--      REFUND_LIABILITY, PAYOUT_CLEARING, SALES_CLEARING
--
--    The new definition is that EXACT set plus 'RESERVE'. Nothing is removed
--    and no other validation is weakened: account is still restricted to a
--    closed allow-list, and the sibling CHECKs (amount_minor > 0,
--    entry_type in (DEBIT,CREDIT), event_type allow-list) are untouched.
--
--    SALES_CLEARING is intentionally RETAINED. 781acb3 stops writing it, but
--    retiring an accepted historical value is a data-lifecycle decision that
--    belongs to the separately approved payout/affiliate migration, not to a
--    §6.3 compatibility fix. Keeping it cannot make §6.3 fail.
-- -----------------------------------------------------------------------------
alter table public.financial_ledger
    drop constraint if exists financial_ledger_account_check;

alter table public.financial_ledger
    add constraint financial_ledger_account_check
    check (
        account in (
            'CUSTOMER_FUNDS',
            'GATEWAY_FEES',
            'PLATFORM_REVENUE',
            'BENEFICIARY_PAYABLE',
            'RESERVE',
            'REFUND_LIABILITY',
            'PAYOUT_CLEARING',
            'SALES_CLEARING'
        )
    );
