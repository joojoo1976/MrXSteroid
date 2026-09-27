/**
 * P1 regression — /api/seo/report must be admin-only.
 *
 * Defect (QA 2026-09-25): GET /api/seo/report returned 200 to an anonymous
 * request and shipped the entire SEO intelligence payload — 234 keywords with
 * clusters, intent, destination paths and scores, plus weekly snapshots,
 * competitor counts, seasonal events and cannibalization alerts.
 *
 * That is internal competitive research (which keywords you rank for, which
 * pages you are cannibalising, how many competitors you track). It was readable
 * by anyone on the internet, and at ~2.4s per response it was also an
 * unauthenticated amplification vector.
 *
 * Every other /api/admin/seo/* reader already goes through `requireAdmin`.
 * This suite proves /api/seo/report now behaves identically, and that the
 * rejection happens BEFORE any database work.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const requireAdmin = vi.fn();
const getSupabaseAdmin = vi.fn();

vi.mock('../../server/auth/require-admin', () => ({
    requireAdmin: (req: unknown) => requireAdmin(req),
}));

vi.mock('../../server/seo/seoService', () => ({
    getSupabaseAdmin: () => getSupabaseAdmin(),
    getIsoWeek: () => ({ year: 2026, weekNumber: 39 }),
}));

vi.mock('../../server/seo/baselineKeywords', () => ({
    getBaselineKeywords: () => [],
}));

const deny = (status: number) => ({
    authorized: false,
    response: new Response(JSON.stringify({ error: 'nope' }), {
        status,
        headers: { 'content-type': 'application/json' },
    }),
});

async function callReport() {
    const { GET } = await import('../../app/api/seo/report/route');
    return (await GET(
        new NextRequest('http://localhost:3000/api/seo/report?lang=all')
    )) as unknown as Response;
}

beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseAdmin.mockReturnValue(undefined);
});

describe('/api/seo/report authorization', () => {
    it('rejects an anonymous request with 401', async () => {
        requireAdmin.mockResolvedValue(deny(401));
        const res = await callReport();
        expect(res.status).toBe(401);
    });

    it('rejects an authenticated non-admin with 403', async () => {
        requireAdmin.mockResolvedValue(deny(403));
        const res = await callReport();
        expect(res.status).toBe(403);
    });

    it('never reaches the database when authorization fails', async () => {
        requireAdmin.mockResolvedValue(deny(401));
        await callReport();
        expect(getSupabaseAdmin).not.toHaveBeenCalled();
    });

    it('does not leak SEO intelligence in the rejection body', async () => {
        requireAdmin.mockResolvedValue(deny(401));
        const res = await callReport();
        const raw = (await res.text()).toLowerCase();
        for (const leak of ['keyword', 'cluster', 'competitor', 'cannibal', 'snapshot', 'destination_path']) {
            expect(raw).not.toContain(leak);
        }
    });

    it('calls the admin guard exactly once per request', async () => {
        requireAdmin.mockResolvedValue(deny(401));
        await callReport();
        expect(requireAdmin).toHaveBeenCalledTimes(1);
    });

    it('serves the report to an authorized admin', async () => {
        requireAdmin.mockResolvedValue({
            authorized: true,
            user: { id: 'admin-1' },
            profile: { id: 'admin-1', role: 'admin' },
        });
        const res = await callReport();
        expect(res.status).toBe(200);
        const body = (await res.json()) as Record<string, unknown>;
        // Authorized admins still get the full report.
        expect(body).toBeTruthy();
    });
});
