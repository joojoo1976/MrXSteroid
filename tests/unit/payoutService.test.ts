import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutService } from '../../server/payments/payoutService';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('PayoutService (v3.1)', () => {
    let mockSupabase: any;

    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        mockSupabase = {
            from: vi.fn(),
        };
    });

    it('queues a payout successfully with status queued', async () => {
        const insertMock = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'payout-123' }, error: null }),
            }),
        });
        mockSupabase.from.mockReturnValue({ insert: insertMock });

        const service = new PayoutService(mockSupabase as unknown as SupabaseClient);
        const payoutId = await service.queuePayoutForBeneficiary({
            beneficiaryId: 'ben-1',
            amountMinor: 5000,
            currency: 'EGP',
            payoutMethod: 'mobile_wallet',
        });

        expect(payoutId).toBe('payout-123');
        expect(insertMock).toHaveBeenCalledWith(
            expect.objectContaining({
                beneficiary_id: 'ben-1',
                amount_minor: 5000,
                status: 'queued',
            })
        );
    });

    it('requires admin user authentication for approveBatchPayouts', async () => {
        const service = new PayoutService(mockSupabase as unknown as SupabaseClient);
        await expect(service.approveBatchPayouts(['payout-1'], '')).rejects.toThrow(
            'Admin user authentication required'
        );
    });

    it('approves queued batch payouts and marks them completed in test mode', async () => {
        const mockPayout = {
            id: 'payout-1',
            beneficiary_id: 'ben-1',
            amount_minor: 10000,
            currency: 'EGP',
            payout_method: 'mobile_wallet',
            status: 'queued',
            beneficiary: { payout_details: { wallet: '01012345678' } },
        };

        const selectMock = vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockPayout, error: null }),
            }),
        });

        const updateMock = vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
        });

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'payouts') {
                return {
                    select: selectMock,
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
        const summary = await service.approveBatchPayouts(['payout-1'], 'admin-user-id');

        expect(summary.approvedCount).toBe(1);
        expect(summary.totalAmountMinor).toBe(10000);
        expect(summary.currency).toBe('EGP');
        expect(summary.payoutIds).toContain('payout-1');
    });
});
