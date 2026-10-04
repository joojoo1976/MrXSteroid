/**
 * server/seo/liveProviderCollection.ts
 * ============================================================================
 * THE MISSING WIRE: `process.env` -> DI seam -> REAL adapters -> ProviderOutcome
 * ============================================================================
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The readiness package (`docs/.../2026-09-30-seo-external-readiness-package.md`)
 * identified the defect this module closes: "setting environment variables
 * alone will NOT activate any source. Something must construct the config object
 * and pass it in." The DI seam (`providerEnvironment.ts`) was built; the call
 * into it from a runtime route was not. Until now `collect()` in
 * `app/api/seo/refresh/route.ts` returned a HARDCODED `BLOCKED` list, so a
 * fully configured deployment still reported every source blocked and the cause
 * looked like a credential problem rather than a missing wire.
 *
 * This module is that wire. It is the runtime counterpart to `refreshRuntime.ts`
 * (which owns Supabase knowledge): this file owns `process.env` knowledge and
 * knows nothing about the database.
 *
 * WHAT IT DOES, IN ORDER, PER PROVIDER
 * ------------------------------------
 *   1. Ask the seam to RESOLVE the provider. This delegates to the adapter's
 *      own `resolve*Blocked()`, so the blocked reason always names the exact
 *      variable the adapter actually reads.
 *   2. If the verdict is not INVOKABLE, return the BLOCKED outcome verbatim.
 *      A STRUCTURAL blocker is never retried or re-resolved: no credential can
 *      change it, and pretending otherwise is the exact lie this codebase is
 *      built to avoid.
 *   3. If INVOKABLE, call the REAL adapter through `ProviderRunner`, so a hang,
 *      a 429 or a 5xx is bounded by a timeout, retried with backoff, and
 *      circuit-broken — instead of one dead provider aborting the weekly run.
 *   4. Translate the adapter's `AdapterRunResult` into a `ProviderOutcome`,
 *      preserving the distinction between "ran and returned rows" (CONNECTED)
 *      and "ran and returned nothing" (FAILED), never collapsing the two.
 *
 * THE TRUTH LADDER — WHAT IS AND IS NOT CLAIMED
 * ---------------------------------------------
 *   INVOKABLE   configuration is complete. NOT a connection claim.
 *   CONNECTED   a real request really returned 200. NOT an accuracy claim.
 *   VERIFIED    additionally requires the downstream chain — persist,
 *               provenance, weekly state, diff, API — which lives in the route.
 *               This module NEVER returns VERIFIED; only the route may, and only
 *               with that evidence. See `seoGscLiveProbe.test.ts`, which pins
 *               this ordering and asserts that HTTP 200 alone is not terminal.
 *
 * PROVIDER INDEPENDENCE
 * ---------------------
 * Each provider resolves in isolation and is invoked in its own try/catch. One
 * provider's missing credential can never mask, upgrade or suppress another's
 * result, and a throw in one never removes the others from the returned array.
 *
 * WHAT DELIBERATELY DOES NOT HAPPEN HERE
 * ---------------------------------------
 *  - No keyword is created. A discovered keyword is a measurement, not a row:
 *    writing new `seo_keywords` here would invent corpus the operator never
 *    approved. Existing rows are enriched by the route; this only returns
 *    records for the engine to score and diff.
 *  - No provenance is written. Provenance is evidence about a persisted row, and
 *    the row must exist first; the route writes it after PERSIST.
 *  - No provider is upgraded to VERIFIED, for the ladder reason above.
 */

import {
    resolveProvider,
    staticEnvToken,
    type ProviderAuthStrategy,
    type ProviderId,
} from './sources/providerEnvironment';
import { ProviderRunner } from './sources/providerRunner';
import {
    collectGscSearchAnalytics,
    gscConservativeLagFloor,
} from './sources/gscAdapter';
import {
    collectGoogleAdsKeywordIdeas,
    resolveGoogleAdsAuthStrategy,
} from './sources/googleAdsAdapter';
import { collectBingQueryStats } from './sources/bingAdapter';
import type { ProviderOutcome } from './weeklyEngine';
import type {
    AdapterRunResult,
    SearchIntelRecord,
} from './sources/searchIntelligenceTypes';
import type { Market, SourceLanguage } from './sources/types';

/**
 * Providers this module will actually invoke.
 *
 * `google_trends` is ABSENT on purpose: it is STRUCTURALLY_BLOCKED (no public
 * endpoint) and the seam can never mark it INVOKABLE. Listing it would only add
 * a permanent BLOCKED row that no credential could ever clear.
 *
 * `common_crawl`, `competitor_web` and `csv_import` are also absent: they have
 * no credential validator at all, and `competitor_web` is already crawled for
 * real by the route (`crawlAndPersistCompetitors`), which is where its counters
 * and persistence live.
 */
export const LIVE_PROVIDER_IDS: readonly ProviderId[] = [
    'google_search_console',
    'google_ads_keyword_planner',
    'bing_web_search',
];

/** Default trailing window for GSC / Bing, in whole days. */
export const DEFAULT_INTELLIGENCE_WINDOW_DAYS = 28;

/**
 * The variable each provider's ADAPTER reads its bearer credential from.
 *
 * Mirrors the seam's own `ACCESS_TOKEN_VAR`. It is duplicated rather than
 * imported so this module states plainly which variable each adapter consumes —
 * and because the seam intentionally keeps that map private.
 */
const ACCESS_TOKEN_VAR: Partial<Record<ProviderId, string>> = {
    google_search_console: 'GSC_ACCESS_TOKEN',
    google_ads_keyword_planner: 'GOOGLE_ADS_ACCESS_TOKEN',
    bing_web_search: 'BING_WEBMASTER_API_KEY',
};

/** Conservative per-provider row cap. One run must stay inside a cron budget. */
export const DEFAULT_ROW_LIMIT = 250;

/** ISO date N days before `now`, as YYYY-MM-DD. */
function isoDaysBefore(now: Date, days: number): string {
    const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
}

export interface LiveCollectionOptions {
    /** Defaults to `process.env`. Injected in tests so a suite can never read it. */
    env?: Record<string, string | undefined>;
    /**
     * HOW the Google Ads account is reached. See the note on the field itself.
     *
     * When omitted it is INFERRED from whether `GOOGLE_ADS_LOGIN_CUSTOMER_ID`
     * is configured — the same inference the seam's probe already makes, so the
     * probe and the real call can never disagree about the access path.
     */
    googleAdsAccessPath?: 'DIRECT' | 'MANAGER';
    language: SourceLanguage;
    market: Market;
    /**
     * Seed keywords. Google Ads REQUIRES at least one; an empty seed set is a
     * CALLER defect and is reported as such rather than silently skipped.
     */
    seeds: string[];
    /**
     * The GSC property / Bing site window. Defaults to the trailing 28 days,
     * which is wide enough to be non-trivial and inside the range both APIs
     * accept without paging artefacts.
     */
    windowDays?: number;
    /** Row caps per provider, so one verbose property cannot stall the run. */
    rowLimit?: number;
    /** Shared across every provider so one run has one circuit per provider. */
    runner?: ProviderRunner;
    fetchImpl?: typeof fetch;
    now?: () => number;
    /**
     * Per-provider auth overrides, passed straight through to the seam. This is
     * how GSC's service-account strategy is injected without the seam or the
     * adapter learning anything about service accounts.
     */
    auth?: Partial<Record<ProviderId, ProviderAuthStrategy>>;
}

/**
 * Translate one adapter envelope into a `ProviderOutcome`.
 *
 * THE MAPPING, and why each branch is distinct:
 *  - `BLOCKED`  -> `BLOCKED`. The exact reason travels in `error`, so the run
 *    log names the missing dependency rather than "provider failed".
 *  - `FAILED`   -> `FAILED`. A provider that ran and failed is NOT blocked; the
 *    two mean different operator actions (re-authorize vs. investigate).
 *  - `CONNECTED` with zero rows -> `FAILED`. A 200 with an empty body is a
 *    protocol-level surprise for these three APIs, and reporting it as
 *    CONNECTED would claim a working integration that produced no evidence.
 *  - `CONNECTED` with rows      -> `CONNECTED`. NEVER `VERIFIED`: that needs
 *    the downstream chain, which this module does not run.
 *
 * `partial` is carried through from the adapter, so a run that kept some rows
 * after an error stays honestly flagged instead of looking complete.
 */
/**
 * REDACT any credential that a hostile or careless upstream echoed back.
 *
 * WHY THIS EXISTS — a real leak this suite caught
 * ----------------------------------------------
 * The adapters surface upstream failures as `bing_error: <message>` /
 * `gsc_error: <message>` / `google_ads_error: <message>`, taken verbatim from a
 * thrown `Error`. That is fine for a shape error, but an upstream is free to
 * quote the credential it was given — and then the bearer token lands in:
 *   - the refresh response body (`liveProviders[].error`), and
 *   - the persisted `seo_keyword_refresh_runs` row,
 * both of which are readable far more widely than the secret is.
 *
 * So the message is scrubbed at the SEAM, once, on the way out. The provider
 * error keeps its actionable part ("HTTP 401", "invalid_response: ...") and
 * loses only the substrings that are literally the credentials this process
 * holds. Deliberately NOT scrubbed: HTTP status, shape descriptions, dependency
 * NAMES — an operator needs those, and none of them is a secret.
 *
 * Why here and not in each adapter: three adapters would each need the same
 * logic and the same list, and a fourth would forget it. One seam cannot be
 * bypassed by a new adapter.
 */
export function redactSecrets(text: string, env: Record<string, string | undefined>): string {
    let out = text;
    for (const value of Object.values(env)) {
        if (typeof value !== 'string') continue;
        const trimmed = value.trim();
        // Only a substantial value can be a real credential; skipping short
        // strings avoids mangling ordinary words that happen to match.
        if (trimmed.length < 8) continue;
        out = out.split(trimmed).join('[REDACTED]');
    }
    return out;
}

/**
 * Translate one adapter envelope into a `ProviderOutcome`.
 *
 * THE MAPPING, and why each branch is distinct:
 *  - `BLOCKED`  -> `BLOCKED`. The exact reason travels in `error`, so the run
 *    log names the missing dependency rather than "provider failed".
 *  - `FAILED`   -> `FAILED`. A provider that ran and failed is NOT blocked; the
 *    two mean different operator actions (re-authorize vs. investigate).
 *  - `CONNECTED` with zero rows -> `FAILED`. A 200 with an empty body is a
 *    protocol-level surprise for these three APIs, and reporting it as
 *    CONNECTED would claim a working integration that produced no evidence.
 *  - `CONNECTED` with rows      -> `CONNECTED`. NEVER `VERIFIED`: that needs
 *    the downstream chain, which this module does not run.
 *
 * `partial` is carried through from the adapter, so a run that kept some rows
 * after an error stays honestly flagged instead of looking complete.
 *
 * `env` is REQUIRED so the error can be scrubbed. Omitting it would let an
 * echoed credential reach the response body, so it is not optional.
 */
export function toProviderOutcome(
    provider: string,
    result: AdapterRunResult<SearchIntelRecord>,
    env: Record<string, string | undefined> = {}
): ProviderOutcome {
    // The provider id comes from the SEAM (`bing_web_search`), never from the
    // adapter envelope (`bing_webmaster`). The two vocabularies differ, and
    // `seo_keyword_weekly_states.source` must hold the seam's id: it is the one
    // the report layer and the health view query by. Letting the adapter's own
    // label through would persist rows nothing can find again.
    const outcome: ProviderOutcome = {
        provider,
        status: result.status === 'BLOCKED' ? 'BLOCKED' : result.status,
        dataKind: result.dataKind,
        records: result.records ?? [],
        partial: result.partial,
    };
    // Scrubbed on the way out, before it can reach the response or the run log.
    if (result.error) outcome.error = redactSecrets(result.error, env);
    if (result.status === 'CONNECTED' && (result.records ?? []).length === 0) {
        outcome.status = 'FAILED';
        outcome.dataKind = 'unavailable';
        outcome.records = [];
        outcome.error =
            'provider responded successfully but returned no rows; ' +
            'treated as FAILED rather than a working integration with no evidence';
    }
    return outcome;
}

/**
 * The BLOCKED outcome for a provider the seam refused to invoke.
 *
 * The reason is the seam's own, verbatim. A STRUCTURAL blocker is reported with
 * its `kind: 'no_public_api'` detail and is NOT phrased as a missing credential,
 * because no credential could change it and telling an operator to go buy one
 * would be the actionable-lie this codebase is built to avoid.
 */
function blockedOutcome(
    provider: string,
    reason: { dependency: string; detail: string } | null
): ProviderOutcome {
    return {
        provider,
        status: 'BLOCKED',
        dataKind: 'unavailable',
        records: [],
        error: reason
            ? `BLOCKED: missing ${reason.dependency} — ${reason.detail}`
            : 'BLOCKED: the provider is not invokable and named no reason',
        partial: false,
    };
}

/**
 * Produce the env an ADAPTER reads, with a freshly-minted token already in it.
 *
 * WHY THIS EXISTS
 * ---------------
 * `resolveProvider` deliberately never returns a token value — only whether one
 * existed. That no-secret-egress rule is correct and stays. But the adapters
 * re-run their own `resolve*Blocked()` against the env they are handed, and they
 * read the token from THAT env. Passing the raw process env therefore makes the
 * adapter report BLOCKED for a provider the seam had just cleared as INVOKABLE:
 * the request never leaves the process, and the run log blames a credential
 * that is in fact perfectly renewable.
 *
 * So the token is minted a second time here, per provider, and written into a
 * COPY of the env under the variable that provider's adapter reads. The copy
 * means no other provider can see it, and nothing is logged or returned.
 *
 * COST: one extra token exchange per provider per run. That is deliberate. A
 * token is cheap; a provider that never gets called is not.
 */
async function withResolvedTokens(
    env: Record<string, string | undefined>,
    provider: ProviderId,
    options: LiveCollectionOptions
): Promise<Record<string, string | undefined>> {
    // The variable each provider's adapter reads its bearer from.
    const tokenVar = ACCESS_TOKEN_VAR[provider];
    if (!tokenVar) return env;

    // An explicit override is the caller's own strategy. Otherwise the SAME
    // factory the seam uses is reused, so one provider's credential can never
    // be produced by another's rules.
    const strategy =
        options.auth?.[provider] ??
        (provider === 'google_ads_keyword_planner'
            ? resolveGoogleAdsAuthStrategy(env, options.fetchImpl)
            : staticEnvToken(env, tokenVar));

    const token = await strategy.getAccessToken();
    if (!token) return env;

    // A COPY: no provider can read another's credential through this env.
    return { ...env, [tokenVar]: token };
}

/**
 * Invoke ONE provider's real adapter, after the seam has cleared it.
 *
 * The adapter decides its own request shape; this function only supplies the
 * window, the row cap and the injected transport. It never inspects a response
 * to decide success — the adapter's own envelope is the single authority, so the
 * two can never disagree about what Google returned.
 */
async function invokeProvider(
    provider: ProviderId,
    options: LiveCollectionOptions,
    ctx: { now: Date; runner: ProviderRunner; rowLimit: number; windowDays: number }
): Promise<AdapterRunResult<SearchIntelRecord>> {
    const { env, language, market, seeds, fetchImpl } = options;
    const adapterEnv = env ?? process.env;
    const endDate = isoDaysBefore(ctx.now, 0);
    // GSC's trailing edge is deliberately earlier than "today": Search Analytics
    // has a documented reporting lag, and the adapter applies its own
    // conservative floor on top of the `first_incomplete_date` Google reports.
    const startDate = isoDaysBefore(ctx.now, ctx.windowDays);

    // Resolved ONCE for this invocation and used by both the access path AND
    // the login id below: inferring them on separate lines let the two
    // disagree (inferred MANAGER path with no MANAGER id, so the CLIENT
    // account was read directly and a wrong-account success looked green).
    const resolvedGoogleAdsAccessPath =
        options.googleAdsAccessPath ??
        (adapterEnv.GOOGLE_ADS_LOGIN_CUSTOMER_ID ? 'MANAGER' : 'DIRECT');

    switch (provider) {
        case 'google_search_console':
            return collectGscSearchAnalytics(
                {
                    language,
                    market,
                    startDate,
                    // The requested window ends at the adapter's conservative lag
                    // floor, not at "today": Search Analytics has a documented
                    // reporting delay, and asking for a date the API has not
                    // finished processing returns rows that are still moving.
                    endDate: gscConservativeLagFloor(ctx.now),
                    rowLimit: ctx.rowLimit,
                },
                {
                    env: adapterEnv,
                    now: () => ctx.now,
                    ...(fetchImpl ? { fetchImpl } : {}),
                }
            );

        case 'google_ads_keyword_planner':
            return collectGoogleAdsKeywordIdeas(
                {
                    language,
                    market,
                    // Google Ads rejects an empty seed set outright, so the
                    // caller's seeds are required and never defaulted here:
                    // inventing a seed would fabricate a keyword we never asked
                    // about.
                    seeds,
                    limit: ctx.rowLimit,
                    // THE ACCESS MODEL IS DECLARED, NEVER GUESSED PER REQUEST.
                    //
                    // Google requires `login-customer-id` ONLY when a MANAGER
                    // account calls a CLIENT account, and sending it on a direct
                    // user call is wrong — it silently changes which account is
                    // read. So the path is resolved once, from configuration, and
                    // the adapter then sends exactly the headers that path needs.
                    // An explicit option wins; otherwise a configured
                    // `GOOGLE_ADS_LOGIN_CUSTOMER_ID` means MANAGER, which is the
                    // same inference the seam's probe uses, so the probe and this
                    // call cannot disagree.
                    //
                    // The login id travels with the resolved path itself, never
                    // with the option that selected it: an inferred MANAGER call
                    // without an id would hit the CLIENT account directly, and a
                    // DIRECT call carrying one would silently change the account.
                    accessPath: resolvedGoogleAdsAccessPath,
                    loginCustomerId:
                        resolvedGoogleAdsAccessPath === 'MANAGER'
                            ? adapterEnv.GOOGLE_ADS_LOGIN_CUSTOMER_ID
                            : undefined,
                },
                {
                    env: adapterEnv,
                    now: () => ctx.now.getTime(),
                    ...(fetchImpl ? { fetchImpl } : {}),
                }
            );

        case 'bing_web_search':
            return collectBingQueryStats(
                {
                    language,
                    market,
                    startDate,
                    endDate,
                    limit: ctx.rowLimit,
                },
                {
                    env: adapterEnv,
                    now: () => ctx.now,
                    ...(fetchImpl ? { fetchImpl } : {}),
                }
            );

        default:
            // Unreachable: LIVE_PROVIDER_IDS and this switch are kept in step,
            // and an unknown id is reported rather than silently dropped.
            throw new Error(
                `no live adapter is registered for provider "${provider}"`
            );
    }
}

/**
 * Collect from every live provider, for real.
 *
 * CONTRACT
 * --------
 * Returns one `ProviderOutcome` per entry in `LIVE_PROVIDER_IDS`, in that
 * order, ALWAYS the same length. A provider that throws is reported as FAILED
 * in its own slot rather than aborting the array, because a weekly run that
 * loses Bing's rows because Google errored would be a worse outcome than
 * reporting both honestly.
 *
 * NEVER THROWS. The weekly engine treats a thrown collector as a run-level
 * failure, and a single misbehaving third-party API must never be able to fail
 * the whole refresh — that is what makes PARTIAL_SUCCESS possible.
 *
 * ORDER MATTERS AND IS DELIBERATE
 * ------------------------------
 * Resolve BEFORE invoking. The seam's answer is authoritative about whether a
 * credential exists; calling the adapter first and inspecting the failure would
 * make the operator read an HTTP 401 when the real cause is an unset variable.
 */
export async function collectLiveProviders(
    options: LiveCollectionOptions
): Promise<ProviderOutcome[]> {
    const env = options.env ?? process.env;
    const now = options.now ? new Date(options.now()) : new Date();
    const runner = options.runner ?? new ProviderRunner();
    const ctx = {
        now,
        runner,
        rowLimit: options.rowLimit ?? DEFAULT_ROW_LIMIT,
        windowDays: options.windowDays ?? DEFAULT_INTELLIGENCE_WINDOW_DAYS,
    };

    const outcomes: ProviderOutcome[] = [];

    for (const provider of LIVE_PROVIDER_IDS) {
        // 1. RESOLVE. Delegated to the adapter's own validator through the
        //    seam, so the reason always names a variable that is really read.
        let resolution;
        try {
            resolution = await resolveProvider(
                {
                    provider,
                    language: options.language,
                    market: options.market,
                    seeds: options.seeds,
                },
                {
                    env,
                    // The GSC service-account strategy is injected HERE, through
                    // the documented extension point, so the seam and the GSC
                    // adapter remain unaware that service accounts exist.
                    ...(options.auth ? { auth: options.auth } : {}),
                    // Threaded so a strategy the seam builds for ITSELF — Google
                    // Ads' refresh-token exchange — uses this transport too,
                    // rather than silently reaching the real token endpoint
                    // behind the caller's back.
                    ...(options.fetchImpl ? { fetchImpl: options.fetchImpl } : {}),
                }
            );
        } catch (error) {
            // The seam itself faulted. Report it as this provider's failure and
            // keep going: the other providers are unaffected by it.
            outcomes.push({
                provider,
                status: 'FAILED',
                dataKind: 'unavailable',
                records: [],
                error: `provider resolution failed: ${
                    error instanceof Error ? error.message : String(error)
                }`,
                partial: false,
            });
            continue;
        }

        // 2. NOT INVOKABLE -> the exact blocked reason, verbatim.
        if (resolution.invokability !== 'INVOKABLE') {
            outcomes.push(blockedOutcome(provider, resolution.blocked));
            continue;
        }

        // 3. INVOKABLE -> call the real adapter, through the resilience runner.
        try {
            // The seam proved a live token EXISTS, but it does not hand the
            // value out (no-secret-egress is deliberate). The adapter still
            // needs one, so it is minted here and injected as the scoped
            // variable the adapter reads — never logged, never returned.
            //
            // Without this the adapter re-validates against the RAW env, finds
            // no `GSC_ACCESS_TOKEN` / `GOOGLE_ADS_ACCESS_TOKEN`, and returns
            // BLOCKED for a provider the seam had already cleared. That is the
            // "configured but still blocked" symptom in its purest form.
            const adapterEnv = await withResolvedTokens(env, provider, options);

            const run = await ctx.runner.run(provider, () =>
                invokeProvider(provider, { ...options, env: adapterEnv }, ctx)
            );

            if (!run.ok || !run.value) {
                // The runner never throws; a failure here is timeout, exhausted
                // retries, an open circuit, or a thrown adapter error.
                outcomes.push({
                    provider,
                    status: 'FAILED',
                    dataKind: 'unavailable',
                    records: [],
                    error:
                        run.error ??
                        `provider call failed after ${run.attempts.length} attempt(s)`,
                    partial: false,
                });
                continue;
            }

            // 4. Translate the adapter's own envelope. It is the sole authority
            //    on what the provider returned.
            outcomes.push(toProviderOutcome(provider, run.value, adapterEnv));
        } catch (error) {
            outcomes.push({
                provider,
                status: 'FAILED',
                dataKind: 'unavailable',
                records: [],
                error: `live collection failed: ${redactSecrets(
                    error instanceof Error ? error.message : String(error),
                    env
                )}`,
                partial: false,
            });
        }
    }

    return outcomes;
}

/**
 * A compact, secret-free summary of a collection, for the run log and the
 * refresh response.
 *
 * `records` counts are the honest evidence of what came back; `blockedReason`
 * is a truncated form of the operator-actionable cause. Only the DEPENDENCY name
 * is exposed, never a variable value, matching the seam's no-secret-egress rule.
 */
/* ------------------------------------------------------------------ */
/* Route seam                                                         */
/* ------------------------------------------------------------------ */

/**
 * The live collection, or a caller-supplied substitute.
 *
 * WHY THIS SEAM EXISTS
 * --------------------
 * `collectLiveProviders` performs REAL network requests to Google and Bing. A
 * route test that drives `POST /api/seo/refresh` must be able to substitute the
 * collection outright, or it would reach Google's servers with whatever
 * credentials happen to sit in the developer's `.env.local`: slow,
 * non-deterministic, and it would push a local credential to a third party
 * during a unit test.
 *
 * This is a deliberate seam, not a mock-friendly hack. The DEFAULT is the real
 * collector, so production always calls for real and a forgotten injection
 * shows up as a live call rather than as a silently skipped one. A route test
 * that wants to prove the wiring does so by injecting, and asserts the
 * collection happened by observing what it returned.
 */
let liveCollectorOverride: typeof collectLiveProviders | null = null;

/**
 * Substitute the live collection for the route. Pass `null` to restore the real
 * one. Returns a restore function so a test cannot leak its stub into the next.
 */
export function setLiveProviderCollector(
    collector: typeof collectLiveProviders | null
): () => void {
    const previous = liveCollectorOverride;
    liveCollectorOverride = collector;
    return () => {
        liveCollectorOverride = previous;
    };
}

/** What the route must call right now. The real one unless a test says otherwise. */
export function activeLiveProviderCollector(): typeof collectLiveProviders {
    return liveCollectorOverride ?? collectLiveProviders;
}
export function summariseLiveCollection(outcomes: ProviderOutcome[]): Array<{
    provider: string;
    status: string;
    dataKind: string;
    records: number;
    partial: boolean;
    blockedDependency: string | null;
    error: string | null;
}> {
    return outcomes.map((o) => {
        // The adapter writes `BLOCKED: missing <dependency> — <detail>`. Only the
        // dependency token is lifted out; the detail may quote a hostname.
        const match =
            typeof o.error === 'string'
                ? /^BLOCKED: missing ([^—]+?)(?:\s|$)/.exec(o.error)
                : null;
        return {
            provider: o.provider,
            status: o.status,
            dataKind: o.dataKind,
            records: Array.isArray(o.records) ? o.records.length : 0,
            partial: o.partial,
            blockedDependency: match ? match[1].trim() : null,
            error: o.error ?? null,
        };
    });
}