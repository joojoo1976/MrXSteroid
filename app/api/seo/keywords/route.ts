/**
 * app/api/seo/keywords/route.ts
 * GET /api/seo/keywords?lang=en|ar&category=all|trending|rising|guides|tools|plans&route=/macro&market=global&limit=100
 * Serves precomputed weekly keyword datasets with multi-tier fallback (<50ms p95)
 * and Page-Level Personalization support.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SeoLanguage, KeywordFilterCategory, KeywordSourceTier, KeywordDataKind } from '../../../../server/seo/types';
import {
    getOrGenerateWeeklySnapshot,
    filterKeywordsByCategory,
    filterKeywordsForRoute,
    getSupabaseAdmin,
} from '../../../../server/seo/seoService';
import { getWeeklyKeywordIntelligence } from '../../../../server/seo/weeklyIntelligence';

export const revalidate = 3600; // 1 hour ISR cache

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const langParam = searchParams.get('lang');
        const language: SeoLanguage = langParam === 'ar' ? 'ar' : 'en';

        const categoryParam = searchParams.get('category') as KeywordFilterCategory;
        const validCategories: KeywordFilterCategory[] = ['all', 'trending', 'rising', 'guides', 'tools', 'plans'];
        const category: KeywordFilterCategory = validCategories.includes(categoryParam) ? categoryParam : 'all';

        const routeParam = searchParams.get('route') || '';
        const limitParam = parseInt(searchParams.get('limit') || '100', 10);
        const limit = Math.min(Math.max(limitParam, 1), 200);

        // T1: `market` is accepted and echoed for forward compatibility with the
        // market-aware engine (T7). It is NOT used to filter yet, because the
        // persisted identity is still (language, normalized_keyword) — silently
        // pretending to filter by market would be a fabricated capability.
        const marketParam = searchParams.get('market') || null;

        // Retrieve snapshot (Tier 1 Snapshot -> Tier 2 Live DB -> Tier 3 Baseline)
        const snapshot = await getOrGenerateWeeklySnapshot(language);
        let rawKeywords = filterKeywordsByCategory(snapshot, category, limit);

        // Apply page-level personalization if route parameter is supplied
        if (routeParam && routeParam !== '/') {
            rawKeywords = filterKeywordsForRoute(rawKeywords, routeParam, limit);
        }

        // T1 TRUTH FIX: declare which store actually served this response.
        // A `baseline` tier is an explicit DEGRADED state (emergency UX
        // fallback), NOT working Dynamic Keyword Intelligence (§5 / §62).
        const sourceTier: KeywordSourceTier = snapshot.sourceTier ?? 'baseline';
        const dataKind: KeywordDataKind = snapshot.dataKind ?? 'unavailable';
        const isDynamic = sourceTier !== 'baseline';

        // PHASE 1C (DEFECT 2): join the persisted WEEKLY state onto the serving
        // list so the Dynamic Keyword UI finally receives real week-over-week
        // intelligence. This is the consumer that did not exist in Phase 1A.
        //
        // It is an ENRICHMENT, never a replacement: `seo_keyword_snapshots` still
        // decides WHICH keywords are served and at what rank, and the 3-tier
        // fallback above is untouched. A failure here degrades to
        // `weeklyTier: 'unavailable'` and every row carries a null movement —
        // which the UI must render as "unknown", never as a trend.
        const weekly = await getWeeklyKeywordIntelligence(getSupabaseAdmin(), {
            language: language as 'en' | 'ar',
        });
        // Indexed by the stable uuid the weekly engine persisted, so the join
        // cannot silently match two different keywords that share display text.
        const weeklyByKeywordId = new Map(weekly.keywords.map((w) => [w.keywordId, w]));

        const keywords = rawKeywords.map((k, idx) => {
            const id = k.id || `kw-${language}-${idx}`;
            const weeklyRow = weeklyByKeywordId.get(id) ?? null;
            return {
            id,
            keyword: k.keyword || k.originalKeyword || k.normalizedKeyword || '',
            originalKeyword: k.originalKeyword || k.keyword || '',
            language: k.language,
            locale: k.locale,
            cluster: k.cluster,
            intent: k.intent,
            destinationPath: k.destinationPath,
            destinationType: k.destinationType || 'page',
            score: k.score,
            finalScore: k.finalScore ?? k.score,
            trendStatus: k.trendStatus,
            isPinned: k.isPinned ?? false,
            isYmyl: k.isYmyl ?? false,
            medicalRiskLevel: k.medicalRiskLevel || 'low',
            // ── Weekly intelligence (PHASE 1C) ─────────────────────────────
            // `weeklyMovement` is the WEEK-OVER-WEEK answer and is deliberately
            // separate from `trendStatus`, which is a lifecycle/score-age state
            // and does not mean "moved this week". Null means UNKNOWN and is
            // never to be rendered as a trend.
            weeklyMovement: weeklyRow?.weeklyMovement ?? null,
            previousScore: weeklyRow?.previousScore ?? null,
            weeklySource: weeklyRow?.source ?? null,
            weeklyMarket: weeklyRow?.market ?? null,
            weeklyObservedAt: weeklyRow?.recordedAt ?? null,
            };
        });

        return NextResponse.json(
            {
                ok: true,
                language,
                market: marketParam,
                category,
                route: routeParam || null,
                year: snapshot.year,
                weekNumber: snapshot.weekNumber,
                generatedAt: snapshot.generatedAt,
                totalKeywords: keywords.length,
                keywords,
                stats: snapshot.stats,
                // ── T1 provenance-of-response contract ──────────────────────
                // `sourceTier` is the ONLY truthful answer to "did the dynamic
                // keyword system work?" — a 200 with sourceTier='baseline' is a
                // degraded response. `dynamicAvailable` mirrors it as a boolean
                // so the UI never has to re-derive the rule.
                sourceTier,
                dataKind,
                dynamicAvailable: isDynamic,
                degraded: !isDynamic,
                degradedReason: isDynamic
                    ? null
                    : 'Served from curated baseline seed corpus: no database-backed or source-backed weekly snapshot was available.',
                // ── Weekly intelligence provenance (PHASE 1C) ────────────────
                // `weeklyTier` answers a DIFFERENT question from `sourceTier`:
                //   sourceTier — was this keyword LIST built from live data?
                //   weeklyTier — is this keyword's week-over-week MOVEMENT real?
                // A response can be dynamic (`sourceTier: 'database'`) while its
                // movement is still unknown (`weeklyTier: 'no_history'`), and the
                // client must be able to tell those apart rather than assume.
                weeklyTier: weekly.tier,
                weeklyYear: weekly.year,
                weeklyWeek: weekly.weekNumber,
                weeklyPreviousWeek: weekly.previousWeek,
            },
            {
                status: 200,
                headers: {
                    // A degraded (baseline) response must never be cached by a CDN
                    // as if it were the healthy dynamic payload.
                    'Cache-Control': isDynamic
                        ? 'public, s-maxage=3600, stale-while-revalidate=86400'
                        : 'no-store',
                    'Content-Type': 'application/json',
                    'X-SEO-Source-Tier': sourceTier,
                    'X-SEO-Data-Kind': dataKind,
                },
            }
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal error';
        return NextResponse.json(
            { ok: false, error: message },
            { status: 500 }
        );
    }
}
