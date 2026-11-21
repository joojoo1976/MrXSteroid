/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Invoice-Lines Backfill CLI — Phase 1
 *
 *  Usage:
 *    npx tsx scripts/backfill-invoice-lines.ts                 # dry-run (default)
 *    npx tsx scripts/backfill-invoice-lines.ts --apply         # write lines
 *    npx tsx scripts/backfill-invoice-lines.ts --apply --batch=100
 *    npx tsx scripts/backfill-invoice-lines.ts --limit=50      # smoke run
 *
 *  SAFETY
 *  ──────
 *  • Never updates invoices.amount, status or any existing row.
 *  • Dry-run is the default; writes require an explicit --apply.
 *  • Idempotent: invoices that already have lines are skipped, and inserts use
 *    ON CONFLICT (invoice_id, position) DO NOTHING.
 *  • Works only with SERVICE ROLE credentials. It never prints secrets.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import {
    groupOrdersByInvoice,
    planInvoiceLineBackfill,
    type ExistingLineRow,
    type InvoiceRow,
    type OrderRow,
} from './invoiceLinesBackfill';

const PAGE_SIZE = 500;

function argValue(name: string): string | undefined {
    const prefix = `--${name}=`;
    const hit = process.argv.find((arg) => arg.startsWith(prefix));
    return hit ? hit.slice(prefix.length) : undefined;
}

const APPLY = process.argv.includes('--apply');
const BATCH_SIZE = Math.max(1, Number(argValue('batch') ?? PAGE_SIZE) || PAGE_SIZE);
const LIMIT = Number(argValue('limit') ?? 0) || Infinity;

function requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`[Backfill] Missing required environment variable: ${name}`);
    return value;
}

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fetchInvoices(): Promise<InvoiceRow[]> {
    const rows: InvoiceRow[] = [];
    let from = 0;

    while (rows.length < LIMIT) {
        const to = Math.min(from + BATCH_SIZE - 1, Number.isFinite(LIMIT) ? LIMIT - 1 : from + BATCH_SIZE - 1);
        const { data, error } = await supabase
            .from('invoices')
            .select('id, amount, currency, tier_id, shipping_cost, discount_amount, metadata, created_at')
            .order('id', { ascending: true })
            .range(from, to);

        if (error) throw new Error(`[Backfill] Failed to read invoices: ${error.message}`);
        if (!data || data.length === 0) break;

        rows.push(...(data as InvoiceRow[]));
        if (data.length < BATCH_SIZE) break;
        from += BATCH_SIZE;
    }

    return rows.slice(0, Number.isFinite(LIMIT) ? LIMIT : rows.length);
}

async function fetchOrders(invoiceIds: string[]): Promise<OrderRow[]> {
    const rows: OrderRow[] = [];
    for (let i = 0; i < invoiceIds.length; i += 100) {
        const slice = invoiceIds.slice(i, i + 100);
        const { data, error } = await supabase
            .from('orders')
            .select('id, invoice_id, items, amount, currency, created_at')
            .in('invoice_id', slice);
        if (error) throw new Error(`[Backfill] Failed to read orders: ${error.message}`);
        rows.push(...((data ?? []) as OrderRow[]));
    }
    return rows;
}

async function fetchExistingLines(invoiceIds: string[]): Promise<ExistingLineRow[]> {
    const rows: ExistingLineRow[] = [];
    for (let i = 0; i < invoiceIds.length; i += 100) {
        const slice = invoiceIds.slice(i, i + 100);
        const { data, error } = await supabase
            .from('invoice_lines')
            .select('invoice_id, position, line_total')
            .in('invoice_id', slice);
        if (error) throw new Error(`[Backfill] Failed to read invoice_lines: ${error.message}`);
        rows.push(...((data ?? []) as ExistingLineRow[]));
    }
    return rows;
}

async function insertLines(lines: ReturnType<typeof planInvoiceLineBackfill>['lines']): Promise<number> {
    let written = 0;
    for (let i = 0; i < lines.length; i += 200) {
        const slice = lines.slice(i, i + 200);
        const { data, error } = await supabase
            .from('invoice_lines')
            .upsert(slice, { onConflict: 'invoice_id,position', ignoreDuplicates: true })
            .select('id');
        if (error) throw new Error(`[Backfill] Failed to insert invoice_lines: ${error.message}`);
        written += data?.length ?? 0;
    }
    return written;
}

async function main() {
    console.log(`[Backfill] mode=${APPLY ? 'APPLY' : 'DRY-RUN'} batch=${BATCH_SIZE} limit=${Number.isFinite(LIMIT) ? LIMIT : 'all'}`);

    const invoices = await fetchInvoices();
    const summary = {
        invoices_total: 0,
        skipped_existing: 0,
        covered_from_order_items: 0,
        covered_from_invoice_total: 0,
        incomplete: 0,
        line_rows: 0,
        deviations: 0,
    };
    const reasons = new Map<string, number>();
    let written = 0;

    for (let i = 0; i < invoices.length; i += BATCH_SIZE) {
        const batch = invoices.slice(i, i + BATCH_SIZE);
        const ids = batch.map((invoice) => invoice.id);
        const orders = await fetchOrders(ids);
        const existing = await fetchExistingLines(ids);

        const plan = planInvoiceLineBackfill(
            batch,
            groupOrdersByInvoice(orders),
            existing
        );

        for (const [key, value] of Object.entries(plan.summary)) {
            summary[key as keyof typeof summary] += value;
        }
        for (const outcome of plan.outcomes) {
            if (outcome.reason) reasons.set(outcome.reason, (reasons.get(outcome.reason) ?? 0) + 1);
        }

        if (APPLY && plan.lines.length > 0) {
            written += await insertLines(plan.lines);
        }
    }

    console.log(JSON.stringify({
        mode: APPLY ? 'apply' : 'dry-run',
        summary,
        inserted_rows: APPLY ? written : 0,
        reasons: Object.fromEntries([...reasons.entries()].sort()),
    }, null, 2));

    if (summary.deviations > 0) {
        console.warn('[Backfill] WARNING: deviation(s) detected. Review invoices listed in the plan output / classification report.');
        process.exitCode = 2;
    }
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
