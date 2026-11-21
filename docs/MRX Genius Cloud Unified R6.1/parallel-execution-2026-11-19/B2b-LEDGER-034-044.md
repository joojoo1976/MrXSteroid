# B2b Row-Level Ledger Audit — Tools 034, 035, 037, 038, 043, 044

**Audit date:** 2026-11-19 · Live tree: E:\MrXSteroid-main @ HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`)

**Tree state (live, verified):** `git status --short` at audit time: 0 staged, 46 modified, 336 untracked (382 lines). Dispatch baseline noted: 0/46/478 (524 entries); the tree remains dirty — the audit is of the live tree.

**Constraints honored:** read-only static audit of the live tree; no git mutation; no builds/tests executed (`npx vitest run …`, `npx tsc --noEmit` — forbidden by audit constraint 3 — recorded as NOT_RUN); evidence = file paths + line numbers and file existence (grep-verified).

**Status vocabulary:** `PASS / PARTIAL / NOT_RUN / FAIL / BLOCKED / NOT_AVAILABLE` (ledger `NOT_IMPLEMENTED` → mapped to `FAIL`). `E2 = implementation/test file exists (static)`; `E3+ not claimable` (tests not executed).

## 0. Row-level citation-audit flag (035/043/044) — verification of the dispatch note

The "no row-level citation audit" flag is tracked in `docs/MRX Genius Cloud Unified R6.1/R6.1-ATOMIC-LEDGER-RECONCILIATION.md` §3 ("Not fully re-audited in this pass (row-level): … 035,043,044 …").

Verified in-tree:

- Row-level artifacts now exist for all three tools — `tool-035-closure-ledger.{md,csv}`, `tool-043-closure-ledger.{md,csv}`, `tool-044-closure-ledger.{md,csv}` (18 rows each; columns: `req_id, requirement, applicability, A, B, C, E, files, test_result, verified_date, head, evidence_uri, gap_next_action, closure_evidence`; all rows `applicability = APPLICABLE`, `head = 8d7e406c`; `closure_evidence` column empty in all three CSVs).
- Contracts/genius/pipeline/tests present in the live tree for 035/043/044 (contracts + pipeline tests untracked: e.g. `lib/tools/r6/tool-035-hormone-conversion-contract.ts`, `lib/tools/r6/tool-043-prolactin-management-contract.ts`, `lib/tools/r6/tool-044-dht-side-effects-contract.ts`); CSV clipboard exports present: `tool-035-hormone-conversion.genius.tsx:224-239`; `tool-043-prolactin-management.genius.tsx:63-82`; `tool-044-dht-side-effects.genius.tsx:65-82`.
- The master register itself (`R6.1-ATOMIC-LEDGER-RECONCILIATION.md` §3) was NOT updated — read-only audit. The per-tool statics verified here are the row-level closure evidence for this pass; the gap is noted as closed in substance, open in governance.

## 0.1 Confirmation — "037/038 reportedly have tracked pipeline tests — confirm"

Confirmed: tracked pipeline tests exist for both — `lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts` and `lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts` (git ls-files, tracked).

## 0.2 E-levels not claimed

E3/E4/E5 not claimable for any row here: tests and browser/preview checks not executed (forbidden). Ledger PASS@E3 → audit PASS@E2 where static files exist (max auditable level). Ledger `NOT_IMPLEMENTED` (P03-PIPELINE) mapped to FAIL@E1.

## 1. Summary

| Tool | Verified % (PASS E3+/applicable) | PASS(E3+) | PASS<3 | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE | Ledger historical completion |
|---|---|---|---|---|---|---|---|---|---|
| 034 | 0% (0/18) | 0 | 5 | 2 | 6 | 1 | 1 | 3 | 1/18 = 5.56% |
| 035 | 0% (0/18) | 0 | 1 | 5 | 7 | 1 | 1 | 3 | 0/18 = 0% |
| 037 | 0% (0/18) | 0 | 6 | 1 | 6 | 1 | 1 | 3 | 3/18 = 16.67% |
| 038 | 0% (0/18) | 0 | 6 | 1 | 6 | 1 | 1 | 3 | 3/18 = 16.67% |
| 043 | 0% (0/18) | 0 | 1 | 5 | 7 | 1 | 1 | 3 | 0/18 = 0% |
| 044 | 0% (0/18) | 0 | 1 | 5 | 7 | 1 | 1 | 3 | 0/18 = 0% |

All six: 18 rows audited, all applicable, 0 N/A, 0 PASS at E3+ (verified % = 0%).

## 2. Tool 034 — tool-034-compound-clearance (Batch 3, cycle-management)

### (a) Source ledger + SHA
- Ledger: `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-034-closure-ledger.md`
- Git blob SHA (`git hash-object`): `dd723d2da7d6d51c0951fa5c2826ce7599133b93`
- SHA-256: `3DCDEE927E64424ACC8835F0C2E45D8F9AF45CE02C6BFCB98EC1325FD2355B09`
- CSV sibling: `tool-034-closure-ledger.csv`
- Tool source SHA (ledger header + `generate-ledgers.mjs`): `19e9301c8c3f7fda2654a99a561136e2ee960f42` (verified commit: `git cat-file -t` = commit)

### (b) Counts
| Total | Applicable | N/A + just | PASS(E3+) | PASS below E3 | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE |
|---|---|---|---|---|---|---|---|---|---|
| 18 | 18 | 0 | 0 | 5 | 2 | 6 | 1 | 1 | 3 |

### (c) Verified %
0% — PASS(E3+)/Applicable = 0/18.

### (d) Row-level ledger table
| Row | Applicable | Evidence | Status | E |
|---|---|---|---|---|
| ENG-PIPELINE | YES | `lib/tools/r6/tool-034-compound-clearance-pipeline.ts` (tracked); wired: `components/tools/tool-034-compound-clearance.tsx:5`, `tool-034-compound-clearance.genius.tsx:6` | PASS | E2 |
| STATE-5 | YES | `components/tools/tool-034-compound-clearance.tsx:273` (`data-r6-genius-state={state}`); `tool-034-compound-clearance.genius.tsx:273` (`data-r6-genius="tool-034"`) | PASS | E2 |
| UI-GENIUS12 | YES | `tool-034-compound-clearance.genius.tsx:273` (`data-r6-genius="tool-034"`); export box `:211` | PASS | E2 |
| I18N-PARITY | YES | `i18n/tool-034-compound-clearance.json`; `docs/MRX Genius Cloud Unified R6.1/tool-034-i18n-check.mjs`; `tests/unit/tool-034-i18n-evidence.test.ts` — ledger E3; static PASS (not executed) | PASS | E2 |
| EXPORT-CSV | YES | `tool-034-compound-clearance.genius.tsx:221` (`link.download = 'tool-034-compound-clearance.csv'`) | PASS | E2 |
| TEST-FOCUSED | YES | Tracked: `lib/tools/engines/tool-034-compound-clearance.test.ts`, `components/tools/tool-034-compound-clearance.dom.test.tsx`, `components/tools/tool-034-compound-clearance.test.tsx`, `lib/tools/adapters/tool-031-035-batch.test.ts`; untracked: `lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts` — not executed | PARTIAL | E2 |
| BUILD-TSC | YES | tsc/next build NOT_RUN at live HEAD 37f047a (`npx tsc --noEmit` forbidden by audit constraint 3); prior build artifacts in repo root (tsc_*.txt) | PARTIAL | E2 |
| PREVIEW-ROUTE | YES | `app/smarttools/tool-034-compound-clearance/page.tsx`; ledger claim: "SSO-protected" | NOT_RUN | E0 |
| BROWSER-EN-AR | YES | EN+AR JSON exists (`i18n/tool-034-compound-clearance.json`) — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| BROWSER-5-STATES | YES | `components/tools/tool-034-compound-clearance.tsx:273` — browser NOT_RUN | NOT_RUN | E0 |
| RTL-390 | YES | `i18n/tool-034-compound-clearance.json` (AR) — browser NOT_RUN | NOT_RUN | E0 |
| CONSOLE-HYDRATION | YES | Next.js App Router page — console NOT_RUN | NOT_RUN | E0 |
| NO-DUP-GENIUS | YES | Genius component present (`tool-034-compound-clearance.genius.tsx`) — Preview DOM NOT_RUN | NOT_RUN | E0 |
| C4-SOURCES | YES | D-C4 open — no approved source pack | NOT_AVAILABLE | E1 |
| C5-REFERRAL | YES | D-C5 open — no approved referral wording | NOT_AVAILABLE | E1 |
| CLINICAL-REVIEW | YES | D-CLIN open — no sign-off recorded | BLOCKED | E1 |
| W18-HISTORY | YES | D-W18 open — Box 11 NOT_AVAILABLE; no storage | NOT_AVAILABLE | E1 |
| P03-PIPELINE | YES | `lib/tools/r6/tool-034-compound-clearance-pipeline.ts` exists; shared P-03 layer not implemented (D-P03) | FAIL | E1 |

### (e) Unsupported historical claims
1. Ledger "Category/Route: cycle-management / /smarttools/cycle-management/tool-034-compound-clearance" — current evidence: pharmacokinetics. `lib/tools/categories.ts:114` (`'tool-034-compound-clearance': 'pharmacokinetics'`); `lib/tools/smartToolsCatalog6.ts:7` (href `/smarttools/pharmacokinetics/tool-034-compound-clearance`); `lib/tools/registry.ts:75`.
2. Ledger "Snapshot HEAD: 8d7e406c" — live tree at audit time is 37f047a; ledger is the 2026-11-17 deployment snapshot.

### (f) Blockers
PREVIEW-ROUTE, BROWSER-EN-AR, BROWSER-5-STATES, RTL-390, CONSOLE-HYDRATION, NO-DUP-GENIUS (NOT_RUN/E0 — SSO); C4-SOURCES, C5-REFERRAL, CLINICAL-REVIEW, W18-HISTORY (NOT_AVAILABLE/BLOCKED — D-gaps); P03-PIPELINE (FAIL — D-P03); BUILD-TSC (archive clean output for 8d7e406c); TEST-FOCUSED (not consolidated this pass); ENG-PIPELINE (re-run focused evidence on current HEAD).

## 3. Tool 035 — tool-035-hormone-conversion (Batch 1; ledger claims hormonal-health, current code: pharmacokinetics)

### (a) Source ledger + SHA
- Ledger: `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-035-closure-ledger.md`
- Git blob SHA: `81d545bb11c69cfb62aa712c5fec72beabe79826`
- SHA-256: `60279DEC77B77E80F3911AD7F97FDEEE72DCB0075CE0C66ADD1104A0EC23DC38`
- CSV sibling: `tool-035-closure-ledger.csv`
- Tool source SHA: `108d3063bdcbca9604ad9b7b48844b85763d51a0` (verified commit)
- Ledger header: Snapshot HEAD 8d7e406c; "Artifacts: component/genius/contract/pipeline/tests exist; no R6.1 proposals/i18n-check/closure ledger" (superseded — closure ledger now exists).

### (b) Counts
| Total | Applicable | N/A + just | PASS(E3+) | PASS below E3 | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE |
|---|---|---|---|---|---|---|---|---|---|
| 18 | 18 | 0 | 0 | 1 | 5 | 7 | 1 | 1 | 3 |

### (c) Verified %
0% — 0/18.

### (d) Row-level ledger table
| Row | Applicable | Evidence | Status | E |
|---|---|---|---|---|
| ENG-PIPELINE | YES | `lib/tools/r6/tool-035-hormone-conversion-pipeline.ts` (tracked); `runHormoneConversion` NOT wired into any component (grep: only pipeline + `pipeline.test.ts` + `p03-runtime-negative-coverage.test.ts`) | PARTIAL | E1 |
| STATE-5 | YES | Hormonal tool-035: no `data-r6-genius`/`data-r6-genius-state` in `tool-035` components (grep over `components/tools`); hormonal genius pattern = `BoxSource` `'engine' \| 'static' \| 'not_available' \| 'not_applicable'` (`components/tools/tool-035-hormone-conversion.genius.tsx:15`) | PARTIAL | E1 |
| UI-GENIUS12 | YES | `components/tools/tool-035-hormone-conversion.genius.tsx` (untracked) — 12 boxes: KPI Strip, Primary Result & Interpretation, How Calculated & Molar Masses, Inputs Summary, What-If Scenarios, Sensitivity Analysis, Warnings & Unit Mismatches, Cross-Tool Links, Sources & Evidence, Client-Side Export, History (NOT_APPLICABLE), Next Actions & Referral; no state attribute | PARTIAL | E1 |
| I18N-PARITY | YES | No R6.1 i18n-check script for 035 (root + `docs/MRX Genius Cloud Unified R6.1/` listings — none); `i18n/tool-035-hormone-conversion.json` tracked | NOT_RUN | E0 |
| EXPORT-CSV | YES | `components/tools/tool-035-hormone-conversion.genius.tsx:224-239` (box 10 "Client-Side Export (CSV)", button "Copy Data as CSV") + `:55`, `:63-81` (`csvContent`, `handleCopyCsv` → `navigator.clipboard.writeText`) — browser-only | PASS | E2 |
| TEST-FOCUSED | YES | Tracked: `lib/tools/engines/tool-035-hormone-conversion.test.ts`, `components/tools/tool-035-hormone-conversion.test.tsx`, `lib/tools/adapters/tool-031-035-batch.test.ts`; untracked: `components/tools/tool-035-hormone-conversion.parity.test.tsx`, `lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts` — not executed | PARTIAL | E2 |
| BUILD-TSC | YES | tsc/next build NOT_RUN (constraint 3) | PARTIAL | E2 |
| PREVIEW-ROUTE | YES | `app/smarttools/tool-035-hormone-conversion/page.tsx` — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| BROWSER-EN-AR | YES | EN+AR JSON exists (`i18n/tool-035-hormone-conversion.json`) — browser NOT_RUN | NOT_RUN | E0 |
| BROWSER-5-STATES | YES | Hormonal tool — browser NOT_RUN | NOT_RUN | E0 |
| RTL-390 | YES | AR JSON — browser NOT_RUN | NOT_RUN | E0 |
| CONSOLE-HYDRATION | YES | App Router — console NOT_RUN | NOT_RUN | E0 |
| NO-DUP-GENIUS | YES | Genius component present — DOM inspection NOT_RUN | NOT_RUN | E0 |
| C4-SOURCES | YES | D-C4 open | NOT_AVAILABLE | E1 |
| C5-REFERRAL | YES | D-C5 open | NOT_AVAILABLE | E1 |
| CLINICAL-REVIEW | YES | D-CLIN open | BLOCKED | E1 |
| W18-HISTORY | YES | D-W18 open — Box 11 | NOT_AVAILABLE | E1 |
| P03-PIPELINE | YES | `lib/tools/r6/tool-035-hormone-conversion-pipeline.ts` (tracked, unwired); shared P-03 layer not implemented | FAIL | E1 |

### (e) Unsupported historical claims
1. Ledger Category/Route "hormonal-health / /smarttools/hormonal-health/tool-035-hormone-conversion" — current evidence: pharmacokinetics. `lib/tools/categories.ts:115`; `lib/tools/smartToolsCatalog6.ts:8` (href `/smarttools/pharmacokinetics/tool-035-hormone-conversion`); `lib/tools/registry.ts:81`.
2. Ledger artifacts claim "no R6.1 proposals/i18n-check/closure ledger" — superseded: `tool-035-closure-ledger.md/.csv` exist (2026-11-19 audit).
3. Ledger direct URL "/smarttools/hormonal-health/tool-035-hormone-conversion" — current canonical: `/smarttools/pharmacokinetics/tool-035-hormone-conversion`.
4. Snapshot HEAD 8d7e406c ≠ live 37f047a.

### (f) Blockers
ENG-PIPELINE (pipeline unwired from components), STATE-5 (no R6.1 state attribute), UI-GENIUS12 (no state attribute; box order not row-audited), I18N-PARITY (no R6.1 i18n-check script), TEST-FOCUSED, browser rows (NOT_RUN), D-C4, D-C5, D-CLIN, D-W18, D-P03.

## 4. Tool 037 — tool-037-side-effect-probability (Batch 4, medical-monitoring)

### (a) Source ledger + SHA
- Ledger: `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-037-closure-ledger.md`
- Git blob SHA: `41f1a819d47b5f934f098a7bff44938029afa800`
- SHA-256: `F95D007A220AFC23C2AA669090937449AF724355A4DBE14FDD048C129E952981`
- CSV sibling: `tool-037-closure-ledger.csv`
- Tool source SHA: `6e0416feac91582b68a0d4209c152c497c67aa14` (verified commit)
- Ledger header: Snapshot HEAD 8d7e406c.

### (b) Counts
| Total | Applicable | N/A + just | PASS(E3+) | PASS below E3 | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE |
|---|---|---|---|---|---|---|---|---|---|
| 18 | 18 | 0 | 0 | 6 | 1 | 6 | 1 | 1 | 3 |

### (c) Verified %
0% — 0/18.

### (d) Row-level ledger table
| Row | Applicable | Evidence | Status | E |
|---|---|---|---|---|
| ENG-PIPELINE | YES | `lib/tools/r6/tool-037-side-effect-probability-pipeline.ts` (tracked); wired: `components/tools/tool-037-side-effect-probability.tsx:5` | PASS | E2 |
| STATE-5 | YES | `components/tools/tool-037-side-effect-probability.genius.tsx:54` (`data-r6-genius-state={state}`) | PASS | E2 |
| UI-GENIUS12 | YES | `tool-037-side-effect-probability.genius.tsx:54` (`data-r6-genius="tool-037"`) | PASS | E2 |
| I18N-PARITY | YES | `i18n/tool-037-side-effect-probability.json`; `docs/MRX Genius Cloud Unified R6.1/tool-037-i18n-check.mjs`; `tests/unit/tool-037-i18n-evidence.test.ts` — ledger E3; static PASS (not executed) | PASS | E2 |
| EXPORT-CSV | YES | `tool-037-side-effect-probability.genius.tsx:48` (`data-r6-core="export"`, `link.download='tool-037-side-effect-probability.csv'`) | PASS | E2 |
| TEST-FOCUSED | YES | Tracked: `lib/tools/engines/tool-037-side-effect-probability.test.ts`, `lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts`, `tests/unit/tool-037-i18n-evidence.test.ts` — ledger E3; static PASS (not executed) | PASS | E2 |
| BUILD-TSC | YES | tsc/next build NOT_RUN (constraint 3) | PARTIAL | E2 |
| PREVIEW-ROUTE | YES | `app/smarttools/tool-037-side-effect-probability/page.tsx` — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| BROWSER-EN-AR | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| BROWSER-5-STATES | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| RTL-390 | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| CONSOLE-HYDRATION | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| NO-DUP-GENIUS | YES | Genius component present (`tool-037-side-effect-probability.genius.tsx`) — Preview DOM NOT_RUN | NOT_RUN | E0 |
| C4-SOURCES | YES | D-C4 open | NOT_AVAILABLE | E1 |
| C5-REFERRAL | YES | D-C5 open | NOT_AVAILABLE | E1 |
| CLINICAL-REVIEW | YES | D-CLIN open | BLOCKED | E1 |
| W18-HISTORY | YES | D-W18 open — Box 11 | NOT_AVAILABLE | E1 |
| P03-PIPELINE | YES | `lib/tools/r6/tool-037-side-effect-probability-pipeline.ts`; shared P-03 layer not implemented | FAIL | E1 |

### (e) Unsupported historical claims
1. Snapshot HEAD 8d7e406c ≠ live 37f047a.
2. Consistent: ledger Category/Route "medical-monitoring / /smarttools/medical-monitoring/tool-037-side-effect-probability" — current: `lib/tools/categories.ts:117`; `lib/tools/smartToolsCatalog6.ts:10`; `lib/tools/registry.ts:77`. Source SHA 6e0416fe verified commit.

### (f) Blockers
PREVIEW-ROUTE, BROWSER-EN-AR, BROWSER-5-STATES, RTL-390, CONSOLE-HYDRATION, NO-DUP-GENIUS (NOT_RUN/E0 — SSO); C4-SOURCES, C5-REFERRAL, W18-HISTORY (NOT_AVAILABLE — D-gaps); CLINICAL-REVIEW (BLOCKED); P03-PIPELINE (FAIL — D-P03); BUILD-TSC (not archived).

## 5. Tool 038 — tool-038-stack-compatibility (Batch 4, cycle-management)

### (a) Source ledger + SHA
- Ledger: `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-038-closure-ledger.md`
- Git blob SHA: `5b7de317999fa226e334c40efb9dd677a00d8417`
- SHA-256: `AA2CB3AE501A303BEE9A88C34C74C60F65F029F13ECF08A19060609D89F8E51B`
- CSV sibling: `tool-038-closure-ledger.csv`
- Tool source SHAs: `63a4f5cc43771f6d18eb2baaee449a0ced6d6b37` and `357adfe5a5f98a7629e23015be88f7f72c2603db` (both verified commits)
- Ledger header: Snapshot HEAD 8d7e406c.

### (b) Counts
| Total | Applicable | N/A + just | PASS(E3+) | PASS below E3 | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE |
|---|---|---|---|---|---|---|---|---|---|
| 18 | 18 | 0 | 0 | 6 | 1 | 6 | 1 | 1 | 3 |

### (c) Verified %
0% — 0/18.

### (d) Row-level ledger table
| Row | Applicable | Evidence | Status | E |
|---|---|---|---|---|
| ENG-PIPELINE | YES | `lib/tools/r6/tool-038-stack-compatibility-pipeline.ts` (tracked); wired: `components/tools/tool-038-stack-compatibility.tsx:5` | PASS | E2 |
| STATE-5 | YES | `components/tools/tool-038-stack-compatibility.genius.tsx:54` (`data-r6-genius-state={state}`) | PASS | E2 |
| UI-GENIUS12 | YES | `tool-038-stack-compatibility.genius.tsx:54` (`data-r6-genius="tool-038"`) | PASS | E2 |
| I18N-PARITY | YES | `i18n/tool-038-stack-compatibility.json`; `docs/MRX Genius Cloud Unified R6.1/tool-038-i18n-check.mjs`; `tests/unit/tool-038-i18n-evidence.test.ts` — ledger E3; static PASS (not executed) | PASS | E2 |
| EXPORT-CSV | YES | `tool-038-stack-compatibility.genius.tsx:48` (`data-r6-core="export"`, `link.download='tool-038-stack-compatibility.csv'`) | PASS | E2 |
| TEST-FOCUSED | YES | Tracked: `lib/tools/engines/tool-038-stack-compatibility.test.ts`, `lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts`, `lib/tools/adapters/tool-036-040-batch.test.ts`, `tests/unit/tool-038-i18n-evidence.test.ts` — ledger E3; static PASS (not executed) | PASS | E2 |
| BUILD-TSC | YES | tsc/next build NOT_RUN (constraint 3) | PARTIAL | E2 |
| PREVIEW-ROUTE | YES | `app/smarttools/tool-038-stack-compatibility/page.tsx` — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| BROWSER-EN-AR | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| BROWSER-5-STATES | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| RTL-390 | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| CONSOLE-HYDRATION | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| NO-DUP-GENIUS | YES | Genius component present (`tool-038-stack-compatibility.genius.tsx`) — Preview DOM NOT_RUN | NOT_RUN | E0 |
| C4-SOURCES | YES | D-C4 open | NOT_AVAILABLE | E1 |
| C5-REFERRAL | YES | D-C5 open | NOT_AVAILABLE | E1 |
| CLINICAL-REVIEW | YES | D-CLIN open | BLOCKED | E1 |
| W18-HISTORY | YES | D-W18 open — Box 11 | NOT_AVAILABLE | E1 |
| P03-PIPELINE | YES | `lib/tools/r6/tool-038-stack-compatibility-pipeline.ts`; shared P-03 layer not implemented | FAIL | E1 |

### (e) Unsupported historical claims
1. Snapshot HEAD 8d7e406c ≠ live 37f047a; both tool source SHAs (63a4f5cc…, 357adfe5…) verified commits.
2. Consistent: ledger Category/Route "cycle-management / /smarttools/cycle-management/tool-038-stack-compatibility" — current: `lib/tools/categories.ts:118`; `lib/tools/smartToolsCatalog6.ts:11`; `lib/legacy-routes.ts:96`.

### (f) Blockers
PREVIEW-ROUTE, BROWSER-EN-AR, BROWSER-5-STATES, RTL-390, CONSOLE-HYDRATION, NO-DUP-GENIUS (NOT_RUN/E0); C4-SOURCES, C5-REFERRAL, W18-HISTORY (NOT_AVAILABLE); CLINICAL-REVIEW (BLOCKED); P03-PIPELINE (FAIL); BUILD-TSC (not archived).

## 6. Tool 043 — tool-043-prolactin-management (Batch 1, hormonal-health)

### (a) Source ledger + SHA
- Ledger: `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-043-closure-ledger.md`
- Git blob SHA: `cec2aa0b9835d772cc1b382e713c57bb4e4da993`
- SHA-256: `DF54B61BC11A42543D074651483B61A27F5C018B033E3AA8CE6E5399DA8D6722`
- CSV sibling: `tool-043-closure-ledger.csv`
- Tool source SHA: `5a87f3e5271db497a63833bb3cd1bb3df2078497` (verified commit)
- Ledger header: Snapshot HEAD 8d7e406c.

### (b) Counts
| Total | Applicable | N/A + just | PASS(E3+) | PASS below E3 | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE |
|---|---|---|---|---|---|---|---|---|---|
| 18 | 18 | 0 | 0 | 1 | 5 | 7 | 1 | 1 | 3 |

### (c) Verified %
0% — 0/18.

### (d) Row-level ledger table
| Row | Applicable | Evidence | Status | E |
|---|---|---|---|---|
| ENG-PIPELINE | YES | `lib/tools/r6/tool-043-prolactin-management-pipeline.ts` (tracked); unwired — `runProlactinManagement` referenced only by pipeline + `pipeline.test.ts` + `p03-runtime-negative-coverage.test.ts` | PARTIAL | E1 |
| STATE-5 | YES | Hormonal tool-043: no `data-r6-genius-state` (grep over `components/tools`); hormonal genius pattern without R6.1 state attribute | PARTIAL | E1 |
| UI-GENIUS12 | YES | `components/tools/tool-043-prolactin-management.genius.tsx` (untracked) — "Tool-Owned GENIUS-12 Boxes (CORE-5)"; no state attribute | PARTIAL | E1 |
| I18N-PARITY | YES | No 043 i18n-check script (root + `docs/MRX Genius Cloud Unified R6.1/` listings — none); `i18n/tool-043-prolactin-management.json` tracked | NOT_RUN | E0 |
| EXPORT-CSV | YES | `tool-043-prolactin-management.genius.tsx:63-82` (`csvContent`; `navigator.clipboard.writeText` at :77) — browser-only | PASS | E2 |
| TEST-FOCUSED | YES | Tracked: `lib/tools/engines/tool-043-prolactin-management.test.ts`, `components/tools/tool-043-prolactin-management.test.tsx`, `lib/tools/r6/tool-043-prolactin-management-pipeline.test.ts`, `lib/tools/adapters/tool-041-045-batch.test.ts`, `components/tools/tool-041-060-header-preferences.test.tsx`; untracked: `tool-043-prolactin-management.genius.tsx`, `.ocr.tsx`, `.pdf.tsx`, `.visual.tsx`, `lib/tools/r6/tool-043-prolactin-management-contract.ts` — not executed | PARTIAL | E2 |
| BUILD-TSC | YES | tsc/next build NOT_RUN (constraint 3) | PARTIAL | E2 |
| PREVIEW-ROUTE | YES | `app/smarttools/tool-043-prolactin-management/page.tsx` — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| BROWSER-EN-AR | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| BROWSER-5-STATES | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| RTL-390 | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| CONSOLE-HYDRATION | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| NO-DUP-GENIUS | YES | Genius component present — Preview DOM NOT_RUN | NOT_RUN | E0 |
| C4-SOURCES | YES | D-C4 open | NOT_AVAILABLE | E1 |
| C5-REFERRAL | YES | D-C5 open | NOT_AVAILABLE | E1 |
| CLINICAL-REVIEW | YES | D-CLIN open | BLOCKED | E1 |
| W18-HISTORY | YES | D-W18 open — Box 11 | NOT_AVAILABLE | E1 |
| P03-PIPELINE | YES | `lib/tools/r6/tool-043-prolactin-management-pipeline.ts`; shared P-03 layer not implemented | FAIL | E1 |

### (e) Unsupported historical claims
1. Snapshot HEAD 8d7e406c ≠ live 37f047a.
2. Consistent: ledger Category/Route "hormonal-health / /smarttools/hormonal-health/tool-043-prolactin-management" — current: `lib/tools/categories.ts:124`; `lib/tools/smartToolsCatalog6.ts:16`; `lib/legacy-routes.ts:102`.

### (f) Blockers
ENG-PIPELINE (unwired pipeline), STATE-5 (no R6.1 state attribute), UI-GENIUS12 (no state attribute; box order not row-audited), I18N-PARITY (no script), TEST-FOCUSED, browser rows (NOT_RUN), D-C4, D-C5, D-CLIN, D-W18, D-P03.

## 7. Tool 044 — tool-044-dht-side-effects (Batch 1; ledger claims hormonal-health, current code: medical-monitoring)

### (a) Source ledger + SHA
- Ledger: `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-044-closure-ledger.md`
- Git blob SHA: `dc71cf7ffde554ce91176f75e3d0bea57997169b`
- SHA-256: `9CC4F81D9F30635CAE231ABCF5624D4B59603E821E9478DC72E087BFD0F1CCEE`
- CSV sibling: `tool-044-closure-ledger.csv`
- Tool source SHA: `5a87f3e5271db497a63833bb3cd1bb3df2078497` (verified commit)
- Ledger header: Snapshot HEAD 8d7e406c.

### (b) Counts
| Total | Applicable | N/A + just | PASS(E3+) | PASS below E3 | PARTIAL | NOT_RUN | FAIL | BLOCKED | NOT_AVAILABLE |
|---|---|---|---|---|---|---|---|---|---|
| 18 | 18 | 0 | 0 | 1 | 5 | 7 | 1 | 1 | 3 |

### (c) Verified %
0% — 0/18.

### (d) Row-level ledger table
| Row | Applicable | Evidence | Status | E |
|---|---|---|---|---|
| ENG-PIPELINE | YES | `lib/tools/r6/tool-044-dht-side-effects-pipeline.ts` (tracked); unwired — `runDhtSideEffects` referenced only by pipeline + `pipeline.test.ts` + `p03-runtime-negative-coverage.test.ts` | PARTIAL | E1 |
| STATE-5 | YES | Hormonal tool-044: no `data-r6-genius-state` (grep over `components/tools`); hormonal genius pattern without R6.1 state attribute | PARTIAL | E1 |
| UI-GENIUS12 | YES | `components/tools/tool-044-dht-side-effects.genius.tsx` (untracked) — "Tool-Owned GENIUS-12 Boxes (CORE-5)"; no state attribute | PARTIAL | E1 |
| I18N-PARITY | YES | No 044 i18n-check script; `i18n/tool-044-dht-side-effects.json` tracked | NOT_RUN | E0 |
| EXPORT-CSV | YES | `tool-044-dht-side-effects.genius.tsx:65-82` (`csvContent`; clipboard write) — browser-only | PASS | E2 |
| TEST-FOCUSED | YES | Tracked: `lib/tools/engines/tool-044-dht-side-effects.test.ts`, `components/tools/tool-044-dht-side-effects.test.tsx`, `lib/tools/r6/tool-044-dht-side-effects-pipeline.test.ts`, `lib/tools/adapters/tool-041-045-batch.test.ts`, `components/tools/tool-041-060-header-preferences.test.tsx`; untracked: `tool-044-dht-side-effects.genius.tsx`, `.ocr.tsx`, `.pdf.tsx`, `.visual.tsx`, `lib/tools/r6/tool-044-dht-side-effects-contract.ts` — not executed | PARTIAL | E2 |
| BUILD-TSC | YES | tsc/next build NOT_RUN (constraint 3) | PARTIAL | E2 |
| PREVIEW-ROUTE | YES | `app/smarttools/tool-044-dht-side-effects/page.tsx` — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| BROWSER-EN-AR | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| BROWSER-5-STATES | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| RTL-390 | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| CONSOLE-HYDRATION | YES | — browser NOT_RUN (SSO) | NOT_RUN | E0 |
| NO-DUP-GENIUS | YES | Genius component present — Preview DOM NOT_RUN | NOT_RUN | E0 |
| C4-SOURCES | YES | D-C4 open | NOT_AVAILABLE | E1 |
| C5-REFERRAL | YES | D-C5 open | NOT_AVAILABLE | E1 |
| CLINICAL-REVIEW | YES | D-CLIN open | BLOCKED | E1 |
| W18-HISTORY | YES | D-W18 open — Box 11 | NOT_AVAILABLE | E1 |
| P03-PIPELINE | YES | `lib/tools/r6/tool-044-dht-side-effects-pipeline.ts`; shared P-03 layer not implemented | FAIL | E1 |

### (e) Unsupported historical claims
1. Ledger Category/Route "hormonal-health / /smarttools/hormonal-health/tool-044-dht-side-effects" — current: **medical-monitoring**. `lib/tools/categories.ts:125`; `lib/tools/smartToolsCatalog6.ts:17` (href `/smarttools/medical-monitoring/tool-044-dht-side-effects`); `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/check-routes-e1-canonical.mjs:12` ({id:'044', cat:'medical-monitoring'}); `browser-evidence/r6-batch1-4.mjs:63` (['044', 'medical-monitoring', …]).
2. Ledger direct URL "/smarttools/hormonal-health/tool-044-dht-side-effects" — current canonical: `/smarttools/medical-monitoring/tool-044-dht-side-effects`.
3. Snapshot HEAD 8d7e406c ≠ live 37f047a.

### (f) Blockers
ENG-PIPELINE (unwired pipeline), STATE-5 (no R6.1 state attribute), UI-GENIUS12 (no state attribute; box order not row-audited), I18N-PARITY (no script), TEST-FOCUSED, browser rows (NOT_RUN), D-C4, D-C5, D-CLIN, D-W18, D-P03.

## 8. Unresolved — owner + next action

| Tool | Open gap (owner) | Next action |
|---|---|---|
| all | D-C4 — approved source pack per tool/domain | Provide approved source pack or owner-approved N/A per tool/domain |
| all | D-C5 — approved referral wording packs | Provide approved wording pack |
| all | D-CLIN — clinical/model review sign-off | Obtain clinical/model review sign-off |
| all | D-W18 — W18 storage/history decision (Box 11) | Owner decision on W18 |
| all | D-P03 — shared P-03 pipeline change | Approve and implement shared P-03 change with regression |
| 034 | BUILD-TSC | Archive clean tsc/build output for HEAD 8d7e406c (live: 37f047a) |
| 034 | TEST-FOCUSED | Re-run focused battery on current HEAD; archive log |
| 034 | ENG-PIPELINE | Re-run focused pipeline evidence for this tool on current HEAD |
| 034, 035, 037, 038, 043, 044 | Browser rows (PREVIEW-ROUTE, BROWSER-EN-AR, BROWSER-5-STATES, RTL-390, CONSOLE-HYDRATION, NO-DUP-GENIUS) | Provide unauthenticated/bypass access for Vercel Preview (or disable SSO); execute the listed checks |
| 035 | ENG-PIPELINE | Wire R6 pipeline (`runHormoneConversion`) into `components/tools/tool-035-hormone-conversion.tsx` |
| 035 | STATE-5, UI-GENIUS12 | Add R6.1 state attributes (`data-r6-genius-state`) and box-order verification to hormonal tools |
| 035 | I18N-PARITY | Create R6.1 i18n-check script for 035; run |
| 035, 043, 044 | TEST-FOCUSED | Run focused battery; archive log |
| 037, 038 | (minor) I18N-PARITY, TEST-FOCUSED | Re-run from current HEAD to lift E2→E3 evidence |

## 9. SHA-256 of output

SHA-256 of this output file: TBD.
