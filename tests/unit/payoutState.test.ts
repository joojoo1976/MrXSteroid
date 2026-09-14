import { describe, it, expect } from 'vitest';
import { canTransitionPayout, assertPayoutTransition } from '../../server/payments/payoutState';

describe('Payout State Machine (v3.1)', () => {
    it('allows QUEUED -> PROCESSING -> COMPLETED', () => {
        expect(canTransitionPayout('QUEUED', 'PROCESSING')).toBe(true);
        expect(canTransitionPayout('PROCESSING', 'COMPLETED')).toBe(true);
    });

    it('allows PROCESSING -> FAILED on network or bank decline', () => {
        expect(canTransitionPayout('PROCESSING', 'FAILED')).toBe(true);
    });

    it('allows FAILED -> PROCESSING for verified manual retry', () => {
        expect(canTransitionPayout('FAILED', 'PROCESSING')).toBe(true);
    });

    it('blocks jumping directly from QUEUED to COMPLETED without processing', () => {
        expect(canTransitionPayout('QUEUED', 'COMPLETED')).toBe(false);
    });

    it('blocks transitioning out of COMPLETED terminal state', () => {
        expect(canTransitionPayout('COMPLETED', 'QUEUED')).toBe(false);
        expect(canTransitionPayout('COMPLETED', 'FAILED')).toBe(false);
        expect(() => assertPayoutTransition('COMPLETED', 'FAILED')).toThrow();
    });
});
