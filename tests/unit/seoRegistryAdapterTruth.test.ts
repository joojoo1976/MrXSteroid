/**
 * tests/unit/seoRegistryAdapterTruth.test.ts
 * STEP 14 follow-up — REGRESSION GUARD for registry honesty.
 *
 * The bug this prevents: the registry claimed "no adapter file exists" for
 * `competitor_web` and `csv_import` while both adapters were present and
 * tested. That is a truthfulness failure in the OPPOSITE direction — it
 * understates real work — and is just as misleading as overstating it.
 *
 * Rule asserted: when an adapter file exists on disk, the registry may NOT say
 * the adapter is missing.
 */
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { sourceRegistry } from '../../server/seo/sources/registry';

const health = sourceRegistry.getSourceHealth();
const byProvider = new Map(health.map((h) => [h.provider, h]));

/** Adapter files that genuinely exist in this repository. */
const ADAPTER_FILES: Record<string, string> = {
    google_search_console: 'server/seo/sources/gscAdapter.ts',
    google_ads_keyword_planner: 'server/seo/sources/googleAdsAdapter.ts',
    google_trends: 'server/seo/sources/googleTrendsAdapter.ts',
    bing_web_search: 'server/seo/sources/bingAdapter.ts',
    common_crawl: 'server/seo/sources/commonCrawlAdapter.ts',
    competitor_web: 'server/seo/sources/competitorCrawler.ts',
    csv_import: 'server/seo/sources/csvImportPipeline.ts',
};

describe('registry · an existing adapter is never described as missing', () => {
    it('precondition: every listed adapter file is really on disk', () => {
        // If this fails, the rest of the suite is meaningless.
        for (const [provider, file] of Object.entries(ADAPTER_FILES)) {
            expect(existsSync(resolve(process.cwd(), file)), `${provider} -> ${file}`).toBe(true);
        }
    });

    it.each(Object.entries(ADAPTER_FILES))('%s does not claim a missing adapter', (provider) => {
        const entry = byProvider.get(provider);
        expect(entry, `${provider} must be registered`).toBeTruthy();
        const reason = (entry!.blocked_reason ?? '').toLowerCase();
        // These phrases asserted non-existence. They are now false statements.
        expect(reason).not.toMatch(/no\s+(\w+\s+){0,2}adapter (file )?(exists|has been written)/);
        expect(reason).not.toMatch(/adapter is unimplemented/);
    });

    it.each(Object.entries(ADAPTER_FILES))(
        '%s is at least IMPLEMENTED when its adapter exists',
        (provider) => {
            const entry = byProvider.get(provider);
            expect(entry, `${provider} must be registered`).toBeTruthy();
            expect(['IMPLEMENTED', 'CONFIGURED', 'CONNECTED', 'VERIFIED']).toContain(entry!.status);
        }
    );

    it('still refuses to claim VERIFIED for anything', () => {
        // Raising a status to IMPLEMENTED must not drift into VERIFIED.
        for (const provider of Object.keys(ADAPTER_FILES)) {
            expect(byProvider.get(provider)!.status).not.toBe('VERIFIED');
        }
    });

    it('still reports an exact blocked reason for every unverified source', () => {
        for (const provider of Object.keys(ADAPTER_FILES)) {
            const entry = byProvider.get(provider)!;
            if (entry.status === 'IMPLEMENTED' || entry.status === 'VERIFIED') continue;
            expect(entry.blocked_reason, `${provider} needs a stated reason`).toBeTruthy();
        }
    });
});

describe('registry · market-aware identity reaches the runtime helper', () => {
    it('resolves a real market and reports a defaulted one', async () => {
        const { marketOf, marketWasDefaulted } = await import('../../server/seo/refreshRuntime');

        expect(marketOf({ locale: 'ar-SA' })).toBe('ar-SA');
        expect(marketOf({ market: 'en-GB' })).toBe('en-GB');
        // A bare language is NOT a market; it falls back and is REPORTED.
        expect(marketWasDefaulted({ locale: 'ar' })).toBe(true);
        expect(marketWasDefaulted({ locale: 'ar-EG' })).toBe(false);
    });
});
