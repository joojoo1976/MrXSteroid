/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ENTITLEMENT SERVICE (v4 - Digital Product Access Layer N-11)
 *  Decouples download links from core product entitlement:
 *  - Links access to (user_id, product_id, invoice_id, payment_intent_id)
 *  - Handles granting upon successful payment intent
 *  - Handles revocation hooks upon full refund (per Owner Decision 3-3)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface GrantEntitlementParams {
    userId: string;
    productId: string;
    invoiceId: string;
    paymentIntentId?: string | null;
    metadata?: Record<string, unknown>;
}

export interface EntitlementRecord {
    id: string;
    userId: string;
    productId: string;
    invoiceId: string;
    paymentIntentId: string | null;
    status: 'granted' | 'revoked' | 'suspended';
    grantedAt: string;
    revokedAt: string | null;
}

function getSupabaseAdmin(): SupabaseClient {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('[EntitlementService] Missing Supabase admin env vars.');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Grants product entitlement upon confirmed payment.
 */
export async function grantEntitlement(
    params: GrantEntitlementParams,
    supabaseClient?: SupabaseClient
): Promise<{ success: boolean; entitlementId: string }> {
    const supabase = supabaseClient || getSupabaseAdmin();

    const { data, error } = await supabase
        .from('entitlements')
        .upsert(
            {
                user_id: params.userId,
                product_id: params.productId,
                invoice_id: params.invoiceId,
                payment_intent_id: params.paymentIntentId || null,
                status: 'granted',
                granted_at: new Date().toISOString(),
                metadata: params.metadata || {},
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,product_id,invoice_id' }
        )
        .select('id')
        .single();

    if (error || !data) {
        throw new Error(`[EntitlementService] Failed to grant entitlement: ${error?.message || 'Unknown error'}`);
    }

    return { success: true, entitlementId: data.id };
}

/**
 * Revokes product entitlement (e.g. upon full refund per Decision 3-3).
 */
export async function revokeEntitlement(
    params: {
        userId: string;
        productId: string;
        invoiceId: string;
        reason?: string;
    },
    supabaseClient?: SupabaseClient
): Promise<{ success: boolean }> {
    const supabase = supabaseClient || getSupabaseAdmin();

    const { error } = await supabase
        .from('entitlements')
        .update({
            status: 'revoked',
            revoked_at: new Date().toISOString(),
            metadata: { revocationReason: params.reason || 'refund' },
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', params.userId)
        .eq('product_id', params.productId)
        .eq('invoice_id', params.invoiceId);

    if (error) {
        throw new Error(`[EntitlementService] Failed to revoke entitlement: ${error.message}`);
    }

    return { success: true };
}

/**
 * Checks if a user has an active entitlement for a product.
 */
export async function checkUserEntitlement(
    userId: string,
    productId: string,
    supabaseClient?: SupabaseClient
): Promise<boolean> {
    const supabase = supabaseClient || getSupabaseAdmin();

    const { data, error } = await supabase
        .from('entitlements')
        .select('id, status')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('status', 'granted')
        .limit(1);

    if (error || !data || data.length === 0) {
        return false;
    }

    return true;
}
