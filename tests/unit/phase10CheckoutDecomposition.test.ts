import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildCheckoutSchema } from '../../features/checkout/lib/checkoutSchema';
import { calculateCheckoutTotals } from '../../features/checkout/lib/checkoutTotals';

const ROOT = join(__dirname, '..', '..');
const CHECKOUT_DIR = join(ROOT, 'features', 'checkout');

const content = {
    checkout: {
        validation: {
            nameRequired: 'name required',
            emailInvalid: 'email invalid',
            countryRequired: 'country required',
            addressRequired: 'address required',
            cityRequired: 'city required',
            shippingRequired: 'shipping required',
            weightRequired: 'weight required',
            heightRequired: 'height required',
            termsRequired: 'terms required',
        },
    },
} as never;

function sourceFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) return sourceFiles(path);
        return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
    });
}

describe('Phase 10 — CheckoutForm decomposition keeps every checkout file small', () => {
    it('no file under features/checkout exceeds 400 lines', () => {
        const oversized = sourceFiles(CHECKOUT_DIR)
            .map(path => ({ path: relative(ROOT, path), lines: readFileSync(path, 'utf8').split('\n').length }))
            .filter(file => file.lines > 400);

        expect(oversized).toEqual([]);
    });

    it('keeps the public CheckoutForm exports stable for existing consumers', () => {
        const form = readFileSync(join(CHECKOUT_DIR, 'CheckoutForm.tsx'), 'utf8');
        expect(form).toContain('export type { NewPricingTier, CheckoutFormProps }');
        expect(form).toContain('export const CheckoutForm');
        expect(form).toContain('export default CheckoutForm');
    });
});

describe('Phase 10 — extracted checkout calculations are unchanged', () => {
    it('applies percentage promo to the shipping-inclusive subtotal', () => {
        expect(calculateCheckoutTotals({
            baseAmount: 100,
            shippingPrice: 20,
            promoStatus: { valid: true, message: '', discount: 0, discountPct: 10, codeType: 'pct' },
        })).toEqual({ discountAmount: 12, discountPct: 10, finalTotal: 108 });
    });

    it('applies a fixed promo after shipping', () => {
        expect(calculateCheckoutTotals({
            baseAmount: 100,
            shippingPrice: 20,
            promoStatus: { valid: true, message: '', discount: 15, codeType: 'fixed' },
        })).toEqual({ discountAmount: 15, discountPct: 0, finalTotal: 105 });
    });

    it('ignores an invalid promo and never lets the total go negative', () => {
        expect(calculateCheckoutTotals({ baseAmount: 100, shippingPrice: 20, promoStatus: null }))
            .toEqual({ discountAmount: 0, discountPct: 0, finalTotal: 120 });
        expect(calculateCheckoutTotals({
            baseAmount: 10,
            shippingPrice: 0,
            promoStatus: { valid: true, message: '', discount: 50, codeType: 'fixed' },
        }).finalTotal).toBe(0);
    });
});

describe('Phase 10 — extracted Zod schema keeps conditional checkout rules', () => {
    const base = {
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        createAccount: true,
        agreeToTerms: true,
        address: '123 Main Street',
        city: 'New York',
        shippingProvider: 'eg_standard',
        zipCode: '10001',
        weight: '80',
        height: '180',
    };

    it('requires a postal code outside Egypt and makes it optional inside Egypt', () => {
        const schema = buildCheckoutSchema({ content, isAr: false, selectedTier: { requiresShipping: true } });
        expect(schema.safeParse({ ...base, zipCode: '' }).success).toBe(false);
        expect(schema.safeParse({ ...base, country: 'EG', zipCode: '' }).success).toBe(true);
    });

    it('requires address, city and shipping provider for physical orders', () => {
        const schema = buildCheckoutSchema({ content, isAr: false, selectedTier: { requiresShipping: true } });
        expect(schema.safeParse({ ...base, address: '' }).success).toBe(false);
        expect(schema.safeParse({ ...base, city: '' }).success).toBe(false);
        expect(schema.safeParse({ ...base, shippingProvider: '' }).success).toBe(false);
    });

    it('requires weight and height only for body-stat tiers', () => {
        const schema = buildCheckoutSchema({ content, isAr: false, selectedTier: { requiresBodyStats: true } });
        expect(schema.safeParse({ ...base, weight: '', height: '' }).success).toBe(false);
        expect(schema.safeParse(base).success).toBe(true);
    });
});
