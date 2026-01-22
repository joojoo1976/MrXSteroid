import { createClient } from '@supabase/supabase-js';

// Use VITE_ prefix for client-side environment variables in Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Access valid credentials in ENV_SETUP_GUIDE.md');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
