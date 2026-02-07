/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🚀 MR. X STEROID - ENTERPRISE PAYMENT SERVICE                           ║
 * ║  SpaceRemit Gateway Integration                                          ║
 * ║  يدعم العربية والإنجليزية                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { supabase } from '../lib/supabase';
import { errorHandler } from '../lib/error-handler';
import { loggers } from '../utils/logger';

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
//                         SPACEREMIT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    SPACEREMIT_API_URL: 'https://spaceremit.com/api/v2',
    CALLBACK_URL: import.meta.env.VITE_SPACEREMIT_CALLBACK_URL || 'https://mrxsteroid.vercel.app/api/payments/callback',
    SUCCESS_URL: import.meta.env.VITE_PAYMENT_SUCCESS_URL || `${window.location.origin}/payment-success`,
    CANCEL_URL: import.meta.env.VITE_PAYMENT_CANCEL_URL || `${window.location.origin}/payment-cancel`,
    PUBLIC_KEY: import.meta.env.VITE_SPACEREMIT_PUBLIC_KEY,
    IS_TEST: import.meta.env.MODE === 'development',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
//                          PAYMENT SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class PaymentService {
    private static instance: PaymentService;
    private publicKey: string;
    private isInitialized: boolean = false;
    private pendingTransactions: Map<string, NodeJS.Timeout> = new Map();

    private constructor() {
        this.publicKey = CONFIG.PUBLIC_KEY || '';

        if (!this.publicKey) {
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
     * Initialize SpaceRemit SDK Script
     * تهيئة سكريبت SpaceRemit
     */
    public async initialize(): Promise<boolean> {
        if (this.isInitialized && window.SpaceRemit) return true;

        // Reset flag
        this.isInitialized = false;

        return new Promise((resolve) => {
            // 1. Check if global object is already available
            if (window.SpaceRemit) {
                this.isInitialized = true;
                resolve(true);
                return;
            }

            // Function to load fresh script
            const loadFreshScript = () => {
                const script = document.createElement('script');
                script.src = 'https://spaceremit.com/api/v2/js_script/spaceremit.js';
                // Use synchronous loading if possible or async
                script.async = true;
                script.crossOrigin = 'anonymous';

                const timeoutId = setTimeout(() => {
                    if (!this.isInitialized) {
                        loggers.payment.error('SpaceRemit SDK network request timeout (20s)');
                        resolve(false);
                    }
                }, 20000);

                script.onload = () => {
                    clearTimeout(timeoutId);

                    // Poll for SpaceRemit object availability (up to 5 seconds)
                    let attempts = 0;
                    const maxChecks = 50; // 50 * 100ms = 5000ms

                    const checkSdk = setInterval(() => {
                        attempts++;
                        if (window.SpaceRemit) {
                            clearInterval(checkSdk);
                            this.isInitialized = true;
                            loggers.payment.info('SpaceRemit SDK Loaded Successfully');
                            resolve(true);
                        } else if (attempts >= maxChecks) {
                            clearInterval(checkSdk);
                            loggers.payment.error('SpaceRemit SDK script loaded but window.SpaceRemit undefined (timeout)');
                            resolve(false);
                        }
                    }, 100);
                };

                script.onerror = (error) => {
                    clearTimeout(timeoutId);
                    loggers.payment.error('Failed to load SpaceRemit SDK script', error);
                    resolve(false);
                };

                document.head.appendChild(script);
            };

            // 2. Check if script tag already exists (stuck loading?)
            const existingScript = document.querySelector('script[src*="spaceremit.js"]');
            if (existingScript) {
                // Poll existing script for 3 seconds
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    if (window.SpaceRemit) {
                        clearInterval(checkInterval);
                        this.isInitialized = true;
                        resolve(true);
                    } else if (attempts++ > 30) { // 3 seconds
                        clearInterval(checkInterval);
                        loggers.payment.warn('Existing SpaceRemit script stuck. Removing and reloading...');
                        existingScript.remove();
                        loadFreshScript();
                    }
                }, 100);
            } else {
                // 3. Load fresh
                loadFreshScript();
            }
        });
    }

    /**
     * Generate Unique Transaction Reference
     * إنشاء معرف فريد للمعاملة
     */
    private generateTransactionId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 10);
        return `mrx_${timestamp}_${random}`.toUpperCase();
    }

    /**
     * Create Payment Record in Database
     * إنشاء سجل الدفع في قاعدة البيانات
     */
    private async createPaymentRecord(payload: PaymentInitPayload, transactionId: string): Promise<PaymentResult<{ paymentId: string }>> {
        try {
            // First attempt with all fields
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

            // If it fails specifically because restricted column 'currency' is missing
            if (error && (error.message.includes('currency') || error.code === '42703')) {
                loggers.payment.warn('Currency column missing in payments table, falling back...');
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
     * Initiate Payment Transaction
     * بدء عملية الدفع
     */
    public async initiatePayment(payload: PaymentInitPayload): Promise<PaymentResult<PaymentSession>> {
        // Ensure SDK is loaded
        const sdkLoaded = await this.initialize();
        if (!sdkLoaded) {
            return {
                success: false,
                error: {
                    code: 'SDK_LOAD_FAILED',
                    message: 'Payment gateway unavailable. Please try again.',
                    messageAr: 'بوابة الدفع غير متاحة. يرجى المحاولة مرة أخرى.'
                }
            };
        }

        const transactionId = this.generateTransactionId();

        // Create payment record in database first
        const recordResult = await this.createPaymentRecord(payload, transactionId);
        if (!recordResult.success) {
            return recordResult as PaymentResult<PaymentSession>;
        }

        try {
            // Store session for polling
            this.startTransactionPolling(transactionId, payload.userId);

            // Invoke SpaceRemit Payment Widget
            if (window.SpaceRemit) {
                window.SpaceRemit.Pay({
                    amount: payload.amount,
                    currency: payload.currency,
                    email: payload.email,
                    customer_email: payload.email,
                    customer_name: payload.customerName,
                    publicKey: this.publicKey,
                    productName: payload.productName,
                    productDescription: `Order #${payload.orderId}`,
                    referenceId: transactionId,
                    metadata: {
                        ...payload.metadata,
                        orderId: payload.orderId,
                        userId: payload.userId,
                        locale: payload.locale
                    },
                    success_url: `${CONFIG.SUCCESS_URL}?txn=${transactionId}`,
                    cancel_url: `${CONFIG.CANCEL_URL}?txn=${transactionId}`
                });

                return {
                    success: true,
                    data: {
                        sessionId: transactionId,
                        checkoutUrl: '', // SpaceRemit handles redirect
                        transactionId: transactionId,
                        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min expiry
                    }
                };
            } else {
                // SpaceRemit still not available after SDK loaded
                loggers.payment.error('SpaceRemit.Pay not available after initialization', {
                    publicKeyExists: !!this.publicKey,
                    windowSpaceRemit: typeof window.SpaceRemit
                });
                throw new Error('SpaceRemit payment widget not available. Please refresh the page and try again.');
            }
        } catch (error) {
            errorHandler.handle(error, 'PaymentService.initiatePayment');

            // Update payment record to failed
            // @ts-expect-error - Supabase query builder deep type instantiation
            await (supabase
                .from('payments')
                .update({ status: 'failed', error_message: (error as Error).message })
                .eq('transaction_id', transactionId) as Promise<unknown>);

            return {
                success: false,
                error: {
                    code: 'PAYMENT_INIT_FAILED',
                    message: 'Failed to initialize payment. Please try again.',
                    messageAr: 'فشل في بدء عملية الدفع. يرجى المحاولة مرة أخرى.'
                }
            };
        }
    }

    /**
     * Start polling for transaction status
     * بدء الاستقصاء عن حالة المعاملة
     */
    private startTransactionPolling(transactionId: string, userId?: string) {
        // Clear any existing polling for this transaction
        this.stopTransactionPolling(transactionId);

        let attempts = 0;
        const maxAttempts = 60; // 5 minutes with 5s intervals

        const interval = setInterval(async () => {
            attempts++;

            if (attempts >= maxAttempts) {
                this.stopTransactionPolling(transactionId);
                return;
            }

            const status = await this.checkTransactionStatus(transactionId);

            if (status.success && status.data.status !== 'pending') {
                this.stopTransactionPolling(transactionId);

                // MCP Integration: Log successful payment
                if (status.data.status === 'completed' && userId) {
                    try {
                        const { logPaymentSuccess } = await import('../lib/mcp/integration');
                        logPaymentSuccess(userId, transactionId, status.data.amount, status.data.currency);
                    } catch (err) {
                        loggers.payment.error('Failed to log payment to MCP', err);
                    }
                }

                // Dispatch custom event for UI update
                window.dispatchEvent(new CustomEvent('paymentStatusChanged', {
                    detail: { transactionId, status: status.data.status, userId }
                }));
            }
        }, 5000);

        this.pendingTransactions.set(transactionId, interval);
    }

    /**
     * Stop transaction polling
     */
    private stopTransactionPolling(transactionId: string) {
        const interval = this.pendingTransactions.get(transactionId);
        if (interval) {
            clearInterval(interval);
            this.pendingTransactions.delete(transactionId);
        }
    }

    /**
     * Check Transaction Status from Database
     * التحقق من حالة المعاملة من قاعدة البيانات
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
        } catch (_error) {
            return {
                success: false,
                error: {
                    code: 'STATUS_CHECK_FAILED',
                    message: 'Failed to check payment status',
                    messageAr: 'فشل في التحقق من حالة الدفع'
                }
            };
        }
    }

    /**
     * Get User's Payment History
     * الحصول على سجل مدفوعات المستخدم
     */
    public async getUserPayments(userId: string): Promise<PaymentResult<PaymentStatus[]>> {
        try {
            // @ts-expect-error - Supabase query builder deep type instantiation
            const { data, error } = await (supabase
                .from('payments')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }) as Promise<{ data: Array<{ transaction_id: string; status: string; amount: number; currency: string; paid_at: string | null }>; error: Error | null }>);

            if (error) throw error;

            return {
                success: true,
                data: data.map(p => ({
                    transactionId: p.transaction_id,
                    status: p.status as PaymentStatus['status'],
                    amount: p.amount,
                    currency: p.currency,
                    paidAt: p.paid_at ?? undefined
                }))
            };
        } catch (_error) {
            return {
                success: false,
                error: {
                    code: 'HISTORY_FETCH_FAILED',
                    message: 'Failed to fetch payment history',
                    messageAr: 'فشل في جلب سجل المدفوعات'
                }
            };
        }
    }

    /**
     * Handle SpaceRemit Successful Payment Callback (Client-side)
     * معالجة رد الاستدعاء الناجح من SpaceRemit (جانب العميل)
     */
    public handleSuccessCallback(spaceremitCode: string): void {
        // This is called automatically by SpaceRemit via SP_SUCCESSFUL_PAYMENT
        loggers.payment.info('Payment Success Callback', spaceremitCode);

        // The actual verification happens server-side via the API callback
        // Here we just trigger UI updates
        window.dispatchEvent(new CustomEvent('paymentSuccess', {
            detail: { code: spaceremitCode }
        }));
    }

    /**
     * Cancel/Cleanup pending transaction
     * إلغاء/تنظيف معاملة معلقة
     */
    public async cancelTransaction(transactionId: string): Promise<void> {
        this.stopTransactionPolling(transactionId);

        // @ts-expect-error - Supabase query builder deep type instantiation
        await (supabase
            .from('payments')
            .update({ status: 'cancelled' })
            .eq('transaction_id', transactionId)
            .eq('status', 'pending') as Promise<unknown>);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//                       GLOBAL SPACEREMIT CALLBACK HANDLER
// ═══════════════════════════════════════════════════════════════════════════

// SpaceRemit automatically calls this function on successful payment
declare global {
    interface Window {
        SP_SUCCESSFUL_PAYMENT?: (spaceremitCode: string) => void;
    }
}

// Register global callback handler
if (typeof window !== 'undefined') {
    window.SP_SUCCESSFUL_PAYMENT = (spaceremitCode: string) => {
        PaymentService.getInstance().handleSuccessCallback(spaceremitCode);
    };
}

// ═══════════════════════════════════════════════════════════════════════════
//                              EXPORT SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export const paymentService = PaymentService.getInstance();
export default PaymentService;
