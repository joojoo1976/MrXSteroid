# Tool 015 — Free Testosterone Calculator Delivery Report

**Date:** 2026-10-25  
**Status:** `READY FOR LOCAL REVIEW` (tool-level scope only)

## Identity

- Tool ID: `mrx.tool.015-shbg-modulator`
- Slug: `tool-015-shbg-modulator`
- Canonical hierarchical route: `/smarttools/hormonal-health/tool-015-shbg-modulator`
- Legacy route: `/smarttools/tool-015-shbg-modulator` redirects through the existing route map.

## Current behavior and changes in this pass

- The current worktree already contains a calculation-only Vermeulen mass-action engine with required positive finite inputs, Arabic/English copy, explicit fixed lab units, and no interpretation or treatment advice. This pass preserves those boundaries.
- Added strict input/result Zod objects and reject unknown input fields; invalid or overflow results are not published.
- Added a registered `ToolOutput` adapter that exposes only the calculated result, method and scope. The adapter marks confidence `null` and data quality `not_assessed` and does not include raw input values in findings.
- Added `ToolOutputSummary` after a successful calculation. The shared assistant context only receives the selected findings/provenance after the panel's explicit result-sharing consent; editing any input clears the result and published context. The calculator itself remains deterministic and does not call an AI model.
- Added direct links to the named calculation paper and the Endocrine Society guideline, with Arabic/English context. The guideline's method-dependent ranges are disclosed; no reference-range classification is added.
- Kept the laboratory units fixed regardless of the header's metric/imperial selection; the active header locale and unit preference are passed into output metadata. There are no tool-local language or unit controls.
- Added source notes at `docs/SMARTTOOLS_TOOL_015_SHBG_SOURCES.md`.

## Safety and evidence limits

The calculation is not a diagnosis. It does not interpret symptoms or assay quality, categorize values, suggest medication or dosage changes, or establish a universal reference range. The selected formula is identified in its provenance; user-entered lab values are not copied into assistant findings. The shared AI provider remains environment-dependent and must not be represented as live unless configured.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Engine, adapter, and Tool 015 DOM tests | `PASS` | `npx vitest run lib/tools/engines/tool-015-shbg-modulator.test.ts lib/tools/adapters/tool-015-shbg-modulator.test.ts components/tools/tool-015-shbg-modulator.dom.test.tsx` — 3 files, 6 tests passed |
| TypeScript | `PASS` | `npx tsc --noEmit` — exit code 0 |
| Focused ESLint | `PASS` | `npx eslint components/tools/tool-015-shbg-modulator.tsx components/tools/tool-015-shbg-modulator.dom.test.tsx components/tools/ToolOutputSummary.tsx lib/tools/engines/tool-015-shbg-modulator.ts lib/tools/engines/tool-015-shbg-modulator.test.ts lib/tools/schemas/tool-015-shbg-modulator.ts lib/tools/adapters/tool-015-shbg-modulator.ts lib/tools/adapters/tool-015-shbg-modulator.test.ts --no-warn-ignored` — exit code 0 |
| `validate-tools` | `PASS` | `npm run validate-tools` — 1 file, 5 tests passed |
| Production build | `PASS` | `npm run build` — exit code 0; Next.js generated 385/385 pages. Existing Browserslist and `metadataBase` warnings remain. |
| Local route checks | `PASS` | Canonical `/smarttools/hormonal-health/tool-015-shbg-modulator` returned HTTP 200; legacy `/smarttools/tool-015-shbg-modulator` returned HTTP 308 to the canonical route. HTML included the tool slug and title and did not contain the removed drug/dose advice strings. |
| Browser visual/accessibility review | `NOT RUN` | Not performed in this pass |
| Database write/migration | `NOT RUN` | None performed |

## Review decision

The code is staged for focused verification. This report does not claim public deployment, live AI execution, clinical validation, or database persistence.
