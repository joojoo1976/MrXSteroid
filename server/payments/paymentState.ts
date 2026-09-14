/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PAYMENT STATE MACHINE (v3.1)
 *  Strict state machine for order payments:
 *  INITIATED → PENDING → SUCCESS
 *                   ├──→ FAILURE
 *                   ├──→ EXPIRED
 *                   └──→ UNKNOWN
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type PaymentState =
    | 'INITIATED'
    | 'PENDING'
    | 'SUCCESS'
    | 'FAILURE'
    | 'EXPIRED'
    | 'UNKNOWN';

const VALID_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
    INITIATED: ['PENDING', 'SUCCESS', 'FAILURE', 'EXPIRED', 'UNKNOWN'],
    PENDING: ['SUCCESS', 'FAILURE', 'EXPIRED', 'UNKNOWN'],
    SUCCESS: [], // Terminal state for payment collection
    FAILURE: ['PENDING'], // Retries from customer creating a new session
    EXPIRED: [],
    UNKNOWN: ['SUCCESS', 'FAILURE', 'EXPIRED'], // Resolved via reconciliation or admin review
};

/**
 * Asserts whether transitioning from currentState to nextState is valid.
 */
export function canTransitionPayment(current: string, next: string): boolean {
    const c = (current || '').toUpperCase() as PaymentState;
    const n = (next || '').toUpperCase() as PaymentState;
    if (c === n) return true;
    return VALID_TRANSITIONS[c]?.includes(n) ?? false;
}

/**
 * Validates transition or throws an error.
 */
export function assertPaymentTransition(current: string, next: string): void {
    if (!canTransitionPayment(current, next)) {
        throw new Error(`[PaymentState] Invalid transition from ${current} to ${next}`);
    }
}
