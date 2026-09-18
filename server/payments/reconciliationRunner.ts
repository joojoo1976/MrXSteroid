/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RECONCILIATION RUNNER — Final Gate v5.1 Phase 7 (active resolver)
 *
 *  Complements the read-only `reconciliationService` snapshot with the ACTIVE
 *  5-minute reconciliation pass (spec §11):
 *
 *    · Every 5 min (Vercel cron) walk a bounded set of candidates:
 *        - invoices whose PAYMENT is still pending/initiated past the stale
 *          threshold (>15 min) — the "late / missing webhook" class (§C9),
 *        - intents still UNKNOWN,
 *        - webhook events quarantined by the N-1 late-arrival guard.
 *    · Query the PROVIDER's session/status endpoint (test-mode reconciliation
 *      per K-2 C8).
 *    · Resolve the outcome through the SAME canonical state path used by the
 *      webhook (`applyProviderVerdict` in fulfillmentService) so a reconciler
 *      can NEVER create a second posting (invoice-level idempotency + late-
 *      arrival quarantine already guard the shared path).
 *    · Exponential backoff per intent (max 12 attempts) recorded on
 *      `payment_intents.reconciliation_*` columns; every run is logged to
 *      `reconciliation_runs` and each resolution is audited in `audit_log`.
 *
 *  The status query is injected (`statusQuery`) so integration tests can stub
 *  provider connectivity; the Kashier default uses verifyPaymentSession →
 *  resolveKashierPaymentOutcome (C8 test-mode session/status query).
 *  ═══════════════════════════════════════════════════════════════════════════
 */

import type { SupabaseClient } from '@supabase/supabase-js';

type StatusOutcome = 'SUCCESS' | 'FAILURE' | 'PENDING' | 'EXPIRED' | 'UNKNOWN';

export interface ProviderStatusQueryResult {
    /** true when the provider surfaced an authoritative session record. */
    found: boolean;
    outcome: StatusOutcome;
    externalReferenceId?: string;
    paidAmount?: number;
    providerStatus?: string;
    providerOperation?: string;
    /** Raw provider response, persisted on the synthetic audit row when possible. */
    raw?: Record<string, unknown>;
}

export interface RunnerCandidateIntent {
    id: string;
    invoice_id: string;
    attempt_number: number;
    is_current: boolean;
    status: string;
    provider_order_id: string | null;
    provider_status: string | null;
    created_at: string;
    reconciliation_attempts: number;
    reconciliation_next_attempt_at: string | null;
    environment: string | null;
}

export interface ReconciliationRunnerOptions {
    supabase: SupabaseClient;
    /** Clock override for deterministic tests. */
    now?: Date;
    /** Trigger source recorded on reconciliation_runs. */
    triggerSource?: 'cron' | 'manual';
    /** Invoices pending longer than this many minutes are candidates. */
    staleInvoiceMinutes?: number;
    /** Maximum provider-status polls per intent (spec §11: max 12). */
    maxAttempts?: number;
    /** Exponential backoff base in minutes (delay = base * 2^(attempts-1)). */
    backoffBaseMinutes?: number;
    /** Backoff cap in minutes (default 8h). */
    backoffMaxMinutes?: number;
    /** Max candidates resolved per single run. */
    limit?: number;
    /** Max webhook_events scanned for quarantined candidates. */
    maxEvents?: number;
    /** Provider session/status query — injected for tests. */
    statusQuery: (intent: RunnerCandidateIntent) => Promise<ProviderStatusQueryResult>;
}

export type CandidateResolution =
    | 'resolved'         // success or failure applied through the shared path
    | 'already_processed' // invoice already resolved elsewhere — no second posting
    | 'amount_mismatch'  // success reported but amount verification failed
    | 'quarantined'      // N-1 guard rejected the resolution
    | 'unresolved'       // provider reply pending/unknown or unreachable
    | 'max_attempts_reached';

export interface ReconciliationRunSummary {
    run_id: string | null;
    trigger_source: 'cron' | 'manual';
    started_at: string;
    finished_at: string;
    counts: {
        candidates: number;
        resolved: number;
        already_processed: number;
        amount_mismatch: number;
        quarantined: number;
        unresolved: number;
        max_attempts_reached: number;
    };
    resolutions: Array<{
        intent_id: string;
        invoice_id: string;
        resolution: CandidateResolution;
        provider_status: string | null;
        message?: string;
    }>;
}

const delayForAttempt = (attempt: number, baseMinutes: number, capMinutes: number): number =>
    Math.min(baseMinutes * Math.pow(2, Math.max(0, attempt - 1)), capMinutes);

function isCandidateStatus(status: string | null): boolean {
    const s = (status || '').toUpperCase();
    return s === 'INITIATED' || s === 'PENDING' || s === 'UNKNOWN';
}

function toDate(v: string | null | undefined): Date | null {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
}

const toNullableString = (v: unknown): string | null =>
    v === null || v === undefined ? null : String(v);

const toNullableNumber = (v: unknown): number | null =>
    v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v);

/**
 * Kashier default status query (K-2 C8): polls the provider session/status
 * endpoint via KashierGateway.verifyPaymentSession and normalizes the reply
 * through the same outcome resolver used by the webhook path.
 */
export async function queryKashierSessionStatus(
    intent: RunnerCandidateIntent,
    gateway: { verifyPaymentSession(sessionId: string): Promise<Record<string, unknown> | null> },
    resolver: (payload: Record<string, unknown>) => { outcome: StatusOutcome }
): Promise<ProviderStatusQueryResult> {
    if (!intent.provider_order_id) return { found: false, outcome: 'UNKNOWN' };

    let raw: Record<string, unknown> | null = null;
    try {
        raw = await gateway.verifyPaymentSession(intent.provider_order_id);
    } catch (err) {
        console.warn(`⚠️ [Reconciliation] session query failed for ${intent.provider_order_id}:`, err);
    }
    if (!raw) return { found: false, outcome: 'UNKNOWN' };

    const resolution = resolver(raw);
    const providerStatus =
        toNullableString(raw.lastStatus) ||
        toNullableString(raw.status) ||
        toNullableString(raw.orderStatus) ||
        resolution.outcome;

    return {
        found: true,
        outcome: resolution.outcome,
        externalReferenceId: toNullableString(raw.transactionId) || toNullableString(raw.paymentId) || undefined,
        paidAmount: toNullableNumber(raw.amount) ?? undefined,
        providerStatus,
        providerOperation: toNullableString(raw.operation) || 'pay',
        raw,
    };
}

/**
 * Runs ONE reconciliation pass. Candidate selection, provider polling,
 * shared-path resolution, backoff bookkeeping, audit + run log. Non-throwing:
 * any unexpected error is captured into the run log summary.
 */
export async function runReconciliation(
    options: ReconciliationRunnerOptions
): Promise<ReconciliationRunSummary> {
    const supabase = options.supabase;
    const now = options.now || new Date();
    const triggerSource = options.triggerSource || 'cron';
    const staleMinutes = options.staleInvoiceMinutes ?? 15;
    const maxAttempts = options.maxAttempts ?? 12;
    const backoffBase = options.backoffBaseMinutes ?? 5;
    const backoffCap = options.backoffMaxMinutes ?? 480;
    const limit = options.limit ?? 100;
    const maxEvents = options.maxEvents ?? 500;

    const startedAt = now.toISOString();
    const counts = {
        candidates: 0,
        resolved: 0,
        already_processed: 0,
        amount_mismatch: 0,
        quarantined: 0,
        unresolved: 0,
        max_attempts_reached: 0,
    };
    const resolutions: ReconciliationRunSummary['resolutions'] = [];

    // ―― 1. Open the run log ────────────────────────────────────────────────────
    let runId: string | null = null;
    try {
        const { data: runRow } = await supabase
            .from('reconciliation_runs')
            .insert({ trigger_source: triggerSource, status: 'running', started_at: startedAt })
            .select('id')
            .single();
        runId = runRow?.id || null;
    } catch (runLogErr) {
        console.warn('[Reconciliation] run log insert notice:', runLogErr);
    }

    // ―― 2. Collect candidates ──────────────────────────────────────────────────
    const staleCutoff = new Date(now.getTime() - staleMinutes * 60_000);
    const candidateInvoiceIds = new Set<string>();

    // (a) stale pending/initiated/unknown invoices (> threshold)
    const { data: invoiceRows, error: invoiceErr } = await supabase
        .from('invoices')
        .select('id, payment_status, created_at')
        .in('payment_status', ['pending', 'initiated', 'unknown'])
        .order('created_at', { ascending: false })
        .limit(limit * 4);
    if (invoiceErr) {
        await finalizeFailedRun(supabase, runId, now, `invoices load failed: ${invoiceErr.message}`);
        return buildSummary(runId, triggerSource, startedAt, now.toISOString(), counts, resolutions);
    }
    for (const row of (invoiceRows || []) as Record<string, unknown>[]) {
        const createdAt = toDate(toNullableString(row.created_at));
        const id = toNullableString(row.id);
        if (id && createdAt && createdAt < staleCutoff) candidateInvoiceIds.add(id);
    }

    // (b) quarantined webhook events (late-arrival, spec §10) → their invoices
    const { data: eventRows, error: eventErr } = await supabase
        .from('webhook_events')
        .select('invoice_id, processing_status')
        .order('received_at', { ascending: false })
        .limit(maxEvents);
    if (eventErr) {
        await finalizeFailedRun(supabase, runId, now, `webhook_events load failed: ${eventErr.message}`);
        return buildSummary(runId, triggerSource, startedAt, now.toISOString(), counts, resolutions);
    }
    for (const row of (eventRows || []) as Record<string, unknown>[]) {
        if (toNullableString(row.processing_status)?.toLowerCase().startsWith('quarantined')) {
            const invoiceId = toNullableString(row.invoice_id);
            if (invoiceId) candidateInvoiceIds.add(invoiceId);
        }
    }

    // (c) intents still UNKNOWN → their invoices
    const intentIds = Array.from(candidateInvoiceIds);
    const candidates: RunnerCandidateIntent[] = [];
    if (intentIds.length > 0) {
        const { data: intentRows, error: intentErr } = await supabase
            .from('payment_intents')
            .select('*')
            .in('invoice_id', intentIds);
        if (intentErr) {
            await finalizeFailedRun(supabase, runId, now, `payment_intents load failed: ${intentErr.message}`);
            return buildSummary(runId, triggerSource, startedAt, now.toISOString(), counts, resolutions);
        }

        const unknownInvoiceIds = new Set<string>();
        // (c) UNKNOWN intents anywhere in the recent window (regardless of invoice age)
        const { data: unknownIntentRows } = await supabase
            .from('payment_intents')
            .select('invoice_id')
            .in('status', ['unknown'])
            .order('created_at', { ascending: false })
            .limit(maxEvents);
        for (const row of (unknownIntentRows || []) as Record<string, unknown>[]) {
            const invoiceId = toNullableString(row.invoice_id);
            if (invoiceId) unknownInvoiceIds.add(invoiceId);
        }
        // An invoice tied to any UNKNOWN intent is itself a reconciliation target.
        for (const invoiceId of unknownInvoiceIds) candidateInvoiceIds.add(invoiceId);

        // Latest attempt per candidate invoice (mirrors the §C9 scoped pattern).
        const intentsByInvoice = new Map<string, Record<string, unknown>>();
        for (const row of (intentRows || []) as Record<string, unknown>[]) {
            const invoiceId = toNullableString(row.invoice_id);
            if (!invoiceId) continue;
            const existing = intentsByInvoice.get(invoiceId);
            const attempt = toNullableNumber(row.attempt_number) ?? 0;
            if (!existing || (toNullableNumber(existing.attempt_number) ?? 0) < attempt) {
                intentsByInvoice.set(invoiceId, row);
            }
        }

        for (const [invoiceId, row] of intentsByInvoice.entries()) {
            const status = toNullableString(row.status);
            // Latest attempt eligible when it is unresolved and due for a poll.
            if (!isCandidateStatus(status)) continue;
            const attempts = toNullableNumber(row.reconciliation_attempts) ?? 0;
            if (attempts >= maxAttempts) {
                counts.max_attempts_reached++;
                continue;
            }
            const nextAt = toDate(toNullableString(row.reconciliation_next_attempt_at));
            if (nextAt && nextAt.getTime() > now.getTime()) continue; // backoff not elapsed

            const inCandidateSet = candidateInvoiceIds.has(invoiceId);
            if (!inCandidateSet) continue;

            candidates.push({
                id: toNullableString(row.id) || '',
                invoice_id: invoiceId,
                attempt_number: toNullableNumber(row.attempt_number) ?? 1,
                is_current: row.is_current !== false,
                status: status || '',
                provider_order_id: toNullableString(row.provider_order_id),
                provider_status: toNullableString(row.provider_status),
                created_at: toNullableString(row.created_at) || startedAt,
                reconciliation_attempts: attempts,
                reconciliation_next_attempt_at: toNullableString(row.reconciliation_next_attempt_at),
                environment: toNullableString(row.environment),
            });
        }
    }

    // Oldest first; bounded per run.
    candidates.sort((a, b) => (toDate(a.created_at)?.getTime() ?? 0) - (toDate(b.created_at)?.getTime() ?? 0));
    const toProcess = candidates.slice(0, limit);
    counts.candidates = toProcess.length;

    // ―― 3. Resolve each candidate through the SHARED state path ───────────────
    for (const intent of toProcess) {
        const attempt = intent.reconciliation_attempts + 1;
        const record: ReconciliationRunSummary['resolutions'][number] = {
            intent_id: intent.id,
            invoice_id: intent.invoice_id,
            resolution: 'unresolved',
            provider_status: intent.provider_status,
        };

        try {
            const provider = await options.statusQuery(intent);

            if (!provider.found || provider.outcome === 'PENDING' || provider.outcome === 'UNKNOWN') {
                // Still not terminal — back off and re-check on a later run.
                await applyBackoff(supabase, intent.id, attempt, now, maxAttempts, backoffBase, backoffCap);
                if (attempt >= maxAttempts) {
                    counts.max_attempts_reached++;
                    record.resolution = 'max_attempts_reached';
                    record.message = `Provider reply: ${provider.outcome} after ${maxAttempts} attempts`;
                } else {
                    counts.unresolved++;
                    record.resolution = 'unresolved';
                    record.message = `Provider reply: ${provider.outcome}`;
                }
                record.provider_status = provider.providerStatus || record.provider_status;
                await auditResolution(supabase, intent, record, provider.found ? 'pending_retry' : 'provider_unreachable', now);
                resolutions.push(record);
                continue;
            }

            const verdict: 'success' | 'failed' = provider.outcome === 'SUCCESS' ? 'success' : 'failed';
            const gatewayName = toNullableString(intent.environment) === 'live' ? 'KASHIER_GLOBAL' : 'KASHIER_EGYPT';

            // Synthetic audit/trail row BEFORE the shared resolution (source=reconciliation
            // keeps its own row; the shared path will not mark webhook rows).
            await insertReconciledEvent(supabase, intent, provider, gatewayName, startedAt);

            const { applyProviderVerdict } = await import('./fulfillmentService');
            const result = await applyProviderVerdict({
                supabase,
                invoiceId: intent.invoice_id,
                gatewayName,
                verdict: {
                    status: verdict,
                    externalReferenceId: provider.externalReferenceId,
                    paidAmount: provider.paidAmount,
                    providerStatus: provider.providerStatus || undefined,
                    providerOperation: provider.providerOperation,
                },
                providerEventId: `reconciled-${intent.id}-${attempt}`,
                currentIntentId: intent.id,
                providerStatus: provider.providerStatus ?? null,
                source: 'reconciliation',
            });

            // Terminal outcomes stop the backoff clock.
            switch (result.code) {
                case 'applied':
                    counts.resolved++;
                    record.resolution = 'resolved';
                    record.message = `${result.outcome} applied via shared state path`;
                    break;
                case 'already_processed':
                    counts.already_processed++;
                    record.resolution = 'already_processed';
                    record.message = 'Already resolved elsewhere — no second posting';
                    break;
                case 'amount_mismatch':
                    counts.amount_mismatch++;
                    record.resolution = 'amount_mismatch';
                    record.message = 'Provider reported success but amount verification failed';
                    break;
                case 'quarantined':
                    counts.quarantined++;
                    record.resolution = 'quarantined';
                    record.message = result.reason || 'N-1 late-arrival guard rejected resolution';
                    break;
                default:
                    counts.unresolved++;
                    record.resolution = 'unresolved';
                    record.message = 'Verdict unresolved — will retry on backoff';
                    await applyBackoff(supabase, intent.id, attempt, now, maxAttempts, backoffBase, backoffCap);
            }
            if (result.code !== 'unresolved') {
                await applyBackoff(supabase, intent.id, attempt, now, maxAttempts, backoffBase, backoffCap, true);
            }
            record.provider_status = provider.providerStatus || record.provider_status;
            await auditResolution(supabase, intent, record, result.code, now);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            record.resolution = 'unresolved';
            record.message = `Runner error: ${message}`;
            counts.unresolved++;
            await applyBackoff(supabase, intent.id, attempt, now, maxAttempts, backoffBase, backoffCap);
        }
        resolutions.push(record);
    }

    // ―― 4. Finalize run log ────────────────────────────────────────────────────
    const finishedAt = now.toISOString();
    if (runId) {
        try {
            await supabase
                .from('reconciliation_runs')
                .update({
                    status: 'completed',
                    finished_at: finishedAt,
                    candidates_count: counts.candidates,
                    resolved_count: counts.resolved,
                    quarantined_count: counts.quarantined,
                    still_unresolved_count: counts.unresolved + counts.max_attempts_reached,
                    max_attempts_reached: counts.max_attempts_reached,
                    metadata: { resolutions },
                })
                .eq('id', runId);
        } catch (finalizeErr) {
            console.warn(`[Reconciliation] run log finalize notice for ${runId}:`, finalizeErr);
        }
    }

    return buildSummary(runId, triggerSource, startedAt, finishedAt, counts, resolutions);
}

// ―― Backoff bookkeeping ───────────────────────────────────────────────────────
async function applyBackoff(
    supabase: SupabaseClient,
    intentId: string,
    attempt: number,
    now: Date,
    maxAttempts: number,
    backoffBase: number,
    backoffCap: number,
    terminal?: boolean
): Promise<void> {
    if (terminal) {
        await supabase
            .from('payment_intents')
            .update({
                reconciliation_attempts: attempt,
                reconciliation_last_attempt_at: now.toISOString(),
                reconciliation_next_attempt_at: null,
                updated_at: now.toISOString(),
            })
            .eq('id', intentId);
        return;
    }
    const nextDelayMinutes = delayForAttempt(attempt, backoffBase, backoffCap);
    const nextAt = new Date(now.getTime() + nextDelayMinutes * 60_000).toISOString();
    await supabase
        .from('payment_intents')
        .update({
            reconciliation_attempts: attempt,
            reconciliation_last_attempt_at: now.toISOString(),
            reconciliation_next_attempt_at: nextAt,
            updated_at: now.toISOString(),
        })
        .eq('id', intentId);
}

// ―― Synthetic reconciled webhook_events row (source=reconciliation trail) ──────
async function insertReconciledEvent(
    supabase: SupabaseClient,
    intent: RunnerCandidateIntent,
    provider: ProviderStatusQueryResult,
    gatewayName: string,
    receivedAt: string
): Promise<void> {
    try {
        await supabase.from('webhook_events').insert({
            provider: gatewayName.toLowerCase(),
            provider_event_id: `reconciled-${intent.id}-${intent.reconciliation_attempts + 1}`,
            transaction_id: provider.externalReferenceId || null,
            invoice_id: intent.invoice_id,
            payment_intent_id: intent.id,
            event_type: 'reconciled',
            provider_status: provider.providerStatus || null,
            status: 'processed',
            processing_status: 'reconciled',
            raw_payload: provider.raw || {},
            received_at: receivedAt,
            processed_at: receivedAt,
        });
    } catch (err) {
        // Trail write is non-fatal; resolution still proceeds.
        console.warn('[Reconciliation] synthetic event insert notice:', err);
    }
}

// ―― Audit trail (audit_log, system actor) ─────────────────────────────────────
async function auditResolution(
    supabase: SupabaseClient,
    intent: RunnerCandidateIntent,
    record: ReconciliationRunSummary['resolutions'][number],
    code: string,
    now: Date
): Promise<void> {
    try {
        await supabase.from('audit_log').insert({
            actor_type: 'system',
            action: 'reconciliation.resolve',
            entity_type: 'invoice',
            entity_id: intent.invoice_id,
            new_state: {
                resolution: record.resolution,
                code,
                intent_id: intent.id,
                attempt: intent.reconciliation_attempts + 1,
                provider_status: record.provider_status || null,
                message: record.message || null,
            },
            created_at: now.toISOString(),
        });
    } catch (err) {
        console.warn('[Reconciliation] audit insert notice:', err);
    }
}

// ―― Helpers ──────────────────────────────────────────────────────────────────
async function finalizeFailedRun(
    supabase: SupabaseClient,
    runId: string | null,
    now: Date,
    errorMessage: string
): Promise<void> {
    if (!runId) return;
    try {
        await supabase
            .from('reconciliation_runs')
            .update({ status: 'failed', finished_at: now.toISOString(), error_message: errorMessage })
            .eq('id', runId);
    } catch { /* ignore */ }
}

function buildSummary(
    runId: string | null,
    triggerSource: 'cron' | 'manual',
    startedAt: string,
    finishedAt: string,
    counts: ReconciliationRunSummary['counts'],
    resolutions: ReconciliationRunSummary['resolutions']
): ReconciliationRunSummary {
    return { run_id: runId, trigger_source: triggerSource, started_at: startedAt, finished_at: finishedAt, counts, resolutions };
}