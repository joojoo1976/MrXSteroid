/**
 * tests/unit/paymentInvariantEdgeCases.test.ts
 *
 * Additional unit coverage for double-entry ledger invariants and the revenue
 * split engine's guard rails that the existing suites do not assert.
 */
import { describe, it, expect } from 'vitest';
import {
    validateJournalBalance,
    type JournalLineItem,
} from '../../server/payments/financialLedgerService';
import { calculateOrderSplits, type SplitRule } from '../../server/payments/splitEngine';

describe('Financial Ledger — extended invariants (G-11, G-12)', () => {
    it('validates a 4-line journal with a gateway fee', () => {
        const lines: JournalLineItem[] = [
            { account: 'CUSTOMER_FUNDS', entryType: 'DEBIT', amountMinor: 10000 },
            { account: 'SALES_CLEARING', entryType: 'CREDIT', amountMinor: 10000 },
            { account: 'GATEWAY_FEES', entryType: 'DEBIT', amountMinor: 300 },
            { account: 'CUSTOMER_FUNDS', entryType: 'CREDIT', amountMinor: 300 },
        ];
        const balance = validateJournalBalance(lines);
        expect(balance.totalDebit).toBe(10300);
        expect(balance.totalCredit).toBe(10300);
        expect(balance.isBalanced).toBe(true);
    });

    it('rejects negative amounts', () => {
        const lines: JournalLineItem[] = [
            { account: 'CUSTOMER_FUNDS', entryType: 'DEBIT', amountMinor: -100 },
            { account: 'SALES_CLEARING', entryType: 'CREDIT', amountMinor: -100 },
        ];
        expect(() => validateJournalBalance(lines)).toThrow(/positive integer minor unit/);
    });

    it('rejects NaN amounts', () => {
        const lines: JournalLineItem[] = [
            { account: 'CUSTOMER_FUNDS', entryType: 'DEBIT', amountMinor: Number.NaN },
            { account: 'SALES_CLEARING', entryType: 'CREDIT', amountMinor: 100 },
        ];
        expect(() => validateJournalBalance(lines)).toThrow(/positive integer minor unit/);
    });

    it('rejects an invalid entry type', () => {
        const lines = [
            { account: 'CUSTOMER_FUNDS', entryType: 'DEBIT', amountMinor: 100 },
            { account: 'SALES_CLEARING', entryType: 'SIDE' as unknown as 'CREDIT', amountMinor: 100 },
        ] as JournalLineItem[];
        expect(() => validateJournalBalance(lines)).toThrow(/Invalid entryType/);
    });
});

describe('Split Engine — extended guard rails', () => {
    const percentRules = (): SplitRule[] => [
        { id: '1', beneficiary_id: 'author', share_type: 'percentage', share_value: 85, priority: 0 },
        { id: '2', beneficiary_id: 'platform', share_type: 'percentage', share_value: 10, priority: 0 },
        { id: '3', beneficiary_id: 'reserve', share_type: 'percentage', share_value: 5, priority: 0 },
    ];

    it('excludes rules flagged is_active=false', () => {
        const rules: SplitRule[] = [
            ...percentRules(),
            { id: '4', beneficiary_id: 'ghost', share_type: 'percentage', share_value: 50, priority: 0, is_active: false },
        ];
        const splits = calculateOrderSplits({ grossAmountMinor: 10000, gatewayFeeMinor: 0, rules, currency: 'EGP' });
        expect(splits.map(s => s.beneficiaryId).sort()).toEqual(['author', 'platform', 'reserve']);
        expect(splits.reduce((s, r) => s + r.allocatedAmountMinor, 0)).toBe(10000);
    });

    it('returns no splits when every rule is inactive', () => {
        const rules: SplitRule[] = [
            { id: '1', beneficiary_id: 'author', share_type: 'percentage', share_value: 100, priority: 0, is_active: false },
        ];
        expect(calculateOrderSplits({ grossAmountMinor: 10000, gatewayFeeMinor: 0, rules, currency: 'EGP' })).toEqual([]);
    });

    it('throws when percentage rules sum to zero but net amount remains', () => {
        const rules: SplitRule[] = [
            { id: '1', beneficiary_id: 'author', share_type: 'percentage', share_value: 0, priority: 0 },
        ];
        expect(() => calculateOrderSplits({ grossAmountMinor: 10000, gatewayFeeMinor: 0, rules, currency: 'EGP' }))
            .toThrow(/greater than 0/);
    });

    it('throws when the gateway fee is negative', () => {
        expect(() => calculateOrderSplits({ grossAmountMinor: 10000, gatewayFeeMinor: -1, rules: percentRules(), currency: 'EGP' }))
            .toThrow(/negative/);
    });

    it('orders fixed rules by descending priority before allocating the remainder', () => {
        const rules: SplitRule[] = [
            { id: 'low', beneficiary_id: 'low', share_type: 'fixed', share_value: 100, priority: 1 },
            { id: 'high', beneficiary_id: 'high', share_type: 'fixed', share_value: 200, priority: 9 },
            { id: 'rest', beneficiary_id: 'rest', share_type: 'percentage', share_value: 100, priority: 0 },
        ];
        const splits = calculateOrderSplits({ grossAmountMinor: 1000, gatewayFeeMinor: 0, rules, currency: 'EGP' });
        expect(splits[0].beneficiaryId).toBe('high');
        expect(splits[1].beneficiaryId).toBe('low');
        expect(splits.find(s => s.beneficiaryId === 'rest')?.allocatedAmountMinor).toBe(700);
    });

    it('propagates gross/fee/net/currency onto every allocation', () => {
        const splits = calculateOrderSplits({ grossAmountMinor: 5000, gatewayFeeMinor: 500, rules: percentRules(), currency: 'USD' });
        for (const s of splits) {
            expect(s.grossAmountMinor).toBe(5000);
            expect(s.gatewayFeeMinor).toBe(500);
            expect(s.netAmountMinor).toBe(4500);
            expect(s.currency).toBe('USD');
        }
    });
});
