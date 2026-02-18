---
name: code-review
description: Audits code for security holes, "Mr. X" styling compliance, and performance. strictly for Next.js (Web) and React Native (Mobile).
---

# Mr. X Code Review Protocol

Use this skill to review Pull Requests (PRs) or current code files before deployment.

## 1. Security & Keys (HIGHEST PRIORITY)

- **Secret Scan:** Ensure NO sensitive keys (Service Role, Twilio Auth Token) are hardcoded. They must use `process.env` or `Expo SecureStore`.
- **Supabase:** Verify RLS (Row Level Security) policies are active. Users should only see their own data.
- **Middleware:** Check if protected routes (like `/dashboard`) are actually guarded by the auth middleware.

## 2. "Mr. X" Aesthetic Compliance

- **Color Palette:** Reject default blue/white UI.
  - Background must be `#050505` or `#1A1A1A`.
  - Accents must be Gold `#D4AF37`.
- **Typography:** Ensure fonts are consistent with the brand (Bold, Sharp).
- **Mobile UI:** For React Native, ensure `SafeAreaView` is used and backgrounds are strictly dark to prevent "White Flash" on load.

## 3. Performance & Architecture

- **React 19/Next.js:** Prefer Server Components for data fetching. Use Client Components only for interactivity.
- **Image Optimization:** Ensure `next/image` is used for Web and optimized cached images for Mobile.
- **Clean Code:** No `console.log` in production code.

## How to Provide Feedback

1. **Identify:** Point out the line number and the specific violation (e.g., "Line 45: Hardcoded API Key detected").
2. **Explain:** Briefly state why this is dangerous or off-brand.
3. **Fix:** Provide the corrected code block immediately.

## Example Usage

User: "Review this login page."
Agent: "Reviewing...
[CRITICAL]: You are exposing the Supabase Secret Key on line 12. Move it to .env.
[STYLE]: The login button is standard blue. Change `bg-blue-500` to `bg-[#D4AF37]` (Gold)."
