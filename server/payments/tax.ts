/**
 * Tax policy — decision surface, deliberately zero until the rate is approved.
 *
 * The invoice line schema already carries `tax_amount` and `line_type='tax'`, and
 * the quote already exposes `tax` in its totals, but nothing computes it: tax is
 * hardcoded to 0 and `total` is the sum of the lines. That is correct for a
 * business with no registered tax, and wrong the moment a rate exists.
 *
 * This module is the single place where the decision lands. It is pure, it is
 * tested, and the pending policy is an explicit zero — so wiring it in changes
 * nothing today while making the future change a one-line constant instead of a
 * money-math refactor.
 *
 * What is still an owner/legal decision (cannot be inferred from code):
 *   1. the rate(s) and whether EG and GLOBAL differ,
 *   2. whether prices are advertised tax-inclusive or tax-exclusive,
 *   3. whether shipping is taxable,
 *   4. the registration/threshold obligations that come with charging it.
 */

export type TaxRegion = 'EGYPT' | 'GLOBAL';

export interface TaxPolicy {
    /** Stable identifier; part of the cart hash so a rate change invalidates old quotes. */
    version: string;
    /** 0.14 = 14%. Must satisfy 0 <= rate < 1. */
    rate: number;
    /**
     * `exclusive`: the configured price is net, tax is added on top (total grows).
     * `inclusive`: the configured price already contains tax; the tax portion is
     * extracted from it and `total` must not change.
     */
    mode: 'exclusive' | 'inclusive';
    /** Whether the shipping line is part of the taxable base. */
    appliesToShipping: boolean;
}

/**
 * The policy in force. Zero rate, exclusive mode: `total` is untouched and every
 * line keeps `tax_amount = 0`, which is exactly the pre-tax behaviour.
 */
export const PENDING_TAX_POLICY: TaxPolicy = {
    version: 'pending-2026-11',
    rate: 0,
    mode: 'exclusive',
    appliesToShipping: false,
};

export const ZERO_TAX_POLICY = PENDING_TAX_POLICY;

export class TaxPolicyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TaxPolicyError';
    }
}

/** Reject a policy that would produce nonsense money before it reaches a quote. */
export function validateTaxPolicy(policy: TaxPolicy): TaxPolicy {
    if (!policy.version || typeof policy.version !== 'string') {
        throw new TaxPolicyError('Tax policy requires a version string.');
    }
    if (typeof policy.rate !== 'number' || !Number.isFinite(policy.rate)) {
        throw new TaxPolicyError('Tax rate must be a finite number.');
    }
    if (policy.rate < 0) {
        throw new TaxPolicyError('Tax rate cannot be negative.');
    }
    if (policy.rate >= 1) {
        throw new TaxPolicyError('Tax rate must be less than 1 (100%).');
    }
    if (policy.mode !== 'exclusive' && policy.mode !== 'inclusive') {
        throw new TaxPolicyError(`Unknown tax mode "${String(policy.mode)}".`);
    }
    return policy;
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export function isZeroRate(policy: TaxPolicy): boolean {
    return policy.rate === 0;
}

/**
 * Tax for a net base.
 *
 * Exclusive: tax = base * rate, added on top of the base.
 * Inclusive: the base already contains tax, so tax = base - base / (1 + rate).
 */
export function computeTaxAmount(netBase: number, policy: TaxPolicy): number {
    validateTaxPolicy(policy);
    if (!Number.isFinite(netBase) || netBase <= 0 || policy.rate === 0) return 0;

    return policy.mode === 'exclusive'
        ? round2(netBase * policy.rate)
        : round2(netBase - netBase / (1 + policy.rate));
}

/** The portion of the cart that a policy applies tax to. */
export function computeTaxableBase(input: {
    subtotal: number;
    discount: number;
    shipping: number;
    policy: TaxPolicy;
}): number {
    const goods = input.subtotal - input.discount;
    const base = input.policy.appliesToShipping ? goods + input.shipping : goods;
    return base > 0 ? round2(base) : 0;
}

export interface AllocatableLine {
    line_total: number;
}

/**
 * Split `taxAmount` across the taxable lines proportionally to their net total.
 *
 * Rounding never loses or invents a cent: the residual goes to the largest line,
 * and `Σ allocations === taxAmount` is asserted before returning. Shipping is
 * excluded unless the policy says otherwise, mirroring `computeTaxableBase`.
 */
export function allocateTax(
    lines: AllocatableLine[],
    taxAmount: number,
    options: { appliesToShipping: boolean }
): number[] {
    const allocations = lines.map(() => 0);
    if (taxAmount <= 0 || lines.length === 0) return allocations;

    const eligible = lines
        .map((line, index) => ({ index, net: line.line_total }))
        .filter((entry) => entry.net > 0);

    if (eligible.length === 0) return allocations;

    const base = eligible.reduce((sum, entry) => sum + entry.net, 0);
    let assigned = 0;

    for (const entry of eligible) {
        const share = round2((taxAmount * entry.net) / base);
        allocations[entry.index] = share;
        assigned = round2(assigned + share);
    }

    const residual = round2(taxAmount - assigned);
    if (residual !== 0) {
        const largest = eligible.reduce((a, b) => (b.net > a.net ? b : a));
        allocations[largest.index] = round2(allocations[largest.index] + residual);
    }

    const total = round2(allocations.reduce((sum, value) => sum + value, 0));
    if (total !== taxAmount) {
        throw new TaxPolicyError(`Tax allocation mismatch: allocated ${total} of ${taxAmount}.`);
    }

    return allocations;
}
