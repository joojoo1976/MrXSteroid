/**
 * Billing schema preflight — pure logic.
 *
 * The billing migrations cannot be verified by "did the command exit 0": a
 * migration can be recorded while its objects are missing, and one of the
 * defects we are fixing (InstaPay writing `entitlements.tier_id`) assumed a
 * column that has never existed. This module turns a set of read-only PostgREST
 * probes into an explicit expected/present/absent verdict per object.
 *
 * No network here: the CLI (`scripts/billing-db-preflight.ts`) performs the
 * requests and hands the raw status/code back.
 */

export type ProbeKind = 'table' | 'column';

export interface ProbeSpec {
    kind: ProbeKind;
    table: string;
    /** Column name when `kind === 'column'`. */
    column?: string;
    /** Human label used in the report. */
    label: string;
    /**
     * What a correctly migrated database must show. `absent` encodes a guard:
     * `entitlements.tier_id` must NEVER exist — the InstaPay RPC assumed it and
     * that assumption is what broke approval.
     */
    expected: 'present' | 'absent';
    /** Migration that introduces/removes the object. */
    migration: string;
    /** Why the check exists, in one line. */
    why: string;
}

export const BILLING_PROBES: ProbeSpec[] = [
    {
        kind: 'table',
        table: 'invoice_lines',
        label: 'invoice_lines',
        expected: 'present',
        migration: '20261118150000_create_invoice_lines',
        why: 'Phase 1: persisted invoice line items — without it checkout fails closed',
    },
    {
        kind: 'table',
        table: 'invoice_payment_legs',
        label: 'invoice_payment_legs',
        expected: 'present',
        migration: '20261019120000_consolidated_invoice_payment_legs',
        why: 'multi-leg settlement table; settle_invoice_payment_leg depends on it',
    },
    {
        kind: 'column',
        table: 'invoices',
        column: 'pricing_version',
        label: 'invoices.pricing_version',
        expected: 'present',
        migration: '20261118160000_invoice_first_atomic',
        why: 'quote/invoice parity: catalog version frozen on the invoice',
    },
    {
        kind: 'column',
        table: 'invoices',
        column: 'quote_hash',
        label: 'invoices.quote_hash',
        expected: 'present',
        migration: '20261118160000_invoice_first_atomic',
        why: 'detects idempotency-key reuse with a different cart',
    },
    {
        kind: 'column',
        table: 'entitlements',
        column: 'tier_id',
        label: 'entitlements.tier_id',
        expected: 'absent',
        migration: '20261123130000_fix_approve_instapay_receipt',
        why: 'guard: the defective InstaPay RPC wrote this column; entitlements has product_id only',
    },
    {
        kind: 'column',
        table: 'refunds',
        column: 'payment_intent_id',
        label: 'refunds.payment_intent_id',
        expected: 'present',
        migration: '20261123120000_refunds_allow_unlinked_intent',
        why: 'column must exist; nullability is relaxed by that migration (not probeable read-only)',
    },
];

export interface ProbeOutcome {
    /** HTTP status. */
    status: number;
    /** PostgREST/Postgres error code when the body carried one. */
    code?: string | null;
}

export type ProbeState = 'present' | 'absent' | 'unreadable' | 'error';

export interface ProbeVerdict {
    spec: ProbeSpec;
    state: ProbeState;
    /** Expected state satisfied? */
    ok: boolean;
    detail: string;
}

/**
 * Map one read-only probe result to a state.
 *
 *  200            -> present
 *  404 PGRST205   -> the table is not in the schema cache  (absent)
 *  400 42703      -> the column does not exist             (absent)
 *  401/403 42501  -> the object exists but this role may not read it (present)
 */
export function classifyProbe(spec: ProbeSpec, outcome: ProbeOutcome): ProbeVerdict {
    const code = outcome.code ?? null;

    let state: ProbeState;
    let detail: string;

    if (outcome.status === 200) {
        state = 'present';
        detail = 'readable';
    } else if (outcome.status === 404 && code === 'PGRST205') {
        state = 'absent';
        detail = `not in schema cache (${code})`;
    } else if (outcome.status === 400 && code === '42703') {
        state = 'absent';
        detail = `undefined_column (${code})`;
    } else if ((outcome.status === 401 || outcome.status === 403) && code === '42501') {
        state = 'present';
        detail = 'permission denied for role — object exists';
    } else if (outcome.status === 404) {
        state = 'absent';
        detail = `404 ${code ?? 'no-code'}`;
    } else {
        state = 'error';
        detail = `HTTP ${outcome.status} ${code ?? ''}`.trim();
    }

    const ok =
        (spec.expected === 'present' && state === 'present') ||
        (spec.expected === 'absent' && state === 'absent');

    return { spec, state, ok, detail };
}

export interface PreflightSummary {
    verdicts: ProbeVerdict[];
    /** Checks that do not satisfy their expectation. */
    pending: ProbeVerdict[];
    /** Migrations still to apply, in file order, de-duplicated. */
    pendingMigrations: string[];
    exitCode: 0 | 2;
}

export function summarizePreflight(verdicts: ProbeVerdict[]): PreflightSummary {
    const pending = verdicts.filter((v) => !v.ok);
    const pendingMigrations = Array.from(new Set(pending.map((v) => v.spec.migration)));
    return {
        verdicts,
        pending,
        pendingMigrations,
        exitCode: pending.length === 0 ? 0 : 2,
    };
}
