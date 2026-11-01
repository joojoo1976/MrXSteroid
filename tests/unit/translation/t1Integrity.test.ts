import { describe, expect, it } from 'vitest';
import {
    normalizeForTranslationCache,
    TRANSLATION_CACHE_NORMALIZATION_VERSION,
} from '../../../server/translation/normalization';
import {
    TRANSLATION_GLOSSARY_VERSION,
    glossaryTermsForTarget,
    validateTranslationGlossary,
} from '../../../server/translation/glossary';
import {
    protectTranslationValues,
    validateAndRestoreTranslation,
} from '../../../server/translation/placeholders';
import { TranslationCache, englishSourceKey, translationCacheKey } from '../../../lib/translation/cache';
import type { TranslationCacheIdentity } from '../../../lib/translation/cache';

const IDENTITY: TranslationCacheIdentity = {
    engineVersion: 'v1',
    glossaryVersion: TRANSLATION_GLOSSARY_VERSION,
    modelIdentifier: 'general/nmt',
    providerId: 'google-cloud-translation-advanced',
};

describe('T1-A · cache normalization (§60–§66)', () => {
    it('normalizes NFC, equivalent whitespace and surrounding whitespace', () => {
        expect(normalizeForTranslationCache('  Cafe\u0301\t\nWorld  ')).toBe('Café World');
        expect(TRANSLATION_CACHE_NORMALIZATION_VERSION).toBe('nfc-ws-v1');
    });

    it('gives equivalent source representations the same key', () => {
        const a = translationCacheKey(englishSourceKey('de', ' Cafe\u0301   World ', IDENTITY));
        const b = translationCacheKey(englishSourceKey('de', 'Café\tWorld', IDENTITY));
        expect(a).toBe(b);
    });

    it('preserves meaningful punctuation and words in cache identity', () => {
        const base = translationCacheKey(englishSourceKey('de', 'Hello World', IDENTITY));
        expect(translationCacheKey(englishSourceKey('de', 'Hello World?', IDENTITY))).not.toBe(base);
        expect(translationCacheKey(englishSourceKey('de', 'Hello There', IDENTITY))).not.toBe(base);
    });

    it('does not change the provider source value and retrieves through an equivalent key', () => {
        const cache = new TranslationCache();
        const stored = englishSourceKey('de', '  Hello   World! ', IDENTITY);
        cache.set(stored, ['Hallo Welt!']);
        expect(cache.get(englishSourceKey('de', 'Hello\tWorld!', IDENTITY))).toEqual(['Hallo Welt!']);
        expect(stored.sourceText).toBe('  Hello   World! ');
    });

    it('changes keys for target, glossary, engine and model versions', () => {
        const base = translationCacheKey(englishSourceKey('de', 'Hello', IDENTITY));
        expect(translationCacheKey(englishSourceKey('fr', 'Hello', IDENTITY))).not.toBe(base);
        expect(translationCacheKey(englishSourceKey('de', 'Hello', { ...IDENTITY, glossaryVersion: 'g2' }))).not.toBe(base);
        expect(translationCacheKey(englishSourceKey('de', 'Hello', { ...IDENTITY, engineVersion: 'v2' }))).not.toBe(base);
        expect(translationCacheKey(englishSourceKey('de', 'Hello', { ...IDENTITY, modelIdentifier: 'general/llm' }))).not.toBe(base);
    });
});

describe('T1-A · glossary (§67)', () => {
    it('has a non-none version and preserves controlled product names by default', () => {
        expect(TRANSLATION_GLOSSARY_VERSION).not.toBe('none');
        expect(glossaryTermsForTarget('de')).toContainEqual({ source: 'MrXSteroid', replacement: 'MrXSteroid' });
    });

    it('rejects conflicting and blank glossary sources', () => {
        expect(() => validateTranslationGlossary([{ source: 'Brand' }, { source: 'Brand' }])).toThrow(/Conflicting/);
        expect(() => validateTranslationGlossary([{ source: ' ' }])).toThrow(/blank/);
    });
});

describe('T1-A · identity-safe sentinels (§68–§87)', () => {
    const source = 'Hello {customerName}, order MX-2026-001 costs $49.99 at https://mrxsteroid.com/order/MX-2026-001.';
    const protection = protectTranslationValues(source, glossaryTermsForTarget('de'));

    it('protects and restores variables, identifiers, currency and URLs', () => {
        expect(protection.protectedText).not.toContain('{customerName}');
        expect(protection.protectedText).not.toContain('https://');
        expect(protection.values.map((value) => value.kind)).toEqual(expect.arrayContaining(['template', 'identifier', 'currency', 'url']));
        const result = validateAndRestoreTranslation(protection.protectedText, protection);
        expect(result).toEqual({ ok: true, text: source });
    });

    it('restores by token identity even when the provider reverses order', () => {
        const two = protectTranslationValues('A {first} then {second}.');
        const output = `${two.values[1].token} danach ${two.values[0].token}.`;
        expect(validateAndRestoreTranslation(output, two)).toEqual({ ok: true, text: '{second} danach {first}.' });
    });

    it('supports tokens moved across sentence boundaries and adjacent punctuation/RTL text', () => {
        const two = protectTranslationValues('Hello {name}. Code REF-2026-01!');
        const output = `مرحبًا،${two.values[1].token}! جملة أخرى: ${two.values[0].token}.`;
        expect(validateAndRestoreTranslation(output, two)).toEqual({ ok: true, text: 'مرحبًا،REF-2026-01! جملة أخرى: {name}.' });
    });

    it('keeps duplicate source values separate by identity', () => {
        const duplicate = protectTranslationValues('{first} / {second}');
        const output = `${duplicate.values[1].token} / ${duplicate.values[0].token}`;
        const restored = validateAndRestoreTranslation(output, duplicate);
        expect(restored).toEqual({ ok: true, text: '{second} / {first}' });
    });

    it.each([
        ['missing', (p: typeof protection) => p.protectedText.replace(p.values[0].token, ''), 'MISSING_TOKEN'],
        ['duplicate', (p: typeof protection) => `${p.protectedText} ${p.values[0].token}`, 'DUPLICATE_TOKEN'],
        ['unknown', (p: typeof protection) => `${p.protectedText} __MRX_TOKEN_999__`, 'UNKNOWN_TOKEN'],
        ['malformed', (p: typeof protection) => p.protectedText.replace(p.values[0].token, '__MRX_TOKEN_X__'), 'MALFORMED_TOKEN'],
    ])('rejects a %s token response', (_label, mutate, code) => {
        expect(validateAndRestoreTranslation(mutate(protection), protection)).toEqual({ ok: false, code });
    });

    it('does not leak generated sentinels after successful restoration', () => {
        const restored = validateAndRestoreTranslation(`Translated ${protection.values.map((v) => v.token).join(' ')}`, protection);
        expect(restored.ok).toBe(true);
        if (restored.ok) expect(restored.text).not.toMatch(/__MRX_TOKEN_/);
    });

    it('handles empty text, special characters and pre-existing sentinel-shaped source safely', () => {
        expect(protectTranslationValues('').values).toHaveLength(0);
        const protectedSource = protectTranslationValues('Literal __MRX_TOKEN_0__ and 50%.');
        const restored = validateAndRestoreTranslation(protectedSource.protectedText, protectedSource);
        expect(restored).toEqual({ ok: true, text: 'Literal __MRX_TOKEN_0__ and 50%.' });
    });
});
