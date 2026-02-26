# Quick Testing Checklist - User Flow

## 🔐 Email Confirmation Setup (ONE-TIME)

### Gmail App Password
- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Create app password named "Supabase"
- [ ] Copy the 16-character password

### Supabase SMTP Configuration
- [ ] Dashboard → Authentication → Providers → SMTP
- [ ] Enter:
  - Sender email: `foryoutalk@gmail.com`
  - Host: `smtp.gmail.com`
  - Port: `587`
  - User: `foryoutalk@gmail.com`
  - Password: `[Google App Password]`
- [ ] Click "Save"

---

## ✅ Test 1: Sign-up Flow

### Steps:
1. [ ] Navigate to `/signup`
2. [ ] Fill form:
   - Full Name: `Test User`
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123!`
3. [ ] Click "Create Account"

### Expected Results:
- [ ] Success toast: "Account created! Check your email to verify."
- [ ] Console log: `Supabase signUp response:` with user data
- [ ] No errors in console

### Database Verification:
```sql
-- Run in Supabase SQL Editor
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'test@example.com';
```
- [ ] User exists in `auth.users`

```sql
SELECT id, email, full_name, user_name 
FROM public.profiles 
WHERE email = 'test@example.com';
```
- [ ] Profile exists in `public.profiles`

---

## ✅ Test 2: Email Confirmation

### Steps:
1. [ ] Open email inbox for `test@example.com`
2. [ ] Find email from "Mr. X Steroid"
3. [ ] Click "Confirm Email" link
4. [ ] Wait for redirect

### Expected Results:
- [ ] Redirect to `/auth/callback`
- [ ] Console log: `📧 Email confirmation callback detected`
- [ ] Console log: `📧 Email confirmed: true User ID: [id]`
- [ ] Console log: `✅ Profile synced successfully`
- [ ] Success toast: "Account verified successfully!"
- [ ] Redirect to `/dashboard`

### Token Verification:
```javascript
// Open browser DevTools → Console
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);
console.log('Email confirmed:', data.session?.user.email_confirmed_at);
```
- [ ] Session exists
- [ ] `email_confirmed_at` is not null
- [ ] `access_token` exists

### LocalStorage Check:
```javascript
// In browser console
Object.keys(localStorage).filter(k => k.includes('sb-'));
```
- [ ] Auth token key exists (e.g., `sb-alghvtpkpspnqupbvodu-auth-token`)

---

## ✅ Test 3: Session Persistence

### Steps:
1. [ ] After email confirmation, refresh the page (F5)
2. [ ] Check if user is still logged in

### Expected Results:
- [ ] User remains logged in
- [ ] No redirect to login page
- [ ] Dashboard still visible
- [ ] Console log shows session restored

### Verification:
```javascript
// Check in browser console
const { data } = await supabase.auth.getSession();
console.log('Session after refresh:', data.session);
```
- [ ] Session persists after refresh
- [ ] Same user ID as before

---

## ✅ Test 4: Checkout Auto-Fill

### Prerequisites:
- [ ] User must be logged in with confirmed email

### Steps:
1. [ ] Navigate to `/checkout`
2. [ ] Select a product tier
3. [ ] Observe the checkout form

### Expected Results:
- [ ] Email field is pre-filled with user's email
- [ ] Full Name field is pre-filled with user's name
- [ ] Console log shows auto-fill effect ran

### Verification:
```javascript
// In browser console, check form state
// (Add this to CheckoutForm.tsx temporarily)
console.log('Form values:', form.getValues());
```
- [ ] `email` matches authenticated user
- [ ] `fullName` matches profile data
- [ ] `userId` is set to authenticated user ID

---

## ✅ Test 5: Protected Routes

### Test A: Unconfirmed Email
1. [ ] Create new account (don't confirm email)
2. [ ] Try to access `/dashboard`
3. [ ] Expected: Redirect to profile page with warning

### Test B: Confirmed Email
1. [ ] Confirm email
2. [ ] Access `/dashboard`
3. [ ] Expected: Page loads successfully

---

## ✅ Test 6: Logout & Login

### Steps:
1. [ ] Click "Logout" button
2. [ ] Verify redirect to login page
3. [ ] Login with confirmed credentials
4. [ ] Verify redirect to dashboard

### Expected Results:
- [ ] Logout clears session
- [ ] LocalStorage tokens removed
- [ ] Login restores session
- [ ] Auto-fill works on second login

---

## 🐛 Debugging Commands

### Check User in Database
```sql
SELECT 
    u.id, 
    u.email, 
    u.email_confirmed_at,
    u.created_at,
    p.full_name,
    p.user_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'test@example.com';
```

### Check All Sessions
```javascript
// In browser console
const tokens = localStorage.getItem('sb-alghvtpkpspnqupbvodu-auth-token');
if (tokens) {
    const parsed = JSON.parse(tokens);
    console.log('Access Token:', parsed.access_token);
    console.log('Refresh Token:', parsed.refresh_token);
    console.log('User ID:', parsed.user?.id);
    console.log('Email:', parsed.user?.email);
}
```

### Force Session Refresh
```javascript
// In browser console
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data.session);
console.log('Error:', error);
```

---

## 📊 Success Criteria

| Test | Status | Notes |
|------|--------|-------|
| Sign-up creates user in auth.users | ☐ | |
| Sign-up creates profile in public.profiles | ☐ | |
| Confirmation email sent | ☐ | |
| Email link redirects to callback | ☐ | |
| Session created after confirmation | ☐ | |
| Tokens stored in localStorage | ☐ | |
| Session persists after refresh | ☐ | |
| Checkout auto-fills email | ☐ | |
| Checkout auto-fills name | ☐ | |
| Protected routes work | ☐ | |

---

## 🆘 Common Issues

### Issue: Email not received
**Solution:** Check Supabase logs → Dashboard → Logs → Auth

### Issue: Profile not created
**Solution:** Run migration: `supabase/migrations/20260214_final_auth_sync.sql`

### Issue: Session lost on refresh
**Solution:** Check localStorage is enabled, verify `persistSession: true`

### Issue: Auto-fill not working
**Solution:** Verify `useAuth()` returns user data, check console for errors

---

**Last Updated:** February 26, 2026  
**Status:** Ready for Testing
