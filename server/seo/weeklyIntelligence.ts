/**
 * server/seo/weeklyIntelligence.ts
 * PHASE 1C (DEFECT 2) — make `seo_keyword_weekly_states` a REAL consumer.
 *
 * THE GAP THIS CLOSES
 * -------------------
 * Phase 1A proved the weekly engine writes `seo_keyword_weekly_states`
 * correctly, but nothing on the user-facing read path ever read it. The Dynamic
 * Keyword UI served `seo_keyword_snapshots` instead, so the entire weekly
 * pipeline was invisible to end users and a keyword's "movement this week" was
 * never available anywhere.
 *
 * WHY BOTH TABLES ARE KEPT
 * ------------------------
 * `seo_keyword_snapshots` has a LEGITIMATE, DIFFERENT job: a precomputed JSON
 * blob that keeps the page fast (sub-millisecond read, no per-request
 * aggregation). Replacing it would trade correctness for latency and would
 * break a 3-tier fallback that is currently correct and honest. So both stay,
 * and the difference is explicit rather than accidental:
 *
 *   seo_keyword_snapshots     -> WHICH keywords are active + their scores.
 *                                Fast. No week-over-week knowledge.
 *   seo_keyword_weekly_states -> WHAT MOVED since last week, per market, WITH
 *                                provider provenance. The dynamic truth.
 *
 * Nothing here invents a value: a keyword with no weekly row carries
 * `weeklyMovement: null`, which the UI must render as "unknown", never as a
 * trend.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Market, SourceLanguage } from './sources/types';
import { getIsoWeek } from './seoService';
import { classifyWeeklyMovement, type WeeklyMovement } from './weeklyEngine';

/**
 * Where the weekly-movement answer came from. Surfaced to the API verbatim so a
 * degraded answer can be labelled instead of guessed.
 *
 *   'weekly_states' — real rows for THIS ISO week joined to the previous one.
 *   'no_history'    — rows exist, but no PRIOR week exists to compare against.
 *                     Movement is genuinely unknown; nothing is invented.
 *   'unavailable'   — table missing/unmigrated, or the query failed.
 */
export type WeeklyMovementTier = 'weekly_states' | 'no_history' | 'unavailable';

/** One keyword's weekly intelligence, shaped for the read API. */
export interface WeeklyKeywordIntelligence {
    /** Stable uuid from seo_keyword_weekly_states.keyword_id. */
    keywordId: string;
    keyword: string;
    language: SourceLanguage;
    market: Market;
    year: number;
    week: number;
    /** This week's score, or null when nothing could be scored. */
    currentScore: number | null;
    /** Last week's score, or null when there was no prior reading. */
    previousScore: number | null;
    /** The WEEKLY movement. Never derived from `trend_status`. */
    weeklyMovement: WeeklyMovement | null;
    /** Provider attribution as persisted. Never synthesised. */
    source: string | null;
    dataKind: string | null;
    /** When the row was written. */
    recordedAt: string | null;
}

export interface WeeklyIntelligenceResult {
    tier: WeeklyMovementTier;
    year: number;
    weekNumber: number;
    previousYear: number | null;
    previousWeek: number | null;
    /** Empty when the tier is 'unavailable'. */
    keywords: WeeklyKeywordIntelligence[];
}

interface WeeklyStateDbRow {
    keyword_id?: string | null;
    keyword?: string | null;
    language?: string | null;
    market?: string | null;
    year?: number | null;
    week?: number | null;
    score?: number | null;
    source?: string | null;
    data_kind?: string | null;
    recorded_at?: string | null;
}

const SELECT_COLUMNS =
    'keyword_id, keyword, language, market, year, week, score, source, data_kind, recorded_at';

/** The ISO week immediately before the given one, rolling back over year 1. */
export function previousIsoWeek(year: number, weekNumber: number): { year: number; weekNumber: number } {
    // Mirrors `readPreviousWeekStates`: week 1 rolls back to week 52 of the
    // previous year. Kept as ONE function so the write path and the read path
    // can never disagree about what "last week" means.
    return weekNumber > 1
        ? { year, weekNumber: weekNumber - 1 }
        : { year: year - 1, weekNumber: 52 };
}

/**
 * Read this week's persisted weekly state and classify its movement against the
 * previous week, using the SAME classifier and thresholds the engine used.
 *
 * Returns `unavailable` rather than throwing: a missing table (migration not
 * applied yet) must degrade the answer, never fail the page.
 */
export async function getWeeklyKeywordIntelligence(
    client: SupabaseClient | null,
    options: { language?: SourceLanguage } = {}
): Promise<WeeklyIntelligenceResult> {
    const { year, weekNumber } = getIsoWeek();
    const previous = previousIsoWeek(year, weekNumber);

    const empty = (tier: WeeklyMovementTier): WeeklyIntelligenceResult => ({
        tier,
        year,
        weekNumber,
        previousYear: previous.year,
        previousWeek: previous.weekNumber,
        keywords: [],
    });

    if (!client) return empty('unavailable');

    try {
        // Current week rows.
        let currentQuery = client
            .from('seo_keyword_weekly_states')
            .select(SELECT_COLUMNS)
            .eq('year', year)
            .eq('week', weekNumber);
        if (options.language) currentQuery = currentQuery.eq('language', options.language);
        const currentResult = await currentQuery;
        if (currentResult.error) return empty('unavailable');
        const currentRows = (currentResult.data ?? []) as WeeklyStateDbRow[];
        if (!currentRows.length) return empty('unavailable');

        // Previous week rows. Absent is NOT a failure — it means there is no
        // history yet, which is a different and honest answer.
        let previousQuery = client
            .from('seo_keyword_weekly_states')
            .select('keyword_id, score')
            .eq('year', previous.year)
            .eq('week', previous.weekNumber);
        if (options.language) previousQuery = previousQuery.eq('language', options.language);
        const previousResult = await previousQuery;
        if (previousResult.error) return empty('unavailable');

        const previousByKeywordId = new Map<string, number | null>();
        for (const row of (previousResult.data ?? []) as WeeklyStateDbRow[]) {
            if (row.keyword_id) {
                previousByKeywordId.set(row.keyword_id, row.score == null ? null : Number(row.score));
            }
        }

        const hasAnyHistory = previousByKeywordId.size > 0;

        const keywords: WeeklyKeywordIntelligence[] = currentRows.map((row) => {
            const currentScore = row.score == null ? null : Number(row.score);
            const previousScore = row.keyword_id
                ? previousByKeywordId.get(row.keyword_id) ?? null
                : null;

            // The shared classifier + shared thresholds, so the read path can
            // never disagree with the write path about a movement.
            const weeklyMovement: WeeklyMovement | null = hasAnyHistory
                ? classifyWeeklyMovement({
                      hasHistory: true,
                      previousScore,
                      currentScore,
                  })
                : null;

            return {
                keywordId: String(row.keyword_id ?? ''),
                keyword: String(row.keyword ?? ''),
                language: (row.language === 'ar' ? 'ar' : 'en') as SourceLanguage,
                market: (row.market ?? 'en-US') as Market,
                year: Number(row.year ?? year),
                week: Number(row.week ?? weekNumber),
                currentScore,
                previousScore,
                weeklyMovement,
                source: row.source ?? null,
                dataKind: row.data_kind ?? null,
                recordedAt: row.recorded_at ?? null,
            };
        });

        return {
            tier: hasAnyHistory ? 'weekly_states' : 'no_history',
            year,
            weekNumber,
            previousYear: previous.year,
            previousWeek: previous.weekNumber,
            keywords,
        };
    } catch {
        return empty('unavailable');
    }
}