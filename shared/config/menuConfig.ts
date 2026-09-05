/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  menuConfig.ts — Shared Navigation Configuration
 *  Lead Digital Architect & Tech Advisor
 *
 *  Single source of truth for ALL navigation items, dropdowns, and tool links.
 *  Fully bilingual (AR/EN), used by GlobalHeader and Smart Tools pages.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page } from '@/shared/types/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MenuItem {
    label: string;
    labelAr: string;
    href: string;
    page?: Page;
    description?: string;
    descriptionAr?: string;
    icon?: string;
}

export interface DropdownConfig {
    key: string;
    label: string;
    labelAr: string;
    items: MenuItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Smart Tools (الأدوات الذكية)
// ─────────────────────────────────────────────────────────────────────────────

export const SMART_TOOLS: MenuItem[] = [
    {
        label: 'Advanced Macro Calculator',
        labelAr: 'حاسبة الماكروز المتطورة',
        href: '/macro',
        page: Page.MACRO,
        description: 'Advanced macro & TDEE calculator with meal plan generator',
        descriptionAr: 'حاسبة الماكروز المتقدمة مع مولد وجبات',
        icon: 'Flame',
    },
    {
        label: 'Body Fat Calculator',
        labelAr: 'حاسبة نسبة الدهون الجسمية',
        href: '/bodyfat',
        page: Page.BODYFAT,
        description: 'US Navy body fat formula with genetic potential analysis',
        descriptionAr: 'صيغة Navy للدهون مع تحليل القدرة الوراثية',
        icon: 'Scale',
    },
    {
        label: 'Interactive Injection Map',
        labelAr: 'خريطة الحقن التفاعلية',
        href: '/injection',
        page: Page.INJECTION,
        description: 'Interactive injection site map with rotation tracker',
        descriptionAr: 'خريطة م sites التفاعلية مع متتبع الدورة',
        icon: 'Syringe',
    },
    {
        label: 'Half-Life Simulator',
        labelAr: 'محاكي نصف العمر',
        href: '/halflife',
        page: Page.HALFLIFE,
        description: 'Visualize compound half-life, saturation & PCT timing',
        descriptionAr: 'تصور نصف عمر المركبات ووقت PCT',
        icon: 'Timer',
    },
    {
        label: 'Smart Lab Reference',
        labelAr: 'المرجع الذكي للتحاليل',
        href: '/lab',
        page: Page.LAB,
        description: 'Interactive lab test reference with AI analysis',
        descriptionAr: 'مرجع التحاليل التفاعلي مع تحليل ذكي',
        icon: 'Beaker',
    },
    {
        label: 'Genetic Potential Calculator',
        labelAr: 'حاسبة الإمكانات الوراثية',
        href: '/genetic',
        page: Page.GENETIC,
        description: 'Casey\'s formula for natural & enhanced physique prediction',
        descriptionAr: 'صيغة Casey للتنبؤ بالبدن الطبيعي والمطور',
        icon: 'Dna',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Premium Resources (الموارد الحصرية)
// ─────────────────────────────────────────────────────────────────────────────

export const PREMIUM_RESOURCES: MenuItem[] = [
    {
        label: 'Transformation Timeline',
        labelAr: 'الجدول الزمني للتحول',
        href: '/timeline',
        page: Page.TIMELINE,
        description: 'Live body transformation projection engine with weekly phases',
        descriptionAr: 'محرك التنبؤ بتحول الجسم مع مراحل أسبوعية',
        icon: 'Trophy',
    },
    {
        label: 'Cycle Architect',
        labelAr: 'مهندس الدورة',
        href: '/cycle',
        page: Page.CYCLE_ARCHITECT,
        description: 'Design & export your steroid cycle with PCT calculator',
        descriptionAr: 'صمم دورتك مع حاسبة PCT',
        icon: 'CalendarCheck',
    },
    {
        label: 'Cycle Schedule Sync',
        labelAr: 'مزامنة جدول الكورس',
        href: '/cycle',
        page: Page.CYCLE_ARCHITECT,
        description: 'Sync your cycle schedule across devices',
        descriptionAr: 'مزامنة جدول كورسك عبر الأجهزة',
        icon: 'CalendarCheck',
    },
    {
        label: 'Smart Lab Reference',
        labelAr: 'المرجع الذكي للتحاليل',
        href: '/lab',
        page: Page.LAB,
        description: 'Comprehensive lab test reference & AI analysis',
        descriptionAr: 'مرجع التحاليل الشامل مع تحليل ذكي',
        icon: 'Activity',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Dropdown Configurations
// ─────────────────────────────────────────────────────────────────────────────

export const DROPDOWN_CONFIGS: DropdownConfig[] = [
    {
        key: 'smarttools',
        label: 'Smart Tools',
        labelAr: 'أدوات ذكية',
        items: SMART_TOOLS,
    },
    {
        key: 'premium',
        label: 'Exclusive Resources',
        labelAr: 'موارد حصرية',
        items: PREMIUM_RESOURCES,
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Get items by dropdown key
// ─────────────────────────────────────────────────────────────────────────────

export function getDropdownItems(key: string, language: 'ar' | 'en' = 'en'): MenuItem[] {
    const config = DROPDOWN_CONFIGS.find((c) => c.key === key);
    if (!config) return [];
    return config.items.map((item) => ({
        ...item,
        label: language === 'ar' ? item.labelAr : item.label,
        description: language === 'ar' ? item.descriptionAr : item.description,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Get all tool links for Smart Tools page
// ─────────────────────────────────────────────────────────────────────────────

export function getAllToolLinks(language: 'ar' | 'en' = 'en'): MenuItem[] {
    return SMART_TOOLS.map((item) => ({
        ...item,
        label: language === 'ar' ? item.labelAr : item.label,
        description: language === 'ar' ? item.descriptionAr : item.description,
    }));
}
