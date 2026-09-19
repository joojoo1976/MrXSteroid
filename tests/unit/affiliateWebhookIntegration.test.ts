import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateCommission, calculateReversal } from '../../server/affiliate/commissionEngine';

process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            update: vi.fn().mockReturnThis(),
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
        rpc: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    })),
}));

describe('Affiliate Webhook Integration & Ledger Reversals', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('1. Commission Calculation Invariants in Webhook Flow', () => {
        it('calculates commission strictly on net product amount after discount, excluding shipping', () => {
            const invoice = {
                invoiceAmount: 600,
                productSubtotal: 500,
                discountAmount: 100, // net base = 400
                shippingCost: 100,   // shipping never earns commission
                monthlyPaidReferrals: 5, // Bronze tier: 25%
                customCommissionRate: null,
            };

            const result = calculateCommission(invoice);
            expect(result.commissionBase).toBe(400);
            expect(result.commissionRate).toBe(25);
            expect(result.commissionAmount).toBe(100.00);
            expect(result.tier).toBe('bronze');
        });

        it('tier transitions accurately at boundaries: 10th sale Bronze -> 11th sale Silver', () => {
            // 9 previous sales -> 10th sale is Bronze (25%)
            const sale10 = calculateCommission({
                invoiceAmount: 100,
                productSubtotal: 100,
                discountAmount: 0,
                shippingCost: 0,
                monthlyPaidReferrals: 9,
                customCommissionRate: null,
            });
            expect(sale10.tier).toBe('bronze');
            expect(sale10.commissionRate).toBe(25);

            // 10 previous sales -> 11th sale is Silver (35%)
            const sale11 = calculateCommission({
                invoiceAmount: 100,
                productSubtotal: 100,
                discountAmount: 0,
                shippingCost: 0,
                monthlyPaidReferrals: 10,
                customCommissionRate: null,
            });
            expect(sale11.tier).toBe('silver');
            expect(sale11.commissionRate).toBe(35);
        });

        it('tier transitions accurately: 50th sale Silver -> 51st sale Gold', () => {
            const sale50 = calculateCommission({
                invoiceAmount: 100,
                productSubtotal: 100,
                discountAmount: 0,
                shippingCost: 0,
                monthlyPaidReferrals: 49,
                customCommissionRate: null,
            });
            expect(sale50.tier).toBe('silver');
            expect(sale50.commissionRate).toBe(35);

            const sale51 = calculateCommission({
                invoiceAmount: 100,
                productSubtotal: 100,
                discountAmount: 0,
                shippingCost: 0,
                monthlyPaidReferrals: 50,
                customCommissionRate: null,
            });
            expect(sale51.tier).toBe('gold');
            expect(sale51.commissionRate).toBe(45);
        });

        it('custom commission override always takes precedence over monthly tier', () => {
            const result = calculateCommission({
                invoiceAmount: 100,
                productSubtotal: 100,
                discountAmount: 0,
                shippingCost: 0,
                monthlyPaidReferrals: 100, // would be Gold (45%)
                customCommissionRate: 50,  // custom 50%
            });
            expect(result.tier).toBe('custom');
            expect(result.commissionRate).toBe(50);
            expect(result.commissionAmount).toBe(50.00);
        });
    });

    describe('2. Refunds and Chargebacks Reversals', () => {
        it('calculates full refund reversal correctly', () => {
            const commission = 35.00;
            const invoiceTotal = 100.00;
            const refundAmount = 100.00;

            const reversal = calculateReversal(commission, refundAmount, invoiceTotal);
            expect(reversal).toBe(35.00);
        });

        it('calculates partial refund reversal proportionally', () => {
            const commission = 35.00;
            const invoiceTotal = 100.00;
            const partialRefund = 40.00; // 40% refunded

            const reversal = calculateReversal(commission, partialRefund, invoiceTotal);
            expect(reversal).toBe(14.00); // 35 * 0.40 = 14.00
        });

        it('handles chargeback as full commission clawback', () => {
            const commission = 45.00;
            const invoiceTotal = 100.00;

            const reversal = calculateReversal(commission, invoiceTotal, invoiceTotal);
            expect(reversal).toBe(45.00);
        });
    });

    describe('3. Idempotency & Failure Isolation Guarantees', () => {
        it('ensures commission triggering handles missing invoice gracefully without throwing', async () => {
            const { triggerAffiliateCommission } = await import('../../server/affiliate/ledgerService');
            await expect(triggerAffiliateCommission('non-existent-inv')).resolves.not.toThrow();
        });

        it('ensures reversal handles missing referral gracefully without throwing', async () => {
            const { reverseCommission } = await import('../../server/affiliate/ledgerService');
            await expect(reverseCommission('non-existent-inv', 'refund', 'Test reason')).resolves.not.toThrow();
        });
    });
});
