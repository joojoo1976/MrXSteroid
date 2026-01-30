/**
 * Mr. X - Production Health Check & Pre-flight
 * 
 * Verifies that the production environment has all necessary configurations.
 * Logs warnings in Dev mode and critical reports in Production.
 */

export const performHealthCheck = () => {
    const isDev = import.meta.env.DEV;
    const requiredVars = [
        { key: 'VITE_SUPABASE_URL', name: 'Supabase URL' },
        { key: 'VITE_SUPABASE_ANON_KEY', name: 'Supabase Anon Key' }
    ];

    const missing = requiredVars.filter(v => !import.meta.env[v.key]);

    if (missing.length > 0) {
        if (isDev) {
            console.warn("⚠️ [Health Check] Missing Environment Variables:", missing.map(m => m.name).join(', '));
        } else {
            // In production, we might want to log this to an external service
            console.error("🚨 [CRITICAL] System Configuration Incomplete");
        }
    }

    // Verify SpaceRemit availability (global)
    if (typeof window !== 'undefined' && !window.SpaceRemit) {
        if (isDev) {
            console.info("ℹ️ [Health Check] SpaceRemit Gateway script not detected yet. Expected if not on checkout page.");
        }
    }

    return missing.length === 0;
};
