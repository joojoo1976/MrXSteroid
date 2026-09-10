/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🏗️ PAYMENT GATEWAY — STRATEGY INTERFACE                                ║
 * ║  Defines the contract for all payment gateway implementations            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import type { VercelRequest } from './vercel-types';

// ═══════════════════════════════════════════════════════════════════════════
//                              TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export type GatewayName = 'SPACEREMIT' | 'PAYMOB' | 'STRIPE' | 'KASHIER_EGYPT' | 'KASHIER_GLOBAL';

/**
 * Granular payment status codes — primarily used by Kashier but shared across all gateways.
 * TIMED_OUT and UNKNOWN must never trigger fulfillment or permanent failure.
 */
export type PaymentDetailedStatus =
    | 'APPROVED'
    | 'DECLINED'
    | 'EXPIRED_CARD'
    | 'TIMED_OUT'
    | 'ACQUIRER_SYSTEM_ERROR'
    | 'UNSPECIFIED_FAILURE'
    | 'UNKNOWN'
    | 'REFUNDED'
    | 'VOIDED'
    | 'AUTHORIZED'
    | 'CAPTURED';

export interface CreateInvoiceParams {
    userId: string | null;
    invoiceId: string;
    tierId: 'digital' | 'bundle' | 'coaching' | 'coaching_plus' | 'bundle_plus' | 'digital_plus' | 'pdf' | 'paperback';
    amount: number;
    currency: string;
    metadata: {
        email: string;
        fullName: string;
        locale?: 'ar' | 'en';
        [key: string]: unknown;
    };
}

export interface CreateInvoiceResult {
    redirectUrl: string;
    externalReferenceId: string;
    /** Embedded-flow client secret (e.g. Stripe PaymentIntent client_secret). Present when no redirect is required. */
    clientSecret?: string;
    /** Provider's order/transaction ID for reference (e.g. Kashier orderId) */
    providerOrderId?: string;
}

export interface WebhookVerificationResult {
    valid: boolean;
    invoiceId?: string;
    status?: 'success' | 'failed';
    externalReferenceId?: string;
    errorMessage?: string;
    /** Amount actually paid in major units, when reported by the gateway. Used for defense-in-depth amount verification. */
    paidAmount?: number;
    /** Granular status code from the provider (APPROVED, DECLINED, TIMED_OUT, UNKNOWN, etc.) */
    detailedStatus?: PaymentDetailedStatus;
    /** Provider's merchant ID extracted from the webhook payload (used for cross-account validation) */
    merchantId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
//                          GATEWAY INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * IPaymentGateway — Strategy Interface
 * 
 * All payment gateways must implement this contract.
 * The Factory decides which implementation to use based on the customer's country.
 */
export interface IPaymentGateway {
    /**
     * Create an invoice/checkout session and return a redirect URL.
     * The gateway should NOT create the Supabase invoice record — that's done by the API endpoint.
     */
    createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult>;

    /**
     * Create a PaymentIntent (embedded flow) and return a client secret.
     * The gateway should NOT create the Supabase invoice record — that's done by the API endpoint.
     * Only gateways supporting embedded payment elements implement this.
     */
    createPaymentIntent?(params: CreateInvoiceParams): Promise<CreateInvoiceResult>;

    /**
     * Verify the authenticity of a webhook/callback request.
     * Each gateway has its own signature verification mechanism.
     */
    verifyWebhook(req: VercelRequest, rawBody: string): Promise<WebhookVerificationResult>;

    /**
     * Return the standardized gateway name for logging and DB records.
     */
    getGatewayName(): GatewayName;
}
