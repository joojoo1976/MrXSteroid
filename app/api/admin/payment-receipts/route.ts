import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../../../../server/auth/require-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[PaymentReceipts] Missing SUPABASE_URL');
    if (!key) throw new Error('[PaymentReceipts] Missing SUPABASE_SERVICE_ROLE_KEY');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export async function GET(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    try {
        const supabase = getSupabaseAdmin();
        const url = req.nextUrl;

        const status = url.searchParams.get('status') || undefined;
        const paymentMethod = url.searchParams.get('payment_method') || undefined;
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 200);
        const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

        let query = supabase
            .from('payment_receipts')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) query = query.eq('status', status);
        if (paymentMethod) query = query.eq('payment_method', paymentMethod);

        const { data, error } = await query;

        if (error) {
            console.error('[PaymentReceipts] List error:', error);
            return NextResponse.json({ error: 'Failed to list payment receipts' }, { status: 500 });
        }

        return NextResponse.json({ success: true, receipts: data ?? [] });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}