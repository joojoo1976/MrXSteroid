import { PayoutService } from '../../../server/payments/payoutService';
import { createClient } from '@supabase/supabase-js';

export interface CreateTransferInput {
    beneficiaryId: string;
    amountMinor: number;
    currency: string;
    payoutMethod: 'bank_account' | 'mobile_wallet' | 'card';
    payoutDetails?: Record<string, unknown>;
    adminUserId: string;
    approvalIdempotencyKey?: string;
}

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('[create-transfer] Missing Supabase admin credentials.');
    }
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

/**
 * Creates and executes a single payout transfer via PayoutService.
 * Follows Section 65.2 endpoint standards (/v3/transfers/single) with full ledger linkage.
 */
export async function createTransfer(input: CreateTransferInput) {
    const supabase = getSupabaseAdmin();
    const payoutService = new PayoutService(supabase);

    const payoutId = await payoutService.queuePayoutForBeneficiary({
        beneficiaryId: input.beneficiaryId,
        amountMinor: input.amountMinor,
        currency: input.currency,
        payoutMethod: input.payoutMethod,
    });

    const approvalResult = await payoutService.approveBatchPayouts(
        [payoutId],
        input.adminUserId,
        input.approvalIdempotencyKey
    );

    return {
        payoutId,
        approvalResult,
    };
}
