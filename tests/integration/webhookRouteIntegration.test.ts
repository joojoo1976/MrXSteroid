// Validated for v5.1 compliance
// Integration test for POST /api/payments/webhook with dual-mode handler validation
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

const MERCHANT_ID_EG = 'MID_EG_INTEGRATION';
const API_KEY_EG = 'APIKEY_EG_INTEGRATION';
const MERCHANT_ID_GL = 'MID_GL_INTEGRATION';
const API_KEY_GL = 'APIKEY_GL_INTEGRATION';

const verifyPaidAmountMock = vi.fn().mockResolvedValue({ ok: true });

function buildKashierBody(fields: Record<string, string>, apiKey: string): string {
    const sortedKeys = Object.keys(fields).sort();
    const signatureKeysStr = sortedKeys.join(',');
    const input = sortedKeys.map(k => k + '=' + fields[k]).join('&');
    const signature = crypto.createHmac('sha256', apiKey).update(input).digest('hex');
    return JSON.stringify({ ...fields, signatureKeys: signatureKeysStr, signature });
}

async function postWebhook(body: string, headers: Record<string, string> = {}): Promise<Response> {
    const { POST } = await import('../../app/api/payments/webhook/route');
    const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        body,
        headers: { 'content-type': 'application/json', 'x-kashier-signature': 'present', ...headers },
    });
    return POST(req);
}

let supabaseMock: any;

function buildSupaMock(invoiceRow: Record<string, unknown> | null = null, insertError: any = null) {
    const singleResult = invoiceRow
        ? { data: invoiceRow, error: null }
        : { data: null, error: { code: 'PGRST116', message: 'Row not found' } };

    const chain: Record<string, any> = {};
    chain.single = vi.fn().mockResolvedValue(singleResult);
    chain.in = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.select = vi.fn().mockReturnValue(chain);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockResolvedValue({ data: [{ id: 'wh-001' }], error: insertError });
    chain.then = (resolve: any) => Promise.resolve({ data: invoiceRow, error: null }).then(resolve);

    const mockFrom = vi.fn().mockReturnValue(chain);
    return { from: mockFrom, rpc: vi.fn().mockResolvedValue({ data: null, error: null }), chain };
}

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => supabaseMock),
}));
vi.mock('../../server/affiliate/ledgerService', () => ({
    triggerAffiliateCommission: vi.fn().mockResolvedValue({ ok: true }),
}));
vi.mock('../../server/payments/verifyPaidAmount', () => ({
    verifyPaidAmount: verifyPaidAmountMock,
}));

beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doMock('../../server/affiliate/ledgerService', () => ({
        triggerAffiliateCommission: vi.fn().mockResolvedValue({ ok: true }),
    }));
    vi.doMock('../../server/payments/verifyPaidAmount', () => ({
        verifyPaidAmount: verifyPaidAmountMock,
    }));
    process.env.KASHIER_EGYPT_MERCHANT_ID = MERCHANT_ID_EG;
    process.env.KASHIER_EGYPT_PAYMENT_API_KEY = API_KEY_EG;
    process.env.KASHIER_EGYPT_SECRET_KEY = 'SECRET_EG_INTEGRATION';
    process.env.KASHIER_GLOBAL_MERCHANT_ID = MERCHANT_ID_GL;
    process.env.KASHIER_GLOBAL_PAYMENT_API_KEY = API_KEY_GL;
    process.env.KASHIER_GLOBAL_SECRET_KEY = 'SECRET_GL_INTEGRATION';
    process.env.KASHIER_MODE = 'test';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc_key_test';
    supabaseMock = buildSupaMock(null, null);
});

afterEach(() => {
    ['KASHIER_EGYPT_MERCHANT_ID','KASHIER_EGYPT_PAYMENT_API_KEY','KASHIER_EGYPT_SECRET_KEY',
     'KASHIER_GLOBAL_MERCHANT_ID','KASHIER_GLOBAL_PAYMENT_API_KEY','KASHIER_GLOBAL_SECRET_KEY',
     'KASHIER_MODE','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'
    ].forEach(k => delete process.env[k]);
});

describe('Integration test for /api/payments/webhook (v5.1 compliance)', () => {
    it('Validates empty body returns 401 (non-blocking, fast response)', async () => {
        const res = await postWebhook('');
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.error).toMatch(/Invalid webhook signature|Empty webhook body/);
    });

    it('Validates malformed JSON returns 401 (non-blocking, fast response)', async () => {
        const res = await postWebhook('{bad json}');
        expect(res.status).toBe(401);
    });

    it('Validates valid signature passes verification and processes payment', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-001', status: 'pending', payment_status: 'pending', amount: 500, currency: 'EGP', user_id: 'user-001', tier_id: 'pro', affiliate_id: null },
            null
        );

        const fields = {
            orderId: 'inv-int-001',
            orderStatus: 'APPROVED',
            amount: '500.00',
            currency: 'EGP',
            transactionId: 'txn-int-001',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        expect(supabaseMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'success', payment_status: 'paid' })
        );
    });

    it('Processes failed payment (declined) with correct accounting', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-002', status: 'pending', payment_status: 'pending', amount: 300, currency: 'EGP', user_id: 'user-002', tier_id: 'basic', affiliate_id: null },
            null
        );

        const fields = {
            orderId: 'inv-int-002',
            orderStatus: 'DECLINED',
            amount: '300.00',
            currency: 'EGP',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        expect(supabaseMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'failed', payment_status: 'failed' })
        );
    });

    it('Handles unresolved status (TIMED_OUT) without financial mutation', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-003', status: 'pending', payment_status: 'pending', amount: 200, currency: 'EGP' },
            null
        );

        const fields = {
            orderId: 'inv-int-003',
            orderStatus: 'TIMED_OUT',
            amount: '200.00',
            currency: 'EGP',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toContain('pending reconciliation');
        expect(supabaseMock.chain.update).not.toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
    });

    it('Validates cross-account routing (EGYPT -> GLOBAL) by merchantId', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-004', status: 'pending', payment_status: 'pending', amount: 100, currency: 'USD', user_id: 'user-004', tier_id: 'enterprise', affiliate_id: null },
            null
        );

        const fields = {
            orderId: 'inv-int-004',
            orderStatus: 'APPROVED',
            amount: '100.00',
            currency: 'USD',
            merchantId: MERCHANT_ID_GL,
            transactionId: 'txn-int-004',
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_GL));
        expect(res.status).toBe(200);
        expect(supabaseMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'success', payment_status: 'paid' })
        );
    });

    it('Rejects payment with merchantId mismatch (EGYPT key vs GLOBAL id)', async () => {
        const fields = {
            orderId: 'inv-int-005',
            orderStatus: 'APPROVED',
            amount: '100.00',
            currency: 'EGP',
            merchantId: MERCHANT_ID_GL,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(401);
    });

    it('Processes idempotent duplicate event (DB unique constraint) without re-triggering fulfillment', async () => {
        supabaseMock = buildSupaMock(null, { code: '23505', message: 'duplicate' });

        const fields = {
            orderId: 'inv-int-006',
            orderStatus: 'APPROVED',
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'txn-int-006',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toMatch(/duplicate|ok/i);
        expect(supabaseMock.chain.update).not.toHaveBeenCalledWith(
            expect.objectContaining({ status: 'success', payment_status: 'paid' })
        );
    });

    it('Processes webhook with reconciliation verdict mismatch (SUCCESS vs FAILED)', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-007', status: 'pending', payment_status: 'pending', amount: 200, currency: 'EGP' },
            null
        );

        const fields = {
            orderId: 'inv-int-007',
            orderStatus: 'APPROVED',
            reconcilation: 'FAILED',
            amount: '200.00',
            currency: 'EGP',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toContain('pending reconciliation');
        expect(supabaseMock.chain.update).not.toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
    });

    it('Returns 405 for HTTP GET method (v5.1 compliance)', async () => {
        const handler = (await import('../../server/payments/webhook')).default;
        const getReq = new Request('http://localhost/api/payments/webhook', { method: 'GET' });
        const res = await handler(getReq);
        expect(res?.status).toBe(405);
    });

    it('Processes REFUNDED webhook — invoice marked failed (refund lifecycle)', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-008', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP' },
            null
        );

        const fields = {
            orderId: 'inv-int-008',
            orderStatus: 'REFUNDED',
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'txn-int-008',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        expect(supabaseMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'failed', payment_status: 'failed' })
        );
    });

    it('Processes VOIDED webhook — invoice marked failed', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-009', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP' },
            null
        );

        const fields = {
            orderId: 'inv-int-009',
            orderStatus: 'VOIDED',
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'txn-int-009',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        expect(supabaseMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'failed', payment_status: 'failed' })
        );
    });

    it('Processes EXPIRED_CARD webhook — invoice marked failed', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-010', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP' },
            null
        );

        const fields = {
            orderId: 'inv-int-010',
            orderStatus: 'EXPIRED_CARD',
            amount: '100.00',
            currency: 'EGP',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        expect(supabaseMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'failed', payment_status: 'failed' })
        );
    });

    it('Does NOT fulfill on AUTHORIZED (pending) — held for reconciliation', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-011', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP' },
            null
        );

        const fields = {
            orderId: 'inv-int-011',
            orderStatus: 'AUTHORIZED',
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'txn-int-011',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toContain('pending reconciliation');
        expect(supabaseMock.chain.update).not.toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
    });

    it('Activates payment when success is signalled by responseCode 00 alone', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-012', status: 'pending', payment_status: 'pending', amount: 150, currency: 'EGP', user_id: 'user-012', tier_id: 'pro', affiliate_id: null },
            null
        );

        const fields = {
            orderId: 'inv-int-012',
            transactionResponseCode: '00',
            amount: '150.00',
            currency: 'EGP',
            transactionId: 'txn-int-012',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        expect(supabaseMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'success', payment_status: 'paid' })
        );
    });

    it('Refuses activation on amount mismatch (defense-in-depth, no fulfillment)', async () => {
        verifyPaidAmountMock.mockResolvedValueOnce({ ok: false });
        supabaseMock = buildSupaMock(
            { id: 'inv-int-013', status: 'pending', payment_status: 'pending', amount: 200, currency: 'EGP' },
            null
        );

        const fields = {
            orderId: 'inv-int-013',
            orderStatus: 'APPROVED',
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'txn-int-013',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toContain('Amount mismatch');
        expect(supabaseMock.chain.update).not.toHaveBeenCalledWith(
            expect.objectContaining({ status: 'success', payment_status: 'paid' })
        );
        expect(supabaseMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'failed', payment_status: 'failed' })
        );
    });

    it('Continues processing when webhook_events insert fails with a NON-duplicate error (best-effort dedup)', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-014', status: 'pending', payment_status: 'pending', amount: 120, currency: 'EGP', user_id: 'user-014', tier_id: 'basic', affiliate_id: null },
            { code: '23502', message: 'not null violation' }
        );

        const fields = {
            orderId: 'inv-int-014',
            orderStatus: 'APPROVED',
            amount: '120.00',
            currency: 'EGP',
            transactionId: 'txn-int-014',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        expect(supabaseMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'success', payment_status: 'paid' })
        );
    });

    it('Tags invoice source as payment page when webhook originated from the Kashier payment page', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-015', status: 'pending', payment_status: 'pending', amount: 90, currency: 'EGP', user_id: 'user-015', tier_id: 'pro', affiliate_id: null },
            null
        );

        const fields = {
            orderId: 'inv-int-015',
            orderStatus: 'APPROVED',
            amount: '90.00',
            currency: 'EGP',
            transactionId: 'txn-int-015',
            merchantId: MERCHANT_ID_EG,
            source: 'kashier_payment_page',
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        expect(supabaseMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'success', payment_status: 'paid', payment_source: 'kashier_payment_page' })
        );
    });

    it('Persists kashier_transaction_id and gateway_reference_id on success', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-016', status: 'pending', payment_status: 'pending', amount: 80, currency: 'EGP', user_id: 'user-016', tier_id: 'basic', affiliate_id: null },
            null
        );

        const fields = {
            orderId: 'inv-int-016',
            orderStatus: 'APPROVED',
            amount: '80.00',
            currency: 'EGP',
            transactionId: 'kashier-txn-016',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        expect(supabaseMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ gateway_reference_id: 'kashier-txn-016', kashier_transaction_id: 'kashier-txn-016' })
        );
    });

    it('Idempotently skips an already-paid invoice (invoice-level dedup) without re-triggering fulfillment', async () => {
        supabaseMock = buildSupaMock(
            { id: 'inv-int-017', status: 'success', payment_status: 'paid', amount: 70, currency: 'EGP' },
            null
        );

        const fields = {
            orderId: 'inv-int-017',
            orderStatus: 'APPROVED',
            amount: '70.00',
            currency: 'EGP',
            transactionId: 'txn-int-017',
            merchantId: MERCHANT_ID_EG,
        };
        const res = await postWebhook(buildKashierBody(fields, API_KEY_EG));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toContain('Already processed');
        // The already-paid invoice row must NOT be rewritten to success again.
        expect(supabaseMock.chain.update).not.toHaveBeenCalledWith(
            expect.objectContaining({ payment_source: expect.anything() })
        );
    });
});
