/**
 * tests/helpers/productionConstraintSupabase.ts
 *
 * A table-backed fake of the Supabase client that ENFORCES the real production
 * constraints of the capture→ledger path. The ordinary fakes used elsewhere in
 * this repo accept any insert, which is precisely why the historical
 * `paymentIntentId: invoiceId` defect shipped unnoticed: no mock rejected the
 * invoice id where `financial_ledger.payment_intent_id` requires a
 * `payment_intents.id`.
 *
 * Every guard below is copied from the live production catalog (verified
 * read-only via pg_get_constraintdef), so a row that production would reject is
 * rejected here too:
 *
 *   financial_ledger.payment_intent_id → payment_intents(id)      [FK, BLOCKER 1]
 *   financial_ledger.invoice_id        → invoices(id)             [FK]
 *   financial_ledger.beneficiary_id    → beneficiaries(id)        [FK]
 *   financial_ledger.account            → account CHECK allow-list
 *   financial_ledger.amount_minor       → > 0 CHECK
 *   financial_ledger.entry_type         → DEBIT|CREDIT CHECK
 *   order_splits.invoice_id             → invoices(id)             [FK]
 *   order_splits.beneficiary_id         → beneficiaries(id)        [FK, RESTRICT]
 *   order_splits.destination_account    → §6.3 account allow-list  [CHECK]
 *   order_splits.status                 → status CHECK allow-list
 *   order_splits (invoice_id, beneficiary_id) UNIQUE
 *   invoices.payment_status             → payment_status CHECK allow-list
 *   webhook_events.status               → status CHECK allow-list (incl. 'failed')
 *
 * `failures` injects targeted DB errors (FK violation, network error, ...) so
 * the orchestration's fail-closed branches can be exercised.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface DbFailure {
    code?: string;
    message: string;
    /** Only fail from the Nth (1-based) matching call onward. */
    skipFirst?: number;
}

/** Accounts production allowed BEFORE either §6.3 migration is applied. */
export const LEDGER_ACCOUNTS = [
    'CUSTOMER_FUNDS',
    'GATEWAY_FEES',
    'PLATFORM_REVENUE',
    'BENEFICIARY_PAYABLE',
    'REFUND_LIABILITY',
    'PAYOUT_CLEARING',
] as const;

export const LEDGER_ENTRY_TYPES = ['DEBIT', 'CREDIT'] as const;
export const ORDER_SPLIT_STATUSES = [
    'pending', 'calculated', 'frozen', 'queued', 'paid', 'failed', 'cancelled',
] as const;
export const INVOICE_PAYMENT_STATUSES = [
    'pending', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded',
    'unknown', 'initiated',
] as const;
export const WEBHOOK_EVENT_STATUSES = [
    'pending', 'processed', 'failed', 'duplicate', 'skipped',
] as const;

export const INVOICE_ID = 'inv-63-0001';
export const USER_ID = 'user-63-0001';
export const TIER_ID = 'MRX-PROTOCOL';
export const PAYMENT_INTENT_ID = 'pi-63-0001';
export const BENEFICIARY_AUTHOR = 'ben-author-1';
export const BENEFICIARY_RESERVE = 'ben-reserve-1';

export interface LedgerRow extends Record<string, any> {
    journal_entry_id: string;
    account: string;
    entry_type: string;
    amount_minor: number;
    event_type: string;
    payment_intent_id: string | null;
    invoice_id: string | null;
    beneficiary_id: string | null;
}

export interface ProductionConstraintDb {
    client: SupabaseClient;
    tables: Record<string, Record<string, any>[]>;
    /** Rows in financial_ledger (typed for assertions). */
    ledger: LedgerRow[];
    rpcLog: Array<{ name: string; args: any }>;
}

export interface DbOptions {
    /** Pre-frozen NET splits — the signed §6.3 capture (F=1500). */
    netSplits?: Array<{ beneficiary_id: string | null; allocated_amount_minor: number; destination_account: string }>;
    /** Skip the payment_intents row entirely (BLOCKER 1 unresolvable). */
    withoutPaymentIntent?: boolean;
    /** Inject a DB error for a specific operation, e.g. 'financial_ledger.insert'. */
    failures?: Record<string, DbFailure>;
    /**
     * Model the PRE-migration catalog (default) or the POST-migration one.
     * Before `20260925120000_section63_net_schema_compatibility.sql` is applied
     * 'RESERVE' is NOT an allowed financial_ledger account, so the §6.3 journal
     * genuinely cannot be written — the harness makes that explicit instead of
     * hiding it behind a permissive mock.
     */
    reserveAccountAllowed?: boolean;
    /**
     * Make the Nth (1-based) `order_splits` select return `data: []` with no
     * error — models "the freeze reported rows but the read-back sees none".
     */
    emptyOrderSplitsReadFrom?: number;
}

function canonicalTables(options: DbOptions) {
    const invoice = {
        id: INVOICE_ID,
        status: 'pending',
        payment_status: 'pending',
        amount: 499,
        currency: 'EGP',
        user_id: USER_ID,
        tier_id: TIER_ID,
        affiliate_id: null,
        referral_code: null,
    };

    const tables: Record<string, Record<string, any>[]> = {
        invoices: [invoice],
        payment_intents: options.withoutPaymentIntent
            ? []
            : [{
                id: PAYMENT_INTENT_ID,
                invoice_id: INVOICE_ID,
                attempt_number: 1,
                is_current: true,
                status: 'initiated',
                provider_status: null,
                provider_transaction_id: null,
                gate_version: 0,
                reconciliation_attempts: 0,
            }],
        beneficiaries: [
            { id: BENEFICIARY_AUTHOR, role: 'author', payout_method: null, payout_details: {} },
            { id: BENEFICIARY_RESERVE, role: 'reserve', payout_method: null, payout_details: {} },
        ],
        // §6.3 canonical rules: 85 / 10 / 5, each with its signed destination.
        split_rules: [
            { id: 'rule-85', tier_id: null, beneficiary_id: BENEFICIARY_AUTHOR, share_type: 'percentage', share_value: 85, priority: 0, is_active: true, destination_account: 'BENEFICIARY_PAYABLE' },
            { id: 'rule-10', tier_id: null, beneficiary_id: null, share_type: 'percentage', share_value: 10, priority: 0, is_active: true, destination_account: 'PLATFORM_REVENUE' },
            { id: 'rule-5', tier_id: null, beneficiary_id: BENEFICIARY_RESERVE, share_type: 'percentage', share_value: 5, priority: 0, is_active: true, destination_account: 'RESERVE' },
        ],
        order_splits: (options.netSplits ?? []).map((s) => ({
            invoice_id: INVOICE_ID,
            beneficiary_id: s.beneficiary_id,
            destination_account: s.destination_account,
            allocated_amount_minor: s.allocated_amount_minor,
            gross_amount_minor: 49900,
            gateway_fee_minor: 1500,
            net_amount_minor: 48400,
            currency: 'EGP',
            status: 'calculated',
            rule_snapshot: {},
        })),
        financial_ledger: [],
        webhook_events: [{
            id: 'we-1',
            provider: 'kashier_egypt',
            provider_event_id: 'evt-63-0001',
            status: 'pending',
            processing_status: 'pending',
        }],
        profiles: [{ id: USER_ID, subscription_status: 'inactive', has_paid: false }],
        entitlements: [],
    };
    return tables;
}

/** The signed §6.3 NET allocation of G=49900, F=1500, N=48400. */
export const SIGNED_NET_SPLITS = [
    { beneficiary_id: BENEFICIARY_AUTHOR, allocated_amount_minor: 41140, destination_account: 'BENEFICIARY_PAYABLE' },
    { beneficiary_id: null, allocated_amount_minor: 4840, destination_account: 'PLATFORM_REVENUE' },
    { beneficiary_id: BENEFICIARY_RESERVE, allocated_amount_minor: 2420, destination_account: 'RESERVE' },
];

export function createProductionConstraintSupabase(options: DbOptions = {}): ProductionConstraintDb {
    const tables = canonicalTables(options);
    const ledger: LedgerRow[] = [];
    const rpcLog: Array<{ name: string; args: any }> = [];
    const failures = options.failures ?? {};
    const allowedAccounts: readonly string[] = options.reserveAccountAllowed
        ? [...LEDGER_ACCOUNTS, 'RESERVE']
        : LEDGER_ACCOUNTS;

    /** Per-key call counter so a failure can target the 2nd+ matching call. */
    const callCounts: Record<string, number> = {};
    /** Increment and return the 1-based ordinal of this call. */
    const bump = (key: string): number => {
        callCounts[key] = (callCounts[key] ?? 0) + 1;
        return callCounts[key];
    };
    /** True when the failure for `key` is armed for the call just counted. */
    const armed = (key: string): boolean => {
        const failure = failures[key];
        if (!failure) return false;
        return (callCounts[key] ?? 0) > (failure.skipFirst ?? 0);
    };

    const rows = (table: string) => {
        if (!tables[table]) tables[table] = [];
        return tables[table];
    };

    const idsOf = (table: string) => new Set(rows(table).map((r) => r.id));

    const guardForeignKeys = (table: string, row: Record<string, any>) => {
        if (table === 'financial_ledger') {
            if (row.payment_intent_id != null && !idsOf('payment_intents').has(row.payment_intent_id)) {
                const e: DbFailure = {
                    code: '23503',
                    message: 'insert or update on table "financial_ledger" violates foreign key constraint "financial_ledger_payment_intent_id_fkey"',
                };
                throw Object.assign(new Error(e.message), e);
            }
            if (row.invoice_id != null && !idsOf('invoices').has(row.invoice_id)) {
                const e: DbFailure = { code: '23503', message: 'violates foreign key constraint "financial_ledger_invoice_id_fkey"' };
                throw Object.assign(new Error(e.message), e);
            }
            if (row.beneficiary_id != null && !idsOf('beneficiaries').has(row.beneficiary_id)) {
                const e: DbFailure = { code: '23503', message: 'violates foreign key constraint "financial_ledger_beneficiary_id_fkey"' };
                throw Object.assign(new Error(e.message), e);
            }
        }
        if (table === 'order_splits') {
            if (row.invoice_id != null && !idsOf('invoices').has(row.invoice_id)) {
                const e: DbFailure = { code: '23503', message: 'violates foreign key constraint "order_splits_invoice_id_fkey"' };
                throw Object.assign(new Error(e.message), e);
            }
            if (row.beneficiary_id != null && !idsOf('beneficiaries').has(row.beneficiary_id)) {
                const e: DbFailure = { code: '23503', message: 'violates foreign key constraint "order_splits_beneficiary_id_fkey"' };
                throw Object.assign(new Error(e.message), e);
            }
        }
    };

    const guardChecks = (table: string, row: Record<string, any>) => {
        if (table === 'financial_ledger') {
            if (!allowedAccounts.includes(row.account)) {
                throw new Error(`violates check constraint "financial_ledger_account_check": ${row.account}`);
            }
            if (!(LEDGER_ENTRY_TYPES as readonly string[]).includes(row.entry_type)) {
                throw new Error(`violates check constraint "financial_ledger_entry_type_check": ${row.entry_type}`);
            }
            if (!(row.amount_minor > 0)) {
                throw new Error('violates check constraint "financial_ledger_amount_minor_check"');
            }
        }
        if (table === 'order_splits') {
            const dest = row.destination_account;
            if (dest != null && !allowedAccounts.includes(dest)) {
                throw new Error(`violates check constraint on destination_account: ${dest}`);
            }
            if (!(ORDER_SPLIT_STATUSES as readonly string[]).includes(row.status)) {
                throw new Error(`violates check constraint "order_splits_status_check": ${row.status}`);
            }
            for (const col of ['allocated_amount_minor', 'gross_amount_minor', 'gateway_fee_minor', 'net_amount_minor']) {
                if (row[col] != null && row[col] < 0) {
                    throw new Error(`violates check constraint "order_splits_${col.replace(/_minor$/, '_minor')}_check"`);
                }
            }
        }
        if (table === 'invoices' && 'payment_status' in row) {
            if (!(INVOICE_PAYMENT_STATUSES as readonly string[]).includes(row.payment_status)) {
                throw new Error(`violates check constraint "invoices_payment_status_check": ${row.payment_status}`);
            }
        }
        if (table === 'webhook_events' && 'status' in row) {
            if (!(WEBHOOK_EVENT_STATUSES as readonly string[]).includes(row.status)) {
                throw new Error(`violates check constraint "webhook_events_status_check": ${row.status}`);
            }
        }
    };

    const guardUnique = (table: string, candidates: Record<string, any>[]) => {
        if (table === 'order_splits') {
            for (const c of candidates) {
                const dup = rows(table).some(
                    (r) => r.invoice_id === c.invoice_id && r.beneficiary_id === c.beneficiary_id
                );
                if (dup) {
                    const e: DbFailure = { code: '23505', message: 'duplicate key value violates unique constraint "order_splits_invoice_beneficiary_unique"' };
                    throw Object.assign(new Error(e.message), e);
                }
            }
        }
        if (table === 'webhook_events') {
            for (const c of candidates) {
                const dup = rows(table).some(
                    (r) => r.provider === c.provider && r.provider_event_id === c.provider_event_id
                );
                if (dup) {
                    const e: DbFailure = { code: '23505', message: 'duplicate key value violates unique constraint "webhook_events_provider_event_unique"' };
                    throw Object.assign(new Error(e.message), e);
                }
            }
        }
    };

    const makeQuery = (table: string) => {
        const state: any = { match: {} };
        const chain: any = {};

        const selected = () => {
            const out = rows(table).filter((r) =>
                Object.entries(state.match).every(([k, v]) =>
                    Array.isArray(v) ? v.includes(r[k]) : r[k] === v
                )
            );
            if (state.order) {
                const { col, dir } = state.order;
                out.sort((a, b) => {
                    const av = a[col];
                    const bv = b[col];
                    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
                    return dir === 'desc' ? -cmp : cmp;
                });
            }
            if (state.limit != null) return out.slice(0, state.limit);
            return out;
        };

        chain.select = function (this: any) { return this; };
        chain.eq = function (this: any, col: string, val: unknown) { state.match[col] = val; return this; };
        chain.in = function (this: any, col: string, vals: unknown[]) { state.match[col] = vals; return this; };
        chain.order = function (this: any, col: string, o?: { ascending?: boolean }) {
            state.order = { col, dir: o?.ascending === false ? 'desc' : 'asc' };
            return this;
        };
        chain.limit = function (this: any, n: number) { state.limit = n; return this; };
        chain.maybeSingle = async () => {
            const key = `${table}.maybeSingle`;
            bump(key);
            if (armed(key)) return { data: null, error: failures[key] };
            const r = selected();
            return { data: r[0] ?? null, error: null };
        };
        chain.single = async () => {
            const key = `${table}.single`;
            bump(key);
            if (armed(key)) return { data: null, error: failures[key] };
            const r = selected();
            if (r.length === 0) return { data: null, error: { code: 'PGRST116', message: `no rows in ${table}` } };
            return { data: r[0], error: null };
        };
        chain.then = (onOk: any, onErr: any) => {
            const callKey = `${table}.select`;
            const nth = bump(callKey);
            if (
                table === 'order_splits' &&
                options.emptyOrderSplitsReadFrom != null &&
                nth === options.emptyOrderSplitsReadFrom
            ) {
                return Promise.resolve({ data: [], error: null }).then(onOk, onErr);
            }
            if (armed(callKey)) {
                return Promise.resolve({ data: null, error: failures[callKey] }).then(onOk, onErr);
            }
            return Promise.resolve({ data: selected(), error: null }).then(onOk, onErr);
        };

        chain.insert = (payload: any) => {
            const candidates = (Array.isArray(payload) ? payload : [payload]).map((r) => ({ ...r }));
            const failure = failures[`${table}.insert`];
            if (failure) {
                const q: any = Object.create(chain);
                q.single = async () => ({ data: null, error: failure });
                q.select = () => q;
                q.then = (onOk: any) => Promise.resolve({ data: null, error: failure }).then(onOk);
                return q;
            }
            try {
                for (const c of candidates) { guardChecks(table, c); guardForeignKeys(table, c); }
                guardUnique(table, candidates);
            } catch (err) {
                const e = err as DbFailure;
                const q: any = Object.create(chain);
                q.single = async () => ({ data: null, error: { code: e.code, message: e.message } });
                q.select = () => q;
                q.then = (onOk: any) => Promise.resolve({ data: null, error: { code: e.code, message: e.message } }).then(onOk);
                return q;
            }
            for (const c of candidates) {
                if (!c.id) c.id = `row-${table}-${rows(table).length + 1}`;
                rows(table).push(c);
                if (table === 'financial_ledger') ledger.push(c as LedgerRow);
            }
            const q: any = Object.create(chain);
            q.single = async () => ({ data: candidates[0], error: null });
            q.select = () => q;
            q.then = (onOk: any) => Promise.resolve({ data: candidates, error: null }).then(onOk);
            return q;
        };

        chain.upsert = (payload: any, _opts?: any) => {
            const candidates = (Array.isArray(payload) ? payload : [payload]).map((r) => ({ ...r }));
            const failure = failures[`${table}.upsert`];
            if (failure) {
                const q: any = Object.create(chain);
                q.select = () => q;
                q.single = async () => ({ data: null, error: failure });
                q.then = (onOk: any) => Promise.resolve({ data: null, error: failure }).then(onOk);
                return q;
            }
            const saved: Record<string, any>[] = [];
            for (const c of candidates) {
                if (!c.id) c.id = `row-${table}-${rows(table).length + 1}`;
                rows(table).push(c);
                saved.push(c);
            }
            const q: any = Object.create(chain);
            q.select = () => q;
            q.single = async () => ({ data: saved[0], error: null });
            q.then = (onOk: any) => Promise.resolve({ data: saved, error: null }).then(onOk);
            return q;
        };

        chain.update = (patch: any) => {
            const q: any = Object.create(chain);
            q.select = () => q;
            q.then = (onOk: any, onErr: any) => {
                const failure = failures[`${table}.update`];
                if (failure) return Promise.resolve({ data: null, error: failure }).then(onOk, onErr);
                const targets = selected();
                try {
                    for (const t of targets) {
                        const merged = { ...t, ...patch };
                        guardChecks(table, merged);
                        Object.assign(t, patch);
                    }
                } catch (err) {
                    const e = err as DbFailure;
                    return Promise.resolve({ data: null, error: { code: e.code, message: e.message } }).then(onOk, onErr);
                }
                return Promise.resolve({ data: targets, error: null }).then(onOk, onErr);
            };
            return q;
        };

        return chain;
    };

    const client = {
        from: (table: string) => makeQuery(table),
        rpc: vi.fn(async (name: string, args?: any) => {
            rpcLog.push({ name, args });
            return { data: null, error: null };
        }),
    } as unknown as SupabaseClient;

    return { client, tables, ledger, rpcLog };
}
