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

const updatePayloadsOf = (fake: ReturnType<typeof createSeoSupabaseFake>) =>
    fake.ops
        .filter((o) => o.table === 'seo_keywords' && o.methods.includes('update'))
        .map((o) => o.payload as Record<string, unknown>);

const runUpdatePayloadsOf = (fake: ReturnType<typeof createSeoSupabaseFake>) =>
    fake.ops
        .filter((o) => o.table === 'seo_keyword_refresh_runs' && o.methods.includes('update'))
        .map((o) => o.payload as Record<string, unknown>);

const ORIGINAL_SECRET = process.env.CRON_SECRET;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

beforeEach(() => {
    process.env.CRON_SECRET = 'test-cron-secret';
    h.current = null;
    h.buildShouldThrow = false;
});

afterEach(() => {
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

        const payloads = updatePayloadsOf(fake);
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

        const payloads = updatePayloadsOf(fake);
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
});
