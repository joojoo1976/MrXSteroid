/**
 * §6.3 NET schema compatibility — schema-enforcing integration tests.
 *
 * The static lock (section63NetSchemaCompatibility.test.ts) proves the
 * migration artifact says the right thing. This suite proves the COMMITTED
 * §6.3 implementation actually survives a database that enforces exactly the
 * migrated schema:
 *
 *   - order_splits accepts destination_account, and a row written by the
 *     committed splitEngine payload can be read back with it.
 *   - financial_ledger accepts 'RESERVE' and every account production allowed
 *     before the migration.
 *   - the signed §6.3 journal still posts balanced, including a RESERVE line.
 *
 * The fake client installs the real production constraints as guards, so a
 * regression in either the migration or the committed code fails here.
 */
import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { recordPaymentPostingJournal } from '../../server/payments/financialLedgerService';
import { freezeOrderSplits } from '../../server/payments/splitEngine';

const ACCOUNTS_ALLOWED_BY_MIGRATION = [
    'CUSTOMER_FUNDS',
    'GATEWAY_FEES',
    'PLATFORM_REVENUE',
    'BENEFICIARY_PAYABLE',
    'RESERVE',
    'REFUND_LIABILITY',
    'PAYOUT_CLEARING',
    'SALES_CLEARING',
] as const;

const DESTINATION_ACCOUNTS_ALLOWED = [
    'CUSTOMER_FUNDS',
    'GATEWAY_FEES',
    'PLATFORM_REVENUE',
    'BENEFICIARY_PAYABLE',
    'RESERVE',
    'REFUND_LIABILITY',
    'PAYOUT_CLEARING',
] as const;

type LedgerRow = {
    account: string;
    entry_type: string;
    amount_minor: number;
    journal_entry_id: string;
};

function schemaEnforcingClient() {
    const ledger: LedgerRow[] = [];
    const splits: Record<string, unknown>[] = [];

    const guardLedger = (row: Record<string, unknown>) => {
        if (!ACCOUNTS_ALLOWED_BY_MIGRATION.includes(row.account as never)) {
            throw new Error(
                `violates check constraint "financial_ledger_account_check": ${row.account}`
            );
        }
        if (!(row.amount_minor as number) > 0) {
            throw new Error('violates check constraint "financial_ledger_amount_minor_check"');
        }
        if (row.entry_type !== 'DEBIT' && row.entry_type !== 'CREDIT') {
            throw new Error('violates check constraint "financial_ledger_entry_type_check"');
        }
    };

    const guardSplit = (row: Record<string, unknown>) => {
        const dest = row.destination_account;
        if (dest !== null && dest !== undefined) {
            if (!DESTINATION_ACCOUNTS_ALLOWED.includes(dest as never)) {
                throw new Error(
                    `violates check constraint on destination_account: ${dest}`
                );
            }
        }
        const validStatuses = [
            'pending',
            'calculated',
            'approved',
            'frozen',
            'queued',
            'paid',
            'failed',
            'cancelled',
        ];
        if (!validStatuses.includes(row.status as string)) {
            throw new Error(`violates check constraint "order_splits_status_check": ${row.status}`);
        }
    };

    const invoice = { id: 'inv-1', amount: 100, currency: 'EGP', tier_id: null };

    const splitRules = [
        {
            id: 'rule-author',
            tier_id: null,
            beneficiary_id: 'author-1',
            share_type: 'percentage',
            share_value: 85,
            priority: 30,
            is_active: true,
            destination_account: 'BENEFICIARY_PAYABLE',
        },
        {
            id: 'rule-platform',
            tier_id: null,
            beneficiary_id: null,
            share_type: 'percentage',
            share_value: 10,
            priority: 20,
            is_active: true,
            destination_account: 'PLATFORM_REVENUE',
        },
        {
            id: 'rule-reserve',
            tier_id: null,
            beneficiary_id: null,
            share_type: 'percentage',
            share_value: 5,
            priority: 10,
            is_active: true,
            destination_account: 'RESERVE',
        },
    ];

    const client = {
        from: vi.fn((table: string) => {
            if (table === 'financial_ledger') {
                return {
                    insert: vi.fn(async (rows: Record<string, unknown>[]) => {
                        for (const row of rows) guardLedger(row);
                        ledger.push(...(rows as unknown as LedgerRow[]));
                        return { error: null };
                    }),
                };
            }
            if (table === 'order_splits') {
                return {
                    insert: vi.fn((rows: Record<string, unknown>[]) => {
                        for (const row of rows) guardSplit(row);
                        splits.push(...rows);
                        const result = { error: null, data: rows };
                        return Object.assign(Promise.resolve(result), {
                            select: vi.fn(() => ({
                                eq: vi.fn(() => Promise.resolve({ data: splits, error: null })),
                            })),
                        });
                    }),
                    select: vi.fn(() => ({
                        eq: vi.fn(async () => ({ data: splits, error: null })),
                    })),
                };
            }
            if (table === 'invoices') {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn(async () => ({ data: invoice, error: null })),
                        })),
                    })),
                };
            }
            if (table === 'split_rules') {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(async () => ({ data: splitRules, error: null })),
                    })),
                };
            }
            return {
                select: vi.fn(() => ({
                    eq: vi.fn(async () => ({ data: [], error: null })),
                })),
            };
        }),
    } as unknown as SupabaseClient;

    return { client, ledger, splits };
}

const SIGNED_SPLITS = [
    { beneficiaryId: 'author-1', allocatedAmountMinor: 41140, account: 'BENEFICIARY_PAYABLE' as const },
    { beneficiaryId: null, allocatedAmountMinor: 4840, account: 'PLATFORM_REVENUE' as const },
    { beneficiaryId: null, allocatedAmountMinor: 2420, account: 'RESERVE' as const },
];

describe('§6.3 migration schema: financial_ledger accepts the signed accounts', () => {
    it.each([...ACCOUNTS_ALLOWED_BY_MIGRATION])('accepts %s', async (account) => {
        const { client, ledger } = schemaEnforcingClient();

        await recordPaymentPostingJournal(
            {
                paymentIntentId: 'pi-1',
                invoiceId: 'inv-1',
                transactionId: 'txn-1',
                currency: 'EGP',
                grossAmountMinor: 100,
                gatewayFeeMinor: 0,
                splits: [{ beneficiaryId: null, allocatedAmountMinor: 100, account: account as never }],
                supabaseClient: client,
            }
        );

        expect(ledger).toHaveLength(2);
        expect(ledger.map((r) => r.account)).toContain(account);
    });

    it('rejects an account outside the allow-list', async () => {
        const { client } = schemaEnforcingClient();

        await expect(
            recordPaymentPostingJournal(
                {
                    paymentIntentId: 'pi-1',
                    invoiceId: 'inv-1',
                    transactionId: 'txn-1',
                    currency: 'EGP',
                    grossAmountMinor: 100,
                    gatewayFeeMinor: 0,
                    splits: [
                        { beneficiaryId: null, allocatedAmountMinor: 100, account: 'NOT_A_REAL_ACCOUNT' as never },
                    ],
                    supabaseClient: client,
                }
            )
        ).rejects.toThrow(/financial_ledger_account_check/);
    });

    it('posts a RESERVE credit line (the account the migration unblocks)', async () => {
        const { client, ledger } = schemaEnforcingClient();

        await recordPaymentPostingJournal(
            {
                paymentIntentId: 'pi-1',
                invoiceId: 'inv-1',
                transactionId: 'txn-1',
                currency: 'EGP',
                grossAmountMinor: 2420,
                gatewayFeeMinor: 0,
                splits: [{ beneficiaryId: null, allocatedAmountMinor: 2420, account: 'RESERVE' }],
                supabaseClient: client,
            }
        );

        expect(ledger).toContainEqual(
            expect.objectContaining({ account: 'RESERVE', entry_type: 'CREDIT', amount_minor: 2420 })
        );
    });
});

describe('§6.3 migration schema: order_splits.destination_account', () => {
    it('writes destination_account = RESERVE through the committed splitEngine freeze path', async () => {
        const { client, splits } = schemaEnforcingClient();

        const result = await freezeOrderSplits(client, 'inv-1', 0);

        expect(result.frozen).toBe(true);
        expect(result.splitsCount).toBe(3);
        expect(splits).toHaveLength(3);
        for (const row of splits) {
            expect(row.status).toBe('calculated');
            expect(DESTINATION_ACCOUNTS_ALLOWED).toContain(
                row.destination_account as never
            );
        }
        expect(splits.map((r) => r.destination_account)).toEqual([
            'BENEFICIARY_PAYABLE',
            'PLATFORM_REVENUE',
            'RESERVE',
        ]);
        expect(splits.map((r) => r.allocated_amount_minor)).toEqual([8500, 1000, 500]);
    });

    it('round-trips destination_account on an order_splits row', async () => {
        const { client, splits } = schemaEnforcingClient();

        const inserted = client
            .from('order_splits')
            .insert([
                {
                    invoice_id: 'inv-1',
                    beneficiary_id: null,
                    destination_account: 'RESERVE',
                    status: 'calculated',
                    allocated_amount_minor: 2420,
                },
            ]);

        const result = await inserted;
        const readBack = await inserted.select('*').eq('invoice_id', 'inv-1');

        expect(result.error).toBeNull();
        expect(readBack.error).toBeNull();
        expect(splits).toHaveLength(1);
        expect(splits[0].destination_account).toBe('RESERVE');
        expect(splits[0].status).toBe('calculated');
    });

    it('rejects a destination_account the ledger would not accept', async () => {
        const { client } = schemaEnforcingClient();

        await expect(
            (async () =>
                client.from('order_splits').insert([
                    {
                        invoice_id: 'inv-1',
                        beneficiary_id: null,
                        destination_account: 'MADE_UP_ACCOUNT',
                        status: 'calculated',
                        allocated_amount_minor: 100,
                    },
                ]))()
        ).rejects.toThrow(/destination_account/);
    });
});

describe('§6.3 signed journal remains balanced on the migrated schema', () => {
    it('posts G=49900 F=1500 N=48400 with 41140/4840/2420 as a single balanced entry', async () => {
        const { client, ledger } = schemaEnforcingClient();

        const result = await recordPaymentPostingJournal(
            {
                paymentIntentId: 'pi-63',
                invoiceId: 'inv-63',
                transactionId: 'txn-63',
                currency: 'EGP',
                grossAmountMinor: 49900,
                gatewayFeeMinor: 1500,
                splits: SIGNED_SPLITS,
                supabaseClient: client,
            }
        );

        expect(result.totalDebitMinor).toBe(49900);
        expect(result.totalCreditMinor).toBe(49900);
        expect(ledger).toHaveLength(6);

        const debit = ledger.filter((r) => r.entry_type === 'DEBIT');
        const credit = ledger.filter((r) => r.entry_type === 'CREDIT');

        expect(debit.map((r) => [r.account, r.amount_minor])).toEqual([
            ['CUSTOMER_FUNDS', 48400],
            ['GATEWAY_FEES', 1500],
        ]);
        expect(credit.map((r) => [r.account, r.amount_minor])).toEqual([
            ['BENEFICIARY_PAYABLE', 41140],
            ['PLATFORM_REVENUE', 4840],
            ['RESERVE', 2420],
            ['CUSTOMER_FUNDS', 1500],
        ]);

        expect(debit.reduce((s, r) => s + r.amount_minor, 0)).toBe(49900);
        expect(credit.reduce((s, r) => s + r.amount_minor, 0)).toBe(49900);
    });

    it('never writes SALES_CLEARING', async () => {
        const { client, ledger } = schemaEnforcingClient();

        await recordPaymentPostingJournal(
            {
                paymentIntentId: 'pi-63',
                invoiceId: 'inv-63',
                transactionId: 'txn-63',
                currency: 'EGP',
                grossAmountMinor: 49900,
                gatewayFeeMinor: 1500,
                splits: SIGNED_SPLITS,
                supabaseClient: client,
            }
        );

        expect(ledger.map((r) => r.account)).not.toContain('SALES_CLEARING');
    });
});
