/**
 * server/seo/sources/googleTrendsAdapter.ts — Google Trends (NEW, STEP 5-6).
 *
 * =============================================================
 * DOC VERIFICATION (fetched and read before implementation)
 * =============================================================
 * (e) DOES AN OFFICIAL API EXIST? Fetched the official page:
 *     https://developers.google.com/search/apis/trends
 *     Title: "Google Trends API Alpha". Body: "We're now accepting
 *     applications for alpha testers." / "Our focus with the alpha test is to
 *     verify functionality and gather feedback from a limited set of
 *     developers. As we can't open the API for everyone yet..."
 *     => There is NO publicly available Google Trends API. It is closed alpha,
 *        invite-only. So the OFFICIAL_API mode below is structurally BLOCKED
 *        and must stay that way until an invitation exists. This adapter does
 *        NOT scrape trends.google.com, does NOT reverse-engineer the internal
 *        /trends/explore endpoint, and does NOT ship any HTML/cookie trickery.
 *        MANUAL_CSV is therefore the ONLY working mode today.
 *
 * =============================================================
 * THE ONE RULE THAT MATTERS HERE
 * =============================================================
 * Google Trends reports RELATIVE interest on a 0-100 scale, normalised against
 * the highest point of the selected comparison set. It is not a count, not a
 * volume, and not an estimate of absolute demand. This adapter therefore writes
 * ONLY `trendsRelativeInterest`, and there is deliberately no conversion
 * function anywhere in this file. `dataKind` is 'imported' (or 'observed' in
 * official mode) — never 'estimated', because a scaled index is not a
 * modelled quantity either.
 */

import {
    AdapterRunResult,
    BlockedReason,
    ProviderDescriptor,
    SearchIntelRecord,
    blockedResult,
    failedResult,
} from './searchIntelligenceTypes';
import { Market, SourceLanguage, emptyKeywordMetrics } from './types';

export const GOOGLE_TRENDS_DOC_URL =
    'https://developers.google.com/search/apis/trends';

export const GOOGLE_TRENDS_PROVIDER = {
    provider: 'google_trends',
    sourceClass: 'SEARCH_INTELLIGENCE',
    languages: ['en', 'ar'],
    markets: ['ar-EG', 'en-US', 'en-GB'],
    // No credentials can be configured, because no public endpoint exists.
    requiredEnv: [],
    docUrl: GOOGLE_TRENDS_DOC_URL,
} as const satisfies ProviderDescriptor;

/** Which implementation path a caller asked for. */
export type GoogleTrendsMode = 'OFFICIAL_API' | 'MANUAL_CSV';

/** A parsed CSV row: one keyword plus its 0-100 interest value. */
export interface GoogleTrendsCsvRow {
    keyword: string;
    relativeInterest: number;
}

/**
 * An OFFICIAL_API run needs an alpha grant that does not exist publicly.
 * Returns the exact reason so the admin health view can show it.
 */
export function officialApiBlockedReason(): BlockedReason {
    return {
        dependency: 'Google Trends API alpha access (no public endpoint)',
        kind: 'no_public_api',
        detail:
            'as documented at developers.google.com/search/apis/trends, the Google Trends API is a closed alpha accepting applications from a limited set of developers and is not open to everyone; without an accepted alpha invitation there is no documented endpoint to call. MANUAL_CSV import is the only supported mode. No scraping fallback is implemented by design',
    };
}

/**
 * Parse a Google Trends CSV export.
 *
 * The UI export is a single keyword column plus one interest column (0-100),
 * sometimes with a header row. Both shapes are handled; anything unparseable
 * is SKIPPED, never coerced to 0. Coercing a blank to 0 would assert "no
 * interest at all", which is a fabricated observation.
 */
export function parseTrendsCsv(
    csv: string,
    context: {
        language: SourceLanguage;
        market: Market;
        retrievedAt: string;
        metricsDate?: string;
        sourceName?: string;
    },
): SearchIntelRecord[] {
    const lines = csv
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    const records: SearchIntelRecord[] = [];
    const metricsDate = context.metricsDate ?? context.retrievedAt.slice(0, 10);

    for (const line of lines) {
        // The UI export uses a comma; be tolerant of a tab-separated paste.
        const cells = line.includes('\t')
            ? line.split('\t')
            : line.split(',');
        const keyword = (cells[0] ?? '').trim().replace(/^"|"$/g, '');
        if (!keyword) continue;
        // Skip a header row like `Keyword` / `Interest`.
        if (/^keyword$/i.test(keyword)) continue;

        const raw = (cells[cells.length - 1] ?? '')
            .trim()
            .replace(/^"|"$/g, '');
        const interest = normalizeRelativeInterest(Number(raw));
        if (interest === null) continue;

        records.push({
            keyword,
            language: context.language,
            market: context.market,
            source: GOOGLE_TRENDS_PROVIDER.provider,
            sourceType: 'google_trends_csv',
            sourceClass: 'SEARCH_INTELLIGENCE',
            sourceStatus: 'CONNECTED',
            sourceReference: `googleTrends:manual_csv:${context.sourceName ?? 'export'}:${keyword}`,
            discoveredAt: context.retrievedAt,
            // Imported: a human exported it, we did not call an endpoint.
            dataKind: 'imported',
            evidence: `Google Trends CSV export row="${keyword}" interest=${interest} (relative 0-100)`,
            evidenceType: 'imported_serp_export',
            metricsDate,
            retrievedAt: context.retrievedAt,
            metrics: {
                ...emptyKeywordMetrics(),
                trendsRelativeInterest: interest,
            },
            attribution: {
                // The scale, stated on every record, so no downstream consumer
                // can read this number as a count.
                scale: 'relative_0_100',
                isAbsoluteVolume: false,
                sourceMode: 'MANUAL_CSV',
                exportName: context.sourceName ?? null,
            },
        });
    }
    return records;
}

export interface GoogleTrendsConfig {
    now?: () => Date;
    /** Present for interface symmetry; OFFICIAL_API never issues a request. */
    fetchImpl?: typeof fetch;
}

export interface GoogleTrendsQuery {
    mode: GoogleTrendsMode;
    language: SourceLanguage;
    market: Market;
    /** Raw CSV text for MANUAL_CSV mode. */
    csv?: string;
    /** Name of the export, recorded as evidence. */
    sourceName?: string;
    /** The period the export covers. */
    metricsDate?: string;
    signal?: AbortSignal;
}

/**
 * Run the adapter in either mode.
 *
 * OFFICIAL_API always returns BLOCKED with the exact missing dependency.
 * MANUAL_CSV needs no credentials and never performs network I/O.
 */
export async function collectGoogleTrends(
    query: GoogleTrendsQuery,
    config: GoogleTrendsConfig = {},
): Promise<AdapterRunResult<SearchIntelRecord>> {
    if (query.mode === 'OFFICIAL_API') {
        // Unconditional: there is no documented public endpoint to call, so no
        // amount of configuration would make this mode runnable.
        return blockedResult<SearchIntelRecord>(
            GOOGLE_TRENDS_PROVIDER.provider,
            officialApiBlockedReason(),
        );
    }

    const now = config.now ? config.now() : new Date();
    const retrievedAt = now.toISOString();

    if (typeof query.csv !== 'string' || query.csv.trim().length === 0) {
        return failedResult<SearchIntelRecord>(
            GOOGLE_TRENDS_PROVIDER.provider,
            'missing_dependency: no CSV content supplied for MANUAL_CSV mode; export the 0-100 relative interest values from Google Trends and pass them as `csv`',
        );
    }

    const records = parseTrendsCsv(query.csv, {
        language: query.language,
        market: query.market,
        retrievedAt,
        metricsDate: query.metricsDate,
        sourceName: query.sourceName,
    });

    return {
        provider: GOOGLE_TRENDS_PROVIDER.provider,
        status: 'CONNECTED',
        dataKind: 'imported',
        records,
        partial: false,
    };
}

/** Resolve why OFFICIAL_API mode cannot run. Always blocked, today. */
export function resolveOfficialApiBlocked(): BlockedReason | null {
    return officialApiBlockedReason();
}

/** Clamp a value into the documented 0-100 band, or null if not a number. */
export function normalizeRelativeInterest(value: unknown): number | null {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    if (value < 0 || value > 100) return null;
    return value;
}
