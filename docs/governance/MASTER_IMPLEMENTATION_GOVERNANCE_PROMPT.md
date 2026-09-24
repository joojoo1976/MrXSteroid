# MASTER IMPLEMENTATION GOVERNANCE PROMPT

## MrXSteroid — Egypt Local Checkout + Global Fourthwall Store + Supabase + Admin Dashboard + Shipping + Payments

> **Status:** ADOPTED — owner-approved governing prompt (v2, 2026-09-24).
> **Phase at adoption:** Phase 0 (READ-ONLY CURRENT-STATE RECONCILIATION) — not yet approved for implementation.
> **Companion document:** `docs/governance/2026-09-24-read-only-reconciliation.md` (Phase 0 evidence report).

أريد منك تنفيذ مشروع توسعة متكامل لمنظومة التجارة والدفع الحالية لـ **MrXSteroid**.

لكن **لا تبدأ التنفيذ مباشرة**.

المرحلة الأولى إلزاميًا هي:

# READ-ONLY CURRENT-STATE RECONCILIATION

والهدف ليس كتابة تقرير نظري، بل **إثبات الحالة الفعلية للكود، Supabase schema، Admin Dashboard، Production configuration، payment architecture، Fourthwall store، shipping integrations، ثم بناء Implementation Plan مبني على الأدلة الفعلية فقط.**

لا يجوز تحويل أي افتراض إلى حقيقة.

---

# 0. قاعدة الصدق المعماري — إلزامية

كل معلومة في التقرير يجب تصنيفها داخليًا إلى:

* `CONFIRMED` — مثبتة من الكود أو schema أو production configuration.
* `CONFIRMED-LIVE` — مثبتة باختبار production آمن.
* `INFERRED` — استنتاج يحتاج تحققًا.
* `MISSING` — غير موجود.
* `CONFLICT` — يوجد أكثر من مصدر أو تصميم متعارض.
* `BLOCKED` — لا يمكن إثباتها بسبب نقص الوصول.
* `PROPOSED` — تصميم مقترح وليس جزءًا من الواقع الحالي.

**ممنوع تمامًا كتابة عبارات مثل:**

* "النظام موجود"
* "الجدول موجود"
* "الـ dashboard متوافق"
* "لا نحتاج migration"
* "البنية تدعم ذلك 100%"

إلا إذا كان ذلك مثبتًا من المصدر الفعلي.

إذا تعذر الوصول إلى repository أو Supabase schema أو Admin Dashboard code:

**توقف عن الادعاء بأنه تم تدقيقه.**

أخرج تقريرًا صريحًا بالجزء الذي لم يمكن التحقق منه، ولا تنشئ تصميمًا افتراضيًا على أنه Current Architecture.

---

# 1. BASELINE — ثبّت الحالة أولًا

قبل أي تحليل تحقق من: repository الحالي، branch، `HEAD`، آخر commit في `origin/main`، Vercel production deployment الحالي، production commit، working tree، package manager، Next.js version، TypeScript version، Supabase project reference، migrations الموجودة في repository، migrations المطبقة في Production إذا أمكن قراءتها بشكل آمن.

لا تعمل: SQL write، migration، code change، config change، production API mutation، commit، push، deployment في مرحلة الـ audit.

---

# 2. SECURITY BASELINE — لا تكسره

هناك security hardening تم إغلاقه قبل هذه المهمة. اعتبره **FROZEN BASELINE**.

لا تعيد بناء أو تكرار:

* InstaPay receipt security.
* `payment_receipts` RLS hardening.
* `payment-receipts` storage protection.
* `support_tickets` tautology fix.
* `trg_fraud_decision_apply_flag` hardening.
* pricing/merchant table privilege hardening.
* application-level leaked-password protection.

أي تعديل على هذه الأجزاء مسموح فقط إذا أثبتت وجود `REGRESSION` أو `new requirement conflict`، وفي هذه الحالة توقف وأظهر التعارض قبل التعديل.

---

# 3. BUSINESS ARCHITECTURE — النتيجة المطلوبة

أريد مسارين تجاريين منفصلين بشكل صارم:

## EGYPT

عند اختيار **داخل مصر** يصبح channel: `EGYPT`

```text
Region       = EG
Currency     = EGP
Merchant     = Egypt Kashier
Local Pay    = Kashier Egypt + InstaPay
Shipping     = Egypt/local
Provider     = Bosta
Reference Shipping Price = 199 EGP
```

لا يجوز ظهور: USD، Global merchant، Global checkout، Global payment methods، DHL، InstaPay خارج هذا المسار.

# 4. GLOBAL

عند اختيار **خارج مصر / Global / International** يصبح channel: `GLOBAL`

```text
Region       = GLOBAL
Display      = USD
Global Store = shop.mrxsteroid.com
Shipping     = International
Provider     = DHL integration
InstaPay     = forbidden
Egypt MID    = forbidden
Bosta        = forbidden
```

لكن **لا تفترض أن Global payment rail هو Kashier Global أو Fourthwall حتى يتم التدقيق**. يجب أولًا تحديد: من هو merchant of record؟ أين تحدث عملية الدفع؟ من يصدر order؟ من يصدر invoice؟ من يملك payment transaction؟ من يعالج refund؟ من يملك customer/order record؟ ما هو دور Supabase؟ ثم اعرض contract واضحًا.

---

# 5. IMPORTANT — Fourthwall Current-State Reconciliation

`shop.mrxsteroid.com` يجب تدقيقه كـ **external commerce system**.

تحقق فعليًا من: هل domain مرتبط بـ Fourthwall؟ هل checkout Fourthwall-native؟ هل cart Fourthwall-native؟ هل order Fourthwall-native؟ هل payment Fourthwall-native؟ هل refund Fourthwall-native؟ هل shipping Fourthwall-native؟ هل digital delivery Fourthwall-native؟ هل المنتجات الحالية Fourthwall products؟ product IDs/offer IDs، order IDs، customer IDs، API access، webhooks، authentication، custom domain behavior، supported currencies، checkout currency control، multi-item cart، discounts، bundles، digital files، fulfillment، order status، refunds/cancellations.

**مهم جدًا:** إذا كان Fourthwall هو النظام الذي ينفذ Global transaction فعليًا، فلا تقل إن Supabase هو صاحب payment transaction نفسه. بدلًا من ذلك حدد:

```text
Supabase Canonical Commerce Data
        ↓
External Fourthwall Transaction
        ↓
Fourthwall Order
        ↓
Webhook / API synchronization
        ↓
Supabase Canonical Order State
```

إذا كان النظام الحالي يستطيع إنشاء canonical order قبل Fourthwall checkout، حدد العلاقة. إذا كان لا يستطيع، اذكر gap صريحًا. **لا تخترع integration غير موجود.**

---

# 6. EXTERNAL STORE + SUPABASE SOURCE OF TRUTH

المبدأ إلزامي: **Supabase/Application = Source of Truth للـ canonical business model** — يشمل قدر الإمكان: canonical products، canonical product IDs، canonical package relationships، internal pricing model، canonical customer/order references، affiliate attribution، ledger، entitlements، reconciliation.

لكن إذا كان Fourthwall هو merchant/checkout system في Global، يجب احترام حقيقة أن بعض transaction/order data تنشأ خارجيًا. لذلك أنشئ **Ownership Matrix**:

| Data             | Supabase | Fourthwall | Kashier | Bosta | DHL | Admin |
| ---------------- | -------- | ---------- | ------- | ----- | --- | ----- |
| Product identity |          |            |         |       |     |       |
| Product price    |          |            |         |       |     |       |
| Cart             |          |            |         |       |     |       |
| Order            |          |            |         |       |     |       |
| Payment          |          |            |         |       |     |       |
| Shipping         |          |            |         |       |     |       |
| Refund           |          |            |         |       |     |       |
| Customer         |          |            |         |       |     |       |
| Entitlement      |          |            |         |       |     |       |
| Affiliate        |          |            |         |       |     |       |
| Ledger           |          |            |         |       |     |       |
| Reconciliation   |          |            |         |       |     |       |

لا تعتمد ownership matrix على التخمين.

---

# 7. DATABASE — REAL SCHEMA AUDIT

اقرأ الـ Supabase schema الفعلية: tables، columns، data types، defaults، PK، FK، unique، indexes، checks، generated columns، triggers، functions، views، materialized views، RLS، policies، grants، service-role access، migrations، existing seed/reference data.

لا تفترض أسماء مثل `orders` أو `invoices` أو `payment_intents` إلا بعد إثبات وجودها فعليًا.

---

# 8. DATABASE COMPATIBILITY MATRIX

| Capability         | Actual Table | Actual Columns | Current Owner | Reuse | Missing | Conflict | Migration Needed |
| ------------------ | ------------ | -------------- | ------------- | ----- | ------- | -------- | ---------------- |
| Products           |              |                |               |       |         |          |                  |
| Product Prices     |              |                |               |       |         |          |                  |
| Categories         |              |                |               |       |         |          |                  |
| Cart               |              |                |               |       |         |          |                  |
| Orders             |              |                |               |       |         |          |                  |
| Order Items        |              |                |               |       |         |          |                  |
| Invoices           |              |                |               |       |         |          |                  |
| Payment Intents    |              |                |               |       |         |          |                  |
| Payment Events     |              |                |               |       |         |          |                  |
| Refunds            |              |                |               |       |         |          |                  |
| Shipping           |              |                |               |       |         |          |                  |
| Shipping Shipments |              |                |               |       |         |          |                  |
| InstaPay Receipts  |              |                |               |       |         |          |                  |
| Affiliates         |              |                |               |       |         |          |                  |
| Referrals          |              |                |               |       |         |          |                  |
| Commission         |              |                |               |       |         |          |                  |
| Ledger             |              |                |               |       |         |          |                  |
| Entitlements       |              |                |               |       |         |          |                  |
| Fulfillment        |              |                |               |       |         |          |                  |
| Reconciliation     |              |                |               |       |         |          |                  |
| Audit Log          |              |                |               |       |         |          |                  |

**لا تكتب "Yes" في Reuse إلا بعد إثبات أن الـ existing contract يخدم requirement الجديد.**

---

# 9. ADMIN DASHBOARD — REAL AUDIT

افحص الـ Admin Dashboard الحالي: pages، layouts، navigation، server routes، API routes، admin loaders، server actions، `requireAdmin`، role resolution، service-role usage، RLS-based admin access، audit logs. ثم افحص كيف يعرض حاليًا: orders، order details، order items، invoice، payment، payment intent، payment events، refunds، shipping، InstaPay، affiliate، commission، ledger، entitlements، fulfillment، reconciliation.

لا تنشئ Admin Dashboard جديد.

---

# 10. ADMIN DASHBOARD — REQUIRED RESULT

يجب أن يستطيع الـ Admin رؤية (Egypt Order):

```text
Region
Currency
Merchant
Payment Method
Order Items
Shipping
Invoice
Payment Status
Fulfillment
Entitlement
Affiliate
Commission
Ledger
Reconciliation
```

و(Global Order) نفس contract مع:

```text
Region = GLOBAL
Currency = USD
External Provider = Fourthwall إذا كان مثبتًا
External Order ID
External Payment Reference
International Shipping
DHL reference/status
```

لا تنشئ dashboard مختلفًا لكل region.

---

# 11. ADMIN SECURITY

يجب أن يظل التدفق:

```text
Browser
    ↓
Admin API / Server Route
    ↓
Authorization
    ↓
Privileged DB Access
```

لا تعطِ `anon` أو `authenticated` صلاحيات CRUD على الجداول الحساسة لتسهيل Admin UI. أي Admin feature جديد يجب أن يستخدم الـ existing admin authorization pattern.

---

# 12. CANONICAL ORDER — DO NOT ASSUME

قبل فرض نموذج واحد تحقق هل يوجد فعلًا Canonical Order موحد. إذا نعم: أعد استخدامه. إذا لا: لا تدّعي أنه موجود. حدد: Current order models، duplicates، separate paths، legacy models، external orders. ثم اقترح:

### Option A — Convergence إلى canonical order.
### Option B — Compatibility abstraction.
### Option C — Controlled external-order adapter.

واختر فقط بعد evidence.

---

# 13. CANONICAL ORDER CONTRACT

إذا ثبت وجود canonical order أو تم اعتماد إنشاء واحد، يجب أن يدعم على الأقل:

```text
order_id
customer_id
region
currency
subtotal
discount
shipping
tax if applicable
grand_total
payment_method
merchant_reference
external_provider
external_order_id
status
payment_status
fulfillment_status
created_at
updated_at
```

لكن **لا تضف columns لمجرد أن القائمة أعلاه موجودة**. استخدم existing columns، existing metadata، existing snapshots أولًا. Migration فقط عند إثبات necessity.

---

# 14. CART + COMBINED INVOICE

الهدف التجاري: العميل يستطيع شراء أكثر من item في عملية واحدة:

```text
Book
+
Coaching
+
Consultation
+
Eligible Add-on
+
Shipping
+
Discount
```

والنظام يجب أن يحافظ على:

```text
ONE canonical cart
→ ONE canonical order
→ ONE combined invoice
→ ONE payment transaction/session
```

لكن يجب التمييز بين **Internal canonical payment record** و **External PSP/Third-party payment transaction**. لا تسمِّ external transaction `payment_intent` إلا إذا كان النظام الفعلي يعاملها كـ payment intent.

---

# 15. IMPORTANT — SHIPPING IS NOT A PRODUCT PAYMENT

لا تستخدم `MRX-SHIPPING-FEE-20260007` كدفعة منفصلة إذا كان العميل يشتري منتجات أخرى في نفس الطلب. استخدم shipping كـ canonical order line/charge. Payment Link الخاص بالشحن هو **reference mapping فقط** ما لم يثبت الـ audit أن architecture الحالية تستخدمه فعليًا كجزء من combined payment.

لا تسمح بـ:

```text
Product payment
+
separate shipping payment
```

إذا كان الهدف one-order / one-payment. ويجب منع double charging.

---

# 16. EGYPT — SHIPPING

```text
EG → Local shipping
Default/reference charge = 199 EGP
Provider = Bosta
```

المهم: **199 EGP هو customer-facing business price/reference، وليس بالضرورة Bosta API cost.** لا تجعل Bosta هو مصدر الحقيقة للسعر إذا كان business requirement الحالي flat `199 EGP`. Bosta تستخدم server-side فقط.

Environment:

```env
BOSTA_API_KEY=
```

لا تضع الـ secret في: source، Git، migration، database، browser، logs، prompt stored in repository. تحقق من Bosta API contract الحالي قبل implementation.

---

# 17. BOSTA ADAPTER

لا تربط checkout مباشرة بـ Bosta. صمم contract:

```text
ShippingProvider
    quote()
    createShipment()
    getTracking()
    cancelShipment()
    normalizeStatus()
```

لكن **لا تفترض أن Bosta يدعم كل هذه العمليات بنفس الشكل**. Audit official API أولًا. وثّق لكل operation: endpoint، auth، request، response، idempotency، retry، error states، rate limit، production/test capability.

---

# 18. GLOBAL SHIPPING — DHL

لا تفترض أن `DHL_API_KEY` و `DHL_API_SECRET` هما بالضرورة الحقول النهائية. راجع أولًا: DHL product/API family، environment، subscription model، authentication، required API key، required secret إن وجد، OAuth إن وجد، rate API، shipment creation، tracking، delivery estimate، country، postal code، package dimensions، weight، customs information، HS code if required، declared value، origin country، Incoterms/DDP/DDU if required. ثم أعطني Environment Variable Contract الحقيقي.

---

# 19. SHIPPING PRICE VS SHIPPING PROVIDER

الفصل إلزامي:

```text
Customer Shipping Price  ≠  Provider Shipping Cost
```

Store price: `Egypt = 199 EGP reference` و `Global = provider/approved quote`. ويجب snapshot القيمة داخل canonical order عند checkout. لا تعِد حساب shipping القديم عند عرض الطلب لاحقًا بطريقة تغيّر historical order total.

---

# 20. PHYSICAL VS DIGITAL VS SERVICE PRODUCTS

لكل product يجب أن يكون هناك determination فعلي لـ: `isPhysical`، `isDigital`، `isService`، `requiresShipping`، `grantsDigitalBook`.

أمثلة: Digital Protocol → no physical shipping. Paperback → physical. Hardcover → physical. Coaching → service. Consultation → service. Package → may contain mixed entitlements.

Shipping يجب أن يُفرض فقط إذا كان هناك shippable item.

---

# 21. DIGITAL BOOK ENTITLEMENT

**النسخة الرقمية للكتاب تُمنح فور نجاح شراء أي product/package مؤهل لذلك.** لكن لا تفترض كل المنتجات مؤهلة. اقرأ product/package entitlement rules الفعلية. النتيجة:

```text
Successful paid order
→ eligible item/package
→ entitlement engine
→ one digital entitlement
→ immediate access
```

يجب أن يكون idempotent.

---

# 22. IDEMPOTENCY — DEFINE IT, DON'T JUST SAY IT

لكل عملية مالية/entitlement حدد: idempotency key، unique constraint، race-condition handling، transaction boundary، retry behavior، webhook duplicate behavior، admin duplicate approval behavior، timeout behavior.

يجب أن تجيب الخطة عن:

### webhook arrives twice — ماذا يحدث؟
### payment redirect arrives twice — ماذا يحدث؟
### InstaPay admin clicks Approve twice — ماذا يحدث؟
### Fourthwall webhook retries — ماذا يحدث؟
### payment created but order update fails — ماذا يحدث؟
### order created but payment session fails — ماذا يحدث؟
### payment succeeds but webhook is delayed — ماذا يحدث؟

---

# 23. PAYMENT STATE MACHINE

لا تخترع statuses. استخرج statuses الفعلية من النظام الحالي. ثم أنشئ:

```text
Current State
→ Event
→ Next State
→ Side Effects
→ Rollback/Compensation
```

لكل: payment، order، invoice، fulfillment، entitlement، shipping.

الـ customer redirect لا يجوز أن يكون مصدر truth للدفع إذا كان webhook/server verification متاحًا.

---

# 24. EGYPT KASHIER

أعد استخدام: existing merchant resolver، existing payment session service، existing webhook verification، existing reconciliation.

```text
EG → Egypt Merchant → EGP → Egypt merchant-entitled payment methods
```

لا تفترض أن كل payment methods متاحة. Kashier يجب أن يكون server-side authority. راجع merchant entitlement الفعلي قبل تحديد UI payment methods. `allowedMethods` يجب أن يتوافق مع الطرق التي يملكها الـ merchant فعليًا.

---

# 25. KASHIER REFERENCE MAPPINGS — EGYPT

هذه البيانات التي قدمها صاحب المشروع تعتبر **reference mapping** وليست source of truth للأسعار.

## Digital Book

```text
Payment Page: كتاب مستر إكس سترويد— النسخة الرقمية PDF
Payment Link ID: PL-487616250298X
Serial: 20260001-MRX-BOOK-DIGITAL-AR
Price: 499 EGP
Package: البروتوكول الرقمي
```

## Glossy Paperback

```text
Payment Page: كتاب مستر إكس سترويد — النسخة الورقية غلاف لامع
Payment Link ID: PL-4876162503X55
Serial: MRX-BOOK-PAPERBACK-AR-20260004
Price: 749 EGP
Package: الباقة التكتيكية
```

## Hardcover Premium

```text
Payment Page: كتاب مستر إكس سترويد — النسخة المقواة الفاخرة
Payment Link ID: PL-4876162504F7E
Serial: MRX-BOOK-HARDCOVER-AR-20260005
Price: 849 EGP
Package: المحترف الذكي
```

## Coaching

```text
Payment Page: برنامج الإشراف والمتابعة- 12 أسبوع MrXSteroid
Payment Link ID: PL-4876162505ZQ7
Price: 9,999 EGP
Website integration: إضافة تدريب شخصي أونلاين
Package relationships: المحترف الذكي / الباقة التكتيكية / البروتوكول الرقمي
```

## Consultation

```text
Payment Page: جلسة استشارة وتقييم مخصص — Mr. X-Steroid
Payment Link ID: PL-48761625065D0
Price: 299 EGP
Website mapping: جلسة استشارة وتقييم مخصص — Mr. X-Steroid قبل موافقتنا
Packages: المحترف الذكي / الباقة التكتيكية / البروتوكول الرقمي
```

## Egypt Shipping Reference

```text
Payment Page: رسوم وشركة الشحن - جمهورية مصر العربية
Payment Link ID: PL-48761625075DP
Reference: 199 EGP
Serial: MRX-SHIPPING-FEE-20260007
```

**Do not use this as a separate payment when combined checkout is active.**

---

# 26. GLOBAL PRODUCT REFERENCE

Use the existing Global products and verify their actual external product IDs before implementation.

```text
MrXSteroid Digital Book                        → Digital Protocol                     → 49.99 USD
MrXSteroid Glossy Paperback Edition            → Tactical Bundle                      → 72.00 USD
MrXSteroid Hardcover Premium Book              → Smart Professional                   → 82.00 USD
Mr. X-Steroid | VIP 1-on-1 Anabolic Cycle Coaching (1 Full Cycle)
                                               → Add 1-on-1 online coaching           → 349.99 USD
Custom Consultation & Assessment Session — Mr. X-Steroid
                                               → Custom Consultation & Assessment Session - Prior to Our Cycle Approval
                                                                                      → 30.00 USD
```

This coaching price must be verified and displayed correctly. Use the long approved website display name only if the owner-supplied content requires it.

---

# 27. PACKAGE RELATIONSHIPS

Do not duplicate products simply because they occur in multiple packages. For example, Coaching and Consultation may be attached to: Smart Professional، Tactical Bundle، Digital Protocol.

Model this as product/package inclusion or add-on relationships using the existing catalog model. Do not create:

```text
Coaching-EG
Coaching-GLOBAL
Consultation-EG
Consultation-GLOBAL
```

unless the existing architecture proves that separate SKU entities are required.

---

# 28. PRICING ARCHITECTURE

Required Egypt customer prices:

```text
499 EGP
749 EGP
849 EGP
9,999 EGP
299 EGP
199 EGP shipping reference
```

Required Global customer prices:

```text
49.99 USD
72.00 USD
82.00 USD
349.99 USD
30.00 USD
```

Do not generate USD from EGP using exchange rate. Do not generate EGP from USD using exchange rate. These are explicit regional prices. Kashier may provide exchange-rate APIs, but that does not make exchange conversion the source of your canonical product price.

---

# 29. PRICE CONFLICT DETECTION

Before changing any price, compare:

```text
Supabase/application canonical price
+
Admin pricing
+
existing Kashier mapping
+
Fourthwall current price
+
UI displayed price
```

If there is disagreement: **STOP PRICE UPDATE.** Produce a **Price Conflict Report** containing: product، region، currency، source، current value، intended value، affected route، affected provider، required correction. Do not silently normalize prices.

---

# 30. REGION RESOLUTION

The client may select `EG` or `GLOBAL`, but selection alone is not authority. Server-side validation must compare: selected region، currency، shipping country، merchant، payment method، product regional availability، provider، checkout route.

Do not use IP geolocation as the sole authority. For physical orders: `EG channel + non-EG shipping country` must be handled according to explicit business rules. Do not invent those rules. If ambiguous, report the ambiguity.

---

# 31. REGION COMPATIBILITY MATRIX

Required valid combinations:

| Channel | Currency | Merchant                 | Payment                  | Shipping          |
| ------- | -------- | ------------------------ | ------------------------ | ----------------- |
| EG      | EGP      | Egypt Kashier            | Egypt methods + InstaPay | Bosta/local       |
| GLOBAL  | USD      | verified Global provider | Global methods           | DHL/international |

Forbidden:

```text
GLOBAL + EGP
EG + USD
GLOBAL + InstaPay
GLOBAL + Bosta
EG + DHL
EG + Global Merchant
GLOBAL + Egypt Merchant
```

Reject server-side before payment creation.

---

# 32. CLIENT TRUST BOUNDARY

Never trust client for: amount، currency، region، merchant، shipping cost، payment method، discount amount، commission، entitlement، payment status.

The client may request. The server decides.

---

# 33. AFFILIATE + LEDGER

Reuse the existing affiliate and ledger architecture. Do not create `global_affiliate` / `global_ledger` / `international_commission` unless the schema audit proves that existing architecture cannot support them.

Before implementation, determine: ledger currency model، commission currency model، payout currency، whether currency conversion exists، whether payouts can be multi-currency، whether one affiliate can earn both EGP and USD، how refunds reverse commissions، whether reserve/platform/store percentages are stored by transaction currency.

The existing `85 / 10 / 5` architecture must be preserved only where it is actually implemented and verified. Do not perform implicit FX conversion in the ledger.

---

# 34. FINANCIAL SNAPSHOT RULE

At order creation/payment authorization snapshot: currency، item prices، discounts، shipping، totals، commission base، merchant reference، provider، payment method.

Historical orders must not change when the current product price changes.

---

# 35. REFUNDS

Audit current refund architecture. Determine: Kashier refund، InstaPay manual refund process (if any)، Fourthwall refund، shipping refund، commission reversal، ledger reversal، entitlement revocation، reconciliation.

Never assume that `refund = delete order`. Refund must be represented as a financial event according to the existing architecture.

---

# 36. INSTA-PAY

InstaPay infrastructure already exists and has been security-hardened. Do not rebuild it. Verify:

```text
Egypt checkout
→ InstaPay
→ payment intent/order relation
→ receipt
→ admin review
→ approve/reject
→ payment status
→ entitlement
→ affiliate
→ commission
→ ledger
→ reconciliation
```

Global:

```text
GLOBAL → InstaPay forbidden → payment creation rejected
```

The rejection must occur server-side before payment creation. Do not merely hide the button.

---

# 37. INVOICE

Audit the actual invoice system. Determine: table، numbering، currency، line items، order relation، tax، shipping، discount، status، PDF generation if any، admin display، payment relation.

If a combined cart creates one invoice today: reuse it. If it does not: propose exact schema/API changes before implementing.

---

# 38. ADMIN DASHBOARD — REQUIRED DISPLAY

For every canonical order Admin should see:

```text
Order ID
Customer
Region
Currency
Products
Quantities
Add-ons
Subtotal
Discount
Shipping
Grand Total
Payment Method
Merchant
Payment Status
Invoice
Fulfillment Status
Entitlement Status
Affiliate
Commission
Ledger Status
Reconciliation Status
External Provider
External Order ID
External Payment Reference
Shipping Provider
Tracking
```

Only show fields that are backed by real data. Do not create fake placeholders that look like verified data.

---

# 39. AUDIT TRAIL

Any Admin operation must preserve: who، when، action، old value، new value، order/payment target، reason when required. Do not bypass existing audit logging.

---

# 40. API CONTRACT AUDIT

Inventory all relevant APIs. For each: `Route, Method, Auth, Request Schema, Response Schema, DB Reads, DB Writes, External APIs, Idempotency, Rate Limit, Error Model, Webhook Dependency, Admin Dependency`.

Do this for: checkout، cart، payment session، payment webhook، InstaPay، receipt، shipping quote، shipment، refund، admin review، affiliate، entitlement، reconciliation.

---

# 41. EXTERNAL WEBHOOK CONTRACTS

For Fourthwall/Kashier/Bosta/DHL if applicable, document: `Provider, Webhook URL, Signature/Auth, Event Types, Replay Protection, Idempotency Key, Raw Event Storage, Normalized Event, State Transition, Retry Strategy, Failure Handling`.

Do not mark an order paid from a browser redirect alone if provider webhook/server verification exists.

---

# 42. WEBHOOK EVENT IDEMPOTENCY

Every external event must have a deterministic deduplication strategy. Determine actual unique key such as `provider + event_id` or an equivalent provider-specific key. Do not simply use timestamps. Repeated event must be safe.

---

# 43. ERROR / COMPENSATION MODEL

Explicitly design what happens when:

```text
order created but payment fails
payment succeeds but webhook delayed
payment succeeds but DB update fails
shipping quote expires after checkout
external order created but local sync fails
local order created but external checkout abandoned
refund succeeds externally but local webhook is delayed
```

Every case must have: state، retry، reconciliation، admin visibility.

---

# 44. SHIPPING DATA SNAPSHOT

For physical orders store or snapshot: destination country، city، postal code، address، weight، dimensions if required، shipping provider، quoted amount، charged amount، tracking، provider reference، shipping status.

Do not recalculate historical shipping after order completion.

---

# 45. TAX / DUTIES / CUSTOMS

Do not invent tax or customs behavior. For Global shipping, determine whether: DHL returns duties/taxes، Fourthwall handles taxes، store charges duties، customer pays on delivery، DDP/DDU applies. If not known: mark `UNKNOWN`. Do not add a tax calculation to checkout based on assumption.

---

# 46. VISUAL / UI

After architecture is verified, UI must support:

### Egypt
* Arabic/English
* EGP only
* Egypt payment methods
* InstaPay visible
* Bosta shipping

### Global
* English/global experience as appropriate
* USD
* Global store
* InstaPay hidden
* Egypt payment methods hidden
* international shipping

Review: inputs، buttons، cards، spacing، labels، helper text، order summary، shipping summary، payment summary، mobile، RTL، LTR. UI cleanup must not alter business logic.

---

# 47. TEXT ABOVE "إضافة تدريب شخصي أونلاين"

The owner requires an additional sentence above `إضافة تدريب شخصي أونلاين`. The actual sentence content was not supplied in final form. Therefore: **Do not invent the sentence.**

During audit, identify the exact component/content key. During implementation, create the correct insertion point/i18n key but do not fabricate copy. Report this as `CONTENT INPUT REQUIRED` unless the text is subsequently supplied.

---

# 48. ENVIRONMENT VARIABLES

Expected categories:

```env
BOSTA_API_KEY=
DHL_*
NEXT_PUBLIC_STORE_URL=
```

But do not assume exact DHL variables. Determine the real contract first. Also audit all existing Kashier variables: Egypt merchant، Global merchant، API keys، secret keys، test/live mode، webhook verification. Do not invent replacement variable names when stable names already exist.

---

# 49. SECRETS

Never place: Bosta secret، DHL credential، Kashier secret، Supabase service role، Fourthwall API token — inside: source code، migration، database، frontend bundle، Git، test fixtures، logs، documentation checked into repository. Only environment/secret storage.

---

# 50. MIGRATION GOVERNANCE

If schema changes are required: Do not immediately create migration. First deliver a **Migration Design** containing: exact table، exact column، type، nullable، default، FK، unique، index، check، RLS، policies، trigger impact، backfill، existing row impact، rollback/compensation، admin dashboard impact، payment impact، reconciliation impact.

No migration is approved from a conceptual description alone.

---

# 51. ROLLBACK GOVERNANCE

For each migration define:

```text
Forward Change
Backfill
Verification
Rollback / Compensating Change
Post-Rollback Verification
```

Never destroy existing production data as part of rollback. Do not use destructive rollback automatically in Production.

---

# 52. FEATURE FLAGS / RELEASE SAFETY

If architecture allows: Egypt flow and Global flow should have separately controllable activation. New shipping providers should be disableable. Global external-order sync should be disableable. Existing checkout must remain usable during staged rollout.

Do not introduce feature flags unnecessarily if architecture does not support them, but report whether one is needed.

---

# 53. TEST STRATEGY

## Unit
region resolution، currency resolution، merchant resolution، payment method matrix، shipping provider selection، product mapping، canonical pricing، package relationships، combined invoice calculation، commission calculation، multi-currency ledger behavior، entitlement idempotency، webhook idempotency.

## Integration
Egypt Kashier، Egypt InstaPay، Global provider، Fourthwall synchronization، Bosta adapter mocked، DHL adapter mocked، order creation، invoice creation، payment state transitions، affiliate attribution، ledger، reconciliation.

## Negative — Must fail
```text
GLOBAL + EGP
EG + USD
GLOBAL + InstaPay
EG + DHL
GLOBAL + Bosta
wrong merchant
wrong currency
tampered amount
tampered shipping
tampered discount
tampered commission
duplicate payment
duplicate webhook
duplicate InstaPay approval
duplicate entitlement
invalid shipping country
```

## Admin
admin order visibility، admin payment state، admin shipping state، admin InstaPay review، admin entitlement، admin ledger visibility، admin reconciliation.

---

# 54. PRODUCTION SAFETY

During development: use test credentials where available، use mocked shipping APIs، do not call Bosta Production، do not call DHL Production، do not create live Kashier products، do not alter live product prices، do not issue live refunds، do not create fake Production orders، do not upload fake Production receipts.

Production verification must use the minimum safe probes necessary.

---

# 55. NO DUPLICATION RULE

Do not create another: checkout service، pricing engine، merchant resolver، order system، invoice engine، payment intent engine، affiliate engine، ledger، entitlement engine، reconciliation engine، InstaPay system، admin dashboard.

If an existing implementation is imperfect, report `REUSE / EXTEND / REFACTOR / REPLACE` and explain why. Do not silently replace it.

---

# 56. CURRENT PRODUCT / PRICE REQUIREMENTS

## Egypt
```text
Digital Book           499 EGP
Paperback              749 EGP
Hardcover              849 EGP
Coaching             9,999 EGP
Consultation           299 EGP
Local shipping         199 EGP
```

## Global
```text
Digital Book            49.99 USD
Paperback               72.00 USD
Hardcover               82.00 USD
Coaching               349.99 USD
Consultation            30.00 USD
```

Do not modify these values automatically. First compare against current canonical data and external mappings. Any conflict requires owner review.

---

# 57. GLOBAL STORE PRODUCT REFERENCES

```text
MrXSteroid Digital Book → Digital Protocol → 49.99 USD
MrXSteroid Glossy Paperback Edition → Tactical Bundle → 72.00 USD
MrXSteroid Hardcover Premium Book → Smart Professional → 82.00 USD
Mr. X-Steroid | VIP 1-on-1 Anabolic Cycle Coaching (1 Full Cycle) → Add 1-on-1 online coaching → 349.99 USD
Custom Consultation & Assessment Session — Mr. X-Steroid → Custom Consultation & Assessment Session - Prior to Our Cycle Approval → 30.00 USD
```

Verify all actual external product IDs before code changes.

---

# 58. FOURTHWALL CURRENCY CONTROL

The current public store must be audited for its actual currency behavior. The business requirement is: `Global primary customer price = USD`.

If Fourthwall currently allows customer currency switching: do not assume this is acceptable. Determine: can USD be forced؟ can other currencies be hidden؟ does displayed currency differ from settlement currency؟ which price is canonical؟ how is the final order amount synchronized to Supabase؟

If USD-only cannot be enforced technically: report the exact limitation before implementation.

---

# 59. FOURTHWALL DIGITAL PRODUCTS

Determine: where digital file entitlement occurs، whether Fourthwall grants the digital file، whether MrXSteroid Supabase entitlement must also be created، whether duplicate entitlement emails/downloads occur، how refund revokes/reconciles access. Do not grant access twice.

---

# 60. FOURTHWALL ORDER SYNC

Determine whether current Fourthwall API/webhooks provide enough information for:

```text
external_order_id
customer
items
quantity
amount
currency
payment state
fulfillment
refund
```

If yes: design normalized synchronization. If no: report precisely what is missing. Never fabricate webhook names or API contracts.

---

# 61. ADMIN ↔ FOURTHWALL

Admin Dashboard should show: `Provider = Fourthwall, External Order ID, External Payment Status, External Fulfillment Status, Local Canonical Status, Reconciliation Status`.

Do not imply that the Admin Dashboard can directly mutate Fourthwall data unless the actual API supports it.

---

# 62. BOSTA ↔ ADMIN

For Egypt: `Provider = Bosta, Shipment Reference, Tracking, Status, Customer Shipping Address, Charged Shipping, Provider Cost if available`. Admin operations must be server-side and authorized.

---

# 63. DHL ↔ ADMIN

For Global: `Provider = DHL, Rate snapshot, Shipment reference, Tracking, Delivery estimate, Customs state if applicable, Shipping state`. Only fields actually available from DHL should be displayed.

---

# 64. RECONCILIATION

The system must reconcile: Payment provider vs Supabase payment record vs Order vs Invoice vs Entitlement vs Ledger vs Shipping vs External Fourthwall order where applicable. Any discrepancy must be visible to Admin.

---

# 65. REQUIRED READ-ONLY REPORT

The final audit report must contain all of the following:

* **A. Repository Evidence** — commit, file paths, routes, services, components, relevant line/range references, migrations.
* **B. Admin Dashboard Compatibility Matrix** — actual route/page/API → actual table → compatibility → required change.
* **C. Database Schema Compatibility Matrix** — actual table/column/constraint/RLS/policy → reuse/gap/conflict.
* **D. Source-of-Truth Matrix** — Supabase / Fourthwall / Kashier / Bosta / DHL / Admin.
* **E. Current Payment Architecture** — Egypt and Global.
* **F. Current InstaPay Architecture** — no duplicate assumptions.
* **G. Fourthwall Architecture** — actual API/webhook/product/order capabilities.
* **H. Shipping Architecture** — actual Bosta/DHL contracts.
* **I. Canonical Order Contract** — actual current contract + exact gaps.
* **J. Invoice Contract** — actual current behavior.
* **K. Payment Intent / External Payment Contract** — distinguish internal vs external PSP records.
* **L. Multi-Currency Financial Contract** — EGP/USD behavior without implicit FX.
* **M. Affiliate/Ledger Contract** — actual implementation.
* **N. Entitlement/Fulfillment Contract** — actual implementation.
* **O. Admin/RLS Security Model** — actual implementation.
* **P. State Machines** — order/payment/shipping/entitlement.
* **Q. Idempotency Matrix** — operation → key → constraint → retry → race protection.
* **R. Migration Plan** — only migrations actually required.
* **S. API Contract Changes** — only APIs actually required.
* **T. UI Changes** — only UI changes actually required.
* **U. Exact Implementation Phases** — each phase must identify: files, DB objects, APIs, external providers, tests, rollback, deployment requirement, acceptance criteria.

---

# 66. IMPLEMENTATION PHASE DESIGN

After the audit, the proposed implementation must follow this structure where applicable:

* **Phase 0** — Current-State Reconciliation.
* **Phase 1** — Contracts + Source-of-Truth approval.
* **Phase 2** — Region/Channel enforcement.
* **Phase 3** — Canonical cart/order/invoice/payment integration.
* **Phase 4** — Egypt Kashier + InstaPay + Bosta.
* **Phase 5** — Global Fourthwall synchronization + USD enforcement + external payment reconciliation.
* **Phase 6** — DHL integration.
* **Phase 7** — Entitlement + fulfillment + affiliate + ledger reconciliation.
* **Phase 8** — Admin Dashboard integration.
* **Phase 9** — UI/UX polishing.
* **Phase 10** — Full automated verification + staging/production readiness.

Phases may be merged only when the architecture proves they are inseparable.

---

# 67. EACH IMPLEMENTATION PHASE MUST BE ATOMIC

For every implementation phase:

1. State exact scope.
2. List files.
3. List DB objects.
4. List APIs.
5. List external integrations.
6. Write tests.
7. Run typecheck/lint/test/build.
8. Verify no regression.
9. Create isolated commit.
10. Push.
11. Do not deploy unless required.
12. If Production deployment is required, explicitly identify why.
13. Perform Production verification.
14. Close the phase before beginning the next one.

---

# 68. ACCEPTANCE CRITERIA

The project is not considered complete unless:

## Egypt

```text
Egypt button
→ EGP
→ Egypt Kashier
→ InstaPay available
→ Bosta/local shipping
→ combined order works
→ admin sees order
→ payment reconciles
→ entitlement works
→ affiliate/ledger works
```

## Global

```text
Global button
→ Global store
→ USD business pricing
→ verified external payment/store provider
→ InstaPay impossible
→ Egypt merchant impossible
→ international shipping
→ DHL integration if applicable
→ external order synchronized
→ admin sees order
→ reconciliation works
→ entitlement works
→ affiliate/ledger compatibility confirmed
```

## Both

```text
No price manipulation
No currency manipulation
No merchant manipulation
No shipping manipulation
No duplicate payment
No duplicate invoice
No duplicate entitlement
No duplicate commission
No duplicate ledger event
No duplicate webhook processing
No regression in existing security hardening
```

---

# 69. FINAL ABSOLUTE RULE

Do not optimize for "making the new UI appear to work." Optimize for:

```text
Customer
↓
Correct Region
↓
Correct Currency
↓
Correct Canonical Price
↓
Correct Merchant/Provider
↓
Correct Canonical Order
↓
Correct Payment Record
↓
Correct Provider Event
↓
Correct Order State
↓
Correct Admin Visibility
↓
Correct Fulfillment
↓
Correct Entitlement
↓
Correct Affiliate Attribution
↓
Correct Ledger
↓
Correct Reconciliation
```

If any link is missing, the phase is not complete.

---

# 70. CURRENT TASK — READ ONLY

**Do not execute anything yet.**

No: SQL، migrations، code changes، new routes، new components، new tables، product creation، Kashier product creation، Kashier price changes، Bosta production calls، DHL production calls، Fourthwall production mutations، user creation، fake orders، fake receipts، commit، push، deployment.

The only allowed activity now is:

# READ-ONLY CURRENT-STATE RECONCILIATION + EXACT IMPLEMENTATION PLAN

At the end, provide a clear `CONFIRMED / MISSING / CONFLICT / BLOCKED / PROPOSED` matrix.

**Do not claim 100% compatibility unless every relevant layer has been actually inspected.**

Do not start implementation until this report is delivered and explicitly approved.
