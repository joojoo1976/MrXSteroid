import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildReconciliationSnapshot } from '../../../../server/payments/reconciliationService';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET(req: NextRequest) {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ ok: false, error: 'Reconciliation unguarded — admin env not configured.' }, { status: 503 });
    }

    const url = new URL(req.url);
    const staleRaw = Number(url.searchParams.get('staleAfterMinutes') ?? '15');
    const maxEventsRaw = Number(url.searchParams.get('maxEvents') ?? '500');

    try {
        const snapshot = await buildReconciliationSnapshot({
            supabase,
            staleInvoiceMinutes: Number.isFinite(staleRaw) && staleRaw > 0 ? staleRaw : 15,
            maxEvents: Number.isFinite(maxEventsRaw) && maxEventsRaw > 0 ? Math.min(2000, Math.floor(maxEventsRaw)) : 500,
        });
        return NextResponse.json({ ok: true, snapshot });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('❌ [Reconciliation] failed:', message);
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}