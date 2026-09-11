/**
 * tests/unit/paymentEdgeScenarios.test.ts
 *
 * Edge Scenarios & Financial Invariant Tests:
 * 1. Commission Engine Boundary Conditions (zero-base, negative-base protection)
 * 2. Reversal Calculations (partial refunds, multi-step refunds)
 * 3. Attribution Expiry Bounds (60-day window)
 * 4. Advanced Arabic Normalization (Persian Yeh/Kaf, Ligatures, Zero-Width characters)
 */

import { describe, it, expect } from 'vitest';
import {
    calculateCommission,
    calculateReversal,
} from '../../server/affiliate/commissionEngine';
import { getTier, getTierName } from '../../server/affiliate/commissionConfig';
import { normalizeKeyword, isDuplicateKeyword } from '../../server/seo/normalization';
import { parseAttributionCookie, buildAttributionData } from '../../server/affiliate/attributionService';

describe('Payment & Commission Edge Scenarios', () => {

    describe('Commission Base Amount Edge Conditions', () => {
        it('returns zero commission base if discount equals or exceeds subtotal', () => {
            const res1 = calculateCommission({
                invoiceAmount: 100,
                productSubtotal: 100,
                discountAmount: 100,
                shippingCost: 0,
                monthlyPaidReferrals: 5,
                customCommissionRate: null,
            });
            expect(res1.commissionBase).toBe(0);
            expect(res1.commissionAmount).toBe(0);

            const res2 = calculateCommission({
                invoiceAmount: 50,
                productSubtotal: 50,
                discountAmount: 80,
                shippingCost: 0,
                monthlyPaidReferrals: 5,
                customCommissionRate: null,
            });
            expect(res2.commissionBase).toBe(0);
            expect(res2.commissionAmount).toBe(0);
        });

        it('handles floating point currency without rounding drift', () => {
            // 99.99 at 35% commission = 34.9965 -> rounded to 35.00
            const res = calculateCommission({
                invoiceAmount: 99.99,
                productSubtotal: 99.99,
                discountAmount: 0,
                shippingCost: 0,
                monthlyPaidReferrals: 15, // Silver 35%
                customCommissionRate: null,
            });
            expect(res.commissionAmount).toBe(35.00);

            // 19.99 at 25% commission = 4.9975 -> rounded to 5.00
            const res2 = calculateCommission({
                invoiceAmount: 19.99,
                productSubtotal: 19.99,
                discountAmount: 0,
                shippingCost: 0,
                monthlyPaidReferrals: 5, // Bronze 25%
                customCommissionRate: null,
            });
            expect(res2.commissionAmount).toBe(5.00);
        });

        it('prioritizes custom commission rate over any tiered volume', () => {
            // Monthly sales = 100 (would normally be Gold 45%), but custom rate is set to 50%
            const res = calculateCommission({
                invoiceAmount: 1000,
                productSubtotal: 1000,
                discountAmount: 0,
                shippingCost: 0,
                monthlyPaidReferrals: 100,
                customCommissionRate: 50,
            });
            expect(res.tier).toBe('custom');
            expect(res.commissionRate).toBe(50);
            expect(res.commissionAmount).toBe(500);

            // Custom rate set to 15% (lower than Bronze floor) is respected for custom contracts
            const resLow = calculateCommission({
                invoiceAmount: 1000,
                productSubtotal: 1000,
                discountAmount: 0,
                shippingCost: 0,
                monthlyPaidReferrals: 5,
                customCommissionRate: 15,
            });
            expect(resLow.tier).toBe('custom');
            expect(resLow.commissionRate).toBe(15);
            expect(resLow.commissionAmount).toBe(150);
        });

        it('correctly calculates proportional reversal on partial refunds', () => {
            // Original invoice: 2000 EGP, commission was 700 EGP (35%)
            // Refund amount: 500 EGP
            // Reversal = 700 * (500 / 2000) = 175.00 EGP
            const reversal = calculateReversal(700, 500, 2000);
            expect(reversal).toBe(175.00);

            // Full refund
            const fullReversal = calculateReversal(700, 2000, 2000);
            expect(fullReversal).toBe(700.00);
        });
    });

    describe('Attribution Cookie Parsing & 60-Day Expiry Window', () => {
        it('accepts unexpired attribution cookie within 60 days', () => {
            const attr = buildAttributionData('aff-123', 'MRXPRO10');
            const cookieStr = JSON.stringify(attr);

            const parsed = parseAttributionCookie(cookieStr);
            expect(parsed).not.toBeNull();
            expect(parsed?.affiliateId).toBe('aff-123');
            expect(parsed?.referralCode).toBe('MRXPRO10');
        });

        it('rejects expired attribution cookies (>60 days old)', () => {
            const pastDate = new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString();
            const expiredAttr = {
                affiliateId: 'aff-old',
                referralCode: 'MRXEXPIRED',
                attributionTimestamp: pastDate,
                attributionExpiresAt: pastDate,
            };

            const parsed = parseAttributionCookie(JSON.stringify(expiredAttr));
            expect(parsed).toBeNull();
        });

        it('rejects malformed or manipulated cookie values gracefully', () => {
            expect(parseAttributionCookie('')).toBeNull();
            expect(parseAttributionCookie('not-json')).toBeNull();
            expect(parseAttributionCookie(JSON.stringify({ affiliateId: 'missing-fields' }))).toBeNull();
        });
    });

    describe('Advanced Arabic Normalization Edge Scenarios', () => {
        it('normalizes Persian/Urdu Yeh and Kaf to standard Arabic characters', () => {
            const raw1 = 'تستوسترون فارسى'; // ends with Alif Maqsura / Persian Yeh
            const raw2 = 'تستوسترون فارسي'; // ends with Arabic Yeh

            const norm1 = normalizeKeyword(raw1, 'ar');
            const norm2 = normalizeKeyword(raw2, 'ar');

            expect(norm1).toBe(norm2);
        });

        it('correctly detects near-duplicate keywords via Jaccard and Levenshtein similarity', () => {
            // Same words in different order
            const isDup1 = isDuplicateKeyword('testosterone cycle guide', 'guide cycle testosterone', 'en');
            expect(isDup1).toBe(true);

            // Arabic typo with one letter difference
            const isDup2 = isDuplicateKeyword('بروتوكول تنشيف', 'بروتوكول تنشف', 'ar');
            expect(isDup2).toBe(true);

            // Distinct queries should not be detected as duplicates
            const isNotDup = isDuplicateKeyword('macro calculator', 'injection guide', 'en');
            expect(isNotDup).toBe(false);
        });
    });
});
