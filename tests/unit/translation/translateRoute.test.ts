/**
 * T2 — app/api/translate route: request/response contract and fail-closed gates.
 *
 * The route reads credentials only through createGoogleProviderFromEnv(), so
 * these tests drive the boundary by supplying credentials through the
 * environment. That exercises the real credential-isolation path (a deployment
 * with no GOOGLE_CLOUD_* config is the default and must fail closed) without
 * ever needing a live token: capability discovery is served by a stubbed fetch.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST, GET } from '../../../app/api/translate/route';
import {
    resetTargetQuotaWindows,
    TRANSLATION_CHARACTER_QUOTA,
} from '../../../server/translation/security';
import { MAX_SOURCE_CHARS } from '../../../server/translation/contracts';
import { GOOGLE_MAX_CODEPOINTS_PER_CONTENT } from '../../../server/translation/googleProvider';

const ORIGIN = 'https://www.mrxsteroid.com';

const CREDENTIAL_KEYS = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_TRANSLATION_LOCATION',
    'GOOGLE_CLOUD_TRANSLATION_MODEL',
    'GOOGLE_CLOUD_TRANSLATION_CREDENTIALS',
    'GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN',
    'NEXT_PUBLIC_SITE_URL',
    'SITE_URL',
] as const;

function clearEnv() {
    for (const key of CREDENTIAL_KEYS) delete process.env[key];
}

function configureProvider() {
    process.env.GOOGLE_CLOUD_PROJECT_ID = 'test-project';
    process.env.GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN = 'test-access-token';
}

const validBody = {
    sourceLanguage: 'en',
    targetLanguage: 'fr',
    sourceText: 'Hello world',
    surface: 'public-content',
};

/**
 * The shared in-memory rate limiter is keyed by client IP with a 10/min
 * ceiling, so each test that is not specifically exercising the limiter gets a
 * unique forwarded IP. Tests that DO exercise a per-caller boundary (target
 * quota, rate limit) pass a fixed one.
 */
let requestCounter = 0;

const post = (
    body: unknown,
    headers: Record<string, string> = { origin: ORIGIN },
    fixedIp?: string
) => {
    const ip = fixedIp ?? `203.0.113.${(requestCounter += 1)}`;
    return POST(
        new Request('https://www.mrxsteroid.com/api/translate', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-forwarded-for': ip, ...headers },
            body: typeof body === 'string' ? body : JSON.stringify(body),
        })
    );
};

/**
 * Serves capability discovery and translation, routed by URL rather than by
 * call order. Every request builds a fresh provider, so a counter-based stub
 * would desynchronise as soon as a test issued more than one request.
 */
function stubGoogleFetch(translatedText = 'Bonjour le monde') {
    return vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        const json = (value: unknown) =>
            new Response(JSON.stringify(value), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });

        if (url.includes('supportedLanguages')) {
            return json({
                languages: [
                    { languageCode: 'fr', supportSource: true, supportTarget: true },
                    { languageCode: 'de', supportSource: true, supportTarget: true },
                ],
            });
        }
        if (url.includes(':translateText')) {
            return json({ translations: [{ translatedText }] });
        }
        return new Response('unexpected call', { status: 400 });
    });
}

describe('T2 · translate route · success contract', () => {
    beforeEach(() => {
        clearEnv();
        resetTargetQuotaWindows();
    });
    afterEach(() => {
        clearEnv();
        vi.unstubAllGlobals();
    });

    it('returns a normalized translation payload with cache identity', async () => {
        configureProvider();
        vi.stubGlobal('fetch', stubGoogleFetch());

        const res = await post(validBody);
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.ok).toBe(true);
        expect(body.sourceLanguage).toBe('en');
        expect(body.targetLanguage).toBe('fr');
        expect(body.surface).toBe('public-content');
        expect(body.translations).toEqual(['Bonjour le monde']);
        // §33 identity must reach the caller so it can key its cache.
        expect(body.identity.providerId).toBe('google-cloud-translation-advanced');
        expect(body.identity.modelIdentifier).toBe('general/nmt');
        expect(body.identity.engineVersion).toBe('v1');
        expect(body.identity.glossaryVersion).toBe('none');
    });

    it('never marks the response as cacheable', async () => {
        configureProvider();
        vi.stubGlobal('fetch', stubGoogleFetch());
        const res = await post(validBody);
        expect(res.headers.get('cache-control')).toBe('no-store');
    });

    it('never leaks credential material in a success response', async () => {
        configureProvider();
        vi.stubGlobal('fetch', stubGoogleFetch());
        const res = await post(validBody);
        const raw = JSON.stringify(await res.json());
        expect(raw).not.toContain('test-access-token');
        expect(raw).not.toContain('test-project');
    });

    it('§23 GET reports only provider-verified languages', async () => {
        configureProvider();
        vi.stubGlobal('fetch', stubGoogleFetch());
        const res = await GET();
        expect(res.status).toBe(200);
        expect(res.headers.get('cache-control')).toBe('no-store');
        const body = await res.json();
        expect(body.ok).toBe(true);
        // The stub verifies fr + de only; the other four registered targets
        // must NOT be offered.
        expect(body.languages.map((l: { code: string }) => l.code).sort()).toEqual(['de', 'fr']);
        expect(body.languages[0]).toMatchObject({
            code: expect.any(String),
            displayName: expect.any(String),
            nativeName: expect.any(String),
            rtl: expect.any(Boolean),
        });
    });

    it('§23 GET never lists a canonical or unknown language', async () => {
        configureProvider();
        vi.stubGlobal(
            'fetch',
            vi.fn(async (input: RequestInfo | URL) => {
                if (String(input).includes('supportedLanguages')) {
                    return new Response(
                        JSON.stringify({
                            // 'en' and 'ar' are canonical; 'xx' is not registered.
                            languages: ['en', 'ar', 'xx', 'fr'].map((code) => ({
                                languageCode: code,
                                supportTarget: true,
                            })),
                        }),
                        { status: 200, headers: { 'Content-Type': 'application/json' } }
                    );
                }
                return new Response('{}', { status: 200 });
            })
        );
        const res = await GET();
        expect(res.status).toBe(200);
        expect((await res.json()).languages.map((l: { code: string }) => l.code)).toEqual(['fr']);
    });

    it('§23 GET fails closed when capability cannot be established', async () => {
        configureProvider();
        vi.stubGlobal('fetch', vi.fn(async () => new Response('err', { status: 500 })));
        const res = await GET();
        // A 200 with an empty list would let a UI render an empty selector and
        // silently hide a misconfigured deployment. It must be a typed 503.
        expect(res.status).toBe(503);
        expect(res.headers.get('cache-control')).toBe('no-store');
        const body = await res.json();
        expect(body.error.code).toBe('PROVIDER_CAPABILITY_UNAVAILABLE');
        expect(body.error.retryable).toBe(true);
    });

    it('§23 GET fails closed when no provider is configured', async () => {
        clearEnv();
        const res = await GET();
        expect(res.status).toBe(503);
        expect((await res.json()).error.code).toBe('PROVIDER_NOT_CONFIGURED');
    });

    it('§23 GET fails closed when the provider verifies none of our targets', async () => {
        configureProvider();
        vi.stubGlobal(
            'fetch',
            vi.fn(async (input: RequestInfo | URL) => {
                if (String(input).includes('supportedLanguages')) {
                    // Verifies only canonical / unknown languages.
                    return new Response(
                        JSON.stringify({
                            languages: ['en', 'ar', 'xx'].map((code) => ({
                                languageCode: code,
                                supportTarget: true,
                            })),
                        }),
                        { status: 200, headers: { 'Content-Type': 'application/json' } }
                    );
                }
                return new Response('{}', { status: 200 });
            })
        );
        const res = await GET();
        expect(res.status).toBe(503);
        expect((await res.json()).error.code).toBe('PROVIDER_CAPABILITY_UNAVAILABLE');
    });
});

describe('T2 · translate route · fail-closed gates', () => {
    beforeEach(() => {
        clearEnv();
        resetTargetQuotaWindows();
    });
    afterEach(() => {
        clearEnv();
        vi.unstubAllGlobals();
    });

    const expectError = async (res: Response, code: string, status: number) => {
        expect(res.status).toBe(status);
        const body = await res.json();
        expect(body.ok).toBe(false);
        expect(body.error.code).toBe(code);
        return body;
    };

    it('rejects a malformed JSON body', async () => {
        await expectError(await post('{not json'), 'INVALID_JSON', 400);
    });

    it('rejects a missing sourceLanguage rather than assuming English', async () => {
        const { sourceLanguage: _omitted, ...rest } = validBody;
        await expectError(await post(rest), 'MISSING_SOURCE_LANGUAGE', 400);
    });

    it('rejects a non-English sourceLanguage', async () => {
        await expectError(await post({ ...validBody, sourceLanguage: 'ar' }), 'INVALID_SOURCE_LANGUAGE', 400);
    });

    it('rejects an unknown target language', async () => {
        await expectError(await post({ ...validBody, targetLanguage: 'xx' }), 'UNKNOWN_LANGUAGE', 400);
    });

    it('rejects Arabic as a target (canonical is never machine-translated)', async () => {
        await expectError(
            await post({ ...validBody, targetLanguage: 'ar' }),
            'CANONICAL_TARGET_NOT_ALLOWED',
            400
        );
    });

    it('rejects a non-allowlisted surface', async () => {
        await expectError(await post({ ...validBody, surface: 'admin' }), 'UNKNOWN_SURFACE', 400);
    });

    it('rejects blank source text', async () => {
        await expectError(await post({ ...validBody, sourceText: '   ' }), 'BLANK_SOURCE_TEXT', 400);
    });

    it('rejects an oversized single string', async () => {
        await expectError(
            await post({ ...validBody, sourceText: 'x'.repeat(MAX_SOURCE_CHARS + 1) }),
            'SOURCE_TEXT_TOO_LONG',
            413
        );
    });

    it('fails closed when no provider is configured', async () => {
        await expectError(await post(validBody), 'PROVIDER_NOT_CONFIGURED', 503);
    });

    it('fails closed when capability cannot be established', async () => {
        configureProvider();
        vi.stubGlobal('fetch', vi.fn(async () => new Response('err', { status: 500 })));
        await expectError(await post(validBody), 'PROVIDER_CAPABILITY_UNAVAILABLE', 503);
    });

    it('fails closed when the provider confirms no targets', async () => {
        configureProvider();
        vi.stubGlobal(
            'fetch',
            vi.fn(async () =>
                new Response(JSON.stringify({ languages: [] }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            )
        );
        await expectError(await post(validBody), 'PROVIDER_CAPABILITY_UNAVAILABLE', 503);
    });

    it('fails closed when the target is not provider-verified', async () => {
        configureProvider();
        // Google confirms fr/de only; 'it' is in app scope but unverified.
        vi.stubGlobal('fetch', stubGoogleFetch());
        await expectError(await post({ ...validBody, targetLanguage: 'it' }), 'PROVIDER_UNSUPPORTED', 400);
    });

    it('rejects a disallowed origin', async () => {
        configureProvider();
        vi.stubGlobal('fetch', stubGoogleFetch());
        await expectError(
            await post(validBody, { origin: 'https://evil.example.com' }),
            'ORIGIN_NOT_ALLOWED',
            403
        );
    });

    it('the contract ceiling never exceeds the provider ceiling', async () => {
        configureProvider();
        vi.stubGlobal('fetch', stubGoogleFetch());
        // MAX_SOURCE_CHARS is pinned to Google's documented 1024-codepoint limit,
        // so a request that passes application validation can always be sent.
        // A 5000-char string would validate locally and then fail at the provider.
        expect(MAX_SOURCE_CHARS).toBeLessThanOrEqual(GOOGLE_MAX_CODEPOINTS_PER_CONTENT);
        const res = await post({ ...validBody, sourceText: 'x'.repeat(MAX_SOURCE_CHARS) });
        expect(res.status).toBe(200);
        expect(TRANSLATION_CHARACTER_QUOTA).toBeGreaterThan(MAX_SOURCE_CHARS);
    });

    it('rejects a string above the contract ceiling', async () => {
        await expectError(
            await post({ ...validBody, sourceText: 'x'.repeat(MAX_SOURCE_CHARS + 1) }),
            'SOURCE_TEXT_TOO_LONG',
            413
        );
    });

    it('§113 target quota blocks a fifth distinct target from one caller', async () => {
        configureProvider();
        resetTargetQuotaWindows();
        // Confirms fr/de/es/tr — four distinct targets, the documented ceiling.
        vi.stubGlobal(
            'fetch',
            vi.fn(async (input: RequestInfo | URL) => {
                const url = String(input);
                if (url.includes('supportedLanguages')) {
                    return new Response(
                        JSON.stringify({
                            languages: ['fr', 'de', 'es', 'tr', 'it'].map((code) => ({
                                languageCode: code,
                                supportTarget: true,
                            })),
                        }),
                        { status: 200, headers: { 'Content-Type': 'application/json' } }
                    );
                }
                return new Response(JSON.stringify({ translations: [{ translatedText: 'ok' }] }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            })
        );

        const attempt = (targetLanguage: string) =>
            post({ ...validBody, targetLanguage, sourceText: `Hello ${targetLanguage}` }, undefined, '198.51.100.7');

        for (const code of ['fr', 'de', 'es', 'tr']) {
            const res = await attempt(code);
            expect(res.status, `target ${code} should be allowed`).toBe(200);
        }
        // Fifth distinct target must be refused.
        await expectError(await attempt('it'), 'TARGET_QUOTA_EXCEEDED', 429);

        // Re-requesting an already-used target is still fine.
        expect((await attempt('fr')).status).toBe(200);
    });

    it('maps a provider failure to a structured 502 rather than a 200', async () => {
        configureProvider();
        let call = 0;
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                call += 1;
                if (call === 1) {
                    return new Response(
                        JSON.stringify({ languages: [{ languageCode: 'fr', supportTarget: true }] }),
                        { status: 200, headers: { 'Content-Type': 'application/json' } }
                    );
                }
                return new Response('boom', { status: 500 });
            })
        );
        const res = await post(validBody);
        const body = await expectError(res, 'PROVIDER_ERROR', 502);
        expect(body.error.retryable).toBe(true);
    });

    it('maps a provider 403 to 429 quota semantics', async () => {
        configureProvider();
        let call = 0;
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                call += 1;
                if (call === 1) {
                    return new Response(
                        JSON.stringify({ languages: [{ languageCode: 'fr', supportTarget: true }] }),
                        { status: 200, headers: { 'Content-Type': 'application/json' } }
                    );
                }
                return new Response('denied', { status: 403 });
            })
        );
        await expectError(await post(validBody), 'QUOTA_EXCEEDED', 429);
    });

    it('rejects a provider response with a missing translation', async () => {
        configureProvider();
        let call = 0;
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                call += 1;
                if (call === 1) {
                    return new Response(
                        JSON.stringify({ languages: [{ languageCode: 'fr', supportTarget: true }] }),
                        { status: 200, headers: { 'Content-Type': 'application/json' } }
                    );
                }
                return new Response(JSON.stringify({ translations: [{}] }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            })
        );
        await expectError(await post(validBody), 'PROVIDER_ERROR', 502);
    });

    it('§111 a burst from one caller is rate limited', async () => {
        configureProvider();
        resetTargetQuotaWindows();
        vi.stubGlobal('fetch', stubGoogleFetch());

        // One fixed caller, repeatedly. TRANSLATION_RATE_LIMIT is 10/min.
        let sawRateLimit = false;
        for (let i = 0; i < 14; i += 1) {
            const res = await post(validBody, undefined, '198.51.100.99');
            if (res.status === 429) {
                const body = await res.json();
                expect(body.error.code).toBe('RATE_LIMITED');
                expect(res.headers.get('retry-after')).toBe('60');
                sawRateLimit = true;
                break;
            }
            expect(res.status).toBe(200);
        }
        expect(sawRateLimit).toBe(true);
    });

    it('error responses are never cacheable', async () => {
        const res = await post({ ...validBody, sourceLanguage: 'ar' });
        expect(res.headers.get('cache-control')).toBe('no-store');
    });
});
