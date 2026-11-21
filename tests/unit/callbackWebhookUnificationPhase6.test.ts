import { describe, it, expect, beforeEach, vi } from 'vitest';

const h = vi.hoisted(() => ({
    inserts: [] as Array<Record<string, unknown>>,
    keys: new Set<string>(),
    apply: vi.fn(),
    verify: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: () => ({
            insert: async (payload: Record<string, unknown>) => {
                const key = `${payload.provider}:${payload.provider_event_id}`;
                if (h.keys.has(key)) return { error: { code: '23505', message: 'duplicate' } };
                h.keys.add(key);
                h.inserts.push(payload);
                return { error: null };
            },
        }),
    }),
}));

vi.mock('../../server/payments/gateways/PaymentFactory', () => ({
    PaymentFactory: {
        detectGatewayFromRequest: () => ({
            getGatewayName: () => 'KASHIER_EGYPT',
            verifyWebhook: h.verify,
        }),
    },
}));

vi.mock('../../server/payments/fulfillmentService', () => ({
    applyProviderVerdict: h.apply,
}));

import { POST } from '../../app/api/payments/callback/route';

function request() {
    return new Request('http://localhost/api/payments/callback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId: 'inv-cb-1', orderStatus: 'SUCCESS', transactionId: 'txn-cb-1' }),
    });
}

beforeEach(() => {
    process.env.SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    h.inserts.length = 0;
    h.keys.clear();
    h.apply.mockReset();
    h.verify.mockReset();
    h.verify.mockResolvedValue({
        valid: true,
        invoiceId: 'inv-cb-1',
        status: 'success',
        externalReferenceId: 'txn-cb-1',
        paidAmount: 499,
        currency: 'EGP',
        providerStatus: 'SUCCESS',
        detailedStatus: 'SUCCESS',
    });
    h.apply.mockResolvedValue({ code: 'applied', outcome: 'success' });
});

describe('Phase 6 — callback uses the canonical webhook settlement path', () => {
    it('settles once when the same callback is delivered twice', async () => {
        const first = await POST(request());
        const second = await POST(request());

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
        expect(h.inserts).toHaveLength(1);
        expect(h.apply).toHaveBeenCalledTimes(1);

        const body = await second.json();
        expect(body.message).toMatch(/already processed/i);
    });

    it('rejects a bad signature with zero database writes', async () => {
        h.verify.mockResolvedValueOnce({ valid: false, errorMessage: 'bad signature' });

        const response = await POST(request());

        expect(response.status).toBe(401);
        expect(h.inserts).toHaveLength(0);
        expect(h.apply).not.toHaveBeenCalled();
    });
});
