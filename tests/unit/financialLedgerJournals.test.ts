import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    postJournalEntry,
    recordPaymentPostingJournal,
    recordPayoutExecutionJournal,
    recordRefundAllocationJournal,
} from '../../server/payments/financialLedgerService';

function captureClient() {
    let rows: any[] | null = null;
    let error: { message: string } | null = null;
    const insert = vi.fn(async (r: any[]) => {
        rows = r;
        return { error };
    });
    const client = { from: vi.fn(() => ({ insert })) } as unknown as SupabaseClient;
    return {
        client,
        insert,
        getRows: () => rows,
        setError: (e: { message: string } | null) => {
            error = e;
        },
    };
}

const balancedLines = [
    { account: 'CUSTOMER_FUNDS' as const, entryType: 'DEBIT' as const, amountMinor: 49900 },
    { account: 'BENEFICIARY_PAYABLE' as const, entryType: 'CREDIT' as const, amountMinor: 49900 },
];

describe('FinancialLedgerService â€” journal posting (N-3 / N-4)', () => {
    describe('postJournalEntry', () => {
        it('rejects unbalanced entries before touching the database (G-11)', async () => {
            const { client, insert } = captureClient();

            await expect(
                postJournalEntry(
                    {
                        currency: 'EGP',
                        eventType: 'PAYMENT_CAPTURED',
                        sourceId: 'src-1',
                        sourceEventType: 'kashier_transaction',
lines: [
                            { account: 'CUSTOMER_FUNDS', entryType: 'DEBIT', amountMinor: 100 },
                            { account: 'BENEFICIARY_PAYABLE', entryType: 'CREDIT', amountMinor: 99 },
                        ],
                    },
                    client
                )
            ).rejects.toThrow(/Unbalanced journal entry/);
            expect(insert).not.toHaveBeenCalled();
        });

        it('rejects a missing source identifier (G-12)', async () => {
            const { client } = captureClient();

            await expect(
                postJournalEntry(
                    { currency: 'EGP', eventType: 'PAYMENT_CAPTURED', sourceId: '', sourceEventType: 'x', lines: balancedLines },
                    client
                )
            ).rejects.toThrow(/Missing source event identifier/);
        });

        it('persists one row per line sharing a journal_entry_id and uppercased currency', async () => {
            const { client, getRows } = captureClient();

            const result = await postJournalEntry(
                {
                    paymentIntentId: 'pi-1',
                    invoiceId: 'inv-1',
                    currency: 'egp',
                    eventType: 'PAYMENT_CAPTURED',
                    sourceId: 'txn-1',
                    sourceEventType: 'kashier_transaction',
                    lines: balancedLines,
                },
                client
            );

            const rows = getRows()!;
            expect(result.entriesPosted).toBe(2);
            expect(result.totalDebitMinor).toBe(49900);
            expect(result.totalCreditMinor).toBe(49900);
            expect(new Set(rows.map((r) => r.journal_entry_id)).size).toBe(1);
            expect(rows.every((r) => r.currency === 'EGP')).toBe(true);
            expect(rows[0]).toEqual(
                expect.objectContaining({
                    payment_intent_id: 'pi-1',
                    invoice_id: 'inv-1',
                    event_type: 'PAYMENT_CAPTURED',
                    source_id: 'txn-1',
                    source_event_type: 'kashier_transaction',
                })
            );
        });

        it('surfaces persistence errors', async () => {
            const { client, setError } = captureClient();
            setError({ message: 'db-down' });

            await expect(
                postJournalEntry(
                    { currency: 'EGP', eventType: 'PAYMENT_CAPTURED', sourceId: 'src-1', sourceEventType: 'x', lines: balancedLines },
                    client
                )
            ).rejects.toThrow('Failed to persist journal entry: db-down');
        });
    });

describe('recordPaymentPostingJournal (Posting Matrix Â§6.3 single entry)', () => {
        it('posts the exact 85/10/5 single entry when a gateway fee is present', async () => {
            const { client, getRows } = captureClient();

            const result = await recordPaymentPostingJournal(
                {
                    paymentIntentId: 'pi-1',
                    invoiceId: 'inv-1',
                    grossAmountMinor: 49900,
                    gatewayFeeMinor: 1500,
                    currency: 'EGP',
                    transactionId: 'txn-1',
                    splits: [
                        { beneficiaryId: 'author-1', allocatedAmountMinor: 41140, account: 'BENEFICIARY_PAYABLE' },
                        { beneficiaryId: null, allocatedAmountMinor: 4840, account: 'PLATFORM_REVENUE' },
                        { beneficiaryId: 'reserve-1', allocatedAmountMinor: 2420, account: 'RESERVE' },
                    ],
                    supabaseClient: client,
                }
            );

            const rows = getRows()!;
            // Single journal entry, single event type, one row per line.
            expect(new Set(rows.map((r) => r.journal_entry_id)).size).toBe(1);
            expect(rows.every((r) => r.event_type === 'PAYMENT_CAPTURED')).toBe(true);
            expect(rows.map((r) => `${r.account}:${r.entry_type}`)).toEqual([
                'CUSTOMER_FUNDS:DEBIT',
                'BENEFICIARY_PAYABLE:CREDIT',
                'PLATFORM_REVENUE:CREDIT',
                'RESERVE:CREDIT',
                'GATEWAY_FEES:DEBIT',
                'CUSTOMER_FUNDS:CREDIT',
            ]);
            // Debits G + F == Credits (0.85+0.10+0.05)N + F  â†’ always balanced.
            expect(result.totalDebitMinor).toBe(49900);
            expect(result.totalCreditMinor).toBe(49900);

            // Platform split carries NO beneficiary (internal ledger account).
            const platformLine = rows.find((r) => r.account === 'PLATFORM_REVENUE')!;
            expect(platformLine.beneficiary_id).toBeNull();
            // Reserve split routes to RESERVE regardless of role.
            expect(rows.find((r) => r.account === 'RESERVE')!.beneficiary_id).toBe('reserve-1');
        });

        it('posts the split credits without a fee row when gatewayFeeMinor is 0', async () => {
            const { client, getRows } = captureClient();

            await recordPaymentPostingJournal(
                {
                    paymentIntentId: 'pi-2',
                    invoiceId: 'inv-2',
                    grossAmountMinor: 10000,
                    gatewayFeeMinor: 0,
                    currency: 'EGP',
                    transactionId: 'txn-2',
                    splits: [
                        { beneficiaryId: 'author-1', allocatedAmountMinor: 8500, account: 'BENEFICIARY_PAYABLE' },
                        { beneficiaryId: null, allocatedAmountMinor: 1000, account: 'PLATFORM_REVENUE' },
                        { beneficiaryId: 'reserve-1', allocatedAmountMinor: 500, account: 'RESERVE' },
                    ],
                    supabaseClient: client,
                }
            );

            const rows = getRows()!;
            expect(rows).toHaveLength(4);
            expect(rows.map((r) => `${r.account}:${r.entry_type}`)).toEqual([
                'CUSTOMER_FUNDS:DEBIT',
                'BENEFICIARY_PAYABLE:CREDIT',
                'PLATFORM_REVENUE:CREDIT',
                'RESERVE:CREDIT',
            ]);
        });
    });

    describe('recordPayoutExecutionJournal', () => {
        const base = {
            payoutId: 'po-1',
            beneficiaryId: 'ben-1',
            amountMinor: 10000,
            currency: 'EGP',
        };

        it('holds BENEFICIARY_PAYABLE into PAYOUT_CLEARING at PROCESSING', async () => {
            const { client, getRows } = captureClient();
            await recordPayoutExecutionJournal({ ...base, stage: 'PROCESSING', supabaseClient: client });

            const rows = getRows()!;
            expect(rows.map((r) => `${r.account}:${r.entry_type}`)).toEqual([
                'BENEFICIARY_PAYABLE:DEBIT',
                'PAYOUT_CLEARING:CREDIT',
            ]);
            expect(rows[0].event_type).toBe('PAYOUT_CREATED');
        });

        it('discharges PAYOUT_CLEARING to CUSTOMER_FUNDS at COMPLETED', async () => {
            const { client, getRows } = captureClient();
            await recordPayoutExecutionJournal({ ...base, stage: 'COMPLETED', supabaseClient: client });

            const rows = getRows()!;
            expect(rows.map((r) => `${r.account}:${r.entry_type}`)).toEqual([
                'PAYOUT_CLEARING:DEBIT',
                'CUSTOMER_FUNDS:CREDIT',
            ]);
            expect(rows[0].event_type).toBe('PAYOUT_COMPLETED');
        });

        it('restores BENEFICIARY_PAYABLE at REVERSED and links the original entry', async () => {
            const { client, getRows } = captureClient();
            await recordPayoutExecutionJournal({
                ...base,
                stage: 'REVERSED',
                originalJournalEntryId: 'je-orig',
                supabaseClient: client,
            });

            const rows = getRows()!;
            expect(rows.map((r) => `${r.account}:${r.entry_type}`)).toEqual([
                'PAYOUT_CLEARING:DEBIT',
                'BENEFICIARY_PAYABLE:CREDIT',
            ]);
            expect(rows[0].event_type).toBe('PAYOUT_REVERSED');
            expect(rows.every((r) => r.original_journal_entry_id === 'je-orig')).toBe(true);
        });
    });

    describe('recordRefundAllocationJournal', () => {
        it('posts a balanced REFUND_ALLOCATED entry against the refund liability', async () => {
            const { client, getRows } = captureClient();

            await recordRefundAllocationJournal(
                {
                    refundId: 'rf-1',
                    invoiceId: 'inv-1',
                    refundAmountMinor: 49900,
                    currency: 'EGP',
                    splitsReversals: [],
                    supabaseClient: client,
                }
            );

            const rows = getRows()!;
            expect(rows.map((r) => `${r.account}:${r.entry_type}`)).toEqual([
                'REFUND_LIABILITY:DEBIT',
                'CUSTOMER_FUNDS:CREDIT',
            ]);
            expect(rows[0].event_type).toBe('REFUND_ALLOCATED');
            expect(rows[0].source_id).toBe('rf-1');
        });
    });
});

