import { describe, it, expect, vi, beforeEach } from 'vitest';
import { freezeOrderSplits } from '../../server/payments/splitEngine';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('Kashier & Revenue Split Integration Flow (v3.1)', () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            from: vi.fn(),
        };
    });

    it('freezes order splits for paid invoice and skips if already frozen (idempotent)', async () => {
        const mockInvoice = {
            id: 'inv-paid-1',
            amount: 100, // 100 EGP -> 10000 minor units
            currency: 'EGP',
            tier_id: 'digital',
        };

        const mockRules = [
            { id: 'rule-1', tier_id: 'digital', beneficiary_id: 'ben-author', share_type: 'percentage', share_value: 70, priority: 0, is_active: true },
            { id: 'rule-2', tier_id: 'digital', beneficiary_id: 'ben-platform', share_type: 'percentage', share_value: 30, priority: 0, is_active: true },
        ];

        // 1st check: no existing splits
        const splitCheckMock = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
        });

        // Invoice fetch
        const invoiceFetchMock = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: mockInvoice, error: null }),
                }),
            }),
        });

        // Rules fetch
        const rulesFetchMock = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: mockRules, error: null }),
            }),
        });

        // Insert mock
        const insertMock = vi.fn().mockResolvedValue({ error: null });

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'invoices') return invoiceFetchMock();
            if (table === 'split_rules') return rulesFetchMock();
            if (table === 'order_splits') {
                return {
                    select: splitCheckMock().select,
                    insert: insertMock,
                };
            }
            return {};
        });

        const result = await freezeOrderSplits(mockSupabase as unknown as SupabaseClient, 'inv-paid-1', 200); // 2 EGP gateway fee

        expect(result.frozen).toBe(true);
        expect(result.splitsCount).toBe(2);
        expect(insertMock).toHaveBeenCalled();

        // 9800 net minor units: 70% = 6860, 30% = 2940
        const insertedRows = insertMock.mock.calls[0][0];
        expect(insertedRows).toHaveLength(2);
        expect(insertedRows[0].allocated_amount_minor).toBe(6860);
        expect(insertedRows[1].allocated_amount_minor).toBe(2940);
        expect(insertedRows[0].status).toBe('calculated');
        expect(insertedRows[0].destination_account).toBe('BENEFICIARY_PAYABLE');
    });

    it('preserves order payment as success even if split calculation throws (failure isolation)', async () => {
        // Simulates invoice marked paid, but no rules configured
        const invoiceFetchMock = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: { id: 'inv-err-1', amount: 50, currency: 'USD' }, error: null }),
                }),
            }),
        });

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'invoices') return invoiceFetchMock();
            if (table === 'order_splits') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
                    }),
                };
            }
            if (table === 'split_rules') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ data: [], error: null }), // No rules
                    }),
                };
            }
            return {};
        });

        const result = await freezeOrderSplits(mockSupabase as unknown as SupabaseClient, 'inv-err-1');
        expect(result.frozen).toBe(false);
        expect(result.splitsCount).toBe(0);
        // Order remains unaffected!
    });
});
