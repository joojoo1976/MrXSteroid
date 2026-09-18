import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

// Build Supabase mock that supports full chaining
function buildSupaMock(invoiceRow: Record<string, unknown> | null = null) {
    const singleResult = invoiceRow
        ? { data: invoiceRow, error: null }
        : { data: null, error: { code: 'PGRST116', message: 'Row not found' } };

    const chain: Record<string, unknown> = {};
    chain.single = vi.fn().mockResolvedValue(singleResult);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.select = vi.fn().mockReturnValue(chain);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockResolvedValue({ data: [{ id: 'wh-001' }], error: null });

    const mockFrom = vi.fn().mockReturnValue(chain);
    return { from: mockFrom, rpc: vi.fn().mockResolvedValue({ data: null, error: null }), chain };
}

let supabaseMock: ReturnType<typeof buildSupaMock>;

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => supabaseMock
}));

describe('Extra Webhook Integration Scenarios', () => {
    beforeEach(() => {
        vi.resetModules();
        process.env.SUPABASE_URL = 'http://test.local';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'sr-key';
        process.env.KASHIER_EGYPT_MERCHANT_ID = 'MID_EG_TEST';
        process.env.KASHIER_EGYPT_PAYMENT_API_KEY = 'APIKEY_EG_TEST';
        process.env.KASHIER_EGYPT_SECRET_KEY = 'SEC_EG_TEST';
        process.env.KASHIER_GLOBAL_MERCHANT_ID = 'MID_GL_TEST';
        process.env.KASHIER_GLOBAL_PAYMENT_API_KEY = 'APIKEY_GL_TEST';
        process.env.KASHIER_GLOBAL_SECRET_KEY = 'SEC_GL_TEST';
        process.env.KASHIER_MODE = 'test';
        
        supabaseMock = buildSupaMock({
            id: 'inv_123',
            amount: 100,
            currency: 'EGP',
            payment_status: 'pending'
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    async function postWebhook(body: string, headers: Record<string, string> = {}): Promise<Response> {
        const { POST } = await import('../../app/api/payments/webhook/route');
        const req = new Request('http://localhost/api/payments/webhook', {
            method: 'POST', 
            body: body ? body : null,
            headers: { 'content-type': 'application/json', ...headers },
        });
        return POST(req);
    }

    it('returns 401 for malformed JSON payload due to failed signature verification', async () => {
        const res = await postWebhook('{"invalid": "json"', {});
        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.error).toContain('Invalid webhook signature');
    });

    it('returns 401 for unknown gateway signature headers', async () => {
        const res = await postWebhook('{"some":"data"}', {
            'x-unknown-signature': 'xyz123'
        });
        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.error).toContain('Invalid webhook signature');
    });

    it('returns 401 if Stripe signature is present but invalid', async () => {
        const res = await postWebhook('{"some":"data"}', {
            'stripe-signature': 't=123,v1=abc'
        });
        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.error).toContain('Invalid webhook signature');
    });

    it('gracefully handles missing SUPABASE_SERVICE_ROLE_KEY by returning 200 to suppress retries', async () => {
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
        const res = await postWebhook('{"merchantId":"MID_EG_TEST","event":"SUCCESS"}', {
            'x-kashier-signature': 'any' // bypass gateway detection by pretending it's Kashier
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.error).toContain('Internal Error');
    });
});
