import { describe, it, expect } from 'vitest';
import {
    validateJournalBalance,
    type JournalLineItem,
} from '../../server/payments/financialLedgerService';

describe('Financial Ledger Double-Entry Validation (G-11, G-12, N-4)', () => {
    it('validates perfectly balanced journal transactions (SUM(debits) === SUM(credits))', () => {
        const lines: JournalLineItem[] = [
            { account: 'CUSTOMER_FUNDS', entryType: 'DEBIT', amountMinor: 10000 },
            { account: 'BENEFICIARY_PAYABLE', entryType: 'CREDIT', amountMinor: 10000 },
        ];

        const balance = validateJournalBalance(lines);
        expect(balance.isBalanced).toBe(true);
        expect(balance.totalDebit).toBe(10000);
        expect(balance.totalCredit).toBe(10000);
    });

    it('rejects unbalanced journal entries (G-11 violation)', () => {
        const lines: JournalLineItem[] = [
            { account: 'CUSTOMER_FUNDS', entryType: 'DEBIT', amountMinor: 10000 },
            { account: 'BENEFICIARY_PAYABLE', entryType: 'CREDIT', amountMinor: 9700 },
        ];

        const balance = validateJournalBalance(lines);
        expect(balance.isBalanced).toBe(false);
        expect(balance.totalDebit).toBe(10000);
        expect(balance.totalCredit).toBe(9700);
    });

    it('rejects zero or negative amounts', () => {
        const lines: JournalLineItem[] = [
            { account: 'CUSTOMER_FUNDS', entryType: 'DEBIT', amountMinor: 0 },
            { account: 'BENEFICIARY_PAYABLE', entryType: 'CREDIT', amountMinor: 0 },
        ];

        expect(() => validateJournalBalance(lines)).toThrow(/positive integer minor unit/);
    });

    it('rejects floating point amounts', () => {
        const lines: JournalLineItem[] = [
            { account: 'CUSTOMER_FUNDS', entryType: 'DEBIT', amountMinor: 99.99 },
            { account: 'BENEFICIARY_PAYABLE', entryType: 'CREDIT', amountMinor: 99.99 },
        ];

        expect(() => validateJournalBalance(lines)).toThrow(/positive integer minor unit/);
    });

    it('rejects empty journal entry lines (G-12 violation)', () => {
        expect(() => validateJournalBalance([])).toThrow(/empty journal entry/);
    });
});
