'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Compass, Wrench, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { Page, Language } from '@/shared/types/types';

export interface LiveKeywordItem {
    id: string;
    keyword: string;
    language: 'ar' | 'en';
    cluster: string;
    intent: string;
    destinationPath: string;
    destinationType: string;
    score: number;
    trendStatus: string;
    isRising?: boolean;
}

export interface LiveKeywordSectionProps {
    navigateTo?: (page: Page) => void;
    fallbackPool?: string[];
}

type TabType = 'all' | 'trending' | 'rising' | 'guides' | 'tools' | 'plans';

const PATH_TO_PAGE_MAP: Record<string, Page> = {
    '/': Page.HOME,
    '/macro': Page.MACRO,
    '/bodyfat': Page.BODYFAT,
    '/halflife': Page.HALFLIFE,
    '/injection': Page.INJECTION,
    '/lab': Page.LAB,
    '/genetic': Page.GENETIC,
    '/cycle': Page.CYCLE_ARCHITECT,
    '/checkout': Page.CHECKOUT,
    '/faq': Page.FAQ,
    '/blog': Page.BLOG,
    '/about': Page.ABOUT,
    '/support': Page.SUPPORT,
    '/profile/affiliate': Page.AFFILIATE || Page.PROFILE,
};

export const LiveKeywordSection: React.FC<LiveKeywordSectionProps> = ({
    navigateTo,
    fallbackPool = []
}) => {
    const { language, isRTL } = usePreferences();
    const isAr = language === Language.AR;
    const lang = isAr ? 'ar' : 'en';

    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [keywords, setKeywords] = useState<LiveKeywordItem[]>(() => {
        // Immediate baseline fallback from pool to avoid layout flash
        return fallbackPool.map((kw, i) => ({
            id: `fallback-${i}`,
            keyword: kw,
            language: lang,
            cluster: 'general',
            intent: 'informational',
            destinationPath: '/',
            destinationType: 'page',
            score: 70,
            trendStatus: 'stable'
        }));
    });
    const [isExpanded, setIsExpanded] = useState(false);
    // Fetch weekly dynamic keywords for active language
    useEffect(() => {
        let isMounted = true;

        const loadKeywords = async () => {
            try {
                const res = await fetch(`/api/seo/keywords?lang=${lang}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!isMounted) return;
                const items: LiveKeywordItem[] = Array.isArray(data) ? data : (data?.keywords || []);
                if (items.length > 0) {
                    // Strict separation: only keep keywords matching the active language
                    const strictlyFiltered = items.filter(k => k.language === lang);
                    setKeywords(strictlyFiltered);
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                console.warn('[LiveKeywordSection] Using baseline fallback keywords:', msg);
            }
        };

        loadKeywords();

        return () => {
            isMounted = false;
        };
    }, [lang]);

    // Tab configurations
    const tabs: { key: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = useMemo(() => [
        { key: 'all', label: isAr ? 'الكل' : 'All', icon: Compass },
        { key: 'trending', label: isAr ? 'الأكثر رواجاً 🔥' : 'Trending 🔥', icon: TrendingUp },
        { key: 'rising', label: isAr ? 'الصاعدة 🚀' : 'Rising 🚀', icon: Sparkles },
        { key: 'guides', label: isAr ? 'أدلة وإرشادات 💡' : 'Guides 💡', icon: Shield },
        { key: 'tools', label: isAr ? 'أدوات وحاسبات ⚡' : 'Tools ⚡', icon: Wrench },
        { key: 'plans', label: isAr ? 'البروتوكولات والاشتراك 💎' : 'Protocols & Plans 💎', icon: Sparkles },
    ], [isAr]);

    // Categorized keyword filtering
    const filteredKeywords = useMemo(() => {
        return keywords.filter((item) => {
            if (item.language !== lang) return false;

            switch (activeTab) {
                case 'trending':
                    return item.score >= 75 || item.trendStatus === 'rising' || item.trendStatus === 'new';
                case 'rising':
                    return item.trendStatus === 'rising' || item.isRising === true;
                case 'guides':
                    return item.intent === 'informational' || item.intent === 'question' || item.destinationType === 'article' || item.cluster.includes('pct') || item.cluster.includes('safety');
                case 'tools':
                    return item.destinationType === 'tool' || item.destinationPath.startsWith('/macro') || item.destinationPath.startsWith('/bodyfat') || item.destinationPath.startsWith('/halflife') || item.destinationPath.startsWith('/cycle') || item.destinationPath.startsWith('/injection') || item.destinationPath.startsWith('/lab') || item.destinationPath.startsWith('/genetic');
                case 'plans':
                    return item.intent === 'transactional' || item.intent === 'commercial' || item.destinationPath === '/checkout';
                case 'all':
                default:
                    return true;
            }
        });
    }, [keywords, lang, activeTab]);

    const initialDisplayLimit = 28;
    const visibleKeywords = isExpanded ? filteredKeywords : filteredKeywords.slice(0, initialDisplayLimit);
    const hasMore = filteredKeywords.length > initialDisplayLimit;

    // Click handler: non-blocking search logging + safe navigation
    const handleKeywordClick = (item: LiveKeywordItem) => {
        // Non-blocking anonymous search log
        try {
            fetch('/api/seo/search-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: item.keyword,
                    destination: item.destinationPath,
                    language: lang,
                    source: 'footer_chip'
                })
            }).catch(() => {});
        } catch {
            // Ignore logging errors
        }

        // Navigate
        const targetPage = PATH_TO_PAGE_MAP[item.destinationPath];
        if (targetPage && navigateTo) {
            navigateTo(targetPage);
        } else if (typeof window !== 'undefined') {
            window.location.assign(item.destinationPath);
        }
    };

    if (keywords.length === 0) {
        return null;
    }

    return (
        <section
            aria-label={isAr ? "دليل الكلمات المفتاحية ومسارات البحث الذكي" : "Search Intelligence & Keyword Directory"}
            className={`mt-16 pt-10 border-t border-zinc-800/80 ${isRTL ? 'font-cairo' : ''}`}
        >
            <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 md:p-8 backdrop-blur-md shadow-2xl">
                {/* Header & Description */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60 mb-6">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="w-8 h-8 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                {isAr ? "دليل الكلمات المفتاحية والبحث الذكي" : "Live Search Intelligence & Topical Index"}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
                                {isAr ? `تحديث أسبوعي (${filteredKeywords.length})` : `Weekly Refresh (${filteredKeywords.length})`}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-medium">
                            {isAr
                                ? "استكشف أهم المصطلحات، الأدلة العلمية، والحاسبات الأكثر بحثاً في كمال الأجسام والهرمونات."
                                : "Explore top verified bodybuilding protocols, scientific research queries, and precision tools."}
                        </p>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800/80">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => {
                                        setActiveTab(tab.key);
                                        setIsExpanded(false);
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        isActive
                                            ? 'bg-gold-500 text-black shadow-md shadow-gold-500/20 font-black'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5 shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Keyword Chips Grid */}
                <div className="flex flex-wrap gap-2.5 transition-all">
                    {visibleKeywords.map((item) => {
                        const isRising = item.trendStatus === 'rising' || item.isRising;
                        const isNew = item.trendStatus === 'new';

                        return (
                            <motion.button
                                key={item.id}
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleKeywordClick(item)}
                                className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border text-start ${
                                    isRising
                                        ? 'bg-rose-950/20 border-rose-500/30 text-rose-200 hover:border-rose-400 hover:bg-rose-900/30 shadow-sm shadow-rose-950/40'
                                        : isNew
                                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200 hover:border-emerald-400 hover:bg-emerald-900/30 shadow-sm shadow-emerald-950/40'
                                        : 'bg-zinc-900/70 border-zinc-800/80 text-zinc-300 hover:text-white hover:border-gold-500/40 hover:bg-zinc-850 shadow-sm'
                                }`}
                                title={`${item.keyword} (${item.destinationPath})`}
                            >
                                <span>{item.keyword}</span>

                                {isRising && (
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                        {isAr ? 'صاعد' : 'RISING'}
                                    </span>
                                )}

                                {isNew && (
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        {isAr ? 'جديد' : 'NEW'}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Show More / Less Toggle Button */}
                {hasMore && (
                    <div className="mt-6 pt-4 border-t border-zinc-800/40 flex justify-center">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-gold-500/30 text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-md group"
                        >
                            <span>
                                {isExpanded
                                    ? (isAr ? 'عرض أقل' : 'Show Less')
                                    : (isAr ? `إظهار باقي الكلمات (+${filteredKeywords.length - initialDisplayLimit})` : `Show All Keywords (+${filteredKeywords.length - initialDisplayLimit})`)}
                            </span>
                            {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-gold-400 group-hover:-translate-y-0.5 transition-transform" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-gold-400 group-hover:translate-y-0.5 transition-transform" />
                            )}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default LiveKeywordSection;
