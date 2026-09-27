/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  COMBINED ORDER — authoritative multi-line total resolution
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  One customer checkout may contain several canonical products, eligible
 *  add-ons, domestic shipping, and an approved discount. This module resolves the
 *  complete authoritative total for that whole purchase so a single invoice, a
 *  single payment intent, and a single Kashier transaction can represent it.
 *
 *  Guarantees:
 *  - Every line price comes from the canonical pricing system, so no pricing rule
 *    is duplicated here. A `product` line is priced with `computeAmount`; an
 *    `addon` line is priced with `computeAddonAmount`, which returns the add-on
 *    ALONE. An add-on is never routed through `computeAmount`, because that
 *    resolves a `*_plus` tier as `base × qty + addon` and would charge the base
 *    product a second time.
 *  - Shipping is resolved ONCE per order, not once per line, and never from a
 *    client-supplied number.
 *  - The discount is applied ONCE to the combined subtotal.
 *  - No client-reported total is ever read as an accounting input. A
 *    client-supplied amount is only ever compared against the server total by
 *    `isAmountValid`, so a tampered cart cannot change what is charged.
 *  - A line whose price is not in canonical server configuration is REFUSED
 *    rather than priced from a neighbouring tier. A wrong-but-plausible price is
 *    worse than a rejection: it misstates the contract and the ledger.
 *  - The result is a pure function: no database, no network, no side effects.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    computeAddonAmount,
    computeAmount,
    computePromoDiscount,
    isAmountValid,
    isShippableTier,
    resolveShippingForCheckout,
    type PricingConfig,
    type TierId,
} from './pricing';

export type CombinedLineKind = 'product' | 'addon' | 'consultation';

export interface CombinedLineInput {
    kind: CombinedLineKind;
    /**
     * Canonical tier id.
     *
     * - `product`      → a base tier, priced with `computeAmount`.
     * - `addon`        → a `*_plus` tier id, priced with `computeAddonAmount`.
     *                    The base product is a separate line; pricing the add-on
     *                    through `computeAmount` would re-charge that base.
     * - `consultation` → REJECTED. D6 is still open, see the resolver below.
     */
    tierId: TierId;
    quantity?: number;
}

/** A fully resolved, priced line. Persisted verbatim as the order breakdown. */
export interface ResolvedOrderLine {
    kind: CombinedLineKind;
    tierId: TierId;
    quantity: number;
    /** Canonical unit price for this line in the order currency. */
    unitAmount: number;
    /** The line's own authoritative amount, rounded to 2dp. */
    amount: number;
    currency: string;
    shippable: boolean;
}

export interface CombinedOrderInput {
    lines: CombinedLineInput[];
    region: 'EGYPT' | 'GLOBAL';
    currency: string;
    /** Client carrier intent only. Validated against the server shipping table. */
    shippingProviderId?: string;
    /** Client-reported shipping hint. Never an accounting input. */
    legacyClientShippingCost?: number;
    promoCode?: string;
    /**
     * Optional client-reported total. It is NEVER trusted: it is only checked
     * against the server total and rejected when it disagrees beyond the
     * configured tolerance.
     */
    clientReportedTotal?: number;
}

export interface CombinedOrderTotals {
    lines: ResolvedOrderLine[];
    subtotal: number;
    shippingCost: number;
    shippingProviderId: string | null;
    discount: number;
    total: number;
    currency: string;
    /**
     * The tier id recorded on the invoice. A combined order has no single tier,
     * so the first product line is used — the same convention the existing
     * aggregate tiers (`bundle_plus`, `coaching_plus`) already follow. The full
     * line set always travels alongside it in `metadata` / `orders.items`.
     */
    primaryTierId: TierId;
    requiresShipping: boolean;
}

export class CombinedOrderValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CombinedOrderValidationError';
    }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const normalizeQuantity = (quantity: unknown): number => {
    const parsed = Number(quantity);
    if (!Number.isFinite(parsed)) return 1;
    return Math.max(1, Math.floor(parsed));
};

/**
 * Resolve the authoritative total for a combined order.
 *
 * Per-line amounts are delegated to `computeAmount` so the canonical pricing
 * rules (including `_plus` add-on resolution) stay in one place. Shipping and
 * discount are applied once, at the order level.
 */
export function computeCombinedOrder(
    cfg: PricingConfig,
    input: CombinedOrderInput
): CombinedOrderTotals {
    if (!Array.isArray(input.lines) || input.lines.length === 0) {
        throw new CombinedOrderValidationError('A combined order requires at least one line.');
    }

    const lines: ResolvedOrderLine[] = input.lines.map((line) => {
        if (!line || !line.tierId) {
            throw new CombinedOrderValidationError('Every order line requires a canonical tierId.');
        }
        if (line.kind !== 'product' && line.kind !== 'addon' && line.kind !== 'consultation') {
            throw new CombinedOrderValidationError(`Unsupported order line kind: ${String(line.kind)}`);
        }

        // D6 / MRX-CONSULT is still OPEN. The consultation exists in the product
        // catalog and has an owner-supplied price, but it has no canonical entry
        // in `PricingConfig.tiers`. Pricing it from any existing tier would
        // silently charge a DIFFERENT product's price (e.g. the 849 EGP coaching
        // tier) and misstate the contract, so it is refused outright. This
        // rejects rather than guesses; it is removed the moment D6 closes and
        // `consultation` is added to the canonical pricing table.
        if (line.kind === 'consultation') {
            throw new CombinedOrderValidationError(
                'Consultation lines cannot be purchased yet: the consultation price is not ' +
                'available in canonical server pricing (decision D6 is still open).'
            );
        }

        const quantity = normalizeQuantity(line.quantity);
        const shippable = isShippableTier(line.tierId);

        let amount: number;
        if (line.kind === 'addon') {
            // An add-on is charged ONCE per order, exactly as `computeAmount`
            // charges it for a `*_plus` tier. Buying several add-ons is
            // represented by several lines, so a quantity above 1 is ambiguous
            // here and is refused instead of being silently charged once.
            if (quantity > 1) {
                throw new CombinedOrderValidationError(
                    `Add-on "${line.tierId}" is charged once per order. Add one line per add-on instead of setting a quantity.`
                );
            }
            // Add-on price only — never the base product.
            amount = computeAddonAmount(cfg, line.tierId, input.currency);
        } else {
            // Canonical, server-side product pricing. Shipping and discount are
            // excluded here because they belong to the order, not to any line.
            amount = computeAmount(cfg, {
                tierId: line.tierId,
                currency: input.currency,
                quantity,
                shippingCost: 0,
                discount: 0,
            });
        }

        if (!(amount > 0)) {
            throw new CombinedOrderValidationError(
                `Line "${line.tierId}" resolved to a non-positive amount and cannot be sold.`
            );
        }

        // Derive the effective unit price from the canonical total so a line that
        // bundles an add-on still reports a coherent unit figure.
        const unitAmount = round2(amount / quantity);

        return {
            kind: line.kind,
            tierId: line.tierId,
            quantity,
            unitAmount,
            amount: round2(amount),
            currency: input.currency,
            shippable,
        };
    });

    const subtotal = round2(lines.reduce((sum, line) => sum + line.amount, 0));
    const requiresShipping = lines.some((line) => line.shippable);

    // Shipping is charged at most once per order, and only when something in the
    // order is actually shippable. A digital-only basket never pays shipping.
    const shipping = requiresShipping
        ? resolveShippingForCheckout(cfg, {
            // The aggregate tier drives whether the order is shippable; the
            // per-line `shippable` flags above already decided that.
            tierId: lines.find((line) => line.shippable)!.tierId,
            region: input.region,
            currency: input.currency,
            requestedProviderId: input.shippingProviderId,
            legacyClientShippingCost: input.legacyClientShippingCost,
        })
        : { amount: 0, providerId: null, currency: input.currency };

    const discount = computePromoDiscount(input.promoCode, subtotal, input.currency);
    const total = Math.max(0, round2(subtotal + shipping.amount - discount));

    if (!(total > 0)) {
        throw new CombinedOrderValidationError(
            'Server-computed combined total must be greater than zero.'
        );
    }

    // A client-reported total is a claim, never an input. Rejecting a mismatch
    // here is what stops a tampered cart from becoming a cheaper invoice.
    if (
        input.clientReportedTotal !== undefined &&
        !isAmountValid(cfg, input.clientReportedTotal, total)
    ) {
        throw new CombinedOrderValidationError(
            `Client-reported total does not match the authoritative server total (tolerance ${cfg.tolerance}).`
        );
    }

    const firstProduct = lines.find((line) => line.kind === 'product');
    if (!firstProduct) {
        throw new CombinedOrderValidationError(
            'A combined order requires at least one product line; an add-on cannot be purchased on its own.'
        );
    }

    return {
        lines,
        subtotal,
        shippingCost: round2(shipping.amount),
        shippingProviderId: shipping.providerId,
        discount: round2(discount),
        total,
        currency: input.currency,
        primaryTierId: firstProduct.tierId,
        requiresShipping,
    };
}
