import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
// Server-side client for API routes
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export type UserToolState = {
  id: string;
  user_id: string;
  tool_id: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  units: 'metric' | 'imperial';
  language: 'ar' | 'en';
  created_at: string;
  updated_at: string;
};
export type UserPreferences = {
  user_id: string;
  default_units: 'metric' | 'imperial';
  default_language: 'ar' | 'en';
  theme: 'dark' | 'light';
  voice_enabled: boolean;
  ai_suggestions_enabled: boolean;
  updated_at: string;
};
export type ToolUsageAnalytics = {
  id: string;
  user_id: string;
  tool_id: number;
  action: string;
  metadata: Record<string, any>;
  created_at: string;
};
export type ToolRating = {
  id: string;
  user_id: string;
  tool_id: number;
  rating: number;
  feedback: string | null;
  created_at: string;
};
export type VoiceCommand = {
  id: string;
  user_id: string;
  command_text: string;
  intent: string | null;
  tool_slug: string | null;
  confidence: number | null;
  executed: boolean;
  created_at: string;
};
export type AIUserProfile = {
  user_id: string;
  preferred_categories: number[];
  preferred_difficulty: 'beginner' | 'intermediate' | 'advanced';
  most_used_tools: number[];
  preferred_time_of_day: string | null;
  total_calculations: number;
  preferred_units: 'metric' | 'imperial';
  language: 'ar' | 'en';
  updated_at: string;
};
