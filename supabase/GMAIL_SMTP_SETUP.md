# دليل إعداد بريد Supabase المخصص (Gmail SMTP)

## نظرة عامة
يستخدم هذا الدليل حساب Gmail الخاص بك `foryoutalk@gmail.com` كخادم SMTP مخصص
لإرسال رسائل التحقق من البريد الإلكتروني عبر Supabase Auth.

---

## المتطلبات

| البند | التفاصيل |
|-------|----------|
| البريد المرسل | foryoutalk@gmail.com |
| خادم SMTP | smtp.gmail.com |
| المنفذ (Port) | 587 (TLS / STARTTLS) |
| المصادقة | كلمة مرور التطبيق (App Password) |
| التشفير | TLS/STARTTLS |

---

## الخطوة 1 - تفعيل المصادقة الثنائية (2FA) على Gmail

1. افتح https://myaccount.google.com/security
2. تأكد من تفعيل التحقق بخطوتين (2-Step Verification)
3. إذا لم يكن مفعلاً، فعّله أولاً

---

## الخطوة 2 - إنشاء كلمة مرور تطبيق (App Password)

1. افتح https://myaccount.google.com/apppasswords
2. في حقل اسم التطبيق، أدخل: Supabase MrXSteroid
3. اضغط إنشاء (Create)
4. انسخ كلمة المرور المكوّنة من 16 حرفاً - لن تُعرض مرة أخرى

---

## الخطوة 3 - إعداد SMTP في لوحة Supabase

اذهب إلى: Authentication > Settings > SMTP Settings

`
Enable Custom SMTP:  ON
SMTP Host:           smtp.gmail.com
SMTP Port:           587
SMTP User:           foryoutalk@gmail.com
SMTP Password:       [كلمة مرور التطبيق - 16 حرف]
Sender Name:         Mr. X Steroid
Sender Email:        foryoutalk@gmail.com
`

---

## الخطوة 4 - إعداد Redirect URLs

في Authentication Settings > Redirect URLs أضف:

`
https://www.mrxsteroid.com/auth/callback
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback
`

---

## الخطوة 5 - تشغيل Migration SQL

شغّل الملف التالي في Supabase SQL Editor:
supabase/FINAL_AUTH_SETUP.sql

يتضمن:
- إضافة حقل phone_number TEXT UNIQUE
- فهرس فريد للهاتف
- دالة handle_new_user() المحدّثة
- دالة get_email_by_phone() لدعم الدخول بالهاتف
- إعداد RLS وصلاحيات RBAC

---

## تحذير أمني

لا تضع كلمة مرور التطبيق في أي ملف مصدري.
احفظها فقط في لوحة Supabase Dashboard أو متغيرات البيئة المشفرة.
