import { describe, it, expect, vi } from 'vitest';
import {
    createProductionConstraintSupabase,
    SIGNED_NET_SPLITS,
    INVOICE_ID,
    USER_ID,
    TIER_ID,
    PAYMENT_INTENT_ID,
} from '../helpers/productionConstraintSupabase';
import { applyProviderVerdict, type ProviderVerdictInput } from '../../server/payments/fulfillmentService';
import { verifyPaidAmount } from '../../server/payments/verifyPaidAmount';
import {
    canTransitionInvoicePayment,
    deriveInvoicePaymentState,
} from '../../server/payments/invoicePaymentState';

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({ from: () => ({}), rpc: vi.fn() })),
}));

const EVENT_ID = 'evt-63-0001'; // seeded by the production-constraint harness

function inputFor(db: ReturnType<typeof createProductionConstraintSupabase>, overrides: Partial<ProviderVerdictInput> = {}): ProviderVerdictInput {
    return {
        supabase: db.client,
        invoiceId: INVOICE_ID,
        gatewayName: 'KASHIER_EGYPT',
        verdict: {
            status: 'success',
            externalReferenceId: 'txn-phase6-0001',
            paidAmount: 499,
            currency: 'EGP',
            providerStatus: 'SUCCESS',
        },
        providerEventId: EVENT_ID,
        providerStatus: 'SUCCESS',
        source: 'webhook',
        ...overrides,
    };
}

function fakeInvoiceDb(invoice: { amount: number; currency: string }) {
    const builder: any = {
        select() { return builder; },
        eq() { return builder; },
        async single() { return { data: invoice, error: null }; },
    };
    return { from: () => builder } as any;
}

describe('Phase 6 — explicit payment state machine', () => {
    it('allows only pending -> paid -> fulfilled and pending -> amount_mismatch/failed', () => {
        expect(canTransitionInvoicePayment('pending', 'paid')).toBe(true);
        expect(canTransitionInvoicePayment('pending', 'failed')).toBe(true);
        expect(canTransitionInvoicePayment('pending', 'amount_mismatch')).toBe(true);
        expect(canTransitionInvoicePayment('paid', 'fulfilled')).toBe(true);

        expect(canTransitionInvoicePayment('paid', 'failed')).toBe(false);
        expect(canTransitionInvoicePayment('paid', 'amount_mismatch')).toBe(false);
        expect(canTransitionInvoicePayment('amount_mismatch', 'paid')).toBe(false);
        expect(canTransitionInvoicePayment('failed', 'paid')).toBe(false);
        expect(canTransitionInvoicePayment('fulfilled', 'paid')).toBe(false);
    });

    it('derives the legacy columns when metadata has no explicit state', () => {
        expect(deriveInvoicePaymentState({ status: 'success', payment_status: 'paid' })).toBe('paid');
        expect(deriveInvoicePaymentState({ status: 'failed', payment_status: 'failed' })).toBe('failed');
        expect(deriveInvoicePaymentState({ status: 'pending', payment_status: 'pending' })).toBe('pending');
        expect(deriveInvoicePaymentState({ status: 'pending', metadata: { payment_state: 'amount_mismatch' } })).toBe('amount_mismatch');
        expect(deriveInvoicePaymentState({ status: 'success', payment_status: 'refunded' })).toBe('failed');
        expect(deriveInvoicePaymentState({ status: 'cancelled', payment_status: 'cancelled' })).toBe('failed');
    });
});

describe('Phase 6 — zero-margin amount/currency verification', () => {
    it('accepts exactly the invoice amount and rejects one cent/piastre either way', async () => {
        const db = fakeInvoiceDb({ amount: 499, currency: 'EGP' });

        await expect(verifyPaidAmount(INVOICE_ID, 499, db, 'EGP')).resolves.toMatchObject({ ok: true });
        await expect(verifyPaidAmount(INVOICE_ID, 499.01, db, 'EGP')).resolves.toMatchObject({
            ok: false,
            reason: 'amount_mismatch',
        });
        await expect(verifyPaidAmount(INVOICE_ID, 498.99, db, 'EGP')).resolves.toMatchObject({
            ok: false,
            reason: 'amount_mismatch',
        });
    });

    it('rejects a different currency instead of converting it', async () => {
        const db = fakeInvoiceDb({ amount: 499, currency: 'EGP' });
        await expect(verifyPaidAmount(INVOICE_ID, 499, db, 'USD')).resolves.toMatchObject({
            ok: false,
            reason: 'currency_mismatch',
        });
    });
});

describe('Phase 6 — idempotency and terminal states through applyProviderVerdict', () => {
    it('processes the same webhook 3 times as exactly one settlement', async () => {
        const db = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
        });

        const first = await applyProviderVerdict(inputFor(db));
        const second = await applyProviderVerdict(inputFor(db));
        const third = await applyProviderVerdict(inputFor(db));

        expect(first).toEqual({ code: 'applied', outcome: 'success' });
        expect(second.code).toBe('already_processed');
        expect(third.code).toBe('already_processed');
        expect(new Set(db.ledger.map((row) => row.journal_entry_id)).size).toBe(1);
        expect(db.tables.entitlements).toHaveLength(1);
        expect(db.tables.webhook_events).toHaveLength(1);
        expect(db.tables.webhook_events[0].provider_event_id).toBe(EVENT_ID);
        expect(db.tables.invoices[0].metadata.payment_state).toBe('fulfilled');
    });


    it('does not let a paid event resurrect a refunded invoice', async () => {
        const db = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
        });
        db.tables.invoices[0].status = 'success';
        db.tables.invoices[0].payment_status = 'refunded';

        const result = await applyProviderVerdict(inputFor(db));

        expect(result.code).toBe('already_processed');
        expect(db.ledger).toHaveLength(0);
        expect(db.tables.invoices[0].payment_status).toBe('refunded');
    });

    it('does not move amount_mismatch backwards when a later success arrives', async () => {
        const db = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
        });

        const mismatch = await applyProviderVerdict(inputFor(db, {
            verdict: {
                status: 'success',
                externalReferenceId: 'txn-phase6-mismatch',
                paidAmount: 1,
                currency: 'EGP',
                providerStatus: 'SUCCESS',
            },
        }));
        const late = await applyProviderVerdict(inputFor(db));

        expect(mismatch.code).toBe('amount_mismatch');
        expect(late.code).toBe('already_processed');
        expect(db.ledger).toHaveLength(0);
        expect(db.tables.entitlements).toHaveLength(0);
        expect(db.tables.invoices[0].payment_status).not.toBe('paid');
        expect(db.tables.invoices[0].metadata.payment_state).toBe('amount_mismatch');
        expect(db.tables.webhook_events[0].processing_status).toBe('amount_mismatch');
    });

    it('marks a currency mismatch as amount_mismatch and posts nothing', async () => {
        const db = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
        });

        const result = await applyProviderVerdict(inputFor(db, {
            verdict: {
                status: 'success',
                externalReferenceId: 'txn-phase6-currency',
                paidAmount: 499,
                currency: 'USD',
                providerStatus: 'SUCCESS',
            },
        }));

        expect(result.code).toBe('amount_mismatch');
        expect(db.ledger).toHaveLength(0);
        expect(db.tables.invoices[0].metadata.payment_state).toBe('amount_mismatch');
        expect(db.tables.payment_intents[0].status).toBe('failed');
    });

    it('rejects a failure event after the invoice is already paid', async () => {
        const db = createProductionConstraintSupabase({
            netSplits: SIGNED_NET_SPLITS,
            reserveAccountAllowed: true,
        });

        await applyProviderVerdict(inputFor(db));
        const lateFailure = await applyProviderVerdict(inputFor(db, {
            verdict: {
                status: 'failed',
                externalReferenceId: 'txn-phase6-late-failure',
                providerStatus: 'DECLINED',
            },
            providerEventId: 'evt-phase6-late-failure',
            providerStatus: 'DECLINED',
        }));

        expect(lateFailure.code).toBe('already_processed');
        expect(db.tables.invoices[0].payment_status).toBe('paid');
        expect(db.tables.invoices[0].metadata.payment_state).not.toBe('failed');
    });
});
