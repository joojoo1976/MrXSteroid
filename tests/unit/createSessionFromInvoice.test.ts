import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    createSessionFromInvoice,
    CheckoutConflictError,
    CheckoutValidationError,
    type CheckoutSessionGateway,
} from '../../server/payments/checkout/checkoutSessionService';

type Row = Record<string, any>;

function fakeSupabase(invoice: Row = {}) {
    const db: Record<string, Row[]> = {
        invoices: [{
            id: 'inv-1',
            amount: '499.00',
            currency: 'EGP',
            status: 'pending',
            payment_status: 'pending',
            region: 'egypt',
            gateway: 'invoice_first',
            tier_id: 'digital',
            customer_email: 'buyer@example.com',
            customer_name: 'Test Buyer',
            phone_number: null,
            idempotency_key: 'idem-inv-1',
            kashier_session_id: null,
            kashier_session_url: null,
            kashier_order_id: null,
            metadata: {},
            pricing_version: '2026-11-18.1',
            quote_hash: 'hash-1',
            ...invoice,
        }],
        payment_intents: [],
    };
    let counter = 0;

    function from(table: string) {
        const state: {
            mode: 'select' | 'insert' | 'update';
            payload: Row | null;
            filters: Record<string, any>;
            orderCol: string | null;
            ascending: boolean;
        } = { mode: 'select', payload: null, filters: {}, orderCol: null, ascending: true };

        const exec = async () => {
            const rows = db[table] || (db[table] = []);
            if (state.mode === 'insert') {
                const row = { id: `${table}-${++counter}`, ...state.payload };
                rows.push(row);
                return { data: row, error: null };
            }
            const matched = rows.filter((row) =>
                Object.entries(state.filters).every(([key, value]) => row[key] === value)
            );
            if (state.mode === 'update') {
                matched.forEach((row) => Object.assign(row, state.payload));
                return { data: matched, error: null };
            }
            const result = [...matched];
            if (state.orderCol) {
                result.sort((a, b) =>
                    (a[state.orderCol!] > b[state.orderCol!] ? 1 : -1) * (state.ascending ? 1 : -1)
                );
            }
            return { data: result, error: null };
        };

        const builder: any = {
            select() { return builder; },
            insert(payload: Row) { state.mode = 'insert'; state.payload = payload; return builder; },
            update(payload: Row) { state.mode = 'update'; state.payload = payload; return builder; },
            eq(key: string, value: any) { state.filters[key] = value; return builder; },
            order(key: string, opts?: { ascending?: boolean }) {
                state.orderCol = key;
                state.ascending = opts?.ascending !== false;
                return builder;
            },
            async single() {
                const { data, error } = await exec();
                return { data: Array.isArray(data) ? (data[0] ?? null) : data, error };
            },
            async maybeSingle() {
                const { data, error } = await exec();
                return { data: Array.isArray(data) ? (data[0] ?? null) : data, error };
            },
            then(resolve: any, reject: any) { return exec().then(resolve, reject); },
        };
        return builder;
    }

    return { from, _db: db } as any;
}

function fakeGateway() {
    const calls: any[] = [];
    const gateway = {
        calls,
        createPaymentSession: vi.fn(async (params: any) => {
            calls.push(params);
            return {
                sessionId: 'sess-invoice-1',
                sessionUrl: 'https://checkout.kashier.io/payment/sess-invoice-1',
                orderId: params.orderRef,
                amount: params.amount,
                currency: params.currency,
                status: 'ACTIVE',
            };
        }),
    } as unknown as CheckoutSessionGateway & { calls: any[] };
    return gateway;
}

const ENV = {
    KASHIER_MODE: 'test',
    KASHIER_TEST_MERCHANT_ID: 'MID-TEST-EG',
    KASHIER_TEST_PAYMENT_API_KEY: 'test-api-key-123',
    KASHIER_TEST_SECRET_KEY: 'test-secret-key-456',
};

describe('Phase 4 — createSessionFromInvoice', () => {
    beforeEach(() => {
        Object.assign(process.env, ENV);
    });

    afterEach(() => {
        Object.keys(ENV).forEach((key) => delete process.env[key]);
        vi.restoreAllMocks();
    });

    it('uses the invoice amount/currency and never sends line items to the gateway', async () => {
        const supabase = fakeSupabase({ amount: '948.00' });
        const gateway = fakeGateway();

        const result = await createSessionFromInvoice(
            { invoiceId: 'inv-1' },
            { supabase, gatewayFactory: () => gateway }
        );

        expect(result.amount).toBe(948);
        expect(result.currency).toBe('EGP');
        expect(result.idempotent).toBe(false);
        expect(gateway.calls).toHaveLength(1);
        expect(gateway.calls[0].amount).toBe(948);
        expect(gateway.calls[0].currency).toBe('EGP');
        expect(gateway.calls[0].lines).toBeUndefined();
        expect(gateway.calls[0].line_items).toBeUndefined();
        expect(supabase._db.payment_intents[0].amount_minor).toBe(94800);
    });

    it('ignores any caller contact/amount-like hints; the invoice row wins for amount', async () => {
        const supabase = fakeSupabase({ amount: '499.00' });
        const gateway = fakeGateway();

        const result = await createSessionFromInvoice(
            {
                invoiceId: 'inv-1',
                email: 'attacker@example.com',
                fullName: 'Other Name',
                country: 'US',
            },
            { supabase, gatewayFactory: () => gateway }
        );

        expect(result.amount).toBe(499);
        expect(result.currency).toBe('EGP');
        expect(gateway.calls[0].amount).toBe(499);
        expect(gateway.calls[0].customerEmail).toBe('buyer@example.com');
        expect(gateway.calls[0].customerName).toBe('Test Buyer');
    });

    it('replays a stored session instead of minting a second one', async () => {
        const supabase = fakeSupabase({
            kashier_session_id: 'sess-existing',
            kashier_session_url: 'https://checkout.kashier.io/payment/sess-existing',
        });
        const gateway = fakeGateway();

        const result = await createSessionFromInvoice(
            { invoiceId: 'inv-1' },
            { supabase, gatewayFactory: () => gateway }
        );

        expect(result.idempotent).toBe(true);
        expect(result.sessionId).toBe('sess-existing');
        expect(result.amount).toBe(499);
        expect(gateway.calls).toHaveLength(0);
        expect(supabase._db.payment_intents).toHaveLength(0);
    });

    it('refuses to create a session for a non-pending invoice', async () => {
        const supabase = fakeSupabase({ status: 'paid', payment_status: 'paid' });
        const gateway = fakeGateway();

        await expect(createSessionFromInvoice(
            { invoiceId: 'inv-1' },
            { supabase, gatewayFactory: () => gateway }
        )).rejects.toBeInstanceOf(CheckoutConflictError);
        expect(gateway.calls).toHaveLength(0);
    });

    it('never replays a stored session on a paid invoice', async () => {
        const supabase = fakeSupabase({
            status: 'paid',
            payment_status: 'paid',
            kashier_session_url: 'https://checkout.kashier.io/payment/stale',
            kashier_session_id: 'stale',
        });
        const gateway = fakeGateway();

        await expect(createSessionFromInvoice(
            { invoiceId: 'inv-1' },
            { supabase, gatewayFactory: () => gateway }
        )).rejects.toBeInstanceOf(CheckoutConflictError);
        expect(gateway.calls).toHaveLength(0);
    });

    it('refuses a currency that does not match the merchant', async () => {
        const supabase = fakeSupabase({ currency: 'USD' });
        const gateway = fakeGateway();

        await expect(createSessionFromInvoice(
            { invoiceId: 'inv-1' },
            { supabase, gatewayFactory: () => gateway }
        )).rejects.toBeInstanceOf(CheckoutValidationError);
        expect(gateway.calls).toHaveLength(0);
    });

    it('fails when the invoice does not exist', async () => {
        const supabase = fakeSupabase();
        supabase._db.invoices = [];
        const gateway = fakeGateway();

        await expect(createSessionFromInvoice(
            { invoiceId: 'missing' },
            { supabase, gatewayFactory: () => gateway }
        )).rejects.toBeInstanceOf(CheckoutValidationError);
        expect(gateway.calls).toHaveLength(0);
    });
});
