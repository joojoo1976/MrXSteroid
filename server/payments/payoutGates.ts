/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PAYOUT GATES (Affiliate / Ledger / Payout Expansion — D-3)
 *  The three payout-execution gates from Final Gate v5.1 (C-2, D-8) plus the
 *  LIVE_ACTIVATION kill switch. All start UNCONFIRMED in production.
 *
 *  Any live transfer execution MUST be rejected while any gate is unconfirmed.
 *  This module is server-side only; the admin surface reports gate status and
 *  the approval surface refuses execution before any external call.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export const PAYOUT_GATE_KEYS = ['C_2', 'D_8', 'LIVE_ACTIVATION'] as const;
export type PayoutGateKey = (typeof PAYOUT_GATE_KEYS)[number];

export interface PayoutGateRow {
    gate_key: string;
    label: string;
    confirmed: boolean;
    confirmed_at: string | null;
    confirmed_by: string | null;
    note: string | null;
    updated_at: string;
}

export interface PayoutGateEvaluation {
    /** Gates that are REQUIRED for any live payout execution and NOT yet confirmed. */
    blocked: PayoutGateKey[];
    cleared: boolean;
}

/**
 * Machine-readable payout-blocking error.
 * `code` + `blockedGates` are stable so admin/UIs and tests can assert the
 * exact blocking reason without parsing human text.
 */
export class PayoutBlockedError extends Error {
    readonly code = 'PAYOUT_BLOCKED';
    readonly blockedGates: PayoutGateKey[];

    constructor(blockedGates: PayoutGateKey[], message?: string) {
        super(
            message ||
                `Live payout execution is blocked by unconfirmed gates: ${blockedGates.join(', ')}`
        );
        this.name = 'PayoutBlockedError';
        this.blockedGates = [...blockedGates];
    }
}

export async function loadPayoutGates(supabase: SupabaseClient): Promise<PayoutGateRow[]> {
    const { data, error } = await supabase.from('payout_gates').select('*');
    if (error) {
        throw new Error(`[PayoutGates] Failed to load payout gates: ${error.message}`);
    }
    return (data || []) as PayoutGateRow[];
}

export function evaluatePayoutGates(gates: PayoutGateRow[]): PayoutGateEvaluation {
    const known = new Set<string>(PAYOUT_GATE_KEYS);
    const missing = PAYOUT_GATE_KEYS.filter((key) => !gates.some((g) => g.gate_key === key));
    const unconfirmed = gates.filter((g) => known.has(g.gate_key) && !g.confirmed).map((g) => g.gate_key as PayoutGateKey);
    const blocked = [...new Set([...missing, ...unconfirmed])];
    return { blocked, cleared: blocked.length === 0 };
}

/**
 * Throws PayoutBlockedError when any execution gate is unconfirmed.
 * Guarantees the caller makes ZERO external calls when blocked.
 */
export async function requirePayoutGatesCleared(supabase: SupabaseClient): Promise<void> {
    const gates = await loadPayoutGates(supabase);
    const evaluation = evaluatePayoutGates(gates);
    if (!evaluation.cleared) {
        throw new PayoutBlockedError(evaluation.blocked);
    }
}