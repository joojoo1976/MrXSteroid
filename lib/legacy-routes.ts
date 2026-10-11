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
    [Page.CYCLE_LENGTH_OPTIMIZER]: '/smarttools/tool-031-cycle-length-optimizer',
    [Page.ADVANCED_PCT_PLANNER]: '/smarttools/tool-032-advanced-pct-planner',
    [Page.BLOODWORK_TREND_ANALYZER]: '/smarttools/tool-033-bloodwork-trend-analyzer',
    [Page.COMPOUND_CLEARANCE]: '/smarttools/tool-034-compound-clearance',
    [Page.HORMONE_CONVERSION]: '/smarttools/tool-035-hormone-conversion',
    [Page.INJECTION_SCHEDULE]: '/smarttools/tool-036-injection-schedule',
    [Page.SIDE_EFFECT_PROBABILITY]: '/smarttools/tool-037-side-effect-probability',
    [Page.STACK_COMPATIBILITY]: '/smarttools/tool-038-stack-compatibility',
    [Page.LIVER_ENZYME_TRACKER]: '/smarttools/tool-039-liver-enzyme-tracker',
    [Page.LIPID_PROFILE_OPTIMIZER]: '/smarttools/tool-040-lipid-profile-optimizer',

    [Page.HEMATOCRIT_MONITOR]: '/smarttools/tool-041-hematocrit-monitor',
    [Page.ESTROGEN_MANAGEMENT]: '/smarttools/tool-042-estrogen-management',
    [Page.PROLACTIN_MANAGEMENT]: '/smarttools/tool-043-prolactin-management',
    [Page.DHT_SIDE_EFFECTS]: '/smarttools/tool-044-dht-side-effects',
    [Page.CYCLE_BREAK_PLANNER]: '/smarttools/tool-045-cycle-break-planner',

    [Page.TRT_LIFETIME]: '/smarttools/tool-046-trt-lifetime',
    [Page.FERTILITY_PRESERVATION]: '/smarttools/tool-047-fertility-preservation',
    [Page.CARDIOVASCULAR_RISK]: '/smarttools/tool-048-cardiovascular-risk',
    [Page.BONE_DENSITY]: '/smarttools/tool-049-bone-density',
    [Page.MENTAL_HEALTH]: '/smarttools/tool-050-mental-health',

    [Page.PEPTIDE_DOSAGE_CALCULATOR]: '/smarttools/tool-051-peptide-dosage-calculator',
    [Page.GROWTH_HORMONE_PROTOCOL_PLANNER]: '/smarttools/tool-052-growth-hormone-protocol-planner',
    [Page.INSULIN_CONVERSION_CALCULATOR]: '/smarttools/tool-053-insulin-conversion-calculator',
    [Page.GLUCOSE_TRACKER]: '/smarttools/tool-054-glucose-tracker',
    [Page.INSULIN_SENSITIVITY_OPTIMIZER]: '/smarttools/tool-055-insulin-sensitivity-optimizer',

    [Page.MINI_PCT_CALCULATOR]: '/smarttools/tool-056-mini-pct-calculator',
    [Page.FREE_TESTOSTERONE_MANAGER]: '/smarttools/tool-057-free-testosterone-manager',
    [Page.ANDROGENIC_BALANCE_CALCULATOR]: '/smarttools/tool-058-androgenic-balance-calculator',
    [Page.ANDROGEN_RECEPTOR_OPTIMIZER]: '/smarttools/tool-059-androgen-receptor-optimizer',
    [Page.FIVE_ALPHA_CONVERSION_CALCULATOR]: '/smarttools/tool-060-5-alpha-conversion-calculator',

    [Page.HAIR_LOSS_TRACKER]: '/smarttools/tool-061-hair-loss-tracker',
    [Page.PROSTATE_HEALTH_MANAGER]: '/smarttools/tool-062-prostate-health-manager',
    [Page.TESTICULAR_SUPPRESSION_CALCULATOR]: '/smarttools/tool-063-testicular-suppression-calculator',
    [Page.SPERM_PRODUCTION_OPTIMIZER]: '/smarttools/tool-064-sperm-production-optimizer',
    [Page.AROMATASE_CONVERSION_CALCULATOR]: '/smarttools/tool-065-aromatase-conversion-calculator',

    [Page.ESTROGEN_SENSITIVITY_MANAGER]: '/smarttools/tool-066-estrogen-sensitivity-manager',
    [Page.ESTROGEN_BALANCE_CALCULATOR]: '/smarttools/tool-067-estrogen-balance-calculator',
    [Page.GYNECOMASTIA_TRACKER]: '/smarttools/tool-068-gynecomastia-tracker',
    [Page.DETOXIFICATION_OPTIMIZER]: '/smarttools/tool-069-detoxification-optimizer',
    [Page.OXIDATIVE_STRESS_CALCULATOR]: '/smarttools/tool-070-oxidative-stress-calculator',

    [Page.ANTIOXIDANT_MANAGER]: '/smarttools/tool-071-antioxidant-manager',
    [Page.SYSTEMIC_INFLAMMATION_CALCULATOR]: '/smarttools/tool-072-systemic-inflammation-calculator',
    [Page.IMMUNE_SYSTEM_OPTIMIZER]: '/smarttools/tool-073-immune-system-optimizer',
    [Page.BLOOD_PRESSURE_TRACKER]: '/smarttools/tool-074-blood-pressure-tracker',
    [Page.ARTERIAL_HEALTH_MANAGER]: '/smarttools/tool-075-arterial-health-manager',

    [Page.BLOOD_VISCOSITY_CALCULATOR]: '/smarttools/tool-076-blood-viscosity-calculator',
    [Page.NITRIC_OXIDE_OPTIMIZER]: '/smarttools/tool-077-nitric-oxide-optimizer',
    [Page.ENDOTHELIAL_HEALTH_MANAGER]: '/smarttools/tool-078-endothelial-health-manager',
    [Page.FAT_METABOLISM_CALCULATOR]: '/smarttools/tool-079-fat-metabolism-calculator',
    [Page.MITOCHONDRIAL_OPTIMIZER]: '/smarttools/tool-080-mitochondrial-optimizer',

    [Page.CELLULAR_AGING_CALCULATOR]: '/smarttools/tool-081-cellular-aging-calculator',
    [Page.TELOMERE_MANAGER]: '/smarttools/tool-082-telomere-manager',
    [Page.ANTI_AGING_INFLAMMATION_CALCULATOR]: '/smarttools/tool-083-anti-aging-inflammation-calculator',
    [Page.COGNITIVE_ENHANCER]: '/smarttools/tool-084-cognitive-enhancer',
    [Page.SLEEP_QUALITY_MANAGER]: '/smarttools/tool-085-sleep-quality-manager',
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
