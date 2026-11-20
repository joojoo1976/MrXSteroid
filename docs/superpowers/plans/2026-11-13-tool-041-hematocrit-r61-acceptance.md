# Tool 041 — Hematocrit Monitor R6.1 Acceptance Procedure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the owner's approved R6.1 acceptance procedure to Tool 041 — Hematocrit Monitor, verification-first, preserving existing work and closing actual gaps, ending in the owner's final acceptance decision.

**Architecture:** The procedure mirrors the closed Tool 039 and Tool 040 cycles: forensic discovery → acceptance audit → exact ledger-based completion → gap closure → verification battery → owner-authorized Preview + E4 → final delivery report → owner decision (C). No implementation rebuild; no changes outside the tool scope.

**Tech Stack:** Next.js app router tool page, Zod schemas, V6 engine, R6 pipeline + ToolOutput adapter, React component, i18n JSON (en/ar), Vitest, Playwright/Chrome DevTools Protocol browser harness, Vercel Preview.

**Spec:** `docs/superpowers/specs/2026-11-13-tool-041-hematocrit-r61-acceptance-design.md`

## Global Constraints

- Verification-First — Preserve Existing Work — Close Actual Gaps Only.
- No rebuild of Tool 041 from scratch; no deletion/replacement/rewrite of existing work without need.
- No Git commit/push/merge/rebase without owner authorization; no reset/clean/destructive checkout; no DB/RLS/Supabase/W18/cloud-sync changes; no paid AI; no Tool ID/route edits; no edits outside Tool 041 scope; no Tool 042 before Tool 041 closure.
- Completion = (Verified Completed Applicable Requirements / Total Applicable Atomic Requirements) × 100, computed from the real ledger; PASS requires E3 minimum; NOT_APPLICABLE excluded only with real documented proof.

## Review Focus

- Forensic discovery must classify committed vs uncommitted Tool 041 artifacts before any edit.
- Gap closure must preserve the original engine and results; minimal fixes only.
- E3 (local build) and E4 (published preview) evidence must stay separate.

---

## Tasks

### Task 1: Forensic Discovery — Tool 041 artifact inventory

**Files:** Tool 041 artifact set (engine, schema, pipeline, adapter, component, page, registry, i18n, tests); git state.

- [ ] **Step 1: Read the R6.1 sources** — SPEC.md, ACCEPTANCE_CRITERIA.md, R6.1-CLOSURE-LAYER.md, R6.1-ACTIVATION-DECISION.md, HISTORY-CONTEXT-INTEGRATION-REPORT.md §8, task pipeline docs.
- [ ] **Step 2: Inventory Tool 041 files** — engine, Zod schema, R6 pipeline, adapter, component, page, registry entries, i18n keys, focused tests.
- [ ] **Step 3: Classify git state** — HEAD `7cac0d1f…`, branch `docs/r6.1-r0-evidence`, porcelain status, committed vs uncommitted Tool 041 work.
- [ ] **Step 4: Map each R6.1 requirement family** to actual implementation + evidence.

### Task 2: R6.1 Acceptance Audit — Tool 041

- [ ] Audit engine correctness/determinism, schema/contract, pipeline/ToolOutput, provenance, CORE-5, GENIUS-12, states, validation, units/i18n, tooltips, visuals, a11y, security, history, tests/build.
- [ ] Produce the gap list (empty expected; close only real gaps).

### Task 3: Ledger computation for Tool 041

- [ ] Build/derive the Tool 041 atomic ledger; compute completion; `LEDGER_INTEGRITY: OK`.

### Task 4: Close actual gaps (only if found)

- [ ] Minimal fixes + tests; re-run affected tests; preserve engine/results.

### Task 5: Verification battery (local)

- [ ] Focused tests, R6 regression, tsc, eslint, full build, local browser harness, AR/RTL, mobile 390, interaction checks.

### Task 6: Owner Preview authorization → deploy → E4 browser verification → no Production

- [ ] After local verification: request one-PREVIEW owner authorization; after authorization deploy; run published browser harness; no Production/Promotion.

### Task 7: Final delivery report and owner decision (C) for Tool 041

- [ ] Compose final report (tool ID/route, files before/after, completed vs new, open items, ledger with evidence, exact %, actual test results, preview URL/ID after authorization, owner-only pending decisions).
- [ ] Update acceptance/ledger/change-log/preview-index artifacts for the closure state.

---
