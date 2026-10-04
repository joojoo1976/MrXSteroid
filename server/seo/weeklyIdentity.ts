/**
 * server/seo/weeklyIdentity.ts
 * THE canonical weekly-history identity (Phase 1C, DEFECT 1).
 *
 * WHY THIS FILE EXISTS
 * -------------------
 * Phase 1A proved that the COMPARE_WITH_HISTORY stage could never observe
 * history. The writer and the reader built different keys:
 *
 *   writer  refreshRuntime.ts  previousScores.set(`${market}::${keyword}`)   (raw text!)
 *   reader  weeklyEngine.ts    previousScores.get(keyword.normalizedKeyword) (no market!)
 *
 * Two independent faults:
 *   1. SHAPE  — the writer prefixed the market, the reader did not.
 *   2. SOURCE — the writer used `row.keyword` (display text) where the reader
 *      used `normalizedKeyword`. Even with the prefix aligned, "FFMI Calculator"
 *      and "ffmi calculator" would still miss each other, because the display
 *      text is not the identity.
 *
 * Both are fixed HERE, once, so the writer and the reader cannot drift apart
 * again. Nothing in this file talks to a database, a network, or `Date`.
 *
 * THE CONTRACT
 * ------------
 * One keyword's weekly identity is (market, language, normalized keyword) —
 * never a bare keyword. `marketIdentityKey` (snapshotDiff.ts) already encoded
 * `${market}::${normalized}`; it additionally takes the raw keyword and runs
 * the language-aware normaliser itself. That is the right rule and this module
 * is the single entry point for it, so a future reader cannot accidentally
 * re-derive a different one.
 *
 * LANGUAGE IS PART OF THE KEY, NOT JUST THE NORMALISER
 * -----------------------------------------------------
 * Arabic normalisation strips Tashkeel and unifies Alef/Taa Marbuta; English
 * normalisation does not. Threading the language through the KEY — not merely
 * through the normaliser — means a row whose language column is wrong cannot
 * silently inherit another language's history.
 */

import type { Market, SourceLanguage } from './sources/types';
import { normalizeKeyword } from './normalization';
import { isSupportedMarket, languageOf } from './snapshotDiff';

/**
 * Build the canonical weekly-history key.
 *
 * Format: `${market}::${normalized}` — identical to `marketIdentityKey`, which
 * is the format `diffWeeklyStates` already consumes, so the weekly engine and
 * the snapshot diff now agree on ONE identity instead of two.
 *
 * `market` is validated rather than trusted. A row whose market is missing or
 * not one of the seven supported markets resolves to `null`, and the caller
 * then records NO history for it. Defaulting to a country would invent an
 * identity and merge unrelated markets — the exact defect this system is
 * built to avoid (marketIdentity.ts:5-11).
 *
 * Returns null when the identity cannot be established honestly.
 */
export function buildWeeklyHistoryKey(
    market: Market | string | null | undefined,
    normalizedKeyword: string | null | undefined
): string | null {
    const resolvedMarket = String(market ?? '').trim();
    if (!isSupportedMarket(resolvedMarket)) return null;

    const normalized = String(normalizedKeyword ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (!normalized) return null;

    return `${resolvedMarket}::${normalized}`;
}

/**
 * The same key, derived from a raw display keyword plus its language.
 *
 * Used by any caller that holds `keyword` text rather than a pre-normalized
 * column, so the display text can never become the identity.
 */
export function buildWeeklyHistoryKeyFromText(
    market: Market | string | null | undefined,
    keyword: string | null | undefined,
    language: SourceLanguage
): string | null {
    const normalized = normalizeKeyword(String(keyword ?? ''), language);
    return buildWeeklyHistoryKey(market, normalized);
}

/**
 * Resolve the language a market belongs to.
 *
 * Re-exported through a single name so callers building a weekly key never
 * re-implement the `ar-` / `en-` prefix rule in a second place.
 */
export { languageOf as weeklyLanguageOf };