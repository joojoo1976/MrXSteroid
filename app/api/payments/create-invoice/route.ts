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

const json = (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(req: Request) {
    try {
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return json({ error: 'Invalid JSON body' }, 400);
        }

        const parsed = CreateInvoiceSchema.safeParse(body);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            console.error('❌ [CreateInvoice] Validation failed:', errors);
            return json({ error: 'Validation failed', details: errors }, 400);
        }

        const input = parsed.data;
        const effectiveUserId: string | null = (input.userId && input.userId.trim() !== '')
            ? input.userId
            : null;

        try {
            const supabase = getSupabaseAdmin();

            const vcalCountry = req.headers.get('x-vercel-ip-country') || '';
            const secureCountryCode = vcalCountry.trim() !== '' ? vcalCountry : input.country;

            const isInstaPay = input.paymentMethod === 'instapay';
            const isPaymobPayPal = input.paymentMethod === 'paypal' && input.integrationId === 5792310;
            const isPaymobMethod = ['card', 'wallet', 'kiosk', 'paypal'].includes(input.paymentMethod || '');
            const isStripeEmbedded = input.paymentMethod === 'stripe';
            const isKashier = input.paymentMethod === 'kashier';

            let gateway: import('../../../../server/payments/gateways/IPaymentGateway').IPaymentGateway | null = null;
            let gatewayName: string;
            if (isInstaPay) {
                gatewayName = 'INSTAPAY';
            } else if (isStripeEmbedded) {
                const { StripeGateway } = await import('../../../../server/payments/gateways/StripeGateway');
                gateway = new StripeGateway();
                gatewayName = 'STRIPE';
            } else if (isKashier) {
                // Kashier: Egypt merchant for EG, Global merchant for everyone else.
                // Currency is resolved server-side; never trust client-supplied currency.
                const { KashierGateway } = await import('../../../../server/payments/gateways/KashierGateway');
                if (secureCountryCode === 'EG' || secureCountryCode === 'EGYPT') {
                    gateway = new KashierGateway('egypt');
                    gatewayName = 'KASHIER_EGYPT';
                } else {
                    gateway = new KashierGateway('global');
                    gatewayName = 'KASHIER_GLOBAL';
                }
            } else if (secureCountryCode === 'EG' || secureCountryCode === 'EGYPT' || isPaymobMethod) {
                const { PaymobGateway } = await import('../../../../server/payments/gateways/PaymobGateway');
                gateway = new PaymobGateway();
                gatewayName = 'PAYMOB';
            } else {
                gateway = PaymentFactory.getGateway(secureCountryCode);
                gatewayName = gateway.getGatewayName();
            }

            input.country = secureCountryCode;

            const isEgypt = (gatewayName === 'PAYMOB' && !isPaymobPayPal) || gatewayName === 'INSTAPAY' || gatewayName === 'KASHIER_EGYPT';
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
                return json({ error: 'Failed to create invoice record', details: insertError?.message }, 500);
            }

            const invoiceId = invoice.id;
            console.log(`📄 [CreateInvoice] Invoice created: ${invoiceId}${referralCode ? ` (ref: ${referralCode})` : ''}`);


            if (isInstaPay) {
                const refText = String(input.metadata?.instapayReference || input.phoneNumber || '');
                const waText = encodeURIComponent(
                    `مرحباً كابتن، لقد قمت بطلب الاشتراك عبر إنستاباي:\n- رقم الفاتورة: #${invoiceId.slice(0, 8)}\n- الباقة: ${input.tierId}\n- المبلغ: ${amount} ج.م\n- الاسم: ${input.fullName}\n- البريد: ${input.email}\n- رقم التحويل/المرجع: ${refText}`
                );

                await supabase
                    .from('invoices')
                    .update({
                        gateway_reference_id: `INSTAPAY-${refText || invoiceId.slice(0, 8)}`,
                        metadata: { ...input.metadata, instapayAddress: 'jan.ghattas@instapay' },
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', invoiceId);

                return json({
                    success: true,
                    invoiceId,
                    gateway: 'instapay',
                    redirectUrl: `/payment-pending?gateway=instapay&txn=${invoiceId}&wa=${waText}`,
                });
            }

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
                return json({ error: 'No payment gateway available for this request' }, 400);
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
            });

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ [CreateInvoice] Unhandled error:', message);
            return json({ success: false, error: 'Internal server error', message }, 500);
        }
    } catch (topLevelError) {
        const msg = topLevelError instanceof Error ? topLevelError.message : String(topLevelError);
        console.error('💥 [CreateInvoice] TOP-LEVEL CRASH:', msg);
        return json({ success: false, error: 'Server initialization error', message: msg }, 500);
    }
}
