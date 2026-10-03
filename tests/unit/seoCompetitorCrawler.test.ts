/**
 * tests/unit/seoCompetitorCrawler.test.ts
 * T5 — Politeness and honesty guarantees of the recovered competitor crawler.
 *
 * The crawler module was recovered after a mid-write crash, so this suite
 * re-proves its contract from the outside: robots.txt is obeyed, the throttle
 * floor cannot be weakened, retries are bounded, and NOTHING here can produce a
 * volume or confidence number.
 */
import { it, describe, expect } from 'vitest';

import {
    parseRobotsTxt,
    selectRobotsGroup,
    isUrlAllowed,
    resolveThrottleMs,
    extractPageSignals,
    deriveThemes,
    computeContentHash,
    resolveCrawlOptions,
    normalizeOrigin,
    MIN_THROTTLE_MS,
    MAX_ALLOWED_RETRIES,
    CLOSED_ROBOTS_POLICY,
    CURATED_COMPETITOR_SEEDS,
    COMPETITOR_CRAWLER_SOURCE,
} from '../../server/seo/sources/competitorCrawler';

const ROBOTS = `
User-agent: *
Disallow: /private/
Disallow: /admin
Crawl-delay: 5

User-agent: MrXSteroidResearchBot
Disallow: /nope/

Sitemap: https://example.com/sitemap.xml
`;

describe('T5 · robots.txt is obeyed, not guessed', () => {
    it('parses groups, directives and sitemaps', () => {
        const policy = parseRobotsTxt(ROBOTS);
        expect(policy.fetched).toBe(true);
        expect(policy.unavailable).toBe(false);
        expect(policy.groups.length).toBe(2);
        expect(policy.sitemaps).toEqual(['https://example.com/sitemap.xml']);
    });

    it('honours Disallow for the wildcard group', () => {
        const policy = parseRobotsTxt(ROBOTS);
        expect(isUrlAllowed('https://example.com/private/x', policy, 'SomeOtherBot/1.0')).toBe(false);
        expect(isUrlAllowed('https://example.com/public/x', policy, 'SomeOtherBot/1.0')).toBe(true);
    });

    it('refuses everything when robots.txt could not be read (fail closed)', () => {
        // An unreadable policy is NOT permission. This is the single most
        // important safety property of the whole crawler.
        expect(CLOSED_ROBOTS_POLICY.unavailable).toBe(true);
        expect(isUrlAllowed('https://example.com/anything', CLOSED_ROBOTS_POLICY, 'bot')).toBe(false);
    });

    it('selects the most specific matching group', () => {
        const policy = parseRobotsTxt(ROBOTS);
        const specific = selectRobotsGroup(policy, 'MrXSteroidResearchBot/1.0');
        expect(specific?.agents).toContain('MrXSteroidResearchBot');
        // The named group disallows /nope/, which the wildcard group allows.
        expect(isUrlAllowed('https://example.com/nope/x', policy, 'MrXSteroidResearchBot/1.0')).toBe(false);
    });

    it('reads Crawl-delay, and never faster than the hard floor', () => {
        const policy = parseRobotsTxt(ROBOTS);
        // A declared 5s is LONGER than our 1s floor, so it wins.
        expect(resolveThrottleMs(policy, 'OtherBot')).toBe(5000);

        const greedy = parseRobotsTxt('User-agent: *\nCrawl-delay: 0\n');
        // A declared 0s does NOT buy permission to exceed 1 req/s.
        expect(resolveThrottleMs(greedy, 'OtherBot')).toBe(MIN_THROTTLE_MS);
    });
});

describe('T5 · politeness bounds cannot be weakened by a caller', () => {
    const fetchImpl = (async () => new Response('')) as unknown as typeof fetch;

    it('rejects a sub-second throttle', () => {
        expect(() => resolveCrawlOptions({ fetchImpl, throttleMs: 10 })).toThrow(/throttleMs/);
    });

    it('rejects more than the allowed retries', () => {
        expect(() => resolveCrawlOptions({ fetchImpl, maxRetries: 9 })).toThrow(/maxRetries/);
    });

    it('requires an injected fetch, so no response is ever fabricated', () => {
        expect(() => resolveCrawlOptions({})).toThrow(/fetchImpl/);
    });

    it('clamps concurrency to serial regardless of the request', () => {
        const resolved = resolveCrawlOptions({ fetchImpl, maxConcurrency: 50 });
        expect(resolved.maxConcurrency).toBe(1);
        expect(MAX_ALLOWED_RETRIES).toBe(2);
    });

    it('normalises origins so www and case do not create a second throttle lane', () => {
        expect(normalizeOrigin('https://WWW.Example.com')).toBe(
            normalizeOrigin('https://example.com')
        );
    });
});

describe('T5 · extraction is tolerant and invents nothing', () => {
    const HTML = `
        <html lang="ar-EG">
        <head>
          <title>تحاليل الهرمونات | Best Site</title>
          <link rel="canonical" href="https://example.com/canonical">
        </head>
        <body>
          <h1>تحاليل قبل الكورس</h1>
          <h2>حماية الكبد</h2>
          <h3>متى أعمل تحاليل الهرمونات</h3>
          <script type="application/ld+json">
            {"@type":"FAQPage","mainEntity":{"@type":"Question"}}
          </script>
          <p>نص مرئي للتجربة.</p>
        </body></html>`;

    it('reads title, headings, canonical and lang', () => {
        const signals = extractPageSignals(HTML, 'https://example.com/page', 500);
        expect(signals.title).toContain('تحاليل الهرمونات');
        expect(signals.canonical).toBe('https://example.com/canonical');
        expect(signals.lang).toBe('ar-EG');
        expect(signals.h1).toContain('تحاليل قبل الكورس');
        expect(signals.h2).toContain('حماية الكبد');
    });

    it('survives malformed HTML without throwing', () => {
        expect(() => extractPageSignals('<html><h1>truncated', 'https://example.com/', 100)).not.toThrow();
        expect(() => extractPageSignals('', 'https://example.com/', 100)).not.toThrow();
    });

    it('produces NO volume, difficulty or confidence on a signal object', () => {
        const signals = extractPageSignals(HTML, 'https://example.com/page', 500) as Record<string, unknown>;
        // The type forbids these; assert the runtime shape agrees so a later
        // edit cannot quietly reintroduce a fabricated demand figure.
        expect(signals['searchVolume']).toBeUndefined();
        expect(signals['volume']).toBeUndefined();
        expect(signals['difficulty']).toBeUndefined();
        expect(signals['confidence']).toBeUndefined();
    });

    it('derives themes that are plain strings with no metric attached', () => {
        const signals = extractPageSignals(HTML, 'https://example.com/page', 500);
        const themes = deriveThemes(signals);
        expect(themes.length).toBeGreaterThan(0);
        for (const t of themes) expect(typeof t).toBe('string');
    });

    it('changes the content hash only when the text changes', () => {
        const a = computeContentHash('نص ثابت');
        expect(computeContentHash('نص ثابت')).toBe(a);
        expect(computeContentHash('نص آخر')).not.toBe(a);
    });
});

describe('T5 · curated seeds are seeds, not measurements', () => {
    it('declares the four Arabic competitors with no invented metrics', () => {
        const domains = CURATED_COMPETITOR_SEEDS.map((s) => s.domain);
        expect(domains).toEqual(
            expect.arrayContaining([
                'arab-flex.com',
                'mshawky.com',
                'abdallahtolba.com',
                'coachfathi.com',
            ])
        );
        for (const seed of CURATED_COMPETITOR_SEEDS) {
            expect(seed.startUrl.startsWith('https://')).toBe(true);
            expect((seed as Record<string, unknown>)['searchVolume']).toBeUndefined();
        }
    });

    it('exposes a stable source key', () => {
        expect(COMPETITOR_CRAWLER_SOURCE).toBe('competitor_crawler');
    });
});
