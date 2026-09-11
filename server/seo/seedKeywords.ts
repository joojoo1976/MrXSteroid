/**
 * server/seo/seedKeywords.ts
 * Seeds the database with curated baseline keywords and generates initial weekly snapshots.
 * Idempotent: uses ON CONFLICT (language, normalized_keyword) DO UPDATE.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { getBaselineKeywords } from './baselineKeywords';
import { getSupabaseAdmin, getOrGenerateWeeklySnapshot } from './seoService';
import { SeoLanguage } from './types';

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
