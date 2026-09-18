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

    const allowedFields = [
        'event_name', 'event_name_ar', 'event_name_en',
        'start_date', 'end_date', 'boost_score', 'boost_clusters',
        'is_active', 'recurring_rule',
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
        if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabase
        .from('seo_seasonal_calendar')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, event: data });
}
