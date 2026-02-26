# 📧 دليل الإعداد اليدوي لـ Gmail SMTP

## ⚠️ خطوات يدوية مطلوبة في Gmail و Supabase

---

## 🔑 الخطوة 1: إنشاء Gmail App Password

### لماذا؟
Google تمنع كلمات المرور العادية للتطبيقات الخارجية. يجب إنشاء **App Password** خاص.

### الخطوات:

#### 1.1 تفعيل 2-Factor Authentication (إذا لم يكن مفعل)
1. اذهب إلى: https://myaccount.google.com/security
2. سجل الدخول بحساب `foryoutalk@gmail.com`
3. ابحث عن **"2-Step Verification"**
4. اضغط **"Turn on"**
5. اتبع الخطوات لتفعيل التحقق الثنائي

#### 1.2 إنشاء App Password
1. اذهب مباشرة إلى: https://myaccount.google.com/apppasswords
2. أو من Security → 2-Step Verification → App passwords (في الأسفل)
3. في خانة **"App"**:
   - اختر **"Mail"**
   - أو اختر **"Other (Custom name)"** واكتب: `Supabase`
4. في خانة **"Device"**:
   - اختر **"Other (Custom name)"** واكتب: `MrXSteroid Server`
5. اضغط **"Generate"**
6. ستظهر كلمة مرور من **16 حرف** (مثل: `abcd efgh ijkl mnop`)
7. **انسخ كلمة المرور** (بدون مسافات: `abcdefghijklmnop`)
8. اضغط **"Done"**

### 📝 ملاحظات مهمة:
- ✅ كلمة المرور تظهر **مرة واحدة فقط** - انسخها فوراً
- ✅ إذا فقدتها، احذفها وأنشئ واحدة جديدة
- ✅ لا تشاركها مع أحد
- ✅ تختلف عن كلمة مرور حساب Gmail العادية

---

## 🔧 الخطوة 2: إعداد SMTP في Supabase

### الخطوات:

#### 2.1 الدخول إلى لوحة Supabase
1. اذهب إلى: https://app.supabase.com
2. سجل الدخول
3. اختر مشروعك: `alghvtpkpspnqupbvodu`

#### 2.2 الذهاب إلى إعدادات SMTP
1. من القائمة الجانبي: **Authentication**
2. اضغط على **Providers**
3. ابحث عن **SMTP** واضغط عليه
   - أو اذهب مباشرة إلى: `https://app.supabase.com/project/YOUR_PROJECT_ID/auth/providers`

#### 2.3 إدخال بيانات SMTP

املأ الحقول التالية:

```
┌─────────────────────────────────────────────────────────┐
│  SMTP Configuration for Gmail                           │
├─────────────────────────────────────────────────────────┤
│  ✅ Enable SMTP                                         │
│                                                         │
│  Sender email: foryoutalk@gmail.com                     │
│  Sender name:  Mr. X Steroid                            │
│                                                         │
│  Host: smtp.gmail.com                                   │
│  Port:   587                                            │
│                                                         │
│  Username: foryoutalk@gmail.com                         │
│  Password: [App Password من 16 حرف]                     │
│                                                         │
│  ✅ Enable secure connection (TLS/STARTTLS)             │
└─────────────────────────────────────────────────────────┘
```

#### 2.4 حفظ الإعدادات
1. اضغط **"Save"** في الأسفل
2. انتظر حتى تظهر رسالة **"SMTP settings saved successfully"**
3. قد يطلب منك تأكيد الهوية

---

## 📧 الخطوة 3: التحقق من إعدادات Email Templates

### الخطوات:

#### 3.1 الذهاب إلى Email Templates
1. في Supabase Dashboard
2. Authentication → Email Templates
3. أو: https://app.supabase.com/project/YOUR_PROJECT_ID/auth/templates

#### 3.2 تأكيد قالب Email Confirmation
1. اختر **"Confirm signup"** من القائمة
2. تأكد من وجود الكود التالي:

```html
<h2>Welcome to Mr. X Steroid!</h2>

<p>Thank you for signing up. Please confirm your email address by clicking the button below:</p>

<a href="{{ .ConfirmationURL }}" style="
    display: inline-block;
    padding: 12px 24px;
    background-color: #D4AF37;
    color: #000;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
    margin: 20px 0;
">
    Confirm Email
</a>

<p>Or copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

<p style="font-size: 12px; color: #999;">
    If you didn't create an account, you can safely ignore this email.
</p>
```

3. اضغط **"Save"**

---

## ✅ الخطوة 4: التحقق من الإعدادات

### 4.1 اختبار SMTP

#### طريقة 1: من Supabase Dashboard
1. Authentication → Users
2. اضغط **"Add user"** → **"Create new user"**
3. املأ البيانات:
   - Email: بريد اختبار (مثل: `test123@gmail.com`)
   - Password: `TestPass123!`
4. اضغط **"Create user"**
5. تحقق من وصول إيميل التفعيل

#### طريقة 2: من الموقع
1. اذهب إلى: https://mrxsteroid.vercel.app/signup
2. أنشئ حساب جديد
3. تحقق من صندوق الوارد

### 4.2 التحقق من Logs

1. في Supabase Dashboard
2. اذهب إلى: **Logs**
3. اختر **Auth** من الفلتر
4. ابحث عن:
   - `signup`
   - `email sent`
   - `confirmation`

---

## 🐛 استكشاف الأخطاء

### المشكلة 1: "Invalid App Password"
**الحل:**
- تأكد من نسخ كلمة المرور بدون مسافات
- تأكد من استخدام App Password وليس كلمة المرور العادية
- احذف Password القديمة وأنشئ واحدة جديدة

### المشكلة 2: "SMTP connection failed"
**الحل:**
```
Host: smtp.gmail.com
Port: 587
✅ TLS/STARTTLS: Enabled
```

### المشكلة 3: "Less secure apps" message
**الحل:**
- Google لم تعد تدعم هذه الميزة
- يجب استخدام **App Password** فقط
- تأكد من تفعيل 2-Factor Authentication

### المشكلة 4: الإيميل لا يصل
**الحل:**
1. تحقق من مجلد Spam
2. انتظر 5-10 دقائق
3. تحقق من Supabase Logs
4. تأكد من صحة Sender email

### المشكلة 5: Rate limit exceeded
**الحل:**
- Gmail المجاني يرسل 500 إيميل/يوم فقط
- للزيادة: استخدم Gmail Workspace (مدفوع)
- أو استخدم خدمة مثل SendGrid أو Mailgun

---

## 📊 بدائل Gmail SMTP

### إذا واجهت مشاكل مع Gmail، استخدم:

#### 1. **SendGrid** (موصى به)
- مجاني: 100 إيميل/يوم
- موثوق أكثر
- تتبع أفضل

**الإعدادات:**
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [SendGrid API Key]
```

#### 2. **Mailgun**
- مجاني: 5000 إيميل/شهر (أول 3 شهور)
- احترافي
- تحليلات متقدمة

**الإعدادات:**
```
Host: smtp.mailgun.org
Port: 587
Username: postmaster@YOUR_DOMAIN
Password: [Mailgun Password]
```

#### 3. **Resend**
- مجاني: 3000 إيميل/شهر
- سهل الاستخدام
- حديث

**الإعدادات:**
```
Host: smtp.resend.com
Port: 587
Username: resend
Password: [Resend API Key]
```

---

## 🎯 قائمة التحقق النهائية

### قبل الاختبار:
- [ ] تم تفعيل 2-Factor Authentication في Gmail
- [ ] تم إنشاء App Password (16 حرف)
- [ ] تم إدخال البيانات في Supabase SMTP
- [ ] تم حفظ الإعدادات
- [ ] تم التحقق من Email Template
- [ ] Sender email = `foryoutalk@gmail.com`

### الاختبار:
- [ ] أنشئ حساب اختبار في الموقع
- [ ] تحقق من وصول الإيميل
- [ ] اضغط على رابط التفعيل
- [ ] تحقق من تفعيل الحساب
- [ ] حاول تسجيل الدخول

---

## 📞 للدعم

### روابط مفيدة:
- Supabase Email Docs: https://supabase.com/docs/guides/auth/auth-smtp
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- SendGrid Setup: https://docs.sendgrid.com/for-developers/sending-email/smtp

### Supabase Dashboard:
- Project: https://app.supabase.com/project/alghvtpkpspnqupbvodu
- Auth Settings: https://app.supabase.com/project/alghvtpkpspnqupbvodu/auth/providers
- Email Templates: https://app.supabase.com/project/alghvtpkpspnqupbvodu/auth/templates
- Logs: https://app.supabase.com/project/alghvtpkpspnqupbvodu/logs

---

## ⚡ الإعداد السريع (ملخص)

```
1. Gmail → https://myaccount.google.com/apppasswords
   └─ إنشاء App Password (16 حرف)

2. Supabase → Authentication → Providers → SMTP
   └─ Sender email: foryoutalk@gmail.com
   └─ Host: smtp.gmail.com
   └─ Port: 587
   └─ Username: foryoutalk@gmail.com
   └─ Password: [App Password]
   └─ Save

3. Supabase → Authentication → Email Templates
   └─ Confirm signup template
   └─ Save

4. اختبار:
   └─ أنشئ حساب جديد
   └─ تحقق من الإيميل
   └─ اضغط رابط التفعيل
   └─ ✅
```

---

**آخر تحديث:** 26 فبراير 2026  
**الحالة:** ⚠️ **يحتاج إعداد يدوي**
