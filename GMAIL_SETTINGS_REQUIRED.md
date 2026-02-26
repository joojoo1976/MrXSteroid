# ⚙️ إعدادات Gmail المطلوبة - دليل شامل

## 📧 هل تحتاج تهيئة داخل Gmail؟

### الإجابة المختصرة: **نعم، خطوتين فقط**

---

## 🔐 الخطوة 1: تفعيل 2-Step Verification (إذا لم يكن مفعل)

### 📍 هل هذا مطلوب؟
- ✅ **نعم** - إذا لم يكن مفعل من قبل
- ⏭️ **تخطى** - إذا كان مفعل بالفعل

### 📝 كيفية التحقق:
```
1. اذهب إلى: https://myaccount.google.com/security
2. ابحث عن "2-Step Verification"
3. إذا كان "On" → ✅ مفعل (تخطى للخطوة 2)
4. إذا كان "Off" → ❌ غير مفعل (أكمل الخطوات)
```

### 🔧 كيفية التفعيل:
```
1. من Security → 2-Step Verification
2. اضغط "Get started"
3. أدخل رقم هاتفك
4. اختر SMS أو مكالمة صوتية
5. أدخل الرمز الذي يصلك
6. اضغط "Turn on"
7. ✅ انتهى
```

### ⏱️ الوقت: 3-5 دقائق

---

## 🔑 الخطوة 2: إنشاء App Password

### 📍 هذه الخطوة **مطلوبة دائماً**

### الرابط المباشر:
```
https://myaccount.google.com/apppasswords
```

### 📝 الخطوات الكاملة:

#### 1. افتح الرابط
```
- اذهب إلى: https://myaccount.google.com/apppasswords
- سجل الدخول بحساب: foryoutalk@gmail.com
```

#### 2. اختر التطبيق
```
من قائمة "App":
  ↓ انقر على القائمة المنسدلة
  ↓ اختر "Mail"
  ↓ أو اختر "Other (Custom name)"
  ↓ اكتب: Supabase
```

#### 3. اختر الجهاز
```
من قائمة "Device":
  ↓ انقر على القائمة المنسدلة
  ↓ اختر "Other (Custom name)"
  ↓ اكتب: MrXSteroid Server
```

#### 4. إنشاء كلمة المرور
```
اضغط زر "Generate"
```

#### 5. انسخ كلمة المرور
```
ستظهر نافذة بها:
┌─────────────────────────────────────┐
│  App password                       │
│                                     │
│  abcd efgh ijkl mnop                │
│                                     │
│  [Copy]  [Done]                     │
└─────────────────────────────────────┘

✓ انقر على أيقونة النسخ
✓ أو حدد النص وانسخه يدوياً
✓ احفظها في مكان آمن
```

#### 6. استخدام كلمة المرور
```
في Supabase SMTP Settings:
Password: abcdefghijklmnop
(بدون مسافات)
```

### ⏱️ الوقت: 2-3 دقائق

---

## ⚠️ ملاحظات مهمة جداً

### 1. كلمة المرور تظهر مرة واحدة فقط
```
❌ إذا أغلقت النافذة دون النسخ
✓ يجب إنشاء كلمة مرور جديدة
✓ لا يمكن استرجاع القديمة
```

### 2. تنسيق كلمة المرور
```
✓ مع مسافات: abcd efgh ijkl mnop
✓ بدون مسافات: abcdefghijklmnop
✓ استخدم بدون مسافات في Supabase
```

### 3. لا تخلط بينهما
```
❌ كلمة مرور Gmail العادية
✓ App Password (16 حرف)

كلمة مرور Gmail: MyGmailPass123
App Password: abcdefghijklmnop
```

### 4. إذا لم تجد خيار App Passwords
```
السبب: 2-Step Verification غير مفعل
الحل: فعل 2-Step Verification أولاً
```

---

## 🔍 كيفية التحقق من الإعدادات الحالية

### 1. التحقق من 2-Step Verification
```
1. https://myaccount.google.com/security
2. ابحث عن "2-Step Verification"
3. إذا كان "On" → ✅ جيد
4. إذا كان "Off" → ❌ فعلّه
```

### 2. التحقق من App Passwords الموجودة
```
1. https://myaccount.google.com/apppasswords
2. انظر إلى الأسفل
3. سترى قائمة بـ App Passwords المنشأة
4. إذا وجدت "Supabase" أو "Mail" → ✅ موجود
5. إذا لم تجد → ❌ أنشئ واحد جديد
```

---

## 🎯 السيناريوهات المحتملة

### السيناريو 1: كل شيء جاهز
```
✓ 2-Step Verification: On
✓ App Passwords: موجود

الإجراء:
1. استخدم App Password الموجود
2. أو أنشئ واحد جديد لـ Supabase
3. ✅ انتهى
```

### السيناريو 2: 2-Step Verification مفعل فقط
```
✓ 2-Step Verification: On
❌ App Passwords: غير موجود

الإجراء:
1. أنشئ App Password جديد
2. اتبع الخطوات أعلاه
3. ✅ انتهى
```

### السيناريو 3: لا شيء مفعل
```
❌ 2-Step Verification: Off
❌ App Passwords: غير موجود

الإجراء:
1. فعل 2-Step Verification أولاً (5 دقائق)
2. أنشئ App Password (3 دقائق)
3. ✅ انتهى
```

---

## 📋 قائمة التحقق من Gmail

### قبل البدء:
- [ ] سجلت الدخول بحساب foryoutalk@gmail.com
- [ ] فتحت https://myaccount.google.com/security

### التحقق من 2-Step Verification:
- [ ] بحثت عن "2-Step Verification"
- [ ] إذا "Off" → فعلته
- [ ] إذا "On" → ✅ جاهز

### إنشاء App Password:
- [ ] فتحت https://myaccount.google.com/apppasswords
- [ ] اخترت App: Mail أو Other (Supabase)
- [ ] اخترت Device: Other (MrXSteroid Server)
- [ ] ضغطت Generate
- [ ] نسخت كلمة المرور (16 حرف)
- [ ] حفظت كلمة المرور في مكان آمن

### الاستخدام في Supabase:
- [ ] استخدمت كلمة المرور بدون مسافات
- [ ] أدخلتها في Supabase SMTP Settings
- [ ] حفظت الإعدادات
- [ ] ✅ انتهى

---

## 🐛 المشاكل الشائعة

### المشكلة 1: "This setting is not available"
```
السبب: الحساب مؤسسي أو تعليمي
الحل: استخدم حساب Gmail شخصي
```

### المشكلة 2: "App passwords" غير موجود
```
السبب: 2-Step Verification غير مفعل
الحل: فعل 2-Step Verification أولاً
```

### المشكلة 3: كلمة المرور لا تعمل
```
الأسباب المحتملة:
1. استخدمت كلمة مرور Gmail العادية ❌
   الحل: استخدم App Password ✓

2. نسختها مع مسافات ❌
   الحل: استخدم بدون مسافات ✓

3. منتهية الصلاحية ❌
   الحل: أنشئ واحدة جديدة ✓
```

### المشكلة 4: "Invalid App Password"
```
الحل:
1. احذف كلمة المرور القديمة من Gmail
2. أنشئ كلمة مرور جديدة
3. استخدمها في Supabase
```

---

## 📞 روابط مباشرة

### Gmail Settings:
- **Security:** https://myaccount.google.com/security
- **2-Step Verification:** https://myaccount.google.com/2step
- **App Passwords:** https://myaccount.google.com/apppasswords

### Supabase Settings:
- **SMTP:** https://app.supabase.com/project/alghvtpkpspnqupbvodu/auth/providers

---

## ⏱️ الوقت الإجمالي

```
┌────────────────────────────────────┐
│ 2-Step Verification (إذا لزم) │ 5 دقائق │
│ App Password                   │ 3 دقائق │
├────────────────────────────────────┤
│ المجموع (إذا لزم)              │ 8 دقائق │
│ المجموع (بدون 2FA)             │ 3 دقائق │
└────────────────────────────────────┘
```

---

## ✅ الخلاصة

### ما تحتاجه في Gmail:
```
1. ✅ 2-Step Verification (مرة واحدة فقط)
2. ✅ App Password (لكل تطبيق جديد)
```

### ما لا تحتاجه:
```
❌ تغيير إعدادات SMTP في Gmail
❌ تفعيل IMAP (مفعل تلقائياً)
❌ تغيير إعدادات الأمان الأخرى
❌ التحقق من الهاتف كل مرة
```

### بعد الانتهاء:
```
✓ كلمة المرور (16 حرف) جاهزة
✓ تستخدمها في Supabase SMTP Settings
✓ لا تحتاج العودة لـ Gmail مرة أخرى
✓ إلا إذا أردت إنشاء App Password جديد
```

---

**تاريخ التحديث:** 26 فبراير 2026  
**الحالة:** ⚠️ **يحتاج خطوتين فقط في Gmail**  
**الوقت:** 3-8 دقائق حسب الحالة
