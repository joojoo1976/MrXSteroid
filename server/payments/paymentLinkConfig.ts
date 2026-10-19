/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  KASHIER LIVE PAYMENT PAGES CONFIGURATION
 *  Direct Payment Links for Mr. X-Steroid Core Packages
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface KashierPackagePaymentLink {
    planId: 'digital' | 'bundle' | 'coaching';
    nameAr: string;
    nameEn: string;
    liveUrl: string;
    requiresShipping: boolean;
    tier: string;
}

export const KASHIER_PAYMENT_PAGES: Record<string, KashierPackagePaymentLink> = {
    digital: {
        planId: 'digital',
        nameAr: 'البروتوكول الرقمي',
        nameEn: 'The Digital Protocol',
        liveUrl: 'https://checkouts.kashier.io/en/prepaymenpages?ppLink=PP-4876162501,live',
        requiresShipping: false,
        tier: 'digital',
    },
    bundle: {
        planId: 'bundle',
        nameAr: 'الباقة التكتيكية',
        nameEn: 'Tactical Bundle',
        liveUrl: 'https://checkouts.kashier.io/en/prepaymenpages?ppLink=PP-4876162502,live',
        requiresShipping: true, // تتضمن النسخة المطبوعة + شحن
        tier: 'bundle',
    },
    coaching: {
        planId: 'coaching',
        nameAr: 'المحترف الذكي',
        nameEn: 'Smart Pro (Coaching)',
        liveUrl: 'https://checkouts.kashier.io/en/prepaymenpages?ppLink=PP-4876162503,live',
        requiresShipping: true, // تتضمن النسخة المطبوعة + تدريب شخصي
        tier: 'coaching',
    },
};

/**
 * Builds the tracked Kashier checkout URL with package identifiers, source tagging,
 * and user attribution.
 */
export function buildKashierPaymentPageUrl(
    planId: 'digital' | 'bundle' | 'coaching',
    options?: {
        userId?: string;
        userEmail?: string;
        referralCode?: string;
    }
): string {
    const pkg = KASHIER_PAYMENT_PAGES[planId];
    if (!pkg) return 'https://checkouts.kashier.io';

    const url = new URL(pkg.liveUrl);
    url.searchParams.set('source', 'kashier_payment_page');
    url.searchParams.set('plan_id', pkg.planId);
    url.searchParams.set('plan_name', encodeURIComponent(pkg.nameAr));

    if (options?.userId) {
        url.searchParams.set('user_id', options.userId);
    }
    if (options?.userEmail) {
        url.searchParams.set('email', options.userEmail);
    }
    if (options?.referralCode) {
        url.searchParams.set('ref', options.referralCode);
    }

    return url.toString();
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  KASHIER DIRECT SERVICE PAYMENT LINKS (GLOBAL / USD ONLY)
 *  Approved direct payment links for services prohibited on Fourthwall (AUP §13)
 *  Configured via server environment variables:
 *    - KASHIER_COACHING_PAYMENT_URL
 *    - KASHIER_CONSULTATION_PAYMENT_URL
 *    - KASHIER_SERVICE_LINKS_VERIFIED ('true' | 'false')
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type KashierServiceId = 'coaching_addon' | 'consultation';

export type ServiceLinkVerificationStatus = 'CONFIGURED' | 'UNVERIFIED' | 'NOT_CONFIGURED';

export interface KashierServicePaymentLink {
    serviceId: KashierServiceId;
    canonicalProductId: 'MRX-COACHING-ADDON' | 'MRX-CONSULTATION';
    nameAr: string;
    nameEn: string;
    liveUrl: string | null;
    currency: 'USD';
    region: 'GLOBAL';
    amount: number;
    requiresShipping: false;
    status: ServiceLinkVerificationStatus;
    verificationNotice: string;
}

/**
 * Resolves the service link configuration dynamically from server environment variables.
 * Defaults to UNVERIFIED if a static link exists without verified server-to-server callback proof.
 */
export function getKashierServicePaymentLink(serviceId: KashierServiceId): KashierServicePaymentLink {
    const isVerified = (process.env.KASHIER_SERVICE_LINKS_VERIFIED || '').toLowerCase() === 'true';

    if (serviceId === 'coaching_addon') {
        const envUrl = process.env.KASHIER_COACHING_PAYMENT_URL?.trim()
            || 'https://checkouts.kashier.io/ar/paymentLinkPage?ppLink=PL-4876162508FIH,live';

        let status: ServiceLinkVerificationStatus = 'NOT_CONFIGURED';
        let verificationNotice = 'الرابط غير مهيأ في متغيرات البيئة';

        if (envUrl) {
            if (isVerified) {
                status = 'CONFIGURED';
                verificationNotice = 'تم التحقق من الرابط والاعتماد المالي';
            } else {
                status = 'UNVERIFIED';
                verificationNotice = 'رابط خارجي ثابت — يتطلب تحقق الإدارة وتأكيد ربط الفاتورة خادميًا';
            }
        }

        return {
            serviceId: 'coaching_addon',
            canonicalProductId: 'MRX-COACHING-ADDON',
            nameAr: 'تدريب 1-على-1 دورة كاملة',
            nameEn: 'VIP 1-on-1 Anabolic Cycle Coaching (1 Full Cycle)',
            liveUrl: envUrl || null,
            currency: 'USD',
            region: 'GLOBAL',
            amount: 349.99,
            requiresShipping: false,
            status,
            verificationNotice,
        };
    }

    if (serviceId === 'consultation') {
        const envUrl = process.env.KASHIER_CONSULTATION_PAYMENT_URL?.trim()
            || 'https://checkouts.kashier.io/ar/paymentLinkPage?ppLink=PL-487616250911F,live';

        let status: ServiceLinkVerificationStatus = 'NOT_CONFIGURED';
        let verificationNotice = 'الرابط غير مهيأ في متغيرات البيئة';

        if (envUrl) {
            if (isVerified) {
                status = 'CONFIGURED';
                verificationNotice = 'تم التحقق من الرابط والاعتماد المالي';
            } else {
                status = 'UNVERIFIED';
                verificationNotice = 'رابط خارجي ثابت — يتطلب تحقق الإدارة وتأكيد ربط الفاتورة خادميًا';
            }
        }

        return {
            serviceId: 'consultation',
            canonicalProductId: 'MRX-CONSULTATION',
            nameAr: 'جلسة تقييم واستشارة مخصصة',
            nameEn: 'Custom Consultation & Assessment Session — Mr. X-Steroid',
            liveUrl: envUrl || null,
            currency: 'USD',
            region: 'GLOBAL',
            amount: 30.00,
            requiresShipping: false,
            status,
            verificationNotice,
        };
    }

    throw new Error(`[PaymentLink] Unknown service ID: ${String(serviceId)}`);
}

/** Legacy accessor for backwards compatibility */
export const KASHIER_SERVICE_PAYMENT_LINKS: Record<KashierServiceId, KashierServicePaymentLink> = {
    get coaching_addon() {
        return getKashierServicePaymentLink('coaching_addon');
    },
    get consultation() {
        return getKashierServicePaymentLink('consultation');
    },
};

/**
 * Guard ensuring service payment links are only requested for GLOBAL (USD) checkouts.
 */
export function assertGlobalServiceLink(serviceId: string, region: string): KashierServicePaymentLink {
    if (region !== 'GLOBAL') {
        throw new Error(`[PaymentLink] Service link for "${serviceId}" is only permitted in GLOBAL region (USD).`);
    }
    const service = getKashierServicePaymentLink(serviceId as KashierServiceId);
    if (!service) {
        throw new Error(`[PaymentLink] Unknown service payment link: ${serviceId}`);
    }
    return service;
}

/**
 * Builds the tracked Kashier checkout URL for direct service payment links.
 * Fails closed if the service link is not configured or unverified.
 */
export function buildKashierServicePaymentUrl(
    serviceId: KashierServiceId,
    options?: {
        invoiceId?: string;
        userId?: string;
        userEmail?: string;
        fullName?: string;
        referralCode?: string;
        allowUnverified?: boolean;
    }
): string {
    const service = getKashierServicePaymentLink(serviceId);
    if (!service.liveUrl || service.status === 'NOT_CONFIGURED') {
        throw new Error(`[PaymentLink] Service link for "${serviceId}" is NOT_CONFIGURED.`);
    }

    if (service.status === 'UNVERIFIED' && !options?.allowUnverified) {
        throw new Error(
            `[PaymentLink] Service link for "${serviceId}" is UNVERIFIED. Direct automated payment is disabled until verified.`
        );
    }

    const url = new URL(service.liveUrl);
    url.searchParams.set('source', 'mrx_service_checkout');
    url.searchParams.set('service_id', service.serviceId);
    url.searchParams.set('canonical_id', service.canonicalProductId);
    url.searchParams.set('amount', service.amount.toFixed(2));
    url.searchParams.set('currency', service.currency);

    if (options?.invoiceId) {
        url.searchParams.set('invoice_id', options.invoiceId);
        url.searchParams.set('merchant_order_id', options.invoiceId);
    }
    if (options?.userId) {
        url.searchParams.set('user_id', options.userId);
    }
    if (options?.userEmail) {
        url.searchParams.set('email', options.userEmail);
    }
    if (options?.fullName) {
        url.searchParams.set('customer_name', encodeURIComponent(options.fullName));
    }
    if (options?.referralCode) {
        url.searchParams.set('ref', options.referralCode);
    }

    return url.toString();
}
