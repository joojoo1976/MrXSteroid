/**
 * Safe environment reader that never throws in the browser.
 *
 * Next.js statically inlines `process.env.NEXT_PUBLIC_*` at build time, but ONLY
 * for static access (`process.env.NEXT_PUBLIC_SUPABASE_URL`). Dynamic access like
 * `process.env[key]` is never inlined — in the browser `process.env` is an empty
 * polyfill, so those values would be `undefined` at runtime. We therefore build a
 * static snapshot of every NEXT_PUBLIC_ key the app reads; the bundler inlines
 * each value here at build time, and the lookup below resolves from the snapshot.
 *
 * Any other key (VITE_ prefix, PAYMOB_API_KEY, etc.) is read defensively so the
 * client bundle never touches a missing `process` global.
 */

const PUBLIC_ENV: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_PAYMOB_CARD_INTEGRATION_ID: process.env.NEXT_PUBLIC_PAYMOB_CARD_INTEGRATION_ID,
    NEXT_PUBLIC_PAYMOB_WALLET_INTEGRATION_ID: process.env.NEXT_PUBLIC_PAYMOB_WALLET_INTEGRATION_ID,
    NEXT_PUBLIC_PAYMOB_KIOSK_INTEGRATION_ID: process.env.NEXT_PUBLIC_PAYMOB_KIOSK_INTEGRATION_ID,
    NEXT_PUBLIC_PAYMOB_PAYPAL_INTEGRATION_ID: process.env.NEXT_PUBLIC_PAYMOB_PAYPAL_INTEGRATION_ID,
    NEXT_PUBLIC_SPACEREMIT_PUBLIC_KEY: process.env.NEXT_PUBLIC_SPACEREMIT_PUBLIC_KEY,
    NEXT_PUBLIC_SPACEREMIT_PK: process.env.NEXT_PUBLIC_SPACEREMIT_PK,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
};

export function readEnv(key: string): string | undefined {
    if (key in PUBLIC_ENV) return PUBLIC_ENV[key];
    if (typeof process !== 'undefined' && process.env) {
        return (process.env as Record<string, string | undefined>)[key];
    }
    return undefined;
}
