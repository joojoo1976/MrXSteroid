# Wave 1 Report — Universal Tool Excellence Layer

## Summary
- bodyfat → macro link: implemented (adapter + macro.v6 linkedData param + validation + LinkedDataContext builder + tests).
- 6 tools audited: Body Fat & Macro = Implemented (v6); BMR/TDEE & Protein = Partial (subsumed in macro); Water = Partial (legacy tool-097); BMI = BLOCKED (not in registry).

## Files changed
- lib/tools/adapters/bodyfat-to-macro.ts (new) — adapter, validation, config
- lib/tools/adapters/bodyfat-to-macro.test.ts (new) — 6 tests pass
- lib/tools/engines/macro.v6.ts — calculateMacrosV6 accepts linkedData + linkedValidation
- lib/shared/cross-tool-link.ts — buildLinkedDataContext helper
- lib/shared/tool-identity.ts (new) — Wave 1 identities
- lib/shared/tool-excellence-inventory.ts (new) — Wave 1 inventory
- lib/shared/index.ts — exports

## Evidence
- tsc: 0 new errors in shared/adapters (macro.v6.ts remains 88 pre-existing, unchanged count).
- vitest: bodyfat-to-macro.test.ts 6/6 pass; macro.v6.test.ts 46/46 pass.

## Acceptance matrix
| Tool | Dynamic | DB | Lang/Units | Header/Footer | Prev/Next | Precision | Viz | Tooltips | Cross-tool | Unique UX |
|---|---|---|---|---|---|---|---|---|---|---|
| Body Fat | PASS (v6 engine) | N/A (pure) | partial | N/A (pure) | N/A | PASS (12 tests) | partial | N/A | PASS (→Macro) | partial |
| Macro | PASS (v6 engine) | N/A (pure) | partial | N/A (pure) | N/A | PASS (46 tests) | partial | N/A | PASS (←BodyFat) | partial |
| BMR/TDEE | PARTIAL | — | — | — | — | PARTIAL (subsumed) | — | — | — | — |
| BMI | BLOCKED (not in registry) | — | — | — | — | — | — | — | — | — |
| Water Intake | PARTIAL (legacy) | — | — | — | — | PARTIAL | — | — | PARTIAL | — |
| Protein Needs | PARTIAL (subsumed) | — | — | — | — | PARTIAL | — | — | PARTIAL (→Macro identity) | — |

UI-layer criteria (Header/Footer, Prev/Next, Tooltips, Viz, Unique UX) are N/A at pure-TS layer; require component work outside this scope.

## Remaining gaps
- UI wiring: LinkedDataContext card component, Continue With / Carry Forward buttons in React pages.
- Standalone v6 engines for BMR/TDEE, Water, Protein.
- BMI tool creation (out of scope — not in registry).
- RLS migrations (require schema review).

## BLOCKED items
- BMI: no tool in registry (mrx.tool.bmi absent).
- BMR/TDEE & Protein: no standalone engine; subsumed in macro.v6.
## BMI BLOCKED — precise reason (Part 3)
- Why BLOCKED: No BMI tool entry in `lib/tools/registry.ts` (30 tools only); no engine file, no canonicalPath, no UI component, no tests. `mrx.tool.bmi` is absent from TOOL_REGISTRY. Cannot apply excellence to a non-existent tool. Not a DB/RLS blocker; purely absence of tool.
- Related files: none (engine/UI/tests all absent). Inventory entry at `lib/shared/tool-excellence-inventory.ts:64-77`.
- Required to unblock: create tool entry in registry + engine + UI + tests (out of Wave 1 scope; deferred to M5/tool-creation track).
- Can it be lifted in Wave 1? No — requires new tool creation (registry change), which is a gated action. Keep BLOCKED.



## Registry Status — Wave 1 (updated)
- BMI: Implemented (engine + page + tests); legacy registry wiring deferred (gated).
- BMR/TDEE, Water, Protein: engines created + tests; UI wiring pending.
- Body Fat, Macro: Implemented (v6).

## Wave 1 Final Closure — Carry Forward Page Tests

- vitest config updated: `app/**/*.test.tsx` added to jsdom project include list.
- Test file: `app/smarttools/nutrition/macro/page.test.tsx` — 10/10 PASS.
- Uses `@testing-library/user-event` for realistic interactions.
- validate-tools: 5/5 PASS; validateRegistry: 22/22; engine tests: 48 PASS.

### Carry Forward status: PASS
### Overall Wave 1 status: PASS
- one-rep-max, strength-standards, rest-timer: engines + pages + tests created.
- Wilks/DOTS: deferred (complex standards tables).
