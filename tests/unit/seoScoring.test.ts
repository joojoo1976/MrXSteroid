/**
 * tests/unit/seoScoring.test.ts
 *
 * Unit tests for the Multi-Factor Keyword Scoring Engine (server/seo/scoringEngine.ts).
 * Tests:
 * - Weighted scoring formula
 * - Score bounds clamping [0, 100]
 * - Penalty deductions (competition & duplicate)
 * - Freshness score decay over days
 * - Seasonal relevance by cluster and month (Spring cutting vs Winter bulking)
 * - TrendStatus transitions (new, rising, stable, declining, retired)
 */

import { describe, it, expect } from 'vitest';
import {
    calculateKeywordScore,
    calculateFreshnessScore,
    calculateSeasonalScore,
    determineTrendStatus,
    DEFAULT_SCORING_WEIGHTS,
} from '../../server/seo/scoringEngine';
import { ScoreComponents } from '../../server/seo/types';

describe('SEO Scoring Engine (server/seo/scoringEngine.ts)', () => {

    describe('1. calculateKeywordScore', () => {
        it('calculates expected score with default weights', () => {
            const components: ScoreComponents = {
                relevance: 90,           // 90 * 0.25 = 22.5
                demand: 80,              // 80 * 0.15 = 12.0
                trend: 85,               // 85 * 0.15 = 12.75
                commercial: 70,          // 70 * 0.15 = 10.5
                freshness: 95,           // 95 * 0.10 = 9.5
                seasonal: 90,            // 90 * 0.10 = 9.0
                competitorGap: 60,       // 60 * 0.10 = 6.0
                competitionPenalty: 10,  // 10 * 0.05 = -0.5
                duplicatePenalty: 0,     //  0 * 0.05 = 0.0
            };
            // Expected: 22.5 + 12 + 12.75 + 10.5 + 9.5 + 9 + 6 - 0.5 = 81.75
            const score = calculateKeywordScore(components);
            expect(score).toBe(81.75);
        });

        it('strictly clamps scores to [0, 100]', () => {
            // Negative edge
            const worstComponents: ScoreComponents = {
                relevance: 0,
                demand: 0,
                trend: 0,
                commercial: 0,
                freshness: 0,
                seasonal: 0,
                competitorGap: 0,
                competitionPenalty: 100,
                duplicatePenalty: 100,
            };
            expect(calculateKeywordScore(worstComponents)).toBe(0);

            // Over-100 edge
            const superComponents: ScoreComponents = {
                relevance: 100,
                demand: 100,
                trend: 100,
                commercial: 100,
                freshness: 100,
                seasonal: 100,
                competitorGap: 100,
                competitionPenalty: 0,
                duplicatePenalty: 0,
            };
            expect(calculateKeywordScore(superComponents)).toBe(100);
        });

        it('deducts penalties appropriately', () => {
            const base: ScoreComponents = {
                relevance: 80,
                demand: 80,
                trend: 80,
                commercial: 80,
                freshness: 80,
                seasonal: 80,
                competitorGap: 80,
                competitionPenalty: 0,
                duplicatePenalty: 0,
            };
            const cleanScore = calculateKeywordScore(base);

            const penalized: ScoreComponents = {
                ...base,
                competitionPenalty: 40,
                duplicatePenalty: 20,
            };
            const penalizedScore = calculateKeywordScore(penalized);

            // Deductions: 40 * 0.05 + 20 * 0.05 = 2.0 + 1.0 = 3.0
            expect(cleanScore - penalizedScore).toBeCloseTo(3.0, 2);
        });
    });

    describe('2. calculateFreshnessScore', () => {
        it('returns 100 for newly observed keywords (0 days)', () => {
            expect(calculateFreshnessScore(0)).toBe(100);
            expect(calculateFreshnessScore(-5)).toBe(100);
        });

        it('linearly decays over time and floors at 10', () => {
            // Loses 1.5 per day
            expect(calculateFreshnessScore(10)).toBe(85);  // 100 - 15 = 85
            expect(calculateFreshnessScore(30)).toBe(55);  // 100 - 45 = 55
            expect(calculateFreshnessScore(60)).toBe(10);  // 100 - 90 = 10
            expect(calculateFreshnessScore(90)).toBe(10);  // floored at 10
        });
    });

    describe('3. calculateSeasonalScore', () => {
        it('elevates cutting-fatloss during spring and summer months (March - August)', () => {
            for (const month of [3, 4, 5, 6, 7, 8]) {
                const cuttingScore = calculateSeasonalScore('cutting-fatloss', month);
                const bulkingScore = calculateSeasonalScore('bulking-mass', month);
                expect(cuttingScore).toBe(95);
                expect(bulkingScore).toBe(70);
            }
        });

        it('elevates bulking-mass and pct-recovery during fall/winter months (Sept - Feb)', () => {
            for (const month of [9, 10, 11, 12, 1, 2]) {
                const bulkingScore = calculateSeasonalScore('bulking-mass', month);
                const pctScore = calculateSeasonalScore('pct-recovery', month);
                const cuttingScore = calculateSeasonalScore('cutting-fatloss', month);
                expect(bulkingScore).toBe(95);
                expect(pctScore).toBe(92);
                expect(cuttingScore).toBe(70);
            }
        });

        it('returns baseline 80 for general clusters', () => {
            expect(calculateSeasonalScore('general-bodybuilding', 5)).toBe(80);
        });
    });

    describe('4. determineTrendStatus', () => {
        it('marks keyword as "new" if first seen within 7 days', () => {
            const status = determineTrendStatus({
                daysSinceFirstSeen: 3,
                daysSinceLastObserved: 1,
                trendScore: 70,
                overallScore: 75,
            });
            expect(status).toBe('new');
        });

        it('marks keyword as "rising" if trendScore >= 85 and recently observed', () => {
            const status = determineTrendStatus({
                daysSinceFirstSeen: 25,
                daysSinceLastObserved: 2,
                trendScore: 90,
                overallScore: 82,
            });
            expect(status).toBe('rising');
        });

        it('marks keyword as "stable" if overall score >= 60 and observed within 30 days', () => {
            const status = determineTrendStatus({
                daysSinceFirstSeen: 45,
                daysSinceLastObserved: 10,
                trendScore: 70,
                overallScore: 68,
            });
            expect(status).toBe('stable');
        });

        it('marks keyword as "declining" if unobserved for > 30 days or low trend', () => {
            const status = determineTrendStatus({
                daysSinceFirstSeen: 80,
                daysSinceLastObserved: 35,
                trendScore: 40,
                overallScore: 55,
            });
            expect(status).toBe('declining');
        });

        it('marks keyword as "retired" after 4 cycles of inactivity or > 60 days unobserved', () => {
            const status = determineTrendStatus({
                daysSinceFirstSeen: 120,
                daysSinceLastObserved: 65,
                trendScore: 30,
                overallScore: 35,
                inactivityRefreshCycles: 4,
            });
            expect(status).toBe('retired');
        });
    });
});
