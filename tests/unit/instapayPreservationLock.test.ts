/**
 * InstaPay preservation lock — owner decision R4 (LOCKED 2026-09-24).
 *
 * InstaPay remains LIVE/ACTIVE as a payment method on mrxsteroid.com and
 * POST /api/checkout/instapay is preserved exactly as verified in M1A.
 * The rejected-receipt mapping (`status='cancelled'` + `payment_status='failed'`)
 * is an order-level outcome for the individual rejected InstaPay attempt ONLY —
 * it must never disable/deprecate/replace InstaPay as a payment method.
 *
 * These are source-level (static) tests over the exact producer files so a
 * future change that breaks any preserved invariant fails in CI even before a
 * deploy. They MUST be updated deliberately and with owner approval.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel: string) => fs.existsSync(path.join(root, rel));

const INSTAPAY_ROUTE = 'app/api/checkout/instapay/route.ts';
const RECEIPT_ROUTE = 'app/api/admin/payment-receipts/[id]/route.ts';
const LEGACY_INSTAPAY_ROUTE = 'app/api/payments/instapay/route.ts';

describe('InstaPay preservation lock (static)', () => {
    it('InstaPay checkout route exists and still exports POST', () => {
        expect(exists(INSTAPAY_ROUTE), 'InstaPay route must not be removed').toBe(true);
        const src = read(INSTAPAY_ROUTE);
        expect(src).toContain('export async function POST(req: NextRequest)');
        expect(src).not.toContain('export async function DELETE');
    });

    it('POST /api/checkout/instapay keeps receipt upload + validation + manual review', () => {
        const src = read(INSTAPAY_ROUTE);
        expect(src).toContain('req.formData()');
        expect(src).toContain("formData.get('receipt')");
        expect(src).toContain('validateReceiptFile');
        expect(src).toContain('status: \'pending_manual_review\''); // order held for admin review
        expect(src).toContain('.from(\'payment_receipts\')');
        expect(src).toContain("status: 'pending_review'"); // receipt queued for admin review
    });

    it('InstaPay checkout keeps existing protections (rate limit) and storage upload', () => {
        const src = read(INSTAPAY_ROUTE);
        expect(src).toContain('enforceRateLimit');
        expect(src).toContain('supabase.storage');
        expect(src).toContain('RECEIPT_BUCKET');
        expect(src).toContain('uploadReceipt');
    });

    it('InstaPay order creation keeps payment_method=instapay and pending_manual_review status', () => {
        const src = read(INSTAPAY_ROUTE);
        expect(src).toContain("payment_method: 'instapay'");
        expect(src).toContain('payment_status: \'pending\'');
        expect(src).not.toMatch(/payment_method:\s*['"](kashier|paymob|stripe|spaceremit)['"]/i);
    });

    it('InstaPay keeps affiliate attribution persisted on the receipt', () => {
        const src = read(INSTAPAY_ROUTE);
        expect(src).toContain('attribution: input.attribution');
        expect(src).toContain('affiliateId');
        expect(src).toContain('referralCode');
    });

    it('InstaPay keeps the failure rollback (delete order + remove stored receipt)', () => {
        const src = read(INSTAPAY_ROUTE);
        expect(src).toContain(".from('orders').delete()");
        expect(src).toContain('RECEIPT_BUCKET).remove');
    });

    it('InstaPay receipts still dedupe on transaction reference / idempotency', () => {
        const src = read(INSTAPAY_ROUTE);
        expect(src).toContain('transaction_reference');
        expect(src).toContain('transactionRef');
    });

    it('legacy /api/payments/instapay is NOT reintroduced as a second InstaPay route', () => {
        // The manual-review InstaPay path lives exclusively at /api/checkout/instapay.
        expect(exists(LEGACY_INSTAPAY_ROUTE), 'no duplicate/legacy InstaPay route').toBe(false);
    });

    it('rejected receipt settles the ORDER (not the payment method) to cancelled + failed', () => {
        const src = read(RECEIPT_ROUTE);
        // The rejected mapping applies only to the individual order attempt's state:
        expect(src).toContain('orderStatus = status === \'verified\' ? \'processing\' : status === \'rejected\' ? \'cancelled\' : null');
        expect(src).toContain('paymentStatus = status === \'verified\' ? \'paid\' : status === \'rejected\' ? \'failed\' : null');
        expect(src).toContain("action: `payment_receipt.${status}`"); // admin review action untouched
        // Knothing here disables, deprecates or replaces InstaPay:
        expect(src).not.toMatch(/disableInstaPay|deprecateInstaPay|removeInstaPay|instapayDisabled/i);
    });

    it('the accepted state lock is intact: InstaPay = LIVE, M1A = LIVE, Application Compatibility = LIVE, M1B = NOT APPLIED', () => {
        const doc = read('docs/governance/phase1/M1-MINIMAL-ORDERS-MIGRATION-DESIGN.md');
        expect(doc).toContain('InstaPay (payment method)');
        expect(doc).toContain('= LIVE / ACTIVE');
        expect(doc).toContain('APPLIED (migration 20260924174753, committed 0d18c84)');
        expect(doc).toContain("Rejected receipt outcome");
        expect(doc).toContain("status='cancelled' + payment_status='failed'");
        expect(doc).toContain('M1B');
        expect(doc).toContain('NOT APPLIED');
    });
});