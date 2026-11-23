import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

/**
 * Dedicated webhook routes:
 *   /api/webhooks/stripe
 *   /api/webhooks/paymob
 *   /api/webhooks/spaceremit
 *
 * Each endpoint is pinned to ONE provider: a payload signed for a different
 * provider (or an unsigned request) is rejected, and the generic callback no
 * longer falls back to SpaceRemit for unknown requests.
 */

const h = vi.hoisted(() => ({
    applyProviderVerdict: vi.fn(),
    client: null as unknown,
}));

vi.mock('@supabase/supabase-js', () => ({ createClient: () => h.client }));
vi.mock('../../server/payments/fulfillmentService', () => ({
    applyProviderVerdict: (...args: unknown[]) => h.applyProviderVerdict(...args),
}));

function makeWebhookDb() {
    const tables: Record<string, Array<Record<string, unknown>>> = {
        webhook_events: [],
        payment_intents: [],
        invoices: [],
    };

    const make = (table: string) => {
        const q: Record<string, any> = {
            insert: (row: Record<string, unknown>) => {
                (tables[table] ||= []).push(row);
                return Promise.resolve({ data: row, error: null });
            },
            update: () => {
                const b: Record<string, any> = {
                    eq: () => b,
                    then: (resolve: (v: unknown) => unknown) =>
                        Promise.resolve({ data: null, error: null }).then(resolve),
                };
                return b;
            },
            select: () => q,
            eq: () => q,
            in: () => q,
            order: () => q,
            limit: () => q,
            maybeSingle: async () => ({ data: null, error: null }),
            single: async () => ({ data: null, error: null }),
        };
        return q;
    };

    return { client: { from: (table: string) => make(table) }, tables };
}

const originalEnv = { ...process.env };

beforeEach(() => {
    vi.resetModules();
    h.applyProviderVerdict.mockReset();
    h.applyProviderVerdict.mockResolvedValue({ code: 'unresolved' });

    process.env = {
        ...originalEnv,
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'service-role-test',
        STRIPE_SECRET_KEY: 'sk_test_phase_b',
        STRIPE_WEBHOOK_SECRET: 'whsec_phase_b',
        PAYMOB_HMAC_SECRET: 'paymob_hmac_phase_b',
        SPACEREMIT_WEBHOOK_SECRET: 'spaceremit_phase_b',
        SPACEREMIT_SECRET_KEY: 'spaceremit_secret_phase_b',
    };

    h.client = makeWebhookDb().client;
});

afterEach(() => {
    process.env = { ...originalEnv };
});

// ─────────────────────────────────────────────────────────────────────────────
//  STRIPE
// ─────────────────────────────────────────────────────────────────────────────
function stripeSignature(payload: string, secret = 'whsec_phase_b'): string {
    const t = Math.floor(Date.now() / 1000);
    const v1 = crypto.createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex');
    return `t=${t},v1=${v1}`;
}

function stripeEvent(): string {
    return JSON.stringify({
        id: 'evt_phaseb_stripe_1',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
            object: {
                id: 'pi_phaseb_1',
                object: 'payment_intent',
                amount_received: 4990,
                currency: 'usd',
                metadata: { invoice_id: 'inv-stripe-phaseb' },
            },
        },
    });
}

describe('/api/webhooks/stripe', () => {
    it('verifies a genuine Stripe signature and routes to the Stripe gateway', async () => {
        const { POST } = await import('../../app/api/webhooks/stripe/route');
        const body = stripeEvent();
        const res = await POST(new Request('http://localhost/api/webhooks/stripe', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'stripe-signature': stripeSignature(body) },
            body,
        }));

        expect(res.status).toBe(200);
        expect(h.applyProviderVerdict).toHaveBeenCalledTimes(1);
        expect(h.applyProviderVerdict.mock.calls[0][0]).toMatchObject({ gatewayName: 'STRIPE' });
    });

    it('rejects a request with no Stripe signature (no provider fallback)', async () => {
        const { POST } = await import('../../app/api/webhooks/stripe/route');
        const res = await POST(new Request('http://localhost/api/webhooks/stripe', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: stripeEvent(),
        }));

        expect(res.status).toBe(401);
        expect(h.applyProviderVerdict).not.toHaveBeenCalled();
    });

    it('rejects a payload signed for a different provider on the Stripe route', async () => {
        const { POST } = await import('../../app/api/webhooks/stripe/route');
        const res = await POST(new Request('http://localhost/api/webhooks/stripe', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-kashier-signature': 'kashier-style' },
            body: JSON.stringify({ orderId: 'inv-x', orderStatus: 'SUCCESS' }),
        }));

        expect(res.status).toBe(401);
        expect(h.applyProviderVerdict).not.toHaveBeenCalled();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  PAYMOB
// ─────────────────────────────────────────────────────────────────────────────
const PAYMOB_HMAC_SECRET = 'paymob_hmac_phase_b';

function paymobObj(): Record<string, unknown> {
    return {
        amount_cents: 49900,
        created_at: '2026-11-23T00:00:00.000000',
        currency: 'EGP',
        error_occured: false,
        has_parent_transaction: false,
        id: 990001,
        integration_id: 5573815,
        is_3d_secure: true,
        is_auth: false,
        is_capture: true,
        is_refunded: false,
        is_standalone_payment: true,
        is_voided: false,
        order: { id: 700001, merchant_order_id: 'inv-paymob-phaseb' },
        owner: 42,
        pending: false,
        source_data: { pan: '411111', sub_type: 'card', type: 'card' },
        success: true,
    };
}

function paymobHmac(obj: Record<string, unknown>): string {
    const fields = [
        obj.amount_cents,
        obj.created_at,
        obj.currency,
        obj.error_occured,
        obj.has_parent_transaction,
        obj.id,
        obj.integration_id || '',
        obj.is_3d_secure,
        obj.is_auth,
        obj.is_capture,
        obj.is_refunded,
        obj.is_standalone_payment,
        obj.is_voided,
        obj.order_id || (obj.order as Record<string, unknown>)?.id,
        obj.owner,
        obj.pending || false,
        (obj.source_data as Record<string, unknown>)?.pan,
        (obj.source_data as Record<string, unknown>)?.sub_type,
        (obj.source_data as Record<string, unknown>)?.type,
        obj.success,
    ];
    return crypto
        .createHmac('sha512', PAYMOB_HMAC_SECRET)
        .update(fields.map((value) => String(value ?? '')).join(''))
        .digest('hex');
}

describe('/api/webhooks/paymob', () => {
    it('verifies a genuine Paymob HMAC and routes to the Paymob gateway', async () => {
        const { POST } = await import('../../app/api/webhooks/paymob/route');
        const obj = paymobObj();
        const hmac = paymobHmac(obj);
        const body = JSON.stringify({ obj });

        const res = await POST(new Request(`http://localhost/api/webhooks/paymob?hmac=${hmac}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body,
        }));

        expect(res.status).toBe(200);
        expect(h.applyProviderVerdict).toHaveBeenCalledTimes(1);
        expect(h.applyProviderVerdict.mock.calls[0][0]).toMatchObject({ gatewayName: 'PAYMOB' });
    });

    it('rejects an invalid Paymob HMAC', async () => {
        const { POST } = await import('../../app/api/webhooks/paymob/route');
        const body = JSON.stringify({ obj: paymobObj() });

        const res = await POST(new Request('http://localhost/api/webhooks/paymob?hmac=deadbeef', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body,
        }));

        expect(res.status).toBe(401);
        expect(h.applyProviderVerdict).not.toHaveBeenCalled();
    });

    it('rejects a Paymob-shaped request with no HMAC', async () => {
        const { POST } = await import('../../app/api/webhooks/paymob/route');
        const body = JSON.stringify({ obj: paymobObj() });

        const res = await POST(new Request('http://localhost/api/webhooks/paymob', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body,
        }));

        expect(res.status).toBe(401);
    });

    it('a Paymob-hmac request is rejected on the Stripe route (pinned endpoints)', async () => {
        const { POST } = await import('../../app/api/webhooks/stripe/route');
        const obj = paymobObj();
        const body = JSON.stringify({ obj });

        const res = await POST(new Request(`http://localhost/api/webhooks/stripe?hmac=${paymobHmac(obj)}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body,
        }));

        expect(res.status).toBe(401);
        expect(h.applyProviderVerdict).not.toHaveBeenCalled();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  SPACEREMIT
// ─────────────────────────────────────────────────────────────────────────────
const SPACEREMIT_SECRET = 'spaceremit_phase_b';

function spaceremitBody(): string {
    return JSON.stringify({
        event: 'payment.success',
        data: {
            reference_id: 'inv-spaceremit-phaseb',
            transaction_id: 'tx-sr-phaseb-1',
            amount: 499,
        },
    });
}

function spaceremitSignature(rawBody: string): string {
    return crypto.createHmac('sha256', SPACEREMIT_SECRET).update(rawBody).digest('hex');
}

describe('/api/webhooks/spaceremit', () => {
    it('verifies a genuine SpaceRemit signature and routes to the SpaceRemit gateway', async () => {
        const { POST } = await import('../../app/api/webhooks/spaceremit/route');
        const body = spaceremitBody();

        const res = await POST(new Request('http://localhost/api/webhooks/spaceremit', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-spaceremit-signature': spaceremitSignature(body),
            },
            body,
        }));

        expect(res.status).toBe(200);
        expect(h.applyProviderVerdict).toHaveBeenCalledTimes(1);
        expect(h.applyProviderVerdict.mock.calls[0][0]).toMatchObject({ gatewayName: 'SPACEREMIT' });
    });

    it('rejects an invalid SpaceRemit signature', async () => {
        const { POST } = await import('../../app/api/webhooks/spaceremit/route');
        const body = spaceremitBody();

        const res = await POST(new Request('http://localhost/api/webhooks/spaceremit', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-spaceremit-signature': 'deadbeef' },
            body,
        }));

        expect(res.status).toBe(401);
        expect(h.applyProviderVerdict).not.toHaveBeenCalled();
    });

    it('rejects an unsigned SpaceRemit request (no fallback inside the pinned route)', async () => {
        const { POST } = await import('../../app/api/webhooks/spaceremit/route');
        const res = await POST(new Request('http://localhost/api/webhooks/spaceremit', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: spaceremitBody(),
        }));

        expect(res.status).toBe(401);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GENERIC CALLBACK — no silent SpaceRemit fallback
// ─────────────────────────────────────────────────────────────────────────────
describe('/api/payments/callback — unknown provider', () => {
    it('rejects a request with no gateway signal instead of falling back to SpaceRemit', async () => {
        const { POST } = await import('../../app/api/payments/callback/route');
        const res = await POST(new Request('http://localhost/api/payments/callback', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ event: 'payment.success', data: { reference_id: 'inv-x' } }),
        }));

        expect(res.status).toBe(401);
        const body = await res.json();
        expect(body.error).toBe('Unknown webhook provider');
        expect(h.applyProviderVerdict).not.toHaveBeenCalled();
    });

    it('still detects a signature-bearing provider', async () => {
        const { POST } = await import('../../app/api/payments/callback/route');
        const body = spaceremitBody();

        const res = await POST(new Request('http://localhost/api/payments/callback', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-spaceremit-signature': spaceremitSignature(body),
            },
            body,
        }));

        expect(res.status).toBe(200);
        expect(h.applyProviderVerdict).toHaveBeenCalledTimes(1);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  FACTORY DETECTION
// ─────────────────────────────────────────────────────────────────────────────
describe('PaymentFactory.detectGatewayFromRequest', () => {
    it('returns null when there is no authenticated provider signal', async () => {
        const { PaymentFactory } = await import('../../server/payments/gateways/PaymentFactory');
        expect(PaymentFactory.detectGatewayFromRequest({ headers: {}, query: {} })).toBeNull();
    });

    it('detects Paymob from the hmac query parameter', async () => {
        const { PaymentFactory } = await import('../../server/payments/gateways/PaymentFactory');
        const gateway = PaymentFactory.detectGatewayFromRequest({ headers: {}, query: { hmac: 'x' } });
        expect(gateway?.getGatewayName()).toBe('PAYMOB');
    });

    it('detects SpaceRemit only from its own dedicated signals', async () => {
        const { PaymentFactory } = await import('../../server/payments/gateways/PaymentFactory');
        const gateway = PaymentFactory.detectGatewayFromRequest({
            headers: { 'x-spaceremit-signature': 'sig' },
            query: {},
        });
        expect(gateway?.getGatewayName()).toBe('SPACEREMIT');
    });
});
