# Email Confirmation Fix Guide

## Problem
Users are signing up but not receiving confirmation emails, or the confirmation process is not working correctly.

## Root Causes

### 1. Supabase Email Settings
- **Hosted Supabase**: Email confirmation is ENABLED by default
- **Free Tier**: Only 2 emails per hour rate limit
- **Custom SMTP**: Not configured (required for production)

### 2. Email Redirect URL
The `emailRedirectTo` option must match your site URL exactly.

### 3. Email Template Configuration
Supabase's default email templates may not be configured properly.

## Solutions

### Option 1: Configure Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**:
   - URL: https://app.supabase.com
   - Select your project: `alghvtpkpspnqupbvodu`

2. **Navigate to Email Settings**:
   - Go to: Authentication → Providers → Email
   - OR: Authentication → Email Templates

3. **Enable/Disable Email Confirmation**:
   - Toggle "Confirm email" based on your needs
   - For testing: You can disable it temporarily
   - For production: Keep it enabled with custom SMTP

4. **Configure Email Templates**:
   - Go to: Authentication → Email Templates
   - Select "Confirm signup" template
   - Customize the template if needed
   - Ensure the redirect URL is correct

5. **Set up Custom SMTP (Production)**:
   - Go to: Project Settings → Auth → SMTP Settings
   - Configure with your email provider (SendGrid, Mailgun, etc.)

### Option 2: Update Code Configuration

The current code already has the correct `emailRedirectTo` configuration:

```typescript
// In useSignup.ts (line 66)
emailRedirectTo: `${window.location.origin}/auth/callback`,
```

Make sure your `AuthCallbackPage.tsx` handles the confirmation properly.

### Option 3: Add Resend Confirmation Feature

Already implemented in `ProfilePage.tsx` (line 69-84):

```typescript
const handleResendConfirmation = async () => {
    // Resends confirmation email
};
```

### Option 4: Test with Mailpit (Local Development)

For local testing without sending real emails:

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start local Supabase:
   ```bash
   supabase start
   ```

3. Check Mailpit for emails:
   ```bash
   supabase status
   # Open the Mailpit URL in browser
   ```

## Verification Steps

1. **Test Signup Flow**:
   - Create a test account with a real email
   - Check if confirmation email arrives
   - Click the confirmation link
   - Verify you can log in

2. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Logs
   - Filter by "auth" events
   - Look for signup and email events

3. **Test Resend Feature**:
   - Go to Profile page
   - Click "Resend Confirmation Link"
   - Check if email arrives

## Current Implementation Status

✅ `useSignup.ts` - Correctly sends confirmation email
✅ `AuthCallbackPage.tsx` - Handles confirmation callback
✅ `ProfilePage.tsx` - Has resend confirmation feature
✅ Email redirect URL is configured correctly

## Recommended Actions

1. **Immediate**: Check Supabase Dashboard → Authentication → Email Templates
2. **Short-term**: Configure custom SMTP for reliable email delivery
3. **Long-term**: Add email delivery monitoring and retry logic

## Testing Commands

```bash
# Test signup with Node.js
node test-signup.js

# Check Supabase status
supabase status

# View auth logs (requires Supabase CLI)
supabase logs --format json | grep auth
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Email not received | Check spam folder, configure custom SMTP |
| Confirmation link broken | Verify `emailRedirectTo` matches your domain |
| "User already registered" | User needs to login, not signup again |
| Rate limit exceeded | Wait 1 hour or configure custom SMTP |
