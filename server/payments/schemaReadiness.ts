/**
 * Billing schema readiness.
 *
 * Two migrations that the deployed database still lacks are load-bearing for
 * money paths: `invoice_lines` / `create_invoice_atomic` (checkout) and the
 * corrected `approve_instapay_receipt` (manual receipt approval). Until they are
 * applied, Postgres answers with "undefined_table", "undefined_column",
 * "undefined_function" or a check-constraint violation that only exists because
 * the old function wrote a column entitlements does not have.
 *
 * Those failures are not customer errors and they are not retryable by the
 * caller: reporting them as a generic 500 hides the real cause and makes an
 * operator retry a manual approval that can never succeed. This module
 * classifies them so routes can answer 503 + "migration pending" instead.
 */

export interface PostgrestLikeError {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
}

/** Stable API code returned to clients/operators when the schema is behind. */
export const BILLING_MIGRATION_PENDING = 'BILLING_MIGRATION_PENDING';

const FUNCTION_MISSING = /could not find the function|function .* does not exist|undefined_function/i;
const RELATION_MISSING = /relation .* does not exist|undefined_table/i;
const COLUMN_MISSING = /column .* does not exist|undefined_column/i;
const ENTITLEMENTS_STATUS_CHECK = /entitlements_status_check/i;

function text(error: PostgrestLikeError): string {
    return [error.message, error.details, error.hint]
        .filter((part): part is string => typeof part === 'string' && part.length > 0)
        .join(' | ');
}

/**
 * True when an error is caused by the schema being behind the code — i.e. a
 * pending migration — rather than by the request or by transient infrastructure.
 *
 *   PGRST202  PostgREST could not find the function in the schema cache
 *   42883     undefined_function
 *   42P01     undefined_table
 *   42703     undefined_column
 *   23514     check violation, but only the entitlements status constraint that
 *             the defective InstaPay RPC tripped (`status='active'` is not one
 *             of granted|revoked|suspended)
 */
export function isSchemaNotReadyError(error?: PostgrestLikeError | null): boolean {
    if (!error) return false;

    const code = typeof error.code === 'string' ? error.code : '';
    const body = text(error);

    switch (code) {
        case 'PGRST202':
        case '42883':
        case '42P01':
        case '42703':
            return true;
        case '23514':
            return ENTITLEMENTS_STATUS_CHECK.test(body);
        default:
            break;
    }

    return (
        FUNCTION_MISSING.test(body) ||
        RELATION_MISSING.test(body) ||
        COLUMN_MISSING.test(body) ||
        ENTITLEMENTS_STATUS_CHECK.test(body)
    );
}

/** Customer/admin-facing sentence. Deliberately states that nothing was charged. */
export function billingUnavailableMessage(scope: 'checkout' | 'approval'): string {
    if (scope === 'approval') {
        return 'Receipt approval is unavailable because a database migration is pending. '
            + 'Nothing was settled and the receipt is unchanged — apply the pending billing migration and retry.';
    }
    return 'Billing is temporarily unavailable because a database migration is pending. '
        + 'No payment has been taken and no invoice was created.';
}
