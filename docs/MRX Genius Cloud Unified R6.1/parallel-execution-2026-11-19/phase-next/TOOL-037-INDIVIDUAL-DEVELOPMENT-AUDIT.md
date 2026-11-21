# TOOL 037 — Individual Development Audit (R6.1 phase-next)

| Field | Value |
|---|---|
| Tool ID / canonical name | `mrx.tool.037-side-effect-probability` — Side Effect Probability Calculator |
| Canonical slug | `tool-037-side-effect-probability` |
| Category / canonical route | `medical-monitoring` / `/smarttools/medical-monitoring/tool-037-side-effect-probability` |
| Batch | 4 (closure ledger); operator review grid: round 3 / worker A |
| Fixed baseline | Branch `feat/r6.1-tools-041-042`; HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f`; audit date 2026-11-19 |
| Working tree | Dirty; preserved unchanged; no git write or code edit |
| Governing standard | `00-PLAN-AND-AUDIT-STANDARD.md` — observed SHA `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9` |
| Denominator inventory | `W2-CANONICAL-DENOMINATOR-INVENTORY.md` — observed SHA `3276ACD111A66506568975ADA721F51FC520F7B28AF6C7CB9AB09916CAC96A6A` |
| Row-level evidence | `retry-01/B2b-LEDGER-034-044.md` — observed SHA `F9E17DA9E17B54B74FCC49C5F5BE12B7E3899CC895CD2A6149C16DED51C7A74B` (embedded self-hash differs; observed wins) |
| Closure ledger (18-row) | `closure-sprint-2026-11-17/tool-037-closure-ledger.md` — observed SHA `F95D007A220AFC23C2AA669090937449AF724355A4DBE14FDD048C129E952981` |
| Dev proposals | `docs/MRX Genius Cloud Unified R6.1/TOOL-037-DEVELOPMENT-PROPOSALS.md` — observed SHA `D94FF409EFB3B7D0BD1A023FD28D3478E24E3FFBF8F5790030663B2FAD8F1CB7` |
| Shared-component map | `phase-next/W4b-SHARED-COMPONENT-IMPACT-MAP.md` — observed SHA `157FB3DD879BAE4AF66E4B3AA1404788A3AC469FF8AF1B7ED60C6E3D1282C263` |
| Reference profile | `phase-next/R6.1-TOOL-039-ENGINEERING-REFERENCE-PROFILE.md` — observed SHA `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` |
| True-clean reference | `E:\p03-true-clean-20261118` (HEAD verified `37f047a4`, detached); contaminated `2a647fda` clone excluded |
| Tool decision (Section Q) | **NOT_VERIFIED** — 0% verified (0/18 at E3+); historical ledger 3/18 (16.67%); no owner acceptance implied |

**Scope and evidence discipline.** Read-only inspection plus this document only. No code, contract, schema, source ledger, acceptance ledger, registry, route, test, git state, build, `tsc`, lint, Vitest, dev server, install, or browser/runtime E4 action was performed. Execution rows are `NOT_RUN` with exact isolated commands. Levels E0–E5; only E3+ counts as PASS. Historical E3 claims (consolidated 17/50, i18n 88/88) are E1 history, not re-awarded. Observed SHA-256 wins over embedded self-hashes.

---

## A. Tool Identity and Historical Lineage

| Attribute | Observed value | Evidence | Level |
|---|---|---|---|
| Tool ID / slug / version | `mrx.tool.037-side-effect-probability` / `tool-037-side-effect-probability` / `1.0.0` | `lib/tools/registry.ts:77`; `lib/tools/smartToolsCatalog6.ts` | E2 |
| Page enum / order / tier | `Page.SIDE_EFFECT_PROBABILITY` / `530` / `free` / `layered` | `lib/tools/registry.ts:77` | E2 |
| Category / canonical href | `medical-monitoring` / `/smarttools/medical-monitoring/tool-037-side-effect-probability` | `lib/tools/categories.ts:117`; registry; catalog | E2 |
| Flat legacy route | `app/smarttools/tool-037-side-effect-probability/page.tsx` tracked blob `2875b383…` | `git ls-files -s` | E2 |
| Hierarchical route | `app/smarttools/[category]/[tool]/page.tsx` with shared `R6ToolShell` (non-exempt tool) | static read; W4b §1 | E2 |
| Historical ledger identity | Batch 4; `medical-monitoring` route (consistent with live refs); tool source SHA `6e0416fe`; snapshot HEAD `8d7e406c` | closure ledger lines 3–8 | E1 (historical) |
| Historical deployment | `dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL`, SSO-protected | closure ledger lines 7–8 | E1 |
| Historical acceptance | i18n `88/88 PASS`; consolidated Batch 4 `17 files / 50 tests PASS` (2026-11-17); pragmatic `3/18 = 16.67%`; `IN PROGRESS` / `NOT CLOSED` | closure ledger lines 9–12, 17–22 | E1 |
| Dev proposals | P-01..P-10: P-01/P-02/P-08/P-09 IMPLEMENTED, P-03/P-05/P-07 BLOCKED or NOT IMPLEMENTED, P-04/P-06/P-10 PARTIAL; "implemented and tested, owner review pending — NOT ACCEPTED, NOT CLOSED" | proposals file lines 3–28 | E1 |
| Current owner/decision | No owner acceptance recorded at `37f047a4`; engine/schema/adapter/R6 pipeline frozen for proposal phase | proposals lines 5–8, 26–28 | E1 |

Lineage conclusion: canonical identity and ledger route agree (`medical-monitoring`); no current route drift for this tool. All implementation artifacts for Tool 037 are tracked and clean at HEAD (unlike 034's untracked pipeline test and 035's untracked UI).

---

## B. Original and R6.1 Requirements

### B.1 Canonical denominator finding (mandatory explicit statement)

**The canonical denominator for Tool 037 cannot be fully recovered from in-repo sources.** The frozen inventory lists only `closure-sprint-2026-11-17/tool-037-closure-ledger.md/.csv` (18 rows) as authoritative. There is no tool-specific atomic requirements CSV, no richer atomic ledger, no Initial Prompt/SPEC/ACCEPTANCE/CLOSURE-LAYER requirement map, no master acceptance spec, and no original-ID crosswalk. The 18-row grid is an **operational review register only**, **not** the official acceptance denominator; no official completion denominator is asserted.

What is missing: (a) original requirement IDs from the initial prompt/spec/acceptance/closure layers, (b) one-to-one original-ID → atomic-requirement mapping, (c) designated master acceptance spec, (d) owner-approved N/A decisions for C4/C5/W18, (e) approved source/provenance and referral packs, (f) clinical/model review sign-off. The dev-proposal register P-01..P-10 is a design/proposal granularity and is not a substitute denominator.

### B.2 Canonical mapping table

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| ENG-PIPELINE | AUD-037-01 | R6 pipeline artifacts/tests; rerun/archive on current HEAD | APPLICABLE (register) | tracked pipeline + pipeline test + contract; component calls `runSideEffectProbability` | No upstream original-ID source found; 18-row grid only |
| STATE-5 | AUD-037-02 | Five-state behavior, preview-verified | APPLICABLE (register) | `evaluateSideEffectProbabilityDraft`; `data-r6-state`; `data-r6-genius-state` | No upstream original-ID source found; E4 not run |
| UI-GENIUS12 | AUD-037-03 | 12-box/CORE-5, DOM verified | APPLICABLE (register) | genius boxes 1–12, compact `[boxes[1],boxes[2],boxes[6],boxes[8],boxes[11]]` | No upstream original-ID source found; DOM unverified |
| I18N-PARITY | AUD-037-04 | Parity with archived evidence | APPLICABLE (register) | `i18n/tool-037-side-effect-probability.json`; `tool-037-i18n-check.mjs`; tracked evidence test | No upstream original-ID source found; 88/88 not re-run |
| EXPORT-CSV | AUD-037-05 | Export implemented/verifiable | APPLICABLE (register) | `buildSideEffectProbabilityCsv`; Blob download marker `tool-037-side-effect-probability.csv` | No upstream original-ID source found; browser unverified |
| TEST-FOCUSED | AUD-037-06 | Focused battery rerun/archived | APPLICABLE (register) | tracked pipeline/engine/i18n tests; historical 17/50 | No upstream original-ID source found; no E3 here |
| BUILD-TSC | AUD-037-07 | Clean build/typecheck archived | APPLICABLE (register) | no live run | No upstream original-ID source found; build evidence absent |
| PREVIEW-ROUTE | AUD-037-08 | Route loads on accessible preview | APPLICABLE (register) | tracked flat + hierarchical routes | No upstream original-ID source found; preview unavailable |
| BROWSER-EN-AR | AUD-037-09 | EN/AR browser checks | APPLICABLE (register) | i18n JSON | No upstream original-ID source found; E4 unavailable |
| BROWSER-5-STATES | AUD-037-10 | Five states in browser | APPLICABLE (register) | state markers | No upstream original-ID source found; E4 unavailable |
| RTL-390 | AUD-037-11 | 390px RTL browser test | APPLICABLE (register) | AR locale | No upstream original-ID source found; E4 unavailable |
| CONSOLE-HYDRATION | AUD-037-12 | Console/hydration capture | APPLICABLE (register) | Next.js page | No upstream original-ID source found; E4 unavailable |
| NO-DUP-GENIUS | AUD-037-13 | DOM duplicate/shell check | APPLICABLE (register) | non-exempt shared shell + tool-owned genius | No upstream original-ID source found; E4 unavailable |
| C4-SOURCES | AUD-037-14 | Approved source/provenance pack or N/A | APPLICABLE (register) | `TOOL_037_SOURCES = []` (contract line 81) | No upstream original-ID source found; approval missing |
| C5-REFERRAL | AUD-037-15 | Approved referral wording | APPLICABLE (register) | `referral_not_available`; `pending_medical_review` | No upstream original-ID source found; approval missing |
| CLINICAL-REVIEW | AUD-037-16 | Clinical/model sign-off | APPLICABLE (register) | D-CLIN open; P-07 BLOCKED | No upstream original-ID source found; sign-off missing |
| W18-HISTORY | AUD-037-17 | W18/Box 11 decision and storage | APPLICABLE (register) | box 11 `not_available`; rating `session_only_not_saved` | No upstream original-ID source found; decision missing |
| P03-PIPELINE | AUD-037-18 | Shared P-03 layer approved/proved | APPLICABLE (register) | per-tool result guard present; shared layer `NOT_IMPLEMENTED` | No upstream original-ID source found; shared approval missing |

### B.3 Totals

- Recovered register rows: **18**; applicable: **18**; justified N/A: **0**; unmapped within register: **0**.
- Canonical denominator beyond the register: **unrecoverable**; unmapped original requirements: **unknown**.
- Completion, register-scoped only: `0 PASS(E3+) / 18 = 0%`; historical ledger-internal `3/18 = 16.67%` (E1 history, not re-certified).

### B.4 Source authority conflict log

| Source | Location | Conflict / impact | Resolution required |
|---|---|---|---|
| Dev proposal P-03 | line 17 | "Result schema enforcement in pipeline — NOT IMPLEMENTED" vs static `SideEffectRiskResultSchema.safeParse` + `isToolOutput` in pipeline | Distinguish per-tool guard (present) from shared P-03 layer/approval (open); owner ruling |
| Closure ledger | lines 17, 20, 22 | E3 historical results at HEAD `8d7e406c` | Preserve as history; no E3 re-award at `37f047a4` |
| B2b §037(d) | line 193 | B2b cites `npx vitest run ...pipeline.test.ts` (tracked) — confirmed tracked at HEAD | No conflict; command retained in L.1 |
| B2b self-hash | line 399 | Embedded hash differs from observed bytes | Observed SHA authoritative |

---

## C. Existing Architecture and Implementation

### C.1 File inventory (exact path, git status, observed SHA)

| Path | Git status | Role / observed implementation | Observed SHA-256 |
|---|---|---|---|
| `lib/tools/engines/tool-037-side-effect-probability.ts` | tracked, clean | Pure additive/independent-risk heuristic engine | `2085C299E8D58652FBD6BCC89260EBD456743D60245F95132768C49D1B876BF3` |
| `lib/tools/r6/tool-037-side-effect-probability-pipeline.ts` | tracked, clean | tryParse → engine → result schema → envelope → guard; fail-safe union | `0E1B99F4A07347EF76533608FEABFFE519AFBD6CB40F58BAAAB9466067F416E9` |
| `lib/tools/r6/tool-037-side-effect-probability-contract.ts` | tracked, clean | Draft evaluation, 5 states, empty sources, CSV builder | `D25E48F3CC4951A22EBEADB6E59AFBE32574AF1A4444CD78063A966487DA2385` |
| `lib/tools/schemas/tool-037-side-effect-probability.ts` | tracked, clean | Zod input/output contract | `5FAC6197482A6A3F81F881C7D97196F98D3ECA394DDE858405496BE145A4BC57` |
| `components/tools/tool-037-side-effect-probability.tsx` | tracked, clean | Main UI, `runSideEffectProbability` wiring, state badge, compound rows | `E55D29B3F164864F49F4938F6C68BBB4BEAB08C6059A57FF7943424199DED5C7` |
| `components/tools/tool-037-side-effect-probability.genius.tsx` | tracked, clean | Tool-owned 12-box GENIUS + CORE-5 compact selector | `E72838A3EF61E32A401AEED6281B0A5676ED31E0C7B5A7D6D3AC392DD6F8300E` |
| `i18n/tool-037-side-effect-probability.json` | tracked, clean | EN/AR strings | `D67A035991E7C5439A3FD0D9382939207231361F9D3BE452F9A142C40B7E8F7E` |
| `lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts` | tracked | Pipeline tests, clean-clone reproducible | not hashed (declared) |
| `lib/tools/engines/tool-037-side-effect-probability.test.ts` | tracked (per B2b command set) | Engine tests declared | not re-run |
| `tests/unit/tool-037-i18n-evidence.test.ts` | tracked (blob `33b256c1…`) | i18n evidence test declared | not re-run |
| `docs/MRX Genius Cloud Unified R6.1/tool-037-i18n-check.mjs` | tracked (blob `f9dacaf7…`) | i18n parity checker, read-only inspected, NOT executed | not re-run |
| `app/smarttools/tool-037-side-effect-probability/page.tsx` | tracked (blob `2875b383…`) | Flat route | not re-run |
| Shared: `registry.ts`, `categories.ts`, `smartToolsCatalog6.ts`, `manifest.ts`, `R6ToolShell.tsx`, `boxes.ts` | tracked | Identity/shell — no change authorized | see W4b §2 |

### C.2 Dependencies and chain

`registry/categories/catalog` → hierarchical route + shared `R6ToolShell` (non-exempt) → `tool-037-side-effect-probability.tsx` → `evaluateSideEffectProbabilityDraft` → `runSideEffectProbability(input, options)` → `sideEffectProbabilityInputSchema.tryParse` → `calculateSideEffectProbability` → `SideEffectRiskResultSchema.safeParse` → `createToolOutput` → `isToolOutput` → `Tool037Genius` boxes + `buildSideEffectProbabilityCsv`. Timestamps/locale/unit system are caller-injected; engine has no I/O, DB, network, clock or randomness. No shared-component change authorized; W4b blast radius HIGH/CRITICAL for shared files.

---

## D. Math Engine and Equation Audit

| Item | Observed implementation (E2) | Boundary / note |
|---|---|---|
| Per-compound risk | `p = clamp01(base[family][effect] * (weekly_dose_mg / max(1, reference_dose_mg)))` for 6 effects (acne, gyno, hairloss, liver, lipids, mood) across 6 families | Fixed base-rate table in engine; heuristic population averages |
| Independent combination | `acc[k] = 1 - (1 - acc[k]) * (1 - p)` accumulated per compound (§37.1) | No independence proof; documented heuristic |
| Modifiers (§37.2) | AI `gyno ×0.4`; liver support `liver ×0.6`; BF>25 `gyno ×1.5`, `acne ×1.2`; age≥40 `lipids ×1.3`, `liver ×1.2` | Multiplicative, order-dependent as coded |
| Duration | `durationFactor = 1 + max(0, cycleWeeks - 8) * 0.03`, applied to all effects and clamped to [0,1] | Linear after 8 weeks |
| Levels | `probability_pct = round(acc*1000)/10`; `high ≥ 30`, `moderate ≥ 12`, else `low` | Results sorted descending |
| Overall burden | `1 - Π(1 - pct/100)` over the six rounded percentages, one decimal | Recombines rounded values |
| Mitigations | Threshold-triggered strings (gyno/liver/lipids/mood) + default monitoring string + mandatory "Heuristic population estimates — not a personal medical prediction" | Safety text in engine result |
| Guards | Zod: 1–8 compounds, family enum, dose 1–5000 mg, age int 18–90, BF 5–60, weeks int 1–52, booleans; contract mirrors bounds | Finite/positive; no NaN/Infinity; no empty→zero |
| Determinism | No clock/random/I/O; round at fixed precision | Structural only (E2); **NOT_RUN** in this audit |

**Math verdict:** equations, guards and unit semantics (% probabilities) are internally consistent at E2. The model is explicitly heuristic; no personal medical prediction is claimed. Residual gap is evidence (no executed test here), not a proven arithmetic defect.

---

## E. Pipeline and Schema Audit

`runSideEffectProbability` chain is identical in shape to Tool 034: `tryParse` (fail-safe) → engine → `SideEffectRiskResultSchema.safeParse` → `createToolOutput` (unit `percent`, `confidence: null`, `dataQuality: not_assessed`, source `manual`, key finding `OVERALL_BURDEN`, SEO links) → `isToolOutput` → `{ok:true,output}` or `{ok:false,error}`.

- Input guards: strict Zod object with bounds enumerated in D; contract `evaluateSideEffectProbabilityDraft` mirrors them and returns EMPTY/INVALID/PARTIAL/READY with `schema_mismatch` fallback.
- Result guard present in code (distinct from proposal P-03's "NOT IMPLEMENTED" wording — reconciled in B.4).
- Component calls the pipeline directly (`run = evaluation.input ? runSideEffectProbability(evaluation.input, options) : null`), so the guarded path is the live path.
- No debounce/timer observed in the component; recalculates on render from draft (deterministic, cheap).
- P-03: committed structural gate is historical E3; runtime-negative per-pipeline proof uncommitted/NOT_RUN in true-clean; shared layer FAIL in B2b. **NOT_RUN** here.

---

## F. AI and Intelligence Capabilities

| Capability | Status | Evidence / reason |
|---|---|---|
| AI brain / model / prompt / provider / RAG | **Unavailable** | No model/provider/prompt in engine, pipeline or components (E2) |
| Prediction | **Not applicable** | Engine explicitly "heuristic population estimates — not a personal medical prediction"; no model-based inference |
| What-if / sensitivity | **Implemented (static)** | Boxes 5/6 derive from pipeline arithmetic |
| Confidence / uncertainty | **Explicit non-claim** | `confidence: null`, `dataQuality: not_assessed`, `confidence_not_assessed` in box 2, uncertainty/formula text in box 3 |
| Explanation | **Implemented (static)** | Box 3 `static`: formula, assumptions, uncertainty strings |
| Mitigation guidance | **Implemented (static)** | Box 7 renders engine `mitigations` array + referral `NOT_AVAILABLE` + `pending_medical_review` |
| No fabricated defaults | **Implemented (static)** | Draft starts empty; no invented values; rating not saved |

No AI capability is claimed; no prompt/button is treated as runtime AI evidence.

---

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented (E2) | Tested (E3) | Runtime-verified | Evidence / gap | Next action |
|---|---|---|---|---|---|---|---|
| Box 1 KPI | yes | yes | yes (`source: engine`) | not in this audit | no | `overall_burden`, risk count | E4 capture |
| Box 2 primary | yes | yes | yes | no | no | `data-r6-core="c1"`, probability list, confidence non-claim, heuristic note | E4 capture |
| Box 3 calculated | yes | yes | yes | no | no | `data-r6-core="c2"`, formula/assumptions/uncertainty | E4 capture |
| Box 4 inputs | yes | yes | yes | no | no | in-memory draft summary | E4 capture |
| Box 5 what-if | yes | yes | yes | no | no | engine-derived | E4 capture |
| Box 6 sensitivity | yes | yes | yes | no | no | engine-derived | E4 capture |
| Box 7 safety | yes | yes | yes | no | no | `data-r6-core="c3"`, mitigations + referral `NOT_AVAILABLE` | Owner C5 |
| Box 8 cross-tool | yes | yes | yes (no mapped data) | no | no | `box8_none`; prev/next nav links only | Owner decision if mapping required |
| Box 9 sources | yes | yes | yes (`not_available`) | no | no | `TOOL_037_SOURCES = []`; D-C4 open | Owner C4 pack/N/A |
| Box 10 export | yes | yes | yes | no | no | Blob CSV `tool-037-side-effect-probability.csv` | E4 download capture |
| Box 11 history | yes | yes | yes (`not_available`) | no | no | `box11_na`; no storage | Owner W18 |
| Box 12 next actions | yes | yes | yes | no | no | `data-r6-core="c5"`, rating `session_only_not_saved` | E4 capture |
| CORE-5 compact | yes | yes | yes | no | no | `visible = compact ? [boxes[1],boxes[2],boxes[6],boxes[8],boxes[11]] : boxes` → 1-based **2,3,7,9,12** | Confirm mapping documentation |
| Fixed order / markers | yes | yes | yes | no | no | `data-r6-genius="tool-037"`, `data-r6-genius-state={state}`, `data-r6-box` | E4 DOM check |
| No duplicate shell | yes | open | unresolved | no | no | Non-exempt shared shell + tool-owned boxes (W4b) | E4 DOM inspection before any shared change |

---

## H. Dynamic Results and UI Maturity

| Aspect | Static inspection (E2) | Component test | Integration test | True-clean | Browser E4 |
|---|---|---|---|---|---|
| Five states | `evaluateSideEffectProbabilityDraft` EMPTY/INVALID/PARTIAL/READY → UI FULL/DEGRADED; `data-r6-state` + `data-r6-genius-state` | declared, not run | not found | not run | NOT_RUN |
| Live recalculation / debounce | Direct pipeline call on render; no debounce observed | not run | — | — | NOT_RUN |
| Compact/full | buttons + `aria-pressed`, 5-of-12 boxes | not run | — | — | NOT_RUN |
| Interaction | Add/remove compound rows, family selects, AI/liver-support toggles | structural only | — | — | NOT_RUN |
| Responsive/a11y | `dir` from locale, `aria-live` state badge, `fieldset data-r6-field`, Tailwind grid | structural only | — | — | 390/1440/keyboard NOT_RUN |
| Hydration/console | Next.js client component | — | — | — | NOT_RUN |

**UI verdict:** state and box wiring are statically coherent and cleaner than Tool 035; behavior remains E2/NOT_RUN without isolated execution or browser.

---

## I. Cross-Tool and Data Integration

- `TOOL_037_SOURCES` is empty; no exported cross-tool link contract in `tool-037-side-effect-probability-contract.ts`; box 8 explicitly says `box8_none` and renders only prev/next navigation links plus `calculatedAt`.
- No payload transfer, session handoff, freshness rule or stale action declared for cross-tool data. W18 boundary intact: rating is `session_only_not_saved`; no storage, DB, Supabase, cloud sync or API call in tool-owned files.
- `buildSeoLinks(requireTool(...))` supplies envelope SEO links; registry/route provide neighbors.
- Non-exempt shell + tool-owned boxes remains a DOM-level open question (Section G); any shell/manifest change is shared/HIGH-CRITICAL per W4b and not authorized.

---

## J. Safety, Sources and Privacy

- Validation: strict Zod + mirrored contract bounds (age 18–90, BF 5–60, weeks 1–52, dose 1–5000, 1–8 compounds); no empty→zero coercion.
- Sources: empty `TOOL_037_SOURCES` and box 9 `not_available`; D-C4 open; proposal P-05 BLOCKED ("heuristic population-average model").
- Referral: `referral_not_available` + `pending_medical_review`; D-C5 open; P-06 PARTIAL (generic non-diagnosis wording only).
- Clinical review: D-CLIN open; P-07 BLOCKED; engine result always carries "not a personal medical prediction".
- Privacy: no logging/analytics/remote storage observed in tool-owned files; inputs remain client-side; CSV is a local Blob. Browser verification NOT_RUN.

---

## K. Localization and Browser Maturity

- `i18n/tool-037-side-effect-probability.json` (observed SHA `D67A0359…`) + `pickToolI18n`; `dir={isRtl ? 'rtl' : 'ltr'}`; source badges and heuristic/referral strings localized; historical 88/88 PASS (E1).
- `docs/MRX Genius Cloud Unified R6.1/tool-037-i18n-check.mjs` observed and read only: JSON parse, `en`/`ar` key sets, parity and allow-list checks. **NOT executed.**
- `tests/unit/tool-037-i18n-evidence.test.ts` tracked (blob `33b256c1…`); **NOT executed.**
- E4 prerequisites absent (SSO session, preview pinned to `37f047a4`, Deployment ID): EN/AR, 5 states, RTL 390px, console/hydration, DOM duplicate checks = **NOT_RUN** (E0). Historic deployment evidence not transferable.

---

## L. Tests and Evidence

### L.1 Evidence register (no executions in this audit)

| ID | Requirement ID | Source file | Test command (exact, isolated) | Environment | Source SHA | Date | Actual result | Level | Reproducible | Validity | HEAD compatibility |
|---|---|---|---|---|---|---|---|---|---|---|---|
| EV-037-01 | ENG-PIPELINE | `lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts` (tracked) | `npx vitest run --config vitest.config.ts lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts` | CWD `E:\MrXSteroid-main`, deps present, no installs | pipeline SHA `0E1B99F4…` | 2026-11-19 | **NOT_RUN** | E2 | yes | static only | at HEAD |
| EV-037-02 | TEST-FOCUSED | engine + pipeline + i18n tests | `npx vitest run --config vitest.config.ts lib/tools/engines/tool-037-side-effect-probability.test.ts lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts tests/unit/tool-037-i18n-evidence.test.ts` | same | n/a | 2026-11-19 | **NOT_RUN** | E2 | yes | static only | at HEAD |
| EV-037-03 | I18N-PARITY | i18n check script | `node "docs/MRX Genius Cloud Unified R6.1/tool-037-i18n-check.mjs"` | same | script blob `f9dacaf7…` | 2026-11-19 | **NOT_RUN** | E2 (script read) | yes | static only | at HEAD |
| EV-037-04 | BUILD-TSC | project | `npx tsc --noEmit`; `npx next build` | clean clone/worktree at `37f047a4`, deps installed, capture full log + exit code | n/a | 2026-11-19 | **NOT_RUN** | E0 | yes | none | target HEAD |
| EV-037-05 | Browser rows | SSO preview | authorized SSO session + preview pinned to `37f047a4` + Deployment ID; EN/AR, 5-state, RTL 390px, console/hydration, DOM duplicate checks | unavailable | n/a | 2026-11-19 | **NOT_RUN / NOT_AVAILABLE** | E0 | no | none | not established |

### L.2 Completion calculation
`PASS(E3+) = 0`, applicable register rows `= 18` → **0%**. Historical ledger-internal `3/18 = 16.67%` (ENG-PIPELINE, I18N-PARITY, TEST-FOCUSED at E3) is preserved as E1 history; no official denominator asserted.

### L.3 Hash discipline
Observed SHA-256 values in C.1/header are authoritative. B2b's embedded self-hash differs from observed bytes; originals were not edited. See end-of-document integrity note; whole-file SHA reported in delivery response.

---

## M. Defect and Gap Register

### M.1 Implementation gaps (E2)

| ID | Severity | Requirement ID | Exact file | Actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-037-01 | MEDIUM | UI-GENIUS12 / NO-DUP-GENIUS | `components/tools/tool-037-side-effect-probability.genius.tsx` + `lib/tools/r6/manifest.ts` (shared, no edit) | Tool-owned 12 boxes while W4b classifies tool non-exempt (shared shell also renders boxes) | Possible duplicate boxes | Ownership drift | E4 DOM verification; any shell/manifest fix needs Change Impact Matrix + authorization | HIGH (19 tools) |
| I-037-02 | LOW | C4-SOURCES | `lib/tools/r6/tool-037-side-effect-probability-contract.ts` line 81 | `TOOL_037_SOURCES = []`; box 9 `not_available` | C4 row unresolvable externally | No approved pack | Owner source pack or explicit N/A | none local |
| I-037-03 | LOW | C5-REFERRAL / CLINICAL-REVIEW | `components/tools/tool-037-side-effect-probability.genius.tsx` boxes 7/12 | Referral `NOT_AVAILABLE`, `pending_medical_review`, no sign-off | C5/CLIN rows open | External approvals | Owner wording + clinical sign-off | none local |
| I-037-04 | LOW | W18-HISTORY | box 11, rating control | No history storage; rating session-only | W18 row open | Owner decision pending | W18 decision | none local |
| I-037-05 | LOW | Cross-tool (I) | `components/tools/tool-037-side-effect-probability.genius.tsx` box 8 | `box8_none` — no mapped cross-tool data/freshness/stale action | Weaker than 039 benchmark | No cross-tool contract authored | Add tool-local link contract if acceptance requires | LOW |

No implementation defect was found in the engine, schema, pipeline wiring, state markers, compact mapping or CSV export at E2.

### M.2 Evidence gaps (no E3+/E4 in this scope)

| ID | Severity | Requirement ID | Exact target | Missing evidence | Impact | Recommended action |
|---|---|---|---|---|---|---|
| E-037-01 | HIGH | ENG-PIPELINE, TEST-FOCUSED | tracked pipeline/engine/i18n tests | No executed log at `37f047a4` | 0 E3+ | EV-037-01/02 |
| E-037-02 | HIGH | BUILD-TSC | project | No clean build/typecheck log | PARTIAL row | EV-037-04 |
| E-037-03 | HIGH | 6 browser rows | SSO preview | No E4 artifact pinned to baseline | 6 NOT_RUN | EV-037-05 |
| E-037-04 | MEDIUM | I18N-PARITY | script + evidence test | Historical 88/88 not reproduced | History only | EV-037-03 |

FAIL (P03-PIPELINE), BLOCKED (CLINICAL-REVIEW), NOT_AVAILABLE (C4/C5/W18) are preserved without concealment.

---

## N. Development Maturity Matrix (S0–S11 per component)

Legend: S0 identity, S1 requirements, S2 architecture, S3 engine, S4 pipeline, S5 UI behavior, S6 AI/CORE-5/GENIUS-12, S7 cross-tool/safety, S8 testing, S9 true-clean reproduction, S10 browser E4, S11 external/owner approval. `✓` verified, `△` static/E2 only, `✗` missing. S10/S11 never inferred from a plan.

| Component | S0 | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Identity/registry/route | ✓ | △ | ✓ | – | – | – | – | △ | ✗ | ✗ | ✗ | ✗ | S2 static | S8 route proof | SSO preview |
| Requirements register | ✓ | △ | – | – | – | – | – | – | ✗ | ✗ | – | ✗ | S1 partial | S1 full denominator | No original-ID source |
| Engine (heuristic model) | – | – | ✓ | △ | – | – | – | – | ✗ | ✗ | – | – | S3 static | S8 engine test | Execution not authorized |
| Pipeline + schema | – | – | ✓ | – | △ | – | – | △ | ✗ | ✗ | – | ✗ (P-03) | S4 static | S8 tracked test rerun | Shared P-03 approval |
| UI / state machine | – | – | ✓ | – | – | △ | – | – | ✗ | ✗ | ✗ | – | S5 static | S8 component test | E4 unavailable |
| AI / CORE-5 / GENIUS-12 | – | – | ✓ | – | – | – | △ | – | ✗ | ✗ | ✗ | – | S6 static | S8 DOM test | Duplicate-box question |
| Cross-tool / safety | – | – | ✓ | – | – | – | – | △ | ✗ | ✗ | ✗ | ✗ | S7 static | S11 approvals | D-C4/C5/CLIN/W18 |
| Localization | – | – | ✓ | – | – | △ | – | – | ✗ | ✗ | ✗ | – | S5 static | S8 parity rerun | Script exists, not run |
| True-clean / build | – | – | – | – | – | – | – | – | △ | ✗ | – | – | S8 historical (E1) | S9 clean-clone rerun | No build log at HEAD |

Engine S3 static + browser S0 is a valid independence example; no stage inferred across components.

---

## O. Comparison with Tool 039 (applicable engineering criteria only)

Tool 039 is reference-only and never part of Tool 037's denominator. No similarity score.

| Dimension | Status | Engineering reason (reason code) | Action |
|---|---|---|---|
| Architecture | APPLICABLE | Same layered chain (route → UI validation → pipeline → pure engine → result schema → envelope → boxes) with tracked components | Preserve |
| Engine | APPLICABLE | Deterministic, pure, bounded heuristic with explicit non-prediction disclaimer; criterion is purity/determinism | Preserve |
| Validation | APPLICABLE | Input Zod + result Zod + `isToolOutput` on the live path | Preserve |
| AI | NOT_APPLICABLE | No model/prompt/provider; non-AI benchmark | Preserve |
| Dynamic results | PARTIALLY_APPLICABLE | Five states + markers present; no debounce/signature gate observed | Extend after E4/perf evidence |
| CORE-5 compact | PARTIALLY_APPLICABLE | Compact selects 1-based boxes 2/3/7/9/12, same as 039's observed selector; documentation mapping unclear | Fix mapping documentation |
| GENIUS-12 | APPLICABLE | Fixed 1–12 order, source badges, explicit `not_available` reasons | Preserve |
| Cross-tool | NOT_APPLICABLE (current design) | Box 8 explicitly has no mapped cross-tool data; 039's mapped-link pattern is not a requirement here unless adopted | Preserve boundary |
| Safety/sources | PARTIALLY_APPLICABLE | Strong heuristic disclaimers but empty C4, C5/CLIN open vs 039's approved sources | Fix via owner approvals |
| Testing | PARTIALLY_APPLICABLE | Tracked suites exist; none executed at this HEAD; historical E3 not transferable | Extend with isolated re-runs |
| Browser — current HEAD | NOT_AVAILABLE | No SSO preview pinned to `37f047a4` | Extend after gate |
| Browser — historic artifacts | NOT_VERIFIED | Historic deployment evidence not compatible-proven | Preserve as history only |

---

## P. Next Development Tasks (genuine gaps only; tool-local)

| ID | Exact file | Proposed change | Required tests | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| T-037-01 | evidence archive (separate authorization) | Run and archive EV-037-01/02/03/04 at `37f047a4` | commands in L.1 | Isolated env, deps present | LOW | E3+ for 4 static rows | Logs + exit code 0 + source SHA |
| T-037-02 | `components/tools/tool-037-side-effect-probability.genius.tsx` (diagnosis only) | Verify duplicate-box behavior in DOM; no shared-shell edit | E4 DOM check | SSO preview pinned to baseline | HIGH if shared edit attempted | Ownership decision evidenced | Screenshot/DOM with exactly one CORE-5 set |
| T-037-03 | `lib/tools/r6/tool-037-side-effect-probability-contract.ts` | If acceptance requires, add tool-local cross-tool link contract with freshness rule | link contract test | Owner requirement decision | LOW | Box 8 parity with 039 pattern | Contract + DOM proof |
| T-037-04 | C4/C5/CLIN/W18 owner packets (no code change here) | Obtain approved source pack, referral wording, clinical sign-off, history decision | n/a | Product/Clinical/Owner | none local | 4 external rows resolvable | Written decision recorded |

No task edits `R6ToolShell.tsx`, `boxes.ts`, `manifest.ts`, `registry.ts`, or the shared route page; such edits require a Change Impact Matrix across 19 tools (W4b).

---

## Q. Current Tool Decision

**Decision: NOT_VERIFIED.** Completion **0%** (`0 PASS(E3+) / 18 applicable register rows`); historical ledger-internal `3/18 = 16.67%` preserved as E1 history. The canonical denominator beyond the 18-row register is unrecoverable, so no official-denominator percentage is asserted. Main implementation gaps are external approvals (C4/C5/CLIN/W18), absent cross-tool mapped data, and the unresolved duplicate-shell question; the engine, guarded pipeline wiring, five states, 12 boxes and CSV export are statically coherent. Main evidence gaps: no E3 execution, no build log, no E4 browser artifacts at the fixed baseline. This decision implies **no** owner acceptance, phase closure, or development completion.

### Integrity note
The embedded hash below was computed over this document's body immediately before the hash line was appended; adding the line changes whole-file bytes. The authoritative **whole-file SHA-256** is reported in the delivery response.

Observed on-disk SHA-256 (body before hash line): `0DECC8234C02E498FDA7311A9F840EFC551BA2E198B1D0340E9402CCA25B5B06`
