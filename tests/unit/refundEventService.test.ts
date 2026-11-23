import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    ingestRefundEvent,
    recordAdminRefund,
    applyFullRefundAccessPolicy,
} from '../../server/payments/refund/refundEvent';

type Row = Record<string, unknown>;

interface FakeOptions {
    seed?: Record<string, Row[]>;
    /** Forces an insert error for a table (e.g. unique violation). */
    insertErrors?: Record<string, { code?: string; message: string }>;
}

/**
 * Minimal in-memory PostgREST-shaped fake. It implements exactly the calls the
 * refund service makes, including unique dedupe on
 * (provider, provider_event_id) and chainable filters.
 */
function createFakeDb(options: FakeOptions = {}) {
    const tables: Record<string, Row[]> = {
        webhook_events: [],
        invoices: [],
        payment_intents: [],
        refunds: [],
        entitlements: [],
        profiles: [],
        ...(options.seed || {}),
    };
    const insertErrors = options.insertErrors || {};
    const touched: string[] = [];
    let seq = 0;

    const makeQuery = (table: string) => {
        const q: any = {
            table,
            action: 'select' as 'select' | 'insert' | 'update',
            payload: null as Row | null,
            filters: [] as Array<[string, unknown]>,
            limitN: null as number | null,
            select() { return q; },
            insert(payload: Row) { q.action = 'insert'; q.payload = payload; return q; },
            update(payload: Row) { q.action = 'update'; q.payload = payload; return q; },
            upsert(payload: Row) { q.action = 'insert'; q.payload = payload; return q; },
            eq(column: string, value: unknown) { q.filters.push([column, value]); return q; },
            order() { return q; },
            limit(n: number) { q.limitN = n; return q; },
            maybeSingle() { return q.exec('one'); },
            single() { return q.exec('one'); },
            then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
                return q.exec('many').then(resolve, reject);
            },
            async exec(mode: 'one' | 'many') {
                const rows = tables[table] || (tables[table] = []);
                if (!touched.includes(table)) touched.push(table);
                const matches = rows.filter((row) =>
                    q.filters.every(([column, value]: [string, unknown]) => row[column] === value)
                );

                if (q.action === 'insert') {
                    const payload = q.payload || {};
                    const forced = insertErrors[table];
                    if (forced) return { data: null, error: forced };

                    if (table === 'webhook_events') {
                        const duplicate = rows.some(
                            (row) =>
                                row.provider === payload.provider &&
                                row.provider_event_id === payload.provider_event_id
                        );
                        if (duplicate) {
                            return { data: null, error: { code: '23505', message: 'duplicate key value' } };
                        }
                    }

                    const inserted = { id: `${table}-${++seq}`, ...payload };
                    rows.push(inserted);
                    return { data: inserted, error: null };
                }

                if (q.action === 'update') {
                    for (const row of matches) Object.assign(row, q.payload);
                    return { data: matches, error: null };
                }

                const limited = q.limitN ? matches.slice(0, q.limitN) : matches;
                return { data: mode === 'one' ? (limited[0] ?? null) : limited, error: null };
            },
        };
        return q;
    };

    const client = { from: (table: string) => makeQuery(table) } as unknown as SupabaseClient;
    return { client, tables, touched };
}

const invoice = (overrides: Row = {}): Row => ({
    id: 'inv-1',
    amount: 499,
    currency: 'EGP',
    user_id: 'user-1',
    status: 'success',
    payment_status: 'paid',
    ...overrides,
});

const intent = (overrides: Row = {}): Row => ({
    id: 'pi-1',
    invoice_id: 'inv-1',
    provider: 'kashier',
    provider_order_id: 'txn-1',
    attempt_number: 1,
    ...overrides,
});

const entitlement = (overrides: Row = {}): Row => ({
    id: 'ent-1',
    user_id: 'user-1',
    product_id: 'digital',
    invoice_id: 'inv-1',
    status: 'granted',
    ...overrides,
});

describe('Refund event ingestion — refund / void / cancel / dispute', () => {
    it('records a provider refund and revokes access for a completed full refund', async () => {
        const db = createFakeDb({
            seed: {
                invoices: [invoice()],
                payment_intents: [intent()],
                entitlements: [entitlement()],
                profiles: [{ id: 'user-1', has_paid: true }],
            },
        });

        const result = await ingestRefundEvent(db.client, {
            provider: 'kashier',
            kind: 'refund',
            invoiceId: 'inv-1',
            amountMajor: 499,
            providerReference: 'txn-1',
            providerEventId: 'evt-refund-1',
            providerStatus: 'REFUNDED',
            rawPayload: { orderStatus: 'REFUNDED' },
        });

        expect(result.code).toBe('recorded');
        expect(result.status).toBe('completed');
        expect(result.fullRefund).toBe(true);
        expect(result.accessRevoked).toBe(true);
        expect(result.hasPaidCleared).toBe(true);

        expect(db.tables.refunds).toHaveLength(1);
        expect(db.tables.refunds[0]).toMatchObject({
            invoice_id: 'inv-1',
            payment_intent_id: 'pi-1',
            amount_minor: 49900,
            currency: 'EGP',
            status: 'completed',
        });
        expect(db.tables.entitlements[0].status).toBe('revoked');
        expect(db.tables.profiles[0].has_paid).toBe(false);

        const event = db.tables.webhook_events[0];
        expect(event).toMatchObject({
            provider: 'kashier',
            provider_event_id: 'evt-refund-1',
            provider_operation: 'refund',
            status: 'processed',
            processing_status: 'refund_recorded',
        });
    });

    it('keeps has_paid when another entitlement is still granted', async () => {
        const db = createFakeDb({
            seed: {
                invoices: [invoice()],
                payment_intents: [intent()],
                entitlements: [
                    entitlement(),
                    entitlement({ id: 'ent-2', invoice_id: 'inv-other', product_id: 'coaching' }),
                ],
                profiles: [{ id: 'user-1', has_paid: true }],
            },
        });

        const result = await ingestRefundEvent(db.client, {
            provider: 'kashier',
            kind: 'refund',
            invoiceId: 'inv-1',
            amountMajor: 499,
            providerEventId: 'evt-refund-2',
        });

        expect(result.accessRevoked).toBe(true);
        expect(result.hasPaidCleared).toBe(false);
        expect(db.tables.profiles[0].has_paid).toBe(true);
        expect(db.tables.entitlements.find((e) => e.id === 'ent-2')?.status).toBe('granted');
    });

    it('records a partial refund without touching access', async () => {
        const db = createFakeDb({
            seed: {
                invoices: [invoice()],
                payment_intents: [intent()],
                entitlements: [entitlement()],
                profiles: [{ id: 'user-1', has_paid: true }],
            },
        });

        const result = await ingestRefundEvent(db.client, {
            provider: 'kashier',
            kind: 'refund',
            invoiceId: 'inv-1',
            amountMajor: 100,
            providerEventId: 'evt-refund-3',
        });

        expect(result.code).toBe('recorded');
        expect(result.fullRefund).toBe(false);
        expect(result.accessRevoked).toBe(false);
        expect(db.tables.refunds[0].amount_minor).toBe(10000);
        expect(db.tables.entitlements[0].status).toBe('granted');
        expect(db.tables.profiles[0].has_paid).toBe(true);
    });

    it('maps VOIDED to a completed full refund and revokes access', async () => {
        const db = createFakeDb({
            seed: {
                invoices: [invoice()],
                payment_intents: [intent()],
                entitlements: [entitlement()],
                profiles: [{ id: 'user-1', has_paid: true }],
            },
        });

        const result = await ingestRefundEvent(db.client, {
            provider: 'kashier',
            kind: 'void',
            invoiceId: 'inv-1',
            amountMajor: 499,
            providerEventId: 'evt-void-1',
        });

        expect(result.status).toBe('completed');
        expect(result.accessRevoked).toBe(true);
        expect(db.tables.refunds[0].status).toBe('completed');
    });

    it('records a cancellation without revoking access (not a confirmed refund)', async () => {
        const db = createFakeDb({
            seed: {
                invoices: [invoice()],
                payment_intents: [intent({ provider: 'fourthwall' })],
                entitlements: [entitlement()],
                profiles: [{ id: 'user-1', has_paid: true }],
            },
        });

        const result = await ingestRefundEvent(db.client, {
            provider: 'fourthwall',
            kind: 'cancel',
            invoiceId: 'inv-1',
            amountMajor: 499,
            providerEventId: 'evt-cancel-1',
        });

        expect(result.status).toBe('cancelled');
        expect(result.accessRevoked).toBe(false);
        expect(db.tables.refunds[0].status).toBe('cancelled');
        expect(db.tables.entitlements[0].status).toBe('granted');
        expect(db.tables.profiles[0].has_paid).toBe(true);
    });

    it('records disputes as unknown and never revokes access', async () => {
        for (const kind of ['dispute_opened', 'dispute_closed'] as const) {
            const db = createFakeDb({
                seed: {
                    invoices: [invoice()],
                    payment_intents: [intent({ provider: 'stripe' })],
                    entitlements: [entitlement()],
                    profiles: [{ id: 'user-1', has_paid: true }],
                },
            });

            const result = await ingestRefundEvent(db.client, {
                provider: 'stripe',
                kind,
                invoiceId: 'inv-1',
                amountMajor: 499,
                providerEventId: `evt-${kind}`,
            });

            expect(result.code).toBe('recorded');
            expect(result.status).toBe('unknown');
            expect(result.accessRevoked).toBe(false);
            expect(db.tables.refunds[0].status).toBe('unknown');
            expect(db.tables.entitlements[0].status).toBe('granted');
        }
    });

    it('is idempotent: a duplicate provider event writes no second refund', async () => {
        const db = createFakeDb({
            seed: {
                invoices: [invoice()],
                payment_intents: [intent()],
                entitlements: [entitlement()],
            },
        });

        const base = {
            provider: 'kashier',
            kind: 'refund' as const,
            invoiceId: 'inv-1',
            amountMajor: 499,
            providerEventId: 'evt-dup-1',
        };

        const first = await ingestRefundEvent(db.client, base);
        const second = await ingestRefundEvent(db.client, base);

        expect(first.code).toBe('recorded');
        expect(second.code).toBe('duplicate');
        expect(db.tables.refunds).toHaveLength(1);
        expect(db.tables.webhook_events).toHaveLength(1);
        expect(db.tables.webhook_events[0].processing_status).toBe('refund_duplicate');
    });

    it('records an intent-less refund against the invoice (no invented intent)', async () => {
        // Migration 20261123120000 relaxes refunds.payment_intent_id: a provider
        // path that never created an intent must still produce a refund row.
        const db = createFakeDb({
            seed: { invoices: [invoice()], payment_intents: [] },
        });

        const result = await ingestRefundEvent(db.client, {
            provider: 'stripe',
            kind: 'refund',
            invoiceId: 'inv-1',
            amountMajor: 499,
            providerEventId: 'evt-unlinked-1',
        });

        expect(result.code).toBe('recorded');
        expect(result.intentLinked).toBe(false);
        expect(db.tables.refunds).toHaveLength(1);
        expect(db.tables.refunds[0]).toMatchObject({
            invoice_id: 'inv-1',
            payment_intent_id: null,
            amount_minor: 49900,
            status: 'completed',
        });
        expect(db.tables.webhook_events[0]).toMatchObject({
            status: 'processed',
            processing_status: 'refund_recorded_unlinked',
            invoice_id: 'inv-1',
        });
    });

    it('resolves the invoice from the provider transaction reference when absent', async () => {
        const db = createFakeDb({
            seed: {
                invoices: [invoice()],
                payment_intents: [intent({ provider_order_id: 'txn-lookup' })],
                entitlements: [entitlement()],
            },
        });

        const result = await ingestRefundEvent(db.client, {
            provider: 'kashier',
            kind: 'refund',
            invoiceId: null,
            providerReference: 'txn-lookup',
            providerEventId: 'evt-lookup-1',
        });

        expect(result.code).toBe('recorded');
        expect(db.tables.refunds[0].invoice_id).toBe('inv-1');
    });

    it('never writes to ledger, splits, or invoices during refund ingestion', async () => {
        const db = createFakeDb({
            seed: { invoices: [invoice()], payment_intents: [intent()], entitlements: [entitlement()] },
        });

        await ingestRefundEvent(db.client, {
            provider: 'kashier',
            kind: 'refund',
            invoiceId: 'inv-1',
            amountMajor: 499,
            providerEventId: 'evt-no-settlement',
        });

        expect(db.touched).not.toContain('financial_ledger');
        expect(db.touched).not.toContain('revenue_splits');
        expect(db.tables.invoices[0].payment_status).toBe('paid');
    });

    it('reports an error (no refund row) when the refund insert fails', async () => {
        const db = createFakeDb({
            seed: { invoices: [invoice()], payment_intents: [intent()] },
            insertErrors: { refunds: { code: '23502', message: 'null value in column' } },
        });

        const result = await ingestRefundEvent(db.client, {
            provider: 'kashier',
            kind: 'refund',
            invoiceId: 'inv-1',
            amountMajor: 499,
            providerEventId: 'evt-insert-fail',
        });

        expect(result.code).toBe('error');
        expect(db.tables.refunds).toHaveLength(0);
        expect(db.tables.webhook_events[0].status).toBe('failed');
    });
});

describe('Full-refund access policy', () => {
    it('revokes only the refunded invoice entitlements', async () => {
        const db = createFakeDb({
            seed: {
                entitlements: [
                    entitlement(),
                    entitlement({ id: 'ent-2', invoice_id: 'inv-2', product_id: 'bundle' }),
                ],
                profiles: [{ id: 'user-1', has_paid: true }],
            },
        });

        const result = await applyFullRefundAccessPolicy(db.client, {
            invoiceId: 'inv-1',
            userId: 'user-1',
            reason: 'test',
        });

        expect(result.accessRevoked).toBe(true);
        expect(db.tables.entitlements.find((e) => e.id === 'ent-1')?.status).toBe('revoked');
        expect(db.tables.entitlements.find((e) => e.id === 'ent-2')?.status).toBe('granted');
        expect(result.hasPaidCleared).toBe(false);
    });
});

describe('Admin refund recording (no provider call)', () => {
    const baseSeed = () => ({
        invoices: [invoice()],
        payment_intents: [intent()],
        entitlements: [entitlement()],
        profiles: [{ id: 'user-1', has_paid: true }],
    });

    it('records a requested refund without revoking access', async () => {
        const db = createFakeDb({ seed: baseSeed() });

        const result = await recordAdminRefund(db.client, {
            invoiceId: 'inv-1',
            amountMinor: 49900,
            reason: 'customer request',
            adminId: 'admin-1',
        });

        expect(result.code).toBe('recorded');
        expect(result.status).toBe('requested');
        expect(result.accessRevoked).toBe(false);
        expect(db.tables.refunds[0]).toMatchObject({
            status: 'requested',
            requested_by: 'admin-1',
            amount_minor: 49900,
        });
        expect(db.tables.entitlements[0].status).toBe('granted');
    });

    it('applies the access policy for an externally completed full refund', async () => {
        const db = createFakeDb({ seed: baseSeed() });

        const result = await recordAdminRefund(db.client, {
            invoiceId: 'inv-1',
            reason: 'refunded in gateway dashboard',
            status: 'completed',
            provider: 'kashier',
            providerReference: 'kref-1',
            adminId: 'admin-1',
        });

        expect(result.code).toBe('recorded');
        expect(result.fullRefund).toBe(true);
        expect(result.accessRevoked).toBe(true);
        expect(result.hasPaidCleared).toBe(true);
        expect(db.tables.refunds[0].status).toBe('completed');
        expect(db.tables.profiles[0].has_paid).toBe(false);
    });

    it('rejects an amount above the invoice total', async () => {
        const db = createFakeDb({ seed: baseSeed() });

        const result = await recordAdminRefund(db.client, {
            invoiceId: 'inv-1',
            amountMinor: 50000,
            reason: 'too much',
            adminId: 'admin-1',
        });

        expect(result.code).toBe('invalid_amount');
        expect(db.tables.refunds).toHaveLength(0);
    });

    it('rejects a duplicate provider reference', async () => {
        const db = createFakeDb({ seed: baseSeed() });

        const first = await recordAdminRefund(db.client, {
            invoiceId: 'inv-1',
            reason: 'first',
            provider: 'kashier',
            providerReference: 'kref-dup',
            adminId: 'admin-1',
        });
        const second = await recordAdminRefund(db.client, {
            invoiceId: 'inv-1',
            reason: 'second',
            provider: 'kashier',
            providerReference: 'kref-dup',
            adminId: 'admin-1',
        });

        expect(first.code).toBe('recorded');
        expect(second.code).toBe('duplicate');
        expect(db.tables.refunds).toHaveLength(1);
    });

    it('reports a missing invoice and a missing payment intent distinctly', async () => {
        const noInvoice = createFakeDb({ seed: { invoices: [], payment_intents: [] } });
        await expect(
            recordAdminRefund(noInvoice.client, {
                invoiceId: 'inv-missing',
                reason: 'nope',
                adminId: 'admin-1',
            })
        ).resolves.toMatchObject({ code: 'invoice_not_found' });

        const noIntent = createFakeDb({ seed: { invoices: [invoice()], payment_intents: [] } });
        await expect(
            recordAdminRefund(noIntent.client, {
                invoiceId: 'inv-1',
                reason: 'nope',
                adminId: 'admin-1',
            })
        ).resolves.toMatchObject({ code: 'payment_intent_not_found' });
    });
});

// Keep vi imported for parity with the repo's test style and future spies.
void vi;
