/**
 * Canonical invoice-line → entitlement-product mapping.
 *
 * Kept in its own module so both authenticated fulfillment and guest-claim
 * redemption derive entitlements from the same frozen `invoice_lines` without
 * depending on each other's Supabase mocks.
 */

export interface InvoiceLineProductRow {
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
export function canonicalProductIdForInvoiceLine(line: InvoiceLineProductRow): string | null {
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

/** Drop duplicate products while preserving the first line that granted each. */
export function uniqueEntitlementLines<T extends InvoiceLineProductRow>(lines: T[]): Array<[string, T]> {
    const byProduct = new Map<string, T>();
    for (const line of lines) {
        const productId = canonicalProductIdForInvoiceLine(line);
        if (productId && !byProduct.has(productId)) byProduct.set(productId, line);
    }
    return Array.from(byProduct.entries());
}
