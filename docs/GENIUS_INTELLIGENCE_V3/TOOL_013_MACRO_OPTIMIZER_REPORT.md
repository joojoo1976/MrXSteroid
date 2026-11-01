# Tool 013 — Macro Optimizer Delivery Report

**Date:** 2026-10-25  
**Status:** `READY FOR LOCAL REVIEW` (tool-level scope only)

## Identity and route

- Tool ID: `mrx.tool.013-macro-optimizer`
- Slug: `tool-013-macro-optimizer`
- Canonical route: `/smarttools/nutrition/tool-013-macro-optimizer`
- Legacy route: `/smarttools/tool-013-macro-optimizer`, which redirects to the hierarchical route.
- UI component: `components/tools/tool-013-macro-optimizer.tsx`

## Delivered

- Added strict Zod schemas for required inputs and calculated results. Inputs are finite and bounded: weight 30–200 kg, protein 1–5 g/kg, fat 0.5–2 g/kg, and 1–8 meals.
- Kept the existing arithmetic assumptions visible: `weight × 24 kcal/kg`, then ×1.10 for bulk, ×0.85 for cut, or ×1.00 for maintenance. Activity level is not used and is no longer shown as a calculation input.
- Kept protein and fat as user-selected rates. Carbohydrate grams use the remaining scenario calories after protein (4 kcal/g) and fat (9 kcal/g). The engine refuses an infeasible combination rather than silently setting carbohydrate to zero.
- Corrected per-meal fat calories to 9 kcal/g. Per-meal gram values are rounded up; the UI and result findings disclose this rounding.
- Added bilingual input validation and infeasible-scenario messages, reset action, kg/lb display through the global header preference, and device-local saved-result messaging.
- Added a `ToolOutput` adapter with provenance marked `not_assessed` and `confidence: null`; it publishes only user-input calculations and explicit model assumptions to the shared AI context after the user calculates. It does not introduce AI calculations or recommendations.
- Added source/limit documentation at `docs/SMARTTOOLS_TOOL_013_MACRO_OPTIMIZER_SOURCES.md`.

## Model and known limits

The `weight × 24` baseline, goal multipliers, and selectable rate bounds are inherited assumptions. No external nutrition or energy-requirement source validates these constants. Outputs are editable arithmetic scenarios, not personalized nutrition prescriptions or measured energy needs. Integer gram rounding can cause calculated macro calories to differ slightly from the displayed scenario calorie total.

Saved tool state uses browser `localStorage` (`lib/hooks/useToolState.ts`); no database or Supabase write was made. The AI explanation layer is separate from calculation and depends on a configured model provider for live AI behavior.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Focused engine, adapter, and 012–014 preference UI tests | `PASS` | `npx vitest run lib/tools/engines/tool-013-macro-optimizer.test.ts lib/tools/adapters/tool-013-macro-optimizer.test.ts components/tools/tools-012-014-header-preferences.dom.test.tsx` — 3 files, 16 tests passed after correcting the expected registry tool ID |
| TypeScript | `PASS` | `npx tsc --noEmit` — exit code 0 |
| Focused ESLint | `PASS` | `npx eslint components/tools/tool-013-macro-optimizer.tsx components/tools/ToolOutputSummary.tsx components/tools/tools-012-014-header-preferences.dom.test.tsx lib/tools/engines/tool-013-macro-optimizer.ts lib/tools/engines/tool-013-macro-optimizer.test.ts lib/tools/schemas/tool-013-macro-optimizer.ts lib/tools/adapters/tool-013-macro-optimizer.ts lib/tools/adapters/tool-013-macro-optimizer.test.ts --no-warn-ignored` — exit code 0 |
| `validate-tools` | `PASS` | `npm run validate-tools` — 1 file, 5 tests passed |
| Production build | `PASS` | `npm run build` — exit code 0; Next.js generated 385/385 pages. Existing Browserslist and `metadataBase` warnings remain. |
| Route manifest | `PASS` | `.next/server/app-paths-manifest.json` contains the legacy page and shared `/smarttools/[category]/[tool]/page` route; Tool 013 identity is provided through the published catalog's generated static params. |
| Local HTTP route check | `PASS` | `http://localhost:3001/smarttools/nutrition/tool-013-macro-optimizer` returned HTTP 200; legacy `/smarttools/tool-013-macro-optimizer` returned HTTP 308 to the canonical route. This verifies routing only, not interactive browser behavior. |
| Diff whitespace check | `PASS` | `git diff --check` for the Tool 013 delivery paths — exit code 0; Git emitted a CRLF normalization notice for the existing i18n JSON file. |
| Browser visual/accessibility review | `NOT RUN` | Requires a browser review |
| Database writes/migrations | `NOT RUN` | None performed |

## Review decision

Tool 013 is ready for local code review. Browser visual/accessibility review remains unverified. This report does not claim public deployment, verified live AI, or database integration.
