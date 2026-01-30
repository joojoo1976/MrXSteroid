
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

/**
 * Enterprise-Grade Supabase Client Instance (Singleton)
 * 
 * Uses strict Zod validation from src/config/env.ts to guarantee 
 * that the client is initialized with valid credentials.
 */
export const supabase = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY
);
