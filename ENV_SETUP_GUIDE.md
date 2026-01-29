# Environment Setup Guide

To ensure that the application (Mr. X-Steroid) can communicate with the database and handle payments correctly, you must set the environment variables in your `.env` file accurately.

## 1. Supabase (Database & Authentication)

Currently, your `.env` file is using **SpaceRemit** keys for **Supabase** variables. This will cause all signup and login attempts to fail.

### How to Fix

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Project Settings** > **API**.
3. Copy the **Project URL** and paste it into `VITE_SUPABASE_URL`.
4. Copy the **anon public** key (starts with `eyJ...`) and paste it into `VITE_SUPABASE_ANON_KEY`.

**Correct Structure:**

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (Long JWT Token)
```

> [!WARNING]
> Never use a key starting with `sb_secret_` or `service_role` in `VITE_SUPABASE_ANON_KEY`. These are internal keys that should never be exposed to the browser.

---

## 2. SpaceRemit (Payments)

The keys starting with `sb_` belong to SpaceRemit. They should be placed in their own variables if you are implementing payment logic.

**Example:**

```env
VITE_SPACEREMIT_PUBLIC_KEY=sb_publishable_...
VITE_SPACEREMIT_SECRET_KEY=sb_secret_...
```

---

## Current Discrepancy Found

| Variable | Current Value | Correct Value Type |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://alghvtpkpspnqupbvodu.supabase.co` | (Looks Correct) |
| `VITE_SUPABASE_ANON_KEY` | `sb_secret_...` | **WRONG** (Should be `eyJ...`) |

Please update your `.env` file with the correct **anon public** key from Supabase to restore signup functionality.
