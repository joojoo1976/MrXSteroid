import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbService } from '../../shared/lib/db-service';
import { supabase } from '../../shared/lib/supabase';

// Mock the supabase client
vi.mock('../../shared/lib/supabase', () => ({
    supabase: {
        from: vi.fn(),
        rpc: vi.fn(),
        auth: {
            getUser: vi.fn()
        }
    }
}));

describe('Database Service Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchUserData', () => {
        it('should fetch user data successfully', async () => {
            const userId = '7be3039d-27b0-4f51-85e3-c392f44c77c6';
            const mockUserData = {
                id: userId,
                email: 'test@example.com',
                full_name: 'Test User',
                user_name: 'testuser',
                subscription_status: 'active',
                role: 'user'
            };

            const mockResponse: { data: typeof mockUserData[]; error: null } = {
                data: [mockUserData],
                error: null
            };

            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue(mockResponse)
            } as any);

            const result = await dbService.fetchUserData(userId);

            expect(result).toEqual(mockUserData);
            expect(supabase.from).toHaveBeenCalledWith('profiles');
        });

        it('should handle user not found', async () => {
            const userId = '7be3039d-0000-0000-0000-c392f44c77c6';
            const mockResponse: { data: never[]; error: null } = {
                data: [],
                error: null
            };

            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue(mockResponse)
            } as any);

            const result = await dbService.fetchUserData(userId);

            expect(result).toBeNull();
        });

        it('should handle database errors', async () => {
            const userId = '7be3039d-27b0-4f51-85e3-c392f44c77c6';
            const mockError = new Error('Database connection failed');

            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: null, error: mockError })
            } as any);

            await expect(dbService.fetchUserData(userId))
                .rejects
                .toThrow('Database connection failed');
        });

        it('should validate user ID format', async () => {
            await expect(dbService.fetchUserData('invalid-id!'))
                .rejects
                .toThrow('Invalid user ID format');

            await expect(dbService.fetchUserData(''))
                .rejects
                .toThrow('User ID is required');
        });
    });

    describe('updateUserProfile', () => {
        it('should update user profile successfully', async () => {
            const userId = '7be3039d-27b0-4f51-85e3-c392f44c77c6';
            const updateData = {
                full_name: 'Updated Name',
                user_name: 'updateduser'
            };

            const mockResponse: { data: Array<typeof updateData & { id: string }>; error: null } = {
                data: [{ ...updateData, id: userId }],
                error: null
            };

            vi.spyOn(supabase, 'from').mockReturnValue({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockResolvedValue(mockResponse)
            } as any);

            const result = await dbService.updateUserProfile(userId, updateData);

            expect(result).toEqual({ ...updateData, id: userId });
            expect(supabase.from).toHaveBeenCalledWith('profiles');
        });

        it('should handle update errors', async () => {
            const userId = '7be3039d-27b0-4f51-85e3-c392f44c77c6';
            const updateData = { full_name: 'Updated Name' };
            const mockError = new Error('Update failed');

            vi.spyOn(supabase, 'from').mockReturnValue({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockResolvedValue({ data: null, error: mockError })
            } as any);

            await expect(dbService.updateUserProfile(userId, updateData))
                .rejects
                .toThrow('Update failed');
        });

        it('should validate user ID and update data', async () => {
            await expect(dbService.updateUserProfile('', { full_name: 'Test' }))
                .rejects
                .toThrow('User ID is required');

            await expect(dbService.updateUserProfile('valid-id', {}))
                .rejects
                .toThrow('Update data is required');
        });

        it('should sanitize update data', async () => {
            const userId = '7be3039d-27b0-4f51-85e3-c392f44c77c6';
            const unsafeData = {
                full_name: 'Test User'
            };

            const mockResponse: { data: Array<typeof unsafeData & { id: string }>; error: null } = {
                data: [{ ...unsafeData, id: userId }],
                error: null
            };

            const fromMock = vi.fn().mockReturnValue({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockResolvedValue(mockResponse)
            });
            vi.spyOn(supabase, 'from').mockImplementation(fromMock);

            await dbService.updateUserProfile(userId, unsafeData);

            expect(fromMock).toHaveBeenCalledWith('profiles');
        });
    });

    describe('createOrder', () => {
        it('should create an order successfully', async () => {
            const orderData = {
                user_id: '7be3039d-27b0-4f51-85e3-c392f44c77c6',
                total_amount: 99.99,
                currency: 'USD',
                shipping_address: '123 Test St',
                phone_number: '1234567890',
                status: 'pending'
            };

            const mockResponse: { data: Array<typeof orderData & { id: string }>; error: null } = {
                data: [{ ...orderData, id: 'new-order-id' }],
                error: null
            };

            vi.spyOn(supabase, 'from').mockReturnValue({
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockResolvedValue(mockResponse)
            } as any);

            const result = await dbService.createOrder(orderData);

            expect(result).toEqual({ ...orderData, id: 'new-order-id' });
            expect(supabase.from).toHaveBeenCalledWith('orders');
        });

        it('should handle order creation errors', async () => {
            const orderData = {
                user_id: '7be3039d-27b0-4f51-85e3-c392f44c77c6',
                total_amount: 99.99,
                currency: 'USD',
                shipping_address: '123 Test St',
                phone_number: '1234567890',
                status: 'pending'
            };
            const mockError = new Error('Order creation failed');

            vi.spyOn(supabase, 'from').mockReturnValue({
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockResolvedValue({ data: null, error: mockError })
            } as any);

            await expect(dbService.createOrder(orderData))
                .rejects
                .toThrow('Order creation failed');
        });

        it('should validate order data', async () => {
            await expect(dbService.createOrder({} as any))
                .rejects
                .toThrow('Order data is required');

            await expect(dbService.createOrder({
                user_id: '7be3039d-27b0-4f51-85e3-c392f44c77c6',
                total_amount: -10,
                currency: 'USD',
                shipping_address: '123 Test St',
                phone_number: '1234567890',
                status: 'pending'
            }))
                .rejects
                .toThrow('Order amount must be positive');
        });
    });

    describe('fetchUserOrders', () => {
        it('should fetch user orders successfully', async () => {
            const userId = '7be3039d-27b0-4f51-85e3-c392f44c77c6';
            const mockOrders = [
                { id: 'order1', user_id: userId, total_amount: 99.99, status: 'delivered' },
                { id: 'order2', user_id: userId, total_amount: 149.99, status: 'pending' }
            ];

            const mockResponse: { data: typeof mockOrders; error: null } = {
                data: mockOrders,
                error: null
            };

            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue(mockResponse)
            } as any);

            const result = await dbService.fetchUserOrders(userId);

            expect(result).toEqual(mockOrders);
            expect(supabase.from).toHaveBeenCalledWith('orders');
        });

        it('should handle no orders found', async () => {
            const userId = '7be3039d-27b0-4f51-85e3-c392f44c77c6';
            const mockResponse: { data: never[]; error: null } = {
                data: [],
                error: null
            };

            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue(mockResponse)
            } as any);

            const result = await dbService.fetchUserOrders(userId);

            expect(result).toEqual([]);
        });

        it('should validate user ID', async () => {
            await expect(dbService.fetchUserOrders(''))
                .rejects
                .toThrow('User ID is required');

            await expect(dbService.fetchUserOrders('invalid!id'))
                .rejects
                .toThrow('Invalid user ID format');
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status successfully', async () => {
            const orderId = '7be3039d-27b0-4f51-85e3-c392f44c77c6';
            const newStatus = 'delivered';
            const mockUpdatedOrder = {
                id: orderId,
                status: newStatus,
                updated_at: new Date().toISOString()
            };

            const mockResponse: { data: typeof mockUpdatedOrder[]; error: null } = {
                data: [mockUpdatedOrder],
                error: null
            };

            vi.spyOn(supabase, 'from').mockReturnValue({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockResolvedValue(mockResponse)
            } as any);

            const result = await dbService.updateOrderStatus(orderId, newStatus);

            expect(result).toEqual(mockUpdatedOrder);
        });

        it('should validate status transitions', async () => {
            await expect(dbService.updateOrderStatus('order-id', 'invalid-status'))
                .rejects
                .toThrow('Invalid order status');

            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
            for (const status of validStatuses) {
                vi.spyOn(supabase, 'from').mockReturnValue({
                    update: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    select: vi.fn().mockResolvedValue({ data: [{ status }], error: null })
                } as any);

                await expect(dbService.updateOrderStatus('order-id', status))
                    .resolves
                    .toBeDefined();
            }
        });

        it('should validate order ID', async () => {
            await expect(dbService.updateOrderStatus('', 'completed'))
                .rejects
                .toThrow('Order ID is required');
        });
    });

    describe('validateInputs', () => {
        it('should validate user ID format', () => {
            expect(dbService.validateInputs.isValidId('valid-user-id')).toBe(true);
            expect(dbService.validateInputs.isValidId('valid_user_id')).toBe(true);
            expect(dbService.validateInputs.isValidId('valid-user123')).toBe(true);
            expect(dbService.validateInputs.isValidId('invalid id')).toBe(false);
            expect(dbService.validateInputs.isValidId('')).toBe(false);
        });

        it('should validate email format', () => {
            expect(dbService.validateInputs.isValidEmail('test@example.com')).toBe(true);
            expect(dbService.validateInputs.isValidEmail('user.name+tag@example.co.uk')).toBe(true);
            expect(dbService.validateInputs.isValidEmail('invalid')).toBe(false);
            expect(dbService.validateInputs.isValidEmail('')).toBe(false);
        });

        it('should validate amount', () => {
            expect(dbService.validateInputs.isValidAmount(99.99)).toBe(true);
            expect(dbService.validateInputs.isValidAmount(0)).toBe(true);
            expect(dbService.validateInputs.isValidAmount(-1)).toBe(false);
            expect(dbService.validateInputs.isValidAmount(NaN)).toBe(false);
        });

        it('should validate status', () => {
            expect(dbService.validateInputs.isValidStatus('active')).toBe(true);
            expect(dbService.validateInputs.isValidStatus('inactive')).toBe(true);
            expect(dbService.validateInputs.isValidStatus('invalid')).toBe(false);
        });
    });
});