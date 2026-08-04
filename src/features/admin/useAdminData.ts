import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../shared/lib/supabase';
import { Database } from '@/shared/types/db_types';

export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
export type Delegate = Database['public']['Tables']['delegates']['Row'];
export type Assignment = Database['public']['Tables']['delivery_assignments']['Row'];
export type AdminSetting = Database['public']['Tables']['admin_settings']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductVariant = Database['public']['Tables']['product_variants']['Row'];

export interface AdminData {
    invoices: Invoice[];
    profiles: Profile[];
    orders: Order[];
    messages: ContactMessage[];
    delegates: Delegate[];
    assignments: Assignment[];
    settings: AdminSetting[];
    categories: Category[];
    products: Product[];
    variants: ProductVariant[];
    loading: boolean;
    refreshing: boolean;
    refresh: () => Promise<void>;
}

const empty: AdminData = {
    invoices: [],
    profiles: [],
    orders: [],
    messages: [],
    delegates: [],
    assignments: [],
    settings: [],
    categories: [],
    products: [],
    variants: [],
    loading: true,
    refreshing: false,
    refresh: async () => {},
};

export function useAdminData(): AdminData {
    const [state, setState] = useState<Omit<AdminData, 'loading' | 'refreshing' | 'refresh'>>({
        invoices: [],
        profiles: [],
        orders: [],
        messages: [],
        delegates: [],
        assignments: [],
        settings: [],
        categories: [],
        products: [],
        variants: [],
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (quiet = false) => {
        if (quiet) setRefreshing(true);
        else setLoading(true);
        try {
            const [inv, prof, ord, msg, del, asg, stg, cat, prod, var_] = await Promise.all([
                supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(500),
                supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(500),
                supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500),
                supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(500),
                supabase.from('delegates').select('*').order('created_at', { ascending: false }),
                supabase.from('delivery_assignments').select('*').order('assigned_at', { ascending: false }),
                supabase.from('admin_settings').select('*').order('key', { ascending: true }),
                supabase.from('categories').select('*').order('sort_order', { ascending: true }),
                supabase.from('products').select('*').order('created_at', { ascending: false }).limit(500),
                supabase.from('product_variants').select('*').order('created_at', { ascending: false }).limit(500),
            ]);
            setState({
                invoices: (inv.data || []) as Invoice[],
                profiles: (prof.data || []) as Profile[],
                orders: (ord.data || []) as Order[],
                messages: (msg.data || []) as ContactMessage[],
                delegates: (del.data || []) as Delegate[],
                assignments: (asg.data || []) as Assignment[],
                settings: (stg.data || []) as AdminSetting[],
                categories: (cat.data || []) as Category[],
                products: (prod.data || []) as Product[],
                variants: (var_.data || []) as ProductVariant[],
            });
            const warns: Array<{ name: string; e: { message?: string } | null }> = [
                { name: 'invoices', e: inv.error },
                { name: 'profiles', e: prof.error },
                { name: 'orders', e: ord.error },
                { name: 'contact_messages', e: msg.error },
                { name: 'delegates', e: del.error },
                { name: 'delivery_assignments', e: asg.error },
                { name: 'admin_settings', e: stg.error },
                { name: 'categories', e: cat.error },
                { name: 'products', e: prod.error },
                { name: 'product_variants', e: var_.error },
            ];
            warns.forEach(({ name, e }) => {
                if (e) console.warn(`[AdminData] ${name} error:`, e.message);
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const refresh = useCallback(() => load(true), [load]);

    return { ...state, loading, refreshing, refresh };
}

export const emptyAdminData = empty;

export const fmtCurrency = (amount: number, currency: string) => {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    } catch {
        return `${currency} ${Number(amount).toFixed(2)}`;
    }
};

export const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
};