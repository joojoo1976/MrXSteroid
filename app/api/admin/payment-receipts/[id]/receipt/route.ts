import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../../../../../../server/auth/require-admin';

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

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Returns a short-lived signed URL for a stored receipt so admins can view it
 * in-browser even though the bucket is private.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
    const authResult = await requireAdmin(_req);
    if (!authResult.authorized) return authResult.response;

    const { id } = await context.params;

    try {
        const supabase = getSupabaseAdmin();

        const { data: receipt, error } = await supabase
            .from('payment_receipts')
            .select('receipt_path')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            console.error('[PaymentReceipts] Signed URL read error:', error);
            return NextResponse.json({ error: 'Failed to load receipt' }, { status: 500 });
        }
        if (!receipt) {
            return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
        }
        if (!receipt.receipt_path) {
            return NextResponse.json({ error: 'No stored file for this receipt' }, { status: 404 });
        }

        const { data: signed, error: signedError } = await supabase.storage
            .from('payment-receipts')
            .createSignedUrl(receipt.receipt_path, 3600);

        if (signedError || !signed?.signedUrl) {
            console.error('[PaymentReceipts] createSignedUrl error:', signedError?.message);
            return NextResponse.json({ error: 'Failed to generate receipt URL' }, { status: 500 });
        }

        return NextResponse.json({ success: true, url: signed.signedUrl });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[PaymentReceipts] Signed URL error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}