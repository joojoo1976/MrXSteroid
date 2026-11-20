# TOOL 035 — Individual Development Audit (R6.1 phase-next)

| Field | Value |
|---|---|
| Tool ID / canonical name | `mrx.tool.035-hormone-conversion` — Hormone Conversion Rate Calculator (sourced testosterone/estradiol lab-unit converter) |
| Canonical slug | `tool-035-hormone-conversion` |
| Category / canonical route | `pharmacokinetics` / `/smarttools/pharmacokinetics/tool-035-hormone-conversion` |
| Batch | 1 (closure ledger); operator review grid: round 3 / worker A |
| Fixed baseline | Branch `feat/r6.1-tools-041-042`; HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f`; audit date 2026-11-19 |
| Working tree | Dirty; preserved unchanged; no git write or code edit |
| Governing standard | `00-PLAN-AND-AUDIT-STANDARD.md` — observed SHA `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9` |
| Denominator inventory | `W2-CANONICAL-DENOMINATOR-INVENTORY.md` — observed SHA `3276ACD111A66506568975ADA721F51FC520F7B28AF6C7CB9AB09916CAC96A6A` |
| Row-level evidence | `retry-01/B2b-LEDGER-034-044.md` — observed SHA `F9E17DA9E17B54B74FCC49C5F5BE12B7E3899CC895CD2A6149C16DED51C7A74B` (embedded self-hash differs; observed wins) |
| Closure ledger (18-row) | `closure-sprint-2026-11-17/tool-035-closure-ledger.md` — observed SHA `60279DEC77B77E80F3911AD7F97FDEEE72DCB0075CE0C66ADD1104A0EC23DC38` |
| Dev proposals | **Not found** — no `TOOL-035-DEVELOPMENT-PROPOSALS.md` in `docs/MRX Genius Cloud Unified R6.1/` |
| Shared-component map | `phase-next/W4b-SHARED-COMPONENT-IMPACT-MAP.md` — observed SHA `157FB3DD879BAE4AF66E4B3AA1404788A3AC469FF8AF1B7ED60C6E3D1282C263` |
| Reference profile | `phase-next/R6.1-TOOL-039-ENGINEERING-REFERENCE-PROFILE.md` — observed SHA `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` |
| True-clean reference | `E:\p03-true-clean-20261118` (HEAD verified `37f047a4`, detached); contaminated `2a647fda` clone excluded |
| Tool decision (Section Q) | **NOT_VERIFIED** — 0% verified (0/18 at E3+); historical ledger 0/18 (0%); no owner acceptance implied |

**Scope and evidence discipline.** Read-only inspection plus this document only. No code, contract, schema, source ledger, acceptance ledger, registry, route, test, git state, build, `tsc`, lint, Vitest, dev server, install, or browser/runtime E4 action was performed. Execution rows are `NOT_RUN` with exact isolated commands. Levels: E0 none, E1 assertion, E2 file/static code, E3 reproducible test, E4 runtime/browser, E5 independent audit; only E3+ counts as PASS. Observed on-disk SHA-256 wins over embedded self-hashes; no original was edited.

---

## A. Tool Identity and Historical Lineage

| Attribute | Observed value | Evidence | Level |
|---|---|---|---|
| Tool ID / slug / version | `mrx.tool.035-hormone-conversion` / `tool-035-hormone-conversion` / `1.0.0` | `lib/tools/registry.ts:81`; `lib/tools/smartToolsCatalog6.ts:8` | E2 |
| Page enum / order / tier | `Page.HORMONE_CONVERSION` / `510` / `free` / `stackStatus: layered` | `lib/tools/registry.ts:81`; catalog line 8 | E2 |
| Category / canonical href | `pharmacokinetics` / `/smarttools/pharmacokinetics/tool-035-hormone-conversion` | `lib/tools/categories.ts:115`; registry; catalog | E2 |
| Flat legacy route | `app/smarttools/tool-035-hormone-conversion/page.tsx` present, tracked blob `a42102d0…` | `git ls-files -s` | E2 |
| Hierarchical route | `app/smarttools/[category]/[tool]/page.tsx` (tracked blob `351E7CBE…` per reference profile) with shared `R6ToolShell` for non-exempt tools | static read; W4b §1 | E2 |
| Historical ledger identity | Batch 1; header claims **hormonal-health** `/smarttools/hormonal-health/tool-035-hormone-conversion`; tool source SHA `108d3063`; snapshot HEAD `8d7e406c` | closure ledger lines 3–8 | E1 (historical) |
| Historical deployment | `dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL`, SSO-protected; direct URL under `hormonal-health` | closure ledger lines 7–8 | E1 |
| Historical acceptance | i18n: "no R6.1 i18n-check script"; artifacts exist but "no R6.1 proposals/i18n-check/closure ledger" (self-contradictory header note superseded by ledger existence); pragmatic `0/18 = 0%`; `IN PROGRESS` / `NOT CLOSED` | closure ledger lines 9–12 | E1 |
| Dev proposals | None located; no owner-review register of P-01..P-10 for this tool | filesystem enumeration | E2/E1 |
| Current owner/decision | No owner acceptance in-repo at `37f047a4`; component modified and genius/contract untracked in WT (uncommitted delta) | `git status --porcelain` | E2 |

Lineage conclusion: live canonical category is `pharmacokinetics`; the ledger's `hormonal-health` route is historical drift. The untracked/modified UI artifacts mean current behavior is only partly represented by committed HEAD evidence.

---

## B. Original and R6.1 Requirements

### B.1 Canonical denominator finding (mandatory explicit statement)

**The canonical denominator for Tool 035 cannot be fully recovered from in-repo sources.** The frozen inventory lists only `closure-sprint-2026-11-17/tool-035-closure-ledger.md/.csv` (18 rows) as authoritative; there is no tool-specific requirements CSV, no atomic ledger beyond the 18-row register, no Initial Prompt/SPEC/ACCEPTANCE/CLOSURE-LAYER requirement map, no master acceptance spec, and no dev-proposal register. The 18 rows are an **operational review grid**, **not** the official acceptance denominator. No official completion denominator is asserted.

What is missing: (a) original requirement IDs from Initial Prompt/SPEC/ACCEPTANCE/CLOSURE-LAYER, (b) original-ID → atomic-requirement crosswalk, (c) designated master acceptance spec, (d) owner-approved N/A decisions for C4/C5/W18, (e) an R6.1 i18n-check script for this tool (none found; only 034/037/038 scripts exist), (f) approved source/referral packs and clinical sign-off. The `R6.1-ATOMIC-LEDGER-RECONCILIATION.md §3` flag ("Not fully re-audited…") is a governance note preserved as history, not an additional denominator.

### B.2 Canonical mapping table

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| ENG-PIPELINE | AUD-035-01 | R6 pipeline artifacts + focused evidence; pipeline wired per acceptance | APPLICABLE (register) | pipeline module tracked; component uses engine+adapter, no `runHormoneConversion` call | No upstream original-ID source found; 18-row grid only |
| STATE-5 | AUD-035-02 | Five-state behavior with evidence | APPLICABLE (register) | `data-r6-state={lifecycleState}` in main; no `data-r6-genius-state` in genius | No upstream original-ID source found; E4 not run |
| UI-GENIUS12 | AUD-035-03 | 12-box / CORE-5 closure UI | APPLICABLE (register) | untracked `tool-035-hormone-conversion.genius.tsx`; 12 boxes; compact shows 6 | No upstream original-ID source found; browser unverified |
| I18N-PARITY | AUD-035-04 | R6.1 i18n parity check with evidence | APPLICABLE (register) | `i18n/tool-035-hormone-conversion.json` tracked; **no check script found** | No upstream original-ID source found; parity script absent |
| EXPORT-CSV | AUD-035-05 | Export implemented and verifiable | APPLICABLE (register) | `handleCopyCsv` / `navigator.clipboard.writeText` in untracked genius | No upstream original-ID source found; browser unverified |
| TEST-FOCUSED | AUD-035-06 | Focused battery rerun/archived | APPLICABLE (register) | tracked component test; untracked parity/pipeline tests | No upstream original-ID source found; no E3 here |
| BUILD-TSC | AUD-035-07 | Clean tsc/build output archived | APPLICABLE (register) | no live run | No upstream original-ID source found; build evidence absent |
| PREVIEW-ROUTE | AUD-035-08 | Route loads on accessible preview | APPLICABLE (register) | tracked flat route; hierarchical route shared | No upstream original-ID source found; preview unavailable |
| BROWSER-EN-AR | AUD-035-09 | EN/AR browser checks | APPLICABLE (register) | i18n JSON exists | No upstream original-ID source found; E4 unavailable |
| BROWSER-5-STATES | AUD-035-10 | Five states in browser | APPLICABLE (register) | static state markers only | No upstream original-ID source found; E4 unavailable |
| RTL-390 | AUD-035-11 | 390px RTL browser test | APPLICABLE (register) | AR locale exists | No upstream original-ID source found; E4 unavailable |
| CONSOLE-HYDRATION | AUD-035-12 | Console/hydration capture | APPLICABLE (register) | Next.js page present | No upstream original-ID source found; E4 unavailable |
| NO-DUP-GENIUS | AUD-035-13 | DOM duplicate/shell check | APPLICABLE (register) | non-exempt shared shell + tool-owned genius (untracked) | No upstream original-ID source found; E4 unavailable |
| C4-SOURCES | AUD-035-14 | Approved source/provenance pack or N/A | APPLICABLE (register) | `TOOL_035_SOURCES` has 2 unapproved refs (Bhasin 2010, SI units) | No upstream original-ID source found; approval missing |
| C5-REFERRAL | AUD-035-15 | Approved referral wording | APPLICABLE (register) | no approved wording pack | No upstream original-ID source found; approval missing |
| CLINICAL-REVIEW | AUD-035-16 | Clinical/model sign-off | APPLICABLE (register) | D-CLIN open | No upstream original-ID source found; sign-off missing |
| W18-HISTORY | AUD-035-17 | W18/Box 11 decision and storage boundary | APPLICABLE (register) | box 11 `not_applicable`; adapter has localStorage draft + POST snapshot | No upstream original-ID source found; decision missing; persistence delta needs ruling |
| P03-PIPELINE | AUD-035-18 | Shared P-03 layer approved/proved | APPLICABLE (register) | per-tool pipeline guards present but component bypasses pipeline | No upstream original-ID source found; shared approval missing |

### B.3 Totals

- Recovered register rows: **18**; applicable: **18**; justified N/A: **0**; unmapped within register: **0**.
- Canonical denominator beyond the register: **unrecoverable**; number of unmapped original requirements: **unknown**.
- Completion, register-scoped only: `0 PASS(E3+) / 18 = 0%`; historical ledger-internal `0/18 = 0%` (E1 history, consistent but not re-certified).

### B.4 Source authority conflict log

| Source | Location | Conflict / impact | Resolution required |
|---|---|---|---|
| Closure ledger | lines 4, 8 | `hormonal-health` route vs live `pharmacokinetics` | Treat ledger route as historical drift |
| Closure ledger | line 9–10 | says no i18n-check script and "no closure ledger" while ledger exists | Superseded by observed ledger; still no script found |
| Closure ledger §Requirements | I18N-PARITY `NOT_RUN/E0` | B2b also NOT_RUN | Consistent; no E3 claim |
| `tool-035-hormone-conversion-contract.ts` | header line 4 vs `labFreshness` line 74 | Header claims "zero system clock dependencies" but `labFreshness` calls `Date.now()` | Documentation/contract wording needs correction (tool-local) |
| B2b §035(d)/summary | pipeline wiring + state markers | Confirmed: no `runHormoneConversion` in component; no `data-r6-genius-state` in genius (main has `data-r6-state`) | Preserve B2b findings; no edit to original |
| B2b self-hash | line 399 | Embedded hash differs from observed bytes | Observed SHA authoritative |

---

## C. Existing Architecture and Implementation

### C.1 File inventory (exact path, observed git status, SHA)

| Path | Git status | Role / observed implementation | Observed SHA-256 |
|---|---|---|---|
| `lib/tools/engines/tool-035-hormone-conversion.ts` | tracked, clean | Pure molar-mass unit conversion; fail-fast `ConversionInputSchema.parse` | `F96C4E5879B1E0EA014EE5620B9C07C7EAEC3CE250138DDD4F83BC823FE3C2D3` |
| `lib/tools/r6/tool-035-hormone-conversion-pipeline.ts` | tracked, clean | Full fail-safe pipeline `runHormoneConversion` — **not imported by main component** | `8BAC14CFBA3B67F5E43E91552B21147C9C96E2D366DDD3D1D41C5C71B7445D3C` |
| `lib/tools/r6/tool-035-hormone-conversion-contract.ts` | **untracked** | Field contract, reference limits, 2 sources, 3 cross-links, `labFreshness(Date.now())`, CSV builder | `DB7F482859BCDBFC8D628A8927E179F005C26F2DE1CF84EF4348F7DBF428A049` |
| `lib/tools/schemas/tool-035-hormone-conversion.ts` | tracked, clean | Zod input/output contract with analyte/unit compatibility refinement | `0823C89503DBAB6E9F956EF8217B144960CA973BCAA0E57F9ACE2FDFC2502B15` |
| `components/tools/tool-035-hormone-conversion.tsx` | **modified** | Main UI; engine + adapter path; draft/snapshot persistence; OCR/visual/demo/compact deltas | `0AFAC292D50355E1E06D1A2854360DFDF8A0699B54815BC356E49D77EB282A41` |
| `components/tools/tool-035-hormone-conversion.genius.tsx` | **untracked** | Tool-owned 12-box GENIUS, clipboard CSV, box 11 `not_applicable` | `91394DF66C24A7A72AD931F8FEC86FC83A68CF96F4E072F50DAD199D680E64DA` |
| `i18n/tool-035-hormone-conversion.json` | tracked, clean | EN/AR strings | `D2114B778D6F876F5483C8F0FD742D32D2E5F5A3D70FDCA03F9680D4179A426B` |
| `lib/tools/adapters/tool-035-hormone-conversion.ts` | tracked, clean | `buildConversionOutput` → envelope (used by component) | `B137E433CA2B792D3A687C6E47A44F5AE9E42631840DDF38681FC1FCC6E2AC08` |
| `lib/tools/adapters/toolLogAdapter.ts` | tracked (shared) | `saveDraft`/`loadDraft` → `localStorage`; `commitDashboardSnapshot` → HTTP POST `TOOL_LOG_ENDPOINT` | `14C897BAA8543055E739EBA0EED9580DD2A3BA99097C49A8CB8F3242A5B0569D` |
| `lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts` | **untracked** | Pipeline test in WT only | not hashed |
| `components/tools/tool-035-hormone-conversion.parity.test.tsx`, `.visual.tsx`, `.ocr.tsx`, `.pdf.tsx` | **untracked** | Post-baseline parity/OCR/PDF/visual deltas | not hashed |
| `tests/unit/tool-035-*` i18n evidence | **not found** | No dedicated i18n evidence test/script for 035 | n/a |
| `docs/MRX Genius Cloud Unified R6.1/tool-035-i18n-check.mjs` | **not found** | Only 034/037/038 scripts exist (glob verified) | n/a |
| Shared: `registry.ts`, `categories.ts`, `smartToolsCatalog6.ts`, `manifest.ts`, `R6ToolShell.tsx` | tracked | Identity/shell — no change authorized | see W4b §2 |

### C.2 Dependencies and chain (observed, two parallel paths)

1. **Live component path:** `tool-035-hormone-conversion.tsx` → `ConversionInputSchema.safeParse` → `calculateHormoneConversion` (engine) → `buildConversionOutput` (adapter, envelope) + `commitDashboardSnapshot` (optional POST) → `Tool035Genius` (untracked) / `Tool035Visual` (untracked) / OCR modal.
2. **Dormant R6 path:** `runHormoneConversion` → `hormoneConversionInputSchema.tryParse` → engine → `ConversionResultSchema.safeParse` → `createToolOutput` → `isToolOutput` — module exists and is structurally gated but is **not called** by the component.
3. Shared persistence: `toolLogAdapter` uses `localStorage` for auto-draft and an HTTP POST for snapshots; neither is a database/Supabase call in the observed code, but the POST is a server boundary requiring W18/owner ruling.

No shared-component edit authorized or proposed. W4b classifies Tool 035 as shared-shell non-exempt.

---

## D. Math Engine and Equation Audit

| Item | Observed implementation (E2) | Boundary / note |
|---|---|---|
| Conversion factors | Testosterone `10 / 288.4`; Estradiol `1000 / 272.4` (molar masses g/mol in engine and contract) | Molar-mass derived; convert-once |
| Direction | `forward` when testosterone `ng/dL` or estradiol `pg/mL`; multiply by factor, else divide; result units `nmol/L`/`pg/mL` or `pmol/L`/`pg/mL` respectively | Analyte/unit compatibility enforced by Zod `superRefine` |
| Rounding | Result 4 decimals; `conversion_factor` 8 decimals; `Math.round((value + Number.EPSILON)*n)/n` | Deterministic, no banker's rounding |
| Guards | `ConversionInputSchema.parse`: finite value `0..10_000_000`, real `YYYY-MM-DD` date, `reading_source` trimmed 3–200 chars, analyte enum, unit enum + analyte match; strict object | Fail-fast throw at engine level; pipeline uses `tryParse` |
| Zero / negative / NaN / Infinity | `0` accepted (valid typed zero); negatives/NaN/Infinity rejected by Zod; no empty→zero coercion in component | Documented in schema |
| Determinism | Pure conversion; engine has no clock/I/O; contract's `labFreshness` uses `Date.now()` (UI helper, not engine) | Contract header wording discrepancy (Section B.4) |
| Result schema | `ConversionResultSchema.safeParse` in dormant pipeline; adapter path does **not** re-validate the engine result | Live component path relies on engine + schema parse of input only |
| Interpretation limits | `calculation_method: 'MOLAR_MASS_DERIVED_UNIT_CONVERSION'`; adapter provenance says user-entered source unverified; `confidence: null` | No hormone estimation or interpretation |

**Math verdict:** conversion arithmetic and guards are coherent at E2. The notable architectural finding is that the fail-safe result-schema/envelope path exists but the live UI uses the adapter path instead; no arithmetic defect is claimed.

---

## E. Pipeline and Schema Audit

- Dormant full pipeline (`runHormoneConversion`) has the same four-guard chain as Tools 034/037/038: tryParse → engine → result schema → envelope → `isToolOutput`, returning `{ok:false,error}` on any failure. It is **not imported** by the main component (verified by grep/import list), so its runtime behavior is unexercised by the UI.
- Live path: `ConversionInputSchema.safeParse` in component, `calculateHormoneConversion`, adapter `buildToolOutput`; a stored snapshot is committed only when valid (`commitDashboardSnapshot` after output build).
- Engine's internal `parse` throw means a raw engine call with invalid input throws rather than returning a union; the component pre-parses so the throw is not normally reachable from the UI (static reasoning, not runtime proof).
- P-03: per-tool result guard present in the dormant pipeline; shared P-03 layer remains FAIL/NOT_IMPLEMENTED in B2b; runtime-negative cases uncommitted/NOT_RUN in true-clean. **NOT_RUN** here.

---

## F. AI and Intelligence Capabilities

| Capability | Status | Evidence / reason |
|---|---|---|
| AI brain / model / prompt / provider / RAG | **Unavailable** | No model/provider/prompt in engine, pipeline, adapter or components (E2) |
| Prediction / interpretation | **Not applicable** | Conversion only; adapter comment "no health interpretation"; no reference-range verdict engine |
| OCR (untracked `.ocr.tsx`) | **Implemented (static, untracked)** | `isOcrOpen` state in modified component; no real OCR runtime artifact; `NOT_AVAILABLE` as adopted capability |
| Synthetic demo (untracked visual/demo) | **Implemented (static, untracked)** | `isDemoActive` state; owner-adoption status unresolved; no fabricated values presented as measured in audit scope |
| PDF/print (untracked `.pdf.tsx`) | **Static delta** | Untracked component; not executed/adopted |
| Reference limits | **Implemented (static data)** | `TOOL_035_REFERENCE_LIMITS` for 4 unit variants; display context only, no diagnosis |
| Confidence / uncertainty | **Explicit non-claim** | `confidence: null`, `dataQuality: not_assessed`, source-unverified provenance line |
| Freshness / stale flagging | **Partial (static)** | `labFreshness` 90-day rule uses `Date.now()`; no browser evidence |

No AI capability is claimed; static OCR/demo/PDF code is reported as untracked delta, not adopted capability.

---

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented (E2) | Tested (E3) | Runtime-verified | Evidence / gap | Next action |
|---|---|---|---|---|---|---|---|
| Boxes 1–12 | yes | yes | yes (untracked file) | no | no | `data-r6-box={b.n}` / `data-r6-box-source`, 12 entries incl. box 11 `not_applicable` | DOM verification on preview |
| Box 9 sources | yes | yes | yes (2 refs rendered) | no | no | `TOOL_035_SOURCES`: Bhasin 2010 (level A), SI units IUPAC/IFCC (level B) — not owner-approved | Obtain approval or N/A decision |
| Box 11 history | yes | yes | yes (`NOT_APPLICABLE`) | no | no | "No persistent multi-session tracking in zero-persistence mode" text vs adapter persistence delta | Reconcile with W18 ruling |
| Box 10 export | yes | yes | yes | no | no | `handleCopyCsv` + `navigator.clipboard.writeText` (clipboard, not Blob download) | Browser capture |
| Box 8 cross-tool | yes | yes | yes | no | no | `TOOL_035_CROSS_LINKS` → tool-006/015/023 | DOM capture |
| CORE-5 compact | yes | yes | **divergent** | no | no | `visibleBoxes = compact ? boxes.filter(n ∈ [1,2,3,7,9,12]) : boxes` → **6 boxes**, button labelled "Show Core-5" | Reconcile 6-vs-5 mapping (tool-local, no shared edit) |
| State marker | yes | partial | partial | no | no | main `data-r6-state={lifecycleState}`; genius has **no** `data-r6-genius-state` | Add marker only if acceptance requires; verify |
| No duplicate shell | yes | open | unresolved | no | no | Non-exempt shared shell + tool-owned genius (untracked) | E4 DOM inspection |

---

## H. Dynamic Results and UI Maturity

| Aspect | Static inspection (E2) | Component test | Integration test | True-clean | Browser E4 |
|---|---|---|---|---|---|
| Five states | `lifecycleState` derived from parsed input/result; EMPTY/PARTIAL/INVALID/FULL/DEGRADED union in contract; no genius-state attribute | declared (untracked parity test) | not found | not run | NOT_RUN |
| Live recalculation / debounce | `AUTO_DRAFT_DEBOUNCE_MS` + `draftTimer` (120 ms) persists draft; **no calculation debounce signal gate observed** | not run | — | — | NOT_RUN |
| Compact/full | `compactGenius` toggles 6-of-12 boxes, `aria` button | not run | — | — | NOT_RUN |
| Save / snapshot | `saveDraft` (localStorage), `commitDashboardSnapshot` (HTTP POST), status flags `isSaving`/`saveStatus` | not run | — | — | NOT_RUN |
| OCR / demo / visual | `isOcrOpen`, `isDemoActive`, `Tool035Visual` imports; untracked artifacts | not run | — | — | NOT_RUN |
| Accessibility / responsive | `dir` from locale; Tailwind grid; structural only | not run | — | — | 390/1440 NOT_RUN |

**UI verdict:** the modified/untracked UI contains substantially more behavior (persistence, OCR, demo, visual) than the closure ledger describes; none of it is E3/E4 verified here. State marker divergence is a real static gap.

---

## I. Cross-Tool and Data Integration

- `TOOL_035_CROSS_LINKS`: `tool-006-estrogen-prolactin`, `tool-015-shbg-modulator`, `tool-023-trt-optimization` — display links only; no field mapping or transfer contract declared (unlike Tool 039's mapped fields/freshness/stale action).
- `TOOL_035_LAB_FRESHNESS_DAYS = 90` with `labFreshness(dateStr)`; uses `Date.now()`; no stale action contract beyond display.
- **W18 boundary requires explicit attention:** adapter `saveDraft` writes to browser `localStorage` (auto-draft, "never the DB" per comment), but `commitDashboardSnapshot` POSTs `submitted_snapshot` and `dashboard_projection` to `TOOL_LOG_ENDPOINT` via `fetch`. This is a server-side persistence path in the live component, not a purely local tool. Whether it is authorized under W18/D-08 is unresolved; the closure ledger records `W18-HISTORY NOT_AVAILABLE` and the genius says `NOT_APPLICABLE` for persistent multi-session tracking. No cloud sync/session handoff beyond the POST is claimed.
- No shared-component change proposed; W4b HIGH/CRITICAL blast radius avoided.

---

## J. Safety, Sources and Privacy

- Validation: Zod strict schema + analyte/unit refinement; empty value starts as `NaN` (not zero); invalid input cannot build output in component path (static).
- Sources: two literature refs present in untracked contract; no approved provenance pack recorded → C4 remains `NOT_AVAILABLE`, not `NOT_APPLICABLE`.
- Referral: no approved wording pack → C5 `NOT_AVAILABLE`; clinical sign-off open → `BLOCKED`.
- Domain safety: conversion-only; explicit "not a diagnosis / not a prescription" wording; reference limits are descriptive, not a clinical verdict.
- Privacy/data exposure: auto-draft stored in browser localStorage; snapshot POST sends tool inputs, output snapshot and provenance to an endpoint with optional bearer token. No logging/analytics observed in tool-owned files. Browser network/console verification is `NOT_RUN`; authorization for the POST path is an owner question, not something this audit can settle.

---

## K. Localization and Browser Maturity

- `i18n/tool-035-hormone-conversion.json` (observed SHA `D2114B778D…`) with EN/AR via `pickToolI18n`; `dir={isRtl ? 'rtl' : 'ltr'}` in main component; AR/EN source-badge labels in genius.
- **No `tool-035-i18n-check.mjs` and no `tests/unit/tool-035-i18n-evidence.test.ts` found** (glob verified for 034/037/038 scripts; 035 absent). I18N-PARITY remains `NOT_RUN`; no command can be given for a non-existent script without authorization to create one.
- E4 prerequisites absent: SSO-compliant session, preview pinned to `37f047a4`, recorded Deployment ID. EN/AR, 5 states, RTL 390px, console/hydration, DOM duplicate checks are **NOT_RUN** (E0). Historical deployment evidence is not transferable.

---

## L. Tests and Evidence

### L.1 Evidence register (no executions in this audit)

| ID | Requirement ID | Source file | Test command (exact, isolated) | Environment | Source SHA | Date | Actual result | Level | Reproducible | Validity | HEAD compatibility |
|---|---|---|---|---|---|---|---|---|---|---|---|
| EV-035-01 | ENG-PIPELINE | `lib/tools/r6/...pipeline.test.ts` (untracked) | `npx vitest run --config vitest.config.ts lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts` | CWD `E:\MrXSteroid-main`, deps present, no installs | n/a | 2026-11-19 | **NOT_RUN** | E2 | no (untracked) | static only | WT-only |
| EV-035-02 | TEST-FOCUSED | component + engine + batch tests | `npx vitest run --config vitest.config.ts components/tools/tool-035-hormone-conversion.test.tsx components/tools/tool-035-hormone-conversion.parity.test.tsx lib/tools/engines/tool-035-hormone-conversion.test.ts lib/tools/adapters/tool-031-035-batch.test.ts` (parity file untracked) | same | n/a | 2026-11-19 | **NOT_RUN** | E2 | partial | static only | mixed tracked/untracked |
| EV-035-03 | I18N-PARITY | script absent | **No authorized command exists** — `docs/.../tool-035-i18n-check.mjs` not found; create only under separate authorization, then run `node <path>` | same | n/a | 2026-11-19 | **NOT_RUN / NOT_AVAILABLE (artifact)** | E0 | n/a | none | target HEAD |
| EV-035-04 | BUILD-TSC | project | `npx tsc --noEmit`; `npx next build` | clean clone/worktree at `37f047a4`, deps installed, capture log + exit code | n/a | 2026-11-19 | **NOT_RUN** | E0 | yes | none | target HEAD |
| EV-035-05 | Browser rows | SSO preview | authorized SSO session + preview pinned to `37f047a4` + Deployment ID; EN/AR, 5-state, RTL 390px, console/hydration, DOM duplicate checks | unavailable | n/a | 2026-11-19 | **NOT_RUN / NOT_AVAILABLE** | E0 | no | none | not established |

### L.2 Completion calculation
`PASS(E3+) = 0`, applicable register rows `= 18` → **0%** (same as historical ledger-internal 0%, but independently evidence-bounded). No official denominator available.

### L.3 Hash discipline
Observed hashes are in C.1/header. B2b's embedded self-hash differs from observed bytes; observed wins. See end-of-document integrity note for the body-before-hash-line convention; whole-file SHA reported in delivery response.

---

## M. Defect and Gap Register

### M.1 Implementation gaps (E2)

| ID | Severity | Requirement ID | Exact file | Actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-035-01 | HIGH | ENG-PIPELINE / P03-PIPELINE | `components/tools/tool-035-hormone-conversion.tsx` | Imports `calculateHormoneConversion` + `buildConversionOutput`, not `runHormoneConversion`; R6 pipeline dormant | Fail-safe result-schema/envelope path bypassed in live UI | Unfinished R6 migration | Wire pipeline as required by acceptance, with signature gating; test both paths | MEDIUM (tool-local) |
| I-035-02 | MEDIUM | STATE-5 / UI-GENIUS12 | `components/tools/tool-035-hormone-conversion.genius.tsx` (untracked) | No `data-r6-genius-state`; compact shows 6 boxes under "Core-5" label | Acceptance markers/mapping differ from grid | Untracked parallel UI implementation | Add marker / fix 6-vs-5 mapping only after owner decision on intended mapping | LOW |
| I-035-03 | MEDIUM | C4-SOURCES / W18-HISTORY | `lib/tools/r6/tool-035-hormone-conversion-contract.ts`, `lib/tools/adapters/toolLogAdapter.ts`, modified component | 2 literature refs not approved; box 11 says `NOT_APPLICABLE` "zero-persistence" while adapter performs localStorage draft + HTTP snapshot POST | Contradictory storage posture; external approvals open | Post-baseline delta unaligned with ledger | Owner ruling on W18/D-08 and C4; align box 11 text to actual behavior | MEDIUM |
| I-035-04 | MEDIUM | I18N-PARITY | `docs/MRX Genius Cloud Unified R6.1/` (missing script) | No i18n-check script or evidence test for 035 unlike 034/037/038 | Parity row cannot be evidenced with existing tooling | Tool omitted from script batch | Authorized creation of script/test, then run | LOW |
| I-035-05 | MEDIUM | TEST-FOCUSED / BUILD | untracked parity/pipeline/visual/OCR/PDF files | Main artifacts untracked/modified; clean-clone evidence impossible | Historical claims not reproducible | Work not committed | Review + authorized check-in; no content change assumed | LOW |
| I-035-06 | LOW | contract wording | `lib/tools/r6/tool-035-hormone-conversion-contract.ts` line 4 vs line 74 | Header claims zero clock deps while `labFreshness` calls `Date.now()` | Misleading purity claim | Documentation drift | Correct header comment; no behavior change | LOW |

### M.2 Evidence gaps (no E3+/E4 in this scope)

| ID | Severity | Requirement ID | Exact target | Missing evidence | Impact | Recommended action |
|---|---|---|---|---|---|---|
| E-035-01 | HIGH | ENG-PIPELINE, TEST-FOCUSED | pipeline + component tests | No executed log, untracked tests | 0 E3+ | EV-035-01/02 |
| E-035-02 | HIGH | BUILD-TSC | project | No build/typecheck log at HEAD | PARTIAL row | EV-035-04 |
| E-035-03 | HIGH | 6 browser rows | SSO preview | No E4 artifact pinned to `37f047a4` | 6 NOT_RUN | EV-035-05 |
| E-035-04 | MEDIUM | I18N-PARITY | script/test absent | No parity artifact at all | NOT_RUN | EV-035-03 after authorization |

FAIL/BLOCKED/NOT_AVAILABLE rows are not hidden: P03-PIPELINE FAIL, CLINICAL-REVIEW BLOCKED, C4/C5/W18 NOT_AVAILABLE are carried from B2b.

---

## N. Development Maturity Matrix (S0–S11 per component)

Legend: S0 identity, S1 requirements, S2 architecture, S3 engine, S4 pipeline, S5 UI behavior, S6 AI/CORE-5/GENIUS-12, S7 cross-tool/safety, S8 testing, S9 true-clean reproduction, S10 browser E4, S11 external/owner approval. `✓` verified, `△` static/E2 only, `✗` not verified/missing. S10/S11 never inferred from plans.

| Component | S0 | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Identity/registry/route | ✓ | △ | ✓ | – | – | – | – | △ | ✗ | ✗ | ✗ | ✗ | S2 static | S8 route proof | SSO preview; route drift |
| Requirements register | ✓ | △ | – | – | – | – | – | – | ✗ | ✗ | – | ✗ | S1 partial | S1 full denominator | No original-ID source; no proposals |
| Engine (conversion) | – | – | ✓ | △ | – | – | – | – | ✗ | ✗ | – | – | S3 static | S8 unit test | Execution not authorized |
| Pipeline + schema (dormant) | – | – | ✓ | – | △ | – | – | △ | ✗ | ✗ | – | ✗ | S4 static | S8 + wiring decision | Component bypass; shared P-03 approval |
| UI / state / persistence | – | – | ✓ | – | – | △ | – | △ | ✗ | ✗ | ✗ | ✗ | S5 static | S8 component test | Untracked/modified files; W18 ruling |
| AI / CORE-5 / GENIUS-12 | – | – | ✓ | – | – | – | △ | – | ✗ | ✗ | ✗ | – | S6 static | S8 DOM/marker test | 6-vs-5 mapping; missing genius-state |
| Cross-tool / safety / storage | – | – | ✓ | – | – | – | – | △ | ✗ | ✗ | ✗ | ✗ | S7 static | S11 owner ruling | W18 POST path; C4/C5/CLIN |
| Localization | – | – | ✓ | – | – | △ | – | – | ✗ | ✗ | ✗ | – | S5 static | S8 parity | No script/test exists |
| True-clean / build | – | – | – | – | – | – | – | – | △ | ✗ | – | – | S8 historical | S9 clean-clone rerun | Untracked artifacts; no build log |

Engine S3 static + browser S0 is a valid independent combination; no cross-component stage inflation.

---

## O. Comparison with Tool 039 (applicable engineering criteria only)

Tool 039 is reference-only, never in Tool 035's denominator. No similarity score.

| Dimension | Status | Engineering reason (reason code) | Action |
|---|---|---|---|
| Architecture | PARTIALLY_APPLICABLE | 039 wires debounce → pipeline → engine → envelope; 035 has equivalent modules but live UI bypasses the fail-safe pipeline | Fix wiring before using as benchmark |
| Engine | APPLICABLE | Pure deterministic conversion with Zod bounds and convert-once factors — same purity criterion | Preserve |
| Validation | PARTIALLY_APPLICABLE | 039 has input + result + envelope guards on the live path; 035's result guard is in a dormant pipeline | Fix live-path validation |
| AI | NOT_APPLICABLE | Neither tool has a model; 035's OCR/demo deltas are static and unadopted, not AI | Preserve non-AI benchmark |
| Dynamic results | PARTIALLY_APPLICABLE | Five states exist but genius-state marker missing; draft debounce is persistence, not calculation gating | Extend after E4 |
| CORE-5 compact | NOT_APPLICABLE (as-is benchmark) | 035 shows 6 boxes under a "Core-5" label — cannot be copied as a CORE-5 pattern until mapping decided | Fix mapping first |
| GENIUS-12 | PARTIALLY_APPLICABLE | 12 boxes present but untracked and without `data-r6-genius-state`; 039 has tracked, marked boxes | Extend/verify |
| Cross-tool | PARTIALLY_APPLICABLE | 035 lists three link targets with no mapped fields/freshness/stale action contract vs 039's explicit contract | Extend contract |
| Safety/sources | PARTIALLY_APPLICABLE | 035 has 2 unapproved refs and unresolved W18 POST path vs 039's approved four-source pack and bounded local history | Fix via owner decisions |
| Testing | PARTIALLY_APPLICABLE | Declared tests partly untracked; none executed at this HEAD | Extend with isolated re-runs |
| Browser — current HEAD | NOT_AVAILABLE | No SSO preview pinned to `37f047a4` | Extend after gate |
| Browser — historic artifacts | NOT_VERIFIED | Historic SSO deployment evidence not transferable | Preserve as history only |

---

## P. Next Development Tasks (genuine gaps only; tool-local, no shared edit)

| ID | Exact file | Proposed change | Required tests | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| T-035-01 | `components/tools/tool-035-hormone-conversion.tsx` | Wire `runHormoneConversion` into live path with signature gating (tool-local) | EV-035-01/02 + new wiring test | Owner confirmation that ENG-PIPELINE requires live pipeline use | MEDIUM | Result-schema + envelope enforced at runtime | Archived E3 log showing live path uses guarded pipeline |
| T-035-02 | `components/tools/tool-035-hormone-conversion.genius.tsx` (untracked) | Decide CORE-5 vs 6-box mapping; add `data-r6-genius-state` if required | DOM test + E4 | Acceptance ruling on compact mapping | LOW | Marker/mapping consistent | DOM shows intended boxes and state attribute |
| T-035-03 | `docs/MRX Genius Cloud Unified R6.1/tool-035-i18n-check.mjs` (new) + evidence test | Authorized creation only; then run parity check | EV-035-03 | Separate authorization | LOW | Parity evidence exists | PASS log with key counts |
| T-035-04 | `lib/tools/r6/tool-035-hormone-conversion-contract.ts` | Correct clock-dependency header; align box 11/storage text after W18 ruling | contract test | Owner W18/D-08 decision | MEDIUM | No contradictory documentation | Review + test PASS |
| T-035-05 | untracked parity/pipeline/visual/OCR/PDF files | Review and authorized check-in; no content change assumed | EV-035-01/02 | Git authorization | LOW | Clean-clone reproducibility | Files tracked at HEAD with PASS logs |
| T-035-06 | evidence archive | Run EV-035-04/05 and archive | tsc/build + browser | Isolated env; preview gate | LOW | E3/E4 rows resolvable | Logs + Deployment ID recorded |

No task edits `R6ToolShell.tsx`, `boxes.ts`, `manifest.ts`, `registry.ts`, or the route page; any such shared change needs a Change Impact Matrix across 19 tools (W4b).

---

## Q. Current Tool Decision

**Decision: NOT_VERIFIED.** Completion **0%** (`0 PASS(E3+) / 18 applicable register rows`); historical ledger-internal `0/18 = 0%` is preserved history. The canonical denominator beyond the 18-row register is unrecoverable, so no official-denominator percentage is asserted. Main implementation gaps: live UI bypasses the guarded R6 pipeline; untracked/modified UI and contract artifacts; missing i18n script; no genius-state marker; 6-vs-5 compact divergence; unresolved W18 persistence POST. Main evidence gaps: no E3 execution, no build log, no E4 browser artifacts. This decision implies **no** owner acceptance, closure, or development completion.

### Integrity note
The embedded hash below was computed over this document's body immediately before the hash line was appended; adding the line changes whole-file bytes. The authoritative **whole-file SHA-256** is reported in the delivery response.

Observed on-disk SHA-256 (body before hash line): `68110AC2980FD35E2EC422BB595A5591EAE89D5B8FA5CBC2B171ED3B3D9EF7B7`
