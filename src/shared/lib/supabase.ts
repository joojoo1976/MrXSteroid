import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════════
// 🔐 SUPABASE CONFIGURATION - Production Ready
// ═══════════════════════════════════════════════════════════════════════════

// Use environment variables first, fallback to provided credentials
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                    import.meta.env.VITE_SUPABASE_URL || 
                    'https://alghvtpkpspnqupbvodu.supabase.co';

const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZ2h2dHBrcHNwbnF1cGJ2b2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDgyMTYsImV4cCI6MjA4MTQyNDIxNn0.4en9cYMCkIwxd1pWxehb9-lP77cHgh5FhZnrBRg-yaw';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// تعريف المتغير الذي كان يسبب خطأ في الصورة (SP_FORM_ID)
(window as any).SP_FORM_ID = "registration-form";
