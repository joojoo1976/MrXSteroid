import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getIsoWeek } from '../../../../server/seo/seoService';
import { getBaselineKeywords } from '../../../../server/seo/baselineKeywords';
import { requireAdmin } from '../../../../server/auth/require-admin';
import { SeoLanguage } from '../../../../server/seo/types';

export const dynamic = 'force-dynamic';

/**
 * P0 fix (H1): the report selects ONLY columns that actually exist in the
 * production database (v1 schema — verified read-only 2026-09-28 via
 * PostgREST: the six v3-era columns verified absent in production rejected
 * the whole select with 42703 and silently forced the report into an
 * unlabeled fallback; full record:
 * docs/superpowers/audits/2026-09-28-seo-audit.md).
 * `is_ymyl` is `boolean | null`: null means unclassified — the report must
 * never present unclassified data as `false`.
 */
interface KeywordReportItem {
    id: string;
    keyword: string;
    normalized_keyword: string;
    language: string;
    cluster: string;
    intent: string;
    destination_path: string;
    score: number;
    final_score?: number;
    confidence_score?: number;
    lifecycle_status?: string;
    is_ymyl?: boolean | null;
    requires_review?: boolean;
    trend_status: string;
    is_active: boolean;
    fallback?: boolean;
}

interface SnapshotReportItem {
    language: string;
    year: number;
    week_number: number;
    created_at: string;
    snapshot_data: unknown;
}

interface SearchLogItem {
    query: string;
    normalized_query: string;
    language: string;
    created_at: string;
}

export async function GET(req: NextRequest) {
    // SECURITY: this report aggregates the full SEO keyword corpus, search logs,
    // competitor intelligence and cannibalization alerts. It is internal
    // competitive data, not a public asset — it must be admin-only like every
    // other /api/admin/seo/* reader.
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    const supabase = getSupabaseAdmin();
    const url = new URL(req.url);
    const lang = (url.searchParams.get('lang') || 'all') as SeoLanguage | 'all';

    // ---------------------------------------------------------------------
    // competitor-intelligence, from REAL crawled observations.
    //
    // The snapshot payload below is keyword-centric and ignored `type`
    // entirely, so `?type=competitors` returned the same keyword summary as
    // every other request and the persisted competitor observations were
    // invisible to the reader. This branch serves the actual rows.
    //
    // HONESTY: every field here is something the crawl observed about a page.
    // There is no volume, rank or traffic field, because none was measured.
    // ---------------------------------------------------------------------
    const type = url.searchParams.get('type');
    if (type === 'competitors' || type === 'competitor-intelligence') {
        const { year, weekNumber } = getIsoWeek();
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database service role client unavailable', dataSource: 'unavailable' },
                { status: 503 }
            );
        }
        const { data: obsRows, error: obsErr } = await supabase
            .from('seo_competitor_observations')
            .select(
                'id, competitor_id, url, title, headings, observed_at, content_hash, signals, ' +
                    'seo_competitors!inner(domain, name)'
            )
            .order('observed_at', { ascending: false })
            .limit(500);

        if (obsErr) {
            return NextResponse.json(
                { error: 'Failed to read competitor observations', details: obsErr.message },
                { status: 500 }
            );
        }

        // The service client is untyped, so the joined row is described here
        // rather than being inferred as a generic error shape.
        interface CompetitorObservationRow {
            url: string | null;
            title: string | null;
            observed_at: string | null;
            content_hash: string | null;
            signals: Record<string, unknown> | null;
            headings: Record<string, unknown> | null;
            seo_competitors:
                | { domain?: string | null; name?: string | null }
                | Array<{ domain?: string | null; name?: string | null }>
                | null;
        }
        const typedRows = (obsRows ?? []) as unknown as CompetitorObservationRow[];

        const observations = typedRows.map((r) => {
            const c = Array.isArray(r.seo_competitors) ? r.seo_competitors[0] : r.seo_competitors;
            const signals = r.signals ?? {};
            const headings = r.headings ?? {};
            return {
                url: r.url,
                title: r.title,
                domain: c?.domain ?? null,
                observedAt: r.observed_at,
                contentHash: r.content_hash,
                market: signals.market ?? null,
                language: signals.language ?? null,
                evidenceType: signals.evidenceType ?? null,
                dataKind: signals.dataKind ?? 'observed',
                sourceReference: signals.sourceReference ?? r.url,
                h1: (headings.h1 as string[] | undefined) ?? [],
                h2Count: Array.isArray(headings.h2) ? headings.h2.length : 0,
                h3Count: Array.isArray(headings.h3) ? headings.h3.length : 0,
                faqCount: Array.isArray(headings.faq) ? headings.faq.length : 0,
                articleCount: Array.isArray(headings.article) ? headings.article.length : 0,
                themes: (headings.themes as string[] | undefined) ?? [],
                // Stated explicitly so no reader mistakes this for demand data.
                measuredDemand: null,
                measuredRank: null,
                measuredTraffic: null,
            };
        });

        const domains = Array.from(
            new Set(observations.map((o) => o.domain).filter((d): d is string => Boolean(d)))
        );

        return NextResponse.json({
            type: 'competitor-intelligence',
            year,
            weekNumber,
            dataSource: 'database',
            summary: {
                observations: observations.length,
                domainsObserved: domains.length,
                domains,
                markets: Array.from(
                    new Set(observations.map((o) => o.market).filter((m): m is string => Boolean(m)))
                ),
                note:
                    'These are pages we actually fetched from competitor sites. ' +
                    'No search volume, ranking or traffic figure is reported, because ' +
                    'none of them was measured.',
            },
            observations,
        });
    }

    try {
        const { year, weekNumber } = getIsoWeek();

        let allKeywords: KeywordReportItem[] = [];
        let snapshots: SnapshotReportItem[] = [];
        let recentSearches: SearchLogItem[] = [];
        let sourcesCount = 0;
        let competitorsCount = 0;
        let seasonalEventsCount = 0;
        let cannibalizationAlertsCount = 0;
        // P0 fix (H1): keyword-query failures are captured so the fallback is
        // never mistaken for live database state.
        let kwErrorMessage: string | null = null;

        if (supabase) {
            // P0 fix (H1): only production-existing columns are requested.
            let kwQuery = supabase
                .from('seo_keywords')
                .select('id, original_keyword, normalized_keyword, language, cluster, intent, destination_path, score, trend_status, is_active')
                .eq('is_active', true);

            if (lang === 'ar' || lang === 'en') {
                kwQuery = kwQuery.eq('language', lang);
            }

            const { data: keywords, error: kwErr } = await kwQuery;
            if (kwErr) {
                kwErrorMessage = kwErr.message;
                console.warn('[SEO Report] keywords query failed:', kwErr.message);
            }
            if (keywords && keywords.length > 0) {
                allKeywords = keywords.map(k => ({
                    ...k,
                    keyword: k.original_keyword || k.normalized_keyword,
                })) as KeywordReportItem[];
            }

            // Snapshots
            const { data: snapData, error: snapError } = await supabase
                .from('seo_keyword_snapshots')
                .select('language, year, week_number, created_at, snapshot_data')
                .eq('year', year)
                .eq('week_number', weekNumber);
            if (snapError) {
                console.warn('[SEO Report] snapshots query failed:', snapError.message);
            }
            snapshots = (snapData || []) as SnapshotReportItem[];

            // Telemetry: Internal search logs (Zero PII)
            const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
            const { data: searchLogs, error: searchLogsError } = await supabase
                .from('seo_internal_search_logs')
                .select('query, normalized_query, language, created_at')
                .gte('created_at', fourteenDaysAgo)
                .order('created_at', { ascending: false })
                .limit(100);
            if (searchLogsError) {
                console.warn('[SEO Report] search logs query failed:', searchLogsError.message);
            }
            recentSearches = (searchLogs || []) as SearchLogItem[];

            // Multi-system metadata counts
            try {
                const [srcRes, compRes, seaRes, canRes] = await Promise.all([
                    supabase.from('seo_keyword_sources').select('id', { count: 'exact', head: true }),
                    supabase.from('seo_competitors').select('id', { count: 'exact', head: true }),
                    supabase.from('seo_seasonal_calendar').select('id', { count: 'exact', head: true }),
                    supabase.from('seo_cannibalization_alerts').select('id', { count: 'exact', head: true }),
                ]);
                sourcesCount = srcRes.count || 0;
                competitorsCount = compRes.count || 0;
                seasonalEventsCount = seaRes.count || 0;
                cannibalizationAlertsCount = canRes.count || 0;
            } catch {
                // Ignore if tables are not queried in this cycle
            }
        }

        // Tier 3 fallback if no database rows or client unavailable.
        // P0 fix (H1): fallback data is the curated baseline seed corpus, never
        // live database state — it must be explicitly labeled as such.
        const usedFallback = !supabase || Boolean(kwErrorMessage) || allKeywords.length === 0;
        const fallbackReason = !supabase
            ? 'database_unavailable'
            : kwErrorMessage
                ? 'database_error'
                : 'database_empty';
        if (allKeywords.length === 0) {
            const enSeeds = (lang === 'ar') ? [] : getBaselineKeywords('en');
            const arSeeds = (lang === 'en') ? [] : getBaselineKeywords('ar');
            allKeywords = [...enSeeds, ...arSeeds].map((k, idx) => ({
                id: `fallback-${idx}`,
                keyword: k.originalKeyword,
                normalized_keyword: k.normalizedKeyword,
                language: k.language,
                cluster: k.cluster,
                intent: k.intent,
                destination_path: k.destinationPath,
                score: k.score,
                final_score: k.score,
                confidence_score: 55,
                lifecycle_status: 'active',
                fallback: true,
                is_ymyl: null,
                requires_review: false,
                trend_status: k.trendStatus,
                is_active: true,
            }));
        }

        // Compute metrics
        const totalCount = allKeywords.length;
        const enCount = allKeywords.filter(k => k.language === 'en').length;
        const arCount = allKeywords.filter(k => k.language === 'ar').length;

        const avgScore = totalCount > 0
            ? Math.round((allKeywords.reduce((acc, k) => acc + Number(k.final_score ?? k.score ?? 0), 0) / totalCount) * 10) / 10
            : 0;

        // P0 fix (H1): average confidence over rows that actually carry the
        // field — absent values must not fabricate a neutral 70.
        const confidenceValues = allKeywords
            .map(k => k.confidence_score)
            .filter((v): v is number => typeof v === 'number');
        const avgConfidence = confidenceValues.length > 0
            ? Math.round((confidenceValues.reduce((acc, v) => acc + v, 0) / confidenceValues.length) * 10) / 10
            : 0;

        const trendBreakdown = {
            new: allKeywords.filter(k => k.trend_status === 'new').length,
            rising: allKeywords.filter(k => k.trend_status === 'rising').length,
            stable: allKeywords.filter(k => k.trend_status === 'stable').length,
            declining: allKeywords.filter(k => k.trend_status === 'declining').length,
            retired: allKeywords.filter(k => k.trend_status === 'retired').length,
        };

        const lifecycleBreakdown = {
            active: allKeywords.filter(k => k.lifecycle_status === 'active').length,
            approved: allKeywords.filter(k => k.lifecycle_status === 'approved').length,
            pending_review: allKeywords.filter(k => k.lifecycle_status === 'pending_review' || k.requires_review).length,
            candidate: allKeywords.filter(k => k.lifecycle_status === 'candidate').length,
            blocked: allKeywords.filter(k => k.lifecycle_status === 'blocked').length,
        };

        const ymylCount = allKeywords.filter(k => k.is_ymyl).length;

        const clusterBreakdown: Record<string, number> = {};
        const intentBreakdown: Record<string, number> = {};

        for (const k of allKeywords) {
            clusterBreakdown[k.cluster] = (clusterBreakdown[k.cluster] || 0) + 1;
            intentBreakdown[k.intent] = (intentBreakdown[k.intent] || 0) + 1;
        }

        // Top 15 keywords by final score
        const topKeywords = [...allKeywords]
            .sort((a, b) => Number(b.final_score ?? b.score ?? 0) - Number(a.final_score ?? a.score ?? 0))
            .slice(0, 15);

        return NextResponse.json({
            year,
            weekNumber,
            platformVersion: 'v3.0',
            // P0 fix (H1): the provenance of this payload is explicit — an
            // admin must never mistake fallback seeds for the live corpus.
            dataSource: usedFallback ? 'fallback' : 'database',
            fallbackUsed: usedFallback,
            fallbackReason: usedFallback ? fallbackReason : null,
            summary: {
                totalActiveKeywords: totalCount,
                englishCount: enCount,
                arabicCount: arCount,
                averageScore: avgScore,
                averageConfidence: avgConfidence,
                ymylKeywordsCount: ymylCount,
                healthStatus: avgScore >= 75 ? 'Optimal' : 'Needs Optimization',
                infrastructure: {
                    sourcesCount,
                    competitorsCount,
                    seasonalEventsCount,
                    cannibalizationAlertsCount,
                },
            },
            trends: trendBreakdown,
            lifecycles: lifecycleBreakdown,
            clusters: clusterBreakdown,
            intents: intentBreakdown,
            snapshots,
            topKeywords,
            recentSearches,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[SEO Report Error]:', err);
        return NextResponse.json({ error: 'Failed to generate SEO report', details: message }, { status: 500 });
    }
}
