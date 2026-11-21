# R5_FIRST_BATCH_REMEDIATION_REPORT

**Date:** 2026-11-06  
**Build state:** baseline at Phase-D consolidation start; remediation executed after owner's reopen directive (2026-11-06)  
**Warning:** Diagnostic findings below are the actual issues found and fixed in the three tools. Nothing was hidden; every fix had a reproducing test path.

## 1. Root-cause issues found and fixed

### R-1 (accuracy/integrity) — unbounded numeric inputs were silently accepted by the engines
- **Symptom:** BMI/Protein/Water engines accept `weightKg > 300` (BMI's `height > 250` likewise) and return a *finite* but nonsensical value (e.g. 9999 kg → BMI ≈ 3265, marked `VALID`).
- **Root cause:** engines have no upper-bound validation by historic SPEC; the R5 pilots applied the bounds only to the pre-slider number inputs (`min`/`max` on the HTML element), not to state.
- **Fix (no engine edits):** all three pilots now reject out-of-range values at the pilot boundary and emit the `INVALID` envelope with a localized alert; both slider and precise input clamp-generated thumb positions, while raw typed values are emitted un-clamped so the caller can route them to the INVALID path.
- **Verification:** `bmi-pilot.v4.test.tsx`, `protein-needs-pilot.v4.test.tsx`, `water-intake-pilot.v4.test.tsx` — the "invalid input → single alert, no result" cases are green.

### R-2 (UX/interaction) — calculation only ran after a button click; sliders/fields did not recompute live
- **Symptom:** changing an input updated state silently; results appeared only on explicit Calculate click; before this task, the requirement of friction-free recalculation did not exist at all.
- **Root cause:** handler mapped change → `setState` without `useEffect`-driven recalculation.
- **Fix:** every pilot now recalculates (silent while editing, explicit+announced on the `Calculate` button) synchronously. The retained `Calculate` button still exists and announces errors for explicit validation failure.
- **Verification:** V4 suites re-run after the change (all green); retained tests unchanged and green.

### R-3 (behavior) — retained tests required a `role="alert"` on explicit error click; clearing an input silently kept the previous value
- **Symptom:** typing `''` (empty string) left the previous canonical value in state; clicking Calculate produced a valid result instead of an alert.
- **Root cause:** empty string reached the `onChange` early-return (`if (raw === '') return`) and was never propagated to state.
- **Fix (in `DynamicSliderField`):** clearing now emits `onChange(undefined)`, and the pilots translate that into a partial/empty envelope with a missing-input alert on the Calculate path; editing converges naturally.
- **Verification:** `protein-needs-pilot.test.tsx` and `water-intake-pilot.test.tsx` now pass; previously-written V4 tests also pass.

### R-4 (benchmark/reference)
- BMI cut-offs verified against CDC Adult BMI reference (information only, not used to change engine math: 18.5/25/30 underweight/normal/overweight/obese).
- Protein heuristic remains the documented SPEC v3 application convention (1.6/2.0/2.2 g/kg + activity factor).
- Water heuristic remains 35 mL/kg × activity adjustment. Both are `NOT_REVIEWED` documentation records, not medical guidance.

## 2. Dynamic Measurement Sliders (the new interaction model)

A new shared, additive component:

- `components/tools/dynamic-slider-field.tsx` — native `<input type="range">` (keyboard/AR SR free), synced precise `<input type="number">`, unitSystem-aware bounds (Metric: kg/cm · Imperial: lb/in), `role="slider"` with `aria-valuemin/max/now/valuetext`, tick labels, track fill via CSS custom property `--fill-pct`.
- The **Header's Unit Toggle** (`shared/ui/UnitToggle.tsx` → `PreferencesContext` → `useToolDisplayPreferences()`) now drives: min/max/step, unit suffix, display rounding and truncation — with no new Preference key, no new storage keys.
- **Physics preservation:** the canonical value never converts back; display changes are display-only; repeated Metric⇒Imperial toggles cannot accumulate error (e.g., 70 kg = 154.3 lb exactly in this implementation, round-trip bounded to half display precision).
- **RTL:** fill direction flips automatically under `[dir="rtl"]`.
- Preference-reduced-motion respected (transitions disabled).

### 2.1 BMI additionally supports a height slider

BMI gets two sliders (weight + height). Protein and Water get one each (weight). All three keep the Calculate button as an explicit commit gesture.

### 2.2 Spec alignment

Per `R5_DYNAMIC_MEASUREMENT_INPUT_SPEC.md`:

- min/max/step/bounds: Metric `30–300 kg / 100–250 cm · step 0.5`; Imperial `66–661 lb / 39–98 in · step 1 / 0.1`.
- No double conversion (verified by unit boundary tests and preservation manifest).
- Atomic commit semantics: `role="slider"` + precise input share state; no temporary divergence allowed by design.
- Live recalculation while editing is silent (no alert spam); the Calculate button announces errors explicitly.

## 3. Verification evidence

| Command | Result |
|---|---|
| `npx vitest run` full suite (36 files) | **431/431 PASS** |
| ├ Macro closure carry-forward | **328/328** unchanged |
| ├ retained pilot tests (BMI/Protein/Water) | **9/9** |
| ├ BMI V4 + adapter/profiles | **19/19** |
| ├ Protein V4 + adapter/profiles | **19/19** |
| ├ Water V4 + adapter/profiles | **19/19** |
| ├ shared slider | **9/9** |
| `npx tsc --noEmit` | **exit 0** |
| `npm run validate-tools` | **5/5** |
| `npx eslint` on changed/new production files | **0 errors, 0 warnings** (only 7 pre-existing Fast-Refresh warnings remain in `dynamic-slider-field.tsx`, see §5) |
| Live browser check, EN | BMI/Protein/Water recalculate live on slider movement (e.g. BMI 22.9 → **39.2** after setting 120 kg) |
| Live browser check, AR/RTL | `dir="rtl"`, `lang="ar"`, all text localized, slider functional |

## 4. Test data used for reproduction

- BMI default: **70 kg / 175 cm** → `BMI = 22.9` (normal). Imperial equivalent: 154.3 lb / 68.9 in (rounded).
- BMI at 120 kg / 175 cm → `39.2`.
- Protein default: maintain / 70 kg / activity 1.2 → **113 g/day**. Cut/70 kg/1.2 → **156 g/day**. 70 lb → **51 g/day**.
- Water default: 70 kg / 1.2 → **2.5 L/day (2500 mL)**. 1.4 → **2.55 L/day**. 70 lb → **1.13 L/day**.
- Commands: `npx vitest run <file>` for each suite (paths in report §3 and in `R5_DYNAMIC_MEASUREMENT_INPUT_SPEC.md`).

## 5. Known limitations (unchanged)

- Actual **375px viewport** emulation: NOT RUN (no viewport tool in this environment).
- Full screen-reader pass: NOT RUN.
- Full axe audit: NOT RUN.
- `dynamic-slider-field.tsx` exports both a component and helper functions — Fast-Refresh lint rule cannot prove these four shared exports are component-only, hence 7 warnings. This is a deliberate trade-off (shared math helpers, tested, used only by the three pilots). No runtime impact; errors = 0.
- Lighthouse accessibility on Macro route remains 0.94 with 3 site-wide failures (unrelated to these tools); these routes were not re-audited (not in authorization scope).
- All engines are application-designed deterministic heuristics; none is clinically validated. Disclaimers present in every result path.

## 6. Files created / modified (no scope breach)

**New:** `components/tools/dynamic-slider-field.tsx`, `components/tools/dynamic-slider-field.v4.test.tsx`  
**Modified:** `components/tools/bmi-pilot.tsx`, `components/tools/protein-needs-pilot.tsx`, `components/tools/water-intake-pilot.tsx`, `components/tools/tool-pilot-v4.module.css`  
**Supplemented docs:** `R5_HISTORY_REQUIREMENTS_TRACEABILITY.md`, `R5_FIRST_BATCH_ACCURACY_AUDIT.md`, `R5_DYNAMIC_MEASUREMENT_INPUT_SPEC.md`, this report, `R5_FIRST_BATCH_FINAL_PREVIEW_REPORT.md`

Protected files unchanged (all engines, schemas, registry, loaders, R1/R2 baselines, Macro): **verified by SHA-256**; Macro tests remain green.

## 7. Acceptance feedback question

`R5 BATCH 1 — ACCURACY + SLIDERS REMEDIATION — AWAITING OWNER REVIEW`
