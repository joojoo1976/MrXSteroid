import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../../server/seo/seoService';

export const dynamic = 'force-dynamic';

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const allowedFields = [
        'lifecycle_status',
        'is_active',
        'review_status',
        'review_notes',
        'destination_path',
        'target_url',
        'destination_type',
        'destination_verified',
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
        if (key in body) {
            updates[key] = body[key];
        }
    }

    updates['updated_at'] = new Date().toISOString();

    const { data, error } = await supabase
        .from('seo_keywords')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event
    await supabase.from('seo_keyword_audit_log').insert({
        keyword_id: id,
        action: 'updated',
        new_value: updates,
        source: 'admin_api',
    });

    return NextResponse.json({ success: true, keyword: data });
}
