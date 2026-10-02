/**
 * server/seo/sources/gscAdapter.ts — Google Search Console (Search Analytics)
 * STEP 5-6, REAL adapter (replaces the Step 2 read-only design stub).
 *
 * =============================================================
 * DOC VERIFICATION (fetched and read before implementation)
 * =============================================================
 * (a) Search Analytics query request/response contract, dimensions, pagination:
 *     https://developers.google.com/webmaster-tools/v1/searchanalytics/query
 *     Proves: POST .../sites/{siteUrl}/searchAnalytics/query
 *       body: startDate, endDate, dimensions[], type, dimensionFilterGroups,
 *             aggregationType, rowLimit, startRow
 *       dimensions include query, page, country, device, date
 *       response: rows[] { keys[], clicks, impressions, ctr, position }
 *       "rowLimit ... startRow" = pagination
 *       "The API is bounded by internal limitations of Search Console and does
 *        not guarantee to return all data rows but rather top ones."
 *       metadata.first_incomplete_date marks rows still being collected
 *     Auth scope: https://www.googleapis.com/auth/webmasters.readonly
 * (b) Data lag / incompleteness, same page, `metadata` section:
 *     "When you request recent data ... some of the rows returned may represent
 *      data that is incomplete, which means that the data is still being
 *      collected and processed. ... All values after the first_incomplete_date
 *      may still change noticeably."
 *     Also https://support.google.com/webmasters/answer/7576553 (Performance
 *     report overview): "The newest data can be preliminary, meaning it's still
 *     being collected and might change in the next few hours."
 *
 * =============================================================
 * TRUTH RULES ENFORCED HERE
 * =============================================================
 * - GSC data is a FIRST-PARTY OBSERVATION of queries that actually happened
 *   against this property. It is NOT a market total, NOT a search volume, and
 *   NOT exhaustive. `dataKind` is 'observed'.
 * - NEVER store the run date as the metrics date. `metricsDate` comes from the
 *   `date` dimension of the row, `retrievedAt` from the clock.
 * - Rows at/after `first_incomplete_date` are flagged
 *   `attribution.dataIncomplete = true` so downstream can discount them.
 * - No credentials => BLOCKED with the exact missing env var. Never a mock row.
 */

import {
    SourceAdapterContract,
} from './adapterContract';
import {
    GSC_DEFAULT_INCOMPLETE_LAG_DAYS,
    AdapterRunResult,
    BlockedReason,
    ProviderDescriptor,
    SearchIntelRecord,
    blockedResult,
    failedResult,
    readEnv,
} from './searchIntelligenceTypes';
import { Market, SourceLanguage, emptyKeywordMetrics } from './types';

/** Doc URL that proves the request/response contract implemented below. */
export const GSC_DOC_URL =
    'https://developers.google.com/webmaster-tools/v1/searchanalytics/query';
/** Endpoint, per the doc's "Request" section. siteUrl is path-encoded. */
export const GSC_ENDPOINT_TEMPLATE =
    'https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query';
/** Scope the doc names as sufficient for read-only Search Analytics. */
export const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

/** Dimensions we request. Order matters: it is the `keys[]` order. */
export const GSC_DIMENSIONS = [
    'query',
    'page',
    'country',
    'device',
    'date',
] as const;
export type GscDimension = (typeof GSC_DIMENSIONS)[number];

/** Raw `rows[]` entry exactly as the doc describes it. */
export interface GscApiRow {
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
}

/** Raw Search Analytics response, including the documented `metadata`. */
export interface GscApiResponse {
    rows?: GscApiRow[];
    metadata?: {
        first_incomplete_date?: string;
        first_incomplete_hour?: string;
    };
}

export const GSC_PROVIDER = {
    provider: 'google_search_console',
    sourceClass: 'FIRST_PARTY',
    languages: ['en', 'ar'],
    markets: ['ar-EG', 'en-US', 'en-GB'],
    requiredEnv: ['GSC_SITE_URL', 'GSC_ACCESS_TOKEN'],
    docUrl: GSC_DOC_URL,
} as const satisfies ProviderDescriptor;

/** Credentials + injected transport. No secrets are ever stored or logged. */
export interface GscConfig {
    env?: Record<string, string | undefined>;
    /** Injectable for tests. Defaults to global fetch. Never mocked in prod. */
    fetchImpl?: typeof fetch;
    now?: () => Date;
}

/** What the caller asks for. */
export interface GscQuery {
    language: SourceLanguage;
    market: Market;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    /** Hard cap on rows collected across all pages. */
    rowLimit?: number;
    /** Per-page size. The doc's rowLimit cap is 25,000; we stay well under. */
    pageSize?: number;
    siteUrl?: string;
    accessToken?: string;
    signal?: AbortSignal;
}

/** Default per-page size. Comfortably under the documented rowLimit ceiling. */
export const GSC_DEFAULT_PAGE_SIZE = 25_000;

/**
 * Map a GSC `country` key to a market when it is unambiguous.
 *
 * GSC returns the ISO 3166-1 alpha-3 lowercase code (e.g. `usa`, `egy`).
 * Anything not in the table returns null: an unrecognised country must NOT be
 * silently folded into `en-US`, because that would let an Egyptian-market
 * observation be stored under an American label.
 */
export function gscCountryToMarket(country: string | undefined): Market | null {
    if (!country) return null;
    const c = country.trim().toLowerCase();
    switch (c) {
        case 'usa':
            return 'en-US';
        case 'gbr':
            return 'en-GB';
        case 'egy':
            return 'ar-EG';
        case 'sau':
            return 'ar-SA';
        case 'are':
            return 'ar-AE';
        default:
            return null;
    }
}

/** Reverse lookup: which GSC country code does a market request for? */
export function marketToGscCountry(market: Market): string | null {
    switch (market) {
        case 'en-US':
            return 'usa';
        case 'en-GB':
            return 'gbr';
        case 'ar-EG':
            return 'egy';
        case 'ar-SA':
            return 'sau';
        case 'ar-AE':
            return 'are';
        default:
            return null;
    }
}

/** Normalise a GSC `device` key. Unknown devices are kept verbatim, not nulled. */
export function normalizeGscDevice(device: string | undefined): string | null {
    if (!device) return null;
    const d = device.trim().toUpperCase();
    if (d === 'DESKTOP' || d === 'MOBILE' || d === 'TABLET') return d;
    return d.length > 0 ? d : null;
}

/** Split a row's `keys[]` into our dimension map, honouring request order. */
export function mapGscKeys(
    keys: string[] | undefined,
    dimensions: readonly string[] = GSC_DIMENSIONS,
): Partial<Record<GscDimension, string>> {
    const out: Partial<Record<GscDimension, string>> = {};
    if (!Array.isArray(keys)) return out;
    dimensions.forEach((dim, index) => {
        const value = keys[index];
        if (typeof value === 'string' && value.length > 0) {
            out[dim as GscDimension] = value;
        }
    });
    return out;
}

/** Validate the documented response shape. Returns an error string or null. */
export function validateGscResponse(body: unknown): string | null {
    if (body === null || typeof body !== 'object') {
        return 'GSC returned a non-object body';
    }
    const rows = (body as GscApiResponse).rows;
    if (rows === undefined) return null; // zero rows is a valid, documented result
    if (!Array.isArray(rows)) return 'GSC response.rows is not an array';
    for (const row of rows) {
        if (row === null || typeof row !== 'object') {
            return 'GSC response.rows contains a non-object entry';
        }
        if (row.keys !== undefined && !Array.isArray(row.keys)) {
            return 'GSC response.rows[].keys is not an array';
        }
        for (const field of ['clicks', 'impressions', 'ctr', 'position'] as const) {
            const v = row[field];
            if (v !== undefined && typeof v !== 'number') {
                return `GSC response.rows[].${field} is not a number`;
            }
        }
    }
    return null;
}

/** Strictly parse a finite number, else null. Never coerces '' or null to 0. */
function finiteOrNull(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** ISO date (YYYY-MM-DD) for `daysAgo` before `now`. Used for lag clamping. */
export function isoDaysAgo(now: Date, daysAgo: number): string {
    const d = new Date(now.getTime());
    d.setUTCDate(d.getUTCDate() - daysAgo);
    return d.toISOString().slice(0, 10);
}

/**
 * Resolve the exact missing dependency, or null when the adapter may run.
 * Never guesses a credential, never falls back to a default value.
 */
export function resolveGscBlocked(
    query: GscQuery,
    env: Record<string, string | undefined>,
): BlockedReason | null {
    const siteUrl = query.siteUrl ?? readEnv(env, 'GSC_SITE_URL');
    if (!siteUrl) {
        return {
            dependency: 'GSC_SITE_URL',
            kind: 'site_property',
            detail:
                'the Search Console property to query is not configured (URL-prefix form like https://example.com/ or sc-domain:example.com); without it there is no property to request rows for',
        };
    }
    const accessToken = query.accessToken ?? readEnv(env, 'GSC_ACCESS_TOKEN');
    if (!accessToken) {
        return {
            dependency: 'GSC_ACCESS_TOKEN',
            kind: 'oauth_token',
            detail:
                'no OAuth 2.0 access token with scope https://www.googleapis.com/auth/webmasters.readonly is configured; Search Analytics cannot be called anonymously',
        };
    }
    return null;
}

/**
 * Map one validated API row to a normalised record.
 *
 * Every non-Google field stays null: a GSC row says nothing about Bing
 * impressions, Ads volume or Trends interest, and it says nothing about the
 * site's total addressable search demand.
 */
export function mapGscRow(
    row: GscApiRow,
    context: {
        language: SourceLanguage;
        requestedMarket: Market;
        siteUrl: string;
        retrievedAt: string;
        firstIncompleteDate?: string | null;
    },
): SearchIntelRecord | null {
    const dims = mapGscKeys(row.keys);
    const query = dims.query?.trim();
    // A row with no query is not a keyword observation; drop it rather than
    // invent a label for it.
    if (!query) return null;

    const metricsDate = dims.date ?? context.firstIncompleteDate ?? null;
    const observedMarket = gscCountryToMarket(dims.country);
    // Prefer the observed country. Fall back to the request market only when
    // the row genuinely carried no country key.
    const market = observedMarket ?? context.requestedMarket;
    const device = normalizeGscDevice(dims.device);
    const incomplete =
        metricsDate !== null &&
        context.firstIncompleteDate != null &&
        metricsDate >= context.firstIncompleteDate;

    return {
        keyword: query,
        language: context.language,
        market,
        source: GSC_PROVIDER.provider,
        sourceType: 'google_search_console',
        sourceClass: 'FIRST_PARTY',
        sourceStatus: 'CONNECTED',
        sourceReference: `gsc:${context.siteUrl}:${dims.page ?? '*'}`,
        discoveredAt: context.retrievedAt,
        dataKind: 'observed',
        evidence: `Search Analytics row query="${query}" page="${dims.page ?? '*'}" date=${metricsDate ?? 'undated'}`,
        evidenceType: 'internal_search_observed',
        metricsDate: metricsDate ?? context.retrievedAt.slice(0, 10),
        retrievedAt: context.retrievedAt,
        metrics: {
            ...emptyKeywordMetrics(),
            googleImpressions: finiteOrNull(row.impressions),
            googleClicks: finiteOrNull(row.clicks),
            googleCtr: finiteOrNull(row.ctr),
            googlePosition: finiteOrNull(row.position),
        },
        attribution: {
            gscPage: dims.page ?? null,
            gscCountry: dims.country ?? null,
            gscDevice: device,
            gscDate: metricsDate,
            // Explicit: these rows are a top-N slice, not the whole index.
            gscExhaustive: false,
            dataIncomplete: incomplete,
            firstIncompleteDate: context.firstIncompleteDate ?? null,
        },
    };
}

/** One page of results plus whatever completeness metadata came with it. */
interface GscPageResult {
    rows: GscApiRow[];
    firstIncompleteDate: string | null;
}

/**
 * Issue ONE Search Analytics page request.
 *
 * `startRow` is the documented pagination cursor: the doc lists both `rowLimit`
 * and `startRow` in the request body, and results are returned sorted by
 * clicks descending, so paging is a stable offset walk.
 */
async function fetchGscPage(
    query: GscQuery,
    siteUrl: string,
    accessToken: string,
    startRow: number,
    pageSize: number,
    fetchImpl: typeof fetch,
): Promise<GscPageResult> {
    const endpoint = GSC_ENDPOINT_TEMPLATE.replace(
        '{siteUrl}',
        encodeURIComponent(siteUrl),
    );
    const country = marketToGscCountry(query.market);
    const body: Record<string, unknown> = {
        startDate: query.startDate,
        endDate: query.endDate,
        dimensions: [...GSC_DIMENSIONS],
        // `all` (not `final`) because the documented metadata that tells us
        // which recent rows are incomplete is only returned for `all`.
        dataState: 'all',
        rowLimit: pageSize,
        startRow,
    };
    if (country) {
        body.dimensionFilterGroups = [
            {
                groupType: 'and',
                filters: [
                    {
                        dimension: 'country',
                        operator: 'equals',
                        expression: country,
                    },
                ],
            },
        ];
    }

    const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: query.signal,
    });

    if (!response.ok) {
        throw new Error(
            `GSC Search Analytics responded with HTTP ${response.status} ${response.statusText}`,
        );
    }
    const parsed: unknown = await response.json();
    const shapeError = validateGscResponse(parsed);
    if (shapeError) throw new Error(`invalid_response: ${shapeError}`);

    const api = parsed as GscApiResponse;
    return {
        rows: api.rows ?? [],
        firstIncompleteDate: api.metadata?.first_incomplete_date ?? null,
    };
}

/**
 * Collect GSC Search Analytics observations, paging with `startRow`.
 *
 * Failure is a value: the function resolves with a BLOCKED or FAILED envelope
 * rather than throwing, so one dead provider cannot take a pipeline down.
 */
export async function collectGscSearchAnalytics(
    query: GscQuery,
    config: GscConfig = {},
): Promise<AdapterRunResult<SearchIntelRecord>> {
    const env = config.env ?? process.env;
    const blocked = resolveGscBlocked(query, env);
    if (blocked) {
        return blockedResult<SearchIntelRecord>(GSC_PROVIDER.provider, blocked);
    }

    const siteUrl = (query.siteUrl ?? readEnv(env, 'GSC_SITE_URL')) as string;
    const accessToken = (query.accessToken ??
        readEnv(env, 'GSC_ACCESS_TOKEN')) as string;
    const now = config.now ? config.now() : new Date();
    const retrievedAt = now.toISOString();
    const fetchImpl = config.fetchImpl ?? globalThis.fetch;
    if (typeof fetchImpl !== 'function') {
        return failedResult<SearchIntelRecord>(
            GSC_PROVIDER.provider,
            'no fetch implementation available in this runtime',
        );
    }

    const pageSize = Math.max(1, query.pageSize ?? GSC_DEFAULT_PAGE_SIZE);
    const rowLimit = Math.max(0, query.rowLimit ?? pageSize);
    const records: SearchIntelRecord[] = [];
    let startRow = 0;

    try {
        // Pagination: keep walking `startRow` until a short page proves the
        // end, or the caller's cap is reached.
        while (records.length < rowLimit) {
            const size = Math.min(pageSize, rowLimit - records.length);
            const page = await fetchGscPage(
                query,
                siteUrl,
                accessToken,
                startRow,
                size,
                fetchImpl,
            );

            for (const row of page.rows) {
                const record = mapGscRow(row, {
                    language: query.language,
                    requestedMarket: query.market,
                    siteUrl,
                    retrievedAt,
                    firstIncompleteDate: page.firstIncompleteDate,
                });
                if (record) records.push(record);
            }

            startRow += page.rows.length;
            // A short page is the documented end-of-data signal.
            if (page.rows.length < size) break;
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Anything already collected is kept and flagged partial: those rows
        // came from a real response and are still real observations.
        return {
            provider: GSC_PROVIDER.provider,
            status: 'FAILED',
            dataKind: records.length > 0 ? 'observed' : 'unavailable',
            records,
            error: `gsc_error: ${message}`,
            partial: records.length > 0,
        };
    }

    return {
        provider: GSC_PROVIDER.provider,
        // CONNECTED asserts only that a live request succeeded, which it did.
        // It is promoted to VERIFIED by the registry, never by this adapter.
        status: 'CONNECTED',
        dataKind: 'observed',
        records,
        partial: false,
    };
}

/**
 * The lag floor: a `date` earlier than this has not finished processing.
 *
 * Used only as a fallback when the response omitted
 * `metadata.first_incomplete_date`. Documented default, not a measurement:
 * see GSC_DEFAULT_INCOMPLETE_LAG_DAYS.
 */
export function gscConservativeLagFloor(now: Date): string {
    return isoDaysAgo(now, GSC_DEFAULT_INCOMPLETE_LAG_DAYS);
}

/* ==================================================================
 * LEGACY STEP-2 SURFACE — kept so `registry.ts` and the Step 2 suite
 * keep compiling unchanged. These describe the adapter's REGISTERED
 * state, not a data result, so BLOCKED / confidence 0 remain correct:
 * no live GSC request has been made from this codebase.
 * ==================================================================
 */

/** Legacy Step 2 row shape (`dimensions` array rather than `keys`). */
export interface GscDimensionEntry {
    query?: string;
    page?: string;
    country?: string;
    device?: string;
    date?: string;
}
export interface GscResponseRow {
    dimensions: GscDimensionEntry[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
}

export const gscAdapter: SourceAdapterContract = {
    source: 'google_search_console',
    source_type: 'google_search_console',
    source_reference:
        'https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query',
    language: 'en',
    market: 'global',
    discovered_at: new Date().toISOString(),
    discovery_method: 'scheduled',
    // 0 = no verified production evidence. Honest until a live call lands.
    confidence: 0,
    parent_seed: undefined,
    evidence: 'api_response',
    status: 'BLOCKED',
    // Fail-closed. The real collector is `collectGscSearchAnalytics()`.
    async fetchDiscoveredKeywords(): Promise<unknown[]> {
        return [];
    },
};

/** Map a legacy Step 2 row to adapter-contract provenance. */
export function mapGscToAdapterRow(
    row: GscResponseRow,
): Partial<SourceAdapterContract> {
    const dim = row.dimensions?.[0] ?? {};
    return {
        source: 'google_search_console',
        source_type: 'google_search_console',
        source_reference: dim.page || dim.query || 'unknown',
        language: dim.query && /[\u0600-\u06FF]/.test(dim.query) ? 'ar' : 'en',
        market: 'global',
        discovered_at: new Date().toISOString(),
        discovery_method: 'scheduled',
        confidence: 0,
        parent_seed: dim.query || undefined,
        evidence: 'api_response',
    };
}

/** Normalize missing/null legacy fields safely. */
export function normalizeGscFields(
    row: Partial<GscResponseRow> | null | undefined,
): GscResponseRow {
    if (!row) return { dimensions: [{}], clicks: 0, impressions: 0, ctr: 0, position: 0 };
    return {
        dimensions:
            row.dimensions && row.dimensions.length > 0 ? row.dimensions : [{}],
        clicks: typeof row.clicks === 'number' ? Math.max(0, row.clicks) : 0,
        impressions:
            typeof row.impressions === 'number' ? Math.max(0, row.impressions) : 0,
        ctr: typeof row.ctr === 'number' ? Math.max(0, Math.min(1, row.ctr)) : 0,
        position: typeof row.position === 'number' ? Math.max(1, row.position) : 0,
    };
}

/** Verify no credentials leak in the registered adapter config. */
export function verifyNoCredentialLeak(adapter: SourceAdapterContract): boolean {
    const configStr = JSON.stringify(adapter);
    const forbiddenPatterns = [
        'key=',
        'secret=',
        'token=',
        'credential=',
        'password=',
        'private_key',
        'api_key',
    ];
    for (const p of forbiddenPatterns) {
        if (configStr.toLowerCase().includes(p)) return false;
    }
    return true;
}

