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

export type GatewayName = 'SPACEREMIT' | 'PAYMOB' | 'STRIPE' | 'KASHIER_EGYPT' | 'KASHIER_GLOBAL' | 'FOURTHWALL';

/**
 * Refund-like provider events. `refund`/`void` mean money was returned; a
 * cancellation or a dispute is recorded but never treated as a settled refund.
 */
export type GatewayRefundKind = 'refund' | 'void' | 'cancel' | 'dispute_opened' | 'dispute_closed';

export interface RefundRequest {
    invoiceId: string;
    paymentIntentId?: string | null;
    /** Amount to refund, in major units. */
    amount: number;
    currency: string;
    reason?: string;
    metadata?: Record<string, unknown>;
}

export interface RefundResult {
    success: boolean;
    providerRefundId?: string;
    status: 'pending' | 'completed' | 'failed' | 'unknown';
    raw?: unknown;
}

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
    /**
     * Provider's own status string for the transaction (Kashier de-dupe key component:
     * `{transactionId}::{webhookUrl}::{status}` — C7). e.g. APPROVED / DECLINED / ORDER_PAID_BEFORE.
     */
    providerStatus?: string;
    /** True when the provider marks this event as a replay (Kashier event:"idempotency" / ORDER_PAID_BEFORE) — ack, no financial mutation. */
    replay?: boolean;
    /** Reconciliation verdict surfacing from the provider payload (true = OK, undefined when not reported). */
    isReconciled?: boolean;
    /** Provider event kind (pay, authorize, capture, refund, void, reject, reversal, ...). */
    providerOperation?: string;
    /** Provider's webhook event id — the deduplication key (Fourthwall: envelope `id`). */
    eventId?: string;
    /** Provider event type string (Fourthwall: envelope `type`, e.g. ORDER_PLACED). */
    eventType?: string;
    /** Currency reported by the provider (Fourthwall: OrderV1 amounts.currency). */
    currency?: string;
    /**
     * Set when this event is a refund/void/cancellation/dispute rather than a
     * payment. Handlers MUST route it to the refund-domain recorder and must
     * never run the settlement pipeline for it.
     */
    refundKind?: GatewayRefundKind;
    /** Refunded amount in major units, when the provider reports it. */
    refundAmount?: number;
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
     * Issue a refund at the provider (optional, provider-specific).
     *
     * NOT IMPLEMENTED by any gateway in Phase A: refund events are recorded
     * from provider webhooks and operator actions only, with no outbound call.
     * The contract exists so a future adapter can implement it behind an
     * explicit feature gate.
     */
    refund?(params: RefundRequest): Promise<RefundResult>;

    /**
     * Return the standardized gateway name for logging and DB records.
     */
    getGatewayName(): GatewayName;
}
