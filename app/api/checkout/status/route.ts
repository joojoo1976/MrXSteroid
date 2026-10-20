/**
 * Route Handler — /api/checkout/status
 *
 * Authoritative Server-Side Multi-Leg Settlement Status Endpoint.
 * Allows the client to check invoice status, inspect individual payment legs,
 * resume pending legs (e.g. after returning from Leg 1), and verify completion.
 *
 * Security: Uses SUPABASE_SERVICE_ROLE_KEY; read-only.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[CheckoutStatus] Missing SUPABASE_URL env var.');
    if (!key) throw new Error('[CheckoutStatus] Missing SUPABASE_SERVICE_ROLE_KEY env var.');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const invoiceId = searchParams.get('invoiceId') || searchParams.get('id');

        if (!invoiceId || !uuidRegex.test(invoiceId)) {
            return NextResponse.json(
                { success: false, error: 'Valid UUID invoiceId is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // 1. Fetch Authoritative Invoice Row
        const { data: invoice, error: invError } = await supabase
            .from('invoices')
            .select('id, payment_status, status, amount, currency, metadata')
            .eq('id', invoiceId)
            .single();

        if (invError || !invoice) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // 2. Fetch Authoritative Payment Legs from Database Table
        const { data: dbLegs } = await supabase
            .from('invoice_payment_legs')
            .select('*')
            .eq('invoice_id', invoiceId)
            .order('leg_index', { ascending: true });

        // Fallback to metadata payment_legs if table records not yet populated
        const metadata = (invoice.metadata || {}) as Record<string, unknown>;
        const rawLegs = (dbLegs && dbLegs.length > 0)
            ? dbLegs
            : ((metadata.payment_legs || []) as any[]);

        const mappedLegs = rawLegs.map((leg: any) => ({
            id: leg.id,
            legIndex: leg.leg_index ?? leg.legIndex ?? 1,
            legType: leg.leg_type ?? leg.legType ?? 'standard',
            provider: leg.provider,
            amount: Number(leg.amount),
            currency: leg.currency,
            status: leg.status,
            sessionUrl: leg.session_url ?? leg.sessionUrl ?? null,
            providerReference: leg.provider_reference ?? leg.providerReference ?? null,
        }));

        const isMultiLeg = mappedLegs.length > 1;
        const isCompleted = invoice.payment_status === 'paid';
        const canFulfill = isCompleted;

        // Find next pending or failed leg needing customer action
        const nextPendingLeg = mappedLegs.find(
            (l: any) => l.status === 'pending' || l.status === 'initiated' || l.status === 'failed'
        ) || null;

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
