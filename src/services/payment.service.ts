/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🚀 MR. X STEROID - ENTERPRISE PAYMENT SERVICE                           ║
 * ║  SpaceRemit Gateway Integration (Redirect Flow)                          ║
 * ║  Refactored for Stability and Configuration Safety                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { supabase } from '../lib/supabase';
import { errorHandler } from '../lib/error-handler';
import { loggers } from '../utils/logger';
import { env } from '../config/env';

// ═══════════════════════════════════════════════════════════════════════════
//                              TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface PaymentInitPayload {
    amount: number;
    currency: 'USD' | 'EGP' | 'SAR';
    email: string;
    customerName: string;
    productId: string;
    productName: string;
    quantity: number;
    userId?: string;
    orderId: string;
    locale: 'ar' | 'en';
    metadata?: Record<string, unknown>;
}

export interface PaymentSession {
    sessionId: string;
    checkoutUrl: string;
    transactionId: string;
    expiresAt: string;
}

export interface PaymentStatus {
    transactionId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    amount: number;
    currency: string;
    paidAt?: string;
    failureReason?: string;
}

export type PaymentResult<T> =
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string; messageAr?: string } };

// ═══════════════════════════════════════════════════════════════════════════
//                          PAYMENT SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class PaymentService {
    private static instance: PaymentService;
    private pendingTransactions: Map<string, NodeJS.Timeout> = new Map();

    private constructor() {
        if (!env.SPACEREMIT_PUBLIC_KEY) {
            loggers.payment.warn('SpaceRemit Public Key not configured');
        }
    }

    /**
     * Singleton Pattern - Get Service Instance
     */
    public static getInstance(): PaymentService {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }

    /**
     * Generate Unique Transaction Reference
     */
    private generateTransactionId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 10);
        return `mrx_${timestamp}_${random}`.toUpperCase();
    }

    /**
     * Create Payment Record in Database
     */
    private async createPaymentRecord(payload: PaymentInitPayload, transactionId: string): Promise<PaymentResult<{ paymentId: string }>> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const insertPayload: any = {
                transaction_id: transactionId,
                user_id: payload.userId || null,
                order_id: payload.orderId,
                amount: payload.amount,
                currency: payload.currency,
                status: 'pending' as const,
                product_id: payload.productId,
                product_name: payload.productName,
                customer_email: payload.email,
                customer_name: payload.customerName,
                metadata: JSON.parse(JSON.stringify(payload.metadata || {}))
            };

            let { data, error } = await supabase
                .from('payments')
                .insert(insertPayload)
                .select('id')
                .single();

            // Retry logic for currency column
            if (error && (error.message.includes('currency') || error.code === '42703')) {
                loggers.payment.warn('Currency column missing, retrying without currency...');
                delete insertPayload.currency;
                const retry = await supabase
                    .from('payments')
                    .insert(insertPayload)
                    .select('id')
                    .single();
                data = retry.data;
                error = retry.error;
            }

            if (error) throw error;

            return { success: true, data: { paymentId: data.id } };
        } catch (error) {
            errorHandler.handle(error, 'PaymentService.createPaymentRecord');
            return {
                success: false,
                error: {
                    code: 'DB_INSERT_FAILED',
                    message: 'Failed to create payment record',
                    messageAr: 'فشل في إنشاء سجل الدفع'
                }
            };
        }
    }

    /**
     * Initiate Payment Transaction (Redirect Flow)
     */
    public async initiatePayment(payload: PaymentInitPayload): Promise<PaymentResult<PaymentSession>> {
        // 1. Create payment record in database
        const transactionId = this.generateTransactionId();
        const recordResult = await this.createPaymentRecord(payload, transactionId);

        if (!recordResult.success) {
            return recordResult as PaymentResult<PaymentSession>;
        }

        try {
            // 2. Build Redirect URL
            const checkoutParams = new URLSearchParams({
                k: env.SPACEREMIT_PUBLIC_KEY,
                amount: payload.amount.toString(),
                currency: payload.currency,
                way: 'card', // Required by SpaceRemit
                notes: `Order #${payload.orderId}`,
                email: payload.email,
                customer_email: payload.email,
                customer_name: payload.customerName,
                reference_id: transactionId,
                product_name: payload.productName,
                success_url: `${env.SPACEREMIT_CALLBACK_URL}?txn=${transactionId}`,
                cancel_url: `${env.PAYMENT_CANCEL_URL}?txn=${transactionId}`,
            });

            const checkoutUrl = `${env.SPACEREMIT_API_URL.replace('/api/v2', '')}/apipay-v2/?${checkoutParams.toString()}`;

            loggers.payment.info('Redirecting to SpaceRemit', {
                transactionId,
                amount: payload.amount,
                checkoutUrl
            });

            // 3. Start Polling (in case user comes back to this tab or opens new one)
            this.startTransactionPolling(transactionId, payload.userId);

            // 4. Redirect
            window.location.href = checkoutUrl;

            return {
                success: true,
                data: {
                    sessionId: transactionId,
                    checkoutUrl: checkoutUrl,
                    transactionId: transactionId,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
                }
            };
        } catch (error) {
            errorHandler.handle(error, 'PaymentService.initiatePayment');
            return {
                success: false,
                error: {
                    code: 'PAYMENT_INIT_FAILED',
                    message: 'Payment gateway error',
                    messageAr: 'خطأ في بوابة الدفع'
                }
            };
        }
    }

    /**
     * Start polling for transaction status
     */
    private startTransactionPolling(transactionId: string, userId?: string) {
        this.stopTransactionPolling(transactionId);
        let attempts = 0;
        const maxAttempts = 60;

        const interval = setInterval(async () => {
            attempts++;
            if (attempts >= maxAttempts) {
                this.stopTransactionPolling(transactionId);
                return;
            }

            const status = await this.checkTransactionStatus(transactionId);
            if (status.success && status.data.status !== 'pending') {
                this.stopTransactionPolling(transactionId);

                // Dispatch event
                window.dispatchEvent(new CustomEvent('paymentStatusChanged', {
                    detail: { transactionId, status: status.data.status, userId }
                }));
            }
        }, 5000);

        this.pendingTransactions.set(transactionId, interval);
    }

    private stopTransactionPolling(transactionId: string) {
        const interval = this.pendingTransactions.get(transactionId);
        if (interval) {
            clearInterval(interval);
            this.pendingTransactions.delete(transactionId);
        }
    }

    /**
     * Check Transaction Status
     */
    public async checkTransactionStatus(transactionId: string): Promise<PaymentResult<PaymentStatus>> {
        try {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('transaction_id', transactionId)
                .single();

            if (error) throw error;

            return {
                success: true,
                data: {
                    transactionId: data.transaction_id,
                    status: data.status as PaymentStatus['status'],
                    amount: data.amount,
                    currency: data.currency,
                    paidAt: data.paid_at,
                    failureReason: data.error_message
                }
            };
        } catch {
            return {
                success: false,
                error: {
                    code: 'STATUS_CHECK_FAILED',
                    message: 'Status check failed',
                    messageAr: 'فشل التحقق من الحالة'
                }
            };
        }
    }
}

export const paymentService = PaymentService.getInstance();
export default PaymentService;
