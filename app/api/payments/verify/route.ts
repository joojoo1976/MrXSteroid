/**
 * Route Handler — GET /api/payments/verify
 * Server-authoritative payment verification endpoint for client-side success screens.
 * Replaces trusting client URL query parameters with verified database status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '../../../../server/auth/resolveUser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('[PaymentVerify] Missing Supabase admin credentials');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId') || searchParams.get('orderRef');
    const invoiceId = searchParams.get('invoiceId') || searchParams.get('txn');

    if (!orderId && !invoiceId) {
        return NextResponse.json(
            { verified: false, error: 'Either orderId or invoiceId parameter is required' },
            { status: 400 }
        );
    }

    try {
        const supabase = getSupabaseAdmin();
        const auth = await getAuthenticatedUser(req);

        let invoice: { id: string; user_id: string | null; payment_status: string; tier_id: string | null; amount: number } | null = null;

        if (invoiceId) {
            const { data } = await supabase
                .from('invoices')
                .select('id, user_id, payment_status, tier_id, amount')
                .eq('id', invoiceId)
                .maybeSingle();
            invoice = data;
        }

        if (!invoice && orderId) {
            const { data: order } = await supabase
                .from('orders')
                .select('id, user_id, payment_status, tier_id, invoice_id, amount')
                .or(`id.eq.${orderId},order_reference.eq.${orderId}`)
                .maybeSingle();

            if (order && order.invoice_id) {
                const { data } = await supabase
                    .from('invoices')
                    .select('id, user_id, payment_status, tier_id, amount')
                    .eq('id', order.invoice_id)
                    .maybeSingle();
                invoice = data;
            } else if (order) {
                const isPaid = order.payment_status === 'paid';
                return NextResponse.json({
                    verified: isPaid,
                    status: order.payment_status,
                    tier: order.tier_id,
                });
            }
        }

        if (!invoice) {
            return NextResponse.json(
                { verified: false, status: 'not_found', error: 'Payment record not found' },
                { status: 404 }
            );
        }

        // Authorization check if user is authenticated
        if (auth.status === 'AUTHENTICATED' && invoice.user_id && invoice.user_id !== auth.userId) {
            return NextResponse.json(
                { verified: false, error: 'Forbidden: Invoice belongs to another user' },
                { status: 403 }
            );
        }

        const isPaid = invoice.payment_status === 'paid';

        return NextResponse.json({
            verified: isPaid,
            status: invoice.payment_status,
            tier: invoice.tier_id,
            invoiceId: invoice.id,
        });
    } catch (err) {
        console.error('[PaymentVerify] Verification error:', err);
        return NextResponse.json(
            { verified: false, error: 'Internal verification error' },
            { status: 500 }
        );
    }
}
