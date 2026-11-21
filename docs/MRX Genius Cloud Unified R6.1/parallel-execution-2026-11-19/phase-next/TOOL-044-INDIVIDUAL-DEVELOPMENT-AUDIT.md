# TOOL 044 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `044` · `mrx.tool.044-dht-side-effects` |
| Canonical name / slug | `DHT Side Effect Predictor` / `tool-044-dht-side-effects` |
| Category | hormonal-health |
| Canonical route | `/smarttools/hormonal-health/tool-044-dht-side-effects` |
| Batch | Batch 1 |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`, 384 dirty worktree entries observed and preserved) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation. No code, contract, schema, ledger, git, build, test, server or browser write/execution. |
| Primary source ledger | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-044-closure-ledger.md` — observed SHA-256 `9CC4F81D9F30635CAE231ABCF5624D4B59603E821E9478DC72E087BFD0F1CCEE`; twin CSV `851A2237870343E0F31F929CB1D6B528E6714672201F1152E4089638C2E4763E` (18-row operational grid) |
| Reference sources | standard `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9`; W2 inventory `3276ACD111A66506568975ADA721F51FC520F7B28AF6C7CB9AB09916CAC96A6A`; W4b impact map `157FB3DD879BAE4AF66E4B3AA1404788A3AC469FF8AF1B7ED60C6E3D1282C263`; B2b prior context `1AF085F1B3C2344B81024AE896D80246FC5ECF5C1397E0575667FC83BCB9E147`; B3 review `CF3CBE8677F2C5513CE7A3ACEE7E9B5A315A97E6A5CB255FC6DD430CB98E62DF`; Tool 039 profile `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` |
| Tool decision | **REPAIR** — B2b-preserved 0/18 (0.00%) E3+; no owner acceptance implied |

## A. Tool Identity and Historical Lineage

- **Identity (static):** slug `tool-044-dht-side-effects`, toolId `mrx.tool.044-dht-side-effects` in `lib/tools/registry.ts`; category `hormonal-health`; route `/smarttools/hormonal-health/tool-044-dht-side-effects` resolved by `app/smarttools/[category]/[tool]/page.tsx`. No identity discrepancy observed.
- **Implementation paths:** engine `lib/tools/engines/tool-044-dht-side-effects.ts`; schema `lib/tools/schemas/tool-044-dht-side-effects.ts`; pipeline `lib/tools/r6/tool-044-dht-side-effects-pipeline.ts` (tracked clean); contract `lib/tools/r6/tool-044-dht-side-effects-contract.ts` (**untracked**); adapter `lib/tools/adapters/tool-044-dht-side-effects.ts`; component family `components/tools/tool-044-dht-side-effects*.tsx` (main tracked-modified; genius/visual/ocr/pdf/test untracked); i18n `i18n/tool-044-dht-side-effects.json` (tracked clean).
- **Ownership (critical):** 044 is **NOT** in `R6_EXEMPT_SLUGS` (`manifest.ts`); W4b classifies it among the **19 shared-shell tools**. The route renders shared `R6ToolShell`/`boxes.ts` CORE-5/GENIUS-12 boxes. Meanwhile an untracked tool-local `.genius.tsx` is imported by the component (`import Tool044Genius from './tool-044-dht-side-effects.genius'`). This yields an unverified **duplicate-box risk** (`NO-DUP-GENIUS`). No shared edit is authorized.
- **Historical start / engine intent:** `predictDhtEffects` computes DHT-load side-effect heuristics (hair loss, prostate symptoms, overall burden) from DHT level, DHT-derivative use, 5-alpha-reductase inhibitor status, family history and age. Weights are documented, deterministic and clamped to [0,1] before percent conversion; 5-ARI tissue-level reduction and direct androgen-receptor binding of DHT derivatives are documented. It is a calculation aid, never a diagnosis or prescription.
- **Relevant SHAs:** fixed baseline `37f047a4`; closure grid tied to historic snapshot `8d7e406c`; historic deployment `dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL` (2026-11-17, SSO-protected) is historic, not a current E4 artifact; B2b prior context SHA `1AF085F1…`.
- **Artifacts:** closure ledger records "component/genius/contract/pipeline/tests exist; no R6.1 proposals/i18n-check/closure ledger" — the ledger itself is the only R6.1 operational artifact. No tool-specific requirements CSV/acceptance doc exists.
- **Owner decisions:** none found; D-C4/D-C5/D-CLIN/D-W18/D-P03 open. Status `IN PROGRESS` (engineering) / `NOT CLOSED` (formal R6.1) at `8d7e406c`.
- **Current owner:** R6.1 programme owner for gates; implementation owner for later authorized work. No owner acceptance.

## B. Original and R6.1 Requirements

**Canonical denominator finding (explicit):** the canonical denominator for Tool 044 is **NOT fully recoverable beyond the 18-row closure register**. No tool-specific `tool-044-requirements.csv`, atomic ledger, acceptance doc, proposals or i18n check exists on disk (W2 inventory and repo-wide search). The **18-row closure ledger MD/CSV** is the only atomic register; it is used here strictly as an **operational audit matrix tied to historic HEAD `8d7e406c`**, not an owner-accepted official denominator for `37f047a4`. The "Original requirement ID" column below is an engineering crosswalk to SPEC/ACC/LAYER sources, **not** an owner-approved atomic ID set. No denominator is invented.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| ENG-PIPELINE | ENG-PIPELINE | Compute via R6 pipeline path only (no UI-side engine logic) | APPLICABLE | B=PARTIAL; E=E1; C=PENDING; files: components/tools/tool-044-dht-side-effects*, lib/tools/r6/tool-044*; test_result: R6 pipeline artifacts present; R6.1 closure doc evidence incomplete; head: 8d7e406c; evidence_uri: ; gap: Re-r... | Operational grid only at 8d7e406c; no authoritative atomic ID beyond this bucket, no E3+ proof; 0/18 preserved. |
| STATE-5 | STATE-5 | Five states EMPTY/PARTIAL/INVALID/FULL/DEGRADED implemented honestly | APPLICABLE | B=PARTIAL; E=E1; C=PENDING; files: components/tools/tool-044-dht-side-effects*, lib/tools/r6/tool-044*; test_result: Base artifacts exist; R6.1 state evidence not fully documented; head: 8d7e406c; evidence_uri: ; gap: Verify st... | Operational grid only at 8d7e406c; no authoritative atomic ID beyond this bucket, no E3+ proof; 0/18 preserved. |
| UI-GENIUS12 | UI-GENIUS12 | GENIUS-12 fixed order present once (no hidden/duplicate boxes) + CORE-5 | APPLICABLE | B=PARTIAL; E=E1; C=PENDING; files: components/tools/tool-044-dht-side-effects*, lib/tools/r6/tool-044*; test_result: Artifacts exist; closure documentation/evidence incomplete; head: 8d7e406c; evidence_uri: ; gap: Browser verif... | Operational grid only at 8d7e406c; no authoritative atomic ID beyond this bucket, no E3+ proof; 0/18 preserved. |
| I18N-PARITY | I18N-PARITY | AR/EN parity, required keys resolved, no contamination | APPLICABLE | B=NOT_RUN; E=E0; C=PENDING; files: docs/MRX Genius Cloud Unified R6.1/tool-044-i18n-check.mjs; test_result: No R6.1 i18n-check script in docs folder; head: 8d7e406c; evidence_uri: ; gap: Create and run R6.1 i18n parity check wi... | Operational grid only at 8d7e406c; NOT_RUN/E0 and no current E4; richer authoritative denominator not recoverable; no E3 transfer. |
| EXPORT-CSV | EXPORT-CSV | Browser-only CSV export (no server/session identifier) | APPLICABLE | B=PARTIAL; E=E1; C=PENDING; files: components/tools/tool-044-dht-side-effects*, lib/tools/r6/tool-044*; test_result: Not fully documented in R6.1 closure artifacts; head: 8d7e406c; evidence_uri: ; gap: Verify on accessible Prev... | Operational grid only at 8d7e406c; no authoritative atomic ID beyond this bucket, no E3+ proof; 0/18 preserved. |
| TEST-FOCUSED | TEST-FOCUSED | Focused tests pass (pipeline/contract/component/i18n-evidence as applicable) | APPLICABLE | B=PARTIAL; E=E2; C=PENDING; files: components/tools/tool-044-dht-side-effects*, lib/tools/r6/tool-044*; test_result: Prior batch/tool focused tests recorded in reports (e.g. Batch1 combined slices, Batch2 59/516 cumulative) — n... | Operational grid only at 8d7e406c; E2 remains E2 and never counts as E3; 0/18 E3+ preserved. |
| BUILD-TSC | BUILD-TSC | tsc --noEmit and next build pass with route present | APPLICABLE | B=PARTIAL; E=E2; C=PENDING; files: repo build; test_result: Per-batch/per-tool tsc/build recorded in prior reports; E1 deployment build for mrxsteroid reached 506/506 routes (Ready). Not re-run as archived clean artifact for th... | Operational grid only at 8d7e406c; E2 remains E2 and never counts as E3; 0/18 E3+ preserved. |
| PREVIEW-ROUTE | PREVIEW-ROUTE | Direct Preview route loads for tool (SSR/accessible) | APPLICABLE | B=NOT_RUN; E=E0; C=PENDING; files: /smarttools/hormonal-health/tool-044-dht-side-effects; test_result: Deployment E1 Ready (mrxsteroid preview) but URL/alias/batch aliases redirect to Vercel SSO login in real checks (2026-11-17... | Operational grid only at 8d7e406c; NOT_RUN/E0 and no current E4; richer authoritative denominator not recoverable; no E3 transfer. |
| BROWSER-EN-AR | BROWSER-EN-AR | EN and AR functional pass on Preview | APPLICABLE | B=NOT_RUN; E=E0; C=PENDING; files: tool-044-dht-side-effects; test_result: NOT_RUN — Preview SSO-protected; head: 8d7e406c; evidence_uri: ; gap: Execute EN/AR browser checks on accessible Preview | Operational grid only at 8d7e406c; NOT_RUN/E0 and no current E4; richer authoritative denominator not recoverable; no E3 transfer. |
| BROWSER-5-STATES | BROWSER-5-STATES | Five states exercised on Preview | APPLICABLE | B=NOT_RUN; E=E0; C=PENDING; files: tool-044-dht-side-effects; test_result: NOT_RUN — Preview SSO-protected; head: 8d7e406c; evidence_uri: ; gap: Exercise EMPTY/PARTIAL/INVALID/FULL/DEGRADED on accessible Preview | Operational grid only at 8d7e406c; NOT_RUN/E0 and no current E4; richer authoritative denominator not recoverable; no E3 transfer. |
| RTL-390 | RTL-390 | Real Arabic RTL at 390px (no overflow, readable, correct direction) | APPLICABLE | B=NOT_RUN; E=E0; C=PENDING; files: tool-044-dht-side-effects; test_result: NOT_RUN — Preview SSO-protected; head: 8d7e406c; evidence_uri: ; gap: Run real 390px RTL browser test and capture evidence | Operational grid only at 8d7e406c; NOT_RUN/E0 and no current E4; richer authoritative denominator not recoverable; no E3 transfer. |
| CONSOLE-HYDRATION | CONSOLE-HYDRATION | No Console errors or SSR/Hydration issues | APPLICABLE | B=NOT_RUN; E=E0; C=PENDING; files: tool-044-dht-side-effects; test_result: NOT_RUN — Preview SSO-protected; head: 8d7e406c; evidence_uri: ; gap: Capture browser console on accessible Preview | Operational grid only at 8d7e406c; NOT_RUN/E0 and no current E4; richer authoritative denominator not recoverable; no E3 transfer. |
| NO-DUP-GENIUS | NO-DUP-GENIUS | No duplicate GENIUS-12 / no hidden box / no double shell | APPLICABLE | B=NOT_RUN; E=E0; C=PENDING; files: tool-044-dht-side-effects; test_result: NOT_RUN — requires accessible Preview DOM inspection; head: 8d7e406c; evidence_uri: ; gap: Inspect DOM on accessible Preview; verify R6_EXEMPT_SLUGS/she... | Operational grid only at 8d7e406c; NOT_RUN/E0 and no current E4; richer authoritative denominator not recoverable; no E3 transfer. |
| C4-SOURCES | C4-SOURCES | Specialist-approved sources/provenance or owner-approved N/A | APPLICABLE | B=NOT_AVAILABLE; E=E1; C=PENDING; files: tool-044-dht-side-effects; test_result: No approved source/provenance recorded (D-C4 open); head: 8d7e406c; evidence_uri: ; gap: Provide approved source pack or owner-approved N/A per to... | Operational grid only at 8d7e406c; unresolved state (NOT_AVAILABLE/E1) preserved; owner gate open; no E3 transfer. |
| C5-REFERRAL | C5-REFERRAL | Specialist-approved referral/seek-care wording (AR/EN) | APPLICABLE | B=NOT_AVAILABLE; E=E1; C=PENDING; files: tool-044-dht-side-effects; test_result: Referral wording pending specialist approval (D-C5); head: 8d7e406c; evidence_uri: ; gap: Provide approved wording pack | Operational grid only at 8d7e406c; unresolved state (NOT_AVAILABLE/E1) preserved; owner gate open; no E3 transfer. |
| CLINICAL-REVIEW | CLINICAL-REVIEW | Clinical/model review sign-off as applicable | APPLICABLE | B=BLOCKED; E=E1; C=PENDING; files: tool-044-dht-side-effects; test_result: Clinical/model review not recorded (D-CLIN); head: 8d7e406c; evidence_uri: ; gap: Obtain clinical/model review sign-off | Operational grid only at 8d7e406c; unresolved state (BLOCKED/E1) preserved; owner gate open; no E3 transfer. |
| W18-HISTORY | W18-HISTORY | History/storage/sync per W18 decision | APPLICABLE | B=NOT_AVAILABLE; E=E1; C=PENDING; files: tool-044-dht-side-effects; test_result: Box 11 NOT_AVAILABLE; no storage (D-W18 open); head: 8d7e406c; evidence_uri: ; gap: Owner decision on W18 | Operational grid only at 8d7e406c; unresolved state (NOT_AVAILABLE/E1) preserved; owner gate open; no E3 transfer. |
| P03-PIPELINE | P03-PIPELINE | Shared R6 pipeline result-schema enforcement (if applicable) | APPLICABLE | B=NOT_IMPLEMENTED; E=E1; C=PENDING; files: shared pipeline; test_result: Frozen pipeline layer; P-03 not implemented (D-P03); head: 8d7e406c; evidence_uri: ; gap: Approve and implement shared P-03 change with regression | Operational grid only at 8d7e406c; unresolved state (NOT_IMPLEMENTED/E1) preserved; owner gate open; no E3 transfer. |

**Counts:** applicable 18 (operational matrix); justified N/A 0; unmapped original IDs 4 (`C4-SOURCES`, `C5-REFERRAL`, `CLINICAL-REVIEW`, `P03-PIPELINE`). B2b-preserved completion: **0/18 = 0.00%** E3+. Ledger B-states: PARTIAL 5 (E1), NOT_RUN 6 (E0), PARTIAL 2 (E2: `TEST-FOCUSED`, `BUILD-TSC`), NOT_AVAILABLE 3 (E1), BLOCKED 1 (E1), NOT_IMPLEMENTED 1 (E1). No row is PASS at E3+; E2 stays E2. `I18N-PARITY` is NOT_RUN/E0 because no i18n check script exists.

**Reconciliation note:** the 18 rows are review buckets (`ENG-PIPELINE`, `STATE-5`, `UI-GENIUS12`, etc.) expanding to several engineering requirements visible in static code. A richer denominator cannot be recovered without authoring new requirement IDs, which is outside this read-only phase and would violate "never invent a denominator". The `1/18`-style figures recorded for peer tools do not apply; 044's preserved figure is 0/18.

**Source authority conflict log:**

| Source | Location | Impact | Resolution required |
|---|---|---|---|
| Shared-shell membership (non-exempt) vs untracked tool-local `.genius.tsx` | `manifest.ts` + `R6ToolShell.tsx` vs component | Duplicate/hidden box risk | DOM verification + owner decision; **no shared edit** |
| 18-row grid at `8d7e406c` | closure ledger | Historical not current | Operational only; no E3 transfer |
| No i18n check script | docs folder | `I18N-PARITY` NOT_RUN | Create in authorized phase |
| D-C4/C5/CLIN/W18/P03 open | ledger | 5 unresolved rows | Owner packs/sign-offs |
| Dirty WT artifacts (contract, genius, visual, tests, schemas) | code | Static evidence only | Preserve; scoped commit only under authorization |
| No R6.1 proposals for 044 | docs folder | Historical lineage less documented than 040–042 | Recorded; do not invent proposals |

## C. Existing Architecture and Implementation

| Exact path | Git status (observed) | Role | Test file | Actual status |
|---|---|---|---|---|
| `lib/tools/engines/tool-044-dht-side-effects.ts` + `.test.ts` | tracked, clean (`8E6EB71B34BC`, `D81F7FB192B8`) | pure engine + suite | same file | static present |
| `lib/tools/schemas/tool-044-dht-side-effects.ts` | **modified** (` M`, `228C56814432`) | Zod guards | no dedicated schema test | WT-only change preserved |
| `lib/tools/r6/tool-044-dht-side-effects-pipeline.ts` | tracked, clean (`7D7719A33BBA`) | validate→engine→result→envelope | `...pipeline.test.ts` **untracked** (`A04AC91A4E14`) | static present |
| `lib/tools/r6/tool-044-dht-side-effects-contract.ts` | **untracked** (`B863A377F296`) | 120 ms debounce, 90-day freshness, DHT/PSA/ratio limits | — | static present |
| `lib/tools/adapters/tool-044-dht-side-effects.ts` | tracked, clean (`0C0F5A816D41`) | legacy adapter | — | static present |
| `components/tools/tool-044-dht-side-effects.tsx` | **modified** (` M`, `4DD58EB85519`) | 5-state UI, pipeline import, `dir`/`data-r6-*` | `.test.tsx` **untracked** (`13711F18153E`) | static present |
| `.genius.tsx`, `.visual.tsx`, `.ocr.tsx`, `.pdf.tsx` | **untracked** (`D79037D37751`, `B05CD49B7C64`, `5C84A4506331`, `23492801DBB5`) | tool-owned boxes/visual/capability | — | static present; duplicate risk |
| `i18n/tool-044-dht-side-effects.json` | tracked, clean (`A4B9A22AEE96`) | EN/AR resources | no i18n evidence test | static present; parity NOT_RUN |
| closure ledger MD/CSV | tracked, clean | 18-row operational grid | — | read |

**Dependencies:** React client, `useToolDisplayPreferences`, `createToolSchema`/`createToolOutput`/`isToolOutput`, `requireTool`/`buildSeoLinks`, Zod, shared `R6ToolShell`/`boxes.ts` (non-exempt), tool-local genius/visual modules. No Supabase/network/storage observed. No build/test/browser executed.

## D. Math Engine and Equation Audit

- Inputs: `dht_ng_dl 5..300` (reference ~30–85, anchor 50), `uses_dht_derivative`, `five_ari ∈ {none,finasteride,dutasteride}`, `family_history_hairloss`, `age 18..90`. Output: `hair_loss_risk_pct`, `prostate_symptom_risk_pct`, `overall_burden_pct`, `band ∈ {low,moderate,high}`, `mitigations[]`.
- Weights are documented in the engine, deterministic, clamped via `clamp01` before `%` conversion; 5-ARI reduces DHT-mediated effects at tissue level while DHT-derivative AAS still bind the androgen receptor directly (documented in the module header).
- Contract (untracked) declares `TOOL_044_DEBOUNCE_MS = 120`, `TOOL_044_LAB_FRESHNESS_DAYS = 90`, reference limits (DHT low 5, reference_min 30, optimal 30–85, borderlineMax/high 100, anchor 50), PSA thresholds (2.5 under 50 / 4.0 over 50), DHT:TT ratio (0.05–0.10 optimal, 0.15 borderline), `Tool044FieldId` set and freshness helper.
- Validation: Zod guards (WT-modified schema); no NaN/Infinity path from validated input; no `Date` in engine; caller injects time; deterministic; purity holds structurally.
- **Source traceability limitation:** no cited validated source pack for risk weights/thresholds; `C4-SOURCES` is `NOT_AVAILABLE`, `CLINICAL-REVIEW` `BLOCKED`. Recorded as an implementation/clinical-gate gap, not silently accepted.
- **Tests run vs NOT_RUN:** engine test tracked but **NOT_RUN**; pipeline test untracked and **NOT_RUN**; no contract/component evidence run. Exact isolated command for a later authorized phase: `npx vitest run --config vitest.config.ts lib/tools/engines/tool-044-dht-side-effects.test.ts lib/tools/r6/tool-044-dht-side-effects-pipeline.test.ts` — **NOT_RUN**.

## E. Pipeline and Schema Audit

Chain (static): `DhtInputSchema` → `createToolSchema` → pipeline → authoritative `predictDhtEffects` → `DhtResultSchema` → `createToolOutput`/`isToolOutput`; invalid input short-circuits. Pipeline tracked clean; its test and contract are untracked → **E2 static only**. No archived PASS run at `37f047a4`. `ENG-PIPELINE` ledger row is PARTIAL/E1. **P-03:** frozen shared gate not implemented → `NOT_IMPLEMENTED`; shared, approval-gated; do not award. No runtime execution here.

## F. AI and Intelligence Capabilities

No model, prompt, provider, RAG or prediction: **NotApplicable**. Risk percentages are a deterministic, documented heuristic; no AI runtime claim. **Implemented (static) / RuntimeVerified: No.**

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next action |
|---|---|---|---|---|---|---|---|---|
| C1 primary result | YES | YES | static | NO | NO | engine result fields | no E3 | component test |
| C2 how calculated | YES | YES | static (untracked contract) | NO | NO | limits/weights strings | no E3 | contract test |
| C3 safety/referral | YES | partial | static | NO | NO | mitigations | D-C5/D-CLIN open | approved wording |
| C4 sources | YES | YES | `NOT_AVAILABLE` reason | NO | NO | ledger row | D-C4 open | approved pack |
| C5 next actions | YES | partial | static | NO | NO | mitigations | D-C5 open | approved pack |
| Boxes 1–12 fixed order | YES | YES | static (shared shell + untracked local genius) | NO | NO | `UI-GENIUS12` PARTIAL/E1 | **duplicate risk** | DOM verify; no shared edit |
| Box 11 history | YES | YES | `NOT_AVAILABLE` per ledger | NO | NO | `W18-HISTORY` | W18 open | owner decision |
| Compact/full parity | YES | static | static | NO | NO | component `compactGenius` | no E3 | parity test |

044 is **non-exempt**: `NO-DUP-GENIUS` is NOT_RUN and is a genuine open risk, not an asserted defect.

## H. Dynamic Results and UI Maturity

- **Static inspection:** `lifecycleState`, `dir={isRtl ? 'rtl' : 'ltr'}`, `data-r6-state`, `data-r6-field`, compact toggle, pipeline import, no fabricated defaults observed. `STATE-5` ledger row PARTIAL/E1; state evidence not fully documented.
- **Component test:** untracked, NOT_RUN. **True-clean:** no isolated log. **Browser E4:** all browser rows NOT_RUN (SSO-protected preview at `8d7e406c`); no current E4 claim.

## I. Cross-Tool and Data Integration

Engine → pipeline → component chain present; adapter module static. No payload transfer or cloud sync. W18 boundary: no storage; history not available. Fail-closed propagation is static; no archived run. No documented R6.1 cross-tool link contract for 044.

## J. Safety, Sources and Privacy

- Heuristic risk output with `mitigations[]` and calculation-aid posture; no cited source pack (D-C4), no approved referral wording (D-C5), no clinical sign-off (D-CLIN). No self-approval.
- No API/auth path in tool files; no value logging observed; console NOT_RUN; no storage; W18 open. Red-flag/referral content is static only; do not invent wording.

## K. Localization and Browser Maturity

- i18n JSON tracked clean; no `tool-044-i18n-check.mjs` script and no i18n evidence test — `I18N-PARITY` is **NOT_RUN/E0**. No parity figure awarded.
- EN/AR, RTL 390/1440, five states, console/hydration, DOM duplicate check, route proof — **NOT_RUN (E0)**. E4 prerequisites absent (SSO + preview pinned to `37f047a4` + Deployment ID). No browser claim.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command | Environment | Source SHA (first 16) | Date | Actual result | Level | Reproducibility / validity | HEAD compat. |
|---|---|---|---|---|---|---|---|---|---|---|
| E-044-01 | 18-row grid | `tool-044-closure-ledger.md` | read-only table parse | this audit | `9CC4F81D9F30635` | 2026-11-19 | 18 rows; 0 PASS(E3+) | E2 static | reproducible | tracked @ HEAD |
| E-044-02 | prior context | B2b `1AF085F1…` | reuse preserved evidence | B2b | `1AF085F1B3C2344` | 2026-11-19 | 0/18 E3+ | E5 | SHA verified | fixed baseline lens |
| E-044-03 | focused battery | engine + pipeline tests | isolated `npx vitest run …` (command in D) | isolated clean env | `8E6EB71B34BC…` | 2026-11-19 | **NOT_RUN** | E2 | no log; pipeline test untracked | mixed |
| E-044-04 | i18n parity | no script | `node "docs/MRX Genius Cloud Unified R6.1/tool-044-i18n-check.mjs"` (to be created) | local | — | 2026-11-19 | **NOT_RUN** | E0 | script absent | n/a |
| E-044-05 | build/typecheck | build config | `npx tsc --noEmit`, `npm run build` | clean env | — | 2026-11-19 | **NOT_RUN** | E2 | no HEAD artifact | no artifact |
| E-044-06 | browser rows | preview URL | browser checks pinned to `37f047a4` | authorized env | — | 2026-11-19 | **NOT_RUN** | E0 | SSO blocked | historic only |

No test/build/browser action executed. No denominator was authored or invented.

## M. Defect and Gap Register

**Implementation gaps**

| ID | Severity | Requirement | Exact file | Gap / actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-044-1 | HIGH | `NO-DUP-GENIUS`, `UI-GENIUS12` | `components/tools/tool-044-dht-side-effects.genius.tsx` (untracked) + `components/tools/r6/R6ToolShell.tsx` (shared) | Tool-local boxes coexist with non-exempt shared shell | Duplicate/hidden box risk unverified | `manifest.ts` membership + local genius | DOM verify in authorized phase; **no shared edit** | high if shared edited |
| I-044-2 | MEDIUM | `I18N-PARITY` | docs folder / i18n JSON | No i18n check script or evidence test | Parity unproven | Script never created | Add scoped check + test | low |
| I-044-3 | MEDIUM | `C4-SOURCES`, `CLINICAL-REVIEW` | `lib/tools/r6/tool-044-dht-side-effects-contract.ts` (untracked) | Risk weights/thresholds lack cited source/sign-off | Model provenance ungated | No approved pack | Owner pack + specialist sign-off | medium |
| I-044-4 | MEDIUM | `ENG-PIPELINE` evidence | `lib/tools/r6/tool-044-dht-side-effects-contract.ts`, `...pipeline.test.ts` | Contract and pipeline test untracked | Clean-clone E3 unproven | Never committed | Scoped commit + isolated re-run | low |

**Evidence gaps**

| ID | Severity | Requirement | Exact file | Gap | Impact | Next action |
|---|---|---|---|---|---|---|
| V-044-1 | CRITICAL | all 18 rows | closure ledger | No row PASS at E3+ | 0/18 | Build tool-local evidence in authorized phase |
| V-044-2 | HIGH | 6 browser rows | preview URL | E4 NOT_RUN | 6 unresolved | Authorized preview pinned to `37f047a4` |
| V-044-3 | HIGH | TEST-FOCUSED / BUILD-TSC | tests + build config | No HEAD run | E2 only | Archive isolated PASS logs |
| V-044-4 | MEDIUM | C4/C5/CLIN/W18/P03 | ledger | 5 owner-gated rows open | unresolved | Owner packs/decisions |

## N. Development Maturity Matrix (S0–S11)

| Stage | Component | Highest verified stage | Next missing stage | Bottleneck |
|---|---|---|---|---|
| S0 | Identity / registry | S0 verified | S1 | none |
| S1 | Requirements | S1 partial (18-row grid only) | S2 authoritative denominator | no per-tool CSV/atomic ledger |
| S2 | Architecture | S2 verified (inventory + git) | S3 | shared-shell vs local genius |
| S3 | Engine | S3 static (pure clamped heuristic) | S4 E3 test | NOT_RUN; D-CLIN open |
| S4 | Pipeline | S4 static (pipeline tracked; test/contract untracked) | S5 E3 | no HEAD log |
| S5 | UI | S5 static (state union, modified component) | S6 component E3 | test untracked |
| S6 | AI / CORE-5 / GENIUS-12 | S6 static; duplicate risk open | S7 DOM E3 | shared-shell alignment |
| S7 | Cross-tool / safety | S7 static; model ungated | S8 | D-C4/C5/CLIN/W18 open |
| S8 | Testing | S8 partial (engine test tracked, untracked pipeline test) | S9 | all NOT_RUN |
| S9 | True-clean | S9 not verified | S10 | no isolated log |
| S10 | Browser | S0 only | S1 browser | SSO |
| S11 | External / owner | S0 only | S1 | owner; never from plan |

## O. Comparison with Tool 039 (applicable engineering criteria only)

039 is reference only; no similarity score; its acceptance is not transferred.

| Dimension | Status | Engineering reason | Action |
|---|---|---|---|
| Architecture | PARTIALLY_APPLICABLE | Same layer chain but 044 non-exempt with local genius | Fix (verify duplication); no shared edit |
| Engine | PARTIALLY_APPLICABLE | Deterministic clamped heuristic; weights lack cited source | Preserve math; Fix provenance |
| Validation | PARTIALLY_APPLICABLE | Guards present; pipeline test/contract untracked | Extend with isolated evidence |
| AI | NOT_APPLICABLE | No model in either | Preserve |
| Dynamic Results | PARTIALLY_APPLICABLE | State union static; no component E3 | Extend |
| CORE-5 | PARTIALLY_APPLICABLE | shared shell + local boxes | Fix (verify mapping) |
| GENIUS-12 | PARTIALLY_APPLICABLE | 12 boxes static/unverified | Preserve reason; Extend DOM proof |
| Cross-Tool | PARTIALLY_APPLICABLE | adapter present, no documented link contract | Preserve; Extend |
| Safety | PARTIALLY_APPLICABLE | calculation-aid posture; D-C4/C5/CLIN open | Fix gates |
| Testing | NOT_VERIFIED | no current run; untracked pipeline test | Fix with isolated evidence |
| Browser — current-HEAD E4 | NOT_AVAILABLE | no pinned preview | Extend after SSO gate |
| Browser — historic transfer | NOT_VERIFIED | no pinned artifact for 044 | Preserve as history |

## P. Next Development Tasks (proposals only)

| # | Exact file | Proposed change | Required tests | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| 1 | `components/tools/tool-044-dht-side-effects.genius.tsx` + route | DOM verify single ordered box set (no shared edit) | browser DOM check | authorized preview | medium | duplicate risk closed | 12 ordered boxes, one shell |
| 2 | `lib/tools/r6/tool-044-dht-side-effects-contract.ts`, `...pipeline.test.ts`, component test | scoped commit of tool-local artifacts | isolated `npx vitest run …` | owner authorization | low | clean-clone E3 uplift | PASS logs at `37f047a4` |
| 3 | docs folder | create `tool-044-i18n-check.mjs` + i18n evidence test | parity run | authorized phase | low | I18N-PARITY closure | parity PASS artifact |
| 4 | `lib/tools/r6/tool-044-dht-side-effects-contract.ts` | supply approved source + specialist sign-off | D-C4/C5/CLIN review | owner/specialist | medium | provenance closed | recorded approvals |
| 5 | build config | archive clean tsc/build | `npx tsc --noEmit`, `npm run build` | isolated env | low | BUILD-TSC closure | archived clean output |

Shared-component changes require a separate Change Impact Matrix; none authorized. Do not edit `R6ToolShell.tsx`, `boxes.ts` or `manifest.ts`.

## Q. Current Tool Decision

**Decision: REPAIR.** Completion = `100 × 0 / 18 = 0.00%` (B2b-preserved; 18-row operational denominator only — a richer authoritative denominator is **not recoverable**). Preserved assets: pure deterministic clamped engine with documented DHT/5-ARI posture, tracked pipeline and adapter, i18n resources, declared contract constants. Blocking gaps: no E3+ row, untracked contract/pipeline test/component family, modified schemas and component, non-exempt dual-box risk, absent i18n check, six browser NOT_RUN rows, and five open owner gates. **No owner acceptance implied, claimed or transferred.**

## Integrity note

The SHA-256 below is computed over all bytes of this file preceding the final hash line. Because that line is added after hashing, the whole-file hash differs by construction; the recorded body hash is the reproducible content fingerprint and is authoritative for this audit. The true whole-file SHA-256 is reported in the delivery response.

Observed on-disk SHA-256 (body before this line): `89D9542DF07E3614BFD1CA60D90B22D5FB3065D0A26EDD0FC8C0B16BB3A61D7E`
