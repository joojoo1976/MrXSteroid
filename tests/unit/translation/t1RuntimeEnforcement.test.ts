import { describe, expect, it, vi } from 'vitest';
import { translateRequest } from '../../../server/translation/runtime';
import type { TranslationProvider } from '../../../server/translation/provider';
import { issueTranslationSession } from '../../../server/translation/session';
import { MemoryTranslationBudgetStore } from '../../../server/translation/budget';
import { MemoryTranslationRateLimiter } from '../../../server/translation/rateLimit';
import { TranslationCircuitBreaker } from '../../../server/translation/circuitBreaker';

const SECRET = 'test-only-translation-session-secret-32-characters';

function provider(translate = vi.fn(async () => ({ texts: ['Übersetzt'] }))): TranslationProvider {
    return {
        identity: { providerId: 'test-provider', modelIdentifier: 'test-model' },
        supportsLanguage: () => true,
        translate,
    };
}

function deps(overrides: Partial<Parameters<typeof translateRequest>[0]> = {}) {
    const routePath = '/about';
    const targetLanguage = 'de';
    const surface = 'public-content';
    const token = issueTranslationSession({
        sessionId: 'runtime-session', targetLanguage, routePath,
        routeClass: 'PUBLIC_TRANSLATABLE', surface, ttlMs: 60_000, maxRequests: 8, maxCharacters: 8_192,
    }, SECRET);
    return {
        request: new Request('https://www.mrxsteroid.com/api/translate', { headers: { origin: 'https://www.mrxsteroid.com' } }),
        payload: { sourceLanguage: 'en', targetLanguage, sourceText: 'Welcome', surface },
        createProvider: () => provider(),
        resolveVerifiedTargets: async () => new Set(['de']),
        clientId: 'client-1', routePath, sessionToken: token, sessionSecret: SECRET,
        budgetStore: new MemoryTranslationBudgetStore(),
        budgetLimits: { maxSessionRequests: 8, maxSessionCharacters: 8192, maxRouteCharacters: 10000, maxDailyCharacters: 10000, maxGlobalDailyCharacters: 10000, maxTargetsPerDay: 4 },
        rateLimiter: new MemoryTranslationRateLimiter(),
        circuitBreaker: new TranslationCircuitBreaker({ failureThreshold: 5, openDurationMs: 60_000 }),
        ...overrides,
    };
}

describe('T1-B/T1-C · runtime enforcement', () => {
    it('allows a signed public request and calls the provider once', async () => {
        const translate = vi.fn(async () => ({ texts: ['Willkommen'] }));
        const result = await translateRequest(deps({ createProvider: () => provider(translate) }));
        expect(result.translations).toEqual(['Willkommen']);
        expect(translate).toHaveBeenCalledTimes(1);
    });

    it('rejects missing, expired and context-mismatched sessions before the provider', async () => {
        const translate = vi.fn(async () => ({ texts: ['x'] }));
        await expect(translateRequest(deps({ sessionToken: undefined, createProvider: () => provider(translate) }))).rejects.toMatchObject({ code: 'TRANSLATION_SESSION_REQUIRED' });
        const expired = issueTranslationSession({ sessionId: 'expired', targetLanguage: 'de', routePath: '/about', routeClass: 'PUBLIC_TRANSLATABLE', surface: 'public-content', now: 1, ttlMs: 1, maxRequests: 8, maxCharacters: 8_192 }, SECRET);
        await expect(translateRequest(deps({ sessionToken: expired, createProvider: () => provider(translate) }))).rejects.toMatchObject({ code: 'TRANSLATION_SESSION_EXPIRED' });
        await expect(translateRequest(deps({ routePath: '/blog', createProvider: () => provider(translate) }))).rejects.toMatchObject({ code: 'TRANSLATION_SESSION_CONTEXT_MISMATCH' });
        expect(translate).not.toHaveBeenCalled();
    });

    it('rejects tampered, wrong-target and wrong-surface sessions before provider invocation', async () => {
        const translate = vi.fn(async () => ({ texts: ['x'] }));
        const base = deps({ createProvider: () => provider(translate) });
        const tampered = `${base.sessionToken}x`;
        await expect(translateRequest({ ...base, sessionToken: tampered })).rejects.toMatchObject({ code: 'TRANSLATION_SESSION_INVALID' });
        const wrongTarget = issueTranslationSession({
            sessionId: 'wrong-target', targetLanguage: 'fr', routePath: '/about',
            routeClass: 'PUBLIC_TRANSLATABLE', surface: 'public-content', ttlMs: 60_000, maxRequests: 8, maxCharacters: 8_192,
        }, SECRET);
        await expect(translateRequest({ ...base, sessionToken: wrongTarget })).rejects.toMatchObject({ code: 'TRANSLATION_SESSION_CONTEXT_MISMATCH' });
        const wrongSurface = issueTranslationSession({
            sessionId: 'wrong-surface', targetLanguage: 'de', routePath: '/about',
            routeClass: 'PUBLIC_TRANSLATABLE', surface: 'hero', ttlMs: 60_000, maxRequests: 8, maxCharacters: 8_192,
        }, SECRET);
        await expect(translateRequest({ ...base, sessionToken: wrongSurface })).rejects.toMatchObject({ code: 'TRANSLATION_SESSION_CONTEXT_MISMATCH' });
        expect(translate).not.toHaveBeenCalled();
    });

    it('enforces session request and character budgets through the shared budget store', async () => {
        const translate = vi.fn(async () => ({ texts: ['Übersetzt'] }));
        const budgetStore = new MemoryTranslationBudgetStore();
        const first = deps({
            createProvider: () => provider(translate), budgetStore,
            budgetLimits: { maxSessionRequests: 1, maxSessionCharacters: 7, maxRouteCharacters: 100, maxDailyCharacters: 100, maxGlobalDailyCharacters: 100, maxTargetsPerDay: 4 },
        });
        await expect(translateRequest(first)).resolves.toMatchObject({ translations: ['Übersetzt'] });
        await expect(translateRequest(first)).rejects.toMatchObject({ code: 'TRANSLATION_BUDGET_EXCEEDED' });
        expect(translate).toHaveBeenCalledTimes(1);
    });
    it.each(['/checkout', '/profile', '/admin', '/api/payments/create-invoice', '/unknown'])('default-denies route %s before provider invocation', async (routePath) => {
        const translate = vi.fn(async () => ({ texts: ['x'] }));
        await expect(translateRequest(deps({ routePath, createProvider: () => provider(translate) }))).rejects.toMatchObject({ code: 'TRANSLATION_ROUTE_BLOCKED' });
        expect(translate).not.toHaveBeenCalled();
    });

    it('does not trust a forged public surface on a payment route', async () => {
        const translate = vi.fn(async () => ({ texts: ['x'] }));
        await expect(translateRequest(deps({ routePath: '/checkout', payload: { sourceLanguage: 'en', targetLanguage: 'de', sourceText: 'Pay now', surface: 'hero' }, createProvider: () => provider(translate) }))).rejects.toMatchObject({ code: 'TRANSLATION_ROUTE_BLOCKED' });
        expect(translate).not.toHaveBeenCalled();
    });

    it('rejects requests when persistent production controls are unavailable', async () => {
        await expect(translateRequest(deps({ rateLimiter: null }))).rejects.toMatchObject({ code: 'TRANSLATION_PERSISTENT_LIMITER_UNAVAILABLE' });
    });
});
