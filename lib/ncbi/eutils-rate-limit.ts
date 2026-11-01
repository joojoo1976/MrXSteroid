import { randomUUID } from 'node:crypto';
import { Redis } from '@upstash/redis';

export const NCBI_GLOBAL_LIMIT_KEY = 'global:ncbi:eutils';
export const NCBI_LIMITER_UNAVAILABLE_RETRY_AFTER_SECONDS = 60;
export const NCBI_EUTILS_REQUESTS_PER_SECOND = 3;
export const NCBI_EUTILS_WINDOW_MS = 1_000;

export type NcbiPermit =
  | { status: 'ALLOWED' }
  | { status: 'RATE_LIMITED'; retryAfter: number }
  | { status: 'NOT_AVAILABLE'; reason: 'NCBI_LIMITER_UNAVAILABLE'; retryAfter: 60 };

export type SharedLimiter = {
  eval: (keys: string[], args: string[]) => Promise<unknown>;
};

/**
 * Atomic exact rolling-window limiter. Redis TIME is the clock shared by all
 * app instances, and the sorted set key is global for all E-utilities calls.
 */
export const NCBI_GLOBAL_LIMIT_SCRIPT = `
local clock = redis.call('TIME')
local now = tonumber(clock[1]) * 1000 + math.floor(tonumber(clock[2]) / 1000)
local windowMs = tonumber(ARGV[1])
local maximum = tonumber(ARGV[2])
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - windowMs)
local count = redis.call('ZCARD', KEYS[1])
if count >= maximum then
  local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
  local retryMs = math.max(1, windowMs - (now - tonumber(oldest[2])))
  return {0, retryMs}
end
redis.call('ZADD', KEYS[1], now, ARGV[3])
redis.call('PEXPIRE', KEYS[1], windowMs * 2)
return {1, 0}
`;

function unavailable(): NcbiPermit {
  return {
    status: 'NOT_AVAILABLE',
    reason: 'NCBI_LIMITER_UNAVAILABLE',
    retryAfter: NCBI_LIMITER_UNAVAILABLE_RETRY_AFTER_SECONDS,
  };
}

function parseScriptResult(result: unknown): NcbiPermit {
  if (!Array.isArray(result) || result.length !== 2) return unavailable();
  const allowed = Number(result[0]);
  const retryMs = Number(result[1]);
  if (allowed === 1 && retryMs === 0) return { status: 'ALLOWED' };
  if (allowed === 0 && Number.isFinite(retryMs) && retryMs > 0) {
    return { status: 'RATE_LIMITED', retryAfter: Math.max(1, Math.ceil(retryMs / 1000)) };
  }
  return unavailable();
}

export async function checkNcbiGlobalPermit(limiter: SharedLimiter | null): Promise<NcbiPermit> {
  if (!limiter) return unavailable();
  try {
    const result = await limiter.eval(
      [NCBI_GLOBAL_LIMIT_KEY],
      [String(NCBI_EUTILS_WINDOW_MS), String(NCBI_EUTILS_REQUESTS_PER_SECOND), randomUUID()],
    );
    return parseScriptResult(result);
  } catch {
    return unavailable();
  }
}

let sharedNcbiLimiter: SharedLimiter | null | undefined;

function getSharedNcbiLimiter(): SharedLimiter | null {
  if (sharedNcbiLimiter !== undefined) return sharedNcbiLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    sharedNcbiLimiter = null;
    return null;
  }

  try {
    const redis = new Redis({ url, token });
    const script = redis.createScript<unknown>(NCBI_GLOBAL_LIMIT_SCRIPT);
    sharedNcbiLimiter = { eval: (keys, args) => script.eval(keys, args) };
  } catch {
    sharedNcbiLimiter = null;
  }
  return sharedNcbiLimiter;
}

/** One shared Upstash Redis key gates every NCBI E-utilities request. */
export function acquireNcbiEutilsPermit(): Promise<NcbiPermit> {
  return checkNcbiGlobalPermit(getSharedNcbiLimiter());
}

/** Test-only reset hook; it does not read or mutate external Redis state. */
export function resetNcbiLimiterForTests(): void {
  sharedNcbiLimiter = undefined;
}
