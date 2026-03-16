/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🇪🇬 PAYMOB GATEWAY — Strategy Implementation                           ║
 * ║  Handles EGP payments for Egypt via Paymob standalone payment links      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import type { VercelRequest } from '@vercel/node';
import crypto from 'crypto';
import type {
    IPaymentGateway,
    GatewayName,
    CreateInvoiceParams,
    CreateInvoiceResult,
    WebhookVerificationResult
} from './IPaymentGateway';

// ═══════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const PAYMOB_CONFIG = {
    HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET || '',

    /**
     * Preconfigured Paymob standalone payment links per tier
     * These are generated from the Paymob dashboard
     */
    STANDALONE_LINKS: {
        pdf: process.env.PAYMOB_LINK_PDF || 'https://accept.paymob.com/standalone/?ref=i_LRR2RkRkSmxXSEY3MURBK1ZNV2orRkFudz09XzBGK1JXVXpXbkFlelVrb0VKVXM4clE9PQ',
        paperback: process.env.PAYMOB_LINK_PAPERBACK || 'https://accept.paymobsolutions.com/standalone?ref=p_LRR2eFZxTkJoUWtMTXVzandmYUw4TmdZZz09X3g1YUVqR0xFMFUwMi9MVzNBV3gyVHc9PQ',
    } as Record<string, string>,
};

// ═══════════════════════════════════════════════════════════════════════════
//                          GATEWAY IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export class PaymobGateway implements IPaymentGateway {

    getGatewayName(): GatewayName {
        return 'PAYMOB';
    }

    /**
     * Create a Paymob checkout by returning the preconfigured standalone link.
     * 
     * Note: Paymob standalone links are preconfigured with fixed amounts in EGP.
     * For dynamic amounts, you'd use the Paymob Intention API. The standalone
     * approach works well for fixed-price products like PDF and Paperback tiers.
     */
    async createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult> {
        const { invoiceId, tierId } = params;

        const link = PAYMOB_CONFIG.STANDALONE_LINKS[tierId];

        if (!link) {
            throw new Error(`No Paymob standalone link configured for tier: ${tierId}`);
        }

        console.log(`✅ [Paymob] Standalone link selected for invoice: ${invoiceId}, tier: ${tierId}`);

        return {
            redirectUrl: link,
            // Paymob standalone links don't return an external reference until callback
            // We track via our own invoiceId through the callback
            externalReferenceId: `paymob_${invoiceId}`,
        };
    }

    /**
     * Verify Paymob Webhook / Transaction Callback
     * 
     * Paymob sends callback notifications with an HMAC hash computed from
     * specific ordered fields. We verify this hash to ensure authenticity.
     * 
     * Reference: https://docs.paymob.com/docs/transaction-callbacks
     */
    async verifyWebhook(req: VercelRequest, rawBody: string): Promise<WebhookVerificationResult> {
        const hmacHeader = req.headers['hmac'] as string || req.query?.hmac as string;

        if (!hmacHeader) {
            return { valid: false, errorMessage: 'Missing Paymob HMAC header' };
        }

        if (!PAYMOB_CONFIG.HMAC_SECRET) {
            return { valid: false, errorMessage: 'Paymob HMAC secret not configured' };
        }

        // Parse the callback data
        let callbackData: Record<string, unknown>;
        try {
            callbackData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch {
            return { valid: false, errorMessage: 'Invalid callback payload' };
        }

        const obj = callbackData.obj as Record<string, unknown> | undefined;
        if (!obj) {
            return { valid: false, errorMessage: 'Missing obj field in Paymob callback' };
        }

        // Paymob HMAC is computed from specific fields in a specific order
        // Reference: https://docs.paymob.com/docs/transaction-callbacks
        const hmacFields = [
            obj.amount_cents,
            obj.created_at,
            obj.currency,
            obj.error_occured,
            obj.has_parent_transaction,
            obj.id,
            (obj.integration_id || ''),
            obj.is_3d_secure,
            obj.is_auth,
            obj.is_capture,
            obj.is_refunded,
            obj.is_standalone_payment,
            obj.is_voided,
            obj.order_id || (obj.order as Record<string, unknown>)?.id,
            obj.owner,
            (obj.pending || false),
            (obj.source_data as Record<string, unknown>)?.pan,
            (obj.source_data as Record<string, unknown>)?.sub_type,
            (obj.source_data as Record<string, unknown>)?.type,
            obj.success,
        ];

        const concatenated = hmacFields.map(v => String(v ?? '')).join('');

        const expectedHmac = crypto
            .createHmac('sha512', PAYMOB_CONFIG.HMAC_SECRET)
            .update(concatenated)
            .digest('hex');

        const isValid = expectedHmac === hmacHeader;

        if (!isValid) {
            console.error('❌ [Paymob] HMAC verification failed');
            return { valid: false, errorMessage: 'Invalid HMAC signature' };
        }

        // Extract our invoice reference from the order's merchant_order_id or payment_key metadata
        const merchantOrderId = (obj.order as Record<string, unknown>)?.merchant_order_id as string;
        const isSuccess = obj.success === true;

        return {
            valid: true,
            invoiceId: merchantOrderId, // Our invoice ID passed during creation
            status: isSuccess ? 'success' : 'failed',
            externalReferenceId: String(obj.id),
            errorMessage: isSuccess ? undefined : String(obj.data_message || 'Payment failed'),
        };
    }
}
