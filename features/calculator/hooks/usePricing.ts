'use client';

import { useState, useCallback } from 'react';
import { ContentStrings, PricingTier, ProductVariant } from '@/shared/types/types';

import { EGP_PRICES, COACHING_ADDON_EGP, COACHING_ADDON_USD } from '../../../shared/lib/logic';
import { getOriginalAmount, getTierPrice } from '../../../server/payments/pricing';

interface UsePricingOptions {
    content: ContentStrings;
    isRTL: boolean;
    openCheckout: (tier: PricingTier) => void;
    selectedLocation: 'EG' | 'GLOBAL';
    bookLanguage: 'en' | 'ar';
}

export const BASE_PRICES: Record<string, number> = {
    'digital': getTierPrice('digital', 'USD'),
    'bundle': getTierPrice('bundle', 'USD'),
    'coaching': getTierPrice('coaching', 'USD')
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
            finalPrice = EGP_PRICES[planId] || EGP_PRICES['coaching'];
            if (coachingIsActive) finalPrice += coachingAddon;
        } else {
            finalPrice = BASE_PRICES[planId] || 0;
            if (coachingIsActive) finalPrice += coachingAddon;
        }

        if (coachingIsActive) {
            finalTierId = (planId + '_plus') as ProductVariant;
        }

        const egpPrice = (EGP_PRICES[planId] || EGP_PRICES['coaching']) + (coachingIsActive ? COACHING_ADDON_EGP : 0);
        const usdPrice = (BASE_PRICES[planId] || 0) + (coachingIsActive ? COACHING_ADDON_USD : 0);

        // Original amount = Σ original line items (base list price + add-on).
        // No multiplier and no aggregate literal: `coaching_plus` is 949 + 9,999.
        const originalPrice = getOriginalAmount(
            finalTierId,
            selectedLocation === 'EG' ? 'EGP' : 'USD'
        ) ?? finalPrice;
        const originalPriceStr = String(originalPrice);

        const tierData: PricingTier = {
            id: finalTierId,
            name: plan.name + (coachingIsActive ? (selectedLocation === 'EG' ? ' + تدريب شخصي' : ' + Coaching') : ''),
            price: finalPrice,
            egpPrice,
            usdPrice,
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

        const basePrice = selectedLocation === 'EG'
            ? (EGP_PRICES[planId] || EGP_PRICES['coaching'])
            : (BASE_PRICES[planId] || 0);
        const grandTotal = basePrice + (coachingIsActive ? coachingAddon : 0);
        const originalTierId = coachingIsActive ? `${planId}_plus` : planId;
        const originalPrice = getOriginalAmount(
            originalTierId,
            selectedLocation === 'EG' ? 'EGP' : 'USD'
        ) ?? grandTotal;
        return { grandTotal, originalPrice };
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
