# تقرير إغلاق الفجوات — P0 / P1 / P2

> الفرع: `main` · الأساس: `1501d5cc03a59bc6b663cbda1dbc8f69625b2daf`
>
> هذا التقرير يفصل بين ما أُغلق بالكود، وما أُغلق بأداة تحقق، وما بقي محجوبًا
> بغياب صلاحية قاعدة البيانات أو بقرار أعمال/قانوني. لا يدّعي تنفيذ migration
> لم تُطبَّق.

---

## 1) ملخص الحالة

| الفجوة | الحالة | الدليل |
|---|---|---|
| **P0.1** تطبيق migration `invoice_lines` + `invoice-first` | **محجوب** — لم تُطبَّق | محاولة `supabase db push --dry-run` فشلت بـ`28P01 authentication failed`؛ لا توجد صلاحية DBA صالحة محليًا. |
| **P0.2** التحقق الرقمي للـbackfill | **الأداة جاهزة، الأرقام الإنتاجية غير متاحة** | `scripts/verify-invoice-lines.ts` + `verifyInvoiceLineTotals()` + اختبارات. التشغيل يحتاج migration مطبّقة وcredentials صالحة. |
| **P0.3** اتساق `admin_settings` بين quote وinvoice | **مغلق** | quote وinvoice يستخدمان نفس `loadPricing()`؛ اختبارات parity + stale-quote. |
| **P1.4** توسيم Fourthwall + `invoice_lines` في المسار القديم | **مغلق** | `gateway='fourthwall'` و`payment_provider_merchant='fourthwall_global'` و`payment_intents.provider='fourthwall'`، مع كتابة البنود. |
| **P1.5** SpaceRemit `/smart-landing` legacy-bypass | **مغلق** | الصفحة تدخل `/checkout?plan=digital` عبر invoice-first؛ لم يعد هناك URL مباشر بمبلغ من العميل. |
| **P1.6** `create-invoice` القديم لا يكتب `invoice_lines` | **مغلق** | مسار non-quote يكتب البنود ويفشل مغلقًا عند عدم تطابق المجموع. |
| **P1.7** `guestClaimService` يمنح claim product | **مغلق للمسار الحديث** | يمنح من `invoice_lines` أولًا؛ claim product لا يُستخدم إلا كـfallback مؤرخ للفواتير ما قبل Phase 1. |
| **P2.8** `FlatRateProvider` كـ carrier حي | **مراجعة مكتملة — ليس carrier حيًا** | capability flags صريحة `isLiveCarrier=false`، `createShipment=false`، `track=false`. |
| **P2.9** تسامح `0.01` في `settle_invoice_payment_leg` | **كود migration جاهز — غير مطبّق** | migration إضافية `20261122120000...` + rollback. |
| **P2.10** التحقق من ربط Fourthwall | **مغلق جزئيًا** | رفض أي mapping ليس UUID قبل إنشاء الجلسة؛ يبقى إدخال معرّفات الإنتاج الحقيقية إجراءً تشغيليًا. |
| **P2.11** الضريبة من 0 إلى القيمة الصحيحة | **مؤجل بقرار أعمال/قانوني** | لا يوجد معدل ضريبة معتمد في المستودع؛ السياسة الحاكمة تمنع اختراع ضريبة. |

---

## 2) P0 — تفاصيل

### P0.1 — تطبيق migrations

الـmigrations المطلوبة إضافية فقط:

1. `supabase/migrations/20261118150000_create_invoice_lines.sql`
2. `supabase/migrations/20261118160000_invoice_first_atomic.sql`
3. `supabase/migrations/20261122120000_strict_invoice_payment_leg_amounts.sql` (P2.9)

محاولة التطبيق/الفحص تمت عبر `npx supabase db push --db-url ... --dry-run`، لكن
قاعدة البيانات رفضت المصادقة:

```text
FATAL: authentication failed for user "postgres" (SQLSTATE 28P01)
```

`.env.supabase.tmp` يحتوي قيمة `POSTGRES_PASSWORD` غير صالحة (placeholder)،
و`SUPABASE_SERVICE_ROLE_KEY` المحلي غير صالح (Invalid API key). أسرار Vercel
الإنتاجية مصنفة `Secret` ولا يمكن سحبها بـ`vercel env pull` أو `vercel env run`.

**لذلك لم يُطبَّق أي migration، ولم يُنفَّذ أي أمر destructive.** هذا هو الحاجز
الوحيد المتبقي لـP0.1.

أمر التطبيق الجاهز عند توفر كلمة مرور DBA صالحة (من مالك المشروع فقط):

```bash
npx supabase db push \
  --db-url 'postgresql://postgres.<project-ref>@<pooler-host>:5432/postgres' \
  --password '<db-password>' \
  --dry-run --yes
# بعد مراجعة القائمة:
npx supabase db push \
  --db-url 'postgresql://postgres.<project-ref>@<pooler-host>:5432/postgres' \
  --password '<db-password>' --yes
```

ثم التحقق من الدالة/الأعمدة:

```sql
select column_name from information_schema.columns
 where table_schema='public' and table_name='invoices'
   and column_name in ('pricing_version','quote_hash');
select proname from pg_proc
 where proname in ('create_invoice_atomic','settle_invoice_payment_leg');
```

### P0.2 — التحقق الرقمي

أُضيف:

- `scripts/invoiceLinesVerification.ts` — دالة نقية تحسب:
  `invoices_total`, `invoices_with_lines`, `invoices_without_lines`,
  `matching_invoices`, `deviation_count`, `deviations[]`, `line_rows`,
  `total_line_sum`.
- `scripts/verify-invoice-lines.ts` — CLI قراءة فقط يطبع نفس الأرقام، ويخرج
  بالكود `2` عند وجود أي انحراف.
- اختبار يثبت حالة covered / missing / deviation بمقدار `-0.01`.

التشغيل بعد تطبيق migration:

```bash
npx tsx scripts/verify-invoice-lines.ts
```

لم تُنتج أرقام الإنتاج لأن قراءة `invoice_lines` مستحيلة قبل تطبيق P0.1.

### P0.3 — اتساق التسعير

- `buildQuote()` أصبح يقبل `pricing?: PricingConfig` ويستخدمه بدلًا من
  `basePricing()` عند تمريره.
- `POST /api/checkout/quote` يحمّل نفس كتالوج `loadPricing()` من
  `admin_settings` عبر `server/payments/quotePricing.ts`.
- `createInvoiceFromQuote()` يحمّل نفس الكتالوج ويعيد التسعير به قبل المقارنة،
  ويرفض quote قديمًا بـ`QuoteStaleError` إذا تغيّر سعر إداري.
- اختبارات parity تثبت أن override `pricing_digital_egp=1234` يظهر في quote
  وفي `p_amount`/`p_lines` معًا، وأن quote الموقّع قبل التغيير يُرفض.

---

## 3) P1 — تفاصيل

### P1.4 / P1.6 — Fourthwall والمسارات القديمة

`createCheckoutSession()` أصبح:

- يكتب `gateway='kashier' | 'fourthwall'` و
  `payment_provider_merchant='kashier_egypt' | 'fourthwall_global'` حسب المنطقة.
- ينشئ `payment_intents.provider` بالمزوّد الفعلي.
- يبني `invoice_lines` من نفس كتالوج `loadPricing()` ويكتبها قبل إنشاء الجلسة.
- يحذف الفاتورة التي أنشأها للتو إذا فشلت كتابة البنود، حتى لا تصبح قابلة للدفع
  بلا بنود.

مسار `POST /api/payments/create-invoice` غير الـquote أصبح:

- يكتب البنود بعد إنشاء الفاتورة وقبل الاتصال بالبوابة.
- يتحقق أن `Σ(line_total) == amount` ويرفض الكتابة عند الانحراف.
- يضيف فرعًا صريحًا لـ`paymentMethod='spaceremit'` حتى يبقى SpaceRemit
  مدعومًا لكن **بفاتورة وبنود أولًا**، لا برابط مباشر بمبلغ من العميل.
- يحذف الفاتورة الوليدة إذا فشلت كتابة البنود.

### P1.5 — `/smart-landing`

`SmartBookLanding.handlePayment()` لم يعد يبني
`https://spaceremit.com/apipay-v2/?amount=...` من العميل. أصبح يوجّه إلى:

```text
/checkout?plan=digital&region=EG|GLOBAL
```

مع تمرير `utm_*` و`ref` عبر `buildCheckoutPlanUrl()`. بذلك يدخل نفس مسار
quote → invoice + lines → session.

### P1.7 — Guest claims

`redeemGuestOrderClaim()`:

- يقرأ `invoice_lines` أولًا ويحوّلها عبر الخريطة القانونية
  (`server/payments/entitlement/invoiceLineProducts.ts`).
- يمنح كل منتج فريد في الفاتورة، وليس `claim.product_id` فقط.
- metadata تحمل `source: 'guest_order_claim'` و
  `entitlement_source: 'invoice_lines'`.
- `claim.product_id` لا يُستخدم إلا كـ`legacy_fallback` للفواتير التي لا تحتوي
  بنودًا (ما قبل Phase 1).

---

## 4) P2 — تفاصيل

### P2.9 — إزالة التسامح

migration جديدة (replace function فقط، غير destructive):

```text
supabase/migrations/20261122120000_strict_invoice_payment_leg_amounts.sql
supabase/migrations/rollbacks/20261122120000_rollback_strict_invoice_payment_leg_amounts.sql
```

المقارنة أصبحت:

```sql
round(v_target_leg.amount, 2) <> round(p_amount_paid, 2)
v_total_paid >= v_invoice.amount
```

لا يوجد `0.01` tolerance في الكود. migration لم تُطبَّق بعد (P0.1).

### P2.8 — Shipping

`ShippingProvider` أصبح يعلن صراحة:

```ts
isLiveCarrier: false
capabilities: { quote: true, createShipment: false, track: false }
```

`FlatRateProvider` يظل شريحة سعرية 199 EGP. تحويله إلى carrier حي يحتاج عقد
ناقل + credentials + webhook tracking، ولم يُخترع أي تكامل.

### P2.10 — Fourthwall

`resolveProductMapping()` يرفض أي معرّف ليس UUID صالحًا (إضافة إلى رفض
البادئات placeholder). هذا يمنع إنشاء فاتورة ثم الفشل عند Storefront cart.
تبقى إدخالات `FOURTHWALL_PRODUCT_*` الحقيقية إجراءً تشغيليًا قبل تفعيل GLOBAL.

### P2.11 — الضريبة

لم تُغيَّر من `0`. لا يوجد معدل ضريبة معتمد في المستودع، و
`docs/billing-refactor/PHASE2_PRICING_SOURCES.md` والسياسة الحاكمة تمنعان
اختراع ضريبة أو duties. أي تفعيل يغيّر كل الإجماليات ويحتاج قرارًا ضريبيًا
مكتوبًا (معدل، نطاق، هل السعر شامل أم لا).

---

## 5) التحقق النهائي

| الفحص | النتيجة |
|---|---|
| حزمة الدفع/checkout + اختبار الفجوات | **54 ملفًا، 713/713 ناجحة، 0 فاشل** |
| `npx tsc --noEmit` | **exit 0** |
| `npm run build` | **exit 0** — `✓ Compiled successfully` |
| `npm run check:artifacts` | **exit 0** — no backup artifacts |
| Migration مطبّقة | **0** (محجوب بالمصادقة) |
| تغيير gateway/key/env | **0** |
| Migration destructive | **0** |

## 6) الفجوات المتبقية

1. **P0.1/P0.2** — تطبيق migrations وتشغيل `verify-invoice-lines.ts` يحتاج
   كلمة مرور DBA صالحة أو `SUPABASE_ACCESS_TOKEN` صالح؛ لا شيء آخر يحجب.
2. **P2.8** — carrier حي (DHL/Bosta/…) يحتاج عقدًا وcredentials وتكامل tracking.
3. **P2.10** — معرّفات Fourthwall الإنتاجية يجب إدخالها والتحقق منها قبل GLOBAL.
4. **P2.11** — معدل الضريبة/الرسوم قرار أعمال وقانون، لا يمكن اختراعه.
5. **P1.5** — الصفحة الآن invoice-first عبر checkout القياسي؛ إن كان المطلوب
   إبقاء SpaceRemit كبوابة لهذه الصفحة تحديدًا، يلزم نموذج بيانات عميل
   (email/fullName) ثم تمرير `paymentMethod='spaceremit'` إلى المسار المدعوم.
