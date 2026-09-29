/**
 * Fourthwall Gateway Tests — Official Contract fixtures
 *
 * The fixtures below model Fourthwall's documented API/webhook contract
 * (docs.fourthwall.com) rather than the project's prior invented conventions:
 *
 *  - Auth: HTTP Basic Auth (Authorization: Basic base64(user:pass)) for the
 *    Platform API; storefront_token query param for the Storefront API.
 *  - Checkout: no server-side "checkout session" endpoint exists; the buyer is
 *    redirected to https://{shop_domain}/cart/checkout?cartId=... after a
 *    Storefront cart is created via POST /v1/carts.
 *  - Webhook signature: HMAC-SHA256 over the ENTIRE raw body, base64-encoded,
 *    delivered in the single `X-Fourthwall-Hmac-SHA256` header.
 *  - Webhook envelope: { testMode, id (dedup key), webhookId, shopId, type,
 *    apiVersion, createdAt, data } — data is the OrderV1 order object.
 *  - Order status enum: CONFIRMED, SHIPPED, DELIVERED, COMPLETED (success),
 *    CANCELLED (failed), everything else is NOT settled (fail closed).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { FourthwallGateway } from '../../server/payments/gateways/FourthwallGateway';
import type { CreateInvoiceParams } from '../../server/payments/gateways/IPaymentGateway';
import type { VercelRequest } from '../../server/payments/gateways/vercel-types';

const originalEnv = process.env;

beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    process.env = {
        ...originalEnv,
        FOURTHWALL_SHOP_ID: 'shop_test_123',
        FOURTHWALL_API_KEY: 'fw_test_key_123',
        FOURTHWALL_WEBHOOK_SECRET: 'whsec_test_secret_123',
        FOURTHWALL_STOREFRONT_TOKEN: 'ptkn_test',
        FOURTHWALL_SHOP_DOMAIN: 'mrxsteroid.fourthwall.com',
        FOURTHWALL_PRODUCT_DIGITAL_BOOK_ID: '11111111-1111-4111-8111-111111111111',
        FOURTHWALL_PRODUCT_PAPERBACK_ID: '22222222-2222-4222-8222-222222222222',
        FOURTHWALL_PRODUCT_HARDCOVER_ID: '33333333-3333-4333-8333-333333333333',
        FOURTHWALL_PRODUCT_COACHING_ID: '44444444-4444-4444-8444-444444444444',
        FOURTHWALL_PRODUCT_CONSULTATION_ID: '55555555-5555-4555-8555-555555555555',
        NEXT_PUBLIC_SITE_URL: 'https://www.mrxsteroid.com',
    };
});

afterEach(() => {
    process.env = originalEnv;
});

// ─────────────────────────────────────────────────────────────────────────────
//  Contract fixture builders (authoritative shapes)
// ─────────────────────────────────────────────────────────────────────────────
/** Official signature: base64(HMAC-SHA256(secret, rawBody)) */
function signWebhook(rawBody: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
}

/** Build an ORDER_PLACED webhook envelope whose `data` is an OrderV1 object. */
function makeOrderEvent(overrides: {
    eventId?: string;
    type?: string;
    orderId?: string;
    checkoutId?: string;
    status?: string;
    amount?: number;
    currency?: string;
    email?: string;
    metadata?: Record<string, unknown>;
    testMode?: boolean;
} = {}) {
    return {
        testMode: overrides.testMode ?? false,
        id: overrides.eventId ?? 'weve_geAva6c1RAuyb9HQxbSlmA',
        webhookId: 'wcon_P-VkRfmJTBaC6_Tst22cew',
        shopId: 'sh_7ad0c438-beda-4779-a885-0dc325a755c1',
        type: overrides.type ?? 'ORDER_PLACED',
        apiVersion: 'V1_BETA',
        createdAt: '2023-07-12T15:05:11.078089+00:00',
        data: {
            id: overrides.orderId ?? '00aa4abd-5778-4199-8161-0b49b2f212e5',
            checkoutId: overrides.checkoutId ?? 'chk_0001',
            status: overrides.status ?? 'CONFIRMED',
            email: overrides.email ?? 'customer@example.com',
            amounts: { total: overrides.amount ?? 49.99, currency: overrides.currency ?? 'USD' },
            metadata: overrides.metadata ?? { invoiceId: 'inv_123', region: 'GLOBAL' },
        },
    };
}

/** Build a VercelRequest with the official signature header. */
function makeSignedReq(rawBody: string, secret: string): VercelRequest {
    return {
        headers: { 'x-fourthwall-hmac-sha256': signWebhook(rawBody, secret) },
        query: {},
    } as unknown as VercelRequest;
}

describe('FourthwallGateway', () => {
    let gateway: FourthwallGateway;

    beforeEach(() => {
        gateway = new FourthwallGateway();
    });

    describe('getGatewayName', () => {
        it('returns FOURTHWALL', () => {
            expect(gateway.getGatewayName()).toBe('FOURTHWALL');
        });
    });

    describe('assertCredentials', () => {
        it('throws when credentials are missing', () => {
            const gw = new FourthwallGateway();
            // @ts-expect-error - testing private method
            gw.config.shopId = '';
            expect(() => {
                // @ts-expect-error
                gw.assertCredentials();
            }).toThrow('[FourthwallGateway] Missing credentials');
        });
    });

    describe('resolveProductMapping', () => {
        it('maps digital tier to digital book product', () => {
            const gw = new FourthwallGateway();
            // @ts-expect-error
            expect(gw['resolveProductMapping']('digital')).toEqual({
                fourthwallProductId: '11111111-1111-4111-8111-111111111111',
                fourthwallVariantId: undefined,
            });
        });

        it('maps bundle tier to paperback product', () => {
            const gw = new FourthwallGateway();
            // @ts-expect-error
            expect(gw['resolveProductMapping']('bundle')).toEqual({
                fourthwallProductId: '22222222-2222-4222-8222-222222222222',
                fourthwallVariantId: undefined,
            });
        });

        it('maps coaching tier to hardcover product', () => {
            const gw = new FourthwallGateway();
            // @ts-expect-error
            expect(gw['resolveProductMapping']('coaching')).toEqual({
                fourthwallProductId: '33333333-3333-4333-8333-333333333333',
                fourthwallVariantId: undefined,
            });
        });

        it('returns null for unknown tier', () => {
            const gw = new FourthwallGateway();
            // @ts-expect-error
            expect(gw['resolveProductMapping']('unknown')).toBeNull();
        });

        it('returns null when product ID env var is missing (fail closed)', () => {
            delete process.env.FOURTHWALL_PRODUCT_DIGITAL_BOOK_ID;
            const gw = new FourthwallGateway();
            // @ts-expect-error
            expect(gw['resolveProductMapping']('digital')).toBeNull();
        });
    });

    describe('verifyWebhook — official contract', () => {
        it('rejects empty body', async () => {
            const result = await gateway.verifyWebhook(makeSignedReq('', 'whsec_test_secret_123'), '');
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toContain('Empty webhook body');
        });

        it('rejects invalid JSON', async () => {
            const result = await gateway.verifyWebhook(makeSignedReq('not json', 'whsec_test_secret_123'), 'not json');
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toContain('Invalid JSON body');
        });

        it('rejects a request with no signature header', async () => {
            const rawBody = JSON.stringify(makeOrderEvent());
            const result = await gateway.verifyWebhook({ headers: {}, query: {} } as unknown as VercelRequest, rawBody);
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toContain('Missing X-Fourthwall');
        });

        it('rejects a tampered body (signature does not match body)', async () => {
            const rawBody = JSON.stringify(makeOrderEvent({ orderId: '00aa4abd-5778-4199-8161-0b49b2f212e5' }));
            const signature = signWebhook(JSON.stringify(makeOrderEvent({ orderId: 'other-order' })), 'whsec_test_secret_123');
            const req = { headers: { 'x-fourthwall-hmac-sha256': signature }, query: {} } as unknown as VercelRequest;
            const result = await gateway.verifyWebhook(req, rawBody);
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toContain('HMAC signature verification failed');
        });

        it('rejects a wrong secret (signature made with another secret)', async () => {
            const rawBody = JSON.stringify(makeOrderEvent());
            const result = await gateway.verifyWebhook(makeSignedReq(rawBody, 'wrong_secret'), rawBody);
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toContain('HMAC signature verification failed');
        });

        it('accepts a valid CONFIRMED order and maps it to success', async () => {
            const event = makeOrderEvent({ status: 'CONFIRMED', amount: 49.99, currency: 'USD' });
            const rawBody = JSON.stringify(event);
            const result = await gateway.verifyWebhook(makeSignedReq(rawBody, 'whsec_test_secret_123'), rawBody);
            expect(result.valid).toBe(true);
            expect(result.status).toBe('success');
            expect(result.detailedStatus).toBe('APPROVED');
            expect(result.externalReferenceId).toBe('00aa4abd-5778-4199-8161-0b49b2f212e5');
            expect(result.invoiceId).toBe('chk_0001');
            expect(result.paidAmount).toBe(49.99);
            expect(result.providerStatus).toBe('CONFIRMED');
            expect(result.isReconciled).toBe(true);
            expect(result.eventId).toBe('weve_geAva6c1RAuyb9HQxbSlmA');
        });

        it('accepts documented successful states (SHIPPED/DELIVERED/COMPLETED)', async () => {
            for (const status of ['SHIPPED', 'DELIVERED', 'COMPLETED']) {
                const rawBody = JSON.stringify(makeOrderEvent({ status }));
                const result = await gateway.verifyWebhook(makeSignedReq(rawBody, 'whsec_test_secret_123'), rawBody);
                expect(result.valid).toBe(true);
                expect(result.status).toBe('success');
                expect(result.providerStatus).toBe(status);
            }
        });

        it('maps CANCELLED to failed (refund/cancel)', async () => {
            const rawBody = JSON.stringify(makeOrderEvent({ status: 'CANCELLED' }));
            const result = await gateway.verifyWebhook(makeSignedReq(rawBody, 'whsec_test_secret_123'), rawBody);
            expect(result.valid).toBe(true);
            expect(result.status).toBe('failed');
            expect(result.detailedStatus).toBe('REFUNDED');
            expect(result.isReconciled).toBe(false);
        });

        it('fails closed on an unknown / not-yet-settled status (IN_PRODUCTION)', async () => {
            for (const status of ['IN_PRODUCTION', 'PARTIALLY_SHIPPED', 'UNKNOWN_STATUS']) {
                const rawBody = JSON.stringify(makeOrderEvent({ status }));
                const result = await gateway.verifyWebhook(makeSignedReq(rawBody, 'whsec_test_secret_123'), rawBody);
                expect(result.valid).toBe(true);
                expect(result.status).toBeUndefined();
                expect(result.isReconciled).toBe(false);
            }
        });

        it('surfaces the same event id as replay for a duplicate webhook', async () => {
            const rawBody = JSON.stringify(makeOrderEvent({ eventId: 'weve_dup_0001' }));
            const first = await gateway.verifyWebhook(makeSignedReq(rawBody, 'whsec_test_secret_123'), rawBody);
            const second = await gateway.verifyWebhook(makeSignedReq(rawBody, 'whsec_test_secret_123'), rawBody);
            expect(first.eventId).toBe('weve_dup_0001');
            expect(second.eventId).toBe('weve_dup_0001');
            // The gateway itself is stateless; replay detection is handled by the
            // webhook route via provider_event_id = event id. Here we assert the
            // eventId (dedup key) is stably exposed on every call.
        });
    });

    describe('createInvoice — official checkout contract', () => {
        const baseParams: CreateInvoiceParams = {
            userId: null,
            invoiceId: 'inv_123',
            tierId: 'digital',
            amount: 49.99,
            currency: 'USD',
            metadata: { email: 'test@example.com', fullName: 'Test User' },
        };

        it('throws when credentials are missing', async () => {
            const gw = new FourthwallGateway();
            // @ts-expect-error
            gw.config.apiKey = '';
            await expect(gw.createInvoice(baseParams)).rejects.toThrow('Missing credentials');
        });

        it('rejects a non-USD currency (GLOBAL/USD only)', async () => {
            await expect(
                gateway.createInvoice({ ...baseParams, currency: 'EUR' })
            ).rejects.toThrow(/USD/i);
        });

        it('rejects an amount that does not match the canonical USD price (server-side price)', async () => {
            await expect(
                gateway.createInvoice({ ...baseParams, amount: 19.99 })
            ).rejects.toThrow(/price/i);
        });

        it('rejects the AUP-blocked coaching/consultation tiers', async () => {
            await expect(
                gateway.createInvoice({ ...baseParams, tierId: 'coaching_addon' as CreateInvoiceParams['tierId'], amount: 349.99 })
            ).rejects.toThrow(/not permitted|blocked|coaching/i);
            await expect(
                gateway.createInvoice({ ...baseParams, tierId: 'consultation' as CreateInvoiceParams['tierId'], amount: 30 })
            ).rejects.toThrow(/not permitted|blocked|consultation/i);
        });

        it('creates a Storefront cart and returns a redirect URL', async () => {
            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({ id: 'cart_0001', items: [], metadata: {} }),
            });
            vi.stubGlobal('fetch', fetchMock);

            const result = await gateway.createInvoice(baseParams);

            // Storefront cart creation with storefront_token query param
            const [url, init] = fetchMock.mock.calls[0];
            expect(String(url)).toContain('https://storefront-api.fourthwall.com/v1/carts');
            expect(String(url)).toContain('storefront_token=ptkn_test');

            const body = JSON.parse(init.body);
            // Metadata carries the invoice id + region for idempotency/affiliate
            expect(body.metadata.invoiceId).toBe('inv_123');
            expect(body.metadata.region).toBe('GLOBAL');
            expect(body.items).toBeDefined();

            // Redirect to the official cart checkout URL
            expect(result.redirectUrl).toBe('https://mrxsteroid.fourthwall.com/cart/checkout?cartId=cart_0001&currency=USD');
            expect(result.externalReferenceId).toBe('inv_123');
        });

        it('throws when the Storefront cart API fails (non-2xx)', async () => {
            const fetchMock = vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                text: async () => 'bad request',
            });
            vi.stubGlobal('fetch', fetchMock);
            await expect(gateway.createInvoice(baseParams)).rejects.toThrow(/failed|400/);
        });
    });

    describe('fetchOrder — official platform auth (Basic Auth, correct path)', () => {
        it('calls GET /open-api/v1.0/order/{id} with Basic auth', async () => {
            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({ id: '00aa4abd-5778-4199-8161-0b49b2f212e5', status: 'CONFIRMED' }),
            });
            vi.stubGlobal('fetch', fetchMock);

            const order = await gateway.fetchOrder('00aa4abd-5778-4199-8161-0b49b2f212e5');
            expect(order).toEqual(expect.objectContaining({ id: '00aa4abd-5778-4199-8161-0b49b2f212e5' }));

            const [url, init] = fetchMock.mock.calls[0];
            expect(String(url)).toContain('/open-api/v1.0/order/00aa4abd-5778-4199-8161-0b49b2f212e5');
            // Platform API uses HTTP Basic auth with API credentials
            expect(String(init.headers.Authorization)).toMatch(/^Basic /);
            expect(String(init.headers.Authorization)).not.toMatch(/^Bearer /);
        });
    });
});
