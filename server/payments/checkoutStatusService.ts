/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  server/payments/checkoutStatusService.ts
 *
 *  Authoritative Server-Side Multi-Leg Settlement Status Service.
 *
 *  Security & Authorization (P0 - Finding 4 Outcome B):
 *  - Registered user's invoice: caller MUST be authenticated and match user_id.
 *  - Guest checkout: caller MUST supply the original authoritative guest_resume_token
 *    via the `x-resume-token` request header.
 *  - URL query parameter tokens are explicitly rejected (prevents token leakage in
 *    access logs, browser history, and referrer headers).
 *  - Authorization is NEVER derived from invoice UUID and email alone.
 *
 *  Sequencing Enforcement (P1):
 *  - Determines nextPendingLeg as earliest leg with status !== 'succeeded'.
 *  - Only the nextPendingLeg has isPayable = true and reveals sessionUrl.
 *  - Downstream legs remain locked with hidden (null) sessionUrls.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getAuthenticatedUser, type UserAuthResult } from '@/server/auth/resolveUser';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface CheckoutStatusDeps {
    supabase?: SupabaseClient | any;
    getAuthUser?: (req: Request) => Promise<UserAuthResult>;
}

const getDefaultAdminSupabase = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[CheckoutStatus] Missing SUPABASE_URL env var.');
    if (!key) throw new Error('[CheckoutStatus] Missing SUPABASE_SERVICE_ROLE_KEY env var.');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

export async function handleCheckoutStatus(
    req: Request,
    deps: CheckoutStatusDeps = {}
): Promise<Response> {
    try {
        const { searchParams } = new URL(req.url);
        const invoiceId = searchParams.get('invoiceId') || searchParams.get('id');

        // P0 (Finding 4): Candidate token MUST come from the x-resume-token header,
        // never from URL query parameters.
        const candidateToken = req.headers.get('x-resume-token')?.trim() || null;

        if (!invoiceId || !uuidRegex.test(invoiceId)) {
            return NextResponse.json(
                { success: false, error: 'Valid UUID invoiceId is required' },
                { status: 400 }
            );
        }

        const supabase = deps.supabase || getDefaultAdminSupabase();

        // 1. Fetch Authoritative Invoice Row
        const { data: invoice, error: invError } = await supabase
            .from('invoices')
            .select('id, user_id, customer_email, payment_status, status, amount, currency, metadata')
            .eq('id', invoiceId)
            .single();

        if (invError || !invoice) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // 2. Cryptographic Authentication & Authorization Check (P0)
        const auth = deps.getAuthUser
            ? await deps.getAuthUser(req)
            : await getAuthenticatedUser(req);

        if (auth.status === 'INVALID_TOKEN') {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired authorization token' },
                { status: 401 }
            );
        }

        const metadata = (invoice.metadata || {}) as Record<string, unknown>;
        const expectedResumeToken = (metadata.guest_resume_token as string) || null;

        if (invoice.user_id) {
            // Registered user's invoice: caller MUST be authenticated and match user_id
            if (auth.status !== 'AUTHENTICATED') {
                return NextResponse.json(
                    { success: false, error: 'Authentication required to access this invoice' },
                    { status: 401 }
                );
            }
            if (auth.userId !== invoice.user_id) {
                return NextResponse.json(
                    { success: false, error: 'Forbidden: You do not have permission to view this invoice' },
                    { status: 403 }
                );
            }
        } else {
            // Guest checkout invoice:
            // Caller must supply the original authoritative resume token in x-resume-token header
            if (!candidateToken || !expectedResumeToken || candidateToken !== expectedResumeToken) {
                return NextResponse.json(
                    { success: false, error: 'Forbidden: Valid x-resume-token header required for guest invoice' },
                    { status: 403 }
                );
            }
        }

        // 3. Fetch Authoritative Payment Legs from Database Table
        const { data: dbLegs } = await supabase
            .from('invoice_payment_legs')
            .select('*')
            .eq('invoice_id', invoiceId)
            .order('leg_index', { ascending: true });

        // Fallback to metadata payment_legs if table records not yet populated
        const rawLegs = (dbLegs && dbLegs.length > 0)
            ? dbLegs
            : ((metadata.payment_legs || []) as any[]);

        // Sort by legIndex ascending
        const sortedRawLegs = [...rawLegs].sort((a: any, b: any) => {
            const idxA = a.leg_index ?? a.legIndex ?? 0;
            const idxB = b.leg_index ?? b.legIndex ?? 0;
            return idxA - idxB;
        });

        const isCompleted = invoice.payment_status === 'paid';
        const canFulfill = isCompleted;

        // 4. Strict Sequencing Enforcement (P1):
        // Next payable leg is the earliest leg with status !== 'succeeded'.
        const targetNextPending = sortedRawLegs.find(
            (l: any) => l.status !== 'succeeded'
        ) || null;

        const mappedLegs = sortedRawLegs.map((leg: any) => {
            const legId = leg.id || `${leg.invoice_id}_leg_${leg.leg_index ?? leg.legIndex}`;
            const isTarget = targetNextPending && (
                leg.id === targetNextPending.id ||
                (leg.leg_index ?? leg.legIndex) === (targetNextPending.leg_index ?? targetNextPending.legIndex)
            );
            const isPayable = !isCompleted && Boolean(isTarget);
            const isSucceeded = leg.status === 'succeeded';

            return {
                id: legId,
                legIndex: leg.leg_index ?? leg.legIndex ?? 1,
                legType: leg.leg_type ?? leg.legType ?? 'standard',
                provider: leg.provider,
                amount: Number(leg.amount),
                currency: leg.currency,
                status: leg.status,
                isPayable,
                // Only provide sessionUrl to client if the leg is payable or already finished/failed; hide from downstream pending legs
                sessionUrl: isPayable || isSucceeded ? (leg.session_url ?? leg.sessionUrl ?? null) : null,
                providerReference: leg.provider_reference ?? leg.providerReference ?? null,
            };
        });

        const isMultiLeg = mappedLegs.length > 1;
        const nextPendingLeg = mappedLegs.find((l) => l.isPayable) || null;

        return NextResponse.json({
            success: true,
            invoiceId: invoice.id,
            paymentStatus: invoice.payment_status,
            amount: Number(invoice.amount),
            currency: invoice.currency,
            isMultiLeg,
            isCompleted,
            canFulfill,
            legs: mappedLegs,
            nextPendingLeg: isCompleted ? null : nextPendingLeg,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[CheckoutStatus] Error:', message);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
