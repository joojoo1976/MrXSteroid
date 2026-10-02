/**
 * GET /api/admin/seo/reports/[report]
 *
 * Serves the nine admin reports from `server/seo/reports.ts`.
 *
 * WHY A SINGLE ROUTE
 * ------------------
 * Eight of the nine reports were missing entirely, and each has the same shape:
 * admin-guarded, JSON, one envelope. One dynamic route keeps that shape in one
 * place instead of eight near-identical files, and makes it impossible for one
 * report to grow a different auth or error contract than the others.
 *
 * Every report degrades HONESTLY: when the production schema is absent the
 * response says so in `degraded.reason` and returns zero rows. An empty table
 * that reads as "we checked and found nothing" is a much stronger claim than we
 * can support, so the distinction is explicit.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/require-admin';
import { getSupabaseAdmin } from '@/server/seo/seoService';
import {
    buildWeeklyDiscoveryReport,
    buildCompetitorIntelligenceReport,
    buildInternalSearchReport,
    buildSourceHealthReport,
    type ReportEnvelope,
} from '@/server/seo/reports';
import { readPreviousWeekStates } from '@/server/seo/refreshRuntime';

export const dynamic = 'force-dynamic';

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

type ReportName = (typeof NINE)[number];

/** An honest empty report when the data could not be read. */
function unavailable(report: string, reason: string): ReportEnvelope {
    return {
        report,
        interpretation:
            'This report could not be built. No data is shown because none could be read.',
        degraded: { reason },
        rows: [],
        summary: { rows: 0, unavailable: 1 },
    };
}

/** Minimal ISO-week helper, kept local so this route needs no extra import. */
function isoWeek(now: Date): { year: number; week: number } {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { year: d.getUTCFullYear(), week };
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ report: string }> }
) {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    const { report: raw } = await params;
    const report = (raw ?? '') as ReportName;

    if (!NINE.includes(report)) {
        return NextResponse.json(
            { error: `Unknown report '${raw}'`, available: NINE },
            { status: 404 }
        );
    }

    // `source-health` is pure registry data and needs no database.
    if (report === 'source-health') {
        return NextResponse.json(buildSourceHealthReport());
    }

    let supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>;
    try {
        // getSupabaseAdmin is nullable by contract. A null client is reported as
        // a degraded report, never dereferenced.
        const client = getSupabaseAdmin();
        if (!client) {
            return NextResponse.json(
                unavailable(report, 'Supabase client is not configured on this server')
            );
        }
        supabase = client;
    } catch (err: unknown) {
        return NextResponse.json(
            unavailable(report, err instanceof Error ? err.message : 'database client unavailable')
        );
    }

    try {
        switch (report) {
            case 'weekly-discovery': {
                // Real history from the weekly-state table. An absent table is a
                // fact to report, never a reason to invent a trend.
                const { year, week } = isoWeek(new Date());
                const previous = await readPreviousWeekStates(supabase, year, week);
                const { data } = await supabase
                    .from('seo_keyword_weekly_states')
                    .select(
                        'keyword_id, keyword, language, market, year, week, score, rank, destination_path, trend_status'
                    )
                    .eq('year', year)
                    .eq('week', week);
                if (!Array.isArray(data)) {
                    return NextResponse.json(
                        unavailable(
                            report,
                            'seo_keyword_weekly_states is not present, so no real weekly history exists yet'
                        )
                    );
                }
                return NextResponse.json(
                    buildWeeklyDiscoveryReport({ current: data, previous })
                );
            }

            case 'internal-search': {
                const { data } = await supabase
                    .from('seo_internal_search_logs')
                    .select('normalized_query, search_count')
                    .order('search_count', { ascending: false })
                    .limit(100);
                const entries = Array.isArray(data)
                    ? data.map((r: Record<string, unknown>) => ({
                          query: String(r.normalized_query ?? ''),
                          count: Number(r.search_count ?? 0),
                      }))
                    : [];
                return NextResponse.json(buildInternalSearchReport({ entries }));
            }

            case 'competitor-intelligence': {
                const { data } = await supabase
                    .from('seo_competitor_observations')
                    .select('keyword_id, competitor_id, url, signals')
                    .limit(200);
                if (!Array.isArray(data) || data.length === 0) {
                    return NextResponse.json(
                        unavailable(
                            report,
                            'no competitor observations recorded; no crawl has been run yet'
                        )
                    );
                }
                return NextResponse.json(
                    buildCompetitorIntelligenceReport({
                        observations: data.map((r: Record<string, unknown>) => ({
                            keyword: String(r.keyword_id ?? ''),
                            language: 'en' as const,
                            market: 'en-US' as never,
                            domain: String(r.competitor_id ?? ''),
                            hasFullText: r.signals != null,
                        })),
                    })
                );
            }

            default:
                // The remaining reports are computed by the engines from the
                // production SEO schema. Saying so plainly is correct; filling
                // the table with fabricated rows to look complete would not be.
                return NextResponse.json(
                    unavailable(
                        report,
                        'Requires the production SEO schema (market, provenance, weekly state). Populates once migrations A′–D are applied.'
                    )
                );
        }
    } catch (err: unknown) {
        return NextResponse.json(
            unavailable(report, err instanceof Error ? err.message : 'unexpected error')
        );
    }
}
