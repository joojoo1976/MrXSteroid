/**
 * P0 regression — shipping cost must never be client-controlled.
 *
 * Defect (QA 2026-09-25): `resolveShippingCost` ended with
 *     return Math.max(0, clientShippingCost || 0);
 * so any physical order whose provider could not be resolved (i.e. any Global
 * order, because there was no Global default) silently fell back to the value
 * POSTed by the client. Sending `shippingCost: 0` bought free shipping on a
 * physical product — a direct revenue loss on a server-priced order.
 *
 * Second defect (QA 2026-09-25): InstaPay called the resolver unconditionally,
 * so a DIGITAL download was charged local shipping.
 *
 * Third defect (QA 2026-09-25): the 239 EGP local rate was hard-coded in four
 * independent places and contradicted the approved decision of 199 EGP.
 *
 * The contract after the fix (`resolveShippingForCheckout` — the ONE resolver
 * every gateway must call):
 *  - client may express INTENT (which carrier), never PRICE
 *  - DIGITAL is always 0 and never touches provider resolution
 *  - Egypt PHYSICAL resolves to the approved flat rate (199 EGP)
 *  - Global PHYSICAL with no provider is REJECTED, not free
 *  - tampering with shippingCost can never change the total
 *  - the price has exactly one source of truth
 */
import { describe, it, expect } from 'vitest';
import {
    resolveShippingCost,
    resolveShippingForCheckout,
    ShippingConfigurationError,
    DEFAULT_EGYPT_SHIPPING_PROVIDER,
    DEFAULT_PRICING,
    DIGITAL_TIER_IDS,
    isShippableTier,
    EGYPT_LOCAL_SHIPPING_EGP,
    loadPricing,
    type PricingConfig,
} from '../../server/payments/pricing';
import { EGYPT_FIXED_SHIPPING_EGP } from '../../shared/lib/locationData';

const cfg: PricingConfig = {
    tiers: {} as PricingConfig['tiers'],
    shipping: {
        eg_standard: { egp: 199 },
        dhl_global: { usd: 45 },
        fedex_priority: { usd: 38 },
        ups_worldwide: { usd: 42 },
        aramex_international: { usd: 25 },
    },
    tolerance: 0.5,
};

const TAMPER_VALUES = [0, 1, -1, -999999, 999999, 0.01, 1e9, Number.NaN];

describe('approved local shipping price', () => {
    it('is 199 EGP', () => {
        expect(EGYPT_LOCAL_SHIPPING_EGP).toBe(199);
        expect(EGYPT_FIXED_SHIPPING_EGP).toBe(199);
    });

    it('has a single source of truth shared by server config and client display', () => {
        expect(DEFAULT_PRICING.shipping.eg_standard.egp).toBe(EGYPT_FIXED_SHIPPING_EGP);
        expect(EGYPT_LOCAL_SHIPPING_EGP).toBe(EGYPT_FIXED_SHIPPING_EGP);
    });

    it('no longer carries the rejected 239 rate anywhere in the config', () => {
        expect(DEFAULT_PRICING.shipping.eg_standard.egp).not.toBe(239);
    });
});

describe('resolveShippingCost — no client price is ever honoured', () => {
    it.each(TAMPER_VALUES)('prices eg_standard at 199 EGP regardless of tamper value %s', (tampered) => {
        const cost = resolveShippingCost(cfg, DEFAULT_EGYPT_SHIPPING_PROVIDER, tampered, 'EGP');
        expect(cost).toBe(199);
    });

    it.each(TAMPER_VALUES)('prices dhl_global at 45 USD regardless of tamper value %s', (tampered) => {
        const cost = resolveShippingCost(cfg, 'dhl_global', tampered, 'USD');
        expect(cost).toBe(45);
    });

    it('throws instead of returning the client value when the provider is missing', () => {
        expect(() => resolveShippingCost(cfg, undefined, 0, 'USD')).toThrow(ShippingConfigurationError);
    });

    it('throws instead of returning 0 when the provider is an empty string', () => {
        expect(() => resolveShippingCost(cfg, '', 0, 'EGP')).toThrow(ShippingConfigurationError);
    });

    it('throws for an unknown provider instead of trusting the client value', () => {
        expect(() => resolveShippingCost(cfg, 'free_shipping_hack', 0, 'USD')).toThrow(ShippingConfigurationError);
    });

    it('throws when the provider is known but has no price in that currency', () => {
        // dhl_global is USD-only; asking for EGP must not fall back to anything.
        expect(() => resolveShippingCost(cfg, 'dhl_global', 0, 'EGP')).toThrow(ShippingConfigurationError);
    });

    it('never returns the tampered value itself', () => {
        for (const v of TAMPER_VALUES) {
            try {
                const out = resolveShippingCost(cfg, 'nope', v, 'USD');
                expect(out).not.toBe(v);
            } catch {
                /* rejecting is the correct outcome */
            }
        }
    });
});

describe('digital tiers are never charged shipping', () => {
    it.each(DIGITAL_TIER_IDS)('%s is not shippable', (tier) => {
        expect(isShippableTier(tier)).toBe(false);
    });

    it.each(DIGITAL_TIER_IDS)('resolves %s to 0 in Egypt with no provider requested', (tier) => {
        expect(
            resolveShippingForCheckout(cfg, {
                tierId: tier,
                region: 'EGYPT',
                currency: 'EGP',
                requestedProviderId: null,
            }).amount
        ).toBe(0);
    });

    it.each(DIGITAL_TIER_IDS)('resolves %s to 0 globally', (tier) => {
        expect(
            resolveShippingForCheckout(cfg, { tierId: tier, region: 'GLOBAL', currency: 'USD' }).amount
        ).toBe(0);
    });

    it('charges 0 for digital even when a provider is named', () => {
        expect(
            resolveShippingForCheckout(cfg, {
                tierId: 'digital',
                region: 'EGYPT',
                currency: 'EGP',
                requestedProviderId: 'dhl_global',
            }).amount
        ).toBe(0);
    });

    it('charges 0 for digital even when a provider is invalid', () => {
        expect(
            resolveShippingForCheckout(cfg, {
                tierId: 'pdf',
                region: 'EGYPT',
                currency: 'EGP',
                requestedProviderId: 'totally_made_up',
            }).amount
        ).toBe(0);
    });

    it('never consults provider config for digital (works with an empty shipping table)', () => {
        const empty: PricingConfig = { ...cfg, shipping: {} };
        expect(
            resolveShippingForCheckout(empty, { tierId: 'digital', region: 'EGYPT', currency: 'EGP' }).amount
        ).toBe(0);
    });
});

describe('Egypt physical', () => {
    it('prices at the approved 199 EGP flat rate', () => {
        expect(
            resolveShippingForCheckout(cfg, { tierId: 'bundle', region: 'EGYPT', currency: 'EGP' }).amount
        ).toBe(199);
    });

    it('resolves to the canonical eg_standard provider', () => {
        expect(
            resolveShippingForCheckout(cfg, { tierId: 'bundle', region: 'EGYPT', currency: 'EGP' }).providerId
        ).toBe(DEFAULT_EGYPT_SHIPPING_PROVIDER);
    });

    it('REJECTS a provider that is not valid for EGP, rather than ignoring it', () => {
        // aramex_international is configured for USD only. Silently ignoring the
        // request would hide a client bug behind a plausible total, so an
        // unusable provider name is rejected.
        expect(() =>
            resolveShippingForCheckout(cfg, {
                tierId: 'bundle',
                region: 'EGYPT',
                currency: 'EGP',
                requestedProviderId: 'aramex_international',
            })
        ).toThrow(ShippingConfigurationError);
    });

    it('rejects an explicitly named unknown provider instead of silently repricing', () => {
        expect(() =>
            resolveShippingForCheckout(cfg, {
                tierId: 'bundle',
                region: 'EGYPT',
                currency: 'EGP',
                requestedProviderId: 'free_shipping_hack',
            })
        ).toThrow(ShippingConfigurationError);
    });

    it('charges the canonical rate when the requested provider IS the canonical one', () => {
        expect(
            resolveShippingForCheckout(cfg, {
                tierId: 'bundle',
                region: 'EGYPT',
                currency: 'EGP',
                requestedProviderId: DEFAULT_EGYPT_SHIPPING_PROVIDER,
            }).amount
        ).toBe(199);
    });

    it('ignores a tampered client shipping cost', () => {
        for (const v of TAMPER_VALUES) {
            const out = resolveShippingForCheckout(cfg, {
                tierId: 'bundle',
                region: 'EGYPT',
                currency: 'EGP',
                legacyClientShippingCost: v,
            });
            expect(out.amount).toBe(199);
        }
    });

    it('throws when no local rate is configured at all', () => {
        const broken: PricingConfig = { ...cfg, shipping: { dhl_global: { usd: 45 } } };
        expect(() =>
            resolveShippingForCheckout(broken, { tierId: 'bundle', region: 'EGYPT', currency: 'EGP' })
        ).toThrow(ShippingConfigurationError);
    });
});

describe('Global physical is blocked until a carrier service exists', () => {
    it('REJECTS a Global physical order with no provider instead of free shipping', () => {
        expect(() =>
            resolveShippingForCheckout(cfg, { tierId: 'bundle', region: 'GLOBAL', currency: 'USD' })
        ).toThrow(ShippingConfigurationError);
    });

    it('REJECTS a Global physical order naming a REAL configured USD provider', () => {
        // The decisive case. `fedex_priority` genuinely exists in the config
        // table with a USD rate, and the old implementation priced it (38 USD).
        // The canonical decision is GLOBAL physical = BLOCKED, so a configured
        // provider alone must NOT produce a price. If this test ever starts
        // returning a number, international shipping has been enabled by
        // accident rather than by an explicit, reviewed decision.
        expect(() =>
            resolveShippingForCheckout(cfg, {
                tierId: 'bundle',
                region: 'GLOBAL',
                currency: 'USD',
                requestedProviderId: 'fedex_priority',
            })
        ).toThrow(ShippingConfigurationError);
    });

    it('never returns a price or a provider for ANY Global physical input', () => {
        // Exhaustive: whatever the client asks for, the outcome is a throw —
        // never an amount, never a provider, never a silent 0.
        const attempts: Array<string | null | undefined> = [
            undefined, null, '', '   ', 'fedex_priority', 'eg_standard',
            'dhl_express', 'made_up_carrier', 'FEDEX_PRIORITY',
        ];
        for (const requestedProviderId of attempts) {
            let result: unknown = null;
            try {
                result = resolveShippingForCheckout(cfg, {
                    tierId: 'bundle',
                    region: 'GLOBAL',
                    currency: 'USD',
                    requestedProviderId,
                });
            } catch (e) {
                expect(e).toBeInstanceOf(ShippingConfigurationError);
                continue;
            }
            throw new Error(
                `Global physical must be blocked, but it returned ${JSON.stringify(result)} ` +
                `for requestedProviderId=${JSON.stringify(requestedProviderId)}`
            );
        }
    });

    it('keeps Egypt physical at the canonical 199 EGP / eg_standard', () => {
        // The block must not leak into the approved local rate.
        const r = resolveShippingForCheckout(cfg, {
            tierId: 'bundle', region: 'EGYPT', currency: 'EGP',
        });
        expect(r.amount).toBe(199);
        expect(r.providerId).toBe('eg_standard');
    });

    it('keeps Global DIGITAL at 0 unconditionally', () => {
        // Digital is never shipped, in any region, whatever the client asks for.
        for (const requestedProviderId of [undefined, 'fedex_priority', 'made_up']) {
            const r = resolveShippingForCheckout(cfg, {
                tierId: 'digital', region: 'GLOBAL', currency: 'USD', requestedProviderId,
            });
            expect(r.amount).toBe(0);
            expect(r.providerId).toBeNull();
        }
    });

    it('REJECTS an unknown provider', () => {
        expect(() =>
            resolveShippingForCheckout(cfg, {
                tierId: 'bundle',
                region: 'GLOBAL',
                currency: 'USD',
                requestedProviderId: 'my_own_cheap_shipping',
            })
        ).toThrow(ShippingConfigurationError);
    });

    it('REJECTS a provider that has no price in USD', () => {
        expect(() =>
            resolveShippingForCheckout(cfg, {
                tierId: 'bundle',
                region: 'GLOBAL',
                currency: 'USD',
                requestedProviderId: 'eg_standard',
            })
        ).toThrow(ShippingConfigurationError);
    });

    it('REJECTS an empty provider string', () => {
        expect(() =>
            resolveShippingForCheckout(cfg, {
                tierId: 'bundle',
                region: 'GLOBAL',
                currency: 'USD',
                requestedProviderId: '   ',
            })
        ).toThrow(ShippingConfigurationError);
    });

    it('never resolves to 0', () => {
        try {
            const out = resolveShippingForCheckout(cfg, {
                tierId: 'bundle',
                region: 'GLOBAL',
                currency: 'USD',
                legacyClientShippingCost: 0,
            });
            expect(out.amount).not.toBe(0);
        } catch {
            /* rejecting is the correct outcome */
        }
    });

    it('refuses even an explicitly named, configured provider (GLOBAL = BLOCKED)', () => {
        // Previously this asserted `dhl_global` → 45 USD. A configured provider
        // is NOT sufficient to enable international shipping; the decision is
        // explicit and the outcome is always a refusal.
        expect(() =>
            resolveShippingForCheckout(cfg, {
                tierId: 'bundle',
                region: 'GLOBAL',
                currency: 'USD',
                requestedProviderId: 'dhl_global',
            })
        ).toThrow(ShippingConfigurationError);
    });
});

describe('provider intent is identical regardless of where the client sent it', () => {
    // The old bug: Kashier read `input.shippingProviderId || metadata.…` while
    // Paymob/Stripe read `metadata.…` only. Both now funnel the SAME value into
    // the ONE resolver, so the two sources cannot diverge in outcome.
    //
    // Parity is asserted on the EGYPT path, where resolution legitimately
    // succeeds, so the invariant is checked against a real result rather than
    // against two identical throws.
    const resolveEgyptViaTopLevel = (requested?: string | null) =>
        resolveShippingForCheckout(cfg, {
            tierId: 'bundle',
            region: 'EGYPT',
            currency: 'EGP',
            requestedProviderId: requested,
        });

    it('produces the same result for the same intent', () => {
        expect(resolveEgyptViaTopLevel(undefined).amount).toBe(199);
    });

    it('ignores surrounding whitespace identically', () => {
        expect(resolveEgyptViaTopLevel('  eg_standard  ').amount).toBe(199);
    });

    it('treats null and undefined the same', () => {
        expect(resolveEgyptViaTopLevel(null).amount)
            .toBe(resolveEgyptViaTopLevel(undefined).amount);
    });

    it('refuses a real provider for GLOBAL no matter how the intent was phrased', () => {
        for (const requested of ['dhl_global', '  dhl_global  ', 'fedex_priority', undefined, null]) {
            expect(() =>
                resolveShippingForCheckout(cfg, {
                    tierId: 'bundle',
                    region: 'GLOBAL',
                    currency: 'USD',
                    requestedProviderId: requested,
                })
            ).toThrow(ShippingConfigurationError);
        }
    });
});

describe('end-to-end invariant', () => {
    it('a 0-shipping tamper can never produce a cheaper total than an honest request', async () => {
        const pricing = await loadPricing(async () => []);

        const honest = resolveShippingForCheckout(pricing, {
            tierId: 'bundle',
            region: 'EGYPT',
            currency: 'EGP',
        });
        const tampered = resolveShippingForCheckout(pricing, {
            tierId: 'bundle',
            region: 'EGYPT',
            currency: 'EGP',
            legacyClientShippingCost: 0,
        });
        const freeAttempt = (() => {
            try {
                return resolveShippingForCheckout(pricing, {
                    tierId: 'bundle',
                    region: 'GLOBAL',
                    currency: 'USD',
                    legacyClientShippingCost: 0,
                });
            } catch {
                return null;
            }
        })();

        expect(honest.amount).toBe(tampered.amount);
        expect(honest.amount).toBe(199);
        expect(freeAttempt).toBeNull();
    });
});
