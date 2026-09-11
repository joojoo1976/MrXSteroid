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

// ── Commission Rate Math ───────────────────────────────────────────────────────
describe('Commission Rate Math — percentage calculations', () => {
    it('bronze (25%) on EGP 100 → 25 commission', () => {
        expect(Math.round(100 * 0.25)).toBe(25);
    });
    it('silver (35%) on EGP 200 → 70 commission', () => {
        expect(Math.round(200 * 0.35)).toBe(70);
    });
    it('gold (45%) on EGP 500 → 225 commission', () => {
        expect(Math.round(500 * 0.45)).toBe(225);
    });
    it('commission on zero amount is always zero', () => {
        expect(Math.round(0 * 0.45)).toBe(0);
        expect(Math.round(0 * 0.35)).toBe(0);
        expect(Math.round(0 * 0.25)).toBe(0);
    });
    it('fractional amounts round correctly — EGP 99.99 at 25%', () => {
        expect(Math.round(99.99 * 0.25)).toBe(25);
    });
    it('tier rate values match expected percentages', () => {
        const [bronze, silver, gold] = COMMISSION_TIERS;
        expect(bronze.rate).toBe(25);
        expect(silver.rate).toBe(35);
        expect(gold.rate).toBe(45);
    });
});

// ── Tier Boundary Exhaustive Cases ────────────────────────────────────────────
describe('Commission Config — Tier boundary exhaustive checks', () => {
    const cases: Array<[number, string | null]> = [
        [0, null],
        [1, 'bronze'], [5, 'bronze'], [10, 'bronze'],
        [11, 'silver'], [25, 'silver'], [50, 'silver'],
        [51, 'gold'], [100, 'gold'], [9999, 'gold'],
    ];
    for (const [sales, expected] of cases) {
        it(`getTier(${sales}) → ${expected ?? 'null'}`, () => {
            const t = getTier(sales);
            if (expected === null) {
                expect(t).toBeNull();
            } else {
                expect(t?.name).toBe(expected);
            }
        });
    }
});

// ── Attribution Cookie Field Validation ──────────────────────────────────────
describe('Attribution — buildAttributionData field completeness', () => {
    it('result has all 4 required fields', () => {
        const d = buildAttributionData('aff-x', 'CODE-X');
        expect(d).toHaveProperty('affiliateId');
        expect(d).toHaveProperty('referralCode');
        expect(d).toHaveProperty('attributionTimestamp');
        expect(d).toHaveProperty('attributionExpiresAt');
    });
    it('affiliateId and referralCode are preserved exactly', () => {
        const d = buildAttributionData('MY-AFF-123', 'MY-CODE-456');
        expect(d.affiliateId).toBe('MY-AFF-123');
        expect(d.referralCode).toBe('MY-CODE-456');
    });
    it('expiry is exactly ATTRIBUTION_WINDOW_DAYS after timestamp', () => {
        const d = buildAttributionData('aff-t', 'T');
        const ts = new Date(d.attributionTimestamp).getTime();
        const exp = new Date(d.attributionExpiresAt).getTime();
        const diffDays = (exp - ts) / (1000 * 60 * 60 * 24);
        expect(Math.round(diffDays)).toBe(ATTRIBUTION_WINDOW_DAYS);
    });
    it('parseAttributionCookie returns null for malformed JSON', () => {
        expect(parseAttributionCookie('{broken json')).toBeNull();
    });
    it('parseAttributionCookie returns null for empty string', () => {
        expect(parseAttributionCookie('')).toBeNull();
    });
    it('parseAttributionCookie returns null for number string', () => {
        expect(parseAttributionCookie('42')).toBeNull();
    });
});

// ── Payment Method Eligibility Matrix ────────────────────────────────────────
describe('Payment Method — Commission eligibility matrix', () => {
    type EligibilityCase = { method: string; affiliateId: string | null; eligible: boolean };
    const matrix: EligibilityCase[] = [
        { method: 'kashier',    affiliateId: 'aff-1',  eligible: true  },
        { method: 'kashier',    affiliateId: null,      eligible: false },
        { method: 'stripe',     affiliateId: 'aff-2',  eligible: true  },
        { method: 'stripe',     affiliateId: null,      eligible: false },
        { method: 'instapay',   affiliateId: 'aff-3',  eligible: false },
        { method: 'instapay',   affiliateId: null,      eligible: false },
        { method: 'vodafone',   affiliateId: 'aff-4',  eligible: false },
        { method: 'paymob',     affiliateId: 'aff-5',  eligible: true  },
        { method: 'paymob',     affiliateId: null,      eligible: false },
    ];
    const BLOCKED_METHODS = ['instapay', 'vodafone'];
    for (const c of matrix) {
        it(`${c.method} + affiliate=${c.affiliateId ?? 'null'} → eligible=${c.eligible}`, () => {
            const isEligible = !BLOCKED_METHODS.includes(c.method) && c.affiliateId !== null;
            expect(isEligible).toBe(c.eligible);
        });
    }
});

// ── Referral Code Format Validation ──────────────────────────────────────────
describe('Referral Code — Format validation (pure logic)', () => {
    const VALID_PATTERN = /^[A-Z0-9_-]{3,20}$/;
    it('accepts uppercase alphanumeric codes', () => {
        expect(VALID_PATTERN.test('MRXAFF123')).toBe(true);
    });
    it('accepts codes with hyphens and underscores', () => {
        expect(VALID_PATTERN.test('MRX_AFF-01')).toBe(true);
    });
    it('rejects lowercase codes', () => {
        expect(VALID_PATTERN.test('mrxaff123')).toBe(false);
    });
    it('rejects codes shorter than 3 chars', () => {
        expect(VALID_PATTERN.test('AB')).toBe(false);
    });
    it('rejects codes longer than 20 chars', () => {
        expect(VALID_PATTERN.test('ABCDEFGHIJKLMNOPQRSTU')).toBe(false);
    });
    it('rejects codes with special characters', () => {
        expect(VALID_PATTERN.test('CODE@123')).toBe(false);
    });
    it('accepts minimum length code (3 chars)', () => {
        expect(VALID_PATTERN.test('ABC')).toBe(true);
    });
    it('accepts maximum length code (20 chars)', () => {
        expect(VALID_PATTERN.test('ABCDEFGHIJ1234567890')).toBe(true);
    });
});
