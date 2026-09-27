import { describe, it, expect, beforeEach } from 'vitest';
import {
    TRANSLATION_CACHE_PREFIX,
    TRANSLATION_CACHE_VERSION,
    TranslationCache,
    englishSourceKey,
    sameTranslationIdentity,
    translationCacheKey,
    type TranslationCacheIdentity,
} from './cache';

const IDENTITY: TranslationCacheIdentity = {
    engineVersion: 'v1',
    glossaryVersion: 'none',
    modelIdentifier: 'projects/p/locations/global/models/general/nmt',
    providerId: 'google-advanced-v3',
};

const OTHER_MODEL: TranslationCacheIdentity = { ...IDENTITY, modelIdentifier: 'projects/p/locations/global/models/general/llm' };

describe('T3 · cache · §33 key dimensions', () => {
    it('follows the mrx:<domain>:v<N> house convention', () => {
        const key = translationCacheKey(
            englishSourceKey('fr', 'Get started', IDENTITY)
        );
        expect(key.startsWith(`${TRANSLATION_CACHE_PREFIX}:v${TRANSLATION_CACHE_VERSION}:`)).toBe(true);
    });

    it('always embeds the source language', () => {
        const key = translationCacheKey({
            sourceLanguage: 'en',
            targetLanguage: 'fr',
            sourceText: 'Get started',
            identity: IDENTITY,
        });
        expect(key).toContain(':en:');
    });

    it.each([
        ['targetLanguage', { targetLanguage: 'de' }],
        ['sourceLanguage', { sourceLanguage: 'en-US' }],
        ['engineVersion', { identity: { ...IDENTITY, engineVersion: 'v2' } }],
        ['glossaryVersion', { identity: { ...IDENTITY, glossaryVersion: 'g7' } }],
        ['modelIdentifier', { identity: OTHER_MODEL }],
        ['providerId', { identity: { ...IDENTITY, providerId: 'deepl' } }],
        ['sourceText', { sourceText: 'Something else entirely' }],
    ])('a change in %s produces a different key', (_label, override) => {
        const base = translationCacheKey(englishSourceKey('fr', 'Get started', IDENTITY));
        const changed = translationCacheKey({
            ...englishSourceKey('fr', 'Get started', IDENTITY),
            ...override,
        } as Parameters<typeof translationCacheKey>[0]);
        expect(changed).not.toBe(base);
    });

    it('is stable for identical input', () => {
        expect(translationCacheKey(englishSourceKey('fr', 'Get started', IDENTITY))).toBe(
            translationCacheKey(englishSourceKey('fr', 'Get started', IDENTITY))
        );
    });

    it('cannot be forged into a collision by separators inside a dimension', () => {
        // A model id containing ':' must not be able to imitate another key.
        const a = translationCacheKey(englishSourceKey('fr', 'Get started', { ...IDENTITY, modelIdentifier: 'a:b' }));
        const b = translationCacheKey(englishSourceKey('fr', 'Get started', { ...IDENTITY, modelIdentifier: 'b:a' }));
        expect(a).not.toBe(b);
    });

    it('normalizes case and whitespace in dimensions', () => {
        const messy = translationCacheKey({
            sourceLanguage: ' EN ',
            targetLanguage: ' FR ',
            sourceText: 'Get started',
            identity: { ...IDENTITY, providerId: ' Google-Advanced-V3 ' },
        });
        const tidy = translationCacheKey(englishSourceKey('fr', 'Get started', IDENTITY));
        expect(messy).toBe(tidy);
    });
});

describe('T3 · cache · read/write guards', () => {
    let cache: TranslationCache;
    const key = () => englishSourceKey('fr', 'Get started', IDENTITY);

    beforeEach(() => {
        cache = new TranslationCache();
    });

    it('round-trips a translation', () => {
        cache.set(key(), ['Commencez']);
        expect(cache.get(key())).toEqual(['Commencez']);
    });

    it('misses when nothing is stored', () => {
        expect(cache.get(key())).toBeNull();
    });

    it('refuses an entry produced under a different identity', () => {
        cache.set(key(), ['Commencez']);
        expect(cache.get(englishSourceKey('fr', 'Get started', OTHER_MODEL))).toBeNull();
    });

    it('refuses an entry when the source text differs', () => {
        cache.set(key(), ['Commencez']);
        expect(cache.get(englishSourceKey('fr', 'Get started!', IDENTITY))).toBeNull();
    });

    it('refuses an entry when the target differs', () => {
        cache.set(key(), ['Commencez']);
        expect(cache.get(englishSourceKey('de', 'Get started', IDENTITY))).toBeNull();
    });

    it('refuses a read with no identity at all', () => {
        cache.set(key(), ['Commencez']);
        expect(cache.get({ ...key(), identity: undefined as unknown as TranslationCacheIdentity })).toBeNull();
    });

    it('never stores an empty translation', () => {
        cache.set(key(), []);
        expect(cache.get(key())).toBeNull();
    });

    it('returns a copy that cannot mutate the stored value', () => {
        cache.set(key(), ['Commencez']);
        const first = cache.get(key()) as string[];
        first[0] = 'hacked';
        expect(cache.get(key())).toEqual(['Commencez']);
    });
});

describe('T3 · cache · freshness and bounds', () => {
    it('expires entries past the TTL', () => {
        let now = 1_000;
        const cache = new TranslationCache({ ttlMs: 100, now: () => now });
        const key = englishSourceKey('fr', 'Get started', IDENTITY);
        cache.set(key, ['Commencez']);
        expect(cache.get(key)).toEqual(['Commencez']);
        now += 101;
        expect(cache.get(key)).toBeNull();
    });

    it('evicts least-recently-used entries past the cap', () => {
        const cache = new TranslationCache({ maxEntries: 2 });
        cache.set(englishSourceKey('fr', 'one', IDENTITY), ['un']);
        cache.set(englishSourceKey('fr', 'two', IDENTITY), ['deux']);
        // Touch 'one' so 'two' becomes the least recently used.
        cache.get(englishSourceKey('fr', 'one', IDENTITY));
        cache.set(englishSourceKey('fr', 'three', IDENTITY), ['trois']);

        expect(cache.size).toBe(2);
        expect(cache.get(englishSourceKey('fr', 'two', IDENTITY))).toBeNull();
        expect(cache.get(englishSourceKey('fr', 'one', IDENTITY))).toEqual(['un']);
        expect(cache.get(englishSourceKey('fr', 'three', IDENTITY))).toEqual(['trois']);
    });

    it('clear() empties the cache', () => {
        const cache = new TranslationCache();
        cache.set(englishSourceKey('fr', 'Get started', IDENTITY), ['Commencez']);
        cache.clear();
        expect(cache.size).toBe(0);
    });
});

describe('T3 · cache · identity comparison', () => {
    it('requires every dimension to match', () => {
        expect(sameTranslationIdentity(IDENTITY, { ...IDENTITY })).toBe(true);
        expect(sameTranslationIdentity(IDENTITY, OTHER_MODEL)).toBe(false);
        expect(sameTranslationIdentity(IDENTITY, { ...IDENTITY, glossaryVersion: 'g1' })).toBe(false);
        expect(sameTranslationIdentity(IDENTITY, { ...IDENTITY, providerId: 'deepl' })).toBe(false);
        expect(sameTranslationIdentity(IDENTITY, { ...IDENTITY, engineVersion: 'v2' })).toBe(false);
    });

    it('treats a missing identity as unequal', () => {
        expect(sameTranslationIdentity(null, IDENTITY)).toBe(false);
        expect(sameTranslationIdentity(IDENTITY, undefined)).toBe(false);
        expect(sameTranslationIdentity(null, null)).toBe(false);
    });
});
