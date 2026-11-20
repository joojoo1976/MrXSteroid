# R5_FIRST_BATCH_FINAL_PREVIEW_REPORT

**Date:** 2026-11-06  
**Working tree:** `main` / HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` (ahead 1/behind 1; local uncommitted changes preserved — nothing was staged, committed, merged, pushed or deployed).  
**Status:** `FIRST BATCH — IMPLEMENTED — AWAITING OWNER PREVIEW`  
**Owner decision required:** acceptance of these three tools, or a notes list limited to the current batch.

## 1. The three tools — live verification record

| Tool | Route | Default inputs | Default result |
|---|---|---|---|
| `mrx.tool.bmi` — Body Mass Index | `/smarttools/body-composition/bmi` | 70 kg · 175 cm | `BMI: 22.9 (normal weight)` |
| `mrx.tool.protein-needs` — Protein Needs Estimate | `/smarttools/nutrition/protein-needs` | weight empty · goal maintain · activity 1.2 | select weight to see result; enter 70 kg → `113 g/day` |
| `mrx.tool.water-intake` — Daily Water Intake Estimate | `/smarttools/nutrition/water-intake` | weight empty · activity 1.2 | select weight → `2.5 L/day (2500 mL)` |

### Verified this session

- **Live EN path (Chromium):** routes 200, slider elements present with `role="slider"`, correct `aria-valuemin/max/now/valuetext`, precise fields present; calculation occurs live on slider changes (e.g. BMI 22.9 → **39.2** when the weight slider moves 70→120 kg); results never loaded a page; all three show the "not medical advice" boundary statements.
- **Live AR path (Chromium):** `dir="rtl"`, `lang="ar"` — all result and disclosure copy renders in Arabic, slider works, envelope valid; toggling back to EN restores LTR.
- **EN restored as end-state:** `dir="ltr" lang="en"` verified at the end of the session.
- **Empty input handling:** clearing the precise field must emit `onChange(undefined)` → the tool switches to the partial/empty state without producing a number, and the Calculate button alerts with a single `role="alert"` — verified by tests (and previously by retained tests).
- **Out-of-bounds input:** values outside `30–300 kg` / `100–250 cm` (BMI) route to the `INVALID` envelope, alert is shown, engine is never called with impossible input.

## 2. Test evidence (all re-run after remediation)

| Command | Result |
|---|---|
| Full closure suite | **431/431 (36 suites)** |
| Macro closure carry-forward | **328/328** |
| BMI: engine 12/12 · adapter 5/5 · profiles 3+3+3 · pilot tests 3/3 + V4 7/7 | PASS |
| Protein: engine 9/9 · adapter 5/5 · profiles 3+3+3 · pilot 2/2 + V4 7/7 | PASS |
| Water: engine 7/7 · adapter 5/5 · profiles 3+3+3 · pilot 2/2 + V4 7/7 | PASS |
| Shared slider | **9/9** |
| `npm run validate-tools` | **5/5** |
| `npx tsc --noEmit` | **exit 0** |
| `npx eslint` changed production files | **0 errors, 0 warnings** (see §4 for the 7 Fast-Refresh warnings) |

## 3. Preview links (dev server alive on port 3000)

- `http://localhost:3000/smarttools/body-composition/bmi`
- `http://localhost:3000/smarttools/nutrition/protein-needs`
- `http://localhost:3000/smarttools/nutrition/water-intake`

Interim instructions:
1. Open any link in a fresh tab.
2. Switch metric/imperial from the Header — the slider bounds, labels and result conversions follow without page reloads; the canonical value is preserved.
3. Toggle EN↔AR from the Header — all copy, text direction, and `dir` flip live.
4. Try the slider → watch the result, distribution bars and warnings update instantly.
5. Test edge cases: clearing the weight field; typing `0`; typing `999`; exceeding `250 cm` height in BMI.

## 4. Known limitations and explicit NOT RUN items

| Item | Status | Reason / mitigation |
|---|---|---|
| Actual **375px** viewport execution | **NOT RUN** | No viewport-emulation tool in this environment; single-column CSS rule verified textually (`@media (max-width: 40rem)`, `overflow-x: clip`) only |
| Full **screen-reader** pass | **NOT RUN** | Not available in session; `aria-value*` attributes present and unit-tested in jsdom |
| Full **axe** audit | **NOT RUN** | Lighthouse for BMI route not run; Macro route previously measured 0.94 with 3 site-wide failures (not in scope) |
| Slider **touch** verification (finger drag) | **NOT RUN** | No touch emulation tool in session; native `type="range"` + keyboard arrows work in Chromium |
| Fast-Refresh lint warnings in `dynamic-slider-field.tsx` | **INFO** | 7 warnings only, zero errors; shared export of pure helpers is intentional (tested) |
| External `noise.svg` console 402 | **INFO** | Site asset, unrelated to these tools |
| Magnet: `tsconfig.tsbuildinfo` | artifacts regenerate; not tracked |

## 5. Compatibility & rollback

- **Canonical value stability:** the stored value never changes under unit toggles; conversion happens at display boundary only. Verified by unit/boundary tests and by repeated toggle behavior in browser.
- **Rollback (per tool):**
  1. `git checkout -- components/tools/bmi-pilot.tsx` (or protein/water counterpart), then restore the shared slider component dependency
  2. delete `components/tools/dynamic-slider-field.tsx` / `.v4.test.tsx` (they are only referenced by these three pilots)
  3. re-run `npx vitest run` for the three tools — expect original R5 counts
  4. route/components/registry/catalog remain untouched

## 6. Final gate to the owner

`FIRST BATCH — IMPLEMENTED — AWAITING OWNER PREVIEW`

If you accept these three tools, reply **`FIRST BATCH — OWNER ACCEPTED`**. If you have notes, limit them to BMI, Protein Needs and Water Intake; I will remediate within this batch only, re-run the suites, and re-issue this preview report.

No second batch (Body Fat, One Rep Max) will be started; no Macro/Supabase/Git/Deploy changes were made; no production deployment was performed.
