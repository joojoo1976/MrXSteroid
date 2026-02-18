# DEPLOYMENT MANIFEST (FINAL CHECK)

> **CRITICAL:** Your project is **Vite**, not Next.js.
> You MUST use the `VITE_` prefix for these keys in Vercel, or the site will break.
> I have corrected the names below. Please copy THESE exact Keys and Values to Vercel.

## 1. Supabase (Database & Auth)

| Key (Use This Name) | Value (From your edit) |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://alghvtpkpspnqupbvodu.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZ2h2dHBrcHNwbnF1cGJ2b2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDgyMTYsImV4cCI6MjA4MTQyNDIxNn0.4en9cYMCkIwxd1pWxehb9-lP77cHgh5FhZnrBRg-yaw` |

> **✅ Security Check Passed:** This is the correct "anon" key. It allows safe public access to your app.

## 2. Stripe (Payments)

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_test_51QBo8dBt3dS0qExGPATgsbITgGcjZ3RMmWtnd6RGzX7lkRfmPWokwz4fBQD90n5J7NeAzNFNReOfFwbvlpMlRxeX00IxHgOMwJ` | Stripe Publishable Key |
| `VITE_ENCRYPTION_KEY` | `mZq4t7w9z$C&F)J@NcRfUjWnZr4u7x!A` | *(Generated Secure Key)* |
