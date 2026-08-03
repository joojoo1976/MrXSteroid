
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    status: 'active' | 'canceled' | 'past_due' | 'trialing'
                    product_id: string
                    current_period_end: string
                    current_period_start: string
                    created_at: string
                    metadata: Json
                }
                Insert: {
                    id?: string
                    user_id: string
                    status: 'active' | 'canceled' | 'past_due' | 'trialing'
                    product_id: string
                    current_period_end: string
                    current_period_start?: string
                    created_at?: string
                    metadata?: Json
                }
                Update: {
                    id?: string
                    user_id?: string
                    status?: 'active' | 'canceled' | 'past_due' | 'trialing'
                    product_id?: string
                    current_period_end?: string
                    current_period_start?: string
                    created_at?: string
                    metadata?: Json
                }
                Relationships: [
                    {
                        foreignKeyName: "subscriptions_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    user_name: string | null
                    avatar_url: string | null
                    subscription_status: string // 'inactive' | 'active' etc.
                    subscription_tier: string // 'none' | 'pdf' | 'paperback'
                    has_paid: boolean
                    currency: string
                    created_at: string
                    updated_at: string
                    role: 'user' | 'delegate' | 'admin'
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    user_name?: string | null
                    avatar_url?: string | null
                    subscription_status?: string
                    subscription_tier?: string
                    has_paid?: boolean
                    currency?: string
                    created_at?: string
                    updated_at?: string
                    role?: 'user' | 'delegate' | 'admin'
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    user_name?: string | null
                    avatar_url?: string | null
                    subscription_status?: string
                    subscription_tier?: string
                    has_paid?: boolean
                    currency?: string
                    created_at?: string
                    updated_at?: string
                    role?: 'user' | 'delegate' | 'admin'
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            delegates: {
                Row: {
                    id: string
                    status: 'active' | 'inactive' | 'busy'
                    vehicle_type: string | null
                    updated_at: string
                }
                Insert: {
                    id: string
                    status?: 'active' | 'inactive' | 'busy'
                    vehicle_type?: string | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    status?: 'active' | 'inactive' | 'busy'
                    vehicle_type?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "delegates_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            realtime_locations: {
                Row: {
                    id: string
                    delegate_id: string
                    latitude: number
                    longitude: number
                    speed: number | null
                    heading: number | null
                    timestamp: string
                }
                Insert: {
                    id?: string
                    delegate_id: string
                    latitude: number
                    longitude: number
                    speed?: number | null
                    heading?: number | null
                    timestamp?: string
                }
                Update: {
                    id?: string
                    delegate_id?: string
                    latitude?: number
                    longitude?: number
                    speed?: number | null
                    heading?: number | null
                    timestamp?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "realtime_locations_delegate_id_fkey"
                        columns: ["delegate_id"]
                        isOneToOne: false
                        referencedRelation: "delegates"
                        referencedColumns: ["id"]
                    }
                ]
            }
            delivery_assignments: {
                Row: {
                    id: string
                    order_id: string
                    delegate_id: string | null
                    status: 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'failed'
                    assigned_at: string
                    completed_at: string | null
                    notes: string | null
                }
                Insert: {
                    id?: string
                    order_id: string
                    delegate_id?: string | null
                    status?: 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'failed'
                    assigned_at?: string
                    completed_at?: string | null
                    notes?: string | null
                }
                Update: {
                    id?: string
                    order_id?: string
                    delegate_id?: string | null
                    status?: 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'failed'
                    assigned_at?: string
                    completed_at?: string | null
                    notes?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "delivery_assignments_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "delivery_assignments_delegate_id_fkey"
                        columns: ["delegate_id"]
                        isOneToOne: false
                        referencedRelation: "delegates"
                        referencedColumns: ["id"]
                    }
                ]
            }
            contact_messages: {
                Row: {
                    id: string
                    name: string
                    email: string
                    subject: string
                    topic: string
                    message: string
                    order_id: string | null
                    user_agent: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email: string
                    subject: string
                    topic: string
                    message: string
                    order_id?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    subject?: string
                    topic?: string
                    message?: string
                    order_id?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            orders: {
                Row: {
                    id: string
                    email: string
                    fullName: string
                    tier: string
                    language: string
                    amount: number
                    country: string
                    address: string | null
                    city: string | null
                    zip_code: string | null
                    shipping_provider: string | null
                    body_stats: Json | null
                    status: string
                    transaction_id: string | null
                    error_log: string | null
                    attempts: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    fullName: string
                    tier: string
                    language: string
                    amount: number
                    country: string
                    address?: string | null
                    city?: string | null
                    zip_code?: string | null
                    shipping_provider?: string | null
                    body_stats?: Json | null
                    status?: string
                    transaction_id?: string | null
                    error_log?: string | null
                    attempts?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    fullName?: string
                    tier?: string
                    language?: string
                    amount?: number
                    country?: string
                    address?: string | null
                    city?: string | null
                    zip_code?: string | null
                    shipping_provider?: string | null
                    body_stats?: Json | null
                    status?: string
                    transaction_id?: string | null
                    error_log?: string | null
                    attempts?: number
                    created_at?: string
                }
                Relationships: []
            }
            payments: {
                Row: {
                    id: string
                    transaction_id: string
                    spaceremit_code: string | null
                    order_id: string | null
                    user_id: string | null
                    amount: number
                    currency: string
                    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
                    product_id: string | null
                    product_name: string | null
                    customer_email: string
                    customer_name: string | null
                    metadata: Json
                    error_message: string | null
                    created_at: string
                    updated_at: string
                    paid_at: string | null
                }
                Insert: {
                    id?: string
                    transaction_id: string
                    spaceremit_code?: string | null
                    order_id?: string | null
                    user_id?: string | null
                    amount: number
                    currency: string
                    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
                    product_id?: string | null
                    product_name?: string | null
                    customer_email: string
                    customer_name?: string | null
                    metadata?: Json
                    error_message?: string | null
                    created_at?: string
                    updated_at?: string
                    paid_at?: string | null
                }
                Update: {
                    id?: string
                    transaction_id?: string
                    spaceremit_code?: string | null
                    order_id?: string | null
                    user_id?: string | null
                    amount?: number
                    currency?: string
                    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
                    product_id?: string | null
                    product_name?: string | null
                    customer_email: string
                    customer_name?: string | null
                    metadata?: Json
                    error_message?: string | null
                    created_at?: string
                    updated_at?: string
                    paid_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "payments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payments_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_history: {
                Row: {
                    id: string
                    user_id: string
                    tool_type: string
                    inputs: Json
                    results: Json
                    goal: string | null
                    intensity_factor: number | null
                    currency: string | null
                    language: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    tool_type: string
                    inputs: Json
                    results: Json
                    goal?: string | null
                    intensity_factor?: number | null
                    currency?: string | null
                    language?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    tool_type?: string
                    inputs?: Json
                    results?: Json
                    goal?: string | null
                    intensity_factor?: number | null
                    currency?: string | null
                    language?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_history_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            invoices: {
                Row: {
                    id: string
                    user_id: string
                    gateway: string // 'stripe' | 'paymob' | 'spaceremit'
                    status: string // 'pending' | 'success' | 'failed'
                    tier_id: string // 'pdf' | 'paperback'
                    amount: number
                    currency: string
                    gateway_reference_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    gateway: string
                    status?: string
                    tier_id: string
                    amount: number
                    currency: string
                    gateway_reference_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    gateway?: string
                    status?: string
                    tier_id?: string
                    amount?: number
                    currency?: string
                    gateway_reference_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "invoices_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            calculator_history: {
                Row: {
                    id: string
                    user_id: string
                    tool: string
                    title: string | null
                    inputs: Json
                    result: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    tool: string
                    title?: string | null
                    inputs?: Json
                    result?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    tool?: string
                    title?: string | null
                    inputs?: Json
                    result?: Json
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "calculator_history_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
