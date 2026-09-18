import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../server/seo/seoService';
import { normalizeKeyword } from '../../../../server/seo/normalization';

export const dynamic = 'force-dynamic';

export interface CompetitorItem {
    id?: string;
    domain: string;
    name: string;
    market: string;
    language: string;
    sourceUrl: string;
    competitorType: 'regional' | 'global' | 'local';
    observationsCount?: number;
    lastCheckedAt?: string;
}

export interface KeywordGapItem {
    keyword: string;
    language: 'ar' | 'en';
    cluster: string;
    intent: 'informational' | 'commercial' | 'transactional' | 'comparison' | 'question';
    opportunityScore: number; // 0 - 100
    searchVolumeEstimate: string;
    competitorPresence: string;
    competitorDomain?: string;
    recommendedDestination: string;
    status: 'missing' | 'covered' | 'low_ranking';
    confidence: number;
}

// 3 Curated Arab Competitors + 3 Curated Global Competitors
const VERIFIED_COMPETITORS: CompetitorItem[] = [
    // Arab Competitors
    {
        domain: 'egyfitness.net',
        name: 'Egyfitness (Mohamed Qassas)',
        market: 'ar-EG / MENA',
        language: 'ar',
        sourceUrl: 'https://www.egyfitness.net',
        competitorType: 'regional',
    },
    {
        domain: 'arabiafit.com',
        name: 'ArabiaFit Knowledge Base',
        market: 'ar-SA / Gulf',
        language: 'ar',
        sourceUrl: 'https://arabiafit.com',
        competitorType: 'regional',
    },
    {
        domain: 'fitbodyiq.com',
        name: 'FitBody IQ Academy',
        market: 'ar-AE / Levant',
        language: 'ar',
        sourceUrl: 'https://fitbodyiq.com',
        competitorType: 'regional',
    },
    // Global Competitors
    {
        domain: 'steroidplotter.com',
        name: 'SteroidPlotter Interactive',
        market: 'en-US / Global',
        language: 'en',
        sourceUrl: 'https://www.steroidplotter.com',
        competitorType: 'global',
    },
    {
        domain: 'moreplatesmoredates.com',
        name: 'More Plates More Dates (Derek)',
        market: 'en-US / Global',
        language: 'en',
        sourceUrl: 'https://moreplatesmoredates.com',
        competitorType: 'global',
    },
    {
        domain: 'anabolicminds.com',
        name: 'Anabolic Minds Community',
        market: 'en-GB / Global',
        language: 'en',
        sourceUrl: 'https://anabolicminds.com',
        competitorType: 'global',
    },
];

const CURATED_COMPETITOR_GAPS: Omit<KeywordGapItem, 'status'>[] = [
    // English Market Gaps (Global Competitor Insights)
    {
        keyword: 'Deca vs Tren neurotoxicity comparison',
        language: 'en',
        cluster: 'hormone-safety',
        intent: 'comparison',
        opportunityScore: 94,
        searchVolumeEstimate: 'High (10k-50k/mo)',
        competitorPresence: 'Covered on forums, lacking clinical protocol models',
        competitorDomain: 'moreplatesmoredates.com',
        recommendedDestination: '/blog',
        confidence: 85,
    },
    {
        keyword: 'Anavar cholesterol impact and lipid protection protocol',
        language: 'en',
        cluster: 'hormone-safety',
        intent: 'informational',
        opportunityScore: 91,
        searchVolumeEstimate: 'High (15k-40k/mo)',
        competitorPresence: 'Scattered info, high demand for lab marker guidelines',
        competitorDomain: 'moreplatesmoredates.com',
        recommendedDestination: '/lab',
        confidence: 80,
    },
    {
        keyword: 'Testosterone cypionate vs enanthate peak concentration curve',
        language: 'en',
        cluster: 'smart-tools',
        intent: 'comparison',
        opportunityScore: 93,
        searchVolumeEstimate: 'Very High (30k-80k/mo)',
        competitorPresence: 'SteroidPlotter is aging; opportunity for modern UI',
        competitorDomain: 'steroidplotter.com',
        recommendedDestination: '/halflife',
        confidence: 90,
    },
    {
        keyword: 'Enclomiphene vs Clomid HPTA restoration protocol',
        language: 'en',
        cluster: 'pct-recovery',
        intent: 'comparison',
        opportunityScore: 95,
        searchVolumeEstimate: 'Very High (40k-100k/mo)',
        competitorPresence: 'Huge emerging trend, low high-authority medical content',
        competitorDomain: 'anabolicminds.com',
        recommendedDestination: '/blog',
        confidence: 85,
    },
    {
        keyword: 'Masteron vs Primobolan hair loss DHT sensitivity',
        language: 'en',
        cluster: 'anabolic-steroids',
        intent: 'comparison',
        opportunityScore: 89,
        searchVolumeEstimate: 'Moderate (8k-25k/mo)',
        competitorPresence: 'High user anxiety, opportunity for genetic harm reduction',
        competitorDomain: 'moreplatesmoredates.com',
        recommendedDestination: '/genetic',
        confidence: 75,
    },
    {
        keyword: 'Subcutaneous vs intramuscular testosterone injection absorption rate',
        language: 'en',
        cluster: 'smart-tools',
        intent: 'informational',
        opportunityScore: 92,
        searchVolumeEstimate: 'High (20k-60k/mo)',
        competitorPresence: 'Forum debates; clear visual anatomical guide needed',
        competitorDomain: 'anabolicminds.com',
        recommendedDestination: '/injection',
        confidence: 80,
    },
    {
        keyword: 'Halotestin aggression mechanisms and pre workout timing',
        language: 'en',
        cluster: 'anabolic-steroids',
        intent: 'informational',
        opportunityScore: 87,
        searchVolumeEstimate: 'Moderate (5k-15k/mo)',
        competitorPresence: 'Fragmented advice; powerlifters searching for guidelines',
        competitorDomain: 'anabolicminds.com',
        recommendedDestination: '/blog',
        confidence: 70,
    },

    // Arabic Market Gaps (Arab Competitor Insights)
    {
        keyword: 'جدول تحاليل كمال الاجسام قبل وبعد الكورس الشامل',
        language: 'ar',
        cluster: 'hormone-safety',
        intent: 'informational',
        opportunityScore: 96,
        searchVolumeEstimate: 'عالي جداً (25k-60k/شهرياً)',
        competitorPresence: 'محتوى سطحي في المواقع العربية؛ لا توجد قوالب تحاليل تفاعلية',
        competitorDomain: 'egyfitness.net',
        recommendedDestination: '/lab',
        confidence: 90,
    },
    {
        keyword: 'محاكي عمر النصف للاستيرويد وحساب تركيز الهرمون في الدم',
        language: 'ar',
        cluster: 'smart-tools',
        intent: 'informational',
        opportunityScore: 98,
        searchVolumeEstimate: 'عالي جداً (40k-90k/شهرياً)',
        competitorPresence: 'شبه معدوم كأداة تفاعلية؛ فرصة هيمنة رقمية في الشرق الأوسط',
        competitorDomain: 'arabiafit.com',
        recommendedDestination: '/halflife',
        confidence: 95,
    },
    {
        keyword: 'طريقة حساب جرعة الكلين بترول بالمايكروغرام والتدرج',
        language: 'ar',
        cluster: 'cutting-fatloss',
        intent: 'informational',
        opportunityScore: 93,
        searchVolumeEstimate: 'عالي (20k-50k/شهرياً)',
        competitorPresence: 'تضارب كبير في نصائح الجيم وخطر الجرعات الزائدة',
        competitorDomain: 'egyfitness.net',
        recommendedDestination: '/macro',
        confidence: 85,
    },
    {
        keyword: 'متى يبدأ كورس التنظيف بعد التيست سيبونات وانانثات',
        language: 'ar',
        cluster: 'pct-recovery',
        intent: 'question',
        opportunityScore: 95,
        searchVolumeEstimate: 'عالي جداً (30k-70k/شهرياً)',
        competitorPresence: 'أخطاء شائعة جداً في توقيت الـ PCT تسبب انهيار الهرمونات',
        competitorDomain: 'fitbodyiq.com',
        recommendedDestination: '/blog',
        confidence: 90,
    },
    {
        keyword: 'أماكن حقن العضلات الصغيرة الكتف الخلفي والترايسبس بأمان',
        language: 'ar',
        cluster: 'smart-tools',
        intent: 'informational',
        opportunityScore: 91,
        searchVolumeEstimate: 'عالي (10k-30k/شهرياً)',
        competitorPresence: 'فيديوهات عشوائية؛ عدم وجود دليل تشريحي موثوق',
        competitorDomain: 'egyfitness.net',
        recommendedDestination: '/injection',
        confidence: 85,
    },
    {
        keyword: 'الفرق بين الماسترون والبريموبولان في التنشيف وصلابة العضلات',
        language: 'ar',
        cluster: 'anabolic-steroids',
        intent: 'comparison',
        opportunityScore: 92,
        searchVolumeEstimate: 'عالي (15k-35k/شهرياً)',
        competitorPresence: 'مقارنات غير مبنية على نسب الدهون والتحاليل',
        competitorDomain: 'arabiafit.com',
        recommendedDestination: '/bodyfat',
        confidence: 80,
    },
];

export async function GET(req: NextRequest) {
    const supabase = getSupabaseAdmin();
    const url = new URL(req.url);
    const filterLang = url.searchParams.get('lang') as 'ar' | 'en' | null;

    try {
        const existingNormalizedSet = new Set<string>();

        // Query database for live covered keywords
        if (supabase) {
            const { data: currentKeywords } = await supabase
                .from('seo_keywords')
                .select('normalized_keyword, language')
                .eq('is_active', true);

            if (currentKeywords) {
                for (const k of currentKeywords) {
                    existingNormalizedSet.add(`${k.language}:${k.normalized_keyword}`);
                }
            }

            // Sync verified competitors into database if missing
            try {
                for (const comp of VERIFIED_COMPETITORS) {
                    await supabase
                        .from('seo_competitors')
                        .upsert({
                            domain: comp.domain,
                            name: comp.name,
                            market: comp.market,
                            language: comp.language,
                            source_url: comp.sourceUrl,
                            competitor_type: comp.competitorType,
                            is_active: true,
                        }, { onConflict: 'domain' });
                }
            } catch {
                // Ignore if DB migration has pending state
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
                    status: isCovered ? ('covered' as const) : ('missing' as const),
                };
            });

        // Compute summary metrics
        const totalGaps = processedGaps.length;
        const missingCount = processedGaps.filter(g => g.status === 'missing').length;
        const coveredCount = processedGaps.filter(g => g.status === 'covered').length;
        const avgOpportunity = Math.round(
            processedGaps.reduce((sum, g) => sum + g.opportunityScore, 0) / (totalGaps || 1)
        );

        return NextResponse.json({
            competitors: VERIFIED_COMPETITORS,
            summary: {
                totalCompetitors: VERIFIED_COMPETITORS.length,
                arabCompetitorsCount: VERIFIED_COMPETITORS.filter(c => c.language === 'ar').length,
                globalCompetitorsCount: VERIFIED_COMPETITORS.filter(c => c.language === 'en').length,
                totalOpportunities: totalGaps,
                missingOpportunities: missingCount,
                coveredOpportunities: coveredCount,
                coveragePercentage: totalGaps > 0 ? Math.round((coveredCount / totalGaps) * 100) : 0,
                averageOpportunityScore: avgOpportunity,
            },
            opportunities: processedGaps,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[Competitor Analysis Error]:', err);
        return NextResponse.json({ error: 'Failed to retrieve competitor gap report', details: message }, { status: 500 });
    }
}
