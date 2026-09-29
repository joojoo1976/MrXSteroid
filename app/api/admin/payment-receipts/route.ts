import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../../../../server/auth/require-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[PaymentReceipts] Missing SUPABASE_URL');
    if (!key) throw new Error('[PaymentReceipts] Missing SUPABASE_SERVICE_ROLE_KEY');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

const VALID_STATUSES = [
    'awaiting_payment',
    'submitted_for_review',
    'under_review',
    'approved',
    'rejected',
    'expired',
] as const;

const VALID_PAYMENT_METHODS = ['instapay', 'bank_transfer', 'manual'] as const;

function validateStatus(status: string | null): string | undefined {
    if (!status) return undefined;
    if (VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) return status;
    throw new Error(`Invalid status: ${status}`);
}

function validatePaymentMethod(method: string | null): string | undefined {
    if (!method) return undefined;
    if (VALID_PAYMENT_METHODS.includes(method as typeof VALID_PAYMENT_METHODS[number])) return method;
    throw new Error(`Invalid payment method: ${method}`);
}

export async function GET(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    try {
        const supabase = getSupabaseAdmin();
        const url = req.nextUrl;

        // Parse and validate query params
        const status = validateStatus(url.searchParams.get('status'));
        const paymentMethod = validatePaymentMethod(url.searchParams.get('payment_method'));
        const customerEmail = url.searchParams.get('customer_email') || undefined;
        const instapayReference = url.searchParams.get('instapay_reference') || undefined;
        const dateFrom = url.searchParams.get('date_from') || undefined;
        const dateTo = url.searchParams.get('date_to') || undefined;
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 200);
        const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

        // Use the admin view for detailed data
        let query = supabase
            .from('admin_instapay_review_detail')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) query = query.eq('status', status);
        if (paymentMethod) query = query.eq('payment_method', paymentMethod);
        if (customerEmail) query = query.ilike('customer_email', `%${customerEmail}%`);
        if (instapayReference) query = query.ilike('instapay_reference', `%${instapayReference}%`);
        if (dateFrom) query = query.gte('created_at', dateFrom);
        if (dateTo) query = query.lte('created_at', dateTo);

        const { data, error, count } = await query;

        if (error) {
            console.error('[PaymentReceipts] List error:', error);
            return NextResponse.json({ error: 'Failed to list payment receipts' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            receipts: data ?? [],
            pagination: {
                total: count ?? 0,
                limit,
                offset,
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}