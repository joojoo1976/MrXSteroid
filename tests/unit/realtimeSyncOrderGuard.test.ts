/**
 * RealtimeSyncService.syncOrderData — M1A guard tests.
 *
 * The order sync must be UPDATE-only (no INSERT → a new order can never be
 * created with NULL governance columns) and must never write/clear the
 * financial or governance columns (region, currency, payment_status, etc.).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSupabase } = vi.hoisted(() => ({
    mockSupabase: {
        from: vi.fn(),
    },
}));

vi.mock('../../shared/lib/supabase', () => ({
    supabase: mockSupabase,
}));

import { RealtimeSyncService } from '../../shared/lib/RealtimeSyncService';

let capturedUpdate: Record<string, unknown> | null = null;

beforeEach(() => {
    capturedUpdate = null;
    mockSupabase.from.mockReset();
    mockSupabase.from.mockImplementation((table: string) => {
        if (table !== 'orders') return {};
        return {
            update: vi.fn((payload: Record<string, unknown>) => {
                capturedUpdate = payload;
                return {
                    eq: vi.fn(() => ({
                        select: vi.fn(async () => ({ data: [{ id: 'ord-1', ...payload }], error: null })),
                    })),
                };
            }),
            upsert: vi.fn(() => {
                throw new Error('upsert must not be used by syncOrderData');
            }),
            insert: vi.fn(() => {
                throw new Error('insert must not be used by syncOrderData');
            }),
        };
    });
});

const service = new RealtimeSyncService();

describe('RealtimeSyncService.syncOrderData — M1A guard', () => {
    it('writes only allowlisted fields and ignores region/currency/payment_status/invoice_id/amount', async () => {
        await service.syncOrderData('ord-1', {
            status: 'processing',
            fullname: 'New Name',
            region: 'EG',
            currency: 'EGP',
            payment_status: 'paid',
            invoice_id: 'inv-1',
            idempotency_key: 'k-1',
            amount: 9999,
            external_provider: 'FOURTHWALL',
            external_order_id: 'fw-1',
            payment_method: 'instapay',
            source_channel: 'web_checkout',
            fulfillment_status: 'processing',
            payment_provider_merchant: 'MID-X',
            external_payment_reference: 'ref-1',
            external_sync_status: 'synced',
        });

        expect(capturedUpdate).toEqual({ status: 'processing', fullname: 'New Name' });
    });

    it('uses UPDATE (not upsert/insert), so a missing order row is a no-op, never a NULL-insert', async () => {
        await service.syncOrderData('ord-1', { status: 'processing' });
        expect(mockSupabase.from).toHaveBeenCalledWith('orders');
        // The mock has no usable insert/upsert — a upsert/insert call would throw.
        expect(capturedUpdate).toEqual({ status: 'processing' });
    });

    it('does not throw when the ORDER_SYNC_ALLOWLIST id key is included via sanitized data', async () => {
        await service.syncOrderData('ord-1', { id: 'ord-1', status: 'shipped' });
        expect(capturedUpdate).toEqual({ status: 'shipped' });
    });

    it('throws when every provided field is stripped', async () => {
        await expect(
            service.syncOrderData('ord-1', { region: 'EG', currency: 'EGP', amount: 100 })
        ).rejects.toThrow('No updatable order fields provided');
    });
});