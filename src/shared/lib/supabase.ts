
import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

import { Database } from '../types/db_types';

/**
 * Enterprise-Grade Supabase Client Instance (Singleton)
 * 
 * Uses strict Zod validation from src/config/env.ts to guarantee 
 * that the client is initialized with valid credentials.
 */
export const supabase = createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY
);
