/**
 * Route Handler — /api/payouts/webhook
 * Section 61.2 & 65: Dedicated Payout Webhook endpoint for Kashier Transfers.
 * Verifies notifications with the dedicated Transfer API Key and updates internal
 * payout state machine (PENDING, INITIATED, IN_TRANSIT, TRANSFERRED, FAILED).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyKashierPayoutWebhookSignature } from '../../../../server/payments/payoutWebhookVerifier';
import type { PayoutState } from '../../../../server/payments/payoutState';
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

function resolveTransferApiKey(): string {
    return (
        process.env.KASHIER_EG_LIVE_TRANSFER_API_KEY ||
        process.env.KASHIER_GLOBAL_LIVE_TRANSFER_API_KEY ||
        process.env.KASHIER_EG_TEST_TRANSFER_API_KEY ||
        process.env.KASHIER_GLOBAL_TEST_TRANSFER_API_KEY ||
        process.env.KASHIER_TRANSFER_API_KEY ||
        ''
    );
}

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        if (!rawBody || rawBody.trim() === '') {
            return NextResponse.json({ error: 'Empty payload' }, { status: 400 });
        }

        const payload = JSON.parse(rawBody);
        const signatureHeader = req.headers.get('x-kashier-signature') || payload.signature || '';
        const signatureKeys = payload.signatureKeys || '';

        const transferApiKey = resolveTransferApiKey();
        if (!transferApiKey) {
            console.warn('[PayoutWebhook] Transfer API Key not configured; acknowledging in test/simulation mode');
        } else {
            const isValid = verifyKashierPayoutWebhookSignature({
                signatureKeys,
                payload,
                signature: signatureHeader,
                transferApiKey,
            });

            if (!isValid) {
                console.error('[PayoutWebhook] HMAC verification failed with Transfer API Key');
                return NextResponse.json({ error: 'Invalid payout signature' }, { status: 401 });
            }
        }

        const transferId = payload.transferId || payload.id;
        const referenceId = payload.referenceId || payload.payoutId;
        const status = String(payload.status || '').toUpperCase();

        const supabase = getSupabaseAdmin();

        // 1. Resolve payout record by referenceId or transferId
        let payoutRow = null;
        if (referenceId) {
            const { data } = await supabase.from('payouts').select('*').eq('id', referenceId).maybeSingle();
            payoutRow = data;
        }
        if (!payoutRow && transferId) {
            const { data } = await supabase.from('payouts').select('*').eq('kashier_transfer_id', transferId).maybeSingle();
            payoutRow = data;
        }

        if (!payoutRow) {
            console.warn(`[PayoutWebhook] Payout not found for referenceId=${referenceId}, transferId=${transferId}`);
            return NextResponse.json({ status: 'ignored', message: 'Payout not found' }, { status: 200 });
        }

        // 2. Map Kashier transfer status to internal PayoutState (Section 65.4)
        let targetState: PayoutState = 'UNKNOWN';
        if (status === 'INITIATED') targetState = 'PROCESSING';
        else if (status === 'IN_TRANSIT') targetState = 'PROCESSING';
        else if (status === 'TRANSFERRED' || status === 'SUCCESS' || status === 'COMPLETED') targetState = 'COMPLETED';
        else if (status === 'FAILED' || status === 'REJECTED') targetState = 'FAILED';

        // 3. Update payout state
        const dbStatus = targetState === 'COMPLETED' ? 'completed' : targetState === 'FAILED' ? 'failed' : 'processing';
        await supabase
            .from('payouts')
            .update({
                status: dbStatus,
                kashier_transfer_id: transferId || payoutRow.kashier_transfer_id,
                raw_response: payload,
                updated_at: new Date().toISOString(),
            })
            .eq('id', payoutRow.id);

        // 4. Update order_splits if transferred
        if (targetState === 'COMPLETED') {
            await supabase
                .from('order_splits')
                .update({ status: 'paid', updated_at: new Date().toISOString() })
                .eq('payout_id', payoutRow.id);

            try {
                await recordPayoutExecutionJournal({
                    payoutId: payoutRow.id,
                    beneficiaryId: payoutRow.beneficiary_id,
                    amountMinor: payoutRow.amount_minor,
                    currency: payoutRow.currency,
                    stage: 'COMPLETED',
                    paymentIntentId: payoutRow.payment_intent_id,
                    supabaseClient: supabase,
                });
            } catch (err) {
                console.warn('[PayoutWebhook] Ledger posting note:', err);
            }
        }

        return NextResponse.json({ status: 'ok', payoutId: payoutRow.id, state: targetState }, { status: 200 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[PayoutWebhook Error]:', err);
        return NextResponse.json({ error: 'Payout webhook processing failed', details: message }, { status: 500 });
    }
}
