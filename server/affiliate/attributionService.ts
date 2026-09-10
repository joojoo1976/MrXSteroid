/**
 * attributionService.ts — Referral attribution cookie management.
 *
 * Cookie format: JSON { affiliateId, referralCode, attributionTimestamp, attributionExpiresAt }
 *
 * Rules:
 * - Attribution window: 60 days
 * - Self-referral must be blocked server-side (order still succeeds)
 * - Cookie is set by /api/referral/track (GET)
 * - Cookie is read by /api/payments/create-invoice (server-side only)
 */
import { ATTRIBUTION_WINDOW_DAYS } from './commissionConfig';

export interface AttributionData {
    affiliateId: string;
    referralCode: string;
    attributionTimestamp: string;
    attributionExpiresAt: string;
}

/**
 * Parse the mrx_ref cookie value into AttributionData.
 * Returns null if malformed, expired, or missing required fields.
 */
export function parseAttributionCookie(cookieValue: string): AttributionData | null {
    if (!cookieValue || cookieValue.trim() === '') return null;
    try {
        const parsed = JSON.parse(cookieValue) as Partial<AttributionData>;
        if (!parsed.affiliateId || !parsed.referralCode || !parsed.attributionExpiresAt) return null;
        // Check expiry
        const expiresAt = new Date(parsed.attributionExpiresAt);
        if (isNaN(expiresAt.getTime()) || expiresAt < new Date()) return null;
        return {
            affiliateId: parsed.affiliateId,
            referralCode: parsed.referralCode,
            attributionTimestamp: parsed.attributionTimestamp || new Date().toISOString(),
            attributionExpiresAt: parsed.attributionExpiresAt,
        };
    } catch {
        return null;
    }
}

/**
 * Build a new AttributionData object for a referral code.
 */
export function buildAttributionData(affiliateId: string, referralCode: string): AttributionData {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + ATTRIBUTION_WINDOW_DAYS);
    return {
        affiliateId,
        referralCode,
        attributionTimestamp: now.toISOString(),
        attributionExpiresAt: expiresAt.toISOString(),
    };
}

/**
 * Check if a user is self-referring.
 * The affiliate's user_id must NOT match the purchasing user_id.
 * This requires a DB check — kept separate so create-invoice can call it.
 */
export async function isSelfReferral(affiliateId: string, purchasingUserId: string | null): Promise<boolean> {
    if (!purchasingUserId || !affiliateId) return false;
    try {
        // Lazy import to keep this module free of top-level DB deps
        const { createClient } = await import('@supabase/supabase-js');
        const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) return false;
        const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
        const { data } = await supabase
            .from('affiliates')
            .select('user_id')
            .eq('id', affiliateId)
            .single();
        return data?.user_id === purchasingUserId;
    } catch {
        return false;
    }
}

/**
 * Validate that a referral code exists and is active. Returns affiliate record or null.
 */
export async function resolveReferralCode(referralCode: string): Promise<{
    id: string;
    userId: string;
    referralCode: string;
    status: string;
    customCommissionRate: number | null;
    totalPaidReferrals: number;
} | null> {
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) return null;
        const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
        const { data } = await supabase
            .from('affiliates')
            .select('id, user_id, referral_code, status, custom_commission_rate, total_paid_referrals')
            .eq('referral_code', referralCode)
            .eq('status', 'active')
            .single();
        if (!data) return null;
        return {
            id: data.id,
            userId: data.user_id,
            referralCode: data.referral_code,
            status: data.status,
            customCommissionRate: data.custom_commission_rate ?? null,
            totalPaidReferrals: data.total_paid_referrals ?? 0,
        };
    } catch {
        return null;
    }
}
