# MASTER_DOCUMENTATION_INDEX

**Project:** MrXSteroid Genius Intelligence Platform  
**Location:** `docs/MrXSteroid_Genius_Intelligence_V4.0/`  
**Updated:** 2026-11-06 (owner-approved documentation consolidation)  
**Status:** Auxiliary central index — not a replacement for the original documents. The three unified authorities (`SPEC.md`, `PROMPT.md`, `ACCEPTANCE_CRITERIA.md`) linked below govern; reports are evidence, never authorization.

## How to use this index

Each row names a document, its role, its authority class, and its phase. **Current** = in force for future work. **Archived** = preserved unchanged in `archive/pre-unified-2026-11-06/`. "Historical report" = evidence only; it authorizes nothing.

## A. Unified authorities (after owner approval 2026-11-06)

| File | Role | Phase link | Status |
|---|---|---|---|
| `SPEC.md` | Unified architecture, scope, contracts, AI capabilities, UX/visual, cross-tool, privacy/safety, Macro preservation | All | **Current authority** |
| `PROMPT.md` | Unified execution directive; role, precedence, authorization format, developer behavior | All | **Current authority** |
| `ACCEPTANCE_CRITERIA.md` | Unified acceptance, evidence, gates, release criteria | All | **Current authority** |

## B. Archived originals (unchanged; proof via SHA-256 in `MASTER_FILE_PRESERVATION_MANIFEST.md`)

| File | Location | Status |
|---|---|---|
| `archive/pre-unified-2026-11-06/SPEC.md` | Archive | Archived original; byte-identical |
| `archive/pre-unified-2026-11-06/PROMPT.md` | Archive | Archived original; byte-identical |
| `archive/pre-unified-2026-11-06/ACCEPTANCE_CRITERIA.md` | Archive | Archived original; byte-identical |

## C. MRX_GI unified auxiliary masters (created in this task)

| File | Role | Status |
|---|---|---|
| `MASTER_DOCUMENTATION_INDEX.md` | This central index | Current auxiliary |
| `MASTER_MACRO_DEVELOPMENT_HISTORY.md` | Chronological Macro lineage and decision log | Current auxiliary |
| `MASTER_PHASE_EXECUTION_STATUS.md` | R1–R5 status and owner-gate ledger | Current auxiliary |
| `MASTER_FILE_PRESERVATION_MANIFEST.md` | Hashes/integrity register of protected files | Current auxiliary |

## D. Phase R1 reports (2026-11-01 logs, R1 closure 2026-11-05)

| File | Phase | Status |
|---|---|---|
| `PHASE_R1_ARCHITECTURE_REPORT.md` | R1 | Historical report |
| `PHASE_R1_CONTRACT_TRACEABILITY.md` | R1 | Historical report |
| `PHASE_R1_REGISTRY_RECONCILIATION.md` | R1 | Historical report |
| `PHASE_R1_SUPABASE_COMPATIBILITY_ANALYSIS.md` | R1 | Historical report |
| `PHASE_R1_TEST_REPORT.md` | R1 | Historical report |
| `PHASE_R1_CHANGELOG.md` | R1 | Historical report |
| `PHASE_R1_FINAL_OWNER_VERIFICATION.md` | R1 | Historical report |
| `PHASE_R1_RUNTIME_CLOSURE_REPORT.md` | R1 | Historical report |

## E. Phase R2 reports

| File | Phase | Status |
|---|---|---|
| `PHASE_R2_TEMPLATE_AUDIT.md` | R2 | Historical report |
| `PHASE_R2_TEMPLATE_IMPLEMENTATION_REPORT.md` | R2 | Historical report |
| `PHASE_R2_V4_INTEGRATION_REPORT.md` | R2 | Historical report |
| `PHASE_R2_TEST_REPORT.md` | R2 | Historical report |
| `PHASE_R2_ACCESSIBILITY_I18N_REPORT.md` | R2 | Historical report |
| `PHASE_R2_BACKWARD_COMPATIBILITY_REPORT.md` | R2 | Historical report |
| `PHASE_R2_CHANGELOG.md` | R2 | Historical report |
| `PHASE_R2_OWNER_VERIFICATION_REPORT.md` | R2 | Historical report |
| `PHASE_R2_GATE_CLOSURE_REPORT.md` | R2 | Historical report |
| `PHASE_R2_FINAL_GATE_REASSESSMENT_REPORT.md` | R2 | Historical report |
| `PHASE_R2_FINAL_OWNER_ACCEPTANCE_REPORT.md` | R2 | Historical report |

## F. Macro pilot lineage (R3 → R3.1 → R4)

| File | Phase | Status |
|---|---|---|
| `PHASE_R3_PILOT_PROPOSAL.md` | R3 proposal | Historical report |
| `PHASE_R3_PILOT_PROPOSAL_REVISION_1.md` | R3 proposal | Historical report |
| `PHASE_R3_PILOT_PROPOSAL_REVISION_2.md` | R3 proposal | Historical report |
| `PHASE_R3_MACRO_PILOT_IMPLEMENTATION_REPORT.md` | R3 | Historical report |
| `PHASE_R3_1_MACRO_PILOT_UI_REMEDIATION_REPORT.md` | R3.1 | Historical report |
| `PHASE_R4_MACRO_PILOT_EVALUATION_REPORT.md` | R4 | Historical report (NOT RUN items remain open) |

## G. Macro V4 capability-closure lineage

| File | Context | Status |
|---|---|---|
| `PHASE_MACRO_V4_FULL_CAPABILITY_COMPLIANCE_AUDIT_REPORT.md` | Audit baseline | Historical report |
| `MACRO_V4_REVISION_2_1_FINAL_COMPLIANCE_REVIEW.md` | Compliance review | Historical report |
| `PHASE_MACRO_V4_CAPABILITY_CLOSURE_PLAN.md` | Revision 2.2 approved planning baseline | Historical plan (planning only; not implemented by itself) |
| `MACRO_V4_REVISION_2_2_FINAL_COMPLIANCE_REVIEW.md` | Final review → owner decision | Historical report |
| `MACRO_V4_GROUPED_CAPABILITY_CLOSURE_EXECUTION_REPORT.md` | Executed grouped closure (batches A–E) | Historical report (mine; evidence not acceptance) |

## H. R5 controlled-batch lineage

| File | Context | Status |
|---|---|---|
| `R5_FIRST_BATCH - TOOL SELECTION AND IMPLEMENTATION SCOPE.md` | Approved scope for BMI / Protein Needs / Water Intake | Historical plan (executed; scope unchanged) |
| `R5_FIRST_BATCH - IMPLEMENTATION AND OWNER PREVIEW REPORT.md` | Implemented; awaits owner preview | Historical report |
| `R5_FIRST_BATCH - OWNER PREVIEW AND CLOSURE REPORT.md` | Created by Phase D/E verification in this task | See Phase E verification + closure report |

## I. Owner-accepted engineering baselines (not re-opened)

- `MRX-GI unified authorities` (this task, 2026-11-06) — approved document consolidation.
- `MACRO V4 — BOUNDED PILOT — grouped closure completed with documented gaps` (owner decision).
- `R5 FIRST BATCH — THREE TOOLS ONLY — owner authorized; awaiting owner acceptance`.
- 264 registry identities — none deleted/renamed/renumbered.

## J. Anchored engineering paths (read-only references)

- Engines: `lib/tools/engines/macro.v6.ts`, `macro.ts` (Layer 1), `bodyfat.v6.ts`, `bmi.v6.ts`, `protein-needs.v6.ts`, `water-intake.v6.ts`
- Schemas: `lib/tools/schemas/*`
- Components: `components/tools/*-pilot.tsx`, `components/tools/tool-pilot-v4.module.css`, `useToolDisplayPreferences.ts`, `tool-preferences.test-utils.tsx`
- V4: `lib/engines/core/v4/contracts.v4.ts`, `runtime.v4.ts`, `index.ts`, `adapter.macro.v4.ts`, `adapter.{bmi,protein-needs,water-intake}.v4.ts`, `profiles/*.v4.ts`
- Template: `lib/templates/genius-tool-template.tsx` (V3) and `.v4.tsx` (V4)
- Tests: `lib/**/*.test.ts(x)`, `components/**/*.test.tsx`, `tests/`

## K. Consistency rules

1. Reports do not override current authorities; only the owner does, explicitly.
2. Historical test counts are re-run claims, not live status (Macro V6 81/81, closure 328→394): re-verify before reuse.
3. No document in B–J changes engine behavior, formulas, schemas, routes, registry, or untracked user work.
4. New phases must record their own verification; they must not silently inherit "PASS" from history.
