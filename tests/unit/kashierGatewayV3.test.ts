import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';
import { KashierGateway, KashierSessionError } from '../../server/payments/gateways/KashierGateway';
import { KASHIER_SESSION_REQUIRED_FIELDS } from '../../server/payments/checkout/sessionRequest';
import type { VercelRequest } from '../../server/payments/gateways/vercel-types';

describe('KashierGateway v3.1 Integration & Verification', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_TEST_MERCHANT_ID = 'MID-TEST-EG';
        process.env.KASHIER_TEST_PAYMENT_API_KEY = 'test-api-key-123';
        process.env.KASHIER_TEST_SECRET_KEY = 'test-secret-key-456';
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        vi.restoreAllMocks();
    });

    it('initializes with test credentials and mode test', () => {
        const gateway = new KashierGateway('egypt');
        expect(gateway.config.mode).toBe('test');
        expect(gateway.config.merchantId).toBe('MID-TEST-EG');
        expect(gateway.getGatewayName()).toBe('KASHIER_EGYPT');
    });

    it('mints a Payment Session with the raw Secret Key auth contract and all K-2 C4 fields', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(
            JSON.stringify({ sessionId: 'sess-101', sessionUrl: 'https://checkout.kashier.io/s/101' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        ));
        vi.stubGlobal('fetch', fetchMock);

        const gateway = new KashierGateway('egypt');
        const session = await gateway.createPaymentSession({
            orderRef: 'inv-test-101',
            amount: 150.0,
            currency: 'EGP',
            customerEmail: 'buyer@example.com',
            customerName: 'Test Buyer',
            locale: 'ar',
        });

        expect(session.sessionUrl).toBe('https://checkout.kashier.io/s/101');
        expect(session.sessionId).toBe('sess-101');

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://test-api.kashier.io/v3/payment/sessions');
        // K-2 A2: raw Secret Key — NOT a Bearer token.
        expect(init.headers.Authorization).toBe('test-secret-key-456');
        expect(init.headers.Authorization).not.toContain('Bearer');
        // K-2 A3
        expect(init.headers['api-key']).toBe('test-api-key-123');

        const payload = JSON.parse(init.body);
        for (const field of KASHIER_SESSION_REQUIRED_FIELDS) {
            expect(payload).toHaveProperty(field);
        }
        expect(payload.order).toBe('inv-test-101');
        expect(payload.amount).toBe('150.00');
        expect(payload.currency).toBe('EGP');
        expect(payload.display).toBe('ar');
        expect(payload.serverWebhook).toContain('/api/payments/webhook');
        expect(payload.allowedMethods).toBe('card,wallet');

        vi.unstubAllGlobals();
    });

    it('never falls back to a hardcoded payment URL — throws KashierSessionError on API failure', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 500 })));

        const gateway = new KashierGateway('egypt');
        await expect(gateway.createPaymentSession({
            orderRef: 'inv-test-500',
            amount: 99,
            currency: 'EGP',
        })).rejects.toThrow(KashierSessionError);

        vi.unstubAllGlobals();
    });

    it('successfully verifies authentic Kashier webhook with sorted signatureKeys and reconcilation=OK', async () => {
        const gateway = new KashierGateway('egypt');
        const apiKey = 'test-api-key-123';

        const payload: Record<string, string> = {
            orderId: 'inv-test-202',
            merchantId: 'MID-TEST-EG',
            amount: '100.00',
            currency: 'EGP',
            orderStatus: 'SUCCESS',
            reconcilation: 'OK',
            transactionId: 'tx-kashier-999',
            signatureKeys: 'amount,currency,merchantId,orderId,orderStatus,reconcilation,transactionId',
        };

        // Sort keys and compute HMAC
        const sortedKeys = payload.signatureKeys.split(',').sort();
        const signatureInput = sortedKeys.map(k => `${k}=${payload[k]}`).join('&');
        const signature = crypto.createHmac('sha256', apiKey).update(signatureInput).digest('hex');

        payload.signature = signature;
        const rawBody = JSON.stringify(payload);

        const mockReq = { headers: {}, query: {} } as unknown as VercelRequest;
        const result = await gateway.verifyWebhook(mockReq, rawBody);

        expect(result.valid).toBe(true);
        expect(result.status).toBe('success');
        expect(result.detailedStatus).toBe('APPROVED');
        expect(result.invoiceId).toBe('inv-test-202');
        expect(result.paidAmount).toBe(100.0);
    });

    it('rejects webhook if merchant ID belongs to a different account (cross-account protection)', async () => {
        const gateway = new KashierGateway('egypt');
        const payload = {
            orderId: 'inv-test-303',
            merchantId: 'MID-OTHER-ACCOUNT',
            signature: 'abc',
            signatureKeys: 'merchantId,orderId',
        };

        const result = await gateway.verifyWebhook({} as VercelRequest, JSON.stringify(payload));
        expect(result.valid).toBe(false);
        expect(result.errorMessage).toContain('Merchant ID mismatch');
    });

    it('rejects webhook if HMAC signature is tampered', async () => {
        const gateway = new KashierGateway('egypt');
        const payload = {
            orderId: 'inv-test-404',
            merchantId: 'MID-TEST-EG',
            amount: '500.00',
            signature: 'deadbeef1234567890',
            signatureKeys: 'amount,merchantId,orderId',
        };

        const result = await gateway.verifyWebhook({} as VercelRequest, JSON.stringify(payload));
        expect(result.valid).toBe(false);
        expect(result.errorMessage).toContain('HMAC signature verification failed');
    });
});
