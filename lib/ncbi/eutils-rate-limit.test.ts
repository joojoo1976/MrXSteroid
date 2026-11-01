import { describe, expect, it, vi } from 'vitest';
import {
  checkNcbiGlobalPermit,
  NCBI_EUTILS_REQUESTS_PER_SECOND,
  NCBI_EUTILS_WINDOW_MS,
  NCBI_GLOBAL_LIMIT_KEY,
  NCBI_GLOBAL_LIMIT_SCRIPT,
} from './eutils-rate-limit';

describe('NCBI shared E-utilities limiter', () => {
  it('declares a global policy of three requests per one-second window', () => {
    expect(NCBI_EUTILS_REQUESTS_PER_SECOND).toBe(3);
    expect(NCBI_EUTILS_WINDOW_MS).toBe(1_000);
    expect(NCBI_GLOBAL_LIMIT_KEY).toBe('global:ncbi:eutils');
    expect(NCBI_GLOBAL_LIMIT_SCRIPT).toContain("redis.call('TIME')");
    expect(NCBI_GLOBAL_LIMIT_SCRIPT).toContain("redis.call('ZADD'");
  });

  it('uses the same global identifier for every request', async () => {
    const evalScript = vi.fn().mockResolvedValue([1, 0]);
    const limiter = { eval: evalScript };
    expect(await checkNcbiGlobalPermit(limiter)).toEqual({ status: 'ALLOWED' });
    expect(await checkNcbiGlobalPermit(limiter)).toEqual({ status: 'ALLOWED' });
    expect(evalScript).toHaveBeenNthCalledWith(1, [NCBI_GLOBAL_LIMIT_KEY], ['1000', '3', expect.any(String)]);
    expect(evalScript).toHaveBeenNthCalledWith(2, [NCBI_GLOBAL_LIMIT_KEY], ['1000', '3', expect.any(String)]);
  });

  it('returns RATE_LIMITED with a positive retry time when Upstash denies a request', async () => {
    const limiter = { eval: vi.fn().mockResolvedValue([0, 5_500]) };
    await expect(checkNcbiGlobalPermit(limiter)).resolves.toEqual({ status: 'RATE_LIMITED', retryAfter: 6 });
  });

  it('fails closed with the required reason and retry time when limiter configuration is absent', async () => {
    await expect(checkNcbiGlobalPermit(null)).resolves.toEqual({ status: 'NOT_AVAILABLE', reason: 'NCBI_LIMITER_UNAVAILABLE', retryAfter: 60 });
  });

  it('fails closed when Upstash cannot verify a decision', async () => {
    const limiter = { eval: vi.fn().mockRejectedValue(new Error('Upstash unavailable')) };
    await expect(checkNcbiGlobalPermit(limiter)).resolves.toEqual({ status: 'NOT_AVAILABLE', reason: 'NCBI_LIMITER_UNAVAILABLE', retryAfter: 60 });
  });

  it('fails closed when the limiter returns a malformed decision', async () => {
    const limiter = { eval: vi.fn().mockResolvedValue({ allowed: true }) };
    await expect(checkNcbiGlobalPermit(limiter)).resolves.toEqual({ status: 'NOT_AVAILABLE', reason: 'NCBI_LIMITER_UNAVAILABLE', retryAfter: 60 });
  });
});
