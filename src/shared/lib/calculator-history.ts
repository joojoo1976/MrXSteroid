import { supabase } from './supabase';
import { Database, Json } from '@/shared/types/db_types';

type HistoryRow = Database['public']['Tables']['calculator_history']['Row'];

const isSupabaseConfigured = Boolean(
    (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

export interface CalculatorHistoryInput {
    tool: string;
    title: string;
    inputs?: Record<string, unknown>;
    result?: Record<string, unknown>;
}

export const saveCalculatorResult = async ({ tool, title, inputs = {}, result = {} }: CalculatorHistoryInput): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return false;
        const { error } = await supabase
            .from('calculator_history')
            .insert({
                user_id: session.user.id,
                tool,
                title,
                inputs: inputs as unknown as Json,
                result: result as unknown as Json,
            });
        if (error) {
            console.warn('[calculator-history] Save failed:', error.message);
            return false;
        }
        return true;
    } catch (err) {
        console.warn('[calculator-history] Save error:', err);
        return false;
    }
};

export const getCalculatorHistory = async (limit = 30): Promise<HistoryRow[]> => {
    if (!isSupabaseConfigured) return [];
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return [];
        const { data, error } = await supabase
            .from('calculator_history')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) {
            console.warn('[calculator-history] Fetch failed:', error.message);
            return [];
        }
        return (data || []) as HistoryRow[];
    } catch (err) {
        console.warn('[calculator-history] Fetch error:', err);
        return [];
    }
};

export const deleteCalculatorHistory = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
        const { error } = await supabase.from('calculator_history').delete().eq('id', id);
        if (error) {
            console.warn('[calculator-history] Delete failed:', error.message);
            return false;
        }
        return true;
    } catch (err) {
        console.warn('[calculator-history] Delete error:', err);
        return false;
    }
};
