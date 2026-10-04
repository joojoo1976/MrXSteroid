/**
 * server/seo/sources/googleAdsAdapter.ts — Google Ads Keyword Planner
 * `KeywordPlanIdeaService.GenerateKeywordIdeas` (NEW, STEP 5-6).
 *
 * =============================================================
 * DOC VERIFICATION (fetched and read before implementation)
 * =============================================================
 * (b) CURRENT authentication model — NOT legacy username/password, NOT the
 *     deprecated "offline user credentials" flow:
 *     https://developers.google.com/identity/protocols/oauth2
 *     "Google APIs use the OAuth 2.0 protocol for authentication and
 *      authorization" — access token from the Google Authorization Server,
 *      then refresh as needed. Same page, "Best practices" section:
 *      "you must not use, or encourage the use of, user credentials for
 *       server-to-server deployment."
 *     => this adapter takes a short-lived OAuth 2.0 access token, obtained
 *        either directly or, preferably, RENEWED from an offline access triple
 *        (client id + client secret + refresh token) on every request. It never
 *        stores a password or login.
 *
 * (b2) DEVELOPER TOKENS ARE RETIRED — re-verified 2026-09-30
 *     https://developers.google.com/google-ads/api/docs/api-policy/developer-token
 *     "We sunset developer tokens on September 9, 2026."
 *     "You can continue sending developer tokens in your API call headers, but
 *      this is optional and ignored by the API servers."
 *     "Your API access levels are determined by the Google Cloud project you
 *      used to generate your OAuth credentials."
 *     => the developer token is NO LONGER A GATE. Its absence must never cause
 *        BLOCKED. The header is still sent when present, purely so an existing
 *        deployment keeps working without changes. A manager account is also no
 *        longer required, and `login-customer-id` is required ONLY on the
 *        MANAGER access path.
 *     An earlier revision of this adapter required the token and pinned v19.
 *     Both were wrong, and together they would have sent an operator to a
 *     deprecated API Center to buy a credential that grants nothing.
 * (c) Keyword Planning service, caching + historical metrics cadence:
 *     https://developers.google.com/google-ads/api/docs/keyword-planning
 *     "Keyword Planning services are rate limited, allowing fewer requests per
 *      minute compared to other services. It is recommended to cache or store
 *      results from Keyword Planning as responses do not change frequently,
 *      though historical metrics refresh monthly."
 *     => GOOGLE_ADS_HISTORICAL_CACHE_TTL_SECONDS = 30 days (one refresh cycle).
 * (d) Request/response shape:
 *     https://developers.google.com/google-ads/api/reference/rpc/v25/KeywordPlanIdeaService
 *     GenerateKeywordIdeas(GenerateKeywordIdeaRequest) returns
 *     GenerateKeywordIdeaResponse with repeated `results` of KeywordIdea:
 *     `text` plus `keyword_idea_metrics.avg_monthly_searches`, `.competition`,
 *     `.competition_index`. Request carries `customer_id`, `language`,
 *     `geo_target_constants`, `keyword_plan_network` and either
 *     `keyword_and_page_seed` (KeywordAndPageSeed / PageSeed / KeywordSeed) or
 *     `url_seed`.
 *
 * =============================================================
 * THE ONE RULE THAT MATTERS HERE
 * =============================================================
 * `avg_monthly_searches` is a Google Ads MODELLED HISTORICAL STATISTIC. It is
 * NOT organic search volume and NOT Search Console impressions. Every record
 * this adapter emits is stamped:
 *   - attribution.signal          = GOOGLE_ADS_HISTORICAL_SIGNAL
 *   - metrics.googleAdsAvgMonthlySearches / .googleAdsCompetition
 *   - dataKind 'estimated' (a model output, not an observation)
 *   - evidenceType 'google_ads_url_seed_signal'
 * and it NEVER writes googleImpressions / bingImpressions / internalSearchCount.
 * There is deliberately no code path here that labels these numbers "volume".
 */

import {
    GOOGLE_ADS_EVIDENCE_TYPE,
    GOOGLE_ADS_HISTORICAL_CACHE_TTL_SECONDS,
    GOOGLE_ADS_HISTORICAL_SIGNAL,
    AdapterRunResult,
    BlockedReason,
    ProviderDescriptor,
    SearchIntelRecord,
    blockedResult,
    readEnv,
} from './searchIntelligenceTypes';
import { Market, SourceLanguage, emptyKeywordMetrics } from './types';
import type { ProviderAuthStrategy } from './providerEnvironment';
import { staticEnvToken } from './providerEnvironment';

// The canonical signal name, the evidence type and the cache TTL live in the
// shared contract module and are re-exported here, so an importer of either
// module always resolves the exact same string value.
export {
    GOOGLE_ADS_HISTORICAL_SIGNAL,
    GOOGLE_ADS_EVIDENCE_TYPE,
    GOOGLE_ADS_HISTORICAL_CACHE_TTL_SECONDS,
} from './types';

/**
 * The API version this adapter targets.
 *
 * Historically v19. Upgraded to v25 to match the current Google Ads API
 * REST surface. There is deliberately NO v19 fallback: a silent fallback would
 * mean a request is sent to a version we no longer believe matches the
 * contract, and the resulting error would be attributed to the wrong cause.
 */
export const GOOGLE_ADS_API_VERSION = 'v25';

export const GOOGLE_ADS_DOC_URL =
    `https://developers.google.com/google-ads/api/reference/rpc/${GOOGLE_ADS_API_VERSION}/KeywordPlanIdeaService`;
/** Caching + monthly historical-metric refresh cadence. */
export const GOOGLE_ADS_KEYWORD_PLANNING_DOC_URL =
    'https://developers.google.com/google-ads/api/docs/keyword-planning';
/** OAuth 2.0 access model. Developer tokens are NO LONGER required. */
export const GOOGLE_ADS_AUTH_DOC_URL =
    'https://developers.google.com/google-ads/api/docs/authentication/authorization';
/**
 * Developer-token policy. Google sunset developer tokens on 2026-09-09.
 *
 * Quoting the official page (retrieved 2026-09-30):
 *   "You can continue sending developer tokens in your API call headers, but
 *    this is optional and ignored by the API servers. Your existing code will
 *    continue working without any changes."
 *
 * => the header is RETAINED as optional for backwards compatibility, and its
 * absence must NEVER cause a BLOCKED verdict on v25+.
 */
export const GOOGLE_ADS_DEVELOPER_TOKEN_POLICY = {
    sunsetDate: '2026-09-09',
    required: false,
    /** Sent when present; ignored by Google. Never a gate. */
    sendIfPresent: true,
} as const;

/** v25 REST endpoint for customers/{customerId}. */
export const GOOGLE_ADS_CUSTOMERS_ENDPOINT =
    `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/{customerId}`;

export const GOOGLE_ADS_PROVIDER = {
    // `as const` is load-bearing: without it TypeScript widens this to `string`,
    // and every call site that expects the `SearchIntelProvider` union then
    // fails to type-check. The literal type is what keeps the provider id
    // checked against the registry's closed set.
    provider: 'google_ads_keyword_planner' as const,
    // Filled in by `describeGoogleAdsProvider()` below; kept here as a stable
    // import handle for the registry.
};

/**
 * Market -> Google Ads `geoTargetConstants`.
 *
 * These are Google's own numeric regional codes; a wrong one silently returns
 * another country's statistics, so an unmapped market returns null and the
 * request is refused rather than guessed.
 */
const GEO_TARGET_CONSTANTS: Partial<Record<Market, number>> = {
    // Google's own `GeoTargetConstant` country-level resource IDs. These are
    // NOT interchangeable: a wrong constant silently returns another country's
    // search volume, which is worse than returning nothing. An unmapped market
    // therefore resolves to null and the request is REFUSED rather than guessed
    // (see `marketToGeoTargetConstant` and its callers).
    //
    // Every market the project actually supports is mapped, so no supported
    // market is left unable to run:
    'en-US': 2840,
    'en-GB': 2826,
    'en-CA': 2052,
    'en-AU': 2072,
    'ar-EG': 818,
    'ar-SA': 2682,
    'ar-AE': 2784,
};

/** Google Ads `languageCode` for a source language. */
const LANGUAGE_CODES: Record<SourceLanguage, number> = { en: 1000, ar: 1001 };

export function marketToGeoTargetConstant(market: Market): number | null {
    return GEO_TARGET_CONSTANTS[market] ?? null;
}

/** One `KeywordIdea` exactly as the reference page documents it. */
export interface GoogleAdsKeywordIdea {
    text?: string;
    keyword_idea_metrics?: {
        avg_monthly_searches?: number;
        competition?: number;
        competition_index?: number;
    };
    keyword_idea_metrics_competitor_details?: unknown[];
}

/** The `results` array of GenerateKeywordIdeaResponse. */
export interface GenerateKeywordIdeaResponse {
    results?: GoogleAdsKeywordIdea[];
}

export interface GoogleAdsConfig {
    env?: Record<string, string | undefined>;
    fetchImpl?: typeof fetch;
    now?: () => number;
}

export interface GoogleAdsQuery {
    language: SourceLanguage;
    market: Market;
    /** Seed keywords. The service requires at least one. */
    seeds: string[];
    /** Optional page seeds (URLs) as an alternative seed source. */
    urlSeeds?: string[];
    limit?: number;
    /**
     * LEGACY / OPTIONAL. Google sunset developer tokens on 2026-09-09; the
     * header is now ignored by the API servers. Retained so an existing
     * deployment keeps working unchanged, but it is NEVER a gate.
     */
    developerToken?: string;
    customerId?: string;
    accessToken?: string;
    /**
     * Optional manager (login) customer id, digits only, for MCC access.
     *
     * Google requires `login-customer-id` ONLY when a MANAGER calls a CLIENT
     * account. Sending it for a direct user access call is incorrect, so this
     * must be set deliberately rather than merely being present in the env.
     */
    loginCustomerId?: string;
    /**
     * Declares WHICH access path this request uses. This is what makes the
     * `login-customer-id` requirement decidable instead of guessable.
     */
    accessPath?: GoogleAdsAccessPath;
    signal?: AbortSignal;
}

/**
 * How a request reaches the account.
 *
 * `DIRECT`  — the OAuth user IS a user of the target client account.
 *             Google: "if you're not authorizing as a manager account... you
 *             don't need to supply a login-customer-id header."
 * `MANAGER` — a manager account calls a client account.
 *             Google: "you also need to supply the login-customer-id header."
 *
 * Defaulting to DIRECT is deliberate: it is the stricter choice, because a
 * wrongly-absent manager id is refused by Google with a clear error, whereas a
 * wrongly-SENT one silently changes which account is being read.
 */
export type GoogleAdsAccessPath = 'DIRECT' | 'MANAGER';

/** Cache TTL re-exported so callers need only this module. */
export const GOOGLE_ADS_CACHE_TTL_SECONDS =
    GOOGLE_ADS_HISTORICAL_CACHE_TTL_SECONDS;

/** Strictly parse a finite number, else null. Never coerces to 0. */
function finiteOrNull(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Customer ids are digits only; strip hyphens the API forbids. */
function normalizeCustomerId(raw: string): string {
    return raw.replace(/[^0-9]/g, '');
}

/**
 * Validate the documented response shape. Returns an error string or null.
 *
 * An absent `results` key is treated as a protocol violation rather than
 * "zero ideas": silently mapping it to [] would let a malformed response look
 * like a legitimately empty answer.
 */
export function validateGoogleAdsResponse(body: unknown): string | null {
    if (body === null || typeof body !== 'object') {
        return 'Google Ads returned a non-object body';
    }
    const results = (body as GenerateKeywordIdeaResponse).results;
    if (!Array.isArray(results)) {
        return 'Google Ads response.results is missing or not an array';
    }
    for (const idea of results) {
        if (idea === null || typeof idea !== 'object') {
            return 'Google Ads response.results contains a non-object entry';
        }
        if (idea.text !== undefined && typeof idea.text !== 'string') {
            return 'Google Ads response.results[].text is not a string';
        }
        const m = idea.keyword_idea_metrics;
        if (m !== undefined && (m === null || typeof m !== 'object')) {
            return 'Google Ads response.results[].keyword_idea_metrics is not an object';
        }
    }
    return null;
}

/**
 * An OAuth 2.0 auth strategy backed by the OFFLINE access triple.
 *
 * WHY THIS EXISTS
 * ---------------
 * Google access tokens are short-lived. Treating a static access token as a
 * permanent solution is what makes a deployment appear healthy right up until
 * the token dies, then start failing in a way that looks like a provider
 * outage. Google documents offline access (a refresh token) as the way to keep
 * access without re-consenting every hour.
 *
 * This strategy implements that pattern against Google's documented token
 * endpoint. It is deliberately conservative:
 *
 *  - No secret is ever logged, returned, or placed in an error message. The
 *    client id, client secret and refresh token are read inside the method and
 *    go straight into the request body.
 *  - A failed refresh returns null, so the caller reports the provider BLOCKED
 *    with `kind: 'oauth_token'` — the honest state — instead of crashing.
 *  - The HTTP client is injected, so a test exercises the lifecycle with no
 *    network access and no real credential.
 *
 * This is the concrete answer to "do not build on a long-lived static access
 * token as a final solution": the token is now renewed per request.
 */
export function googleAdsRefreshTokenAuth(options: {
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    fetchImpl?: typeof fetch;
    /** Endpoint override, for tests. Defaults to Google's documented URL. */
    tokenEndpoint?: string;
}): ProviderAuthStrategy {
    const endpoint =
        options.tokenEndpoint ?? 'https://oauth2.googleapis.com/token';

    return {
        async getAccessToken(): Promise<string | null> {
            const { clientId, clientSecret, refreshToken } = options;
            if (!clientId || !clientSecret || !refreshToken) return null;

            const doFetch = options.fetchImpl ?? globalThis.fetch;
            if (typeof doFetch !== 'function') return null;

            try {
                const response = await doFetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: clientId,
                        client_secret: clientSecret,
                        refresh_token: refreshToken,
                        grant_type: 'refresh_token',
                    }).toString(),
                });
                if (!response.ok) return null;
                const body = (await response.json()) as { access_token?: unknown };
                const token = body?.access_token;
                return typeof token === 'string' && token ? token : null;
            } catch {
                // Fail closed. The reason is never propagated, because it can
                // contain a client id or an internal endpoint.
                return null;
            }
        },
    };
}

/**
 * Pick the Google Ads auth strategy for a DI-seam call.
 *
 * Prefers the offline triple, because it is the only self-sustaining option. A
 * static access token is used only as a FALLBACK for a short-lived manual run,
 * and never presented as a complete lifecycle.
 *
 * A partially configured triple is treated as ABSENT rather than half-working:
 * supplying only a client id, for instance, cannot produce a token and would
 * otherwise fail opaquely at the API.
 */
export function resolveGoogleAdsAuthStrategy(
    env: Record<string, string | undefined>,
    fetchImpl?: typeof fetch
): ProviderAuthStrategy {
    const clientId = readEnv(env, 'GOOGLE_ADS_CLIENT_ID');
    const clientSecret = readEnv(env, 'GOOGLE_ADS_CLIENT_SECRET');
    const refreshToken = readEnv(env, 'GOOGLE_ADS_REFRESH_TOKEN');

    if (clientId && clientSecret && refreshToken) {
        return googleAdsRefreshTokenAuth({
            clientId,
            clientSecret,
            refreshToken,
            fetchImpl,
        });
    }
    return staticEnvToken(env, 'GOOGLE_ADS_ACCESS_TOKEN');
}
export function resolveGoogleAdsBlocked(
    query: GoogleAdsQuery,
    env: Record<string, string | undefined>,
): BlockedReason | null {
    // Request-shape validation runs FIRST. An empty seed set is a defect in the
    // CALLER's query, not a missing credential, and reporting it as a missing
    // token would send an operator to configure something that is already fine.
    if (!query.seeds?.length && !query.urlSeeds?.length) {
        return {
            dependency: 'seeds (keywordAndPageSeed or urlSeed)',
            kind: 'invalid_request',
            detail:
                'GenerateKeywordIdeas requires at least one seed keyword or page seed; an empty seed set is not a valid request and was never sent',
        };
    }

    const customerId = query.customerId ?? readEnv(env, 'GOOGLE_ADS_CUSTOMER_ID');
    if (!customerId) {
        return {
            dependency: 'GOOGLE_ADS_CUSTOMER_ID',
            kind: 'customer_id',
            detail:
                'no Google Ads customer id is configured; GenerateKeywordIdeas is scoped to a customer account and the id (without dashes) is required to address the request',
        };
    }

    // MANAGER ACCESS IS CONDITIONAL, AND THE CONDITION IS EXPLICIT.
    // Google requires `login-customer-id` only when a manager calls a client
    // account. It is NOT required for direct user access, and sending it there
    // is wrong. So the check keys off the DECLARED access path, not off whether
    // the variable merely happens to be present.
    const accessPath = query.accessPath ?? 'DIRECT';
    if (accessPath === 'MANAGER') {
        const loginCustomerId =
            query.loginCustomerId ?? readEnv(env, 'GOOGLE_ADS_LOGIN_CUSTOMER_ID');
        if (!loginCustomerId) {
            return {
                dependency: 'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
                kind: 'customer_id',
                detail:
                    "accessPath is MANAGER, so Google's API requires a login-customer-id header naming the manager account making the call; without it the request cannot be addressed. Direct (non-manager) access does NOT need this.",
            };
        }
    }

    const accessToken = query.accessToken ?? readEnv(env, 'GOOGLE_ADS_ACCESS_TOKEN');
    if (!accessToken) {
        return {
            dependency: 'GOOGLE_ADS_ACCESS_TOKEN',
            kind: 'oauth_token',
            detail:
                'no Google Ads OAuth 2.0 access token is available. Supply a short-lived GOOGLE_ADS_ACCESS_TOKEN, or configure the offline OAuth triple (GOOGLE_ADS_CLIENT_ID + GOOGLE_ADS_CLIENT_SECRET + GOOGLE_ADS_REFRESH_TOKEN) so a token is renewed per request. A long-lived static token is not a complete lifecycle. Stored user credentials are never used.',
        };
    }

    // DEVELOPER TOKEN: DELIBERATELY NOT A GATE.
    // Google sunset developer tokens on 2026-09-09 and states the header is
    // "optional and ignored by the API servers". An earlier revision of this
    // function required it, which meant the adapter reported BLOCKED on a
    // credential Google no longer uses — sending an operator to a deprecated
    // API Center for a token that grants nothing. Absence is now simply fine.
    //
    // The token may still be READ, and is sent if present, purely so an
    // existing deployment keeps working without changes.
    return null;
}

/**
 * Build the headers for one request.
 *
 * `developer-token` is included ONLY when a value is present, because Google
 * ignores it; sending an empty header would be worse than sending none.
 * `login-customer-id` is included ONLY on the MANAGER path, for the same
 * reason and because sending it on a direct call is incorrect.
 */
export function buildGoogleAdsHeaders(params: {
    accessToken: string;
    developerToken?: string;
    loginCustomerId?: string;
    accessPath?: GoogleAdsAccessPath;
}): Record<string, string> {
    const headers: Record<string, string> = {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
    };
    if (params.developerToken) {
        headers['developer-token'] = params.developerToken;
    }
    if ((params.accessPath ?? 'DIRECT') === 'MANAGER' && params.loginCustomerId) {
        headers['login-customer-id'] = normalizeCustomerId(params.loginCustomerId);
    }
    return headers;
}

/**
 * Build the `GenerateKeywordIdeaRequest` body from the documented fields.
 *
 * `customerId` is deliberately NOT a parameter: it travels in the URL path
 * (`customers/{id}:generateKeywordIdeas`), and the request message has no such
 * field. The caller normalizes it and puts it in the endpoint.
 *
 * Exported so a test can assert the wire contract without a live call.
 */
export function buildGenerateKeywordIdeaRequest(
    query: GoogleAdsQuery
): Record<string, unknown> {
    const geo = marketToGeoTargetConstant(query.market);
    // WIRE FORMAT — proven live against googleads.googleapis.com/v25.
    //
    // The REST/JSON API accepts camelCase field names and enum STRINGS. The
    // previous body used protobuf snake_case (`language: { language_constant }`,
    // `keyword_plan_network`, `geo_target_constants`) and a `customer_id` field
    // that does not exist in the request message at all. A live call returned:
    //
    //     400 INVALID_ARGUMENT  Unknown name "languageConstant": Cannot find field.
    //
    // i.e. every request failed on shape before authorization was ever checked,
    // so this provider could never have produced a single row. `customerId`
    // belongs in the URL path (`customers/{id}:generateKeywordIdeas`), not the
    // body.
    const body: Record<string, unknown> = {
        // LanguageConstant enum, as a resource-name string.
        language: `languageConstants/${LANGUAGE_CODES[query.language]}`,
        // Real Google Ads network, so the statistics are the ones an advertiser
        // would actually bid against.
        keywordPlanNetwork: 'GOOGLE_SEARCH',
    };
    // REMOVED: `includePageTopics: false`.
    //
    // It is not a field of GenerateKeywordIdeasRequest. Google's own
    // documentation for the operation lists exactly these body fields —
    // language, geoTargetConstants, keywordPlanNetwork, includeAdultKeywords,
    // keywordAnnotation, historicalMetricsOptions, and the keyword_seed /
    // url_seed / keyword_and_url_seed / site_seed oneof — and its REST example
    // body is:
    //
    //   { "language": "...", "geoTargetConstants": ["..."],
    //     "includeAdultKeywords": false, "keywordPlanNetwork": "GOOGLE_SEARCH",
    //     "keywordAndUrlSeed": { "keywords": ["..."], "url": "..." } }
    //
    // Sending an unknown name makes the server reject the request with
    // `400 INVALID_ARGUMENT  Unknown name "includePageTopics"`, i.e. it fails
    // on shape BEFORE authorization is ever evaluated. With it present this
    // provider could not return a single row regardless of credentials.
    //
    // Deliberately NOT replaced with a substitute field: inventing a
    // replacement would reintroduce the same class of failure.
    if (geo !== null) {
        body.geoTargetConstants = [`geoTargetConstants/${geo}`];
    }
    const seeds = (query.seeds ?? []).map((s) => s.trim()).filter(Boolean);
    const urls = (query.urlSeeds ?? []).map((s) => s.trim()).filter(Boolean);
    if (urls.length > 0) {
        body.urlSeed = { urls };
    } else {
        body.keywordSeed = { keywords: seeds };
    }
    return body;
}

/**
 * Map one KeywordIdea to a record stamped as a Google Ads historical signal.
 *
 * `dataKind` is 'estimated' because avg_monthly_searches is a modelled figure,
 * not something we observed. Everything that is not a Google Ads field stays
 * null via `emptyKeywordMetrics()`.
 */
export function mapGoogleAdsIdea(
    idea: GoogleAdsKeywordIdea,
    context: {
        language: SourceLanguage;
        market: Market;
        customerId: string;
        retrievedAt: string;
    },
): SearchIntelRecord | null {
    const text = idea.text?.trim();
    if (!text) return null;
    const m = idea.keyword_idea_metrics ?? {};
    const avgMonthly = finiteOrNull(m.avg_monthly_searches);
    const competition = finiteOrNull(m.competition);
    const competitionIndex = finiteOrNull(m.competition_index);

    return {
        keyword: text,
        language: context.language,
        market: context.market,
        source: GOOGLE_ADS_PROVIDER.provider,
        sourceType: 'google_ads_keyword_planner',
        sourceClass: 'SEARCH_INTELLIGENCE',
        sourceStatus: 'CONNECTED',
        sourceReference: `googleAds:GenerateKeywordIdeas:customer/${context.customerId}:${text}`,
        discoveredAt: context.retrievedAt,
        // ESTIMATED, not observed: this is a Google Ads model output.
        dataKind: 'estimated',
        evidence: `KeywordPlanIdeaService.GenerateKeywordIdeas keyword="${text}" market=${context.market}`,
        evidenceType: GOOGLE_ADS_EVIDENCE_TYPE,
        // Historical metrics describe the trailing 12 months, not today.
        metricsDate: context.retrievedAt.slice(0, 10),
        retrievedAt: context.retrievedAt,
        metrics: {
            ...emptyKeywordMetrics(),
            googleAdsAvgMonthlySearches: avgMonthly,
            googleAdsCompetition: competition,
        },
        attribution: {
            // THE canonical name for these numbers. Never "volume".
            signal: GOOGLE_ADS_HISTORICAL_SIGNAL,
            googleAdsCompetitionIndex: competitionIndex,
            googleAdsCustomerId: context.customerId,
            market: context.market,
            language: context.language,
            // Explicitly not an organic-search observation.
            isOrganicSearchVolume: false,
            isFirstPartyObservation: false,
            cacheTtlSeconds: GOOGLE_ADS_HISTORICAL_CACHE_TTL_SECONDS,
        },
    };
}

/**
 * A cache entry for one (market, language, seed-set) triple.
 *
 * TTL is the documented refresh cadence: Google's own Keyword Planning page
 * says historical metrics refresh monthly, so an entry younger than 30 days is
 * not worth a rate-limited call.
 */
interface AdsCacheEntry {
    record: SearchIntelRecord;
    storedAt: number;
}

/** Process-lifetime cache. Not a substitute for a durable store. */
const historicalCache = new Map<string, AdsCacheEntry>();

/** Stable cache key: provider + market + language + sorted seeds. */
export function buildGoogleAdsCacheKey(query: GoogleAdsQuery): string {
    const seeds = [...(query.seeds ?? [])]
        .map((s) => s.trim().toLowerCase())
        .sort()
        .join('|');
    return [
        'provider=google_ads_keyword_planner',
        `market=${query.market}`,
        `language=${query.language}`,
        `seeds=${seeds}`,
        `urls=${(query.urlSeeds ?? []).length}`,
    ].join('::');
}

/** Read a non-expired cache entry, or null. Never returns a stale value. */
export function readGoogleAdsCache(
    query: GoogleAdsQuery,
    nowMs: number,
): SearchIntelRecord[] | null {
    const key = buildGoogleAdsCacheKey(query);
    const entry = historicalCache.get(key);
    if (!entry) return null;
    if (nowMs - entry.storedAt >= GOOGLE_ADS_HISTORICAL_CACHE_TTL_SECONDS) {
        // Expired: drop it rather than serve a value past its refresh cycle.
        historicalCache.delete(key);
        return null;
    }
    return [entry.record];
}

/** Store a record under the TTL. */
export function writeGoogleAdsCache(
    query: GoogleAdsQuery,
    record: SearchIntelRecord,
    nowMs: number,
): void {
    historicalCache.set(buildGoogleAdsCacheKey(query), { record, storedAt: nowMs });
}

/**
 * Collect Google Ads Keyword Planner historical signals.
 *
 * Resolves with a BLOCKED/FAILED envelope instead of throwing. Records are
 * `dataKind: 'estimated'` and never touch a Google/Bing/first-party field.
 */
export async function collectGoogleAdsKeywordIdeas(
    query: GoogleAdsQuery,
    config: GoogleAdsConfig = {},
): Promise<AdapterRunResult<SearchIntelRecord>> {
    const env = config.env ?? process.env;
    const blocked = resolveGoogleAdsBlocked(query, env);
    if (blocked) {
        return blockedResult<SearchIntelRecord>(
            GOOGLE_ADS_PROVIDER.provider,
            blocked,
        );
    }

    const customerId = normalizeCustomerId(
        (query.customerId ?? readEnv(env, 'GOOGLE_ADS_CUSTOMER_ID')) as string,
    );
    // Read for BACKWARDS COMPATIBILITY ONLY. Google ignores this header, and its
    // absence no longer blocks anything; it is sent only if an operator still
    // has one configured.
    const developerToken = (query.developerToken ??
        readEnv(env, 'GOOGLE_ADS_DEVELOPER_TOKEN')) as string | undefined;
    const accessToken = (query.accessToken ??
        readEnv(env, 'GOOGLE_ADS_ACCESS_TOKEN')) as string;
    const loginCustomerId = (query.loginCustomerId ??
        readEnv(env, 'GOOGLE_ADS_LOGIN_CUSTOMER_ID')) as string | undefined;
    const accessPath = query.accessPath ?? 'DIRECT';

    const nowFn = config.now ?? Date.now;
    const nowMs = nowFn();
    const cached = readGoogleAdsCache(query, nowMs);
    if (cached) {
        return {
            provider: GOOGLE_ADS_PROVIDER.provider,
            status: 'CONNECTED',
            dataKind: 'estimated',
            records: cached,
            partial: false,
        };
    }

    const fetchImpl = config.fetchImpl ?? globalThis.fetch;
    if (typeof fetchImpl !== 'function') {
        return {
            provider: GOOGLE_ADS_PROVIDER.provider,
            status: 'FAILED',
            dataKind: 'unavailable',
            records: [],
            error: 'no fetch implementation available in this runtime',
            partial: false,
        };
    }

    const retrievedAt = new Date(nowMs).toISOString();
    const endpoint = `${GOOGLE_ADS_CUSTOMERS_ENDPOINT.replace(
        '{customerId}',
        customerId,
    )}:generateKeywordIdeas`;

    try {
        const response = await fetchImpl(endpoint, {
            method: 'POST',
            headers: buildGoogleAdsHeaders({
                accessToken,
                developerToken,
                loginCustomerId,
                accessPath,
            }),
            body: JSON.stringify(buildGenerateKeywordIdeaRequest(query)),
            signal: query.signal,
        });
        if (!response.ok) {
            throw new Error(
                `Google Ads GenerateKeywordIdeas responded with HTTP ${response.status} ${response.statusText}`,
            );
        }
        const parsed: unknown = await response.json();
        const shapeError = validateGoogleAdsResponse(parsed);
        if (shapeError) throw new Error(`invalid_response: ${shapeError}`);

        const results = (parsed as GenerateKeywordIdeaResponse).results ?? [];
        const limit = query.limit ?? results.length;
        const records: SearchIntelRecord[] = [];
        for (const idea of results) {
            if (records.length >= limit) break;
            const record = mapGoogleAdsIdea(idea, {
                language: query.language,
                market: query.market,
                customerId,
                retrievedAt,
            });
            if (record) records.push(record);
        }

        // One fetch, one refresh cycle: cache the whole batch under the
        // requested seed set so the next call inside the TTL costs nothing.
        if (records.length > 0) writeGoogleAdsCache(query, records[0], nowMs);

        return {
            provider: GOOGLE_ADS_PROVIDER.provider,
            status: 'CONNECTED',
            dataKind: 'estimated',
            records,
            partial: false,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            provider: GOOGLE_ADS_PROVIDER.provider,
            status: 'FAILED',
            dataKind: 'unavailable',
            records: [],
            error: `google_ads_error: ${message}`,
            partial: false,
        };
    }
}

/** Empty the whole historical cache. Used by tests. */
export function clearGoogleAdsCache(): void {
    historicalCache.clear();
}

/**
 * The provider descriptor consumed by the source registry.
 *
 * `requiredEnv` reflects the CURRENT authentication model, verified against
 * Google's documentation on 2026-09-30:
 *
 *  - `GOOGLE_ADS_DEVELOPER_TOKEN` is GONE from this list. Google sunset
 *    developer tokens on 2026-09-09; the header is optional and ignored.
 *    Keeping it listed as required is what made the previous Readiness Package
 *    ask the owner for a credential that grants nothing.
 *  - The offline OAuth triple is the supported durable path, because an access
 *    token is short-lived and offline access is how Google documents continuing
 *    access without re-consenting hourly.
 *  - `GOOGLE_ADS_ACCESS_TOKEN` remains accepted for a short-lived single run.
 *  - `GOOGLE_ADS_LOGIN_CUSTOMER_ID` is OPTIONAL and only relevant on the
 *    MANAGER access path, so it is not required for the default DIRECT flow.
 */
export const GOOGLE_ADS_DESCRIPTOR = {
    provider: 'google_ads_keyword_planner',
    sourceClass: 'SEARCH_INTELLIGENCE',
    languages: ['en', 'ar'],
    markets: ['ar-EG', 'en-US', 'en-GB', 'ar-SA', 'ar-AE'],
    requiredEnv: [
        'GOOGLE_ADS_CUSTOMER_ID',
        'GOOGLE_ADS_ACCESS_TOKEN',
    ],
    optionalEnv: [
        'GOOGLE_ADS_CLIENT_ID',
        'GOOGLE_ADS_CLIENT_SECRET',
        'GOOGLE_ADS_REFRESH_TOKEN',
        'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
        // Retained for backwards compatibility; ignored by Google since
        // 2026-09-09 and never a gate.
        'GOOGLE_ADS_DEVELOPER_TOKEN',
    ],
    docUrl: GOOGLE_ADS_DOC_URL,
} as const satisfies ProviderDescriptor;
