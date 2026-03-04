# 🔧 إصلاح واختبار نظام الدفع وتأكيد البريد الإلكتروني
# Fix and Test Payment System & Email Confirmation

## 📋 المشاكل المكتشفة | Issues Found

### 1. ❌ مشكلة تأكيد البريد الإلكتروني
**المشكلة:** خطأ في الاتصال بـ Supabase Auth (503 Service Unavailable)

**الحل المطلوب:**

#### الخطوة 1: إعداد SMTP في Supabase
1. اذهب إلى: https://app.supabase.com/project/alghvtpkpspnqupbvodu/auth/providers
2. انقر على **Email** provider
3. فعل خيار **"Confirm email"**
4. اضغط على **SMTP Settings** في الأعلى
5. أدخل إعدادات Gmail:

```
✓ Enable SMTP: ☑ (مفعل)
Host: smtp.gmail.com
Port: 587
Sender email: foryoutalk@gmail.com
Sender name: Mr. X Steroid
Username: foryoutalk@gmail.com
Password: [كلمة مرور تطبيق Gmail]
```

#### الخطوة 2: الحصول على كلمة مرور تطبيق Gmail
1. اذهب إلى حساب Google: https://myaccount.google.com/security
2. فعل **التحقق بخطوتين** (2-Step Verification)
3. اذهب إلى **كلمات مرور التطبيقات**: https://myaccount.google.com/apppasswords
4. اختر **Mail** و **Other (Custom name)**
5. سمّه: "Supabase SMTP"
6. انسخ كلمة المرور المكونة من 16 حرف
7. الصقها في خانة Password في Supabase SMTP Settings

#### الخطوة 3: اختبار التأكيد
```bash
node test-both-flows.cjs
```

---

### 2. ❌ مشكلة جدول الدفع (Payments Table)
**المشكلة:** 
- عمود `spaceremit_code` غير موجود
- سياسات RLS تمنع إنشاء مدفوعات

**الحل المطلوب:**

#### الخطوة 1: تطبيق إصلاح SQL
1. افتح محرر SQL: https://app.supabase.com/project/alghvtpkpspnqupbvodu/sql
2. انسخ المحتوى من ملف: `fix-payments-table.sql`
3. اضغط على **Run** لتنفيذ الإصلاح

#### الخطوة 2: التحقق من نجاح الإصلاح
```bash
node test-both-flows.cjs
```

يجب أن ترى:
```
✅ Payments table accessible
✅ Create payments: Working
```

---

## 🧪 اختبار النظام بالكامل

### الخطوة 1: تشغيل اختبار شامل
```bash
node test-both-flows.cjs
```

### الخطوة 2: اختبار تسجيل الحساب الجديد
1. افتح التطبيق: `npm run dev`
2. اذهب إلى صفحة التسجيل
3. أدخل بريدًا جديدًا (غير مستخدم من قبل)
4. اضغط تسجيل
5. **تحقق من البريد الإلكتروني** (من foryoutalk@gmail.com)
6. اضغط على رابط التأكيد
7. يجب إعادة توجيهك إلى `/auth/callback`

### الخطوة 3: اختبار عملية الشراء
1. سجل الدخول بحساب مؤكد
2. اختر منتجًا من المتجر
3. اضغط "Buy Now" أو "Checkout"
4. املأ معلومات العميل
5. اختر طريقة الدفع (SpaceRemit)
6. اضغط "Complete Order"
7. **سيتم إعادة توجيهك إلى SpaceRemit**
8. أكمل الدفع (استخدم بطاقة اختبار إذا متوفرة)
9. بعد الدفع، ستعود إلى `/api/payments/callback`
10. تحقق من:
    - تحديث حالة الدفع إلى "completed"
    - إضافة `spaceremit_code` في قاعدة البيانات
    - ترقية حساب المستخدم (`has_paid: true`)

---

## 🔍 التحقق من نجاح الإصلاح

### ✅ تأكيد البريد الإلكتروني يعمل إذا:
- [ ] تم إرسال بريد تأكيد عند التسجيل
- [ ] البريد مرسل من: `foryoutalk@gmail.com`
- [ ] رابط التأكيد يعمل ويعيد توجيهك إلى `/auth/callback`
- [ ] بعد التأكيد، يمكن تسجيل الدخول بنجاح

### ✅ الدفع يعمل إذا:
- [ ] يمكن إنشاء سجل دفع في قاعدة البيانات
- [ ] إعادة التوجيه إلى SpaceRemit تعمل
- [ ] بعد الدفع، يتم تحديث حالة الدفع إلى "completed"
- [ ] يتم تخزين `spaceremit_code` في السجل
- [ ] حساب المستخدم يتم ترقيته (`has_paid: true`)

---

## 📊 ملخص الاختبار

### البريد الإلكتروني
| الحالة | الحالة | التفاصيل |
|--------|--------|----------|
| SMTP Setup | ⚠️ يحتاج إعداد | يدوي في لوحة Supabase |
| Email Sending | ❌ فشل | خطأ 503 - يحتاج SMTP |
| Email Confirmation | ⚠️ يعمل بعد SMTP | يحتاج تفعيل Confirm email |

### الدفع
| الحالة | الحالة | التفاصيل |
|--------|--------|----------|
| SpaceRemit Integration | ✅ موجود | الكود موجود |
| Payments Table | ⚠️ يحتاج إصلاح | RLS + أعمدة ناقصة |
| Payment Creation | ❌ فشل | RLS يمنع الإنشاء |
| Payment Callback | ✅ جاهز | API موجود |

---

## 🚀 خطوات الإصلاح النهائية

### 1. إصلاح البريد الإلكتروني (5 دقائق)
```
1. لوحة Supabase → Authentication → Providers → Email
2. فعل "Confirm email"
3. أضف SMTP Settings (Gmail)
4. اختبر بإرسال بريد تأكيد
```

### 2. إصلاح جدول الدفع (دقيقتين)
```
1. افتح: https://app.supabase.com/project/alghvtpkpspnqupbvodu/sql
2. الصق محتوى fix-payments-table.sql
3. اضغط Run
```

### 3. اختبار الكل (3 دقائق)
```bash
node test-both-flows.cjs
```

---

## 📞 للحصول على مساعدة

إذا واجهت مشاكل:

1. **البريد الإلكتروني لا يُرسل:**
   - تحقق من Gmail App Password
   - تأكد من تفعيل 2FA في حساب Google
   - تحقق من Spam folder

2. **الدفع لا يعمل:**
   - تحقق من SpaceRemit credentials في .env
   - تأكد من إضافة SPACEREMIT_SECRET_KEY في Vercel
   - تحقق من logs في Vercel dashboard

3. **RLS أخطاء:**
   - تأكد من تطبيق إصلاح SQL
   - تحقق من pg_policies في Supabase

---

## ✅ قائمة التحقق النهائية

### البريد الإلكتروني
- [ ] SMTP Settings مُدخلة في Supabase
- [ ] Gmail App Password تم إنشاؤه
- [ ] "Confirm email" مُفعّل
- [ ] بريد التأكيد يُرسل بنجاح
- [ ] رابط التأكيد يعمل

### الدفع
- [ ] جدول payments يحتوي على spaceremit_code
- [ ] RLS policies تسمح بإنشاء مدفوعات
- [ ] SpaceRemit Public Key في .env
- [ ] SpaceRemit Secret Key في Vercel
- [ ] Callback URL مسجل في SpaceRemit
- [ ] الدفع التجريبي ينجح

---

**آخر تحديث:** 2026-03-04  
**الحالة:** ⚠️ يحتاج إصلاح يدوي
