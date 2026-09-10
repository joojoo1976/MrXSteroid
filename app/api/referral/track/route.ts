/**
 * GET /api/referral/track?ref=CODE&redirect=/some/path
 *
 * Sets the mrx_ref attribution cookie (60-day window) and redirects.
 * Server-side only — never exposes affiliate_id to the client directly.
 */

import { buildAttributionData, resolveReferralCode } from "../../../../server/affiliate/attributionService";
import { ATTRIBUTION_COOKIE_NAME, ATTRIBUTION_COOKIE_MAX_AGE } from "../../../../server/affiliate/commissionConfig";

const APP_BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mrxsteroid.com";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const refCode = (url.searchParams.get("ref") || "").trim().toUpperCase();
    const redirectTo = url.searchParams.get("redirect") || "/";

    // Validate redirect (must be relative or same origin)
    let safeRedirect = "/";
    try {
        if (redirectTo.startsWith("/")) {
            safeRedirect = redirectTo;
        } else {
            const parsed = new URL(redirectTo);
            if (parsed.origin === APP_BASE) safeRedirect = parsed.pathname + parsed.search;
        }
    } catch { safeRedirect = "/"; }

    if (!refCode) {
        return Response.redirect(`${APP_BASE}${safeRedirect}`, 302);
    }

    // Resolve code in DB (validates it exists and is active)
    const affiliate = await resolveReferralCode(refCode);
    if (!affiliate) {
        console.log(`[ReferralTrack] Unknown or inactive referral code: ${refCode}`);
        return Response.redirect(`${APP_BASE}${safeRedirect}`, 302);
    }

    const attribution = buildAttributionData(affiliate.id, affiliate.referralCode);
    const cookieValue = encodeURIComponent(JSON.stringify(attribution));

    const headers = new Headers();
    headers.append("Location", `${APP_BASE}${safeRedirect}`);
    headers.append(
        "Set-Cookie",
        `${ATTRIBUTION_COOKIE_NAME}=${cookieValue}; Max-Age=${ATTRIBUTION_COOKIE_MAX_AGE}; Path=/; HttpOnly; SameSite=Lax; Secure`
    );

    console.log(`[ReferralTrack] Attribution set for code ${refCode}, affiliate ${affiliate.id}`);
    return new Response(null, { status: 302, headers });
}
