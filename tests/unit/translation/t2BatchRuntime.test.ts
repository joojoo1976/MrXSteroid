import { describe, expect, it, vi } from 'vitest';
import { translateBatchRequest, validateBatchResponseMapping } from '../../../server/translation/batchRuntime';
import type { TranslationProvider } from '../../../server/translation/provider';
import { TranslationProviderError } from '../../../server/translation/provider';
import { issueTranslationSession } from '../../../server/translation/session';
import { MemoryTranslationBudgetStore, type TranslationBudgetLimits } from '../../../server/translation/budget';
import { MemoryTranslationRateLimiter } from '../../../server/translation/rateLimit';
import { TranslationCircuitBreaker } from '../../../server/translation/circuitBreaker';

const SECRET = 't2-test-session-secret-with-more-than-32-characters';
const limits: TranslationBudgetLimits = {
    maxSessionRequests: 8,
    maxSessionCharacters: 8_192,
    maxRouteCharacters: 100_000,
    maxDailyCharacters: 100_000,
    maxGlobalDailyCharacters: 1_000_000,
    maxTargetsPerDay: 4,
};
const payload = {
    sourceLanguage: 'en', targetLanguage: 'de',
    items: [
        { id: 'heading', sourceText: 'Welcome {name}', surface: 'public-content' },
        { id: 'heading-copy', sourceText: 'Welcome {name}', surface: 'public-content' },
        { id: 'cta', sourceText: 'Start order MX-2026-001', surface: 'public-content' },
    ],
};

function makeProvider(translate = vi.fn(async ({ texts }: { texts: readonly string[] }) => ({ texts: texts.map((text) => `DE:${text}`) }))): TranslationProvider {
    return {
        identity: { providerId: 'mock-google', modelIdentifier: 'general/nmt' },
        supportsLanguage: () => true,
        translate: translate as TranslationProvider['translate'],
    };
}
function deps(overrides: Partial<Parameters<typeof translateBatchRequest>[0]> = {}) {
    const routePath = '/about';
    const token = issueTranslationSession({
        sessionId: 't2-session', targetLanguage: 'de', routePath, routeClass: 'PUBLIC_TRANSLATABLE',
        surface: 'public-content', ttlMs: 60_000, maxRequests: 8, maxCharacters: 8192,
    }, SECRET);
    return {
        request: new Request('https://www.mrxsteroid.com/api/translate', { headers: { origin: 'https://www.mrxsteroid.com' } }),
        payload,
        createProvider: () => makeProvider(),
        resolveVerifiedTargets: async () => new Set(['de']),
        clientId: 'client', routePath, sessionToken: token, sessionSecret: SECRET,
        budgetStore: new MemoryTranslationBudgetStore(), budgetLimits: limits,
        rateLimiter: new MemoryTranslationRateLimiter(),
        circuitBreaker: new TranslationCircuitBreaker({ failureThreshold: 2, openDurationMs: 100 }),
        ...overrides,
    };
}

describe('T2 batch response ID validator', () => {
    it.each([
        ['missing', [{ id: 'a', translatedText: 'A' }]],
        ['duplicate', [{ id: 'a', translatedText: 'A' }, { id: 'a', translatedText: 'B' }]],
        ['unexpected', [{ id: 'a', translatedText: 'A' }, { id: 'x', translatedText: 'X' }]],
    ])('rejects %s response IDs', (_label, items) => {
        expect(() => validateBatchResponseMapping(['a', 'b'], items)).toThrow();
    });
    it('accepts a complete order-independent bijection', () => {
        expect(() => validateBatchResponseMapping(['a', 'b'], [{ id: 'b', translatedText: 'B' }, { id: 'a', translatedText: 'A' }])).not.toThrow();
    });
});
describe('T2 server batch runtime', () => {
    it('deduplicates provider input but maps restored output to every stable ID', async () => {
        const translate = vi.fn(async ({ texts }: { texts: readonly string[] }) => ({ texts: texts.map((text) => `Übersetzt ${text}`) }));
        const result = await translateBatchRequest(deps({ createProvider: () => makeProvider(translate) }));
        expect(translate).toHaveBeenCalledTimes(1);
        expect(translate.mock.calls[0][0].texts).toHaveLength(2);
        expect(result.items.map((item) => item.id)).toEqual(['heading', 'heading-copy', 'cta']);
        expect(result.items[0].translatedText).toContain('{name}');
        expect(result.items[2].translatedText).toContain('MX-2026-001');
    });

    it.each([
        ['duplicate IDs', { ...payload, items: [payload.items[0], payload.items[0]] }, 'INVALID_BATCH_IDS'],
        ['Arabic source', { ...payload, sourceLanguage: 'ar' }, 'INVALID_SOURCE_LANGUAGE'],
        ['mixed surfaces', { ...payload, items: [payload.items[0], { ...payload.items[2], surface: 'hero' }] }, 'TRANSLATION_ROUTE_BLOCKED'],
    ])('rejects %s before provider invocation', async (_label, badPayload, code) => {
        const translate = vi.fn();
        await expect(translateBatchRequest(deps({ payload: badPayload, createProvider: () => makeProvider(translate) }))).rejects.toMatchObject({ code });
        expect(translate).not.toHaveBeenCalled();
    });

    it.each(['/checkout', '/profile', '/admin', '/api/payments/webhook'])('rejects protected route %s', async (routePath) => {
        const translate = vi.fn();
        await expect(translateBatchRequest(deps({ routePath, createProvider: () => makeProvider(translate) }))).rejects.toMatchObject({ code: 'TRANSLATION_ROUTE_BLOCKED' });
        expect(translate).not.toHaveBeenCalled();
    });

    it('rejects expired and context-mismatched sessions', async () => {
        const expired = issueTranslationSession({ sessionId: 'expired', targetLanguage: 'de', routePath: '/about', routeClass: 'PUBLIC_TRANSLATABLE', surface: 'public-content', now: 1, ttlMs: 1, maxRequests: 8, maxCharacters: 8192 }, SECRET);
        await expect(translateBatchRequest(deps({ sessionToken: expired }))).rejects.toMatchObject({ code: 'TRANSLATION_SESSION_EXPIRED' });
        const wrong = issueTranslationSession({ sessionId: 'wrong', targetLanguage: 'fr', routePath: '/about', routeClass: 'PUBLIC_TRANSLATABLE', surface: 'public-content', ttlMs: 60_000, maxRequests: 8, maxCharacters: 8192 }, SECRET);
        await expect(translateBatchRequest(deps({ sessionToken: wrong }))).rejects.toMatchObject({ code: 'TRANSLATION_SESSION_CONTEXT_MISMATCH' });
    });

    it.each([
        ['session', { maxSessionCharacters: 1 }],
        ['route', { maxRouteCharacters: 1 }],
        ['daily', { maxDailyCharacters: 1 }],
        ['global', { maxGlobalDailyCharacters: 1 }],
    ])('enforces the %s budget before provider invocation', async (_scope, override) => {
        const translate = vi.fn();
        await expect(translateBatchRequest(deps({ budgetLimits: { ...limits, ...override }, createProvider: () => makeProvider(translate) }))).rejects.toMatchObject({ code: 'TRANSLATION_BUDGET_EXCEEDED' });
        expect(translate).not.toHaveBeenCalled();
    });

    it('rejects provider count mismatches and every sentinel corruption mode', async () => {
        const cases = [
            ['count', () => ({ texts: ['only one'] })],
            ['missing', ({ texts }: { texts: readonly string[] }) => ({ texts: texts.map((text) => text.replace('__MRX_TOKEN_0__', '')) })],
            ['duplicate', ({ texts }: { texts: readonly string[] }) => ({ texts: texts.map((text) => `${text} __MRX_TOKEN_0__`) })],
            ['unknown', ({ texts }: { texts: readonly string[] }) => ({ texts: texts.map((text) => `${text} __MRX_TOKEN_999__`) })],
            ['malformed', ({ texts }: { texts: readonly string[] }) => ({ texts: texts.map((text) => text.replace('__MRX_TOKEN_0__', '_MRX_TOKEN_0_')) })],
        ] as const;
        for (const [kind, implementation] of cases) {
            const translate = vi.fn(async (input: { texts: readonly string[] }) => implementation(input));
            await expect(translateBatchRequest(deps({ createProvider: () => makeProvider(translate) }))).rejects.toMatchObject({
                code: kind === 'count' ? 'PROVIDER_ERROR' : 'TRANSLATION_TOKEN_MISMATCH',
            });
        }
    });

    it('opens the circuit after repeated provider failures and recovers through one probe', async () => {
        let now = 0;
        const breaker = new TranslationCircuitBreaker({ failureThreshold: 2, openDurationMs: 10, now: () => now });
        const failure = vi.fn(async () => { throw new TranslationProviderError('PROVIDER_ERROR', 'failed', true); });
        await expect(translateBatchRequest(deps({ circuitBreaker: breaker, createProvider: () => makeProvider(failure) }))).rejects.toMatchObject({ code: 'PROVIDER_ERROR' });
        await expect(translateBatchRequest(deps({ circuitBreaker: breaker, createProvider: () => makeProvider(failure) }))).rejects.toMatchObject({ code: 'PROVIDER_ERROR' });
        await expect(translateBatchRequest(deps({ circuitBreaker: breaker }))).rejects.toMatchObject({ code: 'TRANSLATION_CIRCUIT_OPEN' });
        now = 10;
        await expect(translateBatchRequest(deps({ circuitBreaker: breaker }))).resolves.toMatchObject({ targetLanguage: 'de' });
        expect(breaker.snapshot().state).toBe('closed');
    });
    it('maps provider failure and timeout without returning partial output', async () => {
        for (const error of [
            new TranslationProviderError('PROVIDER_ERROR', 'failed', true),
            new TranslationProviderError('TIMEOUT', 'timed out', true),
        ]) {
            const translate = vi.fn(async () => { throw error; });
            await expect(translateBatchRequest(deps({ createProvider: () => makeProvider(translate) }))).rejects.toMatchObject({ code: error.code });
        }
    });
});