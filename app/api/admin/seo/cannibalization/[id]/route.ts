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

    const allowedFields = ['status', 'notes', 'severity'];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
        if (key in body) updates[key] = body[key];
    }
    updates['updated_at'] = new Date().toISOString();

    const { data, error } = await supabase
        .from('seo_cannibalization_alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, alert: data });
}
