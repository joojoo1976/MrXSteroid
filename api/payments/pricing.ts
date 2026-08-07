/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  💰 PRICING — Single, tunable source of truth for checkout amounts        ║
 * ║  Precedence: admin_settings (Mission Control) > env vars > defaults       ║
 * ║  The server ALWAYS recomputes the authoritative charge amount and         ║
 * ║  validates the amount reported by the client before charging.             ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════
//                              DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════

export type TierId = 'digital' | 'bundle' | 'coaching' | 'coaching_plus' | 'bundle_plus' | 'digital_plus' | 'pdf' | 'paperback';

/** Base unit prices per tier (currency keyed). `_plus` tiers use base + addon. */
export interface TierPrice {
    usd: number;
    egp: number;
}

export interface PricingConfig {
    tiers: Record<TierId, TierPrice>;
    /** Add-on prices keyed by the `_plus` tier id (added once per order, mirroring the client). */
    addons: Partial<Record<TierId, TierPrice>>;
    /** Shipping costs by provider id, currency keyed. */
    shipping: Record<string, { usd?: number; egp?: number }>;
    /** Allowed absolute deviation (in currency units) between client-reported and server-computed amount. */
    tolerance: number;
}

export const DEFAULT_PRICING: PricingConfig = {
    tiers: {
        digital:       { usd: 49.99, egp: 499 },
        bundle:        { usd: 72.00, egp: 749 },
        coaching:      { usd: 82.00, egp: 849 },
        coaching_plus: { usd: 82.00, egp: 849 }, // base; addon added below
        bundle_plus:   { usd: 72.00, egp: 749 }, // bundle base; addon added below
        digital_plus:  { usd: 49.99, egp: 499 }, // digital base; addon added below
        pdf:           { usd: 49.99, egp: 499 },
        paperback:     { usd: 72.00, egp: 749 },
    },
    addons: {
        coaching_plus: { usd: 200.00, egp: 9999 },
        bundle_plus:   { usd: 200.00, egp: 9999 },
        digital_plus:  { usd: 200.00, egp: 9999 },
    },
    shipping: {
        eg_standard: { egp: 239 },
        dhl_global:  { usd: 45 },
        fedex_priority: { usd: 38 },
        ups_worldwide:  { usd: 42 },
        aramex_international: { usd: 25 },
    },
    tolerance: 0.5,
};

// ═══════════════════════════════════════════════════════════════════════════
//                           ENV OVERRIDES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Environment override mapping:
 *   PRICING_<TIER>_USD / PRICING_<TIER>_EGP          → base unit price
 *   PRICING_ADDON_<TIER>_USD / PRICING_ADDON_<TIER>_EGP → add-on price
 *   PRICING_SHIPPING_<PROVIDER>_USD/_EGP             → shipping cost
 *   PRICING_TOLERANCE                                → absolute tolerance (currency units)
 */
function applyEnvOverrides(cfg: PricingConfig): PricingConfig {
    const num = (key: string): number | undefined => {
        const raw = process.env[key];
        if (!raw) return undefined;
        const n = Number(raw);
        return Number.isFinite(n) ? n : undefined;
    };

    (Object.keys(cfg.tiers) as TierId[]).forEach(tier => {
        const usd = num(`PRICING_${tier.toUpperCase()}_USD`);
        const egp = num(`PRICING_${tier.toUpperCase()}_EGP`);
        if (usd !== undefined) cfg.tiers[tier].usd = usd;
        if (egp !== undefined) cfg.tiers[tier].egp = egp;
    });

    (Object.keys(cfg.addons) as TierId[]).forEach(tier => {
        const key = `PRICING_ADDON_${tier.toUpperCase()}`;
        const usd = num(`${key}_USD`);
        const egp = num(`${key}_EGP`);
        if (usd !== undefined) cfg.addons[tier]!.usd = usd;
        if (egp !== undefined) cfg.addons[tier]!.egp = egp;
    });

    Object.keys(cfg.shipping).forEach(provider => {
        const key = `PRICING_SHIPPING_${provider.toUpperCase()}`;
        const usd = num(`${key}_USD`);
        const egp = num(`${key}_EGP`);
        if (usd !== undefined) cfg.shipping[provider].usd = usd;
        if (egp !== undefined) cfg.shipping[provider].egp = egp;
    });

    const tolerance = num('PRICING_TOLERANCE');
    if (tolerance !== undefined) cfg.tolerance = tolerance;

    return cfg;
}

// ═══════════════════════════════════════════════════════════════════════════
//                        admin_settings OVERRIDES
// ═══════════════════════════════════════════════════════════════════════════

const round2 = (n: number) => Math.round(n * 100) / 100;

function toCurrencyKey(currency: string): 'usd' | 'egp' {
    return currency === 'EGP' ? 'egp' : 'usd';
}

/**
 * Apply overrides stored in `admin_settings` (editable from Mission Control → Settings).
 * Keys follow the shape:
 *   pricing_<tier>_usd / pricing_<tier>_egp
 *   pricing_addon_<tier>_usd / pricing_addon_<tier>_egp
 *   pricing_shipping_<provider>_usd / pricing_shipping_<provider>_egp
 *   pricing_tolerance
 */
function applyAdminOverrides(cfg: PricingConfig, rows: Array<{ key: string; value: string }>): PricingConfig {
    const map = new Map<string, number>();
    rows.forEach(r => {
        const raw = (r.value || '').trim();
        if (raw === '') return; // empty → keep default (prevents accidental 0 pricing)
        const n = Number(raw);
        if (Number.isFinite(n)) map.set(r.key.toLowerCase(), n);
    });

    const pick = (base: string, cur: 'usd' | 'egp'): number | undefined => map.get(`${base}_${cur}`);

    (Object.keys(cfg.tiers) as TierId[]).forEach(tier => {
        const base = `pricing_${tier}`;
        const usd = pick(base, 'usd');
        const egp = pick(base, 'egp');
        if (usd !== undefined) cfg.tiers[tier].usd = round2(usd);
        if (egp !== undefined) cfg.tiers[tier].egp = round2(egp);
    });

    (Object.keys(cfg.addons) as TierId[]).forEach(tier => {
        const base = `pricing_addon_${tier}`;
        const usd = pick(base, 'usd');
        const egp = pick(base, 'egp');
        if (usd !== undefined) cfg.addons[tier]!.usd = round2(usd);
        if (egp !== undefined) cfg.addons[tier]!.egp = round2(egp);
    });

    Object.keys(cfg.shipping).forEach(provider => {
        const base = `pricing_shipping_${provider}`;
        const usd = pick(base, 'usd');
        const egp = pick(base, 'egp');
        if (usd !== undefined) cfg.shipping[provider].usd = round2(usd);
        if (egp !== undefined) cfg.shipping[provider].egp = round2(egp);
    });

    const tol = map.get('pricing_tolerance');
    if (tol !== undefined) cfg.tolerance = tol;

    return cfg;
}

// ═══════════════════════════════════════════════════════════════════════════
//                              PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════

export function basePricing(): PricingConfig {
    return applyEnvOverrides(JSON.parse(JSON.stringify(DEFAULT_PRICING)));
}

export async function loadPricing(
    getRows: () => Promise<Array<{ key: string; value: string }>>
): Promise<PricingConfig> {
    const cfg = basePricing();
    try {
        const rows = await getRows();
        applyAdminOverrides(cfg, rows);
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn('⚠️ [Pricing] Falling back to env/defaults (admin_settings read failed):', msg);
    }
    return cfg;
}

export interface ComputeAmountInput {
    tierId: TierId;
    currency: string;          // 'EGP' | 'USD'
    quantity: number;
    shippingCost?: number;
    discount?: number;
}

/** Resolve the authoritative shipping cost for a provider+currency from the config (falls back to client value). */
export function resolveShippingCost(
    cfg: PricingConfig,
    providerId: string | undefined,
    clientShippingCost: number,
    currency: string
): number {
    const cur = toCurrencyKey(currency);
    if (providerId && cfg.shipping[providerId]?.[cur] !== undefined) {
        return cfg.shipping[providerId][cur]!;
    }
    // No known provider: only accept a non-negative client value (0 for digital).
    return Math.max(0, clientShippingCost || 0);
}

/**
 * Authoritative promo-code validation — mirrors the storefront rules:
 *   STEROIDIQ           → fixed $1 discount (in the target currency)
 *   IQ1P-XXXX / IQ05-XXXX → 1% / 0.5% off (unit×qty + add-on + shipping)
 * Returns the discount amount in the target currency, or 0 for unknown/invalid codes.
 */
export function computePromoDiscount(
    code: string | undefined,
    subtotal: number,
    _currency: string
): number {
    const normalized = (code || '').trim().toUpperCase();
    if (!normalized) return 0;

    const base = Math.max(0, subtotal);

    if (normalized === 'STEROIDIQ') {
        return 1; // fixed $1 off (mirrors the storefront exactly, independent of currency)
    }
    if (/^IQ1P-[A-Z0-9]{4}$/.test(normalized)) {
        return round2(base * 0.01);
    }
    if (/^IQ05-[A-Z0-9]{4}$/.test(normalized)) {
        return round2(base * 0.005);
    }
    return 0;
}

/**
 * Compute the authoritative amount the customer should be charged.
 * Mirrors the storefront calculation: base unit × quantity + add-on + shipping − discount.
 */
export function computeAmount(cfg: PricingConfig, input: ComputeAmountInput): number {
    const cur = toCurrencyKey(input.currency);

    // For *_plus variants (e.g. bundle_plus, coaching_plus, digital_plus):
    // resolve the base tier and its coaching add-on separately.
    // This ensures any _plus tier works even if it's not explicitly in the tiers map.
    let baseTierId = input.tierId as string;
    const addonTierId = input.tierId;

    if (baseTierId.endsWith('_plus')) {
        baseTierId = baseTierId.replace('_plus', '') as string;
    }

    const baseTierKey = (cfg.tiers[baseTierId as TierId] ? baseTierId : 'bundle') as TierId;
    const tier = cfg.tiers[baseTierKey];
    const baseUnit = tier[cur] || 0;

    const addon = cfg.addons[addonTierId]?.[cur] || 0;
    const quantity = Math.max(1, Math.floor(input.quantity || 1));

    const shipping = round2(input.shippingCost || 0);
    const discount = round2(input.discount || 0);

    const total = baseUnit * quantity + addon + shipping - discount;
    return Math.max(0, round2(total));
}

/**
 * Validate that a client-reported amount matches the authoritative server amount.
 * Returns `true` when within the configured tolerance (prevents underpayment tampering).
 */
export function isAmountValid(cfg: PricingConfig, clientAmount: number, serverAmount: number): boolean {
    if (!Number.isFinite(clientAmount)) return false;
    return Math.abs(clientAmount - serverAmount) <= cfg.tolerance;
}
