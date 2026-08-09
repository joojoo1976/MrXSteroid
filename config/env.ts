import { z } from 'zod';

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
    SPACEREMIT_CALLBACK_URL: z.string().url().default('https://mrxsteroid.vercel.app/api/payments/callback'),
    PAYMENT_SUCCESS_URL: z.string().default(`${typeof window !== 'undefined' ? window.location.origin : ''}/success`),
    PAYMENT_CANCEL_URL: z.string().default(`${typeof window !== 'undefined' ? window.location.origin : ''}/cancel`),

    // Stripe (Link by Stripe / PaymentElement — client-side publishable key)
    STRIPE_PUBLISHABLE_KEY: z.string().optional(),

    // App Config
    MODE: z.enum(['development', 'production', 'test']).default('development'),
    SITE_URL: z.string().url().optional().default('https://mrxsteroid.vercel.app'),
    ENCRYPTION_KEY: z.string().min(1, 'Encryption key is required').optional(),

    // AI Configuration
    OPENAI_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
});

const parseEnv = () => {
    const pe: Record<string, string | undefined> =
        typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : {};
    const processEnv = {
        SUPABASE_URL: pe.VITE_SUPABASE_URL || pe.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: pe.VITE_SUPABASE_ANON_KEY || pe.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SPACEREMIT_API_URL: 'https://spaceremit.com/api/v2',
        SPACEREMIT_PUBLIC_KEY: pe.VITE_SPACEREMIT_PUBLIC_KEY,
        PAYMOB_API_KEY: pe.VITE_PAYMOB_API_KEY || pe.PAYMOB_API_KEY,
        PAYMOB_PUBLIC_KEY: pe.VITE_PAYMOB_PUBLIC_KEY || '',
        PAYMOB_CARD_INTEGRATION_ID: pe.VITE_PAYMOB_CARD_INTEGRATION_ID || pe.NEXT_PUBLIC_PAYMOB_CARD_INTEGRATION_ID || '5573815',
        PAYMOB_WALLET_INTEGRATION_ID: pe.VITE_PAYMOB_WALLET_INTEGRATION_ID || pe.NEXT_PUBLIC_PAYMOB_WALLET_INTEGRATION_ID || '5792309',
        PAYMOB_KIOSK_INTEGRATION_ID: pe.VITE_PAYMOB_KIOSK_INTEGRATION_ID || pe.NEXT_PUBLIC_PAYMOB_KIOSK_INTEGRATION_ID || '5792311',
        PAYMOB_PAYPAL_INTEGRATION_ID: pe.VITE_PAYMOB_PAYPAL_INTEGRATION_ID || pe.NEXT_PUBLIC_PAYMOB_PAYPAL_INTEGRATION_ID || '5792310',
        STRIPE_PUBLISHABLE_KEY: pe.VITE_STRIPE_PUBLISHABLE_KEY,
        SPACEREMIT_CALLBACK_URL: pe.VITE_SPACEREMIT_CALLBACK_URL,
        PAYMENT_SUCCESS_URL: pe.VITE_PAYMENT_SUCCESS_URL,
        PAYMENT_CANCEL_URL: pe.VITE_PAYMENT_CANCEL_URL,
        MODE: pe.MODE,
        SITE_URL: pe.VITE_SITE_URL || pe.NEXT_PUBLIC_SITE_URL,
        ENCRYPTION_KEY: pe.VITE_ENCRYPTION_KEY,
        OPENAI_API_KEY: pe.VITE_OPENAI_API_KEY,
        GEMINI_API_KEY: pe.VITE_GEMINI_API_KEY,
    };

    const parsed = envSchema.safeParse(processEnv);

    if (!parsed.success) {
        console.error('❌ Invalid environment configuration:', parsed.error.format());
        return processEnv as unknown as z.infer<typeof envSchema>;
    }

    return parsed.data;
};

export const env = parseEnv();
