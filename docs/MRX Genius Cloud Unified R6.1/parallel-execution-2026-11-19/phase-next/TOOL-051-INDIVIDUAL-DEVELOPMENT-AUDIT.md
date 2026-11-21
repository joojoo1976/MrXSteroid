# TOOL 051 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `051` · `mrx.tool.051-peptide-dosage-calculator` |
| Canonical name / slug | `Peptide Dosage Calculator` / `tool-051-peptide-dosage-calculator` |
| Category | injection-formulation |
| Canonical route | `/smarttools/injection-formulation/tool-051-peptide-dosage-calculator` |
| Batch | Batch 2 |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`; 384 dirty worktree entries observed and preserved) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation; no code/contract/schema/ledger/git/build/test/server/browser/calculator writes or executions. |
| Source-ledger refs (observed SHA-256) | atomic CSV `32F67EC1B0B7306948DE2959A521C25EC7E52D13CAFA3BD24056F6331852BFDB`; atomic MD `7E184BF5BD81C199C3517D27E6814348F805D090D9F2C46CF08130D236198A8C`; summary `9DCC39CD319B3C7D9CF9C7D035849D6A00DAE9F3742659AE6FB93255D4C1DB0F`; closure MD `B5ED32EDA78F4BEE8BDBA0DC50766C0E804B448E25D9975402B2B726A146E84E`; closure CSV `4AD8159A2F2BA724BC6980CCFD9F75F1DD127DCCEC354C71A5B6636DEE73BFE1` |
| Reference refs (observed SHA-256) | standard `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9`; W2 `3276ACD111A66506568975ADA721F51FC520F7B28AF6C7CB9AB09916CAC96A6A`; W4b `157FB3DD879BAE4AF66E4B3AA1404788A3AC469FF8AF1B7ED60C6E3D1282C263`; B3 `CF3CBE8677F2C5513CE7A3ACEE7E9B5A315A97E6A5CB255FC6DD430CB98E62DF`; 039 profile `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` |
| Tool decision | **CONTINUE / REPAIR (FAIL + static-to-E3 + P-03 + gates)** — canonical atomic completion `11/31 = 35.48%`; historical PASS 19 preserved but 8 are E2-static; no owner acceptance implied |

## A. Tool Identity and Historical Lineage

- Registry `mrx.tool.051-peptide-dosage-calculator` / `tool-051-peptide-dosage-calculator`, category `injection-formulation`, route `/smarttools/injection-formulation/tool-051-peptide-dosage-calculator`; flat route redirects. Registry `titleAr` is already plural (`حاسبة جرعة الببتيدات`); the separate i18n WT fix is noted in Section M/L.
- 051 is in `R6_EXEMPT_SLUGS` (`manifest.ts` SHA `4AF80EA997096017…`); W4b classifies it as tool-owned boxes. No shared-shell edit proposed.
- Engine `computePeptideDose` first shipped in commit `0aa2b406ed4970eb5abbf1e3f30f1db0982cd3f7` (2026-10-11). Atomic ledger generated 2026-11-18 from clean export `2a647fda`+`37f047a4`; closure ledger records historic `8d7e406c`, SSO-protected deployment `dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL`, and 122/122 i18n (historic only).
- Original requirements: 31-row atomic ledger canonical; 18-row closure grid operational. No tool-specific requirements CSV/acceptance calculator exists for 051.
- Preserved status `IN PROGRESS` / `NOT CLOSED`, **Not 100% VERIFIED**. Two FAIL/E0 rows, 8 static E2 rows, `051-P03-02` PARTIAL E2, D-C4/C5/CLIN/W18 open. No owner acceptance.

## B. Original and R6.1 Requirements

**Canonical denominator recoverability:** FULLY RECOVERABLE from `tool-051-atomic-ledger-2026-11-18.csv|.md` (31 rows), corroborated by B3 and W2. All 31 rows APPLICABLE; 0 NOT_APPLICABLE. `NOT_AVAILABLE`/`BLOCKED` are gate states, not applicability removals. No denominator invented.

**E2 misclassification correction (history preserved):** the source ledger summary records `PASS=19`, but B3 and the atomic E-column show only **11** at E3. Eight static rows are historically `PASS/E2`: `051-STATIC-PIPELINE-01`, `051-STATIC-STATES-5-01`, `051-STATIC-GENIUS12-01`, `051-STATIC-CORE5-01`, `051-STATIC-EXPORT-01`, `051-STATIC-RTL-01`, `051-STATIC-A11Y-01`, `051-STATIC-NO-PERSIST-01`. Their historical `PASS/E2` is **preserved verbatim in the evidence column below**; their **correct current completion classification is E2 static, excluded from PASS(E3+)** because E2 stays E2 and no executable contract/component suite exists. Two rows are historically `FAIL/E0`: `051-STATIC-CONTRACT-01` (ledger expected contract artifact not found) and `051-P03-01` (ledger states pipeline absent from structural gate proof). Both FAIL histories are preserved; current on-disk static observations are recorded as discrepancy context only, with **no E3 awarded**. `051-P03-02` remains `PARTIAL/E2`, never PASS.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| 051-I18N-EVIDENCE-01 | A051-001 | keeps AR/EN parity, every required key and no contamination | APPLICABLE | B=PASS; E=E3; tests/unit/tool-051-i18n-evidence.test.ts :: keeps AR/EN parity, every required key and no contamination | none; counted PASS(E3+) |
| 051-BATCH-01 | A051-002 | 051 wraps peptide dosing with registry identity | APPLICABLE | B=PASS; E=E3; lib/tools/adapters/tool-051-055-batch.test.ts :: 051 wraps peptide dosing with registry identity | none; counted PASS(E3+) |
| 051-BATCH-02 | A051-003 | 052 wraps GH planning with registry identity | APPLICABLE | B=PASS; E=E3; lib/tools/adapters/tool-051-055-batch.test.ts :: 052 wraps GH planning with registry identity | none; counted PASS(E3+) |
| 051-BATCH-03 | A051-004 | 053 wraps insulin conversion with registry identity | APPLICABLE | B=PASS; E=E3; lib/tools/adapters/tool-051-055-batch.test.ts :: 053 wraps insulin conversion with registry identity | none; counted PASS(E3+) |
| 051-BATCH-04 | A051-005 | 054 wraps glucose tracking with registry identity | APPLICABLE | B=PASS; E=E3; lib/tools/adapters/tool-051-055-batch.test.ts :: 054 wraps glucose tracking with registry identity | none; counted PASS(E3+) |
| 051-BATCH-05 | A051-006 | 055 wraps insulin sensitivity with registry identity | APPLICABLE | B=PASS; E=E3; lib/tools/adapters/tool-051-055-batch.test.ts :: 055 wraps insulin sensitivity with registry identity | none; counted PASS(E3+) |
| 051-ENGINE-01 | A051-007 | reconstitutes a 5mg vial to 2.5mg/ml and yields 10 IU per 0.25mg dose | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-051-peptide-dosage-calculator.test.ts :: reconstitutes a 5mg vial to 2.5mg/ml and yields 10 IU per 0.25mg dose | none; counted PASS(E3+) |
| 051-ENGINE-02 | A051-008 | rounds tiny doses to a safe minimum draw of 2 units | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-051-peptide-dosage-calculator.test.ts :: rounds tiny doses to a safe minimum draw of 2 units | none; counted PASS(E3+) |
| 051-ENGINE-03 | A051-009 | computes partial-vial dose counts without over-claiming precision | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-051-peptide-dosage-calculator.test.ts :: computes partial-vial dose counts without over-claiming precision | none; counted PASS(E3+) |
| 051-STATIC-CONTRACT-01 | A051-010 | Input/output contract is defined for the tool | APPLICABLE | B=FAIL; E=E0; lib/tools/r6/tool-051-peptide-dosage-calculator-contract.ts not found | Historical FAIL/E0 preserved; on-disk E2 observation recorded as context only; no E3 awarded; scoped re-evidence required |
| 051-STATIC-PIPELINE-01 | A051-011 | Component calculates through the R6 pipeline (not inline math) | APPLICABLE | B=PASS; E=E2; components/tools/tool-051-peptide-dosage-calculator.tsx inspected (static source evidence, not execution) | Historical PASS/E2 preserved; correct current level E2 static, excluded from PASS(E3+); executable test required |
| 051-STATIC-STATES-5-01 | A051-012 | Five UI states EMPTY / PARTIAL / INVALID / FULL / DEGRADED are explicit | APPLICABLE | B=PASS; E=E2; components/tools/tool-051-peptide-dosage-calculator.tsx inspected (static source evidence, not execution) | Historical PASS/E2 preserved; correct current level E2 static, excluded from PASS(E3+); executable test required |
| 051-STATIC-GENIUS12-01 | A051-013 | GENIUS-12 renderer present with data-r6-genius / data-r6-box markers | APPLICABLE | B=PASS; E=E2; components/tools/tool-051-peptide-dosage-calculator.genius.tsx inspected (static source evidence, not execution) | Historical PASS/E2 preserved; correct current level E2 static, excluded from PASS(E3+); executable test required |
| 051-STATIC-CORE5-01 | A051-014 | CORE-5 markers c1..c5 present in the renderer | APPLICABLE | B=PASS; E=E2; components/tools/tool-051-peptide-dosage-calculator.genius.tsx inspected (static source evidence, not execution) | Historical PASS/E2 preserved; correct current level E2 static, excluded from PASS(E3+); executable test required |
| 051-STATIC-EXPORT-01 | A051-015 | Client-side CSV export builder present | APPLICABLE | B=PASS; E=E2; components/tools/tool-051-peptide-dosage-calculator.genius.tsx inspected (static source evidence, not execution) | Historical PASS/E2 preserved; correct current level E2 static, excluded from PASS(E3+); executable test required |
| 051-STATIC-RTL-01 | A051-016 | RTL direction is derived, not hard-coded LTR | APPLICABLE | B=PASS; E=E2; components/tools/tool-051-peptide-dosage-calculator.tsx inspected (static source evidence, not execution) | Historical PASS/E2 preserved; correct current level E2 static, excluded from PASS(E3+); executable test required |
| 051-STATIC-A11Y-01 | A051-017 | Labels, aria-live state announcement and aria-invalid wiring present | APPLICABLE | B=PASS; E=E2; components/tools/tool-051-peptide-dosage-calculator.tsx inspected (static source evidence, not execution) | Historical PASS/E2 preserved; correct current level E2 static, excluded from PASS(E3+); executable test required |
| 051-STATIC-NO-PERSIST-01 | A051-018 | No localStorage / sessionStorage persistence in the tool | APPLICABLE | B=PASS; E=E2; components/tools/tool-051-peptide-dosage-calculator.tsx inspected (static source evidence, not execution) | Historical PASS/E2 preserved; correct current level E2 static, excluded from PASS(E3+); executable test required |
| 051-I18N-01 | A051-019 | AR/EN parity (en 122 / ar 122 keys) | APPLICABLE | B=PASS; E=E3; node tool-051-i18n-check.mjs -> I18N_PARITY: OK; en=122 ar=122 | none; counted PASS(E3+) |
| 051-ROUTE-01 | A051-020 | Canonical route /smarttools/injection-formulation/tool-051-peptide-dosage-calculator registered and emitted by the clean build | APPLICABLE | B=PASS; E=E3; lib/tools/categories.ts:134 -> 'injection-formulation'; clean build EXITCODE=0 with 506/506 static pages | none; counted PASS(E3+) |
| 051-P03-01 | A051-021 | ResultSchema gate exists before the envelope builder and the raw engine result is never forwarded | APPLICABLE | B=FAIL; E=E0; lib/tools/r6/p03-gate-structural.test.ts covers tool-051-peptide-dosage-calculator-pipeline.ts (structural assertion) | Historical FAIL/E0 preserved; on-disk E2 observation recorded as context only; no E3 awarded; scoped re-evidence required |
| 051-P03-02 | A051-022 | A mismatched engine result is rejected at runtime with no envelope produced | APPLICABLE | B=PARTIAL; E=E2; Only structural coverage exists; no runtime negative-branch test targets this pipeline | PARTIAL/E2; not PASS; Add a per-pipeline runtime negative test (mismatched engine result) |
| 051-BROWSER-EN-AR-01 | A051-023 | Authorized EN and AR render on the deployed route | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 051-BROWSER-STATES-5-02 | A051-024 | EMPTY / PARTIAL / INVALID / FULL / DEGRADED exercised in a real browser | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 051-BROWSER-RTL-390-03 | A051-025 | 390 px RTL layout verified in a real browser | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 051-BROWSER-CONSOLE-04 | A051-026 | Console clean: no hydration errors or runtime exceptions | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 051-BROWSER-GENIUS-DOM-05 | A051-027 | GENIUS-12 DOM order verified: 12 boxes, no duplicate shell, no hidden box | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 051-C4-01 | A051-028 | Approved source pack with provenance is attached to clinical claims | APPLICABLE | B=NOT_AVAILABLE; E=E1; No approved source/provenance pack exists for this tool; the UI renders NOT_AVAILABLE (D-C4 open) | NOT_AVAILABLE/E1; owner gate open; not counted |
| 051-C5-01 | A051-029 | Referral / escalation wording is specialist-approved | APPLICABLE | B=NOT_AVAILABLE; E=E1; Referral wording remains pending specialist approval (D-C5) | NOT_AVAILABLE/E1; owner gate open; not counted |
| 051-CLIN-01 | A051-030 | Clinical / model review sign-off recorded | APPLICABLE | B=BLOCKED; E=E1; No qualified specialist review exists; self-approval is not permitted (D-CLIN) | BLOCKED/E1; specialist sign-off required; not counted |
| 051-W18-01 | A051-031 | History capability per W18 | APPLICABLE | B=NOT_AVAILABLE; E=E1; W18 history is NOT_AVAILABLE: no DB / storage / cloud sync by owner decision | NOT_AVAILABLE/E1; owner gate open; not counted |

**Counts:** applicable **31**; justified N/A **0**; unmapped **0**. `PASS(E3+)` = **11/31 = 35.48%**, matching B3 corrected `(b)`; historical PASS count **19** is preserved as ledger history, not as completion. B-states: 11 PASS E3, 8 PASS E2 static (excluded), 1 PARTIAL E2 (`051-P03-02`), 2 FAIL E0, 5 browser NOT_RUN E0, 3 NOT_AVAILABLE E1, 1 BLOCKED E1. 18-row closure grid recorded `1/18 = 5.56%` — operational only.

**18-row closure-grid reconciliation:**

| Closure grid ID | Grid B/E | Atomic group | Reconciliation |
|---|---|---|---|
| ENG-PIPELINE | PASS/E2 | `051-STATIC-PIPELINE-01`, `051-BATCH-01`, engine rows | static E2 for UI row; batch/engine E3 |
| STATE-5 | PASS/E2 | `051-STATIC-STATES-5-01` | static E2, not E3 |
| UI-GENIUS12 | PASS/E2 | `051-STATIC-GENIUS12-01`, `051-STATIC-CORE5-01` | static E2, not E3 |
| I18N-PARITY | PASS/E3 | `051-I18N-EVIDENCE-01`, `051-I18N-01` | 122/122; WT plural fix separate |
| EXPORT-CSV | PASS/E2 | `051-STATIC-EXPORT-01` | static E2, not E3 |
| TEST-FOCUSED | PARTIAL/E2 | engine + i18n + batch suites only | no contract/component suite; recorded E3, NOT_RUN here |
| BUILD-TSC | PARTIAL/E2 | `051-ROUTE-01` | partial proxy |
| PREVIEW-ROUTE | NOT_RUN/E0 | `051-ROUTE-01` registration | live preview blocked |
| 5 browser buckets | NOT_RUN/E0 | `051-BROWSER-*` | E0 preserved |
| C4/C5/CLIN/W18 | NOT_AVAILABLE/BLOCKED E1 | `051-C4-01`, `051-C5-01`, `051-CLIN-01`, `051-W18-01` | owner gates |
| P03-PIPELINE | NOT_IMPLEMENTED/E1 | `051-P03-01` FAIL E0, `051-P03-02` PARTIAL E2 | FAIL history preserved; on-disk discrepancy not E3 |

**Source authority conflict log:** atomic (31) vs grid (18) → atomic; historic snapshot/deployment vs `37f047a4` → no E4 transfer; 8 historical PASS/E2 rows must not count as E3; two FAIL/E0 histories preserved despite on-disk static observations; `051-P03-02` E2 PARTIAL must not be relabeled; D-C4/C5/CLIN/W18 open; Arabic i18n fix uncommitted WT-only.

## C. Existing Architecture and Implementation

| Exact path | Git status | SHA-256 (first 16) | Role / test | Status |
|---|---|---|---|---|
| `lib/tools/engines/tool-051-peptide-dosage-calculator.ts` + `.test.ts` | tracked, clean | `F2EFA3C14DB69F63`, `C31FEFE5813A929A` | pure engine + suite | implemented; NOT_RUN here |
| `lib/tools/schemas/tool-051-peptide-dosage-calculator.ts` | tracked, clean | `90F07A68C19027A2` | Zod contract | E2 static |
| `lib/tools/r6/tool-051-peptide-dosage-pipeline.ts` | tracked, clean | `2BCF032B0CCE4C68` | validate → engine → result → envelope | static; no pipeline test |
| `lib/tools/r6/tool-051-peptide-dosage-contract.ts` | tracked, clean | `BBD2162B07A126A0` | UI/field/CSV contract; different filename from ledger expectation | static observation only; FAIL/E0 history preserved |
| `lib/tools/adapters/tool-051-peptide-dosage-calculator.ts`, `lib/tools/adapters/tool-051-055-batch.test.ts` | tracked, clean | `CC48DF4ECE82005D`, `08CB6FEF26D4859` | legacy adapter + batch identity suite | E3 recorded for `051-BATCH-01..05` |
| `components/tools/tool-051-peptide-dosage-calculator.tsx` | tracked, clean | `A769EDE8D7B6AB94` | 5-state UI, no inline math | static only; no component test |
| `components/tools/tool-051-peptide-dosage-calculator.genius.tsx` | tracked, clean | `69DED3B536E6779A` | 12 tool-owned boxes, CORE-5, CSV, RTL, a11y | static only |
| `i18n/tool-051-peptide-dosage-calculator.json`, `tests/unit/tool-051-i18n-evidence.test.ts` | tracked; JSON **` M`** | `2842E0101A5EB1F9`, `5AB45D7B147874B9` | EN/AR 122/122 + evidence test | E3 recorded; WT plural fix separate |
| `app/smarttools/tool-051-peptide-dosage-calculator/page.tsx` | tracked, clean | `39997CCF959D8460` | legacy redirect | static |
| shared `registry.ts`, `categories.ts`, `manifest.ts`, `p03-*.test.ts` | tracked, clean | `39891CB9…`, `E2CC7F40…`, `4AF80EA9…`, `99C28B98…`/`4A25901F…` | identity/ownership/P-03 | no edit |

Dependencies: React, Zod, `createToolSchema`, `createToolOutput`/`isToolOutput`, `requireTool`/`buildSeoLinks`, i18n helper; no DB/network/storage. No build/test/browser run here.

## D. Math Engine and Equation Audit

- Inputs: `vial_mg` 0.1–100 mg, `bac_water_ml` 0.1–10 mL, `desired_dose_mg` 0.01–10 mg.
- Equations: `concentration_mg_per_ml = vial_mg / bac_water_ml`; `dose_volume_ml = desired_dose_mg / concentration`; `raw_units = dose_volume_ml × 100` (U-100); `draw_units_u100 = raw_units < 2 ? 2 : round(raw_units × 10)/10`; `doses_per_vial = floor(vial_mg / desired_dose_mg)`; always warns `verify_peptide_identity_and_lab`, adds `dose_below_syringe_resolution` when clamped; outputs rounded to 3 decimals where appropriate.
- Pure, deterministic, no I/O/time/random; schema rejects zero/negative/out-of-range non-finite values; result bounded. Recorded E3 engine rows `051-ENGINE-01..03`; tests declared, not re-run here. No approved source pack (D-C4 open). U-100 unit resolution clamp is documented, not a prescription.

## E. Pipeline and Schema Audit

Static chain: `PeptideDoseInputSchema` → `createToolSchema` → `tool-051-peptide-dosage-pipeline.ts` → unmodified `computePeptideDose` → `PeptideDoseResultSchema` → `createToolOutput` → `isToolOutput`; invalid input short-circuits. No executable contract/component suite exists, so static rows stay E2. `051-P03-01` is historically **FAIL/E0** (ledger: pipeline not in structural gate proof); current static inspection shows the 051 pipeline listed in `p03-gate-structural.test.ts`, but this is an E2 observation and does not erase the FAIL or award E3. `051-P03-02` **PARTIAL/E2** — runtime negative branch not proven. Shared P-03 files unchanged/approval-gated.

## F. AI and Intelligence Capabilities

**NotApplicable** — deterministic arithmetic, no model/prompt/provider/RAG/prediction. Minimum-draw clamp is honest; no invented confidence or range. RuntimeVerified: No (browser E4 NOT_RUN).

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next |
|---|---|---|---|---|---|---|---|---|
| C1 concentration/dose/units/clamp | YES | YES | YES | NO (static E2) | NO | `051-STATIC-STATES-5-01`, engine E3 | component test missing | scoped tests |
| C2 formula/limits/assumptions | YES | YES | YES | NO (static E2) | NO | source inspection | no executable suite | add test |
| C3 warnings/referral | YES | YES | YES | NO (static E2) | NO | source inspection | D-C5/CLIN | approved wording |
| C4 sources | YES | YES | `NOT_AVAILABLE` | NO (static E2) | NO | `051-C4-01` E1 | D-C4 | approved pack |
| C5 next steps/session rating | YES | YES | YES | NO (static E2) | NO | source inspection | no executable suite | add test |
| 12 boxes fixed order | YES | YES | YES | NO (static E2) | NO | `051-STATIC-GENIUS12-01` | DOM E0 | browser + component test |
| Box 11 W18 | YES | YES | `NOT_AVAILABLE` | NO (static E2) | NO | `051-W18-01` E1 | W18 | owner decision |
| Compact/full parity + CSV/RTL/a11y | YES | YES | YES | NO (static E2) | NO | `051-STATIC-CORE5-01`, `051-STATIC-EXPORT-01`, `051-STATIC-RTL-01`, `051-STATIC-A11Y-01` | static only | executable tests |

Tool-owned boxes; compact selector uses boxes 2,3,7,9,12 (labeling note preserved). Static E2 rows are never promoted.

## H. Dynamic Results and UI Maturity

Static inspection (E2): 5 states, debounce, signature gating, typed-zero rejection (schema min>0), RTL `dir`, a11y wiring, CSV gating, no persistence/network. Engine, batch-identity and i18n-evidence suites are the only executable evidence (recorded E3, NOT_RUN here). True-clean log not re-run. Browser E4 5 rows NOT_RUN. No empty→zero coercion or invented confidence/source/history.

## I. Cross-Tool and Data Integration

`051-BATCH-01..05` record registry identity wrapping for 051–055 at E3 in the batch test. UI hand-entry rule only; no payload/session/cloud sync. W18 history box states the real NOT_AVAILABLE reason. Cross-tool integration is test/static-backed, not browser verified.

## J. Safety, Sources and Privacy

Schema bounds and U-100 clamp are validated; no network/auth/storage in engine/pipeline. CSV has no session identifier. Warning always requires identity/lab verification; low-resolution dose is flagged, not silently rounded. D-C4 absent, D-C5 unapproved, D-CLIN blocked, W18 open. Never a dosing prescription.

## K. Localization and Browser Maturity

i18n `en=122/ar=122` E3 via `051-I18N-EVIDENCE-01` and `051-I18N-01`. A separate, scoped, **WT-only/uncommitted** change in `i18n/tool-051-peptide-dosage-calculator.json` alters `ar.tool_name` from `"حاسبة جرعة الببتيد"` to `"حاسبة جرعة الببتيدات"` (canonical plural). It is preserved, not committed, and is **not** committed E3 evidence. Browser: 5 rows E0 NOT_RUN. E4 requires authorized SSO session + preview pinned `37f047a4` + Deployment ID; historic deployment not transferable.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command | Environment | SHA (first 16) | Date | Result | Level | Reproducibility | Compatibility |
|---|---|---|---|---|---|---|---|---|---|---|
| E-051-ENG | `051-ENGINE-01..03` | engine test | `npx vitest run --config vitest.config.ts lib/tools/engines/tool-051-peptide-dosage-calculator.test.ts lib/tools/adapters/tool-051-055-batch.test.ts tests/unit/tool-051-i18n-evidence.test.ts` | recorded clean export; **NOT_RUN here** | `C31FEFE5813A929A` | 2026-11-18 | recorded PASS | E3 | recorded env | tracked at `37f047a4` |
| E-051-BATCH | `051-BATCH-01..05` | batch identity test | same | same | `08CB6FEF26D4859` | as above | recorded PASS | E3 | as above | as above |
| E-051-I18N | `051-I18N-EVIDENCE-01`, `051-I18N-01` | evidence test + check script | `node tool-051-i18n-check.mjs` | recorded; **NOT_RUN here** | JSON `2842E0101A5EB1F9` (` M`); test `5AB45D7B147874B9` | 2026-11-18 | 122/122 PASS in ledger | E3 | recorded env | WT fix separate, not committed |
| E-051-STATIC | 8 `051-STATIC-*` rows | contract/pipeline/component/genius source | `npx vitest run --config vitest.config.ts lib/tools/r6/tool-051-peptide-dosage-contract.test.ts components/tools/tool-051-peptide-dosage-calculator.test.tsx` — **NO SUITE EXISTS** | current WT | `BBD2162B07A126A0`, `2BCF032B0CCE4C68`, `A769EDE8D7B6AB94` | 2026-11-19 | historical PASS/E2 preserved | **E2 static (current), not E3** | static only | excluded from completion |
| E-051-P03FAIL | `051-STATIC-CONTRACT-01`, `051-P03-01` | ledger + structural test | `npx vitest run --config vitest.config.ts lib/tools/r6/p03-gate-structural.test.ts` | recorded; NOT_RUN here | `BBD2162B07A126A0`, `99C28B98910CAC22` | 2026-11-18/19 | historical FAIL/E0 preserved | E0 | ledger env | on-disk discrepancy only; no E3 |
| E-051-P03RUNTIME | `051-P03-02` | shared P-03 runtime test | `npx vitest run --config vitest.config.ts lib/tools/r6/p03-result-schema-validation.test.ts` | recorded; NOT_RUN here | `4A25901F8D498D56` | 2026-11-19 | PARTIAL/E2 preserved | E2 | ledger env | shared; no edit |
| E-051-BROWSER | 5 browser rows | prepared spec | `node tool-051-browser-verify.mjs` after authorized SSO + preview pinned `37f047a4` | NOT_AVAILABLE | — | 2026-11-19 | NOT_RUN | E0 | no | external gate |

Build/`tsc`/eslint/browser/acceptance-calculator: **NOT_RUN / NOT EXECUTED** (`npx tsc --noEmit`, `npm run build`, `npx eslint .` not executed). E2 never becomes E3.

## M. Defect and Gap Register

**Implementation gaps:** two historically FAIL/E0 rows (`051-STATIC-CONTRACT-01`, `051-P03-01`) must remain FAIL until gated re-evidence; eight static E2 UI/contract areas lack executable tests; `051-P03-02` runtime negative-branch proof missing. On-disk static inspection finds a contract file at the shortened path `lib/tools/r6/tool-051-peptide-dosage-contract.ts` and the 051 pipeline listed in `p03-gate-structural.test.ts`; these are E2 discrepancy context only and do not rewrite ledger FAIL history or award E3.

**Evidence/gate gaps:**

| ID | Severity | Requirement ID | Exact file | Actual vs expected | Impact | Root cause | Fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| G-051-CONTRACT-FAIL | HIGH | `051-STATIC-CONTRACT-01` | `lib/tools/r6/tool-051-peptide-dosage-contract.ts` (on disk; ledger expected `...calculator-contract.ts`) | historical FAIL/E0 vs artifact present at different path | 1 row | path/closure mismatch | scoped owner-approved test + ledger-update decision | low |
| G-051-P03-FAIL | HIGH | `051-P03-01` | `lib/tools/r6/p03-gate-structural.test.ts` + `tool-051-peptide-dosage-pipeline.ts` | historical FAIL/E0 vs on-disk structural listing | 1 row | closure proof mismatch | verify with authorized isolated run; preserve history | low |
| G-051-STATIC-UPLIFT | HIGH | 8 `051-STATIC-*` rows | `components/tools/tool-051-peptide-dosage-calculator.tsx`, `.genius.tsx` | historical PASS/E2 vs required E3 executable tests | 8 rows | no test suites | add scoped contract + component tests | low |
| G-051-P03RUNTIME | HIGH | `051-P03-02` | `lib/tools/r6/p03-result-schema-validation.test.ts` | PARTIAL E2 vs runtime reject | 1 row | no per-pipeline negative test | add isolated runtime negative test | low |
| G-051-BROWSER | HIGH | 5 `051-BROWSER-*` | prepared spec / preview | E0 NOT_RUN vs E4 | 5 rows | SSO gate | authorized browser run | low |
| G-051-C4 | HIGH | `051-C4-01` | `components/tools/tool-051-peptide-dosage-calculator.genius.tsx` | NOT_AVAILABLE | 1 row | D-C4 | approved pack | low |
| G-051-C5 | MEDIUM | `051-C5-01` | same genius C5 box | unapproved | 1 row | D-C5 | approved wording | low |
| G-051-CLIN | HIGH | `051-CLIN-01` | review record | BLOCKED | 1 row | D-CLIN | specialist sign-off | low |
| G-051-W18 | MEDIUM | `051-W18-01` | genius history box | NOT_AVAILABLE | 1 row | W18 | owner decision | low |
| G-051-I18N-WT | LOW | separate scoped fix | `i18n/tool-051-peptide-dosage-calculator.json` | ` M` WT-only plural fix, not committed | not E3 | owner review pending | review/commit in separate scoped approval | low |
| G-051-FRESH | INFO | 11 E3 rows | engine/batch/i18n tests | recorded, not re-run | 0 | scope | isolated re-run | none |

## N. Development Maturity Matrix (S0–S11)

| Stage | Component | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|
| S0 Identity | registry/route | S2 | S4 route load | SSO |
| S1 Requirements | 31-row ledger | S3 | owner ratification | none |
| S2 Architecture | engine/schema/static UI | S2 (static UI) | S3 contract/component suites | test + FAIL artifacts |
| S3 Engine | `computePeptideDose` | S3 | S4 | E4 |
| S4 Pipeline | pipeline + P-03 | E0/E2 (FAIL + PARTIAL) | resolve FAIL history + runtime negative | scoped gate/test |
| S5 UI | 5 states/static | S2 | S3 component test | no suite |
| S6 AI/CORE5/GENIUS12 | tool-owned boxes static | S2 | S3/S4 DOM | tests + E4 |
| S7 Cross-tool/safety | batch identity, W18, gates | S2 | S5 approvals | owner |
| S8 Testing | engine + batch + i18n only | S3 partial | S3 static-to-E3 + FAIL close | scoped tests |
| S9 True-clean | `37f047a4` export | S3 recorded | fresh log | scope |
| S10 Browser E4 | 5 checks | S0 | S4 | SSO/pinned preview |
| S11 External | owner/E5 | NOT_VERIFIED | decision | outside |

Engine S9 + UI S2 + browser S0 reported separately; no single-stage maturity claim.

## O. Comparison with Tool 039

| Dimension | Status | Reason | Action |
|---|---|---|---|
| Architecture | APPLICABLE | layered pure pipeline / tool-owned boxes | Preserve |
| Engine | APPLICABLE | deterministic bounded U-100 arithmetic | Preserve |
| Validation | APPLICABLE | input/result/envelope guards | Preserve |
| AI | NOT_APPLICABLE | no model/prompt/prediction | Preserve non-AI |
| Dynamic results | PARTIALLY_APPLICABLE | static UI only; no component suite | Extend with tests |
| CORE-5 compact | PARTIALLY_APPLICABLE | static markers only; label note | Extend tests; fix docs only if authorized |
| GENIUS-12 | PARTIALLY_APPLICABLE | static markers only | Extend tests + E4 |
| Cross-tool | APPLICABLE | batch identity test for 051–055 | Preserve |
| Safety/sources | APPLICABLE | identity/lab warnings present, packs unapproved | Extend after owner |
| Testing | NOT_APPLICABLE_TO_CURRENT_EVIDENCE | no contract/component suite; 8 static E2 + 2 FAIL | Extend (scoped tests/gate) |
| Browser current E4 | NOT_AVAILABLE | no authorized pinned preview | Extend after gate |
| Browser historic transfer | NOT_VERIFIED | historic deployment not transferable | Preserve history |

No similarity score; no shared-shell edit.

## P. Next Development Tasks

| # | Exact file | Change | Tests | Dependencies | Risk | Outcome | Acceptance |
|---|---|---|---|---|---|---|---|
| 1 | `lib/tools/r6/tool-051-peptide-dosage-contract.test.ts` (new), `components/tools/tool-051-peptide-dosage-calculator.test.tsx` (new) | executable tests for 8 static rows + resolve contract path discrepancy | isolated vitest | scoped approval + owner ledger decision | low | 8 rows E3; FAIL history reconciled | PASS at `37f047a4` with recorded decision |
| 2 | `lib/tools/r6/p03-gate-structural.test.ts`, `p03-result-schema-validation.test.ts` | verify 051 structural proof + add runtime negative branch | isolated vitest | scoped approval | low | P03-01/02 resolved | no E3 without recorded PASS |
| 3 | prepared browser spec / preview | authorized E4 run | Playwright | SSO, pinned `37f047a4`, Deployment ID | low | 5 rows E4 | PASS E4 |
| 4 | `components/tools/tool-051-peptide-dosage-calculator.genius.tsx` + owner record | gate artifacts | review sign-off | owner/specialist | medium | gates closed | approvals recorded |
| 5 | `i18n/tool-051-peptide-dosage-calculator.json` | separate scoped review/commit of WT plural fix | i18n parity | owner approval | low | WT fix becomes committed | recorded commit; not this audit |

Reuse passing engine/batch/i18n code; no shared-component change.

## Q. Current Tool Decision

**Decision: CONTINUE / REPAIR (FAIL + static-to-E3 + P-03 + gates).** Historical ledger PASS count 19 is preserved; correct E3 completion is `100 × 11 / 31 = 35.48%` because 8 PASS rows are E2 static, two rows are FAIL/E0 and `051-P03-02` is PARTIAL E2. Closure grid `1/18 = 5.56%` is operational history. The Arabic plural i18n fix is WT-only/uncommitted and handled separately. Status preserved `IN PROGRESS` / **Not 100% VERIFIED**. **No owner acceptance implied.**

## Integrity note

Body-before-hash convention: SHA below computed over bytes preceding the final hash line; whole-file SHA reported in delivery response. No original edited to reconcile a hash.

Observed on-disk SHA-256 (body before this line): `BD202FA1EFD0044F5B2FB1F8E91D81304D9EA57E5CC1499434EA2A4EF1A021A7`
