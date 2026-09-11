/**
 * app/api/seo/keywords/route.ts
 * GET /api/seo/keywords?lang=en|ar&category=all|trending|rising|guides|tools|plans&limit=100
 * Serves precomputed weekly keyword datasets with multi-tier fallback (<50ms p95).
 */

import { NextRequest, NextResponse } from 'next/server';
import { SeoLanguage, KeywordFilterCategory } from '../../../../server/seo/types';
import { getOrGenerateWeeklySnapshot, filterKeywordsByCategory } from '../../../../server/seo/seoService';

export const revalidate = 3600; // 1 hour ISR cache

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const langParam = searchParams.get('lang');
        const language: SeoLanguage = langParam === 'ar' ? 'ar' : 'en';

        const categoryParam = searchParams.get('category') as KeywordFilterCategory;
        const validCategories: KeywordFilterCategory[] = ['all', 'trending', 'rising', 'guides', 'tools', 'plans'];
        const category: KeywordFilterCategory = validCategories.includes(categoryParam) ? categoryParam : 'all';

        const limitParam = parseInt(searchParams.get('limit') || '100', 10);
        const limit = Math.min(Math.max(limitParam, 1), 200);

        // Retrieve snapshot (Tier 1 Snapshot -> Tier 2 Live DB -> Tier 3 Baseline)
        const snapshot = await getOrGenerateWeeklySnapshot(language);
        const keywords = filterKeywordsByCategory(snapshot, category, limit);

        return NextResponse.json(
            {
                ok: true,
                language,
                category,
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
