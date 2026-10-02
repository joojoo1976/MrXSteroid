/**
 * tests/integration/seoSourceTierTruth.test.ts
 * T1 - FALSE-PASS PROTECTION (prompt 62).
 *
 * The pre-existing suites only asserted status===200 and keywords.length>0. That is
 * exactly the check that let a pure baseline fallback pass as "Dynamic Keyword
 * Intelligence works" (5, 84). These tests assert RESPONSE PROVENANCE:
 *   - every response declares exactly one sourceTier
 *   - a 200 that served the curated baseline reports itself as degraded
 *   - an empty database is reported as baseline, never as snapshot
 *   - no response invents a volume/CPC/difficulty metric
 */
import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';

import { GET as getKeywords } from '../../app/api/seo/keywords/route';
import { inferDataKind } from '../../server/seo/seoService';
import type { SeoKeywordSnapshotData } from '../../server/seo/types';

const ALLOWED_TIERS = ['snapshot', 'database', 'baseline'];

describe('T1 · keyword API declares its true source tier', () => {
    it('always returns a sourceTier from the allowed set', async () => {
        for (const lang of ['en', 'ar']) {
            const res = await getKeywords(
                new NextRequest(`http://localhost:3000/api/seo/keywords?lang=${lang}&limit=25`)
            );
            expect(res.status).toBe(200);
            const data = await res.json();

            expect(ALLOWED_TIERS).toContain(data.sourceTier);
            expect(typeof data.dataKind).toBe('string');
            // The boolean must agree with the tier — there is no way to claim
            // dynamic availability while actually serving baseline.
            expect(data.dynamicAvailable).toBe(data.sourceTier !== 'baseline');
            expect(data.degraded).toBe(data.sourceTier === 'baseline');
        }
    });

    it('marks a baseline-served response as degraded with a stated reason', async () => {
        const res = await getKeywords(
            new NextRequest('http://localhost:3000/api/seo/keywords?lang=en&limit=25')
        );
        const data = await res.json();

        if (data.sourceTier === 'baseline') {
            // Test 1 of §62: HTTP 200 + baseline ONLY must NOT read as a pass.
            expect(data.dynamicAvailable).toBe(false);
            expect(data.degradedReason).toBeTruthy();
            expect(data.dataKind).toBe('curated');
            // A degraded payload must never be cached as a healthy one.
            expect(res.headers.get('cache-control')).toBe('no-store');
        } else {
            expect(data.degradedReason).toBeNull();
        }
    });

    it('never fabricates demand metrics on any served row', async () => {
        const res = await getKeywords(
            new NextRequest('http://localhost:3000/api/seo/keywords?lang=en&limit=50')
        );
        const data = await res.json();

        for (const kw of data.keywords ?? []) {
            // Any metric-shaped field must be absent/null, never a number that
            // pretends to come from a provider we have no connection to.
            expect(kw.searchVolume ?? null).toBeNull();
            expect(kw.cpc ?? null).toBeNull();
            expect(kw.difficulty ?? null).toBeNull();
            expect(kw.search_volume ?? null).toBeNull();
        }
    });

    it('echoes market without pretending to filter by it', async () => {
        const res = await getKeywords(
            new NextRequest('http://localhost:3000/api/seo/keywords?lang=ar&market=ar-SA&limit=10')
        );
        const data = await res.json();
        // Market is accepted and echoed (forward compatibility with STEP 14)
        // but the system must not claim a capability it does not have yet.
        expect(data.market).toBe('ar-SA');
        expect(ALLOWED_TIERS).toContain(data.sourceTier);
    });
});

describe('T1 · dataKind inference never overstates evidence', () => {
    const snap = (rows: Array<{ source?: string }>): Pick<SeoKeywordSnapshotData, 'categories'> =>
        ({ categories: { all: rows } }) as unknown as Pick<SeoKeywordSnapshotData, 'categories'>;

    it('reports an empty snapshot as unavailable', () => {
        expect(inferDataKind(snap([]))).toBe('unavailable');
    });

    it('reports baseline/editorial rows as curated', () => {
        expect(inferDataKind(snap([{ source: 'baseline' }, { source: 'editorial' }]))).toBe('curated');
    });

    it('reports ai_suggested rows as generated', () => {
        expect(inferDataKind(snap([{ source: 'ai_suggested' }]))).toBe('generated');
    });

    it('reports a first-party observed source as observed', () => {
        expect(inferDataKind(snap([{ source: 'google_search_console' }]))).toBe('observed');
        expect(inferDataKind(snap([{ source: 'internal_search' }]))).toBe('observed');
    });

    it('never upgrades an unknown source to observed', () => {
        expect(inferDataKind(snap([{ source: 'mystery_provider' }]))).toBe('unavailable');
        expect(inferDataKind(snap([{}]))).toBe('unavailable');
    });

    it('reports the weakest claim when provenance is mixed', () => {
        expect(inferDataKind(snap([{ source: 'google_search_console' }, { source: 'mystery' }])))
            .toBe('unavailable');
    });
});
