import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Zap, Shield, Trophy, BookOpen, User, ArrowRight, Info, AlertTriangle, Monitor, Package, Crown } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import { useUnitSystem } from '../context/UnitContext';
import { ContentStrings, Language, Currency, PricingTier, ProductVariant } from '../types';
import { UnitToggle } from './UnitToggle';

interface PricingSectionProps {
    content: ContentStrings;
    currency: Currency;
    locale: string;
    openCheckout: (tier: PricingTier) => void;
    isRTL: boolean;
}

const PricingSection: React.FC<PricingSectionProps> = ({ content, currency, locale, openCheckout, isRTL }) => {
    const { formatPrice } = useCurrency();
    const { unitSystem } = useUnitSystem();

    const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>(isRTL ? 'ar' : 'en');
    const [isCoachingActive, setIsCoachingActive] = useState(false);
    const [hoveredTier, setHoveredTier] = useState<number | null>(null);

    const plans = [
        {
            id: 1,
            variant: 'digital' as ProductVariant,
            name: "Digital Protocol",
            price: 49.99,
            originalPrice: 72.00,
            description: "Immediate Access. Zero Friction.",
            features: ["eBook (PDF/EPUB)", "Instant Delivery", "Basic Cycle Templates"],
            icon: Monitor,
            color: "zinc",
            cta: "Instant Access",
            popular: false
        },
        {
            id: 2,
            variant: 'bundle' as ProductVariant,
            name: "Tactical Bundle",
            price: 72.00,
            originalPrice: 142.00,
            description: "Maximum Value. The Complete Arsenal.",
            features: ["Glossy Paperback", "Digital Copy Included", "Bonus: Audiobook", "Home Workout PDF", "Free Shipping"],
            icon: Package,
            color: "gold",
            cta: "Get The Bundle",
            popular: true
        },
        {
            id: 3,
            variant: 'coaching' as ProductVariant,
            name: "Smart Professional",
            price: 82.00, // Anchor Price
            originalPrice: 180.00,
            description: "Elite Status. Full Optimization.",
            features: ["Hardcover Premium Edition", "VIP Community Access", "Priority Global Shipping", "Safe Exit Protocol"],
            upsellFeatures: ["1-on-1 Cycle Coaching (1 Full Cycle)", "Bloodwork Analysis", "Custom PCT Protocol"],
            icon: Crown,
            color: "red",
            cta: isCoachingActive ? "Join Elite Coaching" : "Get Pro Edition",
            popular: false
        }
    ];

    const handleCheckout = (planId: number) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        let finalPrice = plan.price;
        let finalTierId = plan.variant; // Now correctly typed as ProductVariant

        // Coaching Logic (Tier 3 Upsell)
        if (planId === 3 && isCoachingActive) {
            finalPrice += 200;
            finalTierId = 'coaching_plus'; // Internal ID for checkout handling
        }

        const tierData: PricingTier = {
            id: finalTierId,
            name: plan.name + (planId === 3 && isCoachingActive ? " + Coaching" : ""),
            price: finalPrice,
            originalPrice: ((planId === 3) && isCoachingActive ? plan.originalPrice + 200 : plan.originalPrice).toFixed(2),
            description: plan.description,
            features: plan.features,
            buttonText: plan.cta,
            isPopular: plan.popular,
            selectedLanguage: selectedLanguage,
            requiresShipping: planId !== 1, // Digital doesn't ship
            requiresBodyStats: planId === 3 && isCoachingActive, // Only coaching needs stats
            includesEbook: true, // All plans have eBook
            includesAudiobook: planId >= 2, // Bundle & Pro have Audio
            includesCoaching: planId === 3 && isCoachingActive
        };

        openCheckout(tierData);
    };

    return (
        <section className="py-24 relative overflow-hidden bg-black" id="pricing">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-fixed opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 font-black uppercase tracking-widest text-xs"
                    >
                        <Zap className="w-4 h-4 fill-current" /> Initialize Protocol
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-amber-600">Weapon</span>
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto font-medium text-lg">
                        Select the tier that matches your ambition. All plans include the core Mr. X methodology.
                    </p>

                    {/* Language Selector */}
                    <div className="flex justify-center mt-8">
                        <div className="bg-zinc-900 border border-zinc-700 p-1.5 rounded-xl inline-flex gap-1 relative">
                            <div className={`absolute inset-y-1.5 w-1/2 bg-zinc-700 rounded-lg transition-all duration-300 ${selectedLanguage === 'ar' ? 'right-1.5' : 'left-1.5'}`} />
                            <button
                                onClick={() => setSelectedLanguage('en')}
                                className={`relative z-10 px-6 py-2 rounded-lg text-sm font-black uppercase transition-colors ${selectedLanguage === 'en' ? 'text-white' : 'text-zinc-400'}`}
                            >
                                English Book
                            </button>
                            <button
                                onClick={() => setSelectedLanguage('ar')}
                                className={`relative z-10 px-6 py-2 rounded-lg text-sm font-black uppercase transition-colors ${selectedLanguage === 'ar' ? 'text-white' : 'text-zinc-400'}`}
                            >
                                كتاب عربي
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan) => {
                        const isSelected = hoveredTier === plan.id;
                        const isTier3 = plan.id === 3;
                        const grandTotal = isTier3 && isCoachingActive ? plan.price + 200 : plan.price;

                        return (
                            <motion.div
                                key={plan.id}
                                onHoverStart={() => setHoveredTier(plan.id)}
                                onHoverEnd={() => setHoveredTier(null)}
                                className={`
                            relative p-8 rounded-[2rem] border-2 transition-all duration-300 flex flex-col group
                            ${plan.popular ? 'bg-zinc-900/80 border-gold-500 shadow-[0_0_40px_rgba(234,179,8,0.15)] scale-105 z-20' : 'bg-black/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'}
                        `}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gold-500 text-black font-black text-xs uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2">
                                        <Star className="w-3 h-3 fill-black" /> Best Value
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 font-black text-white text-2xl bg-gradient-to-br ${plan.color === 'gold' ? 'from-gold-400 to-amber-600' : plan.color === 'red' ? 'from-red-500 to-rose-700' : 'from-zinc-700 to-zinc-900'}`}>
                                        <plan.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">{plan.name}</h3>
                                    <p className="text-zinc-400 text-sm font-medium">{plan.description}</p>
                                </div>

                                <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-4xl font-black tracking-tighter ${plan.color === 'gold' ? 'text-gold-500' : 'text-white'}`}>
                                            {formatPrice(grandTotal)}
                                        </span>
                                        <span className="text-zinc-500 line-through font-bold text-sm">
                                            {formatPrice(isTier3 && isCoachingActive ? plan.originalPrice + 200 : plan.originalPrice)}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-1">Billed in USD</div>
                                </div>

                                {/* Tier 3: Coaching Upsell Toggle */}
                                {isTier3 && (
                                    <div className="mb-6 p-1 bg-zinc-800 rounded-xl">
                                        <label className="flex items-center justify-between p-3 cursor-pointer group/label">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isCoachingActive ? 'bg-red-500 border-red-500' : 'border-zinc-500'}`}>
                                                    {isCoachingActive && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-white uppercase tracking-wider">Add Coaching</div>
                                                    <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">+ $200.00 / Cycle</div>
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
                                                        <div className="flex items-center gap-2 mb-2 text-red-400 font-bold">
                                                            <AlertTriangle className="w-3 h-3" /> Requires Body Stats
                                                        </div>
                                                        Unlocks 1-on-1 analysis of bloodwork, diet, and compound titration.
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                <div className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <Check className={`w-4 h-4 mt-0.5 ${plan.color === 'gold' ? 'text-gold-500' : 'text-zinc-500'}`} />
                                            <span className="text-sm text-zinc-300 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                    {isTier3 && isCoachingActive && plan.upsellFeatures?.map((feature, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={`upsell-${i}`}
                                            className="flex items-start gap-3"
                                        >
                                            <Zap className="w-4 h-4 mt-0.5 text-red-500 fill-red-500/20" />
                                            <span className="text-sm text-white font-bold">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleCheckout(plan.id)}
                                    className={`
                                w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 group/btn
                                ${plan.popular
                                            ? 'bg-gold-500 text-black hover:bg-gold-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                                            : plan.color === 'red' && isCoachingActive
                                                ? 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                                                : 'bg-white text-black hover:bg-zinc-200'
                                        }
                            `}
                                >
                                    {plan.cta} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
