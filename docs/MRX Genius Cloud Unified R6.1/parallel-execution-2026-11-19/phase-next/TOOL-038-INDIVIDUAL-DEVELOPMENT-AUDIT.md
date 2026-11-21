# TOOL 038 — Individual Development Audit (R6.1 phase-next)

| Field | Value |
|---|---|
| Tool ID / canonical name | `mrx.tool.038-stack-compatibility` — Stack Compatibility Checker |
| Canonical slug | `tool-038-stack-compatibility` |
| Category / canonical route | `cycle-management` / `/smarttools/cycle-management/tool-038-stack-compatibility` |
| Batch | 3 (closure ledger); operator review grid: round 3 / worker A |
| Fixed baseline | Branch `feat/r6.1-tools-041-042`; HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f`; audit date 2026-11-19 |
| Working tree | Dirty; preserved unchanged; no git write or code edit |
| Governing standard | `00-PLAN-AND-AUDIT-STANDARD.md` — observed SHA `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9` |
| Denominator inventory | `W2-CANONICAL-DENOMINATOR-INVENTORY.md` — observed SHA `3276ACD111A66506568975ADA721F51FC520F7B28AF6C7CB9AB09916CAC96A6A` |
| Row-level evidence | `retry-01/B2b-LEDGER-034-044.md` — observed SHA `F9E17DA9E17B54B74FCC49C5F5BE12B7E3899CC895CD2A6149C16DED51C7A74B` (embedded self-hash differs; observed wins) |
| Closure ledger (18-row) | `closure-sprint-2026-11-17/tool-038-closure-ledger.md` — observed SHA `AA2CB3AE501A303BEE9A88C34C74C60F65F029F13ECF08A19060609D89F8E51B` |
| Dev proposals | `docs/MRX Genius Cloud Unified R6.1/TOOL-038-DEVELOPMENT-PROPOSALS.md` — observed SHA `8823847ABA62F6F422107ED62287C691E32456920348A8B925DC8154D8446F76` |
| Shared-component map | `phase-next/W4b-SHARED-COMPONENT-IMPACT-MAP.md` — observed SHA `157FB3DD879BAE4AF66E4B3AA1404788A3AC469FF8AF1B7ED60C6E3D1282C263` |
| Reference profile | `phase-next/R6.1-TOOL-039-ENGINEERING-REFERENCE-PROFILE.md` — observed SHA `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` |
| True-clean reference | `E:\p03-true-clean-20261118` (HEAD verified `37f047a4`, detached); contaminated `2a647fda` clone excluded |
| Tool decision (Section Q) | **NOT_VERIFIED** — 0% verified (0/18 at E3+); historical ledger 3/18 (16.67%); no owner acceptance implied |

**Scope and evidence discipline.** Read-only inspection plus this document only. No code, contract, schema, source ledger, acceptance ledger, registry, route, test, git state, build, `tsc`, lint, Vitest, dev server, install, or browser/runtime E4 action was performed. Execution rows are `NOT_RUN` with exact isolated commands. Levels E0–E5; only E3+ counts as PASS. Historical E3 claims are E1 history, not re-awarded. Observed SHA-256 wins over embedded self-hashes; no original was edited.

---

## A. Tool Identity and Historical Lineage

| Attribute | Observed value | Evidence | Level |
|---|---|---|---|
| Tool ID / slug / version | `mrx.tool.038-stack-compatibility` / `tool-038-stack-compatibility` / `1.0.0` | `lib/tools/registry.ts` (tool 038 entry); `lib/tools/smartToolsCatalog6.ts` | E2 |
| Page enum / order / tier | `Page.STACK_COMPATIBILITY` / `540` / `free` / `layered` | `lib/tools/registry.ts` | E2 |
| Category / canonical href | `cycle-management` / `/smarttools/cycle-management/tool-038-stack-compatibility` | `lib/tools/categories.ts:114`; registry; catalog | E2 |
| Flat legacy route | `app/smarttools/tool-038-stack-compatibility/page.tsx` (observed SHA `8E7C3CB7…`, tracked) | `git ls-files -s`; file hash | E2 |
| Hierarchical route | `app/smarttools/[category]/[tool]/page.tsx` with shared `R6ToolShell` (non-exempt tool) | static read; W4b §1 | E2 |
| Historical ledger identity | Batch 3; `cycle-management` route (consistent with live); tool source SHA `8d847ba5`; snapshot HEAD `8d7e406c` | closure ledger lines 3–8 | E1 (historical) |
| Historical deployment | `dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL`, SSO-protected | closure ledger lines 7–8 | E1 |
| Historical acceptance | i18n `88/88 PASS`; consolidated Batch 3 `17 files / 50 tests PASS` (2026-11-17); pragmatic `3/18 = 16.67%`; `IN PROGRESS` / `NOT CLOSED` | closure ledger lines 9–12, 17–22 | E1 |
| Dev proposals | P-01..P-10: P-01/P-02/P-08/P-09 IMPLEMENTED, P-03/P-05/P-07 BLOCKED or NOT IMPLEMENTED, P-04/P-06/P-10 PARTIAL; "implemented and tested, owner review pending — NOT ACCEPTED, NOT CLOSED" | proposals file lines 3–28 | E1 |
| Current owner/decision | No owner acceptance recorded at `37f047a4`; engine/schema/adapter/R6 pipeline frozen for proposal phase | proposals lines 5–8, 26–28 | E1 |

Lineage conclusion: canonical identity and ledger route agree (`cycle-management`); no current route drift. All Tool 038 implementation artifacts are tracked and clean at HEAD (unlike 034's untracked pipeline test and 035's untracked/modified UI).

---

## B. Original and R6.1 Requirements

### B.1 Canonical denominator finding (mandatory explicit statement)

**The canonical denominator for Tool 038 cannot be fully recovered from in-repo sources.** The frozen inventory lists only `closure-sprint-2026-11-17/tool-038-closure-ledger.md/.csv` (18 rows) as authoritative. There is no tool-specific atomic requirements CSV, no richer atomic ledger, no Initial Prompt/SPEC/ACCEPTANCE/CLOSURE-LAYER requirement map, no master acceptance spec, and no original-ID crosswalk. The 18-row grid is an **operational review register only**, **not** the official acceptance denominator; no official completion denominator is asserted.

What is missing: (a) original requirement IDs from the initial prompt/spec/acceptance/closure layers, (b) one-to-one original-ID → atomic-requirement mapping, (c) designated master acceptance spec, (d) owner-approved N/A decisions for C4/C5/W18, (e) approved source/provenance and referral packs, (f) clinical/model review sign-off. The dev-proposal register P-01..P-10 is a design/proposal granularity and is not a substitute denominator.

### B.2 Canonical mapping table

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| ENG-PIPELINE | AUD-038-01 | R6 pipeline artifacts/tests; rerun/archive on current HEAD | APPLICABLE (register) | tracked pipeline + pipeline test + contract; component calls `runStackCompatibility` | No upstream original-ID source found; 18-row grid only |
| STATE-5 | AUD-038-02 | Five-state behavior, preview-verified | APPLICABLE (register) | `evaluateStackCompatibilityDraft`; `data-r6-state`; `data-r6-genius-state` | No upstream original-ID source found; E4 not run |
| UI-GENIUS12 | AUD-038-03 | 12-box/CORE-5, DOM verified | APPLICABLE (register) | genius boxes 1–12, compact `[boxes[1],boxes[2],boxes[6],boxes[8],boxes[11]]` | No upstream original-ID source found; DOM unverified |
| I18N-PARITY | AUD-038-04 | Parity with archived evidence | APPLICABLE (register) | `i18n/tool-038-stack-compatibility.json`; `tool-038-i18n-check.mjs`; tracked evidence test | No upstream original-ID source found; 88/88 not re-run |
| EXPORT-CSV | AUD-038-05 | Export implemented/verifiable | APPLICABLE (register) | `buildStackCompatibilityCsv`; Blob download marker `tool-038-stack-compatibility.csv` | No upstream original-ID source found; browser unverified |
| TEST-FOCUSED | AUD-038-06 | Focused battery rerun/archived | APPLICABLE (register) | tracked pipeline/engine/i18n tests; historical 17/50 | No upstream original-ID source found; no E3 here |
| BUILD-TSC | AUD-038-07 | Clean build/typecheck archived | APPLICABLE (register) | no live run | No upstream original-ID source found; build evidence absent |
| PREVIEW-ROUTE | AUD-038-08 | Route loads on accessible preview | APPLICABLE (register) | tracked flat + hierarchical routes | No upstream original-ID source found; preview unavailable |
| BROWSER-EN-AR | AUD-038-09 | EN/AR browser checks | APPLICABLE (register) | i18n JSON | No upstream original-ID source found; E4 unavailable |
| BROWSER-5-STATES | AUD-038-10 | Five states in browser | APPLICABLE (register) | state markers | No upstream original-ID source found; E4 unavailable |
| RTL-390 | AUD-038-11 | 390px RTL browser test | APPLICABLE (register) | AR locale | No upstream original-ID source found; E4 unavailable |
| CONSOLE-HYDRATION | AUD-038-12 | Console/hydration capture | APPLICABLE (register) | Next.js page | No upstream original-ID source found; E4 unavailable |
| NO-DUP-GENIUS | AUD-038-13 | DOM duplicate/shell check | APPLICABLE (register) | non-exempt shared shell + tool-owned genius | No upstream original-ID source found; E4 unavailable |
| C4-SOURCES | AUD-038-14 | Approved source/provenance pack or N/A | APPLICABLE (register) | `TOOL_038_SOURCES = []` (contract line 62) | No upstream original-ID source found; approval missing |
| C5-REFERRAL | AUD-038-15 | Approved referral wording | APPLICABLE (register) | `c5_not_available`; `pending_medical_review` | No upstream original-ID source found; approval missing |
| CLINICAL-REVIEW | AUD-038-16 | Clinical/model sign-off | APPLICABLE (register) | D-CLIN open; P-07 BLOCKED | No upstream original-ID source found; sign-off missing |
| W18-HISTORY | AUD-038-17 | W18/Box 11 decision and storage | APPLICABLE (register) | box 11 `not_available`; rating `session_only_not_saved` | No upstream original-ID source found; decision missing |
| P03-PIPELINE | AUD-038-18 | Shared P-03 layer approved/proved | APPLICABLE (register) | per-tool result guard present; shared layer `NOT_IMPLEMENTED` | No upstream original-ID source found; shared approval missing |

### B.3 Totals

- Recovered register rows: **18**; applicable: **18**; justified N/A: **0**; unmapped within register: **0**.
- Canonical denominator beyond the register: **unrecoverable**; unmapped original requirements: **unknown**.
- Completion, register-scoped only: `0 PASS(E3+) / 18 = 0%`; historical ledger-internal `3/18 = 16.67%` (E1 history, not re-certified).

### B.4 Source authority conflict log

| Source | Location | Conflict / impact | Resolution required |
|---|---|---|---|
| Dev proposal P-03 | line 17 | "Result schema enforcement in pipeline — NOT IMPLEMENTED" vs static `StackCompatibilityResultSchema.safeParse` + `isToolOutput` in pipeline | Distinguish per-tool guard (present) from shared P-03 layer/approval (open); owner ruling |
| Closure ledger | lines 17, 20, 22 | E3 historical results at HEAD `8d7e406c` | Preserve as history; no E3 re-award at `37f047a4` |
| B2b §038 | row-level evidence | B2b counts 6 PASS(<E3), 1 PARTIAL, 6 NOT_RUN, 1 FAIL, 1 BLOCKED, 3 NOT_AVAILABLE; 0/18 E3+ | Carried through unchanged; no upgrade from static evidence |
| B2b self-hash | line 399 | Embedded hash differs from observed bytes | Observed SHA authoritative |

---

## C. Existing Architecture and Implementation

### C.1 File inventory (exact path, git status, observed SHA)

| Path | Git status | Role / observed implementation | Observed SHA-256 |
|---|---|---|---|
| `lib/tools/engines/tool-038-stack-compatibility.ts` | tracked, clean | Pure rule-based pairwise-interaction scoring engine | `34D2B0C01C6F244ABF4FCE87862DCC869F2148BBA344E94254C95189FB333B8F` |
| `lib/tools/r6/tool-038-stack-compatibility-pipeline.ts` | tracked, clean | tryParse → engine → result schema → envelope → guard; fail-safe union | `CFD2BDD696D187ACF57D27259CF6950BCEFBB219F03FDBBF9A523331BFC5E77B` |
| `lib/tools/r6/tool-038-stack-compatibility-contract.ts` | tracked, clean | Draft evaluation, 5 states, empty sources, families list, CSV builder | `4D6F9769FED43764E91C2EC921202A5D2DD9D0D80B4B583E6DDC9EC123E1E325` |
| `lib/tools/schemas/tool-038-stack-compatibility.ts` | tracked, clean | Zod input/output contract (1–10 items, dose 0–5000 mg) | `38EF83580BFF6AD13D89F4584AA396FC2D351BE20F3C221C9AFB790339272D9A` |
| `components/tools/tool-038-stack-compatibility.tsx` | tracked, clean | Main UI, `runStackCompatibility` wiring, state badge, item rows | `D277A37931ADD772209F3B7A9D10DFD53D5640B0EE4942145431B7A4C8F7A51A` |
| `components/tools/tool-038-stack-compatibility.genius.tsx` | tracked, clean | Tool-owned 12-box GENIUS + CORE-5 compact selector | `FA2117D1EFF9A97F90B3763E00B55CB234CC323C39A87B450A2A90515F223248` |
| `i18n/tool-038-stack-compatibility.json` | tracked, clean | EN/AR strings | `99894B690944321F1DC21D407E6243D97735DCCD7EEA0357DE6F95DA355B26CB` |
| `lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts` | tracked | Pipeline tests, clean-clone reproducible | `EDE3F6C5C33303FABC8852A8E965DB1BACEA88CC8467572D03347D4FF87354E9` |
| `lib/tools/engines/tool-038-stack-compatibility.test.ts` | tracked | Engine tests declared | `3A416F099E2D43167A3E3E8FAB2F0CD8B52D473A1F62B15FAB1239C58A55E1D0` |
| `tests/unit/tool-038-i18n-evidence.test.ts` | tracked | i18n evidence test declared | `54A98D5813DD77133ED55ED2AEBF812A1707AFDF413C0F3D58025A65FDEFF3C3` |
| `docs/MRX Genius Cloud Unified R6.1/tool-038-i18n-check.mjs` | tracked | i18n parity checker, read-only inspected, NOT executed | `7344AFE2256D66FF9D4D60921F952A2D2AB54B5432BE53708D0D6D5537B0EC29` |
| `app/smarttools/tool-038-stack-compatibility/page.tsx` | tracked | Flat route | `8E7C3CB78457F4CEADA49B27409D5F7C21E7D4541922EB2F5A18A62F0E9892B8` |
| Shared: `registry.ts`, `categories.ts`, `smartToolsCatalog6.ts`, `manifest.ts`, `R6ToolShell.tsx`, `boxes.ts` | tracked | Identity/shell — no change authorized | see W4b §2 |

### C.2 Dependencies and chain

`registry/categories/catalog` → hierarchical route + shared `R6ToolShell` (non-exempt) → `tool-038-stack-compatibility.tsx` → `evaluateStackCompatibilityDraft` → `runStackCompatibility(input, options)` → `stackCompatibilityInputSchema.tryParse` → `checkStackCompatibility` → `StackCompatibilityResultSchema.safeParse` → `createToolOutput` → `isToolOutput` → `Tool038Genius` boxes + `buildStackCompatibilityCsv`. Timestamps/locale/unit system are caller-injected; engine is pure (no I/O, DB, clock, randomness). No shared-component change authorized; W4b blast radius HIGH/CRITICAL for shared files.

---

## D. Math Engine and Equation Audit

| Item | Observed implementation (E2) | Boundary / note |
|---|---|---|
| Score base | `score = 100`; clamped to `[0,100]` after penalties | Deterministic integer result |
| Empty stack | Returns `score 0`, verdict `incompatible`, flag `EMPTY` (`important`) | `items.length === 0` short-circuit in engine; schema requires ≥1 so normally unreachable via pipeline |
| 38.1 Dual 19-nor | `nandrolone > 0 && trenbolone > 0` → `−30`, flag `DUAL_19NOR` (`important`) | Fixed pairwise rule |
| 38.2 Orals | ≥2 orals/hepatotoxic → `−25` `DUAL_ORAL` (`important`); exactly 1 → `−5` `SINGLE_ORAL` (`monitor`) | `orals = family==='oral' || hepatotoxic` |
| 38.3 No test base | no testosterone with any nandrolone/trenbolone/dht → `−15` `NO_TEST_BASE` (`monitor`) | — |
| 38.4 Triple DHT | `dht >= 3` → `−15` `TRIPLE_DHT` (`monitor`) | — |
| 38.5 Burden | sum of `weekly_dose_mg` for androgen families; `>1500` → `−20` `HIGH_BURDEN`; `>800` → `−8` `MOD_BURDEN` | mg/week; reported in result |
| 38.6 AI no substrate | `ai > 0 && testosterone === 0` → `−5` `AI_NO_SUBSTRATE` (`monitor`) | — |
| Clean result | If no flags, push `CLEAN` (`info`): "standard monitoring still applies" | Always at least one flag |
| Verdict | `compatible >= 75`, `caution >= 45`, else `incompatible` | Fixed thresholds |
| Guards | Zod: `name_en` 1–80, family enum, `weekly_dose_mg` finite 0–5000, `hepatotoxic` boolean, `items` 1–10; result schema: score int 0–100, flags ≤16, burden finite ≥0 | Validation lives in schema/pipeline/contract, **not** inside the engine (contrast with 034/035/037 engines, which parse internally) |
| Determinism | Fixed rule set, no clock/random/I/O | Structural only (E2); **NOT_RUN** in this audit |

**Math verdict:** scoring rules, penalties, verdict thresholds and result-shape guards are internally consistent at E2. The model is explicitly heuristic; no medical compatibility guarantee is claimed. Residual gap is evidence (no executed test here), not a proven arithmetic defect.

---

## E. Pipeline and Schema Audit

`runStackCompatibility` chain matches Tools 034/037: `tryParse` (fail-safe) → engine → `StackCompatibilityResultSchema.safeParse` → `createToolOutput` (source `manual`, `confidence null`, `dataQuality not_assessed`, key finding `SCORE`, SEO links) → `isToolOutput` → `{ok:true,output}` or `{ok:false,error}`.

- Input guards: strict Zod object (1–10 items, dose 0–5000 mg) mirrored by `evaluateStackCompatibilityDraft` contract bounds.
- Result guard present in code (distinct from proposal P-03's "NOT IMPLEMENTED" wording — reconciled in B.4).
- Component calls the pipeline directly (`run = evaluation.input ? runStackCompatibility(evaluation.input, options) : null`), so the guarded path is the live path.
- No debounce/timer observed in the component; recalculates on render from draft (deterministic, cheap).
- P-03: committed structural gate is historical E3; runtime-negative per-pipeline proof uncommitted/NOT_RUN in true-clean; shared layer FAIL in B2b. **NOT_RUN** here.

---

## F. AI and Intelligence Capabilities

| Capability | Status | Evidence / reason |
|---|---|---|
| AI brain / model / prompt / provider / RAG | **Unavailable** | No model/provider/prompt in engine, pipeline or components (E2) |
| Prediction | **Not applicable** | Heuristic rule-based score with fixed penalties; box 2 `primary_heuristic_note` and `not_a_prescription`; no model-based inference |
| What-if / sensitivity | **Implemented (static)** | Boxes 5/6 derive from engine rules/inputs |
| Confidence / uncertainty | **Explicit non-claim** | `confidence: null`, `dataQuality: not_assessed`, `confidence_not_assessed` in box 2; uncertainty text in box 3 |
| Explanation | **Implemented (static)** | Box 3 `static`: formula, assumptions, uncertainty strings |
| Safety / flags | **Implemented (static)** | Box 2/7 render engine `flags` with severity; referral `NOT_AVAILABLE` + `pending_medical_review` |
| No fabricated defaults | **Implemented (static)** | Draft starts empty; no invented values; rating not saved |

No AI capability is claimed; no prompt/button is treated as runtime AI evidence.

---

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented (E2) | Tested (E3) | Runtime-verified | Evidence / gap | Next action |
|---|---|---|---|---|---|---|---|
| Box 1 KPI | yes | yes | yes (`source: engine`) | not in this audit | no | score + verdict + androgen burden | E4 capture |
| Box 2 primary | yes | yes | yes | no | no | `data-r6-core="c1"`, score, burden, flags, confidence non-claim, heuristic note | E4 capture |
| Box 3 calculated | yes | yes | yes | no | no | `data-r6-core="c2"`, formula/assumptions/uncertainty | E4 capture |
| Box 4 inputs | yes | yes | yes | no | no | `data-r6-core="inputs"`, items count | E4 capture |
| Box 5 what-if | yes | yes | yes | no | no | engine/input-derived (`box5_intro`) | E4 capture |
| Box 6 sensitivity | yes | yes | yes | no | no | engine/input-derived (`box6_intro`) | E4 capture |
| Box 7 safety | yes | yes | yes | no | no | `data-r6-core="c3"`, flags + referral `NOT_AVAILABLE` | Owner C5 |
| Box 8 cross-tool | yes | yes | yes (no mapped data) | no | no | `box8_none`; prev/next nav links + `calculatedAt` | Owner decision if mapping required |
| Box 9 sources | yes | yes | yes (`not_available`) | no | no | `TOOL_038_SOURCES = []`; D-C4 open | Owner C4 pack/N/A |
| Box 10 export | yes | yes | yes | no | no | `data-r6-core="export"`, Blob CSV `tool-038-stack-compatibility.csv` | E4 download capture |
| Box 11 history | yes | yes | yes (`not_available`) | no | no | `box11_na`; no storage | Owner W18 |
| Box 12 next actions | yes | yes | yes | no | no | `data-r6-core="c5"`, rating `session_only_not_saved` | E4 capture |
| CORE-5 compact | yes | yes | yes | no | no | `visible = compact ? [boxes[1],boxes[2],boxes[6],boxes[8],boxes[11]] : boxes` → 1-based **2,3,7,9,12** | Confirm mapping documentation |
| Fixed order / markers | yes | yes | yes | no | no | `data-r6-genius="tool-038"`, `data-r6-genius-state={state}`, `data-r6-box` | E4 DOM check |
| No duplicate shell | yes | open | unresolved | no | no | Non-exempt shared shell + tool-owned boxes (W4b) | E4 DOM inspection before any shared change |

---

## H. Dynamic Results and UI Maturity

| Aspect | Static inspection (E2) | Component test | Integration test | True-clean | Browser E4 |
|---|---|---|---|---|---|
| Five states | `evaluateStackCompatibilityDraft` EMPTY/INVALID/PARTIAL/READY → UI FULL/DEGRADED; `data-r6-state` + `data-r6-genius-state` | declared, not run | not found | not run | NOT_RUN |
| Live recalculation / debounce | Direct pipeline call on render; no debounce observed | not run | — | — | NOT_RUN |
| Compact/full | buttons + `aria-pressed`, 5-of-12 boxes | not run | — | — | NOT_RUN |
| Interaction | Add/remove stack items, family select, dose input, hepatotoxic toggle | structural only | — | — | NOT_RUN |
| Responsive/a11y | `dir` from locale, `aria-live` state badge, `useId`, Tailwind grid | structural only | — | — | 390/1440/keyboard NOT_RUN |
| Hydration/console | Next.js client component | — | — | — | NOT_RUN |

**UI verdict:** state and box wiring are statically coherent and cleaner than Tool 035; behavior remains E2/NOT_RUN without isolated execution or browser.

---

## I. Cross-Tool and Data Integration

- `TOOL_038_SOURCES` is empty; no exported cross-tool link contract in `tool-038-stack-compatibility-contract.ts` (`TOOL_038_FAMILIES` is the only declared export constant besides evaluation/CSV helpers). Box 8 explicitly says `box8_none` and renders only prev/next navigation links plus `calculatedAt`.
- No payload transfer, session handoff, freshness rule or stale action declared for cross-tool data. W18 boundary intact: rating is `session_only_not_saved`; no storage, DB, Supabase, cloud sync or API call in tool-owned files.
- `buildSeoLinks(requireTool(...))` supplies envelope SEO links; registry/route provide neighbors.
- Non-exempt shell + tool-owned boxes remains a DOM-level open question (Section G); any shell/manifest change is shared/HIGH-CRITICAL per W4b and not authorized.

---

## J. Safety, Sources and Privacy

- Validation: strict Zod (1–10 items, dose 0–5000 mg, family enum) + mirrored contract bounds; no empty→zero coercion. Engine has no internal parse, so direct engine calls with malformed input are not union-guarded — the pipeline/contract are the guard boundary.
- Sources: empty `TOOL_038_SOURCES` and box 9 `not_available`; D-C4 open; P-05 BLOCKED (evidence pack).
- Referral: `c5_not_available` + `pending_medical_review`; D-C5 open; P-06 PARTIAL (generic non-diagnosis wording only).
- Clinical review: D-CLIN open; P-07 BLOCKED; engine/UI carry `not_a_prescription` / `not_a_diagnosis` strings and "standard monitoring still applies" in `CLEAN` flag.
- Privacy: no logging/analytics/remote storage observed in tool-owned files; inputs remain client-side; CSV is a local Blob. Browser verification NOT_RUN.

---

## K. Localization and Browser Maturity

- `i18n/tool-038-stack-compatibility.json` (observed SHA `99894B69…`) + `pickToolI18n`; `dir={isRtl ? 'rtl' : 'ltr'}`; source badges, flags and referral strings localized; historical 88/88 PASS (E1).
- `docs/MRX Genius Cloud Unified R6.1/tool-038-i18n-check.mjs` observed and read only: JSON parse, `en`/`ar` key sets, parity and allow-list checks. **NOT executed.**
- `tests/unit/tool-038-i18n-evidence.test.ts` tracked (SHA `54A98D58…`); **NOT executed.**
- E4 prerequisites absent (SSO session, preview pinned to `37f047a4`, Deployment ID): EN/AR, 5 states, RTL 390px, console/hydration, DOM duplicate checks = **NOT_RUN** (E0). Historic deployment evidence not transferable.

---

## L. Tests and Evidence

### L.1 Evidence register (no executions in this audit)

| ID | Requirement ID | Source file | Test command (exact, isolated) | Environment | Source SHA | Date | Actual result | Level | Reproducible | Validity | HEAD compatibility |
|---|---|---|---|---|---|---|---|---|---|---|---|
| EV-038-01 | ENG-PIPELINE | `lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts` (tracked) | `npx vitest run --config vitest.config.ts lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts` | CWD `E:\MrXSteroid-main`, deps present, no installs | `EDE3F6C5…` | 2026-11-19 | **NOT_RUN** | E2 | yes | static only | at HEAD |
| EV-038-02 | TEST-FOCUSED | engine + pipeline + i18n tests | `npx vitest run --config vitest.config.ts lib/tools/engines/tool-038-stack-compatibility.test.ts lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts tests/unit/tool-038-i18n-evidence.test.ts` | same | n/a | 2026-11-19 | **NOT_RUN** | E2 | yes | static only | at HEAD |
| EV-038-03 | I18N-PARITY | i18n check script | `node "docs/MRX Genius Cloud Unified R6.1/tool-038-i18n-check.mjs"` | same | `7344AFE2…` | 2026-11-19 | **NOT_RUN** | E2 (script read) | yes | static only | at HEAD |
| EV-038-04 | BUILD-TSC | project | `npx tsc --noEmit`; `npx next build` | clean clone/worktree at `37f047a4`, deps installed, capture full log + exit code | n/a | 2026-11-19 | **NOT_RUN** | E0 | yes | none | target HEAD |
| EV-038-05 | Browser rows | SSO preview | authorized SSO session + preview pinned to `37f047a4` + Deployment ID; EN/AR, 5-state, RTL 390px, console/hydration, DOM duplicate checks | unavailable | n/a | 2026-11-19 | **NOT_RUN / NOT_AVAILABLE** | E0 | no | none | not established |

### L.2 Completion calculation
`PASS(E3+) = 0`, applicable register rows `= 18` → **0%**. Historical ledger-internal `3/18 = 16.67%` (ENG-PIPELINE, I18N-PARITY, TEST-FOCUSED at E3) is preserved as E1 history; no official denominator asserted.

### L.3 Hash discipline
Observed SHA-256 values in C.1/header are authoritative. B2b's embedded self-hash differs from observed bytes; originals were not edited. See end-of-document integrity note; whole-file SHA reported in delivery response.

---

## M. Defect and Gap Register

### M.1 Implementation gaps (E2)

| ID | Severity | Requirement ID | Exact file | Actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-038-01 | MEDIUM | UI-GENIUS12 / NO-DUP-GENIUS | `components/tools/tool-038-stack-compatibility.genius.tsx` + `lib/tools/r6/manifest.ts` (shared, no edit) | Tool-owned 12 boxes while W4b classifies tool non-exempt (shared shell also renders boxes) | Possible duplicate boxes | Ownership drift | E4 DOM verification; any shell/manifest fix needs Change Impact Matrix + authorization | HIGH (19 tools) |
| I-038-02 | LOW | ENG-PIPELINE (robustness) | `lib/tools/engines/tool-038-stack-compatibility.ts` line 32 | Engine performs no internal input validation (unlike 034/035/037) | Direct engine calls with malformed input are not union-guarded | Design division of responsibility to schema/pipeline | Accept as designed if pipeline/contract are the sole boundary; otherwise add engine preconditions with tests | LOW |
| I-038-03 | LOW | C4-SOURCES | `lib/tools/r6/tool-038-stack-compatibility-contract.ts` line 62 | `TOOL_038_SOURCES = []`; box 9 `not_available` | C4 row unresolvable externally | No approved pack | Owner source pack or explicit N/A | none local |
| I-038-04 | LOW | C5-REFERRAL / CLINICAL-REVIEW | `components/tools/tool-038-stack-compatibility.genius.tsx` boxes 7/12 | Referral `NOT_AVAILABLE`, `pending_medical_review`, no sign-off | C5/CLIN rows open | External approvals | Owner wording + clinical sign-off | none local |
| I-038-05 | LOW | W18-HISTORY | box 11, rating control | No history storage; rating session-only | W18 row open | Owner decision pending | W18 decision | none local |
| I-038-06 | LOW | Cross-tool (I) | `components/tools/tool-038-stack-compatibility.genius.tsx` box 8 | `box8_none` — no mapped cross-tool data/freshness/stale action | Weaker than 039 benchmark | No cross-tool contract authored | Add tool-local link contract if acceptance requires | LOW |

No implementation defect was found in the scoring rules, schema, pipeline wiring, state markers, compact mapping or CSV export at E2.

### M.2 Evidence gaps (no E3+/E4 in this scope)

| ID | Severity | Requirement ID | Exact target | Missing evidence | Impact | Recommended action |
|---|---|---|---|---|---|---|
| E-038-01 | HIGH | ENG-PIPELINE, TEST-FOCUSED | tracked pipeline/engine/i18n tests | No executed log at `37f047a4` | 0 E3+ | EV-038-01/02 |
| E-038-02 | HIGH | BUILD-TSC | project | No clean build/typecheck log | PARTIAL row | EV-038-04 |
| E-038-03 | HIGH | 6 browser rows | SSO preview | No E4 artifact pinned to baseline | 6 NOT_RUN | EV-038-05 |
| E-038-04 | MEDIUM | I18N-PARITY | script + evidence test | Historical 88/88 not reproduced | History only | EV-038-03 |

FAIL (P03-PIPELINE), BLOCKED (CLINICAL-REVIEW), NOT_AVAILABLE (C4/C5/W18) are preserved without concealment.

---

## N. Development Maturity Matrix (S0–S11 per component)

Legend: S0 identity, S1 requirements, S2 architecture, S3 engine, S4 pipeline, S5 UI behavior, S6 AI/CORE-5/GENIUS-12, S7 cross-tool/safety, S8 testing, S9 true-clean reproduction, S10 browser E4, S11 external/owner approval. `✓` verified, `△` static/E2 only, `✗` missing. S10/S11 never inferred from a plan.

| Component | S0 | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Identity/registry/route | ✓ | △ | ✓ | – | – | – | – | △ | ✗ | ✗ | ✗ | ✗ | S2 static | S8 route proof | SSO preview |
| Requirements register | ✓ | △ | – | – | – | – | – | – | ✗ | ✗ | – | ✗ | S1 partial | S1 full denominator | No original-ID source |
| Engine (heuristic scoring) | – | – | ✓ | △ | – | – | – | – | ✗ | ✗ | – | – | S3 static | S8 engine test | Execution not authorized; no internal guard |
| Pipeline + schema | – | – | ✓ | – | △ | – | – | △ | ✗ | ✗ | – | ✗ (P-03) | S4 static | S8 tracked test rerun | Shared P-03 approval |
| UI / state machine | – | – | ✓ | – | – | △ | – | – | ✗ | ✗ | ✗ | – | S5 static | S8 component test | E4 unavailable |
| AI / CORE-5 / GENIUS-12 | – | – | ✓ | – | – | – | △ | – | ✗ | ✗ | ✗ | – | S6 static | S8 DOM test | Duplicate-box question |
| Cross-tool / safety | – | – | ✓ | – | – | – | – | △ | ✗ | ✗ | ✗ | ✗ | S7 static | S11 approvals | D-C4/C5/CLIN/W18 |
| Localization | – | – | ✓ | – | – | △ | – | – | ✗ | ✗ | ✗ | – | S5 static | S8 parity rerun | Script exists, not run |
| True-clean / build | – | – | – | – | – | – | – | – | △ | ✗ | – | – | S8 historical (E1) | S9 clean-clone rerun | No build log at HEAD |

Engine S3 static + browser S0 is a valid independence example; no stage inferred across components.

---

## O. Comparison with Tool 039 (applicable engineering criteria only)

Tool 039 is reference-only and never part of Tool 038's denominator. No similarity score.

| Dimension | Status | Engineering reason (reason code) | Action |
|---|---|---|---|
| Architecture | APPLICABLE | Same layered chain (route → UI validation → pipeline → pure engine → result schema → envelope → boxes) with tracked components | Preserve |
| Engine | APPLICABLE | Deterministic, pure, bounded rule scoring with explicit non-diagnosis disclaimer; criterion is purity/determinism | Preserve |
| Validation | PARTIALLY_APPLICABLE | Input Zod + result Zod + `isToolOutput` on live path, but engine has no internal parse (unlike 039) | Confirm boundary is intentional; Preserve if so |
| AI | NOT_APPLICABLE | No model/prompt/provider; non-AI benchmark | Preserve |
| Dynamic results | PARTIALLY_APPLICABLE | Five states + markers present; no debounce/signature gate observed | Extend after E4/perf evidence |
| CORE-5 compact | PARTIALLY_APPLICABLE | Compact selects 1-based boxes 2/3/7/9/12, same as 039's observed selector; documentation mapping unclear | Fix mapping documentation |
| GENIUS-12 | APPLICABLE | Fixed 1–12 order, source badges, explicit `not_available` reasons | Preserve |
| Cross-tool | NOT_APPLICABLE (current design) | Box 8 explicitly has no mapped cross-tool data; 039's mapped-link pattern is not a requirement here unless adopted | Preserve boundary |
| Safety/sources | PARTIALLY_APPLICABLE | Strong heuristic disclaimers + engine flags but empty C4, C5/CLIN open vs 039's approved sources | Fix via owner approvals |
| Testing | PARTIALLY_APPLICABLE | Tracked suites exist; none executed at this HEAD; historical E3 not transferable | Extend with isolated re-runs |
| Browser — current HEAD | NOT_AVAILABLE | No SSO preview pinned to `37f047a4` | Extend after gate |
| Browser — historic artifacts | NOT_VERIFIED | Historic deployment evidence not compatible-proven | Preserve as history only |

---

## P. Next Development Tasks (genuine gaps only; tool-local)

| ID | Exact file | Proposed change | Required tests | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| T-038-01 | evidence archive (separate authorization) | Run and archive EV-038-01/02/03/04 at `37f047a4` | commands in L.1 | Isolated env, deps present | LOW | E3+ for 4 static rows | Logs + exit code 0 + source SHA |
| T-038-02 | `components/tools/tool-038-stack-compatibility.genius.tsx` (diagnosis only) | Verify duplicate-box behavior in DOM; no shared-shell edit | E4 DOM check | SSO preview pinned to baseline | HIGH if shared edit attempted | Ownership decision evidenced | Screenshot/DOM with exactly one CORE-5 set |
| T-038-03 | `lib/tools/engines/tool-038-stack-compatibility.ts` + schema/pipeline | Only if acceptance requires engine-level validation: add internal preconditions with tests | engine + pipeline tests | Owner ruling on validation boundary | LOW | Consistent guard posture across 034/035/037/038 | E3 log for direct malformed-input case |
| T-038-04 | `lib/tools/r6/tool-038-stack-compatibility-contract.ts` | If acceptance requires, add tool-local cross-tool link contract with freshness rule | link contract test | Owner requirement decision | LOW | Box 8 parity with 039 pattern | Contract + DOM proof |
| T-038-05 | C4/C5/CLIN/W18 owner packets (no code change here) | Obtain approved source pack, referral wording, clinical sign-off, history decision | n/a | Product/Clinical/Owner | none local | 4 external rows resolvable | Written decision recorded |

No task edits `R6ToolShell.tsx`, `boxes.ts`, `manifest.ts`, `registry.ts`, or the shared route page; such edits require a Change Impact Matrix across 19 tools (W4b).

---

## Q. Current Tool Decision

**Decision: NOT_VERIFIED.** Completion **0%** (`0 PASS(E3+) / 18 applicable register rows`); historical ledger-internal `3/18 = 16.67%` preserved as E1 history. The canonical denominator beyond the 18-row register is unrecoverable, so no official-denominator percentage is asserted. Main implementation gaps are external approvals (C4/C5/CLIN/W18), absent cross-tool mapped data, the engine's lack of internal validation, and the unresolved duplicate-shell question; the rule engine, guarded pipeline wiring, five states, 12 boxes and CSV export are statically coherent. Main evidence gaps: no E3 execution, no build log, no E4 browser artifacts at the fixed baseline. This decision implies **no** owner acceptance, phase closure, or development completion.

### Integrity note
The embedded hash below was computed over this document's body immediately before the hash line was appended; adding the line changes whole-file bytes. The authoritative **whole-file SHA-256** is reported in the delivery response.

Observed on-disk SHA-256 (body before hash line): `E50130611F9C0B36F42F85A2DC2962DDB6AD4E31D31E67C9CD9D58FB71AD8D25`
