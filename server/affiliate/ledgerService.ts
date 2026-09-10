/**
 * ledgerService.ts — Affiliate commission triggering & reversal.
 *
 * Called by the webhook handler after a successful payment is confirmed.
 * All DB operations are atomic via the Postgres RPC functions:
 *   - affiliate_create_commission
 *   - affiliate_create_reversal
 *
 * IMPORTANT:
 * - InstaPay invoices require MANUAL admin action — never auto-trigger here.
 * - TIMED_OUT / UNKNOWN webhook statuses must NOT trigger commission.
 * - Commission records are immutable once written.
 */
import { createClient } from '@supabase/supabase-js';
import { calculateCommission } from './commissionEngine';

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('[LedgerService] Missing Supabase service role credentials');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

/**
 * Trigger affiliate commission after a confirmed successful payment.
 * Safe to call multiple times for the same invoice — idempotent via invoices.status check.
 */
export async function triggerAffiliateCommission(invoiceId: string): Promise<void> {
    const supabase = getSupabaseAdmin();

    // Fetch invoice with affiliate data
    const { data: invoice, error: invErr } = await supabase
        .from('invoices')
        .select('id, affiliate_id, referral_code, amount, currency, discount_amount, shipping_cost, user_id, gateway, attribution_timestamp, attribution_expires_at')
        .eq('id', invoiceId)
        .single();

    if (invErr || !invoice) {
        console.warn(`[LedgerService] Invoice ${invoiceId} not found for commission trigger`);
        return;
    }

    // No affiliate attribution — nothing to do
    if (!invoice.affiliate_id || !invoice.referral_code) {
        console.log(`[LedgerService] Invoice ${invoiceId} has no affiliate attribution — skipping commission`);
        return;
    }

    // InstaPay — requires manual admin action
    if (invoice.gateway === 'instapay') {
        console.log(`[LedgerService] Invoice ${invoiceId} is InstaPay — commission requires manual admin action`);
        return;
    }

    // Check if commission already created for this invoice (idempotency)
    const { data: existingRef } = await supabase
        .from('referrals')
        .select('id')
        .eq('invoice_id', invoiceId)
        .eq('affiliate_id', invoice.affiliate_id)
        .maybeSingle();

    if (existingRef) {
        console.log(`[LedgerService] Commission already recorded for invoice ${invoiceId} — skipping`);
        return;
    }

    // Fetch affiliate for current commission rate and monthly paid referrals count
    const { data: affiliate, error: affErr } = await supabase
        .from('affiliates')
        .select('id, user_id, status, custom_commission_rate, total_paid_referrals')
        .eq('id', invoice.affiliate_id)
        .single();

    if (affErr || !affiliate) {
        console.warn(`[LedgerService] Affiliate ${invoice.affiliate_id} not found for commission`);
        return;
    }

    if (affiliate.status !== 'active') {
        console.warn(`[LedgerService] Affiliate ${invoice.affiliate_id} is not active (status: ${affiliate.status}) — no commission`);
        return;
    }

    // Get monthly paid referrals count (UTC month boundaries)
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
    const { count: monthlyCount } = await supabase
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('affiliate_id', invoice.affiliate_id)
        .eq('status', 'approved')
        .gte('created_at', monthStart)
        .lt('created_at', monthEnd);

    const monthlyPaidReferrals = monthlyCount ?? 0;

    // Calculate commission
    const invoiceAmount = Number(invoice.amount) || 0;
    const discountAmount = Number(invoice.discount_amount) || 0;
    const shippingCost = Number(invoice.shipping_cost) || 0;
    // Product subtotal = total - shipping
    const productSubtotal = Math.max(0, invoiceAmount - shippingCost);

    const calc = calculateCommission({
        invoiceAmount,
        productSubtotal,
        discountAmount,
        shippingCost,
        monthlyPaidReferrals,
        customCommissionRate: affiliate.custom_commission_rate ?? null,
    });

    console.log(`[LedgerService] Commission: invoice=${invoiceId}, base=${calc.commissionBase}, rate=${calc.commissionRate}%, amount=${calc.commissionAmount} ${invoice.currency}, tier=${calc.tier}`);

    // Call atomic Postgres RPC
    const { data: rpcResult, error: rpcErr } = await supabase.rpc('affiliate_create_commission', {
        p_affiliate_id: invoice.affiliate_id,
        p_invoice_id: invoiceId,
        p_customer_user_id: invoice.user_id || null,
        p_referral_code: invoice.referral_code,
        p_invoice_amount: invoiceAmount,
        p_invoice_currency: invoice.currency,
        p_commission_base_amount: calc.commissionBase,
        p_commission_rate: calc.commissionRate,
        p_commission_amount: calc.commissionAmount,
        p_tier: calc.tier,
        p_attribution_source: 'cookie',
    });

    if (rpcErr) {
        console.error(`[LedgerService] affiliate_create_commission RPC failed for invoice ${invoiceId}:`, rpcErr);
        throw new Error(`Commission RPC failed: ${rpcErr.message}`);
    }

    console.log(`[LedgerService] Commission created successfully:`, rpcResult);
}

export type ReversalType = 'refund' | 'partial_refund' | 'chargeback' | 'reversal';

/**
 * Reverse or partially reverse a commission (for refunds, chargebacks).
 * Idempotent: re-calling for an already-reversed referral will not double-reverse.
 */
export async function reverseCommission(
    invoiceId: string,
    reversalType: ReversalType,
    reason: string,
    partialAmount?: number,
): Promise<void> {
    const supabase = getSupabaseAdmin();

    const { data: referral } = await supabase
        .from('referrals')
        .select('id, affiliate_id, commission_amount, currency, status')
        .eq('invoice_id', invoiceId)
        .eq('status', 'approved')
        .maybeSingle();

    if (!referral) {
        console.log(`[LedgerService] No approved referral found for invoice ${invoiceId} — skipping reversal`);
        return;
    }

    const reversalAmount = partialAmount ?? Number(referral.commission_amount);
    const newStatus = reversalType === 'chargeback' ? 'chargeback' : reversalType === 'partial_refund' ? 'approved' : 'reversed';

    const { error: rpcErr } = await supabase.rpc('affiliate_create_reversal', {
        p_referral_id: referral.id,
        p_affiliate_id: referral.affiliate_id,
        p_reversal_type: reversalType,
        p_reversal_amount: reversalAmount,
        p_currency: referral.currency,
        p_reason: reason,
        p_new_referral_status: newStatus,
    });

    if (rpcErr) {
        console.error(`[LedgerService] affiliate_create_reversal RPC failed:`, rpcErr);
        throw new Error(`Reversal RPC failed: ${rpcErr.message}`);
    }

    console.log(`[LedgerService] Reversal (${reversalType}) recorded for invoice ${invoiceId}, amount: ${reversalAmount}`);
}
