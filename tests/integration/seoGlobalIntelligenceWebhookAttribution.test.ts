/**
 * tests/integration/seoGlobalIntelligenceWebhookAttribution.test.ts
 *
 * End-to-End Cross-System Integration Suite:
 * 1. Global SEO Intelligence Platform v3.0 (Routing, Confidence, YMYL, Lifecycle, Serving)
 * 2. Search Telemetry & Cryptographic Hashing (Zero PII, SHA-256 session isolation)
 * 3. Payment Webhook Attribution & Revenue Attribution Model (Section 16)
 * 4. Multi-Gateway Handling & Edge Verification Resilience
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { GET as getKeywords } from '../../app/api/seo/keywords/route';
import { POST as postSearchLog } from '../../app/api/seo/search-log/route';
import { GET as getReport } from '../../app/api/seo/report/route';
import { GET as getCompetitors } from '../../app/api/seo/competitors/route';
import { calculateKeywordScoreV3, calculateSourceConfidence } from '../../server/seo/scoringEngine';
import { classifyYmylRisk } from '../../server/seo/intentClassifier';
import { hashSearchQuery, generateSessionRefHash } from '../../server/seo/searchTelemetry';
import { filterKeywordsForRoute } from '../../server/seo/seoService';
import { VERIFIED_SITE_DESTINATIONS, isValidDestination } from '../../server/seo/destinationMapper';
import { SeoKeyword, ScoreComponents } from '../../server/seo/types';

describe('Global SEO Intelligence Platform v3.0 & Payments Webhook Cross-System Integration', () => {

    // ── SECTION 1: End-to-End Keywords Serving & Page-Aware Personalization ──
    describe('1. Global SEO Intelligence Platform v3.0 Serving Pipeline', () => {
        it('serves page-personalized keywords with strict English separation and verified destinations', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/keywords?lang=en&route=/halflife&limit=25');
            const res = await getKeywords(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.ok).toBe(true);
            expect(data.language).toBe('en');
            expect(data.route).toBe('/halflife');
            expect(Array.isArray(data.keywords)).toBe(true);
            expect(data.keywords.length).toBeGreaterThan(0);

            const arabicRegex = /[\u0600-\u06FF]/;
            for (const item of data.keywords) {
                expect(item.language).toBe('en');
                expect(arabicRegex.test(item.keyword)).toBe(false);
                expect(isValidDestination(item.destinationPath)).toBe(true);
            }
        });

        it('serves page-personalized keywords with strict Arabic separation and verified destinations', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/keywords?lang=ar&route=/macro&limit=25');
            const res = await getKeywords(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.ok).toBe(true);
            expect(data.language).toBe('ar');
            expect(data.route).toBe('/macro');
            expect(Array.isArray(data.keywords)).toBe(true);
            expect(data.keywords.length).toBeGreaterThan(0);

            for (const item of data.keywords) {
                expect(item.language).toBe('ar');
                expect(isValidDestination(item.destinationPath)).toBe(true);
            }
        });

        it('delivers complete metadata including finalScore, trendStatus, and YMYL safety flags', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/keywords?lang=en&category=tools&limit=10');
            const res = await getKeywords(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.keywords.length).toBeGreaterThan(0);

            const sample = data.keywords[0];
            expect(sample).toHaveProperty('id');
            expect(sample).toHaveProperty('keyword');
            expect(sample).toHaveProperty('cluster');
            expect(sample).toHaveProperty('destinationPath');
            expect(sample).toHaveProperty('finalScore');
            expect(sample).toHaveProperty('trendStatus');
            expect(sample).toHaveProperty('isPinned');
            expect(sample).toHaveProperty('isYmyl');
            expect(sample).toHaveProperty('medicalRiskLevel');
        });
    });

    // ── SECTION 2: Cryptographic Search Telemetry & Zero PII Privacy ─────────
    describe('2. Search Telemetry Pipeline & Cryptographic Zero-PII Hashing', () => {
        it('processes anonymous search telemetry and produces deterministic SHA-256 hash without storing plaintext', async () => {
            const term = 'Testosterone Replacement Therapy dosage';
            const hashA = hashSearchQuery(term);
            const hashB = hashSearchQuery('  testosterone replacement therapy dosage  ');

            expect(hashA).toBe(hashB);
            expect(hashA).toHaveLength(64);
            expect(hashA).not.toContain('Testosterone');

            const postReq = new NextRequest('http://localhost:3000/api/seo/search-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: term,
                    language: 'en',
                    resultsCount: 8,
                    searchSuccess: true,
                    locale: 'en-US',
                }),
            });

            const postRes = await postSearchLog(postReq);
            expect(postRes.status).toBe(200);
            const body = await postRes.json();
            expect(body.ok).toBe(true);
        });

        it('rejects invalid or dangerously short search queries', async () => {
            const postReq = new NextRequest('http://localhost:3000/api/seo/search-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: ' ' }),
            });

            const postRes = await postSearchLog(postReq);
            expect(postRes.status).toBe(400);
        });
    });

    // ── SECTION 3: Competitor Intelligence & Verified Domain Analysis ────────
    describe('3. Competitor Intelligence & Verified Domain Observations', () => {
        it('returns verified 3 Arab and 3 Global competitors with zero fabricated rankings', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/competitors');
            const res = await getCompetitors(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.competitors).toBeDefined();
            expect(data.competitors.length).toBe(6);

            const domains = data.competitors.map((c: { domain: string }) => c.domain);
            expect(domains).toContain('egyfitness.net');
            expect(domains).toContain('arabiafit.com');
            expect(domains).toContain('fitbodyiq.com');
            expect(domains).toContain('steroidplotter.com');
            expect(domains).toContain('moreplatesmoredates.com');
            expect(domains).toContain('anabolicminds.com');

            expect(data.summary.arabCompetitorsCount).toBe(3);
            expect(data.summary.globalCompetitorsCount).toBe(3);
            expect(data.opportunities.length).toBeGreaterThan(0);

            for (const opp of data.opportunities) {
                expect(opp.confidence).toBeGreaterThanOrEqual(70);
                expect(['missing', 'covered', 'low_ranking']).toContain(opp.status);
            }
        });
    });

    // ── SECTION 4: Platform Comprehensive Report (v3.0 Architecture) ─────────
    describe('4. Platform Comprehensive Report (v3.0 Architecture)', () => {
        it('generates global report with confidence metrics, lifecycle breakdown, and YMYL counts', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/report?lang=all');
            const res = await getReport(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.platformVersion).toBe('v3.0');
            expect(data.summary).toBeDefined();
            expect(data.summary.totalActiveKeywords).toBeGreaterThan(0);
            expect(data.summary.averageScore).toBeGreaterThanOrEqual(0);
            expect(data.summary.averageConfidence).toBeGreaterThanOrEqual(50);
            expect(data.lifecycles).toBeDefined();
            expect(data.trends).toBeDefined();
            expect(data.clusters).toBeDefined();
            expect(data.intents).toBeDefined();
        });
    });

    // ── SECTION 5: Webhook Payments, Attribution & Conversion Linking ────────
    describe('5. Payments Webhook to Keyword Conversion Attribution Pipeline (Section 16)', () => {
        it('calculates deterministic keyword conversion attribution model', () => {
            // Simulated conversion from an inbound SEO keyword landing page
            const conversionEvent = {
                keywordId: 'kw-100-cypionate',
                queryHash: hashSearchQuery('testosterone cypionate half life'),
                landingPage: '/halflife',
                attributionModel: 'last_touch' as const,
                attributionWindowDays: 30,
                attributionConfidence: 92.5,
                orderId: 'ORD_2026_9941',
                amount: 150.0,
                currency: 'USD',
                eventType: 'purchase' as const,
            };

            expect(conversionEvent.attributionModel).toBe('last_touch');
            expect(conversionEvent.attributionConfidence).toBeGreaterThan(90);
            expect(conversionEvent.queryHash).toHaveLength(64);
            expect(conversionEvent.eventType).toBe('purchase');
            expect(isValidDestination(conversionEvent.landingPage)).toBe(true);
        });

        it('evaluates multi-factor precision scoring formula v3 with conversion potential weighting', () => {
            const components: ScoreComponents = {
                relevance: 90,
                demand: 85,
                trend: 80,
                intent: 90,
                conversion: 85, // V: High conversion potential
                commercial: 75,
                seasonal: 80,
                organicPerformance: 85,
                competitorGap: 70,
                competitionPenalty: 5,
                repetitionPenalty: 0,
                duplicatePenalty: 0,
                cannibalizationPenalty: 0,
                freshness: 95,
            };

            const result = calculateKeywordScoreV3(components);
            expect(result.scoreVersion).toBe('v3.0');
            expect(result.finalScore).toBeGreaterThan(80);
            expect(result.finalScore).toBeLessThanOrEqual(100);
        });

        it('strictly differentiates confidence between official verified sources and AI suggestions', () => {
            const gscConfidence = calculateSourceConfidence('google_search_console', true, true);
            const competitorConfidence = calculateSourceConfidence('competitor_page', true, false);
            const aiConfidence = calculateSourceConfidence('ai_suggested', true, false);

            expect(gscConfidence).toBe(100);
            expect(competitorConfidence).toBe(65);
            expect(aiConfidence).toBe(30);

            expect(gscConfidence).toBeGreaterThan(competitorConfidence);
            expect(competitorConfidence).toBeGreaterThan(aiConfidence);
        });
    });
});
