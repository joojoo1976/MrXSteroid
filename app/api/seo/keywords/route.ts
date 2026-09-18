/**
 * app/api/seo/keywords/route.ts
 * GET /api/seo/keywords?lang=en|ar&category=all|trending|rising|guides|tools|plans&route=/macro&market=global&limit=100
 * Serves precomputed weekly keyword datasets with multi-tier fallback (<50ms p95)
 * and Page-Level Personalization support.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SeoLanguage, KeywordFilterCategory } from '../../../../server/seo/types';
import {
    getOrGenerateWeeklySnapshot,
    filterKeywordsByCategory,
    filterKeywordsForRoute,
} from '../../../../server/seo/seoService';

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

        // Retrieve snapshot (Tier 1 Snapshot -> Tier 2 Live DB -> Tier 3 Baseline)
        const snapshot = await getOrGenerateWeeklySnapshot(language);
        let rawKeywords = filterKeywordsByCategory(snapshot, category, limit);

        // Apply page-level personalization if route parameter is supplied
        if (routeParam && routeParam !== '/') {
            rawKeywords = filterKeywordsForRoute(rawKeywords, routeParam, limit);
        }

        const keywords = rawKeywords.map((k, idx) => ({
            id: k.id || `kw-${language}-${idx}`,
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
        }));

        return NextResponse.json(
            {
                ok: true,
                language,
                category,
                route: routeParam || null,
                year: snapshot.year,
                weekNumber: snapshot.weekNumber,
                generatedAt: snapshot.generatedAt,
                totalKeywords: keywords.length,
                keywords,
                stats: snapshot.stats,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                    'Content-Type': 'application/json',
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
