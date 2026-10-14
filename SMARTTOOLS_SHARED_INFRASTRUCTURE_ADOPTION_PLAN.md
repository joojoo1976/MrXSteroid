# SMARTTOOLS_SHARED_INFRASTRUCTURE_ADOPTION_PLAN.md

> **خطة اعتماد البنية التحتية المشتركة للأدوات الذكية (SmartTools)**
> المرحلة: **C-0** — مراجعة وتوثيق البنية المشتركة المعتمدة من tool-010
> التاريخ: 2026-10-14
> الحالة: **مسودة للمراجعة** — لا يُنفّذ أي شيء قبل الموافقة.

---

## 1. الحالة الحالية للبنية المشتركة (Current Shared Infrastructure)

### 1.1 ما هو موجود فعلاً في المشروع (Already Shared)

| الوحدة | المسار | الحالة | الوصف |
|----------|--------|--------|--------|
| **العقود المشتركة (Layer 0)** | `lib/tools/contracts.ts` | ✅ **مستقر** | عقود بيانات موحدة: `ToolOutput<T>`، `DataProvenance`، `KeyFinding`، إلخ. أنواع أولية: `Locale`، `UnitSystem`، `AccessTier`، `SnapshotType`، ثوابت مشتركة، دوال تحقق (`assertToolOutput`، `formatProvenance`، `byteLength`). |
| **محوّل السجلات (Layer 3)** | `lib/tools/adapters/toolLogAdapter.ts` | ✅ **مستقر** | مسودة محلية (auto-draft)، حفظ للوحة القيادة (commit)، سياق AI (`buildAiContext`)، مفاتيح تخزين موحدة، حقن التخزين/الساعة/الجلب للاختبار. |
| **مكوّن تبديل الوحدات** | `components/tools/MeasurementToggle.tsx` | ✅ **مستقر** | تبديل Metric/Imperial، تحويلات (kg↔lbs، mg↔oz)، حفظ localStorage، دعم RTL/AR، `isRtl` prop. |
| **مساعد الترجمة** | `lib/tools/i18nHelper.ts` | ✅ **مستقر** | `useToolI18n(json)` + `pickToolI18n(json, locale)`، دعم JSON متداخل/مسطح، إرجاع `dir` (rtl/ltr). |
| **حالة الأداة (localStorage)** | `lib/hooks/useToolState.ts` | ✅ **مستقر** | `useUserToolState`، `useUpdateToolState`، `useDebounce`، `useCompounds`، `useGuestState` — localStorage فقط، لا Supabase. |
| **سياق التفضيلات** | `context/PreferencesContext.tsx` | ✅ **مستقر** | لغة، نظام وحدات، ثيم، عملة، RTL، كشف تلقائي. |
| **العقود المشتركة (Layer 0)** | `lib/tools/contracts.ts` | ✅ **مستقر** | `ToolOutput<T>`، `DataProvenance`، `KeyFinding`، `Locale`، `UnitSystem`، `AccessTier`، `SnapshotType`، `DataSource`، `DataQuality`، `FindingSeverity`، ثوابت موحدة، دوال تحقق، `formatProvenance`، `byteLength`. |

### 1.2 ما هو خاص بـ tool-010 (Not Shared — Tool-Specific)

| المكون | المسار | السبب |
|----------|--------|-------|
| **مكوّن الأداة** | `components/tools/tool-010-compound-stack-builder.tsx` | منطق UI خاص ببناء الستاك، حقول الإدخال الخاصة (family، weekly dose، weeks)، عرض نتائج التآزر والأرمتة. |
| **ملف الترجمة** | `i18n/tool-010-compound-stack-builder.json` | مفاتيح خاصة بالأداة: `synergy_tips`، `aromatization`، `results`، `validation`، إلخ. |
| **المخطط (Schema)** | `lib/tools/schemas/tool-010-compound-stack-builder.ts` | Zod schema خاص بمدخلات هذه الأداة. |
| **المحرك (Engine)** | `lib/tools/engines/aromatization-risk.ts` | **محرك مستقل** — لا يُستخرج، كل أداة لها محركها الخاص. |
| **المحوّل الخاص** | `lib/tools/adapters/aromatization-risk.ts` | محوّل Layer 3 خاص بهذه الأداة، يغلف `calculateAromatizationRisk`. |
| **الاختبارات** | `components/tools/tool-010-compound-stack-builder.dom.test.tsx`، `tests/unit/tool-010-aromatization-engine*.test.ts` | اختبارات خاصة بمنطق هذه الأداة. |

---
---

## 2. ما يمكن استخراجه من tool-010 (Extractable from tool-010)

بناءً على تحليل tool-010، العناصر التالية **قابلة للاستخراج** كنمط مشترك للأدوات المستقبلية (#111–#115):

### 2.1 عقد بيانات موحد للمحرك (Engine Data Contract)

**ما في tool-010**: يستخدم `calculateAromatizationRisk(input)` الذي يعيد `AromatizationResult` مع `timeline`، `steadyStateE2`، `peakE2`، `peakRiskZone`، إلخ.

**النمط المقترح**: `EngineContract<Input, Output>` — عقد TypeScript موحد يحدد:
- `Input` shape (Zod schema)
- `Output` shape (TypeScript interface)
- `EngineFn<Input, Output>` — دالة نقية `Input → Output`

### 2.2 عقد بيانات موحد للنتائج (Result Data Contract)

**ما في tool-010**: `AromatizationResult` مع حقول ثنائية اللغة (`risk_factors_en`، `risk_factors_ar`، `ai_explanation_en`، `ai_explanation_ar`، `tier_minimal`، `tier_moderate`، إلخ).

**النمط المقترح**: `BilingualResult<T>` — interface موحد للنتائج ثنائية اللغة:
```typescript
interface BilingualResult<T> {
  tier: string;
  score: number;
  labels: { en: Record<string, string>; ar: Record<string, string> };
  explanations: { en: string; ar: string };
  data: T;
}
```

### 2.3 Schema موحد للتحقق (Validation Schema Pattern)

**ما في tool-010**: `AromatizationRiskInputSchema` مع `.strict()`، رسائل خطأ ثنائية اللغة، `parse`/`tryParse`.

**النمط المقترح**: `ToolSchema<Input>` — pattern موحد:
```typescript
interface ToolSchema<Input> {
  schema: z.ZodSchema<Input>;
  parse: (raw: unknown) => Input;
  tryParse: (raw: unknown) => { ok: true; data: Input } | { ok: false; error: z.ZodError };
}
```

### 2.4 Adapter موحد (Adapter Pattern)

**ما في tool-010**: `lib/tools/adapters/aromatization-risk.ts` — يغلف `calculateAromatizationRisk`، يبني `ToolOutput`، يستخدم `toolLogAdapter`، `requireTool`، `tryParseAromatizationRiskInput`.

**النمط المقترح**: `ToolAdapter<Input, Output, EngineInput, EngineOutput>` — دالة/فئة موحدة:
```typescript
interface ToolAdapter<Input, Output, EngineInput, EngineOutput> {
  engineFn: (input: EngineInput) => EngineOutput;
  schema: ToolSchema<Input>;
  buildOutput: (engineResult: EngineOutput, input: Input) => ToolOutput<Output>;
  buildAiContext?: (output: ToolOutput<Output>) => AiToolContext<Output>;
}
```

### 2.5 خدمة تحويل الوحدات ونظام القياس (Unit System Service)

**ما هو موجود**: `MeasurementToggle.tsx` + ثوابت التحويل في نفس الملف (`KG_TO_LBS`، `MG_PER_OZ`، `kgToLbs`، `lbsToKg`، `mgToOz`، `ozToMg`، `getStoredMeasurementSystem`، `storeMeasurementSystem`).

**ما يمكن استخراجه**: نقل منطق التحويل والثوابت إلى `lib/shared/unitSystem.ts`، والمكوّن يبقى `components/shared/MeasurementToggle.tsx`.

### 2.6 خدمة الترجمة و RTL/LTR (Localization Service)

**ما هو موجود**: `lib/tools/i18nHelper.ts` (`useToolI18n`، `pickToolI18n`) + `context/PreferencesContext.tsx` (لغة، `unitSystem`، `theme`، `isRTL`، `dir`).

**ما يمكن استخراجه**: توحيد كـ `lib/shared/localization.ts` مع:
- `useLocalization()` — hook موحد
- `pickLocalization(json, locale)` — دالة نقية
- ثوابت `Locale`، `UnitSystem`، `Dir` من `lib/tools/contracts.ts`

### 2.7 خدمة الحفظ والاستعادة المحلية (Local Persistence Service)

**ما هو موجود**: `lib/hooks/useToolState.ts` — `useUserToolState`، `useUpdateToolState`، `useDebounce`، `useGuestState` — localStorage فقط.

**ما يمكن استخراجه**: توحيد كـ `lib/shared/persistence.ts` مع:
- `useToolState(toolSlug)` — state خاص بالأداة
- `useToolStateUpdater(toolSlug)` — تحديث مع debounce
- `useToolDraft(toolSlug)` — مسودة (للـ auto-draft)
- مفتاح تخزين موحد: `mrx:tool:{slug}:state`

### 2.8 تصميم خدمة AI الآمنة من الخادم (Server-Side AI Service Design)

**الحالة الحالية**: **غير مفعلة** — `OPENAI_API_KEY` غير متوفر، AI status = `FALLBACK_ONLY` / `BLOCKED`.

**التصميم المقترح** (للتوثيق فقط، لا للتنفيذ الآن):
- API Route: `/api/ai/{tool-slug}` (Edge Function)
- Input: `EngineResult` + `locale` + `unitSystem` + `requestType`
- Output: `AiToolContext` مع `explanation`، `keyInsights`، `dataGaps`، `limitations`، `disclaimer`
- Security: Zod validation، Rate limiting، Timeout (15s)، لا مفاتيح في العميل، لا تخزين
- Status enum: `CONNECTED_AND_TESTED` | `FALLBACK_ONLY` | `NOT_CONFIGURED` | `FAILED`

### 2.9 مكوّنات واجهة قابلة لإعادة الاستخدام (Reusable UI Components)

| المكوّن | المسار الحالي | قابل للاستخراج؟ |
|----------|--------------|-----------------|
| `MeasurementToggle` | `components/tools/MeasurementToggle.tsx` | ✅ **نعم** → `components/shared/MeasurementToggle.tsx` |
| `useToolI18n` / `pickToolI18n` | `lib/tools/i18nHelper.ts` | ✅ **نعم** → `lib/shared/localization.ts` |
| `useToolI18n` pattern | مستخدم في جميع الأدوات | ✅ **نمط موحد** |
| `PreferencesContext` | `context/PreferencesContext.tsx` | ✅ **موجود** — لا يحتاج استخراج |

### 2.10 اختبارات مشتركة قابلة لإعادة الاستخدام (Shared Test Utilities)

| الاختبار | قابل للاستخراج؟ |
|----------|-----------------|
| `expectAllFinite(result)` | ✅ نعم → `lib/shared/test-utils.ts` |
| `expectAllFinite` for engine output | ✅ نعم |
| `roundTripConversion` (mg↔oz، kg↔lbs) | ✅ نعم |
| `renderWithPreferences(locale)` | ✅ نعم → `lib/shared/test-utils.tsx` |
| `expectNoNaNInDOM()` | ✅ نعم |

---

## 3. ما يجب عدم استخراجه (Do Not Extract)

| المكون | السبب |
|----------|-------|
| **محرك Aromatization Risk** (`lib/tools/engines/aromatization-risk.ts`) | محرك مستقل، خاص بالأداة — كل أداة لها محركها الخاص. |
| **المخطط الخاص** (`lib/tools/schemas/tool-010-compound-stack-builder.ts`) | Zod schema خاص بمدخلات هذه الأداة. |
| **المحوّل الخاص** (`lib/tools/adapters/aromatization-risk.ts`) | محوّل Layer 3 خاص بالأداة. |
| **مكوّن الأداة** (`components/tools/tool-010-compound-stack-builder.tsx`) | منطق UI خاص. |
| **ملف الترجمة** (`i18n/tool-010-compound-stack-builder.json`) | مفاتيح خاصة بالأداة. |
| **اختبارات الأداة** | اختبارات خاصة بمنطق هذه الأداة. |

> **قاعدة**: المحرك، المخطط، المحوّل، المكوّن، الترجمة، الاختبارات — **كل أداة لها نسختها الخاصة**. البنية المشتركة فقط ما هو **أداة-لا-يعتمد (tool-agnostic)**.

---
---

## 5. خطة الاختبارات المشتركة (Shared Test Plan)

### 5.1 اختبارات خدمة الوحدات (Unit System Tests)

| الاختبار | الوصف | المعيار |
|----------|--------|---------|
| roundTripConversion | mg oz mg ≤ 0.5mg drift | PASS |
| bidirectionalConversion | kg lbs, mg oz في الاتجاهين | PASS |
| repeatedSwitching | M I M I M لا drift | PASS |
| edgeValues | 0, 2000mg, max oz | PASS |
| decimalPrecision | 6dp للمغ أونصة، 1dp للأونصة مغ | PASS |
| zeroValues | صفر في النظامين، لا NaN | PASS |
| invalidValues | نص، سالب fallback 0 | PASS |
| persistence | localStorage key محفوظ | PASS |
| noDataLoss | M I المدخلات النتائج محفوظة | PASS |
| noNaNInfinity | جميع التبديلات نظيفة | PASS |

## 6. خطة تطبيق البنية على 111-115

### Phase C-1: إنشاء البنية المشتركة
1. إنشاء lib/shared/ مع 8 وحدات
2. نقل MeasurementToggle إلى components/shared/
3. توحيد i18nHelper إلى lib/shared/localization.ts
4. توحيد useToolState إلى lib/shared/persistence.ts
5. توحيد ثوابت التحويل إلى lib/shared/unitSystem.ts

### Phase C-2: اختبارات البنية المشتركة
1. كتابة اختبارات لكل خدمة
2. تشغيل TypeScript + ESLint + validate-tools
3. التأكد من عدم كسر الأدوات الموجودة

### Phase C-3: تطبيق على 111-115
لكل أداة جديدة: تعريف EngineContract، ToolSchema، ToolAdapter، استخدام البنية المشتركة، كتابة اختبارات، توثيق العقد.

## 7. مخاطر التعارض وكيفية تجنبها

| المخاطر | الوصف | التخفيف |
|----------|--------|---------|
| كسر الأدوات الموجودة | تعديل الكود المشترك يكسر الموجود | لا تعدل الموجود، أضف في lib/shared/ |
| تعارض الأسماء | useToolState في مسارين | أسماء مختلفة: useSharedToolState |
| كسر العقود | تغيير contracts.ts | لا تعدل contracts.ts، أضف في lib/shared/contracts.ts |
| تعارض MeasurementToggle | مكونين بنفس الاسم | انقل إلى components/shared/ |
| تعارض i18nHelper | useToolI18n في مسارين | أنشئ useSharedLocalization |
| كسر useToolState | أدوات كثيرة تستخدمه | لا تلمس lib/hooks/useToolState.ts |

القاعدة الذهبية: لا تعدل الكود الموجود — أضف الجديد في lib/shared/ و components/shared/

## 8. معايير الانتقال إلى 111-115

| المعيار | الحالة |
|----------|--------|
| البنية المشتركة مطبقة | lib/shared/ مع 8 وحدات |
| اختبارات البنية تمر | 100% |
| TypeScript نظيف | 0 errors |
| ESLint نظيف | 0 errors |
| validate-tools يمر | 5/5 PASS |
| الأدوات الحالية تعمل | لا كسر في 001-110 |
| التقارير محدثة | مصفوفات وتقارير |
| موافقة صريحة | موافقة الخطة + موافقة البدء |

## 9. الخلاصة والتوصية

### جاهز الآن
- العقود المشتركة (Layer 0) — مستقرة
- محول السجلات (Layer 3) — مستقر
- MeasurementToggle — مستقر
- مساعد الترجمة — مستقر
- حالة الأداة — مستقرة
- سياق التفضيلات — مستقر

### يحتاج استخراج
1. ثوابت التحويل → lib/shared/unitSystem.ts
2. مساعد الترجمة → lib/shared/localization.ts
3. حالة الأداة → lib/shared/persistence.ts
4. عقود موحدة → lib/shared/*-contract.ts
5. MeasurementToggle → components/shared/MeasurementToggle.tsx
6. أدوات اختبار → lib/shared/test-utils.ts

### التوصية
الموافقة على Phase C-0 والبدء باستخراج البنية المشتركة إلى lib/shared/ و components/shared/ مع الحفاظ الكامل على الكود الموجود. الأدوات الجديدة (111-115) ستستخدم البنية المشتركة، والأدوات الحالية تبقى كما هي.

لا تعديل للكود الموجود — فقط إضافة جديدة في lib/shared/ و components/shared/

--- جاهز للمراجعة والموافقة ---
