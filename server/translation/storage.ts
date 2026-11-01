import { Redis } from '@upstash/redis';

/** Stable, non-sensitive error used whenever shared translation storage fails. */
export class TranslationStorageUnavailableError extends Error {
    readonly code = 'TRANSLATION_STORAGE_UNAVAILABLE';

    constructor() {
        super('Shared translation storage is unavailable.');
        this.name = 'TranslationStorageUnavailableError';
    }
}

/**
 * Bounds every shared-storage operation. The underlying Upstash client also
 * receives an AbortSignal, but this guard keeps injected/test adapters subject
 * to the same fail-closed deadline.
 */
export async function withTranslationStorageTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        return await Promise.race([
            operation(),
            new Promise<T>((_resolve, reject) => {
                timer = setTimeout(() => reject(new TranslationStorageUnavailableError()), timeoutMs);
            }),
        ]);
    } finally {
        if (timer !== undefined) clearTimeout(timer);
    }
}

/** Creates the one existing Upstash REST adapter with a per-request deadline. */
export function createTranslationRedis(config: {
    readonly upstashUrl: string;
    readonly upstashToken: string;
    readonly redisTimeoutMs: number;
}): Redis {
    return new Redis({
        url: config.upstashUrl,
        token: config.upstashToken,
        signal: () => AbortSignal.timeout(config.redisTimeoutMs),
    });
}