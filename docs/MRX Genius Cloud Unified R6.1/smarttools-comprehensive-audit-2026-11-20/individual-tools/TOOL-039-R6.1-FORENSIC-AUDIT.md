# TOOL 039 — R6.1 FORENSIC AUDIT (comprehensive 2026-11-20)

| Field | Verified value |
|---|---|
| Tool | Tool 039 — Liver Enzyme Tracker |
| Canonical tool ID | `mrx.tool.039-liver-enzyme-tracker` |
| Slug | `tool-039-liver-enzyme-tracker` |
| Category / canonical EN route | `medical-monitoring` · `/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker` |
| Canonical AR route | `NOT_VERIFIED` — no proven locale-prefixed canonical mapping was found |
| Audit role | **Engineering reference / benchmark only.** Tool 039 is **not** one of the 29 Batch 1–4 closure tools and is never added to their denominator. |
| Fixed baseline | `E:\MrXSteroid-main` @ HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f` (verified with `git rev-parse HEAD`) |
| True-clean reference | `E:/p03-true-clean-20261118` @ `37f047a4` (pre-existing; not created or used for a new run by this audit) |
| Excluded reference | `E:/p03-clean-build-20261118` @ `2a647fda` (contaminated; never a clean-clone proof) |
| Audit date | 2026-11-20 |
| Mode | **Read-only forensic audit.** No application source, contract, schema, ledger, registry, git state, prior report, build, deploy, browser session, SSO flow, or test execution was performed. |
| Calculator | `docs/MRX Genius Cloud Unified R6.1/tool-039-acceptance-calc.mjs` was **not executed** because it writes `TOOL-039-ACCEPTANCE.md`. |
| Deliverables | This report and `evidence-index/TOOL-039-EVIDENCE-INDEX.md` only. |
| Decision posture | Historic Tool-039-only baseline preserved; current-HEAD verification `NOT_VERIFIED`; post-baseline additions unresolved. No acceptance is transferred. |

## Scope sentinel — read before using any number in this report

1. **Tool 039 is an engineering benchmark, not a template.** No specialized Tool 039 feature — De Ritis Ratio, P-03 OCR, P-04 PDF/print summary, D-08 local-device History/Rating, or P-05 synthetic demo data — becomes mandatory for any other tool.
2. **Three-way split used throughout:**
   - **Accepted Baseline** = the historic Tool-039-only ledger/deployment/owner record as written. It is preserved, **not re-certified for HEAD `37f047a4`**.
   - **Post-Baseline Additions** = P-01 Gauge, P-02 Derived metrics, P-03 OCR, P-04 Export, P-05 synthetic demo data, and the D-08 local-device exception. These are outside the 95-row official denominator unless separately adopted and evidenced.
   - **Unresolved/Disputed** = provenance conflicts, absent current-HEAD E4, failing evidence test, hash mismatches, and textual/behavioral contradictions. These are reported, not silently repaired.
3. **Evidence ladder:** E0 none · E1 assertion · E2 file/static · E3 reproducible test · E4 authorized runtime/browser · E5 independent audit. Only E3+ counts in the historic completion formula; E2 stays E2.
4. **Status tokens used exactly as observed:** `PASS`, `FAIL`, `PARTIAL`, `BLOCKED`, `NOT_AVAILABLE`, `NOT_APPLICABLE` (justified exclusion), `NOT_RUN` (action not performed), `NOT_VERIFIED` (figure not proven), `PENDING`, `OWNER_ACCEPTED`.
5. **No current-HEAD browser/runtime E4 is claimed.** `NOT_RUN` is used for browser, SSO, deployment, build, and all execution actions performed or not performed by this audit.
6. **Historic `OWNER_ACCEPTED` belongs to Tool 039 only.** It is never re-awarded, transferred to another tool, or treated as current-HEAD closure.

---

## A. Identity and historical lineage

### A.1 Identity at the fixed baseline

| Item | Observed finding | Evidence level in this audit |
|---|---|---|
| Tool ID / slug | `mrx.tool.039-liver-enzyme-tracker` / `tool-039-liver-enzyme-tracker` | E2 — `lib/tools/registry.ts` |
| Version / page enum / access tier / order | `1.0.0` / `Page.LIVER_ENZYME_TRACKER` / `free` / `550` | E2 — registry |
| EN / AR title | `Liver Enzyme Tracker` / `متتبع إنزيمات الكبد` | E2 — registry + i18n |
| Stack status | `layered` | E2 — registry |
| Registry / catalog | `IN_REGISTRY` / `implemented` | E2 — `TOOL-SOURCE-SCAN.json` |
| Flat route | `app/smarttools/tool-039-liver-enzyme-tracker/page.tsx` is **absent**; no flat implementation page was found. | E2 — source scan |
| Live route | `app/smarttools/[category]/[tool]/page.tsx` validates category/slug and renders metadata, JSON-LD, `R6Progress`, `SafetyNotice`, then the tool. | E2 — dynamic route |
| Box ownership | `lib/tools/r6/manifest.ts` puts the slug in `R6_EXEMPT_SLUGS`; the generic `R6ToolShell` box layer is not used for Tool 039 result boxes. | E2 — manifest + shell |
| Primary file SHA-256 | `6CD1345372E9A754600EEB8B74C9D37D51BE75EB0E1CB4A2035D173F76496E4A` (`components/tools/tool-039-liver-enzyme-tracker.tsx`) | E2 — observed hash |
| Worktree status in source scan | `CLEAN`; last relevant commit `a67587bc` | E2 — pre-existing scan |

### A.2 Historic lineage and evidence sets

| Version / set | Historic artifact | What it proves as history | Why it is not current-HEAD proof |
|---|---|---|---|
| `VERSION-PUBLISHED-2026-11-11-A` / Evidence Set A | Preview `dpl_EKUNxn7zVDVYHVcxPkTQ85kCyD67`, 21-check browser log + 3 screenshots | Pre-fix published render | Superseded; pre-legibility/visibility fix |
| `VERSION-WORKTREE-2026-11-11-B` | Owner second review; added legibility row, evidence repairs, two tests | Worktree state, not deployed in that round | No deployment authorization in that round |
| `VERSION-PUBLISHED-2026-11-12-B` / Evidence Set B | Preview `dpl_JCfgB7Z9dTrVY3kboQCsEjUJL689`, 26/26 published browser run + 4 screenshots | Visibility/legibility/step-number fix on a published preview | Historic SHA/deployment; not `37f047a4` |
| Evidence Set C | `evidence/tool039-fix/` — 26-check local browser log + source SHA manifest | Local production-build verification after the fix | Local worktree, not a current-HEAD authorized browser run |
| Evidence Set D | `evidence/tool039-published-d08/` — `dpl_AimJXowNb5TCQQZNJR8MCcvE2dHc`, 43/43 browser log, two-profile proof, bundle proof, deployment metadata, screenshots | D-08 History/Rating E4 on a protected historic Preview | Source HEAD `5a87f3e5271db497a63833bb3cd1bb3df2078497`, `committed: false`, working tree; no pin to `37f047a4` |
| Historic ledger head | `5a87f3e5 (working-tree changes uncommitted)` | Denominator and owner-decision history | Different from audited HEAD; uncommitted source |
| Current audited HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` | Source files hashed by this audit | No authorized Preview/Deployment ID or browser run pinned to it |

### A.3 Three-way split

- **Accepted Baseline:** registry identity, canonical slug/route, tool-owned box exemption, and the Tool-039-only `OWNER_ACCEPTED` record as written in the 123-row ledger and change log. Preserved as history only.
- **Post-Baseline Additions:** P-01–P-05 static code and the D-08 local-device History/Rating exception. D-08 is a narrow, Tool-039-only historic exception; it is not W18 cloud/session/shared authorization.
- **Unresolved/Disputed:** current-HEAD deployment provenance, the empty acceptance artifact, the D-08 HTML-marker contradiction, the local-build two-browser proof, E1/reference-profile self-hash mismatches, and the absence of any preview pinned to `37f047a4`.

---

## B. Three percentage metrics

### B.1 Governing rule and label discipline

The generic R6.1 audit methodology defines `Verified Completion % = 100 × PASS(E3+) / Applicable`, defines no source-backed "Implementation Progress" formula, and treats "Runtime Verification %" as E4-gated and uncomputable without an authorized run. This report keeps that rule exact while presenting the three percentages requested for Tool 039 as **explicitly named forensic lenses**:

| Requested lens | Definition used in this report | Value | Provenance |
|---|---|---:|---|
| **Implementation Progress** | Historic ledger rows with `B=PASS` **and** `E≥E3`, divided by applicable rows. E0–E2 never counted; justified N/A rows excluded. | **95 / 95 = 100.00%** | Historic ledger-internal only; not re-certified at `37f047a4` |
| **Verified Completion** | Historic ledger rows with `B=PASS` **and** `E≥E4` (row-level E4+), divided by the same applicable denominator. | **12 / 95 = 12.63%** | Historic row-level E4 states only; no current-HEAD E4 |
| **Runtime Verification** | Current-HEAD authorized browser/runtime verification. | **`NOT_RUN` / no percentage** | No authorized SSO, no Preview pinned to `37f047a4`, no recorded Deployment ID for this audit |

**Do not interchange the labels with the generic 29-tool field names.** The E3+ figure is presented here under the requested "Implementation Progress" label; the E4+ figure is presented under the requested "Verified Completion" label. Both are historic Tool-039 ledger facts, not awards made by this audit.

### B.2 Ledger recomputation (read-only parse)

| Measure | Observed value |
|---|---:|
| Total rows | `123` |
| Applicable | `95` |
| `NOT_APPLICABLE` with proof | `28` |
| Column A | `SPEC_APPROVED:123` |
| Column B | `PASS:95`, `NOT_APPLICABLE:28` |
| Column C | `APPROVED:95`, `NOT_DECISIONED:28` |
| Column E, all rows | `E2:26`, `E3:85`, `E4:12` |
| Column E, applicable rows | `E3:83`, `E4:12` |
| Column E, N/A rows | `E2:26`, `E3:2` |
| Applicable PASS below E3 | `0` |
| Open B values | `[]` |
| Cell problems | `[]` |

Row-level E4 IDs (authoritative; the older prose "10 E4" is superseded):

1. `ACC-R6.1-3.a` — build/typecheck/tool test plus published-deployment runtime/build-log context.
2. `ACC-R6.1-3.d` — visual mobile/desktop browser screenshots.
3. `LAYER-GENIUS12-11` — local device-only history under D-08 Option A.
4. `LAYER-GENIUS12-12-RATING` — rating/comment bound to a saved result under D-08 Option A.
5. `ACC-5.5.4` — tooltip hover/focus/touch browser verification.
6. `ACC-5.5.6` — AR/RTL and EN/LTR browser verification.
7. `ACC-5.5.7` — mobile/desktop layout portion; legibility split separately.
8. `ACC-5.5.8` — keyboard/focus/Escape/close browser verification.
9. `ACC-5.5.9` — reduced-motion emulation plus tests.
10. `SPEC-15-A11Y` — accessibility/responsive UX browser and test evidence.
11. `ACC-5.5.7-LEGIBILITY` — Round 4 fix: 4.61 px FAIL → 12.00 px PASS.
12. `ACC-5.5.3-VISIBILITY` — Round 5 added illustration-visibility PASS row.

### B.3 Historic percentage chronology

| Round | Rows / applicable / complete | Historic E3+ figure | Reason the denominator moved |
|---|---:|---:|---|
| Round 1 | 121 / 92 / 90 | `90/92 = 97.83%` | Initial rebuilt ledger |
| Round 2 | 122 / 93 / 90 | `90/93 = 96.77%` | `ACC-5.5.7-LEGIBILITY` added as its own applicable FAIL row |
| Round 3 | 122 / 93 / 90 | `90/93 = 96.77%` | Text/mapping repair only; no count change |
| Round 4 | 122 / 93 / 91 | `91/93 = 97.85%` | Authorized legibility fix; FAIL → PASS |
| Round 5 | 123 / 94 / 92 | `92/94 = 97.87%` | `ACC-5.5.3-VISIBILITY` added and closed |
| Rounds 6–8 | 123 / 95 / 95 | `95/95 = 100.00%` | D-08 moved two blocked rows to PASS/E3; later E3→E4 and owner `C=APPROVED` did not change numerator/denominator |

### B.4 E2 proxy is not progress

The pre-existing source scan reports `20/20` static criteria and a `100` **Source Presence Proxy**. That field is E2-only and must never be reported as Implementation Progress, E3, or E4.

### B.5 Three-way split

- **Accepted Baseline:** `95/95 = 100.00%` E3+ ledger figure and `12/95 = 12.63%` row-level E4 figure, both preserved as historic ledger-internal facts.
- **Post-Baseline Additions:** P-01–P-05 contribute nothing to either denominator; D-08 rows entered the historic ledger in Round 6 but remain non-transferable to current HEAD.
- **Unresolved/Disputed:** stale "10 E4" narrative, all pre-Round-6 denominators, the E2-only 100 proxy, and the missing current-HEAD E4 artifact.

---

## C. Implementation inventory

### C.1 Observed file chain

| Path | Role | Static finding in this audit | Declared tests |
|---|---|---|---:|
| `lib/tools/engines/tool-039-liver-enzyme-tracker.ts` | Authoritative pure rules engine | Fixed ULN values, thresholds, two-point trend, bilirubin escalation, status ranking; no DB/network/I/O | 3 |
| `lib/tools/schemas/tool-039-liver-enzyme-tracker.ts` | Zod input/output contract | Finite/bounded values, ISO-parsable dates, result guard | — |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.ts` | `tryParse` → engine → result schema → `ToolOutput` envelope | Fail-safe `{ ok:false, error }` union; caller-injected options | 8 |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts` | Field/source/cross-tool/export contract | 90-day freshness, 120 ms debounce, four static sources, manual re-entry links; also contains unadopted P-01/P-02 helpers | 25 |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-visual.ts` | Pure visual data layer | Bars/gauge/table/tooltip payloads; no React/DOM | 8 |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-history.ts` / `…-history-store.ts` | D-08 local-device history and key store | Consent, TTL, delete/export, per-install Web Crypto key; no server persistence | 13 / 11 |
| `components/tools/tool-039-liver-enzyme-tracker.tsx` | Main UI/state machine/wiring | Field validation, 120 ms debounce, signature gating, local history, CSV Blob, OCR modal, print-summary button, sample-data control | 38 |
| `components/tools/tool-039-liver-enzyme-tracker.genius.tsx` | Tool-owned GENIUS-12 / CORE-5 | 12 boxes, source badges, explicit unavailable reasons | — |
| `components/tools/tool-039-liver-enzyme-tracker.visual.tsx` | Explanatory illustration/charts/tooltips | Phone stack, tooltips, accessible text equivalent | 22 |
| `components/tools/tool-039-liver-enzyme-tracker.history.tsx` | History/rating UI | Consent gate, saved-result list, rating/comment | 14 |
| `components/tools/tool-039-liver-enzyme-tracker.ocr.tsx` | P-03 static modal | Client-side text parser with simulated image/PDF fallback | — |
| `components/tools/tool-039-liver-enzyme-tracker.pdf.tsx` | P-04 static print summary | Print-ready consultation summary; not a verified Blob PDF delta | — |
| `i18n/tool-039-liver-enzyme-tracker.json` | EN/AR strings + capability contract | Explicit no-AI / no-diagnosis / no-prediction / no-report-reading wording | — |
| `lib/tools/registry.ts`, `lib/tools/r6/manifest.ts` | Identity, route, box ownership | 039 exempt from generic shell boxes | — |
| `app/smarttools/[category]/[tool]/page.tsx` | Dynamic route shell | Metadata, JSON-LD, progress, safety notice | — |

All rows above are **E2 static observations** in this audit. Declared test counts are not executed counts.

### C.2 Selected observed hashes

| File | Observed SHA-256 |
|---|---|
| `components/tools/tool-039-liver-enzyme-tracker.tsx` | `6CD1345372E9A754600EEB8B74C9D37D51BE75EB0E1CB4A2035D173F76496E4A` |
| `lib/tools/engines/tool-039-liver-enzyme-tracker.ts` | `3825C696826857AD723F67F5F1D2520DAB0A484512829F9E93203AAC417A448A` |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.ts` | `B5EC7073FC6585578051A4DC79ED87E63F986F90B68F33BB1B8E49A09C3E78BA` |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts` | `F105761ACEB440DFF21F4798D3E4B458E0282BF99B2C5AAD38A3C8FD890C457C` |
| `i18n/tool-039-liver-enzyme-tracker.json` | `B06DC78364BFA40BFCC97D3BF24309CDB98AAF117253D26D97E4873D13D63BF1` |
| `docs/MRX Genius Cloud Unified R6.1/tool-039-requirements.csv` | `CB47C6A2B91E6F4BB3C2DD514B69F95D3BD469A1842F3C125891B1281C6F98B6` |

The evidence index records the complete hash register.

### C.3 Three-way split

- **Accepted Baseline:** layered route → UI validation → schema → debounce → pure pipeline → pure engine → result schema/envelope → tool-owned boxes; deterministic math and five-state model are source-present.
- **Post-Baseline Additions:** P-01 ACG classifier/gauge markup, P-02 De Ritis helpers/tests/card, P-03 OCR modal, P-04 print summary, P-05 sample-data button, and D-08 local-device history/rating code.
- **Unresolved/Disputed:** equation correctness is not re-derived by a fresh run in this audit; P-03/P-04 runtime behavior is unproven; the P-05 control is not adopted; the current-HEAD component was not exercised in a browser.

---

## D. Original R6.1 compliance matrix

### D.1 Source and method

The pre-existing `SMARTTOOLS-R6.1-COMPLIANCE-MATRIX.csv` and `generate-audit-reports.mjs` define a **31-row Tool 039 view**: 20 equal-weight static source criteria, 6 browser/runtime rows, 4 shared-gate rows, and 1 P-03 row. Every row is E2 at most here (E0 for non-run/gated rows). The static source criteria are the same 20 listed in `SOURCE-SCAN-STATS.md`; Tool 039 scores `20/20` on **source presence only**.

### D.2 Static source criteria

| # | Criterion | Tool 039 | Level |
|---:|---|---|---|
| 1 | `ROUTE_FILE` | `PARTIAL` — dynamic route present | E2 |
| 2 | `COMPONENT_FILE` | `PARTIAL` — main component present | E2 |
| 3 | `ENGINE_FILE` | `PARTIAL` — engine present | E2 |
| 4 | `SCHEMA_FILE` | `PARTIAL` — schema present | E2 |
| 5 | `PIPELINE_FILE` | `PARTIAL` — pipeline present | E2 |
| 6 | `I18N_FILE` | `PARTIAL` — i18n present | E2 |
| 7 | `GENIUS_MARKER` | `PARTIAL` — markers present | E2 |
| 8 | `FIVE_STATES` | `PARTIAL` — all five state tokens present | E2 |
| 9 | `CORE5_COMPACT` | `PARTIAL` — `[2,3,7,9,12]` selector present | E2 |
| 10 | `PIPELINE_ENVELOPE` | `PARTIAL` — envelope/safeParse markers present | E2 |
| 11 | `INPUT_VALIDATION` | `PARTIAL` — validation markers present | E2 |
| 12 | `DYNAMIC_RECALC` | `PARTIAL` — recalculation markers present | E2 |
| 13 | `WHAT_IF` | `PARTIAL` — conditional what-if present | E2 |
| 14 | `EXPLAINABILITY` | `PARTIAL` — explanation markers present | E2 |
| 15 | `SAFETY_MARKER` | `PARTIAL` — warnings/limits markers present | E2 |
| 16 | `EN_AR_I18N_USAGE` | `PARTIAL` — EN/AR usage present | E2 |
| 17 | `RTL_MARKER` | `PARTIAL` — RTL marker present | E2 |
| 18 | `ACCESSIBILITY` | `PARTIAL` — accessibility markers present | E2 |
| 19 | `TEST_FILE` | `PARTIAL` — test file present | E2 |
| 20 | `CAPABILITY_CONTRACT` | `PARTIAL` — capability markers present | E2 |

### D.3 Browser and gate rows

| Row | Status | Level | Boundary |
|---|---|---|---|
| `PREVIEW-ROUTE` | `NOT_RUN` | E0 | Requires SSO + pinned Preview + Deployment ID |
| `BROWSER-EN-AR` | `NOT_RUN` | E0 | Same |
| `BROWSER-5-STATES` | `NOT_RUN` | E0 | Same |
| `RTL-390` | `NOT_RUN` | E0 | Same |
| `CONSOLE-HYDRATION` | `NOT_RUN` | E0 | Same |
| `NO-DUP-GENIUS` | `NOT_RUN` | E0 | Same |
| `C4-SOURCES` | `NOT_AVAILABLE` | E0 | Owner/specialist source pack not approved |
| `C5-REFERRAL` | `NOT_AVAILABLE` | E0 | Qualified referral wording not approved |
| `CLINICAL-REVIEW` | `BLOCKED` | E0 | No qualified clinical/model sign-off |
| `W18-HISTORY` | `NOT_AVAILABLE` | E0 | No W18 cloud/session/shared persistence; D-08 local-device exception is separate |
| `P03-PIPELINE` | `PARTIAL` | E0 | Structural gate only; runtime-negative suite untracked/`NOT_RUN` |

### D.4 Three-way split

- **Accepted Baseline:** the 20 static checks are genuinely present at E2 and the ledger's 28 N/A rows have recorded reasons; neither fact upgrades to E3/E4.
- **Post-Baseline Additions:** P-03 OCR and P-04 export static files add source markers but not approved requirement rows; D-08 does not open W18.
- **Unresolved/Disputed:** all 6 browser rows remain `NOT_RUN`, the 4 shared gates remain unavailable/blocked, and P-03 runtime effectiveness remains approval-gated.

---

## E. 23 shared benchmarks

Source: `evidence-index/generate-audit-reports.mjs` defines the 23 benchmark names and the `T039_BENCH` statuses; the generated `SMARTTOOLS-TOOL039-COMPARISON.csv` contains 23 matching Tool 039 rows. No similarity score is computed.

| # | Shared benchmark | Tool 039 status | Specialized 039 feature transferred? |
|---:|---|---|---|
| 1 | Component architecture | `FULL` — layered chain; E2 static; historic E1 | NO |
| 2 | Engine/UI separation | `FULL` — pure engine separated from UI; E2 static | NO |
| 3 | Input validation | `FULL` — field validation + Zod; E2 static | NO |
| 4 | Schema validation | `FULL` — input/result schemas; E2 static | NO |
| 5 | Pipeline integrity | `FULL structural` — `tryParse` → engine → result schema → envelope; current-HEAD E4 `NOT_RUN` | NO |
| 6 | Equation correctness | `FULL declared` — fixed ULN/thresholds; E2 static; historic E1 | NO |
| 7 | Result states (5) | `FULL declared` — `EMPTY`/`PARTIAL`/`INVALID`/`FULL`/`DEGRADED`; E2 static | NO |
| 8 | GENIUS-12 | `FULL` — 12 tool-owned boxes with source badges; E2 static | NO |
| 9 | CORE-5 | `FULL declared` — compact boxes `2,3,7,9,12`; doc/code label discrepancy preserved; E2 | NO |
| 10 | Dynamic results | `FULL declared` — 120 ms debounce + `inputSignature`; E2 static | NO |
| 11 | What-If (conditional) | `APPLICABLE` — arithmetic scenarios, not predictions; E2 | NO |
| 12 | Explainability | `PARTIAL` — confidence `null`, no calibrated interval; E2 | NO |
| 13 | Capability contract | `FULL` — seven-part no-AI/no-diagnosis contract; E2 | NO |
| 14 | Warnings and limits | `FULL` — explicit no-diagnosis/no-prescription wording; E2 | NO |
| 15 | EN/AR | `FULL declared` — EN/AR resources; current-HEAD browser `NOT_RUN` | NO |
| 16 | RTL/LTR | `FULL declared` — direction from display preferences; historic screenshots only | NO |
| 17 | Responsive UI | `NOT_RUN` current-HEAD — historic 390/1440 screenshots only | NO |
| 18 | Accessibility | `NOT_VERIFIED` — no current-HEAD a11y test in scope | NO |
| 19 | Security/Privacy | `FULL static` — no network/DB/AI provider in engine or pipeline; E2 | NO |
| 20 | Unit/Integration/Contract tests | `PARTIAL` — suites declared; historic E1 baseline only; this audit ran none | NO |
| 21 | Browser/Runtime verification | `NOT_RUN` current-HEAD — historic deployment evidence non-transferable | NO |
| 22 | Documentation/Sources | `NOT_AVAILABLE` — D-C4 source pack unapproved; four static E2 references | NO |
| 23 | Rollback/Reproducibility | `NOT_VERIFIED` — no rollback drill; D-08 local-device only; no cloud/session sync | NO |

### Three-way split

- **Accepted Baseline:** benchmarks 1–16 and 19 are preserved as Tool-039 engineering strengths at E2/historic-E1 depth, with their stated limits.
- **Post-Baseline Additions:** the benchmark list itself does not adopt De Ritis, OCR, PDF, D-08, or P-05 for any other tool; those remain Tool-039-local/excluded.
- **Unresolved/Disputed:** benchmarks 17, 18, 20–23 remain `NOT_RUN`, `NOT_VERIFIED`, or `NOT_AVAILABLE`; benchmark 12 remains `PARTIAL`.

---

## F. R6.1 seven layers

Authority: `AUDIT-METHODOLOGY.md` §8 / `SPEC.md` §§177–187. These seven Super Intelligence layers are distinct from the 12 internal services in `SPEC.md` §§189–199.

| # | Layer | Tool 039 applicability | Observed state | Boundary |
|---:|---|---|---|---|
| 1 | Math Layer | `YES` | Deterministic ULN multiples, fixed thresholds, two-point trend, bilirubin escalation; pure engine | E2 static + historic E3; no fresh equation re-derivation here |
| 2 | Dynamic Layer | `YES` | Five states, 120 ms debounce, signature gating, 90-day stale flag, no empty→zero coercion | E2 static; current-HEAD browser `NOT_RUN` |
| 3 | Cross-Tool Layer | `APPLICABLE` / partial | Contracts to Tools 024, 007, 041 with mapped fields, units, 90-day freshness, `staleAction`, `manual-reentry` | No payload transfer, session handoff, or cloud sync; W18 closed |
| 4 | Adaptive Layer | `CONDITIONAL` / partial | EN/AR, direction, unit pass-through; no consent-based personalization model | No proof of adaptive state beyond locale/format; browser `NOT_RUN` |
| 5 | Explainable Layer | `YES` / partial | Steps, source badges, inputs, assumptions, unavailability reasons; confidence `null` | Internal engineering explanation only; no calibrated interval or AI explanation |
| 6 | ML/Prediction Layer | `NOT_APPLICABLE` | No provider, prompt, RAG, model, embedding, or prediction path | Capability contract explicitly denies prediction and AI |
| 7 | Community Layer | `NOT_APPLICABLE` / not verified | Local rating/comment exists under D-08 only | No opt-in aggregate insights, cohort minimum, anti-reidentification, or real community data |

### Three-way split

- **Accepted Baseline:** Layers 1, 2, 3 and 5 are the engineering core; Layer 6 is intentionally non-applicable by capability contract.
- **Post-Baseline Additions:** D-08 local rating is not a Community Layer implementation; P-01/P-02 do not create ML or prediction behavior.
- **Unresolved/Disputed:** Layer 4 lacks full adaptive proof; Layer 7 lacks authorization; no layer has current-HEAD runtime E4 from this audit.

---

## G. GENIUS-12 / CORE-5

### G.1 Fixed box order

| Box | Name | Core box? | Observed source/status |
|---:|---|---|---|
| 1 | KPI summary | No | Engine/static source badge or explicit unavailable reason |
| 2 | Primary Result | **C1** | Engine result + unit/threshold context |
| 3 | How Calculated | **C2** | Formula, actual inputs, assumptions, uncalibrated-confidence statement |
| 4 | Inputs | No | Entered readings and validation context |
| 5 | What-If | No | Arithmetic scenario, not prediction |
| 6 | Sensitivity / trend | No | Derived from the same deterministic pipeline |
| 7 | Warnings / Safety | **C3** | Red flags, limits, educational disclaimers |
| 8 | Cross-tool | No | Manual-reentry mappings to Tools 024/007/041 |
| 9 | Evidence / Sources | **C4** | Four static E2 references; approved source pack still `NOT_AVAILABLE` |
| 10 | Export | No | Baseline CSV Blob; P-04 print component is separate/unadopted |
| 11 | History | No | D-08 local-device only; not W18/cloud/session |
| 12 | Feedback / Rating + Next Actions | **C5** | Local rating under D-08; next action and "what not to do" text |

### G.2 Compact selector discrepancy

The source header says compact CORE-5 reuses "C1, C2, C3, C4, C5", but the observed selector is `boxes[1], boxes[2], boxes[6], boxes[8], boxes[11]`, i.e. 1-based GENIUS boxes **`2, 3, 7, 9, 12`**. This matches the closure-layer CORE-5 mapping but not the header's C1–C5 wording. The discrepancy is preserved, not silently fixed.

### G.3 Three-way split

- **Accepted Baseline:** 12 boxes render in fixed order, are tool-owned, carry source badges, and show honest unavailable reasons; generic duplicate shell boxes are exempted.
- **Post-Baseline Additions:** box 10's P-04 print summary and box 12's D-08 local rating are separate additions; neither transfers to other tools.
- **Unresolved/Disputed:** no current-HEAD DOM/runtime proof of order, compact/full parity, no-duplicate rendering, EN/AR, or keyboard behavior; historic browser evidence is non-transferable.

---

## H. P0–P9 phases and proposal numbering

### H.1 Taxonomy separation

Three different `P` schemes exist and must not be merged:

1. **Governing R6.1 priorities** — only `P0` (blocker before AI/launch), `P1` (before Pilot), `P2` (before scale). No governing R6.1 document defines P3–P9 priorities.
2. **Source-presence stage heuristic P0–P9** — emitted by `scan-tools.mjs`; these are static E2 observations, not evidence levels, completion percentages, or owner decisions.
3. **Tool-specific P-01…P-10 proposals** — `TOOL-039-DEVELOPMENT-PROPOSALS.md`; proposals, not execution tasks. Separately, E1/governing plan uses P-01…P-05 to name post-baseline assignment deltas. These two P-numberings are distinct.

### H.2 Tool 039 phase matrix row

| Column | Value |
|---|---|
| Current Development Stage | `P7` |
| Last Fully Verified Stage | `NOT_VERIFIED` |
| `P0` | `NOT_STARTED` |
| `P1` | `COMPLETED` |
| `P2` | `SOURCE_PRESENT_UNVERIFIED` |
| `P3` | `SOURCE_PRESENT_UNVERIFIED` |
| `P4` | `SOURCE_PRESENT_UNVERIFIED` |
| `P5` | `SOURCE_PRESENT_UNVERIFIED` |
| `P6` | `SOURCE_PRESENT_UNVERIFIED` |
| `P7` | `TEST_FILE_PRESENT_UNVERIFIED` |
| `P8` | `NOT_RUN_SSO_REQUIRED` |
| `P9` | `NOT_STARTED` |
| Evidence basis | `component=true; engine=true; schema=true; pipeline=true; staticRoute=false; dynamicRoute=true; i18n=true; tests=9` |

The generator script also prints development-style labels (`P0 Discovery & Scope COMPLETED`, `P1 Architecture & Contracts SOURCE_PRESENT_UNVERIFIED`, etc.). Those are presentation labels; the phase-matrix row above is the authority for the P0–P9 status quoted here.

### H.3 Three-way split

- **Accepted Baseline:** P1 source presence is real; P7 test files really exist; P8/P9 lack required authorization/decision.
- **Post-Baseline Additions:** P-01…P-05 assignment deltas and P-01…P-10 tool proposals are outside P0–P9 stage status.
- **Unresolved/Disputed:** every "source present" stage is unverified by execution in this audit; "Last Fully Verified Stage" remains `NOT_VERIFIED`.

---

## I. Tests and evidence

### I.1 Execution boundary

**No test, build, typecheck, lint, browser session, SSO flow, deployment, or calculator was run by this audit.** All execution results below are pre-existing artifacts observed read-only.

### I.2 Declared Tool-039 test inventory

| Test file | Declared cases | Pre-existing full-run attribution |
|---|---:|---|
| `lib/tools/engines/tool-039-liver-enzyme-tracker.test.ts` | 3 | PASS / E3 |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts` | 8 | PASS / E3 |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.test.ts` | 25 | PASS / E3 |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-visual.test.ts` | 8 | PASS / E3 |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-history.test.ts` | 13 | PASS / E3 |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-history-store.test.ts` | 11 | PASS / E3 |
| `components/tools/tool-039-liver-enzyme-tracker.test.tsx` | 38 | PASS / E3 |
| `components/tools/tool-039-liver-enzyme-tracker.visual.test.tsx` | 22 | PASS / E3 |
| `components/tools/tool-039-liver-enzyme-tracker.history.test.tsx` | 14 | PASS / E3 |
| `tests/unit/tool-039-acceptance-evidence.test.ts` | 7 | **FAIL / E2** — 3 failed assertions |
| Shared matches also attributed to 039 | — | `tool-036-040-batch.test.ts`, `p03-gate-structural.test.ts`, `legacyRoutes.test.ts` = PASS/E3 for execution, not tool-specific acceptance proof |

A naive regex over `tool-039-liver-enzyme-tracker.visual.test.tsx` returns 23 matches because it also matches one `.test(...)` regular-expression call; the actual declaration count is **22**.

### I.3 Pre-existing full Vitest log

| Measure | Recorded value |
|---|---:|
| Command | `node "E:/p03-true-clean-20261118/node_modules/vitest/vitest.mjs" run --root E:/p03-true-clean-20261118` |
| Environment | true-clean detached worktree @ `37f047a4`, Vitest `4.1.10` |
| Exit code | `1` |
| Test files | `30 failed | 563 passed | 1 skipped (594)` |
| Tests | `67 failed | 5530 passed | 5 skipped (5602)` |
| Duration | `372.21s` |
| Tool-039 acceptance-evidence suite | `7 tests | 3 failed` |

The 3 failures are preserved as unresolved/disputed; they are not erased by the historic `OWNER_ACCEPTED` decision and are not re-run here.

### I.4 Historic browser artifacts

| Artifact | Recorded result | Current use |
|---|---|---|
| Evidence Set A `dpl_EKUNxn7zVDVYHVcxPkTQ85kCyD67` | 21 checks + 3 screenshots | Superseded history |
| Evidence Set B `dpl_JCfgB7Z9dTrVY3kboQCsEjUJL689` | 26/26 published checks + 4 screenshots | History only |
| `evidence/tool039-fix/` | 26 checks, local production build | History only |
| `evidence/tool039-published-d08/` | 43/43 PASS, date `2026-11-13T01:18:15.274Z`, `baseUrl: http://127.0.0.1:3202` | History only; not current-HEAD E4 |
| `evidence/tool-039/legibility-390.json` | 5/5 phone steps visible; smallest visible text `12.00px`; viewport `390×844` | History only; 12px is an internal criterion, not an R6.1 rule |
| `TOOL-039-ACCEPTANCE.md` | 0 bytes, empty-file SHA `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855` | Display/provenance gap |

### I.5 Three-way split

- **Accepted Baseline:** pre-existing E3 test-file attributions and historic browser logs are real artifacts and are preserved as written.
- **Post-Baseline Additions:** P-01/P-02 declarations and P-03/P-04 static components have no executed acceptance proof in this audit.
- **Unresolved/Disputed:** the 3 acceptance-evidence failures, the empty acceptance artifact, and the lack of any current-HEAD SSO/pinned-preview run.

---

## J. Defect, dispute and risk register

| ID | Severity | Class | Actual finding | Expected / required | Evidence | Impact |
|---|---|---|---|---|---|---|
| `D-039-01` | CRITICAL | Evidence gap | No current-HEAD E4 browser evidence | Authorized SSO + Preview pinned to `37f047a4` + Deployment ID | Browser index; shared gates | Blocks runtime verification and 100% claim |
| `D-039-02` | HIGH | Provenance dispute | Historic deployments and ledger tied to `5a87f3e5`, uncommitted | Same source SHA as audited HEAD | Deployment metadata, ledger head | Historic E4 cannot be transferred |
| `D-039-03` | HIGH | Artifact defect | `TOOL-039-ACCEPTANCE.md` is 0 bytes | Generated display/provenance artifact | Empty-file SHA | Acceptance narrative absent at that path |
| `D-039-04` | HIGH | Test defect | `tool-039-acceptance-evidence.test.ts` has 3 failed assertions | Zero unresolved failures | Full Vitest log; test matrix | Historic acceptance evidence disputed |
| `D-039-05` | MEDIUM | Unverified addition | P-01 ACG gauge static code/test declarations only | Re-verification + closure if owner adopts | Contract + visual helper | Not in official denominator |
| `D-039-06` | MEDIUM | Unverified addition | P-02 De Ritis helpers/tests/card only | Re-verification + closure if owner adopts | Contract + UI + tests | Not in official denominator |
| `D-039-07` | HIGH | Capability conflict | P-03 OCR modal wired, but i18n contract denies lab-report/image reader and no real OCR runtime exists | Resolve text vs behavior; real runtime proof or withdrawal | OCR component + i18n | Unresolved textual/behavioral tension |
| `D-039-08` | MEDIUM | Unverified addition | P-04 print summary exists; no real PDF/Blob delta proven | Owner adoption + runtime proof | PDF component + UI wiring | Baseline CSV export remains the proven path |
| `D-039-09` | MEDIUM | Owner gate | P-05 sample-data button exists but is unadopted | Explicit owner adoption | Main UI + E1 | Must stay `PENDING/OWNER-GATED/NOT ADOPTED` |
| `D-039-10` | MEDIUM | Documentation defect | CORE-5 header says C1–C5; selector uses boxes `2,3,7,9,12` | Consistent labels | GENIUS component + crosswalk | Copying compact behavior requires clarification |
| `D-039-11` | MEDIUM | Provenance dispute | HTML marker comparison counts consent strings `0` on both pre/post-D-08 deployments despite metadata calling them discriminators | Discriminating server-side markers or corrected claim | `published-html-marker-comparison.json` | Weakens server-HTML proof; bundle proof still exists |
| `D-039-12` | MEDIUM | Provenance dispute | Bundle proof finds D-08 markers in `page-f52f77e146012c11.js` (`2,559,445` bytes) | Consistent interpretation with HTML comparison | `published-bundle-d08-proof.json` | Bundle presence proven; server-HTML discriminator claim not |
| `D-039-13` | MEDIUM | Provenance dispute | Two-browser proof says `build: "WORKTREE (local production build)"`, `baseUrl: http://127.0.0.1:3202`, while change log describes published deployment | Match environment to claim | `two-browsers.json` vs change log | Isolation result is local-build history only |
| `D-039-14` | MEDIUM | Security finding | Shared `SecureStorage` writes plaintext because `VITE_ENCRYPTION_KEY` is not `NEXT_PUBLIC_*`; Tool 039 uses per-install Web Crypto + AES | No absolute security claim | Round-6 change log | Tool-specific mitigation documented; shared helper remains unsafe as configured |
| `D-039-15` | LOW | Hash discipline | E1 embedded hash `f81bb7a5…` differs from observed `B54DB867…`; reference profile embeds pre-amendment hash `C7FEBA80…` vs observed `16DEE852…` | Observed on-disk hash authoritative | E1 + reference profile + shared gates | No original edited; observed values win |
| `D-039-16` | LOW | Historic criterion | 4.61px legibility FAIL at 390×844; later 12.00px PASS | Internal 12px criterion, not R6.1 rule | Legibility JSON + Round 4 log | Preserved as history; no current-HEAD re-measurement |
| `D-039-17` | LOW | Derived-artifact gap | Generator references 23-benchmark and compliance CSVs; they were absent at first audit check and later generated by a separate script | Cite generator definitions as source | `generate-audit-reports.mjs` | No status invented; script definitions used here |

### Three-way split

- **Accepted Baseline:** findings `D-039-14`–`D-039-16` are documented historical facts/limitations, not new failures created by this audit.
- **Post-Baseline Additions:** `D-039-05`–`D-039-09` are unresolved post-baseline additions or owner gates.
- **Unresolved/Disputed:** `D-039-01`–`D-039-04`, `D-039-10`–`D-039-13`, `D-039-17` remain open evidence/provenance issues.

---

## K. Remaining work

| Area | Remaining work | Authority required | Three-way class |
|---|---|---|---|
| Current-HEAD runtime | Obtain authorized SSO, a Preview pinned to `37f047a4`, and a recorded Deployment ID; then run the six browser rows | Owner/Vercel SSO + release authority | Unresolved/Disputed |
| Test evidence | Re-run the Tool-039 focused suites and the 3 failing acceptance-evidence assertions at the fixed SHA; archive results | QA in authorized environment | Unresolved/Disputed |
| Acceptance artifact | Regenerate `TOOL-039-ACCEPTANCE.md` only through the owner-authorized calculator path; this audit did not run it | Owner/calculator authority | Unresolved/Disputed |
| P-01 Gauge | Re-verify ACG classifier/gauge and obtain a closure decision if it is to be adopted | Owner + engineering | Post-Baseline Addition |
| P-02 Derived metrics | Re-verify De Ritis helpers/card and obtain closure decision | Owner + engineering | Post-Baseline Addition |
| P-03 OCR | Resolve capability-contract wording and produce real image/PDF runtime evidence, or withdraw the static claim | Owner + clinical/safety review + runtime evidence | Post-Baseline Addition |
| P-04 Export | Prove real PDF/Blob delta or keep only the baseline CSV export as accepted | Owner + runtime evidence | Post-Baseline Addition |
| P-05 demo data | Keep `PENDING / OWNER-GATED / NOT ADOPTED` until explicit adoption | Owner only | Post-Baseline Addition |
| CORE-5 labels | Reconcile header C1–C5 wording with selector boxes `2,3,7,9,12` | Engineering, scoped change | Unresolved/Disputed |
| D-08 security | Preserve the Tool-039 per-install Web Crypto mitigation; do not reuse shared `SecureStorage` as-is; no W18 expansion | Architecture/security owner | Accepted Baseline constraint / no-transfer |
| Sources and clinical wording | Keep `C4-SOURCES`/`C5-REFERRAL` `NOT_AVAILABLE` and `CLINICAL-REVIEW` `BLOCKED` until qualified approval | Owner + qualified specialist | Unresolved/Disputed |
| Cross-tool transfer | Keep manual re-entry; no payload, session, DB, RLS, or cloud sync | Owner/W18 authority | Accepted Baseline boundary |

**100% rule:** no worktree/Git/Preview mismatch may remain; every applicable atomic row must be PASS at E3+ with N/A justified; browser/runtime/safety rows must be satisfied for the same pinned SHA and Deployment ID. This audit satisfies none of those current-HEAD conditions.

---

## L. Final decision

**Decision: `PRESERVE — ENGINEERING REFERENCE ONLY; CURRENT HEAD NOT_VERIFIED`.** The pre-existing generator's decision label is recorded for provenance as `OWNER_ACCEPTED — CLOSED (historic baseline only; post-baseline additions unresolved)`; this audit does not make a new owner acceptance.

- **Historic Tool-039 baseline:** the recorded `OWNER_ACCEPTED — CLOSED` decision and `95/95 = 100.00%` E3+ ledger figure are **preserved verbatim as Tool-039-only history**. This audit does not re-award, enlarge, or transfer them.
- **Post-baseline additions:** P-01–P-05 remain unclosed/unadopted as stated; D-08 remains a narrow local-device exception, not W18/cloud/session/shared authorization.
- **Current HEAD `37f047a4`:** `Runtime Verification = NOT_RUN`; `Verified Completion (E4+ lens) = 12/95 = 12.63%` historic only; no current-HEAD E4 and no owner acceptance are claimed.
- **Not claimed:** `100% VERIFIED — OWNER REVIEW PENDING`, clean-clone E4, deployment readiness, clinical/source approval, or any other tool's acceptance.
- **No transfer:** no Tool 039 `OWNER_ACCEPTED` status and no D-08 local-device history/rating authorization may be used to justify another tool's history, rating, storage, session, or cloud-sync claim.

---

## M. Delivery information

| Field | Value |
|---|---|
| Report path | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/individual-tools/TOOL-039-R6.1-FORENSIC-AUDIT.md` |
| Evidence index path | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/TOOL-039-EVIDENCE-INDEX.md` |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` |
| Verification date | 2026-11-20 |
| Preview URL | `NOT_VERIFIED` for current HEAD |
| Deployment ID | `NOT_VERIFIED` for current HEAD |
| Source SHA of primary component | `6CD1345372E9A754600EEB8B74C9D37D51BE75EB0E1CB4A2035D173F76496E4A` |
| Evidence package | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/` |
| Write scope | Only the two deliverables listed above. The earlier generic generator output at the report path was superseded by this independent forensic audit; no other generated CSV, script, source file, prior report, ledger, or git state was modified. |
| Non-execution statement | No build, test, lint, typecheck, calculator, browser, SSO, deploy, or runtime action was performed for this report. |
| Self-hash discipline | The observed SHA-256 of this file is recorded in the evidence index after write; no embedded self-hash is used. |

**End of report.**
