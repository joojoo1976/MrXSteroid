import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { buildReconciliationSnapshot } from '../../../../server/payments/reconciliationService';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Authorization — IDENTICAL to the guard on
 * `/api/payments/reconciliation/run` (same CRON_SECRET → admin-JWT →
 * development-bypass order), deliberately duplicated as a verbatim copy rather
 * than extracted into a shared module so this read-only route keeps no import
 * coupling to the settlement route. The two must stay behaviourally identical;
 * `tests/unit/reconciliationRouteAuthorization.test.ts` asserts that.
 *
 * Before this guard existed, this route exposed live invoice and
 * payment_intent aggregates to any unauthenticated caller using the
 * service-role client. It is read-only, so the risk was disclosure rather than
 * corruption — but it sat on a payment route and is now fail-closed.
 */
async function isAuthorized(req: NextRequest, supabase: SupabaseClient | null): Promise<boolean> {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization') || '';
    const cronHeader = req.headers.get('x-cron-secret') || '';

    if (cronSecret) {
        if (cronHeader === cronSecret) return true;
        if (authHeader.replace(/^Bearer\s+/i, '').trim() === cronSecret) return true;
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token && supabase) {
        try {
            const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
            if (!userErr && user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (profile?.role === 'admin') return true;
            }
        } catch {
            // Ignore auth error
        }
    }

    if (process.env.NODE_ENV === 'development' && !cronSecret) return true;

    return false;
}

export async function GET(req: NextRequest) {
    const supabase = getSupabaseAdmin();

    const authorized = await isAuthorized(req, supabase);
    if (!authorized) {
        return NextResponse.json(
            { error: 'Unauthorized: Admin privileges or valid CRON_SECRET required' },
            { status: 401 }
        );
    }

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