# TOOL 027 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `027` · `mrx.tool.027-ester-conversion` |
| Canonical name / slug | `Ester Conversion Calculator` / `tool-027-ester-conversion` |
| Category | cycle-management |
| Canonical route | `/smarttools/cycle-management/tool-027-ester-conversion` |
| Batch | Batch 3 |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`, 384 dirty worktree entries observed and preserved) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation. No code, contract, schema, ledger, git, build, test, server or browser write/execution. |
| Primary source ledger | `retry-01/B2a-LEDGER-025-031.md` — observed SHA-256 `7682D2E184611947F487D952E11443D699F3D305D34AAA637616E07A6B279E1D` |
| Row-level sources | closure ledger MD `DA9AE5FD4271500DA90DDC8771FCF025BA4704E41AB965C0396B9689F7193EBB`; CSV `0BE692ADBD6D940DAC4ED485FE73C23894330D7BA73D773AD1ADC8EB15404669`; proposals `8E980F92F13E02F36A13553BDE181A3057E6D1621B27A102488992952492A202`; i18n check `FD4D7740659CF48E76DD539C859AE55952D9A6DDA5BE13236F1612FBEA3CFCAE` |
| Reference sources | standard `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9`; Tool 039 profile `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA`; W4b impact map `157FB3DD879BAE4AF66E4B3AA1404788A3AC469FF8AF1B7ED60C6E3D1282C263`; `tool-039-requirements.csv` `CB47C6A2B91E6F4BB3C2DD514B69F95D3BD469A1842F3C125891B1281C6F98B6` |
| Tool decision | **REPAIR** — 0.00% verified (0/18); no owner acceptance implied |

## A. Tool Identity and Historical Lineage

- **Identity (closure ledger, static):** slug `tool-027-ester-conversion`, toolId `mrx.tool.027-ester-conversion`, category `cycle-management`, route `/smarttools/cycle-management/tool-027-ester-conversion`.
- **Implementation paths (observed this audit):** engine `lib/tools/engines/tool-027-ester-conversion.ts`; schema `lib/tools/schemas/tool-027-ester-conversion.ts`; pipeline `lib/tools/r6/tool-027-ester-conversion-pipeline.ts`; contract `lib/tools/r6/tool-027-ester-conversion-contract.ts`; component `components/tools/tool-027-ester-conversion.tsx`; genius `components/tools/tool-027-ester-conversion.genius.tsx`; i18n `i18n/tool-027-ester-conversion.json`; i18n check `docs/MRX Genius Cloud Unified R6.1/tool-027-i18n-check.mjs`.
- **Git status (tool-scoped, critical finding):** every Tool 027 path is tracked and clean at HEAD **except** `lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts`, which is **UNTRACKED (`??`)** in the working tree. The pipeline test therefore is **not** clean-clone tracked evidence at `37f047a4`; this weakens the reproducibility of the focused pipeline battery and is the defining implementation/evidence gap for 027 (B2a item U2).
- **Historical start / engine intent:** `calculateMolarMassRelationshipV7` is an educational mass-conversion aid preserving only the entered amount of substance (`n = m/M`, `m_target = n × M_target`); it assumes no substance data and makes no clinical recommendation.
- **Relevant SHAs:** fixed baseline `37f047a4`; closure snapshot HEAD `8d7e406c` (2026-11-17); tool source SHA `2d246bfd`; true-clean ref `E:\p03-true-clean-20261118@37f047a4`; excluded contaminated ref `2a647fda`.
- **Original requirements / owner decisions:** D-C4, D-C5, D-CLIN, D-W18, D-P03 open; proposals P-01..P-10 recorded; tool is `IMPLEMENTED — OWNER REVIEW PENDING — NOT ACCEPTED — NOT CLOSED`.
- **Historical acceptance:** none at fixed baseline. Historical `1/18`, `117/117 i18n` and "prior implementation tests recorded; not consolidated" are claims tied to `8d7e406c`.
- **Current owner:** R6.1 programme owner for gates/decisions; implementation owner for later authorized work. No owner-acceptance decision found.

## B. Original and R6.1 Requirements

**Canonical denominator finding (explicit):** the canonical denominator for Tool 027 **differs from / is not fully recoverable beyond** the 18-row closure register. No tool-specific `tool-027-requirements.csv` or 123-row atomic ledger exists on disk (repo-wide search found requirement CSVs only for 039, 040 and 041). The only full atomic register is the **18-row closure ledger** (`tool-027-closure-ledger.md`/.csv, agreeing row-for-row), supplemented by `TOOL-027-DEVELOPMENT-PROPOSALS.md` (P-01..P-10). Those 18 rows are a *pragmatic closure* register tied to historic HEAD `8d7e406c`, used here strictly as an **operational audit matrix, not an owner-accepted official denominator for `37f047a4`**. The "Original requirement ID" column is an engineering crosswalk, **not** an owner-approved atomic ID set. No denominator is invented.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| SPEC-R6.1-1.b/1.c/1.d, P-01 | `ENG-PIPELINE` | All computation through R6 pipeline; engine authoritative | APPLICABLE | tracked pipeline + engine + schema + component uses `runEsterConversion`; **pipeline test untracked** | Clean-clone E3 coverage absent (U2) |
| SPEC-R6.1-1.e, ACC-5.5.10, P-09 | `STATE-5` | Honest five states | APPLICABLE | tracked component state union (static) | E3/E4 proof absent |
| SPEC-R6.1-3.a/3.b, LAYER-GENIUS12-01…12, P-01/P-02 | `UI-GENIUS12` | CORE-5/GENIUS-12 fixed order | APPLICABLE | tracked component + `.genius.tsx` (static) | non-exempt shared-shell duplicate risk unverified |
| SPEC-R6.1-3.d, SPEC-R6.1-6.b/6.c, ACC-5.5.6, P-08 | `I18N-PARITY` | AR/EN parity | APPLICABLE | tracked i18n + check + evidence test; historical 117/117 claim | No archived run — NOT_RUN |
| LAYER-GENIUS12-10, P-01 | `EXPORT-CSV` | Browser-only CSV export | APPLICABLE | `buildEsterConversionCsv` in tracked contract (static) | No browser proof |
| ACC-R6.1-3.a/b/c, G-1/G-2/G-3, P-04 | `TEST-FOCUSED` | Focused reproducible tests pass | APPLICABLE | tracked engine/schema/i18n/component tests; **r6 pipeline test untracked** | PARTIAL; no consolidated tracked battery |
| ACC-R6.1-3.a | `BUILD-TSC` | Clean tsc/build at HEAD | APPLICABLE | historical claims only | No HEAD artifact — NOT_RUN |
| SPEC-R6.1-3.g | `PREVIEW-ROUTE` | Route loads on accessible Preview | APPLICABLE | route tracked; SSO preview | Browser NOT_RUN |
| SPEC-R6.1-3.d, ACC-5.5.6 | `BROWSER-EN-AR` | EN/AR pass on Preview | APPLICABLE | i18n resource present | Browser NOT_RUN |
| SPEC-R6.1-1.e, ACC-5.5.10 | `BROWSER-5-STATES` | Five states on Preview | APPLICABLE | static state code | Browser NOT_RUN |
| ACC-5.5.6, ACC-5.5.7, ACC-5.5.7-LEGIBILITY | `RTL-390` | Real Arabic RTL at 390 px | APPLICABLE | `dir` handling (static) | Device/browser NOT_RUN |
| ACC-R6.1-3.a, SPEC-R6.1-5.d | `CONSOLE-HYDRATION` | No console/hydration errors | APPLICABLE | — | Browser NOT_RUN |
| SPEC-R6.1-3.a, LAYER-DOMAIN-RULE, P-01/P-02 | `NO-DUP-GENIUS` | No duplicate GENIUS/hidden box/double shell | APPLICABLE | static 12-box structure | DOM proof NOT_RUN |
| LAYER-CORE5-C4, P-05 | `C4-SOURCES` | Approved sources or approved N/A | APPLICABLE | no specialist-approved source; C4 `NOT_AVAILABLE` | D-C4 open — NOT_AVAILABLE |
| LAYER-CORE5-C5, P-06 | `C5-REFERRAL` | Approved referral wording | APPLICABLE | generic "not a prescription/diagnosis" static | D-C5 open — NOT_AVAILABLE |
| D-CLIN, P-07 | `CLINICAL-REVIEW` | Clinical/model review sign-off | APPLICABLE | no sign-off found | Original atomic ID unrecoverable; BLOCKED |
| SPEC-R6.1-4.f, LAYER-GENIUS12-11 | `W18-HISTORY` | History/storage per W18 | APPLICABLE | Box 11 `not_available`; no storage | D-W18 open — NOT_AVAILABLE |
| SPEC-R6.1-1.b/1.c, C-4/C-6/C-8, P-03 | `P03-PIPELINE` | Result-schema enforcement / P-03 | APPLICABLE | pilot pipeline; no shared P-03 | NOT_IMPLEMENTED |

**Counts:** applicable 18; justified N/A 0; unmapped original ID 1 (`CLINICAL-REVIEW`); PASS(E3+) 0; PASS(<E3) 5; PARTIAL 2; NOT_RUN 6; BLOCKED 1; NOT_AVAILABLE bucket 4 (3 `NOT_AVAILABLE` + 1 `NOT_IMPLEMENTED`). Verified `0/18 = 0.00%`.

**Source authority conflict log:**
| Source | Location | Impact | Resolution required |
|---|---|---|---|
| Closure ledger snapshot | `8d7e406c` | Historical claims vs HEAD | Historical only |
| B2a embedded self-hash | `12DE5A11…` vs observed `7682D2E1…` | Self-hash mismatch | Observed on-disk authority |
| Untracked pipeline test | `lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts` | Not in clean clone | Track or provide equivalent tracked coverage (U2) |
| Tool 039 CSV / profile | `5a87f3e5` `OWNER_ACCEPTED` | Could imply acceptance | Reference only |
| Shared shell `R6_EXEMPT_SLUGS` | `manifest.ts` | 027 non-exempt | DOM verify; no shared edit |

## C. Existing Architecture and Implementation

| Exact path | Git status | Role | Test file | Actual status |
|---|---|---|---|---|
| `lib/tools/engines/tool-027-ester-conversion.ts` | tracked, clean | molar-mass conversion engine | `...test.ts` tracked | static present |
| `lib/tools/schemas/tool-027-ester-conversion.ts` | tracked, clean | strict Zod input/output | `...test.ts` tracked | static present |
| `lib/tools/r6/tool-027-ester-conversion-pipeline.ts` | tracked, clean | validate→engine→result→envelope | `...pipeline.test.ts` **UNTRACKED (`??`)** | structural present; test not in clean clone |
| `lib/tools/r6/tool-027-ester-conversion-contract.ts` | tracked, clean | limits/source/CSV builder | — | static present |
| `components/tools/tool-027-ester-conversion.tsx` | tracked, clean | five-state UI, pipeline call | `tests/unit/components/tool-027-molar-mass-calculator.test.tsx` tracked | static present |
| `components/tools/tool-027-ester-conversion.genius.tsx` | tracked, clean | CORE-5 / GENIUS-12 + what-if | — | static present |
| `i18n/tool-027-ester-conversion.json` | tracked, clean | EN/AR strings + limits | `tests/unit/tool-027-i18n-evidence.test.ts` tracked | static present |
| `docs/MRX Genius Cloud Unified R6.1/tool-027-i18n-check.mjs` | tracked | AR/EN parity check | — | NOT_RUN |

**Dependencies:** React client component, `useToolDisplayPreferences`, `createToolSchema`/`createToolOutput`/`isToolOutput`, `requireTool`/`buildSeoLinks`, Zod, shared `R6ToolShell`. Per W4b, 027 is a **non-exempt shared-shell tool**. No Supabase/network/storage observed. Nothing built/executed.

## D. Math Engine and Equation Audit

- `calculateMolarMassRelationshipV7` (pure, static): `GRAMS_PER_UNIT = { mg: 0.001, g: 1, kg: 1000 }`; `sourceAmountInGrams = sourceMass × factor[sourceMassUnit]`; `amountInMoles = sourceAmountInGrams / sourceMolarMass`; `targetAmountInGrams = amountInMoles × targetMolarMass`; `targetAmount = targetAmountInGrams / factor[targetMassUnit]`. Result `resultOrigin CALCULATED`, `method SAME_AMOUNT_OF_SUBSTANCE`. This is a correct convert-once chain (source → grams → moles → grams → target) with symmetric factors; no double conversion.
- Schema guards (static): labels 1–120; `sourceMass`, `sourceMolarMass`, `targetMolarMass` finite positive ≤1,000,000,000; source strings 1–200; `MassUnitSchema` enum `mg|g|kg`; strict objects. Result schema requires all computed fields finite positive and literals `CALCULATED`/`SAME_AMOUNT_OF_SUBSTANCE`.
- Zero/negative/NaN/Infinity: rejected by Zod at the boundary (positive + finite); division by zero cannot occur because molar mass is strictly positive. Precision: floating-point division/multiplication; no explicit rounding of the moles/amount fields (result schema only requires finite positive). Determinism: structural for identical parsed input. Purity: no I/O imports in engine.
- **Tests run vs NOT_RUN:** focused battery (L) — **NOT_RUN**; the only pipeline test present is untracked, so clean-clone E3 coverage is absent. Static tracked engine/schema tests support E2 only.

## E. Pipeline and Schema Audit

Chain (static): `MolarMassConversionInputSchema` → `createToolSchema` → `calculateMolarMassRelationshipV7` → `MolarMassConversionResultSchema.parse` inside the engine → `createToolOutput` → `isToolOutput` → result; failures short-circuit. The pipeline source is tracked, but its test file is **untracked**, so clean-clone reproducibility is not established (E2, not E3). **P-03:** structural pilot present; shared frozen enforcement not implemented → `NOT_IMPLEMENTED`. No test executed.

## F. AI and Intelligence Capabilities

- AI brain / prompt / model / provider / RAG / prediction: **NotApplicable** — none observed.
- Clinical interpretation / recommendation: **Unavailable** by design; the engine explicitly assumes no substance data and the UI presents a calculation aid, never a prescription (P-06/P-07 rationale).
- Explanation / limits: **Implemented (static)** via scope, formula and "not a diagnosis" strings; **RuntimeVerified: No**. No AI runtime claim.

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next action |
|---|---|---|---|---|---|---|---|---|
| C1 primary result + unit | YES | YES | static | NO | NO | result fields | no E3/E4 | component test + DOM |
| C2 how/assumptions/inputs | YES | YES | static | NO | NO | formula strings | no E3/E4 | same |
| C3 safety/referral | YES | partial static | static | NO | NO | generic wording | D-C5 open | approved wording |
| C4 sources | YES | YES | static `not_available` | NO | NO | C4 box | D-C4 open | approved pack / N-A |
| C5 next actions | YES | partial static | static | NO | NO | inline guidance | D-C5 open | approved pack |
| Boxes 1–12 fixed order | YES | YES | static | NO | NO | tracked `.genius.tsx` | DOM proof absent | preview DOM check |
| Compact CORE-5 parity | YES | static | static | NO | NO | compact selector | no E3 | parity test |
| Non-applicable state reason | YES | YES | static | NO | NO | box 11 `not_available` | no E4 | preview check |

027 is non-exempt; the route adds shared shell boxes. Duplicate-region risk is an open `NO-DUP-GENIUS` question, not an asserted defect.

## H. Dynamic Results and UI Maturity

- **Static inspection:** five-value state union (EMPTY/PARTIAL/INVALID/FULL/DEGRADED), units begin "not answered" (no fabricated default), `DEGRADED` via failing pipeline guard, `dir` binding, `data-r6-*`, `aria-label`, mirrored-concentration helper.
- **MVO:** entered masses/molar masses with user-supplied `sourceMolarMassSource`/`targetMolarMassSource` provenance.
- **Component tests:** tracked but no re-run. **True-clean:** untracked pipeline test weakens reproducibility. **Browser E4:** NOT_RUN.

## I. Cross-Tool and Data Integration

- Engine → pipeline → component only. Cross-tool links and sources are declared in the tracked contract (`TOOL_027_CROSS_TOOL_LINKS`, `TOOL_027_SOURCES`); no payload transfer, session handoff or cloud sync implemented.
- **W18 boundary:** no storage observed; W18 open. Fail-closed error propagation (static).

## J. Safety, Sources and Privacy

- Educational conversion with `SAME_AMOUNT_OF_SUBSTANCE` and explicit no-substance-data assumption; "not a prescription / not a diagnosis" wording. No clinical recommendation.
- Validation Zod (static); no API/auth in tool paths; no value logging observed; console NOT_RUN; no storage; W18 open.
- Referral/clinical review static only; D-C4/D-C5/D-CLIN unresolved (P-05/P-07 BLOCKED); no sign-off claimed.

## K. Localization and Browser Maturity

- i18n JSON tracked and clean; parity script present. `node "docs/MRX Genius Cloud Unified R6.1/tool-027-i18n-check.mjs"` — **NOT_RUN**. Historical 117/117 not re-awarded.
- EN/AR, 5-state exercise, RTL-390, console/hydration, no-dup, CSV export, direct route: **NOT_RUN (E0)**. E4 prerequisites absent. No browser claim.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command | Environment | Source SHA (first 16) | Date | Actual result | Level | Reproducibility / validity | HEAD compat. |
|---|---|---|---|---|---|---|---|---|---|---|
| E-027-01 | ENG-PIPELINE | `tool-027-...-pipeline.ts` | `npx vitest run lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts` | isolated clean env | `D49DF03058E0B54D` (pipeline src) | 2026-11-19 | **NOT_RUN** (test **untracked**) | E2 | not reproducible from clean clone | test untracked |
| E-027-02 | TEST-FOCUSED | engine/schema/i18n/component tests | `npx vitest run lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts lib/tools/engines/tool-027-ester-conversion.test.ts lib/tools/schemas/tool-027-ester-conversion.test.ts tests/unit/tool-027-i18n-evidence.test.ts tests/unit/components/tool-027-molar-mass-calculator.test.tsx` | isolated clean env | `A8E88AC6A2BA5DDE` (engine) | 2026-11-19 | **NOT_RUN** | E2 (PARTIAL) | no archived log; untracked pipeline test | mixed |
| E-027-03 | I18N-PARITY | `tool-027-i18n-check.mjs` | `node "docs/MRX Genius Cloud Unified R6.1/tool-027-i18n-check.mjs"` | local | `FD4D7740659CF48E` | 2026-11-19 | **NOT_RUN** | E2 | no archived output | tracked @ HEAD |
| E-027-04 | BUILD-TSC | build config | `npx tsc --noEmit` then `npm run build` | clean env | — | 2026-11-19 | **NOT_RUN** | E2 | no HEAD artifact | no artifact |
| E-027-05 | browser rows (6) | preview URL | browser checks on accessible Preview pinned to `37f047a4` | accessible preview | — | 2026-11-19 | **NOT_RUN** | E0 | n/a | SSO blocked |
| E-027-06 | B2a evidence reuse | `retry-01/B2a-LEDGER-025-031.md` | read-only hash + row review | this audit | `7682D2E184611947` | 2026-11-19 | reviewed, 18 rows | E5 | reproducible hash | observed on-disk |

No test/build/browser action executed. Historical "prior tests recorded" and `117/117` are claims, not re-run evidence.

## M. Defect and Gap Register

**Implementation gaps**
| ID | Severity | Requirement | Exact file | Actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-027-1 | HIGH | `ENG-PIPELINE`, `TEST-FOCUSED` | `lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts` (**UNTRACKED**) | Test present in WT but absent from clean clone at HEAD | No reproducible E3 pipeline coverage | Artifact not committed | Review/track per scoped approval or provide equivalent tracked coverage (U2), then re-run + archive | low |
| I-027-2 | MEDIUM | `NO-DUP-GENIUS`, `UI-GENIUS12` | `components/tools/tool-027-ester-conversion.genius.tsx` + `components/tools/r6/R6ToolShell.tsx` (shared) | Tool renders own boxes while non-exempt route adds shared boxes | Possible duplicate regions; unverified | non-exempt in `R6_EXEMPT_SLUGS` | DOM verification; **no shared edit** | high if shared edited |

**Evidence gaps**
| ID | Severity | Requirement | Exact file | Gap | Impact | Next action |
|---|---|---|---|---|---|---|
| V-027-1 | CRITICAL | C4/C5/CLIN/W18/P03 rows | proposals + closure ledger | D-C4/C5/CLIN/W18/P-03 open | 5 rows unresolved | owner decisions + packs |
| V-027-2 | HIGH | 6 browser rows | preview URL | E4 NOT_RUN | 6 rows unresolved | pinned accessible Preview + capture |
| V-027-3 | HIGH | ENG-PIPELINE/TEST-FOCUSED/I18N-PARITY | tracked + untracked tests/check | no HEAD run; untracked pipeline test | E3 not awarded | track + isolated re-run + archive |
| V-027-4 | HIGH | BUILD-TSC | build config | no HEAD artifact | PARTIAL | archive clean tsc/build |

## N. Development Maturity Matrix (S0–S11)

| Stage | Component | Highest verified stage | Next missing stage | Bottleneck |
|---|---|---|---|---|
| S0 | Identity / registry | S0 verified | S1 | none (untracked test noted) |
| S1 | Requirements | S1 partial (operational matrix) | S2 authoritative denominator | no per-tool CSV |
| S2 | Architecture | S2 verified (inventory + git) | S3 | untracked pipeline test |
| S3 | Engine | S3 static (pure convert-once math) | S4 E3 engine test | NOT_RUN |
| S4 | Pipeline | S4 static (tracked source, untracked test) | S5 tracked E3 pipeline test | U2; P-03 open |
| S5 | UI | S5 static (5-state union) | S6 component E3 | NOT_RUN |
| S6 | AI / CORE-5 / GENIUS-12 | S6 static (no AI, 12 boxes) | S7 DOM E3 | duplicate check NOT_RUN |
| S7 | Cross-tool / safety | S7 static | S8 | D-C4/C5/CLIN/W18 open |
| S8 | Testing | S8 partial (tracked minus pipeline test) | S9 | no HEAD run |
| S9 | True-clean | S9 not verified | S10 | no isolated log; untracked test |
| S10 | Browser | S0 only | S1 browser | SSO |
| S11 | External / owner | S0 only | S1 | owner; never from plan |

## O. Comparison with Tool 039 (applicable engineering criteria only)

Reference only; 039 `OWNER_ACCEPTED` rows and D-08 exception are not transferred. No similarity score.

| Dimension | Status | Engineering reason | Action |
|---|---|---|---|
| Architecture | PARTIALLY_APPLICABLE | same layer chain; 027 non-exempt shared shell; untracked pipeline test vs 039 tracked | Preserve core; Fix tracking; Extend DOM proof |
| Engine | APPLICABLE | deterministic convert-once molar-mass math, fully specified in pure module | Preserve |
| Validation | PARTIALLY_APPLICABLE | input/result/envelope guards present; P-03 not implemented | Fix when approved |
| AI | NOT_APPLICABLE | no model in either; calculation aid only | Preserve |
| Dynamic Results | PARTIALLY_APPLICABLE | five states static; no E3/E4 | Extend |
| CORE-5 | PARTIALLY_APPLICABLE | tool genius + shared shell | Fix (verify duplication) |
| GENIUS-12 | PARTIALLY_APPLICABLE | 12 boxes static; box 11 not_available | Preserve reason; Extend proof |
| Cross-Tool | PARTIALLY_APPLICABLE | link/source contract present, no transfer | Preserve |
| Safety | APPLICABLE | educational conversion with explicit limits | Preserve |
| Testing | NOT_VERIFIED | no HEAD run; untracked pipeline test | Fix (U2 + isolated evidence) |
| Browser — current-HEAD E4 | NOT_AVAILABLE | no pinned Preview | Extend after SSO gate |
| Browser — historic transfer | NOT_VERIFIED | 117/117 not pinned | Preserve as history |

## P. Next Development Tasks (proposals only)

| # | Exact file | Proposed change | Required tests | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| 1 | `lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts` | review/track test (or equivalent tracked coverage) per scoped approval | isolated `npx vitest run` on tracked file | scoped git approval (U2) | low | clean-clone E3 pipeline coverage | PASS log at `37f047a4` |
| 2 | tracked test/check files | archive isolated focused battery + i18n run | commands in L | authorized isolated env | low | E3 evidence | PASS logs w/ HEAD/SHA/date |
| 3 | build config | archive clean tsc/build | `npx tsc --noEmit`, `npm run build` | authorized isolated env | low | BUILD-TSC closure | archived clean output |
| 4 | `tool-027-ester-conversion.genius.tsx` + route | verify no duplicate boxes via DOM (no shared edit) | browser DOM check | accessible Preview | medium | no-dup verified | 12 ordered boxes, single shell |
| 5 | owner gates | D-C4/C5/CLIN/W18/P-03 decisions | n/a | owner decisions | medium | rows closed | recorded approvals |

Shared-component changes require a separate Change Impact Matrix; none authorized.

## Q. Current Tool Decision

**Decision: REPAIR.** Completion = `100 × 0 / 18 = 0.00%`. Preserved assets: pure convert-once engine, tracked structural pipeline, tracked engine/schema/i18n/component tests, correct honest-limitations posture. Blocking gaps: **untracked pipeline test (U2)**, absence of archived E3/E4 evidence, open owner gates, unverified shared-shell duplicate-box risk. **No owner acceptance implied, claimed or transferred.**

## Integrity note

The SHA-256 below is computed over all bytes of this file preceding the final hash line. Because that line is added after hashing, the whole-file hash differs by construction; the recorded body hash is the reproducible content fingerprint and is authoritative for this audit. The true whole-file SHA-256 is reported in the delivery response.

Observed on-disk SHA-256 (body before this line): `BEBC12B1077759F631FF1F75A637EEB1032576CF813369ED8021D1C91A3A3909`
