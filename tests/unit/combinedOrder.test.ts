/**
 * tests/unit/combinedOrder.test.ts
 *
 * Authoritative multi-line order resolution. Every expectation is derived from
 * the canonical pricing config (DEFAULT_PRICING) so these tests also fail if the
 * business prices ever drift.
 *
 * Canonical EGP prices used below:
 *   digital 499 · bundle 749 · coaching 849 · shipping 199
 *   coaching add-on 9,999 (applies once to any `_plus` tier)
 */
import { describe, it, expect } from 'vitest';
import { computeCombinedOrder, CombinedOrderValidationError } from '../../server/payments/combinedOrder';
import { DEFAULT_PRICING, basePricing } from '../../server/payments/pricing';

const egp = (lines: Parameters<typeof computeCombinedOrder>[1]['lines'], extra: Partial<Parameters<typeof computeCombinedOrder>[1]> = {}) =>
    computeCombinedOrder(DEFAULT_PRICING, {
        lines,
        region: 'EGYPT',
        currency: 'EGP',
        ...extra,
    });

const DIGITAL = 499;
const BUNDLE = 749;
const COACHING = 849;
const SHIPPING = 199;
const ADDON = 9999;

describe('computeCombinedOrder — single line (parity with single-tier checkout)', () => {
    it('matches computeAmount for one plain product with no shipping', () => {
        // `pdf` is a digital-only tier, so it never pays shipping.
        const r = egp([{ kind: 'product', tierId: 'pdf' }]);
        expect(r.subtotal).toBe(DIGITAL);
        expect(r.shippingCost).toBe(0);
        expect(r.discount).toBe(0);
        expect(r.total).toBe(DIGITAL);
        expect(r.requiresShipping).toBe(false);
    });

    it('adds shipping once for a physical product', () => {
        const r = egp([{ kind: 'product', tierId: 'bundle' }]);
        expect(r.subtotal).toBe(BUNDLE);
        expect(r.shippingCost).toBe(SHIPPING);
        expect(r.total).toBe(BUNDLE + SHIPPING);
    });
});

describe('computeCombinedOrder — multiple products', () => {
    it('sums two distinct products and charges shipping exactly once', () => {
        const r = egp([
            { kind: 'product', tierId: 'bundle' },
            { kind: 'product', tierId: 'coaching' },
        ]);
        expect(r.lines).toHaveLength(2);
        expect(r.subtotal).toBe(BUNDLE + COACHING);
        expect(r.shippingCost).toBe(SHIPPING);
        expect(r.total).toBe(BUNDLE + COACHING + SHIPPING);
    });

    it('honours quantity on a line and multiplies the canonical unit price', () => {
        const r = egp([{ kind: 'product', tierId: 'bundle', quantity: 3 }]);
        expect(r.lines[0].quantity).toBe(3);
        expect(r.lines[0].unitAmount).toBe(BUNDLE);
        expect(r.subtotal).toBe(BUNDLE * 3);
        expect(r.total).toBe(BUNDLE * 3 + SHIPPING);
    });

    it('normalises a zero/negative/fractional quantity to at least 1', () => {
        expect(egp([{ kind: 'product', tierId: 'bundle', quantity: 0 }]).lines[0].quantity).toBe(1);
        expect(egp([{ kind: 'product', tierId: 'bundle', quantity: -5 }]).lines[0].quantity).toBe(1);
        expect(egp([{ kind: 'product', tierId: 'bundle', quantity: 2.9 }]).lines[0].quantity).toBe(2);
    });
});

describe('computeCombinedOrder — product + add-on', () => {
    it('charges the coaching add-on ONCE on top of a digital product, without re-charging the base', () => {
        const r = egp([
            { kind: 'product', tierId: 'digital' },
            { kind: 'addon', tierId: 'digital_plus' },
        ]);
        // The add-on line prices the ADD-ON ONLY (9,999). The 499 EGP digital
        // product is charged exactly once, by its own line.
        expect(r.lines[1].amount).toBe(ADDON);
        expect(r.subtotal).toBe(DIGITAL + ADDON);
        expect(r.shippingCost).toBe(0);
        expect(r.total).toBe(DIGITAL + ADDON);
    });

    it('charges the add-on once, not per unit, for a physical base', () => {
        const r = egp([{ kind: 'product', tierId: 'bundle_plus', quantity: 2 }]);
        // base 749 × 2 + add-on 9,999 charged once
        expect(r.subtotal).toBe(BUNDLE * 2 + ADDON);
        expect(r.total).toBe(BUNDLE * 2 + ADDON + SHIPPING);
    });

    it('refuses an add-on quantity above 1 instead of charging it ambiguously', () => {
        expect(() => egp([
            { kind: 'product', tierId: 'digital' },
            { kind: 'addon', tierId: 'digital_plus', quantity: 2 },
        ])).toThrow(/charged once per order/);
    });

    it('refuses a basket that contains only an add-on', () => {
        expect(() => egp([{ kind: 'addon', tierId: 'digital_plus' }]))
            .toThrow(/at least one product line/);
    });

    it('refuses an add-on with no configured price rather than charging nothing', () => {
        const cfg = basePricing();
        // `pdf` is not a `*_plus` tier, so it has no add-on entry at all.
        expect(() => computeCombinedOrder(cfg, {
            lines: [
                { kind: 'product', tierId: 'digital' },
                { kind: 'addon', tierId: 'pdf' },
            ],
            region: 'EGYPT',
            currency: 'EGP',
        })).toThrow(/No configured add-on price/);
    });
});

describe('computeCombinedOrder — product + shipping', () => {
    it('applies the flat 199 EGP rate once regardless of how many physical lines exist', () => {
        const r = egp([
            { kind: 'product', tierId: 'bundle' },
            { kind: 'product', tierId: 'paperback' },
            { kind: 'product', tierId: 'coaching' },
        ]);
        expect(r.shippingCost).toBe(SHIPPING);
        expect(r.total).toBe(BUNDLE + BUNDLE + COACHING + SHIPPING);
    });

    it('charges shipping when a digital line is bundled with a physical line', () => {
        const r = egp([
            { kind: 'product', tierId: 'pdf' },
            { kind: 'product', tierId: 'bundle' },
        ]);
        expect(r.requiresShipping).toBe(true);
        expect(r.shippingCost).toBe(SHIPPING);
    });
});

describe('computeCombinedOrder — product + add-on + shipping', () => {
    it('resolves the full Egypt combined basket', () => {
        const r = egp([
            { kind: 'product', tierId: 'bundle' },
            { kind: 'addon', tierId: 'bundle_plus' },
        ]);
        expect(r.subtotal).toBe(BUNDLE + ADDON);
        expect(r.shippingCost).toBe(SHIPPING);
        expect(r.discount).toBe(0);
        expect(r.total).toBe(BUNDLE + ADDON + SHIPPING);
    });

    it('sums the full breakdown line-by-line', () => {
        const r = egp([
            { kind: 'product', tierId: 'digital' },
            { kind: 'product', tierId: 'bundle' },
            { kind: 'addon', tierId: 'bundle_plus' },
        ]);
        const expected = DIGITAL + BUNDLE + ADDON + SHIPPING;
        expect(r.subtotal).toBe(DIGITAL + BUNDLE + ADDON);
        expect(r.total).toBe(expected);
        const lineSum = r.lines.reduce((s, l) => s + l.amount, 0);
        expect(lineSum).toBe(r.subtotal);
        expect(r.subtotal + r.shippingCost - r.discount).toBe(r.total);
    });
});

describe('computeCombinedOrder — discount', () => {
    it('applies the fixed promo once across the combined subtotal', () => {
        const r = egp(
            [
                { kind: 'product', tierId: 'bundle' },
                { kind: 'product', tierId: 'coaching' },
            ],
            { promoCode: 'STEROIDIQ' }
        );
        expect(r.discount).toBe(1);
        expect(r.total).toBe(BUNDLE + COACHING + SHIPPING - 1);
    });

    it('applies a percentage promo to the combined subtotal', () => {
        const r = egp(
            [
                { kind: 'product', tierId: 'bundle' },
                { kind: 'product', tierId: 'coaching' },
            ],
            { promoCode: 'IQ1P-ABCD' }
        );
        expect(r.discount).toBeCloseTo((BUNDLE + COACHING) * 0.01, 2);
    });

    it('ignores an unknown promo code', () => {
        expect(egp([{ kind: 'product', tierId: 'bundle' }], { promoCode: 'NOPE' }).discount).toBe(0);
    });
});

describe('computeCombinedOrder — client totals can never override authority', () => {
    it('rejects a client total that understates the authoritative amount', () => {
        const expected = () => egp(
            [{ kind: 'product', tierId: 'bundle_plus' }],
            { clientReportedTotal: 1 }
        );
        expect(expected).toThrow(CombinedOrderValidationError);
        expect(expected).toThrow(/Client-reported total does not match/);
    });

    it('rejects a client total that overstates the authoritative amount', () => {
        expect(() => egp([{ kind: 'product', tierId: 'bundle' }], { clientReportedTotal: 1 }))
            .toThrow(CombinedOrderValidationError);
    });

    it('accepts a matching client total', () => {
        const r = egp([{ kind: 'product', tierId: 'bundle' }], { clientReportedTotal: BUNDLE + SHIPPING });
        expect(r.total).toBe(BUNDLE + SHIPPING);
    });

    it('tolerates a client total within the 0.5 tolerance', () => {
        const r = egp(
            [{ kind: 'product', tierId: 'bundle' }],
            { clientReportedTotal: BUNDLE + SHIPPING + 0.4 }
        );
        expect(r.total).toBe(BUNDLE + SHIPPING);
    });

    it('rejects a client total just beyond the tolerance', () => {
        expect(() => egp(
            [{ kind: 'product', tierId: 'bundle' }],
            { clientReportedTotal: BUNDLE + SHIPPING + 0.6 }
        )).toThrow(CombinedOrderValidationError);
    });

    it('ignores a client-supplied shipping cost entirely', () => {
        // A client claiming free shipping must still be charged the canonical 199.
        const r = egp([{ kind: 'product', tierId: 'bundle' }], { legacyClientShippingCost: 0 });
        expect(r.shippingCost).toBe(SHIPPING);
        expect(r.total).toBe(BUNDLE + SHIPPING);
    });

    it('never returns a negative total even when the discount exceeds the subtotal', () => {
        const r = egp([{ kind: 'product', tierId: 'pdf' }], { promoCode: 'STEROIDIQ' });
        expect(r.total).toBeGreaterThan(0);
    });
});

describe('computeCombinedOrder — structural validation', () => {
    it('rejects an empty line list', () => {
        expect(() => egp([])).toThrow(CombinedOrderValidationError);
        expect(() => egp([])).toThrow(/at least one line/);
    });

    it('rejects a line with no tierId', () => {
        expect(() => egp([{ kind: 'product', tierId: '' as never }])).toThrow(CombinedOrderValidationError);
    });

    it('rejects an unknown line kind', () => {
        expect(() => egp([{ kind: 'coupon' as never, tierId: 'bundle' }])).toThrow(CombinedOrderValidationError);
    });

    it('rejects a line that resolves to a non-positive amount', () => {
        const cfg = { ...DEFAULT_PRICING, tiers: { ...DEFAULT_PRICING.tiers, bundle: { egp: 0 } } };
        expect(() => computeCombinedOrder(cfg, {
            lines: [{ kind: 'product', tierId: 'bundle' }],
            region: 'EGYPT',
            currency: 'EGP',
        })).toThrow(CombinedOrderValidationError);
    });

    it('rejects an unknown shipping provider rather than silently ignoring it', () => {
        expect(() => egp([{ kind: 'product', tierId: 'bundle' }], { shippingProviderId: 'bogus_carrier' }))
            .toThrow(/not available/);
    });
});

describe('computeCombinedOrder — line shape and primary tier', () => {
    it('stamps currency and shippability onto every line', () => {
        const r = egp([
            { kind: 'product', tierId: 'pdf' },
            { kind: 'product', tierId: 'bundle' },
        ]);
        expect(r.lines[0]).toMatchObject({ currency: 'EGP', shippable: false, kind: 'product' });
        expect(r.lines[1]).toMatchObject({ currency: 'EGP', shippable: true, kind: 'product' });
    });

    it('uses the first product line as the invoice tier id', () => {
        const r = egp([
            { kind: 'addon', tierId: 'digital_plus' },
            { kind: 'product', tierId: 'bundle' },
        ]);
        expect(r.primaryTierId).toBe('bundle');
    });

    it('keeps the consultation line addressable for the D6 decision', () => {
        // D6 is still OPEN, so the consultation is REFUSED rather than priced
        // from a neighbouring tier. It previously resolved to the 849 EGP
        // coaching tier, which silently charged a different product's price.
        expect(() => egp([{ kind: 'consultation', tierId: 'coaching' }]))
            .toThrow(CombinedOrderValidationError);
        expect(() => egp([{ kind: 'consultation', tierId: 'coaching' }]))
            .toThrow(/D6 is still open/);
    });
});

describe('computeCombinedOrder — USD/Global', () => {
    it('prices a Global combined order in USD without Egypt shipping', () => {
        const r = computeCombinedOrder(DEFAULT_PRICING, {
            lines: [{ kind: 'product', tierId: 'pdf' }],
            region: 'GLOBAL',
            currency: 'USD',
        });
        expect(r.currency).toBe('USD');
        expect(r.subtotal).toBe(49.99);
        expect(r.shippingCost).toBe(0);
        expect(r.total).toBe(49.99);
    });

    it('uses the approved 349.99 USD coaching add-on in a combined Global order', () => {
        const r = computeCombinedOrder(DEFAULT_PRICING, {
            lines: [
                { kind: 'product', tierId: 'pdf' },
                { kind: 'addon', tierId: 'digital_plus' },
            ],
            region: 'GLOBAL',
            currency: 'USD',
        });
        // 49.99 product + 349.99 add-on. The add-on line does not re-charge the
        // 49.99 base, which is what the previous `computeAmount` path did.
        expect(r.lines[1].amount).toBe(349.99);
        expect(r.total).toBe(49.99 + 349.99);
    });
});
