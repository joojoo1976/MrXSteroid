import type { PromoStatus } from '../hooks/usePromoCode';

interface CheckoutTotalsInput {
    baseAmount: number;
    shippingPrice: number;
    promoStatus: PromoStatus | null;
}

interface CheckoutTotals {
    discountAmount: number;
    discountPct: number;
    finalTotal: number;
}

/** Applies shipping and promo discounts in the same order the checkout always used. */
export function calculateCheckoutTotals({ baseAmount, shippingPrice, promoStatus }: CheckoutTotalsInput): CheckoutTotals {
    const subTotalWithShipping = baseAmount + shippingPrice;
    // Compute discount: percentage takes priority over fixed amount
    const discountAmount = (() => {
        if (!promoStatus?.valid) return 0;
        if (promoStatus.codeType === 'pct' && promoStatus.discountPct) {
            return Math.round(subTotalWithShipping * (promoStatus.discountPct / 100) * 100) / 100;
        }
        return promoStatus.discount || 0;
    })();
    const discountPct = promoStatus?.codeType === 'pct' ? (promoStatus.discountPct ?? 0) : 0;
    const finalTotal = Math.max(0, subTotalWithShipping - discountAmount);

    return { discountAmount, discountPct, finalTotal };
}
