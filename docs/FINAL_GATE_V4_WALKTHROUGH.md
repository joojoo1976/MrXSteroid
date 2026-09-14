# Kashier Integration & Revenue-Split — Final Gate v4 Execution Report & Evidence Walkthrough

**المشروع:** Mr. X-Steroid (`Next.js 15` · `TypeScript` · `Supabase/PostgreSQL 15+` · `Vitest`)  
**المرجع الحاكم:** `Final Gate v4` (المعتمد) + `DoD v3` + `Owner Go-Ahead Directive`  
**حالة التشغيل:** **مكتملة هيكلياً، بانتظار قرارات المالك والتحقق الحي عبر بيئة Staging** (مع الالتزام التام بتعليق C-2/D-8 وإغلاق Kill Switch N-13).  
**توقيت بدء مهلة الـ 72 ساعة:** 2026-09-14T09:15:47+03:00  
**تاريخ الاستحقاق:** 2026-09-17T09:15:00+03:00  
**المالك:** George Maurice (`foryoutalk@gmail.com`)

---

## 1. بطاقات الأدلة الرسمية (Evidence Cards per K-1 → K-6)

### [Group A] قاعدة البيانات والتطبيع والهوية
```yaml
Item: A-1, A-6, N-1 (Payment Intents 1:N & Schema Backbone)
Type: SQL Migration
Location: supabase/migrations/20260914100000_create_final_gate_v4_tables.sql
Executed By: Antigravity Agent
Executed At: 2026-09-14T05:00:00Z
Environment: Local / Supabase PostgreSQL 15+
Result: PASS
Artifact: supabase/migrations/20260914100000_create_final_gate_v4_tables.sql

Item: A-2 (Row-Level Security)
Type: SQL Migration Policy
Location: supabase/migrations/20260914100000_create_final_gate_v4_tables.sql:190-230
Executed By: Antigravity Agent
Executed At: 2026-09-14T05:00:00Z
Environment: Local / Supabase PostgreSQL 15+
Result: PASS
Artifact: Enabled on payment_intents, refunds, financial_ledger, entitlements, audit_log

Item: A-4, N-2 (Webhook Quadruple Linkage & Composite Uniqueness)
Type: SQL Composite Index & Table Alteration
Location: supabase/migrations/20260914100000_create_final_gate_v4_tables.sql:145-165
Executed By: Antigravity Agent
Executed At: 2026-09-14T05:00:00Z
Environment: Local / Supabase PostgreSQL 15+
Result: PASS
Artifact: idx_webhook_events_quadruple on (provider, provider_event_id, provider_transaction_id, provider_operation)
```

---

### [Group B & G] محرك التقسيم والدفتر المالي المحاسبي
```yaml
Item: B-6, N-6 (Derived SQL View for Refunds)
Type: SQL View
Location: supabase/migrations/20260914100000_create_final_gate_v4_tables.sql:167-195
Executed By: Antigravity Agent
Executed At: 2026-09-14T05:00:00Z
Environment: Local / Supabase PostgreSQL 15+
Result: PASS
Artifact: public.v_order_splits_refunded (derived view prevents drift)

Item: G-1..G-13, N-3, N-4, N-5 (Double-Entry Journal & Balanced debits === credits)
Type: Unit Test
Location: tests/unit/financialLedgerService.test.ts:1-45
Executed By: Antigravity Agent
Executed At: 2026-09-14T05:10:00Z
Environment: Vitest / Node.js
Result: PASS
Artifact: 5/5 tests passing (perfect balance verification & invalid entry rejection)
```

---

### [Group C & D] البوابة وماكينات الحالة والأمان
```yaml
Item: C-2 (Kashier Payout Host Confirmation)
Type: Account Manager Verification
Location: docs/kashier-endpoints-verification.md:17
Executed By: Owner / Account Manager
Executed At: 2026-09-14
Environment: Production Gate
Result: BLOCKED
Artifact: Explicitly marked BLOCKED pending Kashier AM confirmation (fep/v3 vs api/v2)

Item: D-8 (Transfers Hashing Confirmation)
Type: Account Manager Verification
Location: docs/kashier-endpoints-verification.md:18
Executed By: Owner / Account Manager
Executed At: 2026-09-14
Environment: Production Gate
Result: BLOCKED
Artifact: Explicitly marked BLOCKED pending Kashier AM confirmation

Item: D-7, N-10 (Approval Idempotency & Stale-Approval Protection)
Type: Unit Test & Service Implementation
Location: server/payments/payoutService.ts:87-175
Executed By: Antigravity Agent
Executed At: 2026-09-14T05:10:00Z
Environment: Vitest / Node.js
Result: PASS
Artifact: tests/unit/payoutService.test.ts (re-runs all gates at execution moment)

Item: N-13 (Server-Side Release Kill Switch)
Type: Code Inspection & Unit Execution
Location: server/payments/gateways/KashierGateway.ts:347-353
Executed By: Antigravity Agent
Executed At: 2026-09-14T05:05:00Z
Environment: Node.js
Result: PASS
Artifact: KASHIER_LIVE_ENABLED=false strictly enforced in assertCredentials()

Item: N-14, F-8 (Backup & Rollback Script)
Type: SQL Rollback Script
Location: supabase/migrations/rollbacks/20260914100000_rollback_final_gate_v4_tables.sql
Executed By: Antigravity Agent
Executed At: 2026-09-14T05:00:00Z
Environment: Supabase Sandbox
Result: PASS
Artifact: Clean teardown script created and validated

Item: N-17 (Break-Glass Protocol)
Type: Module & Audit Log Integration
Location: server/auth/breakGlass.ts:1-85
Executed By: Antigravity Agent
Executed At: 2026-09-14T05:05:00Z
Environment: Node.js / Crypto
Result: PASS
Artifact: Time-limited, constant-time compare, logged to public.audit_log
```

---

### [Group L] حزمة اختبارات الفوضى والهجمات العدائية (Adversarial & Chaos Testing)
```yaml
Item: L-1..L-15 (15 Chaos & Concurrency Financial Scenarios)
Type: Automated Integration & Unit Test Suite
Location: tests/adversarial/financialChaos.test.ts:1-195
Executed By: Antigravity Agent
Executed At: 2026-09-14T05:10:12Z
Environment: Vitest 4.1.10
Result: PASS
Artifact: 15/15 passing (100 Duplicate Webhooks -> 1 effect, Late-Arrival guard, concurrency locks, double-click)
```

---

## 2. ملخص الفحص الشامل واختبار الأداء (Quality & Build Metrics)

1. **حزمة اختبارات Vitest الشاملة:**
   ```text
   RUN  v4.1.10 E:/MrXSteroid-main

   Test Files  45 passed (45)
   Tests       694 passed (694)  — [100% Success]
   Duration    10.62s
   ```
   - **694 اختباراً** شاملاً كافة حالات الفوضى، والقيد المزدوج، وحراس التأخير، وماكينات الحالة الجديدة.

2. **فحص الـ Linter وقواعد الكود:**
   ```text
   npm run lint
   ✖ 3 problems (0 errors, 3 warnings)
   ```
   - **0 أخطاء برمجية**.

3. **فحص الأنواع وتوافق TypeScript:**
   ```text
   npx tsc --noEmit
   Exit Code: 0 (Zero Errors)
   ```

4. **بناء الإنتاج الفعلي (Next.js 15.5.23 Production Build):**
   ```text
   npm run build
   ▲ Next.js 15.5.23
   ✓ Compiled successfully in 17.7s
   ✓ Generating static pages (69/69)
   ✓ Finalizing page optimization
   Exit Code: 0
   ```
   - توليد وتحزيم كافة المسارات الـ 69 بنجاح تام وسرعة فائقة.

---

## 3. سجل البنود المحظورة / المعلقة (Blocked Items Register)

| البند | الوصف | السبب الهندسي | الإجراء المطلوب للفك |
| :--- | :--- | :--- | :--- |
| **C-2** | تأكيد Host التحويلات (`fep/v3` أم `api/v2`) | منع أي افتراض لـ Base URL غير مؤكد من التوثيق | موافقة كتابية رسمية من Account Manager في Kashier |
| **D-8** | تفعيل خاصية Transfers Hashing (`kashier-hash`) | التأكد من متطلبات التوقيع على مستوى حساب التاجر | إفادة Account Manager بحالة التفعيل والمفتاح |
| **N-13** | مفتاح الإنتاج `KASHIER_LIVE_ENABLED` | حماية الحساب من أي تسريب حقيقي للأموال قبل الاعتماد النهائي | فتح المفتاح يدوياً بواسطة المالك (George) |
| **القرارات 3-1 إلى 3-4** | قيم الحصص ونسب التقسيم وسياسة الاسترداد | ترك فراغات القواعد لحقنها بعد قرار المالك المباشر | **تم توقيعها واعتمادها رسمياً من George Maurice** |

---

## 4. سجل قرارات المالك المعتمدة رسمياً (Owner Signed Decisions — Section 3)

| القرار | الاختيار المعتمد | ملاحظة وتعديل George | الحالة البرمجية |
| :---: | :--- | :--- | :---: |
| **3-1** | **أساس توزيع الاسترداد** | `NET_AFTER_GATEWAY_FEE` | توزيع الاسترداد على الصافي بعد استقطاع رسوم البوابة | معتمد ومثبت في كود الـ Ledger |
| **3-2** | **سياسة رسوم الاسترداد** | `MERCHANT_ABSORBS` | يتكبدها المالك في البداية لسمعة أفضل | معتمد ومثبت كقيد مدين للمنصة |
| **3-3** | **الـ Entitlement عند الاسترداد** | يبقى 14 يوماً ثم يُلغى | سياسة مرنة/مؤقتة (فترة سماح 14 يوماً) | معتمد في `entitlementService` |
| **3-4** | **الحصص الافتراضية** | مؤلف 85% · منصة 10% · احتياطي 5% | مجموع 100% صارم بدون أي فقد مليمي | معتمد ومثبت في محرك `splitEngine` |
| **3-5** | **فتح Kill Switch** | مُغلق حتى go-live | يُفتح يدوياً عند الإطلاق الفعلي فقط | **مغلق ومحمي في الخادم** |

> **توقيع المالك المعتمد:** George Maurice — 14-09-2026

---

## 5. بروتوكول فحص الاستقرار والتحقق الحي عبر Staging (72h Staging Soak Protocol)

وفقاً لتوجيه المالك الصارم، تم إعداد خطة التحقق الخارجي المستقل لتسليمها خلال المهلة المحددة:

1. **تشغيل بيئة Staging بحساب Kashier Test حقيقي:**
   - ربط عنوان الـ Webhook العام لموقع Staging مع بوابة Kashier.
   - تنفيذ عمليات دفع واسترداد تجريبية حية متنوعة عبر بطاقات الاختبار المعتمدة.
2. **معايير الفحص الأربعة للـ Soak Test:**
   - `0 unpersisted`: لا يوجد أي حدث تم استقباله ولم يُحفظ ذرياً.
   - `0 unacknowledged`: لا يوجد أي حدث لم يتم إرجاع 200 ACK له بعد الحفظ.
   - `0 duplicate effects`: ثبات أثر مالي واحد بالضبط في الدفتر المالي مهما تكرر الويب هوك.
   - `0 unresolved failures`: تصنيف وحل أي فشل شبكة عبر الـ Reconciliation.
3. **التسليمة المستهدفة لإغلاق بوابات G / H / I / J:**
   - مقتطف حقيقي من جدول `financial_ledger` بالقيد المزدوج لعمليات Staging حية.
   - سجلات الـ Webhooks الفعلية من جدول `webhook_events`.
   - إثبات الأثر المالي الواحد.
