/**
 * Spec §22 — real destination-URL verification.
 *
 * `destinationVerified` existed as a type but was never set by anything, so a
 * destination was never actually confirmed to exist. These tests pin the
 * three-state answer and, crucially, that verification NEVER leaves our origin.
 */
import { describe, it, expect } from 'vitest';

import {
    verifyDestinations,
    isSameOriginPath,
    toVerifiedFlag,
    summariseVerification,
} from '../../server/seo/destinationVerification';

const ORIGIN = 'https://example.test';

/** A fetch stub that answers from a table of status codes. */
function stubFetch(map: Record<string, number>): typeof fetch {
    return (async (input: RequestInfo | URL) => {
        const url = String(input);
        const status = map[url];
        if (status === undefined) throw new Error(`fetch failed for ${url}`);
        return { status } as Response;
    }) as unknown as typeof fetch;
}

describe('§22 · only our own origin is ever fetched', () => {
    it('accepts a normal absolute path', () => {
        expect(isSameOriginPath('/guides/half-life', ORIGIN)).toBe(true);
        expect(isSameOriginPath('/', ORIGIN)).toBe(true);
    });

    it('refuses a protocol-relative URL that would escape the site', () => {
        expect(isSameOriginPath('//evil.com/steal', ORIGIN)).toBe(false);
    });

    it('refuses an absolute off-site URL', () => {
        expect(isSameOriginPath('https://evil.com/x', ORIGIN)).toBe(false);
    });

    it('refuses traversal and malformed paths', () => {
        expect(isSameOriginPath('/a/../../etc', ORIGIN)).toBe(false);
        expect(isSameOriginPath('', ORIGIN)).toBe(false);
        expect(isSameOriginPath('/a b', ORIGIN)).toBe(false);
    });

    it('does not hit the network for a refused path', async () => {
        let calls = 0;
        const spy = (async () => {
            calls += 1;
            return { status: 200 } as Response;
        }) as unknown as typeof fetch;

        const results = await verifyDestinations(['https://evil.com/x'], {
            siteOrigin: ORIGIN,
            fetchImpl: spy,
        });
        expect(calls).toBe(0);
        expect(results[0].verification).toBe('unverified');
    });
});

describe('§22 · three states, not two', () => {
    it('verified when the page responds 2xx', async () => {
        const r = await verifyDestinations(['/exists'], {
            siteOrigin: ORIGIN,
            fetchImpl: stubFetch({ [`${ORIGIN}/exists`]: 200 }),
        });
        expect(r[0].verification).toBe('verified');
        expect(r[0].status).toBe(200);
        expect(toVerifiedFlag(r[0].verification)).toBe(true);
    });

    it('missing when the page responds 404', async () => {
        const r = await verifyDestinations(['/gone'], {
            siteOrigin: ORIGIN,
            fetchImpl: stubFetch({ [`${ORIGIN}/gone`]: 404 }),
        });
        expect(r[0].verification).toBe('missing');
        expect(toVerifiedFlag(r[0].verification)).toBe(false);
    });

    it('unverified when the check could not run — NOT missing', async () => {
        const r = await verifyDestinations(['/unknown'], {
            siteOrigin: ORIGIN,
            // fetch throws: we did not learn whether it exists.
            fetchImpl: (async () => {
                throw new Error('fetch failed');
            }) as unknown as typeof fetch,
        });
        // Claiming `missing` here would assert something we never checked.
        expect(r[0].verification).toBe('unverified');
        expect(toVerifiedFlag(r[0].verification)).toBeNull();
    });

    it('unverified is null, never coerced to false', () => {
        // A boolean cannot express "did not look", which is exactly why this
        // function returns boolean | null.
        expect(toVerifiedFlag('unverified')).toBeNull();
        expect(toVerifiedFlag('missing')).toBe(false);
        expect(toVerifiedFlag('verified')).toBe(true);
    });
});

describe('§22 · batch behaviour', () => {
    it('checks each distinct path once', async () => {
        const seen: string[] = [];
        const spy = (async (input: RequestInfo | URL) => {
            seen.push(String(input));
            return { status: 200 } as Response;
        }) as unknown as typeof fetch;

        const r = await verifyDestinations(['/a', '/a', '/a'], {
            siteOrigin: ORIGIN,
            fetchImpl: spy,
        });
        expect(seen).toHaveLength(1);
        expect(r).toHaveLength(1);
    });

    it('summarises verified / missing / unverified separately', async () => {
        const r = await verifyDestinations(['/yes', '/no', 'https://evil.com/x'], {
            siteOrigin: ORIGIN,
            fetchImpl: stubFetch({ [`${ORIGIN}/yes`]: 200, [`${ORIGIN}/no`]: 404 }),
        });
        expect(summariseVerification(r)).toEqual({
            verified: 1,
            missing: 1,
            unverified: 1,
            total: 3,
        });
    });

    it('a 404 is not retried — it is already a definitive answer', async () => {
        let calls = 0;
        const spy = (async () => {
            calls += 1;
            return { status: 404 } as Response;
        }) as unknown as typeof fetch;

        await verifyDestinations(['/gone'], { siteOrigin: ORIGIN, fetchImpl: spy });
        // Retrying a 404 per keyword would triple the load for no new answer.
        expect(calls).toBe(1);
    });
});