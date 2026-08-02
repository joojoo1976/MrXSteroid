/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔔 MULTI-GATEWAY WEBHOOK HANDLER                                        ║
 * ║  Route: /api/payments/webhook                                            ║
 * ║  Secondary webhook endpoint for payment gateway notifications             ║
 * ║  Uses the same idempotent Strategy Pattern as callback.ts                 ║
 * ║                                                                          ║
 * ║  Uses the Web API (Request/Response) so the RAW request body is read      ║
 * ║  via `req.text()` — required for Stripe signature verification, since     ║
 * ║  Vercel's parser turns JSON bodies into objects and re-stringifying       ║
 * ║  breaks the signature.                                                    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import type { VercelRequest } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { PaymentFactory } from './gateways/PaymentFactory.js';

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
//                         HELPER
// ═══════════════════════════════════════════════════════════════════════════

const json = (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

/**
 * Build a VercelRequest-compatible object from a Web API Request.
 *
 * - `body` is the RAW request text (never re-stringified), so Stripe's
 *   signature check matches the exact bytes Stripe sent.
 * - `headers` and `query` are normalized for the gateway strategy detection.
 */
function buildVercelLikeRequest(req: Request, rawBody: string): VercelRequest {
    const url = new URL(req.url || 'http://localhost');
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => { query[key] = value; });

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });

    return {
        method: req.method || 'POST',
        url: req.url || '',
        headers,
        query,
        body: rawBody,
    } as unknown as VercelRequest;
}

// ═══════════════════════════════════════════════════════════════════════════
//                         HANDLER (Web API)
// ═══════════════════════════════════════════════════════════════════════════

export default async function handler(req: Request): Promise<Response> {
    // Only accept POST
    if (req.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405);
    }

    try {
        const supabase = getSupabaseAdmin();

        // Read the RAW body exactly as Stripe sent it.
        const rawBody = await req.text();
        const reqLike = buildVercelLikeRequest(req, rawBody);

        // Detect gateway from request headers/params
        const gateway = PaymentFactory.detectGatewayFromRequest(reqLike);
        const gatewayName = gateway.getGatewayName();

        console.log(`📥 [Webhook] ${gatewayName} webhook received`);

        // Verify the webhook signature
        const verification = await gateway.verifyWebhook(reqLike, rawBody);

        if (!verification.valid) {
            console.error(`❌ [Webhook] ${gatewayName} verification failed:`, verification.errorMessage);
            return json({ error: 'Invalid webhook signature' }, 401);
        }

        const invoiceId = verification.invoiceId;

        // No actionable status or no invoice tracked
        if (!verification.status || !invoiceId) {
            return json({ status: 'ok', message: 'Event acknowledged' });
        }

        // ─── IDEMPOTENCY CHECK ───────────────────────────────────────────
        const { data: existing } = await supabase
            .from('invoices')
            .select('status')
            .eq('id', invoiceId)
            .single();

        if (existing?.status === 'success') {
            console.log(`⚡ [Webhook] Invoice ${invoiceId} already processed — idempotent skip`);
            return json({ status: 'ok', message: 'Already processed' });
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

        return json({ status: 'ok' });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ [Webhook] Error:', errorMessage);
        // Return 200 to prevent gateway retries on server errors
        return json({ error: 'Internal Error', message: errorMessage });
    }
}
