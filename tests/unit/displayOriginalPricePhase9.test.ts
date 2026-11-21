import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import {
    DEFAULT_PRICING,
    DISPLAY_ORIGINAL_PRICES,
    getAddonPrice,
    getOriginalAmount,
    getOriginalPriceLines,
    sumOriginalLineItems,
    type OriginalPriceSurface,
} from '../../server/payments/pricing';

const SURFACES: OriginalPriceSurface[] = ['storefront', 'billing'];
const CURRENCIES = ['EGP', 'USD'] as const;

describe('Phase 9 — original amount is the sum of original invoice lines', () => {
    it('every package satisfies original_amount == Σ(unit_price × qty)', () => {
        for (const surface of SURFACES) {
            for (const currency of CURRENCIES) {
                const table = DISPLAY_ORIGINAL_PRICES[surface][currency.toLowerCase() as 'egp' | 'usd'];
                for (const tierId of Object.keys(table)) {
                    const lines = getOriginalPriceLines(tierId, currency, surface);
                    const expected = sumOriginalLineItems(lines);
                    expect(getOriginalAmount(tierId, currency, surface), `${surface}/${currency}/${tierId}`)
                        .toBe(expected);
                }
            }
        }
    });

    it('derives every *_plus amount from its base list price + add-on (no aggregate literal)', () => {
        for (const currency of CURRENCIES) {
            for (const plusTier of ['digital_plus', 'bundle_plus', 'coaching_plus'] as const) {
                const baseTier = plusTier.replace('_plus', '');
                const lines = getOriginalPriceLines(plusTier, currency);
                expect(lines).toHaveLength(2);
                expect(lines[0]).toMatchObject({ source: 'product', quantity: 1 });
                expect(lines[1]).toMatchObject({
                    source: 'addon',
                    unitPrice: getAddonPrice(plusTier, currency),
                    quantity: 1,
                });
                expect(lines[0].unitPrice).toBe(
                    getOriginalAmount(baseTier, currency)
                );
            }
        }
    });

    it('fixes coaching_plus to 949 + 9,999 = 10,948 EGP', () => {
        const lines = getOriginalPriceLines('coaching_plus', 'EGP');
        expect(lines).toEqual([
            { source: 'product', unitPrice: 949, quantity: 1 },
            { source: 'addon', unitPrice: 9_999, quantity: 1 },
        ]);
        expect(getOriginalAmount('coaching_plus', 'EGP')).toBe(10_948);
        expect(DISPLAY_ORIGINAL_PRICES.storefront.egp.coaching_plus).toBe(10_948);
        expect(DISPLAY_ORIGINAL_PRICES.storefront.egp.coaching_plus).not.toBe(11_848);
    });

    it('fixes coaching_plus USD to 114.80 + 349.99 = 464.79', () => {
        expect(getOriginalAmount('coaching_plus', 'USD')).toBe(464.79);
        expect(DISPLAY_ORIGINAL_PRICES.storefront.usd.coaching_plus).toBe(464.79);
    });

    it('does not hard-code a *_plus aggregate in the pricing source', () => {
        const source = fs.readFileSync(
            path.join(process.cwd(), 'server/payments/pricing.ts'),
            'utf8'
        );
        for (const plusTier of ['digital_plus', 'bundle_plus', 'coaching_plus']) {
            expect(source).not.toMatch(new RegExp(`${plusTier}\s*:\s*\d{4,}`));
        }
        expect(source).not.toContain('11_848');
        expect(source).not.toContain('11848');
    });

    it('keeps the add-on lines identical to the canonical catalog', () => {
        for (const plusTier of ['digital_plus', 'bundle_plus', 'coaching_plus'] as const) {
            expect(getAddonPrice(plusTier, 'EGP')).toBe(DEFAULT_PRICING.addons[plusTier]?.egp);
            expect(getAddonPrice(plusTier, 'USD')).toBe(DEFAULT_PRICING.addons[plusTier]?.usd);
        }
    });
});
