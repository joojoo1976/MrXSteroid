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
import { CANONICAL_PRODUCTS, type CanonicalProductId } from "../merchantResolver";

export interface FourthwallConfig {
    shopId: string;
    apiKey: string;
    webhookSecret: string;
    storefrontToken: string;
    shopDomain: string;
    baseUrl: string;
    storefrontBaseUrl: string;
}

export interface FourthwallProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    type: "digital" | "physical" | "membership" | "payment_page";
    variants?: FourthwallVariant[];
    digitalFiles?: FourthwallDigitalFile[];
}

export interface FourthwallVariant {
    id: string;
    name: string;
    price: number;
    sku?: string;
}

export interface FourthwallDigitalFile {
    id: string;
    name: string;
    url: string;
    size: number;
    mimeType: string;
}

export interface FourthwallCheckoutSession {
    id: string;
    url: string;
    status: "open" | "completed" | "expired" | "cancelled";
    productId: string;
    variantId?: string;
    customerEmail: string;
    amount: number;
    currency: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    completedAt?: string;
}

export interface FourthwallOrder {
    id: string;
    checkoutId: string;
    status: string;
    email?: string;
    amounts?: { total: number; currency: string };
    metadata?: Record<string, unknown>;
    digitalDelivery?: Array<{ fileName: string; downloadCount: number }>;
}

/**
 * ├──────────────────────────────────────────────────────────────────────────────
 * │ OFFICIAL FOURTHWALL CONTRACT (docs.fourthwall.com) — test-only alignment
 * ├──────────────────────────────────────────────────────────────────────────────
 * │ Auth        : HTTP Basic Auth for the Platform API (`/open-api/v1.0/...`);
 * │               `storefront_token` query param for the Storefront API.
 * │ Checkout    : No server-side "checkout session" endpoint exists. A Storefront
 * │               cart is created (POST /v1/carts) carrying affiliate + invoice
 * │               metadata, then the buyer is redirected to
 * │               https://{shop_domain}/cart/checkout?cartId=...&currency=USD.
 * │ Webhook sig : HMAC-SHA256 over the ENTIRE raw body, base64, in the single
 * │               `X-Fourthwall-Hmac-SHA256` header.
 * │ Envelope    : { testMode, id (dedup), webhookId, shopId, type, apiVersion,
 * │               createdAt, data }  —  data is the OrderV1 order object.
 * │ Statuses    : CONFIRMED / SHIPPED / DELIVERED / COMPLETED -> success;
 * │               CANCELLED -> failed; anything else -> fail closed.
 * └──────────────────────────────────────────────────────────────────────────────
 */
export class FourthwallGateway implements IPaymentGateway {
    private readonly config: FourthwallConfig;

    constructor() {
        this.config = {
            shopId: process.env.FOURTHWALL_SHOP_ID || "",
            apiKey: process.env.FOURTHWALL_API_KEY || "",
            webhookSecret: process.env.FOURTHWALL_WEBHOOK_SECRET || "",
            storefrontToken: process.env.FOURTHWALL_STOREFRONT_TOKEN || "",
            shopDomain: process.env.FOURTHWALL_SHOP_DOMAIN || "",
            baseUrl: "https://api.fourthwall.com",
            storefrontBaseUrl: "https://storefront-api.fourthwall.com",
        };
    }

    getGatewayName(): GatewayName {
        return "FOURTHWALL";
    }

    /**
     * Creates a Fourthwall checkout session (Storefront cart) and returns the
     * official redirect URL. GLOBAL/USD only — never falls back to Kashier.
     *
     * Fail-closed guards (in order):
     *   1. credentials present;
     *   2. currency is USD;
     *   3. tier is not an AUP-blocked service product;
     *   4. a real (non-placeholder) Fourthwall product/variant ID is configured;
     *   5. the exact canonical USD price is validated server-side.
     */
    async createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult> {
        this.assertCredentials();

        // GLOBAL/USD only. Fourthwall checkout is USD-denominated.
        if (params.currency !== "USD") {
            throw new Error(
                `[FourthwallGateway] Invalid currency: ${params.currency}. Fourthwall GLOBAL checkout is USD-only.`
            );
        }

        // AUP block — service-based products are not permitted on Fourthwall
        // (AUP §13: consulting explicitly prohibited; coaching is a delivered
        // service). Refuse before any API call.
        if (this.isBlockedServiceTier(params.tierId)) {
            throw new Error(
                `[FourthwallGateway] Tier "${params.tierId}" is a service-based product that is not permitted on Fourthwall (AUP §13). Blocked without written provider approval.`
            );
        }

        // Resolve the real product/variant mapping (never placeholders).
        const productMapping = this.resolveProductMapping(params.tierId);
        if (!productMapping?.fourthwallProductId) {
            throw new Error(
                `[FourthwallGateway] No verified Fourthwall product mapping for tier: ${params.tierId}. Refusing to use placeholder IDs.`
            );
        }

        // Server-side exact USD price validation against the canonical catalog.
        const canonical = this.resolveCanonicalProduct(params.tierId);
        const expected = canonical ? CANONICAL_PRODUCTS[canonical].globalAmount : undefined;
        if (typeof expected !== "number" || Math.abs(params.amount - expected) > 0.001) {
            throw new Error(
                `[FourthwallGateway] Amount ${params.amount} does not match the canonical USD price (${expected}) for tier ${params.tierId}.`
            );
        }

        // Create the Storefront cart. metadata is propagated to the order and
        // carries the invoice id + region for idempotency / affiliate attribution.
        const cartId = await this.createStorefrontCart({
            variantId: productMapping.fourthwallVariantId || productMapping.fourthwallProductId,
            metadata: {
                invoiceId: params.invoiceId,
                tierId: params.tierId,
                region: "GLOBAL",
                email: params.metadata.email,
                fullName: params.metadata.fullName,
            },
        });

        const redirectUrl = `https://${this.config.shopDomain}/cart/checkout?cartId=${encodeURIComponent(cartId)}&currency=USD`;

        return {
            redirectUrl,
            externalReferenceId: params.invoiceId,
            providerOrderId: canonical || undefined,
        };
    }

    /**
     * Verifies a Fourthwall webhook per the official contract:
     * HMAC-SHA256 over the raw body, base64, header `X-Fourthwall-Hmac-SHA256`.
     * Maps only documented successful order states to fulfillment; unknown or
     * not-yet-settled states fail closed. Exposes the event `id` as the dedup key.
     */
    async verifyWebhook(req: VercelRequest, rawBody: string): Promise<WebhookVerificationResult> {
        if (!rawBody || rawBody.trim() === "") {
            return { valid: false, errorMessage: "[FourthwallGateway] Empty webhook body" };
        }

        let payload: Record<string, unknown>;
        try {
            payload = JSON.parse(rawBody) as Record<string, unknown>;
        } catch {
            return { valid: false, errorMessage: "[FourthwallGateway] Invalid JSON body" };
        }

        const headers = req.headers || {};
        const signature = this.readHeader(headers, "x-fourthwall-hmac-sha256");
        if (!signature) {
            return {
                valid: false,
                errorMessage: "[FourthwallGateway] Missing X-Fourthwall-Hmac-SHA256 header",
            };
        }

        // Official signature: base64(HMAC-SHA256(webhookSecret, rawBody))
        const expected = crypto
            .createHmac("sha256", this.config.webhookSecret)
            .update(rawBody, "utf8")
            .digest("base64");

        const receivedBuffer = Buffer.from(signature, "base64");
        const expectedBuffer = Buffer.from(expected, "base64");
        if (
            receivedBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
        ) {
            console.error("[FourthwallGateway] Signature mismatch");
            return {
                valid: false,
                errorMessage: "[FourthwallGateway] HMAC signature verification failed",
            };
        }

        // Envelope
        const eventId = String(payload.id || "");
        const eventType = String(payload.type || "");
        const data = payload.data as Record<string, unknown> | undefined;
        if (!data) {
            return { valid: false, errorMessage: "[FourthwallGateway] Missing event data" };
        }

        const orderId = String(data.id || "");
        // Official OrderV1 uses `checkoutId` (not checkout_session_id).
        const checkoutId = String(data.checkoutId || data.checkout_session_id || "");
        const orderStatus = String(data.status || "").toUpperCase();

        // Amount from OrderV1 `amounts.total` (major units); currency from `amounts.currency`.
        const amounts = (data.amounts as { total?: unknown; currency?: unknown } | undefined) || {};
        const amountCurrency = String(amounts.currency || data.currency || "").toUpperCase();
        const amountRaw = amounts.total ?? data.amount;
        const paidAmount =
            typeof amountRaw === "number"
                ? amountRaw
                : typeof amountRaw === "string"
                    ? Number(amountRaw)
                    : Number.NaN;

        // Map only documented successful states; CANCELLED = refund/cancel failed;
        // everything else (IN_PRODUCTION, PARTIALLY_SHIPPED, unknown) -> fail closed.
        const SUCCESS_STATUSES = new Set(["CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED"]);
        let mappedStatus: "success" | "failed" | undefined;
        let detailedStatus: PaymentDetailedStatus = "UNKNOWN";

        if (SUCCESS_STATUSES.has(orderStatus)) {
            mappedStatus = "success";
            detailedStatus = "APPROVED";
        } else if (orderStatus === "CANCELLED") {
            mappedStatus = "failed";
            detailedStatus = "REFUNDED";
        } else {
            mappedStatus = undefined;
            detailedStatus = "UNKNOWN";
        }

        console.log(
            `[FourthwallGateway] Verified: event=${eventId}, order=${orderId}, checkout=${checkoutId}, status=${orderStatus}`
        );

        return {
            valid: true,
            eventId,
            eventType,
            invoiceId: checkoutId, // checkout id is our invoice reference
            status: mappedStatus,
            detailedStatus,
            externalReferenceId: orderId,
            paidAmount: Number.isFinite(paidAmount) ? paidAmount : undefined,
            currency: amountCurrency || undefined,
            merchantId: this.config.shopId,
            providerStatus: orderStatus,
            replay: false,
            isReconciled: mappedStatus === "success",
            providerOperation: "pay",
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Storefront cart creation (official checkout path)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Creates a Fourthwall checkout using the official Storefront cart flow.
     *
     * This method is consumed by the shared checkout session service (which
     * resolves the product mapping first). It creates a Storefront cart and
     * returns the cart id (sessionId) + checkout redirect URL. No server-side
     * "checkout session" endpoint exists in Fourthwall's API.
     */
    async createPaymentSession(input: {
        productId: string;
        variantId?: string;
        customerEmail: string;
        customerName?: string;
        locale?: string;
        metadata?: Record<string, unknown>;
    }): Promise<{ sessionId: string; sessionUrl: string; url: string }> {
        const variantId = input.variantId || input.productId;
        const cartId = await this.createStorefrontCart({
            variantId,
            metadata: {
                ...(input.metadata || {}),
                email: input.customerEmail,
                fullName: input.customerName,
            },
        });
        const redirectUrl = `https://${this.config.shopDomain}/cart/checkout?cartId=${encodeURIComponent(cartId)}&currency=USD`;
        return { sessionId: cartId, sessionUrl: redirectUrl, url: redirectUrl };
    }

    private async createStorefrontCart(input: {
        variantId: string;
        metadata: Record<string, unknown>;
    }): Promise<string> {
        const url = `${this.config.storefrontBaseUrl}/v1/carts?storefront_token=${encodeURIComponent(
            this.config.storefrontToken
        )}&currency=USD`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // metadata keys must be [a-zA-Z0-9_], <=256/key, <=512/value, <=2KB total.
            body: JSON.stringify({
                items: [{ variantId: input.variantId, quantity: 1 }],
                metadata: input.metadata,
            }),
            signal: AbortSignal.timeout(10_000),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(
                `[FourthwallGateway] Storefront cart creation failed (${response.status}): ${errorText}`
            );
        }

        const data = await response.json();
        if (!data.id) {
            throw new Error("[FourthwallGateway] Storefront cart response missing id");
        }
        return data.id;
    }

    /**
     * Resolves the Fourthwall product/variant mapping for a given tier.
     * Returns null (never a placeholder) when a real product ID is not configured.
     */
    private resolveProductMapping(tierId: string): {
        fourthwallProductId: string;
        fourthwallVariantId?: string;
    } | null {
        const mapping: Record<string, CanonicalProductId> = {
            digital: "MRX-PROTOCOL",
            digital_plus: "MRX-PROTOCOL",
            pdf: "MRX-PROTOCOL",

            bundle: "MRX-TACTICAL",
            bundle_plus: "MRX-TACTICAL",
            paperback: "MRX-TACTICAL",

            coaching: "MRX-SMART-PRO",
            coaching_plus: "MRX-SMART-PRO",

            coaching_addon: "MRX-COACHING-ADDON",
            consultation: "MRX-CONSULTATION",
        };

        const canonical = mapping[tierId];
        if (!canonical) return null;

        // Fourthwall checkout links require the product/variant UUID. Only real
        // (non-placeholder) configured IDs are returned.
        const productId = this.resolveFourthwallProductId(canonical);
        if (!productId || this.isPlaceholder(productId)) {
            return null;
        }
        return { fourthwallProductId: productId };
    }

    private resolveCanonicalProduct(tierId: string): CanonicalProductId | null {
        const mapping: Record<string, CanonicalProductId> = {
            digital: "MRX-PROTOCOL",
            digital_plus: "MRX-PROTOCOL",
            pdf: "MRX-PROTOCOL",
            bundle: "MRX-TACTICAL",
            bundle_plus: "MRX-TACTICAL",
            paperback: "MRX-TACTICAL",
            coaching: "MRX-SMART-PRO",
            coaching_plus: "MRX-SMART-PRO",
            coaching_addon: "MRX-COACHING-ADDON",
            consultation: "MRX-CONSULTATION",
        };
        return mapping[tierId] ?? null;
    }

    /** AUP-blocked service tiers must never be exposed through Fourthwall. */
    private isBlockedServiceTier(tierId: string): boolean {
        return tierId === "coaching_addon" || tierId === "consultation";
    }

    private resolveFourthwallProductId(canonical: CanonicalProductId): string | null {
        const envMap: Record<CanonicalProductId, string> = {
            "MRX-PROTOCOL": "FOURTHWALL_PRODUCT_DIGITAL_BOOK_ID",
            "MRX-TACTICAL": "FOURTHWALL_PRODUCT_PAPERBACK_ID",
            "MRX-SMART-PRO": "FOURTHWALL_PRODUCT_HARDCOVER_ID",
            "MRX-COACHING-ADDON": "FOURTHWALL_PRODUCT_COACHING_ID",
            "MRX-CONSULTATION": "FOURTHWALL_PRODUCT_CONSULTATION_ID",
        };
        const envKey = envMap[canonical];
        return envKey ? process.env[envKey] || null : null;
    }

    private isPlaceholder(id: string): boolean {
        // Production logic must never be driven by placeholder IDs (e.g. test
        // fixtures like `fw_...` or `placeholder...`). Real IDs are UUIDs.
        return /^(fw_|placeholder|TODO|XXX)/i.test(id);
    }

    private assertCredentials(): void {
        if (!this.config.shopId || !this.config.apiKey || !this.config.webhookSecret) {
            throw new Error(
                "[FourthwallGateway] Missing credentials. Set FOURTHWALL_SHOP_ID, FOURTHWALL_API_KEY, FOURTHWALL_WEBHOOK_SECRET"
            );
        }
        if (!this.config.storefrontToken || !this.config.shopDomain) {
            throw new Error(
                "[FourthwallGateway] Missing Storefront config. Set FOURTHWALL_STOREFRONT_TOKEN and FOURTHWALL_SHOP_DOMAIN"
            );
        }
    }

    private readHeader(
        headers: Record<string, string | string[] | undefined> | Headers,
        name: string
    ): string {
        // Real webhook requests deliver `req.headers` as a WHATWG Headers
        // instance (NextRequest); the unit tests pass plain objects. Support both.
        if (headers instanceof Headers) {
            return headers.get(name) ?? headers.get(name.toLowerCase()) ?? '';
        }
        const raw = headers[name] ?? headers[name.toLowerCase()] ?? "";
        if (Array.isArray(raw)) return raw[0] || "";
        return String(raw || "");
    }

    /**
     * Fetches a product from the Fourthwall Platform API (official path + Basic auth).
     */
    async fetchProduct(productId: string): Promise<FourthwallProduct | null> {
        this.assertCredentials();
        try {
            const response = await fetch(`${this.config.baseUrl}/open-api/v1.0/products/${productId}`, {
                headers: this.platformAuthHeaders(),
                signal: AbortSignal.timeout(5_000),
            });
            if (!response.ok) return null;
            return (await response.json()) as FourthwallProduct;
        } catch {
            return null;
        }
    }

    /**
     * Fetches an order from the Fourthwall Platform API.
     * Official endpoint: GET /open-api/v1.0/order/{orderId} using Basic Auth.
     */
    async fetchOrder(orderId: string): Promise<FourthwallOrder | null> {
        this.assertCredentials();
        try {
            const response = await fetch(`${this.config.baseUrl}/open-api/v1.0/order/${orderId}`, {
                headers: this.platformAuthHeaders(),
                signal: AbortSignal.timeout(5_000),
            });
            if (!response.ok) return null;
            return (await response.json()) as FourthwallOrder;
        } catch {
            return null;
        }
    }

    /**
     * Verifies digital delivery is present for an order (audit trail only).
     * OrderV1 carries a `digital_delivery` array when a downloadable file exists.
     */
    async verifyDigitalDelivery(orderId: string, fileName: string): Promise<boolean> {
        const order = await this.fetchOrder(orderId);
        if (!order?.digitalDelivery) return false;
        return order.digitalDelivery.some(
            (d) => d.fileName === fileName && d.downloadCount > 0
        );
    }

    private platformAuthHeaders(): Record<string, string> {
        // Official Platform API auth: HTTP Basic with the Open API user credentials.
        const username = this.config.shopId;
        const token = Buffer.from(`${username}:${this.config.apiKey}`).toString("base64");
        return {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
        };
    }
}
