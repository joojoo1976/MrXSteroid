# SmartTools Catalog Audit — Current Working Tree

## Evidence

Command:

```text
npx tsx -e "import {getPublishedCatalogTools} from './lib/tools/smartToolsCatalog4.ts'; ..."
```

Observed result:

- Published catalog entries: **264**
- Unique tool IDs: **264**
- Unique slugs: **264**
- Unique hrefs: **264**
- Canonical numeric slugs not represented by a `tool-###-...` pattern: 001–005, 132, 137–139.

The missing numeric patterns are explained by the checked-out sources:

- **001–005:** legacy tools use non-numeric canonical slugs (for example `multi-ester-pharmacokinetics` and the connected AAS chain), so the numeric-pattern test is not an identity proof.
- **132, 137–139:** these entries exist as `planned` catalog roadmap records and are intentionally excluded from `getPublishedCatalogTools()`. Their current scope includes vision or formulation/reconstitution work and requires a separate safety and scope approval before implementation.

They were not promoted or aliased by assumption. Tools 246–252 are present with distinct registry identities and routes.

## Quality gates

- `npm run validate-tools`: PASS (5/5).
- Focused batch tests through 246–252: PASS (9/9).
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS (502/502 pages).
- SmartTools page, category index, and macro header integration tests: PASS (10/10). The page test was corrected from a stale 162-tool expectation to the current 264 published tools.
- Full suite baseline: `npx vitest run` completed with 4758 passed, 18 failed, and 5 skipped. After updating the stale catalog assertions, `tests/unit/smartToolsCatalog.test.ts` and `app/smarttools/page.test.tsx` pass 8/8. The remaining 16 failures are checkout/payment/admin-contract failures outside the SmartTools catalog scope and remain open for a separate owner-approved remediation.
- Scoped ESLint: `npx eslint lib/tools/smartToolsCatalog4.ts lib/tools/categories.ts app/smarttools/page.test.tsx tests/unit/smartToolsCatalog.test.ts` exits 0 with only the repository's ignored-test-file warnings; no SmartTools source error was reported.
- The full-suite run emits a Vite dynamic-import warning from `lib/tools/loaders.ts`; production build still completes and generates all published routes. Replacing the context import with a generated static loader map would be a separate refactor and was not performed during this audit.
- Component-path audit: `npx tsx -e "...getPublishedCatalogTools...fs.existsSync..."` found **0 missing component files across 264 published entries**.
- Engine/schema/route audit with `.ts`/`.tsx` resolution found **0 missing engines, 0 missing schemas, and 0 malformed `/smarttools/` routes across 264 entries**.
- SmartTools engine suite: `npx vitest run lib/tools/engines` PASS — **164 files, 1000 tests**. The known dynamic-import warning from `lib/tools/loaders.ts` remains non-fatal.
- Accessibility evidence: static component tests cover accessible labels, roles, and no-match messaging in the SmartTools index, but no automated axe/browser audit is present in the checked-out test set; this remains an explicit release gate.
- Category crosswalk audit using `getCategoryOfSlug`: all **264/264** published entries resolve to one of the 15 registered categories; no published tool is uncategorized.

Published counts by category: nutrition 19; ai-nutrition-vision 9; body-composition 10; pharmacokinetics 41; hormonal-health 24; medical-monitoring 73; injection-formulation 8; homebrew-chemistry 8; cycle-management 13; training-recovery 22; contest-prep 3; reproductive-wellbeing 19; platform-ai 7; ai-behavior 6; measurement-conversion 2.

## Remaining release work

## Current focused regression rerun — 2026-10-27

Command:

```text
npx vitest run app/smarttools components/smarttools tests/unit/smartToolsCatalog.test.ts --reporter=dot
```

Result: **PASS**, exit 0; 12 test files and 30 tests passed. Vitest emitted the existing Browserslist data-age notice; it did not fail the run. This is evidence for the SmartTools index, category/page surfaces, search behavior, and catalog assertions only; it does not replace the full-suite triage, browser/accessibility review, or live Supabase/provider checks.

## Current implementation-path gate — 2026-10-27

Read-only `tsx` audit over `getPublishedCatalogTools()` resolved each declared `componentPath`, `enginePath`, and `schemaPath` using the checked-out TypeScript/TSX files and checked that each href begins with `/smarttools/`. Result: **PASS**, exit 0; 264 published entries, 0 missing implementation files, and 0 malformed routes. Planned entries remain excluded from this gate by the published selector.

## Full-suite current rerun — 2026-10-27

Command: `npx vitest run --reporter=dot`.

Result: **FAIL**, exit 1; 502 test files ran, with **4760 passed, 16 failed, and 5 skipped**. The 16 failures are in checkout country routing, Kashier delegation/session mapping, InstaPay preservation, payment-receipts admin contracts, and merchant/product mapping. No failing test is in the SmartTools catalog/index/engine batches; the focused SmartTools regression and validation gates remain green. This supersedes the earlier 4758/18 baseline count while preserving the same scope classification: these failures require separate owner-approved payment/admin remediation.

## Source provenance coverage audit — 2026-10-27

A catalog inspection found 187 of 264 published rows without an inline `bookContext`, `source`, or `sources` field after removing unsupported book attributions from Tools 002 and 006. The repository currently contains 46 directly named `docs/SMARTTOOLS_TOOL_<id>_SOURCES.md` files plus broader batch/source reports, so the absence of an inline field is not by itself proof that a tool has no source evidence. It does establish a documentation gap: provenance is not normalized or machine-verifiable for all published rows. A separate filename/content scan found that 14 of the 46 direct source documents contain an external URL; 32 contain no URL and require content-level review to distinguish explicit “no external source used” boundaries, textual references, and incomplete citations. A filename alone does not establish that a source supports an implemented equation, and a URL alone does not establish that it was checked or is current. The generated crosswalk is an inventory starting point; human review and explicit source-to-claim verification remain necessary before claiming complete Genius V3 evidence coverage.

Reproducible check:

```text
npx tsx -e "import {getPublishedCatalogTools} from './lib/tools/smartToolsCatalog4.ts'; const x=getPublishedCatalogTools(); const missing=x.filter(t=>!('bookContext' in t)&&!('source' in t)&&!('sources' in t)); console.log(JSON.stringify({published:x.length,withoutCatalogSourceMetadata:missing.length},null,2))"
```

Observed output: `{"published":264,"withoutCatalogSourceMetadata":187,"withCatalogSourceMetadata":77}`. Current file scan: 46 directly named tool source documents; 14 contain at least one external URL and 32 do not. These counts are evidence of catalog metadata coverage, not a claim that the 187 tools lack external or batch-level documentation or that the 14 URL-bearing files contain independently verified support for their respective formulas.

The reproducible crosswalk generator `scripts/auditSmartToolsSourceProvenance.ts` writes `docs/SMARTTOOLS_SOURCE_PROVENANCE_CROSSWALK.csv` only when passed `--write`; its default mode prints counts without writing. The current generated file contains **264 rows, 264 unique application IDs, and 0 duplicate IDs**. Evidence classes are deliberately non-verifying: 14 `DIRECT_TOOL_DOC_HAS_URL_UNVERIFIED`, 32 `DIRECT_TOOL_DOC_NO_URL_CONTENT_REVIEW_REQUIRED`, 5 `RANGE_DOC_HAS_URL_UNVERIFIED`, 15 `RANGE_DOC_NO_URL_CONTENT_REVIEW_REQUIRED`, and 198 `NO_NUMBERED_SOURCE_DOCUMENT_FOUND`. The crosswalk explicitly maps legacy Tool #002 (`mrx.tool.aromatization-risk`) and maps numbered Tool #006 to their source documents. The last category does not mean that no catalog or broader documentary context exists; the CSV separately records catalog source metadata and book context. This crosswalk identifies where a human source review is needed; it does not grade quality, confirm currency, or assert that a reference supports an equation.

Reproduce counts without writing:

```text
npx tsx scripts/auditSmartToolsSourceProvenance.ts
```

## Tool 002 scenario-safety and provenance follow-up — 2026-10-27

Tool 002 (`mrx.tool.aromatization-risk`, existing slug and route preserved) was corrected to represent its implementation accurately. The engine no longer exports or applies unsupported E2 reference bands or clinical cutoffs; all result classifications are `not_assessed`, and gynecomastia, water-retention, and E2-crash scores remain unavailable. Medication recommendations were removed. Remaining formula parameters are explicitly documented as unvalidated arithmetic assumptions. The adapter marks confidence as unavailable and emits informational findings without a clinical range. The UI and catalog now describe an unvalidated scenario, explicitly say the dose input is not a recommendation, and do not claim recovery, normalization, or individual prediction.

The catalog's former Chapter 5 attribution was removed because it could not be verified from the available local book files. Three external PubMed links are listed in `SMARTTOOLS_TOOL_002_SOURCES.md`; each is classified as unverified for this model, and none is presented as formula validation. The provenance generator maps the legacy non-numeric tool identity to Tool #002 using an explicit alias evidenced in the engine header. The refreshed crosswalk includes 264 rows / 264 unique IDs; Tool 002 resolves to `SMARTTOOLS_TOOL_002_SOURCES.md` with 3 unverified URLs. After adding the Tool 006 source-boundary document, current global classifications are 14 direct URL-bearing docs (unverified), 32 direct docs without URLs, 5 range docs with URLs (unverified), 15 range docs without URLs, and 198 rows with no numbered source document.

Verification on 2026-10-27: focused Tool 002 regression **PASS**, 6 files / 72 tests; `npm run validate-tools` **PASS**, 1 file / 5 tests; `npx tsc --noEmit` **PASS**; scoped ESLint **PASS**, 0 errors (the optional provenance script was ignored by the configured ESLint pattern); `npm run build` **PASS**, Next.js compiled and generated **502/502 pages**. Existing Browserslist age and `metadataBase` warnings remain. No database or Supabase data writes, migrations, commit, push, or deployment were performed.

## Tool 006 unsafe clinical-rule retirement — 2026-10-27

Tool #006 previously generated risk percentages and AI/DA dose suggestions from undocumented thresholds and compound multipliers. The inputs and output contracts were not supported by source-to-claim evidence, and the existing page did not render these computed results. The numeric risk and dosing engine was removed. The tool now holds manually entered E2/prolactin values and their stated units in current React page state only, validates finite non-negative entries, and explicitly returns `NOT_ASSESSED`; it does not convert units, compare reference intervals, infer risk, or suggest medication. The old catalog chapter attribution was removed. Existing numeric identity and `/smarttools/tool-006-estrogen-prolactin` route are preserved.

`SMARTTOOLS_TOOL_006_SOURCES.md` records the unsupported-rule disposition and confirms that no external source is claimed as validation. Regression tests assert identical `NOT_ASSESSED` output for low and extreme inputs, null dose/risk fields, schema limits, and exact unit preservation. The refreshed crosswalk includes `SMARTTOOLS_TOOL_006_SOURCES.md` as a direct source document with no external URLs; global classifications are now 198 no-numbered-doc, 14 direct URL-bearing (unverified), 32 direct no-URL, 5 range URL-bearing (unverified), and 15 range no-URL.

Verification after the Tool 006 update: focused Tool 002/006 regression **PASS**, 7 files / 74 tests; `npm run validate-tools` **PASS**, 1 file / 5 tests; `npx tsc --noEmit` **PASS** (also checked by the successful Next production build); scoped ESLint **PASS**, 0 errors; `npm run build` **PASS**, **502/502** pages. Existing Browserslist and `metadataBase` warnings remain. The complete repository test suite was not rerun in this follow-up; prior catalog audit records 16 unrelated checkout/payment/admin failures. No external database operations, commits, pushes, or deployment were performed.

## Tools 145–150 focused rerun — 2026-10-27

The focused implementation, API, limiter, memory, trajectory, and command-center suites were rerun together. Result: **PASS**, exit 0; 11 test files and 69 tests passed. The existing Vite dynamic-import-vars warning from `lib/tools/loaders.ts` remains non-fatal. This confirms local behavior and policy boundaries only; it does not verify live NCBI/Upstash services, browser accessibility, or external provider availability.

## Planned/publication boundary gate — 2026-10-27

Command: `npx tsx -e "import {catalogAll,getPublishedCatalogTools} from './lib/tools/smartToolsCatalog4.ts'; ..."`.

Result: **PASS**, exit 0; 268 total catalog rows, 4 planned rows, 264 published rows, and 0 planned rows leaked into the published selector. The planned IDs are 132, 137, 138, and 139. They remain excluded pending separate scope approval.

## Current production build — 2026-10-27

Command: `npm run build`.

Result: **PASS**, exit 0. Next.js compiled successfully and generated **502/502 static pages**. The build emitted the existing Browserslist data-age warning and repeated `metadataBase` warnings; neither stopped generation. Supabase was detected during static generation, but no live database query or write was performed.

The working tree contains extensive pre-existing local changes. Browser/accessibility review, comprehensive-suite failures outside these focused gates, Supabase/profile runtime verification, and the numeric identity crosswalk remain open. No database writes, migrations, commits, pushes, or deployments were performed.

## Global header preference coverage audit — 2026-10-27

The published catalog has **264** entries. A static inspection found **248** component files directly importing `useToolDisplayPreferences`, `usePreferences`, or `useToolI18n`; 16 files were false negatives for direct-hook scanning, not uncovered tools:

- Nine legacy wrappers (`macro`, `bodyfat`, `injection`, `halflife`, `lab`, `genetic`, `cycle`, `timeline`, `master-calculator`) render through `LegacyPageShell`, which reads global `content` and `isRTL` from `usePreferences` (`components/legacy/LegacyPageShell.tsx:11,23`). Each wrapper mounts this shell; representative evidence is `components/tools/macro.tsx:4,9`.
- Seven slug wrappers (`bmr-tdee`, `protein-needs`, `water-intake`, `bmi`, `one-rep-max`, `strength-standards`, `rest-timer`) directly re-export pilot components. Each target pilot imports and calls `useToolDisplayPreferences` (e.g. `components/tools/bmr-tdee.tsx:1`, `components/tools/bmr-tdee-pilot.tsx:6,17`).

This resolves the initial static finding: all 264 published catalog entries have a direct or wrapper-level connection to global language preferences. Measurement preference is consumed only where an entry supports a measurement unit; this count is not a claim that every tool should expose a unit toggle. A source scan found no published tool rendering an in-tool language or measurement-system selector. The remaining `MeasurementToggle` references in `hcg-serm-protocol.tsx` and `tool-010-compound-stack-builder.tsx` import conversion functions only; the standalone `UnitSystemToggle.tsx` has no usage in published tools. All tools continue to inherit header controls from the shared app shell.

Reproducible inspection commands:

```text
npx tsx -e "import {getPublishedCatalogTools} from './lib/tools/smartToolsCatalog4.ts'; console.log(getPublishedCatalogTools().length)"
rg -n "MeasurementToggle|UnitSystemToggle|setUnitSystem\(|setLanguage\(|setLocale\(" components/tools --glob '*.tsx' --glob '!*.test.tsx'
rg -n "usePreferences|LegacyHeader" components/legacy/LegacyPageShell.tsx
```

The catalog count and path-level conclusions above do not replace browser testing of each route, visual behavior when preferences change, or accessibility review; those remain NOT RUN release checks.
