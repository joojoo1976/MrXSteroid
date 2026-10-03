/**
 * Phase 2 — REAL source verification for the credential-free sources.
 *
 * ISOLATION NOTE — WHY LIVE NETWORK TESTS ARE OPT-IN
 * ----------------------------------------------------
 * These tests make REAL outbound requests. They pass individually but are
 * UNSTABLE inside the full parallel suite, where 170+ files compete for the same
 * socket pool: the request then fails with `fetch failed` after a ~10 s timeout.
 * That is an infrastructure symptom, not a product defect, and a test that only
 * fails under load is worse than no test — it trains people to ignore it.
 *
 * They therefore run only when explicitly requested:
 *     SEO_LIVE=1 npx vitest run tests/integration/seoPhase2LiveSources.test.ts
 * The credential-blocked assertions below always run: they are deterministic.
 */
import { describe, it, expect } from 'vitest';

import {
    COMMON_CRAWL_INDEX_ENDPOINT,
    extractCommonCrawlProvenance,
} from '../../server/seo/sources/commonCrawlAdapter';
import { resolveGscBlocked } from '../../server/seo/sources/gscAdapter';
import { resolveGoogleAdsBlocked } from '../../server/seo/sources/googleAdsAdapter';
import { resolveBingBlocked } from '../../server/seo/sources/bingAdapter';
import { resolveOfficialApiBlocked } from '../../server/seo/sources/googleTrendsAdapter';

const liveIt = process.env.SEO_LIVE === '1' ? it : it.skip;

describe('Phase 2 · LIVE Common Crawl (no credentials required)', () => {
    liveIt('the public index is reachable and returns a real collection list', async () => {
        const res = await fetch(`${COMMON_CRAWL_INDEX_ENDPOINT}/collinfo.json`, {
            signal: AbortSignal.timeout(30000),
        });
        expect(res.ok).toBe(true);

        const body = (await res.json()) as Array<{ id: string }>;
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        // A real crawl collection id, e.g. "CC-MAIN-2026-30".
        expect(body[0].id).toMatch(/^CC-MAIN-\d{4}-\d{2}$/);
    }, 40000);

    liveIt('a real index query returns a payload or a real refusal', async () => {
        const info = (await (
            await fetch(`${COMMON_CRAWL_INDEX_ENDPOINT}/collinfo.json`, {
                signal: AbortSignal.timeout(30000),
            })
        ).json()) as Array<{ id: string }>;
        const latest = info[0];

        const url = `${COMMON_CRAWL_INDEX_ENDPOINT}/${latest.id}-index?url=example.com&output=json&limit=1`;
        const res = await fetch(url, { signal: AbortSignal.timeout(30000) });

        if (res.ok) {
            const text = await res.text();
            expect(text.length).toBeGreaterThan(0);
            const first = JSON.parse(text.split('\n')[0]) as { url?: string };
            expect(first.url).toBeDefined();
            return;
        }

        // The index API is rate limited and returns 503/504 under load, and a
        // domain with no capture returns 404. All three are HONEST answers from
        // a live service; only a 5xx that is not a throttling code would be a
        // defect, and we do not assert on that here.
        expect([404, 429, 503, 504]).toContain(res.status);
    }, 40000);

    it('provenance is still honestly BLOCKED without a real adapter run', () => {
        // Reaching the index does NOT auto-verify the adapter: its provenance
        // helper must still refuse to claim a live run happened.
        expect(extractCommonCrawlProvenance().status).toBe('BLOCKED');
    });
});

describe('Phase 2 · BLOCKED sources state the exact missing dependency', () => {
    it('GSC names GSC_SITE_URL first', () => {
        expect(resolveGscBlocked({} as never, {})?.dependency).toBe('GSC_SITE_URL');
    });

    it('Google Ads names GOOGLE_ADS_CUSTOMER_ID, never the retired developer token', () => {
        const b = resolveGoogleAdsBlocked({ language: 'en', market: 'en-US', seeds: ['x'] }, {});
        expect(b?.dependency).toBe('GOOGLE_ADS_CUSTOMER_ID');
    });

    it('Bing names BING_WEBMASTER_SITE_URL first', () => {
        expect(resolveBingBlocked({} as never, {})?.dependency).toBe('BING_WEBMASTER_SITE_URL');
    });

    it('Trends is structurally blocked, not credential-blocked', () => {
        // No credential can fix Trends: the blocker is the absence of a public
        // API. The reason must name that, not an env var.
        const b = resolveOfficialApiBlocked();
        expect(b.kind).toBe('no_public_api');
        expect(b.dependency).not.toMatch(/^[A-Z_]+$/);
    });
});
