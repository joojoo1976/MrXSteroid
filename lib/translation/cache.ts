/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  lib/translation/cache.ts — T3 integration (client side)
 *
 *  Cache for runtime machine translations produced by POST /api/translate.
 *
 *  ── Why the key is built the way it is ──────────────────────────────────────
 *  server/translation/runtime.ts (§33) and app/api/translate/route.ts both state
 *  that the caller must fold the response `identity` into its cache key so a
 *  cached entry cannot outlive the configuration that produced it. This module
 *  is that caller. The key therefore carries every dimension that can change the
 *  output:
 *
 *      source · target · engineVersion · glossaryVersion · providerId · model
 *
 *  If the provider is swapped, the model is rolled back, or the engine or
 *  glossary version is bumped, the key changes and stale entries become
 *  unreachable — they are not deleted, they are simply never looked up again.
 *
 *  Two independent guards back up the key, so a key collision cannot serve the
 *  wrong text:
 *    1. the entry stores the EXACT sourceText it was produced from, and a read
 *       is refused unless it is byte-identical to the request;
 *    2. the entry stores the identity, and a read is refused unless it still
 *       matches the identity the caller is asking under.
 *
 *  ── What this cache is NOT ──────────────────────────────────────────────────
 *  It is an optimisation only. It is client-side, it caches SUCCESSES ONLY, and
 *  every miss still goes through the route's full fail-closed gate: contract
 *  validation, provider-capability intersection, origin, rate limit and quotas.
 *  No security, locale-validation or capability check is skipped by a cache
 *  hit, because a cache hit never reaches the server at all. Capability is
 *  additionally re-checked by the caller against the verified target set before
 *  a cached entry is used.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { RUNTIME_SOURCE_LANGUAGE } from '@/server/translation/contracts';

/** House convention: `mrx:<domain>:v<N>:…`, matching mrx:tool-draft:v1 and mrx:calculate. */
export const TRANSLATION_CACHE_PREFIX = 'mrx:translate';
export const TRANSLATION_CACHE_VERSION = 1;

/** §33 — the identity a caller must fold into its cache key. */
export type TranslationCacheIdentity = {
    readonly engineVersion: string;
    readonly glossaryVersion: string;
    readonly modelIdentifier: string;
    readonly providerId: string;
};

export type TranslationCacheEntry = {
    readonly sourceText: string;
    readonly translations: readonly string[];
    readonly identity: TranslationCacheIdentity;
    readonly storedAt: number;
};

export type TranslationCacheKeyInput = {
    readonly sourceLanguage: string;
    readonly targetLanguage: string;
    readonly sourceText: string;
    readonly identity: TranslationCacheIdentity;
};

/** Default freshness for a machine translation of static page copy. */
export const TRANSLATION_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

/** Upper bound on retained entries; oldest-used is evicted first. */
export const TRANSLATION_CACHE_MAX_ENTRIES = 500;

/**
 * Key segments are sanitised because a raw `:` inside any dimension would let
 * two different configurations produce the same key. Only characters that are
 * safe inside a key segment survive; everything else collapses to a dash.
 */
function segment(value: unknown): string {
    const cleaned = String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return cleaned.length > 0 ? cleaned : 'na';
}

/** A malformed identity is a MISS, never a crash and never a poisoned entry. */
function isUsableIdentity(identity: TranslationCacheIdentity | null | undefined): boolean {
    if (!identity || typeof identity !== 'object') return false;
    return (
        typeof identity.engineVersion === 'string' &&
        typeof identity.glossaryVersion === 'string' &&
        typeof identity.modelIdentifier === 'string' &&
        typeof identity.providerId === 'string'
    );
}

/**
 * A deterministic, non-cryptographic 64-bit fingerprint of the source text.
 *
 * This is a lookup accelerator, NOT a security primitive. Correctness does not
 * depend on it: every entry also stores its exact sourceText and a read is
 * refused when that does not match, so a collision costs a cache miss and
 * nothing more.
 */
function textFingerprint(input: string): string {
    let low = 0x811c9dc5;
    let high = 0x1000193;
    for (let index = 0; index < input.length; index += 1) {
        const code = input.charCodeAt(index);
        low = Math.imul(low ^ code, 0x01000193) >>> 0;
        high = Math.imul(high ^ (code + index), 0x85ebca6b) >>> 0;
    }
    return `${low.toString(16).padStart(8, '0')}${high.toString(16).padStart(8, '0')}`;
}

/** `mrx:translate:v1:<source>:<target>:<engine>:<glossary>:<provider>:<model>:<len>:<fingerprint>` */
export function translationCacheKey(input: TranslationCacheKeyInput): string {
    const { identity } = input;
    return [
        TRANSLATION_CACHE_PREFIX,
        `v${TRANSLATION_CACHE_VERSION}`,
        segment(input.sourceLanguage),
        segment(input.targetLanguage),
        segment(identity.engineVersion),
        segment(identity.glossaryVersion),
        segment(identity.providerId),
        segment(identity.modelIdentifier),
        String(input.sourceText.length),
        textFingerprint(input.sourceText),
    ].join(':');
}

export function sameTranslationIdentity(
    a: TranslationCacheIdentity | null | undefined,
    b: TranslationCacheIdentity | null | undefined
): boolean {
    if (!a || !b) return false;
    return (
        a.engineVersion === b.engineVersion &&
        a.glossaryVersion === b.glossaryVersion &&
        a.modelIdentifier === b.modelIdentifier &&
        a.providerId === b.providerId
    );
}

export type TranslationCacheOptions = {
    readonly ttlMs?: number;
    readonly maxEntries?: number;
    /** Injected for deterministic tests. */
    readonly now?: () => number;
};

export class TranslationCache {
    private readonly entries = new Map<string, TranslationCacheEntry>();
    private readonly ttlMs: number;
    private readonly maxEntries: number;
    private readonly now: () => number;

    constructor(options: TranslationCacheOptions = {}) {
        this.ttlMs = options.ttlMs ?? TRANSLATION_CACHE_TTL_MS;
        this.maxEntries = Math.max(1, options.maxEntries ?? TRANSLATION_CACHE_MAX_ENTRIES);
        this.now = options.now ?? (() => Date.now());
    }

    /**
     * Returns a cached translation only when the entry is still fresh AND still
     * provably produced by this exact request under this exact identity.
     */
    get(input: TranslationCacheKeyInput): readonly string[] | null {
        if (!isUsableIdentity(input.identity)) return null;
        const key = translationCacheKey(input);
        const entry = this.entries.get(key);
        if (!entry) return null;

        // Refresh recency.
        this.entries.delete(key);
        this.entries.set(key, entry);

        if (this.now() - entry.storedAt > this.ttlMs) {
            this.entries.delete(key);
            return null;
        }
        // Guard 1: exact source text (defeats any fingerprint collision).
        if (entry.sourceText !== input.sourceText) return null;
        // Guard 2: identity still current.
        if (!sameTranslationIdentity(entry.identity, input.identity)) return null;
        // A copy, so a caller cannot corrupt the stored entry.
        return [...entry.translations];
    }

    set(input: TranslationCacheKeyInput, translations: readonly string[]): void {
        if (translations.length === 0) return;
        if (!isUsableIdentity(input.identity)) return;
        const key = translationCacheKey(input);
        this.entries.delete(key);
        this.entries.set(key, {
            sourceText: input.sourceText,
            translations: [...translations],
            identity: { ...input.identity },
            storedAt: this.now(),
        });
        while (this.entries.size > this.maxEntries) {
            const oldest = this.entries.keys().next();
            if (oldest.done) break;
            this.entries.delete(oldest.value);
        }
    }

    get size(): number {
        return this.entries.size;
    }

    clear(): void {
        this.entries.clear();
    }
}

/** Process-wide cache shared by the runtime translation client. */
export const runtimeTranslationCache = new TranslationCache();

/** Convenience key builder for the sole supported runtime source. */
export function englishSourceKey(
    targetLanguage: string,
    sourceText: string,
    identity: TranslationCacheIdentity
): TranslationCacheKeyInput {
    return {
        sourceLanguage: RUNTIME_SOURCE_LANGUAGE,
        targetLanguage,
        sourceText,
        identity,
    };
}
