import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';

const rpcMock = vi.hoisted(() => vi.fn());

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({ rpc: rpcMock })),
}));

import { POST as postCreateInvoice } from '../../app/api/payments/create-invoice/route';
import { buildQuote, verifyQuoteToken } from '../../server/payments/quote';
import {
    IdempotencyConflictError,
    buildInvoiceLinePayload,
    createInvoiceFromQuote,
    verifyAndRepriceQuote,
} from '../../server/payments/invoice/invoiceCreationService';

const CART = {
    region: 'EG' as const,
    lines: [{ sku: 'bundle', quantity: 1, language: 'ar' as const }],
    shippingAddress: { address: '1 Test Street', city: 'Cairo' },
};

const CUSTOMER = {
    email: 'buyer@example.com',
    fullName: 'Test Buyer',
    phoneNumber: '+201000000000',
};

const rpcRow = (quote: ReturnType<typeof buildQuote>, overrides: Record<string, unknown> = {}) => ({
    data: {
        invoice_id: 'inv-1',
        order_id: 'ord-1',
        amount: quote.total,
        currency: quote.currency,
        pricing_version: quote.pricing_version,
        quote_hash: quote.cart_hash,
        idempotent: false,
        ...overrides,
    },
    error: null,
});

const fakeSupabase = () => ({ rpc: rpcMock } as never);

beforeAll(() => {
    process.env.QUOTE_TOKEN_SECRET = 'phase-4-test-quote-secret-do-not-use-in-production';
    process.env.SUPABASE_URL = 'https://phase4-test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'phase4-service-role';
});

afterEach(() => {
    rpcMock.mockReset();
});

describe('Phase 4 — quote verification and re-pricing', () => {
    it('re-prices the cart from scratch and matches the signed cart hash', () => {
        const quote = buildQuote(CART as never);
        const verified = verifyAndRepriceQuote(quote.quote_token, CART as never);

        expect(verified.quote.total).toBe(948);
        expect(verified.quote.cart_hash).toBe(quote.cart_hash);
        expect(verified.tokenTotal).toBe(948);
        expect(verified.quote.lines).toHaveLength(2);
    });

    it('rejects a token whose cart differs', () => {
        const quote = buildQuote(CART as never);
        expect(() => verifyAndRepriceQuote(quote.quote_token, {
            ...CART,
            lines: [{ sku: 'digital', quantity: 1, language: 'ar' }],
        } as never)).toThrow(/cart/i);
    });

    it('rejects an expired token before doing any pricing work', () => {
        const quote = buildQuote(CART as never, { now: 1_000, ttlSeconds: 30 });
        expect(() => verifyAndRepriceQuote(quote.quote_token, CART as never)).toThrow(/expired/i);
    });

    it('builds line payloads whose totals equal the invoice amount', () => {
        const quote = buildQuote(CART as never);
        const lines = buildInvoiceLinePayload(quote);
        const sum = lines.reduce((total, line) => total + Number(line.line_total), 0);
        expect(sum).toBe(quote.total);
        expect(lines.map((line) => line.line_type)).toEqual(['product', 'shipping']);
    });
});

describe('Phase 4 — atomic invoice creation service', () => {
    it('calls the atomic RPC once with server-priced lines and no gateway', async () => {
        const quote = buildQuote(CART as never);
        rpcMock.mockResolvedValue(rpcRow(quote));

        const result = await createInvoiceFromQuote({
            quoteToken: quote.quote_token,
            cart: CART as never,
            customer: CUSTOMER,
            idempotencyKey: 'idem-1',
        }, { supabase: fakeSupabase() });

        expect(result).toMatchObject({
            invoiceId: 'inv-1',
            orderId: 'ord-1',
            amount: 948,
            currency: 'EGP',
            idempotent: false,
        });
        expect(rpcMock).toHaveBeenCalledTimes(1);
        const [fn, args] = rpcMock.mock.calls[0];
        expect(fn).toBe('create_invoice_atomic');
        expect(args.p_amount).toBe(948);
        expect(args.p_idempotency_key).toBe('idem-1');
        expect(args.p_pricing_version).toBe(quote.pricing_version);
        expect(args.p_quote_hash).toBe(quote.cart_hash);
        expect(args.p_lines).toHaveLength(2);
        expect(args.p_lines.reduce((sum: number, line: any) => sum + line.line_total, 0)).toBe(948);
    });

    it('returns the existing invoice on an idempotent replay', async () => {
        const quote = buildQuote(CART as never);
        rpcMock.mockResolvedValue(rpcRow(quote, { idempotent: true }));

        const result = await createInvoiceFromQuote({
            quoteToken: quote.quote_token,
            cart: CART as never,
            customer: CUSTOMER,
            idempotencyKey: 'idem-replay',
        }, { supabase: fakeSupabase() });

        expect(result.idempotent).toBe(true);
        expect(result.invoiceId).toBe('inv-1');
        expect(rpcMock).toHaveBeenCalledTimes(1);
    });

    it('rejects an idempotency key reused for a different cart', async () => {
        const quote = buildQuote(CART as never);
        rpcMock.mockResolvedValue(rpcRow(quote, { quote_hash: 'different-cart-hash' }));

        await expect(createInvoiceFromQuote({
            quoteToken: quote.quote_token,
            cart: CART as never,
            customer: CUSTOMER,
            idempotencyKey: 'idem-reused',
        }, { supabase: fakeSupabase() })).rejects.toBeInstanceOf(IdempotencyConflictError);
    });

    it('rejects a body-supplied price field before the RPC is reached', async () => {
        const quote = buildQuote(CART as never);
        const res = await postCreateInvoice(new Request('http://localhost/api/payments/create-invoice', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'idempotency-key': 'idem-route-price',
            },
            body: JSON.stringify({
                quote_token: quote.quote_token,
                cart: CART,
                customer: CUSTOMER,
                total: 1,
            }),
        }));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.code).toBe('CLIENT_PRICE_FIELD_FORBIDDEN');
        expect(body.fields).toContain('total');
        expect(rpcMock).not.toHaveBeenCalled();
    });

    it('creates a pending invoice/order through the route and returns no redirect', async () => {
        const quote = buildQuote(CART as never);
        rpcMock.mockResolvedValue(rpcRow(quote));

        const res = await postCreateInvoice(new Request('http://localhost/api/payments/create-invoice', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'idempotency-key': 'idem-route-create',
            },
            body: JSON.stringify({
                quote_token: quote.quote_token,
                cart: CART,
                customer: CUSTOMER,
            }),
        }));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toMatchObject({
            success: true,
            invoiceId: 'inv-1',
            orderId: 'ord-1',
            amount: 948,
            currency: 'EGP',
            status: 'pending',
            idempotent: false,
        });
        expect(body.redirectUrl).toBeUndefined();
        expect(rpcMock).toHaveBeenCalledTimes(1);
    });

    it('rejects a tampered token before the RPC is reached', async () => {
        const quote = buildQuote(CART as never);
        const [body, sig] = quote.quote_token.split('.');
        const tampered = `${body.slice(0, -1)}${body.endsWith('A') ? 'B' : 'A'}.${sig}`;

        const res = await postCreateInvoice(new Request('http://localhost/api/payments/create-invoice', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'idempotency-key': 'idem-route-tamper',
            },
            body: JSON.stringify({
                quote_token: tampered,
                cart: CART,
                customer: CUSTOMER,
            }),
        }));

        expect(res.status).toBe(400);
        expect(rpcMock).not.toHaveBeenCalled();
    });

    it('produces a verifiable token with a positive TTL', () => {
        const quote = buildQuote(CART as never);
        const payload = verifyQuoteToken(quote.quote_token);
        expect(payload.exp).toBeGreaterThan(payload.iat);
        expect(payload.cart_hash).toBe(quote.cart_hash);
    });
});
