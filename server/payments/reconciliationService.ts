/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RECONCILIATION SERVICE — Final Gate v5.1 Phase 7 (read-only diagnostic)
 *
 *  Surfaces the webhook ↔ PaymentIntent ↔ Invoice trail so a reconciliation
 *  board can answer "what did the provider say, and did we decouple correctly?".
 *  Phase 5 (C7) persisted `provider_status` / `provider_transaction_id` /
 *  `provider_operation` onto both `webhook_events` and `payment_intents`;
 *  this service leverages those columns to:
 *
 *  · List recent webhook_events with their verdict + processing trail.
 *  · Flag quarantine / replay / duplicate / skip outcomes (Phase 3 §10).
 *  · Detect UNRESOLVED intents (status UNKNOWN / PENDING / INITIATED).
 *  · Detect STALE pending invoices — the "late / missing webhook" (§C9):
 *    invoices still pending past `staleInvoiceMinutes` with no resolved intent.
 *
 *  Read-only: this service performs NO mutations. Active resolution (provider
 *  status query + state transition + retry/backoff) stays in the Phase 7 cron.
 *  ═══════════════════════════════════════════════════════════════════════════
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface ReconciliationOptions {
    supabase: SupabaseClient;
    /** Clock override for deterministic tests. */
    now?: Date;
    /** Invoices pending longer than this are late/missing-webhook candidates. */
    staleInvoiceMinutes?: number;
    /** Max webhook_events scanned (newest first). */
    maxEvents?: number;
}

export interface WebhookEventView {
    id: string | null;
    provider: string | null;
    provider_event_id: string | null;
    provider_transaction_id: string | null;
    provider_status: string | null;
    provider_operation: string | null;
    status: string | null;
    processing_status: string | null;
    invoice_id: string | null;
    payment_intent_id: string | null;
    received_at: string | null;
    needs_attention: boolean;
    attention_reason: string | null;
}

export interface UnresolvedIntentRow {
    id: string | null;
    invoice_id: string | null;
    attempt_number: number | null;
    status: string | null;
    provider_status: string | null;
    provider_transaction_id: string | null;
    created_at: string | null;
}

export interface StaleInvoiceRow {
    id: string | null;
    payment_status: string | null;
    created_at: string | null;
    latest_intent_status: string | null;
    latest_provider_status: string | null;
    minutes_pending: number;
    /** true = provider never spoke on any attempt → late/missing webhook (§C9). */
    provider_never_spoke: boolean;
}

export interface ReconciliationSnapshot {
    generated_at: string;
    stale_threshold_minutes: number;
    counts: {
        total_events: number;
        quarantined: number;
        replay: number;
        duplicate: number;
        skipped: number;
        processed: number;
        needs_attention_events: number;
        unresolved_intents: number;
        stale_pending_invoices: number;
    };
    events: WebhookEventView[];
    unresolved_intents: UnresolvedIntentRow[];
    stale_pending_invoices: StaleInvoiceRow[];
}

const toNullableString = (v: unknown): string | null =>
    v === null || v === undefined ? null : String(v);

const toNullableNumber = (v: unknown): number | null =>
    v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v);

function classifyEvent(row: Record<string, unknown>): Pick<WebhookEventView, 'needs_attention' | 'attention_reason'> {
    const status = toNullableString(row.status);
    const processingStatus = toNullableString(row.processing_status)?.toLowerCase() ?? '';
    const providerStatus = toNullableString(row.provider_status)?.toUpperCase() ?? '';
    const isReplayIndicator = providerStatus === 'ORDER_PAID_BEFORE' || processingStatus === 'replay';

    if (processingStatus.startsWith('quarantined')) {
        return { needs_attention: true, attention_reason: 'Late-arrival quarantined (spec §10) — invoice was already resolved; provider signal persisted on intent' };
    }
    if (isReplayIndicator) {
        return { needs_attention: false, attention_reason: 'Replay acknowledged — no mutation (C7)' };
    }
    if (status === 'duplicate') {
        return { needs_attention: true, attention_reason: 'Duplicate webhook (C7 dedup) — check both entries agree on provider_status' };
    }
    if (status === 'skipped') {
        return { needs_attention: true, attention_reason: 'Event skipped — UNKNOWN/TIMED_OUT/AUTHORIZED pending reconciliation' };
    }
    return { needs_attention: false, attention_reason: null };
}

function classifyIntentStatus(status: string | null): boolean {
    const s = (status || '').toUpperCase();
    return s === 'UNKNOWN' || s === 'PENDING' || s === 'INITIATED';
}

function toDate(v: string | null | undefined): Date | null {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
}

export async function buildReconciliationSnapshot(
    options: ReconciliationOptions
): Promise<ReconciliationSnapshot> {
    const supabase = options.supabase;
    const now = options.now || new Date();
    const staleThresholdMinutes = options.staleInvoiceMinutes ?? 15;
    const maxEvents = options.maxEvents ?? 500;

    const staleCutoff = new Date(now.getTime() - staleThresholdMinutes * 60_000);

    // ── 1. Recent webhook events (newest first) ─────────────────────────────
    const { data: eventData, error: eventError } = await supabase
        .from('webhook_events')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(maxEvents);

    if (eventError) {
        throw new Error(`[Reconciliation] webhook_events load failed: ${eventError.message}`);
    }

    const events: WebhookEventView[] = ((eventData || []) as Record<string, unknown>[]).map((r) => {
        const cls = classifyEvent(r);
        return {
            id: toNullableString(r.id),
            provider: toNullableString(r.provider),
            provider_event_id: toNullableString(r.provider_event_id),
            provider_transaction_id: toNullableString(r.provider_transaction_id),
            provider_status: toNullableString(r.provider_status),
            provider_operation: toNullableString(r.provider_operation),
            status: toNullableString(r.status),
            processing_status: toNullableString(r.processing_status),
            invoice_id: toNullableString(r.invoice_id),
            payment_intent_id: toNullableString(r.payment_intent_id),
            received_at: toNullableString(r.received_at),
            ...cls,
        };
    }) as WebhookEventView[];

    // ── 2. Payment intents (unfiltered; unresolved classified in memory) ────
    const { data: intentData, error: intentError } = await supabase
        .from('payment_intents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(maxEvents);

    if (intentError) {
        throw new Error(`[Reconciliation] payment_intents load failed: ${intentError.message}`);
    }

    const intentRowsAll = ((intentData || []) as Record<string, unknown>[]);

    const unresolvedIntentRows = intentRowsAll
        .filter((r) => classifyIntentStatus(toNullableString(r.status)))
        .map((r) => ({
            id: toNullableString(r.id),
            invoice_id: toNullableString(r.invoice_id),
            attempt_number: toNullableNumber(r.attempt_number),
            status: toNullableString(r.status),
            provider_status: toNullableString(r.provider_status),
            provider_transaction_id: toNullableString(r.provider_transaction_id),
            created_at: toNullableString(r.created_at),
        })) as UnresolvedIntentRow[];

    const intentsByInvoice = new Map<string, Record<string, unknown>[]>();
    for (const row of intentRowsAll) {
        const invoiceId = toNullableString(row.invoice_id);
        if (!invoiceId) continue;
        const arr = intentsByInvoice.get(invoiceId) || [];
        arr.push(row);
        intentsByInvoice.set(invoiceId, arr);
    }

    // ── 3. Stale pending invoices — late / missing webhook (§C9) ────────────
    const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, payment_status, created_at')
        .in('payment_status', ['pending', 'initiated'])
        .order('created_at', { ascending: false })
        .limit(maxEvents);

    if (invoiceError) {
        throw new Error(`[Reconciliation] invoices load failed: ${invoiceError.message}`);
    }

    const staleInvoices: StaleInvoiceRow[] = [];
    for (const row of ((invoiceData || []) as Record<string, unknown>[])) {
        const createdAt = toDate(toNullableString(row.created_at));
        if (!createdAt || createdAt >= staleCutoff) continue;

        const intentRows = intentsByInvoice.get(toNullableString(row.id) || '') || [];
        const latest = intentRows
            .slice()
            .sort((a, b) => (toNullableNumber(b.attempt_number) ?? 0) - (toNullableNumber(a.attempt_number) ?? 0))[0];

        const latestStatus = latest ? toNullableString(latest.status) : null;
        const latestProviderStatus = latest ? toNullableString(latest.provider_status) : null;

        // Provider never spoke on any attempt → genuine late/missing webhook (§C9).
        const providerNeverSpoke = intentRows.every((i) => !toNullableString(i.provider_status));

        staleInvoices.push({
            id: toNullableString(row.id),
            payment_status: toNullableString(row.payment_status),
            created_at: toNullableString(row.created_at),
            latest_intent_status: latestStatus,
            latest_provider_status: latestProviderStatus,
            minutes_pending: Math.round((now.getTime() - createdAt.getTime()) / 60_000),
            provider_never_spoke: providerNeverSpoke,
        });
    }

    const counts = {
        total_events: events.length,
        quarantined: events.filter((e) => e.processing_status?.toLowerCase().startsWith('quarantined')).length,
        replay: events.filter((e) => e.processing_status?.toLowerCase() === 'replay' || e.provider_status?.toUpperCase() === 'ORDER_PAID_BEFORE').length,
        duplicate: events.filter((e) => e.status === 'duplicate').length,
        skipped: events.filter((e) => e.status === 'skipped').length,
        processed: events.filter((e) => e.status === 'processed').length,
        needs_attention_events: events.filter((e) => e.needs_attention).length,
        unresolved_intents: unresolvedIntentRows.length,
        stale_pending_invoices: staleInvoices.length,
    };

    events.sort((a, b) => {
        const av = toDate(a.received_at)?.getTime() ?? 0;
        const bv = toDate(b.received_at)?.getTime() ?? 0;
        return bv - av;
    });

    return {
        generated_at: now.toISOString(),
        stale_threshold_minutes: staleThresholdMinutes,
        counts,
        events,
        unresolved_intents: unresolvedIntentRows,
        stale_pending_invoices: staleInvoices.sort((a, b) => a.minutes_pending - b.minutes_pending),
    };
}