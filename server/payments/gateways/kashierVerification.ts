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
 * Kashier delivers the transaction envelope nested under `data`. The documented
 * transaction-status signal is `data.status`, not the event name and not a
 * top-level field. This is the single place that precedence is defined, so the
 * outcome resolver and the gateway identifier extraction can never disagree
 * about which field is authoritative.
 */
export function readKashierNestedData(
    payload: Record<string, unknown>
): Record<string, unknown> | null {
    const data = payload.data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        return data as Record<string, unknown>;
    }
    return null;
}

/**
 * A normalized read of a Kashier webhook body. Nested `data.*` values win over
 * their top-level aliases because that is where Kashier documents them; the
 * legacy top-level fields remain supported so historical payloads keep working.
 */
export interface KashierWebhookView {
    status: string;
    responseCode: string;
    reconciliation: string;
    orderId?: string;
    transactionId?: string;
    amount?: number;
    currency?: string;
    /** True when the status was read from the documented nested `data.status`. */
    fromNestedEnvelope: boolean;
}

export function buildKashierWebhookView(payload: Record<string, unknown>): KashierWebhookView {
    const nested = readKashierNestedData(payload);

    const pick = (...candidates: unknown[]): unknown => {
        for (const candidate of candidates) {
            if (candidate !== undefined && candidate !== null && candidate !== '') {
                return candidate;
            }
        }
        return undefined;
    };

    const nestedStatus = String(nested?.status ?? '').toUpperCase().trim();
    const legacyStatus = String(
        pick(payload.orderStatus, payload.status, payload.lastStatus) ?? ''
    ).toUpperCase().trim();

    const amountRaw = pick(nested?.amount, payload.amount);
    const parsedAmount = amountRaw === undefined ? undefined : Number(amountRaw);

    return {
        status: nestedStatus || legacyStatus,
        responseCode: String(
            pick(nested?.transactionResponseCode, nested?.responseCode, payload.transactionResponseCode, payload.responseCode) ?? ''
        ).toUpperCase().trim(),
        reconciliation: String(
            pick(
                nested?.reconcilation,
                nested?.reconciliation,
                payload.reconcilation,
                payload.reconciliation,
                payload.merchantWebhookReconciliation
            ) ?? ''
        ).trim(),
        orderId: (() => {
            const value = pick(nested?.orderId, nested?.merchantOrderId, payload.orderId, payload.merchantOrderId);
            return value === undefined ? undefined : String(value);
        })(),
        transactionId: (() => {
            const value = pick(nested?.transactionId, payload.transactionId);
            return value === undefined ? undefined : String(value);
        })(),
        amount: parsedAmount !== undefined && Number.isFinite(parsedAmount) ? parsedAmount : undefined,
        currency: (() => {
            const value = pick(nested?.currency, payload.currency);
            return value === undefined ? undefined : String(value);
        })(),
        fromNestedEnvelope: nestedStatus !== '',
    };
}

/**
 * Resolves final payment outcome by evaluating primary transaction indicators
 * (status, lastStatus, transactionResponseCode) along with secondary
 * reconciliation verdict (reconcilation / reconciliation).
 */
export function resolveKashierPaymentOutcome(
    payload: Record<string, unknown>
): KashierResolutionResult {
    // 1. Normalize primary status indicators, reading the documented nested
    //    `data.status` envelope first and falling back to legacy top-level fields.
    const view = buildKashierWebhookView(payload);
    const rawStatus = view.status;
    const responseCode = view.responseCode;

    // 2. Normalize secondary reconciliation verdict (handle official Kashier spelling 'reconcilation')
    const rawReconciliation = view.reconciliation;

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
