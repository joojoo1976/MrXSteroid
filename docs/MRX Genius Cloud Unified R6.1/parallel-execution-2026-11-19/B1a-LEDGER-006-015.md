# B1a — Row-Level Ledger Audit — Tools 006, 008, 014, 015 (R6.1 Closure Program)

**Audit type:** READ-ONLY evidence audit (Workstream B, subteam B1a). No builds/tests/servers run. Evidence = recorded results + static inspection of implementation and tests.

**Baseline:** HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f` (`feat(r6): P03-RESULT-SCHEMA-GATE across 30 execution pipelines`, 2026-11-18). Branch `feat/r6.1-tools-041-042`. Note: all four ledgers record a stale Snapshot HEAD `8d7e406c` (2026-11-17); evidence was re-verified against the current working tree at HEAD 37f047a4 where accessible.

**Evidence ladder (docs/MRX Genius Cloud Unified R6.1/R6.1-CLOSURE-LAYER.md):** E0 no evidence → E1 claim only → E2 file exists → E3 passing test reproducible from clean clone → E4 live run → E5 independent audit. Execution NOT run per constraints; recorded results are treated as documented evidence (E3 where a passing result is recorded, E2 for static verification).

**Method & constraints:**
- Only the output file was created: `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/B1a-LEDGER-006-015.md`.
- Tracked vs untracked: `git ls-files` + `git status --untracked-files=all`.
- Live-execution requirements (browser/route checks) recorded as NOT_RUN with the exact isolated command.
- Live-execution tooling NOT run (no vitest/tsc/eslint/next/servers/installs).

---

# TOOL 006 — tool-006-estrogen-prolactin (Batch 1, hormonal-health)

**Source ledger:** `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-006-closure-ledger.md` — SHA-256 `0055AD3541EA33BA7EB0CDCC8CC65E74437FD42AEE4B4E5B8C57BA7FAD0135EB` (ledger head 8d7e406c; stale).
Route: `https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/hormonal-health/tool-006-estrogen-prolactin` (auth-walled per ledger).

## Counts (18 atomic rows; all APPLICABLE)

| Metric | Value |
|---|---|
| Total rows | 18 |
| Applicable | 18 |
| N/A + justification | 0 |
| PASS(E3+) | 0 |
| PASS below E3 | 4 |
| PARTIAL | 2 |
| NOT_RUN | 7 |
| FAIL | 0 |
| BLOCKED | 1 |
| NOT_AVAILABLE | 3 |
| NOT_IMPLEMENTED | 1 |
| **Verified % = PASS(E3+)/applicable** | **0/18 = 0%** |

## Row-level ledger

| Req | Ledger B/E | Audit status/E | Evidence (file:line) | Recorded result (date) | Notes / gaps |
|---|---|---|---|---|---|
| ENG-PIPELINE | PARTIAL/E1 | PASS/E2 | `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.ts` (tracked); `components/tools/tool-006-estrogen-prolactin.tsx:24,225,241` (calls `runEstrogenProlactin`) | R6.1-PREVIEW-INDEX.md:293 — "Tool 006 | tool-006-estrogen-prolactin-pipeline.ts | ✅ | 5 PASS | PASS" | Gap: re-run focused pipeline battery on current HEAD 37f047a4. |
| STATE-5 | PARTIAL/E1 | PASS/E2 | `components/tools/tool-006-estrogen-prolactin.tsx:72` (UiState EMPTY/PARTIAL/FULL/INVALID/DEGRADED), `:245-253` (resultStatus mapping) | — | Static: 5-state surface verified. Engine itself returns only `NOT_ASSESSED`/`UNVALIDATED_RULES` (`lib/tools/engines/tool-006-estrogen-prolactin.ts:33-43`) — honest no-interpretation. |
| UI-GENIUS12 | PARTIAL/E1 | PASS/E2 | `components/tools/tool-006-estrogen-prolactin.genius.tsx` (untracked; doc comment lines 4-20 "Implements the full 12-box framework"; BOX_TINT 12 entries lines 52-65; boxes array) | — | Static. |
| I18N-PARITY | NOT_RUN/E0 | NOT_RUN/E0 | — | — | Verified absent: no `docs/MRX Genius Cloud Unified R6.1/tool-006-i18n-check.mjs` (glob `tool-006*` in docs root). Gap: create+run R6.1 i18n parity check. |
| EXPORT-CSV | PARTIAL/E1 | PASS/E2 | `lib/tools/r6/tool-006-estrogen-prolactin-contract.ts:253-277` (`buildEstrogenProlactinCsv`, untracked); `components/tools/tool-006-estrogen-prolactin.genius.tsx:87-105` (box 10) | — | Browser-only CSV (Blob + `a.download`); columns Marker/Value/Unit/Reference Band/Panel Date — no session ID. |
| TEST-FOCUSED | PARTIAL/E2 | PARTIAL/E2 | tracked `lib/tools/engines/tool-006-estrogen-prolactin.test.ts`; untracked `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.test.ts`, `components/tools/tool-006-estrogen-prolactin.test.tsx` | CLOSURE-SPRINT-DASHBOARD-2026-11-17.md:17 (Batch 1: 006/015/023/035 — 15 files / 84 tests PASS); R6.1-PREVIEW-INDEX.md:293 (5 PASS) | No per-tool rerun on current HEAD. |
| BUILD-TSC | PARTIAL/E2 | PARTIAL/E2 | mrxsteroid Vercel app (ledger evidence_uri) | 506/506 routes Ready (2026-11-17) | Gap: archive clean tsc/build output for HEAD 37f047a4. |
| PREVIEW-ROUTE | NOT_RUN/E0 | NOT_RUN/E0 | `app/smarttools/tool-006-estrogen-prolactin/page.tsx` (tracked) | Vercel E1 Ready, SSO-protected (ledger) | Exact isolated command: `curl -sS -o nul -w "%{http_code}" "https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/hormonal-health/tool-006-estrogen-prolactin"` (PS: `Invoke-WebRequest -Uri <url> -SkipCertificateCheck \| Select-Object -ExpandProperty StatusCode`). |
| BROWSER-EN-AR | NOT_RUN/E0 | NOT_RUN/E0 | — | — | Browser check on https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/hormonal-health/tool-006-estrogen-prolactin (EN+AR). Not run (SSO per ledger). |
| BROWSER-5-STATES | NOT_RUN/E0 | NOT_RUN/E0 | — | — | Exercise EMPTY/PARTIAL/INVALID/FULL/DEGRADED on Preview. Not run (SSO). |
| RTL-390 | NOT_RUN/E0 | NOT_RUN/E0 | — | — | Real Arabic RTL at 390px. Not run (SSO). |
| CONSOLE-HYDRATION | NOT_RUN/E0 | NOT_RUN/E0 | — | — | Capture browser console. Not run (SSO). |
| NO-DUP-GENIUS | NOT_RUN/E0 | NOT_RUN/E0 | — | — | DOM inspect; verify R6_EXEMPT_SLUGS/shell alignment. Not run (SSO). |
| C4-SOURCES | NOT_AVAILABLE/E1 | NOT_AVAILABLE/E1 | `lib/tools/r6/tool-006-estrogen-prolactin-contract.ts:137-175` (TOOL_006_SOURCES, untracked); `docs/SMARTTOOLS_TOOL_006_SOURCES.md:1-19` (review 2026-10-27; no clinical source used) | — | Not approved (D-C4 open). |
| C5-REFERRAL | NOT_AVAILABLE/E1 | NOT_AVAILABLE/E1 | `components/tools/tool-006-estrogen-prolactin.genius.tsx` box 12 (inline guidance; no approved wording pack) | — | No approved referral wording (D-C5 open). |
| CLINICAL-REVIEW | BLOCKED/E1 | BLOCKED/E1 | — | — | D-CLIN open. |
| W18-HISTORY | NOT_AVAILABLE/E1 | NOT_AVAILABLE/E1 | `components/tools/tool-006-estrogen-prolactin.genius.tsx:356-371` (box 11, session-only); `docs/SMARTTOOLS_TOOL_006_SOURCES.md:11` (no local storage) | — | D-W18 open. |
| P03-PIPELINE | NOT_IMPLEMENTED/E1 | NOT_IMPLEMENTED/E1 | R6.1-P03-RESULTSCHEMA-CLOSURE-REPORT.md:28 | — | "pipeline: none tracked; negative: untracked — Valid branch needs tracked test." |

### Missing functional/runtime evidence (006)
No recorded re-run of pipeline/contract/component tests on current HEAD; I18N-PARITY never established; browser/live rows NOT_RUN (SSO); C4/C5/CLINICAL/W18/P03 pending; untracked test files inspected but not executed (constraint).

### Unsupported historical claims (006)
- Ledger HEAD `8d7e406c` is stale vs current HEAD 37f047a4 (P03-RESULT-SCHEMA-GATE commit).
- "No clinical source is used by this implementation" — verified statically (engine returns NOT_ASSESSED; docs/SMARTTOOLS_TOOL_006_SOURCES.md:9,15).
- "R6.1-PREVIEW-INDEX 5 PASS" for pipeline.ts — recorded claim; not re-executed.

### Blockers (006; owner + next action)
- I18N-PARITY — Owner: R6.1 I18N lead; Action: create+run `tool-006-i18n-check.mjs` (pattern: `tool-008-i18n-check.mjs`).
- TEST-FOCUSED — Owner: R6.1 eng; Action: re-run focused battery on HEAD 37f047a4, archive log.
- Browser evidence — Owner: preview ops; Action: unauthenticated/bypass preview or disable SSO per tool.
- C4-SOURCES — Owner: D-C4; Action: approved source pack or owner-approved N/A.
- C5-REFERRAL — Owner: D-C5; Action: approved wording pack.
- CLINICAL-REVIEW — Owner: D-CLIN; Action: sign-off.
- W18-HISTORY — Owner: D-W18; Action: owner decision.
- P03-PIPELINE — Owner: D-P03; Action: implement shared pipeline result-schema enforcement with tracked test.

---

# TOOL 008 — tool-008-side-effect-tracker (Batch 4, medical-monitoring)

**Source ledger:** `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-008-closure-ledger.md` — SHA-256 `8343C38276BA55A5F9DDB0A6E9FC0ABF3D2113BFB874F7BE91EA9E883E0D2680` (ledger head 8d7e406c, stale).
Route: `https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/medical-monitoring/tool-008-side-effect-tracker`.

## Counts (18 atomic rows; all APPLICABLE)

| Metric | Value |
|---|---|
| Total rows | 18 |
| Applicable | 18 |
| N/A + justification | 0 |
| PASS(E3+) | 3 |
| PASS below E3 | 3 |
| PARTIAL | 1 |
| NOT_RUN | 6 |
| FAIL | 0 |
| BLOCKED | 1 |
| NOT_AVAILABLE | 3 |
| NOT_IMPLEMENTED | 1 |
| **Verified % = PASS(E3+)/applicable** | **3/18 = 16.67%** |

## Row-level ledger

| Req | Ledger B/E | Audit status/E | Evidence (file:line) | Recorded result (date) | Notes / gaps |
|---|---|---|---|---|---|
| ENG-PIPELINE | PASS/E3 | PASS/E3 | `lib/tools/r6/tool-008-side-effect-tracker-pipeline.ts` (tracked; `runSideEffectTracker` :98-118); `components/tools/tool-008-side-effect-tracker.tsx:5,66` | 17 files / 50 tests PASS (2026-11-17) | Tool-specific: `STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL`; pipeline:108 `engineResult = parsed.data`; do NOT invent independent rejection proof. |
| STATE-5 | PASS/E2 | PASS/E2 | `lib/tools/r6/tool-008-side-effect-tracker-contract.ts:23` (Tool008UiState); `components/tools/tool-008-side-effect-tracker.tsx:31-39,69-70` | — | Static: 5-state surface (EMPTY/PARTIAL/INVALID/FULL/DEGRADED in type; READY in evaluation). |
| UI-GENIUS12 | PASS/E2 | PASS/E2 | `components/tools/tool-008-side-effect-tracker.genius.tsx:222-235` (boxes n=1..12, unique ids) | — | Static. |
| I18N-PARITY | PASS/E3 | PASS/E3 | `docs/MRX Genius Cloud Unified R6.1/tool-008-i18n-check.mjs` (exists); `tests/unit/tool-008-i18n-evidence.test.ts` (tracked) | I18N_PARITY OK 105/105 PASS (2026-11-17) | Not re-executed. |
| EXPORT-CSV | PASS/E2 | PASS/E2 | `lib/tools/r6/tool-008-side-effect-tracker-contract.ts:149` (`buildSideEffectCsv`); genius box 10 (`:186-203`) | — | Browser-only Blob download. |
| TEST-FOCUSED | PASS/E3 | PASS/E3 | tracked `lib/tools/r6/tool-008-side-effect-tracker-pipeline.test.ts`; `components/tools/tool-008-009-explicit-logging.test.tsx`; `tests/unit/tool-008-i18n-evidence.test.ts` | CLOSURE-SPRINT-DASHBOARD-2026-11-17.md:38; CLOSURE-SPRINT-FINAL-REPORT-2026-11-17.md:148 (17 files / 50 tests PASS, 2026-11-17) | Gap: re-run focused battery on current HEAD 37f047a4. |
| BUILD-TSC | PARTIAL/E2 | PARTIAL/E2 | mrxsteroid Vercel app | 506/506 routes Ready (2026-11-17) | Gap: archive clean tsc/build output for HEAD 37f047a4. |
| PREVIEW-ROUTE | NOT_RUN/E0 | NOT_RUN/E0 | `app/smarttools/tool-008-side-effect-tracker/page.tsx` (tracked) | Vercel E1 Ready, SSO-protected (ledger) | Isolated command: `curl -sS -o nul -w "%{http_code}" "https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/medical-monitoring/tool-008-side-effect-tracker"`. Not run. |
| BROWSER-EN-AR | NOT_RUN/E0 | NOT_RUN/E0 | — | — | Browser check on https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/medical-monitoring/tool-008-side-effect-tracker. Not run (SSO). |
| BROWSER-5-STATES | NOT_RUN/E0 | NOT_RUN/E0 | — | — | Exercise EMPTY/PARTIAL/INVALID/FULL/DEGRADED. Not run (SSO). |
| RTL-390 | NOT_RUN/E0 | NOT_RUN/E0 | — | — | 390px Arabic RTL. Not run (SSO). |
| CONSOLE-HYDRATION | NOT_RUN/E0 | NOT_RUN/E0 | — | — | Capture console. Not run (SSO). |
| NO-DUP-GENIUS | NOT_RUN/E0 | NOT_RUN/E0 | — | — | DOM inspect. Not run (SSO). |
| C4-SOURCES | NOT_AVAILABLE/E1 | NOT_AVAILABLE/E1 | `lib/tools/r6/tool-008-side-effect-tracker-contract.ts:127` (TOOL_008_SOURCES = []); genius box 9 (`components/tools/tool-008-side-effect-tracker.genius.tsx:151`) | — | Not approved (D-C4 open). |
| C5-REFERRAL | NOT_AVAILABLE/E1 | NOT_AVAILABLE/E1 | genius `:126,127,162,170` | — | No approved wording (D-C5 open). |
| CLINICAL-REVIEW | BLOCKED/E1 | BLOCKED/E1 | — | — | D-CLIN open. |
| W18-HISTORY | NOT_AVAILABLE/E1 | NOT_AVAILABLE/E1 | no localStorage/sessionStorage in `components/tools/tool-008-side-effect-tracker.tsx`; genius `:173-174` (`data-r6-rating="session_only_not_saved"`) | — | D-W18 open. |
| P03-PIPELINE | NOT_IMPLEMENTED/E1 | NOT_IMPLEMENTED/E1 | design: STRUCTURAL_VALIDATION_ONLY (pipeline:108); tool-specific constraint honored | — | By-design structural-only; no independent rejection proof invented. |

### Missing functional/runtime evidence (008)
Runtime-effectiveness proof for the pipeline is by design structurally partial (result == input); browser/live rows NOT_RUN (SSO); BUILD-TSC artifact not archived for current HEAD; C4/C5/CLINICAL/W18/P03 pending; recorded ENG-PIPELINE/I18N-PARITY/TEST-FOCUSED not re-executed.

### Unsupported historical claims (008)
- "17 files / 50 tests PASS (2026-11-17)" — recorded in CLOSURE-SPRINT-DASHBOARD-2026-11-17.md:38 and CLOSURE-SPRINT-FINAL-REPORT-2026-11-17.md:148; not re-executed by this audit.
- "I18N_PARITY OK 105/105 PASS (re-run 2026-11-17)" — recorded; not re-executed.
- Ledger HEAD 8d7e406c stale vs current HEAD 37f047a4.

### Blockers (008)
- Runtime-effectiveness proof (Accepted by design; tool-specific constraint preserved — no independent proof invented).
- Browser/live rows (SSO-protected preview).
- BUILD-TSC archiving (current HEAD 37f047a4).
- C4/C5/CLINICAL/W18/P03 pending (see 006 unresolved items).

---

# TOOL 014 — tool-014-water-retention (Batch 4, body-composition)

**Source ledger:** `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-014-closure-ledger.md` — SHA-256 `B25DB676BAD8167E4DC8A61986DD60493ECD1E7D19EF683A6B7201BBBC49985F` (ledger head 8d7e406c, stale).
Route: `https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/body-composition/tool-014-water-retention`.

## Counts (18 atomic rows; all APPLICABLE)

| Metric | Value |
|---|---|
| Total rows | 18 |
| Applicable | 18 |
| N/A + justification | 0 |
| PASS(E3+) | 3 |
| PASS below E3 | 3 |
| PARTIAL | 1 |
| NOT_RUN | 6 |
| FAIL | 0 |
| BLOCKED | 1 |
| NOT_AVAILABLE | 3 |
| NOT_IMPLEMENTED | 1 |
| **Verified % = PASS(E3+)/applicable** | **3/18 = 16.67%** |

## Row-level ledger

| Req | Ledger B/E | Audit status/E | Evidence (file:line) | Recorded result (date) | Notes / gaps |
|---|---|---|---|---|---|
| ENG-PIPELINE | PASS/E3 | PASS/E3 | `lib/tools/r6/tool-014-water-retention-pipeline.ts`; `components/tools/tool-014-water-retention.tsx:5,29` | 17 files / 50 tests PASS (2026-11-17) (dashboard:38; final:148) | Not re-executed. |
| STATE-5 | PASS/E2 | PASS/E2 | `lib/tools/r6/tool-014-water-retention-contract.ts:12` (Tool014UiState); `components/tools/tool-014-water-retention.tsx:12-13,31` | — | Static. |
| UI-GENIUS12 | PASS/E2 | PASS/E2 | `components/tools/tool-014-water-retention.genius.tsx:128-141` (boxes n=1..12) | — | Static. |
| I18N-PARITY | PASS/E3 | PASS/E3 | `docs/MRX Genius Cloud Unified R6.1/tool-014-i18n-check.mjs` (exists); `tests/unit/tool-014-i18n-evidence.test.ts` | I18N_PARITY OK 59/59 PASS (2026-11-17) | Not re-executed. |
| EXPORT-CSV | PASS/E2 | PASS/E2 | `lib/tools/r6/tool-014-water-retention-contract.ts:35-44` (`buildWaterRetentionCsv`); genius box 10 (`components/tools/tool-014-water-retention.genius.tsx:113-126`) | — | Browser-only. |
| TEST-FOCUSED | PASS/E3 | PASS/E3 | tracked `lib/tools/r6/tool-014-water-retention-pipeline.test.ts`; `lib/tools/engines/tool-014-water-retention.test.ts`; `tests/unit/tool-014-i18n-evidence.test.ts` | 17 files / 50 tests PASS (2026-11-17) | Gap: re-run per-tool battery on HEAD 37f047a4. |
| BUILD-TSC | PARTIAL/E2 | PARTIAL/E2 | mrxsteroid Vercel app | 506/506 routes Ready (2026-11-17) | Gap: archive for HEAD 37f047a4. |
| PREVIEW-ROUTE | NOT_RUN/E0 | NOT_RUN/E0 | `app/smarttools/tool-014-water-retention/page.tsx` | SSO-protected | Isolated command: `curl -sS -o nul -w "%{http_code}" "https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/body-composition/tool-014-water-retention"`. Not run. |
| BROWSER-EN-AR | NOT_RUN/E0 | — | Browser check on https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/body-composition/tool-014-water-retention. Not run (SSO). |
| BROWSER-5-STATES | NOT_RUN/E0 | — | Exercise EMPTY/PARTIAL/INVALID/FULL/DEGRADED. Not run (SSO). |
| RTL-390 | NOT_RUN/E0 | — | 390px Arabic RTL. Not run (SSO). |
| CONSOLE-HYDRATION | NOT_RUN/E0 | — | Capture console. Not run (SSO). |
| NO-DUP-GENIUS | NOT_RUN/E0 | — | DOM inspect. Not run (SSO). |
| C4-SOURCES | NOT_AVAILABLE/E1 | NOT_AVAILABLE/E1 | `lib/tools/r6/tool-014-water-retention-contract.ts:28` (TOOL_014_SOURCES = []) | — | Not approved (D-C4 open). |
| C5-REFERRAL | NOT_AVAILABLE/E1 | NOT_AVAILABLE/E1 | genius `:72-73,101` | — | No approved wording (D-C5 open). |
| CLINICAL-REVIEW | BLOCKED/E1 | BLOCKED/E1 | — | — | D-CLIN open. |
| W18-HISTORY | NOT_AVAILABLE/E1 | NOT_AVAILABLE/E1 | genius `:105` (`data-r6-rating="session_only_not_saved"`) | — | D-W18 open. |
| P03-PIPELINE | NOT_IMPLEMENTED/E1 | NOT_IMPLEMENTED/E1 | — | — | Design passthrough (not independent enforcement). |

### Missing functional/runtime evidence (014)
Browser/live rows NOT_RUN (SSO); BUILD-TSC not archived for current HEAD; recorded ENG-PIPELINE/I18N-PARITY/TEST-FOCUSED not re-executed; C4/C5/CLINICAL/W18/P03 pending.

### Unsupported historical claims (014)
- Engine honestly returns `{ status: 'NOT_AVAILABLE', reason: 'NO_VALIDATED_MODEL' }` by design (`lib/tools/engines/tool-014-water-retention.ts:8-10`; engine test asserts no estimates/severity/treatment advice).
- "17 files / 50 tests PASS (2026-11-17)" — recorded (dashboard:38; final:148); not re-executed.
- Ledger HEAD 8d7e406c stale vs 37f047a4.

### Blockers (014)
SSO-protected preview rows; BUILD-TSC archiving (current HEAD); C4/C5/CLINICAL/W18/P03 (see 006 unresolved items).

---

# TOOL 015 — tool-015-shbg-modulator (Batch 1, hormonal-health)

**Source ledger:** `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-015-closure-ledger.md` — SHA-256 `40BDC4ACF3A58D8379BE168DC07FA28B542AC56C8BEE8922DE90AF4396F8EB42` (ledger head 8d7e406c, stale).
Route: `https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/hormonal-health/tool-015-shbg-modulator`.

## Counts (18 atomic rows; all APPLICABLE)

| Metric | Value |
|---|---|
| Total rows | 18 |
| Applicable | 18 |
| N/A + justification | 0 |
| PASS(E3+) | 0 |
| PASS below E3 | 0 |
| PARTIAL | 6 |
| NOT_RUN | 7 |
| FAIL | 0 |
| BLOCKED | 1 |
| NOT_AVAILABLE | 3 |
| NOT_IMPLEMENTED | 1 |
| **Verified % = PASS(E3+)/applicable** | **0/18 = 0%** |

## Row-level ledger

| Req | Ledger B/E | Audit status/E | Evidence (file:line) | Recorded result (date) | Notes / gaps |
|---|---|---|---|---|---|
| ENG-PIPELINE | PARTIAL/E1 | PARTIAL/E1 | `lib/tools/r6/tool-015-shbg-modulator-pipeline.ts` (tracked); `components/tools/tool-015-shbg-modulator.tsx:20,123,156,188,206` (calls `runSHBGModulator`) | — | Gap: re-run + capture evidence on current HEAD. |
| STATE-5 | PARTIAL/E1 | PARTIAL/E1 | `components/tools/tool-015-shbg-modulator.tsx:75` (status union PARTIAL/INVALID/CALCULATED), `:215` (FULL = state_full) | — | 5-state surface partially modeled; no explicit EMPTY/DEGRADED. Engine: `calculateSHBG` returns `status: 'CALCULATED'` (Vermeulen mass-action). |
| UI-GENIUS12 | PARTIAL/E1 | PARTIAL/E1 | `components/tools/tool-015-shbg-modulator.genius.tsx` (doc comment lines 5-20 "Implements the full 12-box framework"; boxes n=1..12: kpi-strip, primary-result, how-calculated, inputs-summary, what-if, sensitivity, safety-warnings, cross-tool-links, sources-evidence, export-box, history-box, next-actions) | — | Static. |
| I18N-PARITY | NOT_RUN/E0 | NOT_RUN/E0 | verified: no `docs/MRX Genius Cloud Unified R6.1/tool-015-i18n-check.mjs` | — | Create+run script. |
| EXPORT-CSV | PARTIAL/E1 | PARTIAL/E1 | `lib/tools/r6/tool-015-shbg-modulator-contract.ts:241` (`buildShbgCsv`); genius box 10 (`components/tools/tool-015-shbg-modulator.genius.tsx:82-109`) | — | Browser-only. |
| TEST-FOCUSED | PARTIAL/E2 | PARTIAL/E2 | untracked `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` + tracked `lib/tools/engines/tool-015-shbg-modulator.test.ts` | Batch 1 combined: 15 files / 84 tests PASS (006/015/023/035) — CLOSURE-SPRINT-DASHBOARD-2026-11-17.md:17 | No per-tool rerun recorded. |
| BUILD-TSC | PARTIAL/E2 | PARTIAL/E2 | mrxsteroid Vercel app | 506/506 routes Ready (2026-11-17) | Gap: archive for HEAD 37f047a4. |
| PREVIEW-ROUTE | NOT_RUN/E0 | — | `app/smarttools/tool-015-shbg-modulator/page.tsx` | SSO-protected | Isolated command: `curl -sS -o nul -w "%{http_code}" "https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/hormonal-health/tool-015-shbg-modulator"`. Not run. |
| BROWSER-EN-AR | NOT_RUN/E0 | — | Browser check on https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app/smarttools/hormonal-health/tool-015-shbg-modulator. Not run (SSO). |
| BROWSER-5-STATES | NOT_RUN/E0 | — | Exercise EMPTY/PARTIAL/INVALID/FULL/DEGRADED. Not run (SSO). |
| RTL-390 | NOT_RUN/E0 | — | 390px Arabic RTL. Not run (SSO). |
| CONSOLE-HYDRATION | NOT_RUN/E0 | — | Capture console. Not run (SSO). |
| NO-DUP-GENIUS | NOT_RUN/E0 | — | DOM inspect. Not run (SSO). |
| C4-SOURCES | NOT_AVAILABLE/E1 | NOT_AVAILABLE/E1 | `lib/tools/r6/tool-015-shbg-modulator-contract.ts:138-168` (TOOL_015_SOURCES: Vermeulen JCEM 1999; Endocrine Society 2018; Annals 2015); `docs/SMARTTOOLS_TOOL_015_SHBG_SOURCES.md:1-16` (review 2026-10-25) | — | Not approved (D-C4 open). |
| C5-REFERRAL | NOT_AVAILABLE/E1 | NOT_AVAILABLE/E1 | genius box 12 guidance (`components/tools/tool-015-shbg-modulator.genius.tsx:376-404`) | — | No approved wording pack (D-C5 open). |
| CLINICAL-REVIEW | BLOCKED/E1 | BLOCKED/E1 | — | — | D-CLIN open. |
| W18-HISTORY | NOT_AVAILABLE/E1 | NOT_AVAILABLE/E1 | genius box 11 session-only (`components/tools/tool-015-shbg-modulator.genius.tsx:361-375`) | — | D-W18 open. |
| P03-PIPELINE | NOT_IMPLEMENTED/E1 | NOT_IMPLEMENTED/E1 | — | — | Design passthrough. |

### Working-tree disposition (audit-relevant)
Modified: `components/tools/tool-015-shbg-modulator.tsx`, `i18n/tool-015-shbg-modulator.json`. Untracked: `components/tools/tool-015-shbg-modulator.genius.tsx`, `.ocr.tsx`, `.pdf.tsx`, `.visual.tsx`, `.parity.test.tsx`, `lib/tools/r6/tool-015-shbg-modulator-contract.ts` (untracked), `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` (untracked).

### Missing functional/runtime evidence (015)
I18N-PARITY never established (no script); pipeline.test.ts + contract are UNTRACKED (not on HEAD 37f047a4 — R6.1-P03 report notes "Valid branch needs tracked test" for analogous 006; for 015 no tracked pipeline/contract tests on HEAD); ENG-PIPELINE/STATE-5/UI-GENIUS12/EXPORT-CSV/TEST-FOCUSED recorded only as partial; browser/live rows NOT_RUN (SSO); C4/C5/CLINICAL/W18/P03 pending; BUILD-TSC not archived.

### Unsupported historical claims (015)
- "R6 pipeline artifacts present; R6.1 closure doc evidence incomplete" — artifacts verified; evidence incomplete.
- Contract `TOOL_015_SOURCES` (Vermeulen/Endocrine Society/Annals) — not approved per ledger (D-C4 open); `docs/SMARTTOOLS_TOOL_015_SHBG_SOURCES.md` documents basis but is not the "specialist-approved" pack.
- Ledger HEAD 8d7e406c stale vs 37f047a4.

### Blockers (015)
SSO-protected preview rows; BUILD-TSC archiving; C4/C5/CLINICAL/W18/P03 (see 006 unresolved items).

---

# Summary table

| Tool | Total | Applicable | N/A+Just | PASS(E3+) | PASS below E3 | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE | NOT_IMPLEMENTED | Verified % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 006 | 18 | 18 | 0 | 0 | 4 | 2 | 7 | 0 | 1 | 3 | 1 | 0/18 = 0% |
| 008 | 18 | 18 | 0 | 3 | 3 | 1 | 6 | 0 | 1 | 3 | 1 | 3/18 = 16.67% |
| 014 | 18 | 18 | 0 | 3 | 3 | 1 | 6 | 0 | 1 | 3 | 1 | 3/18 = 16.67% |
| 015 | 18 | 18 | 0 | 0 | 0 | 6 | 7 | 0 | 1 | 3 | 1 | 0/18 = 0% |

# Unresolved items (owner + next action)

- **All tools — SSO-protected preview rows** (PREVIEW-ROUTE, BROWSER-EN-AR, BROWSER-5-STATES, RTL-390, CONSOLE-HYDRATION, NO-DUP-GENIUS): Owner — preview/SSO ops; Action — unauthenticated/bypass preview or disable protection; then re-run isolated curl/browser checks.
- **CLINICAL-REVIEW** (006/008/014/015): Owner — D-CLIN; Action — clinical/model review sign-off.
- **C4-SOURCES** (all): Owner — D-C4; Action — deliver approved source pack or owner-approved N/A (006: engine makes no clinical interpretation — docs/SMARTTOOLS_TOOL_006_SOURCES.md supports N/A; 008/014: TOOL_SOURCES = []; 015: Vermeulen/ES/Annals not yet approved).
- **C5-REFERRAL** (all): Owner — D-C5; Action — deliver approved AR/EN wording pack.
- **W18-HISTORY** (all): Owner — D-W18; Action — owner decision; evidence: session-only storage (008: `data-r6-rating="session_only_not_saved"`; 006/015: box 11 session-only; 014: same).
- **P03-PIPELINE** (all): Owner — D-P03; Action — implement shared pipeline result-schema enforcement (008 by design; 006: needs tracked negative test — pipeline.test.ts is untracked).
- **006 — I18N-PARITY**: Owner — R6.1 I18N lead; Action — create+run `tool-006-i18n-check.mjs`.
- **006 — TEST-FOCUSED**: Owner — R6.1 eng; Action — re-run focused battery on HEAD 37f047a4 on-tracked tests (pipeline.test.ts + component test untracked).
- **006 — ENG-PIPELINE/STATE-5/UI-GENIUS12/EXPORT-CSV**: Owner — R6.1 eng; Action — re-run focused battery (recorded evidence only 5 PASS pipeline / "closure doc evidence incomplete").
- **008 — runtime-effectiveness**: Owner — D-P03/eng; Action — dedicated negative-test — **accepted by design: STRUCTURAL_VALIDATION_ONLY, do not invent independent proof** (pipeline:108 `engineResult = parsed.data`).
- **008 — BUILD-TSC**: Owner — CI; Action — archive clean tsc/build output for HEAD 37f047a4.
- **015 — I18N-PARITY**: Owner — R6.1 I18N lead; Action — create `tool-015-i18n-check.mjs` + `tests/unit/tool-015-i18n-evidence.test.ts`; make pipeline.test.ts + contract tracked on HEAD 37f047a4.
- **015 — ENG-PIPELINE/STATE-5/UI-GENIUS12/EXPORT-CSV/TEST-FOCUSED**: Owner — R6.1 eng; Action — re-run on current HEAD; note pipeline/contract untracked.

**General note:** All "PASS(E3+)" statuses rely on recorded results (dated 2026-11-17) + artifact presence at HEAD 37f047a4; execution was not performed in this read-only audit (constraints). "PASS below E3" = PASS with E2.

SHA-256 of this output: [see trailing line]
