/**
 * tests/unit/seoDestination.test.ts
 *
 * Unit tests for Destination Mapping & 404 Prevention Engine (server/seo/destinationMapper.ts).
 * Tests:
 * - isValidDestination validation against verified internal routes
 * - Query string stripping in destination validation
 * - Rejection of unverified / external / non-existent paths
 * - resolveDestination logic for specific tool keywords (macro, bodyfat, halflife, injection, lab, genetic, cycle, timeline)
 * - Fallback safety to prevent broken links
 */

import { describe, it, expect } from 'vitest';
import {
    VERIFIED_SITE_DESTINATIONS,
    isValidDestination,
    resolveDestination,
} from '../../server/seo/destinationMapper';
import { pathToPage } from '../../lib/legacy-routes';

describe('SEO Destination Mapper & 404 Prevention (server/seo/destinationMapper.ts)', () => {

    describe('1. isValidDestination', () => {
        it('validates all registered site routes', () => {
            const routes = [
                '/',
                '/macro',
                '/bodyfat',
                '/halflife',
                '/injection',
                '/lab',
                '/genetic',
                '/cycle',
                '/smarttools',
                '/TransformationTimeline',
                '/checkout',
                '/faq',
                '/blog',
                '/about',
                '/support',
                '/profile/affiliate',
            ];

            for (const r of routes) {
                expect(isValidDestination(r), `Route "${r}" should be valid`).toBe(true);
            }
        });

        it('ignores query parameters when checking validity', () => {
            expect(isValidDestination('/faq?q=pct')).toBe(true);
            expect(isValidDestination('/macro?unit=metric')).toBe(true);
            expect(isValidDestination('/blog?tag=cutting')).toBe(true);
        });

        it('rejects unverified, external, or malformed paths', () => {
            const invalidPaths = [
                '/non-existent-page',
                'https://evil.com/phishing',
                'javascript:alert(1)',
                '/admin/secret-door',
                '',
                'undefined',
            ];

            for (const p of invalidPaths) {
                expect(isValidDestination(p), `Path "${p}" should be invalid`).toBe(false);
            }
        });
    });

    describe('2. resolveDestination Keyword Matching', () => {
        it('routes transactional queries to /checkout', () => {
            expect(resolveDestination('buy cutting cycle guide', 'cutting', 'transactional').path).toBe('/checkout');
            expect(resolveDestination('شراء كتاب مستر اكس', 'general', 'transactional').path).toBe('/checkout');
            expect(resolveDestination('سعر الاشتراك السنوي', 'general', 'commercial').path).toBe('/checkout');
        });

        it('routes macro/nutrition queries to /macro tool', () => {
            expect(resolveDestination('macro calculator for bodybuilders', 'smart-tools', 'informational').path).toBe('/macro');
            expect(resolveDestination('حاسبة السعرات الحرارية والبروتين', 'smart-tools', 'informational').path).toBe('/macro');
        });

        it('routes body fat queries to /bodyfat tool', () => {
            expect(resolveDestination('body fat percentage calculator', 'smart-tools', 'informational').path).toBe('/bodyfat');
            expect(resolveDestination('حساب نسبة الدهون بالمتر', 'smart-tools', 'informational').path).toBe('/bodyfat');
        });

        it('routes steroid half-life queries to /halflife simulator', () => {
            expect(resolveDestination('testosterone half-life simulator', 'smart-tools', 'informational').path).toBe('/halflife');
            expect(resolveDestination('عمر النصف لسوستانون 250', 'smart-tools', 'informational').path).toBe('/halflife');
        });

        it('routes injection queries to /injection guide', () => {
            expect(resolveDestination('glute injection sites guide', 'smart-tools', 'informational').path).toBe('/injection');
            expect(resolveDestination('طريقة حقن التيستوستيرون في العضل', 'smart-tools', 'informational').path).toBe('/injection');
        });

        it('routes blood work queries to /lab reference', () => {
            expect(resolveDestination('liver enzymes blood test ranges', 'smart-tools', 'informational').path).toBe('/lab');
            expect(resolveDestination('تحليل الهرمونات وانزيمات الكبد', 'smart-tools', 'informational').path).toBe('/lab');
        });

        it('routes genetic and FFMI queries to /genetic tool', () => {
            expect(resolveDestination('genetic muscle potential ffmi', 'smart-tools', 'informational').path).toBe('/genetic');
            expect(resolveDestination('حساب الحد الجيني للعضلات', 'smart-tools', 'informational').path).toBe('/genetic');
        });

        it('routes cycle planner queries to /cycle architect', () => {
            expect(resolveDestination('bodybuilding cycle stack designer', 'smart-tools', 'informational').path).toBe('/cycle');
            expect(resolveDestination('مهندس السايكل وتصميم الكورس', 'smart-tools', 'informational').path).toBe('/cycle');
        });

        it('routes transformation timeline queries to /TransformationTimeline', () => {
            expect(resolveDestination('steroid transformation timeline weeks', 'smart-tools', 'informational').path).toBe('/TransformationTimeline');
            expect(resolveDestination('الخط الزمني لنتائج الكورس اسبوع باسبوع', 'smart-tools', 'informational').path).toBe('/TransformationTimeline');
        });

        it('routes general questions to /faq', () => {
            expect(resolveDestination('how does anavar work', 'anabolic-steroids', 'question').path).toBe('/faq');
            expect(resolveDestination('هل الديانابول يسبب تساقط الشعر', 'anabolic-steroids', 'question').path).toBe('/faq');
        });

        it('routes health and safety clusters to /blog', () => {
            expect(resolveDestination('post cycle therapy guide', 'pct-recovery', 'informational').path).toBe('/blog');
            expect(resolveDestination('cardiovascular protection', 'hormone-safety', 'informational').path).toBe('/blog');
        });
    });

    describe('3. Consistency with Client pathToPage Router', () => {
        it('ensures every verified destination path maps to a valid Page enum without null', () => {
            for (const path of Object.keys(VERIFIED_SITE_DESTINATIONS)) {
                const page = pathToPage(path);
                expect(page, `Path "${path}" failed to resolve to a Page enum`).not.toBeNull();
            }
        });
    });
});
