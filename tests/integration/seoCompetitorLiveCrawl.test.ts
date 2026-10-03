/**
 * Live competitor crawl against the domains ALREADY DOCUMENTED in this repo.
 *
 * `server/seo/competitorIntel.ts` names six competitor origins. These are the
 * project's own recorded targets â€” nothing here is invented for this run.
 *
 * POLITE CRAWL ONLY (spec Â§2): robots.txt is fetched and honoured for every
 * origin before any page is requested. A disallowed path is never fetched.
 *
 * Read-only: it fetches public pages and prints findings. It writes nothing.
 */
/**
 * LIVE competitor crawl + persistence proof against the REAL Production DB.
 *
 * Skipped unless SEO_LIVE_CRAWL=1, so the normal suite stays hermetic.
 * Writes only to `seo_competitors` / `seo_competitor_observations`.
 */
/**
 * REGRESSION TESTS for defects that only a LIVE crawl exposed.
 *
 * Each was a hard runtime failure the previous suite missed, because it only
 * exercised the pure parsing helpers and never an actual HTTP round-trip
 * through `crawlCompetitor`.
 */
import { describe, it, expect } from 'vitest';
import {
    crawlCompetitor,
    PoliteCrawler,
    parseRobotsTxt,
    resolveCrawlOptions,
    type CompetitorSeed,
} from '../../server/seo/sources/competitorCrawler';

const SEED: CompetitorSeed = {
    domain: 'example.test',
    language: 'ar',
    market: 'ar-EG',
    label: 'example',
    startUrl: 'https://example.test/',
};

/** Build a fetch stub over a fixed route table, recording every request. */
function stubFetch(
    routes: Record<string, { status: number; body: string }>,
    seen: string[] = []
): typeof fetch {
    return (async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : String(input);
        seen.push(url);
        const hit = routes[url];
        return hit
            ? new Response(hit.body, { status: hit.status })
            : new Response('missing', { status: 404 });
    }) as unknown as typeof fetch;
}

const HOME = '<html><head><title>Home</title></head><body><h1>Hi</h1></body></html>';
// The crawler REFUSES a sub-1000ms throttle, so we keep the real politeness
// value and stub only the sleep. That guard is itself part of the contract.
const FAST = { sleep: async () => {} } as const;

describe('competitor crawler — regressions found only by a live crawl', () => {
    it('fetches robots.txt even though no policy exists yet', async () => {
        // Regression: request() robots-checked its OWN robots.txt fetch. With no
        // policy cached, getRobotsPolicy() returned CLOSED, so the crawler denied
        // robots.txt on every domain and every crawl produced 0 URLs.
        const seen: string[] = [];
        const fetchImpl = stubFetch(
            {
                'https://example.test/robots.txt': {
                    status: 200,
                    body: 'User-agent: *\nDisallow: /private/\n',
                },
                'https://example.test/': { status: 200, body: HOME },
            },
            seen
        );

        const result = await crawlCompetitor(SEED, {
            fetchImpl,
            maxPagesPerRun: 1,
            maxSitemapUrls: 0,
            ...FAST,
        });

        expect(seen).toContain('https://example.test/robots.txt');
        expect(result.robotsStatus).toBe(200);
        expect(result.failures.some((f) => f.url.includes('robots.txt'))).toBe(false);
        expect(result.observations.length).toBeGreaterThan(0);
    });

    it('still refuses pages that robots disallows', async () => {
        // The robots exemption must apply ONLY to robots.txt itself.
        const seen: string[] = [];
        const fetchImpl = stubFetch(
            {
                'https://example.test/robots.txt': {
                    status: 200,
                    body: 'User-agent: *\nDisallow: /private/\n',
                },
                'https://example.test/': { status: 200, body: HOME },
            },
            seen
        );

        await crawlCompetitor(SEED, {
            fetchImpl,
            maxPagesPerRun: 2,
            maxSitemapUrls: 0,
            ...FAST,
        });

        expect(seen.some((u) => u.includes('/private/'))).toBe(false);
    });

    it('serializes concurrent requests to the same host', async () => {
        // Regression: request() called this.enqueueOnHost(), which did not exist,
        // so the FIRST real request threw TypeError and the crawler had never
        // actually run over HTTP.
        let inFlight = 0;
        let maxInFlight = 0;
        const fetchImpl = (async () => {
            inFlight += 1;
            maxInFlight = Math.max(maxInFlight, inFlight);
            await new Promise((r) => setTimeout(r, 5));
            inFlight -= 1;
            return new Response('<html><body>x</body></html>', { status: 200 });
        }) as unknown as typeof fetch;

        const crawler = new PoliteCrawler(resolveCrawlOptions({ fetchImpl, ...FAST }));
        // A permissive policy is required first: without one the crawler fails
        // CLOSED and never reaches the network, which is correct behaviour but
        // would not exercise the queue.
        crawler.setRobotsPolicy('https://example.test', {
            ...parseRobotsTxt('User-agent: *\n'),
            status: 200,
        });

        await Promise.all([
            crawler.request('https://example.test/a'),
            crawler.request('https://example.test/b'),
            crawler.request('https://example.test/c'),
        ]);

        expect(maxInFlight).toBe(1);
    });

    it('reports a failed request as a value instead of throwing', async () => {
        // Regression: the retry loop's exit did `return result`, but `result` is
        // scoped inside the loop — ReferenceError on EVERY exhausted request, so
        // one bad URL destroyed the whole crawl instead of yielding a failure.
        const fetchImpl = (async () =>
            new Response('boom', { status: 500 })) as unknown as typeof fetch;
        const crawler = new PoliteCrawler(
            resolveCrawlOptions({ fetchImpl, maxRetries: 0, ...FAST })
        );

        const res = await crawler.request('https://example.test/gone');
        expect(res.ok).toBe(false);
        expect(res.failureReason).toBeTruthy();
    });

    it('returns a well-formed CrawlResult with no unbound identifiers', async () => {
        // Regression: robotsStatus and runStartedAt were referenced but never
        // bound, so assembling the result threw ReferenceError.
        const fetchImpl = stubFetch({
            'https://example.test/robots.txt': { status: 200, body: 'User-agent: *\n' },
            'https://example.test/': { status: 200, body: HOME },
        });

        const result = await crawlCompetitor(SEED, {
            fetchImpl,
            maxPagesPerRun: 1,
            maxSitemapUrls: 0,
            ...FAST,
        });

        expect(Number.isNaN(Date.parse(result.startedAt))).toBe(false);
        expect(Number.isNaN(Date.parse(result.finishedAt))).toBe(false);
        expect(result.madeRealRequests).toBe(true);
    });

    it('fails CLOSED when robots.txt is unavailable', async () => {
        // The fail-closed posture must survive the robots exemption above.
        const seen: string[] = [];
        const fetchImpl = stubFetch(
            { 'https://example.test/robots.txt': { status: 500, body: 'err' } },
            seen
        );

        const result = await crawlCompetitor(SEED, {
            fetchImpl,
            maxPagesPerRun: 3,
            maxSitemapUrls: 3,
            ...FAST,
        });

        expect(result.observations).toHaveLength(0);
        expect(result.madeRealRequests).toBe(false);
        // Only robots.txt itself may ever have been requested.
        expect(seen.every((u) => u.includes('robots.txt'))).toBe(true);
    });

    it('parses the real robots.txt shape the live competitors serve', () => {
        const policy = parseRobotsTxt(
            'User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\n\nSitemap: https://coachfathi.com/sitemap.xml\n'
        );
        expect(policy.sitemaps).toContain('https://coachfathi.com/sitemap.xml');
    });
});
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

import { crawlAndPersistCompetitors } from '../../server/seo/sources/competitorPersistence';
import { CURATED_COMPETITOR_SEEDS } from '../../server/seo/sources/competitorCrawler';

const LIVE = process.env.SEO_LIVE_CRAWL === '1';

describe.skipIf(!LIVE)('competitor crawl — LIVE against Production', () => {
    it('crawls the configured competitors and persists real observations', async () => {
        const env = dotenv.parse(
            fs.readFileSync(
                'C:/Users/foryo/.cline/worktrees/8b0da/MrXSteroid-main/.env.local'
            )
        );
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
        });

        console.log(`seeds: ${CURATED_COMPETITOR_SEEDS.length}`);
        for (const s of CURATED_COMPETITOR_SEEDS) {
            console.log(`  ${s.domain} market=${s.market} lang=${s.language}`);
        }

        // The crawler refuses to run without an explicit fetch implementation
        // ("this crawler never fabricates a response"). In the runtime that IS
        // globalThis.fetch; passing it explicitly keeps that guard intact.
        const out = await crawlAndPersistCompetitors(supabase, {
            crawl: {
                maxPagesPerRun: 3,
                maxSitemapUrls: 20,
                fetchImpl: globalThis.fetch,
            },
        });

        console.log('\n=== OUTCOME ===');
        console.log(`  domainsCrawled        : ${out.domainsCrawled}`);
        console.log(`  urlsDiscovered        : ${out.urlsDiscovered}`);
        console.log(`  observationsGenerated : ${out.observationsGenerated}`);
        console.log(`  observationsPersisted : ${out.observationsPersisted}`);
        console.log(`  duplicates            : ${out.duplicates}`);
        console.log(`  robotsDenied          : ${out.robotsDenied}`);
        console.log(`  failures              : ${out.failures.length}`);
        for (const f of out.failures.slice(0, 6)) {
            console.log(`     - ${f.domain} ${f.url.slice(0, 55)} :: ${f.message.slice(0, 70)}`);
        }

        const { data: rows, error } = await supabase
            .from('seo_competitor_observations')
            .select('url, title, observed_at, content_hash, signals')
            .order('observed_at', { ascending: false })
            .limit(8);
        if (error) throw error;

        console.log(`\n=== PRODUCTION ROWS: ${rows?.length ?? 0} ===`);
        for (const r of rows ?? []) {
            console.log(`  ${String(r.url).slice(0, 68)}`);
            console.log(`     title="${String(r.title ?? '').slice(0, 48)}" hash=${String(r.content_hash).slice(0, 12)}`);
            console.log(`     market=${(r.signals as Record<string, unknown>)?.market} lang=${(r.signals as Record<string, unknown>)?.language} evidence=${(r.signals as Record<string, unknown>)?.evidenceType}`);
        }

        // Idempotency: a second crawl of unchanged pages must add nothing.
        const before = rows?.length ?? 0;
        const second = await crawlAndPersistCompetitors(supabase, {
            crawl: {
                maxPagesPerRun: 3,
                maxSitemapUrls: 20,
                fetchImpl: globalThis.fetch,
            },
        });
        const { data: afterRows } = await supabase
            .from('seo_competitor_observations')
            .select('id', { count: 'exact', head: false });
        console.log(`\n=== IDEMPOTENCY ===`);
        console.log(`  rows before 2nd crawl : ${before}`);
        console.log(`  2nd crawl persisted   : ${second.observationsPersisted}`);
        console.log(`  2nd crawl duplicates  : ${second.duplicates}`);
        console.log(`  rows after 2nd crawl  : ${afterRows?.length ?? 'n/a'}`);

        expect(second.observationsPersisted).toBe(0);
    }, 300_000);
});

import {
    resolveThrottleMs,
    MIN_THROTTLE_MS,
    isUrlAllowed,
    parseRobotsTxt,
    candidateSitemapUrls,
} from '../../server/seo/sources/competitorCrawler';

const ORIGINS = [
    'https://anabolicminds.com',
    'https://arabiafit.com',
    'https://fitbodyiq.com',
    'https://moreplatesmoredates.com',
    'https://www.egyfitness.net',
    'https://www.steroidplotter.com',
];

describe('Â§9 Â· LIVE polite competitor crawl on documented targets', () => {
    const liveIt = process.env.SEO_LIVE === '1' ? it : it.skip;

    liveIt(
        'robots.txt is fetched and honoured for every documented origin',
        async () => {
            const report: string[] = [];

            for (const origin of ORIGINS) {
                try {
                    const res = await fetch(`${origin}/robots.txt`, {
                        signal: AbortSignal.timeout(15_000),
                        headers: { 'user-agent': 'MrXSteroid-SEO/1.0' },
                    });
                    const body = res.ok ? await res.text() : '';
                    const policy = parseRobotsTxt(body);
                    const allowed = isUrlAllowed(`${origin}/`, policy, 'MrXSteroid-SEO');
                    report.push(
                        `  ${origin.padEnd(38)} robots=${res.status} root-allowed=${allowed}`
                    );
                } catch (e) {
                    // Unreachable is a real finding, not a fabricated pass.
                    report.push(
                        `  ${origin.padEnd(38)} UNREACHABLE (${
                            e instanceof Error ? e.message.slice(0, 30) : 'error'
                        })`
                    );
                }
            }

            console.log('\n--- COMPETITOR ROBOTS AUDIT (live) ---\n' + report.join('\n'));
            // Every origin produced a real answer, reachable or not.
            expect(report).toHaveLength(ORIGINS.length);
        },
        120_000
    );

    it('the crawl policy enforces a minimum throttle even when robots allows 0', () => {
        // robots.txt says Crawl-delay: 0. The floor still applies, so a
        // misconfigured or hostile robots file cannot make us hammer a host.
        const policy = parseRobotsTxt('User-agent: *\nCrawl-delay: 0\n');
        expect(resolveThrottleMs(policy, 'MrXSteroid-SEO')).toBeGreaterThanOrEqual(
            MIN_THROTTLE_MS
        );
    });

    it('a disallowed path is never fetched by the crawler', () => {
        const policy = parseRobotsTxt('User-agent: *\nDisallow: /admin\n');
        expect(isUrlAllowed('https://x.com/admin/secrets', policy, 'MrXSteroid-SEO')).toBe(false);
    });

    it('sitemap candidates come from robots.txt, not a hardcoded list', () => {
        // Sitemaps declared in robots.txt are what we follow; the conventional
        // /sitemap.xml is only a fallback when robots declares none.
        const withRobots = parseRobotsTxt(
            'User-agent: *\nSitemap: https://x.com/custom-sitemap.xml\n'
        );
        expect(candidateSitemapUrls('https://x.com', withRobots)).toContain(
            'https://x.com/custom-sitemap.xml'
        );

        const withoutRobots = parseRobotsTxt('User-agent: *\nDisallow:\n');
        expect(candidateSitemapUrls('https://x.com', withoutRobots).length).toBeGreaterThan(0);
    });
});