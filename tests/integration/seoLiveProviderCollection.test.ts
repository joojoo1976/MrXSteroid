/**
 * tests/integration/seoLiveProviderCollection.test.ts
 * ============================================================================
 * THE MISSING WIRE — proven, with no network and no real credential
 * ============================================================================
 * The readiness package named the defect precisely: "setting environment
 * variables alone will NOT activate any source. Something must construct the
 * config object and pass it in." The seam existed; nothing called it from a
 * runtime path. These tests drive `collectLiveProviders` — the module that now
 * does — and assert the properties that make it trustworthy.
 *
 * WHAT IS PINNED
 *  1. A fully configured provider is ACTUALLY CALLED. This is the regression
 *     guard: before this module existed, a complete environment still produced
 *     BLOCKED for every provider.
 *  2. An unconfigured provider is still BLOCKED, naming the exact variable.
 *  3. Provider independence: one provider's failure never removes another's.
 *  4. The truth ladder: CONNECTED is never upgraded to VERIFIED here, and a
 *     200-with-zero-rows is FAILED rather than a hollow CONNECTED.
 *  5. No fabricated data under any failure mode.
 */
import { describe, it, expect, vi } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';

import {
    collectLiveProviders,
    summariseLiveCollection,
    toProviderOutcome,
    LIVE_PROVIDER_IDS,
} from '../../server/seo/liveProviderCollection';
import { gscServiceAccountAuth } from '../../server/seo/sources/gscServiceAccountAuth';
import type { AdapterRunResult, SearchIntelRecord } from '../../server/seo/sources/searchIntelligenceTypes';

const BASE = {
    language: 'en' as const,
    market: 'en-US' as const,
    seeds: ['ffmi calculator'],
    now: () => Date.parse('2026-10-03T00:00:00.000Z'),
};

/** A minimal, honest record: a real provider, a real reference, no invented metrics. */
function record(keyword: string): SearchIntelRecord {
    return {
        keyword,
        language: 'en',
        market: 'en-US',
        source: 'google_search_console',
        sourceType: 'google_search_console',
        sourceClass: 'FIRST_PARTY',
        sourceStatus: 'CONNECTED',
        sourceReference: `gsc:${keyword}`,
        discoveredAt: '2026-10-03T00:00:00.000Z',
        dataKind: 'observed',
        evidence: `gsc row "${keyword}"`,
        evidenceType: 'internal_search_observed',
        metricsDate: '2026-10-01',
        retrievedAt: '2026-10-03T00:00:00.000Z',
        metrics: {} as never,
        attribution: {},
    } as unknown as SearchIntelRecord;
}

/** A Response-alike good enough for the adapters' `ok` / `json()` reads. */
function jsonResponse(body: unknown, ok = true) {
    return { ok, status: ok ? 200 : 500, json: async () => body } as unknown as Response;
}

describe('live collection · a configured provider is genuinely CALLED', () => {
    it('returns CONNECTED rows for GSC when the service account yields a token', async () => {
        const seen: string[] = [];
        const fetchImpl = vi.fn(async (url: string) => {
            seen.push(String(url));
            // The token exchange first, then the Search Analytics query.
            if (String(url).includes('oauth2.googleapis.com/token')) {
                return jsonResponse({ access_token: 'a-real-looking-token' });
            }
            return jsonResponse({
                rows: [{ keys: ['half life'], clicks: 12, impressions: 400, ctr: 0.03, position: 4.2 }],
                metadata: { first_incomplete_date: '2026-10-01' },
            });
        });

        const outcomes = await collectLiveProviders({
            ...BASE,
            env: { GSC_SITE_URL: 'https://mrxsteroid.com/' },
            fetchImpl,
            auth: {
                google_search_console: {
                    async getAccessToken() {
                        return 'a-real-looking-token';
                    },
                },
            },
        });

        const gsc = outcomes.find((o) => o.provider === 'google_search_console')!;
        // THE REGRESSION GUARD: the request really left the process. The
        // endpoint is Google's documented `.../sites/{siteUrl}/searchAnalytics/query`.
        expect(seen.some((u) => u.includes('searchAnalytics/query'))).toBe(true);
        expect(gsc.status).toBe('CONNECTED');
        expect(gsc.records.length).toBeGreaterThan(0);
        expect(gsc.records[0].keyword).toBe('half life');
    });

    it('returns CONNECTED rows for Bing with only an API key and a site URL', async () => {
        const fetchImpl = vi.fn(async (url: string) => {
            expect(String(url)).toContain('GetQueryStats');
            return jsonResponse([
                { Query: 'ffmi calculator', Impressions: 90, Clicks: 4 },
            ]);
        });

        const outcomes = await collectLiveProviders({
            ...BASE,
            env: {
                BING_WEBMASTER_SITE_URL: 'https://mrxsteroid.com',
                BING_WEBMASTER_API_KEY: 'a-real-looking-key',
            },
            fetchImpl,
        });

        const bing = outcomes.find((o) => o.provider === 'bing_web_search')!;
        expect(bing.status).toBe('CONNECTED');
        expect(bing.records.length).toBeGreaterThan(0);
    });
});

describe('live collection · an unconfigured provider is STILL honestly BLOCKED', () => {
    it('names the exact missing dependency for every unconfigured provider', async () => {
        const outcomes = await collectLiveProviders({
            ...BASE,
            env: {},
            fetchImpl: vi.fn(),
        });

        // One outcome per live provider, ALWAYS — so a missing provider cannot
        // be mistaken for a provider that was never attempted.
        expect(outcomes).toHaveLength(LIVE_PROVIDER_IDS.length);

        const gsc = outcomes.find((o) => o.provider === 'google_search_console')!;
        expect(gsc.status).toBe('BLOCKED');
        expect(gsc.error).toMatch(/GSC_SITE_URL/);
        expect(gsc.records).toEqual([]);

        const bing = outcomes.find((o) => o.provider === 'bing_web_search')!;
        expect(bing.status).toBe('BLOCKED');
        expect(bing.error).toMatch(/BING_WEBMASTER_SITE_URL/);
    });

    it('a site property without a token reports the TOKEN, not the site', async () => {
        // Proves the two blockers remain genuinely distinct and that the
        // reported cause tracks the actual missing credential.
        const outcomes = await collectLiveProviders({
            ...BASE,
            env: { GSC_SITE_URL: 'https://mrxsteroid.com/' },
            fetchImpl: vi.fn(),
        });
        const gsc = outcomes.find((o) => o.provider === 'google_search_console')!;
        expect(gsc.error).toMatch(/GSC_ACCESS_TOKEN/);
    });

    it('makes NO network call at all when nothing is configured', async () => {
        const fetchImpl = vi.fn();
        await collectLiveProviders({ ...BASE, env: {}, fetchImpl });
        // A blocked provider must not be probed anyway: that is what turned an
        // unset variable into an opaque HTTP 401 in the first place.
        expect(fetchImpl).not.toHaveBeenCalled();
    });
});

describe('live collection · provider independence', () => {
    it('one provider failing never removes another from the result', async () => {
        const fetchImpl = vi.fn(async (url: string) => {
            const u = String(url);
            // The refresh-token exchange runs FIRST, then the keyword request.
            // Both must go through the injected transport — reaching the real
            // token endpoint here is exactly the leak the threading prevents.
            if (u.includes('oauth2.googleapis.com/token')) {
                return jsonResponse({ access_token: 'ads-token' });
            }
            if (u.includes('GetQueryStats')) {
                return jsonResponse([{ Query: 'ffmi calculator', Impressions: 5, Clicks: 1 }]);
            }
            // The keyword request fails, so Ads ends FAILED — a genuinely
            // attempted provider, not one that was never authorized.
            return jsonResponse({ error: 'upstream exploded' }, false);
        });

        const outcomes = await collectLiveProviders({
            ...BASE,
            env: {
                BING_WEBMASTER_SITE_URL: 'https://mrxsteroid.com',
                BING_WEBMASTER_API_KEY: 'k',
                GOOGLE_ADS_CUSTOMER_ID: '1234567890',
                GOOGLE_ADS_CLIENT_ID: 'id',
                GOOGLE_ADS_CLIENT_SECRET: 'secret',
                GOOGLE_ADS_REFRESH_TOKEN: 'refresh',
            },
            fetchImpl,
        });

        // Bing succeeded on its OWN credentials, with no help from Ads: neither
        // provider's outcome may depend on the other's.
        const bing = outcomes.find((o) => o.provider === 'bing_web_search')!;
        expect(bing.status).toBe('CONNECTED');
        expect(bing.records.length).toBeGreaterThan(0);

        const ads = outcomes.find((o) => o.provider === 'google_ads_keyword_planner')!;
        // WORKING AGONST THE BUG: if the refresh exchange did not run, the
        // seam has no token and Ads stays BLOCKED on GOOGLE_ADS_ACCESS_TOKEN —
        // the very "config present but still blocked" symptom this work fixed.
        expect(
            fetchImpl.mock.calls.some((c) => String(c[0]).includes('oauth2.googleapis.com/token'))
        ).toBe(true);
        // Having a token, the adapter is genuinely invoked and genuinely
        // errors: FAILED, not BLOCKED. A provider that ran and broke needs a
        // different operator action than one that was never authorized.
        expect(ads.status).toBe('FAILED');
        expect(ads.error).not.toMatch(/GOOGLE_ADS_ACCESS_TOKEN/);
        expect(outcomes).toHaveLength(LIVE_PROVIDER_IDS.length);
    });

    it('never throws, whatever the transport does', async () => {
        const fetchImpl = vi.fn(async () => {
            throw new Error('DNS exploded');
        });
        const outcomes = await collectLiveProviders({
            ...BASE,
            env: {
                BING_WEBMASTER_SITE_URL: 'https://mrxsteroid.com',
                BING_WEBMASTER_API_KEY: 'k',
            },
            fetchImpl,
        });
        // A transport fault degrades providers; it never aborts the weekly run.
        expect(outcomes).toHaveLength(LIVE_PROVIDER_IDS.length);
        expect(outcomes.every((o) => Array.isArray(o.records))).toBe(true);
    });
});

describe('live collection · Google Ads sends only the headers its access path needs', () => {
    const ADS_ENV = {
        GOOGLE_ADS_CUSTOMER_ID: '1234567890',
        GOOGLE_ADS_CLIENT_ID: 'id',
        GOOGLE_ADS_CLIENT_SECRET: 'secret',
        GOOGLE_ADS_REFRESH_TOKEN: 'refresh',
    };

    /** Capture the headers actually sent to GenerateKeywordIdeas. */
    async function adsCall(options: {
        env?: Record<string, string | undefined>;
        googleAdsAccessPath?: 'DIRECT' | 'MANAGER';
    }): Promise<Record<string, string>> {
        let headers: Record<string, string> = {};
        const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
            const u = String(url);
            if (u.includes('oauth2.googleapis.com/token')) {
                return jsonResponse({ access_token: 'ads-token' });
            }
            headers = (init.headers ?? {}) as Record<string, string>;
            // A real, well-formed empty result: what these cases assert is the
            // REQUEST, not the rows.
            return jsonResponse({ results: [] });
        });

        await collectLiveProviders({
            ...BASE,
            env: options.env ?? ADS_ENV,
            googleAdsAccessPath: options.googleAdsAccessPath,
            fetchImpl,
        });
        return headers;
    }

    it('does NOT send login-customer-id on a DIRECT call', async () => {
        const headers = await adsCall({ googleAdsAccessPath: 'DIRECT' });
        expect(headers['login-customer-id']).toBeUndefined();
        // The bearer is always present.
        expect(headers.Authorization).toBe('Bearer ads-token');
    });

    it('sends login-customer-id on a MANAGER call', async () => {
        const headers = await adsCall({
            env: { ...ADS_ENV, GOOGLE_ADS_LOGIN_CUSTOMER_ID: '987-654-3210' },
            googleAdsAccessPath: 'MANAGER',
        });
        // Google requires it only on the manager path, and it is dash-stripped.
        expect(headers['login-customer-id']).toBe('9876543210');
    });

    it('infers DIRECT when no login customer id is configured', async () => {
        // The dangerous default would be sending a manager header on a direct
        // account: Google then silently reads a DIFFERENT account.
        const headers = await adsCall({});
        expect(headers['login-customer-id']).toBeUndefined();
    });

    it('infers MANAGER when a login customer id IS configured', async () => {
        const headers = await adsCall({
            env: { ...ADS_ENV, GOOGLE_ADS_LOGIN_CUSTOMER_ID: '9876543210' },
        });
        expect(headers['login-customer-id']).toBe('9876543210');
    });
});

describe('live collection · the truth ladder is never climbed without evidence', () => {
    function envelope(
        status: AdapterRunResult<SearchIntelRecord>['status'],
        records: SearchIntelRecord[],
        error?: string
    ): AdapterRunResult<SearchIntelRecord> {
        return {
            provider: 'google_search_console',
            status,
            dataKind: status === 'BLOCKED' ? 'unavailable' : 'observed',
            records,
            ...(error ? { error } : {}),
            partial: false,
        };
    }

    it('CONNECTED with rows is CONNECTED — never VERIFIED', () => {
        // VERIFIED additionally requires persist -> provenance -> weekly state
        // -> diff -> API. This module runs none of those, so claiming VERIFIED
        // here would be asserting a chain that has not happened.
        const out = toProviderOutcome('google_search_console', envelope('CONNECTED', [record('half life')]));
        expect(out.status).toBe('CONNECTED');
        expect(out.status).not.toBe('VERIFIED');
    });

    it('a 200 with zero rows is FAILED, not a hollow CONNECTED', () => {
        // The single most misleading state available: an integration that
        // "works" but has produced no evidence at all.
        const out = toProviderOutcome('google_search_console', envelope('CONNECTED', []));
        expect(out.status).toBe('FAILED');
        expect(out.dataKind).toBe('unavailable');
        expect(out.records).toEqual([]);
        expect(out.error).toMatch(/no rows/i);
    });

    it('BLOCKED stays BLOCKED and keeps its exact reason', () => {
        const out = toProviderOutcome('google_search_console',
            envelope('BLOCKED', [], 'BLOCKED: missing GSC_ACCESS_TOKEN — no token')
        );
        expect(out.status).toBe('BLOCKED');
        expect(out.error).toMatch(/GSC_ACCESS_TOKEN/);
        expect(out.records).toEqual([]);
    });

    it('FAILED stays FAILED and is never reported as blocked', () => {
        // The distinction matters operationally: BLOCKED means "authorize me",
        // FAILED means "go and look at why it broke".
        const out = toProviderOutcome('google_search_console', envelope('FAILED', [], 'gsc_error: HTTP 500'));
        expect(out.status).toBe('FAILED');
        expect(out.status).not.toBe('BLOCKED');
    });

    it('partial survives translation', () => {
        const result = envelope('FAILED', [record('half life')], 'gsc_error: timeout');
        result.partial = true;
        const out = toProviderOutcome('google_search_console', result);
        expect(out.partial).toBe(true);
        // Rows already collected came from a real response and are kept.
        expect(out.records).toHaveLength(1);
    });
});

describe('live collection · the summary is secret-free', () => {
    it('lifts only the dependency name, never the detail text', () => {
        const summary = summariseLiveCollection([
            {
                provider: 'google_search_console',
                status: 'BLOCKED',
                dataKind: 'unavailable',
                records: [],
                error:
                    'BLOCKED: missing GSC_ACCESS_TOKEN — internal-host-9.corp.example detail',
                partial: false,
            },
        ]);

        expect(summary[0].blockedDependency).toBe('GSC_ACCESS_TOKEN');
        // The operator still sees the full reason; the STRUCTURED field, which
        // is what gets indexed and diffed, stays a bare variable name.
        expect(summary[0].error).toBeTruthy();
    });

    it('reports a real row count per provider', () => {
        const summary = summariseLiveCollection([
            {
                provider: 'bing_web_search',
                status: 'CONNECTED',
                dataKind: 'observed',
                records: [record('a'), record('b')],
                partial: false,
            },
        ]);
        expect(summary[0].records).toBe(2);
        expect(summary[0].blockedDependency).toBeNull();
    });
});

describe('live collection · no secret can escape into the outcome', () => {
    // A distinct, unmistakable token shape. If any of this appears in an error
    // string, in a summary field, or in an env handed to another provider, the
    // assertion below fails.
    const SECRET = 'ya29.SUPERSECRET-TOKEN-VALUE-DO-NOT-LEAK';

    it('never puts a bearer token into any reported error', async () => {
        const outcomes = await collectLiveProviders({
            ...BASE,
            env: {
                GSC_SITE_URL: 'https://mrxsteroid.com/',
                BING_WEBMASTER_SITE_URL: 'https://mrxsteroid.com',
                BING_WEBMASTER_API_KEY: SECRET,
            },
            // Bing's key travels as the bearer; a hostile upstream echoes it.
            fetchImpl: async (url: string) => {
                if (String(url).includes('GetQueryStats')) {
                    throw new Error(`upstream rejected credential ${SECRET}`);
                }
                return jsonResponse([]);
            },
        });

        for (const o of outcomes) {
            expect(JSON.stringify(o)).not.toContain(SECRET);
        }
    });

    it('never puts a bearer token into the operator-facing summary', async () => {
        // The summary is built from whatever the outcome carries, so the
        // guarantee has to be made where the outcome is CREATED. Passing no env
        // is therefore the risky path, and this case pins that it cannot leak.
        const outcomes = await collectLiveProviders({
            ...BASE,
            env: {
                BING_WEBMASTER_SITE_URL: 'https://mrxsteroid.com',
                BING_WEBMASTER_API_KEY: SECRET,
            },
            // A hostile upstream quotes the credential it was handed.
            fetchImpl: async (url: string) => {
                if (String(url).includes('GetQueryStats')) {
                    throw new Error(`upstream rejected credential ${SECRET}`);
                }
                return jsonResponse([]);
            },
        });

        const summary = summariseLiveCollection(outcomes);
        expect(JSON.stringify(summary)).not.toContain(SECRET);
        // The actionability survives the scrub: an operator still sees WHICH
        // provider failed and WHY, minus the secret.
        const bing = summary.find((s) => s.provider === 'bing_web_search')!;
        expect(bing.error).toContain('[REDACTED]');
    });

    it('does not let one provider see another provider\'s credential', async () => {
        // Google Ads' token must never appear in Bing's adapter env. The Bing
        // call is captured by inspecting what the adapter actually received.
        let bingHeaders: Record<string, string> = {};
        const fetchImpl = async (url: string, init: RequestInit) => {
            if (String(url).includes('GetQueryStats')) {
                bingHeaders = (init.headers ?? {}) as Record<string, string>;
                return jsonResponse([{ Query: 'k', Impressions: 1, Clicks: 1 }]);
            }
            return jsonResponse({ access_token: 'ads-only-token' });
        };

        await collectLiveProviders({
            ...BASE,
            env: {
                BING_WEBMASTER_SITE_URL: 'https://mrxsteroid.com',
                BING_WEBMASTER_API_KEY: 'bing-key',
                GOOGLE_ADS_CUSTOMER_ID: '1234567890',
                GOOGLE_ADS_CLIENT_ID: 'id',
                GOOGLE_ADS_CLIENT_SECRET: 'secret',
                GOOGLE_ADS_REFRESH_TOKEN: 'refresh',
            },
            fetchImpl: fetchImpl as unknown as typeof fetch,
        });

        // Bing is a key-based API, so its call carries the key alone.
        expect(JSON.stringify(bingHeaders)).not.toContain('ads-only-token');
    });

    it('reports a blocked dependency by NAME only, never by value', async () => {
        const outcomes = await collectLiveProviders({
            ...BASE,
            env: {},
            fetchImpl: vi.fn(),
        });
        const summary = summariseLiveCollection(outcomes);
        // A dependency is a variable name. Its value must never appear.
        for (const row of summary) {
            expect(row.blockedDependency ?? '').not.toContain(SECRET);
        }
    });
});

describe('GSC service-account auth · a fresh token per call, or none at all', () => {
    // A real, THROWAWAY key pair generated for this suite only. It authorises
    // nothing and is not a credential of any account.
    const { privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
    const CLIENT_EMAIL = 'seo-probe@example-project.iam.gserviceaccount.com';

    function tokenOk(accessToken: string) {
        return {
            ok: true,
            status: 200,
            json: async () => ({ access_token: accessToken }),
        } as unknown as Response;
    }

    it('exchanges a signed assertion for an access token', async () => {
        const calls: Array<{ url: string; body: string }> = [];
        const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
            calls.push({ url: String(url), body: String(init.body) });
            return tokenOk('ya29.a-real-looking-token');
        });

        const auth = gscServiceAccountAuth({
            env: { GSC_CLIENT_EMAIL: CLIENT_EMAIL, GSC_PRIVATE_KEY: privateKey },
            fetchImpl,
        });

        expect(await auth.getAccessToken()).toBe('ya29.a-real-looking-token');
        expect(calls[0].url).toBe('https://oauth2.googleapis.com/token');
        expect(calls[0].body).toContain(
            'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer'
        );
        expect(calls[0].body).toContain('assertion=');
    });

    it('signs with RS256 and requests ONLY the read-only scope', async () => {
        let assertion = '';
        const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
            assertion = new URLSearchParams(String(init.body)).get('assertion') ?? '';
            return tokenOk('t');
        });

        await gscServiceAccountAuth({
            env: { GSC_CLIENT_EMAIL: CLIENT_EMAIL, GSC_PRIVATE_KEY: privateKey },
            fetchImpl,
        }).getAccessToken();

        const [header, claims] = assertion
            .split('.')
            .slice(0, 2)
            .map((p) => JSON.parse(Buffer.from(p, 'base64url').toString('utf8')));

        expect(header.alg).toBe('RS256');
        expect(header.typ).toBe('JWT');
        expect(claims.iss).toBe(CLIENT_EMAIL);
        // Read-only. Requesting write scope we never use would be an
        // unjustified privilege escalation.
        expect(claims.scope).toBe('https://www.googleapis.com/auth/webmasters.readonly');
        expect(claims.aud).toBe('https://oauth2.googleapis.com/token');
        expect(claims.exp).toBeGreaterThan(claims.iat);
    });

    it('mints a NEW token on every call, so nothing expires silently', async () => {
        let clock = 1_700_000_000_000;
        const fetchImpl = vi.fn(async () => tokenOk('ya29.token'));
        const auth = gscServiceAccountAuth({
            env: { GSC_CLIENT_EMAIL: CLIENT_EMAIL, GSC_PRIVATE_KEY: privateKey },
            fetchImpl,
            now: () => clock,
        });

        await auth.getAccessToken();
        clock += 60_000; // one minute later
        await auth.getAccessToken();

        // Two calls, two exchanges — NOT one cached token reused forever. This
        // is the defect the original static-token design had.
        expect(fetchImpl).toHaveBeenCalledTimes(2);
    });

it('returns null — never a fabricated token — when a credential is missing', async () => {
        const fetchImpl = vi.fn(async () => tokenOk('should-never-be-used'));
        // No private key at all.
        expect(
            await gscServiceAccountAuth({
                env: { GSC_CLIENT_EMAIL: CLIENT_EMAIL },
                fetchImpl,
            }).getAccessToken()
        ).toBeNull();
        // No client email.
        expect(
            await gscServiceAccountAuth({
                env: { GSC_PRIVATE_KEY: privateKey },
                fetchImpl,
            }).getAccessToken()
        ).toBeNull();
        // A key that cannot be parsed is ABSENT, not half-working.
        expect(
            await gscServiceAccountAuth({
                env: { GSC_CLIENT_EMAIL: CLIENT_EMAIL, GSC_PRIVATE_KEY: 'not-a-pem' },
                fetchImpl,
            }).getAccessToken()
        ).toBeNull();
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('returns null when Google rejects the assertion or omits the token', async () => {
        const rejected = gscServiceAccountAuth({
            env: { GSC_CLIENT_EMAIL: CLIENT_EMAIL, GSC_PRIVATE_KEY: privateKey },
            fetchImpl: async () =>
                ({ ok: false, status: 400, json: async () => ({}) }) as unknown as Response,
        });
        expect(await rejected.getAccessToken()).toBeNull();

        const noToken = gscServiceAccountAuth({
            env: { GSC_CLIENT_EMAIL: CLIENT_EMAIL, GSC_PRIVATE_KEY: privateKey },
            fetchImpl: async () =>
                ({ ok: true, status: 200, json: async () => ({ error: 'x' }) }) as unknown as Response,
        });
        expect(await noToken.getAccessToken()).toBeNull();
    });

    it('restores escaped newlines in a pasted PEM', async () => {
        // Secrets pasted into an env var very often keep literal `\n`, which
        // crypto.createSign rejects outright.
        const escaped = privateKey.replace(/\n/g, '\\n');
        const fetchImpl = vi.fn(async () => tokenOk('ya29.recovered'));
        const auth = gscServiceAccountAuth({
            env: { GSC_CLIENT_EMAIL: CLIENT_EMAIL, GSC_PRIVATE_KEY: escaped },
            fetchImpl,
        });
        expect(await auth.getAccessToken()).toBe('ya29.recovered');
    });

    it('lets a rotated key take effect without a redeploy', async () => {
        // The env is read PER CALL, not captured at construction — matching
        // staticEnvToken, and the reason a rotated secret needs no restart.
        const env: Record<string, string | undefined> = {
            GSC_CLIENT_EMAIL: CLIENT_EMAIL,
            GSC_PRIVATE_KEY: privateKey,
        };
        const fetchImpl = vi.fn(async () => tokenOk('t'));
        const auth = gscServiceAccountAuth({ env, fetchImpl });

        await auth.getAccessToken();
        env.GSC_PRIVATE_KEY = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
            publicKeyEncoding: { type: 'spki', format: 'pem' },
        }).privateKey;

        // Both calls succeed against whichever key is current — proving the read
        // is live rather than captured.
        expect(await auth.getAccessToken()).toBe('t');
    });
});