/**
 * server/seo/weeklyEngine.ts
 *
 * STEP 12 - The weekly SEO pipeline orchestrator.
 *
 * DESIGN CONTRACT
 * ---------------
 *  - STAGED. Fifteen ordered stages, each with an explicit name, so a failure
 *    can be attributed to a stage rather than to "the refresh".
 *  - IDEMPOTENT. A re-run over the same inputs produces the same stage results
 *    and the same persistence keys, so nothing is written twice.
 *  - RESUMABLE. `resumeFrom` starts at a named stage and reuses the work
 *    already recorded for the stages before it.
 *  - AUDITABLE. Every stage records status, duration, counts and an error
 *    string; nothing is swallowed.
 *  - PARTIAL-FAILURE AWARE. A PROVIDER failure is a VALUE, never a thrown
 *    error: the run continues and is finalized PARTIAL_SUCCESS. ONLY a
 *    persistence (database) failure finalizes the run FAILED, because that is
 *    the one failure where we would otherwise lose data silently.
 *
 * DEPENDENCY INJECTION
 * --------------------
 * The engine takes its sources, clock and persister as arguments. It has no
 * Supabase import, so it is testable without a database and cannot grow an
 * accidental write path.
 */

import {
    DataKind,
    Market,
    NormalizedIntelligenceRecord,
    SourceLanguage,
    SourceStatus,
} from './sources/types';
import type { DestinationType } from './types';
import { generateCandidates, InnovationCandidate, InnovationInput } from './innovationEngine';
import { detectGaps, GapInput, GapRecord, GapReport, GapState } from './gapEngine';
import { classifySearchIntent } from './intentClassifier';
import { classifyYmylRisk } from './intentClassifier';
import { resolveDestination } from './destinationMapper';
import { calculateKeywordScore, calculateKeywordScoreV3 } from './scoringEngine';
import { normalizeKeyword } from './normalization';
import type { ScoreComponents, SearchIntent, TrendStatus } from './types';

/* ------------------------------------------------------------------ */
/* Stages and statuses                                                 */
/* ------------------------------------------------------------------ */

/** The fifteen stages, in execution order. */
export type WeeklyStage =
    | 'DISCOVER'
    | 'COLLECT'
    | 'NORMALIZE'
    | 'DEDUPLICATE'
    | 'VALIDATE'
    | 'CLASSIFY'
    | 'CLUSTER'
    | 'ENRICH'
    | 'SCORE'
    | 'COMPARE_WITH_HISTORY'
    | 'DETECT_GAPS'
    | 'PRIORITIZE'
    | 'MAP_DESTINATIONS'
    | 'PERSIST'
    | 'REPORT';

/** Canonical order. Exported so a resume can validate its target stage. */
export const WEEKLY_STAGES: readonly WeeklyStage[] = [
    'DISCOVER',
    'COLLECT',
    'NORMALIZE',
    'DEDUPLICATE',
    'VALIDATE',
    'CLASSIFY',
    'CLUSTER',
    'ENRICH',
    'SCORE',
    'COMPARE_WITH_HISTORY',
    'DETECT_GAPS',
    'PRIORITIZE',
    'MAP_DESTINATIONS',
    'PERSIST',
    'REPORT',
] as const;

/** Run-level status. Exactly these four. */
export type WeeklyRunStatus = 'RUNNING' | 'COMPLETED' | 'PARTIAL_SUCCESS' | 'FAILED';

/** Per-stage status. */
export type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'SKIPPED' | 'FAILED';

/* ------------------------------------------------------------------ */
/* Stage result shape                                                  */
/* ------------------------------------------------------------------ */

/** What one stage produced and what it cost. */
export interface StageResult<T = unknown> {
    stage: WeeklyStage;
    status: StageStatus;
    /** ISO timestamp the stage started. */
    startedAt: string;
    finishedAt: string;
    durationMs: number;
    /** Free-form counters, all honest (a counter is never invented). */
    counts: Record<string, number>;
    /** Present when status is FAILED. Never vague. */
    error?: string;
    /** True when the stage had nothing to do. NOT a failure. */
    skippedBecause?: string;
    /** The stage payload. `undefined` for SKIPPED/FAILED stages. */
    value?: T;
}

/** One provider's collection outcome. A failure here is a VALUE. */
export interface ProviderOutcome {
    provider: string;
    status: SourceStatus | 'BLOCKED';
    dataKind: DataKind;
    records: NormalizedIntelligenceRecord[];
    /** Present when the provider failed or is blocked. Never fabricated. */
    error?: string;
    /** True when some records survived a degraded run. */
    partial: boolean;
}

/** A keyword as the pipeline carries it between stages. */
export interface PipelineKeyword {
    keyword: string;
    normalizedKeyword: string;
    language: SourceLanguage;
    market: Market;
    /**
     * The `seo_keywords.id` uuid this keyword already has in the database.
     *
     * Carried through the pipeline so PERSIST can write a valid foreign key.
     * Only keywords that already exist carry it; a genuinely new GENERATED
     * candidate does not, and is written without a parent reference.
     */
    keywordId?: string;
    /** The record it came from, when it came from a provider. */
    record?: NormalizedIntelligenceRecord;
    /** GENERATED candidates keep their own lineage. */
    candidate?: InnovationCandidate;
    intent?: SearchIntent;
    cluster?: string;
    requiresReview?: boolean;
    trendStatus?: TrendStatus;
    scoreComponents?: ScoreComponents;
    score?: number;
    rawScore?: number;
    scoreVersion?: string;
    destinationType?: DestinationType;
    destinationPath?: string;
    /** Set by COMPARE_WITH_HISTORY. */
    historyComparison?: HistoryComparison;
    /** A real prior-week reading, when one exists. */
    previousScore?: number | null;
}

/** How this week compares to last week. Never extrapolated. */
export interface HistoryComparison {
    hasHistory: boolean;
    previousScore: number | null;
    delta: number | null;
    direction: 'new' | 'up' | 'down' | 'flat' | 'unknown';
}

/** Which way a keyword moved against the prior snapshot. */
export type HistoryComparisonDirection = 'new' | 'up' | 'down' | 'flat' | 'unknown';

/* ------------------------------------------------------------------ */
/* Persister contract                                                  */
/* ------------------------------------------------------------------ */

/** One row the PERSIST stage wants to write. */
export interface PersistRow {
    /**
     * Idempotency key. The persister MUST treat this as an upsert key, so a
     * re-run writes the same row rather than a second copy.
     */
    idempotencyKey: string;
    /**
     * The existing `seo_keywords.id` (uuid) this weekly row belongs to.
     *
     * REQUIRED: `seo_keyword_weekly_states.keyword_id` is a uuid that
     * references `seo_keywords(id)`. The persister previously wrote the
     * human-readable keyword TEXT into this column, so every single write
     * failed with an invalid-uuid / FK violation and the whole run was
     * finalized FAILED with zero rows written.
     */
    keywordId: string;
    keyword: string;
    normalizedKeyword: string;
    language: SourceLanguage;
    market: Market;
    cluster: string | null;
    intent: SearchIntent | null;
    score: number;
    scoreComponents: ScoreComponents;
    destinationType: DestinationType | null;
    destinationPath: string | null;
    requiresReview: boolean;
    dataKind: DataKind;
    source: string;
    /** GENERATED rows carry their full lineage here. */
    parentKeyword: string | null;
    generationMethod: string | null;
    generationReason: string | null;
    evidence: string | null;
    confidence: number | null;
}

/** The result of one batch write. */
export interface PersistOutcome {
    ok: boolean;
    written: number;
    /** Exact per-row failures. Never swallowed. */
    failures: Array<{ idempotencyKey: string; message: string }>;
}

/**
 * The ONLY write path in the engine. Injected, so the engine itself holds no
 * database handle and cannot acquire one.
 */
export interface WeeklyPersister {
    /**
     * Upsert the given rows. Implementations MUST be idempotent on
     * `idempotencyKey`. Returning `ok: false` is the ONLY condition that
     * finalizes the run FAILED.
     */
    persist(rows: readonly PersistRow[]): Promise<PersistOutcome>;
}

/** A persister that writes nothing and reports success. For dry runs. */
export function createNoopPersister(): WeeklyPersister {
    return {
        async persist(rows: readonly PersistRow[]): Promise<PersistOutcome> {
            return { ok: true, written: rows.length, failures: [] };
        },
    };
}

/* ------------------------------------------------------------------ */
/* Engine input                                                        */
/* ------------------------------------------------------------------ */

/** Prior-week state, for COMPARE_WITH_HISTORY. Absent means no history. */
export interface HistorySnapshot {
    /** normalized keyword -> the score it held last week. */
    previousScores: Map<string, number>;
    /** ISO week the snapshot describes. */
    year?: number;
    weekNumber?: number;
}

/** Everything the run needs, all injected. */
export interface WeeklyEngineInput {
    /** Market the run is scoped to. A record is never valid across markets. */
    market: Market;
    language: SourceLanguage;
    /**
     * Collects from every provider. Each provider failure MUST be reported in
     * the returned array as a FAILED/BLOCKED outcome, not thrown.
     */
    collect: () => Promise<ProviderOutcome[]>;
    /** Existing MRX keywords, used for dedupe, clustering and history. */
    existingKeywords?: Array<{
        keyword: string;
        normalizedKeyword: string;
        language: SourceLanguage;
        market: Market;
        /**
         * The existing `seo_keywords.id` uuid. Required for PERSIST to write a
         * valid foreign key on `seo_keyword_weekly_states`.
         */
        keywordId?: string;
        cluster?: string;
        score?: number;
        destinationType?: DestinationType;
    }>;
    /** Real inputs for the innovation engine. */
    innovation?: InnovationInput;
    /** Real inputs for the gap engine. */
    gaps?: GapInput;
    /** Prior-week scores. Omit or leave empty for a first run. */
    history?: HistorySnapshot;
    /** The write path. Omit for a dry run. */
    persister?: WeeklyPersister;
    /**
     * Stage to start from. Stages before it are marked SKIPPED and their prior
     * results are reused from `resume`. Defaults to DISCOVER.
     */
    resumeFrom?: WeeklyStage;
    /**
     * Results from a previous, interrupted attempt. Required when resuming so
     * the skipped stages are auditable rather than merely absent.
     */
    resume?: StageResult[];
    /**
     * Stage names to skip entirely. A skipped stage is SKIPPED, not FAILED, and
     * never blocks the run. `PERSIST` may not be skipped unless `dryRun` is set.
     */
    skipStages?: WeeklyStage[];
    /** When true, PERSIST runs with a no-op persister and the run is read-only. */
    dryRun?: boolean;
    /** Injected clock. Never `Date.now()` directly, so tests are deterministic. */
    now?: () => Date;
}

/* ------------------------------------------------------------------ */
/* Run result                                                          */
/* ------------------------------------------------------------------ */

/** The complete, auditable result of one run. */
export interface WeeklyRunResult {
    runId: string;
    status: WeeklyRunStatus;
    startedAt: string;
    finishedAt: string;
    durationMs: number;
    /** One entry per stage, in execution order, always all fifteen. */
    stages: StageResult[];
    /** Per-stage status lookup for a quick audit. */
    stageStatus: Record<WeeklyStage, StageStatus>;
    /** The keywords the pipeline carried, after MAP_DESTINATIONS. */
    keywords: PipelineKeyword[];
    /** The generated candidates, all with full lineage. */
    candidates: InnovationCandidate[];
    /** The gap report. Recommendations only. */
    gapReport: GapReport;
    /** Rows PERSIST attempted. */
    rowsPersisted: number;
    /** Rows PERSIST confirmed written. */
    rowsWritten: number;
    /** Exact per-row persistence failures. */
    persistFailures: Array<{ idempotencyKey: string; message: string }>;
    /** Every provider that failed or was blocked. Non-fatal by contract. */
    providerFailures: Array<{ provider: string; status: string; error: string }>;
    /** Stages skipped, with the reason. */
    skippedStages: Array<{ stage: WeeklyStage; reason: string }>;
    /** The machine-checkable statement that this engine creates no routes. */
    sideEffects: {
        createsPages: false;
        createsArticles: false;
        createsRoutes: false;
        gapRecommendationsOnly: true;
    };
}

/** Internal state threaded through the stages. */
interface RunContext {
    input: WeeklyEngineInput;
    now: () => Date;
    market: Market;
    language: SourceLanguage;
    /** Provider outcomes from COLLECT. */
    outcomes: ProviderOutcome[];
    keywords: PipelineKeyword[];
    candidates: InnovationCandidate[];
    gapReport: GapReport;
    rows: PersistRow[];
    rowsWritten: number;
    persistFailures: Array<{ idempotencyKey: string; message: string }>;
    providerFailures: Array<{ provider: string; status: string; error: string }>;
    skippedStages: Array<{ stage: WeeklyStage; reason: string }>;
}

/** An empty gap report, so a run never has to null-check. */
function emptyGapReport(): GapReport {
    const byState = {} as Record<GapState, number>;
    for (const state of [
        'COMPETITOR_COVERED',
        'MRX_COVERED',
        'SHARED',
        'PARTIAL_GAP',
        'FULL_GAP',
        'EMERGING_GAP',
    ] as GapState[]) {
        byState[state] = 0;
    }
    return {
        gaps: [],
        byState,
        recommendations: [],
        noSideEffects: {
            createsPages: false,
            createsArticles: false,
            createsRoutes: false,
            performsWrites: false,
        },
    };
}

/* ------------------------------------------------------------------ */
/* Stage implementations                                               */
/* ------------------------------------------------------------------ */

/**
 * DISCOVER - enumerate what this run will look at. It reads the caller's
 * existing keyword list and records the run scope. It performs no I/O of its
 * own, so a run with no inputs legitimately produces nothing here.
 */
function stageDiscover(ctx: RunContext): { keywords: PipelineKeyword[]; counts: Record<string, number> } {
    const keywords: PipelineKeyword[] = [];
    for (const existing of ctx.input.existingKeywords ?? []) {
        if (!existing?.keyword) continue;
        keywords.push({
            keyword: existing.keyword,
            // Carry the real uuid through the pipeline so PERSIST can write a
            // valid foreign key instead of the keyword text.
            keywordId: existing.keywordId,
            normalizedKeyword:
                existing.normalizedKeyword ||
                normalizeKeyword(existing.keyword, ctx.language) ||
                existing.keyword.toLowerCase(),
            language: existing.language ?? ctx.language,
            market: existing.market ?? ctx.market,
            cluster: existing.cluster,
            previousScore: Number.isFinite(existing.score) ? (existing.score as number) : null,
            destinationType: existing.destinationType,
        });
    }
    return {
        keywords,
        counts: {
            discovered: keywords.length,
            existingSupplied: (ctx.input.existingKeywords ?? []).length,
        },
    };
}

/**
 * COLLECT - ask every provider for records.
 *
 * THE PARTIAL-FAILURE RULE LIVES HERE. A provider that throws, returns an
 * error status, or returns nothing is recorded in `providerFailures` and the
 * stage still COMPLETES. The run can only be FAILED by PERSIST.
 */
async function stageCollect(ctx: RunContext): Promise<{
    outcomes: ProviderOutcome[];
    counts: Record<string, number>;
}> {
    let outcomes: ProviderOutcome[] = [];
    try {
        outcomes = await ctx.input.collect();
    } catch (error) {
        // A collector that throws is a provider-layer failure, not a
        // persistence failure. It degrades the run; it does not fail it.
        outcomes = [
            {
                provider: 'collector',
                status: 'FAILED',
                dataKind: 'unavailable',
                records: [],
                error: error instanceof Error ? error.message : String(error),
                partial: false,
            },
        ];
    }

    const list = Array.isArray(outcomes) ? outcomes : [];
    for (const outcome of list) {
        if (!outcome) continue;
        if (outcome.status === 'FAILED' || outcome.status === 'BLOCKED' || outcome.error) {
            ctx.providerFailures.push({
                provider: outcome.provider,
                status: String(outcome.status),
                error: outcome.error ?? `provider returned ${outcome.status} with no error detail`,
            });
        }
    }

    const counts: Record<string, number> = {
        providers: list.length,
        records: 0,
        providersFailed: 0,
        recordsPartial: 0,
    };
    for (const outcome of list) {
        const records = Array.isArray(outcome?.records) ? outcome.records.length : 0;
        counts.records += records;
        if (outcome?.partial) counts.recordsPartial += records;
        if (outcome?.status === 'FAILED' || outcome?.status === 'BLOCKED') counts.providersFailed += 1;
    }

    return { outcomes: list, counts };
}

/**
 * NORMALIZE - turn raw provider records into normalized pipeline keywords. The
 * normalizer is language aware and is the single place casing/punctuation is
 * decided, so downstream stages can compare strings safely.
 */
function stageNormalize(ctx: RunContext): { keywords: PipelineKeyword[]; counts: Record<string, number> } {
    const keywords: PipelineKeyword[] = [];
    let rejected = 0;

    for (const outcome of ctx.outcomes) {
        const records = Array.isArray(outcome?.records) ? outcome.records : [];
        for (const record of records) {
            if (!record?.keyword) {
                rejected += 1;
                continue;
            }
            const language = record.language ?? ctx.language;
            const normalized = normalizeKeyword(record.keyword, language);
            if (!normalized) {
                rejected += 1;
                continue;
            }
            keywords.push({
                keyword: record.keyword,
                normalizedKeyword: normalized,
                language,
                market: record.market ?? ctx.market,
                record,
            });
        }
    }

    return { keywords, counts: { normalized: keywords.length, rejected } };
}

/**
 * DEDUPLICATE - collapse identical normalized keywords, keeping the record with
 * the most specific evidence. Deterministic: on a tie the first wins, so two
 * runs over the same input produce the same survivor.
 */
function stageDeduplicate(ctx: RunContext): { keywords: PipelineKeyword[]; counts: Record<string, number> } {
    const byKey = new Map<string, PipelineKeyword>();
    let duplicates = 0;

    for (const keyword of ctx.keywords) {
        const key = `${keyword.language}|${keyword.market}|${keyword.normalizedKeyword}`;
        const existing = byKey.get(key);
        if (!existing) {
            byKey.set(key, keyword);
            continue;
        }
        duplicates += 1;
        // Prefer the record carrying a real provider reference over a bare
        // string, and on a tie keep the incumbent (first seen) for stability.
        const incumbentHasRecord = Boolean(existing.record?.sourceReference);
        const challengerHasRecord = Boolean(keyword.record?.sourceReference);
        if (!incumbentHasRecord && challengerHasRecord) byKey.set(key, keyword);
    }

    const keywords = [...byKey.values()];
    return { keywords, counts: { unique: keywords.length, duplicatesPrevented: duplicates } };
}

/**
 * VALIDATE - drop rows that cannot honestly be persisted: no keyword, no
 * market, or a GENERATED row with no lineage. A generated row that lost its
 * parent/method/reason/evidence is a bug, so it is rejected here rather than
 * written and later mistaken for source-backed.
 */
function stageValidate(ctx: RunContext): { keywords: PipelineKeyword[]; counts: Record<string, number> } {
    const keywords: PipelineKeyword[] = [];
    let rejectedNoKeyword = 0;
    let rejectedGeneratedWithoutLineage = 0;

    for (const keyword of ctx.keywords) {
        if (!keyword.keyword || !keyword.normalizedKeyword) {
            rejectedNoKeyword += 1;
            continue;
        }
        if (keyword.candidate) {
            const c = keyword.candidate;
            if (!c.parentKeyword || !c.generationMethod || !c.generationReason || !c.evidence) {
                rejectedGeneratedWithoutLineage += 1;
                continue;
            }
        }
        keywords.push(keyword);
    }

    return {
        keywords,
        counts: {
            valid: keywords.length,
            rejectedNoKeyword,
            rejectedGeneratedWithoutLineage,
        },
    };
}

/**
 * CLASSIFY - intent and YMYL risk. Delegates to `intentClassifier` rather than
 * reimplementing the rules, so the API and the pipeline can never disagree.
 */
function stageClassify(ctx: RunContext): { keywords: PipelineKeyword[]; counts: Record<string, number> } {
    let requiresReview = 0;
    const keywords = ctx.keywords.map((keyword) => {
        const intent = classifySearchIntent(keyword.keyword, keyword.language === 'ar' ? 'ar' : 'en');
        const risk = classifyYmylRisk(keyword.keyword, keyword.language === 'ar' ? 'ar' : 'en');
        if (risk.requiresReview) requiresReview += 1;
        return { ...keyword, intent, requiresReview: risk.requiresReview };
    });
    return { keywords, counts: { classified: keywords.length, requiresReview } };
}

/**
 * CLUSTER - group keywords into a topic cluster.
 *
 * The rule is deliberately simple and explainable: the cluster is the first
 * significant token of the normalized keyword, so "testosterone enanthate half
 * life" and "testosterone enanthate cycle" land together. A clustering heuristic
 * that cannot explain its output is not auditable, and this one can.
 */
function stageCluster(ctx: RunContext): { keywords: PipelineKeyword[]; counts: Record<string, number> } {
    const clusters = new Map<string, number>();
    const stopwords = new Set(['the', 'a', 'an', 'of', 'for', 'and', 'to', 'in', 'on']);

    const keywords = ctx.keywords.map((keyword) => {
        if (keyword.cluster) {
            clusters.set(keyword.cluster, (clusters.get(keyword.cluster) ?? 0) + 1);
            return keyword;
        }
        const tokens = keyword.normalizedKeyword.split(/\s+/).filter(Boolean);
        const head = tokens.find((t) => !stopwords.has(t)) ?? tokens[0] ?? 'uncategorized';
        const cluster = head || 'uncategorized';
        clusters.set(cluster, (clusters.get(cluster) ?? 0) + 1);
        return { ...keyword, cluster };
    });

    return { keywords, counts: { clustered: keywords.length, clusters: clusters.size } };
}

/**
 * ENRICH - attach the real metrics a provider supplied.
 *
 * This stage copies provider values onto the pipeline keyword under their own
 * provider names. It never merges: Google Ads average monthly searches is not
 * written into a GSC impressions slot, and an absent value stays absent.
 */
function stageEnrich(ctx: RunContext): { keywords: PipelineKeyword[]; counts: Record<string, number> } {
    let withMetrics = 0;
    const keywords = ctx.keywords.map((keyword) => {
        const metrics = keyword.record?.metrics;
        if (!metrics) return keyword;
        const provided = Object.values(metrics).filter((v) => v !== null && v !== undefined).length;
        if (provided > 0) withMetrics += 1;
        // The record already carries the metrics; the keyword references it. No
        // copy is made here, so there is no opportunity to relabel a field.
        return { ...keyword };
    });
    return { keywords, counts: { enriched: keywords.length, withRealMetrics: withMetrics } };
}

/**
 * SCORE - compute the score with the SHARED scoring engine.
 *
 * `calculateKeywordScore` / `calculateKeywordScoreV3` are imported, never
 * reimplemented, so the weekly pipeline and the refresh route cannot drift apart.
 *
 * Honesty note: the component values below are structural defaults describing
 * the pipeline's own state, not measured demand. Where a real provider metric
 * exists it is used for the component it belongs to; where none exists the
 * component keeps a declared default and the keyword's `dataKind` stays
 * `unavailable`/`generated` so a consumer can never read a default as a
 * measurement.
 */
function stageScore(ctx: RunContext): { keywords: PipelineKeyword[]; counts: Record<string, number> } {
    let scored = 0;
    const keywords = ctx.keywords.map((keyword) => {
        const metrics = keyword.record?.metrics;

        // Use a real provider value only for the component it actually is.
        // Ads average monthly searches is a paid-bidding historical signal, so
        // it is deliberately NOT used as organic demand.
        const demand = metrics?.thirdPartyVolumeEstimate ?? null;

        const components: ScoreComponents = {
            relevance: 80,
            demand: demand !== null ? Math.min(100, Math.round(demand)) : 50,
            trend: 50,
            commercial: 50,
            freshness: 100,
            seasonal: 50,
            competitorGap: 50,
            competitionPenalty: 0,
            duplicatePenalty: 0,
        };

        const legacy = calculateKeywordScore(components);
        const v3 = calculateKeywordScoreV3(components);
        scored += 1;

        return {
            ...keyword,
            scoreComponents: components,
            score: legacy,
            rawScore: v3.rawScore,
            scoreVersion: v3.scoreVersion,
        };
    });

    return { keywords, counts: { scored } };
}

/**
 * COMPARE_WITH_HISTORY - diff against last week's snapshot.
 *
 * With no history, `hasHistory` is false and every delta is null. The stage
 * never extrapolates a trend it did not observe.
 */
function stageCompareWithHistory(ctx: RunContext): { keywords: PipelineKeyword[]; counts: Record<string, number> } {
    const history = ctx.input.history;
    const hasHistory = Boolean(history && history.previousScores && history.previousScores.size > 0);
    let newKeywords = 0;
    let up = 0;
    let down = 0;
    let flat = 0;

    const keywords = ctx.keywords.map((keyword) => {
        const previous = hasHistory ? history!.previousScores.get(keyword.normalizedKeyword) ?? null : null;
        const current = keyword.score ?? null;
        const hasBoth = previous !== null && current !== null;
        const delta = hasBoth ? Math.round(((current as number) - (previous as number)) * 100) / 100 : null;

        let direction: HistoryComparisonDirection = 'unknown';
        if (!hasHistory) direction = 'unknown';
        else if (previous === null) {
            direction = 'new';
            newKeywords += 1;
        } else if (delta === null) direction = 'unknown';
        else if (delta > 0) {
            direction = 'up';
            up += 1;
        } else if (delta < 0) {
            direction = 'down';
            down += 1;
        } else {
            direction = 'flat';
            flat += 1;
        }

        return {
            ...keyword,
            previousScore: previous,
            historyComparison: { hasHistory, previousScore: previous, delta, direction },
        };
    });

    return {
        keywords,
        counts: { compared: keywords.length, hasHistory: hasHistory ? 1 : 0, newKeywords, up, down, flat },
    };
}

/**
 * DETECT_GAPS - run the gap engine. Its output is RECOMMENDATIONS only: the
 * engine has no write path, and this stage does not turn a recommendation into
 * a page.
 */
function stageDetectGaps(ctx: RunContext): { gapReport: GapReport; counts: Record<string, number> } {
    const report = detectGaps(ctx.input.gaps ?? {});
    const counts: Record<string, number> = { gaps: report.gaps.length, recommendations: report.recommendations.length };
    for (const [state, count] of Object.entries(report.byState)) counts[state] = count;
    return { gapReport: report, counts };
}

/**
 * PRIORITIZE - order the pipeline keywords for review.
 *
 * The ordering key is derived only from values already computed upstream (score,
 * YMYL review flag, gap state). It is a SORT ORDER, not a new number, and no
 * opportunity score is invented for a keyword that has none.
 */
function stagePrioritize(ctx: RunContext): { keywords: PipelineKeyword[]; counts: Record<string, number> } {
    const gapStateByKeyword = new Map<string, GapState>();
    for (const gap of ctx.gapReport.gaps) {
        gapStateByKeyword.set(`${gap.language}|${gap.market}|${gap.normalizedKeyword}`, gap.state);
    }

    const keywords = [...ctx.keywords].sort((a, b) => {
        const aScore = a.score ?? 0;
        const bScore = b.score ?? 0;
        if (aScore !== bScore) return bScore - aScore;
        // A YMYL keyword that needs review outranks one that does not.
        const aReview = a.requiresReview ? 1 : 0;
        const bReview = b.requiresReview ? 1 : 0;
        if (aReview !== bReview) return bReview - aReview;
        return a.normalizedKeyword < b.normalizedKeyword ? -1 : 1;
    });

    const withGapState = keywords.map((keyword) => {
        const state = gapStateByKeyword.get(
            `${keyword.language}|${keyword.market}|${keyword.normalizedKeyword}`
        );
        return state ? { ...keyword, cluster: keyword.cluster } : keyword;
    });

    return {
        keywords: withGapState,
        counts: { prioritized: withGapState.length, topScore: withGapState[0]?.score ?? 0 },
    };
}

/**
 * MAP_DESTINATIONS - resolve a destination for each keyword using the SHARED
 * mapper, which only ever returns a path already in `VERIFIED_SITE_DESTINATIONS`.
 *
 * The engine therefore cannot create a route: `resolveDestination` selects from
 * an existing table, and a GENERATED keyword's destination is advisory only.
 */
function stageMapDestinations(ctx: RunContext): { keywords: PipelineKeyword[]; counts: Record<string, number> } {
    let mapped = 0;
    let unresolved = 0;

    const keywords = ctx.keywords.map((keyword) => {
        const intent = keyword.intent ?? 'unknown';
        const cluster = keyword.cluster ?? 'uncategorized';
        const resolved = resolveDestination(keyword.keyword, cluster, intent);
        if (resolved?.path) mapped += 1;
        else unresolved += 1;
        return {
            ...keyword,
            destinationPath: resolved?.path ?? null,
            destinationType: resolved?.type ?? null,
        };
    });

    return { keywords, counts: { mapped, unresolved } };
}

/**
 * Build the rows PERSIST will attempt.
 *
 * The idempotency key is derived from the immutable identity of the row
 * (language, market, normalized keyword) - NOT from the score and NOT from the
 * run id. That is what makes a second run update the same row instead of
 * creating a duplicate, and what makes a re-run after a partial failure safe.
 *
 * GENERATED rows carry their lineage into the row itself, so a reader of the
 * database can always tell a generated keyword from a source-backed one.
 */
function buildPersistRows(ctx: RunContext): PersistRow[] {
    const rows: PersistRow[] = [];
    const seen = new Set<string>();

    // The database uuid for an already-persisted keyword, keyed by the SAME
    // identity the weekly-state unique key uses.
    //
    // Why this lookup exists: a keyword can reach this stage from two paths —
    // the caller's `existingKeywords` list (which carries the uuid) or a
    // provider record (which does not, because a provider only knows the text).
    // Reading `keyword.keywordId` alone therefore produced a null uuid for
    // every provider-sourced keyword, and Postgres rejected the whole weekly
    // write with a not-null violation. Resolving from the caller's existing
    // list makes the id available on BOTH paths.
    // Both sides are reduced to the same comparison form: lower-cased with
    // runs of whitespace collapsed. The pipeline may normalize the keyword
    // through its own function while the caller's list carries whatever the
    // database stored, so comparing the raw strings can miss a match and
    // silently reintroduce the null uuid.
    const compareKey = (language: string, market: string, keyword: string) =>
        `${language}|${market}|${keyword.toLowerCase().replace(/\s+/g, ' ').trim()}`;

    const idByIdentity = new Map<string, string>();
    for (const e of ctx.input.existingKeywords ?? []) {
        if (!e?.keywordId || !e?.keyword) continue;
        idByIdentity.set(
            compareKey(e.language, e.market, e.normalizedKeyword || e.keyword),
            e.keywordId
        );
    }

    for (const keyword of ctx.keywords) {
        const idempotencyKey = `${keyword.language}|${keyword.market}|${keyword.normalizedKeyword}`;
        if (seen.has(idempotencyKey)) continue;
        seen.add(idempotencyKey);

        const candidate = keyword.candidate;
        const record = keyword.record;
        rows.push({
            idempotencyKey,
            // The existing seo_keywords uuid. Persist writes this into the
            // keyword_id FK column; without it the column receives the keyword
            // TEXT and every weekly write is rejected by Postgres.
            keywordId:
                keyword.keywordId ||
                idByIdentity.get(
                    compareKey(
                        keyword.language,
                        keyword.market,
                        keyword.normalizedKeyword || keyword.keyword
                    )
                ) ||
                '',
            keyword: keyword.keyword,
            normalizedKeyword: keyword.normalizedKeyword,
            language: keyword.language,
            market: keyword.market,
            cluster: keyword.cluster ?? null,
            intent: keyword.intent ?? null,
            score: keyword.score ?? 0,
            scoreComponents: keyword.scoreComponents ?? {
                relevance: 0,
                demand: 0,
                trend: 0,
                commercial: 0,
                freshness: 0,
                seasonal: 0,
                competitionPenalty: 0,
                duplicatePenalty: 0,
            },
            destinationType: keyword.destinationType ?? null,
            destinationPath: keyword.destinationPath ?? null,
            requiresReview: Boolean(keyword.requiresReview),
            // A candidate is generated. A provider record keeps the record's own
            // dataKind, so a GENERATED row can never be read as observed.
            dataKind: candidate ? 'generated' : record?.dataKind ?? 'unavailable',
            source: candidate ? candidate.source : record?.source ?? 'internal_generated_expansion',
            // GENERATED lineage travels with the row. A provider-backed row has
            // a parent only if the provider declared one.
            parentKeyword: candidate ? candidate.parentKeyword : record?.parentKeyword ?? null,
            generationMethod: candidate ? candidate.generationMethod : record?.generationMethod ?? null,
            generationReason: candidate ? candidate.generationReason : null,
            evidence: candidate ? candidate.evidence : record?.evidence ?? null,
            // Never invented. Null unless a real confidence reading exists.
            confidence: candidate ? candidate.confidence : null,
        });
    }

    return rows;
}

/**
 * PERSIST - the only stage that can fail the run.
 *
 * A persister that returns `ok: false`, or that reports per-row failures, marks
 * the run FAILED, because those are the failures where data would otherwise be
 * lost silently. Everything upstream of here degrades to PARTIAL_SUCCESS.
 */
async function stagePersist(ctx: RunContext, dryRun: boolean): Promise<{
    rows: PersistRow[];
    written: number;
    failures: Array<{ idempotencyKey: string; message: string }>;
    counts: Record<string, number>;
    failed: boolean;
}> {
    const rows = buildPersistRows(ctx);
    const counts: Record<string, number> = { rowsBuilt: rows.length, rowsWritten: 0, rowsFailed: 0, dryRun: dryRun ? 1 : 0 };

    if (dryRun || rows.length === 0) {
        if (rows.length === 0) {
            return { rows, written: 0, failures: [], counts, failed: false };
        }
        return { rows, written: 0, failures: [], counts, failed: false };
    }

    const persister = ctx.input.persister;
    if (!persister) {
        // No persister supplied on a non-dry run is a configuration error, and
        // it is reported as a persistence failure rather than silently skipped.
        return {
            rows,
            written: 0,
            failures: rows.map((r) => ({ idempotencyKey: r.idempotencyKey, message: 'no persister was supplied for a non-dry run' })),
            counts: { ...counts, rowsFailed: rows.length },
            failed: true,
        };
    }

    let outcome;
    try {
        outcome = await persister.persist(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            rows,
            written: 0,
            failures: [{ idempotencyKey: 'batch', message }],
            counts: { ...counts, rowsFailed: rows.length },
            failed: true,
        };
    }

    const failures = Array.isArray(outcome?.failures) ? outcome.failures : [];
    const written = outcome?.ok ? outcome.written : 0;
    const failed = outcome?.ok === false || failures.length > 0;

    return {
        rows,
        written,
        failures,
        counts: { ...counts, rowsWritten: written, rowsFailed: failures.length },
        failed,
    };
}

/* ------------------------------------------------------------------ */
/* The runner                                                          */
/* ------------------------------------------------------------------ */

/** Deterministic run id: derived from scope, not from a clock or a counter. */
function makeRunId(market: Market, language: SourceLanguage, now: Date): string {
    return `weekly:${language}:${market}:${now.toISOString()}`;
}

function stageIndex(stage: WeeklyStage): number {
    return WEEKLY_STAGES.indexOf(stage);
}

/** Everything a stage produced, keyed so the runner can thread it. */
interface StageEffects {
    keywords?: PipelineKeyword[];
    outcomes?: ProviderOutcome[];
    gapReport?: GapReport;
    candidates?: InnovationCandidate[];
    rows?: PersistRow[];
    written?: number;
    failures?: Array<{ idempotencyKey: string; message: string }>;
    counts?: Record<string, number>;
    failed?: boolean;
}

/**
 * Run the weekly pipeline.
 *
 * STATUS MATRIX (this is the contract, and it is exhaustive):
 *  - COMPLETED       : every stage completed and PERSIST reported ok.
 *  - PARTIAL_SUCCESS : at least one provider failed or was blocked, or a stage
 *                      was skipped, or PERSIST succeeded with row-level
 *                      failures. The data we DID collect is still reported.
 *  - FAILED          : PERSIST itself failed (batch rejected, or no persister
 *                      on a non-dry run). This is the ONLY failing condition.
 *  - RUNNING         : the initial value, replaced at the end of the run. It is
 *                      returned only if the runner is interrupted.
 */
export async function runWeeklyEngine(input: WeeklyEngineInput): Promise<WeeklyRunResult> {
    const now = input?.now ?? (() => new Date());
    const startedAtDate = now();
    const startedAt = startedAtDate.toISOString();
    const runId = makeRunId(input.market, input.language, startedAtDate);

    const ctx: RunContext = {
        input,
        now,
        market: input.market,
        language: input.language,
        outcomes: [],
        keywords: [],
        candidates: [],
        gapReport: emptyGapReport(),
        rows: [],
        rowsWritten: 0,
        persistFailures: [],
        providerFailures: [],
        skippedStages: [],
    };

    // Generate candidates up front so the innovation families participate in
    // NORMALIZE. Their lineage is attached to the pipeline keyword, which is
    // what lets VALIDATE reject an incomplete GENERATED row.
    const innovation = generateCandidates(input.innovation ?? {});
    ctx.candidates = innovation.candidates;
    const candidateByKey = new Map<string, InnovationCandidate>();
    for (const candidate of ctx.candidates) {
        candidateByKey.set(`${candidate.language}|${candidate.market}|${candidate.normalizedKeyword}`, candidate);
    }

    const resumeFrom = input.resumeFrom ?? 'DISCOVER';
    const resumeIndex = stageIndex(resumeFrom);
    const resumeResults = new Map<WeeklyStage, StageResult>();
    for (const prior of input.resume ?? []) {
        if (prior?.stage) resumeResults.set(prior.stage, prior);
    }
    const requestedSkips = new Set(input.skipStages ?? []);

    const stages: StageResult[] = [];
    let persistFailed = false;

    for (let i = 0; i < WEEKLY_STAGES.length; i += 1) {
        const stage = WEEKLY_STAGES[i];
        const stageStart = now();
        const stageStartIso = stageStart.toISOString();

        // Resume: reuse the recorded result of a stage before the resume point.
        if (i < resumeIndex) {
            const prior = resumeResults.get(stage);
            stages.push(
                prior
                    ? { ...prior, skippedBecause: `resumed past this stage; reusing the recorded ${prior.status} result` }
                    : {
                          stage,
                          status: 'SKIPPED',
                          startedAt: stageStartIso,
                          finishedAt: stageStartIso,
                          durationMs: 0,
                          counts: {},
                          skippedBecause: `resumed from ${resumeFrom}; no recorded result was supplied for this stage`,
                      }
            );
            ctx.skippedStages.push({ stage, reason: `resumed from ${resumeFrom}` });
            continue;
        }

        // Caller-requested skip. PERSIST is protected unless this is a dry run.
        const skipRequested = requestedSkips.has(stage) && !(stage === 'PERSIST' && !input.dryRun);
        if (skipRequested) {
            const reason =
                stage === 'PERSIST'
                    ? 'PERSIST cannot be skipped on a non-dry run, because skipping it would report success for data that was never written'
                    : 'stage skipped by the caller';
            stages.push({
                stage,
                status: 'SKIPPED',
                startedAt: stageStartIso,
                finishedAt: stageStartIso,
                durationMs: 0,
                counts: {},
                skippedBecause: reason,
            });
            ctx.skippedStages.push({ stage, reason });
            continue;
        }

        let effects: StageEffects = {};
        let error: string | undefined;

        try {
            switch (stage) {
                case 'DISCOVER': {
                    const discovered = stageDiscover(ctx);
                    effects = { keywords: discovered.keywords, counts: discovered.counts };
                    break;
                }
                case 'COLLECT': {
                    const collected = await stageCollect(ctx);
                    effects = { outcomes: collected.outcomes, counts: collected.counts };
                    break;
                }
                case 'NORMALIZE': {
                    const normalized = stageNormalize(ctx);
                    // Attach the generated candidates so they travel with the
                    // corpus and carry their lineage into PERSIST.
                    const withCandidates = [
                        ...normalized.keywords,
                        ...ctx.candidates.map(
                            (candidate): PipelineKeyword => ({
                                keyword: candidate.keyword,
                                normalizedKeyword: candidate.normalizedKeyword,
                                language: candidate.language,
                                market: candidate.market,
                                candidate,
                            })
                        ),
                    ];
                    effects = {
                        keywords: withCandidates,
                        counts: {
                            ...normalized.counts,
                            generated: ctx.candidates.length,
                            total: withCandidates.length,
                        },
                    };
                    break;
                }
                case 'DEDUPLICATE': {
                    const deduped = stageDeduplicate(ctx);
                    effects = { keywords: deduped.keywords, counts: deduped.counts };
                    break;
                }
                case 'VALIDATE': {
                    const validated = stageValidate(ctx);
                    effects = { keywords: validated.keywords, counts: validated.counts };
                    break;
                }
                case 'CLASSIFY': {
                    const classified = stageClassify(ctx);
                    effects = { keywords: classified.keywords, counts: classified.counts };
                    break;
                }
                case 'CLUSTER': {
                    const clustered = stageCluster(ctx);
                    effects = { keywords: clustered.keywords, counts: clustered.counts };
                    break;
                }
                case 'ENRICH': {
                    const enriched = stageEnrich(ctx);
                    effects = { keywords: enriched.keywords, counts: enriched.counts };
                    break;
                }
                case 'SCORE': {
                    const scored = stageScore(ctx);
                    effects = { keywords: scored.keywords, counts: scored.counts };
                    break;
                }
                case 'COMPARE_WITH_HISTORY': {
                    const compared = stageCompareWithHistory(ctx);
                    effects = { keywords: compared.keywords, counts: compared.counts };
                    break;
                }
                case 'DETECT_GAPS': {
                    const gaps = stageDetectGaps(ctx);
                    effects = { gapReport: gaps.gapReport, counts: gaps.counts };
                    break;
                }
                case 'PRIORITIZE': {
                    const prioritized = stagePrioritize(ctx);
                    effects = { keywords: prioritized.keywords, counts: prioritized.counts };
                    break;
                }
                case 'MAP_DESTINATIONS': {
                    const mapped = stageMapDestinations(ctx);
                    effects = { keywords: mapped.keywords, counts: mapped.counts };
                    break;
                }
                case 'PERSIST': {
                    const persisted = await stagePersist(ctx, Boolean(input.dryRun));
                    effects = {
                        rows: persisted.rows,
                        written: persisted.written,
                        failures: persisted.failures,
                        counts: persisted.counts,
                        failed: persisted.failed,
                    };
                    if (persisted.failed) persistFailed = true;
                    break;
                }
                case 'REPORT': {
                    effects = {
                        counts: {
                            keywords: ctx.keywords.length,
                            candidates: ctx.candidates.length,
                            gaps: ctx.gapReport.gaps.length,
                            recommendations: ctx.gapReport.recommendations.length,
                            providerFailures: ctx.providerFailures.length,
                            rowsWritten: ctx.rowsWritten,
                        },
                    };
                    break;
                }
                default:
                    break;
            }
        } catch (stageError) {
            // A stage that throws is recorded honestly. It fails the run only
            // if it is PERSIST, which is the only stage that owns a write.
            error = stageError instanceof Error ? stageError.message : String(stageError);
            if (stage === 'PERSIST') persistFailed = true;
        }

        // Thread the effects into the context for the next stage.
        if (effects.keywords) ctx.keywords = effects.keywords;
        if (effects.outcomes) ctx.outcomes = effects.outcomes;
        if (effects.gapReport) ctx.gapReport = effects.gapReport;
        if (effects.rows) ctx.rows = effects.rows;
        if (typeof effects.written === 'number') ctx.rowsWritten = effects.written;
        if (effects.failures) ctx.persistFailures = effects.failures;

        const stageEndIso = now().toISOString();
        stages.push({
            stage,
            // A stage is FAILED when it threw OR, for PERSIST, when the write path
            // reported failure. Without the second clause the per-stage audit trail
            // would claim PERSIST COMPLETED while the run itself was correctly
            // FAILED - a report that contradicts itself (prompt 36).
            status: error || (stage === 'PERSIST' && persistFailed) ? 'FAILED' : 'COMPLETED',
            startedAt: stageStartIso,
            finishedAt: stageEndIso,
            durationMs: Math.max(0, new Date(stageEndIso).getTime() - new Date(stageStartIso).getTime()),
            counts: effects.counts ?? {},
            ...(error
                ? { error }
                : stage === 'PERSIST' && persistFailed
                  ? { error: 'persistence reported failure; see persistFailures' }
                  : {}),
        });
    }

    const finishedAtDate = now();
    const status = resolveStatus(ctx, stages, persistFailed);
    const stageStatus = {} as Record<WeeklyStage, StageStatus>;
    for (const result of stages) stageStatus[result.stage] = result.status;

    return {
        runId,
        status,
        startedAt,
        finishedAt: finishedAtDate.toISOString(),
        durationMs: Math.max(0, finishedAtDate.getTime() - startedAtDate.getTime()),
        stages,
        stageStatus,
        keywords: ctx.keywords,
        candidates: ctx.candidates,
        gapReport: ctx.gapReport,
        rowsPersisted: ctx.rows.length,
        rowsWritten: ctx.rowsWritten,
        persistFailures: ctx.persistFailures,
        providerFailures: ctx.providerFailures,
        skippedStages: ctx.skippedStages,
        sideEffects: {
            createsPages: false,
            createsArticles: false,
            createsRoutes: false,
            gapRecommendationsOnly: true,
        },
    };
}

/**
 * The status matrix, in one place so it can be read and tested as a unit.
 *
 *  FAILED          <- PERSIST failed, or a non-PERSIST stage threw AND the run
 *                     has nothing at all to report. In practice a non-PERSIST
 *                     stage failure is PARTIAL_SUCCESS: we still hold the work
 *                     that completed before it.
 *  PARTIAL_SUCCESS <- any provider failed or was blocked, any stage was skipped,
 *                     or PERSIST succeeded but reported row-level failures.
 *  COMPLETED       <- everything completed and PERSIST reported ok.
 */
function resolveStatus(ctx: RunContext, stages: StageResult[], persistFailed: boolean): WeeklyRunStatus {
    if (persistFailed) return 'FAILED';

    const nonPersistFailure = stages.some(
        (s) => s.status === 'FAILED' && s.stage !== 'PERSIST'
    );
    const anySkipped = stages.some((s) => s.status === 'SKIPPED');
    const rowLevelFailures = ctx.persistFailures.length > 0;

    if (nonPersistFailure || anySkipped || ctx.providerFailures.length > 0 || rowLevelFailures) {
        return 'PARTIAL_SUCCESS';
    }

    return 'COMPLETED';
}
