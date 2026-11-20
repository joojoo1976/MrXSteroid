# B2b â€” QA/Acceptance Audit Ledger (retry-01)
## Tools 034, 035, 037, 038, 043, 044 (MrXSteroid R6.1)

**Audit type:** read-only, evidence-bounded row-level audit (Barrier 2 input, not closure)  
**Audit date:** 2026-11-19  
**Repo:** `E:\MrXSteroid-main` Â· **Branch:** `feat/r6.1-tools-041-042` Â· **HEAD:** `37f047a4105d078b22edea2c857bf35aefdbdc7f` (verified `git rev-parse HEAD`)  
**Upstream:** `origin/feat/r6.1-tools-041-042` (ahead 1) per `git status --short --branch`  
**Reports dir:** `docs/MRX Genius Cloud Unified R6.1/`  
**True-clean ref:** `E:\p03-true-clean-20261118@37f047a4` (read-only reference; cited where relevant)  
**Contaminated/excluded:** `E:\p03-clean-build-20261118@2a647fda` (not used)  
**Scope/auth constraints honored:** no code/contract/schema/source-ledger/original-acceptance-ledger changes; no git writes; no builds/tsc/eslint/vitest/dev servers/installs executed; no browser/runtime E4 (unavailable). Execution evidence not present in authorized scope recorded as `NOT_RUN` with exact isolated command/env needed. No fabrication.

## Inputs reviewed (read-only, preserved)
| Input | Path | SHA-256 (observed) | Notes |
|---|---|---:|---|
| Prior UNCONFIRMED draft (preserved) | `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/B2b-LEDGER-034-044.md` | `1AF085F1B3C2344B81024AE896D80246FC5ECF5C1397E0575667FC83BCB9E147` | Read in full; contained `SHA-256 of this output file: TBD.`; not modified/replaced. |
| Barrier 1 (retry-01) | `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/retry-01/BARRIER-1-REPORT.md` | `9A896C8AC3DD7B9050A3F78AF376E7D9AC9650CAB406E36D6AAA97E742FCF22C` | Reconciled A/C/D status; hash-integrity note recorded in-file. |
| C P-03 closure report | `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/C-P03-30-PIPELINE-CLOSURE-REPORT.md` | `21FAB73E4030DCF8EFFE1D7B85B9CE8E3D46BC7EFA583B3F0F1655A5081A0E55` | True-clean committed evidence: 32 files / 339 tests PASS at 37f047a4. |
| D rollback (retry-01) | `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/retry-01/D-ROLLBACK-FILE-LEVEL-RECONCILIATION.md` | (not re-hashed this pass) | Referenced as retry-01 evidence context. |
| A integrity/disposition | `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/A-REPOSITORY-INTEGRITY-REPORT.md`, `A-WORKING-TREE-DISPOSITION-FINAL.csv` | (not re-hashed this pass) | Referenced as WT disposition context. |
| Atomic ledger reconciliation | `docs/MRX Genius Cloud Unified R6.1/R6.1-ATOMIC-LEDGER-RECONCILIATION.md` | (not hashed) | Â§3 "Not fully re-audited..." flag context for 035/043/044. |

## Method, evidence levels, and verification rules
- **Original acceptance requirement sources (per tool):** closure-sprint closure ledgers `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-0XX-closure-ledger.md` (+ `.csv` siblings present) treated as the enumerated atomic requirement registers (18 rows each: `ENG-PIPELINE, STATE-5, UI-GENIUS12, I18N-PARITY, EXPORT-CSV, TEST-FOCUSED, BUILD-TSC, PREVIEW-ROUTE, BROWSER-EN-AR, BROWSER-5-STATES, RTL-390, CONSOLE-HYDRATION, NO-DUP-GENIUS, C4-SOURCES, C5-REFERRAL, CLINICAL-REVIEW, W18-HISTORY, P03-PIPELINE`). Dev proposals (`TOOL-034/037/038-DEVELOPMENT-PROPOSALS.md`) reviewed as additional requirement/status context (P-01..P-10) and cited where relevant; 035/043/044 have no matching `TOOL-0XX-DEVELOPMENT-PROPOSALS.md` in `docs/MRX Genius Cloud Unified R6.1/`.
- **Implementation inspection:** static inspection of `components/tools/`, `lib/tools/r6/`, `lib/tools/schemas/`, `i18n/`, `app/smarttools/` and cross-references in `lib/tools/categories.ts`, `lib/tools/smartToolsCatalog6.ts`, `lib/tools/registry.ts`, `lib/legacy-routes.ts`. Tracked/untracked/modified distinguished via `git ls-files` and `git status --porcelain` (see per-tool artifact tables).
- **Statuses:** `PASS | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE` (ledger `NOT_IMPLEMENTED` mapped to `FAIL` for P03-PIPELINE row; noted). `NOT_AVAILABLE â‰  NOT_APPLICABLE`.
- **Evidence levels:** E0â€“E5 scale respected; **no E3/E4/E5 claimed** in this pass because tests/builds/browser were not executed. Static file/pattern evidence capped at **E2** where artifacts exist; structural/code-inspection-only or absence/open-gap evidence recorded as **E1/E0** as appropriate.
- **Verified %:** `PASS(E3+) / Applicable Ã— 100`. Since E3+ not claimable, **verified % = 0%** for all audited tools (evidence-bounded; not a claim of implementation absence).
- **Working tree:** live `git status --short --branch` observed `## feat/r6.1-tools-041-042...origin/feat/r6.1-tools-041-042 [ahead 1]` with 46 modified tracked files and many untracked paths (dirty). Assessment is of live tree at HEAD 37f047a.

## Draft discrepancies/issues corrected in this retry
1. **035/043/044 row-level citation-audit flag:** draft stated ledgers exist and flag closed in substance/open in governance; verified `tool-035/043/044-closure-ledger.md,.csv` exist in `closure-sprint-2026-11-17/` with blob SHAs matching observed hashes. `R6.1-ATOMIC-LEDGER-RECONCILIATION.md` Â§3 not rechecked line-by-line for update status in this pass; treated as governance note, not altered.
2. **037/038 tracked pipeline tests:** confirmed tracked (`lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts`, `...tool-038-stack-compatibility-pipeline.test.ts`).
3. **Artifact tracking precision:** draft did not consistently enumerate tracked/untracked/modified per artifact; this report adds explicit artifact-status evidence (e.g. 034 pipeline test untracked; 035/043/044 genius/ocr/pdf/visual/contracts/pipeline tests largely untracked; `tool-035-hormone-conversion.tsx`, `tool-043-prolactin-management.tsx`, `tool-044-dht-side-effects.tsx`, and 043/044 schemas modified).
4. **Pipeline wiring evidence:** static grep confirms 034/037/038 components import and call R6 pipelines (`runCompoundClearance`, `runSideEffectProbability`, `runStackCompatibility`); 035/043/044 components show no `run*` pipeline imports/calls in inspected patterns while R6 pipeline modules exist â€” ENG-PIPELINE assessed accordingly.
5. **State/export attributes:** 034/037/038 genius expose `data-r6-genius` and `data-r6-genius-state`; 035/043/044 genius files (untracked) inspected by grep show no `data-r6-genius-state` attribute and use client export/clipboard patterns â€” STATE-5/UI-GENIUS12/EXPORT assessed as static evidence with caveats.
6. **C-P03 integration:** added committed true-clean structural evidence and explicit gap that runtime-negative 29-case suite/control are uncommitted and NOT_RUN in true-clean (relevant to 034,035,037,038,043,044 in uncommitted coverage map per C report) â€” affects confidence but not E-level inflation.
7. **Schema/docs hash set:** added SHA-256 for tool-034/037/038 dev proposals and key retry/C/Barrier inputs used.

## Cross-cutting evidence (all 6 tools)
| Topic | Evidence | Implication |
|---|---|---|
| P-03 committed structural gate | `parallel-execution-2026-11-19/C-P03-30-PIPELINE-CLOSURE-REPORT.md` (SHA-256 above): `p03-gate-structural.test.ts` PASS in true-clean 32/339 run; 30/30 pipelines structurally gated/fail-closed/envelope-blocked (committed proof). | Structural P-03 presence evidenced; runtime-negative per-pipeline proof for 034,035,037,038,043,044 not clean-clone proven (cases listed in uncommitted suite, NOT_RUN in TC). |
| Build/tsc focused re-run (live HEAD) | No authorized execution in this pass. | `BUILD-TSC` cannot be claimed E3+; exact isolated command/env: **CWD `E:\MrXSteroid-main` (or clean clone/worktree at 37f047a), Node deps present, no installs**: `npx tsc --noEmit` and/or `npx next build` (project-standard), capture full log + exit code. |
| Focused tests (live HEAD) | No authorized execution in this pass. | `TEST-FOCUSED` cannot be claimed E3+; exact isolated command/env per tool below. |
| Browser/runtime/SSO preview | Not executed; E4 unavailable. Ledgers record SSO-protected preview. | `PREVIEW-ROUTE,BROWSER-EN-AR,BROWSER-5-STATES,RTL-390,CONSOLE-HYDRATION,NO-DUP-GENIUS` = `NOT_RUN` E0. |
| D-gaps | Ledgers + dev proposals cite D-C4/D-C5/D-CLIN/D-W18/D-P03. | `C4-SOURCES,C5-REFERRAL,W18-HISTORY` = `NOT_AVAILABLE` E1 (unless owner states N/A explicitly per row/domain); `CLINICAL-REVIEW` = `BLOCKED` E1; `P03-PIPELINE` = `FAIL` E1 (ledger NOT_IMPLEMENTED for shared P-03 layer). |
| Category/route drift (ledger vs live refs) | `lib/tools/categories.ts`, `lib/tools/smartToolsCatalog6.ts`, `lib/tools/registry.ts`, `lib/legacy-routes.ts` inspected (see per-tool). | Historical ledger category/routes may diverge from current canonical refs; recorded as unsupported historical claims where applicable. |

## Summary across tools
| Tool | Total rows | Applicable | N/A (justified) | PASS (E3+) | PASS (<E3) | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE | Verified % (PASS E3+/Applicable) | Historical ledger completion (source) |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 034 | 18 | 18 | 0 | 0 | 5 | 2 | 6 | 1 | 1 | 3 | **0% (0/18)** | 1/18 (5.56%) in closure ledger |
| 035 | 18 | 18 | 0 | 0 | 1 | 5 | 7 | 1 | 1 | 3 | **0% (0/18)** | 0/18 (0%) in closure ledger |
| 037 | 18 | 18 | 0 | 0 | 6 | 1 | 6 | 1 | 1 | 3 | **0% (0/18)** | 3/18 (16.67%) in closure ledger |
| 038 | 18 | 18 | 0 | 0 | 6 | 1 | 6 | 1 | 1 | 3 | **0% (0/18)** | 3/18 (16.67%) in closure ledger |
| 043 | 18 | 18 | 0 | 0 | 1 | 5 | 7 | 1 | 1 | 3 | **0% (0/18)** | 0/18 (0%) in closure ledger |
| 044 | 18 | 18 | 0 | 0 | 1 | 5 | 7 | 1 | 1 | 3 | **0% (0/18)** | 0/18 (0%) in closure ledger |

**Aggregate:** 108 applicable rows audited (0 N/A), 0 PASS(E3+), 20 PASS(<E3, static), 19 PARTIAL, 39 NOT_RUN, 6 FAIL, 6 BLOCKED, 18 NOT_AVAILABLE. Verified aggregate = **0%** (E3+ not evidenced/executed).

---

## Tool 034 â€” tool-034-compound-clearance

### (a) Source ledger / requirements refs + SHA
| Ref | Path | Git blob | SHA-256 | Note |
|---|---|---|---:|---|
| Closure ledger (atomic 18 rows) | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-034-closure-ledger.md` | `dd723d2da7d6d51c0951fa5c2826ce7599133b93` | `3DCDEE927E64424ACC8835F0C2E45D8F9AF45CE02C6BFCB98EC1325FD2355B09` | Snapshot HEAD 8d7e406c; tool source SHA 19e9301c; route/category stated as cycle-management. |
| Closure ledger CSV | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-034-closure-ledger.csv` | (present) | (not hashed) | Row-level sibling. |
| Dev proposals | `docs/MRX Genius Cloud Unified R6.1/TOOL-034-DEVELOPMENT-PROPOSALS.md` | (present) | `DDA8B082213FC84A5B66D6EEDA8EC1D374D9D5770C5645FB9CFB676D1BDF5FB7` | P-01..P-10 (owner review pending). |
| i18n check script | `docs/MRX Genius Cloud Unified R6.1/tool-034-i18n-check.mjs` | (present) | (not hashed) | Referenced by ledger. |

### (b) Counts
| Total | Applicable | N/A + justification | PASS (E3+) | PASS (<E3) | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE |
|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 18 | 18 | 0 â€” all 18 ledger rows treated as applicable to this tool/register | 0 | 5 | 2 | 6 | 1 | 1 | 3 |

### (c) Verified %
`0%` (0 PASS at E3+ / 18 applicable). Static PASS evidence exists for 5 rows at E2 but does not count toward verified %.

### (d) Row-level table (every atomic requirement)
| Req ID | Requirement (summary) | Applicability | Status | E | Evidence refs (static) | Gap / next action |
|---|---|---|---|---:|---|---|
| ENG-PIPELINE | R6.1 pipeline artifacts/tests; run and capture focused pipeline evidence on current HEAD | APPLICABLE | PASS | E2 | Tracked: `lib/tools/r6/tool-034-compound-clearance-pipeline.ts`, `lib/tools/r6/tool-034-compound-clearance-contract.ts`; wired `components/tools/tool-034-compound-clearance.tsx` (import/call `runCompoundClearance`), `components/tools/tool-034-compound-clearance.genius.tsx`; C-P03 committed structural gate PASS (TC). No tracked pipeline test at HEAD per C report. | Re-run focused pipeline/contract tests on current HEAD and archive log. Cmd/env: CWD repo/clean clone@37f047a, deps present: `npx vitest run lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts` (NOTE: pipeline test is **untracked** in WT, not clean-clone reproducible) and/or relevant tracked tests if designated. |
| STATE-5 | Five-state behavior (EMPTY/PARTIAL/INVALID/FULL/DEGRADED), verify transitions on accessible Preview (E4) | APPLICABLE | PASS | E2 | `components/tools/tool-034-compound-clearance.genius.tsx` exposes `data-r6-genius-state={state}`; component wiring present. | Browser/runtime verification NOT_RUN (SSO/E4 unavailable). Need accessible preview + state-transition capture. |
| UI-GENIUS12 | Fixed 12-box order, CORE-5 behavior, no duplicate shell/hidden box (E4) | APPLICABLE | PASS | E2 | `tool-034-compound-clearance.genius.tsx` has `data-r6-genius="tool-034"` and renders 12 numbered boxes incl. export/history per static inspection markers. | DOM/screenshot verification NOT_RUN. |
| I18N-PARITY | AR/EN parity with evidence | APPLICABLE | PASS | E2 | Tracked: `i18n/tool-034-compound-clearance.json`; `docs/MRX Genius Cloud Unified R6.1/tool-034-i18n-check.mjs`; ledger cites 116/116 PASS (historical, not rerun). `tests/unit/tool-034-i18n-evidence.test.ts` referenced in draft/ledger context (existence not re-listed in artifact scan above). | Re-run parity/evidence on current HEAD. Cmd/env: `node "docs/MRX Genius Cloud Unified R6.1/tool-034-i18n-check.mjs"` and/or `npx vitest run tests/unit/tool-034-i18n-evidence.test.ts` (deps present). NOT_RUN. |
| EXPORT-CSV | Client export implemented and verifiable | APPLICABLE | PASS | E2 | `components/tools/tool-034-compound-clearance.genius.tsx` contains `data-r6-core="export"` and `link.download='tool-034-compound-clearance.csv'`. | Browser/download verification NOT_RUN. |
| TEST-FOCUSED | Focused battery rerun on current HEAD and archived | APPLICABLE | PARTIAL | E2 | Tracked tests present: `components/tools/tool-034-compound-clearance.test.tsx`, `components/tools/tool-034-compound-clearance.dom.test.tsx`, engine/adapter tests referenced by ledger. **Untracked:** `lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts`. No rerun in this pass. | Run and archive focused suite. Cmd/env: `npx vitest run components/tools/tool-034-compound-clearance*.{test,dom.test}.tsx lib/tools/engines/tool-034-compound-clearance.test.ts lib/tools/adapters/tool-031-035-batch.test.ts` (+ untracked pipeline test only in WT context). |
| BUILD-TSC | Clean tsc/build output archived for audited HEAD | APPLICABLE | PARTIAL | E2 | No live run. C-P03/Barrier-1 cite prior deployment/build context (historical), not reverified for live WT. | Archive clean output. Cmd/env: `npx tsc --noEmit`; `npx next build` (clean clone/worktree@37f047a or controlled env, deps installed). |
| PREVIEW-ROUTE | Route loads on accessible preview | APPLICABLE | NOT_RUN | E0 | Tracked route: `app/smarttools/tool-034-compound-clearance/page.tsx`. Ledger notes SSO-protected preview. | Provide unauthenticated/bypass preview; verify route load. |
| BROWSER-EN-AR | EN/AR browser checks | APPLICABLE | NOT_RUN | E0 | Tracked `i18n/tool-034-compound-clearance.json` exists. | Run browser checks on accessible preview (E4). |
| BROWSER-5-STATES | Exercise 5 states in browser | APPLICABLE | NOT_RUN | E0 | Static state markers in genius. | Browser exercise NOT_RUN. |
| RTL-390 | Real 390px RTL browser test | APPLICABLE | NOT_RUN | E0 | AR locale exists. | Real 390px RTL capture NOT_RUN. |
| CONSOLE-HYDRATION | Browser console/hydration capture | APPLICABLE | NOT_RUN | E0 | Next.js page present. | Console capture NOT_RUN. |
| NO-DUP-GENIUS | DOM inspection for duplicate shell/hidden box | APPLICABLE | NOT_RUN | E0 | Genius component present. | DOM inspection NOT_RUN. |
| C4-SOURCES | Approved source/provenance pack or approved N/A | APPLICABLE | NOT_AVAILABLE | E1 | No approved source pack recorded (D-C4 open). | Owner: provide approved source pack or explicit per-tool/domain N/A decision. |
| C5-REFERRAL | Approved referral wording | APPLICABLE | NOT_AVAILABLE | E1 | D-C5 open. | Owner: provide approved wording pack. |
| CLINICAL-REVIEW | Clinical/model review sign-off | APPLICABLE | BLOCKED | E1 | D-CLIN open. | Owner: obtain sign-off. |
| W18-HISTORY | Box 11/history decision/storage | APPLICABLE | NOT_AVAILABLE | E1 | D-W18 open. | Owner: W18 decision. |
| P03-PIPELINE | Shared P-03 pipeline layer/change | APPLICABLE | FAIL | E1 | Ledger: `NOT_IMPLEMENTED` (D-P03). Per-tool pipeline structurally gated (committed) but shared P-03 layer/change not implemented/approved as closed. Uncommitted runtime-negative case for 034 exists in WT suite but NOT_RUN in TC (C report). | Owner: approve/implement shared P-03 change with regression; commit/re-run clean-clone proof. |

### (e) Unsupported historical claims
- Ledger `Category/Route: cycle-management / /smarttools/cycle-management/tool-034-compound-clearance` (also dev proposal text references cycle-management context) conflicts with current refs: `lib/tools/categories.ts` â†’ `pharmacokinetics`, `lib/tools/smartToolsCatalog6.ts` href `/smarttools/pharmacokinetics/tool-034-compound-clearance`, `lib/tools/registry.ts` href `/smarttools/pharmacokinetics/tool-034-compound-clearance` (static inspection). 
- Snapshot/source SHAs in ledger (HEAD 8d7e406c, tool SHA 19e9301c) are historical snapshot metadata, not live HEAD 37f047a.
- Ledger i18n/test/build/preview result statements are historical and not rerun/verified E3+ in this pass.

### (f) Blockers / owner + next action
| Blocker | Owner | Next action |
|---|---|---|
| E3+ execution evidence missing (tests/build/i18n rerun) | Engineering/QA | Run exact commands in isolated env, archive logs/artifacts. |
| Browser/preview checks blocked (SSO, E4 unavailable) | Ops/Release + QA | Provide accessible preview/bypass; execute 6 browser rows. |
| D-C4/C5/CLIN/W18 open | Product/Clinical/Owner | Provide approvals/decisions or explicit N/A where permitted. |
| D-P03 shared layer; uncommitted runtime-negative proof | Pipeline/P-03 owner | Commit/authorize and prove in clean clone. |

---

## Tool 035 â€” tool-035-hormone-conversion

### (a) Source ledger / requirements refs + SHA
| Ref | Path | Git blob | SHA-256 | Note |
|---|---|---|---:|---|
| Closure ledger (atomic 18 rows) | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-035-closure-ledger.md` | `81d545bb11c69cfb62aa712c5fec72beabe79826` | `60279DEC77B77E80F3911AD7F97FDEEE72DCB0075CE0C66ADD1104A0EC23DC38` | Snapshot HEAD 8d7e406c; claims hormonal-health route in header; notes no R6.1 proposals/i18n-check/closure ledger (superseded by existence of ledger). |
| Closure ledger CSV | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-035-closure-ledger.csv` | (present) | (not hashed) | 18 rows. |
| Dev proposals | `docs/MRX Genius Cloud Unified R6.1/TOOL-035-DEVELOPMENT-PROPOSALS.md` | **not found** | n/a | No matching proposals file located in docs root/R6.1 dirs. |

### (b) Counts
| Total | Applicable | N/A + justification | PASS (E3+) | PASS (<E3) | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE |
|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 18 | 18 | 0 | 0 | 1 | 5 | 7 | 1 | 1 | 3 |

### (c) Verified %
`0%` (0/18).

### (d) Row-level table
| Req ID | Requirement (summary) | Applicability | Status | E | Evidence refs (static) | Gap / next action |
|---|---|---|---|---:|---|---|
| ENG-PIPELINE | Pipeline artifacts present; rerun focused evidence | APPLICABLE | PARTIAL | E1 | Tracked pipeline: `lib/tools/r6/tool-035-hormone-conversion-pipeline.ts`. No `runHormoneConversion` wiring observed in `components/tools/tool-035-hormone-conversion.tsx` by grep; untracked contract/test exist in WT. C-P03 structural gate committed (covers 035). | Wire/use R6 pipeline in component if required by acceptance; rerun tests. Cmd/env: `npx vitest run lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts` (untracked in WT), plus component/engine tests as applicable. |
| STATE-5 | Five-state behavior with evidence | APPLICABLE | PARTIAL | E1 | `components/tools/tool-035-hormone-conversion.tsx` modified; untracked `tool-035-hormone-conversion.genius.tsx` exists. No `data-r6-genius-state` marker found in grep for 035 genius/component. | Add/verify R6.1 state markers and runtime state transitions (E4). |
| UI-GENIUS12 | 12-box/CORE-5 closure UI evidence | APPLICABLE | PARTIAL | E1 | Untracked genius component present (`tool-035-hormone-conversion.genius.tsx`) with box/export markers in static grep (clipboard export); closure completeness not browser-verified. | Verify fixed 12-box order/no duplicate shell on preview. |
| I18N-PARITY | R6.1 i18n parity check with evidence | APPLICABLE | NOT_RUN | E0 | Tracked `i18n/tool-035-hormone-conversion.json` exists. No `tool-035-i18n-check.mjs` found in `docs/MRX Genius Cloud Unified R6.1/`. | Create/run parity check and archive evidence. Cmd/env: `node <docs/.../tool-035-i18n-check.mjs>` once available; or designated parity script. |
| EXPORT-CSV | Export implemented and verifiable | APPLICABLE | PASS | E2 | Untracked genius includes client-side CSV/clipboard export pattern (`handleCopyCsv`, `navigator.clipboard.writeText`) per static grep. | Browser verification NOT_RUN. |
| TEST-FOCUSED | Focused battery rerun/archived | APPLICABLE | PARTIAL | E2 | Tracked: `components/tools/tool-035-hormone-conversion.test.tsx`. Untracked: `components/tools/tool-035-hormone-conversion.parity.test.tsx`, `lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts`, `lib/tools/r6/tool-035-hormone-conversion-contract.ts`, ocr/pdf/visual components. No rerun. | Run focused tests and archive. Cmd/env: `npx vitest run components/tools/tool-035-hormone-conversion*.test.tsx lib/tools/engines/tool-035-hormone-conversion.test.ts lib/tools/adapters/tool-031-035-batch.test.ts` (+ untracked parity/pipeline tests in WT). |
| BUILD-TSC | Clean tsc/build output archived | APPLICABLE | PARTIAL | E2 | Not run. | `npx tsc --noEmit` / `npx next build` in clean env. |
| PREVIEW-ROUTE | Route loads on accessible preview | APPLICABLE | NOT_RUN | E0 | Tracked `app/smarttools/tool-035-hormone-conversion/page.tsx`. | Accessible preview verification. |
| BROWSER-EN-AR | EN/AR browser checks | APPLICABLE | NOT_RUN | E0 | i18n JSON present. | Browser NOT_RUN. |
| BROWSER-5-STATES | 5 states in browser | APPLICABLE | NOT_RUN | E0 | â€” | Browser NOT_RUN. |
| RTL-390 | 390px RTL | APPLICABLE | NOT_RUN | E0 | â€” | Browser NOT_RUN. |
| CONSOLE-HYDRATION | Console/hydration | APPLICABLE | NOT_RUN | E0 | â€” | Browser NOT_RUN. |
| NO-DUP-GENIUS | DOM duplicate/shell check | APPLICABLE | NOT_RUN | E0 | â€” | Browser NOT_RUN. |
| C4-SOURCES | Approved source/provenance | APPLICABLE | NOT_AVAILABLE | E1 | D-C4 open. | Owner decision/pack. |
| C5-REFERRAL | Referral wording | APPLICABLE | NOT_AVAILABLE | E1 | D-C5 open. | Owner decision/pack. |
| CLINICAL-REVIEW | Clinical/model sign-off | APPLICABLE | BLOCKED | E1 | D-CLIN open. | Owner sign-off. |
| W18-HISTORY | W18/Box 11 | APPLICABLE | NOT_AVAILABLE | E1 | D-W18 open. | Owner decision. |
| P03-PIPELINE | Shared P-03 layer | APPLICABLE | FAIL | E1 | Ledger NOT_IMPLEMENTED; per-tool pipeline exists (tracked) but not wired in component per static grep; runtime-negative case uncommitted/NOT_RUN in TC. | Implement/approve shared layer; wire pipeline as required; clean-clone proof. |

### (e) Unsupported historical claims
- Ledger header `Category/Route: hormonal-health / /smarttools/hormonal-health/tool-035-hormone-conversion` conflicts with current refs: `categories.ts` â†’ `pharmacokinetics`, catalog/registry href `/smarttools/pharmacokinetics/tool-035-hormone-conversion`.
- Ledger artifact note "no R6.1 proposals/i18n-check/closure ledger" superseded by closure ledger existence (and still no proposals/i18n-check script found).
- Snapshot HEAD 8d7e406c and historical execution claims not rerun at 37f047a.

### (f) Blockers / owner + next action
| Blocker | Owner | Next action |
|---|---|---|
| Pipeline unwired / R6.1 state markers unclear | Engineering | Inspect and align componentâ†”pipeline/state contracts; rerun tests. |
| No i18n-check script; untracked tests/components not clean-clone evidenced | Engineering/QA | Create/check-in parity script as authorized; run focused suite. |
| Browser/D-gaps/P03 | QA/Ops/Clinical/Owner | As per rows. |

---

## Tool 037 â€” tool-037-side-effect-probability

### (a) Source ledger / requirements refs + SHA
| Ref | Path | Git blob | SHA-256 | Note |
|---|---|---|---:|---|
| Closure ledger | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-037-closure-ledger.md` | `41f1a819d47b5f934f098a7bff44938029afa800` | `F95D007A220AFC23C2AA669090937449AF724355A4DBE14FDD048C129E952981` | Batch 4, medical-monitoring. |
| Closure ledger CSV | `.../tool-037-closure-ledger.csv` | (present) | (not hashed) | 18 rows. |
| Dev proposals | `docs/MRX Genius Cloud Unified R6.1/TOOL-037-DEVELOPMENT-PROPOSALS.md` | (present) | `D94FF409EFB3B7D0BD1A023FD28D3478E24E3FFBF8F5790030663B2FAD8F1CB7` | P-01..P-10. |
| i18n check script | `docs/MRX Genius Cloud Unified R6.1/tool-037-i18n-check.mjs` | (present) | (not hashed) | â€” |

### (b) Counts
| Total | Applicable | N/A + justification | PASS (E3+) | PASS (<E3) | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE |
|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 18 | 18 | 0 | 0 | 6 | 1 | 6 | 1 | 1 | 3 |

### (c) Verified %
`0%` (0/18).

### (d) Row-level table
| Req ID | Requirement (summary) | Applicability | Status | E | Evidence refs (static) | Gap / next action |
|---|---|---|---|---:|---|---|
| ENG-PIPELINE | Pipeline artifacts/tests; rerun/archive | APPLICABLE | PASS | E2 | Tracked: `lib/tools/r6/tool-037-side-effect-probability-pipeline.ts`, `...-pipeline.test.ts`, `...-contract.ts`; component wires `runSideEffectProbability`. C-P03 committed structural gate PASS. | Rerun on current HEAD and archive. Cmd/env: `npx vitest run lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts` (tracked). |
| STATE-5 | 5-state behavior, preview-verified | APPLICABLE | PASS | E2 | `tool-037-side-effect-probability.genius.tsx` has `data-r6-genius-state={state}`. | Browser verification NOT_RUN. |
| UI-GENIUS12 | 12-box/CORE-5, DOM verified | APPLICABLE | PASS | E2 | `data-r6-genius="tool-037"` and 12-box render markers present in genius. | DOM/screenshot NOT_RUN. |
| I18N-PARITY | Parity with evidence | APPLICABLE | PASS | E2 | Tracked `i18n/tool-037-side-effect-probability.json`; `docs/.../tool-037-i18n-check.mjs`; ledger cites 88/88 PASS (historical). | Rerun check/tests. Cmd/env: `node "docs/MRX Genius Cloud Unified R6.1/tool-037-i18n-check.mjs"`; `npx vitest run tests/unit/tool-037-i18n-evidence.test.ts` if present. |
| EXPORT-CSV | Export implemented/verifiable | APPLICABLE | PASS | E2 | Genius includes `data-r6-core="export"` and `download='tool-037-side-effect-probability.csv'`. | Browser NOT_RUN. |
| TEST-FOCUSED | Focused battery rerun/archived | APPLICABLE | PASS | E2 | Tracked pipeline test and other referenced tests exist (ledger cites consolidated 17/50 PASS historically). No rerun now. | Rerun focused set and archive. Cmd/env: `npx vitest run lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts lib/tools/engines/tool-037-side-effect-probability.test.ts tests/unit/tool-037-i18n-evidence.test.ts` (as applicable, tracked). |
| BUILD-TSC | Clean build archived | APPLICABLE | PARTIAL | E2 | Not run. | `npx tsc --noEmit` / `npx next build`. |
| PREVIEW-ROUTE | Route loads | APPLICABLE | NOT_RUN | E0 | Tracked `app/smarttools/tool-037-side-effect-probability/page.tsx`. | Accessible preview. |
| BROWSER-EN-AR | EN/AR browser | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| BROWSER-5-STATES | 5 states browser | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| RTL-390 | RTL 390px | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| CONSOLE-HYDRATION | Console/hydration | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| NO-DUP-GENIUS | DOM check | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| C4-SOURCES | Approved source/provenance | APPLICABLE | NOT_AVAILABLE | E1 | D-C4 open. | Owner. |
| C5-REFERRAL | Referral wording | APPLICABLE | NOT_AVAILABLE | E1 | D-C5 open. | Owner. |
| CLINICAL-REVIEW | Clinical sign-off | APPLICABLE | BLOCKED | E1 | D-CLIN open. | Owner. |
| W18-HISTORY | W18 | APPLICABLE | NOT_AVAILABLE | E1 | D-W18 open. | Owner. |
| P03-PIPELINE | Shared P-03 layer | APPLICABLE | FAIL | E1 | Ledger NOT_IMPLEMENTED; runtime-negative case uncommitted/NOT_RUN in TC (C). | Shared P-03 approval/implementation/proof. |

### (e) Unsupported historical claims
- Snapshot HEAD 8d7e406c, historical i18n/test counts and deployment claims not rerun at 37f047a.
- Current route/category refs align with medical-monitoring (`categories.ts`, catalog, registry) â€” consistent with ledger header.

### (f) Blockers / owner + next action
| Blocker | Owner | Next action |
|---|---|---|
| Browser/preview and E3 reruns missing | QA/Ops/Eng | Accessible preview + rerun/archive focused checks. |
| D-C4/C5/CLIN/W18/P03 | Owner/Clinical/Pipeline | Provide approvals/decisions and clean-clone proofs as required. |

---

## Tool 038 â€” tool-038-stack-compatibility

### (a) Source ledger / requirements refs + SHA
| Ref | Path | Git blob | SHA-256 | Note |
|---|---|---|---:|---|
| Closure ledger | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-038-closure-ledger.md` | `5b7de317999fa226e334c40efb9dd677a00d8417` | `AA2CB3AE501A303BEE9A88C34C74C60F65F029F13ECF08A19060609D89F8E51B` | Batch 4, cycle-management. |
| Closure ledger CSV | `.../tool-038-closure-ledger.csv` | (present) | (not hashed) | 18 rows. |
| Dev proposals | `docs/MRX Genius Cloud Unified R6.1/TOOL-038-DEVELOPMENT-PROPOSALS.md` | (present) | `8823847ABA62F6F422107ED62287C691E32456920348A8B925DC8154D8446F76` | P-01..P-10. |
| i18n check script | `docs/MRX Genius Cloud Unified R6.1/tool-038-i18n-check.mjs` | (present) | (not hashed) | â€” |

### (b) Counts
| Total | Applicable | N/A + justification | PASS (E3+) | PASS (<E3) | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE |
|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 18 | 18 | 0 | 0 | 6 | 1 | 6 | 1 | 1 | 3 |

### (c) Verified %
`0%` (0/18).

### (d) Row-level table
| Req ID | Requirement (summary) | Applicability | Status | E | Evidence refs (static) | Gap / next action |
|---|---|---|---|---:|---|---|
| ENG-PIPELINE | Pipeline artifacts/tests; rerun/archive | APPLICABLE | PASS | E2 | Tracked: `lib/tools/r6/tool-038-stack-compatibility-pipeline.ts`, `...-pipeline.test.ts`, `...-contract.ts`; component wires `runStackCompatibility`. C-P03 structural gate PASS. | Rerun. Cmd/env: `npx vitest run lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts`. |
| STATE-5 | 5-state behavior | APPLICABLE | PASS | E2 | Genius has `data-r6-genius-state={state}`. | Browser NOT_RUN. |
| UI-GENIUS12 | 12-box/CORE-5 | APPLICABLE | PASS | E2 | `data-r6-genius="tool-038"` and 12-box markers. | DOM NOT_RUN. |
| I18N-PARITY | Parity evidence | APPLICABLE | PASS | E2 | Tracked i18n JSON + `tool-038-i18n-check.mjs`; ledger cites 86/86 PASS (historical). | Rerun parity/evidence. Cmd/env: `node "docs/MRX Genius Cloud Unified R6.1/tool-038-i18n-check.mjs"`. |
| EXPORT-CSV | Export implemented | APPLICABLE | PASS | E2 | Genius export/download CSV markers present. | Browser NOT_RUN. |
| TEST-FOCUSED | Focused battery | APPLICABLE | PASS | E2 | Tracked pipeline test and other referenced tests exist; historical consolidated pass. | Rerun/archive. Cmd/env: `npx vitest run lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts lib/tools/engines/tool-038-stack-compatibility.test.ts lib/tools/adapters/tool-036-040-batch.test.ts tests/unit/tool-038-i18n-evidence.test.ts` (as applicable). |
| BUILD-TSC | Clean build archived | APPLICABLE | PARTIAL | E2 | Not run. | `npx tsc --noEmit` / `npx next build`. |
| PREVIEW-ROUTE | Route loads | APPLICABLE | NOT_RUN | E0 | Tracked `app/smarttools/tool-038-stack-compatibility/page.tsx`. | Accessible preview. |
| BROWSER-EN-AR | EN/AR browser | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| BROWSER-5-STATES | 5 states browser | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| RTL-390 | RTL 390px | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| CONSOLE-HYDRATION | Console/hydration | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| NO-DUP-GENIUS | DOM check | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| C4-SOURCES | Approved source/provenance | APPLICABLE | NOT_AVAILABLE | E1 | D-C4. | Owner. |
| C5-REFERRAL | Referral wording | APPLICABLE | NOT_AVAILABLE | E1 | D-C5. | Owner. |
| CLINICAL-REVIEW | Clinical sign-off | APPLICABLE | BLOCKED | E1 | D-CLIN. | Owner. |
| W18-HISTORY | W18 | APPLICABLE | NOT_AVAILABLE | E1 | D-W18. | Owner. |
| P03-PIPELINE | Shared P-03 layer | APPLICABLE | FAIL | E1 | Ledger NOT_IMPLEMENTED; runtime-negative case uncommitted/NOT_RUN in TC. | Shared P-03 approval/proof. |

### (e) Unsupported historical claims
- Snapshot HEAD/historical execution claims not rerun at 37f047a.
- Route/category refs align with cycle-management (consistent with ledger).

### (f) Blockers / owner + next action
| Blocker | Owner | Next action |
|---|---|---|
| Browser/preview and E3 reruns | QA/Ops/Eng | Accessible preview + rerun/archive. |
| D-C4/C5/CLIN/W18/P03 | Owner/Clinical/Pipeline | Approvals/decisions/proofs. |

---

## Tool 043 â€” tool-043-prolactin-management

### (a) Source ledger / requirements refs + SHA
| Ref | Path | Git blob | SHA-256 | Note |
|---|---|---|---:|---|
| Closure ledger | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-043-closure-ledger.md` | `cec2aa0b9835d772cc1b382e713c57bb4e4da993` | `DF54B61BC11A42543D074651483B61A27F5C018B033E3AA8CE6E5399DA8D6722` | Batch 1, hormonal-health. |
| Closure ledger CSV | `.../tool-043-closure-ledger.csv` | (present) | (not hashed) | 18 rows. |
| Dev proposals | (not found) | â€” | â€” | No `TOOL-043-DEVELOPMENT-PROPOSALS.md` located. |

### (b) Counts
| Total | Applicable | N/A + justification | PASS (E3+) | PASS (<E3) | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE |
|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 18 | 18 | 0 | 0 | 1 | 5 | 7 | 1 | 1 | 3 |

### (c) Verified %
`0%` (0/18).

### (d) Row-level table
| Req ID | Requirement (summary) | Applicability | Status | E | Evidence refs (static) | Gap / next action |
|---|---|---|---|---:|---|---|
| ENG-PIPELINE | Pipeline artifacts present; rerun focused evidence | APPLICABLE | PARTIAL | E1 | Tracked `lib/tools/r6/tool-043-prolactin-management-pipeline.ts`. Component `tool-043-prolactin-management.tsx` modified; no `runProlactinManagement` wiring observed in grep. Untracked contract/pipeline test present. C-P03 structural gate PASS. | Wire/verify pipeline usage; run tests. Cmd/env: `npx vitest run lib/tools/r6/tool-043-prolactin-management-pipeline.test.ts` (untracked in WT). |
| STATE-5 | 5-state evidence | APPLICABLE | PARTIAL | E1 | No `data-r6-genius-state` marker found for 043 genius/component in grep. Untracked genius exists. | Add/verify state markers and transitions. |
| UI-GENIUS12 | 12-box/CORE-5 evidence | APPLICABLE | PARTIAL | E1 | Untracked genius with client export markers; closure UI not browser-verified. | DOM/screenshot verification. |
| I18N-PARITY | R6.1 parity check | APPLICABLE | NOT_RUN | E0 | Tracked `i18n/tool-043-prolactin-management.json`; no 043 i18n-check script found. | Create/run parity script. |
| EXPORT-CSV | Export implemented | APPLICABLE | PASS | E2 | Untracked genius clipboard CSV export (`writeText`) per grep. | Browser verification NOT_RUN. |
| TEST-FOCUSED | Focused battery rerun | APPLICABLE | PARTIAL | E2 | Tracked component/pipeline in parts per ledger refs historically; WT shows untracked `tool-043-prolactin-management.test.tsx`, contract, pipeline test, ocr/pdf/visual; schema modified. No rerun. | Run/archive. Cmd/env: `npx vitest run components/tools/tool-043-prolactin-management*.test.tsx lib/tools/r6/tool-043-prolactin-management-pipeline.test.ts lib/tools/engines/tool-043-prolactin-management.test.ts lib/tools/adapters/tool-041-045-batch.test.ts` as applicable. |
| BUILD-TSC | Clean build archived | APPLICABLE | PARTIAL | E2 | Not run. | `npx tsc --noEmit` / `npx next build`. |
| PREVIEW-ROUTE | Route loads | APPLICABLE | NOT_RUN | E0 | Tracked `app/smarttools/tool-043-prolactin-management/page.tsx`. | Accessible preview. |
| BROWSER-EN-AR | EN/AR browser | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| BROWSER-5-STATES | 5 states browser | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| RTL-390 | RTL 390px | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| CONSOLE-HYDRATION | Console/hydration | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| NO-DUP-GENIUS | DOM check | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| C4-SOURCES | Approved source/provenance | APPLICABLE | NOT_AVAILABLE | E1 | D-C4. | Owner. |
| C5-REFERRAL | Referral wording | APPLICABLE | NOT_AVAILABLE | E1 | D-C5. | Owner. |
| CLINICAL-REVIEW | Clinical sign-off | APPLICABLE | BLOCKED | E1 | D-CLIN. | Owner. |
| W18-HISTORY | W18 | APPLICABLE | NOT_AVAILABLE | E1 | D-W18. | Owner. |
| P03-PIPELINE | Shared P-03 layer | APPLICABLE | FAIL | E1 | Ledger NOT_IMPLEMENTED; runtime-negative case uncommitted/NOT_RUN in TC. | Shared P-03 proof. |

### (e) Unsupported historical claims
- Snapshot/historical execution claims not rerun.
- Current route/category refs align with hormonal-health (consistent with ledger).

### (f) Blockers / owner + next action
| Blocker | Owner | Next action |
|---|---|---|
| Unwired pipeline/state markers and untracked artifacts | Engineering/QA | Align implementation, run/check-in tests as authorized. |
| Browser/D-gaps/P03 | QA/Ops/Clinical/Owner | Standard follow-ups. |

---

## Tool 044 â€” tool-044-dht-side-effects

### (a) Source ledger / requirements refs + SHA
| Ref | Path | Git blob | SHA-256 | Note |
|---|---|---|---:|---|
| Closure ledger | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-044-closure-ledger.md` | `dc71cf7ffde554ce91176f75e3d0bea57997169b` | `9CC4F81D9F30635CAE231ABCF5624D4B59603E821E9478DC72E087BFD0F1CCEE` | Batch 1; header claims hormonal-health route. |
| Closure ledger CSV | `.../tool-044-closure-ledger.csv` | (present) | (not hashed) | 18 rows. |
| Dev proposals | (not found) | â€” | â€” | No `TOOL-044-DEVELOPMENT-PROPOSALS.md` located. |

### (b) Counts
| Total | Applicable | N/A + justification | PASS (E3+) | PASS (<E3) | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE |
|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 18 | 18 | 0 | 0 | 1 | 5 | 7 | 1 | 1 | 3 |

### (c) Verified %
`0%` (0/18).

### (d) Row-level table
| Req ID | Requirement (summary) | Applicability | Status | E | Evidence refs (static) | Gap / next action |
|---|---|---|---|---:|---|---|
| ENG-PIPELINE | Pipeline artifacts present; rerun focused evidence | APPLICABLE | PARTIAL | E1 | Tracked `lib/tools/r6/tool-044-dht-side-effects-pipeline.ts`. Component modified; no `runDhtSideEffects` wiring observed in grep. Untracked contract/pipeline test present. C-P03 structural gate PASS. | Wire/verify pipeline usage; run tests. Cmd/env: `npx vitest run lib/tools/r6/tool-044-dht-side-effects-pipeline.test.ts` (untracked in WT). |
| STATE-5 | 5-state evidence | APPLICABLE | PARTIAL | E1 | No `data-r6-genius-state` marker found for 044 in grep. Untracked genius exists. | Add/verify state markers/transitions. |
| UI-GENIUS12 | 12-box/CORE-5 evidence | APPLICABLE | PARTIAL | E1 | Untracked genius with export markers; not browser-verified. | DOM/screenshot verification. |
| I18N-PARITY | R6.1 parity check | APPLICABLE | NOT_RUN | E0 | Tracked i18n JSON exists; no 044 i18n-check script found. | Create/run parity script. |
| EXPORT-CSV | Export implemented | APPLICABLE | PASS | E2 | Untracked genius clipboard CSV export (`writeText`) per grep. | Browser verification NOT_RUN. |
| TEST-FOCUSED | Focused battery rerun | APPLICABLE | PARTIAL | E2 | WT has untracked component test/contract/pipeline test/ocr/pdf/visual; schema modified; tracked pipeline exists. No rerun. | Run/archive focused suite. Cmd/env: `npx vitest run components/tools/tool-044-dht-side-effects*.test.tsx lib/tools/r6/tool-044-dht-side-effects-pipeline.test.ts lib/tools/engines/tool-044-dht-side-effects.test.ts lib/tools/adapters/tool-041-045-batch.test.ts` as applicable. |
| BUILD-TSC | Clean build archived | APPLICABLE | PARTIAL | E2 | Not run. | `npx tsc --noEmit` / `npx next build`. |
| PREVIEW-ROUTE | Route loads | APPLICABLE | NOT_RUN | E0 | Tracked `app/smarttools/tool-044-dht-side-effects/page.tsx`. | Accessible preview. |
| BROWSER-EN-AR | EN/AR browser | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| BROWSER-5-STATES | 5 states browser | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| RTL-390 | RTL 390px | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| CONSOLE-HYDRATION | Console/hydration | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| NO-DUP-GENIUS | DOM check | APPLICABLE | NOT_RUN | E0 | â€” | NOT_RUN. |
| C4-SOURCES | Approved source/provenance | APPLICABLE | NOT_AVAILABLE | E1 | D-C4. | Owner. |
| C5-REFERRAL | Referral wording | APPLICABLE | NOT_AVAILABLE | E1 | D-C5. | Owner. |
| CLINICAL-REVIEW | Clinical sign-off | APPLICABLE | BLOCKED | E1 | D-CLIN. | Owner. |
| W18-HISTORY | W18 | APPLICABLE | NOT_AVAILABLE | E1 | D-W18. | Owner. |
| P03-PIPELINE | Shared P-03 layer | APPLICABLE | FAIL | E1 | Ledger NOT_IMPLEMENTED; runtime-negative case uncommitted/NOT_RUN in TC. | Shared P-03 proof. |

### (e) Unsupported historical claims
- Ledger header `Category/Route: hormonal-health / /smarttools/hormonal-health/tool-044-dht-side-effects` conflicts with current refs: `categories.ts` â†’ `medical-monitoring`, `smartToolsCatalog6.ts`/`registry.ts` href `/smarttools/medical-monitoring/tool-044-dht-side-effects` (also consistent with closure-sprint route checks referenced in draft context).
- Snapshot/historical execution claims not rerun at 37f047a.

### (f) Blockers / owner + next action
| Blocker | Owner | Next action |
|---|---|---|
| Unwired pipeline/state markers, untracked artifacts | Engineering/QA | Align and re-verify with focused runs. |
| Category/ledger-route contradiction | Product/Docs/Eng | Reconcile canonical route/category vs historical ledger as authorized (doc/process decision). |
| Browser/D-gaps/P03 | QA/Ops/Clinical/Owner | Standard follow-ups. |

---

## Unresolved items and owners (consolidated)
| Item | Applies to | Owner | Next action / exact command-env (if execution needed) |
|---|---|---|---|
| Focused tests not rerun; some pipeline/contract/genius tests untracked (not clean-clone proven) | 034,035,037,038,043,044 (esp. 035/043/044) | Engineering/QA | In WT or clean clone as appropriate with deps present: run tool-specific vitest targets listed above; archive logs. Untracked tests require authorized check-in to become clean-clone reproducible. |
| No build/tsc evidence at audited HEAD | all | Engineering | `npx tsc --noEmit` and `npx next build` in clean env (deps installed), capture outputs. |
| i18n parity not rerun (035/043/044 also lack R6.1 i18n-check scripts) | all | Engineering/QA | Run existing scripts for 034/037/038; create+run for 035/043/044 if required. |
| Browser/preview/runtime E4 unavailable, SSO-protected | all 6 browser rows | Ops/Release + QA | Provide unauthenticated/bypass preview; execute EN/AR, 5 states, RTL 390px, console/hydration, DOM duplicate checks. |
| D-C4 approved sources/provenance | all | Owner/Clinical/Content | Provide approved pack or explicit N/A. |
| D-C5 referral wording | all | Owner/Clinical | Provide approved wording. |
| D-CLIN sign-off | all | Clinical reviewer | Obtain sign-off. |
| D-W18 history/storage | all | Product/Owner | Decision/implementation scope. |
| D-P03 shared pipeline layer; runtime-negative clean-clone proof gap | all | Pipeline/P-03 owner | Approve/implement shared change; commit `p03-runtime-negative-coverage.test.ts`/control as authorized; rerun in clean clone (see C report). |
| Pipeline wiring/state-marker gaps (static) | 035,043,044 (+ verify 034/037/038 at runtime) | Engineering | Reconcile component wiring and R6.1 state/UI contracts; verify with tests/browser. |
| Route/category ledger drift | 034,035,044 | Product/Docs/Eng | Reconcile historical ledger claims with canonical routing/categories. |

## Requirement enumeration note
- **Fully enumerated from located row-level sources:** 18 atomic rows per tool from each `tool-0XX-closure-ledger.md/.csv` in closure-sprint-2026-11-17 (108 rows total). No additional distinct row-level acceptance ledger files for 034/035/037/038/043/044 were located under `docs/MRX Genius Cloud Unified R6.1/` or `closure-sprint/` beyond these ledgers and their CSV siblings during this audit. Dev proposal registers (P-01..P-10) exist for 034/037/038 and were reviewed but are a different granularity; 035/043/044 lack proposal files in-scope. **Conclusion:** atomic row enumeration for the closure-ledger register is complete; broader "every historical acceptance requirement" outside these registers cannot be exhaustively guaranteed from in-repo sources alone without a designated master acceptance spec per tool.

## Output integrity
- **Output path:** `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/retry-01/B2b-LEDGER-034-044.md`
- **SHA-256 of this output file (final saved bytes):** `6E6E6E0355D29F3CC13EC36329093FF9AA1A0C660E60B6AFEED0B12E771585BB`
