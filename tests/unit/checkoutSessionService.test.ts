import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    createCheckoutSession,
    CheckoutValidationError,
    type CheckoutSessionGateway,
} from '../../server/payments/checkout/checkoutSessionService';

type Row = Record<string, any>;

function createFakeSupabase(seed: { invoices?: Row[]; payment_intents?: Row[] } = {}) {
    const db: Record<string, Row[]> = {
        invoices: seed.invoices ? [...seed.invoices] : [],
        payment_intents: seed.payment_intents ? [...seed.payment_intents] : [],
        admin_settings: [],
    };
    let idCounter = 0;
    const nextId = (t: string) => `${t}-${String(++idCounter).padStart(4, '0')}`;

    function from(table: string) {
        const state = {
            mode: 'select' as 'select' | 'insert' | 'update',
            payload: null as Row | null,
            filters: {} as Record<string, any>,
            orderCol: null as string | null,
            ascending: true,
        };

        const exec = async () => {
            const rows = db[table] || (db[table] = []);
            if (state.mode === 'insert') {
                const row: Row = { id: nextId(table), metadata: {}, ...state.payload };
                rows.push(row);
                return { data: row, error: null };
            }
            const matched = rows.filter(r => Object.entries(state.filters).every(([k, v]) => r[k] === v));
            if (state.mode === 'update') {
                matched.forEach(r => Object.assign(r, state.payload));
                return { data: null, error: null };
            }
            const result = [...matched];
            if (state.orderCol) {
                result.sort((a, b) =>
                    (a[state.orderCol!] > b[state.orderCol!] ? 1 : -1) * (state.ascending ? 1 : -1));
            }
            return { data: result, error: null };
        };

        const builder: any = {
            select() { return builder; },
            insert(payload: Row) { state.mode = 'insert'; state.payload = payload; return builder; },
            update(payload: Row) { state.mode = 'update'; state.payload = payload; return builder; },
            eq(col: string, val: any) { state.filters[col] = val; return builder; },
            order(col: string, opts?: { ascending?: boolean }) {
                state.orderCol = col; state.ascending = opts?.ascending !== false; return builder;
            },
            async single() { const { data, error } = await exec(); return { data: Array.isArray(data) ? (data[0] ?? null) : data, error }; },
            async maybeSingle() { const { data, error } = await exec(); return { data: Array.isArray(data) ? (data[0] ?? null) : data, error }; },
            then(resolve: any, reject: any) { return exec().then(resolve, reject); },
        };
        return builder;
    }

    return { from, _db: db } as any;
}

function createFakeGateway() {
    const calls: any[] = [];
    const gateway = {
        calls,
        getGatewayName: () => 'KASHIER_EGYPT',
        createInvoice: async () => { throw new Error('createInvoice not used in Phase 4'); },
        verifyWebhook: async () => ({ valid: true }),
        createPaymentSession: async (params: any) => {
            calls.push(params);
            return {
                sessionId: `sess-${calls.length}`,
                sessionUrl: `https://test-api.kashier.io/s/${calls.length}`,
                orderId: params.orderRef,
                amount: params.amount,
                currency: params.currency,
                status: 'ACTIVE',
            };
        },
    } as unknown as CheckoutSessionGateway & { calls: any[] };
    return gateway;
}

const baseInput = () => ({
    tierId: 'digital' as const,
    email: 'buyer@example.com',
    fullName: 'Test Buyer',
    country: 'EG',
});

describe('createCheckoutSession — Phase 4 primary checkout', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_TEST_MERCHANT_ID = 'MID-TEST-EG';
        process.env.KASHIER_TEST_PAYMENT_API_KEY = 'test-api-key-123';
        process.env.KASHIER_TEST_SECRET_KEY = 'test-secret-key-456';
    });
    afterEach(() => { process.env = { ...originalEnv }; });

    function deps() {
        const supabase = createFakeSupabase();
        const gateway = createFakeGateway();
        return {
            supabase,
            gateway,
            options: { supabase, gatewayFactory: () => gateway, pricingRows: async () => [] as any[] },
        };
    }

    it('Protocol (digital) Egypt → 499 EGP, no shipping, no address required', async () => {
        const { supabase, gateway, options } = deps();
        const res = await createCheckoutSession({ ...baseInput(), tierId: 'digital', idempotencyKey: 'k-proto' }, options);

        expect(res.amount).toBe(499);
        expect(res.currency).toBe('EGP');
        expect(res.region).toBe('EGYPT');
        expect(res.environment).toBe('test');
        expect(supabase._db.invoices[0].shipping_cost).toBe(0);
        expect(gateway.calls[0].amount).toBe(499);
    });

    it('Tactical (bundle) Egypt physical → 749 product + 239 order-level shipping', async () => {
        const { supabase, options } = deps();
        const res = await createCheckoutSession({
            ...baseInput(),
            tierId: 'bundle',
            idempotencyKey: 'k-tac',
            shippingAddress: { address: '1 Street', city: 'Cairo' },
        }, options);

        expect(res.amount).toBe(749 + 239);
        expect(supabase._db.invoices[0].shipping_cost).toBe(239);
        expect(res.amount - supabase._db.invoices[0].shipping_cost).toBe(749);
    });

    it('Smart Pro base Egypt physical → 849 product + 239 shipping', async () => {
        const { supabase, options } = deps();
        const res = await createCheckoutSession({
            ...baseInput(),
            tierId: 'coaching',
            idempotencyKey: 'k-smart',
            shippingAddress: { address: '1 Street', city: 'Cairo' },
        }, options);

        expect(supabase._db.invoices[0].amount - 239).toBe(849);
        expect(res.amount).toBe(849 + 239);
    });

    it('Smart Pro + Coaching add-on Egypt → 10,848 (base 849 + add-on 9,999) + 239 shipping', async () => {
        const { supabase, options } = deps();
        const res = await createCheckoutSession({
            ...baseInput(),
            tierId: 'coaching_plus',
            idempotencyKey: 'k-smart-plus',
            shippingAddress: { address: '1 Street', city: 'Cairo' },
        }, options);

        const shipping = supabase._db.invoices[0].shipping_cost;
        expect(res.amount - shipping).toBe(10_848);
        expect(shipping).toBe(239);
    });

    it('Global order → USD pricing, card-only methods, no Egypt shipping', async () => {
        const { gateway, options } = deps();
        const res = await createCheckoutSession({
            ...baseInput(),
            tierId: 'digital',
            country: 'US',
            idempotencyKey: 'k-global',
        }, options);

        expect(res.region).toBe('GLOBAL');
        expect(res.currency).toBe('USD');
        expect(res.amount).toBe(49.99);
        expect(res.paymentMethods).toEqual(['card']);
        expect(gateway.calls[0].paymentMethods).toEqual(['card']);
    });

    it('Egypt methods are card,wallet and the region webhook is used as serverWebhook', async () => {
        const { gateway, options } = deps();
        const res = await createCheckoutSession({ ...baseInput(), tierId: 'digital', idempotencyKey: 'k-methods' }, options);

        expect(res.paymentMethods).toEqual(['card', 'wallet']);
        expect(gateway.calls[0].paymentMethods).toEqual(['card', 'wallet']);
        expect(gateway.calls[0].defaultMethod).toBe('card');
        expect(gateway.calls[0].serverWebhook).toContain('/api/payments/webhook');
    });

    it('Egypt physical without shipping details is rejected', async () => {
        const { options } = deps();
        await expect(createCheckoutSession({
            ...baseInput(),
            tierId: 'bundle',
            idempotencyKey: 'k-noaddr',
        }, options)).rejects.toThrow(CheckoutValidationError);
    });

    it('server-side price is authoritative — client amount is never sent to the session builder', async () => {
        const { gateway, options } = deps();
        // Even if a client passes a bogus shippingCost hint, the configured value wins.
        await createCheckoutSession({
            ...baseInput(),
            tierId: 'bundle',
            idempotencyKey: 'k-authoritative',
            shippingCost: 1,
            shippingAddress: { address: '1 Street', city: 'Cairo' },
        }, options);
        expect(gateway.calls[0].amount).toBe(749 + 239);
    });

    it('links the session to invoice + payment_intent (v5.1 §36)', async () => {
        const { supabase, gateway, options } = deps();
        const res = await createCheckoutSession({ ...baseInput(), tierId: 'digital', idempotencyKey: 'k-link' }, options);

        const invoice = supabase._db.invoices[0];
        const intent = supabase._db.payment_intents[0];

        expect(res.invoiceId).toBe(invoice.id);
        expect(res.orderRef).toBe(invoice.id);
        expect(invoice.kashier_session_id).toBe('sess-1');
        expect(invoice.kashier_session_url).toBe('https://test-api.kashier.io/s/1');
        expect(invoice.kashier_order_id).toBe(invoice.id);
        expect(invoice.payment_provider_merchant).toBe('kashier_egypt');
        expect(invoice.region).toBe('egypt');

        expect(intent.invoice_id).toBe(invoice.id);
        expect(intent.merchant_reference).toBe(invoice.id);
        expect(intent.provider_order_id).toBe('sess-1');
        expect(intent.is_current).toBe(true);
        expect(intent.attempt_number).toBe(1);
        expect(intent.environment).toBe('test');
        expect(intent.amount_minor).toBe(49900);
        expect(gateway.calls).toHaveLength(1);
    });

    it('idempotency (§12/C5): a repeated request returns the prior session, no duplicate Invoice/PaymentIntent', async () => {
        const { supabase, gateway, options } = deps();
        const first = await createCheckoutSession({ ...baseInput(), tierId: 'digital', idempotencyKey: 'dup-key' }, options);
        const second = await createCheckoutSession({ ...baseInput(), tierId: 'digital', idempotencyKey: 'dup-key' }, options);

        expect(first.idempotent).toBe(false);
        expect(second.idempotent).toBe(true);
        expect(second.sessionId).toBe(first.sessionId);
        expect(second.sessionUrl).toBe(first.sessionUrl);
        expect(supabase._db.invoices).toHaveLength(1);
        expect(supabase._db.payment_intents).toHaveLength(1);
        expect(gateway.calls).toHaveLength(1);
    });

    it('creating a session never confirms payment (redirect is advisory only)', async () => {
        const { supabase, options } = deps();
        await createCheckoutSession({ ...baseInput(), tierId: 'digital', idempotencyKey: 'k-pending' }, options);

        const invoice = supabase._db.invoices[0];
        expect(invoice.status).toBe('pending');
        expect(invoice.payment_status).toBe('pending');
        expect(invoice.paid_at).toBeUndefined();
    });

    it('a failed session mint propagates and leaves the invoice unconfirmed without a session URL', async () => {
        const supabase = createFakeSupabase();
        const failingGateway = {
            getGatewayName: () => 'KASHIER_EGYPT',
            createInvoice: async () => { throw new Error('n/a'); },
            verifyWebhook: async () => ({ valid: true }),
            createPaymentSession: async () => { throw new Error('Kashier 500'); },
        } as unknown as CheckoutSessionGateway;

        await expect(createCheckoutSession(
            { ...baseInput(), tierId: 'digital', idempotencyKey: 'k-fail' },
            { supabase, gatewayFactory: () => failingGateway, pricingRows: async () => [] },
        )).rejects.toThrow('Kashier 500');

        expect(supabase._db.invoices).toHaveLength(1);
        expect(supabase._db.invoices[0].kashier_session_url).toBeUndefined();
        expect(supabase._db.invoices[0].status).toBe('pending');
    });
});
