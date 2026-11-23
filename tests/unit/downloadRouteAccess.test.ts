import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const h = vi.hoisted(() => ({
    client: null as unknown,
}));

vi.mock('@supabase/supabase-js', () => ({ createClient: () => h.client }));

import { GET } from '../../app/api/download/route';

type Entitlement = { product_id: string; status: string; metadata?: Record<string, unknown> | null };

interface ClientConfig {
    user?: { id: string } | null;
    authError?: { message: string } | null;
    entitlements?: Entitlement[];
    entitlementError?: { message: string } | null;
    profile?: { has_paid: boolean } | null;
    profileError?: { message: string } | null;
}

function makeClient(config: ClientConfig) {
    return {
        auth: {
            getUser: vi.fn(async () => {
                if (config.authError) return { data: { user: null }, error: config.authError };
                if (!config.user) return { data: { user: null }, error: { message: 'no user' } };
                return { data: { user: config.user }, error: null };
            }),
        },
        from(table: string) {
            if (table === 'entitlements') {
                const q: Record<string, unknown> = {
                    select: () => q,
                    eq: () => q,
                    then: (resolve: (value: unknown) => unknown) =>
                        Promise.resolve({
                            data: config.entitlementError ? null : (config.entitlements || []),
                            error: config.entitlementError || null,
                        }).then(resolve),
                };
                return q;
            }
            if (table === 'profiles') {
                const q: Record<string, unknown> = {
                    select: () => q,
                    eq: () => q,
                    maybeSingle: async () => ({
                        data: config.profile ?? null,
                        error: config.profileError || null,
                    }),
                };
                return q;
            }
            throw new Error(`Unexpected table in download test: ${table}`);
        },
    };
}

function request(query = '?file=ar', token: string | null = 'valid-token') {
    return new Request(`http://localhost/api/download${query}`, {
        method: 'GET',
        headers: token ? { authorization: `Bearer ${token}` } : {},
    });
}

const originalEnv = { ...process.env };

beforeEach(() => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-test-key';
});

afterEach(() => {
    process.env = { ...originalEnv };
});

describe('GET /api/download — authentication', () => {
    it('returns 401 without a bearer token', async () => {
        h.client = makeClient({ user: { id: 'u-1' } });
        const res = await GET(request('?file=ar', null));
        expect(res.status).toBe(401);
        expect((await res.json()).error).toBe('Authentication required');
    });

    it('returns 401 for an invalid or expired session', async () => {
        h.client = makeClient({ authError: { message: 'invalid token' } });
        const res = await GET(request());
        expect(res.status).toBe(401);
        expect((await res.json()).error).toBe('Invalid or expired session');
    });

    it('returns 400 for an unknown book file', async () => {
        h.client = makeClient({ user: { id: 'u-1' }, entitlements: [] });
        const res = await GET(request('?file=fr'));
        expect(res.status).toBe(400);
    });
});

describe('GET /api/download — entitlements are authoritative', () => {
    it('grants access from a matching product + language entitlement', async () => {
        h.client = makeClient({
            user: { id: 'u-1' },
            entitlements: [{ product_id: 'MRX-PROTOCOL', status: 'granted', metadata: { language: 'ar' } }],
            profile: { has_paid: false },
        });

        const res = await GET(request('?file=ar'));
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toBe('application/pdf');
        expect(res.headers.get('cache-control')).toContain('no-store');
    });

    it('denies the other language when the entitlement records one', async () => {
        h.client = makeClient({
            user: { id: 'u-1' },
            entitlements: [{ product_id: 'MRX-PROTOCOL', status: 'granted', metadata: { language: 'ar' } }],
            // has_paid must NOT override the recorded entitlement.
            profile: { has_paid: true },
        });

        const res = await GET(request('?file=en'));
        expect(res.status).toBe(403);
        expect((await res.json()).error).toContain('language');
    });

    it('allows both languages when the entitlement has no recorded language (legacy)', async () => {
        h.client = makeClient({
            user: { id: 'u-1' },
            entitlements: [{ product_id: 'MRX-TACTICAL', status: 'granted', metadata: {} }],
        });

        expect((await GET(request('?file=en'))).status).toBe(200);
    });

    it('accepts legacy tier-id entitlement rows', async () => {
        h.client = makeClient({
            user: { id: 'u-1' },
            entitlements: [{ product_id: 'digital', status: 'granted', metadata: { language: 'en' } }],
        });

        expect((await GET(request('?file=en'))).status).toBe(200);
    });

    it('denies access when entitlements exist but none grants the book (e.g. consultation only)', async () => {
        h.client = makeClient({
            user: { id: 'u-1' },
            entitlements: [{ product_id: 'MRX-CONSULTATION', status: 'granted', metadata: {} }],
            profile: { has_paid: true },
        });

        const res = await GET(request());
        expect(res.status).toBe(403);
        expect((await res.json()).error).toContain('No active book entitlement');
    });

    it('returns 500 when the entitlement read fails (fail closed)', async () => {
        h.client = makeClient({
            user: { id: 'u-1' },
            entitlementError: { message: 'boom' },
            profile: { has_paid: true },
        });

        const res = await GET(request());
        expect(res.status).toBe(500);
    });
});

describe('GET /api/download — legacy has_paid fallback', () => {
    it('falls back to profiles.has_paid only when no entitlement rows exist', async () => {
        h.client = makeClient({
            user: { id: 'u-1' },
            entitlements: [],
            profile: { has_paid: true },
        });

        expect((await GET(request('?file=ar'))).status).toBe(200);
    });

    it('returns 403 when there are no entitlements and has_paid is false', async () => {
        h.client = makeClient({
            user: { id: 'u-1' },
            entitlements: [],
            profile: { has_paid: false },
        });

        const res = await GET(request());
        expect(res.status).toBe(403);
        expect((await res.json()).error).toBe('Active subscription required for this download');
    });

    it('returns 403 when the profile is missing', async () => {
        h.client = makeClient({ user: { id: 'u-1' }, entitlements: [], profile: null });
        expect((await GET(request())).status).toBe(403);
    });
});
