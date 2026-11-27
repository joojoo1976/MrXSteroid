import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildCheckoutPlanUrl, buildCheckoutPlansHref, CHECKOUT_PLANS_HREF } from '@/shared/lib/checkoutPlan';
import { useCheckout } from '@/features/checkout/hooks/useCheckout';

const { calculateShippingRates, createInvoice } = vi.hoisted(() => ({
    calculateShippingRates: vi.fn(),
    createInvoice: vi.fn(),
}));

vi.mock('@/context/PreferencesContext', () => ({
    usePreferences: () => ({ currency: 'USD', formatPrice: (amount: number) => `$${amount.toFixed(2)}` }),
}));
vi.mock('@hookform/resolvers/zod', () => ({ zodResolver: () => async (values: unknown) => ({ values, errors: {} }) }));
vi.mock('@/features/checkout/lib/checkoutSchema', () => ({ buildCheckoutSchema: () => ({}) }));
vi.mock('@/features/checkout/hooks/usePromoCode', () => ({
    usePromoCode: () => ({ promoCode: '', setPromoCode: vi.fn(), promoStatus: null, isPromoLoading: false, handleApplyPromo: vi.fn() }),
}));
vi.mock('@/shared/lib/payment.service', () => ({ paymentService: { createInvoice, submitInstaPay: vi.fn() } }));
vi.mock('@/shared/lib/logic', () => ({ calculateShippingRates, EGP_PRICES: {} }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => { resolve = done; });
    return { promise, resolve };
}

function renderCheckout({ requiresShipping = false, isEg = true } = {}) {
    return renderHook(() => {
        const [isEgypt, setIsEgypt] = React.useState(isEg);
        const checkout = useCheckout({
            content: {} as never,
            lang: 'en',
            selectedTier: { id: 'bundle', requiresShipping } as never,
            totalAmount: 49.99,
            productVariant: requiresShipping ? 'bundle' : 'digital',
            isEg: isEgypt,
            onLocationChange: setIsEgypt,
        });
        return checkout;
    });
}

describe('checkout plan navigation and regional selection integrity', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        calculateShippingRates.mockResolvedValue([]);
    });

    it('uses the existing checkout plan selector as the canonical marketing destination', () => {
        expect(CHECKOUT_PLANS_HREF).toBe('/checkout#plans');
        expect(buildCheckoutPlansHref('ar')).toBe('/ar/checkout#plans');
        expect(buildCheckoutPlansHref('en')).toBe('/en/checkout#plans');
        for (const plan of ['digital', 'bundle', 'coaching', 'digital_plus', 'bundle_plus', 'coaching_plus'] as const) {
            const url = new URL(buildCheckoutPlanUrl(plan), 'https://mrxsteroid.test');
            expect(url.pathname).toBe('/checkout');
            expect(url.searchParams.get('plan')).toBe(plan);
        }
    });

    it('keeps region, country, and available gateway aligned across repeated switches', async () => {
        const { result } = renderCheckout();

        for (let cycle = 0; cycle < 3; cycle += 1) {
            act(() => result.current.setRegionOption('GLOBAL'));
            await waitFor(() => {
                expect(result.current.regionOption).toBe('GLOBAL');
                expect(result.current.form.getValues('country')).toBe('US');
                expect(result.current.paymobMethod).toBe('stripe');
                expect(result.current.isEg).toBe(false);
            });

            act(() => result.current.setRegionOption('EG'));
            await waitFor(() => {
                expect(result.current.regionOption).toBe('EG');
                expect(result.current.form.getValues('country')).toBe('EG');
                expect(result.current.paymobMethod).toBe('kashier');
                expect(result.current.isEg).toBe(true);
            });
        }
    });

    it('ignores stale shipping-rate responses after the country changes again', async () => {
        const egyptRates = [{ id: 'eg-current', name: 'Egypt delivery', price: 20, estimatedDays: '2-4' }];
        const staleGlobal = deferred<typeof egyptRates>();
        const currentEgypt = deferred<typeof egyptRates>();
        calculateShippingRates
            .mockResolvedValueOnce(egyptRates)
            .mockReturnValueOnce(staleGlobal.promise)
            .mockReturnValueOnce(currentEgypt.promise);

        const { result } = renderCheckout({ requiresShipping: true });
        await waitFor(() => expect(result.current.shippingProviders).toEqual(egyptRates));

        act(() => result.current.form.setValue('country', 'US'));
        act(() => result.current.form.setValue('country', 'EG'));

        await act(async () => { currentEgypt.resolve(egyptRates); });
        await waitFor(() => expect(result.current.shippingProviders).toEqual(egyptRates));
        await act(async () => {
            staleGlobal.resolve([{ id: 'old-us', name: 'Old global delivery', price: 999, estimatedDays: '10-20' }]);
        });

        expect(result.current.shippingProviders).toEqual(egyptRates);
        expect(result.current.selectedShipping?.id).toBe('eg-current');
        expect(result.current.finalTotal).toBeCloseTo(69.99, 8);
    });

    it('does not apply a Stripe client secret returned for a selection that is no longer current', async () => {
        const pendingInvoice = deferred<{ success: boolean; clientSecret: string; invoiceId: string }>();
        createInvoice.mockReturnValueOnce(pendingInvoice.promise);
        const { result } = renderCheckout({ isEg: false });

        let submit!: Promise<void>;
        act(() => { submit = result.current.onSubmit(); });
        await waitFor(() => expect(createInvoice).toHaveBeenCalledOnce());

        act(() => result.current.form.setValue('country', 'EG'));
        await waitFor(() => expect(result.current.regionOption).toBe('EG'));
        await act(async () => {
            pendingInvoice.resolve({ success: true, clientSecret: 'stale_secret', invoiceId: 'stale_invoice' });
            await submit;
        });

        expect(result.current.stripeClientSecret).toBeNull();
        expect(result.current.stripeInvoiceId).toBeNull();
        expect(result.current.isStripeReady).toBe(false);
    });
});
