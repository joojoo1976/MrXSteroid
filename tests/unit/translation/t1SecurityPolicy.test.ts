import { describe, expect, it } from 'vitest';
import {
    issueTranslationSession,
    verifyTranslationSession,
} from '../../../server/translation/session';
import { classifyTranslationRoute, isSurfaceAllowedForRoute, resolveRequestRoutePath } from '../../../server/translation/policy';
import {
    MemoryTranslationBudgetStore,
    createTranslationBudgetStoreFromEnv,
    type TranslationBudgetLimits,
} from '../../../server/translation/budget';
import {
    MemoryTranslationRateLimiter,
    createTranslationRateLimiterFromEnv,
} from '../../../server/translation/rateLimit';
import {
    TranslationCircuitBreaker,
    TranslationCircuitOpenError,
} from '../../../server/translation/circuitBreaker';
import { safeTranslationAuditEvent } from '../../../server/translation/audit';
import { TranslationProviderError } from '../../../server/translation/provider';

const SECRET = 'test-only-translation-session-secret-32-characters';

const sessionInput = {
    sessionId: 'session-1',
    targetLanguage: 'de',
    routePath: '/about',
    routeClass: 'PUBLIC_TRANSLATABLE',
    surface: 'public-content',
    now: 1_000,
    ttlMs: 100,
    maxRequests: 8,
    maxCharacters: 8_192,
};

describe('T1-B · signed translation session (§25–§27)', () => {
    it('issues and verifies a bounded English-source session', () => {
        const token = issueTranslationSession(sessionInput, SECRET);
        const result = verifyTranslationSession(token, SECRET, 1_001);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.claims.sourceLanguage).toBe('en');
            expect(result.claims.routePath).toBe('/about');
            expect(result.claims.maxRequests).toBe(8);
            expect(result.claims.maxCharacters).toBe(8_192);
        }
    });

    it('rejects tampered, wrong-secret and expired sessions', () => {
        const token = issueTranslationSession({ ...sessionInput, ttlMs: 100 }, SECRET);
        const [payload, signature] = token.split('.');
        expect(verifyTranslationSession(`${payload}x.${signature}`, SECRET, 1_001)).toEqual({ ok: false, code: 'TRANSLATION_SESSION_INVALID' });
        expect(verifyTranslationSession(token, `${SECRET}-wrong`, 1_001)).toEqual({ ok: false, code: 'TRANSLATION_SESSION_INVALID' });
        expect(verifyTranslationSession(token, SECRET, 1_100)).toEqual({ ok: false, code: 'TRANSLATION_SESSION_EXPIRED' });
    });
});

describe('T1-B · budgets and production adapters (§28–§30)', () => {
    const limits: TranslationBudgetLimits = {
        maxSessionRequests: 2,
        maxSessionCharacters: 10,
        maxRouteCharacters: 20,
        maxDailyCharacters: 30,
        maxGlobalDailyCharacters: 40,
        maxTargetsPerDay: 4,
    };
    const context = { sessionId: 's1', sessionExpiresAt: 10_000, clientId: 'c1', routePath: '/about', targetLanguage: 'de', characters: 5 };

    it('atomically enforces session request and character budgets', async () => {
        const store = new MemoryTranslationBudgetStore();
        expect((await store.consume(context, limits, 1_000)).allowed).toBe(true);
        expect((await store.consume(context, limits, 1_001)).allowed).toBe(true);
        expect(await store.consume(context, limits, 1_002)).toEqual({ allowed: false, code: 'TRANSLATION_BUDGET_EXCEEDED', scope: 'session' });
    });

    it('labels memory adapters non-persistent and requires Upstash for production stores', () => {
        const savedUrl = process.env.UPSTASH_REDIS_REST_URL;
        const savedToken = process.env.UPSTASH_REDIS_REST_TOKEN;
        delete process.env.UPSTASH_REDIS_REST_URL;
        delete process.env.UPSTASH_REDIS_REST_TOKEN;
        try {
            expect(new MemoryTranslationBudgetStore().persistent).toBe(false);
            expect(new MemoryTranslationRateLimiter().persistent).toBe(false);
            expect(createTranslationBudgetStoreFromEnv()).toBeNull();
            expect(createTranslationRateLimiterFromEnv()).toBeNull();
        } finally {
            if (savedUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = savedUrl;
            if (savedToken !== undefined) process.env.UPSTASH_REDIS_REST_TOKEN = savedToken;
        }
    });

    it('rate-limits the test adapter without claiming persistence', async () => {
        const limiter = new MemoryTranslationRateLimiter(2, 60_000, () => 1_000);
        expect((await limiter.limit('client')).success).toBe(true);
        expect((await limiter.limit('client')).success).toBe(true);
        expect((await limiter.limit('client')).success).toBe(false);
        expect(limiter.persistent).toBe(false);
    });
});

describe('T1-B · circuit breaker (§30)', () => {
    it('transitions closed → open → half-open → closed', async () => {
        let now = 0;
        const breaker = new TranslationCircuitBreaker({ failureThreshold: 2, openDurationMs: 100, now: () => now });
        const fail = () => Promise.reject(new TranslationProviderError('PROVIDER_ERROR', 'failed', true));
        await expect(breaker.execute(fail)).rejects.toThrow('failed');
        await expect(breaker.execute(fail)).rejects.toThrow('failed');
        expect(breaker.snapshot().state).toBe('open');
        await expect(breaker.execute(async () => 'blocked')).rejects.toBeInstanceOf(TranslationCircuitOpenError);
        now = 100;
        expect(breaker.snapshot().state).toBe('half-open');
        await expect(breaker.execute(async () => 'ok')).resolves.toBe('ok');
        expect(breaker.snapshot().state).toBe('closed');
    });

    it('permits only one concurrent half-open probe', async () => {
        let now = 0;
        const breaker = new TranslationCircuitBreaker({ failureThreshold: 1, openDurationMs: 10, now: () => now });
        await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
        now = 10;
        let release!: () => void;
        const pending = breaker.execute(() => new Promise<string>((resolve) => { release = () => resolve('ok'); }));
        await expect(breaker.execute(async () => 'second')).rejects.toBeInstanceOf(TranslationCircuitOpenError);
        release();
        await expect(pending).resolves.toBe('ok');
    });
});

describe('T1-B · safe audit metadata (§123)', () => {
    it('has no field capable of carrying source text, tokens or credentials', () => {
        const event = safeTranslationAuditEvent({
            event: 'request_rejected', code: 'BLOCKED', routeClass: 'PAYMENT_PROTECTED',
            surface: 'public-content', targetLanguage: 'de', characters: 42,
        });
        expect(Object.keys(event).sort()).toEqual(['characters', 'code', 'event', 'routeClass', 'surface', 'targetLanguage'].sort());
        const serialized = JSON.stringify(event);
        for (const sensitive of [SECRET, 'original private text', 'session.token.value', 'redis-credential', '[[MRX_0_deadbeef]]']) {
            expect(serialized).not.toContain(sensitive);
        }
    });

    it.each([
        'PROVIDER_UNAVAILABLE',
        'TRANSLATION_SESSION_INVALID',
        'TRANSLATION_BUDGET_EXCEEDED',
        'RATE_LIMITED',
        'TRANSLATION_CIRCUIT_OPEN',
        'TRANSLATION_STORAGE_UNAVAILABLE',
        'TRANSLATION_REJECTED',
    ])('preserves the distinct safe rejection reason %s', (code) => {
        expect(safeTranslationAuditEvent({ event: 'request_rejected', code })).toEqual({ event: 'request_rejected', code });
    });
});

describe('T1-C · route policy (§34–§37, §113–§119)', () => {
    it('allows an explicitly classified public route and locale-prefixed equivalent', () => {
        expect(classifyTranslationRoute('/about').routeClass).toBe('PUBLIC_TRANSLATABLE');
        expect(classifyTranslationRoute('/en/about').translatable).toBe(true);
        expect(isSurfaceAllowedForRoute('/ar/smarttools', 'public-tools')).toBe(true);
    });

    it.each([
        ['/login', 'PUBLIC_PROTECTED'],
        ['/profile', 'AUTHENTICATED_PROTECTED'],
        ['/admin', 'ADMIN_PROTECTED'],
        ['/checkout', 'PAYMENT_PROTECTED'],
        ['/api/payments/webhook', 'WEBHOOK_PROTECTED'],
        ['/api/geo', 'API_PROTECTED'],
        ['/not-classified', 'UNKNOWN_PROTECTED'],
    ])('denies protected or unknown route %s', (path, routeClass) => {
        const policy = classifyTranslationRoute(path);
        expect(policy.routeClass).toBe(routeClass);
        expect(policy.translatable).toBe(false);
        expect(policy.allowedSurfaces).toHaveLength(0);
    });

    it('derives route context only from a same-origin Referer', () => {
        expect(resolveRequestRoutePath(new Request('https://www.mrxsteroid.com/api/translate', { headers: { referer: 'https://www.mrxsteroid.com/en/about' } }))).toBe('/about');
        expect(resolveRequestRoutePath(new Request('https://www.mrxsteroid.com/api/translate', { headers: { referer: 'https://evil.example/about' } }))).toBeNull();
        expect(resolveRequestRoutePath(new Request('https://www.mrxsteroid.com/api/translate'))).toBeNull();
    });
    it('does not let a forged public surface override a protected route', () => {
        expect(isSurfaceAllowedForRoute('/checkout', 'public-content')).toBe(false);
        expect(isSurfaceAllowedForRoute('/api/translate', 'hero')).toBe(false);
    });
});
