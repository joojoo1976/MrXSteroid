import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../server/seo/seoService';
import { requireAdmin } from '../../../../../server/auth/require-admin';
import { CURATED_COMPETITORS } from '../../../../../server/seo/competitorIntel';

export const dynamic = 'force-dynamic';

/**
 * P1 fix (H2): the competitor sync that used to run inside the PUBLIC
 * GET /api/seo/competitors (service-role writes on every anonymous request)
 * now lives here, behind requireAdmin.
 *  - GET  → admin-only read of the tracked competitors.
 *  - POST → admin-only sync of the curated competitor list into
 *           seo_competitors (upsert on domain — re-affirms the curated list,
 *           never invents data). Per-write errors are checked; the request
 *           fails closed on partial failure.
 */
export async function GET(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { data, error } = await supabase
        .from('seo_competitors')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ competitors: data });
}

export async function POST(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    let synced = 0;
    const failures: Array<{ domain: string; message: string }> = [];

    for (const comp of CURATED_COMPETITORS) {
        const { error: upsertError } = await supabase
            .from('seo_competitors')
            .upsert({
                domain: comp.domain,
                name: comp.name,
                market: comp.market,
                language: comp.language,
                source_url: comp.sourceUrl,
                competitor_type: comp.competitorType,
                is_active: true,
            }, { onConflict: 'domain' });

        if (upsertError) {
            failures.push({ domain: comp.domain, message: upsertError.message });
        } else {
            synced++;
        }
    }

    // Audit
    await supabase.from('seo_keyword_audit_log').insert({
        action: 'competitors_synced',
        new_value: { synced, failures: failures.length },
        source: 'admin_api',
    });

    if (failures.length > 0) {
        return NextResponse.json(
            { success: false, error: 'Competitor sync partially failed', details: { synced, failures } },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, synced });
}
