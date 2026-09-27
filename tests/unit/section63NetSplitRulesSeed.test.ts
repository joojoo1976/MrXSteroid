/**
 * §6.3 NET split-rules seed — static migration contract lock.
 *
 * 781acb3 made the posting path schema-correct, but the allocation SOURCE was
 * still unable to express the signed 85/10/5 split. Migration
 * 20260925130000_section63_net_split_rules_seed.sql is what makes it
 * executable: it lets a rule name its §6.3 destination account, lets the
 * internal platform rule exist without an external beneficiary, defines the
 * internal reserve identity, and seeds the canonical rule set.
 *
 * These are static source-level tests over the migration artifact and the
 * committed implementation. They fail in CI if the migration is weakened,
 * widened beyond §6.3, or if the seed stops matching the committed constants.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel: string) => fs.existsSync(path.join(root, rel));

const MIGRATION = 'supabase/migrations/20260925130000_section63_net_split_rules_seed.sql';
const COMPANION = 'supabase/migrations/20260925120000_section63_net_schema_compatibility.sql';
const SPLIT_ENGINE = 'server/payments/splitEngine.ts';
const LEDGER = 'server/payments/financialLedgerService.ts';

const migration = () => read(MIGRATION);

/** Migration SQL with `--` comments stripped, so assertions test executable
 *  statements rather than the documentation that explains them. */
const executableSql = (sql: string) =>
    sql
        .split('\n')
        .map((line) => line.replace(/--.*$/, ''))
        .join('\n');

describe('§6.3 split-rules migration exists and stays isolated', () => {
    it('the dedicated migration artifact is present', () => {
        expect(exists(MIGRATION)).toBe(true);
    });

    it('is a separate file from the §6.3 schema-compatibility migration', () => {
        expect(exists(COMPANION)).toBe(true);
        expect(MIGRATION).not.toBe(COMPANION);
    });

    it('does not redefine the §6.3 schema-compatibility objects', () => {
        const sql = executableSql(migration());
        expect(sql).not.toContain('financial_ledger_account_check');
        expect(sql).not.toContain('order_splits.destination_account');
        expect(sql).not.toContain('RESERVE' + "')");
    });

    it('contains no payout/affiliate expansion changes', () => {
        const sql = executableSql(migration());
        for (const forbidden of [
            'payout_gates',
            'payouts',
            'affiliate',
            'affiliat',
            'admin_approved',
            'approved_by',
            'approved_at',
            'approval_batch_id',
            'order_splits_status_check',
            'canonical_key',
            'kashier_recipient_id_text',
        ]) {
            expect(sql).not.toContain(forbidden);
        }
    });

    it('creates no table, index, or function', () => {
        const sql = executableSql(migration());
        expect(sql).not.toMatch(/create\s+table/i);
        expect(sql).not.toMatch(/create\s+(unique\s+)?index/i);
        expect(sql).not.toMatch(/create\s+(or\s+replace\s+)?function/i);
    });

    it('changes no RLS policy and touches no policy names', () => {
        const sql = executableSql(migration());
        expect(sql).not.toContain('policy');
        expect(sql).not.toMatch(/enable\s+row\s+level\s+security/i);
    });
});

describe('§6.3 split-rules migration: split_rules.destination_account', () => {
    it('adds the column idempotently', () => {
        expect(executableSql(migration())).toMatch(
            /alter table public\.split_rules\s+add column if not exists destination_account text/
        );
    });

    it('is nullable with no default, preserving the BENEFICIARY_PAYABLE fallback', () => {
        const sql = executableSql(migration());
        const addColumn = sql.slice(
            sql.indexOf('add column if not exists destination_account'),
            sql.indexOf('comment on column public.split_rules.destination_account')
        );
        expect(addColumn).not.toMatch(/not null/i);
        expect(addColumn).not.toMatch(/default/i);
    });

    it('constrains to exactly the committed LedgerAccount set', () => {
        const sql = executableSql(migration());
        const check = sql.slice(
            sql.indexOf('destination_account is null or'),
            sql.indexOf('comment on column public.split_rules.destination_account')
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
        expect(check).not.toMatch(/like|regex|~|\.\*/);
    });

    it('matches the committed LedgerAccount union exactly', () => {
        const ledger = read(LEDGER);
        const union = ledger.slice(
            ledger.indexOf('export type LedgerAccount'),
            ledger.indexOf('export type LedgerEntryType')
        );
        const allowed = [
            'CUSTOMER_FUNDS',
            'GATEWAY_FEES',
            'PLATFORM_REVENUE',
            'BENEFICIARY_PAYABLE',
            'RESERVE',
            'REFUND_LIABILITY',
            'PAYOUT_CLEARING',
        ];
        const check = executableSql(migration());
        for (const account of allowed) {
            expect(union).toContain(`'${account}'`);
            expect(check).toContain(`'${account}'`);
        }
    });
});

describe('§6.3 split-rules migration: nullable beneficiary references', () => {
    it('makes split_rules.beneficiary_id nullable', () => {
        expect(executableSql(migration())).toMatch(
            /alter table public\.split_rules\s+alter column beneficiary_id drop not null/
        );
    });

    it('makes order_splits.beneficiary_id nullable', () => {
        expect(executableSql(migration())).toMatch(
            /alter table public\.order_splits\s+alter column beneficiary_id drop not null/
        );
    });

    it('preserves both foreign keys: neither is dropped', () => {
        const sql = executableSql(migration());
        expect(sql).not.toMatch(/drop\s+constraint[^;]*beneficiary_id_fkey/i);
        expect(sql).not.toMatch(/drop\s+foreign\s+key/i);
    });

    it('does not alter the order_splits unique constraint', () => {
        const sql = executableSql(migration());
        expect(sql).not.toContain('order_splits_invoice_beneficiary_unique');
    });
});

describe('§6.3 split-rules migration: reserve identity compatibility', () => {
    it('adds reserve to beneficiaries.role while keeping every prior role', () => {
        const sql = executableSql(migration());
        const check = sql.slice(sql.lastIndexOf('add constraint beneficiaries_role_check'));
        for (const role of ['author', 'reserve', 'platform', 'coach', 'partner']) {
            expect(check).toContain(`'${role}'`);
        }
    });

    it('recreates the role check idempotently', () => {
        const sql = executableSql(migration());
        expect(sql).toMatch(
            /alter table public\.beneficiaries\s+drop constraint if exists beneficiaries_role_check/
        );
    });

    it('relaxes payout_method to nullable without changing its allow-list', () => {
        const sql = executableSql(migration());
        expect(sql).toMatch(
            /alter table public\.beneficiaries\s+alter column payout_method drop not null/
        );
        expect(sql).not.toContain('beneficiaries_payout_method_check');
    });
});

describe('§6.3 split-rules migration: canonical 85/10/5 seed', () => {
    const seed = () => {
        const sql = executableSql(migration());
        return sql.slice(sql.lastIndexOf('insert into public.split_rules'));
    };

    it('seeds exactly three rules', () => {
        const ids = seed().match(/'8a6f0e10-0000-4000-8000-00000000a20\d'/g) || [];
        expect(ids).toHaveLength(3);
    });

    it('maps 85 → BENEFICIARY_PAYABLE, 10 → PLATFORM_REVENUE, 5 → RESERVE', () => {
        const sql = seed();
        expect(sql).toMatch(/'percentage',\s*85,\s*0,\s*true,\s*'BENEFICIARY_PAYABLE'/);
        expect(sql).toMatch(/'percentage',\s*10,\s*0,\s*true,\s*'PLATFORM_REVENUE'/);
        expect(sql).toMatch(/'percentage',\s*5,\s*0,\s*true,\s*'RESERVE'/);
    });

    it('keeps the platform 10% rule beneficiary-less', () => {
        const sql = seed();
        const platformBlock = sql.slice(
            sql.indexOf("'PLATFORM_REVENUE'") - 220,
            sql.indexOf("'PLATFORM_REVENUE'")
        );
        expect(platformBlock).toMatch(/null,\s*'percentage',\s*10/);
    });

    it('points the author and reserve rules at the internal identities', () => {
        const sql = migration();
        expect(sql).toContain('8a6f0e10-0000-4000-8000-00000000a101');
        expect(sql).toContain('8a6f0e10-0000-4000-8000-00000000a105');
    });

    it('creates no external payout details for the internal identities', () => {
        const sql = executableSql(migration());
        const beneficiaries = sql.slice(
            sql.indexOf('insert into public.beneficiaries'),
            sql.lastIndexOf('insert into public.split_rules')
        );
        // email, payout_method and kashier_recipient_id are all NULL;
        // payout_details is an empty object.
        expect(beneficiaries).not.toMatch(/@/);
        expect(beneficiaries).toMatch(/'author',\s*null,\s*'\{\}'::jsonb,\s*null/);
        expect(beneficiaries).toMatch(/'reserve',\s*null,\s*'\{\}'::jsonb,\s*null/);
    });

    it('is idempotent on conflict', () => {
        const sql = executableSql(migration());
        const conflicts = sql.match(/on conflict \(id\) do nothing/g) || [];
        expect(conflicts).toHaveLength(3);
    });

    it('seeds no unrelated data and performs no backfill or update', () => {
        const sql = executableSql(migration());
        expect(sql).not.toMatch(/\bupdate\s+\S+\s+set\b/i);
        expect(sql).not.toMatch(/\bdelete\s+from\b/i);
        expect(sql.match(/insert into public\.split_rules/g) || []).toHaveLength(1);
        expect(sql.match(/insert into public\.beneficiaries/g) || []).toHaveLength(2);
    });
});

describe('§6.3 split-rules seed matches the committed owner decision', () => {
    it('the percentages equal the committed DEFAULT_OWNER_SPLIT_RATIOS', () => {
        const engine = read(SPLIT_ENGINE);
        const ratios = engine.slice(
            engine.indexOf('DEFAULT_OWNER_SPLIT_RATIOS'),
            engine.indexOf('OWNER_REFUND_POLICY')
        );
        expect(ratios).toContain('AUTHOR_SHARE_PERCENT: 85');
        expect(ratios).toContain('PLATFORM_SHARE_PERCENT: 10');
        expect(ratios).toContain('RESERVE_SHARE_PERCENT: 5');
        expect(ratios).toContain('TOTAL_PERCENT: 100');
    });

    it('the seeded percentages sum to the committed total', () => {
        const engine = read(SPLIT_ENGINE);
        const author = Number(/AUTHOR_SHARE_PERCENT:\s*(\d+)/.exec(engine)![1]);
        const platform = Number(/PLATFORM_SHARE_PERCENT:\s*(\d+)/.exec(engine)![1]);
        const reserve = Number(/RESERVE_SHARE_PERCENT:\s*(\d+)/.exec(engine)![1]);
        const total = Number(/TOTAL_PERCENT:\s*(\d+)/.exec(engine)![1]);
        expect(author + platform + reserve).toBe(total);
    });

    it('all seeded rules are percentage rules, so the engine uses the NET basis', () => {
        const sql = executableSql(migration());
        const rules = sql.slice(sql.lastIndexOf('insert into public.split_rules'));
        expect(rules).not.toContain("'fixed'");
        expect((rules.match(/'percentage'/g) || [])).toHaveLength(3);
    });

    it('the NET invariant is never restated in gross-basis form', () => {
        const sql = executableSql(migration());
        for (const figure of ['42415', '4990', '2495']) {
            expect(sql.split(figure).length - 1).toBe(0);
        }
    });
});
