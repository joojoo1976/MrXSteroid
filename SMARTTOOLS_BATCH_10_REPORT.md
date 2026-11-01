# SmartTools Batch 10 Report — Tool 111 parity for tools 112–117

Date: 2026-10-24

## Work completed

- Added `useExplicitToolOutput` so each calculation is built from the validated input on a deliberate click; a changed input signature hides stale results.
- Added shared `ToolOutputSummary` for ranked bilingual findings, source, method, quality/confidence, recorded/calculated times and registry-derived previous/next links.
- Added explicit calculate and reset controls to tools 112–117.
- Added metric/imperial toggles and canonical gram/fluid-ounce conversion where the forms expose convertible food weights or fluid rates (112, 114, 116, 117). Grocery packaging (113) already selects `g/kg/lb/oz` per item; supplement dose in tool 115 is free text, so a global conversion would be misleading.
- Replaced fixed adapter confidence values in tools 112–117 with `null` and `not_assessed`; localized their method descriptions in the shared result view.
- Updated `DataProvenance` and tool-log schema to allow nullable confidence and `not_assessed`. Updated health normalization and FHIR mapping so unassessed values remain preliminary and serialize without numeric confidence.
- Added six-adapter provenance/registry assertions and a DOM test covering tool 112's Arabic/English direction, unit control, explicit calculation, stale-result clearing and reset.

## Evidence

- `npx tsc --noEmit`: PASS.
- Focused contracts and tools 112–117 tests: PASS, 22 tests.
- Tool 112 DOM test: PASS, 2 tests.
- `npm run validate-tools`: PASS, 5 tests.
- Targeted ESLint: zero errors; six existing draft-hydration `react-hooks/set-state-in-effect` warnings.
- `npm run build`: PASS; 365 static pages. Build reported existing outdated Browserslist data and missing `metadataBase` warnings.

## Remaining parity evidence and next work

- Browser interaction evidence has not been recorded for tools 113–117; the shared view is exercised through tool 112 only. Tool 117's mixed-unit fluid conversion needs a separate interface review.
- Tool-specific field-level validation messages and full dynamic-result localization still need audit; this batch keeps each engine/schema's existing validation semantics.
- Tools 118–121 still need the same UI/output wiring. Then continue tools 122–125 and onward.
- No AI integration, external data feed, database write, migration, commit, push or deployment was performed.
