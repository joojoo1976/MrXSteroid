/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  COMBINED CHECKOUT SESSION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Orchestrates the authorized combined-order flow:
 *
 *    selections → server validation → canonical prices → shipping →
 *    ONE invoice → ONE payment intent → ONE Kashier session
 *
 *  Guarantees:
 *  - Exactly one invoice, one `orders` row, one payment intent and one Kashier
 *    session represent the whole purchase. There is never one charge per line.
 *  - The line breakdown is persisted in `orders.items` (jsonb) and mirrored on
 *    `invoices.metadata`, reusing the structures that already exist in the
 *    schema. No new table is required.
 *  - `invoices.amount` / `orders.amount` carry the single authoritative total.
 *  - Idempotency is keyed on `invoices.idempotency_key` exactly as the
 *    single-tier flow does, so a repeated submit never mints a second payable
 *    session.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { KashierGateway } from '../gateways/KashierGateway';
import {
    getMerchantConfig,
    resolveRegion,
    type MerchantRegion,
} from '../merchantResolver';
import { loadPricing } from '../pricing';
import { createPaymentIntentAttempt } from '../paymentIntentService';
import {
    computeCombinedOrder,
    CombinedOrderValidationError,
    type CombinedLineInput,
    type CombinedOrderTotals,
} from '../combinedOrder';
import {
    CheckoutConflictError,
    CheckoutValidationError,
    type CheckoutShippingAddress,
} from './checkoutSessionService';

export type { CombinedLineInput };

export interface CombinedCheckoutSessionInput {
    lines: CombinedLineInput[];
    email: string;
    fullName: string;
    country?: string;
    userId?: string | null;
    locale?: 'ar' | 'en';
    shippingProviderId?: string;
    /** Client hint only. Never used as an accounting input. */
    shippingCost?: number;
    shippingAddress?: CheckoutShippingAddress;
    promoCode?: string;
    idempotencyKey?: string;
    metadata?: Record<string, unknown>;
    /** Optional client claim, checked against the server total and never trusted. */
    clientReportedTotal?: number;
}

export interface CombinedCheckoutSessionResult {
    invoiceId: string;
    orderId: string;
    orderRef: string;
    sessionId: string;
    sessionUrl: string;
    /** The single authoritative total for the entire combined order. */
    amount: number;
    currency: string;
    region: MerchantRegion;
    merchantId: string;
    paymentMethods: string[];
    environment: string;
    lines: CombinedOrderTotals['lines'];
    subtotal: number;
    shippingCost: number;
    discount: number;
    idempotent: boolean;
}

export type CombinedCheckoutGateway = Pick<KashierGateway, 'createPaymentSession'>;

export interface CombinedCheckoutDeps {
    supabase?: SupabaseClient;
    gatewayFactory?: (region: MerchantRegion) => CombinedCheckoutGateway;
    pricingRows?: () => Promise<Array<{ key: string; value: string }>>;
    generateIdempotencyKey?: () => string;
}

function getSupabaseAdmin(): SupabaseClient {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('[CombinedCheckout] Missing Supabase admin env vars.');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const isUniqueViolation = (code?: string) => code === '23505';

/**
 * Rebuild the response for an order that already exists.
 *
 * `orderRef` is the Kashier-facing reference and is the invoice id (see step 6),
 * but `orderId` must be the real `orders` row id. Returning the invoice id for
 * both would hand the caller a value that looks like an order id and resolves to
 * no order at all, so the order row is read back explicitly.
 *
 * Returns `null` when the invoice has no linked order row yet, which means the
 * caller cannot honour the replay and must surface a conflict instead.
 */
async function buildIdempotentResult(
    supabase: SupabaseClient,
    invoice: {
        id: string;
        amount?: number | null;
        currency?: string | null;
        kashier_session_id?: string | null;
        kashier_session_url?: string | null;
    },
    context: {
        totals: CombinedOrderTotals;
        region: MerchantRegion;
        merchantId: string;
        paymentMethods: string[];
        environment: string;
        amount: number;
        currency: string;
    }
): Promise<CombinedCheckoutSessionResult | null> {
    if (!invoice.kashier_session_url || !invoice.kashier_session_id) return null;

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('invoice_id', invoice.id)
        .maybeSingle();

    if (orderError) {
        throw new Error(`[CombinedCheckout] Idempotent order lookup failed: ${orderError.message}`);
    }
    if (!order?.id) return null;

    return {
        invoiceId: invoice.id,
        orderId: order.id,
        orderRef: invoice.id,
        sessionId: invoice.kashier_session_id,
        sessionUrl: invoice.kashier_session_url,
        amount: Number(invoice.amount ?? context.amount),
        currency: invoice.currency ?? context.currency,
        region: context.region,
        merchantId: context.merchantId,
        paymentMethods: context.paymentMethods,
        environment: context.environment,
        lines: context.totals.lines,
        subtotal: context.totals.subtotal,
        shippingCost: context.totals.shippingCost,
        discount: context.totals.discount,
        idempotent: true,
    };
}

export async function createCombinedCheckoutSession(
    input: CombinedCheckoutSessionInput,
    deps: CombinedCheckoutDeps = {}
): Promise<CombinedCheckoutSessionResult> {
    const supabase = deps.supabase || getSupabaseAdmin();

    // ── 1. Server-side region / merchant / currency resolution (never client) ──
    const region = resolveRegion({ country: input.country });
    const merchant = getMerchantConfig(region);
    const currency = merchant.currency;
    const environment = merchant.mode;

    if (!input.email || !/^\S+@\S+\.\S+$/.test(input.email)) {
        throw new CheckoutValidationError('A valid customer email is required.');
    }
    if (!input.fullName || input.fullName.trim().length < 2) {
        throw new CheckoutValidationError('Customer full name is required.');
    }

    // ── 2. Authoritative combined total from the canonical pricing system ─────
    const rowLoader = deps.pricingRows || (async () => {
        const { data } = await supabase.from('admin_settings').select('key, value');
        return (data || []) as Array<{ key: string; value: string }>;
    });
    const pricing = await loadPricing(rowLoader);

    let totals: CombinedOrderTotals;
    try {
        totals = computeCombinedOrder(pricing, {
            lines: input.lines,
            region: region === 'EGYPT' ? 'EGYPT' : 'GLOBAL',
            currency,
            shippingProviderId: input.shippingProviderId,
            legacyClientShippingCost: input.shippingCost,
            promoCode: input.promoCode,
            clientReportedTotal: input.clientReportedTotal,
        });
    } catch (error) {
        if (error instanceof CombinedOrderValidationError) {
            throw new CheckoutValidationError(error.message);
        }
        throw error;
    }

    // Physical Egypt orders require shipping details.
    if (region === 'EGYPT' && totals.requiresShipping) {
        const addr = input.shippingAddress;
        if (!addr?.address || !addr?.city) {
            throw new CheckoutValidationError(
                'Egypt physical orders require a shipping address and city.'
            );
        }
    }

    const amount = totals.total;
    const idempotencyKey = input.idempotencyKey
        || (deps.generateIdempotencyKey ? deps.generateIdempotencyKey() : randomUUID());

    // ── 3. Idempotency: never mint a second payable session ──────────────────
    const { data: existing, error: lookupError } = await supabase
        .from('invoices')
        .select('id, amount, currency, kashier_session_id, kashier_session_url, metadata')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

    if (lookupError) {
        throw new Error(`[CombinedCheckout] Idempotency lookup failed: ${lookupError.message}`);
    }

    if (existing?.id) {
        const replayed = await buildIdempotentResult(supabase, existing, {
            totals,
            region,
            merchantId: merchant.merchantId,
            paymentMethods: merchant.paymentMethods,
            environment,
            amount,
            currency,
        });
        if (replayed) return replayed;

        throw new CheckoutConflictError(
            'A combined checkout for this idempotency key is already in progress. Retry shortly or start a new checkout.'
        );
    }

    // The line breakdown travels with the invoice so the payable artifact is
    // self-describing even before the `orders` row is linked.
    const orderLines = totals.lines.map((line) => ({
        kind: line.kind,
        tierId: line.tierId,
        quantity: line.quantity,
        unitAmount: line.unitAmount,
        amount: line.amount,
        shippable: line.shippable,
    }));

    // ── 4. ONE invoice for the entire combined order ─────────────────────────
    let invoiceId: string;
    {
        const { data: invoice, error: insertError } = await supabase
            .from('invoices')
            .insert({
                user_id: input.userId || null,
                gateway: 'kashier',
                status: 'pending',
                payment_status: 'pending',
                tier_id: totals.primaryTierId,
                amount,
                currency,
                payment_provider_merchant: `kashier_${region.toLowerCase()}`,
                region: region.toLowerCase(),
                shipping_cost: totals.shippingCost,
                discount_amount: totals.discount,
                promo_code: input.promoCode || null,
                customer_email: input.email,
                customer_name: input.fullName,
                phone_number: input.shippingAddress?.phone || null,
                idempotency_key: idempotencyKey,
                metadata: {
                    ...(input.metadata || {}),
                    order_kind: 'combined',
                    lines: orderLines,
                    subtotal: totals.subtotal,
                    shipping_provider_id: totals.shippingProviderId,
                },
            })
            .select('id')
            .single();

        if (insertError || !invoice) {
            if (isUniqueViolation(insertError?.code)) {
                const { data: winner, error: winnerError } = await supabase
                    .from('invoices')
                    .select('id, amount, currency, kashier_session_id, kashier_session_url')
                    .eq('idempotency_key', idempotencyKey)
                    .maybeSingle();
                if (winnerError || !winner) {
                    throw new Error(`[CombinedCheckout] Idempotency race unresolvable: ${winnerError?.message}`);
                }
                const replayed = await buildIdempotentResult(supabase, winner, {
                    totals,
                    region,
                    merchantId: merchant.merchantId,
                    paymentMethods: merchant.paymentMethods,
                    environment,
                    amount,
                    currency,
                });
                if (replayed) return replayed;
                throw new CheckoutConflictError(
                    'A concurrent combined checkout for this idempotency key is already in progress. Retry shortly.'
                );
            }
            throw new Error(`[CombinedCheckout] Failed to create invoice: ${insertError?.message}`);
        }
        invoiceId = invoice.id;
    }

    // ── 5. ONE order row, linked to the invoice, carrying the line breakdown ──
    const orderId = randomUUID();
    {
        const { error: orderError } = await supabase.from('orders').insert({
            id: orderId,
            invoice_id: invoiceId,
            user_id: input.userId || null,
            fullname: input.fullName,
            email: input.email,
            phone: input.shippingAddress?.phone || null,
            address: input.shippingAddress?.address ?? null,
            city: input.shippingAddress?.city ?? null,
            country: input.shippingAddress?.country ?? (region === 'EGYPT' ? 'EG' : 'US'),
            postalcode: input.shippingAddress?.zipCode ?? null,
            amount,
            status: 'pending',
            items: orderLines,
            region: region.toLowerCase(),
            currency,
            payment_provider_merchant: `kashier_${region.toLowerCase()}`,
            payment_status: 'pending',
            payment_method: 'kashier',
            source_channel: 'web_checkout',
        });

        if (orderError) {
            // Do not leave an orphan payable invoice behind.
            await supabase.from('invoices').delete().eq('id', invoiceId);
            throw new Error(`[CombinedCheckout] Failed to create order: ${orderError.message}`);
        }
    }

    // ── 6. ONE payment intent for the whole total ────────────────────────────
    const orderRef = invoiceId;
    const amountMinor = Math.round(amount * 100);

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
                orderKind: 'combined',
                lines: orderLines,
                subtotal: totals.subtotal,
                shippingCost: totals.shippingCost,
                discount: totals.discount,
                idempotencyKey,
            },
        },
        supabase
    );

    // ── 7. ONE Kashier session for the single combined amount ─────────────────
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

    // ── 8. Link the session to the invoice, the order and the intent ─────────
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
        throw new Error(`[CombinedCheckout] Failed to persist session linkage: ${linkError.message}`);
    }

    await supabase
        .from('orders')
        .update({
            external_provider: 'kashier',
            external_order_id: session.sessionId,
            external_payment_reference: session.sessionId,
        })
        .eq('id', orderId);

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
        orderId,
        orderRef,
        sessionId: session.sessionId,
        sessionUrl: session.sessionUrl,
        amount,
        currency,
        region,
        merchantId: merchant.merchantId,
        paymentMethods: merchant.paymentMethods,
        environment,
        lines: totals.lines,
        subtotal: totals.subtotal,
        shippingCost: totals.shippingCost,
        discount: totals.discount,
        idempotent: false,
    };
}
