import { describe, it, expect, vi } from 'vitest';
import { fetchSelectableTargets, translateText, TRANSLATE_ENDPOINT } from './api';

const IDENTITY = {
    engineVersion: 'v1',
    glossaryVersion: 'none',
    modelIdentifier: 'projects/p/locations/global/models/general/nmt',
    providerId: 'google-advanced-v3',
};

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function errorBody(code: string, message = 'nope', retryable = false) {
    return { ok: false, error: { code, message, retryable } };
}

describe('T3 · api · GET /api/translate', () => {
    it('requests the locked endpoint with no-store', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse({ ok: true, languages: [] }));
        await fetchSelectableTargets(fetchImpl as unknown as typeof fetch);
        expect(fetchImpl).toHaveBeenCalledTimes(1);
        const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
        expect(url).toBe(TRANSLATE_ENDPOINT);
        expect(init.method).toBe('GET');
        expect(init.cache).toBe('no-store');
    });

    it('returns only provider-verified targets', async () => {
        const fetchImpl = vi.fn(async () =>
            jsonResponse({
                ok: true,
                languages: [
                    { code: 'fr', displayName: 'French', nativeName: 'Français', rtl: false },
                    { code: 'de', displayName: 'German', nativeName: 'Deutsch', rtl: false },
                ],
            })
        );
        const result = await fetchSelectableTargets(fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.languages.map((entry) => entry.code)).toEqual(['fr', 'de']);
        }
    });

    it('preserves PROVIDER_NOT_CONFIGURED as a 503, never as an empty list', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse(errorBody('PROVIDER_NOT_CONFIGURED', 'no provider', true), 503));
        const result = await fetchSelectableTargets(fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.status).toBe(503);
            expect(result.error.code).toBe('PROVIDER_NOT_CONFIGURED');
            expect(result.error.retryable).toBe(true);
        }
    });

    it('keeps PROVIDER_CAPABILITY_UNAVAILABLE distinct from NOT_CONFIGURED', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse(errorBody('PROVIDER_CAPABILITY_UNAVAILABLE', 'vendor down', true), 503));
        const result = await fetchSelectableTargets(fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe('PROVIDER_CAPABILITY_UNAVAILABLE');
            expect(result.error.code).not.toBe('PROVIDER_NOT_CONFIGURED');
        }
    });

    it('reports a rate limit distinctly from an outage', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse(errorBody('RATE_LIMITED', 'slow down', true), 429));
        const result = await fetchSelectableTargets(fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(429);
    });

    it('treats a malformed 200 as a failure, not as "no languages"', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse({ ok: true }));
        const result = await fetchSelectableTargets(fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.code).toBe('MALFORMED_RESPONSE');
    });

    it('drops malformed entries but keeps the valid ones', async () => {
        const fetchImpl = vi.fn(async () =>
            jsonResponse({
                ok: true,
                languages: [
                    { code: 'fr', displayName: 'French', nativeName: 'Français', rtl: false },
                    { code: 'de', displayName: 'German' },
                    null,
                ],
            })
        );
        const result = await fetchSelectableTargets(fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.data.languages.map((entry) => entry.code)).toEqual(['fr']);
    });

    it('never throws on a transport failure', async () => {
        const fetchImpl = vi.fn(async () => {
            throw new Error('offline');
        });
        const result = await fetchSelectableTargets(fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe('NETWORK_ERROR');
            expect(result.error.retryable).toBe(true);
        }
    });

    it('never throws on an unparseable body', async () => {
        const fetchImpl = vi.fn(async () => new Response('<html>oops</html>', { status: 200 }));
        const result = await fetchSelectableTargets(fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(false);
    });
});

describe('T3 · api · POST /api/translate', () => {
    const valid = {
        sourceLanguage: 'en',
        targetLanguage: 'fr',
        sourceText: 'Get started',
        surface: 'hero' as const,
    };

    it('sends exactly the fields the route expects', async () => {
        const fetchImpl = vi.fn(async () =>
            jsonResponse({ ok: true, sourceLanguage: 'en', targetLanguage: 'fr', surface: 'hero', translations: ['Commencez'], identity: IDENTITY })
        );
        await translateText(valid, fetchImpl as unknown as typeof fetch);
        const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
        expect(url).toBe(TRANSLATE_ENDPOINT);
        expect(init.method).toBe('POST');
        expect(init.cache).toBe('no-store');
        expect(JSON.parse(init.body as string)).toEqual({
            sourceLanguage: 'en',
            targetLanguage: 'fr',
            sourceText: 'Get started',
            surface: 'hero',
        });
    });

    it('returns the translation and the identity needed for cache keying', async () => {
        const fetchImpl = vi.fn(async () =>
            jsonResponse({ ok: true, sourceLanguage: 'en', targetLanguage: 'fr', surface: 'hero', translations: ['Commencez'], identity: IDENTITY })
        );
        const result = await translateText(valid, fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.translations).toEqual(['Commencez']);
            expect(result.data.identity).toEqual(IDENTITY);
        }
    });

    it('discards a response with no identity rather than caching it blindly', async () => {
        const fetchImpl = vi.fn(async () =>
            jsonResponse({ ok: true, sourceLanguage: 'en', targetLanguage: 'fr', surface: 'hero', translations: ['Commencez'] })
        );
        const result = await translateText(valid, fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.code).toBe('MALFORMED_RESPONSE');
    });

    it('discards a response with no translations', async () => {
        const fetchImpl = vi.fn(async () =>
            jsonResponse({ ok: true, sourceLanguage: 'en', targetLanguage: 'fr', surface: 'hero', translations: [], identity: IDENTITY })
        );
        const result = await translateText(valid, fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(false);
    });

    it.each([
        ['empty text', { sourceText: '' }],
        ['whitespace-only text', { sourceText: '   ' }],
    ])('rejects %s without spending a request', async (_label, override) => {
        const fetchImpl = vi.fn();
        const result = await translateText({ ...valid, ...override }, fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(false);
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('rejects text beyond the per-string ceiling without spending a request', async () => {
        const fetchImpl = vi.fn();
        const result = await translateText(
            { ...valid, sourceText: 'x'.repeat(1025) },
            fetchImpl as unknown as typeof fetch
        );
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.code).toBe('SOURCE_TEXT_TOO_LONG');
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('rejects a surface outside the allowlist without spending a request', async () => {
        const fetchImpl = vi.fn();
        const result = await translateText(
            { ...valid, surface: 'checkout' as never },
            fetchImpl as unknown as typeof fetch
        );
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.code).toBe('UNKNOWN_SURFACE');
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('surfaces a 429 without throwing', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse(errorBody('RATE_LIMITED', 'slow down', true), 429));
        const result = await translateText(valid, fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.status).toBe(429);
            expect(result.error.code).toBe('RATE_LIMITED');
        }
    });

    it('surfaces a 502 provider failure without throwing', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse(errorBody('PROVIDER_ERROR', 'vendor exploded', true), 502));
        const result = await translateText(valid, fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(502);
    });

    it('never throws on a transport failure', async () => {
        const fetchImpl = vi.fn(async () => {
            throw new Error('offline');
        });
        const result = await translateText(valid, fetchImpl as unknown as typeof fetch);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.code).toBe('NETWORK_ERROR');
    });
});
