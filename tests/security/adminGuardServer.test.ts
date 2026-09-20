import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { requireAdmin } from '../../server/auth/require-admin';
import { GET as getBlocks, POST as postBlocks } from '../../app/api/admin/seo/blocks/route';

// Mock Supabase JS client
const mockGetUser = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();
const mockUpsert = vi.fn();
const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockOrder = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: mockGetUser,
        },
        from: mockFrom,
    })),
}));

// Mock seoService getSupabaseAdmin for the route's inner logic
vi.mock('../../server/seo/seoService', () => ({
    getSupabaseAdmin: vi.fn(() => ({
        from: (table: string) => {
            if (table === 'seo_keyword_blocks') {
                return {
                    select: () => ({
                        order: () => Promise.resolve({ data: [{ id: 'blk-1', normalized_keyword: 'test' }], error: null }),
                    }),
                    upsert: () => ({
                        select: () => ({
                            single: () => Promise.resolve({ data: { id: 'blk-1' }, error: null }),
                        }),
                    }),
                };
            }
            if (table === 'seo_keywords') {
                return {
                    update: () => ({
                        eq: () => ({
                            eq: () => Promise.resolve({ error: null }),
                        }),
                    }),
                };
            }
            if (table === 'seo_keyword_audit_log') {
                return {
                    insert: () => Promise.resolve({ error: null }),
                };
            }
            return {};
        },
    })),
}));

describe('Server Admin Guard (requireAdmin) & Route Hardening', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';

        mockFrom.mockReturnValue({
            select: mockSelect.mockReturnValue({
                eq: mockEq.mockReturnValue({
                    maybeSingle: mockMaybeSingle,
                }),
            }),
        });
    });

    describe('1. Direct requireAdmin Guard Unit Tests', () => {
        it('rejects request with missing authorization header (401)', async () => {
            const req = new NextRequest('http://localhost:3000/api/admin/seo/blocks');
            const result = await requireAdmin(req);

            expect(result.authorized).toBe(false);
            if (!result.authorized) {
                expect(result.response.status).toBe(401);
                const body = await result.response.json();
                expect(body.error).toContain('Missing or invalid');
            }
        });

        it('rejects request with empty bearer token (401)', async () => {
            const req = new NextRequest('http://localhost:3000/api/admin/seo/blocks', {
                headers: { authorization: 'Bearer ' },
            });
            const result = await requireAdmin(req);

            expect(result.authorized).toBe(false);
            if (!result.authorized) {
                expect(result.response.status).toBe(401);
            }
        });

        it('rejects invalid or expired token (401)', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: null },
                error: { message: 'Invalid JWT' },
            });

            const req = new NextRequest('http://localhost:3000/api/admin/seo/blocks', {
                headers: { authorization: 'Bearer bad-token' },
            });
            const result = await requireAdmin(req);

            expect(result.authorized).toBe(false);
            if (!result.authorized) {
                expect(result.response.status).toBe(401);
                const body = await result.response.json();
                expect(body.error).toContain('Invalid or expired session');
            }
        });

        it('rejects authenticated regular user with role="user" (403)', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'usr-regular', email: 'user@example.com' } },
                error: null,
            });
            mockMaybeSingle.mockResolvedValue({
                data: { id: 'usr-regular', role: 'user' },
                error: null,
            });

            const req = new NextRequest('http://localhost:3000/api/admin/seo/blocks', {
                headers: { authorization: 'Bearer valid-user-token' },
            });
            const result = await requireAdmin(req);

            expect(result.authorized).toBe(false);
            if (!result.authorized) {
                expect(result.response.status).toBe(403);
                const body = await result.response.json();
                expect(body.error).toContain('Administrator privileges required');
            }
        });

        it('returns generic error on profile database failure without leaking DB error (403)', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'usr-test', email: 'user@example.com' } },
                error: null,
            });
            mockMaybeSingle.mockResolvedValue({
                data: null,
                error: { message: 'connection refused to postgres:5432' },
            });

            const req = new NextRequest('http://localhost:3000/api/admin/seo/blocks', {
                headers: { authorization: 'Bearer valid-token' },
            });
            const result = await requireAdmin(req);

            expect(result.authorized).toBe(false);
            if (!result.authorized) {
                expect(result.response.status).toBe(403);
                const body = await result.response.json();
                expect(body.error).toBe('Forbidden: Administrator privileges required');
                expect(body.error).not.toContain('postgres');
                expect(body.requestId).toBeDefined();
            }
        });

        it('authorizes genuine admin user with role="admin" from profiles (200)', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'usr-admin', email: 'admin@mrx.com' } },
                error: null,
            });
            mockMaybeSingle.mockResolvedValue({
                data: { id: 'usr-admin', role: 'admin' },
                error: null,
            });

            const req = new NextRequest('http://localhost:3000/api/admin/seo/blocks', {
                headers: { authorization: 'Bearer valid-admin-token' },
            });
            const result = await requireAdmin(req);

            expect(result.authorized).toBe(true);
            if (result.authorized) {
                expect(result.user.id).toBe('usr-admin');
                expect(result.profile.role).toBe('admin');
            }
        });
    });

    describe('2. Hardened /api/admin/seo/blocks Route Integration', () => {
        it('GET /api/admin/seo/blocks rejects unauthenticated request (401)', async () => {
            const req = new NextRequest('http://localhost:3000/api/admin/seo/blocks', {
                method: 'GET',
            });
            const res = await getBlocks(req);
            expect(res.status).toBe(401);
            const body = await res.json();
            expect(body.error).toContain('Missing or invalid');
        });

        it('POST /api/admin/seo/blocks rejects unauthenticated request (401)', async () => {
            const req = new NextRequest('http://localhost:3000/api/admin/seo/blocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: 'test', language: 'en' }),
            });
            const res = await postBlocks(req);
            expect(res.status).toBe(401);
        });

        it('POST /api/admin/seo/blocks rejects regular user even if body attempts role injection (403)', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'usr-attacker' } },
                error: null,
            });
            mockMaybeSingle.mockResolvedValue({
                data: { id: 'usr-attacker', role: 'user' },
                error: null,
            });

            // Attacker attempts to send role: "admin" in body
            const req = new NextRequest('http://localhost:3000/api/admin/seo/blocks', {
                method: 'POST',
                headers: {
                    authorization: 'Bearer user-token',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    keyword: 'anavar',
                    language: 'en',
                    role: 'admin',
                    user_metadata: { role: 'admin' },
                }),
            });

            const res = await postBlocks(req);
            expect(res.status).toBe(403);
            const body = await res.json();
            expect(body.error).toContain('Administrator privileges required');
        });

        it('GET /api/admin/seo/blocks succeeds for genuine admin (200)', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'usr-admin' } },
                error: null,
            });
            mockMaybeSingle.mockResolvedValue({
                data: { id: 'usr-admin', role: 'admin' },
                error: null,
            });

            const req = new NextRequest('http://localhost:3000/api/admin/seo/blocks', {
                method: 'GET',
                headers: { authorization: 'Bearer valid-admin-token' },
            });

            const res = await getBlocks(req);
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.blocks).toBeDefined();
            expect(body.blocks[0].normalized_keyword).toBe('test');
        });

        it('POST /api/admin/seo/blocks succeeds for genuine admin (200)', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'usr-admin' } },
                error: null,
            });
            mockMaybeSingle.mockResolvedValue({
                data: { id: 'usr-admin', role: 'admin' },
                error: null,
            });

            const req = new NextRequest('http://localhost:3000/api/admin/seo/blocks', {
                method: 'POST',
                headers: {
                    authorization: 'Bearer valid-admin-token',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    keyword: 'trenbolone',
                    language: 'en',
                    reason: 'Prohibited substance',
                }),
            });

            const res = await postBlocks(req);
            expect(res.status).toBe(200);
        });
    });
});
