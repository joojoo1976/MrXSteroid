/**
 * server/seo/refreshRuntime.ts
 * The runtime adapter that binds the weekly engine and the historical diff to
 * the real refresh route.
 *
 * WHY A SEPARATE FILE
 * -------------------
 * `weeklyEngine` and `snapshotDiff` are pure and dependency-injected: neither
 * imports Supabase. That is what made them testable, but it also meant nothing
 * in the runtime ever CALLED them — the chain was open. This module is the seam
 * that closes it, and it keeps all Supabase knowledge in exactly one place.
 *
 * HONESTY RULES ENFORCED HERE
 * ---------------------------
 *  - No provider network call is ever made. Every external source is reported
 *    BLOCKED with the exact missing dependency, because none has credentials.
 *  - The persister is idempotent: it upserts on (keyword_id, year, week,
 *    market), so re-running writes the same rows instead of duplicates.
 *  - A DB write failure returns `ok: false`, the ONLY condition that finalizes
 *    a weekly run FAILED.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Market, SourceLanguage } from './sources/types';
import type { PersistOutcome, PersistRow, WeeklyPersister } from './weeklyEngine';

const SUPPORTED_MARKETS = new Set([
    'ar-EG',
    'ar-SA',
    'ar-AE',
    'en-US',
    'en-GB',
    'en-CA',
    'en-AU',
]);

/**
 * The market a persisted row belongs to.
 *
 * Resolution is strict: a row carrying no recognised country resolves to the
 * documented default rather than being invented per-row. `marketWasDefaulted`
 * lets the caller report how many rows were defaulted instead of hiding it.
 */
export function marketOf(row: {
    locale?: unknown;
    market?: unknown;
    country_code?: unknown;
}): Market {
    for (const candidate of [row.market, row.country_code, row.locale]) {
        const value = String(candidate ?? '').trim();
        if (SUPPORTED_MARKETS.has(value)) return value as Market;
    }
    return 'en-US';
}

/** True when a row had to fall back to the default market. */
export function marketWasDefaulted(row: {
    locale?: unknown;
    market?: unknown;
    country_code?: unknown;
}): boolean {
    for (const candidate of [row.market, row.country_code, row.locale]) {
        if (SUPPORTED_MARKETS.has(String(candidate ?? '').trim())) return false;
    }
    return true;
}

/**
 * External sources that cannot run today, each with its EXACT missing dependency.
 *
 * These strings are a contract with the operator: they must name the real
 * variable the adapter actually reads, or the owner will go hunting for a
 * credential that is not consulted (or will be told to supply one that is).
 * They are therefore asserted against `PROVIDER_ENV_VARS` in
 * `tests/unit/seoProviderResilience.test.ts`.
 *
 * Note what is NOT here: a Google Ads developer token. Google sunset developer
 * tokens on 2026-09-09 and the v25 API IGNORES the header, so listing one would
 * send the owner to renew a credential that no longer gates anything. Common
 * Crawl and competitor crawling likewise need no credential at all — they are
 * reachable with no secrets, and are blocked only on a completed run.
 */
export const BLOCKED_EXTERNAL_SOURCES: ReadonlyArray<{
    provider: string;
    dependency: string;
}> = [
    { provider: 'google_search_console', dependency: 'GSC_SITE_URL + GSC_ACCESS_TOKEN' },
    {
        provider: 'google_ads_keyword_planner',
        dependency: 'GOOGLE_ADS_CUSTOMER_ID + GOOGLE_ADS_CLIENT_ID + GOOGLE_ADS_CLIENT_SECRET + GOOGLE_ADS_REFRESH_TOKEN',
    },
    { provider: 'bing_web_search', dependency: 'BING_WEBMASTER_SITE_URL + BING_WEBMASTER_API_KEY' },
    { provider: 'google_trends', dependency: 'Google Trends official API access (closed alpha)' },
    { provider: 'common_crawl', dependency: 'no credential needed; requires a live index run' },
    { provider: 'competitor_web', dependency: 'no credential needed; requires a completed robots-compliant crawl' },
    { provider: 'csv_import', dependency: 'an uploaded provider CSV file' },
];

/** Shape of a persisted weekly-state row, mirrored locally for typing. */
export interface WeeklyStateRow {
    keyword_id: string;
    keyword: string;
    language: SourceLanguage;
    market: Market;
    year: number;
    week: number;
    score: number | null;
    rank: number | null;
    trend_status: string | null;
    destination_path: string | null;
}


/**
 * Read the PREVIOUS ISO week's persisted state, so COMPARE_WITH_HISTORY and the
 * snapshot diff operate on real history rather than an assumption.
 *
 * A missing table or missing rows is NOT a failure: it means there is no history
 * yet, and the caller reports that honestly instead of inventing a trend.
 */
export async function readPreviousWeekStates(
    supabase: SupabaseClient,
    year: number,
    weekNumber: number
): Promise<WeeklyStateRow[]> {
    const previousWeek = weekNumber > 1 ? weekNumber - 1 : 52;
    const previousYear = weekNumber > 1 ? year : year - 1;

    const { data } = await supabase
        .from('seo_keyword_weekly_states')
        .select('keyword_id, keyword, language, market, year, week, score, rank, trend_status, destination_path')
        .eq('year', previousYear)
        .eq('week', previousWeek);

    const rows: WeeklyStateRow[] = [];
    for (const row of data ?? []) {
        rows.push({
            keyword_id: String(row.keyword_id ?? ''),
            keyword: String(row.keyword ?? ''),
            language: (row.language === 'ar' ? 'ar' : 'en') as SourceLanguage,
            market: marketOf(row as never),
            year: Number(row.year ?? previousYear),
            week: Number(row.week ?? previousWeek),
            score: row.score == null ? null : Number(row.score),
            rank: row.rank == null ? null : Number(row.rank),
            trend_status: row.trend_status ?? null,
            destination_path: row.destination_path ?? null,
        });
    }
    return rows;
}

/** Turn persisted prior-week rows into the engine's history snapshot. */
export function toHistorySnapshot(rows: readonly WeeklyStateRow[]): {
    previousScores: Map<string, number>;
    year?: number;
    weekNumber?: number;
} {
    const previousScores = new Map<string, number>();
    for (const row of rows) {
        if (row.score == null) continue;
        previousScores.set(`${row.market}::${row.keyword.toLowerCase()}`, Number(row.score));
    }
    const first = rows[0];
    return {
        previousScores,
        year: first?.year,
        weekNumber: first?.week,
    };
}

/**
 * Build a persister that UPSERTS weekly state rows.
 *
 * Idempotency comes from the table's own unique key
 * (keyword_id, year, week, market): re-running the same week updates the same
 * row instead of inserting a second one. A write error is recorded per row and
 * makes the outcome `ok: false`, which is what finalizes a run FAILED.
 */
export function weeklyStatePersister(
    supabase: SupabaseClient,
    ctx: {
        year: number;
        weekNumber: number;
        onWritten?: (count: number) => void;
        /** Receives every rejected row so the route can report the real reason. */
        onFailure?: (
            failures: ReadonlyArray<{ idempotencyKey: string; message: string }>
        ) => void;
    }
): WeeklyPersister {
    return {
        async persist(rows: readonly PersistRow[]): Promise<PersistOutcome> {
            if (!rows.length) return { ok: true, written: 0, failures: [] };

            const failures: Array<{ idempotencyKey: string; message: string }> = [];
            let written = 0;

            for (const row of rows) {
                const record = {
                    // The uuid of the existing keyword row. This MUST be the id,
                    // never the keyword text: the column is a uuid FK and a
                    // text value fails the cast, which is what previously made
                    // every weekly write fail and failed the whole run.
                    keyword_id: row.keywordId || null,
                    keyword: row.keyword,
                    normalized_keyword: row.normalizedKeyword,
                    language: row.language,
                    market: row.market,
                    year: ctx.year,
                    week: ctx.weekNumber,
                    score: row.score,
                    rank: null,
                    trend_status: null,
                    metrics: {},
                    destination_path: row.destinationPath,
                    competitor_signal: null,
                    idempotency_key: row.idempotencyKey,
                    data_kind: row.dataKind,
                    source: row.source,
                };

                const { error } = await supabase
                    .from('seo_keyword_weekly_states')
                    .upsert(record, { onConflict: 'keyword_id,year,week,market' });

                if (error) {
                    // Record WHY, never swallow it: an aggregate 0 with no
                    // reason is what hid this defect for several runs.
                    failures.push({
                        idempotencyKey: row.idempotencyKey,
                        message: error.message,
                    });
                } else {
                    written += 1;
                }
            }

            ctx.onWritten?.(written);
            ctx.onFailure?.(failures);
            return { ok: failures.length === 0, written, failures };
        },
    };
}


