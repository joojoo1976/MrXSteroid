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
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    amount: number;
    currency: string;
    paidAt?: string;
    failureReason?: string;
}

export type PaymentResult<T> =
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string; messageAr?: string } };
