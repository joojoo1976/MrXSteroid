'use client';

import { motion } from 'framer-motion';
import { ComponentType } from 'react';
import {
    Flame, Scale, Syringe, Timer, Beaker, Dna,
    Calculator, ArrowRight, Sparkles, ChevronRight,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { Language } from '@/shared/types/types';
import { getAllToolLinks } from '@/shared/config/menuConfig';

const SmartToolsPage = () => {
    const { language: lang } = usePreferences();

    const tools = getAllToolLinks(lang);

    const iconMap: Record<string, ComponentType<{ className?: string }>> = {
        Flame, Scale, Syringe, Timer, Beaker, Dna,
    };

    const title = lang === Language.AR ? 'أدوات مRx الذكية' : 'Smart Tools';
    const subtitle = lang === Language.AR
        ? 'استخدم أدواتنا الحسابية المتقدمة لتحليل و优化 خط plans التغذية والدورة والتحاليل'
        : 'Use our advanced calculators to analyze and optimize your nutrition, cycle, and lab plans';
    const exploreBtn = lang === Language.AR ? 'ابدأ الأداة' : 'Open Tool';

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10 md:mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400 text-xs font-black uppercase tracking-widest mb-4">
                                <Sparkles className="w-3.5 h-3.5" />
                                {lang === Language.AR ? 'ento AI-Powered' : 'AI-Powered Calculators'}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-3">
                                {title}
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
                                {subtitle}
                            </p>
                        </motion.div>
                    </div>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tools.map((tool, idx) => {
                            const Icon = tool.icon ? (iconMap[tool.icon] || Calculator) : Calculator;
                            return (
                                <motion.a
                                    key={tool.href}
                                    href={tool.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                                    className="group relative p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-gold-500/50 hover:shadow-xl hover:shadow-gold-500/10 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-600 dark:text-gold-400 group-hover:scale-110 transition-transform">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
                                        {tool.label}
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                        {tool.description}
                                    </p>
                                    <div className="inline-flex items-center text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest">
                                        {exploreBtn}
                                        <ArrowRight className="w-3 h-3 ms-1" />
                                    </div>
                                </motion.a>
                            );
                        })}
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-12 text-center">
                        <p className="text-zinc-500 dark:text-zinc-500 text-sm">
                            {lang === Language.AR
                                ? 'جميع الأدوات متوافقة بالكامل مع العربية والإنجليزية'
                                : 'All tools fully compatible in Arabic & English'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartToolsPage;