import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    isOriginAllowed,
    resolveAllowedOrigin,
    buildCorsHeaders,
    corsPreflightResponse,
    buildAllowedOrigins,
} from '../../server/cors/corsConfig';
import { resolveEffectiveUserId, getAuthenticatedUser } from '../../server/auth/resolveUser';
import { OPTIONS as optionsInvoice, POST as postInvoice } from '../../app/api/payments/create-invoice/route';
import { OPTIONS as optionsDownload, GET as getDownload } from '../../app/api/download/route';
import { OPTIONS as optionsKashierSession } from '../../app/api/checkout/kashier/session/route';
import { OPTIONS as optionsContact } from '../../app/api/contact/route';
import { OPTIONS as optionsWelcome } from '../../app/api/auth/welcome/route';
import { OPTIONS as optionsGeo } from '../../app/api/geo/route';
import { OPTIONS as optionsCallback } from '../../app/api/payments/callback/route';

// Mocks for Supabase
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: mockGetUser,
        },
        from: mockFrom,
    })),
}));

// Mock fs/promises for download route
vi.mock('fs/promises', () => ({
    readFile: vi.fn(),
}));

describe('Phase 2 Security Hardening', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SITE_URL = 'https://www.mrxsteroid.com';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-test-key';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 1. CORS Allowlist & Wildcard Removal
    // ──────────────────────────────────────────────────────────────────────────
    describe('CORS Allowlist Engine', () => {
        it('allows official production domains (www, apex, and vercel deployment)', () => {
            expect(isOriginAllowed('https://www.mrxsteroid.com')).toBe(true);
            expect(isOriginAllowed('https://mrxsteroid.com')).toBe(true);
            expect(isOriginAllowed('https://mrxsteroid.vercel.app')).toBe(true);
        });

        it('rejects arbitrary external origins and subdomain attacks', () => {
            expect(isOriginAllowed('https://evil-attacker.com')).toBe(false);
            expect(isOriginAllowed('https://mrxsteroid.com.attacker.com')).toBe(false);
            expect(isOriginAllowed('http://mrxsteroid.com')).toBe(false); // unencrypted http
            expect(isOriginAllowed('null')).toBe(false);
            expect(isOriginAllowed(null)).toBe(false);
            expect(isOriginAllowed(undefined)).toBe(false);
        });

        it('resolves allowed origin correctly from Request headers', () => {
            const allowedReq = new Request('http://localhost/api/geo', {
                headers: { Origin: 'https://www.mrxsteroid.com' },
            });
            expect(resolveAllowedOrigin(allowedReq)).toBe('https://www.mrxsteroid.com');

            const forbiddenReq = new Request('http://localhost/api/geo', {
                headers: { Origin: 'https://attacker.io' },
            });
            expect(resolveAllowedOrigin(forbiddenReq)).toBeNull();
        });

        it('generates preflight response with ACAO only for allowed origins, never "*"', () => {
            const allowedReq = new Request('http://localhost/api/download', {
                headers: { Origin: 'https://www.mrxsteroid.com' },
            });
            const resAllowed = corsPreflightResponse(allowedReq, 'GET, OPTIONS', 'Content-Type');
            expect(resAllowed.status).toBe(204);
            expect(resAllowed.headers.get('Access-Control-Allow-Origin')).toBe('https://www.mrxsteroid.com');
            expect(resAllowed.headers.get('Access-Control-Allow-Origin')).not.toBe('*');

            const rejectedReq = new Request('http://localhost/api/download', {
                headers: { Origin: 'https://attacker.org' },
            });
            const resRejected = corsPreflightResponse(rejectedReq, 'GET, OPTIONS', 'Content-Type');
            expect(resRejected.status).toBe(204);
            expect(resRejected.headers.get('Access-Control-Allow-Origin')).toBeNull();
        });

        it('verifies all hardened routes respond to OPTIONS with safe CORS headers and no wildcard "*"', async () => {
            const req = new Request('http://localhost/test', {
                headers: { Origin: 'https://www.mrxsteroid.com' },
            });

            const handlers = [
                { name: 'create-invoice', fn: optionsInvoice },
                { name: 'download', fn: optionsDownload },
                { name: 'kashier-session', fn: optionsKashierSession },
                { name: 'contact', fn: optionsContact },
                { name: 'welcome', fn: optionsWelcome },
                { name: 'geo', fn: optionsGeo },
                { name: 'callback', fn: optionsCallback },
            ];

            for (const handler of handlers) {
                const res = await handler.fn(req);
                expect(res.status).toBe(204);
                expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://www.mrxsteroid.com');
                expect(res.headers.get('Access-Control-Allow-Origin')).not.toBe('*');

                // Forbidden origin test
                const evilReq = new Request('http://localhost/test', {
                    headers: { Origin: 'https://evil.com' },
                });
                const evilRes = await handler.fn(evilReq);
                expect(evilRes.headers.get('Access-Control-Allow-Origin')).toBeNull();
            }
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 2. IDOR Prevention & User Resolution Engine
    // ──────────────────────────────────────────────────────────────────────────
    describe('User Identity & IDOR Resolution', () => {
        it('rejects invalid or expired token with 401', async () => {
            mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'jwt expired' } });

            const req = new Request('http://localhost/api/payments/create-invoice', {
                headers: { Authorization: 'Bearer expired-token' },
            });

            const result = await resolveEffectiveUserId(req, 'some-user-id');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.status).toBe(401);
                expect(result.error).toContain('Invalid or expired');
            }
        });

        it('rejects attempt by user A to create an invoice for user B (IDOR attempt -> 403)', async () => {
            mockGetUser.mockResolvedValueOnce({
                data: { user: { id: 'user-alice-1111-1111-111111111111' } },
                error: null,
            });

            const req = new Request('http://localhost/api/payments/create-invoice', {
                headers: { Authorization: 'Bearer alice-valid-token' },
            });

            // Alice attempts to specify Bob's userId in request
            const result = await resolveEffectiveUserId(req, 'user-bob-2222-2222-222222222222');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.status).toBe(403);
                expect(result.error).toContain('Cannot create invoice for another user');
            }
        });

        it('binds invoice to authenticated user when userId matches or is omitted', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'user-alice-1111-1111-111111111111' } },
                error: null,
            });

            const req = new Request('http://localhost/api/payments/create-invoice', {
                headers: { Authorization: 'Bearer alice-valid-token' },
            });

            // Match case
            const matchResult = await resolveEffectiveUserId(req, 'user-alice-1111-1111-111111111111');
            expect(matchResult.success).toBe(true);
            if (matchResult.success) {
                expect(matchResult.effectiveUserId).toBe('user-alice-1111-1111-111111111111');
            }

            // Omitted case
            const omittedResult = await resolveEffectiveUserId(req, undefined);
            expect(omittedResult.success).toBe(true);
            if (omittedResult.success) {
                expect(omittedResult.effectiveUserId).toBe('user-alice-1111-1111-111111111111');
            }
        });

        it('rejects unauthenticated caller attempting to assign invoice to a registered user (401)', async () => {
            const req = new Request('http://localhost/api/payments/create-invoice'); // No auth header

            const result = await resolveEffectiveUserId(req, 'victim-user-3333-3333-333333333333');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.status).toBe(401);
                expect(result.error).toContain('Authentication required');
            }
        });

        it('allows guest checkout with null effectiveUserId when unauthenticated and no userId passed', async () => {
            const req = new Request('http://localhost/api/payments/create-invoice'); // No auth header

            const result = await resolveEffectiveUserId(req, undefined);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.effectiveUserId).toBeNull();
            }
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 3. create-invoice Route Handler Integration
    // ──────────────────────────────────────────────────────────────────────────
    describe('create-invoice Endpoint IDOR Protection', () => {
        it('returns 403 Forbidden when an authenticated user sends another userId in body', async () => {
            mockGetUser.mockResolvedValueOnce({
                data: { user: { id: '00000000-0000-0000-0000-000000000001' } },
                error: null,
            });

            const req = new Request('http://localhost/api/payments/create-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer token-user-1',
                },
                body: JSON.stringify({
                    userId: '00000000-0000-0000-0000-000000000002', // Different UUID
                    tierId: 'digital',
                    country: 'US',
                    email: 'buyer@example.com',
                    fullName: 'Attacker User',
                }),
            });

            const res = await postInvoice(req);
            expect(res.status).toBe(403);
            const data = await res.json();
            expect(data.error).toContain('Cannot create invoice for another user');
        });

        it('returns 401 Unauthorized when an unauthenticated caller sends a userId in body', async () => {
            const req = new Request('http://localhost/api/payments/create-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: '00000000-0000-0000-0000-000000000002',
                    tierId: 'digital',
                    country: 'US',
                    email: 'buyer@example.com',
                    fullName: 'Unauthenticated User',
                }),
            });

            const res = await postInvoice(req);
            expect(res.status).toBe(401);
            const data = await res.json();
            expect(data.error).toContain('Authentication required');
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 4. download/route.ts Information Leakage Protection
    // ──────────────────────────────────────────────────────────────────────────
    describe('download/route.ts Information Leakage Protection', () => {
        it('does not leak internal server paths or error stack traces on disk failure', async () => {
            mockGetUser.mockResolvedValueOnce({
                data: { user: { id: 'user-paid-123' } },
                error: null,
            });

            mockFrom.mockReturnValueOnce({
                select: () => ({
                    eq: () => ({
                        maybeSingle: () => Promise.resolve({
                            data: { has_paid: true, subscription_status: 'active' },
                            error: null,
                        }),
                    }),
                }),
            });

            const { readFile } = await import('fs/promises');
            vi.mocked(readFile).mockRejectedValueOnce(
                new Error('ENOENT: no such file or directory, open "E:\\MrXSteroid-main\\private\\books\\MrXSteroid_Book_EN.pdf"')
            );

            const req = new Request('http://localhost/api/download?file=en', {
                headers: { Authorization: 'Bearer valid-paid-token' },
            });

            const res = await getDownload(req);
            expect(res.status).toBe(500);
            const json = await res.json();

            // Client gets a generic message
            expect(json.error).toBe('Download service unavailable');
            // Client MUST NOT receive filesystem paths, internal filenames, or stack traces
            expect(JSON.stringify(json)).not.toContain('ENOENT');
            expect(JSON.stringify(json)).not.toContain('E:\\');
            expect(JSON.stringify(json)).not.toContain('private');
            expect(json.message).toBeUndefined();
        });
    });
});
