/**
 * tests/helpers/seoSupabaseFake.ts
 *
 * Shared chainable in-memory Supabase fake for the SEO route tests. Mirrors
 * PostgREST semantics closely enough for the SEO handlers and adds two things
 * the generic inMemorySupabase helper deliberately lacks:
 *
 *   - error injection per table+operation (42703-style column errors) so tests
 *     can prove a failed write produces a REAL failure instead of fake success;
 *   - a full operation log (table, methods, select columns, payload, eq
 *     filters) so tests can pin exactly which columns a route reads and writes.
 *
 * Chain builders MUST be declared as `function (this: any)` so that
 * `return this` keeps the fluent chain (arrow functions lose `this`).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';

export interface SeoFakeConfig {
    /** Rows returned by seo_keywords selects (main scan). */
    keywordsRows?: Array<Record<string, any>>;
    /** Error injected into seo_keywords selects. */
    keywordsError?: { message: string } | null;
    /** Error injected into every seo_keywords update. */
    updateError?: { message: string } | null;
    /** Rows returned by the language-filtered snapshot re-read. */
    langKeywordRows?: Array<Record<string, any>>;
    /** Error injected into seo_keyword_snapshots upserts. */
    snapshotUpsertError?: { message: string } | null;

    /**
     * Prior-week rows returned for `seo_keyword_weekly_states` SELECTs. The
     * runtime reads them to compute the historical diff, so a test can seed real
     * history and assert the NEW/RISING/LOST states the route actually emits.
     */
    weeklyStateRows?: Array<Record<string, unknown>>;

    /** Error injected into `seo_keyword_weekly_states` upserts. */
    weeklyStateUpsertError?: { message: string } | null;
    /** Error injected into every provenance RPC call. */
    provenanceError?: { message: string } | null;
}

export interface SeoFakeOp {
    table: string;
    methods: string[];
    selectArg?: string;
    payload?: unknown;
    eqs: Array<[string, unknown]>;
}

export interface SeoFakeSupabase {
    from: (table: string) => any;
    /** Every completed operation, in order. */
    ops: SeoFakeOp[];
    /** Provenance RPC calls, in order (seo_record_keyword_provenance). */
    rpcCalls: Array<{ fn: string; args: Record<string, unknown> }>;
    /** Error injected into every provenance RPC call. */
    provenanceError: { message: string } | null;
}

export function createSeoSupabaseFake(cfg: SeoFakeConfig = {}): SeoFakeSupabase {
    const ops: SeoFakeOp[] = [];
    const rpcCalls: SeoFakeSupabase['rpcCalls'] = [];
    const provenanceError: { message: string } | null =
        cfg.provenanceError ?? null;

    const rpc = vi.fn(async (fn: string, args: Record<string, unknown> = {}) => {
        rpcCalls.push({ fn, args });
        if (provenanceError) return { data: null, error: provenanceError };
        return {
            data: {
                keyword_id: args.p_keyword_id ?? 'kw-1',
                source_id: 'source-editorial',
                provenance_inserted: true,
                source_backed: true,
            },
            error: null,
        };
    });

    const makeBuilder = (table: string) => {
        const state: any = { table, methods: [], eqs: [] };

        const compute = (): { data: any; error: any } => {
            ops.push({
                table,
                methods: [...state.methods],
                selectArg: state.selectArg,
                payload: state.payload,
                eqs: [...state.eqs],
            });
            if (table === 'seo_keyword_refresh_runs') {
                if (state.methods.includes('insert')) return { data: { id: 'run-1' }, error: null };
                return { data: null, error: null };
            }
            if (table === 'seo_internal_search_logs' && state.methods.includes('select')) {
                return { data: [], error: null };
            }
            if (table === 'seo_keyword_pins' && state.methods.includes('select')) {
                return { data: null, error: null };
            }
            if (table === 'seo_keyword_weekly_states') {
                if (state.methods.includes('upsert')) {
                    return { data: null, error: cfg.weeklyStateUpsertError ?? null };
                }
                // Prior-week history for COMPARE_WITH_HISTORY + the diff.
                return { data: cfg.weeklyStateRows ?? [], error: null };
            }
            if (table === 'seo_keyword_snapshots' && state.methods.includes('upsert')) {
                return { data: null, error: cfg.snapshotUpsertError ?? null };
            }
            if (table === 'seo_keywords') {
                if (state.methods.includes('update')) return { data: null, error: cfg.updateError ?? null };
                if (state.methods.includes('select')) {
                    // The snapshot re-read chains a `language` eq; the main
                    // scan only filters is_active.
                    const isLangQuery = state.eqs.some(([col]) => col === 'language');
                    return isLangQuery
                        ? { data: cfg.langKeywordRows ?? [], error: null }
                        : { data: cfg.keywordsRows ?? [], error: cfg.keywordsError ?? null };
                }
            }
            return { data: null, error: null };
        };

        const chain: any = {};
        const setMethod = (method: string) =>
            function (this: any, ...args: any[]) {
                state.methods.push(method);
                if (method === 'insert' || method === 'update' || method === 'upsert') state.payload = args[0];
                if (method === 'select' && typeof args[0] === 'string') state.selectArg = args[0];
                return this;
            };

        chain.select = setMethod('select');
        chain.insert = setMethod('insert');
        chain.update = setMethod('update');
        chain.upsert = setMethod('upsert');
        chain.eq = function (this: any, col: string, val: unknown) { state.eqs.push([col, val]); return this; };
        chain.gte = function (this: any) { return this; };
        chain.neq = function (this: any) { return this; };
        chain.order = function (this: any) { return this; };
        chain.limit = function (this: any) { return this; };
        chain.single = async () => compute();
        // Bare `await` on the chain settles through `.then`.
        chain.then = (onOk: any, onErr: any) => Promise.resolve(compute()).then(onOk, onErr);
        chain.catch = (onErr: any) => Promise.resolve(compute()).catch(onErr);
        return chain;
    };

    const from = vi.fn((table: string) => makeBuilder(table));
    return { from, rpc, ops, rpcCalls, provenanceError };
}
