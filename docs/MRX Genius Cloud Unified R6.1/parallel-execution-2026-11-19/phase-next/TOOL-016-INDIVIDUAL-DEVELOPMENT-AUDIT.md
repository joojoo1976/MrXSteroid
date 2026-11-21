# TOOL 016 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `016` · `mrx.tool.016-half-life-calculator` |
| Canonical name / slug | `Half-Life Calculator` / `tool-016-half-life-calculator` |
| Category | `pharmacokinetics` (registry `href`) — closure ledger says `cycle-management` (conflict logged in §B) |
| Canonical route | `/smarttools/pharmacokinetics/tool-016-half-life-calculator` (registry); closure-ledger URL `/smarttools/cycle-management/tool-016-half-life-calculator` |
| Batch | Batch 3 (closure ledger) |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`, dirty worktree preserved) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation. No code, contract, schema, ledger, git, build, test, server or browser writes/executions. |
| Primary evidence reuse | `retry-01/B1b-LEDGER-016-023.md` — observed on-disk SHA-256 `607D9993572C384E946DD34EA841F79C3B033FE5BAE58ADF7BBB0C74CDB50F82` (verified this audit; reused, not redone) |
| Source register | `closure-sprint-2026-11-17/tool-016-closure-ledger.md` — observed SHA-256 `3777533979F6C7CFD14EB463AA2AF6F265147C680B02E2A74F015F8C34DEC9E2` (verified); CSV index blob `2ce4c01087f2e1e6b25855c49c4f3ee8491bc128` |
| Supporting refs | `TOOL-016-DEVELOPMENT-PROPOSALS.md`; `tool-016-i18n-check.mjs` (index blob `0a8ea705ebfbf087d72d9ba590804e89ee745c47`); governing plan observed SHA-256 `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9` |
| Tool 039 reference | `R6.1-TOOL-039-ENGINEERING-REFERENCE-PROFILE.md` — observed SHA-256 `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` (reference only, never one of the 29) |
| Tool decision | **REPAIR** — 1/18 = 5.56% verified (operational matrix); no owner acceptance implied |

Scope/preservation: read-only inspection plus this one new documentation file. The fixed baseline is `E:\MrXSteroid-main` at `37f047a4` with a dirty worktree (384 entries observed at audit start, preserved unchanged). True-clean ref `E:\p03-true-clean-20261118@37f047a4` is the reference for "true-clean"; contaminated `2a647fda` is excluded. No test, build, typecheck, lint, install, dev server, browser or runtime E4 action was executed by this audit. Absent executions are recorded as `NOT_RUN` with exact isolated commands.

Evidence ladder: E0 none; E1 assertion; E2 file/static code; E3 reproducible test; E4 authorized runtime/browser; E5 independent audit. Only E3+ counts as PASS in the completion formula. `NOT_AVAILABLE ≠ NOT_APPLICABLE`.

## A. Tool Identity and Historical Lineage

- **Identity (registry, observed):** `lib/tools/registry.ts:57` — `toolId mrx.tool.016-half-life-calculator`, slug `tool-016-half-life-calculator`, version `1.0.0`, `page Page.HALF_LIFE_CALCULATOR`, `href /smarttools/pharmacokinetics/tool-016-half-life-calculator`, titleEn `Half-Life Calculator`, titleAr `حاسبة نصف العمر`, `accessTier free`, `order 300`, `stackStatus layered`. Route file `app/smarttools/tool-016-half-life-calculator/page.tsx` is tracked (index blob `6cf9a04edc02f89ffbcb9c3206bfd3597146136b`), clean. A separate legacy tool `tool-016-libido-calculator` exists; it is **not** the audited tool.
- **Implementation paths (observed):** engine `lib/tools/engines/tool-016-half-life-calculator.ts` (tracked, blob `8c417bcbd9defe1f13f2fae4b26e3db89241aa31`); schema `lib/tools/schemas/tool-016-half-life-calculator.ts` (tracked, `5cd2df25c8909b4d0b76792ec6674684f4083774`); pipeline `lib/tools/r6/tool-016-half-life-pipeline.ts` (tracked, `a6bbb7ce0d2a5ea8736d21a8d96b7244a09345f1`); contract `lib/tools/r6/tool-016-half-life-contract.ts` (tracked, `8db1abc95b47a7a23ed3b7b9a733430e7106f7b4`); adapter `lib/tools/adapters/tool-016-half-life-calculator.ts` (tracked, `c191870425855bf1d00e68da191f24bee032f629`); component `components/tools/tool-016-half-life-calculator.tsx` (tracked, `1553c9e9fe97ebbc471a42fc1d030f942530408e`), genius `...genius.tsx` (tracked, `fd977f1049576ac8cb825c8fb3c04a0abf746b33`), dom test (tracked, `ea30b165ddb4209074f5afdbb69dff7667166125`); i18n `i18n/tool-016-half-life-calculator.json` (tracked, `5c9de976d00da267832db7551b1a99f9757483ea`); unit i18n evidence `tests/unit/tool-016-i18n-evidence.test.ts` (tracked, `2c94f8a0d16177d971112ff423eb8ca682bc60cb`). Pipeline test `lib/tools/r6/tool-016-half-life-pipeline.test.ts` is **untracked**.
- **Historical start / engine intent:** the V6 engine is a deterministic single-exponential elimination *scenario* calculator (`SINGLE_EXPONENTIAL_ELIMINATION_SCENARIO`) with explicit assumptions `constant_half_life`, `independent_items`, `not_clinical`; its header states it is not a drug-specific pharmacokinetic model, washout recommendation, or PCT timing estimate. This honest posture is a preserved asset.
- **Relevant SHAs:** fixed baseline `37f047a4`; closure snapshot `8d7e406c` (2026-11-17); source SHA in ledger `82798e4e/2b637ae8`; Tool 039 reference baseline `5a87f3e5` (reference only, not transferable); true-clean context `E:\p03-true-clean-20261118@37f047a4`; contaminated `2a647fda` excluded.
- **Original requirements / owner decisions:** the closure ledger records D-C4 (sources), D-C5 (referral), D-CLIN (clinical review), D-W18 (history/storage), D-P03 (result-schema). `TOOL-016-DEVELOPMENT-PROPOSALS.md` states **IMPLEMENTED — OWNER REVIEW PENDING — NOT ACCEPTED — NOT CLOSED**. No owner acceptance of Tool 016 was found.
- **Historical acceptance:** none. Closure/i18n claims are historical records at `8d7e406c` and were not re-executed by this audit.
- **Current owner:** R6.1 programme owner for gates/decisions; tool implementation owner for later authorized repair. No explicit Tool 016 owner-acceptance decision found.

## B. Original and R6.1 Requirements

**Canonical denominator finding (explicit):** the official per-tool atomic requirement denominator for Tool 016 **cannot be fully recovered** from authoritative sources, and therefore the 18-row closure register is **not** presented as the official acceptance denominator. What exists is (a) the generic 18-row closure register (closure ledger MD/CSV + B1b ledger), used here strictly as an **operational audit matrix**; (b) system-wide canonical IDs in `tool-039-requirements.csv` (observed SHA `CB47C6A2B91E6F4BB3C2DD514B69F95D3BD469A1842F3C125891B1281C6F98B6`) and `REQUIREMENT-TRACEABILITY-MATRIX.md`, which are **engineering reference only**; (c) system/platform requirements in `R6.1-SYSTEM-REQUIREMENT-REGISTER.md`; (d) tool-specific proposals and i18n script. **Missing:** a per-tool atomic requirements CSV with owner-approved A/B/C dimensions for 016 and a tool-specific acceptance file. No denominator is invented; the canonical denominator differs from a verified official denominator because none is recoverable — the 18 rows below are the best-available operational set, flagged as such.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| SPEC-R6.1-1.a/1.b/1.c, C-2, C-8 | `ENG-PIPELINE` | Compute via R6 pipeline path only (no UI-side engine logic) | APPLICABLE | `tool-016-half-life-pipeline.ts` tracked: `r6RunHalfLife` → `r6HalfLifeInputSchema.tryParse` → engine → `HalfLifeResultSchema.safeParse` → `createToolOutput` → `isToolOutput`; component calls pipeline only (static) | No per-tool canonical row; operational matrix only |
| SPEC-R6.1-1.e, SPEC-R6.1-2.b, ACC-R6.1-3.c, ACC-5.5.10 | `STATE-5` | Five states EMPTY/PARTIAL/INVALID/FULL/DEGRADED implemented honestly | APPLICABLE | `Tool016UiState` union and branches in tracked component + `evaluateHalfLifeDraft` in tracked contract (static) | E3/E4 state proof absent |
| SPEC-R6.1-3.a, LAYER-GENIUS12-01…12, LAYER-5IN12-* | `UI-GENIUS12` | GENIUS-12 fixed order present once (no hidden/duplicate boxes) + CORE-5 | APPLICABLE | `tool-016-half-life-calculator.genius.tsx` tracked, 12-box array, compact `[boxes[1],boxes[2],boxes[6],boxes[8],boxes[11]]` (static) | No DOM/E4 proof |
| SPEC-R6.1-3.d, SPEC-R6.1-6.b/6.c, ACC-5.5.6 | `I18N-PARITY` | AR/EN parity, required keys resolved, no contamination | APPLICABLE | i18n JSON tracked; `tool-016-i18n-check.mjs` tracked; unit evidence `tests/unit/tool-016-i18n-evidence.test.ts` tracked; recorded 129/129 PASS (2026-11-17) | Re-run NOT_RUN; recorded E3 not re-awarded |
| LAYER-GENIUS12-10, LAYER-20MAP-07 | `EXPORT-CSV` | Browser-only CSV export (no server/session identifier) | APPLICABLE | `buildHalfLifeCsv` in tracked contract; genius export box (static) | No browser download proof |
| ACC-R6.1-3.a/b/c, G-1/G-2/G-3 | `TEST-FOCUSED` | Focused tests pass (pipeline/contract/component/i18n-evidence as applicable) | APPLICABLE | Engine test, adapter test, dom test and i18n unit test tracked; pipeline test **untracked** | No current-HEAD isolated run; focused battery not consolidated |
| ACC-R6.1-3.a | `BUILD-TSC` | tsc --noEmit and next build pass with route present | APPLICABLE | Historical clean-export record only (`8E7919BA…`, different env) | No archived artifact pinned to `37f047a4` |
| LAYER-20MAP-07, SPEC-R6.1-3.g | `PREVIEW-ROUTE` | Direct Preview route loads for tool (SSR/accessible) | APPLICABLE | Route file tracked; SSO-protected preview | Browser NOT_RUN; canonical-route conflict also unresolved |
| SPEC-R6.1-3.d, ACC-5.5.6 | `BROWSER-EN-AR` | EN and AR functional pass on Preview | APPLICABLE | i18n resource present (static) | Browser NOT_RUN |
| SPEC-R6.1-1.e, ACC-R6.1-3.c, ACC-5.5.10 | `BROWSER-5-STATES` | Five states exercised on Preview | APPLICABLE | Static state code only | Browser NOT_RUN |
| ACC-5.5.6, ACC-5.5.7, ACC-5.5.7-LEGIBILITY | `RTL-390` | Real Arabic RTL at 390px | APPLICABLE | `dir={isRtl ? 'rtl' : 'ltr'}` in component (static) | Device/browser NOT_RUN |
| ACC-R6.1-3.a, SPEC-R6.1-5.d | `CONSOLE-HYDRATION` | No Console errors or SSR/Hydration issues | APPLICABLE | — | Browser NOT_RUN |
| SPEC-R6.1-3.a, LAYER-DOMAIN-RULE | `NO-DUP-GENIUS` | No duplicate GENIUS-12 / no hidden box / no double shell | APPLICABLE | Static 12-box structure; registry not in `R6_EXEMPT_SLUGS` (generic shell expected) | DOM proof NOT_RUN |
| LAYER-CORE5-C4, LAYER-GENIUS12-09, SPEC-R6.1-2.f | `C4-SOURCES` | Specialist-approved sources/provenance or owner-approved N/A | APPLICABLE | `TOOL_016_SOURCES` is an empty array in tracked contract | D-C4 open — NOT_AVAILABLE |
| LAYER-CORE5-C5, LAYER-GENIUS12-12, SPEC-R6.1-5.g, ACC-R6.1-3.i | `C5-REFERRAL` | Specialist-approved referral/seek-care wording (AR/EN) | APPLICABLE | Inline static strings only | D-C5 open — NOT_AVAILABLE |
| D-CLIN (no canonical atomic ID recovered) | `CLINICAL-REVIEW` | Clinical/model review sign-off as applicable | APPLICABLE | No sign-off found | **Original requirement ID not recoverable — explicit missing mapping**; D-CLIN open |
| SPEC-R6.1-4.f, SPEC-R6.1-6.d, LAYER-GENIUS12-11/12-RATING | `W18-HISTORY` | History/storage/sync per W18 decision | APPLICABLE | Box 11 `not_available`; no storage in audited paths | D-W18 open; D-08 Tool-039 exception not transferred |
| SPEC-R6.1-1.b/1.c, C-4/C-6/C-8, P-03 | `P03-PIPELINE` | Shared R6 pipeline result-schema enforcement (if applicable) | APPLICABLE | Tracked pipeline has `safeParse` gate + `isToolOutput`; structural PASS in TC per C report; runtime-negative untracked | Ledger `NOT_IMPLEMENTED` stale vs committed gate; full clean-clone P-03 not closed |

**Counts:** canonical applicable (operational) = 18; justified N/A = 0; unmapped = 1 (`CLINICAL-REVIEW` original ID). Evidence distribution (B1b-verified): PASS(E3+)=1 (I18N-PARITY, recorded not re-run); PASS(<E3, E2)=4; PARTIAL=3; NOT_RUN=6; BLOCKED=1; NOT_AVAILABLE=3.

**Source authority conflict log:**
| Source | Location | Impact | Resolution required |
|---|---|---|---|
| Registry route vs closure ledger route | `lib/tools/registry.ts:57` (`pharmacokinetics`) vs ledger line 4/8 (`cycle-management`) | Canonical URL ambiguity; affects PREVIEW-ROUTE | Owner decision on canonical category; no code/ledger edit here |
| Closure ledger snapshot | `8d7e406c`, 2026-11-17 | Historical PASS claims vs current HEAD | Treat as historical; no transfer |
| Tool 039 requirements CSV | `5a87f3e5`, `OWNER_ACCEPTED` rows | Could imply 016 acceptance | Reference only; never transfer owner decision |
| Generic 18-row register | closure ledgers | Could be mistaken for official denominator | Operational matrix only; no official per-tool denominator recovered |
| B1a/B1b embedded self-hash | B1b line 352 `90524E2C…` vs observed `607D9993…` | Hash mismatch | Observed on-disk authority; original not edited |
| P03 ledger wording | `P03-PIPELINE NOT_IMPLEMENTED` vs tracked gate | Status understatement | Reconcile in authorized update |

## C. Existing Architecture and Implementation

| Exact path | Git status (`git ls-files -s` / `git status --porcelain`) | Role | Test file | Actual status |
|---|---|---|---|---|
| `app/smarttools/tool-016-half-life-calculator/page.tsx` | tracked, clean (`6cf9a04e…`) | canonical route | — | present |
| `lib/tools/engines/tool-016-half-life-calculator.ts` | tracked, clean (`8c417bcb…`) | pure authoritative engine | `...test.ts` tracked (`11a38745…`) | static present |
| `lib/tools/schemas/tool-016-half-life-calculator.ts` | tracked, clean (`5cd2df25…`) | Zod input/output contract | — | static present |
| `lib/tools/r6/tool-016-half-life-pipeline.ts` | tracked, clean (`a6bbb7ce…`) | R6 pipeline, fail-closed envelope | `...pipeline.test.ts` **untracked** | structural present |
| `lib/tools/r6/tool-016-half-life-contract.ts` | tracked, clean (`8db1abc9…`) | limits/sources/CSV/cross-tool | — | static present |
| `lib/tools/adapters/tool-016-half-life-calculator.ts` | tracked, clean (`c1918704…`) | V6 adapter | `...test.ts` tracked (`f197b0f1…`) | static present |
| `components/tools/tool-016-half-life-calculator.tsx` | tracked, clean (`1553c9e9…`) | 5-state UI + pipeline call | `...dom.test.tsx` tracked (`ea30b165…`) | static present |
| `components/tools/tool-016-half-life-calculator.genius.tsx` | tracked, clean (`fd977f10…`) | GENIUS-12 / CORE-5 | — | static present |
| `i18n/tool-016-half-life-calculator.json` | tracked, clean (`5c9de976…`) | AR/EN copy | unit evidence tracked (`2c94f8a0…`) | recorded E3, not re-run |
| `docs/…/tool-016-i18n-check.mjs` | tracked, clean (`0a8ea705…`) | parity script | — | present |

**Dependencies:** React client component; `useToolDisplayPreferences`; canonical `createToolSchema` / `createToolOutput` / `isToolOutput`; `requireTool`/`buildSeoLinks`; Zod; shared R6 shell. No Supabase/network/storage import observed in audited tool paths. Nothing was built, imported or executed.

## D. Math Engine and Equation Audit

- **Equation (static):** `elapsedDays = half_life_days × ln(remaining_percent / 100) / ln(0.5)` for each compound; result is `status CALCULATED`, `model SINGLE_EXPONENTIAL_ELIMINATION_SCENARIO`, assumptions `['constant_half_life','independent_items','not_clinical']`. Engine calls `HalfLifeInputSchema.parse(rawInput)` and `HalfLifeResultSchema.parse(...)` (double guard).
- **Variables/units:** `half_life_days` positive finite ≤ 1,000,000; `remaining_percent` finite > 0 and < 100; compounds 1–12; name 1–80 chars; source 5–500 chars. Unit is days only; no conversion is performed (`R6_HALF_LIFE_RESULT_UNIT = 'day'`; convert-once rule satisfied because there is only one unit).
- **Zero/negative/NaN/Infinity:** non-finite, zero and negative inputs are rejected by Zod at engine and pipeline boundaries (static). Empty strings are not coerced to zero by the contract's `numeric()` helper.
- **Boundaries/precision/determinism:** `remaining_percent` strictly inside (0,100) excludes the `ln(0)` boundary; `elapsed_days` is finite positive for valid inputs. No rounding is applied in the engine (full precision); formatting via `formatDays(value).toFixed(2)` is UI-only. Engine is pure (no I/O, clock, randomness, React/DOM, DB imports). Contract mirrors the equation in `mirroredElapsedDays`, but a sync test proving mirror agreement was not found in the tracked set.
- **Result schema/purity:** output is strictly validated; provenance records `confidence: 1`, `dataQuality: 'high'` and a `referenceRange` — an assertion that is not independently calibrated (E1 claim, not runtime proof).
- **Tests run vs NOT_RUN:** `npx vitest run lib/tools/engines/tool-016-half-life-calculator.test.ts` — **NOT_RUN** (no execution authorized). Static presence of the tracked engine test supports E2 only.

## E. Pipeline and Schema Audit

Chain (static): `HalfLifeInputSchema` → `createToolSchema` → `r6HalfLifeInputSchema.tryParse(rawInput)` → `calculateHalfLife` → `HalfLifeResultSchema.safeParse(engineResult)` → `r6BuildHalfLifeOutput` → `createToolOutput` → `isToolOutput` → `{ok:true,output}` / `{ok:false,error}`. Every failure branch is fail-closed with no partial envelope. Timestamps/locale/unit/snapshot type are caller-injected. **P-03 status:** structural result-schema gate is committed/tracked and reported PASS in TC (32 files/339 tests, `37f047a4`, per C report); the focused pipeline test is **untracked**, and runtime-negative/control suites are untracked (`NOT_RUN` in TC), so clean-clone P-03 closure is not established. No test was executed by this audit.

## F. AI and Intelligence Capabilities

- AI brain / prompt / model / provider / RAG / embedding: **NotApplicable** — no model or network call observed in engine, pipeline or contract (static inspection).
- Explanation: **Implemented (static)** via fixed model/assumptions/keyFindings; what-if: **Implemented (static)** in genius `runProbe`-style scenario recomputation through the same pipeline; prediction: **NotApplicable** (explicit `not_clinical` scenario model, no forecasting claim).
- Uncertainty: **Unavailable** — provenance sets `confidence: 1` / `dataQuality: 'high'` without a calibration artifact; no published confidence interval found. Safety/limits: **Implemented (static)**; **RuntimeVerified: No**.
- A button, source string or what-if control is not proof of AI or runtime behavior; no AI runtime claim is made.

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next action |
|---|---|---|---|---|---|---|---|---|
| C1 primary result + unit/range/confidence | YES | YES | static (tracked genius) | NO | NO | box 2 `data-r6-core=c1` | no E3/E4 | track + DOM test |
| C2 how/assumptions/inputs | YES | YES | static | NO | NO | box 3, contract limits/assumptions | no E3 | component test |
| C3 safety/red flags/referral | YES | partial static | static | NO | NO | inline `not_clinical` strings | D-C5 open | approved wording |
| C4 sources | YES | YES | **empty source array** | NO | NO | `TOOL_016_SOURCES = []` | D-C4 open | approved pack / N-A |
| C5 next actions | YES | partial static | static | NO | NO | inline guidance | D-C5 open | approved pack |
| Boxes 1–12 fixed order | YES | YES | static (tracked) | NO | NO | 12-box array in genius | no DOM proof | preview DOM check |
| Compact CORE-5 parity (C1 equal) | YES | static | static selector `[boxes[1],boxes[2],boxes[6],boxes[8],boxes[11]]` | NO | NO | 0-indexed boxes 2,3,7,9,12 | no E3 parity test | parity test |
| Non-applicable box states reason | YES | YES | static | NO | NO | `not_available`/`not_applicable` badges | no E4 | preview check |

Ordering/visibility/compact-full parity are static observations only.

## H. Dynamic Results and UI Maturity

- **Static inspection:** tracked component defines a five-value `Tool016UiState` (`EMPTY`/`PARTIAL`/`INVALID`/`FULL`/`DEGRADED`) with `evaluateHalfLifeDraft` → `r6RunHalfLife` → `uiState` mapping (`FULL` only when `run.ok`, else `DEGRADED`); `data-r6-state` badge, `dir` binding, `aria-label`/`aria-invalid`, responsive classes, compact/full toggle with `aria-pressed`. **No debounce timer** is present in the audited 016 paths; recomputation is memoized on draft change (`useMemo`).
- **MVO:** domain-specific "remaining percent / elapsed days" scenario is the minimum viable output; not independently verified.
- **Component test:** `components/tools/tool-016-half-life-calculator.dom.test.tsx` is **tracked**; **Integration test:** pipeline test **untracked**. **True-Clean:** no current-HEAD focused per-tool log in this audit scope. **Browser E4:** NOT_RUN (SSO preview, unavailable).
- Live recalculation, compact/full, keyboard and 390 px behavior are **static claims only**; no E3/E4 is claimed here.

## I. Cross-Tool and Data Integration

- Tracked contract declares one cross-tool link: 016 → `tool-034-compound-clearance`, mapped field `half_life_days`, freshness rule "both tools use the same half-life value", `transfer: 'manual-reentry'`. No payload transfer or prefill observed.
- Producer/consumer: engine → pipeline → component → genius; no evidence of any consumer reading 016 output outside the page. Error propagation is fail-closed (static). **W18 boundary:** no session/cloud/shared-sync authorization; no storage layer found in audited paths.

## J. Safety, Sources and Privacy

- Safety posture: non-clinical scenario model with explicit `not_clinical` assumption; no dose suggestion, no diagnosis. This is a preserved asset.
- Validation: Zod at engine + pipeline + contract draft boundary (static). API/auth: no API route or auth code in audited tool paths (static). Data exposure/logging: no value logging observed statically; browser console NOT_RUN. Storage: none observed; W18 open.
- Domain warnings/red flags/referral: inline static patterns only; D-C4 / D-C5 / D-CLIN unresolved. Clinical review is BLOCKED. No specialist sign-off claimed.

## K. Localization and Browser Maturity

- `i18n/tool-016-half-life-calculator.json` tracked; recorded parity `I18N_PARITY OK 129/129 PASS` (2026-11-17, E3 record, not re-run). Planned re-run: `node node_modules/vitest/vitest.mjs run tests/unit/tool-016-i18n-evidence.test.ts` — **NOT_RUN**.
- EN/AR functional pass, RTL-390, console/hydration, no-duplicate-GENIUS and direct preview route: **NOT_RUN** (E0). E4 prerequisites unavailable: SSO-compliant session, preview pinned to `37f047a4`, recorded Deployment ID. No browser claim made. Canonical route conflict (§B) additionally blocks a single definitive PREVIEW-ROUTE target.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command (isolated) | Environment | Source SHA (observed, first 16) | Date | Actual result | Level | Reproducibility / validity | HEAD compatibility |
|---|---|---|---|---|---|---|---|---|---|---|
| E-016-01 | ENG-PIPELINE | `lib/tools/r6/tool-016-half-life-pipeline.ts` | `node node_modules/vitest/vitest.mjs run lib/tools/r6/tool-016-half-life-pipeline.test.ts` | deps-present repo (clean clone preferred) | `A6BBB7CE0D2A5EA8` | 2026-11-19 | **NOT_RUN** (test file untracked) | E2 | not reproducible this phase | static at HEAD |
| E-016-02 | STATE-5 / UI | `components/tools/tool-016-half-life-calculator.tsx` | `node node_modules/vitest/vitest.mjs run components/tools/tool-016-half-life-calculator.dom.test.tsx` | deps-present repo | `1553C9E9FE97EBBC` | 2026-11-19 | **NOT_RUN** | E2 | not reproducible | tracked at HEAD |
| E-016-03 | TEST-FOCUSED engine | `lib/tools/engines/tool-016-half-life-calculator.test.ts` | `node node_modules/vitest/vitest.mjs run lib/tools/engines/tool-016-half-life-calculator.test.ts` | deps-present repo | `8C417BCBD9DEFE1F` | 2026-11-19 | **NOT_RUN** | E2 | not reproducible | tracked at HEAD |
| E-016-04 | I18N-PARITY | `tests/unit/tool-016-i18n-evidence.test.ts` | `node node_modules/vitest/vitest.mjs run tests/unit/tool-016-i18n-evidence.test.ts` | deps-present repo | `2C94F8A0D16177D9` | 2026-11-19 | **NOT_RUN** (historical 129/129 recorded) | E3 (historic record) | not re-run | tracked at HEAD |
| E-016-05 | BUILD-TSC | repository build config | `node node_modules/typescript/bin/tsc --noEmit --pretty false`; `node node_modules/next/dist/bin/next build` | clean worktree at target SHA, deps present, no installs | — | 2026-11-19 | **NOT_RUN** | E2 (historical claim) | not reproducible | no `37f047a4` artifact |
| E-016-06 | P03-PIPELINE | `lib/tools/r6/p03-runtime-negative-coverage.test.ts`, `lib/tools/r6/__p03-control.test.ts` | `node node_modules/vitest/vitest.mjs run lib/tools/r6/p03-runtime-negative-coverage.test.ts lib/tools/r6/__p03-control.test.ts` | `E:\MrXSteroid-main`, deps present | — | 2026-11-19 | **NOT_RUN** | E2 | not reproducible | untracked suite |
| E-016-07 | browser rows | preview URL | `curl -sS -o NUL -w "%{http_code}" <preview-url>` + authorized browser | accessible preview | — | 2026-11-19 | **NOT_RUN** | E0 | n/a | SSO blocked |
| E-016-08 | B1b evidence reuse | `retry-01/B1b-LEDGER-016-023.md` | read-only hash + row review | this audit | `607D9993572C384E9` | 2026-11-19 | reviewed, 18 rows | E5 (audit of evidence) | reproducible hash | observed on-disk |

No test, build, typecheck, lint, dev server, install or browser action was executed. Historical batch claims are recorded claims, not re-run evidence.

## M. Defect and Gap Register

**Implementation gaps**
| ID | Severity | Requirement | Exact file | Actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-016-1 | HIGH | `P03-PIPELINE`, `TEST-FOCUSED` | `lib/tools/r6/tool-016-half-life-pipeline.test.ts` | Focused test exists as **untracked** file vs clean-clone reproducible E3 | no durable proof | artifact not committed | review/track per approval (later authorized phase) | low |
| I-016-2 | HIGH | `C4-SOURCES` | `lib/tools/r6/tool-016-half-life-contract.ts` (`TOOL_016_SOURCES = []`) | Empty source registry vs required source/provenance or approved N/A | row stays NOT_AVAILABLE | no approved pack | supply approved pack or owner-approved N/A | low |
| I-016-3 | MEDIUM | `PREVIEW-ROUTE` | `lib/tools/registry.ts` vs `tool-016-closure-ledger.md` | Two different canonical routes vs one canonical URL | preview target ambiguous | category drift | owner decision + aligned docs (no code change here) | medium |
| I-016-4 | MEDIUM | `ENG-PIPELINE` | `lib/tools/r6/tool-016-half-life-pipeline.ts` | `confidence: 1`, `dataQuality: 'high'` asserted without calibration artifact | unverifiable provenance claim | hardcoded metadata | calibrate or downgrade with evidence | low |

**Evidence gaps**
| ID | Severity | Requirement | Exact file | Gap | Impact | Next action |
|---|---|---|---|---|---|---|
| V-016-1 | CRITICAL | `C4-SOURCES`, `C5-REFERRAL`, `CLINICAL-REVIEW`, `W18-HISTORY` | closure ledger rows 15–18; proposals | D-C4/D-C5/D-CLIN/D-W18 open | 4 rows unresolved | owner decisions + evidence |
| V-016-2 | HIGH | 6 browser rows | preview URL | E4 NOT_RUN | 6 rows unresolved | authorized preview + capture |
| V-016-3 | HIGH | `BUILD-TSC` | build config | no artifact pinned to `37f047a4` | row PARTIAL | archive clean tsc/build |
| V-016-4 | HIGH | `I18N-PARITY` | unit evidence file | historical 129/129 not re-run | E3 not re-awarded | isolated re-run + log |
| V-016-5 | MEDIUM | `P03-PIPELINE` | tracked pipeline / untracked negative suite | no committed runtime-negative proof | acceptance not closed | approval-gated clean-clone run |

## N. Development Maturity Matrix (S0–S11 per component)

Each component is evaluated independently across all twelve stages; a stage reached by one component is never transferred to another. `V` = verified by static inspection (E2), `T` = E3 test evidence in-hand (recorded or run), `R` = E4 runtime, `O` = owner-accepted (E5), `—` = not reached, `P` = partial. S10/S11 are reported only from actual browser/owner evidence, never from a plan or proposal.

| Component | S0 | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Identity / registry | V | — | — | — | — | — | — | — | — | — | — | — | S0 | S1 | no per-tool denominator |
| Requirements | — | P | — | — | — | — | — | — | — | — | — | — | S1 (partial) | S2 | official denominator missing |
| Architecture | — | — | V | — | — | — | — | — | — | — | — | — | S2 | S3 | untracked pipeline test |
| Math engine | — | — | — | V | — | — | — | — | — | — | — | — | S3 | S4 (E3 engine test) | NOT_RUN |
| Pipeline / schema | — | — | — | — | V | — | — | — | — | — | — | — | S4 (structural) | S5 (E3 pipeline test) | test untracked |
| UI / state | — | — | — | — | — | V | — | — | — | — | — | — | S5 (static) | S6 (component E3) | no executed component run |
| AI / CORE-5 / GENIUS-12 | — | — | — | — | — | — | V | — | — | — | — | — | S6 (static, no AI) | S7 (DOM E3) | no DOM test |
| Cross-tool / safety | — | — | — | — | — | — | — | V | — | — | — | — | S7 (static) | S8 | D-C4/C5/CLIN/W18 open |
| Testing | — | — | — | — | — | — | — | — | P | — | — | — | S8 (partial) | S9 | no current-HEAD run |
| True-clean | — | — | — | — | — | — | — | — | — | — | — | — | S0 only | S1 true-clean per-tool log | no isolated log at `37f047a4` |
| Browser | — | — | — | — | — | — | — | — | — | — | — | — | S0 only (no E4) | S1 browser | SSO / unavailable |
| External / owner | — | — | — | — | — | — | — | — | — | — | — | — | S0 only — no owner acceptance | S1 | owner step; never from a plan |

Engine S9 is not transferred to browser S0, and vice versa; no component reaches S10/S11.

## O. Comparison with Tool 039 (applicable engineering criteria only)

Tool 039 is an engineering reference, never one of the 29 audited tools. Its `OWNER_ACCEPTED` rows and D-08 local-device storage exception are **not transferred**. No similarity score is computed. Statuses: APPLICABLE / PARTIALLY_APPLICABLE / NOT_APPLICABLE / NOT_AVAILABLE / NOT_VERIFIED.

| Dimension | Status | Engineering reason | Action |
|---|---|---|---|
| Architecture | PARTIALLY_APPLICABLE | Same registry → component → schema → pipeline → engine → envelope pattern; 016 pipeline/contract tracked, but 016 pipeline test untracked and no debounce layer | Preserve tracked core; Extend tracking |
| Engine | APPLICABLE | Both pure deterministic engines; 016 computes a non-clinical elimination scenario, 039 computes ULN status — different domains, comparable purity | Preserve |
| Validation | PARTIALLY_APPLICABLE | Both have input + result Zod guards and `isToolOutput`; 016 lacks tracked negative-proof and calibrated confidence | Fix (track tests; calibrate/downgrade metadata) |
| AI | NOT_APPLICABLE | No model in either; 039 seven-part no-AI contract is a useful reference | Preserve as non-AI benchmark |
| Dynamic Results | PARTIALLY_APPLICABLE | 016 has honest 5-state union and memoized recompute but no 120 ms debounce and no E3/E4 state proof | Extend |
| CORE-5 | PARTIALLY_APPLICABLE | Compact selector uses boxes 2,3,7,9,12 (same as 039 reference) but parity untested | Preserve mapping; Extend proof |
| GENIUS-12 | PARTIALLY_APPLICABLE | 12 boxes static in both; 016 C4 source array empty vs 039 four E2 sources | Preserve order; Fix sources |
| Cross-Tool | PARTIALLY_APPLICABLE | 016 declares one manual-reentry link to tool-034; 039 declares three; no payload movement in either | Preserve boundary |
| Safety | APPLICABLE | Both avoid diagnosis/prescription; 016 explicitly `not_clinical`, 039 explicit no-diagnosis | Preserve |
| Testing | NOT_VERIFIED | Engine/adapter/dom/i18n tests tracked but none executed here; 039 historic E3/E4 not transferable | Fix (authorized isolated re-runs) |
| Browser — current-HEAD E4 | NOT_AVAILABLE | No preview pinned to `37f047a4` with Deployment ID; SSO gate not met | Extend after gate |
| Browser — historic artifact transfer | NOT_VERIFIED | Historic SSO/preview records exist but not pinned to fixed baseline | Preserve as history only |

## P. Next Development Tasks (proposals only — no implementation in this audit)

| # | Exact file | Proposed change | Required tests | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| 1 | `lib/tools/r6/tool-016-half-life-pipeline.test.ts` | review/track focused pipeline test if approved | isolated `node node_modules/vitest/vitest.mjs run lib/tools/r6/tool-016-half-life-pipeline.test.ts` | scoped git approval | low | clean-clone E3 | PASS log at `37f047a4` |
| 2 | `lib/tools/r6/tool-016-half-life-contract.ts` | populate `TOOL_016_SOURCES` with approved refs or record approved N/A | source-link test + owner decision | D-C4 owner | medium | C4 row resolvable | approved pack or signed N/A |
| 3 | `lib/tools/registry.ts` / closure ledger docs | reconcile `pharmacokinetics` vs `cycle-management` route | route-load check on preview | owner decision | medium | single canonical URL | documented owner ruling, no ID/slug change |
| 4 | `components/tools/tool-016-half-life-calculator.genius.tsx` | add compact/full C1 parity test | component test | task 1 | low | durable UI proof | 12 ordered boxes, compact parity |
| 5 | D-C4/C5/CLIN/W18 owners | supply approved source/referral/clinical/history decisions | n/a | owner decisions | medium | unresolved rows closed | recorded approvals |

Shared-component changes (if any) require a separate Change Impact Matrix before implementation.

## Q. Current Tool Decision

**Decision: REPAIR.** Completion = `100 × 1 / 18 = 5.56%` (PASS(E3+) 1 of 18 applicable **operational** rows; the single PASS is the historically recorded I18N-PARITY E3, not re-run by this audit; PASS(<E3) rows do not count; `NOT_AVAILABLE ≠ NOT_APPLICABLE`; unresolved rows block 100%). The pure non-clinical engine, tracked pipeline/schema/UI and recorded i18n parity are preserved assets. Blocking gaps: untracked pipeline test, missing approved sources/referral/clinical/history decisions, no current-HEAD isolated re-runs, no clean-clone P-03 runtime-negative proof, no E4, and an unresolved canonical-route conflict. The official per-tool denominator is unrecoverable, so this percentage is operational only. **No owner acceptance is implied, claimed or transferred** (Tool 039's `OWNER_ACCEPTED` status belongs to Tool 039 only; proposals state Tool 016 is NOT ACCEPTED / NOT CLOSED).

## Integrity note

The SHA-256 below is computed over all bytes of this file preceding the final hash line. Because that line is added after hashing, the whole-file SHA-256 differs by construction; the recorded body hash is the reproducible content fingerprint and is authoritative for this audit. The whole-file value is reported in the delivery response. No original source was edited to "fix" a hash.

Observed on-disk SHA-256 (body before this line): `A1F6549C60577A764BC29F8D59251BC0C27E25F2E4BB170D7200C486D119F43B`
