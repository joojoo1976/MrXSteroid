/**
 * H4 verification — indexability of private/transactional surfaces.
 *
 * Owner-approved decision table (P1 → H4):
 *  - Disallow (crawl-blocked): /api/, /admin, /admin-analytics,
 *    /auth/callback, /payment-diagnostic.
 *  - noindex ONLY (stay crawlable so Google can see the noindex meta):
 *    /login, /signup, /reset-password, /checkout, /success, /cancel,
 *    /payment-pending, /claim-order, /dashboard, /profile, /diagnostic.
 *  - Removed from the sitemap: /login, /signup, /reset-password, /diagnostic.
 *  - /evaluate-risk: NO indexing change — stays indexable until internal
 *    linking/content review.
 *
 * The noindex signal is emitted by server-side layout files (the established
 * in-repo pattern — app/profile/affiliate/layout.tsx), because every one of
 * these pages is a client component that cannot export metadata itself.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const robots = readFileSync(resolve(process.cwd(), 'public/robots.txt'), 'utf8');
const sitemap = readFileSync(resolve(process.cwd(), 'public/sitemap.xml'), 'utf8');

const disallowed = robots
    .split(/\r?\n/)
    .filter((l) => l.startsWith('Disallow:'))
    .map((l) => l.replace('Disallow:', '').trim());

const NOINDEX_ONLY_ROUTES = [
    'app/login', 'app/signup', 'app/reset-password', 'app/checkout',
    'app/success', 'app/cancel', 'app/payment-pending', 'app/claim-order',
    'app/dashboard', 'app/profile', 'app/diagnostic',
];

const DISALLOW_ROUTES = ['app/admin', 'app/admin-analytics', 'app/auth/callback', 'app/payment-diagnostic'];

describe('robots.txt — H4 crawl rules', () => {
    it('disallows exactly the admin/auth/diagnostic/API surfaces', () => {
        for (const path of ['/api/', '/admin', '/admin-analytics', '/auth/callback', '/payment-diagnostic']) {
            expect(disallowed).toContain(path);
        }
    });

    it('never Disallows the noindex-only pages (Google must see their noindex)', () => {
        for (const path of [
            '/login', '/signup', '/reset-password', '/checkout', '/success',
            '/cancel', '/payment-pending', '/claim-order', '/dashboard',
            '/profile', '/diagnostic',
        ]) {
            expect(disallowed).not.toContain(path);
        }
    });

    it('keeps the Sitemap line with the apex host', () => {
        expect(robots).toMatch(/Sitemap:\s*https:\/\/mrxsteroid\.com\/sitemap\.xml/);
    });
});

describe('sitemap.xml — H4 removals', () => {
    it('no longer promotes the noindexed auth/diagnostic pages', () => {
        const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
        for (const removed of ['https://mrxsteroid.com/login', 'https://mrxsteroid.com/signup', 'https://mrxsteroid.com/reset-password', 'https://mrxsteroid.com/diagnostic']) {
            expect(locs).not.toContain(removed);
        }
    });

    it('never lists checkout/admin/private URLs', () => {
        const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
        for (const forbidden of ['/checkout', '/admin', '/dashboard', '/profile', '/payment-', '/claim-order', '/success', '/cancel', '/api/']) {
            expect(locs.some((l) => l.includes(forbidden))).toBe(false);
        }
    });
});

describe('server layouts — H4 noindex signal', () => {
    it('every noindex-only route has a server layout emitting noindex', () => {
        for (const route of NOINDEX_ONLY_ROUTES) {
            const layoutPath = resolve(process.cwd(), route, 'layout.tsx');
            expect(existsSync(layoutPath)).toBe(true);
            const src = readFileSync(layoutPath, 'utf8');
            expect(src).toContain('robots: { index: false, follow: false }');
        }
    });

    it('every Disallow route also carries the noindex layout', () => {
        for (const route of DISALLOW_ROUTES) {
            const layoutPath = resolve(process.cwd(), route, 'layout.tsx');
            expect(existsSync(layoutPath)).toBe(true);
            const src = readFileSync(layoutPath, 'utf8');
            expect(src).toContain('robots: { index: false, follow: false }');
        }
    });

    it('/evaluate-risk stays indexable (no noindex layout added)', () => {
        expect(existsSync(resolve(process.cwd(), 'app/evaluate-risk', 'layout.tsx'))).toBe(false);
    });
});
