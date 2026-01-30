
export interface SpaceRemitTransaction {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    customer_email: string;
    payment_method?: string;
    created_at: string;
    reference: string;
}

export interface SpaceRemitResponse<T> {
    success: boolean;
    data: T;
    error?: {
        code: string;
        message: string;
    };
}

export type InitiatePaymentPayload = {
    amount: number;
    currency: string;
    email: string;
    callback_url: string;
    metadata?: Record<string, unknown>;
};
