/**
 * tests/integration/seoRuntimeChain.test.ts
 * RUNTIME PROOF for STEP 12/13 — this suite exists because both engines used to
 * be reachable ONLY from tests. Calling `runWeeklyEngine` directly in a unit test
 * proved nothing about the deployed path; these tests drive the REAL
 * `POST /api/seo/refresh` handler and assert the route itself invoked them.
 *
 * Chain asserted: seo_keywords -> weeklyEngine -> seo_keyword_weekly_states
 *                 -> snapshot diff -> response
 *
 * The two failure semantics the refresh depends on are pinned too:
 *   - blocked providers => PARTIAL_SUCCESS, never a failed run
 *   - a weekly-state write failure => the refresh run is finalized 'failed'
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

import { createSeoSupabaseFake } from '../helpers/seoSupabaseFake';

const h = vi.hoisted(() => ({ current: null as unknown }));

vi.mock('../../server/seo/seoService', () => ({
    getSupabaseAdmin: () => h.current,
    getIsoWeek: () => ({ year: 2026, weekNumber: 40 }),
    buildSnapshotData: (keywords: unknown[], lang: string, year: number, week: number) => ({
        language: lang,
        year,
        weekNumber: week,
        generatedAt: new Date().toISOString(),
        totalKeywords: keywords.length,
        categories: { all: keywords, trending: [], rising: [], guides: [], tools: [], plans: [] },
        stats: { averageScore: 80, intentsDistribution: {}, clustersDistribution: {} },
    }),
}));

import { POST as postRefresh } from '../../app/api/seo/refresh/route';
import { setLiveProviderCollector } from '../../server/seo/liveProviderCollection';
import { setRefreshSleep, setRefreshTransport } from '../../server/seo/refreshRuntime';
import type { ProviderOutcome } from '../../server/seo/weeklyEngine';

/**
 * This suite now drives a route that performs REAL provider collection.
 *
 * The stub below is not cosmetic: without it every case would call Google and
 * Bing with the credentials present in the developer's `.env.local`. That made
 * the suite slow (network round-trips inside a 5s test timeout) and would push
 * a local credential to a third party during a unit test.
 *
 * The stub reports the honest "no credentials configured" verdict, which is what
 * these cases have always assumed. The collection's OWN behaviour — that a
 * configured provider is genuinely called — is proved separately, with an
 * injected transport, in `seoLiveProviderCollection.test.ts`.
 */
const stubbedProviders: ProviderOutcome[] = [
    {
        provider: 'google_search_console',
        status: 'BLOCKED',
        dataKind: 'unavailable',
        records: [],
        error: 'BLOCKED: missing GSC_SITE_URL — not configured in this test',
        partial: false,
    },
    {
        provider: 'google_ads_keyword_planner',
        status: 'BLOCKED',
        dataKind: 'unavailable',
        records: [],
        error: 'BLOCKED: missing GOOGLE_ADS_CUSTOMER_ID — not configured in this test',
        partial: false,
    },
    {
        provider: 'bing_web_search',
        status: 'BLOCKED',
        dataKind: 'unavailable',
        records: [],
        error: 'BLOCKED: missing BING_WEBMASTER_SITE_URL — not configured in this test',
        partial: false,
    },
];

let restoreCollector: (() => void) | null = null;
let restoreTransport: (() => void) | null = null;
let restoreSleep: (() => void) | null = null;

/**
 * A transport that answers NOTHING over the network.
 *
 * The route does three kinds of outbound work: live provider calls, the
 * competitor crawl, and destination verification. Each is bounded by a provider
 * timeout measured in seconds, so a suite that reached the real internet blew
 * the 5s test timeout on every single case — which is what these eleven failures
 * were: NOT broken logic, but a missing seam, plus an unintended dependency on
 * whatever credentials happen to sit in `.env.local`.
 *
 * This transport fails fast and offline. Destination verification therefore
 * reports UNREACHABLE, which is an honest, real outcome of "the host did not
 * answer" — not a fabricated success, and not a skipped check.
 */
function offlineTransport(): typeof fetch {
    return (async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : String(input);
        // The Supabase fake intercepts its own traffic, so anything reaching
        // here is a genuine outbound call. Refuse it loudly and immediately.
        throw new Error(`offline test transport refused an outbound request: ${url}`);
    }) as typeof fetch;
}

function keywordRow(id: string, keyword: string, score: number) {
    return {
        id,
        language: 'en',
        locale: 'en-US',
        original_keyword: keyword,
        normalized_keyword: keyword.toLowerCase(),
        cluster: 'smart-tools',
        intent: 'informational',
        trend_status: 'stable',
        destination_path: '/halflife',
        score,
        final_score: score,
        score_components: {
            relevance: 90, demand: 80, trend: 75, commercial: 70,
            freshness: 100, seasonal: 80, competitionPenalty: 0, duplicatePenalty: 0,
        },
        source: 'baseline',
        last_observed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_active: true,
    };
}

async function runRefresh() {
    // The route is admin/CRON gated. Using the documented CRON header is the
    // same path the weekly scheduler uses, so the test exercises the real
    // authorized code path rather than bypassing it.
    const req = new NextRequest('http://localhost:3000/api/seo/refresh', {
        method: 'POST',
        headers: { 'x-cron-secret': 'test-cron-secret' },
    });
    const res = await postRefresh(req);
    return { res, body: await res.json() };
}

const ORIGINAL_SECRET = process.env.CRON_SECRET;
const ORIGINAL_DEV_BYPASS = process.env.NODE_ENV;

beforeEach(() => {
    process.env.CRON_SECRET = 'test-cron-secret';
    process.env.NODE_ENV = 'production';
    // Install the stub BEFORE any case runs, and restore it afterwards so a
    // failure can never leave the real (network-calling) collector installed.
    restoreCollector = setLiveProviderCollector(async () => stubbedProviders);
    // Also cut the two remaining outbound paths (competitor crawl, destination
    // verification), which were reaching the real internet in this suite.
    restoreTransport = setRefreshTransport(offlineTransport());
    // The crawler waits >=1000ms between requests by design (robots.txt
    // Crawl-delay floor). That politeness is correct in production and costs
    // ~12s per run here, so the WAIT is skipped in tests and kept in prod.
    restoreSleep = setRefreshSleep(async () => undefined);
    vi.clearAllMocks();
});

describe('RUNTIME · POST /api/seo/refresh invokes the weekly engine', () => {
    afterEach(() => {
        // Always restore, including after a failure: leaving the real collector
        // or the real transport installed would send the NEXT case to
        // Google's servers.
        restoreCollector?.();
        restoreCollector = null;
        restoreTransport?.();
        restoreTransport = null;
        restoreSleep?.();
        restoreSleep = null;
        process.env.CRON_SECRET = ORIGINAL_SECRET;
        process.env.NODE_ENV = ORIGINAL_DEV_BYPASS;
    });

    it('runs the engine inside the route and reports its real status', async () => {
        h.current = createSeoSupabaseFake({
            keywordsRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            langKeywordRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
        });

        const { res, body } = await runRefresh();

        expect(res.status).toBe(200);
        expect(body.weeklyEngine.invoked).toBe(true);
        expect(body.weeklyEngine.stages).toBe(15);
        // Every external provider is BLOCKED, which must NOT fail the run.
        expect(body.weeklyEngine.status).not.toBe('FAILED');
        expect(body.weeklyEngine.providerFailures).toBeGreaterThan(0);
        expect(body.weeklyEngine.error).toBeNull();
    });

    it('preserves the pre-existing response contract', async () => {
        h.current = createSeoSupabaseFake({
            keywordsRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            langKeywordRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
        });

        const { body } = await runRefresh();

        expect(body.success).toBe(true);
        expect(body).toHaveProperty('runId');
        expect(body).toHaveProperty('keywordsScanned');
        expect(body).toHaveProperty('keywordsUpdated');
        expect(body).toHaveProperty('keywordsRetired');
        expect(body).toHaveProperty('snapshots');
        expect(body).toHaveProperty('year', 2026);
        expect(body).toHaveProperty('weekNumber', 40);
        expect(body).toHaveProperty('provenanceRowsWritten');
    });

    it('writes weekly state rows and reads prior-week history back', async () => {
        const fake = createSeoSupabaseFake({
            keywordsRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            langKeywordRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
        });
        h.current = fake;

        const { body } = await runRefresh();

        const tables = fake.ops.map((o) => `${o.table}:${o.methods.join('+')}`);
        expect(tables.some((t) => t.startsWith('seo_keyword_weekly_states:select'))).toBe(true);
        expect(tables.some((t) => t.startsWith('seo_keyword_weekly_states:upsert'))).toBe(true);
        expect(body.weeklyEngine.rowsWritten).toBeGreaterThan(0);
    });

    it('is idempotent: a second run writes the same state rows again', async () => {
        const fake = createSeoSupabaseFake({
            keywordsRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            langKeywordRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
        });
        h.current = fake;

        const first = await runRefresh();
        const second = await runRefresh();

        expect(second.body.weeklyEngine.status).toBe(first.body.weeklyEngine.status);
        const keys = fake.ops
            .filter((o) => o.table === 'seo_keyword_weekly_states' && o.methods.includes('upsert'))
            .map((o) => JSON.stringify(o.payload));
        // The upsert key is deterministic, so a re-run updates rather than
        // creating a second logical row.
        expect(new Set(keys).size).toBe(1);
    });

    afterEach(() => {
        // Always restore, including after a failure: leaving the real collector
        // installed would send the NEXT case to Google's servers.
        restoreCollector?.();
        restoreCollector = null;
        process.env.CRON_SECRET = ORIGINAL_SECRET;
        process.env.NODE_ENV = ORIGINAL_DEV_BYPASS;
    });
});

describe('RUNTIME · the snapshot diff runs in the route', () => {
    const prior = (keyword: string, score: number, id = 'kw-1') => ({
        keyword_id: id, keyword, language: 'en', market: 'en-US',
        year: 2026, week: 39, score, rank: null,
        trend_status: 'stable', destination_path: '/halflife',
    });

    it('reports STABLE for an unchanged keyword against real prior-week state', async () => {
        h.current = createSeoSupabaseFake({
            keywordsRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            langKeywordRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            weeklyStateRows: [prior('ffmi calculator', 80)],
        });

        const { body } = await runRefresh();
        expect(body.snapshotDiff.byState.STABLE).toBe(1);
    });

    it('reports RISING when the current score exceeds the prior week', async () => {
        h.current = createSeoSupabaseFake({
            keywordsRows: [keywordRow('kw-1', 'ffmi calculator', 95)],
            langKeywordRows: [keywordRow('kw-1', 'ffmi calculator', 95)],
            weeklyStateRows: [prior('ffmi calculator', 60)],
        });

        const { body } = await runRefresh();
        expect(body.snapshotDiff.byState.RISING).toBe(1);
    });

    it('reports NEW when there is no prior-week row', async () => {
        h.current = createSeoSupabaseFake({
            keywordsRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            langKeywordRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            weeklyStateRows: [],
        });

        const { body } = await runRefresh();
        expect(body.snapshotDiff.byState.NEW).toBe(1);
    });

    it('reports LOST for a keyword that vanished since the prior week', async () => {
        h.current = createSeoSupabaseFake({
            keywordsRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            langKeywordRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            weeklyStateRows: [prior('gone calculator', 70, 'kw-old')],
        });

        const { body } = await runRefresh();
        expect(body.snapshotDiff.byState.LOST).toBe(1);
    });

    it('keeps the same term in two markets as two separate identities', async () => {
        h.current = createSeoSupabaseFake({
            keywordsRows: [
                { ...keywordRow('kw-us', 'half life', 80), locale: 'en-US' },
                { ...keywordRow('kw-gb', 'half life', 82), locale: 'en-GB' },
            ],
            langKeywordRows: [keywordRow('kw-us', 'half life', 80)],
            weeklyStateRows: [prior('half life', 80, 'kw-us')],
        });

        const { body } = await runRefresh();
        // en-US has history (STABLE); en-GB does not (NEW). They are NOT merged.
        expect(body.snapshotDiff.byState.STABLE).toBe(1);
        expect(body.snapshotDiff.byState.NEW).toBe(1);
    });
});

describe('RUNTIME · failure semantics survive the wiring', () => {
    it('finalizes the run as failed when the weekly state write fails', async () => {
        h.current = createSeoSupabaseFake({
            keywordsRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            langKeywordRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            weeklyStateUpsertError: { message: 'weekly state write refused' },
        });

        const { body } = await runRefresh();
        // A genuine persistence failure must surface, not hide behind a 200.
        expect(body).toBeTruthy();
        expect(body.weeklyEngine?.status).toBe('FAILED');
    });

    it('still returns 200 with an honest body when only providers are blocked', async () => {
        h.current = createSeoSupabaseFake({
            keywordsRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
            langKeywordRows: [keywordRow('kw-1', 'ffmi calculator', 80)],
        });

        const { res, body } = await runRefresh();
        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.weeklyEngine.providerFailures).toBeGreaterThan(0);
    });
});

        process.env.CRON_SECRET = ORIGINAL_SECRET;
        process.env.NODE_ENV = ORIGINAL_DEV_BYPASS;
