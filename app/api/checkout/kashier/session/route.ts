/**
 * Route Handler — /api/checkout/kashier/session
 *
 * Phase 4 PRIMARY checkout endpoint (Final Gate v5.1 §35–§37).
 * The website is the source of truth:
 *   - server-side pricing (amount + Egypt shipping)
 *   - server-side region/merchant/currency resolution
 *   - server-side invoice/order composition + PaymentIntent linkage
 *   - Kashier Payment Session is the primary mechanism (not payment links/pages)
 *
 * SECURITY: Requires SUPABASE_SERVICE_ROLE_KEY — never falls back to the anon key.
 * Payment is only ever confirmed server-side via the verified webhook /
 * payment-session verification — never by redirect params or the browser.
 *
 * Rate limit (§15): 10/min per IP.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import {
    createCheckoutSession,
    CheckoutValidationError,
    type CheckoutAttribution,
} from '../../../../../server/payments/checkout/checkoutSessionService';
import { BlockedGateError } from '../../../../../server/payments/merchantResolver';
import { KashierSessionError } from '../../../../../server/payments/gateways/KashierGateway';
import { enforceRateLimit, clientIp } from '../../../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[CheckoutSession] Missing SUPABASE_URL env var.');
    if (!key) throw new Error('[CheckoutSession] Missing SUPABASE_SERVICE_ROLE_KEY env var.');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CheckoutSchema = z.object({
    tierId: z.enum(['digital', 'bundle', 'coaching', 'coaching_plus', 'bundle_plus', 'digital_plus', 'pdf', 'paperback']),
    email: z.string().email('Invalid email address'),
    fullName: z.string().min(2, 'Full name is required'),
    country: z.string().min(1).optional(),
    userId: z.string().optional().refine(
        val => !val || val === '' || uuidRegex.test(val),
        { message: 'Invalid user ID format' }
    ),
    locale: z.enum(['ar', 'en']).optional(),
    quantity: z.number().int().min(1).max(99).optional(),
    shippingProviderId: z.string().optional(),
    shippingCost: z.number().min(0).optional(),
    promoCode: z.string().optional(),
    phoneNumber: z.string().optional(),
    shippingAddress: z.object({
        address: z.string().optional(),
        city: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
    }).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    idempotencyKey: z.string().min(1).max(200).optional(),
});

async function resolveAttribution(
    req: Request,
    effectiveUserId: string | null,
): Promise<CheckoutAttribution | undefined> {
    try {
        const cookieHeader = req.headers.get('cookie') || '';
        const match = cookieHeader.match(/(?:^|;\s*)mrx_ref=([^;]+)/);
        if (!match) return undefined;
        const { parseAttributionCookie, isSelfReferral } = await import('../../../../../server/affiliate/attributionService');
        const attribution = parseAttributionCookie(decodeURIComponent(match[1]));
        if (!attribution) return undefined;
        if (await isSelfReferral(attribution.affiliateId, effectiveUserId)) return undefined;
        return {
            affiliateId: attribution.affiliateId,
            referralCode: attribution.referralCode,
            attributionTimestamp: attribution.attributionTimestamp,
            attributionExpiresAt: attribution.attributionExpiresAt,
        };
    } catch {
        // Attribution must never block checkout.
        return undefined;
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key',
        },
    });
}

export async function POST(req: Request) {
    const ip = clientIp(req);
    const rate = await enforceRateLimit(`checkout:${ip}`);
    if (!rate.success) {
        return NextResponse.json(
            { success: false, error: 'Rate limit exceeded. Please try again shortly.' },
            { status: 429, headers: { 'Retry-After': '60' } },
        );
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 },
        );
    }

    const input = parsed.data;
    const idempotencyKey = req.headers.get('idempotency-key')?.trim() || input.idempotencyKey;
    const effectiveUserId = input.userId && input.userId.trim() !== '' ? input.userId : null;

    try {
        const attribution = await resolveAttribution(req, effectiveUserId);

        const result = await createCheckoutSession(
            {
                tierId: input.tierId,
                email: input.email,
                fullName: input.fullName,
                country: input.country,
                userId: effectiveUserId,
                locale: input.locale,
                quantity: input.quantity,
                shippingProviderId: input.shippingProviderId,
                shippingCost: input.shippingCost,
                promoCode: input.promoCode,
                idempotencyKey,
                attribution,
                shippingAddress: input.shippingAddress || (input.phoneNumber ? { phone: input.phoneNumber } : undefined),
                metadata: input.metadata,
            },
            { supabase: getSupabaseAdmin() },
        );

        return NextResponse.json({
            success: true,
            invoiceId: result.invoiceId,
            orderRef: result.orderRef,
            sessionId: result.sessionId,
            redirectUrl: result.sessionUrl,
            gateway: 'kashier',
            region: result.region,
            amount: result.amount,
            currency: result.currency,
            paymentMethods: result.paymentMethods,
            environment: result.environment,
            idempotent: result.idempotent,
        });
    } catch (error) {
        if (error instanceof CheckoutValidationError) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        if (error instanceof BlockedGateError) {
            return NextResponse.json({ success: false, error: error.message, blocked: true }, { status: 409 });
        }
        if (error instanceof KashierSessionError) {
            return NextResponse.json({ success: false, error: error.message }, { status: 502 });
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ [CheckoutSession] Unhandled error:', message);
        return NextResponse.json({ success: false, error: 'Internal server error', message }, { status: 500 });
    }
}
