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
import { KashierGateway } from './KashierGateway';

// ═══════════════════════════════════════════════════════════════════════════
//                          COUNTRY ROUTING SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

const CountryCodeSchema = z.string()
    .min(1, 'Country code is required')
    .transform(val => val.trim().toUpperCase());

/** Egypt → Paymob */
const PAYMOB_COUNTRIES = new Set(['EG', 'EGYPT', 'مصر']);

/** Stripe countries (US, EU, Middle East non-Egypt, Global) */
const STRIPE_COUNTRIES = new Set([
    'US', 'USA', 'CA', 'CANADA',
    'GB', 'UK', 'DE', 'GERMANY', 'FR', 'FRANCE', 'IT', 'ITALY', 'ES', 'SPAIN',
    'NL', 'NETHERLANDS', 'BE', 'BELGIUM', 'AT', 'AUSTRIA', 'CH', 'SWITZERLAND',
    'SE', 'SWEDEN', 'NO', 'NORWAY', 'DK', 'DENMARK', 'FI', 'FINLAND',
    'IE', 'IRELAND', 'PT', 'PORTUGAL', 'PL', 'POLAND', 'CZ', 'CZECH REPUBLIC',
    'AU', 'AUSTRALIA', 'NZ', 'NEW ZEALAND', 'JP', 'JAPAN', 'SG', 'SINGAPORE',
    'SA', 'SAUDI ARABIA', 'السعودية', 'AE', 'UAE', 'الإمارات',
    'KW', 'KUWAIT', 'QA', 'QATAR', 'BH', 'BAHRAIN', 'OM', 'OMAN',
    'GLOBAL',
]);

// ═══════════════════════════════════════════════════════════════════════════
//                          SINGLETON INSTANCES
// ═══════════════════════════════════════════════════════════════════════════

let spaceRemitInstance: SpaceRemitGateway | null = null;
let paymobInstance: PaymobGateway | null = null;
let stripeInstance: StripeGateway | null = null;
let kashierEgyptInstance: KashierGateway | null = null;
let kashierGlobalInstance: KashierGateway | null = null;

// ═══════════════════════════════════════════════════════════════════════════
//                          FACTORY CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class PaymentFactory {

    /**
     * Get the appropriate payment gateway for the given country.
     *
     * Routing Logic (used for non-Kashier flows via PaymentFactory.getGateway):
     *   1. Egypt → Paymob (EGP payments)
     *   2. US, EU, Middle East, Global → Stripe (multi-currency)
     *   3. Fallback → SpaceRemit
     *
     * NOTE: Kashier routing is handled upstream in create-invoice/route.ts
     * based on paymentMethod='kashier'. This factory does not select Kashier
     * to preserve backward compatibility with existing flows.
     */
    static getGateway(countryCode: string): IPaymentGateway {
        const parsed = CountryCodeSchema.safeParse(countryCode);
        if (!parsed.success) {
            console.warn(`⚠️ [PaymentFactory] Invalid country code: "${countryCode}", using SpaceRemit fallback`);
            return PaymentFactory.getSpaceRemit();
        }
        const normalized = parsed.data;

        if (PAYMOB_COUNTRIES.has(normalized)) {
            console.log(`🇪🇬 [PaymentFactory] Routing to Paymob for country: ${normalized}`);
            return PaymentFactory.getPaymob();
        }

        const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
        if (STRIPE_COUNTRIES.has(normalized) && hasStripeKey) {
            console.log(`💳 [PaymentFactory] Routing to Stripe for country: ${normalized}`);
            return PaymentFactory.getStripe();
        }

        console.log(`🚀 [PaymentFactory] Routing to SpaceRemit (fallback) for country: ${normalized}`);
        return PaymentFactory.getSpaceRemit();
    }

    /**
     * Detect the gateway from a webhook/callback request.
     *
     * Detection order (ONLY gateway-authenticated signals):
     *   1. x-kashier-signature → Kashier Egypt (initial; webhook handler does cross-account routing)
     *   2. stripe-signature → Stripe
     *   3. hmac header/query → Paymob
     *   4. x-spaceremit-signature / SP_payment_code → SpaceRemit
     *   5. Fallback → SpaceRemit
     */
    static detectGatewayFromRequest(req: { headers: Record<string, string | string[] | undefined>; query: Record<string, string | string[] | undefined> }): IPaymentGateway {
        // 1. Kashier (checked BEFORE generic HMAC to avoid false-positive with Paymob)
        if (req.headers['x-kashier-signature']) {
            console.log('💳 [PaymentFactory] Kashier webhook detected via x-kashier-signature');
            return PaymentFactory.getKashierEgypt(); // webhook handler will cross-route if needed
        }

        // 2. Stripe
        if (req.headers['stripe-signature']) {
            return PaymentFactory.getStripe();
        }

        // 3. Paymob HMAC
        if (req.headers['hmac'] || req.query?.hmac) {
            return PaymentFactory.getPaymob();
        }

        // 4. SpaceRemit-specific
        if (req.headers['x-spaceremit-signature'] || req.query?.SP_payment_code || req.query?.gateway === 'spaceremit') {
            return PaymentFactory.getSpaceRemit();
        }

        // 5. Fallback
        console.warn('⚠️ [PaymentFactory] Could not detect gateway from request, using SpaceRemit fallback');
        return PaymentFactory.getSpaceRemit();
    }

    /**
     * Detect Kashier account from a merchant ID.
     * Used by the webhook handler for cross-account routing after initial Kashier detection.
     */
    static detectKashierAccountFromMerchantId(merchantId: string): KashierGateway | null {
        const rawMode = (process.env.KASHIER_MODE || 'test').toLowerCase();
        const modePrefix = rawMode === 'live' ? 'KASHIER_LIVE' : 'KASHIER_TEST';

        // Check new naming convention first (KASHIER_TEST_*/KASHIER_LIVE_*)
        const testMid  = process.env[modePrefix + '_MERCHANT_ID'] || '';
        if (testMid && merchantId === testMid) return PaymentFactory.getKashierEgypt();

        // Fallback to legacy naming (KASHIER_EGYPT_*/KASHIER_GLOBAL_*)
        const egyptMid  = process.env.KASHIER_EGYPT_MERCHANT_ID  || '';
        const globalMid = process.env.KASHIER_GLOBAL_MERCHANT_ID || '';
        if (egyptMid  && merchantId === egyptMid)  return PaymentFactory.getKashierEgypt();
        if (globalMid && merchantId === globalMid) return PaymentFactory.getKashierGlobal();
        return null;
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

    private static getKashierEgypt(): KashierGateway {
        if (!kashierEgyptInstance) kashierEgyptInstance = new KashierGateway('egypt');
        return kashierEgyptInstance;
    }

    private static getKashierGlobal(): KashierGateway {
        if (!kashierGlobalInstance) kashierGlobalInstance = new KashierGateway('global');
        return kashierGlobalInstance;
    }
}
