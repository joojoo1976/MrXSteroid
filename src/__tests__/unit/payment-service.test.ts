import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from '@/shared/lib/payment.service';
import { supabase } from '@/shared/lib/supabase';

// Mock supabase
vi.mock('@/shared/lib/supabase', () => ({
    supabase: {
        from: vi.fn(),
        rpc: vi.fn(),
        auth: {
            getUser: vi.fn()
        }
    }
}));

// Mock env
vi.mock('@/config/env', () => ({
    env: {
        SPACEREMIT_PUBLIC_KEY: 'pk_test_valid_key_for_testing',
        SPACEREMIT_API_URL: 'https://api.spaceremit.com/api/v2',
        SPACEREMIT_CALLBACK_URL: 'https://example.com/payment/callback',
        PAYMENT_CANCEL_URL: 'https://example.com/payment/cancel'
    }
}));

describe('Payment Service Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initiatePayment', () => {
        it('should initiate payment and return a session', async () => {
            const paymentData = {
                userId: 'test-user-id',
                orderId: 'order-123',
                amount: 99.99,
                currency: 'USD' as const,
                productId: 'test-product',
                productName: 'Test Product',
                email: 'test@example.com',
                customerName: 'Test User',
                quantity: 1,
                locale: 'en' as const
            };

            vi.spyOn(supabase, 'from').mockReturnValue({
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: 'db-record-id' }, error: null })
            } as never);

            // Mock window.location.href
            Object.defineProperty(window, 'location', {
                value: { href: '' },
                writable: true
            });

            const result = await paymentService.initiatePayment(paymentData);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.transactionId).toMatch(/^MRX_/);
                expect(result.data.checkoutUrl).toContain('spaceremit.com');
            }
        });

        it('should handle database errors gracefully', async () => {
            const paymentData = {
                userId: 'test-user-id',
                orderId: 'order-123',
                amount: 99.99,
                currency: 'USD' as const,
                productId: 'test-product',
                productName: 'Test Product',
                email: 'test@example.com',
                customerName: 'Test User',
                quantity: 1,
                locale: 'en' as const
            };

            vi.spyOn(supabase, 'from').mockReturnValue({
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') })
            } as never);

            const result = await paymentService.initiatePayment(paymentData);

            expect(result.success).toBe(false);
            if (result.success === false) {
                expect(result.error.code).toBe('DB_INSERT_FAILED');
            }
        });
    });

    describe('checkTransactionStatus', () => {
        it('should return transaction status successfully', async () => {
            const transactionId = 'MRX_TESTID_ABC123';
            const mockPaymentData = {
                transaction_id: transactionId,
                status: 'completed',
                amount: 99.99,
                currency: 'USD',
                updated_at: new Date().toISOString(),
                error_message: null as string | null
            };

            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: mockPaymentData, error: null })
            } as never);

            const result = await paymentService.checkTransactionStatus(transactionId);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.status).toBe('completed');
                expect(result.data.transactionId).toBe(transactionId);
            }
        });

        it('should return error when transaction not found', async () => {
            const transactionId = 'NONEXISTENT';

            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: new Error('Row not found') })
            } as never);

            const result = await paymentService.checkTransactionStatus(transactionId);

            expect(result.success).toBe(false);
            if (result.success === false) {
                expect(result.error.code).toBe('STATUS_CHECK_FAILED');
            }
        });
    });

    describe('createInvoice', () => {
        it('should create invoice via API successfully', async () => {
            const invoiceRequest = {
                userId: 'user-123',
                tierId: 'tier-pro',
                amount: 99.99,
                currency: 'USD',
                country: 'US',
                email: 'test@example.com',
                fullName: 'Test User'
            };

            // Mock fetch
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                clone: () => ({ text: () => Promise.resolve('') }),
                json: () => Promise.resolve({
                    success: true,
                    invoiceId: 'inv_12345',
                    redirectUrl: 'https://payment.example.com/pay/inv_12345',
                    gateway: 'spaceremit'
                })
            } as never);

            const result = await paymentService.createInvoice(invoiceRequest);

            expect(result.success).toBe(true);
            expect(result.invoiceId).toBe('inv_12345');
            expect(result.gateway).toBe('spaceremit');
        });

        it('should handle API failure gracefully', async () => {
            const invoiceRequest = {
                userId: 'user-123',
                tierId: 'tier-pro',
                amount: 99.99,
                currency: 'USD',
                country: 'US',
                email: 'test@example.com',
                fullName: 'Test User'
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                clone: () => ({ text: () => Promise.resolve('Internal Server Error') }),
                json: () => Promise.resolve({ success: false, error: 'Payment gateway unavailable' })
            } as never);

            const result = await paymentService.createInvoice(invoiceRequest);

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });
});