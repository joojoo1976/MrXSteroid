/**
 * Refund / void / cancellation / dispute event ingestion (Phase A).
 *
 * Purpose
 * ───────
 * Provider refund-like events were previously mapped to a FAILED payment
 * verdict. After a capture the invoice is already `paid`/`fulfilled`, so the
 * terminal-state guard swallowed those events and the refund was never
 * recorded anywhere. This module records them as refund-domain facts instead:
 *
 *   1. One audit row in `webhook_events` (idempotency key:
 *      provider + provider_event_id — the same key the payment pipeline uses).
 *   2. One row in `refunds` linked to the invoice's payment intent.
 *   3. Access policy for a COMPLETED FULL refund only: revoke the invoice's
 *      entitlements, and clear `profiles.has_paid` only when the buyer has no
 *      remaining granted entitlement. Partial refunds only record — no access
 *      change.
 *
 * Explicit non-goals (Phase A scope):
 *   - NO provider calls. Nothing here talks to Kashier/Stripe/…
 *   - NO automatic financial settlement: no ledger journal, no split
 *     adjustment, no invoice re-pricing, no commission reversal. A refund is a
 *     recorded fact awaiting reconciliation.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { revokeEntitlement } from '../entitlementService';
import type { GatewayRefundKind } from '../gateways/IPaymentGateway';

export type RefundEventKind = GatewayRefundKind;

export type RecordedRefundStatus = 'completed' | 'cancelled' | 'unknown';

/** Provider-confirmed outcomes. A dispute is not a settled refund. */
const REFUND_STATUS_BY_KIND: Record<RefundEventKind, RecordedRefundStatus> = {
    refund: 'completed',
    void: 'completed',
    cancel: 'cancelled',
    dispute_opened: 'unknown',
    dispute_closed: 'unknown',
};

/** Only returned money may affect access. Cancellations and disputes may not. */
const ACCESS_AFFECTING_KINDS: ReadonlySet<RefundEventKind> = new Set<RefundEventKind>(['refund', 'void']);

const REASON_BY_KIND: Record<RefundEventKind, string> = {
    refund: 'provider_refund',
    void: 'provider_void',
    cancel: 'provider_cancel',
    dispute_opened: 'dispute_opened',
    dispute_closed: 'dispute_closed',
};

export interface RefundEventInput {
    provider: string;
    kind: RefundEventKind;
    /** Internal invoice id, when the provider payload carries it. */
    invoiceId?: string | null;
    /** Latest attempt, when the caller already resolved it. */
    paymentIntentId?: string | null;
    /** Refunded amount in major units. Falls back to the full invoice amount. */
    amountMajor?: number | null;
    currency?: string | null;
    /** Provider-side reference (Kashier transaction id, Stripe charge id, …). */
    providerReference?: string | null;
    /** Deduplication key — must be stable across provider retries. */
    providerEventId: string;
    providerStatus?: string | null;
    merchantAccount?: string | null;
    reason?: string | null;
    rawPayload?: Record<string, unknown>;
}

export type RefundIngestCode =
    | 'recorded'
    | 'duplicate'
    | 'unlinked'
    | 'invalid_amount'
    | 'error';

export interface RefundIngestResult {
    code: RefundIngestCode;
    refundId?: string;
    status?: RecordedRefundStatus;
    /**
     * False when the collection path created no `payment_intents` row and the
     * refund was therefore recorded against the invoice alone
     * (`refunds.payment_intent_id` NULL — see migration 20261123120000).
     */
    intentLinked?: boolean;
    fullRefund?: boolean;
    accessRevoked?: boolean;
    hasPaidCleared?: boolean;
    error?: string;
}

interface InvoiceRow {
    id: string;
    amount: number | string | null;
    currency: string | null;
    user_id: string | null;
}

const nowIso = () => new Date().toISOString();

const toMinor = (major: number): number => Math.round(Number(major) * 100);

const toMajor = (minor: number): number => Number(minor) / 100;

function parseAmountMajor(value: unknown): number | null {
    const parsed = typeof value === 'string' ? Number(value) : value;
    if (typeof parsed !== 'number' || !Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
}

async function loadInvoiceById(supabase: SupabaseClient, invoiceId: string): Promise<InvoiceRow | null> {
    const { data } = await supabase
        .from('invoices')
        .select('id, amount, currency, user_id')
        .eq('id', invoiceId)
        .maybeSingle();
    return (data as InvoiceRow | null) ?? null;
}

/**
 * Resolve the invoice for a refund-like event. Provider refund payloads often
 * carry only the provider transaction id; the payment_intents / invoices
 * mappings are authoritative fallbacks.
 */
async function resolveInvoice(
    supabase: SupabaseClient,
    provider: string,
    invoiceId: string | null | undefined,
    providerReference: string | null | undefined
): Promise<InvoiceRow | null> {
    if (invoiceId) {
        const invoice = await loadInvoiceById(supabase, invoiceId);
        if (invoice) return invoice;
    }
    if (!providerReference) return null;

    const { data: intentRow } = await supabase
        .from('payment_intents')
        .select('invoice_id')
        .eq('provider', provider)
        .eq('provider_order_id', providerReference)
        .order('attempt_number', { ascending: false })
        .limit(1)
        .maybeSingle();

    const linkedInvoiceId = (intentRow as { invoice_id?: string } | null)?.invoice_id;
    if (linkedInvoiceId) {
        const invoice = await loadInvoiceById(supabase, linkedInvoiceId);
        if (invoice) return invoice;
    }

    const { data: byReference } = await supabase
        .from('invoices')
        .select('id, amount, currency, user_id')
        .eq('gateway_reference_id', providerReference)
        .maybeSingle();

    return (byReference as InvoiceRow | null) ?? null;
}

async function resolvePaymentIntentId(
    supabase: SupabaseClient,
    invoiceId: string,
    preferred?: string | null
): Promise<string | null> {
    if (preferred) return preferred;

    const { data } = await supabase
        .from('payment_intents')
        .select('id')
        .eq('invoice_id', invoiceId)
        .order('attempt_number', { ascending: false })
        .limit(1)
        .maybeSingle();

    return (data as { id?: string } | null)?.id ?? null;
}

/**
 * Access policy for a confirmed full refund.
 *
 * Revokes every still-granted entitlement belonging to the refunded invoice,
 * then clears `profiles.has_paid` ONLY when the buyer has no other granted
 * entitlement. `subscription_status` is intentionally untouched in Phase A —
 * that is a separate business decision.
 */
export async function applyFullRefundAccessPolicy(
    supabase: SupabaseClient,
    params: { invoiceId: string; userId: string | null; reason?: string }
): Promise<{ accessRevoked: boolean; hasPaidCleared: boolean }> {
    const { data: rows, error } = await supabase
        .from('entitlements')
        .select('id, user_id, product_id')
        .eq('invoice_id', params.invoiceId)
        .eq('status', 'granted');

    if (error) {
        console.error('[Refund] Entitlement lookup failed:', error.message);
        return { accessRevoked: false, hasPaidCleared: false };
    }

    let accessRevoked = false;
    for (const row of (rows || []) as Array<{ user_id: string; product_id: string }>) {
        try {
            await revokeEntitlement(
                {
                    userId: row.user_id,
                    productId: row.product_id,
                    invoiceId: params.invoiceId,
                    reason: params.reason || 'refund_completed',
                },
                supabase
            );
            accessRevoked = true;
        } catch (revokeError) {
            console.error(
                '[Refund] Entitlement revocation failed:',
                revokeError instanceof Error ? revokeError.message : String(revokeError)
            );
        }
    }

    let hasPaidCleared = false;
    if (params.userId) {
        const { data: remaining } = await supabase
            .from('entitlements')
            .select('id')
            .eq('user_id', params.userId)
            .eq('status', 'granted')
            .limit(1);

        if (!remaining || remaining.length === 0) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ has_paid: false, updated_at: nowIso() })
                .eq('id', params.userId);

            if (profileError) {
                console.error('[Refund] profile.has_paid clear failed:', profileError.message);
            } else {
                hasPaidCleared = true;
            }
        }
    }

    return { accessRevoked, hasPaidCleared };
}

async function markEvent(
    supabase: SupabaseClient,
    provider: string,
    providerEventId: string,
    patch: Record<string, unknown>
): Promise<void> {
    await supabase
        .from('webhook_events')
        .update({ ...patch, updated_at: nowIso() })
        .eq('provider', provider)
        .eq('provider_event_id', providerEventId);
}

/**
 * Record a provider refund-like event. Never throws for duplicates; returns a
 * code so the route can choose the HTTP response.
 */
export async function ingestRefundEvent(
    supabase: SupabaseClient,
    input: RefundEventInput
): Promise<RefundIngestResult> {
    const provider = String(input.provider || '').trim().toLowerCase();
    const providerEventId = String(input.providerEventId || '').trim();
    const kind = input.kind;

    if (!provider || !providerEventId) {
        return { code: 'error', error: 'provider and providerEventId are required' };
    }

    // ── 1. Audit + idempotency row (same unique key as the payment pipeline).
    const { error: eventError } = await supabase
        .from('webhook_events')
        .insert({
            provider,
            merchant_account: input.merchantAccount || null,
            provider_event_id: providerEventId,
            transaction_id: input.providerReference || null,
            provider_transaction_id: input.providerReference || null,
            provider_status: input.providerStatus || null,
            provider_operation: kind,
            invoice_id: input.invoiceId || null,
            event_type: kind,
            status: 'pending',
            processing_status: 'refund_pending',
            raw_payload: input.rawPayload || {},
        });

    if (eventError) {
        if (eventError.code === '23505') {
            await markEvent(supabase, provider, providerEventId, {
                processing_status: 'refund_duplicate',
            });
            return { code: 'duplicate' };
        }
        return { code: 'error', error: eventError.message };
    }

    // ── 2. Resolve invoice + intent.
    const invoice = await resolveInvoice(supabase, provider, input.invoiceId, input.providerReference);
    if (!invoice) {
        await markEvent(supabase, provider, providerEventId, {
            status: 'skipped',
            processing_status: 'refund_unlinked',
            error_message: 'No invoice could be resolved for this refund event',
            processed_at: nowIso(),
        });
        return { code: 'unlinked', error: 'invoice_not_found' };
    }

    await markEvent(supabase, provider, providerEventId, { invoice_id: invoice.id });

    // Stripe-embedded / Paymob / SpaceRemit never create a `payment_intents` row.
    // Migration 20261123120000 relaxes `refunds.payment_intent_id`, so the refund
    // is recorded against the invoice alone instead of being dropped as
    // "unlinked" — money the provider says it returned must stay visible. A real
    // intent is never invented to fill the column.
    const paymentIntentId = await resolvePaymentIntentId(supabase, invoice.id, input.paymentIntentId);
    const intentLinked = paymentIntentId !== null;

    // ── 3. Amount + currency.
    const invoiceAmountMinor = toMinor(Number(invoice.amount ?? 0));
    const explicitAmount = parseAmountMajor(input.amountMajor);
    const amountMinor = explicitAmount !== null ? toMinor(explicitAmount) : invoiceAmountMinor;

    if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
        await markEvent(supabase, provider, providerEventId, {
            status: 'skipped',
            processing_status: 'refund_invalid_amount',
            error_message: `Refund amount could not be determined (invoice=${invoiceAmountMinor})`,
            processed_at: nowIso(),
        });
        return { code: 'invalid_amount', error: 'invalid_amount' };
    }

    const status = REFUND_STATUS_BY_KIND[kind];
    const fullRefund = amountMinor >= invoiceAmountMinor && invoiceAmountMinor > 0;
    const currency = String(input.currency || invoice.currency || 'USD').toUpperCase().slice(0, 3);

    const reasonParts = [REASON_BY_KIND[kind]];
    if (input.reason) reasonParts.push(String(input.reason).slice(0, 200));

    // ── 4. Refund-domain record. No ledger/split/invoice writes here.
    const { data: refundRow, error: refundError } = await supabase
        .from('refunds')
        .insert({
            payment_intent_id: paymentIntentId,
            invoice_id: invoice.id,
            amount_minor: amountMinor,
            currency,
            status,
            reason: reasonParts.join(': '),
            kashier_refund_id: provider.startsWith('kashier') ? (input.providerReference || null) : null,
            kashier_transaction_id: input.providerReference || null,
            raw_response: {
                provider,
                kind,
                provider_event_id: providerEventId,
                provider_status: input.providerStatus || null,
                full_refund: fullRefund,
                amount_major: toMajor(amountMinor),
                payload: input.rawPayload || {},
            },
            requested_by: null,
        })
        .select('id, status')
        .single();

    if (refundError) {
        // SAFETY BEFORE MIGRATION 20261123120000 IS APPLIED.
        // The intent-less insert above only succeeds once that migration has
        // dropped the NOT NULL on refunds.payment_intent_id. Until then Postgres
        // raises 23502; keep the previous, honest behaviour (acknowledge the
        // event as unlinked, never invent an intent, never 5xx the provider) and
        // point the operator at the pending migration instead of retrying
        // forever.
        const intentColumnRejectsNull =
            !intentLinked &&
            (refundError.code === '23502' || /payment_intent_id/i.test(refundError.message || ''));

        if (intentColumnRejectsNull) {
            await markEvent(supabase, provider, providerEventId, {
                status: 'skipped',
                processing_status: 'refund_unlinked',
                error_message:
                    'refunds.payment_intent_id is NOT NULL in the deployed schema — apply migration 20261123120000 to record intent-less refunds',
                processed_at: nowIso(),
            });
            return { code: 'unlinked', error: 'payment_intent_not_found' };
        }

        await markEvent(supabase, provider, providerEventId, {
            status: 'failed',
            processing_status: `refund_insert_failed: ${refundError.message}`.slice(0, 200),
            error_message: refundError.message,
            processed_at: nowIso(),
        });
        return { code: 'error', error: refundError.message };
    }

    // ── 5. Access policy (completed full refund of returned money only).
    let accessRevoked = false;
    let hasPaidCleared = false;
    if (status === 'completed' && fullRefund && ACCESS_AFFECTING_KINDS.has(kind)) {
        const policy = await applyFullRefundAccessPolicy(supabase, {
            invoiceId: invoice.id,
            userId: invoice.user_id,
            reason: `${REASON_BY_KIND[kind]}_full`,
        });
        accessRevoked = policy.accessRevoked;
        hasPaidCleared = policy.hasPaidCleared;
    }

    await markEvent(supabase, provider, providerEventId, {
        status: 'processed',
        processing_status: intentLinked ? 'refund_recorded' : 'refund_recorded_unlinked',
        invoice_id: invoice.id,
        processed_at: nowIso(),
    });

    return {
        code: 'recorded',
        refundId: (refundRow as { id?: string } | null)?.id,
        intentLinked,
        status,
        fullRefund,
        accessRevoked,
        hasPaidCleared,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN REFUND RECORDING (no provider call)
// ─────────────────────────────────────────────────────────────────────────────

export type AdminRefundStatus = 'requested' | 'completed' | 'cancelled';

export interface AdminRefundInput {
    invoiceId: string;
    amountMinor?: number | null;
    currency?: string | null;
    reason: string;
    status?: AdminRefundStatus;
    provider?: string | null;
    providerReference?: string | null;
    adminId: string;
}

export type AdminRefundCode =
    | 'recorded'
    | 'duplicate'
    | 'invoice_not_found'
    | 'payment_intent_not_found'
    | 'invalid_amount'
    | 'error';

export interface AdminRefundResult {
    code: AdminRefundCode;
    refundId?: string;
    status?: AdminRefundStatus;
    fullRefund?: boolean;
    accessRevoked?: boolean;
    hasPaidCleared?: boolean;
    error?: string;
}

/**
 * Record an operator-initiated refund. Nothing is sent to the gateway: the
 * operator performs the actual refund in the provider dashboard and records it
 * here for audit + access policy.
 */
export async function recordAdminRefund(
    supabase: SupabaseClient,
    input: AdminRefundInput
): Promise<AdminRefundResult> {
    const invoice = await loadInvoiceById(supabase, input.invoiceId);
    if (!invoice) return { code: 'invoice_not_found' };

    const paymentIntentId = await resolvePaymentIntentId(supabase, invoice.id, null);
    if (!paymentIntentId) return { code: 'payment_intent_not_found' };

    const invoiceMajor = Number(invoice.amount ?? 0);
    const invoiceAmountMinor = toMinor(invoiceMajor);
    const requestedMinor = input.amountMinor != null ? Math.trunc(input.amountMinor) : invoiceAmountMinor;

    if (!Number.isFinite(requestedMinor) || requestedMinor <= 0 || requestedMinor > invoiceAmountMinor) {
        return { code: 'invalid_amount', error: 'amountMinor must be > 0 and <= the invoice amount' };
    }

    const provider = String(input.provider || 'manual').trim().toLowerCase().slice(0, 40);
    const providerReference = input.providerReference ? String(input.providerReference).slice(0, 200) : null;
    const status: AdminRefundStatus = input.status || 'requested';

    if (providerReference) {
        const { data: existing } = await supabase
            .from('refunds')
            .select('id')
            .eq('invoice_id', invoice.id)
            .eq('kashier_refund_id', providerReference)
            .limit(1)
            .maybeSingle();
        if (existing) return { code: 'duplicate' };
    }

    const currency = String(input.currency || invoice.currency || 'USD').toUpperCase().slice(0, 3);
    const fullRefund = requestedMinor >= invoiceAmountMinor;

    const { data: row, error } = await supabase
        .from('refunds')
        .insert({
            payment_intent_id: paymentIntentId,
            invoice_id: invoice.id,
            amount_minor: requestedMinor,
            currency,
            status,
            reason: `admin: ${input.reason}`.slice(0, 500),
            kashier_refund_id: provider.startsWith('kashier') ? providerReference : null,
            kashier_transaction_id: providerReference,
            raw_response: {
                source: 'admin',
                provider,
                provider_reference: providerReference,
                recorded_by: input.adminId,
                full_refund: fullRefund,
                amount_major: toMajor(requestedMinor),
            },
            requested_by: input.adminId,
        })
        .select('id, status')
        .single();

    if (error) return { code: 'error', error: error.message };

    let accessRevoked = false;
    let hasPaidCleared = false;
    if (status === 'completed' && fullRefund) {
        const policy = await applyFullRefundAccessPolicy(supabase, {
            invoiceId: invoice.id,
            userId: invoice.user_id,
            reason: 'admin_refund_completed',
        });
        accessRevoked = policy.accessRevoked;
        hasPaidCleared = policy.hasPaidCleared;
    }

    return {
        code: 'recorded',
        refundId: (row as { id?: string } | null)?.id,
        status,
        fullRefund,
        accessRevoked,
        hasPaidCleared,
    };
}
