import { createClient } from '@supabase/supabase-js';
import { readEnv } from './env-reader';

// ═══════════════════════════════════════════════════════════════════════════
// 🔐 SUPABASE CONFIGURATION - Production Ready
// Supports both VITE_ prefix (Vite standard) and NEXT_PUBLIC_ prefix
// ═══════════════════════════════════════════════════════════════════════════

// Support both VITE_ and NEXT_PUBLIC_ prefixes for environment variables
const supabaseUrl =
    readEnv('VITE_SUPABASE_URL') ||
    readEnv('NEXT_PUBLIC_SUPABASE_URL') ||
    'https://alghvtpkpspnqupbvodu.supabase.co';

const supabaseAnonKey =
    readEnv('VITE_SUPABASE_ANON_KEY') ||
    readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZ2h2dHBrcHNwbnF1cGJ2b2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDgyMTYsImV4cCI6MjA4MTQyNDIxNn0.4en9cYMCkIwxd1pWxehb9-lP77cHgh5FhZnrBRg-yaw';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
} else {
    console.log('✅ Supabase configured:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

