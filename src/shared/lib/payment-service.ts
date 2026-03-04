/**
 * Payment Service for Mr. X Steroid
 * Handles payment initialization, verification, status updates, and record creation
 */

import { supabase } from './supabase';
// @ts-ignore - This module is mocked in tests
import SpaceRemit from 'spaceremit';

interface PaymentData {
    userId: string;
    amount: number;
    currency: string;
    productId: string;
    productName: string;
}

interface PaymentRecord {
    transaction_id: string;
    user_id: string;
    amount: number;
    currency: string;
    status: string;
    product_id: string;
    customer_email: string;
}

const VALID_STATUSES = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'];
const VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'SAR', 'EGP', 'AED'];

function isValidTransactionIdFormat(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    const txnRegex = /^[a-zA-Z][a-zA-Z0-9_-]+$/;
    return txnRegex.test(id.trim());
}

function isValidUserIdFormat(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    const uuidRegex = /^[a-zA-Z0-9-]+$/;
    return uuidRegex.test(id.trim());
}

export const paymentService = {
    /**
     * Validate transaction ID format
     */
    validateTransactionId(id: string): boolean {
        return isValidTransactionIdFormat(id);
    },

    /**
     * Validate complete payment data
     */
    validatePaymentData(data: PaymentData): boolean {
        if (!data || typeof data !== 'object') return false;
        if (!data.userId || !isValidUserIdFormat(data.userId)) return false;
        if (!data.amount || data.amount <= 0) return false;
        if (!data.currency || !VALID_CURRENCIES.includes(data.currency)) return false;
        if (!data.productId) return false;
        if (!data.productName) return false;
        return true;
    },

    /**
     * Initialize a payment with the payment gateway
     */
    async initializePayment(data: PaymentData) {
        // Validate payment data
        if (!data || typeof data !== 'object' || !data.userId) {
            throw new Error('Payment data is required');
        }

        if (!data.amount || data.amount <= 0) {
            throw new Error('Amount must be positive');
        }

        if (!data.currency || !VALID_CURRENCIES.includes(data.currency)) {
            throw new Error('Invalid currency');
        }

        if (!data.productId) {
            throw new Error('Product ID is required');
        }

        if (!data.productName) {
            throw new Error('Product name is required');
        }

        if (!isValidUserIdFormat(data.userId)) {
            throw new Error('Invalid user ID format');
        }

        try {
            // Get user email
            const { data: userData } = await supabase.auth.getUser();
            const customerEmail = userData?.user?.email || '';

            // Create transaction with SpaceRemit
            const gateway = SpaceRemit();

            const { data: txnData, error: txnError } = await gateway.createTransaction({
                amount: data.amount,
                currency: data.currency,
                reference_id: `ref_${Date.now()}`,
                customer_email: customerEmail,
                callback_url: '',
                success_url: '',
                cancel_url: ''
            });

            if (txnError) {
                throw txnError;
            }

            return txnData;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Payment gateway unavailable');
        }
    },

    /**
     * Verify a payment transaction
     */
    async verifyPayment(transactionId: string) {
        if (!transactionId || !transactionId.trim()) {
            throw new Error('Transaction ID is required');
        }

        if (!isValidTransactionIdFormat(transactionId)) {
            throw new Error('Invalid transaction ID format');
        }

        try {
            // Check the payment record exists
            const fromResult = supabase.from('payments');
            const selectResult = (fromResult as any).select();
            const { data: records, error: dbError } = await selectResult.eq('transaction_id', transactionId);

            if (dbError) throw dbError;
            if (!records || records.length === 0) {
                throw new Error('Payment record not found');
            }

            // Verify with SpaceRemit
            const gateway = SpaceRemit();

            const verification = await gateway.verifyTransaction(transactionId);

            if (verification.success) {
                return {
                    isValid: true,
                    paymentData: records[0]
                };
            } else {
                return {
                    isValid: false,
                    error: verification.error || 'Verification failed'
                };
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Payment verification failed');
        }
    },

    /**
     * Update payment status in the database
     */
    async updatePaymentStatus(transactionId: string, status: string) {
        if (!transactionId || !transactionId.trim()) {
            throw new Error('Transaction ID is required');
        }

        if (!isValidTransactionIdFormat(transactionId)) {
            throw new Error('Invalid transaction ID format');
        }

        if (!VALID_STATUSES.includes(status)) {
            throw new Error('Invalid payment status');
        }

        const fromResult = supabase.from('payments');
        const updateResult = (fromResult as any).update({ status, updated_at: new Date().toISOString() });
        const { data, error } = await updateResult.eq('transaction_id', transactionId);

        if (error) {
            throw new Error(`Failed to update payment status: ${error.message}`);
        }

        return Array.isArray(data) ? data[0] : data;
    },

    /**
     * Create a payment record in the database
     */
    async createPaymentRecord(recordData: PaymentRecord) {
        if (!recordData || typeof recordData !== 'object' || !recordData.transaction_id) {
            throw new Error('Payment record data is required');
        }

        if (!recordData.amount || recordData.amount <= 0) {
            throw new Error('Amount must be positive');
        }

        const fromResult = supabase.from('payments');
        const { data, error } = await (fromResult as any).insert({
            ...recordData,
            created_at: new Date().toISOString()
        });

        if (error) {
            if (error.message?.includes('duplicate') || error.details?.includes('already exists')) {
                throw new Error('A payment with this transaction ID already exists');
            }
            throw new Error(`Failed to create payment record: ${error.message}`);
        }

        return Array.isArray(data) ? data[0] : data;
    }
};
