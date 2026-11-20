# TOOL 023 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `023` · `mrx.tool.023-trt-optimization` |
| Canonical name / slug | `TRT Optimization` / `tool-023-trt-optimization` |
| Category | `hormonal-health` (registry and closure ledger agree) |
| Canonical route | `/smarttools/hormonal-health/tool-023-trt-optimization` |
| Batch | Batch 1 (closure ledger) |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`, dirty worktree preserved) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation. No code, contract, schema, ledger, git, build, test, server or browser writes/executions. |
| Primary evidence reuse | `retry-01/B1b-LEDGER-016-023.md` — observed on-disk SHA-256 `607D9993572C384E946DD34EA841F79C3B033FE5BAE58ADF7BBB0C74CDB50F82` (verified this audit; reused, not redone) |
| Source register | `closure-sprint-2026-11-17/tool-023-closure-ledger.md` — observed SHA-256 `CC860C8FB8997A3AD864AC26DB482F8F9B765E6AF4DB7AC90FE5D6EF9FC0FDDC` (verified); closure CSV read in full |
| Supporting refs | `R6.1-P03-RESULTSCHEMA-CLOSURE-REPORT.md`; `evidence-clean-build-2026-11-18/tool-023-schema-engine-proof.test.ts` (observed SHA-256 `992694C76F62AB061F5705277DE868F49FF602CFABEFB4372BB69F7B1E61F4FA`); governing plan observed SHA-256 `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9` |
| Tool 039 reference | `R6.1-TOOL-039-ENGINEERING-REFERENCE-PROFILE.md` — observed SHA-256 `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` (reference only, never one of the 29); 039 requirements CSV observed SHA-256 `CB47C6A2B91E6F4BB3C2DD514B69F95D3BD469A1842F3C125891B1281C6F98B6` |
| Tool decision | **REPAIR** — 0/18 operational ledger PASS; 2/21 expanded evidence view (only separated items (b) and (c)); no owner acceptance implied |

Scope/preservation: read-only inspection plus this one new documentation file. Fixed baseline `E:\MrXSteroid-main` at `37f047a4` with a dirty worktree preserved unchanged (023 has pre-existing modified/untracked files — see §C; none were touched). True-clean ref `E:\p03-true-clean-20261118@37f047a4`; contaminated `2a647fda` excluded. No test, build, typecheck, lint, install, dev server, browser or runtime E4 action was executed. Absent executions are `NOT_RUN` with exact isolated commands.

Evidence ladder: E0 none; E1 assertion; E2 file/static code; E3 reproducible test; E4 authorized runtime/browser; E5 independent audit. Only E3+ counts as PASS. `NOT_AVAILABLE ≠ NOT_APPLICABLE`.

**Three-item separation rule for Tool 023 (mandatory):** (a) the 12,800-vs-32,000 acceptance grid, (b) the `TrtResultSchema` rejection proof and (c) the fail-closed envelope protection are **three distinct evidence items with distinct evidence and distinct statuses**. They are reported separately in §B, §L and §Q. Grid inconsistency does **not** negate the rejection proof, and the rejection proof does **not** validate the grid. No conflation, no derived E3 for item (a).

## A. Tool Identity and Historical Lineage

- **Identity (registry, observed):** `lib/tools/registry.ts:64` — `toolId mrx.tool.023-trt-optimization`, slug `tool-023-trt-optimization`, `href /smarttools/hormonal-health/tool-023-trt-optimization`, titleEn `TRT Optimization`, `accessTier` as observed in registry, `stackStatus layered`. The closure ledger route/category match the registry (no route conflict for 023).
- **Implementation paths and exact git status (observed `git ls-files -s` / `git status --porcelain`):**
  - engine `lib/tools/engines/tool-023-trt-optimization.ts` — tracked, clean, blob `328d2151972dd1b6a30991caf6c8f854033804dc`;
  - schema `lib/tools/schemas/tool-023-trt-optimization.ts` — tracked, clean, blob `160ac4e25f0c4eab4c14e79c1703f7a3015319d5` (part of P-03 commit `37f047a4`);
  - pipeline `lib/tools/r6/tool-023-trt-optimization-pipeline.ts` — tracked, clean, blob `56a8caef217a310f461111b385be6b7591ce249e`;
  - contract `lib/tools/r6/tool-023-trt-optimization-contract.ts` — **UNTRACKED** (no index blob);
  - component `components/tools/tool-023-trt-optimization.tsx` — tracked but **MODIFIED** in WT (index blob `ffeac0f7ab8d2414a9206425b5c9471b5ec3a67b`); modified bytes preserved, not inspected as authoritative;
  - i18n `i18n/tool-023-trt-optimization.json` — tracked but **MODIFIED** in WT (index blob `844fb4c0e57e58383a23a0a47ff2bbc15b08d285`); modified bytes preserved;
  - genius / OCR / PDF / visual / test components `components/tools/tool-023-trt-optimization.{genius,ocr,pdf,visual,test}.tsx` — **UNTRACKED** (observed);
  - grid proof artifact `docs/…/evidence-clean-build-2026-11-18/tool-023-schema-engine-proof.test.ts` — **UNTRACKED**, observed SHA-256 `992694C76F62AB061F5705277DE868F49FF602CFABEFB4372BB69F7B1E61F4FA`.
  This is the weakest artifact-tracking posture of the four audited tools; no status was altered by this audit.
- **Historical start / engine intent:** `calculateTrtOptimization` is a deterministic heuristic TRT protocol engine emitting a *numeric weekly dose*, target total testosterone, estimated free ratio, expected hematocrit, estradiol-management strategy, monitoring schedule, risk factors and procedure tips. Its output is clinical in nature; no approved source, clinical/model review sign-off or owner acceptance was found (D-C4 / D-CLIN open). This is the highest-severity implementation finding in this audit (I-023-1).
- **Relevant SHAs:** fixed baseline `37f047a4`; closure snapshot `8d7e406c` (2026-11-17); Tool 039 reference baseline `5a87f3e5` (reference only); true-clean context `E:\p03-true-clean-20261118@37f047a4`; contaminated `2a647fda` excluded; grid artifact `992694C7…1F4FA` (observed).
- **Original requirements / owner decisions:** closure ledger records D-C4, D-C5, D-CLIN, D-W18, D-P03; no tool-specific development proposal was verified for 023 (ledger line 10 says none in docs folder). No owner acceptance found.
- **Historical acceptance:** none. The component header claims "Full parity with Tool 039 benchmark" (P-01…P-06); the Tool 039 engineering reference records P-01…P-05 as **unadopted** reference ideas, and 039's `OWNER_ACCEPTED` status is not transferable. Parity claim is an assertion, not acceptance.
- **Current owner:** R6.1 programme owner for gates/decisions; clinical/model reviewer and tool implementation owner required before any acceptance. No explicit Tool 023 owner-acceptance decision found.

## B. Original and R6.1 Requirements

**Canonical denominator finding (explicit):** the official per-tool atomic requirement denominator for Tool 023 **cannot be fully recovered** from authoritative sources, so the 18-row closure register is **not** presented as the official acceptance denominator. Available sources: (a) generic 18-row closure register (MD/CSV + B1b ledger) used strictly as an **operational audit matrix**; (b) system-wide canonical IDs in `tool-039-requirements.csv` and `REQUIREMENT-TRACEABILITY-MATRIX.md`, **engineering reference only**; (c) `R6.1-SYSTEM-REQUIREMENT-REGISTER.md`; (d) P-03 closure report. **Missing:** a per-tool atomic requirements CSV with owner-approved A/B/C dimensions for 023, a tool-specific acceptance file, and a reconciled grid-acceptance specification. No denominator is invented.

**Two distinct counts (do not merge):**
- Operational 18-row register (B1b + closure ledger): **0/18 PASS(E3+)** — no row in the register reaches E3+; the one E2 row (TEST-FOCUSED) does not count.
- Expanded 21-item evidence view (18 operational rows + three separated Tool 023 items (a), (b), (c)): **2/21 PASS(E3+)** — only items **(b)** and **(c)**, both *recorded* E3 in the uncommitted P-03 report; item **(a)** is NOT_RUN / E2 PARTIAL and contributes **no** PASS. The 21-item view is an evidence-inventory device, **not** an official denominator.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| SPEC-R6.1-1.a/1.b/1.c, C-2, C-8 | `ENG-PIPELINE` | Compute via R6 pipeline path only (no UI-side engine logic) | APPLICABLE | `tool-023-trt-optimization-pipeline.ts` tracked: `trtOptimizationInputSchema.tryParse` → engine → `TrtResultSchema.safeParse` → `createToolOutput` → `isToolOutput`; component calls pipeline via 120 ms debounce (static) | No per-tool canonical row; operational matrix only |
| SPEC-R6.1-1.e, SPEC-R6.1-2.b, ACC-R6.1-3.c, ACC-5.5.10 | `STATE-5` | Five states EMPTY/PARTIAL/INVALID/FULL/DEGRADED implemented honestly | APPLICABLE | `Tool023State` five-value union and `data-r6-state={currentState}` in component (static; WT-modified) | E3/E4 state proof absent |
| SPEC-R6.1-3.a, LAYER-GENIUS12-01…12 | `UI-GENIUS12` | GENIUS-12 fixed order present once (no hidden/duplicate boxes) + CORE-5 | APPLICABLE | Untracked `...genius.tsx`, 12-box array, compact selector `[1,2,3,7,9,12]` (static) | No DOM/E4 proof; compact mode shows **six** boxes while labeled "Core-5" (§M I-023-4) |
| SPEC-R6.1-3.d, SPEC-R6.1-6.b/6.c, ACC-5.5.6 | `I18N-PARITY` | AR/EN parity, required keys resolved, no contamination | APPLICABLE | i18n JSON tracked but **WT-modified**; no 023 i18n-check script verified | Ledger NOT_RUN/E0; no re-run |
| LAYER-GENIUS12-10, LAYER-20MAP-07 | `EXPORT-CSV` | Browser-only CSV export (no server/session identifier) | APPLICABLE | No export function verified in tracked contract (contract untracked) | Ledger PARTIAL/E1; no browser proof |
| ACC-R6.1-3.a/b/c, G-1/G-2/G-3 | `TEST-FOCUSED` | Focused tests pass (pipeline/contract/component/i18n-evidence as applicable) | APPLICABLE | Tracked pipeline only; test/OCR/PDF/visual components untracked; proof artifact untracked | Ledger PARTIAL/E2; no consolidated per-tool battery |
| ACC-R6.1-3.a | `BUILD-TSC` | tsc --noEmit and next build pass with route present | APPLICABLE | Historical deployment build record only (506/506 routes, `8d7e406c` era) | No archived artifact pinned to `37f047a4` |
| LAYER-20MAP-07, SPEC-R6.1-3.g | `PREVIEW-ROUTE` | Direct Preview route loads for tool (SSR/accessible) | APPLICABLE | Route file present; preview redirects to Vercel SSO in real checks per ledger | NOT_RUN; route conflict absent but E4 blocked |
| SPEC-R6.1-3.d, ACC-5.5.6 | `BROWSER-EN-AR` | EN and AR functional pass on Preview | APPLICABLE | i18n resource present (static) | Browser NOT_RUN |
| SPEC-R6.1-1.e, ACC-R6.1-3.c, ACC-5.5.10 | `BROWSER-5-STATES` | Five states exercised on Preview | APPLICABLE | Static state code only | Browser NOT_RUN |
| ACC-5.5.6, ACC-5.5.7, ACC-5.5.7-LEGIBILITY | `RTL-390` | Real Arabic RTL at 390px | APPLICABLE | `dir={isRtl ? 'rtl' : 'ltr'}` (static) | Device/browser NOT_RUN |
| ACC-R6.1-3.a, SPEC-R6.1-5.d | `CONSOLE-HYDRATION` | No Console errors or SSR/Hydration issues | APPLICABLE | — | Browser NOT_RUN |
| SPEC-R6.1-3.a, LAYER-DOMAIN-RULE | `NO-DUP-GENIUS` | No duplicate GENIUS-12 / no hidden box / no double shell | APPLICABLE | Static 12-box structure in untracked genius | DOM proof NOT_RUN |
| LAYER-CORE5-C4, LAYER-GENIUS12-09, SPEC-R6.1-2.f | `C4-SOURCES` | Specialist-approved sources/provenance or owner-approved N/A | APPLICABLE | Untracked contract `TOOL_023_SOURCES` lists two guideline links (lines 113–122), but ledger says D-C4 open / no approved source | Conflict: static source strings are **not** approved provenance; NOT_AVAILABLE stands |
| LAYER-CORE5-C5, LAYER-GENIUS12-12, SPEC-R6.1-5.g, ACC-R6.1-3.i | `C5-REFERRAL` | Specialist-approved referral/seek-care wording (AR/EN) | APPLICABLE | Static physician-review string in untracked genius | D-C5 open — NOT_AVAILABLE |
| D-CLIN (no canonical atomic ID recovered) | `CLINICAL-REVIEW` | Clinical/model review sign-off as applicable | APPLICABLE | No sign-off found; engine emits numeric dose + AI-management advice | **Original requirement ID not recoverable — explicit missing mapping**; D-CLIN BLOCKED |
| SPEC-R6.1-4.f, SPEC-R6.1-6.d | `W18-HISTORY` | History/storage/sync per W18 decision | APPLICABLE | Box 11 `not_available`; no storage observed | D-W18 open |
| SPEC-R6.1-1.b/1.c, C-4/C-6/C-8, P-03 | `P03-PIPELINE` | Shared R6 pipeline result-schema enforcement (if applicable) | APPLICABLE | Tracked pipeline has `safeParse` + `isToolOutput`; structural PASS in TC; see separated items (b)/(c) | Ledger `NOT_IMPLEMENTED` stale vs committed gate |
| Separated item (a) — no canonical ID | `A-GRID-12800-32000` | Acceptance grid: recorded "12,800 combinations, 0 rejections" vs proof assertion `5*4*4*5*4*4*5` = 32,000 | APPLICABLE (evidence validation) | Proof artifact SHA `992694C7…1F4FA` asserts 32,000; P-03 report line 35 records "12,800-combo grid = acceptance-only (sampled)" | **Inconsistent and unverified: NOT_RUN, E2 PARTIAL, no E3.** Grid dimensions not reconciled; no executed grid log; no transfer to (b) or (c) |
| Separated item (b) — P-03 dependency proof | `B-RESULT-SCHEMA-REJECTION` | `TrtResultSchema` rejects mismatched / null / empty engine results | APPLICABLE | P-03 report lines 19–20: untracked `p03-runtime-negative-coverage.test.ts`, **30/30 PASS** incl. Tool 023 rejection; sensitivity control ungated `tool-007` produced envelope | **PASS(E3) recorded, uncommitted** — distinct from (a); not clean-clone reproducible |
| Separated item (c) — envelope protection | `C-NO-ENVELOPE-ON-FAILURE` | On schema rejection: `{ok:false,error}`, no `output`, no raw passthrough | APPLICABLE | P-03 report lines 15, 19–20 and row 8: `NE on failure = PASS (by IR)` | **PASS(E3) recorded, uncommitted** — distinct from (b) (which proves rejection); full clean-clone closure still partial |

**Counts recap (no conflation):** 18-row register PASS(E3+) = 0; expanded 21-item view PASS(E3+) = 2 = items (b)+(c) only; item (a) = NOT_RUN with zero PASS contribution.

**Source authority conflict log:**
| Source | Location | Impact | Resolution required |
|---|---|---|---|
| Grid count inconsistency | proof artifact `5*4*4*5*4*4*5` = 32,000 vs P-03 report "12,800" | Acceptance-grid claim unverified | Reconcile grid definition and archive executed log; no E3 until then |
| Uncommitted negative suite | `lib/tools/r6/p03-runtime-negative-coverage.test.ts` WT/untracked | (b)/(c) recorded E3 not clean-clone reproducible | Scoped approval/commit + true-clean rerun |
| Modified/untracked 023 artifacts | component/i18n modified; contract/genius/OCR/PDF/visual/test untracked | Static findings are not HEAD-content-stable | Preserve WT; review/track in authorized phase |
| `TOOL_023_SOURCES` vs D-C4 | untracked contract lines 113–122 vs ledger row 15 | Source strings mistaken for approved provenance | Treat D-C4 open until owner approves |
| Contract clock purity | untracked contract line 85 `Date.now()` vs header "zero system clock dependencies" | Purity claim false | Inject `now` or fix header (authorized change) |
| P03 ledger wording | `P03-PIPELINE NOT_IMPLEMENTED` vs tracked gate | Status understatement | Reconcile in authorized update |
| B1b embedded self-hash | line 352 `90524E2C…` vs observed `607D9993…` | Hash mismatch | Observed on-disk authority; original not edited |
| Tool 039 parity claim | component header P-01…P-06 vs 039 profile "P-01…P-05 unadopted" | Acceptance-parity misreading | Reference only; no transfer |

## C. Existing Architecture and Implementation

| Exact path | Git status | Role | Test file | Actual status |
|---|---|---|---|---|
| `app/smarttools/tool-023-trt-optimization/page.tsx` | tracked (route present) | canonical route | — | present |
| `lib/tools/engines/tool-023-trt-optimization.ts` | tracked, clean (`328d2151…`) | clinical heuristic engine | no verified tracked engine test | static present |
| `lib/tools/schemas/tool-023-trt-optimization.ts` | tracked, clean (`160ac4e2…`) | strict Zod input + result contract | P-03 proof (untracked) | static present |
| `lib/tools/r6/tool-023-trt-optimization-pipeline.ts` | tracked, clean (`56a8caef…`) | R6 pipeline, fail-closed envelope | no tracked focused test | structural present |
| `lib/tools/r6/tool-023-trt-optimization-contract.ts` | **UNTRACKED** | limits / sources / freshness / bands | — | static present, not HEAD-stable |
| `components/tools/tool-023-trt-optimization.tsx` | tracked, **MODIFIED** | 5-state UI, 120 ms debounce, demo/OCR/PDF hooks | untracked test | static, WT-modified |
| `components/tools/tool-023-trt-optimization.genius.tsx` | **UNTRACKED** | GENIUS-12 / CORE-5 / referral text | — | static present |
| `components/tools/tool-023-trt-optimization.{ocr,pdf,visual,test}.tsx` | **UNTRACKED** | OCR/PDF/visual/test parity artifacts | — | static present |
| `i18n/tool-023-trt-optimization.json` | tracked, **MODIFIED** | AR/EN copy | — | static, WT-modified |
| `docs/…/tool-023-schema-engine-proof.test.ts` | **UNTRACKED** | grid (a) artifact | — | SHA `992694C7…` observed |

**Dependencies:** React client component; canonical `createToolSchema` / `createToolOutput` / `isToolOutput`; `requireTool`/`buildSeoLinks`; Zod; shared R6 shell; `TOOL_023_DEBOUNCE_MS = 120` from untracked contract. OCR/PDF are client-side modules (static claim, untracked). No Supabase/network/storage import verified in tracked tool paths. Nothing was built, imported or executed; all WT changes were preserved.

## D. Math Engine and Equation Audit

- **Equations (static, `calculateTrtOptimization`, lines 38–129):**
  - `targetTotalTest = 750 ng/dL` (hardcoded midpoint of claimed 500–1000 optimal range);
  - `estimatedFreeTest = current_free_test_pg_mL` when provided, else `(current_total_test || 400) × 0.02` (silent default of 400 when falsey — masking pattern);
  - `baseDose = 100 + (750 − current_total_test)/10` when total T present; symptom bump severe +50 / moderate +25 / mild +10; `recommended_dose_mg_weekly = round(clamp(baseDose, 80, 200), 1)`;
  - `expected_hematocrit = min(55, hematocrit_current + 3)` when provided;
  - E2 strategy: `> 50 → aromatase_inhibitor`, `> 30 → monitor`, else `monitor`;
  - `monitoring_schedule = trt_duration_months < 3 ? 'biweekly' : 'monthly'`;
  - estimated free ratio `round((estimatedFreeTest ?? 0) / (current_total_test || 750), 2)`.
- **Validation boundary:** the engine itself does **not** call `TrtInputSchema.parse`; validation occurs in the pipeline via `trtOptimizationInputSchema.tryParse` (static). Schema is strict with finite/nonnegative and bounded fields (age 18–80, symptoms/administration enums, duration 0–600). Direct engine calls bypass validation — a boundary difference from tools 016/022.
- **Units:** ng/dL, pg/mL, %, months, mg/week; pipeline declares `TRT_RESULT_UNIT = 'mg/week'` (static). No metric/imperial conversion in the engine; any measurement toggle is UI-layer only (unverified).
- **Zero/negative/NaN/Infinity:** Zod rejects invalid values at pipeline boundary; direct engine calls have no guard. The `(x || default)` patterns substitute values for 0, which is reachable in principle for optional numeric fields — flagged as I-023-3.
- **Boundaries/precision/determinism:** clamp [80, 200] and `min(55, …)` bound extremes; rounding is explicit; no confidence interval, no calibrated PK/PD model, no cited derivation for the "10 ng/dL ≈ 1 mg" coefficient. Engine is pure (no I/O, clock, randomness, DB) — but it is **not** non-clinical: it outputs an actionable dose and management advice (I-023-1).
- **Tests run vs NOT_RUN:** `npx vitest run lib/tools/r6/tool-023-trt-optimization-pipeline.test.ts` — **NOT_RUN**; no tracked focused engine test identified. Static inspection supports E2 only.

## E. Pipeline and Schema Audit

Chain (static, `tool-023-trt-optimization-pipeline.ts:104–123`): `trtOptimizationInputSchema.tryParse(rawInput)` → `calculateTrtOptimization(parsed.data)` → `TrtResultSchema.safeParse(engineResult)` → `buildTrtOptimizationOutput` → `createToolOutput` → `isToolOutput` → `{ok:true,output}` / `{ok:false,error}`. Every failure branch is fail-closed with no envelope. Provenance is honest (`confidence: null`, `dataQuality: 'not_assessed'`) while `referenceRange.source: 'TRT optimization engine'` is self-referential (not independent provenance). The P-03 report records the committed gate as structurally PASS and rejected-result behavior in an uncommitted suite; the three separated items are reported in §B and §L and are **not** merged here. No test was executed by this audit.

## F. AI and Intelligence Capabilities

- AI brain / prompt / model / provider / RAG / embedding: **NotApplicable** — no model or network call observed (static). Explanation / what-if: static heuristic key findings and UI parity artifacts only.
- **Clinical decision-like content:** the engine emits `recommended_dose_mg_weekly`, `e2_management` including `aromatase_inhibitor`, `monitoring_schedule`, and procedure tips including "HCG optional" and injection intervals. This is **algorithmic clinical advice**, not AI, and it has no approved source or clinical review — the principal safety gap (I-023-1).
- Prediction: **Unavailable** as validated prediction; `expected_hematocrit` is a +3 heuristic, not a model output. Uncertainty: **Unavailable** (`confidence_not_assessed`).
- Safety/limits: **Implemented (static, UI text only)**; **RuntimeVerified: No**. A source link, gauge or PDF button is not proof of clinical validity.

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next action |
|---|---|---|---|---|---|---|---|---|
| C1 primary result + unit/confidence | YES | YES | static (untracked genius) | NO | NO | box 1/2 dose display | no E3/E4 | DOM test |
| C2 how/assumptions/inputs | YES | YES | static | NO | NO | heuristic boxes | no E3 | component test |
| C3 safety/red flags/referral | YES | partial static | static physician-review string | NO | NO | untracked genius | D-C5 open | approved wording |
| C4 sources | YES | YES | two static links; unapproved | NO | NO | `TOOL_023_SOURCES` lines 113–122 | D-C4 open | approved pack / N-A |
| C5 next actions | YES | partial static | static | NO | NO | untracked genius | D-C5 open | approved pack |
| Boxes 1–12 fixed order | YES | YES | static in untracked genius | NO | NO | 12-box array, line 287 | no DOM proof | preview DOM check |
| Compact CORE-5 parity (C1 equal) | YES | static | selector `[1,2,3,7,9,12]` (six boxes) | NO | NO | untracked genius line 290 | labeled "Core-5" but 6 boxes (I-023-4) | parity test + count fix |
| Non-applicable box states reason | YES | YES | static | NO | NO | `not_available` badges | no E4 | preview check |

Ordering/visibility/compact-full parity are static observations only; untracked artifacts are not HEAD-stable.

## H. Dynamic Results and UI Maturity

- **Static inspection:** component defines `Tool023State = 'EMPTY' | 'PARTIAL' | 'FULL' | 'INVALID' | 'DEGRADED'` (line 72), `isDemoActive` synthetic-demo state (lines 80, 227–246), `useEffect` + `setTimeout(..., TOOL_023_DEBOUNCE_MS = 120)` pipeline execution (lines 181–221), `dir={isRtl ? 'rtl' : 'ltr'}` and `data-r6-state={currentState}` (lines 268–269). These are static observations of a WT-modified file.
- **MVO:** numeric weekly dose + monitoring/E2 guidance is the current output; because it is clinical, MVO cannot be accepted without clinical review.
- **Component test:** untracked (`...test.tsx`). **Integration test:** no tracked focused pipeline test. **True-Clean:** P-03 report records structural/tracked-pipeline suites at `37f047a4`, but no 023-specific valid-branch re-run (row 8 `VR = NOT_RUN`). **Browser E4:** NOT_RUN (SSO preview).
- Live recalculation, debounce, demo, OCR/PDF and 390 px behavior are **static claims only**; no E3/E4 is claimed here.

## I. Cross-Tool and Data Integration

- The component header claims parity with Tool 039 benchmark items P-01 (visual range gauge), P-03 (client-side OCR), P-04 (print PDF), P-05 (explicit 5-state lifecycle), P-06 (debounce / zero session persistence). The Tool 039 engineering reference records P-01…P-05 as **unadopted reference ideas**; 023's adoption is an implementation choice, not transferable acceptance.
- No concrete 023 cross-tool field mapping was verified in the tracked contract (which is untracked and therefore not authoritative for HEAD). Producer/consumer: engine → pipeline → component → genius; no evidence of any external consumer reading 023 output. Error propagation is fail-closed (static). **W18 boundary:** no storage/sync authorization found; OCR is claimed client-side; privacy behavior not runtime-verified.

## J. Safety, Sources and Privacy

- **Highest severity finding:** an actionable weekly dose (80–200 mg), an aromatase-inhibitor strategy and injection/HCG advice are emitted from hardcoded heuristics with no approved source pack and no clinical/model review sign-off (D-C4 / D-CLIN open). This must not be presented as validated medical guidance.
- Validation: strict Zod at pipeline boundary; direct engine calls unvalidated (§D). API/auth: no API route/auth code verified in tracked tool paths. Data exposure/logging: no value logging observed statically; browser console NOT_RUN. Storage: none verified; W18 open.
- Domain warnings/red flags/referral: static strings and two guideline URLs only; D-C4 / D-C5 / D-CLIN unresolved. Clinical review is BLOCKED. No specialist sign-off claimed.

## K. Localization and Browser Maturity

- `i18n/tool-023-trt-optimization.json` is tracked but **WT-modified**; closure ledger records `I18N-PARITY NOT_RUN / E0` and "no R6.1 i18n-check script in docs folder". Planned check: `node node_modules/vitest/vitest.mjs run tests/unit/tool-023-i18n-evidence.test.ts` (if such a file exists after review) — **NOT_RUN**.
- EN/AR functional pass, RTL-390, console/hydration, no-duplicate-GENIUS and direct preview route: **NOT_RUN** (E0). E4 prerequisites unavailable: SSO-compliant session, preview pinned to `37f047a4`, Deployment ID, and HEAD-stable artifacts. No browser claim made.

## L. Tests and Evidence

**Separated Tool 023 evidence items (each with its own command and status):**

| Item | What it proves | Exact isolated command | Recorded evidence | Status | Level | Clean-clone reproducibility |
|---|---|---|---|---|---|---|
| **(a) Grid 12,800 vs 32,000** | Acceptance-grid size / rejection count | `node node_modules/vitest/vitest.mjs run "docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/evidence-clean-build-2026-11-18/tool-023-schema-engine-proof.test.ts"` (also requires an archived executed grid log reconciling 12,800 vs 32,000) | Proof artifact asserts `expect(checked).toBe(5*4*4*5*4*4*5)` = **32,000**; P-03 report records a **12,800**-combo grid, "acceptance-only (sampled)", and a recorded command text claiming "0 rejections" | **NOT_RUN / inconsistent / unverified — no E3** | E2 PARTIAL (static contradiction only) | No executed grid log; dimensions unreconciled |
| **(b) Result-Schema rejection proof** | Real `TrtResultSchema` rejects mismatched / null / empty engine results | `node node_modules/vitest/vitest.mjs run lib/tools/r6/p03-runtime-negative-coverage.test.ts` | P-03 report lines 19–20: **30/30 PASS** across 29 pipelines + Tool 023 rejection; sensitivity control ungated `tool-007` produced an envelope | **PASS (recorded, uncommitted)** | E3 (recorded) | Not clean-clone reproducible until tracked/committed |
| **(c) Envelope protection** | On failure: `ok:false`, no `output`, no raw passthrough | `node node_modules/vitest/vitest.mjs run lib/tools/r6/p03-runtime-negative-coverage.test.ts lib/tools/r6/__p03-control.test.ts` | P-03 report lines 15, 19–20 and row 8: `NE on failure = PASS (by IR)` | **PASS (recorded, uncommitted)** | E3 (recorded) | Not clean-clone reproducible until tracked/committed |

**Other evidence rows:**

| ID | Requirement | Source file | Test command (isolated) | Environment | Source SHA (observed, first 16) | Date | Actual result | Level | Reproducibility / validity | HEAD compatibility |
|---|---|---|---|---|---|---|---|---|---|---|
| E-023-01 | ENG-PIPELINE | `lib/tools/r6/tool-023-trt-optimization-pipeline.ts` | `node node_modules/vitest/vitest.mjs run lib/tools/r6/tool-023-trt-optimization-pipeline.test.ts` | deps-present repo | `56A8CAEF217A310F` | 2026-11-19 | **NOT_RUN** (no tracked focused test) | E2 | not reproducible | tracked at HEAD |
| E-023-02 | STATE-5 / UI | `components/tools/tool-023-trt-optimization.test.tsx` | `node node_modules/vitest/vitest.mjs run components/tools/tool-023-trt-optimization.test.tsx` | deps-present repo | `FFEAC0F7AB8D2414` (index blob; WT modified) | 2026-11-19 | **NOT_RUN** | E2 | not reproducible | untracked test / modified component |
| E-023-03 | BUILD-TSC | repository build config | `node node_modules/typescript/bin/tsc --noEmit --pretty false`; `node node_modules/next/dist/bin/next build` | clean worktree at target SHA, deps present, no installs | — | 2026-11-19 | **NOT_RUN** | E2 (historical claim) | not reproducible | no `37f047a4` artifact |
| E-023-04 | browser rows | preview URL | `curl -sS -o NUL -w "%{http_code}" <preview-url>` + authorized browser | accessible preview | — | 2026-11-19 | **NOT_RUN** | E0 | n/a | SSO blocked |
| E-023-05 | B1b evidence reuse | `retry-01/B1b-LEDGER-016-023.md` | read-only hash + row review | this audit | `607D9993572C384E9` | 2026-11-19 | reviewed, 18 rows | E5 (audit of evidence) | reproducible hash | observed on-disk |
| E-023-06 | grid artifact identity | proof artifact | `Get-FileHash -Algorithm SHA256 -LiteralPath "<proof artifact>"` | this audit, read-only | `992694C76F62AB061F` | 2026-11-19 | hash observed | E2 | reproducible hash | untracked file |

No test, build, typecheck, lint, dev server, install or browser action was executed. Items (b)/(c) are **recorded** results from the P-03 report, not executions by this audit; item (a) is explicitly NOT_RUN.

## M. Defect and Gap Register

**Implementation gaps**
| ID | Severity | Requirement | Exact file | Actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-023-1 | CRITICAL | `CLINICAL-REVIEW`, `C4-SOURCES` | `lib/tools/engines/tool-023-trt-optimization.ts` (lines 57–75, 85–94, 112–118) | Emits numeric weekly dose + AI-management/HCG advice vs no approved source or clinical review | Unvalidated clinical guidance presented as calculated result | hardcoded heuristics without sign-off | clinical/model review + approved source pack or convert to explicitly non-clinical educational output before any acceptance | high |
| I-023-2 | HIGH | `P03-PIPELINE`, `TEST-FOCUSED` | `lib/tools/r6/tool-023-trt-optimization-contract.ts`, genius/OCR/PDF/visual/test components, proof test | All **untracked**; component/i18n **WT-modified** | Evidence not stable at HEAD; cannot claim clean-clone E3 | artifacts not committed | review/track per approval; preserve WT changes (later authorized phase) | medium |
| I-023-3 | MEDIUM | `ENG-PIPELINE`, input rigor | `lib/tools/engines/tool-023-trt-optimization.ts` (lines 52–54, 62–66, 122) | Engine bypasses `TrtInputSchema.parse`; `(x || default)` substitutes for 0 | Direct callers can produce unvalidated/odd results | validation only in pipeline | validate at engine boundary or forbid direct engine calls in contract docs | low |
| I-023-4 | MEDIUM | `UI-GENIUS12`, `STATE-5` | `components/tools/tool-023-trt-optimization.genius.tsx` (line 289–290, untracked) | Comment says "Core-5 compact mode" but selector `[1,2,3,7,9,12]` shows **six** boxes | CORE-5 compact contract mismatch | copy/paste from 039 compact list | decide canonical 5-box mapping and test parity | low |
| I-023-5 | LOW | purity claim | `lib/tools/r6/tool-023-trt-optimization-contract.ts` (line 85 `Date.now()` vs header "zero … system clock dependencies") | Header contradicts code | purity claim false | clock used for lab-freshness | inject `now` parameter or correct header (authorized change) | low |
| I-023-6 | HIGH | evidence item (a) | proof artifact `…tool-023-schema-engine-proof.test.ts` vs P-03 report line 35 | 32,000 assertion vs 12,800 recorded grid | acceptance-grid claim unverified | inconsistent dimension set / differing grid definitions | reconcile dimensions, archive executed log, then re-evaluate | low |

**Evidence gaps**
| ID | Severity | Requirement | Exact file | Gap | Impact | Next action |
|---|---|---|---|---|---|---|
| V-023-1 | CRITICAL | `C4-SOURCES`, `C5-REFERRAL`, `CLINICAL-REVIEW`, `W18-HISTORY` | closure ledger rows 15–18 | D-C4/D-C5/D-CLIN/D-W18 open | 4 rows unresolved | owner + clinical decisions and evidence |
| V-023-2 | HIGH | evidence items (b)/(c) | `lib/tools/r6/p03-runtime-negative-coverage.test.ts` (untracked) | Recorded E3 not committed / clean-clone reproducible | 2 PASS rows not durable | scoped approval/commit + true-clean rerun |
| V-023-3 | HIGH | evidence item (a) | proof artifact + P-03 report | Grid count conflict, no executed log | 0 PASS for (a) | reconcile and archive |
| V-023-4 | HIGH | 6 browser rows | preview URL | E4 NOT_RUN | 6 rows unresolved | authorized preview + capture |
| V-023-5 | HIGH | `BUILD-TSC`, `I18N-PARITY` | build config / i18n JSON (modified) | no `37f047a4` artifact; no parity run | rows PARTIAL / NOT_RUN | archive clean build + parity check |
| V-023-6 | MEDIUM | `P03-PIPELINE` | tracked pipeline | no tracked valid-branch E3 | partial closure | approval-gated tracked test |

## N. Development Maturity Matrix (S0–S11 per component)

Each component is evaluated independently across all twelve stages; a stage reached by one component is never transferred to another. `V` = static inspection (E2), `T` = E3 test evidence in-hand (recorded or run), `R` = E4 runtime, `O` = owner-accepted (E5), `—` = not reached, `P` = partial. S10/S11 are reported only from actual browser/owner evidence, never from a plan or proposal.

| Component | S0 | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Identity / registry | V | — | — | — | — | — | — | — | — | — | — | — | S0 | S1 | no per-tool denominator |
| Requirements | — | P | — | — | — | — | — | — | — | — | — | — | S1 (partial) | S2 | official denominator missing |
| Architecture | — | — | V | — | — | — | — | — | — | — | — | — | S2 | S3 | untracked/modified artifacts |
| Math engine | — | — | — | V | — | — | — | — | — | — | — | — | S3 | S4 (E3 engine test) | NOT_RUN; clinical gap I-023-1 |
| Pipeline / schema | — | — | — | — | V | — | — | — | — | — | — | — | S4 (structural + recorded (b)/(c) E3) | S5 (clean-clone E3) | negative suite uncommitted |
| UI / state | — | — | — | — | — | V | — | — | — | — | — | — | S5 (static, WT-modified) | S6 (component E3) | untracked tests |
| AI / CORE-5 / GENIUS-12 | — | — | — | — | — | — | V | — | — | — | — | — | S6 (static, no AI; 6-box compact) | S7 (DOM E3) | untracked genius |
| Cross-tool / safety | — | — | — | — | — | — | — | P | — | — | — | — | S7 (partial static) | S8 | D-C4/C5/CLIN/W18 open |
| Testing | — | — | — | — | — | — | — | — | P | — | — | — | S8 (partial: (b)/(c) recorded) | S9 | no clean-clone reproducibility |
| True-clean | — | — | — | — | — | — | — | — | — | — | — | — | S0 only | S1 023-specific true-clean log | `VR = NOT_RUN` in P-03 row 8 |
| Browser | — | — | — | — | — | — | — | — | — | — | — | — | S0 only (no E4) | S1 browser | SSO / unavailable |
| External / owner | — | — | — | — | — | — | — | — | — | — | — | — | S0 only — no owner acceptance | S1 | owner step; never from a plan |

Engine S9 is not transferred to browser S0, and vice versa; no component reaches S10/S11. Recorded items (b)/(c) do not promote the grid item (a) or any other component.

## O. Comparison with Tool 039 (applicable engineering criteria only)

Tool 039 is an engineering reference, never one of the 29 audited tools. Its `OWNER_ACCEPTED` rows and D-08 local-device storage exception are **039-only and not transferred**. P-01…P-05 are recorded as **unadopted** reference ideas in the 039 profile; 023's component claims to implement several, which is an adoption choice with no acceptance value. No similarity score is computed.

| Dimension | Status | Engineering reason | Action |
|---|---|---|---|
| Architecture | PARTIALLY_APPLICABLE | Same registry → component → schema → pipeline → envelope layering; 023 has 120 ms debounce but contract/genius/tests untracked and component/i18n modified | Preserve layering; Extend tracking |
| Engine | PARTIALLY_APPLICABLE | Both pure deterministic engines; 039 emits non-diagnostic ULN status, 023 emits an actionable dose and management advice — materially different safety profile | Fix (clinical review / de-scope) before acceptance |
| Validation | PARTIALLY_APPLICABLE | Strict input + result Zod and `isToolOutput`; engine itself unvalidated; (b)/(c) recorded E3 uncommitted | Fix (engine boundary + track negative suite) |
| AI | NOT_APPLICABLE | No model in either; 039 no-AI contract is reference | Preserve as non-AI benchmark |
| Dynamic Results | PARTIALLY_APPLICABLE | 023 has 5 states and debounce statically, but no E3/E4 and no stable tracked test | Extend |
| CORE-5 | NOT_VERIFIED | Compact selector shows six boxes while comment says Core-5; no parity test | Fix mapping; Extend proof |
| GENIUS-12 | PARTIALLY_APPLICABLE | 12 boxes static in untracked genius; C4 unapproved | Preserve order; Fix sources |
| Cross-Tool | NOT_APPLICABLE | No verified concrete 023 field mapping; 039 declares three — different integration scope | Preserve boundary |
| Safety | NOT_APPLICABLE | Not comparable: 039 explicitly avoids diagnosis; 023 outputs clinical dosing without sign-off | Fix (I-023-1) — do not transfer 039's accepted status |
| Testing | NOT_VERIFIED | No tracked focused 023 suite executed here; item (a) NOT_RUN; 039 historic E3/E4 not transferable | Fix (authorized isolated re-runs + grid reconciliation) |
| Browser — current-HEAD E4 | NOT_AVAILABLE | No preview pinned to `37f047a4` with Deployment ID; SSO gate not met | Extend after gate |
| Browser — historic artifact transfer | NOT_VERIFIED | Historic preview records exist but not pinned to fixed baseline; 023 artifacts untracked/modified | Preserve as history only |

## P. Next Development Tasks (proposals only — no implementation in this audit)

| # | Exact file | Proposed change | Required tests | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| 1 | `lib/tools/engines/tool-023-trt-optimization.ts` | obtain clinical/model review + approved sources, or de-scope numeric dose advice to explicit non-clinical education | focused engine tests + clinical sign-off | D-CLIN / D-C4 owners | high | safe, reviewable output | recorded sign-off; no unapproved dosing claim |
| 2 | grid proof artifact + `R6.1-P03-RESULTSCHEMA-CLOSURE-REPORT.md` (authorized update only) | reconcile 12,800 vs 32,000 grid and archive executed log | rerun grid command from §L item (a) | evidence owner | low | item (a) evaluated on evidence | consistent recorded dimensions + log |
| 3 | `lib/tools/r6/p03-runtime-negative-coverage.test.ts`, `lib/tools/r6/__p03-control.test.ts` | review/track negative suite; true-clean rerun | `node node_modules/vitest/vitest.mjs run lib/tools/r6/p03-runtime-negative-coverage.test.ts lib/tools/r6/__p03-control.test.ts` | scoped git approval | medium | (b)/(c) clean-clone E3 | PASS log at `37f047a4` |
| 4 | untracked 023 contract/genius/test components | review/track after WT review; preserve modified component/i18n bytes | component + DOM parity tests | owner approval | medium | HEAD-stable artifacts | tracking clean; six-box mismatch resolved |
| 5 | `lib/tools/r6/tool-023-trt-optimization-contract.ts` | inject clock or fix purity header; align C4 sources with approved pack | contract test | task 1 | low | honest contract | no hidden `Date.now()` |

Shared-component changes (if any) require a separate Change Impact Matrix before implementation.

## Q. Current Tool Decision

**Decision: REPAIR.** Two counts are reported separately and must not be merged:
- **Operational 18-row register: 0/18 = 0.00% PASS(E3+)** (no row reaches E3+; the single E2 TEST-FOCUSED row does not count).
- **Expanded 21-item evidence view: 2/21 = 9.52% PASS(E3+)** — only separated items **(b) Result-Schema rejection proof** and **(c) Envelope protection**, both **recorded** E3 in the uncommitted P-03 report; not clean-clone reproducible. Separated item **(a) 12,800-vs-32,000 grid** is **NOT_RUN / inconsistent / no E3** and contributes no PASS.

Preserved assets: strict input/result schema, tracked pipeline with fail-closed gate, honest provenance metadata (`confidence: null`), recorded negative-proof results for (b)/(c), and registry/ledger route consistency. Blocking gaps: unapproved clinical dose output with no clinical review (I-023-1), grid count inconsistency (I-023-6), untracked/modified artifacts (I-023-2), six-box "Core-5" mismatch (I-023-4), hidden clock (I-023-5), open D-C4/D-C5/D-CLIN/D-W18, no E4, and no clean-clone P-03 closure. `NOT_AVAILABLE ≠ NOT_APPLICABLE`; unresolved rows block 100%. The official per-tool denominator is unrecoverable, so these percentages are evidence-inventory measures only. **No owner acceptance is implied, claimed or transferred** (Tool 039's `OWNER_ACCEPTED` status, D-08 exception and P-01…P-05 history belong to Tool 039 only).

## Integrity note

The SHA-256 below is computed over all bytes of this file preceding the final hash line. Because that line is added after hashing, the whole-file SHA-256 differs by construction; the recorded body hash is the reproducible content fingerprint and is authoritative for this audit. The whole-file value is reported in the delivery response. No original source was edited to "fix" a hash.

Observed on-disk SHA-256 (body before this line): `F4AC992526825C84238587F06845EAB4767265D30B9BA4C32465ECA8D1AE0319`
