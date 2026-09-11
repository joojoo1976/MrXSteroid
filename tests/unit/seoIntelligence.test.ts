/**
 * tests/unit/seoIntelligence.test.ts
 * Unit tests for Intent Classification, Scoring Engine, Freshness Decay & Destination Mapping.
 */

import { describe, it, expect } from 'vitest';
import { classifySearchIntent } from '../../server/seo/intentClassifier';
import {
    calculateKeywordScore,
    calculateFreshnessScore,
    calculateSeasonalScore,
    determineTrendStatus,
    DEFAULT_SCORING_WEIGHTS,
} from '../../server/seo/scoringEngine';
import {
    resolveDestination,
    isValidDestination,
    VERIFIED_SITE_DESTINATIONS,
} from '../../server/seo/destinationMapper';

describe('Search Intent Classification — English', () => {
    it('classifies transactional queries correctly', () => {
        expect(classifySearchIntent('buy anabolic cycle guide', 'en')).toBe('transactional');
        expect(classifySearchIntent('download steroid protocol ebook price', 'en')).toBe('transactional');
        expect(classifySearchIntent('checkout mr x coaching package', 'en')).toBe('transactional');
    });

    it('classifies comparison queries correctly', () => {
        expect(classifySearchIntent('nolvadex vs clomid for pct', 'en')).toBe('comparison');
        expect(classifySearchIntent('difference between enanthate and cypionate', 'en')).toBe('comparison');
    });

    it('classifies question queries correctly', () => {
        expect(classifySearchIntent('how to prevent gynecomastia on cycle', 'en')).toBe('question');
        expect(classifySearchIntent('what age can you start an anabolic cycle', 'en')).toBe('question');
        expect(classifySearchIntent('how many weeks should a first cycle last', 'en')).toBe('question');
    });

    it('classifies commercial queries correctly', () => {
        expect(classifySearchIntent('best bodybuilding supplement stack', 'en')).toBe('commercial');
        expect(classifySearchIntent('top cutting cycle recommendations review', 'en')).toBe('commercial');
    });

    it('classifies navigational queries correctly', () => {
        expect(classifySearchIntent('mr x steroid login dashboard', 'en')).toBe('navigational');
        expect(classifySearchIntent('mr x steroid support', 'en')).toBe('navigational');
    });

    it('classifies informational queries correctly', () => {
        expect(classifySearchIntent('steroid half-life simulator chart', 'en')).toBe('informational');
        expect(classifySearchIntent('macro calculator calorie deficit formulas', 'en')).toBe('informational');
    });

    it('returns unknown for single characters or gibberish', () => {
        expect(classifySearchIntent('x', 'en')).toBe('unknown');
    });
});

describe('Search Intent Classification — Arabic', () => {
    it('classifies transactional queries correctly', () => {
        expect(classifySearchIntent('شراء كتاب مستر إكس ستيرويد', 'ar')).toBe('transactional');
        expect(classifySearchIntent('سعر كورس الهرمون وطرق الدفع', 'ar')).toBe('transactional');
        expect(classifySearchIntent('تحميل بروتوكول كمال الأجسام', 'ar')).toBe('transactional');
    });

    it('classifies comparison queries correctly', () => {
        expect(classifySearchIntent('الفرق بين نولفادكس وكلوميد للتنظيف', 'ar')).toBe('comparison');
        expect(classifySearchIntent('مقارنة بين تيست انانثات وتيست سيبيونات', 'ar')).toBe('comparison');
    });

    it('classifies question queries correctly', () => {
        expect(classifySearchIntent('كيف أتجنب التثدي أثناء السايكل', 'ar')).toBe('question');
        expect(classifySearchIntent('ما هو أفضل كورس للمبتدئين', 'ar')).toBe('question');
        expect(classifySearchIntent('كم مدة أول كورس هرمون بالأسابيع', 'ar')).toBe('question');
    });

    it('classifies commercial queries correctly', () => {
        expect(classifySearchIntent('أفضل مكملات دعم الكبد', 'ar')).toBe('commercial');
        expect(classifySearchIntent('تقييم برنامج التنشيف الاحترافي', 'ar')).toBe('commercial');
    });

    it('classifies informational queries correctly', () => {
        expect(classifySearchIntent('حاسبة الماكروز والسعرات الحرارية', 'ar')).toBe('informational');
        expect(classifySearchIntent('جدول جرعات الهرمون الأسبوعية', 'ar')).toBe('informational');
    });
});

describe('Scoring Engine & Explainability', () => {
    it('calculates score within [0, 100] with default weights', () => {
        const components = {
            relevance: 95,
            demand: 90,
            trend: 85,
            commercial: 80,
            freshness: 100,
            seasonal: 90,
            competitorGap: 70,
            competitionPenalty: 0,
            duplicatePenalty: 0,
        };
        const score = calculateKeywordScore(components, DEFAULT_SCORING_WEIGHTS);
        expect(score).toBeGreaterThan(80);
        expect(score).toBeLessThanOrEqual(100);
    });

    it('applies competition and duplicate penalties accurately', () => {
        const base = {
            relevance: 90,
            demand: 90,
            trend: 80,
            commercial: 80,
            freshness: 90,
            seasonal: 80,
            competitorGap: 50,
            competitionPenalty: 0,
            duplicatePenalty: 0,
        };
        const penalized = {
            ...base,
            competitionPenalty: 50,
            duplicatePenalty: 50,
        };
        const scoreBase = calculateKeywordScore(base);
        const scorePenalized = calculateKeywordScore(penalized);
        expect(scorePenalized).toBeLessThan(scoreBase);
    });

    it('calculates freshness decay over days', () => {
        expect(calculateFreshnessScore(0)).toBe(100);
        expect(calculateFreshnessScore(10)).toBe(85);
        expect(calculateFreshnessScore(30)).toBe(55);
        expect(calculateFreshnessScore(100)).toBe(10); // hits floor at 10
    });

    it('calculates seasonal multipliers for summer and winter', () => {
        // July (month 7) = Summer cut
        const summerCutting = calculateSeasonalScore('cutting-fatloss', 7);
        const summerBulking = calculateSeasonalScore('bulking-mass', 7);
        expect(summerCutting).toBeGreaterThan(summerBulking);

        // November (month 11) = Winter bulk
        const winterCutting = calculateSeasonalScore('cutting-fatloss', 11);
        const winterBulking = calculateSeasonalScore('bulking-mass', 11);
        expect(winterBulking).toBeGreaterThan(winterCutting);
    });

    it('determines TrendStatus transitions correctly', () => {
        // NEW: Seen within 7 days
        expect(determineTrendStatus({ daysSinceFirstSeen: 3, daysSinceLastObserved: 1, trendScore: 70, overallScore: 75 })).toBe('new');

        // RISING: High trend score within 14 days
        expect(determineTrendStatus({ daysSinceFirstSeen: 20, daysSinceLastObserved: 2, trendScore: 92, overallScore: 88 })).toBe('rising');

        // STABLE: Regular observation
        expect(determineTrendStatus({ daysSinceFirstSeen: 40, daysSinceLastObserved: 10, trendScore: 70, overallScore: 75 })).toBe('stable');

        // DECLINING: Not seen for > 30 days
        expect(determineTrendStatus({ daysSinceFirstSeen: 60, daysSinceLastObserved: 35, trendScore: 45, overallScore: 55 })).toBe('declining');

        // RETIRED: Inactive for > 60 days or low score
        expect(determineTrendStatus({ daysSinceFirstSeen: 120, daysSinceLastObserved: 70, trendScore: 30, overallScore: 35 })).toBe('retired');
        expect(determineTrendStatus({ daysSinceFirstSeen: 50, daysSinceLastObserved: 10, trendScore: 50, overallScore: 35 })).toBe('retired');
    });
});

describe('Destination Mapping & 404 Prevention', () => {
    it('all verified site destinations exist in registry', () => {
        expect(Object.keys(VERIFIED_SITE_DESTINATIONS).length).toBeGreaterThanOrEqual(10);
        expect(isValidDestination('/macro')).toBe(true);
        expect(isValidDestination('/bodyfat')).toBe(true);
        expect(isValidDestination('/halflife')).toBe(true);
        expect(isValidDestination('/injection')).toBe(true);
        expect(isValidDestination('/lab')).toBe(true);
        expect(isValidDestination('/cycle')).toBe(true);
        expect(isValidDestination('/checkout')).toBe(true);
    });

    it('rejects invalid or non-existent destination paths', () => {
        expect(isValidDestination('/fake-page-404')).toBe(false);
        expect(isValidDestination('/non-existent-tool')).toBe(false);
        expect(isValidDestination('')).toBe(false);
    });

    it('resolves appropriate destination for macro keywords', () => {
        const dest = resolveDestination('Macro calculator for bodybuilding', 'smart-tools', 'informational');
        expect(dest.path).toBe('/macro');
        expect(isValidDestination(dest.path)).toBe(true);
    });

    it('resolves appropriate destination for half-life simulator keywords', () => {
        const dest = resolveDestination('Steroid half-life simulator', 'smart-tools', 'informational');
        expect(dest.path).toBe('/halflife');
        expect(isValidDestination(dest.path)).toBe(true);
    });

    it('resolves appropriate destination for transactional purchase keywords', () => {
        const dest = resolveDestination('Buy Mr X Steroid Complete Guide', 'commercial', 'transactional');
        expect(dest.path).toBe('/checkout');
        expect(isValidDestination(dest.path)).toBe(true);
    });

    it('guarantees that resolved destination is always verified and never 404', () => {
        const testKeywords = [
            { kw: 'random bodybuilding test query', cluster: 'general', intent: 'informational' as const },
            { kw: 'خريطة حقن العضلات', cluster: 'smart-tools', intent: 'informational' as const },
            { kw: 'كيف أبدأ أول سايكل', cluster: 'bulking-mass', intent: 'question' as const },
            { kw: 'شراء البروتوكول', cluster: 'commercial', intent: 'transactional' as const },
        ];
        for (const item of testKeywords) {
            const dest = resolveDestination(item.kw, item.cluster, item.intent);
            expect(isValidDestination(dest.path)).toBe(true);
        }
    });
});
