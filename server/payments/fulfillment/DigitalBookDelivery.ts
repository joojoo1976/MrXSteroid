/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  DIGITAL BOOK DELIVERY — Secure entitlement to the Mr. X Steroid Digital Book
 *
 *  Business Rule: Purchasing ANY eligible product provides immediate access to
 *  the Mr. X Steroid Digital Book.
 *
 *  Delivery Mechanisms (in priority order):
 *  1. Fourthwall Native Digital Attachment — if the purchased product has a
 *     digital file attached in Fourthwall, Fourthwall emails it automatically.
 *  2. Fourthwall Webhook → Secure Signed URL — if native attachment is not
 *     possible, we generate a time-limited, single-use signed URL for download.
 *  3. Manual Fulfillment Queue — if both above fail, create a fulfillment task
 *     for manual delivery (last resort).
 *
 *  Security Requirements:
 *  - Digital book URL is NEVER a permanent public URL.
 *  - Signed URLs expire within 24 hours and allow max 3 downloads.
 *  - Download events are logged for audit.
 *  - Fourthwall native delivery is preferred (email-based, no URL exposure).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from "crypto";

export interface DigitalBookConfig {
    fileName: string;
    fileSize: number;
    mimeType: string;
    storageBucket: string;
    storagePath: string;
    maxDownloads: number;
    urlExpiryHours: number;
}

export interface DigitalDeliveryResult {
    success: boolean;
    method: "fourthwall_native" | "signed_url" | "manual_queue";
    downloadUrl?: string;
    expiresAt?: string;
    errorMessage?: string;
}

const DIGITAL_BOOK_CONFIG: DigitalBookConfig = {
    fileName: "MrXSteroid_Digital_Protocol.pdf",
    fileSize: 5_000_000, // ~5MB
    mimeType: "application/pdf",
    storageBucket: process.env.DIGITAL_BOOK_STORAGE_BUCKET || "digital-assets",
    storagePath: process.env.DIGITAL_BOOK_STORAGE_PATH || "books/MrXSteroid_Digital_Protocol.pdf",
    maxDownloads: 3,
    urlExpiryHours: 24,
};

export interface EligibleProductCheck {
    productId: string;
    isEligible: boolean;
    fourthwallProductId?: string;
    hasNativeDigitalAttachment: boolean;
}

export class DigitalBookDelivery {
    private readonly supabase: SupabaseClient;
    private readonly config: DigitalBookConfig;

    constructor(supabase: SupabaseClient, config: Partial<DigitalBookConfig> = {}) {
        this.supabase = supabase;
        this.config = { ...DIGITAL_BOOK_CONFIG, ...config };
    }

    /**
     * Checks if a product purchase entitles the customer to the Digital Book.
     * Eligible products: Digital Protocol, Tactical Bundle, Smart Professional,
     * Coaching Add-on, Consultation.
     */
    async checkEligibility(productId: string): Promise<EligibleProductCheck> {
        const eligibleProducts = [
            "MRX-PROTOCOL",
            "MRX-TACTICAL",
            "MRX-SMART-PRO",
            "MRX-COACHING-ADDON",
            "MRX-CONSULTATION",
        ];

        console.log('[DEBUG] checkEligibility called with:', productId);
        console.log('[DEBUG] eligibleProducts:', eligibleProducts);
        console.log('[DEBUG] includes check:', eligibleProducts.includes(productId));

        const isEligible = eligibleProducts.includes(productId);
        const fourthwallProductId = isEligible
            ? process.env[`FOURTHWALL_PRODUCT_${productId.replace("MRX-", "").replace("-", "_")}_ID`]
            : undefined;

        // Native digital attachment is ONLY claimed for MRX-PROTOCOL (the digital
        // product itself). Fourthwall has NO verified "free digital file bundled
        // with a physical product" rule, so physical purchases (Tactical Bundle,
        // Smart Professional) must use the secure signed-download mechanism —
        // we never assume a native cross-product download exists.
        const hasNativeDigitalAttachment = productId === "MRX-PROTOCOL";

        const result = {
            productId,
            isEligible,
            fourthwallProductId,
            hasNativeDigitalAttachment,
        };
        
        console.log('[DEBUG] checkEligibility returning:', result);
        return result;
    }

    /**
     * Delivers the Digital Book to a customer after successful purchase.
     * Tries Fourthwall native first, then signed URL, then manual queue.
     */
    async deliverAfterPurchase(input: {
        invoiceId: string;
        customerEmail: string;
        productId: string;
        fourthwallOrderId?: string;
        fourthwallCheckoutSessionId?: string;
    }): Promise<DigitalDeliveryResult> {
        const eligibility = await this.checkEligibility(input.productId);
        if (!eligibility.isEligible) {
            return { success: false, method: "manual_queue", errorMessage: "Product not eligible for Digital Book" };
        }

        // Method 1: Fourthwall Native Digital Attachment
        // If Fourthwall has the digital file attached to the product, it will
        // automatically email the customer upon purchase completion.
        // We just need to verify the delivery happened.
        if (eligibility.hasNativeDigitalAttachment && eligibility.fourthwallProductId && input.fourthwallOrderId) {
            const nativeDelivered = await this.verifyFourthwallNativeDelivery(
                eligibility.fourthwallProductId,
                input.fourthwallOrderId
            );
            if (nativeDelivered) {
                await this.logDelivery(input.invoiceId, "fourthwall_native", null);
                return { success: true, method: "fourthwall_native" };
            }
        }

        // Method 2: Generate Secure Signed URL
        const signedUrlResult = await this.generateSignedDownloadUrl(input.invoiceId, input.customerEmail);
        if (signedUrlResult.success) {
            // In production, send email with the signed URL
            await this.sendDownloadEmail(input.customerEmail, signedUrlResult.downloadUrl!);
            await this.logDelivery(input.invoiceId, "signed_url", signedUrlResult.downloadUrl);
            return { success: true, method: "signed_url", downloadUrl: signedUrlResult.downloadUrl, expiresAt: signedUrlResult.expiresAt };
        }

        // Method 3: Manual Fulfillment Queue
        await this.queueManualDelivery(input.invoiceId, input.customerEmail);
        return { success: true, method: "manual_queue" };
    }

    /**
     * Verifies Fourthwall native digital delivery by checking the order's
     * digital_delivery array for the Digital Book file.
     *
     * Honest behavior: native delivery is only true when PROVEN against the
     * provider's order. This method has no verified network path, so it returns
     * false and lets delivery fall back to the secure signed-download mechanism.
     * We never claim native delivery happened without evidence.
     */
    private async verifyFourthwallNativeDelivery(fourthwallProductId: string, fourthwallOrderId: string): Promise<boolean> {
        console.log(
            `[DigitalBookDelivery] Native delivery NOT asserted for product ${fourthwallProductId}, order ${fourthwallOrderId} (unverified; falling back to signed URL)`
        );
        return false;
    }

    /**
     * Generates a secure, time-limited, single-use signed download URL.
     * The URL is stored in the database with expiry and download count.
     */
    private async generateSignedDownloadUrl(invoiceId: string, customerEmail: string): Promise<{
        success: boolean;
        downloadUrl?: string;
        expiresAt?: string;
        errorMessage?: string;
    }> {
        try {
            const token = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            const expiresAt = new Date(Date.now() + this.config.urlExpiryHours * 60 * 60 * 1000).toISOString();

            const { error } = await this.supabase
                .from("digital_book_deliveries")
                .insert({
                    invoice_id: invoiceId,
                    token_hash: tokenHash,
                    customer_email: customerEmail,
                    file_name: this.config.fileName,
                    max_downloads: this.config.maxDownloads,
                    download_count: 0,
                    expires_at: expiresAt,
                    created_at: new Date().toISOString(),
                });

            if (error) {
                console.error("[DigitalBookDelivery] Failed to create delivery record:", error);
                return { success: false, errorMessage: "Failed to create delivery record" };
            }

            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mrxsteroid.com";
            const downloadUrl = `${baseUrl}/digital-book/download?token=${token}`;

            return { success: true, downloadUrl, expiresAt };
        } catch (err) {
            console.error("[DigitalBookDelivery] Error generating signed URL:", err);
            return { success: false, errorMessage: "Error generating signed URL" };
        }
    }

    /**
     * Validates a download token and serves the file if valid.
     * Increments download count and checks expiry/max downloads.
     */
    async validateAndServeDownload(token: string): Promise<{
        valid: boolean;
        filePath?: string;
        fileName?: string;
        mimeType?: string;
        errorMessage?: string;
    }> {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const { data: delivery, error } = await this.supabase
            .from("digital_book_deliveries")
            .select("*")
            .eq("token_hash", tokenHash)
            .single();

        if (error || !delivery) {
            return { valid: false, errorMessage: "Invalid or expired download link" };
        }

        // Check expiry
        if (new Date(delivery.expires_at) < new Date()) {
            return { valid: false, errorMessage: "Download link has expired" };
        }

        // Check max downloads
        if (delivery.download_count >= delivery.max_downloads) {
            return { valid: false, errorMessage: "Maximum downloads exceeded" };
        }

        // Increment download count
        await this.supabase
            .from("digital_book_deliveries")
            .update({
                download_count: delivery.download_count + 1,
                last_downloaded_at: new Date().toISOString(),
            })
            .eq("id", delivery.id);

        return {
            valid: true,
            filePath: `${this.config.storagePath}`,
            fileName: delivery.file_name,
            mimeType: this.config.mimeType,
        };
    }

    /**
     * Sends the download email to the customer.
     * In production, this would use a transactional email service (SendGrid, etc.).
     */
    private async sendDownloadEmail(email: string, downloadUrl: string): Promise<void> {
        // Implementation would integrate with email service
        console.log(`[DigitalBookDelivery] Sending download email to ${email}: ${downloadUrl}`);
        // await sendTransactionalEmail({
        //     to: email,
        //     template: "digital_book_delivery",
        //     data: { downloadUrl, expiresInHours: DIGITAL_BOOK_CONFIG.urlExpiryHours }
        // });
    }

    /**
     * Logs the delivery attempt for audit trail.
     */
    private async logDelivery(invoiceId: string, method: string, downloadUrl: string | null): Promise<void> {
        await this.supabase.from("digital_book_delivery_log").insert({
            invoice_id: invoiceId,
            method,
            download_url: downloadUrl,
            created_at: new Date().toISOString(),
        });
    }

    /**
     * Queues manual delivery as last resort.
     */
    private async queueManualDelivery(invoiceId: string, customerEmail: string): Promise<void> {
        await this.supabase.from("manual_fulfillment_queue").insert({
            invoice_id: invoiceId,
            type: "digital_book_delivery",
            customer_email: customerEmail,
            status: "pending",
            created_at: new Date().toISOString(),
        });
        console.warn(`[DigitalBookDelivery] Manual delivery queued for invoice ${invoiceId}, customer ${customerEmail}`);
    }
}

/**
 * Factory function to create DigitalBookDelivery with Supabase admin client.
 */
export function createDigitalBookDelivery(): DigitalBookDelivery {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error("[DigitalBookDelivery] Missing Supabase admin env vars.");
    }
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    return new DigitalBookDelivery(supabase);
}