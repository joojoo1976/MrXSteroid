# TOOL protein-needs — R6.1 FORENSIC AUDIT (comprehensive 2026-11-20)

Mode: **READ-ONLY FORENSIC AUDIT**. No source, contract, schema, route, registry, ledger, git state, or prior report was modified. All values below are source-observed at HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f` or explicitly labelled as recorded/historic.

## A. Tool Identity

| Item | Actual Finding |
|---|---|
| Tool ID | `protein-needs` · `mrx.tool.protein-needs` |
| Name EN | Protein Needs Estimate |
| Name AR | تقدير احتياج البروتين |
| Slug | `protein-needs` |
| Category | nutrition |
| Canonical EN Route | `/smarttools/nutrition/protein-needs` (catalog href; dynamic route `app/smarttools/[category]/[tool]/page.tsx`) |
| Canonical AR Route | `/ar/smarttools/nutrition/protein-needs` via `middleware.ts` `/ar/*` rewrite (E2 static; browser E4 NOT_RUN) |
| Component Path | `components/tools/protein-needs.tsx` (catalog-declared) |
| Engine Path | `lib/tools/engines/protein-needs.v6.ts` (catalog-declared) |
| Pipeline Path | `NOT_FOUND` |
| Schema Path | `lib/tools/schemas/protein-needs.ts` (catalog-declared) |
| Genius Path | `NOT_FOUND` |
| i18n Path | `NOT_FOUND` |
| Batch | NOT_ASSIGNED_IN_AUDIT_SCOPE |
| Registry Status | IN_REGISTRY |
| Catalog Status | implemented |
| Worktree Status | CLEAN |
| Last Relevant Commit | `108d3063` |
| Source SHA-256 (primary file) | `BAA0C72154F60A85B7286DBB9A274BC73404889A386DA05DEA03F09905D66362` |

## B. Overall Status

| Indicator | Percentage | Evidence |
|---|---:|---|
| Implementation Progress | NOT_VERIFIABLE (source-presence proxy 40% / 20 criteria, **E2 only, not credited**) | No functional behaviour or requirement-level weighting proven; file existence is not implementation credit |
| Verified Completion | NOT_VERIFIABLE — 0 requirement-level E3+ rows proven in this audit | E0–E2 excluded; 2 test file(s) discovered; 2 executed-passing row(s) in fresh full-suite run |
| Runtime / Deployment Verification | 0.00% (0 E4+/applicable; NOT_RUN) | No authorized SSO, Preview pinned to `37f047a4`, or Deployment ID |

**Current Development Stage:** P2 (source-presence heuristic, not a verification claim).  
**Last Fully Verified Stage:** NOT_VERIFIED (no stage-level E3+ gate re-executed for this tool in this audit).  
**Overall Classification:** PARTIAL.  
**Owner Review Status:** NOT_DECISIONED — no owner acceptance inferred.

## C. Implemented Content Inventory

| Feature / Component | Status | Source File | Test File | Evidence | Notes |
|---|---|---|---|---|---|
| Route | SOURCE_PRESENT_E2 | `/smarttools/nutrition/protein-needs` / `/ar/smarttools/nutrition/protein-needs` | — | catalog + dynamic route + middleware /ar/* rewrite | EN from catalog; AR via rewrite; E4 NOT_RUN |
| Component | SOURCE_PRESENT_E2 | `components/tools/protein-needs.tsx` | `components/tools/protein-needs-pilot.test.tsx`; `lib/tools/engines/protein-needs.v6.test.ts` | static | no GENIUS markers detected |
| Engine | SOURCE_PRESENT_E2 | `lib/tools/engines/protein-needs.v6.ts` | NOT_AVAILABLE | static | equation correctness NOT_VERIFIED |
| Pipeline | NOT_IMPLEMENTED | `MISSING` | NOT_AVAILABLE | static | no envelope markers detected |
| Schema | SOURCE_PRESENT_E2 | `lib/tools/schemas/protein-needs.ts` | NOT_AVAILABLE | static | Zod/input validation marker: yes |
| i18n | NOT_AVAILABLE | `NOT_FOUND` | NOT_AVAILABLE | static | EN/AR usage marker: no |
| GENIUS-12 / CORE-5 | NOT_IMPLEMENTED | `components/tools/protein-needs.tsx` | NOT_AVAILABLE | static | compact marker: no |

## D. Original R6.1 Compliance

Requirement-level matrix is in `../SMARTTOOLS-R6.1-COMPLIANCE-MATRIX.csv` (all tools, one row per criterion). Static source checks below are E2 at most.

| Original R6.1 principle | Status | Evidence |
|---|---|---|
| Math engine authoritative / deterministic | PARTIAL (E2) | engine path observed; no equation re-derivation |
| Dynamic layer / live recalculation | NOT_IMPLEMENTED (E0) | source markers |
| Cross-tool layer | NOT_APPLICABLE_PENDING | markers only; no payload transfer proof |
| Adaptive layer | NOT_VERIFIABLE | no user-state adaptation proof |
| Explainable layer | NOT_IMPLEMENTED (E0) | source markers |
| ML layer | NOT_APPLICABLE_PENDING | no model/provider evidence in scope |
| Community layer | NOT_APPLICABLE_PENDING | no authorized community feature evidence |
| Five result states | NOT_IMPLEMENTED (E0) | source markers; no browser proof |
| GENIUS-12 / CORE-5 | PARTIAL/NOT_IMPLEMENTED (E2/E0) | source markers |
| Capability contract | NOT_IMPLEMENTED (E0) | source markers |
| EN/AR + RTL | NOT_IMPLEMENTED (E0) | source markers; no E4 |

## E. Tool 039 Comparison

Full 23-benchmark comparison for every tool is in `../SMARTTOOLS-TOOL039-COMPARISON.csv`. Tool 039 is an engineering benchmark only; no specialized 039 feature (De Ritis/OCR/PDF/D-08 history/rating/P-05) is transferred.

| Shared benchmark | Tool 039 | This tool | Gap |
|---|---|---|---|
| Component architecture | FULL — layered chain; E2 static; historic E1 | SOURCE_PRESENT_E2 | Static presence only; no reproduced E3+ |
| Engine/UI separation | FULL — pure engine separated from UI; E2 static | SOURCE_PRESENT_E2 | Static presence only; no reproduced E3+ |
| Input validation | FULL — field validation + Zod; E2 static | SOURCE_PRESENT_E2 | Static presence only; no reproduced E3+ |
| Schema validation | FULL — input/result schemas; E2 static | SOURCE_PRESENT_E2 | Static presence only; no reproduced E3+ |
| Pipeline integrity | FULL structural — tryParse→engine→result schema→envelope; current-HEAD E4 NOT_RUN | NOT_IMPLEMENTED_E0 | NOT_IMPLEMENTED_E0 |
| Equation correctness | FULL declared — fixed ULN/thresholds; E2 static; historic E1 | NOT_VERIFIED | NOT_VERIFIED |
| Result states (5) | FULL declared — EMPTY/PARTIAL/INVALID/FULL/DEGRADED; E2 static | NOT_IMPLEMENTED_E0 | NOT_IMPLEMENTED_E0 |
| GENIUS-12 | FULL — 12 tool-owned boxes with source badges; E2 static | NOT_IMPLEMENTED_E0 | NOT_IMPLEMENTED_E0 |

## F. R6.1 Layers Assessment

| Layer | Applicable? | Implemented? | Verified? | Evidence | Gap |
|---|---|---|---|---|---|
| 1 Math | YES | SOURCE_PRESENT | NO | E2 engine path | equations NOT_VERIFIED |
| 2 Dynamic | YES | NOT_IMPLEMENTED | NO | E2 markers | no E3/E4 |
| 3 Cross-Tool | CONDITIONAL | NOT_IMPLEMENTED | NO | E2 markers | no payload proof |
| 4 Adaptive | CONDITIONAL | NOT_VERIFIED | NO | — | no proof |
| 5 Explainable | YES | NOT_IMPLEMENTED | NO | E2 markers | no E3 |
| 6 ML | NO (no model evidence) | NOT_IMPLEMENTED | N/A | — | do not fabricate ML |
| 7 Community | NO (no authorization) | NOT_IMPLEMENTED | N/A | — | do not fabricate community |

## G. GENIUS-12 & CORE-5

GENIUS box markers: **NOT DETECTED**; CORE-5 compact marker `[2,3,7,9,12]`: **NOT DETECTED**. No DOM/runtime proof exists; browser row `NO-DUP-GENIUS` is `NOT_RUN`. Box-by-box EN/AR/order evidence is NOT_VERIFIED in this audit.

## H. Development Pipeline

| Stage | Status | Evidence |
|---|---|---|
| P0 Discovery & Scope | COMPLETED | catalog identity + route observed |
| P1 Architecture & Contracts | SOURCE_PRESENT_UNVERIFIED | component/engine/schema paths |
| P2 Math / Engine | SOURCE_PRESENT_UNVERIFIED | engine path |
| P3 Pipeline & Schema | NOT_STARTED | pipeline path |
| P4 UI & Results | SOURCE_PRESENT_UNVERIFIED | component path |
| P5 R6.1 Intelligence | NOT_STARTED | markers |
| P6 Safety & Localization | PARTIAL | markers |
| P7 Automated Verification | TEST_FILE_PRESENT_UNVERIFIED | 2 test file(s) |
| P8 Runtime & Browser | NOT_RUN_SSO_REQUIRED | no authorized SSO/Deployment ID |
| P9 Closure | NOT_STARTED | no owner decision |

## I. Test Results

| Test Type | Files | Passed | Failed | Not Run | Clean Reproducible? |
|---|---:|---:|---:|---:|---|
| Full true-clean Vitest (2026-11-20) | 594 files / 5602 tests | 5530 tests / 563 files | 67 tests / 30 files | 5 skipped / 1 file | YES at 37f047a4; exit code 1 |
| This tool's discovered test files | 2 | 2 executed-passing rows | 0 failing row(s) | — | See SMARTTOOLS-TEST-EVIDENCE-MATRIX.csv |

**Mapping caveat:** the test matrix attributes a file to a tool when the tool slug/ID appears in the test source. Generic shared test files are therefore E3 for *execution*, but are NOT tool-specific acceptance proof and do not by themselves award requirement-level E3 rows.

## J. Defects & Gaps

| Severity | Gap | Cause | Blocked requirement |
|---|---|---|---|
| CRITICAL | Browser/runtime E4 evidence | No authorized SSO, Preview pinned to 37f047a4, or Deployment ID | 6 browser rows; blocks 100% |
| CRITICAL | Requirement-level E3 denominator | Canonical per-tool atomic denominator unrecoverable for most tools | Verified Completion cannot be honestly computed |
| HIGH | D-C4 approved sources | Owner/specialist source pack not approved | C4-SOURCES stays NOT_AVAILABLE |
| HIGH | D-C5 referral wording | Qualified wording approval absent | C5-REFERRAL stays NOT_AVAILABLE |
| HIGH | D-CLIN clinical sign-off | No qualified clinical/model reviewer sign-off | CLINICAL-REVIEW stays BLOCKED |
| HIGH | D-W18 history/persistence | Owner decision open; no unauthorized persistence | W18-HISTORY stays NOT_AVAILABLE |
| HIGH | P-03 runtime effectiveness | Runtime-negative/control files untracked or NOT_RUN in true-clean | Structural-only posture preserved |
| MEDIUM | R6 pipeline source | No dedicated pipeline file found | P3 unverified |
| MEDIUM | i18n resource | No dedicated i18n resource found | EN/AR parity unverifiable |

## K. Remaining Work to 100%

- LOCAL: archive reproducible focused E3 evidence at HEAD `37f047a4`; resolve any failing test file; establish an owner-approved atomic denominator.
- EXTERNAL: D-C4 source pack, D-C5 referral wording, D-CLIN sign-off, D-W18 decision, P-03 runtime effectiveness, and authorized SSO/Preview/Deployment ID for six browser rows.
- OWNER: explicit `C=APPROVED` decision; never inferred from audit, tests, or historic acceptance.

## L. Final Decision

**PARTIAL** — not `100% VERIFIED — OWNER REVIEW PENDING`; no owner acceptance inferred.

## M. Delivery Information

| Field | Verified Value |
|---|---|
| Canonical Route | `/smarttools/nutrition/protein-needs` |
| Preview URL | NOT_VERIFIED |
| Deployment ID | NOT_VERIFIED |
| Source SHA | HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f`; primary file SHA-256 `BAA0C72154F60A85B7286DBB9A274BC73404889A386DA05DEA03F09905D66362` |
| Verification Date | 2026-11-20 |
| Evidence Package | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/` |

