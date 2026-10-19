/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  KASHIER SERVICE LINK ADAPTER — Direct Services Routing
 *  Adapts direct Kashier payment links for VIP Coaching & Custom Consultation
 *  to the CombinedCheckoutGateway contract for Global USD checkouts.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type {
    CombinedCheckoutGateway,
    CombinedPaymentSessionParams,
    CombinedPaymentSessionResult,
} from "../checkout/combinedCheckoutSessionService";
import { CheckoutValidationError } from "../checkout/checkoutSessionService";
import {
    buildKashierServicePaymentUrl,
    getKashierServicePaymentLink,
    KASHIER_SERVICE_PAYMENT_LINKS,
    type KashierServiceId,
} from "../paymentLinkConfig";

export class KashierServiceLinkAdapter implements CombinedCheckoutGateway {
    async createPaymentSession(
        params: CombinedPaymentSessionParams
    ): Promise<CombinedPaymentSessionResult> {
        if (params.currency !== "USD") {
            throw new CheckoutValidationError(
                `[KashierServiceLinkAdapter] Invalid currency: ${params.currency}. Service links are USD-only.`
            );
        }

        const lines = params.lines || [];
        if (lines.length !== 1) {
            throw new CheckoutValidationError(
                "[KashierServiceLinkAdapter] Direct service links support exactly one service item per checkout session."
            );
        }

        const line = lines[0];
        const tier = String(line.tierId);
        let serviceKey: KashierServiceId | null = null;
        if (
            tier === "coaching_addon" ||
            tier === "coaching_plus" ||
            tier === "bundle_plus" ||
            tier === "digital_plus"
        ) {
            serviceKey = "coaching_addon";
        } else if (tier === "consultation") {
            serviceKey = "consultation";
        }

        if (!serviceKey) {
            throw new CheckoutValidationError(
                `[KashierServiceLinkAdapter] Tier "${tier}" is not an approved direct service.`
            );
        }

        const linkConfig = getKashierServicePaymentLink(serviceKey);
        if (linkConfig.status !== 'CONFIGURED') {
            throw new CheckoutValidationError(
                'الدفع غير متاح مؤقتًا — سيتم التفعيل قريبًا'
            );
        }

        const sessionUrl = buildKashierServicePaymentUrl(serviceKey, {
            invoiceId: params.orderRef,
            userEmail: params.customerEmail,
            fullName: params.customerName,
        });

        return {
            sessionId: linkConfig.serviceId,
            sessionUrl,
            orderId: params.orderRef,
            amount: linkConfig.amount,
            currency: "USD",
            status: "ACTIVE",
        };
    }
}
