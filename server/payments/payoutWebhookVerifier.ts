import crypto from 'crypto';

export interface PayoutWebhookVerificationParams {
    signatureKeys: string | string[];
    payload: Record<string, unknown>;
    signature: string;
    transferApiKey: string;
    expectedMerchantId?: string | string[];
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
 *
 * Kashier documents the transfer signature input as, for a single transfer:
 *   merchantTransferId=...&method=...&amount=...&merchantId=...&status=...
 * and for a batch:
 *   merchantBatchId=...&batchId=...&method=...&amount=...&merchantId=...&status=...
 * A payload is therefore only authentic once the HMAC matches AND the signed
 * merchantId belongs to this deployment.
 */
export function buildPayoutSignatureInput(params: {
    signatureKeys: string | string[];
    payload: Record<string, unknown>;
}): string {
    const { signatureKeys, payload } = params;
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
    return parts.join('&');
}

export function verifyKashierPayoutWebhookSignature(params: PayoutWebhookVerificationParams): boolean {
    const { signatureKeys, payload, signature, transferApiKey, expectedMerchantId } = params;
    if (!signature || !signatureKeys || !transferApiKey) {
        return false;
    }

    // Cross-account guard: a valid HMAC proves the payload was produced by
    // Kashier, not that it was produced for THIS merchant. Reject any signed
    // merchantId we do not own before accepting the event.
    if (expectedMerchantId) {
        const signedMerchantId = String(payload.merchantId ?? '').trim();
        const allowed = (Array.isArray(expectedMerchantId) ? expectedMerchantId : [expectedMerchantId])
            .map((m) => String(m).trim())
            .filter(Boolean);
        if (allowed.length > 0 && (!signedMerchantId || !allowed.includes(signedMerchantId))) {
            return false;
        }
    }

    const dataString = buildPayoutSignatureInput({ signatureKeys, payload });
    if (!dataString) {
        return false;
    }

    const computedSignature = crypto
        .createHmac('sha256', transferApiKey)
        .update(dataString)
        .digest('hex');

    const expected = Buffer.from(computedSignature, 'utf8');
    const received = Buffer.from(String(signature), 'utf8');
    if (expected.length !== received.length) {
        return false;
    }
    return crypto.timingSafeEqual(expected, received);
}

/**
 * The header is the authoritative signature source. The docs place it in
 * `x-kashier-signature`; a value carried inside the body is not covered by
 * that header's HMAC, so it is never accepted as an alternative.
 */
export function readPayoutSignatureHeader(
    headerValue: string | null | undefined,
    _payload: Record<string, unknown>
): string {
    return String(headerValue ?? '').trim();
}
