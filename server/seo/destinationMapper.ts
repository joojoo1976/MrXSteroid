/**
 * server/seo/destinationMapper.ts
 * Strict Destination Mapping & 404 Prevention Engine.
 * Ensures every single active keyword maps to a real, verified, functioning site route.
 */

import { DestinationType, SearchIntent } from './types';

export const VERIFIED_SITE_DESTINATIONS: Record<string, { type: DestinationType; titleEn: string; titleAr: string }> = {
    '/macro': { type: 'tool', titleEn: 'Macro Calculator', titleAr: 'حاسبة الماكروز' },
    '/bodyfat': { type: 'tool', titleEn: 'Body Fat Calculator', titleAr: 'حاسبة نسبة الدهون' },
    '/halflife': { type: 'tool', titleEn: 'Steroid Half-Life Simulator', titleAr: 'محاكي عمر النصف' },
    '/injection': { type: 'tool', titleEn: 'Intramuscular Injection Guide', titleAr: 'دليل الحقن العضلي' },
    '/lab': { type: 'tool', titleEn: 'Bodybuilder Blood Work Reference', titleAr: 'مرجع تحاليل المختبر' },
    '/genetic': { type: 'tool', titleEn: 'Genetic Potential & FFMI', titleAr: 'الحد الجيني و FFMI' },
    '/cycle': { type: 'tool', titleEn: 'Cycle Architect Pro', titleAr: 'مهندس السايكل' },
    '/smarttools': { type: 'tool', titleEn: 'All Smart Tools', titleAr: 'جميع الأدوات الذكية' },
    '/TransformationTimeline': { type: 'tool', titleEn: 'Physique Transformation Timeline', titleAr: 'الخط الزمني للتحول' },
    '/': { type: 'page', titleEn: 'Mr. X Steroid Home', titleAr: 'الرئيسية مستر إكس ستيرويد' },
    '/checkout': { type: 'page', titleEn: 'Complete Protocol Checkout', titleAr: 'حجز وشراء البروتوكول' },
    '/faq': { type: 'page', titleEn: 'Frequently Asked Questions', titleAr: 'الأسئلة الشائعة' },
    '/blog': { type: 'article', titleEn: 'Scientific Articles & Guides', titleAr: 'المقالات والأدلة العلمية' },
    '/about': { type: 'page', titleEn: 'About Mr. X Steroid', titleAr: 'عن مستر إكس ستيرويد' },
    '/support': { type: 'page', titleEn: 'VIP Support & Community', titleAr: 'الدعم الفني والمجتمع' },
    '/profile/affiliate': { type: 'page', titleEn: 'Affiliate Program', titleAr: 'برنامج التسويق بالعمولة' },
};

/**
 * Check if a path is verified and exists within the site structure.
 */
export function isValidDestination(path: string): boolean {
    if (!path) return false;
    const cleanPath = path.split('?')[0];
    return Boolean(VERIFIED_SITE_DESTINATIONS[cleanPath]);
}

/**
 * Resolve the optimal destination path for a keyword based on its cluster, intent, and terms.
 * Guarantees a verified route (never returns an unverified path or 404).
 */
export function resolveDestination(
    keyword: string,
    cluster: string,
    intent: SearchIntent
): { path: string; type: DestinationType } {
    const lower = keyword.toLowerCase();

    // 1. Transactional intent -> Checkout
    if (intent === 'transactional' || lower.includes('buy') || lower.includes('شراء') || lower.includes('سعر') || lower.includes('تحميل')) {
        return { path: '/checkout', type: 'page' };
    }

    // 2. Specific Tool keyword matches
    if (lower.includes('macro') || lower.includes('calorie') || lower.includes('ماكرو') || lower.includes('سعرات') || lower.includes('tdee') || lower.includes('bmr')) {
        return { path: '/macro', type: 'tool' };
    }

    if (lower.includes('body fat') || lower.includes('fat percentage') || lower.includes('دهون') || lower.includes('تنشيف')) {
        return { path: '/bodyfat', type: 'tool' };
    }

    if (lower.includes('half-life') || lower.includes('half life') || lower.includes('ester') || lower.includes('عمر النصف') || lower.includes('سوستانون') || lower.includes('انانثات')) {
        return { path: '/halflife', type: 'tool' };
    }

    if (lower.includes('injection') || lower.includes('needle') || lower.includes('glute') || lower.includes('حقن') || lower.includes('ابرة') || lower.includes('إبرة')) {
        return { path: '/injection', type: 'tool' };
    }

    if (lower.includes('blood') || lower.includes('lab') || lower.includes('testosterone level') || lower.includes('تحليل') || lower.includes('كبد') || lower.includes('ضغط')) {
        return { path: '/lab', type: 'tool' };
    }

    if (lower.includes('genetic') || lower.includes('ffmi') || lower.includes('potential') || lower.includes('جينات')) {
        return { path: '/genetic', type: 'tool' };
    }

    if (lower.includes('cycle') || lower.includes('stack') || lower.includes('سايكل') || lower.includes('كورس')) {
        return { path: '/cycle', type: 'tool' };
    }

    if (lower.includes('timeline') || lower.includes('transformation') || lower.includes('تحول') || lower.includes('زمني')) {
        return { path: '/TransformationTimeline', type: 'tool' };
    }

    // 3. Questions -> FAQ
    if (intent === 'question' || lower.startsWith('how') || lower.startsWith('what') || lower.startsWith('كيف') || lower.startsWith('هل')) {
        return { path: '/faq', type: 'page' };
    }

    // 4. Cluster mappings
    if (cluster === 'pct-recovery' || cluster === 'hormone-safety') {
        return { path: '/blog', type: 'article' };
    }

    if (cluster === 'supplements-nutrition') {
        return { path: '/macro', type: 'tool' };
    }

    // 5. Default safe fallback
    return { path: '/faq', type: 'page' };
}
