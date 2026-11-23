/**
 * Refund reconciliation — READ ONLY.
 *
 * Why this exists
 * ---------------
 * Refund-like webhooks are recorded by `server/payments/refund/refundEvent.ts`
 * into two places with different failure modes:
 *
 *   `webhook_events` — ALWAYS written (it is the idempotency + audit row).
 *   `refunds`        — written only when the invoice and a real payment intent
 *                      could be resolved. `refunds.payment_intent_id` is NOT
 *                      NULL, so a Stripe-embedded / Paymob / SpaceRemit refund
 *                      that has no intent row is deliberately acknowledged as
 *                      `skipped / refund_unlinked` and leaves NO refund row.
 *
 * That split is exactly what an operator must be able to see: money the
 * provider says it returned, with no refund-domain record behind it (and the
 * reverse: a refund row whose webhook event is missing). This module derives
 * that picture from what is already stored.
 *
 * HARD CONSTRAINTS
 * ----------------
 *  - No INSERT / UPDATE / DELETE / RPC. Two SELECTs, nothing else.
 *  - No provider API calls, no gateway credentials, no state machine changes.
 *  - Pure classification in `buildRefundReconciliationReport()` so the counts
 *    can be tested without a database.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/** The provider operations a refund-like webhook can carry. */
export const REFUND_EVENT_OPERATIONS = [
    'refund',
    'void',
    'cancel',
    'dispute_opened',
    'dispute_closed',
] as const;

export type RefundEventOperation = (typeof REFUND_EVENT_OPERATIONS)[number];

/** The subset of `webhook_events` this report reads. */
export interface RefundEventRow {
    provider: string | null;
    provider_event_id: string | null;
    provider_operation: string | null;
    status: string | null;
    processing_status: string | null;
    invoice_id: string | null;
    error_message?: string | null;
    created_at?: string | null;
}

/** The subset of `refunds` this report reads. */
export interface RefundRow {
    id: string;
    invoice_id: string | null;
    payment_intent_id: string | null;
    amount_minor: number | null;
    currency: string | null;
    status: string | null;
    created_at?: string | null;
    raw_response?: Record<string, unknown> | null;
}

export interface RefundGap {
    reason: string;
    provider?: string | null;
    provider_event_id?: string | null;
    invoice_id?: string | null;
    refund_id?: string;
    processing_status?: string | null;
    error_message?: string | null;
}

export interface RefundReconciliationCounts {
    /** Refund-like `webhook_events` rows scanned. */
    refundEvents: number;
    /** `refunds` rows scanned. */
    refunds: number;
    /** Events that reached the refund row (`processed`). */
    recordedEvents: number;
    /** Events already seen (idempotency replay). */
    duplicateEvents: number;
    /** Events acknowledged without a refund row (unlinked / invalid amount). */
    skippedEvents: number;
    /** Events that could not persist a refund row. */
    failedEvents: number;
    /** Events still pending (in-flight / crashed mid-processing). */
    pendingEvents: number;
    /** Recorded events that DO have a matching `refunds` row. */
    matched: number;
    /** Recorded events with NO matching `refunds` row. */
    eventsWithoutRefundRow: number;
    /** Provider-originated refund rows with NO matching webhook event. */
    refundsWithoutEvent: number;
    /** Refund rows carrying provider event metadata. */
    providerRefunds: number;
    /** Operator-recorded refunds (no webhook event is expected). */
    adminRefunds: number;
    /** Refund rows with neither provider metadata nor the admin marker. */
    legacyRefunds: number;
}

export interface RefundReconciliationReport {
    counts: RefundReconciliationCounts;
    samples: {
        eventsWithoutRefundRow: RefundGap[];
        refundsWithoutEvent: RefundGap[];
        skippedEvents: RefundGap[];
        failedEvents: RefundGap[];
    };
    /** True when either source returned exactly `maxRows` (older rows unseen). */
    truncated: boolean;
    /**
     * True when nothing needs operator attention: no unlinked/failed event and
     * no orphan refund row. Admin-recorded refunds never make this false.
     */
    ok: boolean;
}

export interface BuildRefundReconciliationOptions {
    /** Max entries kept per sample list (counts are always complete). */
    sampleLimit?: number;
    truncated?: boolean;
}

const normalize = (value: unknown): string => String(value ?? '').trim().toLowerCase();

/** Stable join key: the same `(provider, provider_event_id)` used for dedupe. */
export function refundEventKey(provider: unknown, providerEventId: unknown): string {
    return `${normalize(provider)}::${String(providerEventId ?? '').trim()}`;
}

/** The provider event a refund row was recorded from, if it carries one. */
export function refundRowEventKey(refund: RefundRow): string | null {
    const raw = refund.raw_response ?? {};
    const provider = raw.provider;
    const eventId = raw.provider_event_id;
    if (!provider || !eventId) return null;
    return refundEventKey(provider, eventId);
}

function isAdminRecorded(refund: RefundRow): boolean {
    return normalize(refund.raw_response?.source) === 'admin';
}

/**
 * Pure classification of already-fetched rows. Never mutates its inputs.
 */
export function buildRefundReconciliationReport(
    events: RefundEventRow[],
    refunds: RefundRow[],
    options: BuildRefundReconciliationOptions = {}
): RefundReconciliationReport {
    const sampleLimit = Math.max(1, options.sampleLimit ?? 10);

    const refundsByEventKey = new Map<string, RefundRow>();
    for (const refund of refunds) {
        const key = refundRowEventKey(refund);
        if (key) refundsByEventKey.set(key, refund);
    }

    const eventKeys = new Set<string>();
    for (const event of events) {
        if (event.provider_event_id) {
            eventKeys.add(refundEventKey(event.provider, event.provider_event_id));
        }
    }

    const counts: RefundReconciliationCounts = {
        refundEvents: events.length,
        refunds: refunds.length,
        recordedEvents: 0,
        duplicateEvents: 0,
        skippedEvents: 0,
        failedEvents: 0,
        pendingEvents: 0,
        matched: 0,
        eventsWithoutRefundRow: 0,
        refundsWithoutEvent: 0,
        providerRefunds: 0,
        adminRefunds: 0,
        legacyRefunds: 0,
    };

    const samples: RefundReconciliationReport['samples'] = {
        eventsWithoutRefundRow: [],
        refundsWithoutEvent: [],
        skippedEvents: [],
        failedEvents: [],
    };

    for (const event of events) {
        const status = normalize(event.status);
        const processing = normalize(event.processing_status);

        if (processing === 'refund_duplicate') {
            counts.duplicateEvents += 1;
            continue;
        }

        if (status === 'skipped') {
            counts.skippedEvents += 1;
            if (samples.skippedEvents.length < sampleLimit) {
                samples.skippedEvents.push({
                    reason: processing || 'skipped',
                    provider: event.provider,
                    provider_event_id: event.provider_event_id,
                    invoice_id: event.invoice_id,
                    processing_status: event.processing_status,
                    error_message: event.error_message ?? null,
                });
            }
            continue;
        }

        if (status === 'failed' || processing.startsWith('refund_insert_failed')) {
            counts.failedEvents += 1;
            if (samples.failedEvents.length < sampleLimit) {
                samples.failedEvents.push({
                    reason: processing || 'refund_insert_failed',
                    provider: event.provider,
                    provider_event_id: event.provider_event_id,
                    invoice_id: event.invoice_id,
                    processing_status: event.processing_status,
                    error_message: event.error_message ?? null,
                });
            }
            continue;
        }

        if (status === 'processed') {
            counts.recordedEvents += 1;
            const key = refundEventKey(event.provider, event.provider_event_id);
            if (refundsByEventKey.has(key)) {
                counts.matched += 1;
            } else {
                counts.eventsWithoutRefundRow += 1;
                if (samples.eventsWithoutRefundRow.length < sampleLimit) {
                    samples.eventsWithoutRefundRow.push({
                        reason: 'refund_event_recorded_without_refunds_row',
                        provider: event.provider,
                        provider_event_id: event.provider_event_id,
                        invoice_id: event.invoice_id,
                        processing_status: event.processing_status,
                    });
                }
            }
            continue;
        }

        counts.pendingEvents += 1;
    }

    for (const refund of refunds) {
        const key = refundRowEventKey(refund);

        if (isAdminRecorded(refund)) {
            counts.adminRefunds += 1;
            continue;
        }

        if (!key) {
            counts.legacyRefunds += 1;
            counts.refundsWithoutEvent += 1;
            if (samples.refundsWithoutEvent.length < sampleLimit) {
                samples.refundsWithoutEvent.push({
                    reason: 'refund_row_missing_provider_event_metadata',
                    refund_id: refund.id,
                    invoice_id: refund.invoice_id,
                    processing_status: null,
                });
            }
            continue;
        }

        counts.providerRefunds += 1;
        if (!eventKeys.has(key)) {
            counts.refundsWithoutEvent += 1;
            if (samples.refundsWithoutEvent.length < sampleLimit) {
                samples.refundsWithoutEvent.push({
                    reason: 'refund_row_without_webhook_event',
                    refund_id: refund.id,
                    invoice_id: refund.invoice_id,
                    provider: String(refund.raw_response?.provider ?? ''),
                    provider_event_id: String(refund.raw_response?.provider_event_id ?? ''),
                });
            }
        }
    }

    const ok =
        counts.eventsWithoutRefundRow === 0 &&
        counts.refundsWithoutEvent === 0 &&
        counts.failedEvents === 0 &&
        counts.skippedEvents === 0 &&
        counts.pendingEvents === 0;

    return {
        counts,
        samples,
        truncated: options.truncated === true,
        ok,
    };
}

export interface ReconcileRefundsOptions {
    /** Rows read per table (default 500). Nothing is paginated or written. */
    maxRows?: number;
    sampleLimit?: number;
}

/**
 * Read-only reconciliation of refund webhook events against `refunds` rows.
 *
 * Throws on a read error — a reconciliation report that silently reports zero
 * rows on a failed SELECT would be worse than no report at all.
 */
export async function reconcileRefunds(
    supabase: SupabaseClient,
    options: ReconcileRefundsOptions = {}
): Promise<RefundReconciliationReport> {
    const maxRows = Math.max(1, options.maxRows ?? 500);

    const { data: eventData, error: eventError } = await supabase
        .from('webhook_events')
        .select(
            'provider, provider_event_id, provider_operation, status, processing_status, invoice_id, error_message, created_at'
        )
        .in('provider_operation', [...REFUND_EVENT_OPERATIONS])
        .order('created_at', { ascending: false })
        .limit(maxRows);

    if (eventError) {
        throw new Error(`[RefundReconciliation] webhook_events read failed: ${eventError.message}`);
    }

    const { data: refundData, error: refundError } = await supabase
        .from('refunds')
        .select('id, invoice_id, payment_intent_id, amount_minor, currency, status, created_at, raw_response')
        .order('created_at', { ascending: false })
        .limit(maxRows);

    if (refundError) {
        throw new Error(`[RefundReconciliation] refunds read failed: ${refundError.message}`);
    }

    const events = (eventData ?? []) as unknown as RefundEventRow[];
    const refunds = (refundData ?? []) as unknown as RefundRow[];

    return buildRefundReconciliationReport(events, refunds, {
        sampleLimit: options.sampleLimit,
        truncated: events.length >= maxRows || refunds.length >= maxRows,
    });
}
