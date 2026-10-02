/**
 * server/seo/innovationEngine.ts
 *
 * STEP 10 - Innovation / candidate generation engine.
 *
 * WHAT THIS FILE IS
 * -----------------
 * A deterministic, auditable deriver of keyword CANDIDATES. Every candidate it
 * emits is sourceType GENERATED and dataKind generated. It never produces a
 * measured number.
 *
 * HARD TRUTH RULES (non-negotiable, asserted by tests)
 * -----------------------------------------------------
 *  1. NO INPUT, NO CANDIDATE. Every candidate is derived from a caller-supplied
 *     real input (competitor observation, internal search log row, Trends
 *     reading, GSC row, Ads reading, existing MRX keyword, verified
 *     destination label, or an explicit gap record). If the input is absent the
 *     method emits nothing.
 *  2. NO INVENTED NUMBERS. confidence is ALWAYS null, because no input
 *     available to this engine yields a defensible confidence value. metrics is
 *     always emptyKeywordMetrics(); a parent metric never transfers to a child.
 *  3. GENERATED IS NOT SOURCE-BACKED. dataKind generated and sourceClass
 *     GENERATED travel with every candidate and isSourceBacked() is false.
 *  4. FULL LINEAGE. Every candidate carries parentKeyword, generationMethod,
 *     generationReason and evidence. A candidate whose lineage cannot be stated
 *     is never emitted.
 *  5. DETERMINISTIC. The same input yields identical output. No randomness, no
 *     clock reads, no locale-dependent ordering.
 *  6. RECOMMENDATIONS ONLY. A candidate may carry a recommendedDestinationType
 *     (a TYPE) but NEVER a path, slug, route or URL. This engine cannot create
 *     a page, an article or a route.
 *
 * Reuses (never duplicates) the contracts in sources/types.ts, the tokenizer in
 * normalization.ts, and the destination types in types.ts.
 */

import {
    CompetitorContext,
    DataKind,
    EvidenceType,
    KeywordMetrics,
    Market,
    SourceClass,
    SourceLanguage,
    SourceStatus,
    emptyKeywordMetrics,
} from './sources/types';
import { normalizeKeyword, tokenJaccardSimilarity } from './normalization';
import type { DestinationType } from './types';

/* ------------------------------------------------------------------ */
/* Lineage vocabulary                                                  */
/* ------------------------------------------------------------------ */

/**
 * How a candidate string was produced. Every value names a rule that must be
 * re-runnable from the parent plus the input alone.
 */
export type GenerationMethod =
    | 'ads_idea_expansion'
    | 'commercial_modifier'
    | 'comparison_expansion'
    | 'competitor_gap_expansion'
    | 'destination_gap'
    | 'gsc_impression_expansion'
    | 'internal_search_expansion'
    | 'internal_search_question'
    | 'long_tail_modifier'
    | 'problem_solution_expansion'
    | 'question_expansion'
    | 'semantic_relation'
    | 'trends_expansion'
    | 'underserved_topic';

/** Canonical exhaustive order, for stable output and readable audit diffs. */
export const GENERATION_METHODS: readonly GenerationMethod[] = [
    'ads_idea_expansion',
    'commercial_modifier',
    'comparison_expansion',
    'competitor_gap_expansion',
    'destination_gap',
    'gsc_impression_expansion',
    'internal_search_expansion',
    'internal_search_question',
    'long_tail_modifier',
    'problem_solution_expansion',
    'question_expansion',
    'semantic_relation',
    'trends_expansion',
    'underserved_topic',
] as const;

/** The single source identity every generated candidate is attributed to. */
export const INNOVATION_SOURCE = 'internal_generated_expansion' as const;

/** sourceType value that marks a row as machine-derived, never observed. */
export const GENERATED_SOURCE_TYPE = 'GENERATED' as const;

/* ------------------------------------------------------------------ */
/* Candidate shape                                                     */
/* ------------------------------------------------------------------ */

/**
 * A generated candidate. parentKeyword / generationMethod / generationReason /
 * evidence are REQUIRED (not optional) precisely so a candidate without lineage
 * cannot even be constructed.
 */
export interface InnovationCandidate {
    /** The candidate string, exactly as derived. */
    keyword: string;
    /** Lower-cased collapsed form, used for dedupe and idempotency. */
    normalizedKeyword: string;
    language: SourceLanguage;
    market: Market;
    /** REQUIRED lineage: the real input this string was derived from. */
    parentKeyword: string;
    /** REQUIRED lineage: which rule produced it. */
    generationMethod: GenerationMethod;
    /** REQUIRED lineage: a human sentence explaining the rule application. */
    generationReason: string;
    /** REQUIRED lineage: a pointer to the concrete observation. */
    evidence: string;
    evidenceType: EvidenceType;
    /**
     * ALWAYS null. No input available to this engine yields a defensible
     * confidence value, and inventing one is the exact failure this file exists
     * to prevent.
     */
    confidence: number | null;
    /** Always generated. */
    dataKind: DataKind;
    source: typeof INNOVATION_SOURCE;
    sourceType: typeof GENERATED_SOURCE_TYPE;
    sourceClass: SourceClass;
    /**
     * PLANNED - honest for a deriver: no live provider sits behind a string
     * transform, and registry.ts already registers this provider as PLANNED
     * with provides_metrics false.
     */
    sourceStatus: SourceStatus;
    /** All null. A parent metric never transfers to a child keyword. */
    metrics: KeywordMetrics;
    /** Present only when the input was a competitor page. */
    competitorContext?: CompetitorContext;
    /**
     * RECOMMENDATION ONLY - a destination TYPE, never a path. Set only when the
     * caller passed a verified destination hint.
     */
    recommendedDestinationType?: DestinationType;
    /** Deterministic per-candidate id (no clock, no randomness). */
    id: string;
}

/**
 * Hard-coded false: a generated candidate is never source-backed. Exposed as a
 * function so a caller cannot accidentally treat GENERATED as verified by
 * branching on a truthy value.
 */
export function isSourceBacked(_candidate: InnovationCandidate): false {
    return false;
}

/* ------------------------------------------------------------------ */
/* Real inputs - every one must come from a real observation           */
/* ------------------------------------------------------------------ */

/** A competitor-derived seed. sourceReference must be a real crawl reference. */
export interface CompetitorInput {
    keyword: string;
    language: SourceLanguage;
    market: Market;
    /** Domain, so the evidence points at a real page. */
    domain: string;
    /** Crawl reference (URL / robots / sitemap entry). Never fabricated. */
    sourceReference: string;
    evidenceType?: EvidenceType;
    competitorContext?: CompetitorContext;
}

/** One aggregated first-party search log reading. */
export interface InternalSearchInput {
    keyword: string;
    /** Observed event count from our own logs. */
    count: number;
    language: SourceLanguage;
    market: Market;
}

/** A Google Trends relative-interest reading. The number IS the evidence. */
export interface TrendsInput {
    keyword: string;
    /** 0-100 relative interest, exactly as the provider returned it. */
    relativeInterest: number;
    language: SourceLanguage;
    market: Market;
    sourceReference: string;
}

/** A GSC observed row. Impressions are GSC impressions, never volume. */
export interface GscInput {
    keyword: string;
    impressions: number;
    clicks?: number;
    language: SourceLanguage;
    market: Market;
    sourceReference: string;
}

/** A Google Ads historical reading (modelled, never organic volume). */
export interface AdsInput {
    keyword: string;
    /** Google Ads average monthly searches, kept under its own name. */
    avgMonthlySearches: number;
    competition?: number;
    language: SourceLanguage;
    market: Market;
    sourceReference: string;
}

/** A keyword MRX already serves, used to avoid re-proposing what we have. */
export interface ExistingKeywordInput {
    keyword: string;
    language: SourceLanguage;
    market: Market;
    /** Verified destination type currently mapped. Never a path. */
    destinationType?: DestinationType;
}

/** A destination TYPE MRX has no keyword for yet. */
export interface DestinationGapInput {
    /** A destination type that exists in the verified route table. */
    destinationType: DestinationType;
    /** A real observed query that shows demand for it. */
    keyword: string;
    language: SourceLanguage;
    market: Market;
    sourceReference: string;
}

/** A topic a competitor covers and MRX does not. */
export interface UnderservedTopicInput {
    topic: string;
    domain: string;
    sourceReference: string;
    evidenceType?: EvidenceType;
    language: SourceLanguage;
    market: Market;
    competitorContext?: CompetitorContext;
}

/** Every real input the engine is allowed to read. All optional. */
export interface InnovationInput {
    competitorGaps?: CompetitorInput[];
    internalSearch?: InternalSearchInput[];
    trends?: TrendsInput[];
    gsc?: GscInput[];
    adsIdeas?: AdsInput[];
    existingKeywords?: ExistingKeywordInput[];
    destinationGaps?: DestinationGapInput[];
    underservedTopics?: UnderservedTopicInput[];
    /** Hard cap on emitted candidates. Default 500. */
    limit?: number;
    /**
     * Only apply modifier families to a parent with at least this many tokens.
     * Default 2: a one-word brand term yields no for-beginners variant.
     */
    minParentTokens?: number;
    /** Max modifiers applied per parent per family. Default 4. */
    maxPerParent?: number;
    /**
     * Two candidates are duplicates above this token-Jaccard similarity, so a
     * trivially reworded variant cannot be emitted twice. Default 0.9.
     */
    similarityCeiling?: number;
}

/* ------------------------------------------------------------------ */
/* Lexicons - string templates only, never claims                      */
/* ------------------------------------------------------------------ */

/**
 * These are STRING TEMPLATES, not data. Appending "for beginners" to a parent
 * asserts nothing about demand; it only builds a phrase for a human to review.
 * A template may never be turned into a number, and the evidence string for
 * each family always names the real observation the template was applied to.
 */
const LONG_TAIL_EN = ['for beginners', 'for advanced users', 'step by step', 'explained simply'] as const;
const LONG_TAIL_AR = ['للمبتدئين', 'خطوة بخطوة', 'بالتفصيل المبسط', 'للمحترفين'] as const;

/** Question prefixes. Skipped when the parent is already a question. */
const QUESTION_PREFIX_EN = ['how to', 'what is', 'why does', 'when should'] as const;
const QUESTION_PREFIX_AR = ['كيف', 'ما هو', 'لماذا', 'متى'] as const;

const ALREADY_QUESTION_EN = ['how', 'what', 'why', 'when', 'where', 'which', 'can', 'is', 'do', 'does'] as const;
const ALREADY_QUESTION_AR = ['كيف', 'ما', 'لماذا', 'متى', 'أين', 'هل'] as const;

/** Commercial modifiers. No price, no rating, no availability is implied. */
const COMMERCIAL_EN = ['price', 'cost', 'reviews', 'discount'] as const;
const COMMERCIAL_AR = ['السعر', 'الاسعار', 'مراجعات', 'خصم'] as const;

/** Semantic relations: a neighbouring topic word, not a metric. */
const RELATION_EN = ['benefits', 'side effects', 'results', 'safety', 'recovery'] as const;
const RELATION_AR = ['الفوائد', 'الاعراض الجانبية', 'النتائج', 'السلامة', 'التعافي'] as const;

/** Problem terms. */
const PROBLEM_EN = ['symptoms', 'mistakes', 'risks'] as const;
const PROBLEM_AR = ['الاعراض', 'الاخطاء', 'المخاطر'] as const;

/** Solution terms, always paired with a problem term from the same parent. */
const SOLUTION_EN = ['solution', 'fix', 'what to do', 'prevention'] as const;
const SOLUTION_AR = ['الحل', 'العلاج', 'ماذا تفعل', 'الوقاية'] as const;

/** Comparison template. Both sides of a comparison must be real terms. */
const COMPARISON_CONNECTOR = ' vs ' as const;

/* ------------------------------------------------------------------ */
/* Internals                                                           */
/* ------------------------------------------------------------------ */

/** Whitespace collapse plus lowercase, language agnostic. */
function collapse(value: string): string {
    return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function languageOf(language: SourceLanguage): SourceLanguage {
    return language === 'ar' ? 'ar' : 'en';
}

/** The lexicon row for a language. Never mixed across languages. */
function lexicon<T>(en: readonly T[], ar: readonly T[], language: SourceLanguage): readonly T[] {
    return languageOf(language) === 'ar' ? ar : en;
}

function isQuestion(keyword: string, language: SourceLanguage): boolean {
    const lower = collapse(keyword);
    const heads = lexicon(ALREADY_QUESTION_EN, ALREADY_QUESTION_AR, language);
    return heads.some((h) => lower === h || lower.startsWith(`${h} `));
}

/** Token count of the normalized form. One rule, both languages. */
function tokenCountOf(keyword: string, language: SourceLanguage): number {
    const normalized = normalizeKeyword(keyword, languageOf(language));
    if (!normalized) return 0;
    return normalized.split(/\s+/).filter(Boolean).length;
}

/**
 * Deterministic id, derived only from the immutable identity of the candidate
 * (language, market, normalized keyword, method). This is what lets a re-run be
 * idempotent upstream: the same input always produces the same id.
 */
function candidateId(
    language: SourceLanguage,
    market: Market,
    normalized: string,
    method: GenerationMethod
): string {
    return `gen:${language}:${market}:${method}:${normalized}`;
}

interface CandidateDraft {
    keyword: string;
    language: SourceLanguage;
    market: Market;
    parentKeyword: string;
    generationMethod: GenerationMethod;
    generationReason: string;
    evidence: string;
    evidenceType: EvidenceType;
    competitorContext?: CompetitorContext;
    recommendedDestinationType?: DestinationType;
}

/**
 * THE single construction path. A candidate that cannot state its own lineage
 * is dropped here (returns null) instead of being emitted with a hole in it,
 * which is what makes "every GENERATED record carries parent, method, reason and
 * evidence" a property of the type rather than a convention.
 */
function buildCandidate(draft: CandidateDraft): InnovationCandidate | null {
    const keyword = draft.keyword.replace(/\s+/g, ' ').trim();
    const parent = draft.parentKeyword.replace(/\s+/g, ' ').trim();
    if (!keyword || !parent) return null;
    if (!draft.generationMethod || !draft.generationReason || !draft.evidence) return null;

    const language = languageOf(draft.language);
    const normalized = normalizeKeyword(keyword, language) || collapse(keyword);
    if (!normalized) return null;

    return {
        keyword,
        normalizedKeyword: normalized,
        language,
        market: draft.market,
        parentKeyword: parent,
        generationMethod: draft.generationMethod,
        generationReason: draft.generationReason,
        evidence: draft.evidence,
        evidenceType: draft.evidenceType,
        // Rule 2: always null. Never a made-up number.
        confidence: null,
        dataKind: 'generated',
        source: INNOVATION_SOURCE,
        sourceType: GENERATED_SOURCE_TYPE,
        sourceClass: 'GENERATED',
        sourceStatus: 'PLANNED',
        // Rule 2: all-null metrics. A parent metric never transfers.
        metrics: emptyKeywordMetrics(),
        ...(draft.competitorContext ? { competitorContext: draft.competitorContext } : {}),
        ...(draft.recommendedDestinationType
            ? { recommendedDestinationType: draft.recommendedDestinationType }
            : {}),
        id: candidateId(language, draft.market, normalized, draft.generationMethod),
    };
}

/** Mutable per-run bookkeeping: what we already have, what we already made. */
interface Corpus {
    /** normalized existing keyword -> the original string, for lineage. */
    existing: Map<string, string>;
    /** normalized generated keyword -> the candidate already produced. */
    produced: Map<string, InnovationCandidate>;
}

function emptyCorpus(): Corpus {
    return { existing: new Map(), produced: new Map() };
}

/** Seed the "already served" set so we never re-propose what MRX has. */
function seedExisting(corpus: Corpus, inputs: readonly ExistingKeywordInput[] | undefined): void {
    for (const input of inputs ?? []) {
        if (!input?.keyword) continue;
        const normalized = normalizeKeyword(input.keyword, languageOf(input.language)) || collapse(input.keyword);
        if (normalized) corpus.existing.set(normalized, input.keyword);
    }
}

interface EmitOptions {
    competitorContext?: CompetitorContext;
    recommendedDestinationType?: DestinationType;
}

/**
 * Append `suffix` to `parent`, skipping results that are empty, identical to
 * the parent, or already known. A phrase that normalizes onto a keyword we
 * already serve is a duplicate, not a gap.
 */
function trySuffix(
    corpus: Corpus,
    parent: string,
    language: SourceLanguage,
    suffix: string,
    market: Market,
    method: GenerationMethod,
    reason: string,
    evidence: string,
    evidenceType: EvidenceType,
    options?: EmitOptions
): void {
    const keyword = `${parent} ${suffix}`.replace(/\s+/g, ' ').trim();
    const normalized = normalizeKeyword(keyword, languageOf(language)) || collapse(keyword);
    if (!normalized) return;
    if (normalized === (normalizeKeyword(parent, languageOf(language)) || collapse(parent))) return;
    if (corpus.existing.has(normalized) || corpus.produced.has(normalized)) return;
    const candidate = buildCandidate({
        keyword,
        language,
        market,
        parentKeyword: parent,
        generationMethod: method,
        generationReason: reason,
        evidence,
        evidenceType,
        ...(options ?? {}),
    });
    if (candidate) corpus.produced.set(candidate.normalizedKeyword, candidate);
}

/** Prefix `prefix` to `parent`, skipping when the parent is already a question. */
function tryPrefix(
    corpus: Corpus,
    parent: string,
    language: SourceLanguage,
    prefix: string,
    market: Market,
    method: GenerationMethod,
    reason: string,
    evidence: string,
    evidenceType: EvidenceType,
    options?: EmitOptions
): void {
    if (isQuestion(parent, language)) return;
    const keyword = `${prefix} ${parent}`.replace(/\s+/g, ' ').trim();
    const normalized = normalizeKeyword(keyword, languageOf(language)) || collapse(keyword);
    if (!normalized) return;
    if (corpus.existing.has(normalized) || corpus.produced.has(normalized)) return;
    const candidate = buildCandidate({
        keyword,
        language,
        market,
        parentKeyword: parent,
        generationMethod: method,
        generationReason: reason,
        evidence,
        evidenceType,
        ...(options ?? {}),
    });
    if (candidate) corpus.produced.set(candidate.normalizedKeyword, candidate);
}

/** Take the first `max` entries of a lexicon, deterministically. */
function head<T>(items: readonly T[], max: number): readonly T[] {
    return items.slice(0, Math.max(0, max));
}

/* ------------------------------------------------------------------ */
/* Per-family generators. Each reads ONE kind of real input.          */
/* ------------------------------------------------------------------ */

/**
 * Competitor gaps. A phrase a competitor targets is a real observed string, so
 * it may seed modifier expansion. The evidence keeps the domain and the crawl
 * reference so a reviewer can open the page.
 */
function fromCompetitorGaps(
    corpus: Corpus,
    inputs: readonly CompetitorInput[],
    minParentTokens: number,
    maxPerParent: number
): void {
    for (const input of inputs) {
        if (!input?.keyword || !input?.domain || !input?.sourceReference) continue;
        if (tokenCountOf(input.keyword, input.language) < minParentTokens) continue;
        const evidence = `competitor:${input.domain} ${input.sourceReference}`;
        const evidenceType = input.evidenceType ?? 'competitor_page';
        const options: EmitOptions = input.competitorContext
            ? { competitorContext: input.competitorContext }
            : {};

        for (const suffix of head(lexicon(LONG_TAIL_EN, LONG_TAIL_AR, input.language), maxPerParent)) {
            trySuffix(
                corpus,
                input.keyword,
                input.language,
                suffix,
                input.market,
                'competitor_gap_expansion',
                `Competitor ${input.domain} targets the observed phrase "${input.keyword}" in ${input.market}; the long-tail qualifier "${suffix}" was appended to test whether MRX answers the same need more precisely.`,
                evidence,
                evidenceType,
                options
            );
        }
    }
}

/**
 * Internal search telemetry. Our own first-party logs are the strongest input we
 * have: the string was typed by a real user on our own site.
 */
function fromInternalSearch(
    corpus: Corpus,
    inputs: readonly InternalSearchInput[],
    minParentTokens: number,
    maxPerParent: number
): void {
    for (const input of inputs) {
        if (!input?.keyword) continue;
        if (!Number.isFinite(input.count) || input.count <= 0) continue;
        const evidence = `internal_search_log events=${input.count} query=${input.keyword}`;

        for (const prefix of head(lexicon(QUESTION_PREFIX_EN, QUESTION_PREFIX_AR, input.language), maxPerParent)) {
            tryPrefix(
                corpus,
                input.keyword,
                input.language,
                prefix,
                input.market,
                'internal_search_question',
                `MRX recorded ${input.count} internal search event(s) for this query, so the question form "${prefix}" was derived for the same observed need.`,
                evidence,
                'internal_search_observed'
            );
        }

        if (tokenCountOf(input.keyword, input.language) < minParentTokens) continue;
        for (const suffix of head(lexicon(LONG_TAIL_EN, LONG_TAIL_AR, input.language), maxPerParent)) {
            trySuffix(
                corpus,
                input.keyword,
                input.language,
                suffix,
                input.market,
                'internal_search_expansion',
                `MRX recorded ${input.count} internal search event(s) for this query, so the long-tail qualifier "${suffix}" was derived from the same real demand.`,
                evidence,
                'internal_search_observed'
            );
        }
    }
}

/**
 * Google Trends. The reading is real, so the phrase is real. Note what the
 * evidence string does and does not say: it cites the relative-interest value
 * the provider returned and never converts it into a search volume.
 */
function fromTrends(
    corpus: Corpus,
    inputs: readonly TrendsInput[],
    minParentTokens: number,
    maxPerParent: number
): void {
    for (const input of inputs) {
        if (!input?.keyword || !input?.sourceReference) continue;
        if (!Number.isFinite(input.relativeInterest)) continue;
        if (tokenCountOf(input.keyword, input.language) < minParentTokens) continue;
        const evidence = `google_trends relativeInterest=${input.relativeInterest} ref=${input.sourceReference}`;

        for (const suffix of head(lexicon(LONG_TAIL_EN, LONG_TAIL_AR, input.language), maxPerParent)) {
            trySuffix(
                corpus,
                input.keyword,
                input.language,
                suffix,
                input.market,
                'trends_expansion',
                `Google Trends returned relative interest ${input.relativeInterest} for this term; the long-tail qualifier "${suffix}" was derived to test adjacent phrasing. Relative interest is not a search volume.`,
                evidence,
                'imported'
            );
        }
    }
}

/**
 * GSC. Impressions are OUR observed impressions in one market. The evidence
 * names the metric exactly and it is never relabelled as search volume.
 */
function fromGsc(
    corpus: Corpus,
    inputs: readonly GscInput[],
    minParentTokens: number,
    maxPerParent: number
): void {
    for (const input of inputs) {
        if (!input?.keyword || !input?.sourceReference) continue;
        if (!Number.isFinite(input.impressions) || input.impressions <= 0) continue;
        if (tokenCountOf(input.keyword, input.language) < minParentTokens) continue;
        const evidence = `gsc impressions=${input.impressions} ref=${input.sourceReference}`;

        for (const suffix of head(lexicon(LONG_TAIL_EN, LONG_TAIL_AR, input.language), maxPerParent)) {
            trySuffix(
                corpus,
                input.keyword,
                input.language,
                suffix,
                input.market,
                'gsc_impression_expansion',
                `Search Console observed ${input.impressions} impression(s) for this exact query in ${input.market}; the long-tail qualifier "${suffix}" was derived for the same intent. These are impressions, not search volume.`,
                evidence,
                'imported'
            );
        }
    }
}

/**
 * Google Ads. These are modelled historical averages from Keyword Planning and
 * the evidence says so. They never become organic volume.
 */
function fromAds(
    corpus: Corpus,
    inputs: readonly AdsInput[],
    minParentTokens: number,
    maxPerParent: number
): void {
    for (const input of inputs) {
        if (!input?.keyword || !input?.sourceReference) continue;
        if (!Number.isFinite(input.avgMonthlySearches) || input.avgMonthlySearches <= 0) continue;
        if (tokenCountOf(input.keyword, input.language) < minParentTokens) continue;
        const evidence = `google_ads_historical_search_signal avgMonthlySearches=${input.avgMonthlySearches} ref=${input.sourceReference}`;

        for (const suffix of head(lexicon(LONG_TAIL_EN, LONG_TAIL_AR, input.language), maxPerParent)) {
            trySuffix(
                corpus,
                input.keyword,
                input.language,
                suffix,
                input.market,
                'ads_idea_expansion',
                `Google Ads Keyword Planning reported ${input.avgMonthlySearches} average monthly searches for this term (a paid-bidding historical signal, not organic volume); the long-tail qualifier "${suffix}" was derived from that same term.`,
                evidence,
                'google_ads_url_seed_signal'
            );
        }
    }
}

/**
 * Semantic relations, questions, commercial modifiers and problem/solution
 * pairs. These run off existing MRX keywords, which are real corpus entries.
 * They touch no external provider, so they must be the strictest about not
 * re-proposing what we already serve.
 */
function fromExistingKeywords(
    corpus: Corpus,
    inputs: readonly ExistingKeywordInput[],
    minParentTokens: number,
    maxPerParent: number
): void {
    for (const input of inputs) {
        if (!input?.keyword) continue;
        if (tokenCountOf(input.keyword, input.language) < minParentTokens) continue;
        const evidence = `existing_mrx_keyword=${input.keyword}`;
        const options: EmitOptions = input.destinationType
            ? { recommendedDestinationType: input.destinationType }
            : {};

        for (const relation of head(lexicon(RELATION_EN, RELATION_AR, input.language), maxPerParent)) {
            trySuffix(
                corpus,
                input.keyword,
                input.language,
                relation,
                input.market,
                'semantic_relation',
                `MRX already serves this keyword; the neighbouring topic term "${relation}" was appended to test whether the same page should also answer the adjacent question.`,
                evidence,
                'editorial',
                options
            );
        }

        for (const prefix of head(lexicon(QUESTION_PREFIX_EN, QUESTION_PREFIX_AR, input.language), maxPerParent)) {
            tryPrefix(
                corpus,
                input.keyword,
                input.language,
                prefix,
                input.market,
                'question_expansion',
                `MRX already serves this keyword; the explicit question form "${prefix}" was derived because the existing phrase is not phrased as a question.`,
                evidence,
                'editorial',
                options
            );
        }

        for (const modifier of head(lexicon(COMMERCIAL_EN, COMMERCIAL_AR, input.language), maxPerParent)) {
            trySuffix(
                corpus,
                input.keyword,
                input.language,
                modifier,
                input.market,
                'commercial_modifier',
                `MRX already serves this keyword; the commercial qualifier "${modifier}" was appended to test a buying-stage variant. No price, rating, stock level or availability is asserted by this candidate.`,
                evidence,
                'editorial',
                options
            );
        }

        // Problem and solution are emitted as a PAIR from the same parent, so a
        // report can never show a problem term without its remedy.
        const problems = head(lexicon(PROBLEM_EN, PROBLEM_AR, input.language), maxPerParent);
        const solutions = head(lexicon(SOLUTION_EN, SOLUTION_AR, input.language), maxPerParent);
        const pairs = Math.min(problems.length, solutions.length);
        for (let i = 0; i < pairs; i += 1) {
            trySuffix(
                corpus,
                input.keyword,
                input.language,
                problems[i],
                input.market,
                'problem_solution_expansion',
                `MRX already serves this keyword; the problem term "${problems[i]}" was appended and is always paired with the remedy term "${solutions[i]}" from the same parent.`,
                evidence,
                'editorial',
                options
            );
            trySuffix(
                corpus,
                `${input.keyword} ${problems[i]}`,
                input.language,
                solutions[i],
                input.market,
                'problem_solution_expansion',
                `The remedy term "${solutions[i]}" was derived for the same parent as the problem term "${problems[i]}" so the problem/solution pair stays linked in the audit trail.`,
                evidence,
                'editorial',
                options
            );
        }
    }
}

/**
 * Comparisons. A comparison needs TWO real terms. The second term comes from the
 * same competitor input set (a real competitor phrase), never invented, so when
 * there is no second real term no comparison is emitted at all.
 */
function fromComparisons(
    corpus: Corpus,
    competitorInputs: readonly CompetitorInput[],
    maxPerParent: number
): void {
    for (let i = 0; i < competitorInputs.length; i += 1) {
        const first = competitorInputs[i];
        if (!first?.keyword || !first?.domain || !first?.sourceReference) continue;
        const taken = Math.min(competitorInputs.length, maxPerParent + 1);
        for (let j = 0; j < taken; j += 1) {
            if (i === j) continue;
            const second = competitorInputs[j];
            if (!second?.keyword || !second?.domain || !second?.sourceReference) continue;
            if (languageOf(first.language) !== languageOf(second.language)) continue;

            const keyword = `${first.keyword}${COMPARISON_CONNECTOR}${second.keyword}`.replace(/\s+/g, ' ').trim();
            const normalized = normalizeKeyword(keyword, languageOf(first.language)) || collapse(keyword);
            if (!normalized) continue;
            if (corpus.existing.has(normalized) || corpus.produced.has(normalized)) continue;

            const candidate = buildCandidate({
                keyword,
                language: first.language,
                market: first.market,
                parentKeyword: first.keyword,
                generationMethod: 'comparison_expansion',
                generationReason: `Both sides of the comparison are real observed phrases (${first.domain} and ${second.domain}); only the connector between them is a template, and no performance difference is asserted.`,
                evidence: `competitor:${first.domain} ${first.sourceReference} vs competitor:${second.domain} ${second.sourceReference}`,
                evidenceType: 'competitor_page',
                ...(first.competitorContext ? { competitorContext: first.competitorContext } : {}),
            });
            if (candidate) corpus.produced.set(candidate.normalizedKeyword, candidate);
        }
    }
}

/**
 * Underserved topics. A competitor covers a topic MRX does not. The topic string
 * itself is NOT re-emitted as a candidate (it is a competitor observation, not
 * a keyword we own); long-tail variants are derived so a reviewer can decide.
 */
function fromUnderservedTopics(
    corpus: Corpus,
    inputs: readonly UnderservedTopicInput[],
    minParentTokens: number,
    maxPerParent: number
): void {
    for (const input of inputs) {
        if (!input?.topic || !input?.domain || !input?.sourceReference) continue;
        if (tokenCountOf(input.topic, input.language) < minParentTokens) continue;
        const evidence = `competitor_underserved:${input.domain} ${input.sourceReference}`;
        const evidenceType = input.evidenceType ?? 'competitor_heading';
        const options: EmitOptions = input.competitorContext
            ? { competitorContext: input.competitorContext }
            : {};

        for (const suffix of head(lexicon(LONG_TAIL_EN, LONG_TAIL_AR, input.language), maxPerParent)) {
            trySuffix(
                corpus,
                input.topic,
                input.language,
                suffix,
                input.market,
                'underserved_topic',
                `Competitor ${input.domain} covers this topic and MRX has no keyword for it; the long-tail qualifier "${suffix}" was derived as a RECOMMENDATION for editorial review. This engine creates no page.`,
                evidence,
                evidenceType,
                options
            );
        }
    }
}

/**
 * Destination gaps. A verified destination TYPE exists in our route table and a
 * real query shows demand for it, but no MRX keyword is mapped to that type.
 * Only the TYPE is attached. This function cannot create a route.
 */
function fromDestinationGaps(
    corpus: Corpus,
    inputs: readonly DestinationGapInput[],
    maxPerParent: number
): void {
    for (const input of inputs) {
        if (!input?.keyword || !input?.sourceReference || !input?.destinationType) continue;
        if (tokenCountOf(input.keyword, input.language) < 1) continue;
        const evidence = `destination_gap type=${input.destinationType} ref=${input.sourceReference}`;

        for (const suffix of head(lexicon(LONG_TAIL_EN, LONG_TAIL_AR, input.language), maxPerParent)) {
            trySuffix(
                corpus,
                input.keyword,
                input.language,
                suffix,
                input.market,
                'destination_gap',
                `A verified destination of type ${input.destinationType} exists but no MRX keyword is mapped to it; the long-tail qualifier "${suffix}" was derived as a RECOMMENDATION only. No route is created by this engine.`,
                evidence,
                'editorial',
                { recommendedDestinationType: input.destinationType }
            );
        }
    }
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/** Default caps. Conservative on purpose. */
export const DEFAULT_CANDIDATE_LIMIT = 500;
export const DEFAULT_MIN_PARENT_TOKENS = 2;
export const DEFAULT_MAX_PER_PARENT = 4;
export const DEFAULT_SIMILARITY_CEILING = 0.9;

function positiveOr(value: number | undefined, fallback: number): number {
    return Number.isFinite(value) && (value as number) > 0 ? Math.floor(value as number) : fallback;
}

/**
 * Deterministic ordering, plus near-duplicate collapsing.
 *
 * Two candidates that differ only by a token reorder collapse to one, because
 * emitting "testosterone enanthate cycle guide" and "cycle testosterone enanthate
 * guide" is duplicate work for a reviewer. The survivor is the
 * lexicographically smaller normalized form, so the choice is stable.
 */
export function sortAndDeduplicate(
    candidates: readonly InnovationCandidate[],
    ceiling: number = DEFAULT_SIMILARITY_CEILING
): InnovationCandidate[] {
    const sorted = [...candidates].sort((a, b) => {
        if (a.normalizedKeyword !== b.normalizedKeyword) {
            return a.normalizedKeyword < b.normalizedKeyword ? -1 : 1;
        }
        if (a.generationMethod !== b.generationMethod) {
            return a.generationMethod < b.generationMethod ? -1 : 1;
        }
        return a.market < b.market ? -1 : a.market > b.market ? 1 : 0;
    });

    const kept: InnovationCandidate[] = [];
    for (const candidate of sorted) {
        const duplicate = kept.some(
            (k) => k.language === candidate.language && tokenJaccardSimilarity(k.normalizedKeyword, candidate.normalizedKeyword) >= ceiling
        );
        if (!duplicate) kept.push(candidate);
    }
    return kept;
}

/** Result envelope: the candidates plus an auditable tally of what was made. */
export interface InnovationResult {
    candidates: InnovationCandidate[];
    /** How many candidates each family contributed, for the run report. */
    byMethod: Record<string, number>;
    /** Inputs that were present but produced nothing, with the exact reason. */
    skipped: Array<{ method: GenerationMethod | 'input'; reason: string }>;
}

/**
 * THE entry point. Generates candidates from real inputs only.
 *
 * Guarantees, in the order they are most often forgotten:
 *  - every returned candidate has non-empty parentKeyword, generationMethod,
 *    generationReason and evidence;
 *  - every returned candidate has confidence === null and all-null metrics;
 *  - every returned candidate is dataKind generated / sourceType GENERATED;
 *  - no candidate carries a path, slug or URL;
 *  - the output is deterministic for a given input;
 *  - an empty input produces an empty array, never a seeded placeholder.
 */
export function generateCandidates(input: InnovationInput): InnovationResult {
    const limit = positiveOr(input?.limit, DEFAULT_CANDIDATE_LIMIT);
    const minParentTokens = positiveOr(input?.minParentTokens, DEFAULT_MIN_PARENT_TOKENS);
    const maxPerParent = positiveOr(input?.maxPerParent, DEFAULT_MAX_PER_PARENT);
    const ceiling = positiveOr(input?.similarityCeiling, DEFAULT_SIMILARITY_CEILING);

    const corpus = emptyCorpus();
    seedExisting(corpus, input?.existingKeywords);

    const competitorGaps = input?.competitorGaps ?? [];
    const skipped: InnovationResult['skipped'] = [];

    fromCompetitorGaps(corpus, competitorGaps, minParentTokens, maxPerParent);
    fromInternalSearch(corpus, input?.internalSearch ?? [], minParentTokens, maxPerParent);
    fromTrends(corpus, input?.trends ?? [], minParentTokens, maxPerParent);
    fromGsc(corpus, input?.gsc ?? [], minParentTokens, maxPerParent);
    fromAds(corpus, input?.adsIdeas ?? [], minParentTokens, maxPerParent);
    fromExistingKeywords(corpus, input?.existingKeywords ?? [], minParentTokens, maxPerParent);
    fromComparisons(corpus, competitorGaps, maxPerParent);
    fromUnderservedTopics(corpus, input?.underservedTopics ?? [], minParentTokens, maxPerParent);
    fromDestinationGaps(corpus, input?.destinationGaps ?? [], maxPerParent);

    if (competitorGaps.length < 2) {
        skipped.push({
            method: 'comparison_expansion',
            reason: 'a comparison needs two real observed terms; fewer than two competitor inputs were supplied',
        });
    }
    if (!input?.internalSearch?.length) {
        skipped.push({ method: 'internal_search_expansion', reason: 'no internal search log rows supplied' });
    }
    if (!input?.trends?.length) {
        skipped.push({ method: 'trends_expansion', reason: 'no Google Trends readings supplied' });
    }
    if (!input?.gsc?.length) {
        skipped.push({ method: 'gsc_impression_expansion', reason: 'no Search Console rows supplied' });
    }
    if (!input?.adsIdeas?.length) {
        skipped.push({ method: 'ads_idea_expansion', reason: 'no Google Ads readings supplied' });
    }
    if (!input?.underservedTopics?.length) {
        skipped.push({ method: 'underserved_topic', reason: 'no underserved topic observations supplied' });
    }
    if (!input?.destinationGaps?.length) {
        skipped.push({ method: 'destination_gap', reason: 'no destination gap observations supplied' });
    }
    if (!input?.existingKeywords?.length) {
        skipped.push({
            method: 'input',
            reason: 'no existing MRX keyword list supplied, so already-served phrases cannot be excluded',
        });
    }

    const ordered = sortAndDeduplicate([...corpus.produced.values()], ceiling);

    const byMethod: Record<string, number> = {};
    for (const method of GENERATION_METHODS) byMethod[method] = 0;
    for (const candidate of ordered) {
        byMethod[candidate.generationMethod] = (byMethod[candidate.generationMethod] ?? 0) + 1;
    }

    return { candidates: ordered.slice(0, limit), byMethod, skipped };
}

/** Convenience wrapper for callers that only want the array. */
export function generateInnovationCandidates(input: InnovationInput): InnovationCandidate[] {
    return generateCandidates(input).candidates;
}
