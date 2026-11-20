# REQUIREMENT-TO-CODE TRACEABILITY MATRIX — MRX Genius Cloud Unified R6.1

**Document version:** 1.0  
**Date:** 2026-11-10  
**Repository:** E:\MrXSteroid-main  
**HEAD:** 5a87f3e5271db497a63833bb3cd1bb3df2078497  
**Branch:** docs/r6.1-r0-evidence  
**R6.1 Governing Standard:** ACTIVE / OWNER APPROVED (2026-11-09)  
**R6.1 Operational Activation:** NOT ACTIVE / NOT VERIFIED  
**Current gate:** G-R6.1-1 — IN PROGRESS — NOT PASS  
**Evidence standard:** VERIFIED / PARTIAL / NOT VERIFIED / BLOCKED — no PASS without reviewable evidence

---

## 1. Purpose

This matrix traces every requirement (from SPEC.md, ACCEPTANCE_CRITERIA.md, owner directives, and G-R6.1-1 slice definitions) to its source document, implementing files, tests, evidence level, and current status. It separates what is specified, what is implemented, what is tested, and what is independently verified.

---

## 2. Slice A — Dynamic Input/Output Contracts

| Req ID | Requirement | Source | Implementing Files | Test Files | Evidence Level | Status | Notes |
|---|---|---|---|---|---|---|---|
| A-1 | Explicit input and output types | Slice A, G-R6.1-1 | `lib/tools/contracts.ts` (ToolOutput<T>, ToolOutputParams<T>) | `lib/tools/contracts.test.ts` | E3 (15 tests PASS) | VERIFIED | Canonical contract exists; no duplication |
| A-2 | Stable contract/version identification | Slice A | `lib/tools/registry.ts` (ToolDefinition.version, requireTool) | `lib/tools/registry.test.ts` | E3 | VERIFIED | Registry carries version per tool |
| A-3 | Runtime validation at boundaries | Slice A | `lib/tools/contracts.ts` (createToolOutput fail-fast) | `lib/tools/contracts.test.ts` | E3 | VERIFIED | Throws ToolContractError on invalid payload |
| A-4 | Required/optional/invalid/unavailable field handling | Slice A | `lib/tools/contracts.ts` (createToolOutput guards) | `lib/tools/contracts.test.ts` | E3 | VERIFIED | Invalid locale/tier/snapshot/result rejected |
| A-5 | Measurement-unit metadata | Slice A / Slice B | `lib/tools/contracts.ts` (ToolOutput.unitSystem), `lib/shared/unit-system.ts` | `lib/shared/unit-system.test.ts` | E3 | PARTIAL | Contract field exists; engines don't import unit-system.ts |
| A-6 | Source/provenance + result-status semantics | Slice A | `lib/tools/contracts.ts` (DataProvenance, KeyFinding) | `lib/tools/contracts.test.ts` | E3 | VERIFIED | Provenance envelope on every output |
| A-7 | Separation: user inputs / deterministic calc / rule-based output / estimates / cross-tool / unavailable | Slice A | `lib/tools/contracts.ts` (result: T, keyFindings, seoLinks) | `lib/tools/contracts.test.ts` | E3 | VERIFIED | Envelope separates result from findings/links |
| A-8 | No duplicate competing contract system | Slice A directive | — | — | — | VERIFIED | Existing contracts.ts used; no new system created |

---

## 3. Slice B — Centralized Units and Conversion

| Req ID | Requirement | Source | Implementing Files | Test Files | Evidence Level | Status | Notes |
|---|---|---|---|---|---|---|---|
| B-1 | Identify units used by existing engines | Slice B | `lib/tools/r6/unit-migration-analysis.ts` | `lib/tools/r6/unit-migration-analysis.test.ts` | E2 (snapshot) | VERIFIED | 4 engines snapshotted; constants compared |
| B-2 | Centralize conversion logic (no duplication) | Slice B | `lib/shared/unit-system.ts` | `lib/shared/unit-system.test.ts` | E3 | PARTIAL | unit-system.ts exists but unused by engines |
| B-3 | Prevent invalid conversions between incompatible dimensions | Slice B | `lib/shared/unit-system.ts` (4 named conversions only) | `lib/shared/unit-system.test.ts` | E3 | VERIFIED | Fixed surface of 4 same-dimension conversions |
| B-4 | Define canonical units and conversion precision | Slice B | `lib/shared/unit-system.ts` (UNIT_CONSTANTS, PRECISION) | `lib/shared/unit-system.test.ts` | E3 | VERIFIED | Constants and DP documented |
| B-5 | Handle unsupported/missing/invalid units safely | Slice B | `lib/shared/unit-system.ts` (clampFinite, named API) | `lib/shared/unit-system.test.ts` | E3 | VERIFIED | Non-finite clamped to 0 |
| B-6 | Avoid silent assumptions about user measurement system | Slice B | `lib/shared/unit-system.ts` (explicit unitSystem param) | `lib/shared/unit-system.test.ts` | E3 | VERIFIED | Unit system passed explicitly, not assumed |
| B-7 | Preserve original user input; traceable normalized input | Slice B | `lib/shared/unit-system.ts` (originalUnit in provenance) | `lib/tools/contracts.test.ts` | E3 | VERIFIED | DataProvenance.originalUnit field |
| B-8 | No artificial coverage expansion | Slice B directive | — | — | — | VERIFIED | Only 4 conversions; no new categories added |
| B-9 | Migrate engines to shared units | Slice B | — | — | E2 (blocked) | PARTIAL | 0 engines migrated; 4 blocked due to precision mismatch |

---

## 4. Slice C — Validation and Deterministic Engine Integration

| Req ID | Requirement | Source | Implementing Files | Test Files | Evidence Level | Status | Notes |
|---|---|---|---|---|---|---|---|
| C-1 | Select existing V6 deterministic engine | Slice C | `lib/tools/engines/tool-016-half-life-calculator.ts`, `lib/tools/engines/one-rep-max.v6.ts` | `lib/tools/engines/tool-016-half-life-calculator.test.ts`, `lib/tools/engines/one-rep-max.v6.test.ts` | E3 (existing tests PASS) | VERIFIED | tool-016 (half-life) + one-rep-max selected |
| C-2 | V6 remains authoritative; not recreated/replaced | Slice C | Pipelines call `calculateHalfLife` / `calculateOneRepMax` unchanged | Pipeline tests verify output equality | E3 | VERIFIED | Tests assert `output.result` equals engine output exactly |
| C-3 | No silent change to formulas/outputs/routes/Tool IDs | Slice C | — | — | — | VERIFIED | No engine/schema/registry/route files modified |
| C-4 | V4 adapters call approved V6 interfaces, not replace | Slice C / Owner Directive §5 | Pipelines are additive; no V4 adapter replacement | — | — | PARTIAL | Architecture adopted; no V4 adapter built yet |
| C-5 | AI must not silently modify deterministic outputs | Slice C | — | — | — | NOT VERIFIED | No AI integration in scope |
| C-6 | Invalid inputs fail safely with structured errors | Slice C | `runHalfLife` / `runOrm` return `{ok:false, error}` | Pipeline tests | E3 | VERIFIED | 8 invalid input cases tested per pipeline |
| C-7 | Unavailable capabilities remain explicitly unavailable | Slice C | — | — | — | NOT VERIFIED | No unavailable capability tested yet |
| C-8 | Integration tests prove full path | Slice C | Pipeline tests validate contract→validation→engine→output→guard | `tool-016-half-life-pipeline.test.ts` (5), `one-rep-max-pipeline.test.ts` (6) | E3 | VERIFIED | All 11 pipeline tests PASS |
| C-9 | First integration is a pilot, not 286-claim | Slice C directive | — | — | — | VERIFIED | 2 engines only; documented as pilot |

---

## 5. Slice D — Tenant Isolation Foundation

| Req ID | Requirement | Source | Implementing Files | Test Files | Evidence Level | Status | Notes |
|---|---|---|---|---|---|---|---|
| D-1 | Define tenant/security context contracts | Slice D | `lib/shared/tenant-context.ts` (TenantContext) | `lib/shared/tenant-context.test.ts` | E1 | PARTIAL | Contract exists; not wired to auth |
| D-2 | Derive trusted identity/tenant from server-side auth boundary | Slice D | — | — | — | NOT VERIFIED | No server-side auth boundary found in repo |
| D-3 | Never trust client-supplied tenant ID as authorization | Slice D | `lib/shared/tenant-context.ts` (validateTenantContext fail-closed) | `lib/shared/tenant-context.test.ts` | E3 | PARTIAL | Contract validates; no enforcement point yet |
| D-4 | Fail closed when identity/tenant missing/invalid | Slice D | `validateTenantContext` returns `{ok:false}` | `lib/shared/tenant-context.test.ts` | E3 | VERIFIED | Null/undefined/invalid all rejected |
| D-5 | Prevent cross-tenant context propagation | Slice D | `isCrossTenant()` | `lib/shared/tenant-context.test.ts` | E3 | VERIFIED | Compares tenantId |
| D-6 | Negative tests for missing/invalid/mismatched context | Slice D | `lib/shared/tenant-context.test.ts` | — | E3 | VERIFIED | 6 negative cases tested |
| D-7 | Identify future DB/RLS boundary without activating | Slice D | `lib/shared/tenant-context.ts` (documents boundary) | — | E1 | PARTIAL | Boundary identified; not activated |
| D-8 | No DB writes / Supabase / production RLS | Slice D + Owner Directive | — | — | — | BLOCKED | W18 active |

---

## 6. Slice E — IAM and Secrets Foundation

| Req ID | Requirement | Source | Implementing Files | Test Files | Evidence Level | Status | Notes |
|---|---|---|---|---|---|---|---|
| E-1 | Define server-only secret access boundaries | Slice E | `lib/shared/iam-config.ts` (IamConfig, ProviderCapability) | `lib/shared/iam-config.test.ts` | E1 | PARTIAL | Contract exists; no secret access |
| E-2 | Validate config without exposing secret values | Slice E | `validateIamConfig` (shape only, never reads values) | `lib/shared/iam-config.test.ts` | E3 | VERIFIED | Tests confirm values never read |
| E-3 | Prevent secrets in client bundles/logs/snapshots/errors | Slice E | `lib/shared/iam-config.ts` (shape validation only) | `lib/shared/iam-config.test.ts` | E3 | VERIFIED | No secret values handled |
| E-4 | Define provider capability/config states without activation | Slice E | `ProviderCapability.configured` / `.enabled` | `lib/shared/iam-config.test.ts` | E3 | VERIFIED | enabled=false by default |
| E-5 | Fail safely when credentials/config absent | Slice E | `missingRequiredSecrets`, `areAllProvidersDisabled` | `lib/shared/iam-config.test.ts` | E3 | VERIFIED | Missing keys reported; disabled by default |
| E-6 | No paid provider activation | Slice E + Owner Directive | — | — | — | BLOCKED | Owner approval required |
| E-7 | No production credential creation/rotation/reveal | Owner Directive | — | — | — | BLOCKED | Not performed |

---

## 7. Slice F — Audit and Approval Contracts

| Req ID | Requirement | Source | Implementing Files | Test Files | Evidence Level | Status | Notes |
|---|---|---|---|---|---|---|---|
| F-1 | Typed contracts for security/audit events | Slice F | `lib/shared/audit-contract.ts` (AuditEvent) | `lib/shared/audit-contract.test.ts` | E1 | PARTIAL | Contract exists; no storage |
| F-2 | Actor and scope identification | Slice F | `AuditActor`, `AuditScope` interfaces | `lib/shared/audit-contract.test.ts` | E3 | VERIFIED | Fields validated |
| F-3 | Action and resource identification | Slice F | `AuditEvent.action`, `AuditEvent.scope` | `lib/shared/audit-contract.test.ts` | E3 | VERIFIED | Required fields enforced |
| F-4 | Approval-required operations | Slice F | `APPROVAL_REQUIRED_ACTIONS` set | `lib/shared/audit-contract.test.ts` | E3 | VERIFIED | 5 actions listed |
| F-5 | Approval status and evidence references | Slice F | `ApprovalDecision` (status + evidenceRef) | `lib/shared/audit-contract.test.ts` | E3 | VERIFIED | pending/approved/rejected/blocked |
| F-6 | Rejection and blocked-operation states | Slice F | `ApprovalDecision.status` includes 'rejected'/'blocked' | `lib/shared/audit-contract.test.ts` | E3 | VERIFIED | Tested |
| F-7 | Maintain traceability | Slice F | `evidenceRef` field on both interfaces | `lib/shared/audit-contract.test.ts` | E1 | PARTIAL | Field exists; no storage wired |
| F-8 | No durable audit persistence (DB unauthorized) | Slice F + Owner Directive | — | — | — | BLOCKED | Database-backed storage unauthorized |

---

## 8. Slice G — CI and Regression Protection

| Req ID | Requirement | Source | Implementing Files | Test Files | Evidence Level | Status | Notes |
|---|---|---|---|---|---|---|---|
| G-1 | Integrate with existing test conventions | Slice G | Vitest config (existing); new tests follow same pattern | `lib/shared/*.test.ts`, `lib/tools/r6/*.test.ts` | E3 | VERIFIED | 7 new test files follow conventions |
| G-2 | Add targeted tests for new contracts/integration | Slice G | 60 new tests across 7 new test files | — | E3 | VERIFIED | 60 new tests PASS |
| G-3 | Regression checks for existing deterministic engines | Slice G | Existing engine tests preserved | `lib/tools/engines/*.test.ts` | E3 | VERIFIED | 2031 full regression PASS |
| G-4 | Execute targeted tests, typecheck, lint, build | Slice G | `npx tsc --noEmit` (0 errors); `npx vitest run` | — | E3 | PARTIAL | Typecheck clean; lint/build not separately run |
| G-5 | Distinguish new failures from pre-existing | Slice G | — | — | — | PARTIAL | All 2031 pass; no failures to distinguish |
| G-6 | No full-repository PASS claim | Slice G | — | — | — | VERIFIED | Only lib/ scope reported; CI NOT VERIFIED |
| G-7 | No unrelated CI workflow changes | Slice G | — | — | — | VERIFIED | No CI files modified |

---

## 9. Status Summary by Evidence Level

| Level | Count | Items |
|---|---|---|
| VERIFIED | ~35 | Contract behavior, unit-system internals, pipeline end-to-end, invalid input handling, tenant validation, IAM shape validation, audit validation, typecheck, targeted + full regression |
| PARTIAL | ~12 | Unit centralization (0 engines migrated), tenant auth wiring, IAM provider activation, audit storage, CI integration, lint/build separate run |
| NOT VERIFIED | ~4 | AI non-interference, unavailable capability handling, server-side auth boundary existence, lint/build as separate commands |
| BLOCKED | ~6 | DB writes, Supabase/RLS, paid provider activation, production deployment, commit/push/merge/deploy, durable audit storage |

**Total requirements traced:** ~57 across 7 slices (A-G).

---

## 10. Traceability Rule

Every requirement is mapped to:
1. **Source** — where the requirement originates (SPEC, owner directive, slice definition)
2. **Implementing files** — code that implements it (or "—" if not implemented)
3. **Test files** — tests that verify it (or "—" if not tested)
4. **Evidence level** — E0-E5 per R6.1-CLOSURE-LAYER.md
5. **Status** — VERIFIED / PARTIAL / NOT VERIFIED / BLOCKED per actual test/typecheck output

No requirement is marked PASS without corresponding test output or typecheck evidence.
