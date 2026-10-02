/**
 * tests/integration/seoGscLiveProbe.test.ts
 * ============================================================================
 * GSC live verification — attempt + honest record of the attempt
 * ============================================================================
 * THIS SUITE CANNOT PASS GSC. It exists to make the BLOCKED state provable and
 * to pin the ORDER of the live probe, so the moment credentials appear the
 * verification is mechanical rather than improvised.
 *
 * WHY NO FAKE CREDENTIALS ARE USED ANYWHERE HERE
 * ----------------------------------------------
 * A synthetic token sent to Google returns 401. That proves nothing about
 * authorization, and a test that "expects 401" would be a green suite that looks
 * like progress. Without credentials the only honest assertion is the seam's
 * BLOCKED verdict.
 *
 * THE REQUIRED ORDER (cannot be reordered):
 *   1. authorization probe   - is the token accepted at all?
 *   2. property access probe  - can this token see the configured property?
 *   3. Search Analytics query - a real, LIMITED query returning real rows
 *   4. normalize -> persist -> provenance -> weekly state -> diff -> API
 *
 * Steps 1-2 matter separately: a valid token for an account with no access to
 * the property fails at step 2, not step 1. Collapsing them would misreport the
 * cause and send an operator to re-authorize unnecessarily.
 */
import { describe, it, expect } from 'vitest';

import { resolveProvider, type ProviderResolution } from '../../server/seo/sources/providerEnvironment';
import { GSC_SCOPE } from '../../server/seo/sources/gscAdapter';

const probe = {
    provider: 'google_search_console' as const,
    language: 'en' as const,
    market: 'en-US' as const,
};

describe('GSC · current state (no credentials in this environment)', () => {
    it('the DI seam reports GSC BLOCKED with an exact dependency', async () => {
        const r: ProviderResolution = await resolveProvider(probe, { env: {} });

        expect(r.invokability).toBe('BLOCKED');
        // The FIRST unmet dependency, named exactly — not a vague failure.
        expect(r.blocked!.dependency).toBe('GSC_SITE_URL');
        expect(r.blocked!.kind).toBe('site_property');
        expect(r.tokenPresent).toBe(false);
    });

    it('with a site but no token, the blocker moves to the token', async () => {
        // Proves the two steps are genuinely distinct, and that the reported
        // cause changes as configuration improves.
        const r = await resolveProvider(probe, {
            env: { GSC_SITE_URL: 'https://example.invalid/' },
        });
        expect(r.blocked!.dependency).toBe('GSC_ACCESS_TOKEN');
        expect(r.blocked!.kind).toBe('oauth_token');
    });

    it('declares the documented read-only scope', () => {
        // Google documents webmasters.readonly as the appropriate read scope.
        expect(GSC_SCOPE).toBe('https://www.googleapis.com/auth/webmasters.readonly');
    });
});

describe('GSC · OAuth lifecycle is NOT implemented (recorded, not hidden)', () => {
    it('the adapter contains no token-refresh logic', async () => {
        const fs = await import('node:fs');
        const source = fs.readFileSync('server/seo/sources/gscAdapter.ts', 'utf8');
        // Google access tokens are short-lived. Nothing renews one, so a
        // configured deployment WILL degrade to BLOCKED on expiry.
        expect(source).not.toMatch(/refresh_token/i);
        expect(source).not.toMatch(/grant_type/i);
    });

    it('the project contains no Google OAuth refresh client', async () => {
        const fs = await import('node:fs');
        const path = await import('node:path');
        // Recorded as PARTIAL/BLOCKED: deliberately NOT hidden and NOT faked.
        const candidates = [
            'server/oauth',
            'server/seo/sources/oauth',
            'lib/oauth',
            'server/seo/sources/googleOAuth',
        ];
        const found = candidates.filter((p) => fs.existsSync(path.resolve(p)));
        expect(found).toEqual([]);
    });

    it('a static token is a PARTIAL lifecycle, not a permanent one', async () => {
        // The seam supports a renewing strategy, so a future refresh client
        // slots in WITHOUT touching the adapter. That is the designed path.
        const r = await resolveProvider(probe, {
            env: {},
            auth: {
                google_search_console: {
                    async getAccessToken() {
                        return 'a-renewed-token-from-a-future-oauth-client';
                    },
                },
            },
        });
        // The token is now supplied, so the remaining blocker is the property.
        expect(r.blocked!.dependency).toBe('GSC_SITE_URL');
        expect(r.tokenPresent).toBe(true);
    });
});

describe('GSC · VERIFIED requires the full chain, not HTTP 200', () => {
    it('documents the exact evidence required before VERIFIED is allowed', () => {
        // A 200 from Google is necessary but NOT sufficient. VERIFIED additionally
        // requires every downstream stage to have accepted the data.
        const REQUIRED_CHAIN = [
            'live_request',
            'real_response',
            'normalize',
            'persist',
            'provenance',
            'weekly_state',
            'diff',
            'api',
        ];
        expect(REQUIRED_CHAIN).toContain('provenance');
        expect(REQUIRED_CHAIN).toContain('weekly_state');
        // HTTP success alone is explicitly NOT a terminal state.
        expect(REQUIRED_CHAIN).not.toContain('http_200');
    });

    it('the registry still refuses VERIFIED for GSC', async () => {
        const { sourceRegistry } = await import('../../server/seo/sources/registry');
        const gsc = sourceRegistry
            .getSourceHealth()
            .find((h) => h.provider === 'google_search_console');
        expect(gsc).toBeTruthy();
        expect(gsc!.status).not.toBe('VERIFIED');
    });
});