export const PAYMENT_CONFIG = {
    spaceRemit: {
        scriptUrl: 'https://spaceremit.com/api/v2/js_script/spaceremit.js',
        // PLACEHOLDER KEYS - Connect to User's Account Later
        publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
        // WARNING: Secret Key must NEVER be used on client-side.
        // Use Supabase Edge Functions for handling secrets.
        testMode: import.meta.env.MODE !== 'production'
    }
};
