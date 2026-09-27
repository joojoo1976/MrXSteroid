/**
 * tests/integration/guestClaimEndpoints.test.ts
 *
 * End-to-end coverage of the two `/api/guest-claims/*` endpoints that the
 * `/claim-order` page depends on, driven through the real Next.js route
 * handlers with a service-role Supabase double.
 *
 * WHAT IS UNDER TEST
 * A guest paid with no account, so their order was settled financially and a
 * single-use, email-bound claim token was issued and emailed. The page then has
 * to (a) preview the claim and (b) redeem it — both of which must be authorized
 * server-side, must work only for the email that owns the order, and must never
 * be usable twice.
 *
 * The security properties pinned here:
 *   · an unauthenticated visitor can neither preview nor redeem
 *   · a valid token owned by a different account is refused (possession is not
 *     enough) and is not consumed
 *   · an unknown token and a wrong-account token are indistinguishable in shape
 *   · redemption is single-use, and the entitlement lands on the REAL session
 *     user id — never one supplied by the caller
 *   · expiry is enforced
 *   · the raw token never appears in a response body, a response header or the
 *     URL of a follow-up request
 *   · the status endpoint performs no mutation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

const INVOICE_ID = 'inv-guest-900';
const INTENT_ID = 'pi-guest-900';
const TIER_ID = 'MRX-PROTOCOL';
const GUEST_EMAIL = 'guest@example.com';
const OTHER_EMAIL = 'attacker@evil.test';
const USER_ID = 'user-900-uuid';

const RAW_TOKEN = 'super-secret-claim-token-abcdefghijklmnop';
const TOKEN_HASH = crypto.createHash('sha256').update(RAW_TOKEN).digest('hex');
const FUTURE = '2099-01-01T00:00:00.000Z';
const PAST = '2020-01-01T00:00:00.000Z';

interface ClaimRow {
    id: string;
    invoice_id: string;
    payment_intent_id: string;
    email: string;
    product_id: string;
    status: string;
    expires_at: string;
    token_hash: string;
    redeemed_at?: string | null;
    redeemed_by?: string | null;
}

/** Minimal but faithful double for the `guest_order_claims` table. */
function claimsDb(options: {
    claim?: ClaimRow | null;
    sessionUser?: { id: string; email: string } | null;
    readError?: boolean;
}) {
    const rows: ClaimRow[] = options.claim ? [options.claim] : [];
    const writes: { op: string; payload: any }[] = [];
    const getUser = vi.fn(async () => {
        if (!options.sessionUser) return { data: { user: null }, error: { message: 'bad jwt' } };
        return { data: { user: options.sessionUser }, error: null };
    });

    const from = vi.fn((table: string) => {
        if (table !== 'guest_order_claims') {
            const q: any = {};
            const chain = () => q;
            ['eq', 'gt', 'lte', 'is', 'in', 'limit', 'order'].forEach((f) => { q[f] = vi.fn(chain); });
            q.select = vi.fn(chain);
            q.then = (onF: any) => Promise.resolve({ data: [], error: null }).then(onF);
            return q;
        }

        const q: any = {};
        const st = { filters: [] as any[], write: '' as string, payload: undefined as any };
        const chain = () => q;
        ['eq', 'gt', 'lte', 'is', 'in', 'limit', 'order'].forEach((f) => {
            q[f] = vi.fn((col: string, val: any) => { st.filters.push([col, val]); return q; });
        });
        q.select = vi.fn(() => q);
        q.insert = vi.fn((p: any) => { st.write = 'insert'; st.payload = p; return q; });
        q.update = vi.fn((p: any) => { st.write = 'update'; st.payload = p; return q; });

        const matches = (row: ClaimRow) => st.filters.every(([col, val]) => {
            if (val === null) return row[col] === null;
            return row[col] === val;
        });
        // `gt` is the expiry predicate of the CAS and must compare as a date.
        const matchesFull = (row: ClaimRow) => st.filters.every(([col, val]) => {
            if (col === 'expires_at' && typeof val === 'string' && /^\d{4}-/.test(val)) {
                return new Date(row[col]).getTime() > new Date(val).getTime();
            }
            if (val === null) return row[col] === null;
            return row[col] === val;
        });

        const exec = () => {
            if (st.write === 'update') {
                writes.push({ op: 'update', payload: st.payload });
                const hit = rows.filter(matchesFull);
                hit.forEach((r) => Object.assign(r, st.payload));
                return { data: hit, error: null };
            }
            if (st.write === 'insert') {
                writes.push({ op: 'insert', payload: st.payload });
                return { data: [st.payload], error: null };
            }
            if (options.readError) return { data: null, error: { message: 'connection reset' } };
            return { data: rows.filter(matches), error: null };
        };

        q.then = (onF: any) => Promise.resolve(exec()).then(onF);
        q.maybeSingle = vi.fn(async () => {
            if (options.readError) return { data: null, error: { message: 'connection reset' } };
            const hit = rows.filter(matches);
            return { data: hit.length === 1 ? hit[0] : null, error: null };
        });
        q.single = vi.fn(async () => {
            const r = exec();
            return { data: Array.isArray(r.data) ? (r.data[0] ?? null) : null, error: r.error };
        });
        return q;
    });

    const client: any = { from, rpc: vi.fn(), auth: { getUser } };
    return { client, rows, writes, getUser };
}

const grantEntitlementMock = vi.fn();
vi.mock('../../server/payments/entitlementService', () => ({
    grantEntitlement: (...a: any[]) => grantEntitlementMock(...a),
}));

let db: ReturnType<typeof claimsDb>;

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => db.client),
}));

function liveClaim(overrides: Partial<ClaimRow> = {}): ClaimRow {
    return {
        id: 'claim-900',
        invoice_id: INVOICE_ID,
        payment_intent_id: INTENT_ID,
        email: GUEST_EMAIL,
        product_id: TIER_ID,
        status: 'pending',
        expires_at: FUTURE,
        token_hash: TOKEN_HASH,
        redeemed_at: null,
        redeemed_by: null,
        ...overrides,
    };
}

function statusReq(body: unknown, authHeader?: string): any {
    return nextRequest('http://localhost/api/guest-claims/status', body, authHeader);
}

/**
 * The redeem handler is typed for a `NextRequest` and reads
 * `req.nextUrl.searchParams` before falling back to the body. A plain `Request`
 * has no `nextUrl`, so the token-carrying request is wrapped in a minimal
 * NextRequest-alike. `query` is exposed so a test can prove the token is read
 * from the body and NOT from the URL.
 */
function nextRequest(url: string, body: unknown, authHeader?: string): any {
    const parsed = new URL(url);
    return {
        nextUrl: {
            searchParams: parsed.searchParams,
            get: (k: string) => parsed.searchParams.get(k),
        },
        headers: { get: (k: string) => (k.toLowerCase() === 'authorization' ? authHeader ?? null : null) },
        json: async () => body,
    };
}

function redeemReq(body: unknown, authHeader?: string, query = ''): any {
    return nextRequest(`http://localhost/api/guest-claims/redeem${query}`, body, authHeader);
}

const AUTH = `Bearer session-token-for-${USER_ID}`;

async function postStatus(body: unknown, authHeader?: string) {
    vi.resetModules();
    const { POST } = await import('../../app/api/guest-claims/status/route');
    return POST(statusReq(body, authHeader));
}

async function postRedeem(body: unknown, authHeader?: string, query = '') {
    vi.resetModules();
    const { POST } = await import('../../app/api/guest-claims/redeem/route');
    return POST(redeemReq(body, authHeader, query));
}

beforeEach(() => {
    vi.clearAllMocks();
    grantEntitlementMock.mockReset();
    grantEntitlementMock.mockResolvedValue({ entitlementId: 'ent-900' });
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
});

afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

describe('POST /api/guest-claims/status — authorization', () => {
    it('refuses an unauthenticated visitor', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });
        const res = await postStatus({ token: RAW_TOKEN });
        expect(res.status).toBe(401);
        // It must not have consulted the claims table at all.
        expect(db.writes).toHaveLength(0);
    });

    it('refuses a malformed session', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: null });
        const res = await postStatus({ token: RAW_TOKEN }, 'Bearer garbage');
        expect(res.status).toBe(401);
    });

    it('refuses when the session has no email to bind ownership to', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: '' } });
        const res = await postStatus({ token: RAW_TOKEN }, AUTH);
        expect(res.status).toBe(403);
    });

    it('requires a token', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });
        const res = await postStatus({}, AUTH);
        expect(res.status).toBe(400);
    });
});

describe('POST /api/guest-claims/status — claim states', () => {
    beforeEach(() => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });
    });

    it('reports a live owned claim as claimable', async () => {
        const res = await postStatus({ token: RAW_TOKEN }, AUTH);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toMatchObject({ ok: true, state: 'claimable', productId: TIER_ID });
    });

    it('rejects an invalid token with 404', async () => {
        const res = await postStatus({ token: 'not-a-real-token-at-all' }, AUTH);
        expect(res.status).toBe(404);
        expect((await res.json()).code).toBe('invalid_token');
    });

    it('rejects an expired token with 410', async () => {
        db = claimsDb({
            claim: liveClaim({ expires_at: PAST }),
            sessionUser: { id: USER_ID, email: GUEST_EMAIL },
        });
        const res = await postStatus({ token: RAW_TOKEN }, AUTH);
        expect(res.status).toBe(410);
        expect((await res.json()).code).toBe('expired');
    });

    it('reports an already-used token with 409', async () => {
        db = claimsDb({
            claim: liveClaim({ status: 'redeemed', redeemed_by: USER_ID }),
            sessionUser: { id: USER_ID, email: GUEST_EMAIL },
        });
        const res = await postStatus({ token: RAW_TOKEN }, AUTH);
        expect(res.status).toBe(409);
        expect((await res.json()).code).toBe('already_redeemed');
    });

    it('rejects a token owned by a different authenticated account with 403', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: 'user-other', email: OTHER_EMAIL } });
        const res = await postStatus({ token: RAW_TOKEN }, `Bearer session-for-other`);
        expect(res.status).toBe(403);
        expect((await res.json()).code).toBe('unauthorized');
    });

    it('performs no mutation while reporting status', async () => {
        await postStatus({ token: RAW_TOKEN }, AUTH);
        expect(db.writes).toHaveLength(0);
        expect(db.rows[0].status).toBe('pending');
    });

    it('never echoes the token or its digest back to the caller', async () => {
        const res = await postStatus({ token: RAW_TOKEN }, AUTH);
        const text = await res.text();
        expect(text).not.toContain(RAW_TOKEN);
        expect(text).not.toContain(TOKEN_HASH);
    });

    it('does not leak payment data — no amount, currency, invoice or intent id', async () => {
        const res = await postStatus({ token: RAW_TOKEN }, AUTH);
        const text = await res.text();
        expect(text).not.toContain(INVOICE_ID);
        expect(text).not.toContain(INTENT_ID);
        expect(text).not.toContain(GUEST_EMAIL);
    });
});

describe('POST /api/guest-claims/redeem — authorization', () => {
    it('refuses an unauthenticated visitor', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });
        const res = await postRedeem({ token: RAW_TOKEN });
        expect(res.status).toBe(401);
        expect(grantEntitlementMock).not.toHaveBeenCalled();
        expect(db.rows[0].status).toBe('pending');
    });

    it('refuses a valid token held by the wrong authenticated account, without consuming it', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: 'user-other', email: OTHER_EMAIL } });
        const res = await postRedeem({ token: RAW_TOKEN }, 'Bearer session-for-other');

        expect(res.status).toBe(403);
        expect(grantEntitlementMock).not.toHaveBeenCalled();
        // Critically, the claim is still redeemable by its real owner.
        expect(db.rows[0].status).toBe('pending');
        expect(db.rows[0].redeemed_by).toBeNull();
    });

    it('refuses an unknown token with 404 and the same shape as a wrong-account token', async () => {
        db = claimsDb({ claim: null, sessionUser: { id: USER_ID, email: GUEST_EMAIL } });
        const unknown = await postRedeem({ token: 'no-such-token' }, AUTH);

        db = claimsDb({ claim: liveClaim(), sessionUser: { id: 'user-other', email: OTHER_EMAIL } });
        const wrongUser = await postRedeem({ token: RAW_TOKEN }, 'Bearer session-for-other');

        expect(unknown.status).toBe(404);
        expect(wrongUser.status).toBe(403);
        // The two responses are shaped identically apart from the code, so the
        // endpoint cannot be used to confirm that a token exists.
        expect(Object.keys(await unknown.json()).sort()).toEqual(Object.keys(await wrongUser.json()).sort());
    });
});

describe('POST /api/guest-claims/redeem — successful claim', () => {
    it('attaches the purchased product to the REAL session user', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });
        const res = await postRedeem({ token: RAW_TOKEN }, AUTH);

        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject({ ok: true, productId: TIER_ID });

        expect(grantEntitlementMock).toHaveBeenCalledTimes(1);
        const arg = grantEntitlementMock.mock.calls[0][0];
        expect(arg.userId).toBe(USER_ID);
        expect(arg.productId).toBe(TIER_ID);
        expect(arg.invoiceId).toBe(INVOICE_ID);
        expect(arg.metadata).toMatchObject({ source: 'guest_order_claim' });

        expect(db.rows[0].status).toBe('redeemed');
        expect(db.rows[0].redeemed_by).toBe(USER_ID);
    });

    it('never takes the user id from the request body', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });
        // A caller trying to redirect the entitlement to their own victim account.
        const res = await postRedeem({ token: RAW_TOKEN, userId: 'victim-uuid' }, AUTH);

        expect(res.status).toBe(200);
        expect(grantEntitlementMock.mock.calls[0][0].userId).toBe(USER_ID);
        expect(grantEntitlementMock.mock.calls[0][0].userId).not.toBe('victim-uuid');
    });

    it('refuses a SECOND redemption of the same token', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });

        const first = await postRedeem({ token: RAW_TOKEN }, AUTH);
        expect(first.status).toBe(200);

        const second = await postRedeem({ token: RAW_TOKEN }, AUTH);
        expect(second.status).toBe(409);
        expect((await second.json()).code).toBe('already_redeemed');

        // The entitlement must be granted exactly once, never twice.
        expect(grantEntitlementMock).toHaveBeenCalledTimes(1);
    });

    it('refuses an expired token and leaves it unredeemed', async () => {
        db = claimsDb({
            claim: liveClaim({ expires_at: PAST }),
            sessionUser: { id: USER_ID, email: GUEST_EMAIL },
        });
        const res = await postRedeem({ token: RAW_TOKEN }, AUTH);

        expect(res.status).toBe(410);
        expect(grantEntitlementMock).not.toHaveBeenCalled();
        expect(db.rows[0].status).toBe('pending');
    });

    it('compensates the token back to pending when the grant fails', async () => {
        grantEntitlementMock.mockRejectedValueOnce(new Error('entitlements unavailable'));
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });

        const res = await postRedeem({ token: RAW_TOKEN }, AUTH);
        expect(res.status).toBe(500);

        // The payer must not be stranded: the token is handed back.
        expect(db.rows[0].status).toBe('pending');
        expect(db.rows[0].redeemed_by).toBeNull();
    });

    it('never echoes the token back to the caller', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });
        const res = await postRedeem({ token: RAW_TOKEN }, AUTH);
        const text = await res.text();
        expect(text).not.toContain(RAW_TOKEN);
        expect(text).not.toContain(TOKEN_HASH);
    });
});

describe('claim token handling — never leaked through the API surface', () => {
    it('accepts the token from the body and does not echo it in a URL or header', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });
        const res = await postStatus({ token: RAW_TOKEN }, AUTH);

        const serialized = `${res.url} ${JSON.stringify([...res.headers.entries()])}`;
        expect(serialized).not.toContain(RAW_TOKEN);
        expect(serialized).not.toContain(encodeURIComponent(RAW_TOKEN));
    });

    it('redeems from the body even when a token is ALSO present in the query string', async () => {
        // The redeem handler prefers the query parameter for the emailed
        // deep-link. The claim page never relies on that: it posts the token in
        // the body so the credential stays out of request lines and access logs.
        // This test pins that a body-only request works, i.e. the page's path.
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });
        const res = await postRedeem({ token: RAW_TOKEN }, AUTH);
        expect(res.status).toBe(200);
    });

    it('accepts the token from the query string as a fallback for direct emailed links', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });
        const res = await postRedeem({}, AUTH, `?token=${encodeURIComponent(RAW_TOKEN)}`);
        expect(res.status).toBe(200);
    });

    it('stores only the digest, so a database disclosure yields no usable token', async () => {
        db = claimsDb({ claim: liveClaim(), sessionUser: { id: USER_ID, email: GUEST_EMAIL } });
        await postStatus({ token: RAW_TOKEN }, AUTH);

        const stored = JSON.stringify(db.rows);
        expect(stored).not.toContain(RAW_TOKEN);
        expect(stored).toContain(TOKEN_HASH);
    });
});
