# SmartTools Batch 30 — Tools 022, 023, and 030

**Date:** 2026-10-25 (Africa/Cairo)  
**Status:** IMPLEMENTATION UPDATED — MEDICAL MODEL REVIEW REQUIRED  
**Git snapshot:** branch main; HEAD 254ce1299bff227c54809bb7027f9b587d69c143. No staging, commit, push, or deployment.  
**Scope:** bounded engine-contract, UI-validation, measurement-input, and cost-model corrections for Tools 022, 023, and 030. Tool IDs, slugs, categories, and routes were preserved.

## Tool 022 — Half-Life Stacker

### Changes

- Removed the unsupported confidence score, which was generated from compound count, cycle length, and a truthy goal selector rather than calibrated evidence.
- Removed the unused user-goal selector/input; it did not change timing calculations.
- Enforced StackTimingInputSchema in the engine and the UI before calculating; empty compounds and invalid cycle lengths are rejected.
- Corrected the engine/schema ester enum mismatch (cyionate vs cypionate).
- Expanded result-schema schedule capacity to 364 entries, matching the documented maximum of 52 weeks at daily frequency.
- Added bilingual limitation copy stating that the timing outputs are simplified, unvalidated estimates and must not guide injection or PCT timing.
- Added accessible labels to cycle-length and frequency controls and removed the synchronous state-setting effect for saved results.

### Remaining readiness limits

- The existing 2.5 × half-life peak proxy, PCT-start calculation, and 4.5 × half-life washout label remain heuristic and are not clinically validated. The UI now discloses this, but the tool is not ready to be presented as a pharmacokinetic or treatment-timing model.
- The component still inserts a fixed example compound; custom compound editing and sourced half-life data are not implemented.

## Tool 023 — TRT Optimization

- Removed its unused body-weight field and ignored engine property; removed the unsafe any call cast and unused age-decline intermediate.
- No TRT formula was changed. The engine still emits an individualized weekly-dose value from simplified hard-coded rules, while only age is editable and the remaining clinical values are defaults (components/tools/tool-023-trt-optimization.tsx, lib/tools/engines/tool-023-trt-optimization.ts).
- This is a material clinical-readiness blocker. The tool requires a separate evidence and safety review before it can be represented as a functioning TRT optimizer. The contract test does not validate clinical accuracy.

## Tool 030 — Cycle Cost Calculator

- Replaced the fabricated $5/mg pricing formula with direct summation of total costs entered by the user.
- Removed dose/concentration fields from the cost-only item schema and UI, and removed automatic ancillary items.
- Removed the unused goal selector and unsupported cycle/dosage/bulk-purchase/partner-sharing tips.
- Made PCT duration a bilingual, validated 1–26 week input. The estimate still uses assumed rates of $50/week and $60/week, which are explicitly disclosed as illustrative assumptions, not market quotes or medical recommendations.
- Average weekly cost is now calculated across the combined cycle and PCT duration. Currency aggregation is rounded to cents.
- The UI validates with Zod before calculation, validates persisted result data before display, and presents editable bilingual line-item names and user-entered USD costs.

## Changed artifacts

- components/tools/tool-022-half-life-stacker.tsx
- components/tools/tool-022-half-life-stacker.test.tsx
- i18n/tool-022-half-life-stacker.json
- lib/tools/engines/tool-022-half-life-stacker.ts
- lib/tools/engines/tool-022-half-life-stacker.test.ts
- lib/tools/schemas/tool-022-half-life-stacker.ts
- components/tools/tool-023-trt-optimization.tsx
- lib/tools/engines/tool-023-trt-optimization.ts
- lib/tools/engines/tool-023-trt-optimization.test.ts
- components/tools/tool-030-cycle-cost-calculator.tsx
- components/tools/tool-030-cycle-cost-calculator.test.tsx
- i18n/tool-030-cycle-cost-calculator.json
- lib/tools/engines/tool-030-cycle-cost-calculator.ts
- lib/tools/engines/tool-030-cycle-cost-calculator.test.ts
- lib/tools/schemas/tool-030-cycle-cost-calculator.ts
- docs/SMARTTOOLS_HEADER_PREFERENCE_PARITY_AUDIT.md

## Verification evidence

- Updated only Tools 022, 023, and 030 in the master inventory's test-file matrix and focused-status cells; other rows and inventory counts were not changed.
- npx vitest run lib/tools/engines/tool-022-half-life-stacker.test.ts components/tools/tool-022-half-life-stacker.test.tsx lib/tools/engines/tool-023-trt-optimization.test.ts lib/tools/engines/tool-030-cycle-cost-calculator.test.ts components/tools/tool-030-cycle-cost-calculator.test.tsx --reporter=dot — PASS, exit 0; 5 files / 16 tests.
- npm run validate-tools — PASS, exit 0; 1 file / 5 tests.
- npx tsc --noEmit — PASS, exit 0.
- Scoped ESLint for Tool 022 component, engine, and schema — PASS, exit 0, no warnings.
- Tool 022/030 i18n JSON parse check — PASS, exit 0.
- Scoped git diff --check — PASS, exit 0; Git emitted CRLF-to-LF normalization notices for the two touched i18n JSON files.
- Local HEAD requests returned HTTP 200 for:
  - /smarttools/pharmacokinetics/tool-022-half-life-stacker
  - /smarttools/tool-022-half-life-stacker (legacy route)
  - /smarttools/cycle-management/tool-030-cycle-cost-calculator
  - /smarttools/tool-030-cycle-cost-calculator (legacy route)
- Production build, full test suite, and manual browser/accessibility review — NOT RUN.

No database writes, migrations, commits, pushes, or deployment actions were performed. This batch does not establish completion of all 252 tools or clinical validation of Tools 022/023/030.
