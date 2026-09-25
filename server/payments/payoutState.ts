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
    | 'RECONCILING'
    | 'COMPLETED'
    | 'FAILED'
    | 'UNKNOWN';

const VALID_PAYOUT_TRANSITIONS: Record<PayoutState, PayoutState[]> = {
    QUEUED: ['PROCESSING', 'FAILED'],
    PROCESSING: ['RECONCILING', 'COMPLETED', 'FAILED', 'UNKNOWN'],
    RECONCILING: ['COMPLETED', 'FAILED', 'UNKNOWN', 'PROCESSING'],
    COMPLETED: [], // Terminal
    FAILED: ['PROCESSING', 'RECONCILING'], // Only after admin manual verification / recovery
    UNKNOWN: ['RECONCILING', 'PROCESSING', 'COMPLETED', 'FAILED'], // Resolving timeout or indeterminate state
};

export function canTransitionPayout(current: string, next: string): boolean {
    const c = (current || '').toUpperCase() as PayoutState;
    const n = (next || '').toUpperCase() as PayoutState;
    if (c === n) return true;
    return VALID_PAYOUT_TRANSITIONS[c]?.includes(n) ?? false;
}

/**
 * Guard for provider-driven transitions (Kashier transfer webhooks).
 *
 * The state machine above intentionally permits a human/operator to recover a
 * FAILED or RECONCILING payout. A webhook is not that operator: redeliveries
 * and out-of-order deliveries are routine, so this guard is deliberately
 * stricter and returns true only when a webhook may actually write:
 *
 *   - an unchanged state is a no-op, so settlement cannot post twice;
 *   - a terminal state (COMPLETED / FAILED) is never left through a webhook;
 *   - UNKNOWN is reachable, because an unmodelled provider status must be
 *     recorded for reconciliation rather than dropped.
 */
export function canApplyPayoutWebhookEvent(current: string, next: string): boolean {
    const c = (current || '').toUpperCase() as PayoutState;
    const n = (next || '').toUpperCase() as PayoutState;
    if (c === n) return false;
    if (c === 'COMPLETED' || c === 'FAILED') return false;
    return VALID_PAYOUT_TRANSITIONS[c]?.includes(n) ?? false;
}

export function assertPayoutTransition(current: string, next: string): void {
    if (!canTransitionPayout(current, next)) {
        throw new Error(`[PayoutState] Invalid transition from ${current} to ${next}`);
    }
}

