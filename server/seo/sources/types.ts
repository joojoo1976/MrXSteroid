/**
 * server/seo/sources/types.ts
 * Step 2-3 — Unified source adapter contract.
 *
 * Single source of truth for every intelligence source in the platform. The
 * legacy `adapterContract.ts` (Step 1, `PROVEN | NOT_PROVEN | BLOCKED`) stays
 * untouched so existing imports keep compiling; this file describes the wider
 * seven-state model every adapter and the admin health view must obey.
 *
 * Truth rules encoded here (non-negotiable):
 * - A source may only be `VERIFIED` when a real live request actually succeeded.
 *   No credentials and no captured live response => `PLANNED` / `IMPLEMENTED` /
 *   `CONFIGURED` / `DISABLED` with an exact `blocked_reason`.
 * - Heterogeneous signals are NEVER merged into one field. `KeywordMetrics`
 *   keeps one nullable field per signal so "impressions" can never be silently
 *   relabelled as "search volume".
 * - A record with no real source carries `dataKind: 'unavailable'` and all-null
 *   metrics. Fabricated numbers are not representable.
 */

/** Lifecycle state of a provider integration. Exactly these seven. */
export type SourceStatus =
    | 'PLANNED'
    | 'IMPLEMENTED'
    | 'CONFIGURED'
    | 'CONNECTED'
    | 'VERIFIED'
    | 'FAILED'
    | 'DISABLED';

/** Canonical ordering, for admin display and for exhaustive iteration. */
export const SOURCE_STATUS_ORDER: readonly SourceStatus[] = [
    'PLANNED',
    'IMPLEMENTED',
    'CONFIGURED',
    'CONNECTED',
    'VERIFIED',
    'FAILED',
    'DISABLED',
] as const;

/** Trust/monetisation family a provider belongs to. */
export type SourceClass =
    | 'FIRST_PARTY'
    | 'SEARCH_INTELLIGENCE'
    | 'COMPETITIVE_WEB'
    | 'MANUAL_IMPORT'
    | 'PAID_OPTIONAL'
    | 'GENERATED'
    | 'EDITORIAL';

/** Epistemic status of a record's payload. Mirrors `KeywordDataKind`. */
export type DataKind =
    | 'observed'
    | 'estimated'
    | 'generated'
    | 'imported'
    | 'curated'
    | 'unavailable';

/** Market/locale scope. A record is never valid across markets. */
export type Market = 'ar-EG' | 'ar-SA' | 'ar-AE' | 'en-US' | 'en-GB' | 'en-CA' | 'en-AU';

/** All markets an adapter or request may target. */
export const MARKETS: readonly Market[] = [
    'ar-EG',
    'ar-SA',
    'ar-AE',
    'en-US',
    'en-GB',
    'en-CA',
    'en-AU',
] as const;

/** Languages an adapter or request may target. */
/**
 * THE canonical name for Google Ads Keyword Planner historical metrics.
 *
 * These are Google Ads historical average monthly searches in a paid-bidding
 * context. They are NOT organic search volume, NOT impressions, and NOT Google
 * Search Console data. Declared here, in the shared contract module, so that
 * every adapter, importer and test resolves the exact same string and no merge
 * can silently relabel these numbers as something they are not (§15, §20).
 */
export const GOOGLE_ADS_HISTORICAL_SIGNAL = 'google_ads_historical_search_signal' as const;

/** Evidence type for a record derived from a Google Ads keyword/page seed. */
export const GOOGLE_ADS_EVIDENCE_TYPE = 'google_ads_url_seed_signal' as const;

/**
 * Google's Keyword Planning guidance is to cache results and refresh historical
 * metrics about monthly, because they change at a limited rate. One refresh
 * cycle, expressed in seconds.
 */
export const GOOGLE_ADS_HISTORICAL_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;

export type SourceLanguage = 'en' | 'ar';

/**
 * The concrete artefact that backs a record. Consumers can therefore tell a
 * scraped competitor title apart from a Google Ads URL seed signal.
 */
export type EvidenceType =
    | 'competitor_page'
    | 'competitor_title'
    | 'competitor_heading'
    | 'competitor_visible_text'
    | 'competitor_structured_data'
    | 'competitor_sitemap'
    | 'commoncrawl_record'
    | 'imported_serp_export'
    | 'google_ads_url_seed_signal'
    | 'internal_search_observed'
    | 'editorial'
    | 'imported';

/**
 * Per-signal metrics. Every field is independently nullable and MUST stay
 * independent: no provider is allowed to write an estimate into a field whose
 * name belongs to a different provider.
 */
export interface KeywordMetrics {
    /** GSC-observed impressions for the exact query in the exact market. */
    googleImpressions: number | null;
    /** GSC-observed clicks for the exact query in the exact market. */
    googleClicks: number | null;
    /** GSC-observed click-through rate (0–1). */
    googleCtr: number | null;
    /** GSC-observed average position. */
    googlePosition: number | null;
    /** Bing Web Search impressions (separate engine, never merged into Google fields). */
    bingImpressions: number | null;
    /** Bing Web Search clicks (separate engine, never merged into Google fields). */
    bingClicks: number | null;
    /** Google Ads Keyword Planner average monthly searches, as returned by the API. */
    googleAdsAvgMonthlySearches: number | null;
    /** Google Ads reported competition index, as returned by the API. */
    googleAdsCompetition: number | null;
    /** Google Trends relative interest 0–100, as returned by the API. */
    trendsRelativeInterest: number | null;
    /** Count of internal first-party search events for this normalized query. */
    internalSearchCount: number | null;
    /** Third-party modelled volume estimate. Always paired with `dataKind: 'estimated'`. */
    thirdPartyVolumeEstimate: number | null;
}

/**
 * An all-null metrics object. The ONLY safe default: it asserts "no real
 * source produced a number" instead of substituting 0 (which would read as a
 * real observation of zero demand).
 */
export function emptyKeywordMetrics(): KeywordMetrics {
    return {
        googleImpressions: null,
        googleClicks: null,
        googleCtr: null,
        googlePosition: null,
        bingImpressions: null,
        bingClicks: null,
        googleAdsAvgMonthlySearches: null,
        googleAdsCompetition: null,
        trendsRelativeInterest: null,
        internalSearchCount: null,
        thirdPartyVolumeEstimate: null,
    };
}

/** Every metrics field name, for "what did we actually learn?" checks. */
export type KeywordMetricField = keyof KeywordMetrics;

/** Competitive context attached to a record discovered from the open/competitor web. */
export interface CompetitorContext {
    domain: string;
    url?: string;
    pageTitle?: string;
    headings?: string[];
    snippet?: string;
    /**
     * How strongly the domain is asserted to be a competitor. Discovery alone
     * never yields `verified_competitor`.
     */
    classification?:
        | 'public_web_page_discovered'
        | 'competitor_candidate'
        | 'verified_competitor';
    /** Crawl/capture reference for the exact evidence used. */
    evidenceReference?: string;
    capturedAt?: string;
}


/**
 * One normalised, fully-attributed intelligence record. Anything that cannot
 * fill `source`, `dataKind` and `evidenceType` honestly does not belong here.
 */
export interface NormalizedIntelligenceRecord {
    keyword: string;
    language: SourceLanguage;
    market: Market;
    source: string;
    sourceType: string;
    sourceClass: SourceClass;
    sourceStatus: SourceStatus;
    sourceReference: string;
    discoveredAt: string;
    dataKind: DataKind;
    /** Short, human-checkable pointer to the underlying evidence. */
    evidence: string;
    evidenceType: EvidenceType;
    /** Provenance parent (seed keyword or parent keyword id). */
    parentKeyword?: string;
    /** For `generated` records only: how the candidate was produced. */
    generationMethod?: string;
    metrics: KeywordMetrics;
    competitorContext?: CompetitorContext;
}

/** Inclusive date window a collection request is scoped to. */
export interface DateWindow {
    /** ISO date, inclusive. */
    start: string;
    /** ISO date, inclusive. */
    end: string;
}

/** Input to a single adapter collection run. */
export interface CollectRequest {
    language: SourceLanguage;
    market: Market;
    /** Seed keywords the adapter expands. Empty for pull-all adapters. */
    seeds: string[];
    dateWindow: DateWindow;
    /** Hard cap on returned records. */
    limit: number;
    /** Optional provider-specific query/dataset selector. */
    query?: string;
    /** Optional caller-supplied abort signal. */
    signal?: AbortSignal;
}

/**
 * Output of a single adapter collection run. A provider failure is a value,
 * never a thrown pipeline error: `status` carries the outcome and `error`
 * carries the exact reason.
 */
export interface CollectResult {
    source: string;
    status: SourceStatus;
    dataKind: DataKind;
    records: NormalizedIntelligenceRecord[];
    error?: string;
    /** True when some records survived even though the run was degraded. */
    partial: boolean;
}

/** Cost posture of a provider, surfaced so nobody enables a paid source blind. */
export type CostClass = 'free' | 'self_hosted' | 'metered_free_tier' | 'paid';

/** How strong a source's evidence is, weakest first. */
export type EvidenceLevel = 'none' | 'declared' | 'imported' | 'observed_live';

/** Admin-dashboard view of one provider. */
export interface SourceStatusInfo {
    provider: string;
    /** Key of the adapter implementation inside `server/seo/sources/`. */
    adapter_key: string;
    source_class: SourceClass;
    status: SourceStatus;
    languages: SourceLanguage[];
    markets: Market[];
    auth_required: boolean;
    auth_present: boolean;
    /** Exact, non-vague reason the source cannot run. Null when not blocked. */
    blocked_reason: string | null;
    last_attempt_at: string | null;
    last_success_at: string | null;
    last_failure_at: string | null;
    last_error: string | null;
    quota_limit: number | null;
    quota_used: number;
    cost_class: CostClass;
    evidence_level: EvidenceLevel;
    cache_ttl_seconds: number;
    /** Non-secret, human-readable configuration notes (never keys/tokens). */
    config: Record<string, string | number | boolean>;
}

/** States that may legally run against a live provider. */
export const RUNTIME_EXECUTABLE_STATUSES: readonly SourceStatus[] = [
    'CONNECTED',
    'VERIFIED',
] as const;

/** True when a source may be called at runtime. */
export function isRuntimeExecutable(status: SourceStatus): boolean {
    return status === 'CONNECTED' || status === 'VERIFIED';
}

/** True when the state asserts a real live request succeeded. */
export function isLiveProven(status: SourceStatus): boolean {
    return status === 'VERIFIED';
}

