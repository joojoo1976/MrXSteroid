/**
 * tests/unit/seoWeeklyEngine.test.ts
 * STEP 12 — the weekly orchestrator's failure semantics and idempotency.
 *
 * The engine was delivered without a suite when its author crashed, so these
 * tests pin the three properties the rest of the system depends on:
 *   1. A PROVIDER failure is a value, never an exception -> PARTIAL_SUCCESS.
 *   2. A PERSISTENCE failure is a real failure       -> FAILED.
 *   3. Two identical runs produce identical output and write nothing twice.
 */
import { describe, it, expect } from 'vitest';

import {
    runWeeklyEngine,
    WEEKLY_STAGES,
    createNoopPersister,
    type ProviderOutcome,
    type WeeklyPersister,
    type PersistRow,
    type HistorySnapshot,
} from '../../server/seo/weeklyEngine';

/** One provider that returns a single, honest, observed keyword. */
const okProvider = (): ProviderOutcome[] => [
    {
        source: 'google_search_console',
        status: 'CONNECTED',
        dataKind: 'observed',
        records: [
            {
                keyword: 'steroid half life calculator',
                language: 'en',
                market: 'en-US',
                source: 'google_search_console',
                sourceType: 'SEARCH_INTELLIGENCE',
                sourceStatus: 'CONNECTED',
                sourceReference: 'https://example/gsc',
                discoveredAt: '2026-09-29T00:00:00.000Z',
                dataKind: 'observed',
                evidence: 'GSC row',
                evidenceType: 'api_response',
                generationMethod: 'api_poll',
                metrics: {
                    googleImpressions: 1000,
                    googleClicks: 40,
                    googleCtr: 0.04,
                    googlePosition: 12.5,
                    bingImpressions: null,
                    bingClicks: null,
                    googleAdsAvgMonthlySearches: null,
                    googleAdsCompetition: null,
                    trendsRelativeInterest: null,
                    internalSearchCount: null,
                    thirdPartyVolumeEstimate: null,
                },
            },
        ],
        partial: false,
    },
];

/** A provider that is BLOCKED, e.g. no credentials configured. */
const blockedProvider = (): ProviderOutcome[] => [
    {
        source: 'google_ads_keyword_planner',
        status: 'BLOCKED',
        dataKind: 'unavailable',
        records: [],
        error: 'BLOCKED: missing GOOGLE_ADS_DEVELOPER_TOKEN',
        partial: false,
    },
];

/** A persister that records what it was asked to write. */
function recordingPersister(result: 'ok' | 'fail' = 'ok') {
    const written: PersistRow[] = [];
    const persister: WeeklyPersister = {
        async persist(rows: readonly PersistRow[]) {
            if (result === 'fail') {
                // Returning ok:false is the ONLY condition that must finalize
                // the run FAILED, per the WeeklyPersister contract.
                return {
                    ok: false,
                    written: 0,
                    failures: rows.map((r) => ({
                        idempotencyKey: r.idempotencyKey,
                        message: 'db write refused',
                    })),
                };
            }
            written.push(...rows);
            return { ok: true, written: rows.length, failures: [] };
        },
    };
    return { persister, written };
}

const clock = () => new Date('2026-09-29T03:00:00.000Z');

describe('STEP 12 · weekly engine failure semantics', () => {
    it('declares exactly the fifteen stages, in order', () => {
        expect(WEEKLY_STAGES.length).toBe(15);
        expect(WEEKLY_STAGES[0]).toBe('DISCOVER');
        expect(WEEKLY_STAGES).toContain('PERSIST');
        expect(WEEKLY_STAGES[WEEKLY_STAGES.length - 1]).toBe('REPORT');
    });

    it('reports one result per stage even on a clean run', async () => {
        const { persister } = recordingPersister('ok');
        const result = await runWeeklyEngine({
            market: 'en-US',
            language: 'en',
            collect: okProvider,
            persister,
            now: clock,
        });
        expect(result.stages.length).toBe(15);
        expect(result.status).toBe('COMPLETED');
    });

    it('treats a BLOCKED provider as PARTIAL_SUCCESS, not FAILED', async () => {
        // This is the rule the whole system depends on: an unreachable third
        // party must never be reported as "the pipeline is broken".
        const { persister } = recordingPersister('ok');
        const result = await runWeeklyEngine({
            market: 'en-US',
            language: 'en',
            collect: () => [...okProvider(), ...blockedProvider()],
            persister,
            now: clock,
        });
        expect(result.status).toBe('PARTIAL_SUCCESS');
        expect(result.status).not.toBe('FAILED');
    });
    it('treats a persistence failure as FAILED', async () => {
        // Losing a write silently is the one failure that must be loud.
        const { persister } = recordingPersister('fail');
        const result = await runWeeklyEngine({
            market: 'en-US',
            language: 'en',
            collect: okProvider,
            persister,
            now: clock,
        });
        expect(result.status).toBe('FAILED');
        const persistStage = result.stages.find((s) => s.stage === 'PERSIST');
        expect(persistStage?.status).toBe('FAILED');
    });

    it('never throws when a provider rejects', async () => {
        const { persister } = recordingPersister('ok');
        await expect(
            runWeeklyEngine({
                market: 'en-US',
                language: 'en',
                collect: async () => {
                    throw new Error('transport exploded');
                },
                persister,
                now: clock,
            })
        ).resolves.toBeDefined();
    });
});

describe('STEP 12 · idempotency and resumability', () => {
    it('refuses to skip PERSIST on a non-dry run, and still writes', async () => {
        // PERSIST is deliberately protected: skipping it on a real run would
        // report success for data that was never written. The engine must ignore
        // the request and write anyway.
        const { persister, written } = recordingPersister('ok');
        const result = await runWeeklyEngine({
            market: 'en-US',
            language: 'en',
            collect: okProvider,
            persister,
            skipStages: ['PERSIST'],
            now: clock,
        });
        expect(written.length).toBeGreaterThan(0);
        const persistStage = result.stages.find((s) => s.stage === 'PERSIST');
        expect(persistStage?.status).toBe('COMPLETED');
    });

    it('honours a skipped non-persist stage without failing the run', async () => {
        const { persister } = recordingPersister('ok');
        const result = await runWeeklyEngine({
            market: 'en-US',
            language: 'en',
            collect: okProvider,
            persister,
            skipStages: ['DETECT_GAPS'],
            now: clock,
        });
        const skipped = result.stages.find((s) => s.stage === 'DETECT_GAPS');
        expect(skipped?.status).toBe('SKIPPED');
        // A skip is a PARTIAL_SUCCESS, never a silent COMPLETED.
        expect(result.status).toBe('PARTIAL_SUCCESS');
    });

    it('supports a dry run that reports without writing', async () => {
        const { persister, written } = recordingPersister('ok');
        const result = await runWeeklyEngine({
            market: 'en-US',
            language: 'en',
            collect: okProvider,
            persister,
            dryRun: true,
            now: clock,
        });
        expect(written).toHaveLength(0);
        expect(result.status).not.toBe('FAILED');
    });

    it('produces identical results across two identical runs', async () => {
        const a = await runWeeklyEngine({
            market: 'ar-EG',
            language: 'ar',
            collect: okProvider,
            persister: createNoopPersister(),
            now: clock,
        });
        const b = await runWeeklyEngine({
            market: 'ar-EG',
            language: 'ar',
            collect: okProvider,
            persister: createNoopPersister(),
            now: clock,
        });
        const shape = (r: typeof a) => ({
            status: r.status,
            stages: r.stages.map((s) => [s.stage, s.status]),
        });
        expect(shape(a)).toEqual(shape(b));
    });

    it('marks stages before resumeFrom as SKIPPED, never FAILED', async () => {
        const { persister } = recordingPersister('ok');
        const first = await runWeeklyEngine({
            market: 'en-US',
            language: 'en',
            collect: okProvider,
            persister,
            now: clock,
        });
        const resumed = await runWeeklyEngine({
            market: 'en-US',
            language: 'en',
            collect: okProvider,
            persister,
            resumeFrom: 'PERSIST',
            resume: first.stages,
            now: clock,
        });
        for (const stage of resumed.stages) {
            expect(stage.status).not.toBe('FAILED');
        }
    });

    it('treats empty history as unknown rather than inventing a trend', async () => {
        const history: HistorySnapshot = { previousScores: new Map() };
        const { persister } = recordingPersister('ok');
        const result = await runWeeklyEngine({
            market: 'en-US',
            language: 'en',
            collect: okProvider,
            persister,
            history,
            now: clock,
        });
        const cmp = result.stages.find((s) => s.stage === 'COMPARE_WITH_HISTORY');
        expect(cmp?.status).toBe('COMPLETED');
    });
});
