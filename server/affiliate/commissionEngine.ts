/**
 * commissionEngine.ts — Pure commission calculation functions.
 * No side-effects, no DB calls. Fully testable in isolation.
 *
 * Commission base: net product amount after discount, BEFORE shipping.
 * (Shipping costs never earn commission.)
 */
import { COMMISSION_TIERS, getTier, type CommissionTier } from './commissionConfig';

export interface CommissionCalculationInput {
    /** Invoice total amount (used only as reference; base is computed below) */
    invoiceAmount: number;
    /** Product subtotal before discount and shipping */
    productSubtotal: number;
    /** Discount applied */
    discountAmount: number;
    /** Shipping cost (excluded from commission base) */
    shippingCost: number;
    /** Number of qualifying paid referrals this month (for tier selection) */
    monthlyPaidReferrals: number;
    /** Custom override rate (0-100), takes priority over tier rate when set */
    customCommissionRate: number | null;
}

export interface CommissionCalculationResult {
    /** Amount used as base for commission calculation */
    commissionBase: number;
    /** Effective rate used (0-100) */
    commissionRate: number;
    /** Gross commission amount (rounded to 2 decimal places) */
    commissionAmount: number;
    /** Tier name that applied (or 'custom' for override) */
    tier: 'bronze' | 'silver' | 'gold' | 'custom';
    /** The matched CommissionTier object (null if custom override) */
    tierConfig: CommissionTier | null;
}

/**
 * Calculate commission for a sale.
 * All inputs must already be validated and in the same currency.
 *
 * Rules:
 * 1. commissionBase = productSubtotal - discountAmount (floored at 0)
 * 2. Rate = customCommissionRate if set, else tier rate
 * 3. commissionAmount = commissionBase * rate / 100, rounded to 2 dp
 * 4. Minimum commission is 0 (never negative)
 */
export function calculateCommission(input: CommissionCalculationInput): CommissionCalculationResult {
    const commissionBase = Math.max(0, input.productSubtotal - input.discountAmount);

    let commissionRate: number;
    let tier: 'bronze' | 'silver' | 'gold' | 'custom';
    let tierConfig: CommissionTier | null;

    if (input.customCommissionRate !== null && input.customCommissionRate !== undefined) {
        // Custom override always wins
        commissionRate = Math.min(100, Math.max(0, input.customCommissionRate));
        tier = 'custom';
        tierConfig = null;
    } else {
        // Determine tier from monthly count
        tierConfig = getTier(input.monthlyPaidReferrals + 1); // +1 for this sale
        if (!tierConfig) {
            tierConfig = COMMISSION_TIERS[0]; // bronze
        }
        commissionRate = tierConfig.rate;
        tier = tierConfig.name;
    }

    const commissionAmount = roundCurrency(commissionBase * commissionRate / 100);

    return { commissionBase, commissionRate, commissionAmount, tier, tierConfig };
}

/**
 * Determine the next tier after this sale and the sales needed to reach it.
 */
export function getNextTierProgress(monthlyPaidReferrals: number): {
    currentTier: CommissionTier;
    nextTier: CommissionTier | null;
    salesUntilNextTier: number | null;
} {
    const salesAfter = monthlyPaidReferrals + 1;
    const current = getTier(salesAfter) ?? COMMISSION_TIERS[0];
    const currentIdx = COMMISSION_TIERS.findIndex(t => t.name === current.name);
    const nextTier = COMMISSION_TIERS[currentIdx + 1] ?? null;
    const salesUntilNextTier = nextTier ? (nextTier.minSales - salesAfter) : null;
    return { currentTier: current, nextTier, salesUntilNextTier };
}

/** Round to 2 decimal places using banker's/half-up rounding */
function roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
