/**
 * tests/unit/seoSnapshotDiff.test.ts
 * STEP 13/14 � historical diff states and market identity isolation.
 *
 * Two properties are load-bearing:
 *   1. Historical comparison is the PRIMARY trend signal; `determineTrendStatus`
 *      is only a fallback when no prior state exists.
 *   2. Markets are NOT synonyms: ar / ar-EG / ar-SA / ar-AE and en-US / en-GB /
 *      en-AU must never collapse onto one identity.
 */
import { describe, it, expect } from 'vitest';

import {
    MARKETS,
    isSupportedMarket,
    languageOf,
    resolveMarketKey,
    marketIdentityKey,
    diffWeeklyStates,
    markReactivated,
    detectMarketCollisions,
    type WeeklyState,
} from '../../server/seo/snapshotDiff';

const state = (
    keyword: string,
    market: WeeklyState['market'],
    score: number | null,
    week = 40
): WeeklyState => ({
    keyword,
    language: languageOf(market),
    market,
    year: 2026,
    week,
    score,
    rank: null,
});

describe('STEP 14 � market identity is never a synonym', () => {
    it('supports exactly the seven required markets', () => {
        expect(MARKETS).toEqual(['ar-EG', 'ar-SA', 'ar-AE', 'en-US', 'en-GB', 'en-CA', 'en-AU']);
    });

    it('resolves each market to its language', () => {
        expect(languageOf('ar-EG')).toBe('ar');
        expect(languageOf('en-AU')).toBe('en');
    });

    it('refuses to resolve a bare language to an invented country', () => {
        // 'ar' is not 'ar-EG'. Defaulting would silently merge three markets.
        expect(resolveMarketKey('ar', 'ar')).toBeNull();
        expect(resolveMarketKey('en', 'en')).toBeNull();
        expect(resolveMarketKey('ar', null)).toBeNull();
    });


describe('STEP 13 � week-over-week diff states', () => {
    it('reports NEW for a keyword with no prior state', () => {
        const diff = diffWeeklyStates([state('ffmi calculator', 'en-US', 80)], []);
        expect(diff).toHaveLength(1);
        expect(diff[0].state).toBe('NEW');
    });

    it('reports LOST for a keyword that disappeared', () => {
        const diff = diffWeeklyStates([], [state('ffmi calculator', 'en-US', 80)]);
        expect(diff[0].state).toBe('LOST');
        expect(diff[0].current).toBeNull();
    });

    it('reports RISING and FALLING from real score movement', () => {
        const rising = diffWeeklyStates(
            [state('ffmi calculator', 'en-US', 90)],
            [state('ffmi calculator', 'en-US', 70)]
        );
        expect(rising[0].state).toBe('RISING');

        const falling = diffWeeklyStates(
            [state('ffmi calculator', 'en-US', 70)],
            [state('ffmi calculator', 'en-US', 90)]
        );
        expect(falling[0].state).toBe('FALLING');
    });

    it('reports STABLE when the score is unchanged', () => {
        const diff = diffWeeklyStates(
            [state('ffmi calculator', 'en-US', 80)],
            [state('ffmi calculator', 'en-US', 80)]
        );
        expect(diff[0].state).toBe('STABLE');
    });

    it('reports NEEDS_REVIEW rather than guessing when a score is missing', () => {
        // A null score is missing EVIDENCE. Calling it "no change" would be a
        // fabricated conclusion.
        const diff = diffWeeklyStates(
            [state('ffmi calculator', 'en-US', null)],
            [state('ffmi calculator', 'en-US', 80)]
        );
        expect(diff[0].state).toBe('NEEDS_REVIEW');
    });

    it('does not treat the same term in two markets as one keyword', () => {
        const diff = diffWeeklyStates(
            [state('half life', 'en-US', 80), state('half life', 'en-GB', 80)],
            [state('half life', 'en-US', 80)]
        );
        // en-GB is new; en-US is stable. Merging them would hide the gap.
        const states = diff.map((d) => d.state).sort();
        expect(states).toEqual(['NEW', 'STABLE']);
    });

    it('marks a returning keyword REACTIVATED', () => {
        const history = [state('ffmi calculator', 'en-US', 60, 39)];
        const raw = diffWeeklyStates([state('ffmi calculator', 'en-US', 80, 40)], []);
        expect(raw[0].state).toBe('NEW');
        const reactivated = markReactivated(raw, history);
        expect(reactivated[0].state).toBe('REACTIVATED');
    });
});

describe('STEP 14 � migration collision reporting', () => {
    it('reports nothing when each identity is unique', () => {
        const collisions = detectMarketCollisions([
            { keyword: 'ffmi calculator', language: 'en', markets: ['en-US'] },
            { keyword: 'half life', language: 'en', markets: ['en-GB'] },
        ]);
        expect(collisions).toEqual([]);
    });

    it('reports a collision instead of silently merging', () => {
        const collisions = detectMarketCollisions([
            { keyword: 'FFMI Calculator', language: 'en', markets: ['en-US'] },
            { keyword: 'ffmi  calculator', language: 'en', markets: ['en-US'] },
        ]);
        expect(collisions).toHaveLength(1);
        expect(collisions[0].market).toBe('en-US');
        expect(collisions[0].spellings.length).toBe(2);
    });

    it('does not report a collision across different markets', () => {
        const collisions = detectMarketCollisions([
            { keyword: 'ffmi calculator', language: 'en', markets: ['en-US'] },
            { keyword: 'ffmi  calculator', language: 'en', markets: ['en-CA'] },
        ]);
        expect(collisions).toEqual([]);
    });
});

    it('rejects an unsupported market instead of coercing it', () => {
        expect(resolveMarketKey('en', 'en-IE')).toBeNull();
        expect(isSupportedMarket('en-IE')).toBe(false);
        expect(isSupportedMarket('ar-SA')).toBe(true);
    });

    it('produces different identities for different markets', () => {
        // Arabic term written as escapes so the file stays encoding-safe:
        // "تحاليل هرمونات" (hormone blood tests).
        const arSa = marketIdentityKey(
            '\u062a\u062d\u0627\u0644\u064a\u0644 \u0647\u0631\u0645\u0648\u0646\u0627\u062a',
            'ar',
            'ar-SA'
        );
        const arEg = marketIdentityKey(
            '\u062a\u062d\u0627\u0644\u064a\u0644 \u0647\u0631\u0645\u0648\u0646\u0627\u062a',
            'ar',
            'ar-EG'
        );
        expect(arSa).not.toBeNull();
        expect(arEg).not.toBeNull();
        expect(arSa).not.toBe(arEg);
    });

    it('produces different identities for en-US vs en-GB', () => {
        expect(marketIdentityKey('half life', 'en', 'en-US')).not.toBe(
            marketIdentityKey('half life', 'en', 'en-GB')
        );
    });
});