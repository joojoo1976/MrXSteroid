/**
 * Route Handler — /api/payments/callback
 * Multi-gateway callback handler (GET redirect callbacks + POST webhooks).
 *
 * SECURITY:
 * - GET callback is ADVISORY ONLY — does NOT activate subscriptions.
 *   Subscription activation happens exclusively via the POST webhook.
 * - Requires SUPABASE_SERVICE_ROLE_KEY — never falls back to anon key.
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { PaymentFactory } from '../../../../server/payments/gateways/PaymentFactory';
import { applyProviderVerdict } from '../../../../server/payments/fulfillmentService';
import { ingestRefundEvent } from '../../../../server/payments/refund/refundEvent';
import { corsPreflightResponse } from '../../../../server/cors/corsConfig';


const APP_BASE = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.mrxsteroid.com';

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[Callback] Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL env var.');
    if (!key) throw new Error('[Callback] Missing SUPABASE_SERVICE_ROLE_KEY env var. Anon key must NOT be used here.');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
};

const json = (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

const redirect = (url: string): Response =>
    new Response(null, { status: 302, headers: { Location: url } });

/** GET is advisory-only: read the webhook-written invoice status. */
async function isAlreadyProcessed(invoiceId: string): Promise<boolean> {
    if (!invoiceId) return false;
    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('invoices')
            .select('status, payment_status, metadata')
            .eq('id', invoiceId)
            .single();
        if (error || !data) return false;
        const state = data.metadata?.payment_state;
        if (data.status === 'success' || data.payment_status === 'paid' || state === 'fulfilled') {
            console.log(`⚡ [Idempotency] Invoice ${invoiceId} already processed — skipping.`);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

/**
 * Normalize a Web Fetch Request into the `{ headers, query }` shape that
 * PaymentFactory.detectGatewayFromRequest and the gateway verifiers consume.
 */
function normalizeRequest(req: Request): { headers: Record<string, string>; query: Record<string, string> } {
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
    });

    const query: Record<string, string> = {};
    try {
        const url = new URL(req.url || 'http://localhost');
        url.searchParams.forEach((value, key) => {
            query[key] = value;
        });
    } catch {
        // Ignore malformed URLs
    }

    return { headers, query };
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const invoiceId = url.searchParams.get('txn') || url.searchParams.get('reference_id') || url.searchParams.get('orderId') || '';
        const paymentStatus = (url.searchParams.get('paymentStatus') || url.searchParams.get('status') || '').toUpperCase();
        const planId = url.searchParams.get('plan_id') || '';
        const source = url.searchParams.get('source') || '';

        console.log(`📥 [Callback:GET] Invoice: ${invoiceId}, Status: ${paymentStatus}, Source: ${source}, Query: ${url.search} — advisory redirect`);

        // Check for explicit cancellation or failure from query params
        if (paymentStatus === 'FAILED' || paymentStatus === 'DECLINED' || paymentStatus === 'CANCELLED') {
            return redirect(`${APP_BASE}/cancel?txn=${encodeURIComponent(invoiceId)}&reason=${encodeURIComponent(paymentStatus)}`);
        }

        // GET callback is ADVISORY ONLY.
        // We read the CURRENT invoice status from our DB (set by the webhook) and redirect.
        if (invoiceId) {
            if (await isAlreadyProcessed(invoiceId)) {
                const planQuery = planId ? `&plan_id=${encodeURIComponent(planId)}` : '';
                return redirect(`${APP_BASE}/success?txn=${encodeURIComponent(invoiceId)}${planQuery}`);
            }
            // If paymentStatus query param is explicitly SUCCESS (e.g. from payment page redirect),
            // forward to success with plan details while webhook finishes settling
            if (paymentStatus === 'SUCCESS') {
                const planQuery = planId ? `&plan_id=${encodeURIComponent(planId)}` : '';
                return redirect(`${APP_BASE}/success?txn=${encodeURIComponent(invoiceId)}${planQuery}`);
            }
            // Invoice not yet paid — redirect to pending page with poll check
            return redirect(`${APP_BASE}/payment-pending?txn=${encodeURIComponent(invoiceId)}&gateway=kashier`);
        }

        // Direct payment page return with plan_id
        if (paymentStatus === 'SUCCESS' && planId) {
            return redirect(`${APP_BASE}/success?plan_id=${encodeURIComponent(planId)}&source=${encodeURIComponent(source || 'kashier_payment_page')}`);
        }

        if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
            return redirect(`${APP_BASE}/cancel?source=kashier_payment_page`);
        }

        // Fallback
        return redirect(`${APP_BASE}/`);
    } catch (error) {
        console.error('❌ [Callback:GET] Unhandled error:', error);
        return redirect(`${APP_BASE}/`);
    }
}


export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const normalized = normalizeRequest(req);
        const gateway = PaymentFactory.detectGatewayFromRequest(normalized);

        // No silent SpaceRemit fallback: an unidentifiable request is rejected
        // before any signature check or database write.
        if (!gateway) {
            console.warn('[Callback] No verifiable gateway signal on the request — rejecting');
            return json({ error: 'Unknown webhook provider' }, 401);
        }

        const gatewayName = gateway.getGatewayName();

        console.log(`📥 [Callback:POST] ${gatewayName} webhook, body length: ${rawBody.length}`);

        const verification = await gateway.verifyWebhook(
            { headers: normalized.headers, query: normalized.query } as unknown as import('../../../../server/payments/gateways/vercel-types').VercelRequest,
            rawBody,
        );

        // Signature failure is rejected BEFORE any Supabase client/write.
        if (!verification.valid) {
            console.error(`❌ [Callback] ${gatewayName} webhook verification failed:`, verification.errorMessage);
            return json({ error: 'Invalid webhook signature' }, 401);
        }

        const invoiceId = verification.invoiceId;

        // ── Refund / void / cancel / dispute interception (Phase A) ──────────
        // Recorded in `refunds` + `webhook_events`, never settled as a payment.
        if (verification.refundKind) {
            let refundPayload: Record<string, unknown> = {};
            try { refundPayload = rawBody.length > 0 ? JSON.parse(rawBody) : {}; } catch { /* ignore */ }

            const refundResult = await ingestRefundEvent(getSupabaseAdmin(), {
                provider: gatewayName.toLowerCase(),
                kind: verification.refundKind,
                invoiceId: invoiceId || null,
                amountMajor: verification.refundAmount ?? verification.paidAmount ?? null,
                currency: verification.currency || null,
                providerReference: verification.externalReferenceId || null,
                providerEventId: verification.eventId || verification.externalReferenceId || invoiceId || '',
                providerStatus: verification.providerStatus || verification.detailedStatus || null,
                merchantAccount: verification.merchantId || null,
                rawPayload: refundPayload,
            });

            if (refundResult.code === 'error') {
                console.error(`❌ [Callback] Refund event could not be recorded: ${refundResult.error}`);
                return json({ error: 'Refund event could not be recorded' }, 500);
            }

            return json({
                success: true,
                message: refundResult.code === 'duplicate'
                    ? 'Duplicate refund event'
                    : refundResult.code === 'recorded'
                        ? 'Refund event recorded'
                        : 'Refund event acknowledged (unlinked)',
                code: refundResult.code,
                refund: refundResult.code === 'recorded'
                    ? {
                        id: refundResult.refundId,
                        status: refundResult.status,
                        fullRefund: refundResult.fullRefund,
                        accessRevoked: refundResult.accessRevoked,
                        hasPaidCleared: refundResult.hasPaidCleared,
                    }
                    : undefined,
            });
        }
        if (!verification.status || !invoiceId) {
            return json({ success: true, message: 'Event acknowledged' });
        }

        const supabase = getSupabaseAdmin();
        const provider = gatewayName.toLowerCase();
        const providerEventId = verification.externalReferenceId || invoiceId;
        let parsedRawPayload: Record<string, unknown> = {};
        try {
            parsedRawPayload = rawBody.length > 0 ? JSON.parse(rawBody) : {};
        } catch { /* ignore */ }

        const providerStatus = verification.providerStatus
            || String(parsedRawPayload.orderStatus ?? parsedRawPayload.status ?? parsedRawPayload.lastStatus ?? '')
            || verification.detailedStatus
            || null;

        // Same DB-level idempotency key as /api/payments/webhook. A callback and
        // a webhook for the same provider transaction can never both settle.
        const { error: dedupError } = await supabase
            .from('webhook_events')
            .insert({
                provider,
                merchant_account: verification.merchantId || null,
                provider_event_id: providerEventId,
                transaction_id: verification.externalReferenceId || null,
                provider_transaction_id: verification.externalReferenceId || null,
                provider_status: providerStatus,
                provider_operation: verification.providerOperation || 'pay',
                invoice_id: invoiceId,
                event_type: verification.detailedStatus || verification.status || 'unknown',
                payload_hash: rawBody.length > 0
                    ? crypto.createHash('sha256').update(rawBody).digest('hex')
                    : null,
                status: 'pending',
                processing_status: 'pending',
                raw_payload: parsedRawPayload,
            });

        if (dedupError) {
            if (dedupError.code === '23505') {
                console.log(`[Callback] Duplicate provider event ${providerEventId} — no mutation`);
                return json({ success: true, message: 'Already processed (idempotent)', invoiceId });
            }
            console.error('[Callback] Could not record webhook event:', dedupError.message);
            return json({ error: 'Could not record webhook event' }, 500);
        }

        const fulfillment = await applyProviderVerdict({
            supabase,
            invoiceId,
            gatewayName,
            verdict: {
                status: verification.status as 'success' | 'failed',
                externalReferenceId: verification.externalReferenceId,
                paidAmount: verification.paidAmount,
                currency: verification.currency,
                providerStatus: providerStatus || undefined,
                providerOperation: verification.providerOperation,
            },
            providerEventId,
            providerStatus,
            source: 'webhook',
            rawBody,
        });

        if (fulfillment.code === 'amount_mismatch') {
            return json({
                success: true,
                message: 'Amount mismatch — payment not activated',
                invoiceId,
            });
        }
        if (fulfillment.code === 'already_processed' || fulfillment.code === 'quarantined') {
            return json({ success: true, message: 'Already processed (idempotent)', invoiceId });
        }
        if (fulfillment.code === 'financial_failure') {
            return json({
                success: true,
                message: 'Payment recorded; settlement pending reconciliation',
                invoiceId,
                code: fulfillment.stage,
            });
        }
        if (fulfillment.code === 'applied' && fulfillment.outcome === 'failed') {
            return json({ success: true, message: 'Payment failure recorded', invoiceId });
        }
        if (fulfillment.code === 'applied' && fulfillment.outcome === 'pending_claim') {
            return json({
                success: true,
                message: 'Payment settled; delivery pending claim',
                invoiceId,
                delivery: 'deferred',
            });
        }
        if (fulfillment.code === 'applied') {
            return json({ success: true, message: 'Payment processed successfully', invoiceId });
        }
        return json({ success: true, message: 'Event acknowledged', invoiceId });
    } catch (error) {
        console.error('❌ [Callback] Unhandled error:', error);
        return json({ error: 'Internal server error', message: (error as Error).message }, 500);
    }
}

export async function OPTIONS(req: Request) {
    return corsPreflightResponse(req, 'GET, POST, OPTIONS', 'Content-Type, x-spaceremit-signature, stripe-signature, hmac');
}
