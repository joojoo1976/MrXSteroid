import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FlatRateProvider, FLAT_RATE_SERVICE_CODE } from '../../server/shipping/FlatRateProvider';
import { buildQuote, QuoteValidationError } from '../../server/payments/quote';
import { buildInvoiceLinePayload } from '../../server/payments/invoice/invoiceCreationService';
import { DigitalBookDelivery } from '../../server/payments/fulfillment/DigitalBookDelivery';
import {
    grantEntitlementsFromInvoice,
    canonicalProductIdForInvoiceLine,
} from '../../server/payments/entitlementService';

const originalEnv = process.env;

beforeEach(() => {
    process.env = { ...originalEnv, QUOTE_TOKEN_SECRET: 'phase7-quote-secret' };
});

afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
});

const egPhysicalCart = {
    region: 'EG' as const,
    lines: [{ sku: 'bundle', quantity: 1, language: 'ar' as const }],
    shippingAddress: { address: '1 Test Street', city: 'Cairo' },
};

describe('Phase 7 — FlatRateProvider', () => {
    it('quotes exactly 199 EGP for the Egypt local bucket', () => {
        const provider = new FlatRateProvider();
        const quote = provider.quote({ region: 'EGYPT', currency: 'EGP', requestedProviderId: 'eg_standard' });
        expect(quote).toMatchObject({
            providerId: 'eg_standard',
            serviceCode: FLAT_RATE_SERVICE_CODE,
            amount: 199,
            currency: 'EGP',
            isFlatRate: true,
        });
    });

    it('is explicit that no carrier is integrated', async () => {
        const provider = new FlatRateProvider();
        const shipment = await provider.createShipment({
            invoiceId: 'inv-1', providerId: 'eg_standard', serviceCode: 'flat_rate',
            address: { city: 'Cairo' }, amount: 199, currency: 'EGP',
        });
        const tracking = await provider.track('TRACK-1');
        expect(shipment).toMatchObject({ success: false, reason: 'carrier_not_integrated' });
        expect(tracking).toMatchObject({ found: false, status: 'not_integrated' });
    });
});

describe('Phase 7 — shipping line and totals', () => {
    it('stores provider_id, service_code, quote_id and amount on the shipping line', () => {
        const quote = buildQuote(egPhysicalCart);
        const shipping = quote.lines.find((line) => line.line_type === 'shipping');

        expect(shipping).toBeDefined();
        expect(shipping).toMatchObject({
            unit_price: 199,
            line_total: 199,
            metadata: {
                provider_id: 'eg_standard',
                service_code: FLAT_RATE_SERVICE_CODE,
                amount: 199,
            },
        });
        expect(shipping?.metadata.quote_id).toBe(quote.cart_hash);
        expect(quote.total).toBe(
            Math.round(quote.lines.reduce((sum, line) => sum + line.line_total, 0) * 100) / 100
        );
        expect(quote.total).toBe(quote.subtotal + quote.shipping - quote.discount + quote.tax);
    });

    it('passes the shipping line metadata unchanged into the invoice payload', () => {
        const quote = buildQuote(egPhysicalCart);
        const lines = buildInvoiceLinePayload(quote);
        const shipping = lines.find((line) => line.line_type === 'shipping') as any;

        expect(shipping.metadata).toMatchObject({
            provider_id: 'eg_standard',
            service_code: FLAT_RATE_SERVICE_CODE,
            amount: 199,
            quote_id: quote.cart_hash,
        });
    });
});

describe('Phase 7 — book language', () => {
    it('persists the selected language on the product and invoice line', () => {
        const quote = buildQuote(egPhysicalCart);
        const product = quote.lines.find((line) => line.line_type === 'product');
        expect(product?.language).toBe('ar');

        const payload = buildInvoiceLinePayload(quote);
        const productLine = payload.find((line) => line.line_type === 'product') as any;
        expect(productLine.language).toBe('ar');
    });

    it('refuses a book invoice with no language', () => {
        expect(() => buildQuote({
            region: 'EG',
            lines: [{ sku: 'bundle', quantity: 1 }],
            shippingAddress: { address: '1 Test Street', city: 'Cairo' },
        })).toThrow(QuoteValidationError);

        try {
            buildQuote({
                region: 'EG',
                lines: [{ sku: 'bundle', quantity: 1 }],
                shippingAddress: { address: '1 Test Street', city: 'Cairo' },
            });
        } catch (error) {
            expect((error as QuoteValidationError).code).toBe('LANGUAGE_REQUIRED');
        }
    });

    it('delivers the Arabic asset, never the English one, when language=ar', async () => {
        const inserted: any[] = [];
        const mockSupabase = {
            from: vi.fn((table: string) => {
                if (table === 'digital_book_deliveries') {
                    return {
                        insert: vi.fn(async (row: any) => { inserted.push(row); return { data: null, error: null }; }),
                    };
                }
                if (table === 'digital_book_delivery_log' || table === 'manual_fulfillment_queue') {
                    return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) };
                }
                return {};
            }),
        };
        const delivery = new DigitalBookDelivery(mockSupabase as any);
        const result = await delivery.deliverAfterPurchase({
            invoiceId: 'inv-ar',
            customerEmail: 'ar@example.com',
            productId: 'MRX-PROTOCOL',
            language: 'ar',
        });

        expect(result.success).toBe(true);
        expect(inserted[0].file_name).toBe('MrXSteroid_Digital_Protocol_ar.pdf');
    });
});

describe('Phase 7 — entitlements from invoice lines', () => {
    it('maps line SKUs and ignores shipping/discount lines', () => {
        expect(canonicalProductIdForInvoiceLine({ line_type: 'product', sku: 'digital' })).toBe('MRX-PROTOCOL');
        expect(canonicalProductIdForInvoiceLine({ line_type: 'product', sku: 'bundle_plus' })).toBe('MRX-TACTICAL');
        expect(canonicalProductIdForInvoiceLine({ line_type: 'addon', sku: 'coaching' })).toBe('MRX-COACHING-ADDON');
        expect(canonicalProductIdForInvoiceLine({ line_type: 'service', sku: 'consultation' })).toBe('MRX-CONSULTATION');
        expect(canonicalProductIdForInvoiceLine({ line_type: 'shipping', sku: null })).toBeNull();
        expect(canonicalProductIdForInvoiceLine({ line_type: 'discount', sku: 'PROMO' })).toBeNull();
    });

    it('grants from invoice_lines with the line language in metadata', async () => {
        const upserts: any[] = [];
        const mockSupabase = {
            from: vi.fn((table: string) => {
                if (table === 'invoice_lines') {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn().mockResolvedValue({
                                data: [
                                    { line_type: 'product', sku: 'digital', language: 'ar', qty: 1, metadata: { quote: true } },
                                    { line_type: 'shipping', sku: null, language: null, qty: 1, metadata: { amount: 199 } },
                                ],
                                error: null,
                            }),
                        })),
                    };
                }
                if (table === 'entitlements') {
                    return {
                        upsert: vi.fn((row: any) => {
                            upserts.push(row);
                            return {
                                select: vi.fn(() => ({
                                    single: vi.fn().mockResolvedValue({ data: { id: 'ent-1' }, error: null }),
                                })),
                            };
                        }),
                    };
                }
                return {};
            }),
        };

        const result = await grantEntitlementsFromInvoice({
            userId: 'user-1',
            invoiceId: 'inv-1',
            paymentIntentId: 'pi-1',
            fallbackProductId: 'digital',
        }, mockSupabase as any);

        expect(result).toMatchObject({ success: true, source: 'invoice_lines', entitlementIds: ['ent-1'] });
        expect(upserts).toHaveLength(1);
        expect(upserts[0]).toMatchObject({
            product_id: 'MRX-PROTOCOL',
            invoice_id: 'inv-1',
            metadata: { language: 'ar', source: 'invoice_lines', invoice_line_sku: 'digital' },
        });
    });
});
