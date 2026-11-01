import { Ratelimit } from '@upstash/ratelimit';
import type { Redis } from '@upstash/redis';
import {
    TranslationStorageUnavailableError,
    createTranslationRedis,
    withTranslationStorageTimeout,
} from './storage';

export type TranslationRateLimitResult = {
    readonly success: boolean;
    readonly remaining: number;
    readonly limit: number;
};

export interface TranslationRateLimiter {
    readonly persistent: boolean;
    limit(key: string): Promise<TranslationRateLimitResult>;
}

export class MemoryTranslationRateLimiter implements TranslationRateLimiter {
    readonly persistent = false;
    private readonly hits = new Map<string, { count: number; resetAt: number }>();
    constructor(private readonly maxHits = 10, private readonly windowMs = 60_000, private readonly now = () => Date.now()) {}
    async limit(key: string): Promise<TranslationRateLimitResult> {
        const now = this.now();
        const current = this.hits.get(key);
        if (!current || current.resetAt <= now) {
            this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
            return { success: true, remaining: this.maxHits - 1, limit: this.maxHits };
        }
        if (current.count >= this.maxHits) return { success: false, remaining: 0, limit: this.maxHits };
        current.count += 1;
        return { success: true, remaining: this.maxHits - current.count, limit: this.maxHits };
    }
}

export class UpstashTranslationRateLimiter implements TranslationRateLimiter {
    readonly persistent = true;
    private readonly limiter: Ratelimit;
    constructor(redis: Redis, maxHits: number, private readonly timeoutMs = 3_000) {
        this.limiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(maxHits, '1 m'),
            prefix: 'mrx:translation:rate',
        });
    }
    async limit(key: string): Promise<TranslationRateLimitResult> {
        try {
            const result = await withTranslationStorageTimeout(() => this.limiter.limit(key), this.timeoutMs);
            return { success: result.success, remaining: result.remaining, limit: result.limit };
        } catch {
            throw new TranslationStorageUnavailableError();
        }
    }
}

export function createTranslationRateLimiter(config: {
    upstashUrl: string | null;
    upstashToken: string | null;
    rateLimitPerMinute: number;
    redisTimeoutMs: number;
}): TranslationRateLimiter | null {
    if (!config.upstashUrl || !config.upstashToken) return null;
    return new UpstashTranslationRateLimiter(
        createTranslationRedis({ upstashUrl: config.upstashUrl, upstashToken: config.upstashToken, redisTimeoutMs: config.redisTimeoutMs }),
        config.rateLimitPerMinute,
        config.redisTimeoutMs
    );
}

export function createTranslationRateLimiterFromEnv(): TranslationRateLimiter | null {
    return createTranslationRateLimiter({
        upstashUrl: process.env.UPSTASH_REDIS_REST_URL ?? null,
        upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? null,
        rateLimitPerMinute: Number(process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE ?? 10),
        redisTimeoutMs: 3_000,
    });
}
