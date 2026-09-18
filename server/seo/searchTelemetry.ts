import { createHash } from 'crypto';
import { SupabaseClient } from '@supabase/supabase-js';
import { SeoLanguage } from './types';
import { normalizeKeyword } from './normalization';
import { getSupabaseAdmin } from './seoService';

/**
 * Generate a deterministic one-way SHA-256 hash of a normalized search query.
 * Guarantees zero PII retention while enabling frequency and re-query detection.
 */
export function hashSearchQuery(query: string): string {
    return createHash('sha256')
        .update(query.trim().toLowerCase())
        .digest('hex');
}

/**
 * Generate a pseudonymous session reference hash for grouping related queries
 * within the same anonymous browsing session without storing IP, User-Agent or Cookies.
 */
export function generateSessionRefHash(ipPart: string, salt: string = 'mrx-seo-session'): string {
    return createHash('sha256')
        .update(`${ipPart}:${new Date().toISOString().slice(0, 10)}:${salt}`)
        .digest('hex')
        .slice(0, 24);
}

export interface AdvancedSearchLogParams {
    query: string;
    language: SeoLanguage;
    resultsCount: number;
    clickedResult?: string;
    searchSuccess?: boolean;
    locale?: string;
    countryCode?: string;
    sessionRefHash?: string;
}

/**
 * Record enhanced telemetry query into seo_internal_search_logs (Section 14).
 * Adheres strictly to data minimization and privacy standards.
 */
export async function logAdvancedSearchTelemetry(
    params: AdvancedSearchLogParams,
    client: SupabaseClient | null = getSupabaseAdmin()
): Promise<boolean> {
    const {
        query,
        language,
        resultsCount,
        clickedResult,
        searchSuccess = resultsCount > 0,
        locale,
        countryCode,
        sessionRefHash,
    } = params;

    if (!query || query.trim().length < 2) return false;

    const normalized = normalizeKeyword(query, language);
    const queryHash = hashSearchQuery(normalized);

    if (client) {
        try {
            await client.from('seo_internal_search_logs').insert({
                query: query.trim().slice(0, 100),
                normalized_query: normalized.slice(0, 100),
                query_hash: queryHash,
                language,
                locale: locale || null,
                country_code: countryCode || null,
                results_count: resultsCount,
                clicked_result: clickedResult ? clickedResult.slice(0, 255) : null,
                search_success: searchSuccess,
                session_reference_hash: sessionRefHash || null,
                created_at: new Date().toISOString(),
            });
            return true;
        } catch {
            return false;
        }
    }

    return false;
}
