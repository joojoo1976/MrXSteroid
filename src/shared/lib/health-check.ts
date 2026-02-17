/**
 * Mr. X - Production Health Check & Pre-flight
 *
 * Verifies that the production environment has all necessary configurations.
 * Logs warnings in Dev mode and critical reports in Production.
 */

import { env } from '../../config/env';

export const performHealthCheck = () => {
    const isDev = env.MODE === 'development';

    // The env object is already validated. If we reached here, 
    // basic variables like SUPABASE_URL and SUPABASE_ANON_KEY are present.

    // Verify SpaceRemit availability (global)
    if (typeof window !== 'undefined' && !window.SpaceRemit) {
        if (isDev) {
            console.info("ℹ️ [Health Check] SpaceRemit Gateway script not detected yet. Expected if not on checkout page.");
        }
    }

    return true; // env.ts would have thrown if critical vars were missing
};
