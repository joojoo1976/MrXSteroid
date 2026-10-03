/**
 * Phase 3/4/7/8/9 â€” the executable intelligence chain, proven in one pass.
 *
 * These assertions run the REAL engine functions against the REAL contracts.
 * They do not simulate a happy path; they check that the behaviours the
 * Definition of Done depends on are actually enforced by the code.
 */
import { describe, it, expect } from 'vitest';

import { WEEKLY_STAGES } from '../../server/seo/weeklyEngine';
import { diffWeeklyStates, markReactivated } from '../../server/seo/snapshotDiff';
import { buildIdentityKey, sameMarketIdentity, dedupeByMarketIdentity } from '../../server/seo/marketIdentity';
import { mapGscRow } from '../../server/seo/sources/gscAdapter';
import { mapGoogleAdsIdea } from '../../server/seo/sources/googleAdsAdapter';
import {
    parseRobotsTxt,
    isUrlAllowed,
    resolveThrottleMs,
    MIN_THROTTLE_MS,
    CLOSED_ROBOTS_POLICY,
} from '../../server/seo/sources/competitorCrawler';
import { classifyProvider } from '../../server/seo/sources/csvImportPipeline';
import { sourceRegistry } from '../../server/seo/sources/registry';

const state = (
    id: string,
    market: string,
    score: number | null,
    year = 2026,
    week = 40
) => ({
    keyword_id: id,
    // The identity key is built from `keyword`, not `keyword_id`, so each
    // fixture row must have a DISTINCT keyword or the diff collapses them.
    keyword: `kw-${id}`,
    language: 'en' as const,
    market: market as never,
    year,
    week,
    score,
    rank: null,
    destination_path: '/x',
    trend_status: null,
});

describe('Phase 3 Â· the 15-stage chain exists in the required order', () => {
    it('covers DISCOVER through REPORT exactly', () => {
        expect(WEEKLY_STAGES).toEqual([
            'DISCOVER', 'COLLECT', 'NORMALIZE', 'DEDUPLICATE', 'VALIDATE',
            'CLASSIFY', 'CLUSTER', 'ENRICH', 'SCORE', 'COMPARE_WITH_HISTORY',
            'DETECT_GAPS', 'PRIORITIZE', 'MAP_DESTINATIONS', 'PERSIST', 'REPORT',
        ]);
    });
});

describe('Phase 4 Â· historical diff produces every required state', () => {
    it('classifies NEW, RISING, FALLING, STABLE, LOST, REACTIVATED, NEEDS_REVIEW', () => {
        // `diffWeeklyStates` compares CURRENT against LAST week. A row that is
        // in neither current nor last-week, but IS in the wider history, is the
        // genuine "came back" case, so the wider history is passed separately.
        const current = [
            state('new', 'en-US', 80),          // absent from history        => NEW
            state('rising', 'en-US', 90),       // 70 -> 90                   => RISING
            state('falling', 'en-US', 50),      // 70 -> 50                   => FALLING
            state('stable', 'en-US', 70),       // 70 -> 70                   => STABLE
            state('react', 'en-US', 60),        // only in older history      => REACTIVATED
            state('gap', 'en-US', null),        // score unknown              => NEEDS_REVIEW
        ];
        const lastWeek = [
            state('rising', 'en-US', 70, 2026, 39),
            state('falling', 'en-US', 70, 2026, 39),
            state('stable', 'en-US', 70, 2026, 39),
            state('gap', 'en-US', 70, 2026, 39),
            state('lost', 'en-US', 40, 2026, 39),  // vanished                 => LOST
        ];
        // The wider history includes `react` two weeks ago. It is NOT in
        // lastWeek, so the diff sees it as NEW â€” and markReactivated then
        // correctly reclassifies it using the wider history.
        const widerHistory = [...lastWeek, state('react', 'en-US', 40, 2026, 38)];

        const raw = diffWeeklyStates(current, lastWeek);
        // The LOST row is produced by the second loop over prevMap.
        const states = markReactivated(raw, widerHistory).map((d) => d.state);

        expect(new Set(states)).toEqual(
            new Set([
                'NEW', 'RISING', 'FALLING', 'STABLE',
                'LOST', 'REACTIVATED', 'NEEDS_REVIEW',
            ])
        );
    });

    it('never derives a trend from a timestamp when history exists', () => {
        // Two weeks of real scores: the engine must use the delta, not recency.
        const current = [state('k', 'en-US', 95)];
        const previous = [state('k', 'en-US', 40, 2026, 39)];
        const [row] = diffWeeklyStates(current, previous);
        expect(row.state).toBe('RISING');
    });

    it('a missing score yields NEEDS_REVIEW, never a fabricated STABLE', () => {
        // A keyword whose score is unknown must not be reported as "unchanged".
        // Missing evidence is a distinct, visible state.
        const [row] = diffWeeklyStates([state('k', 'en-US', null)], [
            state('k', 'en-US', 70, 2026, 39),
        ]);
        expect(row.state).toBe('NEEDS_REVIEW');
    });
});

describe('Phase 5 Â· competitor intelligence is rules-based, not hardcoded', () => {
    it('robots.txt parsing governs access', () => {
        // Access is decided by the parsed policy, not by a hardcoded list.
        const policy = parseRobotsTxt('User-agent: *\nDisallow: /private\n');
        expect(isUrlAllowed('https://x.com/private/a', policy, 'MRXBot')).toBe(false);
        expect(isUrlAllowed('https://x.com/public/a', policy, 'MRXBot')).toBe(true);
    });

    it('throttling has a hard floor even when robots asks for 0', () => {
        const policy = parseRobotsTxt('User-agent: *\nCrawl-delay: 0\n');
        expect(resolveThrottleMs(policy, 'MRXBot')).toBeGreaterThanOrEqual(MIN_THROTTLE_MS);
    });

    it('a closed default denies everything', () => {
        expect(isUrlAllowed('https://x.com/anything', CLOSED_ROBOTS_POLICY, 'MRXBot')).toBe(false);
    });
});

describe('Phase 7 Â· metrics never leak between providers', () => {
    it('a GSC row carries GSC metrics and leaves Ads/Trends null', () => {
        const row = mapGscRow(
            { keys: ['testosterone'], clicks: 10, impressions: 100, ctr: 0.1, position: 3 },
            {
                language: 'en',
                requestedMarket: 'en-US' as never,
                siteUrl: 'https://x.com',
                dataStart: '2026-09-01',
                dataEnd: '2026-09-07',
                retrievedAt: new Date().toISOString(),
                metricsDate: '2026-09-07',
            }
        );
        expect(row).not.toBeNull();
        expect(row!.metrics.googleImpressions).toBe(100);
        // Ads volume and Trends interest are NOT derivable from a GSC row.
        expect(row!.metrics.googleAdsAvgMonthlySearches).toBeNull();
        expect(row!.metrics.trendsRelativeInterest).toBeNull();
        expect(row!.dataKind).toBe('observed');
    });

    it('a Google Ads idea is ESTIMATED and never becomes organic volume', () => {
        const rec = mapGoogleAdsIdea(
            { text: 'testosterone', keyword_idea_metrics: { avg_monthly_searches: 5000 } },
            {
                language: 'en',
                market: 'en-US' as never,
                customerId: '1',
                retrievedAt: new Date().toISOString(),
            }
        );
        expect(rec).not.toBeNull();
        expect(rec!.dataKind).toBe('estimated');
        expect(rec!.metrics.googleAdsAvgMonthlySearches).toBe(5000);
        // The critical separation: it must not claim to be impressions.
        expect(rec!.metrics.googleImpressions).toBeNull();
    });
});

describe('Phase 8 Â· market identity is (language, market, keyword)', () => {
    it('same keyword in two markets is two identities', () => {
        const us = buildIdentityKey({ language: 'en', market: 'en-US', normalizedKeyword: 'half life' });
        const gb = buildIdentityKey({ language: 'en', market: 'en-GB', normalizedKeyword: 'half life' });
        expect(sameMarketIdentity(us, gb)).toBe(false);
    });

    it('same triple is one identity and dedupes', () => {
        const rows = [
            { language: 'en' as const, market: 'en-US' as never, k: 'a' },
            { language: 'en' as const, market: 'en-US' as never, k: 'a' },
            { language: 'en' as const, market: 'en-GB' as never, k: 'a' },
        ];
        const out = dedupeByMarketIdentity(rows, (r) => ({
            language: r.language,
            market: r.market,
            normalizedKeyword: r.k,
        }));
        expect(out).toHaveLength(2);
    });
});

describe('Phase 9 Â· registry reports real status, never fabricated VERIFIED', () => {
    it('no source claims VERIFIED', () => {
        const bad = sourceRegistry.getSourceHealth().filter((h) => h.status === 'VERIFIED');
        expect(bad).toEqual([]);
    });
});

describe('Phase 6 Â· imported rows are labelled by their real origin', () => {
    it('a Trends CSV import is classified, and is not the official API', () => {
        // `sourceType` names the SOURCE (`trend_export`); `dataKind` is the
        // epistemic label. A manual CSV must never claim to be an observation
        // from Google's official API.
        const c = classifyProvider('google_trends');
        expect(c.generationMethod).toBe('import');
        expect(c.dataKind).toBe('imported');
        expect(c.dataKind).not.toBe('observed');
    });

    it('an approved-provider import is also not an observation', () => {
        expect(classifyProvider('approved_provider').dataKind).not.toBe('observed');
    });
});

describe('Phase 9b Â· registry truth invariants', () => {
    it('a source with no blocked_reason is never in a blocked status', () => {
        // `blocked_reason: null` is correct for a CONFIGURED source: it is not
        // blocked, it simply has not been verified. A reason is owed ONLY when
        // the source actually cannot run.
        for (const h of sourceRegistry.getSourceHealth()) {
            if (h.blocked_reason !== null) continue;
            expect(
                ['BLOCKED', 'NOT_PROVEN', 'PLANNED'],
                `${h.provider} has no reason but status ${h.status}`
            ).not.toContain(h.status);
        }
    });

    it('a CONFIGURED first-party baseline is honest, not verified', () => {
        // Curated in-repo and wired in, but no live execution observed.
        // CONFIGURED â€” explicitly NOT VERIFIED â€” is the correct state.
        const b = sourceRegistry
            .getSourceHealth()
            .find((h) => h.provider === 'internal_baseline_seeds');
        expect(b).toBeTruthy();
        expect(b!.source_class).toBe('FIRST_PARTY');
        expect(b!.status).toBe('CONFIGURED');
        expect(b!.status).not.toBe('VERIFIED');
        expect(b!.blocked_reason).toBeNull();
    });

    it('every external source is implemented, configured or blocked', () => {
        const external = sourceRegistry
            .getSourceHealth()
            .filter((h) => h.source_class !== 'FIRST_PARTY');
        expect(external.length).toBeGreaterThan(0);
        for (const h of external) {
            expect(['IMPLEMENTED', 'CONFIGURED', 'BLOCKED', 'DISABLED', 'PROVEN', 'PLANNED']).toContain(h.status);
        }
    });
});
