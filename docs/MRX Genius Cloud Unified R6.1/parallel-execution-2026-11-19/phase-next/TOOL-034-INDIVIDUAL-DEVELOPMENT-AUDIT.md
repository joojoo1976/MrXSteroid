# TOOL 034 — Individual Development Audit (R6.1 phase-next)

| Field | Value |
|---|---|
| Tool ID / canonical name | `mrx.tool.034-compound-clearance` — Single-dose Fractional Decay Scenario (Compound Clearance Calculator) |
| Canonical slug | `tool-034-compound-clearance` |
| Category / canonical route | `pharmacokinetics` / `/smarttools/pharmacokinetics/tool-034-compound-clearance` |
| Batch | 3 (closure ledger); operator review grid: round 3 / worker A |
| Fixed baseline | Branch `feat/r6.1-tools-041-042`; HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f`; audit date 2026-11-19 |
| Working tree | Dirty (46 modified tracked + many untracked at audit start); preserved unchanged; no git write |
| Governing standard | `00-PLAN-AND-AUDIT-STANDARD.md` — observed SHA `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9` |
| Denominator inventory | `W2-CANONICAL-DENOMINATOR-INVENTORY.md` — observed SHA `3276ACD111A66506568975ADA721F51FC520F7B28AF6C7CB9AB09916CAC96A6A` |
| Row-level evidence | `retry-01/B2b-LEDGER-034-044.md` — observed SHA `F9E17DA9E17B54B74FCC49C5F5BE12B7E3899CC895CD2A6149C16DED51C7A74B` (its embedded self-hash `6E6E6E03…` differs; observed wins) |
| Closure ledger (18-row) | `closure-sprint-2026-11-17/tool-034-closure-ledger.md` — observed SHA `3DCDEE927E64424ACC8835F0C2E45D8F9AF45CE02C6BFCB98EC1325FD2355B09` |
| Dev proposals | `docs/MRX Genius Cloud Unified R6.1/TOOL-034-DEVELOPMENT-PROPOSALS.md` — observed SHA `DDA8B082213FC84A5B66D6EEDA8EC1D374D9D5770C5645FB9CFB676D1BDF5FB7` |
| Shared-component map | `phase-next/W4b-SHARED-COMPONENT-IMPACT-MAP.md` — observed SHA `157FB3DD879BAE4AF66E4B3AA1404788A3AC469FF8AF1B7ED60C6E3D1282C263` |
| Reference profile | `phase-next/R6.1-TOOL-039-ENGINEERING-REFERENCE-PROFILE.md` — observed SHA `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` |
| True-clean reference | `E:\p03-true-clean-20261118` (HEAD verified `37f047a4105d078b22edea2c857bf35aefdbdc7f`, detached); contaminated `2a647fda` clone excluded |
| Tool decision (Section Q) | **NOT_VERIFIED** — 0% verified (0/18 at E3+); historical ledger 1/18 (5.56%); no owner acceptance implied |

**Scope and evidence discipline.** Read-only inspection plus this new document only. No code, contract, schema, source ledger, acceptance ledger, registry, route, test, git state, build, `tsc`, lint, Vitest, dev server, install, or browser/runtime E4 action was performed. All execution rows are `NOT_RUN` with exact isolated commands. Levels: E0 none, E1 assertion, E2 file/static code, E3 reproducible test, E4 runtime/browser, E5 independent audit. Only E3+ counts as PASS. Historical E3/E4 claims from the closure ledger are preserved as history, never re-awarded here. Observed on-disk SHA-256 is authoritative where an embedded self-hash differs.

---

## A. Tool Identity and Historical Lineage

| Attribute | Observed value | Evidence | Level |
|---|---|---|---|
| Tool ID / slug / version | `mrx.tool.034-compound-clearance` / `tool-034-compound-clearance` / `1.0.0` | `lib/tools/registry.ts:75`; `lib/tools/smartToolsCatalog6.ts:7` | E2 |
| Page enum / order / tier | `Page.COMPOUND_CLEARANCE` / `500` / `free` / `stackStatus: layered` | `lib/tools/registry.ts:75` | E2 |
| Category / canonical href | `pharmacokinetics` / `/smarttools/pharmacokinetics/tool-034-compound-clearance` | `lib/tools/categories.ts:114`; `lib/tools/registry.ts:75`; catalog line 7 | E2 |
| Flat legacy route | `app/smarttools/tool-034-compound-clearance/page.tsx` present (tracked blob `84d8931b…`) | `git ls-files -s` | E2 |
| Hierarchical route | `app/smarttools/[category]/[tool]/page.tsx` — validates catalog membership, renders `R6Progress`, `SafetyNotice`, then shared `R6ToolShell` for non-exempt tools | static read | E2 |
| R6 shell ownership | Non-exempt (shared shell) per W4b; tool nonetheless renders its own `tool-034-compound-clearance.genius.tsx` → potential duplicate-box risk requiring DOM verification, not a code change here | W4b §1–2; genius component | E2/E1 |
| Historical ledger identity | Batch 3; category/route stated as **cycle-management** `/smarttools/cycle-management/tool-034-compound-clearance`; tool source SHA `19e9301c`; snapshot HEAD `8d7e406c` | closure ledger lines 3–8 | E1 (historical) |
| Historical deployment | `dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL`, Vercel alias, SSO-protected; direct URL under `cycle-management` | closure ledger lines 7–8 | E1 |
| Historical acceptance | i18n `116/116 PASS` (re-run 2026-11-17); closure "pragmatic" `1/18 = 5.56%`; status `IN PROGRESS` / `NOT CLOSED`; **not** 100% VERIFIED | closure ledger lines 9–12 | E1 |
| Dev proposals | P-01..P-10, status "implemented and tested, owner review pending — NOT ACCEPTED, NOT CLOSED"; P-03/P-05/P-07 blocked/not-implemented; P-10 partial | proposals file lines 3–42 | E1 |
| Current owner/decision | No owner acceptance recorded in-repo at `37f047a4`; engine/schema/adapter/pipeline frozen for the proposal phase; engineering continuation only | proposals file lines 5–8, 28–42 | E1 |

Lineage conclusion: the canonical live identity is `pharmacokinetics`; the closure ledger's `cycle-management` route is historical drift and is recorded as an unsupported current claim (Section B.4). No tool ID, slug or route was altered.

---

## B. Original and R6.1 Requirements

### B.1 Canonical denominator finding (mandatory explicit statement)

**The canonical denominator for Tool 034 cannot be fully recovered from in-repo sources.** Per the frozen inventory, the only authoritative row-level register on disk is the 18-row closure ledger (`tool-034-closure-ledger.md/.csv`). There is no tool-specific atomic requirements CSV, no Initial Prompt / SPEC / ACCEPTANCE / CLOSURE-LAYER requirement map, and no master acceptance specification for Tool 034. The 18-row grid is an **operational review register only** and is **not** presented as the official acceptance denominator. Consequently the completion denominator is unresolved beyond this register; the 0%/1-of-18 figures below are explicitly register-scoped, not official-denominator claims.

What is missing: (a) original requirement IDs from the Initial Prompt/SPEC/ACCEPTANCE/CLOSURE-LAYER, (b) any one-to-one original-ID → atomic-requirement crosswalk, (c) a designated master acceptance spec per tool, (d) owner-approved N/A decisions for C4/C5/W18 rows, (e) approved source/provenance and referral packs. Dev proposals (P-01..P-10) are a different granularity (design/proposal states) and are not a substitute denominator.

### B.2 Canonical mapping table

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| ENG-PIPELINE | AUD-034-01 | R6 pipeline artifacts + focused pipeline evidence on current HEAD | APPLICABLE (register) | B2b §034(d); pipeline/contract SHAs in C.2 | No upstream original-ID source found; 18-row grid only |
| STATE-5 | AUD-034-02 | Five-state behavior EMPTY/PARTIAL/INVALID/FULL/DEGRADED, browser-verified | APPLICABLE (register) | `evaluateClearanceDraft`, `data-r6-state`, `data-r6-genius-state` | No upstream original-ID source found; browser E4 not run |
| UI-GENIUS12 | AUD-034-03 | Fixed 12-box order, CORE-5 behavior, no duplicate shell/hidden box | APPLICABLE (register) | genius boxes 1–12; compact selector `boxes[1,2,6,8,11]` | No upstream original-ID source found; DOM verification pending |
| I18N-PARITY | AUD-034-04 | EN/AR parity with archived evidence | APPLICABLE (register) | `i18n/tool-034-compound-clearance.json`; `tool-034-i18n-check.mjs`; tracked `tests/unit/tool-034-i18n-evidence.test.ts` | No upstream original-ID source found; historical 116/116 not re-run |
| EXPORT-CSV | AUD-034-05 | Client CSV export implemented and verifiable | APPLICABLE (register) | `buildClearanceCsv`; `data-r6-core="export"`; Blob download marker | No upstream original-ID source found; browser download not run |
| TEST-FOCUSED | AUD-034-06 | Focused battery rerun on current HEAD and archived | APPLICABLE (register) | tracked component/engine tests; untracked pipeline test | No upstream original-ID source found; no E3 evidence here |
| BUILD-TSC | AUD-034-07 | Clean tsc/build output archived for audited HEAD | APPLICABLE (register) | no live run; historical deployment claim only | No upstream original-ID source found; build evidence absent |
| PREVIEW-ROUTE | AUD-034-08 | Route loads on accessible preview | APPLICABLE (register) | tracked flat + hierarchical routes; SSO preview only | No upstream original-ID source found; preview unavailable |
| BROWSER-EN-AR | AUD-034-09 | EN/AR browser checks | APPLICABLE (register) | i18n JSON exists | No upstream original-ID source found; E4 unavailable |
| BROWSER-5-STATES | AUD-034-10 | Exercise five states in browser | APPLICABLE (register) | static state markers | No upstream original-ID source found; E4 unavailable |
| RTL-390 | AUD-034-11 | Real 390px RTL browser test | APPLICABLE (register) | AR locale exists | No upstream original-ID source found; E4 unavailable |
| CONSOLE-HYDRATION | AUD-034-12 | Browser console/hydration capture | APPLICABLE (register) | Next.js route present | No upstream original-ID source found; E4 unavailable |
| NO-DUP-GENIUS | AUD-034-13 | DOM inspection for duplicate shell/hidden box | APPLICABLE (register) | tool-owned genius + non-exempt shared shell (W4b) | No upstream original-ID source found; E4 unavailable |
| C4-SOURCES | AUD-034-14 | Approved source/provenance pack or owner-approved N/A | APPLICABLE (register) | `TOOL_034_SOURCES = []` (contract line 170); D-C4 open | No upstream original-ID source found; approval missing |
| C5-REFERRAL | AUD-034-15 | Approved referral wording | APPLICABLE (register) | `c5_not_available`; D-C5 open | No upstream original-ID source found; approval missing |
| CLINICAL-REVIEW | AUD-034-16 | Clinical/model review sign-off | APPLICABLE (register) | D-CLIN open; P-07 blocked | No upstream original-ID source found; sign-off missing |
| W18-HISTORY | AUD-034-17 | Box 11/history decision and storage boundary | APPLICABLE (register) | box 11 `not_available`; no storage; D-W18 open | No upstream original-ID source found; decision missing |
| P03-PIPELINE | AUD-034-18 | Shared P-03 pipeline layer / change approved and proved | APPLICABLE (register) | per-tool schema guard present; shared layer `NOT_IMPLEMENTED` in ledger | No upstream original-ID source found; shared approval missing |

### B.3 Totals

- Recovered register rows: **18**; applicable within recovered register: **18**; justified N/A: **0**; unmapped *within* register: **0**.
- Canonical denominator beyond the register: **unrecoverable** (see B.1); number of unmapped original requirements: **unknown**, therefore no official completion denominator is asserted.
- Completion, register-scoped only: `0 PASS(E3+) / 18 = 0%` (this audit); historical ledger-internal `1/18 = 5.56%` (E1 history, not re-certified).

### B.4 Source authority conflict log

| Source | Location | Conflict / impact | Resolution required |
|---|---|---|---|
| Closure ledger | lines 4, 8 | `cycle-management` route vs live `pharmacokinetics` | Treat ledger route as historical drift; no route change |
| Closure ledger | lines 9, 20–22 | historical i18n/test/build claims at HEAD `8d7e406c` | Preserve as history; re-run only under authorization |
| Dev proposals P-03 | line 17 | states result-schema enforcement NOT IMPLEMENTED, yet `runCompoundClearance` statically enforces `ClearanceResultSchema.safeParse` and `isToolOutput` | Distinguish per-tool guard (present) from shared P-03 layer/approval (open); owner ruling required |
| B2b summary | §034 | `data-r6-genius-state` attributed to genius file — confirmed present at genius line 273; main component uses `data-r6-state` (line 108) | No correction needed to original; both markers recorded distinctly |
| B2b self-hash | line 399 | embedded hash differs from observed file hash | Observed SHA authoritative; original not edited |

---

## C. Existing Architecture and Implementation

### C.1 File inventory (exact path, git status at baseline, role)

| Path | Git status | Role / observed implementation | Observed SHA-256 |
|---|---|---|---|
| `lib/tools/engines/tool-034-compound-clearance.ts` | tracked, clean | Pure first-order decay engine; no I/O/DB/clock | `C2CB29EB3DFE0B9BF5D93F347A5E7CE769593290A5D1137F808160C9DDB909D3` |
| `lib/tools/r6/tool-034-compound-clearance-pipeline.ts` | tracked, clean | tryParse → engine → result schema → envelope → guard; fail-safe union | `2D8CCA0A6A7A5497F54E6525D15B5964F1868C35037B8FF12223F0DE81E03712` |
| `lib/tools/r6/tool-034-compound-clearance-contract.ts` | tracked, clean | Draft evaluation, 5 states, empty sources array, cross-tool link, CSV builder | `02C74BCC11DF50755EA5FC1074A48701C3D73ADE761D8DB0E053F13D08B01C0D` |
| `lib/tools/schemas/tool-034-compound-clearance.ts` | tracked, clean | Zod input/output contract | `A5C7946452A7A907E62650858F51D0F9FDE4CE39E0F50A1F56F0410E7B72B1D9` |
| `components/tools/tool-034-compound-clearance.tsx` | tracked, clean | Main UI, state badge, sliders, pipeline wiring | `9147805A00D8743C5C47C90699E08A6BB51375D3AE7B07D06D8C2234D5476C8A` |
| `components/tools/tool-034-compound-clearance.genius.tsx` | tracked, clean | Tool-owned 12-box GENIUS + CORE-5 compact selector | `3C9CBA7A26678AD721A8E4A0E3A0103A0AD7763CA03BC925E3600C3629B0641A` |
| `i18n/tool-034-compound-clearance.json` | tracked, clean | EN/AR strings | `798A0A575FFC6979ECDBEB90E9C3A3C233B38DBEE687718ED8E9B9D14F32E9B5` |
| `lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts` | **untracked** | Pipeline tests present in WT only; not clean-clone reproducible | not hashed (see L.3) |
| `components/tools/tool-034-compound-clearance.test.tsx`, `.dom.test.tsx` | tracked | Component/DOM tests declared | not re-run |
| `tests/unit/tool-034-i18n-evidence.test.ts` | tracked (blob `807e1cfc…`) | i18n evidence test declared | not re-run |
| `docs/MRX Genius Cloud Unified R6.1/tool-034-i18n-check.mjs` | tracked (blob `182b1da9…`) | i18n parity checker, read-only inspected, NOT executed | not re-run |
| `app/smarttools/tool-034-compound-clearance/page.tsx` | tracked (blob `84d8931b…`) | Flat route | not re-run |
| `lib/tools/registry.ts`, `lib/tools/categories.ts`, `lib/tools/smartToolsCatalog6.ts`, `lib/tools/r6/manifest.ts`, `components/tools/r6/R6ToolShell.tsx` | tracked | Shared identity/routing/shell — **no edit authorized or proposed** | see W4b §2 |

### C.2 Dependencies and chain

`registry/categories/catalog` (identity) → `app/smarttools/[category]/[tool]/page.tsx` + `R6ToolShell` (non-exempt shared shell) → `components/tools/tool-034-compound-clearance.tsx` (draft state via `evaluateClearanceDraft`) → `runCompoundClearance` → `createToolSchema(ClearanceInputSchema)` → `calculateCompoundClearance` → `ClearanceResultSchema.safeParse` → `createToolOutput` → `isToolOutput` → `tool-034-compound-clearance.genius.tsx` (boxes + `buildClearanceCsv`). No network, DB, Supabase, storage or system clock in engine/pipeline; timestamps are caller-injected. No shared-component change authorized; W4b classifies this tool as shared-shell non-exempt (HIGH/CRITICAL blast radius if `R6ToolShell.tsx`/`boxes.ts`/`manifest.ts`/`registry.ts` touched).

---

## D. Math Engine and Equation Audit

| Item | Observed implementation (E2) | Boundary / note |
|---|---|---|
| Threshold time | `daysToThreshold = max(1, ceil(half_life_days * ln(1/f) / ln 2))`, default `f = 0.01` | First-order single-exponential; ceiling + floor of 1 day |
| Decay | `decay(d) = 0.5^(d / half_life_days)`; `modeled_remaining_percent = round(decay(daysElapsed)*10000)/100` | Percent rounded to 2 decimals |
| Curve | Half-life multiples 0..5 rounded to integer days, plus threshold day, de-duplicated and sorted | `remaining_percent` per mark, 2-decimal percent |
| Dates | Strict `YYYY-MM-DD`, UTC calendar parsing via `setUTCFullYear`, round-trip validity check; `as_of_date >= last_dose_date`; `daysElapsed = floor((asOf-base)/86400000)` | Deterministic; no timezone drift from locale |
| Guards | `compound_name`/`half_life_source` non-blank; finite positive `half_life_days`; `0 < f < 1`; year ≥ 1; date range ≤ 9999 | Throws `RangeError`; pipeline converts to `{ok:false}` |
| Zero/negative/NaN/Infinity | Rejected by finite/positive guards for half-life and fraction; blank strings rejected; no coercion of empty to zero | Engine-level, independent of Zod |
| Precision / determinism | Fixed rounding, no random input, no `Date.now()`; same input + same options → same result | 100% structural determinism (E2); no execution proof in this audit |
| Result schema | `ClearanceResultSchema.safeParse` in pipeline before envelope | Present in code; per-tool only, not proof of shared P-03 closure |
| Traceability / claim limits | `model_note` explicitly states user-entered unverified half-life, mathematical threshold, and unmodeled repeated dosing/absorption/distribution/metabolites/formulation/individual PK | `NOT_RUN`: no engine test executed here |

**Math verdict:** equations, guards and units are coherent and purity-preserving at E2. Residual gap is evidence (no isolated E3 run at this HEAD), not an arithmetic defect.

---

## E. Pipeline and Schema Audit

Chain: `runCompoundClearance(rawInput, options)` → `compoundClearanceInputSchema.tryParse` (fail-safe, returns Zod error) → `calculateCompoundClearance` → `ClearanceResultSchema.safeParse` → `buildCompoundClearanceOutput` (`createToolOutput` with `source: manual`, `confidence: null`, `dataQuality: not_assessed`, unit `day`, key findings, SEO links) → `isToolOutput` guard → `{ok:true, output}` else `{ok:false, error}`.

- Input guard: `ClearanceInputSchema` strict object with finite/positive half-life, `0 < f < 1`, ISO date refinement (schema file), mirrored by contract limits half-life 0.5–365 days, threshold 0.001–0.2.
- Result guard: `ClearanceResultSchema.safeParse` — statically present, contradicting the blanket "NOT IMPLEMENTED" wording of proposal P-03 if read as per-tool; reconciled as shared-layer gap (Section B.4).
- Error propagation: no throw escapes `runCompoundClearance` for validation/schema/envelope failures; engine `RangeError` for malformed dates is not pre-empted by the schema date refinement in all cases, so callers still receive `{ok:false,error}` — safe, but negative-path behavior at runtime is unproven here.
- P-03 status: committed true-clean structural gate (`p03-gate-structural.test.ts`, 30/30 pipelines) is historical E3 from C-P03 report; runtime-negative per-pipeline case for 034 is uncommitted/NOT_RUN in true-clean. **NOT_RUN** in this audit.

---

## F. AI and Intelligence Capabilities

| Capability | Status | Evidence / reason |
|---|---|---|
| AI brain / model / prompt / provider / RAG | **Unavailable** (by design) | No model, prompt, provider call, embedding or registry in engine/pipeline/components (E2 static) |
| Prediction / inference | **Not applicable** | Tool computes a hypothetical decay scenario from user-supplied half-life; `model_note` denies medical prediction |
| What-if / sensitivity | **Implemented (static)** | Boxes 5/6 (`engine` source) recompute thresholds and remaining percent arithmetically |
| Confidence / uncertainty | **Implemented as explicit non-claim** | Envelope `confidence: null`, `dataQuality: not_assessed`; UI prints `confidence_not_assessed`; uncertainty attributed to unverified half-life and unmodeled PK factors |
| Explanation / formula box | **Implemented (static)** | Box 3 `static`: first-order decay formula and assumptions |
| Safety / limits | **Implemented (static)** | Box 7, disclaimer strings, `not_a_prescription` / `not_a_diagnosis` patterns; referral remains `NOT_AVAILABLE` |
| No fabricated defaults | **Implemented (static)** | Draft starts empty; threshold default `0.01` is a documented mathematical setting, not a clinical value |

No prompt/button is treated as proof of runtime AI; no AI capability is claimed.

---

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented (E2) | Tested (E3) | Runtime-verified | Evidence / gap | Next action |
|---|---|---|---|---|---|---|---|
| Box 1 KPI | yes | yes | yes | not in this audit | no | `n:1 id:kpi source:engine` | DOM/browser capture |
| Box 2 primary result | yes | yes | yes | no | no | `n:2 id:primary source:engine` | DOM/browser capture |
| Box 3 how calculated | yes | yes | yes | no | no | `n:3 id:calculated source:static` | DOM/browser capture |
| Box 4 inputs | yes | yes | yes | no | no | `n:4 id:inputs source:static` | DOM/browser capture |
| Box 5 what-if | yes | yes | yes | no | no | `n:5 id:what-if source:engine` | DOM/browser capture |
| Box 6 sensitivity | yes | yes | yes | no | no | `n:6 id:sensitivity source:engine` | DOM/browser capture |
| Box 7 safety | yes | yes | yes | no | no | `n:7 id:safety source:engine` | DOM/browser capture |
| Box 8 cross-tool | yes | yes | yes | no | no | `n:8 id:cross-tool source:static`; link to tool-016 (manual reentry) | DOM/browser capture |
| Box 9 sources | yes | yes | yes (explicit `not_available`) | no | no | `TOOL_034_SOURCES = []`; C4 open | Owner source pack or N/A |
| Box 10 export | yes | yes | yes | no | no | `data-r6-core="export"`, Blob CSV | Browser download capture |
| Box 11 history | yes | yes | yes (explicit `not_available`) | no | no | `box11_na`; no storage (W18) | Owner W18 decision |
| Box 12 next actions | yes | yes | yes | no | no | `n:12 id:next-actions source:static` | DOM/browser capture |
| CORE-5 compact | yes | yes | yes | no | no | `compactBoxes = [boxes[1],boxes[2],boxes[6],boxes[8],boxes[11]]` → 1-based boxes **2,3,7,9,12** | Confirm intended C1–C5 mapping; no code edit here |
| Fixed order / visibility | yes | yes | yes | no | no | `boxes[1..12]`, `data-r6-box` attributes | E4 DOM order check |
| No duplicate shell | yes | open | unresolved | no | no | Non-exempt shared shell + tool-owned genius (W4b) | E4 DOM inspection before any shared change |

---

## H. Dynamic Results and UI Maturity

| Aspect | Static inspection (E2) | Component test | Integration test | True-clean | Browser E4 |
|---|---|---|---|---|---|
| Five states | `evaluateClearanceDraft` returns EMPTY/INVALID/PARTIAL/READY; main component maps READY→FULL and pipeline failure→DEGRADED; `data-r6-state` + `data-r6-genius-state` | declared, not run | not found | not run | NOT_RUN |
| Live recalculation / debounce | Direct `runCompoundClearance` call in component render/useMemo path; **no debounce timer observed** in main component (unlike Tool 039's 120 ms) | not in this audit | — | — | NOT_RUN |
| Compact/full | Buttons + `aria-pressed`; compact selects boxes 2/3/7/9/12 | not run | — | — | NOT_RUN |
| Sliders / accessibility | `data-r6-slider="true"` numeric inputs, `aria-live` state badge, `aria-labelledby`, `dir` from locale | structural only | — | — | keyboard/RTL NOT_RUN |
| Responsive | Tailwind grid (`md:grid-cols-*`) | structural only | — | — | 390/1440 NOT_RUN |
| Hydration/console | Next.js client component | — | — | — | NOT_RUN |

**UI verdict:** state machine and markers are statically coherent; the absent debounce is a design difference from Tool 039, not a proven defect. All behavioral claims remain E2/NOT_RUN.

---

## I. Cross-Tool and Data Integration

- `TOOL_034_CROSS_TOOL_LINKS` declares one target: `tool-016-half-life-calculator`, field `half_life_days`, `transfer: 'manual-reentry'`, freshness rule "same half-life value in both tools". Box 8 renders the link; nothing is copied or prefilled.
- `buildSeoLinks(requireTool('tool-034-compound-clearance'))` supplies envelope SEO links; prev/next tool links come from registry/route.
- W18 boundary: no persistence, no session handoff, no DB/Supabase/Storage/cloud sync observed in engine, pipeline, contract or genius. Rating control is `data-r6-rating="session_only_not_saved"` (in-memory only).
- Shell integration: route wraps non-exempt tool in `R6ToolShell`; tool also renders own boxes → duplicate-box question remains open (Section G). Per W4b, any shell/manifest fix is shared/HIGH-CRITICAL and **not** authorized here.

---

## J. Safety, Sources and Privacy

- Validation: Zod strict input + contract bounds + engine guards (Sections D/E); empty fields never coerced to zero.
- Sources: `TOOL_034_SOURCES = []` — C4 structurally empty; box 9 shows `NOT_AVAILABLE`; D-C4 open. No approved provenance pack located.
- Referral: generic "not a prescription / not a diagnosis" strings live; box 7/12 referral and seek-care statements are `NOT_AVAILABLE` pending D-C5.
- Clinical review: D-CLIN open; proposal P-07 BLOCKED; engine is a calculation aid, explicitly not medical clearance or safety standard.
- Data exposure / privacy: no API calls, auth, logging of inputs, remote storage or analytics observed in tool-owned files. CSV export is a client-side Blob; rating not saved. SSR/CSR boundary untested (E4 NOT_RUN).

---

## K. Localization and Browser Maturity

- `i18n/tool-034-compound-clearance.json` (observed SHA `798A0A575F…`) + `pickToolI18n`; `dir={isRtl ? 'rtl' : 'ltr'}` in main component; source badges have EN/AR labels; historical ledger i18n 116/116 PASS (E1, not re-run).
- `docs/MRX Genius Cloud Unified R6.1/tool-034-i18n-check.mjs` observed and read only: parses JSON, requires `en`/`ar`, enforces key parity and a Latin-token allow-list (`CSV, CORE, YYYY, MM, DD, ceil, multiples, plus`). **NOT executed.**
- `tests/unit/tool-034-i18n-evidence.test.ts` tracked; **NOT executed.**
- E4 prerequisites absent from this scope: SSO-compliant session, preview pinned to `37f047a4`, recorded Deployment ID. Therefore EN/AR, 5 states, RTL 390px, console/hydration and DOM duplicate checks are **NOT_RUN** (E0). No browser claim is transferred from the historic SSO deployment.

---

## L. Tests and Evidence

### L.1 Evidence register (all rows from this audit; none executed)

| ID | Requirement ID | Source file | Test command (exact, isolated) | Environment | Source SHA | Date | Actual result | Level | Reproducible | Validity | HEAD compatibility |
|---|---|---|---|---|---|---|---|---|---|---|---|
| EV-034-01 | ENG-PIPELINE | `lib/tools/r6/...pipeline.test.ts` (untracked) | `npx vitest run --config vitest.config.ts lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts` | CWD `E:\MrXSteroid-main`, deps present, no installs | n/a (untracked) | 2026-11-19 | **NOT_RUN** | E2 static only | no (untracked) | static only | WT-only, not clean-clone |
| EV-034-02 | TEST-FOCUSED | tracked component/engine/adapter tests | `npx vitest run --config vitest.config.ts components/tools/tool-034-compound-clearance.test.tsx components/tools/tool-034-compound-clearance.dom.test.tsx lib/tools/engines/tool-034-compound-clearance.test.ts lib/tools/adapters/tool-031-035-batch.test.ts` | same | n/a | 2026-11-19 | **NOT_RUN** | E2 | yes (tracked) | static only | at HEAD |
| EV-034-03 | I18N-PARITY | i18n check script | `node "docs/MRX Genius Cloud Unified R6.1/tool-034-i18n-check.mjs"` | same | script blob `182b1da9…` | 2026-11-19 | **NOT_RUN** | E2 (script read) | yes | static only | at HEAD |
| EV-034-04 | I18N-PARITY | evidence test | `npx vitest run --config vitest.config.ts tests/unit/tool-034-i18n-evidence.test.ts` | same | blob `807e1cfc…` | 2026-11-19 | **NOT_RUN** | E2 | yes | static only | at HEAD |
| EV-034-05 | BUILD-TSC | project config | `npx tsc --noEmit`; `npx next build` | clean clone/worktree at `37f047a4`, deps installed, capture full log + exit code | n/a | 2026-11-19 | **NOT_RUN** | E0 | yes | none | target HEAD |
| EV-034-06 | PREVIEW/BROWSER rows | SSO preview | authorized SSO session + preview pinned to `37f047a4` + recorded Deployment ID; then EN/AR, 5-state, 390px RTL, console/hydration, DOM duplicate checks | unavailable | n/a | 2026-11-19 | **NOT_RUN / NOT_AVAILABLE** | E0 | no | none | not established |

### L.2 Completion calculation
`PASS(E3+) = 0`, applicable (recovered register) `= 18` → **0%**. Historical ledger `1/18 = 5.56%` is preserved E1 history; no E3+ is re-awarded.

### L.3 Integrity / hash discipline
Observed file hashes are listed in C.1 and the header. B2b's embedded self-hash differs from its observed bytes; the observed value is authoritative. No original was edited to reconcile a hash. This document uses the body-before-hash-line convention stated in the integrity note at the end; whole-file SHA is reported in the delivery response.

---

## M. Defect and Gap Register

### M.1 Implementation gaps (code/artifact state, E2)

| ID | Severity | Requirement ID | Exact file | Actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-034-01 | MEDIUM | UI-GENIUS12 / NO-DUP-GENIUS | `components/tools/tool-034-compound-clearance.genius.tsx` + `lib/tools/r6/manifest.ts` (shared, no edit) | Tool renders 12 own boxes while W4b classifies tool non-exempt → shared shell also renders boxes | Possible duplicate CORE-5/GENIUS boxes in browser | Ownership classification drift | DOM verification first; any shell/manifest change requires Change Impact Matrix + authorization | HIGH (19 tools) — do not change here |
| I-034-02 | MEDIUM | I18N-PARITY / TEST-FOCUSED | `lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts` | Pipeline test exists only untracked in WT | Not reproducible in true-clean clone | Test never checked in | Authorized check-in after review; no test content change assumed | LOW |
| I-034-03 | LOW | UI (H) | `components/tools/tool-034-compound-clearance.tsx` | No input debounce observed | One calculation per keystroke; differs from Tool 039 pattern | Design choice, not proven defect | Verify perf in E4; only then consider local debounce | LOW |
| I-034-04 | LOW | C4/C5/W18 | `lib/tools/r6/tool-034-compound-clearance-contract.ts` (`TOOL_034_SOURCES = []`, box 11 `not_available`) | Empty approved-source pack; referral absent; no history decision | Cannot satisfy C4/C5/W18 rows | External approvals open | Owner packs/decisions; no invented sources | none local |

### M.2 Evidence gaps (no E3+/E4 in this scope)

| ID | Severity | Requirement ID | Exact file / target | Missing evidence | Impact | Recommended action |
|---|---|---|---|---|---|---|
| E-034-01 | HIGH | ENG-PIPELINE, TEST-FOCUSED | pipeline/contract/component tests | No executed log at HEAD; 0 E3+ | 0% verified | Run L.1 EV-034-01/02 in isolated env and archive |
| E-034-02 | HIGH | BUILD-TSC | project | No clean tsc/build log at audited HEAD | Build row PARTIAL | L.1 EV-034-05 |
| E-034-03 | HIGH | 6 browser rows | SSO preview | No E4 artifact pinned to `37f047a4` | 6 rows NOT_RUN | Provide preview + Deployment ID, then EV-034-06 |
| E-034-04 | MEDIUM | I18N-PARITY | i18n script + test | Historical 116/116 not reproduced | Historical claim only | EV-034-03/04 |

No failure or blocked row is hidden; FAIL/BLOCKED/NOT_AVAILABLE statuses are carried through from B2b unchanged.

---

## N. Development Maturity Matrix (S0–S11 per component)

Stage legend: S0 identity, S1 requirements, S2 architecture, S3 engine, S4 pipeline, S5 UI behavior, S6 AI/CORE-5/GENIUS-12, S7 cross-tool/safety, S8 testing, S9 true-clean reproduction, S10 browser E4, S11 external/owner approval. `✓` = verified at that stage within this audit's scope; `△` = static/E2 only; `✗` = not verified / missing. **S10/S11 are never awarded from a plan's existence.**

| Component | S0 | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Identity/registry/route | ✓ | △ | ✓ | – | – | – | – | △ | ✗ | ✗ | ✗ | ✗ | S2 (static) | S8 runtime route proof | SSO preview; historical route drift |
| Requirements register | ✓ | △ | – | – | – | – | – | – | ✗ | ✗ | – | ✗ | S1 (partial) | S1 full denominator | No upstream original-ID source |
| Engine (pure math) | – | – | ✓ | △ | – | – | – | – | ✗ | ✗ | – | – | S3 static (E2) | S8 focused unit test | Execution not authorized |
| Pipeline + schema | – | – | ✓ | – | △ | – | – | △ | ✗ | ✗ | – | ✗ (P-03) | S4 static (E2) | S8 negative-path test | Shared P-03 approval; untracked test |
| UI / state machine | – | – | ✓ | – | – | △ | – | – | ✗ | ✗ | ✗ | – | S5 static (E2) | S8 component test | E4 unavailable |
| AI / CORE-5 / GENIUS-12 | – | – | ✓ | – | – | – | △ | – | ✗ | ✗ | ✗ | – | S6 static (E2) | S8 DOM test | Duplicate-box question; E4 |
| Cross-tool / safety | – | – | ✓ | – | – | – | – | △ | ✗ | ✗ | ✗ | ✗ | S7 static (E2) | S11 approvals | D-C4/C5/CLIN/W18 |
| Localization | – | – | ✓ | – | – | △ | – | – | ✗ | ✗ | ✗ | – | S5 static (E2) | S8 parity rerun | Script exists but not executed |
| True-clean / build | – | – | – | – | – | – | – | – | △ | ✗ | – | – | S8 historical (E1) | S9 clean-clone rerun | Untracked test; no build log |

Valid independence example: engine at S3 static + browser at S0 — no stage is inferred across components. No S10/S11 awarded.

---

## O. Comparison with Tool 039 (applicable engineering criteria only)

Tool 039 is reference-only and never part of Tool 034's denominator. No similarity score is computed.

| Dimension | Status | Engineering reason (reason code) | Action |
|---|---|---|---|
| Architecture | APPLICABLE | Both separate identity/route → UI validation → pure pipeline → engine → result schema → envelope → boxes; layer chain observed E2 | Preserve |
| Engine | APPLICABLE | Deterministic arithmetic with guards; Tool 034 uses exponential decay vs 039 ULN/trend — criterion is determinism/purity, not formula identity | Preserve |
| Validation | APPLICABLE | Input Zod + result Zod + `isToolOutput` fail-safe union present in both | Preserve |
| AI | NOT_APPLICABLE | Neither tool has model/prompt/provider; 034 explicitly denies medical prediction | Preserve as non-AI benchmark |
| Dynamic results | PARTIALLY_APPLICABLE | Five states and markers present; 034 has no observed debounce and no signature-gating control | Extend after E4/perf evidence |
| CORE-5 compact | PARTIALLY_APPLICABLE | 034 compact selects 1-based boxes 2/3/7/9/12, same index pattern as 039's observed selector; documentation mapping unclear in both | Fix mapping documentation before reuse |
| GENIUS-12 | APPLICABLE | Fixed 1–12 order, source badges, explicit `not_available` reasons observed | Preserve |
| Cross-tool | PARTIALLY_APPLICABLE | 034 declares one manual-reentry link (tool-016); no payload movement, W18 boundary intact | Preserve boundary |
| Safety/sources | PARTIALLY_APPLICABLE | Disclaimers present but C4 empty, C5/CLIN open — weaker than 039's four E2 sources | Fix via owner approvals |
| Testing | PARTIALLY_APPLICABLE | Declared suites exist, pipeline test untracked; none executed at this HEAD | Extend with isolated re-run evidence |
| Browser — current HEAD | NOT_AVAILABLE | No SSO-compliant preview pinned to `37f047a4` | Extend after gate |
| Browser — historic artifacts | NOT_VERIFIED | Historical deployment/SSO evidence not transferable | Preserve as history only |

---

## P. Next Development Tasks (genuine gaps only; no shared-component edit authorized)

| ID | Exact file | Proposed change | Required tests | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| T-034-01 | `docs/.../retry-01` evidence archive (new artifact, separate authorization) | Archive logs of `npx tsc --noEmit`, `npx next build`, and L.1 Vitest commands at `37f047a4` | commands in L.1 | Isolated env, deps present | LOW | E3+ evidence for 6 static rows | Archived log + exit code 0, source SHA recorded |
| T-034-02 | `lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts` (untracked) | Authorized review/check-in only if tests pass; no content change assumed | EV-034-01 | QA + git authorization | LOW | Clean-clone reproducibility | Test present in tree at HEAD with PASS log |
| T-034-03 | `components/tools/tool-034-compound-clearance.genius.tsx` (diagnosis only) | Verify duplicate-box behavior in DOM; **do not** edit `R6ToolShell.tsx`/`manifest.ts` in this phase | DOM E4 check | SSO preview pinned to `37f047a4` | HIGH if shared edit attempted | Evidence-backed ownership decision | Screenshot/DOM showing exactly one CORE-5 set |
| T-034-04 | Contract/source docs (no code edit here) | Obtain approved C4 pack, C5 wording, clinical sign-off, W18 decision | n/a | Product/Clinical/Owner | none local | 4 external rows resolvable | Written owner decision recorded |
| T-034-05 | Chinese/Arabic i18n evidence (no code edit) | Re-run `tool-034-i18n-check.mjs` + evidence test | EV-034-03/04 | deps present | LOW | Current-HEAD parity proof | Archived PASS log |

No task proposes editing shared files (`R6ToolShell.tsx`, `boxes.ts`, `manifest.ts`, `registry.ts`, route page); per W4b that would require a Change Impact Matrix across 19 tools and explicit authorization.

---

## Q. Current Tool Decision

**Decision: NOT_VERIFIED.** Completion **0%** (`0 PASS(E3+) / 18 applicable register rows`); historical ledger-internal `1/18 = 5.56%` is preserved as E1 history and is not a current-HEAD claim. The wider canonical denominator is unrecoverable (Section B.1), so no official-denominator percentage is asserted. Static implementation at E2 is substantial (pure engine, guarded pipeline, five-state UI, 12 boxes, CSV export, i18n assets), but no test, build, i18n re-run or browser evidence was produced in this authorization. Main implementation gaps: possible duplicate-box ownership conflict and untracked pipeline test; main evidence gaps: zero E3+ execution and zero E4 browser artifacts. This decision does **not** imply owner acceptance, phase closure, or development completion.

### Integrity note
The embedded hash below was computed over this document's body immediately before the hash line was appended; adding the line necessarily changes whole-file bytes. The authoritative **whole-file SHA-256** is reported in the delivery response.

Observed on-disk SHA-256 (body before hash line): `CC400C8DA3AD3C043BCB7CFB3ACCCB97AFD80434334622FCB3262F7C888AB5D1`
