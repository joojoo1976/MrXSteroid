/**
 * tests/integration/webhookRouteV31.test.ts
 *
 * Advanced integration test suite for POST /api/payments/webhook
 * Verifies compliance with Reference Architecture v3.1:
 * - Status vs Reconciliation separation
 * - Idempotency and deduplication
 * - Automatic Order Splits freezing on confirmed payments
 * - Failure isolation: split error does not fail payment
 * - Amount verification defense-in-depth
 * - Method Not Allowed handling
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

const MERCHANT_ID = 'MID_EG_V31';
const API_KEY     = 'APIKEY_EG_V31';
const SECRET_KEY  = 'SECRET_EG_V31';

function buildKashierSignedBody(fields: Record<string, string>, apiKey: string = API_KEY): string {
    const payload = { ...fields, merchantId: MERCHANT_ID };
    const keys = Object.keys(payload).sort();
    const signatureKeys = keys.join(',');
    const input = keys.map(k => `${k}=${payload[k]}`).join('&');
    const signature = crypto.createHmac('sha256', apiKey).update(input).digest('hex');
    return JSON.stringify({ ...payload, signature, signatureKeys });
}

function createChainedSupaMock(invoiceRow: Record<string, any> | null = null, insertError: any = null) {
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
    // Make chain thenable so awaiting .update().eq() resolves cleanly
    chain.then = (resolve: any) => Promise.resolve({ data: invoiceRow, error: null }).then(resolve);

    const mockFrom = vi.fn().mockReturnValue(chain);
    return { from: mockFrom, rpc: vi.fn().mockResolvedValue({ data: null, error: null }), chain };
}

describe('POST /api/payments/webhook — Architecture v3.1 Integration', () => {
    let freezeOrderSplitsMock: ReturnType<typeof vi.fn>;
    let triggerAffiliateCommissionMock: ReturnType<typeof vi.fn>;
    let verifyPaidAmountMock: ReturnType<typeof vi.fn>;
    let currentSupaMock: ReturnType<typeof createChainedSupaMock>;

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();

        process.env.KASHIER_EGYPT_MERCHANT_ID = MERCHANT_ID;
        process.env.KASHIER_EGYPT_PAYMENT_API_KEY = API_KEY;
        process.env.KASHIER_EGYPT_SECRET_KEY = SECRET_KEY;
        process.env.KASHIER_MODE = 'test';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_service_key';

        freezeOrderSplitsMock = vi.fn().mockResolvedValue({ frozen: true, splitsCount: 2 });
        triggerAffiliateCommissionMock = vi.fn().mockResolvedValue({ ok: true });
        verifyPaidAmountMock = vi.fn().mockResolvedValue({ ok: true });

        vi.doMock('../../server/payments/splitEngine', () => ({
            freezeOrderSplits: freezeOrderSplitsMock,
        }));
        vi.doMock('../../server/affiliate/ledgerService', () => ({
            triggerAffiliateCommission: triggerAffiliateCommissionMock,
        }));
        vi.doMock('../../server/payments/verifyPaidAmount', () => ({
            verifyPaidAmount: verifyPaidAmountMock,
        }));

        currentSupaMock = createChainedSupaMock(null, null);
        vi.doMock('@supabase/supabase-js', () => ({
            createClient: vi.fn(() => currentSupaMock),
        }));
    });

    afterEach(() => {
        delete process.env.KASHIER_EGYPT_MERCHANT_ID;
        delete process.env.KASHIER_EGYPT_PAYMENT_API_KEY;
        delete process.env.KASHIER_EGYPT_SECRET_KEY;
        delete process.env.KASHIER_MODE;
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    });

    it('Scenario 1: orderStatus=SUCCESS + reconcilation=OK triggers invoice paid and freezeOrderSplits', async () => {
        currentSupaMock = createChainedSupaMock(
            { id: 'inv-v31-01', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP', user_id: 'user-01', tier_id: 'digital', affiliate_id: null },
            null
        );

        const { POST } = await import('../../app/api/payments/webhook/route');

        const body = buildKashierSignedBody({
            orderId: 'inv-v31-01',
            orderStatus: 'SUCCESS',
            reconcilation: 'OK',
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'tx-v31-01',
        });

        const req = new Request('http://localhost/api/payments/webhook', {
            method: 'POST',
            body,
            headers: { 'content-type': 'application/json', 'x-kashier-signature': 'present' },
        });

        const res = await POST(req);
        expect(res.status).toBe(200);

        // Verify invoice update called
        expect(currentSupaMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'success',
                payment_status: 'paid',
            })
        );

        // Verify revenue split freeze was called
        expect(freezeOrderSplitsMock).toHaveBeenCalledWith(currentSupaMock, 'inv-v31-01');
    });

    it('Scenario 2: orderStatus=SUCCESS + reconcilation=NA is treated as UNKNOWN without fulfilling order', async () => {
        currentSupaMock = createChainedSupaMock(
            { id: 'inv-v31-02', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP' },
            null
        );

        const { POST } = await import('../../app/api/payments/webhook/route');

        const body = buildKashierSignedBody({
            orderId: 'inv-v31-02',
            orderStatus: 'SUCCESS',
            reconcilation: 'NA', // Unresolved verdict
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'tx-v31-02',
        });

        const req = new Request('http://localhost/api/payments/webhook', {
            method: 'POST',
            body,
            headers: { 'content-type': 'application/json', 'x-kashier-signature': 'present' },
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toContain('pending reconciliation');

        // Verify splits were NOT frozen
        expect(freezeOrderSplitsMock).not.toHaveBeenCalled();
    });

    it('Scenario 3: Duplicate webhook caught by DB unique constraint returns duplicate without re-splitting', async () => {
        // Simulate Postgres 23505 unique constraint violation on webhook_events
        currentSupaMock = createChainedSupaMock(
            null,
            { code: '23505', message: 'duplicate key value violates unique constraint' }
        );

        const { POST } = await import('../../app/api/payments/webhook/route');

        const body = buildKashierSignedBody({
            orderId: 'inv-v31-03',
            orderStatus: 'SUCCESS',
            reconcilation: 'OK',
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'tx-v31-dup',
        });

        const req = new Request('http://localhost/api/payments/webhook', {
            method: 'POST',
            body,
            headers: { 'content-type': 'application/json', 'x-kashier-signature': 'present' },
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toBe('Duplicate event');

        // Revenue split MUST NOT be triggered on duplicate delivery
        expect(freezeOrderSplitsMock).not.toHaveBeenCalled();
    });

    it('Scenario 4: Reconcile mismatch (status=SUCCESS, reconcilation=Failed) fails-closed pending review', async () => {
        currentSupaMock = createChainedSupaMock(
            { id: 'inv-v31-04', status: 'pending', payment_status: 'pending' },
            null
        );

        const { POST } = await import('../../app/api/payments/webhook/route');

        const body = buildKashierSignedBody({
            orderId: 'inv-v31-04',
            orderStatus: 'SUCCESS',
            reconcilation: 'Failed', // Mismatch!
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'tx-v31-04',
        });

        const req = new Request('http://localhost/api/payments/webhook', {
            method: 'POST',
            body,
            headers: { 'content-type': 'application/json', 'x-kashier-signature': 'present' },
        });

        const res = await POST(req);
        expect(res.status).toBe(200);

        // Fails closed: splits not created
        expect(freezeOrderSplitsMock).not.toHaveBeenCalled();
    });

    it('Scenario 5: Split engine failure does not roll back payment activation (failure isolation)', async () => {
        freezeOrderSplitsMock.mockRejectedValue(new Error('Database lock error during split'));

        currentSupaMock = createChainedSupaMock(
            { id: 'inv-v31-05', status: 'pending', payment_status: 'pending', amount: 100, currency: 'EGP', user_id: 'user-05', tier_id: 'bundle' },
            null
        );

        const { POST } = await import('../../app/api/payments/webhook/route');

        const body = buildKashierSignedBody({
            orderId: 'inv-v31-05',
            orderStatus: 'SUCCESS',
            reconcilation: 'OK',
            amount: '100.00',
            currency: 'EGP',
            transactionId: 'tx-v31-05',
        });

        const req = new Request('http://localhost/api/payments/webhook', {
            method: 'POST',
            body,
            headers: { 'content-type': 'application/json', 'x-kashier-signature': 'present' },
        });

        const res = await POST(req);
        expect(res.status).toBe(200);

        // Payment activation succeeded even though split calculation had an error
        expect(currentSupaMock.chain.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'success', payment_status: 'paid' })
        );
    });

    it('Scenario 6: HTTP GET method returns 405 Method Not Allowed', async () => {
        const handler = (await import('../../server/payments/webhook')).default;
        const getReq = new Request('http://localhost/api/payments/webhook', { method: 'GET' });
        const res = await handler(getReq);
        expect(res?.status).toBe(405);
    });
});
