import {
    TranslationStorageUnavailableError,
    createTranslationRedis,
    withTranslationStorageTimeout,
} from './storage';

export type CircuitState = 'closed' | 'open' | 'half-open' | 'recovery';
export type CircuitSnapshot = {
    readonly state: CircuitState;
    readonly consecutiveFailures: number;
    readonly openedAt: number | null;
    readonly halfOpenProbeActive: boolean;
};

export interface TranslationCircuitBreakerLike {
    execute<T>(operation: () => Promise<T>): Promise<T>;
    snapshot(): Promise<CircuitSnapshot> | CircuitSnapshot;
}

export class TranslationCircuitOpenError extends Error {
    readonly code = 'TRANSLATION_CIRCUIT_OPEN';
    constructor() {
        super('Translation is temporarily unavailable.');
        this.name = 'TranslationCircuitOpenError';
    }
}


export class TranslationCircuitConcurrencyError extends Error {
    readonly code = 'TRANSLATION_CIRCUIT_CONFLICT';
    constructor() {
        super('Translation circuit state changed concurrently.');
        this.name = 'TranslationCircuitConcurrencyError';
    }
}
export type TranslationCircuitStateStore = {
    load(key: string): CircuitSnapshot | null;
    save(key: string, snapshot: CircuitSnapshot): void;
};

export class MemoryTranslationCircuitStateStore implements TranslationCircuitStateStore {
    private readonly states = new Map<string, CircuitSnapshot>();
    load(key: string): CircuitSnapshot | null {
        const state = this.states.get(key);
        return state ? { ...state } : null;
    }
    save(key: string, snapshot: CircuitSnapshot): void {
        this.states.set(key, { ...snapshot });
    }
}

export type TranslationCircuitBreakerOptions = {
    readonly failureThreshold: number;
    readonly openDurationMs: number;
    readonly now?: () => number;
    readonly stateKey?: string;
    readonly stateStore?: TranslationCircuitStateStore;
};

/** Test/development circuit. Production wiring uses DistributedTranslationCircuitBreaker. */
export class TranslationCircuitBreaker implements TranslationCircuitBreakerLike {
    private stateValue: CircuitState = 'closed';
    private consecutiveFailures = 0;
    private openedAt: number | null = null;
    private halfOpenProbeActive = false;
    private readonly now: () => number;
    private readonly stateKey: string;
    private readonly stateStore: TranslationCircuitStateStore;

    constructor(private readonly options: TranslationCircuitBreakerOptions) {
        assertCircuitConfig(options.failureThreshold, options.openDurationMs);
        this.now = options.now ?? (() => Date.now());
        this.stateKey = options.stateKey ?? 'translation-provider';
        this.stateStore = options.stateStore ?? new MemoryTranslationCircuitStateStore();
        const saved = this.stateStore.load(this.stateKey);
        if (saved) {
            this.stateValue = saved.state;
            this.consecutiveFailures = saved.consecutiveFailures;
            this.openedAt = saved.openedAt;
        }
    }

    snapshot(): CircuitSnapshot {
        this.refreshState();
        return this.currentSnapshot();
    }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        this.refreshState();
        if (this.stateValue === 'open' || this.stateValue === 'recovery' || (this.stateValue === 'half-open' && this.halfOpenProbeActive)) {
            throw new TranslationCircuitOpenError();
        }
        if (this.stateValue === 'half-open') {
            this.halfOpenProbeActive = true;
            this.stateValue = 'recovery';
            this.persist();
        }
        try {
            const result = await operation();
            this.stateValue = 'closed';
            this.consecutiveFailures = 0;
            this.openedAt = null;
            this.halfOpenProbeActive = false;
            this.persist();
            return result;
        } catch (error) {
            if (isCircuitFailure(error)) {
                this.consecutiveFailures += 1;
                if (this.stateValue === 'recovery' || this.consecutiveFailures >= this.options.failureThreshold) {
                    this.stateValue = 'open';
                    this.openedAt = this.now();
                }
            } else if (this.stateValue === 'recovery') {
                this.stateValue = 'half-open';
            }
            this.halfOpenProbeActive = false;
            this.persist();
            throw error;
        }
    }

    private refreshState(): void {
        if (this.stateValue === 'open' && this.openedAt !== null && this.now() - this.openedAt >= this.options.openDurationMs) {
            this.stateValue = 'half-open';
            this.halfOpenProbeActive = false;
            this.persist();
        }
    }
    private currentSnapshot(): CircuitSnapshot {
        return {
            state: this.stateValue,
            consecutiveFailures: this.consecutiveFailures,
            openedAt: this.openedAt,
            halfOpenProbeActive: this.halfOpenProbeActive,
        };
    }
    private persist(): void { this.stateStore.save(this.stateKey, this.currentSnapshot()); }
}

export interface TranslationCircuitRedis {
    eval<TResult = unknown>(script: string, keys: string[], args: string[]): Promise<TResult>;
}

export const TRANSLATION_CIRCUIT_ACQUIRE_LUA = `
local state = redis.call('HGET', KEYS[1], 'state') or 'closed'
local failures = tonumber(redis.call('HGET', KEYS[1], 'failures') or '0')
local openedAt = tonumber(redis.call('HGET', KEYS[1], 'openedAt') or '0')
local now = tonumber(ARGV[1]); local openMs = tonumber(ARGV[2])
if state == 'open' and now - openedAt < openMs then return {0, 'open', failures, openedAt} end
if state == 'open' then
  redis.call('HSET', KEYS[1], 'state', 'half-open')
  state = 'half-open'
end
if state == 'half-open' or state == 'recovery' then
  if redis.call('SET', KEYS[2], ARGV[3], 'NX', 'PX', ARGV[4]) == false then
    return {0, 'recovery', failures, openedAt}
  end
  redis.call('HSET', KEYS[1], 'state', 'recovery')
  return {1, 'recovery', failures, openedAt}
end
local active = tonumber(redis.call('HINCRBY', KEYS[1], 'active', 1))
redis.call('HSET', KEYS[1], 'state', 'closed')
return {1, 'closed', failures, openedAt, active}
`;

export const TRANSLATION_CIRCUIT_COMPLETE_LUA = `
local outcome = ARGV[1]; local now = tonumber(ARGV[2]); local threshold = tonumber(ARGV[3]); local probe = ARGV[4]
local owner = redis.call('GET', KEYS[2])
local state = redis.call('HGET', KEYS[1], 'state') or 'closed'
local acquired = ARGV[6]
if state == 'recovery' and owner ~= probe then
  return {'conflict', tonumber(redis.call('HGET', KEYS[1], 'failures') or '0'), tonumber(redis.call('HGET', KEYS[1], 'openedAt') or '0')}
end
if owner == probe then redis.call('DEL', KEYS[2]) end
if state == 'closed' and acquired == 'closed' then
  local acquiredFailures = tonumber(ARGV[7])
  local active = tonumber(redis.call('HINCRBY', KEYS[1], 'active', -1))
  if outcome == 'failure' then
    local failures = tonumber(redis.call('HINCRBY', KEYS[1], 'failures', 1))
    if failures >= threshold then state = 'open'; redis.call('HSET', KEYS[1], 'state', state, 'openedAt', now) end
    redis.call('PEXPIRE', KEYS[1], ARGV[5]); return {state, failures, now}
  end
  local currentFailures = tonumber(redis.call('HGET', KEYS[1], 'failures') or '0')
  if active <= 0 and outcome == 'success' and currentFailures <= acquiredFailures then redis.call('HSET', KEYS[1], 'failures', 0, 'openedAt', 0) end
  redis.call('PEXPIRE', KEYS[1], ARGV[5]); return {state, tonumber(redis.call('HGET', KEYS[1], 'failures') or '0'), tonumber(redis.call('HGET', KEYS[1], 'openedAt') or '0')}
end
if outcome == 'success' then
  redis.call('HSET', KEYS[1], 'state', 'closed', 'failures', 0, 'openedAt', 0, 'active', 0)
  redis.call('PEXPIRE', KEYS[1], ARGV[5]); return {'closed', 0, 0}
end
if outcome == 'ignore' then
  if state == 'recovery' then redis.call('HSET', KEYS[1], 'state', 'half-open'); state = 'half-open' end
  redis.call('PEXPIRE', KEYS[1], ARGV[5])
  return {state, tonumber(redis.call('HGET', KEYS[1], 'failures') or '0'), tonumber(redis.call('HGET', KEYS[1], 'openedAt') or '0')}
end
local failures = tonumber(redis.call('HINCRBY', KEYS[1], 'failures', 1))
if state == 'recovery' or failures >= threshold then
  state = 'open'; redis.call('HSET', KEYS[1], 'state', state, 'openedAt', now)
end
redis.call('PEXPIRE', KEYS[1], ARGV[5]); return {state, failures, now}
`;

export const TRANSLATION_CIRCUIT_SNAPSHOT_LUA = `
local state = redis.call('HGET', KEYS[1], 'state') or 'closed'
local failures = tonumber(redis.call('HGET', KEYS[1], 'failures') or '0')
local openedAt = tonumber(redis.call('HGET', KEYS[1], 'openedAt') or '0')
local now = tonumber(ARGV[1]); local openMs = tonumber(ARGV[2])
if state == 'open' and now - openedAt >= openMs then state = 'half-open' end
local probe = redis.call('EXISTS', KEYS[2])
return {state, failures, openedAt, probe}
`;

export class DistributedTranslationCircuitBreaker implements TranslationCircuitBreakerLike {
    private readonly key: string;
    private readonly now: () => number;

    constructor(
        private readonly redis: TranslationCircuitRedis,
        private readonly options: {
            failureThreshold: number;
            openDurationMs: number;
            timeoutMs?: number;
            key?: string;
            now?: () => number;
            createProbeId?: () => string;
        }
    ) {
        assertCircuitConfig(options.failureThreshold, options.openDurationMs);
        this.key = options.key ?? 'mrx:translation:circuit:google';
        this.now = options.now ?? (() => Date.now());
    }

    async snapshot(): Promise<CircuitSnapshot> {
        const now = this.now();
        try {
            const raw = await this.eval(TRANSLATION_CIRCUIT_SNAPSHOT_LUA, [this.key, `${this.key}:probe`], [
                String(now),
                String(this.options.openDurationMs),
            ]);
            if (!Array.isArray(raw)) throw new Error('invalid_snapshot');
            const state = parseCircuitState(raw[0]);
            const openedAt = Number(raw[2]);
            return {
                state,
                consecutiveFailures: Number(raw[1]) || 0,
                openedAt: openedAt > 0 ? openedAt : null,
                halfOpenProbeActive: Number(raw[3]) === 1 || state === 'recovery',
            };
        } catch {
            throw new TranslationStorageUnavailableError();
        }
    }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        const now = this.now();
        const probeKey = `${this.key}:probe`;
        const probeId = this.options.createProbeId?.() ?? crypto.randomUUID();
        const ttl = Math.max(this.options.openDurationMs * 4, 60_000);

        let acquired: unknown;
        try {
            acquired = await this.eval(TRANSLATION_CIRCUIT_ACQUIRE_LUA, [this.key, probeKey], [
                String(now),
                String(this.options.openDurationMs),
                probeId,
                String(this.options.openDurationMs),
            ]);
        } catch {
            throw new TranslationStorageUnavailableError();
        }
        if (!Array.isArray(acquired)) throw new TranslationStorageUnavailableError();
        if (Number(acquired[0]) !== 1) throw new TranslationCircuitOpenError();
        const acquiredState = String(acquired[1]);
        const acquiredFailures = Number(acquired[2]) || 0;

        let value: T;
        try {
            value = await operation();
        } catch (providerError) {
            try {
                await this.complete(probeKey, probeId, isCircuitFailure(providerError) ? 'failure' : 'ignore', now, ttl, acquiredState, acquiredFailures);
            } catch {
                throw new TranslationStorageUnavailableError();
            }
            throw providerError;
        }

        try {
            await this.complete(probeKey, probeId, 'success', now, ttl, acquiredState, acquiredFailures);
        } catch {
            throw new TranslationStorageUnavailableError();
        }
        return value;
    }

    private async complete(probeKey: string, probeId: string, outcome: string, now: number, ttl: number, acquiredState: string, acquiredFailures: number): Promise<void> {
        const result = await this.eval(TRANSLATION_CIRCUIT_COMPLETE_LUA, [this.key, probeKey], [
            outcome,
            String(now),
            String(this.options.failureThreshold),
            probeId,
            String(ttl),
            acquiredState,
            String(acquiredFailures),
        ]);
        if (!Array.isArray(result) || result[0] === 'conflict') {
            throw new TranslationCircuitConcurrencyError();
        }
    }

    private eval(script: string, keys: string[], args: string[]): Promise<unknown> {
        return withTranslationStorageTimeout(
            () => this.redis.eval<unknown>(script, keys, args),
            this.options.timeoutMs ?? 3_000
        );
    }
}

export function createDistributedTranslationCircuitBreaker(config: {
    upstashUrl: string | null;
    upstashToken: string | null;
    failureThreshold: number;
    openDurationMs: number;
    redisTimeoutMs: number;
}): TranslationCircuitBreakerLike | null {
    if (!config.upstashUrl || !config.upstashToken) return null;
    return new DistributedTranslationCircuitBreaker(
        createTranslationRedis({ upstashUrl: config.upstashUrl, upstashToken: config.upstashToken, redisTimeoutMs: config.redisTimeoutMs }),
        {
            failureThreshold: config.failureThreshold,
            openDurationMs: config.openDurationMs,
            timeoutMs: config.redisTimeoutMs,
        }
    );
}

function assertCircuitConfig(failureThreshold: number, openDurationMs: number): void {
    if (!Number.isInteger(failureThreshold) || failureThreshold <= 0) throw new Error('Circuit failureThreshold must be a positive integer.');
    if (!Number.isFinite(openDurationMs) || openDurationMs <= 0) throw new Error('Circuit openDurationMs must be positive.');
}

function parseCircuitState(value: unknown): CircuitState {
    const state = String(value);
    if (state === 'open' || state === 'half-open' || state === 'recovery') return state;
    return 'closed';
}

function isCircuitFailure(error: unknown): boolean {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    return ['', 'RATE_LIMITED', 'QUOTA_EXCEEDED', 'TIMEOUT', 'PROVIDER_ERROR'].includes(code);
}