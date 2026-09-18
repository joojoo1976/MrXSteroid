import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createPaymentIntentAttempt } from '../../server/payments/paymentIntentService';

interface Resp {
    data?: any;
    error?: any;
}

function chain(respAwait: Resp, respSingle?: Resp): any {
    const builder: any = {};
    for (const method of ['select', 'insert', 'update', 'upsert', 'eq', 'order', 'limit']) {
        builder[method] = vi.fn(() => builder);
    }
    builder.single = vi.fn(async () => respSingle ?? respAwait);
    builder.then = (resolve: (value: Resp) => unknown) => Promise.resolve(respAwait).then(resolve);
    return builder;
}

function makeClient(opts: {
    attempts?: any[] | null;
    fetchError?: any;
    insertData?: any;
    insertError?: any;
    updateError?: any;
}) {
    const listBuilder = chain({ data: opts.attempts ?? [], error: opts.fetchError ?? null });
    const updateBuilder = chain({ error: opts.updateError ?? null });
    const insertBuilder = chain(
        { error: opts.insertError ?? null },
        { data: opts.insertData, error: opts.insertError ?? null }
    );

    const calls = { select: [] as any[], update: [] as any[], insert: [] as any[] };

    const fromSpy = vi.fn(() => ({
        select: (...args: any[]) => {
            calls.select.push(args);
            return listBuilder;
        },
        update: (...args: any[]) => {
            calls.update.push(args);
            return updateBuilder;
        },
        insert: (...args: any[]) => {
            calls.insert.push(args);
            return insertBuilder;
        },
    }));

    return { client: { from: fromSpy } as unknown as SupabaseClient, calls, fromSpy };
}

const baseParams = {
    invoiceId: 'inv-1',
    merchantReference: 'MRX-INV-1',
    amountMinor: 49900,
    currency: 'egp',
    environment: 'test' as const,
};

describe('PaymentIntentService — attempt lifecycle (N-1 / N-2)', () => {
    it('creates attempt #1 as current when no prior attempts exist', async () => {
        const inserted = {
            id: 'pi-1',
            invoice_id: 'inv-1',
            attempt_number: 1,
            supersedes_payment_intent_id: null,
            is_current: true,
            status: 'initiated',
        };
        const { client, calls } = makeClient({ attempts: [], insertData: inserted });

        const record = await createPaymentIntentAttempt(baseParams, client);

        expect(record).toEqual(inserted);
        expect(calls.insert[0][0]).toEqual(
            expect.objectContaining({
                invoice_id: 'inv-1',
                attempt_number: 1,
                supersedes_payment_intent_id: null,
                is_current: true,
                currency: 'EGP',
                status: 'initiated',
                fx_rate: 1.0,
            })
        );
        expect(calls.update).toHaveLength(0);
    });

    it('supersedes and demotes the previous current attempt', async () => {
        const inserted = {
            id: 'pi-3',
            invoice_id: 'inv-1',
            attempt_number: 3,
            supersedes_payment_intent_id: 'pi-2',
            is_current: true,
            status: 'initiated',
        };
        const { client, calls } = makeClient({
            attempts: [
                { id: 'pi-2', attempt_number: 2, is_current: true },
                { id: 'pi-1', attempt_number: 1, is_current: false },
            ],
            insertData: inserted,
        });

        const record = await createPaymentIntentAttempt(baseParams, client);

        expect(record.attempt_number).toBe(3);
        expect(calls.insert[0][0]).toEqual(
            expect.objectContaining({ attempt_number: 3, supersedes_payment_intent_id: 'pi-2', is_current: true })
        );
        expect(calls.update).toHaveLength(1);
        expect(calls.update[0][0]).toEqual(expect.objectContaining({ is_current: false }));
    });

    it('uses the highest attempt number even when the current attempt is not the newest', async () => {
        const { client, calls } = makeClient({
            attempts: [
                { id: 'pi-5', attempt_number: 5, is_current: false },
                { id: 'pi-4', attempt_number: 4, is_current: true },
            ],
            insertData: { id: 'pi-6', attempt_number: 6, is_current: true },
        });

        await createPaymentIntentAttempt(baseParams, client);

        expect(calls.insert[0][0]).toEqual(expect.objectContaining({ attempt_number: 6 }));
        expect(calls.update[0][0]).toEqual(expect.objectContaining({ is_current: false }));
    });

    it('throws when querying existing attempts fails', async () => {
        const { client } = makeClient({ fetchError: { message: 'query-down' } });

        await expect(createPaymentIntentAttempt(baseParams, client)).rejects.toThrow(
            'Failed to query existing attempts: query-down'
        );
    });

    it('throws when demoting the superseded attempt fails (avoids two current intents)', async () => {
        const { client, calls } = makeClient({
            attempts: [{ id: 'pi-1', attempt_number: 1, is_current: true }],
            updateError: { message: 'demote-down' },
        });

        await expect(createPaymentIntentAttempt(baseParams, client)).rejects.toThrow(
            'Failed to supersede previous attempt #1: demote-down'
        );
        expect(calls.insert).toHaveLength(0);
    });

    it('throws when inserting the new attempt fails', async () => {
        const { client } = makeClient({ attempts: [], insertData: null, insertError: { message: 'insert-down' } });

        await expect(createPaymentIntentAttempt(baseParams, client)).rejects.toThrow(
            'Failed to create payment intent attempt: insert-down'
        );
    });
});
