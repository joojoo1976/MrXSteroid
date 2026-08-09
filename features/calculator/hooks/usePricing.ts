'use client';

import { useState, useCallback } from 'react';
import { ContentStrings, PricingTier, ProductVariant } from '@/shared/types/types';

import { EGP_PRICES, EGP_ORIGINAL_PRICES, COACHING_ADDON_EGP, COACHING_ADDON_USD } from '../../../shared/lib/logic';

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

const BASE_ORIGINAL_PRICES: Record<string, number> = {
    'digital': 69.99,
    'bundle': 100.80,
    'coaching': 114.80
};

export const usePricing = ({ content, openCheckout, selectedLocation, bookLanguage }: UsePricingOptions) => {
    // coaching checkbox is now per-plan, track by planId
    const [coachingActivePlan, setCoachingActivePlan] = useState<string | null>(null);

    const isCoachingActive = (planId: string) => coachingActivePlan === planId;
    const toggleCoaching = (planId: string) => {
        setCoachingActivePlan(prev => prev === planId ? null : planId);
    };

    // Legacy support: expose a single isCoachingActive boolean for coaching plan (backward compat)
    const isCoachingActiveLegacy = coachingActivePlan === 'coaching';
    const setIsCoachingActive = (val: boolean) => {
        setCoachingActivePlan(val ? 'coaching' : null);
    };

    const plans = content.pricingPlans;

    const getCoachingAddon = useCallback(() => {
        return selectedLocation === 'EG' ? COACHING_ADDON_EGP : COACHING_ADDON_USD;
    }, [selectedLocation]);

    const handleCheckout = useCallback((planId: ProductVariant) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        const coachingIsActive = coachingActivePlan === planId;
        const coachingAddon = getCoachingAddon();

        let finalPrice: number;
        let finalTierId = planId;

        if (selectedLocation === 'EG') {
            finalPrice = EGP_PRICES[planId] || 849;
            if (coachingIsActive) finalPrice += coachingAddon;
        } else {
            finalPrice = BASE_PRICES[planId] || 0;
            if (coachingIsActive) finalPrice += coachingAddon;
        }

        if (coachingIsActive) {
            finalTierId = (planId + '_plus') as ProductVariant;
        }

        const originalPriceStr = selectedLocation === 'EG'
            ? String((EGP_ORIGINAL_PRICES[planId] || 949) + (coachingIsActive ? coachingAddon * 1.18 : 0))
            : String((BASE_ORIGINAL_PRICES[planId] || finalPrice * 1.4) + (coachingIsActive ? coachingAddon * 1.5 : 0));

        const tierData: PricingTier = {
            id: finalTierId,
            name: plan.name + (coachingIsActive ? (selectedLocation === 'EG' ? ' + تدريب شخصي' : ' + Coaching') : ''),
            price: finalPrice,
            originalPrice: originalPriceStr,
            description: plan.description,
            features: plan.features,
            buttonText: plan.cta,
            isPopular: plan.id === 'bundle',
            selectedLanguage: bookLanguage,
            selectedLocation: selectedLocation,
            requiresShipping: planId !== 'digital',
            requiresBodyStats: coachingIsActive,
            includesEbook: true,
            includesAudiobook: planId !== 'digital',
            includesCoaching: coachingIsActive
        };

        openCheckout(tierData);
    }, [coachingActivePlan, bookLanguage, selectedLocation, openCheckout, plans, getCoachingAddon]);

    const getPlanPrices = useCallback((planId: string) => {
        const coachingIsActive = coachingActivePlan === planId;
        const coachingAddon = getCoachingAddon();

        if (selectedLocation === 'EG') {
            const basePrice = EGP_PRICES[planId] || 849;
            const origPrice = EGP_ORIGINAL_PRICES[planId] || 949;
            const grandTotal = basePrice + (coachingIsActive ? coachingAddon : 0);
            const originalPrice = origPrice + (coachingIsActive ? Math.round(coachingAddon * 1.18) : 0);
            return { grandTotal, originalPrice };
        } else {
            const basePrice = BASE_PRICES[planId] || 0;
            const origPrice = BASE_ORIGINAL_PRICES[planId] || basePrice * 1.4;
            const grandTotal = basePrice + (coachingIsActive ? coachingAddon : 0);
            const originalPrice = origPrice + (coachingIsActive ? coachingAddon * 1.5 : 0);
            return { grandTotal, originalPrice };
        }
    }, [coachingActivePlan, selectedLocation, getCoachingAddon]);

    return {
        isCoachingActive: isCoachingActiveLegacy,
        setIsCoachingActive,
        isCoachingActiveForPlan: isCoachingActive,
        toggleCoachingForPlan: toggleCoaching,
        handleCheckout,
        getPlanPrices,
        plans
    };
};
