/**
 * Central, server-only T1-B configuration (§25–§30).
 *
 * Defaults are conservative operational starting points, not owner-approved
 * financial limits. Every numeric value is bounded and may be overridden only
 * through a server environment variable. Production activation additionally
 * requires a signing secret and shared Upstash credentials.
 */
export const TRANSLATION_CONFIG_DEFAULTS = {
    sessionTtlMs: 5 * 60 * 1000,
    sessionMaxRequests: 8,
    sessionMaxCharacters: 8 * 1024,
    routeBudgetCharacters: 250_000,
    dailyBudgetCharacters: 500_000,
    globalDailyBudgetCharacters: 2_000_000,
    maxTargetsPerDay: 4,
    rateLimitPerMinute: 10,
    circuitFailureThreshold: 5,
    circuitOpenMs: 60_000,
    redisTimeoutMs: 3_000,
} as const;

export const TRANSLATION_CONFIG_MAXIMA = {
    sessionTtlMs: 15 * 60 * 1000,
    sessionMaxRequests: 20,
    sessionMaxCharacters: 30_000,
    routeBudgetCharacters: 1_000_000,
    dailyBudgetCharacters: 500_000,
    globalDailyBudgetCharacters: 10_000_000,
    maxTargetsPerDay: 12,
    rateLimitPerMinute: 60,
    circuitFailureThreshold: 20,
    circuitOpenMs: 15 * 60 * 1000,
    redisTimeoutMs: 10_000,
} as const;

const ENV_NAMES = {
    sessionTtlMs: 'TRANSLATION_SESSION_TTL_MS',
    sessionMaxRequests: 'TRANSLATION_SESSION_MAX_REQUESTS',
    sessionMaxCharacters: 'TRANSLATION_SESSION_MAX_CHARACTERS',
    routeBudgetCharacters: 'TRANSLATION_ROUTE_BUDGET_CHARS',
    dailyBudgetCharacters: 'TRANSLATION_DAILY_BUDGET_CHARS',
    globalDailyBudgetCharacters: 'TRANSLATION_BUDGET_CHARS',
    maxTargetsPerDay: 'TRANSLATION_MAX_TARGETS_PER_DAY',
    rateLimitPerMinute: 'TRANSLATION_RATE_LIMIT_PER_MINUTE',
    circuitFailureThreshold: 'TRANSLATION_CIRCUIT_BREAKER_THRESHOLD',
    circuitOpenMs: 'TRANSLATION_CIRCUIT_OPEN_MS',
    redisTimeoutMs: 'TRANSLATION_REDIS_TIMEOUT_MS',
} as const;

export type TranslationConfig = {
    readonly sessionSecret: string | null;
    readonly upstashUrl: string | null;
    readonly upstashToken: string | null;
    readonly sessionTtlMs: number;
    readonly sessionMaxRequests: number;
    readonly sessionMaxCharacters: number;
    readonly routeBudgetCharacters: number;
    readonly dailyBudgetCharacters: number;
    readonly globalDailyBudgetCharacters: number;
    readonly maxTargetsPerDay: number;
    readonly rateLimitPerMinute: number;
    readonly circuitFailureThreshold: number;
    readonly circuitOpenMs: number;
    readonly redisTimeoutMs: number;
    readonly sharedInfrastructureConfigured: boolean;
};

export class TranslationConfigError extends Error {
    readonly code = 'TRANSLATION_CONFIG_INVALID';
    readonly fields: readonly string[];
    constructor(fields: readonly string[]) {
        super(`Translation security configuration is invalid: ${[...new Set(fields)].join(', ')}`);
        this.name = 'TranslationConfigError';
        this.fields = [...new Set(fields)];
    }
}

function positiveBoundedInteger(
    env: NodeJS.ProcessEnv,
    key: keyof typeof ENV_NAMES,
    errors: string[]
): number {
    const name = ENV_NAMES[key];
    const raw = env[name];
    const fallback = TRANSLATION_CONFIG_DEFAULTS[key];
    if (raw === undefined || raw.trim() === '') return fallback;
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value <= 0 || value > TRANSLATION_CONFIG_MAXIMA[key]) {
        errors.push(name);
        return fallback;
    }
    return value;
}

function validateUpstashUrl(raw: string | undefined, errors: string[]): string | null {
    if (!raw?.trim()) return null;
    try {
        const url = new URL(raw.trim());
        if (url.protocol !== 'https:') throw new Error('https_required');
        return url.toString().replace(/\/$/, '');
    } catch {
        errors.push('UPSTASH_REDIS_REST_URL');
        return null;
    }
}

export function loadTranslationConfig(
    env: NodeJS.ProcessEnv = process.env,
    options: { requireProductionInfrastructure?: boolean } = {}
): TranslationConfig {
    const errors: string[] = [];
    const sessionSecret = env.TRANSLATION_SESSION_SECRET || null;
    if (sessionSecret !== null && sessionSecret.length < 32) errors.push('TRANSLATION_SESSION_SECRET');

    const upstashUrl = validateUpstashUrl(env.UPSTASH_REDIS_REST_URL, errors);
    const upstashToken = env.UPSTASH_REDIS_REST_TOKEN || null;
    if (upstashToken !== null && upstashToken.length < 16) errors.push('UPSTASH_REDIS_REST_TOKEN');
    if ((upstashUrl === null) !== (upstashToken === null)) {
        errors.push(upstashUrl === null ? 'UPSTASH_REDIS_REST_URL' : 'UPSTASH_REDIS_REST_TOKEN');
    }

    const config: TranslationConfig = {
        sessionSecret,
        upstashUrl,
        upstashToken,
        sessionTtlMs: positiveBoundedInteger(env, 'sessionTtlMs', errors),
        sessionMaxRequests: positiveBoundedInteger(env, 'sessionMaxRequests', errors),
        sessionMaxCharacters: positiveBoundedInteger(env, 'sessionMaxCharacters', errors),
        routeBudgetCharacters: positiveBoundedInteger(env, 'routeBudgetCharacters', errors),
        dailyBudgetCharacters: positiveBoundedInteger(env, 'dailyBudgetCharacters', errors),
        globalDailyBudgetCharacters: positiveBoundedInteger(env, 'globalDailyBudgetCharacters', errors),
        maxTargetsPerDay: positiveBoundedInteger(env, 'maxTargetsPerDay', errors),
        rateLimitPerMinute: positiveBoundedInteger(env, 'rateLimitPerMinute', errors),
        circuitFailureThreshold: positiveBoundedInteger(env, 'circuitFailureThreshold', errors),
        circuitOpenMs: positiveBoundedInteger(env, 'circuitOpenMs', errors),
        redisTimeoutMs: positiveBoundedInteger(env, 'redisTimeoutMs', errors),
        sharedInfrastructureConfigured: Boolean(sessionSecret && upstashUrl && upstashToken),
    };

    if (options.requireProductionInfrastructure) {
        if (!sessionSecret) errors.push('TRANSLATION_SESSION_SECRET');
        if (!upstashUrl) errors.push('UPSTASH_REDIS_REST_URL');
        if (!upstashToken) errors.push('UPSTASH_REDIS_REST_TOKEN');
    }
    if (config.sessionMaxCharacters > config.dailyBudgetCharacters) errors.push('TRANSLATION_SESSION_MAX_CHARACTERS');
    if (config.dailyBudgetCharacters > config.globalDailyBudgetCharacters) errors.push('TRANSLATION_DAILY_BUDGET_CHARS');
    if (config.routeBudgetCharacters > config.globalDailyBudgetCharacters) errors.push('TRANSLATION_ROUTE_BUDGET_CHARS');
    if (errors.length > 0) throw new TranslationConfigError(errors);
    return config;
}
