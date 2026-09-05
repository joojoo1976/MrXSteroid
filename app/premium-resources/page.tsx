'use client';

import { motion } from 'framer-motion';
import { ComponentType } from 'react';
import {
    Trophy, CalendarCheck, Activity,
    ArrowRight, ChevronRight, Crown,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { Language } from '@/shared/types/types';
import { PREMIUM_RESOURCES } from '@/shared/config/menuConfig';

const PremiumResourcesPage = () => {
    const { language: lang } = usePreferences();

    const resources = PREMIUM_RESOURCES.map(item => ({
        ...item,
        label: lang === Language.AR ? item.labelAr : item.label,
        description: lang === Language.AR ? item.descriptionAr : item.description,
    }));

    const iconMap: Record<string, ComponentType<{ className?: string }>> = {
        Trophy, CalendarCheck, Activity,
    };

    const title = lang === Language.AR ? 'الموارد الحصرية' : 'Exclusive Resources';
    const subtitle = lang === Language.AR
        ? 'استخدم محركات التنبؤ والأدوات الحصرية لتطوير أدائك'
        : 'Use our exclusive prediction engines and tools to develop your performance';
    const exploreBtn = lang === Language.AR ? 'ابدأ الأداة' : 'Open Resource';
    const premiumBadge = lang === Language.AR ? 'حصرية' : 'Premium';

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
                                <Crown className="w-3.5 h-3.5" />
                                {premiumBadge}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-3">
                                {title}
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
                                {subtitle}
                            </p>
                        </motion.div>
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map((resource, idx) => {
                            const Icon = resource.icon ? (iconMap[resource.icon] || Trophy) : Trophy;
                            return (
                                <motion.a
                                    key={resource.href}
                                    href={resource.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                                    className="group relative p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-gold-500/50 hover:shadow-xl hover:shadow-gold-500/10 transition-all duration-300"
                                >
                                    <div className="absolute top-4 right-4">
                                        <Crown className="w-4 h-4 text-gold-500" />
                                    </div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-600 dark:text-gold-400 group-hover:scale-110 transition-transform">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
                                        {resource.label}
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                        {resource.description}
                                    </p>
                                    <div className="inline-flex items-center text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest">
                                        {exploreBtn}
                                        <ArrowRight className="w-3 h-3 ms-1" />
                                    </div>
                                </motion.a>
                            );
                        })}
                    </div>

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

export default PremiumResourcesPage;
