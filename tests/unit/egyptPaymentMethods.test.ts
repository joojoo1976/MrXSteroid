/**
 * tests/unit/egyptPaymentMethods.test.ts
 *
 * Locks the approved Egypt/local customer-facing payment methods:
 *   Kashier + InstaPay
 *
 * and proves the Paymob choices are withheld from the customer UI while the
 * Paymob server-side integration stays fully present and fail-closed.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PAYMENT_METHODS } from '../../features/billing/config/pricing.config';

const renderableFor = (market: 'EG' | 'GLOBAL') =>
    PAYMENT_METHODS
        .filter(m => m.supportedRegions.includes(market) && m.isRenderableInCustomerUi !== false)
        .map(m => m.id);

const read = (p: string) => readFileSync(resolve(__dirname, '..', '..', p), 'utf8');

describe('Egypt customer-facing payment methods', () => {
    it('exposes exactly Kashier and InstaPay for Egypt', () => {
        expect(renderableFor('EG').sort()).toEqual(['instapay', 'kashier_eg']);
    });

    it('exposes Kashier as an EGP, EG-only, card method', () => {
        const kashier = PAYMENT_METHODS.find(m => m.id === 'kashier_eg');
        expect(kashier).toBeDefined();
        expect(kashier!.gateway).toBe('kashier');
        expect(kashier!.supportedRegions).toEqual(['EG']);
        expect(kashier!.supportedCurrencies).toEqual(['EGP']);
        expect(kashier!.isRenderableInCustomerUi).not.toBe(false);
    });

    it('keeps InstaPay available for Egypt', () => {
        const instapay = PAYMENT_METHODS.find(m => m.id === 'instapay');
        expect(instapay).toBeDefined();
        expect(instapay!.gateway).toBe('instapay');
        expect(instapay!.supportedRegions).toEqual(['EG']);
    });

    it('never renders a Paymob-backed method in Egypt', () => {
        const ids = renderableFor('EG');
        expect(ids).not.toContain('paymob_card');
        expect(ids).not.toContain('vodafone_cash');
        PAYMENT_METHODS
            .filter(m => m.supportedRegions.includes('EG'))
            .filter(m => renderableFor('EG').includes(m.id))
            .forEach(m => expect(m.gateway).not.toBe('paymob'));
    });

    it('marks the Paymob entries as not renderable without deleting them', () => {
        for (const id of ['paymob_card', 'vodafone_cash']) {
            const method = PAYMENT_METHODS.find(m => m.id === id);
            expect(method, `${id} must still be defined`).toBeDefined();
            expect(method!.gateway).toBe('paymob');
            expect(method!.isRenderableInCustomerUi).toBe(false);
        }
    });

    it('leaves the Global method list untouched', () => {
        expect(renderableFor('GLOBAL').sort()).toEqual(['paypal_global', 'stripe_global']);
    });
});

describe('Paymob integration code is preserved', () => {
    it('still exists server-side and is not deleted', () => {
        expect(() => readFileSync(resolve(__dirname, '..', '..', 'server/payments/gateways/PaymobGateway.ts')))
            .not.toThrow();
    });

    it('is still rejected fail-closed by the invoice route', () => {
        const route = read('app/api/payments/create-invoice/route.ts');
        expect(route).toMatch(/GATEWAY_NOT_AVAILABLE/);
    });
});

describe('PaymentMethodGrid honours the render flag', () => {
    it('filters on isRenderableInCustomerUi', () => {
        const grid = read('features/billing/components/PaymentMethodGrid.tsx');
        expect(grid).toContain('isRenderableInCustomerUi');
    });
});
