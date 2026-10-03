/**
 * Phase 9 â€” the nine reports, proven.
 *
 * These assert the REPORT LAYER, which did not exist before this phase: of the
 * nine required reports only `source-health` had a route. The engines were
 * already tested; what was missing was the layer that turns them into rows a
 * reader can trust, and these tests pin the property that makes them
 * trustworthy: every row states what kind of evidence it is.
 */
import { describe, it, expect } from 'vitest';

import { BLOCKED_EXTERNAL_SOURCES } from '../../server/seo/refreshRuntime';
import { PROVIDER_ENV_VARS, type ProviderId } from '../../server/seo/sources/providerEnvironment';
import {
    ProviderRunner,
    DEFAULT_RETRY_POLICY,
    deriveRunVerdict,
} from '../../server/seo/sources/providerRunner';

describe('Phase 9 · blocked-source reasons name the credentials that are actually read', () => {
    const byProvider = new Map(BLOCKED_EXTERNAL_SOURCES.map((b) => [b.provider, b.dependency]));

    it('every listed provider is a real provider id', () => {
        for (const { provider } of BLOCKED_EXTERNAL_SOURCES) {
            expect(Object.keys(PROVIDER_ENV_VARS), provider).toContain(provider);
        }
    });

    it('every credential named in a reason is a variable the adapter reads', () => {
        // If a reason names a variable the seam never consults, the owner will
        // supply a credential that changes nothing — or worse, be told a
        // developer token is required when the v25 API ignores it entirely.
        for (const { provider, dependency } of BLOCKED_EXTERNAL_SOURCES) {
            const vars = PROVIDER_ENV_VARS[provider as ProviderId] ?? [];
            for (const match of dependency.matchAll(/\b[A-Z][A-Z0-9_]{4,}\b/g)) {
                const name = match[0];
                // Structural / operational reasons mention no variables at all.
                if (name.includes('API') && name.includes('ACCESS')) continue;
                expect(vars, `${provider} names ${name}`).toContain(name);
            }
        }
    });

    it('does not demand a Google Ads developer token, which v25 ignores', () => {
        const ads = byProvider.get('google_ads_keyword_planner') ?? '';
        expect(ads).not.toMatch(/DEVELOPER_TOKEN/);
        expect(PROVIDER_ENV_VARS.google_ads_keyword_planner).toEqual(
            expect.arrayContaining(['GOOGLE_ADS_CUSTOMER_ID', 'GOOGLE_ADS_REFRESH_TOKEN'])
        );
    });

    it('does not invent a credential for the credential-free providers', () => {
        for (const provider of ['common_crawl', 'competitor_web'] as const) {
            expect(PROVIDER_ENV_VARS[provider]).toEqual([]);
            expect(byProvider.get(provider)).toMatch(/no credential needed/i);
        }
    });
});

import {
    buildWeeklyDiscoveryReport,
    buildCompetitorIntelligenceReport,
    buildKeywordDemandReport,
    buildInternalSearchReport,
    buildTrendIntelligenceReport,
    buildInnovationReport,
    buildGapIntelligenceReport,
    buildDestinationCoverageReport,
    buildSourceHealthReport,
    findCrossMarketCollisions,
    findUnapprovedMarkets,
    type ReportEnvelope,
} from '../../server/seo/reports';

const NINE = [
    'weekly-discovery',
    'competitor-intelligence',
    'keyword-demand',
    'internal-search',
    'trend-intelligence',
    'innovation-opportunities',
    'gap-intelligence',
    'destination-coverage',
    'source-health',
] as const;

const envelopes = (): ReportEnvelope[] => [
    buildWeeklyDiscoveryReport({
        current: [
            { keyword: 'half life', language: 'en', market: 'en-US', year: 2026, week: 40, score: 90, rank: null, destination_path: '/x', trend_status: null },
            { keyword: 'new term', language: 'en', market: 'en-US', year: 2026, week: 40, score: 60, rank: null, destination_path: null, trend_status: null },
        ],
        previous: [
            { keyword: 'half life', language: 'en', market: 'en-US', year: 2026, week: 39, score: 70, rank: null, destination_path: '/x', trend_status: null },
        ],
    }),
    buildCompetitorIntelligenceReport({
        observations: [
            { keyword: 'half life', language: 'en', market: 'en-US', domain: 'competitor.com', hasFullText: true },
            { keyword: 'peptide', language: 'en', market: 'en-US', domain: 'other.com', hasFullText: false },
        ],
    }),
    buildKeywordDemandReport({
        demand: [
            { keyword: 'ads term', language: 'en', market: 'en-US', source: 'google_ads', dataKind: 'estimated', value: 5000 },
            { keyword: 'gsc term', language: 'en', market: 'en-US', source: 'gsc', dataKind: 'observed', value: 100 },
            { keyword: 'blocked term', language: 'en', market: 'en-US', source: 'bing', dataKind: 'unavailable', value: null },
        ],
    }),
    buildInternalSearchReport({
        entries: [{ query: 'ffmi calculator', count: 42 }, { query: 'peptide cycling', count: 7 }],
    }),
    buildTrendIntelligenceReport({
        rows: [
            { keyword: 'seasonal term', language: 'en', market: 'en-US', relativeInterest: 88, source: 'trends_csv' },
            { keyword: 'unknown term', language: 'en', market: 'en-US', relativeInterest: null, source: 'trends_csv' },
        ],
        officialApiAvailable: false,
    }),
    buildInnovationReport({
        existing: [{ keyword: 'half life', language: 'en', market: 'en-US' }],
        internalSearch: [{ query: 'how to calculate half life', count: 30 }],
    }),
    buildGapIntelligenceReport({
        mrxCoverage: [{ keyword: 'half life', market: 'en-US', language: 'en', signalCount: 1 }],
        competitorCoverage: [
            { keyword: 'competitor only', market: 'en-US', language: 'en', domain: 'c.com', sourceReference: 'https://c.com' },
        ],
        uncoveredDemand: [],
    }),
    buildDestinationCoverageReport({
        rows: [
            { keyword: 'mapped term', language: 'en', market: 'en-US', cluster: 'c', intent: 'informational', storedPath: '/guides/half-life' },
        ],
    }),
    buildSourceHealthReport(),
];

describe('Phase 9 Â· all nine reports exist and are well-formed', () => {
    it('produces exactly the nine required reports', () => {
        expect(envelopes().map((e) => e.report).sort()).toEqual([...NINE].sort());
    });

    it('every row carries a dataKind and a review flag', () => {
        for (const e of envelopes()) {
            for (const row of e.rows) {
                expect(
                    ['observed', 'estimated', 'generated', 'imported', 'unavailable'],
                    `${e.report}/${row.keyword}`
                ).toContain(row.dataKind);
                expect(typeof row.needsReview).toBe('boolean');
            }
        }
    });

    it('every report states what the reader may conclude', () => {
        for (const e of envelopes()) {
            expect(e.interpretation.length, e.report).toBeGreaterThan(20);
        }
    });

describe('Phase 9 · a dead provider is eventually skipped, not retried forever', () => {
    it('repeated total failures open the circuit', async () => {
        // Regression: recordFailure used to run only on the attempts that were
        // going to be retried, so a provider failing all maxAttempts recorded
        // maxAttempts-1 failures. With a threshold of 5 and 3 attempts the
        // circuit never opened and the runner called a dead host indefinitely.
        let clock = 0;
        const runner = new ProviderRunner({
            circuitThreshold: 3,
            policy: { ...DEFAULT_RETRY_POLICY, maxAttempts: 3, timeoutMs: 50 },
            sleep: async () => {},
            random: () => 0,
            now: () => clock,
        });

        const dead = async () => {
            throw new Error('fetch failed');
        };

        const first = await runner.run('dead', dead);
        expect(first.ok).toBe(false);
        // All 3 attempts counted, so the circuit reached the threshold.
        expect(runner.circuitStates().dead.consecutiveFailures).toBe(3);
        expect(runner.circuitStates().dead.state).toBe('open');

        // The next call is refused WITHOUT touching the provider.
        const second = await runner.run('dead', dead);
        expect(second.skippedByCircuit).toBe(true);
        expect(second.kind).toBe('circuit_open');
    });

    it('a provider that recovers closes its circuit again', async () => {
        let clock = 0;
        const runner = new ProviderRunner({
            circuitThreshold: 2,
            policy: { ...DEFAULT_RETRY_POLICY, maxAttempts: 2, timeoutMs: 50 },
            sleep: async () => {},
            random: () => 0,
            now: () => clock,
        });

        await runner.run('flaky', async () => {
            throw new Error('fetch failed');
        });
        expect(runner.circuitStates().flaky.state).toBe('open');

        // Advance past the reset window so a probe is admitted.
        clock += 60_000;
        const probe = await runner.run('flaky', async () => 'ok');
        expect(probe.ok).toBe(true);
        expect(runner.circuitStates().flaky.state).toBe('closed');
    });

    it('one provider failing does not prevent the others from running', async () => {
        const runner = new ProviderRunner({
            policy: { ...DEFAULT_RETRY_POLICY, maxAttempts: 1, timeoutMs: 50 },
            sleep: async () => {},
            random: () => 0,
        });

        const a = await runner.run('a', async () => 'A');
        const b = await runner.run('b', async () => {
            throw new Error('500 server error');
        });
        const c = await runner.run('c', async () => 'C');

        expect(a.ok).toBe(true);
        expect(b.ok).toBe(false);
        // The whole point: a dead provider degrades the run, it does not end it.
        expect(c.ok).toBe(true);

        const verdict = deriveRunVerdict([a, b, c], false);
        expect(verdict.status).toBe('PARTIAL_SUCCESS');
        expect(verdict.sourcesSucceeded).toBe(2);
        expect(verdict.sourcesFailed).toBe(1);
    });

    it('only a persistence failure forces FAILED', () => {
        const outcomes = [{ ok: true }, { ok: false }];
        expect(deriveRunVerdict(outcomes, false).status).toBe('PARTIAL_SUCCESS');
        expect(deriveRunVerdict(outcomes, true).status).toBe('FAILED');
    });
});

describe('Phase 9 Â· source-health never inflates its own evidence', () => {
    it('only a VERIFIED provider is reported as `observed`', () => {
        const e = buildSourceHealthReport();

        for (const row of e.rows) {
            // CONNECTED only proves credentials exist. Treating it as an
            // observation is how a report ends up claiming evidence it never
            // gathered, so the row must stay `unavailable` and flagged.
            if (row.dataKind === 'observed') {
                expect(row.needsReview, `${row.keyword} observed but flagged`).toBe(false);
            } else {
                expect(row.dataKind, `${row.keyword} unproven`).toBe('unavailable');
                expect(row.needsReview, `${row.keyword} must need review`).toBe(true);
            }
        }
    });

    it('the verifiedProviders summary equals the genuinely observed rows', () => {
        const e = buildSourceHealthReport();
        const observed = e.rows.filter((r) => r.dataKind === 'observed').length;
        expect(e.summary.verifiedProviders).toBe(observed);
    });

    it('an unproven environment reports zero verified providers, not a positive number', () => {
        // No provider can be VERIFIED without credentials and a live request, so
        // in CI this must be an honest zero rather than a flattering count.
        const e = buildSourceHealthReport();
        expect(e.summary.verifiedProviders).toBe(0);
    });
});

describe('Phase 9 Â· a missing metric is null, never a number', () => {
    it('keyword-demand keeps an unrunnable provider as null, not zero', () => {
        const e = buildKeywordDemandReport({
            demand: [
                { keyword: 'blocked', language: 'en', market: 'en-US', source: 'bing', dataKind: 'unavailable', value: null },
            ],
        });
        expect(e.rows[0].score).toBeNull();
        expect(e.rows[0].needsReview).toBe(true);
        expect(e.summary.unavailable).toBe(1);
    });

    it('Trends is an index and is never presented as a volume', () => {
        const e = buildTrendIntelligenceReport({
            rows: [
                { keyword: 't', language: 'en', market: 'en-US', relativeInterest: 88, source: 'trends_csv' },
            ],
            officialApiAvailable: false,
        });
        // 88 is a 0-100 index, not a volume.
        expect(e.rows[0].score).toBe(88);
        // A manual CSV export is `imported`. It is NOT `estimated` — nothing was
        // modelled — and it is certainly not `observed`, because no API call
        // was made. The adapter records the same kind, so the report agrees
        // with the layer that produced the data.
        expect(e.rows[0].dataKind).toBe('imported');
        expect(e.rows[0].dataKind).not.toBe('observed');
        expect(e.rows[0].dataKind).not.toBe('estimated');
        // And the structural blocker is stated rather than hidden.
        expect(e.degraded?.reason).toMatch(/no public API/i);
    });

    it('Trends only reports `observed` when a real official API produced it', () => {
        const e = buildTrendIntelligenceReport({
            rows: [
                { keyword: 't', language: 'en', market: 'en-US', relativeInterest: 88, source: 'trends_api', dataKind: 'observed' },
            ],
            officialApiAvailable: true,
        });
        expect(e.rows[0].dataKind).toBe('observed');
        expect(e.degraded).toBeUndefined();
    });

    it('competitor intelligence reports no traffic figure at all', () => {
        const e = buildCompetitorIntelligenceReport({
            observations: [
                { keyword: 'k', language: 'en', market: 'en-US', domain: 'c.com', hasFullText: true },
            ],
        });
        // We observed the page. We did not measure their traffic.
        expect(e.rows[0].score).toBeNull();
        expect(e.interpretation).toMatch(/no traffic/i);
    });
});

describe('Phase 9 Â· generated opportunities are never source-backed', () => {
    it('every innovation row is `generated`, null score, needs review', () => {
        const e = buildInnovationReport({
            existing: [{ keyword: 'half life', language: 'en', market: 'en-US' }],
            internalSearch: [{ query: 'how to calculate half life', count: 30 }],
        });
        for (const r of e.rows) {
            expect(r.dataKind).toBe('generated');
            expect(r.score).toBeNull();
            expect(r.needsReview).toBe(true);
        }
    });
});

describe('Phase 9 Â· market and language isolation holds in every report', () => {
    it('no row uses a market outside the approved seven', () => {
        expect(findUnapprovedMarkets(buildSourceHealthReport().rows)).toEqual([]);
        expect(
            findUnapprovedMarkets(buildInternalSearchReport({ entries: [{ query: 'q', count: 1 }] }).rows)
        ).toEqual([]);
    });

    it('a keyword in two markets is flagged, never silently merged', () => {
        const rows = [
            { keyword: 'half life', language: 'en' as const, market: 'en-US' as never, source: 's', dataKind: 'observed' as const, score: 80, destination: null, needsReview: false },
            { keyword: 'half life', language: 'en' as const, market: 'en-GB' as never, source: 's', dataKind: 'observed' as const, score: 82, destination: null, needsReview: false },
        ];
        const collisions = findCrossMarketCollisions(rows);
        expect(collisions).toHaveLength(1);
        expect(collisions[0].markets).toEqual(['en-GB', 'en-US']);
    });

    it('the same market twice is not a collision', () => {
        const rows = [
            { keyword: 'k', language: 'en' as const, market: 'en-US' as never, source: 's', dataKind: 'observed' as const, score: 1, destination: null, needsReview: false },
            { keyword: 'k', language: 'en' as const, market: 'en-US' as never, source: 's', dataKind: 'observed' as const, score: 2, destination: null, needsReview: false },
        ];
        expect(findCrossMarketCollisions(rows)).toEqual([]);
    });
});

describe('Phase 9 Â· no fabricated Verified anywhere', () => {
    it('source-health reports zero verified providers', () => {
        expect(buildSourceHealthReport().summary.verifiedProviders).toBe(0);
    });

    it('no provider row is labelled observed', () => {
        // No live provider request has been made, so nothing is evidence yet.
        expect(buildSourceHealthReport().rows.every((r) => r.dataKind !== 'observed')).toBe(true);
    });
});

});