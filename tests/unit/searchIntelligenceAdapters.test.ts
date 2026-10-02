/**
 * tests/unit/searchIntelligenceAdapters.test.ts
 * STEP 5-6 — GSC / Google Ads / Bing / Google Trends adapter gate.
 *
 * These tests NEVER call a live provider and NEVER assert a fabricated
 * metric. Every response fed to a mapper is hand-built fixture data used only
 * to prove field SEPARATION and SHAPE VALIDATION. Blocked-path assertions
 * prove the adapter refuses to invent anything.
 */

import { describe, it, expect, beforeEach } from 'vitest';

import {
    collectGscSearchAnalytics,
    gscCountryToMarket,
    mapGscKeys,
    mapGscRow,
    marketToGscCountry,
    normalizeGscDevice,
    validateGscResponse,
    GSC_DIMENSIONS,
    gscConservativeLagFloor,
    GSC_PROVIDER,
} from '../../server/seo/sources/gscAdapter';

import {
    collectGoogleAdsKeywordIdeas,
    buildGenerateKeywordIdeaRequest,
    marketToGeoTargetConstant,
    validateGoogleAdsResponse,
    mapGoogleAdsIdea,
    clearGoogleAdsCache,
    GOOGLE_ADS_PROVIDER,
    GOOGLE_ADS_CACHE_TTL_SECONDS,
} from '../../server/seo/sources/googleAdsAdapter';

import {
    collectBingQueryStats,
    mapBingRow,
    bingCountryToMarket,
    marketToBingCountry,
    validateBingResponse,
    buildBingQueryStatsUrl,
    BING_PROVIDER,
} from '../../server/seo/sources/bingAdapter';

import {
    collectGoogleTrends,
    parseTrendsCsv,
    normalizeRelativeInterest,
    officialApiBlockedReason,
    GOOGLE_TRENDS_PROVIDER,
} from '../../server/seo/sources/googleTrendsAdapter';

import {
    GOOGLE_ADS_HISTORICAL_SIGNAL,
    emptyKeywordMetrics,
} from '../../server/seo/sources/types';

/** Build a minimal Response-alike for the injected transport. */
function jsonResponse(body: unknown, status = 200): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: 'OK',
        json: async () => body,
    } as unknown as Response;
}

/** Placeholder section markers, filled in below. */
/* =====================================================================
 * GSC — Search Console Search Analytics
 * ===================================================================== */
describe('GSC adapter — missing credentials => BLOCKED with exact dependency', () => {
    it('BLOCKS with GSC_SITE_URL when no property is configured', async () => {
        const result = await collectGscSearchAnalytics(
            {
                language: 'en',
                market: 'en-US',
                startDate: '2026-01-01',
                endDate: '2026-01-31',
            },
            { env: {} },
        );
        expect(result.status).toBe('BLOCKED');
        expect(result.blocked?.dependency).toBe('GSC_SITE_URL');
        expect(result.error).toContain('GSC_SITE_URL');
        // No fabricated records.
        expect(result.records).toEqual([]);
        expect(result.dataKind).toBe('unavailable');
    });

    it('BLOCKS with GSC_ACCESS_TOKEN when the property is set but no token is', async () => {
        const result = await collectGscSearchAnalytics(
            {
                language: 'en',
                market: 'en-US',
                startDate: '2026-01-01',
                endDate: '2026-01-31',
            },
            { env: { GSC_SITE_URL: 'https://example.com/' } },
        );
        expect(result.status).toBe('BLOCKED');
        expect(result.blocked?.dependency).toBe('GSC_ACCESS_TOKEN');
        expect(result.blocked?.kind).toBe('oauth_token');
        expect(result.records).toEqual([]);
    });

    it('never calls the transport when blocked', async () => {
        let called = false;
        await collectGscSearchAnalytics(
            {
                language: 'en',
                market: 'en-US',
                startDate: '2026-01-01',
                endDate: '2026-01-31',
            },
            {
                env: {},
                fetchImpl: (async () => {
                    called = true;
                    return jsonResponse({});
                }) as unknown as typeof fetch,
            },
        );
        expect(called).toBe(false);
    });
});

describe('GSC adapter — country and device dimension mapping', () => {
    it('maps ISO alpha-3 GSC country keys to markets', () => {
        expect(gscCountryToMarket('usa')).toBe('en-US');
        expect(gscCountryToMarket('EGY')).toBe('ar-EG');
        expect(gscCountryToMarket('gbr')).toBe('en-GB');
    });

    it('returns null for an unknown country instead of defaulting to en-US', () => {
        // Critical: an Egyptian observation must not be labelled en-US.
        expect(gscCountryToMarket('zzz')).toBeNull();
        expect(gscCountryToMarket(undefined)).toBeNull();
    });

    it('round-trips market -> country code', () => {
        expect(marketToGscCountry('en-US')).toBe('usa');
        expect(marketToGscCountry('ar-EG')).toBe('egy');
    });

    it('normalises device keys and preserves unknown ones verbatim', () => {
        expect(normalizeGscDevice('mobile')).toBe('MOBILE');
        expect(normalizeGscDevice('DESKTOP')).toBe('DESKTOP');
        expect(normalizeGscDevice('TABLET')).toBe('TABLET');
        expect(normalizeGscDevice('smart-tv')).toBe('SMART-TV');
        expect(normalizeGscDevice(undefined)).toBeNull();
    });

    it('maps keys[] by the requested dimension order', () => {
        const keys = ['train', 'https://x.com/a', 'egy', 'MOBILE', '2026-01-05'];
        const dims = mapGscKeys(keys);
        expect(dims.query).toBe('train');
        expect(dims.page).toBe('https://x.com/a');
        expect(dims.country).toBe('egy');
        expect(dims.device).toBe('MOBILE');
        expect(dims.date).toBe('2026-01-05');
        expect(GSC_DIMENSIONS).toEqual([
            'query',
            'page',
            'country',
            'device',
            'date',
        ]);
    });
});

describe('GSC adapter — response shape validation', () => {
    it('accepts a well-formed response and an empty one', () => {
        expect(validateGscResponse({ rows: [] })).toBeNull();
        expect(validateGscResponse({})).toBeNull();
    });

    it('rejects a non-object body', () => {
        expect(validateGscResponse(null)).toMatch(/non-object/);
        expect(validateGscResponse('nope')).toMatch(/non-object/);
    });

    it('rejects non-array rows and non-numeric metrics', () => {
        expect(validateGscResponse({ rows: 'x' })).toMatch(/not an array/);
        expect(
            validateGscResponse({ rows: [{ keys: ['a'], clicks: '5' }] }),
        ).toMatch(/clicks is not a number/);
        expect(validateGscResponse({ rows: [{ keys: 'notarray' }] })).toMatch(
            /keys is not an array/,
        );
    });

    it('surfaces an invalid response as FAILED, not as records', async () => {
        const result = await collectGscSearchAnalytics(
            {
                language: 'en',
                market: 'en-US',
                startDate: '2026-01-01',
                endDate: '2026-01-31',
            },
            {
                env: {
                    GSC_SITE_URL: 'https://example.com/',
                    GSC_ACCESS_TOKEN: 'test-token-not-a-real-secret',
                },
                fetchImpl: (async () =>
                    jsonResponse({ rows: 'garbage' })) as unknown as typeof fetch,
            },
        );
        expect(result.status).toBe('FAILED');
        expect(result.error).toContain('invalid_response');
        expect(result.records).toEqual([]);
    });
});

describe('GSC adapter — pagination via startRow', () => {
    it('walks startRow until a short page proves the end', async () => {
        const startRows: number[] = [];
        const pages: Record<number, unknown> = {
            0: {
                rows: [
                    {
                        keys: ['a', 'https://x.com/1', 'usa', 'DESKTOP', '2026-01-01'],
                        clicks: 10,
                        impressions: 100,
                        ctr: 0.1,
                        position: 3,
                    },
                    {
                        keys: ['b', 'https://x.com/2', 'usa', 'MOBILE', '2026-01-01'],
                        clicks: 5,
                        impressions: 50,
                        ctr: 0.1,
                        position: 5,
                    },
                ],
            },
            2: {
                rows: [
                    {
                        keys: ['c', 'https://x.com/3', 'usa', 'TABLET', '2026-01-02'],
                        clicks: 1,
                        impressions: 10,
                        ctr: 0.1,
                        position: 9,
                    },
                ],
            },
        };
        const fetchImpl = (async (_url: string, init: RequestInit) => {
            const body = JSON.parse(String(init.body));
            startRows.push(body.startRow);
            return jsonResponse(pages[body.startRow] ?? { rows: [] });
        }) as unknown as typeof fetch;

        const result = await collectGscSearchAnalytics(
            {
                language: 'en',
                market: 'en-US',
                startDate: '2026-01-01',
                endDate: '2026-01-02',
                pageSize: 2,
                rowLimit: 10,
            },
            {
                env: {
                    GSC_SITE_URL: 'https://example.com/',
                    GSC_ACCESS_TOKEN: 'test-token-not-a-real-secret',
                },
                fetchImpl,
            },
        );

        expect(result.status).toBe('CONNECTED');
        expect(startRows).toEqual([0, 2]);
        expect(result.records.map((r) => r.keyword)).toEqual(['a', 'b', 'c']);
    });

    it('requests the five documented dimensions and paginates via rowLimit/startRow', async () => {
        let sentBody: Record<string, unknown> | null = null;
        const fetchImpl = (async (_url: string, init: RequestInit) => {
            sentBody = JSON.parse(String(init.body));
            return jsonResponse({ rows: [] });
        }) as unknown as typeof fetch;

        await collectGscSearchAnalytics(
            {
                language: 'en',
                market: 'ar-EG',
                startDate: '2026-01-01',
                endDate: '2026-01-31',
                pageSize: 5,
            },
            {
                env: {
                    GSC_SITE_URL: 'https://example.com/',
                    GSC_ACCESS_TOKEN: 'test-token-not-a-real-secret',
                },
                fetchImpl,
            },
        );
        expect(sentBody).not.toBeNull();
        const body = sentBody as unknown as Record<string, unknown>;
        expect(body.dimensions).toEqual([...GSC_DIMENSIONS]);
        expect(body.rowLimit).toBe(5);
        expect(body.startRow).toBe(0);
        // Market is expressed as a documented dimension filter.
        expect(JSON.stringify(body.dimensionFilterGroups)).toContain('egy');
    });
});

describe('GSC adapter — data lag is never conflated with the run date', () => {
    it('uses the row date as metricsDate and the clock as retrievedAt', () => {
        const record = mapGscRow(
            {
                keys: ['kw', 'https://x.com/a', 'usa', 'MOBILE', '2026-01-05'],
                clicks: 3,
                impressions: 30,
                ctr: 0.1,
                position: 4,
            },
            {
                language: 'en',
                requestedMarket: 'en-US',
                siteUrl: 'https://example.com/',
                retrievedAt: '2026-01-10T00:00:00.000Z',
            },
        );
        expect(record).not.toBeNull();
        // metricsDate = the date the metrics describe, NOT the run date.
        expect(record!.metricsDate).toBe('2026-01-05');
        expect(record!.retrievedAt).toBe('2026-01-10T00:00:00.000Z');
        expect(record!.metricsDate).not.toBe(record!.retrievedAt.slice(0, 10));
    });

    it('flags rows at or after metadata.first_incomplete_date', () => {
        const record = mapGscRow(
            {
                keys: ['kw', 'https://x.com/a', 'usa', 'MOBILE', '2026-01-08'],
                clicks: 1,
                impressions: 5,
            },
            {
                language: 'en',
                requestedMarket: 'en-US',
                siteUrl: 'https://example.com/',
                retrievedAt: '2026-01-10T00:00:00.000Z',
                firstIncompleteDate: '2026-01-08',
            },
        );
        expect(record!.attribution.dataIncomplete).toBe(true);
    });

    it('does not flag a settled row', () => {
        const record = mapGscRow(
            {
                keys: ['kw', 'https://x.com/a', 'usa', 'MOBILE', '2026-01-01'],
                clicks: 1,
                impressions: 5,
            },
            {
                language: 'en',
                requestedMarket: 'en-US',
                siteUrl: 'https://example.com/',
                retrievedAt: '2026-01-10T00:00:00.000Z',
                firstIncompleteDate: '2026-01-08',
            },
        );
        expect(record!.attribution.dataIncomplete).toBe(false);
    });

    it('exposes a conservative lag floor derived from the documented default', () => {
        const floor = gscConservativeLagFloor(new Date('2026-01-10T00:00:00.000Z'));
        expect(floor).toBe('2026-01-08');
    });
});

describe('GSC adapter — records are observed and non-Google fields stay null', () => {
    it('writes only Google fields and marks data non-exhaustive', () => {
        const record = mapGscRow(
            {
                keys: ['kw', 'https://x.com/a', 'egy', 'MOBILE', '2026-01-05'],
                clicks: 3,
                impressions: 30,
                ctr: 0.1,
                position: 4,
            },
            {
                language: 'ar',
                requestedMarket: 'ar-EG',
                siteUrl: 'https://example.com/',
                retrievedAt: '2026-01-10T00:00:00.000Z',
            },
        )!;
        expect(record.dataKind).toBe('observed');
        expect(record.market).toBe('ar-EG');
        expect(record.metrics.googleImpressions).toBe(30);
        expect(record.metrics.googleClicks).toBe(3);
        // Never inferred from a GSC row.
        expect(record.metrics.bingImpressions).toBeNull();
        expect(record.metrics.bingClicks).toBeNull();
        expect(record.metrics.googleAdsAvgMonthlySearches).toBeNull();
        expect(record.metrics.trendsRelativeInterest).toBeNull();
        // GSC is a top-N slice, not the whole index.
        expect(record.attribution.gscExhaustive).toBe(false);
    });

    it('drops a row with no query rather than inventing a label', () => {
        const record = mapGscRow(
            {
                keys: ['', 'https://x.com/a', 'usa', 'MOBILE', '2026-01-05'],
                clicks: 1,
            },
            {
                language: 'en',
                requestedMarket: 'en-US',
                siteUrl: 'https://example.com/',
                retrievedAt: '2026-01-10T00:00:00.000Z',
            },
        );
        expect(record).toBeNull();
    });

    it('reports provider descriptors honestly', () => {
        expect(GSC_PROVIDER.requiredEnv).toEqual([
            'GSC_SITE_URL',
            'GSC_ACCESS_TOKEN',
        ]);
    });
});

/* =====================================================================
 * GOOGLE ADS — KeywordPlanIdeaService.GenerateKeywordIdeas
 * ===================================================================== */
describe('Google Ads adapter — missing credentials => BLOCKED with exact dependency', () => {
    const base = { language: 'en' as const, market: 'en-US' as const, seeds: ['x'] };

    beforeEach(() => clearGoogleAdsCache());

    // NOTE: these expectations were rewritten on 2026-09-30. The previous
    // version asserted that GOOGLE_ADS_DEVELOPER_TOKEN was the FIRST blocker.
    // That encoded a contract Google has since retired: developer tokens were
    // sunset on 2026-09-09 and the header is now "optional and ignored by the
    // API servers". Asserting it as a gate would have kept sending an operator
    // to the deprecated API Center for a credential that grants nothing.
    it('BLOCKS with GOOGLE_ADS_CUSTOMER_ID first, not the retired developer token', async () => {
        const result = await collectGoogleAdsKeywordIdeas(base, { env: {} });
        expect(result.status).toBe('BLOCKED');
        expect(result.blocked?.dependency).toBe('GOOGLE_ADS_CUSTOMER_ID');
        // The retired token must never be named as a blocker again.
        expect(result.blocked?.dependency).not.toBe('GOOGLE_ADS_DEVELOPER_TOKEN');
        expect(result.records).toEqual([]);
    });

    it('BLOCKS with GOOGLE_ADS_CUSTOMER_ID when only the legacy token is set', async () => {
        const result = await collectGoogleAdsKeywordIdeas(base, {
            env: { GOOGLE_ADS_DEVELOPER_TOKEN: 'legacy-placeholder' },
        });
        expect(result.status).toBe('BLOCKED');
        expect(result.blocked?.dependency).toBe('GOOGLE_ADS_CUSTOMER_ID');
    });

    it('BLOCKS with GOOGLE_ADS_ACCESS_TOKEN and never accepts a password', async () => {
        const result = await collectGoogleAdsKeywordIdeas(base, {
            env: {
                // Still accepted, still ignored by Google, never a gate.
                GOOGLE_ADS_DEVELOPER_TOKEN: 'legacy-placeholder',
                GOOGLE_ADS_CUSTOMER_ID: '1234567890',
            },
        });
        expect(result.status).toBe('BLOCKED');
        expect(result.blocked?.dependency).toBe('GOOGLE_ADS_ACCESS_TOKEN');
        expect(result.blocked?.kind).toBe('oauth_token');
        // The modern auth model is OAuth, not stored user credentials.
        expect(result.blocked?.detail).toMatch(/OAuth 2\.0/);
        expect(result.blocked?.detail).not.toMatch(/password/i);
    });

    it('BLOCKS with GOOGLE_ADS_LOGIN_CUSTOMER_ID on the manager path only', async () => {
        const managerResult = await collectGoogleAdsKeywordIdeas(
            { ...base, accessPath: 'MANAGER' },
            { env: { GOOGLE_ADS_CUSTOMER_ID: '1234567890', GOOGLE_ADS_ACCESS_TOKEN: 'tok' } }
        );
        expect(managerResult.status).toBe('BLOCKED');
        expect(managerResult.blocked?.dependency).toBe('GOOGLE_ADS_LOGIN_CUSTOMER_ID');

        // The same config on the DIRECT path must NOT block on it: Google
        // requires login-customer-id only for manager-to-client calls.
        const directResult = await collectGoogleAdsKeywordIdeas(
            { ...base, accessPath: 'DIRECT' },
            {
                env: { GOOGLE_ADS_CUSTOMER_ID: '1234567890', GOOGLE_ADS_ACCESS_TOKEN: 'tok' },
                fetchImpl: (async () =>
                    new Response(JSON.stringify({ results: [] }), { status: 200 })) as never,
            }
        );
        expect(directResult.blocked?.dependency).not.toBe('GOOGLE_ADS_LOGIN_CUSTOMER_ID');
    });

    it('BLOCKS when no seed is supplied', async () => {
        const result = await collectGoogleAdsKeywordIdeas(
            { language: 'en', market: 'en-US', seeds: [] },
            {
                env: {
                    GOOGLE_ADS_DEVELOPER_TOKEN: 'dev-token-placeholder',
                    GOOGLE_ADS_CUSTOMER_ID: '1234567890',
                    GOOGLE_ADS_ACCESS_TOKEN: 'access-token-placeholder',
                },
            },
        );
        expect(result.status).toBe('BLOCKED');
        expect(result.blocked?.dependency).toMatch(/seed/);
    });

    it('never calls the transport when blocked', async () => {
        let called = false;
        await collectGoogleAdsKeywordIdeas(base, {
            env: {},
            fetchImpl: (async () => {
                called = true;
                return jsonResponse({});
            }) as unknown as typeof fetch,
        });
        expect(called).toBe(false);
    });
});

describe('Google Ads adapter — historical signal naming', () => {
    beforeEach(() => clearGoogleAdsCache());

    it('stamps every record with google_ads_historical_search_signal', () => {
        const record = mapGoogleAdsIdea(
            {
                text: 'buy trainers',
                keyword_idea_metrics: {
                    avg_monthly_searches: 1200,
                    competition: 0.4,
                    competition_index: 42,
                },
            },
            {
                language: 'en',
                market: 'en-GB',
                customerId: '1234567890',
                retrievedAt: '2026-01-10T00:00:00.000Z',
            },
        )!;
        // THE canonical signal name.
        expect(record.attribution.signal).toBe(
            'google_ads_historical_search_signal',
        );
        expect(GOOGLE_ADS_HISTORICAL_SIGNAL).toBe(
            'google_ads_historical_search_signal',
        );
        expect(record.metrics.googleAdsAvgMonthlySearches).toBe(1200);
        expect(record.metrics.googleAdsCompetition).toBe(0.4);
        expect(record.attribution.googleAdsCompetitionIndex).toBe(42);
    });

    it('labels the number estimated and explicitly NOT organic volume', () => {
        const record = mapGoogleAdsIdea(
            { text: 'kw', keyword_idea_metrics: { avg_monthly_searches: 10 } },
            {
                language: 'en',
                market: 'en-US',
                customerId: '1',
                retrievedAt: '2026-01-10T00:00:00.000Z',
            },
        )!;
        expect(record.dataKind).toBe('estimated');
        expect(record.attribution.isOrganicSearchVolume).toBe(false);
        expect(record.attribution.isFirstPartyObservation).toBe(false);
    });

    it('never writes an Ads number into a Google, Bing or Trends field', () => {
        const record = mapGoogleAdsIdea(
            { text: 'kw', keyword_idea_metrics: { avg_monthly_searches: 999 } },
            {
                language: 'en',
                market: 'en-US',
                customerId: '1',
                retrievedAt: '2026-01-10T00:00:00.000Z',
            },
        )!;
        expect(record.metrics.googleImpressions).toBeNull();
        expect(record.metrics.googleClicks).toBeNull();
        expect(record.metrics.googleCtr).toBeNull();
        expect(record.metrics.googlePosition).toBeNull();
        expect(record.metrics.bingImpressions).toBeNull();
        expect(record.metrics.bingClicks).toBeNull();
        expect(record.metrics.trendsRelativeInterest).toBeNull();
        expect(record.metrics.internalSearchCount).toBeNull();
    });

    it('never invents metrics that the response omitted', () => {
        const record = mapGoogleAdsIdea(
            { text: 'kw' },
            {
                language: 'en',
                market: 'en-US',
                customerId: '1',
                retrievedAt: '2026-01-10T00:00:00.000Z',
            },
        )!;
        expect(record.metrics).toEqual(emptyKeywordMetrics());
    });

    it('drops an idea with no text', () => {
        expect(
            mapGoogleAdsIdea(
                {},
                {
                    language: 'en',
                    market: 'en-US',
                    customerId: '1',
                    retrievedAt: '2026-01-10T00:00:00.000Z',
                },
            ),
        ).toBeNull();
    });
});
// __SECTION_ADS_3__
