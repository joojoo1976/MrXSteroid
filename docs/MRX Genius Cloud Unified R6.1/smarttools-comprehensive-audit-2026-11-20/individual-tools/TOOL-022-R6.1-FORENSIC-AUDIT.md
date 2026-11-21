# TOOL 022 — R6.1 FORENSIC AUDIT (comprehensive 2026-11-20)

Mode: **READ-ONLY FORENSIC AUDIT**. No source, contract, schema, route, registry, ledger, git state, or prior report was modified. All values below are source-observed at HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f` or explicitly labelled as recorded/historic.

## A. Tool Identity

| Item | Actual Finding |
|---|---|
| Tool ID | `022` · `mrx.tool.022-half-life-stacker` |
| Name EN | Half-Life Stacker |
| Name AR | مركب نصف العمر |
| Slug | `tool-022-half-life-stacker` |
| Category | pharmacokinetics |
| Canonical EN Route | `/smarttools/pharmacokinetics/tool-022-half-life-stacker` (catalog href; dynamic route `app/smarttools/[category]/[tool]/page.tsx`) |
| Canonical AR Route | `/ar/smarttools/pharmacokinetics/tool-022-half-life-stacker` via `middleware.ts` `/ar/*` rewrite (E2 static; browser E4 NOT_RUN) |
| Component Path | `components/tools/tool-022-half-life-stacker.tsx` (catalog-declared) |
| Engine Path | `lib/tools/engines/tool-022-half-life-stacker.ts` (catalog-declared) |
| Pipeline Path | `lib/tools/r6/tool-022-half-life-stacker-pipeline.ts` |
| Schema Path | `lib/tools/schemas/tool-022-half-life-stacker.ts` (catalog-declared) |
| Genius Path | `components/tools/tool-022-half-life-stacker.genius.tsx` |
| i18n Path | `i18n/tool-022-half-life-stacker.json` |
| Batch | Batch 1–4 phase-next scope |
| Registry Status | IN_REGISTRY |
| Catalog Status | implemented |
| Worktree Status | CLEAN |
| Last Relevant Commit | `9bee0deb` |
| Source SHA-256 (primary file) | `A9EC74CA3F3DCD9F518C081A28F4BA38B7A6EE420CD93A4105F8B831BF518E77` |

## B. Overall Status

| Indicator | Percentage | Evidence |
|---|---:|---|
| Implementation Progress | NOT_VERIFIABLE (source-presence proxy 100% / 20 criteria, **E2 only, not credited**) | No functional behaviour or requirement-level weighting proven; file existence is not implementation credit |
| Verified Completion | 5.56% (RECORDED E1; canonical denominator unrecoverable; not re-awarded) | E0–E2 excluded; 4 test file(s) discovered; 3 executed-passing row(s) in fresh full-suite run |
| Runtime / Deployment Verification | 0.00% (0 E4+/applicable; NOT_RUN) | No authorized SSO, Preview pinned to `37f047a4`, or Deployment ID |

**Current Development Stage:** P7 (source-presence heuristic, not a verification claim).  
**Last Fully Verified Stage:** NOT_VERIFIED (no stage-level E3+ gate re-executed for this tool in this audit).  
**Overall Classification:** PARTIAL.  
**Owner Review Status:** NOT_DECISIONED — no owner acceptance inferred.

**Recorded phase-next decision:** `REPAIR` — denominator `18-row operational only`, PASS(E3+) `1/18`, completion `5.56%`. This is recorded E1 evidence and is not re-awarded by this audit. See `phase-next/R6.1-29-TOOLS-VS-039-COMPARISON.csv`.

## C. Implemented Content Inventory

| Feature / Component | Status | Source File | Test File | Evidence | Notes |
|---|---|---|---|---|---|
| Route | SOURCE_PRESENT_E2 | `/smarttools/pharmacokinetics/tool-022-half-life-stacker` / `/ar/smarttools/pharmacokinetics/tool-022-half-life-stacker` | — | catalog + dynamic route + middleware /ar/* rewrite | EN from catalog; AR via rewrite; E4 NOT_RUN |
| Component | SOURCE_PRESENT_E2 | `components/tools/tool-022-half-life-stacker.tsx` | `components/tools/tool-022-half-life-stacker.test.tsx`; `lib/tools/engines/tool-022-half-life-stacker.test.ts`; `lib/tools/r6/p03-gate-structural.test.ts`; `tests/unit/tool-022-i18n-evidence.test.ts` | static | GENIUS markers detected |
| Engine | SOURCE_PRESENT_E2 | `lib/tools/engines/tool-022-half-life-stacker.ts` | NOT_AVAILABLE | static | equation correctness NOT_VERIFIED |
| Pipeline | SOURCE_PRESENT_E2 | `lib/tools/r6/tool-022-half-life-stacker-pipeline.ts` | NOT_AVAILABLE | static | envelope/safeParse markers detected |
| Schema | SOURCE_PRESENT_E2 | `lib/tools/schemas/tool-022-half-life-stacker.ts` | NOT_AVAILABLE | static | Zod/input validation marker: yes |
| i18n | SOURCE_PRESENT_E2 | `i18n/tool-022-half-life-stacker.json` | NOT_AVAILABLE | static | EN/AR usage marker: yes |
| GENIUS-12 / CORE-5 | SOURCE_PRESENT_E2 | `components/tools/tool-022-half-life-stacker.genius.tsx` | NOT_AVAILABLE | static | compact marker: yes |

## D. Original R6.1 Compliance

Requirement-level matrix is in `../SMARTTOOLS-R6.1-COMPLIANCE-MATRIX.csv` (all tools, one row per criterion). Static source checks below are E2 at most.

| Original R6.1 principle | Status | Evidence |
|---|---|---|
| Math engine authoritative / deterministic | PARTIAL (E2) | engine path observed; no equation re-derivation |
| Dynamic layer / live recalculation | PARTIAL (E2) | source markers |
| Cross-tool layer | PARTIAL (E2) | markers only; no payload transfer proof |
| Adaptive layer | NOT_VERIFIABLE | no user-state adaptation proof |
| Explainable layer | PARTIAL (E2) | source markers |
| ML layer | NOT_APPLICABLE_PENDING | no model/provider evidence in scope |
| Community layer | NOT_APPLICABLE_PENDING | no authorized community feature evidence |
| Five result states | PARTIAL (E2) | source markers; no browser proof |
| GENIUS-12 / CORE-5 | PARTIAL (E2) | source markers |
| Capability contract | PARTIAL (E2) | source markers |
| EN/AR + RTL | PARTIAL (E2) | source markers; no E4 |

## E. Tool 039 Comparison

Full 23-benchmark comparison for every tool is in `../SMARTTOOLS-TOOL039-COMPARISON.csv`. Tool 039 is an engineering benchmark only; no specialized 039 feature (De Ritis/OCR/PDF/D-08 history/rating/P-05) is transferred.

| Shared benchmark | Tool 039 | This tool | Gap |
|---|---|---|---|
| Component architecture | FULL — layered chain; E2 static; historic E1 | PARTIALLY_APPLICABLE - same pattern; pipeline test untracked, no debounce | PARTIALLY_APPLICABLE - same pattern; pipeline test untracked, no debounce |
| Engine/UI separation | FULL — pure engine separated from UI; E2 static | APPLICABLE - both pure deterministic; different domains; fix recommendation naming | APPLICABLE - both pure deterministic; different domains; fix recommendation naming |
| Input validation | FULL — field validation + Zod; E2 static | PARTIALLY_APPLICABLE - input/result Zod + isToolOutput; lacks tracked negative proof | PARTIALLY_APPLICABLE - input/result Zod + isToolOutput; lacks tracked negative proof |
| Schema validation | FULL — input/result schemas; E2 static | PARTIALLY_APPLICABLE - input/result Zod + isToolOutput; lacks tracked negative proof | PARTIALLY_APPLICABLE - input/result Zod + isToolOutput; lacks tracked negative proof |
| Pipeline integrity | FULL structural — tryParse→engine→result schema→envelope; current-HEAD E4 NOT_RUN | PARTIALLY_APPLICABLE - input/result Zod + isToolOutput; lacks tracked negative proof | PARTIALLY_APPLICABLE - input/result Zod + isToolOutput; lacks tracked negative proof |
| Equation correctness | FULL declared — fixed ULN/thresholds; E2 static; historic E1 | APPLICABLE - both pure deterministic; different domains; fix recommendation naming | APPLICABLE - both pure deterministic; different domains; fix recommendation naming |
| Result states (5) | FULL declared — EMPTY/PARTIAL/INVALID/FULL/DEGRADED; E2 static | PARTIALLY_APPLICABLE - honest 5-state union and what-if probes; no E3/E4 or debounce | PARTIALLY_APPLICABLE - honest 5-state union and what-if probes; no E3/E4 or debounce |
| GENIUS-12 | FULL — 12 tool-owned boxes with source badges; E2 static | PARTIALLY_APPLICABLE - 12 boxes static; C4 has no approved source pack | PARTIALLY_APPLICABLE - 12 boxes static; C4 has no approved source pack |

## F. R6.1 Layers Assessment

| Layer | Applicable? | Implemented? | Verified? | Evidence | Gap |
|---|---|---|---|---|---|
| 1 Math | YES | SOURCE_PRESENT | NO | E2 engine path | equations NOT_VERIFIED |
| 2 Dynamic | YES | SOURCE_PRESENT | NO | E2 markers | no E3/E4 |
| 3 Cross-Tool | CONDITIONAL | SOURCE_PRESENT | NO | E2 markers | no payload proof |
| 4 Adaptive | CONDITIONAL | NOT_VERIFIED | NO | — | no proof |
| 5 Explainable | YES | SOURCE_PRESENT | NO | E2 markers | no E3 |
| 6 ML | NO (no model evidence) | NOT_IMPLEMENTED | N/A | — | do not fabricate ML |
| 7 Community | NO (no authorization) | NOT_IMPLEMENTED | N/A | — | do not fabricate community |

## G. GENIUS-12 & CORE-5

GENIUS box markers: **DETECTED (E2)**; CORE-5 compact marker `[2,3,7,9,12]`: **DETECTED (E2)**. No DOM/runtime proof exists; browser row `NO-DUP-GENIUS` is `NOT_RUN`. Box-by-box EN/AR/order evidence is NOT_VERIFIED in this audit.

## H. Development Pipeline

| Stage | Status | Evidence |
|---|---|---|
| P0 Discovery & Scope | COMPLETED | catalog identity + route observed |
| P1 Architecture & Contracts | SOURCE_PRESENT_UNVERIFIED | component/engine/schema paths |
| P2 Math / Engine | SOURCE_PRESENT_UNVERIFIED | engine path |
| P3 Pipeline & Schema | SOURCE_PRESENT_UNVERIFIED | pipeline path |
| P4 UI & Results | SOURCE_PRESENT_UNVERIFIED | component path |
| P5 R6.1 Intelligence | SOURCE_PRESENT_UNVERIFIED | markers |
| P6 Safety & Localization | SOURCE_PRESENT_UNVERIFIED | markers |
| P7 Automated Verification | TEST_FILE_PRESENT_UNVERIFIED | 4 test file(s) |
| P8 Runtime & Browser | NOT_RUN_SSO_REQUIRED | no authorized SSO/Deployment ID |
| P9 Closure | NOT_STARTED | no owner decision |

## I. Test Results

| Test Type | Files | Passed | Failed | Not Run | Clean Reproducible? |
|---|---:|---:|---:|---:|---|
| Full true-clean Vitest (2026-11-20) | 594 files / 5602 tests | 5530 tests / 563 files | 67 tests / 30 files | 5 skipped / 1 file | YES at 37f047a4; exit code 1 |
| This tool's discovered test files | 4 | 3 executed-passing rows | 1 failing row(s) | — | See SMARTTOOLS-TEST-EVIDENCE-MATRIX.csv |

**Failing file(s) affecting this tool:** `tests/unit/tool-022-i18n-evidence.test.ts`. Failures are preserved, not erased.
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
| CRITICAL | Failing test files | tests/unit/tool-022-i18n-evidence.test.ts | Full-suite exit code 1; must be triaged |

## K. Remaining Work to 100%

- LOCAL: archive reproducible focused E3 evidence at HEAD `37f047a4`; resolve any failing test file; establish an owner-approved atomic denominator.
- EXTERNAL: D-C4 source pack, D-C5 referral wording, D-CLIN sign-off, D-W18 decision, P-03 runtime effectiveness, and authorized SSO/Preview/Deployment ID for six browser rows.
- OWNER: explicit `C=APPROVED` decision; never inferred from audit, tests, or historic acceptance.

## L. Final Decision

**PARTIAL** — not `100% VERIFIED — OWNER REVIEW PENDING`; no owner acceptance inferred.

## M. Delivery Information

| Field | Verified Value |
|---|---|
| Canonical Route | `/smarttools/pharmacokinetics/tool-022-half-life-stacker` |
| Preview URL | NOT_VERIFIED |
| Deployment ID | NOT_VERIFIED |
| Source SHA | HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f`; primary file SHA-256 `A9EC74CA3F3DCD9F518C081A28F4BA38B7A6EE420CD93A4105F8B831BF518E77` |
| Verification Date | 2026-11-20 |
| Evidence Package | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/` |

