import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { calculateAndPersistAdminMetrics } from '../../../../server/dashboard/dashboardService';
import { getSupabaseAdmin } from '../../../../server/seo/seoService';
import { requireAdmin } from '../../../../server/auth/require-admin';

export const dynamic = 'force-dynamic';

/**
 * SECURITY: these endpoints expose business-wide aggregates (revenue,
 * subscriber/affiliate counts, SEO scoring) and are backed by the Supabase
 * service-role key, which bypasses RLS. They are therefore admin-only.
 *
 * Order is mandatory: authentication + authorization run BEFORE any
 * service-role client is constructed.
 */

const ALLOWED_METRIC_TYPES = ['daily_summary', 'weekly_summary', 'realtime_snapshot'] as const;
type AllowedMetricType = (typeof ALLOWED_METRIC_TYPES)[number];

const METRIC_COLUMNS = [
    'id',
    'metric_date',
    'metric_type',
    'total_revenue_usd',
    'total_revenue_egp',
    'successful_invoices',
    'pending_invoices',
    'failed_invoices',
    'active_subscribers',
    'active_affiliates',
    'seo_active_keywords',
    'seo_avg_score',
    'metrics_payload',
    'created_at',
].join(', ');

function isAllowedMetricType(value: string): value is AllowedMetricType {
    return (ALLOWED_METRIC_TYPES as readonly string[]).includes(value);
}

function serverConfigError(requestId: string, operation: string) {
    console.error(`[DashboardMetrics:${requestId}] ${operation} rejected: service-role client unavailable`);
    return NextResponse.json(
        { ok: false, error: 'Metrics service unavailable', requestId },
        { status: 500 }
    );
}

export async function GET(req: NextRequest) {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    const url = new URL(req.url);
    const metricType = url.searchParams.get('type') || 'daily_summary';

    const supabase = getSupabaseAdmin();
    if (!supabase) return serverConfigError(crypto.randomUUID(), 'GET');

    try {
        // Read-only by contract: no upsert, no recalculation, no RPC.
        const { data, error } = await supabase
            .from('admin_dashboard_metrics')
            .select(METRIC_COLUMNS)
            .eq('metric_type', metricType)
            .order('metric_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return NextResponse.json(
                {
                    ok: false,
                    code: 'snapshot_not_available',
                    error: 'Metrics snapshot not available',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({ ok: true, metrics: data });
    } catch (e: unknown) {
        const requestId = crypto.randomUUID();
        console.error(
            `[DashboardMetrics:${requestId}] GET failed:`,
            e instanceof Error ? e.message : String(e)
        );
        return NextResponse.json(
            { ok: false, error: 'Failed to load metrics snapshot', requestId },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    const url = new URL(req.url);
    const metricType = url.searchParams.get('type') || 'daily_summary';

    if (!isAllowedMetricType(metricType)) {
        return NextResponse.json(
            { ok: false, error: 'Invalid metric type' },
            { status: 400 }
        );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) return serverConfigError(crypto.randomUUID(), 'POST');

    try {
        const fresh = await calculateAndPersistAdminMetrics(metricType, supabase);

        if (!fresh) {
            return NextResponse.json(
                { ok: false, error: 'Failed to compute metrics snapshot' },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true, metrics: fresh });
    } catch (e: unknown) {
        const requestId = crypto.randomUUID();
        console.error(
            `[DashboardMetrics:${requestId}] POST failed:`,
            e instanceof Error ? e.message : String(e)
        );
        return NextResponse.json(
            { ok: false, error: 'Failed to compute metrics snapshot', requestId },
            { status: 500 }
        );
    }
}
