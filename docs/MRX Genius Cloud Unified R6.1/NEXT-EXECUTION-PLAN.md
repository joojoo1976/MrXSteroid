# NEXT EXECUTION PLAN — MRX Genius Cloud Unified R6.1 G-R6.1-1

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

This plan defines the next sequential execution steps for G-R6.1-1 foundations. Each step lists preconditions, exact actions, acceptance criteria, evidence to produce, and owner-decision gates. No step proceeds past its owner-decision gate without explicit authorization.

---

## 2. Current State Reference

| Item | Value |
|---|---|
| HEAD | 5a87f3e5271db497a63833bb3cd1bb3df2078497 |
| Branch | docs/r6.1-r0-evidence |
| Targeted tests | 93 passed (65 new + 28 existing) |
| Full lib/ regression | 263 files, 2031 tests, 0 failed |
| TypeScript | 0 errors |
| CI integration | NOT VERIFIED |
| R6.1 status | NOT ACTIVE |
| G-R6.1-1 | NOT PASS |
| Open conflicts | 10 (W01-W05, W07-W11) |
| Active constraint | W12/W18 (no DB/session/sync/cloud) |

---

## 3. Next Execution Batch — Step 1: Tenant Isolation Decision Point

### 3.1 Preconditions (All Must Be Met)

- Owner decision on authentication source and mechanism (no server-side auth boundary currently found in repo)
- Owner confirmation that tenant context derivation from server-side identity is in scope
- Owner confirmation that client-supplied `x-tenant-id`/`x-actor-id` headers must be stripped/ignored

### 3.2 Actions (Only If Owner Approves)

1. Inspect `middleware.ts` and `app/api/auth/` routes to confirm no session/token verification exists
2. Document the proposed server-side identity source (e.g., verified session cookie, JWT validation)
3. Implement `assertTenantContext()` call at API route boundaries using server-derived identity only
4. Add negative tests: missing context, invalid context, mismatched tenant, client-supplied header stripped
5. Run `npx vitest run lib/shared/tenant-context.test.ts` and `npx tsc --noEmit`

### 3.3 Acceptance Criteria

- `validateTenantContext` rejects missing/invalid/expired context (already tested)
- `assertTenantContext` throws on invalid context (already tested)
- No client-supplied tenant ID accepted as authorization
- Cross-tenant propagation prevented
- Typecheck clean; tests pass

### 3.4 Evidence to Produce

- Test file additions for negative cases
- Typecheck output (0 errors)
- Test run output (all pass)

### 3.5 Owner Decision Gate

**STOP HERE** if no server-side auth boundary exists. Do not add session/auth system unilaterally. Requires separate owner decision before proceeding.

---

## 4. Next Execution Batch — Step 2: CI Integration

### 4.1 Preconditions

- Owner decision to add CI workflow
- Agreement on CI provider (GitHub Actions assumed; no .github/ directory exists)

### 4.2 Actions

1. Create `.github/workflows/ci.yml` running `npx vitest run lib/` and `npx tsc --noEmit`
2. Verify new tests (93 targeted) are included in `lib/` scope
3. Run lint (`npx eslint .`) and build (`npx next build`) separately if owner approves

### 4.3 Acceptance Criteria

- CI config file exists and references `lib/` test suite
- Typecheck passes in CI context
- Lint and build results documented (if run)

### 3.4 Evidence to Produce

- CI workflow file content
- Lint output
- Build output

### 3.5 Owner Decision Gate

**STOP HERE** if CI changes are outside authorized scope. Requires separate owner decision.

---

## 5. Next Execution Batch — Step 3: Unit Centralization (Precision-Preserving)

### 5.1 Preconditions

- Owner approval to migrate one engine to `unit-system.ts` with precision reconciliation
- Agreement on which engine to pilot (recommendation: none of the 4 blocked engines without precision reconciliation)

### 5.2 Actions

1. Select one engine whose conversion constants exactly match `unit-system.ts` (none of the 4 analyzed match)
2. If none match, document that no migration is safe without owner-approved precision change
3. Add round-trip regression test proving output equivalence within engine's documented precision
4. Run full `lib/` regression

### 5.3 Acceptance Criteria

- No engine output changed
- Round-trip test passes within documented precision
- Full regression (2031 tests) still passes

---

## 6. Next Execution Batch — Step 4: Additional V6 Engine Integration (Slice C)

### 6.1 Preconditions

- Selection of a second deterministic V6 engine (one-rep-max already done; tool-016 already done)
- Engine present in repo with callable interface and existing tests

### 4.2 Actions

1. Select engine (candidate: any tested V6 engine not yet integrated)
2. Create additive pipeline module in `lib/tools/r6/` (no tracked file modification)
3. Create test module verifying contract→validation→engine→output→guard path
4. Run typecheck and tests

### 4.3 Acceptance Criteria

- Engine output preserved exactly
- ToolOutput contract-valid
- Invalid input fails safely
- Typecheck clean; tests pass

---

## 7. Execution Order (Do Not Reorder)

```
Step 1: Tenant isolation decision (OWNER GATE) → Step 2: CI integration (OWNER GATE) → Step 3: Unit centralization → Step 4: Additional V6 integration
```

Each step's owner-decision gate must be cleared before the next step begins.

---

## 8. Owner Decision Gates (Summary)

| Gate | Decision Required | Consequence of Not Deciding |
|---|---|---|
| G-1 | Authentication source/mechanism for tenant isolation | Step 1 cannot proceed; contract remains unwired |
| G-2 | CI workflow addition | Step 2 cannot proceed; CI remains NOT VERIFIED |
| G-3 | Unit migration precision approval | Step 3 cannot proceed; 0 engines migrated |
| G-4 | W18 lift (if DB work needed later) | No DB/session/sync/cloud work possible |

---

## 9. Stop Conditions (Do Not Proceed Without Owner Instruction)

- Any requirement to modify a tracked file beyond additive new modules
- Any database write, migration, Supabase, or production RLS change
- Any paid AI provider activation or external API spending
- Any production deployment
- Any commit, push, merge, rebase, or deploy
- Any client-supplied tenant ID accepted as authorization
- Any claim of G-R6.1-1 PASS without owner evidence review

---

## 10. Deliverables for Next Report

| Item | Format |
|---|---|
| Exact files created/modified | File paths |
| Selected engine(s) and rationale | Engine IDs + selection evidence |
| End-to-end integration description | Contract→validation→engine→output path |
| Tests executed and results | Test counts + pass/fail |
| Typecheck/lint/build results | Command outputs |
| Tenant isolation/IAM/audit status | Contract-only vs wired |
| V4/Dashboard preservation confirmation | Untracked/tracked file status |
| Remaining blockers and risks | List with gates |
| Next concrete batch | Step number + preconditions |

---

## 11. Status Declaration

**G-R6.1-1: NOT PASS** — Foundations implemented with code + tests + evidence, but owner evidence review required. W01 OPEN. W12/W18 honored. No database writes, no Supabase, no paid AI, no deployment. No commit/push/merge/deploy.
