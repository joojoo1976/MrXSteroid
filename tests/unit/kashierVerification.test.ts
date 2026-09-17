import { describe, it, expect } from 'vitest';
import { resolveKashierPaymentOutcome } from '../../server/payments/gateways/kashierVerification';

describe('Kashier Verification & Reconciliation Layer (v3.1)', () => {
    it('resolves SUCCESS when status is APPROVED/SUCCESS and reconcilation is OK', () => {
        const payload = {
            orderStatus: 'SUCCESS',
            reconcilation: 'OK',
            amount: '100.00',
        };

        const result = resolveKashierPaymentOutcome(payload);
        expect(result.outcome).toBe('SUCCESS');
        expect(result.isReconciled).toBe(true);
    });

    it('prohibits treating reconcilation = OK as success if status is FAILURE', () => {
        // Critical Section 4 Invariant: reconcilation verdict is NOT the payment outcome
        const payload = {
            orderStatus: 'FAILED',
            transactionResponseCode: '05',
            reconcilation: 'OK',
        };

        const result = resolveKashierPaymentOutcome(payload);
        expect(result.outcome).toBe('FAILURE');
        expect(result.isReconciled).toBe(true);
    });

    it('marks status=SUCCESS with reconcilation=NA as UNKNOWN requiring verification', () => {
        const payload = {
            orderStatus: 'SUCCESS',
            reconcilation: 'NA',
        };

        const result = resolveKashierPaymentOutcome(payload);
        expect(result.outcome).toBe('UNKNOWN');
        expect(result.isReconciled).toBe(false);
    });

    it('marks status=SUCCESS with reconcilation=Failed as UNKNOWN (reconciliation mismatch)', () => {
        const payload = {
            orderStatus: 'SUCCESS',
            reconcilation: 'Failed',
        };

        const result = resolveKashierPaymentOutcome(payload);
        expect(result.outcome).toBe('UNKNOWN');
        expect(result.isReconciled).toBe(false);
    });

    it('marks reconcilation=Not_Exists as UNKNOWN (Verification Exception)', () => {
        const payload = {
            orderStatus: 'SUCCESS',
            reconcilation: 'Not_Exists',
        };

        const result = resolveKashierPaymentOutcome(payload);
        expect(result.outcome).toBe('UNKNOWN');
        expect(result.isReconciled).toBe(false);
    });

    it('marks TIMED_OUT as UNKNOWN fail-closed', () => {
        const payload = {
            orderStatus: 'TIMED_OUT',
            reconcilation: 'OK',
        };

        const result = resolveKashierPaymentOutcome(payload);
        expect(result.outcome).toBe('UNKNOWN');
        expect(result.detailedStatus).toBe('TIMED_OUT');
    });

    it('correctly parses alternative spelling reconciliation (with double i)', () => {
        const payload = {
            orderStatus: 'SUCCESS',
            reconciliation: 'OK', // Double "i" variant
        };

        const result = resolveKashierPaymentOutcome(payload);
        expect(result.outcome).toBe('SUCCESS');
        expect(result.isReconciled).toBe(true);
    });

    it('identifies EXPIRED cards properly', () => {
        const payload = {
            orderStatus: 'EXPIRED_CARD',
            reconcilation: 'OK',
        };

        const result = resolveKashierPaymentOutcome(payload);
        expect(result.outcome).toBe('EXPIRED');
    });

    it('maps VOIDED to FAILURE', () => {
        const result = resolveKashierPaymentOutcome({ orderStatus: 'VOIDED', reconcilation: 'OK' });
        expect(result.outcome).toBe('FAILURE');
        expect(result.detailedStatus).toBe('VOIDED');
    });

    it('maps REFUNDED to FAILURE even when reconciliation verdict is OK', () => {
        const result = resolveKashierPaymentOutcome({ orderStatus: 'REFUNDED', reconcilation: 'OK' });
        expect(result.outcome).toBe('FAILURE');
        expect(result.detailedStatus).toBe('REFUNDED');
    });

    it('maps CAPTURED + reconcilation OK to SUCCESS with detailedStatus CAPTURED', () => {
        const result = resolveKashierPaymentOutcome({ orderStatus: 'CAPTURED', reconcilation: 'OK' });
        expect(result.outcome).toBe('SUCCESS');
        expect(result.detailedStatus).toBe('CAPTURED');
    });

    it('treats a transaction response code of 200 as primary success when no orderStatus present', () => {
        const result = resolveKashierPaymentOutcome({ transactionResponseCode: '200' });
        expect(result.outcome).toBe('SUCCESS');
        expect(result.isReconciled).toBe(true);
    });

    it('is case-insensitive on the reconciliation verdict (lowercase / mixed ok)', () => {
        expect(resolveKashierPaymentOutcome({ orderStatus: 'SUCCESS', reconcilation: 'ok' }).outcome).toBe('SUCCESS');
        expect(resolveKashierPaymentOutcome({ orderStatus: 'SUCCESS', reconcilation: 'OK' }).isReconciled).toBe(true);
    });

    it('maps PENDING / AUTHORIZED to the PENDING outcome', () => {
        expect(resolveKashierPaymentOutcome({ orderStatus: 'PENDING', reconcilation: 'NA' }).outcome).toBe('PENDING');
        expect(resolveKashierPaymentOutcome({ orderStatus: 'AUTHORIZED' }).outcome).toBe('PENDING');
    });

    it('defaults unmapped statuses to UNKNOWN while preserving the raw status', () => {
        const result = resolveKashierPaymentOutcome({ orderStatus: 'MYSTERY_STATE', reconcilation: 'OK' });
        expect(result.outcome).toBe('UNKNOWN');
        expect(result.detailedStatus).toBe('MYSTERY_STATE');
        expect(result.isReconciled).toBe(false);
    });

    it('treats reconciliation (double-i spelling) FAILED as a mismatch too', () => {
        const result = resolveKashierPaymentOutcome({ orderStatus: 'SUCCESS', reconciliation: 'FAILED' });
        expect(result.outcome).toBe('UNKNOWN');
        expect(result.isReconciled).toBe(false);
    });
});
