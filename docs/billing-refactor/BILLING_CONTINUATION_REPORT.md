# التقرير الختامي — إعادة هيكلة قسم الدفع/الفوترة

> الفرع: `feat/r6.1-tools-041-042` — لم يُدفع إلى origin ولم يُنتقل إلى `main`.
> المراحل 1–9 منفّذة ومقبولة. المرحلة 10 الاختيارية **لم تبدأ**.
> هذا التقرير لا يغيّر أي كود أو migration أو إعداد بوابة.

---

## 1) حالة المراحل 1–9

| المرحلة | الحالة | السبب / الملاحظة |
|---|---|---|
| 1 — `invoice_lines` + backfill + تصنيف الـ14 | **تم (كود)** — التحقق الرقمي معلّق | أُضيفت migration الجدول، planner idempotent، dry-run CLI، 8 اختبارات، وتصنيف الـ14. لم يُشغَّل backfill على نسخة بيانات حقيقية، فلا توجد أعداد covered/incomplete/deviation. آخر checkpoint قبل Phase 2: `2739d45a`. |
| 2 — مصدر سعر واحد | **تم** | `server/payments/pricing.ts` هو المصدر، مع حاجز `pricingSingleSource.test.ts`. commit `9565a33c`. |
| 3 — Quote endpoint | **تم** | `POST /api/checkout/quote` قراءة فقط، token موقّع، رفض حقول الأسعار من العميل. commit `da95c50f`. |
| 4 — إنشاء الفاتورة ذرّيًا | **تم (كود)** — migration غير مطبقة | `create_invoice_atomic` + `quote_token` + `createSessionFromInvoice`. commit `a65cdc03`. التطبيق على قاعدة البيانات مؤجل. |
| 5 — تحويل مسارات التجاوز | **تم** | Kashier quick/service links وPaymob modal وVIP service invoices. commit `bc496542` + `fcb3c3df`. |
| 6 — تحصين webhook/callback | **تم** | state machine في `metadata.payment_state`، zero-margin amount/currency، توحيد callback/webhook، audit. commit `65772d9c`. |
| 7 — الشحن ولغة الكتاب | **تم** | بند شحن بـmetadata كامل، `FlatRateProvider` 199 EGP، لغة على بند الفاتورة، `DigitalBookDelivery`، استحقاقات من `invoice_lines`. commit `f9859c6c`. |
| 8 — إغلاق الـ14 اختبارًا | **تم** | أُعيدت كتابة الاختبارات للسلوك المعتمد، 0 فشل، لا skip/todo/only. commit `88e876cf`. |
| 9 — عرض `coaching_plus` + حذف `.bak` + حاجز CI | **تم** | «قبل الخصم» مشتق من بنود أصلية، حُذفت 11 `.bak`، `check:artifacts` + `prebuild` + GitHub Actions. commit `871a8c34`. |
| 10 — تفكيك `CheckoutForm.tsx` | **مؤجّل / لم يبدأ** | اختيارية، ولم يطلبها صاحب القرار بعد. لا تغيير في الملف. |

---

## 2) جدول 2.3 النهائي لمسارات الدفع

| المسار | الحالة النهائية | الدليل | المتبقي |
|---|---|---|---|
| `/checkout` → quote → create-invoice → create-session | **invoice-first — مكتمل** | Phase 3 + 4؛ الفاتورة تُنشأ ذرّيًا قبل الجلسة، والجلسة تقرأ `invoices.amount/currency` | تطبيق migration Phase 4 على قاعدة البيانات |
| Kashier quick links (3) | **invoice-first — مكتمل** | Phase 5؛ الروابط أصبحت `/checkout?plan=...` وتحافظ على `utm_*` و`ref` | لا شيء وظيفيًا |
| Kashier service links | **invoice-first service — مكتمل** | Phase 5؛ الفاتورة أولًا ثم رابط خدمة Kashier من الخادم، والراية تتحكم بالظهور فقط | `KASHIER_SERVICE_LINKS_VERIFIED` يجب أن يبقى بلا تفعيل بيئي غير معتمد |
| Paymob direct/standalone | **redirect → invoice-first** | Phase 5؛ المودال يوجّه داخليًا إلى `/checkout`، والبوابة `disabled` | لا تغيير في حالة البوابة |
| Fourthwall | **invoice-first (partial)** | الفاتورة توجد قبل جلسة Fourthwall، والمبلغ USD صحيح | وسم الفاتورة ما زال `kashier_*`، والمسار القديم `createCheckoutSession` لا يكتب `invoice_lines`؛ يحتاج إغلاقًا لاحقًا |
| SpaceRemit `/smart-landing` | **legacy-bypass — مؤجّل** | Phase 5 صنّفه فقط؛ لم يُحوَّل | تحويل كامل إلى invoice-first بقرار بشري |
| SpaceRemit gateway fallback | **invoice-backed — مكتمل** | Phase 6/8؛ يمر بفاتورة | لا شيء معروف |
| InstaPay receipt | **invoice-backed — مكتمل** | Phase 6/8؛ amount verification + state machine + RPC اعتماد | لا شيء معروف |
| Stripe | **invoice-backed — مكتمل** | Phase 6/8؛ لا صف إعداد بوابة مستقل | لا شيء معروف |

> **الخلاصة:** صفر مسار غير مصنّف. المسار الوحيد المتبقي خارج invoice-first بالكامل هو SpaceRemit `/smart-landing`، وهو موثّق كاستثناء مؤجل. Fourthwall مصنّف `partial` وليس bypass كاملًا.

---

## 3) مصير الاختبارات الـ14

المرجع: `docs/billing-refactor/PHASE1_FAILURE_CLASSIFICATION.md` و`PHASE8_TEST_CLOSURE.md`.

| # | الاختبار | الملف | المصير |
|---|---|---|---|
| 1 | `country=US does NOT resolve to egypt (the original bug)` | `tests/integration/checkoutCountryRouting.test.ts` | أُصلح fixture Fourthwall؛ ناجح |
| 2 | `country=GB resolves to GLOBAL/USD` | نفس الملف | أُصلح fixture؛ ناجح |
| 3 | `an explicit country is NOT overridden by the IP geolocation header` | نفس الملف | أُصلح fixture؛ ناجح |
| 4 | `keeps Global DIGITAL at 0 with no shipping charge` | نفس الملف | أُصلح fixture؛ ناجح |
| 5 | `allows a Global DIGITAL order (shipping is free and must not be priced)` | نفس الملف | أُصلح fixture؛ ناجح |
| 6 | `honours a TOP-LEVEL provider on the Kashier path` | نفس الملف | أُصلح fixture؛ ناجح |
| 7 | `a TOP-LEVEL provider wins over a conflicting metadata provider` | نفس الملف | أُصلح fixture؛ ناجح |
| 8 | `an INVALID top-level provider is rejected rather than silently dropped` | نفس الملف | أُصلح fixture؛ ناجح |
| 9 | `GLOBAL Kashier uses legacy KASHIER_GLOBAL_* merchant and USD pricing` | `tests/integration/createInvoiceKashierDelegation.test.ts` | أُعيدت كتابته إلى Fourthwall/USD؛ ناجح |
| 10 | `Global order → USD pricing, card-only methods, no Egypt shipping` | `tests/unit/checkoutSessionService.test.ts` | أُعيد mock إلى Fourthwall؛ ناجح |
| 11 | `rejected receipt settles the ORDER ... to cancelled + failed` | `tests/unit/instapayPreservationLock.test.ts` | أُعيد كتابته إلى state machine/RPC؛ ناجح |
| 12 | `verifies a pending receipt, settles order ... paid` | `tests/unit/paymentReceiptsAdmin.test.ts` | أُعيد كتابته إلى `under_review → approved` + RPC؛ ناجح |
| 13 | `rejects a receipt and settles order to cancelled + failed` | نفس الملف | أُعيد كتابته إلى `submitted_for_review → rejected`؛ ناجح |
| 14 | `lists receipts and applies the status filter` | نفس الملف | أُعيد mock إلى `admin_instapay_review_detail`؛ ناجح |

**النتيجة:** 14/14 مغلقة، 0 فشل، 0 استثناءات، ولا `skip/todo/only`.

---

## 4) الفجوات المتبقية بترتيب الأولوية

### P0 — تمنع الإنتاج الفعلي
1. **تطبيق migrations:** migration Phase 1 (`invoice_lines`) ومigration Phase 4 (`create_invoice_atomic` + عمودا `pricing_version/quote_hash`) غير مثبت تطبيقهما في هذا التسليم. لا تعمل الفاتورة الذرّية في الإنتاج قبل تطبيقهما.
2. **التحقق الرقمي للـbackfill:** يجب تشغيل السيناريو على نسخة بيانات، إثبات `Σ(line_total) == invoices.amount` لكل فاتورة مغطاة، وعدّ covered/incomplete/deviation. لا توجد أرقام إنتاج بعد.
3. **`admin_settings` pricing overrides:** quote يستخدم `basePricing()` بينما invoice يستخدم `loadPricing()` الذي يشمل admin؛ قد يختلف عرض الـquote عن الفاتورة عند وجود override إداري.

### P1 — تصحيح اتساق مطلوب
4. **Fourthwall:** توحيد `invoices.gateway`/`payment_provider_merchant` مع المزوّد الفعلي، وإكمال `invoice_lines` في مسار `createCheckoutSession` القديم.
5. **SpaceRemit `/smart-landing`:** المسار الوحيد المتبقي legacy-bypass.
6. **المسار القديم `create-invoice` غير quote-driven:** يكتب metadata على الفاتورة ولا ينشئ `invoice_lines`؛ يحتاج قرار إلغاء/تحويل.
7. **`guestClaimService`:** يمنح الاستحقاق من منتج الـclaim مباشرة، وليس من `invoice_lines`؛ مبرر مؤقت للحفاظ على العقد والاختبارات.

### P2 — مخاطر مؤجلة
8. **الشحن الحقيقي:** `FlatRateProvider` شريحة سعرية 199 EGP وليس ناقلًا حيًا؛ `createShipment/track` غير مدمجين.
9. **`settle_invoice_payment_leg`:** ما زال يحتوي هامشًا داخليًا `0.01`؛ الخدمة ترفض الانحراف قبل الاستدعاء، لكن الاستدعاء المباشر يبقى متسامحًا.
10. **Fourthwall product mapping:** بذور mapping/متغيرات `FOURTHWALL_*` ما زالت نقطة تشغيلية يجب التحقق منها قبل تفعيل GLOBAL إنتاجيًا.
11. **الضريبة:** `tax=0` ولا محرك ضريبة مفعّل؛ أي تفعيل يغيّر الإجماليات ويحتاج قرارًا.
12. **`CheckoutForm.tsx`:** تفكيك اختياري لم يبدأ.

---

## 5) حالة التحقق الرقمي للـbackfill — **معلّق**

**ما تم:**
- migration إضافية لجدول `invoice_lines` مع فهرس `invoice_id` وقيد `(invoice_id, position)`.
- planner نقي `scripts/invoiceLinesBackfill.ts`.
- CLI `scripts/backfill-invoice-lines.ts` بوضع dry-run افتراضي، `--apply`, `--batch`, `--limit`, وتقرير summary/reasons.
- 8 اختبارات planner: product+shipping، discount، no-order fallback، mismatch fallback، idempotency، pre-existing drift، currency، وبنية migration.
- الـplanner لا يغيّر `invoices.amount/status`، ولا يخمّن عند نقص البيانات؛ يستخدم `backfill_incomplete=true` وسببًا.

**ما لم يتم:**
- لم يُشغَّل dry-run على نسخة من بيانات الإنتاج.
- لا توجد أعداد `invoices_total / covered_from_order_items / covered_from_invoice_total / incomplete / deviations`.
- لم يُشغَّل `--apply` مرتين على نفس النسخة لإثبات نفس الأعداد خارج الاختبارات.
- لا توجد مطابقة SQL فعلية لكل فاتورة: `Σ(line_total) == invoices.amount` بصفر انحراف.

**الحالة:** التحقق الرقمي **معلّق** حتى توفير نسخة بيانات غير إنتاجية وتطبيق migration.

---

## 6) حالة migration المرحلة 4 — **غير مطبقة**

الملف: `supabase/migrations/20261118160000_invoice_first_atomic.sql`

- إضافية فقط: عمودان nullable (`invoices.pricing_version`, `invoices.quote_hash`) + دالة `create_invoice_atomic`.
- الدالة تكتب `orders` + `invoices` + `invoice_lines` في معاملة واحدة، وتستخدم idempotency القائم.
- rollback: `supabase/migrations/rollbacks/20261118160000_rollback_invoice_first_atomic.sql`.
- **لم تُطبَّق على أي قاعدة بيانات في هذا العمل.** لم تُنشأ أي اتصالات قاعدة بيانات.
- قبل الإنتاج يجب تطبيق migration Phase 1 أولًا، ثم Phase 4، والتحقق من وجود الدالة/الأعمدة.
- حتى التطبيق، أي استخدام فعلي لمسار `quote_token` قد يفشل عند استدعاء RPC.

---

## 7) حالة `admin_settings` overrides — **مؤجلة**

- `server/payments/quote.ts` يستخدم `basePricing()`: الكتالوج + env overrides فقط.
- مسار الفاتورة يستخدم `loadPricing()`: admin_settings > env > defaults.
- النتيجة: عند وجود override إداري، قد يعرض quote سعرًا مختلفًا عن الفاتورة/التحصيل.
- الواجهات تقرأ `DEFAULT_PRICING` ولا تعرض overrides الإدارية تلقائيًا.
- لم يُغيَّر أي إعداد أو pricing row. القرار المطلوب: توحيد قارئ الإعداد بين quote/invoice، أو منع overrides في quote صراحةً، أو إرجاع quote من الخادم بالكامل.

---

## 8) حالة Fourthwall gateway label — **مؤجلة**

- جلسة GLOBAL تُنشأ فعليًا عبر Fourthwall بمبلغ USD صحيح.
- لكن `checkoutSessionService` يكتب قبل التفرّع:
  - `invoices.gateway = 'kashier'`
  - `payment_provider_merchant = 'kashier_<region>'`
- لذلك وسم الفاتورة لا يعكس المزوّد الفعلي، رغم أن الجلسة Fourthwall.
- إضافةً إلى ذلك، مسار `createCheckoutSession` القديم لا يكتب `invoice_lines`؛ المسار invoice-first (quote → create-invoice) هو الذي يكتبها.
- لم يُصلَح في Phase 8 لأنه خارج نطاق إغلاق الاختبارات، ولا في Phase 9 لأنه عرض/تنظيف. يحتاج قرارًا في مرحلة لاحقة.

---

## 9) حالة SpaceRemit — **مؤجلة**

- `/smart-landing` ما زال `legacy-bypass`: يدفع مباشرة عبر SpaceRemit دون فاتورة مسبقة.
- تم تصنيفه صراحةً في جدول 2.3 ولم يُحوَّل.
- المسار البديل `SpaceRemit gateway fallback` مصنّف `invoice-backed`.
- التحويل الكامل يحتاج قرارًا بشريًا ونطاقًا مستقلًا (فاتورة + بنود + تحقق مبلغ + webhook).
- لا تغيير في إعداد SpaceRemit أو مفاتيحه أو حالته.

---

## 10) حالة تفكيك `CheckoutForm.tsx` — **اختيارية، لم تبدأ**

- `features/checkout/CheckoutForm.tsx` ما زال يتجاوز 1000 سطر.
- Phase 10 اختيارية، ولم تُبدأ، ولم يُعدّل الملف في إطار هذه المراحل.
- المتطلبات الأساسية مفككة مسبقًا في `useCheckout` و`OrderSummary` و`ProductSelector`، ما يسهّل التفكيك لاحقًا.
- أي بدء يحتاج قرارًا منفصلًا، والتزامًا بعدم تغيير DOM أو `data-testid` أو a11y، وإبقاء كل اختبارات السلوك خضراء.

---

## 11) خط الأساس النهائي للتحقق

| الفحص | النتيجة النهائية |
|---|---|
| حزمة الدفع (54 ملفًا مطابقًا) | **689 ناجح / 0 فاشل / 689** |
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | exit 0 (مع `prebuild` guard) |
| `npm run check:artifacts` | exit 0 |
| `find . -name '*.bak'` | 0 |
| migrations مطبقة في هذا العمل | **0** |
| تغييرات بوابة/مفتاح/env/3111 | **0** |

---

## 12) القرار المطلوب قبل أي متابعة

1. اعتماد هذا التقرير كحالة نهائية للمراحل 1–9.
2. تحديد أولوية معالجة P0: تطبيق migrations، ثم التحقق الرقمي للـbackfill، ثم توحيد `admin_settings` مع quote.
3. قرار منفصل بشأن SpaceRemit `/smart-landing` وFourthwall label.
4. عدم بدء Phase 10 إلا بطلب صريح بعد ذلك.
