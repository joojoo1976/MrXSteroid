/**
 * server/seo/sources/searchIntelligenceTypes.ts
 * STEP 5-6 (SEO data engineer) — shared contract for the four search-intelligence
 * adapters: GSC, Google Ads Keyword Planner, Bing Webmaster, Google Trends.
 *
 * MERGE POINT
 * -----------
 * `server/seo/sources/types.ts` (registry owner) is the canonical unified
 * contract. It does NOT currently have:
 *   1. a `BLOCKED` runtime state, and
 *   2. a place to record the *metrics date* a record's numbers describe.
 * Both are required by the four adapters below, so rather than edit another
 * owner's file concurrently, they are extended here:
 *   - `AdapterRuntimeStatus` = `SourceStatus | 'BLOCKED'`.
 *   - `SearchIntelRecord` = `NormalizedIntelligenceRecord` + `metricsDate`
 *     (the date the metrics describe) + `retrievedAt` (when we fetched them).
 *
 * MERGE NOTE: `metricsDate` must NOT be conflated with `discoveredAt`. GSC has a
 * real reporting lag (newest rows are still being processed), so the run date is
 * never allowed to stand in for the metrics date. When types.ts gains a
 * `metricsDate`/`BLOCKED` member, these two definitions should collapse into it
 * and this file should re-export, not fork.
 */

import {
    DataKind,
    EvidenceType,
    Market,
    NormalizedIntelligenceRecord,
    SourceClass,
    SourceLanguage,
    SourceStatus,
} from './types';

/**
 * Runtime status an adapter may report. `BLOCKED` is distinct from `FAILED`:
 * BLOCKED means "a specific dependency is missing" (an env var, a developer
 * token, a site property), FAILED means "we tried and the provider refused".
 * Only CONNECTED/VERIFIED may be asserted, and only ever after a real
 * successful live request.
 */
export type AdapterRuntimeStatus = SourceStatus | 'BLOCKED';

/** The exact, actionable reason a provider cannot run. Never vague. */
export interface BlockedReason {
    /** Which env var / credential / site property is missing. */
    dependency: string;
    /** Machine-readable category, for admin grouping. */
    kind:
        | 'env_var'
        | 'oauth_token'
        | 'site_property'
        | 'developer_token'
        | 'customer_id'
        | 'invalid_request'
        | 'no_public_api';
    /** Full human-readable sentence shown in the admin health view. */
    detail: string;
}


/**
 * One adapter record. `metricsDate` is the date the numbers actually describe;
 * `retrievedAt` is when we made the request. For GSC with a `date` dimension
 * these can differ by days because of Search Analytics reporting lag.
 */
export interface SearchIntelRecord extends NormalizedIntelligenceRecord {
    /** ISO date (YYYY-MM-DD) that the metrics describe. NOT the run date. */
    metricsDate: string;
    /** ISO timestamp of the request that produced this record. */
    retrievedAt: string;
    /** Provider-specific attribution, kept beside the record, never merged. */
    attribution: Record<string, string | number | boolean | null>;
}

/**
 * THE canonical name for Google Ads Keyword Planner historical numbers.
 *
 * These are Google Ads modelled historical search statistics. They are NOT
 * organic search volume, NOT Search Console impressions, and MUST NOT be
 * written into any field belonging to another provider.
 */
export const GOOGLE_ADS_HISTORICAL_SIGNAL =
    'google_ads_historical_search_signal';

/** The only evidence type a Google Ads historical-metrics record may carry. */
export const GOOGLE_ADS_EVIDENCE_TYPE: EvidenceType =
    'google_ads_url_seed_signal';

/**
 * Cache TTL for Google Ads Keyword Planning historical metrics.
 *
 * Google states: "It is recommended to cache or store results from Keyword
 * Planning as responses do not change frequently, though historical metrics
 * refresh monthly."
 *   https://developers.google.com/google-ads/api/docs/keyword-planning
 * So 30 days is the refresh cadence; we cache exactly one cycle.
 */
export const GOOGLE_ADS_HISTORICAL_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * GSC Search Analytics reporting lag, in whole days.
 *
 * Documented behaviour: recent rows may be incomplete. The API reports this
 * itself via `metadata.first_incomplete_date` when `dataState=all` and the
 * request groups by date. We use that field authoritatively and only fall back
 * to this conservative default when it is absent.
 *   https://developers.google.com/webmaster-tools/v1/searchanalytics/query
 */
export const GSC_DEFAULT_INCOMPLETE_LAG_DAYS = 2;

/** Per-adapter dependency declarations, surfaced for the admin health view. */
export type SearchIntelProvider =
    | 'google_search_console'
    | 'google_ads_keyword_planner'
    | 'bing_webmaster'
    | 'google_trends';

export interface ProviderDescriptor {
    provider: SearchIntelProvider;
    sourceClass: SourceClass;
    languages: readonly SourceLanguage[];
    markets: readonly Market[];
    /** Env vars / credentials that must all be present to leave BLOCKED. */
    requiredEnv: readonly string[];
    /**
     * Env vars that are accepted but NEVER gate the run.
     *
     * Added for Google Ads: `GOOGLE_ADS_DEVELOPER_TOKEN` belongs here, not in
     * `requiredEnv`, because Google sunset developer tokens on 2026-09-09 and
     * ignores the header. Listing it as required is what previously made the
     * readiness checklist ask an operator for a credential that grants nothing.
     */
    optionalEnv?: readonly string[];
    /** Official doc URL proving the adapter's request/response contract. */
    docUrl: string;
}

/** Shared result envelope for every adapter in this module. */
export interface AdapterRunResult<T> {
    provider: SearchIntelProvider;
    status: AdapterRuntimeStatus;
    dataKind: DataKind;
    records: T[];
    /** Present when BLOCKED or FAILED. Never fabricated. */
    error?: string;
    /** Machine-readable missing dependency, when BLOCKED. */
    blocked?: BlockedReason;
    /** True when some records survived a degraded run. */
    partial: boolean;
}

/** Build a BLOCKED envelope with the exact missing dependency named. */
export function blockedResult<T>(
    provider: SearchIntelProvider,
    blocked: BlockedReason,
): AdapterRunResult<T> {
    return {
        provider,
        status: 'BLOCKED',
        dataKind: 'unavailable',
        records: [],
        error: `BLOCKED: missing ${blocked.dependency} — ${blocked.detail}`,
        blocked,
        partial: false,
    };
}

/** Build a FAILED envelope. A provider error is a value, never a throw. */
export function failedResult<T>(
    provider: SearchIntelProvider,
    reason: string,
    partial = false,
): AdapterRunResult<T> {
    return {
        provider,
        status: 'FAILED',
        dataKind: 'unavailable',
        records: [],
        error: reason,
        partial,
    };
}

/** Read an env var as a trimmed non-empty string, or null. Never logs values. */
export function readEnv(
    env: NodeJS.ProcessEnv | Record<string, string | undefined>,
    name: string,
): string | null {
    const raw = env?.[name];
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
}
