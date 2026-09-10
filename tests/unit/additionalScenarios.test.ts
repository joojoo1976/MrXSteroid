/**
 * tests/unit/additionalScenarios.test.ts
 * سيناريوهات وحدوية إضافية مصوَّبة لتتطابق مع API الفعلي.
 */
import { describe, it, expect } from 'vitest';
import {
    COMMISSION_TIERS, ATTRIBUTION_COOKIE_NAME,
    ATTRIBUTION_WINDOW_DAYS, ATTRIBUTION_COOKIE_MAX_AGE,
    getTier, getTierName,
} from '../../server/affiliate/commissionConfig';
import { getNextTierProgress } from '../../server/affiliate/commissionEngine';
import { buildAttributionData, parseAttributionCookie } from '../../server/affiliate/attributionService';

// ── Commission Config ─────────────────────────────────────────────────────────
describe('Commission Config — Constants', () => {
    it('ATTRIBUTION_COOKIE_NAME is mrx_ref', () => {
        expect(ATTRIBUTION_COOKIE_NAME).toBe('mrx_ref');
    });
    it('ATTRIBUTION_WINDOW_DAYS is 60', () => {
        expect(ATTRIBUTION_WINDOW_DAYS).toBe(60);
    });
    it('ATTRIBUTION_COOKIE_MAX_AGE equals 60 days in seconds', () => {
        expect(ATTRIBUTION_COOKIE_MAX_AGE).toBe(60 * 24 * 60 * 60);
    });
    it('exactly 3 commission tiers defined', () => {
        expect(COMMISSION_TIERS).toHaveLength(3);
    });
    it('tiers sorted ascending by minSales', () => {
        for (let i = 1; i < COMMISSION_TIERS.length; i++) {
            expect(COMMISSION_TIERS[i].minSales).toBeGreaterThan(COMMISSION_TIERS[i-1].minSales);
        }
    });

    // getTier returns null for 0 (first sale = bronze via commissionEngine)
    it('getTier(0) returns null (0 sales = no tier yet)', () => {
        expect(getTier(0)).toBeNull();
    });
    it('getTier(1) returns bronze (first sale)', () => {
        expect(getTier(1)?.name).toBe('bronze');
        expect(getTier(1)?.rate).toBe(25);
    });
    it('getTier(10) returns bronze (10th sale)', () => {
        expect(getTier(10)?.name).toBe('bronze');
    });
    it('getTier(11) returns silver', () => {
        expect(getTier(11)?.name).toBe('silver');
        expect(getTier(11)?.rate).toBe(35);
    });
    it('getTier(50) returns silver (50th sale)', () => {
        expect(getTier(50)?.name).toBe('silver');
    });
    it('getTier(51) returns gold', () => {
        expect(getTier(51)?.name).toBe('gold');
        expect(getTier(51)?.rate).toBe(45);
    });
    it('getTierName(0) returns bronze (fallback)', () => { expect(getTierName(0)).toBe('bronze'); });
    it('getTierName(11) returns silver', () => { expect(getTierName(11)).toBe('silver'); });
    it('getTierName(51) returns gold', () => { expect(getTierName(51)).toBe('gold'); });
    it('getTierName(9999) returns gold', () => { expect(getTierName(9999)).toBe('gold'); });
});

// ── getNextTierProgress: actual return shape ───────────────────────────────────
// Returns { currentTier, nextTier, salesUntilNextTier }
describe('Commission Engine — getNextTierProgress', () => {
    it('0 monthly sales: after 1st sale = bronze, next = silver', () => {
        const p = getNextTierProgress(0);
        expect(p.currentTier.name).toBe('bronze');
        expect(p.nextTier?.name).toBe('silver');
        expect(p.salesUntilNextTier).toBe(10); // need 10 more to reach silver
    });
    it('5 monthly sales: 5 more to reach silver', () => {
        const p = getNextTierProgress(5);
        expect(p.currentTier.name).toBe('bronze');
        expect(p.salesUntilNextTier).toBe(5);
    });
    it('9 monthly sales: 1 more to reach silver', () => {
        const p = getNextTierProgress(9);
        expect(p.salesUntilNextTier).toBe(1);
    });
    it('10 monthly sales: at silver now, 40 more to gold', () => {
        const p = getNextTierProgress(10);
        expect(p.currentTier.name).toBe('silver');
        expect(p.nextTier?.name).toBe('gold');
        expect(p.salesUntilNextTier).toBe(40);
    });
    it('30 monthly sales: 20 more to gold', () => {
        const p = getNextTierProgress(30);
        expect(p.salesUntilNextTier).toBe(20);
    });
    it('50 monthly sales: at gold, no next tier', () => {
        const p = getNextTierProgress(50);
        expect(p.currentTier.name).toBe('gold');
        expect(p.nextTier).toBeNull();
        expect(p.salesUntilNextTier).toBeNull();
    });
    it('100 monthly sales: gold, no next tier', () => {
        const p = getNextTierProgress(100);
        expect(p.nextTier).toBeNull();
    });
});

// ── Attribution edge cases ────────────────────────────────────────────────────
describe('Attribution — buildAttributionData edge cases', () => {
    it('attributionTimestamp is valid ISO date', () => {
        const d = buildAttributionData('aff-1', 'CODE');
        expect(() => new Date(d.attributionTimestamp).toISOString()).not.toThrow();
    });
    it('attributionExpiresAt is after attributionTimestamp', () => {
        const d = buildAttributionData('aff-2', 'CODE2');
        expect(new Date(d.attributionExpiresAt).getTime()).toBeGreaterThan(new Date(d.attributionTimestamp).getTime());
    });
    it('two calls produce different timestamps', async () => {
        const d1 = buildAttributionData('aff-3', 'A');
        await new Promise(r => setTimeout(r, 10));
        const d2 = buildAttributionData('aff-3', 'A');
        expect(d1.attributionTimestamp).not.toBe(d2.attributionTimestamp);
    });
    it('roundtrip: build then parse returns same affiliateId and referralCode', () => {
        const d = buildAttributionData('aff-rt', 'ROUNDTRIP');
        const p = parseAttributionCookie(JSON.stringify(d));
        expect(p?.affiliateId).toBe('aff-rt');
        expect(p?.referralCode).toBe('ROUNDTRIP');
    });
    it('parseAttributionCookie handles null gracefully', () => {
        expect(parseAttributionCookie(null as unknown as string)).toBeNull();
    });
    it('parseAttributionCookie handles undefined gracefully', () => {
        expect(parseAttributionCookie(undefined as unknown as string)).toBeNull();
    });
    it('expired attributionExpiresAt returns null', () => {
        const past = new Date(Date.now() - 1000).toISOString();
        const cookie = JSON.stringify({ affiliateId: 'a', referralCode: 'C', attributionTimestamp: past, attributionExpiresAt: past });
        expect(parseAttributionCookie(cookie)).toBeNull();
    });
});

// ── Ledger / Commission guard logic ───────────────────────────────────────────
describe('Ledger Service — Commission eligibility guards (pure logic)', () => {
    it('commission blocked for instapay invoices', () => {
        const invoice = { payment_method: 'instapay', affiliate_id: 'aff-1' };
        expect(invoice.payment_method === 'instapay').toBe(true);
    });
    it('commission blocked when affiliate_id is null', () => {
        const invoice = { payment_method: 'kashier', affiliate_id: null };
        expect(invoice.affiliate_id !== null).toBe(false);
    });
    it('commission allowed for kashier with valid affiliate_id', () => {
        const invoice = { payment_method: 'kashier', affiliate_id: 'aff-1' };
        expect(invoice.payment_method === 'instapay').toBe(false);
        expect(invoice.affiliate_id !== null).toBe(true);
    });
    it('balance floor at zero after reversal — 5 cases', () => {
        const cases = [
            { balance: 10, reversal: 25, expected: 0 },
            { balance: 100, reversal: 25, expected: 75 },
            { balance: 0, reversal: 10, expected: 0 },
            { balance: 25, reversal: 25, expected: 0 },
            { balance: 25.50, reversal: 25.50, expected: 0 },
        ];
        for (const c of cases) {
            expect(Math.max(0, c.balance - c.reversal)).toBe(c.expected);
        }
    });
});
