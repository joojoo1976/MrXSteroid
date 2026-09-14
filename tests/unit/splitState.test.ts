import { describe, it, expect } from 'vitest';
import { canTransitionSplit, assertSplitTransition } from '../../server/payments/splitState';

describe('Split State Machine (v3.1)', () => {
    it('follows valid linear split lifecycle: PENDING -> CALCULATED -> FROZEN -> QUEUED -> PAID', () => {
        expect(canTransitionSplit('PENDING', 'CALCULATED')).toBe(true);
        expect(canTransitionSplit('CALCULATED', 'FROZEN')).toBe(true);
        expect(canTransitionSplit('FROZEN', 'QUEUED')).toBe(true);
        expect(canTransitionSplit('QUEUED', 'PAID')).toBe(true);
    });

    it('allows QUEUED -> FAILED when payout transfer fails', () => {
        expect(canTransitionSplit('QUEUED', 'FAILED')).toBe(true);
    });

    it('allows FAILED -> QUEUED for recovery', () => {
        expect(canTransitionSplit('FAILED', 'QUEUED')).toBe(true);
    });

    it('prohibits modifying frozen splits directly back to calculated', () => {
        expect(canTransitionSplit('FROZEN', 'CALCULATED')).toBe(false);
        expect(() => assertSplitTransition('FROZEN', 'CALCULATED')).toThrow();
    });

    it('prohibits transitioning out of PAID terminal state', () => {
        expect(canTransitionSplit('PAID', 'PENDING')).toBe(false);
        expect(canTransitionSplit('PAID', 'FAILED')).toBe(false);
    });
});
