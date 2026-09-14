import { describe, it, expect } from 'vitest';
import { calculateOrderSplits, type SplitRule } from '../../server/payments/splitEngine';

describe('Revenue Split Core Engine (v3.1)', () => {
    describe('Largest-Remainder (Hare-Niemeyer) Algorithm & Invariants', () => {
        it('guarantees sum(allocated) === netAmount with fractional percentages (33.33%, 33.33%, 33.34%)', () => {
            const rules: SplitRule[] = [
                { id: '1', beneficiary_id: 'ben-author', share_type: 'percentage', share_value: 33.33, priority: 0 },
                { id: '2', beneficiary_id: 'ben-platform', share_type: 'percentage', share_value: 33.33, priority: 0 },
                { id: '3', beneficiary_id: 'ben-coach', share_type: 'percentage', share_value: 33.34, priority: 0 },
            ];

            const testAmounts = [10001, 10000, 9999, 100, 1, 333333];

            for (const amount of testAmounts) {
                const splits = calculateOrderSplits({
                    grossAmountMinor: amount,
                    gatewayFeeMinor: 0,
                    rules,
                    currency: 'EGP',
                });

                const totalAllocated = splits.reduce((s, r) => s + r.allocatedAmountMinor, 0);
                expect(totalAllocated).toBe(amount);
            }
        });

        it('splits cleanly on standard 70% / 30% without loss', () => {
            const rules: SplitRule[] = [
                { id: '1', beneficiary_id: 'ben-author', share_type: 'percentage', share_value: 70, priority: 0 },
                { id: '2', beneficiary_id: 'ben-platform', share_type: 'percentage', share_value: 30, priority: 0 },
            ];

            const splits = calculateOrderSplits({
                grossAmountMinor: 10000, // 100.00 EGP
                gatewayFeeMinor: 300,    // 3.00 EGP gateway fee
                rules,
                currency: 'EGP',
            });

            // net = 9700
            // 70% of 9700 = 6790
            // 30% of 9700 = 2910
            expect(splits[0].allocatedAmountMinor).toBe(6790);
            expect(splits[1].allocatedAmountMinor).toBe(2910);
            expect(splits[0].allocatedAmountMinor + splits[1].allocatedAmountMinor).toBe(9700);
        });

        it('executes fixed rules first by priority, then distributes remainder by percentage', () => {
            const rules: SplitRule[] = [
                // Fixed charge of 15.00 EGP (1500 piasters) priority 10
                { id: '1', beneficiary_id: 'ben-host', share_type: 'fixed', share_value: 1500, priority: 10 },
                // Remaining split 80% / 20%
                { id: '2', beneficiary_id: 'ben-author', share_type: 'percentage', share_value: 80, priority: 0 },
                { id: '3', beneficiary_id: 'ben-platform', share_type: 'percentage', share_value: 20, priority: 0 },
            ];

            const splits = calculateOrderSplits({
                grossAmountMinor: 11500, // 115.00 EGP
                gatewayFeeMinor: 0,
                rules,
                currency: 'EGP',
            });

            // Fixed allocated: 1500
            // Remainder: 10000 -> 80% = 8000, 20% = 2000
            const hostSplit = splits.find(s => s.beneficiaryId === 'ben-host');
            const authorSplit = splits.find(s => s.beneficiaryId === 'ben-author');
            const platformSplit = splits.find(s => s.beneficiaryId === 'ben-platform');

            expect(hostSplit?.allocatedAmountMinor).toBe(1500);
            expect(authorSplit?.allocatedAmountMinor).toBe(8000);
            expect(platformSplit?.allocatedAmountMinor).toBe(2000);

            const total = splits.reduce((sum, s) => sum + s.allocatedAmountMinor, 0);
            expect(total).toBe(11500);
        });

        it('caps fixed rules safely if gross - fee is less than fixed amount', () => {
            const rules: SplitRule[] = [
                { id: '1', beneficiary_id: 'ben-host', share_type: 'fixed', share_value: 5000, priority: 10 },
            ];

            const splits = calculateOrderSplits({
                grossAmountMinor: 3000,
                gatewayFeeMinor: 500,
                rules,
                currency: 'EGP',
            });

            // net = 2500, fixed capped at 2500
            expect(splits[0].allocatedAmountMinor).toBe(2500);
        });

        it('handles net amount of zero gracefully', () => {
            const rules: SplitRule[] = [
                { id: '1', beneficiary_id: 'ben-author', share_type: 'percentage', share_value: 100, priority: 0 },
            ];

            const splits = calculateOrderSplits({
                grossAmountMinor: 500,
                gatewayFeeMinor: 500,
                rules,
                currency: 'EGP',
            });

            expect(splits).toEqual([]);
        });

        it('throws if amounts are negative', () => {
            expect(() =>
                calculateOrderSplits({
                    grossAmountMinor: -100,
                    gatewayFeeMinor: 0,
                    rules: [],
                    currency: 'EGP',
                })
            ).toThrow();
        });
    });
});
