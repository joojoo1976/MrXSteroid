/**
 * GET /api/referral/track?ref=CODE&redirect=/some/path
 *
 * Sets the mrx_ref attribution cookie (60-day window, HttpOnly, Secure,
 * SameSite=Lax) and optionally persists attribution to DB for authenticated
 * users (so it survives cookie loss, incognito sessions, or device switches).
 *
 * Security:
 *   - ref code is sanitized: uppercase, alphanumeric only, max 20 chars
 *   - redirect is validated: relative paths or same-origin only
 *   - affiliate existence and active status verified in DB before cookie is set
 *   - SUPABASE_SERVICE_ROLE_KEY never exposed to client
 *   - No secrets logged
 */

import { buildAttributionData, resolveReferralCode, saveDbAttribution } from '../../../../server/affiliate/attributionService';
import { ATTRIBUTION_COOKIE_NAME, ATTRIBUTION_COOKIE_MAX_AGE } from '../../../../server/affiliate/commissionConfig';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const APP_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mrxsteroid.com';

/**
 * Hash sensitive data (IP, UA) before storing — never store raw PII.
 */
function hashValue(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex').slice(0, 32);
}

/**
 * Validate and sanitize redirect destination.
 * Only allows relative paths or same-origin absolute URLs.
 */
function sanitizeRedirect(redirectTo: string): string {
    if (!redirectTo) return '/';
    try {
        if (redirectTo.startsWith('/')) {
            // Allow relative paths, but strip any protocol-relative attempts
            if (redirectTo.startsWith('//')) return '/';
            return redirectTo;
        }
        const parsed = new URL(redirectTo);
        const base = new URL(APP_BASE);
        if (parsed.origin === base.origin) return parsed.pathname + parsed.search;
    } catch {
        // Malformed URL — default safe redirect
    }
    return '/';
}

/**
 * Attempt to resolve the authenticated user from the Authorization header
 * or from a session cookie, for DB attribution persistence.
 * Returns null if not authenticated — cookie-only attribution still works.
 */
async function tryGetUserId(req: Request): Promise<string | null> {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !anonKey) return null;

        const supabase = createClient(url, anonKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // Try Authorization header first
        const authHeader = req.headers.get('authorization') || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (token) {
            const { data } = await supabase.auth.getUser(token);
            if (data?.user?.id) return data.user.id;
        }

        // Try cookie-based session (server-side cookie header)
        const cookieHeader = req.headers.get('cookie') || '';
        const sbAccessToken = cookieHeader.match(/sb-[^=]+-auth-token=([^;]+)/)?.[1];
        if (sbAccessToken) {
            try {
                const decoded = JSON.parse(decodeURIComponent(sbAccessToken));
                const accessToken = decoded?.access_token ?? decoded?.[0]?.access_token;
                if (accessToken) {
                    const { data } = await supabase.auth.getUser(accessToken);
                    if (data?.user?.id) return data.user.id;
                }
            } catch {
                // Invalid token format — skip
            }
        }
        return null;
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const rawRef = (url.searchParams.get('ref') || '').trim();
    const redirectTo = url.searchParams.get('redirect') || '/';

    const safeRedirect = sanitizeRedirect(redirectTo);

    // ── Validate referral code ────────────────────────────────────────────────
    // Sanitize: uppercase, alphanumeric only, max 20 chars
    const refCode = rawRef.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 20);

    if (!refCode) {
        return Response.redirect(`${APP_BASE}${safeRedirect}`, 302);
    }

    // Resolve code in DB (validates existence + active status)
    const affiliate = await resolveReferralCode(refCode);
    if (!affiliate) {
        console.log(`[ReferralTrack] Unknown/inactive referral code: ${refCode.slice(0, 10)}…`);
        return Response.redirect(`${APP_BASE}${safeRedirect}`, 302);
    }

    // ── Build attribution data ────────────────────────────────────────────────
    const attribution = buildAttributionData(affiliate.id, affiliate.referralCode);
    const cookieValue = encodeURIComponent(JSON.stringify(attribution));

    // ── Persist to DB if user is authenticated (dual-layer attribution) ────────
    const userId = await tryGetUserId(req);
    if (userId) {
        const ipRaw = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || '';
        const uaRaw = req.headers.get('user-agent') || '';

        // Fire-and-forget — must never block redirect
        void saveDbAttribution({
            userId,
            affiliateId: affiliate.id,
            referralCode: affiliate.referralCode,
            ipAddressHash: ipRaw ? hashValue(ipRaw) : undefined,
            userAgentHash: uaRaw ? hashValue(uaRaw) : undefined,
        });
    }

    // ── Set cookie + redirect ─────────────────────────────────────────────────
    const headers = new Headers();
    headers.append('Location', `${APP_BASE}${safeRedirect}`);
    headers.append(
        'Set-Cookie',
        `${ATTRIBUTION_COOKIE_NAME}=${cookieValue}; Max-Age=${ATTRIBUTION_COOKIE_MAX_AGE}; Path=/; HttpOnly; SameSite=Lax; Secure`
    );

    // Security headers
    headers.append('X-Content-Type-Options', 'nosniff');
    headers.append('X-Frame-Options', 'DENY');

    console.log(`[ReferralTrack] Attribution set for affiliate ${affiliate.id}${userId ? ' (DB+cookie)' : ' (cookie-only)'}`);
    return new Response(null, { status: 302, headers });
}
