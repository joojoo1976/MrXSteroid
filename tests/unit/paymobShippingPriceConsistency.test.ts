/**
 * Paymob shipping add-on (#315206) must mirror the price Paymob actually
 * charges — otherwise the storefront shows one number and the customer is
 * billed another.
 *
 * HISTORY
 * -------
 * This mirror used to say 239 EGP while the canonical Egypt shipping rate said
 * 199 EGP. It was deliberately left stale until the Paymob Dashboard was
 * changed, because flipping it first would have made the storefront advertise a
 * price the gateway was not charging.
 *
 * The owner changed Paymob Production product #315206 from 239 EGP to 199 EGP
 * and confirmed it directly (2026-09-25). Production API verification is not
 * possible from this repository: every available Paymob credential is test-mode
 * (`egy_pk_test_…`) and `POST /api/auth/tokens` rejects it with HTTP 400, while
 * `GET /api/acceptance/payment_keys` requires auth (401). The owner is therefore
 * the source of truth for the Dashboard value, and this file now pins the
 * approved result.
 *
 * These tests assert CANONICAL APPLICATION CONFIGURATION ONLY. They never call
 * the Paymob API, so the suite stays hermetic and offline-safe.
 */
import { describe, it, expect } from 'vitest';

import { PAYMOB_PRODUCTS, getProductById } from '../../shared/lib/paymobProducts';
import { EGYPT_FIXED_SHIPPING_EGP } from '../../shared/lib/locationData';

const EGYPT_SHIPPING_PRODUCT_ID = 315206;
const APPROVED_EGYPT_SHIPPING_EGP = 199;

describe('Paymob shipping add-on product identity', () => {
    it('is product #315206 and is named "Egypt Shipping Add-on"', () => {
        const p = getProductById(EGYPT_SHIPPING_PRODUCT_ID);
        expect(p).toBeDefined();
        expect(p!.productId).toBe(315206);
        expect(p!.nameEn).toBe('Egypt Shipping Add-on');
        expect(p!.tierId).toBe('shipping');
    });

    it('exists exactly once in the catalogue', () => {
        const matches = PAYMOB_PRODUCTS.filter((p) => p.productId === EGYPT_SHIPPING_PRODUCT_ID);
        expect(matches).toHaveLength(1);
    });
});

describe('APPROVED: #315206 is 199 EGP / 19900 minor units', () => {
    it('prices the add-on at exactly 199 EGP', () => {
        const p = getProductById(EGYPT_SHIPPING_PRODUCT_ID)!;
        expect(p.priceEGP).toBe(199);
    });

    it('expresses the same price in minor units (19900)', () => {
        const p = getProductById(EGYPT_SHIPPING_PRODUCT_ID)!;
        expect(p.priceCents).toBe(19900);
    });

    it('never returns to the rejected 239 rate', () => {
        // The defect being permanently closed: 239 EGP / 23900 minor units must
        // not come back for this product.
        const p = getProductById(EGYPT_SHIPPING_PRODUCT_ID)!;
        expect(p.priceEGP).not.toBe(239);
        expect(p.priceCents).not.toBe(23900);
    });

    it('priceCents is always exactly priceEGP * 100 across the catalogue', () => {
        // Guards against a future partial edit desynchronising the two fields.
        for (const p of PAYMOB_PRODUCTS) {
            expect(p.priceCents, `${p.nameEn} (#${p.productId})`).toBe(p.priceEGP * 100);
        }
    });
});

describe('the Paymob mirror matches the canonical Egypt shipping price', () => {
    it('mirror EGP equals the canonical constant', () => {
        const p = getProductById(EGYPT_SHIPPING_PRODUCT_ID)!;
        expect(p.priceEGP).toBe(EGYPT_FIXED_SHIPPING_EGP);
    });

    it('mirror minor units equal the canonical constant * 100', () => {
        const p = getProductById(EGYPT_SHIPPING_PRODUCT_ID)!;
        expect(p.priceCents).toBe(EGYPT_FIXED_SHIPPING_EGP * 100);
    });

    it('the canonical constant is the approved 199 EGP, not 239', () => {
        expect(EGYPT_FIXED_SHIPPING_EGP).toBe(APPROVED_EGYPT_SHIPPING_EGP);
        expect(EGYPT_FIXED_SHIPPING_EGP).not.toBe(239);
    });
});
