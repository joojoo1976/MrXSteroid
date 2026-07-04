import { useState, useCallback } from 'react';
import { ContentStrings, PricingTier, ProductVariant } from '@/shared/types/types';

import { EGP_PRICES } from '../../../shared/lib/logic';

interface UsePricingOptions {
    content: ContentStrings;
    isRTL: boolean;
    openCheckout: (tier: PricingTier) => void;
    selectedLocation: 'EG' | 'GLOBAL';
    bookLanguage: 'en' | 'ar';
}

const BASE_PRICES: Record<string, number> = {
    'digital': 49.99,
    'bundle': 72.00,
    'coaching': 82.00
};

export const usePricing = ({ content, openCheckout, selectedLocation, bookLanguage }: UsePricingOptions) => {
    const [isCoachingActive, setIsCoachingActive] = useState(false);

    const plans = content.pricingPlans;

    const handleCheckout = useCallback((planId: ProductVariant) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        let finalPrice = BASE_PRICES[planId] || 0;
        let finalTierId = planId;

        if (planId === 'coaching' && isCoachingActive) {
            finalPrice = 200.00;
            finalTierId = 'coaching_plus' as ProductVariant;
        }

        if (selectedLocation === 'EG') {
            finalPrice = EGP_PRICES[finalTierId] || 750;
        }

        const tierData: PricingTier = {
            id: finalTierId,
            name: plan.name + (planId === 'coaching' && isCoachingActive ? " + Coaching" : ""),
            price: finalPrice,
            originalPrice: selectedLocation === 'EG' 
                ? (finalTierId === 'digital' ? "699" : (finalTierId === 'coaching_plus' ? "1125" : "1050"))
                : (planId === 'coaching' && isCoachingActive ? (finalPrice * 1.5).toFixed(2) : (finalPrice * 1.4).toFixed(2)),
            description: plan.description,
            features: plan.features,
            buttonText: plan.cta,
            isPopular: plan.id === 'bundle',
            selectedLanguage: bookLanguage,
            selectedLocation: selectedLocation,
            requiresShipping: planId !== 'digital',
            requiresBodyStats: planId === 'coaching' && isCoachingActive,
            includesEbook: true,
            includesAudiobook: planId !== 'digital',
            includesCoaching: planId === 'coaching' && isCoachingActive
        };

        openCheckout(tierData);
    }, [isCoachingActive, bookLanguage, selectedLocation, openCheckout, plans]);

    const getPlanPrices = useCallback((planId: string) => {
        const isCoachingTier = planId === 'coaching';
        if (selectedLocation === 'EG') {
            const finalId = isCoachingTier && isCoachingActive ? 'coaching_plus' : planId;
            const grandTotal = EGP_PRICES[finalId] || EGP_PRICES['coaching'] || 750;
            const originalPrice = finalId === 'digital' ? 699 : (finalId === 'coaching_plus' ? 1125 : 1050);
            return { grandTotal, originalPrice };
        } else {
            const basePrice = BASE_PRICES[planId] || 0;
            const grandTotal = isCoachingTier && isCoachingActive ? 200.00 : basePrice;
            const originalPrice = isCoachingTier && isCoachingActive ? 350.00 : basePrice * 1.4;
            return { grandTotal, originalPrice };
        }
    }, [isCoachingActive, selectedLocation]);

    return {
        isCoachingActive,
        setIsCoachingActive,
        handleCheckout,
        getPlanPrices,
        plans
    };
};
