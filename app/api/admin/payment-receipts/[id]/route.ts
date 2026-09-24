import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireAdmin } from '../../../../../server/auth/require-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FINAL_STATUSES = new Set(['verified', 'rejected', 'expired']);

const ReviewSchema = z
    .object({
        status: z.enum(['under_review', 'verified', 'rejected']),
        reviewNotes: z.string().max(2000).optional(),
        rejectionReason: z.string().max(2000).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.status === 'rejected' && !data.rejectionReason) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rejectionReason'],
                message: 'Rejection reason is required when rejecting a receipt',
            });
        }
    });

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[PaymentReceipts] Missing SUPABASE_URL');
    if (!key) throw new Error('[PaymentReceipts] Missing SUPABASE_SERVICE_ROLE_KEY');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    const { id } = await context.params;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const { status, reviewNotes, rejectionReason } = parsed.data;

    try {
        const supabase = getSupabaseAdmin();

        const { data: receipt, error: readError } = await supabase
            .from('payment_receipts')
            .select('id, order_id, status, payment_method, amount, currency')
            .eq('id', id)
            .maybeSingle();

        if (readError) {
            console.error('[PaymentReceipts] Read error:', readError);
            return NextResponse.json({ error: 'Failed to load receipt' }, { status: 500 });
        }

        if (!receipt) {
            return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
        }

        if (FINAL_STATUSES.has(receipt.status) && receipt.status !== status) {
            return NextResponse.json(
                { error: `Receipt is already in terminal state '${receipt.status}' and cannot be changed` },
                { status: 409 }
            );
        }

        const now = new Date().toISOString();
        const updates: Record<string, unknown> = {
            status,
            reviewed_by: authResult.user.id,
            reviewed_at: now,
            updated_at: now,
        };
        if (reviewNotes !== undefined) updates['review_notes'] = reviewNotes;
        if (rejectionReason !== undefined) updates['rejection_reason'] = rejectionReason;

        const { data: updated, error: updateError } = await supabase
            .from('payment_receipts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('[PaymentReceipts] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to update receipt' }, { status: 500 });
        }

        // Settle the linked order: verified → processing + payment_status=paid (payment confirmed),
        // rejected → cancelled + payment_status=failed (invalid/never-confirmed payment).
        if (receipt.order_id) {
            const orderStatus = status === 'verified' ? 'processing' : status === 'rejected' ? 'cancelled' : null;
            const paymentStatus = status === 'verified' ? 'paid' : status === 'rejected' ? 'failed' : null;
            if (orderStatus) {
                const orderPatch: Record<string, unknown> = { status: orderStatus, updated_at: now };
                if (paymentStatus) orderPatch['payment_status'] = paymentStatus;
                const { error: orderError } = await supabase
                    .from('orders')
                    .update(orderPatch)
                    .eq('id', receipt.order_id);

                if (orderError) {
                    console.warn(`[PaymentReceipts] Order ${receipt.order_id} not settled:`, orderError.message);
                }
            }
        }

        // Audit trail for the review action.
        await supabase.from('audit_log').insert({
            actor_id: authResult.user.id,
            actor_type: 'admin',
            action: `payment_receipt.${status}`,
            entity_type: 'payment_receipt',
            entity_id: id,
            old_state: {
                status: receipt.status,
                order_status: receipt.status,
            },
            new_state: {
                status,
                order_status: status === 'verified' ? 'processing' : status === 'rejected' ? 'cancelled' : receipt.status,
                payment_status: status === 'verified' ? 'paid' : status === 'rejected' ? 'failed' : null,
            },
            metadata: {
                reviewNotes: reviewNotes || null,
                rejectionReason: status === 'rejected' ? rejectionReason : null,
            },
        });

        return NextResponse.json({
            success: true,
            receipt: updated,
            orderStatus: status === 'verified' ? 'processing' : status === 'rejected' ? 'cancelled' : receipt.status,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[PaymentReceipts] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}