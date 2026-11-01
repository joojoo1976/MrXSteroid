# SDD ledger — plan: docs/design/tool-036-supreme-v2-design.md (+ docs/tool-036-v2-spec.md)

**Spec:** docs/design/tool-036-supreme-v2-design.md, docs/tool-036-v2-spec.md, docs/evidence/tool-036-evidence-table.md
**Branch:** feat/tool-036-supreme-v2-evidence-based (from adda779)
**Scope (HOLD-LIFT, P1 only):** engine + schema + component LEVEL 1, behind flag OFF. NOT registry/validation.

## Pre-flight
- Existing v1 engine API (`planInjectionSchedule(input)`) is consumed by `components/tools/tool-036-injection-schedule.tsx` and `lib/tools/engines/tool-036-injection-schedule.test.ts`.
- Plan §07 proposed changing `planInjectionSchedule`'s signature. Repo reality: v1 must stay intact so flag-OFF is zero-risk and the 3 existing tests keep passing.
- Flag name: design doc said `NEXT_PUBLIC_TOOL036_V2`; human override says `NEXT_PUBLIC_FT_TOOL036_SUPREME_V2`.

## Rulings
- P1-R1: Keep v1 `planInjectionSchedule` byte-identical; add a **separate** v2 surface `planChronoInjectionSchedule` + helpers in the same engine file. — Why: zero-risk flag-OFF + existing tests stay green. Cost if wrong: a later PR must unify the two entrypoints.
- P1-R2: Use the human-mandated flag name `NEXT_PUBLIC_FT_TOOL036_SUPREME_V2` (not the design doc's). — Cost if wrong: doc/reality mismatch, trivial rename.
- P1-R3: T24 (validation `layered-supreme`) is **deferred** — `lib/tools/validation.ts` is out of P1 scope per the human's allowed-files list. Cost if wrong: coverage gap until the StackStatus PR.
- P1-R4: T25 (bundle/LCP gate) is a build/lighthouse check, not a unit test — reported separately, marked NOT RUN until the build step.
- P1-R5: Tests live in a NEW file `lib/tools/engines/tool-036-chrono.test.ts` (additive) so the existing v1 test file is untouched.
- P1-R6: Work in-place on the feature branch (no separate worktree); `main` pointer untouched, no commits to main. Cost if wrong: no filesystem isolation, but branch isolation holds.

## Progress
- Task 1: Engine v2 (TDD, T01–T23) — IN PROGRESS
