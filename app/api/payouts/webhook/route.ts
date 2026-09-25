/**
 * Route Handler — /api/payouts/webhook
 * Section 61.2 & 65: Dedicated Payout Webhook endpoint for Kashier Transfers.
 *
 * Signature scheme (Kashier "Payout webhooks"):
 *   - signatureKeys are used in the EXACT array order Kashier sent them.
 *   - Values are raw (never URL-encoded).
 *   - HMAC-SHA256 is keyed with the Transfer API Key for the delivery mode.
 *   - Never sorted, never the Payment API Key, never the Merchant Secret Key.
 *
 * This endpoint is separate from /api/payments/webhook, which uses the
 * Payment API Key over a sorted, URL-encoded signature input. Kashier has no
 * per-request webhook for transfers, so this destination must be a configured
 * webhook in the dashboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    readPayoutSignatureHeader,
    verifyKashierPayoutWebhookSignature,
} from '../../../../server/payments/payoutWebhookVerifier';
import { resolveTransferCredentials } from '../../../../server/payments/transferCredentials';
import { canApplyPayoutWebhookEvent, type PayoutState } from '../../../../server/payments/payoutState';
import { recordPayoutExecutionJournal } from '../../../../server/payments/financialLedgerService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('[PayoutWebhook] Missing Supabase admin credentials.');
    }
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

/**
 * Kashier transfer statuses. Only TRANSFERRED is a settled success.
 * PENDING and PARTIALLY_TRANSFERRED appear in the lifecycle but are not
 * subscribable delivery events; they are still handled defensively.
 */
const STATUS_TO_STATE: Record<string, PayoutState> = {
    PENDING: 'QUEUED',
    INITIATED: 'PROCESSING',
    IN_TRANSIT: 'PROCESSING',
    TRANSFERRED: 'COMPLETED',
    FAILED: 'FAILED',
};

function stateToDbStatus(state: PayoutState): string {
    if (state === 'COMPLETED') return 'completed';
    if (state === 'FAILED') return 'failed';
    if (state === 'QUEUED') return 'queued';
    if (state === 'RECONCILING') return 'reconciling';
    if (state === 'UNKNOWN') return 'unknown';
    return 'processing';
}

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        if (!rawBody || rawBody.trim() === '') {
            return NextResponse.json({ error: 'Empty payload' }, { status: 400 });
        }

        let payload: Record<string, unknown>;
        try {
            payload = JSON.parse(rawBody) as Record<string, unknown>;
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        // 1. Credentials, resolved for the delivery mode. A live delivery can
        //    never authenticate with a test Transfer API Key, or vice versa.
        const credentials = resolveTransferCredentials(payload.merchantId);

        // 2. Signature verification is mandatory. A missing Transfer API Key is
        //    a configuration fault, not a licence to trust the body.
        if (!credentials.transferApiKey) {
            console.error(
                `[PayoutWebhook] Transfer API Key not configured for mode=${credentials.mode}. Rejecting — refusing to accept an unverified transfer event.`
            );
            return NextResponse.json(
                { error: 'Transfer webhook signature verification is not configured' },
                { status: 503 }
            );
        }

        const signatureHeader = readPayoutSignatureHeader(req.headers.get('x-kashier-signature'), payload);
        if (!signatureHeader) {
            return NextResponse.json({ error: 'Missing x-kashier-signature' }, { status: 401 });
        }

        const signatureKeys = payload.signatureKeys;
        if (!signatureKeys) {
            return NextResponse.json({ error: 'Missing signatureKeys' }, { status: 401 });
        }

        // 3. Cross-account check: a valid HMAC proves Kashier sent it, not that
        //    it was sent for this merchant.
        if (credentials.allowedMerchantIds.length > 0) {
            const signedMerchantId = String(payload.merchantId ?? '').trim();
            if (!signedMerchantId || !credentials.allowedMerchantIds.includes(signedMerchantId)) {
                console.error('[PayoutWebhook] Rejected event for an unknown merchantId.');
                return NextResponse.json({ error: 'Merchant mismatch' }, { status: 401 });
            }
        }

        const isValid = verifyKashierPayoutWebhookSignature({
            signatureKeys: signatureKeys as string | string[],
            payload,
            signature: signatureHeader,
            transferApiKey: credentials.transferApiKey,
            expectedMerchantId: credentials.allowedMerchantIds,
        });
        if (!isValid) {
            console.error('[PayoutWebhook] HMAC verification failed with Transfer API Key.');
            return NextResponse.json({ error: 'Invalid payout signature' }, { status: 401 });
        }

        // 4. Deterministic linkage. merchantTransferId is our own reference and
        //    is the primary key; the provider transferId is secondary.
        const merchantTransferId = String(
            payload.merchantTransferId ?? payload.referenceId ?? payload.payoutId ?? ''
        ).trim();
        const transferId = String(payload.transferId ?? '').trim();
        const batchId = String(payload.batchId ?? '').trim();
        const status = String(payload.status ?? '').trim().toUpperCase();

        if (!merchantTransferId && !transferId) {
            return NextResponse.json(
                { error: 'Neither merchantTransferId nor transferId present' },
                { status: 400 }
            );
        }

        const targetState = STATUS_TO_STATE[status] ?? 'UNKNOWN';
        if (targetState === 'UNKNOWN' && status) {
            // A status we do not model must not be silently treated as success.
            console.warn(`[PayoutWebhook] Unmodelled transfer status "${status}" — routing to reconciliation.`);
        }

        const supabase = getSupabaseAdmin();

        let payoutRow: Record<string, unknown> | null = null;
        if (merchantTransferId) {
            const { data, error } = await supabase
                .from('payouts')
                .select('*')
                .eq('id', merchantTransferId)
                .maybeSingle();
            if (error) {
                console.error('[PayoutWebhook] payout lookup by merchantTransferId failed:', error.message);
                return NextResponse.json({ error: 'Payout lookup failed' }, { status: 500 });
            }
            payoutRow = data as Record<string, unknown> | null;
        }
        if (!payoutRow && transferId) {
            const { data, error } = await supabase
                .from('payouts')
                .select('*')
                .eq('kashier_transfer_id', transferId)
                .maybeSingle();
            if (error) {
                console.error('[PayoutWebhook] payout lookup by transferId failed:', error.message);
                return NextResponse.json({ error: 'Payout lookup failed' }, { status: 500 });
            }
            payoutRow = data as Record<string, unknown> | null;
        }

        if (!payoutRow) {
            console.warn(
                `[PayoutWebhook] No payout for merchantTransferId=${merchantTransferId || 'none'}, transferId=${transferId || 'none'}`
            );
            return NextResponse.json({ status: 'ignored', message: 'Payout not found' }, { status: 200 });
        }

        // 5. Idempotency / state-machine guard. A redelivery of the same status
        //    must not write a second time, and a terminal state must not be
        //    walked backwards by a late or out-of-order delivery. Recovery from
        //    FAILED is an operator action, never a webhook's.
        const currentStatus = String(payoutRow.status ?? '').trim();
        if (!canApplyPayoutWebhookEvent(currentStatus, targetState)) {
            console.warn(
                `[PayoutWebhook] Ignoring disallowed transition ${currentStatus || 'EMPTY'} -> ${targetState} for payout ${payoutRow.id}.`
            );
            return NextResponse.json(
                { status: 'ignored', reason: 'no_state_change', payoutId: payoutRow.id, state: currentStatus },
                { status: 200 }
            );
        }

        const isSettled = targetState === 'COMPLETED';
        const nowIso = new Date().toISOString();

        const patch: Record<string, unknown> = {
            status: stateToDbStatus(targetState),
            kashier_transfer_id: transferId || payoutRow.kashier_transfer_id,
            raw_response: payload,
            updated_at: nowIso,
        };
        if (batchId) patch.kashier_batch_id = batchId;

        // 6. Settlement is only final when Kashier says TRANSFERRED and the
        //    receiving rail cannot return the funds.
        const openForReturn =
            String(payload.openForReturn ?? '').trim().toLowerCase() === 'true' ||
            payload.openForReturn === true;
        const settledState: PayoutState = isSettled && openForReturn ? 'RECONCILING' : targetState;

        if (isSettled && openForReturn) {
            patch.status = stateToDbStatus('RECONCILING');
        }

        if (targetState === 'FAILED') {
            const code = String(payload.transferResponseCode ?? '').trim();
            const message = payload.transferResponseMessage as Record<string, unknown> | undefined;
            const humanMessage = String(message?.en ?? message?.ar ?? '').trim();
            patch.error_message = [code, humanMessage].filter(Boolean).join(' — ') || 'Transfer failed';
        }

        const { error: updateError } = await supabase
            .from('payouts')
            .update(patch)
            .eq('id', payoutRow.id);
        if (updateError) {
            console.error('[PayoutWebhook] payout update failed:', updateError.message);
            return NextResponse.json({ error: 'Payout update failed' }, { status: 500 });
        }

        // 7. Financial side effects only on genuine settlement, and only once:
        //    a later transfer event is idempotent above, so a repeat cannot
        //    post a second execution journal.
        if (isSettled && !openForReturn) {
            const { error: splitError } = await supabase
                .from('order_splits')
                .update({ status: 'paid', updated_at: nowIso })
                .eq('payout_id', payoutRow.id);
            if (splitError) {
                console.error('[PayoutWebhook] order_splits update failed:', splitError.message);
            }

            try {
                await recordPayoutExecutionJournal({
                    payoutId: String(payoutRow.id),
                    beneficiaryId: (payoutRow.beneficiary_id as string) ?? '',
                    amountMinor: Number(payoutRow.amount_minor),
                    currency: String(payoutRow.currency ?? ''),
                    stage: 'COMPLETED',
                    paymentIntentId: (payoutRow.payment_intent_id as string) || undefined,
                    supabaseClient: supabase,
                });
            } catch (err) {
                console.error(
                    '[PayoutWebhook] Execution journal was NOT persisted; transfer is settled but the ledger needs reconciliation:',
                    err instanceof Error ? err.message : String(err)
                );
                await supabase
                    .from('payouts')
                    .update({ status: 'reconciling', updated_at: new Date().toISOString() })
                    .eq('id', payoutRow.id);
                return NextResponse.json(
                    { status: 'reconciliation_required', payoutId: payoutRow.id, state: 'RECONCILING' },
                    { status: 200 }
                );
            }
        }

        return NextResponse.json(
            { status: 'ok', payoutId: payoutRow.id, state: settledState },
            { status: 200 }
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[PayoutWebhook Error]:', message);
        return NextResponse.json({ error: 'Payout webhook processing failed', details: message }, { status: 500 });
    }
}
