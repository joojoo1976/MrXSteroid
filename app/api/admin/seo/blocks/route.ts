import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../server/seo/seoService';
import { normalizeKeyword } from '../../../../../server/seo/normalization';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { data, error } = await supabase
        .from('seo_keyword_blocks')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ blocks: data });
}

export async function POST(req: NextRequest) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const body = await req.json();
    const { keyword, language, reason, reason_code, block_scope = 'global' } = body;

    if (!keyword || !language) {
        return NextResponse.json({ error: 'Keyword and language required' }, { status: 400 });
    }

    const normalized = normalizeKeyword(keyword, language);

    const { data, error } = await supabase
        .from('seo_keyword_blocks')
        .upsert({
            normalized_keyword: normalized,
            language,
            reason,
            reason_code,
            block_scope,
            created_at: new Date().toISOString(),
        }, { onConflict: 'language,normalized_keyword,block_scope' })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update keyword status to blocked if present
    await supabase
        .from('seo_keywords')
        .update({
            lifecycle_status: 'blocked',
            is_active: false,
        })
        .eq('normalized_keyword', normalized)
        .eq('language', language);

    // Audit log
    await supabase.from('seo_keyword_audit_log').insert({
        action: 'blocked',
        new_value: { keyword, language, reason, block_scope },
        source: 'admin_api',
    });

    return NextResponse.json({ success: true, block: data });
}
