/**
 * CLI: numeric proof for the invoice_lines invariant.
 *
 * Usage:
 *   npx tsx scripts/verify-invoice-lines.ts
 *
 * Read-only. Requires SUPABASE_SERVICE_ROLE_KEY and prints no secrets.
 * Exit codes: 0 = every line-bearing invoice reconciles; 2 = deviations.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import {
    verifyInvoiceLineTotals,
    type InvoiceLineVerificationRow,
    type InvoiceVerificationRow,
} from './invoiceLinesVerification';

const PAGE = 1000;

function requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`[VerifyInvoiceLines] Missing required environment variable: ${name}`);
    return value;
}

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fetchAll<T>(table: string, columns: string): Promise<T[]> {
    const rows: T[] = [];
    for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase
            .from(table)
            .select(columns)
            .order('id', { ascending: true })
            .range(from, from + PAGE - 1);
        if (error) throw new Error(`[VerifyInvoiceLines] Failed to read ${table}: ${error.message}`);
        if (!data || data.length === 0) break;
        rows.push(...(data as T[]));
        if (data.length < PAGE) break;
    }
    return rows;
}

async function main() {
    const invoices = await fetchAll<InvoiceVerificationRow>('invoices', 'id, amount');
    const lines = await fetchAll<InvoiceLineVerificationRow>('invoice_lines', 'invoice_id, line_total');
    const result = verifyInvoiceLineTotals(invoices, lines);

    console.log(JSON.stringify({ mode: 'verify', ...result }, null, 2));
    if (result.deviation_count > 0) process.exitCode = 2;
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
