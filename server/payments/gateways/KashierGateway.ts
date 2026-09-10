import crypto from "crypto";
import type { VercelRequest } from "./vercel-types";
import type { IPaymentGateway, GatewayName, CreateInvoiceParams, CreateInvoiceResult, WebhookVerificationResult, PaymentDetailedStatus } from "./IPaymentGateway";

type MerchantType = "egypt" | "global";

interface KashierConfig {
    merchantId: string;
    paymentApiKey: string;
    secretKey: string;
    mode: "test" | "live";
    currency: string;
    merchantType: MerchantType;
}

interface KashierWebhookPayload {
    orderId?: string;
    merchantOrderId?: string;
    merchantId?: string;
    amount?: string;
    currency?: string;
    transactionId?: string;
    orderStatus?: string;
    signature?: string;
    signatureKeys?: string;
    [key: string]: string | undefined;
}

function mapKashierStatus(orderStatus: string): { status: "success" | "failed" | undefined; detailedStatus: PaymentDetailedStatus } {
    const s = orderStatus.toUpperCase();
    switch (s) {
        case "APPROVED": case "SUCCESS": return { status: "success", detailedStatus: "APPROVED" };
        case "DECLINED": case "DECLINED_BY_BANK": return { status: "failed", detailedStatus: "DECLINED" };
        case "EXPIRED_CARD": return { status: "failed", detailedStatus: "EXPIRED_CARD" };
        case "TIMED_OUT": case "TIMEOUT": return { status: undefined, detailedStatus: "TIMED_OUT" };
        case "ACQUIRER_SYSTEM_ERROR": case "ACQUIRER_ERROR": return { status: "failed", detailedStatus: "ACQUIRER_SYSTEM_ERROR" };
        case "UNSPECIFIED_FAILURE": case "FAILURE": case "FAILED": return { status: "failed", detailedStatus: "UNSPECIFIED_FAILURE" };
        case "UNKNOWN": return { status: undefined, detailedStatus: "UNKNOWN" };
        case "REFUNDED": return { status: "failed", detailedStatus: "REFUNDED" };
        case "VOIDED": return { status: "failed", detailedStatus: "VOIDED" };
        case "AUTHORIZED": return { status: undefined, detailedStatus: "AUTHORIZED" };
        case "CAPTURED": return { status: "success", detailedStatus: "CAPTURED" };
        default:
            console.warn("[KashierGateway] Unknown orderStatus: " + s + " - treating as UNKNOWN");
            return { status: undefined, detailedStatus: "UNKNOWN" };
    }
}

export class KashierGateway implements IPaymentGateway {
    private readonly config: KashierConfig;

    constructor(merchantType: MerchantType) {
        const rawMode = (process.env.KASHIER_MODE || "test").toLowerCase();
        const mode = (rawMode === "live" ? "live" : "test") as "test" | "live";
        const modePrefix = mode === "live" ? "KASHIER_LIVE" : "KASHIER_TEST";
        const legacyPrefix = merchantType === "egypt" ? "KASHIER_EGYPT" : "KASHIER_GLOBAL";

        // Prefer KASHIER_TEST_* / KASHIER_LIVE_* (new naming convention)
        // Fall back to KASHIER_EGYPT_* / KASHIER_GLOBAL_* (legacy naming)
        const merchantId =
            process.env[modePrefix + "_MERCHANT_ID"] ||
            process.env[legacyPrefix + "_MERCHANT_ID"] || "";
        const paymentApiKey =
            process.env[modePrefix + "_PAYMENT_API_KEY"] ||
            process.env[legacyPrefix + "_PAYMENT_API_KEY"] || "";
        const secretKey =
            process.env[modePrefix + "_SECRET_KEY"] ||
            process.env[legacyPrefix + "_SECRET_KEY"] || "";

        if (!merchantId || !paymentApiKey || !secretKey) {
            console.warn(
                "[KashierGateway] Missing credentials for mode: " + mode +
                ". Set " + modePrefix + "_MERCHANT_ID, " + modePrefix + "_PAYMENT_API_KEY, " + modePrefix + "_SECRET_KEY."
            );
        }
        this.config = { merchantId, paymentApiKey, secretKey, mode, currency: merchantType === "egypt" ? "EGP" : "USD", merchantType };
    }

    getGatewayName(): GatewayName {
        return this.config.merchantType === "egypt" ? "KASHIER_EGYPT" : "KASHIER_GLOBAL";
    }

    async createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult> {
        this.assertCredentials();
        const { merchantId, paymentApiKey, mode, currency } = this.config;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mrxsteroid.com";
        const returnUrl = siteUrl + "/api/payments/callback?txn=" + encodeURIComponent(params.invoiceId);
        const webhookUrl = siteUrl + "/api/payments/webhook";
        const amountStr = params.amount.toFixed(2);
        const signaturePayload = merchantId + params.invoiceId + amountStr + currency;
        const hash = crypto.createHmac("sha256", paymentApiKey).update(signaturePayload).digest("hex");
        const qs = new URLSearchParams({ merchantId, orderId: params.invoiceId, amount: amountStr, currency, hash, mode, merchantRedirect: returnUrl, webhookUrl, display: "en", allowedMethods: "card", description: "Mr. X Steroid - " + params.tierId, customerName: params.metadata.fullName || "", customerEmail: params.metadata.email || "" });
        const redirectUrl = "https://checkout.kashier.io/?" + qs.toString();
        console.log("[KashierGateway:" + this.config.merchantType + "] Created order " + params.invoiceId + ", amount: " + amountStr + " " + currency);
        return { redirectUrl, externalReferenceId: params.invoiceId, providerOrderId: params.invoiceId };
    }

    async verifyWebhook(_req: VercelRequest, rawBody: string): Promise<WebhookVerificationResult> {
        if (!rawBody || rawBody.trim() === "") return { valid: false, errorMessage: "[KashierGateway] Empty webhook body" };
        let payload: KashierWebhookPayload;
        try { payload = JSON.parse(rawBody) as KashierWebhookPayload; }
        catch { return { valid: false, errorMessage: "[KashierGateway] Invalid JSON body" }; }
        const { signature, signatureKeys, orderId, merchantOrderId, merchantId, orderStatus, amount, transactionId } = payload;
        if (!signature || !signatureKeys) return { valid: false, errorMessage: "[KashierGateway] Missing signature or signatureKeys" };
        if (merchantId && merchantId !== this.config.merchantId) {
            return { valid: false, errorMessage: "[KashierGateway:" + this.config.merchantType + "] Merchant ID mismatch: expected " + this.config.merchantId + ", got " + merchantId, merchantId };
        }
        const fieldNames = signatureKeys.split(",").map((k: string) => k.trim()).sort();
        const signatureParts: string[] = [];
        for (const f of fieldNames) {
            const val = payload[f];
            if (val !== undefined && val !== null) signatureParts.push(f + "=" + val);
        }
        const signatureInput = signatureParts.join("&");
        const computedHmac = crypto.createHmac("sha256", this.config.paymentApiKey).update(signatureInput).digest("hex");
        let signaturesMatch = false;
        try {
            const expectedBuf = Buffer.from(computedHmac, "hex");
            const receivedBuf = Buffer.from(signature, "hex");
            signaturesMatch = expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf);
        } catch { signaturesMatch = false; }
        if (!signaturesMatch) {
            console.error("[KashierGateway:" + this.config.merchantType + "] Signature mismatch.");
            return { valid: false, errorMessage: "[KashierGateway] HMAC signature verification failed", merchantId };
        }
        const invoiceId = orderId || merchantOrderId;
        if (!invoiceId) return { valid: true, errorMessage: "[KashierGateway] No orderId in payload", merchantId };
        const { status, detailedStatus } = mapKashierStatus(orderStatus || "");
        const paidAmount = amount ? parseFloat(amount) : undefined;
        console.log("[KashierGateway:" + this.config.merchantType + "] Verified. Invoice: " + invoiceId + ", Status: " + orderStatus + " -> " + detailedStatus);
        return { valid: true, invoiceId, status, detailedStatus, externalReferenceId: transactionId || invoiceId, paidAmount, merchantId };
    }

    private assertCredentials(): void {
        if (!this.config.merchantId || !this.config.paymentApiKey || !this.config.secretKey) {
            throw new Error("[KashierGateway:" + this.config.merchantType + "] Missing credentials.");
        }
    }
}