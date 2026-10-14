// tests/shared/localization.test.ts
/**
 * Localization & RTL/LTR Integration Tests
 * Tests for lib/shared/localization.ts
 */

import { describe, it, expect } from 'vitest';
import {
  pickLocalization,
  getDirection,
  isRTL,
  getOppositeLocale,
  validateI18nKeys,
  findHardcodedStrings,
  LOCALES,
  DIR_MAP,
  DEFAULT_LOCALE,
} from '@/lib/shared/localization';

describe('Localization & RTL/LTR Integration Tests', () => {
  describe('Locale Constants', () => {
    it('LOCALES contains ar and en', () => {
      expect(LOCALES).toEqual(['ar', 'en']);
    });

    it('DIR_MAP maps correctly', () => {
      expect(DIR_MAP.ar).toBe('rtl');
      expect(DIR_MAP.en).toBe('ltr');
    });

    it('DEFAULT_LOCALE is ar', () => {
      expect(DEFAULT_LOCALE).toBe('ar');
    });
  });

  describe('pickLocalization', () => {
    it('picks Arabic locale by default', () => {
      const json = {
        en: { hello: 'Hello', world: 'World' },
        ar: { hello: 'مرحبا', world: 'عالم' },
      };
      const result = pickLocalization(json);
      expect(result.dir).toBe('rtl');
      expect(result.hello).toBe('مرحبا');
      expect(result.world).toBe('عالم');
    });

    it('picks English locale when specified', () => {
      const json = {
        en: { hello: 'Hello', world: 'World' },
        ar: { hello: 'مرحبا', world: 'عالم' },
      };
      const result = pickLocalization(json, 'en');
      expect(result.dir).toBe('ltr');
      expect(result.hello).toBe('Hello');
      expect(result.world).toBe('World');
    });

    it('falls back to en when ar missing', () => {
      const json = { en: { hello: 'Hello' } };
      const result = pickLocalization(json, 'ar');
      expect(result.hello).toBe('Hello');
    });

    it('falls back to ar when en missing', () => {
      const json = { ar: { hello: 'مرحبا' } };
      const result = pickLocalization(json, 'en');
      expect(result.hello).toBe('مرحبا');
    });

    it('uses flat structure when no nested locale', () => {
      const json = { hello: 'Hello', world: 'World' };
      const result = pickLocalization(json, 'en');
      expect(result.hello).toBe('Hello');
      expect(result.dir).toBe('ltr');
    });

    it('includes dir in returned object', () => {
      const json = { en: { hello: 'Hello' }, ar: { hello: 'مرحبا' } };
      const ar = pickLocalization(json, 'ar');
      const en = pickLocalization(json, 'en');
      expect(ar.dir).toBe('rtl');
      expect(en.dir).toBe('ltr');
    });
  });

  describe('Direction Functions', () => {
    it('getDirection returns correct direction', () => {
      expect(getDirection('ar')).toBe('rtl');
      expect(getDirection('en')).toBe('ltr');
    });

    it('isRTL returns true for Arabic', () => {
      expect(isRTL('ar')).toBe(true);
      expect(isRTL('en')).toBe(false);
    });

    it('getOppositeLocale works correctly', () => {
      expect(getOppositeLocale('ar')).toBe('en');
      expect(getOppositeLocale('en')).toBe('ar');
    });
  });

  describe('validateI18nKeys', () => {
    it('detects missing keys in Arabic', () => {
      const json = {
        en: { hello: 'Hello', world: 'World', extra: 'Extra' },
        ar: { hello: 'مرحبا', world: 'عالم' },
      };
      const result = validateI18nKeys(json, ['hello', 'world', 'extra']);
      expect(result.missingInAr).toEqual(['extra']);
      expect(result.missingInEn).toEqual([]);
    });

    it('detects missing keys in English', () => {
      const json = {
        en: { hello: 'Hello', world: 'World' },
        ar: { hello: 'مرحبا', world: 'عالم', extra: 'إضافي' },
      };
      const result = validateI18nKeys(json, ['hello', 'world', 'extra']);
      expect(result.missingInAr).toEqual([]);
      expect(result.missingInEn).toEqual(['extra']);
    });

    it('returns empty arrays when all keys present', () => {
      const json = {
        en: { hello: 'Hello', world: 'World' },
        ar: { hello: 'مرحبا', world: 'عالم' },
      };
      const result = validateI18nKeys(json, ['hello', 'world']);
      expect(result.missingInAr).toEqual([]);
      expect(result.missingInEn).toEqual([]);
    });
  });

  describe('findHardcodedStrings', () => {
    it('finds hardcoded English strings', () => {
      const content = `
        const msg = "Hello World";
        const label = 'Submit';
        const path = '/api/users';
      `;
      const found = findHardcodedStrings(content);
      expect(found).toContain('Hello World');
      expect(found).toContain('Submit');
    });

    it('ignores technical strings (paths, IDs)', () => {
      const content = `
        const path = '/api/users';
        const id = 'user_123';
        const url = 'https://example.com';
      `;
      const found = findHardcodedStrings(content);
      // Should not flag technical strings
      expect(found.filter(f => f.includes('/api/') || f.includes('user_') || f.includes('http'))).toHaveLength(0);
    });

    it('finds Arabic hardcoded strings', () => {
      const content = `const msg = "مرحبا بالعالم";`;
      const found = findHardcodedStrings(content);
      expect(found).toContain('مرحبا بالعالم');
    });
  });

  describe('Language and Direction Mapping', () => {
    it('Arabic maps to RTL', () => {
      expect(DIR_MAP.ar).toBe('rtl');
      expect(getDirection('ar')).toBe('rtl');
    });

    it('English maps to LTR', () => {
      expect(DIR_MAP.en).toBe('ltr');
      expect(getDirection('en')).toBe('ltr');
    });

    it('opposite locale works', () => {
      expect(getOppositeLocale('ar')).toBe('en');
      expect(getOppositeLocale('en')).toBe('ar');
    });

    it('isRTL works correctly', () => {
      expect(isRTL('ar')).toBe(true);
      expect(isRTL('en')).toBe(false);
    });
  });
});