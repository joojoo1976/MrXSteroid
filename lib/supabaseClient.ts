/**
 * supabaseClient.ts — browser-only Supabase client.
 * Never receives biometric/body metrics (ephemeral state only lives in the
 * metabolic store, not here and never in localStorage).
 */
'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!client) {
        // Never crash the UI at import time when env vars are absent (e.g. a
        // local build without .env.local). Fail at the first real auth call
        // instead, via a typed thrown error.
        client = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
            auth: { persistSession: true, autoRefreshToken: true },
        });
    }
    return client;
}

export const supabase = getSupabase();
