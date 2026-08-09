'use client';

import React from 'react';
import { Smartphone, Plus, Minus, Check, LucideIcon, Package, Crown, Globe, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../shared/lib/utils';
import { ProductVariant } from '@/shared/types/types';
import { EGP_PRICES, COACHING_ADDON_EGP, COACHING_ADDON_USD } from '../../shared/lib/logic';

// ═══════════════════════════════════════════════════════════════════════════
//  Pricing Data — mirrors PricingSection EXACTLY (same names, features, IDs)
// ═══════════════════════════════════════════════════════════════════════════

const USD_PRICES: Record<string, number> = {
    digital: 49.99,
    bundle: 72.00,
    coaching: 82.00,
};

interface VariantDef {
    id: ProductVariant;
    labelAr: string;
    labelEn: string;
    icon: LucideIcon;
    featuresAr: string[];
    featuresEn: string[];
}

const VARIANTS: VariantDef[] = [
    {
        id: 'digital',
        labelAr: 'البروتوكول الرقمي',
        labelEn: 'Digital Protocol (PDF)',
        icon: Smartphone,
        featuresAr: [
            '📖 الكتاب الإلكتروني بصيغتي PDF / EPUB',
            '⚡ تسليم فوري وتلقائي',
            '📋 القوالب الأساسية لدورة العمل (Basic Cycle Templates)',
        ],
        featuresEn: [
            '📖 eBook PDF / EPUB',
            '⚡ Instant digital delivery',
            '📋 Basic Cycle Templates',
        ],
    },
    {
        id: 'bundle',
        labelAr: 'الباقة التكتيكية',
        labelEn: 'Tactical Bundle',
        icon: Package,
        featuresAr: [
            '📚 النسخة الورقية الفاخرة (Glossy Paperback)',
            '🚚 شحن وتوصيل سريع داخل مصر',
            '🎁 هدية مجانية: النسخة الرقمية (تسليم فوري)',
            '🎧 مكافأة إضافية: النسخة الصوتية الكاملة (Audiobook)',
            '💪 مكافأة إضافية: دليل التمارين المنزلية PDF',
        ],
        featuresEn: [
            '📚 Glossy Paperback copy',
            '🚚 Fast shipping (Egypt) / Int\'l shipping available',
            '🎁 Free digital edition included',
            '🎧 Audiobook bonus',
            '💪 Home Workout Guide PDF',
        ],
    },
    {
        id: 'coaching',
        labelAr: 'المحترف الذكي',
        labelEn: 'Smart Professional (VIP)',
        icon: Crown,
        featuresAr: [
            '📗 النسخة الورقية ذات الغلاف المقوى الفاخر (Hardcover Premium)',
            '🚀 شحن ذو أولوية فائقة داخل مصر',
            '🎁 هدية مجانية: النسخة الرقمية (تسليم فوري)',
            '👑 انضمام حصري لمجتمع كبار الأعضاء (VIP Access)',
            '🛡️ بروتوكول الخروج الآمن المتكامل (Safe Exit Protocol)',
            '🎧 مكافأة إضافية: النسخة الصوتية الكاملة',
            '💪 مكافأة إضافية: دليل التمارين المنزلية PDF',
        ],
        featuresEn: [
            '📗 Hardcover Premium edition',
            '🚀 Priority shipping inside Egypt',
            '🎁 Free digital edition included',
            '👑 Exclusive VIP Community Access',
            '🛡️ Safe Exit Protocol (Full PCT)',
            '🎧 Audiobook bonus',
            '💪 Home Workout Guide PDF',
        ],
    },
];

// ═══════════════════════════════════════════════════════════════════════════
//  Component Props
// ═══════════════════════════════════════════════════════════════════════════

interface ProductSelectorProps {
    selectedVariant: ProductVariant;
    onSelectVariant: (variant: ProductVariant) => void;
    quantity: number;
    setQuantity: (q: number) => void;
    isAr: boolean;
    isEg: boolean;                          // ← new: drives EGP vs USD display
    onRegionChange?: (isEg: boolean) => void; // ← new: propagate region changes
}

// ═══════════════════════════════════════════════════════════════════════════
//  Main Component
// ═══════════════════════════════════════════════════════════════════════════

export const ProductSelector: React.FC<ProductSelectorProps> = ({
    selectedVariant,
    onSelectVariant,
    quantity,
    setQuantity,
    isAr,
    isEg,
    onRegionChange,
}) => {
    const coachingAddon = selectedVariant.endsWith('_plus');

    const handleCoachingToggle = () => {
        const baseVariant = coachingAddon
            ? selectedVariant.replace('_plus', '')
            : selectedVariant;
        onSelectVariant(
            coachingAddon
                ? (baseVariant as ProductVariant)
                : (`${baseVariant}_plus` as ProductVariant)
        );
    };

    // ── Price formatting ───────────────────────────────────────────────────
    const formatPrice = (usdAmount: number, planId: string): string => {
        if (isEg) {
            const egpAmount = EGP_PRICES[planId] ?? Math.round(usdAmount * 50);
            return new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-EG', {
                style: 'currency',
                currency: 'EGP',
                currencyDisplay: 'symbol',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(egpAmount);
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(usdAmount);
    };

    const coachingAddonAmount = isEg ? COACHING_ADDON_EGP : COACHING_ADDON_USD;
    const coachingAddonLabel = isEg
        ? (isAr ? `+ ${coachingAddonAmount.toLocaleString('ar-EG')} ج.م / دورة` : `+ ${coachingAddonAmount.toLocaleString()} EGP / Cycle`)
        : `+ $${coachingAddonAmount.toFixed(2)} / Cycle`;

    return (
        <div className="space-y-6">
            {/* ── Region Toggle ────────────────────────────────────────────── */}
            <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                    <span className="text-gold-500">01.</span>
                    {isAr ? 'حدد موقعك الجغرافي' : 'Select Your Region'}
                </h3>

                <div className="grid grid-cols-2 gap-3 p-1.5 bg-black/50 rounded-2xl border border-zinc-800/60 mb-6">
                    <button
                        type="button"
                        onClick={() => onRegionChange?.(true)}
                        className={cn(
                            'py-3 px-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2',
                            isEg
                                ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/30 scale-[1.02]'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <span className="text-lg">🇪🇬</span>
                        <span>{isAr ? 'داخل مصر (ج.م)' : 'Inside Egypt (EGP)'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onRegionChange?.(false)}
                        className={cn(
                            'py-3 px-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2',
                            !isEg
                                ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/30 scale-[1.02]'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Globe className="w-4 h-4" />
                        <span>{isAr ? 'خارج مصر / العالم ($)' : 'Outside Egypt / Global ($)'}</span>
                    </button>
                </div>
            </div>

            {/* ── Plan Cards ───────────────────────────────────────────────── */}
            <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                    <span className="text-gold-500">02.</span>
                    {isAr ? 'اختر نسختك' : 'Select Your Edition'}
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                    {VARIANTS.map((variant) => {
                        const baseSelected = selectedVariant.replace('_plus', '');
                        const isSelected = baseSelected === variant.id;
                        const isPopular = variant.id === 'bundle';
                        const Icon = variant.icon;

                        return (
                            <motion.div
                                key={variant.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                    onSelectVariant(
                                        coachingAddon
                                            ? (`${variant.id}_plus` as ProductVariant)
                                            : variant.id
                                    )
                                }
                                className={cn(
                                    'relative cursor-pointer rounded-2xl border-2 transition-all duration-300 p-5 flex flex-col h-full group overflow-hidden',
                                    isSelected
                                        ? 'bg-gradient-to-br from-gold-500/20 via-black to-black border-gold-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]'
                                        : 'bg-zinc-900/50 border-zinc-800 hover:border-gold-500/50 hover:bg-zinc-900',
                                    isPopular && !isSelected && 'border-gold-500/30'
                                )}
                            >
                                {/* Popular badge */}
                                {isPopular && (
                                    <div className="absolute -top-px start-1/2 -translate-x-1/2 px-4 py-1 bg-gold-500 text-black font-black text-[9px] uppercase tracking-widest rounded-b-xl whitespace-nowrap shadow-lg">
                                        {isAr ? '⭐ أفضل قيمة' : '⭐ Best Value'}
                                    </div>
                                )}

                                {/* Selected indicator */}
                                {isSelected && (
                                    <div className="absolute top-3 end-3 bg-gold-500 text-black rounded-full p-1 animate-in zoom-in">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={cn(
                                    'w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors',
                                    isSelected
                                        ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20'
                                        : 'bg-zinc-800 text-zinc-400 group-hover:text-white'
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                {/* Name */}
                                <h4 className={cn(
                                    'font-black text-base text-white mb-1 leading-tight tracking-tight',
                                    isSelected ? 'text-gold-100' : ''
                                )}>
                                    {isAr ? variant.labelAr : variant.labelEn}
                                </h4>

                                {/* Price badge */}
                                <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                                    <div className={cn(
                                        'text-2xl font-black tracking-tighter',
                                        isSelected ? 'text-gold-500' : 'text-white'
                                    )}>
                                        {formatPrice(USD_PRICES[variant.id], variant.id)}
                                    </div>
                                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mt-0.5 opacity-70">
                                        {isEg ? (isAr ? '✓ الدفع بالجنيه المصري' : '✓ Billed in EGP') : '✓ Billed in USD'}
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-1.5 flex-1">
                                    {(isAr ? variant.featuresAr : variant.featuresEn).map(
                                        (feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-[10px] text-zinc-400 font-bold leading-snug"
                                            >
                                                <div
                                                    className={cn(
                                                        'w-1.5 h-1.5 rounded-full mt-1 shrink-0 transition-colors',
                                                        isSelected
                                                            ? 'bg-gold-500 shadow-[0_0_6px_rgba(234,179,8,0.4)]'
                                                            : 'bg-zinc-700'
                                                    )}
                                                />
                                                {feature}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* ── Coaching Add-on ───────────────────────────────────────────── */}
            <AnimatePresence>
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="bg-zinc-900/50 border border-gold-500/30 rounded-xl p-4 relative group hover:border-gold-500/60 transition-colors">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div
                                    className={cn(
                                        'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all',
                                        coachingAddon
                                            ? 'bg-gold-500 border-gold-500'
                                            : 'border-zinc-500 group-hover:border-gold-500'
                                    )}
                                >
                                    {coachingAddon && <Check className="w-4 h-4 text-black" />}
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
                                        {isAr ? 'إضافة تدريب شخصي أونلاين' : 'Add 1-on-1 Online Coaching'}
                                        <span className="text-[10px] bg-gold-500/20 text-gold-500 px-2 py-0.5 rounded border border-gold-500/20">VIP</span>
                                    </h4>
                                    <p className="text-xs text-zinc-400 font-medium leading-relaxed mt-0.5">
                                        {isAr
                                            ? 'تدريب أونلاين لمدة دورة هرمونية واحدة. يشمل تحليل النتائج وخطة مخصصة ومتابعة ١-على-١.'
                                            : 'Online Coaching for one hormonal cycle. Includes full analysis, custom plan & 1-on-1 follow-up.'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0 ms-3">
                                <span className="block text-lg font-black text-gold-500 tracking-tighter">{coachingAddonLabel}</span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{isAr ? 'لكل دورة' : '/ Cycle'}</span>
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={coachingAddon}
                                onChange={handleCoachingToggle}
                            />
                        </label>

                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2 text-xs text-amber-500 font-bold"
                        >
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {isAr
                                ? 'تنبيه: سيتطلب تحميل نتائج التحاليل وصور الجسم الحالية بعد الدفع.'
                                : 'Note: You will need to upload bloodwork results and physique photos after payment.'}
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* ── Quantity Selector ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                <span className="font-bold text-zinc-400 uppercase tracking-widest text-sm">
                    {isAr ? 'الكمية' : 'Quantity'}
                </span>
                <div className="flex items-center gap-4 bg-black rounded-lg p-1 border border-zinc-800">
                    <button
                        type="button"
                        aria-label={isAr ? 'تقليل الكمية' : 'Decrease quantity'}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-400 transition-colors"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-black text-white">{quantity}</span>
                    <button
                        type="button"
                        aria-label={isAr ? 'زيادة الكمية' : 'Increase quantity'}
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-800 text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
