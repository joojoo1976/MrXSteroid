# Website Issues Report - Mr. X Steroid

## Date: February 19, 2026

### Critical Issues Found

## 1. ✅ FIXED: Broken Font Preload
**Issue**: `index.html` was preloading `/fonts/CalibriLight.ttf` which doesn't exist
- **Impact**: 404 errors in console, wasted bandwidth
- **Fix**: Removed the broken preload link

## 2. ✅ FIXED: Content Security Policy (CSP) Too Restrictive
**Issue**: Google Analytics domains were missing from CSP
- **Impact**: Analytics scripts may be blocked
- **Fix**: Added `googletagmanager.com`, `google-analytics.com`, and `stats.g.doubleclick.net` to appropriate CSP directives

## 3. ✅ IMPROVED: PWA Manifest Enhancement
**Issue**: manifest.json was missing recommended fields
- **Impact**: Suboptimal PWA experience
- **Fix**: Added `description`, `orientation`, `purpose` for icons, `categories`, `lang`, and `dir`

---

## Current Website Status

### Login Page (`/login`)
**Status**: ✅ Working correctly

**Features**:
- Arabic/English localization working
- Form validation with Zod schema
- Rate limiting (5 attempts, 30s lockout)
- Supabase authentication integrated
- Responsive design

**Content Keys Used**:
- `gatekeeperTitle`: "بوابة الدخول" (AR) / "Gatekeeper" (EN)
- `gatekeeperSubtitle`: "اصنع إرثك أو أثبت هويتك" (AR) / "Create your legacy or identify yourself." (EN)
- `gatekeeperBtn`: "الدخول للنظام" (AR) / "Access Terminal" (EN)
- `emailLabel`: "البريد الإلكتروني" (AR) / "Email Address" (EN)
- `passwordLabel`: "كلمة المرور" (AR) / "Password" (EN)

### Sales Notifications (Toast Notifications)
**Status**: ⚠️ Showing simulated data

**Current Data** (Arabic):
```typescript
export const salesDataAr: SalesNotificationData[] = [
    { name: "أحمد م.", location: "الرياض، السعودية" },
    { name: "خالد س.", location: "دبي، الإمارات" },
    // ... 10 more entries
];
```

**Current Data** (English):
```typescript
export const salesDataEn: SalesNotificationData[] = [
    { name: "John D.", location: "New York, USA" },
    { name: "Michael S.", location: "London, UK" },
    // ... 10 more entries
];
```

**Note**: These are **simulated notifications** for social proof marketing. They are NOT real purchase data.
- This is a common marketing practice
- If you want to show REAL purchases, you would need to:
  1. Connect to your payment processor webhook
  2. Store real purchase data in Supabase
  3. Fetch and display actual transactions

### Supabase Configuration
**Status**: ✅ Configured

Environment variables present:
- `VITE_SUPABASE_URL`: https://alghvtpkpspnqupbvodu.supabase.co
- `VITE_SUPABASE_ANON_KEY`: [Configured]

---

## Recommendations

### If "All Data is Wrong" - Possible Causes:

1. **Language Mismatch**: 
   - Check if the site is auto-detecting the wrong language
   - Users can manually switch via the language selector in Header

2. **Currency Display**:
   - Currency is auto-detected based on geolocation
   - Rates are defined in `src/shared/lib/logic.ts`
   - Check if conversion rates are updating correctly

3. **Sales Notifications**:
   - These are intentionally fake for marketing (social proof)
   - To make them real, implement webhook integration with SpaceRemit

4. **Product Content**:
   - All content is localized in `src/i18n/ar.ts` and `src/i18n/en.ts`
   - Check if the correct language file is being loaded

5. **User Data**:
   - User profiles stored in Supabase `profiles` table
   - Check if Supabase connection is working in production

### Next Steps for Debugging:

1. **Open Browser Console** (F12) on the live site
2. **Check Network Tab** for failed API calls
3. **Verify Supabase Connection**:
   ```javascript
   // Run in browser console
   fetch('https://alghvtpkpspnqupbvodu.supabase.co/rest/v1/', {
     headers: { apikey: 'YOUR_ANON_KEY' }
   }).then(r => r.json()).then(console.log).catch(console.error);
   ```

4. **Check LocalStorage**:
   ```javascript
   // Run in browser console
   console.log({
     language: localStorage.getItem('mrx_explicit_language'),
     currency: localStorage.getItem('mrx_currency'),
     locale: localStorage.getItem('mrx_locale')
   });
   ```

---

## Files Modified in This Session

1. ✅ `index.html` - Removed broken font preload
2. ✅ `vercel.json` - Updated CSP to include Google Analytics domains
3. ✅ `public/manifest.json` - Enhanced PWA configuration

---

## Build Status
✅ **Build successful** - No compilation errors
