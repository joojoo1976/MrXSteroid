/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REVENUE SPLIT STATE MACHINE (v3.1)
 *  Strict state machine for order splits:
 *  PENDING → CALCULATED → FROZEN → QUEUED → PAID
 *                            └──→ QUEUED → FAILED
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type SplitState =
    | 'PENDING'
    | 'CALCULATED'
    | 'FROZEN'
    | 'QUEUED'
    | 'PAID'
    | 'FAILED';

const VALID_SPLIT_TRANSITIONS: Record<SplitState, SplitState[]> = {
    PENDING: ['CALCULATED'],
    CALCULATED: ['FROZEN'],
    FROZEN: ['QUEUED'],
    QUEUED: ['PAID', 'FAILED'],
    PAID: [],     // Terminal: beneficiary has received the split
    FAILED: ['QUEUED'], // Manual recovery/re-queue by admin
};

export function canTransitionSplit(current: string, next: string): boolean {
    const c = (current || '').toUpperCase() as SplitState;
    const n = (next || '').toUpperCase() as SplitState;
    if (c === n) return true;
    return VALID_SPLIT_TRANSITIONS[c]?.includes(n) ?? false;
}

export function assertSplitTransition(current: string, next: string): void {
    if (!canTransitionSplit(current, next)) {
        throw new Error(`[SplitState] Invalid transition from ${current} to ${next}`);
    }
}
