import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCheckout } from '@/features/checkout/hooks/useCheckout';

vi.mock('@/context/PreferencesContext', () => ({
    usePreferences: () => ({ currency: 'USD', formatPrice: (amount: number) => `$${amount.toFixed(2)}` }),
}));

vi.mock('@hookform/resolvers/zod', () => ({
    zodResolver: () => async (values: unknown) => ({ values, errors: {} }),
}));

vi.mock('@/features/checkout/lib/checkoutSchema', () => ({
    buildCheckoutSchema: () => ({}),
}));

vi.mock('@/features/checkout/hooks/usePromoCode', () => ({
    usePromoCode: () => ({
        promoCode: '',
        setPromoCode: vi.fn(),
        promoStatus: null,
        isPromoLoading: false,
        handleApplyPromo: vi.fn(),
    }),
}));

vi.mock('@/shared/lib/payment.service', () => ({ paymentService: { createInvoice: vi.fn() } }));
vi.mock('@/shared/lib/logic', () => ({ calculateShippingRates: vi.fn(), EGP_PRICES: {} }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

function renderCheckout() {
    return renderHook(() => {
        const [isEg, setIsEg] = React.useState(true);
        const checkout = useCheckout({
            content: {} as never,
            lang: 'en',
            selectedTier: { id: 'digital', requiresShipping: false } as never,
            totalAmount: 49.99,
            productVariant: 'digital',
            isEg,
            onLocationChange: setIsEg,
        });
        return checkout;
    });
}

describe('checkout region and gateway synchronization', () => {
    beforeEach(() => vi.clearAllMocks());

    it('keeps country, currency region, and payment method aligned when toggled both ways', async () => {
        const { result } = renderCheckout();

        expect(result.current.regionOption).toBe('EG');
        expect(result.current.form.getValues('country')).toBe('EG');
        expect(result.current.paymobMethod).toBe('kashier');

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
    });

    it('synchronizes the gateway when delivery country changes the parent region', async () => {
        const { result } = renderCheckout();

        act(() => result.current.form.setValue('country', 'US'));
        await waitFor(() => {
            expect(result.current.regionOption).toBe('GLOBAL');
            expect(result.current.paymobMethod).toBe('stripe');
            expect(result.current.isEg).toBe(false);
        });

        act(() => result.current.form.setValue('country', 'EG'));
        await waitFor(() => {
            expect(result.current.regionOption).toBe('EG');
            expect(result.current.paymobMethod).toBe('kashier');
            expect(result.current.isEg).toBe(true);
        });
    });
});
