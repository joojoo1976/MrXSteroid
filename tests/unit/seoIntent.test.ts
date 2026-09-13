/**
 * tests/unit/seoIntent.test.ts
 *
 * Unit tests for the SEO Intent Classification Engine (server/seo/intentClassifier.ts).
 * Tests all 7 search intents across English and Arabic corpora:
 * - transactional
 * - comparison
 * - question
 * - commercial
 * - navigational
 * - informational
 * - unknown
 */

import { describe, it, expect } from 'vitest';
import { classifyIntent, classifySearchIntent } from '../../server/seo/intentClassifier';

describe('SEO Intent Classification Engine (server/seo/intentClassifier.ts)', () => {

    describe('1. Transactional Intent', () => {
        it('classifies English purchase and checkout queries as transactional', () => {
            const queries = [
                'buy bodybuilding protocol',
                'order steroid cycle guide',
                'purchase complete transformation guide',
                'mrxsteroid subscription cost',
                'discount coupon for cycle architect',
                'where to buy verified protocols',
            ];

            for (const q of queries) {
                expect(classifyIntent(q, 'en'), `Failed for query: "${q}"`).toBe('transactional');
            }
        });

        it('classifies Arabic purchase and payment queries as transactional', () => {
            const queries = [
                'شراء كتاب مستر اكس ستيرويد',
                'سعر بروتوكول التنشيف الاحترافي',
                'طرق الدفع والاشتراك في الموقع',
                'كوبون خصم خطة كمال الأجسام',
                'تحميل بروتوكول الضخامة',
                'طلب برنامج تدريب وهرمونات',
            ];

            for (const q of queries) {
                expect(classifyIntent(q, 'ar'), `Failed for query: "${q}"`).toBe('transactional');
            }
        });
    });

    describe('2. Comparison Intent', () => {
        it('classifies English head-to-head comparison queries as comparison', () => {
            const queries = [
                'testosterone enanthate vs cypionate',
                'anavar compared to winstrol',
                'dianabol or anadrol which is better',
                'arimidex alternative to aromasin',
                'difference between primo and masteron',
            ];

            for (const q of queries) {
                expect(classifyIntent(q, 'en'), `Failed for query: "${q}"`).toBe('comparison');
            }
        });

        it('classifies Arabic comparison queries as comparison', () => {
            const queries = [
                'الفرق بين التيستوستيرون انانثات وسيبونات',
                'مقارنة بين الانافار والوينسترول',
                'ايهما افضل بريموبولان ام ماستيرون',
                'بديل الاريميدكس في الحماية',
            ];

            for (const q of queries) {
                expect(classifyIntent(q, 'ar'), `Failed for query: "${q}"`).toBe('comparison');
            }
        });
    });

    describe('3. Question Intent', () => {
        it('classifies English interrogative queries as question', () => {
            const queries = [
                'how to calculate steroid half-life',
                'what is the best pct protocol',
                'why does gynecomastia occur during a cycle',
                'when to start hcg during a blast',
                'can i take clomid and nolvadex together?',
                'how long does trenbolone stay in your system',
            ];

            for (const q of queries) {
                expect(classifyIntent(q, 'en'), `Failed for query: "${q}"`).toBe('question');
            }
        });

        it('classifies Arabic interrogative queries as question', () => {
            const queries = [
                'كيف تحسب عمر النصف للهرمون',
                'ما هو افضل بروتوكول لتنظيف الكبد',
                'متى يبدأ عمل التستوستيرون سوسبانشن',
                'لماذا يرتفع هرمون الاستروجين في الكورس',
                'هل يمكن الجمع بين الكلوميد والنولفادكس؟',
                'كيفية استخدام حاسبة السعرات الحرارية',
            ];

            for (const q of queries) {
                expect(classifyIntent(q, 'ar'), `Failed for query: "${q}"`).toBe('question');
            }
        });
    });

    describe('4. Commercial Intent', () => {
        it('classifies English evaluation and review queries as commercial', () => {
            const queries = [
                'best beginner steroid cycle',
                'top cutting stack for men',
                'mr x steroid book review',
                'recommended liver support supplements',
                'effective bulking program for natural lifters',
            ];

            for (const q of queries) {
                expect(classifyIntent(q, 'en'), `Failed for query: "${q}"`).toBe('commercial');
            }
        });

        it('classifies Arabic review and recommendation queries as commercial', () => {
            const queries = [
                'افضل كورس تنشيف اول للمبتدئين',
                'تقييم كتاب مستر اكس ستيرويد',
                'مراجعة بروتوكول حماية القلب والشرايين',
                'احسن برنامج تدريب كمال اجسام',
                'تجارب كورس التيستوستيرون فقط',
            ];

            for (const q of queries) {
                expect(classifyIntent(q, 'ar'), `Failed for query: "${q}"`).toBe('commercial');
            }
        });
    });

    describe('5. Navigational Intent', () => {
        it('classifies English navigational and brand queries as navigational', () => {
            const queries = [
                'mr x steroid login',
                'mrxsteroid member profile',
                'mr x customer support',
                'mrx steroid dashboard',
            ];

            for (const q of queries) {
                expect(classifyIntent(q, 'en'), `Failed for query: "${q}"`).toBe('navigational');
            }
        });

        it('classifies Arabic navigational queries as navigational', () => {
            const queries = [
                'مستر اكس تسجيل الدخول',
                'مستر إكس خدمة العملاء والدعم',
                'حسابي مستر اكس',
            ];

            for (const q of queries) {
                expect(classifyIntent(q, 'ar'), `Failed for query: "${q}"`).toBe('navigational');
            }
        });
    });

    describe('6. Informational Intent', () => {
        it('classifies English educational and calculator queries as informational', () => {
            const queries = [
                'macro calculator for bodybuilders',
                'steroid half life chart',
                'blood work reference ranges',
                'bodybuilder liver enzyme levels',
                'mechanism of aromatization in muscle tissue',
            ];

            for (const q of queries) {
                expect(classifyIntent(q, 'en'), `Failed for query: "${q}"`).toBe('informational');
            }
        });

        it('classifies Arabic calculator and health reference queries as informational', () => {
            const queries = [
                'حاسبة الماكروز والبروتين',
                'تحليل انزيمات الكبد للاعبي كمال الاجسام',
                'اعراض ارتفاع هرمون البرولاكتين',
                'عمر النصف للهرمونات الستيرويدية',
            ];

            for (const q of queries) {
                expect(classifyIntent(q, 'ar'), `Failed for query: "${q}"`).toBe('informational');
            }
        });
    });

    describe('7. Unknown & Edge Cases', () => {
        it('classifies completely ambiguous, random, or single-character terms as unknown', () => {
            const ambiguousTerms = ['x', '   ', ''];
            for (const t of ambiguousTerms) {
                expect(classifyIntent(t, 'en')).toBe('unknown');
            }
        });

        it('normalizes keyword before classification', () => {
            const unnormalized = '   أفْضَلْ كُورْسْ تَضْخِيمْ   ';
            expect(classifySearchIntent(unnormalized, 'ar')).toBe('commercial');
        });
    });
});
