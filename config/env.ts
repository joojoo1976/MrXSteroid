import { z } from 'zod';
import { readEnv } from '../shared/lib/env-reader';

/**
 * Environment Configuration
 * Centralizes all environment variable access and validation.
 */

const envSchema = z.object({
    // Supabase Configuration
    SUPABASE_URL: z.string().url().min(1, 'Supabase URL is required'),
    SUPABASE_ANON_KEY: z.string().min(1, 'Supabase Anon Key is required'),

    // SpaceRemit Configuration
    SPACEREMIT_API_URL: z.string().url().default('https://spaceremit.com/api/v2'),
    SPACEREMIT_PUBLIC_KEY: z.string().optional(),

    // Paymob Configuration (API key is server-only; never bundle VITE_PAYMOB_API_KEY)
    PAYMOB_API_KEY: z.string().optional(),
    // Client-safe public key (Paymob Intention API / v2)
    PAYMOB_PUBLIC_KEY: z.string().optional(),
    PAYMOB_CARD_INTEGRATION_ID: z.string().optional().default('5573815'),
    PAYMOB_WALLET_INTEGRATION_ID: z.string().optional().default('5792309'),
    PAYMOB_KIOSK_INTEGRATION_ID: z.string().optional().default('5792311'),
    PAYMOB_PAYPAL_INTEGRATION_ID: z.string().optional().default('5792310'),

    // Callback URLs
    SPACEREMIT_CALLBACK_URL: z.string().url().default('https://www.mrxsteroid.com/api/payments/callback'),
    PAYMENT_SUCCESS_URL: z.string().default(`${typeof window !== 'undefined' ? window.location.origin : ''}/success`),
    PAYMENT_CANCEL_URL: z.string().default(`${typeof window !== 'undefined' ? window.location.origin : ''}/cancel`),

    // Stripe (Link by Stripe / PaymentElement — client-side publishable key)
    STRIPE_PUBLISHABLE_KEY: z.string().optional(),

    // App Config
    MODE: z.enum(['development', 'production', 'test']).default('development'),
    SITE_URL: z.string().url().optional().default('https://www.mrxsteroid.com'),
    ENCRYPTION_KEY: z.string().min(1, 'Encryption key is required').optional(),

    // AI Configuration
    OPENAI_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),

    // ═══════════════════════════════════════════════════════════════════════
    // Runtime Translation — Google Cloud Translation Advanced (spec §27, §28, §31)
    //
    // SECURITY: every value below is SERVER-ONLY. None of these are prefixed
    // with VITE_/NEXT_PUBLIC_, so the Vite/Next client bundler cannot inline
    // them into browser JavaScript. Do not add a public prefix (§28, §116).
    // ═══════════════════════════════════════════════════════════════════════
    GOOGLE_CLOUD_PROJECT_ID: z.string().optional(),
    GOOGLE_CLOUD_TRANSLATION_LOCATION: z.string().default('global'),
    /**
     * Model id, NOT an API version. The general built-in NMT model is
     * 'general/nmt'; 'v3' is the API version and is rejected by the provider.
     */
    GOOGLE_CLOUD_TRANSLATION_MODEL: z.string().default('general/nmt'),
    /** Full service-account JSON key material. Server-only. */
    GOOGLE_CLOUD_TRANSLATION_CREDENTIALS: z.string().optional(),
    /** Optional pre-minted access token, used instead of the service-account grant. */
    GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN: z.string().optional(),
    /** §34 — glossary version; a change must invalidate incompatible cache entries. */
    TRANSLATION_GLOSSARY_VERSION: z.string().default('none'),
    /** §115 — circuit breaker: consecutive provider failures before fail-open. */
    TRANSLATION_CIRCUIT_BREAKER_THRESHOLD: z.coerce.number().int().positive().default(5),
    /** §114 — budget guard: characters per window before translation is refused. */
    TRANSLATION_BUDGET_CHARS: z.coerce.number().int().positive().default(2_000_000),
});

const parseEnv = () => {
    const processEnv = {
        SUPABASE_URL: readEnv('VITE_SUPABASE_URL') || readEnv('NEXT_PUBLIC_SUPABASE_URL'),
        SUPABASE_ANON_KEY: readEnv('VITE_SUPABASE_ANON_KEY') || readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        SPACEREMIT_API_URL: 'https://spaceremit.com/api/v2',
        SPACEREMIT_PUBLIC_KEY: readEnv('VITE_SPACEREMIT_PUBLIC_KEY'),
        PAYMOB_API_KEY: readEnv('VITE_PAYMOB_API_KEY') || readEnv('PAYMOB_API_KEY'),
        PAYMOB_PUBLIC_KEY: readEnv('VITE_PAYMOB_PUBLIC_KEY') || '',
        PAYMOB_CARD_INTEGRATION_ID: readEnv('VITE_PAYMOB_CARD_INTEGRATION_ID') || readEnv('NEXT_PUBLIC_PAYMOB_CARD_INTEGRATION_ID') || '5573815',
        PAYMOB_WALLET_INTEGRATION_ID: readEnv('VITE_PAYMOB_WALLET_INTEGRATION_ID') || readEnv('NEXT_PUBLIC_PAYMOB_WALLET_INTEGRATION_ID') || '5792309',
        PAYMOB_KIOSK_INTEGRATION_ID: readEnv('VITE_PAYMOB_KIOSK_INTEGRATION_ID') || readEnv('NEXT_PUBLIC_PAYMOB_KIOSK_INTEGRATION_ID') || '5792311',
        PAYMOB_PAYPAL_INTEGRATION_ID: readEnv('VITE_PAYMOB_PAYPAL_INTEGRATION_ID') || readEnv('NEXT_PUBLIC_PAYMOB_PAYPAL_INTEGRATION_ID') || '5792310',
        STRIPE_PUBLISHABLE_KEY: readEnv('VITE_STRIPE_PUBLISHABLE_KEY'),
        SPACEREMIT_CALLBACK_URL: readEnv('VITE_SPACEREMIT_CALLBACK_URL'),
        PAYMENT_SUCCESS_URL: readEnv('VITE_PAYMENT_SUCCESS_URL'),
        PAYMENT_CANCEL_URL: readEnv('VITE_PAYMENT_CANCEL_URL'),
        MODE: readEnv('MODE'),
        SITE_URL: readEnv('VITE_SITE_URL') || readEnv('NEXT_PUBLIC_SITE_URL'),
        ENCRYPTION_KEY: readEnv('VITE_ENCRYPTION_KEY'),
        OPENAI_API_KEY: readEnv('VITE_OPENAI_API_KEY'),
        GEMINI_API_KEY: readEnv('VITE_GEMINI_API_KEY'),

        // Runtime translation — read directly from process.env, never via a
        // VITE_/NEXT_PUBLIC_ prefix, so credentials stay server-side (§28).
        GOOGLE_CLOUD_PROJECT_ID: readEnv('GOOGLE_CLOUD_PROJECT_ID'),
    GOOGLE_CLOUD_TRANSLATION_LOCATION: readEnv('GOOGLE_CLOUD_TRANSLATION_LOCATION'),
    GOOGLE_CLOUD_TRANSLATION_MODEL: readEnv('GOOGLE_CLOUD_TRANSLATION_MODEL'),
    GOOGLE_CLOUD_TRANSLATION_CREDENTIALS: readEnv('GOOGLE_CLOUD_TRANSLATION_CREDENTIALS'),
        GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN: readEnv('GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN'),
        TRANSLATION_GLOSSARY_VERSION: readEnv('TRANSLATION_GLOSSARY_VERSION'),
        TRANSLATION_CIRCUIT_BREAKER_THRESHOLD: readEnv('TRANSLATION_CIRCUIT_BREAKER_THRESHOLD'),
        TRANSLATION_BUDGET_CHARS: readEnv('TRANSLATION_BUDGET_CHARS'),
    };

    const parsed = envSchema.safeParse(processEnv);

    if (!parsed.success) {
        console.error('❌ Invalid environment configuration:', parsed.error.format());
        return processEnv as unknown as z.infer<typeof envSchema>;
    }

    return parsed.data;
};

export const env = parseEnv();
