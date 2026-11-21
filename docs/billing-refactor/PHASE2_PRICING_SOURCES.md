# Phase 2 — مصدر الحقيقة الوحيد للأسعار

> الحالة: مكتمل من ناحية الكود والاختبارات. لم تُعدَّل أي قيمة تحصيل، ولم تُلمس إعدادات أي بوابة أو مفتاح أو `.env` أو العملية على 3111.

## 1) المصدر الموحد المعتمد

`server/payments/pricing.ts` هو **المصدر الوحيد لأي literal سعري**:

- `DEFAULT_PRICING.tiers` — أسعار المنتجات الأساسية بعملتي EGP/USD.
- `DEFAULT_PRICING.addons` — إضافة التدريب الشخصي.
- `DEFAULT_PRICING.services.consultation` — خدمة الاستشارة ($30، غير متاحة منفصلة في مصر).
- `DEFAULT_PRICING.shipping` — شحن مصر 199 ج.م وباقي المزودين.
- `DISPLAY_ORIGINAL_PRICES` — أسعار «قبل الخصم» (عرض فقط، ليست مبالغ تحصيل).
- `PRICING_VERSION` — لوسم quote/invoice في المراحل 3+.
- دوال القراءة: `getTierPrice`, `getAddonPrice`, `getServicePrice`, `getShippingPrice`, `getOriginalTierPrice`.

**ملاحظة معمارية:** مسارات التحصيل تستمر في استخدام `loadPricing()` + `computeAmount()` (لتشمل overrides الإدارية/env). الواجهات تستخدم دوال `get*Price` المقروءة من `DEFAULT_PRICING`، تمامًا كما كانت تعرض القيم الافتراضية سابقًا. هذا لا يغيّر أي مبلغ تحصيل.

## 2) كل مصادر الأسعار المكتشفة ومصيرها

| # | المصدر | ما كان | المصير |
|---|---|---|---|
| 1 | `server/payments/pricing.ts` | `DEFAULT_PRICING` + حساب المبالغ | **المصدر الموحد**؛ أضيفت الخدمات و`DISPLAY_ORIGINAL_PRICES` ودوال القراءة |
| 2 | `shared/lib/logic.ts` | `EGP_PRICES`, `EGP_ORIGINAL_PRICES`, `COACHING_ADDON_EGP/USD`, أسعار الشحن الدولي | **أصبحت مشتقة** من pricing.ts؛ حُذفت الـ literals |
| 3 | `features/calculator/hooks/usePricing.ts` | `BASE_PRICES`, `BASE_ORIGINAL_PRICES` | **مشتقة** من pricing.ts؛ fallbacks `849/949` أصبحت مفاتيح من الجداول المشتقة |
| 4 | `features/checkout/ProductSelector.tsx` | `USD_PRICES` محلي | **مشتق** من `getTierPrice` |
| 5 | `legacy-pages/CheckoutPage.tsx` | `USD_PRICES` محلي | **مشتق** من `getTierPrice` |
| 6 | `features/billing/config/pricing.config.ts` | `current/original` و`coachingAddon` literals | **current/addon مشتقة**؛ `original` نُقل إلى `DISPLAY_ORIGINAL_PRICES.billing` في pricing.ts (عرض فقط) |
| 7 | `features/billing/hooks/useBillingPlans.ts` | يحسب من pricing.config | لم يُعدّل؛ أصبح مشتقًا تلقائيًا |
| 8 | `features/billing/components/PricingGrid.tsx` | `+ 9,999` مكتوب يدويًا | **مشتق** من `getAddonPrice` |
| 9 | `features/marketing/PricingSection.tsx` | `+ 9,999` مكتوب يدويًا | **مشتق** من `COACHING_ADDON_EGP` |
| 10 | `features/marketing/DirectServicesSection.tsx` | `$349.99` و`$30.00` | **مشتق** من `getKashierServicePaymentLink(...).amount` |
| 11 | `features/checkout/DirectServicesCheckoutSection.tsx` | `$349.99` و`$30.00` | **مشتق** من `getKashierServicePaymentLink(...).amount` |
| 12 | `features/marketing/SmartBookLanding.tsx` | `49.99` و`499` | **مشتق** من `getTierPrice('digital', ...)` |
| 13 | `server/payments/paymentLinkConfig.ts` | `amount: 349.99` و`30.00` | **مشتق** من `getAddonPrice` / `getServicePrice` |
| 14 | `server/payments/merchantResolver.ts` | `egyptAmount/globalAmount` literals | **مشتقة** من pricing.ts (بما فيها `coaching_plus = 10,848`) |
| 15 | `shared/lib/paymobProducts.ts` | `priceEGP` و`priceCents` | **مشتقة**؛ `priceCents = round(priceEGP × 100)` |
| 16 | `shared/lib/locationData.ts` | `EGYPT_FIXED_SHIPPING_EGP = 199` | نُقل الـ literal إلى pricing.ts؛ الملف **يعيد تصديره** فقط |
| 17 | `features/billing/config/pricing.config.ts` | `REGIONAL_CONFIG` (`defaultShipping` 50/15، `taxRate` 0.14/0) | **خارج النطاق**: غير مستخدمة في أي إجمالي معروض أو محصّل؛ ليست سعرًا فعليًا. تحتاج قرارًا قبل تفعيل الضريبة/الشحن الإقليمي |
| 18 | `shared/lib/locationData.ts` | `defaultShippingUsd` لكل دولة (25/30/35) | **خارج النطاق**: حقول تقديرية غير مستخدمة حاليًا، والشحن الدولي للكتب محجوب أصلًا |
| 19 | `i18n/ar.ts` / `i18n/en.ts` | `pricingCoachingRate` نص يحتوي 9,999/349.99 | **خارج النطاق**: نص ترجمة غير مستورد من أي مكوّن (لا يوجد مستهلك). يُعالج مع نصوص الواجهة في مرحلة لاحقة/قرار محتوى |
| 20 | `tests/**` و`docs/**` | أرقام متوقعة/توثيق | **خارج النطاق**: مراجع اختبار وتوثيق، وليست مصادر عرض |
| 21 | `features/billing/config/pricing.config.ts` | `original` (699/999/1149 و49.99/100.80/199) | نُقلت إلى `DISPLAY_ORIGINAL_PRICES.billing`؛ القيم لم تتغير. تبقى **عرضًا فقط** حتى Phase 9 |
| 22 | `shared/lib/logic.ts` | `EGP_ORIGINAL_PRICES` (699/849/949 و11848/11748/11498) | نُقلت إلى `DISPLAY_ORIGINAL_PRICES.storefront`؛ القيم لم تتغير. تبقى **عرضًا فقط** حتى Phase 9 |

## 3) ما تغيّر في القيم المعروضة (ولماذا ليس تغييرًا في السعر الفعلي)

`features/billing/config/pricing.config.ts` كان يعرض USD:
`29.00 / 79.00 / 149.00`، بينما السيرفر يحصّل فعليًا `49.99 / 72.00 / 82.00`.
تم ربط العرض بالمصدر الموحد، فأصبح يعرض **نفس المبلغ الذي كان يُحصَّل بالفعل**. لم يتغيّر أي مبلغ تحصيل.

## 4) ما لم يتغيّر

- أسعار EGP: 499 / 749 / 849، والإضافة 9,999، والاستشارة 30 USD، والشحن 199 EGP.
- الخصومات والضرائب: لا تغيير (الضرائب غير مفعّلة في الإجماليات أصلًا).
- إعدادات البوابات، المفاتيح، `.env`، والعملية على 3111: لا تغيير.
- لم تُضف migration جديدة في هذه المرحلة.
- لم يُعدّل أي اختبار قائم، ولم يُضف `skip/todo/only`.

## 5) الحاجز الآلي

`tests/unit/pricingSingleSource.test.ts` يحتوي:

1. **Barrier**: يفحص `features/legacy-pages/shared/server/app` ويفشل إذا ظهر أي literal سعري خارج `server/payments/pricing.ts` (مع استثناء التعليقات وملفات الاختبار).
2. **Equality**: يثبت أن جداول العميل (EGP/USD/addons/shipping) وBilling وPaymob وMerchantResolver وKashier service links كلها تساوي قيم الكتالوج.
3. **No-repricing lock**: يثبت أن القيم المعتمدة لم تتغير.

## 6) نتائج التحقق

```
npx tsc --noEmit                     → EXIT 0
npx next build                       → EXIT 0 (تحذيرات metadataBase فقط)
npx vitest run tests/unit/pricingSingleSource.test.ts
                                     → 11/11 ناجح
حزمة اختبارات الدفع (44 ملفًا)       → 603 ناجح، 14 فاشل (بلا زيادة)
```

الـ14 فاشلًا هي نفسها المصنّفة في `PHASE1_FAILURE_CLASSIFICATION.md`، ولم يتغيّر أي منها بسبب هذه المرحلة.

## 7) مخاطر ونقاط تحتاج قرارًا

1. **أسعار «قبل الخصم» ما زالت مثبتة يدويًا** (وإن أصبحت في مكان واحد): قيم storefront تختلف عن billing، و`coaching_plus` يعرض 11,848 بينما مجموعه الفعلي 10,948. هذا مؤجل إلى **Phase 9** بنص البرومبت، ويحتاج قرارًا حول ما إذا كان «قبل الخصم» يجب أن يُشتق من بنود الفاتورة.
2. **`SmartBookLanding` ما زال يدفع مباشرة عبر SpaceRemit** دون فاتورة. سعره أصبح موحدًا، لكن المسار نفسه يجب تصنيفه/تحويله في **Phase 5**.
3. **`REGIONAL_CONFIG.taxRate`** (0.14) غير مستخدم؛ لا ضرائب في الإجماليات. أي تفعيل مستقبلي سيغيّر المبالغ ويحتاج قرارًا بشريًا.
4. **الواجهات تقرأ القيم الافتراضية** ولا تعكس `admin_settings`/env overrides حتى تُنفَّذ آلية `/api/pricing` أو تمرير server-side. هذا مقصود في Phase 2 (لم نغيّر الأسعار المعروضة)، لكنه يعني أن أي تعديل إداري مستقبلي على السعر لن يظهر في الواجهة تلقائيًا حتى المرحلة 3.
5. **imports العميل لـ `server/payments/pricing.ts`**: الملف نقي بلا أسرار أو Node APIs، و`next build` نجح. لكنه يزيد حزمة العميل قليلًا؛ إن أردت لاحقًا فصلًا تامًا، يمكن توليد ملف constants وقت البناء (خيار ب في البرومبت).
