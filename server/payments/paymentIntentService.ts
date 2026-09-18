/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PAYMENT INTENT SERVICE (v4 - Final Gate N-1 & N-2)
 *  Central backbone linking invoices 1:N to payment attempts:
 *  - Tracks attempt_number and supersedes_payment_intent_id
 *  - Enforces is_current flag
 *  - Late-Arrival Guard: prevents older attempt webhooks from flipping a
 *    newer or already-PAID order into an invalid state.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface CreatePaymentIntentParams {
    invoiceId: string;
    provider?: string;
    providerOrderId?: string | null;
    merchantReference: string;
    amountMinor: number;
    currency: string;
    environment: 'test' | 'live';
    metadata?: Record<string, unknown>;
}

export interface PaymentIntentRecord {
    id: string;
    invoice_id: string;
    attempt_number: number;
    supersedes_payment_intent_id: string | null;
    is_current: boolean;
    provider: string;
    provider_order_id: string | null;
    merchant_reference: string;
    amount_minor: number;
    currency: string;
    environment: 'test' | 'live';
    status: 'initiated' | 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'expired' | 'unknown';
    fx_rate: number;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

function getSupabaseAdmin(): SupabaseClient {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('[PaymentIntentService] Missing Supabase admin env vars.');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Creates a new Payment Intent attempt for an invoice.
 * Automatically supersedes any previous attempt for the same invoice.
 */
export async function createPaymentIntentAttempt(
    params: CreatePaymentIntentParams,
    supabaseClient?: SupabaseClient
): Promise<PaymentIntentRecord> {
    const supabase = supabaseClient || getSupabaseAdmin();

    // 1. Fetch highest attempt number and current active intent for this invoice
    const { data: existingAttempts, error: fetchError } = await supabase
        .from('payment_intents')
        .select('id, attempt_number, is_current')
        .eq('invoice_id', params.invoiceId)
        .order('attempt_number', { ascending: false });

    if (fetchError) {
        throw new Error(`[PaymentIntentService] Failed to query existing attempts: ${fetchError.message}`);
    }

    let nextAttemptNumber = 1;
    let supersedesId: string | null = null;

    if (existingAttempts && existingAttempts.length > 0) {
        nextAttemptNumber = existingAttempts[0].attempt_number + 1;
        const currentActive = existingAttempts.find((a) => a.is_current);
        if (currentActive) {
            supersedesId = currentActive.id;
            // Demote previous current active intent
            const { error: demoteError } = await supabase
                .from('payment_intents')
                .update({ is_current: false, updated_at: new Date().toISOString() })
                .eq('id', currentActive.id);

            if (demoteError) {
                throw new Error(
                    `[PaymentIntentService] Failed to supersede previous attempt #${currentActive.attempt_number}: ${demoteError.message}`
                );
            }
        }
    }

    // 2. Insert new attempt as is_current = true
    const { data: newIntent, error: insertError } = await supabase
        .from('payment_intents')
        .insert({
            invoice_id: params.invoiceId,
            attempt_number: nextAttemptNumber,
            supersedes_payment_intent_id: supersedesId,
            is_current: true,
            provider: params.provider || 'kashier',
            provider_order_id: params.providerOrderId || null,
            merchant_reference: params.merchantReference,
            amount_minor: params.amountMinor,
            currency: params.currency.toUpperCase(),
            environment: params.environment,
            status: 'initiated',
            fx_rate: 1.0,
            metadata: params.metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

    if (insertError || !newIntent) {
        throw new Error(`[PaymentIntentService] Failed to create payment intent attempt: ${insertError?.message}`);
    }

    return newIntent as PaymentIntentRecord;
}

/**
 * Late-Arrival Guard (N-1):
 * Checks whether an incoming webhook corresponds to the CURRENT active attempt,
 * and ensures that an older attempt cannot downgrade an invoice that is already PAID.
 */
export function canApplyWebhookToIntent(params: {
    intent: PaymentIntentRecord;
    invoiceStatus: string;
    incomingStatus: string;
}): { canApply: boolean; reason?: string } {
    // If invoice is already paid, older failed/expired webhooks must NOT downgrade it
    const isPaid = (params.invoiceStatus || '').toLowerCase() === 'paid';
    const isSuccess = (params.incomingStatus || '').toUpperCase() === 'SUCCESS' || (params.incomingStatus || '').toLowerCase() === 'succeeded';

    if (isPaid && !isSuccess) {
        return {
            canApply: false,
            reason: `Late-arrival guard: Invoice is already PAID. Rejecting status change to ${params.incomingStatus} from attempt #${params.intent.attempt_number}`,
        };
    }

    if (!params.intent.is_current && !isSuccess) {
        return {
            canApply: false,
            reason: `Late-arrival guard: Payment Intent attempt #${params.intent.attempt_number} is superseded and incoming status is not SUCCESS.`,
        };
    }

    return { canApply: true };
}
