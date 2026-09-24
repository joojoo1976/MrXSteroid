/**
 * Order producer status contract — M1A static invariant tests.
 *
 * Enforces the owner-approved decision that NOTHING may write
 * orders.status='completed' or orders.status='confirmed':
 *   - completed payment outcome → orders.payment_status='paid' (webhook)
 *   - confirmed admin action    → orders.status='processing' + payment_status='paid'
 *
 * These are source-level (static) tests: they guard against regression in the
 * exact producer files that attach to the orders table. They scan the write
 * blocks that follow each from('orders') call so the legacy `payments` table's
 * own (allowed) `status: 'completed'` writes are never flagged.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

const PRODUCERS = [
    'app/api/checkout/instapay/route.ts',
    'supabase/functions/payment-webhook/index.ts',
    'app/api/admin/payment-receipts/[id]/route.ts',
    'shared/lib/RealtimeSyncService.ts',
    'legacy-pages/MissionControl.tsx',
];

describe('Order producer status contract (static)', () => {
    it('no from(orders) write block sets status to completed/confirmed', () => {
        for (const rel of PRODUCERS) {
            const src = read(rel);
            const re = /from\(['"]orders['"]\)([\s\S]{0,300}?)\.(?:eq|select)\(/g;
            let m: RegExpExecArray | null;
            while ((m = re.exec(src)) !== null) {
                const block = m[1];
                expect(block.match(/status:\s*['"](?:completed|confirmed)['"]/i), `${rel} writes illegal order status`).toBeNull();
            }
        }
    });

    it('payment-webhook maps the completed payment outcome to orders.payment_status=paid and stops touching orders.status', () => {
        const src = read('supabase/functions/payment-webhook/index.ts');
        expect(src).toContain("payment_status: 'paid'");
        // The ONLY status write remaining in this file belongs to the legacy
        // `payments` table (which has its own CHECK allowing 'completed').
        const statusWrites = src.match(/_update\(\{\s*\n?\s*status:\s*'completed'/g);
        expect(statusWrites?.length ?? 0).toBeLessThanOrEqual(1);
    });

    it('MissionControl drops the confirmed vocabulary from ORDER_STATUSES and maps confirm->processing+paid', () => {
        const src = read('legacy-pages/MissionControl.tsx');
        const list = src.match(/ORDER_STATUSES\s*=\s*\[[^\]]*\]/)?.[0] ?? '';
        expect(list).not.toContain('confirmed');
        expect(src).not.toMatch(/status:\s*'confirmed'/);
        expect(src).toContain("nextStatus === 'processing'");
        expect(src).toContain("patch.payment_status = 'paid'");
    });

    it('payment-receipts admin settle writes payment_status paid/failed alongside the order status', () => {
        const src = read('app/api/admin/payment-receipts/[id]/route.ts');
        expect(src).toContain("paymentStatus = status === 'verified' ? 'paid' : status === 'rejected' ? 'failed' : null;");
        expect(src).toContain("orderPatch['payment_status'] = paymentStatus;");
    });

    it('InstaPay carries the full M1A checkout context on insert', () => {
        const src = read('app/api/checkout/instapay/route.ts');
        expect(src).toContain("region: 'EG'");
        expect(src).toContain("currency: 'EGP'");
        expect(src).toContain("payment_method: 'instapay'");
        expect(src).toContain("source_channel: 'web_checkout'");
        expect(src).toContain("payment_status: 'pending'");
    });

    it('RealtimeSyncService no longer upserts orders (UPDATE-only sync, allowlist-protected)', () => {
        const src = read('shared/lib/RealtimeSyncService.ts');
        expect(src).not.toContain('.upsert({ id: orderId');
        expect(src).toContain('ORDER_SYNC_ALLOWLIST');
    });
});