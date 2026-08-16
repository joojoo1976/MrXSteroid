import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Zap, AlertTriangle, ArrowRight, Monitor, Package, Crown } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useRegion } from '../../context/RegionContext';
import { ContentStrings, PricingTier } from '@/shared/types/types';
import { usePricing } from '../calculator/hooks/usePricing';

/** Map internal plan IDs to Paymob product IDs for the quick-buy modal */
const PLAN_TO_PAYMOB_PRODUCT: Record<string, number> = {
    digital:  308488,  // البروتوكول الرقمي — 499 EGP
    bundle:   308489,  // الباقة التكتيكية — 749 EGP
    coaching: 308490,  // المحترف الذكي  — 849 EGP
};

interface PricingSectionProps {
    content: ContentStrings;
    openCheckout: (tier: PricingTier) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ content, openCheckout }) => {
    const { t, isRTL } = usePreferences();
    const { isEgypt } = useRegion();

    // --- الإعدادات الافتراضية حسب اللغة ---
    // عربية (isRTL) => داخل مصر + جنيه مصري + كتاب عربي
    // إنجليزية (!isRTL) => خارج مصر + دولار + كتاب إنجليزي
    const [selectedLocation, setSelectedLocation] = React.useState<'EG' | 'GLOBAL'>(isRTL ? 'EG' : 'GLOBAL');
    const [bookLanguage, setBookLanguage] = React.useState<'ar' | 'en'>(isRTL ? 'ar' : 'en');
    const [hasManuallySetLocation, setHasManuallySetLocation] = React.useState(false);

    // إذا لم يحدد المستخدم يدوياً، نطبق منطق اللغة/الموقع الجغرافي التلقائي
    React.useEffect(() => {
        if (!hasManuallySetLocation) {
            if (isRTL) {
                setSelectedLocation('EG');
                setBookLanguage('ar');
            } else {
                // في اللغة الإنجليزية: نضع مصر فقط لو الموقع الجغرافي مصر بالفعل
                if (isEgypt) {
                    setSelectedLocation('EG');
                } else {
                    setSelectedLocation('GLOBAL');
                }
                setBookLanguage('en');
            }
        }
    }, [isRTL, isEgypt, hasManuallySetLocation]);

    const {
        isCoachingActiveForPlan,
        toggleCoachingForPlan,
        handleCheckout,
        getPlanPrices,
        plans
    } = usePricing({ content, isRTL, openCheckout, selectedLocation, bookLanguage });

    const formatPriceWithLocation = (amount: number) => {
        if (selectedLocation === 'EG') {
            return new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP',
                currencyDisplay: 'symbol',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            currencyDisplay: 'symbol',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const coachingAddonLabel = selectedLocation === 'EG'
        ? (isRTL ? `+ 9,999 ج.م / دورة` : `+ 9,999 EGP / Cycle`)
        : `+ $200.00 / Cycle`;

    return (
        <section className="py-12 relative overflow-hidden bg-black" id="pricing">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-fixed opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* عنوان القسم */}
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

                {/* لوحة اختيار المنطقة واللغة */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-lg mx-auto mb-12 p-4 bg-zinc-900/70 border border-zinc-800 rounded-3xl backdrop-blur-md shadow-[0_0_60px_rgba(0,0,0,0.6)] space-y-4"
                >
                    {/* محدد الموقع الجغرافي */}
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 px-1 block">
                            {isRTL ? "📍 موقع الدفع والتسعير" : "📍 Payment Region & Pricing"}
                        </span>
                        <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/50 rounded-2xl border border-zinc-800/60">
                            <button
                                onClick={() => { setSelectedLocation('EG'); setHasManuallySetLocation(true); }}
                                className={`py-3 px-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                                    selectedLocation === 'EG'
                                        ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/30 scale-[1.03]'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span className="text-lg">🇪🇬</span>
                                <span>{isRTL ? "داخل مصر (ج.م)" : "Inside Egypt (EGP)"}</span>
                            </button>
                            <button
                                onClick={() => { setSelectedLocation('GLOBAL'); setHasManuallySetLocation(true); }}
                                className={`py-3 px-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                                    selectedLocation === 'GLOBAL'
                                        ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/30 scale-[1.03]'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span className="text-lg">🌐</span>
                                <span>{isRTL ? "خارج مصر / العالم ($)" : "Outside Egypt / Global ($)"}</span>
                            </button>
                        </div>
                    </div>

                    {/* محدد لغة الكتاب */}
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 px-1 block">
                            {isRTL ? "📚 لغة نسخة الكتاب المفضلة" : "📚 Preferred Book Language Edition"}
                        </span>
                        <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/50 rounded-2xl border border-zinc-800/60">
                            <button
                                onClick={() => setBookLanguage('ar')}
                                className={`py-3 px-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                                    bookLanguage === 'ar'
                                        ? 'bg-white text-black shadow-lg shadow-white/20 scale-[1.03]'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span className="text-lg">🇸🇦</span>
                                <span>{isRTL ? "العربية" : "Arabic Edition"}</span>
                            </button>
                            <button
                                onClick={() => setBookLanguage('en')}
                                className={`py-3 px-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                                    bookLanguage === 'en'
                                        ? 'bg-white text-black shadow-lg shadow-white/20 scale-[1.03]'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span className="text-lg">🇬🇧</span>
                                <span>{isRTL ? "الإنجليزية" : "English Edition"}</span>
                            </button>
                        </div>
                    </div>

                    {/* تنبيه الشحن داخل مصر */}
                    {selectedLocation === 'EG' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-[10px] font-bold leading-relaxed"
                        >
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>
                                {isRTL
                                    ? "شركات الشحن المسؤولة عن توصيل الكتاب تعمل داخل حدود جمهورية مصر العربية فقط. لا تنطبق هذه الشروط على النسخ الرقمية (الديجيتال)."
                                    : "Shipping carriers operate within Egypt only. This does not apply to digital editions which are delivered instantly worldwide."
                                }
                            </span>
                        </motion.div>
                    )}
                </motion.div>

                {/* بطاقات الباقات */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {plans.map((plan) => {
                        const planCoachingActive = isCoachingActiveForPlan(plan.id);
                        const isPopular = plan.id === 'bundle';

                        const { grandTotal, originalPrice } = getPlanPrices(plan.id);

                        const config = {
                            color: plan.id === 'bundle' ? 'gold' : plan.id === 'coaching' ? 'emerald' : 'zinc',
                            icon: plan.id === 'bundle' ? Package : plan.id === 'coaching' ? Crown : Monitor
                        };

                        return (
                            <motion.div
                                key={plan.id}
                                layout
                                onClick={() => handleCheckout(plan.id as import('@/shared/types/types').ProductVariant)}
                                className={`
                                    relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col group cursor-pointer
                                    ${isPopular
                                        ? 'bg-zinc-900/80 border-gold-500 shadow-[0_0_40px_rgba(234,179,8,0.15)] scale-105 z-20'
                                        : 'bg-black/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'
                                    }
                                `}
                            >
                                {/* شارة الأفضل قيمة */}
                                {isPopular && (
                                    <div className="absolute -top-4 start-1/2 -translate-x-1/2 px-6 py-1.5 bg-gold-500 text-black font-black text-xs uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap">
                                        <Star className="w-3 h-3 fill-black" /> {content.pricingBestValue}
                                    </div>
                                )}

                                {/* رأس البطاقة */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${
                                            config.color === 'gold' ? 'from-gold-400 to-amber-600'
                                            : config.color === 'emerald' ? 'from-emerald-500 to-green-600'
                                            : 'from-zinc-700 to-zinc-900 shadow-lg'
                                        }`}>
                                            <config.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-1">
                                                {plan.name}
                                            </h3>
                                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                                                {config.color === 'gold'
                                                    ? (isRTL ? '⭐ أفضل قيمة' : '⭐ Best Value')
                                                    : (isRTL ? 'وصول أساسي' : 'Standard Access')
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-400 font-bold leading-tight">{plan.description}</p>
                                </div>

                                {/* بطاقة السعر */}
                                <div className="mb-5 p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group/price">
                                    <div className="absolute top-0 end-0 w-16 h-16 bg-white/5 rounded-bl-full group-hover:bg-white/10 transition-colors"></div>
                                    <div className="flex items-baseline gap-2 relative z-10">
                                        <span className={`text-4xl font-black tracking-tighter ${config.color === 'gold' ? 'text-gold-500' : 'text-white'}`}>
                                            {formatPriceWithLocation(grandTotal)}
                                        </span>
                                        <span className="text-xs text-zinc-500 line-through font-bold opacity-50">
                                            {formatPriceWithLocation(originalPrice)}
                                        </span>
                                    </div>
                                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mt-1 opacity-70">
                                        {selectedLocation === 'EG'
                                            ? (isRTL ? '✓ الدفع بالجنيه المصري' : '✓ Billed in EGP')
                                            : '✓ ' + content.pricingBilledInUsd
                                        }
                                    </div>
                                </div>

                                {/* خيار إضافة التدريب الشخصي (لكل الباقات الثلاث) */}
                                <div 
                                    onClick={(e) => e.stopPropagation()}
                                    className="mb-5 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 relative group-hover:border-emerald-500/20 transition-all cursor-default"
                                >
                                    <label
                                        className="flex items-center justify-between p-3 cursor-pointer group/label select-none"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                                planCoachingActive
                                                    ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20'
                                                    : 'border-zinc-700 group-hover/label:border-zinc-600'
                                            }`}>
                                                {planCoachingActive && <Check className="w-4 h-4 text-black" />}
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-0.5">
                                                    {isRTL ? "إضافة تدريب شخصي أونلاين" : "Add 1-on-1 Online Coaching"}
                                                </div>
                                                <div className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.15em]">
                                                    {coachingAddonLabel}
                                                </div>
                                            </div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={planCoachingActive} 
                                            onChange={() => toggleCoachingForPlan(plan.id)} 
                                        />
                                    </label>

                                    <AnimatePresence>
                                        {planCoachingActive && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-3 pb-3 text-[10px] text-zinc-400 font-bold leading-relaxed border-t border-zinc-800/80 pt-3">
                                                    <div className="flex items-center gap-2 mb-2 text-emerald-400 font-black uppercase tracking-widest text-[9px]">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        {content.pricingRequiresStats}
                                                    </div>
                                                    <p className="text-zinc-500">{content.pricingCoachingUnlock}</p>
                                                    <div className="mt-2 pt-2 border-t border-zinc-800/50">
                                                        {(plan.upsellFeatures || [
                                                            isRTL ? "🏋️ تدريب شخصي 1-على-1 (دورة كاملة)" : "🏋️ 1-on-1 Cycle Coaching (1 Full Cycle)",
                                                            isRTL ? "🔬 تحليل تحاليل الدم" : "🔬 Full Bloodwork Analysis",
                                                            isRTL ? "💉 بروتوكول PCT مخصص" : "💉 Custom PCT Protocol Design"
                                                        ]).map((feat: string, i: number) => (
                                                            <div key={i} className="flex items-center gap-2 text-emerald-400 font-black mb-1">
                                                                <Zap className="w-2.5 h-2.5 fill-current shrink-0" />
                                                                <span className="text-[10px]">{feat}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* قائمة المميزات */}
                                <div className="space-y-2.5 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-2.5 group/feat">
                                            <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                                config.color === 'gold' ? 'bg-gold-500/10 text-gold-500' : 'bg-zinc-800 text-zinc-500'
                                            }`}>
                                                <Check className="w-2.5 h-2.5" />
                                            </div>
                                            <span className="text-xs text-zinc-400 font-bold tracking-tight group-hover/feat:text-white transition-colors leading-snug">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* زر الدفع الرئيسي */}
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCheckout(plan.id as import('@/shared/types/types').ProductVariant);
                                    }}
                                    className={`
                                        w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn shadow-xl
                                        ${isPopular
                                            ? 'bg-gold-500 text-black hover:bg-gold-400 shadow-gold-500/20'
                                            : planCoachingActive
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'
                                                : 'bg-white text-black hover:bg-zinc-200'
                                        }
                                    `}
                                >
                                    {plan.cta}
                                    <ArrowRight className={`w-4 h-4 group-hover/btn:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                                </motion.button>

                                {/* 🇪🇬 زر الدفع السريع عبر Paymob — يظهر فقط لمستخدمي مصر */}
                                {selectedLocation === 'EG' && !planCoachingActive && PLAN_TO_PAYMOB_PRODUCT[plan.id] && (
                                    <motion.button
                                        type="button"
                                        id={`paymob-quick-buy-${plan.id}`}
                                        whileHover={{ scale: 1.015 }}
                                        whileTap={{ scale: 0.975 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.dispatchEvent(new CustomEvent('mrx_open_paymob', {
                                                detail: { productId: PLAN_TO_PAYMOB_PRODUCT[plan.id] }
                                            }));
                                        }}
                                        className="w-full py-3 rounded-xl font-black text-[11px] tracking-widest uppercase border border-amber-500/40 text-amber-400 bg-amber-500/8 hover:bg-amber-500/15 hover:border-amber-500/70 transition-all flex items-center justify-center gap-2 mt-2"
                                    >
                                        <Zap className="w-3.5 h-3.5 fill-current" />
                                        {isRTL ? '⚡ دفع سريع عبر Paymob' : '⚡ Quick Pay via Paymob'}
                                    </motion.button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
