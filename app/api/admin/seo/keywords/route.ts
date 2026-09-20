import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../server/seo/seoService';
import { requireAdmin } from '../../../../../server/auth/require-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang');
    const lifecycle = searchParams.get('lifecycle');
    const intent = searchParams.get('intent');
    const ymyl = searchParams.get('ymyl');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
        .from('seo_keywords')
        .select('*', { count: 'exact' });

    if (lang) query = query.eq('language', lang);
    if (lifecycle) query = query.eq('lifecycle_status', lifecycle);
    if (intent) query = query.eq('intent', intent);
    if (ymyl === 'true') query = query.eq('is_ymyl', true);

    query = query
        .order('score', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        keywords: data,
        total: count,
        offset,
        limit,
    });
}
