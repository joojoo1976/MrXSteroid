/**
 * Digital Book Delivery Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DigitalBookDelivery } from '../../server/payments/fulfillment/DigitalBookDelivery';

const originalEnv = process.env;

beforeEach(() => {
    vi.resetModules();
    process.env = {
        ...originalEnv,
        DIGITAL_BOOK_STORAGE_BUCKET: 'digital-assets',
        DIGITAL_BOOK_STORAGE_PATH: 'books/MrXSteroid_Digital_Protocol.pdf',
        NEXT_PUBLIC_SITE_URL: 'https://www.mrxsteroid.com',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test_service_role_key',
    };
});

afterEach(() => {
    process.env = originalEnv;
});

// Mock Supabase client
const createMockSupabase = () => ({
    from: vi.fn((table: string) => {
        if (table === 'digital_book_deliveries') {
            return {
                insert: vi.fn().mockResolvedValue({ data: null, error: null }),
                update: vi.fn(() => ({
                    eq: vi.fn().mockResolvedValue({ data: null, error: null }),
                })),
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                    })),
                })),
            };
        }
        if (table === 'digital_book_delivery_log') {
            return {
                insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            };
        }
        if (table === 'manual_fulfillment_queue') {
            return {
                insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            };
        }
        return {};
    }),
});

describe('DigitalBookDelivery', () => {
    let delivery: DigitalBookDelivery;
    let mockSupabase: ReturnType<typeof createMockSupabase>;

    beforeEach(() => {
        mockSupabase = createMockSupabase();
        delivery = new DigitalBookDelivery(mockSupabase as any);
    });

    describe('checkEligibility', () => {
        it('returns eligible for all 5 canonical products', async () => {
            const products = [
                'MRX-PROTOCOL',
                'MRX-TACTICAL',
                'MRX-SMART-PRO',
                'MRX-COACHING-ADDON',
                'MRX-CONSULTATION',
            ];

            for (const productId of products) {
                const result = await delivery.checkEligibility(productId);
                console.log('[TEST DEBUG] result:', result);
                expect(result.isEligible).toBe(true);
                expect(result.productId).toBe(productId);
            }
        });

        it('claims native digital attachment only for the Digital Protocol (digital) product', async () => {
            const protocol = await delivery.checkEligibility('MRX-PROTOCOL');
            expect(protocol.hasNativeDigitalAttachment).toBe(true);

            // Physical / service products do NOT claim unverified native
            // cross-product attachment — they use the secure signed-download path.
            for (const physical of ['MRX-TACTICAL', 'MRX-SMART-PRO', 'MRX-COACHING-ADDON', 'MRX-CONSULTATION']) {
                const result = await delivery.checkEligibility(physical);
                expect(result.hasNativeDigitalAttachment).toBe(false);
            }
        });

        it('returns not eligible for unknown product', async () => {
            const result = await delivery.checkEligibility('UNKNOWN-PRODUCT');
            expect(result.isEligible).toBe(false);
            expect(result.hasNativeDigitalAttachment).toBe(false);
        });
    });

    describe('generateSignedDownloadUrl', () => {
        it('creates delivery record and returns signed URL', async () => {
            mockSupabase.from.mockReturnValueOnce({
                insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            });

            const result = await delivery['generateSignedDownloadUrl']('inv_123', 'customer@example.com');
            expect(result.success).toBe(true);
            expect(result.downloadUrl).toContain('https://www.mrxsteroid.com/digital-book/download?token=');
            expect(result.expiresAt).toBeDefined();
        });

        it('returns error on insert failure', async () => {
            mockSupabase.from.mockReturnValueOnce({
                insert: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
            });

            const result = await delivery['generateSignedDownloadUrl']('inv_123', 'customer@example.com');
            expect(result.success).toBe(false);
            expect(result.errorMessage).toBe('Failed to create delivery record');
        });
    });

    describe('validateAndServeDownload', () => {
        const token = 'valid_token';
        const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

        it('rejects invalid token', async () => {
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                    })),
                })),
            });

            const result = await delivery.validateAndServeDownload(token);
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Invalid or expired download link');
        });

        it('rejects expired token', async () => {
            const expiredDelivery = {
                id: 'del_123',
                token_hash: require('crypto').createHash('sha256').update(token).digest('hex'),
                expires_at: new Date(Date.now() - 1000).toISOString(),
                download_count: 0,
                max_downloads: 3,
                file_name: 'test.pdf',
            };

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({ data: expiredDelivery, error: null }),
                    })),
                })),
            });

            const result = await delivery.validateAndServeDownload(token);
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Download link has expired');
        });

        it('rejects when max downloads exceeded', async () => {
            const maxedDelivery = {
                id: 'del_123',
                token_hash: require('crypto').createHash('sha256').update(token).digest('hex'),
                expires_at: new Date(Date.now() + 86400000).toISOString(),
                download_count: 3,
                max_downloads: 3,
                file_name: 'test.pdf',
            };

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({ data: maxedDelivery, error: null }),
                    })),
                })),
            });

            const result = await delivery.validateAndServeDownload(token);
            expect(result.valid).toBe(false);
            expect(result.errorMessage).toBe('Maximum downloads exceeded');
        });

        it('serves file on valid token', async () => {
            const validDelivery = {
                id: 'del_123',
                token_hash: require('crypto').createHash('sha256').update(token).digest('hex'),
                expires_at: new Date(Date.now() + 86400000).toISOString(),
                download_count: 0,
                max_downloads: 3,
                file_name: 'MrXSteroid_Digital_Protocol.pdf',
            };

            mockSupabase.from
                .mockReturnValueOnce({
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({ data: validDelivery, error: null }),
                        })),
                    })),
                })
                .mockReturnValueOnce({
                    update: vi.fn(() => ({
                        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
                    })),
                });

            const result = await delivery.validateAndServeDownload(token);
            expect(result.valid).toBe(true);
            expect(result.filePath).toBe('books/MrXSteroid_Digital_Protocol.pdf');
            expect(result.fileName).toBe('MrXSteroid_Digital_Protocol.pdf');
            expect(result.mimeType).toBe('application/pdf');
        });
    });

    describe('deliverAfterPurchase', () => {
        it('returns fail closed for non-eligible product', async () => {
            const result = await delivery.deliverAfterPurchase({
                invoiceId: 'inv_123',
                customerEmail: 'test@example.com',
                productId: 'UNKNOWN',
            });
            expect(result.success).toBe(false);
            expect(result.method).toBe('manual_queue');
        });

        it('returns success for eligible product', async () => {
            mockSupabase.from.mockReturnValueOnce({
                insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            });

            const result = await delivery.deliverAfterPurchase({
                invoiceId: 'inv_123',
                customerEmail: 'test@example.com',
                productId: 'MRX-PROTOCOL',
            });
            expect(result.success).toBe(true);
        });

        it('delivers an eligible physical purchase via the secure signed URL (not claimed native)', async () => {
            mockSupabase.from.mockReturnValueOnce({
                insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            });

            const result = await delivery.deliverAfterPurchase({
                invoiceId: 'inv_123',
                customerEmail: 'test@example.com',
                productId: 'MRX-TACTICAL',
            });
            // Physical product: native cross-product attachment is NOT claimed.
            // The Digital Book is delivered via the time-limited, single-use
            // signed URL, never a permanent public URL.
            expect(result.success).toBe(true);
            expect(result.method).toBe('signed_url');
            expect(result.downloadUrl).toContain('/digital-book/download?token=');
            expect(result.expiresAt).toBeDefined();
        });

        it('never claims native method (no permanent public URL) even for the digital product without a verified order', async () => {
            mockSupabase.from.mockReturnValueOnce({
                insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            });

            const result = await delivery.deliverAfterPurchase({
                invoiceId: 'inv_123',
                customerEmail: 'test@example.com',
                productId: 'MRX-PROTOCOL',
                fourthwallOrderId: '00aa4abd-5778-4199-8161-0b49b2f212e5',
            });
            // Native delivery is only true when proven; without evidence the
            // delivery falls back to the signed URL.
            expect(result.success).toBe(true);
            expect(result.method).toBe('signed_url');
        });
    });
});

describe('createDigitalBookDelivery factory', () => {
    it('throws when Supabase env vars missing', async () => {
        delete process.env.SUPABASE_URL;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
        await expect(async () => {
            const { createDigitalBookDelivery } = await import('../../server/payments/fulfillment/DigitalBookDelivery');
            createDigitalBookDelivery();
        }).rejects.toThrow('Missing Supabase admin env vars');
    });
});