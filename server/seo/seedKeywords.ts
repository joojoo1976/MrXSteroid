/**
 * server/seo/seedKeywords.ts
 * Seeds the database with curated baseline keywords and generates initial weekly snapshots.
 * Idempotent: uses ON CONFLICT (language, normalized_keyword) DO UPDATE.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * T1 ROOT-CAUSE FINDING — THIS FUNCTION HAS NO PRODUCTION CALL SITE
 * ═══════════════════════════════════════════════════════════════════════════
 * Verified by full-repository search: `seedSeoKeywords` is referenced ONLY by
 * its own definition. There is no call site in `app/`, `server/`, `scripts/`,
 * `tests/`, or any route handler, and no scheduled job invokes it.
 *
 * Consequence — this is a CONTRIBUTING ROOT CAUSE of the Dynamic Keyword
 * Intelligence failure, not a cosmetic issue:
 *
 *   1. `seo_keywords` is therefore never seeded through this path. Any row that
 *      exists came from some other writer, and any row that does not exist is
 *      simply absent — `seedSeoKeywords` cannot be the reason it exists.
 *   2. Because `seoService.getOrGenerateWeeklySnapshot()` requires >= 10 active
 *      DB rows before it will use the `database` tier, a sparsely populated
 *      table silently drops the request into the `baseline` tier.
 *   3. The API still answers HTTP 200 in that state, so the user sees keywords
 *      and every naive check passes, while `sourceTier === 'baseline'` reveals
 *      that no database-backed intelligence was served at all.
 *
 * This is precisely the "200 OK + baseline fallback" false-pass pattern that
 * prompt §5 / §62 forbids being counted as success.
 *
 * DELIBERATELY NOT CHANGED IN T1: no call site was invented. Wiring this into a
 * route or cron is a production-behaviour decision that belongs to the weekly
 * orchestrator (STEP 12) and requires explicit owner approval — seeding the
 * table from a code path that was never wired could mask a deeper persistence
 * failure rather than fix it.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { getBaselineKeywords } from './baselineKeywords';
import { getSupabaseAdmin, getOrGenerateWeeklySnapshot } from './seoService';

export async function seedSeoKeywords(
    client: SupabaseClient | null = getSupabaseAdmin()
): Promise<{ enInserted: number; arInserted: number; snapshotsCreated: boolean }> {
    if (!client) {
        console.warn('⚠️ [SEO Seed] Missing Supabase client, skipping DB seed.');
        return { enInserted: 0, arInserted: 0, snapshotsCreated: false };
    }

    const enKeywords = getBaselineKeywords('en');
    const arKeywords = getBaselineKeywords('ar');

    let enInserted = 0;
    let arInserted = 0;

    // Seed English keywords
    const enRows = enKeywords.map(k => ({
        language: k.language,
        locale: k.locale,
        original_keyword: k.originalKeyword,
        normalized_keyword: k.normalizedKeyword,
        cluster: k.cluster,
        intent: k.intent,
        trend_status: k.trendStatus,
        destination_path: k.destinationPath,
        score: k.score,
        score_components: k.scoreComponents,
        source: k.source,
        last_observed_at: k.lastObservedAt,
        is_active: k.isActive,
    }));

    const { data: enData, error: enError } = await client
        .from('seo_keywords')
        .upsert(enRows, { onConflict: 'language,normalized_keyword' })
        .select('id');

    if (!enError && enData) {
        enInserted = enData.length;
    } else if (enError) {
        console.error('❌ [SEO Seed] English seed error:', enError.message);
    }

    // Seed Arabic keywords
    const arRows = arKeywords.map(k => ({
        language: k.language,
        locale: k.locale,
        original_keyword: k.originalKeyword,
        normalized_keyword: k.normalizedKeyword,
        cluster: k.cluster,
        intent: k.intent,
        trend_status: k.trendStatus,
        destination_path: k.destinationPath,
        score: k.score,
        score_components: k.scoreComponents,
        source: k.source,
        last_observed_at: k.lastObservedAt,
        is_active: k.isActive,
    }));

    const { data: arData, error: arError } = await client
        .from('seo_keywords')
        .upsert(arRows, { onConflict: 'language,normalized_keyword' })
        .select('id');

    if (!arError && arData) {
        arInserted = arData.length;
    } else if (arError) {
        console.error('❌ [SEO Seed] Arabic seed error:', arError.message);
    }

    // Generate and cache initial snapshots for both languages
    await getOrGenerateWeeklySnapshot('en', client);
    await getOrGenerateWeeklySnapshot('ar', client);

    return {
        enInserted,
        arInserted,
        snapshotsCreated: true,
    };
}
