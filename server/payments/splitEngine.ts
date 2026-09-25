/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REVENUE SPLIT ENGINE (v3.1)
 *  Pure Functions + Database Persistence.
 *  Uses Integer Minor Units (piasters/cents) exclusively — ZERO floating point math.
 *  Implements the Largest-Remainder (Hare-Niemeyer) method for rounding.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface SplitRule {
    id: string;
    beneficiary_id: string | null;
    share_type: 'percentage' | 'fixed';
    /**
     * For percentage: value in basis points or percent (e.g. 33.33 for 33.33%).
     * For fixed: value in minor units (e.g. 5000 for 50.00 EGP).
     */
    share_value: number;
    priority: number;
    tier_id?: string | null;
    product_id?: string | null;
    is_active?: boolean;
    /**
     * Ledger account the split allocation must be credited to
     * (Posting Matrix §6.3). Defaults to BENEFICIARY_PAYABLE.
     * NULL beneficiary rows (e.g. platform 10%) MUST carry a
     * non-broker ledger destination like PLATFORM_REVENUE.
     */
    destination_account?: string | null;
}

/**
 * Owner Decision 3-4 (Final Gate v4):
 * Strict default distribution shares:
 * Author: 85%, Platform: 10%, Reserve: 5% (Total = 100%)
 */
export const DEFAULT_OWNER_SPLIT_RATIOS = {
    AUTHOR_SHARE_PERCENT: 85,
    PLATFORM_SHARE_PERCENT: 10,
    RESERVE_SHARE_PERCENT: 5,
    TOTAL_PERCENT: 100,
} as const;

/**
 * Owner Decisions 3-1 & 3-2 Policy Constants:
 * 3-1: Refund distribution basis = NET_AFTER_GATEWAY_FEE
 * 3-2: Gateway fee handling on refunds = MERCHANT_ABSORBS
 */
export const OWNER_REFUND_POLICY = {
    DISTRIBUTION_BASIS: 'NET_AFTER_GATEWAY_FEE',
    GATEWAY_FEE_POLICY: 'MERCHANT_ABSORBS',
} as const;


export interface CalculatedSplit {
    beneficiaryId: string | null;
    destinationAccount?: string | null;
    shareType: 'percentage' | 'fixed';
    shareValue: number;
    allocatedAmountMinor: number;
    grossAmountMinor: number;
    gatewayFeeMinor: number;
    netAmountMinor: number;
    currency: string;
}

export interface SplitCalculationSnapshot {
    rules: SplitRule[];
    calculation: {
        grossAmountMinor: number;
        gatewayFeeMinor: number;
        netAmountMinor: number;
    };
    currency: string;
    frozenAt: string;
}

/**
 * Pure function: Calculates splits for an order using Integer Minor Units
 * and the Largest-Remainder (Hare-Niemeyer) method for proportional shares.
 */
export function calculateOrderSplits(params: {
    grossAmountMinor: number;
    gatewayFeeMinor: number;
    rules: SplitRule[];
    currency: string;
}): CalculatedSplit[] {
    const { grossAmountMinor, gatewayFeeMinor, currency } = params;
    const rules = params.rules.filter(r => r.is_active !== false);

    if (grossAmountMinor < 0 || gatewayFeeMinor < 0) {
        throw new Error('[SplitEngine] Amounts cannot be negative');
    }

    const netAmountMinor = Math.max(0, grossAmountMinor - gatewayFeeMinor);

    if (rules.length === 0 || netAmountMinor === 0) {
        return [];
    }

    // Sort rules by priority descending (higher priority executed first)
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

    const fixedRules = sortedRules.filter(r => r.share_type === 'fixed');
    const percentageRules = sortedRules.filter(r => r.share_type === 'percentage');

    const results: CalculatedSplit[] = [];
    let allocatedSoFar = 0;

    // 1. Process Fixed Rules First
    for (const rule of fixedRules) {
        const fixedMinor = Math.round(rule.share_value);
        // Cap allocation if net amount would be exceeded
        const available = Math.max(0, netAmountMinor - allocatedSoFar);
        const actualAllocation = Math.min(fixedMinor, available);

        results.push({
            beneficiaryId: rule.beneficiary_id,
            destinationAccount: rule.destination_account || 'BENEFICIARY_PAYABLE',
            shareType: 'fixed',
            shareValue: rule.share_value,
            allocatedAmountMinor: actualAllocation,
            grossAmountMinor,
            gatewayFeeMinor,
            netAmountMinor,
            currency,
        });

        allocatedSoFar += actualAllocation;
    }

    const remainingForPercentages = Math.max(0, netAmountMinor - allocatedSoFar);

    // 2. Process Percentage Rules using Largest-Remainder Method
    if (percentageRules.length > 0 && remainingForPercentages > 0) {
        const totalPercentage = percentageRules.reduce((sum, r) => sum + r.share_value, 0);
        if (totalPercentage <= 0) {
            throw new Error('[SplitEngine] Sum of percentage rules must be greater than 0');
        }

        interface PercentageItem {
            rule: SplitRule;
            exactQuota: number;
            integerPart: number;
            remainder: number;
            index: number;
        }

        const items: PercentageItem[] = percentageRules.map((rule, index) => {
            // exactQuota = remainingForPercentages * (rule.share_value / totalPercentage)
            const exactQuota = (remainingForPercentages * rule.share_value) / totalPercentage;
            const integerPart = Math.floor(exactQuota);
            const remainder = exactQuota - integerPart;
            return { rule, exactQuota, integerPart, remainder, index };
        });

        const percentageAllocated = items.reduce((sum, item) => sum + item.integerPart, 0);
        const deficit = remainingForPercentages - percentageAllocated;

        // Sort items by remainder descending (Hare-Niemeyer method)
        // In case of ties, prioritize by rule priority, then index
        const sortedByRemainder = [...items].sort((a, b) => {
            if (b.remainder !== a.remainder) return b.remainder - a.remainder;
            return b.rule.priority - a.rule.priority;
        });

        // Distribute 1 minor unit to the top deficit items
        for (let i = 0; i < deficit; i++) {
            sortedByRemainder[i % sortedByRemainder.length].integerPart += 1;
        }

        for (const item of items) {
            results.push({
                beneficiaryId: item.rule.beneficiary_id,
                destinationAccount: item.rule.destination_account || 'BENEFICIARY_PAYABLE',
                shareType: 'percentage',
                shareValue: item.rule.share_value,
                allocatedAmountMinor: item.integerPart,
                grossAmountMinor,
                gatewayFeeMinor,
                netAmountMinor,
                currency,
            });
            allocatedSoFar += item.integerPart;
        }
    }

    // 3. STRICT INVARIANT VERIFICATION
    // The sum of allocated shares must EXACTLY equal netAmountMinor (down to the exact minor unit)
    const totalAllocated = results.reduce((sum, r) => sum + r.allocatedAmountMinor, 0);
    if (totalAllocated !== netAmountMinor) {
        throw new Error(
            `[SplitEngine] INVARIANT VIOLATION: Sum of splits (${totalAllocated}) does not equal net amount (${netAmountMinor})`
        );
    }

    return results;
}

/**
 * Creates and freezes order splits for a paid invoice in Supabase.
 * Loads active rules, computes splits, and inserts into `order_splits` with a frozen snapshot.
 */
export async function freezeOrderSplits(
    supabase: SupabaseClient,
    invoiceId: string,
    gatewayFeeMinor = 0
): Promise<{ frozen: boolean; splitsCount: number }> {
    // 1. Fetch invoice details
    const { data: invoice, error: invError } = await supabase
        .from('invoices')
        .select('id, amount, currency, tier_id')
        .eq('id', invoiceId)
        .single();

    if (invError || !invoice) {
        throw new Error(`[SplitEngine] Invoice not found: ${invoiceId}`);
    }

    // Check if splits are already frozen for this invoice (Idempotency)
    const { data: existingSplits, error: splitCheckError } = await supabase
        .from('order_splits')
        .select('id')
        .eq('invoice_id', invoiceId);

    if (splitCheckError) {
        console.warn(`[SplitEngine] Error checking existing splits:`, splitCheckError.message);
    }

    if (existingSplits && existingSplits.length > 0) {
        console.log(`⚡ [SplitEngine] Invoice ${invoiceId} already has frozen splits — skip`);
        return { frozen: true, splitsCount: existingSplits.length };
    }

    // Convert major units to minor units (e.g. 100.00 -> 10000)
    const grossAmountMinor = Math.round(Number(invoice.amount || 0) * 100);
    const currency = invoice.currency || 'USD';

    // 2. Fetch active rules matching tier or global rules (tier_id is null)
    const { data: rulesData, error: rulesError } = await supabase
        .from('split_rules')
        .select('*')
        .eq('is_active', true);

    if (rulesError || !rulesData || rulesData.length === 0) {
        console.warn(`[SplitEngine] No active split rules found for invoice ${invoiceId}`);
        return { frozen: false, splitsCount: 0 };
    }

    // Filter rules matching invoice tier, or fallback to global rules
    const tierRules = rulesData.filter(r => r.tier_id === invoice.tier_id);
    const applicableRules = tierRules.length > 0 ? tierRules : rulesData.filter(r => !r.tier_id);

    if (applicableRules.length === 0) {
        console.log(`[SplitEngine] No applicable rules for tier ${invoice.tier_id}`);
        return { frozen: false, splitsCount: 0 };
    }

    // 3. Calculate splits using Largest-Remainder
    const calculated = calculateOrderSplits({
        grossAmountMinor,
        gatewayFeeMinor,
        rules: applicableRules as SplitRule[],
        currency,
    });

    const netAmountMinor = Math.max(0, grossAmountMinor - gatewayFeeMinor);
    const snapshot: SplitCalculationSnapshot = {
        rules: applicableRules as SplitRule[],
        calculation: {
            grossAmountMinor,
            gatewayFeeMinor,
            netAmountMinor,
        },
        currency,
        frozenAt: new Date().toISOString(),
    };

    // 4. Insert calculated splits (status 'calculated' = computed, awaiting
    //    admin approval; payout batch approval promotes them to 'approved').
    const rowsToInsert = calculated.map(c => ({
        invoice_id: invoiceId,
        beneficiary_id: c.beneficiaryId,
        destination_account: c.destinationAccount || 'BENEFICIARY_PAYABLE',
        rule_snapshot: snapshot,
        gross_amount_minor: c.grossAmountMinor,
        gateway_fee_minor: c.gatewayFeeMinor,
        net_amount_minor: c.netAmountMinor,
        allocated_amount_minor: c.allocatedAmountMinor,
        currency: c.currency,
        status: 'calculated',
    }));

    const { error: insertError } = await supabase
        .from('order_splits')
        .insert(rowsToInsert);

    if (insertError) {
        // Unique constraint violation means another process already froze it
        if (insertError.code === '23505') {
            console.log(`⚡ [SplitEngine] Duplicate order split insert caught (idempotent)`);
            return { frozen: true, splitsCount: rowsToInsert.length };
        }
        throw new Error(`[SplitEngine] Failed to freeze order splits: ${insertError.message}`);
    }

    console.log(`✅ [SplitEngine] Frozen ${rowsToInsert.length} splits for invoice ${invoiceId}`);
    return { frozen: true, splitsCount: rowsToInsert.length };
}
