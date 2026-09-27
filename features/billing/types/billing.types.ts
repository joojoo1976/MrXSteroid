/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MR. X STEROID — BILLING & PAYMENT GATEWAY ARCHITECTURE TYPES
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Database } from '@/shared/types/db_types';

export type CurrencyCode = 'USD' | 'EGP' | 'EUR' | 'GBP' | 'SAR' | 'AED';
export type RegionalMarket = 'EG' | 'GLOBAL';
export type SupportedLocale = 'ar' | 'en';

export type PaymentGatewayType = 'stripe' | 'paymob' | 'paypal' | 'spaceremit' | 'instapay' | 'vodafone_cash' | 'kashier';
export type InvoiceStatus = 'pending' | 'success' | 'failed' | 'refunded' | 'cancelled';
export type PlanTierId = 'digital' | 'bundle' | 'coaching' | 'digital_plus' | 'bundle_plus' | 'coaching_plus';

export interface PlanFeatureItem {
    text: string;
    included: boolean;
    badge?: string;
}

export interface BillingPlanDefinition {
    id: PlanTierId;
    baseId: 'digital' | 'bundle' | 'coaching';
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    badgeAr?: string;
    badgeEn?: string;
    isPopular?: boolean;
    isFeatured?: boolean;
    prices: {
        EGP: { current: number; original: number };
        USD: { current: number; original: number };
    };
    coachingAddon: {
        EGP: number;
        USD: number;
    };
    featuresAr: string[];
    featuresEn: string[];
    requiresShipping: boolean;
    requiresBodyStats: boolean;
    deliveryType: 'digital_download' | 'physical_and_digital' | 'coaching_and_digital';
    ctaAr: string;
    ctaEn: string;
}

export interface PaymentMethodOption {
    id: string;
    gateway: PaymentGatewayType;
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    icon: string;
    badge?: string;
    supportedCurrencies: CurrencyCode[];
    supportedRegions: RegionalMarket[];
    isInstant: boolean;
    /**
     * Whether this method may appear in the customer-facing checkout selector.
     *
     * A method can be fully defined here and still be withheld from the UI when
     * the provider is not approved for customer traffic. The server-side
     * gateway remains fully implemented and fail-closed either way; this flag
     * only controls what a customer is shown.
     *
     * Defaults to `true` when omitted.
     */
    isRenderableInCustomerUi?: boolean;
}

export interface InvoiceItem {
    id: string;
    user_id?: string | null;
    gateway: string;
    status: InvoiceStatus;
    tier_id: string;
    amount: number;
    currency: string;
    gateway_reference_id?: string | null;
    customer_email?: string | null;
    customer_name?: string | null;
    phone_number?: string | null;
    shipping_cost?: number;
    discount_amount?: number;
    promo_code?: string | null;
    created_at: string;
    updated_at?: string;
    metadata?: Record<string, unknown>;
}

export interface UserSubscriptionInfo {
    tier: string;
    status: 'active' | 'inactive' | 'expired' | 'trial';
    planName: string;
    validUntil?: string | null;
    invoiceId?: string | null;
    autoRenew?: boolean;
}
