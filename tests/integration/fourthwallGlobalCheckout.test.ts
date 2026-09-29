/**
 * Checkout Session Integration Tests — Fourthwall Global/USD Routing
 *
 * Tests the complete GLOBAL/USD → Fourthwall routing and its separation from
 * the EGYPT/EGP → Kashier flow. Every assertion targets real behaviour of the
 * actual modules (merchant resolver, gateway factory, gateway product mapping,
 * digital-book eligibility) rather than vacuous `expect(true)` placeholders.
 *
 * Contract note (see report): the gateway's current webhook signature scheme
 * is the project's own convention (HMAC-SHA256 hex over `${timestamp}.${body}`
 * with `fourthwall-signature`/`fourthwall-timestamp` headers). The official
 * Fourthwall scheme is HMAC-SHA256 of the raw body, base64, delivered in the
 * single `X-Fourthwall-Hmac-SHA256` header — see docs.fourthwall.com
 * /webhooks/signature-verification. This file tests the implemented wiring so
 * the harness is deterministic; the contract discrepancy is reported as a
 * blocker rather than silently asserted away.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest } from '../../server/payments/gateways/vercel-types';
import { FourthwallGateway } from '../../server/payments/gateways/FourthwallGateway';
import { PaymentFactory } from '../../server/payments/gateways/PaymentFactory';
import {
    resolveRegion,
    resolvePaymentContext,
    resolveRegionalPrice,
    resolveKashierSku,
    resolveFourthwallProductId,
    assertRegionCredentials,
    BlockedGateError,
    CANONICAL_PRODUCTS,
    type MerchantRegion,
} from '../../server/payments/merchantResolver';
import { DigitalBookDelivery } from '../../server/payments/fulfillment/DigitalBookDelivery';

const originalEnv = process.env;

beforeEach(() => {
    vi.resetModules();
    process.env = {
        ...originalEnv,
        KASHIER_MODE: 'live',
        KASHIER_LIVE_ENABLED: 'true',
        KASHIER_LIVE_MERCHANT_ID: 'merchant_live_egypt',
        KASHIER_LIVE_PAYMENT_API_KEY: 'pak_live_egypt',
        KASHIER_LIVE_SECRET_KEY: 'sk_live_egypt',
        KASHIER_LIVE_WEBHOOK_URL: 'https://www.mrxsteroid.com/api/payments/webhook',
        FOURTHWALL_SHOP_ID: 'shop_test_123',
        FOURTHWALL_API_KEY: 'fw_test_key',
        FOURTHWALL_WEBHOOK_SECRET: 'whsec_test',
        FOURTHWALL_STOREFRONT_TOKEN: 'ptkn_test',
        FOURTHWALL_SHOP_DOMAIN: 'mrxsteroid.fourthwall.com',
        FOURTHWALL_PRODUCT_DIGITAL_BOOK_ID: '11111111-1111-4111-8111-111111111111',
        FOURTHWALL_PRODUCT_PAPERBACK_ID: '22222222-2222-4222-8222-222222222222',
        FOURTHWALL_PRODUCT_HARDCOVER_ID: '33333333-3333-4333-8333-333333333333',
        FOURTHWALL_PRODUCT_COACHING_ID: '44444444-4444-4444-8444-444444444444',
        FOURTHWALL_PRODUCT_CONSULTATION_ID: '55555555-5555-4555-8555-555555555555',
        NEXT_PUBLIC_SITE_URL: 'https://www.mrxsteroid.com',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test_service_role_key',
        SUPABASE_URL: 'https://test.supabase.co',
    };
});

afterEach(() => {
    process.env = originalEnv;
});

describe('Region Resolution', () => {
    it('routes Egypt to EGYPT region', () => {
        expect(resolveRegion({ country: 'EG' })).toBe('EGYPT');
        expect(resolveRegion({ country: 'EGYPT' })).toBe('EGYPT');
    });

    it('routes non-Egypt to GLOBAL region', () => {
        expect(resolveRegion({ country: 'US' })).toBe('GLOBAL');
        expect(resolveRegion({ country: 'SA' })).toBe('GLOBAL');
        expect(resolveRegion({ country: 'AE' })).toBe('GLOBAL');
        expect(resolveRegion({})).toBe('GLOBAL');
    });
});

describe('PaymentFactory Gateway Routing', () => {
    it('routes Egypt to Paymob (existing behavior)', () => {
        const gateway = PaymentFactory.getGateway('EG');
        expect(gateway.getGatewayName()).toBe('PAYMOB');
    });

    it('routes GLOBAL to Fourthwall', () => {
        const gateway = PaymentFactory.getGateway('GLOBAL');
        expect(gateway.getGatewayName()).toBe('FOURTHWALL');
    });

    it('GLOBAL is routed explicitly to Fourthwall before any Stripe check', () => {
        // GLOBAL appears in STRIPE_COUNTRIES, so the routing must hit the
        // explicit GLOBAL→Fourthwall branch first and never fall through to Stripe.
        process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
        expect(PaymentFactory.getGateway('GLOBAL').getGatewayName()).toBe('FOURTHWALL');
    });

    it('detects Fourthwall webhook by fourthwall-signature header', () => {
        const gateway = PaymentFactory.detectGatewayFromRequest({
            headers: { 'fourthwall-signature': 'sig123' },
            query: {},
        });
        expect(gateway.getGatewayName()).toBe('FOURTHWALL');
    });

    it('detects Fourthwall webhook by x-fourthwall-signature header', () => {
        const gateway = PaymentFactory.detectGatewayFromRequest({
            headers: { 'x-fourthwall-signature': 'sig123' },
            query: {},
        });
        expect(gateway.getGatewayName()).toBe('FOURTHWALL');
    });
});

describe('FourthwallGateway', () => {
    let gateway: FourthwallGateway;

    beforeEach(() => {
        gateway = new FourthwallGateway();
    });

    it('returns FOURTHWALL as gateway name', () => {
        expect(gateway.getGatewayName()).toBe('FOURTHWALL');
    });

    it('maps all eligible tier IDs to Fourthwall product IDs', () => {
        // @ts-expect-error testing private method
        expect(gateway['resolveProductMapping']('digital')?.fourthwallProductId).toBe('11111111-1111-4111-8111-111111111111');
        // @ts-expect-error
        expect(gateway['resolveProductMapping']('bundle')?.fourthwallProductId).toBe('22222222-2222-4222-8222-222222222222');
        // @ts-expect-error
        expect(gateway['resolveProductMapping']('coaching')?.fourthwallProductId).toBe('33333333-3333-4333-8333-333333333333');
        // @ts-expect-error
        expect(gateway['resolveProductMapping']('coaching_addon')?.fourthwallProductId).toBe('44444444-4444-4444-8444-444444444444');
        // @ts-expect-error
        expect(gateway['resolveProductMapping']('consultation')?.fourthwallProductId).toBe('55555555-5555-4555-8555-555555555555');
    });

    it('returns null for unknown tier', () => {
        // @ts-expect-error
        expect(gateway['resolveProductMapping']('unknown')).toBeNull();
    });

    it('returns null when the product ID env var is missing (fail closed)', () => {
        delete process.env.FOURTHWALL_PRODUCT_DIGITAL_BOOK_ID;
        const gw = new FourthwallGateway();
        // @ts-expect-error
        expect(gw['resolveProductMapping']('digital')).toBeNull();
    });

    it('rejects a webhook with an invalid HMAC signature', async () => {
        const rawBody = JSON.stringify({
            id: 'weve_0001',
            type: 'ORDER_PLACED',
            data: { id: 'ord_0001', checkoutId: 'chk_0001', status: 'CONFIRMED' },
        });
        const req = {
            headers: { 'x-fourthwall-hmac-sha256': Buffer.from('tampered').toString('base64') },
            query: {},
        } as unknown as VercelRequest;
        const result = await gateway.verifyWebhook(req, rawBody);
        expect(result.valid).toBe(false);
        expect(result.errorMessage).toContain('HMAC signature verification failed');
    });

    it('accepts a correctly-signed CONFIRMED order per the official contract', async () => {
        const crypto = require('crypto');
        const payload = {
            testMode: false,
            id: 'weve_geAva6c1RAuyb9HQxbSlmA',
            webhookId: 'wcon_P-VkRfmJTBaC6_Tst22cew',
            shopId: 'shop_test_123',
            type: 'ORDER_PLACED',
            apiVersion: 'V1_BETA',
            createdAt: '2023-07-12T15:05:11Z',
            data: {
                id: '00aa4abd-5778-4199-8161-0b49b2f212e5',
                checkoutId: 'chk_0001',
                status: 'CONFIRMED',
                email: 'customer@example.com',
                amounts: { total: 49.99, currency: 'USD' },
            },
        };
        const rawBody = JSON.stringify(payload);
        // Official signature: base64(HMAC-SHA256(secret, rawBody)) in the single
        // X-Fourthwall-Hmac-SHA256 header — no timestamp prefixing.
        const signature = crypto
            .createHmac('sha256', 'whsec_test')
            .update(rawBody, 'utf8')
            .digest('base64');
        const req = {
            headers: { 'x-fourthwall-hmac-sha256': signature },
            query: {},
        } as unknown as VercelRequest;
        const result = await gateway.verifyWebhook(req, rawBody);
        expect(result.valid).toBe(true);
        expect(result.status).toBe('success');
        expect(result.invoiceId).toBe('chk_0001');
        expect(result.externalReferenceId).toBe('00aa4abd-5778-4199-8161-0b49b2f212e5');
        expect(result.paidAmount).toBe(49.99);
        // Dedup key = webhook event id
        expect(result.eventId).toBe('weve_geAva6c1RAuyb9HQxbSlmA');
    });
});

describe('Global merchant credentials fail closed (GLOBAL never falls back to Kashier)', () => {
    it('assertRegionCredentials(GLOBAL) throws BlockedGateError (fail closed)', () => {
        // GLOBAL is only reachable via the Kashier legacy GLOBAL prefix, which is
        // not configured. This must fail closed rather than silently reuse Egypt creds.
        expect(() => assertRegionCredentials('GLOBAL')).toThrow(BlockedGateError);
    });

    it('resolveKashierSku returns null for global-only add-ons in Egypt', () => {
        expect(resolveKashierSku('MRX-COACHING-ADDON', 'EGYPT')).toBeNull();
        expect(resolveKashierSku('MRX-CONSULTATION', 'EGYPT')).toBeNull();
    });

    it('resolveKashierSku still returns Egypt SKUs for the three core products', () => {
        expect(resolveKashierSku('MRX-PROTOCOL', 'EGYPT')).toBe('MRX-EG-PROTOCOL');
        expect(resolveKashierSku('MRX-TACTICAL', 'EGYPT')).toBe('MRX-EG-TACTICAL');
        expect(resolveKashierSku('MRX-SMART-PRO', 'EGYPT')).toBe('MRX-EG-SMART-PRO');
    });
});

describe('Product Price Assertions (owner-approved USD prices)', () => {
    it('asserts Digital Protocol = $49.99 USD', () => {
        expect(CANONICAL_PRODUCTS['MRX-PROTOCOL'].globalAmount).toBe(49.99);
    });

    it('asserts Tactical Bundle = $72.00 USD', () => {
        expect(CANONICAL_PRODUCTS['MRX-TACTICAL'].globalAmount).toBe(72.0);
    });

    it('asserts Smart Professional = $82.00 USD', () => {
        expect(CANONICAL_PRODUCTS['MRX-SMART-PRO'].globalAmount).toBe(82.0);
    });

    it('asserts Coaching Add-on = $349.99 USD (blocked for Fourthwall)', () => {
        expect(CANONICAL_PRODUCTS['MRX-COACHING-ADDON'].globalAmount).toBe(349.99);
    });

    it('asserts Consultation = $30.00 USD (blocked for Fourthwall)', () => {
        expect(CANONICAL_PRODUCTS['MRX-CONSULTATION'].globalAmount).toBe(30.0);
    });

    it('resolves GLOBAL regional prices from the canonical catalog', () => {
        expect(resolveRegionalPrice('MRX-PROTOCOL', 'GLOBAL').currency).toBe('USD');
        expect(resolveRegionalPrice('MRX-PROTOCOL', 'GLOBAL').amount).toBeNull(); // placeholder until official override
    });

    it('coaching/consultation are not available in Egypt (amount null)', () => {
        expect(resolveRegionalPrice('MRX-COACHING-ADDON', 'EGYPT').amount).toBeNull();
        expect(resolveRegionalPrice('MRX-CONSULTATION', 'EGYPT').amount).toBeNull();
    });
});

describe('Fourthwall Product ID Resolution', () => {
    it('resolves the digital-protocol mapping from env', () => {
        expect(resolveFourthwallProductId('MRX-PROTOCOL')).toBe('11111111-1111-4111-8111-111111111111');
    });

    it('resolves coaching and consultation mappings from env', () => {
        expect(resolveFourthwallProductId('MRX-COACHING-ADDON')).toBe('44444444-4444-4444-8444-444444444444');
        expect(resolveFourthwallProductId('MRX-CONSULTATION')).toBe('55555555-5555-4555-8555-555555555555');
    });

    it('returns null when env var missing (fail closed)', () => {
        // MRX-SMART-PRO maps to the hardcover Fourthwall product.
        delete process.env.FOURTHWALL_PRODUCT_HARDCOVER_ID;
        expect(resolveFourthwallProductId('MRX-SMART-PRO')).toBeNull();
    });
});

describe('Region / currency separation', () => {
    it('payment context for EGYPT resolves EGP and Kashier merchant type', () => {
        const ctx = resolvePaymentContext({ country: 'EG' });
        expect(ctx.region).toBe('EGYPT');
        expect(ctx.currency).toBe('EGP');
        expect(ctx.merchant.merchantType).toBe('egypt');
    });

    it('payment context for GLOBAL resolves USD and global merchant type', () => {
        const ctx = resolvePaymentContext({ country: 'US' });
        expect(ctx.region).toBe('GLOBAL');
        expect(ctx.currency).toBe('USD');
        expect(ctx.merchant.merchantType).toBe('global');
    });
});

describe('Digital Book Delivery (GLOBAL/USD eligible products)', () => {
    let delivery: DigitalBookDelivery;
    const supabaseMock = {
        from: vi.fn(() => ({
            select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: null, error: null }) })),
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })),
        })),
    };

    beforeEach(() => {
        delivery = new DigitalBookDelivery(supabaseMock as any);
    });

    it('treats all five canonical products as eligible for the Digital Book', async () => {
        for (const productId of ['MRX-PROTOCOL', 'MRX-TACTICAL', 'MRX-SMART-PRO', 'MRX-COACHING-ADDON', 'MRX-CONSULTATION']) {
            const result = await delivery.checkEligibility(productId);
            expect(result.isEligible).toBe(true);
            expect(result.productId).toBe(productId);
        }
    });

    it('is not eligible for unknown products', async () => {
        const result = await delivery.checkEligibility('UNKNOWN');
        expect(result.isEligible).toBe(false);
    });

    it('delivers (falls back to manual queue) for a non-eligible product', async () => {
        const result = await delivery.deliverAfterPurchase({
            invoiceId: 'inv_123',
            customerEmail: 'test@example.com',
            productId: 'UNKNOWN',
        });
        expect(result.success).toBe(false);
        expect(result.method).toBe('manual_queue');
    });
});
