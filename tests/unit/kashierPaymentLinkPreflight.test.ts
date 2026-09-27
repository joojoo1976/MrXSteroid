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
        return upstream({ data: linkPayload(pl, overrides(pl)) });
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
                'amount', 'amountIsNumeric', 'associatedPp', 'currency', 'dueDate',
                'isPaymentLink', 'isSuspendedPayment', 'items', 'linkName',
                'matchesLiveEgyptMerchant', 'paymentMethods', 'paymentStatus',
                'paymentType', 'pl', 'ppInferred', 'product',
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

    it('reads the link out of the { data: {...} } envelope Kashier returns', async () => {
        globalThis.fetch = mockLinks() as any;

        const body = await (await GET(req())).json();

        // A regression guard: the envelope must be unwrapped, not read directly.
        expect(body.summary.unresolvedShape).toBe(0);
        expect(body.results.every((r: any) => r.shapeRecognized)).toBe(true);

        for (const entry of body.results) {
            expect(entry.link.merchantId).toBe(LIVE_MERCHANT);
            expect(entry.link.amount).toBe('499.00');
            expect(entry.link.currency).toBe('EGP');
            expect(entry.link.state).toBe('published');
            expect(entry.link.product).toBe('The Digital Protocol');
        }
    });

    it('reads a numeric totalAmount instead of reporting it absent', async () => {
        // Regression: a strict string check made JSON numbers read as null.
        globalThis.fetch = mockLinks(() => ({ totalAmount: 499, amount: undefined })) as any;

        const body = await (await GET(req())).json();

        for (const entry of body.results) {
            expect(entry.link.amount).toBe('499');
            expect(entry.link.amountIsNumeric).toBe(true);
        }
    });

    it('exposes the product and per-item amounts for owner comparison', async () => {
        globalThis.fetch = mockLinks(() => ({
            description: undefined,
            invoiceItems: [{ name: 'Digital Protocol', amount: 499, quantity: 1 }],
        })) as any;

        const body = await (await GET(req())).json();

        const first = body.results[0].link;
        expect(first.product).toBe('Digital Protocol');
        expect(first.items).toEqual([
            { name: 'Digital Protocol', amount: '499', quantity: '1', currency: null },
        ]);
    });

    it('rebuilds payment methods from primitive leaves and never echoes the raw value', async () => {
        globalThis.fetch = mockLinks(() => ({
            paymentMethods: {
                card: true,
                wallet: false,
                cash: true,
                // Non-primitive: must be walked, not returned.
                limits: { daily: 1000 },
                // Free-form text: not an enum, must be dropped.
                notes: 'card <script> & wallet',
                // Credential-shaped key: must never be emitted.
                customerEmail: 'buyer@example.com',
                apiKey: 'sk-live-should-never-appear',
            },
        })) as any;

        const body = await (await GET(req())).json();

        const methods = body.results[0].link.paymentMethods;
        expect(methods.card).toBe(true);
        expect(methods.wallet).toBe(false);
        expect(methods.cash).toBe(true);
        expect(methods.daily).toBe(1000);

        const serialized = JSON.stringify(body);
        expect(serialized).not.toContain('buyer@example.com');
        expect(serialized).not.toContain('sk-live-should-never-appear');
        expect(serialized).not.toContain('customerEmail');
        expect(serialized).not.toContain('apiKey');
    });

    it('reads a list-valued payment method configuration', async () => {
        globalThis.fetch = mockLinks(() => ({
            paymentMethods: ['card', 'wallet', { secret: 'nope' }, '<script>'],
        })) as any;

        const body = await (await GET(req())).json();

        expect(body.results[0].link.paymentMethods.paymentMethods).toEqual(['card', 'wallet']);
        expect(JSON.stringify(body)).not.toContain('nope');
    });

    it('surfaces paymentType and a string-form totalAmount', async () => {
        globalThis.fetch = mockLinks(() => ({
            paymentType: 'ONE_TIME',
            totalAmount: '499.00',
        })) as any;

        const body = await (await GET(req())).json();

        expect(body.results[0].link.paymentType).toBe('ONE_TIME');
        expect(body.results[0].link.amount).toBe('499.00');
        expect(body.results[0].link.amountIsNumeric).toBe(false);
    });

    it('reports the observed envelope and field types without disclosing values', async () => {
        globalThis.fetch = mockLinks() as any;

        const body = await (await GET(req())).json();

        expect(body.observedSchema.envelopeKeys).toEqual(['data']);
        expect(body.observedSchema.linkKeys).toContain('merchantId');
        expect(body.observedSchema.fieldTypes.merchantId).toBe('string');
        expect(body.observedSchema.fieldTypes.invoiceItems).toBe('array(1)');

        const serialized = JSON.stringify(body.observedSchema);
        expect(serialized).not.toContain(LIVE_MERCHANT);
        expect(serialized).not.toContain('The Digital Protocol');
        expect(serialized).not.toContain('499.00');
        expect(serialized).not.toContain('EGP');
    });

    it('accepts a list-style envelope and reads the nested merchant identity', async () => {
        const { merchantInfo: _dropped, ...withoutMerchantInfo } = linkPayload('PL-487616250298X');
        globalThis.fetch = vi.fn(async () => upstream({
            data: [{
                ...withoutMerchantInfo,
                merchant: { id: LIVE_MERCHANT, storeName: 'Nested Store' },
                merchantId: undefined,
            }],
        })) as any;

        const body = await (await GET(req())).json();

        const first = body.results[0];
        expect(first.shapeRecognized).toBe(true);
        expect(first.link.merchantId).toBe(LIVE_MERCHANT);
        expect(first.link.storeName).toBe('Nested Store');
        expect(first.link.matchesLiveEgyptMerchant).toBe(true);
    });

    it('flags an unrecognised shape instead of reporting a field of nulls', async () => {
        globalThis.fetch = vi.fn(async () => upstream({ data: { unexpected: true } })) as any;

        const body = await (await GET(req())).json();

        expect(body.summary.unresolvedShape).toBe(PL_IDS.length);
        expect(body.summary.mismatchedMerchant).toBe(0);
        expect(body.summary.allMatchLiveEgyptMerchant).toBe(false);
        for (const entry of body.results) {
            expect(entry.link).toBeNull();
            expect(entry.upstreamStatus).toBe(200);
        }
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
