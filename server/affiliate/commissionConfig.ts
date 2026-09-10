/**
 * Commission configuration — immutable business rules.
 * Tier thresholds and rates must NOT be changed without a DB migration
 * because historical rates are stored verbatim in the referrals table.
 *
 * Tiers (monthly qualified sales count, UTC boundaries):
 *   Bronze : 1-10  → 25%
 *   Silver : 11-50 → 35%
 *   Gold   : 51+   → 45%
 *   Custom override wins over tier rate at all times.
 */

export interface CommissionTier {
    name: 'bronze' | 'silver' | 'gold';
    minSales: number;
    maxSales: number | null; // null = unbounded
    rate: number; // percentage 0-100
}

export const COMMISSION_TIERS: CommissionTier[] = [
    { name: 'bronze', minSales: 1, maxSales: 10, rate: 25 },
    { name: 'silver', minSales: 11, maxSales: 50, rate: 35 },
    { name: 'gold', minSales: 51, maxSales: null, rate: 45 },
];

/** Attribution cookie name */
export const ATTRIBUTION_COOKIE_NAME = 'mrx_ref';
/** Attribution window in days */
export const ATTRIBUTION_WINDOW_DAYS = 60;
/** Cookie max-age in seconds (60 days) */
export const ATTRIBUTION_COOKIE_MAX_AGE = 60 * 24 * 60 * 60;

/**
 * Get tier for a given monthly paid referral count.
 * Returns null if count < 1 (no commission yet).
 */
export function getTier(monthlyPaidReferrals: number): CommissionTier | null {
    if (monthlyPaidReferrals < 1) return null;
    for (const tier of [...COMMISSION_TIERS].reverse()) {
        if (monthlyPaidReferrals >= tier.minSales) return tier;
    }
    return COMMISSION_TIERS[0]; // bronze fallback
}

/**
 * Get tier name for a given monthly paid referral count.
 */
export function getTierName(monthlyPaidReferrals: number): 'bronze' | 'silver' | 'gold' {
    const tier = getTier(monthlyPaidReferrals);
    return tier?.name ?? 'bronze';
}
