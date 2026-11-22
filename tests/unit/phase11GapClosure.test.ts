import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
    basePricing,
    computeAmount,
    type TierId,
} from '../../server/payments/pricing';
import { buildQuote } from '../../server/payments/quote';
import {
    createInvoiceFromQuote,
    QuoteStaleError,
} from '../../server/payments/invoice/invoiceCreationService';
import {
    buildLegacyInvoiceLinePayload,
    sumInvoiceLineTotals,
    writeInvoiceLinesForExistingInvoice,
    InvoiceLineWriteError,
} from '../../server/payments/invoice/invoiceLinePayload';
import { FourthwallGateway } from '../../server/payments/gateways/FourthwallGateway';
import { FlatRateProvider } from '../../server/shipping/FlatRateProvider';
import { hashClaimToken, redeemGuestOrderClaim } from '../../server/payments/guestClaimService';
import { verifyInvoiceLineTotals } from '../../scripts/invoiceLinesVerification';

const grantMock = vi.hoisted(() => vi.fn());
vi.mock('../../server/payments/entitlementService', () => ({
    grantEntitlement: (...args: unknown[]) => grantMock(...args),
}));

const ROOT = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

beforeEach(() => {
    process.env.QUOTE_TOKEN_SECRET = 'phase-11-test-quote-secret';
    grantMock.mockReset();
    grantMock.mockResolvedValue({ entitlementId: 'ent-1' });
});

describe('P0.3 — quote and invoice share one admin-aware pricing catalog', () => {
    it('buildQuote uses the supplied catalog instead of basePricing', () => {
        const pricing = basePricing();
        pricing.tiers.digital.egp = 1234;
        const quote = buildQuote(
            { region: 'EG', lines: [{ sku: 'digital', quantity: 1, language: 'ar' }] },
            { pricing },
        );
        expect(quote.total).toBe(1234);
        expect(quote.lines[0].unit_price).toBe(1234);
    });

    it('createInvoiceFromQuote re-prices with the admin settings used by the invoice path', async () => {
        const pricing = basePricing();
        pricing.tiers.digital.egp = 1234;
        const cart = { region: 'EG' as const, lines: [{ sku: 'digital', quantity: 1, language: 'ar' as const }] };
        const quote = buildQuote(cart, { pricing });

        const rpc = vi.fn(async (_name: string, payload: Record<string, any>) => ({
            data: {
                invoice_id: 'inv-p11',
                order_id: 'ord-p11',
                amount: payload.p_amount,
                currency: payload.p_currency,
                pricing_version: payload.p_pricing_version,
                quote_hash: payload.p_quote_hash,
                idempotent: false,
            },
            error: null,
        }));
        const supabase = {
            from: vi.fn(() => ({
                select: vi.fn(async () => ({
                    data: [{ key: 'pricing_digital_egp', value: '1234' }],
                    error: null,
                })),
            })),
            rpc,
        } as any;

        const created = await createInvoiceFromQuote({
            quoteToken: quote.quote_token,
            cart: cart as any,
            customer: { email: 'buyer@example.com', fullName: 'Buyer' },
            idempotencyKey: 'p11-key',
        }, { supabase });

        expect(created.amount).toBe(1234);
        const payload = rpc.mock.calls[0][1];
        expect(payload.p_amount).toBe(1234);
        expect(payload.p_lines[0].unit_price).toBe(1234);
        expect(sumInvoiceLineTotals(payload.p_lines)).toBe(1234);
    });

    it('rejects a quote signed before an admin price change (no silent undercharge)', async () => {
        const baseQuote = buildQuote(
            { region: 'EG', lines: [{ sku: 'digital', quantity: 1, language: 'ar' }] },
            { pricing: basePricing() },
        );
        const supabase = {
            from: vi.fn(() => ({
                select: vi.fn(async () => ({
                    data: [{ key: 'pricing_digital_egp', value: '1234' }],
                    error: null,
                })),
            })),
            rpc: vi.fn(),
        } as any;

        await expect(createInvoiceFromQuote({
            quoteToken: baseQuote.quote_token,
            cart: { region: 'EG', lines: [{ sku: 'digital', quantity: 1, language: 'ar' }] } as any,
            customer: { email: 'buyer@example.com', fullName: 'Buyer' },
            idempotencyKey: 'p11-stale',
        }, { supabase })).rejects.toBeInstanceOf(QuoteStaleError);
    });
});

describe('P1.6 — legacy paths write invoice_lines', () => {
    it.each([
        { tierId: 'digital' as TierId, currency: 'EGP' as const, shipping: 0, discount: 0 },
        { tierId: 'bundle' as TierId, currency: 'EGP' as const, shipping: 199, discount: 10 },
        { tierId: 'coaching_plus' as TierId, currency: 'EGP' as const, shipping: 199, discount: 50 },
        { tierId: 'digital_plus' as TierId, currency: 'USD' as const, shipping: 0, discount: 5 },
    ])('$tierId line totals equal computeAmount', ({ tierId, currency, shipping, discount }) => {
        const lines = buildLegacyInvoiceLinePayload({
            pricing: basePricing(),
            tierId,
            currency,
            quantity: 1,
            shippingCost: shipping,
            discount,
            promoCode: discount ? 'IQ1P-TEST' : undefined,
            shippingProviderId: shipping ? 'eg_standard' : null,
            language: 'en',
        });
        const expected = computeAmount(basePricing(), {
            tierId,
            currency,
            quantity: 1,
            shippingCost: shipping,
            discount,
        });
        expect(sumInvoiceLineTotals(lines)).toBe(expected);
    });

    it('refuses to persist lines whose sum differs from the invoice amount', async () => {
        const lines = buildLegacyInvoiceLinePayload({
            pricing: basePricing(),
            tierId: 'digital',
            currency: 'EGP',
        });
        const supabase = { from: vi.fn() } as any;
        await expect(writeInvoiceLinesForExistingInvoice(supabase, {
            invoiceId: 'inv-mismatch',
            amount: 500,
            lines,
        })).rejects.toBeInstanceOf(InvoiceLineWriteError);
        expect(supabase.from).not.toHaveBeenCalled();
    });
});

describe('P1.5/P1.7 — no legacy SpaceRemit bypass; guest claims use invoice lines', () => {
    it('smart-landing enters invoice-first checkout instead of building a SpaceRemit URL', () => {
        const source = read('features/marketing/SmartBookLanding.tsx');
        expect(source).not.toContain('spaceremit.com/apipay-v2');
        expect(source).toContain("buildCheckoutPlanUrl('digital'");
    });

    it('redeems a guest claim from invoice_lines, not the claim product shortcut', async () => {
        const token = 'phase11-claim-token';
        const now = new Date('2026-11-22T12:00:00.000Z');
        const claim = {
            id: 'claim-1',
            invoice_id: 'inv-1',
            payment_intent_id: 'pi-1',
            email: 'guest@example.com',
            product_id: 'digital',
            status: 'pending',
            expires_at: new Date(now.getTime() + 60_000).toISOString(),
        };
        const state: { op: string; payload?: any } = { op: 'select' };
        const builder: any = {};
        builder.select = vi.fn(() => builder);
        builder.eq = vi.fn(() => builder);
        builder.gt = vi.fn(() => builder);
        builder.update = vi.fn((payload: any) => { state.op = 'update'; state.payload = payload; return builder; });
        builder.maybeSingle = vi.fn(async () => ({ data: claim, error: null }));
        builder.then = (resolve: any) => {
            if (state.op === 'update') return Promise.resolve({ data: [claim], error: null }).then(resolve);
            return Promise.resolve({
                data: [
                    { line_type: 'product', sku: 'digital', product_id: 'digital', metadata: { language: 'ar' } },
                    { line_type: 'shipping', sku: null, product_id: null },
                ],
                error: null,
            }).then(resolve);
        };
        const supabase = {
            from: vi.fn((table: string) => {
                if (table === 'guest_order_claims') return builder;
                if (table === 'invoice_lines') return builder;
                throw new Error(`unexpected table ${table}`);
            }),
        } as any;

        const result = await redeemGuestOrderClaim({
            supabase,
            token,
            userId: 'real-user',
            userEmail: 'guest@example.com',
            now,
        });

        expect(result).toMatchObject({ ok: true, invoiceId: 'inv-1', productId: 'MRX-PROTOCOL' });
        expect(grantMock).toHaveBeenCalledTimes(1);
        expect(grantMock.mock.calls[0][0]).toMatchObject({
            productId: 'MRX-PROTOCOL',
            metadata: { source: 'guest_order_claim', entitlement_source: 'invoice_lines' },
        });
        expect(hashClaimToken(token)).toHaveLength(64);
    });
});

describe('P2 — Fourthwall, shipping capability and strict settlement migration', () => {
    const env = { ...process.env };
    afterEach(() => {
        process.env = { ...env };
    });

    it('Fourthwall refuses non-UUID product mappings before a session is requested', () => {
        process.env.FOURTHWALL_PRODUCT_DIGITAL_BOOK_ID = 'not-a-uuid';
        expect(new FourthwallGateway().resolveProductMapping('digital')).toBeNull();

        process.env.FOURTHWALL_PRODUCT_DIGITAL_BOOK_ID = '3f1a5c62-7d8e-4b9a-9c1d-2e3f4a5b6c7d';
        expect(new FourthwallGateway().resolveProductMapping('digital')).toEqual({
            fourthwallProductId: '3f1a5c62-7d8e-4b9a-9c1d-2e3f4a5b6c7d',
        });
    });

    it('FlatRateProvider advertises itself as a non-carrier price bucket', () => {
        const provider = new FlatRateProvider();
        expect(provider.isLiveCarrier).toBe(false);
        expect(provider.capabilities).toEqual({ quote: true, createShipment: false, track: false });
    });

    it('strict settlement migration contains no 0.01 tolerance', () => {
        const source = read('supabase/migrations/20261122120000_strict_invoice_payment_leg_amounts.sql');
        expect(source).toContain('round(v_target_leg.amount, 2) <> round(p_amount_paid, 2)');
        expect(source).toContain('v_total_paid >= v_invoice.amount');
        expect(source).not.toMatch(/>\s*0\.01|-\s*0\.01/);
    });
});

describe('P0.2 — numeric invoice-line verification', () => {
    it('counts covered, missing and deviating invoices with exact line sums', () => {
        const result = verifyInvoiceLineTotals(
            [
                { id: 'inv-ok', amount: 499 },
                { id: 'inv-sum', amount: 1000 },
                { id: 'inv-missing', amount: 200 },
                { id: 'inv-bad', amount: 300 },
            ],
            [
                { invoice_id: 'inv-ok', line_total: 499 },
                { invoice_id: 'inv-sum', line_total: 400 },
                { invoice_id: 'inv-sum', line_total: 600 },
                { invoice_id: 'inv-bad', line_total: 299.99 },
            ],
        );

        expect(result).toMatchObject({
            invoices_total: 4,
            invoices_with_lines: 3,
            invoices_without_lines: 1,
            matching_invoices: 2,
            deviation_count: 1,
            line_rows: 4,
            total_line_sum: 1798.99,
        });
        expect(result.deviations[0]).toMatchObject({
            invoice_id: 'inv-bad',
            amount: 300,
            lines_total: 299.99,
            deviation: -0.01,
        });
    });
});
