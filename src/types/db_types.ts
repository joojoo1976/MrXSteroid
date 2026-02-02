
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
                    subscription_status: string // 'inactive' | 'active' etc.
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    user_name?: string | null
                    subscription_status?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    user_name?: string | null
                    subscription_status?: string
                    created_at?: string
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
                    customer_email?: string
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
