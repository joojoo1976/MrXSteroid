import { supabase } from '../lib/supabase';
import { Database } from '../types/db_types';

type Delegate = Database['public']['Tables']['delegates']['Row'];
type Assignment = Database['public']['Tables']['delivery_assignments']['Row'];

export class RealtimeSyncService {
    /**
     * Subscribe to assignments for a specific delegate
     */
    static subscribeToAssignments(delegateId: string, onUpdate: (payload: { eventType: string, new: Assignment, old: Partial<Assignment> }) => void) {
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
                (payload) => onUpdate(payload)
            )
            .subscribe();
    }

    /**
     * Update delegate location
     */
    static async updateLocation(delegateId: string, lat: number, lng: number, extra?: { speed?: number, heading?: number }) {
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

        if (error) console.error('Error updating location:', error);
        return !error;
    }

    /**
     * Update delegate status (active/inactive/busy)
     */
    static async updateStatus(delegateId: string, status: Delegate['status']) {
        const { error } = await supabase
            .from('delegates')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', delegateId);

        if (error) console.error('Error updating status:', error);
        return !error;
    }

    /**
     * (Admin Only) Subscribe to all assignments
     */
    static subscribeToAllAssignments(onUpdate: (payload: { eventType: string, new: Assignment, old: Partial<Assignment> }) => void) {
        return supabase
            .channel('admin-all-assignments')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'delivery_assignments'
                },
                (payload) => onUpdate(payload)
            )
            .subscribe();
    }

    /**
     * (Admin Only) Subscribe to all delegate locations
     */
    static subscribeToAllLocations(onUpdate: (payload: { eventType: 'INSERT', new: Database['public']['Tables']['realtime_locations']['Row'] }) => void) {
        return supabase
            .channel('admin-all-locations')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'realtime_locations'
                },
                (payload) => onUpdate(payload)
            )
            .subscribe();
    }

    /**
     * Update assignment status
     */
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
