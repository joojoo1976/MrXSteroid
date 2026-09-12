/**
 * server/seo/seoService.ts
 * High-Performance Serving & 3-Tier Fallback Architecture:
 * 1. Precomputed Weekly Snapshot (sub-millisecond JSON cache in DB)
 * 2. Live Database Query (seo_keywords where is_active=true)
 * 3. In-Memory Baseline Seeds (zero network failure guarantee)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    SeoKeyword,
    SeoKeywordSnapshotData,
    SeoLanguage,
    KeywordFilterCategory,
    SearchIntent,
} from './types';
import { getBaselineKeywords } from './baselineKeywords';
import { normalizeKeyword } from './normalization';

export function getSupabaseAdmin(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        return null;
    }
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

/**
 * Get the ISO week number and year for snapshot indexing.
 */
export function getIsoWeek(date: Date = new Date()): { year: number; weekNumber: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { year: d.getUTCFullYear(), weekNumber };
}

/**
 * Build snapshot categories and statistics from an array of active keywords.
 */
export function buildSnapshotData(
    keywords: SeoKeyword[],
    language: SeoLanguage,
    year: number,
    weekNumber: number
): SeoKeywordSnapshotData {
    // Sort all by score descending
    const sorted = [...keywords].sort((a, b) => b.score - a.score);

    // Trending: High trend + high demand (Top 25)
    const trending = sorted
        .filter(k => k.trendStatus === 'rising' || k.trendStatus === 'new' || (k.scoreComponents.trend >= 85))
        .slice(0, 25);

    // Rising: Specifically rising status
    const rising = sorted
        .filter(k => k.trendStatus === 'rising')
        .slice(0, 25);

    // Guides: Informational / Question intent
    const guides = sorted
        .filter(k => k.intent === 'informational' || k.intent === 'question' || k.intent === 'comparison')
        .slice(0, 30);

    // Tools: Mapping to calculator / simulator routes
    const tools = sorted
        .filter(k => k.destinationPath.startsWith('/macro') ||
                     k.destinationPath.startsWith('/bodyfat') ||
                     k.destinationPath.startsWith('/halflife') ||
                     k.destinationPath.startsWith('/injection') ||
                     k.destinationPath.startsWith('/lab') ||
                     k.destinationPath.startsWith('/genetic') ||
                     k.destinationPath.startsWith('/cycle') ||
                     k.destinationPath.startsWith('/TransformationTimeline')
        )
        .slice(0, 25);

    // Plans: Commercial / Transactional intent
    const plans = sorted
        .filter(k => k.intent === 'commercial' || k.intent === 'transactional' || k.destinationPath === '/checkout')
        .slice(0, 25);

    // Statistics
    const total = sorted.length;
    const avgScore = total > 0
        ? Math.round((sorted.reduce((acc, k) => acc + k.score, 0) / total) * 10) / 10
        : 0;

    const intentsDistribution: Record<SearchIntent, number> = {
        informational: 0,
        commercial: 0,
        transactional: 0,
        navigational: 0,
        comparison: 0,
        question: 0,
        unknown: 0,
    };
    const clustersDistribution: Record<string, number> = {};

    for (const k of sorted) {
        intentsDistribution[k.intent] = (intentsDistribution[k.intent] || 0) + 1;
        clustersDistribution[k.cluster] = (clustersDistribution[k.cluster] || 0) + 1;
    }

    return {
        language,
        year,
        weekNumber,
        generatedAt: new Date().toISOString(),
        totalKeywords: total,
        categories: {
            all: sorted,
            trending: trending.length > 0 ? trending : sorted.slice(0, 20),
            rising: rising.length > 0 ? rising : sorted.slice(0, 20),
            guides: guides.length > 0 ? guides : sorted.slice(0, 20),
            tools: tools.length > 0 ? tools : sorted.slice(0, 20),
            plans: plans.length > 0 ? plans : sorted.slice(0, 20),
        },
        stats: {
            averageScore: avgScore,
            intentsDistribution,
            clustersDistribution,
        },
    };
}

/**
 * Fetch or compute the current weekly snapshot with multi-tier fallback.
 */
export async function getOrGenerateWeeklySnapshot(
    language: SeoLanguage,
    client: SupabaseClient | null = getSupabaseAdmin()
): Promise<SeoKeywordSnapshotData> {
    const { year, weekNumber } = getIsoWeek();

    // ── Tier 1: Try reading existing weekly snapshot from DB ────────────────
    if (client) {
        try {
            const { data: snapshotRow, error: snapErr } = await client
                .from('seo_keyword_snapshots')
                .select('snapshot_data')
                .eq('language', language)
                .eq('year', year)
                .eq('week_number', weekNumber)
                .single();

            if (!snapErr && snapshotRow?.snapshot_data) {
                return snapshotRow.snapshot_data as SeoKeywordSnapshotData;
            }
        } catch {
            // Proceed to Tier 2
        }
    }

    // ── Tier 2: Query active keywords from DB and build snapshot ───────────
    if (client) {
        try {
            const { data: keywordsRows, error: kwErr } = await client
                .from('seo_keywords')
                .select('*')
                .eq('language', language)
                .eq('is_active', true)
                .neq('trend_status', 'retired')
                .order('score', { ascending: false });

            if (!kwErr && keywordsRows && keywordsRows.length >= 10) {
                const mapped: SeoKeyword[] = keywordsRows.map((r, idx) => ({
                    id: r.id || `kw-${language}-${idx}`,
                    keyword: r.original_keyword,
                    language: r.language,
                    locale: r.locale,
                    originalKeyword: r.original_keyword,
                    normalizedKeyword: r.normalized_keyword,
                    cluster: r.cluster,
                    intent: r.intent,
                    trendStatus: r.trend_status,
                    destinationPath: r.destination_path || '/',
                    score: Number(r.score),
                    scoreComponents: r.score_components || {},
                    source: r.source,
                    lastObservedAt: r.last_observed_at,
                    isActive: r.is_active,
                }));

                const snapshot = buildSnapshotData(mapped, language, year, weekNumber);

                // Save snapshot asynchronously in background
                client.from('seo_keyword_snapshots').upsert({
                    language,
                    year,
                    week_number: weekNumber,
                    snapshot_data: snapshot,
                    created_at: new Date().toISOString(),
                }, { onConflict: 'year,week_number,language' }).then();

                return snapshot;
            }
        } catch {
            // Proceed to Tier 3
        }
    }

    // ── Tier 3: In-Memory Curated Baseline Fallback (Zero network failure) ─
    const baseline = getBaselineKeywords(language);
    return buildSnapshotData(baseline, language, year, weekNumber);
}

/**
 * Filter snapshot keywords by category.
 */
export function filterKeywordsByCategory(
    snapshot: SeoKeywordSnapshotData,
    category: KeywordFilterCategory = 'all',
    limit: number = 100
): SeoKeyword[] {
    const list = snapshot.categories[category] || snapshot.categories.all;
    return list.slice(0, limit);
}

/**
 * Log an anonymous internal search query (Zero PII).
 */
export async function logInternalSearchQuery(
    query: string,
    language: SeoLanguage,
    resultsCount: number = 0,
    client: SupabaseClient | null = getSupabaseAdmin()
): Promise<boolean> {
    if (!query || query.trim().length < 2) return false;
    const normalized = normalizeKeyword(query, language);

    if (client) {
        try {
            await client.from('seo_internal_search_logs').insert({
                query: query.trim().slice(0, 100),
                normalized_query: normalized.slice(0, 100),
                language,
                results_count: resultsCount,
                created_at: new Date().toISOString(),
            });
            return true;
        } catch {
            return false;
        }
    }
    return false;
}
