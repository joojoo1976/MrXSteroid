/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔔 MULTI-GATEWAY WEBHOOK HANDLER                                        ║
 * ║  Route: /api/payments/webhook                                            ║
 * ║  Secondary webhook endpoint for payment gateway notifications             ║
 * ║  Uses the same idempotent Strategy Pattern as callback.ts                 ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { PaymentFactory } from './gateways/PaymentFactory';

// ═══════════════════════════════════════════════════════════════════════════
//                         CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!url || !key) {
        throw new Error('Missing Supabase configuration');
    }

    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
};

// ═══════════════════════════════════════════════════════════════════════════
//                         HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only accept POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabase = getSupabaseAdmin();
        const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

        // Detect gateway from request headers/params
        const gateway = PaymentFactory.detectGatewayFromRequest(req);
        const gatewayName = gateway.getGatewayName();

        console.log(`📥 [Webhook] ${gatewayName} webhook received`);

        // Verify the webhook signature
        const verification = await gateway.verifyWebhook(req, rawBody);

        if (!verification.valid) {
            console.error(`❌ [Webhook] ${gatewayName} verification failed:`, verification.errorMessage);
            return res.status(401).json({ error: 'Invalid webhook signature' });
        }

        const invoiceId = verification.invoiceId;

        // No actionable status or no invoice tracked
        if (!verification.status || !invoiceId) {
            return res.status(200).json({ status: 'ok', message: 'Event acknowledged' });
        }

        // ─── IDEMPOTENCY CHECK ───────────────────────────────────────────
        const { data: existing } = await supabase
            .from('invoices')
            .select('status')
            .eq('id', invoiceId)
            .single();

        if (existing?.status === 'success') {
            console.log(`⚡ [Webhook] Invoice ${invoiceId} already processed — idempotent skip`);
            return res.status(200).json({ status: 'ok', message: 'Already processed' });
        }

        // ─── PROCESS PAYMENT RESULT ──────────────────────────────────────
        if (verification.status === 'success') {
            // 1. Update invoice
            await supabase
                .from('invoices')
                .update({
                    status: 'success',
                    gateway_reference_id: verification.externalReferenceId || undefined,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', invoiceId);

            // 2. Get invoice details for profile update
            const { data: invoice } = await supabase
                .from('invoices')
                .select('user_id, tier_id')
                .eq('id', invoiceId)
                .single();

            if (invoice?.user_id) {
                // 3. Update user profile
                await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: invoice.tier_id,
                        subscription_status: 'active',
                        has_paid: true,
                        plan_tier: invoice.tier_id,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', invoice.user_id);

                console.log(`✅ [Webhook] Subscription activated — User: ${invoice.user_id}, Tier: ${invoice.tier_id}`);
            }
        } else if (verification.status === 'failed') {
            await supabase
                .from('invoices')
                .update({
                    status: 'failed',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', invoiceId);

            console.log(`❌ [Webhook] Payment failed for invoice: ${invoiceId}`);
        }

        return res.status(200).json({ status: 'ok' });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ [Webhook] Error:', errorMessage);
        // Return 200 to prevent gateway retries on server errors
        return res.status(200).json({ error: 'Internal Error', message: errorMessage });
    }
}
