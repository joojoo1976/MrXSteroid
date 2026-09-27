import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutService } from '../../server/payments/payoutService';
import { PayoutBlockedError, PAYOUT_GATE_KEYS } from '../../server/payments/payoutGates';
import type { SupabaseClient } from '@supabase/supabase-js';

const confirmedGates = () => [
    { gate_key: 'C_2', confirmed: true },
    { gate_key: 'D_8', confirmed: true },
    { gate_key: 'LIVE_ACTIVATION', confirmed: true },
];

const unconfirmedGates = () => [
    { gate_key: 'C_2', confirmed: false },
    { gate_key: 'D_8', confirmed: false },
    { gate_key: 'LIVE_ACTIVATION', confirmed: false },
];

describe('PayoutService (v3.1 — Affiliate / Ledger / Payout Expansion)', () => {
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

    it('rejects the whole batch with PayoutBlockedError while any gate is unconfirmed — zero record writes', async () => {
        const payoutsUpdateSpy = vi.fn();

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'payout_gates') {
                return {
                    select: vi.fn().mockResolvedValue({ data: unconfirmedGates(), error: null }),
                };
            }
            return {
                select: vi.fn(),
                update: payoutsUpdateSpy,
            };
        });

        const service = new PayoutService(mockSupabase as unknown as SupabaseClient);
        await expect(
            service.approveBatchPayouts(['payout-1', 'payout-2'], 'admin-user-id', 'key-batch')
        ).rejects.toBeInstanceOf(PayoutBlockedError);

        await service.approveBatchPayouts(['payout-1'], 'admin-user-id', 'key-batch').catch((err) => {
            expect(err).toBeInstanceOf(PayoutBlockedError);
            expect(err.code).toBe('PAYOUT_BLOCKED');
            expect(err.blockedGates).toEqual([...PAYOUT_GATE_KEYS]);
        });

        // No payout was fetched or updated: ZERO external effects.
        expect(payoutsUpdateSpy).not.toHaveBeenCalled();
    });

    it('approves queued batch payouts when all gates are cleared — approval only, never a transfer', async () => {
        const mockPayout = {
            id: 'payout-1',
            beneficiary_id: 'ben-1',
            amount_minor: 10000,
            currency: 'EGP',
            payout_method: 'mobile_wallet',
            status: 'queued',
            admin_approved: false,
            beneficiary: { is_active: true, role: 'author', payout_details: { wallet: '01012345678' } },
        };

        const selectMock = vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockPayout, error: null }),
            }),
        });

        const payoutsUpdateMock = vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
        });

        const splitsUpdateMock = vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
        });

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'payout_gates') {
                return {
                    select: vi.fn().mockResolvedValue({ data: confirmedGates(), error: null }),
                };
            }
            if (table === 'payouts') {
                return { select: selectMock, update: payoutsUpdateMock };
            }
            if (table === 'order_splits') {
                return { update: splitsUpdateMock };
            }
            return {};
        });

        const service = new PayoutService(mockSupabase as unknown as SupabaseClient);
        const summary = await service.approveBatchPayouts(['payout-1'], 'admin-user-id', 'key-batch');

        expect(summary.approvedCount).toBe(1);
        expect(summary.totalAmountMinor).toBe(10000);
        expect(summary.currency).toBe('EGP');
        expect(summary.payoutIds).toContain('payout-1');

        // Approval recorded, state REMAINS 'queued' — no processing/transfer.
        expect(payoutsUpdateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'queued',
                admin_approved: true,
                approved_by: 'admin-user-id',
                approval_batch_id: 'key-batch',
            })
        );
        // Linked splits promoted to 'approved'.
        expect(splitsUpdateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'approved',
                admin_approved: true,
                approval_batch_id: 'key-batch',
            })
        );
    });

    it('getPayoutGates reports machine-readable blocked gates when unconfirmed', async () => {
        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'payout_gates') {
                return {
                    select: vi.fn().mockResolvedValue({ data: unconfirmedGates(), error: null }),
                };
            }
            return {};
        });

        const service = new PayoutService(mockSupabase as unknown as SupabaseClient);
        const evaluation = await service.getPayoutGates();

        expect(evaluation.cleared).toBe(false);
        expect(evaluation.blocked).toEqual([...PAYOUT_GATE_KEYS]);
    });
});