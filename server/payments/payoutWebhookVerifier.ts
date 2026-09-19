import crypto from 'crypto';

export interface PayoutWebhookVerificationParams {
    signatureKeys: string | string[];
    payload: Record<string, unknown>;
    signature: string;
    transferApiKey: string;
}

/**
 * Payout Webhook signature verification (Section 61.2):
 * 1. Read signatureKeys.
 * 2. Preserve their exact order.
 * 3. Do NOT sort them.
 * 4. Do NOT URL-encode the values.
 * 5. Concatenate key=value&key=value
 * 6. HMAC-SHA256 using dedicated Transfer API Key.
 * 7. Compare with x-kashier-signature using timingSafeEqual.
 */
export function verifyKashierPayoutWebhookSignature(params: PayoutWebhookVerificationParams): boolean {
    const { signatureKeys, payload, signature, transferApiKey } = params;
    if (!signature || !signatureKeys || !transferApiKey) {
        return false;
    }

    const keys = Array.isArray(signatureKeys)
        ? signatureKeys
        : String(signatureKeys).split(',').map(k => k.trim());

    const parts: string[] = [];
    for (const key of keys) {
        const val = payload[key];
        if (val !== undefined && val !== null) {
            parts.push(`${key}=${val}`);
        }
    }

    const dataString = parts.join('&');
    const computedSignature = crypto
        .createHmac('sha256', transferApiKey)
        .update(dataString)
        .digest('hex');

    try {
        return crypto.timingSafeEqual(
            Buffer.from(computedSignature, 'utf8'),
            Buffer.from(signature, 'utf8')
        );
    } catch {
        return false;
    }
}
