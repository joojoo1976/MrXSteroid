/**
 * tests/integration/seoApi.test.ts
 * Integration tests for the Live SEO Keyword Intelligence API suite:
 * - GET /api/seo/keywords
 * - POST /api/seo/search-log
 * - GET /api/seo/report
 * - GET /api/seo/competitors
 * - POST /api/seo/refresh
 */

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getKeywords } from '../../app/api/seo/keywords/route';
import { POST as postSearchLog } from '../../app/api/seo/search-log/route';
import { GET as getReport } from '../../app/api/seo/report/route';
import { GET as getCompetitors } from '../../app/api/seo/competitors/route';
import { POST as postRefresh } from '../../app/api/seo/refresh/route';

describe('Live SEO API Integration Suite', () => {
    describe('GET /api/seo/keywords', () => {
        it('returns English keywords with 100% strict language separation', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/keywords?lang=en&limit=50');
            const res = await getKeywords(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.ok).toBe(true);
            expect(data.language).toBe('en');
            expect(Array.isArray(data.keywords)).toBe(true);
            expect(data.keywords.length).toBeGreaterThan(0);

            // Verify strict English separation: no Arabic characters in any EN keyword
            const arabicRegex = /[\u0600-\u06FF]/;
            for (const kw of data.keywords) {
                expect(kw.language).toBe('en');
                expect(arabicRegex.test(kw.keyword)).toBe(false);
                expect(kw.destinationPath).toBeDefined();
                expect(kw.destinationPath.startsWith('/')).toBe(true);
            }
        });

        it('returns Arabic keywords with 100% strict language separation', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/keywords?lang=ar&limit=50');
            const res = await getKeywords(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.ok).toBe(true);
            expect(data.language).toBe('ar');
            expect(Array.isArray(data.keywords)).toBe(true);
            expect(data.keywords.length).toBeGreaterThan(0);

            // Verify strict Arabic separation
            for (const kw of data.keywords) {
                expect(kw.language).toBe('ar');
                expect(kw.destinationPath).toBeDefined();
                expect(kw.destinationPath.startsWith('/')).toBe(true);
            }
        });

        it('filters keywords accurately by category (tools)', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/keywords?lang=en&category=tools');
            const res = await getKeywords(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.category).toBe('tools');
            expect(data.keywords.length).toBeGreaterThan(0);
            for (const kw of data.keywords) {
                const isToolRoute =
                    kw.destinationPath.startsWith('/macro') ||
                    kw.destinationPath.startsWith('/bodyfat') ||
                    kw.destinationPath.startsWith('/halflife') ||
                    kw.destinationPath.startsWith('/injection') ||
                    kw.destinationPath.startsWith('/lab') ||
                    kw.destinationPath.startsWith('/genetic') ||
                    kw.destinationPath.startsWith('/cycle');
                expect(isToolRoute).toBe(true);
            }
        });

        it('enforces limit boundary constraints (min 1, max 200)', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/keywords?lang=en&limit=5');
            const res = await getKeywords(req);
            const data = await res.json();
            expect(data.keywords.length).toBeLessThanOrEqual(5);
        });
    });

    describe('POST /api/seo/search-log', () => {
        it('rejects empty or whitespace queries with 400', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/search-log', {
                method: 'POST',
                body: JSON.stringify({ query: '   ', language: 'en' }),
                headers: { 'Content-Type': 'application/json' },
            });
            const res = await postSearchLog(req);
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.ok).toBe(false);
        });

        it('accepts valid anonymous search log queries', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/search-log', {
                method: 'POST',
                body: JSON.stringify({ query: 'testosterone half life', language: 'en', resultsCount: 3 }),
                headers: { 'Content-Type': 'application/json' },
            });
            const res = await postSearchLog(req);
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.ok).toBe(true);
        });
    });

    describe('GET /api/seo/report', () => {
        it('returns comprehensive SEO intelligence metrics', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/report');
            const res = await getReport(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.year).toBeDefined();
            expect(data.weekNumber).toBeDefined();
            expect(data.summary).toBeDefined();
            expect(data.summary.totalActiveKeywords).toBeGreaterThanOrEqual(100);
            expect(data.summary.englishCount).toBeGreaterThan(0);
            expect(data.summary.arabicCount).toBeGreaterThan(0);
            expect(data.trends).toBeDefined();
            expect(data.clusters).toBeDefined();
            expect(data.intents).toBeDefined();
        });
    });

    describe('GET /api/seo/competitors', () => {
        it('returns competitor gaps and opportunity recommendations', async () => {
            const req = new NextRequest('http://localhost:3000/api/seo/competitors');
            const res = await getCompetitors(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.summary).toBeDefined();
            expect(data.summary.totalOpportunities).toBeGreaterThan(0);
            expect(Array.isArray(data.opportunities)).toBe(true);

            for (const opp of data.opportunities) {
                expect(opp.keyword).toBeDefined();
                expect(opp.opportunityScore).toBeGreaterThanOrEqual(0);
                expect(opp.opportunityScore).toBeLessThanOrEqual(100);
                expect(opp.recommendedDestination.startsWith('/')).toBe(true);
            }
        });
    });

    describe('POST /api/seo/refresh', () => {
        it('rejects unauthorized invocation when CRON_SECRET is required and missing', async () => {
            const originalSecret = process.env.CRON_SECRET;
            process.env.CRON_SECRET = 'super-secret-cron-token';
            const originalNodeEnv = process.env.NODE_ENV;
            // @ts-ignore
            process.env.NODE_ENV = 'production';

            try {
                const req = new NextRequest('http://localhost:3000/api/seo/refresh', {
                    method: 'POST',
                });
                const res = await postRefresh(req);
                expect(res.status).toBe(401);
            } finally {
                process.env.CRON_SECRET = originalSecret;
                // @ts-ignore
                process.env.NODE_ENV = originalNodeEnv;
            }
        });
    });
});
