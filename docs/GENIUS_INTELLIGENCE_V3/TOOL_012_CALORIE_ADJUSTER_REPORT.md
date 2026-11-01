# Tool 012 — Calorie Adjuster Implementation Report

**Date:** 2026-10-25  
**Status:** `READY FOR LOCAL REVIEW` — focused implementation and local quality gates pass. Live-model behavior and manual visual/accessibility review remain unavailable/unverified.

## Changes

- Added a strict Zod input and result contract. The engine now rejects missing, non-finite, out-of-range, fractional-age, and malformed goal/activity inputs instead of silently substituting zero or a default activity multiplier.
- Kept the existing Mifflin–St Jeor arithmetic, activity multipliers, fixed ±500 kcal/day goal offsets, ±100 kcal/day display range, and result recommendations unchanged. The UI now shows height and scenario duration, which were previously hidden defaults.
- Restricted the age input to the 19–78 range represented by the cited study sample. Weight, height, and phase-duration bounds are input validation limits; they are not clinical reference ranges.
- Kept metric/imperial display controlled by the global header. Inputs are normalized to kg/cm before engine calculation; no local unit switch was added.
- Added a standard `ToolOutput` adapter. The AI context includes only TDEE, target, fixed-offset assumptions, model-range limits, and entered duration. It does not forward the engine's recommendation strings. Result sharing remains consent-gated by the shared panel.
- Corrected the save status text to say the result is stored on this device. The existing hook uses localStorage; this change adds no database or Supabase persistence.
- Added bilingual method, limitation, source, and validation text. The source and implementation limits are recorded in [SMARTTOOLS_TOOL_012_CALORIE_ADJUSTER_SOURCES.md](../SMARTTOOLS_TOOL_012_CALORIE_ADJUSTER_SOURCES.md).

## Formula and assumptions

- Resting energy: male `10W + 6.25H − 5A + 5`; female `10W + 6.25H − 5A − 161`, with kg/cm/years.
- TDEE: rounded resting-energy estimate × activity factor (`1.2`, `1.375`, `1.55`, `1.725`, or `1.9`). The factor table is an existing model assumption; it is not validated by the Mifflin paper.
- Goal target: bulk `TDEE + 500`, cut `TDEE − 500`, maintenance `TDEE`. The fixed offsets remain existing assumptions and are labeled as scenarios, not personalized prescriptions.
- Displayed range: fixed `TDEE ± 100`; it is explicitly not a confidence interval.
- Primary equation reference: Mifflin et al., 1990, PMID 2305711, [PubMed](https://pubmed.ncbi.nlm.nih.gov/2305711/). The source sample consisted of healthy adults ages 19–78; it does not establish individual accuracy for every user in that range.

## Verification

- Focused tests: `PASS` — `npx vitest run lib/tools/engines/tool-012-calorie-adjuster.test.ts components/tools/tools-012-014-header-preferences.dom.test.tsx components/smarttools/AIInsightPanel.test.tsx server/ai/explain.test.ts app/api/smarttools/ai/explain/route.test.ts`; 5 files, 33 tests passed.
- Tool 012 tests: 16 passed across engine equation/validation, adapter privacy, global unit conversion, result clearing, and invalid-input UI handling.
- `npx tsc --noEmit`: `PASS`.
- Targeted ESLint for Tool 012, AI panel, and server explanation files: `PASS`, zero warnings/errors.
- `npm run validate-tools`: `PASS`, 5 tests.
- `npm run build`: `PASS`; 385/385 pages generated. Existing warnings remain for stale Browserslist data and unset `metadataBase`.
- Build manifest: the legacy `/smarttools/tool-012-calorie-adjuster` page exists; the live legacy request returned HTTP 308 to `/smarttools/nutrition/tool-012-calorie-adjuster`, which returned HTTP 200. The compiled client bundle includes the source and age-range disclosures.
- Local AI capability endpoint: `configured: false`; live-model response behavior is `NOT AVAILABLE` in this environment.
- Manual browser interaction, visual review, and accessibility review: `NOT RUN`.
- `git diff --check` on the touched implementation and report files: `PASS`.

## Limits

- No live AI model is configured in the local environment. The shared assistant can explain these findings only after the user opts in; the deterministic fallback is not represented as AI.
- Existing recommendation strings remain in the engine result for compatibility, but are not displayed by this component or included in the AI findings.
- No database writes, migrations, Supabase changes, commits, pushes, or deployments were performed.
