/**
 * tests/integration/fourthwallWebhookRoute.test.ts
 *
 * Route-level tests for POST /api/webhooks/fourthwall against the OFFICIAL
 * Fourthwall contract (docs.fourthwall.com):
 *
 *   - Signature: HMAC-SHA256 over the ENTIRE raw body, base64, in the single
 *     `X-Fourthwall-Hmac-SHA256` header.
 *   - Envelope: { testMode, id (dedup key), webhookId, shopId, type, apiVersion,
 *     createdAt, data } where `data` is the OrderV1 order object.
 *   - Order statuses: CONFIRMED/SHIPPED/DELIVERED/COMPLETED → settled-success;
 *     CANCELLED → refund/cancel; everything else → fail closed.
 *   - Idempotency: deduplicate by webhook event `id`; a replay must not
 *     double-fulfill.
 *
 * The route's own signature check runs against the REAL FourthwallGateway
 * (deterministic HMAC fixtures). `applyProviderVerdict` is mocked so this suite
 * stays focused on the route's signature/dedup/status/correlation logic, with a
 * stateful Supabase fake to model event-id deduplication.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { NextRequest } from 'next/server';

const WEBHOOK_SECRET = 'whsec_test_route_123';
const SHOP_ID = 'sh_7ad0c438-beda-4779-a885-0dc325a755c1';

// ── Official signature: base64(HMAC-SHA256(secret, rawBody)) ────────────────
function signWebhook(rawBody: string, secret = WEBHOOK_SECRET): string {
    return crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
}

/** Deterministic OrderV1 webhook envelope. */
function makeEnvelope(overrides: {
    eventId?: string;
    orderId?: string;
    checkoutId?: string;
    status?: string;
    amount?: number;
    type?: string;
    email?: string;
} = {}) {
    return {
        testMode: false,
        id: overrides.eventId ?? 'weve_geAva6c1RAuyb9HQxbSlmA',
        webhookId: 'wcon_P-VkRfmJTBaC6_Tst22cew',
        shopId: SHOP_ID,
        type: overrides.type ?? 'ORDER_PLACED',
        apiVersion: 'V1_BETA',
        createdAt: '2023-07-12T15:05:11.078089+00:00',
        data: {
            id: overrides.orderId ?? '00aa4abd-5778-4199-8161-0b49b2f212e5',
            checkoutId: overrides.checkoutId ?? 'chk_0001',
            status: overrides.status ?? 'CONFIRMED',
            email: overrides.email ?? 'customer@example.com',
            amounts: { total: overrides.amount ?? 49.99, currency: 'USD' },
            metadata: { invoiceId: 'inv_0001', region: 'GLOBAL' },
        },
    };
}

interface WebhookEventRow {
    status: string;
    processing_status: string;
}

/**
 * Stateful Supabase fake. Tracks `webhook_events` by event id so that a second
 * delivery of the same event is reported as already-completed (dedup), and
 * serves the `invoices` row used for checkout-id correlation.
 */
function createStatefulSupaMock(invoiceRow: Record<string, unknown> | null) {
    const events = new Map<string, WebhookEventRow>();
    const currentInvoice = invoiceRow ? { ...invoiceRow } : null;

    const chain: Record<string, any> = {
        _eq: {} as Record<string, string>,
        _from: '',
    };
    chain.eq = vi.fn((column: string, value: unknown) => {
        chain._eq[column] = String(value);
        return chain;
    });
    chain.select = vi.fn(() => chain);
    chain.maybeSingle = vi.fn(async () => {
        if (chain._from === 'invoices') {
            if (!currentInvoice) return { data: null, error: { code: 'PGRST116', message: 'Row not found' } };
            return { data: currentInvoice, error: null };
        }
        if (chain._from === 'webhook_events') {
            const eventId = chain._eq['provider_event_id'];
            const ev = eventId ? events.get(eventId) : undefined;
            if (!ev) return { data: null, error: null };
            return { data: { status: ev.status, processing_status: ev.processing_status }, error: null };
        }
        return { data: null, error: null };
    });
    chain.upsert = vi.fn(async (row: Record<string, unknown>) => {
        const eventId = String(row.provider_event_id ?? '');
        events.set(eventId, {
            status: String(row.status ?? 'pending'),
            processing_status: String(row.processing_status ?? 'processing'),
        });
        return { data: null, error: null };
    });
    chain.update = vi.fn((patch: Record<string, unknown>) => {
        // Real supabase: `.update()` returns a builder that buffers the trailing
        // `.eq()` filters and applies the write only when awaited. Model that so
        // the dedup state is written using the eq(provider_event_id, ...) filter.
        const pending = { patch, eqs: [] as Array<[string, string]> };
        const builder: Record<string, any> = {
            eq: vi.fn((column: string, value: unknown) => {
                pending.eqs.push([column, String(value)]);
                return builder;
            }),
            then: (resolve: (v: Record<string, unknown>) => void) => {
                const eventIdEntry = pending.eqs.find(([c]) => c === 'provider_event_id');
                if (eventIdEntry) {
                    const eventId = eventIdEntry[1];
                    const existing = events.get(eventId) || { status: 'pending', processing_status: 'processing' };
                    events.set(eventId, { ...existing, ...patch });
                }
                resolve({ data: null, error: null });
                return undefined;
            },
        };
        return builder;
    });

    const from = vi.fn((table: string) => {
        chain._from = table;
        chain._eq = {};
        return chain;
    });

    return { from, events };
}

// Controlled applyProviderVerdict stub — success by default.
const applyProviderVerdictMock = vi.fn(
    async (): Promise<{ code: 'applied'; outcome: 'success' }> => ({ code: 'applied', outcome: 'success' })
);

describe('POST /api/webhooks/fourthwall (official contract)', () => {
    let currentSupaMock: ReturnType<typeof createStatefulSupaMock>;

    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        vi.restoreAllMocks();
        process.env = {
            ...originalEnv,
            FOURTHWALL_SHOP_ID: SHOP_ID,
            FOURTHWALL_API_KEY: 'fw_key_test',
            FOURTHWALL_WEBHOOK_SECRET: WEBHOOK_SECRET,
            FOURTHWALL_STOREFRONT_TOKEN: 'ptkn_test',
            FOURTHWALL_SHOP_DOMAIN: 'mrxsteroid.fourthwall.com',
            FOURTHWALL_PRODUCT_DIGITAL_BOOK_ID: '11111111-1111-4111-8111-111111111111',
            FOURTHWALL_PRODUCT_PAPERBACK_ID: '22222222-2222-4222-8222-222222222222',
            FOURTHWALL_PRODUCT_HARDCOVER_ID: '33333333-3333-4333-8333-333333333333',
            SUPABASE_URL: 'https://project.supabase.co',
            SUPABASE_SERVICE_ROLE_KEY: 'sb_service_role_test',
        };

        applyProviderVerdictMock.mockReset();
        applyProviderVerdictMock.mockResolvedValue({ code: 'applied', outcome: 'success' });

        currentSupaMock = createStatefulSupaMock({
            id: 'inv_0001',
            user_id: 'user_01',
            amount: 49.99,
            currency: 'USD',
            payment_status: 'pending',
            tier_id: 'digital',
            region: 'GLOBAL',
            metadata: {},
        });

        vi.doMock('@supabase/supabase-js', () => ({
            createClient: vi.fn(() => currentSupaMock),
        }));
        vi.doMock('../../server/payments/fulfillmentService', () => ({
            applyProviderVerdict: applyProviderVerdictMock,
        }));
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.doUnmock('@supabase/supabase-js');
        vi.doUnmock('../../server/payments/fulfillmentService');
    });

    /** Build a Fourthwall webhook Request with the official signature header. */
    function makeWebhookRequest(
        rawBody: string,
        secret = WEBHOOK_SECRET,
        extraHeaders: Record<string, string> = {},
    ): NextRequest {
        return new NextRequest('http://localhost/api/webhooks/fourthwall', {
            method: 'POST',
            body: rawBody,
            headers: {
                'content-type': 'application/json',
                'x-fourthwall-hmac-sha256': signWebhook(rawBody, secret),
                ...extraHeaders,
            },
        });
    }

    async function post(rawBody: string, req?: NextRequest) {
        const { POST } = await import('../../app/api/webhooks/fourthwall/route');
        return POST(req ?? makeWebhookRequest(rawBody));
    }

    // ── Signature / envelope validation ────────────────────────────────────

    it('valid X-Fourthwall-Hmac-SHA256 accepts a valid signed CONFIRMED order', async () => {
        const res = await post(JSON.stringify(makeEnvelope()));
        expect(res.status).toBe(200);
        expect(applyProviderVerdictMock).toHaveBeenCalledTimes(1);
    });

    it('rejects an invalid signature (401)', async () => {
        const rawBody = JSON.stringify(makeEnvelope({ eventId: 'weve_bad_0001' }));
        // Sign a DIFFERENT body so the delivered signature does not match rawBody.
        const req = makeWebhookRequest(rawBody, WEBHOOK_SECRET, {
            'x-fourthwall-hmac-sha256': signWebhook(JSON.stringify(makeEnvelope({ eventId: 'weve_other' }))),
        });
        const res = await post(rawBody, req);
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual(expect.objectContaining({ error: expect.stringContaining('HMAC') }));
        expect(applyProviderVerdictMock).not.toHaveBeenCalled();
    });

    it('rejects a tampered/modified body (signature does not match the body actually sent)', async () => {
        // Sign the ORIGINAL body, then send a DIFFERENT body → HMAC mismatch.
        const sentBody = JSON.stringify(makeEnvelope({ amount: 99.99 }));
        const req = new NextRequest('http://localhost/api/webhooks/fourthwall', {
            method: 'POST',
            body: sentBody,
            headers: {
                'content-type': 'application/json',
                'x-fourthwall-hmac-sha256': signWebhook(JSON.stringify(makeEnvelope({ amount: 49.99 }))),
            },
        });
        const res = await post(sentBody, req);
        expect(res.status).toBe(401);
        expect(applyProviderVerdictMock).not.toHaveBeenCalled();
    });

    it('rejects a request with no signature header (401)', async () => {
        const rawBody = JSON.stringify(makeEnvelope({ eventId: 'weve_nosig_0001' }));
        const req = new NextRequest('http://localhost/api/webhooks/fourthwall', {
            method: 'POST',
            body: rawBody,
            headers: { 'content-type': 'application/json' },
        });
        const res = await post(rawBody, req);
        expect(res.status).toBe(401);
        expect(applyProviderVerdictMock).not.toHaveBeenCalled();
    });

    it('rejects a signature made with the wrong webhook secret (401)', async () => {
        const rawBody = JSON.stringify(makeEnvelope({ eventId: 'weve_wrongsecret_0001' }));
        const req = makeWebhookRequest(rawBody, 'wrong_secret');
        const res = await post(rawBody, req);
        expect(res.status).toBe(401);
        expect(applyProviderVerdictMock).not.toHaveBeenCalled();
    });

    // ── Status mapping / correlation / dedup ───────────────────────────────

    it('maps documented settled states (SHIPPED/DELIVERED/COMPLETED) to fulfillment', async () => {
        for (const status of ['SHIPPED', 'DELIVERED', 'COMPLETED']) {
            applyProviderVerdictMock.mockClear();
            const rawBody = JSON.stringify(makeEnvelope({ eventId: `weve_${status}_0001`, status }));
            const res = await post(rawBody);
            expect(res.status).toBe(200);
            expect(applyProviderVerdictMock).toHaveBeenCalledTimes(1);
        }
    });

    it('CANCELLED is acknowledged as a refund/cancel and NOT fulfilled', async () => {
        const rawBody = JSON.stringify(makeEnvelope({ eventId: 'weve_cancel_0001', status: 'CANCELLED' }));
        const res = await post(rawBody);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(expect.objectContaining({ message: 'Refund/cancel acknowledged' }));
        expect(applyProviderVerdictMock).not.toHaveBeenCalled();
    });

    it('unknown / not-yet-settled status fails closed (no fulfillment)', async () => {
        for (const status of ['IN_PRODUCTION', 'PARTIALLY_SHIPPED', 'UNKNOWN_STATUS']) {
            applyProviderVerdictMock.mockClear();
            const rawBody = JSON.stringify(makeEnvelope({ eventId: `weve_${status}_0001`, status }));
            const res = await post(rawBody);
            expect(res.status).toBe(200);
            expect(await res.json()).toEqual(expect.objectContaining({ message: 'Non-settled status acknowledged' }));
            expect(applyProviderVerdictMock).not.toHaveBeenCalled();
        }
    });

    it('correlates the invoice by checkout id and threads the order as the external reference', async () => {
        const rawBody = JSON.stringify(
            makeEnvelope({
                eventId: 'weve_corr_0001',
                checkoutId: 'chk_0001',
                orderId: '00aa4abd-5778-4199-8161-0b49b2f212e5',
                status: 'CONFIRMED',
                amount: 49.99,
            })
        );
        const res = await post(rawBody);
        expect(res.status).toBe(200);
        // Invoice found by checkout id → applyProviderVerdict called with the
        // invoice id and the Fourthwall order id as the external reference.
        const verdictInput = applyProviderVerdictMock.mock.calls[0][0];
        expect(verdictInput.invoiceId).toBe('inv_0001');
        expect(verdictInput.verdict.externalReferenceId).toBe('00aa4abd-5778-4199-8161-0b49b2f212e5');
        expect(verdictInput.gatewayName).toBe('FOURTHWALL');
    });

    it('acknowledges but does not fulfill when no invoice matches the checkout id', async () => {
        // Reset the fake so the invoice lookup returns no row.
        currentSupaMock = createStatefulSupaMock(null);
        const rawBody = JSON.stringify(makeEnvelope({ eventId: 'weve_noinvoice_0001', checkoutId: 'chk_missing' }));
        const res = await post(rawBody);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(expect.objectContaining({ message: 'Invoice not found' }));
        expect(applyProviderVerdictMock).not.toHaveBeenCalled();
    });

    it('a duplicate webhook (same event id) does not double-fulfill', async () => {
        const rawBody = JSON.stringify(makeEnvelope({ eventId: 'weve_dedup_0001' }));
        const first = await post(rawBody);
        expect(first.status).toBe(200);
        expect(applyProviderVerdictMock).toHaveBeenCalledTimes(1);

        // Second delivery of the SAME event id: the stateful fake reflects the
        // event as completed, so the route acknowledges it as a duplicate and
        // does NOT call applyProviderVerdict again.
        const second = await post(rawBody);
        expect(second.status).toBe(200);
        expect(await second.json()).toEqual(expect.objectContaining({ message: 'Duplicate event acknowledged' }));
        expect(applyProviderVerdictMock).toHaveBeenCalledTimes(1);
    });
});
