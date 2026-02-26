# ⚠️ إجراءات يدوية مطلوبة - Quick Reference

## 🎯 المطلوب تنفيذه يدوياً (خارج VS Code)

---

## 1️⃣ Gmail App Password (5 دقائق)

### 📍 أين؟
- **URL:** https://myaccount.google.com/apppasswords
- **الحساب:** foryoutalk@gmail.com

### 📝 الخطوات:
```
1. سجل الدخول بحساب Gmail
2. اذهب إلى: Security → 2-Step Verification
3. من الأسفل: App passwords
4. اختر App: Mail
5. اختر Device: Other (Supabase)
6. اضغط Generate
7. انسخ كلمة المرور (16 حرف بدون مسافات)
8. ✅ انتهى
```

### 🔑 النتيجة:
```
App Password: abcd efgh ijkl mnop
(استخدمها بدون مسافات: abcdefghijklmnop)
```

---

## 2️⃣ Supabase SMTP Settings (3 دقائق)

### 📍 أين؟
- **URL:** https://app.supabase.com/project/alghvtpkpspnqupbvodu/auth/providers

### 📝 الخطوات:
```
1. افتح لوحة Supabase
2. Authentication → Providers → SMTP
3. املأ الحقول:
   ✓ Sender email: foryoutalk@gmail.com
   ✓ Sender name: Mr. X Steroid
   ✓ Host: smtp.gmail.com
   ✓ Port: 587
   ✓ Username: foryoutalk@gmail.com
   ✓ Password: [App Password من 16 حرف]
   ✓ Enable secure connection: ✅
4. اضغط Save
5. ✅ انتهى
```

### 📋 البيانات:
```
┌────────────────────────────────────────┐
│ SMTP Configuration                     │
├────────────────────────────────────────┤
│ Sender: foryoutalk@gmail.com           │
│ Host: smtp.gmail.com                   │
│ Port: 587                              │
│ User: foryoutalk@gmail.com             │
│ Pass: [App Password]                   │
│ TLS: ✅ Enabled                        │
└────────────────────────────────────────┘
```

---

## 3️⃣ Email Template (2 دقيقة)

### 📍 أين؟
- **URL:** https://app.supabase.com/project/alghvtpkpspnqupbvodu/auth/templates

### 📝 الخطوات:
```
1. Authentication → Email Templates
2. اختر "Confirm signup"
3. تأكد من وجود:
   - عنوان: "Welcome to Mr. X Steroid!"
   - زر: "Confirm Email"
   - رابط: {{ .ConfirmationURL }}
4. اضغط Save
5. ✅ انتهى
```

---

## 4️⃣ اختبار الإعدادات (3 دقائق)

### 📝 الخطوات:
```
1. افتح: https://mrxsteroid.vercel.app/signup
2. أنشئ حساب جديد:
   - Email: test123@gmail.com
   - Password: TestPass123!
   - Name: Test User
3. اضغط "Create Account"
4. افتح Gmail
5. ابحث عن إيميل من "Mr. X Steroid"
6. اضغط "Confirm Email"
7. يجب أن يتم التفعيل ✅
```

### 🔍 إذا لم يصل الإيميل:
```
1. تحقق من Spam
2. انتظر 5 دقائق
3. راجع Supabase Logs
4. تحقق من صحة App Password
```

---

## 📊 ملخص سريع

| الخطوة | الوقت | الحالة |
|--------|-------|--------|
| Gmail App Password | 5 دقائق | ⚠️ يدوي |
| Supabase SMTP | 3 دقائق | ⚠️ يدوي |
| Email Template | 2 دقائق | ⚠️ يدوي |
| الاختبار | 3 دقائق | ⚠️ يدوي |
| **المجموع** | **13 دقيقة** | |

---

## 🎯 بعد الانتهاء

### ✅ علامات النجاح:
- [ ] الإيميل يصل خلال 1-2 دقيقة
- [ ] رابط التفعيل يعمل
- [ ] يتم توجيه المستخدم للـ Dashboard
- [ ] Session يُحفظ في localStorage
- [ ] البيانات تمتلئ تلقائياً في Checkout

### ❌ إذا فشل:
1. راجع `GMAIL_SMTP_SETUP_GUIDE.md`
2. تحقق من Supabase Logs
3. تأكد من صحة App Password

---

## 📞 روابط سريعة

### Gmail:
- App Passwords: https://myaccount.google.com/apppasswords
- Security: https://myaccount.google.com/security

### Supabase:
- Dashboard: https://app.supabase.com/project/alghvtpkpspnqupbvodu
- SMTP Settings: https://app.supabase.com/project/alghvtpkpspnqupbvodu/auth/providers
- Email Templates: https://app.supabase.com/project/alghvtpkpspnqupbvodu/auth/templates
- Logs: https://app.supabase.com/project/alghvtpkpspnqupbvodu/logs

### الموقع:
- Signup: https://mrxsteroid.vercel.app/signup
- Login: https://mrxsteroid.vercel.app/login

---

## 🚀 بعد الإعداد

### الكود جاهز ويعمل:
```typescript
// ✅ Signup - يرسل إيميل تلقائياً
await supabase.auth.signUp({
    email, password,
    options: {
        data: { full_name, user_name },
        emailRedirectTo: `${window.location.origin}/auth/callback`
    }
});

// ✅ Callback - يستقبل التفعيل
if (type === 'signup') {
    const { data: { session } } = await supabase.auth.getSession();
    // Session يُحفظ تلقائياً
}

// ✅ Checkout - يمتلئ تلقائياً
useEffect(() => {
    if (isAuthenticated && user) {
        setValue('email', user.email);
        setValue('fullName', user.user_metadata.full_name);
    }
}, [isAuthenticated, user]);
```

---

**⏰ الوقت المتوقع:** 10-15 دقيقة  
**📍 المكان:** Gmail + Supabase Dashboard (خارج VS Code)  
**✅ النتيجة:** نظام Email كامل يعمل

---

**آخر تحديث:** 26 فبراير 2026  
**الحالة:** ⚠️ **يحتاج إعداد يدوي فقط**
