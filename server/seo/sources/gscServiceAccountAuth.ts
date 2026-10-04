/**
 * server/seo/sources/gscServiceAccountAuth.ts
 * ============================================================================
 * THE GSC OAUTH LIFECYCLE — a service-account JWT assertion, exchanged per call
 * ============================================================================
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `providerEnvironment.ts` defines the `ProviderAuthStrategy` seam and states
 * plainly that the project has no token-refresh client, so re-authentication
 * means "swapping the strategy — with NO adapter change required". This file is
 * that swap, implemented for the credential shape that actually exists in this
 * deployment: a Google Cloud SERVICE ACCOUNT (`GSC_CLIENT_EMAIL` +
 * `GSC_PRIVATE_KEY`), not a stored short-lived access token.
 *
 * This is deliberately the ONLY place in the SEO layer that knows a service
 * account exists. The GSC adapter stays credential-agnostic: it still receives
 * an opaque token through `query.accessToken`, so re-authenticating to a desktop
 * OAuth user later changes nothing here.
 *
 * WHY A SERVICE ACCOUNT AND NOT A STORED TOKEN
 * --------------------------------------------
 * `tests/integration/seoGscLiveProbe.test.ts` recorded the original defect
 * precisely: a stored Google access token is short-lived, and a deployment that
 * depends on one "appears healthy right up until the token dies". A service
 * account mints a FRESH token from a signed assertion on every call, so there
 * is nothing to expire and nothing to rotate by hand.
 *
 * THE FLOW (Google's documented JWT-bearer / assertion flow)
 * ----------------------------------------------------------
 *   1. Build a JWT: header {alg:RS256,typ:JWT}, claims {iss,scope,aud,iat,exp}
 *   2. Sign it with the service account's RSA private key (PKCS#8 PEM)
 *   3. POST it as `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer`
 *      to https://oauth2.googleapis.com/token
 *   4. Use the returned `access_token` as the bearer for Search Analytics
 *
 * HONESTY RULES ENFORCED HERE
 * ---------------------------
 *  - A missing / unparsable / un-signable credential returns null. It NEVER
 *    throws and NEVER invents a token, so the seam reports the provider BLOCKED
 *    with the exact dependency instead of a fabricated success.
 *  - `RS256` and the JWT-bearer grant are the documented Google values; they are
 *    constants, not configuration, so no environment variable can weaken them.
 *  - The private key is read per call (not captured at construction) so a rotated
 *    key takes effect without a redeploy, matching `staticEnvToken`'s behaviour.
 *  - No secret ever reaches a log or a returned value: failures return null.
 */

import { createSign } from 'node:crypto';
import type { ProviderAuthStrategy } from './providerEnvironment';
import { readEnv } from './searchIntelligenceTypes';
import { GSC_SCOPE } from './gscAdapter';

/** Google's OAuth 2.0 token endpoint. Constant, per Google's documentation. */
export const GSC_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

/**
 * The JWT-bearer grant type. A service account asserts its own identity, so it
 * is not an `authorization_code` or `refresh_token` grant.
 */
export const GSC_JWT_BEARER_GRANT =
    'urn:ietf:params:oauth:grant-type:jwt-bearer';

/** Google's token endpoint requires `aud` = the token endpoint itself. */
const TOKEN_AUDIENCE = 'https://oauth2.googleapis.com/token';

/**
 * Assertion lifetime, in seconds.
 *
 * Google caps a JWT-bearer assertion at one hour and rejects an expired one.
 * 3600 is the documented maximum; a shorter life would be strictly worse because
 * every call would need a new assertion anyway.
 */
export const GSC_ASSERTION_LIFETIME_SECONDS = 3600;

/** base64url without padding — the encoding JWT requires (RFC 7515 §2). */
function base64Url(input: Buffer | string): string {
    return Buffer.from(input)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Read the PEM body and return it in the single-line form the crypto layer
 * needs.
 *
 * Secrets pasted into an environment variable are very often stored with
 * literal `\n` sequences rather than real newlines; `crypto.createSign` rejects
 * those outright, so they are restored here instead of failing opaquely at the
 * API with a message about a malformed key.
 */
export function normalizePrivateKey(raw: string): string {
    const trimmed = raw.trim();
    if (trimmed.includes('\\n')) {
        return trimmed.replace(/\\n/g, '\n');
    }
    return trimmed;
}

/**
 * Build the signed JWT assertion.
 *
 * Exported so the shape is directly testable with no network access and no real
 * credential. `nowSeconds` is injected for the same reason.
 */
export function buildGscJwtAssertion(options: {
    clientEmail: string;
    privateKey: string;
    scope?: string;
    audience?: string;
    lifetimeSeconds?: number;
    nowSeconds: number;
}): string {
    const header = { alg: 'RS256', typ: 'JWT' };
    const issuedAt = Math.floor(options.nowSeconds);
    const claims = {
        iss: options.clientEmail,
        // GSC_SCOPE is the read-only scope. Requesting write access we never use
        // would be an unjustified privilege escalation.
        scope: options.scope ?? GSC_SCOPE,
        aud: options.audience ?? TOKEN_AUDIENCE,
        iat: issuedAt,
        exp: issuedAt + (options.lifetimeSeconds ?? GSC_ASSERTION_LIFETIME_SECONDS),
    };

    const signingInput = `${base64Url(JSON.stringify(header))}.${base64Url(
        JSON.stringify(claims)
    )}`;

    const signer = createSign('RSA-SHA256');
    signer.update(signingInput);
    // An unparsable key throws. The caller catches, so this stays an honest
    // BLOCKED rather than an unhandled crash inside the weekly run.
    const signature = signer.sign(normalizePrivateKey(options.privateKey));
    return `${signingInput}.${base64Url(signature)}`;
}

export interface GscServiceAccountAuthOptions {
    env: Record<string, string | undefined>;
    fetchImpl?: typeof fetch;
    tokenEndpoint?: string;
    now?: () => number;
}

/**
 * Build a `ProviderAuthStrategy` backed by a Google service account.
 *
 * Returns a strategy that yields a FRESH token per call. A failure at any step
 * — absent credential, un-signable key, non-2xx from Google, a body with no
 * `access_token` — returns null, which the seam maps to BLOCKED with the exact
 * dependency. That is the state the operator needs to see, and it is strictly
 * more useful than a thrown error containing a client id.
 */
export function gscServiceAccountAuth(
    options: GscServiceAccountAuthOptions
): ProviderAuthStrategy {
    return {
        async getAccessToken(): Promise<string | null> {
            const clientEmail = readEnv(options.env, 'GSC_CLIENT_EMAIL');
            const privateKey = readEnv(options.env, 'GSC_PRIVATE_KEY');
            // A partially configured pair is ABSENT, not half-working: a client
            // email without a key can never mint a token.
            if (!clientEmail || !privateKey) return null;

            const doFetch = options.fetchImpl ?? globalThis.fetch;
            if (typeof doFetch !== 'function') return null;

            try {
                const assertion = buildGscJwtAssertion({
                    clientEmail,
                    privateKey,
                    nowSeconds: (options.now?.() ?? Date.now()) / 1000,
                });

                const response = await doFetch(
                    options.tokenEndpoint ?? GSC_TOKEN_ENDPOINT,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            grant_type: GSC_JWT_BEARER_GRANT,
                            assertion,
                        }).toString(),
                    }
                );
                if (!response.ok) return null;

                const body = (await response.json()) as { access_token?: unknown };
                const token = body?.access_token;
                return typeof token === 'string' && token.trim()
                    ? token.trim()
                    : null;
            } catch {
                // Fail closed. The reason is never propagated: it can contain
                // the client email or an internal endpoint.
                return null;
            }
        },
    };
}