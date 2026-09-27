/**
 * Checkout currency/region integrity.
 *
 * Live QA (2026-09-25) proved the storefront modal displayed 24,950 EGP for a
 * product advertised at 499 EGP / $49.99: `CheckoutModal` initialised its
 * region to GLOBAL regardless of the tier's selectedLocation, then passed the
 * EGP-denominated `tier.price` (499) into a USD context, where the global
 * formatter multiplied it by the 50 EGP/USD rate. The server stays canonical
 * (`computeAmount`) and silently charges its own amount, so the customer saw
 * an amount ~50x the real charge.
 *
 * These tests lock three things:
 *   1. The frontend price tables agree with the server's canonical config.
 *   2. The amount the modal displays is the one the server will accept.
 *   3. `frame-src` allows the Stripe Payment Element iframes the checkout
 *      advertises (`js.stripe.com`, `hooks.stripe.com`).
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { DEFAULT_PRICING, computeAmount, isAmountValid } from '@/server/payments/pricing';
import { EGP_PRICES, COACHING_ADDON_EGP, COACHING_ADDON_USD, resolveTierAmount } from '@/shared/lib/logic';
import { BASE_PRICES } from '@/features/calculator/hooks/usePricing';

const PLANS = ['digital', 'bundle', 'coaching'] as const;

const serverAmount = (tierId: string, currency: 'EGP' | 'USD') =>
    computeAmount(DEFAULT_PRICING, { tierId: tierId as never, currency, quantity: 1 });

const frontendEgp = (plan: string, coachingActive: boolean) =>
    (EGP_PRICES[plan] || 849) + (coachingActive ? COACHING_ADDON_EGP : 0);

const frontendUsd = (plan: string, coachingActive: boolean) =>
    (BASE_PRICES[plan] || 0) + (coachingActive ? COACHING_ADDON_USD : 0);

const tierIdFor = (plan: string, coachingActive: boolean) =>
    (coachingActive ? `${plan}_plus` : plan) as never;

describe('storefront price tables match the canonical server config', () => {
    for (const plan of PLANS) {
        for (const coachingActive of [false, true]) {
            const label = `${plan}${coachingActive ? ' + coaching' : ''}`;

            it(`${label}: EGP amount agrees with the server`, () => {
                expect(frontendEgp(plan, coachingActive)).toBe(serverAmount(tierIdFor(plan, coachingActive), 'EGP'));
            });

            it(`${label}: USD amount agrees with the server`, () => {
                expect(frontendUsd(plan, coachingActive)).toBe(serverAmount(tierIdFor(plan, coachingActive), 'USD'));
            });
        }
    }
});

describe('resolveTierAmount', () => {
    const tier = {
        price: frontendEgp('digital', false),
        egpPrice: frontendEgp('digital', false),
        usdPrice: frontendUsd('digital', false),
    };

    it('returns the EGP amount for the Egypt region', () => {
        expect(resolveTierAmount(tier, true)).toBe(499);
    });

    it('returns the USD amount for the international region', () => {
        expect(resolveTierAmount(tier, false)).toBe(49.99);
    });

    it('never converts the EGP figure into a global amount (24950 regression)', () => {
        const global = resolveTierAmount(tier, false);
        expect(global).not.toBe(24950);
        expect(global).not.toBe(tier.egpPrice);
    });

    it('falls back to tier.price when the tier carries no per-currency amounts', () => {
        expect(resolveTierAmount({ price: 499 }, true)).toBe(499);
        expect(resolveTierAmount({ price: 499 }, false)).toBe(499);
    });

    it('produces an amount the server accepts as valid', () => {
        for (const plan of PLANS) {
            for (const coachingActive of [false, true]) {
                const id = tierIdFor(plan, coachingActive);
                const t = {
                    price: frontendEgp(plan, coachingActive),
                    egpPrice: frontendEgp(plan, coachingActive),
                    usdPrice: frontendUsd(plan, coachingActive),
                };
                expect(isAmountValid(DEFAULT_PRICING, resolveTierAmount(t, true), serverAmount(id, 'EGP'))).toBe(true);
                expect(isAmountValid(DEFAULT_PRICING, resolveTierAmount(t, false), serverAmount(id, 'USD'))).toBe(true);
            }
        }
    });
});

describe('CSP allows the Stripe iframes the checkout advertises', () => {
    const root = process.cwd();
    const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
    const headerRule = (vercel.headers as Array<{ key: string; value: string }>[])
        .flatMap((rule) => rule.headers)
        .find((header) => header.key === 'Content-Security-Policy');
    const frameSrc = (() => {
        expect(headerRule, 'vercel.json must define a Content-Security-Policy header').toBeDefined();
        const match = /frame-src([^;]*);/.exec(headerRule!.value);
        expect(match, 'CSP must define a frame-src directive').not.toBeNull();
        return match![1].trim().split(/\s+/);
    })();

    it('permits the Stripe Payment Element frame host', () => {
        expect(frameSrc).toContain('https://js.stripe.com');
    });

    it('permits the Stripe hooks frame host used by Link', () => {
        expect(frameSrc).toContain('https://hooks.stripe.com');
    });

    it('keeps the previously allowed frame hosts', () => {
        expect(frameSrc).toContain("'self'");
        expect(frameSrc).toContain('https://www.youtube.com');
    });
});
