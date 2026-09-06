import { describe, it, expect } from 'vitest';
import {
    normalizeLang,
    languageForCountry,
    unitForCountry,
    unitForLanguage,
    localeForLanguage,
    pickAcceptLanguage,
    ARAB_COUNTRIES,
    IMPERIAL_COUNTRIES,
} from './localeMap';

describe('normalizeLang', () => {
    it('maps supported base tags case-insensitively', () => {
        expect(normalizeLang('ar')).toBe('ar');
        expect(normalizeLang('AR-EG')).toBe('ar');
        expect(normalizeLang('en-US')).toBe('en');
        expect(normalizeLang('  ' as string)).toBeNull();
    });

    it('returns null for unsupported or empty', () => {
        expect(normalizeLang('de')).toBeNull();
        expect(normalizeLang('zh')).toBeNull();
        expect(normalizeLang(null)).toBeNull();
        expect(normalizeLang(undefined)).toBeNull();
    });
});

describe('languageForCountry', () => {
    it('returns Arabic for every Arab League country', () => {
        for (const cc of ARAB_COUNTRIES) {
            expect(languageForCountry(cc)).toBe('ar');
        }
    });

    it('falls back to English for unsupported-language countries', () => {
        expect(languageForCountry('DE')).toBe('en');
        expect(languageForCountry('CN')).toBe('en');
        expect(languageForCountry('FR')).toBe('en');
        expect(languageForCountry(null)).toBe('en');
    });

    it('is case-insensitive on the country code', () => {
        expect(languageForCountry('eg')).toBe('ar');
        expect(languageForCountry('sa')).toBe('ar');
    });
});

describe('unitForCountry', () => {
    it('imperial for the imperial/hybrid set', () => {
        for (const cc of IMPERIAL_COUNTRIES) {
            expect(unitForCountry(cc)).toBe('imperial');
        }
    });

    it('metric for the rest of the world', () => {
        expect(unitForCountry('DE')).toBe('metric');
        expect(unitForCountry('EG')).toBe('metric');
        expect(unitForCountry('SA')).toBe('metric');
        expect(unitForCountry(null)).toBe('metric');
    });
});

describe('unitForLanguage', () => {
    it('Arabic → metric, English → imperial', () => {
        expect(unitForLanguage('ar')).toBe('metric');
        expect(unitForLanguage('en')).toBe('imperial');
    });
});

describe('localeForLanguage', () => {
    it('returns BCP-47 tags', () => {
        expect(localeForLanguage('ar')).toBe('ar-EG');
        expect(localeForLanguage('en')).toBe('en-US');
    });
});

describe('pickAcceptLanguage', () => {
    it('honours q-value ordering', () => {
        expect(pickAcceptLanguage('de;q=0.9,ar;q=0.95,en;q=0.5')).toBe('ar');
        expect(pickAcceptLanguage('de,en;q=0.9,fr;q=0.8')).toBe('en');
    });

    it('ignores wildcard and unsupported-only headers', () => {
        expect(pickAcceptLanguage('*')).toBeNull();
        expect(pickAcceptLanguage('de,fr,es')).toBeNull();
        expect(pickAcceptLanguage(null)).toBeNull();
    });

    it('picks Arabic when it is the top supported preference', () => {
        expect(pickAcceptLanguage('ar-EG,ar;q=0.9,en;q=0.8')).toBe('ar');
    });
});
