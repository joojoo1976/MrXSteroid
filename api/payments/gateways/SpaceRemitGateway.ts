/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🚀 SPACEREMIT GATEWAY — Strategy Implementation                        ║
 * ║  Handles redirect-based payments via SpaceRemit API                      ║
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

const SPACEREMIT_CONFIG = {
    PUBLIC_KEY: process.env.VITE_SPACEREMIT_PUBLIC_KEY || process.env.SPACEREMIT_PUBLIC_KEY || '',
    SECRET_KEY: process.env.SPACEREMIT_SECRET_KEY || '',
    WEBHOOK_SECRET: process.env.SPACEREMIT_WEBHOOK_SECRET || process.env.SPACEREMIT_SECRET_KEY || '',
    API_BASE_URL: 'https://spaceremit.com',
    CALLBACK_URL: process.env.VITE_SPACEREMIT_CALLBACK_URL || 'https://mrxsteroid.vercel.app/api/payments/callback',
    SUCCESS_URL: 'https://mrxsteroid.vercel.app/success',
    CANCEL_URL: 'https://mrxsteroid.vercel.app/cancel',
};

// ═══════════════════════════════════════════════════════════════════════════
//                          GATEWAY IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export class SpaceRemitGateway implements IPaymentGateway {

    getGatewayName(): GatewayName {
        return 'SPACEREMIT';
    }

    /**
     * Create a SpaceRemit checkout session via redirect URL
     */
    async createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult> {
        const { invoiceId, tierId, amount, currency, metadata } = params;

        if (!SPACEREMIT_CONFIG.PUBLIC_KEY) {
            throw new Error('SpaceRemit Public Key is not configured');
        }

        // Build the SpaceRemit redirect URL
        const checkoutParams = new URLSearchParams({
            k: SPACEREMIT_CONFIG.PUBLIC_KEY,
            amount: amount.toString(),
            currency: currency,
            way: 'card',
            notes: JSON.stringify({
                invoice_id: invoiceId,
                tier_id: tierId,
                user_id: params.userId,
            }),
            email: metadata.email,
            customer_email: metadata.email,
            customer_name: metadata.fullName,
            reference_id: invoiceId,
            product_name: `Mr. X Steroid — ${tierId === 'pdf' ? 'PDF Edition' : 'Paperback Edition'}`,
            success_url: `${SPACEREMIT_CONFIG.CALLBACK_URL}?txn=${invoiceId}&gateway=spaceremit`,
            cancel_url: `${SPACEREMIT_CONFIG.CANCEL_URL}?txn=${invoiceId}`,
        });

        const redirectUrl = `${SPACEREMIT_CONFIG.API_BASE_URL}/apipay-v2/?${checkoutParams.toString()}`;

        console.log(`✅ [SpaceRemit] Checkout URL generated for invoice: ${invoiceId}`);

        return {
            redirectUrl,
            externalReferenceId: invoiceId, // SpaceRemit uses our reference_id
        };
    }

    /**
     * Verify SpaceRemit Webhook HMAC Signature
     */
    async verifyWebhook(req: VercelRequest, rawBody: string): Promise<WebhookVerificationResult> {
        const signature = req.headers['x-spaceremit-signature'] as string;

        if (!signature) {
            // SpaceRemit GET callbacks don't always have signatures — validate via API instead
            const spPaymentCode = req.query?.SP_payment_code as string;
            const referenceId = (req.query?.txn as string) || (req.query?.reference_id as string);

            if (spPaymentCode) {
                // Verify with SpaceRemit API
                const verification = await this.verifyPaymentWithApi(spPaymentCode);
                return {
                    valid: verification.success,
                    invoiceId: referenceId,
                    status: verification.success ? 'success' : 'failed',
                    externalReferenceId: spPaymentCode,
                };
            }

            return { valid: false, errorMessage: 'No signature or payment code provided' };
        }

        // POST webhook — verify HMAC
        if (!SPACEREMIT_CONFIG.WEBHOOK_SECRET) {
            return { valid: false, errorMessage: 'Webhook secret not configured' };
        }

        const expectedSignature = crypto
            .createHmac('sha256', SPACEREMIT_CONFIG.WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');

        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );

        if (!isValid) {
            return { valid: false, errorMessage: 'Invalid HMAC signature' };
        }

        // Parse webhook body
        const payload = JSON.parse(rawBody);
        const event = payload.event;

        // Extract invoice data from the `notes` field (JSON.parse pattern)
        // SpaceRemit stores our metadata in the `notes` field as a JSON string
        let invoiceId = payload.data?.reference_id || payload.data?.transaction_id;
        try {
            const notes = payload.notes || payload.data?.notes;
            if (notes) {
                const parsed = typeof notes === 'string' ? JSON.parse(notes) : notes;
                invoiceId = parsed.invoice_id || invoiceId;
                console.log(`📋 [SpaceRemit] Parsed notes → invoice: ${parsed.invoice_id}, user: ${parsed.user_id}, tier: ${parsed.tier_id}`);
            }
        } catch {
            console.warn('⚠️ [SpaceRemit] Could not parse notes field, using reference_id');
        }

        return {
            valid: true,
            invoiceId,
            status: (event === 'payment.success' || event === 'transaction.success') ? 'success' : 'failed',
            externalReferenceId: payload.data?.transaction_id,
        };
    }

    /**
     * Direct API verification with SpaceRemit
     */
    private async verifyPaymentWithApi(transactionCode: string): Promise<{ success: boolean }> {
        try {
            const response = await fetch('https://spaceremit.com/api/v2/payment_info/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    private_key: SPACEREMIT_CONFIG.SECRET_KEY,
                    spaceremit_code: transactionCode,
                }),
            });

            if (!response.ok) return { success: false };

            const data = await response.json();
            return { success: data?.status === 'completed' || data?.data?.status === 'completed' };
        } catch (error) {
            console.error('❌ [SpaceRemit] API verification failed:', error);
            return { success: false };
        }
    }
}
