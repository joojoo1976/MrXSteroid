# تقرير خط الأساس الأمني (Security Baseline Report)
**تاريخ الفحص:** 19 سبتمبر 2026  
**المرحلة:** المرحلة صفر — التحقق قبل التعديل (Phase 0: Pre-Remediation Verification)

---

## 1. الأوامر التي تم تشغيلها والنتائج الفعلية

| الأمر (`package.json`) | كود الخروج (Exit Code) | النتيجة والتفاصيل |
| :--- | :---: | :--- |
| `npm run lint` | 0 | 0 أخطاء (Errors)، 3 تحذيرات استايل Fast-Refresh قديمة في ملفات التخطيط (`layout.tsx`). |
| `npm run test:unit` | 0 | **68 ملف اختبار ناجح بالكامل من أصل 68**، **930 اختباراً فردياً ناجحاً بصفر فشل**. |
| `npm run build` | 0 | تم بناء 71 مساراً بنجاح في 17.2 ثانية بصفر أخطاء TypeScript وبصفر أخطاء تحزيم. |

---

## 2. النتائج المؤكدة مع الأدلة من الكود (Verified Findings)

### 2.1. طريقة المصادقة الفعلية وقراءة الجلسات
- **الخادم (Backend API Routes):** تعتمد المسارات على التحقق من `Authorization: Bearer <token>` الصادر عن Supabase GoTrue Auth عبر:
  ```typescript
  const { data: { user } } = await supabase.auth.getUser(token);
  ```
- **الواجهة الأمامية (Frontend Context):** تعتمد على `context/AuthContext.tsx` عبر `supabase.auth.getSession()` و `onAuthStateChange`.
- **المشكلة المؤكدة في الواجهة:** في ملف [`features/auth/AdminGuard.tsx`](file:///e:/MrXSteroid-main/features/auth/AdminGuard.tsx#L36-L58):
  - السطر 36 والسطر 55 يفحصان `user?.user_metadata?.role` كبديل عند تأخر السيرفر:
    ```typescript
    const metadataRole = (user as unknown as { user_metadata?: { role?: string } })?.user_metadata?.role;
    setIsAuthorized(profileData?.role === 'admin' || metadataRole === 'admin');
    ```
  - **الدليل والخطورة:** يمكن لأي مستخدم إرسال `{ role: 'admin' }` في بيانات `user_metadata` عند استدعاء `auth.signUp` في العميل، مما قد يخدع مؤقت الطوارئ في الواجهة الأمامية ويوحي بالدخول للوحة التحكم شكلياً.

### 2.2. مسارات الإدارة الحالية (`/api/admin`) والتحقق منها
توجد 8 مسارات تحت [`app/api/admin/seo`](file:///e:/MrXSteroid-main/app/api/admin/seo):
1. `app/api/admin/seo/audit-log/route.ts`
2. `app/api/admin/seo/blocks/route.ts`
3. `app/api/admin/seo/cannibalization/route.ts`
4. `app/api/admin/seo/cannibalization/[id]/route.ts`
5. `app/api/admin/seo/clusters/route.ts`
6. `app/api/admin/seo/clusters/[id]/route.ts`
7. `app/api/admin/seo/keywords/route.ts`
8. `app/api/admin/seo/keywords/[id]/route.ts`
9. `app/api/admin/seo/pins/[id]/route.ts`
10. `app/api/admin/seo/seasonal/route.ts`
11. `app/api/admin/seo/seasonal/[id]/route.ts`
12. `app/api/admin/seo/sources/route.ts`

- **الدليل:** مسارات مثل `blocks/route.ts` و `pins/[id]/route.ts` و `sources/route.ts` و `audit-log/route.ts` تستخدم `getSupabaseAdmin()` مباشرة بدون فحص توكن أو فحص دور المشرف.
- **تجاوز التطوير:** في `keywords/route.ts`:
  ```typescript
  if (process.env.NODE_ENV === 'development') {
      return { authorized: true, user: { id: 'dev-admin' }, supabase };
  }
  ```
  هذا التجاوز يحتاج إلى إزالة أو عزله تحت متغير بيئة صريح ومقفل.

### 2.3. مسارات الفواتير والتنزيلات والمدفوعات
- `app/api/payments/create-invoice/route.ts`:
  - يقبل `userId` في جسم الطلب (`body.userId`) في السطر 79:
    ```typescript
    const effectiveUserId: string | null = (input.userId && input.userId.trim() !== '') ? input.userId : null;
    ```
  - لا يتحقق من مطابقة `userId` لـ `auth.uid()` التابع لـ Bearer Token.
- `app/api/payments/create-session/route.ts`:
  - يمرر `body.userId` إلى `createCheckoutSession`.
- `app/api/download/route.ts`:
  - يتحقق بنجاح من التوكن واشتراك المستخدم (`has_paid === true`).
  - لكنه في السطر 93 يعيد رسالة الخطأ الأصلية `message: msg`، مما يكشف مسارات الخادم المحلية في حالات الخطأ.
- `app/api/checkout/kashier/session/route.ts`:
  - مسار إنشاء جلسات كاشير.
- `app/api/payments/callback/route.ts`:
  - معالجة رجوع الدفع.
- `app/api/payments/webhook/route.ts` و `app/api/webhooks/kashier/route.ts`:
  - التحقق من توقيع HMAC ومعالجة أحداث الويب هوك.

### 2.4. استخدامات `getSupabaseAdmin`
- تستخدم في مسارات SEO والمدفوعات والـ Webhooks للحاجة إلى تجاوز RLS بصلاحية `service_role`.
- **الملاحظة الأمنية:** يجب قصر استخدامها على الخدمات الداخلية وعمليات الخلفية المعتمدة بعد إثبات تفويض المشرف خادمياً.

### 2.5. استخدامات رؤوس `Access-Control-Allow-Origin: *`
تم العثور عليها في استجابات `OPTIONS` في الملفات التالية:
- `app/api/contact/route.ts` (السطر 131)
- `app/api/checkout/kashier/session/route.ts` (السطر 96)
- `app/api/auth/welcome/route.ts` (السطر 13)
- `app/api/geo/route.ts` (السطر 19)
- `app/api/download/route.ts` (السطر 25)
- `app/api/payments/create-invoice/route.ts` (السطر 54)
- `app/api/payments/callback/route.ts` (السطر 247)

### 2.6. وجود `mock-auth-service`
تم رصده في:
- `shared/lib/mock-auth-service.ts`
- `context/AuthContext.tsx` (السطر 7 و 49-59)
- `features/auth/hooks/useLogin.ts` (السطر 11)
- `features/auth/hooks/useSignup.ts` (السطر 12)
- **الملاحظة:** في `AuthContext.tsx`، إذا لم يتم العثور على `VITE_SUPABASE_URL` أو `NEXT_PUBLIC_SUPABASE_URL`، ينتقل التطبيق تلقائياً إلى `mockAuthService.getCurrentUser()` ويخزن الجلسة في `localStorage` باسم `mrx_mock_auth`.

---

## 3. النتائج غير المتحققة (Unverified Items)
- **سجلات المراقبة في بيئة الإنتاج السحابية (Production Sentry / Cloud Logging):** غير مفحوصة خارج المستودع المحلي لعدم توفر وصول لوحة تحكم السحابة.
- **تكوين Vercel Environment Variables في لوحة التحكم:** لم يتم التحقق المباشر من تعيين `ENABLE_INSECURE_DEV_AUTH` على خوادم الاستضافة الخارجية.

---

## 4. الملفات التي تحتاج مراجعة وتعديل في المراحل القادمة
1. `app/api/admin/seo/**` (جميع مسارات الإدارة تتطلب التحقق الخادمي الصارم `requireAdmin`).
2. `server/auth/require-admin.ts` (مساعد خادمي مركزي جديد).
3. `features/auth/AdminGuard.tsx` (إزالة الاعتماد على `user_metadata.role`).
4. `app/api/download/route.ts` (إخفاء رسائل الخطأ وحماية مسار الملفات).
5. `app/api/payments/create-invoice/route.ts` (التحقق من `userId` وتأمينه ضد الـ IDOR).
6. `app/api/contact/route.ts` (إضافة Rate Limiting وإزالة المفاتيح النصية الاحتياطية).
7. `context/AuthContext.tsx` و `shared/lib/mock-auth-service.ts` (منع تفعيل الـ Mock في بيئة الإنتاج).

---

## 5. هل يوجد أي عائق يمنع بدء الإصلاح؟
**لا يوجد أي عائق.**  
- جميع الاختبارات تعمل وتنجح (930/930).
- بناء المشروع (Build) سليم وناجح بدون أخطاء.
- الفاحص (Linter) نظيف بصفر أخطاء.
- النظام جاهز للانتقال إلى **المرحلة الأولى: حماية مسارات الإدارة**.
