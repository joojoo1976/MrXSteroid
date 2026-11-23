import { describe, it, expect, beforeAll } from 'vitest';
import {
    PENDING_TAX_POLICY,
    TaxPolicyError,
    allocateTax,
    computeTaxAmount,
    computeTaxableBase,
    isZeroRate,
    validateTaxPolicy,
    type TaxPolicy,
} from '../../server/payments/tax';
import { buildQuote } from '../../server/payments/quote';

/**
 * Tax is a legal/business decision that has NOT been made, so the shipped policy
 * is an explicit zero. These tests protect both sides of that:
 *   - the zero policy reproduces today's amounts to the cent (parity), and
 *   - the machinery is correct the day a rate is approved, so enabling it is a
 *     constant change rather than a money-math rewrite.
 */

const policy = (over: Partial<TaxPolicy> = {}): TaxPolicy => ({
    version: 'test-14',
    rate: 0.14,
    mode: 'exclusive',
    appliesToShipping: false,
    ...over,
});

beforeAll(() => {
    process.env.QUOTE_TOKEN_SECRET = 'tax-policy-test-secret-do-not-use-in-production';
});

describe('PENDING_TAX_POLICY', () => {
    it('is an explicit zero, not an undefined default', () => {
        expect(isZeroRate(PENDING_TAX_POLICY)).toBe(true);
        expect(computeTaxAmount(1000, PENDING_TAX_POLICY)).toBe(0);
        expect(computeTaxableBase({ subtotal: 1000, discount: 0, shipping: 199, policy: PENDING_TAX_POLICY })).toBe(1000);
    });
});

describe('validateTaxPolicy', () => {
    it('rejects negative, non-finite and >=100% rates', () => {
        expect(() => validateTaxPolicy(policy({ rate: -0.01 }))).toThrow(TaxPolicyError);
        expect(() => validateTaxPolicy(policy({ rate: Number.NaN }))).toThrow(TaxPolicyError);
        expect(() => validateTaxPolicy(policy({ rate: 1 }))).toThrow(TaxPolicyError);
    });

    it('rejects an unknown mode and a missing version', () => {
        expect(() => validateTaxPolicy(policy({ mode: 'mixed' as never }))).toThrow(TaxPolicyError);
        expect(() => validateTaxPolicy(policy({ version: '' }))).toThrow(TaxPolicyError);
    });
});

describe('computeTaxAmount', () => {
    it('adds tax on top in exclusive mode', () => {
        expect(computeTaxAmount(100, policy())).toBe(14);
        expect(computeTaxAmount(948, policy())).toBe(132.72);
    });

    it('extracts tax from the price in inclusive mode', () => {
        // 114.00 inclusive of 14% => 14.00 tax, 100.00 net.
        expect(computeTaxAmount(114, policy({ mode: 'inclusive' }))).toBe(14);
    });

    it('never returns tax for a non-positive base', () => {
        expect(computeTaxAmount(0, policy())).toBe(0);
        expect(computeTaxAmount(-50, policy())).toBe(0);
    });
});

describe('computeTaxableBase', () => {
    it('excludes shipping unless the policy says otherwise', () => {
        const base = { subtotal: 749, discount: 100, shipping: 199 };
        expect(computeTaxableBase({ ...base, policy: policy() })).toBe(649);
        expect(computeTaxableBase({ ...base, policy: policy({ appliesToShipping: true }) })).toBe(848);
    });

    it('never goes negative when a discount exceeds the subtotal', () => {
        expect(computeTaxableBase({ subtotal: 100, discount: 150, shipping: 0, policy: policy() })).toBe(0);
    });
});

describe('allocateTax', () => {
    it('splits proportionally and loses no cent', () => {
        const allocations = allocateTax([{ line_total: 749 }, { line_total: 199 }], 132.72, { appliesToShipping: false });
        expect(allocations.reduce((sum, value) => sum + value, 0)).toBe(132.72);
        expect(allocations[0]).toBeGreaterThan(allocations[1]);
    });

    it('absorbs rounding residual in the largest line', () => {
        // 3 equal lines of 33.33 and a tax of 10.00 does not divide evenly.
        const allocations = allocateTax([{ line_total: 33.33 }, { line_total: 33.33 }, { line_total: 33.33 }], 10, {
            appliesToShipping: false,
        });
        expect(allocations.reduce((sum, value) => sum + value, 0)).toBe(10);
        expect(new Set(allocations).size).toBeLessThanOrEqual(2);
    });

    it('returns zeros for a zero tax or no lines', () => {
        expect(allocateTax([{ line_total: 100 }], 0, { appliesToShipping: false })).toEqual([0]);
        expect(allocateTax([], 10, { appliesToShipping: false })).toEqual([]);
    });

    it('ignores discount lines so they never receive tax', () => {
        const allocations = allocateTax([{ line_total: 948 }, { line_total: -100 }], 14, { appliesToShipping: false });
        expect(allocations[1]).toBe(0);
        expect(allocations.reduce((sum, value) => sum + value, 0)).toBe(14);
    });
});

describe('buildQuote parity with the pending policy', () => {
    const cart = {
        region: 'EG' as const,
        lines: [{ sku: 'bundle', quantity: 1, language: 'ar' as const }],
        shippingAddress: { address: '1 Test Street', city: 'Cairo' },
    };

    it('keeps the live amounts untouched while no rate is approved', () => {
        const quote = buildQuote(cart as never);
        expect(quote.subtotal).toBe(749);
        expect(quote.shipping).toBe(199);
        expect(quote.tax).toBe(0);
        expect(quote.total).toBe(948);
        expect(quote.lines.every((line) => line.tax_amount === 0)).toBe(true);
    });

    it('charges tax and keeps Σ(line_total) == total when a policy is supplied', () => {
        const quote = buildQuote(cart as never, { taxPolicy: policy() });

        // Taxable base is the goods subtotal (749): shipping is excluded by policy.
        expect(quote.tax).toBe(104.86);
        expect(quote.total).toBe(1052.86);
        const lineSum = quote.lines.reduce((sum, line) => sum + line.line_total, 0);
        expect(Math.round(lineSum * 100) / 100).toBe(quote.total);
        const taxSum = quote.lines.reduce((sum, line) => sum + line.tax_amount, 0);
        expect(Math.round(taxSum * 100) / 100).toBe(quote.tax);
    });

    it('does not move the total for an inclusive policy', () => {
        const quote = buildQuote(cart as never, { taxPolicy: policy({ mode: 'inclusive' }) });
        expect(quote.total).toBe(948);
        expect(quote.tax).toBeGreaterThan(0);
    });

    it('makes the policy version part of the cart hash so an old token cannot be re-priced silently', () => {
        const pending = buildQuote(cart as never);
        const taxed = buildQuote(cart as never, { taxPolicy: policy() });
        expect(taxed.cart_hash).not.toBe(pending.cart_hash);
    });
});
