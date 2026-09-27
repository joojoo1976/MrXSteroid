import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../../../../../server/auth/require-admin';
import { PayoutService } from '../../../../../server/payments/payoutService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[AdminPayoutsGates] Missing SUPABASE_URL');
    if (!key) throw new Error('[AdminPayoutsGates] Missing SUPABASE_SERVICE_ROLE_KEY');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

/**
 * GET /api/admin/payouts/gates — machine-readable status of the payout
 * execution gates (C_2 / D_8 / LIVE_ACTIVATION). Read-only.
 */
export async function GET(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    try {
        const service = new PayoutService(getSupabaseAdmin());
        const evaluation = await service.getPayoutGates();
        return NextResponse.json({ success: true, ...evaluation });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[AdminPayoutsGates] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}