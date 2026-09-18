import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import {
    BlockedGateError,
    getMerchantConfig,
    resolveRegion,
    resolvePaymentContext,
    resolveRegionalPrice,
    resolveKashierSku,
    CANONICAL_PRODUCTS,
} from '../../server/payments/merchantResolver';
import { KashierGateway } from '../../server/payments/gateways/KashierGateway';
import type { VercelRequest } from '../../server/payments/gateways/vercel-types';

describe('Merchant Resolver — v5.1 §4.1 + §51', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_TEST_MERCHANT_ID = 'MID-TEST-EG';
        process.env.KASHIER_TEST_PAYMENT_API_KEY = 'test-api-key-123';
        process.env.KASHIER_TEST_SECRET_KEY = 'test-secret-key-456';
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it('resolves Egypt merchant config from mode-prefix env', () => {
        const cfg = getMerchantConfig('EGYPT');
        expect(cfg.region).toBe('EGYPT');
        expect(cfg.merchantType).toBe('egypt');
        expect(cfg.merchantId).toBe('MID-TEST-EG');
        expect(cfg.currency).toBe('EGP');
        expect(cfg.mode).toBe('test');
        expect(cfg.paymentMethods).toEqual(['card', 'wallet']);
        expect(cfg.defaultMethod).toBe('card');
        expect(cfg.secrets.paymentApiKey.primary).toBe('test-api-key-123');
        expect(cfg.secrets.secretKey.primary).toBe('test-secret-key-456');
        expect(cfg.webhookUrl).toContain('/api/payments/webhook');
    });

    it('resolves Global merchant config with USD and card only', () => {
        process.env.KASHIER_TEST_MERCHANT_ID = 'MID-TEST-GL';
        process.env.KASHIER_TEST_PAYMENT_API_KEY = 'gl-api-key';
        process.env.KASHIER_TEST_SECRET_KEY = 'gl-secret';
        const cfg = getMerchantConfig('GLOBAL');
        expect(cfg.merchantType).toBe('global');
        expect(cfg.currency).toBe('USD');
        expect(cfg.paymentMethods).toEqual(['card']);
        expect(cfg.defaultMethod).toBe('card');
    });

    it('falls back to legacy KASHIER_EGYPT_* env vars when mode-prefix vars are absent', () => {
        delete process.env.KASHIER_TEST_MERCHANT_ID;
        delete process.env.KASHIER_TEST_PAYMENT_API_KEY;
        delete process.env.KASHIER_TEST_SECRET_KEY;
        process.env.KASHIER_EGYPT_MERCHANT_ID = 'LEGACY-EG';
        process.env.KASHIER_EGYPT_PAYMENT_API_KEY = 'legacy-key';
        process.env.KASHIER_EGYPT_SECRET_KEY = 'legacy-secret';

        const cfg = getMerchantConfig('EGYPT');
        expect(cfg.merchantId).toBe('LEGACY-EG');
        expect(cfg.secrets.paymentApiKey.primary).toBe('legacy-key');
        expect(cfg.secrets.secretKey.primary).toBe('legacy-secret');
    });

    it('supports PRIMARY/SECONDARY secret rotation through mode-prefix env (v5.1 §4.4)', () => {
        process.env.KASHIER_TEST_PAYMENT_API_KEY_SECONDARY = 'test-api-key-secondary';
        process.env.KASHIER_TEST_SECRET_KEY_SECONDARY = 'test-secret-key-secondary';

        const cfg = getMerchantConfig('EGYPT');
        expect(cfg.secrets.paymentApiKey.primary).toBe('test-api-key-123');
        expect(cfg.secrets.paymentApiKey.secondary).toBe('test-api-key-secondary');
        expect(cfg.secrets.secretKey.primary).toBe('test-secret-key-456');
        expect(cfg.secrets.secretKey.secondary).toBe('test-secret-key-secondary');
    });

    it('supports PRIMARY/SECONDARY rotation via legacy env vars', () => {
        delete process.env.KASHIER_TEST_PAYMENT_API_KEY;
        delete process.env.KASHIER_TEST_SECRET_KEY;
        process.env.KASHIER_EGYPT_PAYMENT_API_KEY = 'legacy-primary';
        process.env.KASHIER_EGYPT_PAYMENT_API_KEY_SECONDARY = 'legacy-secondary';
        process.env.KASHIER_EGYPT_SECRET_KEY = 'legacy-secret-primary';
        process.env.KASHIER_EGYPT_SECRET_KEY_SECONDARY = 'legacy-secret-secondary';

        const cfg = getMerchantConfig('EGYPT');
        expect(cfg.secrets.paymentApiKey.primary).toBe('legacy-primary');
        expect(cfg.secrets.paymentApiKey.secondary).toBe('legacy-secondary');
        expect(cfg.secrets.secretKey.secondary).toBe('legacy-secret-secondary');
    });

    it('resolves region from country/hint — only explicit Egypt signals map to EGYPT', () => {
        expect(resolveRegion({ country: 'EG' })).toBe('EGYPT');
        expect(resolveRegion({ country: 'egypt' })).toBe('EGYPT');
        expect(resolveRegion({ regionHint: 'مصر' })).toBe('EGYPT');
        expect(resolveRegion({ country: 'SA' })).toBe('GLOBAL');
        expect(resolveRegion({})).toBe('GLOBAL');
    });

    it('resolvePaymentContext returns authoritative server-side context (v5.1 §51)', () => {
        const ctx = resolvePaymentContext({ country: 'EG', productId: 'MRX-SMART-PRO' });
        expect(ctx.region).toBe('EGYPT');
        expect(ctx.currency).toBe('EGP');
        expect(ctx.paymentMethods).toEqual(['card', 'wallet']);
        expect(ctx.merchant.merchantId).toBe('MID-TEST-EG');
        expect(ctx.product).toBe('MRX-SMART-PRO');
        expect(ctx.price?.amount).toBe(10_848);
        expect(ctx.price?.currency).toBe('EGP');
    });

    it('resolvePaymentContext without product omit price artifacts', () => {
        const ctx = resolvePaymentContext({ regionHint: 'AE' });
        expect(ctx.region).toBe('GLOBAL');
        expect(ctx.product).toBeUndefined();
        expect(ctx.price).toBeUndefined();
    });

    it('Egypt prices are authoritative from the canonical catalog (v5.1 §30)', () => {
        expect(resolveRegionalPrice('MRX-PROTOCOL', 'EGYPT').amount).toBe(499);
        expect(resolveRegionalPrice('MRX-TACTICAL', 'EGYPT').amount).toBe(749);
        expect(resolveRegionalPrice('MRX-SMART-PRO', 'EGYPT').amount).toBe(10_848);
    });

    it('GLOBAL never invents a USD price — returns placeholder until officially set', () => {
        const price = resolveRegionalPrice('MRX-PROTOCOL', 'GLOBAL');
        expect(price.currency).toBe('USD');
        expect(price.amount).toBeNull();
        expect(price.placeholder).toBe('USD_PRICE_1');
    });

    it('GLOBAL price honors an official env override', () => {
        process.env.PRICING_GLOBAL_MRX_PROTOCOL_USD = '250';
        const price = resolveRegionalPrice('MRX-PROTOCOL', 'GLOBAL');
        expect(price.amount).toBe(250);
        expect(price.placeholder).toBeUndefined();
    });

    it('maps canonical products to Kashier SKUs (v5.1 §31)', () => {
        expect(resolveKashierSku('MRX-PROTOCOL', 'EGYPT')).toBe('MRX-EG-PROTOCOL');
        expect(resolveKashierSku('MRX-TACTICAL', 'EGYPT')).toBe('MRX-EG-TACTICAL');
        expect(resolveKashierSku('MRX-SMART-PRO', 'GLOBAL')).toBe('MRX-GL-SMART-PRO');
    });

    it('exposes exactly three canonical products', () => {
        expect(Object.keys(CANONICAL_PRODUCTS).sort()).toEqual(['MRX-PROTOCOL', 'MRX-SMART-PRO', 'MRX-TACTICAL']);
    });

    it('BlockedGateError carries the exact blocked item (v5.1 §2)', () => {
        const err = new BlockedGateError('N-13 KASHIER_LIVE_ENABLED', 'detail');
        expect(err.name).toBe('BlockedGateError');
        expect(err.message).toContain('N-13 KASHIER_LIVE_ENABLED');
    });

    it('accepts a mixed-case KASHIER_MODE (e.g. "Live") and reads KASHIER_LIVE_* vars', () => {
        process.env.KASHIER_MODE = 'Live';
        process.env.KASHIER_LIVE_MERCHANT_ID = 'MID-48761-625';
        process.env.KASHIER_LIVE_PAYMENT_API_KEY = 'live-key';
        process.env.KASHIER_LIVE_SECRET_KEY = 'live-secret';
        delete process.env.KASHIER_TEST_MERCHANT_ID;
        delete process.env.KASHIER_TEST_PAYMENT_API_KEY;
        delete process.env.KASHIER_TEST_SECRET_KEY;

        const cfg = getMerchantConfig('EGYPT');
        expect(cfg.mode).toBe('live');
        expect(cfg.merchantId).toBe('MID-48761-625');
        expect(cfg.secrets.paymentApiKey.primary).toBe('live-key');
        expect(cfg.secrets.secretKey.primary).toBe('live-secret');
    });

    it('honours a region-specific webhook URL env override', () => {
        process.env.KASHIER_EGYPT_WEBHOOK_URL = 'https://custom.example.com/kashier-hook';
        const cfg = getMerchantConfig('EGYPT');
        expect(cfg.webhookUrl).toBe('https://custom.example.com/kashier-hook');
    });

    it('keeps the GLOBAL merchant distinct from the shared mode-prefix (Egypt) MID', () => {
        // Owner-style live layout: mode-prefix MID is the EGYPT account;
        // the GLOBAL account only exists via the legacy KASHIER_GLOBAL_* vars.
        process.env.KASHIER_MODE = 'Live';
        process.env.KASHIER_LIVE_MERCHANT_ID = 'MID-48761-625';
        process.env.KASHIER_LIVE_PAYMENT_API_KEY = 'eg-live-key';
        process.env.KASHIER_LIVE_SECRET_KEY = 'eg-live-secret';
        process.env.KASHIER_GLOBAL_MERCHANT_ID = 'MID-GLOBAL-ACCOUNT';
        process.env.KASHIER_GLOBAL_PAYMENT_API_KEY = 'gl-key';
        process.env.KASHIER_GLOBAL_SECRET_KEY = 'gl-secret';
        delete process.env.KASHIER_TEST_MERCHANT_ID;
        delete process.env.KASHIER_TEST_PAYMENT_API_KEY;
        delete process.env.KASHIER_TEST_SECRET_KEY;

        const egypt = getMerchantConfig('EGYPT');
        const global = getMerchantConfig('GLOBAL');
        expect(egypt.merchantId).toBe('MID-48761-625');
        expect(global.merchantId).toBe('MID-GLOBAL-ACCOUNT');
        expect(global.secrets.paymentApiKey.primary).toBe('gl-key');
        expect(global.webhookUrl).toContain('/api/payments/webhook');
    });
});

describe('KashierGateway — rotation integration (v5.1 §4.4 + N-13)', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_TEST_MERCHANT_ID = 'MID-TEST-EG';
        process.env.KASHIER_TEST_PAYMENT_API_KEY = 'primary-api-key';
        process.env.KASHIER_TEST_PAYMENT_API_KEY_SECONDARY = 'secondary-api-key';
        process.env.KASHIER_TEST_SECRET_KEY = 'primary-secret-key';
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it('verifies webhook signed with the SECONDARY Payment API Key during rotation', async () => {
        const gateway = new KashierGateway('egypt');
        const payload: Record<string, string> = {
            orderId: 'inv-rot-01',
            merchantId: 'MID-TEST-EG',
            amount: '100.00',
            currency: 'EGP',
            orderStatus: 'SUCCESS',
            reconcilation: 'OK',
            transactionId: 'tx-rot-01',
            signatureKeys: 'amount,currency,merchantId,orderId,orderStatus,reconcilation,transactionId',
        };
        const sortedKeys = payload.signatureKeys.split(',').sort();
        const input = sortedKeys.map(k => `${k}=${payload[k]}`).join('&');
        payload.signature = crypto.createHmac('sha256', 'secondary-api-key').update(input).digest('hex');

        const req = { headers: {}, query: {} } as unknown as VercelRequest;
        const result = await gateway.verifyWebhook(req, JSON.stringify(payload));
        expect(result.valid).toBe(true);
        expect(result.status).toBe('success');
    });

    it('still verifies webhook signed with the PRIMARY Payment API Key', async () => {
        const gateway = new KashierGateway('egypt');
        const payload: Record<string, string> = {
            orderId: 'inv-rot-02',
            merchantId: 'MID-TEST-EG',
            amount: '200.00',
            currency: 'EGP',
            orderStatus: 'SUCCESS',
            reconcilation: 'OK',
            transactionId: 'tx-rot-02',
            signatureKeys: 'amount,currency,merchantId,orderId,orderStatus,reconcilation,transactionId',
        };
        const sortedKeys = payload.signatureKeys.split(',').sort();
        const input = sortedKeys.map(k => `${k}=${payload[k]}`).join('&');
        payload.signature = crypto.createHmac('sha256', 'primary-api-key').update(input).digest('hex');

        const req = { headers: {}, query: {} } as unknown as VercelRequest;
        const result = await gateway.verifyWebhook(req, JSON.stringify(payload));
        expect(result.valid).toBe(true);
        expect(result.invoiceId).toBe('inv-rot-02');
    });

    it('live mode blocked by owner kill switch raises BlockedGateError (N-13)', async () => {
        process.env.KASHIER_MODE = 'live';
        process.env.KASHIER_LIVE_MERCHANT_ID = 'MID-LIVE-EG';
        process.env.KASHIER_LIVE_PAYMENT_API_KEY = 'live-key';
        process.env.KASHIER_LIVE_SECRET_KEY = 'live-secret';
        delete process.env.KASHIER_LIVE_ENABLED;

        const gateway = new KashierGateway('egypt');
        await expect(gateway.createPaymentSession({
            orderRef: 'inv-live-01',
            amount: 100,
            currency: 'EGP',
        })).rejects.toThrow(BlockedGateError);
    });
});