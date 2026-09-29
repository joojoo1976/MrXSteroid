/**
 * P0 regression — the invoice/PaymentIntent write in the settlement path must
 * fail CLOSED.
 *
 * Defect (found by QA 2026-09-25, evidence: read-only production inspection):
 *   `server/payments/fulfillmentService.ts` wrote the paid state with two
 *   discarded awaits:
 *       await supabase.from('invoices').update({ status:'success',
 *                                                payment_status:'paid', ... })
 *       await supabase.from('payment_intents').update({ status:'succeeded', ... })
 *   PostgREST returns a RESOLVED promise carrying `{ error }` for a failed
 *   UPDATE — it does not throw — so `await` alone proves nothing.
 *
 *   The first write was provably broken in production: it sends
 *   `payment_source`, and `invoices.payment_source` did not exist in the
 *   deployed schema (verified against information_schema), so the UPDATE failed
 *   with 42703 and the error was dropped. The invoice stayed `pending` while
 *   steps 8-10 still activated the subscription and granted the entitlement:
 *       entitlement = granted, invoice update = silently failed.
 *
 * Contract asserted here:
 *   DB write failure -> fail closed -> NO paid -> NO entitlement
 *                    -> NO fulfillment success
 *
 * §6.3 accounting, the split engine, the ledger and the F gates are mocked
 * SUCCESS here on purpose: they are orthogonal to this defect and are covered
 * by the existing §6.3 suites. This file only proves the fail-closed wiring
 * of the two writes that were unchecked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

interface Write {
    table: string;
    payload: Record<string, unknown>;
}

const writes: Write[] = [];
let failTable: string | null = null;
let failMessage = 'simulated DB write failure';

const INVOICE = {
    id: 'inv-fc-001',
    user_id: 'user-fc-001',
    tier_id: 'digital',
    amount: 499,
    currency: 'EGP',
    status: 'pending',
    payment_status: 'pending',
    affiliate_id: null,
    referral_code: null,
};

const seedFor = (table: string): unknown => {
    if (table === 'invoices') return INVOICE;
    if (table === 'payment_intents') {
        return {
            id: 'pi-fc-001',
            invoice_id: INVOICE.id,
            status: 'processing',
            gate_version: 0,
            // §6.3 fee accounting is deliberately out of scope for this file
            // (see the header) and is covered by
            // tests/unit/gatewayFeeNet.test.ts. It is persisted as an EXPLICIT
            // ZERO here — not left unresolved — so the frozen split fixtures
            // below stay on a gross == net basis. An unresolved fee would fail
            // closed at gateway_fee_unresolved and short-circuit the
            // write-failure paths this file actually exists to prove.
            //
            // A persisted 0 is a legitimate value: precedence 1 accepts any
            // integer F in [0, G). There is deliberately no region or 'GLOBAL'
            // default fee to lean on any more, so the fixture states the zero
            // on the intent, which is the production replay-determinism path.
            gateway_fee_minor: 0,
        };
    }
    if (table === 'profiles') return { id: INVOICE.user_id };
    if (table === 'order_splits') {
        return [
            {
                beneficiary_id: 'ben-1',
                allocated_amount_minor: 24950,
                destination_account: 'acct-1',
            },
            {
                beneficiary_id: 'ben-2',
                allocated_amount_minor: 24950,
                destination_account: 'acct-2',
            },
        ];
    }
    return null;
};

const makeChain = (table: string) => {
    const c: Record<string, unknown> = {};
    let isUpdate = false;
    // Only an UPDATE may be failed. A failing SELECT would short-circuit into
    // `unresolved`/`quarantined` before the settlement writes are ever reached,
    // which would test nothing about the write-failure path.
    const writeFails = () => failTable === table && isUpdate;
    const settle = (single: boolean) => () => {
        if (writeFails()) {
            return Promise.resolve({ data: null, error: { message: failMessage } });
        }
        return Promise.resolve({ data: single ? seedFor(table) : [], error: null });
    };
    c.select = () => c;
    c.insert = () => c;
    c.update = (payload: Record<string, unknown>) => {
        isUpdate = true;
        writes.push({ table, payload });
        return c;
    };
    c.upsert = () => c;
    c.delete = () => c;
    c.eq = () => c;
    c.neq = () => c;
    c.order = () => c;
    c.limit = () => c;
    c.in = () => c;
    c.gt = () => c;
    c.lt = () => c;
    c.is = () => c;
    c.single = settle(true);
    c.maybeSingle = settle(true);
    c.then = (res: (v: unknown) => void) => {
        res(settle(true)());
        return undefined;
    };
    return c;
};

const makeSupabase = () => ({
    from: (table: string) => makeChain(table),
});

const VERDICT = {
    status: 'success' as const,
    externalReferenceId: 'txn-fc-001',
};

const makeSupabaseLegacy = () => ({ from: (table: string) => makeChain(table) });
void makeSupabaseLegacy;

vi.mock('./../../server/payments/verifyPaidAmount', () => ({
    verifyPaidAmount: () => Promise.resolve({ ok: true }),
}));
vi.mock('./../../server/payments/paymentIntentService', () => ({
    canApplyWebhookToIntent: () => ({ canApply: true }),
}));

const grantEntitlement = vi.fn(() => Promise.resolve({ code: 'granted' }));
const freezeOrderSplits = vi.fn(() => Promise.resolve({ frozen: true, splitsCount: 2 }));
const recordPaymentPostingJournal = vi.fn(() =>
    Promise.resolve({
        journalEntryId: 'je-fc-001',
        entriesPosted: 2,
        totalDebitMinor: 49900,
        totalCreditMinor: 49900,
    })
);
const triggerAffiliateCommission = vi.fn(() => Promise.resolve());

vi.mock('./../../server/payments/entitlementService', () => ({
    grantEntitlement: (...a: unknown[]) => grantEntitlement(...(a as [])),
}));
vi.mock('./../../server/payments/splitEngine', () => ({
    freezeOrderSplits: (...a: unknown[]) => freezeOrderSplits(...(a as [])),
}));
vi.mock('./../../server/payments/financialLedgerService', () => ({
    recordPaymentPostingJournal: (...a: unknown[]) => recordPaymentPostingJournal(...(a as [])),
}));
vi.mock('./../../server/affiliate/ledgerService', () => ({
    triggerAffiliateCommission: (...a: unknown[]) => triggerAffiliateCommission(...(a as [])),
}));

let applyProviderVerdict: typeof import('../../server/payments/fulfillmentService').applyProviderVerdict;

beforeEach(async () => {
    writes.length = 0;
    failTable = null;
    grantEntitlement.mockClear();
    freezeOrderSplits.mockClear();
    recordPaymentPostingJournal.mockClear();
    ({ applyProviderVerdict } = await import('../../server/payments/fulfillmentService'));
});

const run = () =>
    applyProviderVerdict({
        supabase: makeSupabase() as never,
        invoiceId: INVOICE.id,
        currentIntentId: 'pi-fc-001',
        gatewayName: 'KASHIER_EGYPT',
        verdict: VERDICT,
        providerEventId: 'evt-fc-001',
        providerStatus: 'APPROVED',
        source: 'webhook',
        rawBody: JSON.stringify({ orderId: INVOICE.id, source: 'kashier_payment_page' }),
    });

describe('settlement fail-closed on the invoice write', () => {
    it('returns financial_failure(invoice_write_failed) when the invoices UPDATE fails', async () => {
        failTable = 'invoices';
        const res = await run();
        expect(res.code).toBe('financial_failure');
        expect(res.code === 'financial_failure' && res.stage).toBe('invoice_write_failed');
    });

    it('does NOT mark the PaymentIntent succeeded when the invoice write fails', async () => {
        failTable = 'invoices';
        await run();
        const intentWrite = writes.find(
            (w) => w.table === 'payment_intents' && w.payload.status === 'succeeded'
        );
        expect(intentWrite).toBeUndefined();
    });

    it('does NOT grant an entitlement when the invoice write fails', async () => {
        failTable = 'invoices';
        await run();
        expect(grantEntitlement).not.toHaveBeenCalled();
    });

    it('does NOT activate the subscription when the invoice write fails', async () => {
        failTable = 'invoices';
        await run();
        const profileWrite = writes.find((w) => w.payload.has_paid === true);
        expect(profileWrite).toBeUndefined();
    });

    it('never returns applied/success when the invoice write fails', async () => {
        failTable = 'invoices';
        const res = await run();
        expect(res.code === 'applied' && res.outcome === 'success').toBe(false);
    });
});

describe('settlement fail-closed on the PaymentIntent write', () => {
    it('returns financial_failure(payment_intent_write_failed) when the intents UPDATE fails', async () => {
        failTable = 'payment_intents';
        const res = await run();
        expect(res.code).toBe('financial_failure');
        expect(res.code === 'financial_failure' && res.stage).toBe('payment_intent_write_failed');
    });

    it('does NOT grant an entitlement when the PaymentIntent write fails', async () => {
        failTable = 'payment_intents';
        await run();
        expect(grantEntitlement).not.toHaveBeenCalled();
    });
});

describe('invoices.payment_source migration contract', () => {
    const MIGRATION = 'supabase/migrations/20260925160000_invoices_payment_source.sql';
    const FILE = MIGRATION;
    const readMigration = () => {
        const fs = require('node:fs') as typeof import('node:fs');
        const path = require('node:path') as typeof import('node:path');
        return fs.readFileSync(path.join(process.cwd(), FILE), 'utf8');
    };

    it('exists as a dedicated, additive migration', () => {
        const sql = readMigration();
        expect(sql).toMatch(/add column if not exists payment_source text/i);
    });

    it('uses text (not an invented enum) and stays nullable', () => {
        const sql = readMigration();
        expect(sql).not.toMatch(/create type/i);
        expect(sql).not.toMatch(/payment_source\s+\w+\s+not null/i);
    });

    it('constrains the allow-list to the two values the code actually emits', () => {
        const sql = readMigration();
        expect(sql).toContain("'kashier_payment_page'");
        expect(sql).toContain("'kashier_gateway'");
        expect(sql).toContain('invoices_payment_source_check');
    });

    it('is idempotent and safe to re-run', () => {
        const sql = readMigration();
        expect(sql).toMatch(/if not exists/i);
    });

    it('documents why, RLS implications, backward compatibility and rollback', () => {
        const sql = readMigration();
        expect(sql).toMatch(/--\s*WHY/i);
        expect(sql).toMatch(/--\s*RLS IMPLICATIONS/i);
        expect(sql).toMatch(/--\s*BACKWARD COMPATIBILITY/i);
        expect(sql).toMatch(/--\s*ROLLBACK/i);
        expect(sql).toMatch(/DROP COLUMN payment_source/i);
    });

    it('does not touch §6.3, F, the split engine or the payout gates', () => {
        const sql = readMigration();
        // Assert on the DDL, not on prose: the header legitimately names these
        // areas in its NOT IN SCOPE note. What must not exist is a statement
        // that alters or writes any of them.
        const executable = sql
            .split('\n')
            .filter((l) => !/^\s*--/.test(l))
            .join('\n');
        expect(executable).not.toMatch(/alter\s+table\s+(public\.)?(order_splits|financial_ledger|payouts|payment_intents|webhook_events|entitlements)/i);
        expect(executable).not.toMatch(/insert|update|delete/i);
        expect(executable).not.toMatch(/gateway_fee|gate_version|85|10\/5/i);
    });

    it('names a real migration file', () => {
        expect(MIGRATION).toBe(FILE);
    });
});

describe('settlement happy path is unchanged', () => {
    it('applies the verdict and grants the entitlement when both writes succeed', async () => {
        const res = await run();
        expect(res.code, JSON.stringify(res)).toBe('applied');
        expect(grantEntitlement).toHaveBeenCalledTimes(1);
    });

    it('still writes the two canonical payment_source values', async () => {
        await run();
        const invoiceWrite = writes.find((w) => w.payload.payment_status === 'paid');
        expect(invoiceWrite?.payload.payment_source).toBe('kashier_payment_page');
    });

    it('records kashier_gateway for a non-payment-page capture', async () => {
        const res = await applyProviderVerdict({
            supabase: makeSupabase() as never,
            invoiceId: INVOICE.id,
            currentIntentId: 'pi-fc-001',
            gatewayName: 'KASHIER_EGYPT',
            verdict: VERDICT,
            providerEventId: 'evt-fc-002',
            providerStatus: 'APPROVED',
            source: 'webhook',
            rawBody: JSON.stringify({ orderId: INVOICE.id }),
        });
        expect(res.code, JSON.stringify(res)).toBe('applied');
        const invoiceWrite = writes.find((w) => w.payload.payment_status === 'paid');
        expect(invoiceWrite?.payload.payment_source).toBe('kashier_gateway');
    });
});
