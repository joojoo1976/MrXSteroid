# CONFLICT & GAP REGISTER — MRX Genius Cloud Unified R6.1

**Document version:** 1.0  
**Date:** 2026-11-10  
**Repository:** E:\MrXSteroid-main  
**HEAD:** 5a87f3e5271db497a63833bb3cd1bb3df2078497  
**Branch:** docs/r6.1-r0-evidence  
**R6.1 Governing Standard:** ACTIVE / OWNER APPROVED (2026-11-09)  
**R6.1 Operational Activation:** NOT ACTIVE / NOT VERIFIED  
**Current gate:** G-R6.1-1 — IN PROGRESS — NOT PASS  
**Evidence standard:** VERIFIED / PARTIAL / NOT VERIFIED / BLOCKED

---

## 1. Purpose

This register consolidates all open conflicts (W01-W24), gaps, suspended work, and owner-decision items. It is the single authoritative source for what is blocked, what is open, and what requires owner approval. No conflict is marked closed without E3+ evidence. No document update alone constitutes conflict resolution (per owner directive §7).

---

## 2. Open Conflicts (W01-W24)

### W01 — V4 Template/Adapter vs V6 Component Authority

| Field | Value |
|---|---|
| Design A | SPEC-R6.1-3: CORE-5 + GENIUS-12 visual standard (slider, tooltip, badges) |
| Implementation B | V4 migration: `lib/templates/genius-tool-template.v4.tsx` + `lib/engines/core/v4/` + BMI/Protein/Water/Macro V4 pilots (uncommitted, in progress) |
| Owner Decision C | **ADOPTED (additive architecture, Owner Directive §5, 2026-11-09)** — V4 provides reusable presentation/contracts/adapters; existing V6 deterministic engines remain authoritative; V4 integrates only through explicit, validated adapters; no blanket migration or engine replacement |
| Implementation status | **PENDING VERIFICATION** — no per-tool V4/V6 integration implemented yet |
| Tests and Evidence | **PENDING** |
| Conflict Status | **OPEN** — architecture adoption alone does NOT close W01 |
| Closure | **NOT APPROVED** |
| Evidence level | E1 (files present, uncommitted) |
| Evidence URI | `lib/templates/genius-tool-template.v4.tsx`, `lib/engines/core/v4/`, `components/tools/bmi-pilot.tsx`, `components/tools/protein-needs-pilot.tsx`, `components/tools/water-intake-pilot.tsx`, `components/tools/macro-pilot.tsx` |
| Last verified commit | 5a87f3e5 (baseline; V4 work is uncommitted) |
| Last verified date | 2026-11-09 |
| Owner role | MrXSteroid-dev (V4 workstream) |
| Dependency | G-R6.1-2 |
| Next action | Implement each V4/V6 integration through explicit validated adapter; add per-integration tests and E3+ evidence |
| Closure evidence | Per-integration: adapter implementation + passing tests + E3+ evidence |

### W02 — Dashboard Metrics Route Auth Hardening (Uncommitted)

| Field | Value |
|---|---|
| Design A | G-R6.1-1: Tenant isolation + IAM (RBAC/ABAC) for dashboard routes |
| Implementation B | `app/api/dashboard/metrics/route.ts` auth hardening (modified, uncommitted) + `tests/security/dashboardMetricsRouteAuth.test.ts` |
| Owner Decision C | **PENDING** — commit or revert? |
| Evidence level | E1 (modified file on disk, test exists) |
| Evidence URI | `app/api/dashboard/metrics/route.ts`, `tests/security/dashboardMetricsRouteAuth.test.ts`, `tests/integration/dashboardPersistence.test.ts` |
| Last verified commit | 5a87f3e5 |
| Last verified date | 2026-11-09 |
| Owner role | MrXSteroid-dev (dashboard workstream) |
| Dependency | G-R6.1-1 |
| Next action | Owner approves commit of hardening or directs revert |
| Closure evidence | Commit hash OR revert confirmation |

### W03 — Tool-146 Compat Divergence

| Field | Value |
|---|---|
| Design A | Phase 1 Ruling: Tool 146 compat re-export rendering identical to dynamic route component |
| Implementation B | `components/tools/tool-146-emergency-warning-signs-checklist.tsx` (compat layer) vs canonical |
| Owner Decision C | **PENDING** — canonical engine identity not declared |
| Evidence level | E2 |
| Evidence URI | `components/tools/tool-146-emergency-warning-signs-checklist.tsx` |
| Last verified commit | bfd095e5 |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 1 |
| Dependency | G-R6.1-2 |
| Next action | Owner picks canonical tool-146 identity |
| Closure evidence | Single canonical componentPath in catalog |

### W04 — Tool-108 Engine Divergence

| Field | Value |
|---|---|
| Design A | Phase 1 Ruling: WRAP tool-108 bespoke page preserving body-composition-vision-pilot |
| Implementation B | Bespoke page wrapped; catalog componentPath still points to tool-108 engine |
| Owner Decision C | **PENDING** — canonical engine not chosen |
| Evidence level | E2 |
| Evidence URI | `app/smarttools/body-composition/tool-108-ai-body-composition-vision-engine/page.tsx` |
| Last verified commit | bfd095e5 |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 1 |
| Dependency | G-R6.1-2 |
| Next action | Owner picks canonical engine; align catalog componentPath |
| Closure evidence | Single enginePath matching deployed route component |

### W05 — Macro Bespoke Page Shell-Less

| Field | Value |
|---|---|
| Design A | Phase 1 Ruling: LEAVE macro bespoke page untouched |
| Implementation B | Bespoke macro page renders legacy macro.tsx; catalog points to macro-pilot |
| Owner Decision C | **PENDING** — follow-up scope decision |
| Evidence level | E2 |
| Evidence URI | `app/smarttools/nutrition/macro/page.tsx`, `components/tools/macro.tsx`, `components/tools/macro-pilot.tsx` |
| Last verified commit | bfd095e5 |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 1 |
| Dependency | G-R6.1-2 |
| Next action | Owner authorizes macro migration or confirms bespoke permanence |
| Closure evidence | Route renders catalog componentPath (or bespoke documented as canonical) |

### W06 — Catalog Statusless Arithmetic (13 vs 117)

| Field | Value |
|---|---|
| Design A | SmartToolEntry.status defaults to 'implemented' when omitted |
| Implementation B | 13 baseline #031-#050 with explicit status; ~117 others omit status (implicit 'implemented') |
| Owner Decision C | **RESOLVED** — arithmetic clarified |
| Evidence level | E2 |
| Evidence URI | `lib/tools/smartToolsCatalog.ts` (interface line 36), `lib/tools/smartToolsCatalog6.ts` |
| Last verified commit | 5a87f3e5 |
| Last verified date | 2026-11-09 |
| Dependency | G-R6.1-0 |
| Next action | None |
| Closure evidence | Tracker entry + READINESS.md §4 |

### W07 — 18 UNVERIFIED Placeholder Entries

| Field | Value |
|---|---|
| Design A | 286 requested scope (268 + 18) per SCOPE-286.csv |
| Implementation B | 18 placeholder rows with toolId=NOT_FOUND, filePath=NOT_FOUND |
| Owner Decision C | **PENDING** — scope boundary: 286 (define tools) or 268 (close placeholders) |
| Evidence level | E2 |
| Evidence URI | `scope-reconciliation-286.csv` (rows SR-269 → SR-286) |
| Last verified commit | 5a87f3e5 |
| Last verified date | 2026-11-09 |
| Owner role | R6.1 Activation Preparation |
| Dependency | G-R6.1-0 |
| Next action | Owner declares scope boundary |
| Closure evidence | Owner decision + tool definitions if in scope |

### W08 — Batch 03 13-Tool Test Gap

| Field | Value |
|---|---|
| Design A | Phase 2: each Batch 03 tool needs E3+ test coverage |
| Implementation B | 13 tools without confirmed test files: 149, 131, 129, 080, 084, 039, 041, 043, 044, 047, 056, 061, 063 — **Tool 039 closed 2026-11-11** (44 tool-specific tests: pipeline 9, contract 8, UI 27, all PASS; published-preview browser test). Remaining: 12 tools. |
| Owner Decision C | **PENDING** — investigate alternative coverage first |
| Evidence level | E1 |
| Evidence URI | `components/tools/tool-149-physique-trajectory-simulator.tsx` et al. |
| Last verified commit | 5a87f3e5 |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 2 (Batch 03) |
| Dependency | G-R6.1-0 / G-R6.1-2 |
| Next action | Check alternative coverage; prepare smallest safe test plan (tool 039 done — remaining 12 tools) |
| Closure evidence | Per-tool E4 evidence or documented acceptance of gap — tool 039 evidence: `docs/MRX Genius Cloud Unified R6.1/TOOL-039-ACCEPTANCE.md` |

### W09 — C8 What-If Placeholder vs Engine

| Field | Value |
|---|---|
| Design A | SPEC-R6.1-3 / P2-B: What-If is a calculation engine |
| Implementation B | What-If UI exists; adapter is placeholder; no engine calculation |
| Owner Decision C | **PENDING** — placeholder accepted temporarily or engine required? |
| Evidence level | E2 |
| Evidence URI | `phase2-evidence.md` (What-If column: 5/5 NOT_AVAILABLE) |
| Last verified commit | 5a87f3e5 |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 2 (P2-B) |
| Dependency | G-R6.1-2 |
| Next action | Owner decides placeholder vs engine |
| Closure evidence | Engine adapter + per-tool calculation test |

### W10 — Cross-Tool Navigation UI vs Data Graph

| Field | Value |
|---|---|
| Design A | SPEC-R6.1-2: Cross-Tool data contract (sourceToolId + targetToolId + mappedFields + freshness) |
| Implementation B | P2-C navigation component (prev/next UI) exists; no data transfer |
| Owner Decision C | **PENDING** — data graph scope |
| Evidence level | E2 |
| Evidence URI | `phase2-evidence.md` (Cross-Tool column) |
| Last verified commit | 5a87f3e5 |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 2 (P2-C) |
| Dependency | G-R6.1-2 / G-R6.1-3 |
| Next action | Owner confirms data graph gate placement |
| Closure evidence | Cross-tool data transfer test |

### W11 — Voice/Vision needs:false vs Implementation

| Field | Value |
|---|---|
| Design A | SPEC-R6.1-4: Multimodal Voice + Vision |
| Implementation B | P2-E `needs: false` guards only; no implementation |
| Owner Decision C | **PENDING** — multimodal scope not defined |
| Evidence level | E1 |
| Evidence URI | `phase2-evidence.md` (Voice/Vision column) |
| Last verified commit | 5a87f3e5 |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 2 (P2-E) |
| Dependency | G-R6.1-3 |
| Next action | Owner defines voice/vision scope |
| Closure evidence | Per-tool voice/vision implementation + accuracy test |

### W12 — W18 Database/Session/Sync Prohibition (Hard Constraint)

| Field | Value |
|---|---|
| Design A | W18: No guest/session/cloud sync/database until owner explicitly approves |
| Implementation B | All R6.1 commits suffixed NO_DB; no DB writes |
| Owner Decision C | **ACTIVE** — W18 remains in force |
| Evidence level | E5 (commit suffix verified) |
| Evidence URI | `git log --oneline` (all commits NO_DB) |
| Last verified commit | 5a87f3e5 |
| Last verified date | 2026-11-09 |
| Owner role | R6.1 Crosswalk |
| Dependency | G-R6.1-1+ |
| Next action | Owner lifts W18 explicitly in future decision |
| Closure evidence | Owner-signed W18 lift + DB migration with RLS |

---

## 3. Gap Register

| Gap ID | Description | Gate | Evidence Level | Status | Required Action |
|---|---|---|---|---|---|
| GAP-01 | No server-side auth boundary exists | G-R6.1-1 / D | E1 (contract only) | NOT VERIFIED | Owner decision: auth source and mechanism |
| GAP-02 | CI pipeline not configured | G-R6.1-1 / G | E1 (local scripts only) | NOT VERIFIED | Owner decision: add CI workflow |
| GAP-03 | 4 engines not migrated to unit-system.ts | G-R6.1-1 / B | E2 (analysis) | PARTIAL | Owner-approved precision reconciliation per engine |
| GAP-04 | Batch 03 test gaps (13 tools) | G-R6.1-0/2 | E1 | NOT RUN | Investigate alternative coverage |
| GAP-05 | No durable audit storage | G-R6.1-1 / F | E1 (contract only) | BLOCKED | DB-backed storage unauthorized |
| GAP-06 | No provider activation | G-R6.1-1 / E | E1 (contract only) | BLOCKED | Owner approval required |
| GAP-07 | Tool 016 input has no unit enforcement | G-R6.1-1 / C | E3 | PARTIAL | Document honestly; no invented unit support |
| GAP-08 | Lint/build as separate commands not run | G-R6.1-1 / G | E1 | NOT VERIFIED | Run eslint and next build separately |

---

## 4. Open Conflicts Count (Verified)

| Category | Count | Items |
|---|---|---|
| OPEN | 10 | W01, W02, W03, W04, W05, W07, W08, W09, W10, W11 |
| RESOLVED | 1 | W06 |
| ACTIVE (hard constraint) | 1 | W12 (W18) |
| RESERVED | 12 | W13-W24 |

**Corrected count:** W01-W05 (5) + W07-W11 (5) = 10 open. Prior "11" was an arithmetic error. W06 resolved; W12 active constraint counted separately.

---

## 5. Register Integrity Rules

- No conflict marked closed without E3+ evidence.
- Document update alone does NOT resolve a conflict (owner directive §7).
- W12/W18 remain active hard constraints; not counted as open conflicts.
- W01 architecture ADOPTED but implementation/tests/evidence PENDING; closure NOT APPROVED.
- Missing evidence remains missing; not reported as accepted.
