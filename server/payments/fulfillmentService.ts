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

export type ProviderVerdictResult =
    | { code: 'applied'; outcome: 'success' | 'failed' }
    | { code: 'quarantined'; reason: string }
    | { code: 'already_processed' }
    | { code: 'amount_mismatch' }
    | { code: 'unresolved' };

interface SplitRow {
    beneficiary_id: string;
    allocated_amount_minor: number;
    rule_snapshot: { role?: string } | null;
}

interface InvoiceRow {
    user_id: string | null;
    tier_id: string | null;
    affiliate_id: string | null;
    referral_code: string | null;
    amount: number | null;
    currency: string | null;
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

    // Invoice-level lookups shared by the guards below.
    const { data: existing } = await supabase
        .from('invoices')
        .select('status, payment_status, user_id, tier_id')
        .eq('id', invoiceId)
        .single();

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

        // Defense-in-depth: never activate on a mismatched charge.
        const amountCheck = await verifyPaidAmount(invoiceId, verdict.paidAmount);
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

        // 1. Update invoice to paid
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
        await supabase
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

        // Phase 5: persist the provider verdict on the current PaymentIntent.
        if (currentIntentId) {
            await supabase
                .from('payment_intents')
                .update({ status: 'succeeded', provider_status: providerStatus, provider_transaction_id: verdict.externalReferenceId || null, updated_at: nowIso() })
                .eq('id', currentIntentId);
        }

        // 2. Get invoice details for profile update and affiliate commission
        const { data: invoice } = await supabase
            .from('invoices')
            .select('user_id, tier_id, affiliate_id, referral_code, amount, currency')
            .eq('id', invoiceId)
            .single();

        if (invoice?.user_id) {
            // 3. Activate subscription
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
        }

        // 4. Trigger affiliate commission (non-blocking, non-fatal)
        if (invoice?.affiliate_id && invoice?.referral_code) {
            try {
                const { triggerAffiliateCommission } = await import('../affiliate/ledgerService');
                await triggerAffiliateCommission(invoiceId);
            } catch (commErr) {
                // Commission failure must NEVER roll back payment activation
                console.error(`[Fulfillment] Commission trigger failed for ${invoiceId} (non-fatal):`, commErr);
            }
        }

        // 5. Freeze revenue splits (non-blocking, non-fatal to order payment)
        try {
            const { freezeOrderSplits } = await import('./splitEngine');
            await freezeOrderSplits(supabase, invoiceId);

            // 6. Record Double-Entry Journal in Financial Ledger (N-4)
            try {
                const { recordPaymentCaptureJournal, recordSplitAllocationJournal } = await import('./financialLedgerService');
                const grossMinor = Math.round(Number(verdict.paidAmount || (invoice as InvoiceRow | null)?.amount || 0) * 100);
                const feeMinor = 0; // gateway fee if available

                await recordPaymentCaptureJournal({
                    paymentIntentId: invoiceId,
                    invoiceId,
                    grossAmountMinor: grossMinor,
                    gatewayFeeMinor: feeMinor,
                    currency: (invoice as InvoiceRow | null)?.currency || 'EGP',
                    transactionId: verdict.externalReferenceId || invoiceId,
                    supabaseClient: supabase,
                });

                const { data: savedSplits } = await supabase
                    .from('order_splits')
                    .select('beneficiary_id, allocated_amount_minor, rule_snapshot')
                    .eq('invoice_id', invoiceId);

                if (savedSplits && savedSplits.length > 0) {
                    const netMinor = grossMinor - feeMinor;
                    await recordSplitAllocationJournal({
                        paymentIntentId: invoiceId,
                        invoiceId,
                        netAmountMinor: netMinor,
                        currency: (invoice as InvoiceRow | null)?.currency || 'EGP',
                        splits: savedSplits.map((s: SplitRow) => ({
                            beneficiaryId: s.beneficiary_id,
                            allocatedAmountMinor: s.allocated_amount_minor,
                            role: s.rule_snapshot?.role || 'beneficiary',
                        })),
                        supabaseClient: supabase,
                    });
                }
            } catch (ledgerErr) {
                console.warn(`[Fulfillment] Financial ledger posting notice for ${invoiceId}:`, ledgerErr);
            }
        } catch (splitErr) {
            // Split calculation failure must NEVER roll back payment activation
            console.error(`[Fulfillment] Revenue split freeze failed for ${invoiceId} (non-fatal):`, splitErr);
        }

        // 7. Grant Product Entitlement (N-11)
        if (invoice?.user_id && invoice?.tier_id) {
            try {
                const { grantEntitlement } = await import('./entitlementService');
                await grantEntitlement({ userId: invoice.user_id, productId: invoice.tier_id, invoiceId, paymentIntentId: invoiceId }, supabase);
            } catch (entitleErr) {
                console.warn(`[Fulfillment] Entitlement grant notice for ${invoiceId}:`, entitleErr);
            }
        }

        await markWebhookProcessed(input);
        return { code: 'applied', outcome: 'success' };
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