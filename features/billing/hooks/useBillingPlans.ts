'use client';

import { useState, useCallback, useMemo } from 'react';
import { BillingPlanDefinition, RegionalMarket, SupportedLocale, PlanTierId } from '../types/billing.types';
import { BILLING_PLANS, REGIONAL_CONFIG } from '../config/pricing.config';
import { PricingTier, ProductVariant } from '@/shared/types/types';

interface UseBillingPlansOptions {
    initialMarket?: RegionalMarket;
    locale?: SupportedLocale;
    onSelectTier?: (tier: PricingTier) => void;
}

export function useBillingPlans({
    initialMarket = 'EG',
    locale = 'ar',
    onSelectTier
}: UseBillingPlansOptions = {}) {
    const [market, setMarket] = useState<RegionalMarket>(initialMarket);
    const [coachingMap, setCoachingMap] = useState<Record<string, boolean>>({});

    const isRTL = locale === 'ar';
    const currency = market === 'EG' ? 'EGP' : 'USD';
    const currencySymbol = REGIONAL_CONFIG[market].currencySymbol;

    const toggleCoaching = useCallback((planId: string) => {
        setCoachingMap(prev => ({
            ...prev,
            [planId]: !prev[planId]
        }));
    }, []);

    const isCoachingSelected = useCallback((planId: string) => {
        return Boolean(coachingMap[planId]);
    }, [coachingMap]);

    const getPlanCalculatedPrice = useCallback((plan: BillingPlanDefinition) => {
        const base = plan.prices[currency].current;
        const originalBase = plan.prices[currency].original;
        const hasCoaching = Boolean(coachingMap[plan.id]);
        const addon = hasCoaching ? plan.coachingAddon[currency] : 0;

        return {
            current: base + addon,
            original: originalBase + (hasCoaching ? addon * 1.2 : 0),
            hasCoaching,
            currency,
            currencySymbol
        };
    }, [currency, currencySymbol, coachingMap]);

    const handlePlanSelect = useCallback((plan: BillingPlanDefinition) => {
        const pricing = getPlanCalculatedPrice(plan);
        const hasCoaching = pricing.hasCoaching;
        const finalTierId = (hasCoaching ? `${plan.id}_plus` : plan.id) as ProductVariant;

        const tierPayload: PricingTier = {
            id: finalTierId,
            name: (isRTL ? plan.nameAr : plan.nameEn) + (hasCoaching ? (isRTL ? ' + تدريب خاص' : ' + Coaching') : ''),
            price: pricing.current,
            originalPrice: String(Math.round(pricing.original)),
            description: isRTL ? plan.descriptionAr : plan.descriptionEn,
            features: isRTL ? plan.featuresAr : plan.featuresEn,
            buttonText: isRTL ? plan.ctaAr : plan.ctaEn,
            isPopular: Boolean(plan.isPopular),
            selectedLanguage: isRTL ? 'ar' : 'en',
            selectedLocation: market,
            requiresShipping: plan.requiresShipping,
            requiresBodyStats: plan.requiresBodyStats || hasCoaching,
            includesEbook: true,
            includesAudiobook: plan.id !== 'digital',
            includesCoaching: hasCoaching
        };

        if (onSelectTier) {
            onSelectTier(tierPayload);
        }
    }, [getPlanCalculatedPrice, isRTL, market, onSelectTier]);

    return {
        plans: BILLING_PLANS,
        market,
        setMarket,
        currency,
        currencySymbol,
        isRTL,
        toggleCoaching,
        isCoachingSelected,
        getPlanCalculatedPrice,
        handlePlanSelect
    };
}
