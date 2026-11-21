# W01–W24 CONFLICT AND REMEDIATION TRACKER — MRX Genius Cloud Unified R6.1

**Document version:** 1.1  
**Date:** 2026-11-09  
**Gate position:** G-R6.1-0 (closed — accepted at E2) → G-R6.1-1 (foundations in progress)  
**Status:** R6.1 Governing Standard ACTIVE / OWNER APPROVED (2026-11-09); Operational Activation NOT ACTIVE / NOT VERIFIED

This tracker updates the W01–W24 conflict log from ACCEPTANCE_CRITERIA.md / R6.1-CLOSURE-LAYER.md without erasing historical records. Each entry lists the three-way reconciliation (Design A / Implementation B / Owner Decision C) with evidence level, URI, commit, date, owner role, dependency, next action, and closure evidence. **Missing evidence remains missing** — no item is marked closed without E3+ evidence.

---

## W01 — V4 Template/Adapter vs V6 Component Authority (BMI, Protein, Water, Macro Pilots)

| Field | Value |
|---|---|
| Design A | SPEC-R6.1-3: CORE-5 + GENIUS-12 visual standard (slider, tooltip, badges) |
| Implementation B | V4 migration: `lib/templates/genius-tool-template.v4.tsx` + `lib/engines/core/v4/` + BMI/Protein/Water/Macro V4 pilots (uncommitted, in progress) |
| Architecture Decision | **ADOPTED** (additive architecture, Owner Directive §5, 2026-11-09) — V4 provides reusable presentation/contracts/adapters; existing V6 deterministic engines remain authoritative for established calculations; V4 integrates only through explicit, validated adapters; no blanket migration or engine replacement; existing tool identities and routes intact |
| Implementation | **PENDING VERIFICATION** (V4/V6 integrations not yet implemented/tested per-tool) |
| Tests and Evidence | **PENDING** |
| Conflict Status | **OPEN** |
| Closure | **NOT APPROVED** — architecture adoption alone does not resolve W01; per §7, no closure without implemented integrations + verifiable tests/evidence |
| Evidence level | E1 (files present, uncommitted) |
| Evidence URI | `lib/templates/genius-tool-template.v4.tsx`, `lib/engines/core/v4/`, `components/tools/bmi-pilot.tsx`, `components/tools/protein-needs-pilot.tsx`, `components/tools/water-intake-pilot.tsx`, `components/tools/macro-pilot.tsx` |
| Last verified commit | 5a87f3e5 (baseline; V4 work is uncommitted) |
| Last verified date | 2026-11-09 |
| Owner role | MrXSteroid-dev (V4 workstream) |
| Dependency | G-R6.1-2 (Dynamic input/results, visual 5/12) |
| Next action | Implement each V4/V6 integration through its explicit validated adapter; add per-integration tests and evidence; preserve V6 engines, tool IDs, routes |
| Closure evidence | Per-integration: adapter implementation + passing tests + E3+ evidence (doc update or architecture adoption alone does NOT close W01) |

---

## W02 — Dashboard Metrics Route Auth Hardening (Uncommitted)

| Field | Value |
|---|---|
| Design A | G-R6.1-1: Tenant isolation + IAM (RBAC/ABAC) for dashboard routes |
| Implementation B | `app/api/dashboard/metrics/route.ts` auth hardening (modified, uncommitted) + `tests/security/dashboardMetricsRouteAuth.test.ts` |
| Owner Decision C | **PENDING** — commit or revert? |
| Evidence level | E1 (modified file on disk, test exists) |
| Evidence URI | `app/api/dashboard/metrics/route.ts`, `tests/security/dashboardMetricsRouteAuth.test.ts`, `tests/integration/dashboardPersistence.test.ts` |
| Last verified commit | 5a87f3e5 (baseline; hardening is uncommitted) |
| Last verified date | 2026-11-09 |
| Owner role | MrXSteroid-dev (dashboard workstream) |
| Dependency | G-R6.1-1 (Contracts, units, tenant isolation, IAM) |
| Next action | Owner approves commit of hardening or directs revert |
| Closure evidence | Commit hash OR revert confirmation |

---

## W03 — Tool-146 Compat Divergence (Emergency Warning Signs vs AI Safety Gate)

| Field | Value |
|---|---|
| Design A | Phase 1 Ruling: Tool 146 compat re-export (`tool-146-emergency-warning-signs-checklist.tsx` rendering identical to dynamic route component) |
| Implementation B | `components/tools/tool-146-emergency-warning-signs-checklist.tsx` (compat layer) vs `components/tools/tool-146-ai-safety-gate-emergency-protocol.tsx` (canonical) |
| Owner Decision C | **PENDING** — canonical engine identity not yet declared |
| Evidence level | E2 (both files on disk; identity unresolved) |
| Evidence URI | `components/tools/tool-146-emergency-warning-signs-checklist.tsx`, legacy toolId `mrx.tool.146-ai-safety-gate-emergency-protocol` |
| Last verified commit | bfd095e5 (Phase 1) |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 1 (route fix) |
| Dependency | G-R6.1-2 (Dynamic input/results, navigation) |
| Next action | Owner picks canonical tool-146 identity; compat layer removed or documented |
| Closure evidence | Single canonical componentPath in catalog + route |

---

## W04 — Tool-108 Engine Divergence (body-composition-vision.v6 vs tool-108-...)

| Field | Value |
|---|---|
| Design A | Phase 1 Ruling: WRAP tool-108 bespoke page (preserve `body-composition-vision-pilot`) vs DELETE (swap to `tool-108-...` engine) |
| Implementation B | Bespoke page wrapped with shell (preserves `body-composition-vision-pilot` component); catalog `componentPath` still points to `tool-108-...` engine |
| Owner Decision C | **PENDING** — canonical engine not yet chosen |
| Evidence level | E2 (divergence documented, engine choice pending) |
| Evidence URI | `app/smarttools/body-composition/tool-108-ai-body-composition-vision-engine/page.tsx`, legacy toolId `mrx.tool.108-ai-body-composition-vision-engine` |
| Last verified commit | bfd095e5 (Phase 1) |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 1 (route fix) |
| Dependency | G-R6.1-2 |
| Next action | Owner picks canonical engine; catalog componentPath aligned |
| Closure evidence | Single enginePath in catalog matching deployed route component |

---

## W05 — Macro Bespoke Page Shell-Less (Coverage 267/268)

| Field | Value |
|---|---|
| Design A | Phase 1 Ruling: LEAVE `app/smarttools/nutrition/macro/page.tsx` bespoke untouched (slug `macro` = 19th shadow, outside owner's 18) |
| Implementation B | Bespoke macro page renders legacy `macro.tsx`; catalog `componentPath` points to `macro-pilot` (shell-less pilot component) |
| Owner Decision C | **PENDING** — follow-up scope decision |
| Evidence level | E2 (divergence documented) |
| Evidence URI | `app/smarttools/nutrition/macro/page.tsx`, `components/tools/macro.tsx` (legacy), `components/tools/macro-pilot.tsx` (pilot) |
| Last verified commit | bfd095e5 (Phase 1) |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 1 (route fix) |
| Dependency | G-R6.1-2 (Dynamic input/results, navigation, approved preferences) |
| Next action | Owner authorizes macro page migration to dynamic route or confirms bespoke permanence |
| Closure evidence | Route renders catalog componentPath (or bespoke is documented as canonical) |

---

## W06 — Catalog Statusless-Entries Arithmetic (13 vs 117)

| Field | Value |
|---|---|
| Design A | `SmartToolEntry.status?: 'implemented' \| 'planned'` with `'implemented'` default when omitted |
| Implementation B | 13 baseline #031–#050 entries with explicit `status: 'implemented'` in `smartToolsCatalog6.ts`; ~117 other entries omit status (implicit `'implemented'`) |
| Owner Decision C | **RESOLVED (this package)** — arithmetic clarified (see §6 of R6.1-ACTIVATION-READINESS.md) |
| Evidence level | E2 (arithmetic reconciled; no tool is `'planned'`) |
| Evidence URI | `lib/tools/smartToolsCatalog.ts` (interface, line 36), `lib/tools/smartToolsCatalog6.ts` (13 explicit statuses) |
| Last verified commit | 5a87f3e5 |
| Last verified date | 2026-11-09 |
| Owner role | R6.1 Activation Preparation |
| Dependency | G-R6.1-0 |
| Next action | None — arithmetic clarified; all 269 entries are published |
| Closure evidence | This tracker entry + R6.1-ACTIVATION-READINESS.md §4 |

---

## W07 — 18 UNVERIFIED Placeholder Entries (Scope Boundary)

| Field | Value |
|---|---|
| Design A | 286 requested scope (268 + 18) per SCOPE-286.csv |
| Implementation B | 18 placeholder rows (UNVERIFIED-001 → UNVERIFIED-018) with `toolId=NOT_FOUND`, `filePath=NOT_FOUND` — no file, route, registry, or catalog entry exists |
| Owner Decision C | **PENDING** — are the 18 in scope (define new tools) or out of scope (286 = 268 confirmed)? |
| Evidence level | E2 (placeholders traced individually in scope-reconciliation-286.csv, rows SR-269 → SR-286) |
| Evidence URI | `scope-reconciliation-286.csv` (rows SR-269 to SR-286), `docs/MrXSteroid_Genius_Intelligence_V4.0/SMARTTOOLS-AUDIT-2026-11-07/SCOPE-286.csv` |
| Last verified commit | 5a87f3e5 |
| Last verified date | 2026-11-09 |
| Owner role | R6.1 Activation Preparation |
| Dependency | G-R6.1-0 |
| Next action | Owner declares scope boundary: 286 (define tools) or 268 (close placeholders) |
| Closure evidence | Owner decision + (if in scope) tool definitions in catalog + components |

---

## W08 — Batch 03 13-Tool Test Gap

| Field | Value |
|---|---|
| Design A | Phase 2 verification: each Batch 03 tool needs E3+ test coverage |
| Implementation B | 13 tools were reported without dedicated test files: 149, 131, 129, 080, 084, 039, 041, 043, 044, 047, 056, 061, 063. **Tool 039 closed on 2026-11-11**: `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts` (9), `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.test.ts` (8), `components/tools/tool-039-liver-enzyme-tracker.test.tsx` (27) — 44 tool-specific tests, all PASS. Remaining: 12 tools. |
| Owner Decision C | **PENDING** — investigate alternative coverage first, then decide if 13 tests are needed |
| Evidence level | E1 (tool files present; test file presence NOT VERIFIED in this package) |
| Evidence URI | `components/tools/tool-149-physique-trajectory-simulator.tsx`, tool-131, tool-129, tool-080, tool-084, tool-039, tool-041, tool-043, tool-044, tool-047, tool-056, tool-061, tool-063 |
| Last verified commit | 5a87f3e5 (Phase 2) |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 2 (Batch 03) |
| Dependency | G-R6.1-0 (evidence) + G-R6.1-2 |
| Next action | Check for alternative test files / integration coverage; prepare smallest safe test plan |
| Closure evidence | Per-tool E4 evidence (test file + passing run) OR documented acceptance of coverage gap |

---

## W09 — C8 What-If Placeholder vs Engine

| Field | Value |
|---|---|
| Design A | SPEC-R6.1-3 / P2-B: What-If component is a calculation engine (scenario modeling) |
| Implementation B | What-If UI exists (P2-B Pie Chart + What-If components delivered) but adapter is placeholder — no engine calculation |
| Owner Decision C | **PENDING** — placeholder accepted as temporary or engine required before G-R6.1-2? |
| Evidence level | E2 (UI present, engine missing) |
| Evidence URI | `phase2-evidence.md` (What-If column: 5/5 tools NOT_AVAILABLE) |
| Last verified commit | 5a87f3e5 (Phase 2) |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 2 (P2-B) |
| Dependency | G-R6.1-2 |
| Next action | Owner decides: placeholder (E2 accepted) or engine implementation (E3+ required) |
| Closure evidence | Engine adapter file + per-tool calculation test |

---

## W10 — Cross-Tool Navigation UI vs Data Graph

| Field | Value |
|---|---|
| Design A | SPEC-R6.1-2: Cross-Tool data contract (sourceToolId + targetToolId + mappedFields + freshnessRule + staleAction) |
| Implementation B | P2-C Cross-Tool navigation component exists (prev/next graph UI) but no data transfer between tools |
| Owner Decision C | **PENDING** — data graph is G-R6.1-3 or out of R6.1 scope? |
| Evidence level | E2 (navigation UI present; data graph missing) |
| Evidence URI | `phase2-evidence.md` (Cross-Tool column: prev/next graph ready, data graph NOT DONE) |
| Last verified commit | 5a87f3e5 (Phase 2) |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 2 (P2-C) |
| Dependency | G-R6.1-2 (navigation) + G-R6.1-3 (data graph) |
| Next action | Owner confirms data graph is G-R6.1-3 or defers; navigation-only accepted for G-R6.1-2 |
| Closure evidence | Cross-tool data transfer test (Body Fat 7d / Sleep 1d / Lab 90d freshness) |

---

## W11 — Voice/Vision `needs: false` vs Implementation

| Field | Value |
|---|---|
| Design A | SPEC-R6.1-4: Multimodal (Voice + Vision) capabilities |
| Implementation B | P2-E Voice/Vision applicability guards (`needs: false` marker) only — no voice or vision implementation |
| Owner Decision C | **PENDING** — multimodal scope not yet defined |
| Evidence level | E1 (guard files only) |
| Evidence URI | `phase2-evidence.md` (Voice/Vision column: `needs: false` for all 5 primary tools) |
| Last verified commit | 5a87f3e5 (Phase 2) |
| Last verified date | 2026-11-09 |
| Owner role | R6 Phase 2 (P2-E) |
| Dependency | G-R6.1-3 (AI Core, RAG, Memory) |
| Next action | Owner defines voice/vision scope (which tools, which inputs/outputs) before G-R6.1-3 |
| Closure evidence | Per-tool voice/vision implementation + accuracy test |

---

## W12 — W18 Database/Session/Sync Prohibition (Hard Constraint)

| Field | Value |
|---|---|
| Design A | W18: No guest/session/cloud synchronization/database implementation until owner explicitly approves it |
| Implementation B | No DB writes in any R6.1 commit (all commits suffixed `NO_DB`); `dashboardPersistence.test.ts` is a test-only file (no production DB code) |
| Owner Decision C | **ACTIVE** — W18 remains in force until explicit owner approval |
| Evidence level | E5 (every R6.1 commit explicitly NO_DB; verified by commit suffix) |
| Evidence URI | `git log --oneline` (ab6f728a, bfd095e5, 5a87f3e5 all suffix `NO_DB`) |
| Last verified commit | 5a87f3e5 |
| Last verified date | 2026-11-09 |
| Owner role | R6.1 Crosswalk (W18) |
| Dependency | G-R6.1-1 (Contracts, IAM, audit) — W18 must be lifted before any DB work |
| Next action | Owner lifts W18 explicitly in a future decision doc; no developer lifts it unilaterally |
| Closure evidence | Owner-signed W18 lift + DB migration with RLS policy |

---

## W13–W24 — Reserved (No Active Conflicts)

W13 through W24 are reserved for future conflict entries. No conflicts currently mapped to W13–W24. When new conflicts arise, append entries here with the same 10-field structure (Design A / Implementation B / Owner Decision C / Evidence level / Evidence URI / Last verified commit / Last verified date / Owner role / Dependency / Next action / Closure evidence).

---

## Tracker Summary

| Status | Count |
|---|---|
| OPEN | **10** (W01, W02, W03, W04, W05, W07, W08, W09, W10, W11) — W01 architecture ADOPTED but implementation/tests/evidence PENDING (closure NOT APPROVED) |
| RESOLVED (this package) | 1 (W06) |
| ACTIVE (hard constraint) | 1 (W12) |
| RESERVED | 12 (W13–W24) |

**Corrected open-conflict count (owner reconciliation, 2026-11-09):** **10 open** = W01, W02, W03, W04, W05, W07, W08, W09, W10, W11. W06 is RESOLVED (arithmetic clarified, tracker §W06). W12 is an ACTIVE hard constraint (W18), not counted as an open conflict. Prior "11 open" was an arithmetic error: W01–W05 (5) + W07–W11 (5) = 10. No conflict is closed without E3+ evidence.

**R6.1 Governing Standard is ACTIVE / OWNER APPROVED** per owner approval 2026-11-09 (R6.1-ACTIVATION-DECISION.md §6). **Operational Activation is NOT ACTIVE / NOT VERIFIED**. G-R6.1-0 accepted at E2; W01 remains OPEN until its implementation/tests/evidence closure conditions are met.
