import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireAdmin } from '../../../../../server/auth/require-admin';
import { PayoutService } from '../../../../../server/payments/payoutService';
import { PayoutBlockedError } from '../../../../../server/payments/payoutGates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[AdminPayoutsApprove] Missing SUPABASE_URL');
    if (!key) throw new Error('[AdminPayoutsApprove] Missing SUPABASE_SERVICE_ROLE_KEY');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

const ApproveBodySchema = z.object({
    payoutIds: z.array(z.string().uuid()).min(1, 'At least one payout id is required'),
    approvalIdempotencyKey: z.string().min(1).max(200).optional(),
});

/**
 * POST /api/admin/payouts/approve — ADMIN BATCH APPROVAL ONLY.
 * Approves queued payouts (records admin decision + promotes linked
 * order_splits to `approved`). It NEVER executes a transfer and makes ZERO
 * external calls: while any payout gate (C_2 / D_8 / LIVE_ACTIVATION) is
 * unconfirmed this route rejects with a machine-readable PayoutBlockedError.
 */
export async function POST(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = ApproveBodySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 },
        );
    }

    try {
        const { payoutIds, approvalIdempotencyKey } = parsed.data;
        const service = new PayoutService(getSupabaseAdmin());
        const summary = await service.approveBatchPayouts(
            payoutIds,
            authResult.user.id,
            approvalIdempotencyKey,
        );
        return NextResponse.json({ success: true, ...summary });
    } catch (err) {
        if (err instanceof PayoutBlockedError) {
            return NextResponse.json(
                {
                    success: false,
                    code: err.code,
                    blockedGates: err.blockedGates,
                    error: err.message,
                },
                { status: 423 },
            );
        }
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[AdminPayoutsApprove] Unhandled error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}