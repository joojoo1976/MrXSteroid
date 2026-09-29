import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireAdmin } from '../../../../../server/auth/require-admin';
import { applyProviderVerdict } from '../../../../../server/payments/fulfillmentService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Terminal states that cannot be transitioned from (except for audit) */
const TERMINAL_STATUSES = new Set(['approved', 'rejected', 'expired']);

/** Valid transitions from each source state */
const VALID_TRANSITIONS: Record<string, string[]> = {
    awaiting_payment: ['submitted_for_review'],
    submitted_for_review: ['under_review', 'rejected', 'expired'],
    under_review: ['approved', 'rejected', 'expired'],
    approved: [],
    rejected: [],
    expired: [],
};

const ReviewSchema = z
    .object({
        status: z.enum(['under_review', 'approved', 'rejected']),
        reviewNotes: z.string().max(2000).optional(),
        rejectionReason: z.string().max(2000).optional(),
        submittedAmount: z.number().positive().optional(),
        submittedCurrency: z.enum(['EGP', 'USD']).optional(),
        instapayReference: z.string().max(200).optional(),
        instapayTransactionId: z.string().max(200).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.status === 'rejected' && !data.rejectionReason?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rejectionReason'],
                message: 'Rejection reason is required when rejecting a receipt',
            });
        }
        if (data.status === 'approved') {
            if (data.submittedAmount !== undefined && data.submittedAmount <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['submittedAmount'],
                    message: 'Submitted amount must be positive',
                });
            }
            if (!data.instapayReference?.trim() && !data.instapayTransactionId?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['instapayReference'],
                    message: 'InstaPay reference or transaction ID is required for approval',
                });
            }
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

    const {
        status,
        reviewNotes,
        rejectionReason,
        submittedAmount,
        submittedCurrency,
        instapayReference,
        instapayTransactionId,
    } = parsed.data;

    try {
        const supabase = getSupabaseAdmin();
        const now = new Date().toISOString();
        const adminId = authResult.user.id;

        // ─── 1. Load receipt with all linked records ──────────────────────────
        const { data: receipt, error: readError } = await supabase
            .from('payment_receipts')
            .select(
                `id, order_id, invoice_id, payment_intent_id, status, payment_method,
                 amount, currency, submitted_amount, submitted_currency,
                 instapay_reference, instapay_transaction_id, customer_name,
                 customer_email, customer_phone, transaction_reference,
                 receipt_url, receipt_path, metadata, created_at`
            )
            .eq('id', id)
            .maybeSingle();

        if (readError) {
            console.error('[PaymentReceipts] Read error:', readError);
            return NextResponse.json({ error: 'Failed to load receipt' }, { status: 500 });
        }

        if (!receipt) {
            return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
        }

        // ─── 2. Validate state transition ────────────────────────────────────
        const currentStatus = receipt.status;
        const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
        if (!allowedNext.includes(status)) {
            return NextResponse.json(
                {
                    error: `Invalid transition from '${currentStatus}' to '${status}'. Allowed: ${allowedNext.join(', ')}`,
                },
                { status: 409 }
            );
        }

        if (TERMINAL_STATUSES.has(currentStatus) && currentStatus !== status) {
            return NextResponse.json(
                { error: `Receipt is already in terminal state '${currentStatus}' and cannot be changed` },
                { status: 409 }
            );
        }

        // ─── 3. Validate approval-specific requirements ──────────────────────
        if (status === 'approved') {
            // Server amount is authoritative - customer submitted amount is recorded but not trusted
            if (submittedAmount !== undefined && Math.abs(submittedAmount - receipt.amount) > 0.01) {
                // Record mismatch but don't block - admin can still approve with note
                console.warn(
                    `[PaymentReceipts] Amount mismatch: server=${receipt.amount} ${receipt.currency}, submitted=${submittedAmount} ${submittedCurrency || receipt.currency}`
                );
            }
            // InstaPay reference/transaction ID is required for audit trail
            if (!instapayReference?.trim() && !instapayTransactionId?.trim()) {
                return NextResponse.json(
                    { error: 'InstaPay reference or transaction ID is required for approval' },
                    { status: 400 }
                );
            }
        }

        // ─── 4. Begin atomic transaction using RPC for approval ───────────────
        if (status === 'approved') {
            // Use a server-side RPC to ensure atomic approval + settlement
            const { data: approvalResult, error: approvalError } = await supabase
                .rpc('approve_instapay_receipt', {
                    p_receipt_id: id,
                    p_admin_id: adminId,
                    p_submitted_amount: submittedAmount ?? null,
                    p_submitted_currency: submittedCurrency ?? null,
                    p_instapay_reference: instapayReference ?? null,
                    p_instapay_transaction_id: instapayTransactionId ?? null,
                    p_review_notes: reviewNotes ?? null,
                    p_rejection_reason: rejectionReason ?? null,
                });

            if (approvalError) {
                console.error('[PaymentReceipts] Approval RPC error:', approvalError);
                return NextResponse.json(
                    { error: 'Approval failed: ' + approvalError.message },
                    { status: 500 }
                );
            }

            if (!approvalResult?.success) {
                return NextResponse.json(
                    { error: approvalResult?.error || 'Approval failed' },
                    { status: 409 }
                );
            }

            return NextResponse.json({
                success: true,
                receipt: approvalResult.receipt,
                orderStatus: approvalResult.order_status,
                settlement: approvalResult.settlement,
            });
        }

        // ─── 5. Handle rejection / under_review (non-approval paths) ──────────
        if (status === 'rejected' || status === 'under_review') {
            const updates: Record<string, unknown> = {
                status,
                reviewed_by: adminId,
                reviewed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            if (reviewNotes !== undefined) updates['review_notes'] = reviewNotes;
            if (rejectionReason !== undefined) updates['rejection_reason'] = rejectionReason;
            if (status === 'rejected') {
                updates['rejection_reason'] = rejectionReason;
            }
            if (status === 'under_review') {
                updates['review_started_at'] = new Date().toISOString();
            }

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

            // ─── 5a. Handle order settlement for rejection ────────────────────
            if (status === 'rejected' && receipt.order_id) {
                await supabase
                    .from('orders')
                    .update({
                        status: 'cancelled',
                        payment_status: 'failed',
                        updated_at: nowIso(),
                    })
                    .eq('id', receipt.order_id);
            }

            // ─── 5b. Audit trail ──────────────────────────────────────────────
            await supabase.from('audit_log').insert({
                actor_id: adminId,
                actor_type: 'admin',
                action: `payment_receipt.${status}`,
                entity_type: 'payment_receipt',
                entity_id: id,
                old_state: {
                    status: currentStatus,
                    order_status: receipt.order_id ? 'pending_manual_review' : null,
                },
                new_state: {
                    status,
                    order_status: status === 'rejected' ? 'cancelled' : null,
                    payment_status: status === 'rejected' ? 'failed' : null,
                },
                metadata: {
                    reviewNotes: reviewNotes || null,
                    rejectionReason: status === 'rejected' ? rejectionReason : null,
                    submittedAmount: submittedAmount ?? null,
                    submittedCurrency: submittedCurrency ?? null,
                    instapayReference: instapayReference ?? null,
                },
            });

            return NextResponse.json({
                success: true,
                receipt: updated,
                orderStatus: status === 'rejected' ? 'cancelled' : currentStatus,
            });
        }

        // Should not reach here
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[PaymentReceipts] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// Helper function for ISO timestamp
function nowIso(): string {
    return new Date().toISOString();
}