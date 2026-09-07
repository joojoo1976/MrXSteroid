/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔔 MULTI-GATEWAY WEBHOOK HANDLER                                        ║
 * ║  Route: /api/payments/webhook                                            ║
 * ║  Secondary webhook endpoint for payment gateway notifications             ║
 * ║  Uses the same idempotent Strategy Pattern as callback.ts                 ║
 * ║                                                                          ║
 * ║  DUAL-MODE HANDLER:                                                       ║
 * ║  Works on BOTH the Vercel Node runtime (legacy VercelRequest, which is    ║
 * ║  what this project actually receives — req.body) AND the Web Fetch API    ║
 * ║  signature (standard Request — req.text(), exact raw bytes for Stripe).   ║
 * ║  The runtime mode is detected at invocation time via the presence of a    ║
 * ║  second `res` argument.                                                   ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import type { VercelRequest, VercelResponse } from './gateways/vercel-types';
import { createClient } from '@supabase/supabase-js';
import { PaymentFactory } from './gateways/PaymentFactory';
import { verifyPaidAmount } from './verifyPaidAmount';

/**
 * Admin Supabase client for the webhook handler.
 * SECURITY: no hardcoded fallback values. This handler writes to `invoices`
 * and `profiles` (subscription activation), so it must use the service-role
 * key — never the anon key, which would rely on RLS designed for
 * unprivileged clients and could silently under- or over-permission this
 * write path. Fail loudly at startup instead of degrading silently.
 */
const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) {
        throw new Error('[Webhook] Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL env var.');
    }
    if (!key) {
        throw new Error('[Webhook] Missing SUPABASE_SERVICE_ROLE_KEY env var. The anon key must not be used here.');
    }

    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
};

// ═══════════════════════════════════════════════════════════════════════════
//                         HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const json = (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

/**
 * Normalize a request (either a web Request or a VercelRequest) into the plain
 * `{ headers, query }` shape that PaymentFactory.detectGatewayFromRequest and
 * the gateway verification strategies consume.
 */
function normalizeRequest(req: VercelRequest | Request): {
    headers: Record<string, string>;
    query: Record<string, string>;
} {
    const headers: Record<string, string> = {};
    const headerSource = (req as Request).headers;

    if (typeof (headerSource as Headers | undefined)?.forEach === 'function') {
        (headerSource as Headers).forEach((value, key) => {
            headers[key.toLowerCase()] = value;
        });
    } else if (headerSource) {
        Object.entries(headerSource as unknown as Record<string, unknown>).forEach(([key, value]) => {
            headers[key.toLowerCase()] = Array.isArray(value) ? value.join(',') : String(value ?? '');
        });
    }

    const query: Record<string, string> = {};
    const legacyReq = req as VercelRequest;

    if (legacyReq.query && typeof legacyReq.query === 'object') {
        Object.entries(legacyReq.query).forEach(([key, value]) => {
            query[key] = Array.isArray(value) ? value[0] : String(value ?? '');
        });
    } else {
        try {
            const url = new URL(req.url || 'http://localhost');
            url.searchParams.forEach((value, key) => {
                query[key] = value;
            });
        } catch {
            // Ignore malformed URLs
        }
    }

    return { headers, query };
}

/**
 * Extract the raw request body as a string.
 * - Web API Request: exact raw bytes via `req.text()` (required for Stripe).
 * - VercelRequest: the platform already parsed the body, so best-effort stringify.
 */
async function readRawBody(req: VercelRequest | Request): Promise<string> {
    const asRequest = req as Request;

    if (typeof asRequest.text === 'function') {
        return asRequest.text();
    }

    const body = (req as VercelRequest).body;
    return typeof body === 'string' ? body : JSON.stringify(body ?? {});
}

// ═══════════════════════════════════════════════════════════════════════════
//                         WEBHOOK PROCESSING
// ═══════════════════════════════════════════════════════════════════════════

type RespondFn = (status: number, body: unknown) => Response | void;

async function processWebhook(
    req: VercelRequest | Request,
    rawBody: string,
    respond: RespondFn
): Promise<Response | void> {
    try {
        const supabase = getSupabaseAdmin();

        // Detect gateway from request headers/params
        const normalized = normalizeRequest(req);
        const gateway = PaymentFactory.detectGatewayFromRequest(normalized);
        const gatewayName = gateway.getGatewayName();

        console.log(`📥 [Webhook] ${gatewayName} webhook received`);

        // Verify the webhook signature
        const verification = await gateway.verifyWebhook(normalized as unknown as VercelRequest, rawBody);

        if (!verification.valid) {
            console.error(`❌ [Webhook] ${gatewayName} verification failed:`, verification.errorMessage);
            return respond(401, { error: 'Invalid webhook signature' });
        }

        const invoiceId = verification.invoiceId;

        // No actionable status or no invoice tracked
        if (!verification.status || !invoiceId) {
            return respond(200, { status: 'ok', message: 'Event acknowledged' });
        }

        // ─── IDEMPOTENCY CHECK ───────────────────────────────────────────
        const { data: existing } = await supabase
            .from('invoices')
            .select('status')
            .eq('id', invoiceId)
            .single();

        if (existing?.status === 'success') {
            console.log(`⚡ [Webhook] Invoice ${invoiceId} already processed — idempotent skip`);
            return respond(200, { status: 'ok', message: 'Already processed' });
        }

        // ─── PROCESS PAYMENT RESULT ──────────────────────────────────────
        if (verification.status === 'success') {
            // Defense-in-depth: never activate on a mismatched charge.
            const amountCheck = await verifyPaidAmount(invoiceId, verification.paidAmount);
            if (!amountCheck.ok) {
                console.error(`❌ [Webhook] Amount verification failed for ${invoiceId} — not activating.`);
                await supabase
                    .from('invoices')
                    .update({
                        status: 'failed',
                        gateway_reference_id: verification.externalReferenceId || undefined,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', invoiceId);
                return respond(200, { status: 'ok', message: 'Amount mismatch — not activated' });
            }

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

        return respond(200, { status: 'ok' });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ [Webhook] Error:', errorMessage);
        // Return 200 to prevent gateway retries on server errors
        return respond(200, { error: 'Internal Error', message: errorMessage });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//                         HANDLER (Dual-mode)
// ═══════════════════════════════════════════════════════════════════════════

export default async function handler(
    req: VercelRequest | Request,
    res?: VercelResponse
): Promise<Response | void> {
    const isWebHandler = !res;

    const respond: RespondFn = isWebHandler
        ? (status, body) => json(body, status)
        : (status, body) => {
              res!.status(status).json(body);
          };

    // Only accept POST
    if (req.method !== 'POST') {
        return respond(405, { error: 'Method not allowed' });
    }

    const rawBody = await readRawBody(req);
    return processWebhook(req, rawBody, respond);
}