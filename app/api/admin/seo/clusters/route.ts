import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../server/seo/seoService';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { data, error } = await supabase
        .from('seo_topic_clusters')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ clusters: data });
}

export async function POST(req: NextRequest) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const body = await req.json();
    const { name, name_ar, name_en, locale, country_code, parent_cluster_id, description, authority_status } = body;

    if (!name) {
        return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('seo_topic_clusters')
        .insert({
            name,
            name_ar,
            name_en,
            locale,
            country_code,
            parent_cluster_id: parent_cluster_id ?? null,
            description,
            authority_status: authority_status ?? 'planned',
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, cluster: data });
}
