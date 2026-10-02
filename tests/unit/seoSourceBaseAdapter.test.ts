/**
 * tests/unit/seoSourceBaseAdapter.test.ts
 *
 * Unit tests for the shared adapter resilience layer
 * (server/seo/sources/baseAdapter.ts).
 *
 * Covered:
 *   - timeout enforcement and the caller-abort path
 *   - bounded retries, exponential backoff and jitter
 *   - circuit breaker closed -> open -> half-open -> closed
 *   - cache keys that separate market and language (never a global cache)
 *   - cache hit, expiry and fail-clear
 *   - quota counters and quota-window rollover
 *   - typed failure surfacing: collect() never rejects
 *
 * Every test injects a fake clock and a fake sleep, so the suite is
 * deterministic and does not spend real seconds on backoff.
 */

import { describe, it, expect } from 'vitest';
import {
    BaseSourceAdapter,
    DEFAULT_BACKOFF_BASE_MS,
    DEFAULT_MAX_RETRIES,
    DEFAULT_TIMEOUT_MS,
    buildCacheKey,
    buildRecord,
    buildUnmeasuredRecord,
    classifyFailure,
    createBaseAdapter,
    isRetryableReason,
} from '../../server/seo/sources/baseAdapter';
import {
    CollectRequest,
    NormalizedIntelligenceRecord,
    emptyKeywordMetrics,
} from '../../server/seo/sources/types';

/** A request scoped to one market/language, so tests stay isolated. */
function makeRequest(overrides: Partial<CollectRequest> = {}): CollectRequest {
    return {
        language: 'en',
        market: 'en-US',
        seeds: ['testosterone cycle'],
        dateWindow: { start: '2026-01-01', end: '2026-01-31' },
        limit: 10,
        ...overrides,
    };
}

/** Minimal valid record; metrics are all-null because nothing measured it. */
function makeRecord(keyword: string): NormalizedIntelligenceRecord {
    return buildUnmeasuredRecord({
        keyword,
        source: 'test_provider',
        sourceType: 'test',
        sourceClass: 'FIRST_PARTY',
        sourceStatus: 'IMPLEMENTED',
        sourceReference: 'test://record',
        evidence: 'test://record',
        evidenceType: 'editorial',
    });
}

/** Base config with a deterministic clock/sleep and no jitter. */
function makeConfig(overrides: Record<string, unknown> = {}) {
    return {
        provider: 'test_provider',
        sourceType: 'test',
        sourceClass: 'FIRST_PARTY' as const,
        status: 'IMPLEMENTED' as const,
        apiVersion: 'v1',
        datasetVersion: '2026-01',
        languages: ['en', 'ar'] as const,
        markets: ['en-US', 'ar-EG'] as const,
        authRequired: false,
        now: () => 1_000_000,
        sleep: async () => {},
        random: () => 0.5,
        ...overrides,
    };
}

describe('SEO source base adapter (server/seo/sources/baseAdapter.ts)', () => {
    describe('1. Timeout', () => {
        it('defaults to a 20s per-attempt timeout', () => {
            const adapter = new BaseSourceAdapter<unknown[]>(makeConfig());
            expect(adapter.options.timeoutMs).toBe(DEFAULT_TIMEOUT_MS);
            expect(DEFAULT_TIMEOUT_MS).toBe(20_000);
        });

        it('rejects a hanging fetch with a typed timeout failure', async () => {
            const adapter = new BaseSourceAdapter<unknown[]>(
                makeConfig({ timeoutMs: 20, maxRetries: 1 }),
                () => new Promise<unknown[]>(() => {}), // never settles
            );

            const result = await adapter.collect(makeRequest());

            expect(result.status).toBe('FAILED');
            expect(result.records).toEqual([]);
            expect(result.error).toContain('timeout');
        });

        it('surfaces a caller abort as a typed failure, not a throw', async () => {
            const controller = new AbortController();
            const adapter = new BaseSourceAdapter<unknown[]>(
                makeConfig({ maxRetries: 1 }),
                () => new Promise<unknown[]>(() => {}),
            );

            const pending = adapter.collect(makeRequest({ signal: controller.signal }));
            controller.abort();
            const result = await pending;

            expect(result.status).toBe('FAILED');
            expect(result.error).toContain('aborted');
        });

        it('classifies a TimeoutError-shaped rejection as timeout', () => {
            const error = new Error('Provider timed out after 20ms');
            error.name = 'TimeoutError';
            expect(classifyFailure(error).reason).toBe('timeout');
        });
    });

    describe('2. Retries and exponential backoff', () => {
        it('defaults to 3 total attempts', () => {
            const adapter = new BaseSourceAdapter<unknown[]>(makeConfig());
            expect(adapter.options.maxRetries).toBe(DEFAULT_MAX_RETRIES);
            expect(DEFAULT_MAX_RETRIES).toBe(3);
        });

        it('retries a retryable failure and succeeds on a later attempt', async () => {
            let calls = 0;
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig(),
                async () => {
                    calls += 1;
                    if (calls < 3) throw new TypeError('fetch failed');
                    return [makeRecord('recovered keyword')];
                },
            );

            const result = await adapter.collect(makeRequest());

            expect(calls).toBe(3);
            expect(result.status).toBe('IMPLEMENTED');
            expect(result.records).toHaveLength(1);
            expect(result.partial).toBe(false);
        });

        it('gives up after maxRetries and returns a FAILED result', async () => {
            let calls = 0;
            const adapter = new BaseSourceAdapter<unknown[]>(
                makeConfig(),
                async () => {
                    calls += 1;
                    throw new TypeError('fetch failed');
                },
            );

            const result = await adapter.collect(makeRequest());

            expect(calls).toBe(3);
            expect(result.status).toBe('FAILED');
            expect(result.error).toContain('network_error');
        });

        it('does not retry a non-retryable 4xx', async () => {
            let calls = 0;
            const adapter = new BaseSourceAdapter<unknown[]>(
                makeConfig(),
                async () => {
                    calls += 1;
                    throw Object.assign(new Error('Provider responded with HTTP 403'), {
                        status: 403,
                    });
                },
            );

            const result = await adapter.collect(makeRequest());

            expect(calls).toBe(1);
            expect(result.status).toBe('FAILED');
            expect(result.error).toContain('http_error');
        });

        it('does retry a 429 and a 5xx but not a 404', () => {
            expect(isRetryableReason('http_error', 429)).toBe(true);
            expect(isRetryableReason('http_error', 503)).toBe(true);
            expect(isRetryableReason('http_error', 404)).toBe(false);
        });

        it('grows the backoff delay exponentially between attempts', () => {
            const adapter = new BaseSourceAdapter<unknown[]>(
                makeConfig({ backoffBaseMs: 100, backoffMaxMs: 10_000 }),
            );
            // random() === 0.5 => zero-centred jitter => exact exponential values.
            expect(adapter.backoffDelayMs(1)).toBe(100);
            expect(adapter.backoffDelayMs(2)).toBe(200);
            expect(adapter.backoffDelayMs(3)).toBe(400);
            expect(adapter.backoffDelayMs(4)).toBe(800);
        });

        it('caps the backoff delay at backoffMaxMs', () => {
            const adapter = new BaseSourceAdapter<unknown[]>(
                makeConfig({ backoffBaseMs: 100, backoffMaxMs: 250 }),
            );
            expect(adapter.backoffDelayMs(10)).toBe(250);
        });

        it('actually sleeps between retries, with growing delays', async () => {
            const delays: number[] = [];
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig({
                    backoffBaseMs: DEFAULT_BACKOFF_BASE_MS,
                    sleep: async (ms: number) => {
                        delays.push(ms);
                    },
                }),
                async () => {
                    if (delays.length < 2) throw new TypeError('fetch failed');
                    return [makeRecord('ok')];
                },
            );

            await adapter.collect(makeRequest());

            expect(delays).toHaveLength(2);
            expect(delays[1]).toBeGreaterThan(delays[0]);
        });

        it('applies jitter around the exponential base', () => {
            const low = new BaseSourceAdapter<unknown[]>(
                makeConfig({ backoffBaseMs: 100, random: () => 0 }),
            );
            const high = new BaseSourceAdapter<unknown[]>(
                makeConfig({ backoffBaseMs: 100, random: () => 1 }),
            );
            // ±25% band, so the low draw is strictly below the high draw.
            expect(low.backoffDelayMs(1)).toBeLessThan(high.backoffDelayMs(1));
            expect(low.backoffDelayMs(1)).toBeGreaterThanOrEqual(75);
            expect(high.backoffDelayMs(1)).toBeLessThanOrEqual(125);
        });
    });

    describe('3. Circuit breaker', () => {
        it('starts closed', () => {
            const adapter = new BaseSourceAdapter<unknown[]>(makeConfig());
            expect(adapter.getCircuitState()).toBe('closed');
        });

        it('opens after the configured number of consecutive failures', async () => {
            const adapter = new BaseSourceAdapter<unknown[]>(
                makeConfig({ circuitFailureThreshold: 2, maxRetries: 1 }),
                async () => {
                    throw new TypeError('fetch failed');
                },
            );

            await adapter.collect(makeRequest());
            expect(adapter.getCircuitState()).toBe('closed'); // 1 of 2

            await adapter.collect(makeRequest());
            expect(adapter.getCircuitState()).toBe('open'); // 2 of 2
        });

        it('rejects calls while open without calling the provider', async () => {
            let providerCalls = 0;
            const adapter = new BaseSourceAdapter<unknown[]>(
                makeConfig({ circuitFailureThreshold: 1, maxRetries: 1 }),
                async () => {
                    providerCalls += 1;
                    throw new TypeError('fetch failed');
                },
            );

            await adapter.collect(makeRequest());
            expect(providerCalls).toBe(1);
            expect(adapter.getCircuitState()).toBe('open');

            // Second call is short-circuited: the provider is never contacted.
            const result = await adapter.collect(makeRequest());
            expect(providerCalls).toBe(1);
            expect(result.status).toBe('FAILED');
            expect(result.error).toContain('circuit_open');
        });

        it('half-opens after the reset window and closes again on success', async () => {
            let clock = 1_000_000;
            let shouldFail = true;
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig({
                    circuitFailureThreshold: 1,
                    circuitResetMs: 30_000,
                    maxRetries: 1,
                    now: () => clock,
                }),
                async () => {
                    if (shouldFail) throw new TypeError('fetch failed');
                    return [makeRecord('back online')];
                },
            );

            await adapter.collect(makeRequest());
            expect(adapter.getCircuitState()).toBe('open');

            // Still inside the reset window: stays open.
            clock += 1_000;
            const rejected = await adapter.collect(makeRequest());
            expect(rejected.error).toContain('circuit_open');
            expect(adapter.getCircuitState()).toBe('open');

            // Reset window elapses: the breaker half-opens and admits a probe.
            clock += 31_000;
            shouldFail = false;
            const probe = await adapter.collect(makeRequest());

            expect(probe.status).toBe('IMPLEMENTED');
            expect(adapter.getCircuitState()).toBe('closed');
        });

        it('re-opens when the half-open probe fails', async () => {
            let clock = 1_000_000;
            const adapter = new BaseSourceAdapter<unknown[]>(
                makeConfig({
                    circuitFailureThreshold: 1,
                    circuitResetMs: 10_000,
                    maxRetries: 1,
                    now: () => clock,
                }),
                async () => {
                    throw new TypeError('fetch failed');
                },
            );

            await adapter.collect(makeRequest());
            expect(adapter.getCircuitState()).toBe('open');

            clock += 11_000;
            await adapter.collect(makeRequest());

            expect(adapter.getCircuitState()).toBe('open');
        });

        it('closes the breaker and clears the streak after a success', async () => {
            let shouldFail = true;
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig({ circuitFailureThreshold: 3, maxRetries: 1 }),
                async () => {
                    if (shouldFail) throw new TypeError('fetch failed');
                    return [makeRecord('ok')];
                },
            );

            await adapter.collect(makeRequest());
            await adapter.collect(makeRequest());
            shouldFail = false;
            await adapter.collect(makeRequest());

            expect(adapter.getCircuitState()).toBe('closed');
            expect(adapter.getLastSuccessAt()).not.toBeNull();
            expect(adapter.getLastError()).toBeNull();
        });
    });

    describe('4. Cache key composition', () => {
        it('includes the market in the key', () => {
            const adapter = new BaseSourceAdapter<unknown[]>(makeConfig());
            const us = adapter.cacheKeyFor(makeRequest({ market: 'en-US' }));
            const eg = adapter.cacheKeyFor(makeRequest({ market: 'ar-EG' }));

            expect(us).toContain('market=en-US');
            expect(eg).toContain('market=ar-EG');
            expect(us).not.toBe(eg);
        });

        it('includes the language in the key', () => {
            const adapter = new BaseSourceAdapter<unknown[]>(makeConfig());
            const en = adapter.cacheKeyFor(makeRequest({ language: 'en' }));
            const ar = adapter.cacheKeyFor(makeRequest({ language: 'ar' }));

            expect(en).toContain('language=en');
            expect(ar).toContain('language=ar');
            expect(en).not.toBe(ar);
        });

        it('never serves an ar-EG response to an en-US caller', async () => {
            const seen: string[] = [];
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig({ dataKind: 'observed' }),
                async (request) => {
                    seen.push(request.market);
                    return [makeRecord(`record for ${request.market}`)];
                },
            );

            const us = await adapter.collect(makeRequest({ market: 'en-US' }));
            const eg = await adapter.collect(makeRequest({ market: 'ar-EG' }));

            // Two distinct provider calls, each returning its own market's data.
            expect(seen).toEqual(['en-US', 'ar-EG']);
            expect(us.records[0].keyword).toBe('record for en-US');
            expect(eg.records[0].keyword).toBe('record for ar-EG');
        });

        it('includes provider, seeds, date window, api and dataset versions', () => {
            const adapter = new BaseSourceAdapter<unknown[]>(makeConfig());
            const key = adapter.cacheKeyFor(makeRequest());

            expect(key).toContain('provider=test_provider');
            expect(key).toContain('seeds=testosterone cycle');
            expect(key).toContain('dateWindow=2026-01-01..2026-01-31');
            expect(key).toContain('apiVersion=v1');
            expect(key).toContain('datasetVersion=2026-01');
        });

        it('separates different date windows', () => {
            const adapter = new BaseSourceAdapter<unknown[]>(makeConfig());
            const january = adapter.cacheKeyFor(makeRequest());
            const february = adapter.cacheKeyFor(
                makeRequest({
                    dateWindow: { start: '2026-02-01', end: '2026-02-28' },
                }),
            );
            expect(january).not.toBe(february);
        });

        it('separates different api and dataset versions', () => {
            const v1 = buildCacheKey({
                provider: 'p', language: 'en', market: 'en-US',
                apiVersion: 'v1', datasetVersion: 'd1',
            });
            const v2 = buildCacheKey({
                provider: 'p', language: 'en', market: 'en-US',
                apiVersion: 'v2', datasetVersion: 'd1',
            });
            const d2 = buildCacheKey({
                provider: 'p', language: 'en', market: 'en-US',
                apiVersion: 'v1', datasetVersion: 'd2',
            });
            expect(v1).not.toBe(v2);
            expect(v1).not.toBe(d2);
        });

        it('is order-independent for seeds', () => {
            const a = buildCacheKey({
                provider: 'p', language: 'en', market: 'en-US', seeds: ['b', 'a'],
            });
            const b = buildCacheKey({
                provider: 'p', language: 'en', market: 'en-US', seeds: ['a', 'b'],
            });
            expect(a).toBe(b);
        });
    });

    describe('5. Cache behaviour', () => {
        it('serves a second identical request from cache', async () => {
            let calls = 0;
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig(),
                async () => {
                    calls += 1;
                    return [makeRecord('cached keyword')];
                },
            );

            await adapter.collect(makeRequest());
            const second = await adapter.collect(makeRequest());

            expect(calls).toBe(1);
            expect(second.records).toHaveLength(1);
            expect(second.records[0].keyword).toBe('cached keyword');
        });

        it('expires the entry once the TTL has elapsed', async () => {
            let clock = 1_000_000;
            let calls = 0;
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig({ cacheTtlSeconds: 60, now: () => clock }),
                async () => {
                    calls += 1;
                    return [makeRecord('cached keyword')];
                },
            );

            await adapter.collect(makeRequest());
            clock += 61_000; // past the 60s TTL
            await adapter.collect(makeRequest());

            expect(calls).toBe(2);
        });

        it('fails clear: a failure leaves no readable cache entry behind', async () => {
            let calls = 0;
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig({ maxRetries: 1 }),
                async () => {
                    calls += 1;
                    if (calls === 1) return [makeRecord('first success')];
                    throw new TypeError('fetch failed');
                },
            );

            await adapter.collect(makeRequest());
            expect(adapter.cacheSize()).toBe(1);

            // A different seed => a different key => a real failing call.
            const failed = await adapter.collect(
                makeRequest({ seeds: ['a different seed'] }),
            );

            expect(failed.status).toBe('FAILED');
            // The failed key is not cached, so only the first success remains.
            expect(adapter.cacheSize()).toBe(1);
        });

        it('invalidate() drops the entry for one request', async () => {
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig(),
                async () => [makeRecord('keyword')],
            );

            await adapter.collect(makeRequest());
            expect(adapter.cacheSize()).toBe(1);

            adapter.invalidate(makeRequest());
            expect(adapter.cacheSize()).toBe(0);
        });

        it('caches an empty result (a real "no matches" answer is still an answer)', async () => {
            let calls = 0;
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig(),
                async () => {
                    calls += 1;
                    return [];
                },
            );

            await adapter.collect(makeRequest());
            const second = await adapter.collect(makeRequest());

            // An empty page is a legitimate provider answer worth caching; only
            // undefined/null is refused, so the key cannot be poisoned.
            expect(calls).toBe(1);
            expect(second.records).toEqual([]);
            expect(adapter.cacheSize()).toBe(1);
        });

        it('does not cache an undefined result', async () => {
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[] | undefined>(
                makeConfig(),
                async () => undefined,
            );

            await adapter.collect(makeRequest());
            expect(adapter.cacheSize()).toBe(0);
        });
    });

    describe('6. Quota', () => {
        it('counts one unit per attempt', async () => {
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig({ quotaLimit: 10, now: () => 1_000_000 }),
                async () => [makeRecord('keyword')],
            );

            expect(adapter.getQuotaUsed()).toBe(0);
            await adapter.execute(makeRequest());
            expect(adapter.getQuotaUsed()).toBe(1);
        });

        it('refuses further calls once the limit is reached', async () => {
            let providerCalls = 0;
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig({ quotaLimit: 2, maxRetries: 1, now: () => 1_000_000 }),
                async () => {
                    providerCalls += 1;
                    return [makeRecord('keyword')];
                },
            );

            await adapter.execute(makeRequest());
            await adapter.execute(makeRequest());
            expect(providerCalls).toBe(2);

            const result = await adapter.collect(
                makeRequest({ seeds: ['another seed'] }),
            );

            // Quota blocks the call before the provider is contacted.
            expect(providerCalls).toBe(2);
            expect(result.status).toBe('FAILED');
            expect(result.error).toContain('quota_exhausted');
        });

        it('rolls the window over and restores capacity', async () => {
            let clock = 1_000_000;
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig({
                    quotaLimit: 1,
                    quotaWindowSeconds: 60,
                    maxRetries: 1,
                    now: () => clock,
                }),
                async () => [makeRecord('keyword')],
            );

            await adapter.execute(makeRequest());
            expect(adapter.getQuotaUsed()).toBe(1);

            // Same window: still exhausted.
            clock += 30_000;
            expect(adapter.getQuotaUsed()).toBe(1);

            // Window elapsed: the counter resets.
            clock += 31_000;
            expect(adapter.getQuotaUsed()).toBe(0);
            await adapter.execute(makeRequest());
            expect(adapter.getQuotaUsed()).toBe(1);
        });

        it('resetQuota() clears the counter immediately', async () => {
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig({ quotaLimit: 5, now: () => 1_000_000 }),
                async () => [makeRecord('keyword')],
            );

            await adapter.execute(makeRequest());
            expect(adapter.getQuotaUsed()).toBe(1);

            adapter.resetQuota();
            expect(adapter.getQuotaUsed()).toBe(0);
        });

        it('treats a null limit as unlimited', async () => {
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig({ quotaLimit: null, now: () => 1_000_000 }),
                async () => [makeRecord('keyword')],
            );

            for (let i = 0; i < 20; i += 1) {
                await adapter.execute(
                    makeRequest({ seeds: [`seed ${i}`], query: `q${i}` }),
                );
            }
            expect(adapter.getQuotaUsed()).toBe(20);
        });
    });

    describe('7. Failure isolation and record honesty', () => {
        it('returns FAILED with an exact error instead of throwing', async () => {
            const adapter = new BaseSourceAdapter<unknown[]>(
                makeConfig({ maxRetries: 1 }),
                async () => {
                    throw new Error('provider exploded');
                },
            );

            // No rejection escapes: a dead provider cannot take the pipeline down.
            const result = await adapter.collect(makeRequest());
            expect(result.status).toBe('FAILED');
            expect(result.records).toEqual([]);
            expect(result.dataKind).toBe('unavailable');
            expect(result.error).toContain('provider exploded');
        });

        it('returns the declared blocked reason without calling the provider', async () => {
            let providerCalls = 0;
            const adapter = new BaseSourceAdapter<NormalizedIntelligenceRecord[]>(
                makeConfig({ blockedReason: 'no credentials configured' }),
                async () => {
                    providerCalls += 1;
                    return [makeRecord('keyword')];
                },
            );

            const result = await adapter.collect(makeRequest());

            expect(providerCalls).toBe(0);
            expect(result.status).toBe('FAILED');
            expect(result.error).toBe('no credentials configured');
        });

        it('never invents metrics: defaults are all-null', () => {
            const record = buildUnmeasuredRecord({
                keyword: 'no measurement here',
                source: 'test_provider',
                sourceType: 'test',
                sourceClass: 'FIRST_PARTY',
                sourceStatus: 'PLANNED',
                sourceReference: 'test://none',
                evidence: 'test://none',
                evidenceType: 'editorial',
            });

            expect(record.dataKind).toBe('unavailable');
            for (const value of Object.values(record.metrics)) {
                expect(value).toBeNull();
            }
        });

        it('keeps metrics fields independent when only one is measured', () => {
            const record = buildRecord({
                keyword: 'gsc observed',
                source: 'google_search_console',
                sourceType: 'google_search_console',
                sourceClass: 'SEARCH_INTELLIGENCE',
                sourceStatus: 'CONNECTED',
                sourceReference: 'gsc://row',
                dataKind: 'observed',
                evidence: 'gsc://row',
                evidenceType: 'imported_serp_export',
                metrics: { googleImpressions: 1200 },
            });

            // Only the observed field is populated; nothing is inferred from it.
            expect(record.metrics.googleImpressions).toBe(1200);
            expect(record.metrics.googleClicks).toBeNull();
            expect(record.metrics.bingImpressions).toBeNull();
            expect(record.metrics.thirdPartyVolumeEstimate).toBeNull();
        });

        it('emptyKeywordMetrics() is all-null and has 11 independent fields', () => {
            const metrics = emptyKeywordMetrics();
            expect(Object.values(metrics).every((v) => v === null)).toBe(true);
            expect(Object.keys(metrics)).toHaveLength(11);
        });

        it('createBaseAdapter() builds an equivalent instance', () => {
            const adapter = createBaseAdapter<unknown[]>(makeConfig());
            expect(adapter.provider).toBe('test_provider');
            expect(adapter.getCircuitState()).toBe('closed');
        });
    });
});







