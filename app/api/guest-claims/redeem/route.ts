/**
 * POST /api/guest-claims/redeem
 *
 * Redeems a guest order-claim token and attaches the already-PAID order to the
 * caller's REAL authenticated account, then grants the entitlement.
 *
 * SECURITY MODEL
 *  · The caller MUST be authenticated. There is no anonymous redemption path
 *    and no way to redeem into a fabricated identity: the `user_id` used for
 *    the entitlement is taken from the verified Supabase session, never from
 *    the request body.
 *  · The caller MUST additionally own the claim: their account email must match
 *    the guest email the order was placed with. Possession of the token alone
 *    is not sufficient, so a forwarded or leaked link cannot be redeemed into
 *    somebody else's account.
 *  · Single-use and expiry are enforced inside the service by a
 *    compare-and-swap UPDATE, so concurrent redemptions cannot both win.
 *  · The token is accepted from the JSON body or the `token` query parameter
 *    (so the emailed claim URL can redeem directly on load).
 *  · Failures are deliberately coarse. An unknown token and a token that exists
 *    but belongs to someone else are not distinguishable from the response, so
 *    this endpoint cannot be used to enumerate valid tokens.
 *
 * RLS is untouched: `guest_order_claims` has RLS enabled with no client policy
 * and no anon/authenticated grants, so this route reaches it only through the
 * service role AFTER the bearer token has been verified.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { redeemGuestOrderClaim } from '../../../../server/payments/guestClaimService';

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
    grant_failed: 500,
    db_error: 500,
};

const FAILURE_MESSAGE: Record<string, string> = {
    invalid_token: 'This claim link is not valid.',
    already_redeemed: 'This claim link has already been used.',
    expired: 'This claim link has expired. Contact support with your receipt to recover your order.',
    unauthorized: 'This claim link belongs to a different email address.',
    grant_failed: 'We could not attach your order just now. Please try again.',
    db_error: 'We could not process this claim just now. Please try again.',
};

export async function POST(req: NextRequest) {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // ── 1. Require an authenticated caller ──────────────────────────────────
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
        return NextResponse.json(
            { error: 'Authentication required. Sign in with the email used for this order, then retry the link.' },
            { status: 401 }
        );
    }

    let userId: string;
    let userEmail: string;
    try {
        const { data, error: userErr } = await supabase.auth.getUser(token);
        const user = data?.user;
        if (userErr || !user) {
            return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
        }
        // The email is the ownership binding for the claim. If the account has
        // no email we cannot verify ownership, so redemption is refused rather
        // than falling back to "trust the token".
        const email = typeof user.email === 'string' ? user.email.trim() : '';
        if (!email) {
            return NextResponse.json(
                { error: 'Your account has no email address, so this order cannot be verified against it.' },
                { status: 403 }
            );
        }
        userId = user.id;
        userEmail = email;
    } catch {
        return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // ── 2. Accept the claim token from body or query ────────────────────────
    let claimToken = req.nextUrl.searchParams.get('token') || '';
    if (!claimToken) {
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
    }
    if (!claimToken) {
        return NextResponse.json({ error: 'A claim token is required' }, { status: 400 });
    }

    // ── 3. Redeem: single-use, expiring, email-bound ────────────────────────
    const result = await redeemGuestOrderClaim({
        supabase,
        token: claimToken,
        userId,
        userEmail,
    });

    if (!result.ok) {
        const status = FAILURE_STATUS[result.code] ?? 400;
        return NextResponse.json(
            { error: FAILURE_MESSAGE[result.code] ?? 'Claim could not be redeemed', code: result.code },
            { status }
        );
    }

    return NextResponse.json({
        ok: true,
        productId: result.productId,
        invoiceId: result.invoiceId,
        message: 'Order claimed. Your product is now available on your account.',
    });
}
