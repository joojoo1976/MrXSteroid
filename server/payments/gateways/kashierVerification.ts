/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  KASHIER VERIFICATION & OUTCOME RESOLUTION LAYER (v3.1)
 *  Enforces strict separation between Payment Status and Reconciliation Verdict.
 *  Prevents naive `if (reconcilation === 'OK') payment = SUCCESS` pitfalls.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type PaymentOutcome =
    | 'SUCCESS'
    | 'FAILURE'
    | 'PENDING'
    | 'EXPIRED'
    | 'UNKNOWN';

export interface KashierResolutionResult {
    outcome: PaymentOutcome;
    detailedStatus: string;
    reconciliationVerdict: string;
    isReconciled: boolean;
    reason: string;
}

/**
 * Resolves final payment outcome by evaluating primary transaction indicators
 * (status, lastStatus, transactionResponseCode) along with secondary
 * reconciliation verdict (reconcilation / reconciliation).
 */
export function resolveKashierPaymentOutcome(
    payload: Record<string, unknown>
): KashierResolutionResult {
    // 1. Normalize primary status indicators
    const rawStatus = String(payload.orderStatus || payload.status || payload.lastStatus || '').toUpperCase().trim();
    const responseCode = String(payload.transactionResponseCode || payload.responseCode || '').toUpperCase().trim();

    // 2. Normalize secondary reconciliation verdict (handle official Kashier spelling 'reconcilation')
    const rawReconciliation = String(
        payload.reconcilation ??
        payload.reconciliation ??
        payload.merchantWebhookReconciliation ??
        ''
    ).trim();

    const isReconciled = rawReconciliation.toUpperCase() === 'OK';
    const isReconciliationFailed = rawReconciliation.toUpperCase() === 'FAILED';
    const isReconciliationNotExists = rawReconciliation.toUpperCase() === 'NOT_EXISTS';
    const isReconciliationNA = rawReconciliation.toUpperCase() === 'NA';

    // 3. Evaluate primary status
    const isPrimarySuccess =
        rawStatus === 'APPROVED' ||
        rawStatus === 'SUCCESS' ||
        rawStatus === 'CAPTURED' ||
        responseCode === '00' ||
        responseCode === '200';

    const isPrimaryFailed =
        rawStatus === 'DECLINED' ||
        rawStatus === 'DECLINED_BY_BANK' ||
        rawStatus === 'FAILED' ||
        rawStatus === 'FAILURE' ||
        rawStatus === 'ACQUIRER_SYSTEM_ERROR' ||
        rawStatus === 'ACQUIRER_ERROR' ||
        rawStatus === 'UNSPECIFIED_FAILURE' ||
        rawStatus === 'REFUNDED' ||
        rawStatus === 'VOIDED';

    const isPrimaryExpired =
        rawStatus === 'EXPIRED_CARD' ||
        rawStatus === 'EXPIRED';

    const isPrimaryPending =
        rawStatus === 'PENDING' ||
        rawStatus === 'AUTHORIZED' ||
        rawStatus === 'INITIATED';

    const isPrimaryTimedOut =
        rawStatus === 'TIMED_OUT' ||
        rawStatus === 'TIMEOUT';

    // 4. Resolve outcome following Section 4 Invariants
    // Case: Not_Exists -> Verification Exception
    if (isReconciliationNotExists) {
        return {
            outcome: 'UNKNOWN',
            detailedStatus: rawStatus || 'NOT_EXISTS',
            reconciliationVerdict: rawReconciliation,
            isReconciled: false,
            reason: 'Reconciliation Not_Exists — verification exception, manual review required',
        };
    }

    // Case: Timed out -> Fail-closed UNKNOWN
    if (isPrimaryTimedOut) {
        return {
            outcome: 'UNKNOWN',
            detailedStatus: 'TIMED_OUT',
            reconciliationVerdict: rawReconciliation || 'NA',
            isReconciled,
            reason: 'Transaction timed out — unresolved state',
        };
    }

    // Case: Specific refund or void
    if (rawStatus === 'REFUNDED' || rawStatus === 'VOIDED') {
        return {
            outcome: 'FAILURE',
            detailedStatus: rawStatus,
            reconciliationVerdict: rawReconciliation || 'NA',
            isReconciled,
            reason: `Transaction is ${rawStatus}`,
        };
    }

    // Case: Primary Success
    if (isPrimarySuccess) {
        // If reconcilation is explicitly NA -> Case 3: needs verification
        if (isReconciliationNA) {
            return {
                outcome: 'UNKNOWN',
                detailedStatus: rawStatus || 'APPROVED',
                reconciliationVerdict: rawReconciliation,
                isReconciled: false,
                reason: 'Payment status is success but reconciliation verdict is NA — verification required',
            };
        }

        // If reconcilation failed while primary claims success -> mismatch
        if (isReconciliationFailed) {
            return {
                outcome: 'UNKNOWN',
                detailedStatus: rawStatus || 'APPROVED',
                reconciliationVerdict: rawReconciliation,
                isReconciled: false,
                reason: 'Reconciliation mismatch: status is success but reconciliation failed',
            };
        }

        // Case 1: Status=SUCCESS/APPROVED, reconcilation=OK or reconcilation not provided in payload
        const resolvedDetailed = rawStatus === 'CAPTURED' ? 'CAPTURED' : 'APPROVED';
        return {
            outcome: 'SUCCESS',
            detailedStatus: resolvedDetailed,
            reconciliationVerdict: rawReconciliation || 'OK',
            isReconciled: true,
            reason: 'Transaction approved and reconciled successfully',
        };
    }

    // Case 2: Primary Failure (even if reconciliation says OK, payment failed!)
    if (isPrimaryFailed) {
        return {
            outcome: 'FAILURE',
            detailedStatus: rawStatus || 'DECLINED',
            reconciliationVerdict: rawReconciliation || 'NA',
            isReconciled,
            reason: `Transaction declined or failed: ${rawStatus}`,
        };
    }

    // Case: Expired
    if (isPrimaryExpired) {
        return {
            outcome: 'EXPIRED',
            detailedStatus: rawStatus || 'EXPIRED_CARD',
            reconciliationVerdict: rawReconciliation || 'NA',
            isReconciled,
            reason: 'Card expired or session expired',
        };
    }

    // Case: Pending
    if (isPrimaryPending) {
        return {
            outcome: 'PENDING',
            detailedStatus: rawStatus || 'PENDING',
            reconciliationVerdict: rawReconciliation || 'NA',
            isReconciled,
            reason: 'Transaction pending customer action or bank authorization',
        };
    }

    // Default: UNKNOWN
    return {
        outcome: 'UNKNOWN',
        detailedStatus: rawStatus || 'UNKNOWN',
        reconciliationVerdict: rawReconciliation || 'NA',
        isReconciled: false,
        reason: `Unmapped status: ${rawStatus}`,
    };
}
