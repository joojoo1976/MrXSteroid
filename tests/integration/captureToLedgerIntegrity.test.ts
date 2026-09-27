/**
 * tests/integration/captureToLedgerIntegrity.test.ts
 *
 * §6.3 capture→ledger orchestration integrity (BLOCKER 1 + BLOCKER 2).
 *
 * The invariant under test:
 *
 *   A capture must NEVER become silently financially settled while the
 *   required §6.3 ledger posting is absent.
 *
 * Every test runs against a fake that ENFORCES the live production
 * constraints — in particular
 *   financial_ledger.payment_intent_id → payment_intents(id)
 * so the historical `paymentIntentId: invoiceId` defect cannot pass here.
 *
 * Ordering contract proven below:
 *   resolve real payment_intents.id → freeze splits → validate completeness
 *   → post §6.3 journal → VERIFY persistence → only then paid / fulfilled /
 *   entitled / processed.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    createProductionConstraintSupabase,
    SIGNED_NET_SPLITS,
    INVOICE_ID,
    USER_ID,
    TIER_ID,
    PAYMENT_INTENT_ID,
    BENEFICIARY_AUTHOR,
    type LedgerRow,
} from '../helpers/productionConstraintSupabase';
import {
    applyProviderVerdict,
    type ProviderVerdictInput,
} from '../../server/payments/fulfillmentService';

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({ from: () => ({}), rpc: vi.fn() })),
}));

type Harness = ReturnType<typeof createProductionConstraintSupabase>;

const EVENT_ID = 'evt-63-0001';

function inputFor(db: Harness, overrides: Partial<ProviderVerdictInput> = {}): ProviderVerdictInput {
    return {
        supabase: db.client,
        invoiceId: INVOICE_ID,
        gatewayName: 'KASHIER_EGYPT',
        verdict: {
            status: 'success',
            externalReferenceId: 'txn-63-0001',
            paidAmount: 499,
            providerStatus: 'SUCCESS',
        },
        providerEventId: EVENT_ID,
        providerStatus: 'SUCCESS',
        source: 'webhook',
        ...overrides,
    };
}

function ledgerFor(h: Harness, entryType: string): LedgerRow[] {
    return h.ledger.filter((r) => r.entry_type === entryType);
}
const sum = (rows: LedgerRow[]) => rows.reduce((s, r) => s + r.amount_minor, 0);

function webhookRow(h: Harness) {
    return h.tables.webhook_events[0];
}
function invoiceRow(h: Harness) {
    return h.tables.invoices[0];
}
function intentRow(h: Harness) {
    return h.tables.payment_intents[0];
}

describe('§6.3 valid capture — exactly one posting, settled only after persistence', () => {
    let h: Harness;
    beforeEach(() => {
        // reserveAccountAllowed models the POST-migration catalog. The
        // PRE-migration behavior is proven separately below.
        h = createProductionConstraintSupabase({ netSplits: SIGNED_NET_SPLITS, reserveAccountAllowed: true });
    });

    it('1. resolves the REAL payment_intents.id and writes the signed 41140/4840/2420 journal', async () => {
        const result = await applyProviderVerdict(inputFor(h));

        expect(result).toEqual({ code: 'applied', outcome: 'success' });

        // The FK column carries a real payment_intents.id — NOT the invoice id.
        expect(h.ledger).not.toHaveLength(0);
        for (const row of h.ledger) {
            expect(row.payment_intent_id).toBe(PAYMENT_INTENT_ID);
            expect(row.payment_intent_id).not.toBe(INVOICE_ID);
            expect(row.invoice_id).toBe(INVOICE_ID);
        }

        // 12. Exactly one journal, signed allocation, Dr = Cr = 49900.
        const journals = new Set(h.ledger.map((r) => r.journal_entry_id));
        expect(journals.size).toBe(1);
        expect(sum(ledgerFor(h, 'DEBIT'))).toBe(49900);
        expect(sum(ledgerFor(h, 'CREDIT'))).toBe(49900);

        const credits = h.ledger.filter((r) => r.entry_type === 'CREDIT');
        expect(credits.map((r) => [r.account, r.amount_minor])).toEqual(
            expect.arrayContaining([
                ['BENEFICIARY_PAYABLE', 41140],
                ['PLATFORM_REVENUE', 4840],
                ['RESERVE', 2420],
            ])
        );
        // N=48400 across the three allocation credits, F=1500 fee pair.
        const allocationTotal = credits
            .filter((r) => ['BENEFICIARY_PAYABLE', 'PLATFORM_REVENUE', 'RESERVE'].includes(r.account))
            .reduce((s, r) => s + r.amount_minor, 0);
        expect(allocationTotal).toBe(48400);
        expect(h.ledger.filter((r) => r.account === 'GATEWAY_FEES')).toHaveLength(1);
        expect(h.ledger.filter((r) => r.account === 'GATEWAY_FEES')[0].amount_minor).toBe(1500);
    });

    it('finalizes the capture only after the journal exists', async () => {
        await applyProviderVerdict(inputFor(h));

        expect(invoiceRow(h).status).toBe('success');
        expect(invoiceRow(h).payment_status).toBe('paid');
        expect(intentRow(h).status).toBe('succeeded');
        expect(h.tables.profiles[0].has_paid).toBe(true);
        expect(h.tables.entitlements).toHaveLength(1);
        expect(h.tables.entitlements[0].payment_intent_id).toBe(PAYMENT_INTENT_ID);
        expect(webhookRow(h).status).toBe('processed');
        expect(webhookRow(h).processed_at).toBeTruthy();
    });

    it('8. stays idempotent: a replay of a settled invoice never double-posts', async () => {
        await applyProviderVerdict(inputFor(h));
        const afterFirst = h.ledger.length;

        const replay = await applyProviderVerdict(inputFor(h));

        expect(replay.code).toBe('already_processed');
        expect(h.ledger).toHaveLength(afterFirst);
    });

    it('11. never grants an entitlement when settlement fails', async () => {
        const broken = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
            failures: { 'financial_ledger.insert': { code: 'XX000', message: 'ledger unavailable' } },
        });
        await applyProviderVerdict(inputFor(broken));

        expect(broken.tables.entitlements).toHaveLength(0);
        expect(broken.tables.profiles[0].has_paid).toBe(false);
    });
});

describe('BLOCKER 1 — the real payment_intents.id must be resolvable', () => {
    it('2. fails closed when no payment_intents row exists (invoice id is not a PI id)', async () => {
        const h = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            withoutPaymentIntent: true,
        });

        const result = await applyProviderVerdict(inputFor(h));

        expect(result.code).toBe('financial_failure');
        if (result.code === 'financial_failure') {
            expect(result.stage).toBe('payment_intent_unresolved');
        }
        expect(h.ledger).toHaveLength(0);
        expect(h.tables.entitlements).toHaveLength(0);
        expect(invoiceRow(h).payment_status).not.toBe('paid');
        expect(webhookRow(h).status).toBe('failed');
    });

    it('the FK really rejects an invoice id in payment_intent_id (regression lock)', async () => {
        // Directly prove the fake enforces what production enforces, so the
        // tests above cannot pass on a permissive mock.
        const h = createProductionConstraintSupabase({ netSplits: SIGNED_NET_SPLITS });

        const { postJournalEntry } = await import('../../server/payments/financialLedgerService');
        await expect(
            postJournalEntry(
                {
                    paymentIntentId: INVOICE_ID, // the historical bug
                    invoiceId: INVOICE_ID,
                    currency: 'EGP',
                    eventType: 'PAYMENT_CAPTURED',
                    sourceId: 'txn-1',
                    sourceEventType: 'kashier_transaction',
                    lines: [
                        { account: 'CUSTOMER_FUNDS', entryType: 'DEBIT', amountMinor: 48400 },
                        { account: 'BENEFICIARY_PAYABLE', entryType: 'CREDIT', amountMinor: 48400, beneficiaryId: BENEFICIARY_AUTHOR },
                    ],
                },
                h.client
            )
        ).rejects.toThrow(/financial_ledger_payment_intent_id_fkey/);

        expect(h.ledger).toHaveLength(0);
    });
});

describe('BLOCKER 2 — split failures are financial failures, not notices', () => {
    it('3. a freezeOrderSplits throw yields no false financial success', async () => {
        // The invoice lookup succeeds; the freeze's own order_splits INSERT is
        // what fails, so freezeOrderSplits throws — the exact historical
        // non-fatal-swallow path.
        const h = createProductionConstraintSupabase({
            netSplits: [],
            reserveAccountAllowed: true,
            failures: { 'order_splits.insert': { code: 'XX000', message: 'split store unavailable' } },
        });

        const result = await applyProviderVerdict(inputFor(h));

        expect(result.code).toBe('financial_failure');
        if (result.code === 'financial_failure') expect(result.stage).toBe('split_freeze_failed');
        expect(h.ledger).toHaveLength(0);
        expect(webhookRow(h).status).toBe('failed');
        expect(webhookRow(h).processed_at).toBeFalsy();
    });

    it('3b. a non-frozen freeze result (no applicable rules) is a failure', async () => {
        // No pre-seeded splits and no rules ⇒ freezeOrderSplits returns
        // { frozen:false } — which must NOT be treated as "zero splits, fine".
        const h = createProductionConstraintSupabase({ netSplits: [] });
        h.tables.split_rules = [];

        const result = await applyProviderVerdict(inputFor(h));

        expect(result.code).toBe('financial_failure');
        if (result.code === 'financial_failure') expect(result.stage).toBe('split_freeze_failed');
        expect(h.ledger).toHaveLength(0);
    });

    it('4. an order_splits read ERROR is not collapsed into an empty array', async () => {
        const h = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
            // The first order_splits select is freezeOrderSplits' idempotency
            // check; the second is the orchestration's read-back. Fail only that.
            failures: { 'order_splits.select': { code: '57014', message: 'statement timeout', skipFirst: 1 } },
        });

        const result = await applyProviderVerdict(inputFor(h));

        expect(result.code).toBe('financial_failure');
        if (result.code === 'financial_failure') expect(result.stage).toBe('split_read_failed');
        expect(h.ledger).toHaveLength(0);
        expect(invoiceRow(h).payment_status).not.toBe('paid');
    });

    it('5. zero persisted splits never become the basis of a §6.3 posting', async () => {
        // Freeze reports success (rows exist for its idempotency check), but the
        // orchestration's read-back returns [] — a genuinely absent allocation.
        const h = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
            emptyOrderSplitsReadFrom: 2,
        });

        const result = await applyProviderVerdict(inputFor(h));

        expect(result.code).toBe('financial_failure');
        if (result.code === 'financial_failure') expect(result.stage).toBe('splits_incomplete');
        expect(h.ledger).toHaveLength(0);
    });

    it('5b. an allocation that is not a positive integer minor unit is rejected', async () => {
        const h = createProductionConstraintSupabase({
            netSplits: [{ beneficiary_id: BENEFICIARY_AUTHOR, allocated_amount_minor: 0, destination_account: 'BENEFICIARY_PAYABLE' }],
        });

        const result = await applyProviderVerdict(inputFor(h));

        expect(result.code).toBe('financial_failure');
        if (result.code === 'financial_failure') expect(result.stage).toBe('splits_incomplete');
        expect(h.ledger).toHaveLength(0);
    });
});

describe('BLOCKER 2 — ledger persistence must be proven, not assumed', () => {
    it('6. a recordPaymentPostingJournal failure writes no processed settlement', async () => {
        const h = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
            failures: { 'financial_ledger.insert': { code: '23505', message: 'duplicate journal' } },
        });

        const result = await applyProviderVerdict(inputFor(h));

        expect(result.code).toBe('financial_failure');
        if (result.code === 'financial_failure') expect(result.stage).toBe('ledger_post_failed');
        expect(webhookRow(h).status).toBe('failed');
        expect(webhookRow(h).processing_status).toBe('financial_review:ledger_post_failed');
        expect(invoiceRow(h).payment_status).not.toBe('paid');
        expect(intentRow(h).status).toBe('unknown');
        expect(h.tables.entitlements).toHaveLength(0);
    });

    it('7. an FK rejection at the DB is a recoverable failure, not a swallowed success', async () => {
        // The FK guard fires when the ledger references a PI id that is gone.
        const h = createProductionConstraintSupabase({ netSplits: SIGNED_NET_SPLITS });
        h.tables.payment_intents = [];

        const result = await applyProviderVerdict(inputFor(h));

        // No PI row ⇒ the identity is unresolvable and we never reach the FK.
        expect(result.code).toBe('financial_failure');
        if (result.code === 'financial_failure') expect(result.stage).toBe('payment_intent_unresolved');
        expect(h.ledger).toHaveLength(0);
    });

    it('7b. a RESERVE credit is refused by the PRE-migration account CHECK (the real schema blocker)', async () => {
        const h = createProductionConstraintSupabase({ netSplits: SIGNED_NET_SPLITS });

        const { recordPaymentPostingJournal } = await import('../../server/payments/financialLedgerService');
        await expect(
            recordPaymentPostingJournal(
                {
                    paymentIntentId: PAYMENT_INTENT_ID,
                    invoiceId: INVOICE_ID,
                    currency: 'EGP',
                    grossAmountMinor: 2420,
                    gatewayFeeMinor: 0,
                    transactionId: 'txn-1',
                    splits: [{ beneficiaryId: null, allocatedAmountMinor: 2420, account: 'RESERVE' as never }],
                    supabaseClient: h.client,
                }
            )
        ).rejects.toThrow(/financial_ledger_account_check/);
    });

    it('a failure to verify existing journals is itself a financial failure', async () => {
        const h = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            failures: { 'financial_ledger.select': { code: '57014', message: 'statement timeout' } },
        });

        const result = await applyProviderVerdict(inputFor(h));

        expect(result.code).toBe('financial_failure');
        if (result.code === 'financial_failure') expect(result.stage).toBe('ledger_idempotency_check_failed');
        expect(h.ledger).toHaveLength(0);
    });
});

describe('10. replay after a financial failure recovers without duplicating the journal', () => {
    it('a failed capture that later persists exactly once leaves a single journal', async () => {
        // Attempt 1: the ledger is unavailable ⇒ durable financial failure.
        const first = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
            failures: { 'financial_ledger.insert': { code: 'XX000', message: 'transient ledger outage' } },
        });

        const failed = await applyProviderVerdict(inputFor(first));
        expect(failed.code).toBe('financial_failure');
        expect(first.ledger).toHaveLength(0);
        expect(webhookRow(first).status).toBe('failed');

        // Attempt 2: the same database, with the outage cleared. The client is
        // rebuilt (the injected failure map lives on it) but every table — and
        // therefore the durable `failed` marker and the unsettled invoice — is
        // carried over, exactly as a provider replay would find it.
        const retry = createProductionConstraintSupabase({ netSplits: SIGNED_NET_SPLITS, reserveAccountAllowed: true });
        for (const table of Object.keys(first.tables)) {
            retry.tables[table] = first.tables[table];
        }

        const recovered = await applyProviderVerdict(inputFor(retry));

        expect(recovered).toEqual({ code: 'applied', outcome: 'success' });
        expect(new Set(retry.ledger.map((r) => r.journal_entry_id)).size).toBe(1);
        expect(sum(ledgerFor(retry, 'DEBIT'))).toBe(49900);
        expect(sum(ledgerFor(retry, 'CREDIT'))).toBe(49900);
        expect(invoiceRow(retry).payment_status).toBe('paid');
        expect(webhookRow(retry).status).toBe('processed');
    });

    it('9. a replay that finds the journal already persisted settles forward with NO duplicate', async () => {
        // Simulate: the journal persisted, then the process died before
        // finalizing. The invoice is therefore still unsettled.
        const h = createProductionConstraintSupabase({ netSplits: SIGNED_NET_SPLITS, reserveAccountAllowed: true });
        h.ledger.push(
            {
                journal_entry_id: 'journal-already-there',
                payment_intent_id: PAYMENT_INTENT_ID,
                invoice_id: INVOICE_ID,
                account: 'CUSTOMER_FUNDS',
                entry_type: 'DEBIT',
                amount_minor: 49900,
                event_type: 'PAYMENT_CAPTURED',
                beneficiary_id: null,
            } as LedgerRow
        );
        h.tables.financial_ledger.push(h.ledger[0]);
        const countBefore = h.ledger.length;

        const result = await applyProviderVerdict(inputFor(h));

        expect(result).toEqual({ code: 'applied', outcome: 'success' });
        expect(h.ledger).toHaveLength(countBefore); // no second journal
        expect(invoiceRow(h).payment_status).toBe('paid');
        expect(webhookRow(h).status).toBe('processed');
    });
});

describe('webhook_events state transitions on financial failure', () => {
    it('7/8. records status=failed, a financial_review stage and the reason — never processed', async () => {
        const h = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
            failures: { 'financial_ledger.insert': { code: 'XX000', message: 'ledger down' } },
        });

        const result = await applyProviderVerdict(inputFor(h));

        expect(result.code).toBe('financial_failure');
        const row = webhookRow(h);
        expect(row.status).toBe('failed');
        expect(row.processing_status).toBe('financial_review:ledger_post_failed');
        expect(row.error_message).toContain('ledger down');
        expect(row.processed_at).toBeFalsy();
    });

    it('leaves the invoice reconciler-visible (payment_status=unknown) for recovery', async () => {
        const h = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
            failures: { 'financial_ledger.insert': { code: 'XX000', message: 'ledger down' } },
        });

        await applyProviderVerdict(inputFor(h));

        expect(invoiceRow(h).payment_status).toBe('unknown');
        expect(intentRow(h).status).toBe('unknown');
        // 'unknown' is the reconciler's existing selector, so no new state.
        expect(intentRow(h).provider_transaction_id).toBe('txn-63-0001');
    });

    it('a reconciliation-sourced failure does not touch webhook rows', async () => {
        const h = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
            failures: { 'financial_ledger.insert': { code: 'XX000', message: 'ledger down' } },
        });

        const result = await applyProviderVerdict(
            inputFor(h, { source: 'reconciliation', providerEventId: `reconciled-${PAYMENT_INTENT_ID}-1` })
        );

        expect(result.code).toBe('financial_failure');
        expect(webhookRow(h).status).toBe('pending');
    });
});

describe('amount mismatch stays a hard, non-settling outcome', () => {
    it('does not post a journal and does not mark the capture paid', async () => {
        const h = createProductionConstraintSupabase({ netSplits: SIGNED_NET_SPLITS, reserveAccountAllowed: true });

        const result = await applyProviderVerdict(
            inputFor(h, {
                verdict: { status: 'success', externalReferenceId: 'txn-63-0001', paidAmount: 1, providerStatus: 'SUCCESS' },
            })
        );

        expect(result.code).toBe('amount_mismatch');
        expect(h.ledger).toHaveLength(0);
        expect(invoiceRow(h).payment_status).not.toBe('paid');
        expect(h.tables.entitlements).toHaveLength(0);
    });
});

afterEach(() => {
    vi.clearAllMocks();
});
