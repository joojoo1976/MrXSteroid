/**
 * P0 verification — refresh persistence must be REAL (C1/C2).
 *
 * Defects (Gap Audit 2026-09-28):
 *  - C1: the weekly refresh wrote columns that do not exist in the production
 *    database (last_analyzed_at / last_scored_at / final_score / raw_score /
 *    is_ymyl / medical_risk_level / requires_review — all 42703) and never
 *    checked per-update errors, so every write failed silently while the run
 *    was finalized 'completed' with updated_keywords > 0.
 *  - C2: last_observed_at was never updated after seeding, so the whole
 *    corpus mathematically trends to 'declining' (>30d) then 'retired' (>60d).
 *
 * Production schema (verified read-only 2026-09-28 via PostgREST): seo_keywords
 * carries ONLY the v1 columns. These tests pin the refresh to write ONLY
 * existing columns, check every update error, keep last_observed_at fresh,
 * never finalize 'completed' when persistence failed, and never replace the
 * last good snapshot with empty or failed data.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSeoSupabaseFake } from '../helpers/seoSupabaseFake';
import { setLiveProviderCollector } from '../../server/seo/liveProviderCollection';
import {
    setRefreshSleep,
    setRefreshTransport,
} from '../../server/seo/refreshRuntime';
import type { ProviderOutcome } from '../../server/seo/weeklyEngine';

const h = vi.hoisted(() => ({
    current: null as unknown,
    buildShouldThrow: false,
}));

vi.mock('../../server/seo/seoService', () => ({
    getSupabaseAdmin: () => h.current,
    getIsoWeek: () => ({ year: 2026, weekNumber: 39 }),
    buildSnapshotData: (keywords: unknown[], lang: string, year: number, week: number) => {
        if (h.buildShouldThrow) throw new Error('simulated snapshot build failure');
        return {
            language: lang,
            year,
            weekNumber: week,
            generatedAt: new Date().toISOString(),
            totalKeywords: keywords.length,
            categories: { all: keywords, trending: [], rising: [], guides: [], tools: [], plans: [] },
            stats: { averageScore: 80, intentsDistribution: {}, clustersDistribution: {} },
        };
    },
}));

/** v1-schema keyword row (matches the production columns exactly). */
function v1KeywordRow(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        id: 'kw-1',
        language: 'en',
        locale: 'en-US',
        original_keyword: 'testosterone enanthate half life guide',
        normalized_keyword: 'testosterone enanthate half life guide',
        cluster: 'smart-tools',
        intent: 'informational',
        trend_status: 'stable',
        destination_path: '/halflife',
        score: 10, // far from the recomputed value -> hasChanged fires
        score_components: {
            relevance: 90, demand: 80, trend: 75, commercial: 70,
            freshness: 100, seasonal: 80, competitionPenalty: 0, duplicatePenalty: 0,
        },
        source: 'baseline',
        last_observed_at: '2026-09-01T00:00:00.000Z', // stale seed date
        is_active: true,
        created_at: '2026-09-01T00:00:00.000Z',
        ...overrides,
    };
}

async function callRefresh() {
    const { POST } = await import('../../app/api/seo/refresh/route');
    return POST(new NextRequest('http://localhost:3000/api/seo/refresh', {
        method: 'POST',
        headers: { 'x-cron-secret': 'test-cron-secret' },
    }));
}

const runUpdatePayloadsOf = (fake: ReturnType<typeof createSeoSupabaseFake>) =>
    fake.ops
        .filter((o) => o.table === 'seo_keyword_refresh_runs' && o.methods.includes('update'))
        .map((o) => o.payload as Record<string, unknown>);

/**
 * The RE-SCORING updates only — i.e. the ones that write `score`.
 *
 * WHY THIS FILTER EXISTS
 * ----------------------
 * A refresh performs two independent `seo_keywords` updates per row:
 *   1. `destination_verified` — the HTTP verification result (added by the
 *      destination-verification work, already in the route before this suite
 *      existed), and
 *   2. `score` / `trend_status` / `score_components` / `last_observed_at` —
 *      the re-scoring this suite exists to verify.
 *
 * Counting every update and expecting one therefore failed once destination
 * verification landed, while the run itself was correct. These cases are about
 * the re-scoring contract, so they now select exactly that update rather than
 * asserting a total that also happens to include an unrelated column write.
 */
const rescorePayloadsOf = (fake: ReturnType<typeof createSeoSupabaseFake>) =>
    fake.ops
        .filter(
            (o) =>
                o.table === 'seo_keywords' &&
                o.methods.includes('update') &&
                'score' in (o.payload as Record<string, unknown>)
        )
        .map((o) => o.payload as Record<string, unknown>);

const ORIGINAL_SECRET = process.env.CRON_SECRET;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

let restoreCollector: (() => void) | null = null;
let restoreTransport: (() => void) | null = null;
let restoreSleep: (() => void) | null = null;

/**
 * Offline transport: refuses every outbound request immediately.
 *
 * This suite verifies the refresh's PERSISTENCE behaviour (which columns are
 * written, whether a write failure finalizes the run 'failed'). It is not a
 * network test. Left unstubbed, the route also crawled competitor hosts and
 * verified destinations over real HTTP with a 1000 ms politeness floor, so the
 * eight cases each took ~5 s and timed out — the assertions under test were
 * never even reached.
 *
 * The transport makes those outcomes honest rather than fake: destination
 * verification reports UNREACHABLE, which is a truthful "the host did not
 * answer". Nothing is claimed as verified that was not checked.
 */
function offlineTransport(): typeof fetch {
    return (async (input: RequestInfo | URL) => {
        throw new Error(
            `offline test transport refused an outbound request: ${
                typeof input === 'string' ? input : String(input)
            }`
        );
    }) as typeof fetch;
}

/** The honest "nothing is configured" provider verdict for a persistence test. */
const blockedProviders: ProviderOutcome[] = [
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

beforeEach(() => {
    process.env.CRON_SECRET = 'test-cron-secret';
    h.current = null;
    h.buildShouldThrow = false;
    restoreCollector = setLiveProviderCollector(async () => blockedProviders);
    restoreTransport = setRefreshTransport(offlineTransport());
    // The crawler's politeness sleep is kept in production and skipped here.
    restoreSleep = setRefreshSleep(async () => undefined);
});

afterEach(() => {
    // Always restore, even after a failure: leaving the real transport or the
    // real collector installed would let the NEXT case reach the internet.
    restoreCollector?.();
    restoreCollector = null;
    restoreTransport?.();
    restoreTransport = null;
    restoreSleep?.();
    restoreSleep = null;
    process.env.CRON_SECRET = ORIGINAL_SECRET;
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
});

describe('POST /api/seo/refresh — P0 persistence verification', () => {
    it('persists re-scoring using ONLY existing v1 columns and finalizes the run completed', async () => {
        const fake = createSeoSupabaseFake({ keywordsRows: [v1KeywordRow()] });
        h.current = fake;

        const res = await callRefresh();
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.keywordsUpdated).toBe(1);

const payloads = rescorePayloadsOf(fake);
        expect(payloads.length).toBe(1);

        // Only production-existing columns are written — exact shape:
        expect(Object.keys(payloads[0]).sort()).toEqual(
            ['last_observed_at', 'score', 'score_components', 'trend_status']
        );
        // ...and never the 42703 columns that made the old refresh a silent no-op:
        for (const forbidden of [
            'last_analyzed_at', 'last_scored_at', 'final_score', 'raw_score',
            'is_ymyl', 'medical_risk_level', 'requires_review',
        ]) {
            expect(payloads[0]).not.toHaveProperty(forbidden);
        }

        // The run is finalized 'completed' because every write persisted:
        const runPayloads = runUpdatePayloadsOf(fake);
        expect(runPayloads.length).toBe(1);
        expect(runPayloads[0].status).toBe('completed');
        expect(runPayloads[0].updated_keywords).toBe(1);
    });

    it('marks the run failed and returns 500 when a keyword update fails (no fake success)', async () => {
        const fake = createSeoSupabaseFake({
            keywordsRows: [v1KeywordRow()],
            updateError: { message: 'column seo_keywords.last_analyzed_at does not exist' },
        });
        h.current = fake;

        const res = await callRefresh();
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.success).toBe(false);
        // The counter only advances for writes that actually persisted:
        expect(body.keywordsUpdated).toBe(0);
        expect(body.details.updateFailures.length).toBe(1);
        expect(body.details.updateFailures[0].message).toContain('does not exist');

        const runPayloads = runUpdatePayloadsOf(fake);
        expect(runPayloads.length).toBe(1);
        expect(runPayloads[0].status).toBe('failed');
        expect(String(runPayloads[0].error_log)).toContain('does not exist');
    });

    it('keeps last_observed_at fresh (never left at the stale seed value)', async () => {
        const fake = createSeoSupabaseFake({ keywordsRows: [v1KeywordRow()] });
        h.current = fake;

        const res = await callRefresh();
        expect(res.status).toBe(200);

const payloads = rescorePayloadsOf(fake);
        expect(payloads.length).toBe(1);
        const writtenAt = Date.parse(payloads[0].last_observed_at as string);
        expect(Number.isNaN(writtenAt)).toBe(false);
        // Fresh — written during this refresh, not the 2026-09-01 seed date:
        expect(writtenAt).toBeGreaterThan(Date.now() - 60_000);
    });

    it('never replaces the weekly snapshot with an empty corpus (skips the upsert)', async () => {
        const fake = createSeoSupabaseFake({ keywordsRows: [v1KeywordRow()], langKeywordRows: [] });
        h.current = fake;

        const res = await callRefresh();
        // Nothing failed — the upsert is simply skipped, leaving the last
        // good snapshot intact.
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);

        const upserts = fake.ops.filter((o) => o.table === 'seo_keyword_snapshots' && o.methods.includes('upsert'));
        expect(upserts.length).toBe(0);
    });

    it('records a failure and never upserts when the snapshot build throws', async () => {
        const fake = createSeoSupabaseFake({
            keywordsRows: [v1KeywordRow()],
            langKeywordRows: [v1KeywordRow()],
        });
        h.current = fake;
        h.buildShouldThrow = true;

        const res = await callRefresh();
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.success).toBe(false);
        expect(body.details.snapshotFailures[0].stage).toBe('build');

        const upserts = fake.ops.filter((o) => o.table === 'seo_keyword_snapshots' && o.methods.includes('upsert'));
        expect(upserts.length).toBe(0); // previous snapshot left intact
    });

    it('marks the run failed when the snapshot upsert errors', async () => {
        const fake = createSeoSupabaseFake({
            keywordsRows: [v1KeywordRow()],
            langKeywordRows: [v1KeywordRow()],
            snapshotUpsertError: { message: 'duplicate key value violates unique constraint' },
        });
        h.current = fake;

        const res = await callRefresh();
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.success).toBe(false);
        expect(body.details.snapshotFailures[0].stage).toBe('upsert');

        const runPayloads = runUpdatePayloadsOf(fake);
        expect(runPayloads.length).toBe(1);
        expect(runPayloads[0].status).toBe('failed');
    });

    // ── STEP 4: provenance (seo_keyword_source_links write path) ──────────

    it('records an explicit EDITORIAL provenance row for every scanned keyword', async () => {
        const fake = createSeoSupabaseFake({ keywordsRows: [v1KeywordRow()] });
        h.current = fake;

        const res = await callRefresh();
        expect(res.status).toBe(200);
        const body = await res.json();

        expect(body.provenanceRowsWritten).toBe(1);
        expect(body.provenanceFailures).toEqual([]);

        expect(fake.rpcCalls.length).toBe(1);
        expect(fake.rpcCalls[0].fn).toBe('seo_record_keyword_provenance');
        expect(fake.rpcCalls[0].args.p_keyword_id).toBe('kw-1');

        // The EDITORIAL source identity travels with the link.
        const source = fake.rpcCalls[0].args.p_source as Record<string, unknown>;
        expect(source.source_type).toBe('editorial');
        expect(source.source_name).toBe('internal_editorial_seeds');

        const link = fake.rpcCalls[0].args.p_provenance as Record<string, unknown>;
        expect(link.evidence_type).toBe('baseline');
        expect(link.source_reference).toBe('internal://baseline-keywords');
        expect(link.generation_method).toBe('seed');
    });

    it('reports a provenance failure instead of claiming the keyword is verified', async () => {
        const fake = createSeoSupabaseFake({
            keywordsRows: [v1KeywordRow()],
            provenanceError: { message: 'function seo_record_keyword_provenance does not exist' },
        });
        h.current = fake;

        const res = await callRefresh();
        // The keyword/snapshot behaviour is unchanged; provenance failures are
        // surfaced, never silently swallowed into a "verified" claim.
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.provenanceRowsWritten).toBe(0);
        expect(body.provenanceFailures.length).toBe(1);
        expect(body.provenanceFailures[0].id).toBe('kw-1');
        expect(body.provenanceFailures[0].message).toContain('does not exist');

        const runPayloads = runUpdatePayloadsOf(fake);
        expect(String(runPayloads[0].error_log)).toContain('provenanceFailures');
    });
});
