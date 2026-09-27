/**
 * tests/unit/combinedCheckoutSession.test.ts
 *
 * Service-level proof that ONE combined purchase produces exactly ONE invoice,
 * ONE order, ONE payment intent and ONE Kashier session — never one charge per
 * line — while the total stays server-authoritative.
 *
 * Canonical EGP prices: digital 499 · bundle 749 · coaching 849 · shipping 199 ·
 * coaching add-on 9,999.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    createCombinedCheckoutSession,
    type CombinedCheckoutDeps,
    type CombinedCheckoutGateway,
} from '../../server/payments/checkout/combinedCheckoutSessionService';
import { CheckoutValidationError, CheckoutConflictError } from '../../server/payments/checkout/checkoutSessionService';

type Row = Record<string, any>;

function createFakeSupabase(seed: { invoices?: Row[]; existingSession?: boolean } = {}) {
    const db: Record<string, Row[]> = {
        invoices: seed.invoices ? [...seed.invoices] : [],
        payment_intents: [],
        orders: [],
        admin_settings: [],
    };
    let idCounter = 0;
    const nextId = (t: string) => `${t}-${String(++idCounter).padStart(4, '0')}`;

    function from(table: string) {
        const state = {
            mode: 'select' as 'select' | 'insert' | 'update' | 'delete',
            payload: null as Row | null,
            filters: {} as Record<string, any>,
            orderCol: null as string | null,
            ascending: true,
        };

        const exec = async () => {
            const rows = db[table] || (db[table] = []);
            if (state.mode === 'delete') {
                const idx = rows.findIndex(r => Object.entries(state.filters).every(([k, v]) => r[k] === v));
                if (idx >= 0) rows.splice(idx, 1);
                return { data: null, error: null };
            }
            if (state.mode === 'insert') {
                const row: Row = { id: nextId(table), metadata: {}, ...state.payload };
                if (table === 'invoices' && seed.invoices && !seed.existingSession) {
                    // simulate the unique-index race on idempotency_key
                    if (db.invoices.some(r => r.idempotency_key === row.idempotency_key)) {
                        return { data: null, error: { code: '23505', message: 'duplicate key value' } };
                    }
                }
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
                const col = state.orderCol;
                const dir = state.ascending ? 1 : -1;
                result.sort((a, b) => ((a[col] > b[col] ? 1 : -1) * dir));
            }
            return { data: result, error: null };
        };

        const builder: any = {
            select() { return builder; },
            insert(payload: Row) { state.mode = 'insert'; state.payload = payload; return builder; },
            update(payload: Row) { state.mode = 'update'; state.payload = payload; return builder; },
            delete() { state.mode = 'delete'; return builder; },
            eq(col: string, val: any) { state.filters[col] = val; return builder; },
            order(col: string, opts?: { ascending?: boolean }) {
                state.orderCol = col;
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

function createFakeGateway() {
    const calls: any[] = [];
    const gateway = {
        calls,
        getGatewayName: () => 'KASHIER_EGYPT',
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
    } as unknown as CombinedCheckoutGateway & { calls: any[] };
    return gateway;
}

const DIGITAL = 499;
const BUNDLE = 749;
const COACHING = 849;
const SHIPPING = 199;
const ADDON = 9999;

const baseInput = () => ({
    email: 'buyer@example.com',
    fullName: 'Test Buyer',
    country: 'EG',
});

describe('createCombinedCheckoutSession — one artifact per combined purchase', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_TEST_MERCHANT_ID = 'MID-TEST-EG';
        process.env.KASHIER_TEST_PAYMENT_API_KEY = 'test-api-key-123';
        process.env.KASHIER_TEST_SECRET_KEY = 'test-secret-key-456';
    });
    afterEach(() => { process.env = { ...originalEnv }; });

    function deps(): { supabase: any; gateway: any; options: CombinedCheckoutDeps } {
        const supabase = createFakeSupabase();
        const gateway = createFakeGateway();
        return {
            supabase,
            gateway,
            options: { supabase, gatewayFactory: () => gateway, pricingRows: async () => [] as any[] },
        };
    }

    const physical = { address: '1 Street', city: 'Cairo' };

    it('product + add-on + shipping → ONE invoice, ONE order, ONE intent, ONE session', async () => {
        const { supabase, gateway, options } = deps();

        const res = await createCombinedCheckoutSession({
            ...baseInput(),
            lines: [
                { kind: 'product', tierId: 'bundle' },
                { kind: 'addon', tierId: 'bundle_plus' },
            ],
            shippingAddress: physical,
            idempotencyKey: 'k-combined-1',
        }, options);

        const expectedTotal = BUNDLE + ADDON + SHIPPING;
        expect(res.amount).toBe(expectedTotal);
        expect(res.subtotal).toBe(BUNDLE + ADDON);
        expect(res.shippingCost).toBe(SHIPPING);
        expect(res.discount).toBe(0);

        // Exactly one of everything.
        expect(supabase._db.invoices).toHaveLength(1);
        expect(supabase._db.orders).toHaveLength(1);
        expect(supabase._db.payment_intents).toHaveLength(1);
        expect(gateway.calls).toHaveLength(1);

        // The single session carries the single combined total — not a per-line charge.
        expect(gateway.calls[0].amount).toBe(expectedTotal);
        expect(res.sessionId).toBe('sess-1');
    });

    it('multiple products → ONE session charged the summed total', async () => {
        const { supabase, gateway, options } = deps();

        const res = await createCombinedCheckoutSession({
            ...baseInput(),
            lines: [
                { kind: 'product', tierId: 'digital' },
                { kind: 'product', tierId: 'bundle' },
            ],
            shippingAddress: physical,
            idempotencyKey: 'k-combined-2',
        }, options);

        expect(res.amount).toBe(DIGITAL + BUNDLE + SHIPPING);
        expect(gateway.calls).toHaveLength(1);
        expect(gateway.calls[0].amount).toBe(DIGITAL + BUNDLE + SHIPPING);
        expect(supabase._db.invoices).toHaveLength(1);
    });

    it('persists the line breakdown on both the invoice metadata and orders.items', async () => {
        const { supabase, options } = deps();

        await createCombinedCheckoutSession({
            ...baseInput(),
            lines: [
                { kind: 'product', tierId: 'bundle' },
                { kind: 'addon', tierId: 'bundle_plus' },
            ],
            shippingAddress: physical,
            idempotencyKey: 'k-combined-3',
        }, options);

        const invoice = supabase._db.invoices[0];
        const order = supabase._db.orders[0];

        expect(invoice.metadata.order_kind).toBe('combined');
        expect(invoice.metadata.lines).toHaveLength(2);
        expect(invoice.amount).toBe(BUNDLE + ADDON + SHIPPING);
        expect(invoice.shipping_cost).toBe(SHIPPING);
        expect(invoice.tier_id).toBe('bundle');

        expect(order.items).toHaveLength(2);
        expect(order.items.map((l: Row) => l.tierId)).toEqual(['bundle', 'bundle_plus']);
        expect(order.amount).toBe(BUNDLE + ADDON + SHIPPING);
        expect(order.invoice_id).toBe(invoice.id);
        expect(order.status).toBe('pending');
    });

    it('links the session to the invoice, the order and the intent', async () => {
        const { supabase, options } = deps();

        const res = await createCombinedCheckoutSession({
            ...baseInput(),
            lines: [{ kind: 'product', tierId: 'bundle' }],
            shippingAddress: physical,
            idempotencyKey: 'k-combined-4',
        }, options);

        const invoice = supabase._db.invoices[0];
        const order = supabase._db.orders[0];
        const intent = supabase._db.payment_intents[0];

        expect(invoice.kashier_session_id).toBe(res.sessionId);
        expect(order.external_order_id).toBe(res.sessionId);
        expect(intent.provider_order_id).toBe(res.sessionId);
        expect(intent.merchant_reference).toBe(res.invoiceId);
        expect(intent.amount_minor).toBe(Math.round(res.amount * 100));
    });

    it('digital-only combined order never pays shipping and needs no address', async () => {
        const { supabase, options } = deps();

        const res = await createCombinedCheckoutSession({
            ...baseInput(),
            lines: [
                { kind: 'product', tierId: 'digital' },
                { kind: 'addon', tierId: 'digital_plus' },
            ],
            idempotencyKey: 'k-combined-5',
        }, options);

        expect(res.shippingCost).toBe(0);
        expect(res.amount).toBe(DIGITAL + ADDON);
        expect(supabase._db.invoices[0].shipping_cost).toBe(0);
    });

    it('applies the promo discount once against the combined subtotal', async () => {
        const { supabase, gateway, options } = deps();

        const res = await createCombinedCheckoutSession({
            ...baseInput(),
            lines: [
                { kind: 'product', tierId: 'bundle' },
                { kind: 'product', tierId: 'coaching' },
            ],
            shippingAddress: physical,
            promoCode: 'STEROIDIQ',
            idempotencyKey: 'k-combined-6',
        }, options);

        expect(res.discount).toBe(1);
        expect(res.amount).toBe(BUNDLE + COACHING + SHIPPING - 1);
        expect(supabase._db.invoices[0].discount_amount).toBe(1);
        expect(gateway.calls[0].amount).toBe(res.amount);
    });
});

describe('createCombinedCheckoutSession — authority and safety', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_TEST_MERCHANT_ID = 'MID-TEST-EG';
        process.env.KASHIER_TEST_PAYMENT_API_KEY = 'test-api-key-123';
        process.env.KASHIER_TEST_SECRET_KEY = 'test-secret-key-456';
    });
    afterEach(() => { process.env = { ...originalEnv }; });

    function deps(): { supabase: any; gateway: any; options: CombinedCheckoutDeps } {
        const supabase = createFakeSupabase();
        const gateway = createFakeGateway();
        return {
            supabase,
            gateway,
            options: { supabase, gatewayFactory: () => gateway, pricingRows: async () => [] as any[] },
        };
    }

    it('rejects a tampered client total before anything is written', async () => {
        const { supabase, gateway, options } = deps();

        await expect(createCombinedCheckoutSession({
            ...baseInput(),
            lines: [
                { kind: 'product', tierId: 'bundle' },
                { kind: 'addon', tierId: 'bundle_plus' },
            ],
            shippingAddress: { address: '1 Street', city: 'Cairo' },
            clientReportedTotal: 1,
            idempotencyKey: 'k-tamper',
        }, options)).rejects.toThrow(CheckoutValidationError);

        expect(supabase._db.invoices).toHaveLength(0);
        expect(supabase._db.orders).toHaveLength(0);
        expect(gateway.calls).toHaveLength(0);
    });

    it('ignores a client claiming free shipping and still charges 199 EGP', async () => {
        const { gateway, options } = deps();

        const res = await createCombinedCheckoutSession({
            ...baseInput(),
            lines: [{ kind: 'product', tierId: 'bundle' }],
            shippingAddress: { address: '1 Street', city: 'Cairo' },
            shippingCost: 0,
            idempotencyKey: 'k-free-ship',
        }, options);

        expect(res.shippingCost).toBe(SHIPPING);
        expect(gateway.calls[0].amount).toBe(BUNDLE + SHIPPING);
    });

    it('rejects an empty cart', async () => {
        const { options } = deps();
        await expect(createCombinedCheckoutSession({
            ...baseInput(),
            lines: [],
            idempotencyKey: 'k-empty',
        }, options)).rejects.toThrow(CheckoutValidationError);
    });

    it('requires a valid email', async () => {
        const { options } = deps();
        await expect(createCombinedCheckoutSession({
            ...baseInput(),
            email: 'not-an-email',
            lines: [{ kind: 'product', tierId: 'pdf' }],
            idempotencyKey: 'k-bad-email',
        }, options)).rejects.toThrow(CheckoutValidationError);
    });

    it('requires a shipping address for an Egypt physical combined order', async () => {
        const { options } = deps();
        await expect(createCombinedCheckoutSession({
            ...baseInput(),
            lines: [{ kind: 'product', tierId: 'bundle' }],
            idempotencyKey: 'k-no-addr',
        }, options)).rejects.toThrow(/shipping address and city/);
    });

    it('is idempotent: a repeat submit returns the prior session and mints nothing new', async () => {
        const supabase = createFakeSupabase();
        const gateway = createFakeGateway();
        const options: CombinedCheckoutDeps = {
            supabase,
            gatewayFactory: () => gateway,
            pricingRows: async () => [] as any[],
        };
        const input = {
            ...baseInput(),
            lines: [
                { kind: 'product', tierId: 'bundle' },
                { kind: 'addon', tierId: 'bundle_plus' },
            ],
            shippingAddress: { address: '1 Street', city: 'Cairo' },
            idempotencyKey: 'k-idem',
        };

        const first = await createCombinedCheckoutSession(input, options);
        const second = await createCombinedCheckoutSession(input, options);

        expect(first.idempotent).toBe(false);
        expect(second.idempotent).toBe(true);
        expect(second.sessionId).toBe(first.sessionId);
        expect(second.amount).toBe(first.amount);
        // The replay must return the SAME identifiers, and `orderId` must be the
        // real `orders` row id — not the invoice id wearing the wrong name.
        expect(second.invoiceId).toBe(first.invoiceId);
        expect(second.orderId).toBe(first.orderId);
        expect(second.orderId).not.toBe(first.invoiceId);
        expect(supabase._db.orders[0].id).toBe(first.orderId);
        expect(supabase._db.orders[0].invoice_id).toBe(first.invoiceId);
        expect(supabase._db.invoices).toHaveLength(1);
        expect(supabase._db.orders).toHaveLength(1);
        expect(gateway.calls).toHaveLength(1);
    });

    it('refuses to mint a second session when an invoice exists without one', async () => {
        const supabase = createFakeSupabase({
            invoices: [{
                id: 'inv-existing',
                idempotency_key: 'k-conflict',
                amount: 748,
                currency: 'EGP',
                kashier_session_id: null,
                kashier_session_url: null,
            }],
        });
        const gateway = createFakeGateway();
        const options: CombinedCheckoutDeps = {
            supabase,
            gatewayFactory: () => gateway,
            pricingRows: async () => [] as any[],
        };

        await expect(createCombinedCheckoutSession({
            ...baseInput(),
            lines: [{ kind: 'product', tierId: 'bundle' }],
            shippingAddress: { address: '1 Street', city: 'Cairo' },
            idempotencyKey: 'k-conflict',
        }, options)).rejects.toThrow(CheckoutConflictError);

        expect(gateway.calls).toHaveLength(0);
    });
});
