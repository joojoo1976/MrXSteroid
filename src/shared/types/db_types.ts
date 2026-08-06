
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
                    phone_number: string | null
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
                    phone_number?: string | null
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
                    phone_number?: string | null
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
                    operator_name: string
                    email: string
                    mission_type: string
                    subject: string
                    message: string
                    order_id: string | null
                    user_agent: string | null
                    handled: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    operator_name: string
                    email: string
                    mission_type: string
                    subject: string
                    message: string
                    order_id?: string | null
                    user_agent?: string | null
                    handled?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    operator_name?: string
                    email?: string
                    mission_type?: string
                    subject?: string
                    message?: string
                    order_id?: string | null
                    user_agent?: string | null
                    handled?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            admin_settings: {
                Row: {
                    id: string
                    key: string
                    value: string
                    section: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    key: string
                    value?: string
                    section?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    key?: string
                    value?: string
                    section?: string
                    updated_at?: string
                }
                Relationships: []
            }
            orders: {
                Row: {
                    id: string
                    user_id: string | null
                    fullname: string | null
                    email: string | null
                    phone: string | null
                    address: string | null
                    city: string | null
                    country: string | null
                    postalcode: string | null
                    amount: number | null
                    status: string | null
                    items: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    fullname?: string | null
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    city?: string | null
                    country?: string | null
                    postalcode?: string | null
                    amount?: number | null
                    status?: string | null
                    items?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    fullname?: string | null
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    city?: string | null
                    country?: string | null
                    postalcode?: string | null
                    amount?: number | null
                    status?: string | null
                    items?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            payments: {
                Row: {
                    id: string
                    transaction_id: string
                    spaceremit_id: string | null
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
                }
                Insert: {
                    id?: string
                    transaction_id: string
                    spaceremit_id?: string | null
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
                }
                Update: {
                    id?: string
                    transaction_id?: string
                    spaceremit_id?: string | null
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
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    parent_id: string | null
                    sort_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    parent_id?: string | null
                    sort_order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    parent_id?: string | null
                    sort_order?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "categories_parent_id_fkey"
                        columns: ["parent_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    }
                ]
            }
            products: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    sku: string | null
                    category_id: string | null
                    description: string | null
                    price: number
                    sale_price: number | null
                    tax_rate: number
                    stock: number
                    low_stock_threshold: number
                    status: string
                    image_url: string | null
                    seo_title: string | null
                    seo_description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    sku?: string | null
                    category_id?: string | null
                    description?: string | null
                    price?: number
                    sale_price?: number | null
                    tax_rate?: number
                    stock?: number
                    low_stock_threshold?: number
                    status?: string
                    image_url?: string | null
                    seo_title?: string | null
                    seo_description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    sku?: string | null
                    category_id?: string | null
                    description?: string | null
                    price?: number
                    sale_price?: number | null
                    tax_rate?: number
                    stock?: number
                    low_stock_threshold?: number
                    status?: string
                    image_url?: string | null
                    seo_title?: string | null
                    seo_description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "products_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    }
                ]
            }
            product_variants: {
                Row: {
                    id: string
                    product_id: string
                    name: string
                    sku: string | null
                    price: number
                    sale_price: number | null
                    stock: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    name: string
                    sku?: string | null
                    price?: number
                    sale_price?: number | null
                    stock?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    name?: string
                    sku?: string | null
                    price?: number
                    sale_price?: number | null
                    stock?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "product_variants_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    }
                ]
            }
            coupon_codes: {
                Row: {
                    id: string
                    code: string
                    discount_type: string
                    discount_value: number
                    min_order_amount: number | null
                    product_ids: string[] | null
                    max_uses: number | null
                    max_per_user: number | null
                    starts_at: string | null
                    ends_at: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    code: string
                    discount_type?: string
                    discount_value?: number
                    min_order_amount?: number | null
                    product_ids?: string[] | null
                    max_uses?: number | null
                    max_per_user?: number | null
                    starts_at?: string | null
                    ends_at?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    code?: string
                    discount_type?: string
                    discount_value?: number
                    min_order_amount?: number | null
                    product_ids?: string[] | null
                    max_uses?: number | null
                    max_per_user?: number | null
                    starts_at?: string | null
                    ends_at?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            discount_rules: {
                Row: {
                    id: string
                    name: string
                    rule_type: string
                    threshold_amount: number | null
                    buy_quantity: number | null
                    get_quantity: number | null
                    discount_percent: number | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    rule_type?: string
                    threshold_amount?: number | null
                    buy_quantity?: number | null
                    get_quantity?: number | null
                    discount_percent?: number | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    rule_type?: string
                    threshold_amount?: number | null
                    buy_quantity?: number | null
                    get_quantity?: number | null
                    discount_percent?: number | null
                    is_active?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            banners: {
                Row: {
                    id: string
                    title: string | null
                    subtitle: string | null
                    image_url: string | null
                    link_url: string | null
                    position: string
                    sort_order: number
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    title?: string | null
                    subtitle?: string | null
                    image_url?: string | null
                    link_url?: string | null
                    position?: string
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string | null
                    subtitle?: string | null
                    image_url?: string | null
                    link_url?: string | null
                    position?: string
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            customer_notes: {
                Row: {
                    id: string
                    user_id: string
                    note: string
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    note: string
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    note?: string
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "customer_notes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            blog_posts: {
                Row: {
                    id: string
                    slug: string
                    title_en: string
                    title_ar: string
                    excerpt_en: string | null
                    excerpt_ar: string | null
                    content_en: string | null
                    content_ar: string | null
                    category_en: string
                    category_ar: string
                    cover_image_url: string | null
                    author: string | null
                    status: string
                    published_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    title_en: string
                    title_ar: string
                    excerpt_en?: string | null
                    excerpt_ar?: string | null
                    content_en?: string | null
                    content_ar?: string | null
                    category_en?: string
                    category_ar?: string
                    cover_image_url?: string | null
                    author?: string | null
                    status?: string
                    published_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    title_en?: string
                    title_ar?: string
                    excerpt_en?: string | null
                    excerpt_ar?: string | null
                    content_en?: string | null
                    content_ar?: string | null
                    category_en?: string
                    category_ar?: string
                    cover_image_url?: string | null
                    author?: string | null
                    status?: string
                    published_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            cms_pages: {
                Row: {
                    id: string
                    slug: string
                    title_en: string
                    title_ar: string
                    content_en: string | null
                    content_ar: string | null
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    title_en: string
                    title_ar: string
                    content_en?: string | null
                    content_ar?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    title_en?: string
                    title_ar?: string
                    content_en?: string | null
                    content_ar?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            faq_items: {
                Row: {
                    id: string
                    question_en: string
                    question_ar: string
                    answer_en: string | null
                    answer_ar: string | null
                    category_en: string
                    category_ar: string
                    sort_order: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    question_en: string
                    question_ar: string
                    answer_en?: string | null
                    answer_ar?: string | null
                    category_en?: string
                    category_ar?: string
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    question_en?: string
                    question_ar?: string
                    answer_en?: string | null
                    answer_ar?: string | null
                    category_en?: string
                    category_ar?: string
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
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
