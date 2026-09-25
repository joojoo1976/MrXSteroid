/**
 * Route Handler — /api/payments/create-invoice
 * Creates an invoice record and routes to the correct payment gateway.
 *
 * SECURITY: Requires SUPABASE_SERVICE_ROLE_KEY — never falls back to anon key.
 */
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { PaymentFactory } from '../../../../server/payments/gateways/PaymentFactory';
import { loadPricing, computeAmount, computePromoDiscount, resolveShippingForCheckout, ShippingConfigurationError, isAmountValid } from '../../../../server/payments/pricing';
import { resolveRegion } from '../../../../server/payments/merchantResolver';
import { loadGatewayConfig, isOperationallyAllowed, isCustomerRenderable } from '../../../../server/payments/gatewayConfig';
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
    /**
     * Accepted for backward compatibility ONLY so legacy clients that still send
     * it are not rejected outright. It is never used for pricing: the shipping
     * price is resolved server-side from a canonical provider (see
     * `resolveCanonicalShippingProvider`). Sending 0 no longer buys free
     * shipping — a physical order with no resolvable provider is rejected.
     */
    shippingCost: z.number().min(0).optional(),
    /**
     * The client may express *which* carrier it wants; the server validates it
     * against its own shipping table and prices it. Never a price.
     */
    shippingProviderId: z.string().min(1).max(64).optional(),
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

/**
 * Extract the client's shipping-carrier INTENT from either request shape.
 *
 * Historical defect: the Kashier branch read
 *     input.shippingProviderId || metadata.shippingProviderId
 * while the Paymob/Stripe branch read
 *     metadata.shippingProviderId
 * only. A client that sent the carrier top-level therefore got it honoured on
 * Kashier and silently DROPPED on every other gateway — so the same request
 * priced differently depending on the payment method chosen.
 *
 * Both call sites now use this one function, so the two shapes can no longer
 * diverge. The value is only INTENT: the server validates it against the
 * configured shipping table and prices it from server config. `clientShippingCost`
 * is never an accounting input.
 */
function readShippingProviderIntent(
    input: { shippingProviderId?: string | null },
    metadata: Record<string, unknown> | undefined | null
): string | undefined {
    const top = typeof input.shippingProviderId === 'string' ? input.shippingProviderId.trim() : '';
    if (top) return top;
    const nested = metadata?.shippingProviderId;
    return typeof nested === 'string' && nested.trim() ? nested.trim() : undefined;
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

            // ── SOURCE OF TRUTH for the checkout region ──
            // The customer explicitly selects a shipping destination in the form
            // (`input.country`), so THAT is authoritative. `x-vercel-ip-country`
            // describes where the connection originates, not where the parcel
            // goes — a customer in Cairo buying for a US address, a customer
            // abroad on a VPN, or an expat in London ordering to Egypt all break
            // if the IP header overrides their stated destination. The IP header
            // is therefore a FALLBACK hint only, used when the client sent no
            // country at all. This matches the existing contract documented on
            // `CheckoutSessionInput.country` ("a ROUTING HINT only").
            const ipCountry = (req.headers.get('x-vercel-ip-country') || '').trim();
            const explicitCountry = String(input.country || '').trim();
            const secureCountryCode = (explicitCountry || ipCountry).toUpperCase();

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

            // ── Canonical gateway operational status ──
            // The Admin Dashboard has always had a three-state control per
            // gateway (`admin_settings.gateway_<name>` = disabled|sandbox|live),
            // but nothing on the server read it — the operator's choice had no
            // effect. This is the reader. Enforced AFTER gateway resolution so
            // the requested gateway is known, and BEFORE any invoice is created
            // so a stopped gateway cannot produce a session.
            //
            // This axis is deliberately separate from customer visibility:
            // `disabled` rejects initiation here, whereas `customer_visible=false`
            // only removes the option from the shopper's UI (enforced at the
            // customer-facing layer) and never disables the integration.
            //
            // Single-flight read: gateway status and pricing are both keys in
            // `admin_settings`, so they share one query on this hot path.
            let adminSettingsRowsPromise: Promise<Array<{ key: string; value: string }>> | null = null;
            const adminSettingsRows = async (): Promise<Array<{ key: string; value: string }>> => {
                adminSettingsRowsPromise ??= (async () => {
                    const { data } = await supabase.from('admin_settings').select('key, value');
                    return (data || []) as Array<{ key: string; value: string }>;
                })();
                return adminSettingsRowsPromise;
            };

            const gatewayCfg = await loadGatewayConfig(adminSettingsRows);
            const configKey = gatewayName.toLowerCase();
            if (!isOperationallyAllowed(gatewayCfg, configKey)) {
                return json({
                    success: false,
                    error: `Payment gateway "${gatewayName}" is currently ${gatewayCfg[configKey]?.operational}. Please choose another payment method.`,
                    code: 'GATEWAY_NOT_OPERATIONAL',
                    gateway: configKey,
                    operational: gatewayCfg[configKey]?.operational,
                }, 400, req);
            }
            // A gateway that is hidden from shoppers must not be startable by a
            // crafted request either. This is a server-side check precisely so
            // the hiding cannot be bypassed by bypassing the UI.
            if (!isCustomerRenderable(gatewayCfg, configKey)) {
                return json({
                    success: false,
                    error: 'This payment method is not available for checkout.',
                    code: 'GATEWAY_NOT_AVAILABLE',
                    gateway: configKey,
                }, 400, req);
            }

            // Region and currency are a PRICING decision derived from the
            // destination country. They must NOT be derived from which gateway
            // was selected: `isPaymobMethod` above makes any card/wallet/kiosk
            // request a Paymob request, so deriving region from the gateway made
            // `country: 'US'` resolve to region=egypt / EGP — the customer was
            // billed in EGP for an international shipment. The canonical resolver
            // in merchantResolver is the same one the Kashier path already uses,
            // so both paths now agree.
            const region = resolveRegion({ country: secureCountryCode });
            const isEgypt = region === 'EGYPT';

            // Paymob settles through an Egyptian merchant in EGP only. A global
            // destination cannot be collected with it; refuse explicitly rather
            // than silently charging EGP for an order we cannot ship worldwide.
            if (gatewayName === 'PAYMOB' && !isPaymobPayPal && !isEgypt) {
                return json({
                    success: false,
                    error: 'Paymob can only collect payments for Egyptian orders. Choose a payment method available in your region.',
                    code: 'PAYMENT_METHOD_REGION_MISMATCH',
                }, 400, req);
            }

            const currency = (input.paymentMethod === 'paypal' || input.paymentMethod === 'stripe') ? 'USD' : (isEgypt ? 'EGP' : 'USD');

            const pricing = await loadPricing(adminSettingsRows);

            const quantity = input.quantity ?? 1;

            // Single canonical shipping resolver, used by EVERY gateway.
            // Digital → 0; Egypt physical → 199 EGP; Global physical → rejected.
            //
            // Kashier is delegated to `createCheckoutSession` further down, which
            // calls the same resolver; pricing it here as well would compute a
            // value that is then discarded.
            let shippingCost = 0;
            if (gatewayName !== 'KASHIER') {
                // Kashier is delegated to `createCheckoutSession` further down,
                // which calls the same resolver — pricing it here as well would
                // compute a value that is then discarded.
                try {
                    const providerIntent = readShippingProviderIntent(input, input.metadata);
                    shippingCost = resolveShippingForCheckout(pricing, {
                        tierId: input.tierId,
                        region: isEgypt ? 'EGYPT' : 'GLOBAL',
                        currency,
                        requestedProviderId: providerIntent,
                        legacyClientShippingCost: input.shippingCost,
                    }).amount;
                } catch (shipErr) {
                    if (shipErr instanceof ShippingConfigurationError) {
                        return json({ success: false, error: shipErr.message, code: 'SHIPPING_UNAVAILABLE' }, 400, req);
                    }
                    throw shipErr;
                }
            }

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
                            // Legacy clients put the carrier under
                            // `metadata.shippingProviderId`; newer ones send it
                            // top-level. Both go through ONE extraction so every
                            // gateway sees the identical intent.
                            shippingProviderId: readShippingProviderIntent(input, metadata),
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
                    if (err instanceof ShippingConfigurationError) {
                        // Same code as the non-Kashier branch above: one meaning
                        // for "shipping cannot be priced" across every gateway.
                        return json({ success: false, error: err.message, code: 'SHIPPING_UNAVAILABLE' }, 400, req);
                    }
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
                    region: region.toLowerCase(),
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
