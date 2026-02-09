# 🛠️ SpaceRemit Public Key Fix Guide

If you are seeing an **"Incorrect Public Key"** error on the SpaceRemit payment page, follow these steps to fix your configuration.

## 1. Locate Your Correct Keys

Login to your [SpaceRemit Dashboard](https://spaceremit.com/dashboard) and navigate to **Websites And Keys**.

You will see:

- **Public Key**: Starts with `pk_` (starts with `sb_` for Sandbox/Test mode).
- **Secret Key**: Starts with `sk_`.

## 2. Identify the Issue

The error usually happens because:

- **Typo**: You copied an extra space or missed a character.
- **Incorrect Key**: You used the `Secret Key` where the `Public Key` belongs.
- **Wrong Format**: Your key starts with `pkO6` — this format is often rejected by the current SpaceRemit API v2. Search for a key starting with `pk_` or `sb_`.

## 3. Update Your Environment

Open your `.env` file and verify these variables:

```env
# ✅ Correct Format (Starts with pk_ or sb_)
VITE_SPACEREMIT_PUBLIC_KEY=pk_live_your_actual_public_key_here

# 🔒 Keep this secret (Starts with sk_)
SPACEREMIT_SECRET_KEY=sk_live_your_actual_secret_key_here
```

## 4. Verify with System Diagnostic

After updating your `.env` file:

1. Go to the **System Diagnostic** page in your app.
2. Click **Re-run** tests.
3. Look for the **SpaceRemit Key** status. It should now show a green checkmark if the format is valid.

---
> [!TIP]
> If you cannot find a key starting with `pk_`, try creating a new "Website" entry in your SpaceRemit dashboard to generate a fresh set of API v2 keys.
