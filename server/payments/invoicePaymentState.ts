/**
 * Explicit invoice-payment lifecycle for the Phase 6 webhook/callback path.
 *
 * The legacy `invoices.status` / `invoices.payment_status` columns keep their
 * existing values for compatibility. The explicit lifecycle is persisted in
 * `invoices.metadata.payment_state` so a later event can never move a terminal
 * state backwards.
 *
 *   pending -> paid -> fulfilled
 *   pending -> amount_mismatch
 *   pending -> failed
 *
 * `paid` is terminal for provider events: a replayed success must not post the
 * ledger or grant a second entitlement. Only the internal delivery step may
 * move `paid` -> `fulfilled`.
 */

export type InvoicePaymentState =
    | 'pending'
    | 'paid'
    | 'fulfilled'
    | 'amount_mismatch'
    | 'failed';

export type InvoicePaymentTargetState = Exclude<InvoicePaymentState, 'pending'>;

const VALID_TRANSITIONS: Record<InvoicePaymentState, InvoicePaymentTargetState[]> = {
    pending: ['paid', 'amount_mismatch', 'failed'],
    paid: ['fulfilled'],
    fulfilled: [],
    amount_mismatch: [],
    failed: [],
};

const STATES = new Set<InvoicePaymentState>([
    'pending',
    'paid',
    'fulfilled',
    'amount_mismatch',
    'failed',
]);

export function isInvoicePaymentState(value: unknown): value is InvoicePaymentState {
    return typeof value === 'string' && STATES.has(value as InvoicePaymentState);
}

export function isTerminalInvoicePaymentState(state: InvoicePaymentState): boolean {
    return state === 'fulfilled' || state === 'amount_mismatch' || state === 'failed';
}

export function canTransitionInvoicePayment(
    current: InvoicePaymentState,
    next: InvoicePaymentTargetState
): boolean {
    return VALID_TRANSITIONS[current].includes(next);
}

export function assertInvoicePaymentTransition(
    current: InvoicePaymentState,
    next: InvoicePaymentTargetState
): void {
    if (!canTransitionInvoicePayment(current, next)) {
        throw new Error(`[InvoicePaymentState] Invalid transition from ${current} to ${next}`);
    }
}

/**
 * Reads the explicit state when present, otherwise derives it from the legacy
 * columns so rows created before Phase 6 still get the terminal protections.
 */
export function deriveInvoicePaymentState(row: {
    status?: string | null;
    payment_status?: string | null;
    metadata?: Record<string, unknown> | null;
}): InvoicePaymentState {
    const metadataState = row.metadata?.payment_state;
    if (isInvoicePaymentState(metadataState)) return metadataState;

    const status = String(row.status || '').toLowerCase();
    const paymentStatus = String(row.payment_status || '').toLowerCase();

    // Refund/cancel is terminal for payment collection: a late `paid` event
    // must never resurrect it. It shares the `failed` terminal branch.
    if (
        ['refunded', 'partially_refunded', 'cancelled'].includes(status)
        || ['refunded', 'partially_refunded', 'cancelled'].includes(paymentStatus)
    ) {
        return 'failed';
    }

    if (status === 'success' || paymentStatus === 'paid') return 'paid';
    if (paymentStatus === 'failed' || status === 'failed') return 'failed';
    return 'pending';
}

export function invoicePaymentStateMetadata(
    metadata: Record<string, unknown> | null | undefined,
    state: InvoicePaymentState
): Record<string, unknown> {
    return { ...(metadata || {}), payment_state: state };
}
