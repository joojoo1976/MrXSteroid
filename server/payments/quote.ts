/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CHECKOUT QUOTE — Phase 3 (read-only, signed)
 *
 *  The server builds a proposed multi-line quote from the canonical catalog.
 *  Nothing here writes to the database: no order, invoice, intent or session.
 *
 *  The quote token is an HMAC-signed, short-lived envelope carrying:
 *    - cart_hash     (stable hash of the normalized cart)
 *    - pricing_version
 *    - currency / region / total
 *    - exp / iat
 *
 *  Phase 4 MUST re-price the cart from pricing.ts and compare cart_hash; the
 *  numeric fields in the token are audit data, never accounting inputs.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { z } from 'zod';
import {
    DEFAULT_EGYPT_SHIPPING_PROVIDER,
    PRICING_VERSION,
    ShippingConfigurationError,
    basePricing,
    computePromoDiscount,
    isShippableTier,
    resolveShippingForCheckout,
    type PricingConfig,
} from './pricing';
import { FlatRateProvider, FLAT_RATE_SERVICE_CODE } from '../shipping/FlatRateProvider';

export const QUOTE_TTL_SECONDS = 10 * 60;
export const QUOTE_TOKEN_VERSION = 1;

/** Client-supplied price/accounting fields are forbidden in a quote request. */
export const FORBIDDEN_PRICE_FIELDS = [
    'price',
    'unit_price',
    'unitPrice',
    'line_total',
    'lineTotal',
    'subtotal',
    'sub_total',
    'discount',
    'discount_amount',
    'discountAmount',
    'tax',
    'tax_amount',
    'taxAmount',
    'shipping',
    'shipping_cost',
    'shippingCost',
    'total',
    'total_amount',
    'totalAmount',
    'amount',
    'currency',
] as const;

const forbiddenSet = new Set<string>(FORBIDDEN_PRICE_FIELDS.map((field) => field.toLowerCase()));

const lineSchema = z.object({
    sku: z.string().min(1).max(64),
    quantity: z.number().int().min(1).max(99).optional().default(1),
    language: z.enum(['ar', 'en']).optional(),
    edition: z.enum(['paperback', 'hardcover', 'ebook']).optional(),
}).strict();

const shippingAddressSchema = z.object({
    address: z.string().min(3).max(300),
    city: z.string().min(2).max(120),
    zipCode: z.string().max(30).optional(),
    country: z.string().max(8).optional(),
    phone: z.string().max(30).optional(),
}).strict();

export const QuoteRequestSchema = z.object({
    region: z.enum(['EG', 'GLOBAL']),
    lines: z.array(lineSchema).min(1).max(20),
    promoCode: z.string().max(50).optional(),
    shippingProviderId: z.string().max(64).optional(),
    shippingAddress: shippingAddressSchema.optional(),
    addons: z.array(z.enum(['coaching'])).max(1).optional(),
    language: z.enum(['ar', 'en']).optional(),
}).strict();

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
export type QuoteLineInput = z.infer<typeof lineSchema>;

export type QuoteLineType = 'product' | 'addon' | 'shipping' | 'service' | 'discount' | 'tax';

export interface QuoteLine {
    line_type: QuoteLineType;
    sku: string | null;
    name_snapshot: string;
    language: 'ar' | 'en' | null;
    edition: string | null;
    qty: number;
    unit_price: number;
    discount_amount: number;
    tax_amount: number;
    line_total: number;
    currency: 'EGP' | 'USD';
    source: string;
    position: number;
    metadata: Record<string, unknown>;
}

export interface QuoteResult {
    region: 'EGYPT' | 'GLOBAL';
    currency: 'EGP' | 'USD';
    lines: QuoteLine[];
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    pricing_version: string;
    cart_hash: string;
    expires_at: string;
    quote_token: string;
}

export class QuoteValidationError extends Error {
    readonly code: string;
    constructor(code: string, message: string) {
        super(message);
        this.name = 'QuoteValidationError';
        this.code = code;
    }
}

export class QuoteTokenError extends Error {
    readonly code: 'MISSING_SECRET' | 'MALFORMED' | 'BAD_SIGNATURE' | 'EXPIRED' | 'CART_MISMATCH';
    constructor(code: QuoteTokenError['code'], message: string) {
        super(message);
        this.name = 'QuoteTokenError';
        this.code = code;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  SKU RESOLUTION
// ─────────────────────────────────────────────────────────────────────────────

type ResolvedSku =
    | { kind: 'tier'; tierId: string; baseTierId: string; includesAddon: boolean }
    | { kind: 'addon' }
    | { kind: 'service'; serviceId: 'consultation' | 'vip_coaching' };

const CANONICAL_TO_TIER: Record<string, string> = {
    'mrx-protocol': 'digital',
    'mrx-tactical': 'bundle',
    'mrx-smart-pro': 'coaching',
};

const TIER_IDS = new Set([
    'digital', 'bundle', 'coaching', 'coaching_plus', 'bundle_plus', 'digital_plus',
    'pdf', 'paperback',
]);

export const PRODUCT_NAMES: Record<string, string> = {
    digital: 'Digital Protocol',
    bundle: 'Tactical Bundle',
    coaching: 'Smart Professional',
    coaching_plus: 'Smart Professional + Coaching',
    bundle_plus: 'Tactical Bundle + Coaching',
    digital_plus: 'Digital Protocol + Coaching',
    pdf: 'Digital Protocol (PDF)',
    paperback: 'Paperback Edition',
    consultation: 'Custom Consultation & Assessment Session',
    vip_coaching: 'VIP 1-on-1 Anabolic Cycle Coaching (1 Full Cycle)',
};

const COACHING_ADDON_NAME = '1-on-1 Online Coaching';

function resolveSku(raw: string): ResolvedSku {
    const sku = raw.trim().toLowerCase();

    if (sku === 'mrx-coaching-addon') return { kind: 'addon' };
    if (sku === 'mrx-consultation' || sku === 'consultation') {
        return { kind: 'service', serviceId: 'consultation' };
    }
    if (sku === 'mrx-vip-coaching' || sku === 'coaching_service' || sku === 'vip_coaching') {
        return { kind: 'service', serviceId: 'vip_coaching' };
    }

    const canonicalTier = CANONICAL_TO_TIER[sku];
    const tierId = canonicalTier ?? sku;
    if (!TIER_IDS.has(tierId)) {
        throw new QuoteValidationError('UNKNOWN_SKU', `Unknown product sku: "${raw}".`);
    }

    const baseTierId = tierId.endsWith('_plus') ? tierId.slice(0, -'_plus'.length) : tierId;
    return {
        kind: 'tier',
        tierId,
        baseTierId,
        includesAddon: tierId.endsWith('_plus'),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
//  HASHING / TOKEN SIGNING
// ─────────────────────────────────────────────────────────────────────────────

function stableStringify(value: unknown): string {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
        .join(',')}}`;
}

export function hashCart(cart: unknown): string {
    return createHash('sha256').update(stableStringify(cart)).digest('hex');
}

function quoteSecret(): string {
    const secret = process.env.QUOTE_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret) {
        throw new QuoteTokenError(
            'MISSING_SECRET',
            'Quote signing is not configured (QUOTE_TOKEN_SECRET or SUPABASE_SERVICE_ROLE_KEY is required).'
        );
    }
    return secret;
}

function base64urlJson(value: unknown): string {
    return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

export interface QuoteTokenPayload {
    v: number;
    iat: number;
    exp: number;
    cart_hash: string;
    pricing_version: string;
    currency: 'EGP' | 'USD';
    region: 'EGYPT' | 'GLOBAL';
    total: number;
}

export function signQuoteToken(payload: QuoteTokenPayload): string {
    const body = base64urlJson(payload);
    const signature = createHmac('sha256', quoteSecret()).update(body).digest('base64url');
    return `${body}.${signature}`;
}

export interface VerifyQuoteTokenOptions {
    now?: number;
    expectedCartHash?: string;
}

export function verifyQuoteToken(token: string, options: VerifyQuoteTokenOptions = {}): QuoteTokenPayload {
    const parts = token.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        throw new QuoteTokenError('MALFORMED', 'Quote token is malformed.');
    }

    const [body, signature] = parts;
    const expected = createHmac('sha256', quoteSecret()).update(body).digest();
    let received: Buffer;
    try {
        received = Buffer.from(signature, 'base64url');
    } catch {
        throw new QuoteTokenError('MALFORMED', 'Quote token signature is malformed.');
    }
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
        throw new QuoteTokenError('BAD_SIGNATURE', 'Quote token signature is invalid.');
    }

    let payload: QuoteTokenPayload;
    try {
        payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as QuoteTokenPayload;
    } catch {
        throw new QuoteTokenError('MALFORMED', 'Quote token payload is malformed.');
    }

    if (!payload || payload.v !== QUOTE_TOKEN_VERSION || typeof payload.cart_hash !== 'string') {
        throw new QuoteTokenError('MALFORMED', 'Quote token payload is incomplete.');
    }

    const now = options.now ?? Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp <= now) {
        throw new QuoteTokenError('EXPIRED', 'Quote token has expired.');
    }

    if (options.expectedCartHash && options.expectedCartHash !== payload.cart_hash) {
        throw new QuoteTokenError('CART_MISMATCH', 'Quote token does not match the submitted cart.');
    }

    return payload;
}

// ─────────────────────────────────────────────────────────────────────────────
//  QUOTE BUILDER
// ─────────────────────────────────────────────────────────────────────────────

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

interface ProductPlan {
    tierId: string;
    name: string;
    qty: number;
    language: 'ar' | 'en';
    edition: string | null;
    shippable: boolean;
}

export interface BuildQuoteOptions {
    now?: number;
    ttlSeconds?: number;
    /**
     * Authoritative price catalog. Quote and invoice paths pass the SAME
     * `loadPricing()` result so an `admin_settings` override cannot make the
     * displayed quote differ from the charged amount. Omitted only by pure
     * callers/tests, which intentionally use env/defaults.
     */
    pricing?: PricingConfig;
}

export function buildQuote(input: QuoteRequest, options: BuildQuoteOptions = {}): QuoteResult {
    const region: 'EGYPT' | 'GLOBAL' = input.region === 'EG' ? 'EGYPT' : 'GLOBAL';
    const currency: 'EGP' | 'USD' = region === 'EGYPT' ? 'EGP' : 'USD';
    const currencyKey = currency === 'EGP' ? 'egp' : 'usd';
    const cfg = options.pricing ?? basePricing();

    const priceFrom = (table: Record<string, { egp: number; usd: number } | undefined>, id: string): number => {
        const amount = table[id]?.[currencyKey];
        if (typeof amount !== 'number') {
            throw new QuoteValidationError(
                'PRICE_NOT_CONFIGURED',
                `No configured ${currency} price for "${id}".`
            );
        }
        return amount;
    };
    const tierPrice = (tierId: string): number => priceFrom(cfg.tiers, tierId);
    const addonPrice = (tierId: string): number => priceFrom(cfg.addons, tierId);
    const servicePrice = (serviceId: string): number => priceFrom(cfg.services ?? {}, serviceId);

    const products: ProductPlan[] = [];
    const services: Array<{ serviceId: 'consultation' | 'vip_coaching'; name: string }> = [];
    let addonRequested = input.addons?.includes('coaching') ?? false;

    for (const line of input.lines) {
        const resolved = resolveSku(line.sku);

        if (resolved.kind === 'addon') {
            addonRequested = true;
            continue;
        }

        if (resolved.kind === 'service') {
            if (region === 'EGYPT') {
                throw new QuoteValidationError(
                    'SERVICE_NOT_AVAILABLE_IN_EGYPT',
                    'Services are only available in the GLOBAL/USD checkout.'
                );
            }
            services.push({
                serviceId: resolved.serviceId,
                name: PRODUCT_NAMES[resolved.serviceId],
            });
            continue;
        }

        if (resolved.includesAddon) addonRequested = true;

        const language = line.language ?? input.language;
        if (!language) {
            throw new QuoteValidationError(
                'LANGUAGE_REQUIRED',
                `A book language ("ar" or "en") is required for sku "${line.sku}".`
            );
        }

        products.push({
            tierId: resolved.baseTierId,
            name: PRODUCT_NAMES[resolved.baseTierId] ?? resolved.baseTierId,
            qty: line.quantity ?? 1,
            language,
            edition: line.edition ?? null,
            shippable: isShippableTier(resolved.baseTierId),
        });
    }

    if (products.length === 0 && services.length === 0) {
        throw new QuoteValidationError('EMPTY_CART', 'The cart contains no purchasable item.');
    }

    if (addonRequested && products.length === 0) {
        throw new QuoteValidationError(
            'ADDON_WITHOUT_PRODUCT',
            'The coaching add-on requires at least one product line.'
        );
    }

    const shippableProduct = products.find((product) => product.shippable);
    if (shippableProduct && region === 'GLOBAL') {
        throw new QuoteValidationError(
            'GLOBAL_PHYSICAL_SHIPPING_BLOCKED',
            'Physical products are currently limited to Egypt; no international carrier is configured.'
        );
    }

    if (shippableProduct && region === 'EGYPT' && !input.shippingAddress) {
        throw new QuoteValidationError(
            'SHIPPING_ADDRESS_REQUIRED',
            'A shipping address is required for physical orders in Egypt.'
        );
    }

    const lines: QuoteLine[] = [];
    let position = 0;
    const source = `pricing:${PRICING_VERSION}`;

    for (const product of products) {
        lines.push({
            line_type: 'product',
            sku: product.tierId,
            name_snapshot: product.name,
            language: product.language,
            edition: product.edition,
            qty: product.qty,
            unit_price: tierPrice(product.tierId),
            discount_amount: 0,
            tax_amount: 0,
            line_total: round2(tierPrice(product.tierId) * product.qty),
            currency,
            source,
            position: position++,
            metadata: { quote: true },
        });
    }

    if (addonRequested) {
        lines.push({
            line_type: 'addon',
            sku: 'coaching',
            name_snapshot: COACHING_ADDON_NAME,
            language: null,
            edition: null,
            qty: 1,
            unit_price: addonPrice('coaching_plus'),
            discount_amount: 0,
            tax_amount: 0,
            line_total: addonPrice('coaching_plus'),
            currency,
            source,
            position: position++,
            metadata: { quote: true },
        });
    }

    for (const service of services) {
        lines.push({
            line_type: 'service',
            sku: service.serviceId,
            name_snapshot: service.name,
            language: null,
            edition: null,
            qty: 1,
            unit_price: servicePrice(service.serviceId),
            discount_amount: 0,
            tax_amount: 0,
            line_total: servicePrice(service.serviceId),
            currency,
            source,
            position: position++,
            metadata: { quote: true },
        });
    }

    let shipping = 0;
    let shippingProviderId: string | null = null;
    let shippingServiceCode: string | null = null;
    if (shippableProduct) {
        try {
            const resolved = resolveShippingForCheckout(cfg, {
                tierId: shippableProduct.tierId,
                region,
                currency,
                requestedProviderId: input.shippingProviderId ?? null,
                legacyClientShippingCost: 0,
            });
            const provider = new FlatRateProvider({
                providerId: resolved.providerId ?? DEFAULT_EGYPT_SHIPPING_PROVIDER,
                amount: resolved.amount,
            });
            const flatQuote = provider.quote({
                region,
                currency,
                requestedProviderId: input.shippingProviderId ?? null,
            });
            shipping = flatQuote.amount;
            shippingProviderId = flatQuote.providerId;
            shippingServiceCode = flatQuote.serviceCode;
        } catch (error) {
            if (error instanceof ShippingConfigurationError) {
                throw new QuoteValidationError('SHIPPING_UNAVAILABLE', error.message);
            }
            throw error;
        }

        lines.push({
            line_type: 'shipping',
            sku: null,
            name_snapshot: 'Shipping',
            language: null,
            edition: null,
            qty: 1,
            unit_price: shipping,
            discount_amount: 0,
            tax_amount: 0,
            line_total: shipping,
            currency,
            source: `shipping:${shippingProviderId ?? DEFAULT_EGYPT_SHIPPING_PROVIDER}`,
            position: position++,
            metadata: {
                quote: true,
                provider_id: shippingProviderId,
                service_code: shippingServiceCode
                    ?? (shippingProviderId === DEFAULT_EGYPT_SHIPPING_PROVIDER ? FLAT_RATE_SERVICE_CODE : null),
                amount: shipping,
            },
        });
    }

    const subtotal = round2(
        lines
            .filter((line) => line.line_type !== 'shipping' && line.line_type !== 'discount')
            .reduce((sum, line) => sum + line.line_total, 0)
    );

    const discount = computePromoDiscount(input.promoCode, subtotal, currency);
    if (discount > 0) {
        lines.push({
            line_type: 'discount',
            sku: input.promoCode ?? null,
            name_snapshot: 'Discount',
            language: null,
            edition: null,
            qty: 1,
            unit_price: discount,
            discount_amount: 0,
            tax_amount: 0,
            line_total: -discount,
            currency,
            source: 'promo',
            position: position++,
            metadata: { quote: true, promo_code: input.promoCode },
        });
    }

    const tax = 0;
    const total = round2(lines.reduce((sum, line) => sum + line.line_total, 0));

    const cartHash = hashCart({
        region,
        currency,
        products: products.map((product) => ({
            tierId: product.tierId,
            qty: product.qty,
            language: product.language,
            edition: product.edition,
        })),
        addon: addonRequested,
        services: services.map((service) => service.serviceId),
        promoCode: input.promoCode ?? null,
        shippingProviderId: input.shippingProviderId ?? null,
        shippingAddress: input.shippingAddress ?? null,
        pricing_version: PRICING_VERSION,
    });

    const now = options.now ?? Math.floor(Date.now() / 1000);
    const ttl = Math.max(30, Math.min(options.ttlSeconds ?? QUOTE_TTL_SECONDS, 30 * 60));
    const expiresAt = now + ttl;

    const quoteToken = signQuoteToken({
        v: QUOTE_TOKEN_VERSION,
        iat: now,
        exp: expiresAt,
        cart_hash: cartHash,
        pricing_version: PRICING_VERSION,
        currency,
        region,
        total,
    });

    return {
        region,
        currency,
        lines: lines.map((line) => ({
            ...line,
            metadata: line.line_type === 'shipping'
                ? { ...line.metadata, quote_id: cartHash }
                : line.metadata,
        })),
        subtotal,
        discount,
        shipping,
        tax,
        total,
        pricing_version: PRICING_VERSION,
        cart_hash: cartHash,
        expires_at: new Date(expiresAt * 1000).toISOString(),
        quote_token: quoteToken,
    };
}

/**
 * Collect forbidden price/accounting keys anywhere in the request body.
 * The route calls this before Zod so the client gets an explicit message
 * instead of a generic "unrecognized key".
 */
export function findForbiddenPriceFields(value: unknown, path = ''): string[] {
    if (value === null || typeof value !== 'object') return [];
    const hits: string[] = [];

    if (Array.isArray(value)) {
        value.forEach((entry, index) => {
            hits.push(...findForbiddenPriceFields(entry, `${path}[${index}]`));
        });
        return hits;
    }

    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
        const keyPath = path ? `${path}.${key}` : key;
        if (forbiddenSet.has(key.toLowerCase())) hits.push(keyPath);
        hits.push(...findForbiddenPriceFields(entry, keyPath));
    }
    return hits;
}
