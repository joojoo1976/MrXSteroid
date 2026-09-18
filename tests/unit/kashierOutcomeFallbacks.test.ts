/**
 * tests/unit/kashierOutcomeFallbacks.test.ts
 *
 * Additional unit coverage for the Kashier outcome resolver focusing on
 * primary-status aliasing, normalization and the reconciliation key variants
 * that the existing suites do not exercise.
 */
import { describe, it, expect } from 'vitest';
import { resolveKashierPaymentOutcome } from '../../server/payments/gateways/kashierVerification';

describe('resolveKashierPaymentOutcome — primary status aliases', () => {
    it('accepts the `status` field as an alias for orderStatus', () => {
        expect(resolveKashierPaymentOutcome({ status: 'APPROVED', reconcilation: 'OK' }).outcome).toBe('SUCCESS');
        expect(resolveKashierPaymentOutcome({ status: 'DECLINED', reconcilation: 'OK' }).outcome).toBe('FAILURE');
    });

    it('accepts the `lastStatus` field as an alias for orderStatus', () => {
        const r = resolveKashierPaymentOutcome({ lastStatus: 'CAPTURED', reconcilation: 'OK' });
        expect(r.outcome).toBe('SUCCESS');
        expect(r.detailedStatus).toBe('CAPTURED');
    });

    it('accepts `responseCode` as an alias for transactionResponseCode', () => {
        expect(resolveKashierPaymentOutcome({ responseCode: '00' }).outcome).toBe('SUCCESS');
    });

    it('normalizes surrounding whitespace and casing on the primary status', () => {
        expect(resolveKashierPaymentOutcome({ orderStatus: '  approved  ', reconcilation: 'OK' }).outcome).toBe('SUCCESS');
        expect(resolveKashierPaymentOutcome({ orderStatus: 'Expired_Card' }).outcome).toBe('EXPIRED');
    });
});

describe('resolveKashierPaymentOutcome — failure & terminal variants', () => {
    const failureStatuses = [
        'DECLINED',
        'DECLINED_BY_BANK',
        'FAILED',
        'FAILURE',
        'ACQUIRER_SYSTEM_ERROR',
        'ACQUIRER_ERROR',
        'UNSPECIFIED_FAILURE',
    ];

    it.each(failureStatuses)('%s → FAILURE', (status) => {
        const r = resolveKashierPaymentOutcome({ orderStatus: status, reconcilation: 'OK' });
        expect(r.outcome).toBe('FAILURE');
        expect(r.detailedStatus).toBe(status);
    });

    it('maps the `EXPIRED` alias (not just EXPIRED_CARD) to EXPIRED', () => {
        expect(resolveKashierPaymentOutcome({ orderStatus: 'EXPIRED' }).outcome).toBe('EXPIRED');
    });

    it('maps the `TIMEOUT` alias to a fail-closed UNKNOWN/TIMED_OUT', () => {
        const r = resolveKashierPaymentOutcome({ orderStatus: 'TIMEOUT' });
        expect(r.outcome).toBe('UNKNOWN');
        expect(r.detailedStatus).toBe('TIMED_OUT');
    });

    it('maps INITIATED to the PENDING outcome', () => {
        expect(resolveKashierPaymentOutcome({ orderStatus: 'INITIATED' }).outcome).toBe('PENDING');
    });
});

describe('resolveKashierPaymentOutcome — reconciliation key variants', () => {
    it('honours the `merchantWebhookReconciliation` field', () => {
        const paid = resolveKashierPaymentOutcome({
            orderStatus: 'SUCCESS',
            merchantWebhookReconciliation: 'OK',
        });
        expect(paid.outcome).toBe('SUCCESS');
        expect(paid.isReconciled).toBe(true);

        const mismatch = resolveKashierPaymentOutcome({
            orderStatus: 'SUCCESS',
            merchantWebhookReconciliation: 'Failed',
        });
        expect(mismatch.outcome).toBe('UNKNOWN');
        expect(mismatch.isReconciled).toBe(false);
    });

    it('prefers `reconcilation` (Kashier spelling) over the double-i variant when both exist', () => {
        const r = resolveKashierPaymentOutcome({
            orderStatus: 'SUCCESS',
            reconcilation: 'OK',
            reconciliation: 'FAILED',
        });
        expect(r.outcome).toBe('SUCCESS');
    });

    it('treats NOT_EXISTS case-insensitively as a verification exception', () => {
        expect(resolveKashierPaymentOutcome({ orderStatus: 'SUCCESS', reconcilation: 'not_exists' }).outcome).toBe('UNKNOWN');
        expect(resolveKashierPaymentOutcome({ orderStatus: 'SUCCESS', reconcilation: 'Not_Exists' }).outcome).toBe('UNKNOWN');
    });
});

describe('resolveKashierPaymentOutcome — robustness', () => {
    it('returns UNKNOWN for a completely empty payload', () => {
        const r = resolveKashierPaymentOutcome({});
        expect(r.outcome).toBe('UNKNOWN');
        expect(r.detailedStatus).toBe('UNKNOWN');
        expect(r.isReconciled).toBe(false);
    });

    it('never throws across arbitrary / hostile payloads', () => {
        const payloads: Array<Record<string, unknown>> = [
            {},
            { orderStatus: null },
            { orderStatus: 12345 },
            { orderStatus: 'SUCCESS', reconcilation: null },
            { status: {}, reconcilation: [] },
            { transactionResponseCode: 0 },
            { orderStatus: 'success', reconcilation: 'ok' },
        ];
        for (const p of payloads) {
            expect(() => resolveKashierPaymentOutcome(p)).not.toThrow();
        }
    });
});
