# 🎯 MR. X STEROID - Complete Website Recreation Prompt

**Project URL:** https://mrxsteroid.vercel.app/  
**Repository:** https://github.com/joojoo1976/MrXSteroid  
**Date:** March 4, 2026

---

## 📋 PROMPT الرئيسي لإعادة الإنشاء

```
أريد إنشاء موقع إلكتروني متكامل لكتاب رقمي عن الستيرويدات واللياقة البدنية باسم "Mr X Steroid".

### 🎨 الهوية البصرية:
- **الألوان الرئيسية:**
  - الأسود (#000000) - خلفية
  - الذهبي (#EAB308) - accents وأزرار
  - الرمادي الداكن (#18181b, #27272a) - cards
  - الأبيض (#ffffff) - نصوص
  - الأخضر (#22c55e) - نجاح/أمان

- **الخطوط:**
  - للإنجليزية: Inter, system-ui
  - للعربية: Noto Sans Arabic, Tajawal

- **الشعار:**
  - شعار ديناميكي يتغير حسب اللغة
  - موجود في: /public/images/site-logo-mascot.png

### 🌐 اللغات:
- دعم كامل للعربية والإنجليزية (RTL/LTR)
- تبديل اللغة في الهيدر
- جميع النصوص ثنائية اللغة

### 📱 الصفحات الرئيسية:

#### 1. الصفحة الرئيسية (Home)
- Hero Section مع عنوان جذاب
- قسم المميزات (Features)
- قسم الفوائد (Benefits)
- قسم الأسعار (Pricing) - 6 باقات
- قسم الأسئلة الشائعة (FAQ)
- قسم التواصل (Contact)
- Footer كامل

#### 2. صفحة الدفع (Checkout) - ⚠️ مهمة جداً
**المسار:** /checkout

**المكونات:**
- ProductSelector: اختيار المنتج (digital, paperback, bundle, coaching, coaching_plus)
- OrderSummary: ملخص الطلب مع صورة الغلاف
- CheckoutForm: نموذج الدفع
  - Billing Details (الاسم، الإيميل، الدولة)
  - Shipping Details (العنوان، المدينة، الرمز البريدي)
  - Payment Method (Card أو Redirect)
  - SpaceRemit Card Element (⚠️ مهم جداً)

**SpaceRemit Integration:**
```typescript
// تحميل SDK
const script = document.createElement('script');
script.src = 'https://spaceremit.com/api/v2/js_script/spaceremit.js';
script.async = true;

// التهيئة
window.SPACEREMIT.init({
    public_key: import.meta.env.VITE_SPACEREMIT_PUBLIC_KEY,
    form_id: 'spaceremit-checkout-form',
    card_container_id: 'spaceremit-card-element',
    amount: finalTotal,
    currency: 'USD',
    customer_email: email,
    customer_name: fullName
});
```

**⚠️ مشاكل معروفة وحلولها:**
1. Card Details يظهر فارغاً:
   - أضف Loading/Error/Success states
   - أضف retry logic (3 محاولات)
   - تحقق من وجود publicKey
   - أضف fallback button للدفع عبر الرابط

2. الصور المحذوفة:
   - تأكد من وجود: /public/cover-ar.webp, cover-en.webp, Author_MrXSteroid.jpg
   - أضف onError fallback في OrderSummary

#### 3. صفحة النجاح (Success)
**المسار:** /success
- تأكيد نجاح الدفع
- رقم الطلب
- تفاصيل الشحن

#### 4. صفحة الإلغاء (Cancel)
**المسار:** /cancel
- رسالة إلغاء الدفع
- زر للعودة للدفع

#### 5. صفحة التشخيص (Diagnostic)
**المسار:** /payment-diagnostic
- فحص Environment Variables
- فحص HTTPS
- فحص SpaceRemit SDK
- فحص CSP

### 🔧 التقنيات المطلوبة:

#### Frontend:
- **Framework:** React 18+ مع TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **State Management:** Context API
- **Forms:** React Hook Form + Zod validation

#### Backend:
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** SpaceRemit Gateway
- **Hosting:** Vercel

### 🔐 المصادقة (Authentication):
- تسجيل دخول/تسجيل
- استعادة كلمة المرور
- حماية الصفحات (AuthGuard)
- ملف شخصي للمستخدم

### 💳 نظام الدفع:

#### SpaceRemit Configuration:
```env
VITE_SPACEREMIT_PUBLIC_KEY=***SPACEREMIT_PUBLIC_KEY_REDACTED***
SPACEREMIT_SECRET_KEY=***SPACEREMIT_SECRET_KEY_REDACTED***
SPACEREMIT_WEBHOOK_SECRET=***SPACEREMIT_SECRET_KEY_REDACTED***
VITE_SPACEREMIT_CALLBACK_URL=https://mrxsteroid.vercel.app/api/payments/callback
```

#### Webhook Handler:
**المسار:** /api/payments/callback
- التحقق من التوقيع (HMAC SHA256)
- تحديث has_paid = TRUE
- تفعيل الاشتراك
- حماية من IDOR

### 📊 قاعدة البيانات (Supabase):

#### الجداول المطلوبة:

1. **profiles**
```sql
- id (uuid, PK)
- email (text)
- full_name (text)
- subscription_status (text)
- has_paid (boolean)
- plan_tier (text)
- created_at (timestamp)
- updated_at (timestamp)
```

2. **payments**
```sql
- id (uuid, PK)
- transaction_id (text, unique)
- user_id (uuid, FK)
- order_id (text)
- amount (numeric)
- currency (text)
- status (text: pending, completed, failed, cancelled)
- spaceremit_code (text)
- customer_email (text)
- customer_name (text)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

3. **subscriptions**
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- status (text)
- product_id (text)
- current_period_start (timestamp)
- current_period_end (timestamp)
- metadata (jsonb)
```

4. **orders**
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- total_amount (numeric)
- status (boolean)
- transaction_id (text)
- created_at (timestamp)
```

### 🎯 المميزات الرئيسية:

#### 1. حاسبات اللياقة:
- Macro Calculator
- Body Fat Calculator
- Injection Map
- Half Life Visualizer
- Master Calculator
- Genetic Potential Calculator

#### 2. نظام الباقات:
```typescript
const variants = {
    digital: { price: 49.99, requiresShipping: false },
    paperback: { price: 72.00, requiresShipping: true },
    bundle: { price: 72.00, requiresShipping: true },
    coaching: { price: 82.00, requiresShipping: true },
    coaching_plus: { price: 282.00, requiresShipping: true }
};
```

#### 3. الشحن:
- حساب تكلفة الشحن حسب الدولة
- شركات شحن متعددة (Aramex, DHL, FedEx)
- تتبع حالة الشحن

### 📁 هيكل المشروع:

```
MrXSteroid/
├── .github/workflows/ci.yml
├── .env
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── index.html
├── public/
│   ├── cover-ar.webp
│   ├── cover-en.webp
│   ├── Author_MrXSteroid.jpg
│   ├── images/site-logo-mascot.png
│   └── ...
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── config/
│   │   └── env.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── PreferencesContext.tsx
│   ├── features/
│   │   ├── auth/
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── SpaceRemitCardElement.tsx
│   │   │   ├── OrderSummary.tsx
│   │   │   └── hooks/useCheckout.ts
│   │   ├── calculator/
│   │   └── marketing/
│   ├── pages/
│   │   ├── CheckoutPage.tsx
│   │   ├── SuccessPage.tsx
│   │   ├── CancelPage.tsx
│   │   └── PaymentConfigDiagnostic.tsx
│   ├── shared/
│   │   ├── lib/
│   │   │   ├── payment.service.ts
│   │   │   └── supabase.ts
│   │   ├── ui/
│   │   └── types/
│   └── api/
│       └── payments/
│           └── callback.ts
```

### ⚠️ نقاط حرجة يجب الانتباه لها:

#### 1. SpaceRemit Card Element:
```typescript
// ✅ تأكد من:
- التحقق من publicKey غير فارغ
- تحميل SDK بشكل async
- انتظار onload قبل التهيئة
- فحص containerRef.current موجود
- فحص CSS لا يخفي العنصر
- إضافة retry logic (3 محاولات)
- عرض رسائل خطأ واضحة
- زر fallback للدفع عبر الرابط
```

#### 2. Environment Variables:
```env
# يجب أن تكون في Vercel:
VITE_SPACEREMIT_PUBLIC_KEY=pkO6RUYN...
SPACEREMIT_SECRET_KEY=sk2ESRSU...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
VITE_ENCRYPTION_KEY=...
```

#### 3. Webhook Security:
```typescript
// ✅ تأكد من:
- التحقق من HMAC signature
- منع IDOR attacks
- تحديث has_paid = TRUE
- تفعيل الاشتراك تلقائياً
- تحويل Guest إلى User
```

### 🎨 مكونات UI المطلوبة:

#### Buttons:
```tsx
<Button className="bg-gold-500 hover:bg-gold-400 text-black font-black">
```

#### Cards:
```tsx
<Card className="bg-zinc-900 border-zinc-800 backdrop-blur-xl">
```

#### Inputs:
```tsx
<Input className="bg-black/40 border-zinc-800 focus:border-gold-500" />
```

### 📱 Responsive Design:
- Mobile First
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid layouts للـ products
- Sticky sidebar للـ Order Summary

### 🔍 SEO:
- meta tags لكل صفحة
- Open Graph tags
- Twitter Card tags
- Sitemap.xml
- Robots.txt

### 🚀 الأداء:
- Lazy loading للـ pages
- Code splitting
- Image optimization
- Caching strategy

### 🧪 الاختبار:
```bash
# اختبار الدفع:
1. انتقل إلى /checkout
2. اختر منتج
3. اختر "Credit Card"
4. تحقق من ظهور Card Details
5. أكمل الدفع

# اختبار التشخيص:
1. انتقل إلى /payment-diagnostic
2. تحقق من جميع الفحوصات
```

### 📄 الوثائق المطلوبة:
- README.md
- DEPLOYMENT_GUIDE.md
- PAYMENT_FIX_SUMMARY.md
- CONTRIBUTING.md

### 🎯 معايير القبول:
- [ ] جميع الصفحات تعمل
- [ ] Card Details يظهر بشكل صحيح
- [ ] الدفع يعمل بنجاح
- [ ] Webhook يحدث has_paid = TRUE
- [ ] الصور تظهر
- [ ] اللغات تعمل
- [ ] Responsive على جميع الأجهزة
- [ ] لا أخطاء في Console
- [ ] Build ناجح
```

---

## 📦 الملفات الأساسية للرجوع إليها:

### 1. SpaceRemitCardElement.tsx
```typescript
// المسار: src/features/checkout/SpaceRemitCardElement.tsx
// ⚠️ هذا أهم ملف في نظام الدفع!
```

### 2. CheckoutForm.tsx
```typescript
// المسار: src/features/checkout/CheckoutForm.tsx
// يحتوي على نموذج الدفع الكامل
```

### 3. payment.service.ts
```typescript
// المسار: src/shared/lib/payment.service.ts
// خدمة الدفع الخلفية
```

### 4. callback.ts
```typescript
// المسار: api/payments/callback.ts
// Webhook handler
```

### 5. OrderSummary.tsx
```typescript
// المسار: src/features/checkout/OrderSummary.tsx
// ملخص الطلب مع الصور
```

---

## 🔧 الأوامر المطلوبة:

```bash
# التطوير
npm run dev

# البناء
npm run build

# الاختبار
npm run test

# النشر
git push origin main
```

---

## 📞 روابط مهمة:

- **SpaceRemit Docs:** https://spaceremit.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo:** https://github.com/joojoo1976/MrXSteroid

---

**ملاحظة:** هذا البرومبت شامل ويحتوي على كل التفاصيل اللازمة لإعادة إنشاء الموقع من الصفر.
