import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { POST } from '../../app/api/checkout/quote/route';
import {
    QuoteRequestSchema,
    QuoteTokenError,
    buildQuote,
    findForbiddenPriceFields,
    verifyQuoteToken,
} from '../../server/payments/quote';
import { DEFAULT_PRICING, PRICING_VERSION, computeAmount } from '../../server/payments/pricing';

beforeAll(() => {
    process.env.QUOTE_TOKEN_SECRET = 'phase-3-test-quote-secret-do-not-use-in-production';
});

let ipCounter = 0;

function request(body: unknown, ip = `10.0.0.${++ipCounter}`): Request {
    return new Request('http://localhost/api/checkout/quote', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-forwarded-for': ip,
        },
        body: JSON.stringify(body),
    });
}

const DIGITAL_EG = {
    region: 'EG',
    lines: [{ sku: 'digital', quantity: 1, language: 'ar' }],
};

const BUNDLE_EG = {
    region: 'EG',
    lines: [{ sku: 'bundle', quantity: 1, language: 'ar' }],
    shippingAddress: { address: '1 Test Street', city: 'Cairo' },
};

describe('POST /api/checkout/quote (Phase 3)', () => {
    it('returns a server-priced digital quote with a verifiable token', async () => {
        const res = await POST(request(DIGITAL_EG));
        expect(res.status).toBe(200);
        const body = await res.json();

        expect(body.success).toBe(true);
        expect(body.currency).toBe('EGP');
        expect(body.region).toBe('EGYPT');
        expect(body.subtotal).toBe(499);
        expect(body.shipping).toBe(0);
        expect(body.discount).toBe(0);
        expect(body.tax).toBe(0);
        expect(body.total).toBe(499);
        expect(body.pricing_version).toBe(PRICING_VERSION);
        expect(body.cart_hash).toMatch(/^[a-f0-9]{64}$/);
        expect(body.lines).toHaveLength(1);
        expect(body.lines[0]).toMatchObject({
            line_type: 'product',
            sku: 'digital',
            language: 'ar',
            unit_price: 499,
            line_total: 499,
        });

        const payload = verifyQuoteToken(body.quote_token, { expectedCartHash: body.cart_hash });
        expect(payload.total).toBe(499);
        expect(payload.pricing_version).toBe(PRICING_VERSION);
        expect(payload.exp).toBeGreaterThan(payload.iat);
    });

    it('adds an explicit shipping line for Egypt physical orders', async () => {
        const res = await POST(request(BUNDLE_EG));
        expect(res.status).toBe(200);
        const body = await res.json();

        expect(body.subtotal).toBe(749);
        expect(body.shipping).toBe(199);
        expect(body.total).toBe(948);
        const shipping = body.lines.find((line: { line_type: string }) => line.line_type === 'shipping');
        expect(shipping).toMatchObject({
            unit_price: 199,
            line_total: 199,
            metadata: {
                provider_id: 'eg_standard',
                service_code: 'flat_rate',
            },
        });
        expect(shipping.metadata.quote_id).toBe(body.cart_hash);
    });

    it('honors the same PRICING_* env overrides as the charge path', () => {
        process.env.PRICING_DIGITAL_EGP = '555';
        try {
            const quote = buildQuote(DIGITAL_EG as never);
            expect(quote.total).toBe(555);
        } finally {
            delete process.env.PRICING_DIGITAL_EGP;
        }
    });

    it('matches computeAmount for legacy *_plus pricing', () => {
        const quote = buildQuote({
            region: 'EG',
            lines: [{ sku: 'coaching_plus', quantity: 2, language: 'ar' }],
            shippingAddress: { address: '1 Test Street', city: 'Cairo' },
        } as never);
        const expected = computeAmount(DEFAULT_PRICING, {
            tierId: 'coaching_plus' as never,
            currency: 'EGP',
            quantity: 2,
            shippingCost: 199,
        });
        expect(quote.total).toBe(expected);
    });

    it('builds a multi-line product + add-on quote', async () => {
        const res = await POST(request({
            region: 'EG',
            lines: [{ sku: 'coaching_plus', quantity: 1, language: 'en' }],
            shippingAddress: { address: '1 Test Street', city: 'Cairo' },
        }));
        expect(res.status).toBe(200);
        const body = await res.json();

        const product = body.lines.find((line: { line_type: string }) => line.line_type === 'product');
        const addon = body.lines.find((line: { line_type: string }) => line.line_type === 'addon');
        expect(product.unit_price).toBe(849);
        expect(addon.unit_price).toBe(9999);
        expect(body.subtotal).toBe(10848);
        expect(body.total).toBe(11047); // + 199 shipping
    });

    it('quotes GLOBAL digital in USD without Egypt shipping', async () => {
        const res = await POST(request({
            region: 'GLOBAL',
            lines: [{ sku: 'MRX-PROTOCOL', quantity: 1, language: 'en' }],
        }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.currency).toBe('USD');
        expect(body.subtotal).toBe(49.99);
        expect(body.shipping).toBe(0);
        expect(body.total).toBe(49.99);
    });

    it('quotes the GLOBAL consultation as a service line', async () => {
        const res = await POST(request({
            region: 'GLOBAL',
            lines: [{ sku: 'MRX-CONSULTATION' }],
        }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.lines[0]).toMatchObject({ line_type: 'service', unit_price: 30, line_total: 30 });
        expect(body.total).toBe(30);
    });

    it('applies a server-computed promo discount line', async () => {
        const res = await POST(request({ ...DIGITAL_EG, promoCode: 'STEROIDIQ' }));
        expect(res.status).toBe(200);
        const body = await res.json();
        const discount = body.lines.find((line: { line_type: string }) => line.line_type === 'discount');
        expect(discount.line_total).toBe(-1);
        expect(body.discount).toBe(1);
        expect(body.total).toBe(498);
    });

    it('rejects client-supplied price/accounting fields explicitly', async () => {
        for (const field of ['total', 'unit_price', 'line_total', 'subtotal', 'discount_amount', 'currency', 'amount']) {
            const res = await POST(request({
                ...DIGITAL_EG,
                [field]: 1,
            }));
            expect(res.status, field).toBe(400);
            const body = await res.json();
            expect(body.code, field).toBe('CLIENT_PRICE_FIELD_FORBIDDEN');
            expect(body.fields, field).toContain(field);
        }
    });

    it('rejects nested price fields on a cart line', async () => {
        const res = await POST(request({
            region: 'EG',
            lines: [{ sku: 'digital', quantity: 1, language: 'ar', unit_price: 1 }],
        }));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.fields).toContain('lines[0].unit_price');
    });

    it('rejects a book line without a language', async () => {
        const res = await POST(request({ region: 'EG', lines: [{ sku: 'digital', quantity: 1 }] }));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.code).toBe('LANGUAGE_REQUIRED');
    });

    it('rejects an unregistered language at the schema boundary', async () => {
        const res = await POST(request({
            region: 'EG',
            lines: [{ sku: 'digital', quantity: 1, language: 'fr' }],
        }));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.code).toBe('VALIDATION_FAILED');
        expect(body.details.lines).toBeDefined();
    });

    it('rejects Global physical shipping before producing a quote', async () => {
        const res = await POST(request({
            region: 'GLOBAL',
            lines: [{ sku: 'bundle', quantity: 1, language: 'en' }],
        }));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.code).toBe('GLOBAL_PHYSICAL_SHIPPING_BLOCKED');
    });

    it('rejects consultation in the Egypt region', async () => {
        const res = await POST(request({
            region: 'EG',
            lines: [{ sku: 'MRX-CONSULTATION' }],
        }));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.code).toBe('SERVICE_NOT_AVAILABLE_IN_EGYPT');
    });

    it('rejects an invalid shipping provider instead of silently dropping it', async () => {
        const res = await POST(request({
            ...BUNDLE_EG,
            shippingProviderId: 'not_a_real_provider',
        }));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.code).toBe('SHIPPING_UNAVAILABLE');
    });

    it('rejects unknown fields thanks to .strict()', async () => {
        const res = await POST(request({ ...DIGITAL_EG, surprise: true }));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.code).toBe('VALIDATION_FAILED');
        expect(body.details).toBeDefined();
    });
});

describe('quote token integrity', () => {
    it('detects a tampered token', () => {
        const quote = buildQuote(DIGITAL_EG as never);
        const [body, signature] = quote.quote_token.split('.');
        const tamperedBody = `${body.slice(0, -1)}${body.endsWith('A') ? 'B' : 'A'}`;
        expect(() => verifyQuoteToken(`${tamperedBody}.${signature}`)).toThrow(QuoteTokenError);
    });

    it('detects a malformed token', () => {
        expect(() => verifyQuoteToken('not-a-token')).toThrow(/malformed/i);
    });

    it('rejects an expired token', () => {
        const quote = buildQuote(DIGITAL_EG as never, { now: 1_000, ttlSeconds: 30 });
        expect(() => verifyQuoteToken(quote.quote_token, { now: 1_031 })).toThrow(/expired/i);
    });

    it('detects a cart mismatch', () => {
        const quote = buildQuote(DIGITAL_EG as never);
        expect(() => verifyQuoteToken(quote.quote_token, { expectedCartHash: 'deadbeef' })).toThrow(/cart/i);
    });
});

describe('quote input guard and no-write contract', () => {
    it('finds forbidden price fields recursively', () => {
        expect(findForbiddenPriceFields({
            total: 1,
            lines: [{ sku: 'digital', unit_price: 1 }],
            shippingAddress: { city: 'Cairo' },
        })).toEqual(expect.arrayContaining(['total', 'lines[0].unit_price']));
    });

    it('the quote route has no database client and no write calls', () => {
        const source = fs.readFileSync(
            path.resolve(process.cwd(), 'app/api/checkout/quote/route.ts'),
            'utf8'
        );
        expect(source).not.toMatch(/supabase|createClient/i);
        expect(source).not.toMatch(/\.from\(|\.insert\(|\.upsert\(|\.update\(|\.delete\(/);
        expect(source).not.toMatch(/invoices|orders|payment_intents/);
    });

    it('the quote service never writes to a database', () => {
        const source = fs.readFileSync(
            path.resolve(process.cwd(), 'server/payments/quote.ts'),
            'utf8'
        );
        expect(source).not.toMatch(/createClient|@supabase\/supabase-js|supabase\.from/i);
        expect(source).not.toMatch(/\.insert\(|\.upsert\(/);
    });

    it('the strict schema rejects a price field before it reaches buildQuote', () => {
        const parsed = QuoteRequestSchema.safeParse({
            region: 'EG',
            lines: [{ sku: 'digital', language: 'ar', quantity: 1 }],
            total: 1,
        });
        expect(parsed.success).toBe(false);
    });
});
