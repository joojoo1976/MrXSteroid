/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  FOURTHWALL CHECKOUT ADAPTER — GAP-01 / GAP-02 / GAP-03 Resolution
 *  Adapts Fourthwall Storefront Cart API to the CombinedCheckoutGateway contract.
 *  Supports multi-line book carts, validates canonical USD pricing, strictly
 *  enforces Fourthwall AUP §13 prohibitions, and fails closed with BLOCKED
 *  status if real variant UUIDs are not configured.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { FourthwallGateway } from "./FourthwallGateway";
import type {
    CombinedCheckoutGateway,
    CombinedPaymentSessionParams,
    CombinedPaymentSessionResult,
} from "../checkout/combinedCheckoutSessionService";
import { CheckoutValidationError } from "../checkout/checkoutSessionService";

export class FourthwallCheckoutAdapter implements CombinedCheckoutGateway {
    private readonly gateway: FourthwallGateway;

    constructor(gateway?: FourthwallGateway) {
        this.gateway = gateway || new FourthwallGateway();
    }

    async createPaymentSession(
        params: CombinedPaymentSessionParams
    ): Promise<CombinedPaymentSessionResult> {
        // 1. Currency validation: Fourthwall Storefront checkout is USD-only
        if (params.currency !== "USD") {
            throw new CheckoutValidationError(
                `[FourthwallCheckoutAdapter] Invalid currency: ${params.currency}. Fourthwall checkout is USD-only.`
            );
        }

        const lines = params.lines || [];
        if (lines.length === 0) {
            throw new CheckoutValidationError(
                "[FourthwallCheckoutAdapter] Cannot checkout with empty order lines."
            );
        }

        // 2. GAP-02: AUP §13 Compliance Check (Coaching / Consultation prohibited)
        for (const line of lines) {
            if (this.gateway.isBlockedServiceTier(line.tierId)) {
                throw new CheckoutValidationError(
                    `[FourthwallCheckoutAdapter] Line item "${line.tierId}" is a service product that is not permitted on Fourthwall (AUP §13). Use direct service payment links.`
                );
            }
        }

        // 3. GAP-03: Real variant UUID resolution (Fail-closed on placeholder / missing)
        const items: Array<{ variantId: string; quantity: number }> = [];
        for (const line of lines) {
            const mapping = this.gateway.resolveProductMapping(line.tierId);
            if (!mapping || !mapping.fourthwallProductId) {
                throw new Error(
                    `[FourthwallCheckoutAdapter] BLOCKED: Missing verified Fourthwall variant UUID for product tier "${line.tierId}". Refusing to checkout with unverified/placeholder ID.`
                );
            }
            items.push({
                variantId: mapping.fourthwallVariantId || mapping.fourthwallProductId,
                quantity: line.quantity || 1,
            });
        }

        // 4. Create multi-item Storefront cart
        const { cartId, checkoutUrl } = await this.gateway.createMultiItemStorefrontCart({
            items,
            customerEmail: params.customerEmail,
            customerName: params.customerName,
            invoiceId: params.orderRef,
            metadata: {
                ...(params.metadata || {}),
                invoiceId: params.orderRef,
                region: "GLOBAL",
                currency: "USD",
            },
        });

        return {
            sessionId: cartId,
            sessionUrl: checkoutUrl,
            orderId: params.orderRef,
            amount: params.amount,
            currency: "USD",
            status: "ACTIVE",
        };
    }
}
