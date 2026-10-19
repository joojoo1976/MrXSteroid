/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  tests/unit/combinedCheckoutGatewayAdapter.test.ts
 *
 *  Comprehensive verification for:
 *  - GAP-01: Elimination of `as unknown as CombinedCheckoutGateway` hack via clean adapters.
 *  - GAP-02: Fourthwall AUP §13 enforcement (rejection of coaching/consultation in Fourthwall carts).
 *  - GAP-03: Fourthwall variant UUID fail-closed enforcement (BLOCKED on missing/placeholder IDs).
 *  - Live Kashier service payment links for VIP Coaching ($349.99 USD) and Consultation ($30.00 USD).
 *  - Resolution & rejection of mixed merchandise + direct service carts.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FourthwallGateway } from '../../server/payments/gateways/FourthwallGateway';
import { FourthwallCheckoutAdapter } from '../../server/payments/gateways/FourthwallCheckoutAdapter';
import { KashierServiceLinkAdapter } from '../../server/payments/gateways/KashierServiceLinkAdapter';
import {
    resolveCombinedGateway,
    isDirectServiceTier,
    type CombinedPaymentSessionParams,
} from '../../server/payments/checkout/combinedCheckoutSessionService';
import { CheckoutValidationError } from '../../server/payments/checkout/checkoutSessionService';
import {
    KASHIER_SERVICE_PAYMENT_LINKS,
    buildKashierServicePaymentUrl,
} from '../../server/payments/paymentLinkConfig';

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
    };
});

afterEach(() => {
    process.env = originalEnv;
});

describe('FourthwallCheckoutAdapter — GAP-01, GAP-02, GAP-03', () => {
    const baseParams: CombinedPaymentSessionParams = {
        orderRef: 'inv_global_test_01',
        amount: 121.99,
        currency: 'USD',
        customerEmail: 'buyer@example.com',
        customerName: 'Global Buyer',
        lines: [
            {
                kind: 'product',
                tierId: 'digital',
                quantity: 1,
                unitAmount: 49.99,
                amount: 49.99,
                currency: 'USD',
                shippable: false,
            },
            {
                kind: 'product',
                tierId: 'paperback',
                quantity: 1,
                unitAmount: 72.00,
                amount: 72.00,
                currency: 'USD',
                shippable: true,
            },
        ],
    };

    it('rejects a non-USD currency (Global Fourthwall is USD-only)', async () => {
        const adapter = new FourthwallCheckoutAdapter();
        await expect(
            adapter.createPaymentSession({ ...baseParams, currency: 'EGP' })
        ).rejects.toThrow(CheckoutValidationError);
        await expect(
            adapter.createPaymentSession({ ...baseParams, currency: 'EUR' })
        ).rejects.toThrow(/USD-only/i);
    });

    it('rejects checkout with empty order lines', async () => {
        const adapter = new FourthwallCheckoutAdapter();
        await expect(
            adapter.createPaymentSession({ ...baseParams, lines: [] })
        ).rejects.toThrow(CheckoutValidationError);
    });

    it('GAP-02: strictly rejects AUP-blocked services (coaching_addon, consultation, coaching_plus)', async () => {
        const adapter = new FourthwallCheckoutAdapter();

        // 1. coaching_addon
        await expect(
            adapter.createPaymentSession({
                ...baseParams,
                lines: [
                    {
                        kind: 'addon',
                        tierId: 'coaching_addon' as any,
                        quantity: 1,
                        unitAmount: 349.99,
                        amount: 349.99,
                        currency: 'USD',
                        shippable: false,
                    },
                ],
            })
        ).rejects.toThrow(/AUP §13/i);

        // 2. consultation
        await expect(
            adapter.createPaymentSession({
                ...baseParams,
                lines: [
                    {
                        kind: 'product',
                        tierId: 'consultation' as any,
                        quantity: 1,
                        unitAmount: 30.00,
                        amount: 30.00,
                        currency: 'USD',
                        shippable: false,
                    },
                ],
            })
        ).rejects.toThrow(/AUP §13/i);

        // 3. coaching_plus
        await expect(
            adapter.createPaymentSession({
                ...baseParams,
                lines: [
                    {
                        kind: 'addon',
                        tierId: 'coaching_plus',
                        quantity: 1,
                        unitAmount: 349.99,
                        amount: 349.99,
                        currency: 'USD',
                        shippable: false,
                    },
                ],
            })
        ).rejects.toThrow(/AUP §13/i);
    });

    it('GAP-03: fails closed with BLOCKED status if real Fourthwall variant UUID is missing or placeholder', async () => {
        // Unset product ID env var to simulate unconfigured variant
        delete process.env.FOURTHWALL_PRODUCT_PAPERBACK_ID;

        const adapter = new FourthwallCheckoutAdapter();
        await expect(adapter.createPaymentSession(baseParams)).rejects.toThrow(
            /BLOCKED: Missing verified Fourthwall variant UUID/i
        );

        // Set placeholder ID to simulate test placeholder
        process.env.FOURTHWALL_PRODUCT_PAPERBACK_ID = 'fw_placeholder_paperback_123';
        const adapterWithPlaceholder = new FourthwallCheckoutAdapter();
        await expect(adapterWithPlaceholder.createPaymentSession(baseParams)).rejects.toThrow(
            /BLOCKED: Missing verified Fourthwall variant UUID/i
        );
    });

    it('GAP-01: successfully creates a multi-item Storefront cart and returns redirect URL', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ id: 'cart_multi_item_999' }),
        });
        vi.stubGlobal('fetch', fetchMock);

        const adapter = new FourthwallCheckoutAdapter();
        const result = await adapter.createPaymentSession(baseParams);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(String(url)).toContain('/v1/carts?storefront_token=ptkn_test&currency=USD');

        const body = JSON.parse(init.body);
        expect(body.items).toHaveLength(2);
        expect(body.items[0]).toEqual({
            variantId: '11111111-1111-4111-8111-111111111111',
            quantity: 1,
        });
        expect(body.items[1]).toEqual({
            variantId: '22222222-2222-4222-8222-222222222222',
            quantity: 1,
        });
        expect(body.metadata.invoiceId).toBe('inv_global_test_01');
        expect(body.metadata.region).toBe('GLOBAL');

        expect(result.sessionId).toBe('cart_multi_item_999');
        expect(result.sessionUrl).toBe(
            'https://mrxsteroid.fourthwall.com/cart/checkout?cartId=cart_multi_item_999&currency=USD'
        );
        expect(result.status).toBe('ACTIVE');
    });
});

describe('KashierServiceLinkAdapter — VIP Coaching & Consultation Live Links', () => {
    it('rejects a non-USD currency', async () => {
        const adapter = new KashierServiceLinkAdapter();
        await expect(
            adapter.createPaymentSession({
                orderRef: 'inv_serv_01',
                amount: 349.99,
                currency: 'EGP',
                customerEmail: 'vip@example.com',
                customerName: 'VIP Client',
                lines: [
                    {
                        kind: 'addon',
                        tierId: 'coaching_plus',
                        quantity: 1,
                        unitAmount: 349.99,
                        amount: 349.99,
                        currency: 'USD',
                        shippable: false,
                    },
                ],
            })
        ).rejects.toThrow(CheckoutValidationError);
    });

    it('rejects multiple service lines in a single checkout session', async () => {
        const adapter = new KashierServiceLinkAdapter();
        await expect(
            adapter.createPaymentSession({
                orderRef: 'inv_serv_02',
                amount: 379.99,
                currency: 'USD',
                customerEmail: 'vip@example.com',
                customerName: 'VIP Client',
                lines: [
                    {
                        kind: 'addon',
                        tierId: 'coaching_plus',
                        quantity: 1,
                        unitAmount: 349.99,
                        amount: 349.99,
                        currency: 'USD',
                        shippable: false,
                    },
                    {
                        kind: 'product',
                        tierId: 'consultation' as any,
                        quantity: 1,
                        unitAmount: 30.00,
                        amount: 30.00,
                        currency: 'USD',
                        shippable: false,
                    },
                ],
            })
        ).rejects.toThrow(/exactly one service item/i);
    });

    it('fails closed when service links are UNVERIFIED or NOT_CONFIGURED (disabled payment)', async () => {
        delete process.env.KASHIER_SERVICE_LINKS_VERIFIED;
        const adapter = new KashierServiceLinkAdapter();
        await expect(
            adapter.createPaymentSession({
                orderRef: 'inv_unverified_01',
                amount: 349.99,
                currency: 'USD',
                customerEmail: 'vip@example.com',
                customerName: 'VIP Client',
                lines: [
                    {
                        kind: 'addon',
                        tierId: 'coaching_plus',
                        quantity: 1,
                        unitAmount: 349.99,
                        amount: 349.99,
                        currency: 'USD',
                        shippable: false,
                    },
                ],
            })
        ).rejects.toThrow(/الدفع غير متاح مؤقتًا/i);
    });

    it('routes VIP Coaching ($349.99 USD) to the live Kashier payment link when verified', async () => {
        process.env.KASHIER_SERVICE_LINKS_VERIFIED = 'true';
        const adapter = new KashierServiceLinkAdapter();
        const result = await adapter.createPaymentSession({
            orderRef: 'inv_vip_coach_100',
            amount: 349.99,
            currency: 'USD',
            customerEmail: 'vip.athlete@example.com',
            customerName: 'Champion Athlete',
            lines: [
                {
                    kind: 'addon',
                    tierId: 'coaching_plus',
                    quantity: 1,
                    unitAmount: 349.99,
                    amount: 349.99,
                    currency: 'USD',
                    shippable: false,
                },
            ],
        });

        expect(result.amount).toBe(349.99);
        expect(result.currency).toBe('USD');
        expect(result.sessionId).toBe('coaching_addon');

        const expectedLiveUrl = KASHIER_SERVICE_PAYMENT_LINKS.coaching_addon.liveUrl;
        expect(result.sessionUrl).toContain('checkouts.kashier.io');
        expect(result.sessionUrl).toContain('PL-4876162508FIH');
        expect(decodeURIComponent(result.sessionUrl)).toContain('PL-4876162508FIH,live');
        expect(result.sessionUrl).toContain('invoice_id=inv_vip_coach_100');
        expect(result.sessionUrl).toContain('email=vip.athlete%40example.com');
        expect(result.sessionUrl).toContain('amount=349.99');
    });

    it('routes Custom Consultation ($30.00 USD) to the live Kashier payment link when verified', async () => {
        process.env.KASHIER_SERVICE_LINKS_VERIFIED = 'true';
        const adapter = new KashierServiceLinkAdapter();
        const result = await adapter.createPaymentSession({
            orderRef: 'inv_consult_200',
            amount: 30.00,
            currency: 'USD',
            customerEmail: 'consult.client@example.com',
            customerName: 'Assessment Client',
            lines: [
                {
                    kind: 'product',
                    tierId: 'consultation' as any,
                    quantity: 1,
                    unitAmount: 30.00,
                    amount: 30.00,
                    currency: 'USD',
                    shippable: false,
                },
            ],
        });

        expect(result.amount).toBe(30.00);
        expect(result.currency).toBe('USD');
        expect(result.sessionId).toBe('consultation');

        expect(result.sessionUrl).toContain('checkouts.kashier.io');
        expect(result.sessionUrl).toContain('PL-487616250911F');
        expect(decodeURIComponent(result.sessionUrl)).toContain('PL-487616250911F,live');
        expect(result.sessionUrl).toContain('invoice_id=inv_consult_200');
        expect(result.sessionUrl).toContain('email=consult.client%40example.com');
        expect(result.sessionUrl).toContain('amount=30.00');
    });
});

describe('resolveCombinedGateway — Routing & Separation Rules', () => {
    it('resolves KashierGateway for region EGYPT', () => {
        const gateway = resolveCombinedGateway('EGYPT', [
            {
                kind: 'product',
                tierId: 'bundle',
                quantity: 1,
                unitAmount: 749,
                amount: 749,
                currency: 'EGP',
                shippable: true,
            },
        ]);
        expect(gateway.constructor.name).toBe('KashierGateway');
    });

    it('resolves FourthwallCheckoutAdapter for Global merchandise/books', () => {
        const gateway = resolveCombinedGateway('GLOBAL', [
            {
                kind: 'product',
                tierId: 'paperback',
                quantity: 1,
                unitAmount: 72.00,
                amount: 72.00,
                currency: 'USD',
                shippable: true,
            },
        ]);
        expect(gateway.constructor.name).toBe('FourthwallCheckoutAdapter');
    });

    it('resolves KashierServiceLinkAdapter for Global standalone services', () => {
        const gateway = resolveCombinedGateway('GLOBAL', [
            {
                kind: 'addon',
                tierId: 'coaching_plus',
                quantity: 1,
                unitAmount: 349.99,
                amount: 349.99,
                currency: 'USD',
                shippable: false,
            },
        ]);
        expect(gateway.constructor.name).toBe('KashierServiceLinkAdapter');
    });

    it('strictly rejects mixed carts containing both Fourthwall books and Kashier services', () => {
        expect(() =>
            resolveCombinedGateway('GLOBAL', [
                {
                    kind: 'product',
                    tierId: 'paperback',
                    quantity: 1,
                    unitAmount: 72.00,
                    amount: 72.00,
                    currency: 'USD',
                    shippable: true,
                },
                {
                    kind: 'addon',
                    tierId: 'coaching_plus',
                    quantity: 1,
                    unitAmount: 349.99,
                    amount: 349.99,
                    currency: 'USD',
                    shippable: false,
                },
            ])
        ).toThrow(CheckoutValidationError);
    });
});
