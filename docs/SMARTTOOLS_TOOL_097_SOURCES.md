# SmartTool 097 — Measurement Method and Scope

## Identity

- Numeric ID and slug preserved: `tool-097-hydration-balance-calculator`.
- Display name: **Exercise Sweat-Rate Measurement** / **قياس معدل التعرق أثناء التمرين**.
- Category preserved: `nutrition`.
- Canonical route: `/smarttools/nutrition/tool-097-hydration-balance-calculator`.
- The flat route redirects to the category-first route.

## Calculation and source

The engine uses the sweat-loss and sweat-rate equations in the National Athletic Trainers' Association position statement:

```text
sweat loss (L) = pre-exercise body mass (kg)
               - post-exercise body mass (kg)
               + fluid consumed during exercise (L)
               - urine output during exercise (L)
sweat rate (L/h) = sweat loss (L) / exercise duration (h)
```

Primary source: McDermott BP, et al. *National Athletic Trainers' Association Position Statement: Fluid Replacement for the Physically Active.* Journal of Athletic Training. 2017;52(9):877–895. [Full text on PubMed Central](https://pmc.ncbi.nlm.nih.gov/articles/PMC5634236/). The statement describes substantial individual and environmental variability and cautions against universal fluid recommendations. The tool therefore uses only measurements entered for the exercise session and does not substitute population-average sweat rates.

## Boundaries

- Output is arithmetic (`CALCULATED`) from user-entered measurements; it is not a measured clinical test, statistical estimate, prediction, diagnosis, hydration status, electrolyte assessment, medical risk tier, or fluid-intake recommendation.
- Pre/post body mass, consumed fluid, urine output, and duration are all required. Zero is accepted only when the user enters it explicitly for fluid or urine.
- Invalid, non-finite, out-of-bound, or unit-converted values are rejected by the schema. The numeric bounds are input guards and are not recommendations or physiologic thresholds.
- A negative computed sweat loss returns `NOT_AVAILABLE / NEGATIVE_SWEAT_LOSS`; the engine does not clamp it or emit a negative sweat rate.
- Weight and fluid display units follow the shared header preference. The engine and persisted calculation use canonical kg and L values.
- The result shows the equation, source, and measurement limitations in Arabic and English. No local language or unit controls are added.
- Drafts and explicit dashboard saving use the pre-existing tool logging integrations. This audit/test work does not perform a database write.

## Current-checkout verification — 2026-10-26

| Exact command/check | Result | Evidence |
|---|---|---|
| `npx vitest run ...Tool 097 engine, adapter, header-preference, and legacy-route tests...` | **PASS**, exit 0 | 4 files / 21 tests passed. |
| 091–100 regression batch including Tool 097 | **PASS**, exit 0 | 16 files / 48 tests passed. |
| `npx tsc --noEmit` | **PASS**, exit 0 | No diagnostics after the Tool 097 changes. |
| Scoped ESLint for Tool 097 source and tests | **PASS**, exit 0 | No diagnostics. |
| `npm run validate-tools` | **PASS**, exit 0 | 1 file / 5 tests passed. |
| `npm run build` | **PASS**, exit 0 | Next.js generated 395/395 pages. Existing Browserslist and `metadataBase` warnings remain. |
| Local production smoke test | **PASS** | Category-first route returned HTTP 200 and the flat legacy route returned HTTP 307 to `/smarttools/nutrition/tool-097-hydration-balance-calculator`. |

## Verification status

Focused engine, adapter, component preference, and legacy-route tests are recorded in [`SMARTTOOLS_CATALOG_091_100_RUNTIME_AUDIT.md`](SMARTTOOLS_CATALOG_091_100_RUNTIME_AUDIT.md) after they are run against the current checkout. Live dashboard persistence, visual browser review, and assistive-technology review remain separate verification items.
