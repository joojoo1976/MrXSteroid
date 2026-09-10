/**
 * â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
 * â•‘  ðŸ”” MULTI-GATEWAY WEBHOOK HANDLER                                        â•‘
 * â•‘  Route: /api/payments/webhook                                            â•‘
 * â•‘  Secondary webhook endpoint for payment gateway notifications             â•‘
 * â•‘  Uses the same idempotent Strategy Pattern as callback.ts                 â•‘
 * â•‘                                                                          â•‘
 * â•‘  DUAL-MODE HANDLER:                                                       â•‘
 * â•‘  Works on BOTH the Vercel Node runtime (legacy VercelRequest, which is    â•‘
 * â•‘  what this project actually receives â€” req.body) AND the Web Fetch API    â•‘
 * â•‘  signature (standard Request â€” req.text(), exact raw bytes for Stripe).   â•‘
 * â•‘  The runtime mode is detected at invocation time via the presence of a    â•‘
 * â•‘  second `res` argument.                                                   â•‘
 * â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import type { VercelRequest, VercelResponse } from './gateways/vercel-types';
import { createClient } from '@supabase/supabase-js';
import { PaymentFactory } from './gateways/PaymentFactory';
import { verifyPaidAmount } from './verifyPaidAmount';

/**
 * Admin Supabase client for the webhook handler.
 * SECURITY: no hardcoded fallback values. This handler writes to `invoices`
 * and `profiles` (subscription activation), so it must use the service-role
 * key â€” never the anon key, which would rely on RLS designed for
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//                         HELPERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//                         WEBHOOK PROCESSING
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
        let gateway = PaymentFactory.detectGatewayFromRequest(normalized);
        let gatewayName = gateway.getGatewayName();

        console.log(`ðŸ“¥ [Webhook] ${gatewayName} webhook received`);

        // Verify the webhook signature (initial attempt)
        let verification = await gateway.verifyWebhook(normalized as unknown as VercelRequest, rawBody);

        // â”€â”€â”€ KASHIER CROSS-ACCOUNT ROUTING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // If initial gateway was KASHIER_EGYPT but merchant ID didn't match,
        // retry with KASHIER_GLOBAL before rejecting.
        if (!verification.valid && (gatewayName === 'KASHIER_EGYPT' || gatewayName === 'KASHIER_GLOBAL')) {
            // Extract merchantId from payload to route to the correct account
            let payloadMerchantId: string | undefined;
            try { payloadMerchantId = (JSON.parse(rawBody) as Record<string, string>)?.merchantId; } catch { /* ignore */ }

            if (payloadMerchantId) {
                const correctGateway = PaymentFactory.detectKashierAccountFromMerchantId(payloadMerchantId);
                if (correctGateway && correctGateway.getGatewayName() !== gatewayName) {
                    console.log(`ðŸ”„ [Webhook] Cross-account routing: ${gatewayName} â†’ ${correctGateway.getGatewayName()}`);
                    gateway = correctGateway;
                    gatewayName = gateway.getGatewayName();
                    verification = await gateway.verifyWebhook(normalized as unknown as VercelRequest, rawBody);
                }
            }
        }
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        if (!verification.valid) {
            console.error(`âŒ [Webhook] ${gatewayName} verification failed:`, verification.errorMessage);
            return respond(401, { error: 'Invalid webhook signature' });
        }

        const invoiceId = verification.invoiceId;

        // â”€â”€â”€ DB-LEVEL WEBHOOK DEDUPLICATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Build a stable provider_event_id: for Kashier = transactionId, else externalReferenceId
        const providerEventId = verification.externalReferenceId || invoiceId || '';
        const payloadHash = rawBody.length > 0
            ? Buffer.from(require('crypto').createHash('sha256').update(rawBody).digest('hex')).toString('hex').slice(0, 64)
            : null;

        if (providerEventId) {
            const { error: dedupError } = await supabase
                .from('webhook_events')
                .insert({
                    provider: gatewayName.toLowerCase(),
                    merchant_account: verification.merchantId || null,
                    provider_event_id: providerEventId,
                    invoice_id: invoiceId || null,
                    event_type: verification.detailedStatus || verification.status || 'unknown',
                    payload_hash: payloadHash,
                    status: 'pending',
                });

            if (dedupError) {
                if (dedupError.code === '23505') {
                    // Unique constraint violation â†’ duplicate event
                    console.log(`âš¡ [Webhook] Duplicate event â€” provider_event_id=${providerEventId} already processed`);
                    // Update attempt count
                    await supabase
                        .from('webhook_events')
                        .update({ attempt_count: supabase.rpc('coalesce', { a: 1 }) as unknown as number, status: 'duplicate' })
                        .eq('provider', gatewayName.toLowerCase())
                        .eq('provider_event_id', providerEventId);
                    return respond(200, { status: 'ok', message: 'Duplicate event' });
                }
                // Non-fatal: log but continue processing (dedup is best-effort)
                console.warn(`[Webhook] webhook_events insert failed (non-fatal):`, dedupError.message);
            }
        }
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        // â”€â”€â”€ TIMED_OUT / UNKNOWN / UNRESOLVED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // These statuses must NOT trigger fulfillment or permanent failure.
        // Mark as pending reconciliation and return 200 to suppress gateway retries.
        const isUnresolved = !verification.status &&
            (verification.detailedStatus === 'TIMED_OUT' ||
             verification.detailedStatus === 'UNKNOWN' ||
             verification.detailedStatus === 'AUTHORIZED' ||
             !verification.detailedStatus);

        if (isUnresolved) {
            console.log(`â³ [Webhook] Unresolved status (${verification.detailedStatus}) for invoice ${invoiceId} â€” no action, pending reconciliation`);
            if (invoiceId) {
                await supabase
                    .from('invoices')
                    .update({
                        payment_status: 'unknown',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', invoiceId)
                    .in('payment_status', ['pending', 'initiated']);
            }
            // Mark webhook_events record as skipped
            if (providerEventId) {
                await supabase
                    .from('webhook_events')
                    .update({ status: 'skipped', processed_at: new Date().toISOString() })
                    .eq('provider', gatewayName.toLowerCase())
                    .eq('provider_event_id', providerEventId);
            }
            return respond(200, { status: 'ok', message: 'Event acknowledged â€” pending reconciliation' });
        }
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        // No actionable status or no invoice tracked â€” acknowledge and exit
        if (!verification.status || !invoiceId) {
            return respond(200, { status: 'ok', message: 'Event acknowledged' });
        }

        // â”€â”€â”€ INVOICE-LEVEL IDEMPOTENCY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const { data: existing } = await supabase
            .from('invoices')
            .select('status, payment_status, user_id, tier_id')
            .eq('id', invoiceId)
            .single();

        if (existing?.status === 'success' || existing?.payment_status === 'paid') {
            console.log(`âš¡ [Webhook] Invoice ${invoiceId} already processed â€” idempotent skip`);
            if (providerEventId) {
                await supabase
                    .from('webhook_events')
                    .update({ status: 'duplicate', processed_at: new Date().toISOString() })
                    .eq('provider', gatewayName.toLowerCase())
                    .eq('provider_event_id', providerEventId);
            }
            return respond(200, { status: 'ok', message: 'Already processed' });
        }
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        // â”€â”€â”€ PROCESS PAYMENT RESULT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (verification.status === 'success') {
            // Defense-in-depth: never activate on a mismatched charge.
            const amountCheck = await verifyPaidAmount(invoiceId, verification.paidAmount);
            if (!amountCheck.ok) {
                console.error(`âŒ [Webhook] Amount verification failed for ${invoiceId} â€” not activating.`);
                await supabase
                    .from('invoices')
                    .update({
                        status: 'failed',
                        payment_status: 'failed',
                        gateway_reference_id: verification.externalReferenceId || undefined,
                        kashier_transaction_id: gatewayName.startsWith('KASHIER') ? (verification.externalReferenceId || undefined) : undefined,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', invoiceId);
                if (providerEventId) {
                    await supabase
                        .from('webhook_events')
                        .update({ status: 'processed', processed_at: new Date().toISOString() })
                        .eq('provider', gatewayName.toLowerCase())
                        .eq('provider_event_id', providerEventId);
                }
                return respond(200, { status: 'ok', message: 'Amount mismatch â€” not activated' });
            }

            // 1. Update invoice to paid
            const kashierFields = gatewayName.startsWith('KASHIER') ? {
                kashier_transaction_id: verification.externalReferenceId || undefined,
                kashier_order_id: invoiceId,
            } : {};
            await supabase
                .from('invoices')
                .update({
                    status: 'success',
                    payment_status: 'paid',
                    paid_at: new Date().toISOString(),
                    gateway_reference_id: verification.externalReferenceId || undefined,
                    ...kashierFields,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', invoiceId);

            // 2. Get invoice details for profile update and affiliate commission
            const { data: invoice } = await supabase
                .from('invoices')
                .select('user_id, tier_id, affiliate_id, referral_code')
                .eq('id', invoiceId)
                .single();

            if (invoice?.user_id) {
                // 3. Activate subscription
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

                console.log(`âœ… [Webhook] Subscription activated â€” User: ${invoice.user_id}, Tier: ${invoice.tier_id}`);
            }

            // 4. Trigger affiliate commission (non-blocking, non-fatal)
            if (invoice?.affiliate_id && invoice?.referral_code) {
                try {
                    const { triggerAffiliateCommission } = await import('../affiliate/ledgerService');
                    await triggerAffiliateCommission(invoiceId);
                } catch (commErr) {
                    // Commission failure must NEVER roll back payment activation
                    console.error(`[Webhook] Commission trigger failed for ${invoiceId} (non-fatal):`, commErr);
                }
            }

        } else if (verification.status === 'failed') {
            const kashierFields = gatewayName.startsWith('KASHIER') ? {
                kashier_transaction_id: verification.externalReferenceId || undefined,
            } : {};
            await supabase
                .from('invoices')
                .update({
                    status: 'failed',
                    payment_status: 'failed',
                    ...kashierFields,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', invoiceId);

            console.log(`âŒ [Webhook] Payment failed for invoice: ${invoiceId} (${verification.detailedStatus || 'unknown'})`);
        }

        // Mark webhook_events as processed
        if (providerEventId) {
            await supabase
                .from('webhook_events')
                .update({ status: 'processed', processed_at: new Date().toISOString() })
                .eq('provider', gatewayName.toLowerCase())
                .eq('provider_event_id', providerEventId);
        }

        return respond(200, { status: 'ok' });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('âŒ [Webhook] Error:', errorMessage);
        // Return 200 to prevent gateway retries on server errors
        return respond(200, { error: 'Internal Error', message: errorMessage });
    }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//                         HANDLER (Dual-mode)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
