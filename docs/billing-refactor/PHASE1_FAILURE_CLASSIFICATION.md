# Phase 1 — تصنيف الاختبارات الـ14 الفاشلة

> خط الأساس: 14 فاشلًا في 5 ملفات (من أصل 38 ملف اختبار دفع، 509 اختبارًا).
> لم يُعدَّل أي اختبار ولم يُعطَّل. هذا تصنيف أسباب، والإصلاح يحدث في المرحلة المالكة للسبب.

| # | الملف | الاختبار | السبب الجذري | الفئة | مرحلة الإصلاح |
|---|---|---|---|---|---|
| 1 | `tests/integration/checkoutCountryRouting.test.ts` | `country=US does NOT resolve to egypt (the original bug)` | المسار GLOBAL أصبح يمرّ عبر Fourthwall (`checkoutSessionService`)، والـ fake DB في الاختبار لا يحتوي `fourthwall_product_map`، فيرجع 500 قبل إنشاء الفاتورة. التوقع قديم (كان GLOBAL/Kashier). | أ | 8 (وبعد تصنيف Fourthwall في 5) |
| 2 | نفس الملف | `country=GB resolves to GLOBAL/USD` | نفس السبب أعلاه. | أ | 8 |
| 3 | نفس الملف | `an explicit country is NOT overridden by the IP geolocation header` | نفس السبب أعلاه. | أ | 8 |
| 4 | نفس الملف | `keeps Global DIGITAL at 0 with no shipping charge` | نفس السبب أعلاه. | أ | 8 |
| 5 | نفس الملف | `allows a Global DIGITAL order (shipping is free and must not be priced)` | نفس السبب أعلاه. | أ | 8 |
| 6 | نفس الملف | `honours a TOP-LEVEL provider on the Kashier path` | نفس السبب أعلاه (طلب GLOBAL). | أ | 8 |
| 7 | نفس الملف | `a TOP-LEVEL provider wins over a conflicting metadata provider` | نفس السبب أعلاه (طلب GLOBAL). | أ | 8 |
| 8 | نفس الملف | `an INVALID top-level provider is rejected rather than silently dropped` | نفس السبب أعلاه؛ يفشل قبل الوصول إلى تحقق الشحن. | أ | 8 |
| 9 | `tests/integration/createInvoiceKashierDelegation.test.ts` | `GLOBAL Kashier uses legacy KASHIER_GLOBAL_* merchant and USD pricing` | نفس السبب: توقع توجيه GLOBAL إلى Kashier/merchant قديم، بينما المسار الحالي يوجّه GLOBAL إلى Fourthwall. | أ | 8 (وبعد 5) |
| 10 | `tests/unit/checkoutSessionService.test.ts` | `Global order → USD pricing, card-only methods, no Egypt shipping` | `createFakeGateway()` لا يحتوي `resolveProductMapping`، بينما فرع GLOBAL يستدعيها. الـ fake قديم مقابل تكامل Fourthwall. | أ | 8 |
| 11 | `tests/unit/instapayPreservationLock.test.ts` | `rejected receipt settles the ORDER (not the payment method) to cancelled + failed` | اختبار نصّي (static) يبحث عن سطر التحديث المباشر القديم؛ المسار انتقل إلى RPC ومفردات حالة جديدة (`submitted_for_review` / `approved` / `rejected`). السلوك نفسه محفوظ. | أ | 8 |
| 12 | `tests/unit/paymentReceiptsAdmin.test.ts` | `verifies a pending receipt, settles order to processing + payment_status=paid and writes the audit log` | الاختبار يستخدم الحالة القديمة `pending_review` والـ PATCH بالحالة `verified`؛ المسار الحالي يقبل `submitted_for_review` → `approved` ويستخدم RPC للموافقة. | أ | 8 |
| 13 | نفس الملف | `rejects a receipt and settles order to cancelled + payment_status=failed` | نفس السبب: حالة `pending_review`/`verified` القديمة + mock لا يوفّر RPC. | أ | 8 |
| 14 | نفس الملف | `lists receipts and applies the status filter` | mock الـ query chain قديم مقابل شكل route القائمة الحالي؛ يعيد 500. | أ | 8 |

## الخلاصة

| الفئة | العدد |
|---|---|
| أ — توقع/بيانات/ mock قديمة | **14** |
| ب — عيب حقيقي | 0 |
| ج — محجوب بنقص جدول البنود | 0 |

**ملاحظة نطاق:** فشل GLOBAL ليس بالضرورة عيبًا في الـ route الحقيقي؛ السبب المباشر هو بيئة الاختبار. لكنه يكشف خطرًا تشغيليًا منفصلًا يجب تصنيفه في المرحلة 5: بذور `fourthwall_product_map` ما زالت `*_PLACEHOLDER` في migration `20260928200000_fourthwall_global_integration.sql`، ولا توجد متغيرات `FOURTHWALL_*` في `.env`. هذا لا يُصلَح في المرحلة 1.

## قاعدة الإغلاق

- لا `skip`، لا `.todo`، لا `test.only`، لا تعديل توقّع ليمرّر البناء.
- كل بند أعلاه يُعاد كتابته في المرحلة 8 ليختبر السلوك الحالي المعتمد، لا السلوك القديم.
