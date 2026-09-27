/**
 * P1 regression — the www and apex hosts must not both serve 200.
 *
 * Defect (QA 2026-09-25): https://www.mrxsteroid.com/ and
 * https://mrxsteroid.com/ both answered 200 with identical content, and neither
 * response carried a <link rel="canonical">. Every page was therefore available
 * under two URLs, which splits link equity and lets search engines pick either.
 *
 * public/robots.txt and public/sitemap.xml already declare the APEX
 * (non-www) host as canonical, so the apex is the intended canonical host and
 * www must 308-redirect onto it.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const vercel = JSON.parse(
    readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')
) as {
    redirects?: Array<{
        source: string;
        has?: Array<{ type: string; value: string | string[] }>;
        destination: string;
        permanent?: boolean;
    }>;
    headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
};

const robots = readFileSync(resolve(process.cwd(), 'public/robots.txt'), 'utf8');
const sitemap = readFileSync(resolve(process.cwd(), 'public/sitemap.xml'), 'utf8');

const wwwRedirect = (vercel.redirects ?? []).find(r =>
    r.has?.some(h => h.type === 'host' && h.value === 'www.mrxsteroid.com')
);

describe('canonical host configuration', () => {
    it('declares the apex host as the canonical host in robots.txt', () => {
        expect(robots).toMatch(/Sitemap:\s*https:\/\/mrxsteroid\.com\/sitemap\.xml/);
        expect(robots).not.toMatch(/www\.mrxsteroid\.com/);
    });

    it('uses only apex URLs in the sitemap', () => {
        const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
        expect(locs.length).toBeGreaterThan(0);
        for (const loc of locs) {
            expect(loc.startsWith('https://mrxsteroid.com')).toBe(true);
            expect(loc).not.toContain('www.');
        }
    });

    it('has a host-based redirect for www.mrxsteroid.com', () => {
        expect(wwwRedirect).toBeDefined();
    });

    it('redirects www to the apex host over https', () => {
        expect(wwwRedirect?.destination).toBe('https://mrxsteroid.com/:path*');
    });

    it('makes the www redirect permanent so the canonical host sticks', () => {
        expect(wwwRedirect?.permanent).toBe(true);
    });

    it('preserves the path when redirecting www', () => {
        expect(wwwRedirect?.source).toBe('/:path*');
    });

    it('does not redirect the apex host onto itself (no redirect loop)', () => {
        const apex = (vercel.redirects ?? []).filter(r =>
            r.has?.some(h => h.type === 'host' && h.value === 'mrxsteroid.com')
        );
        expect(apex).toHaveLength(0);
    });
});
