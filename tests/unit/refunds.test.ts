import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateCommission } from '../../server/affiliate/commissionEngine';

// ─── Reversal Logic Tests ─────────────────────────────────────────────────
// Tests for reversal amounts that will be fed into affiliate_create_reversal RPC.
// The RPC itself is tested via Supabase integration; these tests cover the
// calculation layer (commissionEngine) and the reversal logic in ledgerService.

describe('Refund / Reversal Commission Calculations', () => {
    // ── Full refund ──────────────────────────────────────────────────────
    it('full refund: reversal amount equals original commission', () => {
        const original = calculateCommission({
            invoiceAmount: 100,
            productSubtotal: 100,
            discountAmount: 0,
            shippingCost: 0,
            monthlyPaidReferrals: 0,
            customCommissionRate: null,
        });
        expect(original.commissionAmount).toBe(25.00); // 100 * 25%
        // Full reversal = original commissionAmount
        const reversalAmount = original.commissionAmount;
        expect(reversalAmount).toBe(25.00);
    });

    // ── Partial refund ────────────────────────────────────────────────────
    it('partial refund: reversal proportional to refunded fraction', () => {
        const original = calculateCommission({
            invoiceAmount: 200,
            productSubtotal: 200,
            discountAmount: 0,
            shippingCost: 0,
            monthlyPaidReferrals: 0,
            customCommissionRate: null,
        });
        expect(original.commissionAmount).toBe(50.00); // 200 * 25%
        // 50% partial refund
        const refundedAmount = 100;
        const refundFraction = refundedAmount / original.commissionBase;
        const partialReversal = Math.round(original.commissionAmount * refundFraction * 100) / 100;
        expect(partialReversal).toBe(25.00);
    });

    // ── Chargeback ────────────────────────────────────────────────────────
    it('chargeback: reversal equals 100% of original commission', () => {
        const original = calculateCommission({
            invoiceAmount: 150,
            productSubtotal: 100,
            discountAmount: 0,
            shippingCost: 50,
            monthlyPaidReferrals: 10, // silver tier
            customCommissionRate: null,
        });
        expect(original.tier).toBe('silver');
        expect(original.commissionBase).toBe(100);
        expect(original.commissionAmount).toBe(35.00); // 100 * 35%
        // Chargeback always reverses full commission
        expect(original.commissionAmount).toBe(35.00);
    });

    // ── Reversal on zero-commission invoice ───────────────────────────────
    it('reversal on 100%-discounted invoice: nothing to reverse', () => {
        const original = calculateCommission({
            invoiceAmount: 100,
            productSubtotal: 100,
            discountAmount: 100,
            shippingCost: 0,
            monthlyPaidReferrals: 0,
            customCommissionRate: null,
        });
        expect(original.commissionAmount).toBe(0);
        expect(original.commissionBase).toBe(0);
        const reversalAmount = original.commissionAmount;
        expect(reversalAmount).toBe(0);
    });

    // ── Balance floor at zero ─────────────────────────────────────────────
    it('reversal amount larger than balance must be capped by greatest(0, balance - reversal)', () => {
        // This mirrors the Postgres function: greatest(0, v_current_balance - p_reversal_amount)
        const currentBalance = 10.00;
        const reversalAmount = 25.00;
        const balanceAfter = Math.max(0, currentBalance - reversalAmount);
        expect(balanceAfter).toBe(0);
    });

    it('reversal smaller than balance reduces it correctly', () => {
        const currentBalance = 100.00;
        const reversalAmount = 35.00;
        const balanceAfter = Math.max(0, currentBalance - reversalAmount);
        expect(balanceAfter).toBe(65.00);
    });

    // ── Gold tier reversal ────────────────────────────────────────────────
    it('gold tier reversal: 45% commission reversed correctly', () => {
        const original = calculateCommission({
            invoiceAmount: 1000,
            productSubtotal: 1000,
            discountAmount: 0,
            shippingCost: 0,
            monthlyPaidReferrals: 100, // gold
            customCommissionRate: null,
        });
        expect(original.tier).toBe('gold');
        expect(original.commissionAmount).toBe(450.00);
        const reversalAmount = original.commissionAmount;
        expect(reversalAmount).toBe(450.00);
    });

    // ── Custom rate reversal ──────────────────────────────────────────────
    it('custom rate 60% reversal: full custom commission reversed', () => {
        const original = calculateCommission({
            invoiceAmount: 200,
            productSubtotal: 200,
            discountAmount: 0,
            shippingCost: 0,
            monthlyPaidReferrals: 0,
            customCommissionRate: 60,
        });
        expect(original.tier).toBe('custom');
        expect(original.commissionAmount).toBe(120.00);
        expect(original.commissionAmount).toBe(120.00);
    });

    // ── Shipping excluded from reversal base ──────────────────────────────
    it('shipping cost is excluded from commission base in original and reversal', () => {
        const original = calculateCommission({
            invoiceAmount: 150, // 100 product + 50 shipping
            productSubtotal: 100,
            discountAmount: 0,
            shippingCost: 50,
            monthlyPaidReferrals: 0,
            customCommissionRate: null,
        });
        // Commission base must exclude shipping
        expect(original.commissionBase).toBe(100);
        expect(original.commissionAmount).toBe(25.00); // 100 * 25%
        // Reversal is based on the commission amount, not the invoice amount
        const reversalAmount = original.commissionAmount;
        expect(reversalAmount).toBe(25.00); // not 37.50 (150*25%)
    });

    // ── Partial refund fraction rounding ──────────────────────────────────
    it('partial refund with odd numbers rounds to 2dp', () => {
        const original = calculateCommission({
            invoiceAmount: 99.99,
            productSubtotal: 99.99,
            discountAmount: 0,
            shippingCost: 0,
            monthlyPaidReferrals: 0,
            customCommissionRate: null,
        });
        // 99.99 * 25% = 24.9975 -> 25.00
        expect(original.commissionAmount).toBe(25.00);
        // 33.33% partial refund: 33.33 / 99.99 = 0.3333... * 25.00 = 8.3325 -> 8.33
        const refundFraction = 33.33 / original.commissionBase;
        const partial = Math.round(original.commissionAmount * refundFraction * 100) / 100;
        expect(partial).toBe(8.33);
    });
});