/**
 * tests/unit/seoGapEngine.test.ts
 *
 * STEP 11 verification.
 *
 * The single most important assertion in this file is that the gap engine emits
 * RECOMMENDATIONS ONLY. A gap engine that could create a page would turn an
 * inferred opportunity into published content nobody reviewed, so the check is
 * made machine-checkable (`noSideEffects`, `assertNoSideEffects`) rather than
 * left as a promise in a comment.
 */
import { describe, it, expect } from 'vitest';
import {
    detectGaps,
    assertNoSideEffects,
    isActionableGap,
    GAP_STATES,
    ACTIONABLE_GAP_STATES,
    GapInput,
    GapRecord,
} from '../../server/seo/gapEngine';

const MRX_SIDE: GapInput['mrxCoverage'] = [
    {
        keyword: 'testosterone enanthate cycle',
        language: 'en',
        market: 'en-US',
        destinationType: 'tool',
        signalCount: 3,
        lastObservedAt: '2026-09-01T00:00:00.000Z',
    },
    {
        keyword: 'macro calculator',
        language: 'en',
        market: 'en-US',
        destinationType: 'tool',
        signalCount: 2,
    },
];

const COMPETITOR_SIDE: GapInput['competitorCoverage'] = [
    {
        keyword: 'trenbolone acetate cycle',
        language: 'en',
        market: 'en-US',
        domain: 'arab-flex.com',
        sourceReference: 'https://arab-flex.com/tren',
    },
];

describe('gapEngine - the six states', () => {
    it('declares exactly six states and nothing else', () => {
        expect(GAP_STATES).toEqual([
            'COMPETITOR_COVERED',
            'MRX_COVERED',
            'SHARED',
            'PARTIAL_GAP',
            'FULL_GAP',
            'EMERGING_GAP',
        ]);
    });

    it('classifies a competitor-only topic as COMPETITOR_COVERED', () => {
        const report = detectGaps({ competitorCoverage: COMPETITOR_SIDE });
        const gap = report.gaps.find((g) => g.state === 'COMPETITOR_COVERED');
        expect(gap).toBeDefined();
        expect(gap!.competitor).toBe('arab-flex.com');
        expect(gap!.evidence).toContain('https://arab-flex.com/tren');
    });

    it('classifies an MRX-only topic as MRX_COVERED', () => {
        const report = detectGaps({ mrxCoverage: MRX_SIDE });
        const gap = report.gaps.find((g) => g.state === 'MRX_COVERED');
        expect(gap).toBeDefined();
        expect(gap!.competitor).toBeNull();
    });

    it('classifies a topic both sides cover, with MRX well-backed, as SHARED', () => {
        const report = detectGaps({
            mrxCoverage: MRX_SIDE,
            competitorCoverage: [
                {
                    keyword: 'testosterone enanthate cycle',
                    language: 'en',
                    market: 'en-US',
                    domain: 'mshawky.com',
                    sourceReference: 'https://mshawky.com/eth',
                },
            ],
        });
        const gap = report.gaps.find((g) => g.normalizedKeyword.includes('testosterone enanthate'));
        expect(gap!.state).toBe('SHARED');
        expect(gap!.competitorCount).toBe(1);
    });

    it('classifies a thinly-backed shared topic as PARTIAL_GAP', () => {
        const report = detectGaps({
            mrxCoverage: [
                {
                    keyword: 'testosterone enanthate cycle',
                    language: 'en',
                    market: 'en-US',
                    signalCount: 1,
                },
            ],
            competitorCoverage: [
                {
                    keyword: 'testosterone enanthate cycle',
                    language: 'en',
                    market: 'en-US',
                    domain: 'mshawky.com',
                    sourceReference: 'https://mshawky.com/eth',
                },
            ],
            sharedSignalMinimum: 2,
        });
        const gap = report.gaps.find((g) => g.normalizedKeyword.includes('testosterone enanthate'));
        expect(gap!.state).toBe('PARTIAL_GAP');
        expect(gap!.reason).toContain('signal');
    });

    it('classifies a market mismatch between the two sides as PARTIAL_GAP', () => {
        const report = detectGaps({
            mrxCoverage: [
                {
                    keyword: 'cutting cycle protocol',
                    language: 'ar',
                    market: 'ar-EG',
                    signalCount: 3,
                },
            ],
            competitorCoverage: [
                {
                    keyword: 'cutting cycle protocol',
                    language: 'ar',
                    market: 'ar-SA',
                    domain: 'arabiafit.com',
                    sourceReference: 'https://arabiafit.com/cut',
                },
            ],
        });
        const gap = report.gaps.find((g) => g.normalizedKeyword.includes('cutting cycle'));
        expect(gap!.state).toBe('PARTIAL_GAP');
        expect(gap!.reason).toContain('market');
    });

    it('classifies real unserved demand as FULL_GAP', () => {
        const report = detectGaps({
            uncoveredDemand: [
                {
                    keyword: 'nandrolone decanoate side effects',
                    language: 'en',
                    market: 'en-US',
                    signal: 'internal_search',
                    signalValue: 34,
                    signalKind: 'events',
                    sourceReference: 'seo_internal_search_logs:nandrolone',
                },
            ],
        });
        const gap = report.gaps.find((g) => g.state === 'FULL_GAP');
        expect(gap).toBeDefined();
        expect(gap!.evidence).toContain('events=34');
    });

    it('classifies a movement signal as EMERGING_GAP rather than FULL_GAP', () => {
        const report = detectGaps({
            uncoveredDemand: [
                {
                    keyword: 'new compound guide',
                    language: 'en',
                    market: 'en-US',
                    signal: 'trends',
                    signalValue: 82,
                    signalKind: 'relative_interest',
                    sourceReference: 'trends:2026-09-30',
                },
            ],
        });
        const gap = report.gaps.find((g) => g.state === 'EMERGING_GAP');
        expect(gap).toBeDefined();
        expect(gap!.evidence).toContain('relative_interest=82');
    });
});

describe('gapEngine - every gap carries its full attribution', () => {
    it('gives every gap a keyword, market, language, evidence and a state', () => {
        const report = detectGaps({
            mrxCoverage: MRX_SIDE,
            competitorCoverage: COMPETITOR_SIDE,
            uncoveredDemand: [
                {
                    keyword: 'hpta recovery timeline',
                    language: 'en',
                    market: 'en-US',
                    signal: 'gsc',
                    signalValue: 900,
                    signalKind: 'impressions',
                    sourceReference: 'gsc:2026-09-30',
                },
            ],
        });
        expect(report.gaps.length).toBeGreaterThan(0);
        for (const gap of report.gaps) {
            expect(gap.keyword).toBeTruthy();
            expect(gap.normalizedKeyword).toBeTruthy();
            expect(gap.market).toBeTruthy();
            expect(gap.language).toBeTruthy();
            expect(gap.evidence).toBeTruthy();
            expect(GAP_STATES).toContain(gap.state);
            expect(gap.reason).toBeTruthy();
        }
    });

    it('counts every state, including the ones that did not occur', () => {
        const report = detectGaps({ mrxCoverage: MRX_SIDE });
        for (const state of GAP_STATES) {
            expect(typeof report.byState[state]).toBe('number');
        }
    });

    it('lists only actionable states as recommendations', () => {
        const report = detectGaps({
            mrxCoverage: MRX_SIDE,
            competitorCoverage: COMPETITOR_SIDE,
        });
        for (const recommendation of report.recommendations) {
            expect(ACTIONABLE_GAP_STATES).toContain(recommendation.state);
            expect(isActionableGap(recommendation.state)).toBe(true);
        }
    });
});

describe('gapEngine - RECOMMENDATIONS ONLY, never a page or route', () => {
    it('declares no side effects in machine-checkable form', () => {
        const report = detectGaps({
            mrxCoverage: MRX_SIDE,
            competitorCoverage: COMPETITOR_SIDE,
            unservedDestinations: [
                {
                    destinationType: 'tool',
                    keyword: 'body fat calculator formula',
                    language: 'en',
                    market: 'en-US',
                    sourceReference: 'gsc:bodyfat',
                },
            ],
        });
        expect(report.noSideEffects).toEqual({
            createsPages: false,
            createsArticles: false,
            createsRoutes: false,
            performsWrites: false,
        });
    });

    it('emits no path, slug, route, href or url field on any gap', () => {
        const report = detectGaps({
            mrxCoverage: MRX_SIDE,
            competitorCoverage: COMPETITOR_SIDE,
            unservedDestinations: [
                {
                    destinationType: 'tool',
                    keyword: 'body fat calculator formula',
                    language: 'en',
                    market: 'en-US',
                    sourceReference: 'gsc:bodyfat',
                },
            ],
        });

        for (const gap of report.gaps) {
            const serialized = JSON.stringify(gap);
            expect(serialized).not.toMatch(/"(slug|route|href|url|path|destinationPath)"/i);
            // No field VALUE is a leading-slash path, the shape a route takes.
            expect(serialized).not.toMatch(/"[^"]*"\s*:\s*"\/[^"]*"/);
        }
    });

    it('recommends a destination TYPE only, never a route to create', () => {
        const report = detectGaps({
            unservedDestinations: [
                {
                    destinationType: 'tool',
                    keyword: 'body fat calculator formula',
                    language: 'en',
                    market: 'en-US',
                    sourceReference: 'gsc:bodyfat',
                },
            ],
        });
        const gap = report.gaps[0];
        expect(gap.recommendedDestinationType).toBe('tool');
        expect(JSON.stringify(gap)).not.toContain('/bodyfat');
    });

    it('passes its own side-effect audit for a fully populated report', () => {
        const report = detectGaps({
            mrxCoverage: MRX_SIDE,
            competitorCoverage: COMPETITOR_SIDE,
            uncoveredDemand: [
                {
                    keyword: 'hpta recovery timeline',
                    language: 'en',
                    market: 'en-US',
                    signal: 'gsc',
                    signalValue: 900,
                    signalKind: 'impressions',
                    sourceReference: 'gsc:2026-09-30',
                },
            ],
            unservedDestinations: [
                {
                    destinationType: 'article',
                    keyword: 'anabolic diet basics',
                    language: 'en',
                    market: 'en-US',
                    sourceReference: 'import:rows',
                },
            ],
        });
        expect(assertNoSideEffects(report.gaps)).toEqual([]);
    });
});

describe('gapEngine - never invents numbers', () => {
    it('leaves opportunityScore and confidence null on every gap', () => {
        const report = detectGaps({
            mrxCoverage: MRX_SIDE,
            competitorCoverage: COMPETITOR_SIDE,
            uncoveredDemand: [
                {
                    keyword: 'hpta recovery timeline',
                    language: 'en',
                    market: 'en-US',
                    signal: 'gsc',
                    signalValue: 900,
                    signalKind: 'impressions',
                    sourceReference: 'gsc:2026-09-30',
                },
            ],
        });
        for (const gap of report.gaps) {
            expect(gap.opportunityScore).toBeNull();
            expect(gap.confidence).toBeNull();
        }
    });

    it('only reports a searchVolume for a real Google Ads reading', () => {
        const report = detectGaps({
            uncoveredDemand: [
                {
                    keyword: 'cycle dosage chart',
                    language: 'en',
                    market: 'en-US',
                    signal: 'ads',
                    signalValue: 5400,
                    signalKind: 'avg_monthly_searches',
                    sourceReference: 'ads:kwplanner',
                },
                {
                    keyword: 'injection technique guide',
                    language: 'en',
                    market: 'en-US',
                    signal: 'internal_search',
                    signalValue: 12,
                    signalKind: 'events',
                    sourceReference: 'seo_internal_search_logs:injection',
                },
            ],
        });
        const fromAds = report.gaps.find((g) => g.normalizedKeyword.includes('cycle dosage'));
        const fromSearch = report.gaps.find((g) => g.normalizedKeyword.includes('injection technique'));
        expect(fromAds!.searchVolume).toBe(5400);
        // Internal search events are NOT search volume and must stay null.
        expect(fromSearch!.searchVolume).toBeNull();
    });

    it('assigns dataKind observed, because every state derives from real observations', () => {
        const report = detectGaps({ mrxCoverage: MRX_SIDE, competitorCoverage: COMPETITOR_SIDE });
        for (const gap of report.gaps) {
            expect(gap.dataKind).toBe('observed');
        }
    });
});

describe('gapEngine - determinism and idempotency', () => {
    it('produces identical output for identical input', () => {
        const input: GapInput = {
            mrxCoverage: MRX_SIDE,
            competitorCoverage: COMPETITOR_SIDE,
        };
        expect(detectGaps(input).gaps).toEqual(detectGaps(input).gaps);
    });

    it('produces a stable gap id so a re-run updates rather than duplicates', () => {
        const input: GapInput = { mrxCoverage: MRX_SIDE, competitorCoverage: COMPETITOR_SIDE };
        const first = detectGaps(input).gaps.map((g: GapRecord) => g.id);
        const second = detectGaps(input).gaps.map((g: GapRecord) => g.id);
        expect(second).toEqual(first);
    });

    it('returns an empty report from an empty input rather than inventing gaps', () => {
        const report = detectGaps({});
        expect(report.gaps).toEqual([]);
        expect(report.recommendations).toEqual([]);
    });

    it('ignores a coverage record with no keyword rather than emitting a blank gap', () => {
        const report = detectGaps({
            competitorCoverage: [{ keyword: '', language: 'en', market: 'en-US', domain: 'a.com', sourceReference: 'x' }],
            mrxCoverage: [{ keyword: '', language: 'en', market: 'en-US' }],
        });
        expect(report.gaps).toEqual([]);
    });
});
