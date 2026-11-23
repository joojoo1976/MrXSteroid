/**
 * Route Handler — POST /api/admin/refunds
 *
 * Records an operator-initiated refund against an invoice. Phase A scope:
 *
 *   - NO provider call is made. The operator performs the actual refund in the
 *     gateway dashboard and records it here for audit + access policy.
 *   - The row is written to `refunds` (existing table — no migration).
 *   - A COMPLETED FULL refund revokes the invoice's entitlements and clears
 *     `profiles.has_paid` only when no granted entitlement remains.
 *   - A partial refund is recorded only; access is untouched.
 *
 * Authorization mirrors /api/admin/payment-receipts: bearer token → verified
 * Supabase user → profiles.role === 'admin'.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireAdmin } from '../../../../server/auth/require-admin';
import { recordAdminRefund } from '../../../../server/payments/refund/refundEvent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RefundSchema = z
    .object({
        invoiceId: z.string().uuid(),
        amountMinor: z.number().int().positive().optional(),
        currency: z.enum(['EGP', 'USD']).optional(),
        reason: z.string().trim().min(3).max(500),
        status: z.enum(['requested', 'completed', 'cancelled']).optional(),
        provider: z.string().trim().max(40).optional(),
        providerReference: z.string().trim().max(200).optional(),
    })
    .strict();

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[AdminRefunds] Missing SUPABASE_URL');
    if (!key) throw new Error('[AdminRefunds] Missing SUPABASE_SERVICE_ROLE_KEY');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export async function POST(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = RefundSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    try {
        const supabase = getSupabaseAdmin();
        const result = await recordAdminRefund(supabase, {
            ...parsed.data,
            adminId: authResult.user.id,
        });

        switch (result.code) {
            case 'recorded':
                return NextResponse.json(
                    {
                        success: true,
                        refundId: result.refundId,
                        status: result.status,
                        fullRefund: result.fullRefund,
                        accessRevoked: result.accessRevoked,
                        hasPaidCleared: result.hasPaidCleared,
                    },
                    { status: 201 }
                );
            case 'duplicate':
                return NextResponse.json(
                    { error: 'A refund with this provider reference already exists', code: 'DUPLICATE_REFUND' },
                    { status: 409 }
                );
            case 'invoice_not_found':
                return NextResponse.json(
                    { error: 'Invoice not found', code: 'INVOICE_NOT_FOUND' },
                    { status: 404 }
                );
            case 'payment_intent_not_found':
                return NextResponse.json(
                    {
                        error: 'This invoice has no payment intent to link a refund to',
                        code: 'PAYMENT_INTENT_NOT_FOUND',
                    },
                    { status: 409 }
                );
            case 'invalid_amount':
                return NextResponse.json(
                    { error: result.error || 'Invalid refund amount', code: 'INVALID_AMOUNT' },
                    { status: 400 }
                );
            default:
                console.error('[AdminRefunds] Record failed:', result.error);
                return NextResponse.json(
                    { error: 'Could not record the refund', code: 'REFUND_RECORD_FAILED' },
                    { status: 500 }
                );
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[AdminRefunds] Unhandled error:', message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
