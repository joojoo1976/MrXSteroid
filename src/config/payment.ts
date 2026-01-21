export const PAYMENT_CONFIG = {
    spaceRemit: {
        scriptUrl: 'https://spaceremit.com/api/v2/js_script/spaceremit.js',
        // PLACEHOLDER KEYS - Connect to User's Account Later
        publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
        secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY,
        testMode: import.meta.env.MODE !== 'production' // Set to false in production
    }
};
