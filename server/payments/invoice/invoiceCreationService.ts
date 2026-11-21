/**
 * Invoice creation service — Phase 4.
 *
 * Verifies the Phase 3 quote token, re-prices the cart from scratch, and calls
 * the `create_invoice_atomic` PostgreSQL function so `orders`, `invoices`, and
 * `invoice_lines` are written in ONE transaction.
 *
 * The quote token's numeric fields are NEVER accounting inputs. They are used
 * only to detect a stale quote (catalog/env changed after the quote was signed).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
    QuoteTokenError,
    QuoteValidationError,
    buildQuote,
    verifyQuoteToken,
    type QuoteRequest,
    type QuoteResult,
} from '../quote';

export class InvoiceCreationError extends Error {
    readonly code: string;
    constructor(code: string, message: string) {
        super(message);
        this.name = 'InvoiceCreationError';
        this.code = code;
    }
}

export class IdempotencyConflictError extends InvoiceCreationError {
    constructor(message: string) {
        super('IDEMPOTENCY_KEY_REUSED', message);
        this.name = 'IdempotencyConflictError';
    }
}

export class QuoteStaleError extends InvoiceCreationError {
    constructor(message: string) {
        super('QUOTE_STALE', message);
        this.name = 'QuoteStaleError';
    }
}

export interface InvoiceCustomer {
    email: string;
    fullName: string;
    phoneNumber?: string;
    userId?: string | null;
    locale?: 'ar' | 'en';
}

export interface CreateInvoiceFromQuoteInput {
    quoteToken: string;
    cart: QuoteRequest;
    customer: InvoiceCustomer;
    idempotencyKey: string;
    metadata?: Record<string, unknown>;
    /** Stored on the pending invoice until create-session selects the gateway. */
    gateway?: string;
}

export interface CreatedInvoice {
    invoiceId: string;
    orderId: string;
    amount: number;
    currency: 'EGP' | 'USD';
    region: 'EGYPT' | 'GLOBAL';
    pricingVersion: string;
    quoteHash: string;
    idempotent: boolean;
}

export interface InvoiceCreationDeps {
    supabase?: SupabaseClient;
}

function getSupabaseAdmin(): SupabaseClient {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[CreateInvoice] Missing SUPABASE_URL env var.');
    if (!key) throw new Error('[CreateInvoice] Missing SUPABASE_SERVICE_ROLE_KEY env var.');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export interface InvoiceRow {
    id: string;
    amount: number | string;
    currency: string;
    status: string | null;
    payment_status: string | null;
    region: string | null;
    gateway: string | null;
    tier_id: string;
    customer_email: string | null;
    customer_name: string | null;
    phone_number: string | null;
    idempotency_key: string | null;
    kashier_session_id: string | null;
    kashier_session_url: string | null;
    kashier_order_id: string | null;
    metadata: Record<string, unknown> | null;
    pricing_version: string | null;
    quote_hash: string | null;
}

/**
 * Verify the quote, re-price from the canonical catalog, and compare the
 * server-computed cart hash + total. This rejects:
 *  - tampered/expired tokens,
 *  - a token for a different cart,
 *  - a stale quote after a catalog/env price change.
 */
export function verifyAndRepriceQuote(
    quoteToken: string,
    cart: QuoteRequest
): { quote: QuoteResult; tokenTotal: number; tokenCurrency: string } {
    // 1. Signature + TTL first (no pricing work on an invalid token).
    const token = verifyQuoteToken(quoteToken);

    // 2. Full re-price from pricing.ts. No number from the token is reused.
    const quote = buildQuote(cart);

    // 3. The token must describe THIS cart.
    if (quote.cart_hash !== token.cart_hash) {
        throw new QuoteTokenError('CART_MISMATCH', 'Quote token does not match the submitted cart.');
    }
    if (quote.pricing_version !== token.pricing_version) {
        throw new QuoteStaleError('The pricing catalog changed after this quote was issued. Please re-quote.');
    }
    if (quote.currency !== token.currency || quote.total !== token.total) {
        throw new QuoteStaleError('The quote total changed after it was signed. Please re-quote.');
    }

    return { quote, tokenTotal: token.total, tokenCurrency: token.currency };
}

function nullable(value: string | undefined | null): string | null {
    return value && value.trim() ? value.trim() : null;
}

/**
 * Build the JSONB line payload expected by `create_invoice_atomic`.
 * Every amount here comes from the re-priced `QuoteResult`.
 */
export function buildInvoiceLinePayload(quote: QuoteResult): Array<Record<string, unknown>> {
    return quote.lines.map((line) => ({
        line_type: line.line_type,
        sku: line.sku,
        product_id: line.sku,
        name_snapshot: line.name_snapshot,
        language: line.language,
        edition: line.edition,
        qty: line.qty,
        unit_price: line.unit_price,
        discount_amount: line.discount_amount,
        tax_amount: line.tax_amount,
        line_total: line.line_total,
        currency: line.currency,
        source: line.source,
        position: line.position,
        metadata: line.metadata,
    }));
}

export async function createInvoiceFromQuote(
    input: CreateInvoiceFromQuoteInput,
    deps: InvoiceCreationDeps = {}
): Promise<CreatedInvoice> {
    if (!input.idempotencyKey || !input.idempotencyKey.trim()) {
        throw new InvoiceCreationError('IDEMPOTENCY_KEY_REQUIRED', 'An idempotency key is required.');
    }

    let quote: QuoteResult;
    try {
        ({ quote } = verifyAndRepriceQuote(input.quoteToken, input.cart));
    } catch (error) {
        if (error instanceof QuoteValidationError || error instanceof QuoteTokenError) throw error;
        throw error;
    }

    // No database client is constructed until the token and cart are valid.
    const supabase = deps.supabase ?? getSupabaseAdmin();

    const tierId = quote.lines.find((line) => line.line_type === 'product')?.sku
        ?? quote.lines[0]?.sku
        ?? 'custom';

    const metadata = {
        ...(input.metadata ?? {}),
        quote: true,
        cart_hash: quote.cart_hash,
        quote_hash: quote.cart_hash,
        pricing_version: quote.pricing_version,
        line_count: quote.lines.length,
    };

    const { data, error } = await supabase.rpc('create_invoice_atomic', {
        p_user_id: input.customer.userId || null,
        p_gateway: input.gateway || 'invoice_first',
        p_tier_id: tierId,
        p_amount: quote.total,
        p_currency: quote.currency,
        p_region: quote.region,
        p_shipping_cost: quote.shipping,
        p_discount_amount: quote.discount,
        p_promo_code: nullable(input.cart.promoCode),
        p_customer_email: input.customer.email,
        p_customer_name: input.customer.fullName,
        p_phone_number: nullable(input.customer.phoneNumber ?? input.cart.shippingAddress?.phone),
        p_shipping_address: input.cart.shippingAddress
            ? JSON.stringify(input.cart.shippingAddress)
            : null,
        p_idempotency_key: input.idempotencyKey.trim(),
        p_pricing_version: quote.pricing_version,
        p_quote_hash: quote.cart_hash,
        p_metadata: metadata,
        p_lines: buildInvoiceLinePayload(quote),
    });

    if (error) {
        throw new InvoiceCreationError(
            'ATOMIC_WRITE_FAILED',
            `[CreateInvoice] Atomic write failed: ${error.message}`
        );
    }

    const row = (Array.isArray(data) ? data[0] : data) as
        | {
            invoice_id?: string;
            order_id?: string;
            amount?: number | string;
            currency?: string;
            pricing_version?: string;
            quote_hash?: string;
            idempotent?: boolean;
        }
        | null;

    if (!row?.invoice_id || !row?.order_id) {
        throw new InvoiceCreationError(
            'ATOMIC_WRITE_INCOMPLETE',
            '[CreateInvoice] Atomic write returned no invoice/order id.'
        );
    }

    // A key must never be reused for a different cart.
    if (row.quote_hash !== quote.cart_hash) {
        throw new IdempotencyConflictError(
            'This idempotency key was already used for a different cart. Use a new key.'
        );
    }

    return {
        invoiceId: row.invoice_id,
        orderId: row.order_id,
        amount: Number(row.amount ?? quote.total),
        currency: (row.currency ?? quote.currency) as 'EGP' | 'USD',
        region: quote.region,
        pricingVersion: row.pricing_version ?? quote.pricing_version,
        quoteHash: quote.cart_hash,
        idempotent: Boolean(row.idempotent),
    };
}

/**
 * Load the authoritative invoice row used by create-session.
 * The amount/currency returned here are the ONLY values a gateway may receive.
 */
export async function loadInvoiceForSession(
    supabase: SupabaseClient,
    invoiceId: string
): Promise<InvoiceRow | null> {
    const { data, error } = await supabase
        .from('invoices')
        .select(
            'id, amount, currency, status, payment_status, region, gateway, tier_id, ' +
            'customer_email, customer_name, phone_number, idempotency_key, ' +
            'kashier_session_id, kashier_session_url, kashier_order_id, metadata, ' +
            'pricing_version, quote_hash'
        )
        .eq('id', invoiceId)
        .maybeSingle();

    if (error) {
        throw new InvoiceCreationError(
            'INVOICE_READ_FAILED',
            `[CreateSession] Failed to load invoice: ${error.message}`
        );
    }
    return (data as InvoiceRow | null) ?? null;
}
