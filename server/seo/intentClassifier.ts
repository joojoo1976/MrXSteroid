/**
 * server/seo/intentClassifier.ts
 * Search Intent Classification Engine for English and Arabic.
 * Supported Intents: informational, commercial, transactional, navigational, comparison, question, unknown.
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
            /\؟$/,
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

    // 6. Informational (Educational, scientific, calculation)
    {
        intent: 'informational',
        patternsEn: [
            /\b(calculator|calc|half life|dosage|dose|ranges|levels|symptoms|side effects|mechanism|causes|tips|science|blood work|cycle)\b/i,
        ],
        patternsAr: [
            /(?:^|\s)(حاسبة|حاسبه|حساب|عمر النصف|جرعات|جرعة|جرعه|تحليل|تحاليل|نسبة|نسبه|اعراض|آثار جانبية|اثاره|فوائد|اضرار|معدل|علم)(?:$|\s)/,
        ],
        confidence: 0.85,
    },
];

/**
 * Classify the search intent of a given keyword.
 * Returns one of the 7 official intents:
 * 'informational' | 'commercial' | 'transactional' | 'navigational' | 'comparison' | 'question' | 'unknown'
 */
export function classifySearchIntent(raw: string, language: SeoLanguage): SearchIntent {
    if (!raw || raw.trim().length < 2) return 'unknown';

    const normalized = normalizeKeyword(raw, language);

    // Evaluate rules in prioritized order:
    // Transactional > Comparison > Question > Commercial > Navigational > Informational
    for (const rule of INTENT_RULES) {
        const patterns = language === 'ar' ? rule.patternsAr : rule.patternsEn;
        for (const pattern of patterns) {
            if (pattern.test(normalized) || pattern.test(raw)) {
                return rule.intent;
            }
        }
    }

    // Default fallback: if it contains 3 or more words, it's typically informational; otherwise unknown
    const wordCount = normalized.split(/\s+/).length;
    if (wordCount >= 2) {
        return 'informational';
    }

    return 'unknown';
}
