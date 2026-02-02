/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔧 MR. X STEROID - ENVIRONMENT CONFIGURATION                            ║
 * ║  Zod-validated environment variables                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { z } from 'zod';

const envSchema = z.object({
    // ═══════════════════════════════════════════════════════════════════════
    //                         SUPABASE CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    VITE_SUPABASE_URL: z.string().url({ message: "Supabase URL is invalid." }),
    VITE_SUPABASE_ANON_KEY: z.string().min(1, { message: "Supabase Anon Key is missing." }),

    // ═══════════════════════════════════════════════════════════════════════
    //                     SPACEREMIT PAYMENT GATEWAY
    // ═══════════════════════════════════════════════════════════════════════
    // Public Key (safe for frontend)
    VITE_SPACEREMIT_PUBLIC_KEY: z.string().optional(),
    VITE_SPACEREMIT_TEST_PUBLIC_KEY: z.string().optional(),

    // Callback URLs
    VITE_SPACEREMIT_CALLBACK_URL: z.string().url().optional().default('https://mrxsteroid.vercel.app/api/payments/callback'),
    VITE_PAYMENT_SUCCESS_URL: z.string().url().optional(),
    VITE_PAYMENT_CANCEL_URL: z.string().url().optional(),

    // Legacy keys (for backward compatibility)
    VITE_SPACEREMIT_API_KEY: z.string().optional(),
    VITE_SPACEREMIT_Secret: z.string().optional(),

    // ═══════════════════════════════════════════════════════════════════════
    //                         OTHER SERVICES
    // ═══════════════════════════════════════════════════════════════════════
    // Twilio (server-side only typically)
    VITE_TWILIO_SID: z.string().optional(),

    // AI Features
    VITE_GEMINI_API_KEY: z.string().optional(),
    VITE_OPENAI_API_KEY: z.string().optional(),

    // Stripe (legacy/deprecated)
    VITE_STRIPE_PUBLIC_KEY: z.string().optional(),
});

/**
 * Validates environment variables at runtime.
 * Since Vite exposes env via import.meta.env, we use that as the source.
 */
const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
    console.error(
        "❌ Invalid environment variables:",
        _env.error.format()
    );
    throw new Error("Invalid environment variables. Check console for details.");
}

export const env = _env.data;

/**
 * Helper to check if we're in test/development mode
 */
export const isTestMode = (): boolean => {
    return import.meta.env.MODE === 'development' ||
        import.meta.env.VITE_USE_TEST_KEYS === 'true';
};

/**
 * Get the appropriate SpaceRemit public key based on environment
 */
export const getSpaceRemitPublicKey = (): string => {
    if (isTestMode() && env.VITE_SPACEREMIT_TEST_PUBLIC_KEY) {
        return env.VITE_SPACEREMIT_TEST_PUBLIC_KEY;
    }
    return env.VITE_SPACEREMIT_PUBLIC_KEY || env.VITE_SPACEREMIT_API_KEY || '';
};
