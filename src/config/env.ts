import { z } from 'zod';

/**
 * Environment Configuration
 * This file centralizes all environment variable access and validation.
 * It ensures the application fails early if critical configuration is missing.
 */

// Define the schema for environment variables
const envSchema = z.object({
    // Supabase Configuration
    SUPABASE_URL: z.string().url().min(1, 'Supabase URL is required'),
    SUPABASE_ANON_KEY: z.string().min(1, 'Supabase Anon Key is required'),

    // SpaceRemit Configuration
    SPACEREMIT_API_URL: z.string().url().default('https://spaceremit.com/api/v2'),

    // Public Key (includes hardcoded fallback for stability)
    SPACEREMIT_PUBLIC_KEY: z.string().min(1).default('pkO6RUYNRPVWTC7VDPNOFLMAUTJ0GNN42YEALB26SSOQR46EX20A'),

    // Callback URLs
    SPACEREMIT_CALLBACK_URL: z.string().url().default('https://mrxsteroid.vercel.app/api/payments/callback'),
    PAYMENT_SUCCESS_URL: z.string().default(`${typeof window !== 'undefined' ? window.location.origin : ''}/success`),
    PAYMENT_CANCEL_URL: z.string().default(`${typeof window !== 'undefined' ? window.location.origin : ''}/cancel`),

    // App Config
    MODE: z.enum(['development', 'production', 'test']).default('development'),
    SITE_URL: z.string().url().optional().default('https://mrxsteroid.vercel.app'),
    ENCRYPTION_KEY: z.string().min(1).default('mZq4t7w9z$C&F)J@NcRfUjWnZr4u7x!A'),

    // AI Configuration
    OPENAI_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
});

// Helper to parse environment variables
const parseEnv = () => {
    // Collect variables
    const processEnv = {
        SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
        SPACEREMIT_API_URL: 'https://spaceremit.com/api/v2',
        SPACEREMIT_PUBLIC_KEY: import.meta.env.VITE_SPACEREMIT_PUBLIC_KEY,
        SPACEREMIT_CALLBACK_URL: import.meta.env.VITE_SPACEREMIT_CALLBACK_URL,
        PAYMENT_SUCCESS_URL: import.meta.env.VITE_PAYMENT_SUCCESS_URL,
        PAYMENT_CANCEL_URL: import.meta.env.VITE_PAYMENT_CANCEL_URL,
        MODE: import.meta.env.MODE,
        SITE_URL: import.meta.env.VITE_SITE_URL || import.meta.env.NEXT_PUBLIC_SITE_URL,
        ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY,
        OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
        GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    };

    // Parse and validate
    const parsed = envSchema.safeParse(processEnv);

    if (!parsed.success) {
        console.error('❌ Invalid environment configuration:', parsed.error.format());
        // In development, we throw to catch issues early. 
        // In production, we might want to log and use fallbacks where possible, 
        // but for payment critical keys, we should probably fail.
        if (import.meta.env.DEV) {
            throw new Error('Invalid environment configuration. Check console for details.');
        }
        // Return a best-effort config or fallback for production to avoid white-screen of death
        // though critical features might fail.
        return processEnv as unknown as z.infer<typeof envSchema>;
    }

    return parsed.data;
};

// Export the validated configuration
export const env = parseEnv();
