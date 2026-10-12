# Arabic/RTL & English/LTR Actual Test Results — tool-010

**Test Method:** Automated jsdom UI tests via Vitest (Layer-5)
**Test File:** `components/tools/tool-010-compound-stack-builder.dom.test.tsx`
**Date:** 2026-10-13
**Evidence:** 22/22 tests passed

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
✓ jsdom  components/tools/tool-010-compound-stack-builder.dom.test.tsx (22 tests) 544ms
  ✓ TC-AR-01 root container has dir=rtl in Arabic locale 17ms
  ✓ TC-AR-02 root container has dir=ltr in English locale 7ms
  ✓ TC-AR-03 tool title renders Arabic text in AR locale 209ms
  ✓ TC-AR-04 tool title renders English text in EN locale 23ms
  ✓ TC-AR-05 Build Stack button renders in Arabic in AR locale 43ms
  ✓ TC-AR-06 Build Stack button renders in English in EN locale 24ms
  ✓ TC-AR-07 MeasurementToggle container has dir=rtl in AR locale (isRtl correctly passed) 16ms
  ✓ TC-AR-08 stack name input and synergy result survive in both locales 14ms
  ✓ TC-AR-09 adding compound preserves Arabic heading and RTL dir 42ms
Test Files  1 passed (1) | Tests  22 passed (22)
```

---

## خلل مُكتشَف وأُصلح

| الخلل | الوصف | الإصلاح | Status |
|---|---|---|---|
| `isRtl` prop مفقود | `<MeasurementToggle />` بدون `isRtl` → نصوص إنجليزية دائماً | `<MeasurementToggle isRtl={i18nData.dir === 'rtl'} />` | FIXED |

---

**Overall Status: ALL ARABIC/RTL/LTR TESTS — PASSED**