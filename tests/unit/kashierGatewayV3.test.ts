import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';
import { KashierGateway } from '../../server/payments/gateways/KashierGateway';
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

    it('generates a valid signed checkout redirect URL in createPaymentSession', async () => {
        // Mock fetch rejecting to trigger the signed fallback redirect
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline in unit test')));

        const gateway = new KashierGateway('egypt');
        const session = await gateway.createPaymentSession({
            orderId: 'inv-test-101',
            amount: 150.0,
            currency: 'EGP',
            customerEmail: 'buyer@example.com',
            customerName: 'Test Buyer',
        });

        expect(session.sessionUrl).toContain('checkout.kashier.io');
        expect(session.sessionUrl).toContain('merchantId=MID-TEST-EG');
        expect(session.sessionUrl).toContain('orderId=inv-test-101');
        expect(session.sessionUrl).toContain('amount=150.00');
        expect(session.sessionUrl).toContain('hash=');

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
