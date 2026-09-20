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
    const status = searchParams.get('status');

    let query = supabase
        .from('seo_cannibalization_alerts')
        .select('*, seo_keywords(original_keyword, language)')
        .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ alerts: data });
}
