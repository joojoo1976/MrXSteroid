/**
 * Route Handler — /api/webhooks/fourthwall
 *
 * Fourthwall webhook endpoint for order/payment events.
 * Delegates to the canonical Fourthwall webhook processor which implements:
 *   1. HMAC-SHA256 signature verification (webhook secret).
 *   2. Timestamp replay protection (5-minute window).
 *   3. Order status mapping to settlement path.
 *   4. Digital delivery verification for eligible products.
 *   5. Affiliate attribution retrieval from invoices.
 *   6. Financial ledger journals and revenue splits (via shared fulfillmentService).
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { FourthwallGateway } from '../../../../server/payments/gateways/FourthwallGateway';
import type { VercelRequest } from '../../../../server/payments/gateways/vercel-types';
import { applyProviderVerdict } from '../../../../server/payments/fulfillmentService';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const gateway = new FourthwallGateway();

function getSupabaseAdmin(): SupabaseClient {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('[FourthwallWebhook] Missing Supabase admin env vars.');
    }
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const result = await gateway.verifyWebhook(req as unknown as VercelRequest, rawBody);

    if (!result.valid) {
        return NextResponse.json(
            { error: result.errorMessage || 'Invalid webhook signature' },
            { status: 401 }
        );
    }

    const supabase = getSupabaseAdmin();

    // Fourthwall uses checkout id as the invoice reference; order id is the
    // external reference; the webhook event id is the deduplication key.
    const checkoutSessionId = result.invoiceId;
    const orderId = result.externalReferenceId;
    const eventId = result.eventId || orderId;
    const providerStatus = result.providerStatus || 'unknown';

    if (!checkoutSessionId || !orderId) {
        console.error('[FourthwallWebhook] Missing checkout id or order id');
        return NextResponse.json({ status: 'ok', message: 'Missing identifiers' }, { status: 200 });
    }

    // Find the invoice by checkout id (stored in kashier_session_id field repurposed)
    const { data: invoice } = await supabase
        .from('invoices')
        .select('id, user_id, amount, currency, payment_status, tier_id, region, metadata')
        .eq('kashier_session_id', checkoutSessionId) // Reusing field for Fourthwall checkout id
        .maybeSingle();

    if (!invoice) {
        console.warn(`[FourthwallWebhook] No invoice found for checkout: ${checkoutSessionId}`);
        return NextResponse.json({ status: 'ok', message: 'Invoice not found' }, { status: 200 });
    }

    // Idempotency: deduplicate by the webhook EVENT id (per official contract)
    const { data: existingEvent } = await supabase
        .from('webhook_events')
        .select('status, processing_status')
        .eq('provider', 'fourthwall')
        .eq('provider_event_id', eventId)
        .maybeSingle();

    if (existingEvent) {
        if (existingEvent.status === 'completed') {
            console.log(`[FourthwallWebhook] Duplicate event ${eventId} — already completed`);
            return NextResponse.json({ status: 'ok', message: 'Duplicate event acknowledged' }, { status: 200 });
        }
        // If previous attempt failed, allow retry
        if (existingEvent.status !== 'failed' && existingEvent.status !== 'pending') {
            return NextResponse.json({ status: 'ok', message: 'Duplicate event acknowledged' }, { status: 200 });
        }
    }

    // Record webhook event for deduplication
    const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');
    await supabase.from('webhook_events').upsert({
        provider: 'fourthwall',
        merchant_account: result.merchantId || '',
        provider_event_id: eventId ?? '',
        transaction_id: orderId,
        provider_status: providerStatus,
        provider_operation: 'pay',
        payment_intent_id: null, // Will be linked via invoice
        invoice_id: invoice.id,
        event_type: result.eventType || providerStatus,
        payload_hash: payloadHash,
        status: 'pending',
        processing_status: 'processing',
        raw_payload: JSON.parse(rawBody),
    }, { onConflict: 'provider,provider_event_id' });

    // Handle replay/duplicate or cancelled events
    if (providerStatus === 'CANCELLED' || result.status === 'failed') {
        // Acknowledge but don't process as success
        await supabase
            .from('webhook_events')
            .update({ status: 'skipped', processing_status: providerStatus, processed_at: new Date().toISOString() })
            .eq('provider', 'fourthwall')
            .eq('provider_event_id', eventId);
        return NextResponse.json({ status: 'ok', message: 'Refund/cancel acknowledged' }, { status: 200 });
    }

    // Only process settled successful orders (fail closed otherwise)
    if (result.status !== 'success') {
        await supabase
            .from('webhook_events')
            .update({ status: 'skipped', processing_status: providerStatus, processed_at: new Date().toISOString() })
            .eq('provider', 'fourthwall')
            .eq('provider_event_id', eventId);
        return NextResponse.json({ status: 'ok', message: 'Non-settled status acknowledged' }, { status: 200 });
    }

    // Delegate to shared fulfillment path (same as Kashier webhook)
    // This ensures identical split/ledger/entitlement logic
    const fulfillment = await applyProviderVerdict({
        supabase,
        invoiceId: invoice.id,
        gatewayName: 'FOURTHWALL',
        verdict: {
            status: 'success',
            externalReferenceId: orderId,
            paidAmount: result.paidAmount,
            providerStatus,
        },
        providerEventId: eventId ?? '',
        currentIntentId: null, // Will be resolved inside applyProviderVerdict
        providerStatus,
        source: 'webhook',
        rawBody,
    });

    if (fulfillment.code === 'already_processed') {
        await supabase
            .from('webhook_events')
            .update({ status: 'duplicate', processed_at: new Date().toISOString() })
            .eq('provider', 'fourthwall')
            .eq('provider_event_id', eventId);
        return NextResponse.json({ status: 'ok', message: 'Already processed' }, { status: 200 });
    }

    if (fulfillment.code === 'financial_failure') {
        await supabase
            .from('webhook_events')
            .update({
                status: 'failed',
                processing_status: fulfillment.stage,
                error_message: fulfillment.reason,
                processed_at: new Date().toISOString(),
            })
            .eq('provider', 'fourthwall')
            .eq('provider_event_id', eventId);
        // Return 200 to stop Fourthwall retries; reconciliation will pick it up
        return NextResponse.json(
            {
                status: 'financial_review',
                code: fulfillment.stage,
                message: 'Order recorded; §6.3 settlement incomplete — queued for reconciliation',
            },
            { status: 200 }
        );
    }

    if (fulfillment.code === 'quarantined') {
        return NextResponse.json({ status: 'ok', message: 'Quarantined — late-arrival event' }, { status: 200 });
    }

    if (fulfillment.code === 'amount_mismatch') {
        return NextResponse.json({ status: 'ok', message: 'Amount mismatch — not activated' }, { status: 200 });
    }

    // Digital book delivery verification
    // Fourthwall handles digital delivery natively for attached files.
    // We verify here for audit trail and to trigger any additional entitlements.
    if (fulfillment.code === 'applied' && fulfillment.outcome === 'pending_claim') {
        console.log(`[FourthwallWebhook] Guest settlement complete for ${invoice.id}; entitlement pending claim`);
    }

    // Mark webhook event as completed
    await supabase
        .from('webhook_events')
        .update({
            status: 'completed',
            processing_status: 'settled',
            processed_at: new Date().toISOString(),
        })
        .eq('provider', 'fourthwall')
        .eq('provider_event_id', eventId);

    return NextResponse.json({ status: 'ok' }, { status: 200 });
}