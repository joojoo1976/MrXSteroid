
export interface TwilioMessage {
    sid: string;
    body: string;
    to: string;
    from: string;
    status: 'queued' | 'sending' | 'sent' | 'failed' | 'delivered' | 'undelivered';
}

export interface TwilioResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
