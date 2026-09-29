/**
 * Route Handler — /api/payments/create-session
 * Canonical endpoint specified by Final Gate v5.1 §62.
 * Delegates to checkoutSessionService while accepting canonical product IDs
 * (MRX-PROTOCOL, MRX-TACTICAL, MRX-SMART-PRO) or legacy tier IDs.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    createCheckoutSession,
    CheckoutValidationError,
    CheckoutConflictError,
} from '../../../../server/payments/checkout/checkoutSessionService';
import { BlockedGateError } from '../../../../server/payments/merchantResolver';
import { KashierSessionError } from '../../../../server/payments/gateways/KashierGateway';
import { enforceRateLimit, clientIp } from '../../../../lib/ratelimit';
import type { TierId } from '../../../../server/payments/pricing';
import {
    CANONICAL_PRODUCTS,
    type CanonicalProductId,
} from '../../../../server/payments/merchantResolver';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Only the checkout-eligible canonical products resolve to a tier here.
 *
 * The set is DERIVED from the authoritative `CanonicalProductId` union by
 * excluding the AUP §13 service products (`MRX-COACHING-ADDON`,
 * `MRX-CONSULTATION`), which are BLOCKED from checkout — and therefore from
 * GLOBAL/USD (Fourthwall) — and must not be resolvable to any gateway tier.
 * Because the blocked products are excluded at the type level, the map stays
 * type-complete and those products can never be looked up to open a session.
 */
type CheckoutEligibleProductId = Exclude<CanonicalProductId, 'MRX-COACHING-ADDON' | 'MRX-CONSULTATION'>;

const CANONICAL_TO_TIER: Record<CheckoutEligibleProductId, TierId> = {
    'MRX-PROTOCOL': 'digital',
    'MRX-TACTICAL': 'bundle',
    'MRX-SMART-PRO': 'coaching',
};

export async function POST(req: NextRequest) {
    const ip = clientIp(req);
    const rate = await enforceRateLimit(`checkout-session:${ip}`);
    if (!rate.success) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Please wait a moment and try again.' },
            { status: 429, headers: { 'Retry-After': '60' } }
        );
    }

    try {
        const body = await req.json().catch(() => ({}));
        let tierId: TierId = body.tierId;

        // Support canonical product ID resolution (§60.1)
        if (body.productId && body.productId in CANONICAL_TO_TIER) {
            tierId = CANONICAL_TO_TIER[body.productId as CheckoutEligibleProductId];
            if (body.withCoaching) {
                tierId = (tierId === 'coaching' ? 'coaching_plus' : `${tierId}_plus`) as TierId;
            }
        } else if (
            body.productId &&
            typeof body.productId === 'string' &&
            body.productId in CANONICAL_PRODUCTS
        ) {
            // A real canonical product that is NOT in the checkout-eligible map.
            // Coaching add-on and consultation are AUP §13 service products
            // BLOCKED from checkout (and hence from GLOBAL/USD/Fourthwall).
            // Fail openly here rather than fall through to a legacy tier lookup
            // that could route one of the blocked products to a gateway.
            return NextResponse.json(
                { error: `Product "${body.productId}" is not available for checkout.` },
                { status: 400 }
            );
        }

        if (!tierId) {
            return NextResponse.json(
                { error: 'Either productId (MRX-PROTOCOL, MRX-TACTICAL, MRX-SMART-PRO) or tierId is required.' },
                { status: 400 }
            );
        }

        const session = await createCheckoutSession({
            tierId,
            email: body.email,
            fullName: body.fullName,
            country: body.country,
            userId: body.userId,
            locale: body.locale,
            quantity: body.quantity,
            shippingProviderId: body.shippingProviderId,
            shippingCost: body.shippingCost,
            shippingAddress: body.shippingAddress,
            promoCode: body.promoCode,
            idempotencyKey: body.idempotencyKey,
            attribution: body.attribution,
            metadata: body.metadata,
        });

        return NextResponse.json(session, { status: 200 });
    } catch (err: unknown) {
        if (err instanceof CheckoutValidationError) {
            return NextResponse.json({ error: err.message }, { status: 400 });
        }
        if (err instanceof CheckoutConflictError) {
            return NextResponse.json({ error: err.message }, { status: 409 });
        }
        if (err instanceof BlockedGateError) {
            return NextResponse.json({ error: err.message, gate: err.blockedItem }, { status: 503 });
        }
          if (err instanceof KashierSessionError) {
              console.error(`[CreateSession] payment_start_failed: ${err.message}`);
              return NextResponse.json(
                  { error: 'Payment could not be started. Please try again.' },
                  { status: err.status && err.status >= 400 && err.status < 500 ? err.status : 502 },
              );
          }

        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: 'Failed to create payment session', details: message }, { status: 500 });
    }
}
