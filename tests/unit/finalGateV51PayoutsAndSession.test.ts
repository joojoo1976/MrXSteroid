import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { verifyKashierPayoutWebhookSignature } from '../../server/payments/payoutWebhookVerifier';
import { NextRequest } from 'next/server';
import { POST as postPayoutWebhook } from '../../app/api/payouts/webhook/route';
import { POST as postPaymentSession } from '../../app/api/payments/create-session/route';
import { createTransfer } from '../../lib/kashier/payouts/create-transfer';

describe('Final Gate v5.1 — Payout Webhook & Canonical Session Integration', () => {
    const transferKey = 'transfer_sec_key_test_9988';

    describe('1. Payout Webhook Signature Verification (§61.2)', () => {
        it('verifies signature preserving exact signatureKeys order without URL-encoding', () => {
            const payload = {
                transferId: 'TX-9901',
                amount: '500.00',
                currency: 'EGP',
                status: 'TRANSFERRED',
            };
            const signatureKeys = ['transferId', 'amount', 'currency', 'status'];
            const dataString = signatureKeys.map(k => `${k}=${payload[k as keyof typeof payload]}`).join('&');
            const signature = crypto.createHmac('sha256', transferKey).update(dataString).digest('hex');

            const isValid = verifyKashierPayoutWebhookSignature({
                signatureKeys,
                payload,
                signature,
                transferApiKey: transferKey,
            });

            expect(isValid).toBe(true);
        });

        it('rejects signature when keys order is altered or tampered with', () => {
            const payload = {
                transferId: 'TX-9901',
                amount: '500.00',
                currency: 'EGP',
                status: 'TRANSFERRED',
            };
            const signatureKeys = ['status', 'currency', 'amount', 'transferId']; // altered order
            const signature = crypto.createHmac('sha256', transferKey).update('tampered').digest('hex');

            const isValid = verifyKashierPayoutWebhookSignature({
                signatureKeys,
                payload,
                signature,
                transferApiKey: transferKey,
            });

            expect(isValid).toBe(false);
        });
    });

    describe('2. Canonical POST /api/payments/create-session (§62.1)', () => {
        it('validates required product or tier parameters', async () => {
            const req = new NextRequest('http://localhost:3000/api/payments/create-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@example.com', fullName: 'Test User' }),
            });

            const res = await postPaymentSession(req);
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.error).toContain('Either productId');
        });
    });
});
