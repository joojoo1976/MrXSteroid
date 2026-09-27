/**
 * Coaching add-on USD price integrity.
 *
 * Phase 0 (docs/governance/2026-09-24-read-only-reconciliation.md, price
 * conflict P2) recorded the Global 1-on-1 coaching add-on as CONFLICT: three
 * code paths charged 200.00 USD while the approved business price is 349.99.
 *
 * Authority: docs/governance/phase1/PHASE1-DECISION-RECORD.md (D4) — the Global
 * coaching add-on is 349.99 USD and 200.00 USD is cancelled. D4 explicitly does
 * NOT change the Egypt add-on (9,999 EGP), so both are locked here.
 *
 * Mirrors the D3 / 199 EGP guard (paymobShippingPriceConsistency.test.ts,
 * shippingTamperResistance.test.ts, instapayCanonicalChain.test.ts), which locks
 * the shipping price against a silent return to the rejected 239 rate.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { DEFAULT_PRICING, computeAmount } from '@/server/payments/pricing';
import { COACHING_ADDON_USD, COACHING_ADDON_EGP } from '@/shared/lib/logic';

const APPROVED_USD = 349.99;
const APPROVED_EGP = 9999;
const CANCELLED_USD = 200.00;

const REPO_ROOT = path.resolve(__dirname, '..', '..');

describe('D4 — coaching add-on USD price', () => {
    it('the shared client constant is the approved 349.99 USD', () => {
        expect(COACHING_ADDON_USD).toBe(APPROVED_USD);
    });

    it('never returns to the cancelled 200.00 USD figure', () => {
        expect(COACHING_ADDON_USD).not.toBe(CANCELLED_USD);
    });

    it('leaves the Egypt add-on unchanged, as D4 requires', () => {
        // D4 changed the GLOBAL price only. Guarding the EGP side prevents a
        // well-meaning "sync both currencies" edit from silently repricing Egypt.
        expect(COACHING_ADDON_EGP).toBe(APPROVED_EGP);
    });

    it('every server addon tier carries the approved USD price', () => {
        for (const tier of ['coaching_plus', 'bundle_plus', 'digital_plus'] as const) {
            expect(DEFAULT_PRICING.addons[tier].usd, `${tier} usd`).toBe(APPROVED_USD);
            expect(DEFAULT_PRICING.addons[tier].egp, `${tier} egp`).toBe(APPROVED_EGP);
        }
    });

    it('server and client agree, so the charged amount matches the display', () => {
        // The two constants are duplicated as literals on purpose: shared/lib/logic
        // imports `sonner` and must never be loaded by server code. This assertion
        // is the contract that replaces the import.
        for (const tier of ['coaching_plus', 'bundle_plus', 'digital_plus'] as const) {
            expect(DEFAULT_PRICING.addons[tier].usd, `${tier} server/client drift`).toBe(COACHING_ADDON_USD);
            expect(DEFAULT_PRICING.addons[tier].egp, `${tier} server/client drift`).toBe(COACHING_ADDON_EGP);
        }
    });

    it('the server-computed USD amount uses the approved add-on', () => {
        for (const tier of ['coaching_plus', 'bundle_plus', 'digital_plus'] as const) {
            const base = DEFAULT_PRICING.tiers[tier].usd;
            const amount = computeAmount(DEFAULT_PRICING, { tierId: tier, currency: 'USD', quantity: 1 });
            expect(amount, `${tier} = base + add-on`).toBeCloseTo(base + APPROVED_USD, 2);
            expect(amount, `${tier} must not use the cancelled price`).not.toBeCloseTo(base + CANCELLED_USD, 2);
        }
    });

    it('no live source file still hard-codes the cancelled 200.00 price', () => {
        // Display strings are the risk P2 called out: a stale literal renders a
        // price the server will refuse to charge. Source scan only — the two
        // explanatory comments in pricing.ts / logic.ts are allowed to name it.
        const roots = ['features', 'i18n', 'app', 'server', 'shared', 'context', 'config', 'lib'];
        const offenders: string[] = [];

        const walk = (dir: string): void => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (entry.name === 'node_modules' || entry.name === '.next') continue;
                    walk(full);
                    continue;
                }
                if (!/\.(ts|tsx)$/.test(entry.name)) continue;

                fs.readFileSync(full, 'utf8')
                    .split(/\r?\n/)
                    .forEach((line, index) => {
                        const isComment = /^\s*(\/\/|\*|\/\*)/.test(line);
                        if (isComment) return;
                        if (/\$200\b|200\.00/.test(line)) {
                            offenders.push(`${path.relative(REPO_ROOT, full)}:${index + 1}`);
                        }
                    });
            }
        };

        for (const root of roots) {
            const dir = path.join(REPO_ROOT, root);
            if (fs.existsSync(dir)) walk(dir);
        }

        expect(offenders, `cancelled ${CANCELLED_USD} USD still present in: ${offenders.join(', ')}`).toEqual([]);
    });
});
