/**
 * server/seo/sources/providerRunner.ts
 * ============================================================================
 * Resilience around every provider call (spec §18, §27, §31).
 * ============================================================================
 * WHY THIS EXISTS
 * ---------------
 * `baseAdapter.ts` already implements timeout, exponential backoff, jitter and a
 * circuit breaker — but no adapter USES it: all four credential-bearing
 * adapters are standalone modules. The resilience code existed and was never
 * wired, so a provider that timed out or returned 429 could fail the whole
 * weekly run with no backoff and no circuit breaker anywhere.
 *
 * This module is the missing wire. It gives every provider ONE place where:
 *   * a timeout is bounded
 *   * a transient failure (429 / 5xx / network) is retried with exponential
 *     backoff AND jitter, up to a FINITE maximum — never infinite
 *   * a run of failures opens a circuit, so a dead provider is not called again
 *     for every keyword in the run
 *
 * THE TWO RULES THIS ENFORCES
 * ---------------------------
 * 1. A provider failure NEVER fails the run. It is recorded and the caller
 *    continues — that is what makes PARTIAL_SUCCESS possible.
 * 2. A PERSISTENCE failure DOES fail the run, because it means data was lost.
 *    The two are handled in different places on purpose.
 */

/** Why a call failed, in terms the run record can report. */
export type FailureKind =
    | 'timeout'
    | 'rate_limited'
    | 'server_error'
    | 'network'
    | 'invalid_response'
    | 'missing_credential'
    | 'circuit_open'
    | 'unknown';

export interface ProviderAttempt {
    provider: string;
    ok: boolean;
    /** 0-based index of this attempt. */
    attempt: number;
    kind?: FailureKind;
    error?: string;
    /** ISO timestamp, so the run log shows real timing. */
    at: string;
}

export interface ProviderRunResult<T> {
    provider: string;
    ok: boolean;
    value: T | null;
    attempts: ProviderAttempt[];
    /** True when the circuit was open and the call was skipped entirely. */
    skippedByCircuit: boolean;
    kind?: FailureKind;
    error?: string;
}

export interface RetryPolicy {
    /** Total tries INCLUDING the first. Finite by construction. */
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    /** Per-attempt budget. */
    timeoutMs: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
    maxAttempts: 3,
    baseDelayMs: 250,
    maxDelayMs: 10_000,
    timeoutMs: 20_000,
};

/** Classify a thrown error into an actionable kind. */
export function classifyProviderFailure(error: unknown): FailureKind {
    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();

    if (lower.includes('timed out') || lower.includes('timeout') || lower.includes('aborted')) {
        return 'timeout';
    }
    if (lower.includes('429') || lower.includes('rate limit')) return 'rate_limited';
    if (/\b5\d\d\b/.test(lower) || lower.includes('server error')) return 'server_error';
    if (
        lower.includes('fetch failed') ||
        lower.includes('enotfound') ||
        lower.includes('econnrefused') ||
        lower.includes('network')
    ) {
        return 'network';
    }
    if (lower.includes('invalid_response') || lower.includes('must be')) {
        return 'invalid_response';
    }
    return 'unknown';
}

/** True when retrying could plausibly succeed. */
export function isRetryable(kind: FailureKind): boolean {
    return (
        kind === 'timeout' ||
        kind === 'rate_limited' ||
        kind === 'server_error' ||
        kind === 'network'
    );
}

/** Exponential backoff with FULL jitter, clamped to maxDelayMs. */
export function backoffDelay(attempt: number, policy: RetryPolicy, random: () => number): number {
    const ceiling = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** attempt);
    // Full jitter avoids a thundering herd when many keys retry at once.
    return Math.floor(random() * ceiling);
}

/* ------------------------------------------------------------------ */
/* Circuit breaker                                                    */
/* ------------------------------------------------------------------ */

export type CircuitState = 'closed' | 'open' | 'half_open';

export interface CircuitSnapshot {
    state: CircuitState;
    consecutiveFailures: number;
    openedAt: number | null;
}

/**
 * Per-provider circuit breaker.
 *
 * OPEN after `threshold` consecutive failures; HALF_OPEN after `resetMs`, which
 * admits exactly ONE probe. If the probe succeeds the circuit closes and the
 * count resets; if it fails it re-opens.
 *
 * HALF_OPEN admits a single caller deliberately: without that, a reset would
 * stampede every call in the run at once, which is the failure this exists to
 * prevent.
 */
export class ProviderCircuitBreaker {
    private state: CircuitState = 'closed';
    private failures = 0;
    private openedAt: number | null = null;
    private probing = false;

    constructor(
        private readonly provider: string,
        private readonly threshold: number = 5,
        private readonly resetMs: number = 30_000,
        private readonly now: () => number = Date.now
    ) {}

    snapshot(): CircuitSnapshot {
        return {
            state: this.state,
            consecutiveFailures: this.failures,
            openedAt: this.openedAt,
        };
    }

    /** Whether a call may proceed right now. */
    canAttempt(): boolean {
        if (this.state === 'closed') return true;

        if (this.state === 'open') {
            const openedAt = this.openedAt ?? 0;
            if (this.now() - openedAt < this.resetMs) return false;
            this.state = 'half_open';
            this.probing = true;
            return true;
        }

        // half_open: one probe at a time.
        if (this.probing) return false;
        this.probing = true;
        return true;
    }

    recordSuccess(): void {
        this.state = 'closed';
        this.failures = 0;
        this.openedAt = null;
        this.probing = false;
    }

    recordFailure(): void {
        this.failures += 1;
        this.probing = false;
        if (this.state === 'half_open' || this.failures >= this.threshold) {
            this.state = 'open';
            this.openedAt = this.now();
        }
    }

    get name(): string {
        return this.provider;
    }
}
/* ------------------------------------------------------------------ */
/* The runner                                                         */
/* ------------------------------------------------------------------ */

export interface ProviderRunnerOptions {
    policy?: RetryPolicy;
    /** Injected for deterministic tests; defaults to real jitter. */
    random?: () => number;
    sleep?: (ms: number) => Promise<void>;
    now?: () => number;
    circuitThreshold?: number;
    circuitResetMs?: number;
}

export class ProviderRunner {
    private readonly policy: RetryPolicy;
    private readonly random: () => number;
    private readonly sleep: (ms: number) => Promise<void>;
    private readonly now: () => number;
    private readonly breakers = new Map<string, ProviderCircuitBreaker>();

    constructor(private readonly options: ProviderRunnerOptions = {}) {
        this.policy = options.policy ?? DEFAULT_RETRY_POLICY;
        this.random = options.random ?? Math.random;
        this.sleep = options.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
        this.now = options.now ?? Date.now;
    }

    /** One breaker per provider, shared across the whole run. */
    breaker(provider: string): ProviderCircuitBreaker {
        let b = this.breakers.get(provider);
        if (!b) {
            b = new ProviderCircuitBreaker(
                provider,
                this.options.circuitThreshold ?? 5,
                this.options.circuitResetMs ?? 30_000,
                this.now
            );
            this.breakers.set(provider, b);
        }
        return b;
    }

    /** Circuit state per provider, for the run record and health report. */
    circuitStates(): Record<string, CircuitSnapshot> {
        const out: Record<string, CircuitSnapshot> = {};
        for (const [name, b] of this.breakers) out[name] = b.snapshot();
        return out;
    }

    /**
     * Run one provider call with timeout, retry, backoff and circuit breaking.
     *
     * It NEVER throws, so the caller can process the remaining providers after a
     * failure. That is what makes PARTIAL_SUCCESS possible instead of one dead
     * provider aborting the weekly run.
     */
    async run<T>(
        provider: string,
        fn: (attempt: number) => Promise<T>
    ): Promise<ProviderRunResult<T>> {
        const breaker = this.breaker(provider);
        const attempts: ProviderAttempt[] = [];

        if (!breaker.canAttempt()) {
            return {
                provider,
                ok: false,
                value: null,
                attempts,
                skippedByCircuit: true,
                kind: 'circuit_open',
                error: `circuit open for ${provider}; call skipped without hitting the provider`,
            };
        }

        let lastKind: FailureKind = 'unknown';
        let lastError = '';

        for (let attempt = 0; attempt < this.policy.maxAttempts; attempt += 1) {
            try {
                const value = await this.withTimeout(fn(attempt));
                attempts.push({
                    provider,
                    ok: true,
                    attempt,
                    at: new Date(this.now()).toISOString(),
                });
                breaker.recordSuccess();
                return { provider, ok: true, value, attempts, skippedByCircuit: false };
            } catch (err: unknown) {
                lastKind = classifyProviderFailure(err);
                lastError = err instanceof Error ? err.message : String(err);
                attempts.push({
                    provider,
                    ok: false,
                    attempt,
                    kind: lastKind,
                    error: lastError,
                    at: new Date(this.now()).toISOString(),
                });

                const isLast = attempt === this.policy.maxAttempts - 1;

                // Every failed attempt counts against the circuit, INCLUDING the
                // last one. Recording only the attempts that happen to be retried
                // (as this previously did) meant a provider that failed all N
                // attempts recorded N-1 failures, so with maxAttempts=3 a
                // permanently dead provider could never reach a threshold of 5 by
                // itself — the breaker never opened, and the run kept hammering
                // a host that was already down. A failure is a failure whether or
                // not we choose to try again.
                breaker.recordFailure();

                if (isLast || !isRetryable(lastKind)) break;

                await this.sleep(backoffDelay(attempt, this.policy, this.random));
            }
        }
        return {
            provider,
            ok: false,
            value: null,
            attempts,
            skippedByCircuit: false,
            kind: lastKind,
            error: lastError,
        };
    }

    /** Bound one attempt. A hang must not hold the weekly run open forever. */
    private async withTimeout<T>(p: Promise<T>): Promise<T> {
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
            return await Promise.race([
                p,
                new Promise<never>((_, reject) => {
                    timer = setTimeout(
                        () => reject(new Error("timeout after " + this.policy.timeoutMs + "ms")),
                        this.policy.timeoutMs
                    );
                }),
            ]);
        } finally {
            if (timer) clearTimeout(timer);
        }
    }
}

/** Aggregate provider outcomes into a run-level verdict. */
export interface RunVerdict {
    sourcesAttempted: number;
    sourcesSucceeded: number;
    sourcesFailed: number;
    /** RUNNING | COMPLETED | PARTIAL_SUCCESS | FAILED */
    status: string;
}

/**
 * Derive the run status from provider outcomes.
 *
 * The asymmetry is deliberate and is the whole point of PARTIAL_SUCCESS: a
 * provider failure downgrades COMPLETED to PARTIAL_SUCCESS, but a PERSISTENCE
 * failure forces FAILED outright, because data was lost.
 */
export function deriveRunVerdict(
    outcomes: ReadonlyArray<{ ok: boolean }>,
    persistenceFailed: boolean
): RunVerdict {
    const attempted = outcomes.length;
    const succeeded = outcomes.filter((o) => o.ok).length;
    const failed = attempted - succeeded;

    let status: string;
    if (persistenceFailed) status = 'FAILED';
    else if (failed === 0 && succeeded > 0) status = 'COMPLETED';
    else if (succeeded > 0) status = 'PARTIAL_SUCCESS';
    else status = 'FAILED';

    return {
        sourcesAttempted: attempted,
        sourcesSucceeded: succeeded,
        sourcesFailed: failed,
        status,
    };
}
