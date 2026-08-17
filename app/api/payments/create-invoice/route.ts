/**
 * Route Handler — /api/payments/create-invoice
 * Creates an invoice record and routes to the correct payment gateway.
 * Adapted from the legacy Vercel serverless function to the App Router.
 */
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { PaymentFactory } from '../../../../api/payments/gateways/PaymentFactory';
import { loadPricing, computeAmount, computePromoDiscount, resolveShippingCost, isAmountValid } from '../../../../api/payments/pricing';

const DEFAULT_SUPABASE_URL = 'https://alghvtpkpspnqupbvodu.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZ2h2dHBrcHNwbnF1cGJ2b2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDgyMTYsImV4cCI6MjA4MTQyNDIxNn0.4en9cYMCkIwxd1pWxehb9-lP77cHgh5FhZnrBRg-yaw';

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
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
    paymentMethod: z.string().optional(),
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

            const isPaymobPayPal = input.paymentMethod === 'paypal' && input.integrationId === 5792310;
            const isPaymobMethod = ['card', 'wallet', 'kiosk', 'paypal'].includes(input.paymentMethod || '');
            const isStripeEmbedded = input.paymentMethod === 'stripe';

            let gateway: import('../../../../api/payments/gateways/IPaymentGateway').IPaymentGateway;
            let gatewayName: string;
            if (isStripeEmbedded) {
                const { StripeGateway } = await import('../../../../api/payments/gateways/StripeGateway');
                gateway = new StripeGateway();
                gatewayName = 'STRIPE';
            } else if (secureCountryCode === 'EG' || secureCountryCode === 'EGYPT' || isPaymobMethod) {
                const { PaymobGateway } = await import('../../../../api/payments/gateways/PaymobGateway');
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

            const { data: invoice, error: insertError } = await supabase
                .from('invoices')
                .insert({
                    user_id: effectiveUserId,
                    gateway: gatewayName.toLowerCase(),
                    status: 'pending',
                    tier_id: input.tierId,
                    amount,
                    currency,
                })
                .select('id')
                .single();

            if (insertError || !invoice) {
                console.error('❌ [CreateInvoice] Failed to create invoice:', insertError);
                return json({ error: 'Failed to create invoice record', details: insertError?.message }, 500);
            }

            const invoiceId = invoice.id;
            console.log(`📄 [CreateInvoice] Invoice created: ${invoiceId}`);

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
            return json({ error: 'Internal server error', message }, 500);
        }
    } catch (topLevelError) {
        const msg = topLevelError instanceof Error ? topLevelError.message : String(topLevelError);
        console.error('💥 [CreateInvoice] TOP-LEVEL CRASH:', msg);
        return json({ success: false, error: 'Server initialization error', message: msg }, 500);
    }
}
