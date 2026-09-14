# Kashier Integration & Revenue-Split — Final Gate v4 (Execution-Ready Master Architecture)

**المشروع:** Mr. X-Steroid (`Next.js 15` · `TypeScript` · `Supabase/PostgreSQL 15+` · `Tailwind CSS` · `Vitest`)  
**المستندات المرجعية:** `kashier-spec-v3.md` · مراجعة خطة التنفيذ (F/G/A) · `DoD v2` · نقّاح مستقل · `DoD v3` · `Final Gate v4 Addendum`  
**النطاق:** تعديلٌ حاسم على `DoD v3 + Owner Approval` — لا يُعيد كتابة شيء؛ يُضيف فقط ما هو جديد على البنية، ويحسم قرارات المالك.  
**مصدر هذا الإصدار:** مراجعة تقنية مستقلة (27 نقطة) + مراجعات سابقة.  
**طابع المستند:** **أمر تنفيذ صارم (Execution-Only Directive)** — التنفيذ "تنفيذي فقط"، لا اجتهاد معماري جديد أثناء البرمجة.

---

# 0. حكم الدمج والقبول (Integration & Release Gate)

المراجعة المستقلة تدمج بالكامل دون أي انتقاء جزئي، وفق التصنيف التالي:

| المصدر | البنود | الحكم الهندسي والتنفيذي |
| :--- | :--- | :--- |
| **مُغطّى أصلاً في M-2** | النقطة 9 (C-2 / D-8 = `BLOCKED`) | يُعاد تأكيده فقط (حظر الـ Live بدون موافقة صريحة من Account Manager). |
| **جديد ضروري وإلزامي** | النقاط 1, 3, 4, 5, 13, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27 | يُضاف بالكامل كبنود **N-1 → N-20** ومجموعة الاختبارات العنيفة **L-1 → L-15**. |
| **يُقبل كتصحيح مباشر** | النقطة 6 (B-6 $\rightarrow$ Derived View) | يُعدَّل B-6 (حساب المبالغ المستردة عبر View / SQL Query وليس عموداً قابلاً للتعديل). |
| **قرارات مالك إلزامية** | النقاط 8, 13 | تُحسم وتُسجل في **القسم 3**. |

> [!CRITICAL]
> **قاعدة عدم التجاوز:** النظام لا يُعتبر جاهزاً للإنتاج (`live`) إلا إذا اكتملت كل بنود **A → L** مع شهاداتها (Evidence)، واجتاز الإصدار بوابات **G (Ledger)** و **H (Recovery)** و **I (Reconciliation)** و **J (Money-Movement Safety)** و **L (Adversarial Chaos)**. لا يُتجاوز أي بند بـ "Not Applicable" إلا بموافقة المالك خطياً.

---

# 1. هيكلة الهوية المحاسبية والـ 20 إضافة الإلزامية (N-1 → N-20)

### N-1 — [P0] علاقة الفاتورة بمحاولات الدفع: Invoice : Payment Intents (1:N)
علاقة أصلية: `invoice 1 ──< N payment_intents` (تغطي محاولات العميل المتعددة: `failed`, `expired`, `succeeded`).
- **أعمدة جدول `payment_intents`:**
  - `id`: `uuid` PK
  - `invoice_id`: `uuid` FK $\rightarrow$ `invoices(id)`
  - `attempt_number`: `int` (يبدأ من 1 ويتصاعد مع كل محاولة)
  - `supersedes_payment_intent_id`: `uuid` nullable (يشير إلى المحاولة السابقة التي ألغيت أو انتهت)
  - `is_current`: `boolean` (محاولة واحدة فقط تكون `true` في أي وقت)
  - `provider`: `text` (`kashier`)
  - `provider_order_id`: `text` (مرجع كاشير الخارجي)
  - `merchant_reference`: `text` (مرجعنا المحلي الفريد)
  - `amount_minor`: `int` (بالقروش/السنتات)
  - `currency`: `char(3)` (`EGP`, `USD`)
  - `environment`: `text` (`test`, `live`)
  - `status`: `text` (`initiated`, `pending`, `succeeded`, `failed`, `cancelled`)
  - `fx_rate`: `numeric(12,6)` (سعر الصرف المثبت لحظة الإنشاء)
- **قاعدة منع القلب المتأخر (Late-Arrival Guard):**
  وصول Webhook متأخر لمحاولة قديمة بعد نجاح محاولة أحدث (`NEWER`) **لا يجوز إطلاقاً** أن يعيد حالة الطلب من `PAID` إلى أي حالة خاطئة. حقل `is_current` وحالة الفاتورة يمنعان أي "late-arrival" من التأثير على حالة النظام.

---

### N-2 — [P0] نمذجة المعاملات (One Intent → Many Transactions → Many Webhook Events)
لكل Webhook وارد، يتم ربط 4 حقول بشكل صارم:
$$\text{Webhook Event} \longleftrightarrow (\text{payment\_intent\_id}, \text{provider\_transaction\_id}, \text{provider\_operation}, \text{provider\_event\_id})$$
- يُعترف بأن عمليات مثل `3dsecure_verify` و `authenticate_payer` و `pay` و `refund` هي عمليات متعددة لنفس الطلب، ولا يُعالج أي حدث بمعزل عن سياق الـ Intent والـ Transaction.

---

### N-3 — سلسلة المحاسبة الصريحة (Explicit Financial Chain)
تُثبت هذه السلسلة في كود الدفتر المالي قبل أي تنفيذ:
```text
  Gross Captured
− Refunds                         = Net Customer Funds Retained
− Gateway Fees                    = Distributable Net
                                  = Beneficiary Allocations
                                  + Platform Allocation
                                  + Residual / Reserve
```

---

### N-4 — الدفتر المالي بالقيد المزدوج (Double-Entry Ledger & Chart of Accounts)
نموذج Journal مبسط ومحكم (غير معقد، متوازن رياضياً ومحاسبياً):
- **شجرة الحسابات المبسطة (`ledger_account`):**
  1. `CUSTOMER_FUNDS`
  2. `GATEWAY_FEES`
  3. `PLATFORM_REVENUE`
  4. `BENEFICIARY_PAYABLE`
  5. `REFUND_LIABILITY`
  6. `PAYOUT_CLEARING`
- **مثال محاسبي إلزامي (معاملة بقيمة 100 ورسوم 3):**
  - عند الدفع (Capture):
    - `Debit  CUSTOMER_FUNDS  10,000` (100 EGP)
    - `Credit SALES_CLEARING  10,000`
  - عند استقطاع رسوم البوابة:
    - `Debit  GATEWAY_FEES     300` (3 EGP)
    - `Credit CUSTOMER_FUNDS   300`
  - ثم توزيع الصافي على الحسابات الدائنة والمدينة بدقة تامة.

---

### N-5 — قيود وتوازنات الدفتر المالي الإضافية (G-11 → G-13)
- **G-11:** كل قيد Journal يجب أن يتوازن بشكل حتمي: $\sum \text{Debits} \equiv \sum \text{Credits}$.
- **G-12:** لا يُنشر أي قيد في الدفتر المالي إطلاقاً بلا حدث مصدر صالح (`source_event_type`, `source_id`).
- **G-13:** كل قيد Reversal أو Refund يجب أن يشير صراحة إلى القيد الأصلي (`references original_journal_entry_id`).

---

### N-6 — [P0] تعديل البند B-6: حساب الاسترداد عبر Derived SQL View
- يُلغى أي عمود Mutable في `order_splits` لحساب المبالغ المستردة.
- يُحسب `refunded_amount_minor` عبر استعلام أو **SQL View** يجمع تخصيصات الاسترداد من الـ Ledger:
  $$\text{refunded\_amount\_minor} = \sum(\text{refund\_allocations})$$
- يُشتق الصافي المتبقي رياضياً:
  $$\text{remaining\_amount\_minor} = \text{allocated\_amount\_minor} - \text{refunded\_amount\_minor}$$
  هذا يمنع أي انحراف (Drift) بين الـ Ledger غير القابل للتعديل وجداول البيانات.

---

### N-7 — ماكينة حالة الاسترداد الموسعة (Expanded Refund State Machine)
```text
REQUESTED → VALIDATING → SUBMITTED → PENDING → COMPLETED
                ├────────→ REJECTED
                └────────→ CANCELLED

PENDING ───────────────→ UNKNOWN   (Network Timeout ≠ Failure)
```
- حالة `PENDING` عند انقطاع الاتصال أو المهلة لا تعني الفشل بل تتحول إلى `UNKNOWN` بانتظار التحقق من كاشير.

---

### N-8 — ماكينة حالة الصرف مع التسوية (Payout State Machine + RECONCILING)
```text
QUEUED → PROCESSING → RECONCILING → COMPLETED
                               ├──→ FAILED
                               └──→ UNKNOWN
```
- حدوث Timeout في حركة مالية خارجية لا يعني الفشل الحاسم؛ بل يدخل في حالة `RECONCILING` ثم `UNKNOWN` لإجراء التحقق مع البنك.

---

### N-9 — [P0] التحكم الصارم في التزامن (Concurrency Control)
- عند اعتماد أو معالجة أي Payout أو Refund:
  استخدام `SELECT ... FOR UPDATE` (أو Postgres Advisory Locks) بالتوازي مع `unique idempotency key`.
- **الهدف:** منع سيناريو نقر مشرفين في نفس اللحظة واعتماد نفس الدفعة، مما قد ينتج عنه صرف مضاعف (#1 و #2) لنفس المستفيد.

---

### N-10 — [P0] عدم تكرار الموافقة والحماية من الاعتماد المتقادم (Approval Idempotency)
- كل زر موافقة إداري يحمل `approval_idempotency_key` فريداً.
- عند الضغط على `Approve`، يعيد الخادم فوراً وبشكل حتمي تشغيل كافة بوابات الأمان المالية (الرصيد المتاح، الرسوم الحالية، حالة المستفيد، العملة) في لحظة التنفيذ، دون الاعتماد على الفحص القديم لحظة فتح صفحة المتصفح.

---

### N-11 — طبقة الاستحقاقات الرقمية (Entitlements Layer)
- جدول مخصص: `entitlements`:
  `id, user_id, product_id, invoice_id, payment_intent_id, status ('granted', 'revoked'), granted_at, revoked_at`.
- رابط التحميل هو وسيلة وصول مؤقتة للاستحقاق، وليس الاستحقاق نفسه.
- يرتبط سحب أو إبقاء الاستحقاق بقرار المالك في **القسم 3**.

---

### N-12 — أدلة وتحقق أقوى لبوابة Kashier
- **C-1:** دليل End-to-End متكامل:
  $$\text{Create Session} \longrightarrow \text{Customer Checkout} \longrightarrow \text{Payment} \longrightarrow \text{Webhook} \longrightarrow \text{Verify Session} \longrightarrow \text{Local PAID}$$
- **C-7:** إضافة `provider_order_id` و `payment_intent_id` إلى المطابقة الحقلية المتعددة الإلزامية.
- **C-8:** فصل كل حدث Webhook إلى مراحل محققة:
  $$\text{REGISTERED} \longrightarrow \text{DELIVERED} \longrightarrow \text{SIGNATURE\_VALID} \longrightarrow \text{PERSISTED} \longrightarrow \text{PROCESSED} \longrightarrow \text{ACKED}$$

---

### N-13 — مفتاح الإيقاف الشامل للإنتاج (Release Kill Switch)
- ضبط متغير البيئة: `KASHIER_LIVE_ENABLED=false` كقيمة افتراضية صارمة في الخادم.
- يرفض السيرفر أي معاملة أو تحويل حقيقي (Live) ما لم يتحقق شرطان معاً:
  1. `Environment Approved`
  2. `Owner Kill Switch ON`
- تفعيل المفتاح محصور بمالك النظام شخصياً مع تسجيل ذلك في سجل التدقيق `audit_log`.

---

### N-14 — خطة النسخ الاحتياطي والاستعادة والتراجع (F-7 → F-10 & G-14)
- **F-7:** أخذ لقطة نسخة احتياطية لقاعدة البيانات قبل تطبيق أي Migration جديد.
- **F-8:** وجود واختبار مسار Rollback عكسي لكل ملف Migration.
- **F-9:** إجراء تجربة استعادة فعلية (Restore Drill) لقاعدة البيانات.
- **G-14 / F-10:** اختبار إثبات استعادة الدفتر المالي: التأكد من إمكانية إعادة بناء الأرصدة والقوائم بالكامل من واقع الـ Ledger بعد الاستعادة.

---

### N-15 — تصنيف شدة الاختلافات المالية (Difference Severity Classification)
- تصنيف أي تضارب تسوية إلى: `CRITICAL / HIGH / MEDIUM / LOW`.
- مثال `CRITICAL`: كاشير يؤكد نجاح العملية بينما النظام المحلي يسجلها كفاشلة.
- **قاعدة الإطلاق:** يمنع منعاً باتاً تفعيل وضع الـ Live في وجود أي اختلاف `CRITICAL` أو `HIGH` غير محلول.

---

### N-16 — ربط أنواع المطابقة بمصادر الحقيقة الرسمية
| نوع المطابقة | مصدر الحقيقة المعتمد (Source of Truth) |
| :--- | :--- |
| **Order Reconciliation** | Kashier Order API |
| **Transaction Reconciliation** | Kashier Transaction Details / Export |
| **Webhook Reconciliation** | Kashier `merchantWebhookReconciliation` |
| **Refund Reconciliation** | Kashier Refund Transactions |
| **Payout Reconciliation** | Kashier Transfer Status |
| **Settlement Reconciliation** | Bank Settlement File / Kashier Settlement Data |

---

### N-17 — منفذ الطوارئ الإداري (Break-Glass Protocol - E-4a)
- إجراء استعادة وصول إداري طارئ وموثق عند تعطل الـ 2FA أو فقدان الوصول العادي.
- استخدام مفتاح أحادي الاستخدام (Single-Use)، مقيد زمنياً (Time-Limited)، ومسجل بدرجة تدقيق فائقة، بما يضمن عدم إغلاق النظام أمام مالكه.

---

### N-18 — معيار التغطية المزدوج (Dual-Coverage Standard)
- **المعيار 1:** تغطية تفريعات الكود $\ge 90\%$ Branch Coverage في النواة المالية.
- **المعيار 2:** تغطية بنسبة **100%** لجميع الثوابت المالية الحرجة (P0 Invariants):
  - Duplicate Payout
  - Refund Mismatch
  - Amount / Currency Mismatch
  - Timeout After Acceptance
  - Duplicate Webhook
  - Old Intent Arrives Late

---

### N-19 — توحيد سجل التدقيق العام (Unified Audit Log)
- اعتماد جدول عام موحد: `public.audit_log` لكافة الأحداث المالية، التغييرات الإدارية، تبديل البيئات، وحركات الصرف والاسترداد.
- إبقاء جدول `affiliate_audit_logs` محصوراً فقط بنظام التسويق بالعمولة والإحالات دون تداخل.

---

### N-20 — سياسة إعادة المحاولة المتطورة (Advanced Retry Policy - D-4)
- هيكل طابور المحاولات:
  $$\text{Retry Queue} + \text{Retry Policy} + \text{Attempt Number} + \text{Next Retry At} + \text{Last Error} + \text{External Status Verification}$$
- حظر أي إعادة إرسال عمياء بعد الـ Timeout؛ بل استعلام حالة المعاملة الخارجية أولاً قبل اتخاذ أي قرار.

---

# 2. مجموعة اختبارات الفوضى المالية والهجمات العدائية (Group L: Adversarial & Chaos Testing)

يجب إنشاء حزمة اختبارات مخصصة في `tests/adversarial/` لتغطية السيناريوهات الـ 15 التالية مع إثبات أن الأثر المالي يبقى **Exactly-Once** والميزانية متزنة 100%:

| المعرف | السيناريو العدائي / الفوضوي | النتيجة المتوقعة وشرط النجاح |
| :--- | :--- | :--- |
| **L-1** | إرسال نفس الـ Webhook مئة مرة بالتوازي (`Duplicate Webhook x 100`). | معالجة واحدة بالضبط، 99 استجابة مكررة آمنة، ولا تكرار مالي نهائياً. |
| **L-2** | معاملة واحدة بعدة عمليات مختلفة (`pay` ثم `refund` ثم `chargeback`). | تسجيل كل حدث في قيد Journal مستقل دون أي تعارض في الفهارس. |
| **L-3** | وصول Webhook قديم لمحاولة فاشلة بعد اكتمال محاولة أحدث ناجحة. | رفض تعديل حالة الطلب الأحدث الناجح (`is_current` guard). |
| **L-4** | نجاح الدفع خارجياً بعد انتهاء مهلة العميل في المتصفح (`Client Timeout`). | تحديث الطلب إلى `PAID` فور استلام الويب هوك وتفعيل الاستحقاق بأمان. |
| **L-5** | انقطاع الاتصال بـ Payout بعد قبول كاشير للعملية. | تحول الحالة إلى `RECONCILING` والاستعلام الخارجي دون صرف مكرر. |
| **L-6** | النقر المزدوج السريع على زر الموافقة من المشرف (`Double-Click x 2`). | قفل التزامن يمنع التنفيذ الثاني ويعود بنفس المعرف المالي. |
| **L-7** | موافقة متزامنة من مشرفين اثنين على نفس الدفعة في نفس اللحظة. | فوز المشرف الأول بقفل `FOR UPDATE` وفشل أو تجاهل طلب الثاني. |
| **L-8** | طلبات استرداد متزامنة لنفس الفاتورة. | قفل المعاملة ومنع صرف استرداد يتجاوز القيمة المتاحة. |
| **L-9** | محاولة استرداد مبلغ أكبر من المبلغ الصافي المتبقي القابل للاسترداد. | رفض العملية فوراً وتوثيق محاولة خرق الحدود. |
| **L-10** | عدم تطابق العملة بين الفاتورة وحساب التحويل (`Currency Mismatch`). | اعتراض العملية في بوابة `Currency Match Gate` وإيقاف الصرف. |
| **L-11** | عدم تطابق المبلغ بالمليم بين المعاملة والفاتورة (`Amount Mismatch`). | تعليق الفاتورة بحالة `UNKNOWN` وعدم إتمامها آلياً. |
| **L-12** | انهيار قاعدة البيانات أثناء ترحيل قيد Journal في الدفتر. | تراجع ذري كامل (Rollback) وعدم وجود أي قيد مالي غير مكتمل. |
| **L-13** | انهيار المعالج (Worker Crash) مباشرة بعد استدعاء الـ API الخارجي. | التعافي واستعلام حالة الـ API الخارجي قبل اتخاذ أي قرار. |
| **L-14** | انقطاع الشبكة بعد إرسال الطلب وقبل استلام الرد. | فحص حالة المعاملة الخارجية وتجنب الـ Blind Retry. |
| **L-15** | إعادة تشغيل Webhook تاريخي قديم بعد أيام من إغلاقه. | رفض المعالجة واعتباره أرشيفياً دون أي أثر مالي جديد. |

---

# 3. قرارات المالك الإلزامية (Owner Decisions — George Maurice)

> [!IMPORTANT]
> تم اعتماد وتوقيع هذه القرارات رسمياً بواسطة المالك ولا يجوز تعديلها:

| # | القرار المالي والتشغيلي | الخيارات المطروحة | الاختيار المعتمد |
| :---: | :--- | :--- | :---: |
| **3-1** | **أساس توزيع الاسترداد** | `NET_AFTER_GATEWAY_FEE` أم `GROSS_PROPORTIONAL` | **`NET_AFTER_GATEWAY_FEE`** (توزيع الاسترداد بناءً على الصافي الفعلي لكل مستفيد) |
| **3-2** | **سياسة رسوم الاسترداد** | `MERCHANT_ABSORBS` أم `REFUND_FEE_PRO_RATA` | **`MERCHANT_ABSORBS`** (المنصة تتحمل رسوم الاسترداد لحماية حسابات الشركاء في v1) |
| **3-3** | **سياسة الـ Entitlement عند الاسترداد** | يبقى للمشتري أم يُلغى فوراً | **يبقى 14 يوماً ثم يُلغى** (فترة سماح مرنة) |
| **3-4** | **الحصص الفعلية الافتراضية** | مؤلف / منصة / احتياطي | **مؤلف 85% · منصة 10% · احتياطي 5%** ($\sum = 100\%$ ثبات صارم) |
| **3-5** | **مفتاح تشغيل الـ Live** | مفتاح Kill Switch سيرفري محمي | **`KASHIER_LIVE_ENABLED=false`** (مغلق ومحمي بانتظار go-live ويُفتح يدوياً) |

> **التوقيع والتاريخ المعتمد:** George Maurice — 14-09-2026  
> **توقيت بدء مهلة الـ 72 ساعة:** 2026-09-14T09:15:47+03:00 $\longrightarrow$ **تاريخ الاستحقاق:** 2026-09-17T09:15:00+03:00  
> **بريد المالك:** `foryoutalk@gmail.com`

---

# 4. أمر التنفيذ الصارم (Execution-Only Directive)

- **المرجعية الحصرية:** يتم الاعتماد حصراً على وثيقة `DoD v3` مدمجاً بها هذا الملحق التنفيذي `Final Gate v4`.
- **منع الاجتهاد المعماري:** لا اجتهاد ولا تغيير في النطاق أو بنية البيانات أثناء كتابة الكود.
- **إجراءات الانحراف:** أي تعارض أو صعوبة في التنفيذ تتطلب:
  1. صياغة تقرير بالأدلة التقنية.
  2. موافقة كتابية صريحة من المالك قبل التعديل.

---

# 5. معايير التسليمة النهائية والقبول (Owner Acceptance Deliverables)

عند الانتهاء من التنفيذ بالكامل، يتم تقديم حزمة التسليم التالية:
1. **جدول المصفوفة الكاملة من A إلى L:** مدعماً بروابط الملفات وشهادات الفحص الفعلي (`PASS`).
2. **سجل الـ Payment Intents:** عينة حية تثبت ترابط السلسلة الكاملة (`Invoice ↔ Intent ↔ Kashier ↔ Webhooks ↔ Split ↔ Payout`).
3. **مقتطف من `financial_ledger` بالقيد المزدوج:** لعملية كاملة تثبت توازن `Debit === Credit`.
4. **نتائج اختبارات الـ Chaos والأثر الواحد:** إثبات صريح أن `100 Duplicate Webhooks` ينتج عنها أثر مالي واحد فقط.
5. **تقرير فحص الاستقرار (Soak Test) ومحاكاة التسوية:** مع خلو تام من أي اختلافات غير معالجة.
6. **سجل التحقق من الـ Endpoints:** مؤكد ومحدث بالكامل.
7. **إثبات حماية مفتاح الـ Live:** تأكيد إغلاق المفتاح حتى إشعار المالك.
