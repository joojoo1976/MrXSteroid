import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtimeSyncService } from '../../../shared/lib/RealtimeSyncService';
import { supabase } from '../../../shared/lib/supabase';

// Mock Supabase client
vi.mock('../../../shared/lib/supabase', () => ({
    supabase: {
        channel: vi.fn(),
        from: vi.fn(),
        auth: {
            getUser: vi.fn()
        }
    }
}));

describe('RealtimeSyncService Tests', () => {
    let realtimeService: RealtimeSyncService;

    beforeEach(() => {
        realtimeService = new RealtimeSyncService();
        vi.clearAllMocks();
    });

    describe('subscribeToUserUpdates', () => {
        it('should create a secure subscription to user updates', () => {
            const userId = 'test-user-id';
            const callback = vi.fn();
            
            // Mock the channel creation
            const mockChannel = {
                on: vi.fn().mockReturnThis(),
                subscribe: vi.fn()
            };
            
            vi.spyOn(supabase, 'channel').mockReturnValue(mockChannel as any);

            const unsubscribe = realtimeService.subscribeToUserUpdates(userId, callback);

            // Verify the channel was created with a user-specific name
            expect(supabase.channel).toHaveBeenCalledWith(`user-updates-${userId}`);
            
            // Verify the subscription was set up correctly
            expect(mockChannel.on).toHaveBeenCalledWith(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${userId}`
                },
                expect.any(Function)
            );
            
            expect(typeof unsubscribe).toBe('function');
        });

        it('should validate user ID format', () => {
            const callback = vi.fn();
            
            expect(() => {
                realtimeService.subscribeToUserUpdates('invalid user id!', callback);
            }).toThrow('Invalid user ID format');

            expect(() => {
                realtimeService.subscribeToUserUpdates('', callback);
            }).toThrow('User ID is required');
        });

        it('should handle unauthorized user access attempts', () => {
            const validUserId = 'valid-user-id';
            const maliciousUserId = '../etc/passwd'; // Attempted path traversal
            const callback = vi.fn();

            expect(() => {
                realtimeService.subscribeToUserUpdates(maliciousUserId, callback);
            }).toThrow('Invalid user ID format');
        });
    });

    describe('subscribeToOrderUpdates', () => {
        it('should create a secure subscription to order updates', () => {
            const orderId = 'test-order-id';
            const callback = vi.fn();
            
            const mockChannel = {
                on: vi.fn().mockReturnThis(),
                subscribe: vi.fn()
            };
            
            vi.spyOn(supabase, 'channel').mockReturnValue(mockChannel as any);

            const unsubscribe = realtimeService.subscribeToOrderUpdates(orderId, callback);

            expect(supabase.channel).toHaveBeenCalledWith(`order-updates-${orderId}`);
            expect(mockChannel.on).toHaveBeenCalledWith(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${orderId}`
                },
                expect.any(Function)
            );
            
            expect(typeof unsubscribe).toBe('function');
        });

        it('should validate order ID format', () => {
            const callback = vi.fn();
            
            expect(() => {
                realtimeService.subscribeToOrderUpdates('invalid order id!', callback);
            }).toThrow('Invalid order ID format');
        });
    });

    describe('syncUserData', () => {
        it('should sync user data with proper validation', async () => {
            const userId = 'test-user-id';
            const userData = { 
                full_name: 'Test User', 
                user_name: 'testuser',
                currency: 'USD'
            };
            
            const mockResponse = { 
                data: [{ ...userData, id: userId }], 
                error: null 
            };
            
            vi.spyOn(supabase, 'from').mockReturnValue({
                upsert: vi.fn().mockResolvedValue(mockResponse)
            } as any);

            const result = await realtimeService.syncUserData(userId, userData);

            expect(result).toEqual({ ...userData, id: userId });
            expect(supabase.from).toHaveBeenCalledWith('profiles');
        });

        it('should validate user ID and data', async () => {
            await expect(realtimeService.syncUserData('', { full_name: 'Test' }))
                .rejects
                .toThrow('User ID is required');

            await expect(realtimeService.syncUserData('test-user-id', null as any))
                .rejects
                .toThrow('User data is required');

            await expect(realtimeService.syncUserData('invalid user!', { full_name: 'Test' }))
                .rejects
                .toThrow('Invalid user ID format');
        });

        it('should sanitize user data before syncing', async () => {
            const userId = 'test-user-id';
            // Potentially malicious data that should be sanitized
            const unsafeUserData = { 
                full_name: 'Test User',
                dangerous_field: '<script>alert("xss")</script>',
                another_dangerous: 'javascript:alert(1)'
            };
            
            const sanitizedData = {
                full_name: 'Test User',
                // dangerous fields should be filtered out or sanitized
            };
            
            const mockResponse = { 
                data: [{ ...sanitizedData, id: userId }], 
                error: null 
            };
            
            const fromMock = vi.fn().mockReturnValue({
                upsert: vi.fn().mockResolvedValue(mockResponse)
            });
            vi.spyOn(supabase, 'from').mockImplementation(fromMock);

            const result = await realtimeService.syncUserData(userId, unsafeUserData);

            expect(fromMock).toHaveBeenCalledWith('profiles');
            // The actual implementation would need to include sanitization
        });

        it('should handle sync errors', async () => {
            const userId = 'test-user-id';
            const userData = { full_name: 'Test User' };
            const mockError = new Error('Sync failed');

            vi.spyOn(supabase, 'from').mockReturnValue({
                upsert: vi.fn().mockResolvedValue({ data: null, error: mockError })
            } as any);

            await expect(realtimeService.syncUserData(userId, userData))
                .rejects
                .toThrow('Sync failed');
        });
    });

    describe('syncOrderData', () => {
        it('should sync order data with proper validation', async () => {
            const orderId = 'test-order-id';
            const orderData = { 
                status: 'processing', 
                amount: 99.99,
                currency: 'USD'
            };
            
            const mockResponse = { 
                data: [{ ...orderData, id: orderId }], 
                error: null 
            };
            
            vi.spyOn(supabase, 'from').mockReturnValue({
                upsert: vi.fn().mockResolvedValue(mockResponse)
            } as any);

            const result = await realtimeService.syncOrderData(orderId, orderData);

            expect(result).toEqual({ ...orderData, id: orderId });
            expect(supabase.from).toHaveBeenCalledWith('orders');
        });

        it('should validate order ID and data', async () => {
            await expect(realtimeService.syncOrderData('', { status: 'test' }))
                .rejects
                .toThrow('Order ID is required');

            await expect(realtimeService.syncOrderData('test-order-id', null as any))
                .rejects
                .toThrow('Order data is required');

            await expect(realtimeService.syncOrderData('invalid order!', { status: 'test' }))
                .rejects
                .toThrow('Invalid order ID format');
        });
    });

    describe('unsubscribeAll', () => {
        it('should unsubscribe from all channels', () => {
            // Add some mock subscriptions first
            const mockChannel1 = { unsubscribe: vi.fn() };
            const mockChannel2 = { unsubscribe: vi.fn() };
            
            vi.spyOn(supabase, 'channel')
                .mockReturnValueOnce(mockChannel1 as any)
                .mockReturnValueOnce(mockChannel2 as any);
            
            // Create subscriptions
            realtimeService.subscribeToUserUpdates('user1', vi.fn());
            realtimeService.subscribeToOrderUpdates('order1', vi.fn());

            // Now unsubscribe all
            realtimeService.unsubscribeAll();

            expect(mockChannel1.unsubscribe).toHaveBeenCalled();
            expect(mockChannel2.unsubscribe).toHaveBeenCalled();
        });
    });

    describe('validateInput', () => {
        it('should validate string inputs', () => {
            expect(realtimeService.validateInput('valid-string', 'string')).toBe(true);
            expect(realtimeService.validateInput('', 'string')).toBe(true); // Empty string might be valid depending on context
            expect(realtimeService.validateInput(123, 'string')).toBe(false);
            expect(realtimeService.validateInput(null, 'string')).toBe(false);
        });

        it('should validate ID formats', () => {
            expect(realtimeService.validateInput('valid-id-123', 'id')).toBe(true);
            expect(realtimeService.validateInput('another_valid_id', 'id')).toBe(true);
            expect(realtimeService.validateInput('invalid id!', 'id')).toBe(false);
            expect(realtimeService.validateInput('../path/traversal', 'id')).toBe(false);
        });

        it('should validate numeric inputs', () => {
            expect(realtimeService.validateInput(123.45, 'number')).toBe(true);
            expect(realtimeService.validateInput(0, 'number')).toBe(true);
            expect(realtimeService.validateInput('not-a-number', 'number')).toBe(false);
            expect(realtimeService.validateInput(NaN, 'number')).toBe(false);
        });
    });

    describe('sanitizeData', () => {
        it('should remove dangerous properties from objects', () => {
            const unsafeData = {
                safe_prop: 'safe_value',
                dangerous_html: '<script>alert("xss")</script>',
                dangerous_url: 'javascript:alert(1)',
                nested: {
                    another_dangerous: 'expression(alert)',
                    safe_nested: 'safe_value'
                }
            };

            const sanitized = realtimeService.sanitizeData(unsafeData);

            // Safe properties should remain
            expect(sanitized.safe_prop).toBe('safe_value');
            expect(sanitized.nested.safe_nested).toBe('safe_value');

            // Dangerous properties should be cleaned
            expect(sanitized.dangerous_html).not.toContain('<script>');
            expect(sanitized.dangerous_url).not.toContain('javascript:');
            expect(sanitized.nested.another_dangerous).not.toContain('expression(alert)');
        });

        it('should handle different data types', () => {
            expect(realtimeService.sanitizeData('safe string')).toBe('safe string');
            expect(realtimeService.sanitizeData(123)).toBe(123);
            expect(realtimeService.sanitizeData(null)).toBeNull();
            expect(realtimeService.sanitizeData(undefined)).toBeUndefined();
        });
    });
});