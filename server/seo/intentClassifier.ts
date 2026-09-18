/**
 * server/seo/intentClassifier.ts
 * Search Intent & YMYL Classification Engine for English and Arabic (v3.0).
 * Supports primary & secondary intent detection plus YMYL / Medical Risk assessment.
 */

import { SearchIntent, SeoLanguage } from './types';
import { normalizeKeyword } from './normalization';

interface IntentRule {
    intent: SearchIntent;
    patternsEn: RegExp[];
    patternsAr: RegExp[];
    confidence: number;
}

const INTENT_RULES: IntentRule[] = [
    // 1. Transactional (High purchase intent)
    {
        intent: 'transactional',
        patternsEn: [
            /\b(buy|order|purchase|checkout|pricing|price|cost|discount|coupon|download|subscribe|subscription)\b/i,
            /\b(where to buy|how to buy|get access)\b/i,
        ],
        patternsAr: [
            /(?:^|\s)(شراء|سعر|اسعار|طلب|شحن|اشتراك|كوبون|خصم|تحميل|دفع|حجز|طرق الدفع)(?:$|\s)/,
            /(?:^|\s)(من اين اشتري|كيفية شراء|الحصول علي)(?:$|\s)/,
        ],
        confidence: 0.95,
    },

    // 2. Comparison (Head-to-head evaluation)
    {
        intent: 'comparison',
        patternsEn: [
            /\b(vs|versus|compared to|comparison|difference between|or|which is better)\b/i,
            /\b(better than|alternative to|substitute for)\b/i,
        ],
        patternsAr: [
            /(?:^|\s)(الفرق بين|مقارنة|مقارنه|ام|او|ايهما افضل|بديل|مقارنته)(?:$|\s)/,
            /(?:^|\s)(افضل من|احسن من)(?:$|\s)/,
        ],
        confidence: 0.92,
    },

    // 3. Question (Direct informational queries)
    {
        intent: 'question',
        patternsEn: [
            /^(how|what|why|when|where|which|who|can i|should i|is it|does|will|how to|how many|how long)\b/i,
            /\?$/,
        ],
        patternsAr: [
            /(?:^|\s)(كيف|ما هو|ما هي|ماذا|متى|لماذا|أين|اين|هل|كم|طريقة|طريقه|كيفية|كيفيه|هل يمكن|هل استطيع)(?:$|\s)/,
            /؟$/,
        ],
        confidence: 0.90,
    },

    // 4. Commercial (Evaluation, reviews, best lists)
    {
        intent: 'commercial',
        patternsEn: [
            /\b(best|top|review|reviews|rating|recommended|effective|guide|protocol|stack|coaching|program)\b/i,
            /\b(for sale|worth it|legit|scam|counterfeit)\b/i,
        ],
        patternsAr: [
            /(?:^|\s)(أفضل|افضل|احسن|تقييم|ريفيو|مراجعة|مراجعه|كورس|برنامج|خطة|خطه|بروتوكول|كتاب|ترشيحات|اقوي|اقوى)(?:$|\s)/,
            /(?:^|\s)(مضمون|اصلي|مغشوش|تجارب|نتائج)(?:$|\s)/,
        ],
        confidence: 0.88,
    },

    // 5. Navigational (Brand / specific site sections)
    {
        intent: 'navigational',
        patternsEn: [
            /\b(mr x|mrx|login|signin|dashboard|profile|contact|support|terms|privacy|refund|about)\b/i,
        ],
        patternsAr: [
            /(?:^|\s)(مستر اكس|مستر إكس|تسجيل الدخول|حسابي|الملف الشخصي|تواصل|الدعم|خدمة العملاء|من نحن)(?:$|\s)/,
        ],
        confidence: 0.90,
    },

    // 6. Informational (Educational, scientific, calculation & interactive tool terms)
    {
        intent: 'informational',
        patternsEn: [
            /\b(calculator|calc|half life|dosage|dose|ranges|levels|symptoms|side effects|mechanism|causes|tips|science|blood work|cycle|simulator|plotter|estimator|converter|tracker)\b/i,
        ],
        patternsAr: [
            /(?:^|\s)(حاسبة|حاسبه|حساب|عمر النصف|جرعات|جرعة|جرعه|تحليل|تحاليل|نسبة|نسبه|اعراض|آثار جانبية|اثاره|فوائد|اضرار|معدل|علم|محاكي|مخطط)(?:$|\s)/,
        ],
        confidence: 0.85,
    },
];

/**
 * Classify the search intent of a given keyword.
 * Preserves exact backward-compatible signature.
 */
export function classifySearchIntent(raw: string, language: SeoLanguage): SearchIntent {
    if (!raw || raw.trim().length < 2) return 'unknown';

    const normalized = normalizeKeyword(raw, language);

    for (const rule of INTENT_RULES) {
        const patterns = language === 'ar' ? rule.patternsAr : rule.patternsEn;
        for (const pattern of patterns) {
            if (pattern.test(normalized) || pattern.test(raw)) {
                return rule.intent;
            }
        }
    }

    const wordCount = normalized.split(/\s+/).length;
    if (wordCount >= 2) {
        return 'informational';
    }

    return 'unknown';
}

export const classifyIntent = classifySearchIntent;

/**
 * Classifies medical/YMYL risk for human-in-the-loop review.
 * Flags keywords that mention high-potency androgens, injection techniques, or cardiovascular/liver risks.
 */
export function classifyYmylRisk(raw: string, language: SeoLanguage): {
    isYmyl: boolean;
    medicalRiskLevel: 'low' | 'medium' | 'high';
    requiresReview: boolean;
} {
    const lower = raw.toLowerCase();
    const normalized = normalizeKeyword(raw, language);

    // High risk: Trenbolone, Halotestin, Clenbuterol high doses, extreme toxicity, injection protocol
    const highRiskTerms = [
        'tren', 'trenbolone', 'halotestin', 'dnp', 'insulin', 'clenbuterol', 'injection',
        'ترينبولون', 'ترين', 'انسولين', 'كلين بترول', 'حقن', 'ابرة', 'إبرة', 'تسمم'
    ];

    for (const t of highRiskTerms) {
        if (lower.includes(t) || normalized.includes(t)) {
            return {
                isYmyl: true,
                medicalRiskLevel: 'high',
                requiresReview: true,
            };
        }
    }

    // Medium risk: general steroids, PCT, liver support, blood work
    const mediumRiskTerms = [
        'testosterone', 'anavar', 'deca', 'pct', 'clomid', 'nolvadex', 'tudca', 'liver', 'blood',
        'تستوستيرون', 'تيست', 'انافار', 'ديكا', 'تنظيف', 'كلوميد', 'نولفادكس', 'كبد', 'تحليل'
    ];

    for (const t of mediumRiskTerms) {
        if (lower.includes(t) || normalized.includes(t)) {
            return {
                isYmyl: true,
                medicalRiskLevel: 'medium',
                requiresReview: false, // medium risk can be published under standard review
            };
        }
    }

    return {
        isYmyl: false,
        medicalRiskLevel: 'low',
        requiresReview: false,
    };
}
