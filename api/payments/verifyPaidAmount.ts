/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  💰 PAID-AMOUNT VERIFICATION (defense-in-depth)                          ║
 * ║  Compares the amount reported by the payment gateway against the amount  ║
 * ║  stored on the invoice before a subscription is activated.                ║
 * ║  Webhook signatures are the primary defense; this is a second layer that  ║
 * ║  prevents activating a subscription on an underpaid / mismatched charge.  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!url || !key) {
        throw new Error('Missing Supabase configuration');
    }

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
 */
export async function verifyPaidAmount(invoiceId: string, paidAmount?: number): Promise<AmountVerification> {
    if (paidAmount === undefined || paidAmount === null || Number.isNaN(paidAmount)) {
        return { ok: true };
    }

    const supabase = getSupabaseAdmin();
    const { data: invoice } = await supabase
        .from('invoices')
        .select('amount, currency')
        .eq('id', invoiceId)
        .single();

    if (!invoice) {
        console.warn(`⚠️ [VerifyAmount] Invoice ${invoiceId} not found — refusing to activate`);
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
