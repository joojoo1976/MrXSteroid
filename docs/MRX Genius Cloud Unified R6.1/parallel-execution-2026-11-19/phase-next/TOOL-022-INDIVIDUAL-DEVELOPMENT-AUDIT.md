# TOOL 022 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `022` · `mrx.tool.022-half-life-stacker` |
| Canonical name / slug | `Half-Life Stacker` / `tool-022-half-life-stacker` (closure ledger calls it `Oral vs Injectable`) |
| Category | `pharmacokinetics` (registry `href`) — closure ledger says `cycle-management` and URL slug `tool-022-oral-vs-injectable` (conflict logged in §B) |
| Canonical route | `/smarttools/pharmacokinetics/tool-022-half-life-stacker` (registry); closure-ledger URL `/smarttools/cycle-management/tool-022-oral-vs-injectable` |
| Batch | Batch 3 (closure ledger) |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`, dirty worktree preserved) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation. No code, contract, schema, ledger, git, build, test, server or browser writes/executions. |
| Primary evidence reuse | `retry-01/B1b-LEDGER-016-023.md` — observed on-disk SHA-256 `607D9993572C384E946DD34EA841F79C3B033FE5BAE58ADF7BBB0C74CDB50F82` (verified this audit; reused, not redone) |
| Source register | `closure-sprint-2026-11-17/tool-022-closure-ledger.md` — observed SHA-256 `E8E73B00B06B5A0F60694727800FDEB712D00C319B35ECF275CFEFBB4C9F3D33` (verified); CSV index blob `3a2eae44…` (observed via `git ls-files -s`, not transcribed in full) |
| Supporting refs | `TOOL-022-DEVELOPMENT-PROPOSALS.md`; governing plan observed SHA-256 `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9` |
| Tool 039 reference | `R6.1-TOOL-039-ENGINEERING-REFERENCE-PROFILE.md` — observed SHA-256 `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` (reference only, never one of the 29) |
| Tool decision | **REPAIR** — 1/18 = 5.56% verified (operational matrix); no owner acceptance implied |

Scope/preservation: read-only inspection plus this one new documentation file. Fixed baseline `E:\MrXSteroid-main` at `37f047a4` with a dirty worktree preserved unchanged. True-clean ref `E:\p03-true-clean-20261118@37f047a4`; contaminated `2a647fda` excluded. No test, build, typecheck, lint, install, dev server, browser or runtime E4 action was executed. Absent executions are `NOT_RUN` with exact isolated commands.

Evidence ladder: E0 none; E1 assertion; E2 file/static code; E3 reproducible test; E4 authorized runtime/browser; E5 independent audit. Only E3+ counts as PASS. `NOT_AVAILABLE ≠ NOT_APPLICABLE`.

## A. Tool Identity and Historical Lineage

- **Identity (registry, observed):** `lib/tools/registry.ts:63` — `toolId mrx.tool.022-half-life-stacker`, slug `tool-022-half-life-stacker`, `page Page.HALF_LIFE_STACKER`, `href /smarttools/pharmacokinetics/tool-022-half-life-stacker`, titleEn `Half-Life Stacker`, `accessTier free`, `stackStatus layered`. The closure ledger instead identifies a tool named `tool-022-oral-vs-injectable` under `cycle-management` — a naming/route conflict, not two separate audited tools. A separate legacy `tool-022-*` numbering collision was checked; the audited implementation is the stacker named in the registry at line 63.
- **Implementation paths (observed):** engine `lib/tools/engines/tool-022-half-life-stacker.ts` (tracked, clean, blob `307d9d26bfaf720abb36c244d39ca4d827bd95bc`); schema `lib/tools/schemas/tool-022-half-life-stacker.ts` (tracked, clean, `01ba2b34fa6b871e3f063f49434cc7523e140596`); pipeline `lib/tools/r6/tool-022-half-life-stacker-pipeline.ts` (tracked, clean, `21df288e70210b7359c9afbada56c3550296f8e1`); contract `lib/tools/r6/tool-022-half-life-stacker-contract.ts` (tracked, clean, `d76172d738b89b44674ad142ffed9e10c3d0cff2`); component `components/tools/tool-022-half-life-stacker.tsx` (tracked, clean, `35be918dd0d7bc535168d72615535c37e52536d2`); genius `...genius.tsx` (tracked, clean, `d29f68d5142f398f1128445f92e48b3070753d54`); i18n `i18n/tool-022-half-life-stacker.json` (tracked, clean, `7b1a6932258626926f61a83a6ebd7ed2b4129084`). Pipeline test `lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts` is **untracked**; engine/component tests are tracked (blobs observed via `git ls-files -s`).
- **Historical start / engine intent:** the V6 engine is a deterministic stack-timing *heuristic* calculator: it identifies the longest half-life ester (bottleneck), computes a 2.5× half-life "peak platform", 4.5× half-life "washout", a 10%-of-cycle PCT buffer and an injection schedule. Its header says "Does not validate pharmacokinetics or recommend treatment timing", yet its result fields are named `recommended_pct_start_days` and `optimal_injection_schedule` — an internal honesty conflict logged in §M (implementation gap I-022-1). Preserve the non-clinical framing; resolve the output naming/claim.
- **Relevant SHAs:** fixed baseline `37f047a4`; closure snapshot `8d7e406c` (2026-11-17); Tool 039 reference baseline `5a87f3e5` (reference only); true-clean context `E:\p03-true-clean-20261118@37f047a4`; contaminated `2a647fda` excluded.
- **Original requirements / owner decisions:** closure ledger records D-C4, D-C5, D-CLIN, D-W18, D-P03. `TOOL-022-DEVELOPMENT-PROPOSALS.md` states **IMPLEMENTED — OWNER REVIEW PENDING — NOT ACCEPTED — NOT CLOSED**. No owner acceptance found.
- **Historical acceptance:** none. The 1/18 PASS (I18N-PARITY) is a recorded historic E3 claim, not re-executed here.
- **Current owner:** R6.1 programme owner for gates/decisions; tool implementation owner for later authorized repair. No explicit Tool 022 owner-acceptance decision found.

## B. Original and R6.1 Requirements

**Canonical denominator finding (explicit):** the official per-tool atomic requirement denominator for Tool 022 **cannot be fully recovered** from authoritative sources, so the 18-row closure register is **not** presented as the official acceptance denominator. Available sources: (a) generic 18-row closure register (MD/CSV + B1b ledger) used strictly as an **operational audit matrix**; (b) system-wide canonical IDs in `tool-039-requirements.csv` (observed SHA `CB47C6A2B91E6F4BB3C2DD514B69F95D3BD469A1842F3C125891B1281C6F98B6`) and `REQUIREMENT-TRACEABILITY-MATRIX.md`, **engineering reference only**; (c) `R6.1-SYSTEM-REQUIREMENT-REGISTER.md`; (d) tool-specific proposals. **Missing:** a per-tool atomic requirements CSV with owner-approved A/B/C dimensions for 022 and a tool-specific acceptance file. No denominator is invented; the 18 rows below are the best-available operational set, flagged as such.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| SPEC-R6.1-1.a/1.b/1.c, C-2, C-8 | `ENG-PIPELINE` | Compute via R6 pipeline path only (no UI-side engine logic) | APPLICABLE | `tool-022-half-life-stacker-pipeline.ts` tracked: `halfLifeStackerInputSchema.tryParse` → `calculateStackTiming` → `StackTimingResultSchema.safeParse` → `createToolOutput` → `isToolOutput`; genius `runProbe` recomputes through the same pipeline (static) | No per-tool canonical row; operational matrix only |
| SPEC-R6.1-1.e, SPEC-R6.1-2.b, ACC-R6.1-3.c, ACC-5.5.10 | `STATE-5` | Five states EMPTY/PARTIAL/INVALID/FULL/DEGRADED implemented honestly | APPLICABLE | `Tool022UiState` union in tracked contract/component (static) | E3/E4 state proof absent |
| SPEC-R6.1-3.a, LAYER-GENIUS12-01…12 | `UI-GENIUS12` | GENIUS-12 fixed order present once (no hidden/duplicate boxes) + CORE-5 | APPLICABLE | `...genius.tsx` tracked, 12-box array, compact selector (static) | No DOM/E4 proof |
| SPEC-R6.1-3.d, SPEC-R6.1-6.b/6.c, ACC-5.5.6 | `I18N-PARITY` | AR/EN parity, required keys resolved, no contamination | APPLICABLE | i18n JSON tracked; recorded 129/129 PASS (2026-11-17) | Re-run NOT_RUN; recorded E3 not re-awarded; no 022 i18n-check script observed in the closure ledger files list |
| LAYER-GENIUS12-10, LAYER-20MAP-07 | `EXPORT-CSV` | Browser-only CSV export (no server/session identifier) | APPLICABLE | `buildHalfLifeStackerCsv` in tracked contract + genius export box (static) | No browser download proof |
| ACC-R6.1-3.a/b/c, G-1/G-2/G-3 | `TEST-FOCUSED` | Focused tests pass (pipeline/contract/component/i18n-evidence as applicable) | APPLICABLE | Engine/component tests tracked; pipeline test **untracked** | No current-HEAD isolated run; focused battery not consolidated |
| ACC-R6.1-3.a | `BUILD-TSC` | tsc --noEmit and next build pass with route present | APPLICABLE | Historical clean-export record only (`8E7919BA…`, different env) | No archived artifact pinned to `37f047a4` |
| LAYER-20MAP-07, SPEC-R6.1-3.g | `PREVIEW-ROUTE` | Direct Preview route loads for tool (SSR/accessible) | APPLICABLE | Route file tracked; SSO-protected preview | Browser NOT_RUN; canonical route conflict also unresolved |
| SPEC-R6.1-3.d, ACC-5.5.6 | `BROWSER-EN-AR` | EN and AR functional pass on Preview | APPLICABLE | i18n resource present (static) | Browser NOT_RUN |
| SPEC-R6.1-1.e, ACC-R6.1-3.c, ACC-5.5.10 | `BROWSER-5-STATES` | Five states exercised on Preview | APPLICABLE | Static state code only | Browser NOT_RUN |
| ACC-5.5.6, ACC-5.5.7, ACC-5.5.7-LEGIBILITY | `RTL-390` | Real Arabic RTL at 390px | APPLICABLE | `dir={isRtl ? 'rtl' : 'ltr'}` in component (static) | Device/browser NOT_RUN |
| ACC-R6.1-3.a, SPEC-R6.1-5.d | `CONSOLE-HYDRATION` | No Console errors or SSR/Hydration issues | APPLICABLE | — | Browser NOT_RUN |
| SPEC-R6.1-3.a, LAYER-DOMAIN-RULE | `NO-DUP-GENIUS` | No duplicate GENIUS-12 / no hidden box / no double shell | APPLICABLE | Static 12-box structure | DOM proof NOT_RUN |
| LAYER-CORE5-C4, LAYER-GENIUS12-09, SPEC-R6.1-2.f | `C4-SOURCES` | Specialist-approved sources/provenance or owner-approved N/A | APPLICABLE | Static source keys in genius cross-tool map only; no approved source pack | D-C4 open — NOT_AVAILABLE |
| LAYER-CORE5-C5, LAYER-GENIUS12-12, SPEC-R6.1-5.g, ACC-R6.1-3.i | `C5-REFERRAL` | Specialist-approved referral/seek-care wording (AR/EN) | APPLICABLE | Inline static strings only | D-C5 open — NOT_AVAILABLE |
| D-CLIN (no canonical atomic ID recovered) | `CLINICAL-REVIEW` | Clinical/model review sign-off as applicable | APPLICABLE | No sign-off found; engine emits PCT/washout timing guidance | **Original requirement ID not recoverable — explicit missing mapping**; D-CLIN open |
| SPEC-R6.1-4.f, SPEC-R6.1-6.d | `W18-HISTORY` | History/storage/sync per W18 decision | APPLICABLE | Box 11 `not_available`; no storage in audited paths | D-W18 open |
| SPEC-R6.1-1.b/1.c, C-4/C-6/C-8, P-03 | `P03-PIPELINE` | Shared R6 pipeline result-schema enforcement (if applicable) | APPLICABLE | Tracked pipeline has `safeParse` gate + `isToolOutput`; structural PASS in TC per C report; runtime-negative untracked | Ledger `NOT_IMPLEMENTED` stale vs committed gate; full clean-clone P-03 not closed |

**Counts:** canonical applicable (operational) = 18; justified N/A = 0; unmapped = 1 (`CLINICAL-REVIEW` original ID). Evidence distribution (B1b-verified): PASS(E3+)=1 (I18N-PARITY, recorded not re-run); PASS(<E3, E2)=4; PARTIAL=3; NOT_RUN=6; BLOCKED=1; NOT_AVAILABLE=3.

**Source authority conflict log:**
| Source | Location | Impact | Resolution required |
|---|---|---|---|
| Registry route/slug vs closure ledger | `lib/tools/registry.ts:63` (`pharmacokinetics`, `tool-022-half-life-stacker`) vs ledger lines 1/4/8 (`cycle-management`, `tool-022-oral-vs-injectable`) | Canonical name and preview target ambiguous | Owner decision on canonical route/name; no code/ledger edit here |
| Closure ledger snapshot | `8d7e406c`, 2026-11-17 | Historical PASS claims vs current HEAD | Treat as historical; no transfer |
| Tool 039 requirements CSV | `5a87f3e5`, `OWNER_ACCEPTED` rows | Could imply 022 acceptance | Reference only; never transfer owner decision |
| Generic 18-row register | closure ledgers | Could be mistaken for official denominator | Operational matrix only; no official per-tool denominator recovered |
| B1b embedded self-hash | B1b line 352 `90524E2C…` vs observed `607D9993…` | Hash mismatch | Observed on-disk authority; original not edited |
| P03 ledger wording | `P03-PIPELINE NOT_IMPLEMENTED` vs tracked gate | Status understatement | Reconcile in authorized update |

## C. Existing Architecture and Implementation

| Exact path | Git status (`git ls-files -s` / `git status --porcelain`) | Role | Test file | Actual status |
|---|---|---|---|---|
| Route page (022) | tracked, clean (blob observed) | canonical route | — | present |
| `lib/tools/engines/tool-022-half-life-stacker.ts` | tracked, clean (`307d9d26…`) | pure heuristic engine | tracked test | static present |
| `lib/tools/schemas/tool-022-half-life-stacker.ts` | tracked, clean (`01ba2b34…`) | Zod input/output contract | — | static present |
| `lib/tools/r6/tool-022-half-life-stacker-pipeline.ts` | tracked, clean (`21df288e…`) | R6 pipeline, fail-closed envelope | `...pipeline.test.ts` **untracked** | structural present |
| `lib/tools/r6/tool-022-half-life-stacker-contract.ts` | tracked, clean (`d76172d7…`) | draft state/CSV/cross-tool map | — | static present |
| `components/tools/tool-022-half-life-stacker.tsx` | tracked, clean (`35be918d…`) | 5-state UI + pipeline call | tracked component test | static present |
| `components/tools/tool-022-half-life-stacker.genius.tsx` | tracked, clean (`d29f68d5…`) | GENIUS-12 / CORE-5 | — | static present |
| `i18n/tool-022-half-life-stacker.json` | tracked, clean (`7b1a6932…`) | AR/EN copy | — | recorded E3, not re-run |

**Dependencies:** React client component; `useToolDisplayPreferences`; canonical `createToolSchema` / `createToolOutput` / `isToolOutput`; `requireTool`/`buildSeoLinks`; Zod; shared R6 shell. The genius `runProbe` calls `runHalfLifeStacker` with `snapshotType: 'submitted_snapshot'` for what-if comparisons — still the canonical pipeline, not UI-side engine math (static). No Supabase/network/storage import observed in audited tool paths. Nothing was built, imported or executed.

## D. Math Engine and Equation Audit

- **Equations (static, `calculateStackTiming`):**
  - bottleneck = compound with `max(half_life_days)` (schema bounds 0.5–60 days; 1–6 compounds; cycle 1–52 weeks; injection frequency daily / every-other-day / 2x-week / 1x-week);
  - `peak_platform_days = ceil(maxHalfLife × 2.5)` — comment explicitly says "Legacy heuristic only; this is not a pharmacokinetic peak model";
  - `total_cycle_half_lives = round(Σ half_life_days / maxHalfLife, 1)`;
  - `recommended_pct_start_days = ceil(maxHalfLife + cycle_length_weeks × 7 × 0.1)` — labeled "10% of cycle as buffer";
  - `washout_complete_days = ceil(maxHalfLife × 4.5)` — "4–5 half-lives" heuristic;
  - `optimal_injection_schedule`: step sizes 1 / 2 / 3.5 / 7 days by frequency; `compound_peak_times[name_en] = round(half_life_days × 2.5)`.
- **Units:** days throughout; `cycle_length_weeks × 7` is the only conversion (weeks → days), performed once in the engine. No unit toggle conversion in the audited engine.
- **Zero/negative/NaN/Infinity:** Zod rejects out-of-range/non-finite values at engine `StackTimingInputSchema.parse` and pipeline boundary (static). `maxHalfLife` therefore cannot be 0 for valid input, so the divisor is safe. `freqMap[injection_frequency] || 1` has a silent fallback to daily for an unexpected value — unreachable via Zod enum, but a latent masking pattern.
- **Boundaries/precision/determinism:** `Math.ceil` and `round(...,1)` introduce deliberate coarse rounding; no confidence interval or calibrated PK basis exists. Engine is pure (no I/O, clock, randomness, DB, React/DOM imports) and deterministic for a given validated input.
- **Result schema/purity:** `StackTimingResultSchema.safeParse` gates the engine output in the pipeline; provenance in the output envelope uses honest `confidence: null` / `dataQuality: 'not_assessed'` (static, per pipeline pattern).
- **Honesty conflict:** result field names `recommended_pct_start_days` / `optimal_injection_schedule` contradict the header "Does not … recommend treatment timing" (see I-022-1).
- **Tests run vs NOT_RUN:** `npx vitest run lib/tools/engines/tool-022-half-life-stacker.test.ts` — **NOT_RUN**. Static presence of the tracked engine test supports E2 only.

## E. Pipeline and Schema Audit

Chain (static): `StackTimingInputSchema` → `createToolSchema` → `halfLifeStackerInputSchema.tryParse(rawInput)` → `calculateStackTiming` → `StackTimingResultSchema.safeParse(engineResult)` → `buildHalfLifeStackerOutput` → `createToolOutput` → `isToolOutput` → `{ok:true,output}` / `{ok:false,error}`. All failure branches are fail-closed without a partial envelope. Timestamps/locale/unit/snapshot type are caller-injected. **P-03 status:** structural gate committed/tracked and PASS in TC (per P-03 report row 7); tracked pipeline test absent, runtime-negative suite untracked → clean-clone P-03 closure not established. No test was executed by this audit.

## F. AI and Intelligence Capabilities

- AI brain / prompt / model / provider / RAG / embedding / prediction: **NotApplicable** — no model or network call observed (static).
- Explanation: **Implemented (static)** via fixed bottleneck/timing key findings; what-if: **Implemented (static)** in genius `runProbe` recomputation through the canonical pipeline (cycle +2 weeks, switch to daily); prediction: **Unavailable** — heuristics are explicitly not a PK model.
- Uncertainty: **Unavailable** (`confidence_not_assessed`); no calibration artifact found. Safety/limits: **Implemented (static)**; **RuntimeVerified: No**.
- A probe button or source string is not proof of AI or runtime behavior; no AI runtime claim is made.

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next action |
|---|---|---|---|---|---|---|---|---|
| C1 primary result + units/confidence | YES | YES | static (tracked genius) | NO | NO | box 2 `data-r6-core=c1`, peak platform days | no E3/E4 | DOM test |
| C2 how/assumptions/inputs | YES | YES | static | NO | NO | heuristic boxes, schema bounds | no E3 | component test |
| C3 safety/red flags/referral | YES | partial static | static | NO | NO | non-clinical framing strings | D-C5 open | approved wording |
| C4 sources | YES | YES | no approved source pack | NO | NO | cross-tool key map only | D-C4 open | approved pack / N-A |
| C5 next actions | YES | partial static | static | NO | NO | inline guidance | D-C5 open | approved pack |
| Boxes 1–12 fixed order | YES | YES | static (tracked) | NO | NO | 12-box array in genius | no DOM proof | preview DOM check |
| Compact CORE-5 parity (C1 equal) | YES | static | static compact selector | NO | NO | compact box subset | no E3 parity test | parity test |
| Non-applicable box states reason | YES | YES | static | NO | NO | `not_available`/`not_applicable` badges | no E4 | preview check |

Ordering/visibility/compact-full parity are static observations only.

## H. Dynamic Results and UI Maturity

- **Static inspection:** tracked component implements a five-value `Tool022UiState` (`EMPTY`/`PARTIAL`/`INVALID`/`FULL`/`DEGRADED`) with a draft→pipeline→state mapping, `data-r6-state` badge, `dir` binding, `aria-*` attributes, compact/full toggle and responsive classes. The genius component exposes `runProbe` what-if controls recomputed through `runHalfLifeStacker` (static). No debounce timer was observed in the audited 022 paths (recompute on explicit interaction/memoization only).
- **MVO:** bottleneck ester + peak-platform / washout / PCT-timing heuristics is the minimum viable output; not independently verified and subject to I-022-1.
- **Component test:** tracked; **Integration test:** pipeline test **untracked**. **True-Clean:** no current-HEAD focused per-tool log in this audit scope. **Browser E4:** NOT_RUN (SSO preview).
- Live recalculation, compact/full, keyboard and 390 px behavior are **static claims only**; no E3/E4 is claimed here.

## I. Cross-Tool and Data Integration

- Tracked contract declares a cross-tool field map including a 022 → `tool-016-half-life-calculator` entry (`cross_tool_016_field` / `cross_tool_016_note` / `cross_tool_016_freshness`, observed in genius line 50). No payload transfer or prefill was observed; transfer boundary remains manual/explanatory.
- Producer/consumer: engine → pipeline → component → genius; what-if probes call the same pipeline. No evidence of any consumer reading 022 output outside the page. Error propagation is fail-closed (static). **W18 boundary:** no session/cloud/shared-sync authorization; no storage layer found in audited paths.

## J. Safety, Sources and Privacy

- Safety posture: non-clinical heuristic framing is preserved, but result naming implies treatment timing (I-022-1). No dose in mg is emitted; no diagnosis.
- Validation: Zod at engine + pipeline + contract draft boundary (static). API/auth: no API route or auth code in audited tool paths (static). Data exposure/logging: no value logging observed statically; browser console NOT_RUN. Storage: none observed; W18 open.
- Domain warnings/red flags/referral: inline static patterns only; D-C4 / D-C5 / D-CLIN unresolved. Clinical review is BLOCKED. No specialist sign-off claimed.

## K. Localization and Browser Maturity

- `i18n/tool-022-half-life-stacker.json` tracked; recorded parity PASS (2026-11-17, E3 record, not re-run; count transcribed from B1b ledger). Planned re-run: `node node_modules/vitest/vitest.mjs run tests/unit/tool-022-*-i18n-evidence.test.ts` (exact file name to be confirmed from the tracked set) — **NOT_RUN**.
- EN/AR functional pass, RTL-390, console/hydration, no-duplicate-GENIUS and direct preview route: **NOT_RUN** (E0). E4 prerequisites unavailable: SSO-compliant session, preview pinned to `37f047a4`, Deployment ID. Canonical route/name conflict (§B) additionally blocks a single definitive PREVIEW-ROUTE target. No browser claim made.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command (isolated) | Environment | Source SHA (observed, first 16) | Date | Actual result | Level | Reproducibility / validity | HEAD compatibility |
|---|---|---|---|---|---|---|---|---|---|---|
| E-022-01 | ENG-PIPELINE | `lib/tools/r6/tool-022-half-life-stacker-pipeline.ts` | `node node_modules/vitest/vitest.mjs run lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts` | deps-present repo (clean clone preferred) | `21DF288E70210B73` | 2026-11-19 | **NOT_RUN** (test file untracked) | E2 | not reproducible this phase | static at HEAD |
| E-022-02 | STATE-5 / UI | `components/tools/tool-022-half-life-stacker.test.tsx` | `node node_modules/vitest/vitest.mjs run components/tools/tool-022-half-life-stacker.test.tsx` | deps-present repo | `D29F68D5142F398F` (genius; test blob observed in tracking) | 2026-11-19 | **NOT_RUN** | E2 | not reproducible | tracked at HEAD |
| E-022-03 | TEST-FOCUSED engine | `lib/tools/engines/tool-022-half-life-stacker.test.ts` | `node node_modules/vitest/vitest.mjs run lib/tools/engines/tool-022-half-life-stacker.test.ts` | deps-present repo | `307D9D26BFAF720A` | 2026-11-19 | **NOT_RUN** | E2 | not reproducible | tracked at HEAD |
| E-022-04 | I18N-PARITY | i18n JSON + parity evidence | `node node_modules/vitest/vitest.mjs run tests/unit/tool-022-*-i18n-evidence.test.ts` | deps-present repo | `7B1A693225862692` | 2026-11-19 | **NOT_RUN** (historic PASS recorded) | E3 (historic record) | not re-run | tracked at HEAD |
| E-022-05 | BUILD-TSC | repository build config | `node node_modules/typescript/bin/tsc --noEmit --pretty false`; `node node_modules/next/dist/bin/next build` | clean worktree at target SHA, deps present, no installs | — | 2026-11-19 | **NOT_RUN** | E2 (historical claim) | not reproducible | no `37f047a4` artifact |
| E-022-06 | P03-PIPELINE | `lib/tools/r6/p03-runtime-negative-coverage.test.ts`, `lib/tools/r6/__p03-control.test.ts` | `node node_modules/vitest/vitest.mjs run lib/tools/r6/p03-runtime-negative-coverage.test.ts lib/tools/r6/__p03-control.test.ts` | `E:\MrXSteroid-main`, deps present | — | 2026-11-19 | **NOT_RUN** | E2 | not reproducible | untracked suite |
| E-022-07 | browser rows | preview URL | `curl -sS -o NUL -w "%{http_code}" <preview-url>` + authorized browser | accessible preview | — | 2026-11-19 | **NOT_RUN** | E0 | n/a | SSO blocked |
| E-022-08 | B1b evidence reuse | `retry-01/B1b-LEDGER-016-023.md` | read-only hash + row review | this audit | `607D9993572C384E9` | 2026-11-19 | reviewed, 18 rows | E5 (audit of evidence) | reproducible hash | observed on-disk |

No test, build, typecheck, lint, dev server, install or browser action was executed. Historical batch claims are recorded claims, not re-run evidence.

## M. Defect and Gap Register

**Implementation gaps**
| ID | Severity | Requirement | Exact file | Actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-022-1 | HIGH | `CLINICAL-REVIEW`, capability honesty | `lib/tools/engines/tool-022-half-life-stacker.ts` (header lines 5–8 vs result lines 35,38,70,74) | Header denies treatment-timing advice but result fields are `recommended_pct_start_days` / `optimal_injection_schedule` | Misleading clinical framing without approved source | heuristic output named as recommendation | rename/reframe as explanatory heuristics + clinical review (owner decision) | medium |
| I-022-2 | HIGH | `TEST-FOCUSED`, `P03-PIPELINE` | `lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts` | Focused test exists as **untracked** file vs clean-clone reproducible E3 | no durable proof | artifact not committed | review/track per approval (later authorized phase) | low |
| I-022-3 | HIGH | `PREVIEW-ROUTE`, identity | `lib/tools/registry.ts` vs `tool-022-closure-ledger.md` | Two different names/routes (`half-life-stacker` vs `oral-vs-injectable`) vs one canonical target | preview/identity ambiguous | category + name drift | owner decision + aligned docs (no code change here) | medium |
| I-022-4 | LOW | `ENG-PIPELINE` | `lib/tools/engines/tool-022-half-life-stacker.ts` (`freqMap[...] || 1`) | Silent fallback to daily for unexpected frequency | masks boundary errors | defensive default | rely on Zod enum or fail closed | low |

**Evidence gaps**
| ID | Severity | Requirement | Exact file | Gap | Impact | Next action |
|---|---|---|---|---|---|---|
| V-022-1 | CRITICAL | `C4-SOURCES`, `C5-REFERRAL`, `CLINICAL-REVIEW`, `W18-HISTORY` | closure ledger rows 15–18 | D-C4/D-C5/D-CLIN/D-W18 open | 4 rows unresolved | owner decisions + evidence |
| V-022-2 | HIGH | 6 browser rows | preview URL | E4 NOT_RUN | 6 rows unresolved | authorized preview + capture |
| V-022-3 | HIGH | `BUILD-TSC` | build config | no artifact pinned to `37f047a4` | row PARTIAL | archive clean tsc/build |
| V-022-4 | HIGH | `I18N-PARITY` | i18n evidence | historical PASS not re-run | E3 not re-awarded | isolated re-run + log |
| V-022-5 | MEDIUM | `P03-PIPELINE` | tracked pipeline / untracked negative suite | no committed runtime-negative proof | acceptance not closed | approval-gated clean-clone run |

## N. Development Maturity Matrix (S0–S11 per component)

Each component is evaluated independently across all twelve stages; a stage reached by one component is never transferred to another. `V` = static inspection (E2), `T` = E3 test evidence in-hand (recorded or run), `R` = E4 runtime, `O` = owner-accepted (E5), `—` = not reached, `P` = partial. S10/S11 are reported only from actual browser/owner evidence, never from a plan or proposal.

| Component | S0 | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Identity / registry | V | — | — | — | — | — | — | — | — | — | — | — | S0 | S1 | no per-tool denominator; name/route conflict |
| Requirements | — | P | — | — | — | — | — | — | — | — | — | — | S1 (partial) | S2 | official denominator missing |
| Architecture | — | — | V | — | — | — | — | — | — | — | — | — | S2 | S3 | untracked pipeline test |
| Math engine | — | — | — | V | — | — | — | — | — | — | — | — | S3 | S4 (E3 engine test) | NOT_RUN; heuristic naming |
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

Tool 039 is an engineering reference, never one of the 29 audited tools. Its `OWNER_ACCEPTED` rows and D-08 local-device storage exception are **not transferred**. No similarity score is computed.

| Dimension | Status | Engineering reason | Action |
|---|---|---|---|
| Architecture | PARTIALLY_APPLICABLE | Same registry → component → schema → pipeline → engine → envelope pattern; 022 pipeline/contract tracked, pipeline test untracked, no debounce layer | Preserve tracked core; Extend tracking |
| Engine | APPLICABLE | Both pure deterministic engines; 022 emits heuristic timing arithmetic, 039 emits ULN status — different domains, comparable purity | Preserve; Fix recommendation naming |
| Validation | PARTIALLY_APPLICABLE | Both have input + result Zod guards and `isToolOutput`; 022 lacks tracked negative-proof | Fix (track tests) |
| AI | NOT_APPLICABLE | No model in either; 039 seven-part no-AI contract is a useful reference | Preserve as non-AI benchmark |
| Dynamic Results | PARTIALLY_APPLICABLE | 022 has honest 5-state union and pipeline-based what-if probes, but no E3/E4 proof and no debounce | Extend |
| CORE-5 | PARTIALLY_APPLICABLE | Compact CORE-5 mapping present statically but parity untested | Preserve mapping; Extend proof |
| GENIUS-12 | PARTIALLY_APPLICABLE | 12 boxes static in both; 022 C4 has no approved source pack | Preserve order; Fix sources |
| Cross-Tool | PARTIALLY_APPLICABLE | 022 declares a cross-tool field map including tool-016; 039 declares three; no payload movement in either | Preserve boundary |
| Safety | APPLICABLE | Both avoid diagnosis/prescription in principle; 022 result names need reframing (I-022-1) | Preserve framing; Fix naming |
| Testing | NOT_VERIFIED | Engine/component tests tracked but none executed here; 039 historic E3/E4 not transferable | Fix (authorized isolated re-runs) |
| Browser — current-HEAD E4 | NOT_AVAILABLE | No preview pinned to `37f047a4` with Deployment ID; SSO gate not met | Extend after gate |
| Browser — historic artifact transfer | NOT_VERIFIED | Historic preview records exist but not pinned to fixed baseline | Preserve as history only |

## P. Next Development Tasks (proposals only — no implementation in this audit)

| # | Exact file | Proposed change | Required tests | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| 1 | `lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts` | review/track focused pipeline test if approved | isolated `node node_modules/vitest/vitest.mjs run lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts` | scoped git approval | low | clean-clone E3 | PASS log at `37f047a4` |
| 2 | `lib/tools/engines/tool-022-half-life-stacker.ts` | reframe `recommended_pct_start_days` / `optimal_injection_schedule` as explicitly non-clinical heuristic outputs | engine test + owner/clinical review | D-CLIN owner | medium | honest capability contract | approved naming + sign-off |
| 3 | `lib/tools/registry.ts` / closure ledger docs | reconcile `pharmacokinetics`/`half-life-stacker` vs `cycle-management`/`oral-vs-injectable` | route-load check on preview | owner decision | medium | single canonical identity | documented owner ruling, no ID/slug change without approval |
| 4 | `components/tools/tool-022-half-life-stacker.genius.tsx` | add compact/full C1 parity test | component test | task 1 | low | durable UI proof | 12 ordered boxes, compact parity |
| 5 | D-C4/C5/CLIN/W18 owners | supply approved source/referral/clinical/history decisions | n/a | owner decisions | medium | unresolved rows closed | recorded approvals |

Shared-component changes (if any) require a separate Change Impact Matrix before implementation.

## Q. Current Tool Decision

**Decision: REPAIR.** Completion = `100 × 1 / 18 = 5.56%` (PASS(E3+) 1 of 18 applicable **operational** rows; the single PASS is the historically recorded I18N-PARITY E3, not re-run by this audit; PASS(<E3) rows do not count; `NOT_AVAILABLE ≠ NOT_APPLICABLE`; unresolved rows block 100%). The pure deterministic engine, tracked pipeline/schema/UI, recorded i18n parity and fail-closed envelope are preserved assets. Blocking gaps: untracked pipeline test, clinical-timing naming conflict (I-022-1), missing approved sources/referral/clinical/history decisions, no current-HEAD isolated re-runs, no clean-clone P-03 runtime-negative proof, no E4, and an unresolved canonical name/route conflict. The official per-tool denominator is unrecoverable, so this percentage is operational only. **No owner acceptance is implied, claimed or transferred** (Tool 039's `OWNER_ACCEPTED` status belongs to Tool 039 only; proposals state Tool 022 is NOT ACCEPTED / NOT CLOSED).

## Integrity note

The SHA-256 below is computed over all bytes of this file preceding the final hash line. Because that line is added after hashing, the whole-file SHA-256 differs by construction; the recorded body hash is the reproducible content fingerprint and is authoritative for this audit. The whole-file value is reported in the delivery response. No original source was edited to "fix" a hash.

Observed on-disk SHA-256 (body before this line): `DFB40E53CBC51EDE8C514716438595402A5A6F510A07E329EC0462EB5C2A3283`
