# 🎯 MR. X STEROID - Quick Recreation Prompt

**URL:** https://mrxsteroid.vercel.app/

---

## 📋 البرومبت المختصر

```
أريد إنشاء موقع Mr X Steroid - كتاب رقمي عن اللياقة البدنية.

### المتطلبات الأساسية:

#### 1. التقنيات:
- React + TypeScript + Vite
- TailwindCSS + shadcn/ui
- Framer Motion + Lucide Icons
- Supabase (DB + Auth)
- SpaceRemit (Payments)
- Vercel (Hosting)

#### 2. الألوان:
- أسود (#000000) + ذهبي (#EAB308) + رمادي داكن

#### 3. اللغات:
- عربي + إنجليزي (RTL/LTR)

#### 4. الصفحات:
- Home (Hero, Features, Benefits, Pricing, FAQ, Contact)
- Checkout (⚠️ مهمة - فيها SpaceRemit payment)
- Success/Cancel/Payment-Pending
- Payment-Diagnostic (للفحص)

#### 5. الدفع (⚠️ أهم جزء):
```env
VITE_SPACEREMIT_PUBLIC_KEY=***SPACEREMIT_PUBLIC_KEY_REDACTED***
SPACEREMIT_SECRET_KEY=***SPACEREMIT_SECRET_KEY_REDACTED***
```

**المشاكل المعروفة وحلولها:**
1. Card Details فارغ → أضف Loading/Error states + retry logic
2. الصور محذوفة → استعد cover-ar.webp, cover-en.webp, Author_MrXSteroid.jpg

#### 6. قاعدة البيانات (Supabase):
- profiles (id, email, has_paid, subscription_status)
- payments (transaction_id, amount, status, spaceremit_code)
- subscriptions (user_id, status, product_id)
- orders (user_id, total_amount, status)

#### 7. Webhook:
- المسار: /api/payments/callback
- يحدث has_paid = TRUE عند النجاح
- يحقق من HMAC signature

#### 8. الملفات الحرجة:
- src/features/checkout/SpaceRemitCardElement.tsx ⚠️
- src/features/checkout/CheckoutForm.tsx
- src/shared/lib/payment.service.ts
- api/payments/callback.ts

#### 9. Environment Variables (Vercel):
- VITE_SPACEREMIT_PUBLIC_KEY
- SPACEREMIT_SECRET_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

#### 10. معايير القبول:
- ✅ Card Details يظهر بشكل صحيح
- ✅ الدفع يعمل
- ✅ Webhook يحدث has_paid = TRUE
- ✅ الصور تظهر
- ✅ اللغات تعمل
- ✅ لا أخطاء في Console
```

---

## 📁 الملفات الكاملة للرجوع:

1. [`COMPLETE_RECREATION_PROMPT.md`](./COMPLETE_RECREATION_PROMPT.md) - برومبت شامل
2. [`CHECKOUT_FIX_SUMMARY_AR.md`](./CHECKOUT_FIX_SUMMARY_AR.md) - إصلاحات الدفع
3. [`FINAL_ENGINEERING_REPORT.md`](./FINAL_ENGINEERING_REPORT.md) - تقرير هندسي

---

**للاستخدام:** انسخ البرومبت المختصر وأعطه لأي AI Assistant لإعادة إنشاء الموقع.
