import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../server/seo/seoService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const keyword_id = searchParams.get('keyword_id');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
        .from('seo_keyword_audit_log')
        .select('*', { count: 'exact' });

    if (keyword_id) query = query.eq('keyword_id', keyword_id);
    if (action) query = query.eq('action', action);

    query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ events: data, total: count, offset, limit });
}
