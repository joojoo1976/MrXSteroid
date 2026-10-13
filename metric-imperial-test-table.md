# Metric/Imperial Actual Test Results — tool-010

**Test Method:** Automated jsdom UI tests via Vitest (Layer-5) + Node engine tests
**Test Files:**
- `components/tools/tool-010-compound-stack-builder.dom.test.tsx` (SUITE 1+2 toggle behaviour, SUITE 4 REAL conversion)
- `tests/unit/tool-010-aromatization-engine*.test.ts` (engine unchanged, still green)

**Last run:** 2026-10-13 (post-fix) — **DOM: 31/31 PASSED · Engine: 51/51 PASSED · tsc: 0 errors · ESLint: 0 errors · validate-tools: 5/5**

---

## 1. Root Cause of the Reported Browser FAIL (2026-10-13)

The user's live test at `/smarttools/cycle-management/tool-010-compound-stack-builder` reported: toggle renders but "does nothing". Verified root cause chain (code evidence):

| # | Defect | Evidence |
|---|--------|----------|
| 1 | **Toggle state not connected.** `<MeasurementToggle isRtl={…} />` (old line 257) had **no `unitSystem` prop and no `onChange`** — the component never read the toggle's state; only the button highlight + a private `localStorage['measurementSystem']` key changed. | `components/tools/tool-010-compound-stack-builder.tsx` (pre-fix L257) |
| 2 | **No unit-aware rendering.** Dose input label hard-coded `mg/week:`, results hard-coded `… {totalWeekly} mg/week` — nothing could change even if state had been connected. | same file (pre-fix L269–L281) |
| 3 | **No value conversion anywhere.** Component never called `kgToLbs`/`lbsToKg`/any converter; the previous gate only asserted `.active` classes + localStorage, never values. | prior `dom.test.tsx` SUITE 2 |
| 4 | **i18n gaps** feeding "texts never change": form labels hard-coded English; AR synergy label corrupted (`"در synergia"`). | `i18n/tool-010-compound-stack-builder.json` (pre-fix) |

**Not the cause:** `MeasurementToggle.tsx` itself (works correctly, same component powers tool #005 `hcg-serm-protocol` with the controlled pattern) and `use-units`/`PreferencesContext` (tool-010 keeps a component-local unit state, matching the established in-repo pattern of tool #005).

## 2. The Fix (implemented)

Following the **established controlled pattern** of `hcg-serm-protocol.tsx` (tool #005):

1. Component state: `const [unitSystem, setUnitSystem] = useState<MeasurementSystem>(() => getStoredMeasurementSystem());` — canonical value stays in **mg** internally (mg-canonical ⇒ toggling can never lose or corrupt data).
2. Toggle wired: `<MeasurementToggle unitSystem={unitSystem} onChange={setUnitSystem} isRtl={…} />`.
3. Dose input is now unit-aware: metric `mg/week` ↔ imperial `oz/week` (mass ounce, exact 1 oz = 28 349.523125 mg; new pure helpers `mgToOz`/`ozToMg` exported from `MeasurementToggle.tsx`). Imperial editing converts back to canonical mg on input.
4. Results total converts live: `300 mg/week` ↔ `0.0106 oz/week` — derived from state each render ⇒ no stale values possible.
5. Labels/texts localized + unit-aware via i18n keys (`dose_label`, `unit_mg_week`, `unit_oz_week`, `compounds_count`, …); corrupted AR `synergy` label fixed → `درجة التوافق`.
6. Guards: non-finite/empty dose → 0 (never NaN/Infinity); round-trips within 0.5 mg; `max`/`step` follow the active system.

## 3. Pure Conversion Unit Tests

| Test ID | المدخل | النظام | المتوقع | الفعلي | النتيجة | دليل |
|---|---|---|---|---|---|---|
| TC-M-00 | 85 kg | Metric→Imperial | 187 lbs | 187 lbs | **PASSED** | `kgToLbs(85) === 187` |
| TC-M-00b | 187 lbs | Imperial→Metric | ~85 kg (±0.5) | 84.8 kg | **PASSED** | `lbsToKg(187) ≈ 85` |
| TC-M-00c | KG_TO_LBS constant | — | 2.20462 | 2.20462 | **PASSED** | constant value verified |
| TC-M-00d | storeMeasurementSystem('imperial') | Imperial | localStorage updated | `setItem('measurementSystem','imperial')` called | **PASSED** | mock spy verified |
| TC-M-00e | getStoredMeasurementSystem() with 'imperial' stored | Imperial | 'imperial' | 'imperial' | **PASSED** | localStorage read verified |
| TC-M-00f | getStoredMeasurementSystem() with empty store | — | 'metric' (default) | 'metric' | **PASSED** | default fallback verified |
| TC-CV-09 (new) | mg↔oz round-trip 1…2000 mg + `MG_PER_OZ` | Both | Δ ≤ 0.5 mg; constant exact | Δ ≤ 0.5 mg | **PASSED** | pure helper loop |

## 4. UI Toggle Tests (jsdom — component rendered)

| Test ID | الحالة | المدخل | النظام المختار | المتوقع | الفعلي | النتيجة | دليل |
|---|---|---|---|---|---|---|---|
| TC-MI-01 | Metric Input | `localStorage = 'metric'` | Metric | `#metric-btn` has `.active` class | `.active` present | **PASSED** | DOM class assertion |
| TC-MI-02 | Imperial Toggle | Click `#imperial-btn` | Imperial | `#imperial-btn` active + localStorage='imperial' | active + `setItem` called | **PASSED** | DOM + spy assertion |
| TC-MI-03 | Metric Reversion | Click `#metric-btn` from imperial | Metric | `#metric-btn` active + localStorage='metric' | active + `setItem` called | **PASSED** | DOM + spy assertion |
| TC-MI-04 | Cycling Metric→Imperial→Metric | Toggle buttons repeatedly | Both | Correct active button cycles without loss | Correct cycle confirmed | **PASSED** | DOM state machine test |
| TC-MI-05 | Save/Restore Imperial | Switch to imperial + unmount + re-render | Imperial | Imperial restored from localStorage | `#imperial-btn` active on re-render | **PASSED** | unmount+rerender DOM check |
| TC-MI-06 | Label AR locale | AR locale, Metric button | متري — Arabic text | Button text contains 'متري' | 'متري (كغ/سم)' | **PASSED** | textContent assertion |
| TC-MI-06b | Label EN locale | EN locale, Metric button | Metric — English text | Button text contains 'Metric' | 'Metric (mg/kg/cm)' | **PASSED** | textContent assertion |

## 5. REAL Value-Conversion UI Tests (new SUITE 4 — the regression the user caught)

| Test ID | الحالة | المتوقع | الفعلي | النتيجة |
|---|---|---|---|---|
| TC-CV-01 | Metric default | Dose `300` + label `mg/week` | `300` + `mg/week` | **PASSED** |
| TC-CV-02 | Metric→Imperial | Dose VALUE becomes `0.010582`, unit `oz/week`, no `mg/week` remains | `0.010582` + `oz/week` | **PASSED** |
| TC-CV-03 | Imperial→Metric | Exact original `300` restored, `mg/week` back | `300` restored | **PASSED** |
| TC-CV-04 | M→I→M→I→M cycling | Canonical dose never drifts; ends 'metric' in storage | `300`/`0.010582` stable ×2 cycles | **PASSED** |
| TC-CV-05 | Edit `0.02` oz → switch Metric | Canonical 567 mg written back | `567` | **PASSED** |
| TC-CV-06 | Build stack then toggle | Results `300 mg/week` ↔ `0.0106 oz/week`; no stale metric text | both directions verified | **PASSED** |
| TC-CV-07 | Empty/garbage dose | `0` shown; **no NaN** in either system | `0`, NaN-free | **PASSED** |
| TC-CV-08 | AR locale units | `ملغ/أسبوع` ↔ `أونصة/أسبوع` | both Arabic labels verified | **PASSED** |

## 6. Vitest Output (Actual Evidence, 2026-10-13 post-fix)

```
✓ jsdom  components/tools/tool-010-compound-stack-builder.dom.test.tsx (31 tests) 663ms
 Test Files  1 passed (1)
      Tests  31 passed (31)

✓ node  tests/unit/tool-010-aromatization-engine.test.ts        (11 tests)
✓ node  tests/unit/tool-010-aromatization-engine-part1.test.ts  (11 tests)
✓ node  tests/unit/tool-010-aromatization-engine-part2.test.ts  (15 tests)
✓ node  tests/unit/tool-010-aromatization-engine-part3.test.ts  (14 tests)
✓ node  tests/unit/validateTools.test.ts                         (5 tests)
 Test Files  5 passed (5)
      Tests  56 passed (56)

npx tsc --noEmit → exit 0, no output (0 errors)
npx eslint <tool-010 files> → 0 errors (14 pre-existing warnings only)
```

---

**Overall Status: METRIC/IMPERIAL — REAL CONVERSION IMPLEMENTED AND PASSING (31/31).**

> ملاحظة صراحة: اختبارات jsdom تغطي السلوك والمنطق والتلاعب بالقيم (fireEvent على المكوّن الفعلي). الاختبار البصري النهائي في متصفح حقيقي يبقى مسؤولية المراجعة اليدوية — راجع تعليمات إعادة الاختبار في التقرير النهائي.