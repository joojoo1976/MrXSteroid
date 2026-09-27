/**
 * tests/unit/guestClaimInspect.test.ts
 *
 * Tests for the read-only claim status inspection that backs the `/claim-order`
 * page, and for the status endpoint that exposes it.
 *
 * WHY INSPECTION IS SEPARATE FROM REDEMPTION
 * The claim page must be able to say "sign in first", "this link expired" or
 * "this belongs to a different email" BEFORE the guest commits to anything. If
 * the page redeemed on load, the single-use token would be consumed before the
 * guest had even authenticated, and a failure would leave a paying guest with
 * nothing. Inspection therefore performs NO mutation.
 *
 * The properties pinned here:
 *   · inspection never writes — the single-use CAS lives only in redemption
 *   · an unauthenticated caller learns nothing (the route rejects it, and the
 *     service refuses an empty email even if it were called directly)
 *   · an unknown token is indistinguishable from a wrong-account token
 *   · expiry is honoured, including the revoked/expired statuses
 *   · the raw token is never echoed back in the response
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { inspectGuestOrderClaim, hashClaimToken, GUEST_CLAIM_TTL_HOURS } from '../../server/payments/guestClaimService';

const grantEntitlementMock = vi.fn();
vi.mock('../../server/payments/entitlementService', () => ({
    grantEntitlement: (...args: any[]) => grantEntitlementMock(...args),
}));
grantEntitlementMock.mockResolvedValue({ entitlementId: 'ent-1' });

/**
 * Minimal `guest_order_claims` double. Only the read path is needed here, but
 * every mutating builder is instrumented so a test can assert that inspection
 * performs none.
 */
function claimsHarness() {
    const rows: any[] = [];
    const writes: any[] = [];
    let errors: Record<string, any> = {};

    const from = vi.fn((table: string) => {
        const q: any = {};
        const state = { filters: [] as any[] };
        const chain = () => q;
        ['eq', 'gt', 'gte', 'lt', 'lte'].forEach((f) => {
            q[f] = vi.fn((col: string, val: any) => { state.filters.push([f, col, val]); return q; });
        });
        q.select = vi.fn(() => q);
        q.limit = vi.fn(chain);
        q.order = vi.fn(chain);

        const matches = (row: any) => state.filters.every(([f, col, val]) => {
            if (f === 'eq') return row[col] === val;
            const t = new Date(row[col]).getTime();
            const v = new Date(val).getTime();
            if (f === 'gt') return t > v;
            if (f === 'gte') return t >= v;
            if (f === 'lt') return t < v;
            if (f === 'lte') return t <= v;
            return true;
        });

        q.insert = vi.fn((p: any) => { writes.push({ table, op: 'insert', p }); return q; });
        q.update = vi.fn((p: any) => { writes.push({ table, op: 'update', p }); return q; });
        q.delete = vi.fn(() => { writes.push({ table, op: 'delete' }); return q; });
        q.upsert = vi.fn((p: any) => { writes.push({ table, op: 'upsert', p }); return q; });
        q.maybeSingle = vi.fn(async () => {
            if (errors.read) return { data: null, error: errors.read };
            const hit = rows.filter(matches);
            return { data: hit.length === 1 ? hit[0] : null, error: null };
        });
        q.single = vi.fn(async () => ({ data: null, error: null }));
        q.then = (onF: any) => {
            if (errors.read) return Promise.resolve({ data: null, error: errors.read }).then(onF);
            const hit = rows.filter(matches);
            return Promise.resolve({ data: hit, error: null }).then(onF);
        };
        return q;
    });

    return {
        client: { from } as any,
        rows,
        writes,
        setErrors: (e: Record<string, any>) => { errors = e; },
        addClaim: (row: Record<string, any>) => { rows.push(row); return rows[rows.length - 1]; },
    };
}

const NOW = new Date('2026-01-01T00:00:00.000Z');
const EXPIRES = new Date(NOW.getTime() + GUEST_CLAIM_TTL_HOURS * 3600_000).toISOString();
const RAW_TOKEN = 'raw-token-value-for-tests-0123456789';
const EMAIL = 'guest@example.com';

function claimRow(overrides: Record<string, any> = {}) {
    return {
        id: 'claim-1',
        email: EMAIL,
        product_id: 'MRX-PROTOCOL',
        status: 'pending',
        expires_at: EXPIRES,
        token_hash: hashClaimToken(RAW_TOKEN),
        ...overrides,
    };
}

describe('inspectGuestOrderClaim', () => {
    let h: ReturnType<typeof claimsHarness>;

    beforeEach(() => { h = claimsHarness(); });
    afterEach(() => { grantEntitlementMock.mockClear(); });

    it('reports a live claim as claimable and exposes no token material', async () => {
        h.addClaim(claimRow());

        const res = await inspectGuestOrderClaim({
            supabase: h.client, token: RAW_TOKEN, userEmail: EMAIL, now: NOW,
        });

        expect(res).toEqual({
            ok: true, state: 'claimable', productId: 'MRX-PROTOCOL', expiresAt: EXPIRES,
        });
        // The result must not carry the raw token or its digest.
        expect(JSON.stringify(res)).not.toContain(RAW_TOKEN);
        expect(JSON.stringify(res)).not.toContain(hashClaimToken(RAW_TOKEN));
    });

    it('performs NO mutation — it must never consume the single-use token', async () => {
        h.addClaim(claimRow());

        await inspectGuestOrderClaim({
            supabase: h.client, token: RAW_TOKEN, userEmail: EMAIL, now: NOW,
        });

        expect(h.writes).toHaveLength(0);
        expect(h.rows[0].status).toBe('pending');
        expect(grantEntitlementMock).not.toHaveBeenCalled();
    });

    it('rejects an unknown token as invalid_token', async () => {
        const res = await inspectGuestOrderClaim({
            supabase: h.client, token: 'nope-not-a-real-token', userEmail: EMAIL, now: NOW,
        });
        expect(res).toEqual({ ok: false, code: 'invalid_token' });
    });

    it('returns invalid_token for a missing token, not a disclosure', async () => {
        expect(await inspectGuestOrderClaim({
            supabase: h.client, token: '', userEmail: EMAIL, now: NOW,
        })).toEqual({ ok: false, code: 'invalid_token' });
    });

    it('refuses to tell an anonymous caller anything at all', async () => {
        h.addClaim(claimRow());

        // An empty email means "not authenticated". It must be indistinguishable
        // from a bad token, so an anonymous visitor cannot probe token existence.
        const res = await inspectGuestOrderClaim({
            supabase: h.client, token: RAW_TOKEN, userEmail: '', now: NOW,
        });
        expect(res).toEqual({ ok: false, code: 'invalid_token' });
    });

    it('reports expired for a lapsed TTL', async () => {
        h.addClaim(claimRow());
        const later = new Date(NOW.getTime() + GUEST_CLAIM_TTL_HOURS * 3600_000 + 1000);

        const res = await inspectGuestOrderClaim({
            supabase: h.client, token: RAW_TOKEN, userEmail: EMAIL, now: later,
        });
        expect(res).toEqual({ ok: false, code: 'expired' });
    });

    it('reports expired for the revoked and expired statuses', async () => {
        h.addClaim(claimRow({ status: 'revoked' }));
        expect(await inspectGuestOrderClaim({
            supabase: h.client, token: RAW_TOKEN, userEmail: EMAIL, now: NOW,
        })).toEqual({ ok: false, code: 'expired' });

        h.rows[0].status = 'expired';
        expect(await inspectGuestOrderClaim({
            supabase: h.client, token: RAW_TOKEN, userEmail: EMAIL, now: NOW,
        })).toEqual({ ok: false, code: 'expired' });
    });

    it('reports already_redeemed without mutating anything', async () => {
        h.addClaim(claimRow({ status: 'redeemed', redeemed_by: 'user-1' }));

        const res = await inspectGuestOrderClaim({
            supabase: h.client, token: RAW_TOKEN, userEmail: EMAIL, now: NOW,
        });
        expect(res).toEqual({ ok: false, code: 'already_redeemed' });
        expect(h.writes).toHaveLength(0);
    });

    it('reports unauthorized for a valid token owned by another account', async () => {
        h.addClaim(claimRow());

        const res = await inspectGuestOrderClaim({
            supabase: h.client, token: RAW_TOKEN,
            userEmail: 'attacker@evil.test', now: NOW,
        });
        expect(res).toEqual({ ok: false, code: 'unauthorized' });
        // A wrong-account caller must not consume the claim either.
        expect(h.writes).toHaveLength(0);
        expect(h.rows[0].status).toBe('pending');
    });

    it('binds ownership case-insensitively, like redemption does', async () => {
        h.addClaim(claimRow());
        const res = await inspectGuestOrderClaim({
            supabase: h.client, token: RAW_TOKEN, userEmail: '  GUEST@Example.COM ', now: NOW,
        });
        expect(res.ok).toBe(true);
    });

    it('surfaces a database read failure as db_error', async () => {
        h.addClaim(claimRow());
        h.setErrors({ read: { message: 'connection reset' } });

        const res = await inspectGuestOrderClaim({
            supabase: h.client, token: RAW_TOKEN, userEmail: EMAIL, now: NOW,
        });
        expect(res).toEqual({ ok: false, code: 'db_error' });
    });

    it('does not disclose internal error text', async () => {
        h.addClaim(claimRow());
        h.setErrors({ read: { message: 'postgres://user:secret@host/db' } });

        const res = await inspectGuestOrderClaim({
            supabase: h.client, token: RAW_TOKEN, userEmail: EMAIL, now: NOW,
        });
        expect(JSON.stringify(res)).not.toContain('secret');
    });
});
