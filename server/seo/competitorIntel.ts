/**
 * server/seo/competitorIntel.ts
 *
 * Curated competitor intelligence data for the SEO engine (P1 fix H2).
 * Moved out of app/api/seo/competitors/route.ts so the PUBLIC endpoint never
 * owns database writes and the sync lives behind requireAdmin
 * (POST /api/admin/seo/competitors).
 *
 * Honesty rules (Gap Audit 2026-09-28):
 *  - This is a CURATED list compiled by the owner; verification of each
 *    competitor is pending an owner decision — nothing here is a measured
 *    metric. The previous "VERIFIED" label was renamed accordingly.
 *  - The previously fabricated per-gap numbers (searchVolumeEstimate,
 *    opportunityScore, confidence) were removed entirely; they had no data
 *    source. They may only return when a real source actually provides them.
 *  - competitorPresence strings are editorial opinion, not metrics; keeping
 *    or removing them is an owner decision.
 */

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
    opportunityScore: number | null;
    searchVolumeEstimate: string | null;
    competitorPresence: string;
    competitorDomain?: string;
    recommendedDestination: string;
    status: 'missing' | 'covered' | 'low_ranking';
    confidence: number | null;
}

export const CURATED_COMPETITORS: CompetitorItem[] = [
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

export const CURATED_COMPETITOR_GAPS: Omit<
    KeywordGapItem,
    'status' | 'opportunityScore' | 'searchVolumeEstimate' | 'confidence'
>[] = [
    // English Market Gaps (Global Competitor Insights)
    {
        keyword: 'Deca vs Tren neurotoxicity comparison',
        language: 'en',
        cluster: 'hormone-safety',
        intent: 'comparison',
        competitorPresence: 'Covered on forums, lacking clinical protocol models',
        competitorDomain: 'moreplatesmoredates.com',
        recommendedDestination: '/blog',
    },
    {
        keyword: 'Anavar cholesterol impact and lipid protection protocol',
        language: 'en',
        cluster: 'hormone-safety',
        intent: 'informational',
        competitorPresence: 'Scattered info, high demand for lab marker guidelines',
        competitorDomain: 'moreplatesmoredates.com',
        recommendedDestination: '/lab',
    },
    {
        keyword: 'Testosterone cypionate vs enanthate peak concentration curve',
        language: 'en',
        cluster: 'smart-tools',
        intent: 'comparison',
        competitorPresence: 'SteroidPlotter is aging; opportunity for modern UI',
        competitorDomain: 'steroidplotter.com',
        recommendedDestination: '/halflife',
    },
    {
        keyword: 'Enclomiphene vs Clomid HPTA restoration protocol',
        language: 'en',
        cluster: 'pct-recovery',
        intent: 'comparison',
        competitorPresence: 'Huge emerging trend, low high-authority medical content',
        competitorDomain: 'anabolicminds.com',
        recommendedDestination: '/blog',
    },
    {
        keyword: 'Masteron vs Primobolan hair loss DHT sensitivity',
        language: 'en',
        cluster: 'anabolic-steroids',
        intent: 'comparison',
        competitorPresence: 'High user anxiety, opportunity for genetic harm reduction',
        competitorDomain: 'moreplatesmoredates.com',
        recommendedDestination: '/genetic',
    },
    {
        keyword: 'Subcutaneous vs intramuscular testosterone injection absorption rate',
        language: 'en',
        cluster: 'smart-tools',
        intent: 'informational',
        competitorPresence: 'Forum debates; clear visual anatomical guide needed',
        competitorDomain: 'anabolicminds.com',
        recommendedDestination: '/injection',
    },
    {
        keyword: 'Halotestin aggression mechanisms and pre workout timing',
        language: 'en',
        cluster: 'anabolic-steroids',
        intent: 'informational',
        competitorPresence: 'Fragmented advice; powerlifters searching for guidelines',
        competitorDomain: 'anabolicminds.com',
        recommendedDestination: '/blog',
    },

    // Arabic Market Gaps (Arab Competitor Insights)
    {
        keyword: 'جدول تحاليل كمال الاجسام قبل وبعد الكورس الشامل',
        language: 'ar',
        cluster: 'hormone-safety',
        intent: 'informational',
        competitorPresence: 'محتوى سطحي في المواقع العربية؛ لا توجد قوالب تحاليل تفاعلية',
        competitorDomain: 'egyfitness.net',
        recommendedDestination: '/lab',
    },
    {
        keyword: 'محاكي عمر النصف للاستيرويد وحساب تركيز الهرمون في الدم',
        language: 'ar',
        cluster: 'smart-tools',
        intent: 'informational',
        competitorPresence: 'شبه معدوم كأداة تفاعلية؛ فرصة هيمنة رقمية في الشرق الأوسط',
        competitorDomain: 'arabiafit.com',
        recommendedDestination: '/halflife',
    },
    {
        keyword: 'طريقة حساب جرعة الكلين بترول بالمايكروغرام والتدرج',
        language: 'ar',
        cluster: 'cutting-fatloss',
        intent: 'informational',
        competitorPresence: 'تضارب كبير في نصائح الجيم وخطر الجرعات الزائدة',
        competitorDomain: 'egyfitness.net',
        recommendedDestination: '/macro',
    },
    {
        keyword: 'متى يبدأ كورس التنظيف بعد التيست سيبونات وانانثات',
        language: 'ar',
        cluster: 'pct-recovery',
        intent: 'question',
        competitorPresence: 'أخطاء شائعة جداً في توقيت الـ PCT تسبب انهيار الهرمونات',
        competitorDomain: 'fitbodyiq.com',
        recommendedDestination: '/blog',
    },
    {
        keyword: 'أماكن حقن العضلات الصغيرة الكتف الخلفي والترايسبس بأمان',
        language: 'ar',
        cluster: 'smart-tools',
        intent: 'informational',
        competitorPresence: 'فيديوهات عشوائية؛ عدم وجود دليل تشريحي موثوق',
        competitorDomain: 'egyfitness.net',
        recommendedDestination: '/injection',
    },
    {
        keyword: 'الفرق بين الماسترون والبريموبولان في التنشيف وصلابة العضلات',
        language: 'ar',
        cluster: 'anabolic-steroids',
        intent: 'comparison',
        competitorPresence: 'مقارنات غير مبنية على نسب الدهون والتحاليل',
        competitorDomain: 'arabiafit.com',
        recommendedDestination: '/bodyfat',
    },
];
