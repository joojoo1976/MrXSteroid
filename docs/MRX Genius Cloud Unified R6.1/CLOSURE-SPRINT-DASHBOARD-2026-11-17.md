# R6.1 Closure Sprint Dashboard — Batches 1–4

**Date:** 2026-11-17  
**Source branch (pushed):** `feat/r6.1-tools-041-042`  
**Source HEAD (this snapshot):** `b49b1627429a300fa7e8fcec0ee627fd76d16869`  
**Scope:** all tools implemented/delivered in **Batches 1,2,3,4** (closure scope). No new tools/batches opened.  
**Companion:** `docs/MRX Genius Cloud Unified R6.1/R6.1-SHARED-DECISIONS-BLOCKERS.md` (unified C4/C5/W18/P-03/clinical-review decisions).

**Important:** This dashboard distinguishes **engineering implementation/evidence status** from **formal R6.1 closure**. `PARTIAL` / `NOT_AVAILABLE` / `BLOCKED` / `NOT_RUN` are **not** complete. `100% VERIFIED` is not claimed here for any Batch 1–4 tool because required closure evidence (specialist C4/C5, clinical/model review where applicable, P-03 pipeline decision where applicable, W18 decision, and per-tool Preview+390px RTL E-level evidence/ledgers) is not fully satisfied/evidenced.

---

## 1) Central table (all implemented tools, Batches 1–4)

| Batch | Tool | Category / Route | Source SHA (latest tool-related commit on branch) | Preview URL / Deployment ID (known) | EN/AR i18n check | Focused test evidence (known) | Engineering status | Formal R6.1 closure status | What prevents 100% now (main) | Next engineering-completable actions |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 006 `tool-006-estrogen-prolactin` | hormonal-health / `/smarttools/hormonal-health/tool-006-estrogen-prolactin` | `108d3063` (baseline; Batch 1 re-verified per report) | Batch 1: `https://mrxsteroid-preview-r6-batch1.vercel.app`, `dpl_8QsftgrnwGBS8PrKPP6APkoAT31d` (batch-level) | No R6.1 i18n-check script in docs folder (artifact gap) | Batch 1 report: 006/015/023/035 **15 files / 84 tests PASS** (combined) | **IN PROGRESS** (artifacts exist: component/genius/contract/pipeline/tests) | **NOT CLOSED** | Missing R6.1 closure doc pack (proposals/ledger/i18n-check/evidence) in R6.1 folder; C4/C5/clinical/P-03/W18/390px RTL/preview-per-tool evidence gaps | Create/align R6.1 proposals+evidence docs; re-run focused battery; verify on Preview with 390px RTL |
| 1 | 015 `tool-015-shbg-modulator` | hormonal-health / `/smarttools/hormonal-health/tool-015-shbg-modulator` | `108d3063` (baseline; Batch 1 re-verified) | Batch 1: `https://mrxsteroid-preview-r6-batch1.vercel.app`, `dpl_8QsftgrnwGBS8PrKPP6APkoAT31d` | No R6.1 i18n-check script | 006/015/023/035 combined **15/84 PASS** (Batch 1 report) | **IN PROGRESS** | **NOT CLOSED** | Same as 006 + closure doc/evidence packaging | Same as 006 |
| 1 | 023 `tool-023-trt-optimization` | hormonal-health / `/smarttools/hormonal-health/tool-023-trt-optimization` | `108d3063` (baseline; Batch 1 re-verified) | Batch 1 preview/dpl above | No R6.1 i18n-check script | 006/015/023/035 combined **15/84 PASS** | **IN PROGRESS** | **NOT CLOSED** | Closure doc/evidence + shared blockers | Doc/evidence alignment, preview checks |
| 1 | 035 `tool-035-hormone-conversion` | hormonal-health / `/smarttools/hormonal-health/tool-035-hormone-conversion` | `108d3063` (baseline; Batch 1 re-verified) | Batch 1 preview/dpl above | No R6.1 i18n-check script | 006/015/023/035 combined **15/84 PASS** | **IN PROGRESS** | **NOT CLOSED** | Closure doc/evidence + shared blockers | Doc/evidence alignment, preview checks |
| 1 | 040 `tool-040-lipid-profile-optimizer` | medical-monitoring / `/smarttools/medical-monitoring/tool-040-lipid-profile-optimizer` | historical in repo (R6.1 docs/ledger exist) | Batch 1 preview/dpl above (batch-level) | **PASS** (236/236, re-run 2026-11-17) | R6.1 acceptance/ledger artifacts exist (`tool-040-requirements.csv`, acceptance docs); focused evidence per docs (not re-run in full here) | **IN PROGRESS** (high evidence base) | **NOT CLOSED** | Ledger-driven remaining items, C4/C5/clinical/P-03/W18 as applicable, per-tool 390px RTL/preview evidence refresh | Re-run focused battery + refresh preview/RTL evidence, update ledger with E3+ only |
| 1 | 041 `tool-041-hematocrit-monitor` | medical-monitoring / `/smarttools/medical-monitoring/tool-041-hematocrit-monitor` | `c15b84c7` (build-fix for 041/042 committed types) | Batch 1: `.../tool-041-hematocrit-monitor` on batch1 preview, `dpl_8QsftgrnwGBS8PrKPP6APkoAT31d`; Batch 2 preview also served 041 | **PASS** (172/172) | Batch 1 report: 041 focused **5 files / 47 tests PASS**; 041+042 after fix **14/141 PASS**; ledger calc 2026-11-14: **76/132 = 57.58%** applicable evidenced (v2-138) | **IN PROGRESS** (ledger-tracked) | **OWNER_REVIEW — NOT ACCEPTED — NOT CLOSED** | 56 applicable rows not completion (PARTIAL/FAIL/NOT_AVAILABLE/BLOCKED/NOT_RUN per ledger), C4/C5/clinical, P-03, W18, 390px RTL, dual-shell/exemption verification on current preview | Close engineering ledger gaps (tests/a11y/RTL evidence/docs), no clinical invention |
| 1 | 042 `tool-042-estrogen-management` | hormonal-health / `/smarttools/hormonal-health/tool-042-estrogen-management` | `c15b84c7` | Batch 1 & 2 preview URLs, `dpl_8QsftgrnwGBS8PrKPP6APkoAT31d` (batch1) / `dpl_9fp8FrqQeDVbTsUdmUZhgrDYJctg` (batch2) | **PASS** (178/178) | Batch 1 report: 042 focused **7 files / 87 tests PASS**; R6 regression slices passed | **IN PROGRESS** | **NOT CLOSED** (owner review pending) | No full R6.1 ledger in folder; C4/C5/clinical/P-03/W18/390px RTL/preview-per-tool evidence gaps | Produce/align requirement ledger or equivalent evidence register; verify preview+RTL |
| 1 | 043 `tool-043-prolactin-management` | hormonal-health / `/smarttools/hormonal-health/tool-043-prolactin-management` | `5a87f3e5` (historical; Batch 1 re-verified) | Batch 1 preview/dpl above | No R6.1 i18n-check script | R6 artifacts/tests exist; not re-run this pass | **IN PROGRESS** | **NOT CLOSED** | Closure doc/evidence + shared blockers | R6.1 doc/evidence packaging, focused rerun, preview checks |
| 1 | 044 `tool-044-dht-side-effects` | hormonal-health / `/smarttools/hormonal-health/tool-044-dht-side-effects` | `5a87f3e5` (historical; Batch 1 re-verified) | Batch 1 preview/dpl above | No R6.1 i18n-check script | R6 artifacts/tests exist; not re-run this pass | **IN PROGRESS** | **NOT CLOSED** | Closure doc/evidence + shared blockers | R6.1 doc/evidence packaging, focused rerun, preview checks |
| 2 | 045 `tool-045-cycle-break-planner` | cycle-management / `/smarttools/cycle-management/tool-045-cycle-break-planner` | `579c9f56` | Batch 2: `https://mrxsteroid-preview-r6-batch2.vercel.app`, `dpl_9fp8FrqQeDVbTsUdmUZhgrDYJctg` | **PASS** (140/140) | Batch 2 report: 045 battery **4/54 PASS**, full **7/81 PASS**; regression slices passed | **IN PROGRESS** (R6.1 UI+docs) | **NOT CLOSED** | C4/C5/clinical/P-03/W18, 390px RTL not run, no formal ledger/% | Engineering gaps + preview RTL evidence; keep honest N/A/NA states |
| 2 | 046 `tool-046-trt-lifetime-calculator` | cycle-management / `/smarttools/cycle-management/tool-046-trt-lifetime-calculator` | `d8acd740` | Batch 2 preview/dpl | **PASS** (140/140) | Batch 2 regression **59/516 PASS** (cumulative slice) | **IN PROGRESS** | **NOT CLOSED** | Shared blockers + preview/RTL/ledger | Same |
| 2 | 047 `tool-047-fertility-preservation` | cycle-management / `/smarttools/cycle-management/tool-047-fertility-preservation` | `b19f360b` | Batch 2 preview/dpl | **PASS** (140/140) | Batch 2 regression slice | **IN PROGRESS** | **NOT CLOSED** | Shared blockers + preview/RTL/ledger | Same |
| 2 | 048 `tool-048-cardiovascular-risk-assessor` | medical-monitoring / `/smarttools/medical-monitoring/tool-048-cardiovascular-risk-assessor` | `1af1d45c` | Batch 2 preview/dpl | **PASS** (169/169) | Batch 2 regression slice | **IN PROGRESS** | **NOT CLOSED** | Shared blockers + clinical/source sensitivity + preview/RTL/ledger | Same, no invented clinical thresholds |
| 2 | 049 `tool-049-bone-density-optimizer` | medical-monitoring / `/smarttools/medical-monitoring/tool-049-bone-density-optimizer` | `42e11b41` | Batch 2 preview/dpl | **PASS** (174/174) | Batch 2 regression slice | **IN PROGRESS** | **NOT CLOSED** | Shared blockers + preview/RTL/ledger | Same |
| 2 | 050 `tool-050-mental-health-monitor` | medical-monitoring / `/smarttools/medical-monitoring/tool-050-mental-health-monitor` | `12fbc24c` | Batch 2 preview/dpl | **PASS** (158/158) | Batch 2 regression slice | **IN PROGRESS** | **NOT CLOSED** | Shared blockers + careful non-clinical wording + preview/RTL/ledger | Same |
| 2 | 051 `tool-051-peptide-dosage-calculator` | injection-formulation / `/smarttools/injection-formulation/tool-051-peptide-dosage-calculator` | `371d2bcc` | Batch 2 preview/dpl | **PASS** (122/122) | Batch 2 regression slice | **IN PROGRESS** | **NOT CLOSED** | Shared blockers + preview/RTL/ledger | Same |
| 3 | 016 `tool-016-half-life-calculator` | cycle-management / `/smarttools/cycle-management/tool-016-half-life-calculator` | `8725fa3d` (pipeline chore includes Batch 3 context; per Batch 3 commits earlier: `82798e4e`,`2b637ae8`) | **Not recorded** (no Batch 3 report file found) | **PASS** (129/129) | Pipeline/i18n evidence artifacts present (R6.1 docs/tests implied); not consolidated in report | **IN PROGRESS** | **NOT CLOSED** | No Batch 3 report/preview ID/URL/RTL evidence; C4 proposed N/A pending approval; P-03/W18/clinical/ledger gaps | Capture preview+RTL evidence, formalize ledger, resolve C4 N/A decision |
| 3 | 022 `tool-022-oral-vs-injectable` | cycle-management / `/smarttools/cycle-management/tool-022-oral-vs-injectable` | `8725fa3d` (see 016 note; impl commit `9bee0deb` per history) | **Not recorded** | **PASS** (119/119) | Artifacts present; consolidated evidence missing | **IN PROGRESS** | **NOT CLOSED** | Missing preview/RTL/ledger + shared blockers | Same |
| 3 | 027 `tool-027-ester-conversion` | cycle-management / `/smarttools/cycle-management/tool-027-ester-conversion` | `8725fa3d` (impl `2d246bfd`) | **Not recorded** | **PASS** (117/117) | Artifacts present | **IN PROGRESS** | **NOT CLOSED** | Missing preview/RTL/ledger + shared blockers | Same |
| 3 | 031 `tool-031-blast-cruise` | cycle-management / `/smarttools/cycle-management/tool-031-blast-cruise` | `8725fa3d` (impl `56380d66`,`770e50f`) | **Not recorded** | **PASS** (131/131) | Artifacts present | **IN PROGRESS** | **NOT CLOSED** | Missing preview/RTL/ledger + shared blockers | Same |
| 3 | 034 `tool-034-compound-clearance` | cycle-management / `/smarttools/cycle-management/tool-034-compound-clearance` | `19e9301c` | **Not recorded** | **PASS** (116/116) | Artifacts present | **IN PROGRESS** | **NOT CLOSED** | Missing preview/RTL/ledger + shared blockers | Same |
| 4 | 008 `tool-008-side-effect-tracker` | medical-monitoring / `/smarttools/medical-monitoring/tool-008-side-effect-tracker` | `5edce6da` | **Not recorded** (Batch 4 preview not executed) | **PASS** (105/105) | i18n/pipeline/logging tests passed in impl + consolidated **17/50 PASS** battery | **IN PROGRESS** (R6.1 UI done) | **NOT CLOSED** | No preview ID/URL/390px RTL; C4/C5/clinical/P-03/W18; ledger missing | Deploy clean preview, RTL evidence, ledger |
| 4 | 014 `tool-014-water-retention` | body-composition / `/smarttools/body-composition/tool-014-water-retention` | `cbf75513` | **Not recorded** | **PASS** (59/59) | Consolidated **17/50 PASS** includes 014 | **IN PROGRESS** | **NOT CLOSED** | No validated model (honest unavailable) — needs owner-approved handling/C4 N/A decision if applicable; preview/RTL/ledger | Evidence + decisions bundle |
| 4 | 017 `tool-017-drug-interaction` | medical-monitoring / `/smarttools/medical-monitoring/tool-017-drug-interaction` | `4e73130a` | **Not recorded** | **PASS** (63/63) | Consolidated **17/50 PASS** | **IN PROGRESS** | **NOT CLOSED** | No verified source (fail-closed) — decision/C4 handling; preview/RTL/ledger | Evidence + decisions bundle |
| 4 | 025 `tool-025-drug-interaction-pro` | medical-monitoring / `/smarttools/medical-monitoring/tool-025-drug-interaction-pro` | `b24fe5a7` | **Not recorded** | **PASS** (78/78) | Consolidated **17/50 PASS** | **IN PROGRESS** | **NOT CLOSED** | Assessment unavailable; preview/RTL/ledger/shared blockers | Evidence + decisions bundle |
| 4 | 026 `tool-026-injection-pain` | injection-formulation / `/smarttools/injection-formulation/tool-026-injection-pain` | `3c10a0c5` | **Not recorded** | **PASS** (70/70) | Consolidated **17/50 PASS** | **IN PROGRESS** | **NOT CLOSED** | Assessment unavailable; preview/RTL/ledger/shared blockers | Evidence + decisions bundle |
| 4 | 029 `tool-029-side-effect-early-warning` | medical-monitoring / `/smarttools/medical-monitoring/tool-029-side-effect-early-warning` | `dd804f85` | **Not recorded** | **PASS** (85/85) | Consolidated **17/50 PASS** | **IN PROGRESS** | **NOT CLOSED** | Descriptive only but clinical framing/C4/C5/review pending; preview/RTL/ledger | Evidence + decisions bundle |
| 4 | 037 `tool-037-side-effect-probability` | medical-monitoring / `/smarttools/medical-monitoring/tool-037-side-effect-probability` | `6e0416fe` | **Not recorded** | **PASS** (88/88) | Consolidated **17/50 PASS** | **IN PROGRESS** | **NOT CLOSED** | Heuristic model — clinical review/C4/C5 needed; preview/RTL/ledger | Evidence + decisions bundle |
| 4 | 038 `tool-038-stack-compatibility` | cycle-management / `/smarttools/cycle-management/tool-038-stack-compatibility` | `357adfe5` (`63a4f5cc` UI) | **Not recorded** | **PASS** (86/86) | Consolidated **17/50 PASS** | **IN PROGRESS** | **NOT CLOSED** | Heuristic model — clinical review/C4/C5 needed; preview/RTL/ledger | Evidence + decisions bundle |

> **Note on SHAs:** "latest tool-related commit" is taken from `git log -- "*tool-xxx*"` on branch `feat/r6.1-tools-041-042` at HEAD `b49b1627`. Some tools' most recent tool-path commit is a shared/chore commit in Batch 3 context (`8725fa3d`); functional implementation commits are recorded in prior reports/history (e.g. 016: `82798e4e`,`2b637ae8`; 022: `9bee0deb`; 027: `2d246bfd`; 031: `56380d66`,`770e50f`).

---

## 2) Known preview / deployment evidence (real, recorded)

| Batch | Preview URL | Deployment ID | Target | Notes |
|---|---|---|---|---|
| 1 | `https://mrxsteroid-preview-r6-batch1.vercel.app` | `dpl_8QsftgrnwGBS8PrKPP6APkoAT31d` | preview | Recorded in `BATCH-1-REPORT-2026-11-16.md`; tools 041/042 routes verified on Preview (SSR 200). |
| 2 | `https://mrxsteroid-preview-r6-batch2.vercel.app` | `dpl_9fp8FrqQeDVbTsUdmUZhgrDYJctg` | preview | Recorded in `BATCH-2-REPORT-2026-11-16.md`; built from clean export; 041/042/045 SSR checks noted. |
| 3 | — | — | — | **No recorded Preview Deployment ID/URL** in R6.1 docs found. |
| 4 | — | — | — | **Not executed** (per `BATCH-4-REPORT-2026-11-17.md`). |

**RTL 390px (real browser):** `NOT RUN` / not evidenced for Batch 1–4 tools in available reports (Batch 1/2: structural checks only; Batch 4: not executed). **EN/AR functional/state checks on deployed Preview:** only partially recorded (Batch 1/2 limited SSR/route checks); Batch 3/4 pending.

---

## 3) Engineering vs formal closure (how to read %)

- **Engineering completion (tool-level, where evidenced):** R6 pipeline path, 5 states, GENIUS-12/CORE-5 UI structure, i18n parity, focused tests/build/tsc/eslint as recorded — **strong for most Batch 2–4 tools with R6.1 artifacts**, partial/documentation-incomplete for several Batch 1 tools (006,015,023,035,043,044) in R6.1-doc terms.
- **Formal R6.1 closure %:** must follow `(Applicable Requirements with B=PASS and E>=E3) / Total Applicable × 100` per tool ledger with valid evidence levels and owner decisions where required. Only **Tool 041** has a computed ledger in folder: **76/132 = 57.58%** (owner review, not accepted). Others either lack ledgers or have no recorded computed %. **No tool in this scope is declared 100% VERIFIED.**

---

## 4) Short list — shared blockers awaiting decision (see companion file)

1. **D-C4:** specialist-approved sources/provenance (or owner-approved `N/A` justifications per tool).  
2. **D-C5:** specialist-approved referral/seek-care wording (AR/EN).  
3. **D-CLIN:** clinical/model review sign-off per applicable domain/tool.  
4. **D-W18:** history/storage/sync decision (and implementation scope if not "none").  
5. **D-P03:** approval for shared R6 pipeline result-schema enforcement change + regression plan.

---

## 5) Closure Sprint execution order (recommended, closest-to-closure first)

1. **Tools with existing ledgers/evidence depth:** 041 (raise evidenced ledger rows by engineering means), 040 (refresh evidence/ledger), 042 (create/align ledger & evidence).  
2. **Batch 2 & Batch 4 R6.1-documented tools with passing i18n/checks and recent focused verification:** 045–051, 008,014,017,025,026,029,037,038 — produce per-tool requirement/evidence registers, deploy clean Preview, capture Deployment ID/URLs and 390px RTL evidence.  
3. **Batch 3:** 016,022,027,031,034 — consolidate reports, preview/RTL, ledgers; resolve 016 C4 `N/A` decision path.  
4. **Batch 1 tools lacking R6.1 doc packs:** 006,015,023,035,043,044 — audit actual R6.1 compliance vs artifacts, add missing proposals/checks/evidence/ledgers, re-verify on Preview.

*All while keeping W18/C4/C5/clinical/P-03 items honest and non-inflated; no engine/schema/adapter rewrites unless a verified defect requires a scoped fix.*
