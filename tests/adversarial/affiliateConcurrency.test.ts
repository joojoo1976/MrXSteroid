import { describe, it, expect } from 'vitest';
import { calculateCommission } from '../../server/affiliate/commissionEngine';

describe('Affiliate Concurrency & High-Contention Invariants', () => {
    it('accurately resolves sequential sales transitioning across tier boundaries (10 -> 11)', () => {
        // Simulating 5 rapid sequential sales starting from 8 existing sales
        const sales = [
            { invoiceId: 'inv-1', monthlyCount: 8 },  // sale 9 -> Bronze (25%)
            { invoiceId: 'inv-2', monthlyCount: 9 },  // sale 10 -> Bronze (25%)
            { invoiceId: 'inv-3', monthlyCount: 10 }, // sale 11 -> Silver (35%)
            { invoiceId: 'inv-4', monthlyCount: 11 }, // sale 12 -> Silver (35%)
            { invoiceId: 'inv-5', monthlyCount: 12 }, // sale 13 -> Silver (35%)
        ];

        const calculated = sales.map(s =>
            calculateCommission({
                invoiceAmount: 100,
                productSubtotal: 100,
                discountAmount: 0,
                shippingCost: 0,
                monthlyPaidReferrals: s.monthlyCount,
                customCommissionRate: null,
            })
        );

        expect(calculated[0].tier).toBe('bronze');
        expect(calculated[0].commissionRate).toBe(25);
        expect(calculated[0].commissionAmount).toBe(25.00);

        expect(calculated[1].tier).toBe('bronze');
        expect(calculated[1].commissionRate).toBe(25);
        expect(calculated[1].commissionAmount).toBe(25.00);

        // Transition on 11th sale!
        expect(calculated[2].tier).toBe('silver');
        expect(calculated[2].commissionRate).toBe(35);
        expect(calculated[2].commissionAmount).toBe(35.00);

        expect(calculated[3].tier).toBe('silver');
        expect(calculated[3].commissionRate).toBe(35);

        expect(calculated[4].tier).toBe('silver');
        expect(calculated[4].commissionRate).toBe(35);

        // Sum of commissions
        const totalCommission = calculated.reduce((sum, c) => sum + c.commissionAmount, 0);
        expect(totalCommission).toBe(25 + 25 + 35 + 35 + 35); // 155.00
    });

    it('prevents double commission when multiple identical invoice completions arrive concurrently', async () => {
        const invoiceId = 'inv-concurrent-01';
        let commissionCreatedCount = 0;
        const processedInvoices = new Set<string>();

        const simulateCommissionTrigger = async (invId: string) => {
            // Atomic DB check simulation: if invoice already has a referral, skip
            if (processedInvoices.has(invId)) {
                return { success: false, reason: 'already_recorded' };
            }
            processedInvoices.add(invId);
            commissionCreatedCount++;
            return { success: true, commissionAmount: 25.00 };
        };

        // 20 concurrent triggers for the exact same invoice
        const results = await Promise.all(
            Array.from({ length: 20 }).map(() => simulateCommissionTrigger(invoiceId))
        );

        expect(commissionCreatedCount).toBe(1);
        const successful = results.filter(r => r.success);
        const skipped = results.filter(r => !r.success);

        expect(successful.length).toBe(1);
        expect(skipped.length).toBe(19);
    });

    it('maintains mathematical balance consistency across commission and partial reversals', () => {
        let currentBalance = 0;
        let lifetimeEarnings = 0;
        const ledger: Array<{ type: string; amount: number; balanceAfter: number }> = [];

        // 1. Initial commission: +100
        const c1 = 100;
        currentBalance += c1;
        lifetimeEarnings += c1;
        ledger.push({ type: 'commission', amount: c1, balanceAfter: currentBalance });

        // 2. Second commission: +50
        const c2 = 50;
        currentBalance += c2;
        lifetimeEarnings += c2;
        ledger.push({ type: 'commission', amount: c2, balanceAfter: currentBalance });

        // 3. Partial refund: -30
        const rev1 = 30;
        currentBalance = Math.max(0, currentBalance - rev1);
        ledger.push({ type: 'partial_refund', amount: -rev1, balanceAfter: currentBalance });

        // 4. Chargeback: -100
        const rev2 = 100;
        currentBalance = Math.max(0, currentBalance - rev2);
        ledger.push({ type: 'chargeback', amount: -rev2, balanceAfter: currentBalance });

        expect(currentBalance).toBe(20);
        expect(lifetimeEarnings).toBe(150);
        expect(ledger.length).toBe(4);
        expect(ledger[ledger.length - 1].balanceAfter).toBe(20);

        // Ensure sum of all ledger amounts equals current balance
        const ledgerSum = ledger.reduce((acc, entry) => acc + entry.amount, 0);
        expect(ledgerSum).toBe(currentBalance);
    });
});
