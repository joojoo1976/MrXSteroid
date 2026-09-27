/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  💰 PAID-AMOUNT VERIFICATION (defense-in-depth)                          ║
 * ║  Compares the amount reported by the payment gateway against the amount  ║
 * ║  stored on the invoice before a subscription is activated.                ║
 * ║  Webhook signatures are the primary defense; this is a second layer that  ║
 * ║  prevents activating a subscription on an underpaid / mismatched charge.  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[VerifyAmount] Missing SUPABASE_URL env var.');
    if (!key) throw new Error('[VerifyAmount] Missing SUPABASE_SERVICE_ROLE_KEY env var.');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
};

/** Tolerance in major currency units (covers gateway/rounding drift). */
const AMOUNT_TOLERANCE = 1.0;

export interface AmountVerification {
    ok: boolean;
    expected?: number;
    paid?: number;
    currency?: string;
}

/**
 * Verify that `paidAmount` (major units, as reported by the gateway) matches the
 * invoice's stored amount within tolerance.
 *
 * - When the gateway did not report an amount (paidAmount undefined), we cannot
 *   verify — returns ok:true so legacy flows are not broken.
 * - When the invoice cannot be resolved, returns ok:false (caller must NOT activate).
 *
 * `supabaseClient` must be supplied by the caller so amount verification reads
 * the SAME database handle as the rest of the state path; otherwise the check
 * silently consults a different client and can diverge from what is settled.
 */
export async function verifyPaidAmount(
    invoiceId: string,
    paidAmount?: number,
    supabaseClient?: SupabaseClient
): Promise<AmountVerification> {
    if (paidAmount === undefined || paidAmount === null || Number.isNaN(paidAmount)) {
        return { ok: true };
    }

    const supabase = supabaseClient || getSupabaseAdmin();
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('amount, currency')
        .eq('id', invoiceId)
        .single();

    if (invoiceError || !invoice) {
        console.warn(
            `⚠️ [VerifyAmount] Invoice ${invoiceId} not resolvable (${invoiceError?.message ?? 'no row'}) — refusing to activate`
        );
        return { ok: false };
    }

    const expected = Number(invoice.amount);
    const paid = Number(paidAmount);
    const diff = Math.abs(paid - expected);
    const ok = diff <= AMOUNT_TOLERANCE;

    if (!ok) {
        console.error(`❌ [VerifyAmount] Amount mismatch for invoice ${invoiceId}: paid ${paid} ${invoice.currency} vs expected ${expected} ${invoice.currency}`);
    } else {
        console.log(`✅ [VerifyAmount] Amount verified for invoice ${invoiceId}: ${paid} ${invoice.currency}`);
    }

    return { ok, expected, paid, currency: invoice.currency };
}
