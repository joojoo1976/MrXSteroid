/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PAYOUT STATE MACHINE (v3.1)
 *  Strict state machine for beneficiary payouts / transfers:
 *  QUEUED → PROCESSING → COMPLETED
 *                   └──→ FAILED
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type PayoutState =
    | 'QUEUED'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED';

const VALID_PAYOUT_TRANSITIONS: Record<PayoutState, PayoutState[]> = {
    QUEUED: ['PROCESSING', 'FAILED'],
    PROCESSING: ['COMPLETED', 'FAILED'],
    COMPLETED: [], // Terminal
    FAILED: ['PROCESSING'], // Only after admin manual verification / recovery
};

export function canTransitionPayout(current: string, next: string): boolean {
    const c = (current || '').toUpperCase() as PayoutState;
    const n = (next || '').toUpperCase() as PayoutState;
    if (c === n) return true;
    return VALID_PAYOUT_TRANSITIONS[c]?.includes(n) ?? false;
}

export function assertPayoutTransition(current: string, next: string): void {
    if (!canTransitionPayout(current, next)) {
        throw new Error(`[PayoutState] Invalid transition from ${current} to ${next}`);
    }
}
