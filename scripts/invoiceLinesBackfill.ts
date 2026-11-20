/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Invoice-Lines Backfill — pure planner (Phase 1)
 *
 *  Reads existing invoices/orders and proposes `public.invoice_lines` rows.
 *  No database access here: the CLI wrapper feeds it rows, and the unit tests
 *  feed it fixtures. The planner is deliberately deterministic and idempotent.
 *
 *  INVARIANTS
 *  ──────────
 *  1. For every covered invoice: Σ(line_total) == invoices.amount (exact to the
 *     cent). If stored data cannot support that, the planner emits ONE product
 *     line for the full amount and marks it `backfill_incomplete` — it never
 *     invents a split.
 *  2. `invoices.total_amount` / `invoices.amount` and `status` are never changed.
 *  3. Re-running the planner on an invoice that already has lines emits nothing
 *     for that invoice (idempotent).
 *  4. A discount line is the only line whose `line_total` may be negative.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type InvoiceLineType = 'product' | 'addon' | 'shipping' | 'service' | 'discount' | 'tax';

export interface InvoiceLineInsert {
    invoice_id: string;
    order_id: string | null;
    line_type: InvoiceLineType;
    sku: string | null;
    product_id: string | null;
    name_snapshot: string;
    language: 'ar' | 'en' | null;
    edition: string | null;
    qty: number;
    unit_price: number;
    discount_amount: number;
    tax_amount: number;
    line_total: number;
    currency: string;
    source: string;
    position: number;
    metadata: Record<string, unknown>;
}

export interface InvoiceRow {
    id: string;
    amount: number | string;
    currency: string;
    tier_id?: string | null;
    shipping_cost?: number | string | null;
    discount_amount?: number | string | null;
    metadata?: unknown;
    created_at?: string | null;
}

export interface OrderItemLike {
    kind?: string;
    tierId?: string;
    product_id?: string;
    sku?: string;
    name?: string;
    nameAr?: string;
    nameEn?: string;
    language?: string;
    edition?: string;
    quantity?: number;
    qty?: number;
    unitAmount?: number;
    unit_price?: number;
    unitPrice?: number;
    amount?: number;
    total_price?: number;
    totalPrice?: number;
    [key: string]: unknown;
}

export interface OrderRow {
    id: string;
    invoice_id: string;
    items?: unknown;
    amount?: number | string | null;
    currency?: string | null;
    created_at?: string | null;
}

export interface ExistingLineRow {
    invoice_id: string;
    position?: number | null;
    line_total?: number | string | null;
}

export interface InvoiceBackfillOutcome {
    invoice_id: string;
    status: 'covered' | 'incomplete' | 'skipped_existing';
    /** Rows the caller should insert (empty for skipped_existing). */
    lines: InvoiceLineInsert[];
    /** Σ(line_total) for the emitted lines. */
    planned_total: number;
    /** invoices.amount as stored. */
    invoice_total: number;
    /** planned_total - invoice_total; must be 0 for covered/incomplete. */
    deviation: number;
    reason?: string;
}

export interface BackfillPlan {
    outcomes: InvoiceBackfillOutcome[];
    lines: InvoiceLineInsert[];
    summary: {
        invoices_total: number;
        skipped_existing: number;
        covered_from_order_items: number;
        covered_from_invoice_total: number;
        incomplete: number;
        line_rows: number;
        deviations: number;
    };
}

const round2 = (n: number): number => {
    if (!Number.isFinite(n)) return 0;
    return Math.round((n + Number.EPSILON) * 100) / 100;
};

const toNumber = (value: unknown, fallback = 0): number => {
    const n = typeof value === 'string' ? Number(value) : value;
    return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
};

function readLanguage(value: unknown): 'ar' | 'en' | null {
    return value === 'ar' || value === 'en' ? value : null;
}

function readInvoiceLanguage(invoice: InvoiceRow): 'ar' | 'en' | null {
    if (invoice.metadata && typeof invoice.metadata === 'object') {
        const meta = invoice.metadata as Record<string, unknown>;
        return readLanguage(meta.language) ?? readLanguage(meta.lang);
    }
    return null;
}

function readOrderItems(order: OrderRow | undefined): OrderItemLike[] | null {
    if (!order || !Array.isArray(order.items) || order.items.length === 0) return null;
    const items = order.items.filter((item): item is OrderItemLike =>
        Boolean(item) && typeof item === 'object'
    );
    return items.length > 0 ? items : null;
}

function lineTypeFor(item: OrderItemLike): InvoiceLineType {
    const kind = String(item.kind ?? '').toLowerCase();
    if (kind === 'addon') return 'addon';
    if (kind === 'consultation' || kind === 'service') return 'service';
    return 'product';
}

function nameFor(item: OrderItemLike, fallback: string): string {
    return String(
        item.name
        ?? item.nameEn
        ?? item.nameAr
        ?? item.tierId
        ?? item.sku
        ?? fallback
    );
}

function qtyFor(item: OrderItemLike): number {
    const raw = toNumber(item.qty ?? item.quantity, 1);
    return Math.max(1, Math.floor(raw));
}

function unitPriceFor(item: OrderItemLike, lineTotal: number, qty: number): number {
    const explicit = item.unitAmount ?? item.unit_price ?? item.unitPrice;
    if (explicit !== undefined && explicit !== null) return round2(toNumber(explicit));
    return round2(lineTotal / qty);
}

function lineTotalFor(item: OrderItemLike, qty: number): number {
    const explicit = item.amount ?? item.total_price ?? item.totalPrice;
    if (explicit !== undefined && explicit !== null) return round2(toNumber(explicit));
    const unit = item.unitAmount ?? item.unit_price ?? item.unitPrice;
    if (unit !== undefined && unit !== null) return round2(toNumber(unit) * qty);
    return 0;
}

function mapOrderItemsToLines(
    invoice: InvoiceRow,
    order: OrderRow,
    items: OrderItemLike[],
    startPosition: number
): InvoiceLineInsert[] {
    const currency = invoice.currency;
    const invoiceLanguage = readInvoiceLanguage(invoice);

    return items.map((item, index) => {
        const qty = qtyFor(item);
        const lineTotal = lineTotalFor(item, qty);
        const unitPrice = unitPriceFor(item, lineTotal, qty);
        const type = lineTypeFor(item);
        const metadata: Record<string, unknown> = { backfill: true };
        if (item.shippable !== undefined) metadata.shippable = item.shippable;

        return {
            invoice_id: invoice.id,
            order_id: order.id,
            line_type: type,
            sku: item.sku ? String(item.sku) : (item.tierId ? String(item.tierId) : null),
            product_id: item.product_id ? String(item.product_id) : (item.tierId ? String(item.tierId) : null),
            name_snapshot: nameFor(item, `Invoice ${invoice.id} line ${index + 1}`),
            language: readLanguage(item.language) ?? invoiceLanguage,
            edition: item.edition ? String(item.edition) : null,
            qty,
            unit_price: unitPrice,
            discount_amount: 0,
            tax_amount: 0,
            line_total: lineTotal,
            currency,
            source: 'backfill:order_items',
            position: startPosition + index,
            metadata,
        };
    });
}

function singleProductLine(
    invoice: InvoiceRow,
    order: OrderRow | null,
    amount: number,
    reason: string
): InvoiceLineInsert {
    return {
        invoice_id: invoice.id,
        order_id: order?.id ?? null,
        line_type: 'product',
        sku: invoice.tier_id ?? null,
        product_id: invoice.tier_id ?? null,
        name_snapshot: invoice.tier_id
            ? `Backfilled: ${invoice.tier_id}`
            : `Backfilled invoice ${invoice.id}`,
        language: readInvoiceLanguage(invoice),
        edition: null,
        qty: 1,
        unit_price: Math.max(0, round2(amount)),
        discount_amount: 0,
        tax_amount: 0,
        line_total: round2(amount),
        currency: invoice.currency,
        source: 'backfill:invoice_total',
        position: 0,
        metadata: {
            backfill_incomplete: true,
            reason,
        },
    };
}

/**
 * Plan the backfill for a batch of invoices.
 *
 * @param invoices            Invoices to consider (already filtered to the batch).
 * @param ordersByInvoice     Map invoice_id → orders linked to it.
 * @param existingLineRows    Any already-present invoice_lines (only invoice_id
 *                            and position are needed). Invoices present here are
 *                            skipped wholesale.
 */
export function planInvoiceLineBackfill(
    invoices: readonly InvoiceRow[],
    ordersByInvoice: ReadonlyMap<string, readonly OrderRow[]>,
    existingLineRows: readonly ExistingLineRow[] = []
): BackfillPlan {
    const existingTotals = new Map<string, number>();
    for (const row of existingLineRows) {
        existingTotals.set(
            row.invoice_id,
            round2((existingTotals.get(row.invoice_id) ?? 0) + toNumber(row.line_total))
        );
    }

    const outcomes: InvoiceBackfillOutcome[] = [];
    const allLines: InvoiceLineInsert[] = [];

    for (const invoice of invoices) {
        const invoiceTotal = round2(toNumber(invoice.amount));
        const existingTotal = existingTotals.get(invoice.id);

        if (existingTotal !== undefined) {
            const existingDeviation = round2(existingTotal - invoiceTotal);
            outcomes.push({
                invoice_id: invoice.id,
                status: 'skipped_existing',
                lines: [],
                planned_total: existingTotal,
                invoice_total: invoiceTotal,
                deviation: existingDeviation,
                reason: Math.abs(existingDeviation) <= 0.01
                    ? 'invoice already has lines'
                    : 'invoice has partial/mismatched lines — manual review',
            });
            continue;
        }

        const orders = ordersByInvoice.get(invoice.id) ?? [];
        const order = orders[0] ?? null;
        const items = readOrderItems(order);

        let outcome: InvoiceBackfillOutcome;

        if (items) {
            const baseLines = mapOrderItemsToLines(invoice, order!, items, 0);
            const itemSum = round2(baseLines.reduce((sum, line) => sum + line.line_total, 0));
            const shippingCost = Math.max(0, round2(toNumber(invoice.shipping_cost)));
            const discountAmount = Math.max(0, round2(toNumber(invoice.discount_amount)));

            const derivedLines: InvoiceLineInsert[] = [...baseLines];
            let position = derivedLines.length;

            if (shippingCost > 0) {
                derivedLines.push({
                    invoice_id: invoice.id,
                    order_id: order!.id,
                    line_type: 'shipping',
                    sku: null,
                    product_id: null,
                    name_snapshot: 'Shipping',
                    language: null,
                    edition: null,
                    qty: 1,
                    unit_price: shippingCost,
                    discount_amount: 0,
                    tax_amount: 0,
                    line_total: shippingCost,
                    currency: invoice.currency,
                    source: 'backfill:invoice_shipping',
                    position: position++,
                    metadata: { backfill: true, derived_from: 'invoices.shipping_cost' },
                });
            }

            if (discountAmount > 0) {
                derivedLines.push({
                    invoice_id: invoice.id,
                    order_id: order!.id,
                    line_type: 'discount',
                    sku: null,
                    product_id: null,
                    name_snapshot: 'Discount',
                    language: null,
                    edition: null,
                    qty: 1,
                    unit_price: discountAmount,
                    discount_amount: 0,
                    tax_amount: 0,
                    line_total: -discountAmount,
                    currency: invoice.currency,
                    source: 'backfill:invoice_discount',
                    position: position++,
                    metadata: { backfill: true, derived_from: 'invoices.discount_amount' },
                });
            }

            const derivedSum = round2(derivedLines.reduce((sum, line) => sum + line.line_total, 0));
            const expected = round2(itemSum + shippingCost - discountAmount);
            const deviation = round2(derivedSum - invoiceTotal);

            if (Math.abs(deviation) <= 0.01 && Math.abs(expected - invoiceTotal) <= 0.01) {
                outcome = {
                    invoice_id: invoice.id,
                    status: 'covered',
                    lines: derivedLines,
                    planned_total: derivedSum,
                    invoice_total: invoiceTotal,
                    deviation,
                };
            } else {
                const reason = Math.abs(expected - invoiceTotal) <= 0.01
                    ? 'rounding_deviation'
                    : 'order_items_total_mismatch';
                const line = singleProductLine(invoice, order, invoiceTotal, reason);
                outcome = {
                    invoice_id: invoice.id,
                    status: 'incomplete',
                    lines: [line],
                    planned_total: line.line_total,
                    invoice_total: invoiceTotal,
                    deviation: round2(line.line_total - invoiceTotal),
                    reason,
                };
            }
        } else {
            const reason = order ? 'order_has_no_items' : 'no_linked_order';
            const line = singleProductLine(invoice, order, invoiceTotal, reason);
            outcome = {
                invoice_id: invoice.id,
                status: 'incomplete',
                lines: [line],
                planned_total: line.line_total,
                invoice_total: invoiceTotal,
                deviation: round2(line.line_total - invoiceTotal),
                reason,
            };
        }

        outcomes.push(outcome);
        allLines.push(...outcome.lines);
    }

    const summary = {
        invoices_total: invoices.length,
        skipped_existing: outcomes.filter((o) => o.status === 'skipped_existing').length,
        covered_from_order_items: outcomes.filter(
            (o) => o.status === 'covered' && o.lines.some((l) => l.source === 'backfill:order_items')
        ).length,
        covered_from_invoice_total: outcomes.filter((o) => o.status === 'incomplete').length,
        incomplete: outcomes.filter((o) => o.status === 'incomplete').length,
        line_rows: allLines.length,
        deviations: outcomes.filter((o) => Math.abs(o.deviation) > 0.01).length,
    };

    return { outcomes, lines: allLines, summary };
}

/** Group flat order rows into the map shape the planner expects. */
export function groupOrdersByInvoice(orders: readonly OrderRow[]): Map<string, OrderRow[]> {
    const map = new Map<string, OrderRow[]>();
    for (const order of orders) {
        const list = map.get(order.invoice_id) ?? [];
        list.push(order);
        map.set(order.invoice_id, list);
    }
    return map;
}
