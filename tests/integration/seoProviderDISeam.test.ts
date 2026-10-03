/**
 * tests/integration/seoProviderDISeam.test.ts
 * ============================================================================
 * RUNTIME PROOF for the DI SEAM (Phase 2, step 1)
 * ============================================================================
 * Asserts the real chain the seam exists to provide:
 *
 *     process.env -> validated config -> provider env object
 *                 -> adapter invocation -> BLOCKED / INVOKABLE
 *
 * For EVERY provider, both states are tested:
 *   - missing configuration  => BLOCKED + an EXACT dependency name
 *   - complete configuration => INVOKABLE (NOT verified, NOT connected)
 *
 * Two rules get the most attention, because they are the ones that would make
 * this seam quietly lie:
 *
 *   CONFIGURED != CONNECTED != VERIFIED
 *       A complete environment must never produce a VERIFIED or CONNECTED
 *       verdict. Configuration is the absence of a reason to refuse, nothing more.
 *
 *   NO SECRET EGRESS
 *       No returned object may contain a token value, and no env var outside a
 *       provider's own list may be read on its behalf.
 *
 * NO FAKE CREDENTIALS PRODUCE VERIFICATION. The "complete configuration" tests
 * use obviously synthetic placeholders and assert only INVOKABLE.
 */
import { describe, it, expect } from 'vitest';

import {
    PROVIDER_IDS,
    PROVIDER_ENV_VARS,
    ALL_SEAM_ENV_VARS,
    STRUCTURAL_BLOCKERS,
    resolveProvider,
    resolveAllProviders,
    describeProviderConfig,
    staticEnvToken,
    guardedAuth,
    noAuth,
    isScheduleRequestAuthorised,
    type ProviderId,
} from '../../server/seo/sources/providerEnvironment';

/** Obviously synthetic. Never a real credential, never a real secret. */
const FAKE = {
    GSC_SITE_URL: 'https://example.invalid/',
    GSC_ACCESS_TOKEN: 'synthetic-gsc-token-not-real',
    GOOGLE_ADS_DEVELOPER_TOKEN: 'synthetic-dev-token-not-real',
    GOOGLE_ADS_CUSTOMER_ID: '0000000000',
    GOOGLE_ADS_ACCESS_TOKEN: 'synthetic-ads-token-not-real',
    BING_WEBMASTER_SITE_URL: 'https://example.invalid',
    BING_WEBMASTER_API_KEY: 'synthetic-bing-key-not-real',
};

const probe = (provider: ProviderId) =>
    ({ provider, language: 'en' as const, market: 'en-US' as const });

/** Providers that have a credential validator to exercise. */
const CREDENTIAL_PROVIDERS: ProviderId[] = [
    'google_search_console',
    'google_ads_keyword_planner',
    'bing_web_search',
];

describe('DI seam · missing configuration => BLOCKED with an EXACT reason', () => {
    it.each(CREDENTIAL_PROVIDERS)(
        '%s names the first missing variable, not a vague error',
        async (provider) => {
            const result = await resolveProvider(probe(provider), { env: {} });

            expect(result.invokability).toBe('BLOCKED');
            expect(result.blocked).not.toBeNull();
            // The dependency must be a real variable name from the contract.
            expect(PROVIDER_ENV_VARS[provider]).toContain(result.blocked!.dependency);
            expect(result.blocked!.detail.length).toBeGreaterThan(20);
            expect(result.tokenPresent).toBe(false);
        }
    );

    it.each([
        ['google_search_console', 'GSC_SITE_URL', 'site_property'],
        ['google_search_console', 'GSC_ACCESS_TOKEN', 'oauth_token'],
        // GOOGLE_ADS_DEVELOPER_TOKEN is deliberately ABSENT from this table.
        // Google sunset developer tokens on 2026-09-09 and the API servers
        // ignore the header, so removing it must NOT produce a BLOCKED verdict.
        // Its absence is asserted separately below.
        ['google_ads_keyword_planner', 'GOOGLE_ADS_CUSTOMER_ID', 'customer_id'],
        ['google_ads_keyword_planner', 'GOOGLE_ADS_ACCESS_TOKEN', 'oauth_token'],
        ['bing_web_search', 'BING_WEBMASTER_SITE_URL', 'site_property'],
        ['bing_web_search', 'BING_WEBMASTER_API_KEY', 'env_var'],
    ] as Array<[ProviderId, string, string]>)(
        '%s blocks on exactly %s',
        async (provider, missingVar, kind) => {
            // Everything EXCEPT the one variable under test.
            const env: Record<string, string> = { ...FAKE };
            delete env[missingVar as keyof typeof FAKE];

            const result = await resolveProvider(probe(provider), { env });

            expect(result.invokability).toBe('BLOCKED');
            expect(result.blocked!.dependency).toBe(missingVar);
            expect(result.blocked!.kind).toBe(kind);
        }
    );
});

describe('DI seam · complete configuration => INVOKABLE (never VERIFIED)', () => {
    it.each(CREDENTIAL_PROVIDERS)('%s becomes INVOKABLE', async (provider) => {
        const result = await resolveProvider(probe(provider), { env: { ...FAKE } });

        expect(result.invokability).toBe('INVOKABLE');
        expect(result.blocked).toBeNull();
        expect(result.tokenPresent).toBe(true);
    });

    it('Google Ads is INVOKABLE with NO developer token (retired 2026-09-09)', async () => {
        // REGRESSION GUARD. Google: "You can continue sending developer tokens
        // in your API call headers, but this is optional and ignored by the API
        // servers." Requiring it would send an operator to a deprecated API
        // Center for a credential that grants nothing.
        const env: Record<string, string> = {
            GOOGLE_ADS_CUSTOMER_ID: '1234567890',
            GOOGLE_ADS_ACCESS_TOKEN: 'synthetic-not-real',
        };
        expect(env.GOOGLE_ADS_DEVELOPER_TOKEN).toBeUndefined();

        const result = await resolveProvider(probe('google_ads_keyword_planner'), { env });

        expect(result.invokability).toBe('INVOKABLE');
        expect(result.blocked).toBeNull();
    });

    it.each(CREDENTIAL_PROVIDERS)(
        '%s is NOT reported as CONNECTED or VERIFIED by configuration alone',
        async (provider) => {
            const result = await resolveProvider(probe(provider), { env: { ...FAKE } });
            // The whole point of the state split: a complete environment states
            // something about configuration, never about a successful request.
            expect(result.invokability).not.toBe('VERIFIED');
            expect(result.invokability).not.toBe('CONNECTED');
            expect(Object.keys(result)).not.toContain('evidence');
        }
    );
});

describe('DI seam · provider independence', () => {
    it('GSC config does not make Google Ads invokable', async () => {
        const gscOnly = {
            GSC_SITE_URL: FAKE.GSC_SITE_URL,
            GSC_ACCESS_TOKEN: FAKE.GSC_ACCESS_TOKEN,
        };
        const ads = await resolveProvider(probe('google_ads_keyword_planner'), { env: gscOnly });

        // Google Ads must still name ITS OWN missing dependency. Since the
        // developer token was retired on 2026-09-09 it is no longer a gate, so
        // the first real blocker is the customer id.
        expect(ads.invokability).toBe('BLOCKED');
        expect(ads.blocked!.dependency).toBe('GOOGLE_ADS_CUSTOMER_ID');
    });

    it('Bing config does not make GSC invokable', async () => {
        const bingOnly = {
            BING_WEBMASTER_SITE_URL: FAKE.BING_WEBMASTER_SITE_URL,
            BING_WEBMASTER_API_KEY: FAKE.BING_WEBMASTER_API_KEY,
        };
        const gsc = await resolveProvider(probe('google_search_console'), { env: bingOnly });
        expect(gsc.invokability).toBe('BLOCKED');
        expect(gsc.blocked!.dependency).toBe('GSC_SITE_URL');
    });

    it('a structurally blocked provider stays blocked with a COMPLETE env', async () => {
        // Trends has no credential that can help it. A full environment must not
        // change that, or a credential would appear to have "unblocked" it.
        const result = await resolveProvider(probe('google_trends'), { env: { ...FAKE } });
        expect(result.invokability).toBe('STRUCTURALLY_BLOCKED');
        expect(result.blocked!.kind).toBe('no_public_api');
    });

    it('reports each provider independently, with no cross-contamination', async () => {
        const all = await resolveAllProviders({ env: { ...FAKE } });
        expect(all).toHaveLength(PROVIDER_IDS.length);

        const gsc = all.find((r) => r.provider === 'google_search_console')!;
        const ads = all.find((r) => r.provider === 'google_ads_keyword_planner')!;
        const trends = all.find((r) => r.provider === 'google_trends')!;

        expect(gsc.invokability).toBe('INVOKABLE');
        expect(ads.invokability).toBe('INVOKABLE');
        expect(trends.invokability).toBe('STRUCTURALLY_BLOCKED');
        // GSC succeeding did not change Trends' reason.
        expect(trends.blocked!.dependency).toBe(STRUCTURAL_BLOCKERS.google_trends!.dependency);
    });
});

describe('DI seam · auth lifecycle (tokens expire)', () => {
    it('asks the strategy on EVERY call, so a refreshed token is picked up', async () => {
        const env: Record<string, string | undefined> = { ROTATING: 'first-token' };
        const strategy = staticEnvToken(env, 'ROTATING');

        expect(await strategy.getAccessToken()).toBe('first-token');
        // A rotation is visible without rebuilding the strategy.
        env.ROTATING = 'second-token';
        expect(await strategy.getAccessToken()).toBe('second-token');
    });

    it('an expired/withdrawn token yields null => BLOCKED, not a crash', async () => {
        const strategy = guardedAuth(async () => null);
        expect(await strategy.getAccessToken()).toBeNull();

        const result = await resolveProvider(probe('google_search_console'), {
            env: { ...FAKE },
            auth: { google_search_console: strategy },
        });
        // Token gone => the honest BLOCKED state, naming the token dependency.
        expect(result.invokability).toBe('BLOCKED');
        expect(result.blocked!.dependency).toBe('GSC_ACCESS_TOKEN');
        expect(result.blocked!.kind).toBe('oauth_token');
        expect(result.tokenPresent).toBe(false);
    });

    it('an auth backend that THROWS fails closed rather than faking a token', async () => {
        const strategy = guardedAuth(async () => {
            throw new Error('secret store unreachable at internal-host-1234');
        });
        const result = await resolveProvider(probe('google_search_console'), {
            env: { ...FAKE },
            auth: { google_search_console: strategy },
        });

        expect(result.invokability).toBe('BLOCKED');
        expect(result.tokenPresent).toBe(false);
        // The internal detail must not leak into the reported reason.
        expect(result.blocked!.detail).not.toContain('internal-host-1234');
    });

    it('noAuth() keeps a credential-less provider blocked', async () => {
        expect(await noAuth().getAccessToken()).toBeNull();
    });

    it('a real renewing strategy upgrades the provider with no adapter change', async () => {
        // This is the seam's purpose: swapping the strategy is the ONLY change
        // needed to support token refresh.
        const renewed = guardedAuth(async () => 'freshly-renewed-token');
        const result = await resolveProvider(probe('google_search_console'), {
            env: { GSC_SITE_URL: FAKE.GSC_SITE_URL },
            auth: { google_search_console: renewed },
        });
        expect(result.invokability).toBe('INVOKABLE');
    });
});

describe('DI seam · CRON_SECRET is NOT a provider credential', () => {
    it('authorises the schedule with a constant-time compare', () => {
        expect(isScheduleRequestAuthorised('s3cret', 's3cret')).toBe(true);
        expect(isScheduleRequestAuthorised('wrong', 's3cret')).toBe(false);
        expect(isScheduleRequestAuthorised(null, 's3cret')).toBe(false);
        // An unset expected secret must never authorise.
        expect(isScheduleRequestAuthorised('anything', undefined)).toBe(false);
    });

    it('is absent from every provider dependency list', () => {
        for (const provider of PROVIDER_IDS) {
            expect(PROVIDER_ENV_VARS[provider]).not.toContain('CRON_SECRET');
        }
        expect(ALL_SEAM_ENV_VARS).not.toContain('CRON_SECRET');
    });

    it('a valid schedule secret does not make any provider invokable', async () => {
        const all = await resolveAllProviders({ env: { ...FAKE, CRON_SECRET: 's3cret' } });
        for (const r of all) {
            // The schedule secret must not leak into any provider's verdict...
            expect(r.blocked?.dependency ?? '').not.toContain('CRON_SECRET');
            // ...nor into the provider-scoped env of any provider.
            expect(r.envVarsConsulted).not.toContain('CRON_SECRET');
        }
    });
});

describe('DI seam · Supabase boundary is server-only', () => {
    it('guards against client bundling via node: builtins (repo convention)', async () => {
        const fs = await import('node:fs');
        const source = fs.readFileSync('server/seo/sources/serviceRoleBoundary.ts', 'utf8');
        // The guard must be REAL: a node: builtin import plus a window check.
        // The `server-only` package is intentionally not used — it is not a
        // dependency of this project, and the repo already guards server modules
        // this way in server/translation/googleProvider.ts.
        expect(source).toMatch(/from 'node:crypto'/);
        expect(source).toMatch(/typeof window !== 'undefined'/);
        expect(source).not.toMatch(/^import 'server-only';/m);
    });

    it('never returns or logs the service role key', async () => {
        const { hasServiceRoleKey, redact } = await import(
            '../../server/seo/sources/serviceRoleBoundary'
        );
        // Only a boolean is exposed, so no call site can disclose the value.
        expect(typeof hasServiceRoleKey()).toBe('boolean');
        expect(redact('super-secret-value')).toBe('***redacted***');
        expect(redact(undefined)).toBe('(unset)');
    });
});


describe('DI seam · no secret egress', () => {
    it('the report contains variable NAMES but no token values', async () => {
        const all = await resolveAllProviders({ env: { ...FAKE } });
        const serialised = JSON.stringify(describeProviderConfig(all));

        for (const value of Object.values(FAKE)) {
            expect(serialised).not.toContain(value);
        }
        // Names are present, which is what an operator actually needs.
        expect(serialised).toContain('GSC_SITE_URL');
    });

    it('only the declared env vars are read for a provider', async () => {
        const gsc = await resolveProvider(probe('google_search_console'), { env: { ...FAKE } });
        expect([...gsc.envVarsConsulted].sort()).toEqual(
            [...PROVIDER_ENV_VARS.google_search_console].sort()
        );
    });

    it('the seam declares every variable it reads', () => {
        // If a variable were added to a provider list but not the global
        // manifest, it would become invisible. This pins the two together.
        const fromProviders = [
            ...new Set(PROVIDER_IDS.flatMap((p) => PROVIDER_ENV_VARS[p])),
        ].sort();
        expect([...ALL_SEAM_ENV_VARS].sort()).toEqual(fromProviders);
    });
});

