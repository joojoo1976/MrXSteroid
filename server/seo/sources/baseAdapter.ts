/**
 * server/seo/sources/baseAdapter.ts
 * Step 2-3 — Reusable resilience base for every source adapter.
 *
 * Provides, once, the behaviour every provider needs and that is easy to get
 * wrong ad-hoc:
 *   - hard timeout (default 20_000 ms) with a caller-abort path
 *   - bounded retries (default 3) with exponential backoff + jitter
 *   - a circuit breaker (closed / open / half-open)
 *   - quota counters that fail closed before the provider is hammered
 *   - a cache keyed by provider + language + market + query + date window +
 *     apiVersion + datasetVersion (never a global key that would serve an
 *     `ar-EG` answer to an `en-US` caller)
 *   - "fail-clear" caching: a failure invalidates the entry instead of
 *     leaving a poisoned value behind for the rest of the TTL
 *   - partial success is representable via `CollectResult.partial`
 *
 * Honesty contract: a provider failure is returned as a typed failure on the
 * `CollectResult`. `collect()` never rejects, so one dead provider can never
 * take the pipeline down with it.
 *
 * Nothing here fabricates metrics. Adapters supply records; this file only
 * routes, times, retries and caches them.
 */

import {
    CollectRequest,
    CollectResult,
    DataKind,
    KeywordMetrics,
    Market,
    NormalizedIntelligenceRecord,
    SourceClass,
    SourceLanguage,
    SourceStatus,
    emptyKeywordMetrics,
} from './types';

/** Default per-attempt timeout. */
export const DEFAULT_TIMEOUT_MS = 20_000;
/** Default total attempts (1 initial + 2 retries). */
export const DEFAULT_MAX_RETRIES = 3;
/** Base delay for the exponential backoff curve. */
export const DEFAULT_BACKOFF_BASE_MS = 250;
/** Ceiling for a single backoff sleep. */
export const DEFAULT_BACKOFF_MAX_MS = 10_000;
/** Consecutive failures that trip the breaker. */
export const DEFAULT_CIRCUIT_FAILURE_THRESHOLD = 5;
/** How long the breaker stays open before allowing a probe. */
export const DEFAULT_CIRCUIT_RESET_MS = 30_000;
/** Default cache lifetime. */
export const DEFAULT_CACHE_TTL_SECONDS = 900;

/** Why an adapter run failed. Typed so callers never parse a message string. */
export type AdapterFailureReason =
    | 'timeout'
    | 'aborted'
    | 'quota_exhausted'
    | 'circuit_open'
    | 'http_error'
    | 'network_error'
    | 'invalid_response'
    | 'not_configured'
    | 'unknown';

/** Structured failure attached to a `CollectResult`. */
export interface AdapterFailure {
    provider: string;
    reason: AdapterFailureReason;
    message: string;
    /** Whether the base layer considers a retry worthwhile. */
    retryable: boolean;
    /** Number of attempts actually made. */
    attempts: number;
    /** HTTP status when one was observed. */
    status?: number;
}

/** Circuit breaker state. */
export type CircuitState = 'closed' | 'open' | 'half_open';

/** A single cache entry with an absolute expiry. */
interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

/** The function an adapter supplies to do one real unit of work. */
export type AdapterFetcher<T> = (request: CollectRequest) => Promise<T>;

/** Declarative description of a provider, used by the registry. */
export interface BaseAdapterConfig {
    /** Stable provider id, e.g. `google_search_console`. Part of the cache key. */
    provider: string;
    sourceType: string;
    sourceClass: SourceClass;
    /** Honest state. The base layer never upgrades this on its own. */
    status: SourceStatus;
    /** Provider API version string; part of the cache key. */
    apiVersion: string;
    /** Provider dataset/index version; part of the cache key. */
    datasetVersion: string;
    languages: readonly SourceLanguage[];
    markets: readonly Market[];
    authRequired: boolean;
    /** Per-attempt timeout in ms. */
    timeoutMs?: number;
    /** Total attempts, including the first. */
    maxRetries?: number;
    backoffBaseMs?: number;
    backoffMaxMs?: number;
    circuitFailureThreshold?: number;
    circuitResetMs?: number;
    /** Max calls per rolling window; null = unlimited. */
    quotaLimit?: number | null;
    /** Length of the quota window in seconds. */
    quotaWindowSeconds?: number;
    cacheTtlSeconds?: number;
    /** Data kind stamped on records this adapter emits. */
    dataKind?: DataKind;
    /** Exact reason this provider cannot run, when it cannot. */
    blockedReason?: string | null;
    /** Injectable clock, for deterministic tests. */
    now?: () => number;
    /** Injectable sleep, so retry tests do not spend real seconds. */
    sleep?: (ms: number) => Promise<void>;
    /** Injectable jitter source in [0, 1). */
    random?: () => number;
}

/** Fully-resolved options, after defaults are applied. */
export interface ResolvedAdapterOptions {
    provider: string;
    sourceType: string;
    sourceClass: SourceClass;
    status: SourceStatus;
    apiVersion: string;
    datasetVersion: string;
    languages: readonly SourceLanguage[];
    markets: readonly Market[];
    authRequired: boolean;
    timeoutMs: number;
    maxRetries: number;
    backoffBaseMs: number;
    backoffMaxMs: number;
    circuitFailureThreshold: number;
    circuitResetMs: number;
    quotaLimit: number | null;
    quotaWindowSeconds: number;
    cacheTtlSeconds: number;
    dataKind: DataKind;
    blockedReason: string | null;
    now: () => number;
    sleep: (ms: number) => Promise<void>;
    random: () => number;
}

/** Everything that can change the answer of a provider call. */
export interface CacheKeyInput {
    provider: string;
    language: string;
    market: string;
    /** Free-text query or dataset selector. */
    query?: string;
    /** Seed keywords; sorted so key order is deterministic. */
    seeds?: readonly string[];
    /** Formatted date window, e.g. `2026-01-01..2026-01-31`. */
    dateWindow?: string;
    apiVersion?: string;
    datasetVersion?: string;
}

/**
 * Build a cache key from the full request identity.
 *
 * Every axis that changes the provider's answer is part of the key on purpose.
 * A key that omitted market or language would let an `ar-EG` response be
 * replayed to an `en-US` caller, which is exactly the class of bug this module
 * exists to make impossible.
 */
export function buildCacheKey(input: CacheKeyInput): string {
    const seeds = [...(input.seeds ?? [])].map((s) => s.trim().toLowerCase()).sort();
    return [
        `provider=${input.provider}`,
        `language=${input.language}`,
        `market=${input.market}`,
        `query=${(input.query ?? '').trim().toLowerCase()}`,
        `seeds=${seeds.join('|')}`,
        `dateWindow=${input.dateWindow ?? ''}`,
        `apiVersion=${input.apiVersion ?? ''}`,
        `datasetVersion=${input.datasetVersion ?? ''}`,
    ].join('::');
}

/** Format a request's date window for the cache key. */
export function formatDateWindow(request: CollectRequest): string {
    return `${request.dateWindow.start}..${request.dateWindow.end}`;
}

/** True for a thrown value that carries an HTTP status. */
function httpStatusOf(error: unknown): number | undefined {
    if (error && typeof error === 'object') {
        const status = (error as { status?: unknown }).status;
        if (typeof status === 'number') return status;
    }
    return undefined;
}

/** True for `AbortError`-shaped errors from fetch / AbortController. */
function isAbortError(error: unknown): boolean {
    return Boolean(
        error &&
            typeof error === 'object' &&
            (error as { name?: string }).name === 'AbortError',
    );
}

/** Classify an arbitrary thrown value into a typed failure reason. */
export function classifyFailure(error: unknown): {
    reason: AdapterFailureReason;
    message: string;
    status?: number;
} {
    if (isAbortError(error)) {
        return { reason: 'aborted', message: 'Request aborted' };
    }
    const status = httpStatusOf(error);
    if (status !== undefined) {
        return {
            reason: 'http_error',
            message: `Provider responded with HTTP ${status}`,
            status,
        };
    }
    const message = error instanceof Error ? error.message : String(error);
    if (/timeout|timed out/i.test(message)) {
        return { reason: 'timeout', message };
    }
    if (/invalid|malformed|unexpected response/i.test(message)) {
        return { reason: 'invalid_response', message };
    }
    if (
        error instanceof TypeError ||
        /fetch failed|ENOTFOUND|ECONNREFUSED|ECONNRESET|EAI_AGAIN|network/i.test(message)
    ) {
        return { reason: 'network_error', message };
    }
    return { reason: 'unknown', message };
}

/**
 * Reasons worth another attempt.
 * A 4xx other than 429 will not improve on retry, so it is not retried.
 */
export function isRetryableReason(
    reason: AdapterFailureReason,
    status?: number,
): boolean {
    switch (reason) {
        case 'timeout':
        case 'network_error':
            return true;
        case 'http_error':
            return status === undefined || status === 429 || status >= 500;
        default:
            return false;
    }
}

/**
 * Resilient base for a single source adapter.
 *
 * Subclasses implement `fetch()` (or pass a fetcher to the constructor) and
 * inherit timeout, retry/backoff, circuit breaking, quota accounting and
 * market-aware caching. `collect()` is the public entry point and always
 * resolves with a `CollectResult`.
 */
export class BaseSourceAdapter<T> {
    readonly options: ResolvedAdapterOptions;

    private readonly fetcher: AdapterFetcher<T>;
    private readonly cache = new Map<string, CacheEntry<T>>();

    private circuit: CircuitState = 'closed';
    private consecutiveFailures = 0;
    private openedAt = 0;

    private quotaUsed = 0;
    private quotaWindowStartedAt = 0;

    private lastAttemptAt: string | null = null;
    private lastSuccessAt: string | null = null;
    private lastFailureAt: string | null = null;
    private lastError: string | null = null;

    constructor(config: BaseAdapterConfig, fetcher?: AdapterFetcher<T>) {
        this.options = resolveOptions(config);
        this.fetcher =
            fetcher ??
            (() => {
                throw new Error(
                    `Adapter ${config.provider} has no fetcher configured`,
                );
            });
        this.quotaWindowStartedAt = this.options.now();
    }

    /** Provider id. */
    get provider(): string {
        return this.options.provider;
    }

    /** Current circuit breaker state. */
    getCircuitState(): CircuitState {
        return this.circuit;
    }

    /** Calls used in the current quota window. */
    getQuotaUsed(): number {
        this.rollQuotaWindow();
        return this.quotaUsed;
    }

    /** Zero the quota counter and open a fresh window. */
    resetQuota(): void {
        this.quotaUsed = 0;
        this.quotaWindowStartedAt = this.options.now();
    }

    /** Force the breaker shut and forget the failure streak. */
    resetCircuit(): void {
        this.circuit = 'closed';
        this.consecutiveFailures = 0;
        this.openedAt = 0;
    }

    /** Last error message seen, or null. */
    getLastError(): string | null {
        return this.lastError;
    }

    /** Timestamp of the last attempt, or null. */
    getLastAttemptAt(): string | null {
        return this.lastAttemptAt;
    }

    /** Timestamp of the last success, or null. Never set without a real call. */
    getLastSuccessAt(): string | null {
        return this.lastSuccessAt;
    }

    /** Timestamp of the last failure, or null. */
    getLastFailureAt(): string | null {
        return this.lastFailureAt;
    }

    /** Drop every cached value for this adapter. */
    clearCache(): void {
        this.cache.clear();
    }

    /** Number of live cache entries. Expired entries are not counted. */
    cacheSize(): number {
        this.evictExpired();
        return this.cache.size;
    }

    /** Build the cache key this adapter would use for a request. */
    cacheKeyFor(request: CollectRequest): string {
        return buildCacheKey({
            provider: this.options.provider,
            language: request.language,
            market: request.market,
            query: request.query,
            seeds: request.seeds,
            dateWindow: formatDateWindow(request),
            apiVersion: this.options.apiVersion,
            datasetVersion: this.options.datasetVersion,
        });
    }

    /**
     * Backoff delay before the next attempt (1-based: attempt 1 already ran).
     * Exponential with jitter so a fleet of workers does not retry in lockstep
     * right after a provider recovers.
     */
    backoffDelayMs(attempt: number): number {
        const { backoffBaseMs, backoffMaxMs, random } = this.options;
        const exponential = backoffBaseMs * Math.pow(2, Math.max(0, attempt - 1));
        const capped = Math.min(exponential, backoffMaxMs);
        const jitter = 1 + (random() * 2 - 1) * 0.25; // ±25%
        return Math.max(0, Math.round(capped * jitter));
    }

    /**
     * Run `operation` under the configured timeout.
     * Rejects with an error named `TimeoutError` when the deadline passes, and
     * with `AbortError` when the caller's signal fires.
     */
    private async withTimeout<T>(
        operation: () => Promise<T>,
        signal?: AbortSignal,
    ): Promise<T> {
        const { timeoutMs } = this.options;
        return new Promise<T>((resolve, reject) => {
            let settled = false;
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                const error = new Error(`Provider timed out after ${timeoutMs}ms`);
                error.name = 'TimeoutError';
                reject(error);
            }, timeoutMs);

            const onAbort = () => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                const error = new Error('Request aborted by caller');
                error.name = 'AbortError';
                reject(error);
            };

            if (signal) {
                if (signal.aborted) {
                    onAbort();
                    return;
                }
                signal.addEventListener('abort', onAbort, { once: true });
            }

            operation().then(
                (value) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    signal?.removeEventListener('abort', onAbort);
                    resolve(value);
                },
                (error: unknown) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    signal?.removeEventListener('abort', onAbort);
                    reject(error);
                },
            );
        });
    }

    /** Reset the quota window when it has elapsed. */
    private rollQuotaWindow(): void {
        const { quotaWindowSeconds, now } = this.options;
        if (now() - this.quotaWindowStartedAt >= quotaWindowSeconds * 1000) {
            this.quotaUsed = 0;
            this.quotaWindowStartedAt = now();
        }
    }

    /** Consume one unit of quota. Returns false when the limit is reached. */
    private consumeQuota(): boolean {
        this.rollQuotaWindow();
        const { quotaLimit } = this.options;
        if (quotaLimit === null) {
            this.quotaUsed += 1;
            return true;
        }
        if (this.quotaUsed >= quotaLimit) return false;
        this.quotaUsed += 1;
        return true;
    }

    /** Open the breaker and start the reset window. */
    private tripCircuit(): void {
        this.circuit = 'open';
        this.openedAt = this.options.now();
    }

    /**
     * Decide whether a call may proceed.
     * An open breaker whose reset window has elapsed transitions to half-open
     * and lets a probe through; a half-open breaker admits only the probe.
     */
    private canAttempt(): boolean {
        if (this.circuit === 'closed') return true;
        const elapsed = this.options.now() - this.openedAt;
        if (elapsed >= this.options.circuitResetMs) {
            this.circuit = 'half_open';
            return true;
        }
        return false;
    }

    /** Record a success: close the breaker, clear the streak. */
    private recordSuccess(): void {
        this.consecutiveFailures = 0;
        this.circuit = 'closed';
        this.openedAt = 0;
        this.lastSuccessAt = new Date(this.options.now()).toISOString();
        this.lastError = null;
    }

    /** Record a failure and trip the breaker once the threshold is reached. */
    private recordFailure(message: string): void {
        this.consecutiveFailures += 1;
        this.lastFailureAt = new Date(this.options.now()).toISOString();
        this.lastError = message;
        if (this.consecutiveFailures >= this.options.circuitFailureThreshold) {
            this.tripCircuit();
        }
    }

    /** Remove expired entries so the map cannot grow without bound. */
    private evictExpired(): void {
        const now = this.options.now();
        for (const [key, entry] of this.cache) {
            if (entry.expiresAt <= now) this.cache.delete(key);
        }
    }

    /** Read a live cache entry, if any. Expired entries are treated as absent. */
    private readCache(key: string): T | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;
        if (entry.expiresAt <= this.options.now()) {
            this.cache.delete(key);
            return undefined;
        }
        return entry.value;
    }

    /**
     * Write a cache entry — but only for a usable value.
     * `undefined`/`null` is never cached, so a fetcher that returns nothing does
     * not poison the key for the whole TTL.
     */
    private writeCache(key: string, value: T): void {
        if (value === undefined || value === null) return;
        this.cache.set(key, {
            value,
            expiresAt: this.options.now() + this.options.cacheTtlSeconds * 1000,
        });
    }

    /**
     * Drop the cache entry for a request.
     * Called on failure ("fail-clear"): a provider that is erroring must not
     * leave a value behind that a later read would treat as fresh.
     */
    invalidate(request: CollectRequest): void {
        this.cache.delete(this.cacheKeyFor(request));
    }

    /**
     * Fetch with timeout, retries, backoff, breaker and quota — but no caching.
     * Resolves with the value, or throws the last classified error.
     */
    async execute(request: CollectRequest): Promise<T> {
        const { maxRetries, sleep } = this.options;
        this.lastAttemptAt = new Date(this.options.now()).toISOString();

        let lastReason: AdapterFailureReason = 'unknown';
        let lastMessage = 'Adapter produced no result';
        let lastStatus: number | undefined;

        for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
            if (!this.canAttempt()) {
                throw Object.assign(
                    new Error(
                        `Circuit breaker is open for ${this.provider}; call rejected without a provider request`,
                    ),
                    { adapterReason: 'circuit_open' as AdapterFailureReason },
                );
            }

            if (!this.consumeQuota()) {
                this.recordFailure('Quota exhausted');
                throw Object.assign(
                    new Error(`Quota exhausted for ${this.provider}`),
                    { adapterReason: 'quota_exhausted' as AdapterFailureReason },
                );
            }

            try {
                const value = await this.withTimeout(
                    () => this.fetcher(request),
                    request.signal,
                );
                this.recordSuccess();
                return value;
            } catch (error) {
                const carried = (error as { adapterReason?: AdapterFailureReason })
                    .adapterReason;
                const classified = carried
                    ? {
                          reason: carried,
                          message: error instanceof Error ? error.message : String(error),
                      }
                    : classifyFailure(error);

                lastReason = classified.reason;
                lastMessage = classified.message;
                lastStatus = classified.status;
                this.recordFailure(lastMessage);

                const retryable = isRetryableReason(lastReason, lastStatus);
                if (!retryable || attempt >= maxRetries) {
                    throw Object.assign(new Error(lastMessage), {
                        adapterReason: lastReason,
                        attempts: attempt,
                        status: lastStatus,
                    });
                }

                await sleep(this.backoffDelayMs(attempt));
            }
        }

        throw Object.assign(new Error(lastMessage), {
            adapterReason: lastReason,
            attempts: maxRetries,
            status: lastStatus,
        });
    }

    /**
     * Public entry point. Never rejects: every outcome is a `CollectResult`.
     *
     * - blocked provider -> `FAILED` with the exact declared reason
     * - cache hit        -> declared status, records returned
     * - provider error   -> `FAILED`, `error` set, cache entry fail-cleared
     */
    async collect(request: CollectRequest): Promise<CollectResult> {
        const key = this.cacheKeyFor(request);

        if (this.options.blockedReason) {
            return {
                source: this.options.provider,
                status: 'FAILED',
                dataKind: 'unavailable',
                records: [],
                error: this.options.blockedReason,
                partial: false,
            };
        }

        const cached = this.readCache(key);
        if (cached !== undefined) {
            return {
                source: this.options.provider,
                status: this.options.status,
                dataKind: this.options.dataKind,
                records: this.toRecords(cached, request),
                partial: false,
            };
        }

        try {
            const value = await this.execute(request);
            this.writeCache(key, value);
            return {
                source: this.options.provider,
                status: this.options.status,
                dataKind: this.options.dataKind,
                records: this.toRecords(value, request),
                partial: false,
            };
        } catch (error) {
            // Fail-clear: a failed run must not leave a value readable.
            this.cache.delete(key);
            const reason =
                (error as { adapterReason?: AdapterFailureReason }).adapterReason ??
                classifyFailure(error).reason;
            const message = error instanceof Error ? error.message : String(error);
            return {
                source: this.options.provider,
                status: 'FAILED',
                dataKind: 'unavailable',
                records: [],
                error: `${reason}: ${message}`,
                partial: false,
            };
        }
    }

    /**
     * Coerce a raw fetcher payload into normalised records.
     * Subclasses override this to map their provider shape; the default
     * accepts an array of already-normalised records and passes it through.
     */
    protected toRecords(
        value: T,
        _request: CollectRequest,
    ): NormalizedIntelligenceRecord[] {
        if (!Array.isArray(value)) return [];
        return (value as unknown as NormalizedIntelligenceRecord[]).filter(
            (record): record is NormalizedIntelligenceRecord =>
                Boolean(record) && typeof record.keyword === 'string',
        );
    }
}

/** Default sleep. Injected in tests so retries do not burn real seconds. */
function defaultSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Apply defaults to a partial config. */
export function resolveOptions(config: BaseAdapterConfig): ResolvedAdapterOptions {
    return {
        provider: config.provider,
        sourceType: config.sourceType,
        sourceClass: config.sourceClass,
        status: config.status,
        apiVersion: config.apiVersion,
        datasetVersion: config.datasetVersion,
        languages: config.languages,
        markets: config.markets,
        authRequired: config.authRequired,
        timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
        backoffBaseMs: config.backoffBaseMs ?? DEFAULT_BACKOFF_BASE_MS,
        backoffMaxMs: config.backoffMaxMs ?? DEFAULT_BACKOFF_MAX_MS,
        circuitFailureThreshold:
            config.circuitFailureThreshold ?? DEFAULT_CIRCUIT_FAILURE_THRESHOLD,
        circuitResetMs: config.circuitResetMs ?? DEFAULT_CIRCUIT_RESET_MS,
        quotaLimit: config.quotaLimit ?? null,
        quotaWindowSeconds: config.quotaWindowSeconds ?? 3600,
        cacheTtlSeconds: config.cacheTtlSeconds ?? DEFAULT_CACHE_TTL_SECONDS,
        dataKind: config.dataKind ?? 'unavailable',
        blockedReason: config.blockedReason ?? null,
        now: config.now ?? (() => Date.now()),
        sleep: config.sleep ?? defaultSleep,
        random: config.random ?? Math.random,
    };
}

/** Factory form of {@link BaseSourceAdapter}, for adapters that prefer composition. */
export function createBaseAdapter<T>(
    config: BaseAdapterConfig,
    fetcher?: AdapterFetcher<T>,
): BaseSourceAdapter<T> {
    return new BaseSourceAdapter<T>(config, fetcher);
}

/** Input for {@link buildRecord}. Metrics default to all-null. */
export interface RecordDraft {
    keyword: string;
    source: string;
    sourceType: string;
    sourceClass: SourceClass;
    sourceStatus: SourceStatus;
    sourceReference: string;
    dataKind: DataKind;
    evidence: string;
    evidenceType: NormalizedIntelligenceRecord['evidenceType'];
    language?: SourceLanguage;
    market?: Market;
    parentKeyword?: string;
    generationMethod?: string;
    metrics?: Partial<KeywordMetrics>;
    competitorContext?: NormalizedIntelligenceRecord['competitorContext'];
}

/**
 * Build a fully-attributed record.
 *
 * The point of this helper is that a caller cannot accidentally produce a
 * record with a number and no `dataKind`: metrics default to null, and
 * `dataKind` is a required argument rather than an inference.
 */
export function buildRecord(draft: RecordDraft): NormalizedIntelligenceRecord {
    return {
        keyword: draft.keyword,
        language: draft.language ?? 'en',
        market: draft.market ?? 'en-US',
        source: draft.source,
        sourceType: draft.sourceType,
        sourceClass: draft.sourceClass,
        sourceStatus: draft.sourceStatus,
        sourceReference: draft.sourceReference,
        discoveredAt: new Date().toISOString(),
        dataKind: draft.dataKind,
        evidence: draft.evidence,
        evidenceType: draft.evidenceType,
        parentKeyword: draft.parentKeyword,
        generationMethod: draft.generationMethod,
        metrics: { ...emptyKeywordMetrics(), ...(draft.metrics ?? {}) },
        competitorContext: draft.competitorContext,
    };
}

/**
 * A record that deliberately carries no measurement.
 * Used by sources whose only honest contribution is the keyword string itself.
 */
export function buildUnmeasuredRecord(
    draft: Omit<RecordDraft, 'metrics' | 'dataKind'> & {
        metrics?: Partial<KeywordMetrics>;
    },
): NormalizedIntelligenceRecord {
    return buildRecord({
        ...draft,
        dataKind: 'unavailable',
        metrics: draft.metrics ?? {},
    });
}







