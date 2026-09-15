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
