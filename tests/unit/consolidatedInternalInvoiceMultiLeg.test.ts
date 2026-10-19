/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  tests/unit/consolidatedInternalInvoiceMultiLeg.test.ts
 *
 *  Comprehensive verification of the Consolidated Internal Invoice &
 *  Multi-Leg Payment System (Project Owner Decision V3).
 *
 *  Verified Invariants:
 *  ─────────────────────────────────────────────────────────────────────────
 *  INV-01 — Consolidated Internal Invoice:
 *           A mixed cart (Fourthwall Books + Kashier Services) creates ONE
 *           authoritative internal invoice and ONE order. Items, prices, and
 *           shipping are frozen at creation time.
 *
 *  INV-02 — Multi-Leg Independence & Referencing:
 *           Each external provider receives an independent payment leg with
 *           its own amount, currency, and provider reference, all linked to
 *           the single internal invoiceId.
 *
 *  INV-03 — Partial Payment State ('partially_paid'):
 *           When one leg settles (e.g. Fourthwall book paid) but another leg
 *           is pending or failed (e.g. Kashier coaching pending), the
 *           consolidated invoice transitions to 'partially_paid'.
 *
 *  INV-04 — Strict Entitlement & Download Gating:
 *           In 'partially_paid' status, neither subscription activation nor
 *           product entitlement nor digital book downloads are granted.
 *
 *  INV-05 — Full Settlement Required for 'paid':
 *           The invoice only transitions to 'paid' when ALL legs have settled
 *           with status 'succeeded'. Only then are entitlements unlocked.
 *
 *  INV-06 — Exact Accounting & No Double Counting:
 *           Sum of leg amounts exactly equals the consolidated invoice total.
 *           Physical shipping is allocated to physical merchandise only and
 *           is never duplicated onto digital services.
 *
 *  INV-07 — Egypt Local Path Parity:
 *           Egypt orders generate a single consolidated leg in EGP via Kashier,
 *           preserving existing local flows without regression.
 *
 *  INV-08 — All-Leg Failure:
 *           When all legs fail, the consolidated invoice transitions to 'failed'.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import {
    planPaymentLegs,
    evaluateConsolidatedInvoiceStatus,
    processLegVerdict,
    type PaymentLeg,
} from '../../server/payments/multiLegPaymentService';

describe('Consolidated Internal Invoice — Multi-Leg Payment Architecture (V3)', () => {
    // ── INV-01 & INV-06: Frozen Totals, Single Invoice, No Double Charging ──
    it('INV-01 & INV-06: creates one consolidated invoice plan for mixed books + services with exact accounting', () => {
        const invoiceId = 'inv_consolidated_001';
        const lines = [
            {
                kind: 'book',
                tierId: 'digital',
                quantity: 1,
                unitAmount: 49.99,
                amount: 49.99,
                shippable: false,
            },
            {
                kind: 'service',
                tierId: 'coaching_addon',
                quantity: 1,
                unitAmount: 349.99,
                amount: 349.99,
                shippable: false,
            },
        ];

        const plan = planPaymentLegs({
            invoiceId,
            region: 'GLOBAL',
            currency: 'USD',
            lines,
            shippingCost: 0,
            discount: 0,
        });

        expect(plan.invoiceId).toBe(invoiceId);
        expect(plan.isMultiLeg).toBe(true);
        expect(plan.legs).toHaveLength(2);

        // Authoritative consolidated total
        expect(plan.totalAmount).toBe(399.98);
        expect(plan.currency).toBe('USD');

        // Leg 1: Merchandise (Fourthwall)
        const merchLeg = plan.legs.find((l) => l.legType === 'merchandise');
        expect(merchLeg).toBeDefined();
        expect(merchLeg!.provider).toBe('fourthwall');
        expect(merchLeg!.amount).toBe(49.99);
        expect(merchLeg!.currency).toBe('USD');
        expect(merchLeg!.items).toHaveLength(1);
        expect(merchLeg!.items[0].tierId).toBe('digital');

        // Leg 2: Service (Kashier)
        const serviceLeg = plan.legs.find((l) => l.legType === 'service');
        expect(serviceLeg).toBeDefined();
        expect(serviceLeg!.provider).toBe('kashier');
        expect(serviceLeg!.amount).toBe(349.99);
        expect(serviceLeg!.currency).toBe('USD');
        expect(serviceLeg!.items).toHaveLength(1);
        expect(serviceLeg!.items[0].tierId).toBe('coaching_addon');

        // Exact sum verification: no double counting
        const sumOfLegs = plan.legs.reduce((acc, l) => acc + l.amount, 0);
        expect(sumOfLegs).toBe(plan.totalAmount);
    });

    // ── INV-02: Independent Leg References linked to same invoice ───────────
    it('INV-02: each leg has a unique leg id and index, tied to the SAME invoiceId', () => {
        const invoiceId = 'inv_consolidated_002';
        const lines = [
            {
                kind: 'book',
                tierId: 'paperback',
                quantity: 1,
                unitAmount: 72.00,
                amount: 72.00,
                shippable: true,
            },
            {
                kind: 'service',
                tierId: 'consultation',
                quantity: 1,
                unitAmount: 30.00,
                amount: 30.00,
                shippable: false,
            },
        ];

        const plan = planPaymentLegs({
            invoiceId,
            region: 'GLOBAL',
            currency: 'USD',
            lines,
            shippingCost: 15.00, // international shipping applies to physical book
        });

        expect(plan.legs).toHaveLength(2);
        const [leg1, leg2] = plan.legs;

        expect(leg1.invoiceId).toBe(invoiceId);
        expect(leg2.invoiceId).toBe(invoiceId);
        expect(leg1.id).not.toBe(leg2.id);
        expect(leg1.legIndex).toBe(1);
        expect(leg2.legIndex).toBe(2);

        // Shipping only attached to physical merchandise leg, not service leg
        expect(leg1.amount).toBe(87.00); // 72.00 + 15.00 shipping
        expect(leg2.amount).toBe(30.00); // 30.00 service, no shipping added
        expect(plan.totalAmount).toBe(117.00);
    });

    // ── INV-03 & INV-04: Partial Payment Handling & Entitlement Gating ───────
    it('INV-03 & INV-04: transitions to partially_paid when one leg succeeds and blocks entitlements', () => {
        const legs: PaymentLeg[] = [
            {
                id: 'leg_fw_101',
                invoiceId: 'inv_partial_test',
                legIndex: 1,
                legType: 'merchandise',
                provider: 'fourthwall',
                amount: 49.99,
                currency: 'USD',
                status: 'pending',
                providerReference: 'fw_order_101',
                sessionUrl: 'https://checkout.fourthwall.com/c/101',
                items: [],
                paidAt: null,
            },
            {
                id: 'leg_kashier_102',
                invoiceId: 'inv_partial_test',
                legIndex: 2,
                legType: 'service',
                provider: 'kashier',
                amount: 349.99,
                currency: 'USD',
                status: 'pending',
                providerReference: 'kashier_tx_102',
                sessionUrl: 'https://checkouts.kashier.io/p/102',
                items: [],
                paidAt: null,
            },
        ];

        // Initially both pending
        expect(evaluateConsolidatedInvoiceStatus(legs)).toBe('pending');

        // Leg 1 (Fourthwall book) succeeds
        const verdict1 = processLegVerdict(legs, {
            legId: 'leg_fw_101',
            status: 'succeeded',
            paidAmount: 49.99,
        });

        expect(verdict1.consolidatedStatus).toBe('partially_paid');
        expect(verdict1.canGrantEntitlement).toBe(false); // MUST NOT unlock digital download!

        const leg1After = verdict1.updatedLegs.find((l) => l.id === 'leg_fw_101');
        const leg2After = verdict1.updatedLegs.find((l) => l.id === 'leg_kashier_102');
        expect(leg1After?.status).toBe('succeeded');
        expect(leg1After?.paidAt).not.toBeNull();
        expect(leg2After?.status).toBe('pending');
    });

    // ── INV-05: Full Settlement Required for 'paid' ─────────────────────────
    it('INV-05: transitions to paid and unlocks entitlements ONLY when all legs succeed', () => {
        const legs: PaymentLeg[] = [
            {
                id: 'leg_fw_101',
                invoiceId: 'inv_complete_test',
                legIndex: 1,
                legType: 'merchandise',
                provider: 'fourthwall',
                amount: 49.99,
                currency: 'USD',
                status: 'succeeded',
                providerReference: 'fw_order_101',
                sessionUrl: null,
                items: [],
                paidAt: '2026-10-19T02:00:00Z',
            },
            {
                id: 'leg_kashier_102',
                invoiceId: 'inv_complete_test',
                legIndex: 2,
                legType: 'service',
                provider: 'kashier',
                amount: 349.99,
                currency: 'USD',
                status: 'pending',
                providerReference: 'kashier_tx_102',
                sessionUrl: null,
                items: [],
                paidAt: null,
            },
        ];

        // Leg 2 (Kashier coaching) now settles
        const verdict2 = processLegVerdict(legs, {
            legId: 'leg_kashier_102',
            status: 'succeeded',
            paidAmount: 349.99,
        });

        expect(verdict2.consolidatedStatus).toBe('paid');
        expect(verdict2.canGrantEntitlement).toBe(true); // NOW and ONLY NOW can entitlement be granted!
    });

    // ── INV-07: Egypt Local Flow Parity ─────────────────────────────────────
    it('INV-07: generates a single consolidated leg in EGP via Kashier for Egypt orders', () => {
        const lines = [
            {
                kind: 'book',
                tierId: 'bundle',
                quantity: 1,
                unitAmount: 749,
                amount: 749,
                shippable: true,
            },
            {
                kind: 'service',
                tierId: 'coaching_plus',
                quantity: 1,
                unitAmount: 500,
                amount: 500,
                shippable: false,
            },
        ];

        const plan = planPaymentLegs({
            invoiceId: 'inv_eg_001',
            region: 'EGYPT',
            currency: 'EGP',
            lines,
            shippingCost: 50,
            discount: 0,
        });

        expect(plan.isMultiLeg).toBe(false);
        expect(plan.legs).toHaveLength(1);
        expect(plan.legs[0].provider).toBe('kashier');
        expect(plan.legs[0].currency).toBe('EGP');
        expect(plan.legs[0].amount).toBe(1299); // 749 + 500 + 50 shipping
        expect(plan.totalAmount).toBe(1299);
    });

    // ── INV-08: All-Leg Failure ─────────────────────────────────────────────
    it('INV-08: transitions to failed when all legs fail', () => {
        const legs: PaymentLeg[] = [
            {
                id: 'leg_1',
                invoiceId: 'inv_fail_test',
                legIndex: 1,
                legType: 'merchandise',
                provider: 'fourthwall',
                amount: 49.99,
                currency: 'USD',
                status: 'failed',
                providerReference: null,
                sessionUrl: null,
                items: [],
                paidAt: null,
            },
            {
                id: 'leg_2',
                invoiceId: 'inv_fail_test',
                legIndex: 2,
                legType: 'service',
                provider: 'kashier',
                amount: 349.99,
                currency: 'USD',
                status: 'failed',
                providerReference: null,
                sessionUrl: null,
                items: [],
                paidAt: null,
            },
        ];

        expect(evaluateConsolidatedInvoiceStatus(legs)).toBe('failed');
    });
});
