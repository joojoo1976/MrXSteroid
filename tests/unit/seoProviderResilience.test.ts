/**
 * Spec §18 / §27 / §31 — resilience and graceful degradation.
 *
 * The point of these tests is that a DEAD PROVIDER MUST NOT KILL THE WEEK. They
 * assert the failure semantics directly: retry, backoff, circuit breaking,
 * timeout, PARTIAL_SUCCESS, and the one asymmetry that matters — persistence
 * failure is FAILED, provider failure is not.
 */
import { describe, it, expect } from 'vitest';

import {
    ProviderRunner,
    ProviderCircuitBreaker,
    DEFAULT_RETRY_POLICY,
    backoffDelay,
    classifyProviderFailure,
    deriveRunVerdict,
    isRetryable,
} from '../../server/seo/sources/providerRunner';

/** A runner with no real waiting and no real jitter, so tests are instant. */
function testRunner(overrides: Record<string, unknown> = {}) {
    return new ProviderRunner({
        random: () => 1,
        sleep: async () => {},
        now: () => 1_700_000_000_000,
        ...overrides,
    });
}

describe('§18 · retry is bounded, backed off, and never infinite', () => {
    it('retries a transient failure and succeeds', async () => {
        const runner = testRunner();
        let calls = 0;
        const r = await runner.run('gsc', async () => {
            calls += 1;
            if (calls < 3) throw new Error('HTTP 429 rate limited');
            return 'real-data';
        });

        expect(r.ok).toBe(true);
        expect(r.value).toBe('real-data');
        expect(calls).toBe(3);
        expect(r.attempts).toHaveLength(3);
    });

    it('stops at maxAttempts instead of looping forever', async () => {
        const runner = testRunner();
        let calls = 0;
        const r = await runner.run('bing', async () => {
            calls += 1;
            throw new Error('fetch failed');
        });

        expect(r.ok).toBe(false);
        // A retry loop without a maximum is a hang. This asserts the ceiling.
        expect(calls).toBe(DEFAULT_RETRY_POLICY.maxAttempts);
    });

    it('does NOT retry a non-transient failure', async () => {
        const runner = testRunner();
        let calls = 0;
        await runner.run('ads', async () => {
            calls += 1;
            throw new Error('invalid_response: results missing');
        });
        // Retrying a malformed response just wastes quota.
        expect(calls).toBe(1);
    });

    it('backoff is clamped to the maximum', () => {
        const policy = DEFAULT_RETRY_POLICY;
        expect(backoffDelay(0, policy, () => 1)).toBeLessThanOrEqual(policy.maxDelayMs);
        // Jitter can make a later delay SMALLER; the ceiling is what is enforced.
        expect(backoffDelay(20, policy, () => 1)).toBeLessThanOrEqual(policy.maxDelayMs);
    });

    it('classifies failures into actionable kinds', () => {
        expect(classifyProviderFailure(new Error('request timeout'))).toBe('timeout');
        expect(classifyProviderFailure(new Error('HTTP 429'))).toBe('rate_limited');
        expect(classifyProviderFailure(new Error('HTTP 503 server error'))).toBe('server_error');
        expect(classifyProviderFailure(new Error('fetch failed'))).toBe('network');
        expect(isRetryable('rate_limited')).toBe(true);
        expect(isRetryable('invalid_response')).toBe(false);
    });
});

describe('§18 · circuit breaker actually opens', () => {
    it('opens after the threshold and skips calls without hitting the provider', async () => {
        const runner = testRunner({ circuitThreshold: 2 });
        const alwaysFail = async () => {
            throw new Error('HTTP 500');
        };

        await runner.run('gsc', alwaysFail);
        await runner.run('gsc', alwaysFail);
        expect(runner.breaker('gsc').snapshot().state).toBe('open');

        // A dead provider must not be called again for every keyword.
        let reached = 0;
        const third = await runner.run('gsc', async () => {
            reached += 1;
            return 'ok';
        });

        expect(third.skippedByCircuit).toBe(true);
        expect(third.kind).toBe('circuit_open');
        expect(reached).toBe(0);
    });

    it('half-opens after the reset and closes on a successful probe', () => {
        let clock = 0;
        const cb = new ProviderCircuitBreaker('x', 1, 1_000, () => clock);
        cb.recordFailure();
        expect(cb.snapshot().state).toBe('open');

        clock = 1_500;
        expect(cb.canAttempt()).toBe(true);
        expect(cb.snapshot().state).toBe('half_open');
        cb.recordSuccess();
        expect(cb.snapshot().state).toBe('closed');
    });

    it('half-open admits only ONE probe at a time', () => {
        let clock = 0;
        const cb = new ProviderCircuitBreaker('x', 1, 1_000, () => clock);
        cb.recordFailure();
        clock = 1_500;
        expect(cb.canAttempt()).toBe(true);
        // A second concurrent caller must be blocked, or a reset stampedes.
        expect(cb.canAttempt()).toBe(false);
    });
});

describe('§18 · a timeout is bounded', () => {
    it('a hanging provider is cut off and reported as timeout', async () => {
        const runner = testRunner({
            policy: { ...DEFAULT_RETRY_POLICY, maxAttempts: 1, timeoutMs: 20 },
        });
        const r = await runner.run('slow', () => new Promise(() => {}));

        expect(r.ok).toBe(false);
        expect(r.kind).toBe('timeout');
    });
describe('§27 · one provider failing never fails the run', () => {
    it('CONTINUES to the next provider after a failure', async () => {
        const runner = testRunner();
        const results = [];
        for (const [name, ok] of [['gsc', true], ['ads', false], ['bing', true]] as const) {
            results.push(
                await runner.run(name, async () => {
                    if (!ok) throw new Error('missing credential');
                    return `${name}-data`;
                })
            );
        }
        // The failing provider did not prevent the others from running.
        expect(results.map((r) => r.ok)).toEqual([true, false, true]);
    });

    it('PARTIAL_SUCCESS when some succeed', () => {
        expect(deriveRunVerdict([{ ok: true }, { ok: false }, { ok: true }], false).status)
            .toBe('PARTIAL_SUCCESS');
    });

    it('COMPLETED only when every source succeeded', () => {
        expect(deriveRunVerdict([{ ok: true }, { ok: true }], false).status).toBe('COMPLETED');
    });

    it('FAILED when every source failed', () => {
        expect(deriveRunVerdict([{ ok: false }, { ok: false }], false).status).toBe('FAILED');
    });
});

describe('§27 · persistence failure is FAILED, never softened', () => {
    it('a persistence failure overrides a successful provider set', () => {
        // Providers succeeded but the write failed: data was lost, so this is
        // FAILED and must never be reported as COMPLETED or PARTIAL_SUCCESS.
        expect(deriveRunVerdict([{ ok: true }, { ok: true }], true).status).toBe('FAILED');
    });

    it('reports the counts it used to decide', () => {
        expect(deriveRunVerdict([{ ok: true }, { ok: false }], false)).toMatchObject({
            sourcesAttempted: 2,
            sourcesSucceeded: 1,
            sourcesFailed: 1,
        });
    });
});
});