/**
 * Pure numeric verification for `invoice_lines`.
 *
 * Proves the Phase-1 invariant on real rows:
 *   for every invoice that has lines: Σ(line_total) == invoices.amount
 *
 * It is intentionally read-only and has no database imports, so it can be
 * unit-tested and reused by the CLI.
 */

export interface InvoiceVerificationRow {
    id: string;
    amount: number | string;
}

export interface InvoiceLineVerificationRow {
    invoice_id: string;
    line_total: number | string;
}

export interface InvoiceLineVerificationResult {
    invoices_total: number;
    invoices_with_lines: number;
    invoices_without_lines: number;
    matching_invoices: number;
    deviation_count: number;
    deviations: Array<{
        invoice_id: string;
        amount: number;
        lines_total: number;
        deviation: number;
    }>;
    line_rows: number;
    total_line_sum: number;
}

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export function verifyInvoiceLineTotals(
    invoices: InvoiceVerificationRow[],
    lines: InvoiceLineVerificationRow[]
): InvoiceLineVerificationResult {
    const sums = new Map<string, number>();
    for (const line of lines) {
        const id = String(line.invoice_id);
        sums.set(id, round2((sums.get(id) ?? 0) + Number(line.line_total)));
    }

    const deviations: InvoiceLineVerificationResult['deviations'] = [];
    let withLines = 0;
    let matching = 0;

    for (const invoice of invoices) {
        const amount = round2(Number(invoice.amount));
        const lineTotal = sums.get(String(invoice.id));
        if (lineTotal === undefined) continue;
        withLines += 1;
        const deviation = round2(lineTotal - amount);
        if (deviation === 0) {
            matching += 1;
        } else {
            deviations.push({
                invoice_id: String(invoice.id),
                amount,
                lines_total: lineTotal,
                deviation,
            });
        }
    }

    return {
        invoices_total: invoices.length,
        invoices_with_lines: withLines,
        invoices_without_lines: invoices.length - withLines,
        matching_invoices: matching,
        deviation_count: deviations.length,
        deviations,
        line_rows: lines.length,
        total_line_sum: round2(lines.reduce((sum, line) => sum + Number(line.line_total), 0)),
    };
}
