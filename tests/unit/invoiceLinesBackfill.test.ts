import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
    groupOrdersByInvoice,
    planInvoiceLineBackfill,
    type ExistingLineRow,
    type InvoiceRow,
    type OrderRow,
} from '../../scripts/invoiceLinesBackfill';

const invoice = (overrides: Partial<InvoiceRow> = {}): InvoiceRow => ({
    id: 'inv-1',
    amount: 948,
    currency: 'EGP',
    tier_id: 'bundle',
    shipping_cost: 199,
    discount_amount: 0,
    metadata: { lang: 'ar' },
    ...overrides,
});

const order = (overrides: Partial<OrderRow> = {}): OrderRow => ({
    id: 'ord-1',
    invoice_id: 'inv-1',
    items: [{
        kind: 'product',
        tierId: 'bundle',
        nameEn: 'Tactical Bundle',
        quantity: 1,
        unitAmount: 749,
        amount: 749,
        language: 'ar',
        edition: 'paperback',
    }],
    ...overrides,
});

const existingFrom = (lines: ReturnType<typeof planInvoiceLineBackfill>['lines']): ExistingLineRow[] =>
    lines.map((line) => ({
        invoice_id: line.invoice_id,
        position: line.position,
        line_total: line.line_total,
    }));

describe('invoice_lines backfill planner (Phase 1)', () => {
    it('rebuilds product + shipping lines whose sum equals the stored invoice total', () => {
        const plan = planInvoiceLineBackfill(
            [invoice()],
            groupOrdersByInvoice([order()]),
            []
        );

        expect(plan.summary.covered_from_order_items).toBe(1);
        expect(plan.summary.incomplete).toBe(0);
        expect(plan.summary.deviations).toBe(0);
        expect(plan.lines.map((line) => line.line_type)).toEqual(['product', 'shipping']);
        expect(plan.lines[0]).toMatchObject({
            name_snapshot: 'Tactical Bundle',
            language: 'ar',
            edition: 'paperback',
            qty: 1,
            unit_price: 749,
            line_total: 749,
        });
        expect(plan.lines[1]).toMatchObject({
            line_type: 'shipping',
            line_total: 199,
            source: 'backfill:invoice_shipping',
        });
        expect(plan.lines.reduce((sum, line) => sum + line.line_total, 0)).toBe(948);
    });

    it('adds a negative discount line and still matches the invoice total', () => {
        const plan = planInvoiceLineBackfill(
            [invoice({ amount: 740, discount_amount: 208 })],
            groupOrdersByInvoice([order()]),
            []
        );

        expect(plan.summary.deviations).toBe(0);
        const discount = plan.lines.find((line) => line.line_type === 'discount');
        expect(discount).toMatchObject({ line_total: -208, unit_price: 208 });
        expect(plan.lines.reduce((sum, line) => sum + line.line_total, 0)).toBe(740);

        const nonDiscountNegative = plan.lines.filter(
            (line) => line.line_type !== 'discount' && line.line_total < 0
        );
        expect(nonDiscountNegative).toHaveLength(0);
    });

    it('falls back to one incomplete product line when no order/items exist — never guesses', () => {
        const plan = planInvoiceLineBackfill([invoice()], new Map(), []);

        expect(plan.summary.incomplete).toBe(1);
        expect(plan.lines).toHaveLength(1);
        expect(plan.lines[0]).toMatchObject({
            line_type: 'product',
            line_total: 948,
            source: 'backfill:invoice_total',
            metadata: { backfill_incomplete: true, reason: 'no_linked_order' },
        });
        expect(plan.summary.deviations).toBe(0);
    });

    it('falls back when order items do not reconcile with the invoice total', () => {
        const plan = planInvoiceLineBackfill(
            [invoice()],
            groupOrdersByInvoice([order({
                items: [{ kind: 'product', tierId: 'digital', quantity: 1, unitAmount: 100, amount: 100 }],
            })]),
            []
        );

        expect(plan.summary.incomplete).toBe(1);
        expect(plan.lines).toHaveLength(1);
        expect(plan.lines[0].line_total).toBe(948);
        expect(plan.lines[0].metadata).toMatchObject({
            backfill_incomplete: true,
            reason: 'order_items_total_mismatch',
        });
    });

    it('is idempotent: a second run skips invoices that already reconcile', () => {
        const first = planInvoiceLineBackfill([invoice()], groupOrdersByInvoice([order()]), []);
        const second = planInvoiceLineBackfill(
            [invoice()],
            groupOrdersByInvoice([order()]),
            existingFrom(first.lines)
        );

        expect(second.lines).toHaveLength(0);
        expect(second.summary.skipped_existing).toBe(1);
        expect(second.summary.incomplete).toBe(0);
        expect(second.summary.deviations).toBe(0);
        expect(second.outcomes[0].reason).toBe('invoice already has lines');
    });

    it('flags pre-existing partial/mismatched lines instead of appending or hiding the drift', () => {
        const plan = planInvoiceLineBackfill(
            [invoice()],
            groupOrdersByInvoice([order()]),
            [{ invoice_id: 'inv-1', position: 0, line_total: 100 }]
        );

        expect(plan.lines).toHaveLength(0);
        expect(plan.summary.skipped_existing).toBe(1);
        expect(plan.summary.deviations).toBe(1);
        expect(plan.outcomes[0].reason).toContain('manual review');
    });

    it('keeps currency on every line', () => {
        const plan = planInvoiceLineBackfill(
            [invoice({ currency: 'USD', amount: 49.99, shipping_cost: 0 })],
            groupOrdersByInvoice([order({
                items: [{ kind: 'product', tierId: 'digital', quantity: 1, unitAmount: 49.99, amount: 49.99 }],
            })]),
            []
        );

        expect(plan.lines.every((line) => line.currency === 'USD')).toBe(true);
        expect(plan.summary.deviations).toBe(0);
    });

    it('migration defines the table, the position uniqueness guard and an invoice_id index', () => {
        const sql = fs.readFileSync(
            path.resolve(process.cwd(), 'supabase/migrations/20261118150000_create_invoice_lines.sql'),
            'utf8'
        );
        expect(sql).toContain('create table if not exists public.invoice_lines');
        expect(sql).toContain('invoice_lines_invoice_position_key unique (invoice_id, position)');
        expect(sql).toContain('idx_invoice_lines_invoice_id');
        expect(sql).not.toMatch(/\bdrop table\b/i);
        expect(sql).not.toMatch(/\balter table public\.invoices\b/i);
    });
});
