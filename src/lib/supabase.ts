import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://alghvtpkpspnqupbvodu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
    console.warn("Supabase Anon Key is missing! Auth features will not work.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy-key');
