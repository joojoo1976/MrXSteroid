import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../server/auth/require-admin';
import { sourceRegistry, getSourceHealthSummary } from '../../../../../server/seo/sources/registry';
import type { SourceStatusInfo } from '../../../../../server/seo/sources/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/seo/source-health
 *
 * T1 TRUTH FIX (prompt 43 / 44 / 78).
 *
 * The ONLY place the admin UI may learn a provider's real state. It reports what
 * the source registry actually declares and never computes a confidence or
 * quality score:
 *
 *   - VERIFIED appears only if the registry recorded a real successful
 *     execution (a live request returned a valid, recordable response).
 *   - A provider with no credentials is reported with its EXACT missing
 *     dependency in blocked_reason - never as a number and never as a guess.
 *   - The admin dashboard previously hardcoded
 *     google_search_console = 95 / Verified and semrush / ahrefs = 85 / Verified
 *     with no adapter, no credential and no live request behind those numbers.
 *     That claim is removed here, not restated.
 *
 * `config` is deliberately NOT forwarded: it can carry env-var names or account
 * references, and this endpoint must never become a credential-discovery surface.
 */
export async function GET(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    let rows: SourceStatusInfo[];
    try {
        rows = sourceRegistry.getSourceHealth();
    } catch (err: unknown) {
        return NextResponse.json(
            {
                error: 'Source registry could not be read',
                detail: err instanceof Error ? err.message : String(err),
            },
            { status: 500 }
        );
    }

    const sources = rows.map((info) => ({
        provider: info.provider,
        adapter_key: info.adapter_key,
        source_class: info.source_class,
        status: info.status,
        evidence_level: info.evidence_level,
        auth_required: info.auth_required,
        auth_present: info.auth_present,
        blocked_reason: info.blocked_reason,
        last_attempt_at: info.last_attempt_at,
        last_success_at: info.last_success_at,
        last_failure_at: info.last_failure_at,
        last_error: info.last_error,
        quota_limit: info.quota_limit,
        quota_used: info.quota_used,
        cost_class: info.cost_class,
        cache_ttl_seconds: info.cache_ttl_seconds,
        markets: info.markets ?? [],
        languages: info.languages ?? [],
    }));

    const summary = getSourceHealthSummary();
    const runtimeExecutable = sourceRegistry.getRuntimeExecutableSources();

    return NextResponse.json(
        {
            sources,
            summary: {
                byStatus: summary,
                total: sources.length,
                // Stated explicitly so the UI can render "0 verified" rather than
                // implying a partially connected intelligence platform.
                verified: summary.VERIFIED ?? 0,
                connected: summary.CONNECTED ?? 0,
                verifiedIsEvidenceBacked: (summary.VERIFIED ?? 0) > 0,
                runtimeExecutableCount: runtimeExecutable.length,
                blocked: sources.filter((s) => s.blocked_reason !== null).length,
            },
            generatedAt: new Date().toISOString(),
        },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}