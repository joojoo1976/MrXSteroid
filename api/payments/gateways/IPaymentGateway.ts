/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🏗️ PAYMENT GATEWAY — STRATEGY INTERFACE                                ║
 * ║  Defines the contract for all payment gateway implementations            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import type { VercelRequest } from '@vercel/node';

// ═══════════════════════════════════════════════════════════════════════════
//                              TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export type GatewayName = 'SPACEREMIT' | 'PAYMOB' | 'STRIPE';

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
}

export interface WebhookVerificationResult {
    valid: boolean;
    invoiceId?: string;
    status?: 'success' | 'failed';
    externalReferenceId?: string;
    errorMessage?: string;
    /** Amount actually paid in major units, when reported by the gateway. Used for defense-in-depth amount verification. */
    paidAmount?: number;
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
