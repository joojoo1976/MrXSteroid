/**
 * server/seo/marketIdentity.ts
 * The market-aware keyword identity (prompt §80, §81, §24).
 *
 * WHY THIS EXISTS
 * ---------------
 * Production `seo_keywords` is currently UNIQUE (language, normalized_keyword).
 * That key has no market, so "half life" measured in en-US and the same term
 * measured in en-GB CANNOT both exist — the second write collides. Markets do
 * not share demand curves, dialects or competitor sets, so merging them is a
 * correctness bug, not just a storage detail.
 *
 * WHAT THIS MODULE DOES AND DOES NOT DO
 * -------------------------------------
 * It provides the identity used by the CODE so that same-term/different-market
 * is expressible and testable. It deliberately does NOT change any Production
 * constraint: the widening of the real unique key is BLOCKED behind the
 * read-only backfill/collision gates in
 * supabase/migrations/20260930130000_seo_keyword_weekly_states.sql.
 *
 * The key is a stable, human-readable composite so it can be printed in an
 * audit log, compared in a test, and later matched against a DB unique index
 * without ambiguity.
 */

import type { Market, SourceLanguage } from './sources/types';

/** The three fields that together identify one keyword in one market. */
export interface MarketIdentity {
    language: SourceLanguage;
    market: Market;
    normalizedKeyword: string;
}

/**
 * Normalize a keyword for identity purposes.
 *
 * Defensive on purpose: the DB column is already normalized, but an identity
 * computed from a value that skipped normalization would fork one keyword into
 * two rows. Trimming and lowercasing here makes the key total.
 */
function canonical(normalizedKeyword: string): string {
    return String(normalizedKeyword ?? '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Build the market-aware identity key.
 *
 * Format: `language|market|normalized_keyword`. The separator is a literal `|`,
 * which cannot appear in a normalized keyword (normalization strips it), so the
 * key is unambiguous and cannot be forged by joining fields together.
 */
export function buildIdentityKey(identity: MarketIdentity): string {
    return `${identity.language}|${identity.market}|${canonical(identity.normalizedKeyword)}`;
}

/**
 * True when two keys describe the same keyword in the same market.
 *
 * This is the single predicate that encodes the contract: same language, same
 * market, same normalized keyword => ONE identity. Any difference in market or
 * language makes them distinct, which is what allows the same term to be tracked
 * independently per market.
 */
export function sameMarketIdentity(a: string, b: string): boolean {
    return buildIdentityKeyFromKey(a) === buildIdentityKeyFromKey(b);
}

/**
 * Parse a key back into its parts, re-canonicalizing so that a key built by an
 * older, looser writer still compares equal to one built here.
 */
function buildIdentityKeyFromKey(key: string): string {
    const parts = String(key ?? '').split('|');
    if (parts.length < 3) return String(key ?? '');
    const [language, market, ...rest] = parts;
    return buildIdentityKey({
        language: language as SourceLanguage,
        market: market as Market,
        normalizedKeyword: rest.join('|'),
    });
}

/**
 * Deduplicate a list of keyword rows by market-aware identity.
 *
 * The LAST occurrence wins, matching the existing upsert semantics where the
 * newest observation for a (language, market, keyword) is the live one. Order
 * of the surviving rows is preserved so callers keep a stable result.
 */
export function dedupeByMarketIdentity<T>(
    rows: readonly T[],
    identityOf: (row: T) => MarketIdentity
): T[] {
    const lastIndex = new Map<string, number>();
    rows.forEach((row, index) => {
        lastIndex.set(buildIdentityKey(identityOf(row)), index);
    });
    return rows.filter((_row, index) => lastIndex.get(buildIdentityKey(identityOf(_row))) === index);
}
