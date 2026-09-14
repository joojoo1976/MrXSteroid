/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  FINANCIAL LEDGER SERVICE (v4 - Double-Entry Journal & Invariants)
 *  Strict immutable, append-only double-entry ledger implementing:
 *  - Chart of Accounts (N-4)
 *  - Explicit Accounting Chain (N-3)
 *  - Invariants G-1 through G-13 (SUM(debits) === SUM(credits), no unlinked entries)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export type LedgerAccount =
    | 'CUSTOMER_FUNDS'
    | 'GATEWAY_FEES'
    | 'PLATFORM_REVENUE'
    | 'BENEFICIARY_PAYABLE'
    | 'REFUND_LIABILITY'
    | 'PAYOUT_CLEARING'
    | 'SALES_CLEARING';

export type LedgerEntryType = 'DEBIT' | 'CREDIT';

export type LedgerEventType =
    | 'PAYMENT_CAPTURED'
    | 'GATEWAY_FEE'
    | 'SPLIT_ALLOCATED'
    | 'REFUND_CREATED'
    | 'REFUND_ALLOCATED'
    | 'PAYOUT_CREATED'
    | 'PAYOUT_COMPLETED'
    | 'PAYOUT_FAILED'
    | 'PAYOUT_REVERSED'
    | 'MANUAL_ADJUSTMENT';

export interface JournalLineItem {
    account: LedgerAccount;
    entryType: LedgerEntryType;
    amountMinor: number;
    beneficiaryId?: string | null;
    description?: string;
    originalJournalEntryId?: string | null;
}

export interface PostJournalEntryParams {
    journalEntryId?: string;
    paymentIntentId?: string | null;
    invoiceId?: string | null;
    currency: string;
    eventType: LedgerEventType;
    sourceId: string;
    sourceEventType: string;
    lines: JournalLineItem[];
}

export interface PostJournalResult {
    journalEntryId: string;
    totalDebitMinor: number;
    totalCreditMinor: number;
    entriesPosted: number;
}

function getSupabaseAdmin(): SupabaseClient {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('[FinancialLedger] Missing Supabase admin env vars.');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Validates G-11: SUM(debits) === SUM(credits) and amountMinor > 0
 */
export function validateJournalBalance(lines: JournalLineItem[]): {
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
} {
    if (!lines || lines.length === 0) {
        throw new Error('[FinancialLedger] Cannot post an empty journal entry (G-12 violation)');
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
        if (!Number.isInteger(line.amountMinor) || line.amountMinor <= 0) {
            throw new Error(`[FinancialLedger] Line amount must be a positive integer minor unit, got: ${line.amountMinor}`);
        }
        if (line.entryType === 'DEBIT') {
            totalDebit += line.amountMinor;
        } else if (line.entryType === 'CREDIT') {
            totalCredit += line.amountMinor;
        } else {
            throw new Error(`[FinancialLedger] Invalid entryType: ${line.entryType}`);
        }
    }

    return {
        totalDebit,
        totalCredit,
        isBalanced: totalDebit === totalCredit,
    };
}

/**
 * Atomically post a balanced Double-Entry Journal transaction to the immutable ledger.
 */
export async function postJournalEntry(
    params: PostJournalEntryParams,
    supabaseClient?: SupabaseClient
): Promise<PostJournalResult> {
    const { totalDebit, totalCredit, isBalanced } = validateJournalBalance(params.lines);

    if (!isBalanced) {
        throw new Error(
            `[FinancialLedger] Unbalanced journal entry (G-11 violation): Debits (${totalDebit}) !== Credits (${totalCredit})`
        );
    }

    if (!params.sourceId || !params.sourceEventType) {
        throw new Error('[FinancialLedger] Missing source event identifier (G-12 violation)');
    }

    const journalEntryId = params.journalEntryId || crypto.randomUUID();
    const supabase = supabaseClient || getSupabaseAdmin();

    const rowsToInsert = params.lines.map((line) => ({
        journal_entry_id: journalEntryId,
        payment_intent_id: params.paymentIntentId || null,
        invoice_id: params.invoiceId || null,
        account: line.account,
        entry_type: line.entryType,
        amount_minor: line.amountMinor,
        currency: params.currency.toUpperCase(),
        event_type: params.eventType,
        source_id: params.sourceId,
        source_event_type: params.sourceEventType,
        original_journal_entry_id: line.originalJournalEntryId || null,
        beneficiary_id: line.beneficiaryId || null,
        description: line.description || null,
        created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('financial_ledger').insert(rowsToInsert);

    if (error) {
        throw new Error(`[FinancialLedger] Failed to persist journal entry: ${error.message}`);
    }

    return {
        journalEntryId,
        totalDebitMinor: totalDebit,
        totalCreditMinor: totalCredit,
        entriesPosted: rowsToInsert.length,
    };
}

/**
 * Record Payment Captured Journal (N-3, N-4):
 * Gross 100:
 * Debit CUSTOMER_FUNDS 10,000 / Credit SALES_CLEARING 10,000
 * Gateway Fee 300:
 * Debit GATEWAY_FEES 300 / Credit CUSTOMER_FUNDS 300
 */
export async function recordPaymentCaptureJournal(params: {
    paymentIntentId: string;
    invoiceId: string;
    grossAmountMinor: number;
    gatewayFeeMinor: number;
    currency: string;
    transactionId: string;
    supabaseClient?: SupabaseClient;
}): Promise<PostJournalResult> {
    const lines: JournalLineItem[] = [
        {
            account: 'CUSTOMER_FUNDS',
            entryType: 'DEBIT',
            amountMinor: params.grossAmountMinor,
            description: `Customer payment captured for invoice ${params.invoiceId}`,
        },
        {
            account: 'SALES_CLEARING',
            entryType: 'CREDIT',
            amountMinor: params.grossAmountMinor,
            description: `Sales revenue clearing for invoice ${params.invoiceId}`,
        },
    ];

    if (params.gatewayFeeMinor > 0) {
        lines.push(
            {
                account: 'GATEWAY_FEES',
                entryType: 'DEBIT',
                amountMinor: params.gatewayFeeMinor,
                description: `Gateway fee for transaction ${params.transactionId}`,
            },
            {
                account: 'CUSTOMER_FUNDS',
                entryType: 'CREDIT',
                amountMinor: params.gatewayFeeMinor,
                description: `Gateway fee withheld from customer funds`,
            }
        );
    }

    return postJournalEntry(
        {
            paymentIntentId: params.paymentIntentId,
            invoiceId: params.invoiceId,
            currency: params.currency,
            eventType: 'PAYMENT_CAPTURED',
            sourceId: params.transactionId,
            sourceEventType: 'kashier_transaction',
            lines,
        },
        params.supabaseClient
    );
}

/**
 * Record Split Allocation Journal (N-3, N-4):
 * Net Amount:
 * Debit SALES_CLEARING (netAmountMinor)
 * Credits to BENEFICIARY_PAYABLE (for each beneficiary)
 * Credit to PLATFORM_REVENUE (platform share)
 */
export async function recordSplitAllocationJournal(params: {
    paymentIntentId: string;
    invoiceId: string;
    netAmountMinor: number;
    currency: string;
    splits: Array<{
        beneficiaryId: string;
        allocatedAmountMinor: number;
        role: string;
    }>;
    supabaseClient?: SupabaseClient;
}): Promise<PostJournalResult> {
    const lines: JournalLineItem[] = [
        {
            account: 'SALES_CLEARING',
            entryType: 'DEBIT',
            amountMinor: params.netAmountMinor,
            description: `Clear sales revenue to allocations for invoice ${params.invoiceId}`,
        },
    ];

    for (const split of params.splits) {
        const targetAccount: LedgerAccount =
            split.role === 'platform' ? 'PLATFORM_REVENUE' : 'BENEFICIARY_PAYABLE';

        lines.push({
            account: targetAccount,
            entryType: 'CREDIT',
            amountMinor: split.allocatedAmountMinor,
            beneficiaryId: split.beneficiaryId,
            description: `Split allocation for beneficiary ${split.beneficiaryId} (${split.role})`,
        });
    }

    return postJournalEntry(
        {
            paymentIntentId: params.paymentIntentId,
            invoiceId: params.invoiceId,
            currency: params.currency,
            eventType: 'SPLIT_ALLOCATED',
            sourceId: params.invoiceId,
            sourceEventType: 'order_splits',
            lines,
        },
        params.supabaseClient
    );
}

/**
 * Record Payout Execution Journal:
 * Debit BENEFICIARY_PAYABLE / Credit PAYOUT_CLEARING
 * Upon completion: Debit PAYOUT_CLEARING / Credit CUSTOMER_FUNDS
 */
export async function recordPayoutExecutionJournal(params: {
    payoutId: string;
    beneficiaryId: string;
    amountMinor: number;
    currency: string;
    stage: 'PROCESSING' | 'COMPLETED' | 'REVERSED';
    paymentIntentId?: string | null;
    originalJournalEntryId?: string | null;
    supabaseClient?: SupabaseClient;
}): Promise<PostJournalResult> {
    let lines: JournalLineItem[] = [];

    if (params.stage === 'PROCESSING') {
        lines = [
            {
                account: 'BENEFICIARY_PAYABLE',
                entryType: 'DEBIT',
                amountMinor: params.amountMinor,
                beneficiaryId: params.beneficiaryId,
                description: `Queue payout ${params.payoutId} to clearing`,
            },
            {
                account: 'PAYOUT_CLEARING',
                entryType: 'CREDIT',
                amountMinor: params.amountMinor,
                beneficiaryId: params.beneficiaryId,
                description: `Payout clearing hold for payout ${params.payoutId}`,
            },
        ];
    } else if (params.stage === 'COMPLETED') {
        lines = [
            {
                account: 'PAYOUT_CLEARING',
                entryType: 'DEBIT',
                amountMinor: params.amountMinor,
                beneficiaryId: params.beneficiaryId,
                description: `Discharge clearing for completed payout ${params.payoutId}`,
            },
            {
                account: 'CUSTOMER_FUNDS',
                entryType: 'CREDIT',
                amountMinor: params.amountMinor,
                beneficiaryId: params.beneficiaryId,
                description: `Disburse customer funds for payout ${params.payoutId}`,
            },
        ];
    } else if (params.stage === 'REVERSED') {
        // Reverse payout: Re-credit beneficiary payable
        lines = [
            {
                account: 'PAYOUT_CLEARING',
                entryType: 'DEBIT',
                amountMinor: params.amountMinor,
                beneficiaryId: params.beneficiaryId,
                originalJournalEntryId: params.originalJournalEntryId,
                description: `Reverse clearing for failed payout ${params.payoutId}`,
            },
            {
                account: 'BENEFICIARY_PAYABLE',
                entryType: 'CREDIT',
                amountMinor: params.amountMinor,
                beneficiaryId: params.beneficiaryId,
                originalJournalEntryId: params.originalJournalEntryId,
                description: `Restore beneficiary payable balance for payout ${params.payoutId}`,
            },
        ];
    }

    return postJournalEntry(
        {
            paymentIntentId: params.paymentIntentId,
            currency: params.currency,
            eventType: params.stage === 'COMPLETED' ? 'PAYOUT_COMPLETED' : params.stage === 'REVERSED' ? 'PAYOUT_REVERSED' : 'PAYOUT_CREATED',
            sourceId: params.payoutId,
            sourceEventType: 'payouts',
            lines,
        },
        params.supabaseClient
    );
}
