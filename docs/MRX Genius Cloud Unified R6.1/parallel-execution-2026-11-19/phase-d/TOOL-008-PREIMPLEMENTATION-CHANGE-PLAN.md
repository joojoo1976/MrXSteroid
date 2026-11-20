# TOOL 008 — PRE-IMPLEMENTATION CHANGE PLAN (R6.1, Phase D)

| Field | Value |
|---|---|
| Document ID | Phase D / Tool 008 / pre-implementation gate |
| Date | 2026-11-20 |
| Mode | **READ-ONLY PLAN + BASELINE PROTECTION RECORD.** No source, contract, schema, route, registry, shared shell, P-03 suite, ledger, git state, or owner decision has been changed. |
| Baseline branch / HEAD | `feat/r6.1-tools-041-042` / `37f047a4105d078b22edea2c857bf35aefdbdc7f` (re-verified this session) |
| Phase Next closure | `phase-next/PHASE-NEXT-COMPLETION-REPORT.md`, whole-file SHA `215EE6E501F602DF4B272DDE5C4BF2648434ED828200E57A420824165F197F48` — re-verified present and byte-identical this session |
| Authoritative per-tool audit | `phase-next/TOOL-008-INDIVIDUAL-DEVELOPMENT-AUDIT.md`, body SHA `DDAFE8B4F134154E859B82B1B99D9DB3CCAE255D04E4F6C5567F977DE4473269` |
| Target | `008` / `mrx.tool.008-side-effect-tracker` / `tool-008-side-effect-tracker` |
| Tool decision (unchanged) | **PRESERVE** — 3/18 = 16.67% recorded PASS(E3+), `STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL` |
| Shared-file exposure | **NONE.** No HIGH/CRITICAL shared file is in scope. No Change Impact Matrix triggered. |
| Authorization state | **PENDING.** This plan stops before any file modification. Explicit scoped authorization required before implementation. |

## 1. Baseline protection record (§3)

### 1.1 Live repository identity

| Check | Observed |
|---|---|
| Branch | `feat/r6.1-tools-041-042` |
| HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` |
| `git status --porcelain=v1` (default) | **386** entries at plan-writing time (46 modified, 340 collapsed untracked) |
| `git status --porcelain=v1 -uall` | **668** entries (46 modified, 622 untracked files) |
| Staged (`git diff --cached --name-only`) | 0 |
| Unstaged modified (`git diff --name-only`) | 46 |
| Git write operations | none — no commit, push, merge, rebase, reset, clean, stash, checkout, add |

### 1.2 530-entry manifest vs current path list — path-level reconciliation

| Basis | Total | Modified | Untracked |
|---|---:|---:|---:|
| Historic 530 manifest (`C:\Users\foryo\AppData\Local\Temp\opencode\live-status-530.txt`, `--untracked-files=all`, 2026-11-19 17:11Z) | 530 | 46 | 484 **files** |
| Current `-uall` | 668 | 46 | 622 **files** |
| Phase Next completion report (default porcelain) | 384 | 46 | 338 **collapsed directory entries** |
| Current default porcelain | 386 | 46 | 340 **collapsed directory entries** |

**Set difference (like-for-like `-uall` vs 530 manifest):** 138 paths added, **0 removed**. Not one baseline path was lost or rewritten.

- 58 added paths are Phase Next forensic deliverables under `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/` (phase-next audits, W2/W4b/W5 reports, comparison CSV, priority matrix, roadmap, dashboard, retry-01 ledgers, completion report).
- 80 added paths are Postman plugin/CLI artifacts: `.postman/resources.yaml`, `postman/globals/workspace.globals.yaml`, 76 files under `postman/collections/MrXSteroid API/`, 2 under `postman/collections/New Collection/`.
- These Postman files are being written by an **external background process** (observed creation times 2026-11-20 05:46Z through 06:55Z). They are additive, untracked, unrelated to Tool 008, and are **preserved untouched**. They explain the 384 → 386 drift (two new collapsed top-level untracked directories, `.postman/` and `postman/`) observed during this session. They are not a Tool 008 change.

**The 146 difference is a counting-mode artifact, not 146 missing files:**
`484 untracked files (530 manifest, -uall) − 338 collapsed untracked directories (default porcelain at Phase Next closure) = 146`.
The 146 "extra" entries in the 530 manifest are individual untracked file paths that Git's default porcelain represents by their parent directory. At plan time the equivalent calculation is `622 − 340 = 282`, enlarged by the 58 Phase Next files and 80 Postman files added since the manifest. No file-level loss and no unexplained deletion exists.

### 1.3 True-clean reference

| Check | Observed |
|---|---|
| Path | `E:/p03-true-clean-20261118` (report form; the suffixed path `E:\p03-true-clean-20261118@37f047a4` does not exist) |
| HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f`, detached |
| Status `-uall` | **0** — genuinely clean |
| Dependencies | `node_modules` symlink → `E:\MrXSteroid-main\node_modules`; Vitest 4.1.10 and TypeScript bins available |
| Excluded | `E:/p03-clean-build-20261118@2a647fda` (contaminated) |

### 1.4 Tool 008 artifact inspection

All 13 tracked Tool 008 artifacts are **clean at HEAD** (no modified/untracked source): route page, engine, pipeline, pipeline test, contract, schema, component, genius component, explicit-logging test, i18n-evidence test, i18n JSON, i18n check script, development proposals. The only Tool-008-named untracked path is the Phase Next audit document. No working code will be overwritten.

Four zero-byte files were re-verified and remain untouched:
`TOOL-46/47/48/49-INDIVIDUAL-DEVELOPMENT-AUDIT.md` — each 0 bytes, SHA `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`.

## 2. Exact four locally outstanding requirement IDs

| # | Requirement ID | Current | Classification | Local/gated | Why |
|---|---|---|---|---|---|
| 1 | `STATE-5` | PASS / **E2** (static component + recorded E3, not re-run) | `EVIDENCE_GAP` + `TEST_GAP` | LOCAL | No focused tool-local DOM test exercises all five states (`EMPTY`, `PARTIAL`, `INVALID`, `FULL`, `DEGRADED`) at HEAD. |
| 2 | `UI-GENIUS12` | PASS / **E2** | `EVIDENCE_GAP` + `TEST_GAP` | LOCAL | No focused test proves the ordered 12-box array and compact CORE-5 set `[2,3,7,9,12]`; DOM duplicate-shell proof stays E4-gated (not attempted). |
| 3 | `EXPORT-CSV` | PASS / **E2** | `EVIDENCE_GAP` + `TEST_GAP` | LOCAL | `buildSideEffectCsv` is static-only; no unit test covers field order, blank optional fields, or quote/comma/newline escaping. |
| 4 | `BUILD-TSC` | PARTIAL / **E2** | `EVIDENCE_GAP` | LOCAL | No archived HEAD-artifact. Fresh `tsc --noEmit` in true-clean **now exits 0**, but the result is not yet archived as reproducible evidence. |

Supporting evidence refresh (not separate denominator rows): `I18N-PARITY` / `TEST-FOCUSED` / `ENG-PIPELINE` re-runs (`V-008-3`) and posture documentation (`I-008-4`). Fresh results obtained this session:

- `node "docs/MRX Genius Cloud Unified R6.1/tool-008-i18n-check.mjs"` → `I18N_PARITY: OK`, `keys: en = 105, ar = 105`, exit **0**.
- True-clean focused battery → `3 files / 8 tests passed`, exit **0**, root confirmed `E:/p03-true-clean-20261118`.
- True-clean `tsc --noEmit -p tsconfig.json` → exit **0**.

These are fresh observed results but are **not archived yet**; archiving is part of the proposed implementation.

**Gated rows deliberately out of scope (11):** 6 browser E4 rows (`PREVIEW-ROUTE`, `BROWSER-EN-AR`, `BROWSER-5-STATES`, `RTL-390`, `CONSOLE-HYDRATION`, `NO-DUP-GENIUS`), 4 owner-gated rows (`C4-SOURCES`, `C5-REFERRAL`, `CLINICAL-REVIEW`, `W18-HISTORY`), 1 shared/approval-gated row (`P03-PIPELINE`). None will be touched, reclassified, or claimed.

## 3. Proposed change scope (all additive; no production behavior change)

| # | Proposed path | Type | Purpose | Shared? |
|---|---|---|---|---|
| 1 | `lib/tools/r6/tool-008-side-effect-tracker-contract.test.ts` | NEW tool-local test | Draft-state evaluator transitions and `buildSideEffectCsv` escaping/field order (rows 1, 3 support) | No |
| 2 | `components/tools/tool-008-side-effect-tracker.states.test.tsx` | NEW tool-local test | Five-state DOM transitions via `data-r6-state` (row 1) | No |
| 3 | `components/tools/tool-008-side-effect-tracker.genius.test.tsx` | NEW tool-local test | 12 boxes in fixed order, compact `[2,3,7,9,12]`, no duplicate `data-r6-box`, source badges and session-only rating (row 2) | No |
| 4 | `phase-d/evidence/TOOL-008-I18N-PARITY-20261120.txt` | NEW evidence archive | Fresh 105/105 parity output + exit code + command/SHA | No |
| 5 | `phase-d/evidence/TOOL-008-FOCUSED-VITEST-20261120.txt` | NEW evidence archive | True-clean focused battery (existing + new tests) | No |
| 6 | `phase-d/evidence/TOOL-008-TSC-NOEMIT-20261120.txt` | NEW evidence archive | True-clean `tsc --noEmit` exit 0 (row 4) | No |
| 7 | `phase-d/evidence/TOOL-008-BASELINE-PATH-RECONCILIATION-20261120.txt` | NEW evidence archive | Raw 530/current path lists and counts from §1 | No |
| 8 | `phase-d/TOOL-008-IMPLEMENTATION-CHANGELOG.md` | NEW doc | Exact files added, no behavior change | No |
| 9 | `phase-d/TOOL-008-VERIFICATION-REPORT.md` | NEW doc | Commands, exit codes, counts, environment | No |
| 10 | `phase-d/TOOL-008-EVIDENCE-INDEX.md` | NEW doc | Evidence-to-requirement mapping | No |
| 11 | `phase-d/TOOL-008-DEVELOPMENT-CLOSURE-ADDENDUM.md` | NEW doc | Recalculated maturity/completion; owner-review boundary | No |

**Explicitly excluded:** `R6ToolShell.tsx`, `boxes.ts`, `manifest.ts`, `registry.ts`, dynamic route page, any `p03-*.test.ts`, `TOOL_008_SOURCES`, referral strings, W18 storage/history, i18n JSON content, engine/contract/pipeline/component runtime code, all owner decision records, all Phase Next reports, all zero-byte files, all untracked working-tree artifacts.

## 4. Shared-component impact determination

No proposed path appears in `W4b-SHARED-COMPONENT-IMPACT-MAP.md` §2 HIGH/CRITICAL list. Tool 008 is a **non-exempt shared-shell tool**, but this plan performs no shell edit; tests render the tool-local component/genius directly. **Change Impact Matrix not required.** One development owner: this session. Code changes remain sequential per tool; no other tool is modified.

## 5. TDD and verification plan

1. **RED:** add each new test file, run it in true-clean with `--root E:/p03-true-clean-20261118` and record the failure if the assertion is not yet satisfied. Because the new files do not exist at baseline, the initial run is expected to fail on file selection until the file is staged in the test environment — record that honestly; do not fabricate a behavioral RED.
2. **GREEN:** confirm each test passes against the **unmodified** production code. If a test exposes a genuine defect, **STOP** — document it and request a separate scoped decision; do not silently change runtime code.
3. No production code change is planned, so the TDD iron law creates no authorization for source edits.
4. **Targeted tests:** new three test files + existing three-file focused battery, in true-clean at `37f047a4`, with `--root` pinned and exit codes captured.
5. **Interface/math regression:** contract evaluator and CSV tests cover the only deterministic logic; pipeline test already covers envelope/guard path. No engine equation exists; no new math claim.
6. **Build:** `tsc --noEmit -p tsconfig.json` in true-clean; archive output. Full `next build` remains gated by environment/owner authorization and is not claimed here.
7. **I18N:** re-run check script, archive exit 0 and 105/105. No i18n content change.
8. **E4/browser:** `NOT_RUN` — authorized SSO + Preview pinned to `37f047a4` + Deployment ID unavailable. No browser claim.
9. **Completion math:** recalculate only from E3+ rows. Gated/unresolved rows remain in the denominator. Target after proposed work: at most `7/18 = 38.9%` local ceiling; **never 100% VERIFIED** while 11 rows remain gated.

## 6. Preservation and prohibitions

- Preserve all 384/386 default-status paths, all 622 `-uall` paths, all 46 modified files, all untracked artifacts, and four zero-byte files byte-for-byte.
- No cleanup/deletion, no overwrite of working code, no re-audit or replacement of Phase Next reports.
- No git writes, deploy, DB/RLS/Storage/Cloud Sync, provider activation, Tool 042 activation, owner-decision change, clinical self-approval, P-05 adoption, W18 persistence/history, or shared architecture/contract change.
- Tool 008 posture stays `STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL`; E2 static evidence is never counted as E3; `NOT_AVAILABLE ≠ NOT_APPLICABLE`; recorded Tool 039 acceptance is never transferred.

## 7. Approval gate

Implementation may begin **only** after explicit scoped authorization naming Tool 008 and the exact file set in §3. This plan itself grants no authorization. If the owner narrows the file set, the affected rows and evidence claims must be revised before work starts.

## 8. Integrity note

Read-only investigation plus the three read-only verifications recorded in §2. No repository file was created, edited, or deleted by this plan document's preparation other than this plan itself. Observed on-disk SHA-256 is authoritative. Body-before-hash convention is used: the value below is computed over all bytes preceding this final line.
Observed on-disk SHA-256 (body before this line): `41BEB19058B60CE4EA59F0D5D83D6B85EC3F4D3A160761208C5325E6D32B2BB3`
