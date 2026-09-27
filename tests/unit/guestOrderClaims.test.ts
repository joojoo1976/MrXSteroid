/**
 * tests/unit/guestOrderClaims.test.ts
 *
 * Security and lifecycle tests for the deferred guest-claim mechanism.
 *
 * THE DEFECT UNDER TEST
 * `entitlements.user_id` is NOT NULL, so the fulfillment subscription and
 * entitlement steps were both gated on `invoice.user_id`. A captured GUEST
 * payment therefore settled the §6.3 journal and returned `success` while
 * granting the customer nothing at all — a silent, zero-error revenue loss.
 * Guest checkout is intentional and must stay enabled, so the fix is to defer
 * delivery behind a real, single-use, email-bound claim.
 *
 * These tests pin the properties that make that safe:
 *   · the raw token is never persisted (only a SHA-256 digest)
 *   · 256 bits of CSPRNG entropy, unique per claim
 *   · one redeemable token per invoice (re-issue supersedes)
 *   · single-use enforced by compare-and-swap
 *   · expiry enforced INSIDE the conditional update
 *   · redemption bound to the guest's email, so a leaked token cannot be
 *     redeemed into somebody else's account
 *   · entitlement is only ever written against a real authenticated user id
 *   · a failed grant compensates the token back instead of stranding a payer
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    createGuestOrderClaim,
    redeemGuestOrderClaim,
    expireStaleGuestClaims,
    generateClaimToken,
    hashClaimToken,
    normalizeEmail,
    buildGuestClaimUrl,
    GUEST_CLAIM_TTL_HOURS,
} from '../../server/payments/guestClaimService';

// `guestClaimService` statically imports `grantEntitlement`, so the mock has to
// be hoisted with `vi.mock` — a `vi.doMock` in `beforeEach` runs too late to
// affect the already-imported module and the real grant would execute instead.
const grantEntitlementMock = vi.fn();
vi.mock('../../server/payments/entitlementService', () => ({
    grantEntitlement: (...args: any[]) => grantEntitlementMock(...args),
}));
// Default success so blocks that only assert on the claim row still work.
grantEntitlementMock.mockResolvedValue({ entitlementId: 'ent-1' });

/**
 * In-memory double for `guest_order_claims` that honours the predicates the
 * service relies on, so the compare-and-swap and expiry semantics are actually
 * exercised rather than stubbed away.
 */
function claimsHarness() {
    const rows: any[] = [];
    const ops: any[] = [];
    let nextId = 1;
    let errors: Record<string, any> = {};

    const from = vi.fn((table: string) => {
        const q: any = {};
        const state = { filters: [] as any[], op: '', payload: undefined as any };
        const chain = () => q;
        ['eq', 'gt', 'gte', 'lt', 'lte'].forEach((f) => {
            q[f] = vi.fn((col: string, val: any) => { state.filters.push([f, col, val]); return q; });
        });
        q.select = vi.fn(() => q);
        q.limit = vi.fn(chain);
        q.order = vi.fn(chain);

        const matches = (row: any) => state.filters.every(([f, col, val]) => {
            if (f === 'eq') return row[col] === val;
            if (f === 'gt') return new Date(row[col]).getTime() > new Date(val).getTime();
            if (f === 'gte') return new Date(row[col]).getTime() >= new Date(val).getTime();
            if (f === 'lt') return new Date(row[col]).getTime() < new Date(val).getTime();
            if (f === 'lte') return new Date(row[col]).getTime() <= new Date(val).getTime();
            return true;
        });

        q.insert = vi.fn((payload: any) => {
            state.op = 'insert'; state.payload = payload;
            ops.push({ table, op: 'insert', payload });
            // Materialize eagerly so a trailing `.single()` (which never awaits
            // the builder, so `then` never runs) can observe the row.
            if (!errors.insert) {
                q.__row = { id: `claim-${nextId++}`, ...payload };
                rows.push(q.__row);
            }
            return q;
        });
        // The real PostgREST builder applies `.update().eq().lt()` filters lazily,
        // at await time. Mutating inside `update()` would run before the
        // predicates are attached, so the mutation is deferred to `then`.
        q.update = vi.fn((payload: any) => {
            state.op = 'update'; state.payload = payload;
            // Record the shared filter array by reference: the predicates are
            // attached after `update()` returns, so they are read at await time.
            ops.push({ table, op: 'update', payload, stateRef: state });
            return q;
        });
        q.delete = vi.fn(() => q);
        q.single = vi.fn(async () => {
            if (errors.insert) return { data: null, error: errors.insert };
            return { data: q.__row ?? null, error: null };
        });
        q.maybeSingle = vi.fn(async () => {
            const hit = rows.filter(matches);
            return { data: hit.length === 1 ? hit[0] : null, error: null };
        });
        q.then = (onF: any) => {
            let result: any;
            if (state.op === 'insert') {
                result = errors.insert
                    ? { data: null, error: errors.insert }
                    : { data: [q.__row], error: null };
            } else if (state.op === 'update') {
                if (errors.update) result = { data: null, error: errors.update };
                else {
                    const hit = rows.filter(matches);
                    hit.forEach((r) => Object.assign(r, state.payload));
                    q.__hits = hit;
                    result = { data: hit, error: null };
                }
            } else {
                const hit = rows.filter(matches);
                result = { data: state.filters.length ? hit : rows, error: null };
            }
            return Promise.resolve(result).then(onF);
        };
        return q;
    });

    return {
        client: { from } as any,
        rows,
        ops,
        setErrors: (e: Record<string, any>) => { errors = e; },
    };
}

function makeHarness() {
    const h = claimsHarness();
    vi.doMock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => h.client) }));
    return h;
}

const TIER = 'MRX-PROTOCOL';
const INVOICE = 'inv-guest-1';
const INTENT = 'pi-guest-1';
const EMAIL = 'Guest@Example.com';

const NOW = new Date('2026-01-01T00:00:00.000Z');

describe('guest claim token primitives', () => {
    it('generates 256 bits of entropy, base64url encoded', () => {
        const t = generateClaimToken();
        // 32 bytes -> 43 base64url chars, no padding, no unsafe URL chars.
        expect(t).toHaveLength(43);
        expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('never repeats a token', () => {
        const set = new Set(Array.from({ length: 2000 }, () => generateClaimToken()));
        expect(set.size).toBe(2000);
    });

    it('hashes deterministically and irreversibly enough to be safe to store', () => {
        const t = generateClaimToken();
        const h = hashClaimToken(t);
        expect(h).toHaveLength(64);
        expect(h).toMatch(/^[a-f0-9]{64}$/);
        expect(hashClaimToken(t)).toBe(h);
        expect(hashClaimToken(generateClaimToken())).not.toBe(h);
        expect(h).not.toContain(t);
    });

    it('normalizes email the way Supabase Auth does', () => {
        expect(normalizeEmail('  Guest@Example.COM ')).toBe('guest@example.com');
        expect(normalizeEmail(null)).toBe('');
        expect(normalizeEmail(undefined)).toBe('');
    });

    it('builds a URL-encoded claim URL without a trailing-slash host', () => {
        expect(buildGuestClaimUrl('abc+/=d', 'https://example.com/')).toBe(
            'https://example.com/claim-order?token=abc%2B%2F%3Dd'
        );
    });
});

describe('guest claim issuance', () => {
    let h: ReturnType<typeof claimsHarness>;

    beforeEach(() => { h = makeHarness(); });
    afterEach(() => { vi.doUnmock('@supabase/supabase-js'); });

    it('persists only the digest, never the raw token', async () => {
        const res = await createGuestOrderClaim({
            supabase: h.client, invoiceId: INVOICE, paymentIntentId: INTENT,
            email: EMAIL, productId: TIER, now: NOW,
        });

        const row = h.rows[0];
        expect(row.token_hash).toBe(hashClaimToken(res.token));
        expect(JSON.stringify(h.rows)).not.toContain(res.token);
        expect(row.status).toBe('pending');
        expect(row.email).toBe('guest@example.com');
        expect(row.product_id).toBe(TIER);
        expect(row.payment_intent_id).toBe(INTENT);
    });

    it('honours the 72 hour default TTL', async () => {
        await createGuestOrderClaim({
            supabase: h.client, invoiceId: INVOICE, email: EMAIL, productId: TIER, now: NOW,
        });
        const expected = new Date(NOW.getTime() + GUEST_CLAIM_TTL_HOURS * 3600_000).toISOString();
        expect(new Date(h.rows[0].expires_at).toISOString()).toBe(expected);
    });

    it('refuses to issue a claim with no email or no product', async () => {
        await expect(createGuestOrderClaim({
            supabase: h.client, invoiceId: INVOICE, email: '   ', productId: TIER, now: NOW,
        })).rejects.toThrow(/without a guest email/i);

        await expect(createGuestOrderClaim({
            supabase: h.client, invoiceId: INVOICE, email: EMAIL, productId: '', now: NOW,
        })).rejects.toThrow(/without a product id/i);
    });

    it('supersedes a prior pending claim so only one token is ever live', async () => {
        const first = await createGuestOrderClaim({
            supabase: h.client, invoiceId: INVOICE, email: EMAIL, productId: TIER, now: NOW,
        });
        const second = await createGuestOrderClaim({
            supabase: h.client, invoiceId: INVOICE, email: EMAIL, productId: TIER, now: NOW,
        });

        expect(second.token).not.toBe(first.token);
        expect(h.rows).toHaveLength(2);
        expect(h.rows.filter((r) => r.status === 'pending')).toHaveLength(1);
        expect(h.rows[0].status).toBe('revoked');

        // The revoked token must no longer redeem.
        const res = await redeemGuestOrderClaim({
            supabase: h.client, token: first.token,
            userId: 'user-1', userEmail: EMAIL, now: NOW,
        });
        expect(res).toEqual({ ok: false, code: 'expired' });
    });

    it('throws rather than reporting a claim that was never stored', async () => {
        h.setErrors({ insert: { message: 'guest_order_claims missing' } });
        await expect(createGuestOrderClaim({
            supabase: h.client, invoiceId: INVOICE, email: EMAIL, productId: TIER, now: NOW,
        })).rejects.toThrow(/guest_order_claims missing/);
    });
});

describe('guest claim redemption', () => {
    let h: ReturnType<typeof claimsHarness>;
    let token: string;

    const issue = () => createGuestOrderClaim({
        supabase: h.client, invoiceId: INVOICE, paymentIntentId: INTENT,
        email: EMAIL, productId: TIER, now: NOW,
    }).then((r) => { token = r.token; return r; });

    beforeEach(async () => { h = makeHarness(); await issue(); });

    it('rejects an unknown token without disclosing that it is unknown', async () => {
        const res = await redeemGuestOrderClaim({
            supabase: h.client, token: 'totally-made-up',
            userId: 'user-1', userEmail: EMAIL, now: NOW,
        });
        expect(res).toEqual({ ok: false, code: 'invalid_token' });
    });

    it('rejects missing token, user or email', async () => {
        expect(await redeemGuestOrderClaim({
            supabase: h.client, token: '', userId: 'u', userEmail: EMAIL, now: NOW,
        })).toEqual({ ok: false, code: 'invalid_token' });
        expect(await redeemGuestOrderClaim({
            supabase: h.client, token, userId: '', userEmail: EMAIL, now: NOW,
        })).toEqual({ ok: false, code: 'invalid_token' });
        expect(await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'u', userEmail: '', now: NOW,
        })).toEqual({ ok: false, code: 'invalid_token' });
    });

    it('rejects an EXPIRED token', async () => {
        const later = new Date(NOW.getTime() + GUEST_CLAIM_TTL_HOURS * 3600_000 + 1000);
        const res = await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'user-1', userEmail: EMAIL, now: later,
        });
        expect(res).toEqual({ ok: false, code: 'expired' });
        expect(h.rows[0].status).toBe('pending');
    });

    it('rejects a token that lapses between the pre-check and the CAS', async () => {
        // Simulate the race: the pre-check read sees a live claim, but the
        // conditional UPDATE additionally requires expires_at > now. A claim
        // whose expiry is exactly `now` must NOT be redeemable.
        const expiryBoundary = new Date(h.rows[0].expires_at);
        const res = await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'user-1', userEmail: EMAIL,
            now: new Date(expiryBoundary.getTime() + 1),
        });
        expect(res.ok).toBe(false);
    });

    it('binds redemption to the guest email, case-insensitively', async () => {
        const res = await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'user-1',
            userEmail: 'attacker@evil.test', now: NOW,
        });
        expect(res).toEqual({ ok: false, code: 'unauthorized' });
        // The claim must remain redeemable by its real owner.
        expect(h.rows[0].status).toBe('pending');

        const owner = await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'user-1',
            userEmail: '  GUEST@example.com  ', now: NOW,
        });
        expect(owner.ok).toBe(true);
    });

    it('rejects a revoked / expired claim', async () => {
        h.rows[0].status = 'revoked';
        expect(await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'u', userEmail: EMAIL, now: NOW,
        })).toEqual({ ok: false, code: 'expired' });

        h.rows[0].status = 'expired';
        expect(await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'u', userEmail: EMAIL, now: NOW,
        })).toEqual({ ok: false, code: 'expired' });
    });
});

describe('guest claim redemption is single-use (compare-and-swap)', () => {
    let h: ReturnType<typeof claimsHarness>;
    let token: string;
    let grantMock: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        h = makeHarness();
        grantMock = grantEntitlementMock;
        grantMock.mockReset();
        grantMock.mockResolvedValue({ entitlementId: 'ent-1' });
        ({ token } = await createGuestOrderClaim({
            supabase: h.client, invoiceId: INVOICE, paymentIntentId: INTENT,
            email: EMAIL, productId: TIER, now: NOW,
        }));
    });

    it('grants the entitlement against a REAL authenticated user id', async () => {
        const res = await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'real-user-uuid', userEmail: EMAIL, now: NOW,
        });

        expect(res).toEqual({
            ok: true, invoiceId: INVOICE, productId: TIER, entitlementId: 'ent-1',
        });
        expect(grantMock).toHaveBeenCalledTimes(1);
        const arg = grantMock.mock.calls[0][0];
        expect(arg.userId).toBe('real-user-uuid');
        expect(arg.productId).toBe(TIER);
        expect(arg.invoiceId).toBe(INVOICE);
        expect(arg.paymentIntentId).toBe(INTENT);
        expect(arg.metadata).toMatchObject({ source: 'guest_order_claim' });

        expect(h.rows[0].status).toBe('redeemed');
        expect(h.rows[0].redeemed_by).toBe('real-user-uuid');
        expect(h.rows[0].redeemed_at).toBe(NOW.toISOString());
    });

    it('refuses a SECOND redemption of the same token', async () => {
        const first = await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'real-user-uuid', userEmail: EMAIL, now: NOW,
        });
        expect(first.ok).toBe(true);

        const second = await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'real-user-uuid', userEmail: EMAIL, now: NOW,
        });
        expect(second).toEqual({ ok: false, code: 'already_redeemed' });
        // The entitlement must not be granted twice.
        expect(grantMock).toHaveBeenCalledTimes(1);
    });

    it('enforces the expiry predicate inside the conditional UPDATE', async () => {
        // Perform a real redemption so the CAS UPDATE is actually recorded.
        await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'real-user-uuid', userEmail: EMAIL, now: NOW,
        });

        const casUpdate = h.ops.find(
            (o) => o.op === 'update' && o.payload?.status === 'redeemed'
        );
        expect(casUpdate).toBeDefined();
        const predicates = casUpdate.stateRef.filters.map(([f, col]) => `${f}:${col}`);
        expect(predicates).toContain('eq:status');
        expect(predicates).toContain('eq:id');
        // The expiry guard must live in the CAS itself, not only in the pre-check.
        expect(predicates).toContain('gt:expires_at');
    });

    it('COMPENSATES the token when the entitlement grant fails, so the payer is not stranded', async () => {
        grantMock.mockRejectedValueOnce(new Error('entitlements unavailable'));

        const res = await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'real-user-uuid', userEmail: EMAIL, now: NOW,
        });
        expect(res).toEqual({ ok: false, code: 'grant_failed' });

        // Claim handed back to pending, with redemption fields cleared.
        expect(h.rows[0].status).toBe('pending');
        expect(h.rows[0].redeemed_by).toBeNull();
        expect(h.rows[0].redeemed_at).toBeNull();

        // And the guest can now actually complete their purchase.
        grantMock.mockResolvedValueOnce({ entitlementId: 'ent-2' });
        const retry = await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'real-user-uuid', userEmail: EMAIL, now: NOW,
        });
        expect(retry).toEqual({
            ok: true, invoiceId: INVOICE, productId: TIER, entitlementId: 'ent-2',
        });
    });

    it('surfaces a database read failure without leaking internals', async () => {
        h.setErrors({ update: { message: 'CAS failed' } });
        const res = await redeemGuestOrderClaim({
            supabase: h.client, token, userId: 'real-user-uuid', userEmail: EMAIL, now: NOW,
        });
        expect(res).toEqual({ ok: false, code: 'db_error' });
    });
});

describe('stale claim sweeper', () => {
    it('expires only claims whose TTL has elapsed', async () => {
        const h = makeHarness();
        await createGuestOrderClaim({
            supabase: h.client, invoiceId: 'inv-live', email: EMAIL, productId: TIER, now: NOW,
        });
        // Created 100h ago, so its 72h TTL lapsed 28h before NOW.
        await createGuestOrderClaim({
            supabase: h.client, invoiceId: 'inv-old', email: EMAIL, productId: TIER,
            now: new Date(NOW.getTime() - 100 * 3600_000),
        });

        const count = await expireStaleGuestClaims(h.client, NOW);
        expect(count).toBe(1);
        expect(h.rows.find((r) => r.invoice_id === 'inv-old')!.status).toBe('expired');
        expect(h.rows.find((r) => r.invoice_id === 'inv-live')!.status).toBe('pending');
    });
});
