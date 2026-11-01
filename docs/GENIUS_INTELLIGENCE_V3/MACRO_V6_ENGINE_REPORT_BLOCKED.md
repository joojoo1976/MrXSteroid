# MACRO_V6_ENGINE_REPORT — BLOCKED / NOT IMPLEMENTED

> **Historical-state notice (2026-10-25):** This report records an earlier remote-only inspection and its statement that no local Macro v6 implementation existed is no longer current. The checked-out implementation is at `lib/tools/engines/macro.v6.ts`; see the canonical [`docs/MACRO_V6_ENGINE_REPORT.md`](../MACRO_V6_ENGINE_REPORT.md) for the current local audit and verification. The original record is retained for its chronology.

**Status:** `BLOCKED`  
**Gate:** Stage 0 baseline not accepted.  
**Scope:** This report deliberately records non-execution; it is not a claim of Macro v6 implementation or test success.

## Decision

Macro v6 was **not** created or modified because the required local working tree `E:\MrXSteroid-main` and its Git state are not available in the current runtime, and the expected files were not found in the inspected remote repository refs. The V3 PROMPT and ACCEPTANCE_CRITERIA require documenting Git state and pre-existing changes before modifications, and prohibit overwriting user work. Proceeding against a guessed baseline would violate those requirements.

## Required files and current evidence

| File | Status | Evidence |
|---|---|---|
| `lib/engines/macro.v6.ts` | `BLOCKED — NOT FOUND IN CHECKED REMOTE REFS` | Checked `main`, `feat/tool-036-v4-core`, `audit/tool-036-integration`, and `feat/tool-036-supreme-v2-complete`; remote path returned not found. Local presence unknown. |
| `lib/engines/macro.v6.test.ts` | `BLOCKED — NOT FOUND IN CHECKED REMOTE REFS` | Same remote checks; local presence unknown. |
| `lib/engines/bodyfat.v6.ts` | `BLOCKED — NOT FOUND IN CHECKED REMOTE REFS` | Same remote checks; local presence unknown. |
| `lib/engines/future/ml-models.ts` | `BLOCKED — NOT FOUND IN CHECKED REMOTE REFS` | Same remote checks; local presence unknown. |
| `lib/engines/future/vision.ts` | `BLOCKED — NOT FOUND IN CHECKED REMOTE REFS` | Same remote checks; local presence unknown. |

## Checks

| Check | Status | Result |
|---|---|---|
| Local Git baseline / diff | `BLOCKED` | No local checkout available |
| Current TypeScript diagnostics | `NOT RUN` | No dependency-backed project checkout |
| Focused Macro v6 unit tests | `NOT RUN` | Macro v6 test file not found in checked refs |
| Full Vitest suite | `NOT RUN` | No project checkout |
| Lint | `NOT RUN` | No project checkout |
| Registry validation | `NOT RUN` | No project checkout |
| Build | `NOT RUN` | No project checkout |
| Coverage | `NOT RUN` | No supported local coverage command/config was established |
| Git diff review | `BLOCKED` | No local tree to diff; no changes made |

## Planned formula/contract requirements — not yet tested

The implementation, once the baseline is available, must implement and test the supplied SPEC formulas for sex-specific Mifflin-St Jeor BMR, TDEE, activity bounds 1.2–1.9, Bulk/Cut/Maintenance targets, protein/fat/carbohydrate grams, units, dynamic states, What-If scenarios, sensitivity, source classification, warnings, deterministic output, finite-number protection, missing/partial input, unit mismatch, double-conversion prevention, and invalid/impossible output handling.

The requested type contracts include `MacroInputV6`, `MacroOutputV6`, `SuperIntelligenceLayer`, `CrossToolLinkV6`, `ReasoningTraceV6`, `WhatIfScenarioV6`, `SafetyWarningV6`, and `DynamicResultV6`. Test-count target (46+) and coverage target (>80%) remain criteria to evaluate only after inspecting the actual test setup and engine complexity; no coverage percentage is claimed here.

## Next permitted action

Recover/access the owner's current local worktree and record its branch, HEAD, `git status --short`, relevant file presence, and a clean pre-change diff. Then complete Stage 0 and only afterward begin Macro v6. No template work, rollout, database writes, migration, commit, push, or deployment is authorized by this report.
