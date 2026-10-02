/**
 * tests/unit/seoInnovationEngine.test.ts
 *
 * STEP 10 verification.
 *
 * The failure mode this suite exists to catch is a candidate that LOOKS like
 * intelligence but is not: a generated keyword presented as source-backed, a
 * confidence number with no data source behind it, or a metric inherited from a
 * parent keyword. Each of those is asserted against directly rather than being
 * left to a comment.
 */
import { describe, it, expect } from 'vitest';
import {
    generateCandidates,
    generateInnovationCandidates,
    isSourceBacked,
    GENERATED_SOURCE_TYPE,
    GENERATION_METHODS,
    InnovationCandidate,
    InnovationInput,
} from '../../server/seo/innovationEngine';

const COMPETITOR_INPUT: InnovationInput = {
    competitorGaps: [
        {
            keyword: 'testosterone enanthate cycle guide',
            language: 'en',
            market: 'en-US',
            domain: 'arab-flex.com',
            sourceReference: 'https://arab-flex.com/cycle',
        },
    ],
    internalSearch: [
        { keyword: 'half life calculator', count: 12, language: 'en', market: 'en-US' },
    ],
    existingKeywords: [
        { keyword: 'macro calculator for bulking', language: 'en', market: 'en-US', destinationType: 'tool' },
    ],
};

describe('innovationEngine - lineage', () => {
    it('attaches parentKeyword, generationMethod, generationReason and evidence to EVERY candidate', () => {
        const { candidates } = generateCandidates(COMPETITOR_INPUT);
        expect(candidates.length).toBeGreaterThan(0);

        for (const candidate of candidates) {
            expect(candidate.parentKeyword).toBeTruthy();
            expect(typeof candidate.parentKeyword).toBe('string');
            expect(GENERATION_METHODS).toContain(candidate.generationMethod);
            expect(candidate.generationReason).toBeTruthy();
            expect(candidate.generationReason.length).toBeGreaterThan(20);
            expect(candidate.evidence).toBeTruthy();
            expect(candidate.evidence.length).toBeGreaterThan(5);
        }
    });

    it('never emits a candidate whose generationReason is a bare restatement of the keyword', () => {
        const { candidates } = generateCandidates(COMPETITOR_INPUT);
        for (const candidate of candidates) {
            expect(candidate.generationReason).not.toBe(candidate.keyword);
        }
    });

    it('produces an empty result from an empty input rather than seeded placeholders', () => {
        const { candidates } = generateCandidates({});
        expect(candidates).toEqual([]);
    });
});

describe('innovationEngine - never invents numbers', () => {
    it('leaves confidence null on every candidate', () => {
        const { candidates } = generateCandidates(COMPETITOR_INPUT);
        for (const candidate of candidates) {
            expect(candidate.confidence).toBeNull();
        }
    });

    it('leaves every metric null, even when the parent had a real reading', () => {
        const { candidates } = generateCandidates({
            gsc: [
                {
                    keyword: 'testosterone injection sites',
                    impressions: 4200,
                    language: 'en',
                    market: 'en-US',
                    sourceReference: 'gsc:2026-09-30',
                },
            ],
            adsIdeas: [
                {
                    keyword: 'anabolic cycle dosage',
                    avgMonthlySearches: 8100,
                    language: 'en',
                    market: 'en-US',
                    sourceReference: 'ads:kwplanner',
                },
            ],
        });

        expect(candidates.length).toBeGreaterThan(0);
        for (const candidate of candidates) {
            expect(candidate.confidence).toBeNull();
            for (const [field, value] of Object.entries(candidate.metrics)) {
                expect(value, `${candidate.keyword}.${field} must stay null`).toBeNull();
            }
        }
    });

    it('does not transfer a parent GSC impression count onto the child keyword', () => {
        const { candidates } = generateCandidates({
            gsc: [
                {
                    keyword: 'testosterone injection sites',
                    impressions: 4200,
                    language: 'en',
                    market: 'en-US',
                    sourceReference: 'gsc:2026-09-30',
                },
            ],
        });
        for (const candidate of candidates) {
            expect(candidate.metrics.googleImpressions).toBeNull();
            expect(candidate.metrics.googleClicks).toBeNull();
        }
    });
});

describe('innovationEngine - generated is never source-backed', () => {
    it('marks every candidate GENERATED / generated with the GENERATED source class', () => {
        const { candidates } = generateCandidates(COMPETITOR_INPUT);
        for (const candidate of candidates) {
            expect(candidate.sourceType).toBe(GENERATED_SOURCE_TYPE);
            expect(candidate.sourceType).toBe('GENERATED');
            expect(candidate.dataKind).toBe('generated');
            expect(candidate.sourceClass).toBe('GENERATED');
            expect(isSourceBacked(candidate)).toBe(false);
        }
    });

    it('does not claim VERIFIED or CONNECTED, because no live request backs a transform', () => {
        const { candidates } = generateCandidates(COMPETITOR_INPUT);
        for (const candidate of candidates) {
            expect(candidate.sourceStatus).toBe('PLANNED');
            expect(candidate.sourceStatus).not.toBe('VERIFIED');
            expect(candidate.sourceStatus).not.toBe('CONNECTED');
        }
    });
});

describe('innovationEngine - no routes, pages or paths', () => {
    it('emits no path, slug, route or URL on any candidate', () => {
        const { candidates } = generateCandidates({
            ...COMPETITOR_INPUT,
            destinationGaps: [
                {
                    destinationType: 'tool',
                    keyword: 'body fat calculator formula',
                    language: 'en',
                    market: 'en-US',
                    sourceReference: 'gsc:bodyfat',
                },
            ],
        });
        for (const candidate of candidates) {
            const serialized = JSON.stringify(candidate);
            // No destination-bearing field exists at all: a path, slug, route
            // or href is what would let a consumer create a page from this.
            expect(serialized).not.toMatch(/destinationPath/);
            expect(serialized).not.toMatch(/destination_path/);
            expect(serialized).not.toMatch(/"(slug|route|href|url|path)"/i);
            // No field's VALUE is a leading-slash path, the shape a route takes.
            expect(serialized).not.toMatch(/"[^"]*"\s*:\s*"\/[^"]*"/);
            // The only URL allowed anywhere is inside `evidence`, where it is
            // the competitor page a human must open to audit the claim. A
            // competitor crawl reference is provenance, not a route we own.
            const evidenceOnly = serialized.replace(/"evidence":"[^"]*"/g, '"evidence":"<redacted>"');
            expect(evidenceOnly).not.toMatch(/https?:\/\//);
        }
    });

    it('attaches only a destination TYPE when a destination hint is supplied', () => {
        const { candidates } = generateCandidates({
            destinationGaps: [
                {
                    destinationType: 'tool',
                    keyword: 'body fat calculator formula',
                    language: 'en',
                    market: 'en-US',
                    sourceReference: 'gsc:bodyfat',
                },
            ],
        });
        const hinted = candidates.filter((c) => c.recommendedDestinationType);
        expect(hinted.length).toBeGreaterThan(0);
        for (const candidate of hinted) {
            expect(candidate.recommendedDestinationType).toBe('tool');
        }
    });
});

describe('innovationEngine - only real inputs produce candidates', () => {
    it('emits nothing for a family whose input is absent, and says why', () => {
        const { candidates, skipped } = generateCandidates({
            existingKeywords: [{ keyword: 'macro calculator for bulking', language: 'en', market: 'en-US' }],
        });
        const skippedMethods = skipped.map((s) => s.method);
        expect(skippedMethods).toContain('trends_expansion');
        expect(skippedMethods).toContain('gsc_impression_expansion');
        expect(skippedMethods).toContain('ads_idea_expansion');
        // Nothing was invented to fill the absent families.
        for (const candidate of candidates) {
            expect(candidate.generationMethod).not.toBe('trends_expansion');
            expect(candidate.generationMethod).not.toBe('gsc_impression_expansion');
            expect(candidate.generationMethod).not.toBe('ads_idea_expansion');
        }
    });

    it('rejects a zero-count internal search reading rather than treating 0 as demand', () => {
        const { candidates } = generateCandidates({
            internalSearch: [{ keyword: 'never searched phrase', count: 0, language: 'en', market: 'en-US' }],
        });
        expect(candidates).toEqual([]);
    });

    it('emits no comparison when fewer than two real terms exist', () => {
        const { candidates, skipped } = generateCandidates(COMPETITOR_INPUT);
        expect(candidates.some((c) => c.generationMethod === 'comparison_expansion')).toBe(false);
        const note = skipped.find((s) => s.method === 'comparison_expansion');
        expect(note).toBeDefined();
        expect(note!.reason).toContain('two real observed terms');
    });

    it('emits a comparison only when two real competitor phrases both exist', () => {
        const { candidates } = generateCandidates({
            competitorGaps: [
                {
                    keyword: 'testosterone cypionate cycle',
                    language: 'en',
                    market: 'en-US',
                    domain: 'arab-flex.com',
                    sourceReference: 'https://arab-flex.com/cyp',
                },
                {
                    keyword: 'testosterone enanthate cycle',
                    language: 'en',
                    market: 'en-US',
                    domain: 'mshawky.com',
                    sourceReference: 'https://mshawky.com/eth',
                },
            ],
        });
        const comparisons = candidates.filter((c) => c.generationMethod === 'comparison_expansion');
        expect(comparisons.length).toBeGreaterThan(0);
        for (const comparison of comparisons) {
            expect(comparison.keyword).toContain('vs');
            expect(comparison.evidence).toContain('arab-flex.com');
            expect(comparison.evidence).toContain('mshawky.com');
        }
    });
});

describe('innovationEngine - evidence names the real source', () => {
    it('cites the competitor domain and crawl reference, never a bare assertion', () => {
        const { candidates } = generateCandidates(COMPETITOR_INPUT);
        for (const candidate of candidates) {
            if (candidate.generationMethod === 'competitor_gap_expansion') {
                expect(candidate.evidence).toContain('arab-flex.com');
                expect(candidate.evidence).toContain('https://arab-flex.com/cycle');
            }
        }
    });

    it('keeps a Google Ads reading under its own signal name and never calls it volume', () => {
        const { candidates } = generateCandidates({
            adsIdeas: [
                {
                    keyword: 'anabolic cycle dosage',
                    avgMonthlySearches: 8100,
                    language: 'en',
                    market: 'en-US',
                    sourceReference: 'ads:kwplanner',
                },
            ],
        });
        const fromAds = candidates.filter((c) => c.generationMethod === 'ads_idea_expansion');
        expect(fromAds.length).toBeGreaterThan(0);
        for (const candidate of fromAds) {
            expect(candidate.evidence).toContain('google_ads_historical_search_signal');
            expect(candidate.evidence).toContain('8100');
            expect(candidate.evidenceType).toBe('google_ads_url_seed_signal');
        }
    });

    it('labels GSC evidence as impressions rather than relabelling it volume', () => {
        const { candidates } = generateCandidates({
            gsc: [
                {
                    keyword: 'testosterone injection sites',
                    impressions: 4200,
                    language: 'en',
                    market: 'en-US',
                    sourceReference: 'gsc:2026-09-30',
                },
            ],
        });
        const fromGsc = candidates.filter((c) => c.generationMethod === 'gsc_impression_expansion');
        expect(fromGsc.length).toBeGreaterThan(0);
        for (const candidate of fromGsc) {
            expect(candidate.evidence).toContain('impressions=4200');
            expect(candidate.evidence).not.toContain('searchVolume');
        }
    });
});

describe('innovationEngine - determinism and idempotency', () => {
    it('produces identical output for identical input', () => {
        const first = generateCandidates(COMPETITOR_INPUT);
        const second = generateCandidates(COMPETITOR_INPUT);
        expect(second.candidates).toEqual(first.candidates);
    });

    it('produces a stable candidate id so a re-run upserts rather than duplicates', () => {
        const first = generateCandidates(COMPETITOR_INPUT).candidates;
        const second = generateCandidates(COMPETITOR_INPUT).candidates;
        expect(second.map((c: InnovationCandidate) => c.id)).toEqual(first.map((c) => c.id));
        for (const candidate of first) {
            expect(candidate.id).toContain(candidate.normalizedKeyword);
            expect(candidate.id).toContain(candidate.generationMethod);
        }
    });

    it('never re-proposes a keyword MRX already serves', () => {
        const { candidates } = generateCandidates({
            existingKeywords: [
                { keyword: 'macro calculator for bulking', language: 'en', market: 'en-US' },
            ],
        });
        for (const candidate of candidates) {
            expect(candidate.normalizedKeyword).not.toBe('macro calculator for bulking');
        }
    });

    it('emits no duplicate normalized keyword', () => {
        const { candidates } = generateCandidates({
            competitorGaps: [
                {
                    keyword: 'testosterone cycle guide',
                    language: 'en',
                    market: 'en-US',
                    domain: 'a.com',
                    sourceReference: 'https://a.com/1',
                },
                {
                    keyword: 'testosterone cycle guide',
                    language: 'en',
                    market: 'en-US',
                    domain: 'b.com',
                    sourceReference: 'https://b.com/2',
                },
            ],
        });
        const seen = new Set(candidates.map((c) => c.normalizedKeyword));
        expect(seen.size).toBe(candidates.length);
    });
});

describe('innovationEngine - language handling', () => {
    it('derives Arabic candidates from an Arabic parent and keeps them Arabic', () => {
        const { candidates } = generateCandidates({
            internalSearch: [{ keyword: 'حاسبة الماكروز للبتلينج', count: 7, language: 'ar', market: 'ar-EG' }],
        });
        expect(candidates.length).toBeGreaterThan(0);
        for (const candidate of candidates) {
            expect(candidate.language).toBe('ar');
            expect(candidate.market).toBe('ar-EG');
            expect(candidate.keyword).toMatch(/[\u0600-\u06FF]/);
        }
    });

    it('does not mix an English modifier into an Arabic parent', () => {
        const { candidates } = generateCandidates({
            internalSearch: [{ keyword: 'حاسبة الماكروز للبتلينج', count: 7, language: 'ar', market: 'ar-EG' }],
        });
        for (const candidate of candidates) {
            expect(candidate.keyword).not.toContain('for beginners');
            expect(candidate.keyword).not.toContain('step by step');
        }
    });
});
