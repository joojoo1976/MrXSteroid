import { describe, it, expect, afterEach } from 'vitest';
import {
    buildKashierSessionRequest,
    KASHIER_SESSION_REQUIRED_FIELDS,
    DEFAULT_MAX_FAILURE_ATTEMPTS,
    DEFAULT_SESSION_TTL_MINUTES,
} from '../../server/payments/checkout/sessionRequest';

const base = () => ({
    merchantId: 'MID-TEST-EG',
    orderRef: 'inv-abc-123',
    amount: 499,
    currency: 'EGP',
    merchantRedirect: 'https://www.mrxsteroid.com/api/payments/callback?txn=inv-abc-123',
    serverWebhook: 'https://www.mrxsteroid.com/api/payments/webhook',
    customer: { name: 'Buyer', email: 'buyer@example.com' },
});

describe('buildKashierSessionRequest — K-2 C4/C6 session contract', () => {
    const originalEnv = { ...process.env };
    afterEach(() => { process.env = { ...originalEnv }; });

    it('includes all 10 required fields + serverWebhook', () => {
        const req = buildKashierSessionRequest(base());
        for (const field of KASHIER_SESSION_REQUIRED_FIELDS) {
            expect(req).toHaveProperty(field);
        }
        expect(req).toHaveProperty('serverWebhook');
    });

    it('sends the order reference in the `order` field and amount as a 2dp string', () => {
        const req = buildKashierSessionRequest({ ...base(), amount: 10848 });
        expect(req.order).toBe('inv-abc-123');
        expect(req.amount).toBe('10848.00');
        // The obsolete `orderId` field must never be emitted.
        expect(req).not.toHaveProperty('orderId');
    });

    it('uppercases currency and defaults to one-time with a TTL/maxFailureAttempts', () => {
        const before = Date.now();
        const req = buildKashierSessionRequest({ ...base(), currency: 'egp' });
        expect(req.currency).toBe('EGP');
        expect(req.type).toBe('one-time');
        expect(req.maxFailureAttempts).toBe(DEFAULT_MAX_FAILURE_ATTEMPTS);
        const expire = new Date(req.expireAt).getTime();
        expect(expire).toBeGreaterThan(before);
        expect(expire).toBeLessThanOrEqual(before + (DEFAULT_SESSION_TTL_MINUTES + 1) * 60_000);
    });

    it('derives allowedMethods/defaultMethod from the resolved region methods', () => {
        const req = buildKashierSessionRequest({ ...base(), paymentMethods: ['card', 'wallet'], defaultMethod: 'card' });
        expect(req.allowedMethods).toBe('card,wallet');
        expect(req.defaultMethod).toBe('card');
    });

    it('falls back to card when no methods are supplied', () => {
        const req = buildKashierSessionRequest({ ...base(), paymentMethods: [] });
        expect(req.allowedMethods).toBe('card');
        expect(req.defaultMethod).toBe('card');
    });

    it('honours a defaultMethod override only when it is in the method list', () => {
        const req = buildKashierSessionRequest({ ...base(), paymentMethods: ['card'], defaultMethod: 'wallet' });
        expect(req.defaultMethod).toBe('card');
    });

    it('uses the locale for display', () => {
        expect(buildKashierSessionRequest({ ...base(), display: 'ar' }).display).toBe('ar');
        expect(buildKashierSessionRequest(base()).display).toBe('en');
    });

    it.each([
        ['merchantId', { merchantId: '' }],
        ['orderRef', { orderRef: '' }],
        ['amount', { amount: 0 }],
        ['currency', { currency: '' }],
        ['merchantRedirect', { merchantRedirect: '' }],
        ['serverWebhook', { serverWebhook: '' }],
    ])('rejects invalid %s', (_label, patch) => {
        expect(() => buildKashierSessionRequest({ ...base(), ...patch })).toThrow();
    });

    it('rejects a customer without name/email', () => {
        expect(() => buildKashierSessionRequest({ ...base(), customer: { name: '', email: '' } })).toThrow();
    });
});
