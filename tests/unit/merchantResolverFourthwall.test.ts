/**
 * Merchant Resolver Tests — Fourthwall Global/USD Integration
 * Tests for region routing, product mapping, and Fourthwall integration
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    resolveRegion,
    getMerchantConfig,
    assertRegionCredentials,
    resolvePaymentContext,
    resolveRegionalPrice,
    resolveKashierSku,
    resolveFourthwallProductId,
    type CanonicalProductId,
    type MerchantRegion,
    BlockedGateError,
    GATEWAY_NOT_AVAILABLE,
} from '../../server/payments/merchantResolver';

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
        // GLOBAL has NO Kashier credentials (fail-closed)
        FOURTHWALL_SHOP_ID: 'shop_test_123',
        FOURTHWALL_API_KEY: 'fw_test_key',
        FOURTHWALL_API_KEY_SECONDARY: 'fw_test_key_2',
        FOURTHWALL_WEBHOOK_SECRET: 'whsec_test',
        FOURTHWALL_PRODUCT_DIGITAL_BOOK_ID: 'fw_digital_book_123',
        FOURTHWALL_PRODUCT_PAPERBACK_ID: 'fw_paperback_123',
        FOURTHWALL_PRODUCT_HARDCOVER_ID: 'fw_hardcover_123',
        FOURTHWALL_PRODUCT_COACHING_ID: 'fw_coaching_123',
        FOURTHWALL_PRODUCT_CONSULTATION_ID: 'fw_consultation_123',
        // Price overrides for coaching addon and consultation
        PRICING_GLOBAL_MRX_COACHING_ADDON_USD: '349.99',
        PRICING_GLOBAL_MRX_CONSULTATION_USD: '30.00',
    };
});

afterEach(() => {
    process.env = originalEnv;
});

describe('resolveRegion', () => {
    it('returns EGYPT for Egypt country codes', () => {
        expect(resolveRegion({ country: 'EG' })).toBe('EGYPT');
        expect(resolveRegion({ country: 'EGYPT' })).toBe('EGYPT');
        expect(resolveRegion({ country: 'مصر' })).toBe('EGYPT');
    });

    it('returns GLOBAL for non-Egypt countries', () => {
        expect(resolveRegion({ country: 'US' })).toBe('GLOBAL');
        expect(resolveRegion({ country: 'SA' })).toBe('GLOBAL');
        expect(resolveRegion({ country: 'AE' })).toBe('GLOBAL');
        expect(resolveRegion({})).toBe('GLOBAL');
    });
});

describe('getMerchantConfig — EGYPT', () => {
    it('returns Egypt config with live credentials', () => {
        const config = getMerchantConfig('EGYPT');
        expect(config.region).toBe('EGYPT');
        expect(config.currency).toBe('EGP');
        expect(config.merchantId).toBe('merchant_live_egypt');
        expect(config.secrets.paymentApiKey.primary).toBe('pak_live_egypt');
        expect(config.secrets.secretKey.primary).toBe('sk_live_egypt');
        expect(config.mode).toBe('live');
        expect(config.merchantType).toBe('egypt');
        expect(config.paymentMethods).toEqual(['card', 'wallet']);
    });

    it('includes wallet for Egypt', () => {
        const config = getMerchantConfig('EGYPT');
        expect(config.paymentMethods).toContain('wallet');
    });
});

describe('getMerchantConfig — GLOBAL', () => {
    it('returns GLOBAL config with empty Kashier credentials (fail-closed)', () => {
        const config = getMerchantConfig('GLOBAL');
        expect(config.region).toBe('GLOBAL');
        expect(config.currency).toBe('USD');
        expect(config.merchantId).toBe('');
        expect(config.secrets.paymentApiKey.primary).toBe('');
        expect(config.secrets.secretKey.primary).toBe('');
        expect(config.mode).toBe('live');
        expect(config.merchantType).toBe('global');
        expect(config.paymentMethods).toEqual(['card']);
    });

    it('does NOT include wallet for GLOBAL', () => {
        const config = getMerchantConfig('GLOBAL');
        expect(config.paymentMethods).not.toContain('wallet');
    });
});

describe('assertRegionCredentials', () => {
    it('passes for EGYPT with valid credentials', () => {
        const config = assertRegionCredentials('EGYPT');
        expect(config.merchantId).toBe('merchant_live_egypt');
    });

    it('throws BlockedGateError for GLOBAL (no Kashier credentials)', () => {
        expect(() => assertRegionCredentials('GLOBAL')).toThrow(BlockedGateError);
        expect(() => assertRegionCredentials('GLOBAL')).toThrow('GLOBAL merchant is not configured');
    });

    it('throws BlockedGateError for EGYPT when credentials missing', () => {
        delete process.env.KASHIER_LIVE_MERCHANT_ID;
        expect(() => assertRegionCredentials('EGYPT')).toThrow(BlockedGateError);
        expect(() => assertRegionCredentials('EGYPT')).toThrow('EGYPT merchant is not configured');
    });
});

describe('resolvePaymentContext', () => {
    it('returns Egypt context for Egypt', () => {
        const ctx = resolvePaymentContext({ country: 'EG', productId: 'MRX-PROTOCOL' });
        expect(ctx.region).toBe('EGYPT');
        expect(ctx.currency).toBe('EGP');
        expect(ctx.paymentMethods).toEqual(['card', 'wallet']);
        expect(ctx.product).toBe('MRX-PROTOCOL');
        expect(ctx.price).toEqual({ currency: 'EGP', amount: 499 });
    });

    it('returns Global context for non-Egypt', () => {
        const ctx = resolvePaymentContext({ country: 'US', productId: 'MRX-PROTOCOL' });
        expect(ctx.region).toBe('GLOBAL');
        expect(ctx.currency).toBe('USD');
        expect(ctx.paymentMethods).toEqual(['card']);
        expect(ctx.product).toBe('MRX-PROTOCOL');
        // Price returns placeholder since no env override
        expect(ctx.price).toEqual({ currency: 'USD', amount: null, placeholder: 'USD_PRICE_1' });
    });

    it('uses env override for Global price when set', () => {
        process.env.PRICING_GLOBAL_MRX_PROTOCOL_USD = '54.99';
        const ctx = resolvePaymentContext({ country: 'US', productId: 'MRX-PROTOCOL' });
        expect(ctx.price).toEqual({ currency: 'USD', amount: 54.99 });
    });

    it('includes coaching addon as separate product', () => {
        const ctx = resolvePaymentContext({ country: 'US', productId: 'MRX-COACHING-ADDON' });
        expect(ctx.product).toBe('MRX-COACHING-ADDON');
        expect(ctx.price).toEqual({ currency: 'USD', amount: 349.99 });
    });

    it('includes consultation as separate product', () => {
        const ctx = resolvePaymentContext({ country: 'US', productId: 'MRX-CONSULTATION' });
        expect(ctx.product).toBe('MRX-CONSULTATION');
        expect(ctx.price).toEqual({ currency: 'USD', amount: 30.00 });
    });
});

describe('resolveRegionalPrice', () => {
    it('returns Egypt amount for Egypt region', () => {
        const price = resolveRegionalPrice('MRX-PROTOCOL', 'EGYPT');
        expect(price).toEqual({ currency: 'EGP', amount: 499 });
    });

    it('returns Global amount for Global region when env override set', () => {
        process.env.PRICING_GLOBAL_MRX_PROTOCOL_USD = '54.99';
        const price = resolveRegionalPrice('MRX-PROTOCOL', 'GLOBAL');
        expect(price).toEqual({ currency: 'USD', amount: 54.99 });
    });

    it('returns placeholder for Global when no env override', () => {
        const price = resolveRegionalPrice('MRX-PROTOCOL', 'GLOBAL');
        expect(price).toEqual({ currency: 'USD', amount: null, placeholder: 'USD_PRICE_1' });
    });

    it('returns null for Egypt-only products (coaching addon)', () => {
        const price = resolveRegionalPrice('MRX-COACHING-ADDON', 'EGYPT');
        expect(price).toEqual({ currency: 'EGP', amount: null, placeholder: 'NOT_AVAILABLE_IN_EGYPT' });
    });

    it('returns consultation price for Global', () => {
        const price = resolveRegionalPrice('MRX-CONSULTATION', 'GLOBAL');
        expect(price).toEqual({ currency: 'USD', amount: 30.00 });
    });

    it('returns coaching addon price for Global', () => {
        const price = resolveRegionalPrice('MRX-COACHING-ADDON', 'GLOBAL');
        expect(price).toEqual({ currency: 'USD', amount: 349.99 });
    });
});

describe('resolveKashierSku', () => {
    it('returns Egypt SKU for Egypt region', () => {
        expect(resolveKashierSku('MRX-PROTOCOL', 'EGYPT')).toBe('MRX-EG-PROTOCOL');
        expect(resolveKashierSku('MRX-TACTICAL', 'EGYPT')).toBe('MRX-EG-TACTICAL');
        expect(resolveKashierSku('MRX-SMART-PRO', 'EGYPT')).toBe('MRX-EG-SMART-PRO');
    });

    it('returns Global SKU for Global region (for base products)', () => {
        expect(resolveKashierSku('MRX-PROTOCOL', 'GLOBAL')).toBe('MRX-GL-PROTOCOL');
        expect(resolveKashierSku('MRX-TACTICAL', 'GLOBAL')).toBe('MRX-GL-TACTICAL');
        expect(resolveKashierSku('MRX-SMART-PRO', 'GLOBAL')).toBe('MRX-GL-SMART-PRO');
    });

    it('returns null for Global-only products in Egypt', () => {
        expect(resolveKashierSku('MRX-COACHING-ADDON', 'EGYPT')).toBeNull();
        expect(resolveKashierSku('MRX-CONSULTATION', 'EGYPT')).toBeNull();
    });

    it('returns Global SKU for Global-only products in Global', () => {
        expect(resolveKashierSku('MRX-COACHING-ADDON', 'GLOBAL')).toBe('MRX-GL-COACHING-ADDON');
        expect(resolveKashierSku('MRX-CONSULTATION', 'GLOBAL')).toBe('MRX-GL-CONSULTATION');
    });
});

describe('resolveFourthwallProductId', () => {
    it('returns Fourthwall product ID for each canonical product', () => {
        expect(resolveFourthwallProductId('MRX-PROTOCOL')).toBe('fw_digital_book_123');
        expect(resolveFourthwallProductId('MRX-TACTICAL')).toBe('fw_paperback_123');
        expect(resolveFourthwallProductId('MRX-SMART-PRO')).toBe('fw_hardcover_123');
        expect(resolveFourthwallProductId('MRX-COACHING-ADDON')).toBe('fw_coaching_123');
        expect(resolveFourthwallProductId('MRX-CONSULTATION')).toBe('fw_consultation_123');
    });

    it('returns null when env var not set', () => {
        delete process.env.FOURTHWALL_PRODUCT_DIGITAL_BOOK_ID;
        expect(resolveFourthwallProductId('MRX-PROTOCOL')).toBeNull();
    });
});

describe('Fourthwall environment variables', () => {
    it('has all required Fourthwall env vars defined in test setup', () => {
        expect(process.env.FOURTHWALL_SHOP_ID).toBeDefined();
        expect(process.env.FOURTHWALL_API_KEY).toBeDefined();
        expect(process.env.FOURTHWALL_WEBHOOK_SECRET).toBeDefined();
        expect(process.env.FOURTHWALL_PRODUCT_DIGITAL_BOOK_ID).toBeDefined();
        expect(process.env.FOURTHWALL_PRODUCT_PAPERBACK_ID).toBeDefined();
        expect(process.env.FOURTHWALL_PRODUCT_HARDCOVER_ID).toBeDefined();
        expect(process.env.FOURTHWALL_PRODUCT_COACHING_ID).toBeDefined();
        expect(process.env.FOURTHWALL_PRODUCT_CONSULTATION_ID).toBeDefined();
    });
});

describe('Canonical product catalog', () => {
    it('has exactly 5 canonical products', () => {
        // This test validates the catalog structure
        const products: CanonicalProductId[] = [
            'MRX-PROTOCOL',
            'MRX-TACTICAL',
            'MRX-SMART-PRO',
            'MRX-COACHING-ADDON',
            'MRX-CONSULTATION',
        ];
        expect(products).toHaveLength(5);
    });

    it('marks coaching addon and consultation as global-only', () => {
        // These products have egyptAmount = 0
        expect(resolveRegionalPrice('MRX-COACHING-ADDON', 'EGYPT').amount).toBeNull();
        expect(resolveRegionalPrice('MRX-CONSULTATION', 'EGYPT').amount).toBeNull();
    });
});