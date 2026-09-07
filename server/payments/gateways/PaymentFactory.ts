/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🏭 PAYMENT FACTORY — Gateway Selector with Zod Validation               ║
 * ║  Routes to the correct gateway based on the customer's country            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { z } from 'zod';
import type { IPaymentGateway } from './IPaymentGateway';
import { SpaceRemitGateway } from './SpaceRemitGateway';
import { PaymobGateway } from './PaymobGateway';
import { StripeGateway } from './StripeGateway';

// ═══════════════════════════════════════════════════════════════════════════
//                          COUNTRY ROUTING SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Zod schema to validate and normalize country codes
 */
const CountryCodeSchema = z.string()
    .min(1, 'Country code is required')
    .transform(val => val.trim().toUpperCase());

/**
 * Countries routed to Paymob (Egypt only — EGP payments)
 */
const PAYMOB_COUNTRIES = new Set(['EG', 'EGYPT', 'مصر']);

/**
 * Countries routed to Stripe (US, EU, Global)
 * This list covers major regions; all unlisted countries also go to Stripe.
 */
const STRIPE_COUNTRIES = new Set([
    // North America
    'US', 'USA', 'CA', 'CANADA',
    // Europe
    'GB', 'UK', 'DE', 'GERMANY', 'FR', 'FRANCE', 'IT', 'ITALY', 'ES', 'SPAIN',
    'NL', 'NETHERLANDS', 'BE', 'BELGIUM', 'AT', 'AUSTRIA', 'CH', 'SWITZERLAND',
    'SE', 'SWEDEN', 'NO', 'NORWAY', 'DK', 'DENMARK', 'FI', 'FINLAND',
    'IE', 'IRELAND', 'PT', 'PORTUGAL', 'PL', 'POLAND', 'CZ', 'CZECH REPUBLIC',
    // Asia Pacific
    'AU', 'AUSTRALIA', 'NZ', 'NEW ZEALAND', 'JP', 'JAPAN', 'SG', 'SINGAPORE',
    // Middle East (non-Egypt)
    'SA', 'SAUDI ARABIA', 'السعودية',
    'AE', 'UAE', 'الإمارات',
    'KW', 'KUWAIT', 'QA', 'QATAR', 'BH', 'BAHRAIN', 'OM', 'OMAN',
    // Global flag
    'GLOBAL',
]);

// ═══════════════════════════════════════════════════════════════════════════
//                          SINGLETON INSTANCES
// ═══════════════════════════════════════════════════════════════════════════

let spaceRemitInstance: SpaceRemitGateway | null = null;
let paymobInstance: PaymobGateway | null = null;
let stripeInstance: StripeGateway | null = null;

// ═══════════════════════════════════════════════════════════════════════════
//                          FACTORY CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class PaymentFactory {

    /**
     * Get the appropriate payment gateway for the given country.
     * 
     * Routing Logic:
     *   1. Egypt → Paymob (EGP payments)
     *   2. US, EU, Middle East, Global → Stripe (multi-currency)
     *   3. Fallback → SpaceRemit (existing flow)
     * 
     * @param countryCode - Raw country name or ISO code (validated with Zod)
     * @returns The matched IPaymentGateway implementation
     */
    static getGateway(countryCode: string): IPaymentGateway {
        // Validate and normalize
        const parsed = CountryCodeSchema.safeParse(countryCode);

        if (!parsed.success) {
            console.warn(`⚠️ [PaymentFactory] Invalid country code: "${countryCode}", using SpaceRemit fallback`);
            return PaymentFactory.getSpaceRemit();
        }

        const normalized = parsed.data;

        // 1. Egypt → Paymob
        if (PAYMOB_COUNTRIES.has(normalized)) {
            console.log(`🇪🇬 [PaymentFactory] Routing to Paymob for country: ${normalized}`);
            return PaymentFactory.getPaymob();
        }

        // 2. Stripe countries (Only if configured)
        const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
        if (STRIPE_COUNTRIES.has(normalized) && hasStripeKey) {
            console.log(`💳 [PaymentFactory] Routing to Stripe for country: ${normalized}`);
            return PaymentFactory.getStripe();
        }

        // 3. Fallback → SpaceRemit
        console.log(`🚀 [PaymentFactory] Routing to SpaceRemit (fallback) for country: ${normalized}`);
        return PaymentFactory.getSpaceRemit();
    }

    /**
     * Detect the gateway from a webhook/callback request.
     * 
     * Detection order:
     *   1. `stripe-signature` header → Stripe
     *   2. `hmac` header/query → Paymob
     *   3. SpaceRemit-specific headers/query params
     *   4. Fallback → SpaceRemit
     * 
     * Note: Detection is driven ONLY by gateway-authenticated signals (signature
     * headers / verified callbacks). A caller-supplied `x-gateway-name` header is
     * deliberately ignored so an attacker cannot steer the request to a weaker
     * gateway before signature verification.
     */
    static detectGatewayFromRequest(req: { headers: Record<string, string | string[] | undefined>; query: Record<string, string | string[] | undefined> }): IPaymentGateway {
        // 1. Stripe signature header
        if (req.headers['stripe-signature']) {
            return PaymentFactory.getStripe();
        }

        // 2. Paymob HMAC
        if (req.headers['hmac'] || req.query?.hmac) {
            return PaymentFactory.getPaymob();
        }

        // 3. SpaceRemit-specific
        if (req.headers['x-spaceremit-signature'] || req.query?.SP_payment_code || req.query?.gateway === 'spaceremit') {
            return PaymentFactory.getSpaceRemit();
        }

        // 4. Default fallback
        console.warn('⚠️ [PaymentFactory] Could not detect gateway from request, using SpaceRemit fallback');
        return PaymentFactory.getSpaceRemit();
    }

    // ─── Singleton Accessors ──────────────────────────────────────────────

    private static getSpaceRemit(): SpaceRemitGateway {
        if (!spaceRemitInstance) spaceRemitInstance = new SpaceRemitGateway();
        return spaceRemitInstance;
    }

    private static getPaymob(): PaymobGateway {
        if (!paymobInstance) paymobInstance = new PaymobGateway();
        return paymobInstance;
    }

    private static getStripe(): StripeGateway {
        if (!stripeInstance) stripeInstance = new StripeGateway();
        return stripeInstance;
    }
}
