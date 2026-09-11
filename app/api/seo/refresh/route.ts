import { NextRequest, NextResponse } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin, getIsoWeek, buildSnapshotData } from '../../../../server/seo/seoService';
import {
    calculateKeywordScore,
    calculateFreshnessScore,
    calculateSeasonalScore,
    determineTrendStatus,
} from '../../../../server/seo/scoringEngine';
import { SeoKeyword, SeoLanguage } from '../../../../server/seo/types';

export const dynamic = 'force-dynamic';

interface KeywordUpdatePayload {
    id: string;
    score: number;
    trend_status: string;
    score_components: Record<string, number>;
    last_analyzed_at: string;
}

interface SnapshotSummary {
    totalKeywords: number;
    averageScore: number;
    trendingCount: number;
    toolsCount: number;
}

/**
 * Verify caller authorization:
 * 1. Cron secret header (CRON_SECRET or Bearer token)
 * 2. Authenticated Admin profile
 * 3. Local development bypass
 */
async function isAuthorized(req: NextRequest, supabase: SupabaseClient | null): Promise<boolean> {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization') || '';
    const cronHeader = req.headers.get('x-cron-secret') || '';

    // Check CRON_SECRET if configured
    if (cronSecret) {
        if (cronHeader === cronSecret) return true;
        if (authHeader.replace(/^Bearer\s+/i, '').trim() === cronSecret) return true;
    }

    // Check Supabase authenticated user for admin role
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token && supabase) {
        try {
            const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
            if (!userErr && user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (profile?.role === 'admin') return true;
            }
        } catch {
            // Ignore auth error
        }
    }

    // In local development, permit if no cron secret is configured
    if (process.env.NODE_ENV === 'development' && !cronSecret) {
        return true;
    }

    return false;
}

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    const supabase = getSupabaseAdmin();

    const authorized = await isAuthorized(req, supabase);
    if (!authorized) {
        return NextResponse.json(
            { error: 'Unauthorized: Admin privileges or valid CRON_SECRET required' },
            { status: 401 }
        );
    }

    if (!supabase) {
        return NextResponse.json(
            { error: 'Database service role client unavailable' },
            { status: 500 }
        );
    }

    // 1. Initialize audit log entry
    let runId: string | null = null;
    try {
        const { data: runData } = await supabase
            .from('seo_keyword_refresh_runs')
            .insert({
                status: 'running',
                started_at: new Date().toISOString(),
            })
            .select('id')
            .single();
        runId = runData?.id || null;
    } catch (e) {
        console.warn('[SEO Refresh] Failed to create initial run log:', e);
    }

    try {
        // 2. Fetch recent search telemetry (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: recentSearches } = await supabase
            .from('seo_internal_search_logs')
            .select('normalized_query')
            .gte('created_at', sevenDaysAgo);

        const searchFrequencyMap = new Map<string, number>();
        if (recentSearches) {
            for (const s of recentSearches) {
                const q = s.normalized_query;
                searchFrequencyMap.set(q, (searchFrequencyMap.get(q) || 0) + 1);
            }
        }

        // 3. Scan all active keywords
        const { data: keywordsRows, error: kwError } = await supabase
            .from('seo_keywords')
            .select('*')
            .eq('is_active', true);

        if (kwError || !keywordsRows) {
            throw new Error(`Failed to load keywords: ${kwError?.message || 'Unknown error'}`);
        }

        let updatedCount = 0;
        let retiredCount = 0;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;

        const updatedKeywords: KeywordUpdatePayload[] = [];

        for (const row of keywordsRows) {
            const lastObserved = row.last_observed_at ? new Date(row.last_observed_at) : now;
            const createdAt = row.created_at ? new Date(row.created_at) : now;

            const daysSinceObserved = Math.max(0, Math.floor((now.getTime() - lastObserved.getTime()) / (1000 * 60 * 60 * 24)));
            const daysSinceFirstSeen = Math.max(0, Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

            const searchBoost = searchFrequencyMap.get(row.normalized_keyword) || 0;
            const baseComponents = row.score_components || {
                relevance: 90,
                demand: 80,
                trend: 75,
                commercial: 70,
                freshness: 100,
                seasonal: 80,
                competitorGap: 50,
                competitionPenalty: 10,
                duplicatePenalty: 0,
            };

            // Update freshness & seasonal & internal demand signals
            const newFreshness = calculateFreshnessScore(daysSinceObserved);
            const newSeasonal = calculateSeasonalScore(row.cluster, currentMonth);
            const dynamicDemand = Math.min(100, (baseComponents.demand || 80) + Math.min(20, searchBoost * 5));

            const updatedComponents = {
                ...baseComponents,
                freshness: newFreshness,
                seasonal: newSeasonal,
                demand: dynamicDemand,
            };

            const newScore = calculateKeywordScore(updatedComponents);
            const newTrendStatus = determineTrendStatus({
                daysSinceFirstSeen,
                daysSinceLastObserved: daysSinceObserved,
                trendScore: updatedComponents.trend || 70,
                overallScore: newScore,
            });

            const hasChanged =
                Math.abs(Number(row.score) - newScore) > 0.5 ||
                row.trend_status !== newTrendStatus;

            if (hasChanged) {
                updatedCount++;
                if (newTrendStatus === 'retired') retiredCount++;

                updatedKeywords.push({
                    id: row.id,
                    score: newScore,
                    trend_status: newTrendStatus,
                    score_components: updatedComponents,
                    last_analyzed_at: now.toISOString(),
                });
            }
        }

        // Apply batch updates
        if (updatedKeywords.length > 0) {
            for (const item of updatedKeywords) {
                await supabase
                    .from('seo_keywords')
                    .update({
                        score: item.score,
                        trend_status: item.trend_status,
                        score_components: item.score_components,
                        last_analyzed_at: item.last_analyzed_at,
                    })
                    .eq('id', item.id);
            }
        }

        // 4. Regenerate snapshots for both EN and AR
        const { year, weekNumber } = getIsoWeek(now);
        const languages: SeoLanguage[] = ['en', 'ar'];
        const snapshotSummaries: Record<string, SnapshotSummary> = {};

        for (const lang of languages) {
            const { data: langKeywords } = await supabase
                .from('seo_keywords')
                .select('*')
                .eq('language', lang)
                .eq('is_active', true)
                .neq('trend_status', 'retired')
                .order('score', { ascending: false });

            if (langKeywords && langKeywords.length > 0) {
                const mapped: SeoKeyword[] = langKeywords.map(r => ({
                    id: r.id,
                    language: r.language,
                    locale: r.locale,
                    originalKeyword: r.original_keyword,
                    normalizedKeyword: r.normalized_keyword,
                    cluster: r.cluster,
                    intent: r.intent,
                    trendStatus: r.trend_status,
                    destinationPath: r.destination_path,
                    score: Number(r.score),
                    scoreComponents: r.score_components || {},
                    source: r.source,
                    lastObservedAt: r.last_observed_at,
                    isActive: r.is_active,
                }));

                const snapshot = buildSnapshotData(mapped, lang, year, weekNumber);

                await supabase.from('seo_keyword_snapshots').upsert({
                    language: lang,
                    year,
                    week_number: weekNumber,
                    snapshot_data: snapshot,
                    created_at: now.toISOString(),
                }, { onConflict: 'year,week_number,language' });

                snapshotSummaries[lang] = {
                    totalKeywords: snapshot.totalKeywords,
                    averageScore: snapshot.stats.averageScore,
                    trendingCount: snapshot.categories.trending.length,
                    toolsCount: snapshot.categories.tools.length,
                };
            }
        }

        const durationMs = Date.now() - startTime;

        // 5. Finalize audit run log
        if (runId) {
            await supabase
                .from('seo_keyword_refresh_runs')
                .update({
                    status: 'completed',
                    finished_at: new Date().toISOString(),
                    keywords_scanned: keywordsRows.length,
                    updated_keywords: updatedCount,
                    retired_keywords: retiredCount,
                    summary: {
                        durationMs,
                        snapshots: snapshotSummaries,
                        year,
                        weekNumber,
                    },
                })
                .eq('id', runId);
        }

        return NextResponse.json({
            success: true,
            runId,
            durationMs,
            keywordsScanned: keywordsRows.length,
            keywordsUpdated: updatedCount,
            keywordsRetired: retiredCount,
            snapshots: snapshotSummaries,
            year,
            weekNumber,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[SEO Refresh Error]:', error);

        if (runId) {
            await supabase
                .from('seo_keyword_refresh_runs')
                .update({
                    status: 'failed',
                    finished_at: new Date().toISOString(),
                    error_log: message,
                })
                .eq('id', runId);
        }

        return NextResponse.json(
            { error: 'SEO refresh failed', details: message },
            { status: 500 }
        );
    }
}
