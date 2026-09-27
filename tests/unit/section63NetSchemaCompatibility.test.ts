/**
 * §6.3 NET schema compatibility — static migration contract lock.
 *
 * The approved §6.3 NET implementation (application commit 781acb3) writes
 * order_splits.destination_account and posts a financial_ledger line to
 * 'RESERVE'. Production was missing the column and did not allow the account,
 * so the migration 20260925120000_section63_net_schema_compatibility.sql is the
 * only thing that unblocks the deploy.
 *
 * These are static source-level tests over the migration artifact and the
 * committed implementation. They fail in CI if the migration is weakened,
 * widened beyond §6.3, or if the committed code stops writing the facts the
 * migration exists to support.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel: string) => fs.existsSync(path.join(root, rel));

const MIGRATION = 'supabase/migrations/20260925120000_section63_net_schema_compatibility.sql';
const LEDGER = 'server/payments/financialLedgerService.ts';
const SPLIT_ENGINE = 'server/payments/splitEngine.ts';
const FULFILLMENT = 'server/payments/fulfillmentService.ts';

const migration = () => read(MIGRATION);

/** Migration SQL with `--` comments stripped, so assertions test executable
 *  statements rather than the documentation that explains them. */
const executableSql = (sql: string) =>
    sql
        .split('\n')
        .map((line) => line.replace(/--.*$/, ''))
        .join('\n');

describe('§6.3 schema compatibility migration exists and is isolated', () => {
    it('the dedicated migration artifact is present', () => {
        expect(exists(MIGRATION)).toBe(true);
    });

    it('adds order_splits.destination_account idempotently', () => {
        const sql = migration();
        expect(sql).toMatch(/alter table public\.order_splits\s+add column if not exists destination_account text/);
    });

    it('recreates the ledger account CHECK idempotently', () => {
        const sql = migration();
        expect(sql).toMatch(/alter table public\.financial_ledger\s+drop constraint if exists financial_ledger_account_check/);
        expect(sql).toMatch(/alter table public\.financial_ledger\s+add constraint financial_ledger_account_check/);
    });

    it('contains no payout/affiliate expansion changes', () => {
        const sql = executableSql(migration());
        for (const forbidden of [
            'payout_gates',
            'payouts',
            'affiliate',
            'admin_approved',
            'approved_by',
            'approval_batch_id',
            'beneficiaries',
            'split_rules',
            'order_splits_status_check',
        ]) {
            expect(sql).not.toContain(forbidden);
        }
    });

    it('contains no data backfill or seed of any kind', () => {
        const sql = migration();
        expect(sql).not.toMatch(/\binsert\s+into\b/i);
        expect(sql).not.toMatch(/\bupdate\s+\S+\s+set\b/i);
        expect(sql).not.toMatch(/\bdelete\s+from\b/i);
        expect(sql).not.toMatch(/\bcreate\s+table\b/i);
    });

    it('creates no index', () => {
        expect(migration()).not.toMatch(/create\s+(unique\s+)?index/i);
    });
});

describe('§6.3 migration: order_splits.destination_account definition', () => {
    it('is nullable and has no default, so no value is fabricated', () => {
        const sql = migration();
        const addColumn = sql.slice(
            sql.indexOf('add column if not exists destination_account'),
            sql.indexOf('comment on column public.order_splits.destination_account')
        );
        expect(addColumn).not.toMatch(/not null/i);
        expect(addColumn).not.toMatch(/default/i);
    });

    it('accepts exactly the accounts the committed code can emit', () => {
        const sql = migration();
        const check = sql.slice(
            sql.indexOf('destination_account is null or'),
            sql.indexOf('comment on column public.order_splits.destination_account')
        );
        for (const account of [
            'CUSTOMER_FUNDS',
            'GATEWAY_FEES',
            'PLATFORM_REVENUE',
            'BENEFICIARY_PAYABLE',
            'RESERVE',
            'REFUND_LIABILITY',
            'PAYOUT_CLEARING',
        ]) {
            expect(check).toContain(`'${account}'`);
        }
        // closed allow-list only: no wildcard / regex escape hatch
        expect(check).not.toMatch(/like|regex|~|\.\*/);
    });
});

describe('§6.3 migration: financial_ledger account allow-list', () => {
    const accountCheck = (sql: string) => {
        return sql.slice(sql.lastIndexOf('add constraint financial_ledger_account_check'));
    };

    it('allows RESERVE', () => {
        expect(accountCheck(executableSql(migration()))).toContain("'RESERVE'");
    });

    it('keeps every account production allowed before the migration', () => {
        const check = accountCheck(executableSql(migration()));
        for (const account of [
            'CUSTOMER_FUNDS',
            'GATEWAY_FEES',
            'PLATFORM_REVENUE',
            'BENEFICIARY_PAYABLE',
            'REFUND_LIABILITY',
            'PAYOUT_CLEARING',
            'SALES_CLEARING',
        ]) {
            expect(check).toContain(`'${account}'`);
        }
    });

    it('remains a closed allow-list with no other validation weakened', () => {
        const sql = executableSql(migration());
        const check = accountCheck(sql);
        expect(check).toMatch(/account\s+in\s*\(/);
        expect(check).not.toMatch(/like|regex|~|\.\*/);
        // the migration must not touch the sibling checks
        expect(sql).not.toContain('amount_minor');
        expect(sql).not.toContain('entry_type');
        expect(sql).not.toContain('event_type');
    });
});

describe('§6.3 migration supports the committed implementation', () => {
    it('splitEngine writes destination_account', () => {
        const src = read(SPLIT_ENGINE);
        expect(src).toContain("destination_account: c.destinationAccount || 'BENEFICIARY_PAYABLE'");
    });

    it('fulfillmentService reads destination_account', () => {
        const src = read(FULFILLMENT);
        expect(src).toContain('beneficiary_id, allocated_amount_minor, destination_account');
    });

    it('the ledger account union includes every allowed migration value', () => {
        const src = read(LEDGER);
        const union = src.slice(src.indexOf('export type LedgerAccount'), src.indexOf('export type LedgerEntryType'));
        for (const account of [
            'CUSTOMER_FUNDS',
            'GATEWAY_FEES',
            'PLATFORM_REVENUE',
            'BENEFICIARY_PAYABLE',
            'RESERVE',
            'REFUND_LIABILITY',
            'PAYOUT_CLEARING',
        ]) {
            expect(union).toContain(`'${account}'`);
        }
    });

    it('never writes SALES_CLEARING', () => {
        const src = read(LEDGER);
        const writable = src
            .split('\n')
            .filter((line) => /account:\s*'/.test(line));
        expect(writable.length).toBeGreaterThan(0);
        for (const line of writable) {
            expect(line).not.toContain('SALES_CLEARING');
        }
    });
});

describe('§6.3 signed invariant is untouched by the migration', () => {
    it('the migration does not restate or alter the posting matrix', () => {
        const sql = executableSql(migration());
        for (const figure of ['41140', '4840', '2420', '48400', '49900', '1500']) {
            const occurrences = sql.split(figure).length - 1;
            expect(occurrences).toBe(0);
        }
    });

    it('splitEngine still allocates 85/10/5', () => {
        const src = read(SPLIT_ENGINE);
        expect(src).toContain('AUTHOR_SHARE_PERCENT: 85');
        expect(src).toContain('PLATFORM_SHARE_PERCENT: 10');
        expect(src).toContain('RESERVE_SHARE_PERCENT: 5');
    });
});
