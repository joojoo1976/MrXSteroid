import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings } from '@/shared/types/types';
import { IconRenderer } from '../../utils/icon-utils';
import RevealOnScroll from '../../shared/ui/RevealOnScroll';
import { StyledBrandName } from '../../shared/ui/StyledBrandName';
import { usePreferences } from '../../context/PreferencesContext';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface BenefitsSectionProps {
    content: ContentStrings;
}

const cardAccents = [
    { border: 'border-gold-500/20 hover:border-gold-500/40 dark:border-zinc-800/80 dark:hover:border-gold-500/30', bg: 'bg-gold-500/5 dark:bg-gold-500/10', text: 'text-gold-600 dark:text-gold-400', glow: 'hover:shadow-[0_0_40px_rgba(234,179,8,0.12)]', num: 'from-gold-400 to-gold-600', dot: 'bg-gold-500' },
    { border: 'border-blue-500/20 hover:border-blue-500/40 dark:border-zinc-800/80 dark:hover:border-blue-500/30', bg: 'bg-blue-500/5 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', glow: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]', num: 'from-blue-400 to-blue-600', dot: 'bg-blue-500' },
    { border: 'border-emerald-500/20 hover:border-emerald-500/40 dark:border-zinc-800/80 dark:hover:border-emerald-500/30', bg: 'bg-emerald-500/5 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', glow: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.12)]', num: 'from-emerald-400 to-emerald-600', dot: 'bg-emerald-500' },
    { border: 'border-pink-500/20 hover:border-pink-500/40 dark:border-zinc-800/80 dark:hover:border-pink-500/30', bg: 'bg-pink-500/5 dark:bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', glow: 'hover:shadow-[0_0_40px_rgba(244,63,94,0.12)]', num: 'from-pink-400 to-pink-600', dot: 'bg-pink-500' },
    { border: 'border-amber-500/20 hover:border-amber-500/40 dark:border-zinc-800/80 dark:hover:border-amber-500/30', bg: 'bg-amber-500/5 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', glow: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.12)]', num: 'from-amber-400 to-amber-600', dot: 'bg-amber-500' },
    { border: 'border-red-500/20 hover:border-red-500/40 dark:border-zinc-800/80 dark:hover:border-red-500/30', bg: 'bg-red-500/5 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', glow: 'hover:shadow-[0_0_40px_rgba(239,68,68,0.12)]', num: 'from-red-400 to-red-600', dot: 'bg-red-500' },
];

const BenefitsSection: React.FC<BenefitsSectionProps> = ({ content }) => {
    const { isRTL } = usePreferences();

    return (
        <section id="benefits" className="py-24 md:py-36 bg-zinc-50 dark:bg-background border-t border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 start-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[15%] start-[10%] w-[350px] h-[350px] bg-emerald-500/5 blur-[120px] rounded-full animate-float-slow" />
                <div className="absolute bottom-[15%] end-[10%] w-[450px] h-[450px] bg-gold-500/5 blur-[140px] rounded-full animate-float-slow [animation-delay:-5s]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* ── Section Header ── */}
                <RevealOnScroll>
                    <header className="text-center mb-16 md:mb-24">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-sm font-black uppercase tracking-widest mb-6"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            {isRTL ? 'لماذا تستثمر معنا؟' : 'Why Invest in Mr. X-Steroid?'}
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tight"
                        >
                            <StyledBrandName text={content.benefitsTitle} />
                        </motion.h2>

                        <div className="w-24 h-1.5 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto rounded-full shadow-[0_0_20px_rgba(255,200,0,0.3)] mb-6 animate-pulse" />

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-4xl mx-auto font-semibold leading-relaxed"
                        >
                            <StyledBrandName text={content.benefitsSubtitle} />
                        </motion.p>
                    </header>
                </RevealOnScroll>

                {/* ── Benefits Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {content.benefits.map((benefit, idx) => {
                        const accent = cardAccents[idx % cardAccents.length];
                        const number = String(idx + 1).padStart(2, '0');

                        return (
                            <RevealOnScroll key={idx} delay={idx * 100}>
                                <motion.div
                                    whileHover={{ y: -8, scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`group relative rounded-3xl bg-white dark:bg-zinc-900/60 border-2 ${accent.border} ${accent.glow} backdrop-blur-sm overflow-hidden transition-all duration-500 h-full flex flex-col p-6 md:p-8 shadow-sm`}
                                >
                                    {/* Top decorative gradient bar */}
                                    <div className={`absolute top-0 start-0 end-0 h-1 bg-gradient-to-r ${accent.num} opacity-70 group-hover:opacity-100 transition-opacity`} />

                                    {/* Radial glow effect on hover */}
                                    <div className={`absolute -top-10 -end-10 w-36 h-36 ${accent.bg} blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                                    {/* Header Row: Icon & Serial Number */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center ${accent.bg} rounded-2xl ${accent.text} group-hover:scale-110 transition-transform duration-300 shadow-md ring-1 ${accent.border}`}>
                                            <IconRenderer iconKey={benefit.iconKey} className="w-7 h-7 md:w-8 md:h-8" />
                                        </div>

                                        <span className={`text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br ${accent.num} opacity-20 group-hover:opacity-40 transition-opacity leading-none select-none`}>
                                            {number}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white leading-tight mb-4 group-hover:text-zinc-800 dark:group-hover:text-zinc-100 transition-colors">
                                        <StyledBrandName text={benefit.title} />
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium flex-grow">
                                        <StyledBrandName text={benefit.description} />
                                    </p>

                                    {/* Footer decoration */}
                                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2">
                                        <CheckCircle2 className={`w-4 h-4 ${accent.text}`} />
                                        <span className="text-[10px] md:text-xs font-black text-zinc-400 uppercase tracking-widest">
                                            {isRTL ? 'مشمول في الدليل' : 'Included in Guide'}
                                        </span>
                                    </div>
                                </motion.div>
                            </RevealOnScroll>
                        );
                    })}
                </div>

                {/* ── Section Footer: Trust Callout ── */}
                <RevealOnScroll delay={300}>
                    <div className="mt-20 p-8 rounded-[2rem] bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 max-w-4xl mx-auto relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-xl">
                        <div className="absolute top-0 inset-inline-end-0 w-32 h-32 bg-gold-500/5 rounded-full blur-[40px] pointer-events-none" />

                        <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex-shrink-0">
                            <Sparkles className="w-8 h-8 animate-pulse" />
                        </div>

                        <div className="text-center md:text-start flex-grow">
                            <h4 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white mb-2">
                                {isRTL ? 'استثمر في صحتك وعلمك لتتفادى الأخطاء المميتة' : 'Invest in Your Health & Knowledge to Avoid Fatal Mistakes'}
                            </h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                {isRTL
                                    ? 'هذا الدليل تم تبسيطه ليكون مفهوماً لكل المستويات، مع الحفاظ على القيمة العلمية الصارمة والبروتوكولات الآمنة المعتمدة عالمياً.'
                                    : 'This guide has been simplified to be understood by all levels, while preserving the strict scientific value and globally approved safe protocols.'}
                            </p>
                        </div>
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    );
};

export default BenefitsSection;
