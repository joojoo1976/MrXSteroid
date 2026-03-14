import { supabase } from './supabase';
import { Database } from '@/shared/types/db_types';

type Delegate = Database['public']['Tables']['delegates']['Row'];
type Assignment = Database['public']['Tables']['delivery_assignments']['Row'];

// Define proper payload types for Supabase realtime events
type SupabaseRealtimePayload<T> = {
    commit_timestamp: string;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: T;
    old: Partial<T>;
};

export class RealtimeSyncService {
    private channels: Array<{ unsubscribe: () => void }> = [];

    /**
     * Validate input by type
     */
    validateInput(value: any, type: 'string' | 'number' | 'id'): boolean {
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
    sanitizeData(data: any): any {
        if (data === null || data === undefined) return data;
        if (typeof data !== 'object') return data;
        if (Array.isArray(data)) return data.map(item => this.sanitizeData(item));

        const sanitized: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            // Skip __proto__ and constructor
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;

            if (typeof value === 'string') {
                // Remove script tags, event handlers, javascript: protocol, and expression() 
                let cleaned = value
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
    subscribeToUserUpdates(userId: string, callback: (payload: any) => void) {
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
                (payload: any) => callback(payload)
            )
            .subscribe();

        this.channels.push(channel as any);
        const unsubscribeFn = () => {
            if (channel && typeof (channel as any).unsubscribe === 'function') {
                (channel as any).unsubscribe();
            }
        };
        return unsubscribeFn;
    }

    /**
     * Subscribe to order updates
     */
    subscribeToOrderUpdates(orderId: string, callback: (payload: any) => void) {
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
                (payload: any) => callback(payload)
            )
            .subscribe();

        this.channels.push(channel as any);
        const unsubscribeFn = () => {
            if (channel && typeof (channel as any).unsubscribe === 'function') {
                (channel as any).unsubscribe();
            }
        };
        return unsubscribeFn;
    }

    /**
     * Sync user data with validation
     */
    async syncUserData(userId: string, userData: any) {
        if (!userId || userId.trim() === '') {
            throw new Error('User ID is required');
        }

        if (!this.validateIdFormat(userId)) {
            throw new Error('Invalid user ID format');
        }

        if (!userData || typeof userData !== 'object') {
            throw new Error('User data is required');
        }

        const sanitizedData = this.sanitizeData(userData);

        const fromResult = supabase.from('profiles');
        const { data, error } = await (fromResult as any).upsert({ id: userId, ...sanitizedData });

        if (error) throw error;
        return Array.isArray(data) ? data[0] : data;
    }

    /**
     * Sync order data with validation
     */
    async syncOrderData(orderId: string, orderData: any) {
        if (!orderId || orderId.trim() === '') {
            throw new Error('Order ID is required');
        }

        if (!this.validateIdFormat(orderId)) {
            throw new Error('Invalid order ID format');
        }

        if (!orderData || typeof orderData !== 'object') {
            throw new Error('Order data is required');
        }

        const sanitizedData = this.sanitizeData(orderData);

        const fromResult = supabase.from('orders');
        const { data, error } = await (fromResult as any).upsert({ id: orderId, ...sanitizedData });

        if (error) throw error;
        return Array.isArray(data) ? data[0] : data;
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
                (payload) => onUpdate(payload as any)
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
                (payload) => onUpdate(payload as any)
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
