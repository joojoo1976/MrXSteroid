import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    postJournalEntry,
    recordPaymentCaptureJournal,
    recordSplitAllocationJournal,
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
    { account: 'SALES_CLEARING' as const, entryType: 'CREDIT' as const, amountMinor: 49900 },
];

describe('FinancialLedgerService — journal posting (N-3 / N-4)', () => {
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
                            { account: 'SALES_CLEARING', entryType: 'CREDIT', amountMinor: 99 },
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

    describe('recordPaymentCaptureJournal', () => {
        it('posts gross only when there is no gateway fee', async () => {
            const { client, getRows } = captureClient();

            await recordPaymentCaptureJournal(
                {
                    paymentIntentId: 'pi-1',
                    invoiceId: 'inv-1',
                    grossAmountMinor: 49900,
                    gatewayFeeMinor: 0,
                    currency: 'EGP',
                    transactionId: 'txn-1',
                    supabaseClient: client,
                }
            );

            const rows = getRows()!;
            expect(rows).toHaveLength(2);
            expect(rows.map((r) => r.account)).toEqual(['CUSTOMER_FUNDS', 'SALES_CLEARING']);
        });

        it('adds gateway-fee lines when a fee is present', async () => {
            const { client, getRows } = captureClient();

            await recordPaymentCaptureJournal(
                {
                    paymentIntentId: 'pi-1',
                    invoiceId: 'inv-1',
                    grossAmountMinor: 49900,
                    gatewayFeeMinor: 1500,
                    currency: 'EGP',
                    transactionId: 'txn-1',
                    supabaseClient: client,
                }
            );

            const rows = getRows()!;
            expect(rows).toHaveLength(4);
            expect(rows.map((r) => `${r.account}:${r.entry_type}`)).toEqual([
                'CUSTOMER_FUNDS:DEBIT',
                'SALES_CLEARING:CREDIT',
                'GATEWAY_FEES:DEBIT',
                'CUSTOMER_FUNDS:CREDIT',
            ]);
        });
    });

    describe('recordSplitAllocationJournal', () => {
        it('routes platform share to PLATFORM_REVENUE and others to BENEFICIARY_PAYABLE', async () => {
            const { client, getRows } = captureClient();

            await recordSplitAllocationJournal(
                {
                    paymentIntentId: 'pi-1',
                    invoiceId: 'inv-1',
                    netAmountMinor: 48400,
                    currency: 'EGP',
                    splits: [
                        { beneficiaryId: 'author-1', allocatedAmountMinor: 41140, role: 'author' },
                        { beneficiaryId: 'platform-1', allocatedAmountMinor: 4840, role: 'platform' },
                        { beneficiaryId: 'reserve-1', allocatedAmountMinor: 2420, role: 'reserve' },
                    ],
                    supabaseClient: client,
                }
            );

            const rows = getRows()!;
            expect(rows[0]).toEqual(
                expect.objectContaining({ account: 'SALES_CLEARING', entry_type: 'DEBIT', amount_minor: 48400 })
            );
            const credits = rows.filter((r) => r.entry_type === 'CREDIT');
            expect(credits).toHaveLength(3);
            expect(credits.find((r) => r.beneficiary_id === 'platform-1')!.account).toBe('PLATFORM_REVENUE');
            expect(credits.find((r) => r.beneficiary_id === 'author-1')!.account).toBe('BENEFICIARY_PAYABLE');
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

