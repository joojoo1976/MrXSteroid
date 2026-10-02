/**
 * tests/unit/seoMarketIdentity.test.ts
 * STEP 14 — market identity.
 *
 * The contract under test:
 *     SAME language + SAME keyword + DIFFERENT market  => two distinct records
 *     SAME language + SAME market + SAME normalized keyword => ONE identity
 *
 * The second case is why Production currently COLLAPSES markets: the v1 unique
 * key is (language, normalized_keyword), which merges "half life" in en-US with
 * "half life" in en-GB. These tests pin the corrected behaviour WITHOUT
 * touching any Production constraint — the migration plan in
 * 20260930130000_seo_keyword_weekly_states.sql is read-only by design.
 */
import { describe, it, expect } from 'vitest';

import { marketOf, marketWasDefaulted } from '../../server/seo/refreshRuntime';
import { diffWeeklyStates } from '../../server/seo/snapshotDiff';
import { buildIdentityKey, sameMarketIdentity } from '../../server/seo/marketIdentity';

describe('market identity · two markets are two records', () => {
    it('treats the same term in two markets as two identities', () => {
        const us = buildIdentityKey({ language: 'en', market: 'en-US', normalizedKeyword: 'half life' });
        const gb = buildIdentityKey({ language: 'en', market: 'en-GB', normalizedKeyword: 'half life' });
        expect(us).not.toBe(gb);
    });

    it('treats the same term in two languages as two identities', () => {
        const en = buildIdentityKey({ language: 'en', market: 'en-US', normalizedKeyword: 'half life' });
        const ar = buildIdentityKey({ language: 'ar', market: 'ar-EG', normalizedKeyword: 'نصف العمر' });
        expect(en).not.toBe(ar);
    });

    it('does not let a market difference vanish from the diff', () => {
        const current = [
            {
                keyword_id: 'a', keyword: 'half life', language: 'en' as const,
                market: 'en-US' as never, year: 2026, week: 40, score: 80,
                rank: null, destination_path: '/a', trend_status: 'stable',
            },
            {
                keyword_id: 'b', keyword: 'half life', language: 'en' as const,
                market: 'en-GB' as never, year: 2026, week: 40, score: 82,
                rank: null, destination_path: '/b', trend_status: 'stable',
            },
        ];
        const previous = [
            {
                ...current[0], year: 2026, week: 39, score: 80,
            },
        ];

        const diff = diffWeeklyStates(current, previous);
        // en-US is STABLE (it has history); en-GB is NEW (it does not).
        // If market were ignored, en-GB would have been merged into en-US.
        const states = diff.map((d) => d.state);
        expect(states).toContain('STABLE');
        expect(states).toContain('NEW');
        expect(diff).toHaveLength(2);
    });
});

describe('market identity · same language + same market is one identity', () => {
    it('is idempotent for a byte-identical identity', () => {
        const a = buildIdentityKey({ language: 'en', market: 'en-US', normalizedKeyword: 'half life' });
        const b = buildIdentityKey({ language: 'en', market: 'en-US', normalizedKeyword: 'half life' });
        expect(a).toBe(b);
        expect(sameMarketIdentity(a, b)).toBe(true);
    });

    it('is case- and whitespace-insensitive on the normalized form', () => {
        const a = buildIdentityKey({ language: 'en', market: 'en-US', normalizedKeyword: 'half life' });
        const b = buildIdentityKey({ language: 'en', market: 'en-US', normalizedKeyword: '  HALF   LIFE ' });
        // Normalization already lowercases/trims; the key must not reintroduce
        // a difference, otherwise one keyword would fork into two identities.
        expect(sameMarketIdentity(a, b)).toBe(true);
    });

    it('still separates on a genuinely different market', () => {
        const a = buildIdentityKey({ language: 'en', market: 'en-US', normalizedKeyword: 'half life' });
        const b = buildIdentityKey({ language: 'en', market: 'en-CA', normalizedKeyword: 'half life' });
        expect(sameMarketIdentity(a, b)).toBe(false);
    });
});

describe('market identity · a market is never invented', () => {
    it('reads market from market, then country_code, then locale', () => {
        expect(marketOf({ market: 'ar-SA', locale: 'en-US' })).toBe('ar-SA');
        expect(marketOf({ country_code: 'en-AU', locale: 'en-US' })).toBe('en-AU');
        expect(marketOf({ locale: 'en-GB' })).toBe('en-GB');
    });

    it('falls back to the documented default AND reports that it did', () => {
        // A bare language is not a market. The row must not silently gain one.
        expect(marketOf({ locale: 'ar' })).toBe('en-US');
        expect(marketWasDefaulted({ locale: 'ar' })).toBe(true);
        expect(marketWasDefaulted({ locale: 'ar-EG' })).toBe(false);
    });

    it('rejects an unsupported market value rather than trusting it', () => {
        expect(marketOf({ locale: 'en-ZZ' })).toBe('en-US');
        expect(marketWasDefaulted({ locale: 'en-ZZ' })).toBe(true);
    });
});
