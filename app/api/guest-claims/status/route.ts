/**
 * POST /api/guest-claims/status
 *
 * Read-only preview of a guest order claim, used by the `/claim-order` page to
 * decide what it may honestly render BEFORE the guest commits to a redemption.
 *
 * WHY POST AND NOT GET
 * The raw claim token is a one-time bearer credential. Sending it as a query
 * parameter would place it in a request line, where it is liable to be captured
 * by proxy/CDN access logs, `Referer` headers and browser history. The token is
 * therefore read from the JSON body only, and is never echoed back.
 *
 * SECURITY MODEL
 *  · The caller MUST be authenticated. There is no anonymous status path, so an
 *    unauthenticated visitor cannot learn whether a given token exists, is
 *    expired, or was already used.
 *  · This endpoint performs NO mutation. It cannot consume the single-use token.
 *    The only state change is the compare-and-swap inside
 *    `redeemGuestOrderClaim` (POST /api/guest-claims/redeem).
 *  · Ownership is verified here exactly as it is at redemption, so the page can
 *    show "this order was placed with a different email" instead of failing at
 *    the last step. The `user_id` is taken from the verified session, never from
 *    the request body, and no user is ever created.
 *  · Failures are coarse on purpose: an unknown token and a token owned by
 *    another account are not distinguishable by response shape, so this cannot
 *    be used to enumerate claim tokens.
 *
 * RLS is untouched: `guest_order_claims` keeps RLS enabled with no client policy
 * and no anon/authenticated grants, so this route reaches it only via the
 * service role AFTER the bearer token has been verified.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { inspectGuestOrderClaim } from '../../../../server/payments/guestClaimService';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const FAILURE_STATUS: Record<string, number> = {
    invalid_token: 404,
    already_redeemed: 409,
    expired: 410,
    unauthorized: 403,
    db_error: 500,
};

const FAILURE_MESSAGE: Record<string, string> = {
    invalid_token: 'This claim link is not valid.',
    already_redeemed: 'This claim link has already been used.',
    expired: 'This claim link has expired.',
    unauthorized: 'This claim link belongs to a different email address.',
    db_error: 'We could not check this claim just now. Please try again.',
};

export async function POST(req: NextRequest) {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // ── 1. Require an authenticated caller ──────────────────────────────────
    const authHeader = req.headers.get('authorization') || '';
    const sessionToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!sessionToken) {
        return NextResponse.json(
            { error: 'Authentication required.' },
            { status: 401 }
        );
    }

    let userEmail: string;
    try {
        const { data, error: userErr } = await supabase.auth.getUser(sessionToken);
        const user = data?.user;
        if (userErr || !user) {
            return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
        }
        const email = typeof user.email === 'string' ? user.email.trim() : '';
        if (!email) {
            return NextResponse.json(
                { error: 'Your account has no email address, so this order cannot be verified against it.' },
                { status: 403 }
            );
        }
        userEmail = email;
    } catch {
        return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // ── 2. Read the claim token from the BODY only ──────────────────────────
    // Deliberately not read from `searchParams`: a token in a URL leaks into
    // access logs and referrers.
    let claimToken = '';
    try {
        const body: unknown = await req.json();
        if (body && typeof body === 'object' && !Array.isArray(body)) {
            const candidate = (body as Record<string, unknown>).token;
            if (typeof candidate === 'string') {
                claimToken = candidate.trim();
            }
        }
    } catch {
        /* fall through to the validation below */
    }
    if (!claimToken) {
        return NextResponse.json({ error: 'A claim token is required' }, { status: 400 });
    }

    // ── 3. Inspect (read-only) ──────────────────────────────────────────────
    const result = await inspectGuestOrderClaim({ supabase, token: claimToken, userEmail });

    if (!result.ok) {
        const status = FAILURE_STATUS[result.code] ?? 400;
        return NextResponse.json(
            { error: FAILURE_MESSAGE[result.code] ?? 'Claim could not be checked', code: result.code },
            { status }
        );
    }

    // The response deliberately contains no token, no invoice id, no amount and
    // no payment data — only what the page needs to render honestly.
    return NextResponse.json({
        ok: true,
        state: result.state,
        productId: result.productId,
        expiresAt: result.expiresAt,
    });
}
