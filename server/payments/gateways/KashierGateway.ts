import crypto from "crypto";
import type { VercelRequest } from "./vercel-types";
import type {
    IPaymentGateway,
    GatewayName,
    CreateInvoiceParams,
    CreateInvoiceResult,
    WebhookVerificationResult,
    PaymentDetailedStatus
} from "./IPaymentGateway";
import { resolveKashierPaymentOutcome } from "./kashierVerification";
import { getMerchantConfig, BlockedGateError } from "../merchantResolver";

export type MerchantType = "egypt" | "global";

export interface KashierConfig {
    merchantId: string;
    paymentApiKey: string;
    /** Rotation: secondary Payment API Key (v5.1 §4.4). HMAC verification tries primary then secondary. */
    paymentApiKeySecondary?: string;
    secretKey: string;
    /** Rotation: secondary Secret Key. Outbound session calls retry with it on 401/403. */
    secretKeySecondary?: string;
    mode: "test" | "live";
    currency: string;
    merchantType: MerchantType;
    webhookUrl?: string;
}

export interface KashierPaymentSessionResponse {
    sessionId: string;
    sessionUrl: string;
    orderId?: string;
    amount?: number;
    currency?: string;
    status?: string;
}

export class KashierGateway implements IPaymentGateway {
    public readonly config: KashierConfig;

    constructor(merchantType: MerchantType) {
        const resolved = getMerchantConfig(merchantType === "egypt" ? "EGYPT" : "GLOBAL");

        this.config = {
            merchantId: resolved.merchantId,
            paymentApiKey: resolved.secrets.paymentApiKey.primary,
            paymentApiKeySecondary: resolved.secrets.paymentApiKey.secondary,
            secretKey: resolved.secrets.secretKey.primary,
            secretKeySecondary: resolved.secrets.secretKey.secondary,
            mode: resolved.mode,
            currency: resolved.currency,
            merchantType,
            webhookUrl: resolved.webhookUrl,
        };
    }

    getGatewayName(): GatewayName {
        return this.config.merchantType === "egypt" ? "KASHIER_EGYPT" : "KASHIER_GLOBAL";
    }

    /**
     * Resolves the official Kashier API host based on environment mode.
     */
    private getApiBaseUrl(): string {
        return this.config.mode === "live"
            ? "https://api.kashier.io"
            : "https://test-api.kashier.io";
    }

    /**
     * Creates a hosted payment session using the official Kashier Payment Sessions API:
     * POST /v3/payment/sessions
     */
    async createPaymentSession(params: {
        orderId: string;
        amount: number;
        currency: string;
        customerEmail?: string;
        customerName?: string;
    }): Promise<KashierPaymentSessionResponse> {
        this.assertCredentials();
        const host = this.getApiBaseUrl();
        const endpoint = `${host}/v3/payment/sessions`;

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mrxsteroid.com";
        const returnUrl = `${siteUrl}/api/payments/callback?txn=${encodeURIComponent(params.orderId)}`;
        const webhookUrl = this.config.webhookUrl || `${siteUrl}/api/payments/webhook`;

        const payload = {
            merchantId: this.config.merchantId,
            orderId: params.orderId,
            amount: params.amount.toFixed(2),
            currency: params.currency,
            merchantRedirect: returnUrl,
            webhookUrl,
            customer: {
                name: params.customerName || "Customer",
                email: params.customerEmail || "customer@example.com",
            },
            display: "en",
        };

        try {
            // Secret rotation (v5.1 §4.4): try primary secret; on 401/403 retry with secondary.
            for (const secretKey of [this.config.secretKey, this.config.secretKeySecondary].filter(Boolean) as string[]) {
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${secretKey}`,
                        "api-key": this.config.paymentApiKey,
                    },
                    body: JSON.stringify(payload),
                    signal: AbortSignal.timeout(3000),
                });

                if (res.ok) {
                    const data = await res.json();
                    const sessionUrl = data.sessionUrl || data.checkoutUrl || data.url;
                    const sessionId = data.sessionId || data.id || params.orderId;
                    if (sessionUrl) {
                        return {
                            sessionId,
                            sessionUrl,
                            orderId: params.orderId,
                            amount: params.amount,
                            currency: params.currency,
                            status: data.status || "ACTIVE",
                        };
                    }
                    break;
                }
                if (res.status !== 401 && res.status !== 403) break;
            }
        } catch (err) {
            console.warn(`[KashierGateway] Session API call failed, using signed checkout redirect fallback:`, err);
        }

        // Fallback to official Kashier hosted redirect with HMAC-SHA256 signature
        const amountStr = params.amount.toFixed(2);
        const signaturePayload = `${this.config.merchantId}${params.orderId}${amountStr}${params.currency}`;
        const hash = crypto.createHmac("sha256", this.config.paymentApiKey).update(signaturePayload).digest("hex");

        const qs = new URLSearchParams({
            merchantId: this.config.merchantId,
            orderId: params.orderId,
            amount: amountStr,
            currency: params.currency,
            hash,
            mode: this.config.mode,
            merchantRedirect: returnUrl,
            webhookUrl,
            display: "en",
            allowedMethods: "card",
            customerName: params.customerName || "",
            customerEmail: params.customerEmail || "",
        });

        const fallbackUrl = `https://checkout.kashier.io/?${qs.toString()}`;
        return {
            sessionId: params.orderId,
            sessionUrl: fallbackUrl,
            orderId: params.orderId,
            amount: params.amount,
            currency: params.currency,
            status: "FALLBACK_REDIRECT",
        };
    }

    /**
     * Verifies payment session status via official Kashier API:
     * GET /v3/payment/sessions/:sessionId/payment
     */
    async verifyPaymentSession(sessionId: string): Promise<Record<string, unknown> | null> {
        this.assertCredentials();
        const host = this.getApiBaseUrl();
        const endpoint = `${host}/v3/payment/sessions/${encodeURIComponent(sessionId)}/payment`;

        try {
            // Secret rotation (v5.1 §4.4): try primary secret; on 401/403 retry with secondary.
            for (const secretKey of [this.config.secretKey, this.config.secretKeySecondary].filter(Boolean) as string[]) {
                const res = await fetch(endpoint, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                        "api-key": this.config.paymentApiKey,
                    },
                });

                if (res.ok) {
                    return await res.json();
                }
                if (res.status !== 401 && res.status !== 403) break;
            }
        } catch (err) {
            console.error(`[KashierGateway] verifyPaymentSession error:`, err);
        }
        return null;
    }

    /**
     * IPaymentGateway implementation of createInvoice
     */
    async createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult> {
        this.assertCredentials();
        const session = await this.createPaymentSession({
            orderId: params.invoiceId,
            amount: params.amount,
            currency: this.config.currency,
            customerEmail: params.metadata.email,
            customerName: params.metadata.fullName,
        });

        return {
            redirectUrl: session.sessionUrl,
            externalReferenceId: params.invoiceId,
            providerOrderId: session.sessionId,
        };
    }

    /**
     * IPaymentGateway implementation of verifyWebhook.
     * Validates HMAC-SHA256 signature using sorted signatureKeys and timingSafeEqual.
     * Evaluates final outcome using resolveKashierPaymentOutcome layer.
     */
    async verifyWebhook(_req: VercelRequest, rawBody: string): Promise<WebhookVerificationResult> {
        if (!rawBody || rawBody.trim() === "") {
            return { valid: false, errorMessage: "[KashierGateway] Empty webhook body" };
        }

        let payload: Record<string, unknown>;
        try {
            payload = JSON.parse(rawBody) as Record<string, unknown>;
        } catch {
            return { valid: false, errorMessage: "[KashierGateway] Invalid JSON body" };
        }

        const signature = String(payload.signature || "");
        const signatureKeys = String(payload.signatureKeys || "");
        const merchantId = String(payload.merchantId || "");

        if (!signature || !signatureKeys) {
            return { valid: false, errorMessage: "[KashierGateway] Missing signature or signatureKeys" };
        }

        // Cross-account validation
        if (merchantId && merchantId !== this.config.merchantId) {
            return {
                valid: false,
                errorMessage: `[KashierGateway:${this.config.merchantType}] Merchant ID mismatch: expected ${this.config.merchantId}, got ${merchantId}`,
                merchantId,
            };
        }

        // 1. Sort signatureKeys and construct payload string
        const fieldNames = signatureKeys.split(",").map((k: string) => k.trim()).sort();
        const signatureParts: string[] = [];
        for (const f of fieldNames) {
            const val = payload[f];
            if (val !== undefined && val !== null) {
                signatureParts.push(`${f}=${val}`);
            }
        }
        const signatureInput = signatureParts.join("&");

        // Signature rotation (v5.1 §4.4): HMAC keyed with Payment API Key — try primary then secondary.
        const signaturesMatch = this.signatureMatches(signatureInput, signature);

        if (!signaturesMatch) {
            console.error(`[KashierGateway:${this.config.merchantType}] Signature mismatch.`);
            return {
                valid: false,
                errorMessage: "[KashierGateway] HMAC signature verification failed",
                merchantId,
            };
        }

        // 2. Resolve outcome with Kashier Verification Layer
        const resolution = resolveKashierPaymentOutcome(payload);
        const rawInvoiceId = payload.orderId || payload.merchantOrderId;
        const invoiceId = rawInvoiceId ? String(rawInvoiceId) : undefined;
        const paidAmount = payload.amount ? parseFloat(String(payload.amount)) : undefined;
        const transactionId = String(payload.transactionId || invoiceId || "");

        let mappedStatus: "success" | "failed" | undefined;
        let detailedStatus: PaymentDetailedStatus = "UNKNOWN";

        switch (resolution.outcome) {
            case "SUCCESS":
                mappedStatus = "success";
                detailedStatus = (resolution.detailedStatus as PaymentDetailedStatus) || "APPROVED";
                break;
            case "FAILURE":
                mappedStatus = "failed";
                detailedStatus = (resolution.detailedStatus as PaymentDetailedStatus) || "DECLINED";
                break;
            case "EXPIRED":
                mappedStatus = "failed";
                detailedStatus = "EXPIRED_CARD";
                break;
            case "PENDING":
                mappedStatus = undefined;
                detailedStatus = "AUTHORIZED";
                break;
            case "UNKNOWN":
            default:
                mappedStatus = undefined;
                detailedStatus = resolution.detailedStatus === "TIMED_OUT" ? "TIMED_OUT" : "UNKNOWN";
                break;
        }

        console.log(
            `[KashierGateway:${this.config.merchantType}] Verified: invoice=${invoiceId}, outcome=${resolution.outcome} (${resolution.reason})`
        );

        return {
            valid: true,
            invoiceId,
            status: mappedStatus,
            detailedStatus,
            externalReferenceId: transactionId,
            paidAmount,
            merchantId,
        };
    }

    private assertCredentials(): void {
        if (!this.config.merchantId || !this.config.paymentApiKey || !this.config.secretKey) {
            throw new Error(`[KashierGateway:${this.config.merchantType}] Missing credentials.`);
        }

        // Final Gate v4 N-13: Server-side Release Kill Switch — blocked register item.
        if (this.config.mode === 'live' && process.env.KASHIER_LIVE_ENABLED !== 'true') {
            throw new BlockedGateError(
                'N-13 KASHIER_LIVE_ENABLED',
                `[KashierGateway:${this.config.merchantType}] Live mode is blocked by Owner Kill Switch (KASHIER_LIVE_ENABLED=false). Production traffic requires explicit owner activation.`
            );
        }
    }

    /**
     * Constant-time HMAC comparison against all rotation candidates for the
     * Payment API Key (primary first, then secondary if configured).
     */
    private signatureMatches(signatureInput: string, receivedSignature: string): boolean {
        const keys = [this.config.paymentApiKey, this.config.paymentApiKeySecondary].filter(Boolean) as string[];
        for (const key of keys) {
            const computedHmac = crypto.createHmac("sha256", key).update(signatureInput).digest("hex");
            try {
                const expectedBuf = Buffer.from(computedHmac, "hex");
                const receivedBuf = Buffer.from(receivedSignature, "hex");
                if (expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
                    return true;
                }
            } catch {
                // malformed signature hex — continue with next rotation candidate
            }
        }
        return false;
    }
}