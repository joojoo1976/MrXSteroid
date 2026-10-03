/**
 * server/seo/snapshotDiff.ts
 * STEP 13 — historical week-over-week diff, and STEP 14 market identity.
 *
 * WHY THIS EXISTS
 * ---------------
 * Before this file the system's notion of "trend" was `determineTrendStatus`,
 * which judges ONE keyword in isolation from its own first/last-seen dates. That
 * cannot answer "did this change since last week?", which is the question the
 * prompt's Definition of Done actually asks. Historical comparison is therefore
 * the PRIMARY signal, and `determineTrendStatus` is used only as a fallback when
 * no prior state exists.
 *
 * MARKET IDENTITY (§23, §24)
 * --------------------------
 * A keyword's operational identity is (language, market, normalized_keyword),
 * NOT (language, normalized_keyword). `ar` and `ar-EG` and `ar-SA` are different
 * markets with different demand, dialect and competitor sets, and collapsing
 * them silently merges distinct rows.
 *
 * IMPORTANT CONSTRAINT: the production unique constraint is
 * UNIQUE(language, normalized_keyword). This module therefore REPORTS collisions
 * rather than changing that constraint — a constraint change needs Production
 * data we do not have, and is BLOCKED for exactly that reason (§81).
 */

import type { Market, SourceLanguage } from './sources/types';
import { normalizeKeyword } from './normalization';
import { determineTrendStatus } from './scoringEngine';

/* ------------------------------------------------------------------ */
/* Markets                                                             */
/* ------------------------------------------------------------------ */

/** The seven markets the system operates in. */
export const MARKETS: readonly Market[] = [
    'ar-EG',
    'ar-SA',
    'ar-AE',
    'en-US',
    'en-GB',
    'en-CA',
    'en-AU',
] as const;

/** The language a market belongs to. ar-* / en-*. */
export function languageOf(market: Market): SourceLanguage {
    return market.startsWith('ar-') ? 'ar' : 'en';
}

/** True when `value` is one of the seven supported markets. */
export function isSupportedMarket(value: string): value is Market {
    return (MARKETS as readonly string[]).includes(value);
}

/**
 * The operational identity of a keyword within a market.
 *
 * `ar` is NOT a market here: a caller passing the bare language must be told so
 * rather than silently mapped onto one arbitrary country (§24).
 */
export function resolveMarketKey(language: SourceLanguage, market?: string | null): Market | null {
    if (!market) return null;
    if (market === language) {
        // Deliberately null, not a default: 'ar' cannot be resolved to 'ar-EG'
        // without inventing a market.
        return null;
    }
    return isSupportedMarket(market) ? market : null;
}

/**
 * Build the dedup / uniqueness key for a keyword within a market.
 * Returns null when the market cannot be resolved honestly.
 */
export function marketIdentityKey(
    keyword: string,
    language: SourceLanguage,
    market?: string | null
): string | null {
    const resolved = resolveMarketKey(language, market);
    if (!resolved) return null;
    // The language MUST be passed through: normalizeKeyword branches on it, and
    // omitting it would run the Arabic normaliser over English text (or the
    // reverse), silently producing a wrong or empty key.
    const normalized = normalizeKeyword(keyword, language);
    if (!normalized) return null;
    return `${resolved}::${normalized}`;
}

/* ------------------------------------------------------------------ */
/* Weekly states                                                       */
/* ------------------------------------------------------------------ */

/** One keyword's recorded state for one ISO week. */
export interface WeeklyState {
    keyword_id?: string;
    keyword: string;
    language: SourceLanguage;
    market: Market;
    year: number;
    week: number;
    /** Real score, or null when nothing could be scored. */
    score: number | null;
    /** Real rank/position, or null. Never derived from a score. */
    rank: number | null;
    destination_path?: string | null;
    /** The trend label carried on the record, or null. */
    trend_status?: string | null;
}

/** The nine diff outcomes the prompt requires. */
export type DiffState =
    | 'NEW'
    | 'RISING'
    | 'FALLING'
    | 'STABLE'
    | 'LOST'
    | 'REACTIVATED'
    | 'NEW_GAP'
    | 'CLOSED_GAP'
    | 'NEEDS_REVIEW';

/** Threshold for calling a score movement a real trend rather than noise. */
const RISE_THRESHOLD = 1;
const FALL_THRESHOLD = 1;

/**
 * Compare this week's states against last week's.
 *
 * Rules, stated explicitly so they can be tested:
 *   - present now, absent before          -> NEW
 *   - present before, absent now          -> LOST
 *   - absent before, absent now           -> (not emitted)
 *   - score up by more than the threshold -> RISING
 *   - score down by more than threshold   -> FALLING
 *   - otherwise                          -> STABLE
 *   - either score is null                -> NEEDS_REVIEW (never guessed)
 */
export function diffWeeklyStates(
    current: readonly WeeklyState[],
    previous: readonly WeeklyState[]
): Array<{ state: DiffState; current: WeeklyState | null; previous: WeeklyState | null }> {
    const keyOf = (s: WeeklyState) => marketIdentityKey(s.keyword, s.language, s.market);
    const prevMap = new Map<string, WeeklyState>();
    for (const s of previous) {
        const k = keyOf(s);
        if (k) prevMap.set(k, s);
    }
    const currMap = new Map<string, WeeklyState>();
    for (const s of current) {
        const k = keyOf(s);
        if (k) currMap.set(k, s);
    }

    const out: Array<{ state: DiffState; current: WeeklyState | null; previous: WeeklyState | null }> = [];

    for (const [key, cur] of currMap) {
        const prev = prevMap.get(key);
        if (!prev) {
            out.push({ state: 'NEW', current: cur, previous: null });
            continue;
        }
        if (cur.score == null || prev.score == null) {
            // A missing score is missing EVIDENCE, not "no change".
            out.push({ state: 'NEEDS_REVIEW', current: cur, previous: prev });
            continue;
        }
        const delta = cur.score - prev.score;
        if (delta > RISE_THRESHOLD) out.push({ state: 'RISING', current: cur, previous: prev });
        else if (delta < -FALL_THRESHOLD) out.push({ state: 'FALLING', current: cur, previous: prev });
        else out.push({ state: 'STABLE', current: cur, previous: prev });
    }

    for (const [key, prev] of prevMap) {
        if (!currMap.has(key)) {
            out.push({ state: 'LOST', current: null, previous: prev });
        }
    }

    return out;
}

/**
 * A keyword that vanished and came back is REACTIVATED, not merely RISING.
 * Applied as a post-pass over the raw diff so the caller can see the cause.
 */
export function markReactivated(
    diff: ReadonlyArray<{ state: DiffState; current: WeeklyState | null; previous: WeeklyState | null }>,
    history: readonly WeeklyState[]
): Array<{ state: DiffState; current: WeeklyState | null; previous: WeeklyState | null }> {
    const seenKeys = new Set(
        history
            .map((s) => marketIdentityKey(s.keyword, s.language, s.market))
            .filter((k): k is string => Boolean(k))
    );
    return diff.map((row) => {
        if (row.state !== 'NEW' || !row.current) return row;
        const key = marketIdentityKey(row.current.keyword, row.current.language, row.current.market);
        if (key && seenKeys.has(key)) {
            return { ...row, state: 'REACTIVATED' as DiffState };
        }
        return row;
    });
}

/**
 * Fallback trend determination for a keyword with NO history.
 *
 * Delegates to the existing, untouched `determineTrendStatus` rather than
 * reimplementing it, and forwards the EXACT parameter shape that function
 * declares. This is deliberately the fallback, not the primary path: the
 * historical diff above is what answers "what changed since last week?".
 */
export function trendStatusFallback(params: Parameters<typeof determineTrendStatus>[0]): string {
    return determineTrendStatus(params);
}

/* ------------------------------------------------------------------ */
/* Collision reporting (§81)                                           */
/* ------------------------------------------------------------------ */

export interface MarketCollision {
    market: Market;
    normalizedKeyword: string;
    /** The distinct keyword spellings that collapse onto one identity. */
    spellings: string[];
}

/**
 * REPORT market collisions. It does NOT merge or drop anything.
 *
 * A collision means the legacy UNIQUE(language, normalized_keyword) constraint
 * cannot simply be swapped for a market-aware one: two rows that are distinct
 * today would collide after the change. The migration must therefore run
 * BACKFILL -> VALIDATE -> CHECK COLLISIONS -> VERIFY -> CONSTRAINT CHANGE, and
 * the constraint step stays BLOCKED until this returns no collisions against
 * real data.
 */
export function detectMarketCollisions(
    rows: ReadonlyArray<{ keyword: string; language: SourceLanguage; markets: readonly string[] }>
): MarketCollision[] {
    const groups = new Map<string, { market: Market; spellings: Set<string> }>();

    for (const row of rows) {
        const normalized = normalizeKeyword(row.keyword, row.language);
        if (!normalized) continue;
        for (const raw of row.markets) {
            const market = resolveMarketKey(row.language, raw);
            if (!market) continue;
            const key = `${market}::${normalized}`;
            const g = groups.get(key);
            if (g) g.spellings.add(row.keyword);
            else groups.set(key, { market, spellings: new Set([row.keyword]) });
        }
    }

    const collisions: MarketCollision[] = [];
    for (const [key, g] of groups) {
        if (g.spellings.size > 1) {
            collisions.push({
                market: g.market,
                normalizedKeyword: key.split('::')[1] ?? key,
                spellings: [...g.spellings].sort(),
            });
        }
    }
    return collisions.sort((a, b) =>
        a.market === b.market
            ? a.normalizedKeyword.localeCompare(b.normalizedKeyword)
            : a.market.localeCompare(b.market)
    );
}
