/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  💳 STRIPE GATEWAY — Strategy Implementation                            ║
 * ║  Handles global payments via Stripe Checkout Sessions                    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import type { VercelRequest } from '@vercel/node';
import Stripe from 'stripe';
import type {
    IPaymentGateway,
    GatewayName,
    CreateInvoiceParams,
    CreateInvoiceResult,
    WebhookVerificationResult
} from './IPaymentGateway.js';

// ═══════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const STRIPE_CONFIG = {
    SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    SUCCESS_URL: 'https://mrxsteroid.vercel.app/success?txn={CHECKOUT_SESSION_ID}',
    CANCEL_URL: 'https://mrxsteroid.vercel.app/cancel',

    /**
     * Mapping of tier IDs to Stripe Price IDs
     * These should be created in the Stripe Dashboard and their IDs added here.
     * 
     * Example: 
     *   pdf → price_xxxxx (one-time payment for PDF edition)
     *   paperback → price_yyyyy (one-time payment for Paperback edition)
     */
    PRICE_IDS: {
        pdf: process.env.STRIPE_PRICE_ID_PDF || '',
        paperback: process.env.STRIPE_PRICE_ID_PAPERBACK || '',
    } as Record<string, string>,
};

// Initialize Stripe SDK lazily
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
    if (!stripeInstance) {
        if (!STRIPE_CONFIG.SECRET_KEY) {
            throw new Error('Stripe Secret Key is not configured');
        }
        stripeInstance = new Stripe(STRIPE_CONFIG.SECRET_KEY, {
            apiVersion: '2026-02-25.clover',
            typescript: true,
        });
    }
    return stripeInstance;
}

// ═══════════════════════════════════════════════════════════════════════════
//                          GATEWAY IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export class StripeGateway implements IPaymentGateway {

    getGatewayName(): GatewayName {
        return 'STRIPE';
    }

    /**
     * Create a Stripe Checkout Session
     * 
     * If a Price ID is configured for the tier, uses it directly (best practice).
     * Otherwise, falls back to creating a session with ad-hoc line items.
     */
    async createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult> {
        const { invoiceId, tierId, amount, currency, metadata } = params;
        const stripe = getStripe();

        const priceId = STRIPE_CONFIG.PRICE_IDS[tierId];

        // Build the session configuration
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: metadata.email,
            client_reference_id: invoiceId, // Our internal invoice ID
            success_url: STRIPE_CONFIG.SUCCESS_URL.replace('{CHECKOUT_SESSION_ID}', '{CHECKOUT_SESSION_ID}'),
            cancel_url: `${STRIPE_CONFIG.CANCEL_URL}?txn=${invoiceId}`,
            metadata: {
                invoice_id: invoiceId,
                tier_id: tierId,
                user_id: params.userId,
                full_name: metadata.fullName,
            },
        };

        if (priceId) {
            // Use preconfigured Price ID (recommended)
            sessionParams.line_items = [{ price: priceId, quantity: 1 }];
        } else {
            // Fallback: ad-hoc line item with amount
            sessionParams.line_items = [{
                price_data: {
                    currency: currency.toLowerCase(),
                    product_data: {
                        name: `Mr. X Steroid — ${tierId === 'pdf' ? 'PDF Edition' : 'Paperback Edition'}`,
                        description: tierId === 'pdf'
                            ? 'Digital PDF copy of Mr. X Steroid guide'
                            : 'Physical paperback copy of Mr. X Steroid guide',
                    },
                    unit_amount: Math.round(amount * 100), // Stripe expects cents
                },
                quantity: 1,
            }];
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        if (!session.url) {
            throw new Error('Stripe did not return a checkout URL');
        }

        console.log(`✅ [Stripe] Checkout session created: ${session.id} for invoice: ${invoiceId}`);

        return {
            redirectUrl: session.url,
            externalReferenceId: session.id,
        };
    }

    /**
     * Verify Stripe Webhook using constructEvent
     * 
     * Stripe provides a robust signature verification via constructEvent.
     * This ensures the webhook payload hasn't been tampered with.
     */
    async verifyWebhook(req: VercelRequest, rawBody: string): Promise<WebhookVerificationResult> {
        const signature = req.headers['stripe-signature'] as string;

        if (!signature) {
            return { valid: false, errorMessage: 'Missing Stripe-Signature header' };
        }

        if (!STRIPE_CONFIG.WEBHOOK_SECRET) {
            return { valid: false, errorMessage: 'Stripe webhook secret not configured' };
        }

        const stripe = getStripe();

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_CONFIG.WEBHOOK_SECRET);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Signature verification failed';
            console.error('❌ [Stripe] Webhook verification failed:', errorMessage);
            return { valid: false, errorMessage };
        }

        // Handle relevant event types
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            return {
                valid: true,
                invoiceId: session.client_reference_id || session.metadata?.invoice_id || undefined,
                status: session.payment_status === 'paid' ? 'success' : 'failed',
                externalReferenceId: session.id,
            };
        }

        if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
            const obj = event.data.object as unknown as Record<string, unknown>;
            return {
                valid: true,
                invoiceId: (obj.client_reference_id as string) || (obj.metadata as Record<string, string>)?.invoice_id,
                status: 'failed',
                externalReferenceId: obj.id as string,
                errorMessage: 'Payment failed or session expired',
            };
        }

        // Acknowledge but don't process other event types
        console.log(`ℹ️ [Stripe] Unhandled event type: ${event.type}`);
        return {
            valid: true,
            status: undefined, // No action needed
        };
    }
}
