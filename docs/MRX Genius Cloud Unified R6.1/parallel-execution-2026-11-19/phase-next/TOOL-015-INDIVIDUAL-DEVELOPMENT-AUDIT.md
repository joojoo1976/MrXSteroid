# TOOL 015 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `015` · `mrx.tool.015-shbg-modulator` |
| Canonical name / slug | `SHBG Modulator` / `tool-015-shbg-modulator` |
| Category | hormonal-health |
| Canonical route | `/smarttools/hormonal-health/tool-015-shbg-modulator` |
| Batch | Batch 1 |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`, dirty worktree) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation. No code/contract/schema/ledger/git/build/test/server/browser writes or executions. |
| Primary source ledger | `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/retry-01/B1a-LEDGER-006-015.md` — observed SHA-256 `3B6E02BF0DC78DF9A638191C7B3D4A094868D4985A59079EF91A9757985DF79C` |
| Secondary ledgers | closure ledger MD `40BDC4ACF3A58D8379BE168DC07FA28B542AC56C8BEE8922DE90AF4396F8EB42`; CSV `5509C1CD7C204AC5F0AC687C0A35B3C1D37A07BDE60CDB0627133EC2436E848F`; sources `403D6DC8FE22903B2793EF50143438B382C9C44F5CA04A38D984E039544AD72A` |
| Standard | `phase-next/00-PLAN-AND-AUDIT-STANDARD.md` — observed SHA-256 `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9` |
| Tool decision | **REPAIR** — 0.00% verified (0/18); no owner acceptance implied |

## A. Tool Identity and Historical Lineage

- **Identity (registry, observed):** `lib/tools/registry.ts:56` — `mrx.tool.015-shbg-modulator`, slug `tool-015-shbg-modulator`, version `1.0.0`, `href /smarttools/hormonal-health/tool-015-shbg-modulator`, `titleEn "SHBG Modulator"`, `titleAr "منظم SHBG"`, `accessTier free`, `order 290`, `stackStatus layered`. Route file `app/smarttools/tool-015-shbg-modulator/page.tsx` tracked and clean.
- **Implementation paths (observed):** engine `lib/tools/engines/tool-015-shbg-modulator.ts` (tracked, last commit `108d3063bdcb`); engine test `...test.ts` (tracked); schema `lib/tools/schemas/tool-015-shbg-modulator.ts` (tracked); adapter `lib/tools/adapters/tool-015-shbg-modulator.ts` + test (tracked); pipeline `lib/tools/r6/tool-015-shbg-modulator-pipeline.ts` (tracked, `37f047a4105d`); pipeline test `...pipeline.test.ts` (**untracked**); contract `...-contract.ts` (**untracked**); component `components/tools/tool-015-shbg-modulator.tsx` (**tracked, modified**, `108d3063bdcb`); genius / visual / ocr / pdf / parity test (**untracked**); `...dom.test.tsx` (tracked); i18n `i18n/tool-015-shbg-modulator.json` (**tracked, modified**).
- **Historical start:** a free/bioavailable testosterone calculator using the Vermeulen mass-action quadratic. Sources documentation records formula basis and interpretation limits but explicitly is **not** specialist approval. No per-tool development-proposals file for 015 was found in the consulted sources (contrast 008/014) — recorded as a denominator gap in B.
- **Owner decisions:** D-C4, D-C5, D-CLIN, D-W18 open; P-03 valid-branch and runtime-negative committed proof absent. No owner acceptance of Tool 015 is recorded.
- **Historical acceptance:** recorded combined Batch 1 claim (006/015/023/035, 15 files / 84 tests) and PREVIEW-INDEX `5 PASS` for the 015 pipeline — historical claims, not re-executed; key 015 R6 tests are untracked.
- **Relevant SHAs:** baseline `37f047a4`; stale closure snapshot `8d7e406c`; Tool 039 reference `5a87f3e5` (reference only); true-clean context `E:\p03-true-clean-20261118@37f047a4`; excluded `2a647fda`.
- **Current owner:** R6.1 programme owner for gates/decisions; tool implementation owner for later authorized repair. The calculation is intentionally interpretation-free — preserve.

## B. Original and R6.1 Requirements

**Canonical denominator finding (explicit):** the official per-tool atomic requirement denominator for Tool 015 **cannot be fully recovered**. Available: generic 18-row closure register (closure ledger MD/CSV + B1a ledger) as **operational audit matrix only**; system-wide canonical IDs (`REQUIREMENT-TRACEABILITY-MATRIX.md` A-1…G-7; `tool-039-requirements.csv` SPEC/ACC/LAYER/ACC-5.5 — engineering reference only); `R6.1-SYSTEM-REQUIREMENT-REGISTER.md`; `SMARTTOOLS_TOOL_015_SHBG_SOURCES.md` (informative, not approved). **Missing:** per-tool owner-approved atomic requirements CSV/acceptance file and a tool-specific proposals file for 015. No denominator invented.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| SPEC-R6.1-1.a/1.b/1.c, SPEC-R6.1-2.c, C-2, C-8 | `ENG-PIPELINE` | Pipeline-only computation; engine authoritative | APPLICABLE | tracked pipeline `runSHBGModulator`, `SHBGResultSchema.safeParse` gate; component integrates pipeline (static) | pipeline test untracked; no tracked E3 |
| SPEC-R6.1-1.e, SPEC-R6.1-2.b, ACC-R6.1-3.c, ACC-5.5.10 | `STATE-5` | Honest EMPTY/PARTIAL/FULL/INVALID/DEGRADED | APPLICABLE | component maps `PARTIAL/INVALID/CALCULATED/FULL` via `data-r6-state`; no explicit EMPTY/DEGRADED in same mapping (static) | mapping differs from canonical enumeration — needs confirmation |
| SPEC-R6.1-3.a/3.b, LAYER-GENIUS12-01…12, LAYER-5IN12-* | `UI-GENIUS12` | CORE-5 + 12 boxes fixed order | APPLICABLE | untracked genius: 12 boxes, compact filter `[1,2,3,7,9,12]`, box 11 `not_applicable` | untracked; no DOM proof |
| SPEC-R6.1-3.d, SPEC-R6.1-6.b/6.c, ACC-5.5.6 | `I18N-PARITY` | AR/EN parity | APPLICABLE | i18n JSON tracked/modified; **no** `tool-015-i18n-check.mjs` | script missing — blocks 100% |
| LAYER-GENIUS12-10, LAYER-20MAP-07 | `EXPORT-CSV` | Browser-only CSV export | APPLICABLE | `buildShbgCsv` in untracked contract; PDF/print helper untracked | no browser proof |
| ACC-R6.1-3.a/b/c, G-1/G-2/G-3 | `TEST-FOCUSED` | Focused reproducible tests pass | APPLICABLE | engine test + adapter test + dom test tracked; pipeline/parity tests untracked | no current-HEAD isolated run |
| ACC-R6.1-3.a | `BUILD-TSC` | Clean tsc/build at HEAD | APPLICABLE | historical claims only | no HEAD archive |
| LAYER-20MAP-07, SPEC-R6.1-3.g | `PREVIEW-ROUTE` | Route loads on Preview | APPLICABLE | tracked route; SSO | NOT_RUN |
| SPEC-R6.1-3.d, ACC-5.5.6 | `BROWSER-EN-AR` | EN/AR functional pass | APPLICABLE | i18n resource tracked/modified | NOT_RUN |
| SPEC-R6.1-1.e, ACC-R6.1-3.c, ACC-5.5.10 | `BROWSER-5-STATES` | Five states on Preview | APPLICABLE | state mapping partial static | NOT_RUN |
| ACC-5.5.6/7/7-LEGIBILITY | `RTL-390` | Real RTL at 390 px | APPLICABLE | `dir` binding static | NOT_RUN |
| ACC-R6.1-3.a, SPEC-R6.1-5.d | `CONSOLE-HYDRATION` | No console/hydration issues | APPLICABLE | — | NOT_RUN |
| SPEC-R6.1-3.a, LAYER-DOMAIN-RULE | `NO-DUP-GENIUS` | No duplicate GENIUS-12 | APPLICABLE | untracked genius + untracked parity test | DOM proof NOT_RUN |
| LAYER-CORE5-C4, LAYER-GENIUS12-09, SPEC-R6.1-2.f | `C4-SOURCES` | Approved sources/provenance or approved N-A | APPLICABLE | SMARTTOOLS doc (informative); untracked `TOOL_015_SOURCES` structures | NOT_AVAILABLE; D-C4 open |
| LAYER-CORE5-C5, LAYER-GENIUS12-12, SPEC-R6.1-5.g, ACC-R6.1-3.i | `C5-REFERRAL` | Approved referral wording AR/EN | APPLICABLE | inline guidance static | NOT_AVAILABLE; D-C5 open |
| D-CLIN (no canonical atomic ID recovered) | `CLINICAL-REVIEW` | Clinical/model review sign-off | APPLICABLE | none found | **original ID not recoverable — explicit missing mapping** |
| SPEC-R6.1-4.f, SPEC-R6.1-6.d, LAYER-GENIUS12-11/12-RATING | `W18-HISTORY` | History/storage per W18 | APPLICABLE | untracked genius session-only/history-not-saved posture | D-W18 open; D-08 Tool-039-only not transferred |
| SPEC-R6.1-1.b/1.c, C-4/C-6/C-8, P-03 | `P03-PIPELINE` | P-03 enforcement closure | APPLICABLE | committed structural gate; valid-branch pipeline test untracked; negative proof uncommitted | NOT_IMPLEMENTED as acceptance item |

**Counts:** applicable (operational) 18; justified N/A 0; unmapped 1 (`CLINICAL-REVIEW`); PASS(E3+)=0; PASS(<E3)=0; PARTIAL=6; NOT_RUN=7; BLOCKED=1; NOT_AVAILABLE=3; NOT_IMPLEMENTED=1.

**Source authority conflict log:**
| Source | Location | Impact | Resolution |
|---|---|---|---|
| Closure ledger | `8d7e406c` snapshot | stale claims | historical; no transfer |
| Tool 039 CSV | `OWNER_ACCEPTED`, D-08 | could imply 015 acceptance/history | reference only; not transferred |
| B1a self-hash | `9BD82DDFFA…` vs observed `3B6E02BF…` | hash mismatch | observed on-disk authoritative; no edit |
| Generic 18-row register | closure ledgers | could be mistaken for official denominator | operational only |
| SMARTTOOLS sources doc | formula/limits | could be mistaken for C4 sign-off | informative only; D-C4 open |
| State enumeration | component mapping `CALCULATED` vs canonical `FULL` | could be mistaken for full 5-state | preserve as gap; verify |

## C. Existing Architecture and Implementation

| Exact path | Git status | Last commit | Role | Test file | Actual status |
|---|---|---|---|---|---|
| `app/smarttools/tool-015-shbg-modulator/page.tsx` | tracked, clean | — | route | — | present |
| `lib/tools/engines/tool-015-shbg-modulator.ts` | tracked, clean | `108d3063bdcb` | Vermeulen calculation, no interpretation | `...test.ts` (tracked) | static + recorded |
| `lib/tools/schemas/tool-015-shbg-modulator.ts` | tracked, clean | — | Zod input/output | — | tracked |
| `lib/tools/adapters/tool-015-shbg-modulator.ts` + test | tracked, clean | — | V4 adapter | test tracked | static |
| `lib/tools/r6/tool-015-shbg-modulator-pipeline.ts` | tracked, clean | `37f047a4105d` | R6 pipeline + result gate | `...pipeline.test.ts` **untracked** | structural static |
| `lib/tools/r6/tool-015-shbg-modulator-contract.ts` | **untracked** | — | limits/sources/CSV | — | static only |
| `components/tools/tool-015-shbg-modulator.tsx` | **tracked, modified** | `108d3063bdcb` | UI, state mapping, PDF button | `...dom.test.tsx` (tracked) | static |
| `...genius.tsx`, `.visual.tsx`, `.ocr.tsx`, `.pdf.tsx`, `.parity.test.tsx` | **untracked** | — | GENIUS-12 / visual / OCR / PDF / parity test | parity test untracked | static only |
| `i18n/tool-015-shbg-modulator.json` | **tracked, modified** | — | AR/EN copy | no check script | unverified parity |

**Dependencies:** React client component, canonical contracts, Zod, registry, shared R6 shell, `useToolDisplayPreferences`. No Supabase/network import observed. Key R6 contract, genius and test artifacts are untracked — the principal durability gap for this tool.

## D. Math Engine and Equation Audit

- **Equation (observed, lines 1-55):** Vermeulen mass-action quadratic for free and bioavailable testosterone. Constants: `NG_DL_TO_NMOL_L = 0.0347`; albumin MW `66_500 g/mol`; albumin association `36_000 L/mol`; SHBG association `1_000_000_000 L/mol`. Conversion: total testosterone `ng/dL × 0.0347 × 1e-9 → mol/L`; SHBG `nmol/L × 1e-9 → mol/L`; albumin `g/dL × 10 → g/L → mol/L`. `a = K_shbg × (1 + K_alb × albumin)`, `b = albuminBindingFactor` (plus free-binding terms), quadratic solved for free fraction. **Convert-once** discipline appears correct at input; no double conversion observed.
- Variables/units: total testosterone (ng/dL), SHBG (nmol/L), albumin (g/dL); outputs free/bioavailable testosterone (ng/dL and percentage). Units carried explicitly; no silent measurement-system assumption observed.
- Validation: `SHBGInputSchema.parse(rawInput)` at engine entry (static). Zero/negative/NaN/Infinity: schema rejects non-finite/out-of-range inputs (static inspection); degenerate-denominator behavior not independently exercised (no test run).
- Precision/determinism: fixed constants and pure arithmetic; no Date/I/O in engine. Result schema `SHBGResultSchema` validates `status CALCULATED`, formula string and numeric outputs in the pipeline gate (static).
- **Explicit limit:** the engine computes a value only; it does **not** classify results or provide clinical interpretation or treatment advice. Preserve this.
- **Tests run vs NOT_RUN:** `npx vitest run lib/tools/engines/tool-015-shbg-modulator.test.ts` — **NOT_RUN** (tracked test present, static E2 only).

## E. Pipeline and Schema Audit

Chain (static): input `SHBGInputSchema` → `createToolSchema` runtime parse → `calculateSHBG` → `SHBGResultSchema.safeParse(engineResult)` fail-closed gate → `createToolOutput` envelope → `isToolOutput` guard. KeyFindings expose `status` and `formula`. No DB/I/O; timestamps injected by caller. **P-03 status:** structural gate committed; valid-branch pipeline test untracked and runtime-negative proof uncommitted → `NOT_IMPLEMENTED` as acceptance item. No test executed.

## F. AI and Intelligence Capabilities

- AI model/provider/prompt: **NotApplicable** (no model; no network observed statically).
- What-if / sensitivity: untracked contract/visual materials contain band/sensitivity structures, but no deterministic scenario re-run through the pipeline was verified in this audit — **Unavailable** as claimed runtime feature.
- Explanation/uncertainty: static formula disclosure; no calibrated confidence (Tool 039 SPEC-R6.1-4.i is reference only). **RuntimeVerified: No**.
- No AI runtime claim; platform AI is G-R6.1-3.

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next action |
|---|---|---|---|---|---|---|---|---|
| C1 primary result + unit | YES | YES | static (untracked genius) | untracked parity test | NO | `.genius.tsx`; component results box | no E3 tracked | track + run parity test |
| C2 how/assumptions/inputs | YES | YES | static | untracked | NO | untracked contract/genius | no E3 | track |
| C3 safety/referral | YES | partial static | static | NO | NO | inline guidance | D-C5 open | approved wording |
| C4 sources | YES | YES | untracked structures | NO | NO | `SMARTTOOLS_TOOL_015_SHBG_SOURCES.md` | D-C4 open | approved pack |
| C5 next actions | YES | partial static | static | NO | NO | inline guidance | D-C5 open | approved pack |
| Boxes 1–12 fixed order | YES | YES | static (untracked) | untracked parity test asserts 12 order | NO | parity test file observed | not tracked/at-HEAD | track + run |
| Compact CORE-5 parity | YES | YES | static filter `[1,2,3,7,9,12]` | untracked | NO | untracked genius | no E3 | track + parity test |
| Box 11 history reason | YES | YES | static `not_applicable` | untracked | NO | untracked genius | D-W18 open | owner decision |

## H. Dynamic Results and UI Maturity

- **Static inspection:** component `dir` binding, `aria-label`, `aria-live`, `data-r6-state={status === 'CALCULATED' ? 'FULL' : status}`, results summary box, PDF export button, OCR/PDF/visual untracked helpers. The `PARTIAL/INVALID/CALCULATED/FULL` mapping does not present a canonical five-label union including EMPTY and DEGRADED — this is a genuine `STATE-5` gap (recorded as PARTIAL), not proof of missing behavior.
- **Component test / integration test:** tracked `...dom.test.tsx`; untracked `...parity.test.tsx` and untracked pipeline test. **True-clean:** no current-HEAD focused per-tool log. **Browser E4:** NOT_RUN (SSO/unavailable).
- Debounce constant `TOOL_015_DEBOUNCE_MS = 120` lives in the untracked contract; debounce behavior is static-only. Responsive 390 px / 1440 px and keyboard behavior are static claims, not E4.

## I. Cross-Tool and Data Integration

- Cross-tool links are defined in the untracked contract; no payload transfer observed (session-only/no-storage posture indicated statically in the untracked genius). W18 boundary: no session/cloud sync authorized.
- Producer/consumer: engine → pipeline → component; adapter `tool-015-shbg-modulator.ts` (tracked) is a V4-style wrapper, no replacement of the V6 engine observed. Error propagation fail-closed statically. No automatic transfer claim.

## J. Safety, Sources and Privacy

- The engine deliberately computes without classification or treatment advice — preserve. No diagnosis claim.
- SMARTTOOLS source documentation records the Vermeulen basis and interpretation limits but is **informative only**, not a specialist-approved C4 pack or clinical sign-off.
- Validation: Zod at engine and pipeline boundaries (static). No API/Supabase/auth path observed. No browser console proof (NOT_RUN). No persisted history/rating observed (session-only posture in untracked artifacts); W18 open.
- D-C4 / D-C5 / D-CLIN unresolved; no specialist sign-off claimed.

## K. Localization and Browser Maturity

- `i18n/tool-015-shbg-modulator.json` tracked and modified; `docs/MRX Genius Cloud Unified R6.1/tool-015-i18n-check.mjs` is **MISSING** (verified). Planned command `node "docs/MRX Genius Cloud Unified R6.1/tool-015-i18n-check.mjs"` — **NOT_RUN** (script absent).
- Browser rows — **NOT_RUN** (E0). E4 prerequisites: SSO-protected preview, preview pinned to `37f047a4`, Deployment ID not supplied. No browser claim.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command | Environment | Source SHA (first 16) | Date | Actual result | Level | Reproducibility / validity | HEAD compatibility |
|---|---|---|---|---|---|---|---|---|---|---|
| E-015-01 | ENG-PIPELINE | `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` | `npx vitest run lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` | isolated clean env | `FD5371C675CF2439` | 2026-11-19 | **NOT_RUN** (test untracked) | E1/E2 | not reproducible | untracked |
| E-015-02 | TEST-FOCUSED | `lib/tools/engines/tool-015-shbg-modulator.test.ts` | `npx vitest run lib/tools/engines/tool-015-shbg-modulator.test.ts` | isolated clean env | `9BEF3605321C8CAA` | 2026-11-19 | **NOT_RUN** | E2 (test present) | not reproducible | tracked at HEAD |
| E-015-03 | UI-GENIUS12 | `components/tools/tool-015-shbg-modulator.parity.test.tsx` | `npx vitest run components/tools/tool-015-shbg-modulator.parity.test.tsx` | isolated clean env | `2F06E05DD46B595B` | 2026-11-19 | **NOT_RUN** (untracked) | E1/E2 | not reproducible | untracked |
| E-015-04 | STATE-5 / UI | `components/tools/tool-015-shbg-modulator.dom.test.tsx` | `npx vitest run components/tools/tool-015-shbg-modulator.dom.test.tsx` | isolated clean env | `2F017B5EC8CB1E41` | 2026-11-19 | **NOT_RUN** | E2 (test present) | not reproducible | tracked |
| E-015-05 | I18N-PARITY | `i18n/tool-015-shbg-modulator.json` | `node "docs/.../tool-015-i18n-check.mjs"` | local | `8FCB7038D367792D` | 2026-11-19 | **NOT_RUN** (script missing) | E0 | n/a | modified WT |
| E-015-06 | BUILD-TSC | build config | `npx tsc --noEmit` + project build | clean env | — | 2026-11-19 | **NOT_RUN** | E2 historical | no HEAD artifact | no archive |
| E-015-07 | browser rows | preview URL | `curl -sS -o NUL -w "%{http_code}" <preview-url>` | accessible preview | — | 2026-11-19 | **NOT_RUN** | E0 | n/a | SSO blocked |
| E-015-08 | B1a evidence reuse | `retry-01/B1a-LEDGER-006-015.md` | read-only hash + row review | this audit | `3B6E02BF0DC78DF9A` | 2026-11-19 | reviewed, 18 rows | E5 (audit of evidence) | reproducible hash | observed on-disk |

No execution was performed. Recorded combined Batch 1 pass claims are historical, not re-run evidence.

## M. Defect and Gap Register

**Implementation gaps**
| ID | Severity | Requirement | Exact file | Actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-015-1 | HIGH | `I18N-PARITY` | `docs/.../tool-015-i18n-check.mjs` (missing) | no parity script vs required check | blocks 100% | script never created | add script + archive (authorized phase) | low |
| I-015-2 | HIGH | `ENG-PIPELINE`, `TEST-FOCUSED` | `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` | test exists but untracked | no clean-clone E3 | artifact not committed | review/track per approval | low |
| I-015-3 | HIGH | `UI-GENIUS12`, `EXPORT-CSV` | `...genius.tsx`, `.visual/.ocr/.pdf.tsx`, `.parity.test.tsx` | implemented but untracked | no durable proof | artifacts not committed | track as authorized | low |
| I-015-4 | MEDIUM | `STATE-5` | `components/tools/tool-015-shbg-modulator.tsx` | `CALCULATED`/`FULL` mapping vs canonical 5-state union | state honesty unverified | mapping differs | confirm EMPTY/DEGRADED in same union + test | low |

**Evidence gaps**
| ID | Severity | Requirement | Exact file | Gap | Impact | Next action |
|---|---|---|---|---|---|---|
| V-015-1 | CRITICAL | `C4-SOURCES`, `C5-REFERRAL`, `CLINICAL-REVIEW`, `W18-HISTORY` | SMARTTOOLS sources doc, untracked genius | D-C4/C5/CLIN/W18 open | 4 rows unresolved | owner decisions + evidence |
| V-015-2 | HIGH | browser rows (7) | preview URL | E4 NOT_RUN | 7 rows unresolved | accessible preview + capture |
| V-015-3 | HIGH | `BUILD-TSC` | build config | no HEAD archive | row PARTIAL | archive clean tsc/build |
| V-015-4 | MEDIUM | `P03-PIPELINE` | tracked pipeline | untracked valid-branch test + uncommitted negative proof | not closed | approval-gated P-03 evidence |

## N. Development Maturity Matrix (S0–S11 per component)

| Stage | Component | Highest verified stage | Next missing stage | Bottleneck |
|---|---|---|---|---|
| S0 | Identity / registry | S0 verified | S1 | none |
| S1 | Requirements | S1 partial (operational matrix; no tool proposals) | S2 official denominator | no per-tool requirements CSV |
| S2 | Architecture | S2 verified; inventory + git status observed | S3 | untracked key artifacts |
| S3 | Engine | S3 static (Vermeulen, pure, interpretation-free) | S4 (E3 engine test run) | NOT_RUN |
| S4 | Pipeline | S4 static structural gate | S5 | pipeline test untracked |
| S5 | UI | S5 static; state mapping partially divergent | S6 | STATE-5 confirmation + test |
| S6 | AI / CORE-5 / GENIUS-12 | S6 static only (untracked) | S7 | no tracked DOM proof |
| S7 | Cross-tool / safety | S7 static; no transfer; source doc informative | S8 | D-C4/C5/CLIN/W18 |
| S8 | Testing | S8 partial (tracked engine/dom/adapter tests, not run) | S9 | no current-HEAD run |
| S9 | True-clean | S9 not verified for this tool at HEAD | S10 | no isolated per-tool log |
| S10 | Browser | S0 only (no E4) | S1 browser | SSO / unavailable |
| S11 | External / owner | S0 only — no owner acceptance | S1 | owner step; never from a plan |

## O. Comparison with Tool 039 (applicable engineering criteria only)

Reference only; no similarity score; Tool 039 `OWNER_ACCEPTED` and D-08 not transferred.

| Dimension | Status | Engineering reason | Action |
|---|---|---|---|
| Architecture | PARTIALLY_APPLICABLE | same registry/contract/pipeline pattern; key contract/genius untracked | Preserve core; Extend tracking |
| Engine | APPLICABLE | 015 has pure deterministic Vermeulen calculation, interpretation-free | Preserve |
| Validation | PARTIALLY_APPLICABLE | structural gate present; valid/negative tests untracked/uncommitted | Fix |
| AI | NOT_APPLICABLE | no model in either tool slice | Preserve |
| Dynamic Results | PARTIALLY_APPLICABLE | state mapping diverges from canonical 5-state | Fix (confirm labels) |
| CORE-5 | PARTIALLY_APPLICABLE | static untracked boxes | Extend |
| GENIUS-12 | PARTIALLY_APPLICABLE | 12 boxes static; untracked parity test | Extend |
| Cross-Tool | PARTIALLY_APPLICABLE | static links, no transfer | Preserve |
| Safety | APPLICABLE | calculation only, no diagnosis; C4/C5 open | Preserve; Extend |
| Testing | NOT_VERIFIED | no tracked current-HEAD run for 015 R6 artifacts | Fix |
| Browser | NOT_AVAILABLE | SSO preview; no E4 for 015 | Fix when accessible |

## P. Next Development Tasks (proposals only — no implementation in this audit)

| # | Exact file | Proposed change | Required tests | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| 1 | `docs/.../tool-015-i18n-check.mjs` | create AR/EN parity check | run + archive | I18N lead | low | parity evidence | 0 missing/empty/contaminated |
| 2 | `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts`, `...-contract.ts` | review/track clean-clone tests and contract | isolated `npx vitest run` | scoped git approval | low | clean-clone E3 | PASS log at `37f047a4` |
| 3 | `components/tools/tool-015-shbg-modulator.{genius,visual,ocr,pdf}.tsx`, `.parity.test.tsx` | review/track artifacts; verify 12 ordered boxes + compact parity | parity/DOM test | scoped git approval | low | durable UI proof | 12 boxes, C1 parity |
| 4 | `components/tools/tool-015-shbg-modulator.tsx` | confirm EMPTY/DEGRADED within same state union; keep interpretation-free | component test | task 2 | low | honest 5 states | E3 state assertions |
| 5 | D-C4/C5/CLIN/W18 + P-03 owners | supply approvals and committed P-03 evidence | n/a | owner decisions | medium | unresolved rows closed | recorded approvals |

Shared-component changes require a separate Change Impact Matrix before implementation.

## Q. Current Tool Decision

**Decision: REPAIR.** Completion = `100 × 0 / 18 = 0.00%` (PASS(E3+) 0 of 18 applicable operational rows; PARTIAL rows do not count; `NOT_AVAILABLE ≠ NOT_APPLICABLE`; unresolved rows block 100%). Preserve the pure, interpretation-free Vermeulen engine and the tracked structural pipeline. Blocking gaps: missing i18n check, untracked pipeline/contract/genius/parity artifacts, state-mapping divergence, absent current-HEAD focused evidence, absent E4, and open D-C4/D-C5/D-CLIN/D-W18/P-03 decisions. **No owner acceptance is implied, claimed or transferred** (Tool 039's `OWNER_ACCEPTED` belongs to Tool 039 only).

## Integrity note
The SHA-256 below is computed over all bytes of this file preceding the final hash line. Because that line is added after hashing, the whole-file hash differs by construction; the recorded body hash is the reproducible content fingerprint and is authoritative for this audit.

Observed on-disk SHA-256 (body before this line): `B635E935FA63F9419065CE18D578946A2A3E4BBCE83C58D3D96DAF43156CF800`
