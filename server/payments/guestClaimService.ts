/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  GUEST ORDER CLAIM SERVICE (option b — deferred guest entitlement)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  WHY THIS EXISTS
 *  Guest checkout is intentionally enabled: `tests/security/phase2Security.test.ts`
 *  asserts "allows guest checkout with null effectiveUserId when unauthenticated
 *  and no userId passed", and `checkoutSessionService` writes
 *  `user_id: input.userId || null`. But the fulfillment subscription and
 *  entitlement steps are both gated on `invoice.user_id`, so a captured GUEST
 *  payment used to settle the §6.3 journal and return `success` while granting
 *  NO entitlement and NO subscription. That is silent revenue loss: the money is
 *  real, the order is paid, and the customer receives nothing with no error.
 *
 *  WHAT THIS DOES INSTEAD
 *  The payment still settles financially (the §6.3 journal is posted exactly as
 *  before — the money is correctly booked). What changes is that fulfillment
 *  reports `pending_claim` instead of `success`, and a single-use claim token is
 *  issued so the guest can convert the paid order into a REAL account.
 *
 *  SECURITY PROPERTIES
 *  · The raw token is NEVER persisted. Only `sha256(token)` is stored, so a
 *    database disclosure does not yield usable claim tokens.
 *  · 256 bits of CSPRNG entropy per token (`randomBytes(32)`).
 *  · Single-use is enforced by a compare-and-swap UPDATE — a read-then-write
 *    would let two concurrent redemptions both win.
 *  · Expiry is enforced inside the same conditional UPDATE, so an expired token
 *    is un-redeemable even before a background sweeper marks it `expired`.
 *  · Redemption is bound to the guest email: the caller must be authenticated
 *    AND their account email must match, so a leaked token cannot be redeemed
 *    into a different account.
 *  · No fake user is ever created and no `user_id` is ever fabricated. The
 *    entitlement is only ever written against a real authenticated account id.
 *  · If the entitlement grant fails after the claim is consumed, the claim is
 *    COMPENSATED back to `pending` so the guest can retry instead of being
 *    locked out of a purchase they already paid for.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { grantEntitlement } from './entitlementService';

/** Default lifetime of a guest claim token. */
export const GUEST_CLAIM_TTL_HOURS = 72;

/** Byte length of the CSPRNG token. 32 bytes = 256 bits. */
const CLAIM_TOKEN_BYTES = 32;

/**
 * Normalizes an email for comparison and storage.
 *
 * Trim + lowercase is the normalization Supabase Auth itself applies, so a
 * guest who typed "Guest@Example.com" and later authenticates as
 * "guest@example.com" still matches their own claim.
 */
export function normalizeEmail(email: string | null | undefined): string {
    return String(email ?? '').trim().toLowerCase();
}

/**
 * Generates a high-entropy claim token, base64url encoded so it is safe to
 * place in a URL query string without any further escaping.
 */
export function generateClaimToken(): string {
    return crypto.randomBytes(CLAIM_TOKEN_BYTES).toString('base64url');
}

/**
 * Hashes a raw claim token to its storable digest.
 *
 * The digest is what gets indexed and compared; the raw token is only ever
 * returned to the caller for delivery. SHA-256 is sufficient here (not a
 * password) because the token is full 256-bit random entropy, so there is no
 * dictionary to brute-force — and pre-image resistance is all that is needed
 * to make a stolen digest useless.
 */
export function hashClaimToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken, 'utf8').digest('hex');
}

export interface CreateGuestClaimParams {
    supabase: SupabaseClient;
    invoiceId: string;
    paymentIntentId?: string | null;
    email: string;
    productId: string;
    ttlHours?: number;
    /** Injectable clock for deterministic tests. */
    now?: Date;
}

export interface CreateGuestClaimResult {
    claimId: string;
    /** Raw token — returned ONCE for delivery. Never stored, never logged. */
    token: string;
    email: string;
    expiresAt: string;
}

/**
 * Issues a single-use claim token for a settled guest order.
 *
 * Re-issuing supersedes any previous `pending` claim for the same invoice
 * (enforced by the `guest_order_claims_one_pending_per_invoice` unique partial
 * index) so an order can never accumulate two independently redeemable tokens.
 */
export async function createGuestOrderClaim(
    params: CreateGuestClaimParams
): Promise<CreateGuestClaimResult> {
    const { supabase, invoiceId, paymentIntentId, productId } = params;
    const email = normalizeEmail(params.email);
    if (!email) {
        throw new Error('[GuestClaim] Cannot issue a claim without a guest email');
    }
    if (!productId) {
        throw new Error('[GuestClaim] Cannot issue a claim without a product id');
    }

    const now = params.now ?? new Date();
    const ttlHours = params.ttlHours ?? GUEST_CLAIM_TTL_HOURS;
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

    // Supersede any live claim for this order so the unique partial index
    // cannot reject the insert, and so the superseded token stops working.
    await supabase
        .from('guest_order_claims')
        .update({ status: 'revoked', updated_at: now.toISOString() })
        .eq('invoice_id', invoiceId)
        .eq('status', 'pending');

    const token = generateClaimToken();

    const { data, error } = await supabase
        .from('guest_order_claims')
        .insert({
            invoice_id: invoiceId,
            payment_intent_id: paymentIntentId ?? null,
            email,
            token_hash: hashClaimToken(token),
            product_id: productId,
            status: 'pending',
            expires_at: expiresAt.toISOString(),
        })
        .select('id, expires_at')
        .single();

    if (error || !data) {
        throw new Error(
            `[GuestClaim] Failed to create claim for invoice ${invoiceId}: ${error?.message || 'unknown error'}`
        );
    }

    return {
        claimId: String(data.id),
        token,
        email,
        expiresAt: String(data.expires_at),
    };
}

export type GuestClaimFailureCode =
    | 'invalid_token'
    | 'already_redeemed'
    | 'expired'
    | 'unauthorized'
    | 'grant_failed'
    | 'db_error';

export interface InspectGuestClaimParams {
    supabase: SupabaseClient;
    /** Raw token supplied by the guest. */
    token: string;
    /** Authenticated account email, for the ownership preview. */
    userEmail: string;
    now?: Date;
}

export type InspectGuestClaimResult =
    | {
          ok: true;
          state: 'claimable';
          productId: string;
          expiresAt: string;
      }
    | { ok: false; code: GuestClaimFailureCode };

/**
 * Read-only claim inspection. Tells the claim page what it may honestly render
 * BEFORE the guest commits to a redemption, without mutating anything.
 *
 * Why this exists separately from `redeemGuestOrderClaim`: the page must be able
 * to say "sign in first", "this link expired" or "this belongs to a different
 * email" without consuming the single-use token. An auto-redeem-on-load would
 * burn the token before the guest had even authenticated, and a failed load
 * would leave a paid guest with nothing.
 *
 * Security posture, deliberately identical to the redemption path:
 *  · The caller must already be authenticated (enforced by the route) and this
 *    function still requires a non-empty `userEmail`, so an anonymous visitor
 *    learns nothing — not even whether a token exists.
 *  · An unknown token is `invalid_token` and is deliberately indistinguishable
 *    from a token owned by somebody else at the response-shape level, so the
 *    endpoint cannot be used to enumerate valid tokens.
 *  · Nothing here is a substitute for authorization: the ONLY mutation, the
 *    compare-and-swap in `redeemGuestOrderClaim`, is what actually consumes the
 *    token, and it re-checks ownership, status and expiry itself.
 */
export async function inspectGuestOrderClaim(
    params: InspectGuestClaimParams
): Promise<InspectGuestClaimResult> {
    const { supabase, token } = params;
    const userEmail = normalizeEmail(params.userEmail);
    const now = params.now ?? new Date();

    if (!token || !userEmail) {
        return { ok: false, code: 'invalid_token' };
    }

    const { data: claim, error: readError } = await supabase
        .from('guest_order_claims')
        .select('id, email, product_id, status, expires_at')
        .eq('token_hash', hashClaimToken(token))
        .maybeSingle();

    if (readError) {
        return { ok: false, code: 'db_error' };
    }
    if (!claim) {
        return { ok: false, code: 'invalid_token' };
    }

    if (claim.status === 'redeemed') {
        return { ok: false, code: 'already_redeemed' };
    }
    if (claim.status === 'revoked' || claim.status === 'expired') {
        return { ok: false, code: 'expired' };
    }
    if (new Date(String(claim.expires_at)).getTime() <= now.getTime()) {
        return { ok: false, code: 'expired' };
    }
    if (normalizeEmail(claim.email) !== userEmail) {
        return { ok: false, code: 'unauthorized' };
    }

    return {
        ok: true,
        state: 'claimable',
        productId: String(claim.product_id),
        expiresAt: String(claim.expires_at),
    };
}

export interface RedeemGuestClaimParams {
    supabase: SupabaseClient;
    /** Raw token supplied by the guest. */
    token: string;
    /** REAL authenticated account id — never fabricated. */
    userId: string;
    /** REAL authenticated account email, used for the ownership binding. */
    userEmail: string;
    now?: Date;
}

export type RedeemGuestClaimResult =
    | { ok: true; invoiceId: string; productId: string; entitlementId: string }
    | { ok: false; code: GuestClaimFailureCode };

/**
 * Redeems a guest claim for a real authenticated account and grants the
 * entitlement the guest already paid for.
 *
 * Authorization is two-factor: a valid unexpired unconsumed token AND an
 * authenticated account whose email matches the claim. Possession of the token
 * alone is deliberately NOT sufficient.
 */
export async function redeemGuestOrderClaim(
    params: RedeemGuestClaimParams
): Promise<RedeemGuestClaimResult> {
    const { supabase, token, userId } = params;
    const userEmail = normalizeEmail(params.userEmail);
    const now = params.now ?? new Date();
    const nowIso = now.toISOString();

    if (!token || !userId || !userEmail) {
        return { ok: false, code: 'invalid_token' };
    }

    const { data: claim, error: readError } = await supabase
        .from('guest_order_claims')
        .select('id, invoice_id, payment_intent_id, email, product_id, status, expires_at')
        .eq('token_hash', hashClaimToken(token))
        .maybeSingle();

    if (readError) {
        return { ok: false, code: 'db_error' };
    }
    if (!claim) {
        // Deliberately identical to an unknown token: never confirm whether a
        // token digest exists, so this cannot be used to enumerate claims.
        return { ok: false, code: 'invalid_token' };
    }

    if (claim.status === 'redeemed') {
        return { ok: false, code: 'already_redeemed' };
    }
    if (claim.status === 'revoked' || claim.status === 'expired') {
        return { ok: false, code: 'expired' };
    }
    if (new Date(String(claim.expires_at)).getTime() <= now.getTime()) {
        return { ok: false, code: 'expired' };
    }
    if (normalizeEmail(claim.email) !== userEmail) {
        // Valid token, wrong account. Do not disclose that the token exists.
        return { ok: false, code: 'unauthorized' };
    }

    // Compare-and-swap: this is what makes the token single-use. Two concurrent
    // redemptions both pass the checks above, but only one UPDATE can match
    // `status='pending'` AND `expires_at > now`, so only one caller can observe a
    // row. The expiry predicate is repeated here (not only in the pre-check)
    // because the pre-check and this UPDATE are separate round trips: a claim
    // that lapses in between must still fail closed.
    const { data: claimed, error: claimError } = await supabase
        .from('guest_order_claims')
        .update({
            status: 'redeemed',
            redeemed_at: nowIso,
            redeemed_by: userId,
            updated_at: nowIso,
        })
        .eq('id', claim.id)
        .eq('status', 'pending')
        .gt('expires_at', nowIso)
        .select('id, invoice_id, product_id, payment_intent_id');

    if (claimError) {
        return { ok: false, code: 'db_error' };
    }
    if (!Array.isArray(claimed) || claimed.length === 0) {
        // Lost the race, or the row changed underneath us.
        return { ok: false, code: 'already_redeemed' };
    }

    const won = claimed[0];
    const invoiceId = String(won.invoice_id);
    const productId = String(won.product_id);

    try {
        const granted = await grantEntitlement(
            {
                userId,
                productId,
                invoiceId,
                paymentIntentId: won.payment_intent_id ? String(won.payment_intent_id) : null,
                metadata: { source: 'guest_order_claim', claimId: String(won.id) },
            },
            supabase
        );
        return { ok: true, invoiceId, productId, entitlementId: granted.entitlementId };
    } catch {
        // Compensate: hand the token back so a transient grant failure does not
        // strand a guest who has already paid. Safe because the entitlement is
        // upserted on (user_id, product_id, invoice_id), so a retry is idempotent.
        await supabase
            .from('guest_order_claims')
            .update({ status: 'pending', redeemed_at: null, redeemed_by: null, updated_at: nowIso })
            .eq('id', won.id)
            .eq('status', 'redeemed')
            .eq('redeemed_by', userId);
        return { ok: false, code: 'grant_failed' };
    }
}

/**
 * Marks stale pending claims as `expired`.
 *
 * Purely operational: expiry is already enforced at redemption time, so this
 * sweeper only keeps reporting queries honest. It is safe to run repeatedly.
 */
export async function expireStaleGuestClaims(
    supabase: SupabaseClient,
    now?: Date
): Promise<number> {
    const nowIso = (now ?? new Date()).toISOString();
    const { data, error } = await supabase
        .from('guest_order_claims')
        .update({ status: 'expired', updated_at: nowIso })
        .eq('status', 'pending')
        .lte('expires_at', nowIso)
        .select('id');
    if (error) {
        return 0;
    }
    return Array.isArray(data) ? data.length : 0;
}

/**
 * The guest-facing claim URL. The token travels as a query parameter so the
 * redemption page can redeem it on load without any server-side session.
 */
export function buildGuestClaimUrl(rawToken: string, siteUrl?: string): string {
    const base = (siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://mrxsteroid.com').replace(
        /\/+$/,
        ''
    );
    return `${base}/claim-order?token=${encodeURIComponent(rawToken)}`;
}
