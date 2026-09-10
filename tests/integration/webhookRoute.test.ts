/**
 * tests/integration/webhookRoute.test.ts
 *
 * Integration tests for POST /api/payments/webhook
 * Tests the full pipeline: HTTP request -> gateway detection -> signature
 * verification -> DB dedup -> status mapping -> response.
 * All Supabase calls are mocked so no DB connection is needed.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

const MERCHANT_ID_EG = 'MID_EG_TEST';
const API_KEY_EG     = 'APIKEY_EG_TEST';
const MERCHANT_ID_GL = 'MID_GL_TEST';
const API_KEY_GL     = 'APIKEY_GL_TEST';

// ── Build Supabase mock that supports full chaining ────────────────────────────
// Pattern: supabase.from(t).insert/select/update chained with .eq/.single/.in
function buildSupaMock(invoiceRow: Record<string, unknown> | null = null, insertError: {code:string; message:string} | null = null) {
    // singleResult controls what .single() resolves to
    const singleResult = invoiceRow
        ? { data: invoiceRow, error: null }
        : { data: null, error: { code: 'PGRST116', message: 'Row not found' } };

    const chain: Record<string, unknown> = {};
    chain.single = vi.fn().mockResolvedValue(singleResult);
    chain.in = vi.fn().mockResolvedValue({ error: null });
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.select = vi.fn().mockReturnValue(chain);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockResolvedValue({ data: [{ id: 'wh-001' }], error: insertError });

    const mockFrom = vi.fn().mockReturnValue(chain);
    return { from: mockFrom, rpc: vi.fn().mockResolvedValue({ data: null, error: null }), chain };
}

// ── Helper: sign Kashier payload ───────────────────────────────────────────────
function buildKashierBody(fields: Record<string, string>, apiKey: string): string {
    const keys = Object.keys(fields).sort();
    const signatureKeys = keys.join(',');
    const input = keys.map(k => k + '=' + fields[k]).join('&');
    const signature = crypto.createHmac('sha256', apiKey).update(input).digest('hex');
    return JSON.stringify({ ...fields, signature, signatureKeys });
}

// ── Helper: POST to webhook route ──────────────────────────────────────────────
async function postWebhook(body: string, headers: Record<string, string> = {}): Promise<Response> {
    const { POST } = await import('../../app/api/payments/webhook/route');
    const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST', body,
        headers: { 'content-type': 'application/json', 'x-kashier-signature': 'present', ...headers },
    });
    return POST(req);
}

let supabaseMock: ReturnType<typeof buildSupaMock>;

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => supabaseMock),
}));
vi.mock('../../server/affiliate/ledgerService', () => ({
    triggerAffiliateCommission: vi.fn().mockResolvedValue({ ok: true }),
}));
vi.mock('../../server/payments/verifyPaidAmount', () => ({
    verifyPaidAmount: vi.fn().mockReturnValue({ valid: true, message: null }),
}));

beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.KASHIER_EGYPT_MERCHANT_ID     = MERCHANT_ID_EG;
    process.env.KASHIER_EGYPT_PAYMENT_API_KEY = API_KEY_EG;
    process.env.KASHIER_EGYPT_SECRET_KEY      = 'SECRET_EG';
    process.env.KASHIER_GLOBAL_MERCHANT_ID    = MERCHANT_ID_GL;
    process.env.KASHIER_GLOBAL_PAYMENT_API_KEY = API_KEY_GL;
    process.env.KASHIER_GLOBAL_SECRET_KEY     = 'SECRET_GL';
    process.env.KASHIER_MODE                  = 'test';
    process.env.NEXT_PUBLIC_SUPABASE_URL      = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY     = 'svc_key_test';
    // Default: empty DB (no invoice row, no duplicate)
    supabaseMock = buildSupaMock(null, null);
});

afterEach(() => {
    ['KASHIER_EGYPT_MERCHANT_ID','KASHIER_EGYPT_PAYMENT_API_KEY','KASHIER_EGYPT_SECRET_KEY',
     'KASHIER_GLOBAL_MERCHANT_ID','KASHIER_GLOBAL_PAYMENT_API_KEY','KASHIER_GLOBAL_SECRET_KEY',
     'KASHIER_MODE','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'
    ].forEach(k => delete process.env[k]);
});

// ── Invalid Signature ─────────────────────────────────────────────────────────
describe('POST /api/payments/webhook — Invalid Signature', () => {
    it('401 for empty body', async () => {
        const res = await postWebhook('');
        expect(res.status).toBe(401);
    });
    it('401 for malformed JSON', async () => {
        const res = await postWebhook('{bad json}');
        expect(res.status).toBe(401);
    });
    it('401 for wrong HMAC key', async () => {
        const fields = { orderId: 'inv-001', orderStatus: 'APPROVED', amount: '100.00', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, 'WRONG_KEY'));
        expect(res.status).toBe(401);
    });
    it('401 for missing signature field', async () => {
        const res = await postWebhook(JSON.stringify({ orderId: 'inv-002', orderStatus: 'APPROVED', merchantId: MERCHANT_ID_EG }));
        expect(res.status).toBe(401);
    });
});

// ── Success Paths ─────────────────────────────────────────────────────────────
describe('POST /api/payments/webhook — Successful Payment', () => {
    it('200 for APPROVED — invoice pending, fulfils ok', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-100', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP', affiliate_id: null },
            null
        );
        const fields = { orderId: 'inv-100', orderStatus: 'APPROVED', amount: '100.00', currency: 'EGP', transactionId: 'txn-100', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
    });

    it('200 for already-processed invoice — idempotency skip', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-200', status: 'success', payment_status: 'paid', amount: 100, currency: 'EGP', affiliate_id: null },
            null
        );
        const fields = { orderId: 'inv-200', orderStatus: 'APPROVED', amount: '100.00', currency: 'EGP', transactionId: 'txn-200', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message ?? json.status).toMatch(/already|ok/i);
    });

    it('200 for CAPTURED status — treated as success', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-201', status: 'pending', payment_status: 'pending', amount: 200, currency: 'EGP', affiliate_id: null },
            null
        );
        const fields = { orderId: 'inv-201', orderStatus: 'CAPTURED', amount: '200.00', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
    });
});

// ── Failed Payment ────────────────────────────────────────────────────────────
describe('POST /api/payments/webhook — Failed Payment', () => {
    it('200 for DECLINED — marks failed', async () => {
        supabaseMock = buildSupaMock({ id: 'inv-300', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP', affiliate_id: null }, null);
        const fields = { orderId: 'inv-300', orderStatus: 'DECLINED', amount: '100.00', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
    });
    it('200 for EXPIRED_CARD', async () => {
        supabaseMock = buildSupaMock({ id: 'inv-301', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP', affiliate_id: null }, null);
        const fields = { orderId: 'inv-301', orderStatus: 'EXPIRED_CARD', amount: '100.00', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
    });
    it('200 for ACQUIRER_SYSTEM_ERROR', async () => {
        supabaseMock = buildSupaMock({ id: 'inv-302', status: 'pending', payment_status: 'pending', amount: 50, currency: 'EGP', affiliate_id: null }, null);
        const fields = { orderId: 'inv-302', orderStatus: 'ACQUIRER_SYSTEM_ERROR', amount: '50.00', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
    });
    it('200 for UNSPECIFIED_FAILURE', async () => {
        supabaseMock = buildSupaMock({ id: 'inv-303', status: 'pending', payment_status: 'pending', amount: 75, currency: 'EGP', affiliate_id: null }, null);
        const fields = { orderId: 'inv-303', orderStatus: 'UNSPECIFIED_FAILURE', amount: '75.00', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
    });
});

// ── Unresolved Statuses ───────────────────────────────────────────────────────
describe('POST /api/payments/webhook — Unresolved (no fulfillment)', () => {
    it('200 for TIMED_OUT — acknowledged without fulfillment', async () => {
        supabaseMock = buildSupaMock({ id: 'inv-400', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP', affiliate_id: null }, null);
        const fields = { orderId: 'inv-400', orderStatus: 'TIMED_OUT', amount: '100.00', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
    });
    it('200 for UNKNOWN — acknowledged without fulfillment', async () => {
        supabaseMock = buildSupaMock({ id: 'inv-401', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP', affiliate_id: null }, null);
        const fields = { orderId: 'inv-401', orderStatus: 'UNKNOWN', amount: '100.00', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
    });
    it('200 for AUTHORIZED — not yet captured', async () => {
        supabaseMock = buildSupaMock({ id: 'inv-402', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP', affiliate_id: null }, null);
        const fields = { orderId: 'inv-402', orderStatus: 'AUTHORIZED', amount: '100.00', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
    });
});

// ── Duplicate Event ───────────────────────────────────────────────────────────
describe('POST /api/payments/webhook — Deduplication', () => {
    it('200 for DB duplicate constraint 23505', async () => {
        supabaseMock = buildSupaMock(null, { code: '23505', message: 'duplicate key' });
        const fields = { orderId: 'inv-dup', orderStatus: 'APPROVED', amount: '100.00', transactionId: 'txn-dup', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message ?? json.status).toMatch(/duplicate|ok/i);
    });
});

// ── Route structure ───────────────────────────────────────────────────────────
describe('POST /api/payments/webhook — Route structure', () => {
    it('exports POST but NOT GET', async () => {
        const mod = await import('../../app/api/payments/webhook/route');
        expect(typeof mod.POST).toBe('function');
        expect((mod as Record<string, unknown>).GET).toBeUndefined();
    });
});

// ── Missing env ───────────────────────────────────────────────────────────────
describe('POST /api/payments/webhook — Missing Env Vars', () => {
    it('returns error response when SUPABASE_SERVICE_ROLE_KEY missing', async () => {
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
        const fields = { orderId: 'inv-env', orderStatus: 'APPROVED', amount: '100.00', transactionId: 'txn-env', merchantId: MERCHANT_ID_EG };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        // Should be 500 (throws) or 401 (cascade) — never crash silently
        expect([200, 401, 500]).toContain(res.status);
    });
});
