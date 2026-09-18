/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CHECKOUT SESSION SERVICE — Phase 4 (Final Gate v5.1 §35–§37, §12)
 *
 *  Primary checkout orchestration:
 *    Product → server Order/Invoice → PaymentIntent → server-side pricing →
 *    region/merchant/currency resolution → Kashier Payment Session
 *
 *  Guarantees:
 *  - The website is the business source of truth: amount, currency, merchant
 *    and payment methods are ALWAYS resolved server-side; nothing client
 *    supplied is trusted (v5.1 §19/§20/§46/§47).
 *  - Idempotency (§12 / K-2 C5): a repeated identical request returns the prior
 *    session and never creates a duplicate PaymentIntent.
 *  - Every session is linked to invoice + payment_intent (v5.1 §36).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { KashierGateway } from '../gateways/KashierGateway';
import {
    getMerchantConfig,
    resolveRegion,
    type MerchantRegion,
    type PaymentMethodId,
} from '../merchantResolver';
import {
    loadPricing,
    computeAmount,
    computePromoDiscount,
    resolveShippingCost,
    type TierId,
} from '../pricing';
import { createPaymentIntentAttempt } from '../paymentIntentService';

/** Digital-only tiers are never charged shipping (Phase 4 requirement #4). */
export const DIGITAL_TIERS: TierId[] = ['digital', 'digital_plus', 'pdf'];
/** Egypt fixed shipping comes from server config, not the frontend. */
export const DEFAULT_EGYPT_SHIPPING_PROVIDER = 'eg_standard';

export class CheckoutValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CheckoutValidationError';
    }
}

export interface CheckoutShippingAddress {
    address?: string;
    city?: string;
    zipCode?: string;
    phone?: string;
}

export interface CheckoutAttribution {
    affiliateId?: string | null;
    referralCode?: string | null;
    attributionTimestamp?: string | null;
    attributionExpiresAt?: string | null;
}

export interface CreateCheckoutSessionInput {
    tierId: TierId;
    email: string;
    fullName: string;
    /** Raw geo/IP country — a ROUTING HINT only (v5.1 §46). */
    country?: string;
    userId?: string | null;
    locale?: 'ar' | 'en';
    quantity?: number;
    shippingProviderId?: string;
    /** Client-reported shipping hint; never authoritative. */
    shippingCost?: number;
    shippingAddress?: CheckoutShippingAddress;
    promoCode?: string;
    idempotencyKey?: string;
    attribution?: CheckoutAttribution;
    metadata?: Record<string, unknown>;
}

export interface CreateCheckoutSessionResult {
    invoiceId: string;
    orderRef: string;
    sessionId: string;
    sessionUrl: string;
    amount: number;
    currency: string;
    region: MerchantRegion;
    merchantId: string;
    paymentMethods: PaymentMethodId[];
    environment: 'test' | 'live';
    idempotent: boolean;
}

/** The only gateway capability Phase 4 checkout orchestration depends on. */
export type CheckoutSessionGateway = Pick<KashierGateway, 'createPaymentSession'>;

export interface CheckoutSessionDeps {
    supabase?: SupabaseClient;
    gatewayFactory?: (region: MerchantRegion) => CheckoutSessionGateway;
    pricingRows?: () => Promise<Array<{ key: string; value: string }>>;
    generateIdempotencyKey?: () => string;
}

function getSupabaseAdmin(): SupabaseClient {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('[CheckoutSession] Missing Supabase admin env vars.');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const isUniqueViolation = (code?: string) => code === '23505';

export async function createCheckoutSession(
    input: CreateCheckoutSessionInput,
    deps: CheckoutSessionDeps = {}
): Promise<CreateCheckoutSessionResult> {
    const supabase = deps.supabase || getSupabaseAdmin();

    // ── 1. Server-side region / merchant / currency resolution (never client) ──
    const region = resolveRegion({ country: input.country });
    const merchant = getMerchantConfig(region);
    const currency = merchant.currency;
    const environment = merchant.mode;
    const isDigital = DIGITAL_TIERS.includes(input.tierId);

    if (!input.email || !/^\S+@\S+\.\S+$/.test(input.email)) {
        throw new CheckoutValidationError('A valid customer email is required.');
    }
    if (!input.fullName || input.fullName.trim().length < 2) {
        throw new CheckoutValidationError('Customer full name is required.');
    }

    // Physical Egypt orders require shipping details (Phase 4 requirement #4).
    if (region === 'EGYPT' && !isDigital) {
        const addr = input.shippingAddress;
        if (!addr?.address || !addr?.city) {
            throw new CheckoutValidationError(
                'Egypt physical orders require a shipping address and city.'
            );
        }
    }

    // ── 2. Server-side pricing (website is the source of truth) ───────────────
    const rowLoader = deps.pricingRows || (async () => {
        const { data } = await supabase.from('admin_settings').select('key, value');
        return (data || []) as Array<{ key: string; value: string }>;
    });
    const pricing = await loadPricing(rowLoader);
    const quantity = Math.max(1, Math.floor(input.quantity || 1));

    let shippingCost = 0;
    if (!isDigital) {
        const providerId = input.shippingProviderId
            || (region === 'EGYPT' ? DEFAULT_EGYPT_SHIPPING_PROVIDER : undefined);
        shippingCost = resolveShippingCost(pricing, providerId, input.shippingCost ?? 0, currency);
    }

    const subtotalForDiscount = computeAmount(pricing, {
        tierId: input.tierId,
        currency,
        quantity,
        shippingCost,
        discount: 0,
    });
    const discount = computePromoDiscount(input.promoCode, subtotalForDiscount, currency);
    const amount = computeAmount(pricing, {
        tierId: input.tierId,
        currency,
        quantity,
        shippingCost,
        discount,
    });

    if (!(amount > 0)) {
        throw new CheckoutValidationError('Server-computed amount must be greater than zero.');
    }

    const idempotencyKey = input.idempotencyKey
        || (deps.generateIdempotencyKey ? deps.generateIdempotencyKey() : randomUUID());

    // ── 3. Idempotency lookup (§12 / K-2 C5) ─────────────────────────────────
    const { data: existing, error: lookupError } = await supabase
        .from('invoices')
        .select('id, amount, currency, kashier_session_id, kashier_session_url')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

    if (lookupError) {
        throw new Error(`[CheckoutSession] Idempotency lookup failed: ${lookupError.message}`);
    }

    if (existing?.id && existing.kashier_session_url && existing.kashier_session_id) {
        return {
            invoiceId: existing.id,
            orderRef: existing.id,
            sessionId: existing.kashier_session_id,
            sessionUrl: existing.kashier_session_url,
            amount: Number(existing.amount ?? amount),
            currency: existing.currency ?? currency,
            region,
            merchantId: merchant.merchantId,
            paymentMethods: merchant.paymentMethods,
            environment,
            idempotent: true,
        };
    }

    // ── 4. Create (or reuse) the internal Order/Invoice ──────────────────────
    let invoiceId = existing?.id as string | undefined;

    if (!invoiceId) {
        const { data: invoice, error: insertError } = await supabase
            .from('invoices')
            .insert({
                user_id: input.userId || null,
                gateway: 'kashier',
                status: 'pending',
                payment_status: 'pending',
                tier_id: input.tierId,
                amount,
                currency,
                payment_provider_merchant: `kashier_${region.toLowerCase()}`,
                region: region.toLowerCase(),
                shipping_cost: shippingCost,
                discount_amount: discount,
                promo_code: input.promoCode || null,
                customer_email: input.email,
                customer_name: input.fullName,
                phone_number: input.shippingAddress?.phone || null,
                idempotency_key: idempotencyKey,
                metadata: input.metadata || {},
                affiliate_id: input.attribution?.affiliateId || null,
                referral_code: input.attribution?.referralCode || null,
                attribution_timestamp: input.attribution?.attributionTimestamp || null,
                attribution_expires_at: input.attribution?.attributionExpiresAt || null,
            })
            .select('id')
            .single();

        if (insertError || !invoice) {
            // Concurrent duplicate request lost the unique-index race → reuse winner.
            if (isUniqueViolation(insertError?.code)) {
                const { data: winner, error: winnerError } = await supabase
                    .from('invoices')
                    .select('id, amount, currency, kashier_session_id, kashier_session_url')
                    .eq('idempotency_key', idempotencyKey)
                    .maybeSingle();
                if (winnerError || !winner) {
                    throw new Error(`[CheckoutSession] Idempotency race unresolvable: ${winnerError?.message}`);
                }
                if (winner.kashier_session_url && winner.kashier_session_id) {
                    return {
                        invoiceId: winner.id,
                        orderRef: winner.id,
                        sessionId: winner.kashier_session_id,
                        sessionUrl: winner.kashier_session_url,
                        amount: Number(winner.amount ?? amount),
                        currency: winner.currency ?? currency,
                        region,
                        merchantId: merchant.merchantId,
                        paymentMethods: merchant.paymentMethods,
                        environment,
                        idempotent: true,
                    };
                }
                invoiceId = winner.id;
            } else {
                throw new Error(`[CheckoutSession] Failed to create invoice: ${insertError?.message}`);
            }
        } else {
            invoiceId = invoice.id;
        }
    }

    if (!invoiceId) {
        throw new Error('[CheckoutSession] Failed to resolve an invoice id for the checkout session.');
    }

    const orderRef = invoiceId;
    const amountMinor = Math.round(amount * 100);

    // ── 5. PaymentIntent attempt (1:N per invoice, is_current enforced) ──────
    const intent = await createPaymentIntentAttempt(
        {
            invoiceId,
            provider: 'kashier',
            merchantReference: orderRef,
            amountMinor,
            currency,
            environment,
            metadata: {
                region,
                tier: input.tierId,
                quantity,
                shippingCost,
                discount,
                idempotencyKey,
            },
        },
        supabase
    );

    // ── 6. Mint the Kashier Payment Session (PRIMARY checkout path) ─────────
    const gateway = deps.gatewayFactory
        ? deps.gatewayFactory(region)
        : new KashierGateway(region === 'EGYPT' ? 'egypt' : 'global');

    const session = await gateway.createPaymentSession({
        orderRef,
        amount,
        currency,
        customerEmail: input.email,
        customerName: input.fullName,
        locale: input.locale || 'en',
        paymentMethods: merchant.paymentMethods,
        defaultMethod: merchant.defaultMethod,
        serverWebhook: merchant.webhookUrl,
    });

    // ── 7. Persist session linkage on invoice + payment intent ───────────────
    const { error: linkError } = await supabase
        .from('invoices')
        .update({
            kashier_session_id: session.sessionId,
            kashier_session_url: session.sessionUrl,
            kashier_order_id: orderRef,
            gateway_reference_id: session.sessionId,
            updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);
    if (linkError) {
        throw new Error(`[CheckoutSession] Failed to persist session linkage: ${linkError.message}`);
    }

    await supabase
        .from('payment_intents')
        .update({
            provider_order_id: session.sessionId,
            status: 'pending',
            metadata: { ...(intent.metadata || {}), session_url: session.sessionUrl },
            updated_at: new Date().toISOString(),
        })
        .eq('id', intent.id);

    return {
        invoiceId,
        orderRef,
        sessionId: session.sessionId,
        sessionUrl: session.sessionUrl,
        amount,
        currency,
        region,
        merchantId: merchant.merchantId,
        paymentMethods: merchant.paymentMethods,
        environment,
        idempotent: false,
    };
}
