import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { paymentService } from '@/shared/lib/payment.service';
import { supabase } from '@/shared/lib/supabase';

// Mock external payment gateway
const mockSpaceremit = {
    initialize: vi.fn(),
    createTransaction: vi.fn(),
    verifyTransaction: vi.fn()
};

vi.mock('spaceremit', () => ({
    default: vi.fn(() => mockSpaceremit)
}));

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

describe('Payment Service Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initializePayment', () => {
        it('should initialize payment successfully', async () => {
            const paymentData = {
                userId: 'test-user-id',
                amount: 99.99,
                currency: 'USD',
                productId: 'test-product',
                productName: 'Test Product'
            };

            const mockTransaction = {
                id: 'txn_test_transaction',
                status: 'initialized',
                amount: 99.99,
                currency: 'USD',
                redirect_url: 'https://spaceremit.com/pay/test_transaction'
            };

            mockSpaceremit.createTransaction.mockResolvedValue({ data: mockTransaction, error: null });

            vi.spyOn(supabase, 'from').mockReturnValue({
                insert: vi.fn().mockResolvedValue({ data: [mockTransaction], error: null })
            } as any);

            const result = await paymentService.initializePayment(paymentData);

            expect(result).toEqual(mockTransaction);
            expect(mockSpaceremit.createTransaction).toHaveBeenCalledWith({
                amount: paymentData.amount,
                currency: paymentData.currency,
                reference_id: expect.any(String),
                customer_email: expect.any(String),
                callback_url: expect.any(String),
                success_url: expect.any(String),
                cancel_url: expect.any(String)
            });
        });

        it('should handle payment initialization errors', async () => {
            const paymentData = {
                userId: 'test-user-id',
                amount: 99.99,
                currency: 'USD',
                productId: 'test-product',
                productName: 'Test Product'
            };

            const mockError = new Error('Payment gateway unavailable');

            mockSpaceremit.createTransaction.mockResolvedValue({ data: null, error: mockError });

            await expect(paymentService.initializePayment(paymentData))
                .rejects
                .toThrow('Payment gateway unavailable');
        });

        it('should validate payment data', async () => {
            await expect(paymentService.initializePayment({} as any))
                .rejects
                .toThrow('Payment data is required');

            await expect(paymentService.initializePayment({
                userId: 'test-user-id',
                amount: -10, // Invalid amount
                currency: 'USD',
                productId: 'test-product',
                productName: 'Test Product'
            } as any))
                .rejects
                .toThrow('Amount must be positive');

            await expect(paymentService.initializePayment({
                userId: 'test-user-id',
                amount: 99.99,
                currency: 'INVALID', // Invalid currency
                productId: 'test-product',
                productName: 'Test Product'
            } as any))
                .rejects
                .toThrow('Invalid currency');
        });

        it('should validate user ID format', async () => {
            await expect(paymentService.initializePayment({
                userId: 'invalid user id!', // Invalid format
                amount: 99.99,
                currency: 'USD',
                productId: 'test-product',
                productName: 'Test Product'
            } as any))
                .rejects
                .toThrow('Invalid user ID format');
        });
    });

    describe('verifyPayment', () => {
        it('should verify payment successfully', async () => {
            const transactionId = 'txn_test_transaction';
            const mockPaymentData = {
                id: transactionId,
                status: 'completed',
                amount: 99.99,
                currency: 'USD',
                user_id: 'test-user-id'
            };

            const mockVerification = {
                success: true,
                data: {
                    status: 'completed',
                    amount: 99.99,
                    currency: 'USD',
                    reference: transactionId
                }
            };

            mockSpaceremit.verifyTransaction.mockResolvedValue(mockVerification);

            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: [mockPaymentData], error: null })
            } as any);

            const result = await paymentService.verifyPayment(transactionId);

            expect(result).toEqual({
                isValid: true,
                paymentData: mockPaymentData
            });
        });

        it('should handle verification failure', async () => {
            const transactionId = 'invalid-transaction-id';
            const mockVerification = {
                success: false,
                error: 'Transaction not found'
            };

            mockSpaceremit.verifyTransaction.mockResolvedValue(mockVerification);

            const result = await paymentService.verifyPayment(transactionId);

            expect(result).toEqual({
                isValid: false,
                error: 'Transaction not found'
            });
        });

        it('should handle non-existent transaction', async () => {
            const transactionId = 'non-existent-transaction';

            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: [], error: null })
            } as any);

            await expect(paymentService.verifyPayment(transactionId))
                .rejects
                .toThrow('Payment record not found');
        });

        it('should validate transaction ID', async () => {
            await expect(paymentService.verifyPayment(''))
                .rejects
                .toThrow('Transaction ID is required');

            await expect(paymentService.verifyPayment('invalid id!'))
                .rejects
                .toThrow('Invalid transaction ID format');
        });
    });

    describe('updatePaymentStatus', () => {
        it('should update payment status successfully', async () => {
            const transactionId = 'txn_test_transaction';
            const newStatus = 'completed';
            const mockUpdatedPayment = {
                id: transactionId,
                status: newStatus,
                updated_at: new Date().toISOString()
            };

            vi.spyOn(supabase, 'from').mockReturnValue({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: [mockUpdatedPayment], error: null })
            } as any);

            const result = await paymentService.updatePaymentStatus(transactionId, newStatus);

            expect(result).toEqual(mockUpdatedPayment);
            expect(supabase.from).toHaveBeenCalledWith('payments');
        });

        it('should validate payment status', async () => {
            await expect(paymentService.updatePaymentStatus('txn_test', 'invalid_status'))
                .rejects
                .toThrow('Invalid payment status');

            // Test valid statuses
            const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
            for (const status of validStatuses) {
                vi.spyOn(supabase, 'from').mockReturnValue({
                    update: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockResolvedValue({ data: [{ status }], error: null })
                } as any);

                await expect(paymentService.updatePaymentStatus('txn_test', status))
                    .resolves
                    .toBeDefined();
            }
        });

        it('should validate transaction ID', async () => {
            await expect(paymentService.updatePaymentStatus('', 'completed'))
                .rejects
                .toThrow('Transaction ID is required');

            await expect(paymentService.updatePaymentStatus('invalid id!', 'completed'))
                .rejects
                .toThrow('Invalid transaction ID format');
        });
    });

    describe('createPaymentRecord', () => {
        it('should create payment record successfully', async () => {
            const paymentData = {
                transaction_id: 'txn_test_new',
                user_id: 'test-user-id',
                amount: 99.99,
                currency: 'USD',
                status: 'pending',
                product_id: 'test-product',
                customer_email: 'test@example.com'
            };

            const mockCreatedPayment = {
                ...paymentData,
                id: 'db_record_id',
                created_at: new Date().toISOString()
            };

            vi.spyOn(supabase, 'from').mockReturnValue({
                insert: vi.fn().mockResolvedValue({ data: [mockCreatedPayment], error: null })
            } as any);

            const result = await paymentService.createPaymentRecord(paymentData);

            expect(result).toEqual(mockCreatedPayment);
            expect(supabase.from).toHaveBeenCalledWith('payments');
        });

        it('should handle duplicate transaction IDs', async () => {
            const paymentData = {
                transaction_id: 'duplicate-txn',
                user_id: 'test-user-id',
                amount: 99.99,
                currency: 'USD',
                status: 'pending',
                product_id: 'test-product',
                customer_email: 'test@example.com'
            };

            const mockError = { message: 'duplicate key value violates unique constraint', details: 'transaction_id already exists' };

            vi.spyOn(supabase, 'from').mockReturnValue({
                insert: vi.fn().mockResolvedValue({ data: null, error: mockError })
            } as any);

            await expect(paymentService.createPaymentRecord(paymentData))
                .rejects
                .toThrow('A payment with this transaction ID already exists');
        });

        it('should validate payment record data', async () => {
            await expect(paymentService.createPaymentRecord({} as any))
                .rejects
                .toThrow('Payment record data is required');

            await expect(paymentService.createPaymentRecord({
                transaction_id: 'test-txn',
                user_id: 'test-user-id',
                amount: -50, // Invalid amount
                currency: 'USD',
                status: 'pending',
                product_id: 'test-product',
                customer_email: 'test@example.com'
            } as any))
                .rejects
                .toThrow('Amount must be positive');
        });
    });

    describe('validatePaymentData', () => {
        it('should validate complete payment data', () => {
            const validData = {
                userId: 'valid-user-id',
                amount: 99.99,
                currency: 'USD',
                productId: 'valid-product',
                productName: 'Valid Product'
            };

            expect(paymentService.validatePaymentData(validData)).toBe(true);
        });

        it('should reject invalid amounts', () => {
            expect(paymentService.validatePaymentData({
                userId: 'valid-user-id',
                amount: -10,
                currency: 'USD',
                productId: 'valid-product',
                productName: 'Valid Product'
            })).toBe(false);

            expect(paymentService.validatePaymentData({
                userId: 'valid-user-id',
                amount: 0,
                currency: 'USD',
                productId: 'valid-product',
                productName: 'Valid Product'
            })).toBe(false); // Amount should be > 0
        });

        it('should reject invalid currencies', () => {
            expect(paymentService.validatePaymentData({
                userId: 'valid-user-id',
                amount: 99.99,
                currency: 'INVALID',
                productId: 'valid-product',
                productName: 'Valid Product'
            })).toBe(false);
        });

        it('should reject invalid user IDs', () => {
            expect(paymentService.validatePaymentData({
                userId: 'invalid user id!',
                amount: 99.99,
                currency: 'USD',
                productId: 'valid-product',
                productName: 'Valid Product'
            })).toBe(false);
        });
    });

    describe('validateTransactionId', () => {
        it('should accept valid transaction IDs', () => {
            expect(paymentService.validateTransactionId('txn_valid_transaction')).toBe(true);
            expect(paymentService.validateTransactionId('pay_ABC123')).toBe(true);
            expect(paymentService.validateTransactionId('ch_abc-def_123')).toBe(true);
        });

        it('should reject invalid transaction IDs', () => {
            expect(paymentService.validateTransactionId('')).toBe(false);
            expect(paymentService.validateTransactionId('invalid id!')).toBe(false);
            expect(paymentService.validateTransactionId('spaces not allowed')).toBe(false);
            expect(paymentService.validateTransactionId('special<chars>')).toBe(false);
        });
    });
});