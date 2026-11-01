import {
    TranslationStorageUnavailableError,
    createTranslationRedis,
    withTranslationStorageTimeout,
} from './storage';

export { TranslationStorageUnavailableError } from './storage';

export type TranslationBudgetLimits = {
    readonly maxSessionRequests: number;
    readonly maxSessionCharacters: number;
    readonly maxRouteCharacters: number;
    readonly maxDailyCharacters: number;
    readonly maxGlobalDailyCharacters: number;
    readonly maxTargetsPerDay: number;
};

export type TranslationBudgetContext = {
    readonly sessionId: string;
    readonly sessionExpiresAt: number;
    readonly clientId: string;
    readonly routePath: string;
    readonly targetLanguage: string;
    readonly characters: number;
};

export type TranslationBudgetVerdict =
    | { readonly allowed: true }
    | { readonly allowed: false; readonly code: 'TRANSLATION_BUDGET_EXCEEDED'; readonly scope: 'session' | 'route' | 'daily' | 'global' | 'target' };

export interface TranslationBudgetStore {
    readonly persistent: boolean;
    consume(context: TranslationBudgetContext, limits: TranslationBudgetLimits, now?: number): Promise<TranslationBudgetVerdict>;
}

export interface TranslationAtomicRedis {
    eval<TResult = unknown>(script: string, keys: string[], args: string[]): Promise<TResult>;
}


type Counters = { requests: number; characters: number; expiresAt: number };

/** Deterministic test/local adapter. It is explicitly not production-persistent. */
export class MemoryTranslationBudgetStore implements TranslationBudgetStore {
    readonly persistent = false;
    private readonly counters = new Map<string, Counters>();
    private readonly targets = new Map<string, { values: Set<string>; expiresAt: number }>();

    async consume(context: TranslationBudgetContext, limits: TranslationBudgetLimits, now = Date.now()): Promise<TranslationBudgetVerdict> {
        const day = new Date(now).toISOString().slice(0, 10);
        const sessionExpiry = Math.max(now + 1, context.sessionExpiresAt);
        const dayExpiry = Date.parse(`${day}T23:59:59.999Z`) + 1;
        const keys = {
            session: `session:${context.sessionId}`,
            route: `route:${context.routePath}:${day}`,
            daily: `daily:${context.clientId}:${day}`,
            global: `global:${day}`,
            targets: `targets:${context.clientId}:${day}`,
        };
        const session = this.current(keys.session, now);
        const route = this.current(keys.route, now);
        const daily = this.current(keys.daily, now);
        const global = this.current(keys.global, now);
        const targetWindow = this.currentTargets(keys.targets, now);
        const newTarget = !targetWindow.values.has(context.targetLanguage);

        if (session.requests + 1 > limits.maxSessionRequests || session.characters + context.characters > limits.maxSessionCharacters) {
            return denied('session');
        }
        if (route.characters + context.characters > limits.maxRouteCharacters) return denied('route');
        if (daily.characters + context.characters > limits.maxDailyCharacters) return denied('daily');
        if (global.characters + context.characters > limits.maxGlobalDailyCharacters) return denied('global');
        if (newTarget && targetWindow.values.size >= limits.maxTargetsPerDay) return denied('target');

        this.counters.set(keys.session, { requests: session.requests + 1, characters: session.characters + context.characters, expiresAt: sessionExpiry });
        this.counters.set(keys.route, { requests: 0, characters: route.characters + context.characters, expiresAt: dayExpiry });
        this.counters.set(keys.daily, { requests: 0, characters: daily.characters + context.characters, expiresAt: dayExpiry });
        this.counters.set(keys.global, { requests: 0, characters: global.characters + context.characters, expiresAt: dayExpiry });
        targetWindow.values.add(context.targetLanguage);
        this.targets.set(keys.targets, { values: targetWindow.values, expiresAt: dayExpiry });
        return { allowed: true };
    }

    private current(key: string, now: number): Counters {
        const current = this.counters.get(key);
        return !current || current.expiresAt <= now ? { requests: 0, characters: 0, expiresAt: 0 } : current;
    }

    private currentTargets(key: string, now: number): { values: Set<string>; expiresAt: number } {
        const current = this.targets.get(key);
        return !current || current.expiresAt <= now ? { values: new Set(), expiresAt: 0 } : current;
    }
}

function denied(scope: 'session' | 'route' | 'daily' | 'global' | 'target'): TranslationBudgetVerdict {
    return { allowed: false, code: 'TRANSLATION_BUDGET_EXCEEDED', scope };
}

/**
 * One EVAL checks every scope and commits every increment atomically. A rejected
 * request spends nothing, so concurrent serverless workers cannot overshoot by
 * racing a GET followed by INCRBY.
 */
export const TRANSLATION_BUDGET_LUA = `
local sessionRequests = tonumber(redis.call('GET', KEYS[1]) or '0')
local sessionChars = tonumber(redis.call('GET', KEYS[2]) or '0')
local routeChars = tonumber(redis.call('GET', KEYS[3]) or '0')
local dailyChars = tonumber(redis.call('GET', KEYS[4]) or '0')
local globalChars = tonumber(redis.call('GET', KEYS[5]) or '0')
local targetExists = redis.call('SISMEMBER', KEYS[6], ARGV[2])
local targetCount = tonumber(redis.call('SCARD', KEYS[6]) or '0')
local chars = tonumber(ARGV[1])
if sessionRequests + 1 > tonumber(ARGV[3]) or sessionChars + chars > tonumber(ARGV[4]) then return {0, 'session'} end
if routeChars + chars > tonumber(ARGV[5]) then return {0, 'route'} end
if dailyChars + chars > tonumber(ARGV[6]) then return {0, 'daily'} end
if globalChars + chars > tonumber(ARGV[7]) then return {0, 'global'} end
if targetExists == 0 and targetCount >= tonumber(ARGV[8]) then return {0, 'target'} end
redis.call('INCR', KEYS[1]); redis.call('INCRBY', KEYS[2], chars)
redis.call('INCRBY', KEYS[3], chars); redis.call('INCRBY', KEYS[4], chars); redis.call('INCRBY', KEYS[5], chars)
redis.call('SADD', KEYS[6], ARGV[2])
redis.call('PEXPIRE', KEYS[1], ARGV[9]); redis.call('PEXPIRE', KEYS[2], ARGV[9])
redis.call('PEXPIRE', KEYS[3], ARGV[10]); redis.call('PEXPIRE', KEYS[4], ARGV[10]); redis.call('PEXPIRE', KEYS[5], ARGV[10]); redis.call('PEXPIRE', KEYS[6], ARGV[10])
return {1, 'ok'}
`;

export class UpstashTranslationBudgetStore implements TranslationBudgetStore {
    readonly persistent = true;
    constructor(
        private readonly redis: TranslationAtomicRedis,
        private readonly prefix = 'mrx:translation:budget',
        private readonly timeoutMs = 3_000
    ) {}

    async consume(context: TranslationBudgetContext, limits: TranslationBudgetLimits, now = Date.now()): Promise<TranslationBudgetVerdict> {
        const day = new Date(now).toISOString().slice(0, 10);
        const route = Buffer.from(context.routePath).toString('base64url');
        const session = Buffer.from(context.sessionId).toString('base64url');
        const client = Buffer.from(context.clientId).toString('base64url');
        const keys = [
            `${this.prefix}:session:${session}:requests`,
            `${this.prefix}:session:${session}:chars`,
            `${this.prefix}:route:${route}:${day}`,
            `${this.prefix}:daily:${client}:${day}`,
            `${this.prefix}:global:${day}`,
            `${this.prefix}:targets:${client}:${day}`,
        ];
        const sessionTtl = Math.max(1, context.sessionExpiresAt - now);
        const dayTtl = Math.max(1, Date.parse(`${day}T23:59:59.999Z`) + 1 - now);
        try {
            const result = await withTranslationStorageTimeout(
                () => this.redis.eval<unknown>(TRANSLATION_BUDGET_LUA, keys, [
                String(context.characters), context.targetLanguage,
                String(limits.maxSessionRequests), String(limits.maxSessionCharacters),
                String(limits.maxRouteCharacters), String(limits.maxDailyCharacters),
                String(limits.maxGlobalDailyCharacters), String(limits.maxTargetsPerDay),
                    String(sessionTtl), String(dayTtl),
                ]),
                this.timeoutMs
            );
            if (!Array.isArray(result) || Number(result[0]) !== 1) {
                const scope = Array.isArray(result) ? String(result[1]) : 'global';
                return denied(['session', 'route', 'daily', 'global', 'target'].includes(scope) ? scope as 'session' | 'route' | 'daily' | 'global' | 'target' : 'global');
            }
            return { allowed: true };
        } catch {
            throw new TranslationStorageUnavailableError();
        }
    }
}

export function createTranslationBudgetStore(config: {
    upstashUrl: string | null;
    upstashToken: string | null;
    redisTimeoutMs: number;
}): TranslationBudgetStore | null {
    if (!config.upstashUrl || !config.upstashToken) return null;
    return new UpstashTranslationBudgetStore(
        createTranslationRedis({ upstashUrl: config.upstashUrl, upstashToken: config.upstashToken, redisTimeoutMs: config.redisTimeoutMs }),
        'mrx:translation:budget',
        config.redisTimeoutMs
    );
}

/** Compatibility wrapper for existing server wiring/tests. */
export function createTranslationBudgetStoreFromEnv(): TranslationBudgetStore | null {
    return createTranslationBudgetStore({
        upstashUrl: process.env.UPSTASH_REDIS_REST_URL ?? null,
        upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? null,
        redisTimeoutMs: 3_000,
    });
}
