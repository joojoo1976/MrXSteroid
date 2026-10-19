/**
 * Tool-036 V4 — interface copy parity tests (acceptance F7.5).
 *
 * The English interface is only real if it is COMPLETE. These tests make a
 * half-translated dictionary a red build: both locales must expose exactly the
 * same keys and every entry must be a non-empty string.
 */
import { describe, it, expect } from 'vitest';
import { UI_LOCALES, dirFor, fmt } from './i18n';
import { DICT, t, type CopyKey } from './i18n-copy';

describe('tool-036-v4 UI copy (F7.5)', () => {
  it('declares exactly the two supported interface languages', () => {
    expect([...UI_LOCALES]).toEqual(['ar', 'en']);
  });

  it('Arabic and English define exactly the same keys', () => {
    expect(Object.keys(DICT.ar).sort()).toEqual(Object.keys(DICT.en).sort());
  });

  it('every entry is a non-empty string in both languages', () => {
    for (const locale of UI_LOCALES) {
      for (const [key, value] of Object.entries(DICT[locale])) {
        expect(typeof value, `${locale}.${key}`).toBe('string');
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('dirFor maps Arabic to rtl and English to ltr', () => {
    expect(dirFor('ar')).toBe('rtl');
    expect(dirFor('en')).toBe('ltr');
  });

  it('t() returns the copy for the requested locale', () => {
    expect(t('ar', 'languageName')).toBe('العربية');
    expect(t('en', 'languageName')).toBe('English');
  });

  it('fmt() interpolates {placeholders} and leaves unknown ones intact', () => {
    expect(fmt('imported {added} / {skipped}', { added: 3, skipped: 1 })).toBe('imported 3 / 1');
    expect(fmt('hello {missing}', {})).toBe('hello {missing}');
  });

  it('covers the drift status labels in both languages', () => {
    const keys: CopyKey[] = [
      'statusMatched',
      'statusLate',
      'statusMissed',
      'statusExtra',
      'statusSiteChanged',
    ];
    for (const key of keys) {
      expect(t('ar', key).length).toBeGreaterThan(0);
      expect(t('en', key).length).toBeGreaterThan(0);
    }
  });
});
