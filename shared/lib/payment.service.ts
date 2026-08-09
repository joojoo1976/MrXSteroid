/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🚀 MR. X STEROID - ENTERPRISE PAYMENT SERVICE                           ║
 * ║  SpaceRemit Gateway Integration (Redirect Flow)                          ║
 * ║  Refactored for Stability and Configuration Safety                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { supabase } from './supabase';
import { errorHandler } from './error-handler';
import { loggers } from './logger';
import { env } from '../../config/env';
import {
    PaymentInitPayload,
    PaymentSession,
    PaymentStatus,
    PaymentResult
} from '@/shared/types/payment';

// ═══════════════════════════════════════════════════════════════════════════
//                          MULTI-GATEWAY INVOICE API
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateInvoiceRequest {
    userId: string;
    tierId: string;
    amount: number;
    currency: string;
    country: string;
    email: string;
    fullName: string;
    locale?: 'ar' | 'en';
    paymentMethod?: string;
    integrationId?: number | string;
    phoneNumber?: string;
    quantity?: number;
    shippingCost?: number;
    discount?: number;
    metadata?: Record<string, unknown>;
}

export interface CreateInvoiceResponse {
    success: boolean;
    invoiceId?: string;
    redirectUrl?: string;
    clientSecret?: string;
    gateway?: string;
    error?: string;
    details?: Record<string, string[]>;
}

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
            const insertPayload: Record<string, unknown> = {
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
            if (!data) throw new Error('Payment record created without an id');

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
     * 🆕 Create Invoice via Multi-Gateway Strategy Pattern API
     * 
     * Calls /api/payments/create-invoice which uses the PaymentFactory
     * to route to the correct gateway (SpaceRemit, Paymob, or Stripe)
     * based on the customer's country.
     */
    public async createInvoice(request: CreateInvoiceRequest): Promise<CreateInvoiceResponse> {
        try {
            loggers.payment.info('Creating invoice via gateway API', {
                tierId: request.tierId,
                country: request.country,
                email: request.email,
            });

            const response = await fetch('/api/payments/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });

            // Safe JSON parsing — handle non-JSON error responses (e.g., "A server error occurred")
            let data: Record<string, unknown>;
            const responseClone = response.clone(); // Clone to read text if json fails
            try {
                data = await response.json();
            } catch {
                const rawText = await responseClone.text().catch(() => `HTTP ${response.status}`);
                loggers.payment.error('Server returned non-JSON response', { status: response.status, rawText });
                return {
                    success: false,
                    error: `Server error (${response.status}): ${rawText.substring(0, 100)}`,
                };
            }

            if (!response.ok || !data.success) {
                loggers.payment.error('Invoice creation failed', data);
                return {
                    success: false,
                    error: (data.error || data.message || 'Invoice creation failed') as string,
                    details: data.details as Record<string, string[]>,
                };
            }

            loggers.payment.info('Invoice created successfully', {
                invoiceId: data.invoiceId,
                gateway: data.gateway,
                redirectUrl: data.redirectUrl,
                hasClientSecret: !!data.clientSecret,
            });

            return {
                success: true,
                invoiceId: data.invoiceId as string | undefined,
                redirectUrl: data.redirectUrl as string | undefined,
                clientSecret: data.clientSecret as string | undefined,
                gateway: data.gateway as string | undefined,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            errorHandler.handle(error, 'PaymentService.createInvoice');
            loggers.payment.error('createInvoice failed', { error: message });
            return { success: false, error: message };
        }
    }

    /**
     * @deprecated Use createInvoice() instead — this method is SpaceRemit-only.
     * Kept for backward compatibility during migration.
     * 
     * Initiate Payment Transaction (Redirect Flow)
     */
    public async initiatePayment(payload: PaymentInitPayload): Promise<PaymentResult<PaymentSession>> {
        // 1. Validate Public Key Format FIRST
        const publicKey = env.SPACEREMIT_PUBLIC_KEY;

        // Debug logging (only in development via logger)
        loggers.payment.debug('Initiating payment', {
            hasPublicKey: !!publicKey,
            keyLength: publicKey?.length,
            keyPrefix: publicKey?.substring(0, 4)
        });

        if (!publicKey) {
            loggers.payment.error('SpaceRemit Public Key is not configured');
            return {
                success: false,
                error: {
                    code: 'MISSING_PUBLIC_KEY',
                    message: 'Payment gateway is not configured. Please contact support.',
                    messageAr: 'بوابة الدفع غير مُكوَّنة. يرجى الاتصال بالدعم.'
                }
            };
        }

        // Validate key format - SpaceRemit keys can start with pk, pk_, sb, or sb_
        // The key format is flexible to accommodate different SpaceRemit key formats
        // Note: 'sk' prefix is for secret keys and should NOT be used client-side
        const isValidFormat = publicKey.length >= 20 && (
            publicKey.startsWith('pk') ||
            publicKey.startsWith('sb')
        );
        if (!isValidFormat) {
            loggers.payment.error('Invalid SpaceRemit Public Key format', {
                keyLength: publicKey.length,
                keyPrefix: publicKey.substring(0, 4)
            });
            return {
                success: false,
                error: {
                    code: 'INVALID_PUBLIC_KEY_FORMAT',
                    message: 'Invalid payment gateway configuration. Key format is invalid.',
                    messageAr: 'تكوين بوابة الدفع غير صالح. تنسيق المفتاح غير صحيح.'
                }
            };
        }

        loggers.payment.debug('Public key validation passed');

        // 2. Create payment record in database
        const transactionId = this.generateTransactionId();
        loggers.payment.debug('Creating payment record', { transactionId });

        const recordResult = await this.createPaymentRecord(payload, transactionId);

        if (!recordResult.success) {
            // When success is false, we know error exists
            const failedResult = recordResult as { success: false; error: { code: string; message: string; messageAr?: string } };
            const errorMsg = failedResult.error?.messageAr || failedResult.error?.message || 'Failed to create payment record';
            loggers.payment.error('Failed to create payment record', { error: errorMsg });
            return recordResult as PaymentResult<PaymentSession>;
        }

        loggers.payment.info('Payment record created', { transactionId });

        try {
            // 3. Build Redirect URL
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const checkoutParams = new URLSearchParams({
                k: env.SPACEREMIT_PUBLIC_KEY ?? '',
                amount: payload.amount.toString(),
                currency: payload.currency,
                way: 'card', // Required by SpaceRemit
                notes: `Order #${payload.orderId}`,
                email: payload.email,
                customer_email: payload.email,
                customer_name: payload.customerName,
                reference_id: transactionId,
                product_name: payload.productName,
                success_url: `${origin}/success?txn=${transactionId}`,
                cancel_url: `${origin}/cancel?txn=${transactionId}`,
            });

            const checkoutUrl = `${env.SPACEREMIT_API_URL.replace('/api/v2', '')}/apipay-v2/?${checkoutParams.toString()}`;

            loggers.payment.info('Redirecting to SpaceRemit', {
                transactionId,
                amount: payload.amount,
                checkoutUrl
            });

            console.log('🔗 SpaceRemit Checkout URL:', checkoutUrl);
            console.log('📦 Transaction ID:', transactionId);

            // 3. Start Polling (in case user comes back to this tab or opens new one)
            this.startTransactionPolling(transactionId, payload.userId);

            // 4. Redirect with a small delay to allow state update
            setTimeout(() => {
                console.log('🚀 Redirecting to SpaceRemit...');
                window.location.href = checkoutUrl;
            }, 500);

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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errorHandler.handle(error, 'PaymentService.initiatePayment');

            loggers.payment.error('Payment initiation failed', {
                error: errorMessage,
                transactionId,
                payload: {
                    amount: payload.amount,
                    currency: payload.currency,
                    email: payload.email,
                    productId: payload.productId
                }
            });

            return {
                success: false,
                error: {
                    code: 'PAYMENT_INIT_FAILED',
                    message: `Payment gateway error: ${errorMessage}`,
                    messageAr: `خطأ في بوابة الدفع: ${errorMessage}`
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
                    paidAt: data.updated_at,
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
