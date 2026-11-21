import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { buildCheckoutPlanUrl } from '../../shared/lib/checkoutPlan';
import {
    buildKashierPaymentPageUrl,
    buildKashierServicePaymentUrl,
} from '../../server/payments/paymentLinkConfig';
import { buildQuote } from '../../server/payments/quote';
import { createSessionFromInvoice } from '../../server/payments/checkout/checkoutSessionService';

type Row = Record<string, any>;

function fakeSupabase(invoice: Row = {}) {
    const db: Record<string, Row[]> = {
        invoices: [{
            id: '11111111-1111-4111-8111-111111111111',
            amount: '349.99',
            currency: 'USD',
            status: 'pending',
            payment_status: 'pending',
            region: 'global',
            gateway: 'invoice_first',
            tier_id: 'vip_coaching',
            customer_email: 'buyer@example.com',
            customer_name: 'Test Buyer',
            phone_number: null,
            idempotency_key: 'idem-service-1',
            kashier_session_id: null,
            kashier_session_url: null,
            kashier_order_id: null,
            metadata: {},
            pricing_version: '2026-11-18.1',
            quote_hash: 'hash-service-1',
            ...invoice,
        }],
        payment_intents: [],
    };
    let counter = 0;

    function from(table: string) {
        const state: { mode: 'select' | 'insert' | 'update'; payload: Row | null; filters: Record<string, any>; orderCol: string | null; ascending: boolean } = {
            mode: 'select', payload: null, filters: {}, orderCol: null, ascending: true,
        };
        const exec = async () => {
            const rows = db[table] || (db[table] = []);
            if (state.mode === 'insert') {
                const row = { id: `${table}-${++counter}`, ...state.payload };
                rows.push(row);
                return { data: row, error: null };
            }
            const matched = rows.filter((row) =>
                Object.entries(state.filters).every(([key, value]) => row[key] === value)
            );
            if (state.mode === 'update') {
                matched.forEach((row) => Object.assign(row, state.payload));
                return { data: matched, error: null };
            }
            const result = [...matched];
            if (state.orderCol) {
                result.sort((a, b) =>
                    (a[state.orderCol!] > b[state.orderCol!] ? 1 : -1) * (state.ascending ? 1 : -1)
                );
            }
            return { data: result, error: null };
        };
        const builder: any = {
            select() { return builder; },
            insert(payload: Row) { state.mode = 'insert'; state.payload = payload; return builder; },
            update(payload: Row) { state.mode = 'update'; state.payload = payload; return builder; },
            eq(key: string, value: any) { state.filters[key] = value; return builder; },
            order(key: string, opts?: { ascending?: boolean }) {
                state.orderCol = key;
                state.ascending = opts?.ascending !== false;
                return builder;
            },
            async single() { const r = await exec(); const data = Array.isArray(r.data) ? (r.data[0] ?? null) : r.data; return { data, error: r.error }; },
            async maybeSingle() { const r = await exec(); const data = Array.isArray(r.data) ? (r.data[0] ?? null) : r.data; return { data, error: r.error }; },
            then(resolve: any, reject: any) { return exec().then(resolve, reject); },
        };
        return builder;
    }
    return { from, _db: db } as any;
}

const originalEnv = process.env;

beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.QUOTE_TOKEN_SECRET = 'phase5-test-quote-secret';
    delete process.env.KASHIER_SERVICE_LINKS_VERIFIED;
});

afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
});

describe('Phase 5 — internal checkout links', () => {
    it('builds /checkout?plan=... and preserves utm_* + ref', () => {
        const url = buildCheckoutPlanUrl('bundle', {
            region: 'GLOBAL',
            search: '?utm_source=telegram&utm_campaign=launch&ref=AFF-1&other=drop',
        });
        const parsed = new URL(url, 'https://www.mrxsteroid.com');
        expect(parsed.pathname).toBe('/checkout');
        expect(parsed.searchParams.get('plan')).toBe('bundle');
        expect(parsed.searchParams.get('region')).toBe('GLOBAL');
        expect(parsed.searchParams.get('utm_source')).toBe('telegram');
        expect(parsed.searchParams.get('utm_campaign')).toBe('launch');
        expect(parsed.searchParams.get('ref')).toBe('AFF-1');
        expect(parsed.searchParams.get('other')).toBeNull();
    });

    it('turns the legacy Kashier quick-pay builder into an internal redirect', () => {
        const url = buildKashierPaymentPageUrl('digital', {
            region: 'EG',
            referralCode: 'REF-9',
            search: '?utm_medium=email',
        });
        expect(url.startsWith('/checkout?')).toBe(true);
        expect(url).toContain('plan=digital');
        expect(url).toContain('region=EG');
        expect(url).toContain('utm_medium=email');
        expect(url).toContain('ref=REF-9');
        expect(url).not.toContain('kashier.io');
    });

    it('renders the direct-services section only behind the server flag', () => {
        const checkout = fs.readFileSync(path.join(process.cwd(), 'legacy-pages/CheckoutPage.tsx'), 'utf8');
        const page = fs.readFileSync(path.join(process.cwd(), 'app/checkout/page.tsx'), 'utf8');
        expect(checkout).toContain('!isEg && showDirectServices');
        expect(page).toContain('KASHIER_SERVICE_LINKS_VERIFIED');
        expect(page).toContain('showDirectServices');
    });

    it('Paymob modal pushes to /checkout instead of an external standalone URL', () => {
        const modal = fs.readFileSync(path.join(process.cwd(), 'features/modal/PaymobProductModal.tsx'), 'utf8');
        expect(modal).toContain('buildCheckoutPlanUrl');
        expect(modal).toContain('router.push(redirectUrl)');
        expect(modal).not.toContain('window.location.assign');
        expect(modal).not.toContain('selectedProduct.directLink');
    });
});

describe('Phase 5 — VIP Coaching as a standalone service', () => {
    it('quotes vip_coaching as a service line at 349.99 USD', () => {
        const quote = buildQuote({ region: 'GLOBAL', lines: [{ sku: 'vip_coaching' }] });
        expect(quote.currency).toBe('USD');
        expect(quote.total).toBe(349.99);
        expect(quote.lines).toHaveLength(1);
        expect(quote.lines[0]).toMatchObject({
            line_type: 'service',
            sku: 'vip_coaching',
            unit_price: 349.99,
            line_total: 349.99,
        });
    });

    it('keeps consultation as a 30.00 USD service line', () => {
        const quote = buildQuote({ region: 'GLOBAL', lines: [{ sku: 'consultation' }] });
        expect(quote.total).toBe(30);
        expect(quote.lines[0].line_type).toBe('service');
    });

    it('creates a session from the service invoice without calling Fourthwall or a gateway factory', async () => {
        const supabase = fakeSupabase();
        const gatewayFactory = vi.fn(() => {
            throw new Error('gateway must not be called for a service invoice');
        });

        const result = await createSessionFromInvoice(
            { invoiceId: '11111111-1111-4111-8111-111111111111' },
            { supabase, gatewayFactory }
        );

        expect(gatewayFactory).not.toHaveBeenCalled();
        expect(result.amount).toBe(Number(supabase._db.invoices[0].amount));
        expect(result.amount).toBe(349.99);
        expect(result.currency).toBe('USD');
        expect(result.sessionUrl).toContain('invoice_id=11111111-1111-4111-8111-111111111111');
        expect(result.sessionUrl).toContain('amount=349.99');
        expect(result.sessionUrl).toContain('currency=USD');
        expect(supabase._db.invoices[0].gateway).toBe('kashier');
        expect(supabase._db.invoices[0].payment_provider_merchant).toBe('kashier_service_link');
        expect(supabase._db.payment_intents[0].amount_minor).toBe(34999);
    });

    it('builds the service link with the invoice id and amount server-side', () => {
        const url = buildKashierServicePaymentUrl('coaching_addon', {
            invoiceId: 'inv-service-1',
            userEmail: 'buyer@example.com',
            allowUnverified: true,
        });
        expect(url).toContain('invoice_id=inv-service-1');
        expect(url).toContain('amount=349.99');
        expect(url).toContain('service_id=coaching_addon');
    });
});
