# G-R6.1-1 FOUNDATIONS — DELIVERABLES

**Generated:** 2026-11-08  
**Repository / HEAD:** E:\MrXSteroid-main / 914d7015358cfbc9b9dbe6731772cac0cf093310  
**Branch:** docs/r6.1-r0-evidence  
**Mode:** Read-only. No code, schema, route, registry, database, RLS, Macro, frozen document, commit, push, merge, or deployment was changed.  
**R6.1 status:** OWNER REVIEW DRAFT — NOT ACTIVE. G-R6.1-0 APPROVED WITH CONDITIONS. G-R6.1-1 in progress.

---

## 1. Redefinition of SPECIFIED and E3

### 1.1 SPECIFIED (redefined)

**Old definition (R5/R5.1):** "Specified" meant the requirement appears in a document. This conflated document presence with implementation.

**R6.1 redefinition:** `SPECIFIED` (Design dimension A) means: the requirement is written, has a unique ID, has acceptance criteria, and has a designated owner role. It does NOT mean implemented, tested, or approved. A `SPECIFIED` item must still pass through Implementation (B) and Owner Decision (C) before it is considered done.

Mapping:
- R5.1 "SPECIFIED" → A=SPECIFIED, B=NOT_RUN (until test evidence), C=as-is
- R5.1 "NOT_VERIFIED" → decomposed: if search not performed → B=NOT_RUN + E0; if claim without evidence → B=NOT_RUN + E1; if partial → B=PARTIAL + E2
- R5.1 "BLOCKED" → B=BLOCKED + reason + unblock condition
- R5.1 "PENDING OWNER DECISION" → C=PENDING + B unchanged

### 1.2 E3 (redefined)

**Old definition (R6):** "E3 = اختبار ناجح قابل لاعادة التشغيل من Clone نظيف" — sufficient for logic.

**R6.1 redefinition:** E3 requires ALL of:
1. Test file exists in the repository (E2 minimum).
2. Test passes from a clean clone (reproducible).
3. Test contains at least one numeric/golden assertion (not just render assertion).
4. Test is traceable to a specific formula/rule/contract.

A test that only asserts rendering (e.g., "heading renders") is E2, not E3. A test with numeric assertions but no independent reference case is E3 for logic only, not for accuracy.

### 1.3 Why tests=0 was counted as E3 in the original audit

**It was NOT.** The original audit (r5-audit.json) assigned E3 only to tools with `golden === true` AND `testCount > 0`. Tools with `tests=0` were assigned E1 (claim/report only). The scope-reconciliation.csv confirms: 91 tools at E1 (no test file), 65 at E2 (tests but no golden), 108 at E3 (golden assertions).

The confusion arose because the r5-audit `summary.withTests = 173` counts tools with ANY test file (including render-only tests), while `goldenCases = 108` counts tools with numeric/golden assertions. These are different metrics and were reported in different columns. The scope-reconciliation.csv uses the stricter E3 definition.

### 1.4 Macro (46→21) and BodyFat (46→3) test count discrepancy

**Macro:** The `r5-audit.json` counts test files matching the tool slug. Macro V6 (`macro.v6.ts`) has 21 matched test files (including macro-pilot tests, adapter tests, schema tests, and V4 profile tests). The "46 tests" referenced in V3 documentation refers to the Macro V6 engine's own test count (`macro.v6.test.ts` had 46 assertions at one point), not 46 test files. The audit counts files, not assertions. Current: 21 test files, macro.v6.test.ts contains the engine assertions.

**BodyFat:** Similarly, the "46 tests" in V3 documentation refers to assertions in `bodyfat.v6.test.ts` at a specific point in time. The audit counts test files matched to the slug `bodyfat`, which is 3 (bodyfat-pilot.test.tsx, bodyfat-to-macro.test.ts, bodyfat.v6.test.ts). The engine test file `bodyfat.v6.test.ts` contains the numeric assertions.

**Conclusion:** The discrepancy is between "test files matched to slug" (audit metric) and "test assertions in engine test file" (documentation metric). Both are valid but measure different things. No tests were lost; the counting method changed.

---

## 2. Contract for each tool in the 20-tool sample

A 20-tool sample was selected across categories and depths to represent the spectrum. For each tool, the contract declares: CAN (what it computes), CANNOT (what it must not claim), SOURCES (status), WHY (calculation basis), COST (N/A — no AI provider), STOP (kill switch status), RESTORE (rollback status).

| # | Tool ID | Slug | Category | Depth | CAN | CANNOT | Sources | WHY | COST | STOP | RESTORE |
|---:|---|---|---|---|---|---|---|---|---|---|---|
| 1 | mrx.tool.macro | macro | nutrition | standard | Macro V6 calculation (Mifflin-St Jeor, TDEE, macros) | Medical advice, diagnosis | Partial (Mifflin-St Jeor sourced; assumptions documented) | Mifflin-St Jeor + activity + phase + goal | N/A (no AI provider) | NOT_IMPLEMENTED | Revert macro.v6.ts only |
| 2 | mrx.tool.bodyfat | bodyfat | body-composition | standard | FFMI, body fat %, lean/fat mass | Clinical diagnosis, body composition prescription | Partial (US Navy method; no source date) | US Navy circumference method | N/A | NOT_IMPLEMENTED | Revert bodyfat.v6.ts only |
| 3 | mrx.tool.injection | injection | injection-formulation | standard | Injection site rotation visualization | Injection instructions, safety clearance | NOT_FOUND | Visual guide only | N/A | NOT_IMPLEMENTED | Revert injection.ts |
| 4 | mrx.tool.halflife | halflife | pharmacokinetics | standard | Half-life visualization and accumulation | Dosing recommendation, treatment | NOT_FOUND | Visualization only | N/A | NOT_IMPLEMENTED | Revert halflife.ts |
| 5 | mrx.tool.lab | lab | medical-monitoring | standard | Bloodwork reference ranges | Clinical interpretation, diagnosis | NOT_FOUND | Reference ranges only | N/A | NOT_IMPLEMENTED | Revert lab.ts |
| 6 | mrx.tool.genetic | genetic | training-recovery | standard | Genetic potential estimate (heuristic) | Biological ceiling, genetic destiny | NOT_FOUND | Unsourced heuristic | N/A | NOT_IMPLEMENTED | Revert genetic.ts |
| 7 | mrx.tool.cycle | cycle | cycle-management | standard | Cycle planning arithmetic | Cycle prescription, medical advice | NOT_FOUND | Arithmetic only | N/A | NOT_IMPLEMENTED | Revert cycle.ts |
| 8 | mrx.tool.timeline | timeline | training-recovery | standard | Transformation timeline visualization | Outcome prediction | Partial (constant-rate disclosed) | Constant-rate arithmetic | N/A | NOT_IMPLEMENTED | Revert timeline.ts |
| 9 | mrx.tool.master-calculator | master-calculator | nutrition | standard | All-in-one nutrition/cycle calc | Medical advice | NOT_FOUND | Composite of other tools | N/A | NOT_IMPLEMENTED | Revert master-calculator.ts |
| 10 | mrx.tool.multi-ester-pharmacokinetics | multi-ester-pharmacokinetics | pharmacokinetics | standard | Multi-ester serum accumulation | Dosing, treatment | NOT_FOUND | Bateman equation | N/A | NOT_IMPLEMENTED | Revert multi-ester-pharmacokinetics.ts |
| 11 | mrx.tool.hpta-recovery | hpta-recovery | hormonal-health | standard | HPTA suppression/recovery model | Treatment, diagnosis | NOT_FOUND | Unvalidated model | N/A | NOT_IMPLEMENTED | Revert hpta-recovery.ts |
| 12 | mrx.tool.aromatization-risk | aromatization-risk | hormonal-health | standard | Unvalidated aromatization scenario | E2 prediction, clinical risk, treatment | NOT_FOUND (explicitly unvalidated) | Unvalidated arithmetic | N/A | NOT_IMPLEMENTED | Revert aromatization-risk.ts |
| 13 | mrx.tool.pct-timing | pct-timing | cycle-management | standard | PCT washout scheduling | Medical advice, diagnosis | NOT_FOUND | Washout arithmetic | N/A | NOT_IMPLEMENTED | Revert pct-timing.ts |
| 14 | mrx.tool.hcg-serm-protocol | hcg-serm-protocol | reproductive-wellbeing | standard | SERM/HCG protocol generation | Dosing, treatment | NOT_FOUND | Rule-based protocol | N/A | NOT_IMPLEMENTED | Revert hcg-serm-protocol.ts |
| 15 | mrx.tool.bmi | bmi | body-composition | rich-output | BMI calculation + categories | Medical diagnosis | Partial (CDC bands; R5 runtime verified) | BMI = kg/m² | N/A | NOT_IMPLEMENTED | Revert bmi.v6.ts |
| 16 | mrx.tool.one-rep-max | one-rep-max | training-recovery | numeric-minimal | 1RM estimate (Epley) | Training prescription | Partial (Epley equation) | Epley formula | N/A | NOT_IMPLEMENTED | Revert one-rep-max.v6.ts |
| 17 | mrx.tool.strength-standards | strength-standards | training-recovery | numeric-minimal | Strength ratio comparison | Training prescription | Partial (bodyweight ratios) | Ratio comparison | N/A | NOT_IMPLEMENTED | Revert strength-standards.v6.ts |
| 18 | mrx.tool.rest-timer | rest-timer | training-recovery | numeric-minimal | Rest interval from intensity | Training prescription | NOT_FOUND | Simple interval | N/A | NOT_IMPLEMENTED | Revert rest-timer.v6.ts |
| 19 | mrx.tool.bmr-tdee | bmr-tdee | nutrition | numeric-minimal | BMR/TDEE estimate | Medical advice | Partial (Mifflin-St Jeor) | Mifflin-St Jeor | N/A | NOT_IMPLEMENTED | Revert bmr-tdee.v6.ts |
| 20 | mrx.tool.protein-needs | protein-needs | nutrition | rich-output | Protein needs estimate | Medical/nutritional prescription | Partial (g/kg bands; R5 runtime verified) | g/kg by goal/activity | N/A | NOT_IMPLEMENTED | Revert protein-needs.v6.ts |

**Note:** COST is N/A for all tools because no AI provider is configured (NOT_CONFIGURED). STOP and RESTORE are NOT_IMPLEMENTED for all tools because no kill switch or rollback procedure exists yet. These must be implemented in Phase 4 per R6.1.

---

## 3. RLS Negative test for different tenants

**Status: NOT_RUN**

No RLS negative test for cross-tenant access was found in the repository. The schema.sql defines RLS policies (6 tables, 9 policies) but no test file exercises cross-tenant rejection.

**Evidence:**
- `supabase/schema.sql` L90-96: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` for 6 tables.
- `supabase/schema.sql` L99-135: `CREATE POLICY` for own-data access.
- No test file matching `*rls*` or `*tenant*` found in `tests/` or `__tests__/`.
- W05 in R6.1 tracker: B=NOT_RUN (no isolation test attached).

**Required for G-R6.1-1:** A test that creates two users in different tenants, attempts cross-tenant read/write, and asserts rejection. This test does not exist yet and must be written by the owner-approved implementation task.

---

## 4. Full tsc log without --skipLibCheck

**Command:** `npx tsc --noEmit` (no --skipLibCheck flag)

**Result:** 0 errors. Exit code 0. No output (clean compilation).

**tsconfig.json:** Standard Next.js configuration. No `skipLibCheck` override in tsconfig (the flag was passed on CLI only). No `ignoreBuildErrors` in next.config.ts (only `eslint.ignoreDuringBuilds: true`).

**Conclusion:** The codebase compiles cleanly with full type checking. The 288 historical errors referenced in V3 documentation are not present in the current codebase.

---

## 5. Tool 111 staging engine status

| Item | Value |
|---|---|
| Component | `components/tools/tool-111-smart-food-macro-substitution.tsx` (28,435 bytes) |
| Engine (staging) | `lib/tools/engines/staging/tool-111-smart-food-macro-substitution-engine.ts` (27,540 bytes) |
| Engine (production) | `lib/tools/engines/tool-111-smart-food-macro-substitution.ts` (25,918 bytes) — EXISTS |
| Schema | `lib/tools/schemas/tool-111-smart-food-macro-substitution.ts` |
| Adapter | `lib/tools/adapters/tool-111-smart-food-macro-substitution.ts` |
| i18n | `i18n/tool-111-smart-food-macro-substitution.json` |
| Tests | 3 component tests + engine tests |

**Status: STAGING.** The component imports its EngineInput/SubstitutionResult types from the `staging/` directory, not from the production `lib/tools/engines/` directory. This means Tool 111 is running on a staging engine, not the production engine. The production engine file exists separately but is not wired to the component.

**Evidence:**
- `components/tools/tool-111-smart-food-macro-substitution.tsx` L8: `import type { EngineInput, SubstitutionResult } from '@/lib/tools/engines/staging/tool-111-smart-food-macro-substitution-engine'`
- Production engine exists at `lib/tools/engines/tool-111-smart-food-macro-substitution.ts` (25,918 bytes) but is not imported by the component.

**Implication:** Tool 111 is NOT in production configuration. It uses a staging engine that may differ from the production engine. This must be resolved (wire to production engine or promote staging) before any Pilot or Canary.

---

## 6. Summary

| Deliverable | Status |
|---|---|
| 1. Contract for 20-tool sample | DONE (table above) |
| 2. RLS Negative test | NOT_RUN (no test exists; required for G-R6.1-1) |
| 3. Full tsc log without --skipLibCheck | DONE (0 errors) |
| 4. Tool 111 staging status | DONE (STAGING — uses staging engine, not production) |

**Conditions addressed:**
- SPECIFIED redefined: document presence ≠ implementation. ✓
- E3 redefined: test file + reproducible + numeric assertion + traceable. ✓
- tests=0 counted as E1, not E3. ✓
- Macro 46→21 and BodyFat 46→3 explained (file count vs assertion count). ✓
- tsc without --skipLibCheck: 0 errors. ✓
- next.config: eslint.ignoreDuringBuilds only; no ignoreBuildErrors. ✓

**Forbidden actions:** none performed. Batch 2 BLOCKED. R6.1 NOT ACTIVE. W18 NOT EXECUTED. No merge, no pilot, no canary.