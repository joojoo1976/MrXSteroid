import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../server/seo/seoService';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { data, error } = await supabase
        .from('seo_seasonal_calendar')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ events: data });
}

export async function POST(req: NextRequest) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const body = await req.json();
    const {
        event_name,
        event_name_ar,
        event_name_en,
        locale,
        country_code,
        start_date,
        end_date,
        recurring_rule,
        boost_clusters,
        boost_score,
        source_url,
        is_active,
    } = body;

    if (!event_name) {
        return NextResponse.json({ error: 'event_name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('seo_seasonal_calendar')
        .insert({
            event_name,
            event_name_ar,
            event_name_en,
            locale,
            country_code,
            start_date,
            end_date,
            recurring_rule,
            boost_clusters: boost_clusters ?? [],
            boost_score: boost_score ?? 15.0,
            source_url,
            is_active: is_active ?? true,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, event: data });
}
