import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../server/seo/seoService';
import { normalizeKeyword } from '../../../../server/seo/normalization';

export const dynamic = 'force-dynamic';

export interface KeywordGapItem {
    keyword: string;
    language: 'ar' | 'en';
    cluster: string;
    intent: 'informational' | 'commercial' | 'transactional' | 'comparison' | 'question';
    opportunityScore: number; // 0 - 100
    searchVolumeEstimate: string; // e.g. "High", "Very High"
    competitorPresence: string; // Competitor landscape
    recommendedDestination: string;
    status: 'missing' | 'covered' | 'low_ranking';
}

const CURATED_COMPETITOR_GAPS: Omit<KeywordGapItem, 'status'>[] = [
    // English Market Gaps
    {
        keyword: 'Deca vs Tren neurotoxicity comparison',
        language: 'en',
        cluster: 'hormone-safety',
        intent: 'comparison',
        opportunityScore: 94,
        searchVolumeEstimate: 'High (10k-50k/mo)',
        competitorPresence: 'Covered on forums, lacking clinical protocol models',
        recommendedDestination: '/blog',
    },
    {
        keyword: 'Anavar cholesterol impact and lipid protection protocol',
        language: 'en',
        cluster: 'hormone-safety',
        intent: 'informational',
        opportunityScore: 91,
        searchVolumeEstimate: 'High (15k-40k/mo)',
        competitorPresence: 'Scattered info, high demand for lab marker guidelines',
        recommendedDestination: '/lab',
    },
    {
        keyword: 'Testosterone cypionate vs enanthate peak concentration curve',
        language: 'en',
        cluster: 'smart-tools',
        intent: 'comparison',
        opportunityScore: 93,
        searchVolumeEstimate: 'Very High (30k-80k/mo)',
        competitorPresence: 'SteroidPlotter is aging; opportunity for modern UI',
        recommendedDestination: '/halflife',
    },
    {
        keyword: 'Enclomiphene vs Clomid HPTA restoration protocol',
        language: 'en',
        cluster: 'pct-recovery',
        intent: 'comparison',
        opportunityScore: 95,
        searchVolumeEstimate: 'Very High (40k-100k/mo)',
        competitorPresence: 'Huge emerging trend, low high-authority medical content',
        recommendedDestination: '/blog',
    },
    {
        keyword: 'Masteron body fat threshold for cosmetic hardening',
        language: 'en',
        cluster: 'cutting-fatloss',
        intent: 'informational',
        opportunityScore: 88,
        searchVolumeEstimate: 'Medium (5k-20k/mo)',
        competitorPresence: 'Anecdotal bro-science; lacks body-fat threshold tool',
        recommendedDestination: '/bodyfat',
    },
    {
        keyword: 'Subcutaneous vs Intramuscular testosterone blood levels',
        language: 'en',
        cluster: 'smart-tools',
        intent: 'question',
        opportunityScore: 90,
        searchVolumeEstimate: 'High (20k-60k/mo)',
        competitorPresence: 'TRT clinics dominate; independent calculator needed',
        recommendedDestination: '/injection',
    },

    // Arabic Market Gaps
    {
        keyword: 'تحليل وظائف الكبد أثناء السايكل GPT و GOT',
        language: 'ar',
        cluster: 'hormone-safety',
        intent: 'informational',
        opportunityScore: 96,
        searchVolumeEstimate: 'عالي جداً (15k-45k/شهرياً)',
        competitorPresence: 'محتوى سطحي وغير مفصل حول حماية الكبد TUDCA و NAC',
        recommendedDestination: '/lab',
    },
    {
        keyword: 'جدول مقارنة استرات التستوستيرون وعمر النصف',
        language: 'ar',
        cluster: 'smart-tools',
        intent: 'comparison',
        opportunityScore: 94,
        searchVolumeEstimate: 'عالي جداً (25k-60k/شهرياً)',
        competitorPresence: 'شبه معدوم كأداة تفاعلية؛ فرصة هيمنة رقمية في الشرق الأوسط',
        recommendedDestination: '/halflife',
    },
    {
        keyword: 'طريقة حساب جرعة الكلين بترول بالمايكروغرام والتدرج',
        language: 'ar',
        cluster: 'cutting-fatloss',
        intent: 'informational',
        opportunityScore: 93,
        searchVolumeEstimate: 'عالي (20k-50k/شهرياً)',
        competitorPresence: 'تضارب كبير في نصائح الجيم وخطر الجرعات الزائدة',
        recommendedDestination: '/macro',
    },
    {
        keyword: 'متى يبدأ كورس التنظيف بعد التيست سيبونات وانانثات',
        language: 'ar',
        cluster: 'pct-recovery',
        intent: 'question',
        opportunityScore: 95,
        searchVolumeEstimate: 'عالي جداً (30k-70k/شهرياً)',
        competitorPresence: 'أخطاء شائعة جداً في توقيت الـ PCT تسبب انهيار الهرمونات',
        recommendedDestination: '/blog',
    },
    {
        keyword: 'أماكن حقن العضلات الصغيرة الكتف الخلفي والترايسبس بأمان',
        language: 'ar',
        cluster: 'smart-tools',
        intent: 'informational',
        opportunityScore: 91,
        searchVolumeEstimate: 'عالي (10k-30k/شهرياً)',
        competitorPresence: 'فيديوهات عشوائية؛ عدم وجود دليل تشريحي موثوق',
        recommendedDestination: '/injection',
    },
    {
        keyword: 'الفرق بين الماسترون والبريموبولان في التنشيف وصلابة العضلات',
        language: 'ar',
        cluster: 'anabolic-steroids',
        intent: 'comparison',
        opportunityScore: 92,
        searchVolumeEstimate: 'عالي (15k-35k/شهرياً)',
        competitorPresence: 'مقارنات غير مبنية على نسب الدهون والتحاليل',
        recommendedDestination: '/bodyfat',
    },
];

export async function GET(req: NextRequest) {
    const supabase = getSupabaseAdmin();
    const url = new URL(req.url);
    const filterLang = url.searchParams.get('lang') as 'ar' | 'en' | null;

    try {
        const existingNormalizedSet = new Set<string>();

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
            summary: {
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
