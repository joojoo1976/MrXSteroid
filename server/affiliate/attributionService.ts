/**
 * attributionService.ts — Referral attribution management.
 *
 * Dual-layer attribution:
 *   1. Cookie (mrx_ref): Fast first-party, HttpOnly, 60-day, set by /api/referral/track
 *   2. DB (affiliate_attributions): Server-side persistence that survives cookie
 *      loss, incognito, browser restart, or device switch. Written when user is
 *      authenticated and /api/referral/track resolves a valid affiliate code.
 *
 * Attribution Resolution Priority (at checkout / invoice creation):
 *   1. DB record for authenticated user (most reliable)
 *   2. Cookie fallback (for anonymous / unauthenticated flows)
 *
 * Rules:
 *   - Attribution window: 60 days
 *   - Last valid attribution wins (overwrite older ones)
 *   - Self-referral blocked server-side; order still succeeds, commission skipped
 *   - Cookie is read by /api/payments/create-invoice (server-side only)
 *   - SUPABASE_SERVICE_ROLE_KEY never sent to client
 */
import { ATTRIBUTION_WINDOW_DAYS } from './commissionConfig';
import { createClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttributionData {
    affiliateId: string;
    referralCode: string;
    attributionTimestamp: string;
    attributionExpiresAt: string;
    source?: 'cookie' | 'db' | 'url_param';
}

export interface AffiliateRecord {
    id: string;
    userId: string;
    referralCode: string;
    status: string;
    customCommissionRate: number | null;
    totalPaidReferrals: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('[AttributionService] Missing Supabase service role credentials');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function computeExpiresAt(fromDate = new Date()): Date {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + ATTRIBUTION_WINDOW_DAYS);
    return d;
}

// ─── Cookie Attribution ───────────────────────────────────────────────────────

/**
 * Parse the mrx_ref cookie value into AttributionData.
 * Returns null if malformed, expired, or missing required fields.
 */
export function parseAttributionCookie(cookieValue: string): AttributionData | null {
    if (!cookieValue || cookieValue.trim() === '') return null;
    try {
        const parsed = JSON.parse(cookieValue) as Partial<AttributionData>;
        if (!parsed.affiliateId || !parsed.referralCode || !parsed.attributionExpiresAt) return null;
        const expiresAt = new Date(parsed.attributionExpiresAt);
        if (isNaN(expiresAt.getTime()) || expiresAt < new Date()) return null;
        return {
            affiliateId: parsed.affiliateId,
            referralCode: parsed.referralCode,
            attributionTimestamp: parsed.attributionTimestamp || new Date().toISOString(),
            attributionExpiresAt: parsed.attributionExpiresAt,
            source: 'cookie',
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
    const expiresAt = computeExpiresAt(now);
    return {
        affiliateId,
        referralCode,
        attributionTimestamp: now.toISOString(),
        attributionExpiresAt: expiresAt.toISOString(),
        source: 'url_param',
    };
}

// ─── DB Attribution ───────────────────────────────────────────────────────────

/**
 * Persist attribution server-side for an authenticated user.
 * Upserts (overwrite) the active record for this user — last valid wins.
 *
 * Call this from /api/referral/track when a user is authenticated.
 * Safe to call multiple times; older records are superseded.
 */
export async function saveDbAttribution(params: {
    userId: string;
    affiliateId: string;
    referralCode: string;
    ipAddressHash?: string;
    userAgentHash?: string;
}): Promise<void> {
    const { userId, affiliateId, referralCode, ipAddressHash, userAgentHash } = params;
    try {
        const supabase = getSupabaseAdmin();
        const now = new Date();
        const expiresAt = computeExpiresAt(now);

        // Deactivate previous active attributions for this user first (last-valid-wins)
        await supabase
            .from('affiliate_attributions')
            .update({ attribution_used: true, used_at: now.toISOString() })
            .eq('user_id', userId)
            .eq('attribution_used', false)
            .neq('referral_code', referralCode); // keep same code active if revisiting

        // Upsert the new attribution
        const { error } = await supabase
            .from('affiliate_attributions')
            .upsert({
                user_id: userId,
                affiliate_id: affiliateId,
                referral_code: referralCode,
                attribution_source: 'url_param',
                attributed_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
                attribution_used: false,
                ip_address: ipAddressHash ?? null,
                user_agent_hash: userAgentHash ?? null,
                updated_at: now.toISOString(),
            }, {
                onConflict: 'user_id,referral_code',
                ignoreDuplicates: false,
            });

        if (error) {
            // Non-fatal: cookie-based attribution still works
            console.warn('[AttributionService] DB upsert warning (non-fatal):', error.message);
        }
    } catch (err) {
        // DB attribution failure must never break the tracking flow
        console.warn('[AttributionService] saveDbAttribution failed (non-fatal):', err);
    }
}

/**
 * Resolve the latest active DB attribution for an authenticated user.
 * Returns null if no valid, non-expired, non-used attribution exists.
 *
 * Used at checkout time as the primary attribution source.
 */
export async function resolveDbAttribution(userId: string): Promise<AttributionData | null> {
    try {
        const supabase = getSupabaseAdmin();
        const { data } = await supabase
            .rpc('resolve_active_attribution', { p_user_id: userId });

        if (!data || (Array.isArray(data) && data.length === 0)) return null;

        const row = Array.isArray(data) ? data[0] : data;
        if (!row?.affiliate_id || !row?.referral_code) return null;

        return {
            affiliateId: row.affiliate_id,
            referralCode: row.referral_code,
            attributionTimestamp: new Date().toISOString(),
            attributionExpiresAt: row.expires_at,
            source: 'db',
        };
    } catch {
        return null;
    }
}

/**
 * Mark a DB attribution record as used after it is stamped onto an invoice.
 * Prevents the same attribution from being applied to multiple future invoices.
 * Idempotent — safe to call multiple times.
 */
export async function markAttributionUsed(params: {
    userId: string;
    affiliateId: string;
    invoiceId: string;
}): Promise<void> {
    const { userId, affiliateId, invoiceId } = params;
    try {
        const supabase = getSupabaseAdmin();
        await supabase
            .from('affiliate_attributions')
            .update({
                attribution_used: true,
                used_at: new Date().toISOString(),
                invoice_id: invoiceId,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('affiliate_id', affiliateId)
            .eq('attribution_used', false);
    } catch (err) {
        console.warn('[AttributionService] markAttributionUsed failed (non-fatal):', err);
    }
}

// ─── Self-Referral Guard ──────────────────────────────────────────────────────

/**
 * Check if a user is self-referring.
 * The affiliate's user_id must NOT match the purchasing user_id.
 * Returns true (block) if same user. Returns false (allow) on error
 * so commission failure never blocks a legitimate purchase.
 */
export async function isSelfReferral(affiliateId: string, purchasingUserId: string | null): Promise<boolean> {
    if (!purchasingUserId || !affiliateId) return false;
    try {
        const supabase = getSupabaseAdmin();
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

// ─── Referral Code Resolver ───────────────────────────────────────────────────

/**
 * Validate that a referral code exists and belongs to an active affiliate.
 * Returns affiliate record or null.
 *
 * Validates:
 *   - Code exists in DB
 *   - Affiliate status === 'active'
 *   - Returns current commission data (not cached)
 */
export async function resolveReferralCode(referralCode: string): Promise<AffiliateRecord | null> {
    // Sanitize: uppercase, alphanumeric only, max 20 chars
    const clean = referralCode.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 20);
    if (!clean) return null;

    try {
        const supabase = getSupabaseAdmin();
        const { data } = await supabase
            .from('affiliates')
            .select('id, user_id, referral_code, status, custom_commission_rate, total_paid_referrals')
            .eq('referral_code', clean)
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
