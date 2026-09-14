import { describe, it, expect } from 'vitest';
import {
    canApplyWebhookToIntent,
    type PaymentIntentRecord,
} from '../../server/payments/paymentIntentService';

describe('Payment Intent Late-Arrival Guard & 1:N Logic (N-1)', () => {
    const mockIntent: PaymentIntentRecord = {
        id: 'intent-uuid-1',
        invoice_id: 'inv-uuid-1',
        attempt_number: 1,
        supersedes_payment_intent_id: null,
        is_current: false, // Older superseded attempt
        provider: 'kashier',
        provider_order_id: 'ord-123',
        merchant_reference: 'MRX-123',
        amount_minor: 10000,
        currency: 'EGP',
        environment: 'test',
        status: 'failed',
        fx_rate: 1.0,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    it('rejects an incoming failed webhook for an older attempt if invoice is already PAID', () => {
        const result = canApplyWebhookToIntent({
            intent: mockIntent,
            invoiceStatus: 'paid',
            incomingStatus: 'FAILED',
        });

        expect(result.canApply).toBe(false);
        expect(result.reason).toContain('Late-arrival guard: Invoice is already PAID');
    });

    it('rejects an incoming expired/cancelled webhook if attempt is superseded and not success', () => {
        const result = canApplyWebhookToIntent({
            intent: mockIntent,
            invoiceStatus: 'pending',
            incomingStatus: 'EXPIRED',
        });

        expect(result.canApply).toBe(false);
        expect(result.reason).toContain('is superseded and incoming status is not SUCCESS');
    });

    it('allows an incoming SUCCESS webhook on the current active intent', () => {
        const currentIntent: PaymentIntentRecord = {
            ...mockIntent,
            attempt_number: 2,
            is_current: true,
            status: 'initiated',
        };

        const result = canApplyWebhookToIntent({
            intent: currentIntent,
            invoiceStatus: 'pending',
            incomingStatus: 'SUCCESS',
        });

        expect(result.canApply).toBe(true);
    });

    it('allows late-arriving SUCCESS webhook to fulfill invoice even if previous attempt was marked failed', () => {
        const result = canApplyWebhookToIntent({
            intent: mockIntent,
            invoiceStatus: 'pending',
            incomingStatus: 'SUCCESS',
        });

        expect(result.canApply).toBe(true);
    });
});
