# MASTER_MACRO_DEVELOPMENT_HISTORY

**Status:** Auxiliary lineage record — not a substitute for the Macro source reports.  
**Purpose:** Single chronological account of everything done to Macro so far, what it cost, who authorized it, what remains open.

## 1. Lineage at a glance

```
Macro Layer-1 (pure arithmetic)            Macro v6 numeric authority        Macro V4 bounded pilot
lib/tools/engines/macro.ts                 lib/tools/engines/macro.v6.ts     V4 adapter + V4 pilot + GeniusToolTemplateV4
        │                                        │                                   │
        └── 22 v6 tests                          └── harness integrity                └── toolchains R1→R5
```

## 2. Chronological development log

| Date | Stage | What was built/verified | Verification anchor |
|---|---|---|---|
| pre-2026-11-01 | Macro `macro.ts` (Layer 1) | `MacroInput`/`MacroOutput`, Mifflin–St Jeor arithmetic, bulk ×1.15 / cut ×0.85 / maintenance ×1.0, protein 2.2 g/kg, fat 0.9 g/kg, carbs residual | `lib/tools/engines/macro.test.ts`-era suites |
| pre-2026-11-01 | Macro v6 | Structure (equationId, assumptions, dynamic completeness, scenarios, warnings, sensitivity) | `macro.v6.test.ts` |
| 2026-11-01 | R1 recovery/architecture | V4 contracts/runtime accepted; Macro referenced as numeric authority | `PHASE_R1_*` reports |
| 2026-11-01..05 | R2 Template/runtime foundation | Template V4; runtime merge with accepted validators; Macro feeds it | `PHASE_R2_*` reports |
| 2026-11-05 08:19 | R3 Macro Pilot proposal (revisions) | Pilot design owner-approved; scope bounded | `PHASE_R3_PILOT_PROPOSAL*.md` |
| 2026-11-05 10:22 | R3 implementation | Macro pilot built with EN/AR, RTL/LTR, imperial/metric, empty/partial/valid/invalid states | `PHASE_R3_MACRO_PILOT_IMPLEMENTATION_REPORT.md` |
| 2026-11-05 11:06 | R3.1 UI remediation | A11y/structure fixes (landmarks, label/hidden status, focus CSS) | `PHASE_R3_1_MACRO_PILOT_UI_REMEDIATION_REPORT.md` |
| 2026-11-05 11:08 | R4 evaluation | Scoped Macro acceptance; accessibility gaps recorded NOT RUN | `PHASE_R4_MACRO_PILOT_EVALUATION_REPORT.md` |
| 2026-11-05 15:58 | Macro V4 capability closure plan, Revision 2.2 | Approved planning baseline; grouped execution authorized | `PHASE_MACRO_V4_CAPABILITY_CLOSURE_PLAN.md` |
| 2026-11-05 16:43 | M4-IN-01 input capability profile | `lib/engines/core/v4/profiles/macro-input-profile.v4.ts` — accepted fields/constraints/provenance/sensitivity metadata | closure report + `macro-input-profile.v4.test.ts` |
| 2026-11-05 17:26..17:53 | Closure Batch A | `macro-input-metadata.v4` (imperial/kg/cm round-trip, provenance policy, timestamp policy, no-consent-default) | closure report §3 |
| 2026-11-05 17:28 | Closure Batch B | `macro-output-policy.v4` (engine/equation identity `6.0.0`, validity invalidation, conditional artefacts) | closure report §4 |
| 2026-11-05 17:30 | Closure Batch C | `macro-evidence-registry.v4` (Mifflin record `mifflin-st-jeor-1990`, assumption rule IDs, SPEC v3 scope; no invented review date) | closure report §5 |
| 2026-11-05 17:30..17:39 | Closure Batch D | Progressive disclosure (3 native `details`), input completeness presentation, meaning/non-meaning boundary copy AR/EN, RTL/LTR | closure report §6 |
| 2026-11-05 17:40..17:54 | Closure Batch E | `328/328` across 16 suites; `validate-tools` 5/5; `tsc` 0; ESLint 0/0 on changed files | `MACRO_V4_GROUPED_CAPABILITY_CLOSURE_EXECUTION_REPORT.md` |
| 2026-11-05 18:07..20:00 | R5 First Batch | BMI, Protein Needs, Water Intake implemented without touching Macro-Freeze | `R5_FIRST_BATCH_*` reports |
| 2026-11-06 | Document consolidation | Unified authorities installed; Macro protected in full; this history authored | Phase E preservation verification |

## 3. Engine and math (unchanged by all V4 work)

- **Mifflin–St Jeor:** male `BMR = 10W + 6.25H − 5A + 5`; female `…− 161`; W=kg, H=cm, A=years.
- **TDEE** = BMR × user-selected activity (1.2–1.9).
- **Phase multipliers** (SPEC v3): bulk ×1.15, cut ×0.85, maintenance ×1.0.
- **Protein** = 2.2 g/kg; **Fat** = 0.9 g/kg; **Carbs** = residual calories / 4 kcal.
- `BMR_round` to whole kcal; TDEE/target rounded; `recomp` deliberately excluded (no approved equation).
- Validation: range checks before arithmetic, non-finite rejection, NaN/Infinity guards, infeasible-distribution rejection, age extrapolation warning outside the 19–78 study sample.

## 4. V4 capability closure — what was added (additive only)

- **Profiles:** `macro-input-profile.v4.ts` (six fields, kg/cm, 1.2–1.9 activity, male/female BMR constants, bulk/cut/maintenance, `personal` sensitivity, `USER_ENTERED`/`MISSING` declaration metadata); `macro-input-metadata.v4.ts` (unit boundary: `KG_PER_LB=0.45359237`, `CM_PER_IN=2.54`; imperial round-trip bounded by half display precision; no double conversion); `macro-output-policy.v4.ts` (identity, validity, conditional artefacts); `macro-evidence-registry.v4.ts`; `macro-pilot-state.v4.ts`; `tool-pilot-state.v4.ts` (shared, used by BMI/Protein/Water too).
- **Pilot (Macro UI):** six bounded inputs (imperial/metric round-trip), deterministic `Recalculate`, staged progress `{provided} of 6`, progressive disclosure for scenarios/What-If/formula/sensitivity, medical-boundary copy, warnings (`TARGET_BELOW_ESTIMATED_BMR`, `AGE_OUTSIDE_ORIGINAL_EQUATION_SAMPLE`, `DETERMINISTIC_CALCULATION`), envelope validation visible in CSS-isolated blocks, RTL/LTR EN/AR with `role="status" aria-live="polite"`.
- **Adapter:** `adapter.macro.v4.ts` — read-only V6→V4; EMPTY/PARTIAL/FULL/INVALID mapping; no numeric recalculation; `calculationId` operation identity, not input fingerprint.
- **Contracts/Runtime:** `contracts.v4.ts` / `runtime.v4.ts` M-free of engine knowledge; `ToolResultEnvelopeV4` envelope policy; contextUsed `[]`; nextActions `[]`; auditRef absent by design.
- **Template:** `lib/templates/genius-tool-template.v4.tsx` (protected), Macro pilot consumes it.

## 5. Test evidence trail (reruns required)

- Macro V6 unit: 81/81. Body Fat v6: 46/46. V4 contracts/runtime/adapter suites green.
- Macro pilot V4 integration/remediation/progressive suites green.
- Closure Batch E: **328/328 across 16 suites** (2026-11-05); 2026-11-06 re-freeze see `MASTER_FILE_PRESERVATION_MANIFEST.md` — the same suites re-ran green after consolidation; please treat any earlier counts as historical.
- `npm run validate-tools`: 5/5. `tsc --noEmit` exit 0. Targeted ESLint clean.

## 6. Owner decisions that shaped Macro

| Decision | Consequence |
|---|---|
| No new engine / no Macro v7, ever, without separate exact authorization | Macro v6 stays sole authority; V4 work is adapter/profile/presentation only |
| M4-IN-01 implemented and preserved | Six-field input profile authored; no changes |
| Safety profile files deferred | `macro-safety-profile.v4.ts` and `.test.ts` **do not exist**; risk ceilings remain in place |
| Grouped execution with documented gaps acceptable | Macro frozen as BOUNDED PILOT; gaps NOT RUN recorded, not converted to PASS |
| Fingerprint/hashing deferred | No input fingerprint exists; `calculationId` is operation identity; hashing remains unauthorized |
| Registry 264 identities preserved | No rename/renumbering/deletion to hit "255"; Body Fat/One Rep Max deferred to future batch |
| Frozen for now | No reopen unless a critical correctness/security/compatibility issue surfaces |

## 7. Open items / pending owner decisions

- Accessibility evidence: real keyboard traversal, 375px execution, screen-reader pass, full axe/deque audit. All **NOT RUN**.
- `SafetyContract` instantiation: `riskClasses`, guards, escalation, audit, user-facing copy — approval-dependent.
- R6 persistence, R7 AI (capability profile + provider), R8 release/deployment — **NOT authorized**.
- Second R5 batch: **not started**; Body Fat (live legacy route) requires a separate owner decision.
- Full V4 claim for Macro requires the accessibility and safety verifications plus owner acceptance.

## 8. What must never be done to Macro without separate explicit authorization

- Editing `macro.v6.ts`/`macro.ts` formulas, constants, rounding, constraints, exports, versions.
- Renaming/moving/deleting its engines, schema, adapters, or V4 profiles.
- Deleting or weakening Macro tests.
- Creating the deferred safety-profile files outside a separate approved change.
- Re-numbering/renumbering tools or changing canonical routes.
- Any persistence, export, cross-tool write, or `auditRef`.
- Claiming production readiness/release while any mandatory acceptance criterion is unmet.
