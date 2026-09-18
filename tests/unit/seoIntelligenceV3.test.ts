/**
 * tests/unit/seoIntelligenceV3.test.ts
 * Unit tests for Global SEO Intelligence Platform v3.0 core engines:
 * - calculateKeywordScoreV3 precision formula
 * - calculateSourceConfidence scoring
 * - classifyYmylRisk safety classification
 * - filterKeywordsForRoute page-level personalization
 */

import { describe, it, expect } from 'vitest';
import {
    calculateKeywordScoreV3,
    calculateSourceConfidence,
    V3_SCORING_WEIGHTS,
} from '../../server/seo/scoringEngine';
import { classifyYmylRisk } from '../../server/seo/intentClassifier';
import { filterKeywordsForRoute } from '../../server/seo/seoService';
import { SeoKeyword, ScoreComponents } from '../../server/seo/types';

describe('Global SEO Intelligence Platform v3.0 Core Engines', () => {

    describe('1. calculateKeywordScoreV3 formula validation', () => {
        it('accurately computes positive and penalty scores', () => {
            const components: ScoreComponents = {
                relevance: 95,          // 95 * 0.20 = 19.0
                demand: 80,             // 80 * 0.12 = 9.6
                trend: 85,              // 85 * 0.12 = 10.2
                intent: 90,             // 90 * 0.15 = 13.5
                conversion: 75,         // 75 * 0.12 = 9.0
                commercial: 70,         // 70 * 0.10 = 7.0
                seasonal: 90,           // 90 * 0.08 = 7.2
                organicPerformance: 80, // 80 * 0.06 = 4.8
                competitorGap: 60,      // 60 * 0.05 = 3.0
                // Positive sum: 19 + 9.6 + 10.2 + 13.5 + 9 + 7 + 7.2 + 4.8 + 3 = 83.3

                competitionPenalty: 10,     // 10 * 0.08 = 0.8
                repetitionPenalty: 5,       //  5 * 0.05 = 0.25
                duplicatePenalty: 0,        //  0 * 0.05 = 0.0
                cannibalizationPenalty: 0,  //  0 * 0.05 = 0.0
                // Penalties sum: 0.8 + 0.25 = 1.05
                // Raw Score: 83.3 - 1.05 = 82.25
                freshness: 90,
            };

            const result = calculateKeywordScoreV3(components);
            expect(result.scoreVersion).toBe('v3.0');
            expect(result.finalScore).toBe(82.25);
            expect(result.rawScore).toBe(82.25);
        });

        it('clamps negative scores to zero', () => {
            const extremeNegative: ScoreComponents = {
                relevance: 0,
                demand: 0,
                trend: 0,
                commercial: 0,
                freshness: 0,
                seasonal: 0,
                competitionPenalty: 100,
                repetitionPenalty: 100,
                duplicatePenalty: 100,
                cannibalizationPenalty: 100,
            };

            const result = calculateKeywordScoreV3(extremeNegative);
            expect(result.finalScore).toBe(0);
            expect(result.rawScore).toBeLessThan(0);
        });
    });

    describe('2. calculateSourceConfidence', () => {
        it('assigns highest confidence to Google Search Console and lowest to AI suggestions', () => {
            const gscConf = calculateSourceConfidence('google_search_console', true, true);
            const internalConf = calculateSourceConfidence('internal_search', true, false);
            const aiConf = calculateSourceConfidence('ai_suggested', true, false);

            expect(gscConf).toBe(100); // 95 + 5
            expect(internalConf).toBe(85);
            expect(aiConf).toBe(30);
            expect(gscConf).toBeGreaterThan(internalConf);
            expect(internalConf).toBeGreaterThan(aiConf);
        });

        it('deducts confidence when supporting page is missing', () => {
            const withPage = calculateSourceConfidence('competitor', true, false);
            const withoutPage = calculateSourceConfidence('competitor', false, false);

            expect(withPage).toBe(65);
            expect(withoutPage).toBe(50); // 65 - 15
        });
    });

    describe('3. classifyYmylRisk', () => {
        it('flags dangerous compounds and injection protocols as high risk requiring review', () => {
            const trenEn = classifyYmylRisk('Trenbolone acetate cutting cycle', 'en');
            const trenAr = classifyYmylRisk('جرعة ترينبولون للمحترفين', 'ar');
            const injectionAr = classifyYmylRisk('طريقة حقن التستوستيرون في العضل', 'ar');

            expect(trenEn.isYmyl).toBe(true);
            expect(trenEn.medicalRiskLevel).toBe('high');
            expect(trenEn.requiresReview).toBe(true);

            expect(trenAr.medicalRiskLevel).toBe('high');
            expect(injectionAr.requiresReview).toBe(true);
        });

        it('classifies general fitness/macro terms as low risk not requiring review', () => {
            const macroEn = classifyYmylRisk('Macro Calculator for Bodybuilding', 'en');
            const macroAr = classifyYmylRisk('حاسبة السعرات الحرارية والماكروز', 'ar');

            expect(macroEn.medicalRiskLevel).toBe('low');
            expect(macroEn.requiresReview).toBe(false);
            expect(macroAr.medicalRiskLevel).toBe('low');
        });
    });

    describe('4. filterKeywordsForRoute (Page-Level Personalization)', () => {
        const sampleKeywords: SeoKeyword[] = [
            {
                originalKeyword: 'Macro Calculator',
                normalizedKeyword: 'macro calculator',
                language: 'en',
                locale: 'en-US',
                cluster: 'cutting-fatloss',
                intent: 'tool',
                trendStatus: 'stable',
                destinationPath: '/macro',
                score: 90,
                scoreComponents: { relevance: 90, demand: 80, trend: 70, commercial: 60, freshness: 90, seasonal: 80, competitionPenalty: 0, duplicatePenalty: 0 },
                source: 'baseline',
                lastObservedAt: '2026-09-18T00:00:00Z',
                isActive: true,
            },
            {
                originalKeyword: 'Steroid Half-Life Simulator',
                normalizedKeyword: 'steroid half life simulator',
                language: 'en',
                locale: 'en-US',
                cluster: 'smart-tools',
                intent: 'tool',
                trendStatus: 'rising',
                destinationPath: '/halflife',
                score: 95,
                scoreComponents: { relevance: 95, demand: 85, trend: 90, commercial: 70, freshness: 95, seasonal: 75, competitionPenalty: 0, duplicatePenalty: 0 },
                source: 'baseline',
                lastObservedAt: '2026-09-18T00:00:00Z',
                isActive: true,
            },
            {
                originalKeyword: 'Bodybuilder Blood Work Reference',
                normalizedKeyword: 'bodybuilder blood work reference',
                language: 'en',
                locale: 'en-US',
                cluster: 'hormone-safety',
                intent: 'tool',
                trendStatus: 'stable',
                destinationPath: '/lab',
                score: 88,
                scoreComponents: { relevance: 90, demand: 80, trend: 75, commercial: 65, freshness: 90, seasonal: 70, competitionPenalty: 0, duplicatePenalty: 0 },
                source: 'baseline',
                lastObservedAt: '2026-09-18T00:00:00Z',
                isActive: true,
            },
        ];

        it('prioritizes exact destination route matches', () => {
            const results = filterKeywordsForRoute(sampleKeywords, '/halflife', 10);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].destinationPath).toBe('/halflife');
        });

        it('returns all keywords when home route / is requested', () => {
            const results = filterKeywordsForRoute(sampleKeywords, '/', 10);
            expect(results.length).toBe(3);
        });
    });
});
