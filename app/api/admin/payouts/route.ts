import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../../../../server/auth/require-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[AdminPayouts] Missing SUPABASE_URL');
    if (!key) throw new Error('[AdminPayouts] Missing SUPABASE_SERVICE_ROLE_KEY');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

/**
 * GET /api/admin/payouts — list payouts for the admin payout surface.
 * Read-only. Never triggers a transfer.
 */
export async function GET(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    try {
        const supabase = getSupabaseAdmin();
        const url = req.nextUrl;

        const status = url.searchParams.get('status') || undefined;
        const beneficiaryId = url.searchParams.get('beneficiary_id') || undefined;
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 200);
        const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

        let query = supabase
            .from('payouts')
            .select('*, beneficiary:beneficiaries(id, name, role, is_active)')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) query = query.eq('status', status);
        if (beneficiaryId) query = query.eq('beneficiary_id', beneficiaryId);

        const { data, error } = await query;

        if (error) {
            console.error('[AdminPayouts] List error:', error);
            return NextResponse.json({ error: 'Failed to list payouts' }, { status: 500 });
        }

        return NextResponse.json({ success: true, payouts: data ?? [] });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}