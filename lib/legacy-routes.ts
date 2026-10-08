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
    [Page.PAYMENT_DIAGNOSTIC]: '/payment-diagnostic',
    [Page.FRAUD_ENGINE]: '/evaluate-risk',
    [Page.TIMELINE]: '/TransformationTimeline',
    [Page.HPTA_RECOVERY]: '/smarttools/hpta-recovery',
    [Page.AROMATIZATION_RISK]: '/smarttools/aromatization-risk',
    [Page.PCT_TIMING]: '/smarttools/pct-timing',
    [Page.HCG_SERM_PROTOCOL]: '/smarttools/hcg-serm-protocol',
    [Page.AFFILIATE]: '/profile/affiliate',
    [Page.MULTI_ESTER_PK]: '/smarttools/multi-ester-pharmacokinetics',
    [Page.ESTROGEN_PROLACTIN]: '/smarttools/tool-006-estrogen-prolactin',
    [Page.BLOODWORK_ANALYZER]: '/smarttools/tool-007-bloodwork-analyzer',
    [Page.SIDE_EFFECT_TRACKER]: '/smarttools/tool-008-side-effect-tracker',
    [Page.INJECTION_SITE_ROTATOR]: '/smarttools/tool-009-injection-site-rotator',
    [Page.COMPOUND_STACK_BUILDER]: '/smarttools/tool-010-compound-stack-builder',
    [Page.PROGRESS_TRACKER]: '/smarttools/tool-011-progress-tracker',
    [Page.CALORIE_ADJUSTER]: '/smarttools/tool-012-calorie-adjuster',
    [Page.MACRO_OPTIMIZER]: '/smarttools/tool-013-macro-optimizer',
    [Page.WATER_RETENTION]: '/smarttools/tool-014-water-retention',
    [Page.SHBG_MODULATOR]: '/smarttools/tool-015-shbg-modulator',
    [Page.HALF_LIFE_CALCULATOR]: '/smarttools/tool-016-half-life-calculator',
    [Page.DRUG_INTERACTION]: '/smarttools/tool-017-drug-interaction',
    [Page.HPTA_RECOVERY_MONITOR]: '/smarttools/tool-018-hpta-recovery',
    [Page.CARDIO_MONITOR]: '/smarttools/tool-019-cardio-monitor',
    [Page.GENETIC_POTENTIAL]: '/smarttools/tool-020-genetic-potential',
    [Page.PEPTIDE_PROTOCOL]: '/smarttools/tool-021-peptide-protocol',
    [Page.HALF_LIFE_STACKER]: '/smarttools/tool-022-half-life-stacker',
    [Page.TRT_OPTIMIZATION]: '/smarttools/tool-023-trt-optimization',
    [Page.BLOODWORK_INTERPRETER]: '/smarttools/tool-024-bloodwork-interpreter',
    [Page.DRUG_INTERACTION_PRO]: '/smarttools/tool-025-drug-interaction-pro',
    [Page.INJECTION_PAIN]: '/smarttools/tool-026-injection-pain',
    [Page.ESTER_CONVERSION]: '/smarttools/tool-027-ester-conversion',
    [Page.STACKING_SYNERGY]: '/smarttools/tool-028-stacking-synergy',
    [Page.SIDE_EFFECT_EARLY_WARNING]: '/smarttools/tool-029-side-effect-early-warning',
    [Page.CYCLE_COST_CALCULATOR]: '/smarttools/tool-030-cycle-cost-calculator',
};

export function pageToPath(page: Page): string {
    return PAGE_TO_PATH[page] || '/';
}

export function pathToPage(path: string | null | undefined): Page | null {
    if (!path || typeof path !== 'string') return Page.HOME;
    // Strip leading /ar or /en locale prefixes, trim whitespace, and normalize trailing slashes
    const trimmed = path.trim();
    let normalized = trimmed.replace(/^\/(ar|en)(?=\/|$)/i, '') || '/';
    if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }
    const lowerNormalized = normalized.toLowerCase();

    for (const [page, p] of Object.entries(PAGE_TO_PATH)) {
        if (p === normalized || p.toLowerCase() === lowerNormalized) return page as Page;
    }

    // Common aliases
    if (lowerNormalized === '/timeline') return Page.TIMELINE;
    if (lowerNormalized === '/affiliate') return Page.AFFILIATE;
    if (lowerNormalized === '/admin') return Page.ADMIN_DASHBOARD;
    if (lowerNormalized === '/smarttools') return Page.MASTER_CALCULATOR;

    return null;
}
