import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../server/seo/seoService';
import { requireAdmin } from '../../../../../server/auth/require-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { data, error } = await supabase
        .from('seo_keyword_sources')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sources: data });
}

export async function POST(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const body = await req.json();
    const {
        source_type,
        source_name,
        source_url,
        provider_account_ref,
        country_code,
        locale,
        retrieval_period_start,
        retrieval_period_end,
        reliability_score,
        terms_verified,
        metadata,
    } = body;

    if (!source_type || !source_name) {
        return NextResponse.json(
            { error: 'source_type and source_name are required' },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from('seo_keyword_sources')
        .insert({
            source_type,
            source_name,
            source_url,
            provider_account_ref,
            country_code,
            locale,
            retrieval_period_start,
            retrieval_period_end,
            reliability_score: reliability_score ?? null,
            terms_verified: terms_verified ?? false,
            metadata: metadata ?? {},
            retrieved_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Audit
    await supabase.from('seo_keyword_audit_log').insert({
        action: 'source_linked',
        new_value: { source_name, source_type },
        source: 'admin_api',
    });

    return NextResponse.json({ success: true, source: data });
}
