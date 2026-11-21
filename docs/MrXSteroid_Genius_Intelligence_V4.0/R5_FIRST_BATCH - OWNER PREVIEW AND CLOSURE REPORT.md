# R5_FIRST_BATCH — OWNER PREVIEW AND CLOSURE REPORT

**Status:** `FIRST BATCH — IMPLEMENTED — AWAITING OWNER PREVIEW`  
**Date:** 2026-11-06  
**Baseline:** `main` / HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0`

## 1. Tools in this batch (browser-verified live)

| # | Tool | Route | Status |
|---|---|---|---|
| 1 | `mrx.tool.bmi` — Body Mass Index | `/smarttools/body-composition/bmi` | Implemented; verified EN + AR/RTL live |
| 2 | `mrx.tool.protein-needs` — Protein Needs Estimate | `/smarttools/nutrition/protein-needs` | Implemented; verified EN + AR/RTL live |
| 3 | `mrx.tool.water-intake` — Daily Water Intake Estimate | `/smarttools/nutrition/water-intake` | Implemented; verified EN + AR/RTL live |

Body Fat and One-Rep Max remain **unselected/deferred**, exactly as authorized to scope (Body Fat requires a separate owner decision on its legacy live route).

## 2. Verification state (as of today, post-consolidation)

| Evidence | Result |
|---|---|
| Full suite reruns (35 files incl. toolchain) | **422/422 pass** |
| Macro closure carry-forward | **328/328** unchanged |
| Tool 1: engine 12/12 · adapter 5/5 · profiles 3+3+3 · pilot 3/3 · V4 7/7 | PASS |
| Tool 2: engine 9/9 · adapter 5/5 · profiles 3+3+3 · pilot 2/2 · V4 7/7 | PASS |
| Tool 3: engine 7/7 · adapter 5/5 · profiles 3+3+3 · pilot 2/2 · V4 7/7 | PASS |
| `validate-tools` | **5/5** |
| `tsc --noEmit` | exit **0** |
| ESLint (production files changed) | **0 errors, 0 warnings** |
| RTL/LTR + Arabic, desktop RTL ordering | **verified in live Chromium (both EN and AR)** |
| 375px actual viewport execution | **NOT RUN** (only CSS rule text verified: `@media (max-width: 40rem)` single-column + `overflow-x: clip`) |
| Screen-reader | **NOT RUN** |
| Full axe | **NOT RUN** |
| Arabic/RTL live rendering | **verified** for BMI, Protein, Water (`dir="rtl"`, `lang="ar"`, `role="status" aria-live="polite"`, localized result text) |

## 3. Live verification transcript (EN + AR)

EN metric smoke (2026-11-05):

- BMI: default inputs 70/175 → click **Calculate** → `BMI: 22.9 (normal weight)`; envelope VALID / `SUFFICIENT_FOR_BASIC_RESULT`; `"2 of 2 required inputs provided."`
- Protein: 70 lb → `Estimated daily protein: 51 g/day`; envelope VALID.
- Water: 70 lb → `Estimated daily intake: 1.13 L/day (1130 mL)`; envelope VALID.

AR RTL smoke (2026-11-06):

- BMI: `dir="rtl" lang="ar"`; `h1` = `مؤشر كتلة الجسم (BMI)`; Calculate → `مؤشر كتلة الجسم: 22.9 (وزن طبيعي)`; meaning disclosures visible (`ماذا تعني هذه النتيجة` / `ما لا تعنيه هذه النتيجة`).
- Protein: `التقدير اليومي للبروتين: 51 g/day`; meaning disclosures present in AR.
- Water: `التقدير اليومي للماء: 1.13 L/day (1130 mL)`; meaning disclosures present in AR.
- All three mean sections + warnings localized; RTL direction honored across shell, inputs and results.

## 4. Known limitations (all three)

1. **375px true execution NOT RUN** — media query rules are CSS-verified only; no viewport emulation in this environment.
2. **Screen-reader NOT RUN**; **axe full audit NOT RUN**.
3. **Site default widget system = Imperial**; results convert display-boundary only; engine receives canonical kg/cm.
4. **Input schemas allow any `weight > 0` with no upper bound** — UI clamps to 30–300 kg / 100–250 cm at the boundary; adapter rejects non-finite values; schema intentionally unchanged.
5. **Evidence records are `documentation`/`NOT_REVIEWED`** — the BMI category cut-offs cite CDC guidance (`https://www.cdc.gov/bmi/`); the Protein/Water SPEC v3 heuristics are application-designed and explicitly NOT externally validated.
6. BMI, Protein, Water are **educational estimates**, not medical advice; unknown conditions, pregnancy or personal variation are not captured.
7. Progressive disclosures are native `<details>`; no animation dependencies were added; Lighthouse structural results are site-wide, not per-pilot.
8. `http://localhost:3000` dev server was running during verification (served from the current working tree); no production/external deploy was performed.

## 5. Acceptance question put to the owner

`FIRST BATCH — IMPLEMENTED — AWAITING OWNER PREVIEW`

To proceed to `FIRST BATCH — OWNER ACCEPTED`, review the three tools in the browser at:
- `http://localhost:3000/smarttools/body-composition/bmi`
- `http://localhost:3000/smarttools/nutrition/protein-needs`
- `http://localhost:3000/smarttools/nutrition/water-intake`

and verify the 375px viewport and screen-reader pass yourself — those two items were **not** executed here.

## 6. Rollback

Per tool: `git checkout -- components/tools/<slug>-pilot.tsx`; delete created files listed in the implementation report; delete `components/tools/<slug>-pilot.v4.test.tsx`. Then `npx vitest run` the tool suite (expect pre-batch counts: BMI 6 totals across engine+pilot, etc.).

Whole batch: reverting the three pilot files + deleting the created V4 adapter/profile/test files returns every tool to its pre-batch behavior; routes/registry/catalog untouched.

## 7. Next gate after owner acceptance (informational only)

- Owner must issue `FIRST BATCH — OWNER ACCEPTED`.
- A second batch proposal (max 3 tools; Body Fat primary rationale: engine 46/46 + existing pilot but published route still serves legacy shell) can be prepared only after that decision and a separate exact authorization.

**Status:** `FIRST BATCH — IMPLEMENTED — AWAITING OWNER PREVIEW`
