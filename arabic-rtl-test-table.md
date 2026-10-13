# Arabic/RTL & English/LTR Actual Test Results — tool-010

**Test Method:** Automated jsdom UI tests via Vitest (Layer-5)
**Test File:** `components/tools/tool-010-compound-stack-builder.dom.test.tsx`
**Date:** 2026-10-13 (updated post-fix)
**Evidence:** RTL/LTR suite 9/9 PASSED — file total 31/31 PASSED (incl. new Metric/Imperial SUITE 4)

---

## RTL/LTR Direction Tests

| Test ID | اللغة | الاتجاه المتوقع | الفعلي على `.pct-timing-tool` | النتيجة | دليل |
|---|---|---|---|---|---|
| TC-AR-01 | العربية (AR) | RTL | `dir="rtl"` | **PASSED** | `container.querySelector('.pct-timing-tool').getAttribute('dir') === 'rtl'` |
| TC-AR-02 | الإنجليزية (EN) | LTR | `dir="ltr"` | **PASSED** | `container.querySelector('.pct-timing-tool').getAttribute('dir') === 'ltr'` |
| TC-AR-07 | العربية (AR) — MeasurementToggle | RTL | `dir="rtl"` على `.measurement-toggle` | **PASSED** | بعد إصلاح `isRtl` prop، التوغل يستقبل الاتجاه الصحيح |

---

## النصوص العربية والإنجليزية

| Test ID | اللغة | العنصر | النص المتوقع | النص الفعلي | النتيجة | دليل |
|---|---|---|---|---|---|---|
| TC-AR-03 | العربية (AR) | `<h2>` العنوان | `بناء حزمة المركبات` | `بناء حزمة المركبات` | **PASSED** | `screen.getByRole('heading', {level:2}).textContent` |
| TC-AR-04 | الإنجليزية (EN) | `<h2>` العنوان | `Compound Stack Builder` | `Compound Stack Builder` | **PASSED** | heading textContent |
| TC-AR-05 | العربية (AR) | زر البناء | `بناء الحزمة` | `بناء الحزمة` | **PASSED** | `getByRole('button', {name:'بناء الحزمة'})` |
| TC-AR-06 | الإنجليزية (EN) | زر البناء | `Build Stack` | `Build Stack` | **PASSED** | `getByRole('button', {name:'Build Stack'})` |
| TC-MI-06 | العربية (AR) | زر متري | `متري (كغ/سم)` | `متري (كغ/سم)` | **PASSED** | بعد إصلاح `isRtl` prop |
| TC-MI-06b | الإنجليزية (EN) | زر متري | `Metric (mg/kg/cm)` | `Metric (mg/kg/cm)` | **PASSED** | textContent assertion |

---

## التبديل بين اللغتين

| Test ID | الحالة | المتوقع | الفعلي | النتيجة | دليل |
|---|---|---|---|---|---|
| TC-AR-08 | تبديل AR→EN عبر `rerender` | المدخلات وحقول النموذج محفوظة | `input[type="text"]` موجود في كلا اللغتين | **PASSED** | DOM persistence check |
| TC-AR-09 | إضافة مركب في AR + تحقق RTL | العنوان وdir="rtl" لا يُفقدان | `h2` عربي + `dir="rtl"` بعد fireEvent.click | **PASSED** | post-interaction assertion |

---

## الهاتف والحاسوب — ملاحظة

> اختبارات jsdom لا تمتلك CSS layout حقيقي (Recharts تُصدر تحذيرات `width=0`).
> التحقق من التخطيط على الهاتف والحاسوب يتطلب اختبارات E2E (Playwright/Cypress).
> **RTL dir والنصوص** تم التحقق منها بالكامل عبر DOM assertions. التخطيط البصري خارج نطاق jsdom.

---

## Vitest Output (Actual Evidence)

```
✓ jsdom  components/tools/tool-010-compound-stack-builder.dom.test.tsx (31 tests) 663ms
  ✓ SUITE 1 — MeasurementToggle pure helpers (6 tests)
  ✓ SUITE 2 — tool-010 Metric/Imperial toggle UI (7 tests: TC-MI-01…06b)
  ✓ SUITE 3 — Arabic RTL / English LTR (9 tests: TC-AR-01…09)
  ✓ SUITE 4 — REAL Metric↔Imperial conversion (9 tests: TC-CV-01…09)
Test Files  1 passed (1) | Tests  31 passed (31)
```

---

## خلل مُكتشَف وأُصلح

| الخلل | الوصف | الإصلاح | Status |
|---|---|---|---|
| `isRtl` prop مفقود | `<MeasurementToggle />` بدون `isRtl` → نصوص إنجليزية دائماً | `<MeasurementToggle isRtl={i18nData.dir === 'rtl'} />` | FIXED |
| الزر غير موصول بالحالة | لا `unitSystem` ولا `onChange` → التبديل لا يغيّر شيئاً | state `unitSystem` + `onChange={setUnitSystem}` (نمط tool #005) | FIXED (2026-10-13) |
| تسميات حقول صلبة بالإنجليزية | Stack name/Family/Weeks/mg/week لا تترجم | مفاتيح i18n جديدة (stack_name, family_label, weeks_label, dose_label, unit_*) | FIXED (2026-10-13) |
| تعرّج النص العربي | `synergy` = "در synergia" | `درجة التوافق` | FIXED (2026-10-13) |

---

**Overall Status: ALL ARABIC/RTL/LTR TESTS — PASSED (9/9; file 31/31)**