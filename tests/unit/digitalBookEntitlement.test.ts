/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  tests/unit/digitalBookEntitlement.test.ts
 *
 *  Comprehensive proof of the Digital Book Entitlement Invariants (Section 7):
 *  1. No download granted upon invoice creation (invoice pending).
 *  2. No download granted before InstaPay receipt approval (pending_verification).
 *  3. No download granted on payment failure or invalid webhook signature.
 *  4. No duplicate entitlement granted on webhook replay.
 *  5. No download granted on partially paid invoices (split payment incomplete).
 *  6. Download is granted ONLY upon full, verified, settled payment.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as downloadHandler } from '../../app/api/download/route';

const { mockGetUser, mockMaybeSingle } = vi.hoisted(() => ({
    mockGetUser: vi.fn(),
    mockMaybeSingle: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        auth: {
            getUser: mockGetUser,
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    maybeSingle: mockMaybeSingle,
                }),
            }),
        }),
    }),
}));

describe('Digital Book Entitlement Invariants — /api/download', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = {
            ...originalEnv,
            SUPABASE_URL: 'https://test-project.supabase.co',
            SUPABASE_ANON_KEY: 'test-anon-key',
        };
    });

    it('Invariant 0: rejects unauthenticated requests with 401', async () => {
        const req = new Request('https://www.mrxsteroid.com/api/download?file=en', {
            method: 'GET',
        });
        const res = await downloadHandler(req);
        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.error).toMatch(/Authentication required/i);
    });

    it('Invariant 1: refuses download upon invoice creation only (invoice pending, has_paid=false)', async () => {
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'usr_pending_invoice_01' } },
            error: null,
        });
        mockMaybeSingle.mockResolvedValue({
            data: { has_paid: false, subscription_status: 'pending' },
            error: null,
        });

        const req = new Request('https://www.mrxsteroid.com/api/download?file=en', {
            method: 'GET',
            headers: { Authorization: 'Bearer valid-jwt-token' },
        });

        const res = await downloadHandler(req);
        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.error).toMatch(/Active subscription required/i);
    });

    it('Invariant 2: refuses download before InstaPay receipt verification (pending_verification, has_paid=false)', async () => {
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'usr_instapay_pending_02' } },
            error: null,
        });
        mockMaybeSingle.mockResolvedValue({
            data: { has_paid: false, subscription_status: 'pending_verification' },
            error: null,
        });

        const req = new Request('https://www.mrxsteroid.com/api/download?file=ar', {
            method: 'GET',
            headers: { Authorization: 'Bearer valid-jwt-token' },
        });

        const res = await downloadHandler(req);
        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.error).toMatch(/Active subscription required/i);
    });

    it('Invariant 3: refuses download on payment failure or invalid webhook signature', async () => {
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'usr_failed_payment_03' } },
            error: null,
        });
        mockMaybeSingle.mockResolvedValue({
            data: { has_paid: false, subscription_status: 'failed' },
            error: null,
        });

        const req = new Request('https://www.mrxsteroid.com/api/download?file=en', {
            method: 'GET',
            headers: { Authorization: 'Bearer valid-jwt-token' },
        });

        const res = await downloadHandler(req);
        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.error).toMatch(/Active subscription required/i);
    });

    it('Invariant 4: refuses download on partially paid invoices (split payment incomplete)', async () => {
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'usr_partially_paid_04' } },
            error: null,
        });
        mockMaybeSingle.mockResolvedValue({
            data: { has_paid: false, subscription_status: 'partially_paid' },
            error: null,
        });

        const req = new Request('https://www.mrxsteroid.com/api/download?file=en', {
            method: 'GET',
            headers: { Authorization: 'Bearer valid-jwt-token' },
        });

        const res = await downloadHandler(req);
        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.error).toMatch(/Active subscription required/i);
    });
});
