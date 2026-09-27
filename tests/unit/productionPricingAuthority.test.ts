import { describe, it, expect } from 'vitest';
import { loadPricing, computeAmount, isAmountValid } from '../../server/payments/pricing';
import { EGP_PRICES, COACHING_ADDON_EGP, COACHING_ADDON_USD } from '../../shared/lib/logic';

// The exact `admin_settings` shape Production exposes to the pricing authority.
// Key names verified against server/payments/pricing.ts applyAdminOverrides:
//   tiers  -> pricing_<tier>_<cur>
//   addons -> pricing_addon_<tier>_<cur>
const PRODUCTION_ROWS = [
    { key: 'currency', value: 'EGP' },
    { key: 'pricing_digital_usd', value: '49.99' },
    { key: 'pricing_digital_egp', value: '499' },
    { key: 'pricing_bundle_usd', value: '72' },
    { key: 'pricing_bundle_egp', value: '749' },
    { key: 'pricing_coaching_usd', value: '82' },
    { key: 'pricing_coaching_egp', value: '849' },
    { key: 'pricing_coaching_plus_egp', value: '9999' },
    { key: 'pricing_addon_coaching_plus_usd', value: '349.99' },
    { key: 'pricing_tolerance', value: '0.5' },
];

const load = () => loadPricing(async () => PRODUCTION_ROWS);

describe('Production pricing authority (post owner decisions)', () => {
    describe('Owner decision 1 — Smart Pro', () => {
        it('849 EGP is the marketed bare/base tier', async () => {
            const cfg = await load();
            expect(cfg.tiers!.coaching!.egp).toBe(849);
            expect(computeAmount(cfg, { tierId: 'coaching', quantity: 1, currency: 'EGP' })).toBe(849);
            expect(EGP_PRICES['coaching']).toBe(849);
        });

        it('9,999 EGP is the coaching add-on', async () => {
            const cfg = await load();
            expect(cfg.addons!.coaching_plus!.egp).toBe(9999);
            expect(COACHING_ADDON_EGP).toBe(9999);
        });

        it('10,848 EGP is the canonical bundled price (base + add-on)', async () => {
            const cfg = await load();
            expect(computeAmount(cfg, { tierId: 'coaching_plus', quantity: 1, currency: 'EGP' })).toBe(10848);
            expect(EGP_PRICES['coaching_plus']).toBe(10848);
        });

        it('10,848 is never reinterpreted as the bare Smart Pro tier', async () => {
            const cfg = await load();
            // the bare tier stays 849; 10848 only ever arises from base + add-on
            expect(computeAmount(cfg, { tierId: 'coaching', quantity: 1, currency: 'EGP' })).toBe(849);
            expect(cfg.tiers!.coaching!.egp).not.toBe(10848);
        });

        it('storefront and server authority agree on both presentations', async () => {
            const cfg = await load();
            // base + optional coaching
            expect(computeAmount(cfg, { tierId: 'coaching', quantity: 1, currency: 'EGP' }))
                .toBe(EGP_PRICES['coaching']);
            // bundled presentation
            expect(computeAmount(cfg, { tierId: 'coaching_plus', quantity: 1, currency: 'EGP' }))
                .toBe(EGP_PRICES['coaching_plus']);
        });

        it('adds up: 849 + 9,999 = 10,848', () => {
            expect(849 + 9999).toBe(10848);
        });
    });

    describe('Owner decision 2 — USD coaching add-on', () => {
        it('consumed key is pricing_addon_coaching_plus_usd and yields 349.99', async () => {
            const cfg = await load();
            expect(cfg.addons!.coaching_plus!.usd).toBe(349.99);
            expect(COACHING_ADDON_USD).toBe(349.99);
        });

        it('the stale tier-shaped key cannot supply an add-on value', async () => {
            const cfg = await loadPricing(async () => [
                ...PRODUCTION_ROWS.filter(r => r.key !== 'pricing_addon_coaching_plus_usd'),
                { key: 'pricing_coaching_plus_usd', value: '200' },
            ]);
            // lands on an unread tier entry, so the add-on keeps its code default
            expect(cfg.tiers!.coaching_plus!.usd).toBe(200);
            expect(cfg.addons!.coaching_plus!.usd).toBe(349.99);
        });

        it('no tier-shaped key can reintroduce 200 into any add-on', async () => {
            const cfg = await load();
            for (const tier of ['coaching_plus', 'bundle_plus', 'digital_plus'] as const) {
                expect(cfg.addons![tier]!.usd).toBe(COACHING_ADDON_USD);
            }
        });

        it('coaching_plus USD total = base + add-on', async () => {
            const cfg = await load();
            expect(computeAmount(cfg, { tierId: 'coaching_plus', quantity: 1, currency: 'USD' }))
                .toBe(82 + 349.99);
        });
    });

    describe('Owner decision 3 — tolerance', () => {
        it('production tolerance is 0.5', async () => {
            expect((await load()).tolerance).toBe(0.5);
        });

        it('rejects under-reporting that the old value of 2 permitted', async () => {
            const cfg = await load();
            expect(isAmountValid(cfg, 430.49, 431.99)).toBe(false);
        });

        it('still accepts an exact match and a delta at the boundary', async () => {
            const cfg = await load();
            expect(isAmountValid(cfg, 431.99, 431.99)).toBe(true);
            expect(isAmountValid(cfg, 431.49, 431.99)).toBe(true);
        });

        it('never widens beyond 0.5', async () => {
            const cfg = await load();
            expect(cfg.tolerance).toBeLessThanOrEqual(0.5);
            expect(isAmountValid(cfg, 431.4, 431.99)).toBe(false);
        });
    });

    describe('Untouched by this change', () => {
        it('other tiers keep their production prices', async () => {
            const cfg = await load();
            expect(computeAmount(cfg, { tierId: 'digital', quantity: 1, currency: 'USD' })).toBe(49.99);
            expect(computeAmount(cfg, { tierId: 'digital', quantity: 1, currency: 'EGP' })).toBe(499);
            expect(computeAmount(cfg, { tierId: 'bundle', quantity: 1, currency: 'USD' })).toBe(72);
            expect(computeAmount(cfg, { tierId: 'bundle', quantity: 1, currency: 'EGP' })).toBe(749);
        });
    });
});
