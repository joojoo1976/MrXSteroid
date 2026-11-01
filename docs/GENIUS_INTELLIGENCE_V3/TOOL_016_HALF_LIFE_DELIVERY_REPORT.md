# Tool 016 — Half-Life Scenario Calculator Delivery Report

**Date:** 2026-10-25  
**Status:** `READY FOR LOCAL REVIEW` (registered half-life route only)

## Identity and route evidence

- Registered ID: `mrx.tool.016-half-life-calculator`
- Registered slug: `tool-016-half-life-calculator`
- Hierarchical category mapping: `pharmacokinetics`
- Canonical route: `/smarttools/pharmacokinetics/tool-016-half-life-calculator`
- Flat legacy route remains at `/smarttools/tool-016-half-life-calculator` and redirects using the existing category mapping.

## Changes

- Replaced the unsupported multi-compound optimizer with a deterministic independent-scenario calculator based on user-supplied half-life, source, and remaining fraction.
- Added strict schemas: 1–12 scenarios; nonempty name and source; finite half-life above zero and no greater than 1,000,000 days; finite remaining fraction strictly between 0% and 100%.
- Calculation: `elapsed_days = half_life_days × ln(remaining_percent / 100) / ln(0.5)`. Each scenario is calculated independently; no combined concentration or bottleneck is inferred.
- Removed body-fat adjustment, organ-health adjustment, confidence score, compound library defaults, dose weighting, and all drug/PCT recommendations. Results explicitly state the single-exponential assumptions and mathematical-only scope.
- Added bilingual AR/EN UI using shared header language and direction; no local preference control. User-entered half-life remains in days, an independent PK unit, and is not converted by mass/length preferences.
- Added a registered structured-output adapter for the shared assistant. Findings use scenario indices and numeric outputs only; user-entered substance names and source text are omitted. The shared panel still requires explicit opt-in before sending selected findings.
- Removed the former persistent saved result behavior; calculation inputs and result are session-local in component state.
- Added source and identity-audit documentation at `docs/SMARTTOOLS_TOOL_016_HALF_LIFE_SOURCES.md`.

## Identity issue requiring owner review

The working tree also contains `tool-016-libido-calculator` UI/engine files, but this slug is absent from the current catalog and registry. The same numeric ID is therefore used by a second local artifact that contains hormone/compound scores and medication adjustment recommendations. In addition, the catalog assigns `mrx.tool.016-half-life`, while the registry assigns `mrx.tool.016-half-life-calculator` for the half-life slug. This batch preserves all existing IDs and routes; it does not merge or renumber them. The identity discrepancies need separate owner review, and the second artifact is not counted as a registered or completed tool here.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Engine, adapter, and Tool 016 DOM tests | `PASS` | `npx vitest run lib/tools/engines/tool-016-half-life-calculator.test.ts lib/tools/adapters/tool-016-half-life-calculator.test.ts components/tools/tool-016-half-life-calculator.dom.test.tsx` — 3 files, 14 tests passed |
| TypeScript | `PASS` | `npx tsc --noEmit` — exit code 0 |
| Focused ESLint | `PASS` | `npx eslint components/tools/tool-016-half-life-calculator.tsx components/tools/tool-016-half-life-calculator.dom.test.tsx components/tools/ToolOutputSummary.tsx lib/tools/engines/tool-016-half-life-calculator.ts lib/tools/engines/tool-016-half-life-calculator.test.ts lib/tools/schemas/tool-016-half-life-calculator.ts lib/tools/adapters/tool-016-half-life-calculator.ts lib/tools/adapters/tool-016-half-life-calculator.test.ts --no-warn-ignored` — exit code 0 |
| `validate-tools` | `PASS` | `npm run validate-tools` — 1 file, 5 tests passed |
| Production build | `PASS` | `npm run build` — exit code 0; Next.js generated 385/385 pages. Existing Browserslist and `metadataBase` warnings remain. |
| Route/runtime check | `PASS` | Fresh `next start -p 3002`: canonical URL returned HTTP 200 and contained the scenario heading, required source field, calculate action and scope disclosure; old route returned HTTP 308 to canonical. App-path manifest includes both the legacy page and shared hierarchical route. |
| Diff whitespace check | `PASS` | `git diff --check` on tracked Tool 016 component/i18n edits — exit code 0. New files were checked by ESLint/TypeScript and focused tests. |
| Supabase/database | `NOT RUN` | Build reported Supabase configured; no database query, write, migration, or schema change was performed. |
| Database writes/migrations | `NOT RUN` | None performed |

## AI and deployment limits

This integration does not calculate with AI. The local shared AI provider was previously observed as unconfigured; confirm current capability before describing any live AI response. No database operation, commit, push, or deployment is included.
