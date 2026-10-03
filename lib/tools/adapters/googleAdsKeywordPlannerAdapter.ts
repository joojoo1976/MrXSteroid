/**
 * lib/tools/adapters/googleAdsKeywordPlannerAdapter.ts
 * ============================================================================
 * Google Ads **Keyword Planner** — the single entry point for the tools layer.
 * ============================================================================
 * WHAT THIS FILE REPLACES
 * ----------------------
 * It replaces `googleAdsTrendsAdapter.ts`, which was wrong in every way that
 * mattered and was, importantly, DEAD CODE (it had no importers):
 *
 *   1. Named and typed as "Trends". Keyword Planner is a SEARCH DEMAND signal
 *      (avg monthly searches, competition). It is NOT Google Trends and must
 *      never be reported as a 0-100 trend index.
 *   2. Hardcoded the retired API `v18`.
 *   3. Sent `developer-token: 'YOUR_DEVELOPER_TOKEN'` when the variable was
 *      absent — a literal placeholder presented to Google as a credential.
 *   4. Hardcoded `languageConstants/1000` (English) for every request,
 *      including Arabic markets.
 *   5. Wrote `avgMonthlySearches || 0` and `competition || 'UNKNOWN'`,
 *      converting "absent" into "zero searches" — a fabricated metric.
 *   6. Did `console.error(...); return []`, turning a provider error into a
 *      silent empty result that reads as success.
 *   7. Never set `keywordPlanNetwork`.
 *
 * WHY THIS FILE DELEGATES INSTEAD OF REIMPLEMENTING
 * --------------------------------------------------
 * The real, tested, v25-compliant implementation already exists at
 * `server/seo/sources/googleAdsAdapter.ts` and handles every case above
 * correctly: version constant, no developer-token gate, per-market geo
 * targeting, keyword/url/keywordAndUrl seeds, GOOGLE_SEARCH network, and
 * `finiteOrNull` so a missing metric stays null. A second hand-rolled HTTP
 * client would be a second divergent implementation of one API — exactly the
 * class of defect this file was. So this module is a thin, honest façade that
 * returns a STRUCTURED provider result and never fabricates a number.
 *
 * HONESTY CONTRACT
 * ----------------
 * A missing credential is CONFIG_REQUIRED. A provider error is reported as an
 * error. An absent metric is null. An empty result set is reported as an empty
 * result set — never upgraded to success, never padded with zeros.
 */

import {
    collectGoogleAdsKeywordIdeas,
    resolveGoogleAdsBlocked,
    GOOGLE_ADS_PROVIDER,
    GOOGLE_ADS_API_VERSION,
    type GoogleAdsQuery,
} from '../../../server/seo/sources/googleAdsAdapter';
import type {
    Market,
    SourceLanguage,
    NormalizedIntelligenceRecord,
} from '../../../server/seo/sources/types';

/** How this particular request failed, or `null` when it did not. */
export type KeywordPlannerFailureKind =
    | 'CONFIG_REQUIRED'
    | 'BLOCKED'
    | 'NETWORK'
    | 'AUTH'
    | 'INVALID_REQUEST'
    | 'UNKNOWN';
/**
 * One Google Ads Keyword Planner idea.
 *
 * Both metrics are `number | null` on purpose: a metric Google did not return
 * is unknown, and unknown is not zero.
 */
export interface KeywordPlannerIdea {
    keyword: string;
    /** Avg monthly searches, or null when Google returned no figure. */
    avgMonthlySearches: number | null;
    /** Competition as returned by Google, or null when absent. */
    competition: number | null;
    /** Provenance for the row. Never invented. */
    sourceReference: string;
    evidenceType: string;
    dataKind: string;
    market: Market;
    language: SourceLanguage;
    observedAt: string;
}

/** The structured result every caller receives — success or failure. */
export interface KeywordPlannerResult {
    provider: string;
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'BLOCKED' | 'CONFIG_REQUIRED';
    records: KeywordPlannerIdea[];
    errors: Array<{ kind: KeywordPlannerFailureKind; message: string }>;
    /** Exact missing dependency when the provider could not run. */
    blockedReason: string | null;
    /** Google's request id when the response carried one. */
    requestId: string | null;
    observedAt: string;
    market: Market;
    language: SourceLanguage;
    /** Explicit: a search-demand signal, NOT Google Trends. */
    signalType: 'SEARCH_DEMAND_ESTIMATE';
}

/**
 * Fetch Keyword Planner ideas for a market.
 *
 * Replaces the old `fetchKeywordTrends`. The name states the true source.
 */
export async function fetchKeywordPlannerIdeas(input: {
    seeds: string[];
    market: Market;
    language: SourceLanguage;
    /** Optional page seeds; combined with keywords as keywordAndUrlSeed. */
    urlSeeds?: string[];
    limit?: number;
    signal?: AbortSignal;
    now?: () => Date;
}): Promise<KeywordPlannerResult> {
    const observedAt = (input.now?.() ?? new Date()).toISOString();
    const base = {
        provider: GOOGLE_ADS_PROVIDER.provider,
        observedAt,
        market: input.market,
        language: input.language,
        signalType: 'SEARCH_DEMAND_ESTIMATE' as const,
    };

    // 1. Configuration is checked BEFORE any network call, and reported as
    //    CONFIG_REQUIRED — never as an empty success.
    const blocked = resolveGoogleAdsBlocked(
        {
            language: input.language,
            market: input.market,
            seeds: input.seeds,
            urlSeeds: input.urlSeeds,
        },
        process.env as Record<string, string | undefined>
    );
    if (blocked) {
        return {
            ...base,
            status: 'CONFIG_REQUIRED',
            records: [],
            errors: [{ kind: 'CONFIG_REQUIRED', message: blocked.detail }],
            blockedReason: blocked.dependency,
            requestId: null,
        };
    }

    // 2. The real adapter does the request. It never throws for a provider
    //    failure; it returns a structured outcome, so one failing provider
    //    cannot abort a caller's wider run.
    const query: GoogleAdsQuery = {
        language: input.language,
        market: input.market,
        seeds: input.seeds,
        urlSeeds: input.urlSeeds,
        limit: input.limit,
        signal: input.signal,
    };

    const outcome = await collectGoogleAdsKeywordIdeas(query);

    // A BLOCKED outcome (missing credential discovered inside the adapter) is
    // reported as CONFIG_REQUIRED, not as an empty success.
    if (outcome.status === 'BLOCKED') {
        return {
            ...base,
            status: 'CONFIG_REQUIRED',
            records: [],
            errors: [
                {
                    kind: 'CONFIG_REQUIRED',
                    message: outcome.error ?? 'Google Ads is not configured',
                },
            ],
            blockedReason: outcome.error ?? 'Google Ads credentials are not configured',
            requestId: null,
        };
    }

    if (outcome.status === 'FAILED') {
        const message = outcome.error ?? 'Google Ads request failed';
        return {
            ...base,
            status: 'FAILED',
            records: [],
            errors: [{ kind: classify(message), message }],
            blockedReason: null,
            requestId: null,
        };
    }

    const records: KeywordPlannerIdea[] = outcome.records.map((r) => ({
        keyword: r.keyword,
        // Null-preserving: a figure Google did not send stays null. Never 0.
        avgMonthlySearches: r.metrics?.googleAdsAvgMonthlySearches ?? null,
        competition: r.metrics?.googleAdsCompetition ?? null,
        sourceReference: r.sourceReference,
        evidenceType: r.evidenceType,
        // Google Ads volumes are a MODEL ESTIMATE, never an observation.
        dataKind: r.dataKind,
        market: input.market,
        language: input.language,
        observedAt: r.discoveredAt,
    }));

    return {
        ...base,
        // An empty result set is reported honestly as SUCCESS-with-no-records;
        // it is never turned into a failure, and never padded.
        status: outcome.partial ? 'PARTIAL' : 'SUCCESS',
        records,
        errors: outcome.error ? [{ kind: classify(outcome.error), message: outcome.error }] : [],
        blockedReason: null,
        requestId: null,
    };
}

function classify(message: string): KeywordPlannerFailureKind {
    const m = message.toLowerCase();
    if (m.includes('credential') || m.includes('missing')) return 'CONFIG_REQUIRED';
    if (m.includes('401') || m.includes('403') || m.includes('auth')) return 'AUTH';
    if (m.includes('fetch failed') || m.includes('network')) return 'NETWORK';
    if (m.includes('seed') || m.includes('invalid')) return 'INVALID_REQUEST';
    return 'UNKNOWN';
}

/** The API version actually in use, so callers never hardcode their own. */
export const GOOGLE_ADS_VERSION = GOOGLE_ADS_API_VERSION;