'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Star, ShieldCheck, Crown, ArrowRight, UserCheck } from 'lucide-react';
import { useBillingPlans } from '../hooks/useBillingPlans';
import { RegionalSelector } from './RegionalSelector';
import { RegionalMarket, SupportedLocale } from '../types/billing.types';
import { PricingTier } from '@/shared/types/types';

interface PricingGridProps {
    locale?: SupportedLocale;
    initialMarket?: RegionalMarket;
    onSelectTier: (tier: PricingTier) => void;
    title?: string;
    subtitle?: string;
}

export const PricingGrid: React.FC<PricingGridProps> = ({
    locale = 'ar',
    initialMarket = 'EG',
    onSelectTier,
    title,
    subtitle
}) => {
    const isRTL = locale === 'ar';
    const {
        plans,
        market,
        setMarket,
        currency,
        currencySymbol,
        toggleCoaching,
        isCoachingSelected,
        getPlanCalculatedPrice,
        handlePlanSelect
    } = useBillingPlans({
        initialMarket,
        locale,
        onSelectTier
    });

    const coachingAddonLabel = market === 'EG'
        ? (isRTL ? '+ 9,999 ج.م تدريب شخصي' : '+ 9,999 EGP 1-on-1 Coaching')
        : (isRTL ? '+ $200.00 تدريب شخصي' : '+ $200.00 1-on-1 Coaching');

    return (
        <section className="py-16 relative overflow-hidden bg-black" id="pricing">
            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-10 space-y-3">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 font-black uppercase tracking-widest text-xs"
                    >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{isRTL ? 'خطط واستثمار التحول الجسدي' : 'Physique Transformation Protocol Plans'}</span>
                    </motion.div>

                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
                        {title || (isRTL ? 'اختر خطتك وابدأ هندسة جسمك' : 'Choose Your Protocol Tier')}
                    </h2>

                    <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base font-medium">
                        {subtitle || (isRTL ? 'نموذج بيولوجي متقدم، شفافية كاملة، وضمان 100% لاسترداد الأموال خلال 48 ساعة.' : 'Precision biology model, full transparency, and a 48-hour zero-risk money-back guarantee.')}
                    </p>

                    {/* Regional Switcher */}
                    <div className="pt-4 flex justify-center">
                        <RegionalSelector
                            currentMarket={market}
                            onMarketChange={setMarket}
                            isRTL={isRTL}
                        />
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, index) => {
                        const pricing = getPlanCalculatedPrice(plan);
                        const hasCoaching = isCoachingSelected(plan.id);
                        const isPopular = Boolean(plan.isPopular);

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                className={`relative flex flex-col justify-between rounded-3xl p-6 md:p-8 transition-all ${
                                    isPopular
                                        ? 'bg-zinc-900/90 border-2 border-gold-500 shadow-2xl shadow-gold-500/15 md:-translate-y-2'
                                        : 'bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700'
                                }`}
                            >
                                {/* Popular Badge */}
                                {plan.badgeAr && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-gold-500 to-amber-500 text-black font-black text-[11px] uppercase tracking-widest shadow-md">
                                        {isRTL ? plan.badgeAr : plan.badgeEn}
                                    </div>
                                )}

                                <div>
                                    {/* Plan Title & Desc */}
                                    <div className="mb-6">
                                        <h3 className="text-xl font-black text-white">
                                            {isRTL ? plan.nameAr : plan.nameEn}
                                        </h3>
                                        <p className="text-xs text-zinc-400 mt-1 font-medium leading-relaxed">
                                            {isRTL ? plan.descriptionAr : plan.descriptionEn}
                                        </p>
                                    </div>

                                    {/* Price Display */}
                                    <div className="mb-6 pb-6 border-b border-zinc-800/80">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
                                                {pricing.current.toLocaleString(isRTL && market === 'EG' ? 'ar-EG' : 'en-US')}
                                            </span>
                                            <span className="text-sm font-bold text-gold-400">
                                                {currencySymbol}
                                            </span>
                                            {pricing.original > pricing.current && (
                                                <span className="text-sm text-zinc-500 line-through font-mono">
                                                    {pricing.original.toLocaleString(isRTL && market === 'EG' ? 'ar-EG' : 'en-US')} {currencySymbol}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mt-1">
                                            {isRTL ? 'دفعة واحدة — وصول دائم' : 'One-time investment — lifetime updates'}
                                        </span>
                                    </div>

                                    {/* Coaching Addon Toggle */}
                                    <div
                                        onClick={() => toggleCoaching(plan.id)}
                                        className={`mb-6 p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                                            hasCoaching
                                                ? 'bg-gold-500/10 border-gold-500/50 text-gold-400'
                                                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <UserCheck className="w-4 h-4" />
                                            <span className="text-xs font-black">
                                                {coachingAddonLabel}
                                            </span>
                                        </div>
                                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                            hasCoaching ? 'bg-gold-500 border-gold-500 text-black' : 'border-zinc-600'
                                        }`}>
                                            {hasCoaching && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                    </div>

                                    {/* Features list */}
                                    <div className="space-y-3 mb-8">
                                        {(isRTL ? plan.featuresAr : plan.featuresEn).map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                                                <div className="w-4 h-4 rounded-full bg-gold-500/15 text-gold-400 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                </div>
                                                <span className="leading-snug">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <button
                                    type="button"
                                    onClick={() => handlePlanSelect(plan)}
                                    className={`w-full py-4 px-6 rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        isPopular
                                            ? 'bg-gold-500 hover:bg-gold-400 text-black shadow-lg shadow-gold-500/25 hover:scale-[1.02]'
                                            : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 hover:border-gold-500/50'
                                    }`}
                                >
                                    <span>{isRTL ? plan.ctaAr : plan.ctaEn}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
