import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    getMerchantConfig,
    assertRegionCredentials,
    resolveRegion,
    BlockedGateError,
    GATEWAY_NOT_AVAILABLE,
} from '../../server/payments/merchantResolver';
import { extractProviderSessionId } from '../../server/payments/gateways/KashierGateway';

describe('Kashier regional credential isolation', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_TEST_MERCHANT_ID = 'MID-EGYPT-TEST';
        process.env.KASHIER_TEST_PAYMENT_API_KEY = 'eg-test-api-key';
        process.env.KASHIER_TEST_SECRET_KEY = 'eg-test-secret';
        delete process.env.KASHIER_GLOBAL_MERCHANT_ID;
        delete process.env.KASHIER_GLOBAL_PAYMENT_API_KEY;
        delete process.env.KASHIER_GLOBAL_SECRET_KEY;
        delete process.env.KASHIER_EGYPT_MERCHANT_ID;
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        vi.restoreAllMocks();
    });

    it('resolves EGYPT to the Egypt merchant and EGP', () => {
        const config = getMerchantConfig('EGYPT');
        expect(config.merchantId).toBe('MID-EGYPT-TEST');
        expect(config.currency).toBe('EGP');
        expect(config.merchantType).toBe('egypt');
    });

    it('never answers a GLOBAL request with the Egypt merchant', () => {
        const config = getMerchantConfig('GLOBAL');
        expect(config.merchantId).toBe('');
        expect(config.secrets.paymentApiKey.primary).toBe('');
        expect(config.secrets.secretKey.primary).toBe('');
    });

    it('never answers a GLOBAL request with the Egypt API or secret keys', () => {
        const config = getMerchantConfig('GLOBAL');
        expect(config.secrets.paymentApiKey.primary).not.toBe('eg-test-api-key');
        expect(config.secrets.secretKey.primary).not.toBe('eg-test-secret');
    });

    it('uses the dedicated GLOBAL merchant when it is configured', () => {
        process.env.KASHIER_GLOBAL_MERCHANT_ID = 'MID-GLOBAL-TEST';
        process.env.KASHIER_GLOBAL_PAYMENT_API_KEY = 'gl-test-api-key';
        process.env.KASHIER_GLOBAL_SECRET_KEY = 'gl-test-secret';

        const config = getMerchantConfig('GLOBAL');
        expect(config.merchantId).toBe('MID-GLOBAL-TEST');
        expect(config.secrets.paymentApiKey.primary).toBe('gl-test-api-key');
        expect(config.secrets.secretKey.primary).toBe('gl-test-secret');
        expect(config.currency).toBe('USD');
    });

    it('still allows an Egypt legacy prefix to serve the Egypt merchant', () => {
        delete process.env.KASHIER_TEST_MERCHANT_ID;
        process.env.KASHIER_EGYPT_MERCHANT_ID = 'MID-EGYPT-LEGACY';
        expect(getMerchantConfig('EGYPT').merchantId).toBe('MID-EGYPT-LEGACY');
    });

    it('fails closed with GATEWAY_NOT_AVAILABLE when GLOBAL is unconfigured', () => {
        expect(() => assertRegionCredentials('GLOBAL')).toThrow(BlockedGateError);
        try {
            assertRegionCredentials('GLOBAL');
            throw new Error('expected assertRegionCredentials to throw');
        } catch (err) {
            expect(err).toBeInstanceOf(BlockedGateError);
            expect((err as BlockedGateError).code).toBe(GATEWAY_NOT_AVAILABLE);
            expect((err as BlockedGateError).blockedItem).toBe('GATEWAY_NOT_AVAILABLE');
        }
    });

    it('names every missing slot in the gate detail', () => {
        try {
            assertRegionCredentials('GLOBAL');
            throw new Error('expected assertRegionCredentials to throw');
        } catch (err) {
            const message = (err as Error).message;
            expect(message).toContain('MERCHANT_ID');
            expect(message).toContain('PAYMENT_API_KEY');
            expect(message).toContain('SECRET_KEY');
        }
    });

    it('passes the gate for a fully configured Egypt merchant', () => {
        expect(() => assertRegionCredentials('EGYPT')).not.toThrow();
        expect(assertRegionCredentials('EGYPT').merchantId).toBe('MID-EGYPT-TEST');
    });

    it('fails closed in live mode too when GLOBAL is unconfigured', () => {
        process.env.KASHIER_MODE = 'live';
        process.env.KASHIER_LIVE_MERCHANT_ID = 'MID-EGYPT-LIVE';
        process.env.KASHIER_LIVE_PAYMENT_API_KEY = 'eg-live-api-key';
        process.env.KASHIER_LIVE_SECRET_KEY = 'eg-live-secret';

        expect(getMerchantConfig('GLOBAL').merchantId).toBe('');
        expect(() => assertRegionCredentials('GLOBAL')).toThrow(BlockedGateError);
    });

    it('routes only Egypt country hints to the Egypt merchant', () => {
        expect(resolveRegion({ country: 'EG' })).toBe('EGYPT');
        expect(resolveRegion({ country: 'Egypt' })).toBe('EGYPT');
        expect(resolveRegion({ country: 'US' })).toBe('GLOBAL');
        expect(resolveRegion({})).toBe('GLOBAL');
    });
});

describe('Kashier provider session id extraction', () => {
    it('prefers an explicit sessionId field', () => {
        expect(extractProviderSessionId({ sessionId: 'sess_abc' }, 'https://payments.kashier.io/session/zzz'))
            .toBe('sess_abc');
    });

    it('accepts alternative id field names', () => {
        expect(extractProviderSessionId({ session_id: 'sess_def' }, 'https://payments.kashier.io/session/zzz'))
            .toBe('sess_def');
        expect(extractProviderSessionId({ paymentSessionId: 'sess_ghi' }, 'https://payments.kashier.io/session/zzz'))
            .toBe('sess_ghi');
        expect(extractProviderSessionId({ id: 'sess_jkl' }, 'https://payments.kashier.io/session/zzz'))
            .toBe('sess_jkl');
    });

    it('falls back to the identifier carried in the hosted session URL', () => {
        expect(extractProviderSessionId({}, 'https://payments.kashier.io/session/6ab8aba6863ed890bb4e631e'))
            .toBe('6ab8aba6863ed890bb4e631e');
    });

    it('returns null rather than inventing an identifier', () => {
        expect(extractProviderSessionId({}, '')).toBeNull();
        expect(extractProviderSessionId({}, 'not-a-url')).toBeNull();
        expect(extractProviderSessionId({ sessionId: '   ' }, 'https://payments.kashier.io/')).toBeNull();
    });

    it('never returns the application order reference', () => {
        const orderRef = 'cd82f7af-7390-4ff1-bd52-5e1c42e04609';
        const derived = extractProviderSessionId({}, `https://payments.kashier.io/session/${orderRef}`);
        expect(derived).toBe(orderRef);
        expect(extractProviderSessionId({ order: orderRef }, 'https://payments.kashier.io/session/abc'))
            .not.toBe(orderRef);
    });
});
