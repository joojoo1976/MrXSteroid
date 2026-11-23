import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Contract tests for the two migrations prepared in this round.
 *
 * Neither migration has been applied (no DBA credentials in this environment),
 * so these tests are the only executable guarantee we can give: the SQL is
 * additive, non-destructive, and the canonical product mapping in the SQL
 * cannot drift from the TypeScript source of truth.
 */

const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');

const EXECUTABLE_LINE = (sql: string) =>
    sql
        .split('\n')
        .filter((line) => !/^\s*--/.test(line))
        .join('\n');

const REFUNDS_MIGRATION = 'supabase/migrations/20261123120000_refunds_allow_unlinked_intent.sql';
const INSTAPAY_MIGRATION = 'supabase/migrations/20261123130000_fix_approve_instapay_receipt.sql';
const INSTAPAY_ROLLBACK =
    'supabase/migrations/rollbacks/20261123130000_rollback_fix_approve_instapay_receipt.sql';

describe('20261123120000_refunds_allow_unlinked_intent', () => {
    it('only relaxes the NOT NULL constraint', () => {
        const sql = EXECUTABLE_LINE(read(REFUNDS_MIGRATION));
        expect(sql).toMatch(/alter\s+table\s+public\.refunds\s+alter\s+column\s+payment_intent_id\s+drop\s+not\s+null/i);
        expect(sql).not.toMatch(/drop\s+column/i);
        expect(sql).not.toMatch(/drop\s+table/i);
        expect(sql).not.toMatch(/\bdelete\s+from\b/i);
        expect(sql).not.toMatch(/\btruncate\b/i);
        expect(sql).not.toMatch(/set\s+not\s+null/i);
    });

    it('documents the unlinked-intent signal used by reconciliation', () => {
        const sql = read(REFUNDS_MIGRATION);
        expect(sql).toContain('refund_recorded_unlinked');
    });

    it('ships a rollback that fails safely while unlinked rows exist', () => {
        const sql = read('supabase/migrations/rollbacks/20261123120000_rollback_refunds_allow_unlinked_intent.sql');
        expect(sql).toMatch(/set\s+not\s+null/i);
        expect(sql).toMatch(/payment_intent_id is null/i);
    });
});

describe('20261123130000_fix_approve_instapay_receipt', () => {
    const sql = read(INSTAPAY_MIGRATION);

    it('replaces the function without any table/column DDL or data rewrite', () => {
        const executable = EXECUTABLE_LINE(sql);
        expect(executable).toMatch(/create\s+or\s+replace\s+function\s+public\.approve_instapay_receipt/i);
        expect(executable).not.toMatch(/drop\s+table/i);
        expect(executable).not.toMatch(/drop\s+column/i);
        expect(executable).not.toMatch(/alter\s+table/i);
        expect(executable).not.toMatch(/\btruncate\b/i);
    });

    it('fixes the undefined variable (no v_net_amount_minor anywhere)', () => {
        const executable = EXECUTABLE_LINE(sql);
        expect(executable).not.toContain('v_net_amount_minor');
        expect(executable).toContain('v_net_minor');
    });

    it('writes a column the entitlements table actually has, with an allowed status', () => {
        const executable = EXECUTABLE_LINE(sql);
        // `tier_id` is not a column of public.entitlements.
        const insertBlock = executable.slice(
            executable.indexOf('INSERT INTO public.entitlements'),
            executable.indexOf('ON CONFLICT DO NOTHING')
        );
        expect(insertBlock).not.toMatch(/^\s*tier_id,\s*$/m);
        expect(insertBlock).toContain('product_id');
        expect(insertBlock).toContain("'granted'");
        expect(insertBlock).not.toContain("'active'");
    });

    it('never references the receipt intent id after creating a new intent', () => {
        const executable = EXECUTABLE_LINE(sql);
        expect(executable).not.toContain('v_receipt.payment_intent_id');
        expect(executable).toContain('v_settled_intent_id');
    });

    it('mirrors the canonical tier -> product mapping from invoiceLineProducts.ts', () => {
        const ts = read('server/payments/entitlement/invoiceLineProducts.ts');
        const mapBlock = ts.slice(
            ts.indexOf('TIER_TO_CANONICAL_PRODUCT'),
            ts.indexOf('};', ts.indexOf('TIER_TO_CANONICAL_PRODUCT'))
        );
        const pairs = Array.from(mapBlock.matchAll(/(\w+):\s*'([A-Z-]+)'/g)).map(([, tier, product]) => ({
            tier,
            product,
        }));

        expect(pairs.length).toBeGreaterThanOrEqual(8);
        for (const { tier, product } of pairs) {
            const pattern = new RegExp(`WHEN\\s+'${tier}'\\s+THEN\\s+'${product}'`, 'i');
            expect(sql, `missing SQL mapping for ${tier} -> ${product}`).toMatch(pattern);
        }
    });

    it('restricts execution to the service role', () => {
        expect(sql).toMatch(/revoke all on function public\.approve_instapay_receipt/i);
        expect(sql).toMatch(/grant execute on function public\.approve_instapay_receipt[^;]*to service_role/i);
    });

    it('ships an executable rollback that restores the previous definition', () => {
        const rollback = read(INSTAPAY_ROLLBACK);
        expect(rollback).toMatch(/create\s+or\s+replace\s+function\s+public\.approve_instapay_receipt/i);
        // The rollback intentionally restores the defective body.
        expect(rollback).toContain('v_net_amount_minor');
    });
});
