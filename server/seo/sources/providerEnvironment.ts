/**
 * server/seo/sources/providerEnvironment.ts
 * ============================================================================
 * THE DI SEAM (Phase 2, step 1) — `process.env` -> validated config -> adapter
 * ============================================================================
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Every source adapter in this directory is dependency-injected by design: none
 * reads `process.env`. Each takes an `env: Record<string, string | undefined>`
 * and exposes a `resolve*Blocked()` naming the EXACT missing dependency. That
 * design was right — it is why the adapters are testable with no network — but it
 * left a real gap: nothing in the runtime ever CONSTRUCTED that env object and
 * handed it to an adapter.
 *
 * The consequence, and the reason this file must exist before any credential is
 * purchased: setting environment variables alone activates NOTHING. Without a
 * seam, a fully configured deployment would still report every source BLOCKED,
 * and the cause would look like a credential problem rather than a missing wire.
 *
 * This module is that wire, and the ONLY place in the SEO layer that reads
 * `process.env`.
 *
 * FOUR RULES THIS FILE ENFORCES
 * -----------------------------
 * 1. NO STATE UPGRADE ON CONFIGURATION. A provider becomes INVOKABLE (config
 *    complete) and that is ALL. Not CONNECTED, never VERIFIED. Those require a
 *    real request that returned real rows.
 *      CONFIGURED != CONNECTED != VERIFIED
 * 2. NO SECRET EGRESS. Only variable NAMES are ever returned, never values.
 * 3. NO CROSS-PROVIDER INFERENCE. Each provider resolves in isolation; one can
 *    never satisfy, upgrade, or mask another.
 * 4. NO ASSUMPTION THAT A TOKEN IS STATIC. See `ProviderAuthStrategy`.
 *
 * TOKEN EXPIRY IS A FIRST-CLASS CASE, NOT AN ERROR
 * -------------------------------------------------
 * Reading a token once at module load is the wrong design and fails badly: the
 * pipeline appears healthy right up until the token dies, then starts returning
 * 401s that look like a provider outage. Credentials therefore arrive through a
 * `ProviderAuthStrategy` whose `getAccessToken()` is called PER REQUEST. An
 * expired token surfaces as `kind: 'oauth_token'`, i.e. the honest BLOCKED
 * state, and re-authentication means swapping the strategy — with NO adapter
 * change required.
 *
 * NO OAUTH IMPLEMENTATION IS INVENTED HERE. This project has no token-refresh
 * client, so this file fabricates none. It defines the SEAM a real refresh client
 * will slot into, plus a static strategy for the single-request case.
 */

import type { BlockedReason } from './searchIntelligenceTypes';
import type { Market, SourceLanguage } from './types';

/* ------------------------------------------------------------------ */
/* Auth lifecycle                                                      */
/* ------------------------------------------------------------------ */

/**
 * How a provider's short-lived credential is obtained.
 *
 * `getAccessToken()` is called on EVERY request, never cached at module load.
 * That is the point: an implementation may renew, refresh or re-read a store,
 * and the pipeline neither knows nor cares which.
 */
export interface ProviderAuthStrategy {
    /**
     * Return a currently-valid access token, or null when none is available
     * (expired, revoked, not yet granted). Returning null is a NORMAL outcome,
     * not an exception: the caller reports the provider BLOCKED with
     * `kind: 'oauth_token'` and the run continues.
     */
    getAccessToken(): Promise<string | null>;
}

/**
 * A strategy backed by one environment variable, evaluated PER CALL.
 *
 * Correct for a token that outlives the process (a long-lived refresh result, or
 * a platform secret the operator rotates). Wrong for a short-lived token — for
 * that, supply a renewing strategy. Reading the variable inside the method
 * rather than at construction is what lets a rotated secret take effect without
 * a redeploy.
 */
export function staticEnvToken(
    env: Record<string, string | undefined>,
    variable: string
): ProviderAuthStrategy {
    return {
        async getAccessToken(): Promise<string | null> {
            const value = env[variable];
            return value && value.trim() ? value.trim() : null;
        },
    };
}

/** A strategy holding no credential. Every request reports BLOCKED. */
export function noAuth(): ProviderAuthStrategy {
    return {
        async getAccessToken(): Promise<string | null> {
            return null;
        },
    };
}

/**
 * A strategy that FAILS CLOSED on an unexpected error.
 *
 * An auth backend that throws (a DB read fails, a secret store is unreachable)
 * must not be mistaken for "no token configured", and must never be turned into
 * a fabricated token. It returns null, so the provider reports BLOCKED — the
 * honest state — and the run log shows which dependency is unsatisfied.
 *
 * The caught error is deliberately not propagated: its text could contain a
 * connection string or an internal hostname, which must not reach a log.
 */
export function guardedAuth(
    read: () => Promise<string | null | undefined>
): ProviderAuthStrategy {
    return {
        async getAccessToken(): Promise<string | null> {
            try {
                const value = await read();
                return value && value.trim() ? value.trim() : null;
            } catch {
                // Fails closed: no token rather than a fabricated one.
                return null;
            }
        },
    };
}

/* ------------------------------------------------------------------ */
/* Provider identity                                                   */
/* ------------------------------------------------------------------ */

/** The providers this seam can resolve. Each is fully independent. */
export const PROVIDER_IDS = [
    'google_search_console',
    'google_ads_keyword_planner',
    'bing_web_search',
    'google_trends',
    'common_crawl',
    'competitor_web',
    'csv_import',
] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

/**
 * The environment variables each provider needs, as NAMES ONLY.
 *
 * Documentation and a completeness check, not the mechanism. The authoritative
 * "is it blocked?" answer always comes from the adapter's own
 * `resolve*Blocked()`; this table exists so the seam can report which variables
 * it consulted, and so a test can prove no variable was invented.
 */
export const PROVIDER_ENV_VARS: Record<ProviderId, readonly string[]> = {
    google_search_console: ['GSC_SITE_URL', 'GSC_ACCESS_TOKEN'],
    google_ads_keyword_planner: [
        'GOOGLE_ADS_CUSTOMER_ID',
        'GOOGLE_ADS_ACCESS_TOKEN',
        // The offline OAuth triple. Preferred, because a static access token is
        // short-lived and cannot sustain access on its own.
        'GOOGLE_ADS_CLIENT_ID',
        'GOOGLE_ADS_CLIENT_SECRET',
        'GOOGLE_ADS_REFRESH_TOKEN',
        // Only relevant on the MANAGER access path. Optional.
        'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
        // Retained for backwards compatibility. Google sunset developer tokens
        // on 2026-09-09 and IGNORES this header, so it is never a gate — but it
        // is still read, so an existing deployment keeps working unchanged.
        'GOOGLE_ADS_DEVELOPER_TOKEN',
    ],
    bing_web_search: ['BING_WEBMASTER_SITE_URL', 'BING_WEBMASTER_API_KEY'],
    // No credentials exist for any of these. The absence of a variable is NOT
    // why they are blocked — the reason is structural, stated below.
    google_trends: [],
    common_crawl: [],
    competitor_web: [],
    csv_import: [],
};

/**
 * Providers blocked for a STRUCTURAL reason that NO credential can fix.
 *
 * Listed explicitly so nobody hunts for a missing env var that does not exist,
 * and so obtaining a credential can never appear to "unblock" them. This is the
 * concrete form of provider independence: a full environment still leaves these
 * STRUCTURALLY_BLOCKED.
 */
export const STRUCTURAL_BLOCKERS: Partial<
    Record<ProviderId, { dependency: string; kind: BlockedReason['kind']; detail: string }>
> = {
    google_trends: {
        dependency: 'Google Trends API alpha access (no public endpoint)',
        kind: 'no_public_api',
        detail:
            'Google exposes Trends data only through a closed alpha with no public API endpoint; no credential can grant access. The only permitted path today is a manual CSV import, which is a separate, unauthenticated mode.',
    },
};

/* ------------------------------------------------------------------ */
/* Resolution result                                                   */
/* ------------------------------------------------------------------ */

/**
 * How far one provider can currently get.
 *
 * `INVOKABLE` means the config is complete and the adapter COULD be called. It
 * is a statement about configuration only, and is never evidence that a request
 * succeeded or returned rows.
 */
export type ProviderInvokability =
    /** A dependency is missing or unavailable. The reason is exact. */
    | 'BLOCKED'
    /** Config complete; the adapter may be invoked. NOT a connection claim. */
    | 'INVOKABLE'
    /** No credential can resolve this. Requires a non-credential action. */
    | 'STRUCTURALLY_BLOCKED';

export interface ProviderResolution {
    provider: ProviderId;
    invokability: ProviderInvokability;
    /**
     * Exact missing dependency, or null when invokable. Never vague, and never
     * derived from another provider's state.
     */
    blocked: BlockedReason | null;
    /**
     * The env var NAMES this provider consulted. Names only — no values, ever.
     * Lets an operator see what was checked without any secret reaching a log.
     */
    envVarsConsulted: readonly string[];
    /**
     * TRUE only when a live token came back from the auth strategy. Separates
     * "no token variable configured" from "strategy returned nothing" — both
     * BLOCKED, but different operator actions.
     */
    tokenPresent: boolean;
}

/* ------------------------------------------------------------------ */
/* The resolver                                                       */
/* ------------------------------------------------------------------ */

/**
 * A request-shaped input, used only to let each adapter's OWN validator run.
 *
 * The seam does not decide whether a provider is blocked — it delegates that to
 * the adapter, which already encodes the authoritative rules. It supplies the
 * environment and a minimally valid query so the adapter can ask its own
 * question. Re-implementing those rules here is how configuration drifts out of
 * sync with the adapter that depends on it.
 */
export interface ProviderProbeRequest {
    provider: ProviderId;
    language: SourceLanguage;
    market: Market;
    /** Seeds for providers that require at least one (Google Ads). */
    seeds?: string[];
}

export interface ProviderEnvironmentOptions {
    /**
     * Defaults to `process.env`. Injected in tests so a suite can never read —
     * or accidentally assert against — the real machine environment.
     */
    env?: Record<string, string | undefined>;
    /**
     * Per-provider auth overrides. A provider with no entry uses
     * `staticEnvToken` on its own access-token variable, or `noAuth()`.
     *
     * This is the extension point for a real token-refresh client: pass a
     * renewing strategy for `google_search_console`, and neither the adapter nor
     * this seam needs to change again.
     */
    auth?: Partial<Record<ProviderId, ProviderAuthStrategy>>;
}

const ACCESS_TOKEN_VAR: Partial<Record<ProviderId, string>> = {
    google_search_console: 'GSC_ACCESS_TOKEN',
    google_ads_keyword_planner: 'GOOGLE_ADS_ACCESS_TOKEN',
    bing_web_search: 'BING_WEBMASTER_API_KEY',
};

/** Every env var this module reads. A test uses it to prove nothing else is. */
export const ALL_SEAM_ENV_VARS: readonly string[] = [
    ...new Set([
        ...PROVIDER_IDS.flatMap((p) => PROVIDER_ENV_VARS[p]),
        ...Object.values(ACCESS_TOKEN_VAR).filter((v): v is string => Boolean(v)),
    ]),
].sort();

/**
 * Pick the auth strategy for a provider.
 *
 * An explicit override always wins, which is the extension point for a real
 * token-refresh client. Google Ads is special-cased to prefer its offline OAuth
 * triple, because a static access token cannot sustain access on its own.
 *
 * Async because the Google Ads factory is loaded with a DYNAMIC import: a static
 * import would create a cycle, since adapters import this module.
 */
async function strategyFor(
    provider: ProviderId,
    env: Record<string, string | undefined>,
    overrides?: Partial<Record<ProviderId, ProviderAuthStrategy>>
): Promise<ProviderAuthStrategy> {
    const override = overrides?.[provider];
    if (override) return override;

    if (provider === 'google_ads_keyword_planner') {
        const { resolveGoogleAdsAuthStrategy } = await import('./googleAdsAdapter');
        return resolveGoogleAdsAuthStrategy(env);
    }

    const variable = ACCESS_TOKEN_VAR[provider];
    return variable ? staticEnvToken(env, variable) : noAuth();
}

/**
 * Resolve one provider's configuration and report exactly how far it can get.
 *
 * ORDER MATTERS, and encodes provider independence:
 *   1. A STRUCTURAL blocker is reported first, BEFORE any environment is read.
 *      A complete environment must never present a structurally blocked provider
 *      as INVOKABLE.
 *   2. The provider's own `resolve*Blocked()` decides the rest.
 *
 * The env passed to the adapter is NOT the whole `process.env`. It is rebuilt
 * from `PROVIDER_ENV_VARS[provider]` only. That mechanically prevents one
 * provider's variables from satisfying another's validator, and keeps the blast
 * radius of a misconfiguration local.
 */
export async function resolveProvider(
    request: ProviderProbeRequest,
    options: ProviderEnvironmentOptions = {}
): Promise<ProviderResolution> {
    const env = options.env ?? process.env;
    const consulted = PROVIDER_ENV_VARS[request.provider];

    // 1. Structural blockers ignore configuration entirely.
    const structural = STRUCTURAL_BLOCKERS[request.provider];
    if (structural) {
        return {
            provider: request.provider,
            invokability: 'STRUCTURALLY_BLOCKED',
            blocked: {
                dependency: structural.dependency,
                kind: structural.kind,
                detail: structural.detail,
            },
            envVarsConsulted: consulted,
            tokenPresent: false,
        };
    }

    // 2. Obtain a live token through the strategy — per request, never cached.
    const token = await (await strategyFor(request.provider, env, options.auth)).getAccessToken();

    // 3. Build a provider-scoped env. The whole process env is never handed out.
    const scoped: Record<string, string | undefined> = {};
    for (const name of consulted) scoped[name] = env[name];

    // 3b. When the auth strategy was OVERRIDDEN, its result is authoritative and
    // the static env value must NOT be able to rescue a dead token. Otherwise an
    // expired token would read as INVOKABLE purely because an old value happens
    // to sit in the environment — which is exactly the "silently working until it
    // 401s" failure this seam exists to prevent.
    const overridden = options.auth?.[request.provider] !== undefined;
    if (overridden) {
        const tokenVar = ACCESS_TOKEN_VAR[request.provider];
        if (tokenVar) {
            // Explicitly null/undefined: "no valid token", not "read the env".
            scoped[tokenVar] = token ?? undefined;
        }
    }

    // 4. Delegate the verdict to the adapter that owns the rules.
    const blocked = await delegateBlocked(
        request.provider,
        buildProbeQuery(request, token, scoped),
        scoped
    );

    return {
        provider: request.provider,
        invokability: blocked ? 'BLOCKED' : 'INVOKABLE',
        blocked,
        envVarsConsulted: consulted,
        tokenPresent: token !== null,
    };
}

/**
 * Assemble the minimally valid query each validator expects.
 *
 * A non-empty seed set is always supplied: Google Ads' validator rejects an
 * empty one, and that rejection is a CALLER defect which must not be reported as
 * a missing credential.
 */
function buildProbeQuery(
    request: ProviderProbeRequest,
    token: string | null,
    env: Record<string, string | undefined>
): Record<string, unknown> {
    const base: Record<string, unknown> = {
        language: request.language,
        market: request.market,
        seeds: request.seeds?.length ? request.seeds : ['probe'],
    };

    switch (request.provider) {
        case 'google_search_console':
            return { ...base, siteUrl: env.GSC_SITE_URL, accessToken: token };
        case 'google_ads_keyword_planner':
            return {
                ...base,
                developerToken: env.GOOGLE_ADS_DEVELOPER_TOKEN,
                customerId: env.GOOGLE_ADS_CUSTOMER_ID,
                accessToken: token,
                // The login-customer-id requirement is CONDITIONAL on the access
                // path, so the probe must declare one. A probe that is not a
                // manager call does NOT need one.
                loginCustomerId: env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
                accessPath: env.GOOGLE_ADS_LOGIN_CUSTOMER_ID ? 'MANAGER' : 'DIRECT',
            };
        case 'bing_web_search':
            return { ...base, siteUrl: env.BING_WEBMASTER_SITE_URL, apiKey: token };
        default:
            return base;
    }
}

/**
 * Call the provider's own `resolve*Blocked()`.
 *
 * Imported lazily so this module holds no adapter imports at load time, keeping
 * the environment reader independently testable and avoiding a cycle (adapters
 * import from this directory).
 */
async function delegateBlocked(
    provider: ProviderId,
    query: Record<string, unknown>,
    env: Record<string, string | undefined>
): Promise<BlockedReason | null> {
    switch (provider) {
        case 'google_search_console': {
            const { resolveGscBlocked } = await import('./gscAdapter');
            return resolveGscBlocked(query as never, env);
        }
        case 'google_ads_keyword_planner': {
            const { resolveGoogleAdsBlocked } = await import('./googleAdsAdapter');
            return resolveGoogleAdsBlocked(query as never, env);
        }
        case 'bing_web_search': {
            const { resolveBingBlocked } = await import('./bingAdapter');
            return resolveBingBlocked(query as never, env);
        }
        case 'google_trends': {
            // Unreachable in practice: handled as STRUCTURALLY_BLOCKED above.
            // Kept explicit so adding a Trends mode cannot silently fall through.
            const { resolveOfficialApiBlocked } = await import('./googleTrendsAdapter');
            return resolveOfficialApiBlocked();
        }
        default:
            // common_crawl / competitor_web / csv_import have no credential
            // validator. They are blocked by the absence of a real request, not
            // by configuration, so configuration alone cannot resolve them.
            return null;
    }
}

/** Resolve every provider. Each is independent; none can mask another. */
export async function resolveAllProviders(
    options: ProviderEnvironmentOptions & {
        language?: SourceLanguage;
        market?: Market;
    } = {}
): Promise<ProviderResolution[]> {
    const language = options.language ?? 'en';
    const market = options.market ?? 'en-US';
    return Promise.all(
        PROVIDER_IDS.map((provider) => resolveProvider({ provider, language, market }, options))
    );
}

/**
 * A report safe to log or return over HTTP.
 *
 * Variable NAMES and verdicts only. There is deliberately no code path here that
 * reads a value, so this cannot leak a secret by construction rather than by
 * review.
 */
export function describeProviderConfig(
    resolutions: readonly ProviderResolution[]
): Array<{
    provider: string;
    invokability: string;
    blockedDependency: string | null;
    blockedKind: string | null;
    envVarsConsulted: string[];
    tokenPresent: boolean;
}> {
    return resolutions.map((r) => ({
        provider: r.provider,
        invokability: r.invokability,
        blockedDependency: r.blocked?.dependency ?? null,
        blockedKind: r.blocked?.kind ?? null,
        envVarsConsulted: [...r.envVarsConsulted],
        tokenPresent: r.tokenPresent,
    }));
}

/* ------------------------------------------------------------------ */
/* The SCHEDULE secret is not a provider credential                    */
/* ------------------------------------------------------------------ */

/**
 * `CRON_SECRET` authorises who may TRIGGER a scheduled run. It is emphatically
 * NOT a provider credential, and the seam keeps them apart on purpose.
 *
 * Conflating them would create two real hazards:
 *  - Handing the schedule secret to a provider adapter widens its blast radius
 *    to "anything that can schedule a run".
 *  - Treating a valid CRON_SECRET as evidence a provider is configured would
 *    let the schedule secret masquerade as external verification.
 *
 * This is the ONLY place the schedule secret is consulted, and it returns a
 * boolean. The secret is never returned, never compared against a provider
 * dependency, and never included in a provider report.
 */
export function isScheduleRequestAuthorised(
    headerValue: string | null | undefined,
    expected: string | null | undefined
): boolean {
    if (!expected) return false;
    if (!headerValue) return false;
    return timingSafeEqualStrings(String(headerValue), String(expected));
}

/**
 * Constant-time string comparison.
 *
 * A plain `===` on a secret leaks its length and prefix through timing. This
 * compares every byte regardless of where the first difference falls, and does
 * bounded work on a length mismatch so that case is not distinguishable either.
 */
function timingSafeEqualStrings(a: string, b: string): boolean {
    if (a.length !== b.length) {
        let sink = 0;
        for (let i = 0; i < a.length; i += 1) sink ^= a.charCodeAt(i);
        // Always false; the walk above only equalises timing.
        return sink === -1;
    }
    let diff = 0;
    for (let i = 0; i < a.length; i += 1) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}
