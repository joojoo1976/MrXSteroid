# TOOL 017 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `017` · `mrx.tool.017-drug-interaction` |
| Canonical name / slug | `Drug Interaction Checker` / `tool-017-drug-interaction` |
| Category | `medical-monitoring` (registry and closure ledger agree) |
| Canonical route | `/smarttools/medical-monitoring/tool-017-drug-interaction` |
| Batch | Batch 4 (closure ledger) |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`, dirty worktree preserved) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation. No code, contract, schema, ledger, git, build, test, server or browser writes/executions. |
| Primary evidence reuse | `retry-01/B1b-LEDGER-016-023.md` — observed on-disk SHA-256 `607D9993572C384E946DD34EA841F79C3B033FE5BAE58ADF7BBB0C74CDB50F82` (verified this audit; reused, not redone) |
| Source register | `closure-sprint-2026-11-17/tool-017-closure-ledger.md` — observed SHA-256 `6E2DDE7932F62AC513BE58DD2ADE1574E9D73FFCE3E8A2CF3668869285B9B6F6` (verified); CSV index blob `68b18a75c00e84313f7c0721e59422739a267198` |
| Supporting refs | `TOOL-017-DEVELOPMENT-PROPOSALS.md`; `tool-017-i18n-check.mjs` (index blob `cb1b1e0a7e7f8db4b9d30b540bebde4727479019`); governing plan observed SHA-256 `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9` |
| Tool 039 reference | `R6.1-TOOL-039-ENGINEERING-REFERENCE-PROFILE.md` — observed SHA-256 `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` (reference only, never one of the 29) |
| Tool decision | **REPAIR** — 3/18 = 16.67% verified (operational matrix); no owner acceptance implied |

Scope/preservation: read-only inspection plus this one new documentation file. Fixed baseline `E:\MrXSteroid-main` at `37f047a4` with a dirty worktree preserved unchanged. True-clean ref `E:\p03-true-clean-20261118@37f047a4`; contaminated `2a647fda` excluded. No test, build, typecheck, lint, install, dev server, browser or runtime E4 action was executed. Absent executions are `NOT_RUN` with exact isolated commands.

Evidence ladder: E0 none; E1 assertion; E2 file/static code; E3 reproducible test; E4 authorized runtime/browser; E5 independent audit. Only E3+ counts as PASS. `NOT_AVAILABLE ≠ NOT_APPLICABLE`.

## A. Tool Identity and Historical Lineage

- **Identity (registry, observed):** `lib/tools/registry.ts:58` — `toolId mrx.tool.017-drug-interaction`, slug `tool-017-drug-interaction`, version `1.0.0`, `page Page.DRUG_INTERACTION`, `href /smarttools/medical-monitoring/tool-017-drug-interaction`, titleEn `Drug Interaction Checker`, titleAr `فاحص تفاعلات المركبات`, `accessTier free`, `order 320`, `stackStatus layered`. Route file `app/smarttools/tool-017-drug-interaction/page.tsx` is tracked (index blob `447beb9ab6f84b222fcf3a9dabce64a6f5666e56`), clean. A separate legacy `tool-017-injection-volume` exists; it is **not** the audited tool.
- **Implementation paths (observed):** engine `lib/tools/engines/tool-017-drug-interaction.ts` (tracked, `263520d491fee504c5fa33c5f58505cf093ed3f5`); schema `lib/tools/schemas/tool-017-drug-interaction.ts` (tracked, `fa0374763ba3fe4e80412c44d10252bc8b13790b`); pipeline `lib/tools/r6/tool-017-drug-interaction-pipeline.ts` (tracked, `dc46dbec9e0537a5f7a5fea33748f7c6c254a815`); contract `lib/tools/r6/tool-017-drug-interaction-contract.ts` (tracked, `61864b383ee96c106ce61cbdd86666b602361abb`); pipeline test `lib/tools/r6/tool-017-drug-interaction-pipeline.test.ts` (tracked, `ddefaa619d1e44cef44154f93a8f66e205f3b714`); engine test (tracked, `384830fd0b8ee2a99616169b4b91fde2936f723b`); component `components/tools/tool-017-drug-interaction.tsx` (tracked, `a4865c23e40c418f34c9a790453e9541c6a172e1`), genius (tracked, `8ec0d28406d141a51d2d743c846a33e6fc86a41e`), dom test (tracked, `9116b023c23b9b6a96d49a56e9184764d7c009ef`); i18n (tracked, `c511c0babe5a5f254f2dd5e283f3235e9ab44455`); unit i18n evidence (tracked, `3ce0a2d75412f1d7688e68853119ff39435d5b90`). **No modified or untracked Tool 017 implementation files observed** — this is the strongest tracking posture among the four audited tools.
- **Historical start / engine intent:** the V6 engine deliberately fails closed: `checkDrugInteractions(_input?)` returns `{status:'NOT_AVAILABLE', reason:'NO_VERIFIED_INTERACTION_SOURCE'}`. Its header states that absence of a source must never be presented as a negative interaction screen or as evidence that a combination is safe. This is a preserved safety asset, not a missing implementation to be silently replaced.
- **Relevant SHAs:** fixed baseline `37f047a4`; closure snapshot `8d7e406c` (2026-11-17); source SHA in ledger `4e73130a`; Tool 039 reference baseline `5a87f3e5` (reference only); true-clean context `E:\p03-true-clean-20261118@37f047a4`; contaminated `2a647fda` excluded.
- **Original requirements / owner decisions:** closure ledger records D-C4, D-C5, D-CLIN, D-W18, D-P03. `TOOL-017-DEVELOPMENT-PROPOSALS.md` states **IMPLEMENTED — OWNER REVIEW PENDING — NOT ACCEPTED — NOT CLOSED**. No owner acceptance found.
- **Historical acceptance:** none. Recorded batch claims (17 files/50 tests PASS, i18n 63/63) are historical, not re-executed here.
- **Current owner:** R6.1 programme owner for gates/decisions; tool implementation owner for later authorized work. No explicit Tool 017 owner-acceptance decision found.

## B. Original and R6.1 Requirements

**Canonical denominator finding (explicit):** the official per-tool atomic requirement denominator for Tool 017 **cannot be fully recovered** from authoritative sources, so the 18-row closure register is **not** presented as the official acceptance denominator. Available sources: (a) the generic 18-row closure register (MD/CSV + B1b ledger) used as an **operational audit matrix only**; (b) system-wide canonical IDs in `tool-039-requirements.csv` (observed SHA `CB47C6A2B91E6F4BB3C2DD514B69F95D3BD469A1842F3C125891B1281C6F98B6`) and `REQUIREMENT-TRACEABILITY-MATRIX.md`, **engineering reference only**; (c) `R6.1-SYSTEM-REQUIREMENT-REGISTER.md`; (d) tool-specific proposals and i18n script. **Missing:** a per-tool atomic requirements CSV with owner-approved A/B/C dimensions for 017 and a tool-specific acceptance file. No denominator is invented; the 18 rows below are the best-available operational set, flagged as such.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| SPEC-R6.1-1.a/1.b/1.c, C-2, C-8 | `ENG-PIPELINE` | Compute via R6 pipeline path only (no UI-side engine logic) | APPLICABLE | `tool-017-drug-interaction-pipeline.ts` tracked: `drugInteractionInputSchema.tryParse` → engine → `DrugInteractionResultSchema.safeParse` → `createToolOutput` → `isToolOutput`; recorded E3 (17/50, 2026-11-17) | No per-tool canonical row; operational matrix only |
| SPEC-R6.1-1.e, SPEC-R6.1-2.b, ACC-R6.1-3.c, ACC-5.5.10 | `STATE-5` | Five states EMPTY/PARTIAL/INVALID/FULL/DEGRADED implemented honestly | APPLICABLE | `Tool017UiState` union in tracked contract/component; `evaluateDrugInteractionDraft()` always returns READY with fixed NOT_AVAILABLE result (static) | E3/E4 state proof absent; fixed-draft design limits state exercise |
| SPEC-R6.1-3.a, LAYER-GENIUS12-01…12 | `UI-GENIUS12` | GENIUS-12 fixed order present once (no hidden/duplicate boxes) + CORE-5 | APPLICABLE | `...genius.tsx` tracked, 12-box array, compact `[boxes[1],boxes[2],boxes[6],boxes[8],boxes[11]]` (static) | No DOM/E4 proof |
| SPEC-R6.1-3.d, SPEC-R6.1-6.b/6.c, ACC-5.5.6 | `I18N-PARITY` | AR/EN parity, required keys resolved, no contamination | APPLICABLE | i18n tracked; check script tracked; unit evidence tracked; recorded 63/63 PASS (2026-11-17) | Re-run NOT_RUN; recorded E3 not re-awarded |
| LAYER-GENIUS12-10, LAYER-20MAP-07 | `EXPORT-CSV` | Browser-only CSV export (no server/session identifier) | APPLICABLE | `buildDrugInteractionCsv` in tracked contract + genius export box (static) | No browser download proof |
| ACC-R6.1-3.a/b/c, G-1/G-2/G-3 | `TEST-FOCUSED` | Focused tests pass (pipeline/contract/component/i18n-evidence as applicable) | APPLICABLE | Pipeline test + engine test + dom test + i18n unit test all tracked; recorded in 17/50 batch run | Dedicated per-tool archived re-run NOT_RUN |
| ACC-R6.1-3.a | `BUILD-TSC` | tsc --noEmit and next build pass with route present | APPLICABLE | Historical clean-export record only (`8E7919BA…`, different env) | No archived artifact pinned to `37f047a4` |
| LAYER-20MAP-07, SPEC-R6.1-3.g | `PREVIEW-ROUTE` | Direct Preview route loads for tool (SSR/accessible) | APPLICABLE | Route file tracked; SSO-protected preview | Browser NOT_RUN |
| SPEC-R6.1-3.d, ACC-5.5.6 | `BROWSER-EN-AR` | EN and AR functional pass on Preview | APPLICABLE | i18n resource present (static) | Browser NOT_RUN |
| SPEC-R6.1-1.e, ACC-R6.1-3.c, ACC-5.5.10 | `BROWSER-5-STATES` | Five states exercised on Preview | APPLICABLE | Static state code only | Browser NOT_RUN |
| ACC-5.5.6, ACC-5.5.7, ACC-5.5.7-LEGIBILITY | `RTL-390` | Real Arabic RTL at 390px | APPLICABLE | `dir={isRtl ? 'rtl' : 'ltr'}` in component (static) | Device/browser NOT_RUN |
| ACC-R6.1-3.a, SPEC-R6.1-5.d | `CONSOLE-HYDRATION` | No Console errors or SSR/Hydration issues | APPLICABLE | — | Browser NOT_RUN |
| SPEC-R6.1-3.a, LAYER-DOMAIN-RULE | `NO-DUP-GENIUS` | No duplicate GENIUS-12 / no hidden box / no double shell | APPLICABLE | Static 12-box structure | DOM proof NOT_RUN |
| LAYER-CORE5-C4, LAYER-GENIUS12-09, SPEC-R6.1-2.f | `C4-SOURCES` | Specialist-approved sources/provenance or owner-approved N/A | APPLICABLE | `TOOL_017_SOURCES = []` in tracked contract; genius C4 box `not_available` pending review | D-C4 open — NOT_AVAILABLE |
| LAYER-CORE5-C5, LAYER-GENIUS12-12, SPEC-R6.1-5.g, ACC-R6.1-3.i | `C5-REFERRAL` | Specialist-approved referral/seek-care wording (AR/EN) | APPLICABLE | Inline static strings link DailyMed/FDA; D-C5 wording `referral_not_available` | D-C5 open — NOT_AVAILABLE |
| D-CLIN (no canonical atomic ID recovered) | `CLINICAL-REVIEW` | Clinical/model review sign-off as applicable | APPLICABLE | No sign-off found; genius marks `pending_medical_review` | **Original requirement ID not recoverable — explicit missing mapping**; D-CLIN open |
| SPEC-R6.1-4.f, SPEC-R6.1-6.d | `W18-HISTORY` | History/storage/sync per W18 decision | APPLICABLE | Box 11 `not_available`; rating is `session_only_not_saved` in genius | D-W18 open |
| SPEC-R6.1-1.b/1.c, C-4/C-6/C-8, P-03 | `P03-PIPELINE` | Shared R6 pipeline result-schema enforcement (if applicable) | APPLICABLE | Tracked pipeline has `safeParse` gate + `isToolOutput`; structural PASS in TC per C report; runtime-negative untracked | Ledger `NOT_IMPLEMENTED` stale vs committed gate; full clean-clone P-03 not closed |

**Counts:** canonical applicable (operational) = 18; justified N/A = 0; unmapped = 1 (`CLINICAL-REVIEW` original ID). Evidence distribution (B1b-verified): PASS(E3+)=3 (ENG-PIPELINE, I18N-PARITY, TEST-FOCUSED — all recorded, not re-run); PASS(<E3, E2)=3; PARTIAL=2; NOT_RUN=6; BLOCKED=1; NOT_AVAILABLE=3.

**Source authority conflict log:**
| Source | Location | Impact | Resolution required |
|---|---|---|---|
| Closure ledger snapshot | `8d7e406c`, 2026-11-17 | Historical PASS claims vs current HEAD | Treat as historical; no transfer |
| Tool 039 requirements CSV | `5a87f3e5`, `OWNER_ACCEPTED` rows | Could imply 017 acceptance | Reference only; never transfer owner decision |
| Generic 18-row register | closure ledgers | Could be mistaken for official denominator | Operational matrix only; no official per-tool denominator recovered |
| Engine fail-closed posture | `tool-017-drug-interaction.ts` vs proposals "IMPLEMENTED" | "Implemented" must not be read as real interaction screening | Preserve fail-closed; clarify capability contract |
| B1b embedded self-hash | line 352 `90524E2C…` vs observed `607D9993…` | Hash mismatch | Observed on-disk authority; original not edited |
| P03 ledger wording | `P03-PIPELINE NOT_IMPLEMENTED` vs tracked gate | Status understatement | Reconcile in authorized update |

## C. Existing Architecture and Implementation

| Exact path | Git status (`git ls-files -s` / `git status --porcelain`) | Role | Test file | Actual status |
|---|---|---|---|---|
| `app/smarttools/tool-017-drug-interaction/page.tsx` | tracked, clean (`447beb9a…`) | canonical route | — | present |
| `lib/tools/engines/tool-017-drug-interaction.ts` | tracked, clean (`263520d4…`) | fail-closed authoritative engine | `...test.ts` tracked (`384830fd…`) | static present |
| `lib/tools/schemas/tool-017-drug-interaction.ts` | tracked, clean (`fa037476…`) | Zod result contract (no input fields) | — | static present |
| `lib/tools/r6/tool-017-drug-interaction-pipeline.ts` | tracked, clean (`dc46dbec…`) | R6 pipeline, fail-closed envelope | `...pipeline.test.ts` tracked (`ddefaa61…`) | structural present |
| `lib/tools/r6/tool-017-drug-interaction-contract.ts` | tracked, clean (`61864b38…`) | draft evaluation/sources/CSV | — | static present |
| `components/tools/tool-017-drug-interaction.tsx` | tracked, clean (`a4865c23…`) | state UI + pipeline call | `...dom.test.tsx` tracked (`9116b023…`) | static present |
| `components/tools/tool-017-drug-interaction.genius.tsx` | tracked, clean (`8ec0d284…`) | GENIUS-12 / CORE-5 | — | static present |
| `i18n/tool-017-drug-interaction.json` | tracked, clean (`c511c0ba…`) | AR/EN copy | unit evidence tracked (`3ce0a2d7…`) | recorded E3, not re-run |
| `docs/…/tool-017-i18n-check.mjs` | tracked, clean (`cb1b1e0a…`) | parity script | — | present |

**Dependencies:** React client component; `useToolDisplayPreferences`; canonical `createToolSchema` / `createToolOutput` / `isToolOutput`; `requireTool`/`buildSeoLinks`; Zod; shared R6 shell. No Supabase/network/storage import observed in audited tool paths (external DailyMed/FDA links in the genius box are plain anchors, not API calls). Nothing was built, imported or executed.

## D. Math Engine and Equation Audit

- **No arithmetic model:** `checkDrugInteractions(_input?)` ignores input and returns a single fail-closed literal `{status:'NOT_AVAILABLE', reason:'NO_VERIFIED_INTERACTION_SOURCE'}`, validated by `DrugInteractionResultSchema.parse`. There is **no equation, variable, unit, conversion, boundary, precision or determinism surface to audit** — by design, not a defect.
- **Input-schema conflation (static):** `drugInteractionInputSchema = createToolSchema(DrugInteractionResultSchema)` — the pipeline's "input" guard is the **result** schema, so a payload of real drugs/substances cannot pass validation. Since the engine ignores input, the observable behavior is still a fail-closed `NOT_AVAILABLE`, but the tool cannot accept or screen a drug list until a verified interaction source is configured. This is an implementation limitation to be resolved by an owner/source decision, not by removing the fail-closed default.
- **Zero/negative/NaN/Infinity:** not applicable — no numeric input is consumed.
- **Result schema/purity:** output is strictly a two-literal object; provenance uses `confidence: null`, `dataQuality: 'not_assessed'` (honest). Engine and pipeline are pure (no I/O, clock, randomness, DB imports).
- **Tests run vs NOT_RUN:** `npx vitest run lib/tools/engines/tool-017-drug-interaction.test.ts` and `npx vitest run lib/tools/r6/tool-017-drug-interaction-pipeline.test.ts` — **NOT_RUN**. Static presence of tracked tests supports E2 only; historic E3 claims are not re-awarded.

## E. Pipeline and Schema Audit

Chain (static): `DrugInteractionResultSchema` (as input guard) → `tryParse(rawInput)` → `checkDrugInteractions(parsed.data)` → `DrugInteractionResultSchema.safeParse(engineResult)` → `buildDrugInteractionOutput` → `createToolOutput` → `isToolOutput` → `{ok:true,output}` / `{ok:false,error}`. Failure is fail-closed with no partial envelope. The component's `evaluateDrugInteractionDraft()` always constructs the fixed NOT_AVAILABLE draft (state READY) and calls `runDrugInteraction`, so the UI never presents a negative screen. **P-03 status:** structural gate committed/tracked and reported PASS in TC (C report); runtime-negative suite untracked (`NOT_RUN` in TC), so clean-clone P-03 closure is not established. No test was executed by this audit.

## F. AI and Intelligence Capabilities

- AI brain / prompt / model / provider / RAG / prediction: **NotApplicable** — no model or network call observed. The tool explicitly declines to give an interaction determination.
- Explanation: **Implemented (static)** via reason code `NO_VERIFIED_INTERACTION_SOURCE`, formula/assumptions boxes and `confidence_not_assessed`.
- Interaction screening / safety conclusion: **Unavailable** — no verified source wired; absence of source is never presented as safety (preserved asset).
- What-if / sensitivity: **NotApplicable** (marked `not_applicable` in genius boxes 5 and 6). Uncertainty: **Unavailable** (`confidence: null`).
- Safety/limits: **Implemented (static)**; **RuntimeVerified: No**. A button, anchor or source string is not proof of AI or runtime behavior.

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next action |
|---|---|---|---|---|---|---|---|---|
| C1 primary result + status/confidence | YES | YES | static (tracked genius) | NO | NO | box 2 `data-r6-core=c1`, `confidence_not_assessed` | no E3/E4 | DOM test |
| C2 how/assumptions/inputs | YES | YES | static | NO | NO | box 3, `box4_no_inputs` | no E3 | component test |
| C3 safety/red flags/referral | YES | partial static | static | NO | NO | box 7 DailyMed/FDA anchors, `referral_not_available` | D-C5 open | approved wording |
| C4 sources | YES | YES | `not_available` box | NO | NO | `TOOL_017_SOURCES = []`; box 9 `evidence_pending_review` | D-C4 open | approved pack / N-A |
| C5 next actions | YES | partial static | static | NO | NO | box 12 `c5_not_available`, `not_a_diagnosis` | D-C5 open | approved pack |
| Boxes 1–12 fixed order | YES | YES | static (tracked) | NO | NO | 12-box array in genius | no DOM proof | preview DOM check |
| Compact CORE-5 parity (C1 equal) | YES | static | static selector `[boxes[1],boxes[2],boxes[6],boxes[8],boxes[11]]` | NO | NO | 0-indexed boxes 2,3,7,9,12 | no E3 parity test | parity test |
| Non-applicable box states reason | YES | YES | static | NO | NO | `not_applicable` / `not_available` badges | no E4 | preview check |

## H. Dynamic Results and UI Maturity

- **Static inspection:** tracked component defines `Tool017UiState` five-value union; `uiState = evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state`; `data-r6-state` badge, `aria-live="polite"`, `dir` binding, compact/full toggle with `aria-pressed`. Because `evaluateDrugInteractionDraft()` is parameterless and always READY, EMPTY/PARTIAL/INVALID branches exist in the type but are not reachable from the current component path (static observation). No debounce timer is present in the audited 017 paths.
- **MVO:** a single honest "no verified source / not a safety claim" result is the minimum viable output; not independently verified.
- **Component test:** `...dom.test.tsx` tracked; **Integration test:** `...pipeline.test.ts` tracked. **True-Clean:** C report records tracked tests passing in the 339-suite at `37f047a4`; no dedicated per-tool archived log in this audit. **Browser E4:** NOT_RUN (SSO preview).
- Live recalculation, compact/full, keyboard and 390 px behavior are **static claims only**; no E3/E4 is claimed here.

## I. Cross-Tool and Data Integration

- No cross-tool result mapping is declared in the tracked 017 contract (genius box 8 shows `box8_none` plus navigation links to previous/next tools and `calculatedAt`). No payload transfer observed.
- Producer/consumer: engine → pipeline → component → genius; no evidence of any consumer reading 017 output outside the page. Error propagation is fail-closed (static). External DailyMed/FDA anchors are informational only. **W18 boundary:** rating is explicitly `session_only_not_saved`; no storage or cloud sync authorized/found.

## J. Safety, Sources and Privacy

- Safety posture is the strongest preserved asset: absence of a verified interaction source is never presented as a negative screen or as evidence of safety. No interaction result, dose or diagnosis is emitted.
- Validation: Zod at pipeline boundary (static). API/auth: no API route or auth code in audited tool paths (static). Data exposure/logging: no value logging observed statistically; browser console NOT_RUN. Storage: none observed; W18 open; rating session-only.
- Domain warnings/red flags/referral: inline static strings plus external regulatory anchors; D-C4 / D-C5 / D-CLIN unresolved. Clinical review is BLOCKED. No specialist sign-off claimed.

## K. Localization and Browser Maturity

- `i18n/tool-017-drug-interaction.json` tracked; recorded parity `I18N_PARITY OK 63/63 PASS` (2026-11-17, E3 record, not re-run). Planned re-run: `node node_modules/vitest/vitest.mjs run tests/unit/tool-017-i18n-evidence.test.ts` — **NOT_RUN**.
- EN/AR functional pass, RTL-390, console/hydration, no-duplicate-GENIUS and direct preview route: **NOT_RUN** (E0). E4 prerequisites unavailable: SSO-compliant session, preview pinned to `37f047a4`, Deployment ID. No browser claim made.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command (isolated) | Environment | Source SHA (observed, first 16) | Date | Actual result | Level | Reproducibility / validity | HEAD compatibility |
|---|---|---|---|---|---|---|---|---|---|---|
| E-017-01 | ENG-PIPELINE | `lib/tools/r6/tool-017-drug-interaction-pipeline.ts` | `node node_modules/vitest/vitest.mjs run lib/tools/r6/tool-017-drug-interaction-pipeline.test.ts` | deps-present repo | `DC46DBEC9E0537A5` | 2026-11-19 | **NOT_RUN** (tracked test; historic E3 recorded) | E3 (historic record) | not re-run | tracked at HEAD |
| E-017-02 | STATE-5 / UI | `components/tools/tool-017-drug-interaction.tsx` | `node node_modules/vitest/vitest.mjs run components/tools/tool-017-drug-interaction.dom.test.tsx` | deps-present repo | `A4865C23E40C418F` | 2026-11-19 | **NOT_RUN** | E2 | not reproducible | tracked at HEAD |
| E-017-03 | TEST-FOCUSED engine | `lib/tools/engines/tool-017-drug-interaction.test.ts` | `node node_modules/vitest/vitest.mjs run lib/tools/engines/tool-017-drug-interaction.test.ts` | deps-present repo | `263520D491FEE504` | 2026-11-19 | **NOT_RUN** | E2 | not reproducible | tracked at HEAD |
| E-017-04 | I18N-PARITY | `tests/unit/tool-017-i18n-evidence.test.ts` | `node node_modules/vitest/vitest.mjs run tests/unit/tool-017-i18n-evidence.test.ts` | deps-present repo | `3CE0A2D75412F1D7` | 2026-11-19 | **NOT_RUN** (historic 63/63 recorded) | E3 (historic record) | not re-run | tracked at HEAD |
| E-017-05 | BUILD-TSC | repository build config | `node node_modules/typescript/bin/tsc --noEmit --pretty false`; `node node_modules/next/dist/bin/next build` | clean worktree at target SHA, deps present, no installs | — | 2026-11-19 | **NOT_RUN** | E2 (historical claim) | not reproducible | no `37f047a4` artifact |
| E-017-06 | P03-PIPELINE | `lib/tools/r6/p03-runtime-negative-coverage.test.ts`, `lib/tools/r6/__p03-control.test.ts` | `node node_modules/vitest/vitest.mjs run lib/tools/r6/p03-runtime-negative-coverage.test.ts lib/tools/r6/__p03-control.test.ts` | `E:\MrXSteroid-main`, deps present | — | 2026-11-19 | **NOT_RUN** | E2 | not reproducible | untracked suite |
| E-017-07 | browser rows | preview URL | `curl -sS -o NUL -w "%{http_code}" <preview-url>` + authorized browser | accessible preview | — | 2026-11-19 | **NOT_RUN** | E0 | n/a | SSO blocked |
| E-017-08 | B1b evidence reuse | `retry-01/B1b-LEDGER-016-023.md` | read-only hash + row review | this audit | `607D9993572C384E9` | 2026-11-19 | reviewed, 18 rows | E5 (audit of evidence) | reproducible hash | observed on-disk |

No test, build, typecheck, lint, dev server, install or browser action was executed. Historical batch claims (17 files/50 tests) are recorded claims, not re-run evidence.

## M. Defect and Gap Register

**Implementation gaps**
| ID | Severity | Requirement | Exact file | Actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-017-1 | HIGH | `ENG-PIPELINE`, capability honesty | `lib/tools/r6/tool-017-drug-interaction-pipeline.ts` (`drugInteractionInputSchema = createToolSchema(DrugInteractionResultSchema)`) | Input guard is the result schema; no real drug payload can be accepted | Tool cannot screen interactions even after a source exists | schema reused as input guard | owner decision: define a real input schema alongside fail-closed result; do not remove fail-closed default | medium |
| I-017-2 | MEDIUM | `STATE-5` | `lib/tools/r6/tool-017-drug-interaction-contract.ts` (`evaluateDrugInteractionDraft()`) | Parameterless fixed READY draft vs honest EMPTY/PARTIAL/INVALID coverage | three states unreachable from current UI path | placeholder draft design | align draft evaluation with intended input model | low |
| I-017-3 | MEDIUM | `C4-SOURCES` | `lib/tools/r6/tool-017-drug-interaction-contract.ts` (`TOOL_017_SOURCES = []`) | Empty source registry vs required approved sources or N/A | row stays NOT_AVAILABLE | no approved pack | supply approved pack or owner-approved N/A | low |

**Evidence gaps**
| ID | Severity | Requirement | Exact file | Gap | Impact | Next action |
|---|---|---|---|---|---|---|
| V-017-1 | CRITICAL | `C4-SOURCES`, `C5-REFERRAL`, `CLINICAL-REVIEW`, `W18-HISTORY` | closure ledger rows 15–18 | D-C4/D-C5/D-CLIN/D-W18 open | 4 rows unresolved | owner decisions + evidence |
| V-017-2 | HIGH | 6 browser rows | preview URL | E4 NOT_RUN | 6 rows unresolved | authorized preview + capture |
| V-017-3 | HIGH | `BUILD-TSC` | build config | no artifact pinned to `37f047a4` | row PARTIAL | archive clean tsc/build |
| V-017-4 | HIGH | `ENG-PIPELINE`, `TEST-FOCUSED`, `I18N-PARITY` | tracked pipeline/engine/i18n unit tests | historic E3 not re-run this audit | E3 not re-awarded | isolated re-runs + logs |
| V-017-5 | MEDIUM | `P03-PIPELINE` | tracked pipeline / untracked negative suite | no committed runtime-negative proof | acceptance not closed | approval-gated clean-clone run |

## N. Development Maturity Matrix (S0–S11 per component)

Each component is evaluated independently across all twelve stages; a stage reached by one component is never transferred to another. `V` = static inspection (E2), `T` = E3 test evidence in-hand (recorded or run), `R` = E4 runtime, `O` = owner-accepted (E5), `—` = not reached, `P` = partial. S10/S11 are reported only from actual browser/owner evidence, never from a plan or proposal.

| Component | S0 | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Identity / registry | V | — | — | — | — | — | — | — | — | — | — | — | S0 | S1 | no per-tool denominator |
| Requirements | — | P | — | — | — | — | — | — | — | — | — | — | S1 (partial) | S2 | official denominator missing |
| Architecture | — | — | V | — | — | — | — | — | — | — | — | — | S2 | S3 | input-schema conflation |
| Math engine | — | — | — | V | — | — | — | — | — | — | — | — | S3 (fail-closed by design) | S4 (E3 engine test) | NOT_RUN |
| Pipeline / schema | — | — | — | — | V | — | — | — | — | — | — | — | S4 (structural, historic E3) | S5 (tracked E3 re-run) | re-run not archived |
| UI / state | — | — | — | — | — | V | — | — | — | — | — | — | S5 (static) | S6 (component E3) | fixed READY draft |
| AI / CORE-5 / GENIUS-12 | — | — | — | — | — | — | V | — | — | — | — | — | S6 (static, no AI) | S7 (DOM E3) | no DOM test |
| Cross-tool / safety | — | — | — | — | — | — | — | V | — | — | — | — | S7 (static fail-closed) | S8 | D-C4/C5/CLIN/W18 open |
| Testing | — | — | — | — | — | — | — | — | P | — | — | — | S8 (partial, tracked) | S9 | no current-HEAD re-run |
| True-clean | — | — | — | — | — | — | — | — | — | — | — | — | S0 only | S1 true-clean per-tool log | TC 339-suite only |
| Browser | — | — | — | — | — | — | — | — | — | — | — | — | S0 only (no E4) | S1 browser | SSO / unavailable |
| External / owner | — | — | — | — | — | — | — | — | — | — | — | — | S0 only — no owner acceptance | S1 | owner step; never from a plan |

Engine S9 is not transferred to browser S0, and vice versa; no component reaches S10/S11.

## O. Comparison with Tool 039 (applicable engineering criteria only)

Tool 039 is an engineering reference, never one of the 29 audited tools. Its `OWNER_ACCEPTED` rows and D-08 local-device storage exception are **not transferred**. No similarity score is computed.

| Dimension | Status | Engineering reason | Action |
|---|---|---|---|
| Architecture | PARTIALLY_APPLICABLE | Same registry → component → schema → pipeline → engine → envelope layering; 017 input guard reuses the result schema, unlike 039's distinct input schema | Preserve layering; Fix input guard |
| Engine | APPLICABLE | Both pure deterministic modules; 017 intentionally returns NOT_AVAILABLE, 039 computes active results — different intended use | Preserve fail-closed posture |
| Validation | PARTIALLY_APPLICABLE | Both have result Zod guard + `isToolOutput`; 017 input schema is conflated with result schema | Fix (separate input contract) |
| AI | NOT_APPLICABLE | No model in either; 039 no-AI contract is reference | Preserve as non-AI benchmark |
| Dynamic Results | PARTIALLY_APPLICABLE | 5-state union exists but current draft is fixed READY; no E3/E4 | Extend |
| CORE-5 | PARTIALLY_APPLICABLE | Compact mapping matches 039 reference (boxes 2,3,7,9,12) but parity untested | Preserve mapping; Extend proof |
| GENIUS-12 | PARTIALLY_APPLICABLE | 12 ordered boxes static in both; 017 C4 empty and C3 pending review | Preserve order; Fix sources |
| Cross-Tool | NOT_APPLICABLE | 017 declares no mapped cross-tool fields (039 declares three) — different integration scope | Preserve boundary |
| Safety | APPLICABLE | Both avoid diagnosis/safety claims; 017 additionally refuses interaction determination without a source | Preserve |
| Testing | NOT_VERIFIED | Tracked suites exist but none re-run here; 039 historic E3/E4 not transferable | Fix (authorized isolated re-runs) |
| Browser — current-HEAD E4 | NOT_AVAILABLE | No preview pinned to `37f047a4` with Deployment ID; SSO gate not met | Extend after gate |
| Browser — historic artifact transfer | NOT_VERIFIED | Historic preview records exist but not pinned to fixed baseline | Preserve as history only |

## P. Next Development Tasks (proposals only — no implementation in this audit)

| # | Exact file | Proposed change | Required tests | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| 1 | `lib/tools/r6/tool-017-drug-interaction-pipeline.ts`, `lib/tools/schemas/tool-017-drug-interaction.ts` | define a distinct input schema while preserving fail-closed `NOT_AVAILABLE` result | isolated pipeline re-run + negative test | owner/source decision | medium | honest input boundary | no real payload silently accepted as "safe" |
| 2 | `lib/tools/r6/tool-017-drug-interaction-contract.ts` | align `evaluateDrugInteractionDraft()` with the input model | component test | task 1 | low | reachable 5 states | E3 state assertions |
| 3 | `lib/tools/r6/tool-017-drug-interaction-contract.ts` | populate `TOOL_017_SOURCES` or record approved N/A | source-link test + owner decision | D-C4 owner | medium | C4 resolvable | approved pack or signed N/A |
| 4 | tracked pipeline/engine/i18n unit tests | archive isolated re-run logs at `37f047a4` | `node node_modules/vitest/vitest.mjs run lib/tools/r6/tool-017-drug-interaction-pipeline.test.ts` etc. | deps-present env | low | current-HEAD E3 | PASS logs at `37f047a4` |
| 5 | D-C4/C5/CLIN/W18 owners | supply approved source/referral/clinical/history decisions | n/a | owner decisions | medium | unresolved rows closed | recorded approvals |

Shared-component changes (if any) require a separate Change Impact Matrix before implementation.

## Q. Current Tool Decision

**Decision: REPAIR.** Completion = `100 × 3 / 18 = 16.67%` (PASS(E3+) 3 of 18 applicable **operational** rows; the three PASS rows are historically recorded E3, not re-run by this audit; PASS(<E3) rows do not count; `NOT_AVAILABLE ≠ NOT_APPLICABLE`; unresolved rows block 100%). The fail-closed engine, fully tracked artifact set and recorded i18n parity are preserved assets — the "no verified source" posture must not be replaced by an unsourced interaction result. Blocking gaps: input/result schema conflation, fixed READY draft limiting honest states, open D-C4/D-C5/D-CLIN/D-W18, no current-HEAD isolated re-runs, no clean-clone P-03 runtime-negative proof, and no E4. The official per-tool denominator is unrecoverable, so this percentage is operational only. **No owner acceptance is implied, claimed or transferred** (Tool 039's `OWNER_ACCEPTED` status belongs to Tool 039 only; proposals state Tool 017 is NOT ACCEPTED / NOT CLOSED).

## Integrity note

The SHA-256 below is computed over all bytes of this file preceding the final hash line. Because that line is added after hashing, the whole-file SHA-256 differs by construction; the recorded body hash is the reproducible content fingerprint and is authoritative for this audit. The whole-file value is reported in the delivery response. No original source was edited to "fix" a hash.

Observed on-disk SHA-256 (body before this line): `B6551B43D35FB62C7557FEFA99A94B4AB99A669EB22111847E0D2D3E02EAEE84`
