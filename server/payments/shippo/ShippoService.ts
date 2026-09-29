/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  SHIPPO INTEGRATION — International Shipping Layer
 *  Provides carrier rates, label creation, and tracking for Global/USD orders.
 *  Integrates with Shippo API (https://goshippo.com/docs/).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import crypto from "crypto";

export interface ShippoConfig {
    apiKey: string;
    webhookSecret: string;
    baseUrl: string;
}

export interface ShippoAddress {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state?: string;
    zip: string;
    country: string; // ISO 3166-1 alpha-2
    phone?: string;
    email?: string;
    is_residential?: boolean;
    validate?: boolean;
}

export interface ShippoParcel {
    length: number;
    width: number;
    height: number;
    distance_unit: "in" | "cm";
    weight: number;
    mass_unit: "lb" | "g";
}

export interface ShippoRate {
    object_id: string;
    amount: string;
    currency: string;
    provider: string;
    servicelevel: { token: string; name: string };
    estimated_days: number;
    duration_terms: string;
}

export interface ShippoShipment {
    object_id: string;
    status: "QUEUED" | "SUCCESS" | "ERROR";
    rates: ShippoRate[];
    to_address: ShippoAddress;
    from_address: ShippoAddress;
    parcel: ShippoParcel;
    metadata?: string;
}

export interface ShippoTransaction {
    object_id: string;
    status: "QUEUED" | "SUCCESS" | "ERROR";
    rate: string; // rate object_id
    tracking_number: string;
    tracking_url_provider: string;
    label_url: string;
    label_file_type: "PDF" | "ZPL" | "PNG";
    shipment_id: string;
    created_at: string;
}

export class ShippoService {
    private readonly config: ShippoConfig;

    constructor() {
        this.config = {
            apiKey: process.env.SHIPPO_API_KEY || "",
            webhookSecret: process.env.SHIPPO_WEBHOOK_SECRET || "",
            baseUrl: "https://api.goshippo.com",
        };
    }

    private assertCredentials(): void {
        if (!this.config.apiKey) {
            throw new Error("[ShippoService] Missing SHIPPO_API_KEY");
        }
    }

    /**
     * Creates a shipment and returns available rates.
     * Does NOT purchase a label — caller selects rate and calls purchaseLabel.
     */
    async createShipment(input: {
        toAddress: ShippoAddress;
        fromAddress: ShippoAddress;
        parcel: ShippoParcel;
        metadata?: string;
    }): Promise<ShippoShipment> {
        this.assertCredentials();

        const response = await fetch(`${this.config.baseUrl}/shipments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `ShippoToken ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                address_to: input.toAddress,
                address_from: input.fromAddress,
                parcels: [input.parcel],
                metadata: input.metadata,
                async: false,
            }),
            signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(`[ShippoService] Create shipment failed (${response.status}): ${errorText}`);
        }

        return (await response.json()) as ShippoShipment;
    }

    /**
     * Purchases a shipping label for a specific rate.
     * Returns transaction with label URL and tracking number.
     */
    async purchaseLabel(input: {
        shipmentId: string;
        rateId: string;
        labelFileType?: "PDF" | "ZPL" | "PNG";
        async?: boolean;
    }): Promise<ShippoTransaction> {
        this.assertCredentials();

        const response = await fetch(`${this.config.baseUrl}/transactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `ShippoToken ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                shipment: input.shipmentId,
                rate: input.rateId,
                label_file_type: input.labelFileType || "PDF",
                async: input.async || false,
            }),
            signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(`[ShippoService] Purchase label failed (${response.status}): ${errorText}`);
        }

        return (await response.json()) as ShippoTransaction;
    }

    /**
     * Gets tracking information for a transaction.
     */
    async trackShipment(trackingNumber: string, carrier: string): Promise<{
        status: string;
        tracking_history: Array<{ status: string; status_details: string; status_date: string; location?: string }>;
        eta?: string;
    } | null> {
        this.assertCredentials();

        try {
            const response = await fetch(
                `${this.config.baseUrl}/tracks/${carrier}/${trackingNumber}`,
                {
                    headers: { Authorization: `ShippoToken ${this.config.apiKey}` },
                    signal: AbortSignal.timeout(10_000),
                }
            );

            if (!response.ok) return null;
            return (await response.json()) as {
                status: string;
                tracking_history: Array<{ status: string; status_details: string; status_date: string; location?: string }>;
                eta?: string;
            };
        } catch {
            return null;
        }
    }

    /**
     * Verifies Shippo webhook signature.
     * Shippo uses HMAC-SHA256 with the webhook secret.
     */
    verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
        if (!this.config.webhookSecret || !signatureHeader) return false;

        const expectedSignature = crypto
            .createHmac("sha256", this.config.webhookSecret)
            .update(rawBody)
            .digest("hex");

        const sigBuffer = Buffer.from(signatureHeader, "hex");
        const expectedBuffer = Buffer.from(expectedSignature, "hex");

        return sigBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    }

    /**
     * Creates a return label for a shipment.
     */
    async createReturnLabel(input: {
        originalTransactionId: string;
        returnAddress: ShippoAddress;
    }): Promise<ShippoTransaction> {
        this.assertCredentials();

        const response = await fetch(`${this.config.baseUrl}/transactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `ShippoToken ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                shipment: input.originalTransactionId,
                rate: "return",
                address_return: input.returnAddress,
                label_file_type: "PDF",
                async: false,
            }),
            signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(`[ShippoService] Create return label failed (${response.status}): ${errorText}`);
        }

        return (await response.json()) as ShippoTransaction;
    }

    /**
     * Gets the default origin address from environment (warehouse location).
     */
    getDefaultOriginAddress(): ShippoAddress {
        return {
            name: process.env.SHIPPO_ORIGIN_NAME || "MrXSteroid Fulfillment",
            street1: process.env.SHIPPO_ORIGIN_STREET1 || "123 Warehouse St",
            city: process.env.SHIPPO_ORIGIN_CITY || "Cairo",
            state: process.env.SHIPPO_ORIGIN_STATE || "",
            zip: process.env.SHIPPO_ORIGIN_ZIP || "11511",
            country: process.env.SHIPPO_ORIGIN_COUNTRY || "EG",
            phone: process.env.SHIPPO_ORIGIN_PHONE || "+201000000000",
            email: process.env.SHIPPO_ORIGIN_EMAIL || "fulfillment@mrxsteroid.com",
        };
    }

    /**
     * Estimates parcel dimensions/weight from product tier.
     * In production, this would come from a product catalog with physical specs.
     */
    estimateParcelFromTier(tierId: string): ShippoParcel {
        // Default parcel for book-sized items
        const defaults: Record<string, ShippoParcel> = {
            digital: { length: 0, width: 0, height: 0, distance_unit: "cm", weight: 0, mass_unit: "g" },
            digital_plus: { length: 0, width: 0, height: 0, distance_unit: "cm", weight: 0, mass_unit: "g" },
            pdf: { length: 0, width: 0, height: 0, distance_unit: "cm", weight: 0, mass_unit: "g" },
            bundle: { length: 25, width: 18, height: 4, distance_unit: "cm", weight: 800, mass_unit: "g" }, // Paperback
            bundle_plus: { length: 25, width: 18, height: 4, distance_unit: "cm", weight: 800, mass_unit: "g" },
            coaching: { length: 28, width: 22, height: 5, distance_unit: "cm", weight: 1200, mass_unit: "g" }, // Hardcover
            coaching_plus: { length: 28, width: 22, height: 5, distance_unit: "cm", weight: 1200, mass_unit: "g" },
            paperback: { length: 25, width: 18, height: 4, distance_unit: "cm", weight: 800, mass_unit: "g" },
            coaching_addon: { length: 0, width: 0, height: 0, distance_unit: "cm", weight: 0, mass_unit: "g" }, // Digital
            consultation: { length: 0, width: 0, height: 0, distance_unit: "cm", weight: 0, mass_unit: "g" }, // Digital
        };
        return defaults[tierId] || defaults.bundle;
    }
}

// Singleton
let shippoInstance: ShippoService | null = null;

export function getShippoService(): ShippoService {
    if (!shippoInstance) shippoInstance = new ShippoService();
    return shippoInstance;
}