import { describe, it, expect } from 'vitest';
import { canTransitionRefund, assertRefundTransition } from '../../server/payments/refundState';

describe('Refund State Machine (N-7)', () => {
    it('allows valid forward transitions from REQUESTED', () => {
        expect(canTransitionRefund('REQUESTED', 'VALIDATING')).toBe(true);
        expect(canTransitionRefund('REQUESTED', 'CANCELLED')).toBe(true);
        expect(canTransitionRefund('REQUESTED', 'REJECTED')).toBe(true);
    });

    it('allows SUBMITTED to PENDING, COMPLETED, FAILED, and UNKNOWN', () => {
        expect(canTransitionRefund('SUBMITTED', 'PENDING')).toBe(true);
        expect(canTransitionRefund('SUBMITTED', 'COMPLETED')).toBe(true);
        expect(canTransitionRefund('SUBMITTED', 'FAILED')).toBe(true);
        expect(canTransitionRefund('SUBMITTED', 'UNKNOWN')).toBe(true);
    });

    it('handles network timeout in PENDING as UNKNOWN (Timeout != failure)', () => {
        expect(canTransitionRefund('PENDING', 'UNKNOWN')).toBe(true);
        expect(canTransitionRefund('UNKNOWN', 'COMPLETED')).toBe(true);
        expect(canTransitionRefund('UNKNOWN', 'FAILED')).toBe(true);
    });

    it('rejects invalid transitions and throws error in assertRefundTransition', () => {
        expect(canTransitionRefund('COMPLETED', 'REQUESTED')).toBe(false);
        expect(canTransitionRefund('REJECTED', 'COMPLETED')).toBe(false);
        expect(() => assertRefundTransition('COMPLETED', 'PENDING')).toThrow(/Invalid transition/);
    });
});
