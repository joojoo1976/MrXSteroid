# B1a â€” Row-Level Ledger Audit (Retry-01) â€” Tools 006, 008, 014, 015 (R6.1)

**Audit type:** Read-only evidence audit + documentation only (Workstream B, subteam B1a, retry-01). **Barrier 2 input (not closure).**  
**Generated:** 2026-11-19  
**Repo:** `E:\MrXSteroid-main` | **Branch:** `feat/r6.1-tools-041-042` | **HEAD:** `37f047a4105d078b22edea2c857bf35aefdbdc7f`  
**True-clean ref (context):** `E:\p03-true-clean-20261118@37f047a4` (used by C report for committed r6 suite evidence).  
**Contaminated/excluded:** `E:\p03-clean-build-20261118@2a647fda` (not used).  

## Scope, constraints, and method
- **In scope (Batch 1 subset):** Tools **006**, **008**, **014**, **015**.
- **Authorized:** read-only audit + documentation only. No code/contract/schema/source-ledger/original-acceptance-ledger changes. No git writes. No builds/tsc/eslint/vitest/dev servers/installs. No browser/runtime E4 (unavailable). No fabrication.
- **Evidence method:** static inspection of tracked/untracked/modified artifacts at HEAD worktree + review of recorded results/docs in `docs/MRX Genius Cloud Unified R6.1/` and `closure-sprint/` (including A/C/D/Barrier-1/parallel-execution evidence). Execution not performed in this audit; missing execution recorded as `NOT_RUN` with exact isolated command/env where applicable.
- **Artifact status:** `tracked` = in git index at HEAD; `untracked` = present in WT, not tracked; `modified` = tracked with local modification (`git status --short`).
- **Evidence ladder (R6.1-CLOSURE-LAYER):** E0 none, E1 claim/decision-only, E2 file/static presence, E3 passing test reproducible from clean clone (recorded or verified), E4 live/browser run, E5 independent audit.
- **Verified %:** `PASS(E3+) / Applicable Ã— 100`. Rows at E0â€“E2 do not count toward verified %, even if status is PASS by static/recorded claim below E3.
- **Classification rules:** `NOT_AVAILABLE â‰  NOT_APPLICABLE`. Tool 008 pipeline/runtime posture preserved as `STRUCTURAL_VALIDATION_ONLY â€” RUNTIME_EFFECTIVENESS_PARTIAL` (no invented independent rejection proof).
- **Preserved existing draft (not modified):** `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/B1a-LEDGER-006-015.md` (observed SHA-256 `7F30B98421609F3057FE842EA3463EAA810693E5962096EB56CD9565C5F16EC6`).

## Summary across tools (strict, this audit)

| Tool | Total | Applicable | N/A (+justification) | PASS (E3+) | PASS (<E3) | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE | NOT_IMPLEMENTED | Verified % = PASS(E3+)/Applicable |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 006 `tool-006-estrogen-prolactin` | 18 | 18 | 0 | 0 | 4 | 2 | 7 | 0 | 1 | 3 | 1 | **0.00% (0/18)** |
| 008 `tool-008-side-effect-tracker` | 18 | 18 | 0 | 3 | 3 | 1 | 6 | 0 | 1 | 3 | 1 | **16.67% (3/18)** |
| 014 `tool-014-water-retention` | 18 | 18 | 0 | 3 | 3 | 1 | 6 | 0 | 1 | 3 | 1 | **16.67% (3/18)** |
| 015 `tool-015-shbg-modulator` | 18 | 18 | 0 | 0 | 0 | 6 | 7 | 0 | 1 | 3 | 1 | **0.00% (0/18)** |

**Notes:** PASS(E3+) rows for 008/014 rely on recorded/committed clean-clone evidence cited below (closure sprint records and/or C true-clean run at `37f047a4` including tracked pipeline/i18n-evidence tests in `lib/tools/r6` suite). No tests/builds/browser checks were re-executed in this retry audit.

## Draft discrepancies/issues corrected (vs preserved draft)
- **Clean retry artifact:** produced as a new file under `retry-01/`; preserved original draft unchanged (hash recorded above).
- **Encoding/integrity:** written as clean UTF-8 text; removed placeholder/incomplete self-hash issue by computing and recording final SHA-256 at end.
- **Source traceability expanded:** added explicit per-tool source/requirements refs with SHA-256 (closure ledgers MD/CSV, SMARTTOOLS sources, proposals, i18n checks, R6.1/C/P03/Barrier/F/A evidence docs as applicable) instead of relying on a single stale ledger ref.
- **Baseline/evidence reconciliation:** reconciled stale ledger snapshot (`8d7e406c`, 2026-11-17) claims against current HEAD `37f047a4`, C-P03 true-clean committed-suite evidence, P03 closure report, and live WT tracked/untracked status.
- **Tool 008 posture clarified:** explicitly retained `STRUCTURAL_VALIDATION_ONLY â€” RUNTIME_EFFECTIVENESS_PARTIAL` for P03/runtime-effectiveness; no independent rejection proof invented.
- **Tool 006/015 P03 nuance corrected/refined:** distinguished committed structural gate (present at HEAD for committed pipelines) from tracked valid-branch/runtime-negative coverage gaps and untracked pipeline/contract/component tests; avoided overstating closure.
- **Artifact tracking precision:** enumerated key tracked vs untracked vs modified implementation/test/doc artifacts per tool (including routes, i18n JSON, engines, schemas context) rather than partial mentions.
- **Unattributed/unsupported claims separated:** each tool lists unsupported historical claims explicitly; recorded results marked as not re-executed where applicable.

---

## TOOL 006 â€” `tool-006-estrogen-prolactin` (Batch 1, hormonal-health)

### (a) Source ledger / requirements refs + SHA
| Ref | Path | SHA-256 | Notes |
|---|---|---|---|
| Closure ledger (MD, primary atomic 18-row register) | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-006-closure-ledger.md` | `0055AD3541EA33BA7EB0CDCC8CC65E74437FD42AEE4B4E5B8C57BA7FAD0135EB` | Snapshot HEAD `8d7e406c` (stale vs current). |
| Closure ledger (CSV) | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-006-closure-ledger.csv` | `97D285A407D6E721AFB310B97191895F3F7C611AB7F8D008656987DB085B3787` | Row mirror of register. |
| Source/limits disposition | `docs/SMARTTOOLS_TOOL_006_SOURCES.md` | `087AB4F0F799DE31F331960AAF5BC3C0833508FC8605886EABF440A9DE78DC09` | No clinical interpretation by implementation; no local storage/persistence claimed. |
| I18n resource | `i18n/tool-006-estrogen-prolactin.json` | `60FD7E1AD6B9236A9DC24B571E3403B333DFAE598500A5238F8E6B674EB60746` | Tracked, modified in WT. |
| P03 closure context | `docs/MRX Genius Cloud Unified R6.1/R6.1-P03-RESULTSCHEMA-CLOSURE-REPORT.md` | (cited) | Row 1 (006): structural gate PASS, valid runtime tracked NOT_RUN, invalid runtime PASS in uncommitted suite, pipeline test untracked/none tracked. |
| Pipeline closure audit | `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/C-P03-30-PIPELINE-CLOSURE-REPORT.md` | observed `21FAB73E4030DCF8EFFE1D7B85B9CE8E3D46BC7EFA583B3F0F1655A5081A0E55` (integrity note in Barrier-1) | 006: structural PASS in committed TC; no tracked individual pipeline test at HEAD; runtime-negative uncommitted/NOT_RUN in TC. |
| Readiness/evidence indexes | `R6.1-PREVIEW-INDEX.md`, `CLOSURE-SPRINT-DASHBOARD-2026-11-17.md`, `CLOSURE-SPRINT-FINAL-REPORT-2026-11-17.md`, `parallel-execution-2026-11-19/F-BROWSER-SOURCE-CLINICAL-READINESS.md`, `retry-01/BARRIER-1-REPORT.md`, `A-REPOSITORY-INTEGRITY-REPORT.md`, `A-WORKING-TREE-DISPOSITION-FINAL.csv` | (cited) | Recorded claims, browser NOT_RUN (SSO), WT disposition/tracking context. |

**I18n parity script:** `docs/MRX Genius Cloud Unified R6.1/tool-006-i18n-check.mjs` â€” **MISSING** (verified).  
**Route (canonical):** `app/smarttools/tool-006-estrogen-prolactin/page.tsx` (tracked). Preview URL recorded: `https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/hormonal-health/tool-006-estrogen-prolactin` (SSO-protected per ledgers).  
**Key implementation artifacts (static):**
- Pipeline: `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.ts` (**tracked**) â€” `runEstrogenProlactin`, input `tryParse`, `AromatizationScoreSchema.safeParse(engineResult)` gate, fail-closed before envelope.
- Pipeline test: `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.test.ts` (**untracked**).
- Contract: `lib/tools/r6/tool-006-estrogen-prolactin-contract.ts` (**untracked**, present) â€” includes `buildEstrogenProlactinCsv`, reference limits/sources structures (static).
- Component: `components/tools/tool-006-estrogen-prolactin.tsx` (**tracked, modified**) â€” 5-state `UiState`, calls `runEstrogenProlactin`.
- Genius/UI submodules: `components/tools/tool-006-estrogen-prolactin.genius.tsx|.ocr.tsx|.pdf.tsx|.visual.tsx` (**untracked**), component test `...test.tsx` (**untracked**).
- Engine: `lib/tools/engines/tool-006-estrogen-prolactin.ts` (**tracked**) â€” returns `NOT_ASSESSED` / `UNVALIDATED_RULES` (no clinical interpretation); engine test `...test.ts` (**tracked**).
- I18n: `i18n/tool-006-estrogen-prolactin.json` (**tracked, modified**).

### (b) Counts table
| Metric | Value |
|---|---:|
| Total rows | 18 |
| Applicable | 18 |
| N/A + justification | 0 |
| PASS (E3+) | 0 |
| PASS (<E3) | 4 |
| PARTIAL | 2 |
| NOT_RUN | 7 |
| FAIL | 0 |
| BLOCKED | 1 |
| NOT_AVAILABLE | 3 |
| NOT_IMPLEMENTED | 1 |

### (c) Verified %
**0.00% (0/18)** â€” `PASS(E3+)/Applicable = 0/18`.

### (d) Row-level table (atomic requirements from closure ledger register)
| Req ID | Requirement (summary) | Applicability | Status | E | Evidence refs | Gap / next action |
|---|---|---|---|---:|---|---|
| ENG-PIPELINE | Compute via R6 pipeline path only (no UI-side engine logic) | APPLICABLE | PASS (<E3) | E2 | `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.ts` (tracked: `runEstrogenProlactin`, input parse, `AromatizationScoreSchema.safeParse`, fail-closed, envelope from `resultParsed.data`); `components/tools/tool-006-estrogen-prolactin.tsx` (tracked, modified: `runEstrogenProlactin` usage). C report: structural PASS in committed TC for 006. Recorded: R6.1-PREVIEW-INDEX pipeline row "5 PASS" (2026-11-era, not re-run). | Re-run/archive focused pipeline battery on HEAD `37f047a4` in clean/isolated env (tracked tests only where applicable); track pipeline/contract tests if required. `npx vitest run lib/tools/r6/tool-006-estrogen-prolactin-pipeline.test.ts` (NOT_RUN; file untracked) or run tracked r6 suites per C report context. |
| STATE-5 | Five states EMPTY/PARTIAL/INVALID/FULL/DEGRADED implemented honestly | APPLICABLE | PASS (<E3) | E2 | `components/tools/tool-006-estrogen-prolactin.tsx` (tracked, modified): `UiState` union and state mapping; full/invalid/partial/empty/degraded branches present (static). Engine returns `NOT_ASSESSED` (honest no-interpretation). | Browser/interaction proof NOT_RUN (SSO/E4 unavailable); obtain accessible preview evidence. |
| UI-GENIUS12 | GENIUS-12 fixed order present once (no hidden/duplicate boxes) + CORE-5 | APPLICABLE | PASS (<E3) | E2 | `components/tools/tool-006-estrogen-prolactin.genius.tsx` (**untracked**, present): 12-box structure/CORE-5 framing observed statically. | DOM/browser verification NOT_RUN (SSO/E4 unavailable); confirm on accessible preview, no duplicate shell. |
| I18N-PARITY | AR/EN parity, required keys resolved, no contamination | APPLICABLE | NOT_RUN | E0 | I18n JSON tracked/modified (`i18n/tool-006-estrogen-prolactin.json`). No R6.1 check script: `docs/MRX Genius Cloud Unified R6.1/tool-006-i18n-check.mjs` missing. | Create and run parity check (pattern: tool-008 check) and archive output. `node "docs/MRX Genius Cloud Unified R6.1/tool-006-i18n-check.mjs"` (NOT_RUN; script missing). |
| EXPORT-CSV | Browser-only CSV export (no server/session identifier) | APPLICABLE | PASS (<E3) | E2 | `lib/tools/r6/tool-006-estrogen-prolactin-contract.ts` (**untracked**) defines `buildEstrogenProlactinCsv`; genius component references CSV export (static). | Browser download/contents verification NOT_RUN (SSO/E4 unavailable). |
| TEST-FOCUSED | Focused tests pass (pipeline/contract/component/i18n-evidence as applicable) | APPLICABLE | PARTIAL | E2 | Tracked: `lib/tools/engines/tool-006-estrogen-prolactin.test.ts`. Untracked (not in committed HEAD evidence): `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.test.ts`, `components/tools/tool-006-estrogen-prolactin.test.tsx`. Recorded batch claims: CLOSURE-SPRINT-DASHBOARD/FINAL and PREVIEW-INDEX mention prior passes; not isolated/re-run for 006 at HEAD in this audit. C TC r6 run did not include a tracked 006 pipeline test file (absent at HEAD). | Run tracked focused tests applicable at HEAD in clean env and archive logs; add/track missing tests per approval. `npx vitest run lib/tools/engines/tool-006-estrogen-prolactin.test.ts` (NOT_RUN). |
| BUILD-TSC | Clean tsc/build evidence for HEAD | APPLICABLE | PARTIAL | E2 | Recorded: historical deployment/build claims (e.g. 506/506 Ready) in closure docs; no archived clean tsc/build artifact for current HEAD `37f047a4` in this audit scope. | Archive clean build/tsc for HEAD in isolated env. `npx tsc --noEmit` and project build command (NOT_RUN; installs/build not executed). |
| PREVIEW-ROUTE | Direct Preview route loads for tool (SSR/accessible) | APPLICABLE | NOT_RUN | E0 | Route file tracked: `app/smarttools/tool-006-estrogen-prolactin/page.tsx`. Preview recorded SSO-protected. | Verify on accessible preview. `curl -sS -o NUL -w "%{http_code}" "https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/hormonal-health/tool-006-estrogen-prolactin"` or `Invoke-WebRequest -Uri <url> -UseBasicParsing \| Select-Object StatusCode` (NOT_RUN). |
| BROWSER-EN-AR | EN and AR functional pass on Preview | APPLICABLE | NOT_RUN | E0 | I18n resource present (tracked, modified). | Browser E4 unavailable/SSO. Manual/browser run on accessible preview (NOT_RUN). |
| BROWSER-5-STATES | Five states exercised on Preview | APPLICABLE | NOT_RUN | E0 | Static 5-state code evidence present. | Browser E4 unavailable/SSO (NOT_RUN). |
| RTL-390 | Real Arabic RTL at 390px | APPLICABLE | NOT_RUN | E0 | â€” | Real-device/viewport browser pass (NOT_RUN). |
| CONSOLE-HYDRATION | No Console errors or SSR/Hydration issues | APPLICABLE | NOT_RUN | E0 | â€” | Browser console capture on accessible preview (NOT_RUN). |
| NO-DUP-GENIUS | No duplicate GENIUS-12 / no hidden box / no double shell | APPLICABLE | NOT_RUN | E0 | â€” | DOM inspection on accessible preview (NOT_RUN). |
| C4-SOURCES | Specialist-approved sources/provenance or owner-approved N/A | APPLICABLE | NOT_AVAILABLE | E1 | `docs/SMARTTOOLS_TOOL_006_SOURCES.md` states no clinical interpretation/sources used by implementation (disposition documented); untracked contract contains source structures but no approved clinical source pack recorded. Closure ledger marks D-C4 open. | Owner decision: approved source pack or explicit approved N/A disposition (D-C4). |
| C5-REFERRAL | Specialist-approved referral/seek-care wording (AR/EN) | APPLICABLE | NOT_AVAILABLE | E1 | Genius/UI contains inline guidance patterns (static) but no approved referral wording pack recorded (D-C5 open). | Deliver/approve AR/EN referral wording pack (D-C5). |
| CLINICAL-REVIEW | Clinical/model review sign-off as applicable | APPLICABLE | BLOCKED | E1 | No sign-off recorded. | Obtain clinical/model review sign-off (D-CLIN). |
| W18-HISTORY | History/storage/sync per W18 decision | APPLICABLE | NOT_AVAILABLE | E1 | SMARTTOOLS source doc states no local storage/persistence; genius box 11/session-only posture indicated statically in prior/draft evidence and component patterns. Owner decision open. | Owner decision/implementation per W18. |
| P03-PIPELINE | Result-schema enforcement / P-03 closure per requirement | APPLICABLE | NOT_IMPLEMENTED | E1 | Committed pipeline at HEAD includes `AromatizationScoreSchema.safeParse` gate (structural P-03 pattern present). However tracked valid-branch pipeline test absent at HEAD and runtime-negative committed proof uncommitted (P03/C reports) -> requirement not fully closed as acceptance item. | Add/track pipeline tests and committed runtime-negative evidence per P-03 plan/approval; confirm clean-clone closure. |

### (e) Unsupported historical claims
- Closure ledger snapshot/SHAs reference stale context (`8d7e406c`, 2026-11-17 deployment details) vs current HEAD `37f047a4`; prior claims not re-executed in this audit.
- "R6 pipeline artifacts present" is supported statically; "R6.1 closure doc evidence incomplete" remains supported.
- Recorded "5 PASS" / batch test totals (e.g. 006/015/023/035 combined 15 files/84 tests) are historical claims not re-executed here; 006 pipeline test is untracked so not in committed clean-clone r6 suite.
- Any implication of P-03 full closure for 006 is unsupported by committed runtime-negative/valid tracked coverage.

### (f) Blockers / owner + next action
| Blocker | Owner | Next action |
|---|---|---|
| I18N-PARITY missing script/evidence | R6.1 I18N lead | Create `tool-006-i18n-check.mjs`, run, archive output. |
| Browser/E4 rows NOT_RUN (SSO/unavailable) | Preview/QA ops | Provide accessible preview; run EN/AR, 5-states, RTL-390, console/hydration, duplicate-GENIUS checks. |
| C4/C5/CLINICAL/W18 open | D-C4, D-C5, D-CLIN, D-W18 | Approved source/N-A, referral wording, clinical sign-off, history decision. |
| P03/TEST-FOCUSED/BUILD gaps at HEAD | Pipeline Eng/QA/CI | Track/run focused tests (incl. pipeline) in clean env, archive build/tsc, close committed negative/valid evidence gaps per P03 plan. |

---

## TOOL 008 â€” `tool-008-side-effect-tracker` (Batch 4, medical-monitoring)

### (a) Source ledger / requirements refs + SHA
| Ref | Path | SHA-256 | Notes |
|---|---|---|---|
| Closure ledger (MD, primary atomic 18-row register) | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-008-closure-ledger.md` | `8343C38276BA55A5F9DDB0A6E9FC0ABF3D2113BFB874F7BE91EA9E883E0D2680` | Snapshot `8d7e406c` (stale). |
| Closure ledger (CSV) | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-008-closure-ledger.csv` | `942E8A5515B4D6A01BDB68C9275470D483C88CB67B5ED1897BD09F9B9EB9038E` | Row mirror. |
| Development proposals | `docs/MRX Genius Cloud Unified R6.1/TOOL-008-DEVELOPMENT-PROPOSALS.md` | `C326A70241388632CB3B73E4EF8CE16B507899C173D22082EEB468B321D1D717` | P-01..P-10 status; owner review pending. |
| I18n parity check script | `docs/MRX Genius Cloud Unified R6.1/tool-008-i18n-check.mjs` | `37E0434491548E5C3C4B4EF9E15E8FDD9C5BD7766D008DC6FABCE902DDDBF7A3` | Present. |
| I18n resource | `i18n/tool-008-side-effect-tracker.json` | `3F90DD29845A150E79ACEE33118A00DE2F74B4431E4F47A8D1A661DDEA567719` | Tracked. |
| P03/C/Barrier evidence | `R6.1-P03-RESULTSCHEMA-CLOSURE-REPORT.md`, `parallel-execution-2026-11-19/C-P03-30-PIPELINE-CLOSURE-REPORT.md`, `retry-01/BARRIER-1-REPORT.md` | (cited) | 008: structural gate PASS; tracked pipeline test PASS in true-clean r6 suite; runtime-effectiveness `STRUCTURAL_VALIDATION_ONLY â€” RUNTIME_EFFECTIVENESS_PARTIAL` by design. |
| Other indexes | `CLOSURE-SPRINT-DASHBOARD-2026-11-17.md`, `CLOSURE-SPRINT-FINAL-REPORT-2026-11-17.md`, `F-BROWSER-SOURCE-CLINICAL-READINESS.md` | (cited) | Recorded i18n/test/build/browser context. |

**Route:** `app/smarttools/tool-008-side-effect-tracker/page.tsx` (tracked). Preview: `.../smarttools/medical-monitoring/tool-008-side-effect-tracker` (SSO-protected).  
**Key implementation artifacts (static):**
- Pipeline: `lib/tools/r6/tool-008-side-effect-tracker-pipeline.ts` (**tracked**) â€” input/result `SideEffectLogSchema`, `engineResult = parsed.data` (structural/log-capture path), gate + fail-closed + envelope from `resultParsed.data`.
- Pipeline test: `lib/tools/r6/tool-008-side-effect-tracker-pipeline.test.ts` (**tracked**).
- Contract: `lib/tools/r6/tool-008-side-effect-tracker-contract.ts` (**tracked**) â€” `Tool008UiState`, draft evaluation, `TOOL_008_SOURCES=[]`, cross-tool links empty, `buildSideEffectCsv`.
- Component: `components/tools/tool-008-side-effect-tracker.tsx` (**tracked**) â€” 5-state UI mapping, uses `runSideEffectTracker`.
- Genius: `components/tools/tool-008-side-effect-tracker.genius.tsx` (**tracked**) â€” 12 boxes incl. box 11 `not_available` (W18/history posture) and session-only rating marker; CSV export path.
- Engine: `lib/tools/engines/tool-008-side-effect-tracker.ts` (**tracked**). Engine-focused unit test file `lib/tools/engines/tool-008-side-effect-tracker.test.ts` **MISSING** (not present).
- Tests/evidence: `tests/unit/tool-008-i18n-evidence.test.ts` (**tracked**), `components/tools/tool-008-009-explicit-logging.test.tsx` (**tracked**).

### (b) Counts table
| Metric | Value |
|---|---:|
| Total rows | 18 |
| Applicable | 18 |
| N/A + justification | 0 |
| PASS (E3+) | 3 |
| PASS (<E3) | 3 |
| PARTIAL | 1 |
| NOT_RUN | 6 |
| FAIL | 0 |
| BLOCKED | 1 |
| NOT_AVAILABLE | 3 |
| NOT_IMPLEMENTED | 1 |

### (c) Verified %
**16.67% (3/18)** â€” PASS(E3+): `ENG-PIPELINE`, `I18N-PARITY`, `TEST-FOCUSED` (see row evidence; recorded/committed clean-clone context, not re-executed in this audit).

### (d) Row-level table
| Req ID | Requirement (summary) | Applicability | Status | E | Evidence refs | Gap / next action |
|---|---|---|---|---:|---|---|
| ENG-PIPELINE | Compute via R6 pipeline path only | APPLICABLE | PASS (E3+, recorded) | E3 | Pipeline tracked with structural gate; component uses `runSideEffectTracker`. C report: `tool-008-side-effect-tracker-pipeline.test.ts` **tracked and PASS** in true-clean `npx vitest run lib/tools/r6` (32 files/339 tests, exit 0) at `37f047a4`. Closure ledgers record Batch 4 consolidated pass (2026-11-17). | Re-run/archive per-tool focused log on current HEAD if separate artifact needed (NOT_RUN in this audit). Keep `STRUCTURAL_VALIDATION_ONLY â€” RUNTIME_EFFECTIVENESS_PARTIAL` posture. |
| STATE-5 | 5 states implemented honestly | APPLICABLE | PASS (<E3) | E2 | Contract defines `Tool008UiState`; component maps EMPTY/PARTIAL/INVALID/FULL/DEGRADED (READY->FULL/DEGRADED). Static evidence only. | Browser state-transition proof NOT_RUN (SSO/E4). |
| UI-GENIUS12 | GENIUS-12 fixed order, CORE-5, no hidden/duplicate | APPLICABLE | PASS (<E3) | E2 | `tool-008-side-effect-tracker.genius.tsx` (tracked) defines 12 boxes including box 11 not_available and session-only rating; static structure. | DOM/preview verification NOT_RUN. |
| I18N-PARITY | AR/EN parity, required keys resolved, no contamination | APPLICABLE | PASS (E3+, recorded) | E3 | `docs/MRX Genius Cloud Unified R6.1/tool-008-i18n-check.mjs` present; `tests/unit/tool-008-i18n-evidence.test.ts` tracked. Closure ledger records "I18N_PARITY OK 105/105 PASS (2026-11-17)". (Not re-executed now.) | Optional re-run/archive on HEAD: `node "docs/MRX Genius Cloud Unified R6.1/tool-008-i18n-check.mjs"` (NOT_RUN). |
| EXPORT-CSV | Browser-only CSV export | APPLICABLE | PASS (<E3) | E2 | `buildSideEffectCsv` in tracked contract; genius export button/Blob download path (static). | Browser download verification NOT_RUN. |
| TEST-FOCUSED | Focused tests pass | APPLICABLE | PASS (E3+, recorded) | E3 | Tracked: `tool-008-side-effect-tracker-pipeline.test.ts`, `tests/unit/tool-008-i18n-evidence.test.ts`, `components/tools/tool-008-009-explicit-logging.test.tsx`. Included in C true-clean committed r6 suite PASS at `37f047a4` and recorded Batch 4 consolidated 17/50 PASS (2026-11-17). No engine-specific `tool-008` engine unit test file found. | Archive per-tool focused rerun log if required (NOT_RUN). |
| BUILD-TSC | Clean tsc/build evidence | APPLICABLE | PARTIAL | E2 | Historical Ready/build claims recorded; no current-HEAD archived clean tsc/build artifact in this audit. | Archive clean build/tsc for HEAD (NOT_RUN). |
| PREVIEW-ROUTE | Direct Preview route loads | APPLICABLE | NOT_RUN | E0 | Route tracked; SSO-protected preview recorded. | `curl -sS -o NUL -w "%{http_code}" "https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/medical-monitoring/tool-008-side-effect-tracker"` (NOT_RUN). |
| BROWSER-EN-AR | EN/AR functional pass on Preview | APPLICABLE | NOT_RUN | E0 | â€” | Browser run on accessible preview (NOT_RUN). |
| BROWSER-5-STATES | Five states exercised on Preview | APPLICABLE | NOT_RUN | E0 | â€” | Browser run (NOT_RUN). |
| RTL-390 | Real Arabic RTL at 390px | APPLICABLE | NOT_RUN | E0 | â€” | Browser/device check (NOT_RUN). |
| CONSOLE-HYDRATION | No console/SSR hydration issues | APPLICABLE | NOT_RUN | E0 | â€” | Browser console capture (NOT_RUN). |
| NO-DUP-GENIUS | No duplicate GENIUS-12 / double shell | APPLICABLE | NOT_RUN | E0 | â€” | DOM inspection (NOT_RUN). |
| C4-SOURCES | Specialist-approved sources/provenance or approved N/A | APPLICABLE | NOT_AVAILABLE | E1 | `TOOL_008_SOURCES=[]` in tracked contract; proposals mark blocked/open (D-C4). | Approved source pack or owner-approved N/A. |
| C5-REFERRAL | Specialist-approved referral/seek-care wording (AR/EN) | APPLICABLE | NOT_AVAILABLE | E1 | Proposals/ledger: referral/seek-care pending approval (D-C5). | Approved wording pack. |
| CLINICAL-REVIEW | Clinical/model review sign-off | APPLICABLE | BLOCKED | E1 | No sign-off recorded (D-CLIN). | Obtain sign-off. |
| W18-HISTORY | History/storage/sync per W18 decision | APPLICABLE | NOT_AVAILABLE | E1 | Genius box 11 `not_available`; `data-r6-rating="session_only_not_saved"`; no storage indicated (D-W18 open). | Owner decision/implementation per W18. |
| P03-PIPELINE | P-03 enforcement/runtime effectiveness as applicable | APPLICABLE | NOT_IMPLEMENTED | E1 | Structural gate present and committed; by design no independent engine-shaped mismatch path (`engineResult = parsed.data`). Classified **STRUCTURAL_VALIDATION_ONLY â€” RUNTIME_EFFECTIVENESS_PARTIAL** (P03/C reports). Not fully closed as generic P03 runtime-rejection proof. | Maintain classification; any broader P03 acceptance requires owner decision/aligned criteria (no invented proof). |

### (e) Unsupported historical claims
- "17 files / 50 tests PASS (2026-11-17)" and "I18N_PARITY OK 105/105 PASS" are recorded historical claims; not re-executed in this audit (though tracked 008 tests passed in C true-clean committed r6 suite context).
- Stale snapshot HEAD/deployment metadata in closure ledger (`8d7e406c`) vs current HEAD.
- Any claim of full runtime-effectiveness P03 proof for 008 is unsupported and must not be made (design constraint).

### (f) Blockers / owner + next action
| Blocker | Owner | Next action |
|---|---|---|
| Browser/E4 + preview accessibility | Preview/QA ops | Accessible preview + EN/AR/5-states/RTL-390/console/dup checks. |
| BUILD-TSC archival for HEAD | CI/Eng | Archive clean tsc/build output for `37f047a4`. |
| C4/C5/CLINICAL/W18 | D-C4/D-C5/D-CLIN/D-W18 | Approvals/decisions and evidence. |
| P03 acceptance framing for 008 | P-03 owner/Eng | Preserve structural-only classification; close only under agreed criteria. |

---

## TOOL 014 â€” `tool-014-water-retention` (Batch 4, body-composition)

### (a) Source ledger / requirements refs + SHA
| Ref | Path | SHA-256 | Notes |
|---|---|---|---|
| Closure ledger (MD, primary atomic 18-row register) | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-014-closure-ledger.md` | `B25DB676BAD8167E4DC8A61986DD60493ECD1E7D19EF683A6B7201BBBC49985F` | Stale snapshot `8d7e406c`. |
| Closure ledger (CSV) | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-014-closure-ledger.csv` | `2B87C1BF9DC170B102C8667924FE2C031A1C3121BD109552D81169BFBE55C93E` | Row mirror. |
| Development proposals | `docs/MRX Genius Cloud Unified R6.1/TOOL-014-DEVELOPMENT-PROPOSALS.md` | `182FBAD12927219A84431754732DF206F635D57A52D7BC80C9B6901F96A41DC6` | Honest `NOT_AVAILABLE/NO_VALIDATED_MODEL` model posture. |
| I18n parity check script | `docs/MRX Genius Cloud Unified R6.1/tool-014-i18n-check.mjs` | `36C69A289B1BFBB4B05826E64CF288F9CD3E6E36CA81CA5D93CE930528B27287` | Present. |
| I18n resource | `i18n/tool-014-water-retention.json` | `818919238C268EBB4983E3DEEB4FE4A4DD97CF29EA24644ECB89BE16EFCC1C5A` | Tracked. |
| P03/C/Barrier evidence | `R6.1-P03-RESULTSCHEMA-CLOSURE-REPORT.md`, `C-P03-30-PIPELINE-CLOSURE-REPORT.md`, `retry-01/BARRIER-1-REPORT.md` | (cited) | 014: structural PASS, tracked pipeline test PASS in true-clean r6 suite, runtime-negative uncommitted (NOT_RUN in TC). |
| Other indexes | `CLOSURE-SPRINT-DASHBOARD-2026-11-17.md`, `CLOSURE-SPRINT-FINAL-REPORT-2026-11-17.md`, `F-BROWSER-SOURCE-CLINICAL-READINESS.md` | (cited) | Recorded results, honest unavailable posture. |

**Route:** `app/smarttools/tool-014-water-retention/page.tsx` (tracked). Preview: `.../smarttools/body-composition/tool-014-water-retention` (SSO-protected).  
**Key implementation artifacts (static):**
- Pipeline: `lib/tools/r6/tool-014-water-retention-pipeline.ts` (**tracked**) â€” input/result schemas, `calculateWaterRetention`, result gate, fail-closed envelope.
- Pipeline test: `lib/tools/r6/tool-014-water-retention-pipeline.test.ts` (**tracked**).
- Contract: `lib/tools/r6/tool-014-water-retention-contract.ts` (**tracked**) â€” `READY` yields honest `NOT_AVAILABLE/NO_VALIDATED_MODEL`, `TOOL_014_SOURCES=[]`, CSV builder.
- Component: `components/tools/tool-014-water-retention.tsx` (**tracked**) â€” always READY/full-honest flow, 5-state key mapping.
- Genius: `components/tools/tool-014-water-retention.genius.tsx` (**tracked**) â€” 12 boxes, box 11 not_available, session-only rating, CSV export.
- Engine: `lib/tools/engines/tool-014-water-retention.ts` (**tracked**) returns `{ status:'NOT_AVAILABLE', reason:'NO_VALIDATED_MODEL' }`; engine test `...test.ts` (**tracked**).
- I18n evidence: `tests/unit/tool-014-i18n-evidence.test.ts` (**tracked**).

### (b) Counts table
| Metric | Value |
|---|---:|
| Total rows | 18 |
| Applicable | 18 |
| N/A + justification | 0 |
| PASS (E3+) | 3 |
| PASS (<E3) | 3 |
| PARTIAL | 1 |
| NOT_RUN | 6 |
| FAIL | 0 |
| BLOCKED | 1 |
| NOT_AVAILABLE | 3 |
| NOT_IMPLEMENTED | 1 |

### (c) Verified %
**16.67% (3/18)** â€” PASS(E3+): `ENG-PIPELINE`, `I18N-PARITY`, `TEST-FOCUSED` (recorded/committed clean-clone context; not re-executed in this audit).

### (d) Row-level table
| Req ID | Requirement (summary) | Applicability | Status | E | Evidence refs | Gap / next action |
|---|---|---|---|---:|---|---|
| ENG-PIPELINE | Compute via R6 pipeline path only | APPLICABLE | PASS (E3+, recorded) | E3 | Tracked pipeline with gate/fail-closed; component uses `runWaterRetention`. C report: tracked `tool-014-water-retention-pipeline.test.ts` PASS in true-clean committed r6 suite at `37f047a4`; recorded Batch 4 17/50 PASS. | Optional per-tool rerun/archive (NOT_RUN). |
| STATE-5 | 5 states implemented honestly | APPLICABLE | PASS (<E3) | E2 | Contract/component map 5-state keys; honest FULL shows model-unavailable result (by design). Static. | Browser state evidence NOT_RUN. |
| UI-GENIUS12 | GENIUS-12 fixed order, CORE-5 | APPLICABLE | PASS (<E3) | E2 | Tracked genius component with 12 boxes, box 11/history N/A, session-only rating. Static. | DOM/preview verification NOT_RUN. |
| I18N-PARITY | AR/EN parity, keys resolved, no contamination | APPLICABLE | PASS (E3+, recorded) | E3 | I18n check script present; `tests/unit/tool-014-i18n-evidence.test.ts` tracked. Closure ledger records "59/59 PASS (2026-11-17)". | Optional rerun: `node "docs/MRX Genius Cloud Unified R6.1/tool-014-i18n-check.mjs"` (NOT_RUN). |
| EXPORT-CSV | Browser-only CSV export | APPLICABLE | PASS (<E3) | E2 | `buildWaterRetentionCsv` in tracked contract; genius export path. Static. | Browser download verification NOT_RUN. |
| TEST-FOCUSED | Focused tests pass | APPLICABLE | PASS (E3+, recorded) | E3 | Tracked: `tool-014-water-retention-pipeline.test.ts`, `lib/tools/engines/tool-014-water-retention.test.ts`, `tests/unit/tool-014-i18n-evidence.test.ts`. Included/passing in C true-clean committed r6 suite context and recorded Batch 4 results. | Optional per-tool rerun/archive (NOT_RUN). |
| BUILD-TSC | Clean tsc/build evidence | APPLICABLE | PARTIAL | E2 | Historical claims only; no archived current-HEAD clean build. | Archive clean build/tsc for HEAD (NOT_RUN). |
| PREVIEW-ROUTE | Direct Preview route loads | APPLICABLE | NOT_RUN | E0 | Route tracked; SSO-protected. | `curl -sS -o NUL -w "%{http_code}" "https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/body-composition/tool-014-water-retention"` (NOT_RUN). |
| BROWSER-EN-AR | EN/AR functional pass | APPLICABLE | NOT_RUN | E0 | â€” | Browser run (NOT_RUN). |
| BROWSER-5-STATES | Five states exercised | APPLICABLE | NOT_RUN | E0 | â€” | Browser run (NOT_RUN). |
| RTL-390 | Real Arabic RTL at 390px | APPLICABLE | NOT_RUN | E0 | â€” | Browser/device check (NOT_RUN). |
| CONSOLE-HYDRATION | No console/SSR hydration issues | APPLICABLE | NOT_RUN | E0 | â€” | Browser console capture (NOT_RUN). |
| NO-DUP-GENIUS | No duplicate GENIUS-12 / double shell | APPLICABLE | NOT_RUN | E0 | â€” | DOM inspection (NOT_RUN). |
| C4-SOURCES | Specialist-approved sources/provenance or approved N/A | APPLICABLE | NOT_AVAILABLE | E1 | `TOOL_014_SOURCES=[]`; model-less honest unavailable by design (engine/proposals). D-C4 open. | Approved source pack or owner-approved N/A. |
| C5-REFERRAL | Specialist-approved referral/seek-care wording (AR/EN) | APPLICABLE | NOT_AVAILABLE | E1 | Pending approval (D-C5). | Approved wording pack. |
| CLINICAL-REVIEW | Clinical/model review sign-off | APPLICABLE | BLOCKED | E1 | No sign-off recorded (D-CLIN). | Obtain sign-off. |
| W18-HISTORY | History/storage/sync per W18 decision | APPLICABLE | NOT_AVAILABLE | E1 | Session-only/not-saved posture and box 11 N/A (tracked genius/i18n patterns). D-W18 open. | Owner decision per W18. |
| P03-PIPELINE | P-03 enforcement closure | APPLICABLE | NOT_IMPLEMENTED | E1 | Committed structural gate present; tracked pipeline test exists/passed in TC; runtime-negative committed proof uncommitted per P03/C reports. | Commit/verify runtime-negative evidence in clean clone and align acceptance criteria. |

### (e) Unsupported historical claims
- Engine "NOT_AVAILABLE/NO_VALIDATED_MODEL" is **supported** by tracked engine and tests (honest posture) â€” not an unsupported claim.
- Recorded batch/i18n pass counts (17/50, 59/59 on 2026-11-17) not re-executed in this audit.
- Stale snapshot/deployment metadata in closure ledger vs current HEAD.
- Full P03 closure claim unsupported while committed runtime-negative proof remains uncommitted.

### (f) Blockers / owner + next action
| Blocker | Owner | Next action |
|---|---|---|
| Browser/E4 + preview accessibility | Preview/QA ops | Accessible preview; EN/AR/5-states/RTL-390/console/dup checks. |
| BUILD-TSC archival for HEAD | CI/Eng | Archive clean build/tsc for `37f047a4`. |
| C4/C5/CLINICAL/W18 | D-C4/D-C5/D-CLIN/D-W18 | Approvals/decisions/evidence. |
| P03 committed runtime-negative closure | P-03 owner/Pipeline Eng | Commit/clean-clone verify negative coverage as authorized. |

---

## TOOL 015 â€” `tool-015-shbg-modulator` (Batch 1, hormonal-health)

### (a) Source ledger / requirements refs + SHA
| Ref | Path | SHA-256 | Notes |
|---|---|---|---|
| Closure ledger (MD, primary atomic 18-row register) | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-015-closure-ledger.md` | `40BDC4ACF3A58D8379BE168DC07FA28B542AC56C8BEE8922DE90AF4396F8EB42` | Stale snapshot `8d7e406c`. |
| Closure ledger (CSV) | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-015-closure-ledger.csv` | `5509C1CD7C204AC5F0AC687C0A35B3C1D37A07BDE60CDB0627133EC2436E848F` | Row mirror. |
| Source/limits documentation | `docs/SMARTTOOLS_TOOL_015_SHBG_SOURCES.md` | `403D6DC8FE22903B2793EF50143438B382C9C44F5CA04A38D984E039544AD72A` | Formula basis and interpretation limits documented (not specialist-approval sign-off). |
| I18n resource | `i18n/tool-015-shbg-modulator.json` | `8FCB7038D367792D121C8A790B225B16D767340486FC62F42DD228DFA6010444` | Tracked, modified in WT. |
| P03/C/Barrier evidence | `R6.1-P03-RESULTSCHEMA-CLOSURE-REPORT.md`, `C-P03-30-PIPELINE-CLOSURE-REPORT.md`, `retry-01/BARRIER-1-REPORT.md` | (cited) | 015: structural PASS, tracked pipeline test at HEAD NOT_RUN/none tracked, runtime-negative uncommitted. |
| Other indexes | `R6.1-PREVIEW-INDEX.md`, `CLOSURE-SPRINT-DASHBOARD-2026-11-17.md`, `CLOSURE-SPRINT-FINAL-REPORT-2026-11-17.md`, `F-BROWSER-SOURCE-CLINICAL-READINESS.md`, disposition matrices | (cited) | Recorded claims, WT tracking/untracked state. |

**I18n parity script:** `docs/MRX Genius Cloud Unified R6.1/tool-015-i18n-check.mjs` â€” **MISSING** (verified).  
**Route:** `app/smarttools/tool-015-shbg-modulator/page.tsx` (tracked). Preview: `.../smarttools/hormonal-health/tool-015-shbg-modulator` (SSO-protected).  
**Key implementation artifacts (static):**
- Pipeline: `lib/tools/r6/tool-015-shbg-modulator-pipeline.ts` (**tracked**) â€” `runSHBGModulator`, `SHBGResultSchema.safeParse` gate, fail-closed envelope.
- Pipeline test: `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` (**untracked**).
- Contract: `lib/tools/r6/tool-015-shbg-modulator-contract.ts` (**untracked**, present) â€” includes `buildShbgCsv`, sources/limits structures (static).
- Component: `components/tools/tool-015-shbg-modulator.tsx` (**tracked, modified**) â€” integrates `runSHBGModulator`; 5-state surface present but modeled differently (PARTIAL/INVALID/CALCULATED/FULL mapping) vs canonical EMPTY..DEGRADED enumeration in UI union (static).
- Genius/UI submodules: `tool-015-shbg-modulator.genius.tsx|.ocr.tsx|.pdf.tsx|.visual.tsx` (**untracked**), parity test `...parity.test.tsx` (**untracked**).
- Engine: `lib/tools/engines/tool-015-shbg-modulator.ts` (**tracked**) â€” Vermeulen mass-action calculation, returns `CALCULATED`; engine test `...test.ts` (**tracked**).
- I18n: `i18n/tool-015-shbg-modulator.json` (**tracked, modified**).

### (b) Counts table
| Metric | Value |
|---|---:|
| Total rows | 18 |
| Applicable | 18 |
| N/A + justification | 0 |
| PASS (E3+) | 0 |
| PASS (<E3) | 0 |
| PARTIAL | 6 |
| NOT_RUN | 7 |
| FAIL | 0 |
| BLOCKED | 1 |
| NOT_AVAILABLE | 3 |
| NOT_IMPLEMENTED | 1 |

### (c) Verified %
**0.00% (0/18)** â€” `PASS(E3+)/Applicable = 0/18`.

### (d) Row-level table
| Req ID | Requirement (summary) | Applicability | Status | E | Evidence refs | Gap / next action |
|---|---|---|---|---:|---|---|
| ENG-PIPELINE | Compute via R6 pipeline path only | APPLICABLE | PARTIAL | E1 | Tracked pipeline exists with input/result validation gate and `runSHBGModulator`; tracked component integrates pipeline. C report: no tracked individual pipeline test at HEAD for 015; runtime-negative uncommitted (NOT_RUN in TC). Recorded historical "5 PASS" claim in PREVIEW-INDEX not re-run. | Run/archive focused pipeline evidence on HEAD in clean env; track pipeline/contract tests as approved. `npx vitest run lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` (NOT_RUN; untracked). |
| STATE-5 | 5 states EMPTY/PARTIAL/INVALID/FULL/DEGRADED implemented honestly | APPLICABLE | PARTIAL | E1 | Component shows multi-state handling (PARTIAL/INVALID/CALCULATED/FULL mapping) but no explicit EMPTY/DEGRADED labels in the same union as other tools (static). Needs confirmation against closure criteria. | Verify and evidence full 5-state behavior (including EMPTY/DEGRADED) on accessible preview and/or clarify mapping. |
| UI-GENIUS12 | GENIUS-12 fixed order, CORE-5 | APPLICABLE | PARTIAL | E1 | Untracked genius component present with 12-box framework content including history/export sections (static). Not tracked at HEAD. | Track/verify artifact set as applicable; DOM/preview verification NOT_RUN. |
| I18N-PARITY | AR/EN parity, required keys resolved, no contamination | APPLICABLE | NOT_RUN | E0 | Tracked/modified i18n JSON exists; parity script `tool-015-i18n-check.mjs` missing. | Create and run parity check; archive output (NOT_RUN). |
| EXPORT-CSV | Browser-only CSV export | APPLICABLE | PARTIAL | E1 | Untracked contract defines `buildShbgCsv`; untracked genius references CSV export/download (static). | Browser verification NOT_RUN; confirm tracked/reproducible artifact status as needed. |
| TEST-FOCUSED | Focused tests pass | APPLICABLE | PARTIAL | E2 | Tracked engine test exists: `lib/tools/engines/tool-015-shbg-modulator.test.ts`. Untracked: `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts`, `components/tools/tool-015-shbg-modulator.parity.test.tsx`. Recorded combined Batch 1 claim (006/015/023/035 15 files/84 tests) not isolated/re-run. | Run tracked focused tests and archive; track/approve missing tests. `npx vitest run lib/tools/engines/tool-015-shbg-modulator.test.ts` (NOT_RUN). |
| BUILD-TSC | Clean tsc/build evidence | APPLICABLE | PARTIAL | E2 | Historical build claims only; no archived clean tsc/build for current HEAD. | Archive clean build/tsc for HEAD (NOT_RUN). |
| PREVIEW-ROUTE | Direct Preview route loads | APPLICABLE | NOT_RUN | E0 | Route tracked; SSO-protected. | `curl -sS -o NUL -w "%{http_code}" "https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/hormonal-health/tool-015-shbg-modulator"` (NOT_RUN). |
| BROWSER-EN-AR | EN/AR functional pass | APPLICABLE | NOT_RUN | E0 | â€” | Browser run (NOT_RUN). |
| BROWSER-5-STATES | Five states exercised | APPLICABLE | NOT_RUN | E0 | â€” | Browser run (NOT_RUN). |
| RTL-390 | Real Arabic RTL at 390px | APPLICABLE | NOT_RUN | E0 | â€” | Browser/device check (NOT_RUN). |
| CONSOLE-HYDRATION | No console/SSR hydration issues | APPLICABLE | NOT_RUN | E0 | â€” | Browser console capture (NOT_RUN). |
| NO-DUP-GENIUS | No duplicate GENIUS-12 / double shell | APPLICABLE | NOT_RUN | E0 | â€” | DOM inspection (NOT_RUN). |
| C4-SOURCES | Specialist-approved sources/provenance or approved N/A | APPLICABLE | NOT_AVAILABLE | E1 | `docs/SMARTTOOLS_TOOL_015_SHBG_SOURCES.md` documents formula basis/limits; untracked contract includes `TOOL_015_SOURCES` structures (Vermeulen/Endocrine Society/Annals per prior evidence) but specialist-approved pack/sign-off not recorded (D-C4 open). | Obtain approved source/provenance decision or pack. |
| C5-REFERRAL | Specialist-approved referral/seek-care wording (AR/EN) | APPLICABLE | NOT_AVAILABLE | E1 | Guidance present in UI artifacts (static) but no approved wording pack recorded (D-C5). | Approved AR/EN wording pack. |
| CLINICAL-REVIEW | Clinical/model review sign-off | APPLICABLE | BLOCKED | E1 | No sign-off recorded (D-CLIN). | Obtain clinical/model review sign-off. |
| W18-HISTORY | History/storage/sync per W18 decision | APPLICABLE | NOT_AVAILABLE | E1 | Genius includes session-only/history-not-saved posture indicators (untracked, static). D-W18 open. | Owner decision per W18. |
| P03-PIPELINE | P-03 enforcement closure | APPLICABLE | NOT_IMPLEMENTED | E1 | Committed structural result-schema gate present in tracked pipeline; tracked valid-branch pipeline test absent at HEAD; runtime-negative committed proof uncommitted (P03/C). | Track/run pipeline tests and commit/verify runtime-negative evidence in clean clone per approval. |

### (e) Unsupported historical claims
- "R6 pipeline artifacts present" supported statically; closure/evidence completeness claims remain partial.
- Combined Batch 1 pass totals and PREVIEW-INDEX "5 PASS" for 015 pipeline are historical and not re-executed; key 015 R6 pipeline/contract tests are untracked (not committed clean-clone evidence).
- SMARTTOOLS formula/source documentation is informative but not equivalent to specialist-approved C4 sign-off.
- Stale snapshot/deployment metadata in closure ledger vs current HEAD.
- Any claim of full P03 closure for 015 unsupported given missing tracked runtime coverage/committed negative proof.

### (f) Blockers / owner + next action
| Blocker | Owner | Next action |
|---|---|---|
| I18N-PARITY missing script/evidence | R6.1 I18N lead | Create/run `tool-015-i18n-check.mjs`, archive output. |
| Untracked/non-committed R6 artifacts and tests | R6.1 Eng (scoped approval) | Review/track pipeline test, contract, genius/ocr/pdf/visual/parity artifacts as appropriate; re-run focused tests. |
| Browser/E4 + preview accessibility | Preview/QA ops | Accessible preview; EN/AR/5-states/RTL-390/console/dup checks. |
| C4/C5/CLINICAL/W18/P03 | D-C4/D-C5/D-CLIN/D-W18/P-03 owner | Approvals/sign-offs/decisions and committed clean-clone P03 evidence. |
| BUILD-TSC archival for HEAD | CI/Eng | Archive clean build/tsc for `37f047a4`. |

---

## Consolidated unresolved items (owner + next action)
| Area | Tools | Owner | Next action | Evidence/constraint |
|---|---|---|---|---|
| Browser/runtime evidence (PREVIEW-ROUTE, EN/AR, 5 states, RTL-390, console/hydration, no-dup GENIUS) | 006,008,014,015 | Preview/QA ops | Provide accessible (non-SSO/bypass) preview; execute and capture E4 evidence with screenshots/logs. | NOT_RUN in this audit; E4 unavailable. |
| I18N parity scripts/runs | 006,015 | R6.1 I18N lead | Create/check scripts, run, archive results. 008/014 scripts exist with recorded passes (not re-run). | `tool-006-i18n-check.mjs`, `tool-015-i18n-check.mjs` missing. |
| Focused tests/build archival at HEAD | 006,008,014,015 | R6.1 Eng / CI | Run tracked focused tests and clean tsc/build in isolated env; archive logs/artifacts. | Execution not performed (`NOT_RUN`). |
| P03 closure depth | 006,008,014,015 | P-03 owner / Pipeline Eng | Maintain 008 structural-only classification; close committed runtime-negative/valid-branch gaps in clean clone where applicable. | P03/C/Barrier evidence: structural committed, runtime-negative suite uncommitted/NOT_RUN in TC. |
| C4 sources/provenance | All | D-C4 | Approved source pack or explicit owner-approved N/A per tool. | NOT_AVAILABLE/E1. |
| C5 referral/seek-care wording | All | D-C5 | Approved AR/EN wording pack. | NOT_AVAILABLE/E1. |
| Clinical/model review | All | D-CLIN | Sign-off recorded. | BLOCKED/E1. |
| W18 history/storage/sync | All | D-W18 | Owner decision and implementation/evidence. | NOT_AVAILABLE/E1 (session-only/not-saved posture indicated). |

## Appendix â€” recorded execution commands (NOT_RUN in this audit)
- I18n checks: `node "docs/MRX Genius Cloud Unified R6.1/tool-008-i18n-check.mjs"`, `node "docs/MRX Genius Cloud Unified R6.1/tool-014-i18n-check.mjs"` (scripts present, not re-run); create/run equivalents for 006/015.
- Focused tests (examples): `npx vitest run lib/tools/r6 lib/tools/engines/tool-006-estrogen-prolactin.test.ts lib/tools/engines/tool-014-water-retention.test.ts lib/tools/engines/tool-015-shbg-modulator.test.ts tests/unit/tool-008-i18n-evidence.test.ts tests/unit/tool-014-i18n-evidence.test.ts components/tools/tool-008-009-explicit-logging.test.tsx` (subset depends on tracked/untracked availability).
- Build/typecheck: `npx tsc --noEmit` and project build command in clean env with deps present.
- Route probes (accessible preview only): `curl -sS -o NUL -w "%{http_code}" <preview-url>` / `Invoke-WebRequest ... -UseBasicParsing`.

**SHA-256 (this output file, final saved bytes):** `9BD82DDFFA641F08B7C8C9A0284A6A5455BBBEBD01DB09E96A4376C58C8B5FA9`
