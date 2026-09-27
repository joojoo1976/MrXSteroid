/**
 * Gate 3 payment-link preflight — temporary admin diagnostic.
 *
 * Asserts the security posture the gate depends on: admin-only access,
 * read-only GET calls against Live, no database access, and a whitelisted
 * response that cannot carry a secret, customer PII, or an inferred PP.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('../../server/auth/require-admin', () => ({
    requireAdmin: vi.fn(),
}));

import { requireAdmin } from '../../server/auth/require-admin';
import { GET } from '../../app/api/admin/kashier/payment-link-preflight/route';

const mockedRequireAdmin = vi.mocked(requireAdmin);

const LIVE_SECRET = 'live-secret-must-never-leak';
const LIVE_MERCHANT = 'MID-9999-888';
const PL_IDS = [
    'PL-487616250298X',
    'PL-4876162503X55',
    'PL-4876162504F7E',
    'PL-4876162505ZQ7',
    'PL-48761625065D0',
    'PL-48761625075DP',
];

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

function req() {
    return new Request('https://mrxsteroid.vercel.app/api/admin/kashier/payment-link-preflight', {
        headers: { authorization: 'Bearer admin-token' },
    }) as any;
}

function upstream(body: unknown, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    } as unknown as Response;
}

function linkPayload(pl: string, overrides: Record<string, unknown> = {}) {
    return {
        paymentLinkId: pl,
        merchantId: LIVE_MERCHANT,
        merchantInfo: { storeName: 'MrXSteroid' },
        description: 'The Digital Protocol',
        invoiceItems: [{ description: 'Digital Protocol', quantity: '1', unitPrice: '499.00' }],
        totalAmount: '499.00',
        currency: 'EGP',
        state: 'published',
        paymentStatus: 'UNPAID',
        paymentType: 'simple',
        referenceId: 'digital-499',
        // PII that must never be relayed by the diagnostic.
        customerName: 'Confidential Customer',
        ...overrides,
    };
}

/** Serves one link payload per requested PL id. */
function mockLinks(overrides: (pl: string) => Record<string, unknown> = () => ({})) {
    return vi.fn(async (url: string) => {
        const pl = String(url).split('/').pop()!;
        return upstream({ body: linkPayload(pl, overrides(pl)) });
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    process.env.KASHIER_LIVE_SECRET_KEY = LIVE_SECRET;
    process.env.KASHIER_LIVE_MERCHANT_ID = LIVE_MERCHANT;
    mockedRequireAdmin.mockResolvedValue({ authorized: true, user: { id: 'admin-1' } } as any);
});

afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = { ...originalEnv };
});

describe('Gate 3 payment-link preflight', () => {
    it('rejects unauthenticated callers and contacts nothing', async () => {
        mockedRequireAdmin.mockResolvedValue({
            authorized: false,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        } as any);
        const fetchMock = vi.fn();
        globalThis.fetch = fetchMock as any;

        const res = await GET(req());

        expect(res.status).toBe(401);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('fails closed when Live credentials are not configured', async () => {
        delete process.env.KASHIER_LIVE_SECRET_KEY;
        const fetchMock = vi.fn();
        globalThis.fetch = fetchMock as any;

        const res = await GET(req());

        expect(res.status).toBe(503);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('issues one read-only GET per owner-supplied PL against the Live host', async () => {
        const fetchMock = mockLinks();
        globalThis.fetch = fetchMock as any;

        await GET(req());

        expect(fetchMock).toHaveBeenCalledTimes(PL_IDS.length);
        for (const [index, call] of fetchMock.mock.calls.entries()) {
            const [url, init] = call as [string, RequestInit];
            expect(url).toBe(`https://api.kashier.io/v2/payment-link/${PL_IDS[index]}`);
            expect(init.method).toBe('GET');
            expect((init.headers as Record<string, string>).Authorization).toBe(LIVE_SECRET);
        }
    });

    it('never issues a mutating request', async () => {
        const fetchMock = mockLinks();
        globalThis.fetch = fetchMock as any;

        await GET(req());

        const methods = fetchMock.mock.calls.map(([, init]) => (init as RequestInit).method);
        expect(new Set(methods)).toEqual(new Set(['GET']));
    });

    it('returns only whitelisted metadata and never leaks the secret or customer PII', async () => {
        globalThis.fetch = mockLinks() as any;

        const res = await GET(req());
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.readOnly).toBe(true);
        expect(body.results).toHaveLength(PL_IDS.length);

        const serialized = JSON.stringify(body);
        expect(serialized).not.toContain(LIVE_SECRET);
        expect(serialized).not.toContain('Confidential Customer');

        for (const entry of body.results) {
            expect(Object.keys(entry.link).sort()).toEqual([
                'amount', 'associatedPp', 'currency', 'dueDate', 'invoiceItems',
                'isPaymentLink', 'isSuspendedPayment', 'matchesLiveEgyptMerchant', 'name',
                'paymentMethods', 'paymentStatus', 'paymentType', 'pl', 'ppInferred',
                'referenceId', 'requestedPl', 'state', 'storeName', 'merchantId',
            ].sort());
        }
    });

    it('confirms the merchant identity without disclosing credential material', async () => {
        globalThis.fetch = mockLinks() as any;

        const body = await (await GET(req())).json();

        expect(body.summary.allMatchLiveEgyptMerchant).toBe(true);
        for (const entry of body.results) {
            expect(entry.link.merchantId).toBe(LIVE_MERCHANT);
            expect(entry.link.matchesLiveEgyptMerchant).toBe(true);
        }
    });

    it('flags a PL that belongs to a different merchant', async () => {
        globalThis.fetch = mockLinks((pl) =>
            pl === 'PL-4876162504F7E' ? { merchantId: 'MID-0000-000' } : {},
        ) as any;

        const body = await (await GET(req())).json();

        expect(body.summary.mismatchedMerchant).toBe(1);
        expect(body.summary.allMatchLiveEgyptMerchant).toBe(false);
        const flagged = body.results.find((r: any) => r.pl === 'PL-4876162504F7E');
        expect(flagged.link.matchesLiveEgyptMerchant).toBe(false);
    });

    it('never infers a PP association from the PL', async () => {
        globalThis.fetch = mockLinks() as any;

        const body = await (await GET(req())).json();

        for (const entry of body.results) {
            expect(entry.link.associatedPp).toBeNull();
            expect(entry.link.ppInferred).toBe(false);
        }
        expect(JSON.stringify(body)).not.toContain('PP-');
    });

    it('reports a PP only when Kashier explicitly returns one', async () => {
        globalThis.fetch = mockLinks((pl) =>
            pl === 'PL-487616250298X' ? { ppLink: 'PP-4876162501' } : {},
        ) as any;

        const body = await (await GET(req())).json();

        const explicit = body.results.find((r: any) => r.pl === 'PL-487616250298X');
        expect(explicit.link.associatedPp).toBe('PP-4876162501');
        const others = body.results.filter((r: any) => r.pl !== 'PL-487616250298X');
        for (const entry of others) expect(entry.link.associatedPp).toBeNull();
    });

    it('records a missing PL without leaking the raw upstream body', async () => {
        globalThis.fetch = vi.fn(async () =>
            upstream({ message: 'Payment link not found', key: 'paymentLinkSecretish' }, 404),
        ) as any;

        const body = await (await GET(req())).json();

        expect(body.summary.missing).toBe(PL_IDS.length);
        const serialized = JSON.stringify(body);
        expect(serialized).not.toContain('paymentLinkSecretish');
        for (const entry of body.results) {
            expect(entry.link).toBeNull();
            expect(entry.upstreamStatus).toBe(404);
            expect(entry.error.message).toContain('Payment link not found');
        }
    });

    it('reports a timeout instead of hanging', async () => {
        globalThis.fetch = vi.fn(async () => {
            const err = new Error('aborted');
            err.name = 'AbortError';
            throw err;
        }) as any;

        const body = await (await GET(req())).json();

        for (const entry of body.results) {
            expect(entry.error.message).toBe('Upstream request timed out');
            expect(entry.link).toBeNull();
        }
    });
});
