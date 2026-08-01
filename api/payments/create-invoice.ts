/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🧾 CREATE INVOICE — Vercel Serverless Function                          ║
 * ║  Route: /api/payments/create-invoice                                     ║
 * ║  Creates an invoice record and routes to the correct payment gateway     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// ═══════════════════════════════════════════════════════════════════════════
//                          MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // ─── TOP-LEVEL ERROR BOUNDARY ────────────────────────────────────
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const { z } = await import('zod');
        const { PaymentFactory } = await import('./gateways/PaymentFactory.js');

        const CONFIG = {
            SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        };

        const getSupabaseAdmin = () => {
            if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_SERVICE_ROLE_KEY) {
                throw new Error('Missing Supabase configuration');
            }
            return createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY, {
                auth: { autoRefreshToken: false, persistSession: false },
            });
        };

        const TIER_PRICING: Record<string, { usd: number; egp: number }> = {
            digital: { usd: 49.99, egp: 499 },
            bundle: { usd: 72.00, egp: 750 },
            coaching: { usd: 82.00, egp: 750 },
            coaching_plus: { usd: 200.00, egp: 750 },
            // Legacy mapping
            pdf: { usd: 49.99, egp: 499 },
            paperback: { usd: 72.00, egp: 750 },
        };

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const CreateInvoiceSchema = z.object({
            // userId is optional — guest users get a server-generated UUID
            userId: z.string().optional().refine(
                val => !val || val === '' || uuidRegex.test(val),
                { message: 'Invalid user ID format' }
            ),
            tierId: z.enum(['digital', 'bundle', 'coaching', 'coaching_plus', 'pdf', 'paperback']),
            country: z.string().min(1, 'Country is required'),
            email: z.string().email('Invalid email address'),
            fullName: z.string().min(2, 'Full name is required'),
            locale: z.enum(['ar', 'en']).optional().default('en'),
            paymentMethod: z.string().optional(),
            integrationId: z.union([z.number(), z.string()]).optional(),
            phoneNumber: z.string().optional(),
            metadata: z.record(z.string(), z.unknown()).optional().default({}),
        });
        type CreateInvoiceInput = {
            userId?: string;
            tierId: 'digital' | 'bundle' | 'coaching' | 'coaching_plus' | 'pdf' | 'paperback';
            country: string;
            email: string;
            fullName: string;
            locale?: 'ar' | 'en';
            paymentMethod?: string;
            integrationId?: number | string;
            phoneNumber?: string;
            metadata?: Record<string, unknown>;
        };

        // ─── CORS (allow production + localhost) ─────────────────────────
        const origin = req.headers.origin || '';
        const allowedOrigins = [
            'https://mrxsteroid.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:4173',
        ];
        const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
        res.setHeader('Access-Control-Allow-Origin', corsOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

    // ─── VALIDATE INPUT ──────────────────────────────────────────────────
    const parsed = CreateInvoiceSchema.safeParse(req.body);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        console.error('❌ [CreateInvoice] Validation failed:', errors);
        return res.status(400).json({
            error: 'Validation failed',
            details: errors,
        });
    }

    const input: CreateInvoiceInput = parsed.data;
    // For guest users, we MUST set user_id to NULL to avoid foreign key violations with public.profiles
    const effectiveUserId: string | null = (input.userId && input.userId.trim() !== '') 
        ? input.userId 
        : null;

    try {
        const supabase = getSupabaseAdmin();

        // ─── DETERMINE GATEWAY & PRICING ─────────────────────────────────
        // SECURE GEOLOCATION: Vercel header overrides the client payload for country detection.
        // However, if client explicitly selects 'paypal' method (outside Egypt via Paymob),
        // we still route through Paymob gateway with the PayPal integration ID (5792310).
        const vcalCountry = (req.headers['x-vercel-ip-country'] as string) || '';
        const secureCountryCode = vcalCountry.trim() !== '' ? vcalCountry : input.country;
        
        // Determine if user is explicitly requesting Paymob PayPal (outside Egypt flow)
        const isPaymobPayPal = input.paymentMethod === 'paypal' && input.integrationId === 5792310;
        const isPaymobMethod = ['card', 'wallet', 'kiosk', 'paypal'].includes(input.paymentMethod || '');
        const isStripeEmbedded = input.paymentMethod === 'stripe';
        
        // Use Paymob factory gateway for EG country OR when Paymob method explicitly selected.
        // Stripe embedded flow (Link by Stripe) always routes through Stripe regardless of country.
        let gateway: import('./gateways/IPaymentGateway.js').IPaymentGateway;
        let gatewayName: string;
        if (isStripeEmbedded) {
            const { StripeGateway } = await import('./gateways/StripeGateway.js');
            gateway = new StripeGateway();
            gatewayName = 'STRIPE';
        } else if (secureCountryCode === 'EG' || secureCountryCode === 'EGYPT' || isPaymobMethod) {
            const { PaymobGateway } = await import('./gateways/PaymobGateway.js');
            gateway = new PaymobGateway();
            gatewayName = 'PAYMOB';
        } else {
            gateway = PaymentFactory.getGateway(secureCountryCode);
            gatewayName = gateway.getGatewayName();
        }
        
        // Ensure downstream functions utilize the verified country code
        input.country = secureCountryCode;

        // Determine currency and amount based on gateway/region
        const isEgypt = gatewayName === 'PAYMOB' && !isPaymobPayPal;
        const currency = (input.paymentMethod === 'paypal' || input.paymentMethod === 'stripe') ? 'USD' : (isEgypt ? 'EGP' : 'USD');
        const amount = isEgypt
            ? TIER_PRICING[input.tierId].egp
            : TIER_PRICING[input.tierId].usd;

        console.log(`🏭 [CreateInvoice] Gateway: ${gatewayName}, Method: ${input.paymentMethod}, Integration: ${input.integrationId}, Tier: ${input.tierId}, Amount: ${amount} ${currency}`);

        // ─── CREATE INVOICE RECORD (Pending) ─────────────────────────────
        const { data: invoice, error: insertError } = await supabase
            .from('invoices')
            .insert({
                user_id: effectiveUserId,
                gateway: gatewayName.toLowerCase(), // 'stripe', 'paymob', 'spaceremit'
                status: 'pending',
                tier_id: input.tierId,
                amount,
                currency,
            })
            .select('id')
            .single();

        if (insertError || !invoice) {
            console.error('❌ [CreateInvoice] Failed to create invoice:', insertError);
            return res.status(500).json({
                error: 'Failed to create invoice record',
                details: insertError?.message,
            });
        }

        const invoiceId = invoice.id;
        console.log(`📄 [CreateInvoice] Invoice created: ${invoiceId}`);

        // ─── CALL GATEWAY TO GET REDIRECT URL OR CLIENT SECRET ──────────
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
                ...input.metadata,
            },
        };

        const result = typeof gateway.createPaymentIntent === 'function'
            ? await gateway.createPaymentIntent(gatewayParams)
            : await gateway.createInvoice(gatewayParams);

        // ─── UPDATE INVOICE WITH GATEWAY REFERENCE ───────────────────────
        const { error: updateError } = await supabase
            .from('invoices')
            .update({
                gateway_reference_id: result.externalReferenceId,
                updated_at: new Date().toISOString(),
            })
            .eq('id', invoiceId);

        if (updateError) {
            console.warn('⚠️ [CreateInvoice] Failed to update gateway reference:', updateError);
            // Non-fatal — the invoice is created and the redirect URL is valid
        }

        console.log(`✅ [CreateInvoice] Success — Invoice: ${invoiceId}, Gateway: ${gatewayName}, Redirect ready`);

        // ─── RETURN TO FRONTEND ──────────────────────────────────────────
        return res.status(200).json({
            success: true,
            invoiceId,
            redirectUrl: result.redirectUrl,
            clientSecret: result.clientSecret,
            gateway: gatewayName.toLowerCase(),
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ [CreateInvoice] Unhandled error:', message);
        return res.status(500).json({
            error: 'Internal server error',
            message,
        });
    }
    } catch (topLevelError) {
        // This catches ANY crash — import failures, missing env, syntax issues, etc.
        const msg = topLevelError instanceof Error ? topLevelError.message : String(topLevelError);
        console.error('💥 [CreateInvoice] TOP-LEVEL CRASH:', msg);
        return res.status(500).json({
            success: false,
            error: 'Server initialization error',
            message: msg,
        });
    }
}
