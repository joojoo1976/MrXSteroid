/**
 * tests/unit/seoWeeklyHistoryRegression.test.ts
 * PHASE 1C regression suite for DEFECT 1, DEFECT 2 and DEFECT 3.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Phase 1A proved COMPARE_WITH_HISTORY could never observe history: the writer
 * keyed `previousScores` as `${market}::${keyword}` (display text) while the
 * reader looked up `normalizedKeyword` (no market). Every lookup missed, so
 * every keyword was classified NEW on every run.
 *
 * The defect SURVIVED the entire pre-existing suite (30/30 green) because
 * `seoWeeklyEngine.test.ts` always passed `previousScores: new Map()`, so a
 * successful lookup was never exercised, and no test asserted the
 * `newKeywords` / `up` / `down` counters.
 *
 * THRESHOLD RULE: no threshold is invented here. Every boundary asserted below
 * is the existing authoritative constant imported from snapshotDiff
 * (RISE_THRESHOLD / FALL_THRESHOLD), and boundary values are DERIVED from those
 * constants rather than typed as magic numbers.
 */

import { describe, it, expect } from 'vitest';

import {
    runWeeklyEngine,
    classifyWeeklyMovement,
    type WeeklyMovement,
    type HistoryComparisonDirection,
} from '../../server/seo/weeklyEngine';
import { buildWeeklyHistoryKey, buildWeeklyHistoryKeyFromText } from '../../server/seo/weeklyIdentity';
import {
    RISE_THRESHOLD,
    FALL_THRESHOLD,
    marketIdentityKey,
    diffWeeklyStates,
    type WeeklyState,
} from '../../server/seo/snapshotDiff';
import { toHistorySnapshot, type WeeklyStateRow } from '../../server/seo/refreshRuntime';
import type { ProviderOutcome } from '../../server/seo/sources/types';

const clock = () => new Date('2026-10-08T03:00:00.000Z');

/** One provider record, so the pipeline produces exactly one keyword. */
function record(keyword: string, score: number): ProviderOutcome {
    return {
        provider: 'test_provider',
        status: 'CONNECTED',
        records: [
            {
                keyword,
                normalizedKeyword: keyword.toLowerCase(),
                language: 'en',
                market: 'en-US',
                score,
                source: 'test_provider',
                dataKind: 'measured',
                observedAt: '2026-10-08T03:00:00.000Z',
            },
        ],
    } as unknown as ProviderOutcome;
}

const collectOne = (keyword: string, score: number) => async () => [record(keyword, score)];

const okPersister = {
    async persist() {
        return { ok: true, written: 1, failures: [] };
    },
};

/** Run the engine and return the single keyword it produced. */
async function runOne(
    keyword: string,
    score: number,
    history?: { previousScores: Map<string, number> }
) {
    const result = await runWeeklyEngine({
        market: 'en-US',
        language: 'en',
        collect: collectOne(keyword, score),
        persister: okPersister,
        now: clock,
        ...(history ? { history } : {}),
    });
    return { result, kw: result.keywords[0] };
    return { result, kw: result.keywords[0] };
};

/**
 * The engine exposes per-stage COUNTS inside `stages[]`, not on the run result.
 * Phase 1A proved nothing asserted these counters, which is precisely why the
 * broken history lookup stayed invisible; reading them here keeps the
 * regression guards on the real reported numbers.
 */
const counts = (result: { stages?: Array<{ stage?: string; counts?: Record<string, number> }> }) => {
    const stage = (result.stages ?? []).find((s) => s.stage === 'COMPARE_WITH_HISTORY');
    return (stage?.counts ?? {}) as Record<string, number>;
};


/* ==================================================================== */
/* DEFECT 1 â€” the history key contract                                  */
/* ==================================================================== */

describe('PHASE 1C Â· DEFECT 1 â€” history key writer/reader contract', () => {
    it('builds the SAME key the weekly engine reads with', () => {
        // THE regression: writer and reader must agree. Before the fix these
        // two produced different strings, so the lookup always missed.
        expect(buildWeeklyHistoryKey('en-US', 'ffmi calculator')).toBe('en-US::ffmi calculator');
    });

    it('matches the key format diffWeeklyStates already consumes', () => {
        // One identity, not two: the read path and the historical diff must
        // agree, or a keyword is "known" to one and "unknown" to the other.
        expect(buildWeeklyHistoryKey('en-US', 'ffmi calculator')).toBe(
            marketIdentityKey('FFMI Calculator', 'en', 'en-US')
        );
    });

    it('normalizes display text, so casing and spacing cannot fork identity', () => {
        expect(buildWeeklyHistoryKeyFromText('en-US', '  FFMI   Calculator ', 'en')).toBe(
            buildWeeklyHistoryKey('en-US', 'ffmi calculator')
        );
    });

    it('keeps markets separate â€” identical keywords in two markets are two identities', () => {
        expect(buildWeeklyHistoryKey('en-US', 'half life')).not.toBe(
            buildWeeklyHistoryKey('en-GB', 'half life')
        );
    });

    it('applies the ARABIC normaliser for Arabic text', () => {
        // Arabic normalisation strips Tashkeel AND unifies Alef/Taa Marbuta;
        // the English one does neither. A key built without the right
        // normaliser would fork one keyword into two identities.
        const withTashkeel = 'كَرْ makeup';
        const withoutTashkeel = 'كر makeup';
        expect(buildWeeklyHistoryKeyFromText('ar-EG', withTashkeel, 'ar')).toBe(
            buildWeeklyHistoryKeyFromText('ar-EG', withoutTashkeel, 'ar')
        );
        // And the English normaliser on the same input yields a DIFFERENT
        // key, which is exactly why the language must reach the key.
        expect(buildWeeklyHistoryKeyFromText('en-US', withTashkeel, 'en')).not.toBe(
            buildWeeklyHistoryKeyFromText('ar-EG', withoutTashkeel, 'ar')
        );
    });

    it('refuses to invent a market, returning null instead of defaulting', () => {
        expect(buildWeeklyHistoryKey(null, 'ffmi')).toBeNull();
        expect(buildWeeklyHistoryKey('en', 'ffmi')).toBeNull();   // bare language
        expect(buildWeeklyHistoryKey('xx-YY', 'ffmi')).toBeNull(); // unsupported
        expect(buildWeeklyHistoryKey('en-US', '')).toBeNull();     // empty keyword
    });

    it('toHistorySnapshot writes keys the engine can actually read back', () => {
        // THE END-TO-END PROOF of DEFECT 1. Previously the writer produced
        // `en-US::ffmi calculator` while the reader asked for `ffmi calculator`.
        const rows: WeeklyStateRow[] = [
            {
                keyword_id: 'kw-1',
                keyword: 'FFMI Calculator',
                language: 'en',
                market: 'en-US',
                year: 2026,
                week: 39,
                score: 60,
                rank: null,
                trend_status: null,
                destination_path: null,
            },
        ];
        const snapshot = toHistorySnapshot(rows);
        expect(snapshot.previousScores.get(buildWeeklyHistoryKey('en-US', 'ffmi calculator')!)).toBe(60);
    });
});
/* ==================================================================== */
/* DEFECT 1 â€” real historical comparison through the REAL engine        */
/* ==================================================================== */
/* ==================================================================== */
/* DEFECT 1 â€” real historical comparison through the REAL engine        */
/* ==================================================================== */

describe('PHASE 1C Â· DEFECT 1 â€” real history is now observed', () => {

    // NOTE ON SCORES: the engine RE-SCORES every keyword from its score
    // components (weeklyEngine.ts), so the record's score is an input to
    // scoring, not the final value. These tests therefore seed history from
    // the engine's ACTUAL computed score and assert on the DELTA it reports,
    // which is what COMPARE_WITH_HISTORY actually compares. Hardcoding a
    // provider score here would assert a number the engine never produces.
    async function runAndSeed() {
        const { kw } = await runOne('ffmi calculator', 80);
        const actual = kw.score ?? 0;
        return actual;
    }

    it('reports NO_HISTORY when there is genuinely no prior state', async () => {
        const { result, kw } = await runOne('ffmi calculator', 80);
        expect(kw.historyComparison?.direction).toBe<HistoryComparisonDirection>('unknown');
        expect(kw.weeklyMovement).toBe<WeeklyMovement>('NO_HISTORY');
        expect(counts(result).newKeywords).toBe(0);
    });

    it('classifies STABLE when this week equals last week', async () => {
        const actual = await runAndSeed();
        const history = { previousScores: new Map([['en-US::ffmi calculator', actual]]) };
        const { result, kw } = await runOne('ffmi calculator', 80, history);
        expect(kw.historyComparison?.previousScore).toBe(actual);
        expect(kw.historyComparison?.delta).toBe(0);
        expect(kw.historyComparison?.direction).toBe<HistoryComparisonDirection>('flat');
        expect(kw.weeklyMovement).toBe<WeeklyMovement>('STABLE');
        expect(counts(result).flat).toBe(1);
    });

    it('classifies RISING when this week scores above last week', async () => {
        const actual = await runAndSeed();
        const history = {
            previousScores: new Map([['en-US::ffmi calculator', actual - 10]]),
        };
        const { result, kw } = await runOne('ffmi calculator', 80, history);
        expect(kw.historyComparison?.previousScore).toBe(actual - 10);
        expect(kw.historyComparison?.delta).toBe(10);
        expect(kw.historyComparison?.direction).toBe<HistoryComparisonDirection>('up');
        expect(kw.weeklyMovement).toBe<WeeklyMovement>('RISING');
        expect(counts(result).up).toBe(1);
    });

    it('classifies DECLINING when this week scores below last week', async () => {
        const actual = await runAndSeed();
        const history = {
            previousScores: new Map([['en-US::ffmi calculator', actual + 10]]),
        };
        const { result, kw } = await runOne('ffmi calculator', 80, history);
        expect(kw.historyComparison?.previousScore).toBe(actual + 10);
        expect(kw.historyComparison?.delta).toBe(-10);
        expect(kw.historyComparison?.direction).toBe<HistoryComparisonDirection>('down');
        expect(kw.weeklyMovement).toBe<WeeklyMovement>('DECLINING');
        expect(counts(result).down).toBe(1);
    });


    it('reports NEW when history exists but THIS keyword is absent from it', async () => {
        const history = { previousScores: new Map([['en-US::a different keyword', 60]]) };
        const { result, kw } = await runOne('ffmi calculator', 80, history);
        expect(kw.historyComparison?.direction).toBe<HistoryComparisonDirection>('new');
        expect(kw.weeklyMovement).toBe<WeeklyMovement>('NEW');
        expect(counts(result).newKeywords).toBe(1);
    });

    it("does NOT see another market's history as its own", async () => {
        // Market isolation: en-US must never inherit the en-GB prior reading.
        const history = { previousScores: new Map([['en-GB::ffmi calculator', 40]]) };
        const { kw } = await runOne('ffmi calculator', 80, history);
        expect(kw.historyComparison?.previousScore).toBeNull();
        expect(kw.weeklyMovement).toBe<WeeklyMovement>('NEW');
    });

    it('treats a previous score of 0 as real evidence, not as missing', async () => {
        // 0 is a legitimate score. A truthfulness check would silently turn
        // "scored zero last week" into "no history".
        const actual = await runAndSeed();
        const history = { previousScores: new Map([['en-US::ffmi calculator', 0]]) };
        const { kw } = await runOne('ffmi calculator', 80, history);
        expect(kw.historyComparison?.previousScore).toBe(0);
        expect(kw.historyComparison?.delta).toBe(actual);
        expect(kw.weeklyMovement).toBe<WeeklyMovement>('RISING');
    });

    it('handles an empty history map as NO_HISTORY rather than throwing', async () => {
        const { kw } = await runOne('ffmi calculator', 80, { previousScores: new Map() });
        expect(kw.weeklyMovement).toBe<WeeklyMovement>('NO_HISTORY');
    });
});

describe('PHASE 1C Â· DEFECT 3 â€” weekly movement is its own vocabulary', () => {
    const move = (previousScore: number | null, currentScore: number | null, hasHistory = true) =>
        classifyWeeklyMovement({ hasHistory, previousScore, currentScore });

    it('reports NO_HISTORY when there is nothing to compare against', () => {
        expect(move(null, 80, false)).toBe('NO_HISTORY');
    });

    it('reports NEW when history exists but no prior reading does', () => {
        expect(move(null, 80, true)).toBe('NEW');
    });

    it('uses the SAME thresholds as diffWeeklyStates, not new invented ones', () => {
        // Boundaries are DERIVED from the authoritative constants rather than
        // typed as literals, so this test cannot drift from the real rule.
        expect(move(80, 80 + RISE_THRESHOLD)).toBe('STABLE');          // delta === threshold
        expect(move(80, 80 + RISE_THRESHOLD + 0.01)).toBe('RISING');   // delta > threshold
        expect(move(80, 80 - FALL_THRESHOLD)).toBe('STABLE');
        expect(move(80, 80 - FALL_THRESHOLD - 0.01)).toBe('DECLINING');
    });

    it('agrees with diffWeeklyStates on every classification', () => {
        // The write path (engine) and the read path (weeklyIntelligence) must
        // never disagree about whether a keyword moved.
        const base: Omit<WeeklyState, 'score'> = {
            keyword: 'ffmi calculator',
            language: 'en',
            market: 'en-US',
            year: 2026,
            week: 40,
            rank: null,
        };
        const cases: Array<[number, number]> = [
            [60, 95], [95, 60], [80, 80], [80, 81], [80, 79], [0, 0],
        ];
        for (const [previous, current] of cases) {
            const diff = diffWeeklyStates(
                [{ ...base, score: current }],
                [{ ...base, score: previous, week: 39 }]
            );
            const fromDiff = diff[0]?.state;
            const mapped =
                fromDiff === 'RISING' ? 'RISING'
                : fromDiff === 'FALLING' ? 'DECLINING'
                : 'STABLE';
            expect(move(previous, current)).toBe(mapped);
        }
    });

    it('never derives weekly movement from lifecycle inputs', () => {
        // A young, high-scoring keyword with NO history must NOT be reported as
        // rising. That is precisely the misleading behaviour Phase 1A found.
        expect(move(null, 95, false)).toBe('NO_HISTORY');
    });

    it('carries weeklyMovement separately from trendStatus on the same row', async () => {
        const history = { previousScores: new Map([['en-US::ffmi calculator', 60]]) };
        const { kw } = await runOne('ffmi calculator', 95, history);
        // Both exist, and neither is derived from the other: trendStatus comes
        // from determineTrendStatus (age/score), not from the weekly comparison.
        expect(kw.weeklyMovement).toBe('RISING');
        expect(kw.historyComparison).toBeDefined();
        expect(String(kw.trendStatus)).not.toBe(String(kw.weeklyMovement));
    });
});
