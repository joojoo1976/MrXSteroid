# 🔐 دليل إعداد SpaceRemit - Mr. X Steroid

## 📋 المشكلة الحالية

### 1. أين مكان إدخال بيانات الفيزا؟
النظام يستخدم **SpaceRemit** كبوابة دفع خارجية (Redirect Flow). عندما يضغط المستخدم على زر "ادفع الآن"، يتم تحويله تلقائياً إلى صفحة SpaceRemit الخارجية لإدخال بيانات البطاقة.

**هذا يعني:**
- ❌ لا يوجد حقل لإدخال الفيزا في الموقع نفسه
- ✅ يتم التحويل إلى صفحة SpaceRemit الآمنة لإدخال البيانات

---

## ⚠️ سبب رسالة "Payment Failed"

المشكلة هي أن **المفتاح السري (Secret Key)** غير مُعد في Vercel!

### المفاتيح المطلوبة:

| المفتاح | القيمة | المكان |
|---------|--------|--------|
| `VITE_SPACEREMIT_PUBLIC_KEY` | `pkO6RUYNRPVWTC7VDPNOFLMAUTJ0GNN42YEALB26SSOQR46EX20A` | Frontend (Vercel) |
| `SPACEREMIT_SECRET_KEY` | `sk2ESRSUHSEXGXOHVQHH2EQGB2IK6RTAB64GUGN0Q53BMPMANBWB` | Backend (Vercel) |

---

## 🚀 خطوات الإصلاح

### الخطوة 1: إضافة المفاتيح في Vercel

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروع `mrxsteroid`
3. اذهب إلى **Settings** → **Environment Variables**
4. أضف المتغيرات التالية:

```
VITE_SPACEREMIT_PUBLIC_KEY=pkO6RUYNRPVWTC7VDPNOFLMAUTJ0GNN42YEALB26SSOQR46EX20A
SPACEREMIT_SECRET_KEY=sk2ESRSUHSEXGXOHVQHH2EQGB2IK6RTAB64GUGN0Q53BMPMANBWB
SPACEREMIT_WEBHOOK_SECRET=sk2ESRSUHSEXGXOHVQHH2EQGB2IK6RTAB64GUGN0Q53BMPMANBWB
```

### الخطوة 2: إعداد Callback URL في SpaceRemit

1. اذهب إلى [SpaceRemit Dashboard](https://spaceremit.com/dashboard)
2. اذهب إلى **Settings** → **Webhooks** أو **Callback URLs**
3. أضف الـ Callback URL:
   ```
   https://mrxsteroid.vercel.app/api/payments/callback
   ```

### الخطوة 3: إعادة النشر (Redeploy)

بعد إضافة المتغيرات، يجب إعادة نشر المشروع:
1. في Vercel Dashboard
2. اذهب إلى **Deployments**
3. اختر آخر deployment
4. اضغط **Redeploy**

---

## 📊 تدفق الدفع

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   المستخدم      │     │   MrXSteroid    │     │   SpaceRemit    │
│   يضغط "ادفع"   │────▶│   يُنشئ طلب    │────▶│   صفحة الدفع   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   تفعيل الحساب  │◀────│   تحديث DB     │◀────│   Callback URL  │
│   has_paid=true │     │   payment=done │     │   /api/callback │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 🔍 التحقق من الإعداد

### اختبار محلي:

```bash
# 1. إنشاء ملف .env.local
VITE_SPACEREMIT_PUBLIC_KEY=pkO6RUYNRPVWTC7VDPNOFLMAUTJ0GNN42YEALB26SSOQR46EX20A

# 2. تشغيل المشروع
npm run dev

# 3. اختبار الدفع
# اذهب إلى /checkout واختبر العملية
```

### التحقق من الـ Callback:

```bash
# اختبار الـ endpoint
curl https://mrxsteroid.vercel.app/api/payments/callback
```

---

## 📝 ملاحظات مهمة

1. **المفتاح السري (Secret Key)** يجب أن يبقى سرياً ولا يُعرض في الكود
2. **الـ Public Key** يمكن استخدامه في Frontend
3. تأكد من أن الـ Callback URL مُطابق تماماً في SpaceRemit Dashboard
4. بعد أي تغيير في Environment Variables، يجب إعادة النشر

---

## 🆘 الدعم

إذا استمرت المشكلة:
1. تحقق من Logs في Vercel Dashboard
2. تحقق من SpaceRemit Dashboard للمعاملات
3. تأكد من صحة المفاتيح

---

**تاريخ التحديث:** 2026-02-24
