import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../../server/seo/seoService';

export const dynamic = 'force-dynamic';

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { id } = await context.params;
    let body: { pin_note?: string } = {};
    try {
        body = await req.json();
    } catch {
        // empty body allowed
    }

    const { data, error } = await supabase
        .from('seo_keyword_pins')
        .upsert({
            keyword_id: id,
            pin_note: body.pin_note || 'Pinned by Admin',
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update seo_keywords.is_pinned
    await supabase
        .from('seo_keywords')
        .update({ is_pinned: true })
        .eq('id', id);

    // Audit log
    await supabase.from('seo_keyword_audit_log').insert({
        keyword_id: id,
        action: 'pinned',
        new_value: { pin_note: body.pin_note },
        source: 'admin_api',
    });

    return NextResponse.json({ success: true, pin: data });
}

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { id } = await context.params;

    const { error } = await supabase
        .from('seo_keyword_pins')
        .delete()
        .eq('keyword_id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Unpin in seo_keywords
    await supabase
        .from('seo_keywords')
        .update({ is_pinned: false })
        .eq('id', id);

    // Audit log
    await supabase.from('seo_keyword_audit_log').insert({
        keyword_id: id,
        action: 'unpinned',
        source: 'admin_api',
    });

    return NextResponse.json({ success: true, unpinned: id });
}
