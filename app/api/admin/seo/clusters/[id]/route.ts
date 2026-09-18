import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../../server/seo/seoService';

export const dynamic = 'force-dynamic';

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { id } = await context.params;
    const body = await req.json();

    const allowedFields = ['name', 'name_ar', 'name_en', 'authority_status', 'description', 'pillar_keyword_id'];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
        if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabase
        .from('seo_topic_clusters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Audit
    await supabase.from('seo_keyword_audit_log').insert({
        action: 'cluster_changed',
        new_value: { cluster_id: id, ...updates },
        source: 'admin_api',
    });

    return NextResponse.json({ success: true, cluster: data });
}
