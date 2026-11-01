# SmartTools Tool 142 — Implementation Report

**Status:** `READY FOR REVIEW` (local implementation; no release/deployment authorization implied).
**Identity:** app #142, slug `tool-142-compound-purity-active-yield-estimator` preserved. V7 #244 remains a conceptual match, not an alias.
**Canonical route:** `/smarttools/injection-formulation/tool-142-compound-purity-active-yield-estimator`.
**Legacy route:** `/smarttools/tool-142-compound-purity-active-yield-estimator` permanently redirects to the canonical route.

## Delivered scope and guardrails

- Reframed the feature as bilingual **Mass Arithmetic from a User-Provided Assay**. It computes sample mass × user-entered mass-assay fraction and maps the source-stated uncertainty endpoints through that arithmetic.
- Required sample mass/unit, assay percent, absolute uncertainty in percentage points, the source's uncertainty description, report reference, reported method, and report date. The interval must remain in 0–100%; missing provenance prevents calculation and shows `NOT_AVAILABLE` after numeric values are entered. Incomplete core values show `PARTIAL`; invalid/inconsistent values show `INVALID`.
- Uses canonical grams internally. Display follows the global header's language, RTL, and metric/imperial preferences; no local language or measurement-system toggle was added. Header unit changes convert display values without changing the canonical quantity.
- Results are marked `CALCULATED`, and preserve the source/method/date and uncertainty description. No statistical confidence is inferred and the uncertainty is not recomputed.
- Explicit exclusions: no assay lookup, purity/authenticity/quality/safety certification, product validation, dose, concentration, mixing, reconstitution, formulation, preparation, administration, or manufacturing-yield calculation; no persistence, external request, or automatic cross-tool import.

## Evidence and changed artifacts

- Engine and schema: `lib/tools/engines/tool-142-compound-purity-active-yield-estimator.v6.ts`, `lib/tools/schemas/tool-142-compound-purity-active-yield-estimator.ts`.
- Bilingual UI and tests: `components/tools/tool-142-compound-purity-active-yield-estimator.tsx` and `.test.tsx`.
- Identity, routing and discovery: existing catalog row in `lib/tools/smartToolsCatalog10.ts` changed from planned to implemented; `TOOL_REGISTRY`, `Page`, and legacy route map gained the preserved identity; old flat URL redirect is in `app/smarttools/tool-142-compound-purity-active-yield-estimator/page.tsx`. The existing slug-to-category map keeps the tool in `injection-formulation`.
- Source note: `docs/SMARTTOOLS_TOOL_142_SOURCES.md` uses BIPM/JCGM VIM and NIST materials to explain mass-fraction value/unit provenance and why the tool cannot certify assay quality.
- `docs/SMARTTOOLS_CATALOG_IMPLEMENTATION_PRESENCE_AUDIT.csv` is an earlier presence snapshot; this dated report and the baseline/inventory addenda supersede its old planned/missing Tool 142 row.

## Verification

| Command/check | Result |
|---|---|
| `npx vitest run lib/tools/engines/tool-142-compound-purity-active-yield-estimator.v6.test.ts components/tools/tool-142-compound-purity-active-yield-estimator.test.tsx lib/tools/registry.test.ts lib/legacy-routes.test.ts tests/unit/smartToolsCatalog.test.ts` | **PASS**, exit 0; 5 files / 67 tests. Covers arithmetic, invalid/missing provenance, unit conversion, bilingual RTL, global header preference, route/registry and catalog counts. |
| `npx vitest run lib/tools/engines/tool-142-compound-purity-active-yield-estimator.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/tool-142-compound-purity-active-yield-estimator.v6.ts --coverage.reporter=text` | **PASS**, exit 0; 15 tests; statements 95%, branches 88.88%, functions 100%, lines 94.44%. Existing Vitest 4.1.10 / coverage-v8 4.0.18 mismatch warning remains. |
| `npm run validate-tools` | **PASS**, exit 0; 5/5 tests. |
| `npx tsc --noEmit` | **PASS**, exit 0. |
| Scoped ESLint on Tool 142 runtime files with `--no-ignore` | **PASS**, exit 0; no warnings/errors. The repository ignores the component test file in normal ESLint scope. |
| `npm run build` | **PASS**, exit 0; Next.js 15.5.23 generated **393/393** static pages. Existing Browserslist and `metadataBase` warnings remain. |
| Local HTTP smoke, production server started on 127.0.0.1:3112 then stopped | **PASS**: canonical route HTTP 200 with title/shared header; old flat route HTTP 308 to canonical, final HTTP 200. |
| `.next/server/app-paths-manifest.json` | **PASS**: includes `/smarttools/[category]/[tool]/page` and `/smarttools/tool-142-compound-purity-active-yield-estimator/page`. |
| Browser accessibility, full repository tests, live external source/service | **NOT RUN**: this slice did not perform manual keyboard/screen-reader/contrast/mobile review or rerun the full repository suite. No external assay API exists in the implementation. |

## Current counts and boundary

- Catalog: 166 unique identities, 161 published/non-planned and 5 planned.
- `TOOL_REGISTRY`: 158 unique records. Cross-source sets: 154 intersection, 12 catalog-only, 4 registry-only, 170 union.
- No database query/write, migration, commit, push, or deployment occurred. Build logs only report that Supabase environment configuration is present; no live Supabase request was made.
- Other planned tools #132, #137–139, and #141 remain scope-gated. No claim is made that the 252-tool objective is complete.
