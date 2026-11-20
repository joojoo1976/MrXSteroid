# TOOL 014 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `014` · `mrx.tool.014-water-retention` |
| Canonical name / slug | `Water Retention Assessor` / `tool-014-water-retention` |
| Category | body-composition |
| Canonical route | `/smarttools/body-composition/tool-014-water-retention` |
| Batch | Batch 1 (audit scope; historical closure sprint labels it Batch 4 — conflict logged in B) |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`, dirty worktree) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation. No code/contract/schema/ledger/git/build/test/server/browser writes or executions. |
| Primary source ledger | `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/retry-01/B1a-LEDGER-006-015.md` — observed SHA-256 `3B6E02BF0DC78DF9A638191C7B3D4A094868D4985A59079EF91A9757985DF79C` |
| Secondary ledgers | closure ledger MD `B25DB676BAD8167E4DC8A61986DD60493ECD1E7D19EF683A6B7201BBBC49985F`; CSV `2B87C1BF9DC170B102C8667924FE2C031A1C3121BD109552D81169BFBE55C93E`; proposals `182FBAD12927219A84431754732DF206F635D57A52D7BC80C9B6901F96A41DC6`; i18n check `36C69A289B1BFBB4B05826E64CF288F9CD3E6E36CA81CA5D93CE930528B27287` |
| Standard | `phase-next/00-PLAN-AND-AUDIT-STANDARD.md` — observed SHA-256 `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9` |
| Tool decision | **PRESERVE** — 16.67% verified (3/18); honest `NOT_AVAILABLE / NO_VALIDATED_MODEL`; no owner acceptance implied |

## A. Tool Identity and Historical Lineage

- **Identity (registry, observed):** `lib/tools/registry.ts:55` — `mrx.tool.014-water-retention`, slug `tool-014-water-retention`, version `1.0.0`, `href /smarttools/body-composition/tool-014-water-retention`, `titleEn "Water Retention Assessor"`, `titleAr "مقيم احتباس الماء"`, `accessTier free`, `order 280`, `stackStatus layered`. Route file `app/smarttools/tool-014-water-retention/page.tsx` tracked and clean.
- **Implementation paths (observed):** engine `lib/tools/engines/tool-014-water-retention.ts` (tracked, last commit `108d3063bdcb`, 10 lines, returns `{status:'NOT_AVAILABLE', reason:'NO_VALIDATED_MODEL'}`); engine test `...test.ts` (tracked); pipeline `lib/tools/r6/tool-014-water-retention-pipeline.ts` (tracked, `37f047a4105d`); pipeline test `...pipeline.test.ts` (tracked); contract `...-contract.ts` (tracked); schema `lib/tools/schemas/tool-014-water-retention.ts` (tracked); component `components/tools/tool-014-water-retention.tsx` (tracked, `cbf75513b5ce`) and `.genius.tsx` (tracked); `tests/unit/tool-014-i18n-evidence.test.ts` (tracked); i18n `i18n/tool-014-water-retention.json` (tracked). All tracked artifacts clean.
- **Historical start:** former retention estimates/severity labels/treatment advice were removed because no validated model or sourced threshold exists. Proposals record engine/schema/adapter/pipeline as frozen; status "implemented and tested, owner review pending — NOT ACCEPTED, NOT CLOSED". P-05 (sourced model) is `BLOCKED` by design; P-03 (result-schema enforcement in pipeline) is `NOT IMPLEMENTED` as a shared-layer item.
- **Owner decisions:** D-C4, D-C5, D-CLIN, D-W18 open; P-03 runtime-negative committed proof pending. No owner acceptance of Tool 014 is recorded.
- **Historical acceptance:** closure ledger `59/59` i18n PASS and `17/50` Batch 4 tests (2026-11-17); tracked 014 tests PASS in recorded clean-clone r6 suite at `37f047a4`. All recorded, not re-executed.
- **Relevant SHAs:** baseline `37f047a4`; stale closure snapshot `8d7e406c`; Tool 039 reference `5a87f3e5` (reference only); true-clean context `E:\p03-true-clean-20261118@37f047a4`; excluded `2a647fda`.
- **Current owner:** R6.1 programme owner for gates/decisions; tool implementation owner for later authorized work. The honest unavailable result is a preserved safety asset, not a failure to be "fixed" by inventing a model.

## B. Original and R6.1 Requirements

**Canonical denominator finding (explicit):** the official per-tool atomic requirement denominator for Tool 014 **cannot be fully recovered**. Available: generic 18-row closure register (closure ledger MD/CSV + B1a ledger) as **operational audit matrix only**; system-wide canonical IDs (`REQUIREMENT-TRACEABILITY-MATRIX.md` A-1…G-7; `tool-039-requirements.csv` SPEC/ACC/LAYER/ACC-5.5 — engineering reference only); `R6.1-SYSTEM-REQUIREMENT-REGISTER.md`; proposals `P-01…P-06`. **Missing:** per-tool owner-approved atomic requirements CSV/acceptance file for 014. No denominator invented.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| SPEC-R6.1-1.a/1.b/1.c, SPEC-R6.1-2.c, C-2, C-8 | `ENG-PIPELINE` | Pipeline-only computation; V6 engine authoritative | APPLICABLE | tracked pipeline calls `calculateWaterRetention`, `WaterRetentionResultSchema.safeParse`, gate + envelope; tracked pipeline test recorded PASS | E3 recorded, not re-run |
| SPEC-R6.1-1.e, SPEC-R6.1-2.b, ACC-R6.1-3.c, ACC-5.5.10 | `STATE-5` | Honest 5 states; FULL shows model-unavailable result | APPLICABLE | contract maps states; component `data-r6-state` (static) | no browser proof |
| SPEC-R6.1-3.a/3.b, LAYER-GENIUS12-01…12, LAYER-5IN12-* | `UI-GENIUS12` | CORE-5 + 12 boxes fixed order | APPLICABLE | tracked genius: 12 boxes, boxes 5/6 `not_applicable`, 9/11 `not_available`, rating `session_only_not_saved` | static only |
| SPEC-R6.1-3.d, SPEC-R6.1-6.b/6.c, ACC-5.5.6 | `I18N-PARITY` | AR/EN parity | APPLICABLE | check script + tracked i18n evidence test; recorded `59/59` PASS | E3 recorded, not re-run |
| LAYER-GENIUS12-10, LAYER-20MAP-07 | `EXPORT-CSV` | Browser-only CSV export | APPLICABLE | `buildWaterRetentionCsv` in tracked contract; export path static | no browser proof |
| ACC-R6.1-3.a/b/c, G-1/G-2/G-3 | `TEST-FOCUSED` | Focused reproducible tests pass | APPLICABLE | tracked pipeline, engine, i18n-evidence tests; recorded clean-clone PASS | E3 recorded, not re-run |
| ACC-R6.1-3.a | `BUILD-TSC` | Clean tsc/build at HEAD | APPLICABLE | historical claims | no HEAD archive |
| LAYER-20MAP-07, SPEC-R6.1-3.g | `PREVIEW-ROUTE` | Route loads on Preview | APPLICABLE | tracked route; SSO | NOT_RUN |
| SPEC-R6.1-3.d, ACC-5.5.6 | `BROWSER-EN-AR` | EN/AR functional pass | APPLICABLE | i18n tracked | NOT_RUN |
| SPEC-R6.1-1.e, ACC-R6.1-3.c, ACC-5.5.10 | `BROWSER-5-STATES` | Five states on Preview | APPLICABLE | static state code | NOT_RUN |
| ACC-5.5.6/7/7-LEGIBILITY | `RTL-390` | Real RTL at 390 px | APPLICABLE | `dir` static | NOT_RUN |
| ACC-R6.1-3.a, SPEC-R6.1-5.d | `CONSOLE-HYDRATION` | No console/hydration issues | APPLICABLE | — | NOT_RUN |
| SPEC-R6.1-3.a, LAYER-DOMAIN-RULE | `NO-DUP-GENIUS` | No duplicate GENIUS-12 | APPLICABLE | tracked genius | DOM proof NOT_RUN |
| LAYER-CORE5-C4, LAYER-GENIUS12-09, SPEC-R6.1-2.f | `C4-SOURCES` | Approved sources or approved N-A | APPLICABLE | `TOOL_014_SOURCES=[]`; P-05 BLOCKED | NOT_AVAILABLE |
| LAYER-CORE5-C5, LAYER-GENIUS12-12, SPEC-R6.1-5.g, ACC-R6.1-3.i | `C5-REFERRAL` | Approved referral wording | APPLICABLE | `referral_not_available`; D-C5 open | NOT_AVAILABLE |
| D-CLIN (no canonical atomic ID recovered) | `CLINICAL-REVIEW` | Clinical/model review sign-off | APPLICABLE | none found | **original ID not recoverable — explicit missing mapping** |
| SPEC-R6.1-4.f, SPEC-R6.1-6.d, LAYER-GENIUS12-11/12-RATING | `W18-HISTORY` | History/storage per W18 | APPLICABLE | box 11 `not_available`, rating `session_only_not_saved` | D-W18 open; D-08 Tool-039-only not transferred |
| SPEC-R6.1-1.b/1.c, C-4/C-6/C-8, P-03/P-03 proposal | `P03-PIPELINE` | P-03 enforcement closure | APPLICABLE | committed structural gate; tracked test recorded PASS; runtime-negative uncommitted | NOT_IMPLEMENTED as acceptance item |

**Counts:** applicable (operational) 18; justified N/A 0; unmapped 1 (`CLINICAL-REVIEW`); PASS(E3+)=3 (`ENG-PIPELINE`, `I18N-PARITY`, `TEST-FOCUSED` — recorded/committed clean-clone context, not re-executed); PASS(<E3)=3; PARTIAL=1; NOT_RUN=6; BLOCKED=1; NOT_AVAILABLE=3; NOT_IMPLEMENTED=1.

**Source authority conflict log:**
| Source | Location | Impact | Resolution |
|---|---|---|---|
| Closure ledger | `8d7e406c`, Batch 4 label vs audit Batch 1 | stale snapshot / batch mismatch | historical; audit scope per standard |
| Tool 039 CSV | `OWNER_ACCEPTED` rows | could imply 014 acceptance | reference only; not transferred |
| B1a self-hash | `9BD82DDFFA…` vs observed `3B6E02BF…` | hash mismatch | observed on-disk authoritative; no edit |
| Generic 18-row register | closure ledgers | could be mistaken for official denominator | operational only |
| P-05 model proposal | proposals | could tempt inventing a model | keep `NO_VALIDATED_MODEL`; do not fabricate |

## C. Existing Architecture and Implementation

| Exact path | Git status | Last commit | Role | Test file | Actual status |
|---|---|---|---|---|---|
| `app/smarttools/tool-014-water-retention/page.tsx` | tracked, clean | — | route | — | present |
| `lib/tools/engines/tool-014-water-retention.ts` | tracked, clean | `108d3063bdcb` | honest unavailable engine | `...test.ts` (tracked) | tracked |
| `lib/tools/schemas/tool-014-water-retention.ts` | tracked, clean | — | Zod schema | — | tracked |
| `lib/tools/r6/tool-014-water-retention-pipeline.ts` | tracked, clean | `37f047a4105d` | R6 pipeline + result gate | `...pipeline.test.ts` (tracked) | tracked |
| `lib/tools/r6/tool-014-water-retention-contract.ts` | tracked, clean | — | `READY` → honest unavailable, sources, CSV | — | tracked |
| `components/tools/tool-014-water-retention.tsx` | tracked, clean | `cbf75513b5ce` | UI state mapping | — | tracked |
| `components/tools/tool-014-water-retention.genius.tsx` | tracked, clean | — | GENIUS-12 / CORE-5 | — | tracked |
| `tests/unit/tool-014-i18n-evidence.test.ts` | tracked, clean | — | i18n evidence | — | tracked |
| `i18n/tool-014-water-retention.json` | tracked, clean | SHA `81891923…` | AR/EN copy | check script present | tracked |

**Dependencies:** React client component, canonical contracts, Zod, registry, shared R6 shell, `useToolDisplayPreferences`. No Supabase/network/storage import observed. Engine is a pure 10-line function with no inputs used.

## D. Math Engine and Equation Audit

- **No equation by design.** `calculateWaterRetention(_input: unknown): WaterRetentionResult` ignores input and returns `{ status: 'NOT_AVAILABLE', reason: 'NO_VALIDATED_MODEL' }` (observed source line 8-9). The former unreferenced retention estimates, severity labels and treatment advice were deliberately removed.
- Variables/units/conversion/boundaries/precision: none in scope; no arithmetic exists to audit. Zero/negative/NaN/Infinity are irrelevant because input is unused; the input schema still guards at the pipeline boundary (static).
- Purity: no React/DOM/Supabase/Date/I/O imports; deterministic constant result (static).
- Result schema: `WaterRetentionResultSchema` validates the unavailable result in the pipeline gate (static). Engine test tracked and recorded PASS.
- **Tests run vs NOT_RUN:** `npx vitest run lib/tools/engines/tool-014-water-retention.test.ts` — **NOT_RUN** this audit; recorded PASS in clean-clone context only (E3 recorded, E2 static here).

## E. Pipeline and Schema Audit

Chain (static): contract `evaluateWaterRetentionDraft` returns `READY` with an honest `NOT_AVAILABLE / NO_VALIDATED_MODEL` input (no user-entered inputs) → input schema parse → `calculateWaterRetention` → `WaterRetentionResultSchema.safeParse(engineResult)` fail-closed gate → `createToolOutput` envelope → `isToolOutput` guard. KeyFindings expose `status` and `reason`. No DB/I/O; timestamps injected by caller. **P-03 status:** structural gate present and committed, tracked pipeline test recorded PASS; runtime-negative committed proof uncommitted per P-03/C reports → `NOT_IMPLEMENTED` as a generic acceptance item. No test executed. Do not convert the honest unavailable result into a "passed clinical calculation" claim.

## F. AI and Intelligence Capabilities

- AI model/provider/prompt: **NotApplicable** (no model; no network observed statically).
- What-if / sensitivity boxes 5 and 6 are explicitly `not_applicable` with `box5_na` / `box6_na` reasons — **Unavailable by honest design**, not missing implementation.
- Explanation/uncertainty: static disclosure of the absent validated model; **RuntimeVerified: No**.
- No AI feature is claimed; platform AI is G-R6.1-3. The absent model is a safety-preserving decision (P-05 BLOCKED).

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next action |
|---|---|---|---|---|---|---|---|---|
| C1 primary result = `NOT_AVAILABLE` | YES | YES | YES (tracked) | recorded | NO | genius box 2 `renderPrimary()` | E4 absent | preview check |
| C2 how / inputs | YES | YES | YES (tracked) | recorded | NO | boxes 3/4, no-input note | E4 absent | preview check |
| C3 safety/referral | YES | partial | `referral_not_available` | recorded | NO | box 7 | D-C5 open | approved wording |
| C4 sources | YES | YES | `not_available` badge | recorded | NO | `TOOL_014_SOURCES=[]`, box 9 | D-C4 open / P-05 blocked | approved N-A decision |
| C5 next actions/rating | YES | YES | static, rating `session_only_not_saved` | recorded | NO | box 12 | D-W18 open | owner decision |
| Boxes 1–12 fixed order | YES | YES | YES (tracked) | recorded | NO | n:1…12; boxes 5/6 N/A, 9/11 N/A | no E4 | preview DOM |
| Compact CORE-5 parity | YES | YES | YES (tracked) | recorded | NO | `visible = [boxes[1],2,6,8,11]` | no E4 | parity check |
| N/A boxes show reason | YES | YES | YES (tracked) | recorded | NO | `not_applicable` badges | none structural | preserve |

## H. Dynamic Results and UI Maturity

- **Static inspection:** `Tool014UiState` union in tracked contract; component `data-r6-state={uiState}` with `aria-live="polite"`; `dir` binding; compact toggle with `aria-pressed`; `data-r6-summary="full"`; `data-r6-core` sections in genius; CSV export/print button path. FULL honestly displays the model-unavailable result.
- **Component test / integration test:** tracked i18n-evidence, pipeline and engine tests; recorded clean-clone r6 suite PASS at `37f047a4`. **True-clean:** recorded. **Browser E4:** NOT_RUN (SSO/unavailable).
- Live recalculation/debounce: no 014-specific debounce constant observed; do not infer from Tool 039. Accessibility/keyboard/responsive are static/recorded, not E4.

## I. Cross-Tool and Data Integration

- Cross-tool box 8 renders `box8_none` and a no-transfer statement; cross-tool links empty in tracked contract. No payload transfer or event bus emission observed (W18 boundary). `calculatedAt` shown statically.
- Producer/consumer: component → pipeline → envelope. Fail-closed error propagation statically. No automatic transfer claim.

## J. Safety, Sources and Privacy

- Strongest safety property: no invented clinical result. No diagnosis/treatment advice. Referral text `referral_not_available` pending D-C5 — do not invent wording.
- Validation at boundary via Zod (static). No API/Supabase/auth path observed. No browser console proof (NOT_RUN). No persisted rating or history (`session_only_not_saved`, box 11 not_available); W18 open.
- D-C4 / D-C5 / D-CLIN unresolved; no specialist sign-off. P-05 (sourced model) BLOCKED by absence of a validated model — preserve.

## K. Localization and Browser Maturity

- `i18n/tool-014-water-retention.json` tracked; `docs/.../tool-014-i18n-check.mjs` present; `tests/unit/tool-014-i18n-evidence.test.ts` tracked. Recorded parity `59/59 PASS (2026-11-17)` — E3 **recorded, not re-run**. Optional rerun `node "docs/MRX Genius Cloud Unified R6.1/tool-014-i18n-check.mjs"` — **NOT_RUN**.
- Browser rows — **NOT_RUN** (E0). E4 prerequisites: SSO-protected preview, preview pinned to `37f047a4`, Deployment ID not supplied. No browser claim.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command | Environment | Source SHA (first 16) | Date | Actual result | Level | Reproducibility / validity | HEAD compatibility |
|---|---|---|---|---|---|---|---|---|---|---|
| E-014-01 | ENG-PIPELINE | `lib/tools/r6/tool-014-water-retention-pipeline.test.ts` | `npx vitest run lib/tools/r6/tool-014-water-retention-pipeline.test.ts` | clean clone @ `37f047a4` (C report) | `AF0E2A7F72753E5B` | 2026-11-19 (recorded) | PASS in recorded r6 suite — **not re-run** | E3 recorded | reproducible from log | tracked, clean at HEAD |
| E-014-02 | I18N-PARITY | `docs/.../tool-014-i18n-check.mjs` | `node "docs/MRX Genius Cloud Unified R6.1/tool-014-i18n-check.mjs"` | local (recorded) | `36C69A289B1BFBB4` | 2026-11-19 (recorded) | `59/59 PASS` recorded — **NOT_RUN** now | E3 recorded | script present, log historical | tracked |
| E-014-03 | TEST-FOCUSED | `lib/tools/engines/tool-014-water-retention.test.ts`, `tests/unit/tool-014-i18n-evidence.test.ts` | `npx vitest run lib/tools/engines/tool-014-water-retention.test.ts tests/unit/tool-014-i18n-evidence.test.ts` | clean clone @ `37f047a4` (recorded) | `39EC70C04C0E36F8` / `2C18543FDB4B41C0` | 2026-11-19 (recorded) | PASS recorded — not re-run | E3 recorded | reproducible from log | tracked |
| E-014-04 | BUILD-TSC | build config | `npx tsc --noEmit` + project build | clean env | — | 2026-11-19 | **NOT_RUN** | E2 historical | no HEAD artifact | no archive |
| E-014-05 | browser rows | preview URL | `curl -sS -o NUL -w "%{http_code}" <preview-url>` | accessible preview | — | 2026-11-19 | **NOT_RUN** | E0 | n/a | SSO blocked |
| E-014-06 | B1a evidence reuse | `retry-01/B1a-LEDGER-006-015.md` | read-only hash + row review | this audit | `3B6E02BF0DC78DF9A` | 2026-11-19 | reviewed, 18 rows | E5 (audit of evidence) | reproducible hash | observed on-disk |

No execution was performed. All E3 values are recorded evidence, not upgraded by this read-only pass.

## M. Defect and Gap Register

**Implementation gaps**
| ID | Severity | Requirement | Exact file | Actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-014-1 | MEDIUM | `C4-SOURCES` | `lib/tools/r6/tool-014-water-retention-contract.ts` (`TOOL_014_SOURCES=[]`) | empty sources vs approved pack / N-A | row unresolved | D-C4 open; P-05 blocked | owner-approved N-A (do not invent model) | low |
| I-014-2 | MEDIUM | `C5-REFERRAL` | `...water-retention.genius.tsx` | `referral_not_available` vs approved wording | row unresolved | D-C5 open | approved AR/EN pack | low |
| I-014-3 | MEDIUM | `W18-HISTORY` | genius box 11 / rating marker | `not_available` / `session_only_not_saved` | row unresolved | D-W18 open | owner decision | low |
| I-014-4 | LOW | `P03-PIPELINE` | tracked pipeline | structural gate only; negative proof uncommitted | acceptance not closed | approval-gated evidence | commit/verify negative coverage when authorized | low |

**Evidence gaps**
| ID | Severity | Requirement | Exact file | Gap | Impact | Next action |
|---|---|---|---|---|---|---|
| V-014-1 | HIGH | browser rows (6) | preview URL | E4 NOT_RUN | 6 rows unresolved | accessible preview + capture |
| V-014-2 | HIGH | `BUILD-TSC` | build config | no HEAD archive | row PARTIAL | archive clean tsc/build |
| V-014-3 | MEDIUM | `TEST-FOCUSED`, `I18N-PARITY`, `ENG-PIPELINE` | cited tracked tests/scripts | E3 recorded, not re-run | not independently refreshed | optional isolated rerun/archive |
| V-014-4 | MEDIUM | `CLINICAL-REVIEW` | D-CLIN | no sign-off; original ID unmapped | BLOCKED | obtain sign-off |

## N. Development Maturity Matrix (S0–S11 per component)

| Stage | Component | Highest verified stage | Next missing stage | Bottleneck |
|---|---|---|---|---|
| S0 | Identity / registry | S0 verified | S1 | none |
| S1 | Requirements | S1 partial (operational matrix; proposals P-IDs) | S2 official denominator | no per-tool requirements CSV |
| S2 | Architecture | S2 verified; all tracked clean | S3 | none |
| S3 | Engine | S3 static + recorded E3 (honest unavailable) | S4 | re-run not authorized |
| S4 | Pipeline | S5 recorded E3 (tracked pipeline test) | S6 (runtime-negative) | approval-gated proof |
| S5 | UI | S5 static + recorded component tests | S6 | E4 |
| S6 | AI / CORE-5 / GENIUS-12 | S6 static tracked; N/A boxes honest | S7 | D-C4/C5/W18 |
| S7 | Cross-tool / safety | S7 static; no model by design | S8 | D-CLIN; P-05 blocked |
| S8 | Testing | S9 recorded E3 in clean clone | S10 | re-run not authorized |
| S9 | True-clean | S9 recorded at `37f047a4` | S10 | no browser |
| S10 | Browser | S0 only | S1 browser | SSO / unavailable |
| S11 | External / owner | S0 only — owner review pending | S1 owner | never from a plan |

## O. Comparison with Tool 039 (applicable engineering criteria only)

Reference only; no similarity score; Tool 039 `OWNER_ACCEPTED` and D-08 not transferred.

| Dimension | Status | Engineering reason | Action |
|---|---|---|---|
| Architecture | APPLICABLE | same registry/contract/pipeline pattern; all tracked | Preserve |
| Engine | PARTIALLY_APPLICABLE | 014 deliberately unavailable vs 039 active calculator; honesty is the asset | Preserve |
| Validation | PARTIALLY_APPLICABLE | structural gate recorded E3; runtime-negative uncommitted | Preserve; Extend only when authorized |
| AI | NOT_APPLICABLE | no model in either tool slice | Preserve |
| Dynamic Results | PARTIALLY_APPLICABLE | 5 states static/recorded; FULL shows N/A honestly | Extend (E4) |
| CORE-5 | PARTIALLY_APPLICABLE | tracked boxes; C4/C5 unresolved | Preserve structure; Extend content |
| GENIUS-12 | APPLICABLE | 12 boxes; boxes 5/6 N/A with reasons; box 11 N/A (no D-08) | Preserve |
| Cross-Tool | PARTIALLY_APPLICABLE | empty links, no transfer | Preserve |
| Safety | PARTIALLY_APPLICABLE | no diagnosis; sources/referral not approved | Extend on decisions |
| Testing | APPLICABLE (recorded) | tracked tests PASS in recorded clean clone | Preserve; optional rerun |
| Browser | NOT_AVAILABLE | SSO preview; no E4 for 014 | Fix when accessible |

## P. Next Development Tasks (proposals only — no implementation in this audit)

| # | Exact file | Proposed change | Required tests | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| 1 | `lib/tools/engines/tool-014-water-retention.ts` | preserve `NO_VALIDATED_MODEL`; never add unsourced estimate | engine test | D-CLIN/P-05 | low | honesty preserved | no fabricated result |
| 2 | `lib/tools/r6/tool-014-water-retention-pipeline.ts` | commit/verify runtime-negative evidence when authorized | isolated pipeline run | P-03 owner | low | closure depth | clean-clone negative PASS |
| 3 | `docs/.../tool-014-i18n-check.mjs` | optional re-run + archive on HEAD | script rerun | I18N lead | low | fresh parity log | exit 0, 59/59 |
| 4 | contract `TOOL_014_SOURCES` / genius C3/C5 | owner-approved N-A and referral wording | contract/component tests | D-C4/D-C5 | medium | approved content | recorded approvals |
| 5 | preview/QA | accessible preview; EN/AR, 5 states, RTL-390, console, duplicate checks | browser E4 | SSO/Deployment ID | medium | E4 rows closed | captured JSON + screenshots |

Shared-component changes require a separate Change Impact Matrix before implementation.

## Q. Current Tool Decision

**Decision: PRESERVE.** Completion = `100 × 3 / 18 = 16.67%` (PASS(E3+) = `ENG-PIPELINE`, `I18N-PARITY`, `TEST-FOCUSED`, all from **recorded/committed clean-clone context, not re-executed**; `NOT_AVAILABLE ≠ NOT_APPLICABLE`; unresolved rows block 100%). The `NOT_AVAILABLE / NO_VALIDATED_MODEL` result is a preserved clinical-safety decision — it must not be replaced with a fabricated model. **No owner acceptance is implied** — proposals state owner review pending and Tool 039's `OWNER_ACCEPTED` status is not transferred.

## Integrity note
The SHA-256 below is computed over all bytes of this file preceding the final hash line. Because that line is added after hashing, the whole-file hash differs by construction; the recorded body hash is the reproducible content fingerprint and is authoritative for this audit.

Observed on-disk SHA-256 (body before this line): `A0FA1E66B1EE35DA47498C2FF5682F95BAB0FDC9C08964636F77207B85731637`
