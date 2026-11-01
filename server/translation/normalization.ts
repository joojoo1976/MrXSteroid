/**
 * Cache-identity normalization for public runtime translation (§60–§66).
 *
 * This function is deliberately NOT used as provider input. It only removes
 * representational differences that do not change the source meaning:
 * Unicode canonically-equivalent forms, equivalent whitespace runs, and
 * surrounding whitespace. Punctuation and letter case remain significant.
 */
export const TRANSLATION_CACHE_NORMALIZATION_VERSION = 'nfc-ws-v1';

/** Unicode White_Space code points, collapsed for cache identity only. */
const EQUIVALENT_WHITESPACE = /\p{White_Space}+/gu;

export function normalizeForTranslationCache(text: string): string {
    return text.normalize('NFC').replace(EQUIVALENT_WHITESPACE, ' ').trim();
}
