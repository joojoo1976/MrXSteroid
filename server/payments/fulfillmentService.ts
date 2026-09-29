/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  FULFILLMENT / FAILURE SERVICE — Final Gate v5.1 Phase 7
 *
 *  THE single "state path" (spec §11) that turns a VERIFIED provider verdict
 *  into invoice + intent + profile + split + ledger + entitlement mutations.
 *
 *  It is shared verbatim by:
 *    · server/payments/webhook.ts          — verdict from an HMAC-verified webhook
 *    · server/payments/reconciliationRunner — verdict from a provider
 *        session/status query (test-mode reconciliation per K-2 C8)
 *
 *  Sharing is the "resolve via SAME state path, never create second posting"
 *  mandate: a resolved invoice is guarded here (invoice-level idempotency +
 *  N-1 late-arrival guard + amount verification) so a reconciler can never
 *  double-post a ledger/split/entitlement that the webhook already applied.
 *  ═══════════════════════════════════════════════════════════════════════════
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { verifyPaidAmount } from './verifyPaidAmount';
import { canApplyWebhookToIntent } from './paymentIntentService';
import { resolveGatewayFee } from './gatewayFee';

export interface ProviderVerdictInput {
    supabase: SupabaseClient;
    invoiceId: string;
    /** Gateway name as returned by getGatewayName() ('KASHIER_EGYPT', 'KASHIER_GLOBAL', ...). */
    gatewayName: string;
    /** Normalized verdict from a verified source (webhook or provider status query). */
    verdict: {
        status?: 'success' | 'failed';
        externalReferenceId?: string;
        paidAmount?: number;
        providerStatus?: string;
        providerOperation?: string;
    };
    /** Stable provider event id used for webhook_events dedup/marking. */
    providerEventId: string;
    /** Latest PaymentIntent id for this invoice (resolve via intent lookup if not supplied). */
    currentIntentId?: string | null;
    /**
     * Per-intent monotonic CAS counter (Phase 8 gate_version). When supplied, the
     * verdict is only applied if the intent's CURRENT gate_version still equals
     * `expectedGateVersion` — a stale/adversarial verdict whose gate already moved
     * past this value is QUARANTINED instead of overwriting the newer resolution.
     * Omit (or pass undefined) for plain forward reconciliation (no CAS).
     */
    expectedGateVersion?: number;
    providerStatus: string | null;
    /**
     * 'webhook' -> reconcile webhook_events statuses exactly as Phase 5 does.
     * 'reconciliation' -> the runner owns its webhook_events row (a synthetic
     *   reconciled event); this service only performs invoice/intent/ledger work.
     */
    source: 'webhook' | 'reconciliation';
    /** Raw payload for payment-source detection (webhook only; optional). */
    rawBody?: string;
}

/**
 * The stage at which a captured-but-unsettled payment left the financial
 * pipeline. Persisted on `webhook_events.processing_status` so an operator (or
 * the reconciler) can see exactly which step needs recovery.
 */
export type FinancialFailureStage =
    | 'payment_intent_unresolved'
    | 'gateway_fee_unresolved'
    | 'split_freeze_failed'
    | 'split_read_failed'
    | 'splits_incomplete'
    | 'split_allocation_mismatch'
    | 'ledger_idempotency_check_failed'
    | 'ledger_post_failed'
    | 'invoice_write_failed'
    | 'payment_intent_write_failed'
    | 'guest_claim_failed';

export type ProviderVerdictResult =
    | { code: 'applied'; outcome: 'success' | 'failed' }
    /**
     * The capture is financially settled, but the buyer was a GUEST, so the
     * entitlement is DEFERRED behind a single-use claim token rather than
     * granted. Deliberately NOT reported as `success`: the order is paid but the
     * product has not been delivered yet, and returning `success` here is
     * exactly the silent-delivery defect this outcome exists to prevent.
     */
    | { code: 'applied'; outcome: 'pending_claim'; claimId: string; expiresAt: string }
    | { code: 'quarantined'; reason: string }
    | { code: 'already_processed' }
    | { code: 'amount_mismatch' }
    | { code: 'financial_failure'; stage: FinancialFailureStage; reason: string }
    | { code: 'unresolved' };

export type LedgerSplitAccount =
    | 'BENEFICIARY_PAYABLE'
    | 'PLATFORM_REVENUE'
    | 'RESERVE'
    | 'CUSTOMER_FUNDS'
    | 'GATEWAY_FEES'
    | 'REFUND_LIABILITY'
    | 'PAYOUT_CLEARING';

interface InvoiceRow {
    user_id: string | null;
    tier_id: string | null;
    affiliate_id: string | null;
    referral_code: string | null;
    amount: number | null;
    currency: string | null;
    /** Guest email captured at checkout; NULL for an authenticated purchase. */
    customer_email: string | null;
    /** Region of the acquiring merchant, used to resolve the §6.3 fee policy. */
    region: string | null;
}

const nowIso = () => new Date().toISOString();

/**
 * Final webhook_events bookkeeping for the webhook path (parity with the
 * previous inline webhook.ts behaviour): mark the dedup row as processed.
 * Reconciliation (source='reconciliation') keeps its own synthetic row.
 */
const markWebhookProcessed = async (input: ProviderVerdictInput): Promise<void> => {
    if (input.source === 'reconciliation' || !input.providerEventId) return;
    await input.supabase
        .from('webhook_events')
        .update({ status: 'processed', processed_at: nowIso() })
        .eq('provider', input.gatewayName.toLowerCase())
        .eq('provider_event_id', input.providerEventId);
};

/**
 * A provider capture that reached the financial pipeline but did NOT produce
 * the required §6.3 journal is recorded as `failed` — NEVER `processed`.
 *
 * `status='failed'` is an EXISTING member of the production
 * `webhook_events_status_check` allow-list, so this needs no schema change and
 * is already visible to operators/queries. `processed_at` is deliberately left
 * NULL: the event is durably recorded but not settled, and the same provider
 * event id can be replayed to retry (see `webhook.ts` duplicate-resume).
 */
const markWebhookFinancialFailure = async (
    input: ProviderVerdictInput,
    stage: FinancialFailureStage,
    reason: string
): Promise<void> => {
    if (input.source === 'reconciliation' || !input.providerEventId) return;
    await input.supabase
        .from('webhook_events')
        .update({
            status: 'failed',
            processing_status: `financial_review:${stage}`,
            error_message: reason.slice(0, 1000),
            updated_at: nowIso(),
        })
        .eq('provider', input.gatewayName.toLowerCase())
        .eq('provider_event_id', input.providerEventId);
};

/**
 * Put the invoice/intent back into the reconciler's existing net so the capture
 * is RETRYABLE instead of a dead end:
 *
 *   · invoices.payment_status = 'unknown' is an existing allowed value AND an
 *     existing selector of `reconciliationRunner` (pending|initiated|unknown),
 *     so the capture is picked up by the normal reconciliation query.
 *   · The invoice is deliberately NOT set to success/paid, so the
 *     invoice-level idempotency guard cannot short-circuit a recovery replay.
 *   · payment_intents.status = 'unknown' (not 'succeeded') keeps the late
 *     -arrival guard from treating the capture as already-resolved.
 *
 * The provider's capture signal is preserved on both rows (provider_status,
 * provider_transaction_id) so reconciliation can still match the transaction.
 */
const markFinancialSettlementPending = async (
    input: ProviderVerdictInput,
    currentIntentId: string | null
): Promise<void> => {
    const { supabase, invoiceId, providerStatus, verdict } = input;
    await supabase
        .from('invoices')
        .update({ payment_status: 'unknown', updated_at: nowIso() })
        .eq('id', invoiceId)
        .in('payment_status', ['pending', 'initiated', 'unknown']);

    if (currentIntentId) {
        await supabase
            .from('payment_intents')
            .update({
                status: 'unknown',
                provider_status: providerStatus,
                provider_transaction_id: verdict.externalReferenceId || null,
                updated_at: nowIso(),
            })
            .eq('id', currentIntentId);
    }
};

/**
 * Applies a verified provider verdict through the canonical state path.
 * Returns a result code that callers map to their own ack contract.
 */
export async function applyProviderVerdict(input: ProviderVerdictInput): Promise<ProviderVerdictResult> {
    const { supabase, invoiceId, gatewayName, verdict, providerEventId, providerStatus, source } = input;
    const providerKey = gatewayName.toLowerCase();
    const gatewayIsKashier = gatewayName.startsWith('KASHIER');

    // Resolve the LATEST attempt row unless the caller supplied it.
    let currentIntentId: string | null = input.currentIntentId || null;
    if (!currentIntentId) {
        const { data: intentRow } = await supabase
            .from('payment_intents')
            .select('id')
            .eq('invoice_id', invoiceId)
            .order('attempt_number', { ascending: false })
            .limit(1)
            .maybeSingle();
        currentIntentId = intentRow?.id || null;
    }

    // Invoice-level lookups shared by the guards below. A query failure is a
    // failure — it is never equivalent to "invoice does not exist".
    const { data: existing, error: existingError } = await supabase
        .from('invoices')
        .select('status, payment_status, user_id, tier_id')
        .eq('id', invoiceId)
        .single();

    if (existingError) {
        console.error(
            `❌ [Fulfillment] Invoice lookup failed for ${invoiceId}: ${existingError.message}`
        );
        return { code: 'unresolved' };
    }

    if (!existing) {
        console.warn(`⚠️ [Fulfillment] Invoice ${invoiceId} not found — cannot apply verdict`);
        return { code: 'unresolved' };
    }

    // ── N-1 LATE-ARRIVAL GUARD (spec §10) ─────────────────────────────────────
    // Never let a non-current attempt downgrade a paid invoice, and never mutate
    // through a stale/intentionally-void attempt. QUARANTINE instead of
    // destructive rejection; the provider signal is still persisted on the row.
    if (currentIntentId) {
        const { data: intentRow } = await supabase
            .from('payment_intents')
            .select('id, attempt_number, is_current, status, provider_status')
            .eq('id', currentIntentId)
            .single();
        if (intentRow) {
            const guard = canApplyWebhookToIntent({
                intent: intentRow,
                invoiceStatus: existing.payment_status || existing.status || '',
                incomingStatus: verdict.status || 'unknown',
            });
            if (!guard.canApply) {
                const reason = String(guard.reason || 'late arrival').slice(0, 200);
                console.warn(`⚠️ [Fulfillment] ${gatewayName} ${reason}`);
                if (source === 'webhook' && providerEventId) {
                    await supabase
                        .from('webhook_events')
                        .update({ status: 'skipped', processing_status: `quarantined: ${reason}`, processed_at: nowIso(), updated_at: nowIso() })
                        .eq('provider', providerKey)
                        .eq('provider_event_id', providerEventId);
                }
                await supabase
                    .from('payment_intents')
                    .update({
                        provider_status: providerStatus,
                        provider_transaction_id: verdict.externalReferenceId || null,
                        updated_at: nowIso(),
                    })
                    .eq('id', currentIntentId);
                return { code: 'quarantined', reason };
            }
        }
    }

    // ── INVOICE-LEVEL IDEMPOTENCY ─────────────────────────────────────────────
    // "Never create a second posting": if the invoice is already resolved, the
    // verdict is acknowledged but NO ledger/split/entitlement work runs again.
    if (existing.status === 'success' || existing.payment_status === 'paid') {
        console.log(`⚡ [Fulfillment] Invoice ${invoiceId} already processed — idempotent skip`);
        if (source === 'webhook' && providerEventId) {
            await supabase
                .from('webhook_events')
                .update({ status: 'duplicate', processed_at: nowIso() })
                .eq('provider', providerKey)
                .eq('provider_event_id', providerEventId);
        }
        return { code: 'already_processed' };
    }

    // ── NO ACTIONABLE STATUS ──────────────────────────────────────────────────
    if (verdict.status !== 'success' && verdict.status !== 'failed') {
        console.log(`⏳ [Fulfillment] Unresolved verdict for ${invoiceId} — no action, pending reconciliation`);
        if (currentIntentId) {
            await supabase
                .from('payment_intents')
                .update({
                    status: 'unknown',
                    provider_status: providerStatus,
                    provider_transaction_id: verdict.externalReferenceId || null,
                    updated_at: nowIso(),
                })
                .eq('id', currentIntentId);
        }
        return { code: 'unresolved' };
    }

    // ── SUCCESS PATH (fulfillment) ────────────────────────────────────────────
    if (verdict.status === 'success') {
        // Phase 8 gate_version CAS: an adversarial / late-arriving verdict that
        // no longer matches the intent's CURRENT gate (i.e. a NEWER verdict already
        // advanced the counter) must NOT overwrite the newer resolution. We bail
        // out into QUARANTINE instead of racing the counter.
        const expectedGate = input.expectedGateVersion;
        const hasCAsGate = typeof expectedGate === 'number' && !!currentIntentId;
        if (hasCAsGate) {
            const { data: intentRow } = await supabase
                .from('payment_intents')
                .select('gate_version')
                .eq('id', currentIntentId)
                .single();
            const intentGate = intentRow?.gate_version ?? 0;
            if (intentGate !== expectedGate) {
                console.warn(
                    `⚠️ [Fulfillment] gate_version CAS miss for ${invoiceId}: expected ${expectedGate}, current ${intentGate} — quarantining stale verdict (no overwrite)`
                );
                if (source === 'webhook' && providerEventId) {
                    await supabase
                        .from('webhook_events')
                        .update({
                            status: 'skipped',
                            processing_status: `quarantined: gate_version CAS mismatch (expected ${expectedGate}, current ${intentGate})`,
                            processed_at: nowIso(),
                            updated_at: nowIso(),
                        })
                        .eq('provider', providerKey)
                        .eq('provider_event_id', providerEventId);
                }
                return { code: 'quarantined', reason: `gate_version CAS mismatch (expected ${expectedGate}, intent is at ${intentGate})` };
            }
        }

        // Defense-in-depth: never activate on a mismatched charge. The SAME
        // database handle is used so the verified invoice is the invoice the
        // §6.3 journal will be posted against.
        const amountCheck = await verifyPaidAmount(invoiceId, verdict.paidAmount, supabase);
        if (!amountCheck.ok) {
            console.error(`❌ [Fulfillment] Amount verification failed for ${invoiceId} — not activating.`);
            await supabase
                .from('invoices')
                .update({
                    status: 'failed',
                    payment_status: 'failed',
                    gateway_reference_id: verdict.externalReferenceId || undefined,
                    kashier_transaction_id: gatewayIsKashier ? (verdict.externalReferenceId || undefined) : undefined,
                    updated_at: nowIso(),
                })
                .eq('id', invoiceId);
            if (currentIntentId) {
                await supabase
                    .from('payment_intents')
                    .update({ status: 'failed', provider_status: providerStatus, provider_transaction_id: verdict.externalReferenceId || null, updated_at: nowIso() })
                    .eq('id', currentIntentId);
            }
            return { code: 'amount_mismatch' };
        }

        // ══════════════════════════════════════════════════════════════════════
        // FINANCIAL SETTLEMENT — §6.3 fail-closed (BLOCKER 2)
        // ══════════════════════════════════════════════════════════════════════
        // The provider capture is real, but the capture is NOT financially
        // settled until the single §6.3 journal is persisted against the REAL
        // `payment_intents.id`. Every failure below takes the durable recovery
        // path: webhook_events='failed', invoice back to a reconciler-visible
        // 'unknown', intent left 'unknown', and NO entitlement / profile
        // activation / `processed` settlement. The provider event id stays
        // replayable, so recovery never needs a new linkage model.
        const transactionId = verdict.externalReferenceId || invoiceId;

        const failFinancial = async (
            stage: FinancialFailureStage,
            reason: string
        ): Promise<ProviderVerdictResult> => {
            console.error(
                `❌ [Fulfillment] §6.3 settlement FAILED (${stage}) for ${invoiceId}: ${reason}`
            );
            await markFinancialSettlementPending(input, currentIntentId);
            await markWebhookFinancialFailure(input, stage, reason);
            return { code: 'financial_failure', stage, reason };
        };

        // ── INVOICE FACTS (needed by the financial block below) ───────────────
        // Read the paid-invoice payload BEFORE any write so the §6.3 gross and
        // currency come from the same row that is about to be settled.
        // `customer_email` + `region` are required for the deferred guest-claim
        // branch and for merchant fee-policy resolution respectively.
        const { data: invoice, error: invoiceFactsError } = await supabase
            .from('invoices')
            .select('user_id, tier_id, affiliate_id, referral_code, amount, currency, customer_email, region')
            .eq('id', invoiceId)
            .single();

        // A read ERROR is not the same as "no facts". A missing invoice would
        // silently zero the gross and skip the fee, so fail closed instead.
        if (invoiceFactsError || !invoice) {
            return failFinancial(
                'invoice_write_failed',
                `could not read invoice facts for §6.3 settlement: ${invoiceFactsError?.message ?? 'invoice not found'}`
            );
        }

        // 1. BLOCKER 1 — the ledger/entitlement FK is `payment_intents(id)`.
        //    The invoice id is NOT a payment intent id. The authoritative id was
        //    resolved above from `payment_intents.invoice_id` (latest attempt);
        //    without it we cannot establish the required linkage, so we fail
        //    closed rather than posting an unlinkable journal.
        if (!currentIntentId) {
            return failFinancial(
                'payment_intent_unresolved',
                `No payment_intents row for invoice ${invoiceId}: cannot satisfy financial_ledger.payment_intent_id FK`
            );
        }

        // 2. §6.3 GROSS (G) — resolved BEFORE the split freeze, because the NET
        //    basis N = G - F must be known before the allocation is computed.
        const grossMinor = Math.round(
            Number(verdict.paidAmount || (invoice as InvoiceRow | null)?.amount || 0) * 100
        );
        if (!Number.isInteger(grossMinor) || grossMinor <= 0) {
            return failFinancial(
                'splits_incomplete',
                `captured gross is not a positive integer minor unit: ${grossMinor}`
            );
        }

        // 3. §6.3 GATEWAY FEE (F) — the real fee, resolved from an explicit
        //    precedence chain (persisted intent fee > provider-reported >
        //    approved Kashier schedule for the ACTUAL payment method). When no
        //    source yields a fee we FAIL CLOSED. Silently defaulting to 0 is the
        //    exact defect this replaces: it made N = G, left GATEWAY_FEES
        //    unposted, and credited the beneficiaries with the fee that Kashier
        //    actually charged. There is deliberately NO regional or 'GLOBAL'
        //    default fee — see the header of server/payments/gatewayFee.ts.
        let providerPayload: Record<string, unknown> | null = null;
        if (input.rawBody) {
            try {
                const parsedRaw: unknown = JSON.parse(input.rawBody);
                if (parsedRaw && typeof parsedRaw === 'object' && !Array.isArray(parsedRaw)) {
                    providerPayload = parsedRaw as Record<string, unknown>;
                }
            } catch {
                providerPayload = null;
            }
        }

        let persistedFeeMinor: number | null = null;
        {
            const { data: intentFeeRow } = await supabase
                .from('payment_intents')
                .select('gateway_fee_minor')
                .eq('id', currentIntentId)
                .maybeSingle();
            if (intentFeeRow && intentFeeRow.gateway_fee_minor !== null) {
                persistedFeeMinor = Number(intentFeeRow.gateway_fee_minor);
            }
        }

        const feeResolution = await resolveGatewayFee({
            supabase,
            grossMinor,
            persistedFeeMinor,
            providerPayload,
        });
        if (!feeResolution.ok) {
            return failFinancial('gateway_fee_unresolved', feeResolution.reason);
        }
        const feeMinor = feeResolution.feeMinor;

        // Persist F on the intent so a webhook replay or a reconciliation pass
        // settles against the identical fee instead of re-deriving one.
        if (persistedFeeMinor === null) {
            const { error: feePersistError } = await supabase
                .from('payment_intents')
                .update({ gateway_fee_minor: feeMinor, updated_at: nowIso() })
                .eq('id', currentIntentId)
                .is('gateway_fee_minor', null);
            if (feePersistError) {
                return failFinancial(
                    'payment_intent_write_failed',
                    `could not persist the resolved §6.3 gateway fee: ${feePersistError.message}`
                );
            }
        }

        // 4. Freeze the required §6.3 allocation against the NET basis
        //    N = G - F. A throw OR a non-frozen result is a financial failure —
        //    never "continue with zero splits" and never derive `fee = gross`.
        let frozen: { frozen: boolean; splitsCount: number };
        try {
            const { freezeOrderSplits } = await import('./splitEngine');
            frozen = await freezeOrderSplits(supabase, invoiceId, feeMinor);
        } catch (splitErr) {
            const detail = splitErr instanceof Error ? splitErr.message : String(splitErr);
            return failFinancial('split_freeze_failed', `freezeOrderSplits threw: ${detail}`);
        }
        if (!frozen || frozen.frozen !== true || !(frozen.splitsCount > 0)) {
            return failFinancial(
                'split_freeze_failed',
                `freezeOrderSplits did not freeze the required allocation (frozen=${frozen?.frozen}, splitsCount=${frozen?.splitsCount})`
            );
        }

        // 5. Read the frozen allocation back. A query ERROR is a failure; it
        //    must never be collapsed into "[]".
        const { data: savedSplits, error: splitsReadError } = await supabase
            .from('order_splits')
            .select('beneficiary_id, allocated_amount_minor, destination_account')
            .eq('invoice_id', invoiceId);
        if (splitsReadError) {
            return failFinancial(
                'split_read_failed',
                `order_splits read failed: ${splitsReadError.message}`
            );
        }
        if (!Array.isArray(savedSplits) || savedSplits.length === 0) {
            return failFinancial(
                'splits_incomplete',
                'order_splits returned zero rows for a captured payment — refusing to post a §6.3 journal'
            );
        }

        const ledgerSplits = savedSplits.map((s) => ({
            beneficiaryId: (s.beneficiary_id ?? null) as string | null,
            allocatedAmountMinor: Number(s.allocated_amount_minor),
            account: (s.destination_account ?? 'BENEFICIARY_PAYABLE') as LedgerSplitAccount,
        }));

        // 6. Split completeness — the allocation must actually equal the NET
        //    basis N = G - F before a journal is created. Every line must be a
        //    positive integer minor unit.
        const malformed = ledgerSplits.find(
            (s) => !Number.isInteger(s.allocatedAmountMinor) || s.allocatedAmountMinor <= 0
        );
        if (malformed) {
            return failFinancial(
                'splits_incomplete',
                `split allocation is not a positive integer minor unit: ${malformed.allocatedAmountMinor}`
            );
        }

        const allocatedSplitsMinor = ledgerSplits.reduce((sum, s) => sum + s.allocatedAmountMinor, 0);
        if (allocatedSplitsMinor <= 0) {
            return failFinancial('splits_incomplete', 'split allocations sum to zero');
        }

        if (feeMinor < 0 || feeMinor >= grossMinor) {
            return failFinancial(
                'gateway_fee_unresolved',
                `resolved gateway fee ${feeMinor} is not a valid share of gross ${grossMinor}`
            );
        }

        // The allocation MUST be exactly the NET basis. This is the assertion
        // that the signed §6.3 journal balances:
        //     sum(Cr splits) = N = G - F   and   Dr N + Dr F = G
        // A mismatch means the split engine and the resolved fee disagree, which
        // would silently post an unbalanced or mis-attributed journal.
        const expectedNetMinor = grossMinor - feeMinor;
        if (allocatedSplitsMinor !== expectedNetMinor) {
            return failFinancial(
                'split_allocation_mismatch',
                `split allocations (${allocatedSplitsMinor}) do not equal the §6.3 net basis G-F (${grossMinor}-${feeMinor}=${expectedNetMinor})`
            );
        }

        // 7. Replay-safe idempotency. A recovery replay after a failure that
        //    actually persisted the journal MUST NOT double-post, so the
        //    existing §6.3 capture journal is detected first.
        const { data: existingCapture, error: existingCaptureError } = await supabase
            .from('financial_ledger')
            .select('journal_entry_id')
            .eq('invoice_id', invoiceId)
            .eq('event_type', 'PAYMENT_CAPTURED')
            .limit(1);
        if (existingCaptureError) {
            return failFinancial(
                'ledger_idempotency_check_failed',
                `could not verify whether the §6.3 capture journal already exists: ${existingCaptureError.message}`
            );
        }
        const alreadyPosted = Array.isArray(existingCapture) && existingCapture.length > 0;

        if (!alreadyPosted) {
            // 6. Post the single §6.3 journal against the REAL payment intent id
            //    and verify the persistence outcome (not merely "was called").
            let posted: {
                journalEntryId: string;
                totalDebitMinor: number;
                totalCreditMinor: number;
                entriesPosted: number;
            };
            try {
                const { recordPaymentPostingJournal } = await import('./financialLedgerService');
                posted = await recordPaymentPostingJournal({
                    paymentIntentId: currentIntentId,
                    invoiceId,
                    grossAmountMinor: grossMinor,
                    gatewayFeeMinor: feeMinor,
                    currency: (invoice as InvoiceRow | null)?.currency || 'EGP',
                    transactionId,
                    splits: ledgerSplits,
                    supabaseClient: supabase,
                });
            } catch (ledgerErr) {
                const detail = ledgerErr instanceof Error ? ledgerErr.message : String(ledgerErr);
                return failFinancial('ledger_post_failed', `§6.3 journal was not persisted: ${detail}`);
            }
            if (
                !posted ||
                !posted.journalEntryId ||
                !(posted.entriesPosted > 0) ||
                !(posted.totalDebitMinor > 0) ||
                posted.totalDebitMinor !== posted.totalCreditMinor
            ) {
                return failFinancial(
                    'ledger_post_failed',
                    `§6.3 journal persistence not confirmed: ${JSON.stringify(posted ?? null)}`
                );
            }
            console.log(
                `✅ [Fulfillment] §6.3 journal persisted for ${invoiceId} → ${posted.journalEntryId} (Dr=${posted.totalDebitMinor} Cr=${posted.totalCreditMinor}, intent=${currentIntentId})`
            );
        } else {
            console.log(
                `♻️ [Fulfillment] §6.3 capture journal already exists for ${invoiceId} — settling forward without a duplicate posting`
            );
        }

        // ══════════════════════════════════════════════════════════════════════
        // FINANCIAL SETTLEMENT CONFIRMED — finalization is now allowed.
        // ══════════════════════════════════════════════════════════════════════

        // 7. Update invoice to paid
        let isFromPaymentPage = false;
        if (input.rawBody) {
            try {
                const parsed = JSON.parse(input.rawBody);
                if (parsed.source === 'kashier_payment_page' || parsed.ppLink || parsed.prepaymentPage) {
                    isFromPaymentPage = true;
                }
            } catch { /* ignore */ }
        }

        const kashierFields = gatewayIsKashier ? {
            kashier_transaction_id: verdict.externalReferenceId || undefined,
            kashier_order_id: invoiceId,
            payment_source: isFromPaymentPage ? 'kashier_payment_page' : 'kashier_gateway',
        } : {};

        // The invoice write IS the "paid" state. A silent failure here would
        // leave the capture acknowledged while the invoice stayed `pending`
        // and the entitlement was still granted below — an entitlement with no
        // matching paid invoice. Fail closed instead.
        const { error: invoiceWriteError } = await supabase
            .from('invoices')
            .update({
                status: 'success',
                payment_status: 'paid',
                paid_at: nowIso(),
                gateway_reference_id: verdict.externalReferenceId || undefined,
                ...kashierFields,
                updated_at: nowIso(),
            })
            .eq('id', invoiceId);

        if (invoiceWriteError) {
            return failFinancial(
                'invoice_write_failed',
                `invoices update failed: ${invoiceWriteError.message}`
            );
        }

        // Phase 5: persist the provider verdict on the current PaymentIntent.
        const { error: intentWriteError } = await supabase
            .from('payment_intents')
            .update({ status: 'succeeded', provider_status: providerStatus, provider_transaction_id: verdict.externalReferenceId || null, updated_at: nowIso() })
            .eq('id', currentIntentId);

        if (intentWriteError) {
            return failFinancial(
                'payment_intent_write_failed',
                `payment_intents update failed: ${intentWriteError.message}`
            );
        }

        // 9. Trigger affiliate commission (non-blocking, non-fatal)
        if (invoice?.affiliate_id && invoice?.referral_code) {
            try {
                const { triggerAffiliateCommission } = await import('../affiliate/ledgerService');
                await triggerAffiliateCommission(invoiceId);
            } catch (commErr) {
                // Commission failure must NEVER roll back payment activation
                console.error(`[Fulfillment] Commission trigger failed for ${invoiceId} (non-fatal):`, commErr);
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // ENTITLEMENT DELIVERY — authenticated buyer vs deferred guest claim
        // ══════════════════════════════════════════════════════════════════════
        //
        // The §6.3 journal is durably persisted and the invoice is `paid`, so
        // from here on the only remaining question is WHO receives the product.
        //
        // `entitlements.user_id` is NOT NULL, so a guest — whose invoice has
        // `user_id = NULL` — can never hold an entitlement. The previous code
        // simply skipped both delivery steps for a guest and still returned
        // `outcome: 'success'`, so a captured guest payment settled, reported
        // success, and delivered nothing. That silent revenue loss is closed
        // here: a guest payment now issues a single-use claim token and reports
        // `pending_claim`, which the caller must surface as NOT-delivered-yet.
        if (invoice?.user_id) {
            // 8. Activate subscription (authenticated buyer).
            await supabase
                .from('profiles')
                .update({
                    subscription_tier: invoice.tier_id,
                    subscription_status: 'active',
                    has_paid: true,
                    plan_tier: invoice.tier_id,
                    updated_at: nowIso(),
                })
                .eq('id', invoice.user_id);
            console.log(`✅ [Fulfillment] Subscription activated — User: ${invoice.user_id}, Tier: ${invoice.tier_id}`);

            // 10. Grant Product Entitlement (N-11) — only ever AFTER the §6.3
            //     journal is durably persisted, so an entitlement is never
            //     granted on a financially unsettled capture.
            if (invoice.tier_id) {
                try {
                    const { grantEntitlement } = await import('./entitlementService');
                    await grantEntitlement({ userId: invoice.user_id, productId: invoice.tier_id, invoiceId, paymentIntentId: currentIntentId }, supabase);
                } catch (entitleErr) {
                    console.warn(`[Fulfillment] Entitlement grant notice for ${invoiceId}:`, entitleErr);
                }
            }

            await markWebhookProcessed(input);
            return { code: 'applied', outcome: 'success' };
        }

        // ── GUEST BUYER: defer delivery behind a single-use claim token ───────
        const guestEmail = (invoice as InvoiceRow | null)?.customer_email ?? null;
        if (!guestEmail) {
            // A guest order with no captured email has no way to deliver a
            // claim. Fail closed into the reconciler-visible 'unknown' state
            // rather than settling a paid order that can never be delivered.
            return failFinancial(
                'guest_claim_failed',
                'guest payment has no captured email, so the entitlement cannot be deferred to a claim'
            );
        }
        if (!invoice?.tier_id) {
            return failFinancial(
                'guest_claim_failed',
                'guest payment has no tier_id, so the entitlement cannot be deferred to a claim'
            );
        }

        let claim: { claimId: string; token: string; expiresAt: string; email: string };
        try {
            const { createGuestOrderClaim, buildGuestClaimUrl } = await import('./guestClaimService');
            claim = await createGuestOrderClaim({
                supabase,
                invoiceId,
                paymentIntentId: currentIntentId,
                email: guestEmail,
                productId: invoice.tier_id,
            });
            // Delivery is a notification concern and must NEVER undo a settled
            // capture, so a dispatch failure is logged, not thrown. The claim row
            // is already durable and the token can be re-delivered by support.
            const claimUrl = buildGuestClaimUrl(claim.token);
            try {
                const { sendGuestClaimEmail } = await import('./guestClaimEmail');
                const delivery = await sendGuestClaimEmail({
                    to: claim.email,
                    productId: invoice.tier_id,
                    claimUrl,
                    expiresAt: claim.expiresAt,
                });
                if (!delivery.ok) {
                    console.error(
                        `[Fulfillment] Guest claim email NOT delivered for ${invoiceId} (${delivery.reason ?? 'unknown'}); claim ${claim.claimId} is durable and can be re-delivered`
                    );
                }
            } catch (mailErr) {
                console.error(`[Fulfillment] Guest claim email threw for ${invoiceId} (non-fatal):`, mailErr);
            }
        } catch (claimErr) {
            const detail = claimErr instanceof Error ? claimErr.message : String(claimErr);
            return failFinancial(
                'guest_claim_failed',
                `guest entitlement could not be deferred to a claim: ${detail}`
            );
        }

        console.warn(
            `⚠️ [Fulfillment] Guest payment settled for ${invoiceId} — entitlement DEFERRED behind claim ${claim.claimId} (expires ${claim.expiresAt}). Delivery is NOT complete.`
        );

        // The financial settlement AND the claim row are both durable at this
        // point, so this event is fully handled and must be closed out. Leaving
        // it `pending` would make the event look unreconciled and would let a
        // redelivered webhook re-enter this path and revoke/reissue the claim
        // that the guest is holding.
        await markWebhookProcessed(input);

        // Deliberately NOT `success`: the order is paid but the product has not
        // been delivered. The caller must report pending delivery.
        return { code: 'applied', outcome: 'pending_claim', claimId: claim.claimId, expiresAt: claim.expiresAt };
    }

    // ── FAILURE PATH ──────────────────────────────────────────────────────────
    const kashierFields = gatewayIsKashier ? {
        kashier_transaction_id: verdict.externalReferenceId || undefined,
    } : {};
    await supabase
        .from('invoices')
        .update({
            status: 'failed',
            payment_status: 'failed',
            ...kashierFields,
            updated_at: nowIso(),
        })
        .eq('id', invoiceId);

    if (currentIntentId) {
        await supabase
            .from('payment_intents')
            .update({ status: 'failed', provider_status: providerStatus, provider_transaction_id: verdict.externalReferenceId || null, updated_at: nowIso() })
            .eq('id', currentIntentId);
    }

    console.log(`❌ [Fulfillment] Payment failed for invoice: ${invoiceId}`);
    await markWebhookProcessed(input);
    return { code: 'applied', outcome: 'failed' };
}