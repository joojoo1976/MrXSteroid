/**
 * tests/helpers/inMemorySupabase.ts
 *
 * Shared table-backed, chainable in-memory fake of the Supabase client used by
 * route/integration tests (webhook handler, checkout delegation, ...).
 *
 * Conventions that mirror PostgREST semantics closely enough for the handlers:
 *   - `.select(cols).eq(...).eq(...).maybeSingle()`  → first match or null
 *   - `.select(...).eq(...).single()`                 → row or PGRST116 error
 *   - `.insert(payload).single()` / bare `.insert(payload)`  → pushes rows
 *   - `.update(patch).eq(...)` (awaited bare)         → applies patch to rows
 *   - `.select(...).eq(...).order(...).limit(...).then()` → filtered list
 *   - `.rpc(name, args)`                              → `{ data: null, error: null }`
 *
 * IMPORTANT: chain builders MUST be declared as `function (this: any)` so that
 * `return this` keeps the fluent chain (arrow functions lose `this`).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';

export interface InMemorySupabase {
    tables: Record<string, Record<string, any>[]>;
    rpcLog: Array<{ name: string; args: any }>;
    createClientMock: ReturnType<typeof vi.fn>;
}

export function createInMemorySupabase(): InMemorySupabase {
    const tables: Record<string, Record<string, any>[]> = {};
    const rpcLog: Array<{ name: string; args: any }> = [];

    const load = (table: string): Record<string, any>[] => {
        if (!tables[table]) tables[table] = [];
        return tables[table];
    };
    const nextId = () => `row-${Math.random().toString(36).slice(2, 10)}`;

    const matches = (row: Record<string, any>, match: Record<string, any>) =>
        Object.entries(match).every(([k, v]) =>
            Array.isArray(v) ? v.includes(row[k]) : row[k] === v
        );

    const queryRows = (table: string, state: any): Record<string, any>[] => {
        let rows = load(table).filter((r) => matches(r, state.match || {}));
        if (state.order) {
            const { col, dir } = state.order;
            rows = [...rows].sort((a, b) => {
                const av = a[col];
                const bv = b[col];
                const cmp = av < bv ? -1 : av > bv ? 1 : 0;
                return dir === 'desc' ? -cmp : cmp;
            });
        }
        if (state.limit != null) rows = rows.slice(0, state.limit);
        return rows;
    };

    const makeQuery = (table: string) => {
        const state: any = { match: {} };
        const chain: any = {};

        chain.select = function (this: any) { return this; };
        chain.eq = function (this: any, col: string, val: unknown) { state.match[col] = val; return this; };
        chain.in = function (this: any, col: string, vals: unknown[]) { state.match[col] = vals; return this; };
        chain.order = function (this: any, col: string, opts?: { ascending?: boolean }) {
            state.order = { col, dir: opts?.ascending === false ? 'desc' : 'asc' };
            return this;
        };
        chain.limit = function (this: any, n: number) { state.limit = n; return this; };

        // Plain select list (thenable)
        chain.then = (onOk: any) =>
            Promise.resolve({ data: queryRows(table, state), error: null }).then(onOk);

        chain.maybeSingle = async () => {
            const rows = queryRows(table, state);
            return { data: rows[0] ?? null, error: null };
        };
        chain.single = async () => {
            const rows = queryRows(table, state);
            if (rows.length === 0) return { data: null, error: { code: 'PGRST116', message: `no rows in ${table}` } };
            return { data: rows[0], error: null };
        };

        chain.insert = (payload: any) => {
            const arr = Array.isArray(payload) ? payload : [payload];
            const rows = arr.map((r) => ({ ...r, id: r.id || nextId() }));
            rows.forEach((r) => load(table).push(r));
            const q = Object.create(chain);
            q.single = async () => ({ data: rows[0], error: null });
            q.maybeSingle = async () => ({ data: rows[0], error: null });
            q.then = (onOk: any) => Promise.resolve({ data: rows, error: null }).then(onOk);
            return q;
        };
        chain.upsert = chain.insert;

        chain.update = (patch: any) => {
            const q = Object.create(chain);
            q.select = function (this: any) { return this; };
            // NOTE: `await` on a thenable settles only when this `.then` calls its
            // resolve callback — returning a promise is NOT enough.
            q.then = (onOk: any, onErr: any) => {
                const rows = queryRows(table, state);
                rows.forEach((r) => Object.assign(r, patch, { id: r.id }));
                return Promise.resolve({ data: rows, error: null }).then(onOk, onErr);
            };
            return q;
        };

        chain.delete = () => {
            const q = Object.create(chain);
            q.then = (onOk: any, onErr: any) => {
                const rows = queryRows(table, state);
                load(table).forEach((r, idx) => {
                    if (rows.includes(r)) delete load(table)[idx];
                });
                return Promise.resolve({ data: rows, error: null }).then(onOk, onErr);
            };
            return q;
        };

        return chain;
    };

    const createClientMock = vi.fn(() => ({
        from: (table: string) => makeQuery(table),
        rpc: vi.fn(async (name: string, args?: any) => {
            rpcLog.push({ name, args });
            return { data: null, error: null };
        }),
    }));

    return { tables, rpcLog, createClientMock };
}