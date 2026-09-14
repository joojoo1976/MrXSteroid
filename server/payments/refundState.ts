/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REFUND STATE MACHINE (v4 - Final Gate N-7)
 *  Strict state machine for refunds and chargeback handling:
 *
 *  REQUESTED → VALIDATING → SUBMITTED → PENDING → COMPLETED
 *                  ├────────→ REJECTED
 *                  └────────→ CANCELLED
 *  PENDING ───────────────→ UNKNOWN (Timeout ≠ failure)
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type RefundState =
    | 'REQUESTED'
    | 'VALIDATING'
    | 'SUBMITTED'
    | 'PENDING'
    | 'COMPLETED'
    | 'FAILED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'UNKNOWN';

const VALID_REFUND_TRANSITIONS: Record<RefundState, RefundState[]> = {
    REQUESTED: ['VALIDATING', 'CANCELLED', 'REJECTED'],
    VALIDATING: ['SUBMITTED', 'REJECTED', 'CANCELLED'],
    SUBMITTED: ['PENDING', 'COMPLETED', 'FAILED', 'UNKNOWN'],
    PENDING: ['COMPLETED', 'FAILED', 'UNKNOWN'],
    COMPLETED: [], // Terminal
    FAILED: ['VALIDATING', 'SUBMITTED', 'CANCELLED'], // Can re-evaluate or cancel
    REJECTED: [], // Terminal
    CANCELLED: [], // Terminal
    UNKNOWN: ['PENDING', 'COMPLETED', 'FAILED'], // Resolving timeout with provider
};

export function canTransitionRefund(current: string, next: string): boolean {
    const c = (current || '').toUpperCase() as RefundState;
    const n = (next || '').toUpperCase() as RefundState;
    if (c === n) return true;
    return VALID_REFUND_TRANSITIONS[c]?.includes(n) ?? false;
}

export function assertRefundTransition(current: string, next: string): void {
    if (!canTransitionRefund(current, next)) {
        throw new Error(`[RefundState] Invalid transition from ${current} to ${next}`);
    }
}
