/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🇪🇬 PAYMOB GATEWAY — Strategy Implementation (Intention & Direct API Flow)║
 * ║  Handles Local (EGP: Card, Wallet, Kiosk) & International (PayPal)       ║
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
} from './IPaymentGateway.js';

// ═══════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const getPaymobConfig = () => {
    return {
        // PAYMOB_API_TOKEN is the v1 API key (legacy name), PAYMOB_API_KEY is the same credential
        API_KEY: process.env.PAYMOB_API_TOKEN || process.env.PAYMOB_API_KEY || process.env.VITE_PAYMOB_API_KEY || '',
        HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET || process.env.VITE_PAYMOB_HMAC_SECRET || '',
        // Client-safe public key (Paymob Intention API v2)
        PUBLIC_KEY: process.env.PAYMOB_PUBLIC_KEY || process.env.VITE_PAYMOB_PUBLIC_KEY || '',

        // Paymob Integration IDs
        INTEGRATION_IDS: {
            card: Number(process.env.NEXT_PUBLIC_PAYMOB_CARD_INTEGRATION_ID || process.env.VITE_PAYMOB_CARD_INTEGRATION_ID || 5573815),
            wallet: Number(process.env.NEXT_PUBLIC_PAYMOB_WALLET_INTEGRATION_ID || process.env.VITE_PAYMOB_WALLET_INTEGRATION_ID || 5792309),
            kiosk: Number(process.env.NEXT_PUBLIC_PAYMOB_KIOSK_INTEGRATION_ID || process.env.VITE_PAYMOB_KIOSK_INTEGRATION_ID || 5792311),
            paypal: Number(process.env.NEXT_PUBLIC_PAYMOB_PAYPAL_INTEGRATION_ID || process.env.VITE_PAYMOB_PAYPAL_INTEGRATION_ID || 5792310),
        },

        // Iframe IDs per payment method (provided by Paymob dashboard)
        IFRAME_IDS: {
            card:   Number(process.env.PAYMOB_CARD_IFRAME_ID   || 5573815),
            wallet: Number(process.env.PAYMOB_WALLET_IFRAME_ID || 5792309),
            kiosk:  Number(process.env.PAYMOB_KIOSK_IFRAME_ID  || 5792311),
            paypal: Number(process.env.PAYMOB_PAYPAL_IFRAME_ID || 5792310),
        },

        PAYMOB_BASE_URL: 'https://accept.paymob.com/api',
        PAYMOB_STANDALONE_BASE: 'https://accept.paymobsolutions.com',
    };
};

// ═══════════════════════════════════════════════════════════════════════════
//                            HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalise a phone number to E.164 (+2XXXXXXXXXX for Egyptian numbers).
 * Paymob billing_data requires a valid phone_number starting with country code.
 * Accepts: "01010101010", "201010101010", "+201010101010"
 */
const sanitizePhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, '');
    // Already has country code 20
    if (digits.startsWith('20') && digits.length === 12) return `+${digits}`;
    // Local Egyptian format: 01XXXXXXXX (11 digits)
    if (digits.startsWith('01') && digits.length === 11) return `+2${digits}`;
    // Fallback: return as-is if already has + prefix
    if (raw.startsWith('+')) return raw;
    // Last resort: prepend +2
    return `+2${digits}`;
};

// ═══════════════════════════════════════════════════════════════════════════
//                          GATEWAY IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export class PaymobGateway implements IPaymentGateway {

    getGatewayName(): GatewayName {
        return 'PAYMOB';
    }

    /**
     * Create Paymob Payment Invoice using the 3-Step Paymob API Flow:
     * Step 1: Authentication Token (/api/auth/tokens)
     * Step 2: Order Registration (/api/ecommerce/orders)
     * Step 3: Payment Key Request (/api/acceptance/payment_keys)
     * Step 4: Pay / Redirect URL formatting
     */
    async createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult> {
        const config = getPaymobConfig();
        const { invoiceId, amount, currency, metadata } = params;

        if (!config.API_KEY) {
            console.error('❌ [Paymob] Missing PAYMOB_API_KEY / PAYMOB_API_TOKEN in environment variables');
            throw new Error('Paymob API key is not configured');
        }

        // ── FAST PATH: If a pre-built standaloneUrl is provided, redirect immediately ──
        // This is used by the PaymobProductModal for catalog products with hosted pages.
        // No 3-step API flow needed — Paymob's hosted page handles auth internally.
        if (metadata.standaloneUrl && typeof metadata.standaloneUrl === 'string') {
            console.log(`⚡ [Paymob] Fast-path redirect via standaloneUrl for invoice: ${invoiceId}`);
            return {
                redirectUrl: metadata.standaloneUrl as string,
                externalReferenceId: invoiceId,
            };
        }

        // Determine payment sub-method (card, wallet, kiosk, paypal)
        const method = (metadata.paymentMethod as string || 'card').toLowerCase();
        let integrationId: number;

        if (metadata.integrationId) {
            integrationId = Number(metadata.integrationId);
        } else {
            switch (method) {
                case 'wallet':
                    integrationId = config.INTEGRATION_IDS.wallet;
                    break;
                case 'kiosk':
                    integrationId = config.INTEGRATION_IDS.kiosk;
                    break;
                case 'paypal':
                    integrationId = config.INTEGRATION_IDS.paypal;
                    break;
                case 'card':
                default:
                    integrationId = config.INTEGRATION_IDS.card;
                    break;
            }
        }

        console.log(`💳 [Paymob] Initiating invoice: ${invoiceId}, Method: ${method}, Integration ID: ${integrationId}, Amount: ${amount} ${currency}`);

        try {
            // ── STEP 1: AUTHENTICATION TOKEN ────────────────────────────────
            const authRes = await fetch(`${config.PAYMOB_BASE_URL}/auth/tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: config.API_KEY.trim() }),
            });

            if (!authRes.ok) {
                const authErrText = await authRes.text();
                console.error('❌ [Paymob] Auth step failed:', authErrText);
                throw new Error(`Paymob authentication failed: ${authRes.statusText}`);
            }

            const authData = await authRes.json() as { token: string };
            const authToken = authData.token;
            if (!authToken) throw new Error('No authentication token returned from Paymob');

            // ── STEP 2: ORDER REGISTRATION ─────────────────────────────────
            const amountCents = Math.round(amount * 100);
            const orderCurrency = currency || (method === 'paypal' ? 'USD' : 'EGP');
            const orderRes = await fetch(`${config.PAYMOB_BASE_URL}/ecommerce/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_token: authToken,
                    delivery_needed: false,
                    amount_cents: amountCents,
                    currency: orderCurrency,
                    merchant_order_id: invoiceId,
                    items: [],
                }),
            });

            if (!orderRes.ok) {
                const orderErrText = await orderRes.text();
                console.error('❌ [Paymob] Order registration failed:', orderErrText);
                throw new Error(`Paymob order registration failed: ${orderRes.statusText}`);
            }

            const orderData = await orderRes.json() as { id: number };
            const paymobOrderId = orderData.id;
            console.log(`📦 [Paymob] Order registered ID: ${paymobOrderId}`);

            // ── STEP 3: PAYMENT KEY REQUEST ────────────────────────────────
            const fullNameParts = (metadata.fullName || 'Customer User').trim().split(' ');
            const firstName = fullNameParts[0] || 'Customer';
            const lastName = fullNameParts.slice(1).join(' ') || 'User';

            const paymentKeyRes = await fetch(`${config.PAYMOB_BASE_URL}/acceptance/payment_keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_token: authToken,
                    amount_cents: amountCents,
                    expiration: 3600,
                    order_id: paymobOrderId,
                    billing_data: {
                        apartment: 'NA',
                        email: metadata.email || 'customer@mrxsteroid.com',
                        floor: 'NA',
                        first_name: firstName,
                        street: 'NA',
                        building: 'NA',
                        phone_number: sanitizePhone((metadata.phoneNumber as string) || '+201000000000'),
                        shipping_method: 'PKG',
                        postal_code: 'NA',
                        city: (metadata.city as string) || 'Cairo',
                        country: method === 'paypal' ? 'US' : 'EG',
                        last_name: lastName,
                        state: 'NA',
                    },
                    currency: orderCurrency,
                    integration_id: integrationId,
                    lock_order_when_paid: 'true',
                }),
            });

            if (!paymentKeyRes.ok) {
                const pkErrText = await paymentKeyRes.text();
                console.error('❌ [Paymob] Payment key request failed:', pkErrText);
                throw new Error(`Paymob payment key request failed: ${paymentKeyRes.statusText}`);
            }

            const paymentKeyData = await paymentKeyRes.json() as { token: string };
            const paymentToken = paymentKeyData.token;
            if (!paymentToken) throw new Error('No payment token returned from Paymob');

            // ── STEP 4: EXECUTE PAYMENT METHOD SPECIFIC REDIRECT ─────────────
            // Use Paymob Unified Checkout — works with payment_token only, no iframe_id needed.
            // The old iframes/{id} endpoint requires a separate iFrame ID from the dashboard,
            // which is different from the integration ID.
            let redirectUrl = `https://accept.paymob.com/unifiedcheckout/?payment_token=${paymentToken}`;

            if (method === 'wallet') {
                // Execute Paymob Wallet API
                const walletRes = await fetch(`${config.PAYMOB_BASE_URL}/acceptance/payments/pay`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source: {
                            identifier: sanitizePhone((metadata.phoneNumber as string) || '01010101010'),
                            subtype: 'WALLET',
                        },
                        payment_token: paymentToken,
                    }),
                });

                if (walletRes.ok) {
                    const walletData = await walletRes.json() as { redirect_url?: string; iframe_redirection_url?: string };
                    if (walletData.redirect_url || walletData.iframe_redirection_url) {
                        redirectUrl = (walletData.redirect_url || walletData.iframe_redirection_url)!;
                    }
                }
            } else if (method === 'kiosk') {
                // Execute Paymob Kiosk API
                const kioskRes = await fetch(`${config.PAYMOB_BASE_URL}/acceptance/payments/pay`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source: {
                            identifier: 'AGGREGATOR',
                            subtype: 'AGGREGATOR',
                        },
                        payment_token: paymentToken,
                    }),
                });

                if (kioskRes.ok) {
                    const kioskData = await kioskRes.json() as { pending?: boolean; data?: { bill_reference?: number } };
                    if (kioskData.data?.bill_reference) {
                        // Pass bill reference as URL parameter for clear display to user
                        // Use real kiosk integration ID (not static placeholder)
                        redirectUrl = `https://accept.paymob.com/unifiedcheckout/?payment_token=${paymentToken}&bill_reference=${kioskData.data.bill_reference}`;
                    }
                }
            }

            console.log(`✅ [Paymob] Intention flow successful. Order ID: ${paymobOrderId}, Redirecting to: ${redirectUrl}`);

            return {
                redirectUrl,
                externalReferenceId: String(paymobOrderId),
            };

        } catch (error) {
            console.error('❌ [Paymob] Error in Paymob 3-step flow:', error);
            throw error;
        }
    }

    /**
     * Verify Paymob Webhook / Callback Notification
     */
    async verifyWebhook(req: VercelRequest, _rawBody: string): Promise<WebhookVerificationResult> {
        const config = getPaymobConfig();
        const hmacHeader = (req.headers['hmac'] as string) || (req.query?.hmac as string);

        if (!hmacHeader) {
            return { valid: false, errorMessage: 'Missing Paymob HMAC header' };
        }

        if (!config.HMAC_SECRET) {
            // Fail-closed: never accept a webhook when the HMAC secret is missing.
            // Auto-accepting in "test mode" would let unauthenticated callers mark payments as successful.
            console.error('❌ [Paymob] HMAC secret not configured — refusing to verify webhook (fail-closed).');
            return { valid: false, errorMessage: 'Paymob HMAC secret not configured' };
        }

        // Parse callback body
        let callbackData: Record<string, unknown>;
        try {
            callbackData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch {
            callbackData = req.query as Record<string, unknown>;
        }

        const obj = (callbackData.obj || callbackData) as Record<string, unknown>;
        if (!obj) {
            return { valid: false, errorMessage: 'Missing obj field in Paymob callback' };
        }

        // HMAC Calculation
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
            .createHmac('sha512', config.HMAC_SECRET)
            .update(concatenated)
            .digest('hex');

        const isValid = expectedHmac === hmacHeader;

        if (!isValid) {
            console.error('❌ [Paymob] HMAC verification failed');
            return { valid: false, errorMessage: 'Invalid HMAC signature' };
        }

        const merchantOrderId = (obj.order as Record<string, unknown>)?.merchant_order_id as string || String(obj.merchant_order_id || '');
        const isSuccess = obj.success === true;

        return {
            valid: true,
            invoiceId: merchantOrderId,
            status: isSuccess ? 'success' : 'failed',
            externalReferenceId: String(obj.id),
            paidAmount: obj.amount_cents != null ? Number(obj.amount_cents) / 100 : undefined,
            errorMessage: isSuccess ? undefined : String(obj.data_message || 'Payment failed'),
        };
    }
}
