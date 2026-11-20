import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import {
    DEFAULT_PRICING,
    PRICING_VERSION,
    computeAmount,
    getAddonPrice,
    getServicePrice,
    getShippingPrice,
    getTierPrice,
} from '../../server/payments/pricing';
import {
    EGP_PRICES,
    COACHING_ADDON_EGP,
    COACHING_ADDON_USD,
    getShippingProviders,
} from '../../shared/lib/logic';
import { BASE_PRICES } from '../../features/calculator/hooks/usePricing';
import { PAYMOB_PRODUCTS } from '../../shared/lib/paymobProducts';
import { CANONICAL_PRODUCTS } from '../../server/payments/merchantResolver';
import { getKashierServicePaymentLink } from '../../server/payments/paymentLinkConfig';
import { BILLING_PLANS } from '../../features/billing/config/pricing.config';

const BASE_TIERS = ['digital', 'bundle', 'coaching'] as const;
const PLUS_TIERS = ['digital_plus', 'bundle_plus', 'coaching_plus'] as const;

describe('pricing single source of truth (Phase 2)', () => {
    it('exposes a pricing version for quote/invoice provenance', () => {
        expect(PRICING_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);
    });

    it('storefront EGP tables are derived from the canonical catalog', () => {
        for (const tier of BASE_TIERS) {
            expect(EGP_PRICES[tier], `${tier} EGP`).toBe(getTierPrice(tier, 'EGP'));
        }
        for (const tier of PLUS_TIERS) {
            expect(EGP_PRICES[tier], `${tier} EGP`).toBe(
                computeAmount(DEFAULT_PRICING, { tierId: tier, currency: 'EGP', quantity: 1 })
            );
        }
        expect(EGP_PRICES['pdf']).toBe(getTierPrice('pdf', 'EGP'));
        expect(EGP_PRICES['paperback']).toBe(getTierPrice('paperback', 'EGP'));
    });

    it('storefront USD tables are derived from the canonical catalog', () => {
        for (const tier of BASE_TIERS) {
            expect(BASE_PRICES[tier], `${tier} USD`).toBe(getTierPrice(tier, 'USD'));
        }
    });

    it('the coaching add-on constants are the canonical add-on', () => {
        expect(COACHING_ADDON_EGP).toBe(getAddonPrice('coaching_plus', 'EGP'));
        expect(COACHING_ADDON_USD).toBe(getAddonPrice('coaching_plus', 'USD'));
        for (const tier of PLUS_TIERS) {
            expect(DEFAULT_PRICING.addons[tier]?.egp).toBe(COACHING_ADDON_EGP);
            expect(DEFAULT_PRICING.addons[tier]?.usd).toBe(COACHING_ADDON_USD);
        }
    });

    it('the billing plans use canonical charge prices, not their own literals', () => {
        const byId = Object.fromEntries(BILLING_PLANS.map((plan) => [plan.id, plan]));
        for (const tier of BASE_TIERS) {
            const plan = byId[tier];
            expect(plan, `${tier} plan`).toBeDefined();
            expect(plan.prices.EGP.current, `${tier} EGP`).toBe(getTierPrice(tier, 'EGP'));
            expect(plan.prices.USD.current, `${tier} USD`).toBe(getTierPrice(tier, 'USD'));
            expect(plan.coachingAddon.EGP).toBe(COACHING_ADDON_EGP);
            expect(plan.coachingAddon.USD).toBe(COACHING_ADDON_USD);
        }
    });

    it('Paymob catalog prices are canonical and cents are derived', () => {
        const byTier = Object.fromEntries(PAYMOB_PRODUCTS.map((product) => [product.tierId, product]));
        for (const tier of BASE_TIERS) {
            expect(byTier[tier].priceEGP, `${tier} EGP`).toBe(getTierPrice(tier, 'EGP'));
            expect(byTier[tier].priceCents).toBe(Math.round(byTier[tier].priceEGP * 100));
        }
        expect(byTier['coaching_plus'].priceEGP).toBe(COACHING_ADDON_EGP);
        expect(byTier['coaching_plus'].priceCents).toBe(Math.round(COACHING_ADDON_EGP * 100));
        expect(byTier['shipping'].priceEGP).toBe(getShippingPrice('eg_standard', 'EGP'));
        expect(byTier['shipping'].priceCents).toBe(Math.round((getShippingPrice('eg_standard', 'EGP') ?? 0) * 100));
    });

    it('canonical product amounts are canonical', () => {
        expect(CANONICAL_PRODUCTS['MRX-PROTOCOL'].egyptAmount).toBe(getTierPrice('digital', 'EGP'));
        expect(CANONICAL_PRODUCTS['MRX-PROTOCOL'].globalAmount).toBe(getTierPrice('digital', 'USD'));
        expect(CANONICAL_PRODUCTS['MRX-TACTICAL'].egyptAmount).toBe(getTierPrice('bundle', 'EGP'));
        expect(CANONICAL_PRODUCTS['MRX-TACTICAL'].globalAmount).toBe(getTierPrice('bundle', 'USD'));
        expect(CANONICAL_PRODUCTS['MRX-SMART-PRO'].egyptAmount).toBe(
            computeAmount(DEFAULT_PRICING, { tierId: 'coaching_plus', currency: 'EGP', quantity: 1 })
        );
        expect(CANONICAL_PRODUCTS['MRX-SMART-PRO'].egyptBaseAmount).toBe(getTierPrice('coaching', 'EGP'));
        expect(CANONICAL_PRODUCTS['MRX-SMART-PRO'].globalAmount).toBe(getTierPrice('coaching', 'USD'));
        expect(CANONICAL_PRODUCTS['MRX-COACHING-ADDON'].globalAmount).toBe(COACHING_ADDON_USD);
        expect(CANONICAL_PRODUCTS['MRX-CONSULTATION'].globalAmount).toBe(getServicePrice('consultation', 'USD'));
    });

    it('Kashier direct-service links expose canonical amounts', () => {
        expect(getKashierServicePaymentLink('coaching_addon').amount).toBe(COACHING_ADDON_USD);
        expect(getKashierServicePaymentLink('consultation').amount).toBe(
            getServicePrice('consultation', 'USD')
        );
    });

    it('shipping displays are canonical (including the 199 EGP flat rate)', async () => {
        expect(getShippingPrice('eg_standard', 'EGP')).toBe(199);
        const egypt = await getShippingProviders('EG');
        expect(egypt.find((provider) => provider.id === 'eg_standard')?.price).toBe(199);

        const global = await getShippingProviders('US');
        for (const provider of global) {
            expect(provider.price, provider.id).toBe(getShippingPrice(provider.id, 'USD'));
        }
    });
});

describe('single-source barrier', () => {
    const ROOTS = ['features', 'legacy-pages', 'shared', 'server', 'app'];
    const ALLOWLIST = new Set(['server/payments/pricing.ts']);

    // Charge amounts that must never be restated outside the canonical catalog.
    const PRICE_LITERAL = /\b(49\.99|72\.00|82\.00|69\.99|100\.80|114\.80|29\.00|79\.00|149\.00|199\.00|499|749|849|699|949|999|1149|9,?999|349\.99|30\.00|199|10848|10748|10498|11848|11748|11498)\b/;

    // A bare 9999 can be a z-index or a tool id; require a pricing word on the
    // same line so the barrier only catches price definitions.
    const PRICE_CONTEXT = /(usd|egp|price|amount|total|addon|shipping|current|original)/i;

    const isComment = (line: string): boolean => /^\s*(\/\/|\*|\/\*)/.test(line);

    const walk = (dir: string): string[] => {
        const files: string[] = [];
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...walk(full));
                continue;
            }
            if (!/\.(ts|tsx)$/.test(entry.name)) continue;
            if (/\.test\.(ts|tsx)$/.test(entry.name) || /\.bak$/.test(entry.name)) continue;
            files.push(full);
        }
        return files;
    };

    it('no charge-price literal lives outside server/payments/pricing.ts', () => {
        const offenders: string[] = [];

        for (const root of ROOTS) {
            const dir = path.resolve(process.cwd(), root);
            if (!fs.existsSync(dir)) continue;

            for (const file of walk(dir)) {
                const relative = path.relative(process.cwd(), file).split(path.sep).join('/');
                if (ALLOWLIST.has(relative)) continue;

                const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
                lines.forEach((line, index) => {
                    if (isComment(line)) return;
                    if (PRICE_LITERAL.test(line) && PRICE_CONTEXT.test(line)) {
                        offenders.push(`${relative}:${index + 1}: ${line.trim().slice(0, 120)}`);
                    }
                });
            }
        }

        expect(offenders, `charge-price literals found outside the catalog:\n${offenders.join('\n')}`).toEqual([]);
    });

    it('the canonical catalog keeps the approved values (no silent repricing)', () => {
        expect(getTierPrice('digital', 'USD')).toBe(49.99);
        expect(getTierPrice('digital', 'EGP')).toBe(499);
        expect(getTierPrice('bundle', 'USD')).toBe(72);
        expect(getTierPrice('bundle', 'EGP')).toBe(749);
        expect(getTierPrice('coaching', 'USD')).toBe(82);
        expect(getTierPrice('coaching', 'EGP')).toBe(849);
        expect(getAddonPrice('coaching_plus', 'USD')).toBe(349.99);
        expect(getAddonPrice('coaching_plus', 'EGP')).toBe(9999);
        expect(getServicePrice('consultation', 'USD')).toBe(30);
        expect(getShippingPrice('eg_standard', 'EGP')).toBe(199);
        expect(getShippingPrice('dhl_global', 'USD')).toBe(45);
    });
});
