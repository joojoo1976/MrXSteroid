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
            pdf: { usd: 20, egp: 1000 },
            paperback: { usd: 40, egp: 2000 },
        };

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const CreateInvoiceSchema = z.object({
            // userId is optional — guest users get a server-generated UUID
            userId: z.string().optional().refine(
                val => !val || val === '' || uuidRegex.test(val),
                { message: 'Invalid user ID format' }
            ),
            tierId: z.enum(['pdf', 'paperback']),
            country: z.string().min(1, 'Country is required'),
            email: z.string().email('Invalid email address'),
            fullName: z.string().min(2, 'Full name is required'),
            locale: z.enum(['ar', 'en']).optional().default('en'),
            metadata: z.record(z.string(), z.unknown()).optional().default({}),
        });
        type CreateInvoiceInput = {
            userId?: string;
            tierId: 'pdf' | 'paperback';
            country: string;
            email: string;
            fullName: string;
            locale?: 'ar' | 'en';
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
    // Generate a guest UUID if userId is missing or empty
    const effectiveUserId: string = (input.userId && input.userId.trim() !== '') 
        ? input.userId 
        : crypto.randomUUID();

    try {
        const supabase = getSupabaseAdmin();

        // ─── DETERMINE GATEWAY & PRICING ─────────────────────────────────
        const gateway = PaymentFactory.getGateway(input.country);
        const gatewayName = gateway.getGatewayName();

        // Determine currency and amount based on gateway
        const isEgypt = gatewayName === 'PAYMOB';
        const currency = isEgypt ? 'EGP' : 'USD';
        const amount = isEgypt
            ? TIER_PRICING[input.tierId].egp
            : TIER_PRICING[input.tierId].usd;

        console.log(`🏭 [CreateInvoice] Gateway: ${gatewayName}, Tier: ${input.tierId}, Amount: ${amount} ${currency}`);

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

        // ─── CALL GATEWAY TO GET REDIRECT URL ────────────────────────────
        const result = await gateway.createInvoice({
            userId: effectiveUserId,
            invoiceId,
            tierId: input.tierId,
            amount,
            currency,
            metadata: {
                email: input.email,
                fullName: input.fullName,
                locale: input.locale,
                ...input.metadata,
            },
        });

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
