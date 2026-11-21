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
 * Owner Decision 3-3:
 * Entitlement remains active for a 14-day grace period upon refund before being revoked.
 */
export const ENTITLEMENT_GRACE_PERIOD_DAYS = 14;

/**
 * Schedules entitlement revocation after the 14-day grace period (Owner Decision 3-3).
 */
export async function scheduleEntitlementRevocation(
    params: {
        userId: string;
        productId: string;
        invoiceId: string;
        reason?: string;
    },
    supabaseClient?: SupabaseClient
): Promise<{ scheduledRevocationAt: string }> {
    const supabase = supabaseClient || getSupabaseAdmin();
    const scheduledRevocationAt = new Date(
        Date.now() + ENTITLEMENT_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    const { error } = await supabase
        .from('entitlements')
        .update({
            metadata: {
                revocationScheduledAt: scheduledRevocationAt,
                gracePeriodDays: ENTITLEMENT_GRACE_PERIOD_DAYS,
                reason: params.reason || 'refund_requested',
            },
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', params.userId)
        .eq('product_id', params.productId)
        .eq('invoice_id', params.invoiceId);

    if (error) {
        throw new Error(`[EntitlementService] Failed to schedule entitlement revocation: ${error.message}`);
    }

    return { scheduledRevocationAt };
}

/**
 * Revokes product entitlement immediately.
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

export type InvoiceLineEntitlementSource = 'invoice_lines' | 'legacy_fallback';

export interface GrantEntitlementsFromInvoiceParams {
    userId: string;
    invoiceId: string;
    paymentIntentId?: string | null;
    /** Used only when the invoice predates `invoice_lines` (or has no lines). */
    fallbackProductId?: string | null;
}

export interface GrantEntitlementsFromInvoiceResult {
    success: boolean;
    entitlementIds: string[];
    source: InvoiceLineEntitlementSource;
}

interface InvoiceLineRow {
    line_type?: string | null;
    sku?: string | null;
    product_id?: string | null;
    language?: string | null;
    qty?: number | null;
    metadata?: Record<string, unknown> | null;
}

const TIER_TO_CANONICAL_PRODUCT: Record<string, string> = {
    digital: 'MRX-PROTOCOL',
    digital_plus: 'MRX-PROTOCOL',
    pdf: 'MRX-PROTOCOL',
    bundle: 'MRX-TACTICAL',
    bundle_plus: 'MRX-TACTICAL',
    paperback: 'MRX-TACTICAL',
    coaching: 'MRX-SMART-PRO',
    coaching_plus: 'MRX-SMART-PRO',
};

/** Map an invoice line to the entitlement product id, or null for non-products. */
export function canonicalProductIdForInvoiceLine(line: InvoiceLineRow): string | null {
    const lineType = String(line.line_type || '').toLowerCase();
    const sku = String(line.sku || line.product_id || '').trim().toLowerCase();
    if (!sku || lineType === 'shipping' || lineType === 'discount' || lineType === 'tax') {
        return null;
    }

    if (lineType === 'addon') return 'MRX-COACHING-ADDON';
    if (lineType === 'service') {
        if (sku === 'consultation') return 'MRX-CONSULTATION';
        if (sku === 'vip_coaching' || sku === 'coaching_service') return 'MRX-COACHING-ADDON';
        return null;
    }

    if (sku.startsWith('mrx-')) return sku.toUpperCase();
    return TIER_TO_CANONICAL_PRODUCT[sku] || null;
}

/**
 * Builds entitlements from the frozen invoice lines (Phase 7), not from the
 * order/tier shortcut. Legacy invoices without lines fall back to the supplied
 * product id so existing paid rows remain deliverable.
 */
export async function grantEntitlementsFromInvoice(
    params: GrantEntitlementsFromInvoiceParams,
    supabaseClient?: SupabaseClient
): Promise<GrantEntitlementsFromInvoiceResult> {
    const supabase = supabaseClient || getSupabaseAdmin();

    let lines: InvoiceLineRow[] = [];
    try {
        const { data, error } = await supabase
            .from('invoice_lines')
            .select('line_type, sku, product_id, language, qty, metadata')
            .eq('invoice_id', params.invoiceId);
        if (!error && Array.isArray(data)) lines = data as InvoiceLineRow[];
    } catch {
        // Pre-Phase-1 rows / fakes without the table use the legacy fallback.
    }

    const source: InvoiceLineEntitlementSource = lines.length > 0 ? 'invoice_lines' : 'legacy_fallback';
    if (lines.length === 0 && params.fallbackProductId) {
        lines = [{ line_type: 'product', sku: params.fallbackProductId }];
    }

    const byProduct = new Map<string, InvoiceLineRow>();
    for (const line of lines) {
        const productId = canonicalProductIdForInvoiceLine(line);
        if (productId && !byProduct.has(productId)) byProduct.set(productId, line);
    }

    const entitlementIds: string[] = [];
    for (const [productId, line] of byProduct.entries()) {
        const granted = await grantEntitlement(
            {
                userId: params.userId,
                productId,
                invoiceId: params.invoiceId,
                paymentIntentId: params.paymentIntentId,
                metadata: {
                    ...(line.metadata || {}),
                    source,
                    invoice_line_sku: line.sku || null,
                    language: line.language || null,
                },
            },
            supabase
        );
        entitlementIds.push(granted.entitlementId);
    }

    return { success: entitlementIds.length > 0, entitlementIds, source };
}
