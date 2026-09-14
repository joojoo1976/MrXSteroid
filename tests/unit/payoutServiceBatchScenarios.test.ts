import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutService } from '../../server/payments/payoutService';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('PayoutService Batch Scenarios & Mixed Results (v3.1)', () => {
    let mockSupabase: any;

    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        mockSupabase = {
            from: vi.fn(),
        };
    });

    it('processes a mixed batch where some succeed and some fail gracefully without throwing', async () => {
        const payouts = {
            'payout-ok-1': { id: 'payout-ok-1', amount_minor: 5000, currency: 'EGP', payout_method: 'mobile_wallet', status: 'queued' },
            'payout-ok-2': { id: 'payout-ok-2', amount_minor: 7000, currency: 'EGP', payout_method: 'bank_account', status: 'queued' },
            'payout-fail-3': { id: 'payout-fail-3', amount_minor: 3000, currency: 'EGP', payout_method: 'card', status: 'processing' }, // Not queued!
        };

        const updateMock = vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
        });

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'payouts') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockImplementation((col: string, id: string) => ({
                            single: vi.fn().mockResolvedValue({
                                data: (payouts as Record<string, any>)[id] || null,
                                error: null,
                            }),
                        })),
                    }),
                    update: updateMock,
                };
            }
            if (table === 'order_splits') {
                return {
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null }),
                    }),
                };
            }
            return {};
        });

        const service = new PayoutService(mockSupabase as unknown as SupabaseClient);
        const summary = await service.approveBatchPayouts(
            ['payout-ok-1', 'payout-ok-2', 'payout-fail-3'],
            'admin-lead'
        );

        // 2 succeeded, 1 failed because status was already processing
        expect(summary.approvedCount).toBe(2);
        expect(summary.failedCount).toBe(1);
        expect(summary.totalAmountMinor).toBe(12000); // 5000 + 7000
        expect(summary.payoutIds).toContain('payout-ok-1');
        expect(summary.payoutIds).toContain('payout-ok-2');
        expect(summary.errors).toHaveLength(1);
        expect(summary.errors[0]).toContain('not in \'queued\' state');
    });

    it('returns empty summary when empty array is passed', async () => {
        const service = new PayoutService(mockSupabase as unknown as SupabaseClient);
        const summary = await service.approveBatchPayouts([], 'admin-lead');

        expect(summary.approvedCount).toBe(0);
        expect(summary.failedCount).toBe(0);
        expect(summary.totalAmountMinor).toBe(0);
    });

    it('records error when a payout id is not found in database', async () => {
        mockSupabase.from.mockImplementation(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                }),
            }),
        }));

        const service = new PayoutService(mockSupabase as unknown as SupabaseClient);
        const summary = await service.approveBatchPayouts(['missing-id'], 'admin-lead');

        expect(summary.approvedCount).toBe(0);
        expect(summary.failedCount).toBe(1);
        expect(summary.errors[0]).toContain('missing-id not found');
    });
});
