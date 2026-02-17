import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Zap, AlertTriangle, ArrowRight, Monitor, Package, Crown } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { ContentStrings, PricingTier } from '../../types';
import { usePricing } from '../calculator/hooks/usePricing';

interface PricingSectionProps {
    content: ContentStrings;
    openCheckout: (tier: PricingTier) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ content, openCheckout }) => {
    const { formatPrice, t, isRTL } = usePreferences();

    const {
        isCoachingActive,
        setIsCoachingActive,
        handleCheckout,
        getPlanPrices,
        plans
    } = usePricing({ content, isRTL, openCheckout });

    return (
        <section className="py-12 relative overflow-hidden bg-black" id="pricing">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-fixed opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-8 space-y-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 font-black uppercase tracking-widest text-xs"
                    >
                        <Zap className="w-4 h-4 fill-current" /> {content.pricingInitialize}
                    </motion.div>
                    <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">
                        {t('pricingTitle')}
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto font-medium text-base">
                        {t('pricingSubtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {plans.map((plan) => {
                        const isCoachingTier = plan.id === 'coaching';
                        const isPopular = plan.id === 'bundle';

                        const { grandTotal, originalPrice } = getPlanPrices(plan.id);

                        const config = {
                            color: plan.id === 'bundle' ? 'gold' : plan.id === 'coaching' ? 'emerald' : 'zinc',
                            icon: plan.id === 'bundle' ? Package : plan.id === 'coaching' ? Crown : Monitor
                        };

                        return (
                            <motion.div
                                key={plan.id}
                                className={`
                                    relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col group
                                    ${isPopular ? 'bg-zinc-900/80 border-gold-500 shadow-[0_0_40px_rgba(234,179,8,0.15)] scale-105 z-20' : 'bg-black/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'}
                                `}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 start-1/2 -translate-x-1/2 px-6 py-1.5 bg-gold-500 text-black font-black text-xs uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2">
                                        <Star className="w-3 h-3 fill-black" /> {content.pricingBestValue}
                                    </div>
                                )}

                                <div className="mb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${config.color === 'gold' ? 'from-gold-400 to-amber-600' : config.color === 'emerald' ? 'from-emerald-500 to-green-600' : 'from-zinc-700 to-zinc-900 shadow-lg'}`}>
                                            <config.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-1">{plan.name}</h3>
                                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{config.color === 'gold' ? content.pricingBestValue : 'Standard Access'}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-400 font-bold leading-tight line-clamp-2">{plan.description}</p>
                                </div>

                                <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group/price">
                                    <div className="absolute top-0 end-0 w-16 h-16 bg-white/5 rounded-bl-full group-hover:bg-white/10 transition-colors"></div>
                                    <div className="flex items-baseline gap-2 relative z-10">
                                        <span className={`text-4xl font-black tracking-tighter ${config.color === 'gold' ? 'text-gold-500' : 'text-white'}`}>
                                            {formatPrice(grandTotal)}
                                        </span>
                                        <span className="text-xs text-zinc-500 line-through font-bold opacity-50">
                                            {formatPrice(originalPrice)}
                                        </span>
                                    </div>
                                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mt-1 opacity-60">{content.pricingBilledInUsd}</div>
                                </div>

                                {isCoachingTier && (
                                    <div className="mb-6 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 relative group-hover:border-emerald-500/30 transition-all">
                                        <label className="flex items-center justify-between p-3 cursor-pointer group/label">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isCoachingActive ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20' : 'border-zinc-700'}`}>
                                                    {isCoachingActive && <Check className="w-4 h-4 text-black" />}
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-0.5">{content.pricingAddCoaching}</div>
                                                    <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.2em]">{content.pricingCoachingRate}</div>
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
                                                    <div className="p-3 pt-0 text-[10px] text-zinc-500 font-bold leading-relaxed border-t border-zinc-800/80 mt-1 pt-3">
                                                        <div className="flex items-center gap-2 mb-1.5 text-emerald-500 font-black uppercase tracking-widest">
                                                            <AlertTriangle className="w-3 h-3" /> {content.pricingRequiresStats}
                                                        </div>
                                                        {content.pricingCoachingUnlock}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                <div className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 group/feat">
                                            <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${config.color === 'gold' ? 'bg-gold-500/10 text-gold-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                                <Check className="w-2.5 h-2.5" />
                                            </div>
                                            <span className="text-xs text-zinc-400 font-black tracking-tight group-hover/feat:text-white transition-colors">{feature}</span>
                                        </div>
                                    ))}
                                    {isCoachingTier && isCoachingActive && plan.upsellFeatures?.map((feature: string, i: number) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={`upsell-${i}`}
                                            className="flex items-start gap-3"
                                        >
                                            <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                                <Zap className="w-2.5 h-2.5 fill-current" />
                                            </div>
                                            <span className="text-xs text-white font-black">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleCheckout(plan.id)}
                                    className={`
                                        w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn shadow-xl
                                        ${isPopular
                                            ? 'bg-gold-500 text-black hover:bg-gold-400 shadow-gold-500/20'
                                            : isCoachingTier && isCoachingActive
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'
                                                : 'bg-white text-black hover:bg-zinc-200'}
                                    `}
                                >
                                    {plan.cta} <ArrowRight className={`w-4 h-4 group-hover/btn:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
