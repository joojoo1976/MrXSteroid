
import { z } from 'zod';

const envSchema = z.object({
    // Supabase Configuration
    VITE_SUPABASE_URL: z.string().url({ message: "Supabase URL is invalid." }),
    VITE_SUPABASE_ANON_KEY: z.string().min(1, { message: "Supabase Anon Key is missing." }),

    // SpaceRemit Configuration (Payment Gateway)
    VITE_SPACEREMIT_API_KEY: z.string().optional(),
    VITE_SPACEREMIT_Secret: z.string().optional(),

    // Twilio Configuration (Usually server-side only, but defined here if needed for client triggers or public keys)
    VITE_TWILIO_SID: z.string().optional(),
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
