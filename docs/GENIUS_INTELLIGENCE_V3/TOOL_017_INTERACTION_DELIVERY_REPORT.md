# Tool 017 — Drug Interaction Checker Safety Hold Report

**Date:** 2026-10-25  
**Status:** `SAFE HOLD — NOT READY AS AN INTERACTION CHECKER`

## Identity

- Tool ID: `mrx.tool.017-drug-interaction`
- Slug: `tool-017-drug-interaction`
- Category: `medical-monitoring`
- Canonical route: `/smarttools/medical-monitoring/tool-017-drug-interaction`
- Legacy route: `/smarttools/tool-017-drug-interaction`

## Changes in this pass

- Removed unsupported keyword-based drug/condition rules, `safe/caution/danger` verdicts, unverified contraindication flags, and medication/dose/supplement recommendations from the calculation contract.
- Engine and strict result schema now return only `NOT_AVAILABLE / NO_VERIFIED_INTERACTION_SOURCE`.
- Replaced the free-text form and previous-result persistence with a bilingual, header-locale-aware unavailable page. It states that no interaction result was produced and that this does not establish safety or absence of interactions.
- Added direct DailyMed/FDA information links and a source/requirements audit at `docs/SMARTTOOLS_TOOL_017_INTERACTION_SOURCES.md`.
- No local measurement/language controls were added. The existing header preference integration remains the only display preference system.
- No user-entered medication or condition data is collected or saved by Tool 017 in this state.

## Important audit finding

Tool 025 (`Drug Interaction Checker Pro`) has an independent heuristic engine that assigns severe/critical scores and recommends stack changes from family, lipophilicity, and target labels. It has not been validated as a data source and is not used by Tool 017. The 017 safe hold does not resolve or validate Tool 025.

The functional checker cannot be completed responsibly without source/data selection, coverage and freshness behavior, verified product matching, and expert review of the rules. The current code deliberately makes that limitation visible instead of presenting guessed results.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Engine/schema and Tool 017 bilingual DOM tests | `PASS` | `npx vitest run lib/tools/engines/tool-017-drug-interaction.test.ts components/tools/tool-017-drug-interaction.dom.test.tsx` — 2 files, 4 tests passed |
| TypeScript | `PASS` | `npx tsc --noEmit` — exit code 0 |
| Focused ESLint | `PASS` | `npx eslint components/tools/tool-017-drug-interaction.tsx components/tools/tool-017-drug-interaction.dom.test.tsx lib/tools/engines/tool-017-drug-interaction.ts lib/tools/engines/tool-017-drug-interaction.test.ts lib/tools/schemas/tool-017-drug-interaction.ts --no-warn-ignored` — exit code 0 |
| `validate-tools` | `PASS` | `npm run validate-tools` — 1 file, 5 tests passed |
| Production build | `NOT RUN` | Pending |
| Route/runtime check | `NOT RUN` | Pending |
| Database writes/migrations | `NOT RUN` | None performed |

## Decision

The unsupported clinical logic has been removed, but this is not a completed interaction checker. Keep the tool clearly marked `NOT_AVAILABLE` until a verified data source and reviewed matching policy are implemented. No database operation, commit, push, or deployment was performed.
