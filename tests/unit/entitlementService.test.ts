import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    grantEntitlement,
    scheduleEntitlementRevocation,
    revokeEntitlement,
    checkUserEntitlement,
    ENTITLEMENT_GRACE_PERIOD_DAYS,
} from '../../server/payments/entitlementService';

interface Resp {
    data?: unknown;
    error?: unknown;
}

function makeBuilder(resp: Resp): any {
    const builder: any = {};
    for (const method of ['select', 'insert', 'update', 'upsert', 'eq', 'order', 'limit']) {
        builder[method] = vi.fn(() => builder);
    }
    builder.single = vi.fn(async () => resp);
    builder.maybeSingle = vi.fn(async () => resp);
    builder.then = (resolve: (value: Resp) => unknown) => Promise.resolve(resp).then(resolve);
    return builder;
}

function clientReturning(resp: Resp): { client: SupabaseClient; builder: any; fromSpy: any } {
    const builder = makeBuilder(resp);
    const fromSpy = vi.fn(() => builder);
    return { client: { from: fromSpy } as unknown as SupabaseClient, builder, fromSpy };
}

describe('EntitlementService (v4 - N-11 / Owner Decision 3-3)', () => {
    it('grants entitlement with upsert on (user_id, product_id, invoice_id)', async () => {
        const { client, builder, fromSpy } = clientReturning({ data: { id: 'ent-1' }, error: null });

        const result = await grantEntitlement(
            { userId: 'u-1', productId: 'p-1', invoiceId: 'inv-1', paymentIntentId: 'pi-1' },
            client
        );

        expect(result).toEqual({ success: true, entitlementId: 'ent-1' });
        expect(fromSpy).toHaveBeenCalledWith('entitlements');
        expect(builder.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                user_id: 'u-1',
                product_id: 'p-1',
                invoice_id: 'inv-1',
                payment_intent_id: 'pi-1',
                status: 'granted',
            }),
            { onConflict: 'user_id,product_id,invoice_id' }
        );
    });

    it('defaults payment_intent_id to null when not supplied', async () => {
        const { client, builder } = clientReturning({ data: { id: 'ent-2' }, error: null });

        await grantEntitlement({ userId: 'u-1', productId: 'p-1', invoiceId: 'inv-1' }, client);

        expect(builder.upsert).toHaveBeenCalledWith(
            expect.objectContaining({ payment_intent_id: null }),
            expect.anything()
        );
    });

    it('throws when the grant upsert fails', async () => {
        const { client } = clientReturning({ data: null, error: { message: 'boom' } });

        await expect(
            grantEntitlement({ userId: 'u-1', productId: 'p-1', invoiceId: 'inv-1' }, client)
        ).rejects.toThrow('[EntitlementService] Failed to grant entitlement: boom');
    });

    it('throws when the grant returns no data without an error', async () => {
        const { client } = clientReturning({ data: null, error: null });

        await expect(
            grantEntitlement({ userId: 'u-1', productId: 'p-1', invoiceId: 'inv-1' }, client)
        ).rejects.toThrow('Unknown error');
    });

    it('schedules revocation exactly 14 days in the future', async () => {
        const { client, builder } = clientReturning({ data: null, error: null });
        const before = Date.now();

        const { scheduledRevocationAt } = await scheduleEntitlementRevocation(
            { userId: 'u-1', productId: 'p-1', invoiceId: 'inv-1', reason: 'chargeback' },
            client
        );

        const deltaDays = (new Date(scheduledRevocationAt).getTime() - before) / (24 * 60 * 60 * 1000);
        expect(deltaDays).toBeGreaterThan(13.99);
        expect(deltaDays).toBeLessThan(14.01);
        expect(builder.update).toHaveBeenCalledWith(
            expect.objectContaining({
                metadata: expect.objectContaining({
                    gracePeriodDays: ENTITLEMENT_GRACE_PERIOD_DAYS,
                    reason: 'chargeback',
                }),
            })
        );
        expect(builder.eq).toHaveBeenCalledWith('user_id', 'u-1');
        expect(builder.eq).toHaveBeenCalledWith('product_id', 'p-1');
        expect(builder.eq).toHaveBeenCalledWith('invoice_id', 'inv-1');
    });

    it('throws when scheduling revocation fails', async () => {
        const { client } = clientReturning({ error: { message: 'schedule-fail' } });

        await expect(
            scheduleEntitlementRevocation({ userId: 'u-1', productId: 'p-1', invoiceId: 'inv-1' }, client)
        ).rejects.toThrow('Failed to schedule entitlement revocation: schedule-fail');
    });

    it('revokes entitlement and stamps revoked_at', async () => {
        const { client, builder } = clientReturning({ error: null });

        const result = await revokeEntitlement(
            { userId: 'u-1', productId: 'p-1', invoiceId: 'inv-1', reason: 'refund' },
            client
        );

        expect(result).toEqual({ success: true });
        expect(builder.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'revoked', revoked_at: expect.any(String) })
        );
    });

    it('throws when revoking entitlement fails', async () => {
        const { client } = clientReturning({ error: { message: 'revoke-fail' } });

        await expect(
            revokeEntitlement({ userId: 'u-1', productId: 'p-1', invoiceId: 'inv-1' }, client)
        ).rejects.toThrow('Failed to revoke entitlement: revoke-fail');
    });

    it('returns true when an active entitlement exists', async () => {
        const { client, builder } = clientReturning({ data: [{ id: 'ent-1', status: 'granted' }], error: null });

        await expect(checkUserEntitlement('u-1', 'p-1', client)).resolves.toBe(true);
        expect(builder.eq).toHaveBeenCalledWith('status', 'granted');
        expect(builder.limit).toHaveBeenCalledWith(1);
    });

    it('returns false when no active entitlement exists', async () => {
        const { client } = clientReturning({ data: [], error: null });
        await expect(checkUserEntitlement('u-1', 'p-1', client)).resolves.toBe(false);
    });

    it('fails closed (false) when the lookup errors', async () => {
        const { client } = clientReturning({ data: null, error: { message: 'db-down' } });
        await expect(checkUserEntitlement('u-1', 'p-1', client)).resolves.toBe(false);
    });
});
