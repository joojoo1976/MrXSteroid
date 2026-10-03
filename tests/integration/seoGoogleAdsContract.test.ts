/**
 * tests/integration/seoGoogleAdsContract.test.ts
 * ============================================================================
 * Google Ads API CONTRACT — repaired against official docs, NO live request
 * ============================================================================
 * ORIGIN OF THIS FILE
 * --------------------
 * The Readiness Package listed `GOOGLE_ADS_DEVELOPER_TOKEN` as required. That
 * came from OUR code, not from Google. Checking the official documentation
 * (retrieved 2026-09-30) showed it was wrong and would have sent the owner to
 * the deprecated API Center for a token that grants nothing.
 *
 * VERIFIED AGAINST OFFICIAL DOCUMENTATION
 * ---------------------------------------
 *  1. "We sunset developer tokens on September 9, 2026."
 *  2. "You can continue sending developer tokens in your API call headers, but
 *      this is optional and ignored by the API servers."
 *  3. API access levels now belong to the GOOGLE CLOUD PROJECT that owns the
 *     OAuth credentials; signup happens in the Cloud Console.
 *  4. A Google Ads MANAGER ACCOUNT is no longer required.
 *  5. `login-customer-id` is required ONLY when a MANAGER calls a CLIENT
 *     account — and must NOT be sent for direct user access.
 *  6. The current REST version is v25.
 *
 * Every test below pins a REPAIR. No live Google request is made, and no
 * credential is used — the fake fetch is injected and never leaves the process.
 */
import { describe, it, expect, vi } from 'vitest';

import {
    GOOGLE_ADS_API_VERSION,
    GOOGLE_ADS_CUSTOMERS_ENDPOINT,
    GOOGLE_ADS_DEVELOPER_TOKEN_POLICY,
    GOOGLE_ADS_DESCRIPTOR,
    buildGoogleAdsHeaders,
    buildGenerateKeywordIdeaRequest,
    collectGoogleAdsKeywordIdeas,
    resolveGoogleAdsBlocked,
    googleAdsRefreshTokenAuth,
    resolveGoogleAdsAuthStrategy,
    clearGoogleAdsCache,
} from '../../server/seo/sources/googleAdsAdapter';
import { resolveProvider } from '../../server/seo/sources/providerEnvironment';

const probe = {
    provider: 'google_ads_keyword_planner' as const,
    language: 'en' as const,
    market: 'en-US' as const,
};

/** Complete DIRECT-flow config with NO developer token, which is now correct. */
const NO_DEV_TOKEN = {
    GOOGLE_ADS_CUSTOMER_ID: '1234567890',
    GOOGLE_ADS_ACCESS_TOKEN: 'synthetic-access-token-not-real',
};

describe('Google Ads · REPAIR 1 — API target is v25 with no v19 fallback', () => {
    it('targets v25', () => {
        expect(GOOGLE_ADS_API_VERSION).toBe('v25');
        expect(GOOGLE_ADS_CUSTOMERS_ENDPOINT).toBe(
            'https://googleads.googleapis.com/v25/customers/{customerId}'
        );
    });

    it('no v19 reference survives in CODE (comments may cite it historically)', async () => {
        const fs = await import('node:fs');
        const source = fs.readFileSync('server/seo/sources/googleAdsAdapter.ts', 'utf8');
        // Comments legitimately mention v19 to explain the upgrade. What must
        // not survive is v19 in anything executable: a silent fallback would send
        // traffic to a version we no longer believe matches the contract.
        const code = source
            .split('\n')
            .filter((line) => !line.trim().startsWith('*') && !line.trim().startsWith('//'))
            .join('\n');
        expect(code).not.toMatch(/v19/);
    });
});

describe('Google Ads · REPAIR 2 — developer token is optional, never a gate', () => {
    it('complete config WITHOUT a developer token is not BLOCKED', async () => {
        const r = await resolveProvider(probe, { env: { ...NO_DEV_TOKEN } });
        expect(r.invokability).toBe('INVOKABLE');
        expect(r.blocked).toBeNull();
    });

    it('the reason is never the developer token', async () => {
        // A missing customer id is reported instead — the TRUE next blocker.
        const r = await resolveProvider(probe, {
            env: { GOOGLE_ADS_ACCESS_TOKEN: 'synthetic-not-real' },
        });
        expect(r.blocked!.dependency).toBe('GOOGLE_ADS_CUSTOMER_ID');
        expect(r.blocked!.dependency).not.toBe('GOOGLE_ADS_DEVELOPER_TOKEN');
    });

    it('the validator returns null with no developer token present', () => {
        expect(
            resolveGoogleAdsBlocked(
                { language: 'en', market: 'en-US', seeds: ['probe'] },
                NO_DEV_TOKEN
            )
        ).toBeNull();
    });

    it('the descriptor no longer lists the token as required', () => {
        expect(GOOGLE_ADS_DESCRIPTOR.requiredEnv).not.toContain(
            'GOOGLE_ADS_DEVELOPER_TOKEN'
        );
        // Retained as optional so an existing deployment keeps working.
        expect(GOOGLE_ADS_DESCRIPTOR.optionalEnv).toContain('GOOGLE_ADS_DEVELOPER_TOKEN');
    });

    it('the policy records the official sunset and that it is not required', () => {
        expect(GOOGLE_ADS_DEVELOPER_TOKEN_POLICY.sunsetDate).toBe('2026-09-09');
        expect(GOOGLE_ADS_DEVELOPER_TOKEN_POLICY.required).toBe(false);
    });

    it('omits the header entirely when no token exists', () => {
        // Sending an empty developer-token header would be worse than none.
        const headers = buildGoogleAdsHeaders({ accessToken: 'synthetic' });
        expect(headers['developer-token']).toBeUndefined();
        expect(headers.Authorization).toBe('Bearer synthetic');
    });

    it('still sends it when present, for backwards compatibility', () => {
        const headers = buildGoogleAdsHeaders({
            accessToken: 'synthetic',
            developerToken: 'legacy-token-not-real',
        });
        expect(headers['developer-token']).toBe('legacy-token-not-real');
    });
});

describe('Google Ads · REPAIR 3 — login-customer-id is conditional', () => {
    it('a DIRECT flow without a login customer id is NOT blocked', () => {
        expect(
            resolveGoogleAdsBlocked(
                { language: 'en', market: 'en-US', seeds: ['probe'], accessPath: 'DIRECT' },
                NO_DEV_TOKEN
            )
        ).toBeNull();
    });

    it('a MANAGER flow without one IS blocked, naming the exact dependency', () => {
        const blocked = resolveGoogleAdsBlocked(
            { language: 'en', market: 'en-US', seeds: ['probe'], accessPath: 'MANAGER' },
            NO_DEV_TOKEN
        );
        expect(blocked!.dependency).toBe('GOOGLE_ADS_LOGIN_CUSTOMER_ID');
    });

    it('a MANAGER flow with one passes', () => {
        expect(
            resolveGoogleAdsBlocked(
                { language: 'en', market: 'en-US', seeds: ['probe'], accessPath: 'MANAGER' },
                { ...NO_DEV_TOKEN, GOOGLE_ADS_LOGIN_CUSTOMER_ID: '555-555-5555' }
            )
        ).toBeNull();
    });

    it('the header is sent ONLY on the manager path', () => {
        // Sending it on a direct call is incorrect per Google.
        expect(
            buildGoogleAdsHeaders({
                accessToken: 'synthetic',
                loginCustomerId: '5555555555',
                accessPath: 'DIRECT',
            })['login-customer-id']
        ).toBeUndefined();

        expect(
            buildGoogleAdsHeaders({
                accessToken: 'synthetic',
                loginCustomerId: '555-555-5555',
                accessPath: 'MANAGER',
            })['login-customer-id']
        ).toBe('5555555555');
    });
});

describe('Google Ads · REPAIR 4 — OAuth refresh lifecycle, not a static token', () => {
    it('prefers the offline triple over a static access token', async () => {
        const fetchImpl = vi.fn(
            async () =>
                new Response(JSON.stringify({ access_token: 'renewed-token' }), { status: 200 })
        );
        const strategy = resolveGoogleAdsAuthStrategy(
            {
                GOOGLE_ADS_CLIENT_ID: 'synthetic-client',
                GOOGLE_ADS_CLIENT_SECRET: 'synthetic-secret',
                GOOGLE_ADS_REFRESH_TOKEN: 'synthetic-refresh',
                // Even with a static token present, the triple must win.
                GOOGLE_ADS_ACCESS_TOKEN: 'stale-static-token',
            },
            fetchImpl as unknown as typeof fetch
        );

        expect(await strategy.getAccessToken()).toBe('renewed-token');
        expect(fetchImpl).toHaveBeenCalled();
    });

    it('sends the documented refresh grant', async () => {
        let capturedBody = '';
        const fetchImpl = vi.fn(async (_url: unknown, init: RequestInit) => {
            capturedBody = String(init.body);
            return new Response(JSON.stringify({ access_token: 'renewed' }), { status: 200 });
        });

        await googleAdsRefreshTokenAuth({
            clientId: 'cid',
            clientSecret: 'csecret',
            refreshToken: 'rtoken',
            fetchImpl: fetchImpl as unknown as typeof fetch,
        }).getAccessToken();

        expect(capturedBody).toContain('grant_type=refresh_token');
    });

    it('a failed refresh yields null => BLOCKED, never a crash', async () => {
        const fetchImpl = vi.fn(async () => new Response('nope', { status: 400 }));
        const strategy = googleAdsRefreshTokenAuth({
            clientId: 'cid',
            clientSecret: 'csecret',
            refreshToken: 'rtoken',
            fetchImpl: fetchImpl as unknown as typeof fetch,
        });
        expect(await strategy.getAccessToken()).toBeNull();
    });

    it('a throwing token endpoint fails closed', async () => {
        const fetchImpl = vi.fn(async () => {
            throw new Error('token endpoint at internal-host unreachable');
        });
        const strategy = googleAdsRefreshTokenAuth({
            clientId: 'cid',
            clientSecret: 'csecret',
            refreshToken: 'rtoken',
            fetchImpl: fetchImpl as unknown as typeof fetch,
        });
        expect(await strategy.getAccessToken()).toBeNull();
    });

    it('falls back to the static token only when the triple is absent', async () => {
        const strategy = resolveGoogleAdsAuthStrategy({ GOOGLE_ADS_ACCESS_TOKEN: 'static' });
        expect(await strategy.getAccessToken()).toBe('static');
    });

    it('treats a PARTIAL triple as absent rather than half-working', async () => {
        // A client id with no secret cannot refresh; using it anyway would fail
        // opaquely at the API instead of reporting a clear BLOCKED reason.
        const strategy = resolveGoogleAdsAuthStrategy({
            GOOGLE_ADS_CLIENT_ID: 'cid',
            GOOGLE_ADS_ACCESS_TOKEN: 'static',
        });
        expect(await strategy.getAccessToken()).toBe('static');
    });
});

describe('Google Ads · request targets v25 and honours the access path', () => {
    it('collect() calls v25 and never sends an empty dev token', async () => {
        clearGoogleAdsCache();
        const seen: string[] = [];
        let seenHeaders: Record<string, string> = {};

        const fetchImpl = vi.fn(async (url: unknown, init: RequestInit) => {
            seen.push(String(url));
            seenHeaders = init.headers as Record<string, string>;
            return new Response(JSON.stringify({ results: [] }), { status: 200 });
        });

        await collectGoogleAdsKeywordIdeas(
            { language: 'en', market: 'en-US', seeds: ['testosterone'], accessPath: 'DIRECT' },
            { env: NO_DEV_TOKEN, fetchImpl: fetchImpl as unknown as typeof fetch }
        );

        expect(seen[0]).toContain('/v25/customers/1234567890:generateKeywordIdeas');
        expect(seen[0]).not.toContain('v19');
        expect(seenHeaders['developer-token']).toBeUndefined();
        // Not a manager call, so no login id.
        expect(seenHeaders['login-customer-id']).toBeUndefined();
    });

    it('a MANAGER collect() sends the login id', async () => {
        clearGoogleAdsCache();
        let seenHeaders: Record<string, string> = {};
        const fetchImpl = vi.fn(async (_url: unknown, init: RequestInit) => {
            seenHeaders = init.headers as Record<string, string>;
            return new Response(JSON.stringify({ results: [] }), { status: 200 });
        });

        await collectGoogleAdsKeywordIdeas(
            {
                language: 'en',
                market: 'en-US',
                seeds: ['testosterone'],
                accessPath: 'MANAGER',
            },
            {
                env: { ...NO_DEV_TOKEN, GOOGLE_ADS_LOGIN_CUSTOMER_ID: '555-555-5555' },
                fetchImpl: fetchImpl as unknown as typeof fetch,
            }
        );

        expect(seenHeaders['login-customer-id']).toBe('5555555555');
    });

    it('the request body matches the LIVE v25 REST/JSON contract', () => {
        // Proven against the real endpoint. The REST/JSON API takes camelCase
        // names and enum strings; the previous snake_case/protobuf body was
        // rejected live with:
        //   400 INVALID_ARGUMENT  Unknown name "languageConstant": Cannot find field.
        const body = buildGenerateKeywordIdeaRequest(
            { language: 'en', market: 'en-US', seeds: ['testosterone'] }
        );

        // camelCase, not snake_case.
        expect(body.language).toBe('languageConstants/1000');
        expect(body.keywordPlanNetwork).toBe('GOOGLE_SEARCH');
        expect(body.geoTargetConstants).toEqual(['geoTargetConstants/2840']);
        expect(body.keywordSeed).toEqual({ keywords: ['testosterone'] });

        // `customerId` travels in the URL path, never in the body.
        expect(body.customer_id).toBeUndefined();
        expect(body.customerId).toBeUndefined();

        // And none of the protobuf spellings may creep back in.
        for (const snake of [
            'language_constant',
            'keyword_plan_network',
            'geo_target_constants',
            'include_page_topics',
            'keyword_and_page_seed',
        ]) {
            expect(body[snake], `${snake} must not be sent`).toBeUndefined();
        }
    });

    it('Arabic markets send the Arabic language constant', () => {
        const body = buildGenerateKeywordIdeaRequest({
            language: 'ar',
            market: 'ar-EG',
            seeds: ['計算'],
        });
        expect(body.language).toBe('languageConstants/1001');
        expect(body.geoTargetConstants).toEqual(['geoTargetConstants/818']);
    });
});

describe('Google Ads · provider independence and no fake VERIFIED', () => {
    it('Google Ads config does not affect any other provider', async () => {
        const { resolveAllProviders } = await import(
            '../../server/seo/sources/providerEnvironment'
        );
        const all = await resolveAllProviders({ env: { ...NO_DEV_TOKEN } });
        const gsc = all.find((r) => r.provider === 'google_search_console')!;
        const trends = all.find((r) => r.provider === 'google_trends')!;
        // Ads being fully configured changes nothing for them.
        expect(gsc.invokability).toBe('BLOCKED');
        expect(trends.invokability).toBe('STRUCTURALLY_BLOCKED');
    });

    it('the registry still refuses VERIFIED', async () => {
        const { sourceRegistry } = await import('../../server/seo/sources/registry');
        const ads = sourceRegistry
            .getSourceHealth()
            .find((h) => h.provider === 'google_ads_keyword_planner');
        expect(ads!.status).not.toBe('VERIFIED');
    });
});
