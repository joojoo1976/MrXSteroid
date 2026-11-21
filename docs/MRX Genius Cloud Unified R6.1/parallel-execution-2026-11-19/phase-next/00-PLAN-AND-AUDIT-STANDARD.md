# R6.1 Phase Next — Plan and Individual Audit Standard (phase-next)

| Field | Value |
|---|---|
| Date | 2026-11-19 |
| Branch | `feat/r6.1-tools-041-042` |
| Fixed baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` |
| Handover | `retry-01/BARRIER-2-REPORT.md` (SHA `F31F8512CCF9D7129C8E9932C499347A588E8CFD398A33ADFF1E4F84BC828059`) |
| Mode | Read-only audit/documentation. Code changes are a later, separately authorized phase. |
| Concurrency | Max **2** concurrent read-only auditing workers. |

## 1. Scope (exact)

29 tools: `006,008,014,015,016,017,022,023,025,026,027,029,031,034,035,037,038,040,041,042,043,044,045,046,047,048,049,050,051`.
Tool `039` is engineering reference only, never one of the 29. No Batch 5/6.

## 2. Deliverables (all additive, this directory unless stated)

| ID | File |
|---|---|
| W1 | `R6.1-TOOL-039-ENGINEERING-REFERENCE-PROFILE.md` |
| W2 | `TOOL-XXX-INDIVIDUAL-DEVELOPMENT-AUDIT.md` (×29) |
| W3 | `R6.1-29-TOOLS-VS-039-COMPARISON.csv` (Tool 039 on a separate reference row/section) |
| W4a | `R6.1-INDIVIDUAL-TOOL-DEVELOPMENT-ROADMAP.md` |
| W4b | `R6.1-TOOL-PRIORITY-AND-DEPENDENCY-MATRIX.md` |
| W5 | F readiness input note (separate; external gates remain separate) |
| W6 | `R6.1-INDIVIDUAL-TOOLS-DEVELOPMENT-DASHBOARD.md` |
| DEV | `TOOL-XXX-IMPLEMENTATION-CHANGELOG.md`, `TOOL-XXX-VERIFICATION-REPORT.md` (only for tools actually changed, later phase) |

## 3. Non-negotiable rules

1. **Canonical denominator:** the generic 18-row closure register is NOT automatically the official acceptance denominator. For every tool, recover all atomic requirements from authoritative sources (Initial Prompt/SPEC/ACCEPTANCE/CLOSURE-LAYER, tool-specific requirement CSV/ledger, closure ledger MD/CSV, proposals, chronology, owner decisions). Produce a one-to-one mapping: `Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping`. If the canonical denominator cannot be fully recovered, say so explicitly and list what is missing. Never invent a denominator.
2. **Evidence levels:** E0 none, E1 assertion, E2 file/static code, E3 reproducible test, E4 authorized runtime/browser, E5 independent audit. Only E3+ counts as PASS in the completion formula. E2 stays E2.
3. **Formula:** `Completion % = 100 × PASS(E3+) / Applicable Atomic Requirements`. `NOT_AVAILABLE ≠ NOT_APPLICABLE`. Unresolved rows block 100%.
4. **Independence:** engine S9 + browser S0 is valid. Report S0–S11 per component; never a single misleading stage. Never award S10/S11 from a plan's existence.
5. **Preservation:** no deletion/rewrite of working code; no mock as proof; no invented AI/history/storage; no change of tool IDs/slugs/routes; no hiding FAIL/BLOCKED.
6. **Special restrictions:** 039 reference-only, historic baseline separate from P-01–P-05 (P-05 unadopted/owner-gated); 041 `OWNER_REVIEW — NOT ACCEPTED — NOT CLOSED`; 042 `STOPPED — ORDER 580`; 008 `STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL`; 023 separate (a) acceptance grid from (b) Result-Schema rejection and (c) Envelope proof; 050/051 correct E2 misclassification without erasing history; 051 Arabic i18n fix separate/scoped; W18 no unauthorized persistence/history; P-03 negative/control tests approval-gated.
7. **No claims beyond evidence:** never equate file existence with functionality, test plan with executed test, audit completion with development completion, or verified with owner-accepted.
8. **Hash discipline:** observed on-disk SHA-256 is authoritative where an embedded self-hash differs. Never edit an original to "fix" a hash.

## 4. Standard report skeleton — `TOOL-XXX-INDIVIDUAL-DEVELOPMENT-AUDIT.md`

Header table: Tool ID, canonical name/slug, category, canonical route, batch, baseline HEAD, audit date, source-ledger refs + observed SHA-256, status of tool decision.

- **A. Tool Identity and Historical Lineage** — ID, name, slug, category, route, registry status, implementation paths, historical start, relevant commits/SHAs, last modified SHA, batch, original requirements, owner decisions, historical acceptance, current owner.
- **B. Original and R6.1 Requirements** — canonical denominator mapping table per rule 1; count totals (canonical applicable / N-A justified / unmapped); source authority conflict log (source, location, impact, resolution required).
- **C. Existing Architecture and Implementation** — file inventory table: exact path, git status (tracked/untracked/modified via `git ls-files`/`git status --porcelain`), commit membership/SHA where useful, dependencies, component role, test files, actual implementation status.
- **D. Math Engine and Equation Audit** — equations, variables, units, conversion (convert-once), validation, zero/negative/NaN/Infinity, boundaries, precision, determinism, result schema, purity, source traceability; note tests run vs NOT_RUN.
- **E. Pipeline and Schema Audit** — input→output chain, input schema guards, result schema validation, contract, error propagation, P-03 structural/runtime status.
- **F. AI and Intelligence Capabilities** — AI brain/prompt/context/explanation/prediction/what-if/uncertainty/safety/limits; distinguish Implemented/Connected/Tested/RuntimeVerified/Unavailable/Blocked/NotApplicable. A prompt or button is not proof of runtime AI.
- **G. CORE-5 and GENIUS-12** — element-by-element matrix: requirement, applicable, designed, implemented, tested, runtime-verified, evidence, gap, next action; ordering/visibility/compact-full parity.
- **H. Dynamic Results and UI Maturity** — EMPTY/PARTIAL/FULL/INVALID/DEGRADED, MVO, live recalculation/debounce, compact/full, interaction, responsive, accessibility, keyboard; separate Static Inspection / Component Test / Integration Test / True-Clean / Browser E4.
- **I. Cross-Tool and Data Integration** — contracts, producer/consumer, mapped fields, freshness/stale action, error propagation; W18 boundary.
- **J. Safety, Sources and Privacy** — validation, API boundaries, auth, data exposure, logging, storage, AI safety, domain warnings, red flags, referral, clinical review (D-C4/C5/CLIN).
- **K. Localization and Browser Maturity** — i18n parity evidence, EN/AR, RTL/LTR, 390px/1440px, console/hydration, E4 prerequisites (SSO + Preview pinned to `37f047a4` + Deployment ID).
- **L. Tests and Evidence** — evidence register: ID, requirement ID, source file, test command, environment, source SHA, date, actual result, level, reproducibility, validity, compatibility with current HEAD.
- **M. Defect and Gap Register** — severity CRITICAL/HIGH/MEDIUM/LOW/INFORMATIONAL; defect ID, requirement ID, exact file, actual vs expected, evidence, impact, root cause, recommended fix, regression risk. Separate **implementation gaps** from **evidence gaps**.
- **N. Development Maturity Matrix** — S0–S11 per component (identity, requirements, architecture, engine, pipeline, UI, AI/CORE5/GENIUS12, cross-tool/safety, testing, true-clean, browser, external), each with highest verified stage + next missing stage + bottleneck.
- **O. Comparison with Tool 039** — applicable engineering criteria only; dimensions Architecture/Engine/Validation/AI/Dynamic Results/CORE-5/GENIUS-12/Cross-Tool/Safety/Testing/Browser; each APPLICABLE/PARTIALLY_APPLICABLE/NOT_APPLICABLE/NOT_AVAILABLE/NOT_VERIFIED with engineering reason; action Preserve/Extend/Fix. No similarity score.
- **P. Next Development Tasks** — exact file, proposed change, required tests, dependencies, risk, expected outcome, acceptance criterion. Only genuine gaps; reuse passing code. Shared-component changes require Change Impact Matrix.
- **Q. Current Tool Decision** — one of PRESERVE / CONTINUE / REPAIR / EXTEND / BLOCKED / NOT_APPLICABLE / NOT_VERIFIED, with completion % and explicit statement that no owner acceptance is implied.

End with observed on-disk SHA-256 of the produced file (note if an embedded self-hash differs).

## 5. Work order / progress

| Round | Worker A | Worker B | Status |
|---|---|---|---|
| 1 | W1 Tool 039 profile (incl. E1 row-level reconciliation + E4 10-vs-12 investigation) | W2 audits 006,008,014,015 | not started |
| 2 | W2 audits 016,017,022,023 | W2 audits 025,026,027,029,031 | not started |
| 3 | W2 audits 034,035,037,038 | W2 audits 040,041,042,043,044 | not started |
| 4 | W2 audits 045,046,047 | W2 audits 048,049,050,051 | not started |
| 5 | W3 comparison CSV + W4 roadmap/dependency matrix (needs all 29 audits) | W5 F readiness note | not started |
| 6 | W6 dashboard + integrity verification | — | not started |
| 7 | Phase D scoped implementation, one tool at a time, only after audit + authorization | — | gated |

Each worker must read this standard first and honor all constraints. Workers write only their assigned files under `phase-next/`.
