'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Compass, Wrench, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { Page, Language } from '@/shared/types/types';
import { pathToPage } from '../../lib/legacy-routes';

export interface LiveKeywordItem {
    id: string;
    keyword: string;
    originalKeyword?: string;
    normalizedKeyword?: string;
    language: 'ar' | 'en';
    cluster: string;
    intent: string;
    destinationPath: string;
    destinationType: string;
    score: number;
    trendStatus: string;
    isRising?: boolean;
    isPinned?: boolean;
    isYmyl?: boolean;
    /**
     * PHASE 1C: the REAL week-over-week movement, served by the API from
     * `seo_keyword_weekly_states`. `null` means UNKNOWN — it must never be
     * rendered as a trend. Deliberately distinct from `trendStatus`, which is a
     * lifecycle/score-age state and does not mean "moved this week".
     */
    weeklyMovement?: WeeklyMovementLabel;
    previousScore?: number | null;
    weeklySource?: string | null;
    weeklyObservedAt?: string | null;
}

/**
 * PHASE 1C — the weekly movement vocabulary. Mirrors `WeeklyMovement` in
 * server/seo/weeklyEngine.ts, plus `null` for "no history to compare against".
 */
export type WeeklyMovementLabel = 'NEW' | 'STABLE' | 'RISING' | 'DECLINING' | null;

export interface LiveKeywordSectionProps {
    navigateTo?: (page: Page) => void;
    fallbackPool?: string[];
}

/**
 * Whether the last fetch produced REAL week-over-week movement data.
 *
 * PHASE 1C: a dynamic keyword LIST is not the same as a real weekly
 * comparison. `weekly_states` means movements were computed from genuine
 * prior-week rows; `no_history` means rows exist but there is nothing to
 * compare against, so every movement is unknown. The two must not collapse.
 */
type WeeklyTierState = 'weekly_states' | 'no_history' | 'unavailable';

/**
 * T1 TRUTH FIX — the response provenance of the LAST successful fetch.
 *
 * `dynamic`  -> served by a database/snapshot backed payload (real intelligence)
 * `fallback` -> the API failed or returned nothing; the UI is rendering the
 *               emergency curated pool. This is a DEGRADED state and the UI is
 *               required to label it as such instead of calling it dynamic.
 */
type KeywordFeedState = 'loading' | 'dynamic' | 'fallback';

type TabType = 'all' | 'trending' | 'rising' | 'guides' | 'tools' | 'plans';

interface RawKeywordResponseItem {
    id?: string;
    keyword?: string;
    originalKeyword?: string;
    normalizedKeyword?: string;
    language?: 'ar' | 'en';
    cluster?: string;
    intent?: string;
    destinationPath?: string;
    destinationType?: string;
    score?: number;
    trendStatus?: string;
    isRising?: boolean;
    isPinned?: boolean;
    isYmyl?: boolean;
    /** PHASE 1C — week-over-week movement + its provenance. */
    weeklyMovement?: 'NEW' | 'STABLE' | 'RISING' | 'DECLINING' | null;
    previousScore?: number | null;
    weeklySource?: string | null;
    weeklyMarket?: string | null;
    weeklyObservedAt?: string | null;
}

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
        return (fallbackPool || [])
            .filter(kw => typeof kw === 'string' && kw.trim().length > 0)
            .map((kw, i) => ({
                id: `fallback-${lang}-${i}`,
                keyword: kw.trim(),
                originalKeyword: kw.trim(),
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
    // T1: the feed state is explicit. `fallback` means "we are NOT showing
    // dynamic intelligence right now" and must be surfaced, not hidden.
    const [feedState, setFeedState] = useState<KeywordFeedState>('loading');
    // PHASE 1C: the weekly tier is tracked separately from the feed tier. A
    // response can be a perfectly good dynamic LIST while carrying no weekly
    // comparison at all, and the UI must be able to say so.
    const [weeklyTier, setWeeklyTier] = useState<WeeklyTierState>('unavailable');
    // Fetch weekly dynamic keywords for active language
    useEffect(() => {
        let isMounted = true;

        const loadKeywords = async () => {
            try {
                const res = await fetch(`/api/seo/keywords?lang=${lang}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!isMounted) return;

                // T1: trust the server's declared tier, not the mere presence of
                // rows. A 200 carrying sourceTier='baseline' IS a fallback even
                // though the HTTP status says success.
                const tier = (data?.sourceTier ?? 'baseline') as 'snapshot' | 'database' | 'baseline';
                const isDynamicPayload = tier === 'snapshot' || tier === 'database';
                // PHASE 1C: read the weekly tier the server declares. Anything
                // unrecognised is treated as unavailable, never as "rising".
                const declaredWeeklyTier = data?.weeklyTier;
                const resolvedWeeklyTier: WeeklyTierState =
                    declaredWeeklyTier === 'weekly_states' ||
                    declaredWeeklyTier === 'no_history' ||
                    declaredWeeklyTier === 'unavailable'
                        ? declaredWeeklyTier
                        : 'unavailable';

                const rawItems: RawKeywordResponseItem[] = Array.isArray(data) ? data : (data?.keywords || []);
                if (rawItems.length > 0) {
                    const parsed: LiveKeywordItem[] = rawItems
                        .map((k, idx) => {
                            const text = String(k.keyword || k.originalKeyword || k.normalizedKeyword || '').trim();
                            const rawPath = String(k.destinationPath || '/').trim();
                            const safePath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
                            return {
                                id: k.id || `kw-${lang}-${idx}`,
                                keyword: text,
                                originalKeyword: k.originalKeyword || text,
                                normalizedKeyword: k.normalizedKeyword || text,
                                language: (k.language === 'ar' || k.language === 'en') ? k.language : lang,
                                cluster: k.cluster || 'general',
                                intent: k.intent || 'informational',
                                destinationPath: safePath,
                                destinationType: k.destinationType || 'page',
                                score: typeof k.score === 'number' ? k.score : 70,
                                trendStatus: k.trendStatus || 'stable',
                                // PHASE 1C (DEFECT 3): `isRising` used to be derived
                                // from `trendStatus === 'rising'`, which is a
                                // lifecycle/score-age state and does NOT mean the
                                // keyword rose this week. It is now driven ONLY by
                                // the real weekly comparison, so the "Rising" tab can
                                // never show an age-based label as a weekly trend.
                                isRising: k.weeklyMovement === 'RISING',
                                isPinned: k.isPinned === true,
                                isYmyl: k.isYmyl === true,
                                // PHASE 1C: carry the real weekly intelligence.
                                weeklyMovement: k.weeklyMovement ?? null,
                                previousScore: typeof k.previousScore === 'number' ? k.previousScore : null,
                                weeklySource: k.weeklySource ?? null,
                                weeklyObservedAt: k.weeklyObservedAt ?? null,
                            };
                        })
                        .filter(k => k.keyword.length > 0 && k.language === lang);

                    if (parsed.length > 0) {
                        setKeywords(parsed);
                        // T1: rows rendered from a baseline-tier payload are still a
                        // fallback. Never let a populated list imply a healthy feed.
                        setFeedState(isDynamicPayload ? 'dynamic' : 'fallback');
                        setWeeklyTier(resolvedWeeklyTier);
                    } else {
                        setFeedState('fallback');
                        setWeeklyTier(resolvedWeeklyTier);
                    }
                } else {
                    setFeedState('fallback');
                    setWeeklyTier(resolvedWeeklyTier);
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                // T1: log the real reason. The pool below is an emergency UX
                // fallback only — it is not dynamic keyword intelligence.
                console.warn('[LiveKeywordSection] Keyword feed unavailable, rendering emergency curated pool:', msg);
                if (isMounted) setFeedState('fallback');
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
            if (!item.keyword || item.keyword.trim().length === 0) return false;
            if (item.language !== lang) return false;

            switch (activeTab) {
                case 'trending':
                    return item.score >= 75 || item.trendStatus === 'rising' || item.trendStatus === 'new';
                case 'rising':
                    // PHASE 1C (DEFECT 3): the "Rising" tab is a WEEKLY claim, so
                    // it must be answered by the real week-over-week movement.
                    // It previously matched `trendStatus === 'rising'`, which is a
                    // score/age state — so this tab could list keywords that never
                    // moved this week at all. `weeklyMovement === null` (no
                    // history) now correctly excludes a keyword from this tab
                    // rather than guessing.
                    return item.weeklyMovement === 'RISING';
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

    // T1: a fallback feed must never be presented as live intelligence. This
    // flag drives the heading, the badge colour and the description copy.
    const isFallback = feedState === 'fallback';

    // PHASE 1C: whether real week-over-week movement is available at all.
    // `false` means any movement shown must be treated as UNKNOWN, so the
    // section says so explicitly rather than implying a weekly trend exists.
    const hasWeeklyIntelligence = weeklyTier === 'weekly_states';

    // Click handler: non-blocking search logging + safe navigation
    const handleKeywordClick = (item: LiveKeywordItem) => {
        const keywordText = item.keyword || item.originalKeyword || item.normalizedKeyword || '';
        const rawDestination = (item.destinationPath || '/').trim();
        const safeDestination = rawDestination.startsWith('/') ? rawDestination : `/${rawDestination}`;

        // Non-blocking anonymous search log
        try {
            fetch('/api/seo/search-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: keywordText,
                    destination: safeDestination,
                    language: lang,
                    source: 'footer_chip'
                })
            }).catch(() => {});
        } catch {
            // Ignore logging errors
        }

        // Navigate safely using centralized router
        const targetPage = pathToPage(safeDestination);
        if (targetPage && navigateTo) {
            navigateTo(targetPage);
        } else if (navigateTo) {
            navigateTo(Page.HOME);
        } else if (typeof window !== 'undefined') {
            window.location.assign(safeDestination || '/');
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
                                {isFallback
                                    ? (isAr ? "دليل الكلمات (نسخة احتياطية)" : "Keyword Directory (Fallback)")
                                    : (isAr ? "دليل الكلمات المفتاحية والبحث الذكي" : "Live Search Intelligence & Topical Index")}
                            </h3>
                            <span
                                data-testid="keyword-feed-state"
                                data-feed-state={feedState}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    isFallback
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                        : 'bg-gold-500/10 text-gold-400 border-gold-500/20'
                                }`}
                            >
                                {isFallback
                                    ? (isAr
                                        ? `نسخة احتياطية (${filteredKeywords.length})`
                                        : `Curated fallback (${filteredKeywords.length})`)
                                    : (isAr
                                        ? `تحديث أسبوعي (${filteredKeywords.length})`
                                        : `Weekly Refresh (${filteredKeywords.length})`)}
                            </span>
                            {/* PHASE 1C: the WEEKLY tier is reported separately from
                                the feed tier. Without this, a dynamic keyword list
                                would look identical whether or not any real
                                week-over-week comparison existed behind it. */}
                            <span
                                data-testid="keyword-weekly-tier"
                                data-weekly-tier={weeklyTier}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    hasWeeklyIntelligence
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                                }`}
                            >
                                {hasWeeklyIntelligence
                                    ? (isAr ? 'حركة أسبوعية موثّقة' : 'Verified weekly movement')
                                    : (isAr ? 'لا توجد مقارنة أسبوعية' : 'No weekly comparison')}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-medium">
                            {isFallback
                                ? (isAr
                                    ? "تعذر جلب البيانات الحية من مصادر الذكاء — تُعرض الكلمات المحفوظة محلياً كنسخة احتياطية."
                                    : "Live keyword data could not be fetched from the intelligence sources — showing the locally stored curated set as a fallback.")
                                : (isAr
                                    ? "استكشف أهم المصطلحات، الأدلة العلمية، والحاسبات الأكثر بحثاً في كمال الأجسام والهرمونات."
                                    : "Explore top verified bodybuilding protocols, scientific research queries, and precision tools.")}
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
                        const isRising = item.isRising === true;
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

                                {item.isPinned && (
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-gold-500/20 text-gold-400 border border-gold-500/30">
                                        {isAr ? 'مثبت 📌' : 'PINNED 📌'}
                                    </span>
                                )}

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
