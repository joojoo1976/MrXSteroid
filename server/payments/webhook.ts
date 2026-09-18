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

import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from './gateways/vercel-types';
import { createClient } from '@supabase/supabase-js';
import { PaymentFactory } from './gateways/PaymentFactory';
import { applyProviderVerdict } from './fulfillmentService';

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

        // ── Phase 5: parse once; persist provider signals (C7) ─────────────────
        // C12: `data.hash` is an internal Kashier integrity field — the handler
        // MUST explicitly NOT attempt to verify it. It is only stored raw.
        let parsedRawPayload: Record<string, unknown> = {};
        try { parsedRawPayload = rawBody.length > 0 ? JSON.parse(rawBody) : {}; } catch { /* ignore */ }

        const providerStatus = verification.providerStatus
            || String(parsedRawPayload.orderStatus ?? parsedRawPayload.status ?? parsedRawPayload.lastStatus ?? '')
            || verification.detailedStatus
            || null;
        const isReplay = verification.replay === true
            || parsedRawPayload.event === 'idempotency'
            || String(parsedRawPayload.orderStatus ?? '').toUpperCase() === 'ORDER_PAID_BEFORE';

        // Resolve the invoice's LATEST PaymentIntent try so the webhook can persist
        // the provider verdict on the attempt row and enforce the late-arrival guard.
        let currentIntentId: string | null = null;
        if (invoiceId) {
            const { data: intentRow } = await supabase
                .from('payment_intents')
                .select('id, attempt_number, is_current, status')
                .eq('invoice_id', invoiceId)
                .order('attempt_number', { ascending: false })
                .limit(1)
                .maybeSingle();
            currentIntentId = intentRow?.id || null;
        }

        // â”€â”€â”€ DB-LEVEL WEBHOOK DEDUPLICATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Build a stable provider_event_id: for Kashier = transactionId, else externalReferenceId
        const providerEventId = verification.externalReferenceId || invoiceId || '';
        const payloadHash = rawBody.length > 0
            ? crypto.createHash('sha256').update(rawBody).digest('hex')
            : null;

        if (providerEventId) {
            const { error: dedupError } = await supabase
                .from('webhook_events')
                .insert({
                    provider: gatewayName.toLowerCase(),
                    merchant_account: verification.merchantId || null,
                    provider_event_id: providerEventId,
                    transaction_id: verification.externalReferenceId || null,
                    provider_transaction_id: verification.externalReferenceId || null,
                    provider_status: providerStatus,
                    provider_operation: verification.providerOperation || 'pay',
                    payment_intent_id: currentIntentId,
                    invoice_id: invoiceId || null,
                    event_type: verification.detailedStatus || verification.status || 'unknown',
                    payload_hash: payloadHash,
                    status: 'pending',
                    processing_status: 'pending',
                    raw_payload: parsedRawPayload,
                });

            if (dedupError) {
                if (dedupError.code === '23505') {
                    // Unique constraint violation → duplicate event
                    console.log(`[Webhook] Duplicate event — provider_event_id=${providerEventId} already processed`);
                    // Atomic attempt bump via RPC (replaces the invalid rpc('coalesce')).
                    await supabase
                        .rpc('bump_webhook_attempt', {
                            p_provider: gatewayName.toLowerCase(),
                            p_provider_event_id: providerEventId,
                        });
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
        // ── C7 REPLAY GUARD ────────────────────────────────────────────────────
        // Replayed order notifications arrive as `event:"idempotency"` /
        // `ORDER_PAID_BEFORE` (spec §10): acknowledge (200), NO financial mutation.
        if (isReplay) {
            console.log(`♻️ [Webhook] ${gatewayName} replay event (${providerStatus || 'idempotency'}) — acknowledged, no mutation`);
            if (providerEventId) {
                await supabase
                    .from('webhook_events')
                    .update({
                        status: 'duplicate',
                        processing_status: 'replay',
                        processed_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('provider', gatewayName.toLowerCase())
                    .eq('provider_event_id', providerEventId);
            }
            return respond(200, { status: 'ok', message: 'Replay acknowledged — no mutation' });
        }

        const isUnresolved = !verification.status &&
            (verification.detailedStatus === 'TIMED_OUT' ||
             verification.detailedStatus === 'UNKNOWN' ||
             verification.detailedStatus === 'AUTHORIZED' ||
             !verification.detailedStatus);

        if (isUnresolved) {
            console.log(`⏳ [Webhook] Unresolved status (${verification.detailedStatus}) for invoice ${invoiceId} — no action, pending reconciliation`);
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
            // Phase 5: mirror the provider signal onto the current PaymentIntent.
            if (currentIntentId) {
                await supabase
                    .from('payment_intents')
                    .update({
                        status: 'unknown',
                        provider_status: providerStatus,
                        provider_transaction_id: verification.externalReferenceId || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', currentIntentId);
            }
            // Mark webhook_events record as skipped
            if (providerEventId) {
                await supabase
                    .from('webhook_events')
                    .update({ status: 'skipped', processed_at: new Date().toISOString() })
                    .eq('provider', gatewayName.toLowerCase())
                    .eq('provider_event_id', providerEventId);
            }
            return respond(200, { status: 'ok', message: 'Event acknowledged — pending reconciliation' });
        }
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        // No actionable status or no invoice tracked â€” acknowledge and exit
        if (!verification.status || !invoiceId) {
            return respond(200, { status: 'ok', message: 'Event acknowledged' });
        }

        // â”€â”€â”€ INVOICE-LEVEL IDEMPOTENCY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // ── Phase 7: SINGLE canonical state path (spec §11) ─────────────────
        // All mutating work — invoice/intent state, profile activation, splits,
        // ledger, entitlement, idempotency + late-arrival quarantine — is
        // delegated to applyProviderVerdict so webhook and reconciliation cron
        // resolve via the SAME code path (never a second posting).
        const fulfillment = await applyProviderVerdict({
            supabase,
            invoiceId,
            gatewayName,
            verdict: {
                status: verification.status as 'success' | 'failed',
                externalReferenceId: verification.externalReferenceId,
                paidAmount: verification.paidAmount,
                providerStatus: providerStatus || undefined,
                providerOperation: verification.providerOperation,
            },
            providerEventId,
            currentIntentId,
            providerStatus,
            source: 'webhook',
            rawBody,
        });

        if (fulfillment.code === 'quarantined') {
            return respond(200, { status: 'ok', message: 'Quarantined — late-arrival event, no mutation' });
        }
        if (fulfillment.code === 'already_processed') {
            return respond(200, { status: 'ok', message: 'Already processed' });
        }
        if (fulfillment.code === 'amount_mismatch') {
            return respond(200, { status: 'ok', message: 'Amount mismatch — not activated' });
        }
        if (fulfillment.code === 'unresolved') {
            return respond(200, { status: 'ok', message: 'Event acknowledged' });
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
