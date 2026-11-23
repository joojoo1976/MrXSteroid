import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';
import type { VercelRequest } from '../../server/payments/gateways/vercel-types';

/**
 * Gateway-level mapping tests for refund-like events.
 *
 * Handlers route on `refundKind`; if a gateway fails to set it, the event is
 * either treated as a failed payment (and swallowed) or silently ignored.
 */

const originalEnv = { ...process.env };

afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
});

// ─────────────────────────────────────────────────────────────────────────────
//  KASHIER
// ─────────────────────────────────────────────────────────────────────────────
function kashierSignedPayload(overrides: Record<string, string>): string {
    const base: Record<string, string> = {
        orderId: 'inv-test-refund',
        merchantId: 'MID-TEST-EG',
        amount: '499.00',
        currency: 'EGP',
        reconcilation: 'OK',
        transactionId: 'tx-refund-1',
        ...overrides,
    };
    const keys = Object.keys(base).sort();
    const signatureInput = keys.map((key) => `${key}=${base[key]}`).join('&');
    const payload: Record<string, string> = {
        ...base,
        signatureKeys: keys.join(','),
        signature: crypto.createHmac('sha256', 'test-api-key-123').update(signatureInput).digest('hex'),
    };
    return JSON.stringify(payload);
}

describe('Kashier — refund / void webhook mapping', () => {
    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_TEST_MERCHANT_ID = 'MID-TEST-EG';
        process.env.KASHIER_TEST_PAYMENT_API_KEY = 'test-api-key-123';
        process.env.KASHIER_TEST_SECRET_KEY = 'test-secret-key-456';
    });

    it('maps REFUNDED to refundKind=refund (not just a failed payment)', async () => {
        const { KashierGateway } = await import('../../server/payments/gateways/KashierGateway');
        const gateway = new KashierGateway('egypt');
        const rawBody = kashierSignedPayload({ orderStatus: 'REFUNDED' });

        const result = await gateway.verifyWebhook({ headers: {}, query: {} } as unknown as VercelRequest, rawBody);

        expect(result.valid).toBe(true);
        expect(result.detailedStatus).toBe('REFUNDED');
        expect(result.refundKind).toBe('refund');
        expect(result.refundAmount).toBe(499);
        expect(result.providerOperation).toBe('refund');
        expect(result.invoiceId).toBe('inv-test-refund');
    });

    it('maps VOIDED to refundKind=void', async () => {
        const { KashierGateway } = await import('../../server/payments/gateways/KashierGateway');
        const gateway = new KashierGateway('egypt');
        const rawBody = kashierSignedPayload({ orderStatus: 'VOIDED' });

        const result = await gateway.verifyWebhook({ headers: {}, query: {} } as unknown as VercelRequest, rawBody);

        expect(result.valid).toBe(true);
        expect(result.detailedStatus).toBe('VOIDED');
        expect(result.refundKind).toBe('void');
        expect(result.providerOperation).toBe('void');
    });

    it('does not mark a normal success as a refund', async () => {
        const { KashierGateway } = await import('../../server/payments/gateways/KashierGateway');
        const gateway = new KashierGateway('egypt');
        const rawBody = kashierSignedPayload({ orderStatus: 'SUCCESS' });

        const result = await gateway.verifyWebhook({ headers: {}, query: {} } as unknown as VercelRequest, rawBody);

        expect(result.refundKind).toBeUndefined();
        expect(result.providerOperation).toBe('pay');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  STRIPE (real SDK signature verification, no network)
// ─────────────────────────────────────────────────────────────────────────────
const STRIPE_SECRET = 'whsec_refund_test_secret';

function stripeHeader(payload: string, timestamp = Math.floor(Date.now() / 1000)): string {
    const signature = crypto
        .createHmac('sha256', STRIPE_SECRET)
        .update(`${timestamp}.${payload}`)
        .digest('hex');
    return `t=${timestamp},v1=${signature}`;
}

async function verifyStripeEvent(event: Record<string, unknown>) {
    process.env.STRIPE_SECRET_KEY = 'sk_test_refund_mapping';
    process.env.STRIPE_WEBHOOK_SECRET = STRIPE_SECRET;
    const { StripeGateway } = await import('../../server/payments/gateways/StripeGateway');
    const gateway = new StripeGateway();
    const rawBody = JSON.stringify(event);
    const req = {
        headers: { 'stripe-signature': stripeHeader(rawBody) },
        query: {},
    } as unknown as VercelRequest;
    return gateway.verifyWebhook(req, rawBody);
}

describe('Stripe — refund / dispute webhook mapping', () => {
    it('maps charge.refunded and reports the cumulative refunded amount', async () => {
        const result = await verifyStripeEvent({
            id: 'evt_refund_1',
            object: 'event',
            type: 'charge.refunded',
            data: {
                object: {
                    id: 'ch_1',
                    object: 'charge',
                    payment_intent: 'pi_1',
                    amount_refunded: 4990,
                    currency: 'usd',
                    metadata: { invoice_id: 'inv-stripe-1' },
                },
            },
        });

        expect(result.valid).toBe(true);
        expect(result.refundKind).toBe('refund');
        expect(result.refundAmount).toBe(49.9);
        expect(result.currency).toBe('USD');
        expect(result.eventId).toBe('evt_refund_1');
        expect(result.invoiceId).toBe('inv-stripe-1');
        expect(result.status).toBeUndefined();
    });

    it('maps charge.dispute.created to dispute_opened without a payment verdict', async () => {
        const result = await verifyStripeEvent({
            id: 'evt_dispute_1',
            object: 'event',
            type: 'charge.dispute.created',
            data: {
                object: {
                    id: 'dp_1',
                    object: 'dispute',
                    payment_intent: 'pi_1',
                    charge: 'ch_1',
                    amount: 4990,
                    currency: 'usd',
                    status: 'needs_response',
                    metadata: { invoice_id: 'inv-stripe-1' },
                },
            },
        });

        expect(result.valid).toBe(true);
        expect(result.refundKind).toBe('dispute_opened');
        expect(result.refundAmount).toBe(49.9);
        expect(result.eventId).toBe('evt_dispute_1');
        expect(result.status).toBeUndefined();
    });

    it('maps charge.dispute.closed to dispute_closed', async () => {
        const result = await verifyStripeEvent({
            id: 'evt_dispute_2',
            object: 'event',
            type: 'charge.dispute.closed',
            data: {
                object: {
                    id: 'dp_1',
                    object: 'dispute',
                    payment_intent: 'pi_1',
                    charge: 'ch_1',
                    amount: 4990,
                    currency: 'usd',
                    status: 'won',
                },
            },
        });

        expect(result.valid).toBe(true);
        expect(result.refundKind).toBe('dispute_closed');
        expect(result.providerStatus).toBe('won');
        expect(result.status).toBeUndefined();
    });

    it('still settles normal successful payment events', async () => {
        const result = await verifyStripeEvent({
            id: 'evt_pi_1',
            object: 'event',
            type: 'payment_intent.succeeded',
            data: {
                object: {
                    id: 'pi_1',
                    object: 'payment_intent',
                    amount_received: 4990,
                    currency: 'usd',
                    metadata: { invoice_id: 'inv-stripe-1' },
                },
            },
        });

        expect(result.valid).toBe(true);
        expect(result.status).toBe('success');
        expect(result.refundKind).toBeUndefined();
        expect(result.invoiceId).toBe('inv-stripe-1');
        expect(result.paidAmount).toBe(49.9);
    });

    it('rejects an invalid signature', async () => {
        process.env.STRIPE_SECRET_KEY = 'sk_test_refund_mapping';
        process.env.STRIPE_WEBHOOK_SECRET = STRIPE_SECRET;
        const { StripeGateway } = await import('../../server/payments/gateways/StripeGateway');
        const gateway = new StripeGateway();
        const rawBody = JSON.stringify({ id: 'e', type: 'charge.refunded', data: { object: {} } });
        const result = await gateway.verifyWebhook(
            { headers: { 'stripe-signature': 't=1,v1=deadbeef' }, query: {} } as unknown as VercelRequest,
            rawBody
        );
        expect(result.valid).toBe(false);
    });
});
