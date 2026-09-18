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
import { getMerchantConfig, BlockedGateError, type PaymentMethodId } from "../merchantResolver";
import { buildKashierSessionRequest } from "../checkout/sessionRequest";

export type MerchantType = "egypt" | "global";

/**
 * Thrown when the Kashier Payment Session API cannot mint a session.
 * Phase 4 makes the Payment Session the PRIMARY checkout mechanism (v5.1 §36);
 * we never silently fall back to a hardcoded payment URL.
 */
export class KashierSessionError extends Error {
    readonly status?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.name = 'KashierSessionError';
        this.status = status;
    }
}

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
    paymentMethods: PaymentMethodId[];
    defaultMethod: PaymentMethodId;
}

export interface CreateKashierSessionParams {
    /** Unique merchant order reference (K-2 C5). */
    orderRef: string;
    /** Payable amount in major units — resolved server-side only. */
    amount: number;
    currency: string;
    customerEmail?: string;
    customerName?: string;
    locale?: "ar" | "en";
    /** Overrides the region defaults when supplied. */
    paymentMethods?: PaymentMethodId[];
    defaultMethod?: PaymentMethodId;
    type?: string;
    expireAt?: string;
    maxFailureAttempts?: number;
    /** Per-merchant webhook override (defaults to the resolved merchant webhook). */
    serverWebhook?: string;
    merchantRedirect?: string;
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
            paymentMethods: resolved.paymentMethods,
            defaultMethod: resolved.defaultMethod,
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
     *
     * Final Gate v5.1 §36 — this is the PRIMARY ecommerce checkout mechanism.
     * Auth contract (K-2 A2/A3): Authorization = raw Secret Key (NOT a Bearer
     * token) · api-key = Payment API Key.
     * Payload carries all K-2 C4 required fields + the per-request `serverWebhook`
     * (K-2 C6). There is no hardcoded-URL fallback: a session must be minted by the
     * API so it stays linked to the internal Order/Invoice/PaymentIntent.
     */
    async createPaymentSession(params: CreateKashierSessionParams): Promise<KashierPaymentSessionResponse> {
        this.assertCredentials();
        const host = this.getApiBaseUrl();
        const endpoint = `${host}/v3/payment/sessions`;

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mrxsteroid.com";
        const returnUrl = params.merchantRedirect
            || `${siteUrl}/api/payments/callback?txn=${encodeURIComponent(params.orderRef)}`;
        const webhookUrl = params.serverWebhook || this.config.webhookUrl || `${siteUrl}/api/payments/webhook`;

        const payload = buildKashierSessionRequest({
            merchantId: this.config.merchantId,
            orderRef: params.orderRef,
            amount: params.amount,
            currency: params.currency || this.config.currency,
            merchantRedirect: returnUrl,
            serverWebhook: webhookUrl,
            customer: {
                name: params.customerName || "Customer",
                email: params.customerEmail || "customer@example.com",
            },
            display: params.locale || "en",
            paymentMethods: params.paymentMethods || this.config.paymentMethods,
            defaultMethod: params.defaultMethod || this.config.defaultMethod,
            type: params.type,
            expireAt: params.expireAt,
            maxFailureAttempts: params.maxFailureAttempts,
        });

        let lastStatus: number | undefined;
        let lastBody = "";

        // Secret rotation (v5.1 §4.4): try primary secret; on 401/403 retry with secondary.
        for (const secretKey of [this.config.secretKey, this.config.secretKeySecondary].filter(Boolean) as string[]) {
            let res: Response;
            try {
                res = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        // K-2 A2: raw Secret Key value — NOT `Bearer <key>`.
                        Authorization: secretKey,
                        "api-key": this.config.paymentApiKey,
                    },
                    body: JSON.stringify(payload),
                    signal: AbortSignal.timeout(10_000),
                });
            } catch (err) {
                throw new KashierSessionError(
                    `[KashierGateway:${this.config.merchantType}] Payment Session API unreachable: ${err instanceof Error ? err.message : String(err)}`
                );
            }

            if (res.ok) {
                const data = await res.json();
                const sessionUrl = data.sessionUrl || data.checkoutUrl || data.url;
                const sessionId = data.sessionId || data.id;
                if (!sessionUrl) {
                    throw new KashierSessionError(
                        `[KashierGateway:${this.config.merchantType}] Payment Session response missing sessionUrl.`
                    );
                }
                return {
                    sessionId: String(sessionId || params.orderRef),
                    sessionUrl: String(sessionUrl),
                    orderId: params.orderRef,
                    amount: params.amount,
                    currency: payload.currency,
                    status: data.status || "ACTIVE",
                };
            }

            lastStatus = res.status;
            lastBody = await res.text().catch(() => "");
            if (res.status !== 401 && res.status !== 403) break;

            console.warn(
                `[KashierGateway:${this.config.merchantType}] Session auth failed (${res.status}); trying secondary Secret Key if available.`
            );
        }

        throw new KashierSessionError(
            `[KashierGateway:${this.config.merchantType}] Payment Session creation failed (HTTP ${lastStatus ?? "n/a"})${lastBody ? `: ${lastBody.slice(0, 300)}` : ""}`,
            lastStatus
        );
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
            orderRef: params.invoiceId,
            amount: params.amount,
            currency: this.config.currency,
            customerEmail: params.metadata.email,
            customerName: params.metadata.fullName,
            locale: params.metadata.locale,
            paymentMethods: this.config.paymentMethods,
            defaultMethod: this.config.defaultMethod,
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