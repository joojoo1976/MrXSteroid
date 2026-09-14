import { describe, it, expect } from 'vitest';
import { resolveKashierPaymentOutcome } from '../../server/payments/gateways/kashierVerification';
import { KASHIER_TEST_CARDS } from '../fixtures/kashierTestCards';

describe('Kashier Official Test Card Matrix Verification (v3.1)', () => {
    KASHIER_TEST_CARDS.forEach(card => {
        it(`evaluates test card outcome for '${card.name}' -> ${card.expectedOutcome}`, () => {
            const payload = {
                orderStatus: card.expectedStatus,
                transactionResponseCode: card.expectedResponseCode,
                reconcilation: 'OK',
            };

            const result = resolveKashierPaymentOutcome(payload);
            expect(result.outcome).toBe(card.expectedOutcome);
        });
    });

    it('verifies all failure response codes map to FAILURE outcome', () => {
        const failureCodes = ['05', '51', '96', '01'];

        for (const code of failureCodes) {
            const result = resolveKashierPaymentOutcome({
                orderStatus: 'DECLINED',
                transactionResponseCode: code,
                reconcilation: 'OK',
            });

            expect(result.outcome).toBe('FAILURE');
        }
    });

    it('verifies TIMED_OUT with response code 91 maps to UNKNOWN fail-closed', () => {
        const result = resolveKashierPaymentOutcome({
            orderStatus: 'TIMED_OUT',
            transactionResponseCode: '91',
            reconcilation: 'OK',
        });

        expect(result.outcome).toBe('UNKNOWN');
        expect(result.detailedStatus).toBe('TIMED_OUT');
    });
});
