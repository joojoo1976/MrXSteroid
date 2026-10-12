# Metric/Imperial Actual Test Results — tool-010

**Test Method:** Automated jsdom UI tests via Vitest (Layer-5)
**Test File:** `components/tools/tool-010-compound-stack-builder.dom.test.tsx`
**Date:** 2026-10-13
**Evidence:** 22/22 tests passed (see output below)

---

## Pure Conversion Unit Tests

| Test ID | المدخل | النظام | المتوقع | الفعلي | النتيجة | دليل |
|---|---|---|---|---|---|---|
| TC-M-00 | 85 kg | Metric→Imperial | 187 lbs | 187 lbs | **PASSED** | `kgToLbs(85) === 187` |
| TC-M-00b | 187 lbs | Imperial→Metric | ~85 kg (±0.5) | 84.8 kg | **PASSED** | `lbsToKg(187) ≈ 85` |
| TC-M-00c | KG_TO_LBS constant | — | 2.20462 | 2.20462 | **PASSED** | constant value verified |
| TC-M-00d | storeMeasurementSystem('imperial') | Imperial | localStorage updated | `setItem('measurementSystem','imperial')` called | **PASSED** | mock spy verified |
| TC-M-00e | getStoredMeasurementSystem() with 'imperial' stored | Imperial | 'imperial' | 'imperial' | **PASSED** | localStorage read verified |
| TC-M-00f | getStoredMeasurementSystem() with empty store | — | 'metric' (default) | 'metric' | **PASSED** | default fallback verified |

---

## UI Toggle Tests (jsdom — component rendered)

| Test ID | الحالة | المدخل | النظام المختار | المتوقع | الفعلي | النتيجة | دليل |
|---|---|---|---|---|---|---|---|
| TC-MI-01 | Metric Input | `localStorage = 'metric'` | Metric | `#metric-btn` has `.active` class | `.active` present | **PASSED** | DOM class assertion |
| TC-MI-02 | Imperial Toggle | Click `#imperial-btn` | Imperial | `#imperial-btn` active + localStorage='imperial' | active + `setItem` called | **PASSED** | DOM + spy assertion |
| TC-MI-03 | Metric Reversion | Click `#metric-btn` from imperial | Metric | `#metric-btn` active + localStorage='metric' | active + `setItem` called | **PASSED** | DOM + spy assertion |
| TC-MI-04 | Cycling Metric→Imperial→Metric | Toggle buttons repeatedly | Both | Correct active button cycles without loss | Correct cycle confirmed | **PASSED** | DOM state machine test |
| TC-MI-05 | Save/Restore Imperial | Switch to imperial + unmount + re-render | Imperial | Imperial restored from localStorage | `#imperial-btn` active on re-render | **PASSED** | unmount+rerender DOM check |
| TC-MI-06 | Label AR locale | AR locale, Metric button | متري — Arabic text | Button text contains 'متري' | 'متري (كغ/سم)' | **PASSED** | textContent assertion |
| TC-MI-06b | Label EN locale | EN locale, Metric button | Metric — English text | Button text contains 'Metric' | 'Metric (mg/kg/cm)' | **PASSED** | textContent assertion |

---

## Bug Found & Fixed During Testing

> **TC-MI-06 initially FAILED** revealing a real bug:
> `<MeasurementToggle />` in tool-010 was rendered **without `isRtl` prop**,
> causing button labels to always show English ('Metric', 'Imperial') regardless of locale.
>
> **Fix applied:** `<MeasurementToggle isRtl={i18nData.dir === 'rtl'} />`
>
> After fix: TC-MI-06 PASSED (Arabic labels show correctly in AR locale).
> Evidence: commit with diff `- <MeasurementToggle /> + <MeasurementToggle isRtl={i18nData.dir === 'rtl'} />`

---

## Vitest Output (Actual Evidence)

```
✓ jsdom  components/tools/tool-010-compound-stack-builder.dom.test.tsx (22 tests) 544ms
  ✓ TC-M-00 kgToLbs converts 85 kg correctly 2ms
  ✓ TC-M-00b lbsToKg converts 187 lbs back within 0.5 kg 1ms
  ✓ TC-M-00c KG_TO_LBS constant is precisely 2.20462 1ms
  ✓ TC-M-00d storeMeasurementSystem persists to localStorage 3ms
  ✓ TC-M-00e getStoredMeasurementSystem reads from localStorage 1ms
  ✓ TC-M-00f getStoredMeasurementSystem defaults to metric when empty 0ms
  ✓ TC-MI-01 renders MeasurementToggle in Metric mode by default 53ms
  ✓ TC-MI-02 switches to Imperial when Imperial button is clicked 18ms
  ✓ TC-MI-03 returns to Metric after clicking Metric button 13ms
  ✓ TC-MI-04 cycling Metric → Imperial → Metric retains correct active state 12ms
  ✓ TC-MI-05 localStorage persists imperial selection across re-renders 21ms
  ✓ TC-MI-06 metric toggle label shows Arabic text in AR locale 8ms
  ✓ TC-MI-06b metric toggle label shows English text in EN locale 11ms
Test Files  1 passed (1) | Tests  22 passed (22)
```

---

**Overall Status: ALL METRIC/IMPERIAL TESTS — PASSED**