import { supabase } from './supabase';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    user_name: string;
    avatar_url?: string;
    role: string;
    subscription_status: string;
    created_at?: string;
}

export interface OrderData {
    user_id: string;
    total_amount: number;
    currency: string;
    shipping_address: string;
    phone_number: string;
    status?: string;
}

/**
 * Mr. X Steroid - Core Database Service
 * Provides standardized methods for interacting with the database.
 */
export const dbService = {
    /**
     * Fetches a full user profile by ID
     */
    async fetchUserData(userId: string): Promise<UserProfile | null> {
        if (!userId) throw new Error('User ID is required');
        if (!this.validateInputs.isValidId(userId)) throw new Error('Invalid user ID format');

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId);

        if (error) throw error;
        return data && data.length > 0 ? data[0] : null;
    },

    /**
     * Updates user profile metadata
     */
    async updateUserProfile(userId: string, updateData: Partial<UserProfile>): Promise<UserProfile> {
        if (!userId) throw new Error('User ID is required');
        if (Object.keys(updateData).length === 0) throw new Error('Update data is required');

        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select();

        if (error) throw error;
        return data[0];
    },

    /**
     * Creates a new order
     */
    async createOrder(orderData: OrderData): Promise<any> {
        if (!orderData || Object.keys(orderData).length === 0) throw new Error('Order data is required');
        if (orderData.total_amount < 0) throw new Error('Order amount must be positive');

        const { data, error } = await supabase
            .from('orders')
            .insert({
                ...orderData,
                status: orderData.status || 'pending',
                created_at: new Date().toISOString()
            })
            .select();

        if (error) throw error;
        return data[0];
    },

    /**
     * Fetches all orders for a specific user
     */
    async fetchUserOrders(userId: string): Promise<any[]> {
        if (!userId) throw new Error('User ID is required');
        if (!this.validateInputs.isValidId(userId)) throw new Error('Invalid user ID format');

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Updates an order status (Admin/System use)
     */
    async updateOrderStatus(orderId: string, status: string): Promise<any> {
        if (!orderId) throw new Error('Order ID is required');

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) throw new Error('Invalid order status');

        const { data, error } = await supabase
            .from('orders')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select();

        if (error) throw error;
        return data[0];
    },

    /**
     * Helper validators used by the service
     */
    validateInputs: {
        isValidId: (id: string) => /^[a-zA-Z0-9_-]{10,50}$/.test(id) || /^[0-9a-fA-F-]{36}$/.test(id),
        isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        isValidAmount: (amount: number) => !isNaN(amount) && amount >= 0,
        isValidStatus: (status: string) => ['active', 'inactive', 'busy'].includes(status) || ['pending', 'shipped', 'delivered'].includes(status)
    }
};
