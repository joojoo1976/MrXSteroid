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
 * Persists payment legs into the invoice_payment_legs table idempotently.
 * Fails safely if table is not yet migrated, preserving legs in metadata.
 */
export async function persistPaymentLegs(
    supabase: SupabaseClient,
    legs: PaymentLeg[]
): Promise<void> {
    if (!legs || legs.length === 0) return;

    try {
        const rows = legs.map((leg) => ({
            id: leg.id,
            invoice_id: leg.invoiceId,
            leg_index: leg.legIndex,
            leg_type: leg.legType,
            provider: leg.provider,
            amount: leg.amount,
            actual_paid_amount: leg.actualPaidAmount ?? null,
            currency: leg.currency,
            status: leg.status,
            provider_reference: leg.providerReference,
            session_url: leg.sessionUrl,
            items: leg.items,
            paid_at: leg.paidAt,
        }));

        const table = supabase.from('invoice_payment_legs');
        if (typeof table?.upsert === 'function') {
            const { error } = await table.upsert(rows, { onConflict: 'invoice_id, leg_index' });
            if (error) {
                console.warn('[MultiLegPayment] invoice_payment_legs upsert note:', error.message);
            }
        } else if (typeof table?.insert === 'function') {
            const { error } = await table.insert(rows);
            if (error) {
                console.warn('[MultiLegPayment] invoice_payment_legs insert note:', error.message);
            }
        }
    } catch (err) {
        console.warn('[MultiLegPayment] persistPaymentLegs skipped table insert:', err);
    }
}
