/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MERCHANT RESOLVER — Final Gate v5.1 §4.1 + §51 + §K-2 Phase 2
 *  Central authority for region → merchant → currency → payment-method resolution.
 *  Server-side source of truth. Client-supplied region / merchant / currency /
 *  amount are NEVER authoritative (v5.1 §19 Region Detection / §20 Price Security).
 *  Supports KASHIER_TEST_* / KASHIER_LIVE_* prefixes with legacy
 *  KASHIER_EGYPT_* / KASHIER_GLOBAL_* fallbacks and PRIMARY/SECONDARY rotation.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type MerchantRegion = 'EGYPT' | 'GLOBAL';
export type CurrencyCode = 'EGP' | 'USD';
export type PaymentMethodId = 'card' | 'wallet';
export type Mode = 'test' | 'live';

export type CanonicalProductId = 'MRX-PROTOCOL' | 'MRX-TACTICAL' | 'MRX-SMART-PRO';

// ─────────────────────────────────────────────────────────────────────────────
//  ERROR TYPE — blocked register items must raise BlockedGateError (v5.1 §2)
// ─────────────────────────────────────────────────────────────────────────────

export class BlockedGateError extends Error {
    constructor(blockedItem: string, detail?: string) {
        super(`Blocked gate: ${blockedItem}${detail ? ` — ${detail}` : ''}`);
        this.name = 'BlockedGateError';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECRET ROTATION MODEL (v5.1 §4.4 — _PRIMARY / _SECONDARY, 7-day overlap)
// ─────────────────────────────────────────────────────────────────────────────

export interface RotatingSecret {
    primary: string;
    secondary?: string;
}

export interface MerchantSecrets {
    paymentApiKey: RotatingSecret;
    secretKey: RotatingSecret;
}

export interface MerchantConfig {
    region: MerchantRegion;
    merchantId: string;
    currency: CurrencyCode;
    paymentMethods: PaymentMethodId[];
    defaultMethod: PaymentMethodId;
    mode: Mode;
    merchantType: 'egypt' | 'global';
    webhookUrl: string;
    secrets: MerchantSecrets;
}

export interface ResolvePaymentContextInput {
    regionHint?: string;
    country?: string;
    productId?: CanonicalProductId;
}

export interface RegionalPrice {
    currency: CurrencyCode;
    /** Amount in major currency units; null when not yet officially determined. */
    amount: number | null;
    /** Placeholder label (e.g. USD_PRICE_1) used until the official price is set. */
    placeholder?: string;
}

export interface PaymentContext {
    region: MerchantRegion;
    merchant: MerchantConfig;
    currency: CurrencyCode;
    paymentMethods: PaymentMethodId[];
    product?: CanonicalProductId;
    price?: RegionalPrice;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CANONICAL PRODUCT CATALOG (v5.1 §29–§31)
//  THREE canonical products ONLY. Egypt prices are authoritative (owner-signed).
//  Global prices use placeholders — NEVER invented.
// ─────────────────────────────────────────────────────────────────────────────

export interface CanonicalProductDef {
    id: CanonicalProductId;
    slug: string;
    nameAr: string;
    nameEn: string;
    egyptAmount: number;
    globalPlaceholder: string;
}

export const CANONICAL_PRODUCTS: Record<CanonicalProductId, CanonicalProductDef> = {
    'MRX-PROTOCOL': {
        id: 'MRX-PROTOCOL',
        slug: 'protocol',
        nameAr: 'البروتوكول الرقمي',
        nameEn: 'The Digital Protocol',
        egyptAmount: 499,
        globalPlaceholder: 'USD_PRICE_1',
    },
    'MRX-TACTICAL': {
        id: 'MRX-TACTICAL',
        slug: 'tactical',
        nameAr: 'الباقة التكتيكية',
        nameEn: 'Tactical Bundle',
        egyptAmount: 749,
        globalPlaceholder: 'USD_PRICE_2',
    },
    'MRX-SMART-PRO': {
        id: 'MRX-SMART-PRO',
        slug: 'smart-pro',
        nameAr: 'المحترف الذكي',
        nameEn: 'Smart Professional',
        egyptAmount: 10_848,
        globalPlaceholder: 'USD_PRICE_3',
    },
};

export const DEFAULT_REGION_METHODS: Record<MerchantRegion, { paymentMethods: PaymentMethodId[]; defaultMethod: PaymentMethodId }> = {
    EGYPT: { paymentMethods: ['card', 'wallet'], defaultMethod: 'card' },
    GLOBAL: { paymentMethods: ['card'], defaultMethod: 'card' },
};

const REGION_TO_LEGACY_PREFIX: Record<MerchantRegion, string> = {
    EGYPT: 'KASHIER_EGYPT',
    GLOBAL: 'KASHIER_GLOBAL',
};

const PRODUCT_ENV_KEY: Record<CanonicalProductId, string> = {
    'MRX-PROTOCOL': 'MRX_PROTOCOL',
    'MRX-TACTICAL': 'MRX_TACTICAL',
    'MRX-SMART-PRO': 'MRX_SMART_PRO',
};

// ─────────────────────────────────────────────────────────────────────────────
//  ENV RESOLUTION
// ─────────────────────────────────────────────────────────────────────────────

function resolveMode(): Mode {
    return (process.env.KASHIER_MODE || 'test').toLowerCase() === 'live' ? 'live' : 'test';
}

/**
 * Env lookup with mode-prefix → legacy-prefix → rotation-suffix priority:
 *   <modePrefix>_KEY || <modePrefix>_KEY_PRIMARY || <legacy>_KEY || <legacy>_KEY_PRIMARY
 */
function resolvePrimary(modePrefix: string, legacyPrefix: string, keySuffix: string): string {
    return (
        process.env[`${modePrefix}_${keySuffix}`] ||
        process.env[`${modePrefix}_${keySuffix}_PRIMARY`] ||
        process.env[`${legacyPrefix}_${keySuffix}`] ||
        process.env[`${legacyPrefix}_${keySuffix}_PRIMARY`] ||
        ''
    );
}

function resolveSecondary(modePrefix: string, legacyPrefix: string, keySuffix: string): string | undefined {
    return (
        process.env[`${modePrefix}_${keySuffix}_SECONDARY`] ||
        process.env[`${legacyPrefix}_${keySuffix}_SECONDARY`] ||
        undefined
    );
}

function resolveWebhookUrl(region: MerchantRegion): string {
    const legacyPrefix = REGION_TO_LEGACY_PREFIX[region];
    const configured = process.env[`${legacyPrefix}_WEBHOOK_URL`]?.trim();
    if (configured) return configured;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mrxsteroid.com';
    return `${siteUrl}/api/payments/webhook`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the merchant configuration for a region from the environment.
 * Mirrors #4.2 Env Vars. Missing credentials are reported as a warning and
 * returned empty (like the legacy gateway constructor) so callers keep the
 * existing fail-loud behaviour at the point of use (assertCredentials).
 */
export function getMerchantConfig(region: MerchantRegion): MerchantConfig {
    const mode = resolveMode();
    const modePrefix = mode === 'live' ? 'KASHIER_LIVE' : 'KASHIER_TEST';
    const legacyPrefix = REGION_TO_LEGACY_PREFIX[region];
    const methods = DEFAULT_REGION_METHODS[region];

    const merchantId = resolvePrimary(modePrefix, legacyPrefix, 'MERCHANT_ID');
    const paymentApiKey = resolvePrimary(modePrefix, legacyPrefix, 'PAYMENT_API_KEY');
    const paymentApiKeySecondary = resolveSecondary(modePrefix, legacyPrefix, 'PAYMENT_API_KEY');
    const secretKey = resolvePrimary(modePrefix, legacyPrefix, 'SECRET_KEY');
    const secretKeySecondary = resolveSecondary(modePrefix, legacyPrefix, 'SECRET_KEY');

    if (!merchantId || !paymentApiKey || !secretKey) {
        console.warn(
            `[MerchantResolver:${region}] Missing credentials for mode: ${mode}. Set ${modePrefix}_MERCHANT_ID, ${modePrefix}_PAYMENT_API_KEY, ${modePrefix}_SECRET_KEY (or legacy ${legacyPrefix}_*).`
        );
    }

    return {
        region,
        merchantId,
        currency: region === 'EGYPT' ? 'EGP' : 'USD',
        paymentMethods: methods.paymentMethods,
        defaultMethod: methods.defaultMethod,
        mode,
        merchantType: region === 'EGYPT' ? 'egypt' : 'global',
        webhookUrl: resolveWebhookUrl(region),
        secrets: {
            paymentApiKey: { primary: paymentApiKey, secondary: paymentApiKeySecondary || undefined },
            secretKey: { primary: secretKey, secondary: secretKeySecondary || undefined },
        },
    };
}

/**
 * Region resolution — v5.1 §46: IP / geo / billing data are ROUTING HINTS,
 * never the final financial authority. The final region is resolved server-side.
 */
export function resolveRegion(input: Pick<ResolvePaymentContextInput, 'regionHint' | 'country'> = {}): MerchantRegion {
    const hint = String(input.country || input.regionHint || '')
        .trim()
        .toUpperCase();
    if (hint === 'EG' || hint === 'EGYPT' || hint === 'مصر') return 'EGYPT';
    return 'GLOBAL';
}

/**
 * v5.1 §51 — resolvePaymentContext(): returns the server-side authoritative
 * payment context: region, merchant config, currency, and allowed payment methods.
 * Price/product are included when a canonical product is supplied.
 */
export function resolvePaymentContext(input: ResolvePaymentContextInput = {}): PaymentContext {
    const region = resolveRegion(input);
    const merchant = getMerchantConfig(region);
    const ctx: PaymentContext = {
        region,
        merchant,
        currency: merchant.currency,
        paymentMethods: merchant.paymentMethods,
    };
    if (input.productId) {
        ctx.product = input.productId;
        ctx.price = resolveRegionalPrice(input.productId, region);
    }
    return ctx;
}

/**
 * v5.1 §30 — regional price resolution. Egypt amounts are authoritative from the
 * canonical catalog. GLOBAL never invents a price: it returns the placeholder
 * label (USD_PRICE_*) unless an official env override exists
 * (PRICING_GLOBAL_MRX_<PRODUCT>_USD).
 */
export function resolveRegionalPrice(productId: CanonicalProductId, region: MerchantRegion): RegionalPrice {
    const def = CANONICAL_PRODUCTS[productId];
    if (region === 'EGYPT') {
        return { currency: 'EGP', amount: def.egyptAmount };
    }
    const override = Number(process.env[`PRICING_GLOBAL_${PRODUCT_ENV_KEY[productId]}_USD`]);
    if (Number.isFinite(override) && override > 0) {
        return { currency: 'USD', amount: override };
    }
    return { currency: 'USD', amount: null, placeholder: def.globalPlaceholder };
}

/**
 * v5.1 §31 — Kashier SKU mapping. KASHIER SKU ≠ CANONICAL PRODUCT:
 *   Egypt → MRX-EG-<SKU> · Global → MRX-GL-<SKU>
 */
export function resolveKashierSku(productId: CanonicalProductId, region: MerchantRegion): string {
    const short = productId.replace('MRX-', '');
    return `${region === 'EGYPT' ? 'MRX-EG-' : 'MRX-GL-'}${short}`;
}