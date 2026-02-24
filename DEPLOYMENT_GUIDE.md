# 🚀 دليل النشر على Vercel - Mr. X Steroid

## 📋 المتطلبات الأساسية

1. حساب على [Vercel](https://vercel.com)
2. حساب على [Supabase](https://supabase.com) مع مشروع مُعد
3. حساب على [SpaceRemit](https://spaceremit.com) للحصول على مفاتيح الدفع

---

## 🔧 الخطوة 1: إعداد قاعدة البيانات في Supabase

1. افتح [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك: `alghvtpkpspnqupbvodu`
3. اذهب إلى **SQL Editor**
4. انسخ والصق محتوى ملف `supabase/database-setup.sql`
5. اضغط **Run** لتنفيذ السكريبت

### النتيجة المتوقعة:
- ✅ جدول `profiles` مع أعمدة: `id`, `email`, `has_paid`, `plan_tier`
- ✅ جدول `payments` لتسجيل المعاملات
- ✅ جدول `subscriptions` (اختياري)
- ✅ Trigger لإنشاء profile تلقائي عند التسجيل
- ✅ Trigger لتحديث `has_paid` عند اكتمال الدفع

---

## 🔐 الخطوة 2: الحصول على مفاتيح Supabase

من **Project Settings > API**:

| المتغير | القيمة |
|---------|--------|
| `SUPABASE_URL` | `https://alghvtpkpspnqupbvodu.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (موجود) |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ **مطلوب للـ Backend** - احصل عليه من Dashboard |

⚠️ **تحذير**: `SERVICE_ROLE_KEY` حساس جداً! لا تشاركه أبداً!

---

## 💳 الخطوة 3: الحصول على مفاتيح SpaceRemit

من [SpaceRemit Dashboard](https://spaceremit.com/dashboard):

| المتغير | الوصف |
|---------|--------|
| `VITE_SPACEREMIT_PUBLIC_KEY` | المفتاح العام (موجود: `***SPACEREMIT_PUBLIC_KEY_REDACTED***`) |
| `SPACEREMIT_SECRET_KEY` | ⚠️ **مطلوب** - المفتاح السري للـ Backend |
| `SPACEREMIT_WEBHOOK_SECRET` | (اختياري) للتحقق من توقيع Webhook |

---

## 🌐 الخطوة 4: إعداد متغيرات البيئة في Vercel

1. افتح [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروعك: `mrxsteroid`
3. اذهب إلى **Settings > Environment Variables**

### أضف المتغيرات التالية:

#### المتغيرات العامة (Environment: Production, Preview, Development):

```
NEXT_PUBLIC_SUPABASE_URL=https://alghvtpkpspnqupbvodu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZ2h2dHBrcHNwbnF1cGJ2b2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDgyMTYsImV4cCI6MjA4MTQyNDIxNn0.4en9cYMCkIwxd1pWxehb9-lP77cHgh5FhZnrBRg-yaw
VITE_SPACEREMIT_PUBLIC_KEY=***SPACEREMIT_PUBLIC_KEY_REDACTED***
VITE_SPACEREMIT_CALLBACK_URL=https://mrxsteroid.vercel.app/api/payments/callback
VITE_PAYMENT_SUCCESS_URL=https://mrxsteroid.vercel.app/success
VITE_PAYMENT_CANCEL_URL=https://mrxsteroid.vercel.app/cancel
VITE_SITE_URL=https://mrxsteroid.vercel.app
VITE_ENCRYPTION_KEY=MrXSteroid2024SecretKey32Chars!
```

#### المتغيرات السرية (Environment: Production فقط):

```
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
SPACEREMIT_SECRET_KEY=<your_spaceremit_secret_key>
SPACEREMIT_WEBHOOK_SECRET=<your_webhook_secret>
```

---

## 🚀 الخطوة 5: النشر

### الطريقة 1: النشر التلقائي (موصى بها)

إذا كان المشروع متصل بـ GitHub، سيتم النشر تلقائياً عند:
- Push إلى `main` branch
- Pull Request merges

### الطريقة 2: النشر اليدوي

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod
```

---

## ✅ الخطوة 6: التحقق من النشر

### 1. تحقق من المصادقة:
- [ ] افتح `/signup` وأنشئ حساب جديد
- [ ] تحقق من وصول إيميل التحقق
- [ ] سجل الدخول بعد التحقق

### 2. تحقق من قاعدة البيانات:
- [ ] افتح Supabase Dashboard > Table Editor
- [ ] تحقق من وجود سجل في جدول `profiles`
- [ ] تحقق من أن `has_paid = false`

### 3. تحقق من الدفع:
- [ ] اذهب إلى Checkout
- [ ] أكمل عملية دفع تجريبية
- [ ] تحقق من تحديث `has_paid = true`
- [ ] تحقق من ظهور المحتوى الحصري

---

## 🔧 استكشاف الأخطاء

### مشكلة: "Invalid Supabase configuration"
**الحل**: تحقق من صحة `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### مشكلة: "Payment gateway not configured"
**الحل**: تحقق من `VITE_SPACEREMIT_PUBLIC_KEY`

### مشكلة: "User profile not created"
**الحل**: 
1. تأكد من تنفيذ سكريبت SQL
2. تحقق من وجود الـ Trigger في Supabase

### مشكلة: "has_paid not updating"
**الحل**:
1. تحقق من `SUPABASE_SERVICE_ROLE_KEY` في Vercel
2. تحقق من `SPACEREMIT_SECRET_KEY`
3. راجع Logs في Vercel Functions

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع [Vercel Logs](https://vercel.com/dashboard)
2. راجع [Supabase Logs](https://supabase.com/dashboard)
3. تحقق من Network Tab في المتصفح

---

## 🔐 الأمان

- ✅ لا تشارك `SERVICE_ROLE_KEY` أو `SECRET_KEY` أبداً
- ✅ استخدم Environment Variables في Vercel
- ✅ فعّل RLS (Row Level Security) في Supabase
- ✅ تحقق من Webhook Signatures

---

## 📝 ملاحظات مهمة

1. **المفاتيح المفقودة**: تحتاج إلى:
   - `SUPABASE_SERVICE_ROLE_KEY` من Supabase Dashboard
   - `SPACEREMIT_SECRET_KEY` من SpaceRemit Dashboard

2. **النشر الأول**: قد يستغرق 2-3 دقائق

3. **CDN Cache**: قد يستغرق بعض الوقت لتحديث التغييرات

---

تم إنشاء هذا الدليل تلقائياً بواسطة Kilo Code 🤖
