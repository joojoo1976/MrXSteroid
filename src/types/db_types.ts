export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    user_name: string | null
                    avatar_url: string | null
                    role: 'user' | 'admin' | 'representative'
                    subscription_status: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    user_name?: string | null
                    avatar_url?: string | null
                    role?: 'user' | 'admin' | 'representative'
                    subscription_status?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    user_name?: string | null
                    avatar_url?: string | null
                    role?: 'user' | 'admin' | 'representative'
                    subscription_status?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            delegates: {
                Row: {
                    id: string
                    status: 'active' | 'inactive' | 'busy'
                    current_region: string | null
                    last_active: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    status?: 'active' | 'inactive' | 'busy'
                    current_region?: string | null
                    last_active?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    status?: 'active' | 'inactive' | 'busy'
                    current_region?: string | null
                    last_active?: string
                    updated_at?: string
                }
            }
            delivery_assignments: {
                Row: {
                    id: string
                    order_id: string
                    delegate_id: string | null
                    status: 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'failed'
                    notes: string | null
                    assigned_at: string
                    completed_at: string | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    delegate_id?: string | null
                    status?: 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'failed'
                    notes?: string | null
                    assigned_at?: string
                    completed_at?: string | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    delegate_id?: string | null
                    status?: 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'failed'
                    notes?: string | null
                    assigned_at?: string
                    completed_at?: string | null
                    updated_at?: string
                }
            }
            realtime_locations: {
                Row: {
                    id: number
                    delegate_id: string
                    latitude: number
                    longitude: number
                    speed: number | null
                    heading: number | null
                    timestamp: string
                }
                Insert: {
                    id?: number
                    delegate_id: string
                    latitude: number
                    longitude: number
                    speed?: number | null
                    heading?: number | null
                    timestamp?: string
                }
                Update: {
                    id?: number
                    delegate_id?: string
                    latitude?: number
                    longitude?: number
                    speed?: number | null
                    heading?: number | null
                    timestamp?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
            is_representative: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
