/**
 * server/seo/reports.ts
 * ============================================================================
 * The nine admin reports (Phase 9).
 * ============================================================================
 * WHY THIS FILE EXISTS
 * -------------------
 * The engines behind these reports already existed and were tested â€” gapEngine,
 * innovationEngine, competitorIntel, snapshotDiff, destinationMapper,
 * sourceRegistry. What did NOT exist was the report LAYER: of the nine required
 * reports only `source-health` had a route. This module builds the other eight
 * from the same engines, so the numbers on the dashboard and the numbers in the
 * tests come from ONE implementation.
 *
 * THE RULE THAT SHAPES EVERY REPORT
 * ---------------------------------
 *     Every row carries a `dataKind`:
 *         observed   â€“ a real measurement we received
 *         estimated  â€“ a model/estimate output (e.g. Ads volume, Trends index)
 *         generated  â€“ produced by a generator, not observed
 *         imported   â€“ came from a manual file
 *         unavailableâ€“ the source could not run; the value is null
 *
 * A metric that does not exist is `null`, never a placeholder number. That is
 * the whole reason these reports are trustworthy: a reader can tell at a glance
 * which figures are real.
 *
 * No fabricated volumes, no fabricated `Verified`, no competitor traffic
 * numbers â€” none of those exist in this codebase, and a report that invented
 * them would be worse than no report at all.
 */

import type { Market, SourceLanguage } from './sources/types';
import type { SearchIntent } from './types';
import { isSupportedMarket } from './snapshotDiff';
import { detectGaps, type GapReport } from './gapEngine';
import { generateCandidates, type InnovationResult } from './innovationEngine';
import { diffWeeklyStates, markReactivated, type WeeklyState } from './snapshotDiff';
import { resolveDestination, isValidDestination } from './destinationMapper';
import { sourceRegistry } from './sources/registry';

/** The epistemic label carried on every reported row. */
export type ReportDataKind =
    | 'observed'
    | 'estimated'
    | 'generated'
    | 'imported'
    | 'unavailable';

export interface ReportRow {
    /** The entity this row is about. */
    keyword: string;
    language: SourceLanguage;
    market: Market;
    /** Where it came from, in plain terms. */
    source: string;
    dataKind: ReportDataKind;
    /** Real score, or null when nothing could be scored. Never invented. */
    score: number | null;
    /** The page this keyword targets, or null when unmapped. */
    destination: string | null;
    /** True only when a human must look at this row. */
    needsReview: boolean;
}

export interface ReportEnvelope {
    report: string;
    /** What the reader may conclude from this report. */
    interpretation: string;
    /** Present only when the report could not be built honestly. */
    degraded?: { reason: string };
    rows: ReportRow[];
    summary: Record<string, number>;
}

/** Counts by dataKind, so a dashboard can show the evidence mix at a glance. */
export function dataKindMix(rows: readonly ReportRow[]): Record<string, number> {
    const mix: Record<string, number> = {};
    for (const r of rows) mix[r.dataKind] = (mix[r.dataKind] ?? 0) + 1;
    return mix;
}

/**
 * Build a report envelope.
 *
 * `degraded` is the honest answer when a source cannot run. Returning an empty
 * row set WITHOUT that flag would read as "we checked and found nothing", which
 * is a far stronger and different claim.
 */
function envelope(
    report: string,
    interpretation: string,
    rows: ReportRow[],
    extra: Record<string, number> = {},
    degraded?: string
): ReportEnvelope {
    return {
        report,
        interpretation,
        ...(degraded ? { degraded: { reason: degraded } } : {}),
        rows,
        summary: { rows: rows.length, ...dataKindMix(rows), ...extra },
    };
}

/* ------------------------------------------------------------------ */
/* 1 Â· weekly-discovery                                                */
/* ------------------------------------------------------------------ */
export function buildWeeklyDiscoveryReport(input: {
    current: readonly WeeklyState[];
    previous: readonly WeeklyState[];
}): ReportEnvelope {
    const diff = markReactivated(
        diffWeeklyStates(input.current, input.previous),
        input.previous
    );
    const rows: ReportRow[] = diff.map((d) => {
        const s = d.current ?? d.previous!;
        return {
            keyword: s.keyword,
            language: s.language,
            market: s.market,
            source: 'weekly_diff',
            // A diff is derived from two real observations; the LABEL reflects
            // where its score came from, and a missing score stays unavailable.
            dataKind: (s.score === null ? 'unavailable' : 'observed') as ReportDataKind,
            score: s.score,
            destination: s.destination_path ?? null,
            needsReview: d.state === 'NEEDS_REVIEW',
        };
    });

    const byState: Record<string, number> = {};
    for (const d of diff) byState[d.state] = (byState[d.state] ?? 0) + 1;

    return envelope(
        'weekly-discovery',
        'Movement against the previous recorded week. NEW_GAP / CLOSED_GAP are gap states and are counted separately from keyword movement.',
        rows,
        { ...byState }
    );
}

/* ------------------------------------------------------------------ */
/* 2 Â· competitor-intelligence                                         */
/* ------------------------------------------------------------------ */
export function buildCompetitorIntelligenceReport(input: {
    observations: ReadonlyArray<{
        keyword: string;
        language: SourceLanguage;
        market: Market;
        domain: string;
        hasFullText: boolean;
    }>;
}): ReportEnvelope {
    const rows: ReportRow[] = input.observations.map((o) => ({
        keyword: o.keyword,
        language: o.language,
        market: o.market,
        source: `competitor:${o.domain}`,
        // We observed the competitor's PAGE. We did NOT observe their traffic,
        // and no traffic figure is reported anywhere in this system.
        dataKind: 'observed' as ReportDataKind,
        score: null,
        destination: null,
        // Partial text extraction is a real limitation the reader must see.
        needsReview: !o.hasFullText,
    }));

    return envelope(
        'competitor-intelligence',
        'What we directly observed on competitor pages. No traffic, rank or volume figures are inferred â€” none were measured.',
        rows,
        { domainsObserved: new Set(input.observations.map((o) => o.domain)).size }
    );
}

/* ------------------------------------------------------------------ */
/* 3 Â· keyword-demand                                                  */
/* ------------------------------------------------------------------ */
export function buildKeywordDemandReport(input: {
    demand: ReadonlyArray<{
        keyword: string;
        language: SourceLanguage;
        market: Market;
        source: string;
        dataKind: ReportDataKind;
        /** Real figure, or null when the provider could not run. */
        value: number | null;
    }>;
}): ReportEnvelope {
    const rows: ReportRow[] = input.demand.map((d) => ({
        keyword: d.keyword,
        language: d.language,
        market: d.market,
        source: d.source,
        dataKind: d.dataKind,
        // null stays null. A missing demand figure is never replaced by a guess.
        score: d.value,
        destination: null,
        needsReview: d.value === null,
    }));

    return envelope(
        'keyword-demand',
        'Demand per provider, each labelled. A null value means that provider could not run â€” it is NOT a zero.',
        rows,
        { providers: new Set(input.demand.map((d) => d.source)).size }
    );
}

/* ------------------------------------------------------------------ */
/* 4 Â· internal-search                                                 */
/* ------------------------------------------------------------------ */
export function buildInternalSearchReport(input: {
    entries: ReadonlyArray<{ query: string; count: number }>;
    language?: SourceLanguage;
    market?: Market;
}): ReportEnvelope {
    const rows: ReportRow[] = input.entries.map((e) => ({
        keyword: e.query,
        language: input.language ?? 'en',
        market: input.market ?? 'en-US',
        source: 'internal_search_logs',
        // Our own first-party telemetry: a real count of real events.
        dataKind: 'observed' as ReportDataKind,
        score: e.count,
        destination: null,
        needsReview: false,
    }));

    rows.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return envelope(
        'internal-search',
        'First-party demand: queries typed into our own site, counted from our own logs.',
        rows,
        { totalEvents: input.entries.reduce((a, e) => a + e.count, 0) }
    );
}

/* ------------------------------------------------------------------ */
/* 5 Â· trend-intelligence                                              */
/* ------------------------------------------------------------------ */
export function buildTrendIntelligenceReport(input: {
    rows: ReadonlyArray<{
        keyword: string;
        language: SourceLanguage;
        market: Market;
        /** 0-100 relative interest, or null. NEVER a volume. */
        relativeInterest: number | null;
        source: string;
        /**
         * The provenance recorded by the adapter that produced this row.
         * A manual CSV export is `imported`; only a real official-API response
         * is `observed`. Callers may pass this explicitly; otherwise it is
         * derived from `officialApiAvailable` below.
         */
        dataKind?: 'observed' | 'imported';
    }>;
    officialApiAvailable: boolean;
}): ReportEnvelope {
    const rows: ReportRow[] = input.rows.map((r) => ({
        keyword: r.keyword,
        language: r.language,
        market: r.market,
        source: r.source,
        // Trends is a 0-100 INDEX, never a volume. The kind reflects HOW we got
        // it: a human-exported CSV is `imported`, not `estimated` — nothing was
        // modelled here — and without an official API nothing can be `observed`.
        dataKind: (r.relativeInterest === null
            ? 'unavailable'
            : (r.dataKind ?? (input.officialApiAvailable ? 'observed' : 'imported'))) as ReportDataKind,
        score: r.relativeInterest,
        destination: null,
        needsReview: r.relativeInterest === null,
    }));

    return envelope(
        'trend-intelligence',
        'Relative interest 0-100 per market. This is an index, not a search volume; without the official API these rows are imported CSV exports.',
        rows,
        { officialApiAvailable: input.officialApiAvailable ? 1 : 0 },
        input.officialApiAvailable
            ? undefined
            : 'Google Trends has no public API; these rows can only come from a manual CSV import.'
    );
}

/* ------------------------------------------------------------------ */
/* 6 Â· innovation-opportunities                                        */
/* ------------------------------------------------------------------ */
export function buildInnovationReport(input: {
    existing: ReadonlyArray<{ keyword: string; language: SourceLanguage; market: Market }>;
    internalSearch?: ReadonlyArray<{ query: string; count: number }>;
}): ReportEnvelope {
    const result: InnovationResult = generateCandidates({
        existingKeywords: input.existing.map((e) => ({
            keyword: e.keyword,
            language: e.language,
            market: e.market,
        })),
        internalSearch: (input.internalSearch ?? []).map((s) => ({
            keyword: s.query,
            count: s.count,
            language: 'en' as const,
            market: 'en-US' as const,
        })),
    });

    const rows: ReportRow[] = result.candidates.map((c) => ({
        keyword: c.keyword,
        language: c.language,
        market: c.market,
        source: c.generationMethod,
        // Generated is not observed. This label is the point of the report: a
        // suggestion must never read as a measured keyword.
        dataKind: 'generated' as ReportDataKind,
        // A generated candidate has no score. null is the honest value.
        score: null,
        destination: null,
        needsReview: true,
    }));

    return envelope(
        'innovation-opportunities',
        'Generated candidates. Every row is `generated` with a null score: none was measured, and none may be promoted to source-backed without real evidence.',
        rows,
        { byMethod: Object.keys(result.byMethod).length }
    );
}

/* ------------------------------------------------------------------ */
/* 7 Â· gap-intelligence                                                */
/* ------------------------------------------------------------------ */
export function buildGapIntelligenceReport(input: {
    mrxCoverage: ReadonlyArray<{
        keyword: string; market: Market; language: SourceLanguage; signalCount: number;
    }>;
    competitorCoverage: ReadonlyArray<{
        keyword: string; market: Market; language: SourceLanguage;
        domain: string; sourceReference: string;
    }>;
    uncoveredDemand: ReadonlyArray<{
        keyword: string; market: Market; language: SourceLanguage;
        signal: string; signalValue: number; sourceReference: string;
    }>;
}): ReportEnvelope {
    const report: GapReport = detectGaps({
        mrxCoverage: input.mrxCoverage as never,
        competitorCoverage: input.competitorCoverage as never,
        uncoveredDemand: input.uncoveredDemand as never,
    });

    const rows: ReportRow[] = report.gaps.map((g) => ({
        keyword: g.keyword,
        language: g.language,
        market: g.market,
        source: `gap:${g.state}`,
        // A gap is an inference from coverage, not a measurement.
        dataKind: 'generated' as ReportDataKind,
        score: null,
        destination: null,
        needsReview: true,
    }));

    return envelope(
        'gap-intelligence',
        'Coverage states derived from MRX, competitor and internal-demand signals. Recommendations are destination TYPES only â€” this report creates no page, article or route.',
        rows,
        { ...report.byState, recommendations: report.recommendations.length }
    );
}

/* ------------------------------------------------------------------ */
/* 8 Â· destination-coverage                                            */
/* ------------------------------------------------------------------ */
export function buildDestinationCoverageReport(input: {
    rows: ReadonlyArray<{
        keyword: string;
        language: SourceLanguage;
        market: Market;
        cluster: string;
        intent: SearchIntent;
        /** A real stored path, or null when the keyword has none yet. */
        storedPath: string | null;
    }>;
}): ReportEnvelope {
    const mapped: ReportRow[] = input.rows.map((r) => {
        // The REAL stored path wins. The mapper is only a suggestion, and a
        // suggestion must never overwrite a value we actually have.
        const suggestion = resolveDestination(r.keyword, r.cluster, r.intent);
        const destination = r.storedPath ?? suggestion.path;
        const isReal = r.storedPath !== null && isValidDestination(r.storedPath);

        return {
            keyword: r.keyword,
            language: r.language,
            market: r.market,
            source: r.storedPath ? 'stored_destination' : 'suggested_destination',
            // A stored, verified path is real. A suggestion is not an
            // observation, and a root path is real but unverified.
            dataKind: (isReal ? 'observed' : 'generated') as ReportDataKind,
            score: null,
            destination,
            // A root path is a real value an admin must confirm; a suggestion
            // is a proposal an admin must confirm. Both need a human.
            needsReview: destination === '/' || !isReal,
        };
    });

    return envelope(
        'destination-coverage',
        'Where each keyword points. A stored path is reported as-is; where none exists, the mapper SUGGESTS one and the row is labelled `generated` so a suggestion is never read as a decision.',
        mapped,
        {
            uncovered: input.rows.filter((r) => r.storedPath === null).length,
            needsReview: mapped.filter((m) => m.needsReview).length,
        }
    );
}

/* ------------------------------------------------------------------ */
/* 9 Â· source-health                                                  */
/* ------------------------------------------------------------------ */
export function buildSourceHealthReport(): ReportEnvelope {
    const rows: ReportRow[] = sourceRegistry.getSourceHealth().map((s) => ({
        keyword: s.provider,
        language: 'en' as SourceLanguage,
        market: 'en-US' as Market,
        source: s.source_class,
        // Only a real, evidence-backed response counts as an observation.
        // CONNECTED proves we hold credentials, not that a request succeeded,
        // so it must never be reported as `observed`.
        dataKind: (s.status === 'VERIFIED' ? 'observed' : 'unavailable') as ReportDataKind,
        score: null,
        destination: null,
        needsReview: s.status !== 'VERIFIED',
    }));

    return envelope(
        'source-health',
        'Live status per provider. `observed` requires a real successful request; configuration alone is not evidence.',
        rows,
        // Counts only genuine evidence. A credentialed-but-unproven provider is
        // not counted here, so this number can never overstate readiness.
        { verifiedProviders: rows.filter((r) => r.dataKind === 'observed').length }
    );
}

/* ------------------------------------------------------------------ */
/* market / language isolation                                         */
/* ------------------------------------------------------------------ */

/**
 * Find any keyword that appears under MORE THAN ONE market.
 *
 * If a bug ever let two markets collapse into a single identity, this returns
 * the offending pair instead of letting a merged row pass silently. The market
 * constraint on `seo_keywords` is still legacy, so this is a live risk, not a
 * theoretical one.
 */
export function findCrossMarketCollisions(
    rows: readonly ReportRow[]
): Array<{ keyword: string; markets: Market[] }> {
    const byKeyword = new Map<string, Set<Market>>();
    for (const r of rows) {
        const set = byKeyword.get(r.keyword) ?? new Set<Market>();
        set.add(r.market);
        byKeyword.set(r.keyword, set);
    }
    const out: Array<{ keyword: string; markets: Market[] }> = [];
    for (const [keyword, markets] of byKeyword) {
        if (markets.size > 1) out.push({ keyword, markets: [...markets].sort() });
    }
    return out;
}

/** Any market outside the approved seven, as a raw list for reporting. */
export function findUnapprovedMarkets(rows: readonly ReportRow[]): string[] {
    return [...new Set(rows.filter((r) => !isSupportedMarket(r.market)).map((r) => String(r.market)))];
}
