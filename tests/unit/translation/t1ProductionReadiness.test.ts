import { describe, expect, it, vi } from 'vitest';
import {
    TRANSLATION_CONFIG_DEFAULTS,
    TRANSLATION_CONFIG_MAXIMA,
    TranslationConfigError,
    loadTranslationConfig,
} from '../../../server/translation/config';
import {
    TRANSLATION_BUDGET_LUA,
    UpstashTranslationBudgetStore,
    createTranslationBudgetStore,
    type TranslationAtomicRedis,
    type TranslationBudgetContext,
    type TranslationBudgetLimits,
} from '../../../server/translation/budget';
import {
    UpstashTranslationRateLimiter,
    createTranslationRateLimiter,
} from '../../../server/translation/rateLimit';
import {
    DistributedTranslationCircuitBreaker,
    TRANSLATION_CIRCUIT_ACQUIRE_LUA,
    TRANSLATION_CIRCUIT_COMPLETE_LUA,
    TRANSLATION_CIRCUIT_SNAPSHOT_LUA,
    TranslationCircuitOpenError,
    createDistributedTranslationCircuitBreaker,
    type TranslationCircuitRedis,
} from '../../../server/translation/circuitBreaker';
import { TranslationProviderError } from '../../../server/translation/provider';

const SECRET = 'production-grade-test-secret-at-least-32-characters';
const BASE_ENV: NodeJS.ProcessEnv = {
    TRANSLATION_SESSION_SECRET: SECRET,
    UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'private-token-value',
};

class SharedAtomicBudgetRedis implements TranslationAtomicRedis {
    readonly calls: Array<{ script: string; keys: string[]; args: string[] }> = [];
    private readonly numbers = new Map<string, number>();
    private readonly sets = new Map<string, Set<string>>();

    async eval<TResult>(script: string, keys: string[], args: string[]): Promise<TResult> {
        this.calls.push({ script, keys, args });
        const chars = Number(args[0]);
        const current = keys.slice(0, 5).map((key) => this.numbers.get(key) ?? 0);
        const targets = this.sets.get(keys[5]) ?? new Set<string>();
        const newTarget = !targets.has(args[1]);
        const scope =
            current[0] + 1 > Number(args[2]) || current[1] + chars > Number(args[3]) ? 'session' :
            current[2] + chars > Number(args[4]) ? 'route' :
            current[3] + chars > Number(args[5]) ? 'daily' :
            current[4] + chars > Number(args[6]) ? 'global' :
            newTarget && targets.size >= Number(args[7]) ? 'target' : null;
        if (scope) return [0, scope] as TResult;
        this.numbers.set(keys[0], current[0] + 1);
        this.numbers.set(keys[1], current[1] + chars);
        this.numbers.set(keys[2], current[2] + chars);
        this.numbers.set(keys[3], current[3] + chars);
        this.numbers.set(keys[4], current[4] + chars);
        targets.add(args[1]);
        this.sets.set(keys[5], targets);
        return [1, 'ok'] as TResult;
    }
}

class SharedCircuitRedis implements TranslationCircuitRedis {
    state: 'closed' | 'open' | 'half-open' | 'recovery' = 'closed';
    failures = 0;
    openedAt = 0;
    probe: string | null = null;
    active = 0;
    readonly calls: Array<{ script: string; keys: string[]; args: string[] }> = [];

    async eval<TResult>(script: string, keys: string[], args: string[]): Promise<TResult> {
        this.calls.push({ script, keys, args });
        if (script === TRANSLATION_CIRCUIT_ACQUIRE_LUA) {
            const now = Number(args[0]);
            const openMs = Number(args[1]);
            if (this.state === 'open' && now - this.openedAt < openMs) return [0, 'open', this.failures, this.openedAt] as TResult;
            if (this.state === 'open') this.state = 'half-open';
            if (this.state === 'half-open' || this.state === 'recovery') {
                if (this.probe !== null) return [0, 'recovery', this.failures, this.openedAt] as TResult;
                this.probe = args[2];
                this.state = 'recovery';
                return [1, 'recovery', this.failures, this.openedAt] as TResult;
            }
            this.active += 1;
            return [1, 'closed', this.failures, this.openedAt, this.active] as TResult;
        }
        if (script === TRANSLATION_CIRCUIT_COMPLETE_LUA) {
            const [outcome, rawNow, rawThreshold, probe] = args;
            if (this.state === 'recovery' && this.probe !== probe) return ['conflict', this.failures, this.openedAt] as TResult;
            if (this.probe === probe) this.probe = null;
            if (this.state === 'closed' && args[5] === 'closed') {
                this.active -= 1;
                if (outcome === 'failure') {
                    this.failures += 1;
                    if (this.failures >= Number(rawThreshold)) { this.state = 'open'; this.openedAt = Number(rawNow); }
                } else if (outcome === 'success' && this.active <= 0 && this.failures <= Number(args[6])) {
                    this.failures = 0; this.openedAt = 0;
                }
                return [this.state, this.failures, this.openedAt] as TResult;
            }
            if (outcome === 'success') {
                this.state = 'closed'; this.failures = 0; this.openedAt = 0;
            } else if (outcome === 'ignore') {
                if (this.state === 'recovery') this.state = 'half-open';
            } else {
                this.failures += 1;
                if (this.state === 'recovery' || this.failures >= Number(rawThreshold)) {
                    this.state = 'open'; this.openedAt = Number(rawNow);
                }
            }
            return [this.state, this.failures, this.openedAt] as TResult;
        }
        if (script === TRANSLATION_CIRCUIT_SNAPSHOT_LUA) {
            let view = this.state;
            if (view === 'open' && Number(args[0]) - this.openedAt >= Number(args[1])) view = 'half-open';
            return [view, this.failures, this.openedAt, this.probe === null ? 0 : 1] as TResult;
        }
        throw new Error('unexpected script');
    }
}

const LIMITS: TranslationBudgetLimits = {
    maxSessionRequests: 2,
    maxSessionCharacters: 10,
    maxRouteCharacters: 20,
    maxDailyCharacters: 30,
    maxGlobalDailyCharacters: 40,
    maxTargetsPerDay: 2,
};
const CONTEXT: TranslationBudgetContext = {
    sessionId: 'session',
    sessionExpiresAt: 10_000,
    clientId: 'client',
    routePath: '/about',
    targetLanguage: 'de',
    characters: 5,
};

describe('Final T1-B · centralized production-safe configuration', () => {
    it('uses documented bounded defaults while preserving server-only credentials', () => {
        const config = loadTranslationConfig(BASE_ENV, { requireProductionInfrastructure: true });
        expect(config.sessionTtlMs).toBe(TRANSLATION_CONFIG_DEFAULTS.sessionTtlMs);
        expect(config.globalDailyBudgetCharacters).toBe(TRANSLATION_CONFIG_DEFAULTS.globalDailyBudgetCharacters);
        expect(config.sessionSecret).toBe(SECRET);
        expect(config.sharedInfrastructureConfigured).toBe(true);
    });

    it.each([
        ['TRANSLATION_SESSION_TTL_MS', '0'],
        ['TRANSLATION_SESSION_MAX_REQUESTS', '-1'],
        ['TRANSLATION_SESSION_MAX_CHARACTERS', '1.5'],
        ['TRANSLATION_ROUTE_BUDGET_CHARS', String(TRANSLATION_CONFIG_MAXIMA.routeBudgetCharacters + 1)],
        ['TRANSLATION_BUDGET_CHARS', 'not-a-number'],
        ['TRANSLATION_REDIS_TIMEOUT_MS', String(TRANSLATION_CONFIG_MAXIMA.redisTimeoutMs + 1)],
    ])('rejects unsafe %s without including its value', (name, value) => {
        const env = { ...BASE_ENV, [name]: value };
        expect(() => loadTranslationConfig(env)).toThrow(TranslationConfigError);
        try { loadTranslationConfig(env); } catch (error) {
            expect(String(error)).toContain(name);
            expect(String(error)).not.toContain(value);
            expect(String(error)).not.toContain(SECRET);
            expect(String(error)).not.toContain(BASE_ENV.UPSTASH_REDIS_REST_TOKEN!);
        }
    });

    it('requires secret and paired Upstash credentials for production activation', () => {
        expect(() => loadTranslationConfig({}, { requireProductionInfrastructure: true })).toThrow(/TRANSLATION_SESSION_SECRET/);
        expect(() => loadTranslationConfig({ UPSTASH_REDIS_REST_URL: BASE_ENV.UPSTASH_REDIS_REST_URL }, { requireProductionInfrastructure: true })).toThrow(/UPSTASH_REDIS_REST_TOKEN/);
        expect(() => loadTranslationConfig({ ...BASE_ENV, UPSTASH_REDIS_REST_URL: 'http://insecure.example' })).toThrow(/UPSTASH_REDIS_REST_URL/);
    });
});

describe('Final T1-B · atomic shared budgets', () => {
    it('uses one atomic Lua call, isolated namespace and session/day TTL arguments', async () => {
        const redis = new SharedAtomicBudgetRedis();
        const store = new UpstashTranslationBudgetStore(redis, undefined, 100);
        await expect(store.consume(CONTEXT, LIMITS, 1_000)).resolves.toEqual({ allowed: true });
        expect(redis.calls).toHaveLength(1);
        expect(redis.calls[0].script).toBe(TRANSLATION_BUDGET_LUA);
        expect(redis.calls[0].keys).toHaveLength(6);
        expect(redis.calls[0].keys.every((key) => key.startsWith('mrx:translation:budget:'))).toBe(true);
        expect(redis.calls[0].keys.some((key) => key.includes('mrx:calculate'))).toBe(false);
        expect(Number(redis.calls[0].args[8])).toBe(9_000);
        expect(Number(redis.calls[0].args[9])).toBeGreaterThan(0);
    });

    it('shares state between instances and never partially spends a rejected request', async () => {
        const redis = new SharedAtomicBudgetRedis();
        const first = new UpstashTranslationBudgetStore(redis);
        const second = new UpstashTranslationBudgetStore(redis);
        const results = await Promise.all([
            first.consume(CONTEXT, LIMITS, 1_000),
            second.consume(CONTEXT, LIMITS, 1_000),
            first.consume(CONTEXT, LIMITS, 1_000),
        ]);
        expect(results.filter((result) => result.allowed)).toHaveLength(2);
        expect(results.filter((result) => !result.allowed)).toEqual([
            { allowed: false, code: 'TRANSLATION_BUDGET_EXCEEDED', scope: 'session' },
        ]);
        expect(await second.consume({ ...CONTEXT, characters: 1 }, { ...LIMITS, maxSessionRequests: 3, maxSessionCharacters: 11 }, 1_000)).toEqual({ allowed: true });
    });

    it.each([
        ['route', { maxSessionRequests: 10, maxSessionCharacters: 100, maxRouteCharacters: 4 }],
        ['daily', { maxSessionRequests: 10, maxSessionCharacters: 100, maxRouteCharacters: 100, maxDailyCharacters: 4 }],
        ['global', { maxSessionRequests: 10, maxSessionCharacters: 100, maxRouteCharacters: 100, maxDailyCharacters: 100, maxGlobalDailyCharacters: 4 }],
        ['target', { maxSessionRequests: 10, maxSessionCharacters: 100, maxRouteCharacters: 100, maxDailyCharacters: 100, maxGlobalDailyCharacters: 100, maxTargetsPerDay: 1 }],
    ])('rejects the %s scope atomically', async (scope, overrides) => {
        const redis = new SharedAtomicBudgetRedis();
        const store = new UpstashTranslationBudgetStore(redis);
        const limits = { ...LIMITS, ...overrides };
        if (scope === 'target') await store.consume(CONTEXT, limits, 1_000);
        const context = scope === 'target' ? { ...CONTEXT, sessionId: 'other', targetLanguage: 'fr' } : CONTEXT;
        await expect(store.consume(context, limits, 1_000)).resolves.toMatchObject({ allowed: false, scope });
    });

    it('fails closed on Redis errors and timeouts', async () => {
        const rejected = new UpstashTranslationBudgetStore({ eval: async () => { throw new Error('secret redis detail'); } });
        await expect(rejected.consume(CONTEXT, LIMITS)).rejects.toMatchObject({ code: 'TRANSLATION_STORAGE_UNAVAILABLE' });
        const hanging = new UpstashTranslationBudgetStore({ eval: () => new Promise(() => undefined) }, undefined, 5);
        await expect(hanging.consume(CONTEXT, LIMITS)).rejects.toMatchObject({ code: 'TRANSLATION_STORAGE_UNAVAILABLE' });
    });

    it('does not create a production store without paired Upstash configuration', () => {
        expect(createTranslationBudgetStore({ upstashUrl: null, upstashToken: null, redisTimeoutMs: 10 })).toBeNull();
    });
});

describe('Final T1-B · persistent rate limiting', () => {
    it('uses a shared mrx:translation:rate namespace across limiter instances', async () => {
        const buckets = new Map<string, number>();
        const evalMock = vi.fn(async (_script: string, keys: string[]) => {
            const key = keys[0];
            const count = (buckets.get(key) ?? 0) + 1;
            buckets.set(key, count);
            return [count <= 2 ? 2 - count : -1, 2];
        });
        const redis = {
            evalsha: vi.fn(async (...args: Parameters<typeof evalMock>) => evalMock(...args)),
            eval: evalMock,
        } as never;
        const first = new UpstashTranslationRateLimiter(redis, 2, 100);
        const second = new UpstashTranslationRateLimiter(redis, 2, 100);
        expect((await first.limit('client')).success).toBe(true);
        expect((await second.limit('client')).success).toBe(true);
        expect((await first.limit('client')).success).toBe(false);
        const serialized = JSON.stringify((redis as unknown as { evalsha: ReturnType<typeof vi.fn> }).evalsha.mock.calls);
        expect(serialized).toContain('mrx:translation:rate');
        expect(serialized).not.toContain('mrx:calculate');
    });

    it('has no memory fallback and rejects Redis failures/timeouts', async () => {
        expect(createTranslationRateLimiter({ upstashUrl: null, upstashToken: null, rateLimitPerMinute: 10, redisTimeoutMs: 10 })).toBeNull();
        const brokenRedis = { evalsha: vi.fn(async () => { throw new Error('private token'); }), eval: vi.fn(async () => { throw new Error('private token'); }) } as never;
        await expect(new UpstashTranslationRateLimiter(brokenRedis, 1, 100).limit('client')).rejects.toMatchObject({ code: 'TRANSLATION_STORAGE_UNAVAILABLE' });
        const hangingRedis = { evalsha: vi.fn(() => new Promise(() => undefined)), eval: vi.fn(() => new Promise(() => undefined)) } as never;
        await expect(new UpstashTranslationRateLimiter(hangingRedis, 1, 5).limit('client')).rejects.toMatchObject({ code: 'TRANSLATION_STORAGE_UNAVAILABLE' });
    });
});

describe('Final T1-B · distributed circuit breaker', () => {
    it('shares failures, opens globally, exposes snapshot, and closes after one recovery probe', async () => {
        let now = 0;
        let probe = 0;
        const redis = new SharedCircuitRedis();
        const options = { failureThreshold: 2, openDurationMs: 100, timeoutMs: 100, now: () => now, createProbeId: () => `probe-${++probe}` };
        const first = new DistributedTranslationCircuitBreaker(redis, options);
        const second = new DistributedTranslationCircuitBreaker(redis, options);
        const failure = () => Promise.reject(new TranslationProviderError('PROVIDER_ERROR', 'provider failed', true));
        await expect(first.execute(failure)).rejects.toMatchObject({ code: 'PROVIDER_ERROR' });
        await expect(second.execute(failure)).rejects.toMatchObject({ code: 'PROVIDER_ERROR' });
        await expect(first.execute(async () => 'blocked')).rejects.toBeInstanceOf(TranslationCircuitOpenError);
        expect(await second.snapshot()).toMatchObject({ state: 'open', consecutiveFailures: 2 });
        now = 100;
        let release!: () => void;
        const recovery = first.execute(() => new Promise<string>((resolve) => { release = () => resolve('ok'); }));
        await expect(second.execute(async () => 'duplicate')).rejects.toBeInstanceOf(TranslationCircuitOpenError);
        expect(await second.snapshot()).toMatchObject({ state: 'recovery', halfOpenProbeActive: true });
        release();
        await expect(recovery).resolves.toBe('ok');
        expect(await first.snapshot()).toMatchObject({ state: 'closed', consecutiveFailures: 0 });
    });

    it('counts concurrent failures atomically across independent instances', async () => {
        const redis = new SharedCircuitRedis();
        let probe = 0;
        const options = { failureThreshold: 3, openDurationMs: 100, createProbeId: () => `p-${++probe}` };
        const breakers = [1, 2, 3].map(() => new DistributedTranslationCircuitBreaker(redis, options));
        await Promise.allSettled(breakers.map((breaker) => breaker.execute(() => Promise.reject(new TranslationProviderError('TIMEOUT', 'timeout', true)))));
        expect(await breakers[0].snapshot()).toMatchObject({ state: 'open', consecutiveFailures: 3 });
    });

    it('does not let a concurrent success erase a concurrent provider failure', async () => {
        const redis = new SharedCircuitRedis();
        let probe = 0;
        const options = { failureThreshold: 2, openDurationMs: 100, createProbeId: () => `race-${++probe}` };
        const first = new DistributedTranslationCircuitBreaker(redis, options);
        const second = new DistributedTranslationCircuitBreaker(redis, options);
        let releaseSuccess!: () => void;
        let releaseFailure!: () => void;
        const success = first.execute(() => new Promise<string>((resolve) => { releaseSuccess = () => resolve('ok'); }));
        const failure = second.execute(() => new Promise<string>((_resolve, reject) => {
            releaseFailure = () => reject(new TranslationProviderError('PROVIDER_ERROR', 'failed', true));
        }));
        await vi.waitFor(() => expect(releaseFailure).toBeTypeOf('function'));
        releaseFailure();
        await expect(failure).rejects.toMatchObject({ code: 'PROVIDER_ERROR' });
        await vi.waitFor(() => expect(releaseSuccess).toBeTypeOf('function'));
        releaseSuccess();
        await expect(success).resolves.toBe('ok');
        expect(await first.snapshot()).toMatchObject({ state: 'closed', consecutiveFailures: 1 });
    });
    it('preserves provider errors but fails closed when Redis acquire or completion fails', async () => {
        const providerError = new TranslationProviderError('RATE_LIMITED', 'provider throttled', true);
        const healthy = new DistributedTranslationCircuitBreaker(new SharedCircuitRedis(), { failureThreshold: 2, openDurationMs: 100 });
        await expect(healthy.execute(() => Promise.reject(providerError))).rejects.toBe(providerError);
        const acquireFailure = new DistributedTranslationCircuitBreaker({ eval: async () => { throw new Error('redis unavailable'); } }, { failureThreshold: 2, openDurationMs: 100 });
        await expect(acquireFailure.execute(async () => 'never')).rejects.toMatchObject({ code: 'TRANSLATION_STORAGE_UNAVAILABLE' });
        let call = 0;
        const completionFailure = new DistributedTranslationCircuitBreaker({
            eval: async () => (++call === 1 ? [1, 'closed', 0, 0] : Promise.reject(new Error('redis unavailable'))) as never,
        }, { failureThreshold: 2, openDurationMs: 100 });
        await expect(completionFailure.execute(async () => 'translated')).rejects.toMatchObject({ code: 'TRANSLATION_STORAGE_UNAVAILABLE' });
    });

    it('requires paired Upstash configuration in production factories', () => {
        expect(createDistributedTranslationCircuitBreaker({ upstashUrl: null, upstashToken: null, failureThreshold: 2, openDurationMs: 100, redisTimeoutMs: 100 })).toBeNull();
    });
});