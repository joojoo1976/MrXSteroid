import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../server/seo/seoService';
import { normalizeKeyword } from '../../../../server/seo/normalization';
import {
    CURATED_COMPETITORS,
    CURATED_COMPETITOR_GAPS,
    KeywordGapItem,
} from '../../../../server/seo/competitorIntel';

export const dynamic = 'force-dynamic';

/**
 * GET /api/seo/competitors — P1 fix (H2):
 *  - NO database writes: the previous upsert of the curated competitors ran
 *    on every anonymous request with the service-role client; it now lives in
 *    POST /api/admin/seo/competitors, gated by requireAdmin.
 *  - NO fabricated metrics: the previously invented per-gap numbers
 *    (opportunityScore / searchVolumeEstimate / confidence) had no data
 *    source and are emitted as null — never a made-up value.
 *  - Real data preserved: the curated competitor list, the live coverage
 *    check against seo_keywords, and the real summary counts computed from
 *    that check.
 */
export async function GET(req: NextRequest) {
    const supabase = getSupabaseAdmin();
    const url = new URL(req.url);
    const filterLang = url.searchParams.get('lang') as 'ar' | 'en' | null;

    try {
        const existingNormalizedSet = new Set<string>();

        // Read-only: live covered keywords (coverage check)
        if (supabase) {
            const { data: currentKeywords, error: kwErr } = await supabase
                .from('seo_keywords')
                .select('normalized_keyword, language')
                .eq('is_active', true);

            if (kwErr) {
                console.warn('[Competitor Analysis] coverage query failed:', kwErr.message);
            }

            if (currentKeywords) {
                for (const k of currentKeywords) {
                    existingNormalizedSet.add(`${k.language}:${k.normalized_keyword}`);
                }
            }
        }

        // Check each gap keyword against existing database
        const processedGaps: KeywordGapItem[] = CURATED_COMPETITOR_GAPS
            .filter(gap => !filterLang || gap.language === filterLang)
            .map(gap => {
                const norm = normalizeKeyword(gap.keyword, gap.language);
                const isCovered = existingNormalizedSet.has(`${gap.language}:${norm}`);
                return {
                    ...gap,
                    // No real source exists for these metrics — null, never invented.
                    opportunityScore: null,
                    searchVolumeEstimate: null,
                    confidence: null,
                    status: isCovered ? ('covered' as const) : ('missing' as const),
                };
            });

        // Real summary metrics (computed from the live coverage check)
        const totalGaps = processedGaps.length;
        const missingCount = processedGaps.filter(g => g.status === 'missing').length;
        const coveredCount = processedGaps.filter(g => g.status === 'covered').length;

        return NextResponse.json({
            competitors: CURATED_COMPETITORS,
            summary: {
                totalCompetitors: CURATED_COMPETITORS.length,
                arabCompetitorsCount: CURATED_COMPETITORS.filter(c => c.language === 'ar').length,
                globalCompetitorsCount: CURATED_COMPETITORS.filter(c => c.language === 'en').length,
                totalOpportunities: totalGaps,
                missingOpportunities: missingCount,
                coveredOpportunities: coveredCount,
                coveragePercentage: totalGaps > 0 ? Math.round((coveredCount / totalGaps) * 100) : 0,
            },
            opportunities: processedGaps,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[Competitor Analysis Error]:', err);
        return NextResponse.json({ error: 'Failed to retrieve competitor gap report', details: message }, { status: 500 });
    }
}
