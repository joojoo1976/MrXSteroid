/**
 * Legacy page → Next.js route map.
 * Centralized so pages, header, footer and programmatic navigation all share
 * one source of truth (mirrors the old PAGE_TO_PATH table).
 */
import { Page } from '@/shared/types/types';

export const PAGE_TO_PATH: Record<Page, string> = {
    [Page.HOME]: '/',
    [Page.DASHBOARD]: '/dashboard',
    [Page.DIAGNOSTIC]: '/diagnostic',
    [Page.LOGIN]: '/login',
    [Page.SIGNUP]: '/signup',
    [Page.PROFILE]: '/profile',
    [Page.ABOUT]: '/about',
    [Page.SITEMAP]: '/sitemap',
    [Page.ACCESSIBILITY]: '/accessibility',
    [Page.GDPR]: '/gdpr',
    [Page.CCPA]: '/ccpa',
    [Page.BLOG]: '/blog',
    [Page.SHIPPING_POLICY]: '/shipping',
    [Page.RETURN_POLICY]: '/returns',
    [Page.COOKIE_POLICY]: '/cookies',
    [Page.SUPPORT]: '/support',
    [Page.CAREERS]: '/careers',
    [Page.FAQ]: '/faq',
    [Page.CONTACT]: '/contact',
    [Page.PRIVACY]: '/privacy',
    [Page.TERMS]: '/terms',
    [Page.REFUND]: '/refund',
    [Page.LEGAL_DISCLAIMER_PAGE]: '/disclaimer',
    [Page.PAYMENT_SUCCESS]: '/success',
    [Page.PAYMENT_CANCEL]: '/cancel',
    [Page.PAYMENT_PENDING]: '/payment-pending',
    [Page.REPRESENTATIVE]: '/representative',
    [Page.ADMIN_DASHBOARD]: '/admin',
    [Page.ADMIN_ANALYTICS]: '/admin-analytics',
    [Page.AUTH_CALLBACK]: '/auth/callback',
    [Page.MACRO]: '/macro',
    [Page.BODYFAT]: '/bodyfat',
    [Page.INJECTION]: '/injection',
    [Page.HALFLIFE]: '/halflife',
    [Page.LAB]: '/lab',
    [Page.GENETIC]: '/genetic',
    [Page.CYCLE_ARCHITECT]: '/cycle',
    [Page.MASTER_CALCULATOR]: '/master-calculator',
    [Page.SMART_LANDING]: '/smart-landing',
    [Page.MEDICAL_DISCLAIMER]: '/medical-disclaimer',
    [Page.RESET_PASSWORD]: '/reset-password',
    [Page.CHECKOUT]: '/checkout',
    [Page.PAYMENT_CONFIG_DIAGNOSTIC]: '/payment-diagnostic',
    [Page.TIMELINE]: '/TransformationTimeline',
};

export function pageToPath(page: Page): string {
    return PAGE_TO_PATH[page] || '/';
}

export function pathToPage(path: string): Page | null {
    // Strip leading /ar or /en locale prefixes
    const normalized = path.replace(/^\/(ar|en)(?=\/|$)/, '') || '/';
    for (const [page, p] of Object.entries(PAGE_TO_PATH)) {
        if (p === normalized) return page as Page;
    }
    return null;
}
