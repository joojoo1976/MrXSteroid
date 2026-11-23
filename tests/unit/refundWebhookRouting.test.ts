import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

/**
 * Wiring tests: a signed refund-like webhook must be recorded in the refund
 * domain and must NEVER reach the payment settlement pipeline.
 */

const h = vi.hoisted(() => ({
    client: null as unknown,
}));

vi.mock('@supabase/supabase-js', () => ({ createClient: () => h.client }));

type Row = Record<string, unknown>;

function fakeDb(seed: Record<string, Row[]> = {}) {
    const tables: Record<string, Row[]> = {
        webhook_events: [],
        invoices: [],
        payment_intents: [],
        refunds: [],
        entitlements: [],
        profiles: [],
        ...seed,
    };
    let seq = 0;

    const make = (table: string) => {
        const q: any = {
            action: 'select',
            payload: null as Row | null,
            filters: [] as Array<[string, unknown]>,
            limitN: null as number | null,
            select() { return q; },
            insert(payload: Row) { q.action = 'insert'; q.payload = payload; return q; },
            update(payload: Row) { q.action = 'update'; q.payload = payload; return q; },
            upsert(payload: Row) { q.action = 'insert'; q.payload = payload; return q; },
            eq(column: string, value: unknown) { q.filters.push([column, value]); return q; },
            in(column: string, values: unknown[]) {
                q.filters.push([`__in:${column}`, values]);
                return q;
            },
            order() { return q; },
            limit(n: number) { q.limitN = n; return q; },
            maybeSingle() { return q.exec('one'); },
            single() { return q.exec('one'); },
            then(resolve: (v: unknown) => unknown, reject?: (r: unknown) => unknown) {
                return q.exec('many').then(resolve, reject);
            },
            async exec(mode: 'one' | 'many') {
                const rows = tables[table] || (tables[table] = []);
                const matches = rows.filter((row) =>
                    q.filters.every(([column, value]: [string, unknown]) => {
                        if (column.startsWith('__in:')) {
                            const real = column.slice(5);
                            return (value as unknown[]).includes(row[real]);
                        }
                        return row[column] === value;
                    })
                );
                if (q.action === 'insert') {
                    if (table === 'webhook_events') {
                        const duplicate = rows.some(
                            (row) =>
                                row.provider === q.payload?.provider &&
                                row.provider_event_id === q.payload?.provider_event_id
                        );
                        if (duplicate) {
                            return { data: null, error: { code: '23505', message: 'duplicate key value' } };
                        }
                    }
                    const inserted = { id: `${table}-${++seq}`, ...q.payload };
                    rows.push(inserted);
                    return { data: inserted, error: null };
                }
                if (q.action === 'update') {
                    for (const row of matches) Object.assign(row, q.payload);
                    return { data: matches, error: null };
                }
                const limited = q.limitN ? matches.slice(0, q.limitN) : matches;
                return { data: mode === 'one' ? (limited[0] ?? null) : limited, error: null };
            },
        };
        return q;
    };

    return { client: { from: (table: string) => make(table) }, tables };
}

const originalEnv = { ...process.env };

beforeEach(() => {
    process.env = {
        ...originalEnv,
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'service-role-test',
        KASHIER_MODE: 'test',
        KASHIER_TEST_MERCHANT_ID: 'MID-TEST-EG',
        KASHIER_TEST_PAYMENT_API_KEY: 'test-api-key-123',
        KASHIER_TEST_SECRET_KEY: 'test-secret-key-456',
        STRIPE_SECRET_KEY: 'sk_test_refund_routing',
        STRIPE_WEBHOOK_SECRET: 'whsec_refund_routing',
    };
});

afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
});

function kashierRefundPayload(overrides: Record<string, string> = {}): string {
    const base: Record<string, string> = {
        orderId: 'inv-k-1',
        merchantId: 'MID-TEST-EG',
        amount: '499.00',
        currency: 'EGP',
        orderStatus: 'REFUNDED',
        reconcilation: 'OK',
        transactionId: 'tx-k-1',
        ...overrides,
    };
    const keys = Object.keys(base).sort();
    const signatureInput = keys.map((key) => `${key}=${base[key]}`).join('&');
    return JSON.stringify({
        ...base,
        signatureKeys: keys.join(','),
        signature: crypto.createHmac('sha256', 'test-api-key-123').update(signatureInput).digest('hex'),
    });
}

const seedKashier = (): Record<string, Row[]> => ({
    invoices: [{ id: 'inv-k-1', amount: 499, currency: 'EGP', user_id: 'user-k', payment_status: 'paid', status: 'success' }],
    payment_intents: [{ id: 'pi-k-1', invoice_id: 'inv-k-1', provider: 'kashier', provider_order_id: 'tx-k-1', attempt_number: 1 }],
    entitlements: [{ id: 'ent-k-1', user_id: 'user-k', product_id: 'digital', invoice_id: 'inv-k-1', status: 'granted' }],
    profiles: [{ id: 'user-k', has_paid: true }],
});

describe('Kashier webhook route — refund interception', () => {
    it('records a REFUNDED event and does not settle it as a payment', async () => {
        const db = fakeDb(seedKashier());
        h.client = db.client;

        const { POST } = await import('../../app/api/webhooks/kashier/route');
        const req = new Request('http://localhost/api/webhooks/kashier', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-kashier-signature': 'present' },
            body: kashierRefundPayload(),
        });

        const res = await POST(req as unknown as Request);
        const body = await res.json() as Record<string, unknown>;

        expect(res.status).toBe(200);
        expect(body.message).toBe('Refund event recorded');
        expect(body.code).toBe('recorded');
        expect(db.tables.refunds).toHaveLength(1);
        expect(db.tables.refunds[0]).toMatchObject({ invoice_id: 'inv-k-1', status: 'completed', kashier_refund_id: 'tx-k-1' });
        expect(db.tables.entitlements[0].status).toBe('revoked');
        expect(db.tables.profiles[0].has_paid).toBe(false);
        // The payment pipeline would have written invoices/ledger mutations.
        expect(db.tables.invoices[0].payment_status).toBe('paid');
    });

    it('acknowledges a duplicate REFUNDED event without a second refund row', async () => {
        const db = fakeDb(seedKashier());
        h.client = db.client;

        const { POST } = await import('../../app/api/webhooks/kashier/route');
        const send = () => POST(new Request('http://localhost/api/webhooks/kashier', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-kashier-signature': 'present' },
            body: kashierRefundPayload(),
        }) as unknown as Request);

        await send();
        const res = await send();
        const body = await res.json() as Record<string, unknown>;

        expect(res.status).toBe(200);
        expect(body.message).toBe('Duplicate refund event');
        expect(db.tables.refunds).toHaveLength(1);
    });

    it('rejects an unauthentic refund payload before any write', async () => {
        const db = fakeDb(seedKashier());
        h.client = db.client;

        const { POST } = await import('../../app/api/webhooks/kashier/route');
        const res = await POST(new Request('http://localhost/api/webhooks/kashier', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ orderId: 'inv-k-1', orderStatus: 'REFUNDED', signature: 'nope', signatureKeys: 'orderId' }),
        }) as unknown as Request);

        expect(res.status).toBe(401);
        expect(db.tables.refunds).toHaveLength(0);
        expect(db.tables.webhook_events).toHaveLength(0);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  STRIPE via the generic multi-gateway callback
// ─────────────────────────────────────────────────────────────────────────────
function stripeHeader(payload: string, secret = 'whsec_refund_routing'): string {
    const t = Math.floor(Date.now() / 1000);
    const v1 = crypto.createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex');
    return `t=${t},v1=${v1}`;
}

function stripeRefundBody(invoiceId: string | null): string {
    return JSON.stringify({
        id: 'evt_stripe_refund_1',
        object: 'event',
        type: 'charge.refunded',
        data: {
            object: {
                id: 'ch_1',
                object: 'charge',
                payment_intent: 'pi_1',
                amount_refunded: 4990,
                currency: 'usd',
                metadata: invoiceId ? { invoice_id: invoiceId } : {},
            },
        },
    });
}

async function sendStripeCallback(body: string) {
    const { POST } = await import('../../app/api/payments/callback/route');
    return POST(new Request('http://localhost/api/payments/callback', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'stripe-signature': stripeHeader(body),
        },
        body,
    }));
}

describe('Generic callback — Stripe refund / dispute interception', () => {
    it('records a charge.refunded event through the shared callback', async () => {
        const db = fakeDb({
            invoices: [{ id: 'inv-s-1', amount: 49.9, currency: 'USD', user_id: 'user-s', payment_status: 'paid', status: 'success' }],
            payment_intents: [{ id: 'pi-s-1', invoice_id: 'inv-s-1', provider: 'stripe', provider_order_id: 'pi_1', attempt_number: 1 }],
            entitlements: [{ id: 'ent-s-1', user_id: 'user-s', product_id: 'digital', invoice_id: 'inv-s-1', status: 'granted' }],
            profiles: [{ id: 'user-s', has_paid: true }],
        });
        h.client = db.client;

        const res = await sendStripeCallback(stripeRefundBody('inv-s-1'));
        const body = await res.json() as Record<string, unknown>;

        expect(res.status).toBe(200);
        expect(body.code).toBe('recorded');
        expect(db.tables.refunds[0]).toMatchObject({
            invoice_id: 'inv-s-1',
            status: 'completed',
            amount_minor: 4990,
            currency: 'USD',
        });
        expect(db.tables.profiles[0].has_paid).toBe(false);
    });

    it('acknowledges a refund whose invoice has no payment intent (unlinked)', async () => {
        const db = fakeDb({
            invoices: [{ id: 'inv-s-2', amount: 49.9, currency: 'USD', user_id: 'user-s', payment_status: 'paid', status: 'success' }],
            payment_intents: [],
        });
        h.client = db.client;

        const res = await sendStripeCallback(stripeRefundBody('inv-s-2'));
        const body = await res.json() as Record<string, unknown>;

        expect(res.status).toBe(200);
        expect(body.code).toBe('unlinked');
        expect(db.tables.refunds).toHaveLength(0);
        expect(db.tables.webhook_events[0]).toMatchObject({
            status: 'skipped',
            processing_status: 'refund_unlinked',
        });
    });

    it('rejects a callback with an invalid Stripe signature', async () => {
        const db = fakeDb({});
        h.client = db.client;

        const { POST } = await import('../../app/api/payments/callback/route');
        const body = stripeRefundBody('inv-s-1');
        const res = await POST(new Request('http://localhost/api/payments/callback', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'stripe-signature': 't=1,v1=deadbeef' },
            body,
        }));

        expect(res.status).toBe(401);
        expect(db.tables.refunds).toHaveLength(0);
    });
});
