import { describe, it, expect } from 'vitest';
import { calculateOrderSplits, type SplitRule } from '../../server/payments/splitEngine';

describe('Split Engine Extended Stress & Complex Scenarios (v3.1)', () => {
    it('handles 5-way split with fractions: 17.5%, 22.5%, 15%, 25%, 20%', () => {
        const rules: SplitRule[] = [
            { id: '1', beneficiary_id: 'b1', share_type: 'percentage', share_value: 17.5, priority: 0 },
            { id: '2', beneficiary_id: 'b2', share_type: 'percentage', share_value: 22.5, priority: 0 },
            { id: '3', beneficiary_id: 'b3', share_type: 'percentage', share_value: 15.0, priority: 0 },
            { id: '4', beneficiary_id: 'b4', share_type: 'percentage', share_value: 25.0, priority: 0 },
            { id: '5', beneficiary_id: 'b5', share_type: 'percentage', share_value: 20.0, priority: 0 },
        ];

        const netAmounts = [1, 2, 3, 7, 13, 99, 101, 10001, 99999, 1000000];

        for (const net of netAmounts) {
            const splits = calculateOrderSplits({
                grossAmountMinor: net,
                gatewayFeeMinor: 0,
                rules,
                currency: 'EGP',
            });

            expect(splits).toHaveLength(5);
            const sum = splits.reduce((acc, s) => acc + s.allocatedAmountMinor, 0);
            expect(sum).toBe(net);
        }
    });

    it('cascades multiple fixed rules by priority before percentage rules', () => {
        const rules: SplitRule[] = [
            // Highest priority fixed fee: Platform fee 10.00 EGP (1000 piasters)
            { id: '1', beneficiary_id: 'platform', share_type: 'fixed', share_value: 1000, priority: 100 },
            // Second priority fixed fee: Coach fee 5.00 EGP (500 piasters)
            { id: '2', beneficiary_id: 'coach', share_type: 'fixed', share_value: 500, priority: 50 },
            // Percentage on remaining: 60% Author, 40% Partner
            { id: '3', beneficiary_id: 'author', share_type: 'percentage', share_value: 60, priority: 10 },
            { id: '4', beneficiary_id: 'partner', share_type: 'percentage', share_value: 40, priority: 10 },
        ];

        const splits = calculateOrderSplits({
            grossAmountMinor: 11500, // 115.00 EGP
            gatewayFeeMinor: 0,
            rules,
            currency: 'EGP',
        });

        // 11500 - 1000 - 500 = 10000 remainder
        // 60% of 10000 = 6000, 40% of 10000 = 4000
        expect(splits.find(s => s.beneficiaryId === 'platform')?.allocatedAmountMinor).toBe(1000);
        expect(splits.find(s => s.beneficiaryId === 'coach')?.allocatedAmountMinor).toBe(500);
        expect(splits.find(s => s.beneficiaryId === 'author')?.allocatedAmountMinor).toBe(6000);
        expect(splits.find(s => s.beneficiaryId === 'partner')?.allocatedAmountMinor).toBe(4000);

        const total = splits.reduce((acc, s) => acc + s.allocatedAmountMinor, 0);
        expect(total).toBe(11500);
    });

    it('allocates 100% cleanly to a single beneficiary without rounding errors', () => {
        const rules: SplitRule[] = [
            { id: '1', beneficiary_id: 'sole-beneficiary', share_type: 'percentage', share_value: 100, priority: 0 },
        ];

        const splits = calculateOrderSplits({
            grossAmountMinor: 4999,
            gatewayFeeMinor: 150,
            rules,
            currency: 'USD',
        });

        expect(splits).toHaveLength(1);
        expect(splits[0].allocatedAmountMinor).toBe(4849);
        expect(splits[0].netAmountMinor).toBe(4849);
    });

    it('fuzz testing: 100 random amounts strictly preserve sum(allocated) === netAmount invariant', () => {
        const rules: SplitRule[] = [
            { id: '1', beneficiary_id: 'b1', share_type: 'percentage', share_value: 33.333, priority: 0 },
            { id: '2', beneficiary_id: 'b2', share_type: 'percentage', share_value: 33.333, priority: 0 },
            { id: '3', beneficiary_id: 'b3', share_type: 'percentage', share_value: 33.334, priority: 0 },
        ];

        for (let i = 0; i < 100; i++) {
            const gross = Math.floor(Math.random() * 500000) + 1; // 1 to 500,000 piasters
            const fee = Math.floor(Math.random() * (gross / 2));
            const net = gross - fee;

            const splits = calculateOrderSplits({
                grossAmountMinor: gross,
                gatewayFeeMinor: fee,
                rules,
                currency: 'EGP',
            });

            const sum = splits.reduce((acc, s) => acc + s.allocatedAmountMinor, 0);
            expect(sum).toBe(net);
        }
    });

    it('returns empty splits if gateway fee exceeds or equals gross amount', () => {
        const rules: SplitRule[] = [
            { id: '1', beneficiary_id: 'b1', share_type: 'percentage', share_value: 100, priority: 0 },
        ];

        const splits = calculateOrderSplits({
            grossAmountMinor: 100,
            gatewayFeeMinor: 200, // Fee exceeds gross
            rules,
            currency: 'EGP',
        });

        expect(splits).toEqual([]);
    });
});
