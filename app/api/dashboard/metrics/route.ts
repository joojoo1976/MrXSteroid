import { NextRequest, NextResponse } from 'next/server';
import { calculateAndPersistAdminMetrics } from '../../../../server/dashboard/dashboardService';
import { getSupabaseAdmin } from '../../../../server/seo/seoService';

export const dynamic = 'force-dynamic';

function getFallbackMetrics(metricType: string) {
    return {
        metric_date: new Date().toISOString().split('T')[0],
        metric_type: metricType,
        total_revenue_usd: 0,
        total_revenue_egp: 0,
        successful_invoices: 0,
        pending_invoices: 0,
        failed_invoices: 0,
        active_subscribers: 0,
        active_affiliates: 0,
        seo_active_keywords: 100,
        seo_avg_score: 82.5,
        metrics_payload: { fallback: true },
    };
}

export async function GET(req: NextRequest) {
    const supabase = getSupabaseAdmin();
    const url = new URL(req.url);
    const metricType = url.searchParams.get('type') || 'daily_summary';

    if (!supabase) {
        return NextResponse.json({ ok: true, metrics: getFallbackMetrics(metricType) });
    }

    try {
        const { data, error } = await supabase
            .from('admin_dashboard_metrics')
            .select('*')
            .eq('metric_type', metricType)
            .order('metric_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        // If no metric snapshot exists yet, calculate one now
        if (!data) {
            const fresh = await calculateAndPersistAdminMetrics('daily_summary', supabase);
            return NextResponse.json({ ok: true, metrics: fresh || getFallbackMetrics(metricType) });
        }

        return NextResponse.json({ ok: true, metrics: data });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(_req: NextRequest) {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ ok: true, metrics: getFallbackMetrics('daily_summary') });
    }

    try {
        const fresh = await calculateAndPersistAdminMetrics('daily_summary', supabase);
        return NextResponse.json({ ok: true, metrics: fresh || getFallbackMetrics('daily_summary') });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
