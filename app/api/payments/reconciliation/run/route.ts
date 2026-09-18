import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { runReconciliation } from '../../../../../server/payments/reconciliationRunner';
import { KashierGateway } from '../../../../../server/payments/gateways/KashierGateway';
import { resolveKashierPaymentOutcome } from '../../../../../server/payments/gateways/kashierVerification';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getSupabaseAdmin(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Authorization (same pattern as /api/seo/refresh):
 * 1. CRON_SECRET via `x-cron-secret` header or Bearer token
 * 2. Authenticated Admin profile
 * 3. Local development bypass when no cron secret is configured
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

export async function POST(req: NextRequest) {
    const supabase = getSupabaseAdmin();

    const authorized = await isAuthorized(req, supabase);
    if (!authorized) {
        return NextResponse.json(
            { error: 'Unauthorized: Admin privileges or valid CRON_SECRET required' },
            { status: 401 }
        );
    }

    if (!supabase) {
        return NextResponse.json(
            { error: 'Database service role client unavailable' },
            { status: 500 }
        );
    }

    const url = new URL(req.url);
    const triggerRaw = url.searchParams.get('trigger') || url.searchParams.get('source');
    const triggerSource = triggerRaw === 'manual' ? 'manual' : 'cron';
    const staleRaw = Number(url.searchParams.get('staleAfterMinutes') ?? '15');
    const limitRaw = Number(url.searchParams.get('limit') ?? '100');

    try {
        const egypt = new KashierGateway('egypt');
        const global = new KashierGateway('global');

        const summary = await runReconciliation({
            supabase,
            triggerSource,
            staleInvoiceMinutes: Number.isFinite(staleRaw) && staleRaw > 0 ? staleRaw : 15,
            limit: Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(1000, Math.floor(limitRaw)) : 100,
            statusQuery: async (intent) => {
                const sessionId = intent.provider_order_id;
                if (!sessionId) return { found: false, outcome: 'UNKNOWN' };

                // Cross-account: try Egypt then Global (a session id lives on exactly one account).
                const attempt = async (gw: KashierGateway) => {
                    try {
                        const raw = await gw.verifyPaymentSession(sessionId);
                        if (!raw) return null;
                        const resolution = resolveKashierPaymentOutcome(raw as Record<string, unknown>);
                        return {
                            found: true,
                            outcome: resolution.outcome,
                            externalReferenceId: String(raw.transactionId || raw.paymentId || '') || undefined,
                            paidAmount: raw.amount ? Number(raw.amount) : undefined,
                            providerStatus: String(raw.lastStatus || raw.status || raw.orderStatus || '') || resolution.outcome,
                            providerOperation: String(raw.operation || '') || 'pay',
                            raw: raw as Record<string, unknown>,
                        };
                    } catch {
                        return null;
                    }
                };
                return (await attempt(egypt)) || (await attempt(global)) || { found: false, outcome: 'UNKNOWN' };
            },
        });

        return NextResponse.json({ ok: true, summary });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('❌ [Reconciliation Run] failed:', message);
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}