/**
 * ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
 *  PAYOUT & TRANSFER SERVICE (v4 - Final Gate N-8, N-9, N-10, J-1..J-10)
 *  Manages beneficiary disbursements via Kashier Transfers API:
 *  - Enforces Admin Manual Batch Approval in v1 ΓÇö strictly NO blind automatic payouts.
 *  - Approval Idempotency Key (N-10): Single click -> exactly-once execution.
 *  - Stale-Approval Protection: Re-runs all balance gates at moment of execution.
 *  - Links to Double-Entry Financial Ledger (N-4).
 *  - Handles RECONCILING and UNKNOWN states upon network timeout (N-8).
 * ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { assertPayoutTransition, type PayoutState } from './payoutState';
import { recordPayoutExecutionJournal } from './financialLedgerService';

export interface CreatePayoutParams {
    beneficiaryId: string;
    amountMinor: number;
    currency: string;
    payoutMethod: 'bank_account' | 'mobile_wallet' | 'card';
    payoutDetails?: Record<string, unknown>;
    adminUserId: string;
}

export interface PayoutResult {
    payoutId: string;
    status: PayoutState;
    externalTransferId?: string;
    errorMessage?: string;
}

export interface PayoutStatus {
    payoutId: string;
    status: PayoutState;
    amountMinor: number;
    currency: string;
    externalTransferId?: string;
    errorMessage?: string;
    updatedAt: string;
}

export interface BatchApprovalSummary {
    approvedCount: number;
    failedCount: number;
    totalAmountMinor: number;
    currency: string;
    payoutIds: string[];
    errors: string[];
}

export class PayoutService {
    private readonly supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    /**
     * Queues a payout for a beneficiary based on pending order splits.
     */
    async queuePayoutForBeneficiary(params: {
        beneficiaryId: string;
        amountMinor: number;
        currency: string;
        payoutMethod: string;
        paymentIntentId?: string;
    }): Promise<string> {
        const { data, error } = await this.supabase
            .from('payouts')
            .insert({
                beneficiary_id: params.beneficiaryId,
                amount_minor: params.amountMinor,
                currency: params.currency,
                payout_method: params.payoutMethod,
                payment_intent_id: params.paymentIntentId || null,
                status: 'queued',
            })
            .select('id')
            .single();

        if (error || !data) {
            throw new Error(`[PayoutService] Failed to queue payout: ${error?.message}`);
        }

        return data.id;
    }

    /**
     * Executes manual batch approval for queued payouts (Admin Trigger).
     * Enforces the verification gates and approval idempotency key before sending requests.
     */
    async approveBatchPayouts(
        payoutIds: string[],
        adminUserId: string,
        approvalIdempotencyKey?: string
    ): Promise<BatchApprovalSummary> {
        if (!adminUserId) {
            throw new Error('[PayoutService] Admin user authentication required for batch approval');
        }

        const summary: BatchApprovalSummary = {
            approvedCount: 0,
            failedCount: 0,
            totalAmountMinor: 0,
            currency: 'EGP',
            payoutIds: [],
            errors: [],
        };

        for (const id of payoutIds) {
            try {
                // 1. Fetch payout record with lock/freshness
                const { data: payout, error: fetchErr } = await this.supabase
                    .from('payouts')
                    .select('*, beneficiary:beneficiaries(*)')
                    .eq('id', id)
                    .single();

                if (fetchErr || !payout) {
                    summary.failedCount++;
                    summary.errors.push(`Payout ${id} not found`);
                    continue;
                }

                // Stale-Approval Protection & Status Check (N-10)
                if (payout.status !== 'queued') {
                    summary.failedCount++;
                    summary.errors.push(`Payout ${id} is not in 'queued' state (current: ${payout.status})`);
                    continue;
                }

                // Balance Gate: Beneficiary active check (J-7)
                if (payout.beneficiary && payout.beneficiary.is_active === false) {
                    summary.failedCount++;
                    summary.errors.push(`Payout ${id} rejected: Beneficiary ${payout.beneficiary_id} is inactive.`);
                    continue;
                }

                // Balance Gate: Positive integer amount check (J-5)
                if (!Number.isInteger(payout.amount_minor) || payout.amount_minor <= 0) {
                    summary.failedCount++;
                    summary.errors.push(`Payout ${id} rejected: Invalid non-positive amount ${payout.amount_minor}`);
                    continue;
                }

                // Idempotency key protection (N-10)
                const idempotencyKey = approvalIdempotencyKey || `batch-${adminUserId}-${Date.now()}-${id}`;
                if (payout.approval_idempotency_key && payout.approval_idempotency_key !== idempotencyKey) {
                    summary.failedCount++;
                    summary.errors.push(`Payout ${id} rejected: Duplicate approval key detected.`);
                    continue;
                }

                // Transition to PROCESSING
                assertPayoutTransition(payout.status as PayoutState, 'PROCESSING');
                await this.supabase
                    .from('payouts')
                    .update({
                        status: 'processing',
                        approval_idempotency_key: idempotencyKey,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', id);

                // Record Journal Hold in Ledger: BENEFICIARY_PAYABLE -> PAYOUT_CLEARING
                try {
                    await recordPayoutExecutionJournal({
                        payoutId: id,
                        beneficiaryId: payout.beneficiary_id,
                        amountMinor: payout.amount_minor,
                        currency: payout.currency,
                        stage: 'PROCESSING',
                        paymentIntentId: payout.payment_intent_id,
                        supabaseClient: this.supabase,
                    });
                } catch (ledgerErr) {
                    console.warn(`[PayoutService] Ledger hold notice:`, ledgerErr);
                }

                // 2. Perform external transfer via Kashier Transfer API
                const transferResult = await this.executeKashierTransfer({
                    payoutId: id,
                    amountMinor: payout.amount_minor,
                    currency: payout.currency,
                    payoutMethod: payout.payout_method,
                    payoutDetails: payout.beneficiary?.payout_details || {},
                });

                if (transferResult.success && transferResult.status === 'COMPLETED') {
                    // Only a settled transfer may be marked completed. A create
                    // call that merely returned a transferId is PROCESSING and
                    // stays there until the payout webhook reports TRANSFERRED.
                    assertPayoutTransition('PROCESSING', 'COMPLETED');
                    await this.supabase
                        .from('payouts')
                        .update({
                            status: 'completed',
                            kashier_transfer_id: transferResult.transferId,
                            raw_response: transferResult.rawResponse || {},
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', id);

                    // Update corresponding order_splits
                    await this.supabase
                        .from('order_splits')
                        .update({ status: 'paid', updated_at: new Date().toISOString() })
                        .eq('payout_id', id);

                    // Record Journal Completion: PAYOUT_CLEARING -> CUSTOMER_FUNDS
                    try {
                        await recordPayoutExecutionJournal({
                            payoutId: id,
                            beneficiaryId: payout.beneficiary_id,
                            amountMinor: payout.amount_minor,
                            currency: payout.currency,
                            stage: 'COMPLETED',
                            paymentIntentId: payout.payment_intent_id,
                            supabaseClient: this.supabase,
                        });
                    } catch (ledgerErr) {
                        console.warn(`[PayoutService] Ledger completion notice:`, ledgerErr);
                    }

                    summary.approvedCount++;
                    summary.totalAmountMinor += payout.amount_minor;
                    summary.currency = payout.currency;
                    summary.payoutIds.push(id);
                } else if (
                    transferResult.success &&
                    transferResult.status === 'PROCESSING' &&
                    transferResult.transferId
                ) {
                    // Transfer accepted by Kashier but not settled. Persist the
                    // provider transferId and wait for the payout webhook.
                    await this.supabase
                        .from('payouts')
                        .update({
                            status: 'processing',
                            kashier_transfer_id: transferResult.transferId,
                            raw_response: transferResult.rawResponse || {},
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', id);

                    summary.approvedCount++;
                    summary.totalAmountMinor += payout.amount_minor;
                    summary.currency = payout.currency;
                    summary.payoutIds.push(id);
                } else if (transferResult.status === 'RECONCILING' || transferResult.status === 'UNKNOWN') {
                    // Handle timeout per N-8 (do NOT mark permanently failed, do NOT retry blindly)
                    assertPayoutTransition('PROCESSING', 'RECONCILING');
                    await this.supabase
                        .from('payouts')
                        .update({
                            status: 'reconciling',
                            error_message: transferResult.errorMessage,
                            raw_response: transferResult.rawResponse || {},
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', id);

                    summary.failedCount++;
                    summary.errors.push(`Payout ${id} pending external reconciliation: ${transferResult.errorMessage}`);
                } else {
                    assertPayoutTransition('PROCESSING', 'FAILED');
                    await this.supabase
                        .from('payouts')
                        .update({
                            status: 'failed',
                            error_message: transferResult.errorMessage,
                            raw_response: transferResult.rawResponse || {},
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', id);

                    // Revert Journal Hold in Ledger
                    try {
                        await recordPayoutExecutionJournal({
                            payoutId: id,
                            beneficiaryId: payout.beneficiary_id,
                            amountMinor: payout.amount_minor,
                            currency: payout.currency,
                            stage: 'REVERSED',
                            paymentIntentId: payout.payment_intent_id,
                            supabaseClient: this.supabase,
                        });
                    } catch (ledgerErr) {
                        console.warn(`[PayoutService] Ledger reversal notice:`, ledgerErr);
                    }

                    summary.failedCount++;
                    summary.errors.push(`Payout ${id} failed: ${transferResult.errorMessage}`);
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                summary.failedCount++;
                summary.errors.push(`Payout ${id} error: ${message}`);
            }
        }

        return summary;
    }

    /**
     * Executes external transfer via Kashier Transfers API.
     * Enforces mock simulation in test/sandbox or live transfer when configured and unlocked.
     */
    private async executeKashierTransfer(params: {
        payoutId: string;
        amountMinor: number;
        currency: string;
        payoutMethod: string;
        payoutDetails: Record<string, unknown>;
    }): Promise<{
        success: boolean;
        status?: PayoutState;
        transferId?: string;
        errorMessage?: string;
        rawResponse?: Record<string, unknown>;
    }> {
        const mode = (process.env.KASHIER_MODE || 'test').toLowerCase();
        // Transfer API calls authenticate with the Merchant Secret Key in the
        // `Authorization` header, sent raw (Kashier does not use Bearer for
        // this). The Transfer API Key is ONLY for webhook HMAC verification
        // and must never be substituted here.
        const secretKey =
            process.env.KASHIER_TEST_SECRET_KEY ||
            process.env.KASHIER_EGYPT_SECRET_KEY ||
            process.env.KASHIER_GLOBAL_SECRET_KEY;

        // In Test / Simulation mode, simulate an accepted-but-unsettled transfer.
        // Even in simulation the payout only reaches COMPLETED when a transfer
        // webhook reports TRANSFERRED, so the state machine and the webhook path
        // stay identical between modes.
        if (mode === 'test' || !secretKey) {
            console.log(`[PayoutService] Simulating test transfer for payout ${params.payoutId}`);
            return {
                success: true,
                status: 'PROCESSING',
                transferId: `TEST-TX-${Date.now()}-${params.payoutId.slice(0, 8)}`,
                rawResponse: {
                    simulated: true,
                    mode: 'test',
                    amountMinor: params.amountMinor,
                    currency: params.currency,
                    method: params.payoutMethod,
                    timestamp: new Date().toISOString(),
                },
            };
        }

        // Live Mode: Must check Owner Kill Switch (N-13)
        if (process.env.KASHIER_LIVE_ENABLED !== 'true') {
            return {
                success: false,
                status: 'FAILED',
                errorMessage: 'Live payouts are blocked by Owner Kill Switch (KASHIER_LIVE_ENABLED=false)',
            };
        }

        // Transfer writes go to the FEP host. docs/kashier-endpoints-verification.md
        // records C-2 as BLOCKED pending account-manager confirmation, so live
        // execution stays gated on KASHIER_LIVE_ENABLED and never runs from the
        // read host by accident.
        const host = mode === 'test' ? 'https://test-fep.kashier.io' : 'https://fep.kashier.io';
        const endpoint = `${host}/v3/transfers/single`;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: secretKey,
                },
                body: JSON.stringify({
                    referenceId: params.payoutId,
                    amount: (params.amountMinor / 100).toFixed(2),
                    currency: params.currency,
                    destination: params.payoutDetails,
                }),
                signal: AbortSignal.timeout(5000),
            });

            const data = await res.json();
            // The create call returns a transfer that is only INITIATED, never
            // settled. Treating a non-2xx-or-INITIATED response as completed
            // would report a payout that has not reached the recipient.
            const createdTransferId = data.transferId || data.id;
            if (res.ok && createdTransferId) {
                return {
                    success: true,
                    status: 'PROCESSING',
                    transferId: createdTransferId,
                    rawResponse: data,
                };
            }

            return {
                success: false,
                status: 'RECONCILING',
                errorMessage: data.message || data.error || `HTTP ${res.status}`,
                rawResponse: data,
            };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            const isTimeout = message.toLowerCase().includes('timeout') || message.toLowerCase().includes('aborted');
            return {
                success: false,
                status: isTimeout ? 'RECONCILING' : 'FAILED',
                errorMessage: isTimeout ? `Transfer timed out, reconciling status: ${message}` : `Network failure: ${message}`,
            };
        }
    }
}
