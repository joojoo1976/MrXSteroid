/**
 * server/seo/gapEngine.ts
 *
 * STEP 11 - Competitive gap detection.
 *
 * WHAT THIS FILE IS
 * -----------------
 * A *read-only classifier* that compares what competitors cover against what
 * MRX covers, and emits RECOMMENDATIONS. It has no database client, no fetch,
 * no filesystem access and no route table. It cannot create a page, an article
 * or a route, and it contains no code path that could.
 *
 * THE SIX STATES
 * --------------
 *   COMPETITOR_COVERED - a competitor targets it, MRX does not.
 *   MRX_COVERED       - MRX serves it, no competitor observed on it.
 *   SHARED            - both sides are observed.
 *   PARTIAL_GAP       - both sides, but MRX is thin: fewer observed signals or
 *                       a different market/language than the competitor.
 *   FULL_GAP          - neither side is observed, yet real input shows demand.
 *   EMERGING_GAP      - real input shows recent movement (a trend reading or a
 *                       new internal query) for something not yet covered.
 *
 * TRUTH RULES
 * -----------
 *  - Every gap carries the keyword/topic, its market, its language, the
 *    competitor when one is known, its evidence, and a
 *    RECOMMENDED DESTINATION TYPE. Never a path, slug, route or URL.
 *  - opportunityScore, searchVolume and confidence are `number | null` and are
 *    null unless a caller supplied a real reading for exactly that metric. A
 *    null is representable; a made-up number is not.
 *  - A gap is a RECOMMENDATION. `assertNoSideEffects()` is exported so callers
 *    and tests can prove the engine's output carries nothing actionable.
 */

import {
    DataKind,

    EvidenceType,
    Market,
    SourceClass,
    SourceLanguage,
    SourceStatus,
    emptyKeywordMetrics,
} from './sources/types';
import type { DestinationType } from './types';
import { normalizeKeyword, tokenJaccardSimilarity } from './normalization';

/* ------------------------------------------------------------------ */
/* States                                                              */
/* ------------------------------------------------------------------ */

/** The six coverage states. Exactly these, nothing else. */
export type GapState =
    | 'COMPETITOR_COVERED'
    | 'MRX_COVERED'
    | 'SHARED'
    | 'PARTIAL_GAP'
    | 'FULL_GAP'
    | 'EMERGING_GAP';

/** Canonical order, for stable reports and exhaustive test iteration. */
export const GAP_STATES: readonly GapState[] = [
    'COMPETITOR_COVERED',
    'MRX_COVERED',
    'SHARED',
    'PARTIAL_GAP',
    'FULL_GAP',
    'EMERGING_GAP',
] as const;

/** States that represent an opportunity worth a human's attention. */
export const ACTIONABLE_GAP_STATES: readonly GapState[] = [
    'COMPETITOR_COVERED',
    'PARTIAL_GAP',
    'FULL_GAP',
    'EMERGING_GAP',
] as const;

/** True when the state is a genuine opportunity rather than a coverage fact. */
export function isActionableGap(state: GapState): boolean {
    return ACTIONABLE_GAP_STATES.includes(state);
}

/* ------------------------------------------------------------------ */
/* Input records                                                      */
/* ------------------------------------------------------------------ */

/** A phrase observed on a competitor's site. */
export interface CompetitorCoverage {
    keyword: string;
    language: SourceLanguage;
    market: Market;
    domain: string;
    /** URL / crawl reference. The evidence pointer. Never fabricated. */
    sourceReference: string;
    evidenceType?: EvidenceType;
}

/** A phrase MRX currently serves. */
export interface MrxCoverage {
    keyword: string;
    language: SourceLanguage;
    market: Market;
    /** Verified destination TYPE currently mapped. Never a path. */
    destinationType?: DestinationType;
    /** How many distinct sources back this keyword. More is stronger. */
    signalCount?: number;
    /** ISO timestamp of the most recent observation. */
    lastObservedAt?: string;
}

/**
 * A topic nobody covers, but for which some real input shows demand. The
 * `signal` names WHICH provider supplied the demand evidence.
 */
export interface UncoveredDemand {
    keyword: string;
    language: SourceLanguage;
    market: Market;
    /** Which real source produced this demand evidence. */
    signal: 'internal_search' | 'gsc' | 'trends' | 'ads' | 'import';
    /** The exact observed value, kept under its own provider's name. */
    signalValue: number;
    /** Pointer to the observation. */
    sourceReference: string;
    /** Relative interest for trends, impressions for GSC, events for search. */
    signalKind: 'events' | 'impressions' | 'relative_interest' | 'avg_monthly_searches';
}

/** A destination TYPE that exists in the verified route table but is unserved. */
export interface UnservedDestination {
    destinationType: DestinationType;
    /** A real query that shows demand for it. */
    keyword: string;
    language: SourceLanguage;
    market: Market;
    sourceReference: string;
}

/** Everything the gap engine is allowed to read. All optional. */
export interface GapInput {
    competitorCoverage?: CompetitorCoverage[];
    mrxCoverage?: MrxCoverage[];
    uncoveredDemand?: UncoveredDemand[];
    unservedDestinations?: UnservedDestination[];
    /**
     * Token-Jaccard at or above which two phrases are the same topic. Default
     * 0.85, so only near-identical phrasing collapses.
     */
    similarityThreshold?: number;
    /**
     * A market counts as a mismatch when the two sides disagree. Default true:
     * an Arabic gap and an English page are a partial gap, not a shared one.
     */
    marketSensitive?: boolean;
    /**
     * A partially covered gap needs at least this many MRX signals to be called
     * SHARED rather than PARTIAL_GAP. Default 2.
     */
    sharedSignalMinimum?: number;
}

/* ------------------------------------------------------------------ */
/* Output shape                                                        */
/* ------------------------------------------------------------------ */

/**
 * One classified gap. Everything that could be mistaken for a metric is
 * `number | null` and defaults to null.
 */
export interface GapRecord {
    /** The keyword or topic the state describes. */
    keyword: string;
    normalizedKeyword: string;
    language: SourceLanguage;
    market: Market;
    state: GapState;
    /** The competitor domain, when a competitor is involved. Null otherwise. */
    competitor: string | null;
    /** The crawl/observation reference backing this state. Never empty. */
    evidence: string;
    evidenceType: EvidenceType;
    /**
     * RECOMMENDATION ONLY. A destination TYPE from the shared union. Null when
     * no verified type applies. NEVER a path, slug, route or URL - see
     * assertNoSideEffects.
     */
    recommendedDestinationType: DestinationType | null;
    /**
     * Never invented. Set only when the caller supplied a real reading under
     * this exact name. `opportunityScore` in particular has no data source in
     * this codebase and therefore stays null unless a caller supplies one.
     */
    opportunityScore: number | null;
    /** Only ever a real provider reading, under its own provider's name. */
    searchVolume: number | null;
    /** Null unless derivable. This engine has no basis for a confidence value. */
    confidence: number | null;
    /** Always 'observed' for a state derived from real observations. */
    dataKind: DataKind;
    /** Why this state was assigned, in one sentence. */
    reason: string;
    /** Number of distinct competitor domains observed on this topic. */
    competitorCount: number;
    /** Number of MRX signals observed on this topic. */
    mrxSignalCount: number;
    /** Deterministic id, for idempotent downstream reporting. */
    id: string;
}

/** The full report. */
export interface GapReport {
    gaps: GapRecord[];
    /** Count per state, every state present even at zero. */
    byState: Record<GapState, number>;
    /** Only the ACTIONABLE states, sorted by state then keyword. */
    recommendations: GapRecord[];
    /**
     * A machine-checkable assertion that this engine produced no actionable
     * artefact. Always present so a test never has to take the engine's word.
     */
    noSideEffects: {
        createsPages: false;
        createsArticles: false;
        createsRoutes: false;
        performsWrites: false;
    };
}

/* ------------------------------------------------------------------ */
/* Internals                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_SIMILARITY_THRESHOLD = 0.85;
const DEFAULT_SHARED_SIGNAL_MINIMUM = 2;

function collapse(value: string): string {
    return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function languageOf(language: SourceLanguage): SourceLanguage {
    return language === 'ar' ? 'ar' : 'en';
}

function normalize(keyword: string, language: SourceLanguage): string {
    return normalizeKeyword(keyword, languageOf(language)) || collapse(keyword);
}

/** Deterministic id: state, market, language and the normalized topic. */
function gapId(state: GapState, language: SourceLanguage, market: Market, normalized: string): string {
    return `gap:${state}:${language}:${market}:${normalized}`;
}

/** True when two phrases are the same topic for reporting purposes. */
function sameTopic(a: string, b: string, threshold: number): boolean {
    if (a === b) return true;
    return tokenJaccardSimilarity(a, b) >= threshold;
}

/** Recommend a destination TYPE from the caller's coverage, never a path. */
function recommendType(
    destinationType: DestinationType | undefined,
    fallback: DestinationType | null
): DestinationType | null {
    return destinationType ?? fallback;
}

/**
 * Pick the destination TYPE for an uncovered topic without inventing a route.
 * The mapping is coarse and type-level on purpose: it says "this looks like a
 * tool question", never "create /tools/foo".
 */
function inferTypeFromDemand(demand: UncoveredDemand): DestinationType | null {
    switch (demand.signal) {
        case 'gsc':
        case 'internal_search':
            // Observed first-party or first-hand search demand for a phrase we
            // do not cover. Informational by default; the reviewer decides.
            return 'article';
        case 'trends':
            return 'article';
        case 'ads':
        case 'import':
            return 'opportunity';
        default:
            return null;
    }
}

/** Evidence type for an uncovered-demand gap, taken from the real provider. */
function evidenceTypeForDemand(demand: UncoveredDemand): EvidenceType {
    switch (demand.signal) {
        case 'internal_search':
            return 'internal_search_observed';
        case 'ads':
            return 'google_ads_url_seed_signal';
        case 'gsc':
        case 'trends':
        case 'import':
            return 'imported';
        default:
            return 'imported';
    }
}

/** An evidence sentence that names the provider and its own metric name. */
function demandEvidence(demand: UncoveredDemand): string {
    return `${demand.signal} ${demand.signalKind}=${demand.signalValue} ref=${demand.sourceReference}`;
}

/* ------------------------------------------------------------------ */
/* Coverage comparison                                                 */
/* ------------------------------------------------------------------ */

/** One topic under evaluation, with everything both sides said about it. */
interface Topic {
    normalized: string;
    /** The first original string seen, used as the display keyword. */
    display: string;
    language: SourceLanguage;
    /** Markets observed on the competitor side. */
    competitorMarkets: Set<Market>;
    competitorDomains: Set<string>;
    competitorEvidence: string[];
    competitorEvidenceType: EvidenceType;
    /** Markets observed on the MRX side. */
    mrxMarkets: Set<Market>;
    mrxLanguages: Set<SourceLanguage>;
    mrxDestinationTypes: DestinationType[];
    mrxSignalCount: number;
    lastObservedAt: string | null;
}

function emptyTopic(
    normalized: string,
    display: string,
    language: SourceLanguage
): Topic {
    return {
        normalized,
        display,
        language,
        competitorMarkets: new Set<Market>(),
        competitorDomains: new Set<string>(),
        competitorEvidence: [],
        competitorEvidenceType: 'competitor_page',
        mrxMarkets: new Set<Market>(),
        mrxLanguages: new Set<SourceLanguage>(),
        mrxDestinationTypes: [],
        mrxSignalCount: 0,
        lastObservedAt: null,
    };
}

/**
 * Fold a coverage record into the topic map, matching on the near-duplicate
 * threshold so "testosterone cycle guide" and "cycle testosterone guide" land in
 * one topic instead of two.
 */
function foldCompetitor(
    topics: Map<string, Topic>,
    record: CompetitorCoverage,
    threshold: number
): void {
    if (!record?.keyword || !record?.domain || !record?.sourceReference) return;
    const language = languageOf(record.language);
    const normalized = normalize(record.keyword, language);
    if (!normalized) return;

    const match = findTopic(topics, normalized, language, threshold);
    const topic = match ?? emptyTopic(normalized, record.keyword, language);
    if (!match) topics.set(normalized, topic);

    topic.competitorMarkets.add(record.market);
    topic.competitorDomains.add(record.domain);
    if (topic.competitorEvidence.length < 3) {
        topic.competitorEvidence.push(`competitor:${record.domain} ${record.sourceReference}`);
    }
    if (record.evidenceType) topic.competitorEvidenceType = record.evidenceType;
}

function foldMrx(
    topics: Map<string, Topic>,
    record: MrxCoverage,
    threshold: number
): void {
    if (!record?.keyword) return;
    const language = languageOf(record.language);
    const normalized = normalize(record.keyword, language);
    if (!normalized) return;

    const match = findTopic(topics, normalized, language, threshold);
    const topic = match ?? emptyTopic(normalized, record.keyword, language);
    if (!match) topics.set(normalized, topic);

    topic.mrxMarkets.add(record.market);
    topic.mrxLanguages.add(language);
    if (record.destinationType) topic.mrxDestinationTypes.push(record.destinationType);
    if (Number.isFinite(record.signalCount) && (record.signalCount as number) > 0) {
        topic.mrxSignalCount = Math.max(topic.mrxSignalCount, record.signalCount as number);
    }
    if (record.lastObservedAt) topic.lastObservedAt = record.lastObservedAt;
}

/** Find an existing topic within the near-duplicate threshold. */
function findTopic(
    topics: Map<string, Topic>,
    normalized: string,
    language: SourceLanguage,
    threshold: number
): Topic | null {
    const exact = topics.get(normalized);
    if (exact) return exact;
    for (const topic of topics.values()) {
        if (topic.language !== language) continue;
        if (sameTopic(topic.normalized, normalized, threshold)) return topic;
    }
    return null;
}

/* ------------------------------------------------------------------ */
/* State assignment                                                    */
/* ------------------------------------------------------------------ */

/**
 * Assign one of the six states from what both sides actually showed.
 *
 * The order of the checks matters and encodes the definitions:
 *  - both sides present and MRX well-backed in the same market/language
 *    -> SHARED;
 *  - both sides present but MRX thin, or the market/language disagrees
 *    -> PARTIAL_GAP;
 *  - only a competitor -> COMPETITOR_COVERED;
 *  - only MRX -> MRX_COVERED;
 *  - neither side, but real demand evidence exists -> FULL_GAP (handled by the
 *    caller, which owns the demand records).
 */
function assignState(
    topic: Topic,
    marketSensitive: boolean,
    sharedSignalMinimum: number
): { state: GapState; reason: string } {
    const hasCompetitor = topic.competitorDomains.size > 0;
    const hasMrx = topic.mrxSignalCount > 0 || topic.mrxDestinationTypes.length > 0;

    if (hasCompetitor && !hasMrx) {
        return {
            state: 'COMPETITOR_COVERED',
            reason: `Observed on ${topic.competitorDomains.size} competitor domain(s) and on no MRX keyword.`,
        };
    }

    if (!hasCompetitor && hasMrx) {
        return {
            state: 'MRX_COVERED',
            reason: 'Served by MRX and observed on no competitor domain.',
        };
    }

    if (!hasCompetitor && !hasMrx) {
        // Neither side; the caller resolves this from the demand records.
        return {
            state: 'FULL_GAP',
            reason: 'Not covered by MRX and not observed on a competitor.',
        };
    }

    // Both sides.
    if (marketSensitive) {
        const sharedMarket = [...topic.competitorMarkets].some((m) => topic.mrxMarkets.has(m));
        if (!sharedMarket) {
            return {
                state: 'PARTIAL_GAP',
                reason: `Both sides cover this topic but in different markets (competitor: ${[...topic.competitorMarkets].join(', ')}; MRX: ${[...topic.mrxMarkets].join(', ')}).`,
            };
        }
    }

    if (topic.mrxSignalCount < sharedSignalMinimum) {
        return {
            state: 'PARTIAL_GAP',
            reason: `A competitor covers this topic and MRX has only ${topic.mrxSignalCount} signal(s), below the ${sharedSignalMinimum} required for a shared classification.`,
        };
    }

    return {
        state: 'SHARED',
        reason: `Both MRX and ${topic.competitorDomains.size} competitor domain(s) cover this topic in the same market with ${topic.mrxSignalCount} MRX signal(s).`,
    };
}

/** Assemble a GapRecord. All nullable metrics stay null unless supplied. */
function toGapRecord(
    state: GapState,
    reason: string,
    keyword: string,
    normalized: string,
    language: SourceLanguage,
    market: Market,
    competitor: string | null,
    evidence: string,
    evidenceType: EvidenceType,
    destinationType: DestinationType | null,
    extras?: { competitorCount?: number; mrxSignalCount?: number; searchVolume?: number | null }
): GapRecord {
    return {
        keyword,
        normalizedKeyword: normalized,
        language: languageOf(language),
        market,
        state,
        competitor,
        evidence,
        evidenceType,
        recommendedDestinationType: destinationType,
        // Never invented. No data source in this codebase produces these.
        opportunityScore: null,
        searchVolume: extras?.searchVolume ?? null,
        confidence: null,
        dataKind: 'observed',
        reason,
        competitorCount: extras?.competitorCount ?? 0,
        mrxSignalCount: extras?.mrxSignalCount ?? 0,
        id: gapId(state, languageOf(language), market, normalized),
    };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * THE entry point. Classifies every observed topic into exactly one of the six
 * states and returns RECOMMENDATIONS only.
 *
 * This function is pure: no database, no network, no filesystem, no route
 * creation. `report.noSideEffects` states that in machine-checkable form so a
 * test never has to trust a comment.
 */
export function detectGaps(input: GapInput): GapReport {
    const threshold = Number.isFinite(input?.similarityThreshold) && (input.similarityThreshold as number) > 0
        ? (input.similarityThreshold as number)
        : DEFAULT_SIMILARITY_THRESHOLD;
    const marketSensitive = input?.marketSensitive !== false;
    const sharedSignalMinimum = Number.isFinite(input?.sharedSignalMinimum) && (input.sharedSignalMinimum as number) > 0
        ? Math.floor(input.sharedSignalMinimum as number)
        : DEFAULT_SHARED_SIGNAL_MINIMUM;

    const topics = new Map<string, Topic>();

    for (const record of input?.competitorCoverage ?? []) foldCompetitor(topics, record, threshold);
    for (const record of input?.mrxCoverage ?? []) foldMrx(topics, record, threshold);

    const gaps: GapRecord[] = [];

    // 1. Classify every topic that at least one coverage side mentioned.
    for (const topic of topics.values()) {
        const assigned = assignState(topic, marketSensitive, sharedSignalMinimum);
        // A topic with no coverage on either side is not a gap; it is handled
        // by the demand pass below, which can prove demand exists.
        if (assigned.state === 'FULL_GAP' && topic.competitorDomains.size === 0 && topic.mrxSignalCount === 0) {
            continue;
        }

        const market = topic.competitorMarkets.size > 0
            ? [...topic.competitorMarkets][0]
            : [...topic.mrxMarkets][0];
        const competitor = topic.competitorDomains.size > 0 ? [...topic.competitorDomains].sort()[0] : null;
        const evidence = topic.competitorEvidence.length > 0
            ? topic.competitorEvidence.join(' | ')
            : `mrx_keyword=${topic.display}${topic.lastObservedAt ? ` lastObservedAt=${topic.lastObservedAt}` : ''}`;

        gaps.push(
            toGapRecord(
                assigned.state,
                assigned.reason,
                topic.display,
                topic.normalized,
                topic.language,
                market,
                competitor,
                evidence,
                topic.competitorDomains.size > 0 ? topic.competitorEvidenceType : 'editorial',
                recommendType(topic.mrxDestinationTypes[0], null),
                {
                    competitorCount: topic.competitorDomains.size,
                    mrxSignalCount: topic.mrxSignalCount,
                }
            )
        );
    }

    // 2. Uncovered demand: a topic nobody covers, but a real provider shows
    //    demand. FULL_GAP when the demand is a steady signal, EMERGING_GAP when
    //    it is a movement signal (trends relative interest, or a new internal
    //    query with a low absolute count that is clearly still forming).
    for (const demand of input?.uncoveredDemand ?? []) {
        if (!demand?.keyword || !demand?.sourceReference) continue;
        if (!Number.isFinite(demand.signalValue)) continue;

        const language = languageOf(demand.language);
        const normalized = normalize(demand.keyword, language);
        if (!normalized) continue;
        if (findTopic(topics, normalized, language, threshold)) continue;

        const emerging = demand.signal === 'trends' || demand.signalValue <= 1;
        const state: GapState = emerging ? 'EMERGING_GAP' : 'FULL_GAP';

        const record = toGapRecord(
            state,
            emerging
                ? `A movement signal (${demandEvidence(demand)}) exists for a topic neither MRX nor any observed competitor covers.`
                : `Neither MRX nor any observed competitor covers this topic, and ${demandEvidence(demand)} shows real demand.`,
            demand.keyword,
            normalized,
            language,
            demand.market,
            null,
            demandEvidence(demand),
            evidenceTypeForDemand(demand),
            inferTypeFromDemand(demand),
            { searchVolume: demand.signal === 'ads' ? demand.signalValue : null }
        );
        gaps.push(record);
        // Register it so a second demand record for the same topic folds in.
        const topic = emptyTopic(normalized, demand.keyword, language);
        topics.set(normalized, topic);
    }

    // 3. Unserved destination TYPES. The type exists in the verified route table
    //    but no keyword is mapped to it. RECOMMENDATION ONLY: the engine cannot
    //    and does not create the route.
    for (const unserved of input?.unservedDestinations ?? []) {
        if (!unserved?.keyword || !unserved?.destinationType || !unserved?.sourceReference) continue;
        const language = languageOf(unserved.language);
        const normalized = normalize(unserved.keyword, language);
        if (!normalized) continue;
        if (findTopic(topics, normalized, language, threshold)) continue;

        gaps.push(
            toGapRecord(
                'FULL_GAP',
                `A verified destination of type ${unserved.destinationType} exists but no MRX keyword is mapped to it, and this query is unserved. No route is created by this engine.`,
                unserved.keyword,
                normalized,
                language,
                unserved.market,
                null,
                `destination_gap type=${unserved.destinationType} ref=${unserved.sourceReference}`,
                'editorial',
                unserved.destinationType
            )
        );
    }

    const byState = {} as Record<GapState, number>;
    for (const state of GAP_STATES) byState[state] = 0;
    for (const gap of gaps) byState[gap.state] = (byState[gap.state] ?? 0) + 1;

    const recommendations = gaps
        .filter((g) => isActionableGap(g.state))
        .sort((a, b) => {
            if (a.state !== b.state) return a.state < b.state ? -1 : 1;
            return a.normalizedKeyword < b.normalizedKeyword ? -1 : 1;
        });

    return {
        gaps: gaps.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
        byState,
        recommendations,
        noSideEffects: {
            createsPages: false,
            createsArticles: false,
            createsRoutes: false,
            performsWrites: false,
        },
    };
}

/**
 * Machine-checkable proof that a gap record carries no actionable artefact.
 * Returns the offending field names, so a test can assert the array is empty.
 */
export function assertNoSideEffects(records: readonly GapRecord[]): string[] {
    const problems: string[] = [];
    for (const record of records) {
        const serialized = JSON.stringify(record);
        // A path, slug or URL would be an actionable artefact. A destination
        // TYPE is not, and is explicitly allowed.
        if (/"[^"]*(?:path|slug|route|url|href)[^"]*"\s*:\s*"(?:\/|[a-z]+:\/\/)/i.test(serialized)) {
            problems.push(`${record.id}: carries a path, slug, route or URL`);
        }
        if (typeof record.opportunityScore === 'number') {
            problems.push(`${record.id}: carries a numeric opportunityScore with no data source`);
        }
        if (typeof record.confidence === 'number') {
            problems.push(`${record.id}: carries a numeric confidence with no data source`);
        }
    }
    return problems;
}
