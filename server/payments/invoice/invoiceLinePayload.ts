/**
 * Invoice-line helpers for legacy (non-quote) checkout paths.
 *
 * Phase 1 made `invoice_lines` the persisted accounting representation of an
 * invoice. The quote-driven path writes them atomically through
 * `create_invoice_atomic`; the legacy `create-invoice` route and the legacy
 * `createCheckoutSession` path used to write only invoice-level totals. These
 * helpers build the identical line shape from the SAME `loadPricing()` catalog
 * and refuse to insert when the lines do not sum to the amount being charged.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
    PRICING_VERSION,
    type PricingConfig,
    type TierId,
} from '../pricing';
import { PRODUCT_NAMES } from '../quote';
import type { QuoteLine } from '../quote';

export class InvoiceLineWriteError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvoiceLineWriteError';
    }
}

export interface LegacyInvoiceLineInput {
    pricing: PricingConfig;
    tierId: TierId | string;
    currency: 'EGP' | 'USD';
    quantity?: number;
    shippingCost?: number;
    discount?: number;
    promoCode?: string;
    shippingProviderId?: string | null;
    language?: 'ar' | 'en' | null;
    source?: string;
}

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Build one product line, one optional add-on line, one optional shipping line
 * and one optional discount line. The arithmetic mirrors `computeAmount()`
 * exactly: base × qty + add-on (once) + shipping − discount.
 */
export function buildLegacyInvoiceLinePayload(input: LegacyInvoiceLineInput): QuoteLine[] {
    const currency = input.currency;
    const cur = currency === 'EGP' ? 'egp' : 'usd';
    const source = input.source || `pricing:${PRICING_VERSION}:legacy`;

    // Mirror computeAmount's base/add-on split for `*_plus` tiers.
    const rawTierId = String(input.tierId);
    const baseTierId = rawTierId.endsWith('_plus')
        ? rawTierId.slice(0, -'_plus'.length)
        : rawTierId;
    const baseTierKey = (input.pricing.tiers[baseTierId as TierId] ? baseTierId : 'bundle') as TierId;
    const baseUnit = input.pricing.tiers[baseTierKey]?.[cur];
    if (typeof baseUnit !== 'number') {
        throw new InvoiceLineWriteError(`No configured ${currency} price for tier "${rawTierId}".`);
    }

    const quantity = Math.max(1, Math.floor(input.quantity || 1));
    const addonUnit = input.pricing.addons[rawTierId as TierId]?.[cur] || 0;
    const shipping = round2(input.shippingCost || 0);
    const discount = round2(input.discount || 0);

    const lines: QuoteLine[] = [];
    let position = 0;

    lines.push({
        line_type: 'product',
        sku: baseTierKey,
        name_snapshot: PRODUCT_NAMES[baseTierKey] || baseTierKey,
        language: input.language ?? null,
        edition: null,
        qty: quantity,
        unit_price: baseUnit,
        discount_amount: 0,
        tax_amount: 0,
        line_total: round2(baseUnit * quantity),
        currency,
        source,
        position: position++,
        metadata: { legacy: true },
    });

    if (addonUnit > 0) {
        lines.push({
            line_type: 'addon',
            sku: 'coaching',
            name_snapshot: '1-on-1 Online Coaching',
            language: null,
            edition: null,
            qty: 1,
            unit_price: addonUnit,
            discount_amount: 0,
            tax_amount: 0,
            line_total: addonUnit,
            currency,
            source,
            position: position++,
            metadata: { legacy: true, plus_tier: rawTierId },
        });
    }

    if (shipping > 0) {
        const providerId = input.shippingProviderId || null;
        lines.push({
            line_type: 'shipping',
            sku: null,
            name_snapshot: 'Shipping',
            language: null,
            edition: null,
            qty: 1,
            unit_price: shipping,
            discount_amount: 0,
            tax_amount: 0,
            line_total: shipping,
            currency,
            source: `shipping:${providerId || 'legacy'}`,
            position: position++,
            metadata: { legacy: true, provider_id: providerId, amount: shipping },
        });
    }

    if (discount > 0) {
        lines.push({
            line_type: 'discount',
            sku: input.promoCode || null,
            name_snapshot: 'Discount',
            language: null,
            edition: null,
            qty: 1,
            unit_price: discount,
            discount_amount: 0,
            tax_amount: 0,
            line_total: -discount,
            currency,
            source: 'promo',
            position: position++,
            metadata: { legacy: true, promo_code: input.promoCode || null },
        });
    }

    return lines;
}

export function sumInvoiceLineTotals(lines: Array<{ line_total: number | string }>): number {
    return round2(lines.reduce((sum, line) => sum + Number(line.line_total), 0));
}

/** Insert the lines for an invoice that was already created by a legacy path. */
export async function writeInvoiceLinesForExistingInvoice(
    supabase: SupabaseClient,
    params: {
        invoiceId: string;
        orderId?: string | null;
        amount: number;
        lines: QuoteLine[];
    }
): Promise<void> {
    const expected = round2(params.amount);
    const actual = sumInvoiceLineTotals(params.lines);
    if (params.lines.length === 0 || actual !== expected) {
        throw new InvoiceLineWriteError(
            `Invoice line total mismatch: lines=${actual}, invoice=${expected}. Refusing to persist inconsistent lines.`
        );
    }

    const payload = params.lines.map((line) => ({
        invoice_id: params.invoiceId,
        order_id: params.orderId ?? null,
        line_type: line.line_type,
        sku: line.sku,
        product_id: line.sku,
        name_snapshot: line.name_snapshot,
        language: line.language,
        edition: line.edition,
        qty: line.qty,
        unit_price: line.unit_price,
        discount_amount: line.discount_amount,
        tax_amount: line.tax_amount,
        line_total: line.line_total,
        currency: line.currency,
        source: line.source,
        position: line.position,
        metadata: line.metadata,
    }));

    // Insert one row at a time: invoice lines are few, and this keeps the
    // PostgREST contract identical for every test double and production alike.
    for (const row of payload) {
        const { error } = await supabase.from('invoice_lines').insert(row).select('id').single();
        if (error) {
            throw new InvoiceLineWriteError(
                `Failed to write invoice_lines for invoice ${params.invoiceId}: ${error.message}`
            );
        }
    }
}
