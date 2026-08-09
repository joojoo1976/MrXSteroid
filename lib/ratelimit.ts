/**
 * ratelimit.ts — Upstash-backed rate limiting with a fail-open fallback.
 * Zero-trust posture: if Upstash env vars are absent (local/dev), we still
 * enforce a conservative in-memory fixed-window so endpoints are never wide open.
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.REDIS_URL ?? '';
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.REDIS_TOKEN ?? '';

interface RateResult {
    success: boolean;
    remaining: number;
    limit: number;
}

/**
 * In-memory fixed-window limiter (per IP). Used only when Upstash is not
 * configured — still protects against brute-force bursts in development.
 */
class MemoryRatelimiter {
    private hits = new Map<string, { count: number; resetAt: number }>();
    constructor(private readonly windowMs: number, private readonly maxHits: number) {}

    limit(key: string): RateResult {
        const now = Date.now();
        const bucket = this.hits.get(key);
        if (!bucket || bucket.resetAt <= now) {
            this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
            return { success: true, remaining: this.maxHits - 1, limit: this.maxHits };
        }
        if (bucket.count >= this.maxHits) {
            return { success: false, remaining: 0, limit: this.maxHits };
        }
        bucket.count += 1;
        return { success: true, remaining: this.maxHits - bucket.count, limit: this.maxHits };
    }
}

const memoryLimiter = new MemoryRatelimiter(60_000, 10);

/** Resolves a per-request client key (IP) from the request headers. */
export function clientIp(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return req.headers.get('x-real-ip') ?? 'anonymous';
}

let upstashRatelimit: Ratelimit | null = null;
if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({ url: UPSTASH_REDIS_REST_URL, token: UPSTASH_REDIS_REST_TOKEN });
    upstashRatelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        prefix: 'mrx:calculate',
    });
}

/**
 * Enforce the per-IP limit for the given key. Returns success + remaining
 * count. Uses Upstash when configured, else the in-memory fallback.
 */
export async function enforceRateLimit(key: string): Promise<RateResult> {
    if (upstashRatelimit) {
        const { success, remaining, limit } = await upstashRatelimit.limit(key);
        return { success, remaining, limit };
    }
    return memoryLimiter.limit(key);
}
