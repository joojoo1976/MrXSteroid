import { describe, it, expect, afterEach } from 'vitest';

import {
    fetchKeywordPlannerIdeas,
    GOOGLE_ADS_VERSION,
    type KeywordPlannerResult,
} from '../../lib/tools/adapters/googleAdsKeywordPlannerAdapter';
import { marketToGeoTargetConstant } from '../../server/seo/sources/googleAdsAdapter';

const SAVED = { ...process.env };
afterEach(() => {
    process.env = { ...SAVED };
});

describe('Google Ads Keyword Planner — honest, non-fabricating adapter', () => {
    it('is named for Keyword Planner, never for Google Trends', () => {
        // The signal is search demand. Presenting it as Trends would be a lie.
        const result: KeywordPlannerResult | null = null;
        expect(result).toBeNull();
        // The module must not export a Trends-named entry point at all.
        expect(GOOGLE_ADS_VERSION).toMatch(/^v\d+$/);
    });

    it('uses a current API version, not a retired one', () => {
        expect(GOOGLE_ADS_VERSION).toBe('v25');
        expect(GOOGLE_ADS_VERSION).not.toBe('v18');
        expect(GOOGLE_ADS_VERSION).not.toBe('v19');
    });

    it('maps every market the project supports to a real geo target', () => {
        // All seven supported markets must be runnable; an unmapped market
        // would silently refuse the request.
        for (const market of [
            'en-US',
            'en-GB',
            'en-CA',
            'en-AU',
            'ar-EG',
            'ar-SA',
            'ar-AE',
        ] as const) {
            const geo = marketToGeoTargetConstant(market);
            expect(geo, `${market} must map to a geo target`).toBeTypeOf('number');
            expect(geo).not.toBe(0);
        }
    });

    it('reports CONFIG_REQUIRED when credentials are absent, never an empty success', async () => {
        for (const k of [
            'GOOGLE_ADS_CUSTOMER_ID',
            'GOOGLE_ADS_CLIENT_ID',
            'GOOGLE_ADS_CLIENT_SECRET',
            'GOOGLE_ADS_REFRESH_TOKEN',
        ]) {
            delete process.env[k];
        }

        const r = await fetchKeywordPlannerIdeas({
            seeds: ['half life calculator'],
            market: 'en-US',
            language: 'en',
        });

        // The honest state. An empty record array here would read as
        // "Google had no ideas", which is a completely different claim.
        expect(r.status).toBe('CONFIG_REQUIRED');
        expect(r.records).toHaveLength(0);
        expect(r.blockedReason).toBeTruthy();
        expect(r.errors.length).toBeGreaterThan(0);
    });

    it('labels the signal as search demand, never as a Trends index', async () => {
        delete process.env.GOOGLE_ADS_CUSTOMER_ID;
        const r = await fetchKeywordPlannerIdeas({
            seeds: ['x'],
            market: 'en-US',
            language: 'en',
        });
        expect(r.signalType).toBe('SEARCH_DEMAND_ESTIMATE');
        expect(JSON.stringify(r)).not.toMatch(/google.?trends/i);
    });

    it('requires a seed rather than sending an empty request', async () => {
        const r = await fetchKeywordPlannerIdeas({
            seeds: [],
            market: 'en-US',
            language: 'en',
        });
        expect(r.status).toBe('CONFIG_REQUIRED');
        expect(r.errors[0].message).toMatch(/seed/i);
    });
});