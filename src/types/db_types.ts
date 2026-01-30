
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
                    avatar_url: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
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
                    created_at?: string
                }
                Relationships: []
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
