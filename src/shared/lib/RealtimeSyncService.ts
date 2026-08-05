import { supabase } from './supabase';
import { Database } from '@/shared/types/db_types';

type Delegate = Database['public']['Tables']['delegates']['Row'];
type Assignment = Database['public']['Tables']['delivery_assignments']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type Location = Database['public']['Tables']['realtime_locations']['Row'];

// Define proper payload types for Supabase realtime events
export type SupabaseRealtimePayload<T> = {
    commit_timestamp: string;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: T;
    old: Partial<T>;
};

export class RealtimeSyncService {
    private channels: Array<{ unsubscribe: () => void | Promise<unknown> }> = [];

    /**
     * Validate input by type
     */
    validateInput(value: unknown, type: 'string' | 'number' | 'id'): boolean {
        if (type === 'string') {
            return typeof value === 'string';
        }
        if (type === 'number') {
            return typeof value === 'number' && !isNaN(value) && isFinite(value);
        }
        if (type === 'id') {
            if (!value || typeof value !== 'string') return false;
            const idRegex = /^[a-zA-Z0-9_-]+$/;
            return idRegex.test(value);
        }
        return false;
    }

    /**
     * Sanitize data object to remove dangerous properties
     */
    sanitizeData(data: unknown): unknown {
        if (data === null || data === undefined) return data;
        if (typeof data !== 'object') return data;
        if (Array.isArray(data)) return data.map(item => this.sanitizeData(item));

        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
            // Skip __proto__ and constructor
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;

            if (typeof value === 'string') {
                // Remove script tags, event handlers, javascript: protocol, and expression() 
                const cleaned = value
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
                    .replace(/javascript\s*:/gi, '')
                    .replace(/expression\s*\([^)]*\)/gi, '');
                sanitized[key] = cleaned;
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeData(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }

    /**
     * Validate ID format (no special chars, no path traversal)
     */
    private validateIdFormat(id: string): boolean {
        if (!id || typeof id !== 'string') return false;
        const idRegex = /^[a-zA-Z0-9_-]+$/;
        return idRegex.test(id);
    }

    /**
     * Subscribe to user profile updates
     */
    subscribeToUserUpdates(userId: string, callback: (payload: SupabaseRealtimePayload<Profile>) => void) {
        if (!userId || userId.trim() === '') {
            throw new Error('User ID is required');
        }

        if (!this.validateIdFormat(userId)) {
            throw new Error('Invalid user ID format');
        }

        const channel = supabase.channel(`user-updates-${userId}`);
        channel
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${userId}`
                },
                (payload) => callback(payload as unknown as SupabaseRealtimePayload<Profile>)
            )
            .subscribe();

        this.channels.push(channel);
        const unsubscribeFn = () => {
            if (channel && typeof channel.unsubscribe === 'function') {
                channel.unsubscribe();
            }
        };
        return unsubscribeFn;
    }

    /**
     * Subscribe to order updates
     */
    subscribeToOrderUpdates(orderId: string, callback: (payload: SupabaseRealtimePayload<Order>) => void) {
        if (!orderId || orderId.trim() === '') {
            throw new Error('Order ID is required');
        }

        if (!this.validateIdFormat(orderId)) {
            throw new Error('Invalid order ID format');
        }

        const channel = supabase.channel(`order-updates-${orderId}`);
        channel
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${orderId}`
                },
                (payload) => callback(payload as unknown as SupabaseRealtimePayload<Order>)
            )
            .subscribe();

        this.channels.push(channel);
        const unsubscribeFn = () => {
            if (channel && typeof channel.unsubscribe === 'function') {
                channel.unsubscribe();
            }
        };
        return unsubscribeFn;
    }

    /**
     * Sync user data with validation
     */
    async syncUserData(userId: string, userData: Record<string, unknown>) {
        if (!userId || userId.trim() === '') {
            throw new Error('User ID is required');
        }

        if (!this.validateIdFormat(userId)) {
            throw new Error('Invalid user ID format');
        }

        if (!userData || typeof userData !== 'object') {
            throw new Error('User data is required');
        }

        const sanitizedData = this.sanitizeData(userData) as Record<string, unknown>;

        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: userId, ...sanitizedData } as unknown as Database['public']['Tables']['profiles']['Insert']);

        if (error) throw error;
        const rows = data as unknown as Database['public']['Tables']['profiles']['Row'][] | null;
        return Array.isArray(rows) && rows.length > 0 ? rows[0] : rows;
    }

    /**
     * Sync order data with validation
     */
    async syncOrderData(orderId: string, orderData: Record<string, unknown>) {
        if (!orderId || orderId.trim() === '') {
            throw new Error('Order ID is required');
        }

        if (!this.validateIdFormat(orderId)) {
            throw new Error('Invalid order ID format');
        }

        if (!orderData || typeof orderData !== 'object') {
            throw new Error('Order data is required');
        }

        const sanitizedData = this.sanitizeData(orderData) as Record<string, unknown>;

        const { data, error } = await supabase
            .from('orders')
            .upsert({ id: orderId, ...sanitizedData } as unknown as Database['public']['Tables']['orders']['Insert']);

        if (error) throw error;
        const rows = data as unknown as Database['public']['Tables']['orders']['Row'][] | null;
        return Array.isArray(rows) && rows.length > 0 ? rows[0] : rows;
    }

    /**
     * Unsubscribe from all channels
     */
    unsubscribeAll() {
        for (const channel of this.channels) {
            channel.unsubscribe();
        }
        this.channels = [];
    }

    // ==================== STATIC METHODS (Original API) ====================

    static subscribeToAssignments(delegateId: string, onUpdate: (payload: SupabaseRealtimePayload<Assignment>) => void) {
        return supabase
            .channel(`assignments-${delegateId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'delivery_assignments',
                    filter: `delegate_id=eq.${delegateId}`
                },
                (payload) => onUpdate(payload as unknown as SupabaseRealtimePayload<Assignment>)
            )
            .subscribe();
    }

    static async updateLocation(delegateId: string, lat: number, lng: number, extra?: { speed?: number, heading?: number }) {
        try {
            const { error } = await supabase
                .from('realtime_locations')
                .insert({
                    delegate_id: delegateId,
                    latitude: lat,
                    longitude: lng,
                    speed: extra?.speed || null,
                    heading: extra?.heading || null,
                    timestamp: new Date().toISOString()
                });

            if (error) throw error;
            return true;
        } catch (error: unknown) {
            console.error('Error updating location:', error);
            return false;
        }
    }

    static async updateStatus(delegateId: string, status: Delegate['status']) {
        const { error } = await supabase
            .from('delegates')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', delegateId);

        if (error) console.error('Error updating status:', error);
        return !error;
    }

    static subscribeToAllLocations(onUpdate: (payload: SupabaseRealtimePayload<Location>) => void) {
        return supabase
            .channel('admin-all-locations')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'realtime_locations'
                },
                (payload) => onUpdate(payload as unknown as SupabaseRealtimePayload<Location>)
            )
            .subscribe();
    }

    static subscribeToAllAssignments(onUpdate: (payload: SupabaseRealtimePayload<Assignment>) => void) {
        return supabase
            .channel('admin-all-assignments')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'delivery_assignments'
                },
                (payload) => onUpdate(payload as unknown as SupabaseRealtimePayload<Assignment>)
            )
            .subscribe();
    }

    static async updateAssignmentStatus(assignmentId: string, status: Assignment['status'], notes?: string) {
        const updateData: Partial<Assignment> = { status };
        if (status === 'delivered') {
            updateData.completed_at = new Date().toISOString();
        }
        if (notes) {
            updateData.notes = notes;
        }

        const { error } = await supabase
            .from('delivery_assignments')
            .update(updateData)
            .eq('id', assignmentId);

        if (error) console.error('Error updating assignment status:', error);
        return !error;
    }
}
