import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Zap, AlertTriangle, ArrowRight, Monitor, Package, Crown } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { ContentStrings, PricingTier, ProductVariant } from '../../types';

interface PricingSectionProps {
    content: ContentStrings;
    openCheckout: (tier: PricingTier) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ content, openCheckout }) => {
    const { formatPrice, t, isRTL } = usePreferences();
    const [isCoachingActive, setIsCoachingActive] = useState(false);

    const plans = content.pricingPlans;

    const basePrices: Record<string, number> = {
        'digital': 49.99,
        'bundle': 72.00,
        'coaching': 82.00
    };

    const handleCheckout = (planId: ProductVariant) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        let finalPrice = basePrices[planId] || 0;
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
    };

    return (
        <section className="py-24 relative overflow-hidden bg-black" id="pricing">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-fixed opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 font-black uppercase tracking-widest text-xs"
                    >
                        <Zap className="w-4 h-4 fill-current" /> {content.pricingInitialize}
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
                        {t('pricingTitle')}
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto font-medium text-lg">
                        {t('pricingSubtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan) => {
                        const isCoachingTier = plan.id === 'coaching';
                        const isPopular = plan.id === 'bundle';
                        const basePrice = basePrices[plan.id] || 0;
                        const grandTotal = isCoachingTier && isCoachingActive ? basePrice + 200 : basePrice;
                        const originalPrice = isCoachingTier && isCoachingActive ? grandTotal * 1.5 : basePrice * 1.4;

                        const config = {
                            color: plan.id === 'bundle' ? 'gold' : plan.id === 'coaching' ? 'emerald' : 'zinc',
                            icon: plan.id === 'bundle' ? Package : plan.id === 'coaching' ? Crown : Monitor
                        };

                        return (
                            <motion.div
                                key={plan.id}
                                className={`
                                    relative p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col group
                                    ${isPopular ? 'bg-zinc-900/80 border-gold-500 shadow-[0_0_40px_rgba(234,179,8,0.15)] scale-105 z-20' : 'bg-black/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'}
                                `}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 start-1/2 -translate-x-1/2 px-6 py-1.5 bg-gold-500 text-black font-black text-xs uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2">
                                        <Star className="w-3 h-3 fill-black" /> {content.pricingBestValue}
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl flex-shrink-0 bg-gradient-to-br ${config.color === 'gold' ? 'from-gold-400 to-amber-600' : config.color === 'emerald' ? 'from-emerald-500 to-green-600' : 'from-zinc-700 to-zinc-900'}`}>
                                            <config.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-wider">{plan.name}</h3>
                                    </div>
                                    <p className="text-zinc-400 text-sm font-medium leading-normal pl-1">{plan.description}</p>
                                </div>

                                <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-3xl font-black tracking-tighter ${config.color === 'gold' ? 'text-gold-500' : 'text-white'}`}>
                                            {formatPrice(grandTotal)}
                                        </span>
                                        <span className="text-zinc-500 line-through font-bold text-xs opacity-50">
                                            {formatPrice(originalPrice)}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-1">{content.pricingBilledInUsd}</div>
                                </div>

                                {isCoachingTier && (
                                    <div className="mb-6 p-1 bg-zinc-800 rounded-xl relative group-hover:scale-[1.02] transition-transform">
                                        <label className="flex items-center justify-between p-3 cursor-pointer group/label">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isCoachingActive ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-500'}`}>
                                                    {isCoachingActive && <Check className="w-3 h-3 text-black" />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-white uppercase tracking-wider">{content.pricingAddCoaching}</div>
                                                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{content.pricingCoachingRate}</div>
                                                </div>
                                            </div>
                                            <input type="checkbox" className="hidden" checked={isCoachingActive} onChange={() => setIsCoachingActive(!isCoachingActive)} />
                                        </label>

                                        <AnimatePresence>
                                            {isCoachingActive && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-3 pt-0 text-xs text-zinc-400 font-medium leading-relaxed border-t border-zinc-700/50 mt-2 pt-2">
                                                        <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold">
                                                            <AlertTriangle className="w-3 h-3" /> {content.pricingRequiresStats}
                                                        </div>
                                                        {content.pricingCoachingUnlock}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                <div className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <Check className={`w-4 h-4 mt-0.5 ${config.color === 'gold' ? 'text-gold-500' : 'text-zinc-500'}`} />
                                            <span className="text-sm text-zinc-300 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                    {isCoachingTier && isCoachingActive && plan.upsellFeatures?.map((feature: string, i: number) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={`upsell-${i}`}
                                            className="flex items-start gap-3"
                                        >
                                            <Zap className="w-4 h-4 mt-0.5 text-emerald-500 fill-emerald-500/20" />
                                            <span className="text-sm text-white font-bold">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleCheckout(plan.id)}
                                    className={`
                                        w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 group/btn
                                        ${isPopular
                                            ? 'bg-gold-500 text-black hover:bg-gold-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                                            : isCoachingTier && isCoachingActive
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                                : 'bg-white text-black hover:bg-zinc-200'}
                                    `}
                                >
                                    {plan.cta} <ArrowRight className={`w-4 h-4 group-hover/btn:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
