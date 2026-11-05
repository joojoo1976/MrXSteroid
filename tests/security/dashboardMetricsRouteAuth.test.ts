/**
 * tests/security/dashboardMetricsRouteAuth.test.ts
 *
 * Security contract for /api/dashboard/metrics.
 *
 * The route previously had no authentication, no authorization, used the
 * Supabase service-role key, and GET could UPSERT a snapshot. These tests pin
 * the repaired contract:
 *   - anonymous / invalid token  -> 401, service role never constructed
 *   - authenticated non-admin    -> 403, service role never constructed
 *   - admin GET                  -> read-only, explicit columns, no writes
 *   - admin GET, no snapshot     -> 404 snapshot_not_available, no writes
 *   - admin POST                 -> single authorised recompute
 *   - DB errors never reach the client; no fabricated fallback metrics
 *
 * requireAdmin itself is exercised for real (only @supabase/supabase-js is
 * faked) so the Bearer parsing and role check are part of the proof.
 */

import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';

const h = vi.hoisted(() => {
    const state: {
        userResult: { data: { user: { id: string } | null }; error: unknown };
        profileResult: { data: { id: string; role: string } | null; error: unknown };
    } = {
        userResult: { data: { user: null }, error: null },
        profileResult: { data: null, error: null },
    };
    return {
        state,
        createClient: vi.fn(),
        getSupabaseAdmin: vi.fn(),
        calculate: vi.fn(),
    };
});

vi.mock('@supabase/supabase-js', () => ({ createClient: h.createClient }));
vi.mock('../../server/seo/seoService', () => ({ getSupabaseAdmin: h.getSupabaseAdmin }));
vi.mock('../../server/dashboard/dashboardService', () => ({
    calculateAndPersistAdminMetrics: h.calculate,
}));

import { GET, POST } from '../../app/api/dashboard/metrics/route';

const URL_BASE = 'http://localhost:3000/api/dashboard/metrics';

const ENV_KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;
let savedEnv: Record<string, string | undefined> = {};

interface ServiceBuilder {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
}

function makeServiceClient(rowResult: { data: unknown; error: unknown }) {
    const builder = {} as ServiceBuilder;
    builder.select = vi.fn(() => builder);
    builder.eq = vi.fn(() => builder);
    builder.order = vi.fn(() => builder);
    builder.limit = vi.fn(() => builder);
    builder.maybeSingle = vi.fn(async () => rowResult);
    builder.upsert = vi.fn(async () => ({ data: null, error: null }));
    builder.insert = vi.fn(async () => ({ data: null, error: null }));
    builder.update = vi.fn(async () => ({ data: null, error: null }));
    builder.delete = vi.fn(async () => ({ data: null, error: null }));
    const from = vi.fn(() => builder);
    return { client: { from }, from, builder };
}

function authHeader(token = 'valid-token'): Record<string, string> {
    return { authorization: `Bearer ${token}` };
}

function makeGetRequest(params: Record<string, string> = {}, headers: Record<string, string> = {}) {
    const url = new URL(URL_BASE);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    return new NextRequest(url, { method: 'GET', headers });
}

function makePostRequest(params: Record<string, string> = {}, headers: Record<string, string> = {}) {
    const url = new URL(URL_BASE);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    return new NextRequest(url, { method: 'POST', headers });
}

beforeAll(() => {
    for (const key of ENV_KEYS) {
        savedEnv[key] = process.env[key];
        process.env[key] = key === 'NEXT_PUBLIC_SUPABASE_URL'
            ? 'https://test-project.supabase.co'
            : 'test-anon-key';
    }
});

afterAll(() => {
    for (const key of ENV_KEYS) {
        if (savedEnv[key] === undefined) delete process.env[key];
        else process.env[key] = savedEnv[key];
    }
});

beforeEach(() => {
    vi.clearAllMocks();
    h.state.userResult = { data: { user: { id: 'user-1' } }, error: null };
    h.state.profileResult = { data: { id: 'user-1', role: 'admin' }, error: null };

    h.createClient.mockImplementation(() => ({
        auth: {
            getUser: vi.fn(async () => h.state.userResult),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    maybeSingle: vi.fn(async () => h.state.profileResult),
                })),
            })),
        })),
    }));
});

describe('GET /api/dashboard/metrics — authentication', () => {
    it('returns 401 for an anonymous request and never constructs the service-role client', async () => {
        const res = await GET(makeGetRequest());
        expect(res.status).toBe(401);
        expect(h.getSupabaseAdmin).not.toHaveBeenCalled();
        expect(h.calculate).not.toHaveBeenCalled();
    });

    it('returns 401 for an invalid or expired token', async () => {
        h.state.userResult = { data: { user: null }, error: { message: 'invalid JWT' } };
        const res = await GET(makeGetRequest({}, authHeader('expired')));
        expect(res.status).toBe(401);
        expect(h.getSupabaseAdmin).not.toHaveBeenCalled();
    });
});

describe('GET /api/dashboard/metrics — authorization', () => {
    it('returns 403 for an authenticated non-admin and never constructs the service-role client', async () => {
        h.state.profileResult = { data: { id: 'user-1', role: 'user' }, error: null };
        const res = await GET(makeGetRequest({}, authHeader()));
        expect(res.status).toBe(403);
        expect(h.getSupabaseAdmin).not.toHaveBeenCalled();
        expect(h.calculate).not.toHaveBeenCalled();
    });

    it('returns 403 when the role lookup fails', async () => {
        h.state.profileResult = { data: null, error: { message: 'permission denied' } };
        const res = await GET(makeGetRequest({}, authHeader()));
        expect(res.status).toBe(403);
        expect(h.getSupabaseAdmin).not.toHaveBeenCalled();
    });
});

describe('GET /api/dashboard/metrics — read-only admin path', () => {
    it('returns the snapshot for an admin using explicit columns only', async () => {
        const row = {
            id: 'm-1',
            metric_date: '2026-11-01',
            metric_type: 'daily_summary',
            total_revenue_usd: 10,
            total_revenue_egp: 500,
            successful_invoices: 1,
            pending_invoices: 0,
            failed_invoices: 0,
            active_subscribers: 2,
            active_affiliates: 0,
            seo_active_keywords: 3,
            seo_avg_score: 70,
            metrics_payload: { totalInvoices: 1 },
            created_at: '2026-11-01T00:00:00Z',
        };
        const svc = makeServiceClient({ data: row, error: null });
        h.getSupabaseAdmin.mockReturnValue(svc.client);

        const res = await GET(makeGetRequest({ type: 'daily_summary' }, authHeader()));
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.ok).toBe(true);
        expect(body.metrics).toEqual(row);

        // Explicit projection, never select('*').
        expect(svc.builder.select).toHaveBeenCalledTimes(1);
        const projection = svc.builder.select.mock.calls[0][0] as string;
        expect(projection).not.toBe('*');
        expect(projection).not.toContain('*');
        expect(projection).toContain('id');
        expect(projection).toContain('metric_date');

        // Read-only: no recompute, no writes.
        expect(h.calculate).not.toHaveBeenCalled();
        expect(svc.builder.upsert).not.toHaveBeenCalled();
        expect(svc.builder.insert).not.toHaveBeenCalled();
        expect(svc.builder.update).not.toHaveBeenCalled();
        expect(svc.builder.delete).not.toHaveBeenCalled();
        expect(svc.from).toHaveBeenCalledTimes(1);
        expect(svc.from).toHaveBeenCalledWith('admin_dashboard_metrics');
    });

    it('returns 404 snapshot_not_available when no snapshot exists, without writing one', async () => {
        const svc = makeServiceClient({ data: null, error: null });
        h.getSupabaseAdmin.mockReturnValue(svc.client);

        const res = await GET(makeGetRequest({}, authHeader()));
        expect(res.status).toBe(404);

        const body = await res.json();
        expect(body.code).toBe('snapshot_not_available');
        expect(body.metrics).toBeUndefined();

        expect(h.calculate).not.toHaveBeenCalled();
        expect(svc.builder.upsert).not.toHaveBeenCalled();
        expect(svc.from).toHaveBeenCalledTimes(1);
    });

    it('returns a generic 500 without leaking database error text', async () => {
        const svc = makeServiceClient({
            data: null,
            error: { message: 'column admin_dashboard_metrics.secret does not exist' },
        });
        h.getSupabaseAdmin.mockReturnValue(svc.client);

        const res = await GET(makeGetRequest({}, authHeader()));
        expect(res.status).toBe(500);

        const raw = JSON.stringify(await res.json());
        expect(raw).not.toContain('secret');
        expect(raw).not.toContain('does not exist');
        expect(raw).not.toContain('admin_dashboard_metrics');
    });

    it('fails closed without fabricating fallback metrics when the service role is unavailable', async () => {
        h.getSupabaseAdmin.mockReturnValue(null);

        const res = await GET(makeGetRequest({}, authHeader()));
        expect(res.status).toBe(500);

        const raw = JSON.stringify(await res.json());
        expect(raw).not.toContain('seo_active_keywords');
        expect(raw).not.toContain('82.5');
        expect(raw).not.toContain('fallback');
    });
});

describe('POST /api/dashboard/metrics — authentication and authorization', () => {
    it('returns 401 for an anonymous request and never constructs the service-role client', async () => {
        const res = await POST(makePostRequest());
        expect(res.status).toBe(401);
        expect(h.getSupabaseAdmin).not.toHaveBeenCalled();
        expect(h.calculate).not.toHaveBeenCalled();
    });

    it('returns 403 for an authenticated non-admin and never constructs the service-role client', async () => {
        h.state.profileResult = { data: { id: 'user-1', role: 'user' }, error: null };
        const res = await POST(makePostRequest({}, authHeader()));
        expect(res.status).toBe(403);
        expect(h.getSupabaseAdmin).not.toHaveBeenCalled();
        expect(h.calculate).not.toHaveBeenCalled();
    });
});

describe('POST /api/dashboard/metrics — authorised recompute', () => {
    it('recomputes exactly once for an admin', async () => {
        const svc = makeServiceClient({ data: null, error: null });
        h.getSupabaseAdmin.mockReturnValue(svc.client);
        const fresh = { metricType: 'daily_summary', metricDate: '2026-11-01' };
        h.calculate.mockResolvedValue(fresh);

        const res = await POST(makePostRequest({ type: 'daily_summary' }, authHeader()));
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.ok).toBe(true);
        expect(body.metrics).toEqual(fresh);

        expect(h.calculate).toHaveBeenCalledTimes(1);
        expect(h.calculate).toHaveBeenCalledWith('daily_summary', svc.client);

        // The route itself performs no direct writes.
        expect(svc.builder.upsert).not.toHaveBeenCalled();
        expect(svc.builder.insert).not.toHaveBeenCalled();
        expect(svc.builder.update).not.toHaveBeenCalled();
        expect(svc.builder.delete).not.toHaveBeenCalled();
    });

    it('rejects an unsupported metric type with 400 before touching the service role', async () => {
        const res = await POST(makePostRequest({ type: 'not_a_real_type' }, authHeader()));
        expect(res.status).toBe(400);
        expect(h.getSupabaseAdmin).not.toHaveBeenCalled();
        expect(h.calculate).not.toHaveBeenCalled();
    });

    it('returns a generic 500 when the recompute fails, without leaking internals', async () => {
        const svc = makeServiceClient({ data: null, error: null });
        h.getSupabaseAdmin.mockReturnValue(svc.client);
        h.calculate.mockRejectedValue(new Error('relation "invoices" does not exist'));

        const res = await POST(makePostRequest({}, authHeader()));
        expect(res.status).toBe(500);

        const raw = JSON.stringify(await res.json());
        expect(raw).not.toContain('invoices');
        expect(raw).not.toContain('relation');
    });

    it('returns a generic 500 when the recompute yields no snapshot', async () => {
        const svc = makeServiceClient({ data: null, error: null });
        h.getSupabaseAdmin.mockReturnValue(svc.client);
        h.calculate.mockResolvedValue(null);

        const res = await POST(makePostRequest({}, authHeader()));
        expect(res.status).toBe(500);

        const body = await res.json();
        expect(body.ok).toBe(false);
        expect(body.metrics).toBeUndefined();
    });
});
