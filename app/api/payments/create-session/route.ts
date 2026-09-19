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
import type { CanonicalProductId } from '../../../../server/payments/merchantResolver';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CANONICAL_TO_TIER: Record<CanonicalProductId, TierId> = {
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
            tierId = CANONICAL_TO_TIER[body.productId as CanonicalProductId];
            if (body.withCoaching) {
                tierId = (tierId === 'coaching' ? 'coaching_plus' : `${tierId}_plus`) as TierId;
            }
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
            return NextResponse.json({ error: err.message }, { status: err.status || 502 });
        }

        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: 'Failed to create payment session', details: message }, { status: 500 });
    }
}
