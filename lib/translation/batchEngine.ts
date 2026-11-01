/**
 * English-only, deny-by-default DOM batch engine for T2. It collects explicitly
 * marked public surfaces, de-duplicates values, resolves cache hits, submits the
 * remaining values as bounded same-surface batches, validates ID mapping in the
 * API client, and commits DOM changes only after every batch succeeds.
 */
import {
    RUNTIME_SOURCE_LANGUAGE,
    type TranslationSurface,
} from '@/server/translation/contracts';
import { englishSourceKey, type TranslationCacheIdentity, type TranslationCache } from './cache';
import { createTranslationSession, translateBatch } from './api';
import {
    createL2Scanner,
    type L2ScanReport,
    type L2TranslateOutcome,
} from './scanner';

export type T2BatchEngineOptions = {
    readonly root: ParentNode;
    readonly target: string;
    readonly routePath: string;
    readonly cache: TranslationCache;
    readonly identity: TranslationCacheIdentity | null;
    readonly sourceLocale: string;
    readonly fetchImpl?: typeof fetch;
    readonly onIdentity?: (identity: TranslationCacheIdentity) => void;
};

export type T2BatchEngine = {
    scan(): Promise<L2ScanReport>;
    restore(): void;
    readonly changedCount: number;
};

export function createT2BatchEngine(options: T2BatchEngineOptions): T2BatchEngine {
    let activeIdentity = options.identity;
    const scanner = createL2Scanner({
        root: options.root,
        target: options.target,
        translateBatch: async (items) => {
            if (options.sourceLocale !== RUNTIME_SOURCE_LANGUAGE) {
                return { ok: false, code: 'INVALID_SOURCE_LANGUAGE', retryable: false };
            }
            const outcomes = new Map<string, L2TranslateOutcome>();
            const misses: Array<(typeof items)[number]> = [];
            for (const item of items) {
                const cached = activeIdentity
                    ? options.cache.get(englishSourceKey(options.target, item.text, activeIdentity))
                    : null;
                if (cached?.[0]) outcomes.set(item.id, { ok: true, text: cached[0], fromCache: true });
                else misses.push(item);
            }
            if (misses.length === 0) return { ok: true, outcomes };

            const surfaces = new Map<TranslationSurface, Array<(typeof items)[number]>>();
            for (const item of misses) {
                const group = surfaces.get(item.surface) ?? [];
                group.push(item);
                surfaces.set(item.surface, group);
            }
            const staged: Array<{ text: string; translated: string }> = [];
            for (const [surface, group] of surfaces) {
                const session = await createTranslationSession({ targetLanguage: options.target, surface, routePath: options.routePath }, options.fetchImpl);
                if (!session.ok) return { ok: false, code: session.error.code, retryable: session.error.retryable };
                const response = await translateBatch({
                    sourceLanguage: RUNTIME_SOURCE_LANGUAGE,
                    targetLanguage: options.target,
                    routePath: options.routePath,
                    sessionToken: session.data.token,
                    items: group.map((item) => ({ id: item.id, sourceText: item.text, surface })),
                }, options.fetchImpl);
                if (!response.ok) return { ok: false, code: response.error.code, retryable: response.error.retryable };
                if (activeIdentity && (
                    activeIdentity.engineVersion !== response.data.identity.engineVersion ||
                    activeIdentity.glossaryVersion !== response.data.identity.glossaryVersion ||
                    activeIdentity.modelIdentifier !== response.data.identity.modelIdentifier ||
                    activeIdentity.providerId !== response.data.identity.providerId
                )) {
                    return { ok: false, code: 'TRANSLATION_IDENTITY_CHANGED', retryable: true };
                }
                activeIdentity = response.data.identity;
                options.onIdentity?.(response.data.identity);
                const sourceById = new Map(group.map((item) => [item.id, item.text]));
                for (const item of response.data.items) {
                    const source = sourceById.get(item.id);
                    if (!source) return { ok: false, code: 'INVALID_BATCH_IDS', retryable: false };
                    staged.push({ text: source, translated: item.translatedText });
                    outcomes.set(item.id, { ok: true, text: item.translatedText });
                }
            }
            if (!activeIdentity) return { ok: false, code: 'MALFORMED_RESPONSE', retryable: false };
            for (const item of staged) {
                options.cache.set(englishSourceKey(options.target, item.text, activeIdentity), [item.translated]);
            }
            return { ok: true, outcomes };
        },
    });
    return scanner;
}