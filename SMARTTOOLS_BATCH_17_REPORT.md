# SmartTools Batch 17 Report — Tool 111 parity for tools 143–144

Date: 2026-10-24

Status: `IMPLEMENTED — focused engine/DOM tests, catalog/route validation, TypeScript, targeted ESLint and production build pass.`

## Tool 144 — General Mass, Volume & Density Calculator

- Preserved tool ID and slug; renamed the display title and moved its category from Injection & Formulation to the new Measurement & Conversion category.
- Implemented `ρ = m / V`, `m = ρ × V`, and `V = m / ρ` with supported mass, volume and density units normalized to g, mL and g/mL.
- Density entered by the user requires a source and measurement temperature. A calculated density reports its measured temperature and states that it was derived from entered mass and volume.
- Inputs and results must be positive and finite, within bounds, and dimensionally compatible. Zero division is rejected.
- Excludes substance data, mixtures, concentration, solubility, purity, yield, dose, preparation and sterilization.

## Tool 143 — Product Storage Label & Temperature Record Checker

- Preserved tool ID and slug; replaced the estimator promise with an educational comparison against a user-selected DailyMed product label.
- The UI opens a DailyMed product search and records its open time. The user enters the selected label URL or Set ID, product state, label temperature interval and observed temperature interval.
- Engine accepts only an HTTPS DailyMed `drugInfo.cfm?setid=...` label reference or valid UUID Set ID. It never assumes a range; incomplete product/source/ranges return `not_evaluable`.
- Out-of-range readings instruct the user to follow the product's storage directions and contact a pharmacist or manufacturer. In-range readings only report interval comparison.
- DailyMed version limitations are shown in the UI. No potency, degradation, shelf-life, safety, sterility or suitability determination is made. Search metadata is held in the current calculation, with no server persistence.

## Architecture and governance

- Added bilingual forms, V6 engines, schemas, ToolOutput adapters, provenance, upfront scope findings, registry/Page identities, canonical routes and flat redirects.
- Added the `measurement-conversion` category. Tool 144's former `/smarttools/injection-formulation/...` category path redirects to its new canonical route.
- Added NIST/BIPM and FDA/DailyMed sources, the source register, parity roadmap entries and inventory rows.
- No database writes, migrations, commits, pushes or deployment were performed.

## Verification

| Check | Status | Evidence |
|---|---|---|
| Focused engine, DOM, catalog, registry and route tests | `PASS` | 51 tests across 7 files. |
| Production catalog validator | `PASS` | `npm run validate-tools` — 5 tests passed. |
| TypeScript | `PASS` | `npx tsc --noEmit` — exit 0. |
| Targeted ESLint | `PASS` | Changed runtime, category and registry files — exit 0. |
| Production build / manifest | `PASS` | `npm run build` — compiled, type-checked and generated 381/381 static pages. New canonical and redirect page entries are in the build manifest. Existing Browserslist and missing `metadataBase` warnings remain. |
| Manual browser/accessibility review | `NOT RUN` | DOM tests do not establish real-browser or assistive-technology behavior. |

## Global measurement preference follow-up — 2026-10-25

- Tool 143 now accepts and displays temperatures in °C or °F according to the global header preference, converts to canonical °C for comparison, and formats the result in the selected display unit. The comparison rule and all safety limits are unchanged.
- Tool 144 now follows the global measurement preference for defaults while preserving entered quantities on header-system changes. It supports sourced SI and U.S. customary mass, volume, and density units; its formulas still normalize through g, mL, and g/mL. Conversion factors are documented against NIST.
- Focused tests: `npx vitest run lib/tools/engines/tool-143-storage-stability-thermal-degradation-estimator.v6.test.ts lib/tools/engines/tool-144-homebrew-chemistry-calculator.v6.test.ts components/tools/tool-143-storage-stability-thermal-degradation-estimator.test.tsx components/tools/tool-144-homebrew-chemistry-calculator.test.tsx` — 4 files, 13/13 tests passed.
- `npm run validate-tools`: 5/5 passed. `npx tsc --noEmit`: exit 0. Targeted ESLint on the changed runtime files: exit 0 with no warnings.
- `npm run build`: exit 0; 385/385 static pages generated. Local production routes for 143 and 144 returned HTTP 200 with the shared header/footer, and both canonical paths appear in `.next/server/app-paths-manifest.json`.
- DailyMed search still requires the user to select and verify the product label; no automated product/label match is claimed. No database writes, migrations, staging, commit, push, or deployment were performed. Manual accessibility review remains `NOT RUN`.
