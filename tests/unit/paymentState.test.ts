import { describe, it, expect } from 'vitest';
import { canTransitionPayment, assertPaymentTransition } from '../../server/payments/paymentState';

describe('Payment State Machine (v3.1)', () => {
    it('allows valid transitions from INITIATED', () => {
        expect(canTransitionPayment('INITIATED', 'PENDING')).toBe(true);
        expect(canTransitionPayment('INITIATED', 'SUCCESS')).toBe(true);
        expect(canTransitionPayment('INITIATED', 'FAILURE')).toBe(true);
        expect(canTransitionPayment('INITIATED', 'EXPIRED')).toBe(true);
        expect(canTransitionPayment('INITIATED', 'UNKNOWN')).toBe(true);
    });

    it('allows valid transitions from PENDING', () => {
        expect(canTransitionPayment('PENDING', 'SUCCESS')).toBe(true);
        expect(canTransitionPayment('PENDING', 'FAILURE')).toBe(true);
        expect(canTransitionPayment('PENDING', 'UNKNOWN')).toBe(true);
    });

    it('blocks transitions from terminal SUCCESS', () => {
        expect(canTransitionPayment('SUCCESS', 'PENDING')).toBe(false);
        expect(canTransitionPayment('SUCCESS', 'FAILURE')).toBe(false);
        expect(() => assertPaymentTransition('SUCCESS', 'FAILURE')).toThrow();
    });

    it('allows same-state transitions (idempotent)', () => {
        expect(canTransitionPayment('SUCCESS', 'SUCCESS')).toBe(true);
        expect(canTransitionPayment('PENDING', 'PENDING')).toBe(true);
    });

    it('allows resolving UNKNOWN to terminal outcomes after manual review', () => {
        expect(canTransitionPayment('UNKNOWN', 'SUCCESS')).toBe(true);
        expect(canTransitionPayment('UNKNOWN', 'FAILURE')).toBe(true);
    });
});
