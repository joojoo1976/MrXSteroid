/**
 * server/seo/sources/bingAdapter.ts — Bing Webmaster Tools API (NEW, STEP 5-6).
 *
 * =============================================================
 * DOC VERIFICATION (fetched and read before implementation)
 * =============================================================
 * (e) Current auth: two supported methods, per
 *     https://learn.microsoft.com/en-us/bingwebmaster/getting-access
 *     "Webmasters can access and use Bing Webmaster APIs through any of the
 *      following two methods: Using OAuth 2.0 [Recommended] / Using API Key"
 *     and the API-key path: "Click on Settings ... go to API Access ... click
 *      Generate API Key to create an API Key. Only one API key can be
 *      generated per user ... the API key is generated for a user and not a
 *      site".
 *     => this adapter uses the API-key path (a bearer access token is also
 *        accepted). It requires the site to be added AND VERIFIED in Bing
 *        Webmaster Tools; an unverified site has no stats endpoint access.
 *     Query-stats request/response fields (Query, DateFrom, DateTo, Page,
 *     PageSize, Country, Device -> Impressions, Clicks, AvgClickPosition,
 *     AvgImpressionPosition):
 *     https://learn.microsoft.com/en-us/bingwebmaster/reference/webmaster-api-2
 *
 * =============================================================
 * THE ONE RULE THAT MATTERS HERE
 * =============================================================
 * Bing numbers are a DIFFERENT SEARCH ENGINE. They are stored ONLY in
 * `bingImpressions` / `bingClicks` and never in `googleImpressions` /
 * `googleClicks` / `googleCtr` / `googlePosition`. `mapBingRow()` starts from
 * `emptyKeywordMetrics()` and writes exactly two fields, which is what makes
 * the separation structurally impossible to violate rather than a convention
 * someone has to remember. There is a unit test asserting all four Google
 * fields stay null on a Bing record.
 */

import {
    AdapterRunResult,
    BlockedReason,
    ProviderDescriptor,
    SearchIntelRecord,
    blockedResult,
    readEnv,
} from './searchIntelligenceTypes';
import { Market, SourceLanguage, emptyKeywordMetrics } from './types';

export const BING_DOC_URL =
    'https://learn.microsoft.com/en-us/bingwebmaster/getting-access';
export const BING_QUERY_STATS_DOC_URL =
    'https://learn.microsoft.com/en-us/bingwebmaster/reference/webmaster-api-2';

/** Base host for the Webmaster API v2. */
export const BING_API_BASE = 'https://ssl.bing.com/webmaster/api.svc/json';

export const BING_PROVIDER = {
    provider: 'bing_webmaster',
    sourceClass: 'FIRST_PARTY',
    languages: ['en', 'ar'],
    markets: ['ar-EG', 'en-US', 'en-GB'],
    requiredEnv: ['BING_WEBMASTER_SITE_URL', 'BING_WEBMASTER_API_KEY'],
    docUrl: BING_DOC_URL,
} as const satisfies ProviderDescriptor;

/** One entry of a `GetQueryStats` / `GetKeywordStats` response. */
export interface BingQueryStatRow {
    Query?: string;
    Impressions?: number;
    Clicks?: number;
    AvgClickPosition?: number;
    AvgImpressionPosition?: number;
    /** Present on some Bing responses; kept verbatim, never reinterpreted. */
    QueryUrl?: string;
}

/** Bing returns dates as YYYY-MM-DD; kept as a plain string. */
export interface BingQueryStatsRequest {
    siteUrl: string;
    apiKey: string;
    query?: string;
    dateFrom?: string;
    dateTo?: string;
    /** 1-based page cursor, per the reference. */
    page?: number;
    pageSize?: number;
    country?: string;
    device?: string;
}

export interface BingConfig {
    env?: Record<string, string | undefined>;
    fetchImpl?: typeof fetch;
    now?: () => Date;
}

export interface BingQuery {
    language: SourceLanguage;
    market: Market;
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    limit?: number;
    pageSize?: number;
    siteUrl?: string;
    apiKey?: string;
    signal?: AbortSignal;
}

/** Default page size. Bing's documented default is 10; we ask for more. */
export const BING_DEFAULT_PAGE_SIZE = 100;

/**
 * Bing country codes are ISO 3166-1 alpha-3, same family as GSC's.
 * An unmapped code returns null rather than defaulting to a market.
 */
const BING_MARKETS: Partial<Record<string, Market>> = {
    egy: 'ar-EG',
    usa: 'en-US',
    gbr: 'en-GB',
    sau: 'ar-SA',
    are: 'ar-AE',
};

export function bingCountryToMarket(country: string | undefined): Market | null {
    if (!country) return null;
    return BING_MARKETS[country.trim().toLowerCase()] ?? null;
}

/** Reverse lookup for the request filter. */
export function marketToBingCountry(market: Market): string | null {
    const entry = Object.entries(BING_MARKETS).find(([, m]) => m === market);
    return entry ? entry[0] : null;
}

/** Strictly parse a finite number, else null. Never coerces to 0. */
function finiteOrNull(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Validate a Bing response. The endpoint returns a bare JSON array of stats
 * objects, so a non-array (or an object carrying an `error`) is a failure.
 */
export function validateBingResponse(body: unknown): string | null {
    if (Array.isArray(body)) {
        for (const row of body) {
            if (row === null || typeof row !== 'object') {
                return 'Bing response contains a non-object entry';
            }
        }
        return null;
    }
    if (body && typeof body === 'object') {
        // Bing signals some failures with a 200 + error object.
        const err = (body as { error?: unknown }).error;
        if (err !== undefined) return `Bing returned an error object: ${String(err)}`;
        return 'Bing response is an object; a stats array was expected';
    }
    return 'Bing response is neither an array nor an object';
}


/** Resolve the exact missing dependency, or null when the adapter may run. */
export function resolveBingBlocked(
    query: BingQuery,
    env: Record<string, string | undefined>,
): BlockedReason | null {
    const siteUrl = query.siteUrl ?? readEnv(env, 'BING_WEBMASTER_SITE_URL');
    if (!siteUrl) {
        return {
            dependency: 'BING_WEBMASTER_SITE_URL',
            kind: 'site_property',
            detail:
                'no Bing Webmaster site is configured; the site must be added AND verified in Bing Webmaster Tools before any stats endpoint returns data',
        };
    }
    const apiKey = query.apiKey ?? readEnv(env, 'BING_WEBMASTER_API_KEY');
    if (!apiKey) {
        return {
            dependency: 'BING_WEBMASTER_API_KEY',
            kind: 'env_var',
            detail:
                'no Bing Webmaster API key is configured; generate one in Bing Webmaster Tools under Settings -> API Access (one key per user, valid across that user\'s verified sites)',
        };
    }
    return null;
}

/** Build the documented `GetQueryStats` request URL. */
export function buildBingQueryStatsUrl(request: BingQueryStatsRequest): string {
    const params = new URLSearchParams({
        siteUrl: request.siteUrl,
        apiKey: request.apiKey,
    });
    if (request.query) params.set('Query', request.query);
    if (request.dateFrom) params.set('DateFrom', request.dateFrom);
    if (request.dateTo) params.set('DateTo', request.dateTo);
    if (request.page !== undefined) params.set('Page', String(request.page));
    if (request.pageSize !== undefined) {
        params.set('PageSize', String(request.pageSize));
    }
    if (request.country) params.set('Country', request.country);
    if (request.device) params.set('Device', request.device);
    return `${BING_API_BASE}/GetQueryStats?${params.toString()}`;
}

/**
 * Map one Bing stats row to a record.
 *
 * ONLY `bingImpressions` and `bingClicks` are written. All four Google fields
 * and the Ads/Trends fields stay null by construction.
 */
export function mapBingRow(
    row: BingQueryStatRow,
    context: {
        language: SourceLanguage;
        requestedMarket: Market;
        siteUrl: string;
        metricsDate: string;
        retrievedAt: string;
    },
): SearchIntelRecord | null {
    const query = row.Query?.trim();
    if (!query) return null;

    return {
        keyword: query,
        language: context.language,
        // GetQueryStats is request-scoped, not row-scoped: there is no country
        // key on the row, so the caller's market is the honest label.
        market: context.requestedMarket,
        source: BING_PROVIDER.provider,
        sourceType: 'bing_webmaster',
        sourceClass: 'FIRST_PARTY',
        sourceStatus: 'CONNECTED',
        sourceReference: `bing:${context.siteUrl}:query/${query}`,
        discoveredAt: context.retrievedAt,
        // Observed, but observed on Bing — never relabelled as Google.
        dataKind: 'observed',
        evidence: `Bing Webmaster query stats query="${query}" to=${context.metricsDate}`,
        evidenceType: 'internal_search_observed',
        metricsDate: context.metricsDate,
        retrievedAt: context.retrievedAt,
        metrics: {
            ...emptyKeywordMetrics(),
            bingImpressions: finiteOrNull(row.Impressions),
            bingClicks: finiteOrNull(row.Clicks),
        },
        attribution: {
            // Bing positions are their own numbers; not Google average position.
            bingAvgClickPosition: finiteOrNull(row.AvgClickPosition),
            bingAvgImpressionPosition: finiteOrNull(row.AvgImpressionPosition),
            bingQueryUrl: row.QueryUrl ?? null,
            bingSiteUrl: context.siteUrl,
            // Explicit marker so a later merge cannot mistake this for Google.
            searchEngine: 'bing',
        },
    };
}

/**
 * Collect Bing Webmaster query stats, paging via the documented `Page` cursor.
 *
 * Resolves with a BLOCKED/FAILED envelope instead of throwing. Pages until a
 * short page proves the end or the caller's cap is reached.
 */
export async function collectBingQueryStats(
    query: BingQuery,
    config: BingConfig = {},
): Promise<AdapterRunResult<SearchIntelRecord>> {
    const env = config.env ?? process.env;
    const blocked = resolveBingBlocked(query, env);
    if (blocked) {
        return blockedResult<SearchIntelRecord>(BING_PROVIDER.provider, blocked);
    }

    const siteUrl = (query.siteUrl ??
        readEnv(env, 'BING_WEBMASTER_SITE_URL')) as string;
    const apiKey = (query.apiKey ??
        readEnv(env, 'BING_WEBMASTER_API_KEY')) as string;
    const now = config.now ? config.now() : new Date();
    const retrievedAt = now.toISOString();
    // The window we ASKED about is what the metrics describe, and it is not
    // the run date: Bing's own data has its own reporting delay.
    const metricsDate = query.endDate ?? retrievedAt.slice(0, 10);

    const fetchImpl = config.fetchImpl ?? globalThis.fetch;
    if (typeof fetchImpl !== 'function') {
        return {
            provider: BING_PROVIDER.provider,
            status: 'FAILED',
            dataKind: 'unavailable',
            records: [],
            error: 'no fetch implementation available in this runtime',
            partial: false,
        };
    }

    const pageSize = Math.max(1, query.pageSize ?? BING_DEFAULT_PAGE_SIZE);
    const limit = Math.max(0, query.limit ?? pageSize);
    const records: SearchIntelRecord[] = [];
    let page = 1;

    try {
        while (records.length < limit) {
            const size = Math.min(pageSize, limit - records.length);
            const url = buildBingQueryStatsUrl({
                siteUrl,
                apiKey,
                dateFrom: query.startDate,
                dateTo: query.endDate,
                country: marketToBingCountry(query.market) ?? undefined,
                page,
                pageSize: size,
            });
            const response = await fetchImpl(url, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                signal: query.signal,
            });
            if (!response.ok) {
                throw new Error(
                    `Bing GetQueryStats responded with HTTP ${response.status} ${response.statusText}`,
                );
            }
            const parsed: unknown = await response.json();
            const shapeError = validateBingResponse(parsed);
            if (shapeError) throw new Error(`invalid_response: ${shapeError}`);

            const rows = parsed as BingQueryStatRow[];
            for (const row of rows) {
                const record = mapBingRow(row, {
                    language: query.language,
                    requestedMarket: query.market,
                    siteUrl,
                    metricsDate,
                    retrievedAt,
                });
                if (record) records.push(record);
            }
            // A short page proves the end of the result set.
            if (rows.length < size) break;
            page += 1;
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            provider: BING_PROVIDER.provider,
            status: 'FAILED',
            dataKind: records.length > 0 ? 'observed' : 'unavailable',
            records,
            error: `bing_error: ${message}`,
            partial: records.length > 0,
        };
    }

    return {
        provider: BING_PROVIDER.provider,
        status: 'CONNECTED',
        dataKind: 'observed',
        records,
        partial: false,
    };
}
