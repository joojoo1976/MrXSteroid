/**
 * InstaPay checkout route — M1A compatibility contract tests.
 *
 * Every order created by this producer must carry server-resolved M1A
 * checkout context: region=EG, currency=EGP, payment_method=instapay,
 * source_channel=web_checkout, payment_status=pending. No client-supplied
 * region/currency is ever used (the route computes everything server-side).
 */
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(),
}));

vi.mock('../../lib/ratelimit', () => ({
    enforceRateLimit: vi.fn(async () => ({ success: true })),
    clientIp: () => '203.0.113.9',
}));

vi.mock('../../server/auth/resolveUser', () => ({
    resolveEffectiveUserId: vi.fn(async () => ({ success: true, effectiveUserId: 'user-1' })),
}));

vi.mock('../../server/payments/pricing', () => ({
    loadPricing: vi.fn(async () => ({})),
    computeAmount: vi.fn(() => 1000),
    resolveShippingCost: vi.fn(() => 0),
    computePromoDiscount: vi.fn(() => 0),
}));

import { createClient } from '@supabase/supabase-js';
import { POST } from '../../app/api/checkout/instapay/route';

let orderInsertPayload: Record<string, unknown> | null = null;
let receiptInsertPayload: Record<string, unknown> | null = null;

beforeAll(() => {
    process.env.SUPABASE_URL = 'https://mock.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role';
});

beforeEach(() => {
    vi.clearAllMocks();
    orderInsertPayload = null;
    receiptInsertPayload = null;

    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn((table: string) => {
            if (table === 'admin_settings') {
                return { select: vi.fn(async () => ({ data: [], error: null })) };
            }
            if (table === 'orders') {
                return {
                    insert: vi.fn((payload: Record<string, unknown>) => {
                        orderInsertPayload = payload;
                        return {
                            select: vi.fn(() => ({
                                single: vi.fn(async () => ({ data: { ...payload, id: 'order-1' }, error: null })),
                            })),
                        };
                    }),
                    delete: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
                };
            }
            if (table === 'payment_receipts') {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                maybeSingle: vi.fn(async () => ({ data: null, error: null })),
                            })),
                        })),
                    })),
                    insert: vi.fn((payload: Record<string, unknown>) => {
                        receiptInsertPayload = payload;
                        return {
                            select: vi.fn(() => ({
                                single: vi.fn(async () => ({ data: { ...payload, id: 'rc-1' }, error: null })),
                            })),
                        };
                    }),
                };
            }
            return {};
        }),
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn(async () => ({ data: { path: 'order-1/1_receipt.png' }, error: null })),
                getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://mock/receipt.png' } })),
            })),
        },
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

const makeRequest = () => {
    const form = new FormData();
    form.append(
        'receipt',
        new File([new Uint8Array([1, 2, 3, 4])], 'receipt.png', { type: 'image/png' })
    );
    form.append(
        'data',
        JSON.stringify({
            tierId: 'bundle',
            quantity: 1,
            customerName: 'Test User',
            email: 'test@example.com',
            phoneNumber: '01234567890',
            shippingAddress: { address: 'Street 1', city: 'Cairo', zipCode: '11511', country: 'EG' },
        })
    );
    return new NextRequest('http://localhost/api/checkout/instapay', { method: 'POST', body: form });
};

describe('InstaPay route — M1A order compatibility', () => {
    it('creates the order with region=EG, currency=EGP, payment_method=instapay, source_channel=web_checkout, payment_status=pending', async () => {
        const res = await POST(makeRequest());
        expect(res.status).toBe(201);

        expect(orderInsertPayload).toMatchObject({
            region: 'EG',
            currency: 'EGP',
            payment_method: 'instapay',
            source_channel: 'web_checkout',
            payment_status: 'pending',
            status: 'pending_manual_review',
        });
        // Explicit guard: no gateway/provider name ever lands in payment_method.
        expect(orderInsertPayload?.payment_method).not.toMatch(/kashier|paymob|stripe|spaceremit/i);
    });

    it('stores the same rail + currency context on the payment_receipts record', async () => {
        await POST(makeRequest());
        expect(receiptInsertPayload).toMatchObject({
            payment_method: 'instapay',
            currency: 'EGP',
        });
    });

    it('never reads region/currency from the client payload', async () => {
        // The schema has no client region/currency field at all — assert the
        // authoritative values are only the server-resolved constants.
        await POST(makeRequest());
        expect(orderInsertPayload).not.toHaveProperty('region', null);
        expect(orderInsertPayload).not.toHaveProperty('currency', null);
        expect(orderInsertPayload).toMatchObject({ region: 'EG', currency: 'EGP' });
    });
});