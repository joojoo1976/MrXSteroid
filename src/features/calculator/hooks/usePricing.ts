import { useState, useCallback } from 'react';
import { ContentStrings, PricingTier, ProductVariant } from '@/shared/types/types';

interface UsePricingOptions {
    content: ContentStrings;
    isRTL: boolean;
    openCheckout: (tier: PricingTier) => void;
}

const BASE_PRICES: Record<string, number> = {
    'digital': 49.99,
    'bundle': 72.00,
    'coaching': 82.00
};

export const usePricing = ({ content, isRTL, openCheckout }: UsePricingOptions) => {
    const [isCoachingActive, setIsCoachingActive] = useState(false);

    const plans = content.pricingPlans;

    const handleCheckout = useCallback((planId: ProductVariant) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        let finalPrice = BASE_PRICES[planId] || 0;
        let finalTierId = planId;

        if (planId === 'coaching' && isCoachingActive) {
            finalPrice += 200;
            finalTierId = 'coaching_plus' as ProductVariant;
        }

        const tierData: PricingTier = {
            id: finalTierId,
            name: plan.name + (planId === 'coaching' && isCoachingActive ? " + Coaching" : ""),
            price: finalPrice,
            originalPrice: (planId === 'coaching' && isCoachingActive ? (finalPrice * 1.5).toFixed(2) : (finalPrice * 1.4).toFixed(2)),
            description: plan.description,
            features: plan.features,
            buttonText: plan.cta,
            isPopular: plan.id === 'bundle',
            selectedLanguage: isRTL ? 'ar' : 'en',
            requiresShipping: planId !== 'digital',
            requiresBodyStats: planId === 'coaching' && isCoachingActive,
            includesEbook: true,
            includesAudiobook: planId !== 'digital',
            includesCoaching: planId === 'coaching' && isCoachingActive
        };

        openCheckout(tierData);
    }, [isCoachingActive, isRTL, openCheckout, plans]);

    const getPlanPrices = useCallback((planId: string) => {
        const isCoachingTier = planId === 'coaching';
        const basePrice = BASE_PRICES[planId] || 0;
        const grandTotal = isCoachingTier && isCoachingActive ? basePrice + 200 : basePrice;
        const originalPrice = isCoachingTier && isCoachingActive ? grandTotal * 1.5 : basePrice * 1.4;

        return {
            grandTotal,
            originalPrice
        };
    }, [isCoachingActive]);

    return {
        isCoachingActive,
        setIsCoachingActive,
        handleCheckout,
        getPlanPrices,
        plans
    };
};
