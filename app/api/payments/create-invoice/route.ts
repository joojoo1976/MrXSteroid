/**
 * Route Handler — /api/payments/create-invoice
 * Creates an invoice record and routes to the correct payment gateway.
 *
 * SECURITY: Requires SUPABASE_SERVICE_ROLE_KEY — never falls back to anon key.
 */
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { PaymentFactory } from '../../../../server/payments/gateways/PaymentFactory';
import { loadPricing, computeAmount, computePromoDiscount, resolveShippingCost, isAmountValid } from '../../../../server/payments/pricing';
import { corsPreflightResponse, buildCorsHeaders } from '../../../../server/cors/corsConfig';
import { resolveEffectiveUserId } from '../../../../server/auth/resolveUser';

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[CreateInvoice] Missing SUPABASE_URL env var.');
    if (!key) throw new Error('[CreateInvoice] Missing SUPABASE_SERVICE_ROLE_KEY env var.');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
};

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CreateInvoiceSchema = z.object({
    userId: z.string().optional().refine(
        val => !val || val === '' || uuidRegex.test(val),
        { message: 'Invalid user ID format' }
    ),
    tierId: z.enum(['digital', 'bundle', 'coaching', 'coaching_plus', 'bundle_plus', 'digital_plus', 'pdf', 'paperback']),
    country: z.string().min(1, 'Country is required'),
    email: z.string().email('Invalid email address'),
    fullName: z.string().min(2, 'Full name is required'),
    locale: z.enum(['ar', 'en']).optional().default('en'),
    paymentMethod: z.string().optional(), // 'card','wallet','kiosk','paypal','stripe','instapay','kashier'
    integrationId: z.union([z.number(), z.string()]).optional(),
    phoneNumber: z.string().optional(),
    quantity: z.number().int().min(1).max(99).optional(),
    shippingCost: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    amount: z.number().min(0).optional(),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

const json = (body: unknown, status = 200, req?: Request): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...(req ? buildCorsHeaders(req) : {}),
        },
    });

export async function OPTIONS(req: Request) {
    return corsPreflightResponse(req, 'POST, OPTIONS', 'Content-Type, Authorization');
}

export async function POST(req: Request) {
    try {
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return json({ error: 'Invalid JSON body' }, 400, req);
        }

        const parsed = CreateInvoiceSchema.safeParse(body);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            console.error('❌ [CreateInvoice] Validation failed:', errors);
            return json({ error: 'Validation failed', details: errors }, 400, req);
        }

        const input = parsed.data;

        // ── InstaPay deprecation ──────────────────────────────────────────────
        // Manual-review InstaPay now lives exclusively at POST /api/checkout/instapay
        // (uploads the receipt, creates Order + PaymentReceipt, queues admin review).
        // The legacy invoice-based flow is deliberately rejected so no parallel path exists.
        if (input.paymentMethod === 'instapay') {
            return json({
                success: false,
                error: 'InstaPay checkout has moved — please complete your order through the new receipt-upload flow.',
            }, 400, req);
        }

        // IDOR Defense: verify caller identity and forbid creating invoices for another user
        const userResolution = await resolveEffectiveUserId(req, input.userId);
        if (!userResolution.success) {
            return json({ error: userResolution.error }, userResolution.status, req);
        }
        const effectiveUserId = userResolution.effectiveUserId;

        try {
            const supabase = getSupabaseAdmin();

            const vcalCountry = req.headers.get('x-vercel-ip-country') || '';
            const secureCountryCode = vcalCountry.trim() !== '' ? vcalCountry : input.country;

            const isPaymobPayPal = input.paymentMethod === 'paypal' && input.integrationId === 5792310;
            const isPaymobMethod = ['card', 'wallet', 'kiosk', 'paypal'].includes(input.paymentMethod || '');
            const isStripeEmbedded = input.paymentMethod === 'stripe';
            const isKashier = input.paymentMethod === 'kashier';

            let gateway: import('../../../../server/payments/gateways/IPaymentGateway').IPaymentGateway | null = null;
            let gatewayName: string;
            if (isKashier) {
                // Delegated to the Phase 4 checkout session service further down.
                gatewayName = 'KASHIER';
            } else if (isStripeEmbedded) {
                const { StripeGateway } = await import('../../../../server/payments/gateways/StripeGateway');
                gateway = new StripeGateway();
                gatewayName = 'STRIPE';
            } else if (secureCountryCode === 'EG' || secureCountryCode === 'EGYPT' || isPaymobMethod) {
                const { PaymobGateway } = await import('../../../../server/payments/gateways/PaymobGateway');
                gateway = new PaymobGateway();
                gatewayName = 'PAYMOB';
            } else {
                gateway = PaymentFactory.getGateway(secureCountryCode);
                gatewayName = gateway.getGatewayName();
            }

            input.country = secureCountryCode;

            const isEgypt = gatewayName === 'PAYMOB' && !isPaymobPayPal;
            const currency = (input.paymentMethod === 'paypal' || input.paymentMethod === 'stripe') ? 'USD' : (isEgypt ? 'EGP' : 'USD');

            const pricing = await loadPricing(async () => {
                const { data } = await supabase.from('admin_settings').select('key, value');
                return (data || []) as Array<{ key: string; value: string }>;
            });

            const quantity = input.quantity ?? 1;

            const DIGITAL_TIERS = ['digital', 'digital_plus', 'pdf'];
            const isDigital = DIGITAL_TIERS.includes(input.tierId);
            const resolvedProviderId = isDigital ? '' : String(input.metadata?.shippingProviderId || '');
            const resolvedClientShipping = isDigital ? 0 : (input.shippingCost ?? 0);

            const shippingCost = resolveShippingCost(
                pricing,
                resolvedProviderId,
                resolvedClientShipping,
                currency
            );

            const subtotalForDiscount = computeAmount(pricing, {
                tierId: input.tierId,
                currency,
                quantity,
                shippingCost,
                discount: 0,
            });
            const discount = computePromoDiscount(
                String(input.metadata?.promoCode || ''),
                subtotalForDiscount,
                currency
            );

            const amount = computeAmount(pricing, {
                tierId: input.tierId,
                currency,
                quantity,
                shippingCost,
                discount,
            });

            if (input.amount !== undefined && !isAmountValid(pricing, input.amount, amount)) {
                console.warn(`⚠️ [CreateInvoice] Amount drift — client: ${input.amount}, server: ${amount} ${currency}. Using server amount.`);
            }

            console.log(`🏭 [CreateInvoice] Gateway: ${gatewayName}, Method: ${input.paymentMethod}, Tier: ${input.tierId}, Amount: ${amount} ${currency}`);

            // ── Referral Attribution (server-side, cookie only) ─────────────────────
            // Read mrx_ref cookie set by /api/referral/track. Never trust body-supplied
            // affiliate data. Validate the code server-side before persisting.
            let affiliateId: string | null = null;
            let referralCode: string | null = null;
            let attributionTimestamp: string | null = null;
            let attributionExpiresAt: string | null = null;
            try {
                const cookieHeader = req.headers.get('cookie') || '';
                const mrxRefMatch = cookieHeader.match(/(?:^|;\s*)mrx_ref=([^;]+)/);
                if (mrxRefMatch) {
                    const { parseAttributionCookie, isSelfReferral } = await import('../../../../server/affiliate/attributionService');
                    const attribution = parseAttributionCookie(decodeURIComponent(mrxRefMatch[1]));
                    if (attribution) {
                        // Self-referral check
                        const selfRef = await isSelfReferral(attribution.affiliateId, effectiveUserId);
                        if (selfRef) {
                            console.log(`🚫 [CreateInvoice] Self-referral blocked for user ${effectiveUserId}`);
                        } else {
                            affiliateId = attribution.affiliateId;
                            referralCode = attribution.referralCode;
                            attributionTimestamp = attribution.attributionTimestamp;
                            attributionExpiresAt = attribution.attributionExpiresAt;
                        }
                    }
                }
            } catch (attrErr) {
                // Attribution failure must never prevent checkout
                console.error('[CreateInvoice] Attribution parsing failed:', attrErr);
            }
            // ────────────────────────────────────────────────────────────────────────

            // ── Kashier: delegate to the single checkout service (Phase 4) ────────
            // The session endpoint path mints the Payment Session, links invoice +
            // PaymentIntent, persists idempotency, and is the source of truth.
            if (isKashier) {
                const { createCheckoutSession, CheckoutConflictError, CheckoutValidationError } =
                    await import('../../../../server/payments/checkout/checkoutSessionService');
                const { KashierSessionError } = await import('../../../../server/payments/gateways/KashierGateway');
                const { BlockedGateError } = await import('../../../../server/payments/merchantResolver');
                try {
                    const metadata = input.metadata || {};
                    const session = await createCheckoutSession(
                        {
                            tierId: input.tierId,
                            email: input.email,
                            fullName: input.fullName,
                            country: secureCountryCode,
                            userId: effectiveUserId,
                            locale: input.locale,
                            quantity: input.quantity,
                            shippingProviderId: typeof metadata.shippingProviderId === 'string'
                                ? metadata.shippingProviderId
                                : undefined,
                            shippingCost: input.shippingCost,
                            promoCode: typeof metadata.promoCode === 'string' ? metadata.promoCode : undefined,
                            shippingAddress: metadata.address
                                ? {
                                    address: typeof metadata.address === 'string' ? metadata.address : undefined,
                                    city: typeof metadata.city === 'string' ? metadata.city : undefined,
                                    zipCode: typeof metadata.zipCode === 'string' ? metadata.zipCode : undefined,
                                    phone: input.phoneNumber,
                                }
                                : (input.phoneNumber ? { phone: input.phoneNumber } : undefined),
                            attribution: (affiliateId || referralCode || attributionTimestamp)
                                ? { affiliateId, referralCode, attributionTimestamp, attributionExpiresAt }
                                : undefined,
                            metadata,
                        },
                        { supabase }
                    );

                    return json({
                        success: true,
                        invoiceId: session.invoiceId,
                        redirectUrl: session.sessionUrl,
                        gateway: 'kashier',
                        region: session.region,
                        currency: session.currency,
                        amount: session.amount,
                        environment: session.environment,
                        idempotent: session.idempotent,
                    });
                } catch (err) {
                    if (err instanceof CheckoutValidationError) {
                        return json({ success: false, error: err.message }, 400);
                    }
                    if (err instanceof CheckoutConflictError) {
                        return json({ success: false, error: err.message, retry: true }, 409);
                    }
                    if (err instanceof KashierSessionError) {
                        return json({ success: false, error: err.message }, 502);
                    }
                    if (err instanceof BlockedGateError) {
                        return json({ success: false, error: err.message, blocked: true }, 409);
                    }
                    throw err;
                }
            }
            // ────────────────────────────────────────────────────────────────────────

            const { data: invoice, error: insertError } = await supabase
                .from('invoices')
                .insert({
                    user_id: effectiveUserId,
                    gateway: gatewayName.toLowerCase(),
                    status: 'pending',
                    payment_status: 'pending',
                    tier_id: input.tierId,
                    amount,
                    currency,
                    payment_provider_merchant: gatewayName.toLowerCase(),
                    region: (secureCountryCode === 'EG' || secureCountryCode === 'EGYPT') ? 'egypt' : 'global',
                    shipping_cost: shippingCost,
                    discount_amount: discount,
                    customer_email: input.email,
                    customer_name: input.fullName,
                    phone_number: input.phoneNumber || null,
                    // Attribution (immutable after creation)
                    affiliate_id: affiliateId,
                    referral_code: referralCode,
                    attribution_timestamp: attributionTimestamp,
                    attribution_expires_at: attributionExpiresAt,
                })
                .select('id')
                .single();

            if (insertError || !invoice) {
                console.error('❌ [CreateInvoice] Failed to create invoice:', insertError);
                return json({ error: 'Failed to create invoice record' }, 500, req);
            }

            const invoiceId = invoice.id;
            console.log(`📄 [CreateInvoice] Invoice created: ${invoiceId}${referralCode ? ` (ref: ${referralCode})` : ''}`);

            const gatewayParams = {
                userId: effectiveUserId,
                invoiceId,
                tierId: input.tierId,
                amount,
                currency,
                metadata: {
                    email: input.email,
                    fullName: input.fullName,
                    locale: input.locale,
                    paymentMethod: input.paymentMethod,
                    integrationId: input.integrationId,
                    phoneNumber: input.phoneNumber,
                    quantity,
                    shippingCost,
                    discount,
                    ...input.metadata,
                },
            };

            if (!gateway) {
                return json({ error: 'No payment gateway available for this request' }, 400, req);
            }

            const result = typeof gateway.createPaymentIntent === 'function'
                ? await gateway.createPaymentIntent(gatewayParams)
                : await gateway.createInvoice(gatewayParams);

            const { error: updateError } = await supabase
                .from('invoices')
                .update({
                    gateway_reference_id: result.externalReferenceId,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', invoiceId);

            if (updateError) {
                console.warn('⚠️ [CreateInvoice] Failed to update gateway reference:', updateError);
            }

            console.log(`✅ [CreateInvoice] Success — Invoice: ${invoiceId}, Gateway: ${gatewayName}, Redirect ready`);

            return json({
                success: true,
                invoiceId,
                redirectUrl: result.redirectUrl,
                clientSecret: result.clientSecret,
                gateway: gatewayName.toLowerCase(),
            }, 200, req);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ [CreateInvoice] Unhandled error:', message);
            return json({ success: false, error: 'Internal server error' }, 500, req);
        }
    } catch (topLevelError) {
        const msg = topLevelError instanceof Error ? topLevelError.message : String(topLevelError);
        console.error('💥 [CreateInvoice] TOP-LEVEL CRASH:', msg);
        return json({ success: false, error: 'Internal server error' }, 500, req);
    }
}
