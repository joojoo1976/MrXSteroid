/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  server/payments/multiLegPaymentService.ts
 *
 *  CONSOLIDATED INTERNAL INVOICE WITH MULTI-LEG PAYMENTS
 *  Implementation of Project Owner Decision V3.2:
 *
 *  Core Invariants:
 *  ─────────────────────────────────────────────────────────────────────────
 *  1. SINGLE INTERNAL SOURCE OF TRUTH:
 *     The website generates and retains ONE internal invoice (and ONE order)
 *     for the entire customer cart, including when books (Fourthwall) and
 *     direct services (Kashier) are purchased together.
 *
 *  2. FROZEN ITEMS & PRICES:
 *     All line items, quantities, unit prices, shipping, and discounts are
 *     frozen at creation time in `invoices.metadata.lines` and `orders.items`.
 *
 *  3. INDEPENDENT PAYMENT LEGS:
 *     Each external payment channel (e.g. Fourthwall for books, Kashier for
 *     services) executes an independent payment leg tied back to the SAME
 *     `invoice_id`.
 *
 *  4. PARTIAL PAYMENT SUPPORT:
 *     When one leg succeeds and another is pending/failed, the invoice
 *     transitions to 'partially_paid'.
 *
 *  5. STRICT ENTITLEMENT GATING:
 *     An invoice is ONLY promoted to 'paid' when ALL legs have succeeded and
 *     the full invoice amount is satisfied. Entitlements and digital book
 *     downloads are NEVER granted for 'partially_paid', 'pending', or 'failed'
 *     invoices.
 *
 *  6. NO DOUBLE CHARGING:
 *     Each line item belongs to exactly one leg. Subtotals and shipping
 *     are never duplicated across legs.
 *
 *  7. ATOMIC RECONCILIATION & PERSISTENCE:
 *     Legs are recorded in `invoice_payment_legs` and updates are reconciled
 *     atomically with replay guards.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { randomUUID } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isDirectServiceTier } from './checkout/combinedCheckoutSessionService';

export type PaymentLegType = 'merchandise' | 'service' | 'standard';
export type PaymentLegProvider = 'kashier' | 'fourthwall' | 'instapay' | 'stripe' | 'manual';
export type PaymentLegStatus = 'pending' | 'initiated' | 'succeeded' | 'failed' | 'cancelled';
export type ConsolidatedPaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'failed';

export interface PaymentLegItem {
    kind: string;
    tierId: string;
    quantity: number;
    unitAmount: number;
    amount: number;
    shippable: boolean;
}

export interface PaymentLeg {
    id: string;
    invoiceId: string;
    legIndex: number;
    legType: PaymentLegType;
    provider: PaymentLegProvider;
    amount: number;
    actualPaidAmount?: number | null;
    currency: string;
    status: PaymentLegStatus;
    providerReference: string | null;
    sessionUrl: string | null;
    items: PaymentLegItem[];
    paidAt: string | null;
}

export interface ConsolidatedInvoicePlan {
    invoiceId: string;
    totalAmount: number;
    currency: string;
    legs: PaymentLeg[];
    isMultiLeg: boolean;
}

/**
 * Decomposes a set of order lines into independent payment legs tied to a single invoice.
 *
 * Rules:
 * - Reject any lines whose currencies differ from the invoice currency.
 * - In EGYPT: All lines (merchandise + services) route through Kashier in EGP -> 1 leg.
 * - In GLOBAL:
 *   - Merchandise/books route through Fourthwall (USD).
 *   - Direct services route through Kashier (USD).
 *   - Mixed carts generate 2 independent legs linked to the SAME invoiceId.
 */
export function planPaymentLegs(params: {
    invoiceId: string;
    region: 'EGYPT' | 'GLOBAL';
    currency: string;
    lines: Array<{
        kind: string;
        tierId: string;
        quantity: number;
        unitAmount: number;
        amount: number;
        shippable: boolean;
        currency?: string;
    }>;
    shippingCost?: number;
    discount?: number;
}): ConsolidatedInvoicePlan {
    const { invoiceId, region, currency, lines, shippingCost = 0, discount = 0 } = params;

    if (!lines || lines.length === 0) {
        throw new Error('[MultiLegPayment] Cannot create payment legs with empty lines.');
    }

    // Currency verification: reject any mismatch
    for (const line of lines) {
        if (line.currency && line.currency !== currency) {
            throw new Error(
                `[MultiLegPayment] Line currency mismatch: expected ${currency}, got ${line.currency} for tier ${line.tierId}`
            );
        }
    }

    // 1. Single-region Egypt always routes to Kashier EGP (1 leg)
    if (region === 'EGYPT') {
        const legAmount = lines.reduce((acc, l) => acc + l.amount, 0) + shippingCost - discount;
        const leg: PaymentLeg = {
            id: randomUUID(),
            invoiceId,
            legIndex: 1,
            legType: 'standard',
            provider: 'kashier',
            amount: Math.max(0, Math.round(legAmount * 100) / 100),
            currency,
            status: 'pending',
            providerReference: null,
            sessionUrl: null,
            items: lines,
            paidAt: null,
        };
        return {
            invoiceId,
            totalAmount: leg.amount,
            currency,
            legs: [leg],
            isMultiLeg: false,
        };
    }

    // 2. GLOBAL region: partition into merchandise vs services
    const merchandiseLines = lines.filter((l) => !isDirectServiceTier(l.tierId));
    const serviceLines = lines.filter((l) => isDirectServiceTier(l.tierId));

    const legs: PaymentLeg[] = [];
    let legIndex = 1;

    // Merchandise Leg (Fourthwall)
    if (merchandiseLines.length > 0) {
        const merchSubtotal = merchandiseLines.reduce((acc, l) => acc + l.amount, 0);
        // Shipping attaches to physical merchandise
        const merchTotal = Math.max(0, merchSubtotal + shippingCost - discount);

        legs.push({
            id: randomUUID(),
            invoiceId,
            legIndex: legIndex++,
            legType: 'merchandise',
            provider: 'fourthwall',
            amount: Math.round(merchTotal * 100) / 100,
            currency: 'USD',
            status: 'pending',
            providerReference: null,
            sessionUrl: null,
            items: merchandiseLines,
            paidAt: null,
        });
    }

    // Direct Service Leg (Kashier)
    if (serviceLines.length > 0) {
        const serviceSubtotal = serviceLines.reduce((acc, l) => acc + l.amount, 0);
        // Services never incur shipping
        legs.push({
            id: randomUUID(),
            invoiceId,
            legIndex: legIndex++,
            legType: 'service',
            provider: 'kashier',
            amount: Math.round(serviceSubtotal * 100) / 100,
            currency: 'USD',
            status: 'pending',
            providerReference: null,
            sessionUrl: null,
            items: serviceLines,
            paidAt: null,
        });
    }

    const totalAmount = legs.reduce((acc, l) => acc + l.amount, 0);

    return {
        invoiceId,
        totalAmount: Math.round(totalAmount * 100) / 100,
        currency: 'USD',
        legs,
        isMultiLeg: legs.length > 1,
    };
}

/**
 * Evaluates the consolidated invoice status from the statuses of its payment legs.
 */
export function evaluateConsolidatedInvoiceStatus(legs: PaymentLeg[]): ConsolidatedPaymentStatus {
    if (!legs || legs.length === 0) return 'pending';

    const allSucceeded = legs.every((l) => l.status === 'succeeded');
    if (allSucceeded) {
        return 'paid';
    }

    const anySucceeded = legs.some((l) => l.status === 'succeeded');
    if (anySucceeded) {
        return 'partially_paid';
    }

    const allFailed = legs.every((l) => l.status === 'failed' || l.status === 'cancelled');
    if (allFailed) {
        return 'failed';
    }

    return 'pending';
}

/**
 * Handles a verdict for a specific payment leg and computes the new consolidated invoice state.
 *
 * Invariant: Entitlement and downloads are ONLY unlocked when overall status === 'paid'.
 */
export function processLegVerdict(
    currentLegs: PaymentLeg[],
    verdict: {
        legId?: string;
        provider?: string;
        providerReference?: string;
        status: 'succeeded' | 'failed';
        paidAmount?: number;
        paidCurrency?: string;
        paidAt?: string;
    }
): {
    updatedLegs: PaymentLeg[];
    consolidatedStatus: ConsolidatedPaymentStatus;
    canGrantEntitlement: boolean;
    targetLeg: PaymentLeg | null;
    error?: string;
} {
    const currentStatus = evaluateConsolidatedInvoiceStatus(currentLegs);

    // 0. Strict input validations for successful settlement (V3.4.1)
    if (verdict.status === 'succeeded') {
        if (verdict.paidAmount === undefined || verdict.paidAmount === null || Number.isNaN(verdict.paidAmount) || verdict.paidAmount <= 0) {
            return {
                updatedLegs: currentLegs,
                consolidatedStatus: currentStatus,
                canGrantEntitlement: false,
                targetLeg: null,
                error: 'INVALID_PAID_AMOUNT',
            };
        }

        // When settling via external provider/webhook (no explicit internal legId), require full metadata
        if (!verdict.legId) {
            if (!verdict.providerReference || verdict.providerReference.trim() === '') {
                return {
                    updatedLegs: currentLegs,
                    consolidatedStatus: currentStatus,
                    canGrantEntitlement: false,
                    targetLeg: null,
                    error: 'MISSING_PROVIDER_REFERENCE',
                };
            }
            if (!verdict.provider || verdict.provider.trim() === '') {
                return {
                    updatedLegs: currentLegs,
                    consolidatedStatus: currentStatus,
                    canGrantEntitlement: false,
                    targetLeg: null,
                    error: 'MISSING_PROVIDER',
                };
            }
            if (!verdict.paidCurrency || verdict.paidCurrency.trim() === '') {
                return {
                    updatedLegs: currentLegs,
                    consolidatedStatus: currentStatus,
                    canGrantEntitlement: false,
                    targetLeg: null,
                    error: 'MISSING_PAID_CURRENCY',
                };
            }
        }
    }

    // 1. Locate candidate matching leg
    const targetIndex = currentLegs.findIndex((leg) => {
        if (verdict.legId && leg.id === verdict.legId) return true;
        const providerMatches = verdict.provider
            ? leg.provider.toLowerCase() === verdict.provider.toLowerCase()
            : false;
        if (!providerMatches) return false;
        if (verdict.providerReference && leg.providerReference === verdict.providerReference) {
            return true;
        }
        return !leg.providerReference && leg.status === 'pending';
    });

    if (targetIndex === -1) {
        return {
            updatedLegs: currentLegs,
            consolidatedStatus: currentStatus,
            canGrantEntitlement: false,
            targetLeg: null,
            error: 'LEG_NOT_FOUND',
        };
    }

    const candidateLeg = currentLegs[targetIndex];

    // 2. Strict Currency Verification
    if (verdict.paidCurrency && verdict.paidCurrency.toUpperCase() !== candidateLeg.currency.toUpperCase()) {
        console.warn(
            `[MultiLegPayment] Leg currency mismatch: expected ${candidateLeg.currency}, got ${verdict.paidCurrency}`
        );
        return {
            updatedLegs: currentLegs,
            consolidatedStatus: currentStatus,
            canGrantEntitlement: false,
            targetLeg: null,
            error: `Leg currency mismatch: expected ${candidateLeg.currency}, got ${verdict.paidCurrency}`,
        };
    }

    // 3. Strict Amount Verification (0.01 tolerance)
    if (verdict.paidAmount !== undefined && verdict.paidAmount !== null && !Number.isNaN(verdict.paidAmount)) {
        if (Math.abs(verdict.paidAmount - candidateLeg.amount) > 0.01) {
            console.warn(
                `[MultiLegPayment] Leg amount mismatch: expected ${candidateLeg.amount}, got ${verdict.paidAmount}`
            );
            return {
                updatedLegs: currentLegs,
                consolidatedStatus: currentStatus,
                canGrantEntitlement: false,
                targetLeg: null,
                error: `Leg amount mismatch: expected ${candidateLeg.amount}, got ${verdict.paidAmount}`,
            };
        }
    }

    // 4. Update target leg
    const targetLeg: PaymentLeg = {
        ...candidateLeg,
        status: verdict.status,
        actualPaidAmount: verdict.status === 'succeeded' ? verdict.paidAmount : candidateLeg.actualPaidAmount,
        paidAt: verdict.status === 'succeeded' ? (verdict.paidAt || new Date().toISOString()) : candidateLeg.paidAt,
        providerReference: verdict.providerReference || candidateLeg.providerReference,
    };

    const updatedLegs = [...currentLegs];
    updatedLegs[targetIndex] = targetLeg;

    const consolidatedStatus = evaluateConsolidatedInvoiceStatus(updatedLegs);
    const totalPlanned = updatedLegs.reduce((acc, l) => acc + l.amount, 0);
    const totalActual = updatedLegs.reduce(
        (acc, l) => acc + (l.status === 'succeeded' ? (l.actualPaidAmount ?? l.amount) : 0),
        0
    );
    const canGrantEntitlement = consolidatedStatus === 'paid' && totalActual >= totalPlanned - 0.01;

    return {
        updatedLegs,
        consolidatedStatus,
        canGrantEntitlement,
        targetLeg,
    };
}

/**
 * Persists payment legs into the invoice_payment_legs table idempotently and race-safely.
 *
 * CRITICAL P0 PROTECTIONS (V3.4.1 Remediation):
 * 1. Treats an unsuccessful database-state read as a failure; never proceeds with a write
 *    based on an empty state inferred from a query error.
 * 2. Distinguishes a genuinely empty table from a missing table (pre-migration) or query failure.
 * 3. Enforces monotonic payment-leg transitions: a stale snapshot can NEVER overwrite an
 *    already succeeded leg, its provider reference, actual paid amount, or paid timestamp.
 * 4. Atomic conditional update guards against races where settlement occurs between read and write.
 */
export async function persistPaymentLegs(
    supabase: SupabaseClient,
    legs: PaymentLeg[]
): Promise<void> {
    if (!legs || legs.length === 0) return;

    const invoiceId = legs[0]?.invoiceId;
    if (!invoiceId) {
        throw new Error('[MultiLegPayment] Cannot persist legs without invoiceId.');
    }

    // 1. Authoritative DB query with strict error distinction
    const { data: existingRows, error: readError } = await supabase
        .from('invoice_payment_legs')
        .select('id, invoice_id, leg_index, status, provider_reference, paid_at, actual_paid_amount')
        .eq('invoice_id', invoiceId);

    if (readError) {
        const isTableMissing =
            readError.code === '42P01' ||
            (typeof readError.message === 'string' &&
                (readError.message.includes('relation') || readError.message.includes('does not exist')));

        if (isTableMissing) {
            console.warn('[MultiLegPayment] invoice_payment_legs table does not exist (pre-migration). Skipping DB write.');
            return;
        }

        // Query error must NEVER silently fallback to an upsert or infer empty state!
        console.error('[MultiLegPayment] Database read error while inspecting payment legs:', readError);
        throw new Error(`[MultiLegPayment] Query error reading existing legs: ${readError.message}`);
    }

    // Ensure response is a valid array
    if (existingRows === null || existingRows === undefined || !Array.isArray(existingRows)) {
        throw new Error('[MultiLegPayment] Unexpected database response: existing payment legs is not an array.');
    }

    const existingMap = new Map<number, any>();
    for (const row of existingRows) {
        existingMap.set(row.leg_index, row);
    }

    // 2. Monotonic Transitions & Concurrency Safety
    for (const leg of legs) {
        const existing = existingMap.get(leg.legIndex);

        if (existing) {
            // Already succeeded in DB: absolute freeze, skip update entirely to prevent regression
            if (existing.status === 'succeeded') {
                continue;
            }

            // Target is not yet succeeded: prepare update payload
            const updatePayload: Record<string, any> = {
                leg_type: leg.legType,
                provider: leg.provider,
                amount: leg.amount,
                currency: leg.currency,
                session_url: leg.sessionUrl,
                items: leg.items,
                updated_at: new Date().toISOString(),
            };

            if (leg.status === 'succeeded') {
                updatePayload.status = 'succeeded';
                updatePayload.actual_paid_amount = leg.actualPaidAmount ?? leg.amount;
                updatePayload.provider_reference = leg.providerReference;
                updatePayload.paid_at = leg.paidAt || new Date().toISOString();
            } else {
                updatePayload.status = leg.status;
                updatePayload.provider_reference = leg.providerReference;
            }

            // CRITICAL CONCURRENCY PROTECTION:
            // Conditional update with atomic precondition:
            // Only update if status in the database is still not 'succeeded'.
            // If another worker/webhook settled this leg between our read and write,
            // this update matches 0 rows rather than overwriting the succeeded settlement.
            const { error: updateErr } = await supabase
                .from('invoice_payment_legs')
                .update(updatePayload)
                .eq('invoice_id', leg.invoiceId)
                .eq('leg_index', leg.legIndex)
                .in('status', ['pending', 'initiated', 'failed', 'cancelled']);

            if (updateErr) {
                console.error(`[MultiLegPayment] Failed to update leg ${leg.legIndex}:`, updateErr.message);
                throw new Error(`[MultiLegPayment] Failed to update leg ${leg.legIndex}: ${updateErr.message}`);
            }
        } else {
            // Leg does not exist in DB yet: insert new leg
            const insertPayload = {
                id: leg.id,
                invoice_id: leg.invoiceId,
                leg_index: leg.legIndex,
                leg_type: leg.legType,
                provider: leg.provider,
                amount: leg.amount,
                actual_paid_amount: leg.actualPaidAmount ?? null,
                currency: leg.currency,
                status: leg.status,
                provider_reference: leg.providerReference ?? null,
                session_url: leg.sessionUrl ?? null,
                items: leg.items || [],
                paid_at: leg.paidAt ?? null,
            };

            const { error: insertErr } = await supabase
                .from('invoice_payment_legs')
                .insert(insertPayload);

            if (insertErr) {
                console.warn(`[MultiLegPayment] Leg ${leg.legIndex} insert note:`, insertErr.message);
            }
        }
    }
}
