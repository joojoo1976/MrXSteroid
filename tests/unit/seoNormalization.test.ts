/**
 * tests/unit/seoNormalization.test.ts
 * Unit tests for SEO Normalization, Anti-Repetition & Baseline Integrity.
 */

import { describe, it, expect } from 'vitest';
import {
    normalizeEnglishKeyword,
    normalizeArabicKeyword,
    normalizeKeyword,
    levenshteinDistance,
    stringSimilarity,
    tokenJaccardSimilarity,
    isDuplicateKeyword,
} from '../../server/seo/normalization';
import { getBaselineKeywords } from '../../server/seo/baselineKeywords';

describe('SEO Normalization — English', () => {
    it('lowercases and trims whitespace', () => {
        expect(normalizeEnglishKeyword('  Best Bodybuilding Supplements  ')).toBe('best bodybuilding supplements');
    });

    it('strips apostrophes and handles plural possessives', () => {
        expect(normalizeEnglishKeyword("Lifter's Guide to Macro's")).toBe('lifters guide to macros');
        expect(normalizeEnglishKeyword('Beginner’s Steroid Cycle')).toBe('beginners steroid cycle');
    });

    it('converts hyphens and multiple punctuation to single spaces', () => {
        expect(normalizeEnglishKeyword('Post-Cycle-Therapy (PCT) Guide!')).toBe('post cycle therapy pct guide');
    });

    it('collapses multiple spaces into a single space', () => {
        expect(normalizeEnglishKeyword('macro    calculator   for   bodybuilding')).toBe('macro calculator for bodybuilding');
    });

    it('returns empty string for empty input', () => {
        expect(normalizeEnglishKeyword('')).toBe('');
    });
});

describe('SEO Normalization — Arabic', () => {
    it('removes full Tashkeel (harakat / tanween)', () => {
        const withTashkeel = 'أَفْضَلُ مُكَمِّلَاتِ كَمَالِ الأَجْسَامِ';
        const expected = 'افضل مكملات كمال الاجسام';
        expect(normalizeArabicKeyword(withTashkeel)).toBe(expected);
    });

    it('removes Tatweel (Kashida)', () => {
        expect(normalizeArabicKeyword('كـــمـــال الأجـــســـام')).toBe('كمال الاجسام');
    });

    it('normalizes all forms of Alef (أ, إ, آ, ٱ -> ا)', () => {
        expect(normalizeArabicKeyword('إدارة أمان الهرمونات و آثاره')).toBe('اداره امان الهرمونات و اثاره');
    });

    it('normalizes Alef Maqsura to Yaa (ى -> ي)', () => {
        expect(normalizeArabicKeyword('مستشفي الرعاية القصوى')).toBe('مستشفي الرعايه القصوي');
    });

    it('normalizes Taa Marbuta to Haa for matching (ة -> ه)', () => {
        expect(normalizeArabicKeyword('خريطة الحقن الآمنة')).toBe('خريطه الحقن الامنه');
    });

    it('removes punctuation and symbols while preserving Arabic words', () => {
        expect(normalizeArabicKeyword('دليل التضخيم 100% [مجاني!]')).toBe('دليل التضخيم 100 مجاني');
    });
});

describe('Anti-Repetition & Duplicate Detection', () => {
    it('detects exact normalized matches with case differences', () => {
        expect(isDuplicateKeyword('Steroid Half Life', 'steroid half-life', 'en')).toBe(true);
    });

    it('detects near-duplicates with word order differences', () => {
        expect(isDuplicateKeyword('macro calculator bodybuilding', 'bodybuilding macro calculator', 'en')).toBe(true);
    });

    it('detects Arabic duplicates with and without diacritics / Alef variations', () => {
        expect(isDuplicateKeyword('أفضل مكملات', 'افضل مكملات', 'ar')).toBe(true);
        expect(isDuplicateKeyword('حاسبة نسبة الدهون', 'حاسبه نسبه الدهون', 'ar')).toBe(true);
    });

    it('does NOT flag distinctly different keywords as duplicates', () => {
        expect(isDuplicateKeyword('bulking diet protocol', 'cutting fat loss protocol', 'en')).toBe(false);
        expect(isDuplicateKeyword('حاسبة نسبة الدهون', 'خريطة مواقع الحقن', 'ar')).toBe(false);
    });

    it('calculates string similarity accurately', () => {
        expect(stringSimilarity('test', 'test')).toBe(1.0);
        expect(stringSimilarity('test', 'best')).toBe(0.75);
        expect(stringSimilarity('', '')).toBe(1.0);
    });

    it('calculates token Jaccard similarity accurately', () => {
        expect(tokenJaccardSimilarity('alpha beta', 'beta alpha')).toBe(1.0);
        expect(tokenJaccardSimilarity('alpha beta gamma', 'alpha beta')).toBe(2 / 3);
        expect(tokenJaccardSimilarity('alpha', 'omega')).toBe(0.0);
    });
});

describe('Curated Baseline Seeds Integrity', () => {
    const enSeeds = getBaselineKeywords('en');
    const arSeeds = getBaselineKeywords('ar');

    it('provides minimum required baseline seeds for English (>= 50 in seed set)', () => {
        expect(enSeeds.length).toBeGreaterThanOrEqual(50);
    });

    it('provides minimum required baseline seeds for Arabic (>= 50 in seed set)', () => {
        expect(arSeeds.length).toBeGreaterThanOrEqual(50);
    });

    it('all seeds have non-empty originalKeyword and valid normalizedKeyword', () => {
        for (const kw of [...enSeeds, ...arSeeds]) {
            expect(kw.originalKeyword.trim().length).toBeGreaterThan(3);
            expect(kw.normalizedKeyword.trim().length).toBeGreaterThan(3);
            expect(kw.score).toBeGreaterThanOrEqual(0);
            expect(kw.score).toBeLessThanOrEqual(100);
        }
    });

    it('all seeds have valid site destination paths starting with /', () => {
        for (const kw of [...enSeeds, ...arSeeds]) {
            expect(kw.destinationPath).toMatch(/^\/[a-zA-Z0-9_-]*$/);
        }
    });

    it('no duplicate normalized keywords exist within the same language', () => {
        const enSet = new Set<string>();
        for (const kw of enSeeds) {
            expect(enSet.has(kw.normalizedKeyword)).toBe(false);
            enSet.add(kw.normalizedKeyword);
        }

        const arSet = new Set<string>();
        for (const kw of arSeeds) {
            expect(arSet.has(kw.normalizedKeyword)).toBe(false);
            arSet.add(kw.normalizedKeyword);
        }
    });

    it('English and Arabic keywords are strictly separated (no foreign scripts)', () => {
        const arabicRegex = /[\u0600-\u06FF]/;
        for (const kw of enSeeds) {
            expect(arabicRegex.test(kw.originalKeyword)).toBe(false);
        }
        for (const kw of arSeeds) {
            expect(arabicRegex.test(kw.originalKeyword)).toBe(true);
        }
    });
});
