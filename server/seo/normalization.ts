/**
 * server/seo/normalization.ts
 * Normalization & Anti-Repetition Engine for English & Arabic.
 * Normalization is used STRICTLY for matching, grouping, and deduplication.
 * Original keyword text is always preserved for user-facing display.
 */

import { SeoLanguage } from './types';

/**
 * Normalize an English keyword:
 * - lowercase
 * - trim
 * - strip punctuation (except keeping single spaces)
 * - collapse multiple whitespaces
 * - strip leading/trailing non-alphanumeric characters
 */
export function normalizeEnglishKeyword(raw: string): string {
    if (!raw) return '';
    return raw
        .toLowerCase()
        .replace(/['’`]/g, '') // remove apostrophes: lifter's -> lifters
        .replace(/[^a-z0-9\s-]/g, ' ') // replace special chars with space
        .replace(/-/g, ' ') // convert hyphens to space for uniform matching
        .replace(/\s+/g, ' ') // collapse whitespaces
        .trim();
}

/**
 * Normalize an Arabic keyword:
 * - remove Tashkeel (harakat / diacritics)
 * - remove Tatweel (kashida)
 * - unify Alef forms (أ, إ, آ, ٱ -> ا)
 * - unify Alef Maqsura (ى -> ي)
 * - unify Taa Marbuta (ة -> ه) for matching only
 * - strip non-Arabic/non-alphanumeric punctuation
 * - collapse whitespaces
 */
export function normalizeArabicKeyword(raw: string): string {
    if (!raw) return '';
    return raw
        // Remove Tashkeel: Fatha, Damma, Kasra, Sukun, Shadda, Tanween, Superscript Alef
        .replace(/[\u064B-\u065F\u0670]/g, '')
        // Remove Tatweel (Kashida)
        .replace(/\u0640/g, '')
        // Normalize Alef forms: أ, إ, آ, ٱ -> ا
        .replace(/[أإآٱ]/g, 'ا')
        // Normalize Alef Maqsura to Yaa: ى -> ي
        .replace(/ى/g, 'ي')
        // Normalize Taa Marbuta to Haa: ة -> ه
        .replace(/ة/g, 'ه')
        // Replace non-Arabic & non-alphanumeric characters with space
        .replace(/[^\u0621-\u064Aa-zA-Z0-9\s]/g, ' ')
        // Remove common Arabic definite article prefix "ال" when attached to words for fuzzy duplicate check?
        // Note: We keep "ال" in normalized_keyword for DB uniqueness, but can test similarity separately.
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Universal normalizer based on language.
 */
export function normalizeKeyword(raw: string, language: SeoLanguage): string {
    if (language === 'ar') {
        return normalizeArabicKeyword(raw);
    }
    return normalizeEnglishKeyword(raw);
}

/**
 * Calculate Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;

    const matrix: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) matrix[i][0] = i;
    for (let j = 0; j <= n; j++) matrix[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return matrix[m][n];
}

/**
 * Calculate similarity ratio between 0.0 (completely different) and 1.0 (identical).
 */
export function stringSimilarity(a: string, b: string): number {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1.0;
    const dist = levenshteinDistance(a, b);
    return 1.0 - dist / maxLen;
}

/**
 * Token-based Jaccard similarity (word overlap).
 */
export function tokenJaccardSimilarity(a: string, b: string): number {
    const setA = new Set(a.split(/\s+/).filter(Boolean));
    const setB = new Set(b.split(/\s+/).filter(Boolean));
    if (setA.size === 0 && setB.size === 0) return 1.0;
    if (setA.size === 0 || setB.size === 0) return 0.0;

    let intersectionCount = 0;
    for (const token of setA) {
        if (setB.has(token)) intersectionCount++;
    }
    const unionCount = new Set([...setA, ...setB]).size;
    return intersectionCount / unionCount;
}

/**
 * Determine if two keywords are considered near-duplicates.
 * Returns true if:
 * 1. Normalized strings are identical.
 * 2. Token Jaccard similarity >= 0.85 (e.g. word order variation or 1 word difference).
 * 3. Levenshtein string similarity >= 0.88 for longer phrases.
 */
export function isDuplicateKeyword(
    kw1: string,
    kw2: string,
    language: SeoLanguage
): boolean {
    const norm1 = normalizeKeyword(kw1, language);
    const norm2 = normalizeKeyword(kw2, language);

    // Exact normalized match
    if (norm1 === norm2) return true;

    // Word overlap (e.g., "bodybuilding supplements best" vs "best bodybuilding supplements")
    const jaccard = tokenJaccardSimilarity(norm1, norm2);
    if (jaccard >= 0.85) return true;

    // Character edit distance (e.g. plural "supplements" vs "supplement")
    const similarity = stringSimilarity(norm1, norm2);
    if (similarity >= 0.88) return true;

    return false;
}
